// '왜 기독교인가' 영상 만들기: 장면별 녹음(tts.mjs --scenes) 길이로 장면 시각표를 짜고, why-video.html 무대를 한 장씩 찍어 ffmpeg로 묶는다.
// 쓰는 법: node _src/video/render.mjs [녹음 폴더] [출력.mp4] [--tempo 1.1] [--fps 30] [--from 초 --to 초(미리보기)]   — 저장소 맨 위를 http://localhost:8765 로 띄워 둔다
// 소리: 낭독(24kHz)을 한 줄로 이어 붙이고, 배경음악 assets/music/why.mp3(약 3분)를 되풀이해 낮게 깐다(낭독 중엔 더 낮게)
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { spawn, execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const argv = process.argv.slice(2), opt = (n, d) => { const i = argv.indexOf('--' + n); if (i < 0) return d; const v = argv[i + 1]; argv.splice(i, 2); return v; };
const FPS = +opt('fps', 30), FROM = +opt('from', 0), TO = opt('to', null), TEMPO = +opt('tempo', 1); // tempo: 낭독 빠르기(1.1이면 10% 빠르게, 음높이는 그대로) — 문장 사이 쉼도 같이 줄인다
const [VDIR = '/tmp/why-video/voice', OUT = 'why-video.mp4'] = argv;
const sc = JSON.parse(await readFile('_src/video/why-script.json', 'utf8')), VOICE = sc.voice, SR = 24000;
const keyOf = t => createHash('sha1').update(VOICE + '|' + t).digest('hex').slice(0, 12);
// 시각표: 장면(단락)마다 한 번에 녹음한 소리를 그대로 쓴다 — 쉼과 억양은 성우가 단락 안에서 정한다
// (문장을 따로 녹음해 같은 간격으로 붙였더니 부자연스러웠다, 2026-11). 장면 앞 1.0초, 끝 1.2초, 큰 단락 앞은 pause만큼 더
const LEAD = 1.0 / TEMPO, TAIL = 1.2 / TEMPO;
const load = f => TEMPO === 1 ? readFile(f).then(b => b.subarray(44))
  : execFileSync('ffmpeg', ['-v', 'error', '-i', f, '-af', `atempo=${TEMPO}`, '-f', 's16le', '-ac', '1', '-ar', String(SR), '-'], { maxBuffer: 1 << 28 });
// 자막 시각: 녹음 속 쉼(0.18초 이상 조용한 곳)을 찾아, 글자 수로 어림한 문장 경계에 가장 가까운 쉼을 차례로 고른다
function pauses(pcm) {
  const s = new Int16Array(pcm.buffer, pcm.byteOffset, pcm.length >> 1), W = SR / 100, out = []; let q = -1;
  for (let k = 0; k * W < s.length; k++) { let e = 0; for (let x = k * W; x < Math.min(s.length, (k + 1) * W); x++) e = Math.max(e, Math.abs(s[x]));
    if (e < 500) { if (q < 0) q = k; } else { if (q >= 0 && k - q >= 18) out.push({ a: q / 100, b: k / 100 }); q = -1; } }
  return out;
}
function cuts(pcm, lines) {
  const dur = pcm.length / 2 / SR, len = lines.map(l => l.replace(/\s/g, '').length), all = len.reduce((x, y) => x + y, 0), ps = pauses(pcm), at = [0];
  let acc = 0, from = 0;
  for (let k = 0; k < lines.length - 1; k++) {
    acc += len[k]; const want = dur * acc / all;
    let best = -1; for (let m = from; m < ps.length; m++) if (best < 0 || Math.abs((ps[m].a + ps[m].b) / 2 - want) < Math.abs((ps[best].a + ps[best].b) / 2 - want)) best = m;
    if (best >= 0 && Math.abs((ps[best].a + ps[best].b) / 2 - want) < dur * 0.2) { at.push(ps[best].b - 0.05); from = best + 1; } else at.push(want);
  }
  return at;
}
let t = 1.5; const tl = { scenes: [], breaks: sc.breaks || {} }, clips = [];
for (const s of sc.scenes) {
  t += s.pause || 0; // 큰 단락 앞의 쉼: 앞 장면이 다 사라진 뒤 조금 비운다
  const S = { ...s, start: t, lines: [] }; t += s.title ? 1.5 : LEAD;
  if (s.say.length) {
    // 자막은 문장 하나씩 (녹음 한 줄에 문장이 여럿이면 나눠 보여 준다 — 녹음 열쇠는 그대로 say)
    const subs = s.say.flatMap(x => x.split(/(?<=[.?!])\s+/));
    const pcm = await load(`${VDIR}/${keyOf(s.say.join('\n'))}.wav`), dur = pcm.length / 2 / SR, at = cuts(pcm, subs);
    clips.push({ at: t, pcm });
    subs.forEach((text, k) => S.lines.push({ text, start: t + at[k], next: t + (at[k + 1] ?? dur + 0.6) }));
    t += dur;
  }
  t += s.end ? 9 : TAIL; S.stop = t; tl.scenes.push(S);
}
const TOTAL = t; console.log('길이', (TOTAL / 60).toFixed(2), '분,', tl.scenes.length, '장면');
if (argv.includes('--list')) { tl.scenes.forEach(s => console.log(s.start.toFixed(1), s.stop.toFixed(1), s.head || (s.title ? '제목' : '끝'))); process.exit(0); } // 장면 시각표만 보기
// 낭독 한 줄
const voice = new Int16Array(Math.ceil(TOTAL * SR));
for (const c of clips) { const s = new Int16Array(c.pcm.buffer, c.pcm.byteOffset, c.pcm.length >> 1); voice.set(s.subarray(0, Math.max(0, voice.length - Math.round(c.at * SR))), Math.round(c.at * SR)); }
const TMP = '/tmp/why-video'; await mkdir(TMP, { recursive: true });
const wavHead = n => { const w = Buffer.alloc(44); w.write('RIFF', 0); w.writeUInt32LE(36 + n, 4); w.write('WAVEfmt ', 8); w.writeUInt32LE(16, 16); w.writeUInt16LE(1, 20); w.writeUInt16LE(1, 22); w.writeUInt32LE(SR, 24); w.writeUInt32LE(SR * 2, 28); w.writeUInt16LE(2, 32); w.writeUInt16LE(16, 34); w.write('data', 36); w.writeUInt32LE(n, 40); return w; };
const vb = Buffer.from(voice.buffer); await writeFile(`${TMP}/voice.wav`, Buffer.concat([wavHead(vb.length), vb]));
// 배경음악: 되풀이 + 낭독 따라 낮추기(sidechain), 처음 2초 서서히, 끝 4초 서서히 줄임
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', `${TMP}/voice.wav`, '-stream_loop', '-1', '-i', 'assets/music/why.mp3', '-filter_complex',
  `[1:a]atrim=0:${TOTAL.toFixed(2)},volume=0.32,afade=t=in:d=2,afade=t=out:st=${(TOTAL - 4).toFixed(2)}:d=4[m];[0:a]aresample=48000,asplit[v1][v2];[m][v2]sidechaincompress=threshold=0.03:ratio=4:attack=60:release=700[md];[v1][md]amix=inputs=2:normalize=0,loudnorm=I=-16:TP=-1.5[o]`,
  '-map', '[o]', '-ar', '48000', '-ac', '2', '-c:a', 'aac', '-b:a', '160k', `${TMP}/mix.m4a`]);
// 화면: 한 장씩 찍어 ffmpeg로 바로 넘긴다
const qr = execFileSync('python3', ['-c', `import segno,io;b=io.BytesIO();segno.make('https://the-way-jesus.web.app/why.html',error='m').save(b,kind='svg',scale=4,border=1,dark='#2b2620',light=None,xmldecl=False,svgns=True);print(b.getvalue().decode())`]).toString();
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto('http://localhost:8765/_src/video/why-video.html', { waitUntil: 'networkidle' });
await p.evaluate(([tl, qr]) => window.setup(tl, qr), [tl, qr]);
const end = TO ? +TO : TOTAL, frames = Math.ceil((end - FROM) * FPS);
const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-', '-ss', String(FROM), '-t', String(end - FROM), '-i', `${TMP}/mix.m4a`,
  // 화면이 희끄무레하다(사용자, 2026-11): 어두운 곳(펜 선·글씨)을 더 진하게, 밝은 종이는 조금 가라앉히고 색은 조금 짙게
  '-vf', "curves=all='0/0 0.35/0.22 0.7/0.6 0.92/0.88 1/0.97',eq=saturation=1.25",
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '22', '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-shortest', '-movflags', '+faststart', OUT], { stdio: ['pipe', 'inherit', 'inherit'] });
const t0 = Date.now();
for (let i = 0; i < frames; i++) {
  await p.evaluate(x => window.render(x), FROM + i / FPS);
  const img = await p.screenshot({ type: 'jpeg', quality: 92 });
  if (!ff.stdin.write(img)) await new Promise(r => ff.stdin.once('drain', r));
  if (i % (FPS * 20) === 0) console.log(`${(i / FPS).toFixed(0)}초 / ${(end - FROM).toFixed(0)}초  (${((Date.now() - t0) / 1000).toFixed(0)}초 걸림)`);
}
ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close();
console.log('ok', OUT);

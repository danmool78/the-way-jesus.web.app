// '왜 기독교인가' 영상 만들기: 문장 녹음(tts.mjs) 길이로 장면 시각표를 짜고, why-video.html 무대를 한 장씩 찍어 ffmpeg로 묶는다.
// 쓰는 법: node _src/video/render.mjs [녹음 폴더] [출력.mp4] [--fps 30] [--from 초 --to 초(미리보기)]   — 저장소 맨 위를 http://localhost:8765 로 띄워 둔다
// 소리: 낭독(24kHz)을 한 줄로 이어 붙이고, 배경음악 assets/music/why.mp3(약 3분)를 되풀이해 낮게 깐다(낭독 중엔 더 낮게)
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { spawn, execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const argv = process.argv.slice(2), opt = (n, d) => { const i = argv.indexOf('--' + n); if (i < 0) return d; const v = argv[i + 1]; argv.splice(i, 2); return v; };
const FPS = +opt('fps', 30), FROM = +opt('from', 0), TO = opt('to', null);
const [VDIR = '/tmp/why-video/voice', OUT = 'why-video.mp4'] = argv;
const sc = JSON.parse(await readFile('_src/video/why-script.json', 'utf8')), VOICE = sc.voice, SR = 24000;
const keyOf = t => createHash('sha1').update(VOICE + '|' + t).digest('hex').slice(0, 12);
// 시각표: 장면 앞 1.0초, 문장 사이 0.5초, 장면 끝 1.2초 (그림만 보며 숨 고르기). 첫 장면은 2초 먼저, 끝 장면은 8초
const GAP = 0.5, LEAD = 1.0, TAIL = 1.2;
let t = 1.5; const tl = { scenes: [] }, clips = [];
for (const s of sc.scenes) {
  const S = { ...s, start: t, lines: [] }; t += s.title ? 1.5 : LEAD;
  for (const text of s.say) {
    const f = `${VDIR}/${keyOf(text)}.wav`, buf = await readFile(f), pcm = buf.subarray(44), dur = pcm.length / 2 / SR;
    clips.push({ at: t, pcm }); S.lines.push({ text, start: t, dur }); t += dur + GAP;
  }
  S.lines.forEach((l, k) => l.next = S.lines[k + 1]?.start ?? l.start + l.dur + 0.6);
  t += s.end ? 9 : TAIL - GAP; S.stop = t; tl.scenes.push(S);
}
const TOTAL = t; console.log('길이', (TOTAL / 60).toFixed(2), '분,', tl.scenes.length, '장면');
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

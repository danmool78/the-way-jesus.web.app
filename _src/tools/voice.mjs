// 한국어 낭독 녹음: 장면을 앱과 같은 순서·같은 문장 단위로 나눠 Google Chirp 3 HD로 만든다.
// 쓰는 법: GOOGLE_TTS_KEY=... node _src/tools/voice.mjs e01 [e02 …|all]
// 결과: assets/voice/ko/<열쇠>.mp3 + assets/voice/ko/index.json(열쇠 → 길이 ms). 열쇠는 목소리|문장의 FNV-1a라
// 글을 고치면 그 문장만 새로 만들어진다 (app.js의 voiceKey와 같은 계산). 키는 저장소에 두지 않는다
// 사용자와 맞춘 설정: 해설 Aoede 0.95배속, 예수 Algenib 1배속, 문장 안 쉼 0.93배, 말 빠르기 고르게
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pauses } from './tts-pauses.mjs';

const KEY = process.env.GOOGLE_TTS_KEY;
if (!KEY) { console.error('GOOGLE_TTS_KEY 환경변수가 없습니다'); process.exit(1); }
const OUT = 'assets/voice/ko', TMP = '/tmp/voice-ko';
const VOICE = { narr: { name: 'Aoede', rate: 0.95, cps: 6.8 }, jesus: { name: 'Algenib', rate: 1, cps: 7.5 } };
const INNER = 0.93, SR = 24000;

const d = JSON.parse(await readFile('data.json', 'utf8'));
const ui = JSON.parse(await readFile('_src/i18n/ui.ko.json', 'utf8'));
const args = process.argv.slice(2);
const events = args.includes('all') ? d.events : d.events.filter(e => args.includes(e.id));
if (!events.length) { console.error('장면 id를 주세요 (예: e01, 또는 all)'); process.exit(1); }

// app.js의 sentences·sceneScript와 같은 규칙
const sentences = text => text.match(/[^.?!…。！？]+[.?!…。！？]*["”’」』]?\s*/g) || [text];
export const voiceKey = (voice, text) => { let h = 0x811c9dc5; for (const c of `${voice}|${text}`) { h ^= c.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(36); };
function script(e) {
  const items = [{ text: `${e.title}. ${d.places[e.place].name.replace(/[()·]/g, ' ')}, ${e.when.replace(/·/g, ',')}.` }];
  e.story.forEach(s => items.push({ text: s }));
  items.push({ text: (e.words.some(w => w.j) ? ui.hisWords : ui.voicesOfDay) + '.' });
  e.words.forEach(w => { if (!w.j) items.push({ text: `${w.who}.` }); items.push({ text: w.text, jesus: !!w.j }); });
  // 제목 줄의 '장소, 때.'는 쉼표에서 나눠 따로 녹음해 잇는다 — 한 번에 읽히면 장소 이름을 늘이고 멈칫한다
  return items.flatMap((it, i) => sentences(it.text).map(s => s.trim()).filter(Boolean).map((text, k) => ({ text, jesus: it.jesus, split: i === 0 && k > 0 })));
}

// 20ms 창의 소리 크기로 무음(-40dB 아래)을 가린다
const W = 480, LOUD = 32768 * 0.01;
function frames(pcm) { const q = []; for (let w = 0; w + W <= pcm.length; w += W) { let e = 0; for (let x = w; x < w + W; x++) e += pcm[x] * pcm[x]; q.push(Math.sqrt(e / W) >= LOUD); } return q; }
const pcmOf = wav => { const head = wav.indexOf('data') + 8; return new Int16Array(wav.buffer.slice(wav.byteOffset + head, wav.byteOffset + head + ((wav.length - head) & ~1))); };
// 앞뒤 무음은 40ms만 남기고(문장 사이 쉼은 앱이 준다), 문장 안 쉼(0.12초 넘는 무음)은 모두 같은 비율로 줄인다
function tidy(pcm) {
  const loud = frames(pcm), first = loud.indexOf(true), last = loud.lastIndexOf(true);
  if (first < 0) return pcm;
  const keep = []; let at = Math.max(0, first - 2) * W, w = first;
  while (w <= last) {
    if (loud[w]) { w++; continue; }
    let v = w; while (!loud[v]) v++;
    const len = (v - w) * W;
    if (len >= 0.12 * SR) { const out = Math.round(len * INNER), cut = Math.floor((len - out) / 2); keep.push([at, w * W + cut]); at = w * W + cut + (len - out); }
    w = v;
  }
  keep.push([at, Math.min(pcm.length, (last + 3) * W)]);
  const res = new Int16Array(keep.reduce((t, [a, b]) => t + b - a, 0)); let o = 0;
  for (const [a, b] of keep) { res.set(pcm.subarray(a, b), o); o += b - a; }
  return res;
}
const speechSec = pcm => frames(pcm).filter(Boolean).length * W / SR;

// 읽을 때만 바꾸는 말: 영어 글자 BC·AD 앞에서 Chirp가 앞말을 늘이고 멈칫하므로 우리말로 읽힌다 (화면 글과 열쇠는 그대로)
const spoken = text => text.replace(/\bBC\s*/g, '기원전 ').replace(/\bAD\s*/g, '서기 ');

async function synth(text, v, rate) {
  // 문장 안 쉼: 연결어미 뒤 짧은 무음 표시 (tts-pauses.mjs). Chirp는 SSML 무음을 그대로 따르지 않지만 쉼 자리는 지킨다
  const ssml = `<speak>${pauses(spoken(text)).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\[pause short\]/g, '<break time="80ms"/>').replace(/\[pause\]/g, '<break time="250ms"/>')}</speak>`;
  const r = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${KEY}`, { method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ input: { ssml }, voice: { languageCode: 'ko-KR', name: `ko-KR-Chirp3-HD-${v.name}` }, audioConfig: { audioEncoding: 'LINEAR16', sampleRateHertz: SR, speakingRate: rate } }) });
  const j = await r.json(); if (!r.ok) throw Error(`${v.name}: ${j.error?.message || r.status}`);
  return pcmOf(Buffer.from(j.audioContent, 'base64'));
}

// 같은 배속이어도 Chirp는 가끔 짧은 말을 빨리 읽는다. 말소리만의 초당 글자 수가 기준에서 5% 넘게 벗어나면
// 배속을 고쳐 다시 만들고, 다섯 번 안에 못 맞추면 가장 가까운 판을 쓴다. 숫자는 글자 수로 잴 수 없어 그대로
async function record(text, v) {
  const chars = text.replace(/[\s.,?!'"“”‘’…·:;()\-–—]/g, '').length, measurable = chars >= 10 && !/\d/.test(text);
  let rate = v.rate, best = null;
  for (let tries = 0; tries < (measurable ? 5 : 1); tries++) {
    const pcm = await synth(text, v, rate), cps = chars / speechSec(pcm), off = Math.abs(cps / v.cps - 1);
    if (!best || off < best.off) best = { pcm, cps, rate, off };
    if (!measurable || off <= 0.05) break;
    rate = Math.min(1.15, Math.max(0.8, rate * v.cps / cps));
  }
  return best;
}

await mkdir(OUT, { recursive: true }); await mkdir(TMP, { recursive: true });
let made = 0;
for (const e of events) {
  for (const s of script(e)) {
    const v = s.jesus ? VOICE.jesus : VOICE.narr, key = voiceKey(v.name, s.text), mp3 = `${OUT}/${key}.mp3`;
    if (existsSync(mp3)) continue;
    let b, pcm;
    if (s.split) {
      const parts = [];
      for (const piece of s.text.split(/,\s*/)) parts.push(tidy((b = await record(piece, v)).pcm));
      const gap = new Int16Array(Math.round(0.35 * SR)); // 장소와 때 사이 쉼
      pcm = new Int16Array(parts.reduce((t, p, i) => t + p.length + (i ? gap.length : 0), 0));
      let o = 0; parts.forEach((p, i) => { if (i) o += gap.length; pcm.set(p, o); o += p.length; });
    } else pcm = tidy((b = await record(s.text, v)).pcm);
    const raw = `${TMP}/${key}.pcm`;
    await writeFile(raw, Buffer.from(pcm.buffer, pcm.byteOffset, pcm.byteLength));
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 's16le', '-ar', String(SR), '-ac', '1', '-i', raw, '-c:a', 'libmp3lame', '-b:a', '48k', mp3]);
    console.log(e.id, v.name, key, `${(pcm.length / SR).toFixed(1)}초`, b.cps ? `${b.cps.toFixed(1)}자/초 ×${b.rate.toFixed(2)}` : '', s.text.slice(0, 30));
    made++;
  }
}

// 목록은 폴더에 있는 파일 전부로 다시 쓴다 (길이는 감시 타이머용)
const index = {};
for (const f of (await readdir(OUT)).filter(f => f.endsWith('.mp3')).sort()) {
  const ms = Math.round(1000 * +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', `${OUT}/${f}`]).toString().trim());
  index[f.slice(0, -4)] = ms;
}
await writeFile(`${OUT}/index.json`, JSON.stringify(index) + '\n');
console.log(`새로 ${made}개, 모두 ${Object.keys(index).length}개`);

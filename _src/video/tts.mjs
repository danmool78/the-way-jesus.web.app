// '왜 기독교인가' 영상 낭독: 대본(why-script.json)의 문장마다 Gemini 여자 성우로 녹음한다 (2026-11 사용자: 여자 Gemini 목소리).
// 쓰는 법: GEMINI_API_KEY=… node _src/video/tts.mjs [대본.json] [출력 폴더] [--voice 이름] [--only 번호]
// 같은 문장은 다시 녹음하지 않는다(파일 이름 = 글의 해시). 말투 지시는 받는 모델(3.1 미리보기)로만, 지시문까지 읽었으면 다시
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
const argv = process.argv.slice(2), opt = n => { const i = argv.indexOf('--' + n); if (i < 0) return null; const v = argv[i + 1]; argv.splice(i, 2); return v; };
const VOICE = opt('voice') || 'Sulafat', ONLY = opt('only'), SCENES = argv.includes('--scenes') && argv.splice(argv.indexOf('--scenes'), 1);
// --scenes: 장면(단락)마다 한 번에 녹음한다 — 문장을 따로 녹음해 같은 간격으로 붙이면 쉼과 억양이 부자연스러웠다(사용자, 2026-11)
const [scriptPath = '_src/video/why-script.json', OUT = '/tmp/why-video/voice'] = argv;
const KEY = process.env.GEMINI_API_KEY, MODEL = 'gemini-3.1-flash-tts-preview', SR = 24000;
const STYLE = 'Read this in Korean, warmly and gently, like a kind woman in her thirties quietly telling a friend something precious. Calm, sincere, unhurried, never preachy:\n';
await mkdir(OUT, { recursive: true });
const sc = JSON.parse(await readFile(scriptPath, 'utf8'));
const lines = SCENES ? sc.scenes.filter(s => s.say.length).map(s => s.say.join('\n')) : sc.scenes.flatMap(s => s.say);
const keyOf = t => createHash('sha1').update(VOICE + '|' + t).digest('hex').slice(0, 12);
const wav = pcm => { const w = Buffer.alloc(44 + pcm.length); w.write('RIFF', 0); w.writeUInt32LE(36 + pcm.length, 4); w.write('WAVEfmt ', 8); w.writeUInt32LE(16, 16); w.writeUInt16LE(1, 20); w.writeUInt16LE(1, 22); w.writeUInt32LE(SR, 24); w.writeUInt32LE(SR * 2, 28); w.writeUInt16LE(2, 32); w.writeUInt16LE(16, 34); w.write('data', 36); w.writeUInt32LE(pcm.length, 40); pcm.copy(w, 44); return w; };
async function call(text) {
  for (let k = 0; k < 6; k++) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, { method: 'POST', headers: { 'x-goog-api-key': KEY, 'content-type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: STYLE + text }] }], generationConfig: { temperature: 0.6, responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } } } }) });
    const j = await r.json().catch(() => ({}));
    const d = j.candidates?.[0]?.content?.parts?.find(x => x.inlineData?.data)?.inlineData?.data;
    if (r.ok && d) { const b = Buffer.from(d, 'base64'); return b.toString('latin1', 0, 4) === 'RIFF' ? b.subarray(44) : b; }
    console.warn('  다시', r.status, (j.error?.message || '').slice(0, 100)); await new Promise(res => setTimeout(res, r.status === 429 ? 30000 : 5000));
  }
  return null;
}
async function hear(pcm) {
  const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent', { method: 'POST', headers: { 'x-goog-api-key': KEY, 'content-type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ inlineData: { mimeType: 'audio/wav', data: wav(pcm).toString('base64') } }, { text: '이 한국어 녹음을 받아 적어라. 받아 적은 글만 답하라.' }] }] }) });
  const said = (await r.json().catch(() => ({}))).candidates?.[0]?.content?.parts?.map(p => p.text).join('') || '';
  return said;
}
// 녹음이 쓸 만한가: 지시문까지 읽지 않았고, 글을 빠뜨리지 않았는가(받아 적은 글자 수가 원문의 85% 이상)
const bare = x => x.replace(/[^가-힣A-Za-z0-9]/g, '');
async function bad(pcm, text) {
  const said = await hear(pcm);
  if (/softly|warmly|gently|friend|preachy|sincere|thirties/i.test(said)) return '지시문까지 읽음';
  if (bare(said).length < bare(text).length * 0.85) return `빠뜨림(${bare(said).length}/${bare(text).length})`;
  return null;
}
// 앞뒤 무음을 잘라 문장 사이 쉼을 영상 쪽에서 고르게 맞춘다
function trim(pcm) {
  const s = new Int16Array(pcm.buffer, pcm.byteOffset, pcm.length >> 1); let a = 0, b = s.length - 1;
  while (a < b && Math.abs(s[a]) < 300) a++; while (b > a && Math.abs(s[b]) < 300) b--;
  a = Math.max(0, a - 480); b = Math.min(s.length - 1, b + 1200);
  return Buffer.from(s.buffer, s.byteOffset + a * 2, (b - a + 1) * 2);
}
let n = 0;
for (const [i, t] of lines.entries()) {
  if (ONLY && +ONLY !== i) continue;
  const f = `${OUT}/${keyOf(t)}.wav`; if (existsSync(f)) continue;
  let pcm = null;
  for (let k = 0; k < 4 && !pcm; k++) { const p = await call(t); if (!p) break; const why = await bad(p, t); if (why) { console.warn(`  ${why} — 다시`); continue; } pcm = p; }
  if (!pcm) { console.error('실패', i, t.slice(0, 30)); continue; }
  pcm = trim(pcm); await writeFile(f, wav(pcm)); n++;
  console.log(i, (pcm.length / 2 / SR).toFixed(1) + '초', t.replace(/\n/g, ' ').slice(0, 40));
}
console.log('새로 녹음', n, '/', lines.length);

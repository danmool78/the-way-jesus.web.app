// 교회 행사 홍보 영상(FOUND YOU) 내레이션을 Gemini 성우로 다시 녹음한다 — 앱과 상관없는 일회성 작업 (2026-11 사용자)
// 쓰는 법: GEMINI_API_KEY=... node _src/promo/tts.mjs Zephyr [Laomedeia …] → _src/promo/out/<성우>/NN.wav (24kHz 모노)
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error('GEMINI_API_KEY 비밀값이 없습니다'); process.exit(1); }
const lines = JSON.parse(await readFile('_src/promo/lines.json', 'utf8'));
const STYLE = 'Read this Korean line as a bright, cheerful, warm female narrator of a church event promo video for families and kids. Lively and smiling but clear, natural pace. Read only the line:\n';
const MODELS = ['gemini-3.1-flash-tts-preview', 'gemini-2.5-pro-preview-tts', 'gemini-2.5-flash-preview-tts'];
const wav = pcm => { const h = Buffer.alloc(44); h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length, 4); h.write('WAVEfmt ', 8); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(24000, 24); h.writeUInt32LE(48000, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(pcm.length, 40); return Buffer.concat([h, pcm]); };
async function call(model, text, voice) {
  for (let t = 0; t < 4; t++) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, { method: 'POST', headers: { 'x-goog-api-key': KEY, 'content-type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: STYLE + text }] }], generationConfig: { temperature: 0.7, responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } } } }) });
    const j = await r.json().catch(() => ({}));
    const d = j.candidates?.[0]?.content?.parts?.find(x => x.inlineData?.data)?.inlineData?.data;
    if (r.ok && d) return Buffer.from(d, 'base64');
    console.warn(`${model} ${r.status}: ${(j.error?.message || '').slice(0, 150)}`); // 열쇠 값은 찍지 않는다
    if (r.status !== 429 && r.status < 500) return null;
    await new Promise(res => setTimeout(res, 20000));
  }
  return null;
}
for (const voice of process.argv.slice(2)) {
  const dir = `_src/promo/out/${voice}`; await mkdir(dir, { recursive: true });
  for (const [i, text] of lines.entries()) {
    const f = `${dir}/${String(i + 1).padStart(2, '0')}.wav`;
    if (existsSync(f)) continue;
    // 지시문까지 읽어 지나치게 길어진 판은 버리고 다시 (한국어 한 글자 0.2초쯤 — 그 2배가 넘으면)
    let best = null;
    for (const model of MODELS) {
      for (let k = 0; k < 3; k++) {
        const pcm = await call(model, text, voice); if (!pcm) break;
        const sec = pcm.length / 48000, n = text.replace(/[\s.,?!]/g, '').length;
        if (sec < n * 0.4) { best = pcm; break; }
        console.warn(`너무 김 ${sec.toFixed(1)}초 — 다시: ${text.slice(0, 20)}`);
      }
      if (best) break;
    }
    if (!best) { console.error(`실패: ${voice} ${i + 1}`); continue; }
    await writeFile(f, wav(best)); console.log(voice, i + 1, `${(best.length / 48000).toFixed(1)}초`, text.slice(0, 24));
  }
}

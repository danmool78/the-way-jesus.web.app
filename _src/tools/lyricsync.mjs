// 시편 노래의 가사 시간 맞추기: assets/psalms/<id>.json의 src(Cloudflare R2에 올린 노래)를 받아 Gemini에 들려 주고,
// 가사 줄마다 부르기 시작하는 시각을 받아 같은 json의 lines([{ t, text }])에 by: 'auto'로 쓴다.
// 작업실(studio.html)에서 노래를 새로 올렸거나(by: 'pending') 가사가 바뀐 노래만 다시 맞춘다. 탭으로 맞춘 것(by: 'tap')은 가사가 그대로면 두고,
// id를 주면 그 노래는 다시 맞춘다. 쓰는 법: GEMINI_API_KEY=… node _src/tools/lyricsync.mjs [id…]   (배포 작업 firebase-hosting-merge.yml이 돌린다)
import { readFile, writeFile, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const KEY = process.env.GEMINI_API_KEY, DIR = 'assets/psalms', MODELS = ['gemini-3-flash-preview', 'gemini-2.5-flash'];
if (!KEY) { console.error('GEMINI_API_KEY 환경변수가 없습니다'); process.exit(1); }
const { songs } = JSON.parse(await readFile('_src/journeys/psalms/songs.json', 'utf8'));
const only = process.argv.slice(2);
// 부르는 줄만 (studio.js·app.js와 같은 규칙): [Verse] 같은 표시와 빈 줄은 뺀다
const sungLines = lyrics => (lyrics || '').split('\n').map(s => s.trim()).filter(s => s && !/^\[.*\]$/.test(s));
const dur = f => +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString().trim();

async function ask(model, b64, lines) {
  const prompt = `이 노래는 아래 한국어 가사를 위에서부터 차례로 부른 것이다. 가사 줄마다 그 줄을 부르기 시작하는 시각(노래 처음부터 초, 소수 첫째 자리)을 찾아라.
같은 줄이 여러 번 나오면 목록에 적힌 순서대로 차례로 대응시켜라. 노래에서 부르지 않은 줄은 start를 null로.
JSON 배열로만 답하라: [{"i": 줄 번호, "start": 초}, …]

${lines.map((l, i) => `${i}: ${l}`).join('\n')}`;
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, { method: 'POST', headers: { 'x-goog-api-key': KEY, 'content-type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ inlineData: { mimeType: 'audio/mpeg', data: b64 } }, { text: prompt }] }], generationConfig: { responseMimeType: 'application/json', temperature: 0 } }) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw Error(`${model}: ${j.error?.message || r.status}`);
  return JSON.parse(j.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || '[]');
}

// 받은 시각을 다듬는다: 차례가 뒤집히거나 비면 앞뒤 사이로 채우고, 노래 길이 안에 둔다
function tidy(raw, n, len) {
  const t = Array(n).fill(null);
  for (const x of raw) if (Number.isInteger(x?.i) && x.i >= 0 && x.i < n && typeof x.start === 'number' && x.start >= 0 && x.start < len) t[x.i] = x.start;
  for (let i = 1; i < n; i++) if (t[i] != null && t[i - 1] != null && t[i] <= t[i - 1]) t[i] = null; // 거꾸로 간 것은 버리고 채운다
  for (let i = 0; i < n; i++) {
    if (t[i] != null) continue;
    let a = i - 1; while (a >= 0 && t[a] == null) a--;
    let b = i + 1; while (b < n && t[b] == null) b++;
    const ta = a >= 0 ? t[a] : 0, tb = b < n ? t[b] : len;
    t[i] = ta + (tb - ta) * (i - a) / (b - a);
  }
  return t.map(x => Math.round(x * 10) / 10);
}

let made = 0;
const tmp = await mkdtemp(`${tmpdir()}/lyricsync-`);
for (const s of songs) {
  const out = `${DIR}/${s.id}.json`;
  if ((only.length && !only.includes(s.id)) || !s.lyrics || !existsSync(out)) continue;
  const info = JSON.parse(await readFile(out, 'utf8')), lines = sungLines(s.lyrics);
  const same = info.by !== 'pending' && info.lines?.length === lines.length && info.lines.every((l, i) => l.text === lines[i]);
  if (same && !only.length) continue;
  const r = await fetch(info.src);
  if (!r.ok) { console.warn(`::warning::${s.id} 노래를 받지 못했습니다 (${r.status} ${info.src})`); continue; }
  const buf = Buffer.from(await r.arrayBuffer()), mp3 = `${tmp}/${s.id}.mp3`;
  await writeFile(mp3, buf);
  const len = dur(mp3), b64 = buf.toString('base64');
  let raw = null;
  for (const m of MODELS) { try { raw = await ask(m, b64, lines); break; } catch (e) { console.warn(e.message); } }
  if (!raw) { console.warn(`::warning::${s.id} 가사 시간을 맞추지 못했습니다 (작업실에서 탭으로 맞춰 주세요)`); continue; }
  const found = raw.filter(x => typeof x?.start === 'number').length;
  const t = tidy(raw, lines.length, len);
  await writeFile(out, JSON.stringify({ ...info, by: 'auto', lines: lines.map((text, i) => ({ t: t[i], text })) }, null, 1) + '\n');
  console.log(`${s.id} 시편 ${s.psalm}: ${lines.length}줄 중 ${found}줄 시각을 받음, ${len.toFixed(0)}초`);
  made++;
}
console.log(`가사 시간 ${made}곡 맞춤`);

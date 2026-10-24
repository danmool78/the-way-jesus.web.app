// 배경음악: _src/music.json의 곡(cue)마다 Lyria 3 Clip으로 30초 반복 곡을 만든다 (리딩북의 makeCue와 같은 방식).
// 쓰는 법: GEMINI_API_KEY=... node _src/tools/music.mjs [곡 …|all]   (아무것도 안 주면 아직 없는 곡만)
// 결과: assets/music/<곡>.mp3 — 곡마다 소리 크기를 맞추고(-20 LUFS) 112kbps로 다시 눌러 담는다. 그 뒤 python3 _src/build.py.
// 한 곡에 약 $0.04. 키는 저장소에 두지 않는다
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error('GEMINI_API_KEY 환경변수가 없습니다'); process.exit(1); }
const MODEL = 'lyria-3-clip-preview', OUT = 'assets/music', TMP = '/tmp/music';

const score = JSON.parse(await readFile('_src/music.json', 'utf8'));
const args = process.argv.slice(2);
const cues = Object.keys(score.cues).filter(c => args.includes('all') || args.includes(c) || (!args.length && !existsSync(`${OUT}/${c}.mp3`)));
const unknown = args.filter(a => a !== 'all' && !score.cues[a]);
if (unknown.length) { console.error('없는 곡:', unknown.join(' ')); process.exit(1); }
await mkdir(OUT, { recursive: true }); await mkdir(TMP, { recursive: true });

// 낭독 밑에 깔리므로: 목소리 음역을 비우고, 처음과 끝의 기운을 같게 해 끝이 처음으로 이어지게
const prompt = cue => `Instrumental, no vocals, a 30-second seamless loop for the background of a narrated Bible story. Setting: ${score.setting}. ${score.cues[cue].sound} It keeps one steady feeling throughout, begins and ends at the same energy so the end flows back into the start, no intro, no fade, no ending flourish, no loud hits; restrained, sparse in the voice range so a narrator is heard clearly above it. Tasteful, high-quality acoustic recording.`;

for (const cue of cues) {
  process.stdout.write(`${cue} … `);
  let audio;
  for (let attempt = 1; attempt <= 3 && !audio; attempt++) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: 'POST', headers: { 'x-goog-api-key': KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt(cue) }] }] }), signal: AbortSignal.timeout(180000)
    }).catch(err => ({ ok: false, status: 0, text: async () => err.message }));
    if (!r.ok) { console.error(`\n  실패 ${r.status}: ${(await r.text()).split(KEY).join('…').slice(0, 300)}`); continue; }
    const j = await r.json();
    audio = j?.candidates?.[0]?.content?.parts?.find(p => p.inlineData?.data)?.inlineData;
  }
  if (!audio) { console.error(`  ${cue}: 만들지 못함`); continue; }
  const raw = `${TMP}/${cue}.raw`;
  await writeFile(raw, Buffer.from(audio.data, 'base64'));
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', raw, '-af', 'loudnorm=I=-20:TP=-2:LRA=9', '-ar', '44100', '-ac', '2', '-b:a', '112k', `${OUT}/${cue}.mp3`]);
  const sec = +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', `${OUT}/${cue}.mp3`]).toString();
  console.log(`${sec.toFixed(1)}초`);
}

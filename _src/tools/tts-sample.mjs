// 낭독 목소리 고르기용 시안: 한 장면의 첫머리·첫 문단과 예수 말씀 한 줄을 Google Chirp 3 HD 목소리 여러 개로 만든다.
// 쓰는 법: GOOGLE_TTS_KEY=... node _src/tools/tts-sample.mjs [장면 id=e17] [출력 폴더=_src/tts-samples]
// 키는 Text-to-Speech API로만 제한한 API 키. 저장소에 두지 않는다
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const KEY = process.env.GOOGLE_TTS_KEY;
if (!KEY) { console.error('GOOGLE_TTS_KEY 환경변수가 없습니다'); process.exit(1); }
const [id = 'e17', out = '_src/tts-samples'] = process.argv.slice(2);

const d = JSON.parse(await readFile('data.json', 'utf8'));
const e = d.events.find(x => x.id === id), place = d.places[e.place].name;
const narration = `${e.title}. ${place.replace(/[()·]/g, ' ')}, ${e.when.replace(/·/g, ',')}. ${e.story[0]}`;
const jesus = (e.words.find(w => w.who === '예수') || e.words[0]).text;

// 해설은 차분한 목소리 위주로, 예수 말씀은 낮고 따뜻한 남성 목소리 후보로
const NARRATORS = ['Kore', 'Aoede', 'Leda', 'Sulafat', 'Charon', 'Orus', 'Iapetus', 'Algieba'];
const JESUS = ['Charon', 'Iapetus', 'Enceladus', 'Umbriel', 'Algieba'];

async function say(text, voice, file) {
  const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${KEY}`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ input: { text }, voice: { languageCode: 'ko-KR', name: `ko-KR-Chirp3-HD-${voice}` }, audioConfig: { audioEncoding: 'MP3' } })
  });
  const j = await res.json();
  if (!res.ok) throw Error(`${voice}: ${j.error?.message || res.status}`);
  await writeFile(file, Buffer.from(j.audioContent, 'base64'));
  console.log(file);
}

await mkdir(out, { recursive: true });
for (const v of NARRATORS) await say(narration, v, `${out}/${id}-해설-${v}.mp3`);
for (const v of JESUS) await say(jesus, v, `${out}/${id}-예수-${v}.mp3`);

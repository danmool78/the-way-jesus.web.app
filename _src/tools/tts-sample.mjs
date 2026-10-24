// 낭독 목소리 고르기용 시안: 한 장면의 첫머리·첫 문단과 예수 말씀 한 줄을 Google Chirp 3 HD 목소리 여러 개로 만든다.
// 쓰는 법: GOOGLE_TTS_KEY=... node _src/tools/tts-sample.mjs [장면 id=e17] [출력 폴더=_src/tts-samples]
// 키는 Text-to-Speech API로만 제한한 API 키. 저장소에 두지 않는다
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { pauses } from './tts-pauses.mjs';

const KEY = process.env.GOOGLE_TTS_KEY;
if (!KEY) { console.error('GOOGLE_TTS_KEY 환경변수가 없습니다'); process.exit(1); }
const [id = 'e17', out = '_src/tts-samples'] = process.argv.slice(2);

const d = JSON.parse(await readFile('data.json', 'utf8'));
const e = d.events.find(x => x.id === id), place = d.places[e.place].name;
const narration = `${e.title}. ${place.replace(/[()·]/g, ' ')}, ${e.when.replace(/·/g, ',')}. ${e.story[0]}`;
const jesus = (e.words.find(w => w.who === '예수') || e.words[0]).text;

// 띄어 읽기 규칙은 tts-pauses.mjs


// 해설은 차분한 목소리 위주로. 예수 말씀은 첫 시안이 가볍다 하여 남은 남성 목소리를 천천히,
// 그리고 음높이를 낮출 수 있는 Neural2·Wavenet 남성 목소리도 함께 (Chirp 3 HD는 pitch를 받지 않는다)
const NARRATORS = ['Kore', 'Aoede', 'Leda', 'Sulafat', 'Charon', 'Orus', 'Iapetus', 'Algieba'];
const JESUS = ['Achird', 'Algenib', 'Alnilam', 'Fenrir', 'Rasalgethi', 'Sadachbia', 'Sadaltager', 'Schedar', 'Zubenelgenubi', 'Charon',
  { name: 'Neural2-C', pitch: -4 }, { name: 'Wavenet-D', pitch: -4 }];

async function say(text, voice, file, rate = 1) {
  const v = typeof voice === 'string' ? { name: `Chirp3-HD-${voice}` } : voice;
  // pitch를 받는 목소리는 SSML로, Chirp는 markup으로 쉼을 준다
  const input = v.pitch == null ? { markup: pauses(text) }
    : { ssml: `<speak>${pauses(text).replace(/\[pause short\]/g, '<break time="250ms"/>').replace(/\[pause\]/g, '<break time="600ms"/>')}</speak>` };
  const audioConfig = { audioEncoding: 'MP3', speakingRate: rate, ...(v.pitch != null && { pitch: v.pitch }) };
  const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${KEY}`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ input, voice: { languageCode: 'ko-KR', name: `ko-KR-${v.name}` }, audioConfig })
  });
  const j = await res.json();
  if (!res.ok) throw Error(`${voice}: ${j.error?.message || res.status}`);
  await writeFile(file, Buffer.from(j.audioContent, 'base64'));
  console.log(file);
}

await mkdir(out, { recursive: true });
console.log(pauses(narration)); console.log(pauses(jesus));
for (const v of NARRATORS) await say(narration, v, `${out}/${id}-해설-${v}.mp3`, 0.95);
for (const v of JESUS) await say(jesus, v, `${out}/${id}-예수-${v.name || v}.mp3`, 1);

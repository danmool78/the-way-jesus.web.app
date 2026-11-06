// 일레븐랩스 해설 성우 고르기(GoodNews): 같은 문장을 여러 목소리로 녹음해 _src/voice-samples/eleven-<이름>.mp3로 둔다 (배포 제외).
// 키는 저장소에 두지 않는다 — GitHub Actions(eleven-sample.yml)가 비밀값 ELEVENLABS_API_KEY로 돌린다
// 기준: 복음을 전하는 따뜻한 목소리(차분·다정·신뢰). 남녀 모두.
// 후보: 기본 목소리 가운데 따뜻한 남녀 + 목소리 모음의 한국어 목소리(남·여 각 3, 따뜻한 말이 설명에 있는 것 먼저, 그다음 많이 쓰인 순)
import { writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
const KEY = process.env.ELEVENLABS_API_KEY, OUT = '_src/voice-samples/', SR = 24000, PCM = `${tmpdir()}/eleven-s.pcm`;
if (!KEY) { console.error('ELEVENLABS_API_KEY가 없습니다'); process.exit(1); }
const text = '첫째, 하나님은 당신을 사랑하시고, 당신의 삶을 향한 선한 뜻을 품고 계십니다. 성경은 이렇게 말합니다. 하나님은 세상을 이처럼 사랑하셔서 하나뿐인 아들을 주셨다.';
const H = { 'xi-api-key': KEY, 'content-type': 'application/json' };
const API = 'https://api.elevenlabs.io/v1';
// [이름, id, 성별, 설명] — 기본 목소리 가운데 따뜻한 쪽
const voices = [
  ['George', 'JBFqnCBsd6RMkjVDRZzb', 'male', '기본: warm, captivating storyteller'],
  ['Brian', 'nPczCjzI2devNBz1zQrb', 'male', '기본: deep, resonant, comforting'],
  ['Matilda', 'XrExE9yKIg1WjnnlVkGX', 'female', '기본: knowledgable, warm'],
  ['Sarah', 'EXAVITQu4vr4xnSDxMaL', 'female', '기본: mature, reassuring, confident'],
].map(([name, id, gender, desc]) => ({ name, id, gender, desc }));
const WARM = /warm|calm|gentle|soft|soothing|narrat|story|audiobook|kind|따뜻|차분|부드|다정|잔잔|내레이션|나레이션|낭독|오디오북/i;
for (const gender of ['male', 'female']) {
  const r = await fetch(`${API}/shared-voices?page_size=50&language=ko&gender=${gender}&sort=usage_character_count_1y`, { headers: H });
  if (!r.ok) { console.log('목소리 모음 못 읽음', gender, r.status, (await r.text()).slice(0, 160)); continue; }
  const all = (await r.json()).voices || [];
  // 따뜻한 말이 있는 것 먼저(정렬은 안정적이라 그 안에서는 많이 쓰인 순이 그대로)
  const hay = v => [v.description, v.descriptive, v.use_case, v.name].join(' ');
  const pick = all.filter(v => WARM.test(hay(v))).concat(all.filter(v => !WARM.test(hay(v)))).slice(0, 3);
  for (const v of pick) voices.push({ name: `${v.name}`.replace(/[^\w가-힣]+/g, '_').replace(/^_|_$/g, '').slice(0, 30), id: v.voice_id, gender,
    desc: `모음(ko, ${v.descriptive || '-'}, ${v.use_case || '-'}): ${(v.description || '').replace(/\s+/g, ' ').slice(0, 120)}`, owner: v.public_owner_id });
}
mkdirSync(OUT, { recursive: true });
const tts = id => fetch(`${API}/text-to-speech/${id}?output_format=pcm_${SR}`, { method: 'POST', headers: H,
  body: JSON.stringify({ text, model_id: 'eleven_v3', language_code: 'ko', voice_settings: { stability: 0.5, similarity_boost: 0.75 } }) });
const list = [], used = new Set();
for (const v of voices) {
  while (used.has(v.name)) v.name += '_';
  used.add(v.name);
  const row = { name: v.name, id: v.id, gender: v.gender, desc: v.desc };
  try {
    let r = await tts(v.id);
    // 목소리 모음의 목소리는 내 목소리 목록에 더해야 쓸 수 있는 때가 있다
    if (!r.ok && v.owner) { await fetch(`${API}/voices/add/${v.owner}/${v.id}`, { method: 'POST', headers: H, body: JSON.stringify({ new_name: v.name }) }); r = await tts(v.id); }
    if (!r.ok) throw new Error(`${r.status} ${(await r.text()).slice(0, 200)}`);
    writeFileSync(PCM, Buffer.from(await r.arrayBuffer()));
    row.file = `eleven-${v.name}.mp3`;
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 's16le', '-ar', String(SR), '-ac', '1', '-i', PCM, '-b:a', '64k', OUT + row.file]);
    console.log(v.name, v.gender, 'ok');
  } catch (e) { row.error = String(e.message || e); console.log(v.name, v.gender, '실패', row.error); }
  list.push(row);
}
writeFileSync(`${OUT}list.json`, JSON.stringify(list, null, 1) + '\n');
if (!list.some(x => x.file)) process.exit(1);

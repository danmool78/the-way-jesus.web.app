// 일레븐랩스 남자 성우 고르기: 같은 문장을 여러 목소리로 녹음해 _src/voice-samples/eleven-<이름>.mp3로 둔다 (배포 제외).
// 키는 저장소에 두지 않는다 — GitHub Actions(eleven-sample.yml)가 비밀값 ELEVENLABS_API_KEY로 돌린다
// 후보: 일레븐랩스 기본 목소리 가운데 차분한 남자 + 목소리 모음에서 한국어 남자 해설 목소리(많이 쓰인 순)
import { writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const KEY = process.env.ELEVENLABS_API_KEY, OUT = '_src/voice-samples/', SR = 24000;
if (!KEY) { console.error('ELEVENLABS_API_KEY가 없습니다'); process.exit(1); }
const text = '첫째, 하나님은 당신을 사랑하시고, 당신의 삶을 향한 선한 뜻을 품고 계십니다. 성경은 이렇게 말합니다. 하나님은 세상을 이처럼 사랑하셔서 하나뿐인 아들을 주셨다.';
const H = { 'xi-api-key': KEY, 'content-type': 'application/json' };
const voices = [['Brian', 'nPczCjzI2devNBz1zQrb'], ['George', 'JBFqnCBsd6RMkjVDRZzb'], ['Daniel', 'onwK4e9ZLuTAKqWW03F9']];
const lib = await fetch('https://api.elevenlabs.io/v1/shared-voices?page_size=8&language=ko&gender=male&sort=usage_character_count_1y', { headers: H }).then(r => r.json()).catch(e => ({ error: String(e) }));
for (const v of lib.voices || []) voices.push([`${v.name}`.replace(/[^\w가-힣]+/g, '_').slice(0, 30), v.voice_id, v.public_owner_id, v.description]);
if (!lib.voices) console.log('목소리 모음 못 읽음:', JSON.stringify(lib).slice(0, 200));
mkdirSync(OUT, { recursive: true });
const tts = (id, model) => fetch(`https://api.elevenlabs.io/v1/text-to-speech/${id}?output_format=pcm_${SR}`, { method: 'POST', headers: H,
  body: JSON.stringify({ text, model_id: model, language_code: 'ko', voice_settings: { stability: 0.5, similarity_boost: 0.75, speed: 0.95 } }) });
const list = [];
for (const [name, id, owner, desc] of voices) {
  let r = await tts(id, 'eleven_v3');
  // 목소리 모음의 목소리는 내 목소리 목록에 더해야 쓸 수 있는 때가 있다
  if (!r.ok && owner) { await fetch(`https://api.elevenlabs.io/v1/voices/add/${owner}/${id}`, { method: 'POST', headers: H, body: JSON.stringify({ new_name: name }) }); r = await tts(id, 'eleven_v3'); }
  if (!r.ok) { console.log(name, id, r.status, (await r.text()).slice(0, 160)); continue; }
  writeFileSync('/tmp/s.pcm', Buffer.from(await r.arrayBuffer()));
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 's16le', '-ar', String(SR), '-ac', '1', '-i', '/tmp/s.pcm', '-b:a', '64k', `${OUT}eleven-${name}.mp3`]);
  list.push({ name, id, desc: (desc || '').slice(0, 120) }); console.log(name, id, 'ok');
}
writeFileSync(`${OUT}list.json`, JSON.stringify(list, null, 1) + '\n');

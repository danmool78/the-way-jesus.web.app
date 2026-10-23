// 장면의 이야기·말씀을 무대 연출 단위(문장)로 나눠 보여 준다. 대본(stage/scenes.js)의 키를 정할 때 쓴다.
// 사용: node _src/tools/beats.mjs e13 e14 ...
// 출력 키: p1.2 = 둘째 문단(p1)의 셋째 문장, w0 = 첫 말씀. 문장 나누기는 app.js의 낭독과 같은 규칙이다
import { readFileSync } from 'node:fs';

const data = JSON.parse(readFileSync(new URL('../../data.json', import.meta.url), 'utf8'));
const sentences = t => (t.match(/[^.?!…]+[.?!…]*["”’]?\s*/g) || [t]).map(s => s.trim()).filter(Boolean);
for (const id of process.argv.slice(2)) {
  const e = data.events.find(x => x.id === id);
  if (!e) { console.log(`${id}: 없음`); continue; }
  const p = data.places[e.place];
  console.log(`=== ${e.id} ${e.title} @ ${e.place} (${p.lat}, ${p.lng}) ${p.name}${p.jlm ? ' [예루살렘 도성]' : ''}`);
  e.story.forEach((para, i) => sentences(para).forEach((s, k) => console.log(`p${i}.${k} ${s}`)));
  e.words.forEach((w, i) => console.log(`w${i} [${w.who}] ${w.text}`));
  console.log();
}

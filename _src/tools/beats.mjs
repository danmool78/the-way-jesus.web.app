// 장면의 이야기·말씀을 무대 연출 단위(문장)로 나눠 보여 준다. 대본(stage/scenes.js)의 키를 정할 때 쓴다.
// 사용: node _src/tools/beats.mjs e13 e14 ...
// 출력 키: p1.2 = 둘째 문단(p1)의 셋째 문장, w0 = 첫 말씀. 문장 나누기는 app.js의 낭독과 같은 규칙이다
import { readFileSync, readdirSync, existsSync } from 'node:fs';

// 예수 여정(data.json)과 다른 여정(j/<여정>/data.json)을 함께 읽는다 — 장면 id는 여정마다 겹치지 않는다
const root = new URL('../../', import.meta.url), load = f => JSON.parse(readFileSync(new URL(f, root), 'utf8'));
const all = [load('data.json'), ...(existsSync(new URL('j/', root)) ? readdirSync(new URL('j/', root)).filter(j => existsSync(new URL(`j/${j}/data.json`, root))).map(j => load(`j/${j}/data.json`)) : [])];
const sentences = t => (t.match(/[^.?!…]+[.?!…]*["”’]?\s*/g) || [t]).map(s => s.trim()).filter(Boolean);
for (const id of process.argv.slice(2)) {
  const data = all.find(d => d.events.some(x => x.id === id)) || all[0], e = data.events.find(x => x.id === id);
  if (!e) { console.log(`${id}: 없음`); continue; }
  const p = data.places[e.place];
  console.log(`=== ${e.id} ${e.title} @ ${e.place} (${p.lat}, ${p.lng}) ${p.name}${p.jlm ? ' [예루살렘 도성]' : ''}`);
  e.story.forEach((para, i) => sentences(para).forEach((s, k) => console.log(`p${i}.${k} ${s}`)));
  e.words.forEach((w, i) => console.log(`w${i} [${w.who}] ${w.text}`));
  console.log();
}

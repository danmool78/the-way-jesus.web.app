// 대본 점검: 낭독 순서대로(intro → p0… → w0… → end) 동작을 흉내 내어, 3D 무대를 띄우지 않고도 흔한 실수를 찾는다.
// 사용: node _src/tools/stagecheck.mjs [m01 m02 …]   (장면을 주지 않으면 대본이 있는 모든 장면)
//  1) 말씀(w…)에서 말하는(speak) 사람이 보이지 않는다
//  2) intro가 처음 상태를 다 되돌리지 않는다 — 다시 듣거나(끝난 상태에서 intro), 처음 들을 때(enter 뒤의 intro)
//     나오는 상태가 대본의 처음 자리(cast·props)에서 intro만 적용한 상태와 다르다
import { SCRIPTS } from '../../stage/scenes.js';

const order = s => {
  const ks = Object.keys(s.beats).filter(k => !['enter', 'intro', 'end'].includes(k));
  const rank = k => { const m = k.match(/^([pw])(\d+)(?:\.(\d+))?$/); return m ? [m[1] === 'p' ? 0 : 1, +m[2], m[3] === undefined ? -1 : +m[3]] : [9, 0, 0]; };
  return ['intro', ...ks.sort((a, b) => { const x = rank(a), y = rank(b); return x[0] - y[0] || x[1] - y[1] || x[2] - y[2]; }), 'end'];
};
function start(s) {
  const st = {};
  Object.entries(s.cast).forEach(([n, [, x, z]]) => { st[n] = { show: 1, x, z, pose: 'idle', item: null }; });
  Object.entries(s.props || {}).forEach(([n, [, x, z]]) => { st[n] = { show: 1, x, z, state: undefined, prop: true }; });
  return st;
}
function apply(st, cmds = []) {
  for (const [n, pose, o = {}] of cmds) {
    const a = st[n]; if (!a) continue;
    if (pose) a.prop ? (a.state = pose) : (a.pose = pose);
    for (const k of ['show', 'x', 'z', 'item']) if (k in o) a[k] = o[k];
  }
}
const clone = st => JSON.parse(JSON.stringify(st));
const ids = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(SCRIPTS);
let problems = 0;
for (const id of ids) {
  const s = SCRIPTS[id]; if (!s) continue;
  const out = [];
  // 1) 말씀에서 말하는 사람이 보이는가 (처음부터 차례로 들을 때)
  const st = start(s); apply(st, s.beats.enter); apply(st, s.beats.intro || s.beats.enter);
  for (const k of order(s).slice(1)) {
    apply(st, s.beats[k]);
    if (/^w/.test(k)) (s.beats[k] || []).forEach(([n, pose]) => { if (pose === 'speak' && st[n] && !st[n].show) out.push(`${k}: ${n}이(가) 말하는데 보이지 않음`); });
  }
  // 2) intro가 처음 상태를 다 되돌리는가
  const want = start(s); apply(want, s.beats.intro || s.beats.enter);
  const first = start(s); apply(first, s.beats.enter); apply(first, s.beats.intro || s.beats.enter);
  const again = clone(st); apply(again, s.beats.intro || s.beats.enter);
  for (const [label, got] of [['처음 들을 때', first], ['다시 들을 때', again]]) for (const n of Object.keys(want)) {
    const d = ['show', 'x', 'z', 'pose', 'item', 'state'].filter(k => JSON.stringify(want[n][k]) !== JSON.stringify(got[n][k]));
    if (d.length) out.push(`intro(${label}): ${n}의 ${d.map(k => `${k} ${JSON.stringify(got[n][k])}≠${JSON.stringify(want[n][k])}`).join(', ')}`);
  }
  if (out.length) { problems += out.length; console.log(`== ${id}\n  ` + out.join('\n  ')); }
}
console.log(problems ? `${problems}개` : 'OK');

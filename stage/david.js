/* ---------- 다윗 여정의 장면 연출 (stage/scenes.js의 SCRIPTS에 합쳐진다) ----------
   형식은 scenes.js·moses.js와 같다. 대본은 묶음마다 stage/david/의 파일 하나(a: d01–d10, b: d11–d20, c: d21–d30, d: d31–d39)에 두고 여기서 합친다.
   다윗 여정에만 쓰는 소품은 stage/david/props.js에서 props.js의 MAKERS에 더한다(공용 파일을 키우지 않게).
   연출 원칙(STAGE.md): 죽음과 폭력은 그리지 않는다 — 골리앗이 쓰러진 뒤, 놉의 제사장들, 사울의 죽음, 우리아, 압살롬은 낭독과 빛·애도로만 */
import './david/props.js';
import { A } from './david/a.js';
import { B } from './david/b.js';
import { C } from './david/c.js';
import { D } from './david/d.js';

export const DAVID = { ...A, ...B, ...C, ...D };

// intro 앞에 처음 자리로 되돌리는 명령을 붙인다 (moses.js 끝과 같은 까닭 — node _src/tools/stagecheck.mjs로 점검)
Object.values(DAVID).forEach(s => {
  const reset = [
    ...Object.entries(s.cast).map(([n, [, x, z, look, o = {}]]) => [n, o.pose || 'idle', o.board ? { show: 1, item: null, look } : { show: 1, x, z, look, item: null, y: o.y || 0 }]),
    ...Object.entries(s.props || {}).map(([n, [, x, z]]) => [n, null, { show: 1, x, z }]),
  ];
  s.beats.intro = [...reset, ...(s.beats.intro || s.beats.enter)];
});

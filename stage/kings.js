/* ---------- 열왕기 여정의 장면 연출 (stage/scenes.js의 SCRIPTS에 합쳐진다) ----------
   형식은 scenes.js·david.js와 같다. 대본은 묶음마다 stage/kings/의 파일 하나(a: k01–k11, b: k12–k22, c: k23–k31, d: k32–k41)에 두고 여기서 합친다.
   열왕기 여정에만 쓰는 소품은 stage/kings/props.js에서 props.js의 MAKERS에 더한다(공용 파일을 키우지 않게). 인물은 people.js의 '열왕기 여정' 묶음.
   연출 원칙(STAGE.md): 하나님은 모습 없이 빛(beam)으로만 — 갈멜산의 불, 불수레·불말, 회오리바람은 빛과 불꽃으로.
   죽음과 폭력은 그리지 않는다 — 하나님의 사람과 사자, 이세벨, 아합의 화살, 앗수르 진영, 요시야, 성전 화재, 그달리야는 사라짐·어둠·애도로 */
import './kings/props.js';
import { A } from './kings/a.js';
import { B } from './kings/b.js';
import { C } from './kings/c.js';
import { D } from './kings/d.js';

export const KINGS = { ...A, ...B, ...C, ...D };

// intro 앞에 처음 자리로 되돌리는 명령을 붙인다 (david.js와 같다 — node _src/tools/stagecheck.mjs로 점검).
// 탄 사람(board)은 자리를 되돌리지 않는다 — 내린 사람은 intro에서 다시 태운다. 상태가 바뀌는 소품(제단 'fire' 등)과 분위기(@env)도 intro에서 되돌린다
Object.values(KINGS).forEach(s => {
  const reset = [
    ...Object.entries(s.cast).map(([n, [, x, z, look, o = {}]]) => [n, o.pose || 'idle', o.board ? { show: 1, item: null, look } : { show: 1, x, z, look, item: null, y: o.y || 0 }]),
    ...Object.entries(s.props || {}).map(([n, [, x, z]]) => [n, null, { show: 1, x, z }]),
  ];
  s.beats.intro = [...reset, ...(s.beats.intro || s.beats.enter)];
});

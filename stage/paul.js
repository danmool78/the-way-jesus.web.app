/* ---------- 바울 여정의 장면 연출 (stage/scenes.js의 SCRIPTS에 합쳐진다) ----------
   형식은 scenes.js·kings.js와 같다. 대본은 묶음마다 stage/paul/의 파일 하나(a: a01–a11, b: a12–a22, c: a23–a32, d: a33–a42)에 두고 여기서 합친다.
   바울 여정에만 쓰는 소품은 stage/paul/props*.js에서 props.js의 MAKERS에 더한다(공용 파일을 키우지 않게). 인물은 people.js의 '바울 여정' 묶음.
   소아시아·헬라·이달리야는 3D 지형 지역 밖이라, 3D 모드에서도 무대가 평평한 2D 바탕(지중해 그림) 위에 선다(열왕기의 바벨론처럼).
   연출 원칙(STAGE.md): 주님은 모습 없이 빛과 목소리로만(다메섹 길), 성령·천사도 빛으로. 고통과 폭력은 그리지 않는다 —
   스데반과 루스드라의 돌은 날아가 땅에 떨어지는 돌과 흙먼지·무릎 꿇은 사람·빛으로만(피·상처 없음) */
import './paul/props.js';
import { A } from './paul/a.js';
import './paul/props-b.js';
import { B } from './paul/b.js';
import { C } from './paul/c.js';
import './paul/props-d.js';
import { D } from './paul/d.js';

export const PAUL = { ...A, ...B, ...C, ...D };

// intro 앞에 처음 자리로 되돌리는 명령을 붙인다 (kings.js와 같다 — node _src/tools/stagecheck.mjs로 점검).
// 탄 사람(board)은 자리를 되돌리지 않는다 — 내린 사람은 intro에서 다시 태운다. 상태가 바뀌는 소품과 분위기(@env)·무대 자리(@at)는 intro에서 되돌린다
Object.values(PAUL).forEach(s => {
  const reset = [
    ...Object.entries(s.cast).map(([n, [, x, z, look, o = {}]]) => [n, o.pose || 'idle', o.board ? { show: 1, item: null, look } : { show: 1, x, z, look, item: null, y: o.y || 0 }]),
    ...Object.entries(s.props || {}).map(([n, [, x, z]]) => [n, null, { show: 1, x, z }]),
  ];
  s.beats.intro = [...reset, ...(s.beats.intro || s.beats.enter)];
});

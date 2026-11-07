/* 거리 높이 무대 — 솔로몬 때(주전 950년 무렵) 예루살렘. 잠언 여정의 세트들.
   지도 위 미니어처 무대와 달리 사람 눈높이에서 보는 실제 크기의 세트다.
   축척: 사람 키 0.88 ≈ 1.7m 이므로 1m = 0.52단위. x는 동쪽(오른쪽), z는 남쪽(앞), y는 높이.
   성문은 북쪽(-z)에 있고, 보는 사람은 성 안 광장에서 성문을 바라본다.
   고증(대략): 철기 시대의 여섯 방 성문(므깃도·게셀·하솔과 같은 꼴), 회칠한 흙벽돌 위에 돌 기초를 둔 집, 평평한 흙 지붕과 난간(신 22:8)
   파일 나눔: street/kit.js(공통 도구) · street/parts.js(부품) · street/gate.js · street/field.js · street/home.js · street/alley.js · street/palace.js(세트). 새 세트는 street/에 파일을 더하고 아래 표에 적는다 */
import { gateSquare } from './street/gate.js';
import { fieldSet } from './street/field.js';
import { homeSet } from './street/home.js';
import { alleySet } from './street/alley.js';
import { palaceSet } from './street/palace.js';
export { M, skyTexture } from './street/kit.js';
export { scales } from './street/parts.js';

/* ---------- stage.js가 쓰는 표 ----------
   STREETS: 대본의 street 이름 → 세트 만들기. 세트는 sun(해가 오는 쪽, 아침 동쪽)도 알려 준다
   SKIES: 분위기(env)마다 하늘빛 [위, 가운데, 아래]과 안개 색 */
export const STREETS = { gate: gateSquare, field: fieldSet, home: homeSet, alley: alleySet, palace: palaceSet };
export const SKIES = {
  day:      { sky: ['#8fb8da', '#d6e4ec', '#efe4cc'], fog: '#c8d2d6', sun: [30, 40, 18] },
  dawn:     { sky: ['#7d8fb8', '#e8c8b8', '#f6d8b0'], fog: '#d8c8bc', sun: [45, 14, -10] },
  dusk:     { sky: ['#5a6890', '#d89a78', '#f0b880'], fog: '#c8a088', sun: [-45, 10, 8] },
  calm:     { sky: ['#8aa8c8', '#e6d4bc', '#f2dcb8'], fog: '#d0c4b4', sun: [-30, 22, 10] },
  overcast: { sky: ['#9aa4ac', '#c4c8c8', '#d4d0c4'], fog: '#b8bcbc', sun: [10, 40, 10] },
  night:    { sky: ['#0e1630', '#26345a', '#3a4462'], fog: '#2a3450', sun: [-20, 30, 20] },
  dark:     { sky: ['#2a2830', '#4a4650', '#5a5458'], fog: '#3a383e', sun: [10, 30, 10] },
  storm:    { sky: ['#4a5560', '#7a8690', '#8a9298'], fog: '#6a747c', sun: [10, 40, 10] },
  glory:    { sky: ['#a8cce8', '#eef4f4', '#fff4dc'], fog: '#dce4e4', sun: [20, 45, 15] },
};


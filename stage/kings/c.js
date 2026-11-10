/* 열왕기 여정 대본 묶음 c: k23–k31 (stage/kings.js가 합친다)
   엘리사의 이적에서 북왕국의 끝까지. 엘리사는 엘리야의 겉옷을 입은 elishaM, 마지막 병상(k30)에서는 흰 머리의 elishaO.
   하나님은 모습 없이 빛(beam)으로만 — 도단의 불말과 불병거(firehost)도 빛과 불꽃으로.
   죽음과 폭력은 그리지 않는다: 수넴의 아이는 누운 채 고요히, 요람과 이세벨은 쓰러짐 없이 사라지고, 아달랴는 끌려 나가는 데까지,
   비웃던 장관은 그리지 않으며, 사마리아의 함락은 무너진 성벽과 사슬에 묶여 걸어가는 행렬로만 */
import './props-c.js';

// 무리(crowd)의 자리: 가운데를 둘러 n명을 흩어 놓는다 (a.js와 같다)
const flock = (n, rx, rz, seed = 1) => Array.from({ length: n }, (_, i) => {
  const a = i * 2.399 + seed, r = Math.sqrt((i + 0.5) / n);
  return [Math.cos(a) * r * rx, Math.sin(a) * r * rz];
});

export const C = {
  /* k23. 수넴 여인의 아들 — 왼쪽은 지붕 위에 작은 방을 들인 집(roomhouse), 오른쪽은 추수하는 밭. 해 질 녘 오른쪽 길로 엘리사와 게하시가 지나고,
     여인이 붙들어 빵을 내민다. 지붕 방에 등잔이 켜지고, 이듬해 여인의 품에 아기. 자란 아이가 밭의 아버지에게 갔다가 머리를 감싸 쥐고,
     어머니 무릎에서 고요히 눕는다(숨이 멎은 모습은 누운 채 움직임 없이). 지붕 방 침상에 누이고 갈멜로 달려가 엘리사를 데려온다.
     엘리사가 침상 곁에 엎드려 기도하자 빛이 내리고, 아이가 일어나 앉는다 */
  k23: {
    env: 'dusk',
    wide: 1.3,
    props: {
      grass: ['grass', 0.3, 0.1, { r: 2.0, color: '#a8a070' }],
      field: ['field', 1.55, -0.55, { w: 1.3, d: 0.6 }],
      house: ['roomhouse', -0.75, -0.45],
      olive: ['olive', 0.5, -0.85, { scale: 0.8 }],
      beam: ['beam', -0.5, -0.62, { r: 0.3, h: 2.2 }],
    },
    cast: {
      elisha: ['elishaM', 2.2, 0.35, -1, { speed: 0.5 }],
      gehazi: ['gehazi', 2.55, 0.45, -1, { speed: 0.5 }],
      woman: ['shunammite', -0.95, 0.12, 0.8, { speed: 0.6 }],
      hus: ['shunamhus', -1.4, 0.2, 0.6, { speed: 0.45 }],
      up: ['elishaM', -0.35, -0.2, -0.6, { speed: 0.4 }], // 지붕 방의 엘리사
      boy: ['shunamboy', -0.7, 0.25, 1, { speed: 0.6 }],
      lap: ['shunamboy', -0.6, 0.3, 1], // 어머니 무릎에 누운 아이
      bed: ['shunamboy', -0.42, -0.67, 1], // 지붕 방 침상의 아이
      reap1: ['man', 1.2, -0.35, -0.4, { gaze: false }],
      reap2: ['shepherd', 1.85, -0.5, -0.6, { gaze: false }],
    },
    beats: {
      enter: [['@env', 'dusk'], ['house', 'lit'], ['beam', null, { show: 1 }], ['elisha', 'idle', { show: 0 }], ['gehazi', 'idle', { show: 0 }], ['lap', 'idle', { show: 0 }], ['boy', 'idle', { show: 0 }],
        ['up', 'pray', { x: -0.62, z: -0.45, look: 1 }], ['bed', 'sit', { look: -1 }], ['woman', 'kneel', { x: -0.5, z: 0.25, look: -0.4 }], ['hus', 'idle', { show: 0 }]],
      // 해 질 녘, 길 위의 나그네
      intro: [['@env', 'dusk'], ['house', 'idle'], ['beam', null, { show: 0 }], ['up', 'idle', { show: 0 }], ['boy', 'idle', { show: 0 }], ['lap', 'sleep', { show: 0 }], ['bed', 'sleep', { show: 0 }],
        ['woman', 'idle', { look: 0.8 }], ['hus', 'idle', { look: 0.6 }], ['reap1', 'bow'], ['reap2', 'bow']],
      'p0.0': [['elisha', 'idle', { x: 0.75, z: 0.3, look: -1 }], ['gehazi', 'idle', { x: 1.1, z: 0.42, look: -1 }]],
      // 여인이 붙들어 빵을 내민다
      'p0.2': [['elisha', 'idle', { x: 0.55, z: 0.28, look: -1 }], ['gehazi', 'idle', { x: 0.9, z: 0.4, look: -1 }], ['woman', 'speak', { x: 0.1, z: 0.25, item: 'bread', to: 'elisha' }],
        ['woman', 'idle', { item: null, delay: 3200 }], ['elisha', 'idle', { item: 'bread', delay: 3200 }]],
      // 여인이 남편에게 — 지붕 위에 작은 방을
      'p0.3': [['woman', 'idle', { x: -0.95, z: 0.2, look: -1 }], ['elisha', 'idle', { item: null }]],
      'p0.4': [['woman', 'speak', { to: 'hus' }]],
      'p0.5': [['woman', 'point', { look: 0.3 }], ['house', 'lit', { delay: 1500 }], ['hus', 'idle', { look: 0.5 }]],
      // 게하시가 귀띔한다 — 엘리사와 게하시는 지붕 방에
      'p1.0': [['house', 'lit'], ['elisha', 'idle', { show: 0 }], ['gehazi', 'speak', { x: -0.05, z: -0.05, to: 'up' }], ['up', 'listen', { show: 1 }], ['woman', 'idle', { look: 0.8 }], ['hus', 'idle', { x: 1.0, z: -0.1, look: 1 }]],
      // 문가에 선 여인에게 — 내년 이맘때
      'p1.2': [['gehazi', 'idle', { look: -1 }], ['woman', 'idle', { x: -0.55, z: 0.12, look: 0.6 }], ['up', 'speak', { to: 'woman' }]],
      'p1.4': [['up', 'idle'], ['woman', 'afraid', { look: 0.6 }]],
      'p1.5': [['woman', 'speak', { to: 'up' }]],
      // 이듬해 그때 — 품에 아기
      'p1.6': [['up', 'idle', { show: 0 }], ['gehazi', 'idle', { show: 0 }], ['woman', 'carry', { item: 'baby', x: -0.75, z: 0.2, look: 0.4 }], ['house', 'idle']],
      // 아이가 자라 밭의 아버지에게 — 내 머리야
      'p2.0': [['woman', 'idle', { item: null, look: 0.5 }], ['hus', 'bow', { x: 1.05, z: -0.15, look: 1 }], ['boy', 'idle', { show: 1, x: 0.75, z: -0.05, look: 1 }]],
      'p2.1': [['boy', 'cower', { look: 1 }], ['hus', 'idle', { look: -1 }]],
      // 어머니 무릎에서 — 낮까지, 그리고 고요히
      'p2.2': [['boy', 'idle', { x: -0.45, z: 0.3, look: -1 }], ['boy', 'idle', { show: 0, delay: 2600 }], ['woman', 'sit-ground', { x: -0.85, z: 0.28, look: 1, delay: 1200 }],
        ['lap', 'sleep', { show: 1, delay: 2600 }], ['hus', 'idle', { look: -1 }]],
      // 선지자의 침상에 누이고 갈멜로 달려간다
      'p2.3': [['lap', 'sleep', { show: 0 }], ['bed', 'sleep', { show: 1 }], ['woman', 'idle', { x: 2.4, z: 0.4 }], ['woman', 'idle', { show: 0, delay: 3800 }],
        ['woman', 'idle', { show: 1, x: 0.2, z: 0.35, look: -1, delay: 5200 }], ['elisha', 'idle', { show: 1, x: 2.5, z: 0.3, look: -1, delay: 3000 }], ['elisha', 'idle', { x: 0.55, z: 0.3, delay: 3200 }]],
      // 엘리사가 방에 들어가 문을 닫고 — 침상 곁에 엎드려 기도한다
      'p2.4': [['woman', 'kneel', { x: 0.0, z: 0.35, look: -1 }], ['elisha', 'idle', { show: 0 }], ['up', 'pray', { show: 1, x: -0.62, z: -0.46, look: 1 }], ['house', 'lit'], ['beam', null, { show: 1, delay: 1800 }]],
      // 일곱 번 재채기하고 눈을 떴다
      'p2.5': [['bed', 'sit', { look: -1 }], ['up', 'kneel', { look: 1 }], ['beam', null, { show: 0.6 }]],
      w0: [['up', 'speak', { show: 1, x: -0.35, z: -0.2, to: 'woman' }], ['woman', 'idle', { show: 1, x: -0.55, z: 0.12, look: 0.6 }]],
      w1: [['woman', 'speak', { show: 1, x: -0.2, z: 0.25, to: 'up' }], ['up', 'idle', { show: 1, x: -0.62, z: -0.46, look: 1 }]],
      w2: [['bed', 'sit', { show: 1, look: -1 }], ['up', 'speak', { show: 1, x: -0.35, z: -0.2, to: 'woman' }], ['woman', 'kneel', { show: 1, x: -0.5, z: 0.25, look: -0.4 }]],
      end: [['house', 'lit'], ['beam', null, { show: 0.6 }], ['bed', 'sit', { show: 1, look: -1 }], ['up', 'kneel', { show: 1, x: -0.62, z: -0.46, look: 1 }], ['woman', 'kneel', { show: 1, x: -0.5, z: 0.25, look: -0.4 }]],
    },
  },

  /* k24. 나아만의 일곱 번 — 왼쪽은 엘리사의 집, 오른쪽은 앞뒤로 흐르는 요단. 처음엔 아람 집의 여주인과 이스라엘 소녀가 말하고,
     나아만이 병거를 몰고 와 집 앞에 선다. 게하시가 나와 말을 전하자 노하여 돌아서고, 종들이 달랜다.
     흰 속옷(naamanH)으로 물에 들어가 일곱 번 잠겼다 나오고, 깨끗해져 엘리사에게 돌아온다 (맨몸은 그리지 않는다) */
  k24: {
    env: 'day',
    wide: 1.35,
    props: {
      grass: ['grass', -0.6, 0.1, { r: 1.7, color: '#9a9a6a' }],
      river: ['river', -0.2, -0.1, { w: 0.62, len: 2.6 }], // 지도의 요단 줄기 위에,
      house: ['house', -1.3, -0.7, { scale: 0.7 }],
      palm: ['palm', 0.9, -0.55, { scale: 0.7 }],
      car: ['kchariot', -3.0, 0.4, { speed: 1.0 }],
      gifts: ['tribute', -2.3, 0.65, { kind: 'gold' }],
    },
    cast: {
      naaman: ['naaman', 0, 0, 1, { board: 'car' }],
      foot: ['naaman', -1.0, 0.12, 0.6, { speed: 0.5 }], // 병거에서 내린 나아만
      bath: ['naamanH', -0.45, 0.2, 1, { speed: 0.4 }], // 흰 속옷으로 물에 들어가는 나아만
      wife: ['arameanW', -0.95, 0.35, 0.9],
      maid: ['maid', -0.55, 0.4, -0.9],
      gehazi: ['gehazi', -1.3, -0.3, 0.3, { speed: 0.45 }],
      elisha: ['elishaM', -1.1, -0.25, 0.3, { speed: 0.45 }],
      sv1: ['aramean2', -2.3, 0.15, 1, { speed: 0.5 }],
      sv2: ['aramean', -2.55, 0.45, 1, { speed: 0.5, gaze: false }],
    },
    beats: {
      enter: [['car', null, { show: 1, x: -1.75, z: 0.42 }], ['naaman', 'idle', { show: 0 }], ['foot', 'idle', { show: 0 }], ['wife', 'idle', { show: 0 }], ['maid', 'idle', { show: 0 }],
        ['river', 'stir'], ['bath', 'raise', { x: -0.2, z: 0.05, y: -0.25, look: -0.6 }], ['sv1', 'idle', { x: -0.6, z: 0.3, look: 1 }], ['sv2', 'idle', { x: -0.75, z: 0.5, look: 1 }]],
      // 아람 집 — 여주인과 이스라엘 소녀
      intro: [['@env', 'day'], ['river', 'flow'], ['car', null, { show: 0 }], ['gifts', null, { show: 0 }], ['naaman', 'idle', { show: 1, look: 1 }], ['foot', 'idle', { show: 0 }], ['bath', 'idle', { show: 0 }],
        ['gehazi', 'idle', { show: 0 }], ['elisha', 'idle', { show: 0 }], ['sv1', 'idle', { show: 0 }], ['sv2', 'idle', { show: 0 }], ['wife', 'idle', { look: 0.9 }], ['maid', 'idle', { look: -0.9 }]],
      'p0.1': [['maid', 'bow', { look: -0.9 }]],
      'p0.2': [['maid', 'speak', { to: 'wife' }]],
      'p0.4': [['maid', 'speak', { to: 'wife' }], ['wife', 'listen']],
      // 말과 병거, 은과 금을 싣고 — 엘리사의 집 문 앞
      'p1.0': [['wife', 'idle', { show: 0 }], ['maid', 'idle', { show: 0 }], ['car', null, { show: 1, x: -1.75, z: 0.42 }], ['sv1', 'idle', { show: 1, x: -2.3, z: 0.1, look: 1, delay: 600 }], ['sv2', 'idle', { show: 1, x: -2.55, z: 0.5, look: 1, delay: 600 }],
        ['gifts', null, { show: 1, delay: 2600 }]],
      // 엘리사는 나오지 않고 심부름꾼을 보낸다
      'p1.1': [['naaman', 'idle', { show: 0 }], ['foot', 'idle', { show: 1, look: 0.6 }], ['gehazi', 'idle', { show: 1, x: -1.1, z: -0.12, look: 0.4 }]],
      'p1.2': [['gehazi', 'speak', { to: 'foot' }]],
      // 노하여 돌아선다
      'p1.3': [['gehazi', 'idle'], ['foot', 'rebuke', { look: 0.6 }]],
      'p1.4': [['foot', 'speak', { x: -1.25, z: 0.3, look: -1, to: 'sv1' }], ['gehazi', 'idle', { x: -1.3, z: -0.3 }], ['gehazi', 'idle', { show: 0, delay: 1600 }]],
      'p1.5': [['foot', 'rebuke', { look: -1 }]],
      // 종들이 달랜다
      'p2.0': [['foot', 'idle', { look: -1 }], ['sv1', 'speak', { x: -1.6, z: 0.2, to: 'foot' }], ['sv2', 'bow', { x: -1.55, z: 0.55, look: 1 }]],
      'p2.1': [['sv1', 'speak', { to: 'foot' }]],
      // 요단으로 내려가 — 흰 속옷으로 물에 들어가 일곱 번 잠긴다
      'p2.2': [['sv1', 'idle', { x: -0.62, z: 0.35, look: 1 }], ['sv2', 'idle', { x: -0.8, z: 0.58, look: 1 }], ['foot', 'idle', { x: -0.45, z: 0.2 }], ['foot', 'idle', { show: 0, delay: 2600 }],
        ['bath', 'idle', { show: 1, delay: 2600 }], ['bath', 'idle', { x: -0.2, z: 0.05, delay: 3400 }], ['river', 'stir', { delay: 4800 }],
        ...[0, 1, 2, 3, 4, 5, 6].flatMap(i => [['bath', 'pray', { y: -0.95, delay: 5200 + i * 1500 }], ['bath', 'pray', { y: -0.3, delay: 5900 + i * 1500 }]])],
      // 일곱 번째 물에서 일어서자 — 어린아이 살처럼
      'p2.3': [['bath', 'raise', { y: -0.25, look: -0.6 }], ['river', 'stir'], ['sv1', 'bow'], ['sv2', 'bow']],
      // 엘리사에게 돌아와
      'p2.4': [['river', 'flow'], ['bath', 'idle', { y: 0, x: -0.45, z: 0.2 }], ['bath', 'idle', { show: 0, delay: 2200 }], ['foot', 'idle', { x: -0.7, z: 0.15, delay: 2000 }], ['foot', 'idle', { show: 1, delay: 2400 }],
        ['elisha', 'idle', { show: 1, x: -1.1, z: -0.02, look: 0.6 }], ['sv1', 'idle', { x: -0.4, z: 0.45, look: -1 }], ['sv2', 'idle', { x: -0.55, z: 0.62, look: -1 }]],
      'p2.5': [['foot', 'kneel', { look: -1 }]],
      'p2.6': [['foot', 'speak', { to: 'elisha' }]],
      w0: [['gehazi', 'speak', { show: 1, x: -1.1, z: -0.12, to: 'foot' }], ['foot', 'idle', { show: 1, x: -1.0, z: 0.12, look: 0.6 }], ['car', null, { show: 1, x: -1.75, z: 0.42 }], ['naaman', 'idle', { show: 0 }]],
      w1: [['foot', 'kneel', { show: 1, x: -0.7, z: 0.15, look: -1 }], ['foot', 'speak', { to: 'elisha', delay: 300 }], ['elisha', 'idle', { show: 1, x: -1.1, z: -0.02, look: 0.6 }]],
      w2: [['maid', 'speak', { show: 1, to: 'wife' }], ['wife', 'listen', { show: 1 }]],
      w3: [['elisha', 'speak', { show: 1, x: -1.1, z: -0.02, to: 'foot' }], ['foot', 'idle', { show: 1, x: -0.7, z: 0.15, look: -1 }], ['gifts', null, { show: 1 }]],
      end: [['@env', 'day'], ['river', 'flow'], ['bath', 'idle', { show: 0 }], ['foot', 'kneel', { show: 1, x: -0.7, z: 0.15, look: -1 }], ['elisha', 'bless', { show: 1, x: -1.1, z: -0.02, look: 0.6 }]],
    },
  },

  /* k25. 떠오른 도끼 — 오른쪽 요단, 강가의 나무들. 왼쪽에서 엘리사와 제자들이 와 나무를 찍는다(axe 소품이 손 앞에서 휘둘린다).
     한 제자의 도끼날이 빠져 물에 잠기고(물결), 엘리사가 나뭇가지를 던지자 쇠도끼가 떠올라 제자가 건져 올린다 */
  k25: {
    env: 'day',
    wide: 1.3,
    props: {
      grass: ['grass', -0.4, 0.05, { r: 1.8, color: '#8f9a5e' }],
      river: ['river', -0.2, -0.1, { w: 0.62, len: 2.6 }], // 지도의 요단 줄기 위에,
      t1: ['olive', -0.66, -0.42, { scale: 0.55 }],
      t2: ['oak', -1.75, -0.8, { scale: 0.55 }],
      t3: ['olive', -1.05, -1.0, { scale: 0.55 }],
      logs: ['cedarlogs', -2.05, -0.3, { scale: 0.7 }],
      axe1: ['axe', -0.84, -0.27, { y: 0.4, scale: 1.3 }],
      axe2: ['axe', -1.5, -0.5, { y: 0.4, side: -1, scale: 1.3 }],
      head: ['axehead', -0.2, -0.1],
    },
    cast: {
      elisha: ['elishaM', -2.6, 0.35, 1, { speed: 0.5 }],
      son1: ['prophetson', -2.2, 0.2, 1, { speed: 0.5 }],
      son2: ['prophetson2', -2.35, 0.55, 1, { speed: 0.5 }],
      son3: ['prophetson', -2.8, 0.15, 1, { speed: 0.5, gaze: false }],
    },
    beats: {
      enter: [['son1', 'bow', { x: -0.62, z: -0.02, look: 1 }], ['axe1', 'empty'], ['head', 'float'], ['elisha', 'point', { x: -0.95, z: 0.25, look: 1 }],
        ['son2', 'idle', { x: -1.35, z: -0.48, look: 1 }], ['axe2', 'idle'], ['son3', 'idle', { x: -1.3, z: 0.4, look: 1 }]],
      // 좁은 집을 두고 의논한다
      intro: [['@env', 'day'], ['axe1', 'idle'], ['axe2', 'idle'], ['head', 'sink'], ['river', 'flow'], ['elisha', 'idle', { look: 1 }], ['son1', 'idle', { look: -1 }], ['son2', 'idle', { look: -1 }], ['son3', 'idle', { look: 1 }]],
      'p0.0': [['son1', 'speak', { to: 'elisha' }]],
      'p0.2': [['son1', 'point', { look: 1 }]],
      'p0.3': [['elisha', 'speak', { to: 'son1' }], ['son2', 'speak', { to: 'elisha', delay: 1800 }], ['elisha', 'idle', { delay: 1800 }]],
      // 엘리사도 따라나선다 — 요단 강가 숲
      'p0.5': [['son2', 'idle'], ['elisha', 'idle', { x: -1.2, z: 0.3, look: 1 }], ['son1', 'idle', { x: -0.98, z: -0.27, look: 1 }], ['son2', 'idle', { x: -1.36, z: -0.5, look: -1 }], ['son3', 'idle', { x: -1.8, z: -0.1, look: -1 }]],
      // 도끼 소리
      'p0.6': [['axe1', 'chop'], ['axe2', 'chop', { delay: 500 }], ['son1', 'bow', { look: 1 }], ['son2', 'bow', { look: -1 }], ['son3', 'bow', { x: -1.85, z: -0.12, look: -1 }]],
      // 쇠도끼 날이 빠져 물속으로
      'p1.0': [['axe1', 'empty'], ['river', 'stir', { delay: 400 }], ['son1', 'afraid', { look: 1 }]],
      'p1.1': [['axe2', 'idle'], ['son2', 'idle', { look: 1 }], ['son3', 'idle', { look: 1 }], ['son1', 'idle', { x: -0.68, z: -0.05, look: -1 }]],
      'p1.2': [['river', 'flow'], ['son1', 'speak', { to: 'elisha' }], ['elisha', 'idle', { x: -1.0, z: 0.25, look: 1 }]],
      'p1.3': [['son1', 'shrug']],
      'p1.4': [['son1', 'mourn', { look: 1 }]],
      // 어디에 떨어졌느냐
      'p2.1': [['son1', 'idle', { look: -1 }], ['elisha', 'speak', { to: 'son1' }]],
      'p2.2': [['elisha', 'idle'], ['son1', 'point', { look: 1 }]],
      // 나뭇가지를 베어 던진다
      'p2.3': [['son1', 'idle', { look: 1 }], ['elisha', 'bow', { x: -0.66, z: 0.15, look: 1 }], ['elisha', 'hurl', { look: 1, delay: 2000 }]],
      // 쇠도끼가 떠올랐다
      'p2.4': [['head', 'float'], ['elisha', 'idle', { look: 1 }], ['son2', 'afraid', { x: -1.05, z: -0.3, look: 1 }], ['son3', 'raise', { x: -1.15, z: 0.02, look: 1 }]],
      'p2.6': [['elisha', 'speak', { to: 'son1' }]],
      // 손을 뻗어 건져 올린다
      'p2.7': [['elisha', 'idle'], ['son1', 'bow', { x: -0.62, z: -0.02, look: 1 }], ['head', 'held', { x: -0.72, z: 0.1, delay: 1600 }], ['son1', 'raise', { look: -1, delay: 2600 }]],
      w0: [['elisha', 'speak', { x: -1.0, z: 0.25, to: 'son1' }], ['son1', 'idle', { x: -0.68, z: -0.05, look: -1 }]],
      w1: [['head', 'float'], ['elisha', 'speak', { x: -0.66, z: 0.15, to: 'son1' }]],
      w2: [['son1', 'speak', { x: -0.68, z: -0.05, to: 'elisha' }], ['axe1', 'empty']],
      end: [['head', 'held', { x: -0.72, z: 0.1 }], ['son1', 'raise', { x: -0.62, z: -0.02, look: -1 }], ['elisha', 'bless', { look: 1 }]],
    },
  },

  /* k26. 도단을 둘러싼 불말과 불병거 — 가운데 언덕 위의 작은 성 도단. 왼쪽 앞에서 아람 왕이 신하에게 묻고,
     밤에 아람 군사와 병거가 언덕을 에워싼다. 새벽에 사환이 놀라고, 엘리사의 기도에 산을 둘러 불말과 불병거(firehost)가 빛난다.
     군사들의 눈이 어두워지고(haze — 머리 높이의 잿빛 안개), 엘리사가 그들을 이끌고 사마리아(왼쪽 아래)로 간다 */
  k26: {
    env: 'day',
    wide: 1.35,
    props: {
      hill: ['hill', 0.1, -0.4, { w: 1.15, h: 0.32, d: 0.6, color: '#9a8a6e' }],
      town: ['kwall', 0.1, -0.72, { scale: 0.55, w: 1.8, y: 0.2 }],
      host: ['firehost', 0.1, -0.3, { n: 11, r: 1.95 }],
      ch1: ['chariotI', -1.7, -0.5, { scale: 0.8, speed: 0.6 }],
      ch2: ['chariotI', 1.9, -0.4, { scale: 0.8, speed: 0.6, rot: Math.PI }],
      hazeL: ['haze', -1.25, 0.2, { w: 0.9, d: 0.5 }],
      hazeR: ['haze', 1.35, 0.2, { w: 0.9, d: 0.5 }],
      beam: ['beam', -0.05, -0.4, { r: 0.28, h: 2.2 }],
    },
    cast: {
      elisha: ['elishaM', -0.05, -0.42, 0.4, { speed: 0.45 }],
      boy: ['gehazi', 0.3, -0.3, -0.4, { speed: 0.5 }], // 엘리사의 사환
      king: ['aramK', -1.85, 0.45, 0.9],
      adv: ['aramean2', -1.45, 0.5, -0.9],
      a1: ['aramean', -2.3, 0.15, 1, { speed: 0.4, gaze: false }],
      a2: ['aramean2', -2.4, 0.4, 0.8, { speed: 0.4, gaze: false }],
      a3: ['aramean', 2.4, 0.4, -0.8, { speed: 0.4, gaze: false }],
      a4: ['aramean2', 2.3, 0.1, -1, { speed: 0.4, gaze: false }],
      a5: ['aramean', -2.5, -0.2, 2.8, { speed: 0.4, gaze: false }],
    },
    beats: {
      enter: [['@env', 'dawn'], ['host', null, { show: 1 }], ['king', 'idle', { show: 0 }], ['adv', 'idle', { show: 0 }], ['elisha', 'raise', { look: 0.2 }], ['boy', 'look-up', { look: 0.5 }]],
      // 아람 왕과 신하 — 누가 내통하느냐
      intro: [['@env', 'day'], ['host', null, { show: 0 }], ['hazeL', 'off'], ['hazeR', 'off'], ['beam', null, { show: 0 }], ['ch1', null, { show: 0 }], ['ch2', null, { show: 0 }],
        ...['a1', 'a2', 'a3', 'a4', 'a5'].map(n => [n, 'idle', { show: 0 }]), ['king', 'idle', { look: 0.9 }], ['adv', 'idle', { look: -0.9 }], ['elisha', 'idle', { look: 0.4 }], ['boy', 'idle', { look: -0.4 }]],
      'p0.1': [['king', 'speak', { to: 'adv' }]],
      'p0.3': [['king', 'idle'], ['adv', 'bow']],
      'p0.4': [['adv', 'speak', { to: 'king' }]],
      'p0.5': [['adv', 'point', { look: 1 }]],
      // 밤에 말과 병거와 큰 군대가 성을 에워싼다
      'p1.0': [['@env', 'night'], ['king', 'idle', { show: 0 }], ['adv', 'idle', { show: 0 }], ['elisha', 'sleep', { look: 1 }], ['boy', 'sleep', { look: -1 }],
        ['ch1', null, { show: 1, x: -1.25, z: -0.35 }], ['ch2', null, { show: 1, x: 1.5, z: -0.3 }],
        ['a1', 'idle', { show: 1, x: -1.15, z: 0.05, look: 0.6 }], ['a2', 'idle', { show: 1, x: -1.35, z: 0.38, look: 0.6 }], ['a3', 'idle', { show: 1, x: 1.3, z: 0.38, look: -0.6 }],
        ['a4', 'idle', { show: 1, x: 1.2, z: 0.02, look: -0.6 }], ['a5', 'idle', { show: 1, x: -0.95, z: -0.3, look: 0.6 }]],
      // 새벽, 사환이 소리친다
      'p1.1': [['@env', 'dawn'], ['elisha', 'idle', { look: 0.4 }], ['boy', 'afraid', { x: 0.35, z: -0.18, look: 0.3 }]],
      'p1.2': [['boy', 'speak', { to: 'elisha' }]],
      'p1.3': [['boy', 'afraid', { look: -0.4 }], ['elisha', 'speak', { to: 'boy' }]],
      // 엘리사가 기도한다
      'p1.6': [['elisha', 'pray', { look: 0.2 }], ['beam', null, { show: 1 }]],
      // 눈이 열리자 — 산에 불말과 불병거가 가득
      'p2.0': [['beam', null, { show: 0 }], ['host', null, { show: 1 }], ['elisha', 'idle', { look: 0.4 }], ['boy', 'look-up', { look: 0.4 }]],
      // 아람 군사들의 눈이 어두워진다
      'p2.1': [['elisha', 'pray'], ['hazeL', 'on'], ['hazeR', 'on'], ['a1', 'shrug', { delay: 800 }], ['a2', 'afraid', { delay: 1000 }], ['a3', 'shrug', { delay: 900 }], ['a4', 'afraid', { delay: 1100 }], ['a5', 'shrug', { delay: 700 }]],
      // 사마리아로 이끌고 간다
      'p2.2': [['elisha', 'idle', { x: -0.7, z: 0.5 }], ['elisha', 'idle', { x: -2.4, z: 0.6, delay: 2600 }],
        ...[['a1', -1.1, 0.35], ['a2', -0.85, 0.6], ['a3', -0.5, 0.45], ['a4', -0.2, 0.6], ['a5', -0.35, 0.3]].flatMap(([n, x, z], i) => [[n, 'idle', { x, z, delay: 2200 + i * 200 }], [n, 'idle', { x: x - 1.5, z, delay: 4600 + i * 200 }], [n, 'idle', { show: 0, delay: 7800 + i * 200 }]]),
        ['elisha', 'idle', { show: 0, delay: 7400 }], ['hazeL', 'off', { delay: 6000 }], ['hazeR', 'off', { delay: 6000 }], ['ch1', null, { x: -2.6, z: -0.2, delay: 3500 }], ['ch1', null, { show: 0, delay: 7000 }], ['ch2', null, { show: 0, delay: 3500 }]],
      // 나의 도움은 — 산을 둘러보는 사환
      'p2.3': [['@env', 'day'], ['boy', 'idle', { x: 0.1, z: -0.3, look: 0.2 }], ['host', null, { show: 0.8 }]],
      'p2.4': [['boy', 'look-up', { look: 0 }]],
      w0: [['elisha', 'speak', { show: 1, x: -0.05, z: -0.42, to: 'boy' }], ['boy', 'afraid', { show: 1, x: 0.35, z: -0.18, look: -0.4 }]],
      w1: [['elisha', 'pray', { show: 1, x: -0.05, z: -0.42, look: 0.2 }], ['beam', null, { show: 1 }]],
      w2: [['elisha', 'speak', { show: 1, x: -0.05, z: -0.42, to: 'boy' }], ['host', null, { show: 1 }]],
      end: [['@env', 'dawn'], ['host', null, { show: 1 }], ['elisha', 'raise', { show: 1, x: -0.05, z: -0.42, look: 0.2 }], ['boy', 'look-up', { show: 1, x: 0.3, z: -0.3, look: 0.4 }]],
    },
  },

  /* k27. 성문 밖 네 나병 환자 — 뒤로 사마리아 성벽과 성문(kwall), 성 둘레에 포위의 흙 언덕과 연기. 성문 앞에서 엘리사가 말하고 왕의 장관이 비웃는다.
     성문 어귀의 네 사람이 일어나 오른쪽 아람 진영(camp)으로 — 어스름에 텅 빈 장막, 먹을 것과 금. 문득 멈추어 성으로 돌아가 알린다.
     백성(crowd)이 쏟아져 나가고 밀가루 자루가 성문에 놓인다. 장관이 밟혀 죽는 것은 그리지 않는다 (앞서 성 안으로 들어가 다시 나오지 않는다) */
  k27: {
    env: 'overcast',
    wide: 1.35,
    props: {
      wall: ['kwall', -0.7, -0.75, { w: 2.4, state: 'siege' }],
      camp: ['camp', 1.65, -0.45, { n: 6, span: 1.3, color: '#b89868', flag: '#7a6a2e', scale: 1.4 }],
      food: ['provisions', 1.45, -0.1, { kind: 'food' }],
      gold: ['tribute', 1.95, 0.05, { kind: 'gold', scale: 0.7 }],
      flour: ['tribute', -0.3, -0.25, { kind: 'spice', scale: 0.8 }],
      folk: ['crowd', -0.75, -0.3, { spots: flock(10, 0.5, 0.2, 3), face: Math.PI / 2, speed: 0.4 }],
    },
    cast: {
      elisha: ['elishaM', -0.55, -0.05, 0.6, { speed: 0.45 }],
      officer: ['obadiah', 0.0, 0.0, -0.8, { speed: 0.45 }], // 왕의 장관
      l1: ['leper', -1.55, 0.3, 0.6, { speed: 0.35, pose: 'sit-ground' }],
      l2: ['leper', -1.25, 0.45, 0.3, { speed: 0.35, pose: 'sit-ground' }],
      l3: ['leper', -1.85, 0.5, 0.8, { speed: 0.35, pose: 'sit-ground' }],
      l4: ['leper', -1.5, 0.65, 0.2, { speed: 0.35, pose: 'sit-ground' }],
      ar1: ['aramean', 1.3, 0.2, -1, { speed: 0.5, gaze: false }],
      ar2: ['aramean2', 2.05, 0.3, -1, { speed: 0.5, gaze: false }],
    },
    beats: {
      enter: [['@env', 'dusk'], ['wall', 'stand'], ['elisha', 'idle', { show: 0 }], ['officer', 'idle', { show: 0 }], ['ar1', 'idle', { show: 0 }], ['ar2', 'idle', { show: 0 }], ['folk', null, { show: 0 }], ['flour', null, { show: 0 }],
        ['l1', 'sit-ground', { x: 1.25, z: 0.05, look: 0.8 }], ['l2', 'speak', { x: 1.6, z: 0.25, look: -0.8 }], ['l3', 'sit-ground', { x: 1.75, z: -0.05, look: -0.8 }], ['l4', 'idle', { x: 1.0, z: 0.3, look: -1 }]],
      // 포위된 성 — 엘리사와 왕의 장관
      intro: [['@env', 'overcast'], ['wall', 'siege'], ['food', null, { show: 1 }], ['folk', null, { show: 0 }], ['flour', null, { show: 0 }], ['elisha', 'idle', { look: 0.6 }], ['officer', 'idle', { look: -0.8 }],
        ...['l1', 'l2', 'l3', 'l4'].map(n => [n, 'sit-ground']), ['ar1', 'idle', { look: -1 }], ['ar2', 'idle', { look: -1 }]],
      'p0.1': [['elisha', 'speak', { to: 'officer' }]],
      'p0.4': [['elisha', 'idle'], ['officer', 'shrug', { look: -0.8 }]],
      'p0.5': [['officer', 'speak', { to: 'elisha' }]],
      'p0.6': [['officer', 'idle'], ['elisha', 'speak', { to: 'officer' }]],
      // 성문 어귀에 나병 환자 넷 — 장관과 엘리사는 성 안으로
      'p1.0': [['elisha', 'idle', { x: -0.7, z: -0.5 }], ['officer', 'idle', { x: -0.7, z: -0.5, delay: 400 }], ['elisha', 'idle', { show: 0, delay: 1800 }], ['officer', 'idle', { show: 0, delay: 2200 }]],
      'p1.1': [['l2', 'sit-speak', { to: 'l1' }]],
      'p1.3': [['l2', 'speak', { to: 'l1' }], ['l1', 'idle', { delay: 400 }], ['l3', 'idle', { delay: 700 }], ['l4', 'idle', { delay: 1000 }]],
      // 살려 주면 살고 — 진영으로 간다
      'p1.4': [['l2', 'idle', { x: 0.2, z: 0.35 }], ['l1', 'idle', { x: -0.05, z: 0.25 }], ['l3', 'idle', { x: -0.2, z: 0.45 }], ['l4', 'idle', { x: -0.3, z: 0.3 }],
        ['ar1', 'idle', { x: 2.6, z: 0.1, delay: 400 }], ['ar2', 'idle', { x: 2.8, z: 0.2, delay: 200 }], ['ar1', 'idle', { show: 0, delay: 2600 }], ['ar2', 'idle', { show: 0, delay: 2400 }]],
      // 어스름 녘 — 텅 빈 진영
      'p1.5': [['@env', 'dusk'], ['ar1', 'idle', { show: 0 }], ['ar2', 'idle', { show: 0 }], ['l2', 'afraid', { x: 1.15, z: 0.25, look: 1 }], ['l1', 'idle', { x: 1.0, z: 0.05, look: 1 }], ['l3', 'idle', { x: 0.8, z: 0.4, look: 1 }], ['l4', 'idle', { x: 0.75, z: 0.15, look: 1 }]],
      'p1.6': [['l2', 'look-up', { look: 0.8 }]],
      // 먹고 마시며 은과 금을 감추다가
      'p2.0': [['l1', 'sit-ground', { x: 1.3, z: 0.02, look: 0.6 }], ['l2', 'sit-ground', { x: 1.62, z: 0.2, look: -0.8 }], ['l3', 'bow', { x: 1.9, z: 0.22, look: 1 }], ['l4', 'idle', { x: 1.05, z: 0.3, look: 1, item: 'gift' }]],
      'p2.1': [['l3', 'idle', { look: -1 }], ['l4', 'idle', { item: null }], ['l2', 'sit-speak', { to: 'l1' }]],
      'p2.2': [['l2', 'speak', { to: 'l1' }], ['l1', 'idle', { delay: 300 }]],
      'p2.3': [['l2', 'speak', { look: -1 }]],
      // 소식을 들은 백성이 진영으로 — 밀가루 한 스아가 한 세겔에
      'p2.4': [['@env', 'day'], ['l2', 'point', { x: 0.15, z: 0.25, look: -1 }], ['l1', 'idle', { x: -0.05, z: 0.4 }], ['l3', 'idle', { x: 0.35, z: 0.45 }], ['l4', 'idle', { x: 0.4, z: 0.2 }],
        ['wall', 'stand'], ['folk', null, { show: 1, delay: 1200 }], ['folk', null, { x: 1.4, z: -0.05, delay: 2200 }], ['flour', null, { show: 1, delay: 3200 }]],
      'p2.5': [['l2', 'idle', { look: 1 }]],
      w0: [['elisha', 'speak', { show: 1, x: -0.55, z: -0.05, to: 'officer' }], ['officer', 'idle', { show: 1, x: 0.0, z: 0.0, look: -0.8 }]],
      w1: [['l2', 'speak', { to: 'l1' }]],
      w2: [['elisha', 'speak', { show: 1, x: -0.55, z: -0.05, to: 'officer' }], ['officer', 'shrug', { show: 1, x: 0.0, z: 0.0, look: -0.8 }]],
      end: [['@env', 'day'], ['wall', 'stand'], ['folk', null, { show: 1, x: 1.4, z: -0.05 }], ['flour', null, { show: 1 }], ['l2', 'idle', { x: 0.15, z: 0.25, look: 1 }]],
    },
  },

  /* k28. 예후의 질주 — 왼쪽은 길르앗 라못의 진영과 장수들, 오른쪽은 이스르엘 성문(gatetower — 망대의 파수꾼, 문 위 다락방의 창).
     젊은 선지자가 예후에게 기름을 붓고 달아나고, 장수들이 뿔나팔을 분다. 예후가 병거로 오른쪽으로 내달리고, 요람 왕이 병거로 나온다.
     화살은 그리지 않는다 — 요람은 병거 위에서 쓰러짐 없이 사라지고 병거만 달아난다. 이세벨은 문 위 창가에 섰다가, 내시들이 곁에 선 뒤 사라진다 */
  k28: {
    env: 'day',
    wide: 1.4,
    props: {
      grass: ['grass', -1.6, 0.0, { r: 1.0, color: '#9a9a6a' }],
      camp: ['camp', -1.75, -0.6, { n: 4, span: 0.9, color: '#8a7a62', flag: '#2a5a5e' }],
      gate: ['gatetower', 1.35, -0.6, { w: 1.9 }],
      car: ['kchariot', -1.0, 0.3, { speed: 1.4 }],
      car2: ['kchariot', 1.55, -0.1, { speed: 0.9, rot: Math.PI }],
    },
    cast: {
      jehu: ['jehu', -1.4, 0.2, 1, { speed: 0.5 }],
      rider: ['jehu', 0, 0, 1, { board: 'car' }], // 병거를 모는 예후
      joram: ['joramK', 0, 0, 1, { board: 'car2' }],
      young: ['prophetson2', -2.6, 0.5, 1, { speed: 0.75 }],
      c1: ['israelK', -1.9, 0.0, 0.6, { pose: 'sit-ground', gaze: false }],
      c2: ['israelK', -2.1, 0.35, 0.8, { pose: 'sit-ground', gaze: false }],
      c3: ['ahabA', -1.65, 0.5, 0.4, { pose: 'sit-ground', gaze: false }],
      watch: ['israelK', 1.79, -0.58, 1, { y: 1.0, gaze: false }],
      jezebel: ['jezebel', 1.3, -0.62, 0.3, { y: 0.82 }],
      eu1: ['eunuch', 1.55, -0.64, -0.6, { y: 0.82, gaze: false }],
      eu2: ['eunuch', 1.08, -0.64, 0.6, { y: 0.82, gaze: false }],
    },
    beats: {
      enter: [['jehu', 'idle', { show: 0 }], ['young', 'idle', { show: 0 }], ['car', null, { x: 0.55, z: 0.25 }], ['car2', null, { show: 0 }], ['joram', 'idle', { show: 0 }],
        ['rider', 'point', { look: 1 }], ['jezebel', 'speak', { to: 'rider' }], ['eu1', 'idle', { show: 0 }], ['eu2', 'idle', { show: 0 }]],
      // 엘리사의 심부름 — 기름병을 든 젊은 선지자가 온다
      intro: [['@env', 'day'], ['car', null, { show: 1 }], ['car2', null, { show: 0 }], ['rider', 'idle', { show: 0, look: 1 }], ['joram', 'idle', { show: 0, look: 1 }], ['jezebel', 'idle', { show: 0 }], ['eu1', 'idle', { show: 0 }], ['eu2', 'idle', { show: 0 }],
        ['young', 'idle', { item: 'oilhorn' }], ['jehu', 'sit-ground', { look: -0.6 }], ['watch', 'idle', { look: -1 }]],
      'p0.3': [['young', 'idle', { x: -1.75, z: 0.3, look: 1 }], ['jehu', 'idle', { x: -1.3, z: 0.25, look: -1, delay: 1500 }]],
      'p0.4': [['young', 'anoint', { look: 1 }]],
      'p0.5': [['young', 'speak', { to: 'jehu', item: null }], ['jehu', 'bow']],
      // 문을 열고 달아났다
      'p0.6': [['young', 'idle', { x: -2.7, z: 0.6 }], ['young', 'idle', { show: 0, delay: 1800 }], ['jehu', 'idle', { look: -1 }]],
      // 장수들이 나팔을 불며 — 예후가 왕이다
      'p1.0': [['c1', 'raise', { item: 'horn' }], ['c2', 'raise'], ['c3', 'raise', { item: 'horn' }], ['jehu', 'idle', { look: -0.6 }]],
      // 병거를 몰아 이스르엘로
      'p1.2': [['c1', 'idle', { item: null }], ['c3', 'idle', { item: null }], ['jehu', 'idle', { x: -1.0, z: 0.3 }], ['jehu', 'idle', { show: 0, delay: 1200 }], ['rider', 'idle', { show: 1, look: 1, delay: 1000 }],
        ['car', null, { x: -0.1, z: 0.25, delay: 1800 }]],
      // 망대의 파수꾼
      'p1.3': [['watch', 'point', { look: -1 }], ['car', null, { x: -0.1, z: 0.25 }], ['jehu', 'idle', { show: 0 }], ['rider', 'idle', { show: 1 }]],
      // 요람 왕이 병거로 나와 — 평안이냐
      'p1.5': [['watch', 'idle'], ['car2', null, { show: 1 }], ['joram', 'idle', { show: 1, look: 1 }], ['car2', null, { x: 0.85, z: 0.3, delay: 400 }]],
      'p1.6': [['joram', 'speak', { to: 'rider' }]],
      'p1.7': [['joram', 'idle']],
      'p1.8': [['rider', 'rebuke', { to: 'joram' }]],
      // 화살은 그리지 않는다 — 요람은 사라지고 빈 병거가 달아난다
      'p1.9': [['rider', 'idle'], ['joram', 'idle', { show: 0 }], ['car2', null, { x: 2.6, z: 0.5, delay: 900 }], ['car2', null, { show: 0, delay: 3200 }]],
      // 창가의 이세벨
      'p2.0': [['car2', null, { show: 0 }], ['joram', 'idle', { show: 0 }], ['jezebel', 'idle', { show: 1, look: 0.3 }], ['car', null, { x: 0.65, z: 0.25 }]],
      'p2.1': [['jezebel', 'speak', { to: 'rider' }]],
      'p2.3': [['jezebel', 'idle'], ['rider', 'point', { look: 1 }]],
      'p2.4': [['rider', 'speak', { look: 1 }], ['eu1', 'idle', { show: 1, delay: 600 }], ['eu2', 'idle', { show: 1, delay: 900 }]],
      // 내던짐은 그리지 않는다 — 창가에서 사라진다
      'p2.5': [['rider', 'idle'], ['@env', 'dusk'], ['jezebel', 'idle', { show: 0 }], ['eu1', 'bow', { delay: 800 }], ['eu2', 'bow', { delay: 800 }]],
      'p2.6': [['rider', 'idle', { look: -1 }]],
      w0: [['young', 'anoint', { show: 1, x: -1.75, z: 0.3, look: 1, item: 'oilhorn' }], ['jehu', 'bow', { show: 1, x: -1.3, z: 0.25, look: -1 }]],
      w1: [['young', 'idle', { show: 1, x: -1.75, z: 0.3, look: 1, item: 'oilhorn' }]],
      w2: [['car', null, { x: -0.1, z: 0.25 }], ['jehu', 'idle', { show: 0 }], ['rider', 'rebuke', { show: 1, to: 'joram' }], ['car2', null, { show: 1, x: 0.85, z: 0.3 }], ['joram', 'idle', { show: 1 }]],
      w3: [['car2', null, { show: 0 }], ['joram', 'idle', { show: 0 }], ['jezebel', 'idle', { show: 0 }], ['car', null, { x: 0.65, z: 0.25 }], ['rider', 'speak', { show: 1, look: 1 }]],
      end: [['@env', 'dusk'], ['car2', null, { show: 0 }], ['joram', 'idle', { show: 0 }], ['jezebel', 'idle', { show: 0 }], ['car', null, { x: 0.65, z: 0.25 }], ['rider', 'idle', { show: 1, look: 1 }]],
    },
  },

  /* k29. 성전에 숨긴 아이 요아스 — 오른쪽 솔로몬의 성전(stemple), 왼쪽 왕궁. 어두운 날 아달랴가 왕궁 앞에 서고(죽이는 모습은 그리지 않는다),
     여호세바가 젖먹이를 안고 유모와 성전으로 몰래 간다. 여섯 해 뒤 성전 뜰의 아이(joashY), 백부장들이 방패를 받아 좌우에 늘어서고,
     여호야다가 관을 씌우고 기름을 붓는다(joashboy로 바꿔 낀다). 함성에 아달랴가 들어와 외치고, 호위병 둘이 그를 데리고 나간다(끌려 나감만).
     멀리 바알의 신당에 먼지(연기), 아이가 상아 보좌에 앉는다 */
  k29: {
    env: 'day',
    wide: 1.4,
    props: {
      temple: ['stemple', 0.75, -0.55, { scale: 0.8, sea: false }],
      palace: ['tallhouse', -1.75, -0.6, { scale: 0.75, wall: '#e2d6bc' }],
      throne: ['ivorythrone', -1.0, -0.25],
      folk: ['crowd', 0.6, 0.55, { spots: flock(9, 0.6, 0.15, 5), face: Math.PI }],
      dust: ['smoke', -2.4, -1.0, { state: 'off', color: '#9a8a74', rise: 1.2 }],
    },
    cast: {
      athaliah: ['athaliah', -1.45, -0.15, 0.6, { speed: 0.4 }],
      sheba: ['jehosheba', -1.35, 0.15, 1, { speed: 0.5 }],
      nurse: ['woman2', -1.65, 0.25, 1, { speed: 0.5, gaze: false }],
      jehoiada: ['jehoiada', 0.75, -0.2, -0.6, { speed: 0.45 }],
      boy: ['joashY', 0.98, -0.2, -0.6, { speed: 0.4 }],
      king: ['joashboy', 0.98, -0.2, 0.2, { speed: 0.4 }],
      g1: ['guardJ', -0.2, 0.3, 1, { speed: 0.5, gaze: false }],
      g2: ['guardJ', -0.35, 0.05, 1, { speed: 0.5, gaze: false }],
      g3: ['guardJ', -0.55, 0.4, 1, { speed: 0.5, gaze: false }],
      g4: ['guardJ', -0.7, 0.15, 1, { speed: 0.5, gaze: false }],
    },
    beats: {
      enter: [['sheba', 'idle', { show: 0 }], ['nurse', 'idle', { show: 0 }], ['boy', 'idle', { show: 0 }], ['athaliah', 'idle', { show: 0 }], ['king', 'idle', { x: 0.98, z: -0.15, look: 0.2 }], ['jehoiada', 'bless', { look: 0.6 }],
        ['g1', 'idle', { item: 'shield', x: 0.0, z: 0.0, look: 1 }], ['g2', 'idle', { item: 'shield', x: 0.0, z: -0.3, look: 1 }], ['g3', 'idle', { item: 'shield', x: 1.75, z: 0.0, look: -1 }], ['g4', 'idle', { item: 'shield', x: 1.75, z: -0.3, look: -1 }], ['folk', null, { show: 1 }]],
      // 칼날이 왕궁을 휩쓸던 날 — 왕궁 앞의 아달랴
      intro: [['@env', 'overcast'], ['dust', 'off'], ['boy', 'idle', { show: 0 }], ['king', 'idle', { show: 0 }], ['jehoiada', 'idle', { show: 0 }], ['folk', null, { show: 0 }], ...['g1', 'g2', 'g3', 'g4'].map(n => [n, 'idle', { show: 0 }]),
        ['athaliah', 'idle', { look: 0.6 }], ['sheba', 'idle', { show: 0 }], ['nurse', 'idle', { show: 0 }]],
      'p0.0': [['athaliah', 'point', { look: 0.4 }]],
      // 여호세바가 젖먹이를 몰래 빼내 — 성전으로
      'p0.1': [['athaliah', 'idle', { look: -0.6 }], ['sheba', 'carry', { show: 1, item: 'baby', look: 1 }], ['nurse', 'idle', { show: 1 }],
        ['sheba', 'carry', { x: 0.55, z: 0.1, delay: 1200 }], ['nurse', 'idle', { x: 0.3, z: 0.2, delay: 1400 }], ['sheba', 'carry', { show: 0, delay: 6500 }], ['nurse', 'idle', { show: 0, delay: 6600 }]],
      // 여섯 해 동안 성전에 숨어 자란다
      'p0.2': [['sheba', 'carry', { show: 0 }], ['nurse', 'idle', { show: 0 }], ['jehoiada', 'idle', { show: 1, look: 0.6 }], ['boy', 'idle', { show: 1, look: -0.6 }], ['athaliah', 'idle', { look: 0.6 }]],
      // 일곱째 해 — 백부장들을 불러 맹세하게 하고 왕자를 보여 준다
      'p1.0': [['@env', 'day'], ['athaliah', 'idle', { show: 0 }], ...[['g1', 0.3, 0.3], ['g2', 0.1, 0.1], ['g3', 0.05, 0.4], ['g4', -0.15, 0.2]].map(([n, x, z]) => [n, 'idle', { show: 1, x, z, look: 1 }]),
        ['jehoiada', 'speak', { x: 0.75, z: -0.05, to: 'g1' }]],
      'p1.1': [['jehoiada', 'idle'], ...['g1', 'g2', 'g3', 'g4'].map((n, i) => [n, 'bow', { item: 'shield', delay: i * 300 }])],
      // 호위병들이 성전 좌우에 늘어선다
      'p1.2': [['g1', 'idle', { x: 0.0, z: 0.0, look: 1 }], ['g2', 'idle', { x: 0.0, z: -0.3, look: 1 }], ['g3', 'idle', { x: 1.75, z: 0.0, look: -1 }], ['g4', 'idle', { x: 1.75, z: -0.3, look: -1 }]],
      // 관을 씌우고 기름을 붓는다
      'p1.3': [['boy', 'idle', { x: 0.98, z: -0.15, look: 0.2 }], ['jehoiada', 'anoint', { item: 'oilhorn', look: 1 }], ['boy', 'idle', { show: 0, delay: 1800 }], ['king', 'idle', { show: 1, x: 0.98, z: -0.15, look: 0.2, delay: 1500 }]],
      // 손뼉을 치며 — 왕 만세
      'p1.4': [['boy', 'idle', { show: 0 }], ['king', 'idle', { show: 1 }], ['jehoiada', 'bless', { item: null, look: 0.6 }], ['folk', null, { show: 1 }]],
      // 함성을 들은 아달랴가 들어온다
      'p2.0': [['athaliah', 'idle', { show: 1 }], ['athaliah', 'idle', { x: 0.35, z: 0.25, delay: 400 }]],
      'p2.1': [['athaliah', 'rebuke', { look: 1 }]],
      'p2.2': [['athaliah', 'speak', { to: 'king' }]],
      'p2.3': [['athaliah', 'idle'], ['jehoiada', 'speak', { to: 'g1' }]],
      // 성전 안에서는 — 대열 밖으로 끌어낸다 (끌려 나감만)
      'p2.5': [['jehoiada', 'idle'], ['g1', 'idle', { x: 0.15, z: 0.38 }], ['g2', 'idle', { x: 0.15, z: 0.12 }],
        ['athaliah', 'idle', { x: -2.4, z: 0.3, delay: 1500 }], ['g1', 'idle', { x: -2.2, z: 0.45, delay: 1500 }], ['g2', 'idle', { x: -2.2, z: 0.15, delay: 1500 }],
        ['athaliah', 'idle', { show: 0, delay: 5500 }], ['g1', 'idle', { show: 0, delay: 5600 }], ['g2', 'idle', { show: 0, delay: 5600 }], ['dust', 'on', { delay: 4000 }]],
      // 일곱 살 요아스가 다윗의 보좌에
      'p2.6': [['athaliah', 'idle', { show: 0 }], ['g1', 'idle', { show: 0 }], ['g2', 'idle', { show: 0 }], ['king', 'idle', { x: -1.0, z: -0.28 }], ['king', 'sit', { y: 0.22, look: 0, delay: 4500 }],
        ['jehoiada', 'idle', { x: -0.55, z: -0.05, look: -1 }], ['g3', 'idle', { x: -1.45, z: 0.0, look: 1 }], ['g4', 'idle', { x: -0.55, z: 0.25, look: -1 }]],
      w0: [['jehoiada', 'speak', { show: 1, x: 0.75, z: -0.05, to: 'g1' }], ['athaliah', 'idle', { show: 1, x: 0.35, z: 0.25, look: 1 }]],
      w1: [['athaliah', 'speak', { show: 1, x: 0.35, z: 0.25, to: 'king' }], ['king', 'idle', { show: 1 }]],
      w2: [['folk', null, { show: 1 }], ['king', 'idle', { show: 1 }]],
      end: [['@env', 'day'], ['athaliah', 'idle', { show: 0 }], ['boy', 'idle', { show: 0 }], ['king', 'sit', { show: 1, x: -1.0, z: -0.28, y: 0.22, look: 0 }], ['jehoiada', 'bless', { show: 1, x: -0.55, z: -0.05, look: -1 }], ['folk', null, { show: 1 }]],
    },
  },

  /* k30. 엘리사의 마지막 화살 — 방 안(hall)의 침상에 누운 늙은 엘리사(elishaO), 오른쪽 옆벽에 동쪽 창(kwindow). 북이스라엘 왕 요아스가 와서 운다.
     왕이 활을 잡고, 엘리사가 일어나 왕의 손 위에 손을 얹는다. 창이 열리고 화살이 창밖으로 날아간다. 왕이 화살 다발로 땅을 세 번 치고 멈춘다(strike).
     엘리사는 침상에 누워 빛 속에서 고요히 사라진다 (주검과 무덤 이야기는 낭독만) */
  k30: {
    env: 'day',
    wide: 1.2,
    props: {
      hall: ['hall', -0.1, -0.05, { throne: false, w: 2.4, lamp: -1.0 }],
      win: ['kwindow', 1.1, -0.15, { d: 1.35 }],
      couch: ['couch', -0.45, -0.3],
      arrow: ['spear', 0.62, -0.15, { arrow: true, y: 0.58, speed: 3.5 }],
      strike: ['strike', 0.4, 0.12],
      beam: ['beam', -0.45, -0.3, { r: 0.35, h: 2.2 }],
    },
    cast: {
      elisha: ['elishaO', -0.45, -0.3, 1, { y: 0.15, pose: 'sleep', speed: 0.3 }],
      king: ['joashI', 0.6, 0.35, -1, { speed: 0.45 }],
      sv: ['servant', 0.95, 0.4, -1, { speed: 0.45, gaze: false }],
    },
    beats: {
      enter: [['elisha', 'bless', { y: 0, x: 0.12, z: -0.05, look: 1 }], ['king', 'shoot', { item: 'bow', x: 0.42, z: -0.15, look: 1 }], ['win', 'open'], ['strike', null, { show: 0 }], ['beam', null, { show: 0 }], ['sv', 'idle', { x: 0.9, z: 0.45, look: -1 }]],
      // 죽을병에 든 늙은 선지자 — 왕이 찾아와 운다
      intro: [['@env', 'day'], ['win', 'shut'], ['arrow', 'fly', { show: 0 }], ['strike', 'held', { show: 0 }], ['beam', null, { show: 0 }], ['elisha', 'sleep', { look: 1 }], ['king', 'idle', { look: -1 }], ['sv', 'idle', { look: -1 }]],
      'p0.1': [['king', 'mourn', { x: 0.05, z: -0.05, look: -1 }]],
      'p0.3': [['king', 'kneel', { look: -1 }]],
      'p0.4': [['king', 'speak', { to: 'elisha' }]],
      'p0.5': [['king', 'kneel']],
      // 활과 화살을 가져오십시오
      'p1.0': [['elisha', 'sit', { look: 1 }]],
      'p1.1': [['elisha', 'sit', { look: 1 }], ['king', 'idle', { look: -1 }], ['sv', 'idle', { x: 0.35, z: 0.2, look: -1, item: 'gift' }]],
      // 왕이 활을 잡자 — 엘리사가 손을 얹는다
      'p1.2': [['sv', 'idle', { item: null, x: 0.95, z: 0.45 }], ['king', 'idle', { item: 'bow', x: 0.42, z: -0.15, look: 1 }], ['elisha', 'idle', { y: 0, x: 0.12, z: -0.05, look: 1, delay: 400 }], ['elisha', 'bless', { delay: 2400 }]],
      // 동쪽 창을 열고 쏘십시오
      'p1.4': [['win', 'open'], ['elisha', 'point', { look: 1 }]],
      'p1.5': [['win', 'open'], ['king', 'shoot', { look: 1 }], ['arrow', 'fly', { show: 1, delay: 700 }], ['arrow', 'fly', { x: 3.2, z: -0.15, delay: 800 }], ['arrow', null, { show: 0, delay: 1700 }], ['elisha', 'raise', { delay: 1200 }]],
      'p1.6': [['king', 'idle', { look: 1 }], ['elisha', 'raise', { look: 1 }], ['arrow', null, { show: 0 }]],
      'p1.7': [['elisha', 'speak', { to: 'king' }]],
      // 화살을 집어 땅을 치십시오 — 세 번 치고 멈춘다
      'p2.0': [['elisha', 'idle']],
      'p2.1': [['elisha', 'speak', { to: 'king' }], ['king', 'kneel', { item: null, x: 0.28, z: 0.12, look: 1 }], ['strike', 'held', { show: 1, delay: 1000 }]],
      'p2.2': [['elisha', 'idle'], ['strike', 'strike']],
      'p2.3': [['elisha', 'rebuke', { look: 1 }]],
      'p2.4': [['elisha', 'speak', { to: 'king' }], ['strike', 'down']],
      'p2.5': [['king', 'bow', { look: -1 }]],
      // 엘리사는 죽어 묻혔다 — 침상의 빛 속에서 고요히 사라진다
      'p2.6': [['strike', null, { show: 0 }], ['elisha', 'idle', { x: -0.45, z: -0.3 }], ['elisha', 'sleep', { y: 0.15, look: 1, delay: 1800 }], ['beam', null, { show: 1, delay: 2000 }], ['elisha', 'sleep', { show: 0, delay: 3800 }],
        ['king', 'mourn', { x: 0.05, z: 0.0, look: -1, delay: 1500 }], ['sv', 'mourn', { delay: 1800 }]],
      'p2.7': [['elisha', 'sleep', { show: 0 }], ['beam', null, { show: 0.7 }]],
      w0: [['elisha', 'rebuke', { show: 1, y: 0, x: 0.12, z: -0.05, look: 1 }], ['king', 'kneel', { x: 0.28, z: 0.12, look: 1 }], ['strike', 'down', { show: 1 }]],
      w1: [['elisha', 'raise', { show: 1, y: 0, x: 0.12, z: -0.05, look: 1 }], ['win', 'open'], ['king', 'idle', { item: 'bow', x: 0.42, z: -0.15, look: 1 }]],
      w2: [['elisha', 'sleep', { show: 1, y: 0.15, x: -0.45, z: -0.3, look: 1 }], ['king', 'speak', { item: null, x: 0.05, z: -0.05, to: 'elisha' }]],
      end: [['elisha', 'sleep', { show: 0 }], ['beam', null, { show: 0.7 }], ['win', 'open'], ['strike', null, { show: 0 }], ['king', 'mourn', { x: 0.05, z: 0.0, look: -1 }]],
    },
  },

  /* k31. 사마리아 함락 — 뒤로 사마리아 성벽(kwall)과 성벽 위의 파수꾼, 둘레에 앗수르의 흙 언덕과 연기, 오른쪽에 앗수르 진영.
     호세아는 앗수르 군사 둘과 함께 진영 쪽으로 걸어가 사라진다(옥에 갇힘). 성벽 한 마디가 무너지고, 사로잡힌 사람들이 손목을 이은 사슬(chain)로
     오른쪽(북동쪽 먼 땅)으로 걸어간다 — 매질이나 쓰러짐 없이. 끝으로 쉬지 않고 보내신 선지자, 산당의 금송아지, 빈 성에 저무는 해 */
  k31: {
    env: 'overcast',
    wide: 1.4,
    props: {
      wall: ['kwall', -0.6, -0.75, { w: 2.6, state: 'siege' }],
      camp: ['camp', 1.75, -0.6, { n: 6, span: 1.3, color: '#3e4258', flag: '#9d3328' }],
      chain: ['chain', -0.35, 0.35, { n: 4, gap: 0.34, y: 0.4, speed: 0.22 }],
      hp: ['highplace', 1.0, -0.15, { calf: true, pole: false, r: 0.4, state: 'smoke', scale: 0.8 }],
    },
    cast: {
      watch: ['israelK', -1.35, -0.75, 0.2, { y: 0.7, gaze: false }],
      hoshea: ['hoshea', -0.6, -0.4, 0.6, { speed: 0.35 }],
      s1: ['assyrian', 0.6, 0.15, -1, { speed: 0.35, gaze: false }],
      s2: ['assyrian2', 0.95, 0.4, -1, { speed: 0.35, gaze: false }],
      s3: ['assyrian', 1.35, 0.0, -1, { speed: 0.35, gaze: false }],
      s4: ['assyrian2', -1.9, 0.2, 1, { speed: 0.35, gaze: false }],
      e1: ['exile', -0.35, 0.35, 1, { speed: 0.22, gaze: false }],
      e2: ['exileW', -0.69, 0.35, 1, { speed: 0.22, gaze: false }],
      e3: ['exile', -1.03, 0.35, 1, { speed: 0.22, gaze: false }],
      e4: ['exileW', -1.37, 0.35, 1, { speed: 0.22, gaze: false }],
      prophet: ['godman', -0.1, 0.25, 0.3, { speed: 0.4 }],
    },
    beats: {
      enter: [['wall', 'breach'], ['watch', 'idle', { show: 0 }], ['hoshea', 'idle', { show: 0 }], ['prophet', 'idle', { show: 0 }], ['hp', null, { show: 0 }],
        ...[['e1', 0.75], ['e2', 0.41], ['e3', 0.07], ['e4', -0.27]].map(([n, x]) => [n, 'idle', { x, z: 0.35, look: 1 }]), ['chain', null, { x: 0.75, z: 0.35 }], ['s1', 'idle', { x: 1.2, z: 0.3, look: 1 }]],
      // 세 해째 같은 풍경 — 성벽 위의 파수꾼과 성을 에워싼 앗수르 군대
      intro: [['@env', 'overcast'], ['wall', 'siege'], ['hp', null, { show: 0 }], ['prophet', 'idle', { show: 0 }], ['chain', null, { show: 0 }], ...['e1', 'e2', 'e3', 'e4'].map(n => [n, 'idle', { show: 0 }]),
        ['watch', 'idle', { look: 0.2 }], ['hoshea', 'idle', { show: 0 }]],
      'p0.1': [['watch', 'point', { look: 1 }], ['s1', 'idle', { look: -1 }]],
      // 마지막 왕 호세아 — 앗수르 군사와 함께 진영 쪽으로 사라진다 (옥에 갇힘)
      'p0.2': [['watch', 'idle'], ['hoshea', 'idle', { show: 1, x: -0.4, z: -0.1, look: 1 }], ['s1', 'idle', { x: 0.0, z: 0.05, look: -1, delay: 2000 }], ['s2', 'idle', { x: 0.05, z: 0.3, look: -1, delay: 2000 }],
        ['hoshea', 'idle', { x: 1.6, z: -0.1, delay: 4500 }], ['s1', 'idle', { x: 1.85, z: -0.25, delay: 4400 }], ['s2', 'idle', { x: 1.85, z: 0.1, delay: 4500 }],
        ['hoshea', 'idle', { show: 0, delay: 10500 }]],
      'p0.3': [['hoshea', 'idle', { show: 0 }], ['s1', 'idle', { x: 0.6, z: 0.15, look: -1 }], ['s2', 'idle', { x: 0.95, z: 0.4, look: -1 }], ['watch', 'idle', { look: 0.4 }]],
      // 마침내 사마리아가 무너졌다
      'p1.0': [['@env', 'dusk'], ['wall', 'breach'], ['watch', 'idle', { show: 0 }], ['s4', 'idle', { x: -0.9, z: 0.0, look: 1 }]],
      // 사로잡아 먼 땅으로 — 사슬에 묶인 행렬
      'p1.1': [['chain', null, { show: 1 }], ...['e1', 'e2', 'e3', 'e4'].map(n => [n, 'idle', { show: 1, look: 1 }]), ['s1', 'idle', { x: 0.2, z: 0.35, look: 1 }],
        ['s1', 'idle', { x: 2.6, z: 0.35, delay: 1600 }], ['chain', null, { x: 1.55, z: 0.35, delay: 1500 }],
        ...[['e1', 1.55], ['e2', 1.21], ['e3', 0.87], ['e4', 0.53]].map(([n, x]) => [n, 'idle', { x, z: 0.35, delay: 1500 }]), ['s2', 'idle', { x: 0.0, z: 0.65, look: 1 }], ['s2', 'idle', { x: 1.8, z: 0.65, delay: 2500 }]],
      // 할라와 하볼 강가와 메대의 성읍 — 더 멀리
      'p1.2': [['chain', null, { x: 2.7, z: 0.35 }], ...[['e1', 2.7], ['e2', 2.36], ['e3', 2.02], ['e4', 1.68]].map(([n, x]) => [n, 'idle', { x, z: 0.35 }])],
      // 북쪽 왕국은 그렇게 끝이 났다
      'p1.3': [['chain', null, { show: 0 }], ...['e1', 'e2', 'e3', 'e4', 's1', 's2'].map(n => [n, 'idle', { show: 0 }]), ['@env', 'dusk']],
      // 쉬지 않고 보내신 선지자
      'p2.0': [['chain', null, { show: 0 }], ...['e1', 'e2', 'e3', 'e4', 's1', 's2'].map(n => [n, 'idle', { show: 0 }]), ['prophet', 'idle', { show: 1, x: -0.1, z: 0.25, look: 0.3 }]],
      'p2.1': [['prophet', 'raise', { look: 0.3 }]],
      'p2.2': [['prophet', 'mourn', { look: 0.4 }]],
      // 여로보암의 금송아지와 바알 — 산당
      'p2.3': [['hp', null, { show: 1 }], ['prophet', 'idle', { look: 1 }]],
      // 내쫓으셨다 — 빈 성과 저무는 해
      'p2.4': [['@env', 'dusk'], ['prophet', 'idle', { show: 0 }], ['hp', null, { show: 0, delay: 2500 }], ['s3', 'idle', { show: 0 }], ['s4', 'idle', { show: 0 }]],
      w0: [['prophet', 'raise', { show: 1, x: -0.1, z: 0.25, look: 0.3 }]],
      w1: [['prophet', 'speak', { show: 1, x: -0.1, z: 0.25, look: 0.3 }], ['hp', null, { show: 1 }]],
      end: [['@env', 'dusk'], ['wall', 'breach'], ['prophet', 'idle', { show: 0 }], ['hp', null, { show: 0 }], ['chain', null, { show: 0 }], ...['e1', 'e2', 'e3', 'e4', 's1', 's2', 's3', 's4', 'hoshea', 'watch'].map(n => [n, 'idle', { show: 0 }])],
    },
  },
};

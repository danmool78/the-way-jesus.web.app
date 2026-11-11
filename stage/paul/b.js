/* 바울 여정 대본 묶음 b: a12–a21 (stage/paul.js가 합친다)
   예루살렘 회의에서 고린도의 갈리오 법정까지 — 둘째 선교 여행. 바울은 길에서 paul(지팡이), 앉거나 손에 든 것이 있으면 paulS, 옥에서 편지 쓰는 늙은 바울은 paulO.
   주님·성령은 모습 없이 빛(beam)과 목소리로만. 드로아의 환상은 꿈의 빛무리(dream) 속 빛의 실루엣. 빌립보의 매질은 그리지 않는다 — 관리들 앞에서 옥으로 끌려갈 뿐,
   간수가 칼을 빼어 드는 순간은 칼을 든 손을 들어 올린 모습까지만(자기를 해치는 모습 없음), 바울이 외치자 칼을 내린다. 소품은 props.js와 props-b.js */

// 무리의 자리: 가운데를 둘러 n명을 흩어 놓는다 (a.js와 같다)
const flock = (n, rx, rz, seed = 1) => Array.from({ length: n }, (_, i) => {
  const a = i * 2.399 + seed, r = Math.sqrt((i + 0.5) / n);
  return [Math.cos(a) * r * rx, Math.sin(a) * r * rz];
});
// 공의회 반원 의자의 자리 (council 소품 자리 cx, cz, 반지름 R, 각도 a — π가 왼끝, 1.5π가 뒤, 2π가 오른끝)
const seat = (cx, cz, a, R = 0.85) => [cx + Math.cos(a) * R, cz + 0.15 + Math.sin(a) * R * 0.82];
const look = ([x, z], [tx, tz]) => Math.atan2(tx - x, tz - z); // (x, z)에서 (tx, tz)를 보는 방향
const hide = (...ns) => ns.map(n => [n, null, { show: 0 }]);

// a12 예루살렘 공의회의 자리 — 안디옥 교회의 집(housechurch)과 같은 자리에 번갈아 선다
const CX = -0.35, CZ = -0.3;
const PE = seat(CX, CZ, Math.PI * 1.13), JO = seat(CX, CZ, Math.PI * 1.36), E1 = seat(CX, CZ, Math.PI * 1.64), E2 = seat(CX, CZ, Math.PI * 1.87);
const JA = [CX, CZ + 0.15 - 0.85 * 0.82 - 0.36]; // 뒤 가운데 높은 자리 — 회의를 이끄는 야고보
const MID = [CX, CZ + 0.15];
const JER = ['peter', 'john', 'e1', 'e2', 'james', 'judas', 'silas'];
// 안디옥 교회의 집 — 유대에서 온 사람들이 가르치고, 바울과 바나바가 맞선다
const antioch = [['@env', 'day'], ['hc', null, { show: 1 }], ['council', null, { show: 0 }], ['desk', 'idle', { show: 1 }], ...hide(...JER, 'scribe'),
  ['g1', 'sit-ground', { show: 1, x: -0.85, z: -0.2, look: 0.9 }], ['gw', 'sit-ground', { show: 1, x: -0.55, z: -0.5, look: 0.5 }], ['g2', 'idle', { show: 1, x: -1.3, z: 0.1, look: 1.0 }],
  ['t1', 'idle', { show: 1, x: -0.15, z: -0.05, look: -1.2, item: null }], ['t2', 'idle', { show: 1, x: 0.05, z: 0.25, look: -1.0 }],
  ['paul', 'idle', { show: 1, x: 0.65, z: 0.05, look: -1.2, item: null }], ['barnabas', 'idle', { show: 1, x: 0.9, z: 0.3, look: -1.3 }]];
// 예루살렘의 사도와 장로들 — 반원 돌 의자에 앉고, 바울과 바나바는 가운데, 할례를 주장하는 사람들은 오른쪽에 선다
const jerusalem = [['@env', 'day'], ['hc', null, { show: 0 }], ['council', null, { show: 1 }], ['desk', 'idle', { show: 0 }], ...hide('g1', 'gw', 'g2', 'scribe', 'judas', 'silas'),
  ['peter', 'sit', { show: 1, y: 0.12, x: PE[0], z: PE[1], look: look(PE, MID) }], ['john', 'sit', { show: 1, y: 0.12, x: JO[0], z: JO[1], look: look(JO, MID) }],
  ['e1', 'sit', { show: 1, y: 0.12, x: E1[0], z: E1[1], look: look(E1, MID) }], ['e2', 'sit', { show: 1, y: 0.12, x: E2[0], z: E2[1], look: look(E2, MID) }],
  ['james', 'sit', { show: 1, y: 0.22, x: JA[0], z: JA[1], look: 0 }],
  ['paul', 'idle', { show: 1, x: -0.2, z: 0.12, look: -0.6, item: null }], ['barnabas', 'idle', { show: 1, x: 0.12, z: 0.2, look: -0.9 }],
  ['t1', 'idle', { show: 1, x: 0.95, z: -0.25, look: -1.3 }], ['t2', 'idle', { show: 1, x: 1.15, z: 0.08, look: -1.4 }]];

// a17 빌립보 — 왼쪽은 장터와 관리들의 재판석, 오른쪽은 깊은 옥
const JX = 0.95, JZ = -0.35; // 옥(jail)의 자리
const IN1 = [JX - 0.3, JZ - 0.12], IN2 = [JX + 0.0, JZ - 0.12]; // 옥 안 족쇄에 앉은 바울과 실라

// a19 아테네 — 오른쪽 아레오바고 바위
const AX = 1.05, AZ = -0.2, AH = 0.24;

export const B = {
  /* a12. 무엇으로 구원을 받는가 — 처음은 수리아 안디옥 교회의 집(housechurch): 유대에서 내려온 사람들이 '할례를 받아야 구원받는다' 가르치고,
     바울과 바나바가 크게 다툰다. 오른쪽 앞 낮은 상(desk)에서 바울이 갈라디아 교회에 보낼 편지를 받아 적게 하고, 끝에 손수 큰 글씨를 써 넣는다(갈 6:11).
     예루살렘 — 같은 자리에 사도와 장로들의 반원 돌 의자(council)가 선다. 베드로가 일어나 말하고, 바나바와 바울이 이야기하고, 뒤 가운데 자리의 야고보가 일어나 말한다.
     유다와 실라가 편지(두루마리)를 받아 함께 떠나고, 다시 안디옥 — 유다가 편지를 읽자 교회가 기뻐한다 */
  a12: {
    env: 'day',
    wide: 1.45,
    props: {
      hc: ['housechurch', CX, CZ, { w: 2.2, table: false }],
      council: ['council', CX, CZ, { r: 0.85 }],
      desk: ['desk', 1.45, 0.45],
    },
    cast: {
      paul: ['paulS', 0.65, 0.05, -1.2],
      barnabas: ['barnabas', 0.9, 0.3, -1.3],
      t1: ['pharisee', -0.15, -0.05, -1.2],
      t2: ['jewD', 0.05, 0.25, -1.0],
      g1: ['greek', -0.85, -0.2, 0.9, { pose: 'sit-ground' }],
      gw: ['greekW', -0.55, -0.5, 0.5, { pose: 'sit-ground' }],
      g2: ['greek2', -1.3, 0.1, 1.0],
      scribe: ['townsman', 1.15, 0.47, 1.4, { pose: 'sit-ground', gaze: false }],
      peter: ['peter', PE[0], PE[1], look(PE, MID), { y: 0.12, pose: 'sit' }],
      john: ['john', JO[0], JO[1], look(JO, MID), { y: 0.12, pose: 'sit' }],
      e1: ['elder', E1[0], E1[1], look(E1, MID), { y: 0.12, pose: 'sit' }],
      e2: ['elderC', E2[0], E2[1], look(E2, MID), { y: 0.12, pose: 'sit' }],
      james: ['jamesL', JA[0], JA[1], 0, { y: 0.22, pose: 'sit' }],
      judas: ['hellenist', -1.85, 0.3, 1.2, { gaze: false }],
      silas: ['silas', -1.95, 0.0, 1.2, { gaze: false }],
    },
    beats: {
      // 예루살렘 회의 — 야고보가 말하고 모두 듣는다
      enter: [...jerusalem, ['james', 'speak', { y: 0, x: JA[0], z: JA[1] + 0.12, look: 0 }]],
      // 안디옥 — 유대에서 온 사람들이 가르친다
      intro: [...antioch, ['t1', 'speak', { to: 'g1' }]],
      'p0.0': [['t1', 'speak', { to: 'g1' }], ['g1', 'listen'], ['gw', 'listen']],
      'p0.2': [['t1', 'rebuke', { to: 'g1' }], ['t2', 'point', { look: -1.2 }], ['g1', 'sit-ground', { delay: 1200 }]],
      // 바울과 바나바가 크게 다툰다
      'p0.3': [['t1', 'idle', { look: 1.2 }], ['t2', 'idle', { look: 1.3 }], ['paul', 'speak', { x: 0.45, z: 0.0, to: 't1' }], ['barnabas', 'speak', { x: 0.7, z: 0.3, to: 't2', delay: 2000 }],
        ['t1', 'rebuke', { to: 'paul', delay: 2600 }], ['t2', 'shrug', { delay: 3000 }]],
      // 갈라디아의 교회들도 흔들린다
      'p0.4': [['paul', 'idle'], ['barnabas', 'idle'], ['t1', 'idle'], ['t2', 'idle'], ['g1', 'listen', { look: 1.3 }], ['gw', 'shrug'], ['g2', 'shrug', { delay: 600 }]],
      // 편지를 쓴다 — 오른쪽 앞 낮은 상에 앉아 받아 적게 한다
      'p0.5': [['paul', 'idle', { x: 1.5, z: 0.22, look: 0.2 }], ['paul', 'sit-ground', { look: 0.2, delay: 2600 }], ['scribe', 'sit-ground', { show: 1, delay: 1500 }],
        ['desk', 'write', { delay: 2800 }], ['barnabas', 'idle', { x: 0.85, z: -0.1, look: 1.3, delay: 600 }], ['gw', 'sit-ground'], ['g2', 'idle']],
      'p0.6': [['paul', 'sit-speak', { x: 1.5, z: 0.22, to: 'scribe' }], ['scribe', 'sit-ground', { show: 1 }], ['desk', 'write']],
      // 끝에 손수 큰 글씨를
      'p1.0': [['paul', 'sit', { x: 1.5, z: 0.22, look: 0.1 }], ['scribe', 'listen', { show: 1, look: 1.4 }], ['desk', 'big']],
      // 예루살렘으로 — 안디옥의 집은 걷히고 공의회가 선다
      'p1.1': [['scribe', 'listen', { show: 0 }], ['desk', 'big', { show: 0, delay: 600 }], ['hc', null, { show: 0, delay: 300 }], ...hide('g1', 'gw', 'g2'),
        ['t1', 'idle', { x: 0.95, z: -0.25, look: -1.3 }], ['t2', 'idle', { x: 1.15, z: 0.08, look: -1.4 }],
        ['paul', 'idle', { x: -0.2, z: 0.12, look: -0.6, delay: 400 }], ['barnabas', 'idle', { x: 0.12, z: 0.2, look: -0.9, delay: 300 }],
        ['council', null, { show: 1, delay: 1200 }], ['peter', 'sit', { show: 1, delay: 1600 }], ['john', 'sit', { show: 1, delay: 1800 }], ['e1', 'sit', { show: 1, delay: 2000 }],
        ['e2', 'sit', { show: 1, delay: 2200 }], ['james', 'sit', { show: 1, delay: 2400 }]],
      // 오랜 논쟁 끝에 — 베드로가 일어나 말한다
      'p1.2': [['t1', 'rebuke', { to: 'paul' }], ['t2', 'point', { look: -1.4, delay: 600 }], ['e2', 'sit-speak', { delay: 1200 }], ['t1', 'idle', { delay: 3200 }], ['t2', 'idle', { delay: 3200 }],
        ['e2', 'sit', { delay: 3400 }], ['peter', 'speak', { y: 0, x: PE[0] + 0.2, z: PE[1] + 0.3, to: 't1', delay: 3600 }]],
      'p1.3': [['peter', 'speak', { y: 0, x: PE[0] + 0.2, z: PE[1] + 0.3, to: 't1' }], ['t1', 'listen'], ['t2', 'listen'], ['e2', 'sit']],
      'p1.4': [['peter', 'raise', { look: 0.6 }]],
      // 바나바와 바울이 이방인 가운데서 하신 일을 이야기한다 — 무리가 잠잠히 듣는다
      'p2.0': [['peter', 'sit', { y: 0.12, x: PE[0], z: PE[1], look: look(PE, MID) }], ['barnabas', 'speak', { to: 'james' }], ['paul', 'speak', { to: 'e1', delay: 4000 }], ['barnabas', 'idle', { delay: 4000 }],
        ['t1', 'listen'], ['t2', 'listen'], ['john', 'listen', { y: 0.12 }]],
      // 주님의 동생 야고보가 일어나 말한다
      'p2.1': [['paul', 'idle', { look: -0.4 }], ['barnabas', 'idle'], ['john', 'sit'], ['james', 'speak', { y: 0, x: JA[0], z: JA[1] + 0.12, look: 0 }]],
      'p2.2': [['james', 'speak', { look: 0.4, to: 't1' }], ['t1', 'bow', { delay: 2500 }]],
      // 유다와 실라가 편지를 받아 두 사람과 함께 안디옥으로 간다 (오른쪽 뒤로 — 화면 가장자리 전에 사라진다)
      'p2.3': [['james', 'idle', { item: 'scroll' }], ['t1', 'idle'], ['judas', 'idle', { show: 1, x: -0.6, z: -0.42, look: -0.2 }], ['silas', 'idle', { show: 1, x: -0.25, z: -0.45, look: -0.3, delay: 300 }],
        ['james', 'idle', { item: null, delay: 2600 }], ['judas', 'idle', { item: 'scroll', delay: 2600 }],
        ['judas', 'idle', { x: 1.75, z: 0.45, delay: 3600 }], ['silas', 'idle', { x: 1.9, z: 0.2, delay: 3800 }], ['paul', 'idle', { x: 1.7, z: 0.0, delay: 3400 }], ['barnabas', 'idle', { x: 1.95, z: 0.6, delay: 3500 }],
        ['paul', 'idle', { show: 0, delay: 7400 }], ['barnabas', 'idle', { show: 0, delay: 7500 }], ['judas', 'idle', { show: 0, delay: 7700 }], ['silas', 'idle', { show: 0, delay: 7900 }]],
      // 다시 안디옥 — 유다가 편지를 읽자 교회가 크게 기뻐한다
      'p2.4': [['council', null, { show: 0 }], ['hc', null, { show: 1, delay: 500 }], ...hide('peter', 'john', 'e1', 'e2', 'james', 't1', 't2'),
        ['judas', 'speak', { show: 1, x: -0.3, z: -0.05, look: -0.6, item: 'scroll', to: 'g1', delay: 900 }], ['silas', 'idle', { show: 1, x: 0.0, z: -0.3, look: -0.5, delay: 900 }],
        ['paul', 'idle', { show: 1, x: 0.4, z: 0.15, look: -1.1, delay: 900 }], ['barnabas', 'idle', { show: 1, x: 0.7, z: 0.32, look: -1.2, delay: 900 }],
        ['g1', 'listen', { show: 1, x: -0.9, z: -0.15, look: 1.0, delay: 900 }], ['gw', 'listen', { show: 1, x: -0.65, z: 0.2, look: 1.2, delay: 900 }], ['g2', 'listen', { show: 1, x: -1.25, z: 0.25, look: 1.1, delay: 900 }],
        ['g1', 'raise', { delay: 4200 }], ['gw', 'pray', { delay: 4500 }], ['g2', 'raise', { delay: 4800 }]],
      // 말씀 — 갈라디아서를 쓰는 바울
      w0: [...antioch, ['t1', 'idle', { show: 0 }], ['t2', 'idle', { show: 0 }], ['desk', 'big'], ['scribe', 'listen', { show: 1 }],
        ['paul', 'sit-speak', { x: 1.5, z: 0.22, look: 0.2, to: 'scribe' }], ['barnabas', 'idle', { x: 0.85, z: -0.1, look: 1.3 }], ['g1', 'listen', { look: 1.3 }], ['gw', 'listen', { look: 1.1 }]],
      w1: [...jerusalem, ['peter', 'speak', { y: 0, x: PE[0] + 0.2, z: PE[1] + 0.3, to: 't1' }], ['t1', 'listen'], ['t2', 'listen']],
      w2: [...jerusalem, ['james', 'speak', { y: 0, x: JA[0], z: JA[1] + 0.12, look: 0.4, to: 't1' }], ['t1', 'bow']],
      end: [...jerusalem, ['james', 'speak', { y: 0, x: JA[0], z: JA[1] + 0.12, look: 0 }]],
    },
  },

  /* a13. 바나바와 갈라선 날 — 수리아 안디옥의 기둥 줄 큰 거리(colonnade)와 왼쪽 교회의 집. 바울이 바나바에게 다시 가자고 말하고, 바나바 곁에 마가가 선다.
     의견이 날카롭게 부딪쳐 두 사람이 등을 돌리고, 바나바와 마가는 왼쪽 앞(서남쪽 — 실루기아 항구와 구브로)으로 떠난다.
     실라가 오른쪽에서 오고, 형제들이 두 사람을 주님의 은혜에 맡긴다(빛). 바울과 실라는 왼쪽 뒤(서북쪽 — 길리기아)로.
     오랜 세월 뒤 — 해 질 녘 오른쪽 앞의 낮은 상에서 흰 머리의 바울이 디모데에게 '마가를 데리고 오너라' 쓴다(등잔) */
  a13: {
    env: 'day',
    wide: 1.4,
    props: {
      street: ['colonnade', 0.2, -0.78, { w: 4.2, n: 11, h: 0.78 }],
      home: ['house', -1.5, -0.4, { stair: false }],
      grace: ['beam', 0.55, 0.15, { r: 0.42, h: 2.4 }],
      desk: ['desk', 1.5, 0.55, { lamp: true }],
    },
    cast: {
      paul: ['paul', 0.35, 0.1, -1.1],
      barnabas: ['barnabas', -0.25, 0.1, 1.1],
      mark: ['mark', -0.55, 0.35, 1.0],
      silas: ['silas', 2.0, -0.25, -1.3],
      b1: ['greek', -1.0, -0.05, 0.6],
      b2: ['simeon', -1.25, 0.25, 0.8],
      b3: ['greekW', -0.8, 0.45, 0.8, { gaze: false }],
      old: ['paulOS', 1.55, 0.32, 0.1, { pose: 'sit-ground', gaze: false }],
    },
    beats: {
      // 갈라서는 순간 — 두 사람이 등을 돌린다
      enter: [['grace', null, { show: 0 }], ['desk', 'idle', { show: 0 }], ['old', 'sit-ground', { show: 0 }], ['silas', 'idle', { show: 0 }],
        ['paul', 'idle', { x: 0.75, z: 0.0, look: 1.3 }], ['barnabas', 'idle', { x: -0.4, z: 0.15, look: -1.1 }], ['mark', 'bow', { x: -0.65, z: 0.4, look: 0.6 }],
        ['b1', 'shrug', { look: 1.0 }], ['b2', 'idle', { look: 0.9 }]],
      // 안디옥에서 얼마 동안 지낸 뒤 — 바울이 바나바에게 말한다
      intro: [['@env', 'day'], ['grace', null, { show: 0 }], ['desk', 'idle', { show: 0 }], ['old', 'sit-ground', { show: 0 }], ['silas', 'idle', { show: 0 }], ['paul', 'speak', { to: 'barnabas' }]],
      'p0.1': [['paul', 'point', { look: -1.5 }], ['paul', 'speak', { to: 'barnabas', delay: 2500 }], ['barnabas', 'listen']],
      // 바나바는 마가를 데려가려 한다
      'p0.2': [['paul', 'idle'], ['mark', 'idle', { x: -0.4, z: 0.42, look: 1.0 }], ['barnabas', 'speak', { to: 'paul', delay: 900 }]],
      // 바울은 생각이 달랐다 — 버가에서 떠나간 일을 떠올린다
      'p1.0': [['barnabas', 'idle'], ['paul', 'shrug', { look: -1.0 }]],
      'p1.1': [['paul', 'speak', { to: 'barnabas' }], ['mark', 'bow', { look: 0.6 }]],
      // 날카롭게 부딪쳐 — 끝내 등을 돌린다
      'p1.2': [['barnabas', 'rebuke', { to: 'paul' }], ['paul', 'rebuke', { to: 'barnabas', delay: 1600 }], ['b1', 'shrug', { delay: 1200 }],
        ['barnabas', 'idle', { x: -0.4, z: 0.15, look: -1.1, delay: 3600 }], ['paul', 'idle', { x: 0.75, z: 0.0, look: 1.3, delay: 3800 }]],
      // 바나바는 마가를 데리고 배를 타러 — 왼쪽 앞(실루기아 항구)으로
      'p1.3': [['paul', 'idle', { x: 0.75, z: 0.0, look: 1.3 }], ['barnabas', 'idle', { x: -1.85, z: 0.65 }], ['mark', 'idle', { x: -1.95, z: 0.4, delay: 300 }],
        ['barnabas', 'idle', { show: 0, delay: 3600 }], ['mark', 'idle', { show: 0, delay: 3800 }], ['b1', 'idle', { look: -1.2 }], ['b2', 'idle', { look: -1.0, delay: 500 }]],
      // 바울은 실라를 고른다 — 실라가 오른쪽에서 온다
      'p2.0': [['barnabas', 'idle', { show: 0 }], ['mark', 'idle', { show: 0 }], ['silas', 'idle', { show: 1, x: 1.1, z: 0.12, look: -1.2 }], ['paul', 'idle', { look: 1.0 }],
        ['paul', 'speak', { to: 'silas', delay: 3000 }]],
      // 형제들이 두 사람을 주님의 은혜에 맡긴다 — 빛이 내리고, 바울과 실라는 왼쪽 뒤(길리기아)로 떠난다
      'p2.1': [['paul', 'kneel', { x: 0.45, z: 0.12, look: -0.6 }], ['silas', 'kneel', { x: 0.75, z: 0.22, look: -0.8, delay: 300 }], ['b1', 'bless', { x: -0.05, z: 0.0, look: 1.1 }],
        ['b2', 'bless', { x: -0.1, z: 0.35, look: 1.2, delay: 300 }], ['b3', 'pray', { x: -0.45, z: 0.4 }], ['grace', null, { show: 1, delay: 800 }],
        ['grace', null, { show: 0, delay: 6000 }], ['paul', 'idle', { x: -1.75, z: -0.42, delay: 6200 }], ['silas', 'idle', { x: -1.95, z: -0.3, delay: 6400 }],
        ['paul', 'idle', { show: 0, delay: 9800 }], ['silas', 'idle', { show: 0, delay: 10000 }], ['b1', 'idle', { delay: 6200 }], ['b2', 'raise', { delay: 6400 }]],
      // 오랜 세월 뒤 — 흰 머리의 바울이 등잔 곁에서 디모데에게 쓴다
      'p2.2': [['grace', null, { show: 0 }], ...hide('paul', 'silas', 'b1', 'b2', 'b3'), ['@env', 'dusk'], ['desk', 'write', { show: 1, delay: 800 }], ['old', 'sit-ground', { show: 1, delay: 800 }]],
      'p2.3': [['desk', 'write'], ['old', 'sit', { look: 0.1 }]],
      'p2.4': [['desk', 'done'], ['old', 'look-up', { look: -0.5 }]],
      w0: [['@env', 'day'], ['grace', null, { show: 0 }], ['desk', 'idle', { show: 0 }], ['old', 'sit-ground', { show: 0 }], ['silas', 'idle', { show: 0 }],
        ['paul', 'speak', { show: 1, x: 0.35, z: 0.1, to: 'barnabas' }], ['barnabas', 'listen', { show: 1, x: -0.25, z: 0.1, look: 1.1 }], ['mark', 'idle', { show: 1, x: -0.55, z: 0.35, look: 1.0 }],
        ['b1', 'idle', { show: 1, x: -1.0, z: -0.05, look: 0.6 }], ['b2', 'idle', { show: 1, x: -1.25, z: 0.25, look: 0.8 }], ['b3', 'idle', { show: 1, x: -0.8, z: 0.45, look: 0.8 }]],
      w1: [['grace', null, { show: 1 }], ['paul', 'kneel', { x: 0.45, z: 0.12, look: -0.6 }], ['silas', 'kneel', { show: 1, x: 0.75, z: 0.22, look: -0.8 }],
        ['barnabas', 'idle', { x: -1.85, z: 0.65 }], ['mark', 'idle', { x: -1.95, z: 0.4 }], ['barnabas', 'idle', { show: 0, delay: 3000 }], ['mark', 'idle', { show: 0, delay: 3200 }],
        ['b1', 'bless', { x: -0.05, z: 0.0, look: 1.1 }], ['b2', 'bless', { x: -0.1, z: 0.35, look: 1.2 }], ['b3', 'pray', { x: -0.45, z: 0.4 }]],
      w2: [['@env', 'dusk'], ['grace', null, { show: 0 }], ...hide('paul', 'silas', 'barnabas', 'mark', 'b1', 'b2', 'b3'), ['desk', 'write', { show: 1 }], ['old', 'sit-speak', { show: 1, look: 0.1 }]],
      end: [['@env', 'day'], ['grace', null, { show: 0 }], ['desk', 'idle', { show: 0 }], ['old', 'sit-ground', { show: 0 }], ['silas', 'idle', { show: 0 }],
        ['paul', 'idle', { show: 1, x: 0.75, z: 0.0, look: 1.3 }], ['barnabas', 'idle', { show: 1, x: -0.4, z: 0.15, look: -1.1 }], ['mark', 'bow', { show: 1, x: -0.65, z: 0.4, look: 0.6 }],
        ['b1', 'shrug', { show: 1, x: -1.0, z: -0.05, look: 1.0 }], ['b2', 'idle', { show: 1, x: -1.25, z: 0.25, look: 0.9 }], ['b3', 'idle', { show: 1, x: -0.8, z: 0.45, look: 0.8 }]],
    },
  },

  /* a14. 젊은 디모데 — 루스드라: 뒤 가운데 성문(gate), 오른쪽 뒤 바울이 돌에 맞았던 제우스 신전(gtemple), 왼쪽 디모데의 집(house, 문이 열리면 등불빛).
     바울과 실라가 오른쪽(동쪽 더베 쪽)에서 들어와 신전 쪽을 한 번 돌아본다. 디모데가 나와 맞고, 어머니 유니게와 할머니 로이스, 헬라 사람 아버지가 집 앞에 선다.
     형제들이 그를 좋게 말한다. 할례는 그리지 않는다 — 바울과 디모데가 집 안에 들어갔다 나올 뿐. 일행이 장로들에게 예루살렘의 결정을 전하고(두루마리),
     어머니와 할머니가 빛 속에서 기도하며 디모데를 떠나보낸다 — 세 사람은 왼쪽 앞 길로 */
  a14: {
    env: 'day',
    wide: 1.4,
    props: {
      gate: ['gate', 0.15, -0.88],
      temple: ['gtemple', 1.6, -0.65, { w: 1.0, d: 0.8, altar: [0.0, 0.62] }],
      home: ['house', -1.45, -0.55, { door: true, stair: false }],
      road: ['road', -1.2, 0.55, { len: 2.4, w: 0.36, rot: 0.12 }],
      folk: ['crowd', 0.1, 0.0, { spots: [[-0.2, -0.55], [0.15, -0.6], [0.45, -0.5], [-0.45, -0.45]], face: Math.PI * 0.95, state: 'stand' }],
      faith: ['beam', -0.95, 0.15, { r: 0.5, h: 2.4 }],
    },
    cast: {
      paul: ['paul', 1.95, 0.4, -1.3],
      silas: ['silas', 2.1, 0.12, -1.3],
      tim: ['timothy', -0.85, 0.12, 0.6],
      eunice: ['eunice', -1.15, 0.0, 0.7],
      lois: ['lois', -1.4, 0.25, 0.8],
      father: ['greek2', -1.6, -0.08, 0.7, { gaze: false }],
      e1: ['elderC', 0.15, 0.25, 0.9],
      e2: ['lycaonian', -0.1, 0.48, 1.0],
      j1: ['jewD', 0.55, -0.42, -0.6, { gaze: false }],
      j2: ['pharisee', 0.82, -0.4, -0.9, { gaze: false }],
    },
    beats: {
      // 어머니와 할머니의 믿음 — 바울이 디모데를 축복한다
      enter: [['faith', null, { show: 1 }], ['folk', 'stand', { show: 0 }], ['father', 'idle', { show: 0 }], ['j1', 'idle', { show: 0 }], ['j2', 'idle', { show: 0 }],
        ['paul', 'bless', { x: -0.4, z: 0.3, look: -1.2 }], ['silas', 'idle', { x: -0.1, z: 0.45, look: -1.3 }], ['tim', 'bow', { x: -0.8, z: 0.3, look: 1.2 }],
        ['eunice', 'pray', { x: -1.1, z: 0.05, look: 1.0 }], ['lois', 'pray', { x: -1.35, z: 0.3, look: 1.0 }]],
      // 더베를 지나 루스드라에 — 바울과 실라가 오른쪽에서 들어온다
      intro: [['@env', 'day'], ['home', 'idle'], ['faith', null, { show: 0 }], ['folk', 'stand', { show: 0 }], ['father', 'idle', { show: 0 }], ['tim', 'idle', { x: -1.3, z: -0.05, look: 0.4 }]],
      'p0.0': [['paul', 'idle', { x: 0.7, z: 0.3, look: -1.2 }], ['silas', 'idle', { x: 0.95, z: 0.5, look: -1.3, delay: 300 }]],
      // 몇 해 전 돌에 맞았던 그 성 — 바울이 신전 쪽을 돌아본다
      'p0.1': [['paul', 'idle', { x: 0.7, z: 0.3, look: 2.4 }], ['silas', 'idle', { look: 2.0, delay: 600 }]],
      // 디모데가 나와 맞는다
      'p0.2': [['paul', 'idle', { look: -1.2 }], ['silas', 'idle', { look: -1.3 }], ['tim', 'idle', { x: 0.2, z: 0.25, look: 1.3 }], ['tim', 'bow', { look: 1.3, delay: 3200 }], ['paul', 'bless', { to: 'tim', delay: 3400 }]],
      // 어머니는 믿는 유대 여인, 아버지는 헬라 사람
      'p0.3': [['tim', 'idle', { look: -1.2 }], ['paul', 'idle'], ['eunice', 'idle', { x: -0.5, z: 0.05, look: 1.2 }], ['lois', 'idle', { x: -0.75, z: 0.3, look: 1.2, delay: 400 }],
        ['father', 'idle', { show: 1, x: -1.25, z: -0.08, look: 0.9, delay: 600 }]],
      // 형제들이 모두 그를 좋게 말한다
      'p0.4': [['e1', 'speak', { to: 'paul' }], ['e2', 'point', { look: -1.0 }], ['e2', 'idle', { delay: 3000 }]],
      // 바울은 디모데를 데리고 가고 싶었다
      'p1.0': [['e1', 'idle'], ['paul', 'speak', { to: 'tim' }], ['tim', 'listen', { look: 1.3 }], ['eunice', 'pray', { delay: 1500 }]],
      // 그 지방 유대 사람들이 다 알고 있었다 — 성문 곁에서 수군거린다
      'p1.1': [['paul', 'idle'], ['j1', 'point', { look: -1.6 }], ['j2', 'speak', { to: 'j1', delay: 1500 }], ['tim', 'idle', { look: -0.8 }]],
      // 바울과 디모데가 집 안으로 들어간다 (할례는 그리지 않는다)
      'p1.2': [['j1', 'idle'], ['j2', 'idle'], ['home', 'open'], ['paul', 'idle', { x: -1.25, z: -0.1, look: -2.6 }], ['tim', 'idle', { x: -1.15, z: -0.08, look: -2.6, delay: 300 }],
        ['paul', 'idle', { show: 0, delay: 3600 }], ['tim', 'idle', { show: 0, delay: 3900 }], ['eunice', 'pray', { look: -1.6 }], ['lois', 'pray', { look: -1.6 }]],
      // 훗날 바울은 썼다 — 두 사람이 다시 나온다
      'p1.3': [['home', 'open'], ['paul', 'idle', { show: 1, x: -1.25, z: -0.1 }], ['tim', 'idle', { show: 1, x: -1.15, z: -0.08 }],
        ['paul', 'idle', { x: -0.1, z: 0.2, look: 1.2, delay: 600 }], ['tim', 'idle', { x: -0.35, z: 0.4, look: 1.0, delay: 800 }], ['eunice', 'idle', { look: 0.9 }], ['lois', 'idle', { look: 1.0 }]],
      'p1.4': [['home', 'idle'], ['paul', 'speak', { x: -0.1, z: 0.2, to: 'j1' }], ['j1', 'listen', { look: -1.8 }], ['j2', 'idle']],
      // 여러 성을 다니며 예루살렘의 결정을 전한다
      'p2.0': [['paul', 'speak', { item: 'scroll', look: 0.6, to: 'e1' }], ['silas', 'idle', { x: 0.75, z: 0.45, look: -1.1 }], ['e1', 'listen'], ['e2', 'listen'], ['j1', 'idle', { look: -1.0 }]],
      // 믿음이 굳어지고 날마다 수가 는다
      'p2.1': [['paul', 'idle', { item: null }], ['folk', 'stand', { show: 1 }], ['e1', 'raise'], ['e2', 'pray', { delay: 500 }]],
      // 아들처럼 아끼는 동역자
      'p2.2': [['e1', 'idle'], ['e2', 'idle'], ['paul', 'bless', { x: -0.4, z: 0.3, look: -1.2, to: 'tim' }], ['tim', 'bow', { x: -0.8, z: 0.3, look: 1.2 }], ['silas', 'idle', { x: -0.1, z: 0.45, look: -1.3 }]],
      // 할머니 로이스와 어머니 유니게의 믿음 — 빛 속에서 기도한다
      'p2.4': [['faith', null, { show: 1 }], ['eunice', 'pray', { x: -1.1, z: 0.05, look: 1.0 }], ['lois', 'pray', { x: -1.35, z: 0.3, look: 1.0 }], ['father', 'idle', { look: 1.0 }]],
      w0: [['faith', null, { show: 1 }], ['paul', 'speak', { show: 1, x: -0.4, z: 0.3, look: -1.2, item: null, to: 'tim' }], ['tim', 'listen', { show: 1, x: -0.8, z: 0.3, look: 1.2 }],
        ['eunice', 'pray', { x: -1.1, z: 0.05, look: 1.0 }], ['lois', 'pray', { x: -1.35, z: 0.3, look: 1.0 }]],
      w1: [['faith', null, { show: 0 }], ['paul', 'speak', { x: -0.1, z: 0.2, to: 'j1' }], ['j1', 'listen', { show: 1, look: -1.8 }], ['j2', 'idle', { show: 1 }], ['tim', 'idle', { x: -0.35, z: 0.4, look: 1.0 }]],
      w2: [['faith', null, { show: 0 }], ['paul', 'speak', { x: -0.4, z: 0.3, look: 1.2, to: 'e1' }], ['tim', 'idle', { x: -0.8, z: 0.3, look: 1.2 }], ['e1', 'listen'], ['e2', 'listen']],
      end: [['@env', 'day'], ['home', 'idle'], ['faith', null, { show: 1 }], ['folk', 'stand', { show: 1 }], ['father', 'idle', { show: 1, x: -1.25, z: -0.08, look: 1.0 }],
        ['paul', 'bless', { show: 1, x: -0.4, z: 0.3, look: -1.2, item: null }], ['silas', 'idle', { show: 1, x: -0.1, z: 0.45, look: -1.3 }], ['tim', 'bow', { show: 1, x: -0.8, z: 0.3, look: 1.2 }],
        ['eunice', 'pray', { show: 1, x: -1.1, z: 0.05, look: 1.0 }], ['lois', 'pray', { show: 1, x: -1.35, z: 0.3, look: 1.0 }], ['j1', 'idle', { show: 1 }], ['j2', 'idle', { show: 1 }]],
    },
  },

  /* a15. 마게도냐 사람의 환상 — 드로아는 핀이 바닷가라 무대 왼쪽 절반이 에게 바다다: 사람과 집은 오른쪽 뭍에, 배만 바다에(geo).
     처음엔 오른쪽 길 위 — 일행이 서쪽으로 가는데 앞길에 빛이 내려 막고(성령, 아시아), 북쪽(뒤)으로 돌자 또 빛이 막는다(예수의 영, 비두니아). 걸음을 돌려 바닷가 드로아로.
     밤 — 깔개에 누워 잠든 일행, 바닷가 쪽에 꿈의 빛무리(dream)가 일고 그 안에 마게도냐 사람이 빛의 실루엣으로 서서 손을 내밀어 청한다.
     바울이 깨어 일행을 깨우고, 새벽에 바다 쪽의 배를 가리킨다. 누가가 길에서 와 일행에 든다 */
  a15: {
    env: 'day',
    wide: 1.45,
    props: {
      road: ['road', 1.25, 0.22, { len: 2.3, w: 0.36, rot: 0.04 }],
      home: ['house', 0.85, -0.6, { stair: true }],
      mats: ['cloaks', 0.8, 0.42, { n: 3 }],
      stopA: ['beam', 0.55, 0.22, { r: 0.34, h: 2.2 }],
      stopB: ['beam', 1.45, -0.62, { r: 0.34, h: 2.2 }],
      ship: ['ship', -1.0, 0.1, { state: 'furled', big: 0.6, geo: [39.758, 26.1] }],
      vision: ['dream', 0.12, -0.05, { r: 0.42 }],
    },
    cast: {
      paul: ['paul', 2.0, 0.22, -1.3],
      silas: ['silas', 2.15, 0.0, -1.3],
      tim: ['timothy', 2.2, 0.42, -1.3],
      mac: ['macedonian', 0.12, -0.05, 0.9, { silhouette: 'light', gaze: false }],
      luke: ['luke', 2.15, 0.3, -1.3, { gaze: false }],
    },
    beats: {
      // 밤의 환상 — 마게도냐 사람이 서서 청한다
      enter: [['@env', 'night'], ['stopA', null, { show: 0 }], ['stopB', null, { show: 0 }], ['vision', null, { show: 1 }], ['luke', 'idle', { show: 0 }],
        ['paul', 'sit-ground', { x: 0.6, z: 0.35, look: -1.2 }], ['silas', 'sleep', { x: 0.95, z: 0.32, look: -1.3 }], ['tim', 'sleep', { x: 1.15, z: 0.52, look: -1.3 }],
        ['mac', 'shrug', { show: 1, look: 1.0 }]],
      // 브루기아와 갈라디아 땅을 지나 — 오른쪽 길에서 서쪽으로 걷는다
      intro: [['@env', 'day'], ['home', null, { show: 0 }], ['mats', null, { show: 0 }], ['stopA', null, { show: 0 }], ['stopB', null, { show: 0 }], ['vision', null, { show: 0 }], ['mac', 'idle', { show: 0 }], ['luke', 'idle', { show: 0 }], ['ship', 'furled']],
      'p0.0': [['paul', 'idle', { x: 1.45, z: 0.22, look: -1.3 }], ['silas', 'idle', { x: 1.65, z: 0.05, look: -1.3, delay: 200 }], ['tim', 'idle', { x: 1.7, z: 0.42, look: -1.3, delay: 400 }]],
      // 성령께서 막으셨다 — 앞길에 빛이 내린다
      'p0.1': [['paul', 'idle', { x: 1.45, z: 0.22 }], ['silas', 'idle', { x: 1.65, z: 0.05 }], ['tim', 'idle', { x: 1.7, z: 0.42 }], ['stopA', null, { show: 1, delay: 600 }],
        ['paul', 'look-up', { look: -1.2, delay: 1200 }], ['silas', 'afraid', { look: -1.2, delay: 1500 }], ['tim', 'afraid', { look: -1.2, delay: 1700 }]],
      // 북쪽 비두니아로 가려 하자 — 또 빛이 막는다
      'p0.2': [['stopA', null, { show: 0 }], ['paul', 'idle', { x: 1.5, z: -0.2, look: 2.8 }], ['silas', 'idle', { x: 1.75, z: -0.12, look: 2.8, delay: 300 }], ['tim', 'idle', { x: 1.3, z: -0.05, look: 2.8, delay: 500 }],
        ['stopB', null, { show: 1, delay: 2200 }], ['paul', 'look-up', { delay: 2800 }], ['tim', 'afraid', { delay: 3000 }]],
      // 길이 닫힐 때마다 걸음을 돌린다
      'p0.3': [['stopA', null, { show: 0 }], ['stopB', null, { show: 0 }], ['paul', 'shrug', { x: 1.5, z: -0.2, look: 0.8 }], ['silas', 'idle', { x: 1.75, z: -0.12, look: -0.4 }], ['tim', 'idle', { x: 1.3, z: -0.05, look: 0.6 }]],
      // 무시아를 지나 바닷가 드로아로 내려간다
      'p1.0': [['stopB', null, { show: 0 }], ['home', null, { show: 1 }], ['paul', 'idle', { x: 0.45, z: 0.18, look: -1.3 }], ['silas', 'idle', { x: 0.7, z: 0.0, look: -1.3, delay: 300 }], ['tim', 'idle', { x: 0.8, z: 0.4, look: -1.3, delay: 500 }]],
      // 성 너머로 에게 바다 — 바다를 바라본다
      'p1.1': [['paul', 'idle', { x: 0.45, z: 0.18, look: -1.45 }], ['silas', 'idle', { x: 0.7, z: 0.0, look: -1.3 }], ['tim', 'point', { x: 0.8, z: 0.4, look: -1.4 }]],
      // 그날 밤 — 깔개에 누워 잠든다
      'p1.2': [['@env', 'night'], ['mats', null, { show: 1 }], ['tim', 'idle'], ['paul', 'sit-ground', { x: 0.6, z: 0.35, look: -1.2 }], ['paul', 'sleep', { delay: 2200 }],
        ['silas', 'sleep', { x: 0.95, z: 0.32, look: -1.3 }], ['tim', 'sleep', { x: 1.15, z: 0.52, look: -1.3 }]],
      // 마게도냐 사람 하나가 서서 간절히 청한다 — 꿈의 빛 속에
      'p1.3': [['paul', 'sleep', { x: 0.6, z: 0.35 }], ['vision', null, { show: 1 }], ['mac', 'idle', { show: 1, look: 1.0, delay: 600 }], ['mac', 'shrug', { delay: 2000 }], ['paul', 'sit-ground', { look: -1.2, delay: 2600 }]],
      'p1.4': [['mac', 'shrug', { show: 1 }], ['paul', 'sit-ground', { look: -1.2 }]],
      'p1.5': [['mac', 'speak', { to: 'paul' }], ['paul', 'listen', { look: -1.2 }]],
      // 바울이 일어나 일행을 깨운다 — 곧바로 떠날 길을 찾는다
      'p2.0': [['vision', null, { show: 0 }], ['mac', 'idle', { show: 0 }], ['paul', 'idle', { x: 0.75, z: 0.2, look: 1.2, delay: 600 }], ['paul', 'speak', { to: 'silas', delay: 1800 }],
        ['silas', 'sit-ground', { delay: 2200 }], ['tim', 'sit-ground', { delay: 2600 }], ['silas', 'idle', { delay: 4200 }], ['tim', 'idle', { delay: 4500 }]],
      // 하나님께서 부르신 줄 알았다 — 새벽, 바다 쪽 배를 가리킨다
      'p2.1': [['vision', null, { show: 0 }], ['mac', 'idle', { show: 0 }], ['@env', 'dawn'], ['silas', 'idle', { x: 0.95, z: 0.05, look: -1.3 }], ['tim', 'idle', { x: 1.0, z: 0.45, look: -1.3 }],
        ['paul', 'point', { x: 0.55, z: 0.2, look: -1.45 }], ['ship', 'sail', { delay: 1500 }]],
      // 누가가 일행에 든다 — 길에서 와서 인사하고, 모두 바닷가로
      'p2.2': [['paul', 'idle', { look: 1.3 }], ['luke', 'idle', { show: 1, x: 1.3, z: 0.25, look: -1.3 }], ['luke', 'bow', { delay: 3000 }], ['paul', 'bless', { to: 'luke', delay: 3200 }],
        ['paul', 'idle', { x: 0.25, z: 0.2, look: -1.4, delay: 6000 }], ['silas', 'idle', { x: 0.45, z: 0.0, look: -1.4, delay: 6200 }], ['tim', 'idle', { x: 0.5, z: 0.42, look: -1.4, delay: 6300 }], ['luke', 'idle', { x: 0.75, z: 0.25, look: -1.4, delay: 6500 }]],
      w0: [['@env', 'night'], ['stopA', null, { show: 0 }], ['stopB', null, { show: 0 }], ['vision', null, { show: 1 }], ['ship', 'furled'], ['luke', 'idle', { show: 0 }],
        ['paul', 'listen', { x: 0.6, z: 0.35, look: -1.2 }], ['silas', 'sleep', { x: 0.95, z: 0.32, look: -1.3 }], ['tim', 'sleep', { x: 1.15, z: 0.52, look: -1.3 }], ['mac', 'speak', { show: 1, look: 1.0, to: 'paul' }]],
      w1: [['@env', 'dawn'], ['vision', null, { show: 0 }], ['mac', 'idle', { show: 0 }], ['ship', 'sail'], ['paul', 'point', { x: 0.25, z: 0.2, look: -1.45 }], ['silas', 'idle', { x: 0.45, z: 0.0, look: -1.4 }],
        ['tim', 'idle', { x: 0.5, z: 0.42, look: -1.4 }], ['luke', 'speak', { show: 1, x: 0.75, z: 0.25, look: -1.4, to: 'paul' }]],
      w2: [['@env', 'day'], ['home', null, { show: 0 }], ['mats', null, { show: 0 }], ['ship', 'furled'], ['luke', 'idle', { show: 0 }], ['stopA', null, { show: 1 }], ['paul', 'look-up', { x: 1.45, z: 0.22, look: -1.2 }], ['silas', 'afraid', { x: 1.65, z: 0.05, look: -1.2 }], ['tim', 'afraid', { x: 1.7, z: 0.42, look: -1.2 }]],
      end: [['@env', 'night'], ['home', null, { show: 1 }], ['mats', null, { show: 1 }], ['stopA', null, { show: 0 }], ['stopB', null, { show: 0 }], ['vision', null, { show: 1 }], ['ship', 'furled'], ['luke', 'idle', { show: 0 }],
        ['paul', 'sit-ground', { show: 1, x: 0.6, z: 0.35, look: -1.2 }], ['silas', 'sleep', { show: 1, x: 0.95, z: 0.32, look: -1.3 }], ['tim', 'sleep', { show: 1, x: 1.15, z: 0.52, look: -1.3 }],
        ['mac', 'shrug', { show: 1, look: 1.0 }]],
    },
  },

  /* a16. 강가의 기도처, 루디아 — 빌립보: 오른쪽 뒤에 성문(gate), 왼쪽에 앞뒤로 흐르는 강(river — 강기테스), 강가 올리브나무 아래 여인들이 모여 기도한다.
     일행(바울·실라·디모데·누가)이 성문에서 나와 강가로 와 앉아 말씀을 전한다. 자색 옷감(purple)을 곁에 둔 루디아 — 주님께서 마음을 여시자 빛이 내린다.
     강가에서 세례(pour), 루디아가 일어나 자기 집에 머물러 달라 청하고, 모두 성문 쪽으로 간다 */
  a16: {
    env: 'day',
    wide: 1.45,
    props: {
      gate: ['gate', 1.45, -0.75],
      road: ['road', 0.55, -0.32, { len: 2.0, w: 0.34, rot: 0.32 }],
      river: ['river', -1.45, 0.0, { w: 0.5, len: 2.4 }],
      tree: ['olive', -0.55, -0.62],
      stones: ['rocks', 0, 0, { spots: [[-0.95, -0.25, 0.07], [-0.3, 0.62, 0.06], [0.55, 0.62, 0.05]] }],
      cloth: ['purple', -0.1, 0.5],
      heart: ['beam', -0.4, 0.28, { r: 0.34, h: 2.2 }],
      water: ['pour', -1.05, 0.25, { h: 0.8 }],
    },
    cast: {
      paul: ['paul', 1.35, -0.42, -1.0],
      silas: ['silas', 1.6, -0.3, -1.0],
      tim: ['timothy', 1.25, -0.15, -1.0],
      luke: ['luke', 1.55, -0.05, -1.0, { gaze: false }],
      lydia: ['lydia', -0.4, 0.28, 1.0, { pose: 'sit-ground' }],
      w1: ['greekW', -0.75, 0.02, 1.0, { pose: 'sit-ground' }],
      w2: ['woman', -0.7, 0.45, 1.1, { pose: 'sit-ground' }],
      maid: ['woman2', -0.95, 0.3, 1.1, { pose: 'sit-ground', gaze: false }],
    },
    beats: {
      // 주님께서 루디아의 마음을 여신다 — 빛 속에서 듣는다
      enter: [['heart', null, { show: 1 }], ['water', 'idle'], ['paul', 'sit-speak', { x: 0.2, z: 0.18, look: -1.3, to: 'lydia' }], ['silas', 'sit-ground', { x: 0.42, z: -0.05, look: -1.3 }],
        ['tim', 'sit-ground', { x: 0.45, z: 0.42, look: -1.3 }], ['luke', 'idle', { x: 0.75, z: 0.2, look: -1.3 }], ['lydia', 'listen', { look: 1.0 }], ['w1', 'listen'], ['w2', 'listen']],
      // 드로아에서 배로 네압볼리를 거쳐 빌립보로 — 일행이 성문 앞에 선다
      intro: [['@env', 'day'], ['heart', null, { show: 0 }], ['water', 'idle'], ['lydia', 'pray'], ['w1', 'pray'], ['w2', 'pray'], ['maid', 'pray'], ['paul', 'idle', { look: -1.0 }]],
      // 마게도냐의 으뜸가는 성 — 둘러본다
      'p0.1': [['paul', 'idle', { look: 2.4 }], ['silas', 'idle', { look: 2.2, delay: 400 }], ['tim', 'point', { look: -1.6 }], ['tim', 'idle', { delay: 3000 }]],
      // 안식일 — 성문 밖 강가로 나간다
      'p0.2': [['paul', 'idle', { x: 0.25, z: 0.12, look: -1.3 }], ['silas', 'idle', { x: 0.5, z: -0.08, look: -1.3, delay: 300 }], ['tim', 'idle', { x: 0.5, z: 0.4, look: -1.3, delay: 500 }],
        ['luke', 'idle', { x: 0.8, z: 0.2, look: -1.3, delay: 700 }]],
      // 강가에 여인들이 모여 있다
      'p1.0': [['paul', 'idle', { x: 0.25, z: 0.12, look: -1.3 }], ['silas', 'idle', { x: 0.5, z: -0.08 }], ['tim', 'idle', { x: 0.5, z: 0.4 }], ['luke', 'idle', { x: 0.8, z: 0.2 }],
        ['lydia', 'listen', { look: 1.1 }], ['w1', 'listen', { look: 1.1, delay: 400 }], ['w2', 'idle', { look: 1.2, delay: 700 }]],
      // 일행은 앉아서 말씀을 전한다
      'p1.1': [['paul', 'sit-speak', { x: 0.2, z: 0.18, look: -1.3, to: 'lydia' }], ['silas', 'sit-ground', { x: 0.42, z: -0.05, look: -1.3 }], ['tim', 'sit-ground', { x: 0.45, z: 0.42, look: -1.3 }],
        ['w2', 'listen'], ['maid', 'listen']],
      // 두아디라에서 온 자색 옷감 장수 루디아
      'p1.2': [['lydia', 'listen', { look: 1.0 }]],
      'p1.3': [['lydia', 'sit-speak', { look: 1.3, to: 'paul' }], ['paul', 'listen', { look: -1.3 }]],
      // 주님께서 마음을 여시자 — 빛이 내리고 귀를 기울인다
      'p1.4': [['paul', 'sit-speak', { to: 'lydia' }], ['lydia', 'listen', { look: 1.0 }], ['heart', null, { show: 1, delay: 500 }], ['lydia', 'pray', { delay: 3500 }]],
      // 강가에서 세례 — 루디아가 물가에 무릎 꿇고 바울이 물을 붓는다
      'p2.0': [['heart', null, { show: 0 }], ['lydia', 'kneel', { x: -1.05, z: 0.25, look: 1.4 }], ['maid', 'kneel', { x: -0.95, z: 0.55, look: 1.4, delay: 300 }],
        ['paul', 'idle', { x: -0.7, z: 0.3, look: -1.4 }], ['paul', 'anoint', { look: -1.4, delay: 2600 }], ['water', 'pour', { delay: 3000 }], ['water', 'idle', { delay: 6500 }],
        ['silas', 'pray', { x: -0.45, z: 0.0, look: -1.2 }], ['tim', 'pray', { x: -0.35, z: 0.55, look: -1.3 }], ['w1', 'pray'], ['w2', 'pray']],
      // 루디아가 간절히 청한다
      'p2.1': [['water', 'idle'], ['paul', 'idle', { x: -0.7, z: 0.3, look: -1.4 }], ['lydia', 'idle', { x: -1.05, z: 0.25, look: 1.4 }], ['maid', 'idle', { x: -0.95, z: 0.55 }], ['silas', 'idle'], ['tim', 'idle']],
      'p2.2': [['lydia', 'speak', { to: 'paul' }], ['lydia', 'bow', { delay: 4200 }]],
      // 그 청을 물리칠 수 없었다 — 모두 성문 쪽 루디아의 집으로
      'p2.3': [['lydia', 'idle'], ['paul', 'bless', { to: 'lydia' }], ['lydia', 'idle', { x: 1.45, z: -0.35, delay: 2200 }], ['paul', 'idle', { x: 1.55, z: -0.15, delay: 2500 }], ['maid', 'idle', { x: 1.3, z: -0.25, delay: 2400 }],
        ['silas', 'idle', { x: 1.7, z: -0.3, delay: 2800 }], ['tim', 'idle', { x: 1.35, z: 0.0, delay: 3000 }], ['luke', 'idle', { x: 1.65, z: 0.05, delay: 3100 }]],
      // 빌립보 교회를 늘 기쁨으로 — 강가의 여인들이 기도하고, 일행은 성문 안으로 사라진다
      'p2.4': [['lydia', 'idle', { show: 0, delay: 600 }], ['paul', 'idle', { show: 0, delay: 900 }], ['maid', 'idle', { show: 0, delay: 700 }], ['silas', 'idle', { show: 0, delay: 1000 }],
        ['tim', 'idle', { show: 0, delay: 1100 }], ['luke', 'idle', { show: 0, delay: 1200 }], ['w1', 'raise'], ['w2', 'pray'], ['@env', 'dusk']],
      w0: [['@env', 'day'], ['heart', null, { show: 1 }], ['water', 'idle'], ['paul', 'sit-speak', { show: 1, x: 0.2, z: 0.18, look: -1.3, to: 'lydia' }], ['silas', 'sit-ground', { show: 1, x: 0.42, z: -0.05, look: -1.3 }],
        ['tim', 'sit-ground', { show: 1, x: 0.45, z: 0.42, look: -1.3 }], ['luke', 'idle', { show: 1, x: 0.75, z: 0.2, look: -1.3 }], ['lydia', 'listen', { show: 1, x: -0.4, z: 0.28, look: 1.0 }],
        ['maid', 'sit-ground', { show: 1, x: -0.95, z: 0.3, look: 1.1 }], ['w1', 'listen'], ['w2', 'listen']],
      w1: [['heart', null, { show: 0 }], ['lydia', 'speak', { x: -0.55, z: 0.25, look: 1.3, to: 'paul' }], ['paul', 'listen', { x: -0.15, z: 0.25, look: -1.3 }], ['maid', 'idle', { x: -0.85, z: 0.5, look: 1.2 }],
        ['silas', 'idle', { x: 0.1, z: 0.0, look: -1.3 }], ['tim', 'idle', { x: 0.15, z: 0.45, look: -1.3 }]],
      w2: [['@env', 'dusk'], ['lydia', 'listen', { look: 1.3 }], ['paul', 'speak', { to: 'lydia' }], ['w1', 'pray'], ['w2', 'pray']],
      end: [['@env', 'day'], ['heart', null, { show: 1 }], ['water', 'idle'], ['paul', 'sit-speak', { show: 1, x: 0.2, z: 0.18, look: -1.3, to: 'lydia' }], ['silas', 'sit-ground', { show: 1, x: 0.42, z: -0.05, look: -1.3 }],
        ['tim', 'sit-ground', { show: 1, x: 0.45, z: 0.42, look: -1.3 }], ['luke', 'idle', { show: 1, x: 0.75, z: 0.2, look: -1.3 }], ['lydia', 'listen', { show: 1, x: -0.4, z: 0.28, look: 1.0 }],
        ['maid', 'sit-ground', { show: 1, x: -0.95, z: 0.3, look: 1.1 }], ['w1', 'listen', { show: 1 }], ['w2', 'listen', { show: 1 }]],
    },
  },

  /* a17. 한밤의 찬송과 흔들린 감옥 — 빌립보: 왼쪽 뒤 장터의 관리 재판석(bema)과 두 관리(붉은 단 토가), 오른쪽 깊은 옥(jail — 앞은 쇠창살, 오른쪽 문).
     점치는 여종이 일행을 따라오며 외치고, 바울이 돌아서서 명하자 여종은 조용히 무릎 꿇는다. 주인들이 두 사람을 관리들 앞으로 끌고 간다.
     매질은 그리지 않는다 — 두 사람은 수행원에게 이끌려 옥 쪽으로 가 사라지고, 옥 안 족쇄(stocks) 앞에 앉은 모습으로 나타난다.
     한밤 — 기도하며 찬송하고 죄수들이 듣는다. 지진: 옥이 흔들려 흙먼지가 떨어지고 문이 열리고 사슬이 풀린다. 잠에서 깬 간수가 칼을 빼어 들어 올리는 순간
     (자기를 해치는 모습은 없다) 바울이 문가에서 외치고, 간수는 칼을 내려놓고 떨며 엎드린다. 옥 앞에서 묻고 답하고, 상처를 씻기는 대야와 세례, 온 집안의 기쁨 */
  a17: {
    env: 'day',
    wide: 1.5,
    props: {
      seat: ['bema', -1.5, -0.5, { w: 0.9 }],
      jail: ['jail', JX, JZ, { w: 1.9, chains: [-0.72, 0.55], lit: true }],
      stocks: ['stocks', (IN1[0] + IN2[0]) / 2, JZ + 0.06, { len: 0.62 }],
      basin: ['basin', 0.15, 0.62],
      water: ['pour', 0.6, 0.45, { h: 0.8 }],
      lamp: ['lamp', 1.1, 0.68],
    },
    cast: {
      paul: ['paul', 0.15, 0.35, -1.3],
      silas: ['silas', 0.4, 0.2, -1.3],
      slave: ['slavegirl', 0.75, 0.45, -1.3],
      o1: ['greek2', 0.35, -0.05 + 0.6, -1.4, { gaze: false }],
      o2: ['greek', 0.6, 0.62, -1.4, { gaze: false }],
      m1: ['magistrate', -1.68, -0.6, 0.4],
      m2: ['magistrate', -1.32, -0.6, 0.2],
      l1: ['lictor', -0.85, -0.42, -0.6, { gaze: false }],
      pr1: ['man', JX - 0.72, JZ - 0.2, 0.3, { pose: 'sit-ground', gaze: false }],
      pr2: ['lame', JX + 0.55, JZ - 0.2, -0.3, { pose: 'sit-ground', gaze: false }],
      jailer: ['jailer', 1.85, 0.3, -1.2],
      wife: ['woman', 2.0, 0.55, -1.2, { gaze: false }],
      kid: ['child', 2.1, 0.32, -1.2, { gaze: false }],
    },
    beats: {
      // 한밤중 — 옥 안에서 기도하며 찬송한다
      enter: [['@env', 'night'], ['jail', 'shut'], ['stocks', 'shut'], ['lamp', null, { show: 0 }], ...hide('slave', 'o1', 'o2', 'wife', 'kid'),
        ['paul', 'look-up', { x: IN1[0], z: IN1[1], look: 0.3 }], ['silas', 'raise', { x: IN2[0], z: IN2[1], look: -0.2 }], ['pr1', 'listen', { look: 0.9 }], ['pr2', 'listen', { look: -1.0 }],
        ['jailer', 'sleep', { x: 1.85, z: 0.42, look: -1.2 }], ['l1', 'idle', { show: 0 }]],
      // 점치는 여종이 일행을 따라온다
      intro: [['@env', 'day'], ['jail', 'shut'], ['stocks', 'shut'], ['lamp', null, { show: 0 }], ['water', 'idle'], ['basin', null, { show: 0 }], ...hide('wife', 'kid'),
        ['paul', 'idle', { look: -1.3 }], ['silas', 'idle', { look: -1.3 }], ['slave', 'idle', { look: -1.3 }]],
      'p0.1': [['paul', 'idle', { x: -0.25, z: 0.38 }], ['silas', 'idle', { x: 0.0, z: 0.22, delay: 200 }], ['slave', 'idle', { x: 0.4, z: 0.45, delay: 600 }]],
      // 여종이 외친다
      'p0.2': [['paul', 'idle', { x: -0.25, z: 0.38 }], ['silas', 'idle', { x: 0.0, z: 0.22 }], ['slave', 'point', { x: 0.4, z: 0.45, look: -1.3 }]],
      'p0.3': [['slave', 'raise', { look: -1.3 }]],
      // 몹시 괴로워진 바울이 돌아서서 명한다
      'p0.4': [['slave', 'idle'], ['paul', 'idle', { look: 1.3 }], ['silas', 'idle', { look: 1.2, delay: 400 }]],
      'p0.5': [['paul', 'rebuke', { to: 'slave' }], ['slave', 'afraid']],
      'p0.6': [['paul', 'rebuke', { to: 'slave' }]],
      // 여종은 조용해지고 — 돈벌이가 끊긴 주인들이 두 사람을 관리들 앞으로 끌고 간다
      'p0.7': [['paul', 'idle'], ['slave', 'kneel', { look: -1.0 }], ['o1', 'rebuke', { to: 'paul', delay: 1200 }], ['o2', 'point', { look: -1.3, delay: 1400 }],
        ['paul', 'idle', { x: -1.25, z: -0.05, look: -0.4, delay: 3000 }], ['silas', 'idle', { x: -1.6, z: 0.05, look: -0.2, delay: 3200 }],
        ['o1', 'point', { x: -0.85, z: 0.1, look: -1.3, delay: 3100 }], ['o2', 'rebuke', { x: -0.65, z: 0.3, look: -1.3, delay: 3300 }], ['m1', 'idle', { look: 0.5 }], ['m2', 'idle', { look: 0.3 }]],
      // 매를 맞고 깊은 옥에 갇힌다 — 관리가 손짓하고, 수행원과 간수가 두 사람을 옥으로 이끈다 (매질은 그리지 않는다)
      'p1.0': [['slave', 'idle', { show: 0 }], ['paul', 'idle', { x: -1.25, z: -0.05, look: -0.4 }], ['silas', 'idle', { x: -1.6, z: 0.05 }], ['o1', 'idle', { x: -0.85, z: 0.1 }], ['o2', 'idle', { x: -0.65, z: 0.3 }],
        ['m1', 'rebuke', { to: 'paul' }], ['m2', 'point', { look: 1.2, delay: 600 }], ['l1', 'idle', { x: -1.0, z: 0.22, look: -1.2, delay: 400 }],
        ['paul', 'idle', { x: 0.45, z: 0.32, look: 1.3, delay: 2600 }], ['silas', 'idle', { x: 0.15, z: 0.45, look: 1.3, delay: 2800 }], ['l1', 'idle', { x: -0.1, z: 0.25, delay: 2900 }],
        ['jailer', 'idle', { x: 1.6, z: 0.3, look: -1.3, delay: 2000 }], ['o1', 'idle', { show: 0, delay: 2600 }], ['o2', 'idle', { show: 0, delay: 2800 }],
        ['paul', 'idle', { show: 0, delay: 5600 }], ['silas', 'idle', { show: 0, delay: 5800 }], ['l1', 'idle', { show: 0, delay: 6400 }]],
      // 발에 나무 족쇄 — 옥 안 족쇄 앞에 앉은 두 사람
      'p1.1': [...hide('slave', 'o1', 'o2', 'l1'), ['m1', 'idle', { look: 0.4 }], ['m2', 'idle', { look: 0.2 }],
        ['paul', 'sit-ground', { show: 1, x: IN1[0], z: IN1[1], look: 0.3 }], ['silas', 'sit-ground', { show: 1, x: IN2[0], z: IN2[1], look: -0.2 }], ['stocks', 'shut'],
        ['jailer', 'idle', { x: 1.85, z: 0.3, look: -1.4 }]],
      // 한밤중 — 기도하며 찬송하고, 죄수들이 귀 기울인다. 간수는 문 곁에서 잠든다
      'p1.2': [['@env', 'night'], ['m1', 'idle', { show: 0 }], ['m2', 'idle', { show: 0 }], ['paul', 'pray', { look: 0.3 }], ['silas', 'pray', { look: -0.2 }],
        ['jailer', 'sit-ground', { x: 1.85, z: 0.42, look: -1.2 }], ['jailer', 'sleep', { delay: 1500 }],
        ['paul', 'look-up', { delay: 2600 }], ['silas', 'raise', { delay: 3000 }], ['pr1', 'listen', { look: 0.9, delay: 3500 }], ['pr2', 'listen', { look: -1.0, delay: 3800 }]],
      // 큰 지진 — 옥이 흔들리고 문이 열리고 사슬이 풀린다
      'p1.3': [['jail', 'quake'], ['stocks', 'open', { delay: 1200 }], ['pr1', 'afraid', { delay: 300 }], ['pr2', 'cower', { delay: 400 }], ['silas', 'afraid', { delay: 500 }], ['paul', 'sit-ground', { delay: 500 }],
        ['jailer', 'sit-ground', { delay: 2500 }]],
      // 간수가 깨어 열린 문을 보고 칼을 빼어 든다 — 바울이 문가로 와서 크게 외친다
      'p1.4': [['jail', 'open'], ['stocks', 'open'], ['pr1', 'idle'], ['pr2', 'sit-ground'], ['jailer', 'afraid', { x: 1.85, z: 0.38, look: -1.3 }], ['jailer', 'idle', { item: 'sword', delay: 1800 }],
        ['jailer', 'rebuke', { look: -0.3, delay: 2400 }], ['paul', 'idle', { x: 1.3, z: -0.12, look: 1.2, delay: 1200 }], ['paul', 'raise', { look: 1.2, delay: 3600 }], ['silas', 'idle', { look: 1.0, delay: 1500 }]],
      'p1.5': [['jail', 'open'], ['jailer', 'rebuke', { item: 'sword', look: -0.3 }], ['paul', 'raise', { x: 1.3, z: -0.12, look: 1.2, to: 'jailer' }]],
      // 우리가 다 여기 있소 — 간수가 칼을 내린다
      'p1.6': [['paul', 'speak', { to: 'jailer' }], ['jailer', 'idle', { look: -1.3, delay: 1200 }], ['jailer', 'afraid', { item: null, delay: 2000 }], ['pr1', 'listen', { look: 1.2 }], ['silas', 'idle', { x: IN2[0] + 0.1, z: IN2[1] + 0.05, look: 1.0 }]],
      // 떨며 엎드렸다가 두 사람을 데리고 나온다
      'p2.0': [['jailer', 'cower', { item: null, x: 1.75, z: 0.42, look: -1.4 }], ['paul', 'idle', { x: 1.3, z: -0.12 }], ['jailer', 'idle', { delay: 2500 }],
        ['paul', 'idle', { x: 1.15, z: 0.42, look: 1.2, delay: 2800 }], ['silas', 'idle', { x: 0.9, z: 0.5, look: 1.1, delay: 2600 }], ['jailer', 'kneel', { x: 1.6, z: 0.45, look: -1.4, delay: 4600 }]],
      'p2.1': [['paul', 'idle', { x: 1.15, z: 0.42, look: 1.2 }], ['silas', 'idle', { x: 0.9, z: 0.5, look: 1.1 }], ['jailer', 'speak', { x: 1.6, z: 0.45, look: -1.4, to: 'paul' }]],
      // 주 예수를 믿으십시오
      'p2.2': [['jailer', 'kneel']],
      'p2.3': [['paul', 'speak', { to: 'jailer' }], ['jailer', 'listen', { look: -1.3 }]],
      'p2.4': [['paul', 'idle'], ['silas', 'speak', { to: 'jailer' }], ['wife', 'idle', { show: 1, x: 1.95, z: 0.6, look: -1.3 }], ['kid', 'idle', { show: 1, x: 2.0, z: 0.35, look: -1.3, delay: 400 }]],
      // 그 밤에 상처를 씻어 주고 — 온 집안과 함께 세례를 받는다
      'p2.5': [['silas', 'idle'], ['lamp', null, { show: 1 }], ['basin', null, { show: 1 }], ['jailer', 'bow', { x: 0.35, z: 0.55, look: 1.2 }], ['paul', 'idle', { x: 0.6, z: 0.45, look: -1.3 }], ['silas', 'idle', { x: 0.75, z: 0.25, look: -1.2 }],
        ['jailer', 'kneel', { x: 0.6, z: 0.62, look: 0.0, delay: 3800 }], ['paul', 'anoint', { x: 0.6, z: 0.42, look: 0.3, delay: 4000 }], ['water', 'pour', { x: 0.6, z: 0.62, delay: 4400 }], ['water', 'idle', { delay: 7600 }],
        ['wife', 'kneel', { x: 0.95, z: 0.6, look: -1.2, delay: 1500 }], ['kid', 'kneel', { x: 1.15, z: 0.5, look: -1.3, delay: 1700 }]],
      // 하나님을 믿게 된 그 집에 기쁨이 가득하다
      'p2.6': [['water', 'idle'], ['jailer', 'raise', { x: 0.6, z: 0.62, look: 0.3 }], ['wife', 'raise', { delay: 300 }], ['kid', 'raise', { delay: 600 }], ['paul', 'bless', { to: 'jailer' }], ['silas', 'raise', { delay: 900 }],
        ['pr1', 'pray'], ['pr2', 'pray']],
      w0: [['@env', 'night'], ['jail', 'open'], ['stocks', 'open'], ['lamp', null, { show: 0 }], ['basin', null, { show: 0 }], ['water', 'idle'], ...hide('wife', 'kid', 'slave', 'o1', 'o2', 'l1', 'm1', 'm2'),
        ['paul', 'speak', { show: 1, x: 1.15, z: 0.42, look: 1.2, to: 'jailer' }], ['silas', 'speak', { show: 1, x: 0.9, z: 0.5, look: 1.1, to: 'jailer' }], ['jailer', 'listen', { show: 1, x: 1.6, z: 0.45, look: -1.4, item: null }]],
      w1: [['jailer', 'speak', { to: 'paul' }], ['paul', 'listen'], ['silas', 'idle']],
      w2: [['paul', 'raise', { x: 1.3, z: -0.12, look: 1.2, to: 'jailer' }], ['silas', 'idle', { x: IN2[0] + 0.1, z: IN2[1] + 0.05, look: 1.0 }], ['jailer', 'idle', { x: 1.85, z: 0.38, look: -1.3, item: 'sword' }]],
      end: [['@env', 'night'], ['jail', 'open'], ['stocks', 'open'], ['lamp', null, { show: 1 }], ['basin', null, { show: 1 }], ['water', 'idle', { x: 0.6, z: 0.62 }], ...hide('slave', 'o1', 'o2', 'l1', 'm1', 'm2'),
        ['jailer', 'raise', { show: 1, x: 0.6, z: 0.62, look: 0.3, item: null }], ['wife', 'raise', { show: 1, x: 0.95, z: 0.6, look: -1.2 }], ['kid', 'raise', { show: 1, x: 1.15, z: 0.5, look: -1.3 }],
        ['paul', 'bless', { show: 1, x: 0.6, z: 0.42, look: 0.3 }], ['silas', 'raise', { show: 1, x: 0.75, z: 0.25, look: -1.2 }], ['pr1', 'pray'], ['pr2', 'pray']],
    },
  },

  /* a18. 성경을 날마다 상고한 사람들 — 데살로니가는 핀 앞 왼쪽이 바다(만)라 사람은 무대 뒤쪽·오른쪽 뭍에 둔다. 왼쪽 회당 안(synahall — 낭독대에서 두루마리를 펴는 바울),
     오른쪽 야손의 집(house). 시기한 사람들이 장터 불량배들(crowd)을 모아 집 앞으로 몰려가고, 야손을 끌고 관리들(읍장) 앞에 선다.
     밤 — 형제들이 바울과 실라를 왼쪽으로 떠나보낸다. 베뢰아 — 같은 회당 안, 낮은 상에 펼친 두루마리(desk scroll)를 둘러앉아 날마다 성경을 찾아본다.
     데살로니가 사람들이 쫓아오자 형제들이 바울을 바닷가(왼쪽 앞)로 보내고, 실라와 디모데는 남는다 */
  a18: {
    env: 'day',
    wide: 1.45,
    props: {
      hall: ['synahall', -0.55, -0.5, { w: 2.4, bx: 0 }],
      home: ['house', 1.5, -0.55, { door: true, stair: true }],
      mob: ['crowd', 0, 0, { spots: [[1.05, 0.0], [1.3, 0.15], [1.6, 0.05], [1.85, 0.2], [1.15, 0.32], [1.5, 0.35]], face: Math.PI * 0.9, state: 'stand' }],
      study: ['desk', -0.55, -0.05, { scroll: true, w: 0.5 }],
    },
    cast: {
      paul: ['paulS', 0.35, 0.2, -1.2],
      silas: ['silas', 0.6, 0.05, -1.2],
      tim: ['timothy', 0.65, 0.35, -1.3, { gaze: false }],
      j1: ['jewD', -1.57, -0.55, 1.4, { y: 0.1, pose: 'sit' }],
      j2: ['pharisee', -1.57, -0.15, 1.5, { y: 0.1, pose: 'sit' }],
      g1: ['greek', 0.47, -0.55, -1.4, { y: 0.1, pose: 'sit' }],
      nob: ['noblewoman', 0.47, -0.15, -1.5, { y: 0.1, pose: 'sit' }],
      g2: ['greekW', -0.95, -1.12, 0.2, { y: 0.1, pose: 'sit', gaze: false }],
      jason: ['townsman', 1.35, -0.08, -0.6],
      r1: ['witness', 1.95, 0.4, -1.3, { gaze: false }],
      o1: ['magistrate', 0.25, 0.3, 0.9],
      o2: ['magistrate', -0.05, 0.25, 0.8, { gaze: false }],
      b1: ['greek2', -0.2, 0.3, 1.0, { gaze: false }],
      be1: ['elderC', -0.85, 0.1, 0.9, { pose: 'sit-ground' }],
      be2: ['greekW', -0.25, 0.12, -0.9, { pose: 'sit-ground' }],
      be3: ['jewD', -0.55, -0.32, 0, { pose: 'sit-ground' }],
      be4: ['greek', -0.85, -0.25, 0.6, { pose: 'sit-ground', gaze: false }],
    },
    beats: {
      // 베뢰아 — 두루마리를 둘러앉아 날마다 성경을 찾아본다
      enter: [['mob', 'stand', { show: 0 }], ['study', null, { show: 1 }], ...hide('j1', 'j2', 'g1', 'nob', 'g2', 'jason', 'r1', 'o1', 'o2', 'b1'),
        ['paul', 'speak', { x: 0.05, z: 0.32, look: -1.2, to: 'be2' }], ['silas', 'idle', { x: 0.4, z: 0.12, look: -1.2 }], ['tim', 'idle', { x: 0.42, z: 0.45, look: -1.3 }], ['be1', 'listen'], ['be3', 'listen']],
      // 데살로니가 — 일행이 오른쪽에서 회당으로
      intro: [['@env', 'day'], ['mob', 'stand', { show: 0 }], ['study', null, { show: 0 }], ...hide('be1', 'be2', 'be3', 'be4', 'o1', 'o2', 'b1', 'r1'), ['home', 'idle']],
      // 늘 하던 대로 회당에 들어가 — 낭독대에서 두루마리를 편다
      'p0.1': [['paul', 'idle', { x: -0.55, z: -0.25, look: 0.1, item: 'scroll' }], ['silas', 'idle', { x: 0.1, z: -1.12 }], ['silas', 'sit', { y: 0.1, look: 0.2, delay: 2600 }],
        ['tim', 'idle', { x: 0.25, z: 0.3, look: -1.2 }]],
      'p0.2': [['paul', 'speak', { item: null, x: -0.55, z: -0.25, look: 0.1, to: 'g1' }], ['silas', 'sit', { y: 0.1, x: 0.1, z: -1.12, look: 0.2 }]],
      'p0.3': [['paul', 'speak', { to: 'j1' }], ['j1', 'listen']],
      'p0.4': [['paul', 'raise', { look: 0.2 }]],
      // 많은 헬라 사람과 귀부인들이 믿는다
      'p0.5': [['paul', 'idle'], ['g1', 'raise', { y: 0, x: 0.3, z: -0.55 }], ['nob', 'pray', { y: 0, x: 0.3, z: -0.15, delay: 500 }], ['g2', 'pray', { delay: 900 }], ['j2', 'rebuke', { delay: 1200 }]],
      // 시기한 사람들이 불량배들을 모아 야손의 집으로 — 바울과 실라는 보이지 않는다
      'p1.0': [['paul', 'idle', { show: 0 }], ['silas', 'idle', { show: 0 }], ['tim', 'idle', { show: 0 }], ['g1', 'idle'], ['nob', 'idle'],
        ['j1', 'rebuke', { y: 0, x: 0.75, z: 0.3, look: 1.2 }], ['j2', 'point', { y: 0, x: 0.95, z: 0.5, look: 1.0, delay: 400 }], ['mob', 'stand', { show: 1, delay: 1200 }], ['r1', 'rebuke', { show: 1, x: 1.8, z: 0.38, delay: 1500 }],
        ['home', 'open', { delay: 2600 }], ['jason', 'afraid', { delay: 2800 }]],
      // 찾지 못하자 야손을 관리들 앞으로
      'p1.1': [['jason', 'idle', { x: 0.55, z: 0.12, look: -1.0 }], ['j1', 'idle', { x: 0.85, z: 0.32, look: -1.2 }], ['r1', 'point', { x: 1.05, z: 0.42, look: -1.3, delay: 400 }], ['home', 'idle'],
        ['o1', 'idle', { show: 1, look: 0.9 }], ['o2', 'idle', { show: 1, look: 0.8, delay: 300 }], ['g1', 'sit', { y: 0.1, x: 0.47, z: -0.55 }], ['nob', 'sit', { y: 0.1, x: 0.47, z: -0.15 }]],
      'p1.2': [['j1', 'rebuke', { to: 'o1' }]],
      'p1.3': [['j1', 'speak', { to: 'o1' }], ['j2', 'point', { look: -1.6 }], ['o1', 'listen'], ['jason', 'shrug']],
      // 그날 밤 — 형제들이 바울과 실라를 베뢰아로 보낸다 (왼쪽으로)
      'p1.4': [['@env', 'night'], ['mob', 'stand', { show: 0 }], ...hide('j1', 'j2', 'r1', 'o1', 'o2', 'g1', 'nob', 'g2'), ['jason', 'idle', { x: 0.2, z: 0.2, look: -1.2 }],
        ['b1', 'idle', { show: 1, x: -0.2, z: 0.3, look: -1.0 }], ['paul', 'idle', { show: 1, x: -0.45, z: 0.25, look: 1.2 }], ['silas', 'idle', { show: 1, x: -0.55, z: 0.42, look: 1.2, y: 0 }],
        ['jason', 'bless', { to: 'paul', delay: 1500 }], ['paul', 'idle', { x: -1.85, z: 0.0, delay: 3500 }], ['silas', 'idle', { x: -1.95, z: 0.2, delay: 3700 }], ['b1', 'idle', { x: -1.7, z: 0.2, delay: 3600 }],
        ['paul', 'idle', { show: 0, delay: 6800 }], ['silas', 'idle', { show: 0, delay: 7000 }], ['b1', 'idle', { show: 0, delay: 6900 }]],
      // 베뢰아 사람들은 너그러웠다 — 같은 회당 안, 새 얼굴들
      'p2.0': [['@env', 'day'], ['jason', 'idle', { show: 0 }], ['b1', 'idle', { show: 0 }], ['study', null, { show: 1 }],
        ['be1', 'listen', { show: 1 }], ['be2', 'listen', { show: 1, delay: 300 }], ['be3', 'listen', { show: 1, delay: 500 }], ['be4', 'listen', { show: 1, delay: 700 }],
        ['paul', 'speak', { show: 1, x: 0.05, z: 0.32, look: -1.2, to: 'be2' }], ['silas', 'idle', { show: 1, x: 0.4, z: 0.12, look: -1.2 }], ['tim', 'idle', { show: 1, x: 0.42, z: 0.45, look: -1.3 }]],
      // 간절한 마음으로 받고 날마다 성경을 찾아본다
      'p2.1': [['paul', 'idle'], ['be3', 'sit-speak', { to: 'be1' }], ['be1', 'listen', { look: 0.6 }], ['be2', 'listen', { look: -0.6 }], ['be4', 'sit-ground', { look: 0.8 }]],
      'p2.2': [['be3', 'sit-ground'], ['be1', 'pray'], ['be2', 'pray', { delay: 400 }], ['paul', 'bless', { to: 'be2' }]],
      // 데살로니가 사람들이 쫓아와 무리를 흔든다 — 형제들이 바울을 바닷가로 (왼쪽 앞), 실라와 디모데는 남는다
      'p2.3': [['paul', 'idle'], ['j1', 'rebuke', { show: 1, y: 0, x: 1.35, z: 0.2, look: -1.3 }], ['j2', 'point', { show: 1, y: 0, x: 1.6, z: 0.38, look: -1.3, delay: 300 }],
        ['be1', 'afraid', { delay: 1200 }], ['be4', 'idle', { delay: 1200 }], ['paul', 'idle', { x: -1.65, z: 0.4, delay: 2400 }], ['be4', 'idle', { x: -1.4, z: 0.25, delay: 2500 }],
        ['paul', 'idle', { show: 0, delay: 6000 }], ['be4', 'idle', { show: 0, delay: 6200 }], ['silas', 'idle', { look: -1.4, delay: 2600 }], ['tim', 'idle', { look: -1.5, delay: 2800 }]],
      // 두고 온 데살로니가 교회를 걱정한다 — 남은 실라와 디모데가 기도한다
      'p2.4': [['paul', 'idle', { show: 0 }], ['be4', 'idle', { show: 0 }], ['j1', 'idle', { show: 0 }], ['j2', 'idle', { show: 0 }], ['silas', 'pray'], ['tim', 'pray', { delay: 300 }], ['be1', 'pray'], ['@env', 'dusk']],
      w0: [['@env', 'day'], ['study', null, { show: 0 }], ['mob', 'stand', { show: 0 }], ...hide('be1', 'be2', 'be3', 'be4', 'jason', 'r1', 'o1', 'o2', 'b1'),
        ['paul', 'speak', { show: 1, x: -0.55, z: -0.25, look: 0.1, to: 'g1' }], ['silas', 'sit', { show: 1, y: 0.1, x: 0.1, z: -1.12, look: 0.2 }], ['tim', 'idle', { show: 1, x: 0.25, z: 0.3, look: -1.2 }],
        ['j1', 'sit', { show: 1, y: 0.1, x: -1.57, z: -0.55, look: 1.4 }], ['j2', 'sit', { show: 1, y: 0.1, x: -1.57, z: -0.15, look: 1.5 }], ['g1', 'listen', { show: 1, y: 0.1, x: 0.47, z: -0.55, look: -1.4 }],
        ['nob', 'sit', { show: 1, y: 0.1, x: 0.47, z: -0.15, look: -1.5 }], ['g2', 'sit', { show: 1, y: 0.1, x: -0.95, z: -1.12, look: 0.2 }]],
      w1: [...hide('j1', 'j2', 'g1', 'nob', 'g2'), ['study', null, { show: 1 }], ['be1', 'listen', { show: 1, look: 0.6 }], ['be2', 'listen', { show: 1, look: -0.6 }], ['be3', 'sit-speak', { show: 1, to: 'be1' }],
        ['be4', 'sit-ground', { show: 1, x: -0.85, z: -0.25, look: 0.8 }], ['paul', 'idle', { x: 0.05, z: 0.32, look: -1.2 }], ['silas', 'idle', { y: 0, x: 0.4, z: 0.12, look: -1.2 }], ['tim', 'idle', { x: 0.42, z: 0.45, look: -1.3 }]],
      w2: [['@env', 'dusk'], ['be3', 'sit-ground'], ['paul', 'pray', { x: -1.25, z: 0.35, look: 1.3 }], ['be1', 'pray'], ['be2', 'pray']],
      end: [['@env', 'day'], ['mob', 'stand', { show: 0 }], ['study', null, { show: 1 }], ...hide('j1', 'j2', 'g1', 'nob', 'g2', 'jason', 'r1', 'o1', 'o2', 'b1'),
        ['be1', 'listen', { show: 1, look: 0.9 }], ['be2', 'listen', { show: 1 }], ['be3', 'listen', { show: 1 }], ['be4', 'sit-ground', { show: 1, x: -0.85, z: -0.25, look: 0.6 }],
        ['paul', 'speak', { show: 1, x: 0.05, z: 0.32, look: -1.2, to: 'be2' }], ['silas', 'idle', { show: 1, y: 0, x: 0.4, z: 0.12, look: -1.2 }], ['tim', 'idle', { show: 1, x: 0.42, z: 0.45, look: -1.3 }]],
    },
  },

  /* a19. 알지 못하는 신에게 — 아테네: 뒤에 멀리 아크로폴리스(acropolis), 왼쪽은 장터 — 받침 위의 신상들(statues, 얼굴 없는 흰 윤곽)과 앞의 '알지 못하는 신에게'(ΑΓΝΩΣΤΩ ΘΕΩ) 제단(altarG).
     오른쪽은 아레오바고 바위 언덕(areopagus — 위는 평평하고 뒤에 반원 돌 의자). 바울이 장터에서 이야기하다가 철학자들에게 이끌려 바위 위 가운데 선다.
     제단 쪽을 가리키며 말하고, 하늘을 우러른다. 부활 이야기에 어떤 이는 비웃고 내려가고, 디오누시오와 다마리가 바울 곁으로 온다 */
  a19: {
    env: 'day',
    wide: 1.5,
    props: {
      acro: ['acropolis', -0.35, -1.35, { big: 0.85 }],
      idols: ['statues', 0, 0, { spots: [[-1.85, -0.62, 1], [-1.45, -0.78, 1.15], [-1.05, -0.62, 0.95], [-0.62, -0.75, 1.05]] }],
      altar: ['altarG', -0.95, 0.12],
      rock: ['areopagus', AX, AZ, { r: 0.72, h: AH }],
    },
    cast: {
      paul: ['paul', -1.95, 0.42, 1.3],
      t1: ['greek', -0.4, 0.25, -1.1],
      t2: ['jewD', -0.25, 0.5, -1.2, { gaze: false }],
      ph1: ['philosopher', 0.05, 0.05, -1.0],
      ph2: ['philosopher2', 0.25, 0.3, -1.1],
      a1: ['greek2', AX - 0.4, AZ - 0.32, 0.4, { y: AH + 0.09, pose: 'sit' }],
      a2: ['greek', AX + 0.35, AZ - 0.34, -0.4, { y: AH + 0.09, pose: 'sit', gaze: false }],
      dio: ['manaen', AX + 0.05, AZ - 0.4, 0, { y: AH + 0.09, pose: 'sit' }],
      dam: ['greekW', 0.45, 0.6, -1.3, { gaze: false }],
    },
    beats: {
      // 아레오바고 가운데 서서 말한다
      enter: [['paul', 'speak', { x: AX - 0.05, z: AZ + 0.12, look: -0.5, to: 'ph1' }], ['ph1', 'listen', { x: AX - 0.55, z: AZ + 0.05, look: 1.0 }], ['ph2', 'idle', { x: AX + 0.5, z: AZ + 0.02, look: -1.0 }],
        ['t1', 'idle', { show: 0 }], ['t2', 'idle', { show: 0 }], ['dam', 'idle', { show: 0 }]],
      // 아테네에 간 바울 — 장터로 들어온다
      intro: [['@env', 'day'], ['dam', 'idle', { show: 0 }], ['paul', 'idle', { x: -1.3, z: 0.42, look: 1.0 }]],
      // 우상이 가득한 것을 보고 마음에 분이 인다
      'p0.1': [['paul', 'idle', { x: -1.3, z: 0.42, look: 2.6 }], ['paul', 'shrug', { look: 2.8, delay: 2400 }]],
      // 회당에서, 날마다 장터에서 만나는 사람들과 이야기한다
      'p0.2': [['paul', 'speak', { x: -0.75, z: 0.42, look: 1.2, to: 't1' }], ['t1', 'listen'], ['t2', 'listen', { delay: 600 }], ['ph1', 'listen', { look: -1.2, delay: 1500 }]],
      // 철학자들이 그를 아레오바고로 데려간다
      'p0.3': [['t1', 'idle'], ['t2', 'idle'], ['ph1', 'idle', { x: AX - 0.55, z: AZ + 0.05, look: 1.0 }], ['ph2', 'idle', { x: AX + 0.5, z: AZ + 0.02, look: -1.0, delay: 300 }],
        ['paul', 'idle', { x: AX - 0.05, z: AZ + 0.12, look: -0.5, delay: 800 }], ['t1', 'idle', { x: -0.3, z: 0.2, look: 1.2, delay: 1500 }], ['t2', 'idle', { show: 0, delay: 1800 }]],
      'p0.4': [['paul', 'idle', { x: AX - 0.05, z: AZ + 0.12, look: -0.5 }], ['ph1', 'idle', { x: AX - 0.55, z: AZ + 0.05 }], ['ph2', 'idle', { x: AX + 0.5, z: AZ + 0.02 }], ['t2', 'idle', { show: 0 }]],
      'p0.5': [['ph1', 'speak', { to: 'paul' }], ['ph2', 'shrug', { delay: 1500 }]],
      // 아레오바고 가운데 서서 — 제단을 가리킨다
      'p1.0': [['ph1', 'listen'], ['ph2', 'idle'], ['paul', 'speak', { to: 'ph1' }]],
      'p1.1': [['paul', 'point', { look: -1.45 }], ['a1', 'listen', { look: -0.8 }], ['ph1', 'idle', { look: -1.6, delay: 800 }]],
      'p1.2': [['paul', 'speak', { look: -0.6, to: 'ph1' }], ['ph1', 'listen', { look: 1.0 }]],
      // 사람이 지은 신전에 살지 않으신다 — 하늘을 우러른다
      'p1.3': [['paul', 'raise', { look: 0 }], ['dio', 'listen']],
      'p2.0': [['paul', 'speak', { look: 0.4, to: 'ph2' }]],
      'p2.1': [['paul', 'speak', { look: 0.0, to: 'dio' }], ['dio', 'listen']],
      'p2.2': [['paul', 'raise', { look: 0 }]],
      'p2.3': [['paul', 'speak', { look: -0.3, to: 'a1' }]],
      // 어떤 이는 비웃고 내려가고, 어떤 이는 다시 듣겠다 한다
      'p2.4': [['paul', 'idle'], ['ph2', 'shrug', { look: -1.0 }], ['a2', 'rebuke', { y: AH, delay: 600 }], ['ph2', 'idle', { x: 1.95, z: 0.45, delay: 2200 }], ['ph2', 'idle', { show: 0, delay: 5600 }],
        ['a2', 'idle', { y: 0, x: 2.0, z: 0.0, delay: 2600 }], ['a2', 'idle', { show: 0, delay: 6000 }], ['ph1', 'listen', { look: 1.0, delay: 1200 }]],
      // 디오누시오와 다마리와 몇 사람이 믿는다
      'p2.5': [['ph2', 'idle', { show: 0 }], ['a2', 'idle', { show: 0 }], ['dio', 'idle', { y: 0, x: AX + 0.35, z: AZ + 0.12, look: -1.2 }], ['dam', 'idle', { show: 1, x: AX - 0.3, z: AZ + 0.4, look: 0.9 }],
        ['dio', 'pray', { delay: 2800 }], ['dam', 'pray', { delay: 3000 }], ['paul', 'bless', { to: 'dio', delay: 3200 }], ['t1', 'idle', { x: AX - 0.75, z: AZ + 0.5, look: 1.0, delay: 600 }]],
      w0: [['paul', 'point', { show: 1, x: AX - 0.05, z: AZ + 0.12, look: -1.45 }], ['ph1', 'listen', { show: 1, x: AX - 0.55, z: AZ + 0.05, look: 1.0 }], ['ph2', 'idle', { show: 0 }], ['a2', 'idle', { show: 0 }],
        ['paul', 'speak', { look: -0.6, to: 'ph1', delay: 2500 }]],
      w1: [['paul', 'speak', { look: 0.0, to: 'dio' }], ['dio', 'listen']],
      w2: [['paul', 'raise', { look: 0 }], ['paul', 'speak', { to: 'dio', delay: 2500 }]],
      end: [['@env', 'day'], ['paul', 'speak', { show: 1, x: AX - 0.05, z: AZ + 0.12, look: -0.5, to: 'ph1' }], ['ph1', 'listen', { show: 1, x: AX - 0.55, z: AZ + 0.05, look: 1.0 }],
        ['ph2', 'idle', { show: 1, x: AX + 0.5, z: AZ + 0.02, look: -1.0 }], ['a2', 'sit', { show: 1, y: AH + 0.09, x: AX + 0.35, z: AZ - 0.34, look: -0.4 }],
        ['dio', 'listen', { show: 1, y: AH + 0.09, x: AX + 0.05, z: AZ - 0.4, look: 0 }], ['t1', 'idle', { show: 0 }], ['t2', 'idle', { show: 0 }], ['dam', 'idle', { show: 0 }]],
    },
  },

  /* a20. 천막 깁는 친구들 — 고린도: 뒤에 기둥 줄 장터(colonnade, 가게들), 왼쪽 아굴라 부부의 천막 일터(tentshop), 오른쪽 회당(synagogue).
     항구 도시의 붐비는 사람들 사이로 바울이 오른쪽(동쪽 아테네 쪽)에서 들어와 고개 숙인다(약하고 두려워 떨며). 아굴라와 브리스길라가 일어나 맞고,
     셋이 펼친 염소털 천 둘레에 앉아 함께 깁는다. 안식일에는 회당에서 유대 사람과 헬라 사람을 설득하고, 다시 친구들 곁으로 */
  a20: {
    env: 'day',
    wide: 1.45,
    props: {
      street: ['colonnade', 0.35, -0.95, { w: 3.6, n: 9, h: 0.78 }],
      shop: ['tentshop', -1.1, -0.3, { w: 1.15 }],
      syn: ['synagogue', 1.35, -0.45, { scale: 0.72 }],
      folk: ['crowd', 0.2, -0.45, { spots: [[-0.15, 0.0], [0.2, -0.08], [0.55, 0.02], [0.05, 0.22]], face: 0, state: 'stand' }],
    },
    cast: {
      paul: ['paul', 2.0, 0.42, -1.3],
      aquila: ['aquila', -1.2, -0.12, 0.4, { pose: 'sit-ground' }],
      prisc: ['priscilla', -0.88, -0.25, 0.1, { pose: 'sit-ground' }],
      c1: ['greek', -0.4, 0.55, 1.4, { gaze: false }],
      sailor: ['sailor', 0.8, 0.12, -1.3, { gaze: false }],
      j1: ['jewD', 1.05, -0.5, 0.4, { gaze: false }],
      g1: ['greek2', 1.6, -0.5, -0.4, { gaze: false }],
    },
    beats: {
      // 함께 지내며 일한다 — 천 둘레에 셋이 앉아 깁는다
      enter: [['paul', 'sit-ground', { x: -1.0, z: 0.2, look: -0.4 }], ['aquila', 'sit-speak', { to: 'paul' }], ['prisc', 'sit-ground'], ['j1', 'idle', { show: 0 }], ['g1', 'idle', { show: 0 }]],
      // 바울은 아테네를 떠나 고린도로 — 오른쪽에서 들어온다
      intro: [['@env', 'day'], ['j1', 'idle', { show: 0 }], ['g1', 'idle', { show: 0 }], ['aquila', 'sit-ground'], ['prisc', 'sit-ground']],
      'p0.0': [['paul', 'idle', { x: 1.0, z: 0.42, look: -1.3 }]],
      // 배와 상인들로 붐비는 큰 도시
      'p0.1': [['paul', 'idle', { x: 1.0, z: 0.42, look: -0.4 }], ['sailor', 'idle', { x: -0.2, z: 0.05 }], ['c1', 'idle', { x: 1.6, z: 0.6, delay: 600 }],
        ['sailor', 'idle', { show: 0, x: -0.6, z: 0.0, delay: 4800 }], ['c1', 'idle', { show: 0, delay: 5600 }]],
      // 약하고 두려워 몹시 떨면서 — 고개를 숙인다
      'p0.2': [['sailor', 'idle', { show: 0 }], ['c1', 'idle', { show: 0 }], ['paul', 'idle', { look: -1.0 }]],
      'p0.3': [['paul', 'bow', { look: -0.6 }]],
      // 아굴라를 만난다 — 천막 일터 앞으로
      'p1.0': [['paul', 'idle', { x: -0.4, z: 0.25, look: -1.2 }], ['aquila', 'idle', { x: -0.85, z: 0.15, look: 1.2, delay: 2800 }], ['aquila', 'speak', { to: 'paul', delay: 3500 }]],
      // 아내 브리스길라와 함께 이탈리아에서 온 사람
      'p1.1': [['paul', 'idle', { x: -0.4, z: 0.25 }], ['aquila', 'idle', { x: -0.85, z: 0.15, look: 1.2 }], ['prisc', 'idle', { x: -0.75, z: -0.15, look: 1.1 }], ['prisc', 'bow', { delay: 1800 }]],
      // 글라우디오 황제가 로마를 떠나라 명했기 때문 — 서쪽을 가리킨다
      'p1.2': [['prisc', 'idle'], ['aquila', 'point', { look: -1.4 }], ['aquila', 'speak', { to: 'paul', delay: 2600 }]],
      // 천막을 만드는 사람들 — 바울도 같은 일을
      'p1.3': [['aquila', 'idle'], ['paul', 'speak', { to: 'aquila' }], ['aquila', 'raise', { delay: 2200 }], ['prisc', 'idle', { look: 0.8, delay: 2200 }]],
      // 그 집에 머물며 함께 일한다
      'p2.0': [['aquila', 'sit-ground', { x: -1.2, z: -0.12, look: 0.4 }], ['prisc', 'sit-ground', { x: -0.88, z: -0.25, look: 0.1 }], ['paul', 'sit-ground', { x: -1.0, z: 0.2, look: -0.4 }],
        ['aquila', 'sit-speak', { to: 'paul', delay: 3000 }]],
      // 안식일마다 회당에서 설득한다
      'p2.1': [['aquila', 'sit-ground'], ['paul', 'idle', { x: 1.0, z: -0.05, look: -0.2 }], ['j1', 'sit', { show: 1, delay: 600 }], ['g1', 'sit', { show: 1, delay: 800 }],
        ['paul', 'speak', { to: 'j1', delay: 4500 }]],
      // 오래도록 바울의 동역자 — 셋이 함께 선다
      'p2.2': [['paul', 'idle', { x: -0.45, z: 0.3, look: -1.1 }], ['aquila', 'idle', { x: -0.85, z: 0.2, look: 1.2, delay: 1500 }], ['prisc', 'idle', { x: -0.7, z: 0.0, look: 1.0, delay: 1700 }],
        ['j1', 'idle', { show: 0, delay: 1000 }], ['g1', 'idle', { show: 0, delay: 1200 }]],
      'p2.3': [['j1', 'idle', { show: 0 }], ['g1', 'idle', { show: 0 }], ['paul', 'speak', { to: 'aquila' }]],
      'p2.4': [['paul', 'embrace', { look: -1.1 }], ['aquila', 'embrace', { look: 1.2, delay: 300 }], ['prisc', 'pray']],
      w0: [['paul', 'sit-ground', { x: -1.0, z: 0.2, look: -0.4 }], ['aquila', 'sit-ground', { x: -1.2, z: -0.12, look: 0.4 }], ['prisc', 'sit-ground', { x: -0.88, z: -0.25, look: 0.1 }]],
      w1: [['paul', 'bow', { x: 1.0, z: 0.42, look: -0.6 }]],
      w2: [['paul', 'speak', { x: -0.45, z: 0.3, look: -1.1, to: 'aquila' }], ['aquila', 'listen', { x: -0.85, z: 0.2, look: 1.2 }], ['prisc', 'listen', { x: -0.7, z: 0.0, look: 1.0 }]],
      end: [['@env', 'day'], ['paul', 'sit-ground', { show: 1, x: -1.0, z: 0.2, look: -0.4 }], ['aquila', 'sit-speak', { show: 1, x: -1.2, z: -0.12, look: 0.4, to: 'paul' }],
        ['prisc', 'sit-ground', { show: 1, x: -0.88, z: -0.25, look: 0.1 }], ['j1', 'idle', { show: 0 }], ['g1', 'idle', { show: 0 }], ['c1', 'idle', { show: 0 }], ['sailor', 'idle', { show: 0 }]],
    },
  },

  /* a21. 두려워하지 말고 말하라 — 고린도: 왼쪽 앞 편지 쓰는 낮은 상(desk), 가운데 뒤 회당(synagogue)과 바로 옆 디도 유스도의 집(house), 오른쪽 총독의 재판석(bema)에 앉은 갈리오.
     실라와 디모데가 와서 기쁜 소식을 전하고, 셋이 앉아 데살로니가 교회에 편지를 쓴다. 회당의 반대에 바울이 옷을 털고 옆집으로 옮기고, 회당장 그리스보가 세례를 받는다.
     밤 — 주님은 빛으로만(beam), 무릎 꿇은 바울에게 말씀하신다. 유대 사람들이 바울을 재판석 앞으로 끌고 오지만 갈리오가 손을 저어 물리치고, 그들은 흩어진다 */
  a21: {
    env: 'day',
    wide: 1.5,
    props: {
      desk: ['desk', -1.5, 0.5],
      syn: ['synagogue', -0.45, -0.55, { scale: 0.72 }],
      home: ['house', 0.62, -0.6, { door: true, stair: false, wall: '#d6c09a' }],
      seat: ['bema', 1.6, -0.42, { w: 0.9 }],
      night: ['beam', -0.05, 0.3, { r: 0.42, h: 2.4 }],
      water: ['pour', 0.45, 0.25, { h: 0.8 }],
      folk: ['crowd', 0, 0, { spots: [[-0.2, 0.62], [0.12, 0.66], [0.42, 0.6]], face: Math.PI, state: 'sit' }],
    },
    cast: {
      paul: ['paulS', -0.75, 0.3, 1.2],
      silas: ['silas', 2.0, 0.35, -1.3],
      tim: ['timothy', 2.1, 0.6, -1.3],
      j1: ['jewD', -0.6, -0.42, 0.4],
      j2: ['pharisee', -0.25, -0.45, 0.2],
      crispus: ['ruler', -0.75, -0.6, 0.6, { gaze: false }],
      titius: ['greek2', 0.85, -0.1, -0.6],
      gallio: ['governor', 1.6, -0.5, 0, { y: 0.36, pose: 'sit' }],
      lictor: ['lictor', 2.0, -0.25, -0.6, { gaze: false }],
    },
    beats: {
      // 갈리오의 법정 — 바울은 해를 입지 않는다
      enter: [['night', null, { show: 0 }], ['water', 'idle'], ['folk', 'sit', { show: 0 }], ['silas', 'idle', { show: 0 }], ['tim', 'idle', { show: 0 }], ['crispus', 'idle', { show: 0 }],
        ['paul', 'idle', { x: 1.25, z: 0.22, look: 0.6 }], ['gallio', 'rebuke', { to: 'j1' }], ['j1', 'shrug', { x: 0.6, z: 0.35, look: 1.4 }], ['j2', 'idle', { x: 0.35, z: 0.2, look: 1.3 }]],
      // 실라와 디모데가 마게도냐에서 내려온다
      intro: [['@env', 'day'], ['night', null, { show: 0 }], ['water', 'idle'], ['desk', 'idle'], ['home', 'idle'], ['folk', 'sit', { show: 0 }], ['crispus', 'idle', { show: 0 }],
        ['silas', 'idle', { x: 0.45, z: 0.42, look: -1.3 }], ['tim', 'idle', { x: 0.65, z: 0.62, look: -1.3 }], ['j1', 'idle', { show: 0 }], ['j2', 'idle', { show: 0 }]],
      'p0.0': [['silas', 'idle', { x: -0.4, z: 0.38, look: -1.3 }], ['tim', 'idle', { x: -0.25, z: 0.62, look: -1.3, delay: 300 }], ['paul', 'embrace', { look: 1.2, delay: 2400 }], ['silas', 'embrace', { delay: 2600 }]],
      // 데살로니가 교회가 믿음과 사랑을 지킨다는 기쁜 소식
      'p0.1': [['paul', 'idle'], ['silas', 'idle'], ['tim', 'speak', { to: 'paul' }], ['paul', 'raise', { look: 0.8, delay: 3800 }]],
      // 셋이 함께 편지를 보낸다 — 낮은 상에 앉는다
      'p0.2': [['tim', 'idle'], ['paul', 'sit-ground', { x: -1.5, z: 0.28, look: 0.1 }], ['silas', 'sit-ground', { x: -1.85, z: 0.5, look: 1.3 }], ['tim', 'sit-ground', { x: -1.12, z: 0.55, look: -1.3 }],
        ['desk', 'write', { delay: 2600 }]],
      'p0.3': [['paul', 'sit-speak', { to: 'silas' }], ['desk', 'write']],
      'p0.4': [['paul', 'sit', { look: 0.1 }], ['desk', 'write']],
      // 두 번째 편지도 — 새 종이에 다시
      'p0.5': [['desk', 'idle'], ['desk', 'write', { delay: 700 }], ['paul', 'sit-speak', { to: 'tim' }]],
      // 회당의 반대가 거세다
      'p1.0': [['desk', 'done'], ['paul', 'speak', { x: -0.45, z: 0.12, look: 0.2, to: 'j1' }], ['silas', 'idle', { x: -0.85, z: 0.35, look: 1.0 }], ['tim', 'idle', { x: -1.05, z: 0.55, look: 1.0 }],
        ['j1', 'rebuke', { show: 1, to: 'paul' }], ['j2', 'point', { show: 1, look: -0.2, delay: 600 }], ['crispus', 'listen', { show: 1, delay: 300 }]],
      // 옷을 털고 — 바로 옆 디도 유스도의 집으로
      'p1.1': [['j1', 'rebuke'], ['paul', 'shrug', { look: 0.2 }], ['paul', 'idle', { x: 0.62, z: -0.05, look: 0.8, delay: 2600 }], ['home', 'open', { delay: 3600 }], ['titius', 'bow', { to: 'paul', delay: 4600 }]],
      // 회당장 그리스보가 믿고, 많은 사람이 세례를 받는다
      'p1.2': [['home', 'open'], ['j1', 'idle', { look: 1.2 }], ['j2', 'idle', { look: 1.0 }], ['titius', 'idle'], ['paul', 'idle', { x: 0.62, z: -0.05, look: 0.2 }],
        ['crispus', 'kneel', { x: 0.45, z: 0.25, look: 0.6 }], ['paul', 'anoint', { x: 0.62, z: 0.12, look: -1.2, delay: 2800 }], ['water', 'pour', { delay: 3200 }], ['water', 'idle', { delay: 6400 }],
        ['folk', 'sit', { show: 1, delay: 1500 }]],
      // 어느 밤 — 무릎 꿇은 바울에게 빛이 내린다 (주님은 빛과 목소리로만)
      'p1.3': [['water', 'idle'], ['@env', 'night'], ['folk', 'sit', { show: 0 }], ...hide('j1', 'j2', 'crispus', 'titius', 'silas', 'tim'),
        ['paul', 'kneel', { x: -0.05, z: 0.3, look: 0.2 }], ['night', null, { show: 1, delay: 1200 }], ['paul', 'look-up', { delay: 2600 }]],
      'p1.4': [['night', null, { show: 1 }], ['paul', 'look-up']],
      'p1.5': [['paul', 'kneel', { look: 0.3 }]],
      // 일 년 반 동안 가르친다
      'p2.0': [['@env', 'day'], ['night', null, { show: 0 }], ['folk', 'sit', { show: 1 }], ['paul', 'speak', { x: 0.2, z: 0.3, look: 0.8, to: 'titius' }],
        ['titius', 'listen', { show: 1, x: 0.85, z: 0.2, look: -1.2 }], ['crispus', 'listen', { show: 1, x: 0.0, z: 0.05, look: 1.0 }], ['silas', 'idle', { show: 1, x: -0.4, z: 0.38, look: 1.2 }], ['tim', 'idle', { show: 1, x: -0.3, z: 0.62, look: 1.2 }]],
      // 갈리오 총독 때 — 유대 사람들이 바울을 재판석 앞으로 끌고 간다
      'p2.1': [['folk', 'sit', { show: 0 }], ['paul', 'idle'], ['crispus', 'idle', { show: 0 }], ['silas', 'idle', { x: -0.2, z: 0.45 }], ['tim', 'idle', { x: -0.05, z: 0.62 }],
        ['j1', 'rebuke', { show: 1, x: 0.6, z: 0.35, look: 1.4 }], ['j2', 'point', { show: 1, x: 0.35, z: 0.2, look: 1.3, delay: 400 }], ['titius', 'idle', { x: 0.9, z: -0.05 }],
        ['paul', 'idle', { x: 1.25, z: 0.22, look: 0.6, delay: 800 }], ['lictor', 'idle', { look: -1.2 }]],
      // 바울이 입을 열려 하자 — 갈리오가 유대 사람들에게 말한다
      'p2.2': [['paul', 'idle', { x: 1.25, z: 0.22 }], ['j1', 'idle', { x: 0.6, z: 0.35 }], ['j2', 'idle', { x: 0.35, z: 0.2 }], ['paul', 'raise', { look: 0.4, delay: 300 }], ['paul', 'idle', { delay: 2600 }],
        ['gallio', 'speak', { to: 'j1', delay: 2400 }]],
      'p2.3': [['gallio', 'speak', { to: 'j1' }], ['j1', 'listen']],
      // 나는 이런 일의 재판관이 되고 싶지 않다 — 손을 저어 물리친다
      'p2.4': [['gallio', 'rebuke', { to: 'j1' }], ['j1', 'shrug', { delay: 800 }], ['j2', 'shrug', { delay: 1000 }], ['lictor', 'point', { look: -1.4, delay: 1500 }]],
      // 아무도 바울을 해치지 못했다 — 그들은 흩어지고, 바울은 동역자들에게 돌아온다
      'p2.5': [['gallio', 'idle', { look: 0 }], ['lictor', 'idle'], ['j1', 'idle', { x: -1.9, z: 0.0 }], ['j2', 'idle', { x: -1.95, z: 0.25, delay: 300 }], ['j1', 'idle', { show: 0, delay: 4200 }], ['j2', 'idle', { show: 0, delay: 4500 }],
        ['paul', 'idle', { x: 0.3, z: 0.38, look: -1.2, delay: 1200 }], ['silas', 'raise', { delay: 2000 }], ['tim', 'pray', { delay: 2200 }]],
      w0: [['@env', 'night'], ['night', null, { show: 1 }], ['folk', 'sit', { show: 0 }], ['desk', 'done'], ['water', 'idle'], ...hide('j1', 'j2', 'crispus', 'titius', 'silas', 'tim'),
        ['paul', 'look-up', { show: 1, x: -0.05, z: 0.3, look: 0.2 }]],
      w1: [['@env', 'day'], ['night', null, { show: 0 }], ['desk', 'write'], ['paul', 'sit-speak', { x: -1.5, z: 0.28, look: 0.1, to: 'silas' }], ['silas', 'sit-ground', { show: 1, x: -1.85, z: 0.5, look: 1.3 }],
        ['tim', 'sit-ground', { show: 1, x: -1.12, z: 0.55, look: -1.3 }]],
      w2: [['desk', 'idle'], ['desk', 'write', { delay: 600 }], ['paul', 'sit-speak', { to: 'tim' }]],
      end: [['@env', 'day'], ['night', null, { show: 0 }], ['water', 'idle'], ['desk', 'done'], ['folk', 'sit', { show: 0 }], ['crispus', 'idle', { show: 0 }], ['titius', 'idle', { show: 1, x: 0.9, z: -0.05, look: -0.6 }],
        ['paul', 'idle', { show: 1, x: 1.25, z: 0.22, look: 0.6 }], ['gallio', 'rebuke', { show: 1, to: 'j1' }], ['j1', 'shrug', { show: 1, x: 0.6, z: 0.35, look: 1.4 }], ['j2', 'idle', { show: 1, x: 0.35, z: 0.2, look: 1.3 }],
        ['silas', 'idle', { show: 1, x: -0.2, z: 0.45, look: 1.2 }], ['tim', 'idle', { show: 1, x: -0.05, z: 0.62, look: 1.2 }]],
    },
  },
};

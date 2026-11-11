/* 바울 여정 대본 묶음 a: a01–a11 (stage/paul.js가 합친다)
   스데반의 돌무더기에서 첫 선교 여행을 마치고 수리아 안디옥으로 돌아오기까지. 사울은 젊은 바리새인 sauly → 눈먼 saulB → 사도 paul(지팡이)·paulS(지팡이 없이).
   주님은 모습 없이 빛(heavenlight·beam)과 목소리로만, 성령도 빛으로. 돌로 치는 일(a01 스데반, a10 루스드라)은 날아가 땅에 떨어지는 돌과 흙먼지(stonethrow)·
   무릎 꿇은 사람·빛으로만 — 맞는 모습·피·상처 없음. 스데반은 빛 속에 누워 잠들듯 고요히 사라진다. 엘루마의 눈 멂은 머리 둘레의 잿빛 안개(haze)로 */

// 무리(crowd)의 자리: 가운데를 둘러 n명을 흩어 놓는다 (kings와 같다)
const flock = (n, rx, rz, seed = 1) => Array.from({ length: n }, (_, i) => {
  const a = i * 2.399 + seed, r = Math.sqrt((i + 0.5) / n);
  return [Math.cos(a) * r * rx, Math.sin(a) * r * rz];
});
// 공의회 반원 의자의 자리 (council 소품 자리 cx, cz, 반지름 R, 각도 a — π가 왼끝, 1.5π가 뒤, 2π가 오른끝)
const seat = (cx, cz, a, R = 0.85) => [cx + Math.cos(a) * R, cz + 0.15 + Math.sin(a) * R * 0.82];

// a01 공의회(왼쪽)의 자리 — 무대 가운데보다 왼쪽에 두고, 오른쪽은 성 밖 돌밭
const CX = -0.75, CZ = -0.25;
const S1 = seat(CX, CZ, Math.PI * 1.13), S2 = seat(CX, CZ, Math.PI * 1.36), S3 = seat(CX, CZ, Math.PI * 1.64), S4 = seat(CX, CZ, Math.PI * 1.87);
const look = ([x, z], [tx, tz]) => Math.atan2(tx - x, tz - z); // (x, z)에서 (tx, tz)를 보는 방향
const ST = [CX, CZ + 0.3]; // 공의회 가운데 선 스데반

export const A = {
  /* a01. 스데반의 돌무더기 앞에서 — 왼쪽은 공의회의 반원 돌 의자(council), 가운데 선 스데반이 의원들을 향해 말하고 하늘을 우러른다(빛이 내린다).
     무리가 달려들어 성 밖(오른쪽 돌밭)으로 끌고 간다 — 3D 지형에서는 무대를 동쪽 성벽 밖 기드론 비탈로 옮긴다(@at).
     증인들이 겉옷을 젊은 사울의 발 앞에 벗어 두고, 돌은 날아가 스데반 앞 땅에 떨어진다(맞는 모습 없음). 스데반은 빛 속에 무릎 꿇어 기도하고
     누워 잠들듯 고요히 빛 속으로 사라진다. 사울은 그것을 지켜보다가, 성전 경비병들과 함께 성 안으로 들어간다(박해) */
  a01: {
    env: 'day',
    wide: 1.45,
    props: {
      council: ['council', CX, CZ, { r: 0.85 }],
      beam: ['beam', ST[0], ST[1], { r: 0.38, h: 2.6, on: 'stephen' }],
      rocks: ['rocks', 0, 0, { terrain: false, spots: [[2.25, -0.55, 0.12], [1.95, 0.55, 0.09], [2.35, 0.2, 0.08], [1.2, -0.7, 0.1]] }],
      throwA: ['stonethrow', 0.72, -0.28, { h: 0.7, dx: 0.6, dz: 0.22 }],
      throwB: ['stonethrow', 0.82, 0.22, { h: 0.7, dx: 0.5, dz: -0.08 }],
      pile: ['cloakpile', 0.38, 0.66],
    },
    cast: {
      stephen: ['stephen', ST[0], ST[1], 0.2],
      hp: ['highpriest', CX, CZ + 0.15 - 0.85 * 0.82 - 0.36, 0, { y: 0.22, pose: 'sit', gaze: false }],
      c1: ['councilor', S1[0], S1[1], look(S1, ST), { y: 0.12, pose: 'sit' }],
      c2: ['pharisee', S2[0], S2[1], look(S2, ST), { y: 0.12, pose: 'sit' }],
      c3: ['sadducee', S3[0], S3[1], look(S3, ST), { y: 0.12, pose: 'sit' }],
      c4: ['elder', S4[0], S4[1], look(S4, ST), { y: 0.12, pose: 'sit' }],
      w1: ['witness', -0.05, 0.42, -1.1],
      w2: ['hellenist', -1.5, 0.42, 1.1],
      saul: ['sauly', 0.35, 0.05, -1.2, { gaze: false }],
      g1: ['templeguard', -2.0, 0.55, -1.3, { gaze: false }],
      g2: ['templeguard', -2.0, 0.25, -1.3, { gaze: false }],
    },
    beats: {
      enter: [['@at', [31.7801, 35.2392], { x: -0.1, z: 0.02 }], ['council', null, { show: 0 }], ['hp', 'idle', { show: 0 }], ['beam', null, { show: 1 }],
        ['stephen', 'kneel', { x: 1.6, z: 0.02, look: -0.5 }], ['saul', 'idle', { x: 0.28, z: 0.58, look: 1.2 }], ['pile', null, { show: 1 }],
        ['w1', 'idle', { x: 0.72, z: -0.28, look: 1.4 }], ['w2', 'idle', { x: 0.82, z: 0.22, look: 1.5 }],
        ['c1', 'idle', { y: 0, x: 0.1, z: -0.45, look: 1.3 }], ['c2', 'idle', { y: 0, x: -0.25, z: -0.15, look: 1.3 }], ['c3', 'idle', { y: 0, x: 0.35, z: -0.62, look: 1.3 }], ['c4', 'idle', { y: 0, x: -0.2, z: 0.3, look: 1.3 }],
        ['g1', 'idle', { show: 0 }], ['g2', 'idle', { show: 0 }]],
      // 공의회 — 스데반이 의원들 앞에서 말하고 있다
      intro: [['@env', 'day'], ['@at', null], ['beam', null, { show: 0 }], ['throwA', 'idle'], ['throwB', 'idle'], ['pile', null, { show: 0 }],
        ['g1', 'idle', { show: 0 }], ['g2', 'idle', { show: 0 }], ['stephen', 'speak', { to: 'hp' }]],
      // 분을 참지 못하고 이를 갈았다 — 의원들이 일어선다
      'p0.0': [['stephen', 'idle'], ['c1', 'rebuke', { y: 0, x: S1[0] + 0.12, z: S1[1] + 0.12 }], ['c4', 'rebuke', { y: 0, x: S4[0] - 0.12, z: S4[1] + 0.12, delay: 500 }],
        ['c2', 'sit-speak', { delay: 900 }], ['w1', 'point', { look: -1.2 }]],
      'p0.1': [['stephen', 'speak', { to: 'c2' }], ['c3', 'sit-speak', { delay: 2200 }]],
      // 성령이 가득한 스데반이 하늘을 우러러본다 — 빛이 내린다
      'p0.2': [['stephen', 'look-up', { look: 0.1 }], ['beam', null, { show: 1 }], ['c1', 'idle'], ['c4', 'idle'], ['c2', 'sit'], ['c3', 'sit'], ['w1', 'idle']],
      'p0.3': [['stephen', 'look-up']],
      'p0.4': [['stephen', 'raise', { look: 0.1 }]],
      // 귀를 막고 소리 지르며 달려들어 성 밖으로 — 공의회 자리는 걷히고 무리는 오른쪽 돌밭으로 (3D에서는 동쪽 성벽 밖 기드론 비탈로 무대를 옮긴다)
      'p1.0': [['beam', null, { show: 0 }], ['c2', 'afraid', { y: 0 }], ['c3', 'afraid', { y: 0, delay: 300 }], ['hp', 'rebuke', { y: 0.22 }],
        ['@at', [31.7801, 35.2392], { x: -0.1, z: 0.02, delay: 1800 }], ['council', null, { show: 0, delay: 2600 }], ['hp', 'idle', { show: 0, delay: 2200 }],
        ['stephen', 'idle', { x: 1.6, z: 0.02, look: -0.5, delay: 1200 }], ['w1', 'idle', { x: 1.25, z: 0.3, delay: 1000 }], ['w2', 'idle', { x: 1.2, z: -0.25, delay: 1100 }],
        ['c1', 'idle', { y: 0, x: 0.1, z: -0.45, look: 1.3, delay: 1600 }], ['c2', 'idle', { y: 0, x: -0.25, z: -0.15, look: 1.3, delay: 1900 }], ['c3', 'idle', { y: 0, x: 0.35, z: -0.62, look: 1.3, delay: 2100 }],
        ['c4', 'idle', { y: 0, x: -0.2, z: 0.3, look: 1.3, delay: 1700 }], ['saul', 'idle', { x: 0.28, z: 0.58, look: 1.2, delay: 1400 }]],
      // 증인들이 겉옷을 벗어 사울의 발 앞에 둔다
      'p1.1': [['council', null, { show: 0 }], ['hp', 'idle', { show: 0 }], ['stephen', 'idle', { x: 1.6, z: 0.02, look: -0.5 }],
        ['w1', 'bow', { x: 0.55, z: 0.7, look: -1.2 }], ['w2', 'bow', { x: 0.5, z: 0.48, look: -1.4, delay: 700 }], ['pile', null, { show: 0.45, delay: 2200 }], ['pile', null, { show: 1, delay: 3400 }],
        ['w1', 'idle', { x: 0.72, z: -0.28, look: 1.4, delay: 3800 }], ['w2', 'idle', { x: 0.82, z: 0.22, look: 1.5, delay: 4200 }], ['saul', 'idle', { look: 1.3 }]],
      // 돌이 날아드는 가운데 스데반이 기도한다 — 빛이 그를 덮는다 (돌은 그 앞 땅에 떨어진다)
      'p1.2': [['pile', null, { show: 1 }], ['w1', 'hurl', { x: 0.72, z: -0.28, look: 1.4 }], ['w2', 'hurl', { x: 0.82, z: 0.22, look: 1.5 }], ['throwA', 'throw'], ['throwB', 'throw', { delay: 500 }],
        ['beam', null, { show: 1 }], ['stephen', 'pray', { look: -0.3 }], ['c1', 'rebuke'], ['c4', 'rebuke', { delay: 600 }]],
      'p1.3': [['stephen', 'look-up']],
      'p2.0': [['stephen', 'kneel', { look: -0.6 }]],
      'p2.1': [['stephen', 'kneel', { look: -0.9 }]],
      // 잠들듯 — 돌이 그치고, 스데반은 빛 속에 무릎 꿇은 채 고개를 숙인다 (누운 모습은 상여처럼 보여 그리지 않는다)
      'p2.2': [['throwA', 'idle'], ['throwB', 'idle'], ['w1', 'idle'], ['w2', 'idle'], ['c1', 'idle'], ['c4', 'idle'], ['stephen', 'pray', { look: -0.5, delay: 800 }]],
      // 사울은 그것을 마땅하게 여겼다 — 서서 지켜본다. 빛 속에서 스데반이 사라진다
      'p2.3': [['saul', 'idle', { look: 1.0 }], ['stephen', 'pray', { show: 0, delay: 2500 }], ['beam', null, { show: 0, delay: 4500 }],
        ['w1', 'idle', { x: 1.75, z: -0.55, delay: 800 }], ['w1', 'idle', { show: 0, delay: 3500 }], ['c3', 'idle', { x: 1.9, z: -0.7, delay: 1200 }], ['c3', 'idle', { show: 0, delay: 4200 }]],
      // 큰 박해 — 사울이 성전 경비병들을 데리고 성 안(왼쪽)으로 들어간다
      'p2.4': [['stephen', 'pray', { show: 0 }], ['beam', null, { show: 0 }], ['w1', 'idle', { show: 0 }], ['c3', 'idle', { show: 0 }],
        ['g1', 'idle', { show: 1, x: 0.0, z: 0.6, look: 1 }], ['g2', 'idle', { show: 1, x: -0.05, z: 0.32, look: 1, delay: 300 }],
        ['saul', 'speak', { to: 'g1', delay: 2400 }], ['saul', 'idle', { x: -1.6, z: 0.45, delay: 4600 }], ['g1', 'idle', { x: -1.75, z: 0.65, delay: 4900 }], ['g2', 'idle', { x: -1.7, z: 0.25, delay: 5100 }],
        ['saul', 'idle', { show: 0, delay: 8400 }], ['g1', 'idle', { show: 0, delay: 8700 }], ['g2', 'idle', { show: 0, delay: 8900 }],
        ['c1', 'idle', { x: -1.3, z: -0.4, delay: 3000 }], ['c2', 'idle', { x: -1.5, z: -0.1, delay: 3300 }], ['c4', 'idle', { x: -1.4, z: 0.1, delay: 3600 }], ['w2', 'idle', { x: -1.6, z: -0.3, delay: 3900 }],
        ['c1', 'idle', { show: 0, delay: 6600 }], ['c2', 'idle', { show: 0, delay: 6900 }], ['c4', 'idle', { show: 0, delay: 7200 }], ['w2', 'idle', { show: 0, delay: 7400 }]],
      w0: [['@at', null], ['council', null, { show: 1 }], ['hp', 'sit', { show: 1, y: 0.22 }], ['beam', null, { show: 1 }], ['throwA', 'idle'], ['throwB', 'idle'], ['pile', null, { show: 0 }],
        ['stephen', 'raise', { show: 1, x: ST[0], z: ST[1], look: 0.1 }], ['saul', 'idle', { show: 1, x: 0.35, z: 0.05, look: -1.2 }],
        ['c1', 'rebuke', { show: 1, y: 0, x: S1[0] + 0.12, z: S1[1] + 0.12, look: look(S1, ST) }], ['c2', 'sit', { show: 1, y: 0.12, x: S2[0], z: S2[1], look: look(S2, ST) }],
        ['c3', 'sit', { show: 1, y: 0.12, x: S3[0], z: S3[1], look: look(S3, ST) }], ['c4', 'rebuke', { show: 1, y: 0, x: S4[0] - 0.12, z: S4[1] + 0.12, look: look(S4, ST) }],
        ['w1', 'idle', { show: 1, x: -0.05, z: 0.42, look: -1.1 }], ['w2', 'idle', { show: 1, x: -1.5, z: 0.42, look: 1.1 }], ['g1', 'idle', { show: 0 }], ['g2', 'idle', { show: 0 }]],
      w1: [['@at', [31.7801, 35.2392], { x: -0.1, z: 0.02 }], ['council', null, { show: 0 }], ['hp', 'idle', { show: 0 }], ['beam', null, { show: 1 }], ['pile', null, { show: 1 }],
        ['stephen', 'pray', { show: 1, x: 1.6, z: 0.02, look: -0.3 }], ['saul', 'idle', { show: 1, x: 0.28, z: 0.58, look: 1.2 }],
        ['w1', 'hurl', { show: 1, x: 0.72, z: -0.28, look: 1.4 }], ['w2', 'hurl', { show: 1, x: 0.82, z: 0.22, look: 1.5 }], ['throwA', 'throw'], ['throwB', 'throw'],
        ['c1', 'rebuke', { show: 1, y: 0, x: 0.1, z: -0.45, look: 1.3 }], ['c2', 'idle', { show: 1, y: 0, x: -0.25, z: -0.15, look: 1.3 }], ['c3', 'idle', { show: 1, y: 0, x: 0.35, z: -0.62, look: 1.3 }],
        ['c4', 'rebuke', { show: 1, y: 0, x: -0.2, z: 0.3, look: 1.3 }], ['g1', 'idle', { show: 0 }], ['g2', 'idle', { show: 0 }]],
      w2: [['throwA', 'idle'], ['throwB', 'idle'], ['w1', 'idle'], ['w2', 'idle'], ['c1', 'idle'], ['c4', 'idle'], ['stephen', 'kneel', { look: -0.9 }]],
      end: [['@at', [31.7801, 35.2392], { x: -0.1, z: 0.02 }], ['council', null, { show: 0 }], ['hp', 'idle', { show: 0 }], ['beam', null, { show: 1 }], ['throwA', 'idle'], ['throwB', 'idle'], ['pile', null, { show: 1 }],
        ['stephen', 'kneel', { show: 1, x: 1.6, z: 0.02, look: -0.5 }], ['saul', 'idle', { show: 1, x: 0.28, z: 0.58, look: 1.2 }],
        ['w1', 'idle', { show: 1, x: 0.72, z: -0.28, look: 1.4 }], ['w2', 'idle', { show: 1, x: 0.82, z: 0.22, look: 1.5 }],
        ['c1', 'idle', { show: 1, y: 0, x: 0.1, z: -0.45, look: 1.3 }], ['c2', 'idle', { show: 1, y: 0, x: -0.25, z: -0.15, look: 1.3 }], ['c3', 'idle', { show: 1, y: 0, x: 0.35, z: -0.62, look: 1.3 }],
        ['c4', 'idle', { show: 1, y: 0, x: -0.2, z: 0.3, look: 1.3 }], ['g1', 'idle', { show: 0 }], ['g2', 'idle', { show: 0 }]],
    },
  },

  /* a02. 다메섹 길의 빛 — 무대를 가로지르는 길, 오른쪽 뒤에 멀리 다메섹 성(farcity). 처음에 대제사장이 편지(두루마리)를 건네고(옛 자리를 잠깐 떠올리듯 왼쪽 끝),
     사울이 경비병들과 길을 간다. 하늘에서 흰 빛이 쏟아지고(heavenlight — 주님의 모습은 없다), 사울은 땅에 엎드린다. 목소리가 말할 때 빛이 숨 쉬듯 밝아진다.
     함께 가던 사람들은 놀라 두리번거린다(아무도 보이지 않는다). 빛이 걷히고 일어선 사울은 눈이 멀었다(saulB로 바꿔 낀다) — 동행이 손을 끌고 다메섹으로 */
  a02: {
    env: 'day',
    wide: 1.45,
    props: {
      road: ['road', 0, 0.12, { len: 5.2, w: 0.46, rot: 0.06 }],
      city: ['farcity', 2.05, -0.85, { dia: 0.95 }],
      rocks: ['rocks', 0, 0, { spots: [[-1.2, -0.6, 0.1], [0.9, -0.55, 0.08], [-0.4, 0.75, 0.09], [1.5, 0.7, 0.07]] }],
      light: ['heavenlight', 0.25, 0.1, { r: 0.7, h: 3.4 }],
    },
    cast: {
      saul: ['sauly', -1.55, 0.18, 1.3],
      blind: ['saulB', 0.25, 0.12, 0.2, { gaze: false }],
      g1: ['templeguard', -1.85, -0.12, 1.3, { gaze: false }],
      g2: ['templeguard', -1.95, 0.42, 1.3, { gaze: false }],
      hp: ['highpriest', -2.05, 0.15, 1.2, { gaze: false }],
    },
    beats: {
      enter: [['light', 'on', { show: 1 }], ['hp', 'idle', { show: 0 }], ['blind', 'idle', { show: 0 }], ['saul', 'mourn', { x: 0.25, z: 0.12, look: 0.3 }],
        ['g1', 'afraid', { x: -0.35, z: -0.15, look: 1.2 }], ['g2', 'afraid', { x: -0.4, z: 0.42, look: 1.0 }]],
      // 위협과 살기 — 젊은 바리새인이 길 떠날 채비를 한다
      intro: [['@env', 'day'], ['light', 'on', { show: 0 }], ['hp', 'idle', { show: 0 }], ['blind', 'idle', { show: 0 }], ['saul', 'idle', { look: 1.3 }]],
      'p0.0': [['saul', 'rebuke', { look: 1.0 }]],
      // 대제사장에게서 다메섹 회당들에 보낼 편지를 받는다
      'p0.1': [['hp', 'idle', { show: 1, item: 'scroll', look: 1.2 }], ['saul', 'idle', { look: -1.2 }], ['saul', 'idle', { item: 'scroll', delay: 2600 }], ['hp', 'speak', { item: null, to: 'saul', delay: 2600 }]],
      'p0.2': [['saul', 'speak', { to: 'g1' }], ['hp', 'idle']],
      // 먼 길에 오른다
      'p0.3': [['hp', 'idle', { show: 0 }], ['saul', 'idle', { x: -0.05, z: 0.13, look: 1.3 }], ['g1', 'idle', { x: -0.45, z: -0.12, delay: 300 }], ['g2', 'idle', { x: -0.55, z: 0.4, delay: 500 }]],
      // 하늘에서 빛이 쏟아진다 — 사울은 땅에 엎드린다
      'p1.0': [['hp', 'idle', { show: 0 }], ['saul', 'idle', { x: 0.25, z: 0.12, look: 1.3 }], ['g1', 'idle', { x: -0.35, z: -0.15 }], ['g2', 'idle', { x: -0.4, z: 0.42 }],
        ['light', 'on', { show: 1, delay: 1500 }], ['saul', 'look-up', { delay: 1700 }], ['g1', 'afraid', { delay: 1900 }], ['g2', 'afraid', { delay: 2100 }]],
      'p1.1': [['saul', 'mourn', { item: null, look: 0.3 }]],
      'p1.2': [['light', 'on']],
      'p1.3': [['light', 'speak']],
      'p1.4': [['light', 'on'], ['saul', 'kneel', { look: 0.2 }]],
      'p1.5': [['saul', 'look-up']],
      'p1.6': [['saul', 'kneel']],
      'p1.7': [['light', 'speak'], ['saul', 'mourn']],
      'p2.0': [['light', 'on']],
      'p2.1': [['light', 'speak']],
      'p2.2': [['light', 'speak']],
      // 함께 가던 사람들은 소리만 듣고 아무도 보지 못해 말을 잃고 서 있다
      'p2.3': [['light', 'on'], ['g1', 'idle', { look: 0.6 }], ['g2', 'idle', { look: 1.6 }], ['g1', 'shrug', { look: 1.8, delay: 1500 }], ['g2', 'shrug', { look: 0.4, delay: 1800 }]],
      // 빛이 걷히고 — 일어선 사울은 아무것도 보지 못한다
      'p2.4': [['light', 'on', { show: 0 }], ['saul', 'kneel'], ['saul', 'idle', { show: 0, delay: 1400 }], ['blind', 'shrug', { show: 1, x: 0.25, z: 0.12, look: 0.3, delay: 1400 }],
        ['g1', 'idle', { look: 1.3 }], ['g2', 'idle', { look: 1.0 }]],
      // 동행이 손을 끌고 다메섹으로 (오른쪽 뒤의 성) — 성에 닿기 전에 사라진다
      'p2.5': [['light', 'on', { show: 0 }], ['saul', 'idle', { show: 0 }], ['blind', 'idle', { show: 1 }], ['g1', 'idle', { x: 0.4, z: 0.0 }],
        ['blind', 'idle', { x: 1.45, z: -0.05, delay: 900 }], ['g1', 'idle', { x: 1.55, z: -0.22, delay: 900 }], ['g2', 'idle', { x: 1.3, z: 0.22, delay: 1200 }],
        ['blind', 'idle', { show: 0, delay: 5200 }], ['g1', 'idle', { show: 0, delay: 5300 }], ['g2', 'idle', { show: 0, delay: 5500 }]],
      // 사흘 동안 보지 못하고 — 빈 길에 해가 기운다
      'p2.6': [['blind', 'idle', { show: 0 }], ['g1', 'idle', { show: 0 }], ['g2', 'idle', { show: 0 }], ['@env', 'dusk']],
      w0: [['@env', 'day'], ['hp', 'idle', { show: 0 }], ['blind', 'idle', { show: 0 }], ['light', 'speak', { show: 1 }], ['saul', 'mourn', { show: 1, x: 0.25, z: 0.12, look: 0.3, item: null }],
        ['g1', 'afraid', { show: 1, x: -0.35, z: -0.15, look: 1.2 }], ['g2', 'afraid', { show: 1, x: -0.4, z: 0.42, look: 1.0 }]],
      w1: [['light', 'on'], ['saul', 'kneel', { look: 0.2 }], ['saul', 'look-up', { delay: 600 }]],
      w2: [['light', 'speak'], ['saul', 'mourn']],
      end: [['@env', 'day'], ['light', 'on', { show: 1 }], ['hp', 'idle', { show: 0 }], ['blind', 'idle', { show: 0 }], ['saul', 'mourn', { show: 1, x: 0.25, z: 0.12, look: 0.3, item: null }],
        ['g1', 'afraid', { show: 1, x: -0.35, z: -0.15, look: 1.2 }], ['g2', 'afraid', { show: 1, x: -0.4, z: 0.42, look: 1.0 }]],
    },
  },

  /* a03. 곧은 길의 아나니아 — 뒤에 기둥 줄 거리(colonnade, 다메섹을 동서로 가로지르는 '곧은 길'), 왼쪽은 아나니아의 집, 오른쪽은 유다의 집.
     환상 가운데 빛이 아나니아에게 내리고(주님은 빛으로만), 아나니아는 무릎 꿇고 대답하고 머뭇거린다. 그 집 앞에는 눈먼 사울이 무릎 꿇어 기도한다.
     아나니아가 길을 건너가 손을 얹고 말하자, 사울의 눈에서 비늘 같은 것이 떨어지고(scalefall) 다시 본다(saulB → sauly). 물을 부어 세례 */
  a03: {
    env: 'day',
    wide: 1.45,
    props: {
      street: ['colonnade', 0, -0.72, { w: 4.6, n: 11, h: 0.78 }],
      homeA: ['house', -1.55, -0.05, { stair: false }],
      homeJ: ['house', 1.5, -0.05, { stair: false, wall: '#d6c09a' }],
      vision: ['beam', -0.95, 0.5, { r: 0.36, h: 2.4 }],
      scales: ['scalefall', 1.25, 0.6, { h: 0.6 }],
      water: ['pour', 1.25, 0.6, { h: 0.82 }],
      basin: ['basin', 1.05, 0.72],
    },
    cast: {
      ananias: ['ananias', -0.95, 0.5, 0.6],
      blind: ['saulB', 1.25, 0.6, -0.9, { pose: 'kneel' }],
      saul: ['sauly', 1.25, 0.6, -0.9, { pose: 'kneel', gaze: false }],
      judas: ['judasD', 1.8, 0.55, -1.2, { gaze: false }],
      t1: ['townsman', 0.2, -0.25, -1.4, { gaze: false }],
      t2: ['jewD', 0.45, -0.32, -1.6, { gaze: false }],
    },
    beats: {
      enter: [['vision', null, { show: 0 }], ['blind', 'kneel', { show: 0 }], ['saul', 'idle', { show: 1, look: -0.9 }], ['ananias', 'bless', { x: 0.85, z: 0.62, look: 1.4 }], ['scales', 'idle'], ['water', 'idle'],
        ['judas', 'idle', { x: 1.75, z: 0.25, look: -1.6 }], ['t1', 'listen', { x: 0.25, z: 0.2, look: 1 }], ['t2', 'idle', { x: 0.4, z: -0.15, look: 1.3 }]],
      // 다메섹의 제자 아나니아 — 길 건너 유다의 집 앞에는 눈먼 사울이 무릎 꿇어 기도한다
      intro: [['@env', 'day'], ['vision', null, { show: 0 }], ['scales', 'idle'], ['water', 'idle'], ['saul', 'kneel', { show: 0 }], ['blind', 'pray']],
      // 환상 가운데 주님이 부르신다 — 빛이 내린다
      'p0.1': [['vision', null, { show: 1 }], ['ananias', 'look-up']],
      'p0.2': [['ananias', 'kneel', { look: 0.4 }]],
      'p0.3': [['ananias', 'speak', { look: 0.4 }], ['ananias', 'look-up', { delay: 2500 }]],
      'p0.4': [['ananias', 'listen']],
      'p0.5': [['ananias', 'listen', { look: 1.2 }]],
      'p0.6': [['ananias', 'listen', { look: 1.4 }], ['blind', 'pray']],
      // 아나니아가 머뭇거린다 — 그 사람이 성도들을 얼마나 괴롭혔는지
      'p1.0': [['ananias', 'kneel', { look: 0.3 }]],
      'p1.1': [['ananias', 'shrug', { look: 0.3 }]],
      'p1.2': [['ananias', 'speak', { look: 0.6 }]],
      'p1.3': [['ananias', 'kneel', { look: 0.2 }]],
      'p1.4': [['ananias', 'look-up']],
      'p1.5': [['ananias', 'bow', { look: 0.3 }]],
      // 그 집에 들어가 손을 얹는다
      'p2.0': [['vision', null, { show: 0 }], ['ananias', 'idle', { x: 0.85, z: 0.62, look: 1.4 }], ['ananias', 'bless', { look: 1.4, delay: 4000 }], ['judas', 'idle', { x: 1.75, z: 0.25, look: -1.6 }]],
      'p2.1': [['vision', null, { show: 0 }], ['ananias', 'speak', { x: 0.85, z: 0.62, look: 1.4, to: 'blind' }], ['blind', 'listen', { look: -1.3 }]],
      'p2.2': [['ananias', 'bless', { to: 'blind' }]],
      // 눈에서 비늘 같은 것이 떨어지고 — 다시 본다 (눈먼 사울을 같은 자리의 사울로 바꿔 낀다)
      'p2.3': [['scales', 'fall'], ['blind', 'kneel', { show: 0, delay: 900 }], ['saul', 'look-up', { show: 1, delay: 900 }]],
      // 세례 — 물을 붓는다
      'p2.4': [['blind', 'kneel', { show: 0 }], ['saul', 'pray', { show: 1, look: -0.9 }], ['ananias', 'anoint', { look: 1.4 }], ['water', 'pour', { delay: 500 }],
        ['water', 'idle', { delay: 4200 }], ['saul', 'idle', { delay: 5000 }], ['ananias', 'idle', { delay: 4500 }], ['t1', 'listen', { x: 0.25, z: 0.2, look: 1, delay: 1500 }]],
      w0: [['vision', null, { show: 1 }], ['ananias', 'listen', { x: -0.95, z: 0.5, look: 0.6 }], ['blind', 'pray', { show: 1 }], ['saul', 'kneel', { show: 0 }], ['water', 'idle'], ['scales', 'idle']],
      w1: [['vision', null, { show: 0 }], ['ananias', 'bless', { x: 0.85, z: 0.62, look: 1.4, to: 'blind' }], ['ananias', 'speak', { to: 'blind', delay: 400 }], ['blind', 'listen', { show: 1, look: -1.3 }], ['saul', 'kneel', { show: 0 }]],
      // 회당에서 '예수는 하나님의 아들'이라 전한다 — 길의 사람들에게
      w2: [['vision', null, { show: 0 }], ['blind', 'kneel', { show: 0 }], ['saul', 'speak', { show: 1, x: 0.75, z: 0.25, look: -1, to: 't1' }], ['ananias', 'idle', { x: 1.05, z: 0.55, look: -1 }],
        ['t1', 'listen', { x: 0.2, z: 0.05, look: 1.2 }], ['t2', 'shrug', { x: 0.35, z: -0.3, look: 1.3 }]],
      end: [['vision', null, { show: 0 }], ['scales', 'idle'], ['water', 'idle'], ['blind', 'kneel', { show: 0 }], ['saul', 'idle', { show: 1, x: 1.25, z: 0.6, look: -0.9 }],
        ['ananias', 'bless', { x: 0.85, z: 0.62, look: 1.4 }], ['judas', 'idle', { x: 1.75, z: 0.25, look: -1.6 }], ['t1', 'listen', { x: 0.25, z: 0.2, look: 1 }], ['t2', 'idle', { x: 0.4, z: -0.15, look: 1.3 }]],
    },
  },

  /* a04. 광주리에 담겨 성벽을 내려가다 — 뒤에 높은 다메섹 성벽(wallbasket): 왼쪽에 성문(나바테아 파수꾼과 횃불), 오른쪽에 성벽에 붙은 집의 창.
     낮에 사울이 성벽 아래 거리에서 유대인들과 변론하고(그들이 당황해 물러나 모의), 성문마다 파수꾼이 선다. 밤 — 제자들이 사울을 광주리에 태워
     창에서 천천히 달아 내리고, 사울은 어둠 속으로 빠져나간다(오른쪽, 문을 지키는 이들 반대편). 끝은 빈 광주리와 창의 등잔빛 */
  a04: {
    env: 'day',
    wide: 1.45,
    props: {
      wall: ['wallbasket', 0, -0.62, { w: 4.4, h: 1.3, gate: -1.35, wx: 0.75, state: 'up' }],
      rocks: ['rocks', 0, 0, { spots: [[1.9, 0.55, 0.08], [-0.2, 0.8, 0.07]] }],
    },
    cast: {
      saul: ['sauly', 0.15, 0.25, -1.0],
      saulB: ['paulS', 0, 0, 0, { board: 'wall', pose: 'sit-ground', gaze: false }],
      j1: ['jewD', -0.6, 0.15, 1.0],
      j2: ['hellenist', -0.85, 0.42, 1.0],
      j3: ['pharisee', -0.45, 0.55, 0.9],
      n1: ['nabatean', -1.75, -0.2, 0.4, { gaze: false }],
      n2: ['nabatean', -0.95, -0.2, -0.4, { gaze: false }],
      d1: ['townsman', 0.62, -0.62, 0.2, { y: 1.3, gaze: false }],
      d2: ['disciple', 0.95, -0.62, -0.2, { y: 1.3, gaze: false }],
    },
    beats: {
      enter: [['@env', 'night'], ['wall', 'lower'], ['saul', 'idle', { show: 0 }], ['saulB', 'sit-ground', { show: 1, look: 0.4 }], ['j1', 'idle', { show: 0 }], ['j2', 'idle', { show: 0 }], ['j3', 'idle', { show: 0 }],
        ['n1', 'idle', { item: 'torch' }], ['n2', 'idle', { item: 'torch' }], ['d1', 'carry-pole', { look: 0.3 }], ['d2', 'pray', { look: -0.3 }]],
      // 여러 날 — 사울이 성벽 아래 거리에서 유대인들과 변론한다
      intro: [['@env', 'day'], ['wall', 'idle'], ['saulB', 'sit-ground', { show: 0 }], ['n1', 'idle', { show: 0 }], ['n2', 'idle', { show: 0 }], ['d1', 'idle', { show: 0 }], ['d2', 'idle', { show: 0 }],
        ['saul', 'speak', { to: 'j1' }]],
      'p0.1': [['saul', 'speak', { to: 'j1' }], ['j1', 'shrug', { delay: 2500 }], ['j3', 'listen'], ['j2', 'shrug', { delay: 3500 }]],
      // 죽이기로 모의한다 — 물러나 머리를 맞댄다
      'p0.2': [['saul', 'idle', { look: -1 }], ['j1', 'idle', { x: -1.0, z: 0.55, look: 1.6 }], ['j2', 'speak', { x: -1.35, z: 0.7, look: 1.2, to: 'j1' }], ['j3', 'point', { x: -0.8, z: 0.75, look: 2.4 }]],
      // 아레다 왕의 고관이 성을 지킨다 — 성문의 파수꾼
      'p0.3': [['n1', 'idle', { show: 1, x: -1.75, z: -0.2, look: 0.4 }], ['n2', 'idle', { show: 1, x: -0.95, z: -0.2, look: -0.4, delay: 600 }], ['j2', 'point', { look: -2.2 }]],
      // 밤낮으로 — 밤이 되고 파수꾼은 횃불을 든다
      'p0.4': [['n1', 'idle', { show: 1 }], ['n2', 'idle', { show: 1 }], ['@env', 'night'], ['wall', 'up'], ['n1', 'idle', { item: 'torch', delay: 1200 }], ['n2', 'idle', { item: 'torch', delay: 1400 }],
        ['j1', 'idle', { x: -2.0, z: 0.6 }], ['j2', 'idle', { x: -2.1, z: 0.4 }], ['j3', 'idle', { x: -2.0, z: 0.85 }], ['j1', 'idle', { show: 0, delay: 2600 }], ['j2', 'idle', { show: 0, delay: 2800 }], ['j3', 'idle', { show: 0, delay: 3000 }],
        ['saul', 'idle', { x: 0.75, z: 0.3, look: 2.6 }]],
      // 그 음모가 사울의 귀에 — 제자가 성벽 위(창 곁)에서 부른다
      'p1.0': [['@env', 'night'], ['wall', 'up'], ['j1', 'idle', { show: 0 }], ['j2', 'idle', { show: 0 }], ['j3', 'idle', { show: 0 }], ['n1', 'idle', { show: 1, item: 'torch' }], ['n2', 'idle', { show: 1, item: 'torch' }],
        ['saul', 'listen', { x: 0.75, z: 0.3, look: 2.6 }], ['d1', 'idle', { show: 1, look: 0.2 }], ['d2', 'idle', { show: 1, look: -0.2, delay: 500 }]],
      // 광주리에 태운다 — 사울이 창 앞에 매달린 광주리에 앉는다
      'p1.1': [['saul', 'idle', { show: 0 }], ['saulB', 'sit-ground', { show: 1, look: 0.4 }], ['d1', 'carry-pole', { look: 0.3 }], ['d2', 'carry-pole', { look: -0.3 }]],
      // 창문으로 천천히 달아 내린다
      'p1.2': [['wall', 'lower'], ['d1', 'carry-pole'], ['d2', 'carry-pole']],
      // 어둠 속으로 내려서 — 빠져나간다 (오른쪽, 성문 반대편)
      'p1.3': [['wall', 'down'], ['saulB', 'sit-ground', { show: 0, delay: 600 }], ['saul', 'idle', { show: 1, x: 0.75, z: 0.12, look: 1.3, delay: 600 }],
        ['saul', 'idle', { x: 1.75, z: 0.45, delay: 1800 }], ['saul', 'idle', { show: 0, delay: 5600 }], ['d1', 'pray', { delay: 1500 }], ['d2', 'pray', { delay: 1700 }]],
      // 묶어 가려고 왔던 사람이 광주리에 담겨 — 빈 광주리와 창의 등잔빛
      'p2.0': [['wall', 'down'], ['saulB', 'sit-ground', { show: 0 }], ['saul', 'idle', { show: 0 }], ['d1', 'pray'], ['d2', 'pray']],
      'p2.3': [['d1', 'look-up'], ['d2', 'look-up', { delay: 400 }]],
      w0: [['@env', 'night'], ['wall', 'down'], ['saulB', 'sit-ground', { show: 0 }], ['saul', 'idle', { show: 1, x: 0.75, z: 0.12, look: 0.2 }], ['d1', 'pray', { show: 1 }], ['d2', 'pray', { show: 1 }],
        ['n1', 'idle', { show: 1, item: 'torch' }], ['n2', 'idle', { show: 1, item: 'torch' }], ['j1', 'idle', { show: 0 }], ['j2', 'idle', { show: 0 }], ['j3', 'idle', { show: 0 }]],
      w1: [['wall', 'lower'], ['saul', 'idle', { show: 0 }], ['saulB', 'sit-ground', { show: 1, look: 0.4 }], ['d1', 'carry-pole', { show: 1 }], ['d2', 'carry-pole', { show: 1 }]],
      w2: [['wall', 'lower'], ['saul', 'idle', { show: 0 }], ['saulB', 'sit-ground', { show: 1 }], ['d1', 'carry-pole'], ['d2', 'carry-pole']],
      end: [['@env', 'night'], ['wall', 'lower'], ['saul', 'idle', { show: 0 }], ['saulB', 'sit-ground', { show: 1, look: 0.4 }], ['j1', 'idle', { show: 0 }], ['j2', 'idle', { show: 0 }], ['j3', 'idle', { show: 0 }],
        ['n1', 'idle', { show: 1, item: 'torch' }], ['n2', 'idle', { show: 1, item: 'torch' }], ['d1', 'carry-pole', { show: 1, look: 0.3 }], ['d2', 'pray', { show: 1, look: -0.3 }]],
    },
  },

  /* a05. 바나바가 손을 잡아 준 사람 — 예루살렘 제자들의 집(house, 문이 열리면 등불빛). 사울(이제 길 떠나는 사도의 차림 paulS)이 오른쪽에서 와
     문 앞에 서지만 문은 닫혀 있고, 집 곁의 제자들은 두려워 물러선다. 바나바가 와서 손을 잡고 문으로 데려가자 문이 열리고 베드로와 야고보가 나온다.
     바나바가 차근차근 이야기한다. 사울은 베드로와 마주 앉아 지내고, 헬라 말 하는 유대인들과 변론하다가 형제들이 그를 데리고 서쪽(가이사랴)으로 떠난다 */
  a05: {
    env: 'day',
    wide: 1.4,
    props: {
      home: ['house', -0.55, -0.55, { door: true, stair: true }],
      mat: ['cloaks', -0.3, 0.42, { n: 2 }],
    },
    cast: {
      saul: ['paulS', 1.75, 0.35, -1.3],
      barnabas: ['barnabas', -1.95, 0.45, 1.3],
      peter: ['peter', -0.35, -0.12, 0.6],
      james: ['jamesL', -0.05, -0.18, 0.4],
      d1: ['disciple', -1.35, -0.05, 0.9, { gaze: false }],
      d2: ['woman', -1.5, 0.25, 0.8, { gaze: false }],
      h1: ['hellenist', 2.0, -0.25, -1.3, { gaze: false }],
      h2: ['jewD', 2.05, 0.15, -1.3, { gaze: false }],
      b1: ['disciple', -1.2, 0.55, 1, { gaze: false }],
    },
    beats: {
      enter: [['home', 'open'], ['saul', 'idle', { x: 0.35, z: 0.2, look: -1.0 }], ['barnabas', 'speak', { x: -0.05, z: 0.32, look: -0.8, to: 'peter' }], ['peter', 'listen', { look: 0.8 }],
        ['james', 'listen', { look: 0.6 }], ['h1', 'idle', { show: 0 }], ['h2', 'idle', { show: 0 }], ['b1', 'idle', { show: 0 }]],
      // 예루살렘으로 돌아온 사울 — 제자들은 문을 닫고 있다
      intro: [['@env', 'day'], ['home', 'idle'], ['mat', null, { show: 0 }], ['peter', 'idle', { show: 0 }], ['james', 'idle', { show: 0 }], ['h1', 'idle', { show: 0 }], ['h2', 'idle', { show: 0 }], ['b1', 'idle', { show: 0 }],
        ['barnabas', 'idle', { show: 0 }]],
      'p0.0': [['saul', 'idle', { x: 0.1, z: 0.12, look: -1.2 }]],
      // 모두 사울을 두려워한다
      'p0.1': [['saul', 'idle', { x: 0.1, z: 0.12, look: -1.2 }], ['d1', 'afraid', { look: 1.2 }], ['d2', 'afraid', { x: -1.62, z: 0.3, look: 1.0, delay: 300 }]],
      'p0.2': [['d1', 'idle', { x: -1.6, z: -0.1, look: 1.2 }], ['d2', 'idle', { look: 1.1 }]],
      'p0.3': [['saul', 'idle', { look: -0.6 }]],
      // 문은 좀처럼 열리지 않는다
      'p0.4': [['saul', 'bow', { look: -0.4 }]],
      // 바나바가 손을 잡고 데려간다 — 문이 열리고 베드로와 야고보가 나온다
      'p1.0': [['barnabas', 'idle', { show: 1, x: -0.3, z: 0.35, look: 1.3 }], ['saul', 'idle', { look: -1.3 }], ['barnabas', 'embrace', { look: 1.4, delay: 3000 }],
        ['saul', 'idle', { x: 0.15, z: 0.35, look: -1.4, delay: 3000 }], ['home', 'open', { delay: 4500 }], ['peter', 'idle', { show: 1, delay: 5000 }], ['james', 'idle', { show: 1, delay: 5400 }]],
      // 바나바가 차근차근 이야기한다
      'p1.1': [['home', 'open'], ['peter', 'listen', { show: 1, look: 0.8 }], ['james', 'listen', { show: 1, look: 0.6 }], ['barnabas', 'speak', { x: -0.05, z: 0.32, look: -0.8, to: 'peter' }],
        ['saul', 'idle', { x: 0.35, z: 0.2, look: -1.0 }], ['d1', 'listen', { x: -1.2, z: 0.05, look: 1.2 }], ['d2', 'listen', { x: -1.4, z: 0.32, look: 1.2 }]],
      'p1.2': [['barnabas', 'idle'], ['peter', 'idle', { look: 1 }], ['d1', 'idle', { x: -0.95, z: 0.2, look: 1.2 }], ['d2', 'idle', { x: -1.15, z: 0.42, look: 1.1 }]],
      // 베드로와 보름을 함께 — 마주 앉아 이야기한다. 야고보도 만난다
      'p2.0': [['mat', null, { show: 1 }], ['peter', 'sit-speak', { x: -0.55, z: 0.42, look: 1.4, to: 'saul' }], ['saul', 'sit-ground', { x: -0.05, z: 0.45, look: -1.4 }],
        ['barnabas', 'idle', { x: 0.45, z: 0.0, look: -1.2 }], ['james', 'idle', { x: -0.3, z: 0.05, look: 0.6 }], ['d1', 'idle', { show: 0 }], ['d2', 'idle', { show: 0 }]],
      // 헬라 말 하는 유대인들과 담대하게 변론한다
      'p2.1': [['peter', 'idle', { x: -0.65, z: 0.25, look: 1.2 }], ['mat', null, { show: 0 }], ['saul', 'speak', { x: 0.75, z: 0.2, look: 1.2, to: 'h1' }],
        ['h1', 'rebuke', { show: 1, x: 1.45, z: 0.05, look: -1.2 }], ['h2', 'point', { show: 1, x: 1.55, z: 0.42, look: -1.3, delay: 600 }]],
      // 형제들이 사울을 데리고 가이사랴로 (서쪽, 왼쪽) — 화면 가장자리 전에 사라진다
      'p2.2': [['h1', 'idle', { x: 2.0, z: -0.1 }], ['h2', 'idle', { x: 2.05, z: 0.3 }], ['h1', 'idle', { show: 0, delay: 2500 }], ['h2', 'idle', { show: 0, delay: 2700 }],
        ['b1', 'idle', { show: 1, x: 0.1, z: 0.55, look: 1.2 }], ['saul', 'idle', { x: 0.45, z: 0.35, look: -1.2 }],
        ['saul', 'idle', { x: -1.65, z: 0.5, delay: 2600 }], ['b1', 'idle', { x: -1.75, z: 0.7, delay: 2800 }], ['barnabas', 'bless', { look: -1.3, delay: 2600 }],
        ['saul', 'idle', { show: 0, delay: 7400 }], ['b1', 'idle', { show: 0, delay: 7600 }]],
      w0: [['home', 'open'], ['mat', null, { show: 0 }], ['peter', 'listen', { show: 1, x: -0.35, z: -0.12, look: 0.8 }], ['james', 'listen', { show: 1, x: -0.05, z: -0.18, look: 0.6 }],
        ['barnabas', 'speak', { show: 1, x: -0.05, z: 0.32, look: -0.8, to: 'peter' }], ['saul', 'idle', { show: 1, x: 0.35, z: 0.2, look: -1.0 }],
        ['h1', 'idle', { show: 0 }], ['h2', 'idle', { show: 0 }], ['b1', 'idle', { show: 0 }]],
      w1: [['mat', null, { show: 1 }], ['peter', 'sit-speak', { x: -0.55, z: 0.42, look: 1.4, to: 'saul' }], ['saul', 'sit-ground', { show: 1, x: -0.05, z: 0.45, look: -1.4 }], ['barnabas', 'idle', { x: 0.45, z: 0.0, look: -1.2 }]],
      w2: [['mat', null, { show: 0 }], ['peter', 'idle', { x: -0.65, z: 0.25, look: 1.2 }], ['saul', 'idle', { show: 1, x: 0.35, z: 0.2, look: -1.0 }], ['d1', 'listen', { show: 1, look: 1.2 }], ['d2', 'listen', { show: 1, look: 1.2 }]],
      end: [['home', 'open'], ['mat', null, { show: 0 }], ['saul', 'idle', { show: 1, x: 0.35, z: 0.2, look: -1.0 }], ['barnabas', 'speak', { show: 1, x: -0.05, z: 0.32, look: -0.8, to: 'peter' }],
        ['peter', 'listen', { show: 1, x: -0.35, z: -0.12, look: 0.8 }], ['james', 'listen', { show: 1, x: -0.05, z: -0.18, look: 0.6 }], ['d1', 'listen', { show: 1, x: -1.2, z: 0.05, look: 1.2 }],
        ['d2', 'listen', { show: 1, x: -1.4, z: 0.32, look: 1.2 }], ['h1', 'idle', { show: 0 }], ['h2', 'idle', { show: 0 }], ['b1', 'idle', { show: 0 }]],
    },
  },

  /* a06. 처음 그리스도인이라 불린 곳 — 수리아 안디옥의 기둥 줄 큰 거리(colonnade). 흩어진 성도들이 왼쪽(남쪽)에서 오고, 구브로·구레네 사람이 헬라 사람들에게 전한다.
     많은 사람이 믿고(무리), 바나바가 와서 기뻐하고 권한다. 바나바는 다소로(오른쪽) 가서 사울을 데려오고, 둘이 앉은 무리를 한 해 동안 가르친다.
     '그리스도인' — 거리의 헬라 사람이 가리켜 부른다. 아가보가 흉년을 알리고, 제자들이 모은 곡식 자루를 바나바와 사울 편에 보낸다 */
  a06: {
    env: 'day',
    wide: 1.45,
    props: {
      street: ['colonnade', 0, -0.75, { w: 4.6, n: 12, h: 0.85 }],
      folk: ['crowd', 0.05, 0.25, { spots: [[-0.55, 0.1], [-0.3, 0.38], [0.0, 0.1], [0.25, 0.42], [0.5, 0.15], [-0.1, 0.62], [0.55, 0.6]], face: Math.PI, state: 'stand' }],
      sacks: ['provisions', 1.0, 0.55, { kind: 'food' }],
    },
    cast: {
      j1: ['disciple', -2.0, 0.0, 1.3, { gaze: false }],
      lucius: ['lucius', -1.8, 0.35, 1.3],
      g1: ['greek', 0.6, -0.15, -1.2],
      g2: ['greek2', 0.95, 0.15, -1.3],
      gw: ['greekW', 0.75, 0.45, -1.4],
      barnabas: ['barnabas', -2.0, -0.2, 1.3],
      saul: ['paul', 2.05, 0.0, -1.3],
      agabus: ['agabus', -2.05, 0.45, 1.3],
    },
    beats: {
      enter: [['folk', 'sit', { show: 1 }], ['barnabas', 'speak', { x: -0.25, z: -0.35, look: 0.1 }], ['saul', 'speak', { x: 0.35, z: -0.35, look: -0.1, delay: 1500 }], ['saul', 'idle', { x: 0.35, z: -0.35, look: -0.1 }],
        ['j1', 'idle', { show: 0 }], ['lucius', 'listen', { x: -0.9, z: -0.15, look: 0.6 }], ['g1', 'listen', { x: 1.2, z: -0.25, look: -1.2 }], ['g2', 'point', { x: 1.45, z: 0.1, look: -1.4 }], ['gw', 'idle', { show: 0 }],
        ['agabus', 'idle', { show: 0 }], ['sacks', null, { show: 0 }]],
      // 흩어진 성도들이 안디옥까지 — 왼쪽에서 걸어 들어온다
      intro: [['@env', 'day'], ['folk', 'stand', { show: 0 }], ['sacks', null, { show: 0 }], ['barnabas', 'idle', { show: 0 }], ['saul', 'idle', { show: 0 }], ['agabus', 'idle', { show: 0 }],
        ['j1', 'idle', { x: -1.2, z: 0.05 }], ['lucius', 'idle', { x: -0.9, z: 0.35 }]],
      // 구브로·구레네 사람이 헬라 사람들에게도 주 예수를 전한다
      'p0.1': [['lucius', 'speak', { x: 0.1, z: 0.2, look: 1.2, to: 'g1' }], ['g1', 'listen'], ['g2', 'listen'], ['gw', 'listen'], ['j1', 'idle', { x: -0.7, z: -0.05, look: 1.2 }]],
      // 많은 사람이 믿고 돌아온다
      'p0.2': [['folk', 'stand', { show: 1 }], ['lucius', 'idle', { x: -0.95, z: 0.05, look: 0.8 }], ['j1', 'idle', { x: -1.35, z: -0.25, look: 0.8 }],
        ['g1', 'pray', { x: 1.2, z: -0.25 }], ['g2', 'pray', { x: 1.45, z: 0.1 }], ['gw', 'pray', { x: 1.3, z: 0.42 }]],
      // 예루살렘 교회가 바나바를 보낸다
      'p1.0': [['folk', 'stand', { show: 1 }], ['barnabas', 'idle', { show: 1, x: -0.9, z: -0.3, look: 1.1 }]],
      'p1.1': [['barnabas', 'raise', { x: -0.9, z: -0.3, look: 1.1 }]],
      'p1.2': [['barnabas', 'speak', { look: 1.2, to: 'g1' }]],
      // 다소로 가서 사울을 찾아 — 오른쪽으로 떠났다가 둘이 함께 돌아온다
      'p1.3': [['barnabas', 'idle', { x: 1.75, z: -0.4 }], ['barnabas', 'idle', { show: 0, delay: 4000 }], ['saul', 'idle', { show: 1, x: 1.7, z: -0.25, look: -1.3, delay: 5200 }],
        ['barnabas', 'idle', { show: 1, x: 1.6, z: -0.5, look: -1.3, delay: 5200 }]],
      // 꼬박 한 해 동안 가르친다 — 무리가 앉는다
      'p1.4': [['folk', 'sit'], ['barnabas', 'speak', { show: 1, x: -0.25, z: -0.35, look: 0.1 }], ['saul', 'speak', { show: 1, x: 0.35, z: -0.35, look: -0.1, delay: 3500 }], ['barnabas', 'idle', { delay: 3500 }],
        ['g1', 'listen', { x: 1.2, z: -0.25, look: -1.2 }], ['g2', 'listen', { x: 1.45, z: 0.1, look: -1.4 }], ['gw', 'idle', { show: 0 }], ['lucius', 'listen', { x: -0.9, z: -0.15, look: 0.6 }], ['j1', 'idle', { show: 0 }]],
      // 그리스도인 — 거리의 헬라 사람이 가리켜 부른다
      'p2.0': [['saul', 'idle'], ['g2', 'point', { look: -1.4 }], ['g1', 'speak', { look: -1.6, to: 'g2', delay: 800 }]],
      // 선지자 아가보가 흉년을 알린다
      'p2.1': [['g1', 'listen'], ['g2', 'idle'], ['agabus', 'speak', { show: 1, x: -0.85, z: 0.15, look: 0.8 }], ['folk', 'stand']],
      // 힘닿는 대로 모아 바나바와 사울 편에 보낸다 — 곡식 자루가 하나씩 놓이고, 둘은 왼쪽(유대 쪽)으로 떠난다
      'p2.2': [['agabus', 'idle'], ['sacks', null, { show: 1 }], ['barnabas', 'idle', { x: 0.75, z: 0.55, look: 1.3, delay: 1500 }], ['saul', 'idle', { x: 0.7, z: 0.25, look: 1.3, delay: 1500 }],
        ['barnabas', 'hold-basket', { delay: 3500 }], ['saul', 'idle', { item: 'basket', delay: 3500 }], ['sacks', null, { show: 0.5, delay: 3500 }],
        ['barnabas', 'hold-basket', { x: -1.7, z: 0.55, delay: 4800 }], ['saul', 'idle', { x: -1.75, z: 0.3, delay: 5000 }], ['barnabas', 'idle', { show: 0, delay: 9800 }], ['saul', 'idle', { show: 0, delay: 10000 }]],
      w0: [['folk', 'sit', { show: 1 }], ['sacks', null, { show: 0 }], ['agabus', 'idle', { show: 0 }], ['barnabas', 'idle', { show: 1, x: -0.25, z: -0.35, look: 0.1 }], ['saul', 'idle', { show: 1, x: 0.35, z: -0.35, look: -0.1, item: null }],
        ['g1', 'speak', { x: 1.2, z: -0.25, look: -1.6, to: 'g2' }], ['g2', 'point', { x: 1.45, z: 0.1, look: -1.4 }], ['lucius', 'listen', { x: -0.9, z: -0.15, look: 0.6 }]],
      w1: [['folk', 'stand', { show: 1 }], ['barnabas', 'speak', { show: 1, x: -0.9, z: -0.3, look: 1.2 }], ['saul', 'idle', { show: 0 }], ['g1', 'pray'], ['g2', 'pray']],
      w2: [['folk', 'stand', { show: 1 }], ['sacks', null, { show: 1 }], ['barnabas', 'idle', { show: 1, x: 0.75, z: 0.55, look: 1.3 }], ['saul', 'idle', { show: 1, x: 0.7, z: 0.25, look: 1.3, item: null }]],
      end: [['folk', 'sit', { show: 1 }], ['sacks', null, { show: 0 }], ['barnabas', 'speak', { show: 1, x: -0.25, z: -0.35, look: 0.1 }], ['saul', 'idle', { show: 1, x: 0.35, z: -0.35, look: -0.1, item: null }],
        ['j1', 'idle', { show: 0 }], ['lucius', 'listen', { x: -0.9, z: -0.15, look: 0.6 }], ['g1', 'listen', { x: 1.2, z: -0.25, look: -1.2 }], ['g2', 'point', { x: 1.45, z: 0.1, look: -1.4 }], ['gw', 'idle', { show: 0 }],
        ['agabus', 'idle', { show: 0 }]],
    },
  },

  /* a07. 따로 세우라 하신 두 사람 — 안디옥 교회의 집 안(housechurch, 등잔). 다섯 선지자·교사(바나바·시므온·루기오·마나엔·사울)가 둘러 무릎 꿇고 예배하며 금식한다.
     성령께서 말씀하신다 — 모습 없이 가운데 내리는 빛(beam). 바나바와 사울이 가운데 무릎 꿇고, 셋이 손을 얹는다. 두 사람은 일어나 오른쪽(실루기아 항구 쪽, 서쪽 바다로)으로 떠난다 */
  a07: {
    env: 'dusk',
    wide: 1.35,
    props: {
      room: ['housechurch', 0, -0.1, { table: false, lamps: [[-0.95, -0.55], [0.95, -0.55]] }],
      spirit: ['beam', 0, 0.05, { r: 0.55, h: 2.6 }],
    },
    cast: {
      barnabas: ['barnabas', -0.35, -0.3, 0.3, { pose: 'kneel' }],
      saul: ['paul', 0.35, -0.3, -0.3, { pose: 'kneel' }],
      simeon: ['simeon', -0.7, 0.2, 1.0, { pose: 'kneel' }],
      lucius: ['lucius', 0.7, 0.2, -1.0, { pose: 'kneel' }],
      manaen: ['manaen', 0.0, 0.45, 3.0, { pose: 'kneel' }],
    },
    beats: {
      enter: [['spirit', null, { show: 1 }], ['barnabas', 'kneel', { x: -0.17, z: 0.05, look: 0.2 }], ['saul', 'kneel', { x: 0.17, z: 0.05, look: -0.2 }],
        ['simeon', 'bless', { x: -0.55, z: 0.2, look: 1.0 }], ['lucius', 'bless', { x: 0.55, z: 0.2, look: -1.0 }], ['manaen', 'bless', { x: 0.0, z: 0.45, look: 3.0 }]],
      // 선지자들과 교사들 — 한 교회에서 함께 무릎 꿇고 주님을 섬긴다
      intro: [['@env', 'dusk'], ['spirit', null, { show: 0 }]],
      'p0.1': [['barnabas', 'kneel'], ['simeon', 'pray', { delay: 500 }], ['lucius', 'pray', { delay: 900 }], ['manaen', 'pray', { delay: 1300 }], ['saul', 'pray', { delay: 1700 }]],
      'p0.2': [['barnabas', 'pray'], ['saul', 'pray'], ['simeon', 'pray'], ['lucius', 'pray'], ['manaen', 'pray']],
      // 예배하며 금식할 때 성령께서 말씀하신다 — 빛이 내린다
      'p1.0': [['spirit', null, { show: 1 }], ['barnabas', 'look-up'], ['saul', 'look-up', { delay: 300 }], ['simeon', 'look-up', { delay: 500 }], ['lucius', 'look-up', { delay: 700 }], ['manaen', 'look-up', { delay: 900 }]],
      'p1.1': [['spirit', null, { show: 1 }]],
      // 한 해 넘게 함께 가르침을 받아 온 두 사람 — 모두 바나바와 사울을 본다
      'p1.3': [['simeon', 'kneel', { look: 0.6 }], ['lucius', 'kneel', { look: -1.6 }], ['manaen', 'kneel', { look: 2.8 }], ['barnabas', 'kneel', { look: 0.5 }], ['saul', 'kneel', { look: -0.5 }]],
      'p1.4': [['barnabas', 'bow'], ['saul', 'bow', { delay: 400 }]],
      // 금식하고 기도한 뒤 손을 얹는다
      'p2.0': [['spirit', null, { show: 1 }], ['barnabas', 'kneel', { x: -0.17, z: 0.05, look: 0.2 }], ['saul', 'kneel', { x: 0.17, z: 0.05, look: -0.2 }],
        ['simeon', 'bless', { x: -0.55, z: 0.2, look: 1.0, delay: 1800 }], ['lucius', 'bless', { x: 0.55, z: 0.2, look: -1.0, delay: 2000 }], ['manaen', 'bless', { x: 0.0, z: 0.45, look: 3.0, delay: 2200 }]],
      // 두 사람은 일어나 실루기아로 — 오른쪽으로 떠나 사라진다. 남은 이들이 축복하며 배웅한다
      'p2.1': [['spirit', null, { show: 0 }], ['barnabas', 'idle', { x: 0.2, z: 0.55, look: 1.3 }], ['saul', 'idle', { x: 0.55, z: 0.45, look: 1.3 }],
        ['barnabas', 'idle', { x: 1.7, z: 0.7, delay: 1600 }], ['saul', 'idle', { x: 1.8, z: 0.45, delay: 1500 }], ['barnabas', 'idle', { show: 0, delay: 6200 }], ['saul', 'idle', { show: 0, delay: 6000 }],
        ['simeon', 'bless', { x: -0.35, z: 0.2, look: 1.3 }], ['lucius', 'bless', { x: 0.75, z: 0.05, look: 1.4 }], ['manaen', 'bless', { x: 0.1, z: 0.25, look: 1.3 }]],
      'p2.2': [['barnabas', 'idle', { show: 0 }], ['saul', 'idle', { show: 0 }], ['simeon', 'pray', { look: 1.0 }], ['lucius', 'pray', { look: 1.2 }], ['manaen', 'pray', { look: 1.2 }]],
      w0: [['spirit', null, { show: 1 }], ['barnabas', 'look-up', { show: 1, x: -0.35, z: -0.3, look: 0.3 }], ['saul', 'look-up', { show: 1, x: 0.35, z: -0.3, look: -0.3 }],
        ['simeon', 'look-up', { x: -0.7, z: 0.2, look: 1.0 }], ['lucius', 'look-up', { x: 0.7, z: 0.2, look: -1.0 }], ['manaen', 'look-up', { x: 0.0, z: 0.45, look: 3.0 }]],
      w1: [['spirit', null, { show: 1 }], ['barnabas', 'kneel', { show: 1, x: -0.17, z: 0.05, look: 0.2 }], ['saul', 'kneel', { show: 1, x: 0.17, z: 0.05, look: -0.2 }],
        ['simeon', 'bless', { x: -0.55, z: 0.2, look: 1.0 }], ['lucius', 'bless', { x: 0.55, z: 0.2, look: -1.0 }], ['manaen', 'bless', { x: 0.0, z: 0.45, look: 3.0 }]],
      w2: [['spirit', null, { show: 0 }], ['barnabas', 'idle', { show: 1, x: 0.2, z: 0.55, look: 1.3 }], ['saul', 'idle', { show: 1, x: 0.55, z: 0.45, look: 1.3 }],
        ['simeon', 'bless', { x: -0.35, z: 0.2, look: 1.3 }], ['lucius', 'bless', { x: 0.75, z: 0.05, look: 1.4 }], ['manaen', 'bless', { x: 0.1, z: 0.25, look: 1.3 }]],
      end: [['spirit', null, { show: 1 }], ['barnabas', 'kneel', { show: 1, x: -0.17, z: 0.05, look: 0.2 }], ['saul', 'kneel', { show: 1, x: 0.17, z: 0.05, look: -0.2 }],
        ['simeon', 'bless', { x: -0.55, z: 0.2, look: 1.0 }], ['lucius', 'bless', { x: 0.55, z: 0.2, look: -1.0 }], ['manaen', 'bless', { x: 0.0, z: 0.45, look: 3.0 }]],
    },
  },

  /* a08. 총독 앞에서 눈이 먼 마술사 — 바보의 총독 관저 앞뜰(핀이 바닷가라 무대 왼쪽이 바다다 — 사람과 건물은 오른쪽 뭍에, 배만 바다에): 왼쪽에 재판석(bema)과 접의자에 앉은 총독 서기오 바울(자줏빛 단 토가), 곁의 수행원과 마술사 엘루마.
     바다(앞 바다의 실제 지점, geo)에는 일행이 타고 온 상선. 바나바·바울·마가가 오른쪽에서 와서 말씀을 전하고, 엘루마가 가로막는다.
     성령이 가득한 바울이 엘루마를 바라보고 말하자 엘루마의 머리 둘레에 잿빛 안개(haze) — 더듬으며 손을 이끌 사람을 찾고, 수행원이 손을 잡는다. 총독은 일어나 믿는다 */
  a08: {
    env: 'day',
    wide: 1.4,
    props: {
      seat: ['bema', -0.15, -0.45, { w: 0.95 }],
      street: ['colonnade', 1.35, -0.85, { w: 2.6, n: 7, h: 0.8, shops: false, wall: '#e2d6bc' }],
      ship: ['ship', 2.4, 0.85, { state: 'furled', big: 0.6, geo: [34.751, 32.376] }],
      fog: ['haze', 0.35, -0.1, { w: 0.42, d: 0.3, on: 'elymas' }],
      fill: ['beam', 1.35, 0.15, { r: 0.32, h: 2.3, on: 'paul' }],
    },
    cast: {
      sergius: ['proconsul', -0.15, -0.53, 0.5, { y: 0.36, pose: 'sit' }],
      lictor: ['lictor', -0.75, -0.2, 0.7, { gaze: false }],
      elymas: ['elymas', 0.35, -0.1, 0.9],
      paul: ['paulS', 2.25, 0.25, -1.3],
      barnabas: ['barnabas', 2.35, -0.05, -1.3],
      mark: ['mark', 2.4, 0.5, -1.3, { gaze: false }],
    },
    beats: {
      enter: [['fill', null, { show: 1 }], ['paul', 'speak', { x: 1.35, z: 0.15, look: -1.2, to: 'elymas' }], ['barnabas', 'idle', { x: 1.65, z: -0.15, look: -1.3 }], ['mark', 'idle', { x: 1.75, z: 0.45, look: -1.3 }],
        ['elymas', 'shrug', { x: 0.5, z: 0.05, look: 1.0 }], ['fog', 'on']],
      // 구브로 섬을 가로질러 — 세 사람이 걸어 들어온다
      intro: [['@env', 'day'], ['fill', null, { show: 0 }], ['fog', 'off'], ['ship', 'furled']],
      'p0.0': [['paul', 'idle', { x: 1.95, z: 0.2 }], ['barnabas', 'idle', { x: 2.1, z: -0.1, delay: 300 }], ['mark', 'idle', { x: 2.15, z: 0.45, delay: 500 }]],
      'p0.1': [['mark', 'idle', { look: -1.6 }]],
      'p0.2': [['paul', 'idle', { x: 1.65, z: 0.2, look: -1.3 }], ['barnabas', 'idle', { x: 1.85, z: -0.12, look: -1.3, delay: 300 }], ['mark', 'idle', { x: 2.0, z: 0.48, look: -1.3, delay: 500 }]],
      // 지혜로운 총독이 두 사람을 불러 말씀을 듣고자 한다
      'p0.4': [['sergius', 'sit-speak', { to: 'barnabas' }], ['barnabas', 'speak', { to: 'sergius', delay: 3000 }], ['sergius', 'sit', { delay: 3000 }]],
      // 총독 곁의 마술사 엘루마가 가로막는다
      'p1.0': [['barnabas', 'idle'], ['elymas', 'idle', { look: 1.0 }]],
      'p1.1': [['elymas', 'idle', { look: 1.1 }]],
      'p1.2': [['elymas', 'rebuke', { x: 0.5, z: 0.05, look: 1.2 }], ['elymas', 'speak', { look: -1.6, to: 'sergius', delay: 3200 }]],
      // 성령으로 가득한 바울이 엘루마를 똑바로 바라본다
      'p1.3': [['elymas', 'idle', { look: 1.1 }], ['fill', null, { show: 1 }], ['paul', 'idle', { x: 1.35, z: 0.15, look: -1.2 }]],
      'p2.0': [['paul', 'speak', { to: 'elymas' }]],
      'p2.1': [['paul', 'rebuke', { look: -1.2 }]],
      'p2.2': [['paul', 'speak', { to: 'elymas' }]],
      // 안개와 어둠에 덮여 — 손을 이끌 사람을 찾아 더듬는다. 수행원이 손을 잡는다
      'p2.3': [['fill', null, { show: 0 }], ['paul', 'idle'], ['fog', 'on'], ['elymas', 'shrug', { look: 2.2, delay: 1200 }], ['elymas', 'shrug', { x: 0.25, z: 0.25, look: -1.4, delay: 3000 }],
        ['lictor', 'idle', { x: -0.15, z: 0.35, look: 1.2, delay: 2500 }]],
      // 총독이 놀라며 믿는다 — 일어나 단에서 내려온다
      'p2.4': [['fog', 'on'], ['elymas', 'shrug', { x: 0.25, z: 0.25, look: -1.4 }], ['lictor', 'idle', { x: -0.15, z: 0.35, look: 1.2 }], ['sergius', 'idle', { y: 0, x: -0.15, z: 0.02 }],
        ['sergius', 'idle', { x: 0.65, z: -0.05, look: 1.0, delay: 1400 }], ['sergius', 'bow', { delay: 4200 }], ['paul', 'bless', { look: -1.4, delay: 4200 }]],
      w0: [['fill', null, { show: 1 }], ['fog', 'off'], ['paul', 'speak', { x: 1.35, z: 0.15, look: -1.2, to: 'elymas' }], ['elymas', 'rebuke', { x: 0.5, z: 0.05, look: 1.2 }],
        ['sergius', 'sit', { y: 0.36, x: -0.15, z: -0.53, look: 0.5 }], ['barnabas', 'idle', { x: 1.85, z: -0.12, look: -1.3 }], ['mark', 'idle', { x: 2.0, z: 0.48, look: -1.3 }], ['lictor', 'idle', { x: -0.75, z: -0.2, look: 0.7 }]],
      w1: [['fill', null, { show: 1 }], ['paul', 'rebuke', { look: -1.2 }], ['fog', 'on', { delay: 1500 }], ['elymas', 'shrug', { look: 2.2, delay: 1500 }]],
      w2: [['fill', null, { show: 0 }], ['fog', 'on'], ['elymas', 'shrug', { x: 0.25, z: 0.25, look: -1.4 }], ['lictor', 'idle', { x: -0.15, z: 0.35, look: 1.2 }],
        ['sergius', 'bow', { y: 0, x: 0.65, z: -0.05, look: 1.0 }], ['paul', 'bless', { x: 1.35, z: 0.15, look: -1.4 }]],
      end: [['fill', null, { show: 0 }], ['fog', 'on'], ['paul', 'bless', { x: 1.35, z: 0.15, look: -1.4 }], ['barnabas', 'idle', { x: 1.85, z: -0.12, look: -1.3 }], ['mark', 'idle', { x: 2.0, z: 0.48, look: -1.3 }],
        ['elymas', 'shrug', { x: 0.25, z: 0.25, look: -1.4 }], ['lictor', 'idle', { x: -0.15, z: 0.35, look: 1.2 }], ['sergius', 'bow', { y: 0, x: 0.65, z: -0.05, look: 1.0 }]],
    },
  },

  /* a09. 회당에서 처음 전한 말 — 비시디아 안디옥의 회당 안(synahall): 뒤와 양옆의 돌 의자에 앉은 사람들, 가운데 낭독대.
     처음에 바울·바나바·마가가 들어서다 마가는 돌아서 떠난다(버가에서 예루살렘으로). 회당장이 율법을 읽고 권할 말을 청하자 바울이 일어나 손짓하며 전한다.
     다음 안식일에는 온 성이 모여(앞의 무리), 유대인들이 시기해 반박한다. 두 사람은 담대히 말하고, 이방인들은 기뻐하고, 귀부인들과 유력자들이 둘을 내쫓는다 */
  a09: {
    env: 'day',
    wide: 1.4,
    props: {
      hall: ['synahall', 0, -0.2, { w: 2.4, bx: 0.0 }],
      folk: ['crowd', 0.2, 0.75, { spots: [[-1.1, 0.05], [-0.75, 0.15], [-0.4, 0.05], [0.4, 0.1], [0.75, 0.05], [1.1, 0.12], [-0.2, 0.25], [0.6, 0.28]], face: Math.PI, state: 'stand' }],
    },
    cast: {
      ruler: ['ruler', -0.25, -0.82, 0.1, { y: 0.1, pose: 'sit' }],
      j1: ['jewD', -1.22, -0.35, 1.4, { y: 0.1, pose: 'sit' }],
      j2: ['pharisee', -1.22, 0.05, 1.5, { y: 0.1, pose: 'sit' }],
      g1: ['greek', 1.22, -0.3, -1.4, { y: 0.1, pose: 'sit' }],
      gw: ['greekW', 1.22, 0.1, -1.5, { y: 0.1, pose: 'sit' }],
      nob: ['noblewoman', 0.45, -0.82, -0.2, { y: 0.1, pose: 'sit', gaze: false }],
      paul: ['paul', 1.95, 0.55, -1.3],
      barnabas: ['barnabas', 2.1, 0.25, -1.3],
      mark: ['mark', 2.05, 0.85, -1.3, { gaze: false }],
    },
    beats: {
      enter: [['folk', 'stand', { show: 1 }], ['mark', 'idle', { show: 0 }], ['paul', 'speak', { x: 0.15, z: 0.12, look: -0.4 }], ['barnabas', 'idle', { x: 0.55, z: 0.2, look: -0.9 }],
        ['j1', 'rebuke', { y: 0, x: -0.95, z: -0.35 }], ['j2', 'point', { y: 0, x: -0.95, z: 0.1 }]],
      // 버가에서 — 세 사람이 오다가 마가는 돌아선다
      intro: [['@env', 'day'], ['folk', 'stand', { show: 0 }], ['paul', 'idle', { x: 1.55, z: 0.55 }], ['barnabas', 'idle', { x: 1.7, z: 0.25 }], ['mark', 'idle', { x: 1.7, z: 0.85 }]],
      'p0.1': [['mark', 'idle', { look: 1.3 }], ['paul', 'idle', { look: 2.2 }], ['mark', 'idle', { x: 2.0, z: 0.95, delay: 1500 }], ['mark', 'idle', { show: 0, delay: 3500 }]],
      // 산길을 올라 비시디아 안디옥 — 회당에 들어가 앉는다
      'p0.2': [['mark', 'idle', { show: 0 }], ['paul', 'idle', { x: 0.75, z: 0.42, look: -0.9 }], ['barnabas', 'idle', { x: 1.0, z: 0.5, look: -1.0, delay: 400 }]],
      // 율법과 선지서를 읽고 — 회당장이 권할 말을 청한다
      'p0.3': [['paul', 'sit-ground', { x: 0.75, z: 0.42, look: -0.9 }], ['barnabas', 'sit-ground', { x: 1.0, z: 0.5, look: -1.0 }],
        ['ruler', 'idle', { y: 0, x: 0.0, z: -0.42, look: 0.1, item: 'scroll' }]],
      'p0.4': [['ruler', 'speak', { item: null, look: 0.9, to: 'paul' }]],
      // 바울이 일어나 손짓하며 이스라엘의 역사를 들려준다
      'p1.0': [['ruler', 'idle', { x: -0.4, z: -0.45, look: 0.6 }], ['paul', 'speak', { x: 0.15, z: 0.12, look: -0.4 }], ['barnabas', 'idle', { x: 0.55, z: 0.2, look: -0.9 }]],
      'p1.1': [['paul', 'raise', { look: -0.2 }], ['paul', 'speak', { look: 0.4, delay: 4000 }]],
      'p1.3': [['paul', 'speak', { look: -0.7 }], ['g1', 'listen'], ['gw', 'listen']],
      // 다음 안식일 — 온 성이 모이고, 유대인들이 시기해 반박한다
      'p2.0': [['folk', 'stand', { show: 1 }], ['paul', 'idle'], ['j1', 'rebuke', { y: 0, x: -0.95, z: -0.35 }], ['j2', 'point', { y: 0, x: -0.95, z: 0.1, delay: 500 }]],
      'p2.1': [['paul', 'speak', { look: -1.0, to: 'j1' }], ['barnabas', 'raise', { delay: 300 }]],
      'p2.2': [['paul', 'speak', { look: -1.0, to: 'j1' }], ['barnabas', 'idle']],
      'p2.3': [['paul', 'raise', { look: 0.2 }]],
      // 이방인들은 기뻐하고, 유대인들은 귀부인들을 부추겨 둘을 내쫓는다
      'p2.4': [['paul', 'idle'], ['g1', 'raise', { y: 0, x: 0.95, z: -0.3 }], ['gw', 'pray', { y: 0, x: 0.95, z: 0.1 }], ['nob', 'point', { y: 0, x: 0.45, z: -0.5, look: 0.6 }],
        ['j1', 'point', { x: -0.55, z: -0.1, look: 1.2, delay: 1500 }], ['j2', 'rebuke', { x: -0.45, z: 0.25, look: 1.2, delay: 1700 }],
        ['paul', 'idle', { x: 1.55, z: 0.5, delay: 3500 }], ['barnabas', 'idle', { x: 1.65, z: 0.2, delay: 3600 }]],
      // 발의 먼지를 떨고 이고니온으로 — 오른쪽으로 떠난다
      'p2.5': [['paul', 'idle', { x: 2.0, z: 0.65 }], ['barnabas', 'idle', { x: 2.1, z: 0.35 }], ['paul', 'idle', { show: 0, delay: 2200 }], ['barnabas', 'idle', { show: 0, delay: 2400 }],
        ['g1', 'pray', { look: 1.0 }]],
      w0: [['folk', 'stand', { show: 0 }], ['mark', 'idle', { show: 0 }], ['paul', 'speak', { show: 1, x: 0.15, z: 0.12, look: -0.4 }], ['barnabas', 'idle', { show: 1, x: 0.55, z: 0.2, look: -0.9 }],
        ['ruler', 'listen', { y: 0, x: -0.4, z: -0.45, look: 0.6, item: null }], ['j1', 'sit', { y: 0.1, x: -1.22, z: -0.35, look: 1.4 }], ['j2', 'sit', { y: 0.1, x: -1.22, z: 0.05, look: 1.5 }],
        ['g1', 'sit', { y: 0.1, x: 1.22, z: -0.3, look: -1.4 }], ['gw', 'sit', { y: 0.1, x: 1.22, z: 0.1, look: -1.5 }], ['nob', 'sit', { y: 0.1, x: 0.45, z: -0.82, look: -0.2 }]],
      w1: [['folk', 'stand', { show: 1 }], ['paul', 'speak', { look: -1.0, to: 'j1' }], ['barnabas', 'raise'], ['j1', 'rebuke', { y: 0, x: -0.95, z: -0.35 }], ['j2', 'point', { y: 0, x: -0.95, z: 0.1 }]],
      w2: [['folk', 'stand', { show: 1 }], ['paul', 'idle', { show: 0 }], ['barnabas', 'idle', { show: 0 }], ['g1', 'raise', { y: 0, x: 0.95, z: -0.3 }], ['gw', 'pray', { y: 0, x: 0.95, z: 0.1 }]],
      end: [['folk', 'stand', { show: 1 }], ['mark', 'idle', { show: 0 }], ['paul', 'speak', { show: 1, x: 0.15, z: 0.12, look: -0.4 }], ['barnabas', 'idle', { show: 1, x: 0.55, z: 0.2, look: -0.9 }],
        ['ruler', 'idle', { y: 0, x: -0.4, z: -0.45, look: 0.6, item: null }], ['j1', 'rebuke', { y: 0, x: -0.95, z: -0.35 }], ['j2', 'point', { y: 0, x: -0.95, z: 0.1 }]],
    },
  },

  /* a10. 신이라 불리다가 돌에 맞다 — 루스드라: 왼쪽 뒤 성 앞의 제우스 신전(gtemple, 제단), 오른쪽 뒤 성문(gate). 앉은뱅이가 바울의 말을 듣다가 일어나 걷는다.
     무리가 '신들이 내려오셨다' 외치며 엎드리고, 제사장이 화관 두른 소를 끌고 온다. 두 사람이 무리 속으로 뛰어들어 말린다(제단의 불이 꺼진다).
     안디옥·이고니온에서 온 유대인들이 무리를 부추기자 돌이 날아든다 — 돌은 바울 앞 땅에 떨어지고(맞는 모습 없음), 바울은 쓰러진다(topple).
     성 밖에 쓰러진 바울을 제자들이 둘러서고, 바울이 일어나 걷는다. 이튿날 바나바와 함께 더베(오른쪽, 동쪽)로 */
  a10: {
    env: 'day',
    wide: 1.45,
    props: {
      temple: ['gtemple', -1.45, -0.7, { w: 1.1, d: 0.85, altar: [0.15, 0.62], state: 'idle' }],
      gate: ['gate', 1.25, -0.85],
      folk: ['crowd', -0.25, 0.3, { spots: [[-0.55, -0.15], [-0.35, 0.2], [-0.75, 0.3], [-0.1, 0.45], [-0.9, -0.05]], face: Math.PI / 2, state: 'stand' }],
      ox1: ['garlandox', -1.75, 0.2, { scale: 0.75, rot: 0 }],
      stones: ['stonethrow', -0.45, 0.25, { h: 0.7, dx: 0.7, dz: -0.05 }],
    },
    cast: {
      paul: ['paul', 0.75, 0.1, -1.2],
      barnabas: ['barnabas', 1.15, -0.2, -1.2],
      lame: ['lame', 0.05, 0.35, 0.9, { pose: 'sit-ground' }],
      l1: ['lycaonian', -0.55, -0.3, 1.2],
      lw: ['lycaonianW', -0.25, 0.6, 1.1],
      priest: ['zeuspriest', -1.25, -0.05, 1.0],
      j1: ['jewD', 2.1, 0.3, -1.3, { gaze: false }],
      j2: ['pharisee', 2.15, 0.6, -1.3, { gaze: false }],
      d1: ['elderC', 1.9, -0.45, -1.3, { gaze: false }],
      d2: ['timothy', 2.05, -0.2, -1.3, { gaze: false }],
    },
    beats: {
      enter: [['temple', 'fire'], ['ox1', null, { x: -0.95, z: 0.05 }], ['priest', 'raise', { x: -0.7, z: -0.15, look: 1.2 }], ['folk', 'stand'], ['lame', 'idle', { x: 0.1, z: 0.35, look: 1.0 }],
        ['l1', 'bow', { x: -0.2, z: -0.25, look: 1.2 }], ['lw', 'bow', { look: 1.2 }], ['paul', 'raise', { x: 0.5, z: 0.0, look: -1.3 }], ['barnabas', 'rebuke', { x: 0.85, z: -0.3, look: -1.2 }],
        ['j1', 'idle', { show: 0 }], ['j2', 'idle', { show: 0 }], ['d1', 'idle', { show: 0 }], ['d2', 'idle', { show: 0 }]],
      // 앉은뱅이가 바울의 말을 듣고 있다
      intro: [['@env', 'day'], ['temple', 'idle'], ['stones', 'idle'], ['folk', 'stand'], ['ox1', null, { show: 0 }], ['priest', 'idle', { show: 0 }], ['j1', 'idle', { show: 0 }], ['j2', 'idle', { show: 0 }],
        ['d1', 'idle', { show: 0 }], ['d2', 'idle', { show: 0 }], ['paul', 'speak', { to: 'l1' }], ['lame', 'sit-ground', { look: 1.1 }]],
      // 나을 만한 믿음 — 큰 소리로
      'p0.1': [['paul', 'idle', { look: -1.5 }]],
      'p0.2': [['paul', 'point', { look: -1.5 }], ['paul', 'speak', { to: 'lame', delay: 1500 }]],
      // 벌떡 일어나 걷는다
      'p0.3': [['paul', 'idle'], ['lame', 'idle', { look: 1.0 }], ['lame', 'raise', { x: 0.3, z: 0.55, look: 0.4, delay: 1200 }], ['lw', 'afraid', { delay: 800 }], ['l1', 'afraid', { delay: 1000 }]],
      // 무리가 리가오니아 말로 외친다 — 신들이 내려오셨다
      'p1.0': [['lame', 'raise', { x: 0.3, z: 0.55 }], ['l1', 'raise', { look: 1.2 }], ['lw', 'raise', { look: 1.1, delay: 400 }]],
      'p1.1': [['l1', 'speak', { look: 1.2 }]],
      'p1.2': [['l1', 'bow', { x: -0.2, z: -0.25, look: 1.2 }], ['lw', 'bow', { look: 1.2, delay: 500 }], ['lame', 'bow', { look: 1.2, delay: 900 }]],
      // 제우스 신전의 제사장이 소와 꽃다발을 끌고 온다 — 제단에 불
      'p1.3': [['temple', 'fire'], ['priest', 'idle', { show: 1, x: -0.7, z: -0.15, look: 1.2 }], ['ox1', null, { show: 1, x: -0.95, z: 0.05 }]],
      // 옷을 찢고 무리 속으로 뛰어들어 외친다 — 우리도 여러분과 같은 사람
      'p1.4': [['priest', 'raise'], ['paul', 'rebuke', { x: 0.5, z: 0.0, look: -1.3 }], ['barnabas', 'rebuke', { x: 0.85, z: -0.3, look: -1.2, delay: 300 }]],
      'p1.5': [['paul', 'raise', { look: -1.3 }], ['barnabas', 'speak', { to: 'priest', delay: 2500 }]],
      // 살아 계신 하나님께 돌아오라 — 겨우 제사를 말린다 (불이 꺼지고 소를 되돌린다)
      'p2.0': [['paul', 'speak', { to: 'priest' }], ['barnabas', 'idle'], ['priest', 'shrug', { delay: 3000 }], ['temple', 'idle', { delay: 3500 }],
        ['ox1', null, { x: -1.75, z: 0.2, delay: 3500 }], ['priest', 'idle', { x: -1.45, z: 0.0, delay: 4500 }], ['l1', 'idle', { delay: 2500 }], ['lw', 'idle', { delay: 2700 }], ['lame', 'idle', { delay: 2900 }]],
      // 안디옥과 이고니온에서 온 유대인들이 무리를 부추긴다
      'p2.1': [['temple', 'idle'], ['ox1', null, { show: 0 }], ['priest', 'idle', { show: 0 }], ['paul', 'idle', { x: 0.5, z: 0.0, look: -1.3 }],
        ['j1', 'idle', { show: 1, x: -0.15, z: 0.05, look: -1.2 }], ['j2', 'point', { show: 1, x: -0.05, z: 0.4, look: -1.4, delay: 400 }], ['j1', 'speak', { to: 'l1', delay: 2800 }],
        ['l1', 'rebuke', { x: -0.5, z: -0.2, look: 1.2, delay: 3500 }], ['lw', 'idle', { x: -0.6, z: 0.55, look: 1.1 }], ['lame', 'idle', { x: -1.1, z: 0.65, delay: 1000 }], ['lame', 'idle', { show: 0, delay: 4500 }]],
      // 돌을 던진다 — 돌은 바울 앞 땅에 떨어지고, 바울은 쓰러진다. 무리는 그를 성 밖에 버려두고 떠난다
      'p2.2': [['lame', 'idle', { show: 0 }], ['stones', 'throw'], ['l1', 'hurl', { look: 1.3 }], ['j1', 'hurl', { look: 1.4, delay: 500 }], ['paul', 'cower', { delay: 1000 }], ['paul', 'topple', { delay: 2600 }],
        ['stones', 'idle', { delay: 4500 }], ['l1', 'idle', { x: -1.9, z: -0.1, delay: 5000 }], ['j1', 'idle', { x: -1.85, z: 0.3, delay: 5200 }], ['j2', 'idle', { x: -1.9, z: 0.6, delay: 5400 }], ['lw', 'idle', { x: -2.0, z: 0.75, delay: 5600 }],
        ['l1', 'idle', { show: 0, delay: 8000 }], ['j1', 'idle', { show: 0, delay: 8200 }], ['j2', 'idle', { show: 0, delay: 8400 }], ['lw', 'idle', { show: 0, delay: 8600 }], ['folk', null, { show: 0, delay: 5500 }],
        ['barnabas', 'mourn', { x: 0.8, z: -0.1, look: -1.0, delay: 6000 }]],
      // 제자들이 둘러서자 바울이 일어나 성으로 들어가고, 이튿날 더베로
      'p2.3': [['stones', 'idle'], ['folk', null, { show: 0 }], ['l1', 'idle', { show: 0 }], ['j1', 'idle', { show: 0 }], ['j2', 'idle', { show: 0 }], ['lw', 'idle', { show: 0 }], ['lame', 'idle', { show: 0 }],
        ['paul', 'topple'], ['barnabas', 'kneel', { x: 0.8, z: -0.1, look: -1.0 }], ['d1', 'pray', { show: 1, x: 0.85, z: 0.3, look: -1.4 }], ['d2', 'pray', { show: 1, x: 0.3, z: 0.4, look: 2.4, delay: 300 }],
        ['paul', 'sit-ground', { delay: 3000 }], ['paul', 'idle', { look: 1.2, delay: 4800 }], ['barnabas', 'idle', { look: -1.2, delay: 4800 }],
        ['paul', 'idle', { x: 1.25, z: -0.5, delay: 6500 }], ['barnabas', 'idle', { x: 1.45, z: -0.45, delay: 6700 }], ['paul', 'idle', { show: 0, delay: 9500 }], ['barnabas', 'idle', { show: 0, delay: 9700 }]],
      w0: [['folk', 'stand', { show: 1 }], ['ox1', null, { show: 0 }], ['priest', 'idle', { show: 0 }], ['temple', 'idle'], ['stones', 'idle'], ['j1', 'idle', { show: 0 }], ['j2', 'idle', { show: 0 }], ['d1', 'idle', { show: 0 }], ['d2', 'idle', { show: 0 }],
        ['paul', 'speak', { show: 1, x: 0.75, z: 0.1, look: -1.5, to: 'lame' }], ['barnabas', 'idle', { show: 1, x: 1.15, z: -0.2, look: -1.2 }], ['lame', 'sit-ground', { show: 1, x: 0.05, z: 0.35, look: 1.1 }],
        ['l1', 'idle', { show: 1, x: -0.55, z: -0.3, look: 1.2 }], ['lw', 'idle', { show: 1, x: -0.25, z: 0.6, look: 1.1 }]],
      w1: [['lame', 'raise', { x: 0.3, z: 0.55 }], ['l1', 'speak', { look: 1.2 }], ['lw', 'raise', { look: 1.1 }], ['temple', 'fire'], ['priest', 'idle', { show: 1, x: -0.7, z: -0.15, look: 1.2 }], ['ox1', null, { show: 1, x: -0.95, z: 0.05 }]],
      w2: [['folk', 'stand', { show: 1 }], ['paul', 'raise', { show: 1, x: 0.5, z: 0.0, look: -1.3 }], ['barnabas', 'speak', { show: 1, x: 0.85, z: -0.3, look: -1.2, to: 'priest' }], ['priest', 'shrug', { show: 1, x: -0.7, z: -0.15, look: 1.2 }],
        ['l1', 'bow', { show: 1, x: -0.2, z: -0.25, look: 1.2 }], ['lw', 'bow', { show: 1, look: 1.2 }], ['lame', 'bow', { show: 1, x: 0.3, z: 0.55, look: 1.2 }], ['ox1', null, { show: 1, x: -0.95, z: 0.05 }], ['temple', 'fire'],
        ['j1', 'idle', { show: 0 }], ['j2', 'idle', { show: 0 }], ['d1', 'idle', { show: 0 }], ['d2', 'idle', { show: 0 }], ['stones', 'idle']],
      end: [['folk', 'stand', { show: 1 }], ['temple', 'fire'], ['stones', 'idle'], ['ox1', null, { show: 1, x: -0.95, z: 0.05 }], ['priest', 'raise', { show: 1, x: -0.7, z: -0.15, look: 1.2 }],
        ['lame', 'idle', { show: 1, x: 0.1, z: 0.35, look: 1.0 }], ['l1', 'bow', { show: 1, x: -0.2, z: -0.25, look: 1.2 }], ['lw', 'bow', { show: 1, x: -0.25, z: 0.6, look: 1.2 }],
        ['paul', 'raise', { show: 1, x: 0.5, z: 0.0, look: -1.3 }], ['barnabas', 'rebuke', { show: 1, x: 0.85, z: -0.3, look: -1.2 }],
        ['j1', 'idle', { show: 0 }], ['j2', 'idle', { show: 0 }], ['d1', 'idle', { show: 0 }], ['d2', 'idle', { show: 0 }]],
    },
  },

  /* a11. 다시 그 성들로 — 더베의 작은 성문(gate)과 집들. 바울과 바나바가 사람들에게 전하고(제자들), 동쪽(오른쪽) 길리기아 관문 쪽을 바라보다
     발길을 돌린다(왼쪽, 지나온 성들로). 성마다 제자들을 굳세게 하고 — 무릎 꿇은 장로들에게 손을 얹고 금식하며 기도해 주님께 맡긴다(빛).
     두 사람은 서쪽(왼쪽)으로 떠나 안디옥으로 돌아가고, 남은 제자들이 기도한다 */
  a11: {
    env: 'day',
    wide: 1.4,
    props: {
      gate: ['gate', -0.2, -0.85],
      homeL: ['house', -1.6, -0.55, { stair: false }],
      homeR: ['house', 1.35, -0.6, { stair: true, wall: '#d6c09a' }],
      road: ['road', 1.6, 0.45, { len: 1.8, w: 0.36, rot: -0.15 }],
      light: ['beam', -0.05, 0.25, { r: 0.6, h: 2.4 }],
    },
    cast: {
      paul: ['paul', 0.55, 0.0, -1.1],
      barnabas: ['barnabas', 0.85, 0.3, -1.2],
      e1: ['elderC', -0.35, 0.05, 1.1],
      e2: ['lycaonian', -0.6, 0.38, 1.0],
      w1: ['lycaonianW', -0.95, 0.05, 1.0, { gaze: false }],
      t1: ['timothy', -0.25, 0.55, 1.2, { gaze: false }],
    },
    beats: {
      enter: [['light', null, { show: 1 }], ['e1', 'kneel', { x: -0.2, z: 0.15, look: 0.9 }], ['e2', 'kneel', { x: -0.2, z: 0.45, look: 1.0 }], ['paul', 'bless', { x: 0.25, z: 0.12, look: -1.2 }],
        ['barnabas', 'bless', { x: 0.3, z: 0.45, look: -1.3 }], ['w1', 'pray', { x: -0.75, z: 0.1, look: 1.0 }], ['t1', 'pray', { x: -0.65, z: 0.55, look: 1.0 }]],
      // 더베에서 복음을 전해 많은 제자를 얻는다
      intro: [['@env', 'day'], ['light', null, { show: 0 }], ['paul', 'speak', { to: 'e1' }]],
      'p0.0': [['paul', 'speak', { to: 'e1' }], ['barnabas', 'speak', { to: 'e2', delay: 3500 }], ['paul', 'idle', { delay: 3500 }]],
      // 길리기아 관문만 넘으면 고향 다소 — 동쪽 길을 바라본다
      'p0.1': [['barnabas', 'idle'], ['paul', 'idle', { x: 1.15, z: 0.35, look: 1.4 }], ['barnabas', 'idle', { x: 1.0, z: 0.6, look: 1.3, delay: 400 }]],
      // 발길을 돌려 — 지나온 성들로 (왼쪽을 본다)
      'p0.2': [['paul', 'idle', { look: -1.4 }], ['barnabas', 'idle', { look: -1.4, delay: 600 }], ['paul', 'idle', { x: 0.45, z: 0.12, look: -1.2, delay: 2500 }], ['barnabas', 'idle', { x: 0.6, z: 0.42, look: -1.3, delay: 2700 }]],
      // 제자들의 마음을 굳세게 하고 — 믿음에 머물라
      'p1.0': [['paul', 'speak', { x: 0.45, z: 0.12, look: -1.2, to: 'e1' }], ['e1', 'listen'], ['e2', 'listen'], ['w1', 'listen'], ['t1', 'listen']],
      'p1.1': [['paul', 'idle'], ['barnabas', 'speak', { x: 0.6, z: 0.42, to: 'e2' }]],
      'p1.2': [['barnabas', 'idle'], ['paul', 'speak', { to: 'e1' }]],
      // 장로들을 세우고 손을 얹어 — 금식하며 기도하고 주님께 맡긴다 (빛)
      'p1.3': [['paul', 'idle'], ['e1', 'kneel', { x: -0.2, z: 0.15, look: 0.9 }], ['e2', 'kneel', { x: -0.2, z: 0.45, look: 1.0, delay: 300 }],
        ['paul', 'bless', { x: 0.25, z: 0.12, look: -1.2, delay: 1500 }], ['barnabas', 'bless', { x: 0.3, z: 0.45, look: -1.3, delay: 1700 }], ['light', null, { show: 1, delay: 3500 }],
        ['w1', 'pray', { x: -0.75, z: 0.1, look: 1.0 }], ['t1', 'pray', { x: -0.65, z: 0.55, look: 1.0 }]],
      // 버가와 앗달리아를 거쳐 안디옥으로 — 두 사람이 서쪽(왼쪽)으로 떠난다
      'p2.0': [['light', null, { show: 1 }], ['e1', 'idle', { look: -1.2, delay: 1500 }], ['e2', 'idle', { look: -1.2, delay: 1700 }],
        ['paul', 'idle', { x: -1.75, z: 0.75, delay: 600 }], ['barnabas', 'idle', { x: -1.65, z: 0.95, delay: 800 }], ['paul', 'idle', { show: 0, delay: 6200 }], ['barnabas', 'idle', { show: 0, delay: 6400 }],
        ['w1', 'bless', { look: -1.6, delay: 2500 }], ['t1', 'bless', { look: -1.8, delay: 2700 }]],
      // 믿음의 문을 여신 일 — 남은 제자들이 빛 속에서 기도한다
      'p2.1': [['paul', 'idle', { show: 0 }], ['barnabas', 'idle', { show: 0 }], ['e1', 'pray', { look: 0.4 }], ['e2', 'pray', { look: 0.6 }], ['w1', 'pray', { look: 0.8 }], ['t1', 'pray', { look: 0.8 }]],
      w0: [['light', null, { show: 0 }], ['paul', 'speak', { show: 1, x: 0.45, z: 0.12, look: -1.2, to: 'e1' }], ['barnabas', 'idle', { show: 1, x: 0.6, z: 0.42, look: -1.3 }],
        ['e1', 'listen', { x: -0.35, z: 0.05, look: 1.1 }], ['e2', 'listen', { x: -0.6, z: 0.38, look: 1.0 }], ['w1', 'listen', { x: -0.95, z: 0.05 }], ['t1', 'listen', { x: -0.25, z: 0.55 }]],
      w1: [['light', null, { show: 1 }], ['e1', 'kneel', { x: -0.2, z: 0.15, look: 0.9 }], ['e2', 'kneel', { x: -0.2, z: 0.45, look: 1.0 }], ['paul', 'bless', { show: 1, x: 0.25, z: 0.12, look: -1.2 }],
        ['barnabas', 'bless', { show: 1, x: 0.3, z: 0.45, look: -1.3 }], ['w1', 'pray', { x: -0.75, z: 0.1, look: 1.0 }], ['t1', 'pray', { x: -0.65, z: 0.55, look: 1.0 }]],
      w2: [['light', null, { show: 1 }], ['paul', 'idle', { show: 0 }], ['barnabas', 'idle', { show: 0 }], ['e1', 'pray', { look: 0.4 }], ['e2', 'pray', { look: 0.6 }], ['w1', 'pray', { look: 0.8 }], ['t1', 'pray', { look: 0.8 }]],
      end: [['light', null, { show: 1 }], ['e1', 'kneel', { x: -0.2, z: 0.15, look: 0.9 }], ['e2', 'kneel', { x: -0.2, z: 0.45, look: 1.0 }], ['paul', 'bless', { show: 1, x: 0.25, z: 0.12, look: -1.2 }],
        ['barnabas', 'bless', { show: 1, x: 0.3, z: 0.45, look: -1.3 }], ['w1', 'pray', { x: -0.75, z: 0.1, look: 1.0 }], ['t1', 'pray', { x: -0.65, z: 0.55, look: 1.0 }]],
    },
  },
};

/* 바울 여정 대본 묶음 c: a22–a32 (stage/paul.js가 합친다)
   에베소의 두 해(두란노 서원·불살라진 마술책·극장의 소동)에서 마게도냐와 고린도의 편지, 드로아·밀레도·가이사랴를 지나 예루살렘에서 붙잡혀
   밤에 가이사랴로 보내지기까지. 바울은 길 위에서는 paul(지팡이), 편지를 쓰거나 손에 무엇을 들 때는 paulS.
   주님은 모습 없이 빛(beam)으로만, 성령도 빛으로. 고통과 폭력은 그리지 않는다 — 스게와의 아들들은 달아나 사라질 뿐(다친 모습·벗은 모습 없음),
   유두고는 창턱에서 잠들어 기울다가 창 밖으로 사라지고 아래 땅에 고요히 누운 모습으로만, 성전의 소동은 외치는 무리와 사슬로만(때리는 모습 없음),
   채찍질은 묶는 데서 멈춘다. 이 묶음의 소품은 stage/paul/props-c.js */
import './props-c.js';

// 무리의 자리: 가운데를 둘러 n명을 흩어 놓는다 (a.js와 같다)
const flock = (n, rx, rz, seed = 1, cx = 0, cz = 0) => Array.from({ length: n }, (_, i) => {
  const a = i * 2.399 + seed, r = Math.sqrt((i + 0.5) / n);
  return [cx + Math.cos(a) * r * rx, cz + Math.sin(a) * r * rz];
});
// 공의회 반원 의자의 자리 (a.js와 같다)
const seat = (cx, cz, a, R = 0.85) => [cx + Math.cos(a) * R, cz + 0.15 + Math.sin(a) * R * 0.82];
const look = ([x, z], [tx, tz]) => Math.atan2(tx - x, tz - z);

// a27 드로아의 다락방 자리: 소품 (RX, RZ), 방 바닥 0.9, 오른벽 창턱 (SX, SY, SZ) — props-c.js upperroom3의 P.sill
const RX = -0.15, RZ = -0.3, SX = RX + 0.685, SY = 1.185, SZ = RZ + 0.12;
// a32 공의회
const CX = -1.15, CZ = -0.38;
const C1 = seat(CX, CZ, Math.PI * 1.13, 0.75), C2 = seat(CX, CZ, Math.PI * 1.38, 0.75), C3 = seat(CX, CZ, Math.PI * 1.62, 0.75), C4 = seat(CX, CZ, Math.PI * 1.87, 0.75);
const PC = [CX, CZ + 0.42];
// 에베소: 핀이 바닷가라(지도의 옛 해안) 무대 왼쪽이 바다에 걸린다 — 무대를 동쪽 뭍으로 조금 옮긴다
const EPH = [37.936, 27.39]; // 공의회 가운데 선 바울

export const C = {
  /* a22. 두란노 서원의 두 해 — 왼쪽 뒤에 에베소의 회당(synagogue), 오른쪽에 두란노 서원(schola: 선생의 자리와 긴 의자).
     바울이 제자 몇 사람에게 묻고, 물을 부어 세례를 주고 손을 얹자 빛(성령)이 내린다 — 열두 사람쯤(무리가 곁에 선다).
     회당에서 석 달 전하다가 헐뜯는 사람들을 두고, 제자들을 데리고 서원으로 옮겨 날마다 가르친다(듣는 사람이 늘어난다).
     고린도에서 소식이 오자, 바울은 서원 앞 낮은 상에 앉아 편지를 쓴다(scribedesk — 글줄이 차오른다) */
  a22: {
    env: 'day',
    at: EPH,
    wide: 1.45,
    props: {
      syn: ['synagogue', -1.3, -0.72, { scale: 0.62 }],
      hall: ['schola', 1.05, -0.28, { w: 1.7 }],
      spirit: ['beam', -0.95, 0.25, { r: 0.55, h: 2.4 }],
      water: ['pour', -0.8, 0.32, { h: 0.82 }],
      twelve: ['crowd', -1.1, 0.25, { spots: [[-0.55, -0.2], [-0.62, 0.12], [-0.45, 0.42], [-0.15, 0.5], [0.3, -0.35], [-0.2, -0.38], [0.45, 0.5], [0.0, -0.45]], face: Math.PI / 2 }],
      desk: ['scribedesk', 0.25, 0.62],
    },
    cast: {
      paul: ['paulS', -0.3, 0.3, -1.2],
      d1: ['greek', -0.8, 0.32, 1.2],
      d2: ['jewD', -1.15, 0.05, 1.0],
      d3: ['greek2', -1.25, 0.48, 1.1],
      d4: ['hellenist', -0.75, 0.02, 0.9],
      j1: ['pharisee', -1.75, -0.05, 1.0, { gaze: false }],
      j2: ['jewD', -1.55, -0.28, 0.9, { gaze: false }],
      s1: ['greekW', 0.62, 0.02, 2.8, { y: 0.1, pose: 'sit', gaze: false }],
      s2: ['ephesian', 1.5, 0.02, -2.8, { y: 0.1, pose: 'sit', gaze: false }],
      s3: ['greek', 1.4, 0.27, -2.8, { y: 0.1, pose: 'sit', gaze: false }],
      s4: ['lycaonian', 0.7, 0.27, 2.8, { y: 0.1, pose: 'sit', gaze: false }],
      news: ['greek2', -2.1, 0.7, 1.3],
    },
    beats: {
      enter: [['spirit', null, { show: 0 }], ['twelve', null, { show: 0 }], ['j1', 'idle', { show: 0 }], ['j2', 'idle', { show: 0 }], ['desk', 'write'],
        ['paul', 'sit-ground', { x: 0.25, z: 0.45, look: 0 }], ['news', 'idle', { x: -0.25, z: 0.58, look: 1.2, item: 'scroll' }],
        ['d1', 'idle', { x: 0.62, z: -0.2, look: 2.8, y: 0.1, pose: 'sit' }], ['d2', 'idle', { x: 1.45, z: -0.2, look: -2.8 }], ['d3', 'listen', { x: 0.75, z: 0.5, look: -1.2 }], ['d4', 'listen', { x: -0.2, z: 0.3, look: 1.0 }],
        ['s1', 'sit'], ['s2', 'sit'], ['s3', 'sit'], ['s4', 'sit']],
      // 에베소에서 만난 제자 몇 사람 — 바울이 묻는다
      intro: [['@env', 'day'], ['spirit', null, { show: 0 }], ['water', 'idle'], ['twelve', null, { show: 0 }], ['desk', 'blank'], ['j1', 'idle', { show: 0 }], ['j2', 'idle', { show: 0 }],
        ['s1', 'sit', { show: 0 }], ['s2', 'sit', { show: 0 }], ['s3', 'sit', { show: 0 }], ['s4', 'sit', { show: 0 }], ['news', 'idle', { show: 0 }], ['paul', 'speak', { to: 'd1' }]],
      'p0.1': [['paul', 'speak', { to: 'd1' }], ['d1', 'listen'], ['d2', 'listen']],
      'p0.2': [['paul', 'idle'], ['d1', 'shrug'], ['d4', 'shrug', { delay: 600 }]],
      'p0.3': [['d1', 'speak', { to: 'paul' }]],
      'p0.4': [['d1', 'idle'], ['d4', 'idle'], ['d2', 'bow']],
      // 예수를 전하고 — 주 예수의 이름으로 세례 (머리에 물을 붓는다)
      'p0.5': [['paul', 'speak', { to: 'd1' }], ['d2', 'listen'], ['d1', 'kneel', { delay: 2200 }], ['paul', 'anoint', { look: -1.4, delay: 2600 }], ['water', 'pour', { delay: 3000 }],
        ['water', 'idle', { delay: 6500 }], ['paul', 'idle', { delay: 6800 }]],
      // 손을 얹으니 성령이 내린다 — 빛
      'p0.6': [['water', 'idle'], ['d1', 'kneel'], ['paul', 'bless', { look: -1.3 }], ['spirit', null, { show: 1, delay: 1200 }],
        ['d1', 'look-up', { delay: 1800 }], ['d2', 'look-up', { delay: 2000 }], ['d3', 'raise', { delay: 2300 }], ['d4', 'look-up', { delay: 2500 }]],
      'p0.7': [['spirit', null, { show: 1 }], ['twelve', null, { show: 1 }], ['d1', 'raise'], ['paul', 'idle']],
      // 석 달 동안 회당에서 — 회당 문 앞에서 담대하게 전한다
      'p1.0': [['spirit', null, { show: 0 }], ['twelve', null, { show: 0 }], ['d1', 'idle', { x: -0.15, z: 0.55, look: -1 }], ['d2', 'idle', { x: 0.1, z: 0.35, look: -1 }],
        ['d3', 'idle', { x: -0.4, z: 0.62, look: -1 }], ['d4', 'idle', { x: 0.05, z: 0.08, look: -1.2 }],
        ['paul', 'idle', { x: -1.05, z: -0.15 }], ['paul', 'speak', { look: -0.8, to: 'j1', delay: 1600 }],
        ['j1', 'listen', { show: 1, x: -1.75, z: 0.2, look: 1.0 }], ['j2', 'listen', { show: 1, x: -1.5, z: 0.35, look: 0.9, delay: 400 }]],
      // 마음을 굳게 닫고 이 길을 헐뜯는다
      'p1.1': [['paul', 'idle', { x: -1.05, z: -0.15, look: -0.8 }], ['j1', 'rebuke', { show: 1, x: -1.75, z: 0.2, look: 1.0 }], ['j2', 'point', { show: 1, x: -1.5, z: 0.35, look: 1.4, delay: 800 }]],
      // 제자들을 따로 데리고 두란노 서원으로 — 선생의 자리에 서고, 제자들은 긴 의자에 앉는다
      'p1.2': [['j1', 'idle', { show: 0, delay: 2500 }], ['j2', 'idle', { show: 0, delay: 2700 }],
        ['paul', 'idle', { x: 1.05, z: -0.62, delay: 300 }], ['paul', 'speak', { look: 0, delay: 5800 }],
        ['d1', 'idle', { x: 0.62, z: -0.2, delay: 900 }], ['d2', 'idle', { x: 1.45, z: -0.2, delay: 1100 }], ['d3', 'idle', { x: 0.62, z: 0.05, delay: 1300 }], ['d4', 'idle', { x: 1.45, z: 0.05, delay: 1500 }],
        ['d1', 'sit', { y: 0.1, look: 2.8, delay: 4800 }], ['d2', 'sit', { y: 0.1, look: -2.8, delay: 4600 }], ['d3', 'sit', { y: 0.1, look: 2.8, delay: 5200 }], ['d4', 'sit', { y: 0.1, look: -2.8, delay: 4700 }]],
      // 두 해 — 아시아의 유대인과 헬라인이 모두 듣는다 (뒷줄까지 찬다)
      'p1.3': [['j1', 'idle', { show: 0 }], ['j2', 'idle', { show: 0 }], ['paul', 'speak', { x: 1.05, z: -0.62, look: 0 }],
        ['d1', 'sit', { x: 0.62, z: -0.2, y: 0.1, look: 2.8 }], ['d2', 'sit', { x: 1.45, z: -0.2, y: 0.1, look: -2.8 }], ['d3', 'sit', { x: 0.62, z: 0.05, y: 0.1, look: 2.8 }], ['d4', 'sit', { x: 1.45, z: 0.05, y: 0.1, look: -2.8 }],
        ['s1', 'sit', { show: 1, x: 0.45, z: 0.3, delay: 600 }], ['s2', 'sit', { show: 1, x: 1.65, z: 0.3, delay: 1200 }], ['s3', 'sit', { show: 1, x: 0.75, z: 0.3, delay: 1800 }], ['s4', 'sit', { show: 1, x: 1.35, z: 0.3, delay: 2400 }]],
      // 바다 건너 고린도에서 걱정스러운 소식 — 사람이 편지를 들고 온다
      'p2.0': [['s1', 'sit', { show: 0 }], ['s2', 'sit', { show: 0 }], ['s3', 'sit', { show: 0 }], ['s4', 'sit', { show: 0 }], ['d2', 'sit', { show: 0 }], ['d4', 'sit', { show: 0 }],
        ['paul', 'idle', { x: 0.55, z: 0.4, look: -1.2 }], ['news', 'idle', { show: 1, item: 'scroll', x: -0.15, z: 0.55, look: 1.2 }]],
      'p2.1': [['news', 'speak', { to: 'paul' }], ['paul', 'listen', { look: -1.3 }]],
      // 물음을 적어 보낸 편지를 건넨다
      'p2.2': [['news', 'idle', { item: null, delay: 1800 }], ['paul', 'idle', { item: 'scroll', delay: 1800 }]],
      // 바울이 낮은 상에 앉아 편지를 쓴다
      'p2.3': [['news', 'idle', { item: null }], ['paul', 'sit-ground', { item: null, x: 0.25, z: 0.45, look: 0 }], ['desk', 'write', { delay: 2500 }], ['news', 'listen', { x: -0.25, z: 0.58, look: 1.2 }]],
      'p2.4': [['desk', 'write'], ['paul', 'sit-ground', { x: 0.25, z: 0.45, look: 0 }]],
      // 그리스도의 한 몸 — 서원의 제자들이 둘러 와 선다
      'p2.5': [['d1', 'listen', { y: 0, x: 0.75, z: 0.5, look: -1.2 }], ['d3', 'listen', { y: 0, x: -0.05, z: 0.32, look: 0.8, delay: 400 }]],
      'p2.6': [['paul', 'look-up', { delay: 800 }], ['desk', 'done', { delay: 3000 }]],
      w0: [['spirit', null, { show: 0 }], ['twelve', null, { show: 0 }], ['desk', 'blank'], ['news', 'idle', { show: 0 }], ['paul', 'speak', { item: null, x: -0.3, z: 0.3, look: -1.2, to: 'd1' }],
        ['d1', 'listen', { y: 0, x: -0.8, z: 0.32, look: 1.2 }], ['d2', 'listen', { show: 1, y: 0, x: -1.15, z: 0.05, look: 1.0 }], ['d3', 'idle', { y: 0, x: -1.25, z: 0.48, look: 1.1 }], ['d4', 'idle', { show: 1, y: 0, x: -0.75, z: 0.02, look: 0.9 }]],
      w1: [['paul', 'listen'], ['d1', 'speak', { to: 'paul' }], ['d4', 'shrug']],
      w2: [['spirit', null, { show: 0 }], ['d1', 'idle'], ['d4', 'idle'], ['paul', 'sit-ground', { x: 0.25, z: 0.45, look: 0 }], ['desk', 'write'],
        ['d1', 'listen', { x: 0.75, z: 0.5, look: -1.2 }], ['d3', 'listen', { x: -0.05, z: 0.32, look: 0.8 }], ['d2', 'idle', { show: 0 }], ['d4', 'idle', { show: 0 }]],
      w3: [['paul', 'look-up', { x: 0.25, z: 0.45, look: 0 }], ['desk', 'done']],
      end: [['spirit', null, { show: 0 }], ['twelve', null, { show: 0 }], ['water', 'idle'], ['j1', 'idle', { show: 0 }], ['j2', 'idle', { show: 0 }], ['desk', 'done'],
        ['s1', 'sit', { show: 0 }], ['s2', 'sit', { show: 0 }], ['s3', 'sit', { show: 0 }], ['s4', 'sit', { show: 0 }], ['news', 'listen', { show: 1, x: -0.25, z: 0.58, look: 1.2, item: null }],
        ['paul', 'sit-ground', { item: null, x: 0.25, z: 0.45, look: 0 }], ['d1', 'listen', { show: 1, y: 0, x: 0.75, z: 0.5, look: -1.2 }], ['d3', 'listen', { show: 1, y: 0, x: -0.05, z: 0.32, look: 0.8 }],
        ['d2', 'idle', { show: 0 }], ['d4', 'idle', { show: 0 }]],
    },
  },

  /* a23. 불살라진 마술책 — 왼쪽은 바울(천막 깁는 일꾼)과 깔개에 누운 병자: 바울이 쓰던 수건을 가져다 대자 일어난다.
     오른쪽은 악한 영 들린 사람의 집(house): 떠돌이 축귀자들(스게와의 아들들)이 바울을 흉내 내 명하자, 그 사람(머리 둘레에 어두운 그림자 haze)이
     대답하고 달려든다 — 그들은 놀라 달아나 사라진다(다친 모습·벗은 모습은 그리지 않는다). 사람들이 두려워하고,
     믿게 된 이들이 마술책을 가져와 가운데에 쌓아 불사른다(bookfire). 책값은 은돈 무더기(silverheap)로 */
  a23: {
    env: 'day',
    at: EPH,
    wide: 1.45,
    props: {
      home: ['house', 1.55, -0.5, { stair: false, wall: '#d2bc98' }],
      mat: ['cloaks', -1.55, 0.32, { n: 2 }],
      fog: ['haze', 1.3, 0.05, { w: 0.4, d: 0.3, on: 'wild' }],
      fire: ['bookfire', 0.15, 0.32],
      coins: ['silverheap', 0.62, 0.62],
    },
    cast: {
      paul: ['paulS', -0.75, -0.2, -0.8],
      sick: ['man', -1.6, 0.3, 0, { pose: 'sleep', gaze: false }],
      bearer: ['woman', -0.95, 0.05, -1.0],
      wild: ['wild', 1.35, -0.05, -1.0],
      e1: ['jewD', -0.2, -0.1, 1.2],
      e2: ['hellenist', -0.35, 0.15, 1.2, { gaze: false }],
      e3: ['jewD', -0.45, -0.3, 1.2, { gaze: false }],
      b1: ['ephesian', -2.0, 0.55, 1.2, { gaze: false }],
      b2: ['greekW', 2.0, 0.6, -1.2, { gaze: false }],
      b3: ['greek2', -2.05, 0.25, 1.2, { gaze: false }],
      b4: ['greek', 2.05, 0.3, -1.2, { gaze: false }],
    },
    beats: {
      enter: [['fire', 'burn', { show: 1 }], ['coins', null, { show: 1 }], ['fog', 'off'], ['wild', 'idle', { show: 0 }], ['e1', 'idle', { show: 0 }], ['e2', 'idle', { show: 0 }], ['e3', 'idle', { show: 0 }],
        ['sick', 'idle', { x: -1.25, z: 0.45, look: 1.2 }], ['bearer', 'idle', { x: -1.0, z: 0.62, look: 1.2 }], ['paul', 'raise', { x: -0.45, z: 0.1, look: 0.8 }],
        ['b1', 'raise', { x: -0.3, z: 0.55, look: 1.0 }], ['b2', 'idle', { x: 0.65, z: 0.2, look: -1.4 }], ['b3', 'look-up', { x: -0.05, z: 0.75, look: 0.6 }], ['b4', 'kneel', { x: 0.88, z: 0.6, look: -1.4 }]],
      // 바울의 손으로 하신 놀라운 일 — 병자가 깔개에 누워 있다
      intro: [['@env', 'day'], ['fire', 'idle', { show: 0 }], ['coins', null, { show: 0 }], ['fog', 'off'], ['wild', 'idle', { show: 0 }], ['e1', 'idle', { show: 0 }], ['e2', 'idle', { show: 0 }], ['e3', 'idle', { show: 0 }],
        ['b1', 'idle', { show: 0 }], ['b2', 'idle', { show: 0 }], ['b3', 'idle', { show: 0 }], ['b4', 'idle', { show: 0 }], ['paul', 'bless', { to: 'bearer' }]],
      // 바울이 몸에 대던 수건을 병자에게 가져다 댄다 — 일어난다
      'p0.1': [['paul', 'idle'], ['bearer', 'idle', { item: 'cloak' }], ['bearer', 'idle', { x: -1.25, z: 0.55, delay: 600 }], ['bearer', 'bow', { look: -1.2, delay: 2400 }],
        ['sick', 'sit-ground', { look: 0.6, delay: 3600 }], ['sick', 'idle', { x: -1.25, z: 0.45, look: 1.2, delay: 5200 }], ['bearer', 'idle', { item: null, look: 1.2, delay: 5200 }]],
      // 떠돌며 귀신을 쫓던 유대인들이 흉내 낸다 — 오른쪽 집으로
      'p0.2': [['sick', 'idle', { x: -1.25, z: 0.45, look: 1.2 }], ['bearer', 'idle', { item: null, x: -1.0, z: 0.62, look: 1.2 }],
        ['e1', 'idle', { show: 1, x: 0.75, z: 0.0 }], ['e2', 'idle', { show: 1, x: 0.6, z: 0.28, delay: 300 }], ['e3', 'idle', { show: 1, x: 0.55, z: -0.25, delay: 500 }]],
      'p0.3': [['e1', 'idle', { show: 1, x: 0.75, z: 0.0, look: 1.2 }], ['e2', 'idle', { show: 1, x: 0.6, z: 0.28, look: 1.2 }], ['e3', 'idle', { show: 1, x: 0.55, z: -0.25, look: 1.2 }],
        ['wild', 'idle', { show: 1, look: -1.0 }], ['fog', 'on']],
      'p0.4': [['e1', 'rebuke', { look: 1.2 }]],
      'p0.5': [['e2', 'rebuke', { look: 1.2 }], ['e3', 'point', { look: 1.3, delay: 500 }]],
      // 악한 영이 대답한다 — 그 사람의 입으로
      'p1.0': [['e1', 'idle'], ['e2', 'idle'], ['e3', 'idle'], ['wild', 'speak', { to: 'e1' }]],
      'p1.2': [['wild', 'rebuke', { look: -1.1 }], ['e1', 'afraid'], ['e2', 'afraid', { delay: 300 }]],
      // 달려들어 눌러 이긴다 — 그들은 놀라 뒷걸음질 친다
      'p1.3': [['wild', 'rebuke', { x: 0.95, z: 0.05 }], ['e1', 'afraid', { x: 0.45, z: 0.05 }], ['e2', 'afraid', { x: 0.3, z: 0.35 }], ['e3', 'cower', { x: 0.3, z: -0.2 }]],
      // 그 집에서 달아난다 — 왼쪽 앞으로 달려 나가 사라진다
      'p1.4': [['wild', 'idle', { x: 1.2, z: -0.05, look: -1.0 }], ['e1', 'idle', { x: -0.6, z: 0.85 }], ['e2', 'idle', { x: -0.8, z: 0.95, delay: 200 }], ['e3', 'idle', { x: -0.9, z: 0.75, delay: 400 }],
        ['e1', 'idle', { show: 0, delay: 1800 }], ['e2', 'idle', { show: 0, delay: 2000 }], ['e3', 'idle', { show: 0, delay: 2200 }]],
      // 온 에베소가 두려워하고 주 예수의 이름이 높아진다
      'p1.5': [['e1', 'idle', { show: 0 }], ['e2', 'idle', { show: 0 }], ['e3', 'idle', { show: 0 }], ['wild', 'idle', { show: 0, delay: 1500 }], ['fog', 'off', { delay: 1500 }],
        ['b1', 'afraid', { show: 1, x: -0.35, z: 0.55, look: 1.0 }], ['b2', 'afraid', { show: 1, x: 0.85, z: 0.25, look: 1.0, delay: 400 }],
        ['b3', 'idle', { show: 1, x: -0.15, z: 0.82, look: 0.8, delay: 800 }], ['b4', 'idle', { show: 1, x: 1.0, z: 0.62, look: -1.4, delay: 1000 }],
        ['sick', 'look-up', { delay: 3500 }], ['b3', 'look-up', { delay: 4000 }]],
      // 믿게 된 사람들이 찾아와 털어놓는다 — 바울 앞에 무릎 꿇는다
      'p2.0': [['wild', 'idle', { show: 0 }], ['fog', 'off'], ['paul', 'idle', { x: -0.45, z: 0.1, look: 0.8 }],
        ['b1', 'kneel', { x: -0.1, z: 0.3, look: -1.2 }], ['b2', 'kneel', { x: 0.6, z: 0.15, look: -1.4, delay: 300 }], ['b3', 'kneel', { x: 0.05, z: 0.7, look: -1.0, delay: 500 }], ['b4', 'kneel', { x: 0.88, z: 0.6, look: -1.4, delay: 700 }],
        ['paul', 'bless', { delay: 2500 }]],
      // 마술책을 가져와 모든 사람 앞에서 불사른다
      'p2.1': [['paul', 'idle', { x: -0.45, z: 0.1, look: 0.8 }], ['b1', 'idle', { item: 'scroll', x: -0.15, z: 0.4, look: 1 }], ['b2', 'idle', { item: 'scroll', x: 0.48, z: 0.25, look: -1.2 }],
        ['b3', 'idle', { item: 'scroll', x: 0.05, z: 0.68, look: 0.5 }], ['b4', 'idle', { item: 'scroll', x: 0.6, z: 0.45, look: -1.3 }],
        ['fire', null, { show: 0.4, delay: 1400 }], ['b1', 'idle', { item: null, delay: 1400 }], ['b2', 'idle', { item: null, delay: 2000 }], ['fire', null, { show: 0.7, delay: 2000 }],
        ['b3', 'idle', { item: null, delay: 2600 }], ['b4', 'idle', { item: null, delay: 3000 }], ['fire', null, { show: 1, delay: 3000 }], ['fire', 'burn', { delay: 4200 }],
        ['b1', 'idle', { x: -0.3, z: 0.55, delay: 3600 }], ['b2', 'idle', { x: 0.65, z: 0.2, delay: 3800 }], ['b3', 'idle', { x: -0.05, z: 0.75, delay: 3800 }], ['b4', 'idle', { x: 0.88, z: 0.6, delay: 3800 }]],
      // 책값은 은돈 오만 닢 — 은돈이 하나씩 쌓인다
      'p2.2': [['fire', 'burn', { show: 1 }], ['b1', 'idle', { item: null, x: -0.3, z: 0.55, look: 1.0 }], ['b2', 'idle', { item: null, x: 0.65, z: 0.2, look: -1.4 }], ['b3', 'idle', { item: null, x: -0.05, z: 0.75, look: 0.6 }],
        ['b4', 'kneel', { item: null, x: 0.88, z: 0.6, look: -1.4 }], ['coins', null, { show: 1, delay: 800 }], ['b2', 'point', { look: -0.6, delay: 1200 }]],
      // 주님의 말씀이 힘 있게 자라 퍼진다 — 연기가 하늘로 오르고 모두 손을 든다
      'p2.3': [['fire', 'burn'], ['coins', null, { show: 1 }], ['paul', 'raise'], ['b1', 'raise', { delay: 400 }], ['b3', 'look-up', { delay: 600 }], ['b2', 'idle', { look: -1.4 }],
        ['sick', 'raise', { delay: 900 }], ['bearer', 'look-up', { delay: 1200 }]],
      w0: [['fire', 'idle', { show: 0 }], ['coins', null, { show: 0 }], ['b1', 'idle', { show: 0 }], ['b2', 'idle', { show: 0 }], ['b3', 'idle', { show: 0 }], ['b4', 'idle', { show: 0 }],
        ['wild', 'idle', { show: 1, x: 1.35, z: -0.05, look: -1.0 }], ['fog', 'on'], ['e1', 'rebuke', { show: 1, x: 0.75, z: 0.0, look: 1.2 }], ['e2', 'rebuke', { show: 1, x: 0.6, z: 0.28, look: 1.2 }], ['e3', 'point', { show: 1, x: 0.55, z: -0.25, look: 1.3 }]],
      w1: [['e1', 'afraid'], ['e2', 'afraid'], ['e3', 'idle'], ['wild', 'speak', { to: 'e1' }]],
      w2: [['wild', 'idle', { show: 0 }], ['fog', 'off'], ['e1', 'idle', { show: 0 }], ['e2', 'idle', { show: 0 }], ['e3', 'idle', { show: 0 }], ['fire', 'burn', { show: 1 }], ['coins', null, { show: 1 }],
        ['paul', 'raise', { x: -0.45, z: 0.1, look: 0.8 }], ['b1', 'raise', { show: 1, x: -0.3, z: 0.55, look: 1.0 }], ['b2', 'idle', { show: 1, x: 0.65, z: 0.2, look: -1.4 }],
        ['b3', 'look-up', { show: 1, x: -0.05, z: 0.75, look: 0.6 }], ['b4', 'kneel', { show: 1, x: 0.88, z: 0.6, look: -1.4 }]],
      end: [['fire', 'burn', { show: 1 }], ['coins', null, { show: 1 }], ['fog', 'off'], ['wild', 'idle', { show: 0 }], ['e1', 'idle', { show: 0 }], ['e2', 'idle', { show: 0 }], ['e3', 'idle', { show: 0 }],
        ['sick', 'raise', { x: -1.25, z: 0.45, look: 1.2 }], ['bearer', 'look-up', { item: null, x: -1.0, z: 0.62, look: 1.2 }], ['paul', 'raise', { x: -0.45, z: 0.1, look: 0.8 }],
        ['b1', 'raise', { show: 1, item: null, x: -0.3, z: 0.55, look: 1.0 }], ['b2', 'idle', { show: 1, item: null, x: 0.65, z: 0.2, look: -1.4 }],
        ['b3', 'look-up', { show: 1, item: null, x: -0.05, z: 0.75, look: 0.6 }], ['b4', 'kneel', { show: 1, item: null, x: 0.88, z: 0.6, look: -1.4 }]],
    },
  },

  /* a24. 크다, 에베소의 아데미여 — 가운데 뒤에 큰 극장(theater: 앞으로 열린 말굽꼴 계단석). 왼쪽 앞은 데메드리오의 공방(은 신전 모형 좌판 shrines),
     오른쪽 앞은 바울과 제자들. 장인들이 외치고, 극장이 무리로 차서 들끓는다(roar). 가이오와 아리스다고가 극장 마당으로 끌려가고,
     바울이 가려 하자 제자들과 아시아 관리의 사람이 막아선다. 서기장이 마당에 서서 손을 들자 극장이 가라앉고, 무리가 흩어진다 */
  a24: {
    env: 'day',
    at: EPH,
    wide: 1.5,
    props: {
      theater: ['theater', 0.05, -0.65, { r: 1.5, hs: 0.11, state: 'empty' }],
      shrines: ['shrines', -1.62, 0.52],
    },
    cast: {
      paul: ['paulS', 1.8, 0.45, -1.3],
      d1: ['disciple', 1.5, 0.25, 1.2],
      d2: ['greek', 2.1, 0.6, -1.2],
      dem: ['demetrius', -1.62, 0.3, 0.2],
      c1: ['ephesian', -2.15, 0.3, 1.2, { gaze: false }],
      c2: ['greek2', -2.2, 0.62, 1.2, { gaze: false }],
      c3: ['ephesian', -2.1, 0.85, 1.2, { gaze: false }],
      gaius: ['greek', 0.75, 0.62, 1.3],
      aris: ['silas', 0.55, 0.78, 1.3, { gaze: false }],
      asiarch: ['magistrate', 2.6, 0.15, -1.3, { gaze: false }],
      clerk: ['governor', 0.05, -0.52, 0, { gaze: false }],
    },
    beats: {
      enter: [['theater', 'roar'], ['clerk', 'raise', { show: 1 }], ['gaius', 'afraid', { x: -0.25, z: -0.38, look: 0.6 }], ['aris', 'afraid', { x: 0.35, z: -0.4, look: -0.6 }],
        ['c1', 'rebuke', { x: -0.6, z: 0.02, look: 0.6 }], ['c2', 'raise', { x: -0.85, z: 0.38, look: 0.8 }], ['c3', 'rebuke', { x: 0.6, z: 0.08, look: -0.8 }], ['dem', 'rebuke', { x: -1.2, z: 0.25, look: 1.0 }],
        ['paul', 'idle', { x: 1.5, z: 0.45, look: -1.3 }], ['d1', 'raise', { x: 1.17, z: 0.38, look: 1.3 }], ['d2', 'idle', { x: 1.35, z: 0.75, look: -0.6 }], ['asiarch', 'speak', { x: 1.85, z: 0.3, look: -1.3, to: 'paul' }]],
      // 바울이 예루살렘과 로마로 갈 뜻을 세운다
      intro: [['@env', 'day'], ['theater', 'empty'], ['clerk', 'idle', { show: 0 }], ['asiarch', 'idle', { show: 0 }], ['c1', 'idle', { show: 0 }], ['c2', 'idle', { show: 0 }], ['c3', 'idle', { show: 0 }],
        ['paul', 'speak', { to: 'd1' }]],
      'p0.2': [['paul', 'point', { look: -1.4 }], ['d1', 'listen'], ['d2', 'listen']],
      // 은장색 데메드리오의 신전 모형 — 큰 벌이
      'p0.3': [['paul', 'idle', { look: -1.3 }], ['dem', 'idle', { look: 0.2 }]],
      // 장인들을 모아 말한다
      'p0.4': [['c1', 'idle', { show: 1, x: -1.25, z: 0.2, look: -1.4 }], ['c2', 'idle', { show: 1, x: -1.2, z: 0.62, look: -1.4, delay: 300 }], ['c3', 'idle', { show: 1, x: -1.45, z: 0.85, look: -0.6, delay: 500 }],
        ['dem', 'speak', { to: 'c1', delay: 2000 }]],
      'p0.5': [['dem', 'rebuke', { look: 1.0 }], ['dem', 'speak', { to: 'c2', delay: 3500 }]],
      // 장인들이 화가 나서 외친다
      'p1.0': [['dem', 'rebuke', { look: 0.8 }], ['c1', 'rebuke', { look: -1.2 }], ['c2', 'raise', { look: -1.0, delay: 300 }], ['c3', 'rebuke', { look: -0.4, delay: 500 }]],
      'p1.1': [['c1', 'raise'], ['c3', 'raise'], ['dem', 'raise']],
      // 온 성이 들끓는다 — 극장이 무리로 찬다
      'p1.2': [['theater', 'calm'], ['theater', 'roar', { delay: 3000 }], ['gaius', 'afraid', { look: -1.2 }], ['aris', 'afraid', { look: -1.0 }]],
      // 가이오와 아리스다고를 붙잡아 극장으로
      'p1.3': [['theater', 'roar'], ['c1', 'idle', { x: 0.42, z: 0.62 }], ['c3', 'idle', { x: 0.25, z: 0.85, delay: 300 }], ['c1', 'rebuke', { look: 1.3, delay: 2600 }],
        ['gaius', 'idle', { x: -0.25, z: -0.38, delay: 3400 }], ['aris', 'idle', { x: 0.35, z: -0.4, delay: 3600 }], ['c1', 'idle', { x: -0.6, z: 0.02, delay: 3500 }], ['c3', 'idle', { x: 0.6, z: 0.08, delay: 3700 }],
        ['gaius', 'afraid', { look: 0.6, delay: 7500 }], ['aris', 'afraid', { look: -0.6, delay: 7700 }], ['c1', 'rebuke', { look: 0.6, delay: 7000 }], ['c3', 'rebuke', { look: -0.8, delay: 7400 }],
        ['dem', 'rebuke', { x: -1.2, z: 0.25, look: 1.0, delay: 1500 }], ['c2', 'raise', { x: -0.85, z: 0.38, look: 0.8, delay: 1800 }]],
      // 바울이 무리 앞에 나서려 하자 제자들이 막아선다
      'p1.4': [['gaius', 'afraid', { x: -0.25, z: -0.38, look: 0.6 }], ['aris', 'afraid', { x: 0.35, z: -0.4, look: -0.6 }], ['c1', 'rebuke', { x: -0.6, z: 0.02, look: 0.6 }], ['c3', 'rebuke', { x: 0.6, z: 0.08, look: -0.8 }],
        ['paul', 'idle', { x: 1.5, z: 0.45, look: -1.3 }], ['d1', 'raise', { x: 1.17, z: 0.38, look: 1.3, delay: 600 }], ['d2', 'shrug', { x: 1.25, z: 0.7, look: 1.0, delay: 900 }]],
      // 아시아의 관리들이 사람을 보내 말린다
      'p1.5': [['asiarch', 'idle', { show: 1, x: 1.9, z: 0.25, look: -1.3 }], ['asiarch', 'speak', { to: 'paul', delay: 2200 }], ['paul', 'listen', { look: 1.2, delay: 2200 }], ['d1', 'idle', { look: 1.2 }]],
      // 왜 모였는지도 모른다 — 두 시간이나 같은 말을 외친다
      'p2.0': [['asiarch', 'idle', { show: 1, x: 1.9, z: 0.25, look: -1.3 }], ['theater', 'roar'], ['c2', 'shrug', { look: 1.6 }], ['c3', 'shrug', { look: -1.6, delay: 500 }], ['paul', 'idle', { look: -1.3 }]],
      'p2.1': [['theater', 'roar'], ['c1', 'raise'], ['c2', 'raise'], ['c3', 'rebuke'], ['dem', 'raise']],
      // 서기장이 마당에 서서 손을 들자 가라앉는다
      'p2.2': [['clerk', 'idle', { show: 1, x: 0.05, z: -0.52, look: 0 }], ['clerk', 'raise', { delay: 1200 }], ['theater', 'calm', { delay: 1800 }],
        ['c1', 'idle', { look: -0.2, delay: 2000 }], ['c2', 'idle', { look: 0.4, delay: 2200 }], ['c3', 'idle', { look: -0.4, delay: 2300 }], ['dem', 'idle', { look: 1.2, delay: 2400 }]],
      'p2.3': [['theater', 'calm'], ['clerk', 'speak', { to: 'c1' }], ['gaius', 'idle', { look: 0.8 }], ['aris', 'idle', { look: -0.8 }]],
      'p2.4': [['clerk', 'speak', { to: 'dem' }]],
      'p2.5': [['clerk', 'speak', { to: 'c3' }]],
      // 모임을 흩어 보낸다 — 극장이 비고, 가이오와 아리스다고는 바울에게로
      'p2.6': [['clerk', 'idle'], ['theater', 'empty'], ['c1', 'idle', { x: -2.0, z: 0.4 }], ['c2', 'idle', { x: -2.1, z: 0.65, delay: 300 }], ['c3', 'idle', { x: -2.0, z: 0.9, delay: 500 }],
        ['c1', 'idle', { show: 0, delay: 3800 }], ['c2', 'idle', { show: 0, delay: 4000 }], ['c3', 'idle', { show: 0, delay: 4300 }], ['dem', 'idle', { x: -1.62, z: 0.3, look: 0.2, delay: 1000 }],
        ['gaius', 'idle', { x: 1.2, z: 0.55, delay: 1500 }], ['aris', 'idle', { x: 1.1, z: 0.8, delay: 1800 }], ['clerk', 'idle', { show: 0, delay: 3500 }],
        ['asiarch', 'idle', { x: 2.6, z: 0.15, delay: 800 }], ['asiarch', 'idle', { show: 0, delay: 2800 }], ['paul', 'bless', { look: -1.3, delay: 4800 }]],
      w0: [['theater', 'empty'], ['clerk', 'idle', { show: 0 }], ['asiarch', 'idle', { show: 0 }], ['c1', 'idle', { show: 0 }], ['c2', 'idle', { show: 0 }], ['c3', 'idle', { show: 0 }],
        ['paul', 'speak', { x: 1.8, z: 0.45, look: -1.3, to: 'd1' }], ['d1', 'listen', { x: 1.5, z: 0.25, look: 1.2 }], ['d2', 'listen', { x: 2.1, z: 0.6, look: -1.2 }],
        ['gaius', 'idle', { x: 0.75, z: 0.62, look: 1.3 }], ['aris', 'idle', { x: 0.55, z: 0.78, look: 1.3 }], ['dem', 'idle', { x: -1.62, z: 0.3, look: 0.2 }]],
      w1: [['dem', 'speak', { to: 'c1' }], ['c1', 'listen', { show: 1, x: -1.25, z: 0.2, look: -1.4 }], ['c2', 'listen', { show: 1, x: -1.2, z: 0.62, look: -1.4 }], ['c3', 'idle', { show: 1, x: -1.45, z: 0.85, look: -0.6 }]],
      w2: [['theater', 'roar'], ['dem', 'raise'], ['c1', 'raise'], ['c2', 'raise'], ['c3', 'rebuke']],
      w3: [['theater', 'calm'], ['clerk', 'speak', { show: 1, x: 0.05, z: -0.52, look: 0, to: 'c1' }], ['dem', 'idle'], ['c1', 'idle'], ['c2', 'idle'], ['c3', 'idle']],
      end: [['theater', 'calm'], ['clerk', 'raise', { show: 1, x: 0.05, z: -0.52, look: 0 }], ['asiarch', 'idle', { show: 0 }],
        ['gaius', 'idle', { x: -0.25, z: -0.38, look: 0.6 }], ['aris', 'idle', { x: 0.35, z: -0.4, look: -0.6 }],
        ['c1', 'idle', { show: 1, x: -0.6, z: 0.02, look: 0.6 }], ['c2', 'idle', { show: 1, x: -0.85, z: 0.38, look: 0.8 }], ['c3', 'idle', { show: 1, x: 0.6, z: 0.08, look: -0.8 }], ['dem', 'idle', { x: -1.2, z: 0.25, look: 1.0 }],
        ['paul', 'idle', { x: 1.5, z: 0.45, look: -1.3 }], ['d1', 'idle', { x: 1.17, z: 0.38, look: -1.3 }], ['d2', 'idle', { x: 1.35, z: 0.75, look: -0.6 }]],
    },
  },

  /* a25. 눈물로 쓴 편지 — 마게도냐의 머무는 집(house, 왼쪽 뒤)과 그 앞 낮은 상(scribedesk), 오른쪽으로 길(road).
     에베소의 제자들과 작별하고, 지난날 눈물로 쓴 편지를 떠올리며(상 앞에 엎드림), 길 끝을 바라보며 디도를 기다린다. 밤 — 무릎 꿇어 기도한다.
     디도가 길을 따라 걸어오고, 둘이 끌어안는다. 바울이 다시 편지를 쓰고(질그릇 clayjar 안의 빛 — 고후 4:7), 디도와 형제가 편지를 들고 길을 떠난다 */
  a25: {
    env: 'day',
    wide: 1.45,
    props: {
      home: ['house', -1.35, -0.5, { stair: false }],
      road: ['road', 1.15, 0.12, { len: 2.8, w: 0.42, rot: -0.05 }],
      desk: ['scribedesk', -0.7, 0.45],
      jar: ['clayjar', -0.32, 0.55, { scale: 1.2 }],
    },
    cast: {
      paul: ['paulS', 0.05, 0.25, 1.2],
      e1: ['greek', 0.6, 0.05, -1.2, { gaze: false }],
      e2: ['greekW', 0.75, 0.38, -1.2, { gaze: false }],
      e3: ['disciple', 0.95, 0.15, -1.3, { gaze: false }],
      timothy: ['timothy', -1.15, 0.1, 0.8],
      titus: ['titus', 2.4, 0.15, -1.3],
      bro: ['greek2', -0.95, -0.1, 0.8, { gaze: false }],
      foe1: ['jewD', 2.3, -0.55, -1.2, { gaze: false }],
      foe2: ['ephesian', 2.4, -0.25, -1.2, { gaze: false }],
    },
    beats: {
      enter: [['desk', 'write'], ['jar', 'glow'], ['e1', 'idle', { show: 0 }], ['e2', 'idle', { show: 0 }], ['e3', 'idle', { show: 0 }], ['foe1', 'idle', { show: 0 }], ['foe2', 'idle', { show: 0 }],
        ['paul', 'sit-ground', { x: -0.7, z: 0.3, look: 0 }], ['titus', 'listen', { x: -0.15, z: 0.25, look: -1.2 }], ['timothy', 'listen', { x: -1.15, z: 0.35, look: 1.0 }]],
      // 소동이 가라앉고 — 바울이 제자들을 격려하고 작별한다
      intro: [['@env', 'day'], ['desk', 'blank'], ['jar', 'idle'], ['titus', 'idle', { show: 0 }], ['bro', 'idle', { show: 0 }], ['timothy', 'idle', { show: 0 }], ['foe1', 'idle', { show: 0 }], ['foe2', 'idle', { show: 0 }],
        ['paul', 'bless', { to: 'e1' }]],
      'p0.0': [['paul', 'bless', { to: 'e1' }], ['e1', 'bow', { delay: 800 }], ['e2', 'mourn', { delay: 1000 }], ['e1', 'idle', { x: 2.0, z: -0.1, delay: 3200 }], ['e2', 'idle', { x: 2.1, z: 0.25, delay: 3400 }],
        ['e3', 'idle', { x: 2.2, z: 0.05, delay: 3600 }], ['e1', 'idle', { show: 0, delay: 6000 }], ['e2', 'idle', { show: 0, delay: 6200 }], ['e3', 'idle', { show: 0, delay: 6400 }]],
      // 큰 괴로움과 많은 눈물로 쓴 편지 — 상 앞에 엎드린다
      'p0.1': [['e1', 'idle', { show: 0 }], ['e2', 'idle', { show: 0 }], ['e3', 'idle', { show: 0 }], ['paul', 'idle', { x: -0.7, z: 0.3 }], ['paul', 'mourn', { look: 0, delay: 1600 }], ['desk', 'done', { delay: 1600 }]],
      // 복음의 문은 열렸지만 마음이 놓이지 않는다 — 길 끝을 바라본다
      'p0.2': [['desk', 'blank'], ['paul', 'idle', { x: 0.35, z: 0.2, look: 1.3 }]],
      'p0.3': [['paul', 'idle', { x: 0.35, z: 0.2, look: 1.4 }], ['paul', 'shrug', { look: 1.3, delay: 2400 }]],
      'p0.4': [['paul', 'idle', { look: 1.0 }]],
      // 쉴 틈이 없다 — 밖으로는 다툼, 안으로는 두려움. 밤에 무릎 꿇어 기도한다
      'p1.0': [['@env', 'dusk'], ['paul', 'idle', { x: -0.55, z: 0.15, look: 0.6 }], ['timothy', 'idle', { show: 1, x: -1.15, z: 0.1, look: 0.8 }]],
      'p1.1': [['@env', 'night'], ['foe1', 'rebuke', { show: 1, x: 1.7, z: -0.45, look: -1.2 }], ['foe2', 'point', { show: 1, x: 1.85, z: -0.15, look: -1.3, delay: 500 }],
        ['paul', 'kneel', { look: 0.3, delay: 1500 }], ['foe1', 'idle', { show: 0, delay: 4500 }], ['foe2', 'idle', { show: 0, delay: 4700 }]],
      // 그때 디도가 왔다 — 동이 트는 길을 따라 걸어온다
      'p1.2': [['@env', 'dawn'], ['foe1', 'idle', { show: 0 }], ['foe2', 'idle', { show: 0 }], ['paul', 'kneel', { x: -0.55, z: 0.15, look: 0.3 }],
        ['titus', 'idle', { show: 1, x: 0.45, z: 0.2 }], ['paul', 'idle', { look: 1.2, delay: 2200 }], ['paul', 'idle', { x: -0.05, z: 0.2, delay: 2800 }]],
      // 고린도 교회의 소식을 전한다
      'p1.3': [['@env', 'day'], ['titus', 'speak', { x: 0.45, z: 0.2, look: -1.2, to: 'paul' }], ['paul', 'listen', { x: -0.05, z: 0.2, look: 1.2 }], ['timothy', 'listen', { x: -0.55, z: 0.42, look: 1.2 }]],
      // 위로하시는 하나님 — 둘이 끌어안는다
      'p1.4': [['titus', 'embrace', { x: 0.28, z: 0.2, look: -1.3 }], ['paul', 'embrace', { x: 0.05, z: 0.2, look: 1.3 }], ['timothy', 'look-up', { delay: 1500 }]],
      // 마게도냐에서 다시 편지를 쓴다
      'p2.0': [['titus', 'idle', { x: -0.15, z: 0.25, look: -1.2 }], ['paul', 'idle', { x: -0.7, z: 0.3 }], ['paul', 'sit-ground', { look: 0, delay: 1600 }], ['desk', 'write', { delay: 2200 }],
        ['timothy', 'listen', { x: -1.15, z: 0.35, look: 1.0 }]],
      // 이 보물을 질그릇에 — 항아리 안에서 빛이 샌다
      'p2.2': [['desk', 'write'], ['paul', 'sit-ground', { x: -0.7, z: 0.3, look: 0 }], ['jar', 'glow', { delay: 1200 }], ['titus', 'listen', { x: -0.15, z: 0.25, look: -1.2 }]],
      'p2.3': [['jar', 'glow'], ['paul', 'look-up']],
      // 디도와 칭찬받는 형제가 편지를 들고 다시 고린도로
      'p2.4': [['desk', 'done'], ['paul', 'idle', { x: -0.55, z: 0.2, look: 1.2 }], ['titus', 'idle', { item: 'scroll', x: 0.05, z: 0.25, look: -1.2, delay: 1200 }],
        ['bro', 'idle', { show: 1, x: 0.25, z: 0.05, look: -1.2, delay: 600 }], ['paul', 'bless', { delay: 2500 }]],
      'p2.5': [['titus', 'idle', { item: 'scroll', x: 2.0, z: 0.15 }], ['bro', 'idle', { show: 1, x: 2.1, z: -0.05, delay: 300 }],
        ['titus', 'idle', { show: 0, delay: 3800 }], ['bro', 'idle', { show: 0, delay: 4000 }], ['paul', 'bless', { look: 1.3 }]],
      // 마게도냐를 다니며 격려하고 헬라로 내려간다
      'p2.6': [['titus', 'idle', { show: 0 }], ['bro', 'idle', { show: 0 }], ['paul', 'idle', { x: 0.6, z: 0.75, delay: 500 }], ['timothy', 'idle', { x: 0.35, z: 0.85, delay: 800 }],
        ['paul', 'idle', { show: 0, delay: 3200 }], ['timothy', 'idle', { show: 0, delay: 3400 }]],
      w0: [['@env', 'day'], ['desk', 'done'], ['jar', 'idle'], ['titus', 'idle', { show: 0 }], ['bro', 'idle', { show: 0 }], ['e1', 'idle', { show: 0 }], ['e2', 'idle', { show: 0 }], ['e3', 'idle', { show: 0 }],
        ['paul', 'mourn', { show: 1, x: -0.7, z: 0.3, look: 0 }], ['timothy', 'idle', { show: 1, x: -1.15, z: 0.1, look: 0.8 }]],
      w1: [['desk', 'blank'], ['titus', 'embrace', { show: 1, x: 0.28, z: 0.2, look: -1.3 }], ['paul', 'embrace', { x: 0.05, z: 0.2, look: 1.3 }]],
      w2: [['titus', 'listen', { x: -0.15, z: 0.25, look: -1.2 }], ['paul', 'sit-ground', { x: -0.7, z: 0.3, look: 0 }], ['desk', 'write'], ['jar', 'glow']],
      w3: [['paul', 'look-up', { x: -0.7, z: 0.3 }], ['jar', 'glow'], ['desk', 'done']],
      end: [['@env', 'day'], ['desk', 'write'], ['jar', 'glow'], ['e1', 'idle', { show: 0 }], ['e2', 'idle', { show: 0 }], ['e3', 'idle', { show: 0 }], ['foe1', 'idle', { show: 0 }], ['foe2', 'idle', { show: 0 }], ['bro', 'idle', { show: 0 }],
        ['paul', 'sit-ground', { show: 1, item: null, x: -0.7, z: 0.3, look: 0 }], ['titus', 'listen', { show: 1, item: null, x: -0.15, z: 0.25, look: -1.2 }], ['timothy', 'listen', { show: 1, x: -1.15, z: 0.35, look: 1.0 }]],
    },
  },

  /* a26. 겨울의 고린도에서 쓴 긴 편지 — 가이오의 집 안(housechurch, 등잔), 겨울 저녁. 바울이 오면 가이오가 맞아들이고, 교회가 모여 앉는다.
     바울은 서서 말하고 더디오가 낮은 상(scribedesk)에서 받아 적는다(글줄이 차오른다). 서쪽(왼쪽 — 로마·서바나)을 가리키고, 예루살렘에 가져갈 헌금 자루(silverheap bags).
     함께 기도해 달라 — 모두 무릎 꿇는다. 다 쓴 편지를 뵈뵈에게 건넨다. 음모 — 문 밖의 사람들이 수군대고, 바울은 마게도냐 쪽(뒤)으로 길을 돌린다 */
  a26: {
    env: 'dusk',
    wide: 1.4,
    props: {
      room: ['housechurch', 0, -0.15, { table: false, lamps: [[-0.95, -0.6], [0.95, -0.6]] }],
      desk: ['scribedesk', 0.35, 0.3],
      bags: ['silverheap', 0.85, -0.42, { kind: 'bags' }],
    },
    cast: {
      paul: ['paulS', -0.3, 0.2, 0.9],
      tertius: ['tertius', 0.35, 0.12, 0, { pose: 'sit-ground' }],
      gaius: ['greek2', -0.85, -0.2, 0.9],
      timothy: ['timothy', -0.45, -0.5, 0.5, { pose: 'sit-ground' }],
      w1: ['greekW', 0.65, -0.55, -0.6, { pose: 'sit-ground', gaze: false }],
      g1: ['greek', -0.1, -0.6, 0.2, { pose: 'sit-ground', gaze: false }],
      phoebe: ['phoebe', 2.1, 0.45, -1.3],
      plot1: ['jewD', 2.0, -0.6, -1.2, { gaze: false }],
      plot2: ['hellenist', 2.15, -0.35, -1.6, { gaze: false }],
    },
    beats: {
      enter: [['desk', 'write'], ['bags', null, { show: 1 }], ['phoebe', 'idle', { show: 0 }], ['plot1', 'idle', { show: 0 }], ['plot2', 'idle', { show: 0 }], ['paul', 'speak', { to: 'tertius' }]],
      // 헬라에서 석 달 — 바울이 고린도의 가이오 집에 이른다
      intro: [['@env', 'dusk'], ['desk', 'blank'], ['bags', null, { show: 0 }], ['phoebe', 'idle', { show: 0 }], ['plot1', 'idle', { show: 0 }], ['plot2', 'idle', { show: 0 }],
        ['tertius', 'sit-ground', { show: 0 }], ['timothy', 'sit-ground', { show: 0 }], ['w1', 'sit-ground', { show: 0 }], ['g1', 'sit-ground', { show: 0 }], ['paul', 'idle', { x: -1.9, z: 0.45, look: 1.2 }]],
      'p0.0': [['paul', 'idle', { x: -0.55, z: 0.32 }]],
      'p0.1': [['paul', 'idle', { x: -0.55, z: 0.32, look: 0.4 }]],
      // 가이오가 맞아들이고 온 교회를 돌본다
      'p0.2': [['gaius', 'embrace', { x: -0.78, z: 0.2, look: 1.2 }], ['paul', 'embrace', { x: -0.55, z: 0.32, look: -1.2 }],
        ['timothy', 'sit-ground', { show: 1, delay: 1500 }], ['w1', 'sit-ground', { show: 1, delay: 1900 }], ['g1', 'sit-ground', { show: 1, delay: 2300 }], ['gaius', 'idle', { x: -0.85, z: -0.2, look: 0.9, delay: 3500 }]],
      // 로마의 성도들에게 긴 편지 — 더디오가 받아 적는다
      'p0.3': [['gaius', 'idle', { x: -0.85, z: -0.2, look: 0.9 }], ['tertius', 'sit-ground', { show: 1 }], ['paul', 'idle', { x: -0.3, z: 0.2 }], ['paul', 'speak', { to: 'tertius', delay: 1200 }], ['desk', 'write', { delay: 2000 }]],
      'p0.4': [['desk', 'write'], ['tertius', 'sit-ground'], ['paul', 'speak', { to: 'tertius' }]],
      // 로마로 가는 길이 번번이 막혔다 — 서쪽(왼쪽)을 가리킨다
      'p1.0': [['paul', 'point', { look: -1.3 }]],
      // 마게도냐와 아가야 성도들이 모은 헌금 — 자루가 놓인다
      'p1.1': [['paul', 'speak', { to: 'gaius' }], ['bags', null, { show: 1, delay: 600 }], ['gaius', 'point', { look: 1.2, delay: 1500 }]],
      // 로마를 거쳐 서쪽 끝 서바나까지
      'p1.2': [['gaius', 'idle'], ['paul', 'point', { look: -1.4 }]],
      // 복음은 믿는 모든 사람을 구원하는 하나님의 능력
      'p1.3': [['paul', 'raise', { look: 0.2 }], ['timothy', 'look-up', { delay: 600 }]],
      // 함께 기도해 달라 — 모두 무릎 꿇는다
      'p2.0': [['paul', 'speak', { to: 'gaius' }], ['timothy', 'sit-ground']],
      'p2.1': [['paul', 'kneel', { look: 0.3 }], ['gaius', 'kneel', { delay: 400 }], ['tertius', 'pray', { delay: 600 }], ['timothy', 'pray', { delay: 800 }], ['w1', 'pray', { delay: 900 }], ['g1', 'pray', { delay: 1000 }]],
      // 겐그레아 교회의 일꾼 뵈뵈 — 다 쓴 편지를 받는다
      'p2.2': [['desk', 'done'], ['paul', 'idle', { look: 1.2 }], ['gaius', 'idle'], ['tertius', 'sit-ground'], ['timothy', 'sit-ground'], ['w1', 'sit-ground'], ['g1', 'sit-ground'],
        ['phoebe', 'idle', { show: 1, x: 0.95, z: 0.42 }], ['paul', 'idle', { item: 'scroll', x: 0.05, z: 0.38, look: 1.2, delay: 1500 }], ['paul', 'speak', { to: 'phoebe', delay: 4500 }]],
      'p2.3': [['paul', 'idle', { item: null, x: 0.05, z: 0.38, look: 1.2 }], ['phoebe', 'idle', { item: 'scroll', x: 0.95, z: 0.42, look: -1.3 }], ['phoebe', 'bow', { delay: 1200 }],
        ['phoebe', 'idle', { x: 2.1, z: 0.55, delay: 2800 }], ['phoebe', 'idle', { show: 0, delay: 6000 }]],
      // 수리아로 배를 타려 할 때 음모 — 문 밖에서 수군대고, 바울은 마게도냐 쪽으로 길을 돌린다
      'p2.4': [['@env', 'night'], ['phoebe', 'idle', { show: 0 }], ['plot1', 'speak', { show: 1, x: 1.65, z: -0.5, look: 1.2, to: 'plot2' }], ['plot2', 'listen', { show: 1, x: 1.85, z: -0.3, look: -1.6 }],
        ['gaius', 'idle', { x: -0.3, z: 0.45, look: 1.2, delay: 2000 }], ['gaius', 'speak', { to: 'paul', delay: 3200 }], ['paul', 'listen', { delay: 3200 }],
        ['paul', 'idle', { x: -1.85, z: 0.35, delay: 6000 }], ['timothy', 'idle', { x: -1.95, z: 0.6, delay: 6300 }], ['paul', 'idle', { show: 0, delay: 9500 }], ['timothy', 'idle', { show: 0, delay: 9800 }]],
      w0: [['@env', 'dusk'], ['desk', 'write'], ['phoebe', 'idle', { show: 0 }], ['plot1', 'idle', { show: 0 }], ['plot2', 'idle', { show: 0 }], ['paul', 'speak', { show: 1, item: null, x: -0.3, z: 0.2, look: 0.9, to: 'tertius' }],
        ['tertius', 'sit-ground', { show: 1 }], ['gaius', 'idle', { x: -0.85, z: -0.2, look: 0.9 }], ['timothy', 'sit-ground', { show: 1, x: -0.45, z: -0.5 }], ['w1', 'sit-ground', { show: 1 }], ['g1', 'sit-ground', { show: 1 }]],
      w1: [['paul', 'raise', { look: 0.2 }], ['desk', 'write']],
      w2: [['paul', 'point', { look: -1.4 }]],
      w3: [['paul', 'idle', { look: 0.9 }], ['tertius', 'sit-speak', { look: 0 }], ['desk', 'done']],
      end: [['@env', 'dusk'], ['desk', 'done'], ['bags', null, { show: 1 }], ['phoebe', 'idle', { show: 1, item: 'scroll', x: 0.95, z: 0.42, look: -1.3 }], ['plot1', 'idle', { show: 0 }], ['plot2', 'idle', { show: 0 }],
        ['paul', 'idle', { show: 1, item: null, x: 0.05, z: 0.38, look: 1.2 }], ['tertius', 'sit-ground', { show: 1 }], ['gaius', 'idle', { x: -0.85, z: -0.2, look: 0.9 }],
        ['timothy', 'sit-ground', { show: 1, x: -0.45, z: -0.5 }], ['w1', 'sit-ground', { show: 1 }], ['g1', 'sit-ground', { show: 1 }]],
    },
  },

  /* a27. 창에서 떨어진 유두고 — 드로아의 삼층 다락방(upperroom3: 앞이 트인 셋째 층 방, 등잔 여럿, 오른벽의 창턱). 밤, 바울이 서서 떡을 떼고 오래 말한다.
     유두고는 창턱에 걸터앉아 있다가 졸며 기울고(sleep — 창턱 위에 몸을 누인다), 창 밖으로 미끄러져 사라진다 — 떨어지는 모습·다친 모습은 그리지 않는다.
     사람들이 내려가 보니 창 아래 땅에 고요히 누워 있다. 바울이 내려와 엎드려 끌어안고, '살아 있습니다' — 청년이 일어나 앉고 선다.
     바울은 다시 올라가 떡을 떼고, 새벽빛에 길을 떠난다. 사람들은 청년을 데리고 집으로 */
  a27: {
    env: 'night',
    wide: 1.35,
    props: {
      room: ['upperroom3', RX, RZ, { state: 'lit' }],
    },
    cast: {
      paul: ['paulS', -0.5, -0.28, 0.7],
      eut: ['eutychus', SX, SZ, -1.2, { y: SY, pose: 'sit', gaze: false }],
      eutL: ['eutychus', SX + 0.4, SZ + 0.38, 1.4, { pose: 'sleep', gaze: false }],
      luke: ['luke', -0.15, -0.5, -0.5, { pose: 'sit-ground' }],
      timothy: ['timothy', 0.2, -0.32, -1.0, { pose: 'sit-ground' }],
      w1: ['greekW', 0.32, -0.56, -1.2, { pose: 'sit-ground', gaze: false }],
      g1: ['greek', -0.2, -0.15, -0.9, { pose: 'sit-ground', gaze: false }],
      host: ['greek2', -0.7, -0.52, 0.8, { pose: 'sit-ground', gaze: false }],
    },
    beats: {
      enter: [['eut', 'sit', { show: 0 }], ['eutL', 'idle', { show: 1, x: SX + 0.35, z: SZ + 0.4, look: -1.2 }], ['paul', 'embrace', { x: SX + 0.08, z: SZ + 0.42, look: 1.2 }],
        ['luke', 'look-up', { x: SX + 0.6, z: SZ + 0.55, look: -1.3 }], ['g1', 'raise', { x: SX + 0.75, z: SZ + 0.2, look: -1.4 }], ['w1', 'pray', { x: SX + 0.25, z: SZ + 0.75, look: 0.3 }]],
      // 주간의 첫날 밤 — 등불 많은 윗다락에 모여 떡을 뗀다
      intro: [['@env', 'night'], ['room', 'lit'], ['eutL', 'sleep', { show: 0 }], ['paul', 'speak', { to: 'timothy' }]],
      'p0.1': [['paul', 'break', { item: 'bread' }], ['paul', 'speak', { item: null, to: 'g1', delay: 4500 }]],
      // 이튿날 떠날 참이라 말을 길게 — 한밤중까지
      'p0.2': [['paul', 'speak', { item: null, to: 'luke' }], ['paul', 'speak', { to: 'eut', delay: 4000 }]],
      'p0.3': [['room', 'lit'], ['paul', 'raise', { look: 0.4 }], ['paul', 'speak', { to: 'timothy', delay: 2500 }]],
      // 유두고가 창턱에 걸터앉아 깊이 존다 — 몸이 기운다
      'p1.0': [['eut', 'sit', { look: -1.6 }], ['eut', 'sleep', { look: 1.4, delay: 2600 }]],
      // 잠에 빠져 삼층에서 아래로 — 창 밖으로 미끄러져 사라진다 (떨어지는 모습은 그리지 않는다)
      'p1.1': [['eut', 'sleep', { look: 1.4 }], ['eut', 'sleep', { x: SX + 0.16, delay: 1500 }], ['eut', 'sleep', { show: 0, delay: 1900 }], ['eutL', 'sleep', { show: 1, delay: 3200 }],
        ['paul', 'afraid', { look: 1.0, delay: 2200 }], ['timothy', 'afraid', { delay: 2300 }], ['g1', 'afraid', { delay: 2400 }], ['w1', 'afraid', { delay: 2500 }], ['luke', 'afraid', { delay: 2600 }]],
      // 사람들이 내려가 일으켜 보니 — 숨이 끊어져 있다 (창 아래 땅에 고요히 누운 모습)
      'p1.2': [['eut', 'sleep', { show: 0 }], ['eutL', 'sleep', { show: 1 }], ['luke', 'idle', { show: 0 }], ['g1', 'idle', { show: 0, delay: 300 }],
        ['luke', 'idle', { x: SX + 0.65, z: SZ + 0.55, delay: 900 }], ['g1', 'idle', { x: SX + 0.75, z: SZ + 0.2, delay: 1200 }],
        ['luke', 'mourn', { show: 1, look: -1.3, delay: 3500 }], ['g1', 'mourn', { show: 1, look: -1.4, delay: 3900 }], ['w1', 'mourn', { delay: 1000 }], ['timothy', 'idle', { look: 1.2 }]],
      // 바울이 내려가 청년 위에 엎드려 끌어안는다
      'p1.3': [['eutL', 'sleep', { show: 1 }], ['luke', 'mourn', { show: 1, x: SX + 0.65, z: SZ + 0.55 }], ['g1', 'mourn', { show: 1, x: SX + 0.75, z: SZ + 0.2 }],
        ['paul', 'idle', { show: 0 }], ['paul', 'idle', { x: SX + 0.08, z: SZ + 0.42, delay: 900 }], ['paul', 'mourn', { show: 1, look: 1.2, delay: 3600 }],
        ['luke', 'idle', { look: -1.3, delay: 3600 }], ['g1', 'idle', { look: -1.4, delay: 3800 }]],
      // 놀라지 마십시오 — 그가 살아 있습니다
      'p1.4': [['paul', 'speak', { show: 1, x: SX + 0.08, z: SZ + 0.42, look: 1.0, to: 'luke' }], ['luke', 'listen', { show: 1, x: SX + 0.65, z: SZ + 0.55 }], ['g1', 'listen', { show: 1, x: SX + 0.75, z: SZ + 0.2 }]],
      'p1.5': [['eutL', 'sleep', { show: 0, delay: 600 }], ['eut', 'sit-ground', { show: 1, y: 0, x: SX + 0.4, z: SZ + 0.38, look: -1.0, delay: 600 }], ['eut', 'idle', { look: -1.2, delay: 3000 }],
        ['paul', 'embrace', { look: 1.3, delay: 3000 }], ['luke', 'raise', { delay: 2000 }], ['g1', 'look-up', { delay: 2400 }], ['w1', 'raise', { delay: 2000 }], ['timothy', 'raise', { delay: 2200 }]],
      // 바울은 다시 올라가 떡을 떼어 먹는다
      'p2.0': [['eutL', 'sleep', { show: 0 }], ['eut', 'idle', { show: 1, y: 0, x: SX + 0.4, z: SZ + 0.38, look: -1.2 }], ['luke', 'idle', { show: 1, x: SX + 0.65, z: SZ + 0.55 }], ['g1', 'idle', { show: 1, x: SX + 0.75, z: SZ + 0.2 }],
        ['paul', 'idle', { show: 0 }], ['paul', 'idle', { x: -0.5, z: -0.28, delay: 900 }], ['paul', 'break', { show: 1, item: 'bread', look: 0.7, delay: 4200 }],
        ['w1', 'sit-ground', { delay: 600 }], ['timothy', 'sit-ground', { delay: 600 }]],
      // 날이 밝을 때까지 이야기하고 — 새벽에 길을 떠난다
      'p2.1': [['@env', 'dawn'], ['room', 'dim'], ['paul', 'speak', { show: 1, item: null, x: -0.5, z: -0.28, look: 0.7, to: 'timothy' }],
        ['paul', 'idle', { show: 0, delay: 3200 }], ['timothy', 'idle', { show: 0, delay: 3400 }], ['paul', 'idle', { show: 1, x: -1.35, z: 0.35, delay: 4500 }], ['paul', 'idle', { x: -2.1, z: 0.55, delay: 5000 }],
        ['paul', 'idle', { show: 0, delay: 7400 }]],
      // 살아난 청년을 데리고 집으로 — 큰 위로
      'p2.2': [['@env', 'dawn'], ['paul', 'idle', { show: 0 }], ['timothy', 'idle', { show: 0 }], ['eut', 'idle', { show: 1, y: 0, x: SX + 0.4, z: SZ + 0.38 }], ['eut', 'idle', { x: 1.75, z: 0.5, delay: 800 }],
        ['luke', 'idle', { x: 1.65, z: 0.25, delay: 1000 }], ['g1', 'idle', { x: 1.9, z: 0.35, delay: 600 }], ['eut', 'idle', { show: 0, delay: 4500 }], ['luke', 'idle', { show: 0, delay: 4700 }], ['g1', 'idle', { show: 0, delay: 4300 }]],
      w0: [['@env', 'night'], ['room', 'lit'], ['eutL', 'sleep', { show: 0 }], ['eut', 'sit', { show: 1, y: SY, x: SX, z: SZ, look: -1.2 }],
        ['paul', 'speak', { show: 1, item: null, x: -0.5, z: -0.28, look: 0.7, to: 'timothy' }], ['luke', 'sit-ground', { show: 1, x: -0.15, z: -0.5 }], ['g1', 'sit-ground', { show: 1, x: -0.2, z: -0.15 }],
        ['timothy', 'sit-ground', { show: 1 }], ['w1', 'sit-ground', { show: 1 }]],
      w1: [['eut', 'sit', { show: 0 }], ['eutL', 'sleep', { show: 1 }], ['paul', 'speak', { show: 1, x: SX + 0.08, z: SZ + 0.42, look: 1.0, to: 'luke' }],
        ['luke', 'listen', { show: 1, x: SX + 0.65, z: SZ + 0.55, look: -1.3 }], ['g1', 'listen', { show: 1, x: SX + 0.75, z: SZ + 0.2, look: -1.4 }]],
      w2: [['@env', 'dawn'], ['eutL', 'sleep', { show: 0 }], ['eut', 'idle', { show: 1, y: 0, x: SX + 0.4, z: SZ + 0.38, look: -1.2 }], ['paul', 'bless', { look: 1.3 }], ['luke', 'raise'], ['g1', 'look-up']],
      end: [['@env', 'night'], ['room', 'lit'], ['eut', 'idle', { show: 1, y: 0, x: SX + 0.4, z: SZ + 0.38, look: -1.2 }], ['eutL', 'sleep', { show: 0 }],
        ['paul', 'embrace', { show: 1, item: null, x: SX + 0.08, z: SZ + 0.42, look: 1.3 }], ['luke', 'raise', { show: 1, x: SX + 0.65, z: SZ + 0.55, look: -1.3 }], ['g1', 'look-up', { show: 1, x: SX + 0.75, z: SZ + 0.2, look: -1.4 }],
        ['timothy', 'raise', { show: 1, x: 0.2, z: -0.32 }], ['w1', 'raise', { show: 1 }], ['host', 'sit-ground', { show: 1 }]],
    },
  },

  /* a28. 다시 얼굴을 보지 못하리라 — 밀레도의 바닷가. 바다 쪽(왼쪽, 실제 지점 geo)에 일행이 타고 온 상선, 사람은 오른쪽 뭍에.
     바울이 사람을 보내 에베소 장로들을 부르고, 장로들이 오른쪽 뒤(에베소 쪽)에서 걸어온다. 바울이 오래 말하고(손짓·하늘을 가리킴), 모두 무릎 꿇고 기도한다.
     장로들이 바울의 목을 끌어안고 울고, 배까지 배웅한다 — 바울은 배에 오르고 장로들은 물가에서 손을 든다 */
  a28: {
    env: 'day',
    at: [37.53, 27.232], // 핀(옛 밀레도)이 지금 지도에서는 뭍 안쪽이라, 무대를 서쪽 바닷가로 옮긴다
    wide: 1.45,
    props: {
      ship: ['ship', -1.6, 0.35, { state: 'furled', big: 0.62, geo: [37.532, 27.19] }],
      rocks: ['rocks', 0, 0, { spots: [[0.6, 0.85, 0.08], [1.9, 0.75, 0.07], [1.6, -0.75, 0.09]] }],
    },
    cast: {
      paul: ['paul', 0.15, 0.25, 1.2],
      luke: ['luke', -0.25, 0.45, 1.2],
      timothy: ['timothy', -0.2, 0.05, 1.2],
      runner: ['greek', 0.5, 0.1, 1.3, { gaze: false }],
      e1: ['elderC', 2.2, -0.45, -1.3],
      e2: ['jewD', 2.35, -0.2, -1.3, { gaze: false }],
      e3: ['ephesian', 2.3, 0.1, -1.3, { gaze: false }],
      e4: ['greek2', 2.4, 0.4, -1.3, { gaze: false }],
      e5: ['elder', 2.5, -0.05, -1.3, { gaze: false }],
    },
    beats: {
      enter: [['runner', 'idle', { show: 0 }], ['paul', 'kneel', { x: 0.35, z: 0.25, look: 0.6 }], ['luke', 'kneel', { x: 0.0, z: 0.5, look: 0.8 }], ['timothy', 'kneel', { x: -0.05, z: 0.05, look: 1.0 }],
        ['e1', 'mourn', { x: 0.75, z: 0.05, look: -1.2 }], ['e2', 'kneel', { x: 1.05, z: 0.3, look: -1.3 }], ['e3', 'kneel', { x: 0.8, z: 0.55, look: -1.3 }], ['e4', 'pray', { x: 1.25, z: 0.0, look: -1.2 }], ['e5', 'kneel', { x: 0.55, z: 0.72, look: -0.8 }]],
      // 오순절 전에 예루살렘에 닿으려고 — 배에서 내려 밀레도의 물가에 선다
      intro: [['@env', 'day'], ['ship', 'furled'], ['paul', 'idle', { look: -1.2 }], ['runner', 'idle', { show: 1 }],
        ['e1', 'idle', { show: 0 }], ['e2', 'idle', { show: 0 }], ['e3', 'idle', { show: 0 }], ['e4', 'idle', { show: 0 }], ['e5', 'idle', { show: 0 }]],
      'p0.1': [['paul', 'idle', { look: 1.2 }], ['luke', 'idle', { look: 1.0 }], ['timothy', 'idle', { look: 1.0 }]],
      // 에베소로 사람을 보내 장로들을 부른다
      'p0.2': [['paul', 'speak', { to: 'runner' }], ['runner', 'bow', { delay: 2500 }], ['runner', 'idle', { x: 2.1, z: -0.55, delay: 3600 }], ['runner', 'idle', { show: 0, delay: 6600 }]],
      // 장로들이 온다 — 바울이 말한다
      'p0.3': [['runner', 'idle', { show: 0 }], ['e1', 'idle', { show: 1, x: 0.85, z: 0.0, look: -1.2 }], ['e2', 'idle', { show: 1, x: 1.2, z: 0.25, look: -1.3, delay: 300 }], ['e3', 'idle', { show: 1, x: 0.95, z: 0.55, look: -1.3, delay: 500 }],
        ['e4', 'idle', { show: 1, x: 1.4, z: -0.05, look: -1.2, delay: 700 }], ['e5', 'idle', { show: 1, x: 1.3, z: 0.6, look: -1.3, delay: 900 }], ['paul', 'idle', { x: 0.35, z: 0.25, look: 1.2 }],
        ['paul', 'embrace', { look: 1.2, delay: 4200 }], ['e1', 'embrace', { delay: 4200 }]],
      'p0.4': [['e1', 'listen', { x: 0.85, z: 0.0, look: -1.2 }], ['e2', 'listen', { show: 1, x: 1.2, z: 0.25 }], ['e3', 'listen', { show: 1, x: 0.95, z: 0.55 }], ['e4', 'idle', { show: 1, x: 1.4, z: -0.05 }], ['e5', 'idle', { show: 1, x: 1.3, z: 0.6 }],
        ['paul', 'speak', { x: 0.35, z: 0.25, to: 'e1' }]],
      // 성령께 붙들려 예루살렘으로 — 동쪽(오른쪽 뒤)이 아니라 바다 건너를 가리킨다
      'p1.1': [['paul', 'point', { look: -1.3 }]],
      'p1.2': [['paul', 'speak', { to: 'e2' }], ['e1', 'shrug', { delay: 1500 }]],
      'p1.3': [['paul', 'raise', { look: 0.4 }], ['e1', 'listen']],
      // 다시는 내 얼굴을 보지 못할 것 — 장로들이 운다
      'p1.4': [['paul', 'speak', { to: 'e1' }], ['e1', 'mourn', { delay: 1800 }], ['e3', 'mourn', { delay: 2300 }]],
      // 사나운 이리들 — 깨어 있으라
      'p2.0': [['e1', 'listen'], ['e3', 'listen'], ['paul', 'speak', { to: 'e4' }]],
      'p2.1': [['paul', 'rebuke', { look: 1.0 }]],
      // 주는 것이 받는 것보다 복되다
      'p2.2': [['paul', 'bless', { look: 1.2 }]],
      // 무릎을 꿇고 모두와 함께 기도한다
      'p2.3': [['paul', 'kneel', { look: 0.6 }], ['e1', 'kneel', { delay: 400 }], ['e2', 'kneel', { delay: 600 }], ['e3', 'kneel', { delay: 800 }], ['e4', 'pray', { delay: 1000 }], ['e5', 'kneel', { delay: 1100 }],
        ['luke', 'kneel', { delay: 700 }], ['timothy', 'kneel', { delay: 900 }]],
      // 목을 끌어안고 입을 맞추며 크게 운다
      'p2.4': [['paul', 'embrace', { look: 1.2 }], ['e1', 'embrace', { x: 0.62, z: 0.12 }], ['e2', 'mourn', { delay: 500 }], ['e3', 'mourn', { delay: 800 }], ['e4', 'mourn', { delay: 1000 }], ['e5', 'mourn', { delay: 1200 }],
        ['luke', 'idle'], ['timothy', 'idle']],
      // 배까지 배웅한다 — 바울이 배에 오르고 장로들은 물가에서 손을 든다
      'p2.5': [['e2', 'idle'], ['e3', 'idle'], ['e4', 'idle'], ['e5', 'idle'], ['paul', 'idle', { x: -0.55, z: 0.3 }], ['luke', 'idle', { x: -0.7, z: 0.55, delay: 300 }], ['timothy', 'idle', { x: -0.75, z: 0.1, delay: 400 }],
        ['e1', 'idle', { x: -0.15, z: 0.25, delay: 500 }], ['e2', 'idle', { x: 0.15, z: 0.0, delay: 700 }], ['e3', 'idle', { x: 0.1, z: 0.55, delay: 900 }], ['e4', 'idle', { x: 0.35, z: 0.2, delay: 1100 }], ['e5', 'idle', { x: 0.4, z: 0.7, delay: 1300 }],
        ['paul', 'idle', { board: 'ship', x: 0, z: 0, look: 1.2, delay: 4200 }], ['luke', 'idle', { board: 'ship', x: -0.3, z: 0.05, look: 1.2, delay: 4600 }], ['timothy', 'idle', { board: 'ship', x: 0.25, z: -0.05, look: 1.2, delay: 5000 }],
        ['paul', 'bless', { delay: 6500 }], ['e1', 'raise', { look: -1.3, delay: 5500 }], ['e2', 'mourn', { look: -1.3, delay: 5600 }], ['e3', 'raise', { look: -1.3, delay: 5800 }], ['e4', 'idle', { look: -1.3, delay: 6000 }], ['e5', 'mourn', { look: -1.3, delay: 6100 }]],
      w0: [['paul', 'speak', { board: null, x: 0.35, z: 0.25, look: 1.2, to: 'e1' }], ['luke', 'idle', { board: null, x: -0.25, z: 0.45, look: 1.2 }], ['timothy', 'idle', { board: null, x: -0.2, z: 0.05, look: 1.2 }], ['runner', 'idle', { show: 0 }],
        ['e1', 'listen', { show: 1, x: 0.85, z: 0.0, look: -1.2 }], ['e2', 'listen', { show: 1, x: 1.2, z: 0.25, look: -1.3 }], ['e3', 'listen', { show: 1, x: 0.95, z: 0.55, look: -1.3 }],
        ['e4', 'idle', { show: 1, x: 1.4, z: -0.05, look: -1.2 }], ['e5', 'idle', { show: 1, x: 1.3, z: 0.6, look: -1.3 }]],
      w1: [['paul', 'bless', { look: 1.2 }], ['e1', 'kneel'], ['e2', 'kneel']],
      w2: [['paul', 'speak', { to: 'e4' }], ['e1', 'listen'], ['e2', 'listen']],
      end: [['ship', 'furled'], ['runner', 'idle', { show: 0 }], ['paul', 'kneel', { board: null, x: 0.35, z: 0.25, look: 0.6 }], ['luke', 'kneel', { board: null, x: 0.0, z: 0.5, look: 0.8 }], ['timothy', 'kneel', { board: null, x: -0.05, z: 0.05, look: 1.0 }],
        ['e1', 'mourn', { show: 1, x: 0.75, z: 0.05, look: -1.2 }], ['e2', 'kneel', { show: 1, x: 1.05, z: 0.3, look: -1.3 }], ['e3', 'kneel', { show: 1, x: 0.8, z: 0.55, look: -1.3 }], ['e4', 'pray', { show: 1, x: 1.25, z: 0.0, look: -1.2 }], ['e5', 'kneel', { show: 1, x: 0.55, z: 0.72, look: -0.8 }]],
    },
  },

  /* a29. 아가보의 허리띠 — 왼쪽은 두로의 바닷가(바다 쪽에 배 — geo): 아내와 아이들까지 함께 나와 바닷가에 무릎 꿇고 기도하고 작별한다.
     오른쪽은 가이사랴의 전도자 빌립의 집(house). 일행이 걸어와 묵고, 유대에서 내려온 아가보가 바울의 허리띠를 가져다 앉아 제 손발을 묶는다(beltbind).
     모두 울며 말리고(mourn), 바울은 '죽을 각오도'. 사람들이 '주님의 뜻대로' — 고개 숙여 기도한다 */
  a29: {
    env: 'day',
    at: [32.5, 34.96], // 핀이 바로 물가라 무대 왼쪽이 바다 — 무대를 동쪽 뭍으로 옮긴다
    wide: 1.45,
    props: {
      ship: ['ship', -2.0, 0.35, { state: 'furled', big: 0.6, geo: [32.505, 34.882] }],
      home: ['house', 1.5, -0.5, { stair: true, door: true }],
      belt: ['beltbind', 1.0, 0.3, { on: 'agabus' }],
    },
    cast: {
      paul: ['paul', -0.95, 0.25, -1.0],
      luke: ['luke', -0.7, 0.45, -1.0],
      timothy: ['timothy', -0.65, 0.05, -1.0],
      t1: ['man', -1.3, 0.05, 1.0],
      t2: ['woman', -1.45, 0.45, 1.0, { gaze: false }],
      t3: ['child', -1.25, 0.62, 1.0, { gaze: false }],
      t4: ['girl', -1.55, 0.2, 1.0, { gaze: false }],
      philip: ['elder', 1.15, -0.05, -1.0],
      agabus: ['agabus', 2.3, 0.45, -1.3],
    },
    beats: {
      enter: [['belt', 'bound'], ['t1', 'idle', { show: 0 }], ['t2', 'idle', { show: 0 }], ['t3', 'idle', { show: 0 }], ['t4', 'idle', { show: 0 }],
        ['paul', 'speak', { x: 0.45, z: 0.25, look: 1.2, to: 'luke' }], ['agabus', 'sit-ground', { x: 1.0, z: 0.35, look: -1.2 }], ['luke', 'mourn', { x: 0.65, z: 0.55, look: -1.2 }],
        ['timothy', 'shrug', { x: 0.75, z: 0.0, look: -1.3 }], ['philip', 'mourn', { x: 1.25, z: 0.05, look: -1.2 }]],
      // 두로에서 이레 — 제자들이 예루살렘에 올라가지 말라고 한다
      intro: [['@env', 'day'], ['belt', 'none'], ['agabus', 'idle', { show: 0 }], ['t1', 'speak', { to: 'paul' }]],
      'p0.1': [['t1', 'shrug', { look: 1.0 }], ['t1', 'speak', { to: 'paul', delay: 2000 }], ['paul', 'listen']],
      // 떠나는 날 아내와 아이들까지 성 밖 바닷가로
      'p0.2': [['t1', 'idle'], ['t2', 'idle', { x: -1.35, z: 0.5, look: 1.0 }], ['t3', 'idle', { x: -1.15, z: 0.7, look: 1.0 }]],
      // 바닷가에 무릎을 꿇고 기도한 뒤 작별한다
      'p0.3': [['paul', 'kneel', { look: -0.8 }], ['luke', 'kneel', { delay: 300 }], ['timothy', 'kneel', { delay: 400 }], ['t1', 'kneel', { delay: 500 }], ['t2', 'pray', { delay: 600 }], ['t3', 'pray', { delay: 700 }], ['t4', 'kneel', { delay: 800 }],
        ['t1', 'bless', { delay: 4500 }], ['paul', 'idle', { delay: 4500 }], ['luke', 'idle', { delay: 4700 }], ['timothy', 'idle', { delay: 4800 }], ['t2', 'mourn', { delay: 4600 }]],
      // 가이사랴의 전도자 빌립의 집 — 걸어와 맞아들인다
      'p1.0': [['t1', 'bless', { x: -1.3, z: 0.05 }], ['t1', 'idle', { show: 0, delay: 1500 }], ['t2', 'idle', { show: 0, delay: 1600 }], ['t3', 'idle', { show: 0, delay: 1700 }], ['t4', 'idle', { show: 0, delay: 1800 }],
        ['paul', 'idle', { x: 0.45, z: 0.25 }], ['luke', 'idle', { x: 0.65, z: 0.55, delay: 300 }], ['timothy', 'idle', { x: 0.75, z: 0.0, delay: 400 }],
        ['philip', 'embrace', { look: -1.2, delay: 3200 }], ['paul', 'embrace', { look: 1.2, delay: 3400 }]],
      // 여러 날 뒤, 유대에서 아가보가 내려온다
      'p1.1': [['t1', 'idle', { show: 0 }], ['t2', 'idle', { show: 0 }], ['t3', 'idle', { show: 0 }], ['t4', 'idle', { show: 0 }], ['paul', 'idle', { x: 0.45, z: 0.25, look: 1.2 }], ['luke', 'idle', { x: 0.65, z: 0.55, look: 1.0 }],
        ['timothy', 'idle', { x: 0.75, z: 0.0, look: 1.0 }], ['philip', 'idle', { x: 1.15, z: -0.05, look: -1.0 }], ['agabus', 'idle', { show: 1, x: 1.25, z: 0.42, look: -1.3 }]],
      // 바울의 허리띠를 가져다 제 손발을 묶는다
      'p1.2': [['agabus', 'idle', { x: 1.0, z: 0.35, look: -1.3 }], ['belt', 'held', { delay: 1800 }], ['agabus', 'sit-ground', { look: -1.2, delay: 3000 }], ['belt', 'bound', { delay: 4200 }]],
      'p1.3': [['belt', 'bound'], ['agabus', 'sit-speak', { x: 1.0, z: 0.35, look: -1.2, to: 'paul' }]],
      'p1.4': [['agabus', 'sit-speak', { to: 'paul' }], ['paul', 'listen']],
      // 모두 울며 말린다
      'p2.0': [['agabus', 'sit-ground'], ['luke', 'mourn'], ['philip', 'mourn', { delay: 400 }], ['timothy', 'shrug', { delay: 800 }], ['timothy', 'speak', { to: 'paul', delay: 2400 }]],
      'p2.1': [['timothy', 'idle']],
      'p2.2': [['paul', 'speak', { to: 'luke' }]],
      'p2.3': [['paul', 'raise', { look: 0.6 }]],
      // 말리기를 그치고 — 주님의 뜻대로
      'p2.4': [['paul', 'idle'], ['luke', 'idle', { look: -1.0 }], ['philip', 'idle'], ['timothy', 'idle']],
      'p2.5': [['luke', 'pray'], ['philip', 'pray', { delay: 300 }], ['timothy', 'pray', { delay: 500 }], ['agabus', 'sit-ground', { look: -0.6 }], ['paul', 'look-up', { delay: 1500 }]],
      w0: [['belt', 'bound'], ['agabus', 'sit-speak', { show: 1, x: 1.0, z: 0.35, look: -1.2, to: 'paul' }], ['paul', 'listen', { x: 0.45, z: 0.25, look: 1.2 }], ['luke', 'idle', { x: 0.65, z: 0.55, look: 1.0 }],
        ['timothy', 'idle', { x: 0.75, z: 0.0, look: 1.0 }], ['philip', 'idle', { x: 1.15, z: -0.05, look: -1.0 }],
        ['t1', 'idle', { show: 0 }], ['t2', 'idle', { show: 0 }], ['t3', 'idle', { show: 0 }], ['t4', 'idle', { show: 0 }]],
      w1: [['agabus', 'sit-ground'], ['paul', 'speak', { to: 'luke' }], ['luke', 'mourn'], ['philip', 'mourn']],
      w2: [['paul', 'look-up'], ['luke', 'pray'], ['philip', 'pray'], ['timothy', 'pray']],
      end: [['belt', 'bound'], ['t1', 'idle', { show: 0 }], ['t2', 'idle', { show: 0 }], ['t3', 'idle', { show: 0 }], ['t4', 'idle', { show: 0 }],
        ['paul', 'speak', { x: 0.45, z: 0.25, look: 1.2, to: 'luke' }], ['agabus', 'sit-ground', { show: 1, x: 1.0, z: 0.35, look: -1.2 }], ['luke', 'mourn', { x: 0.65, z: 0.55, look: -1.2 }],
        ['timothy', 'shrug', { x: 0.75, z: 0.0, look: -1.3 }], ['philip', 'mourn', { x: 1.25, z: 0.05, look: -1.2 }]],
    },
  },

  /* a30. 성전에서 붙잡히다 — 예루살렘 성전 뜰(지도의 도성 그림 위 — 성전 소품은 두지 않는다). 왼쪽에서 야고보와 장로들이 일행을 맞고,
     바울은 서원한 네 사람과 함께 성전 뜰(가운데)로 들어간다. 아시아에서 온 유대인들이 알아보고 외치자 무리가 몰려든다(crowd).
     무리가 바울을 끌어내려 할 때, 천부장과 군인들이 왼쪽 뒤(안토니아 요새 쪽)에서 달려와 두 군인 사이에 바울을 쇠사슬로 묶는다(chain — 때리는 모습 없음) */
  a30: {
    env: 'day',
    wide: 1.45,
    props: {
      folk: ['crowd', 0.55, 0.25, { spots: [[-0.3, 0.45], [0.05, 0.58], [0.4, 0.45], [0.6, 0.12], [0.55, -0.25], [-0.05, -0.42], [0.3, -0.45], [0.75, 0.38]], face: -Math.PI / 2 }],
      chain: ['chain', 0.55, 0.25, { n: 3, gap: 0.32, y: 0.42 }],
    },
    cast: {
      paul: ['paulS', -1.9, 0.35, 1.2],
      luke: ['luke', -2.1, 0.55, 1.2, { gaze: false }],
      troph: ['greek', -2.15, 0.15, 1.2, { gaze: false }],
      james: ['jamesL', -1.3, -0.15, 0.9],
      el1: ['elder', -1.6, -0.35, 0.8, { gaze: false }],
      el2: ['elderC', -1.05, -0.4, 0.6, { gaze: false }],
      v1: ['jewD', -1.65, 0.62, 1.0, { gaze: false }],
      v2: ['hellenist', -1.4, 0.75, 1.0, { gaze: false }],
      v3: ['man', -1.25, 0.5, 1.0, { gaze: false }],
      v4: ['townsman', -1.0, 0.68, 1.0, { gaze: false }],
      a1: ['jewD', 1.6, 0.35, -1.3],
      a2: ['hellenist', 1.75, 0.0, -1.3, { gaze: false }],
      m1: ['pharisee', 1.45, -0.4, -1.2, { gaze: false }],
      tribune: ['tribune', -1.3, -0.8, 1.0],
      s1: ['soldier', -1.5, -0.7, 1.0, { gaze: false }],
      s2: ['soldier', -1.6, -0.95, 1.0, { gaze: false }],
    },
    beats: {
      enter: [['chain', null, { show: 1 }], ['folk', null, { show: 1 }], ['james', 'idle', { show: 0 }], ['el1', 'idle', { show: 0 }], ['el2', 'idle', { show: 0 }], ['luke', 'idle', { show: 0 }], ['troph', 'idle', { show: 0 }],
        ['v1', 'idle', { show: 0 }], ['v2', 'idle', { show: 0 }], ['v3', 'idle', { show: 0 }], ['v4', 'idle', { show: 0 }],
        ['s1', 'idle', { x: 0.55, z: 0.25, look: 0.4 }], ['paul', 'idle', { x: 0.23, z: 0.25, look: 0.2 }], ['s2', 'idle', { x: -0.09, z: 0.25, look: 0.4 }], ['tribune', 'rebuke', { x: 0.35, z: -0.2, look: 1.0 }],
        ['a1', 'rebuke', { x: 0.95, z: 0.45, look: -1.3 }], ['a2', 'raise', { x: 1.1, z: 0.1, look: -1.3 }], ['m1', 'afraid', { x: 0.75, z: -0.25, look: -1.2 }]],
      // 예루살렘의 형제들이 일행을 반긴다
      intro: [['@env', 'day'], ['chain', null, { show: 0 }], ['folk', null, { show: 0 }], ['tribune', 'idle', { show: 0 }], ['s1', 'idle', { show: 0 }], ['s2', 'idle', { show: 0 }],
        ['a1', 'idle', { show: 0 }], ['a2', 'idle', { show: 0 }], ['m1', 'idle', { show: 0 }], ['james', 'idle', { show: 0 }], ['el1', 'idle', { show: 0 }], ['el2', 'idle', { show: 0 }],
        ['v1', 'idle', { show: 0 }], ['v2', 'idle', { show: 0 }], ['v3', 'idle', { show: 0 }], ['v4', 'idle', { show: 0 }]],
      'p0.0': [['paul', 'idle', { x: -0.95, z: 0.3 }], ['luke', 'idle', { x: -1.15, z: 0.52, delay: 300 }], ['troph', 'idle', { x: -1.2, z: 0.12, delay: 400 }]],
      // 이튿날 야고보를 찾아가니 장로들이 모인다
      'p0.1': [['paul', 'idle', { x: -0.95, z: 0.3, look: -1.2 }], ['james', 'idle', { show: 1 }], ['el1', 'idle', { show: 1, delay: 500 }], ['el2', 'idle', { show: 1, delay: 900 }]],
      'p0.2': [['paul', 'speak', { to: 'james' }], ['james', 'listen'], ['el1', 'listen'], ['el2', 'listen']],
      'p0.3': [['paul', 'idle'], ['james', 'raise', { look: 0.4 }], ['el1', 'look-up'], ['el2', 'raise', { delay: 400 }]],
      'p0.4': [['james', 'speak', { to: 'paul' }], ['el1', 'idle'], ['el2', 'idle']],
      'p0.5': [['james', 'speak', { to: 'paul' }], ['el2', 'shrug', { delay: 1500 }]],
      // 서원한 네 사람과 함께 정결 예식을 — 장로가 권한다
      'p1.0': [['james', 'idle'], ['el2', 'idle'], ['el1', 'speak', { to: 'paul' }]],
      'p1.1': [['el1', 'point', { look: 1.5 }], ['v1', 'idle', { show: 1 }], ['v2', 'idle', { show: 1, delay: 300 }], ['v3', 'idle', { show: 1, delay: 600 }], ['v4', 'idle', { show: 1, delay: 900 }]],
      'p1.2': [['el1', 'speak', { to: 'paul' }], ['paul', 'bow', { look: -1.2, delay: 2500 }]],
      // 네 사람과 함께 성전 뜰로 들어간다
      'p1.3': [['el1', 'idle'], ['paul', 'idle', { x: 0.25, z: 0.2, look: 0.2 }], ['v1', 'idle', { x: -0.05, z: 0.45, delay: 300 }], ['v2', 'idle', { x: 0.3, z: 0.55, delay: 500 }], ['v3', 'idle', { x: 0.55, z: 0.35, delay: 600 }], ['v4', 'idle', { x: -0.1, z: 0.05, delay: 700 }],
        ['james', 'idle', { show: 0, delay: 1800 }], ['el1', 'idle', { show: 0, delay: 2000 }], ['el2', 'idle', { show: 0, delay: 2200 }], ['luke', 'idle', { x: -2.0, z: 0.6, delay: 600 }], ['troph', 'idle', { x: -2.1, z: 0.2, delay: 800 }],
        ['luke', 'idle', { show: 0, delay: 3500 }], ['troph', 'idle', { show: 0, delay: 3600 }], ['paul', 'pray', { delay: 5500 }], ['v1', 'pray', { look: 0.4, delay: 5500 }], ['v2', 'pray', { look: 0.4, delay: 5600 }], ['v3', 'pray', { look: -0.6, delay: 5700 }], ['v4', 'pray', { look: 0.6, delay: 5800 }]],
      // 이레가 끝나 갈 때 — 아시아에서 온 유대인들이 알아본다
      'p1.4': [['james', 'idle', { show: 0 }], ['el1', 'idle', { show: 0 }], ['el2', 'idle', { show: 0 }], ['luke', 'idle', { show: 0 }], ['troph', 'idle', { show: 0 }],
        ['paul', 'pray', { x: 0.25, z: 0.2, look: 0.2 }], ['v1', 'pray', { x: -0.05, z: 0.45 }], ['v2', 'pray', { x: 0.3, z: 0.55 }], ['v3', 'pray', { x: 0.55, z: 0.35 }], ['v4', 'pray', { x: -0.1, z: 0.05 }],
        ['a1', 'idle', { show: 1, x: 1.1, z: 0.4, look: -1.3 }], ['a2', 'idle', { show: 1, x: 1.25, z: 0.05, look: -1.3, delay: 400 }], ['a1', 'point', { delay: 2600 }]],
      // 무리를 부추기며 외친다 — 무리가 몰려든다
      'p2.0': [['a1', 'rebuke', { x: 0.95, z: 0.45, look: -1.3 }], ['a2', 'raise', { x: 1.1, z: 0.1, look: -1.3 }], ['folk', null, { show: 1, delay: 1200 }], ['m1', 'rebuke', { show: 1, x: 0.75, z: -0.25, look: -1.2, delay: 900 }],
        ['paul', 'idle', { look: 1.0 }], ['v1', 'afraid', { x: -0.4, z: 0.6 }], ['v2', 'afraid', { x: -0.1, z: 0.8 }], ['v3', 'idle', { x: -0.25, z: 0.3, look: 1.2 }], ['v4', 'afraid', { x: -0.4, z: -0.05 }]],
      'p2.1': [['a1', 'raise'], ['m1', 'raise']],
      'p2.2': [['a1', 'rebuke'], ['a2', 'point', { look: -1.2 }]],
      // 드로비모를 성안에서 보고 짐작한 것 — 왼쪽(성 안)을 가리킨다
      'p2.3': [['a2', 'point', { look: -1.5 }], ['troph', 'idle', { show: 0.5, x: -2.0, z: 0.25, look: 1.2 }], ['troph', 'idle', { show: 0, delay: 3000 }]],
      // 끌어내 죽이려 할 때 — 천부장과 군인들이 달려와 두 쇠사슬로 묶는다
      'p2.4': [['troph', 'idle', { show: 0 }], ['m1', 'rebuke', { x: 0.4, z: 0.1 }], ['a1', 'rebuke', { x: 0.45, z: 0.42 }], ['paul', 'idle', { x: 0.23, z: 0.25, look: 0.6, delay: 600 }],
        ['tribune', 'idle', { show: 1, x: 0.35, z: -0.2, delay: 1500 }], ['s1', 'idle', { show: 1, x: 0.55, z: 0.25, delay: 1700 }], ['s2', 'idle', { show: 1, x: -0.09, z: 0.25, delay: 1900 }],
        ['m1', 'afraid', { x: 0.75, z: -0.25, delay: 4200 }], ['a1', 'afraid', { x: 0.95, z: 0.45, delay: 4300 }], ['a2', 'afraid', { x: 1.1, z: 0.1, delay: 4400 }],
        ['tribune', 'rebuke', { look: 1.0, delay: 5000 }], ['s1', 'idle', { look: 0.4, delay: 6200 }], ['s2', 'idle', { look: 0.4, delay: 6400 }], ['paul', 'idle', { look: 0.2, delay: 6200 }], ['chain', null, { show: 1, delay: 6600 }],
        ['v1', 'idle', { show: 0, delay: 2500 }], ['v2', 'idle', { show: 0, delay: 2600 }], ['v3', 'idle', { show: 0, delay: 2700 }], ['v4', 'idle', { show: 0, delay: 2800 }]],
      w0: [['chain', null, { show: 0 }], ['folk', null, { show: 0 }], ['tribune', 'idle', { show: 0 }], ['s1', 'idle', { show: 0 }], ['s2', 'idle', { show: 0 }], ['a1', 'idle', { show: 0 }], ['a2', 'idle', { show: 0 }], ['m1', 'idle', { show: 0 }],
        ['v1', 'idle', { show: 0 }], ['v2', 'idle', { show: 0 }], ['v3', 'idle', { show: 0 }], ['v4', 'idle', { show: 0 }],
        ['paul', 'listen', { x: -0.95, z: 0.3, look: -1.2 }], ['james', 'speak', { show: 1, x: -1.3, z: -0.15, to: 'paul' }], ['el1', 'idle', { show: 1, x: -1.6, z: -0.35 }], ['el2', 'idle', { show: 1, x: -1.05, z: -0.4 }],
        ['luke', 'idle', { show: 1, x: -1.15, z: 0.52, look: -1.0 }], ['troph', 'idle', { show: 1, x: -1.2, z: 0.12, look: -1.0 }]],
      w1: [['james', 'idle', { show: 0 }], ['el1', 'idle', { show: 0 }], ['el2', 'idle', { show: 0 }], ['luke', 'idle', { show: 0 }], ['troph', 'idle', { show: 0 }],
        ['paul', 'idle', { x: 0.25, z: 0.2, look: 1.0 }], ['a1', 'rebuke', { show: 1, x: 0.95, z: 0.45, look: -1.3 }], ['a2', 'raise', { show: 1, x: 1.1, z: 0.1, look: -1.3 }], ['folk', null, { show: 1 }], ['m1', 'raise', { show: 1, x: 0.75, z: -0.25, look: -1.2 }]],
      w2: [['m1', 'rebuke'], ['a1', 'raise'], ['a2', 'rebuke']],
      end: [['chain', null, { show: 1 }], ['folk', null, { show: 1 }], ['james', 'idle', { show: 0 }], ['el1', 'idle', { show: 0 }], ['el2', 'idle', { show: 0 }], ['luke', 'idle', { show: 0 }], ['troph', 'idle', { show: 0 }],
        ['v1', 'idle', { show: 0 }], ['v2', 'idle', { show: 0 }], ['v3', 'idle', { show: 0 }], ['v4', 'idle', { show: 0 }],
        ['s1', 'idle', { show: 1, x: 0.55, z: 0.25, look: 0.4 }], ['paul', 'idle', { x: 0.23, z: 0.25, look: 0.2 }], ['s2', 'idle', { show: 1, x: -0.09, z: 0.25, look: 0.4 }], ['tribune', 'rebuke', { show: 1, x: 0.35, z: -0.2, look: 1.0 }],
        ['a1', 'idle', { show: 1, x: 0.95, z: 0.45, look: -1.3 }], ['a2', 'idle', { show: 1, x: 1.1, z: 0.1, look: -1.3 }], ['m1', 'afraid', { show: 1, x: 0.75, z: -0.25, look: -1.2 }]],
    },
  },

  /* a31. 계단 위에서 들려준 이야기 — 안토니아 요새(fortstairs: 높은 벽과 망대, 성문 앞 층계참, 왼쪽으로 내려가는 층계). 군인들이 바울을 층계 위로 데려가고,
     바울이 천부장에게 말을 청한다. 층계참에서 손짓하자 아래의 무리(왼쪽 앞)가 조용해지고, 다메섹 길과 성전의 일을 들려준다 — '가라'에서 바울 위로 빛.
     무리가 다시 외치고, 천부장은 바울을 들이라 한다. 군인들이 바울을 묶는 데서 멈추고(채찍질 없음), 바울이 백부장에게 묻고 천부장과 시민권을 말한다 */
  a31: {
    env: 'day',
    wide: 1.45,
    props: {
      fort: ['fortstairs', 0.55, -0.3, { lh: 0.42 }],
      folk: ['crowd', -0.85, 0.42, { spots: [[-0.5, -0.05], [-0.15, 0.1], [0.2, 0.2], [0.5, 0.05], [-0.3, 0.35], [0.1, 0.42], [0.55, 0.38], [-0.7, 0.25]], face: Math.PI * 0.8 }],
      memory: ['beam', 0.45, -0.38, { r: 0.32, h: 2.4 }],
    },
    cast: {
      paul: ['paulS', -0.55, -0.42, 1.3],
      tribune: ['tribune', 0.88, -0.38, -1.0],
      s1: ['soldier', -0.8, -0.42, 1.3, { gaze: false }],
      s2: ['soldier', -0.3, -0.42, 1.3, { gaze: false }],
      cent: ['centurion', 1.0, -0.22, -1.0],
      m1: ['jewD', -1.05, 0.2, 2.6],
      m2: ['pharisee', -0.65, 0.55, 2.7, { gaze: false }],
      m3: ['hellenist', -1.35, 0.6, 2.5, { gaze: false }],
      m4: ['man', -0.3, 0.25, -2.7, { gaze: false }],
    },
    beats: {
      enter: [['memory', null, { show: 0 }], ['paul', 'raise', { x: 0.45, z: -0.38, look: -0.7 }], ['s1', 'idle', { x: 0.2, z: -0.55, look: -0.5 }], ['s2', 'idle', { x: 0.72, z: -0.55, look: -0.6 }],
        ['tribune', 'idle', { x: 0.9, z: -0.32, look: -1.2 }], ['cent', 'idle', { show: 0 }], ['m1', 'listen'], ['m2', 'listen'], ['m3', 'listen'], ['m4', 'listen']],
      // 군인들이 바울을 병영으로 — 층계를 오른다
      intro: [['@env', 'day'], ['memory', null, { show: 0 }], ['cent', 'idle', { show: 0 }], ['m1', 'rebuke'], ['m2', 'raise'], ['m4', 'rebuke']],
      'p0.0': [['paul', 'idle', { x: 0.45, z: -0.38 }], ['s1', 'idle', { x: 0.2, z: -0.55, delay: 200 }], ['s2', 'idle', { x: 0.72, z: -0.55, delay: 900 }]],
      // 한 말씀 드려도 되겠습니까?
      'p0.1': [['paul', 'speak', { x: 0.45, z: -0.38, look: 1.2, to: 'tribune' }], ['s1', 'idle', { x: 0.2, z: -0.55, look: 1.0 }], ['s2', 'idle', { x: 0.72, z: -0.55, look: -0.6 }]],
      // 헬라 말을 아느냐? 그 애굽 사람이 아니냐?
      'p0.2': [['paul', 'idle', { look: 1.2 }], ['tribune', 'afraid', { look: -1.2 }]],
      'p0.3': [['tribune', 'speak', { to: 'paul' }]],
      'p0.4': [['tribune', 'point', { look: -1.2 }]],
      'p0.5': [['tribune', 'idle'], ['paul', 'speak', { to: 'tribune' }]],
      'p0.7': [['paul', 'point', { look: -0.9 }]],
      // 천부장이 허락한다
      'p0.8': [['paul', 'idle', { look: 1.2 }], ['tribune', 'bless', { look: -1.2 }], ['tribune', 'idle', { delay: 2500 }]],
      // 층계에 서서 손짓하자 무리가 조용해진다
      'p1.0': [['paul', 'raise', { look: -0.7 }], ['m1', 'listen', { delay: 1200 }], ['m2', 'listen', { delay: 1500 }], ['m3', 'listen', { delay: 1700 }], ['m4', 'listen', { delay: 1300 }], ['s1', 'idle', { look: -0.5 }], ['s2', 'idle', { look: -0.6 }]],
      // 가말리엘 밑에서 배우고, 박해하고, 다메섹 길에서 음성을 듣고
      'p1.1': [['paul', 'speak', { look: -0.7, to: 'm1' }]],
      'p1.2': [['paul', 'speak', { to: 'm2' }]],
      // 성전에서 기도할 때 주님께서 — 바울 위로 빛
      'p1.3': [['paul', 'look-up', { look: -0.3 }], ['memory', null, { show: 1, delay: 800 }]],
      'p1.4': [['memory', null, { show: 1 }], ['paul', 'raise', { look: -0.4 }]],
      'p1.5': [['paul', 'point', { look: -1.4 }]],
      // 무리가 외친다 — 이런 자는 없애 버려라
      'p2.0': [['memory', null, { show: 0 }], ['paul', 'idle', { look: -0.7 }], ['m1', 'rebuke'], ['m2', 'raise', { delay: 300 }], ['m3', 'rebuke', { delay: 500 }], ['m4', 'raise', { delay: 700 }]],
      'p2.1': [['m1', 'raise'], ['m4', 'rebuke']],
      // 천부장이 바울을 들이라 한다 — 무리는 흩어지고 성문 앞 층계참에서 묶는다
      'p2.2': [['tribune', 'point', { look: -0.5 }], ['s1', 'idle', { x: 0.25, z: -0.42, look: 1.0 }], ['s2', 'idle', { x: 0.75, z: -0.42, look: -1.0 }],
        ['m1', 'idle', { x: -1.9, z: 0.4, delay: 1500 }], ['m2', 'idle', { x: -1.8, z: 0.8, delay: 1700 }], ['m3', 'idle', { x: -2.0, z: 0.65, delay: 1600 }], ['m4', 'idle', { x: -1.7, z: 0.2, delay: 1800 }],
        ['folk', null, { show: 0, delay: 2500 }], ['m1', 'idle', { show: 0, delay: 4800 }], ['m2', 'idle', { show: 0, delay: 5000 }], ['m3', 'idle', { show: 0, delay: 5100 }], ['m4', 'idle', { show: 0, delay: 5200 }],
        ['tribune', 'idle', { x: 1.2, z: -0.2, look: -1.3, delay: 1200 }]],
      // 군인들이 바울을 묶자 — 바울이 곁의 백부장에게 묻는다
      'p2.3': [['folk', null, { show: 0 }], ['m1', 'idle', { show: 0 }], ['m2', 'idle', { show: 0 }], ['m3', 'idle', { show: 0 }], ['m4', 'idle', { show: 0 }], ['tribune', 'idle', { x: 1.2, z: -0.2 }],
        ['paul', 'idle', { x: 0.45, z: -0.4, look: 0 }], ['s1', 'carry-pole', { x: 0.3, z: -0.4, look: 1.2 }], ['s2', 'carry-pole', { x: 0.6, z: -0.4, look: -1.2 }], ['cent', 'idle', { show: 1, x: 0.85, z: -0.25, look: -1.2 }]],
      'p2.4': [['paul', 'speak', { to: 'cent' }], ['cent', 'listen']],
      // 천부장이 와서 묻는다
      'p2.5': [['cent', 'idle', { x: 1.0, z: -0.2 }], ['cent', 'speak', { to: 'tribune', delay: 1500 }], ['tribune', 'idle', { x: 0.8, z: -0.32, look: -1.2, delay: 1800 }]],
      'p2.6': [['cent', 'idle', { x: 1.1, z: -0.12, look: -1.2 }], ['tribune', 'speak', { x: 0.8, z: -0.32, to: 'paul' }]],
      'p2.7': [['tribune', 'idle'], ['paul', 'speak', { to: 'tribune' }]],
      'p2.9': [['paul', 'idle'], ['tribune', 'speak', { to: 'paul' }]],
      'p2.10': [['tribune', 'shrug', { look: -1.0 }]],
      // 나면서부터 시민 — 군인들이 놀라 물러선다
      'p2.11': [['tribune', 'idle'], ['paul', 'speak', { to: 'tribune' }]],
      'p2.12': [['s1', 'afraid', { x: 0.15, z: -0.55 }], ['s2', 'afraid', { x: 0.7, z: -0.58 }], ['tribune', 'afraid', { look: -1.2, delay: 600 }], ['cent', 'bow', { delay: 900 }]],
      w0: [['memory', null, { show: 0 }], ['folk', null, { show: 1 }], ['cent', 'idle', { show: 0 }], ['paul', 'speak', { x: 0.45, z: -0.38, look: -0.7, to: 'm1' }], ['tribune', 'idle', { x: 0.88, z: -0.38, look: -1.0 }],
        ['s1', 'idle', { x: 0.2, z: -0.55, look: -0.5 }], ['s2', 'idle', { x: 0.72, z: -0.55, look: -0.6 }],
        ['m1', 'listen', { show: 1, x: -1.05, z: 0.2, look: 2.6 }], ['m2', 'listen', { show: 1, x: -0.65, z: 0.55, look: 2.7 }], ['m3', 'listen', { show: 1, x: -1.35, z: 0.6, look: 2.5 }], ['m4', 'listen', { show: 1, x: -0.3, z: 0.25, look: -2.7 }]],
      w1: [['memory', null, { show: 1 }], ['paul', 'look-up', { look: -0.3 }]],
      w2: [['memory', null, { show: 1 }], ['paul', 'raise', { look: -0.4 }]],
      w3: [['memory', null, { show: 0 }], ['folk', null, { show: 0 }], ['m1', 'idle', { show: 0 }], ['m2', 'idle', { show: 0 }], ['m3', 'idle', { show: 0 }], ['m4', 'idle', { show: 0 }],
        ['paul', 'speak', { x: 0.45, z: -0.4, look: 0, to: 'cent' }], ['s1', 'carry-pole', { x: 0.3, z: -0.4, look: 1.2 }], ['s2', 'carry-pole', { x: 0.6, z: -0.4, look: -1.2 }],
        ['cent', 'listen', { show: 1, x: 0.85, z: -0.25, look: -1.2 }], ['tribune', 'idle', { x: 1.2, z: -0.2, look: -1.3 }]],
      end: [['memory', null, { show: 0 }], ['folk', null, { show: 1 }], ['cent', 'idle', { show: 0 }], ['paul', 'raise', { x: 0.45, z: -0.38, look: -0.7 }], ['s1', 'idle', { x: 0.2, z: -0.55, look: -0.5 }], ['s2', 'idle', { x: 0.72, z: -0.55, look: -0.6 }],
        ['tribune', 'idle', { x: 0.9, z: -0.32, look: -1.2 }], ['m1', 'listen', { show: 1, x: -1.05, z: 0.2, look: 2.6 }], ['m2', 'listen', { show: 1, x: -0.65, z: 0.55, look: 2.7 }],
        ['m3', 'listen', { show: 1, x: -1.35, z: 0.6, look: 2.5 }], ['m4', 'listen', { show: 1, x: -0.3, z: 0.25, look: -2.7 }]],
    },
  },

  /* a32. 조카가 엿들은 음모 — 왼쪽은 공의회(council), 오른쪽은 안토니아 요새의 층계(fortstairs). 바울이 공의회 앞에서 '나는 바리새인' — 의원들이 둘로 갈라 다투고,
     천부장의 군인들이 바울을 요새로 데려간다. 밤, 층계참의 바울 곁에 빛(주님 — 모습 없이)이 서고 '힘을 내라'. 날이 새자 사십여 명이 손을 들어 맹세한다.
     바울의 조카가 와서 귓속말로 알리고, 백부장이 그를 천부장에게 데려간다. 그날 밤 군인들과 말 탄 사람들이 바울을 말에 태워 가이사랴로(왼쪽 위 — 북서) */
  a32: {
    env: 'day',
    wide: 1.5,
    props: {
      council: ['council', CX, CZ, { r: 0.75 }],
      fort: ['fortstairs', 1.15, -0.35, { lh: 0.42, w: 1.9 }],
      lord: ['beam', 1.35, -0.5, { r: 0.3, h: 2.4 }],
      vow: ['crowd', 0.1, 0.55, { spots: [[-0.35, 0.0], [-0.1, 0.15], [0.2, 0.05], [0.45, 0.18], [0.0, -0.15], [0.3, -0.12]], face: 0 }],
      h1: ['horse', 1.85, 0.45, { speed: 0.42 }],
      h2: ['horse', 2.25, 0.62, { speed: 0.42 }],
      h3: ['horse', 2.1, 0.2, { speed: 0.42 }],
    },
    cast: {
      paul: ['paulS', PC[0], PC[1], 3.0],
      hp: ['highpriest', CX, CZ + 0.15 - 0.75 * 0.82 - 0.36, 0, { y: 0.22, pose: 'sit', gaze: false }],
      c1: ['sadducee', C1[0], C1[1], look(C1, PC), { y: 0.12, pose: 'sit', gaze: false }],
      c2: ['sadducee', C2[0], C2[1], look(C2, PC), { y: 0.12, pose: 'sit', gaze: false }],
      c3: ['pharisee', C3[0], C3[1], look(C3, PC), { y: 0.12, pose: 'sit' }],
      c4: ['pharisee', C4[0], C4[1], look(C4, PC), { y: 0.12, pose: 'sit', gaze: false }],
      tribune: ['tribune', -0.25, 0.25, -1.2],
      s1: ['soldier', -0.05, 0.05, -1.2, { gaze: false }],
      cent: ['centurion', 0.05, 0.4, -1.2, { gaze: false }],
      k1: ['jewD', 0.25, 0.4, 3.0, { gaze: false }],
      k2: ['hellenist', -0.1, 0.55, 3.0, { gaze: false }],
      nephew: ['nephew', -2.2, 0.75, 1.3],
      paulR: ['paulS', 0, 0, 1.57, { board: 'h2', pose: 'ride', gaze: false }],
      r1: ['soldier', 0, 0, 1.57, { board: 'h1', pose: 'ride', gaze: false }],
      r2: ['soldier', 0, 0, 1.57, { board: 'h3', pose: 'ride', gaze: false }],
      f1: ['soldier', 1.45, 0.75, -1.3, { gaze: false }],
      f2: ['soldier', 1.65, 0.9, -1.3, { gaze: false }],
    },
    beats: {
      enter: [['@env', 'night'], ['lord', null, { show: 1 }], ['vow', null, { show: 0 }], ['council', null, { show: 0 }], ['hp', 'sit', { show: 0 }], ['c1', 'sit', { show: 0 }], ['c2', 'sit', { show: 0 }], ['c3', 'sit', { show: 0 }], ['c4', 'sit', { show: 0 }], ['h1', null, { show: 0 }], ['h2', null, { show: 0 }], ['h3', null, { show: 0 }],
        ['paulR', 'ride', { show: 0 }], ['r1', 'ride', { show: 0 }], ['r2', 'ride', { show: 0 }], ['f1', 'idle', { show: 0 }], ['f2', 'idle', { show: 0 }], ['k1', 'idle', { show: 0 }], ['k2', 'idle', { show: 0 }],
        ['tribune', 'idle', { show: 0 }], ['s1', 'idle', { show: 0 }], ['cent', 'idle', { show: 0 }], ['nephew', 'idle', { show: 0 }], ['paul', 'kneel', { x: 1.1, z: -0.48, look: 0.6 }]],
      // 천부장이 공의회를 모아 그 앞에 바울을 세운다
      intro: [['@env', 'day'], ['lord', null, { show: 0 }], ['vow', null, { show: 0 }], ['h1', null, { show: 0 }], ['h2', null, { show: 0 }], ['h3', null, { show: 0 }],
        ['paulR', 'ride', { show: 0 }], ['r1', 'ride', { show: 0 }], ['r2', 'ride', { show: 0 }], ['f1', 'idle', { show: 0 }], ['f2', 'idle', { show: 0 }], ['k1', 'idle', { show: 0 }], ['k2', 'idle', { show: 0 }], ['nephew', 'idle', { show: 0 }],
        ['paul', 'idle', { look: 3.0 }]],
      // 사두개인과 바리새인이 섞인 것을 알고 외친다
      'p0.1': [['paul', 'idle', { look: 2.6 }], ['paul', 'idle', { look: -2.6, delay: 1600 }]],
      'p0.2': [['paul', 'speak', { to: 'c3' }], ['c3', 'listen']],
      'p0.3': [['paul', 'raise', { look: 3.0 }]],
      // 공의회가 둘로 갈라 다툰다 — 군인들이 바울을 요새로 데려간다
      'p0.4': [['paul', 'idle'], ['c1', 'rebuke', { y: 0, x: C1[0] + 0.1, z: C1[1] + 0.1 }], ['c3', 'rebuke', { y: 0, x: C3[0], z: C3[1] + 0.12, delay: 400 }], ['c2', 'sit-speak', { to: 'c3', delay: 700 }], ['c4', 'rebuke', { y: 0, x: C4[0] - 0.1, z: C4[1] + 0.1, delay: 900 }],
        ['tribune', 'point', { look: -1.2, delay: 2200 }], ['s1', 'idle', { x: PC[0] + 0.3, z: PC[1] + 0.05, delay: 2400 }],
        ['paul', 'idle', { x: 0.75, z: -0.42, delay: 4500 }], ['s1', 'idle', { x: 0.55, z: -0.25, delay: 4700 }], ['tribune', 'idle', { x: 0.35, z: 0.1, delay: 4800 }], ['cent', 'idle', { x: 0.6, z: 0.3, delay: 4900 }]],
      // 그날 밤 주님께서 곁에 서서 — 빛
      'p1.0': [['@env', 'night'], ['c1', 'idle', { show: 0 }], ['c2', 'idle', { show: 0 }], ['c3', 'idle', { show: 0 }], ['c4', 'idle', { show: 0 }], ['hp', 'sit', { show: 0 }], ['council', null, { show: 0 }],
        ['s1', 'idle', { show: 0 }], ['tribune', 'idle', { show: 0 }], ['cent', 'idle', { show: 0 }], ['paul', 'idle', { x: 1.1, z: -0.48 }], ['paul', 'kneel', { look: 0.6, delay: 3500 }],
        ['lord', null, { show: 1, delay: 4500 }], ['paul', 'look-up', { look: 0.6, delay: 5500 }]],
      'p1.1': [['lord', null, { show: 1 }], ['paul', 'look-up', { x: 1.1, z: -0.48 }]],
      'p1.2': [['paul', 'kneel', { look: 0.6 }]],
      // 날이 새자 사십여 명이 맹세한다
      'p1.3': [['@env', 'dawn'], ['lord', null, { show: 0 }], ['vow', null, { show: 1 }], ['k1', 'raise', { show: 1, x: 0.4, z: 0.45, look: -2.8 }], ['k2', 'raise', { show: 1, x: -0.15, z: 0.5, look: 2.8, delay: 400 }],
        ['paul', 'idle', { look: 0.4 }]],
      // 천부장에게 청해 다시 불러내게 하고, 오는 길에 덮칠 속셈
      'p1.4': [['@env', 'day'], ['k1', 'speak', { to: 'k2' }], ['k2', 'point', { look: 1.5, delay: 1500 }]],
      // 바울의 누이의 아들이 듣고 병영에 들어가 알린다
      'p2.0': [['k1', 'idle'], ['k2', 'idle'], ['nephew', 'idle', { show: 1, x: -0.6, z: 0.75, look: 1.3 }], ['nephew', 'listen', { look: 1.0, delay: 3000 }],
        ['vow', null, { show: 0, delay: 4500 }], ['k1', 'idle', { show: 0, delay: 4500 }], ['k2', 'idle', { show: 0, delay: 4600 }],
        ['nephew', 'idle', { x: 0.85, z: -0.42, delay: 5200 }], ['nephew', 'speak', { look: 1.2, to: 'paul', delay: 9000 }]],
      // 바울이 백부장을 불러 청년을 천부장에게 데려가게 한다
      'p2.1': [['vow', null, { show: 0 }], ['k1', 'idle', { show: 0 }], ['k2', 'idle', { show: 0 }], ['nephew', 'idle', { x: 0.85, z: -0.42, look: 1.2 }],
        ['cent', 'idle', { show: 1, x: 1.6, z: -0.35, look: -1.2 }], ['paul', 'speak', { look: 1.0, to: 'cent', delay: 600 }],
        ['tribune', 'idle', { show: 1, x: -0.35, z: 0.2, look: 1.0, delay: 1500 }], ['cent', 'idle', { x: 0.25, z: 0.2, delay: 3000 }], ['nephew', 'idle', { x: 0.0, z: 0.38, delay: 3300 }]],
      // 청년이 천부장에게 음모를 전한다 — 따로 데려가 묻는다
      'p2.2': [['cent', 'idle', { x: 0.25, z: 0.2, look: -1.2 }], ['tribune', 'idle', { show: 1, x: -0.35, z: 0.2, look: 1.0 }], ['nephew', 'speak', { x: 0.0, z: 0.38, look: -1.2, to: 'tribune' }], ['tribune', 'listen', { delay: 600 }]],
      'p2.3': [['nephew', 'idle'], ['tribune', 'speak', { to: 'nephew' }], ['nephew', 'bow', { delay: 2500 }], ['nephew', 'idle', { x: -2.0, z: 0.8, delay: 3500 }], ['nephew', 'idle', { show: 0, delay: 6500 }]],
      // 그날 밤 — 군사와 마병이 바울을 말에 태워 가이사랴로 (왼쪽 위로 떠나 사라진다)
      'p2.4': [['@env', 'night'], ['nephew', 'idle', { show: 0 }], ['tribune', 'point', { look: -1.3 }], ['paul', 'idle', { x: 1.0, z: 0.25 }], ['paul', 'idle', { show: 0, delay: 2600 }],
        ['h1', null, { show: 1 }], ['h2', null, { show: 1, delay: 400 }], ['h3', null, { show: 1, delay: 200 }], ['r1', 'ride', { show: 1 }], ['paulR', 'ride', { show: 1, delay: 2600 }], ['r2', 'ride', { show: 1, delay: 200 }],
        ['f1', 'idle', { show: 1 }], ['f2', 'idle', { show: 1, delay: 300 }], ['cent', 'idle', { x: 0.65, z: 0.55, look: 1.0 }],
        ['h1', null, { x: -1.8, z: 0.35, delay: 3800 }], ['h2', null, { x: -1.4, z: 0.55, delay: 4000 }], ['h3', null, { x: -1.0, z: 0.2, delay: 4200 }],
        ['f1', 'idle', { x: -1.2, z: 0.85, delay: 3600 }], ['f2', 'idle', { x: -0.8, z: 0.95, delay: 3900 }], ['cent', 'idle', { x: -0.6, z: 0.65, delay: 4400 }],
        ['h1', null, { show: 0, delay: 9800 }], ['h2', null, { show: 0, delay: 10200 }], ['h3', null, { show: 0, delay: 10000 }], ['r1', 'ride', { show: 0, delay: 9800 }], ['paulR', 'ride', { show: 0, delay: 10200 }],
        ['r2', 'ride', { show: 0, delay: 10000 }], ['f1', 'idle', { show: 0, delay: 9000 }], ['f2', 'idle', { show: 0, delay: 9300 }], ['cent', 'idle', { show: 0, delay: 9800 }], ['tribune', 'idle', { delay: 3000 }]],
      w0: [['@env', 'day'], ['lord', null, { show: 0 }], ['council', null, { show: 1 }], ['hp', 'sit', { show: 1, y: 0.22 }], ['paul', 'speak', { show: 1, x: PC[0], z: PC[1], look: 3.0, to: 'c3' }],
        ['c1', 'sit', { show: 1, y: 0.12, x: C1[0], z: C1[1], look: look(C1, PC) }], ['c2', 'sit', { show: 1, y: 0.12, x: C2[0], z: C2[1], look: look(C2, PC) }],
        ['c3', 'sit', { show: 1, y: 0.12, x: C3[0], z: C3[1], look: look(C3, PC) }], ['c4', 'sit', { show: 1, y: 0.12, x: C4[0], z: C4[1], look: look(C4, PC) }],
        ['tribune', 'idle', { show: 1, x: -0.25, z: 0.25, look: -1.2 }], ['s1', 'idle', { show: 1, x: -0.05, z: 0.05, look: -1.2 }], ['cent', 'idle', { show: 0 }], ['nephew', 'idle', { show: 0 }], ['vow', null, { show: 0 }], ['k1', 'idle', { show: 0 }], ['k2', 'idle', { show: 0 }],
        ['h1', null, { show: 0 }], ['h2', null, { show: 0 }], ['h3', null, { show: 0 }], ['paulR', 'ride', { show: 0 }], ['r1', 'ride', { show: 0 }], ['r2', 'ride', { show: 0 }], ['f1', 'idle', { show: 0 }], ['f2', 'idle', { show: 0 }]],
      w1: [['@env', 'night'], ['council', null, { show: 0 }], ['hp', 'sit', { show: 0 }], ['c1', 'sit', { show: 0 }], ['c2', 'sit', { show: 0 }], ['c3', 'sit', { show: 0 }], ['c4', 'sit', { show: 0 }], ['tribune', 'idle', { show: 0 }], ['s1', 'idle', { show: 0 }],
        ['paul', 'look-up', { show: 1, x: 1.1, z: -0.48, look: 0.6 }], ['lord', null, { show: 1 }]],
      w2: [['@env', 'day'], ['lord', null, { show: 0 }], ['paul', 'kneel', { x: 1.1, z: -0.48, look: 0.6 }], ['cent', 'idle', { show: 1, x: 0.25, z: 0.2, look: -1.2 }], ['tribune', 'speak', { show: 1, x: -0.35, z: 0.2, look: 1.0, to: 'nephew' }],
        ['nephew', 'listen', { show: 1, x: 0.0, z: 0.38, look: -1.2 }]],
      end: [['@env', 'night'], ['lord', null, { show: 1 }], ['vow', null, { show: 0 }], ['council', null, { show: 0 }], ['hp', 'sit', { show: 0 }], ['c1', 'sit', { show: 0 }], ['c2', 'sit', { show: 0 }], ['c3', 'sit', { show: 0 }], ['c4', 'sit', { show: 0 }],
        ['h1', null, { show: 0 }], ['h2', null, { show: 0 }], ['h3', null, { show: 0 }], ['paulR', 'ride', { show: 0 }], ['r1', 'ride', { show: 0 }], ['r2', 'ride', { show: 0 }], ['f1', 'idle', { show: 0 }], ['f2', 'idle', { show: 0 }],
        ['k1', 'idle', { show: 0 }], ['k2', 'idle', { show: 0 }], ['tribune', 'idle', { show: 0 }], ['s1', 'idle', { show: 0 }], ['cent', 'idle', { show: 0 }], ['nephew', 'idle', { show: 0 }],
        ['paul', 'look-up', { show: 1, x: 1.1, z: -0.48, look: 0.6 }]],
    },
  },
};

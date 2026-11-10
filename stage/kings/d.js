/* 열왕기 여정 대본 묶음 d: k32–k41 (stage/kings.js가 합친다)
   히스기야가 놋뱀을 부수는 날에서 바벨론 강가의 수금까지 — 남왕국의 끝. 히스기야는 hezekiah → 굵은 베옷의 hezekiahS, 요시야는 josiah → 싸움에 나간 josiahA.
   하나님은 모습 없이 빛(beam)으로만 — 이사야·훌다가 전하는 말씀에 빛이 머문다. 죽음과 폭력은 그리지 않는다:
   앗수르 진영(k35)은 빛이 지나가며 불이 꺼지고 군사들이 사라진다, 요시야(k39)는 그리지 않고 빈 병거가 돌아와 애도,
   성전(k40)은 멀리 불빛과 연기, 시드기야는 손목의 놋사슬로만, 그달리야(k41)는 어둠 속에 사라지고 남은 사람들의 애도로.
   이 묶음에만 쓰는 소품은 stage/kings/props-d.js (asherah·campfires·fetters·vault·prison·ziggurat·shadowstair) */

// 무리(crowd)의 자리: 가운데를 둘러 n명을 흩어 놓는다 (a.js와 같다)
const flock = (n, rx, rz, seed = 1) => Array.from({ length: n }, (_, i) => {
  const a = i * 2.399 + seed, r = Math.sqrt((i + 0.5) / n);
  return [Math.cos(a) * r * rx, Math.sin(a) * r * rz];
});
// 성벽 위에 한 줄로 선 사람들 (성벽 위 높이는 crowd 소품의 y로)
const row = (n, w, seed = 0) => Array.from({ length: n }, (_, i) => [(i / (n - 1) - 0.5) * w + Math.sin(i * 3.1 + seed) * 0.03, Math.sin(i * 1.7 + seed) * 0.02]);

export const D = {
  /* k32. 놋뱀을 부순 왕 — 왼쪽 언덕의 산당(아세라 목상·돌기둥), 가운데 장대 위의 놋뱀(느후스단) 앞에 엎드려 분향하는 사람들.
     오른쪽에서 젊은 왕 히스기야가 호위병들과 들어와, 산당을 헐고 목상을 찍고 돌기둥을 깨뜨린 뒤 놋뱀 앞에 선다. 놋뱀은 조각나 흩어진다.
     끝에 왕이 북쪽(뒤)을 향해 돌아서고, 하늘에 먹구름 */
  k32: {
    env: 'day',
    wide: 1.35,
    props: {
      grass: ['grass', 0, 0.05, { r: 1.9, color: '#a8a070' }],
      rocks: ['rocks', 0, 0, { spots: [[-2.0, 0.5, 0.1], [1.8, -0.7, 0.12]] }],
      hp: ['highplace', -1.45, -0.55, { pole: false, pillar: false }],
      pole: ['asherah', -0.85, -0.6, { dir: 1 }],
      stone: ['asherah', -2.0, -0.3, { kind: 'stone', dir: -1 }],
      snake: ['nehushtan', 0.45, -0.35],
    },
    cast: {
      hezekiah: ['hezekiah', 2.3, 0.45, -1.4, { speed: 0.55 }],
      g1: ['guardJ', 2.55, 0.2, -1.4, { speed: 0.6 }],
      g2: ['guardJ', 2.6, 0.6, -1.4, { speed: 0.6, gaze: false }],
      w1: ['hebrew', 0.25, 0.05, 2.9, { gaze: false }],
      w2: ['woman', 0.7, 0.1, -2.9, { gaze: false }],
      w3: ['hebrew2', 0.95, -0.15, -2.4, { gaze: false }],
    },
    beats: {
      enter: [['hp', 'split'], ['pole', 'down'], ['stone', 'down'], ['snake', 'broken'], ['hezekiah', 'rebuke', { x: 1.0, z: 0.1, look: -1.9 }],
        ['g1', 'idle', { x: -0.55, z: -0.25, look: -1.6 }], ['g2', 'idle', { x: -1.6, z: -0.05, look: -1.6 }],
        ['w1', 'afraid', { x: 0.05, z: 0.45, look: 0.8 }], ['w2', 'afraid', { x: 0.45, z: 0.55, look: 0.4 }], ['w3', 'idle', { x: 1.55, z: 0.55, look: -0.9 }]],
      // 향 연기가 놋뱀 둘레를 감돈다 — 그 앞에 엎드린 사람들
      intro: [['@env', 'day'], ['hp', 'idle'], ['pole', 'stand'], ['stone', 'stand'], ['snake', 'stand'], ['hezekiah', 'idle', { show: 0 }], ['g1', 'idle', { show: 0 }], ['g2', 'idle', { show: 0 }],
        ['w1', 'kneel'], ['w2', 'kneel'], ['w3', 'idle', { look: -2.4 }]],
      'p0.1': [['w1', 'bow'], ['w2', 'bow', { delay: 500 }], ['w3', 'kneel', { delay: 900 }]],
      // 스물다섯 살의 왕이 그 앞에 선다
      'p0.3': [['hezekiah', 'idle', { show: 1, x: 1.45, z: 0.25, look: -1.9 }], ['g1', 'idle', { show: 1, x: 1.85, z: 0.0, look: -1.6 }], ['g2', 'idle', { show: 1, x: 1.95, z: 0.5, look: -1.6 }]],
      'p0.4': [['hezekiah', 'idle', { look: -2.1 }]],
      // 먼저 산당을 헌다
      'p1.0': [['hezekiah', 'point', { look: -1.75 }], ['g1', 'idle', { x: -1.1, z: -0.15, look: -2.4 }], ['g2', 'idle', { x: -1.75, z: 0.05, look: -2.6 }], ['hp', 'split', { delay: 3600 }]],
      // 돌기둥을 깨뜨리고 아세라 목상을 찍어 넘긴다
      'p1.1': [['hezekiah', 'idle', { look: -1.9 }], ['g1', 'idle', { x: -0.62, z: -0.35, look: -2.2 }], ['g2', 'idle', { x: -1.75, z: -0.1, look: -2.4 }], ['pole', 'down', { delay: 1800 }], ['stone', 'down', { delay: 2400 }]],
      // 그리고 놋뱀 앞에 — 엎드렸던 사람들이 물러선다
      'p1.2': [['hezekiah', 'idle', { x: 1.0, z: 0.1, look: -1.9 }], ['w1', 'afraid', { x: 0.05, z: 0.45, look: 0.8 }], ['w2', 'afraid', { x: 0.45, z: 0.55, look: 0.4 }], ['w3', 'idle', { x: 1.55, z: 0.55, look: -0.9 }]],
      'p1.3': [['hezekiah', 'speak', { to: 'w1' }]],
      // 산산이 부수고 '느후스단' — 놋 조각일 뿐
      'p1.4': [['hezekiah', 'rebuke', { look: -1.9 }], ['snake', 'broken', { delay: 600 }], ['g1', 'idle', { x: -0.55, z: -0.25, look: -1.6 }], ['g2', 'idle', { x: -1.6, z: -0.05, look: -1.6 }]],
      'p1.5': [['hezekiah', 'speak', { to: 'w2' }]],
      // 이스라엘의 하나님 여호와를 의지한 왕
      'p2.0': [['hezekiah', 'pray', { look: -0.4 }], ['w1', 'idle'], ['w2', 'idle']],
      'p2.2': [['hezekiah', 'raise', { look: 0 }]],
      // 앗수르를 섬기지 않겠다고 — 북쪽(뒤)으로 돌아선다
      'p2.3': [['hezekiah', 'idle', { x: 0.95, z: 0.3, look: 3.0 }], ['g1', 'idle', { x: 0.45, z: 0.35, look: 2.9 }], ['g2', 'idle', { x: 1.45, z: 0.45, look: 3.1 }]],
      // 북쪽 하늘에 먹구름
      'p2.4': [['@env', 'overcast']],
      w0: [['hezekiah', 'pray', { look: -0.4 }]],
      w1: [['snake', 'broken'], ['hezekiah', 'point', { x: 1.0, z: 0.1, look: -1.9 }]],
      w2: [['hezekiah', 'raise', { look: 0 }]],
      end: [['@env', 'overcast'], ['hezekiah', 'idle', { x: 0.95, z: 0.3, look: 3.0 }]],
    },
  },

  /* k33. 랍사게의 조롱 — 뒤로 예루살렘 성벽(가운데 문)과 그 위에 숨죽인 백성, 앞으로 윗못의 물길.
     오른쪽에 늘어선 앗수르 군대(뾰족 투구)와 높은 관의 장수 랍사게. 성문에서 엘리아김·셉나·요아가 나와 맞선다.
     랍사게는 엘리아김에게, 그다음 성벽 위 백성에게 외친다. 성벽 위는 대답이 없고, 세 신하는 성으로 돌아간다 */
  k33: {
    env: 'day',
    wide: 1.35,
    props: {
      grass: ['grass', 0.3, 0.15, { r: 1.9, color: '#a8a070' }],
      wall: ['kwall', -0.6, -0.75, { scale: 0.85, w: 2.8 }],
      folk: ['crowd', -0.6, -0.76, { y: 0.595, spots: row(9, 2.2), face: 0 }],
      brook: ['brook', -0.3, 0.6, { len: 2.6 }],
    },
    cast: {
      rabshakeh: ['rabshakeh', 1.0, 0.2, -1.5],
      tartan: ['assyrian2', 1.55, -0.1, -1.5, { gaze: false }],
      a1: ['assyrian', 1.9, 0.25, -1.5, { gaze: false }],
      a2: ['assyrian', 2.2, -0.15, -1.5, { gaze: false }],
      a3: ['assyrian', 2.35, 0.45, -1.5, { gaze: false }],
      a4: ['assyrian2', 1.6, 0.55, -1.5, { gaze: false }],
      eliakim: ['eliakim', -0.6, -0.55, 0, { speed: 0.5 }],
      shebna: ['shebna', -0.6, -0.55, 0, { speed: 0.5 }],
      joah: ['official', -0.6, -0.55, 0, { speed: 0.5 }],
      hezekiah: ['hezekiah', -0.6, -0.55, 0],
    },
    beats: {
      enter: [['rabshakeh', 'raise', { x: 0.75, z: 0.1, look: -2.3 }], ['eliakim', 'listen', { x: -0.35, z: 0.0, look: 1.5 }], ['shebna', 'idle', { x: -0.7, z: 0.1, look: 1.4 }], ['joah', 'idle', { x: -0.05, z: 0.15, look: 1.6 }], ['hezekiah', 'idle', { show: 0 }]],
      // 윗못 물길 곁 큰길에 늘어선 앗수르 대군
      intro: [['@env', 'day'], ['folk', null, { show: 0 }], ['eliakim', 'idle', { show: 0 }], ['shebna', 'idle', { show: 0 }], ['joah', 'idle', { show: 0 }], ['hezekiah', 'idle', { show: 0 }], ['rabshakeh', 'idle', { look: -1.5 }]],
      'p0.1': [['rabshakeh', 'idle', { x: 0.75, z: 0.1, look: -1.8 }], ['tartan', 'idle', { x: 1.25, z: -0.05 }]],
      // 성 안에서 세 신하가 걸어 나온다
      'p0.2': [['eliakim', 'idle', { show: 1, x: -0.35, z: 0.0, look: 1.5 }], ['shebna', 'idle', { show: 1, x: -0.7, z: 0.1, look: 1.4, delay: 500 }], ['joah', 'idle', { show: 1, x: -0.05, z: 0.15, look: 1.6, delay: 1000 }]],
      // 성벽 위 숨죽인 백성
      'p0.3': [['folk', null, { show: 1 }]],
      'p1.0': [['rabshakeh', 'speak', { to: 'eliakim' }]],
      'p1.2': [['rabshakeh', 'rebuke', { look: -1.6 }]],
      'p1.3': [['rabshakeh', 'speak', { to: 'eliakim' }]],
      'p1.4': [['rabshakeh', 'point', { look: -2.2 }]],
      // 엘리아김이 다급히 — 아람 말로
      'p1.5': [['rabshakeh', 'idle', { look: -1.6 }], ['eliakim', 'speak', { to: 'rabshakeh', x: -0.2, z: 0.05 }]],
      'p1.7': [['eliakim', 'point', { look: -2.6 }]],
      // 랍사게가 성벽 위로 더 크게
      'p1.8': [['eliakim', 'idle', { look: 1.5 }], ['rabshakeh', 'raise', { x: 0.6, z: 0.0, look: -2.3 }]],
      'p2.0': [['rabshakeh', 'rebuke', { look: -2.3 }]],
      'p2.1': [['rabshakeh', 'raise', { look: -2.4 }]],
      'p2.2': [['rabshakeh', 'rebuke', { look: -2.2 }]],
      'p2.3': [['rabshakeh', 'raise', { look: -2.4 }]],
      'p2.4': [['rabshakeh', 'point', { look: -2.3 }]],
      // 성벽 위는 조용하다 — 왕이 대답하지 말라 했다
      'p2.5': [['rabshakeh', 'idle', { look: -2.3 }], ['eliakim', 'listen'], ['shebna', 'listen']],
      // 옷을 찢은 채 성으로 돌아간다
      'p2.7': [['eliakim', 'mourn'], ['shebna', 'mourn', { delay: 300 }], ['joah', 'mourn', { delay: 500 }],
        ['eliakim', 'idle', { x: -0.6, z: -0.55, delay: 2400 }], ['shebna', 'idle', { x: -0.6, z: -0.55, delay: 2700 }], ['joah', 'idle', { x: -0.6, z: -0.55, delay: 3000 }],
        ['eliakim', 'idle', { show: 0, delay: 5000 }], ['shebna', 'idle', { show: 0, delay: 5400 }], ['joah', 'idle', { show: 0, delay: 5800 }]],
      w0: [['rabshakeh', 'speak', { x: 0.75, z: 0.1, to: 'eliakim' }], ['eliakim', 'idle', { show: 1, x: -0.35, z: 0.0, look: 1.5 }], ['shebna', 'idle', { show: 1, x: -0.7, z: 0.1, look: 1.4 }], ['joah', 'idle', { show: 1, x: -0.05, z: 0.15, look: 1.6 }]],
      w1: [['rabshakeh', 'raise', { look: -2.3 }]],
      w2: [['rabshakeh', 'idle', { look: -1.6 }], ['eliakim', 'speak', { to: 'rabshakeh' }]],
      // 왕의 명령 — 성문 안에서
      w3: [['eliakim', 'listen', { look: -2.8 }], ['hezekiah', 'speak', { show: 1, x: -1.0, z: -0.38, to: 'eliakim' }]],
      end: [['hezekiah', 'idle', { show: 0 }], ['rabshakeh', 'raise', { x: 0.6, z: 0.0, look: -2.3 }], ['eliakim', 'mourn', { show: 1, x: -0.35, z: 0.0, look: 1.5 }]],
    },
  },

  /* k34. 성전에 펼친 편지 — 솔로몬의 성전(stemple) 앞뜰, 오른쪽 뒤에 이사야의 집. 굵은 베옷의 히스기야가 성전에 들고,
     신하들은 이사야에게 간다 — 이사야가 전하는 말씀에 빛이 머문다. 앗수르의 전령이 편지를 가져오고, 왕은 그것을 성전 문 앞에 펼쳐 놓고 꿇어 기도한다.
     이사야가 찾아와 응답을 전하고(빛), 시온의 노래에 뜰이 밝아진다 */
  k34: {
    env: 'overcast',
    wide: 1.35,
    props: {
      temple: ['stemple', -0.55, -0.55, { scale: 0.85 }],
      house: ['house', 1.85, -0.6, { scale: 0.62 }],
      letter: ['lawscroll', -0.55, -0.3, { letter: true }],
      beam: ['beam', 1.5, -0.05, { r: 0.32, h: 2.4, on: 'isaiah' }],
    },
    cast: {
      hezekiah: ['hezekiahS', 1.1, 0.5, -1.2, { speed: 0.5 }],
      eliakim: ['eliakim', 0.6, 0.45, -1.0, { speed: 0.5 }],
      shebna: ['shebna', 0.85, 0.62, -1.0, { speed: 0.5, gaze: false }],
      elder: ['elder', 0.35, 0.6, -1.0, { speed: 0.5, gaze: false }],
      isaiah: ['isaiah', 1.5, -0.05, -1.2, { speed: 0.5 }],
      envoy: ['assyrian2', 2.5, 0.5, -1.5, { speed: 0.6 }],
    },
    beats: {
      enter: [['@env', 'glory'], ['letter', null, { show: 1 }], ['hezekiah', 'kneel', { x: -0.55, z: -0.12, look: 3.14 }], ['isaiah', 'speak', { x: 0.35, z: -0.02, to: 'hezekiah' }], ['beam', null, { show: 1 }],
        ['eliakim', 'pray', { x: 0.8, z: 0.3, look: -2.2 }], ['shebna', 'pray', { x: 1.05, z: 0.5, look: -2.3 }], ['elder', 'pray', { x: -1.4, z: 0.3, look: 2.4 }], ['envoy', 'idle', { show: 0 }]],
      // 굵은 베옷을 걸친 왕이 성전으로
      intro: [['@env', 'overcast'], ['letter', null, { show: 0 }], ['beam', null, { show: 0 }], ['envoy', 'idle', { show: 0 }], ['isaiah', 'idle', { look: -1.2 }]],
      'p0.0': [['hezekiah', 'idle', { x: -0.55, z: -0.12, look: 3.14 }], ['hezekiah', 'kneel', { delay: 4200 }], ['eliakim', 'idle', { x: 0.25, z: 0.3, look: -2.0 }]],
      // 신하들과 늙은 제사장들을 이사야에게
      'p0.1': [['eliakim', 'idle', { x: 1.05, z: 0.15, look: 1.6 }], ['shebna', 'idle', { x: 1.3, z: 0.4, look: 1.9, delay: 400 }], ['elder', 'idle', { x: 0.85, z: 0.42, look: 1.4, delay: 700 }], ['isaiah', 'idle', { look: -1.6 }]],
      'p0.2': [['eliakim', 'speak', { to: 'isaiah' }]],
      'p0.3': [['eliakim', 'shrug', { to: 'isaiah' }]],
      // 이사야가 대답한다 — 여호와의 말씀에 빛이 머문다
      'p0.4': [['eliakim', 'listen'], ['isaiah', 'speak', { to: 'eliakim' }]],
      'p0.5': [['beam', null, { show: 1 }], ['isaiah', 'look-up']],
      'p0.6': [['isaiah', 'speak', { to: 'eliakim' }]],
      // 얼마 뒤 앗수르 왕의 편지 — 신하들은 뜰로 돌아오고, 전령이 편지를 들고 온다
      'p1.0': [['beam', null, { show: 0 }], ['isaiah', 'idle', { look: -1.2 }], ['eliakim', 'idle', { x: 0.8, z: 0.3, look: -1.6 }], ['shebna', 'idle', { x: 1.05, z: 0.5, look: -1.8 }], ['elder', 'idle', { x: -1.4, z: 0.3, look: 1.4 }],
        ['hezekiah', 'idle', { x: -0.3, z: 0.15, look: 1.4 }], ['envoy', 'idle', { show: 1, x: 0.5, z: 0.3, look: -1.6, item: 'scroll' }]],
      'p1.1': [['envoy', 'speak', { to: 'hezekiah' }]],
      'p1.2': [['envoy', 'speak', { to: 'hezekiah' }], ['envoy', 'idle', { item: null, delay: 2200 }], ['hezekiah', 'idle', { item: 'scroll', delay: 2300 }]],
      // 편지를 들고 성전에 올라가 여호와 앞에 펼친다
      'p1.3': [['envoy', 'idle', { x: 2.6, z: 0.55 }], ['envoy', 'idle', { show: 0, delay: 3200 }], ['hezekiah', 'idle', { x: -0.55, z: -0.12, look: 3.14 }],
        ['hezekiah', 'kneel', { item: null, delay: 2400 }], ['letter', null, { show: 1, delay: 2600 }]],
      'p1.4': [['hezekiah', 'kneel', { item: null, x: -0.55, z: -0.12, look: 3.14 }], ['letter', null, { show: 1 }], ['envoy', 'idle', { show: 0 }]],
      'p1.5': [['hezekiah', 'look-up']],
      'p1.6': [['hezekiah', 'pray']],
      'p1.7': [['hezekiah', 'kneel']],
      // 이사야가 말을 보낸다 — 응답의 빛
      'p2.0': [['isaiah', 'idle', { x: 0.35, z: -0.02, look: -2.4 }]],
      'p2.1': [['beam', null, { show: 1 }]],
      'p2.2': [['isaiah', 'speak', { to: 'hezekiah' }], ['hezekiah', 'kneel', { look: 2.4 }]],
      'p2.4': [['isaiah', 'raise']],
      // 시온의 노래 — 뜰이 밝아진다
      'p2.5': [['@env', 'glory'], ['isaiah', 'idle']],
      'p2.6': [['eliakim', 'pray', { look: -2.2 }], ['shebna', 'pray', { look: -2.3 }], ['elder', 'pray', { look: 2.4 }]],
      'p2.7': [['hezekiah', 'pray', { look: 3.14 }]],
      w0: [['beam', null, { show: 1 }], ['isaiah', 'speak', { x: 0.35, z: -0.02, to: 'hezekiah' }]],
      w1: [['isaiah', 'speak', { to: 'hezekiah' }]],
      w2: [['beam', null, { show: 0 }], ['isaiah', 'idle'], ['hezekiah', 'speak', { look: 3.14 }]],
      end: [['@env', 'glory'], ['beam', null, { show: 1 }], ['isaiah', 'idle', { x: 0.35, z: -0.02, look: -2.4 }], ['hezekiah', 'kneel', { look: 3.14 }]],
    },
  },

  /* k35. 앗수르 진영의 밤 — 왼쪽 뒤 예루살렘 성벽 위에 숨죽인 사람들(히스기야와 이사야), 오른쪽 들판에 앗수르의 군막과 모닥불, 불가의 군사들.
     그 밤 여호와의 사자 — 빛이 진영을 가로질러 지나가고, 지나간 자리마다 불이 꺼지고 군사들이 사라진다. 이른 아침 빈 군막만 남고, 산헤립이 물러가 군막도 걷힌다 */
  k35: {
    env: 'night',
    wide: 1.4,
    props: {
      grass: ['grass', 0.6, 0.1, { r: 1.9, color: '#9a9a6a' }],
      wall: ['kwall', -1.55, -0.75, { scale: 0.85, w: 1.8 }],
      folk: ['crowd', -1.55, -0.76, { y: 0.595, spots: row(5, 1.0, 2), face: 0.5 }],
      camp1: ['camp', 1.15, -0.8, { n: 6, span: 1.15, color: '#6a6c7e', flag: '#9d3328', scale: 1.8 }],
      camp2: ['camp', 1.5, -0.4, { n: 4, span: 0.7, color: '#5c5e70', flag: '#9d3328', scale: 1.6 }],
      fires: ['campfires', 0, 0, { spots: [[0.25, -0.35], [0.85, 0.15], [1.55, 0.05], [2.35, -0.1], [1.15, 0.5]], sweep: 2.6 }],
      angel: ['beam', -0.2, -0.1, { r: 0.4, h: 2.8, peak: 0.5, speed: 0.38 }],
    },
    cast: {
      hezekiah: ['hezekiahS', -1.75, -0.74, 0.4, { y: 0.595 }],
      isaiah: ['isaiah', -1.35, -0.74, 0.6, { y: 0.595 }],
      s1: ['assyrian', 0.4, -0.15, 2.4, { gaze: false, pose: 'sit-ground' }],
      s2: ['assyrian2', 0.75, 0.32, -0.6, { gaze: false }],
      s3: ['assyrian', 1.45, 0.25, 1.6, { gaze: false, pose: 'sit-ground' }],
      s4: ['assyrian', 2.05, 0.08, -2.2, { gaze: false }],
      s5: ['assyrian2', 2.55, -0.3, -1.4, { gaze: false, pose: 'sit-ground' }],
      s6: ['assyrian', 1.3, 0.65, 0.2, { gaze: false }],
    },
    beats: {
      enter: [['@env', 'night'], ['fires', 'out'], ['angel', null, { show: 1, x: 1.3, z: -0.05 }], ['s1', 'idle', { show: 0 }], ['s2', 'idle', { show: 0 }], ['s3', 'idle', { show: 0 }], ['s4', 'idle', { show: 0 }], ['s5', 'idle', { show: 0 }], ['s6', 'idle', { show: 0 }],
        ['hezekiah', 'pray'], ['isaiah', 'look-up']],
      // 숨죽인 성과, 아직 진을 친 앗수르의 대군
      intro: [['@env', 'night'], ['fires', 'lit'], ['angel', null, { show: 0 }], ['camp1', null, { show: 1 }], ['camp2', null, { show: 1 }],
        ['s1', 'sit-ground', { look: 2.4 }], ['s3', 'sit-ground', { look: 1.6 }], ['s5', 'sit-ground', { look: -1.4 }], ['hezekiah', 'idle', { look: 0.4 }], ['isaiah', 'idle', { look: 0.6 }]],
      'p0.1': [['s2', 'idle', { x: 0.65, z: 0.3, look: -2.2 }], ['s4', 'idle', { look: -1.8 }]],
      // 이사야가 전한 한마디
      'p0.2': [['isaiah', 'speak', { to: 'hezekiah' }]],
      'p0.3': [['isaiah', 'point', { look: 1.2 }]],
      'p0.4': [['isaiah', 'idle', { look: 0.8 }], ['hezekiah', 'pray', { look: 0.6 }]],
      // 바로 그 밤 — 여호와의 사자. 빛이 진영을 가로질러 지나가고, 불이 꺼지고 군사들이 사라진다
      'p1.0': [['angel', null, { show: 1 }], ['angel', null, { x: 2.5, z: -0.1, delay: 1200 }], ['fires', 'out', { delay: 1200 }],
        ['s1', 'idle', { show: 0, delay: 2600 }], ['s2', 'idle', { show: 0, delay: 3600 }], ['s6', 'idle', { show: 0, delay: 4600 }], ['s3', 'idle', { show: 0, delay: 5200 }],
        ['s4', 'idle', { show: 0, delay: 6200 }], ['s5', 'idle', { show: 0, delay: 7000 }], ['angel', null, { show: 0, delay: 8600 }]],
      // 이른 아침 — 빈 진영
      'p1.1': [['@env', 'dawn'], ['angel', null, { show: 0 }], ['fires', 'out'], ['s1', 'idle', { show: 0 }], ['s2', 'idle', { show: 0 }], ['s3', 'idle', { show: 0 }], ['s4', 'idle', { show: 0 }], ['s5', 'idle', { show: 0 }], ['s6', 'idle', { show: 0 }],
        ['hezekiah', 'idle', { look: 0.9 }], ['isaiah', 'idle', { look: 1.0 }]],
      'p1.3': [['@env', 'overcast'], ['hezekiah', 'idle', { look: 1.1 }]],
      // 산헤립이 군대를 거두어 돌아간다 — 군막이 걷힌다
      'p2.0': [['@env', 'day'], ['camp2', null, { show: 0 }], ['camp1', null, { show: 0, delay: 1500 }]],
      // 멈추고, 내가 하나님인 줄 알아라
      'p2.2': [['hezekiah', 'pray', { look: 0.4 }], ['isaiah', 'idle', { look: 0.6 }]],
      'p2.3': [['hezekiah', 'raise', { look: 0.3 }], ['isaiah', 'pray']],
      w0: [['@env', 'night'], ['angel', null, { show: 1, x: 1.3, z: -0.05 }], ['fires', 'out']],
      w1: [['angel', null, { show: 0 }], ['isaiah', 'speak', { to: 'hezekiah' }]],
      w2: [['@env', 'day'], ['camp1', null, { show: 0 }], ['camp2', null, { show: 0 }], ['isaiah', 'idle']],
      end: [['@env', 'day'], ['angel', null, { show: 0 }], ['camp1', null, { show: 0 }], ['camp2', null, { show: 0 }], ['hezekiah', 'raise', { look: 0.3 }], ['isaiah', 'pray']],
    },
  },

  /* k36. 뒤로 물러간 해 그림자 — 왼쪽 왕궁 방(hall)의 침상에 앓아누운 히스기야, 오른쪽 뜰에 윗방으로 오르는 아하스의 계단(해시계).
     이사야가 와서 말하고 나가자 왕은 벽 쪽으로 돌아앉아 운다. 뜰을 나서던 이사야에게 말씀이 임하고(빛), 돌아와 전한다.
     무화과 반죽으로 왕이 일어나고, 이사야가 부르짖자 층계를 덮었던 그림자가 열 층계 뒤로 물러간다 */
  k36: {
    env: 'dusk',
    wide: 1.35,
    props: {
      hall: ['hall', -0.75, -0.05, { w: 1.9, throne: false, lamp: -0.72 }],
      couch: ['couch', -0.85, -0.38],
      stair: ['shadowstair', 1.45, -0.4, { scale: 1.15 }],
      beam: ['beam', 1.0, 0.5, { r: 0.32, h: 2.4, on: 'isaiah' }],
    },
    cast: {
      hezekiah: ['hezekiah', -0.85, -0.38, 0.2, { y: 0.0, pose: 'sleep' }],
      servant: ['servant', -1.45, 0.15, 0.9, { gaze: false }],
      isaiah: ['isaiah', 2.3, 0.5, -1.5, { speed: 0.5 }],
    },
    beats: {
      enter: [['stair', 'back'], ['hezekiah', 'idle', { x: 0.55, z: 0.35, y: 0, look: 1.4 }], ['isaiah', 'raise', { x: 0.95, z: 0.55, look: 1.2 }], ['beam', null, { show: 0 }], ['servant', 'idle', { x: -0.3, z: 0.4, look: 1.2 }]],
      // 병들어 누운 왕
      intro: [['@env', 'dusk'], ['stair', 'fwd'], ['beam', null, { show: 0 }], ['isaiah', 'idle', { show: 0 }], ['hezekiah', 'sleep', { y: 0.13, look: -0.05 }], ['servant', 'idle', { look: 0.9 }]],
      // 이사야가 와서 말한다
      'p0.1': [['isaiah', 'idle', { show: 1, x: -0.15, z: 0.12, look: -1.9 }]],
      'p0.3': [['isaiah', 'speak', { to: 'hezekiah' }]],
      'p0.4': [['isaiah', 'speak', { to: 'hezekiah' }], ['hezekiah', 'sit', { y: 0.13, look: 1.1 }]],
      // 얼굴을 벽 쪽으로 — 이사야는 나간다
      'p0.5': [['hezekiah', 'sit', { look: 3.14 }], ['isaiah', 'idle', { x: 0.95, z: 0.55, look: 1.2 }]],
      'p0.6': [['hezekiah', 'sit', { y: 0.13 }]],
      'p0.7': [['hezekiah', 'sit'], ['servant', 'listen', { look: 1.6 }]],
      'p0.8': [['hezekiah', 'sit', { y: 0.13, look: 3.0 }]],
      // 가운데 뜰을 다 나서기 전에 — 말씀이 임한다 (빛)
      'p1.0': [['hezekiah', 'sit'], ['beam', null, { show: 1 }], ['isaiah', 'look-up', { look: 0.4 }]],
      'p1.2': [['isaiah', 'idle', { x: -0.15, z: 0.12, look: -1.9 }]],
      'p1.3': [['isaiah', 'speak', { to: 'hezekiah' }], ['hezekiah', 'sit', { look: 1.1 }]],
      'p1.4': [['isaiah', 'speak', { to: 'hezekiah' }]],
      'p1.6': [['isaiah', 'bless', { look: -1.9 }]],
      // 무화과 반죽 — 왕이 낫는다
      'p2.0': [['beam', null, { show: 0 }], ['isaiah', 'idle', { item: 'bread', x: -0.35, z: 0.05, look: -2.0 }], ['isaiah', 'idle', { item: null, delay: 2600 }],
        ['hezekiah', 'idle', { y: 0, x: -0.6, z: 0.08, look: 1.2, delay: 3200 }]],
      // 표징을 묻는다 — 계단 곁으로
      'p2.1': [['hezekiah', 'idle', { y: 0, x: 0.55, z: 0.35, look: 1.4 }], ['isaiah', 'idle', { item: null, x: 0.95, z: 0.55, look: -1.8 }], ['servant', 'idle', { x: -0.3, z: 0.4, look: 1.2 }]],
      'p2.2': [['hezekiah', 'speak', { to: 'isaiah' }]],
      'p2.4': [['isaiah', 'point', { look: 1.2 }]],
      'p2.5': [['isaiah', 'idle', { look: -1.6 }], ['hezekiah', 'speak', { to: 'isaiah' }]],
      'p2.6': [['hezekiah', 'point', { look: 1.4 }]],
      // 이사야가 부르짖자 — 그림자가 열 층계 뒤로
      'p2.7': [['hezekiah', 'idle', { look: 1.4 }], ['isaiah', 'raise', { look: 1.2 }], ['stair', 'back', { delay: 800 }], ['hezekiah', 'look-up', { delay: 4000 }]],
      w0: [['beam', null, { show: 1 }], ['isaiah', 'speak', { show: 1, to: 'hezekiah' }]],
      w1: [['beam', null, { show: 0 }], ['isaiah', 'speak', { to: 'hezekiah' }]],
      w2: [['isaiah', 'idle'], ['hezekiah', 'speak', { to: 'isaiah' }]],
      end: [['stair', 'back'], ['beam', null, { show: 0 }], ['isaiah', 'raise', { look: 1.2 }], ['hezekiah', 'look-up', { look: 1.4 }]],
    },
  },

  /* k37. 바벨론 사신에게 보인 보물 — 왕궁 안(hall)의 왕좌, 오른쪽 뒤로 보물 창고의 시렁(vault)과 금·은 그릇.
     청금석빛 옷의 바벨론 사신 둘이 편지와 예물을 들고 오른쪽(동쪽)에서 들어오고, 기뻐하는 왕이 그들을 창고로 데려가 하나하나 보인다.
     사신들이 떠난 뒤 이사야가 와서 묻고, 바벨론으로 옮겨질 날을 말한다 */
  k37: {
    env: 'day',
    wide: 1.35,
    props: {
      hall: ['hall', -0.1, -0.05, { w: 3.0, tx: -0.95, lamp: -1.3 }],
      vault: ['vault', 0.85, -0.52, { w: 1.5 }],
      treasure: ['treasure', 0.55, -0.05],
      gold: ['tribute', 1.25, 0.0, { kind: 'gold', scale: 0.85 }],
    },
    cast: {
      hezekiah: ['hezekiah', -1.05, -0.47, 0.3, { y: 0.27, pose: 'sit' }],
      courtier: ['courtier', -1.3, -0.15, 0.8, { gaze: false }],
      env1: ['babenvoy', 2.3, 0.35, -1.5, { speed: 0.5 }],
      env2: ['babenvoy', 2.55, 0.55, -1.5, { speed: 0.5 }],
      isaiah: ['isaiah', 2.4, 0.4, -1.5, { speed: 0.5 }],
    },
    beats: {
      enter: [['hezekiah', 'shrug', { y: 0, x: 0.0, z: 0.15, look: 2.6 }], ['env1', 'idle', { x: -0.4, z: 0.35, look: 2.5 }], ['env2', 'idle', { x: 1.85, z: 0.25, look: -2.4 }], ['isaiah', 'idle', { show: 0 }]],
      // 왕좌의 왕 — 먼 나라의 사신들이 들어온다
      intro: [['@env', 'day'], ['env1', 'idle', { show: 0 }], ['env2', 'idle', { show: 0 }], ['isaiah', 'idle', { show: 0 }], ['hezekiah', 'sit', { y: 0.27, look: 0.3 }]],
      'p0.0': [['env1', 'idle', { show: 1, x: -0.45, z: 0.12, look: -2.2, item: 'scroll' }], ['env2', 'idle', { show: 1, x: -0.15, z: 0.3, look: -2.1, item: 'gift', delay: 400 }], ['hezekiah', 'sit', { look: 0.8 }]],
      'p0.1': [['env1', 'bow'], ['env2', 'bow', { delay: 300 }]],
      'p0.2': [['env1', 'speak', { to: 'hezekiah' }], ['env2', 'idle']],
      // 기뻐하며 듣는다
      'p0.3': [['env1', 'speak', { to: 'hezekiah', item: null }], ['hezekiah', 'sit-speak', { to: 'env1' }]],
      // 보물 창고로 데려간다
      'p1.0': [['env2', 'idle', { item: null }], ['hezekiah', 'idle', { y: 0, x: 0.0, z: 0.15, look: 2.6 }], ['env1', 'idle', { x: -0.4, z: 0.35, look: 2.5 }], ['env2', 'idle', { x: 1.85, z: 0.25, look: -2.4, delay: 300 }]],
      'p1.1': [['hezekiah', 'point', { look: 2.7 }]],
      'p1.2': [['hezekiah', 'shrug', { look: 2.2 }]],
      // 사신들의 눈이 구석구석을 훑는다
      'p1.3': [['hezekiah', 'idle', { look: 1.6 }], ['env1', 'idle', { look: 2.2 }], ['env2', 'idle', { look: -2.0 }], ['env1', 'idle', { look: 2.8, delay: 1600 }], ['env2', 'idle', { look: -2.7, delay: 2000 }]],
      // 사신들이 떠나고 이사야가 찾아온다
      'p1.4': [['env1', 'idle', { x: 2.5, z: 0.4 }], ['env2', 'idle', { x: 2.7, z: 0.6 }], ['env1', 'idle', { show: 0, delay: 3800 }], ['env2', 'idle', { show: 0, delay: 3800 }],
        ['isaiah', 'idle', { show: 1, x: 0.85, z: 0.4, look: -1.8, delay: 3000 }], ['hezekiah', 'idle', { look: 1.6, delay: 3000 }]],
      'p2.0': [['env1', 'idle', { show: 0 }], ['env2', 'idle', { show: 0 }], ['isaiah', 'idle', { show: 1, x: 0.85, z: 0.4, look: -1.8 }]],
      'p2.1': [['isaiah', 'speak', { to: 'hezekiah' }]],
      'p2.3': [['isaiah', 'listen'], ['hezekiah', 'shrug', { to: 'isaiah' }]],
      // 바벨론으로 옮겨질 날이 온다
      'p2.4': [['@env', 'overcast'], ['hezekiah', 'idle', { look: 1.6 }], ['isaiah', 'speak', { to: 'hezekiah' }]],
      'p2.5': [['isaiah', 'point', { look: 2.6 }]],
      'p2.6': [['isaiah', 'rebuke', { look: -1.8 }]],
      'p2.8': [['isaiah', 'idle'], ['hezekiah', 'speak', { to: 'isaiah' }]],
      'p2.9': [['hezekiah', 'idle', { look: 2.8 }]],
      w0: [['@env', 'overcast'], ['isaiah', 'speak', { show: 1, x: 0.85, z: 0.4, to: 'hezekiah' }]],
      w1: [['isaiah', 'listen'], ['hezekiah', 'speak', { to: 'isaiah' }]],
      w2: [['hezekiah', 'speak', { to: 'isaiah' }]],
      end: [['@env', 'overcast'], ['isaiah', 'idle', { show: 1, x: 0.85, z: 0.4, look: -1.8 }], ['hezekiah', 'idle', { look: 2.8 }]],
    },
  },

  /* k38. 성전에서 찾은 율법책 — 왼쪽 뒤 수리 중인 성전(백향목과 다듬은 돌), 그 앞에서 대제사장 힐기야가 상자 속 두루마리를 찾는다(빛).
     서기관 사반이 책을 가운데 왕좌의 젊은 왕 요시야에게 가져가 읽고, 왕은 엎드려 운다. 힐기야와 사반은 오른쪽 여선지자 훌다의 집으로 —
     훌다가 전하는 말씀에 빛. 끝에 왕이 성전 앞뜰에서 온 백성 앞에 언약책을 읽는다 */
  k38: {
    env: 'day',
    wide: 1.4,
    props: {
      temple: ['stemple', -1.35, -0.7, { scale: 0.62, sea: false }],
      logs: ['cedarlogs', -2.2, 0.0, { scale: 0.8 }],
      stones: ['stockpile', -0.45, -0.3, { kind: 'stone', scale: 0.8 }],
      chest: ['lawscroll', -0.95, 0.1],
      throne: ['ivorythrone', 0.55, -0.45, { scale: 0.9 }],
      house: ['house', 2.0, -0.55, { scale: 0.62 }],
      beam: ['beam', 1.7, 0.0, { r: 0.3, h: 2.4, on: 'huldah' }],
      folk: ['crowd', -0.9, 0.5, { spots: flock(10, 0.75, 0.2, 3), face: Math.PI - 0.2 }],
    },
    cast: {
      josiah: ['josiah', 0.55, -0.48, 0.2, { y: 0.2, pose: 'sit' }],
      hilkiah: ['hilkiah', -0.8, -0.05, -2.0, { speed: 0.45 }],
      shaphan: ['shaphan', -0.35, 0.25, -1.2, { speed: 0.45 }],
      worker: ['hebrew', -1.95, 0.25, 1.2, { gaze: false }],
      guard: ['guardJ', 1.05, -0.3, -0.6, { gaze: false }],
      huldah: ['huldah', 1.75, -0.05, -1.3],
    },
    beats: {
      enter: [['chest', 'found'], ['josiah', 'mourn', { y: 0, x: 0.45, z: -0.05, look: 0 }], ['shaphan', 'idle', { x: 0.1, z: 0.15, look: 1.2, item: 'scroll' }], ['hilkiah', 'idle', { x: -0.3, z: 0.2, look: 1.0 }], ['folk', null, { show: 0 }], ['beam', null, { show: 0 }]],
      // 성전 수리가 한창 — 대제사장이 상자 앞에
      intro: [['@env', 'day'], ['chest', 'hidden'], ['folk', null, { show: 0 }], ['beam', null, { show: 0 }], ['josiah', 'sit', { y: 0.2, look: 0.2 }], ['worker', 'carry-pole', { look: 1.2 }]],
      'p0.0': [['hilkiah', 'bow', { look: -2.4 }], ['shaphan', 'idle', { x: -0.5, z: 0.3, look: -1.8 }]],
      // 율법책을 찾았소
      'p0.1': [['chest', 'found'], ['hilkiah', 'look-up', { look: -2.0 }]],
      'p0.2': [['hilkiah', 'speak', { to: 'shaphan' }]],
      // 사반이 책을 왕궁으로 가져간다
      'p0.3': [['chest', 'hidden'], ['hilkiah', 'idle', { x: -0.3, z: 0.2, look: 1.0 }], ['shaphan', 'idle', { item: 'scroll', x: 0.1, z: 0.15, look: 1.2 }]],
      'p0.4': [['shaphan', 'speak', { to: 'josiah' }], ['josiah', 'sit', { look: -0.4 }]],
      // 말씀을 듣던 왕이 옷을 찢는다
      'p1.0': [['shaphan', 'idle'], ['josiah', 'shrug', { y: 0, x: 0.45, z: -0.05, look: 0 }], ['josiah', 'mourn', { delay: 1600 }]],
      'p1.1': [['josiah', 'speak', { to: 'hilkiah' }]],
      'p1.3': [['josiah', 'speak', { to: 'shaphan' }]],
      // 훌다를 찾아간다
      'p1.4': [['josiah', 'idle', { look: 0.6 }], ['hilkiah', 'idle', { x: 1.3, z: 0.25, look: 1.7 }], ['shaphan', 'idle', { x: 1.15, z: 0.45, look: 1.4, delay: 300 }], ['huldah', 'idle', { look: -1.8 }]],
      'p2.0': [['huldah', 'speak', { to: 'hilkiah' }]],
      'p2.1': [['beam', null, { show: 1 }], ['huldah', 'look-up']],
      'p2.2': [['huldah', 'speak', { to: 'hilkiah' }]],
      'p2.4': [['huldah', 'bless', { look: -1.8 }]],
      'p2.5': [['huldah', 'speak', { to: 'shaphan' }]],
      // 온 백성 앞에서 언약책을 읽고 언약을 세운다
      'p2.6': [['beam', null, { show: 0 }], ['huldah', 'idle'], ['folk', null, { show: 1 }], ['josiah', 'speak', { x: -0.9, z: 0.0, look: 0.2, item: 'scroll' }],
        ['hilkiah', 'idle', { x: -1.5, z: 0.05, look: 0.6 }], ['shaphan', 'idle', { x: -0.35, z: 0.05, look: -0.6, item: null }], ['josiah', 'raise', { item: null, delay: 6500 }]],
      w0: [['beam', null, { show: 1 }], ['huldah', 'speak', { to: 'hilkiah' }], ['hilkiah', 'idle', { x: 1.3, z: 0.25, look: 1.7 }], ['shaphan', 'idle', { x: 1.15, z: 0.45, look: 1.4 }]],
      w1: [['beam', null, { show: 0 }], ['chest', 'found'], ['hilkiah', 'speak', { x: -0.8, z: -0.05, to: 'shaphan' }], ['shaphan', 'idle', { x: -0.5, z: 0.3, look: -1.8 }]],
      w2: [['josiah', 'speak', { to: 'hilkiah' }]],
      end: [['chest', 'hidden'], ['beam', null, { show: 0 }], ['folk', null, { show: 1 }], ['josiah', 'raise', { y: 0, x: -0.9, z: 0.0, look: 0.2, item: null }]],
    },
  },

  /* k39. 므깃도의 죽음 — 왼쪽은 예루살렘의 유월절(놋 제단의 불, 어린양, 모인 백성 앞의 요시야), 오른쪽 뒤로 므깃도 성.
     애굽 왕 느고의 병거와 군사가 왼쪽 앞에서 올라와 므깃도 쪽으로 가고, 투구를 쓴 요시야가 병거를 타고 맞으러 나간다.
     싸움과 죽음은 그리지 않는다 — 해가 저물고 요시야는 보이지 않으며, 신하가 모는 병거만 예루살렘으로 돌아오고 사람들이 엎드려 운다.
     백성이 여호아하스에게 기름을 붓는다 */
  k39: {
    env: 'day',
    wide: 1.45,
    props: {
      grass: ['grass', 0.3, 0.05, { r: 2.0, color: '#a8a070' }],
      temple: ['stemple', -1.75, -0.95, { scale: 0.5, sea: false }],
      altar: ['altar', -1.0, -0.3, { scale: 1.4, state: 'fire' }],
      sheep: ['sheep', -1.55, 0.3, { scale: 0.8 }],
      folk: ['crowd', -0.85, 0.42, { spots: flock(9, 0.6, 0.2, 5), face: Math.PI - 0.3 }],
      city: ['kwall', 1.55, -0.85, { scale: 0.55, w: 1.8, color: '#c8b896' }],
      ech1: ['chariot', -2.6, 0.62, { speed: 0.55 }],
      ech2: ['chariot', -3.1, 0.35, { speed: 0.55 }],
      car: ['kchariot', 0.2, 0.3, { speed: 0.5 }],
    },
    cast: {
      josiah: ['josiah', -0.4, 0.05, -1.4],
      priest: ['hilkiah', -1.35, -0.1, 1.0],
      levite: ['levite', -0.65, -0.35, -1.0, { gaze: false }],
      josiahA: ['josiahA', 0, 0, 1.57, { board: 'car' }],
      driver: ['servant', -0.1, 0, 1.57, { board: 'car', gaze: false }],
      neco: ['neco', -2.4, 0.15, 1.4, { speed: 0.5 }],
      e1: ['egysoldier', -2.7, 0.05, 1.4, { speed: 0.5, gaze: false }],
      e2: ['egysoldier', -2.7, 0.3, 1.4, { speed: 0.5, gaze: false }],
      m1: ['woman', -0.95, 0.1, 1.0, { gaze: false }],
      m2: ['hebrew2', -1.35, 0.35, 1.2, { gaze: false }],
      prince: ['courtier', -0.55, -0.1, 0.4],
    },
    beats: {
      enter: [['@env', 'dusk'], ['altar', 'idle'], ['folk', null, { show: 0 }], ['sheep', null, { show: 0 }], ['josiah', 'idle', { show: 0 }], ['josiahA', 'idle', { show: 0 }], ['neco', 'idle', { show: 0 }], ['e1', 'idle', { show: 0 }], ['e2', 'idle', { show: 0 }],
        ['ech1', null, { show: 0 }], ['ech2', null, { show: 0 }], ['car', null, { x: -0.3, z: 0.4 }], ['m1', 'mourn', { x: -0.85, z: 0.05, look: 1.2 }], ['m2', 'mourn', { x: -1.25, z: 0.3, look: 1.4 }], ['priest', 'mourn', { x: -1.4, z: -0.05, look: 1.0 }],
        ['prince', 'idle', { show: 0 }], ['levite', 'idle', { show: 0 }]],
      // 예루살렘에 울려 퍼지는 유월절 노래
      intro: [['@env', 'day'], ['altar', 'fire'], ['folk', null, { show: 1 }], ['sheep', null, { show: 1 }], ['car', null, { show: 0 }], ['josiahA', 'idle', { show: 0 }], ['driver', 'idle', { show: 0 }],
        ['neco', 'idle', { show: 0 }], ['e1', 'idle', { show: 0 }], ['e2', 'idle', { show: 0 }], ['ech1', null, { show: 0 }], ['ech2', null, { show: 0 }], ['m1', 'idle', { show: 0 }], ['m2', 'idle', { show: 0 }], ['prince', 'idle', { show: 0 }]],
      'p0.0': [['priest', 'bless', { look: 1.2 }], ['levite', 'raise', { look: -0.6 }]],
      'p0.1': [['josiah', 'speak', { look: 1.6 }]],
      'p0.2': [['josiah', 'raise', { look: 1.2 }]],
      'p0.3': [['josiah', 'idle', { look: -1.6 }], ['priest', 'idle'], ['levite', 'idle']],
      'p0.4': [['josiah', 'rebuke', { look: 2.6 }]],
      'p0.5': [['josiah', 'pray', { look: -2.4 }]],
      // 그래도 거두지 않으신 진노
      'p1.0': [['@env', 'overcast'], ['josiah', 'idle', { look: -1.4 }]],
      'p1.2': [['altar', 'idle'], ['priest', 'bow']],
      'p1.3': [['josiah', 'bow', { look: -2.6 }]],
      // 애굽 왕 느고가 유브라데로 올라간다
      'p2.0': [['@env', 'day'], ['priest', 'idle'], ['folk', null, { show: 0 }], ['sheep', null, { show: 0 }], ['josiah', 'idle', { look: 1.0 }],
        ['ech1', null, { show: 1 }], ['ech2', null, { show: 1 }], ['ech1', null, { x: 2.0, z: 0.55 }], ['ech2', null, { x: 1.7, z: 0.25 }],
        ['neco', 'idle', { show: 1, x: 1.2, z: 0.15, look: -1.5 }], ['e1', 'idle', { show: 1, x: 1.55, z: 0.0, look: -1.5 }], ['e2', 'idle', { show: 1, x: 1.6, z: 0.35, look: -1.5 }]],
      // 요시야가 그를 막으러 므깃도로
      'p2.1': [['josiah', 'idle', { show: 0 }], ['car', null, { show: 1, x: 0.4, z: 0.25 }], ['josiahA', 'idle', { show: 1, look: 1.57 }], ['driver', 'idle', { show: 1 }], ['neco', 'point', { look: -1.5, delay: 2000 }]],
      // 싸움은 그리지 않는다 — 해가 지고, 요시야는 보이지 않는다. 애굽 군대는 북쪽으로 떠난다
      'p2.2': [['@env', 'dusk'], ['neco', 'idle', { x: 2.6, z: -0.3 }], ['e1', 'idle', { x: 2.7, z: -0.5 }], ['e2', 'idle', { x: 2.8, z: -0.1 }], ['ech1', null, { x: 3.0, z: 0.1 }], ['ech2', null, { x: 3.0, z: -0.3 }],
        ['neco', 'idle', { show: 0, delay: 3200 }], ['e1', 'idle', { show: 0, delay: 3200 }], ['e2', 'idle', { show: 0, delay: 3200 }], ['ech1', null, { show: 0, delay: 3200 }], ['ech2', null, { show: 0, delay: 3200 }],
        ['josiahA', 'idle', { show: 0, delay: 1200 }]],
      // 신하가 모는 병거가 예루살렘으로 돌아오고, 사람들이 엎드려 운다
      'p2.3': [['neco', 'idle', { show: 0 }], ['e1', 'idle', { show: 0 }], ['e2', 'idle', { show: 0 }], ['ech1', null, { show: 0 }], ['ech2', null, { show: 0 }], ['josiahA', 'idle', { show: 0 }],
        ['car', null, { x: -0.3, z: 0.4 }], ['m1', 'mourn', { show: 1, x: -0.85, z: 0.05, look: 1.2, delay: 1500 }], ['m2', 'mourn', { show: 1, x: -1.25, z: 0.3, look: 1.4, delay: 1900 }], ['priest', 'mourn', { x: -1.4, z: -0.05, look: 1.0, delay: 2300 }]],
      // 백성이 여호아하스에게 기름을 붓는다
      'p2.4': [['@env', 'overcast'], ['prince', 'kneel', { show: 1, x: -0.6, z: -0.05, look: -1.2 }], ['priest', 'anoint', { x: -0.95, z: -0.08, look: 1.5, item: 'oilhorn' }], ['levite', 'idle', { show: 1, look: -0.6 }]],
      w0: [['@env', 'overcast'], ['josiah', 'bow', { show: 1 }]],
      w1: [['josiah', 'pray', { show: 1 }]],
      w2: [['josiah', 'speak', { show: 1, look: 1.6 }]],
      w3: [['neco', 'speak', { show: 1, x: 1.2, z: 0.15, look: -1.5 }]],
      end: [['@env', 'overcast'], ['car', null, { show: 1, x: -0.3, z: 0.4 }], ['m1', 'mourn', { show: 1, x: -0.85, z: 0.05 }], ['m2', 'mourn', { show: 1, x: -1.25, z: 0.3 }],
        ['neco', 'idle', { show: 0 }], ['josiah', 'idle', { show: 0 }], ['priest', 'mourn', { item: null, x: -1.4, z: -0.05, look: 1.0 }], ['prince', 'idle', { show: 0 }]],
    },
  },

  /* k40. 불타는 성전 — 앞쪽에 예루살렘 성벽(가운데 문), 그 뒤로 높이 선 성전. 오른쪽에서 바벨론 군대(청금석빛 옷·둥근 놋 투구)가 와서 에워싸고 흙 언덕을 쌓는다.
     성 안의 양식이 떨어지고(성벽 위 사람들이 주저앉는다) 성벽이 뚫린다. 밤에 시드기야가 왼쪽으로 빠져나가 달아나다 붙잡히고,
     손목에 놋사슬을 찬 채 오른쪽으로 끌려간다(그 밖의 일은 그리지 않는다). 성전은 멀리 불빛과 연기로만 — 다음 날 그을린 빈 집. 사로잡힌 백성이 끌려가고, 가난한 이만 포도원에 남는다 */
  k40: {
    env: 'overcast',
    wide: 1.4,
    props: {
      temple: ['stemple', -0.3, -1.05, { scale: 0.62, sea: false }],
      wall: ['kwall', -0.55, -0.3, { scale: 0.8, w: 2.6 }],
      folk: ['crowd', -0.55, -0.31, { y: 0.56, spots: row(7, 2.0, 4), face: 0.2 }],
      smoke1: ['smoke', -1.35, -0.75, { fire: true, state: 'off', rise: 1.6 }],
      smoke2: ['smoke', 0.6, -0.8, { fire: true, state: 'off', rise: 1.4 }],
      vines: ['vineyard', -1.3, 0.55, { rows: 2, len: 1.0, scale: 0.8 }],
      chain: ['fetters', 0, 0, { on: 'zedekiah' }],
    },
    cast: {
      neb: ['babking', 2.0, 0.15, -1.5, { speed: 0.4 }],
      b1: ['babylonian', 1.2, 0.2, -1.5, { speed: 0.6, gaze: false }],
      b2: ['babylonian2', 1.5, 0.45, -1.5, { speed: 0.6, gaze: false }],
      b3: ['babylonian', 1.7, -0.05, -1.5, { speed: 0.6, gaze: false }],
      b4: ['babylonian2', 0.95, 0.55, -1.5, { speed: 0.6, gaze: false }],
      zedekiah: ['zedekiah', -0.55, -0.12, 0, { speed: 0.6 }],
      zg: ['guardJ', -0.55, -0.12, 0, { speed: 0.6, gaze: false }],
      ex1: ['exile', -0.3, 0.1, 1.5, { speed: 0.35, gaze: false }],
      ex2: ['exileW', -0.6, 0.25, 1.5, { speed: 0.35, gaze: false }],
      ex3: ['exile', -0.85, 0.05, 1.5, { speed: 0.35, gaze: false }],
      poor: ['shepherd', -1.5, 0.35, 0.6, { gaze: false }],
      mourner: ['hebrew', -0.2, 0.45, 3.0],
    },
    beats: {
      enter: [['@env', 'night'], ['wall', 'breach'], ['temple', 'burn'], ['smoke1', 'on'], ['smoke2', 'on'], ['folk', null, { show: 0 }], ['chain', null, { show: 0 }],
        ['zedekiah', 'idle', { show: 0 }], ['zg', 'idle', { show: 0 }], ['ex1', 'idle', { show: 0 }], ['ex2', 'idle', { show: 0 }], ['ex3', 'idle', { show: 0 }], ['poor', 'idle', { show: 0 }],
        ['neb', 'idle', { show: 0 }], ['b1', 'idle', { x: 0.65, z: 0.25, look: -2.4 }], ['b2', 'idle', { x: 1.3, z: 0.45, look: -2.2 }], ['b3', 'idle', { x: 1.35, z: 0.05, look: -2.4 }], ['b4', 'idle', { show: 0 }],
        ['mourner', 'mourn', { x: -1.7, z: 0.35, look: 2.6 }]],
      // 바벨론 왕이 온 군대를 이끌고 와서 에워싼다
      intro: [['@env', 'overcast'], ['wall', 'stand'], ['temple', 'idle'], ['smoke1', 'off'], ['smoke2', 'off'], ['folk', 'stand', { show: 1 }], ['chain', null, { show: 0 }],
        ['zedekiah', 'idle', { show: 0 }], ['zg', 'idle', { show: 0 }], ['ex1', 'idle', { show: 0 }], ['ex2', 'idle', { show: 0 }], ['ex3', 'idle', { show: 0 }], ['poor', 'idle', { show: 0 }], ['mourner', 'idle', { show: 0 }],
        ['neb', 'idle', { x: 2.7, z: 0.2 }], ['b1', 'idle', { x: 2.5, z: 0.25 }], ['b2', 'idle', { x: 2.7, z: 0.5 }], ['b3', 'idle', { x: 2.8, z: 0.0 }], ['b4', 'idle', { x: 2.4, z: 0.6 }]],
      'p0.0': [['neb', 'idle', { x: 2.0, z: 0.15, look: -1.6 }], ['b1', 'idle', { x: 1.2, z: 0.2, look: -1.8 }], ['b2', 'idle', { x: 1.5, z: 0.45, look: -2.0 }], ['b3', 'idle', { x: 1.7, z: -0.05, look: -1.8 }], ['b4', 'idle', { x: 0.95, z: 0.55, look: -2.2 }]],
      // 성 둘레에 흙 언덕
      'p0.1': [['wall', 'siege'], ['neb', 'point', { look: -1.8 }]],
      'p0.2': [['@env', 'dusk'], ['neb', 'idle']],
      // 양식이 다 떨어진다 — 성벽 위 사람들이 주저앉는다
      'p0.3': [['@env', 'overcast'], ['folk', 'sit']],
      // 마침내 성벽이 뚫린다
      'p0.4': [['wall', 'breach'], ['folk', null, { show: 0 }], ['b1', 'idle', { x: 0.65, z: 0.25, look: -2.4 }], ['b3', 'idle', { x: 1.35, z: 0.05, look: -2.4 }]],
      // 그 밤 왕이 두 성벽 사이 문으로 빠져나가 아라바로 달아난다 (왼쪽)
      'p1.0': [['@env', 'night'], ['zedekiah', 'idle', { show: 1, x: -2.5, z: 0.4 }], ['zg', 'idle', { show: 1, x: -2.6, z: 0.6, delay: 300 }],
        ['zedekiah', 'idle', { show: 0, delay: 4800 }], ['zg', 'idle', { show: 0, delay: 5000 }]],
      // 바벨론 군대가 뒤쫓아 붙잡는다
      'p1.1': [['zg', 'idle', { show: 0 }], ['b2', 'idle', { x: -1.8, z: 0.5 }], ['b4', 'idle', { x: -1.7, z: 0.7 }],
        ['zedekiah', 'bow', { show: 1, x: -2.1, z: 0.55, look: 1.4, delay: 2500 }], ['chain', null, { show: 1, delay: 3500 }]],
      // 놋사슬에 묶여 바벨론 왕에게로 끌려간다 (그 밖의 일은 그리지 않는다)
      'p1.2': [['zedekiah', 'bow', { show: 1, x: 1.55, z: 0.35, look: 1.5 }], ['chain', null, { show: 1 }], ['b2', 'idle', { x: 1.3, z: 0.6 }], ['b4', 'idle', { x: 1.9, z: 0.6 }], ['neb', 'idle', { look: -1.8 }],
        ['zedekiah', 'idle', { x: 2.9, z: 0.4, delay: 7000 }], ['neb', 'idle', { x: 3.0, z: 0.1, delay: 7000 }], ['b2', 'idle', { x: 2.9, z: 0.65, delay: 7000 }], ['b4', 'idle', { x: 3.1, z: 0.45, delay: 7000 }],
        ['zedekiah', 'idle', { show: 0, delay: 9500 }], ['neb', 'idle', { show: 0, delay: 9500 }], ['b2', 'idle', { show: 0, delay: 9500 }], ['b4', 'idle', { show: 0, delay: 9500 }], ['chain', null, { show: 0, delay: 9300 }]],
      // 다섯째 달 — 성전과 왕궁과 큰 집들을 불사른다 (멀리 불빛과 연기)
      'p2.0': [['zedekiah', 'idle', { show: 0 }], ['neb', 'idle', { show: 0 }], ['b2', 'idle', { show: 0 }], ['b4', 'idle', { show: 0 }], ['chain', null, { show: 0 }],
        ['@env', 'night'], ['temple', 'burn'], ['smoke1', 'on', { delay: 600 }], ['smoke2', 'on', { delay: 1200 }]],
      // 놋기둥과 놋바다는 깨어져 실려 간다 — 그을린 빈 집
      'p2.1': [['@env', 'dawn'], ['temple', 'ruin'], ['smoke2', 'off']],
      // 백성은 끌려가고, 가난한 이만 포도원에
      'p2.2': [['@env', 'overcast'], ['smoke1', 'off'], ['ex1', 'idle', { show: 1, x: 2.8, z: 0.3 }], ['ex2', 'idle', { show: 1, x: 2.7, z: 0.5, delay: 400 }], ['ex3', 'idle', { show: 1, x: 2.9, z: 0.15, delay: 800 }],
        ['b1', 'idle', { x: 3.0, z: 0.4, delay: 1200 }], ['b3', 'idle', { x: 3.1, z: 0.0, delay: 1200 }],
        ['ex1', 'idle', { show: 0, delay: 9000 }], ['ex2', 'idle', { show: 0, delay: 9400 }], ['ex3', 'idle', { show: 0, delay: 9800 }], ['b1', 'idle', { show: 0, delay: 9000 }], ['b3', 'idle', { show: 0, delay: 9000 }],
        ['poor', 'idle', { show: 1, look: 0.6 }]],
      // 무너진 성소를 두고 터져 나온 노래
      'p2.3': [['ex1', 'idle', { show: 0 }], ['ex2', 'idle', { show: 0 }], ['ex3', 'idle', { show: 0 }], ['b1', 'idle', { show: 0 }], ['b3', 'idle', { show: 0 }],
        ['mourner', 'idle', { show: 1, x: -0.2, z: 0.45, look: 3.0 }], ['poor', 'idle', { look: 2.6 }]],
      'p2.4': [['mourner', 'look-up']],
      'p2.5': [['mourner', 'mourn']],
      w0: [['@env', 'night'], ['temple', 'burn'], ['smoke1', 'on'], ['smoke2', 'on']],
      w1: [['@env', 'overcast'], ['temple', 'ruin'], ['smoke1', 'off'], ['smoke2', 'off']],
      w2: [['ex1', 'idle', { show: 1, x: 1.6, z: 0.3 }], ['ex2', 'idle', { show: 1, x: 1.9, z: 0.5 }], ['ex3', 'idle', { show: 1, x: 2.2, z: 0.2 }], ['mourner', 'mourn']],
      end: [['@env', 'overcast'], ['temple', 'ruin'], ['smoke1', 'off'], ['smoke2', 'off'], ['ex1', 'idle', { show: 0 }], ['ex2', 'idle', { show: 0 }], ['ex3', 'idle', { show: 0 }], ['mourner', 'mourn', { show: 1, x: -0.2, z: 0.45 }], ['poor', 'idle', { show: 1 }]],
    },
  },

  /* k41. 바벨론 강가에서 — 처음은 폐허가 된 유다의 미스바(올리브나무와 낮은 집): 총독 그달리야가 지휘관들에게 말한다.
     그달리야의 죽음은 그리지 않는다 — 날이 어두워지고 그가 사라지며 남은 사람들이 운다, 그리고 애굽 쪽(왼쪽 앞)으로 떠난다.
     무대가 바벨론으로 바뀐다: 뒤로 계단 탑, 오른쪽 감옥에 갇힌 여호야긴(서른일곱 해 — 밤과 아침이 지나간다). 새 왕 에윌므로닥이 감옥 문을 열고,
     여호야긴은 죄수의 옷을 벗고 왕의 식탁에 앉는다. 끝에 앞쪽 강가 버드나무에 수금을 걸고 앉아 시온을 생각하며 우는 포로들 */
  k41: {
    env: 'day',
    wide: 1.4,
    props: {
      grass: ['grass', -0.4, -0.1, { r: 1.6, color: '#a8a070' }],
      olive: ['olive', -1.7, -0.55],
      house: ['house', -0.55, -0.75, { scale: 0.55 }],
      rocks: ['rocks', 0, 0, { spots: [[0.9, -0.6, 0.12], [1.7, 0.2, 0.1], [-1.9, 0.4, 0.1]] }],
      zig: ['ziggurat', -0.9, -1.1, { scale: 1.0 }],
      prison: ['prison', 1.45, -0.35],
      table: ['kingtable', -0.15, -0.05, { len: 1.0 }],
      river: ['river', 0.2, 0.68, { w: 0.34, len: 4.6, rot: Math.PI / 2 }],
      willow: ['willow', -1.55, 0.3, { lyres: true, scale: 1.15 }],
    },
    cast: {
      gedaliah: ['gedaliah', -0.3, -0.1, 0.6],
      c1: ['guardJ', 0.5, 0.1, -1.4],
      c2: ['hebrew2', 0.75, -0.2, -1.6, { gaze: false }],
      p1: ['exile', -0.95, 0.25, 0.9, { gaze: false, speed: 0.45 }],
      p2: ['exileW', -0.75, 0.45, 0.6, { gaze: false, speed: 0.45 }],
      jehoiachin: ['jehoiachin', 1.45, -0.38, 0.0, { pose: 'sit-ground' }],
      jehoiachinR: ['jehoiachinR', 1.45, 0.05, -1.4],
      king: ['babking', 2.3, 0.3, -1.5, { speed: 0.5 }],
      bg: ['babylonian', 2.5, 0.05, -1.5, { speed: 0.5, gaze: false }],
      e1: ['exile', -1.25, 0.42, 0.4, { gaze: false, pose: 'sit-ground' }],
      e2: ['exileW', -0.85, 0.48, 0.2, { gaze: false, pose: 'sit-ground' }],
      e3: ['exile', -1.9, 0.5, 0.6, { gaze: false, pose: 'sit-ground' }],
    },
    beats: {
      enter: [['grass', null, { show: 0 }], ['olive', null, { show: 0 }], ['house', null, { show: 0 }], ['prison', 'open'],
        ['gedaliah', 'idle', { show: 0 }], ['c1', 'idle', { show: 0 }], ['c2', 'idle', { show: 0 }], ['p1', 'idle', { show: 0 }], ['p2', 'idle', { show: 0 }], ['jehoiachin', 'idle', { show: 0 }],
        ['jehoiachinR', 'sit', { x: -0.4, z: -0.27, look: 0.4 }], ['king', 'sit', { x: 0.15, z: -0.27, look: -0.6 }], ['bg', 'idle', { x: 0.9, z: -0.1, look: -1.2 }]],
      // 폐허가 된 유다 땅, 미스바의 총독 그달리야
      intro: [['@env', 'day'], ['grass', null, { show: 1 }], ['olive', null, { show: 1 }], ['house', null, { show: 1 }], ['zig', null, { show: 0 }], ['prison', 'shut', { show: 0 }], ['table', null, { show: 0 }],
        ['river', null, { show: 0 }], ['willow', null, { show: 0 }], ['jehoiachin', 'sit-ground', { show: 0 }], ['jehoiachinR', 'idle', { show: 0 }], ['king', 'idle', { show: 0 }], ['bg', 'idle', { show: 0 }],
        ['e1', 'sit-ground', { show: 0 }], ['e2', 'sit-ground', { show: 0 }], ['e3', 'sit-ground', { show: 0 }]],
      // 지휘관들이 찾아오자 맹세하며 말한다
      'p0.1': [['c1', 'idle', { x: 0.3, z: 0.05, look: -1.6 }], ['gedaliah', 'speak', { to: 'c1' }]],
      'p0.2': [['gedaliah', 'speak', { to: 'c2' }]],
      'p0.3': [['gedaliah', 'bless', { look: 1.2 }]],
      // 일곱째 달 — 그의 죽음은 그리지 않는다: 어두워지고 그가 사라진다, 남은 사람들이 운다
      'p0.4': [['@env', 'dark'], ['gedaliah', 'idle', { show: 0, delay: 1000 }], ['c1', 'mourn', { delay: 2200 }], ['p1', 'mourn', { delay: 2500 }], ['p2', 'mourn', { delay: 2800 }], ['c2', 'idle', { look: 2.6 }]],
      // 바벨론의 보복이 두려워 애굽으로 (왼쪽 앞)
      'p1.0': [['@env', 'overcast'], ['gedaliah', 'idle', { show: 0 }], ['c1', 'idle', { x: -2.6, z: 0.55 }], ['c2', 'idle', { x: -2.8, z: 0.4 }], ['p1', 'idle', { x: -2.7, z: 0.7 }], ['p2', 'idle', { x: -2.5, z: 0.75 }],
        ['c1', 'idle', { show: 0, delay: 5500 }], ['c2', 'idle', { show: 0, delay: 5500 }], ['p1', 'idle', { show: 0, delay: 5500 }], ['p2', 'idle', { show: 0, delay: 5500 }]],
      // 멀리 바벨론의 감옥 — 무대가 바뀐다
      'p1.1': [['@env', 'dusk'], ['c1', 'idle', { show: 0 }], ['c2', 'idle', { show: 0 }], ['p1', 'idle', { show: 0 }], ['p2', 'idle', { show: 0 }], ['gedaliah', 'idle', { show: 0 }],
        ['grass', null, { show: 0 }], ['olive', null, { show: 0 }], ['house', null, { show: 0 }], ['zig', null, { show: 1 }], ['prison', 'shut', { show: 1 }], ['river', null, { show: 1 }], ['jehoiachin', 'sit-ground', { show: 1, look: 0 }]],
      'p1.2': [['jehoiachin', 'sit-ground', { look: -0.5 }]],
      // 서른일곱 해가 흐른다 — 밤과 아침이 지나간다
      'p1.3': [['@env', 'night'], ['@env', 'dawn', { delay: 2200 }], ['@env', 'night', { delay: 4200 }], ['@env', 'dawn', { delay: 6000 }]],
      // 에윌므로닥이 왕위에 오른 해
      'p2.0': [['@env', 'day'], ['king', 'idle', { show: 1, x: 1.6, z: 0.35, look: -2.8 }], ['bg', 'idle', { show: 1, x: 2.1, z: 0.2, look: -2.6 }]],
      // 감옥에서 풀어 다정하게 말한다
      'p2.1': [['prison', 'open'], ['jehoiachin', 'idle', { x: 1.45, z: 0.05, look: 0.4, delay: 1200 }], ['king', 'speak', { to: 'jehoiachin', delay: 2600 }]],
      // 죄수의 옷을 벗고 왕의 식탁에서
      'p2.2': [['king', 'idle'], ['jehoiachin', 'idle', { show: 0, x: 1.45, z: 0.05 }], ['jehoiachinR', 'idle', { show: 1, look: -1.4 }],
        ['jehoiachinR', 'idle', { x: -0.4, z: -0.27, delay: 1400 }], ['king', 'idle', { x: 0.15, z: -0.27, delay: 1400 }], ['table', null, { show: 1 }], ['bg', 'idle', { x: 0.9, z: -0.1, look: -1.2, delay: 1600 }],
        ['jehoiachinR', 'sit', { look: 0.4, delay: 5600 }], ['king', 'sit', { look: -0.6, delay: 5600 }]],
      // 포로들의 노래 — 강가 버드나무에 수금을 걸고
      'p2.3': [['jehoiachin', 'idle', { show: 0 }], ['table', null, { show: 1 }], ['jehoiachinR', 'sit', { show: 1, x: -0.4, z: -0.27, look: 0.4 }], ['king', 'sit', { x: 0.15, z: -0.27, look: -0.6 }],
        ['willow', null, { show: 1 }], ['e1', 'sit-ground', { show: 1 }], ['e2', 'sit-ground', { show: 1, delay: 400 }], ['e3', 'sit-ground', { show: 1, delay: 800 }], ['@env', 'dusk', { delay: 1000 }]],
      'p2.4': [['e1', 'mourn'], ['e2', 'mourn', { delay: 500 }]],
      w0: [['@env', 'day'], ['grass', null, { show: 1 }], ['olive', null, { show: 1 }], ['house', null, { show: 1 }], ['zig', null, { show: 0 }], ['prison', null, { show: 0 }], ['table', null, { show: 0 }], ['river', null, { show: 0 }], ['willow', null, { show: 0 }],
        ['jehoiachinR', 'idle', { show: 0 }], ['king', 'idle', { show: 0 }], ['bg', 'idle', { show: 0 }], ['e1', 'idle', { show: 0 }], ['e2', 'idle', { show: 0 }], ['e3', 'idle', { show: 0 }],
        ['gedaliah', 'speak', { show: 1, x: -0.3, z: -0.1, to: 'c1' }], ['c1', 'idle', { show: 1, x: 0.3, z: 0.05, look: -1.6 }], ['c2', 'idle', { show: 1, x: 0.75, z: -0.2, look: -1.6 }]],
      w1: [['gedaliah', 'idle', { show: 0 }], ['c1', 'idle', { show: 0 }], ['c2', 'idle', { show: 0 }], ['grass', null, { show: 0 }], ['olive', null, { show: 0 }], ['house', null, { show: 0 }],
        ['zig', null, { show: 1 }], ['prison', 'open', { show: 1 }], ['river', null, { show: 1 }], ['king', 'speak', { show: 1, x: 1.6, z: 0.35, to: 'jehoiachinR' }], ['jehoiachinR', 'idle', { show: 1, x: 1.45, z: 0.05, look: -1.4 }], ['bg', 'idle', { show: 1, x: 2.1, z: 0.2, look: -2.6 }]],
      w2: [['table', null, { show: 1 }], ['king', 'sit', { x: 0.15, z: -0.27, look: -0.6 }], ['jehoiachinR', 'sit', { x: -0.4, z: -0.27, look: 0.4 }], ['bg', 'idle', { x: 0.9, z: -0.1, look: -1.2 }]],
      end: [['@env', 'dusk'], ['grass', null, { show: 0 }], ['olive', null, { show: 0 }], ['house', null, { show: 0 }], ['gedaliah', 'idle', { show: 0 }], ['c1', 'idle', { show: 0 }], ['c2', 'idle', { show: 0 }],
        ['zig', null, { show: 1 }], ['prison', 'open', { show: 1 }], ['river', null, { show: 1 }], ['table', null, { show: 1 }], ['willow', null, { show: 1 }],
        ['jehoiachinR', 'sit', { show: 1, x: -0.4, z: -0.27, look: 0.4 }], ['king', 'sit', { show: 1, x: 0.15, z: -0.27, look: -0.6 }], ['bg', 'idle', { show: 1, x: 0.9, z: -0.1 }],
        ['e1', 'mourn', { show: 1 }], ['e2', 'mourn', { show: 1 }], ['e3', 'sit-ground', { show: 1 }]],
    },
  },
};

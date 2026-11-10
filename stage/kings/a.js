/* 열왕기 여정 대본 묶음 a: k01–k11 (stage/kings.js가 합친다)
   기브온의 꿈에서 시삭이 금 방패를 실어 가기까지. 솔로몬은 젊은 왕 solomon(다윗 여정) → 성전을 봉헌하는 solomonK(짧은 수염) → 늙은 solomonO.
   유다 왕가는 자주·붉은 옷, 북이스라엘(여로보암)은 청록·황토 옷. 하나님은 모습 없이 빛(beam)으로만, 성전을 덮은 영광은 구름(stemple 'cloud').
   죽음은 그리지 않는다: 하나님의 사람(k09)은 길 위에서 사라지고 사자와 나귀만 가만히 서 있다, 아비야(k10)는 그리지 않고 어머니의 애도로만 */

// 무리(crowd)의 자리: 가운데를 둘러 n명을 흩어 놓는다 (moses.js와 같다)
const flock = (n, rx, rz, seed = 1) => Array.from({ length: n }, (_, i) => {
  const a = i * 2.399 + seed, r = Math.sqrt((i + 0.5) / n);
  return [Math.cos(a) * r * rx, Math.sin(a) * r * rz];
});

export const A = {
  /* k01. 기브온의 꿈 — 큰 산당의 장막(성막)과 큰 제단, 연기. 해 질 녘 번제를 드리던 젊은 왕이 불이 잦아든 밤 제단 곁에 잠든다.
     꿈에 빛이 내리고(여호와), 왕은 빛 속에서 무릎 꿇고 듣는 마음을 구한다. 깨어 보니 꿈 — 새벽에 예루살렘 쪽(오른쪽)으로 떠난다 */
  k01: {
    env: 'dusk',
    wide: 1.3,
    props: {
      grass: ['grass', 0, 0.05, { r: 1.9, color: '#9a9a6a' }],
      rocks: ['rocks', 0, 0, { spots: [[-1.5, 0.45, 0.1], [1.6, -0.2, 0.12], [-0.3, -0.85, 0.1]] }],
      tab: ['tabernacle', -1.15, -0.6, { scale: 0.9 }],
      altar: ['bronzealtar', 0.55, -0.35, { scale: 1.4, state: 'fire' }], // 기브온 산당의 놋 제단 (대하 1:5)
      smoke: ['smoke', 0.55, -0.35, { y: 0.32, rise: 1.6, color: '#bdb5aa' }],
      ox: ['ox', 1.55, 0.3, { scale: 0.8, rot: Math.PI, speed: 0.4 }],
      beam: ['beam', 0.0, 0.2, { r: 0.42, h: 2.4 }],
    },
    cast: {
      solomon: ['solomon', 0.0, 0.2, 0.6],
      pr1: ['priest', 1.05, -0.05, -1],
      pr2: ['levite', -0.45, -0.15, 0.9], // 왕 바로 뒤에 서면 겹쳐 보였다
    },
    beats: {
      enter: [['@env', 'night'], ['altar', 'idle'], ['smoke', 'off'], ['ox', null, { show: 0 }], ['pr1', 'idle', { show: 0 }], ['pr2', 'idle', { show: 0 }], ['beam', null, { show: 1 }], ['solomon', 'kneel', { look: 0.2 }]],
      // 산당 위로 그치지 않는 연기 — 번제를 드리는 젊은 왕
      intro: [['@env', 'dusk'], ['altar', 'fire'], ['smoke', 'on'], ['beam', null, { show: 0 }], ['solomon', 'idle', { look: 0.6 }], ['pr1', 'idle', { look: -0.8 }]],
      'p0.1': [['solomon', 'raise', { x: 0.1, z: 0.15, look: 0.5 }], ['pr1', 'bless', { look: 0.3 }], ['ox', null, { x: 1.25, z: 0.15 }]],
      // 불길이 잦아든 밤 — 그 자리에서 잠이 든다
      'p0.2': [['@env', 'night'], ['altar', 'idle'], ['smoke', 'off'], ['ox', null, { x: 2.1, z: 0.45 }], ['ox', null, { show: 0, delay: 2500 }],
        ['pr1', 'idle', { x: 1.9, z: -0.2 }], ['pr2', 'idle', { x: 2.0, z: 0.25 }], ['pr1', 'idle', { show: 0, delay: 2600 }], ['pr2', 'idle', { show: 0, delay: 2600 }],
        ['solomon', 'sit-ground', { x: 0.0, z: 0.2, look: 0.3 }], ['solomon', 'sleep', { look: 1, delay: 1800 }]],
      // 꿈에 여호와께서 — 빛으로
      'p0.3': [['ox', null, { show: 0 }], ['pr1', 'idle', { show: 0 }], ['pr2', 'idle', { show: 0 }], ['beam', null, { show: 1 }]],
      // 왕이 빛 속에서 무릎 꿇고 아뢴다
      'p1.0': [['solomon', 'kneel', { look: 0.2 }]],
      'p1.2': [['solomon', 'kneel', { look: 0 }]],
      'p1.3': [['solomon', 'look-up', { look: 0 }]],
      'p1.4': [['solomon', 'bow', { look: 0.2 }]],
      'p2.0': [['solomon', 'kneel', { look: 0.2 }]],
      'p2.1': [['solomon', 'listen']],
      // 깨어 보니 꿈이었다
      'p2.3': [['beam', null, { show: 0 }], ['solomon', 'sleep', { look: 1 }], ['solomon', 'sit-ground', { look: 0.3, delay: 1600 }], ['solomon', 'idle', { look: 0.8, delay: 3200 }]],
      // 새벽, 예루살렘으로 돌아간다 (오른쪽 아래 — 기브온에서 남동쪽)
      'p2.4': [['@env', 'dawn'], ['beam', null, { show: 0 }], ['solomon', 'idle', { x: 1.9, z: 0.5 }], ['solomon', 'idle', { show: 0, delay: 4200 }]],
      'p2.5': [['solomon', 'idle', { show: 0 }]],
      // 사랑하시는 이에게 단잠을 — 빈 산당에 해가 오른다
      'p2.6': [['@env', 'day'], ['smoke', 'on']],
      w0: [['@env', 'night'], ['beam', null, { show: 1 }], ['solomon', 'kneel', { show: 1, x: 0.0, z: 0.2, look: 0.2 }]],
      w1: [['solomon', 'speak', { show: 1, x: 0.0, z: 0.2, look: 0.2 }]],
      w2: [['beam', null, { show: 1 }], ['solomon', 'listen']],
      w3: [['solomon', 'bow']],
      end: [['@env', 'night'], ['altar', 'idle'], ['smoke', 'off'], ['beam', null, { show: 1 }], ['solomon', 'kneel', { show: 1, x: 0.0, z: 0.2, look: 0.2 }]],
    },
  },

  /* k02. 두 여인과 한 아기 — 왕궁(hall) 안 상아 보좌의 젊은 왕. 아기를 안은 여인(mother2)과 빈손의 여인(mother1)이 엇갈려 말한다.
     칼을 든 호위병이 다가서지만 칼은 내려진 채(나누는 모습은 그리지 않는다), 진짜 어머니가 무릎 꿇어 빌고, 왕의 판결로 아기는 그 품에 */
  k02: {
    env: 'day',
    wide: 1.25,
    props: {
      hall: ['hall', 0, -0.05, { throne: false, lamp: -0.95, w: 2.6 }],
      throne: ['ivorythrone', 0.7, -0.38],
    },
    cast: {
      solomon: ['solomon', 0.7, -0.42, -0.4, { y: 0.22, pose: 'sit' }],
      mom: ['mother1', -0.55, 0.2, 0.9],
      other: ['mother2', -0.12, 0.3, 0.9],
      guard: ['guardJ', 1.2, 0.05, -1],
      off1: ['official', -1.0, -0.35, 0.6, { gaze: false }],
      off2: ['courtier', 0.15, -0.45, 0.5, { gaze: false }],
    },
    beats: {
      enter: [['other', 'carry', { item: null, x: 0.1, z: 0.32, look: 2.6 }], ['mom', 'carry', { item: 'baby', look: 0.5 }], ['solomon', 'sit-speak', { to: 'mom' }]],
      // 두 여인이 왕 앞에 — 한 여인의 품에 산 아기
      intro: [['other', 'carry', { item: 'baby', look: 0.9 }], ['mom', 'idle', { look: 0.9 }], ['solomon', 'sit', { look: -0.4 }], ['guard', 'idle', { look: -0.8 }]],
      'p0.2': [['mom', 'speak', { to: 'solomon', look: 0.9 }]],
      'p0.4': [['mom', 'speak', { look: 0.6 }]],
      'p0.5': [['mom', 'point', { look: 1 }]],
      'p1.0': [['mom', 'speak', { to: 'solomon' }]],
      'p1.2': [['mom', 'shrug']],
      // 아기를 안은 여인이 소리친다
      'p1.3': [['mom', 'idle', { look: 1 }], ['other', 'speak', { to: 'mom', item: 'baby' }]],
      'p1.4': [['other', 'speak', { to: 'mom' }]],
      // 증인은 없다 — 목소리만 엇갈린다
      'p1.5': [['other', 'carry', { item: 'baby', look: 0.9 }], ['mom', 'idle', { look: 0.9 }]],
      'p1.6': [['mom', 'speak', { to: 'other' }], ['other', 'speak', { to: 'mom', delay: 1400 }], ['mom', 'idle', { delay: 1400 }]],
      // 왕이 말한다 — 칼을 가져오너라
      'p2.0': [['other', 'carry', { item: 'baby', look: 0.9 }], ['mom', 'idle', { look: 0.9 }], ['solomon', 'sit-speak', { to: 'guard' }]],
      'p2.1': [['guard', 'idle', { item: 'sword', x: 0.4, z: 0.38, look: -1 }]],
      'p2.2': [['solomon', 'sit-speak', { to: 'other' }], ['guard', 'idle', { look: -1 }]],
      // 진짜 어머니가 애가 타서 — 무릎 꿇고 빈다
      'p2.3': [['solomon', 'sit'], ['mom', 'kneel', { x: -0.45, z: 0.22, look: 1 }]],
      'p2.4': [['mom', 'speak', { to: 'solomon' }], ['mom', 'kneel', { delay: 3500 }]],
      'p2.5': [['mom', 'kneel'], ['other', 'speak', { to: 'mom' }]],
      'p2.6': [['other', 'speak', { to: 'mom' }]],
      // 왕의 판결 — 칼은 물러가고, 아기는 처음 여인에게
      'p2.7': [['other', 'carry', { item: 'baby' }], ['guard', 'idle', { item: null, x: 1.2, z: 0.05, look: -1 }], ['solomon', 'sit-speak', { to: 'mom' }]],
      'p2.8': [['mom', 'idle', { x: -0.32, z: 0.24, look: 0.9 }], ['other', 'idle', { item: null, x: -0.05, z: 0.3, look: 2.6, delay: 600 }], ['mom', 'carry', { item: 'baby', delay: 800 }]],
      'p2.9': [['solomon', 'sit'], ['mom', 'carry', { item: 'baby', look: 0.4 }], ['other', 'idle', { item: null, x: 0.35, z: 0.45, look: 2.6 }], ['off1', 'bow'], ['off2', 'bow', { delay: 400 }]],
      w0: [['guard', 'idle', { item: 'sword', x: 0.4, z: 0.38, look: -1 }], ['other', 'carry', { item: 'baby', x: 0.02, z: 0.28, look: 0.9 }], ['mom', 'idle', { item: null, x: -0.42, z: 0.2, look: 0.9 }],
        ['solomon', 'sit-speak', { to: 'other' }]],
      w1: [['solomon', 'sit'], ['mom', 'kneel', { x: -0.45, z: 0.22, look: 1 }], ['mom', 'speak', { to: 'solomon', delay: 300 }]],
      w2: [['guard', 'idle', { item: null, x: 1.2, z: 0.05, look: -1 }], ['other', 'idle', { item: null, x: 0.35, z: 0.45, look: 2.6 }], ['mom', 'carry', { item: 'baby', x: -0.32, z: 0.24, look: 0.4 }],
        ['solomon', 'sit-speak', { to: 'mom' }]],
      end: [['solomon', 'sit'], ['guard', 'idle', { item: null, x: 1.2, z: 0.05, look: -1 }], ['other', 'idle', { item: null, x: 0.35, z: 0.45, look: 2.6 }], ['mom', 'carry', { item: 'baby', x: -0.32, z: 0.24, look: 0.4 }],
        ['off1', 'bow'], ['off2', 'bow']],
    },
  },

  /* k03. 구름이 가득한 성전 — 솔로몬의 성전(stemple) 앞뜰. 두 제사장이 언약궤를 메고 두 놋 기둥 사이로 들이고 물러나오는 순간 구름이 집을 덮는다.
     왕은 제단 앞에서 하늘을 향해 두 손을 펴고 기도하고, 먼 땅의 이방 사람도 성전을 향해 엎드린다. 기도를 마치고 백성을 축복, 제단에 불 */
  k03: {
    env: 'day',
    wide: 1.4,
    props: {
      temple: ['stemple', 0, -0.72, { scale: 1.2 }], // 0.85일 때 집이 사람 키의 한 배 반쯤이라 작아 보였다
      ark: ['arkc', -1.35, 0.6, { lift: 0.33, on: ['p1', 'p2'] }],
      folkL: ['crowd', -1.9, -0.12, { spots: flock(6, 0.5, 0.36, 1), face: Math.PI / 2 + 0.4 }], // 좁게 모으면 한 덩어리로 보였다 — 넓게 흩는다
      folkR: ['crowd', 1.95, -0.05, { spots: flock(6, 0.5, 0.36, 2), face: -Math.PI / 2 - 0.4 }],
    },
    cast: {
      p1: ['priest', -1.77, 0.6, 1.3, { speed: 0.3, pose: 'carry-pole' }],
      p2: ['priest', -0.93, 0.6, 1.3, { speed: 0.3, pose: 'carry-pole' }],
      solomon: ['solomonK', 0.6, 0.62, -1.0],
      stranger: ['tyrian', 2.2, 0.6, -1, { gaze: false }],
    },
    beats: {
      enter: [['temple', 'cloud'], ['ark', null, { show: 0 }], ['p1', 'kneel', { x: -1.0, z: 0.15, look: 2.7 }], ['p2', 'kneel', { x: 1.0, z: 0.15, look: -2.7 }],
        ['stranger', 'idle', { show: 0 }], ['solomon', 'raise', { x: -0.3, z: 0.45, look: -0.3 }]],
      // 일곱째 달 명절 — 제사장들이 궤를 메고 올라온다
      intro: [['@env', 'day'], ['temple', 'idle'], ['ark', null, { show: 1 }], ['stranger', 'idle', { show: 0 }], ['solomon', 'idle', { look: -1.0 }]],
      'p0.0': [['p1', 'carry-pole', { x: -1.02, z: 0.45 }], ['p2', 'carry-pole', { x: -0.18, z: 0.45 }]],
      // 궤 안의 돌판 두 개 — 두 놋 기둥 사이로 들어간다
      'p0.1': [['p1', 'carry-pole', { x: -0.42, z: -0.3 }], ['p2', 'carry-pole', { x: 0.42, z: -0.3 }], ['solomon', 'idle', { look: -0.6 }]],
      // 궤가 지성소에 놓이고 제사장들이 물러나오는 순간, 구름이 가득하다
      'p0.2': [['ark', null, { show: 0, delay: 1200 }], ['p1', 'idle', { x: -1.0, z: 0.15, look: 2.7, delay: 1500 }], ['p2', 'idle', { x: 1.0, z: 0.15, look: -2.7, delay: 1500 }],
        ['temple', 'cloud', { delay: 3500 }], ['@env', 'glory', { delay: 3500 }]],
      'p0.3': [['ark', null, { show: 0 }], ['temple', 'cloud'], ['@env', 'glory'], ['p1', 'kneel', { x: -1.0, z: 0.15, look: 2.7 }], ['p2', 'kneel', { x: 1.0, z: 0.15, look: -2.7, delay: 400 }], ['solomon', 'look-up', { look: -0.8 }]],
      // 왕이 회중 앞 제단 앞에 서서 하늘을 향해 두 손을 편다
      'p1.0': [['@env', 'day'], ['solomon', 'idle', { x: -0.3, z: 0.45, look: -0.3 }], ['solomon', 'raise', { delay: 2600 }]],
      'p1.1': [['solomon', 'raise']],
      'p1.3': [['solomon', 'raise', { look: 0.2 }]],
      // 먼 땅에서 온 이방 사람이 빌어도
      'p1.4': [['stranger', 'idle', { show: 1, x: 1.4, z: 0.62, look: -2.6 }], ['stranger', 'kneel', { delay: 3000 }]],
      // 무릎을 펴고 일어나 백성을 축복한다
      'p2.0': [['stranger', 'kneel', { show: 1, x: 1.4, z: 0.62, look: -2.6 }], ['solomon', 'bless', { x: 0.0, z: 0.5, look: 0 }], ['p1', 'idle', { look: 0.3 }], ['p2', 'idle', { look: -0.3 }]],
      // 화목제물 — 제단의 불, 열나흘의 잔치
      'p2.1': [['temple', 'fire'], ['solomon', 'idle', { look: -0.6 }]],
      // 백성은 기뻐하며 장막으로 돌아간다
      'p2.2': [['folkL', null, { x: -2.6 }], ['folkR', null, { x: 2.7 }], ['folkL', null, { show: 0, delay: 2500 }], ['folkR', null, { show: 0, delay: 2500 }], ['stranger', 'idle', { x: 2.3, z: 0.1, delay: 800 }], ['stranger', 'idle', { show: 0, delay: 3000 }],
        ['solomon', 'bless', { look: 0 }]],
      // 주의 뜰에서 보내는 하루
      'p2.3': [['folkL', null, { show: 0 }], ['folkR', null, { show: 0 }], ['stranger', 'idle', { show: 0 }], ['solomon', 'idle', { x: 0.0, z: 0.42, look: 2.9 }]],
      'p2.4': [['solomon', 'pray', { look: 2.9 }]],
      w0: [['solomon', 'speak', { show: 1, x: -0.3, z: 0.45, look: -0.3 }]],
      w1: [['solomon', 'raise']],
      w2: [['solomon', 'speak'], ['stranger', 'kneel', { show: 1, x: 1.4, z: 0.62, look: -2.6 }]],
      w3: [['solomon', 'bless', { x: 0.0, z: 0.5, look: 0 }]],
      end: [['@env', 'glory'], ['temple', 'cloud'], ['ark', null, { show: 0 }], ['folkL', null, { show: 1, x: -1.85 }], ['folkR', null, { show: 1, x: 1.9 }], ['stranger', 'idle', { show: 0 }],
        ['p1', 'kneel', { x: -1.0, z: 0.15, look: 2.7 }], ['p2', 'kneel', { x: 1.0, z: 0.15, look: -2.7 }], ['solomon', 'raise', { show: 1, x: -0.3, z: 0.45, look: -0.3 }]],
    },
  },

  /* k04. 스바 여왕의 방문 — 왼쪽에서 향품을 실은 낙타 떼가 들어오고, 오른쪽 상아 보좌의 왕 앞에 여왕이 선다. 뒤로 왕궁, 멀리 성전.
     물음과 막힘 없는 대답, 신하들과 술 따르는 이들, 넋을 잃은 여왕의 찬양, 바친 금과 향품 */
  k04: {
    env: 'day',
    wide: 1.45,
    props: {
      palace: ['palacebuild', -0.1, -0.85, { w: 1.6, state: 'built' }],
      temple: ['stemple', 1.75, -1.0, { scale: 0.5, sea: false }],
      throne: ['ivorythrone', 0.85, -0.3],
      table: ['kingtable', -0.55, -0.48, { len: 0.75 }], // 여왕이 설 자리 앞을 비운다
      gifts: ['tribute', 0.42, 0.22, { kind: 'spice' }],
      cam1: ['camel', -2.9, -0.3, { speed: 0.45, scale: 0.55 }], // 0.85면 사람보다 훨씬 컸다
      cam2: ['camel', -3.3, -0.62, { speed: 0.45, scale: 0.55 }],
    },
    cast: {
      solomon: ['solomonK', 0.85, -0.33, -0.6, { y: 0.22, pose: 'sit' }],
      sheba: ['sheba', -2.2, 0.62, 1, { speed: 0.55 }],
      maid: ['shebamaid', -2.55, 0.75, 1, { speed: 0.55, gaze: false }],
      driver: ['shebaman', -2.3, 0.0, 1, { speed: 0.45, gaze: false }],
      off1: ['official', -1.05, -0.7, 0.4, { gaze: false }],
      off2: ['courtier', -0.05, -0.7, 0.2, { gaze: false }],
      cup: ['servant', 1.35, -0.1, -1, { gaze: false }],
    },
    beats: {
      enter: [['cam1', null, { x: -2.05 }], ['cam2', null, { x: -2.45 }], ['driver', 'idle', { x: -1.6, z: -0.08 }], ['maid', 'idle', { x: -0.45, z: 0.6, look: 1 }],
        ['sheba', 'speak', { x: 0.0, z: 0.35, look: 1, to: 'solomon' }], ['gifts', null, { show: 1 }]],
      // 향품을 실은 낙타 떼가 성문으로 길게 들어온다
      intro: [['gifts', null, { show: 0 }], ['cam1', null, { show: 0 }], ['cam2', null, { show: 0 }], ['driver', 'idle', { show: 0 }], ['sheba', 'idle', { show: 0 }], ['maid', 'idle', { show: 0 }], ['solomon', 'sit', { look: -0.6 }]],
      'p0.0': [['cam1', null, { show: 1, x: -2.05 }], ['cam2', null, { show: 1, x: -2.45 }], ['driver', 'idle', { show: 1, x: -1.6, z: -0.08 }], ['sheba', 'idle', { show: 1, x: -1.1, z: 0.6 }], ['maid', 'idle', { show: 1, x: -1.45, z: 0.72 }]],
      // 먼 남쪽 나라의 여왕 — 왕 앞에 나아가 묻는다
      'p0.2': [['sheba', 'idle', { x: 0.0, z: 0.35, look: 1 }], ['maid', 'idle', { x: -0.45, z: 0.6, look: 1 }]],
      'p0.4': [['sheba', 'speak', { to: 'solomon' }]],
      // 막힘 없는 대답
      'p1.0': [['sheba', 'listen', { look: 1 }], ['solomon', 'sit-speak', { to: 'sheba' }]],
      // 궁과 상의 음식, 신하들, 술 따르는 이들
      'p1.1': [['solomon', 'sit'], ['sheba', 'idle', { look: -0.4 }], ['sheba', 'idle', { look: 0.3, delay: 2500 }]],
      'p1.2': [['cup', 'idle', { item: 'cup', x: 0.25, z: -0.05, look: -1 }], ['off1', 'bow'], ['off2', 'bow', { delay: 500 }], ['sheba', 'idle', { look: -0.8 }], ['cup', 'idle', { x: 1.35, z: -0.1, look: -1, delay: 4000 }]],
      // 숨이 멎을 듯 넋을 잃었다
      'p1.3': [['off1', 'idle'], ['off2', 'idle'], ['sheba', 'look-up', { look: 0.6 }]],
      // 내 나라에서 들은 소문이 참이었습니다
      'p2.0': [['sheba', 'speak', { to: 'solomon', look: 1 }]],
      'p2.3': [['sheba', 'raise', { look: 0.8 }]],
      'p2.4': [['sheba', 'speak', { to: 'solomon' }]],
      // 금과 향품을 바치고 고국으로
      'p2.5': [['gifts', null, { show: 1 }], ['sheba', 'bow', { look: 1 }], ['maid', 'bow', { delay: 400 }],
        ['sheba', 'idle', { x: -2.4, z: 0.6, delay: 3500 }], ['maid', 'idle', { x: -2.7, z: 0.75, delay: 3700 }], ['cam1', null, { x: -3.2, delay: 3000 }], ['cam2', null, { x: -3.6, delay: 3000 }], ['driver', 'idle', { x: -3.0, z: 0.0, delay: 3000 }],
        ['cam1', null, { show: 0, delay: 7000 }], ['cam2', null, { show: 0, delay: 7000 }], ['driver', 'idle', { show: 0, delay: 7000 }], ['sheba', 'idle', { show: 0, delay: 8000 }], ['maid', 'idle', { show: 0, delay: 8000 }]],
      w0: [['sheba', 'speak', { show: 1, x: 0.0, z: 0.35, look: 1, to: 'solomon' }]],
      w1: [['sheba', 'speak'], ['off1', 'bow'], ['off2', 'bow']],
      w2: [['off1', 'idle'], ['off2', 'idle'], ['sheba', 'raise']],
      end: [['gifts', null, { show: 1 }], ['cam1', null, { show: 1, x: -2.05 }], ['cam2', null, { show: 1, x: -2.45 }], ['driver', 'idle', { show: 1, x: -1.6, z: -0.08 }], ['maid', 'idle', { show: 1, x: -0.45, z: 0.6, look: 1 }],
        ['sheba', 'bow', { show: 1 }], ['sheba', 'bow', { x: 0.0, z: 0.35, look: 1 }], ['solomon', 'sit']],
    },
  },

  /* k05. 돌아선 마음 — 예루살렘 맞은편 산(왼쪽 멀리 성전)의 두 산당: 그모스와 몰록. 이방 왕비들이 분향하고 연기가 성전 맞은편 하늘로 오른다.
     늙은 왕이 왕비들에게 이끌려 산당 앞에 절한다. 하늘이 어두워지고 빛 아래 말씀 — 나라를 찢겠다, 그러나 한 지파는 남기겠다 */
  k05: {
    env: 'day',
    wide: 1.4,
    props: {
      grass: ['grass', 0.3, 0, { r: 1.9, color: '#a8a070' }],
      rocks: ['rocks', 0, 0, { spots: [[-0.6, -0.75, 0.12], [2.0, 0.3, 0.1]] }],
      temple: ['stemple', -1.8, -1.05, { scale: 0.55 }], // 서쪽(왼쪽) 맞은편의 성전
      hp1: ['highplace', 0.35, -0.45, { pole: false }], // 모압의 그모스
      hp2: ['highplace', 1.45, -0.35, { r: 0.42, color: '#9a8a70' }], // 암몬의 몰록
      beam: ['beam', -0.25, 0.25, { r: 0.4, h: 2.4, peak: 0.36 }],
    },
    cast: {
      solomon: ['solomonO', -0.7, 0.35, 1, { speed: 0.6 }],
      wifeM: ['wifeM', 0.45, 0.1, -2.7],
      wifeS: ['wifeS', 1.55, 0.15, -2.8],
      wifeE: ['princess', -0.15, 0.45, 0.7],
      wifeH: ['woman2', 1.0, 0.45, -0.8],
    },
    beats: {
      enter: [['@env', 'overcast'], ['hp1', 'smoke'], ['hp2', 'smoke'], ['beam', null, { show: 0 }], ['solomon', 'bow', { x: 0.2, z: 0.15, look: -2.6 }], ['wifeE', 'idle', { x: -0.25, z: 0.35, look: 1 }]],
      // 맞은편 산 위에 낯선 제단이 선다 — 아직 아무도 없다
      intro: [['@env', 'day'], ['hp1', 'idle', { show: 0 }], ['hp2', 'idle', { show: 0 }], ['beam', null, { show: 0 }], ['solomon', 'idle', { show: 0 }],
        ['wifeM', 'idle', { show: 0 }], ['wifeS', 'idle', { show: 0 }], ['wifeE', 'idle', { show: 0 }], ['wifeH', 'idle', { show: 0 }]],
      'p0.0': [['hp1', 'idle', { show: 1 }]],
      'p0.1': [['hp2', 'idle', { show: 1 }]],
      // 그것을 세운 이는 솔로몬 왕
      'p0.2': [['hp1', 'idle', { show: 1 }], ['hp2', 'idle', { show: 1 }], ['solomon', 'idle', { show: 1, x: -0.7, z: 0.35, look: 1 }]],
      // 이방 왕비들이 분향한다
      'p0.3': [['wifeM', 'pray', { show: 1 }], ['wifeS', 'pray', { show: 1, delay: 500 }], ['hp1', 'smoke'], ['hp2', 'smoke', { delay: 600 }]],
      'p0.4': [['solomon', 'idle', { look: -1.3 }], ['solomon', 'idle', { look: 0.8, delay: 2600 }]],
      // 바로의 딸, 모압·암몬·에돔·시돈·헷의 여인들
      'p1.0': [['wifeE', 'idle', { show: 1, x: -0.15, z: 0.45, look: -0.8 }], ['wifeH', 'idle', { show: 1, x: 1.0, z: 0.45, look: -0.8, delay: 600 }], ['solomon', 'idle', { look: 0.6 }]],
      'p1.1': [['beam', null, { show: 0 }]],
      // 늙은 왕의 마음을 돌렸다 — 산당 앞에 절한다
      'p1.3': [['wifeE', 'speak', { to: 'solomon' }], ['wifeH', 'idle', { look: -0.6 }]],
      'p1.4': [['wifeE', 'idle', { x: -0.25, z: 0.35, look: 1 }], ['solomon', 'idle', { x: 0.2, z: 0.15, look: -2.6 }], ['solomon', 'bow', { delay: 3200 }], ['wifeM', 'bow']],
      // 여호와께서 진노하셨다
      'p2.0': [['@env', 'overcast'], ['wifeE', 'idle', { x: -0.25, z: 0.35 }], ['solomon', 'bow', { x: 0.2, z: 0.15, look: -2.6 }]],
      // 두 번이나 나타나셨던 분 — 빛이 내린다
      'p2.2': [['beam', null, { show: 1, x: 0.2, z: 0.15 }], ['solomon', 'idle', { look: 0 }], ['solomon', 'look-up', { delay: 800 }], ['wifeM', 'idle', { x: 0.75, z: -0.05, look: -1 }], ['wifeE', 'afraid', { look: 1 }]],
      'p2.3': [['solomon', 'afraid', { look: 0 }], ['wifeS', 'idle', { look: -1 }], ['wifeH', 'afraid', { look: -1 }]],
      'p2.4': [['solomon', 'kneel']],
      'p2.5': [['solomon', 'mourn']],
      w0: [['beam', null, { show: 1, x: 0.2, z: 0.15 }], ['solomon', 'afraid', { show: 1, x: 0.2, z: 0.15, look: 0 }]],
      w1: [['solomon', 'kneel']],
      w2: [['solomon', 'mourn']],
      end: [['@env', 'overcast'], ['hp1', 'smoke'], ['hp2', 'smoke'], ['beam', null, { show: 1, x: 0.2, z: 0.15 }], ['solomon', 'mourn', { show: 1, x: 0.2, z: 0.15, look: 0 }],
        ['wifeM', 'idle', { show: 1, x: 0.75, z: -0.05, look: -1 }], ['wifeE', 'idle', { show: 1, x: -0.25, z: 0.35, look: 1 }]],
    },
  },

  /* k06. 아히야의 열두 조각 옷 — 왼쪽 뒤로 쌓는 예루살렘 성벽과 일꾼들, 그들을 맡은 젊은 여로보암. 성을 나서는 길에서 새 옷 입은 아히야를 만난다.
     옷을 찢어 열두 조각(pieces) — 열 조각이 여로보암 발치로 모이고, 그는 무릎 꿇는다. 그 뒤 왕의 사람들이 오자 남쪽으로 달아난다 */
  k06: {
    env: 'day',
    wide: 1.35,
    props: {
      grass: ['grass', 0.4, 0.05, { r: 1.9 }],
      wall: ['kwall', -1.25, -0.85, { scale: 0.8, w: 2.2 }],
      olive: ['olive', 1.6, -0.6],
      pieces: ['pieces', 0.08, 0.28, { to: [-0.24, 0.02] }],
    },
    cast: {
      jeroboam: ['jeroboam', -0.7, 0.2, -0.8, { speed: 0.6 }],
      w1: ['hebrew', -1.85, -0.3, 0.6, { gaze: false }],
      w2: ['hebrew2', -0.35, -0.4, -0.6, { gaze: false }],
      ahijah: ['ahijah', 2.1, 0.3, -1, { speed: 0.45 }],
      ahijahT: ['ahijahT', 0.42, 0.25, -1],
      guard: ['guardJ', -2.2, 0.35, 1, { speed: 0.7 }],
    },
    beats: {
      enter: [['w1', 'idle', { show: 0 }], ['w2', 'idle', { show: 0 }], ['ahijah', 'idle', { show: 0, x: 0.42, z: 0.25 }], ['guard', 'idle', { show: 0 }], ['pieces', 'ten'],
        ['ahijahT', 'speak', { to: 'jeroboam' }], ['jeroboam', 'kneel', { x: -0.3, z: 0.25, look: 1 }]],
      // 성을 쌓는 일꾼들과 부지런한 젊은이
      intro: [['@env', 'day'], ['pieces', 'spread', { show: 0 }], ['ahijahT', 'idle', { show: 0 }], ['ahijah', 'idle', { show: 0 }], ['guard', 'idle', { show: 0 }],
        ['w1', 'hold-basket'], ['w2', 'hold-basket'], ['jeroboam', 'point', { look: -0.8 }]],
      'p0.1': [['jeroboam', 'speak', { to: 'w2' }], ['w2', 'idle', { x: -0.6, z: -0.4, look: -1 }], ['w1', 'hold-basket', { x: -1.55, z: -0.35 }]],
      // 예루살렘을 나서는 길에서 아히야를 만난다
      'p0.2': [['jeroboam', 'idle', { x: -0.3, z: 0.25, look: 1 }], ['ahijah', 'idle', { show: 1, x: 0.42, z: 0.25, look: -1 }]],
      // 들에는 두 사람뿐
      'p0.3': [['w1', 'idle', { show: 0 }], ['w2', 'idle', { show: 0 }], ['jeroboam', 'idle', { x: -0.3, z: 0.25, look: 1 }], ['ahijah', 'idle', { x: 0.42, z: 0.25, look: -1 }]],
      // 새 옷을 움켜쥐고 열두 조각으로 찢는다 — 조각이 땅에 펼쳐진다
      'p1.0': [['ahijah', 'idle', { x: 0.42, z: 0.25 }], ['ahijah', 'idle', { show: 0, delay: 600 }], ['ahijahT', 'raise', { show: 1, delay: 600 }], ['pieces', 'spread', { show: 1, delay: 900 }], ['jeroboam', 'afraid', { delay: 900 }]],
      // 열 조각을 가지시오
      'p1.1': [['ahijah', 'idle', { show: 0 }], ['ahijahT', 'speak', { show: 1, to: 'jeroboam' }], ['jeroboam', 'idle', { look: 1 }], ['pieces', 'spread', { show: 1 }]],
      'p1.2': [['pieces', 'ten'], ['ahijahT', 'point', { look: -1 }]],
      'p1.3': [['ahijahT', 'speak', { to: 'jeroboam' }], ['jeroboam', 'kneel', { look: 1 }]],
      'p1.6': [['ahijahT', 'bless', { look: -1 }]],
      'p2.0': [['ahijahT', 'speak', { to: 'jeroboam' }]],
      // 솔로몬이 그를 죽이려 하자 — 애굽으로 달아난다
      'p2.3': [['ahijahT', 'idle'], ['guard', 'idle', { show: 1, x: -1.4, z: 0.35, look: 1 }], ['jeroboam', 'afraid', { look: -1, delay: 1200 }]],
      'p2.4': [['jeroboam', 'idle', { x: 2.4, z: 0.6 }], ['jeroboam', 'idle', { show: 0, delay: 3800 }], ['guard', 'idle', { x: -0.7, z: 0.4, delay: 600 }], ['guard', 'idle', { show: 0, delay: 4200 }],
        ['ahijahT', 'idle', { look: 0.6, delay: 1500 }]],
      w0: [['ahijah', 'idle', { show: 0 }], ['pieces', 'ten', { show: 1 }], ['ahijahT', 'speak', { show: 1, x: 0.42, z: 0.25, to: 'jeroboam' }], ['jeroboam', 'kneel', { show: 1, x: -0.3, z: 0.25, look: 1 }]],
      w1: [['ahijahT', 'speak', { show: 1 }]],
      w2: [['ahijahT', 'speak', { show: 1 }]],
      end: [['w1', 'idle', { show: 0 }], ['w2', 'idle', { show: 0 }], ['ahijah', 'idle', { show: 0 }], ['guard', 'idle', { show: 0 }], ['pieces', 'ten', { show: 1 }],
        ['ahijahT', 'speak', { show: 1, x: 0.42, z: 0.25, to: 'jeroboam' }], ['jeroboam', 'kneel', { show: 1, x: -0.3, z: 0.25, look: 1 }]],
    },
  },

  /* k07. 세겜의 거친 대답 — 세겜의 큰 상수리나무 아래 모인 온 이스라엘(왼쪽 무리)과 그 앞의 여로보암, 오른쪽에 새 왕 르호보암.
     원로들(오른쪽 뒤)과 함께 자란 젊은이들(가운데 뒤)에게 차례로 묻고, 거칠게 대답한다. 백성이 장막으로 돌아가 흩어지고 왕은 수레로 달아난다 */
  k07: {
    env: 'day',
    wide: 1.4,
    props: {
      grass: ['grass', 0, 0.05, { r: 2.0 }],
      oak: ['oak', -1.75, -0.7],
      folk: ['crowd', -1.15, 0.2, { spots: flock(11, 0.55, 0.32, 2), face: Math.PI / 2, speed: 0.35 }],
      car: ['kchariot', 1.75, 0.55, { speed: 1.1 }],
    },
    cast: {
      rehoboam: ['rehoboam', 2.2, 0.05, -1, { speed: 0.55 }],
      jeroboam: ['jeroboam', -2.2, 0.35, 1, { speed: 0.55 }],
      elder1: ['elder', 1.45, -0.42, -0.6],
      elder2: ['elder', 1.8, -0.3, -0.8, { gaze: false }],
      young1: ['courtier', 0.15, -0.5, 0.4],
      young2: ['courtier', 0.45, -0.6, 0.2, { gaze: false }],
    },
    beats: {
      enter: [['@env', 'overcast'], ['jeroboam', 'raise', { x: -0.4, z: 0.3, look: 1 }], ['rehoboam', 'rebuke', { x: 0.7, z: 0.1, look: -1 }], ['folk', null, { x: -1.35 }]],
      // 왕으로 세우려고 모인 온 이스라엘 — 르호보암이 세겜에 온다
      intro: [['@env', 'day'], ['jeroboam', 'idle', { show: 0 }], ['rehoboam', 'idle', { board: null, x: 2.2, z: 0.05, look: -1 }]],
      'p0.0': [['rehoboam', 'idle', { x: 0.7, z: 0.1, look: -1 }]],
      // 애굽에 숨어 있던 여로보암도 백성 앞에
      'p0.2': [['jeroboam', 'idle', { show: 1, x: -0.4, z: 0.3, look: 1 }]],
      'p0.3': [['jeroboam', 'speak', { to: 'rehoboam' }]],
      'p0.6': [['jeroboam', 'listen'], ['rehoboam', 'speak', { to: 'jeroboam' }]],
      // 원로들에게 묻는다
      'p1.0': [['rehoboam', 'idle', { x: 1.2, z: -0.2, look: 0.6 }], ['jeroboam', 'idle', { look: 0.6 }]],
      'p1.1': [['elder1', 'speak', { to: 'rehoboam' }]],
      // 그 말을 버리고 젊은이들에게
      'p1.3': [['elder1', 'idle'], ['rehoboam', 'idle', { x: 0.85, z: -0.18, look: -1.9 }], ['elder1', 'shrug', { delay: 2500 }]],
      'p1.4': [['elder1', 'idle'], ['young1', 'speak', { to: 'rehoboam' }]],
      'p1.6': [['young1', 'speak'], ['young2', 'point', { look: -1 }]],
      // 사흘째 — 거친 대답
      'p2.0': [['young1', 'idle'], ['young2', 'idle'], ['@env', 'overcast'], ['rehoboam', 'idle', { x: 0.7, z: 0.1, look: -1 }], ['rehoboam', 'rebuke', { delay: 2000 }]],
      'p2.1': [['rehoboam', 'rebuke']],
      // 이스라엘아, 장막으로 돌아가자!
      'p2.2': [['rehoboam', 'idle'], ['jeroboam', 'raise', { look: 1 }]],
      'p2.4': [['jeroboam', 'idle', { x: -1.8, z: 0.4, look: -1, delay: 1500 }], ['folk', null, { x: -2.3, delay: 1200 }], ['folk', null, { show: 0, delay: 4500 }], ['jeroboam', 'idle', { show: 0, delay: 5000 }]],
      // 왕은 급히 수레를 타고 예루살렘으로 — 감독 아도람의 일은 낭독으로만
      'p2.5': [['folk', null, { show: 0 }], ['jeroboam', 'idle', { show: 0 }], ['elder1', 'afraid'], ['rehoboam', 'afraid', { look: 1 }],
        ['rehoboam', 'idle', { x: 1.6, z: 0.5, delay: 800 }], ['rehoboam', 'idle', { board: 'car', x: 0, z: 0, look: 1.3, delay: 3200 }], ['car', null, { x: 3.0, z: 0.75, delay: 3600 }], ['car', null, { show: 0, delay: 6500 }]],
      w0: [['elder1', 'speak', { to: 'rehoboam' }]],
      w1: [['elder1', 'idle'], ['car', null, { show: 1, x: 1.75, z: 0.55 }], ['rehoboam', 'rebuke', { board: null, show: 1, x: 0.7, z: 0.1, look: -1 }]],
      w2: [['rehoboam', 'idle'], ['folk', null, { show: 1, x: -1.35 }], ['jeroboam', 'speak', { show: 1, x: -0.4, z: 0.3, look: 1, to: 'rehoboam' }]],
      end: [['@env', 'overcast'], ['car', null, { show: 1, x: 1.75, z: 0.55 }], ['folk', null, { show: 1, x: -1.35 }], ['rehoboam', 'rebuke', { board: null, show: 1, x: 0.7, z: 0.1, look: -1 }],
        ['jeroboam', 'raise', { show: 1, x: -0.4, z: 0.3, look: 1 }]],
    },
  },

  /* k08. 벧엘과 단의 금송아지 — 밤, 세겜의 새 왕이 홀로 서성이며 속으로 말한다. 낮이 되자 금송아지 둘이 서고, 하나는 벧엘 산당에,
     하나는 북쪽 끝 단(뒤 -z)으로 실려 가고 백성이 줄지어 따라간다. 레위 자손 아닌 제사장들, 여로보암이 제단에 올라 분향하려고 선다 */
  k08: {
    env: 'night',
    wide: 1.35,
    props: {
      grass: ['grass', 0, 0.05, { r: 1.9, color: '#a8a070' }],
      hp: ['highplace', 0.35, -0.4, { pole: false }],
      calf: ['calf', 0.62, -0.5, { scale: 1.4, y: 0.1 }],
      calf2: ['calf', 1.25, -0.2, { scale: 1.4, speed: 0.35 }],
      folk: ['crowd', -1.2, 0.15, { spots: flock(9, 0.5, 0.3, 4), face: Math.PI / 2, speed: 0.3 }],
    },
    cast: {
      jeroboam: ['jeroboamK', -0.35, 0.3, 0.4, { speed: 0.5 }],
      man1: ['hebrew', -0.45, -0.25, 1, { gaze: false }],
      man2: ['hebrew2', -0.75, -0.05, 1, { gaze: false }],
      pr1: ['man', 1.6, 0.4, -1],
      pr2: ['traveler', 1.9, 0.2, -1, { gaze: false }],
    },
    beats: {
      enter: [['@env', 'day'], ['hp', 'smoke'], ['calf2', null, { show: 0 }], ['folk', null, { show: 1 }], ['man1', 'bow'], ['man2', 'bow'],
        ['pr1', 'bless', { x: 0.95, z: 0.05, look: -2.5 }], ['jeroboam', 'raise', { x: 0.05, z: -0.1, look: -2.5 }]],
      // 밤 — 한 가지 생각이 그를 놓아주지 않는다
      intro: [['@env', 'night'], ['hp', 'idle'], ['calf', null, { show: 0 }], ['calf2', null, { show: 0 }], ['folk', null, { show: 0 }], ['man1', 'idle', { show: 0 }], ['man2', 'idle', { show: 0 }],
        ['pr1', 'idle', { show: 0 }], ['pr2', 'idle', { show: 0 }], ['jeroboam', 'idle', { look: 0.4 }]],
      'p0.1': [['jeroboam', 'idle', { x: 0.45, z: 0.35, look: 1 }], ['jeroboam', 'idle', { x: -0.35, z: 0.3, look: -0.6, delay: 3800 }]],
      'p0.2': [['jeroboam', 'idle', { look: 0.2 }]],
      'p0.3': [['jeroboam', 'idle', { look: -1.2 }]],
      'p0.4': [['jeroboam', 'afraid', { look: 0 }]],
      // 의논한 끝에 금송아지 두 개
      'p1.0': [['@env', 'day'], ['jeroboam', 'idle', { x: -0.2, z: 0.35, look: 0.6 }], ['calf', null, { show: 1 }], ['calf2', null, { show: 1, delay: 900 }]],
      'p1.1': [['folk', null, { show: 1 }], ['man1', 'idle', { show: 1 }], ['man2', 'idle', { show: 1 }], ['jeroboam', 'speak', { to: 'man1', look: -1 }]],
      'p1.3': [['jeroboam', 'point', { look: 0.8 }]],
      // 광야의 금송아지 앞에서 외쳤던 그 말
      'p1.4': [['jeroboam', 'idle'], ['man1', 'bow'], ['man2', 'bow', { delay: 500 }]],
      // 하나는 벧엘에, 하나는 북쪽 끝 단에
      'p1.5': [['man1', 'idle'], ['man2', 'idle'], ['calf2', null, { x: 1.2, z: -1.4 }], ['calf2', null, { show: 0, delay: 3800 }]],
      // 이 일은 죄가 되었다 — 백성이 줄지어 단으로
      'p2.0': [['calf2', null, { show: 0 }], ['@env', 'overcast']],
      'p2.1': [['folk', null, { x: -0.6, z: -1.2 }], ['folk', null, { show: 0, delay: 4500 }], ['man2', 'idle', { x: 0.1, z: -1.1, delay: 400 }], ['man2', 'idle', { show: 0, delay: 4000 }]],
      // 레위 자손이 아닌 제사장들
      'p2.2': [['folk', null, { show: 0 }], ['man2', 'idle', { show: 0 }], ['pr1', 'idle', { show: 1, x: 0.95, z: 0.05, look: -2.5 }], ['pr2', 'idle', { show: 1, x: 1.4, z: 0.25, look: -1, delay: 500 }], ['jeroboam', 'idle', { look: 1 }]],
      // 제 마음대로 정한 명절
      'p2.3': [['jeroboam', 'speak', { to: 'pr1' }], ['pr1', 'bow']],
      // 벧엘 제단에 올라 분향하려고 선다
      'p2.4': [['jeroboam', 'idle', { x: 0.05, z: -0.1, look: -2.5 }], ['hp', 'smoke', { delay: 2500 }], ['jeroboam', 'raise', { delay: 3000 }], ['pr1', 'bless', { delay: 3000 }], ['man1', 'bow', { delay: 3200 }]],
      w0: [['@env', 'night'], ['jeroboam', 'speak', { show: 1, x: -0.35, z: 0.3, look: 0.2 }]],
      w1: [['@env', 'day'], ['calf', null, { show: 1 }], ['folk', null, { show: 1, x: -1.2, z: 0.15 }], ['man1', 'idle', { show: 1 }], ['jeroboam', 'speak', { to: 'man1', x: -0.2, z: 0.35, look: -1 }]],
      end: [['@env', 'day'], ['hp', 'smoke'], ['calf', null, { show: 1 }], ['folk', null, { show: 1, x: -1.2, z: 0.15 }], ['man1', 'bow', { show: 1 }], ['man2', 'bow', { show: 1, x: -0.75, z: -0.05 }],
        ['pr1', 'bless', { show: 1, x: 0.95, z: 0.05, look: -2.5 }], ['jeroboam', 'raise', { x: 0.05, z: -0.1, look: -2.5 }]],
    },
  },

  /* k09. 유다에서 온 하나님의 사람 — 벧엘의 금송아지 산당에서 분향하던 왕 앞에, 왼쪽에서 온 하나님의 사람이 제단을 향해 외친다.
     왕이 손을 뻗자 그 손이 굳고 제단이 갈라져 재가 쏟아진다. 기도로 손이 돌아오고, 그는 오른쪽 상수리나무 아래로 간다.
     늙은 선지자의 거짓말 — 해 질 녘 길 위에서 그는 사라지고(죽음은 그리지 않는다) 나귀와 사자만 가만히 서 있다. 늙은 선지자가 그 자리에 엎드려 운다 */
  k09: {
    env: 'day',
    wide: 1.4,
    props: {
      grass: ['grass', 0.2, 0.05, { r: 2.0, color: '#a8a070' }],
      hp: ['highplace', -0.35, -0.45, { calf: true, pole: false, state: 'smoke' }],
      oak: ['oak', 1.75, -0.65],
      donkey: ['donkey', 0.95, 0.42, { speed: 0.45 }],
      lion: ['lion', 2.3, 0.2, { speed: 0.4, rot: Math.PI }],
    },
    cast: {
      jeroboam: ['jeroboamK', -0.45, 0.05, -1],
      godman: ['godman', -2.1, 0.3, 1, { speed: 0.55 }],
      old: ['oldprophet', -2.2, 0.5, 1, { speed: 0.6 }],
      pr1: ['man', 0.3, -0.1, -1, { gaze: false }],
    },
    beats: {
      enter: [['hp', 'split'], ['donkey', null, { show: 0 }], ['lion', null, { show: 0 }], ['old', 'idle', { show: 0 }],
        ['godman', 'rebuke', { x: -1.25, z: 0.3, look: 1 }], ['jeroboam', 'afraid', { x: -0.4, z: 0.1, look: -1 }], ['pr1', 'afraid']],
      // 분향하려는 순간 — 유다에서 온 하나님의 사람이 외친다
      intro: [['@env', 'day'], ['hp', 'smoke'], ['donkey', null, { show: 0 }], ['lion', null, { show: 0 }], ['old', 'idle', { show: 0 }], ['godman', 'idle', { show: 0 }],
        ['jeroboam', 'raise', { look: -2.6 }], ['pr1', 'bless', { look: -2.4 }]],
      'p0.0': [['godman', 'idle', { show: 1, x: -1.25, z: 0.3, look: 1 }], ['godman', 'rebuke', { delay: 2600 }], ['jeroboam', 'idle', { look: -1, delay: 2600 }], ['pr1', 'idle', { look: -1, delay: 2800 }]],
      'p0.1': [['godman', 'rebuke']],
      'p0.2': [['godman', 'speak', { to: 'jeroboam' }]],
      'p0.3': [['godman', 'point', { look: 1 }]],
      // 저자를 잡아라 — 손이 말라 굳고, 제단이 갈라진다
      'p1.0': [['godman', 'idle'], ['jeroboam', 'point', { look: -1 }]],
      'p1.1': [['jeroboam', 'rebuke', { look: -1 }]],
      'p1.2': [['jeroboam', 'afraid'], ['hp', 'split'], ['pr1', 'afraid', { look: 2.5 }]],
      // 하나님의 사람이 기도하자 손이 돌아온다
      'p1.3': [['hp', 'split'], ['godman', 'pray', { look: 0.6 }], ['jeroboam', 'idle', { delay: 2500 }], ['pr1', 'idle', { delay: 2500 }]],
      'p1.4': [['godman', 'idle'], ['jeroboam', 'speak', { to: 'godman' }]],
      'p1.5': [['jeroboam', 'idle'], ['godman', 'speak', { to: 'jeroboam' }]],
      // 온 길로 돌아가지 말라 — 다른 길로 떠나 상수리나무 아래 앉는다
      'p1.6': [['godman', 'speak'], ['godman', 'idle', { x: 1.35, z: -0.25, delay: 3000 }], ['godman', 'sit-ground', { look: -0.6, delay: 7500 }]],
      // 벧엘의 늙은 선지자가 뒤쫓아 온다
      'p2.0': [['godman', 'sit-ground', { x: 1.35, z: -0.25, look: -0.6 }], ['jeroboam', 'idle', { show: 0 }], ['pr1', 'idle', { show: 0 }], ['old', 'idle', { show: 1, x: 0.75, z: 0.0, look: 1 }]],
      'p2.1': [['old', 'speak', { to: 'godman' }]],
      'p2.2': [['old', 'speak'], ['godman', 'idle', { look: -0.6, delay: 2500 }]],
      // 거짓말이었다
      'p2.3': [['old', 'idle'], ['@env', 'overcast']],
      // 돌아가 떡을 먹고, 돌아가는 길에 — 해 질 녘 길 위에서 사라진다
      'p2.4': [['godman', 'idle', { x: -0.6, z: 0.35 }], ['old', 'idle', { x: -0.85, z: 0.45, delay: 300 }], ['godman', 'sit-ground', { item: 'bread', look: 0.6, delay: 4500 }],
        ['@env', 'dusk', { delay: 7000 }], ['donkey', null, { show: 1, delay: 7000 }], ['godman', 'idle', { item: null, x: 0.75, z: 0.35, delay: 7500 }], ['old', 'idle', { show: 0, delay: 7500 }],
        ['godman', 'idle', { show: 0, delay: 10500 }]],
      // 사자와 나귀는 그 곁에 가만히 서 있었다
      'p2.5': [['@env', 'dusk'], ['old', 'idle', { show: 0 }], ['godman', 'idle', { show: 0 }], ['donkey', null, { show: 1, x: 0.95, z: 0.42 }], ['lion', null, { show: 1, x: 1.6, z: 0.3 }]],
      // 늙은 선지자가 거두어 묻으며 운다
      'p2.6': [['old', 'idle', { show: 1, x: -1.4, z: 0.45, look: 1 }], ['old', 'idle', { x: 0.25, z: 0.5, delay: 300 }], ['old', 'mourn', { look: 1, delay: 5000 }]],
      'p2.7': [['old', 'mourn', { x: 0.25, z: 0.5, look: 1 }]],
      w0: [['@env', 'day'], ['lion', null, { show: 0 }], ['donkey', null, { show: 0 }], ['old', 'idle', { show: 0 }], ['hp', 'smoke'], ['jeroboam', 'idle', { show: 1, look: -1 }],
        ['godman', 'rebuke', { show: 1, x: -1.25, z: 0.3, look: 1 }], ['godman', 'speak', { to: 'jeroboam', delay: 1500 }]],
      w1: [['hp', 'split'], ['godman', 'speak', { to: 'jeroboam' }]],
      w2: [['@env', 'dusk'], ['godman', 'idle', { show: 0 }], ['jeroboam', 'idle', { show: 0 }], ['donkey', null, { show: 1, x: 0.95, z: 0.42 }], ['lion', null, { show: 0 }], ['old', 'speak', { show: 1, x: 0.25, z: 0.5, look: -0.6 }]],
      end: [['@env', 'dusk'], ['hp', 'split'], ['jeroboam', 'idle', { show: 0 }], ['pr1', 'idle', { show: 0 }], ['godman', 'idle', { show: 0 }], ['lion', null, { show: 1, x: 1.6, z: 0.3 }],
        ['donkey', null, { show: 1, x: 0.95, z: 0.42 }], ['old', 'mourn', { show: 1, x: 0.25, z: 0.5, look: 1 }]],
    },
  },

  /* k10. 변장하고 온 왕비 — 왼쪽은 디르사의 왕궁(두 층 집), 오른쪽은 실로 아히야의 집. 왕이 왕비에게 말하고, 왕비는 수수한 옷으로 갈아입고(queenN → jerowife)
     떡 바구니를 들고 실로로 간다. 문간에 앉은 눈먼 아히야에게 빛이 먼저 내리고, 발소리에 그가 먼저 부른다. 무거운 소식 — 아이는 그리지 않는다.
     돌아와 문지방을 넘을 때 어둠, 어머니와 왕의 애도로만 */
  k10: {
    env: 'day',
    wide: 1.4,
    props: {
      grass: ['grass', 0, 0.1, { r: 2.0 }],
      palace: ['tallhouse', -1.65, -0.55, { scale: 0.75, wall: '#e2d6bc' }],
      house: ['house', 1.45, -0.55, { scale: 0.75 }],
      olive: ['olive', 0.25, -0.75],
      beam: ['beam', 1.0, -0.05, { r: 0.32, h: 2.2 }],
    },
    cast: {
      jeroboam: ['jeroboamK', -1.15, 0.05, 0.8],
      queen: ['queenN', -0.75, 0.15, -0.8, { speed: 0.5 }],
      wife: ['jerowife', -0.75, 0.15, -0.8, { speed: 0.5 }],
      ahijah: ['ahijahT', 1.0, -0.05, -0.9, { pose: 'sit-ground' }],
    },
    beats: {
      enter: [['queen', 'idle', { show: 0 }], ['beam', null, { show: 0 }], ['jeroboam', 'idle', { show: 0 }], ['wife', 'afraid', { item: null, x: 0.35, z: 0.2, look: 1 }], ['ahijah', 'sit-speak', { to: 'wife' }]],
      // 왕자가 병들어 누웠다 — 왕이 왕비에게
      intro: [['@env', 'day'], ['beam', null, { show: 0 }], ['wife', 'idle', { show: 0 }], ['queen', 'idle', { look: -0.8 }], ['jeroboam', 'idle', { look: 0.8 }]],
      'p0.1': [['jeroboam', 'speak', { to: 'queen' }]],
      'p0.3': [['jeroboam', 'point', { look: 1 }]],
      'p0.4': [['jeroboam', 'speak', { to: 'queen' }]],
      // 떡 열 개와 과자와 꿀 한 병 — 수수한 옷으로 길을 나선다
      'p0.5': [['jeroboam', 'idle'], ['queen', 'idle', { show: 0 }], ['wife', 'hold-basket', { show: 1, item: 'basket', x: -0.75, z: 0.15 }], ['wife', 'hold-basket', { x: -0.1, z: 0.3, delay: 2200 }]],
      // 그때 아히야는 늙어 눈이 어두웠다
      'p0.6': [['queen', 'idle', { show: 0 }], ['jeroboam', 'idle', { x: -1.5, z: -0.1, look: 0.4 }], ['wife', 'hold-basket', { x: -0.1, z: 0.3 }]],
      // 여호와께서 아히야에게 미리
      'p1.0': [['beam', null, { show: 1 }], ['ahijah', 'sit-ground', { look: 0 }]],
      'p1.1': [['ahijah', 'sit-ground', { look: -0.6 }]],
      // 문간의 발소리 — 아히야가 먼저 부른다
      'p1.2': [['beam', null, { show: 0 }], ['wife', 'hold-basket', { x: 0.35, z: 0.2, look: 1 }]],
      'p1.3': [['ahijah', 'sit-speak', { to: 'wife' }]],
      'p1.5': [['ahijah', 'sit-speak']],
      // 그 자리에 굳어 섰다
      'p1.6': [['ahijah', 'sit-ground'], ['wife', 'afraid', { item: null, look: 1 }]],
      'p2.0': [['beam', null, { show: 1 }], ['ahijah', 'sit-speak', { to: 'wife' }]],
      'p2.2': [['beam', null, { show: 0 }], ['ahijah', 'sit-speak']],
      'p2.3': [['wife', 'mourn', { look: 1 }]],
      'p2.5': [['ahijah', 'sit-ground'], ['wife', 'kneel']],
      // 디르사로 돌아와 문지방을 넘을 때 — 어둠과 애도
      'p2.6': [['wife', 'idle', { x: -1.15, z: -0.1 }], ['@env', 'dusk', { delay: 3500 }], ['wife', 'mourn', { look: 0.4, delay: 4500 }], ['jeroboam', 'mourn', { x: -1.55, z: 0.05, look: 0.6, delay: 4800 }]],
      w0: [['beam', null, { show: 0 }], ['wife', 'afraid', { item: null, x: 0.35, z: 0.2, look: 1 }], ['ahijah', 'sit-speak', { to: 'wife' }]],
      w1: [['beam', null, { show: 1 }], ['ahijah', 'sit-ground', { look: 0 }]],
      w2: [['beam', null, { show: 0 }], ['ahijah', 'sit-speak', { to: 'wife' }]],
      end: [['@env', 'dusk'], ['beam', null, { show: 0 }], ['queen', 'idle', { show: 0 }], ['ahijah', 'sit-ground', { look: -0.9 }], ['wife', 'mourn', { show: 1, item: null, x: -1.15, z: -0.1, look: 0.4 }],
        ['jeroboam', 'mourn', { show: 1, x: -1.55, z: 0.05, look: 0.6 }]],
    },
  },

  /* k11. 금 방패가 놋 방패로 — 왕궁 호위실 벽(shields)과 호위병들, 오른쪽 뒤로 성전, 왼쪽 먼 언덕의 산당.
     지금은 놋 방패를 든 호위병들 → 지난날 벽의 금 방패, 시삭의 애굽 군사가 성전과 왕궁의 보물을 실어 가고 벽이 빈다 → 놋 방패를 만들어 건다.
     왕이 성전에 들어갈 때마다 방패를 들고 나섰다가 들여놓는다 */
  k11: {
    env: 'day',
    wide: 1.4,
    props: {
      shields: ['shields', -0.45, -0.8, { n: 6, w: 1.5, state: 'none' }],
      temple: ['stemple', 1.35, -0.8, { scale: 0.55, sea: false }],
      hp: ['highplace', -2.05, -0.75, { scale: 0.6, r: 0.4 }],
      gold: ['tribute', 0.45, 0.2, { kind: 'gold', speed: 0.5 }],
    },
    cast: {
      rehoboam: ['rehoboam', 0.15, 0.2, -0.8, { speed: 0.4 }],
      g1: ['guardJ', -1.15, 0.1, 0.6, { speed: 0.4 }],
      g2: ['guardJ', -0.75, 0.15, 0.4, { speed: 0.4, gaze: false }],
      g3: ['guardJ', -0.35, 0.2, 0.2, { speed: 0.4, gaze: false }],
      shishak: ['pharaoh', -2.2, 0.35, 1, { speed: 0.5 }],
      e1: ['egysoldier', -2.4, 0.1, 1, { speed: 0.5, gaze: false }],
      e2: ['egysoldier', -2.5, 0.55, 1, { speed: 0.5, gaze: false }],
      e3: ['egyptian', -2.6, 0.3, 1, { speed: 0.5, gaze: false }],
    },
    beats: {
      enter: [['shields', 'bronze'], ['gold', null, { show: 0 }], ['shishak', 'idle', { show: 0 }], ['e1', 'idle', { show: 0 }], ['e2', 'idle', { show: 0 }], ['e3', 'idle', { show: 0 }],
        ['g1', 'idle', { item: 'shield' }], ['g2', 'idle', { item: 'shield' }], ['g3', 'idle', { item: 'shield' }], ['rehoboam', 'idle', { x: 0.45, z: 0.15, look: -1 }]],
      // 호위병들이 방패를 들고 줄지어 선다 — 누런 놋 방패
      intro: [['@env', 'day'], ['shields', 'none'], ['hp', 'idle', { show: 0 }], ['gold', null, { show: 0 }], ['shishak', 'idle', { show: 0 }], ['e1', 'idle', { show: 0 }], ['e2', 'idle', { show: 0 }], ['e3', 'idle', { show: 0 }],
        ['g1', 'idle', { item: 'shield' }], ['g2', 'idle', { item: 'shield' }], ['g3', 'idle', { item: 'shield' }]],
      'p0.2': [['rehoboam', 'idle', { x: 0.45, z: 0.15, look: -1 }]],
      // 높은 언덕마다 산당과 아세라 상
      'p0.4': [['hp', 'smoke', { show: 1 }], ['rehoboam', 'idle', { look: -2.4 }]],
      // 지난날 — 벽에 걸렸던 금 방패와 보물, 시삭이 쳐들어온다
      'p1.0': [['@env', 'overcast'], ['g1', 'idle', { show: 0 }], ['g2', 'idle', { show: 0 }], ['g3', 'idle', { show: 0 }], ['shields', 'gold'], ['gold', null, { show: 1 }],
        ['rehoboam', 'afraid', { x: 1.0, z: 0.0, look: -1 }],
        ['shishak', 'idle', { show: 1, x: -0.6, z: 0.5, look: 1, delay: 1500 }], ['e1', 'idle', { show: 1, x: -0.95, z: 0.3, delay: 1700 }], ['e2', 'idle', { show: 1, x: -1.25, z: 0.6, delay: 1900 }], ['e3', 'idle', { show: 1, x: -0.15, z: 0.55, delay: 2100 }]],
      // 성전과 왕궁의 보물을 모조리 털어 간다
      'p1.1': [['shishak', 'point', { look: 1 }], ['e3', 'idle', { x: 0.25, z: 0.35, look: 1 }], ['gold', null, { show: 0, delay: 2500 }], ['e3', 'carry', { delay: 2500 }]],
      // 금 방패도 남김없이
      'p1.2': [['gold', null, { show: 0 }], ['shishak', 'idle'], ['e1', 'idle', { x: -0.6, z: -0.3, look: -2.8 }], ['shields', 'none', { delay: 1800 }], ['e1', 'carry', { delay: 1800 }]],
      // 남의 나라 수레에 실려 내려간다
      'p1.3': [['shields', 'none'], ['shishak', 'idle', { x: -2.5, z: 0.35 }], ['e1', 'carry', { x: -2.6, z: 0.1 }], ['e2', 'idle', { x: -2.7, z: 0.55 }], ['e3', 'carry', { x: -2.4, z: 0.4 }],
        ['shishak', 'idle', { show: 0, delay: 3500 }], ['e1', 'idle', { show: 0, delay: 3500 }], ['e2', 'idle', { show: 0, delay: 3500 }], ['e3', 'idle', { show: 0, delay: 3500 }], ['rehoboam', 'mourn', { delay: 1500 }]],
      // 놋 방패를 만들어 호위대장에게
      'p2.0': [['@env', 'day'], ['shishak', 'idle', { show: 0 }], ['e1', 'idle', { show: 0 }], ['e2', 'idle', { show: 0 }], ['e3', 'idle', { show: 0 }], ['shields', 'bronze'],
        ['rehoboam', 'idle', { x: 0.45, z: 0.15, look: -1 }], ['g1', 'idle', { show: 1, item: null }], ['g2', 'idle', { show: 1, item: null }], ['g3', 'idle', { show: 1, item: null }], ['rehoboam', 'speak', { to: 'g1', delay: 1500 }]],
      // 왕이 성전에 들어갈 때마다 — 방패를 들고 나섰다가 들여놓는다
      'p2.1': [['rehoboam', 'idle'], ['shields', 'none', { delay: 600 }], ['g1', 'idle', { item: 'shield', delay: 700 }], ['g2', 'idle', { item: 'shield', delay: 800 }], ['g3', 'idle', { item: 'shield', delay: 900 }],
        ['rehoboam', 'idle', { x: 1.05, z: -0.15, delay: 1500 }], ['g3', 'idle', { x: 0.7, z: 0.15, delay: 1700 }], ['g2', 'idle', { x: 0.35, z: 0.2, delay: 1900 }], ['g1', 'idle', { x: 0.0, z: 0.25, delay: 2100 }]],
      // 르호보암과 여로보암 사이에는 늘 전쟁
      'p2.2': [['@env', 'overcast'], ['shields', 'none'], ['rehoboam', 'idle', { x: 1.05, z: -0.15, look: -1 }], ['g1', 'idle', { item: 'shield', x: 0.0, z: 0.25, look: -1 }], ['g2', 'idle', { item: 'shield', x: 0.35, z: 0.2, look: -1 }], ['g3', 'idle', { item: 'shield', x: 0.7, z: 0.15, look: -1 }]],
      // 무너진 다윗 왕가 — 옛 사랑은 어디 있습니까
      'p2.3': [['rehoboam', 'idle', { x: 0.45, z: 0.15, look: -0.6 }], ['g1', 'idle', { x: -1.15, z: 0.1, look: 0.6 }], ['g2', 'idle', { x: -0.75, z: 0.15, look: 0.4 }], ['g3', 'idle', { x: -0.35, z: 0.2, look: 0.2 }]],
      'p2.4': [['rehoboam', 'mourn']],
      w0: [['rehoboam', 'listen', { show: 1 }]],
      w1: [['rehoboam', 'kneel']],
      w2: [['rehoboam', 'mourn']],
      end: [['@env', 'overcast'], ['shields', 'none'], ['hp', 'smoke', { show: 1 }], ['gold', null, { show: 0 }], ['rehoboam', 'idle', { x: 0.45, z: 0.15, look: -1 }],
        ['g1', 'idle', { show: 1, item: 'shield', x: -1.15, z: 0.1 }], ['g2', 'idle', { show: 1, item: 'shield', x: -0.75, z: 0.15 }], ['g3', 'idle', { show: 1, item: 'shield', x: -0.35, z: 0.2 }]],
    },
  },
};

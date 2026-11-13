/* 바울 여정 대본 묶음 d: a33–a42 (stage/paul.js가 합친다)
   가이사랴의 두 총독 앞에서 로마의 마지막 옥까지. 바울은 늙은 paulO(흰 머리, 지팡이) — 배 위·앉을 때·손에 든 것이 있으면 paulOS.
   가이사랴에서는 손목의 사슬(fetters — 열왕기 소품, 26:29 '이 결박된 것 외에는'), 로마에서는 지키는 군인과 잇는 사슬(chain2).
   주님·천사는 모습 없이 빛(beam·romecell의 빛)과 목소리로만. 파선은 기울어 멈춘 배와 널조각을 붙든 사람들로 — 모두 뭍에 오르고 아무도 잠기지 않는다.
   독사는 손에 매달렸다가 불 속으로 떨어질 뿐(상처 없음). 마지막 장면은 옥에서 쓰는 편지와 빛 — 죽음은 그리지 않는다. 소품은 props-d.js */

const look = ([x, z], [tx, tz]) => Math.atan2(tx - x, tz - z); // (x, z)에서 (tx, tz)를 보는 방향
const hide = (...ns) => ns.map(n => [n, null, { show: 0 }]);

// a33·a34 가이사랴 헤롯 궁의 접견실 — 단 위 의자 자리(소품 자리 + (x, -0.48)), 앉은 사람 y 0.28
const AZ = -0.05, SZ = AZ - 0.48, SY = 0.28;
const PF = look([0.55, 0.25], [-0.2, SZ]), PA = look([0.7, 0.28], [0, SZ]); // 단 앞 오른쪽에 선 바울이 벨릭스·아그립바를 보는 방향 (가운데에 서면 단 위 사람을 가렸다)
// a35·a36 배 위의 자리 (갑판 기준 — 고물 선실이 x ≈ -0.77, 큰 돛대가 x ≈ 0.09)
// 배가 big 1.2라 갑판 자리도 1.15배로 벌린다 (사람이 한데 겹쳐 보였다)
const boardAt = (n, x, z, look, pose = 'idle') => [n, pose, { board: 'ship', x: x * 1.15, z, look, show: 1, y: 0, item: null }];

export const D = {
  /* a33. 벨릭스가 두려워한 이야기 — 헤롯 궁의 접견실(aula): 단 위 상아 의자에 총독 벨릭스. 핀이 바닷가라 무대를 조금 뭍 쪽(동쪽)으로 옮긴다(at).
     대제사장 아나니아와 장로들, 변호사 더둘로가 왼쪽에서 들어와 고발하고, 오른쪽에 손목에 사슬을 찬 바울과 백부장. 바울이 대답하고, 벨릭스는 재판을 미룬다.
     며칠 뒤 드루실라가 곁 의자에 앉고, 바울이 의와 절제와 심판을 말하자 벨릭스가 움찔 물러앉는다. 두 해 — 해가 기울고 벨릭스는 떠나고 바울은 그대로 남는다 */
  a33: {
    env: 'day',
    wide: 1.4,
    at: [32.5, 34.95],
    props: {
      hall: ['aula', 0, AZ, { seats: [-0.2, 0.2], cushions: [null, '#2f5a6a'] }],
      bonds: ['fetters', 0.75, 0.2, { on: 'paul' }],
    },
    cast: {
      felix: ['governor', -0.2, SZ, 0, { y: SY, pose: 'sit' }],
      drusilla: ['drusilla', 0.2, SZ, 0, { y: SY, pose: 'sit' }],
      tert: ['tertullus', -2.1, 0.25, 1.4],
      hp: ['highpriest', -2.25, 0.0, 1.4],
      e1: ['elder', -2.35, 0.45, 1.4, { gaze: false }],
      e2: ['councilor', -2.45, 0.2, 1.4, { gaze: false }],
      paul: ['paulO', 0.75, 0.2, -2.2],
      cent: ['centurion', 1.1, 0.05, -1.9, { gaze: false }],
      guard: ['soldier', 1.6, -0.35, -1.3, { gaze: false }],
    },
    beats: {
      enter: [['drusilla', 'sit', { show: 1 }], ...hide('tert', 'hp', 'e1', 'e2'), ['paul', 'speak', { x: 0.55, z: 0.25, look: PF, to: 'felix' }], ['cent', 'idle', { x: 0.95, z: 0.4, look: -2.0 }],
        ['felix', 'sit', { look: 0.2 }]],
      // 고발하러 내려올 사람들은 아직 없다 — 총독이 앉아 있고 사슬 찬 바울이 서 있다
      intro: [['@env', 'day'], ['hall', 'idle'], ...hide('drusilla', 'tert', 'hp', 'e1', 'e2')],
      // 닷새 뒤 — 대제사장과 장로들, 더둘로가 왼쪽에서 들어온다
      'p0.0': [['hp', 'idle', { show: 1, x: -0.95, z: -0.05, look: look([-0.95, -0.05], [-0.2, SZ]) }], ['tert', 'idle', { show: 1, x: -0.55, z: 0.2, look: look([-0.55, 0.2], [-0.2, SZ]), delay: 300 }],
        ['e1', 'idle', { show: 1, x: -1.15, z: 0.35, look: 2.6, delay: 600 }], ['e2', 'idle', { show: 1, x: -1.3, z: 0.0, look: 2.4, delay: 900 }]],
      'p0.1': [['tert', 'speak', { to: 'felix' }]],
      'p0.2': [['tert', 'point', { look: 1.5 }]],
      'p0.3': [['tert', 'speak', { to: 'felix' }], ['hp', 'rebuke', { look: 1.4, delay: 1200 }], ['e1', 'point', { look: 1.5, delay: 1800 }]],
      // 바울의 대답 — 총독을 향해
      'p1.0': [['tert', 'idle'], ['hp', 'idle', { look: 2.6 }], ['e1', 'idle'], ['paul', 'idle', { x: 0.45, z: 0.15, look: look([0.45, 0.15], [-0.2, SZ]) }]],
      'p1.1': [['paul', 'speak', { to: 'felix' }]],
      'p1.2': [['paul', 'shrug', { look: -2.6 }]],
      'p1.3': [['paul', 'look-up', { look: -2.7 }]],
      // 재판을 미루고 — 고발한 사람들이 왼쪽으로 물러간다
      'p1.4': [['paul', 'idle'], ['felix', 'sit-speak', { to: 'tert' }], ['felix', 'sit', { delay: 2600 }],
        ['hp', 'idle', { x: -2.0, z: -0.05, delay: 2800 }], ['tert', 'idle', { x: -2.0, z: 0.25, delay: 3000 }], ['e1', 'idle', { x: -2.1, z: 0.45, delay: 3100 }], ['e2', 'idle', { x: -2.15, z: 0.05, delay: 3200 }],
        ...['hp', 'tert', 'e1', 'e2'].map((n, i) => [n, null, { show: 0, delay: 5200 + i * 200 }])],
      // 며칠 뒤 — 드루실라가 들어와 곁에 앉는다. 바울이 단 앞으로 불려 나온다
      'p2.0': [...hide('hp', 'tert', 'e1', 'e2'), ['drusilla', 'idle', { show: 1, y: 0, x: 1.3, z: -0.55, look: -1.4 }], ['drusilla', 'idle', { x: 0.2, z: SZ + 0.25, delay: 400 }],
        ['drusilla', 'sit', { y: SY, z: SZ, look: 0, delay: 3600 }], ['paul', 'idle', { x: 0.55, z: 0.25, look: PF, delay: 1500 }], ['cent', 'idle', { x: 0.95, z: 0.4, look: -2.0, delay: 1500 }]],
      // 의와 절제와 다가올 심판 — 벨릭스가 두려워한다
      'p2.1': [['drusilla', 'sit', { y: SY, x: 0.2, z: SZ, look: 0 }], ['paul', 'speak', { x: 0.55, z: 0.25, to: 'felix' }], ['paul', 'raise', { delay: 3500 }], ['felix', 'sit', { look: -0.5, delay: 3500 }]],
      'p2.2': [['paul', 'idle'], ['felix', 'sit-speak', { to: 'paul' }]],
      // 지금은 가라 — 백부장이 바울을 데리고 물러간다
      'p2.3': [['felix', 'sit-speak', { to: 'paul' }], ['paul', 'idle', { x: 0.8, z: 0.3, look: -2.2, delay: 1200 }], ['cent', 'idle', { x: 1.15, z: 0.1, delay: 1000 }]],
      // 그 뒤로도 자주 불러 — 다시 단 앞으로
      'p2.4': [['felix', 'sit'], ['paul', 'idle', { x: 0.55, z: 0.25, look: PF }], ['paul', 'speak', { to: 'felix', delay: 2400 }], ['felix', 'sit-speak', { to: 'paul', delay: 4600 }]],
      // 두 해가 흐르고 — 해가 기울고 벨릭스와 드루실라는 떠나고, 바울은 사슬에 매인 채 남는다
      'p2.5': [['@env', 'dusk'], ['paul', 'idle', { x: 0.75, z: 0.2, look: -2.2 }], ['felix', 'idle', { y: 0, x: -0.2, z: SZ + 0.3, delay: 1200 }], ['drusilla', 'idle', { y: 0, x: 0.2, z: SZ + 0.3, delay: 1400 }],
        ['felix', 'idle', { x: -1.9, z: -0.25, delay: 2600 }], ['drusilla', 'idle', { x: -1.75, z: -0.4, delay: 2900 }], ['felix', 'idle', { show: 0, delay: 6200 }], ['drusilla', 'idle', { show: 0, delay: 6400 }],
        ['paul', 'look-up', { look: -2.6, delay: 6000 }]],
      w0: [['@env', 'day'], ...hide('tert', 'hp', 'e1', 'e2'), ['drusilla', 'sit', { show: 1, y: SY, x: 0.2, z: SZ, look: 0 }], ['felix', 'sit', { show: 1, y: SY, x: -0.2, z: SZ, look: 0 }],
        ['paul', 'speak', { show: 1, x: 0.55, z: 0.25, to: 'felix' }], ['cent', 'idle', { x: 0.95, z: 0.4, look: -2.0 }]],
      w1: [['paul', 'raise', { look: PF }]],
      w2: [['paul', 'idle'], ['felix', 'sit-speak', { to: 'paul' }]],
      end: [['@env', 'day'], ...hide('tert', 'hp', 'e1', 'e2'), ['drusilla', 'sit', { show: 1, y: SY, x: 0.2, z: SZ, look: 0 }], ['felix', 'sit', { show: 1, y: SY, x: -0.2, z: SZ, look: 0.2 }],
        ['paul', 'speak', { show: 1, x: 0.55, z: 0.25, to: 'felix' }], ['cent', 'idle', { x: 0.95, z: 0.4, look: -2.0 }]],
    },
  },

  /* a34. 가이사에게 상소하노라 — 같은 접견실. 처음엔 새 총독 베스도 혼자 단 위에 앉고, 대제사장들이 다시 고발한다. 바울이 '가이사께 상소합니다' 하고 손을 든다.
     아그립바 왕과 버니게가 '크게 위엄을 갖추고'(화로에 불, 독수리 깃대, 천부장과 군사들) 들어와 단 위 가운데·오른쪽 의자에 앉는다.
     바울이 다메섹 길의 빛을 들려주고, 베스도가 일어나 '미쳤다' 외치고, 아그립바에게 묻고, 사슬 찬 손을 들어 모두를 위해 바란다 */
  a34: {
    env: 'day',
    wide: 1.45,
    at: [32.5, 34.95],
    props: {
      hall: ['aula', 0, AZ, { seats: [-0.42, 0, 0.42], backs: [false, true, false], cushions: [null, '#a8312a', '#6b2a5e'], dw: 1.5 }],
      bonds: ['fetters', 0.8, 0.25, { on: 'paul' }],
    },
    cast: {
      festus: ['festus', -0.42, SZ, 0, { y: SY, pose: 'sit' }],
      agrippa: ['agrippa', 0, SZ, 0, { y: SY, pose: 'sit' }],
      bernice: ['bernice', 0.42, SZ, 0, { y: SY, pose: 'sit' }],
      hp: ['highpriest', -0.95, 0.05, 2.4],
      c1: ['councilor', -1.2, 0.35, 2.3, { gaze: false }],
      c2: ['elder', -1.35, -0.05, 2.1, { gaze: false }],
      paul: ['paulO', 0.8, 0.25, -2.3],
      cent: ['centurion', 1.15, 0.1, -2.0, { gaze: false }],
      trib: ['tribune', -1.1, -0.45, 1.6, { gaze: false }],
      s1: ['soldier', 1.2, -0.45, -1.6, { gaze: false }],
      s2: ['soldier', -1.5, -0.4, 1.6, { gaze: false }],
    },
    beats: {
      enter: [['hall', 'pomp'], ...hide('hp', 'c1', 'c2'), ['paul', 'speak', { x: 0.7, z: 0.28, look: PA, to: 'agrippa' }], ['cent', 'idle', { x: 1.1, z: 0.45, look: -2.0 }]],
      // 새 총독 베스도가 혼자 단 위에 — 아그립바와 버니게, 위엄의 행렬은 아직 없다
      intro: [['@env', 'day'], ['hall', 'idle'], ...hide('agrippa', 'bernice', 'trib', 's1', 's2')],
      'p0.0': [['hp', 'speak', { to: 'festus' }]],
      'p0.1': [['hp', 'idle'], ['c1', 'idle', { look: 2.0 }], ['c2', 'speak', { to: 'c1' }]],
      // 가이사랴의 재판 — 무거운 죄를 들이대지만 증명하지 못한다
      'p0.2': [['c2', 'idle'], ['paul', 'idle', { x: 0.45, z: 0.2, look: look([0.45, 0.2], [-0.42, SZ]) }], ['hp', 'rebuke', { look: 1.6, delay: 1200 }], ['c1', 'point', { look: 1.5, delay: 1800 }],
        ['hp', 'shrug', { look: 2.6, delay: 5200 }], ['c1', 'idle', { delay: 5200 }]],
      'p0.3': [['hp', 'idle'], ['festus', 'sit-speak', { to: 'paul' }]],
      'p0.4': [['festus', 'sit-speak', { to: 'paul' }]],
      'p0.5': [['festus', 'sit'], ['paul', 'idle', { look: -2.5 }]],
      // 가이사께 상소합니다 — 손을 든다
      'p0.6': [['paul', 'raise', { look: -2.5 }]],
      'p1.0': [['paul', 'idle'], ['festus', 'sit-speak', { to: 'paul' }]],
      // 가이사에게 가거라 — 고발한 사람들이 물러간다
      'p1.1': [['festus', 'sit-speak', { to: 'paul' }], ['festus', 'sit', { delay: 3000 }], ['hp', 'idle', { x: -2.05, z: 0.1, delay: 2400 }], ['c1', 'idle', { x: -2.1, z: 0.4, delay: 2600 }], ['c2', 'idle', { x: -2.15, z: -0.05, delay: 2800 }],
        ['hp', 'idle', { show: 0, delay: 5600 }], ['c1', 'idle', { show: 0, delay: 5800 }], ['c2', 'idle', { show: 0, delay: 6000 }], ['paul', 'idle', { x: 0.8, z: 0.25, look: -2.3, delay: 2000 }]],
      // 아그립바 왕과 버니게가 문안하러 온다 — 베스도가 일어나 맞는다
      'p1.2': [...hide('hp', 'c1', 'c2'), ['paul', 'idle', { x: 0.8, z: 0.25, look: -2.3 }], ['festus', 'idle', { y: 0, x: -0.6, z: 0.0, look: -1.2 }],
        ['agrippa', 'idle', { show: 1, y: 0, x: -2.1, z: 0.15, look: 1.4 }], ['bernice', 'idle', { show: 1, y: 0, x: -2.25, z: 0.4, look: 1.4 }],
        ['agrippa', 'idle', { x: -1.05, z: 0.1, delay: 400 }], ['bernice', 'idle', { x: -1.15, z: 0.35, delay: 600 }], ['festus', 'bow', { look: -1.4, delay: 3600 }], ['agrippa', 'speak', { to: 'festus', delay: 4800 }]],
      // 크게 위엄을 갖추고 접견실에 — 불이 오르고 깃대가 서고, 천부장과 군사들이 늘어선다. 셋이 단 위에 앉는다
      'p1.3': [['hall', 'pomp'], ['agrippa', 'idle', { x: -1.05, z: 0.1 }], ['bernice', 'idle', { x: -1.15, z: 0.35 }], ['festus', 'idle', { x: -0.6, z: 0.0 }],
        ['trib', 'idle', { show: 1 }], ['s1', 'idle', { show: 1, delay: 300 }], ['s2', 'idle', { show: 1, delay: 500 }],
        ['agrippa', 'idle', { x: 0, z: SZ + 0.3, delay: 600 }], ['bernice', 'idle', { x: 0.42, z: SZ + 0.3, delay: 800 }], ['festus', 'idle', { x: -0.42, z: SZ + 0.3, delay: 400 }],
        ['festus', 'sit', { y: SY, z: SZ, look: 0, delay: 3800 }], ['agrippa', 'sit', { y: SY, z: SZ, look: 0, delay: 4300 }], ['bernice', 'sit', { y: SY, z: SZ, look: 0, delay: 4600 }],
        ['paul', 'idle', { x: 0.7, z: 0.28, look: PA, delay: 5000 }], ['cent', 'idle', { x: 1.1, z: 0.45, look: -2.0, delay: 5000 }]],
      // 다메섹 길에서 만난 빛과 음성
      'p1.4': [...['festus', 'agrippa', 'bernice'].map((n, i) => [n, 'sit', { show: 1, y: SY, x: [-0.42, 0, 0.42][i], z: SZ, look: 0 }]), ['paul', 'speak', { x: 0.7, z: 0.28, to: 'agrippa' }], ['paul', 'look-up', { delay: 3500 }]],
      // 바울아, 네가 미쳤구나 — 베스도가 일어나 외친다
      'p1.5': [['paul', 'idle'], ['festus', 'rebuke', { y: 0, x: -0.42, z: SZ + 0.25, look: 0.5 }]],
      'p1.6': [['festus', 'rebuke']],
      'p1.7': [['festus', 'speak', { to: 'paul' }]],
      'p2.0': [['festus', 'idle'], ['paul', 'speak', { to: 'festus' }]],
      'p2.1': [['paul', 'speak', { to: 'festus' }], ['festus', 'sit', { y: SY, z: SZ, look: 0, delay: 2800 }]],
      'p2.2': [['paul', 'speak', { to: 'festus' }]],
      // 아그립바 왕이시여 — 바울이 왕을 향한다
      'p2.3': [['festus', 'sit', { y: SY, z: SZ, look: 0 }], ['paul', 'speak', { to: 'agrippa' }]],
      'p2.4': [['paul', 'bless', { look: PA }]],
      'p2.5': [['paul', 'idle'], ['agrippa', 'sit', { look: 0.2 }]],
      'p2.6': [['agrippa', 'sit-speak', { to: 'paul' }], ['bernice', 'sit', { look: -0.8 }]],
      // 이 사슬 말고는 — 사슬 찬 두 손을 들어
      'p2.7': [['agrippa', 'sit'], ['paul', 'idle', { look: PA }]],
      'p2.8': [['paul', 'raise', { look: PA }]],
      w0: [['@env', 'day'], ['hall', 'pomp'], ...hide('hp', 'c1', 'c2'), ['trib', 'idle', { show: 1 }], ['s1', 'idle', { show: 1 }], ['s2', 'idle', { show: 1 }],
        ...['festus', 'agrippa', 'bernice'].map((n, i) => [n, 'sit', { show: 1, y: SY, x: [-0.42, 0, 0.42][i], z: SZ, look: 0 }]),
        ['paul', 'speak', { show: 1, x: 0.7, z: 0.28, to: 'agrippa' }], ['cent', 'idle', { x: 1.1, z: 0.45, look: -2.0 }]],
      w1: [['paul', 'raise', { look: PA }]],
      w2: [['paul', 'idle'], ['agrippa', 'sit-speak', { to: 'festus' }]],
      end: [['@env', 'day'], ['hall', 'pomp'], ...hide('hp', 'c1', 'c2'), ['trib', 'idle', { show: 1 }], ['s1', 'idle', { show: 1 }], ['s2', 'idle', { show: 1 }],
        ...['festus', 'agrippa', 'bernice'].map((n, i) => [n, 'sit', { show: 1, y: SY, x: [-0.42, 0, 0.42][i], z: SZ, look: 0 }]),
        ['paul', 'raise', { show: 1, x: 0.7, z: 0.28, look: PA }], ['cent', 'idle', { x: 1.1, z: 0.45, look: -2.0 }]],
    },
  },

  /* a35. 유라굴로 광풍 — 그레데 앞바다의 알렉산드리아 곡물선(stormship). 처음엔 순한 바다에 돛을 펴고 간다. 바울이 백부장 율리오에게 '이번 항해는 위험하다' 말하지만,
     백부장은 선장과 선주의 말을 따르고, 선주는 서쪽(뵈닉스)을 가리킨다. 남풍에 닻을 올리고 — 섬에서 내리치는 광풍: 하늘을 덮는 먹구름(stormcloud)과 비,
     높은 물결. 돛을 내리고 밧줄로 선체를 감아 매고(girded), 사공들이 짐을 바다에 던진다(cargo). 해도 별도 없이 — 사람들이 웅크린다 */
  a35: {
    env: 'calm',
    wide: 1.45,
    props: {
      sea: ['water', 0, 0, { r: 2.5, y: 0.07 }],
      ship: ['stormship', 0, 0.02, { big: 1.2, state: 'sail', y: 0.06 }],
      cargo: ['cargo', 0, 0.02, { y: 0.33, s: 1.2 }],
      sky: ['stormcloud', 0, 0, { hx: -2.0, hz: -1.0 }],
      rain: ['rain', 0, 0],
    },
    cast: {
      paul: ['paulOS', -0.3, 0.06, 1.2, { board: 'ship' }],
      luke: ['luke', -0.5, -0.1, 1.3, { board: 'ship', gaze: false }],
      ari: ['aristarchus', -0.52, 0.14, 1.2, { board: 'ship', gaze: false }],
      julius: ['centurion', 0.3, 0.02, -1.3, { board: 'ship' }],
      captain: ['sailor', 0.5, -0.12, -1.4, { board: 'ship' }],
      owner: ['shipowner', 0.55, 0.14, -1.5, { board: 'ship' }],
      sailor: ['sailor', 0.72, 0.0, -1.2, { board: 'ship', gaze: false }],
    },
    beats: {
      enter: [['@env', 'storm'], ['ship', 'girded'], ['cargo', 'gone'], ['sky', 'storm'], ['paul', 'kneel', { look: 1.2 }], ['luke', 'cower'], ['ari', 'cower'], ['julius', 'afraid'], ['captain', 'afraid'], ['owner', 'cower'], ['sailor', 'carry-pole']],
      // 순한 바다 — 배에 오른 일행 (탄 사람은 다시 태운다)
      intro: [['@env', 'calm'], ['ship', 'sail'], ['cargo', 'stow'], ['sky', 'none'],
        boardAt('paul', -0.3, 0.06, 1.2), boardAt('luke', -0.5, -0.1, 1.3), boardAt('ari', -0.52, 0.14, 1.2), boardAt('julius', 0.3, 0.02, -1.3),
        boardAt('captain', 0.5, -0.12, -1.4), boardAt('owner', 0.55, 0.14, -1.5), boardAt('sailor', 0.72, 0.0, -1.2)],
      'p0.0': [['julius', 'speak', { to: 'paul' }], ['julius', 'idle', { delay: 3500 }]],
      'p0.1': [['ari', 'idle', { look: 1.6 }], ['paul', 'idle', { look: -1.4 }]],
      'p0.2': [['julius', 'bless', { look: -1.3 }], ['paul', 'bow', { look: 1.3, delay: 600 }], ['julius', 'idle', { delay: 3200 }], ['paul', 'idle', { look: 1.2, delay: 3200 }]],
      // 바람이 막아 느릿느릿 — 하늘이 흐려진다
      'p0.3': [['@env', 'overcast'], ['sailor', 'carry-pole', { look: -1.2 }], ['captain', 'point', { look: 1.0 }]],
      // 바다가 위험한 철 — 바울이 경고한다
      'p1.0': [['@env', 'overcast'], ['sailor', 'idle'], ['captain', 'idle', { look: -1.4 }]],
      'p1.1': [['paul', 'idle', { x: -0.12, z: 0.06, look: 1.2 }]],
      'p1.2': [['paul', 'speak', { x: -0.12, z: 0.06, to: 'julius' }]],
      // 백부장은 선장과 선주의 말을 더 믿었다
      'p1.3': [['paul', 'idle'], ['julius', 'idle', { look: 1.0 }], ['owner', 'speak', { to: 'julius', delay: 600 }]],
      // 서쪽 항구 뵈닉스로 — 선주가 서쪽(왼쪽)을 가리킨다
      'p1.4': [['owner', 'point', { look: -1.6 }], ['captain', 'speak', { to: 'julius', delay: 2600 }]],
      // 남풍이 순하게 — 닻을 올리고 돛을 편다
      'p2.0': [['@env', 'calm'], ['owner', 'idle'], ['captain', 'idle', { look: -1.6 }], ['sailor', 'carry-pole', { look: 1.2 }], ['ship', 'sail'], ['julius', 'idle', { look: -1.6 }]],
      // 유라굴로 — 섬에서 내리치는 광풍
      'p2.1': [['@env', 'storm'], ['sky', 'storm'], ['sailor', 'afraid'], ['captain', 'afraid', { delay: 400 }], ['owner', 'afraid', { delay: 600 }], ['julius', 'afraid', { delay: 800 }], ['luke', 'cower', { delay: 900 }]],
      // 떠밀려 간다 — 돛을 내린다
      'p2.2': [['ship', 'furled'], ['sailor', 'carry-pole'], ['captain', 'carry-pole', { look: 1.6 }], ['ari', 'cower']],
      // 줄로 배를 감아 매고, 짐을, 기구를 바다에 던진다
      'p2.3': [['ship', 'girded'], ['sailor', 'hurl', { look: 0.2 }], ['captain', 'hurl', { look: 0.2, delay: 600 }], ['owner', 'mourn', { delay: 900 }], ['cargo', 'throw', { delay: 1200 }]],
      // 해도 별도 없이 — 살 소망이 끊어진다
      'p2.4': [['cargo', 'gone'], ['sailor', 'cower'], ['captain', 'afraid'], ['owner', 'cower'], ['julius', 'mourn'], ['luke', 'cower'], ['ari', 'cower'], ['paul', 'kneel', { look: 1.2 }]],
      w0: [['@env', 'overcast'], ['sky', 'none'], ['ship', 'sail'], ['cargo', 'stow'], ['paul', 'speak', { x: -0.12, z: 0.06, to: 'julius' }], ['julius', 'idle', { look: -1.3 }], ['owner', 'idle'], ['captain', 'idle'], ['sailor', 'idle'], ['luke', 'idle'], ['ari', 'idle']],
      w1: [['@env', 'storm'], ['sky', 'storm'], ['ship', 'girded'], ['cargo', 'gone'], ['paul', 'kneel', { look: 1.2 }], ['julius', 'mourn'], ['owner', 'cower'], ['captain', 'afraid'], ['sailor', 'cower'], ['luke', 'cower'], ['ari', 'cower']],
      end: [['@env', 'storm'], ['sky', 'storm'], ['ship', 'girded'], ['cargo', 'gone'], ['paul', 'kneel', { look: 1.2 }], ['julius', 'mourn'], ['owner', 'cower'], ['captain', 'afraid'], ['sailor', 'cower'], ['luke', 'cower'], ['ari', 'cower']],
    },
  },

  /* a36. 한 사람도 잃지 않으리라 — 아드리아 바다의 밤. 감아 맨 배 위에서 바울이 일어나 말하고, 천사의 말씀은 바울 곁에 내리는 빛(beam)으로만.
     열나흘째 밤: 고물에서 닻 넷(anchors), 사공들이 구명배(skiff)로 달아나려 하고, 바울의 말에 군인들이 줄을 끊는다(빈 배가 떠내려가 사라진다).
     새벽 — 바울이 빵을 들어 감사하고 모두 먹는다. 날이 밝자 오른쪽에 모래밭 만(sand) — 배가 이물(+x)부터 나아가 박히게 뭍을 오른쪽에 둔다 — 배가 모래톱에 박혀 기울고 고물이 부서진다(wreck).
     군인이 칼에 손을 대자 백부장이 막는다. 헤엄치는 사람과 널조각(plank)을 붙든 사람들이 물을 건너 — 모두 모래밭에 오른다(잠기는 사람 없음) */
  a36: {
    env: 'night',
    wide: 1.5,
    props: {
      shore: ['sand', 2.35, -0.05, { r: 1.3, color: '#d8c49a', stones: 10, over: true }],
      sea: ['water', -0.45, 0, { r: 2.2, y: 0.07 }],
      ship: ['stormship', -0.45, 0.0, { big: 1.2, state: 'girded', y: 0.06, speed: 0.16 }],
      anchors: ['anchors', -1.75, 0.0, { y: 0.3 }],
      skiff: ['skiff', -0.1, 0.62, { small: 0.55, rope: [-0.2, 0.3, -0.42] }],
      word: ['beam', -0.12, 0.02, { r: 0.3, h: 2.4 }],
      p1: ['plank', 1.05, 0.25, { on: 'luke', rot: 0.4 }],
      p2: ['plank', 1.0, -0.1, { on: 'ari', rot: -0.3 }],
      p3: ['plank', 1.1, 0.45, { on: 'sailor', rot: 0.9, len: 0.36 }],
      sky: ['stormcloud', 0, 0, { hx: -2.0, hz: -1.0 }],
    },
    cast: {
      paul: ['paulOS', 0.0, 0.04, 1.3, { board: 'ship' }],
      luke: ['luke', -0.45, -0.1, 1.3, { board: 'ship', gaze: false }],
      ari: ['aristarchus', -0.5, 0.14, 1.2, { board: 'ship', gaze: false }],
      julius: ['centurion', 0.35, 0.04, -1.3, { board: 'ship' }],
      soldier: ['soldier', 0.55, -0.12, -1.4, { board: 'ship' }],
      sailor: ['sailor', 0.62, 0.15, -1.3, { board: 'ship', gaze: false }],
      sailor2: ['sailor', -0.55, -0.02, -1.4, { board: 'ship', gaze: false }],
    },
    beats: {
      enter: [['@env', 'overcast'], ['shore', null, { show: 1 }], ['ship', 'wreck', { x: 0.55, z: 0.0 }], ['anchors', null, { show: 0 }], ['skiff', null, { show: 0 }], ['word', null, { show: 0 }], ['sky', 'none'],
        ['paul', 'pray', { board: null, x: 2.0, z: 0.05, look: -1.4 }], ['luke', 'kneel', { board: null, x: 2.25, z: 0.3, look: -1.2 }], ['ari', 'idle', { board: null, x: 2.3, z: -0.25, look: -1.3 }],
        ['julius', 'idle', { board: null, x: 1.75, z: -0.3, look: -1.2 }], ['soldier', 'idle', { board: null, x: 2.55, z: 0.05, look: -1.3 }], ['sailor', 'sit-ground', { board: null, x: 1.8, z: 0.45, look: -1.0 }],
        ['sailor2', 'kneel', { board: null, x: 2.5, z: 0.4, look: -1.0 }], ...hide('p1', 'p2', 'p3')],
      // 밤바다 — 감아 맨 배, 오래 먹지 못한 사람들 (탄 사람은 다시 태운다)
      // 모래밭(멜리데 바닷가)은 날이 밝을 때(p2.1)에야 — 밤바다 한가운데 배 뒤에 흰 모래밭이 떠 있었다(사용자)
      intro: [['@env', 'night'], ['shore', null, { show: 0 }], ['ship', 'girded', { x: -0.45, z: 0.0 }], ['anchors', 'up'], ['skiff', 'down', { show: 0 }], ['word', null, { show: 0 }], ['sky', 'storm'], ...hide('p1', 'p2', 'p3'),
        boardAt('paul', 0.0, 0.04, 1.3), boardAt('luke', -0.45, -0.1, 1.3, 'sit-ground'), boardAt('ari', -0.5, 0.14, 1.2, 'sit-ground'), boardAt('julius', 0.35, 0.04, -1.3, 'mourn'),
        boardAt('soldier', 0.55, -0.12, -1.4, 'sit-ground'), boardAt('sailor', 0.62, 0.15, -1.3, 'sit-ground'), boardAt('sailor2', -0.55, -0.02, -1.4, 'cower')],
      // 바울이 일어나 말한다
      'p0.0': [['paul', 'idle', { look: 1.3 }], ['paul', 'speak', { to: 'julius', delay: 1200 }]],
      'p0.1': [['paul', 'bless', { look: 1.3 }], ['julius', 'idle', { look: -1.3 }]],
      'p0.2': [['paul', 'speak', { to: 'julius' }], ['soldier', 'listen', { look: -1.5 }]],
      // 어젯밤 하나님의 천사가 곁에 서서 — 빛으로만
      'p0.3': [['paul', 'look-up', { look: 1.0 }], ['word', null, { show: 1 }]],
      'p0.4': [['word', null, { show: 1 }], ['paul', 'listen', { look: 1.0 }]],
      'p0.5': [['word', null, { show: 1 }]],
      'p0.6': [['word', null, { show: 1 }], ['paul', 'raise', { look: 1.3, delay: 1500 }], ['word', null, { show: 0, delay: 4500 }]],
      // 열나흘째 밤 — 고물에서 닻 넷을 내린다
      'p1.0': [['word', null, { show: 0 }], ['paul', 'idle'], ['sailor2', 'carry-pole', { x: -0.7, z: 0.0, look: -1.4 }], ['anchors', 'down', { delay: 1200 }]],
      // 몰래 구명배로 — 뱃전에 붙은 사공
      'p1.1': [['anchors', 'down'], ['skiff', 'down', { show: 1 }], ['sailor', 'idle', { x: 0.52, z: 0.2, look: 0.2, delay: 600 }], ['sailor', 'bow', { delay: 2600 }],
        ['sailor2', 'idle', { x: 0.3, z: 0.18, look: 0.4, delay: 900 }]],
      // 바울이 백부장과 군인들에게
      'p1.2': [['julius', 'idle', { look: -1.3 }], ['soldier', 'idle', { look: -1.5 }], ['paul', 'point', { look: 0.6 }]],
      'p1.3': [['paul', 'speak', { to: 'julius' }]],
      // 군인들이 구명배 줄을 끊는다 — 빈 배가 떠내려간다
      'p1.4': [['paul', 'idle'], ['soldier', 'idle', { x: 0.63, z: 0.15, look: 0.2 }], ['soldier', 'hurl', { look: 0.2, delay: 1400 }], ['skiff', 'cut', { delay: 1800 }],
        ['sailor', 'afraid', { delay: 1800 }], ['sailor2', 'afraid', { delay: 2000 }]],
      // 날이 샐 무렵 — 빵을 들고 감사한다
      'p1.5': [['@env', 'dawn'], ['sky', 'none'], ['skiff', 'cut', { show: 0 }], ['soldier', 'sit-ground'], ['sailor', 'sit-ground', { x: 0.71, z: 0.15 }], ['sailor2', 'sit-ground', { x: -0.23, z: -0.12 }], ['julius', 'sit-ground'],
        ['luke', 'sit-ground'], ['ari', 'sit-ground'], ['paul', 'look-up', { item: 'bread', look: 1.3 }], ['paul', 'break', { delay: 3200 }]],
      'p1.6': [['paul', 'sit-ground', { item: 'bread' }], ['luke', 'sit-ground', { item: 'bread' }], ['ari', 'sit-ground', { item: 'bread', delay: 300 }], ['julius', 'sit-ground', { item: 'bread', delay: 600 }],
        ['soldier', 'sit-ground', { item: 'bread', delay: 900 }], ['sailor', 'sit-ground', { item: 'bread', delay: 1200 }]],
      // 이백칠십육 명 — 모두 일어선다
      'p2.0': [...['paul', 'luke', 'ari', 'julius', 'soldier', 'sailor', 'sailor2'].map(n => [n, 'idle', { item: null }]), ['anchors', 'up']],
      // 날이 밝자 모래밭 만 — 배가 모래톱에 박혀 고물이 부서진다
      'p2.1': [['@env', 'overcast'], ['shore', null, { show: 1 }], ['anchors', 'up'], ['ship', 'girded', { x: 0.55, z: 0.0 }], ['ship', 'wreck', { delay: 5200 }], ['paul', 'point', { look: 1.4, delay: 1000 }],
        ['luke', 'afraid', { delay: 5400 }], ['ari', 'afraid', { delay: 5600 }], ['sailor', 'afraid', { delay: 5800 }]],
      // 군인들이 죄수들을 — 백부장이 막는다
      'p2.2': [['ship', 'wreck', { x: 0.55, z: 0.0 }], ['soldier', 'rebuke', { look: -1.5 }], ['julius', 'rebuke', { look: 1.3, delay: 1600 }], ['soldier', 'idle', { look: 1.3, delay: 4200 }]],
      // 헤엄치는 사람은 먼저, 나머지는 널조각을 붙들고 — 물을 건너 모래밭으로
      'p2.3': [['julius', 'idle'], ['soldier', 'idle'],
        ['sailor', 'idle', { board: null, x: 1.3, z: 0.42, y: -0.32 }], ['p3', null, { show: 1 }], ['sailor', 'idle', { x: 1.85, z: 0.45, delay: 300 }],
        ['sailor2', 'idle', { board: null, x: 1.25, z: -0.3, y: -0.32, delay: 500 }], ['sailor2', 'idle', { x: 1.95, z: -0.32, delay: 800 }],
        ['luke', 'idle', { board: null, x: 1.25, z: 0.2, y: -0.32, delay: 1400 }], ['p1', null, { show: 1, delay: 1400 }], ['luke', 'idle', { x: 1.9, z: 0.22, delay: 1700 }],
        ['ari', 'idle', { board: null, x: 1.3, z: -0.05, y: -0.32, delay: 2000 }], ['p2', null, { show: 1, delay: 2000 }], ['ari', 'idle', { x: 2.0, z: -0.05, delay: 2300 }],
        ['sailor', 'idle', { y: 0, delay: 5200 }], ['sailor2', 'idle', { y: 0, delay: 5400 }], ['luke', 'idle', { y: 0, delay: 6200 }], ['ari', 'idle', { y: 0, delay: 6600 }],
        ['p3', null, { show: 0, delay: 5000 }], ['p1', null, { show: 0, delay: 6000 }], ['p2', null, { show: 0, delay: 6400 }]],
      // 마침내 모두가 무사히 뭍에
      'p2.4': [...hide('p1', 'p2', 'p3'), ['sailor', 'sit-ground', { board: null, x: 1.85, z: 0.45, y: 0, look: -1.0 }], ['sailor2', 'kneel', { board: null, x: 2.45, z: 0.4, y: 0, look: -1.0 }],
        ['luke', 'kneel', { board: null, x: 2.25, z: 0.3, y: 0, look: -1.2 }], ['ari', 'idle', { board: null, x: 2.3, z: -0.25, y: 0, look: -1.3 }],
        ['julius', 'idle', { board: null, x: 1.25, z: -0.3, y: -0.32 }], ['julius', 'idle', { x: 1.75, z: -0.3, delay: 300 }], ['julius', 'idle', { y: 0, look: -1.2, delay: 3500 }],
        ['soldier', 'idle', { board: null, x: 1.3, z: 0.05, y: -0.32, delay: 400 }], ['soldier', 'idle', { x: 2.0, z: 0.05, delay: 700 }], ['soldier', 'idle', { y: 0, look: -1.3, delay: 4200 }],
        ['paul', 'idle', { board: null, x: 1.3, z: 0.15, y: -0.32, delay: 900 }], ['paul', 'idle', { x: 1.85, z: 0.05, delay: 1200 }], ['paul', 'idle', { y: 0, delay: 4800 }], ['paul', 'pray', { look: -1.4, delay: 5600 }]],
      w0: [['@env', 'night'], ['ship', 'girded', { x: -0.45, z: 0.0 }], ['sky', 'storm'], ['word', null, { show: 1 }], ...hide('p1', 'p2', 'p3'),
        boardAt('paul', 0.0, 0.04, 1.0, 'listen'), boardAt('luke', -0.45, -0.1, 1.3, 'sit-ground'), boardAt('ari', -0.5, 0.14, 1.2, 'sit-ground'), boardAt('julius', 0.35, 0.04, -1.3, 'mourn'),
        boardAt('soldier', 0.55, -0.12, -1.4, 'sit-ground'), boardAt('sailor', 0.62, 0.15, -1.3, 'sit-ground'), boardAt('sailor2', -0.55, -0.02, -1.4, 'cower')],
      w1: [['word', null, { show: 0 }], ['paul', 'speak', { to: 'julius' }]],
      w2: [['skiff', 'down', { show: 1 }], ['paul', 'point', { look: 0.6 }], ['paul', 'speak', { to: 'julius', delay: 2000 }]],
      end: [['@env', 'overcast'], ['ship', 'wreck', { x: 0.55, z: 0.0 }], ['anchors', 'up'], ['skiff', 'cut', { show: 0 }], ['word', null, { show: 0 }], ['sky', 'none'], ...hide('p1', 'p2', 'p3'),
        ['paul', 'pray', { board: null, x: 1.85, z: 0.05, y: 0, look: -1.4 }], ['luke', 'kneel', { board: null, x: 2.25, z: 0.3, y: 0, look: -1.2 }], ['ari', 'idle', { board: null, x: 2.3, z: -0.25, y: 0, look: -1.3 }],
        ['julius', 'idle', { board: null, x: 1.75, z: -0.3, y: 0, look: -1.2 }], ['soldier', 'idle', { board: null, x: 2.0, z: 0.05, y: 0, look: -1.3 }], ['sailor', 'sit-ground', { board: null, x: 1.85, z: 0.45, y: 0, look: -1.0 }],
        ['sailor2', 'kneel', { board: null, x: 2.45, z: 0.4, y: 0, look: -1.0 }]],
    },
  },

  /* a37. 독사를 떨어 버린 손 — 멜리데 바닷가의 빗속 모닥불(campfires). 젖은 일행이 왼쪽에서 올라오고, 섬 사람들이 불가로 맞아들인다.
     바울이 나뭇가지(sticks)를 모아 불에 넣자 독사가 손에 매달린다(viper — 피·상처 없음). 섬 사람들이 수군거리고, 바울은 그것을 불 속에 떨어 버린다.
     오래 지켜보던 사람들이 엎드린다(신이라 한다). 오른쪽에 보블리오의 집 — 앞 침상에 누운 아버지에게 바울이 기도하고 손을 얹자(빛) 일어나 앉는다.
     다른 병자들이 찾아오고, 떠날 때 쓸 것(provisions)을 내어 준다 */
  a37: {
    env: 'overcast',
    wide: 1.45,
    props: {
      fire: ['campfires', -0.35, 0.2, { spots: [[0, 0]], scale: 2.2 }], // 진영의 모닥불 하나를 크게 — 빗속에 둘러선 사람들의 불
      sticks: ['sticks', -0.9, 0.55],
      snake: ['viper', -0.7, 0.2, { on: 'paul', hand: [0.13, 0.4, 0.1], fire: [0.3, 0.02] }],
      home: ['house', 1.75, -0.55, { stair: false, wall: '#d8c8a8' }],
      bed: ['couch', 1.35, 0.15],
      heal: ['beam', 1.35, 0.15, { r: 0.3, h: 2.2 }],
      gifts: ['provisions', 0.45, 0.6, { kind: 'food' }],
      rain: ['rain', 0, 0],
    },
    cast: {
      paul: ['paulOS', -2.1, 0.3, 1.3],
      luke: ['luke', -2.3, 0.05, 1.3, { gaze: false }],
      ari: ['aristarchus', -2.35, 0.5, 1.3, { gaze: false }],
      julius: ['centurion', -2.5, 0.25, 1.3, { gaze: false }],
      i1: ['islander', 0.05, 0.05, -1.3],
      i2: ['islander', 0.1, 0.45, -1.6],
      iw: ['islanderW', -0.15, -0.2, -0.6],
      publius: ['publius', 1.6, -0.1, -1.2],
      father: ['elder', 1.35, 0.15, 1.6, { y: 0.13, pose: 'sleep' }],
      sick1: ['lame', 2.4, 0.5, -1.4, { gaze: false }],
      sick2: ['islanderW', 2.5, 0.2, -1.4, { gaze: false }],
    },
    beats: {
      enter: [['@env', 'overcast'], ['snake', 'none'], ['sticks', null, { show: 0 }], ['heal', null, { show: 0 }], ['gifts', null, { show: 0 }], ...hide('sick1', 'sick2'),
        ['paul', 'raise', { x: -0.7, z: 0.2, look: 1.3 }], ['luke', 'idle', { x: -1.0, z: -0.05, look: 1.2 }], ['ari', 'idle', { x: -1.05, z: 0.45, look: 1.2 }], ['julius', 'idle', { x: -1.25, z: 0.15, look: 1.3 }],
        ['i1', 'bow', { look: -1.3 }], ['i2', 'kneel', { look: -1.6 }], ['iw', 'afraid', { look: -0.8 }]],
      // 바닷가 — 일행은 아직 물가(왼쪽)에, 섬 사람들이 불을 피운다
      intro: [['@env', 'overcast'], ['fire', 'lit'], ['snake', 'none'], ['heal', null, { show: 0 }], ['gifts', null, { show: 0 }], ['publius', 'idle', { show: 0 }], ...hide('sick1', 'sick2'),
        ['father', 'sleep', { y: 0.13 }], ['i1', 'idle', { look: -1.0 }]],
      'p0.0': [['paul', 'idle', { x: -1.45, z: 0.3, look: 1.3 }], ['luke', 'idle', { x: -1.7, z: 0.0, delay: 300 }], ['ari', 'idle', { x: -1.65, z: 0.55, delay: 500 }], ['julius', 'idle', { x: -1.9, z: 0.25, delay: 700 }]],
      // 비가 내리고 추운데 — 섬 사람들이 불가로 맞아들인다
      'p0.1': [['@env', 'storm'], ['i1', 'bless', { look: -1.3 }], ['iw', 'idle', { look: -1.0 }], ['i1', 'idle', { delay: 3500 }],
        ['luke', 'idle', { x: -1.0, z: -0.05, look: 1.2, delay: 1500 }], ['ari', 'idle', { x: -1.05, z: 0.45, look: 1.2, delay: 1700 }], ['julius', 'idle', { x: -1.25, z: 0.15, look: 1.3, delay: 1900 }],
        ['paul', 'idle', { x: -0.95, z: 0.62, look: 1.5, delay: 1300 }]],
      // 나뭇가지를 모아 불에 넣자 — 독사가 손에 매달린다
      'p0.2': [['paul', 'bow', { x: -0.95, z: 0.62, look: 0.6 }], ['sticks', null, { show: 0, delay: 1800 }], ['paul', 'idle', { x: -0.7, z: 0.2, look: 1.3, delay: 2000 }],
        ['paul', 'bow', { look: 1.3, delay: 4200 }], ['fire', 'lit'], ['snake', 'bite', { delay: 5600 }], ['paul', 'idle', { look: 1.3, delay: 5600 }], ['iw', 'afraid', { look: -0.8, delay: 5900 }]],
      // 섬 사람들이 서로 — 살인자다
      'p1.0': [['snake', 'bite'], ['paul', 'idle', { x: -0.7, z: 0.2, look: 1.3 }], ['i1', 'idle', { look: -1.0 }], ['i2', 'speak', { to: 'i1' }]],
      'p1.1': [['i2', 'point', { look: -1.6 }], ['i1', 'speak', { to: 'i2', delay: 1500 }]],
      'p1.2': [['i2', 'idle'], ['i1', 'speak', { to: 'iw' }], ['iw', 'afraid']],
      // 불 속에 떨어 버린다 — 아무 해도 없다
      'p1.3': [['i1', 'idle'], ['paul', 'point', { look: 1.3 }], ['snake', 'shake', { delay: 300 }], ['paul', 'idle', { look: 1.3, delay: 2200 }]],
      // 붓거나 쓰러질 줄 알고 오래 지켜본다
      'p1.4': [['snake', 'none'], ['i1', 'listen', { look: -1.3 }], ['i2', 'listen', { look: -1.6 }], ['iw', 'idle', { look: -0.8 }], ['@env', 'overcast', { delay: 2500 }]],
      // 생각을 바꾸어 신이라 한다 — 엎드린다
      'p1.5': [['@env', 'overcast'], ['i1', 'bow', { look: -1.3 }], ['i2', 'kneel', { look: -1.6, delay: 500 }], ['iw', 'bow', { look: -0.8, delay: 900 }], ['paul', 'raise', { look: 1.3, delay: 2600 }]],
      // 보블리오의 땅 — 집 앞에 나와 일행을 맞는다
      'p2.0': [['@env', 'day'], ['i1', 'idle'], ['i2', 'idle'], ['iw', 'idle'], ['paul', 'idle'], ['publius', 'idle', { show: 1, x: 1.6, z: -0.1, look: -1.2 }]],
      'p2.1': [['publius', 'bless', { look: -1.3 }], ['paul', 'idle', { x: 0.75, z: 0.0, look: 1.3, delay: 600 }], ['luke', 'idle', { x: 0.45, z: -0.25, look: 1.2, delay: 900 }], ['julius', 'idle', { x: 0.4, z: 0.3, look: 1.3, delay: 1100 }],
        ['publius', 'speak', { to: 'paul', delay: 3500 }]],
      // 열병과 이질로 누운 아버지
      'p2.2': [['publius', 'idle', { look: -0.8 }], ['paul', 'idle', { x: 0.75, z: 0.0, look: 1.0 }]],
      // 들어가 기도하고 손을 얹어 — 빛, 일어나 앉는다
      'p2.3': [['paul', 'kneel', { x: 1.05, z: 0.3, look: 1.4 }], ['paul', 'pray', { delay: 1200 }], ['heal', null, { show: 1, delay: 2400 }], ['paul', 'bless', { look: 1.3, delay: 3600 }],
        ['father', 'sit', { y: 0.13, look: -1.3, delay: 5200 }], ['heal', null, { show: 0, delay: 7000 }], ['publius', 'raise', { delay: 5600 }]],
      // 다른 병자들도 찾아와 고침을 받는다
      'p2.4': [['heal', null, { show: 0 }], ['father', 'sit', { y: 0.13, look: -1.3 }], ['publius', 'idle'], ['paul', 'idle', { x: 1.0, z: 0.5, look: 1.3 }],
        ['sick1', 'idle', { show: 1, x: 1.55, z: 0.6 }], ['sick2', 'idle', { show: 1, x: 1.7, z: 0.35, delay: 400 }], ['paul', 'bless', { look: 1.4, delay: 3200 }], ['sick1', 'raise', { delay: 4600 }], ['sick2', 'kneel', { delay: 5000 }]],
      // 떠날 때 쓸 것을 실어 준다
      'p2.5': [['sick1', 'idle'], ['sick2', 'idle'], ['paul', 'idle'], ['i1', 'idle', { x: 0.75, z: 0.55, look: -1.0 }], ['gifts', null, { show: 0.5, delay: 1500 }], ['gifts', null, { show: 1, delay: 3000 }],
        ['i1', 'bless', { look: 1.6, delay: 3200 }], ['paul', 'bow', { look: -1.6, delay: 3600 }]],
      w0: [['@env', 'overcast'], ['heal', null, { show: 0 }], ['gifts', null, { show: 0 }], ['publius', 'idle', { show: 0 }], ...hide('sick1', 'sick2'),
        ['paul', 'idle', { x: -0.7, z: 0.2, look: 1.3 }], ['snake', 'bite'], ['i1', 'speak', { x: 0.05, z: 0.05, to: 'i2' }], ['i2', 'point', { x: 0.1, z: 0.45, look: -1.6 }], ['iw', 'afraid', { x: -0.15, z: -0.2, look: -0.8 }],
        ['luke', 'idle', { x: -1.0, z: -0.05, look: 1.2 }], ['ari', 'idle', { x: -1.05, z: 0.45, look: 1.2 }], ['julius', 'idle', { x: -1.25, z: 0.15, look: 1.3 }]],
      w1: [['i1', 'idle'], ['i2', 'idle'], ['snake', 'shake'], ['paul', 'point', { look: 1.3 }], ['paul', 'idle', { delay: 2200 }]],
      end: [['@env', 'overcast'], ['snake', 'none'], ['heal', null, { show: 0 }], ['gifts', null, { show: 0 }], ['publius', 'idle', { show: 0 }], ...hide('sick1', 'sick2'),
        ['paul', 'raise', { x: -0.7, z: 0.2, look: 1.3 }], ['luke', 'idle', { x: -1.0, z: -0.05, look: 1.2 }], ['ari', 'idle', { x: -1.05, z: 0.45, look: 1.2 }], ['julius', 'idle', { x: -1.25, z: 0.15, look: 1.3 }],
        ['i1', 'bow', { x: 0.05, z: 0.05, look: -1.3 }], ['i2', 'kneel', { x: 0.1, z: 0.45, look: -1.6 }], ['iw', 'bow', { x: -0.15, z: -0.2, look: -0.8 }]],
    },
  },

  /* a38. 압비오 광장에 마중 나온 형제들 — 아피아 길(road)이 오른쪽 아래(보디올 쪽)에서 왼쪽 위(로마 쪽)로, 길가에 장터 마을의 집과 기둥 회랑, 멀리 로마(farcity).
     죄수 바울과 백부장·군사·누가·아리스다고가 오른쪽에서 걸어오고, 로마의 형제들이 왼쪽에서 마중 나온다. 바울이 하늘을 우러러 감사하고 형제와 끌어안는다.
     한 형제가 삼 년 전 바울의 편지(로마서 두루마리)를 들어 보인다. 모두 함께 로마 쪽으로 — 성에 닿기 전에 사라진다 */
  a38: {
    env: 'day',
    wide: 1.45,
    props: {
      road: ['road', 0, 0.05, { len: 5.4, w: 0.44, rot: -0.22 }],
      rome: ['farcity', -2.1, -0.85, { dia: 1.0 }],
      inn: ['house', 0.55, -0.75, { stair: false, wall: '#d8c4a0' }],
      forum: ['colonnade', -0.75, -0.8, { w: 1.4, n: 5, h: 0.72, shops: true }],
    },
    cast: {
      paul: ['paulO', 2.1, 0.55, -1.3],
      luke: ['luke', 2.35, 0.35, -1.3, { gaze: false }],
      ari: ['aristarchus', 2.4, 0.75, -1.3, { gaze: false }],
      julius: ['centurion', 1.85, 0.3, -1.3],
      soldier: ['soldier', 2.55, 0.55, -1.3, { gaze: false }],
      b1: ['greek2', -2.2, -0.35, 1.3],
      b2: ['greekW', -2.35, -0.1, 1.3, { gaze: false }],
      b3: ['greek', -2.4, -0.55, 1.3, { gaze: false }],
      b4: ['townsman', -2.5, -0.3, 1.3],
    },
    beats: {
      enter: [['paul', 'embrace', { x: 0.25, z: 0.1, look: -1.3 }], ['b1', 'embrace', { x: -0.05, z: 0.05, look: 1.3 }], ['luke', 'idle', { x: 0.6, z: -0.1, look: -1.3 }], ['ari', 'idle', { x: 0.6, z: 0.35, look: -1.3 }],
        ['julius', 'idle', { x: 0.75, z: 0.12, look: -1.4 }], ['soldier', 'idle', { x: 0.95, z: 0.3, look: -1.3 }], ['b2', 'bless', { x: -0.3, z: 0.3, look: 1.2 }], ['b3', 'idle', { x: -0.35, z: -0.2, look: 1.2 }],
        ['b4', 'idle', { x: -0.55, z: 0.1, look: 1.3, item: 'scroll' }]],
      // 보디올에서 올라오는 길 — 일행은 아직 길 끝(오른쪽 아래)에, 로마의 형제들은 보이지 않는다
      intro: [['@env', 'day'], ...hide('b1', 'b2', 'b3', 'b4'), ['paul', 'idle', { show: 0 }], ...hide('luke', 'ari', 'julius', 'soldier')],
      // 석 달 뒤 다시 배로 — 바다에서 올라온 일행이 길 끝에 선다
      'p0.0': [['julius', 'idle', { show: 1 }], ['paul', 'idle', { show: 1, delay: 300 }], ['luke', 'idle', { show: 1, delay: 500 }], ['ari', 'idle', { show: 1, delay: 700 }], ['soldier', 'idle', { show: 1, delay: 900 }]],
      'p0.1': [['luke', 'point', { look: 0.4 }], ['luke', 'idle', { delay: 3000 }]],
      'p0.2': [['paul', 'idle', { look: -1.5 }]],
      'p0.3': [['paul', 'speak', { to: 'luke' }]],
      // 마침내 로마를 향해 걷는다
      'p0.4': [['paul', 'idle', { x: 1.35, z: 0.42 }], ['julius', 'idle', { x: 1.15, z: 0.22, delay: 200 }], ['luke', 'idle', { x: 1.6, z: 0.25, delay: 400 }], ['ari', 'idle', { x: 1.65, z: 0.62, delay: 500 }], ['soldier', 'idle', { x: 1.85, z: 0.45, delay: 600 }]],
      // 로마의 형제들이 소식을 듣고 길을 나선다 — 왼쪽 위에서 내려온다
      'p1.0': [['paul', 'idle', { x: 1.35, z: 0.42, look: -1.3 }], ['julius', 'idle', { x: 1.15, z: 0.22 }], ['luke', 'idle', { x: 1.6, z: 0.25 }], ['ari', 'idle', { x: 1.65, z: 0.62 }], ['soldier', 'idle', { x: 1.85, z: 0.45 }],
        ['b1', 'idle', { show: 1, x: -1.4, z: -0.15 }], ['b2', 'idle', { show: 1, x: -1.55, z: 0.1, delay: 300 }], ['b3', 'idle', { show: 1, x: -1.6, z: -0.4, delay: 500 }], ['b4', 'idle', { show: 1, x: -1.75, z: -0.15, delay: 700 }]],
      // 압비오 광장까지 — 길 가운데서 만난다
      'p1.1': [['b1', 'idle', { x: -0.05, z: 0.05 }], ['b2', 'idle', { x: -0.3, z: 0.3, delay: 200 }], ['b3', 'idle', { x: -0.35, z: -0.2, delay: 300 }], ['b4', 'idle', { x: -0.55, z: 0.1, delay: 400 }],
        ['paul', 'idle', { x: 0.3, z: 0.12, delay: 500 }], ['julius', 'idle', { x: 0.75, z: 0.12, delay: 600 }], ['luke', 'idle', { x: 0.6, z: -0.1, delay: 700 }], ['ari', 'idle', { x: 0.6, z: 0.35, delay: 800 }], ['soldier', 'idle', { x: 0.95, z: 0.3, delay: 900 }],
        ['b2', 'bless', { look: 1.2, delay: 4200 }]],
      // 죄수의 몸으로 그들의 얼굴을 보고 — 하나님께 감사하고, 끌어안는다
      'p1.2': [['paul', 'look-up', { x: 0.3, z: 0.12, look: -0.6 }], ['paul', 'embrace', { x: 0.25, z: 0.1, look: -1.3, delay: 2600 }], ['b1', 'embrace', { look: 1.3, delay: 2600 }]],
      // 삼 년 전 바로 이 사람들에게 보낸 편지 — 한 형제가 두루마리를 들어 보인다
      'p1.3': [['paul', 'idle', { look: -1.3 }], ['b1', 'idle', { look: 1.3 }], ['b4', 'idle', { item: 'scroll', look: 1.3 }]],
      'p1.4': [['b4', 'raise', { item: 'scroll' }], ['paul', 'idle', { look: -1.2 }]],
      'p1.5': [['b4', 'speak', { item: 'scroll', to: 'paul' }]],
      'p2.0': [['b4', 'idle', { item: 'scroll' }], ['paul', 'speak', { to: 'b4' }]],
      // 하나님은 바울을 정말로 로마에 데려오셨다
      'p2.1': [['paul', 'look-up', { look: -1.0 }]],
      // 로마에 들어간다 — 모두 함께 길을 따라 왼쪽 위로
      'p2.2': [['paul', 'idle', { x: -1.75, z: -0.3 }], ['julius', 'idle', { x: -1.5, z: -0.45, delay: 100 }], ['soldier', 'idle', { x: -1.5, z: -0.15, delay: 300 }],
        ['b1', 'idle', { x: -2.0, z: -0.45, delay: 200 }], ['b2', 'idle', { x: -2.05, z: -0.2, delay: 400 }], ['b3', 'idle', { x: -2.15, z: -0.55, delay: 500 }], ['b4', 'idle', { x: -1.9, z: -0.1, delay: 600 }],
        ['luke', 'idle', { x: -1.3, z: -0.25, delay: 800 }], ['ari', 'idle', { x: -1.25, z: 0.0, delay: 900 }],
        ...['b1', 'b3', 'b2', 'b4', 'julius', 'luke', 'ari'].map((n, i) => [n, 'idle', { show: 0, delay: 6200 + i * 250 }])],
      // 군인 한 사람이 늘 곁에서 — 마지막까지 바울 곁에
      'p2.3': [...hide('b1', 'b2', 'b3', 'b4', 'julius', 'luke', 'ari'), ['paul', 'idle', { x: -1.75, z: -0.3, look: 1.6 }], ['soldier', 'idle', { x: -1.5, z: -0.2, look: -1.4 }],
        ['paul', 'idle', { show: 0, delay: 3800 }], ['soldier', 'idle', { show: 0, delay: 4000 }]],
      w0: [['@env', 'day'], ['paul', 'embrace', { show: 1, x: 0.25, z: 0.1, look: -1.3 }], ['b1', 'embrace', { show: 1, x: -0.05, z: 0.05, look: 1.3 }], ['luke', 'idle', { show: 1, x: 0.6, z: -0.1, look: -1.3 }],
        ['ari', 'idle', { show: 1, x: 0.6, z: 0.35, look: -1.3 }], ['julius', 'idle', { show: 1, x: 0.75, z: 0.12, look: -1.4 }], ['soldier', 'idle', { show: 1, x: 0.95, z: 0.3, look: -1.3 }],
        ['b2', 'bless', { show: 1, x: -0.3, z: 0.3, look: 1.2 }], ['b3', 'idle', { show: 1, x: -0.35, z: -0.2, look: 1.2 }], ['b4', 'idle', { show: 1, x: -0.55, z: 0.1, look: 1.3, item: null }]],
      w1: [['paul', 'idle', { look: -1.3 }], ['b1', 'idle', { look: 1.3 }], ['b4', 'raise', { item: 'scroll' }]],
      w2: [['b4', 'idle', { item: 'scroll' }], ['paul', 'look-up', { look: -1.0 }]],
      end: [['@env', 'day'], ['paul', 'embrace', { show: 1, x: 0.25, z: 0.1, look: -1.3 }], ['b1', 'embrace', { show: 1, x: -0.05, z: 0.05, look: 1.3 }], ['luke', 'idle', { show: 1, x: 0.6, z: -0.1, look: -1.3 }],
        ['ari', 'idle', { show: 1, x: 0.6, z: 0.35, look: -1.3 }], ['julius', 'idle', { show: 1, x: 0.75, z: 0.12, look: -1.4 }], ['soldier', 'idle', { show: 1, x: 0.95, z: 0.3, look: -1.3 }],
        ['b2', 'bless', { show: 1, x: -0.3, z: 0.3, look: 1.2 }], ['b3', 'idle', { show: 1, x: -0.35, z: -0.2, look: 1.2 }], ['b4', 'idle', { show: 1, x: -0.55, z: 0.1, look: 1.3, item: 'scroll' }]],
    },
  },

  /* a39. 셋집에서 두 해 — 로마의 셋집(housechurch — 깔개·등잔대·벽감의 두루마리). 바울은 지키는 군인과 사슬(chain2)로 이어져 있다.
     유대인의 지도자들이 와서 앉고, 바울이 율법과 선지자의 두루마리로 예수를 설명한다. 어떤 이는 고개 숙이고 어떤 이는 일어나 나간다.
     빌립보에서 에바브로디도가 선물을 가져오고, 앓아 누웠다가 일어난다. 바울이 낮은 상(desk)에서 편지를 받아 적게 하고(디모데), 군인도 귀 기울인다.
     '기뻐하라' — 바울이 사슬 찬 손을 들고, 에바브로디도가 편지를 들고 떠난다 */
  a39: {
    env: 'day',
    wide: 1.35,
    props: {
      room: ['housechurch', 0, -0.05, { w: 3.0, table: false, lamps: [[-1.25, -0.62], [1.25, -0.62]] }],
      desk: ['desk', 0.35, 0.3],
      link: ['chain2', 0.51, -0.05, { on: ['paul', 'soldier'], len: 0.32 }],
      gift: ['provisions', 1.35, 0.45, { kind: 'wares' }],
    },
    cast: {
      paul: ['paulOS', 0.35, -0.05, -0.6],
      soldier: ['soldier', 0.67, -0.05, -0.4, { gaze: false }],
      tim: ['timothy', 0.9, 0.35, -1.4],
      j1: ['ruler', -0.55, 0.1, 1.2, { pose: 'sit-ground' }],
      j2: ['jewD', -0.85, -0.25, 1.4, { pose: 'sit-ground' }],
      j3: ['elder', -0.75, 0.45, 1.2, { pose: 'sit-ground' }],
      j4: ['hellenist', -1.15, 0.15, 1.3, { pose: 'sit-ground' }],
      j5: ['townsman', -1.05, -0.5, 1.4, { pose: 'sit-ground', gaze: false }],
      epa: ['epaphroditus', 2.2, 0.35, -1.3],
    },
    beats: {
      enter: [['desk', 'write'], ...hide('j1', 'j2', 'j3', 'j4', 'j5', 'epa'), ['gift', null, { show: 1 }], ['paul', 'sit-speak', { x: 0.35, z: 0.06, look: 0.1, to: 'tim' }],
        ['soldier', 'idle', { x: 0.67, z: 0.06, look: -0.3 }], ['tim', 'sit-ground', { x: 0.05, z: 0.35, look: 1.2 }]],
      // 사흘 뒤 — 사슬에 매인 바울과 지키는 군인. 지도자들은 아직 오지 않았다
      intro: [['@env', 'day'], ['desk', 'idle', { show: 0 }], ['gift', null, { show: 0 }], ...hide('j1', 'j2', 'j3', 'j4', 'j5', 'epa'), ['tim', 'idle', { show: 0 }]],
      // 유대인의 지도자들을 불러 — 들어와 앉는다
      'p0.0': [['j1', 'sit-ground', { show: 1 }], ['j2', 'sit-ground', { show: 1, delay: 400 }], ['j3', 'sit-ground', { show: 1, delay: 800 }], ['paul', 'speak', { look: -1.2, to: 'j1', delay: 1800 }]],
      'p0.1': [['paul', 'speak', { to: 'j1' }]],
      // 이 사슬에 매여 — 사슬 찬 손을 든다
      'p0.2': [['paul', 'raise', { look: -1.3 }]],
      // 날을 정해 많은 사람이
      'p0.3': [['paul', 'idle'], ['j4', 'sit-ground', { show: 1 }], ['j5', 'sit-ground', { show: 1, delay: 500 }], ['tim', 'idle', { show: 1, x: 0.9, z: 0.45, look: -1.6, delay: 600 }]],
      // 아침부터 저녁까지 율법과 선지자의 글로
      'p0.4': [['paul', 'speak', { item: 'scroll', to: 'j1' }], ['@env', 'dusk', { delay: 5000 }]],
      // 어떤 이는 믿고 어떤 이는 믿지 않았다
      'p0.5': [['@env', 'dusk'], ['paul', 'idle', { item: 'scroll' }], ['j1', 'bow'], ['j3', 'bow', { delay: 400 }], ['j2', 'idle', { x: -1.4, z: -0.3, delay: 600 }], ['j5', 'idle', { x: -1.55, z: -0.45, delay: 900 }],
        ['j2', 'idle', { show: 0, delay: 3800 }], ['j5', 'idle', { show: 0, delay: 4100 }]],
      // 두 해 — 찾아오는 사람을 다 맞아들인다
      'p1.0': [['@env', 'day'], ['paul', 'bless', { item: null, look: -1.2 }], ...hide('j2', 'j5'), ['j1', 'sit-ground'], ['j3', 'sit-ground'], ['j4', 'sit-ground']],
      'p1.1': [['paul', 'speak', { to: 'j4' }]],
      // 빌립보 교회가 에바브로디도를 보내 선물을 — 오른쪽에서 들어온다
      'p1.2': [...hide('j1', 'j3', 'j4'), ['paul', 'idle', { look: 1.2 }], ['epa', 'idle', { show: 1, x: 1.2, z: 0.25, look: -1.3 }], ['gift', null, { show: 1, delay: 2800 }],
        ['epa', 'bow', { delay: 3000 }], ['paul', 'bless', { look: 1.3, delay: 3600 }]],
      // 병이 들어 — 누웠다가, 바울의 기도 끝에 일어난다
      'p1.3': [['epa', 'sleep', { x: 1.2, z: 0.25, look: -1.3 }], ['paul', 'pray', { look: 1.3, delay: 600 }], ['epa', 'sit-ground', { delay: 4200 }], ['epa', 'idle', { delay: 5600 }], ['paul', 'raise', { look: 1.3, delay: 5600 }]],
      // 편지를 쓴다 — 바울이 상 뒤에 앉고 디모데가 받아 적는다
      'p1.4': [['epa', 'idle', { x: 1.2, z: 0.25, look: -1.3 }], ['paul', 'sit-ground', { x: 0.35, z: 0.06, look: 0.1 }], ['soldier', 'idle', { x: 0.67, z: 0.06, look: -0.3 }],
        ['desk', 'idle', { show: 1 }], ['tim', 'sit-ground', { x: 0.05, z: 0.35, look: 1.2 }], ['desk', 'write', { delay: 2400 }]],
      'p2.0': [['desk', 'write'], ['paul', 'sit-speak', { to: 'tim' }]],
      'p2.1': [['paul', 'sit-speak', { to: 'tim' }]],
      // 황제의 근위대가 모두 알게 되었다 — 지키는 군인도 귀 기울인다
      'p2.2': [['soldier', 'listen', { look: -0.9 }], ['paul', 'sit-speak', { to: 'soldier' }]],
      'p2.3': [['soldier', 'idle', { look: -0.3 }], ['paul', 'sit-speak', { to: 'tim' }]],
      // 주님 안에서 늘 기뻐하십시오 — 사슬 찬 손을 들고
      'p2.4': [['paul', 'raise', { x: 0.35, z: 0.06, look: 0.1 }]],
      'p2.5': [['paul', 'raise'], ['desk', 'done'], ['tim', 'look-up', { look: 1.0 }]],
      // 사슬에 매인 사람이 보낸 기쁨 — 에바브로디도가 편지를 들고 떠난다
      'p2.6': [['paul', 'bless', { look: 1.2 }], ['epa', 'idle', { item: 'scroll' }], ['epa', 'bow', { delay: 800 }], ['epa', 'idle', { x: 2.3, z: 0.4, delay: 2600 }], ['epa', 'idle', { show: 0, delay: 5600 }]],
      w0: [['@env', 'day'], ['desk', 'write', { show: 1 }], ['gift', null, { show: 1 }], ...hide('j1', 'j2', 'j3', 'j4', 'j5', 'epa'), ['paul', 'sit-speak', { x: 0.35, z: 0.06, look: 0.1, to: 'tim' }],
        ['soldier', 'idle', { x: 0.67, z: 0.06, look: -0.3 }], ['tim', 'sit-ground', { show: 1, x: 0.05, z: 0.35, look: 1.2 }]],
      w1: [['paul', 'sit-speak', { to: 'tim' }]],
      w2: [['desk', 'done'], ['paul', 'raise', { look: 0.1 }]],
      w3: [['desk', 'idle', { show: 0 }], ['tim', 'idle', { show: 0 }], ['j1', 'sit-ground', { show: 1, x: -0.55, z: 0.1, look: 1.2 }], ['j3', 'sit-ground', { show: 1, x: -0.75, z: 0.45, look: 1.2 }], ['j4', 'sit-ground', { show: 1, x: -1.15, z: 0.15, look: 1.3 }],
        ['paul', 'speak', { x: 0.35, z: -0.05, item: 'scroll', to: 'j1' }], ['soldier', 'idle', { x: 0.67, z: -0.05, look: -0.4 }]],
      end: [['@env', 'day'], ['desk', 'done', { show: 1 }], ['gift', null, { show: 1 }], ...hide('j1', 'j2', 'j3', 'j4', 'j5', 'epa'), ['paul', 'raise', { x: 0.35, z: 0.06, look: 0.1 }],
        ['soldier', 'idle', { x: 0.67, z: 0.06, look: -0.3 }], ['tim', 'sit-ground', { show: 1, x: 0.05, z: 0.35, look: 1.2 }]],
    },
  },

  /* a40. 오네시모를 위한 편지 — 같은 셋집, 사슬로 이어진 군인. 오른쪽에서 짧은 옷의 젊은 종 오네시모가 들어와 바울 앞에 무릎 꿇고, 바울이 손을 얹는다(믿음).
     곁에서 시중들던 오네시모를 두고, 바울이 낮은 상에서 빌레몬에게 짧은 편지를 쓴다 — '내 손으로 씁니다'에서 큰 글씨(desk 'big').
     골로새서·에베소서를 더 쓰고, 두기고가 와서 두루마리들을 받아 오네시모와 함께 오른쪽 길로 떠난다 */
  a40: {
    env: 'day',
    wide: 1.35,
    props: {
      room: ['housechurch', 0, -0.05, { w: 3.0, table: false, lamps: [[-1.25, -0.62], [1.25, -0.62]] }],
      desk: ['desk', 0.35, 0.3],
      link: ['chain2', 0.51, 0.06, { on: ['paul', 'soldier'], len: 0.32 }],
      road: ['road', 2.1, 0.35, { len: 1.8, w: 0.36, rot: -0.15 }],
    },
    cast: {
      paul: ['paulOS', 0.35, 0.06, 0.1, { pose: 'sit-ground' }],
      soldier: ['soldier', 0.67, 0.06, -0.3, { gaze: false }],
      ones: ['onesimus', 2.3, 0.4, -1.4],
      tych: ['tychicus', 2.4, 0.15, -1.4],
      tim: ['timothy', -0.5, -0.25, 1.2, { pose: 'sit-ground', gaze: false }],
    },
    beats: {
      enter: [['desk', 'big'], ['paul', 'sit-ground', { look: 0.1 }], ['ones', 'idle', { x: 0.0, z: 0.3, look: 1.2 }], ['tych', 'idle', { show: 0 }]],
      // 셋집 — 바울은 상 앞에 앉아 있다. 오네시모는 아직 오지 않았다
      intro: [['@env', 'day'], ['desk', 'idle'], ...hide('tych', 'ones', 'tim')],
      // 오네시모가 온다 — 오른쪽에서
      'p0.0': [['ones', 'idle', { show: 1, x: 1.1, z: 0.3, look: -1.4 }], ['paul', 'sit', { look: 1.2, delay: 1500 }]],
      'p0.1': [['ones', 'bow', { look: -1.4 }]],
      // 갇힌 바울을 통해 믿음을 얻는다 — 무릎 꿇은 오네시모에게 손을 얹는다
      'p0.2': [['paul', 'idle', { x: 0.62, z: 0.3, look: 1.2 }], ['soldier', 'idle', { x: 0.94, z: 0.3, look: -0.6 }], ['ones', 'kneel', { x: 0.98, z: 0.38, look: -1.4, delay: 600 }], ['paul', 'bless', { look: 1.4, delay: 2000 }]],
      // 곁에 두고 싶었지만 — 오네시모가 시중든다(물병)
      'p0.3': [['paul', 'idle', { x: 0.35, z: 0.06, look: 0.1 }], ['soldier', 'idle', { x: 0.67, z: 0.06, look: -0.3 }], ['ones', 'idle', { item: 'jar', x: 0.0, z: 0.3, look: 1.2, delay: 600 }], ['paul', 'sit-ground', { delay: 1800 }]],
      'p0.4': [['ones', 'idle', { item: null }], ['paul', 'sit-ground', { x: 0.35, z: 0.06, look: 0.1 }], ['desk', 'write', { delay: 800 }]],
      // 빌레몬에게 — 받아 적는 줄이 늘어난다
      'p1.0': [['desk', 'write'], ['paul', 'sit-speak', { to: 'ones' }]],
      'p1.1': [['paul', 'sit-speak', { to: 'ones' }], ['ones', 'bow', { delay: 2000 }]],
      'p1.2': [['ones', 'idle'], ['paul', 'sit', { look: 0.1 }]],
      'p1.3': [['desk', 'done']],
      // 나 바울이 내 손으로 씁니다 — 큰 글씨
      'p1.4': [['desk', 'big'], ['paul', 'sit-ground', { look: 0.0 }]],
      'p1.5': [['desk', 'big'], ['paul', 'sit-speak', { to: 'ones' }]],
      // 골로새와 에베소 교회에도
      'p2.0': [['paul', 'sit-ground'], ['tim', 'sit-ground', { show: 1 }], ['desk', 'write', { delay: 600 }]],
      'p2.1': [['desk', 'write'], ['paul', 'sit-speak', { to: 'tim' }]],
      // 두기고가 편지들을 가져간다
      'p2.2': [['desk', 'done'], ['paul', 'idle', { x: 0.35, z: 0.06, look: 1.0, item: 'scroll' }], ['tych', 'idle', { show: 1, x: 1.05, z: 0.15, look: -1.4 }], ['tych', 'bow', { delay: 3000 }],
        ['tych', 'idle', { item: 'scroll', delay: 4000 }], ['paul', 'idle', { item: null, delay: 4000 }]],
      // 오네시모도 그와 함께 골로새로 — 오른쪽 길로 떠난다
      'p2.3': [['paul', 'bless', { look: 1.2 }], ['ones', 'idle', { x: 1.25, z: 0.45 }], ['tych', 'idle', { item: 'scroll', x: 1.45, z: 0.25, delay: 400 }],
        ['ones', 'idle', { x: 2.35, z: 0.45, delay: 2600 }], ['tych', 'idle', { x: 2.5, z: 0.25, delay: 2800 }]],
      'p2.4': [['ones', 'idle', { show: 0 }], ['tych', 'idle', { show: 0 }], ['paul', 'idle', { look: 1.2 }]],
      'p2.5': [['paul', 'speak', { to: 'soldier' }], ['paul', 'bless', { look: 1.3, delay: 3000 }]],
      w0: [['@env', 'day'], ['desk', 'write'], ['tych', 'idle', { show: 0 }], ['tim', 'sit-ground', { show: 0 }], ['ones', 'idle', { show: 1, x: 0.0, z: 0.3, look: 1.2, item: null }], ['paul', 'sit-speak', { x: 0.35, z: 0.06, to: 'ones' }],
        ['soldier', 'idle', { x: 0.67, z: 0.06, look: -0.3 }]],
      w1: [['desk', 'big'], ['paul', 'sit-ground', { look: 0.0 }]],
      w2: [['desk', 'write'], ['tim', 'sit-ground', { show: 1 }], ['paul', 'sit-speak', { to: 'tim' }]],
      w3: [['desk', 'done'], ['paul', 'bless', { x: 0.35, z: 0.06, look: 1.2 }], ['tych', 'idle', { show: 1, x: 1.05, z: 0.15, look: -1.4, item: 'scroll' }], ['ones', 'idle', { show: 1, x: 1.25, z: 0.45, look: -1.4 }]],
      end: [['@env', 'day'], ['desk', 'big'], ['tych', 'idle', { show: 0 }], ['tim', 'sit-ground', { show: 0 }], ['paul', 'sit-ground', { x: 0.35, z: 0.06, look: 0.1 }], ['soldier', 'idle', { x: 0.67, z: 0.06, look: -0.3 }],
        ['ones', 'idle', { show: 1, x: 0.0, z: 0.3, look: 1.2, item: null }]],
    },
  },

  /* a41. 그레데에 남겨 둔 디도 — 다시 자유롭게 다닌 길. 왼쪽은 에베소(헬라 신전) — 젊은 디모데가 남고 바울은 오른쪽으로 떠난다. 디모데가 받은 편지를 사람들 앞에서 읽는다.
     오른쪽은 그레데의 성읍(흰 집들, 먼 산) — 디도와 장로로 세울 사람들. 바울이 디도를 남기고, 디도가 무릎 꿇은 장로들에게 손을 얹는다.
     디도가 편지를 받아 읽고, 아데마나 두기고를 기다리듯 길을 바라본다 */
  a41: {
    env: 'day',
    wide: 1.5,
    props: {
      temple: ['gtemple', -1.75, -0.65, { w: 1.0, d: 0.8 }],
      homeA: ['house', 1.35, -0.7, { stair: false, wall: '#ece4d2' }],
      homeB: ['house', 2.35, -0.55, { stair: false, wall: '#e2d6bc' }],
      road: ['road', 0.2, 0.25, { len: 2.6, w: 0.36, rot: 0.08 }],
      hillC: ['farcity', 2.2, -1.05, { dia: 0.7 }],
    },
    cast: {
      paul: ['paulO', -1.35, 0.15, 1.2],
      tim: ['timothy', -1.75, 0.2, 1.4],
      eph1: ['ephesian', -2.1, 0.45, 0.9, { gaze: false }],
      eph2: ['greekW', -2.25, 0.05, 1.1, { gaze: false }],
      titus: ['titus', 1.2, 0.15, 1.4],
      el1: ['elderC', 1.75, 0.0, -1.4],
      el2: ['islander', 1.95, 0.35, -1.5],
      el3: ['elder', 2.15, 0.05, -1.5, { gaze: false }],
    },
    beats: {
      enter: [['paul', 'idle', { x: 1.05, z: 0.4, look: 1.3 }], ['titus', 'bless', { x: 1.45, z: 0.15, look: 1.4 }], ['el1', 'kneel', { x: 1.75, z: 0.0 }], ['el2', 'kneel', { x: 1.9, z: 0.35 }], ['el3', 'bow'],
        ['tim', 'idle', { item: 'scroll', look: 1.0 }], ['eph1', 'listen'], ['eph2', 'listen']],
      // 에베소 — 바울과 디모데, 그레데의 사람들은 아직
      intro: [['@env', 'day'], ...hide('titus', 'el1', 'el2', 'el3'), ['paul', 'speak', { to: 'tim' }]],
      'p0.0': [['paul', 'speak', { to: 'tim' }]],
      // 마게도냐로 떠나며 — 디모데에게 남으라 당부한다
      'p0.1': [['paul', 'bless', { look: -1.4 }], ['tim', 'bow', { delay: 600 }]],
      'p0.2': [['tim', 'idle'], ['paul', 'speak', { to: 'tim' }], ['paul', 'point', { look: -2.2, delay: 3500 }], ['paul', 'idle', { x: -0.2, z: 0.3, delay: 6000 }], ['paul', 'idle', { show: 0, delay: 8000 }]],
      // 얼마 뒤 편지 — 디모데가 받아 사람들 앞에서 읽는다
      'p1.0': [['paul', 'idle', { show: 0 }], ['tim', 'idle', { item: 'scroll', look: 1.0 }], ['eph1', 'idle', { x: -1.45, z: 0.45, look: -2.4 }], ['eph2', 'idle', { x: -1.25, z: 0.15, look: -1.9, delay: 300 }]],
      'p1.1': [['tim', 'speak', { item: 'scroll', to: 'eph1' }]],
      'p1.2': [['tim', 'speak', { item: 'scroll', to: 'eph2' }], ['eph2', 'listen', { delay: 1200 }]],
      'p1.3': [['tim', 'idle', { item: 'scroll' }], ['eph1', 'bow']],
      // 네가 젊다고 얕보지 못하게 — 디모데가 고개를 든다
      'p1.4': [['eph1', 'idle'], ['tim', 'look-up', { item: 'scroll', look: 0.6 }]],
      // 그레데 — 바울과 디도가 성읍에 와 있고 장로로 세울 사람들이 모인다
      'p2.0': [['tim', 'idle'], ['paul', 'idle', { show: 1, x: 0.85, z: 0.35, look: 1.3 }], ['titus', 'idle', { show: 1, x: 1.2, z: 0.15, look: 1.4 }],
        ['el1', 'idle', { show: 1, x: 1.75, z: 0.0 }], ['el2', 'idle', { show: 1, x: 1.95, z: 0.35, delay: 300 }], ['el3', 'idle', { show: 1, x: 2.15, z: 0.05, delay: 500 }],
        ['paul', 'speak', { to: 'titus', delay: 2600 }]],
      // 바울이 디도에게 — 남은 일을 바로잡고 장로들을 세우라
      'p2.1': [['paul', 'speak', { to: 'titus' }]],
      'p2.2': [['paul', 'idle', { look: 1.3 }], ['titus', 'idle', { x: 1.45, z: 0.15, look: 1.4 }], ['el1', 'kneel', { delay: 900 }], ['el2', 'kneel', { delay: 1200 }], ['titus', 'bless', { look: 1.4, delay: 2600 }], ['el3', 'bow', { delay: 2800 }]],
      // 서둘러 니고볼리로 오라 — 바울은 길을 떠나고, 디도는 길을 바라본다
      'p2.3': [['el1', 'idle'], ['el2', 'idle'], ['el3', 'idle'], ['titus', 'idle', { look: -1.3 }], ['paul', 'idle', { x: -0.4, z: 0.3, look: -1.4 }], ['paul', 'idle', { show: 0, delay: 4800 }]],
      'p2.4': [['paul', 'idle', { show: 0 }], ['titus', 'idle', { item: 'scroll', look: 0.4 }]],
      // 세나와 아볼로도 — 디도가 장로들에게 일러 준다
      'p2.5': [['titus', 'speak', { item: 'scroll', to: 'el1' }]],
      w0: [['@env', 'day'], ...hide('titus', 'el1', 'el2', 'el3', 'paul'), ['tim', 'speak', { show: 1, item: 'scroll', to: 'eph1' }], ['eph1', 'idle', { x: -1.45, z: 0.45, look: -2.4 }], ['eph2', 'listen', { x: -1.25, z: 0.15, look: -1.9 }]],
      w1: [['tim', 'look-up', { item: 'scroll', look: 0.6 }]],
      w2: [['tim', 'idle', { item: null }], ['paul', 'speak', { show: 1, x: 0.85, z: 0.35, to: 'titus' }], ['titus', 'idle', { show: 1, x: 1.2, z: 0.15, look: 1.4 }],
        ['el1', 'kneel', { show: 1, x: 1.75, z: 0.0 }], ['el2', 'kneel', { show: 1, x: 1.95, z: 0.35 }], ['el3', 'bow', { show: 1, x: 2.15, z: 0.05 }]],
      end: [['@env', 'day'], ['paul', 'idle', { show: 1, x: 0.85, z: 0.35, look: 1.3 }], ['titus', 'bless', { show: 1, x: 1.45, z: 0.15, look: 1.4 }], ['el1', 'kneel', { show: 1, x: 1.75, z: 0.0 }],
        ['el2', 'kneel', { show: 1, x: 1.95, z: 0.35 }], ['el3', 'bow', { show: 1, x: 2.15, z: 0.05 }], ['tim', 'idle', { item: 'scroll', look: 1.0 }], ['eph1', 'listen', { x: -1.45, z: 0.45, look: -2.4 }], ['eph2', 'listen', { x: -1.25, z: 0.15, look: -1.9 }]],
    },
  },

  /* a42. 선한 싸움을 다 싸우고 — 로마의 어두운 옥(romecell). 사슬 찬 늙은 바울이 짚 깔개 곁 낮은 상(등잔)에서 디모데에게 마지막 편지를 쓴다.
     곁을 떠난 사람들(데마·그레스게·디도)은 옥 앞에 잠깐 섰다가 저마다 길로 사라지고, 누가만 남는다. 드로아에 두고 온 겉옷과 책·양피지(cloakbooks)가 떠오르듯 곁에 놓인다.
     '모두 나를 버렸다' — 누가도 비켜서고 홀로 무릎 꿇은 바울. '주님께서 내 곁에 서서' — 창의 빛이 차오르고 곁에 빛이 내린다(모습 없이).
     끝은 다 쓴 편지와 빛 — 죽음은 그리지 않는다 */
  a42: {
    env: 'overcast',
    wide: 1.35,
    solemn: true,
    props: {
      cell: ['romecell', 0, -0.1, { w: 2.0, wx: 0.55, fx: 0.42, fz: 0.25 }], // 빛은 바울 곁(오른쪽)에 — 바울 위로 떨어지면 등잔빛과 겹쳐 얼굴이 하얗게 탔다
      desk: ['desk', 0.0, 0.35], // 등잔 없이 — 등잔빛이 가까운 바울의 얼굴을 하얗게 태웠다. 빛은 창에서만
      bonds: ['fetters', 0.0, 0.12, { on: 'paul', y: 0.3 }],
      things: ['cloakbooks', -0.55, 0.25],
      lord: ['beam', 0.42, 0.15, { r: 0.3, h: 2.4 }],
    },
    cast: {
      paul: ['paulOS', 0.0, 0.12, 0, { pose: 'sit-ground' }],
      luke: ['luke', -0.55, -0.15, 0.8],
      demas: ['greek2', -0.6, 0.85, 0.2],
      cres: ['greek', 0.0, 0.95, 0.2],
      titus: ['titus', 0.6, 0.85, -0.2],
      guard: ['soldier', 1.3, 0.7, -0.6, { gaze: false }],
    },
    beats: {
      enter: [['cell', 'light'], ['lord', null, { show: 1 }], ['desk', 'done'], ['things', null, { show: 1 }], ...hide('demas', 'cres', 'titus'), ['luke', 'idle', { show: 0 }], ['paul', 'look-up', { look: 0.2 }]],
      // 사슬에 매인 바울 — 등잔 곁에서 편지를 쓴다
      intro: [['@env', 'overcast'], ['cell', 'dim'], ['lord', null, { show: 0 }], ['desk', 'idle'], ['things', null, { show: 0 }], ...hide('demas', 'cres', 'titus')],
      'p0.0': [['desk', 'write', { delay: 800 }]],
      'p0.1': [['desk', 'write'], ['paul', 'sit', { look: 0.0 }]],
      // 제단에 붓는 포도주처럼
      'p0.2': [['paul', 'sit-ground'], ['luke', 'idle', { look: 1.0 }]],
      // 선한 싸움을 싸웠고 — 고개를 든다
      'p0.3': [['paul', 'look-up', { look: 0.2 }]],
      'p0.4': [['paul', 'look-up'], ['desk', 'write', { delay: 3000 }], ['paul', 'sit-ground', { delay: 3000 }]],
      'p0.5': [['paul', 'sit-ground']],
      // 곁은 쓸쓸했다 — 떠난 사람들이 옥 앞에 섰다가 저마다 길로 사라진다
      'p1.0': [['paul', 'sit', { look: 0.1 }], ['demas', 'idle', { show: 1 }], ['cres', 'idle', { show: 1, delay: 300 }], ['titus', 'idle', { show: 1, delay: 600 }]],
      'p1.1': [['demas', 'idle', { show: 1, x: -2.0, z: 0.9 }], ['cres', 'idle', { show: 1, x: -0.3, z: 1.0, delay: 1800 }], ['titus', 'idle', { show: 1, x: 2.0, z: 0.85, delay: 3200 }],
        ['demas', 'idle', { show: 0, delay: 3200 }], ['cres', 'idle', { x: -1.6, z: 1.0, delay: 3000 }], ['cres', 'idle', { show: 0, delay: 5600 }], ['titus', 'idle', { show: 0, delay: 6200 }]],
      // 누가만 함께 있었다
      'p1.2': [...hide('demas', 'cres', 'titus'), ['luke', 'idle', { x: -0.4, z: 0.1, look: 1.0 }], ['luke', 'sit-ground', { delay: 1800 }]],
      'p1.3': [['luke', 'sit-ground', { x: -0.4, z: 0.1, look: 1.0 }], ['paul', 'sit-speak', { to: 'luke' }]],
      'p1.4': [['desk', 'write'], ['paul', 'sit-speak', { to: 'luke' }]],
      'p1.5': [['paul', 'sit-ground']],
      'p1.6': [['luke', 'listen', { look: 1.0 }]],
      // 드로아에 두고 온 겉옷과 책, 양피지
      'p1.7': [['luke', 'sit-ground'], ['things', null, { show: 1, delay: 600 }], ['paul', 'sit-speak', { to: 'luke' }]],
      // 모두 나를 버렸다 — 누가도 비켜서고 홀로
      'p2.0': [['paul', 'sit-ground'], ['desk', 'done'], ['@env', 'dark', { delay: 1000 }]],
      'p2.1': [['@env', 'dark'], ['luke', 'idle', { show: 0 }], ['paul', 'kneel', { x: 0.0, z: 0.12, look: 0.3 }]],
      'p2.2': [['paul', 'pray', { look: 0.3 }]],
      // 주님께서 내 곁에 서서 — 창의 빛이 차오르고 곁에 빛이 내린다
      'p2.3': [['@env', 'overcast'], ['cell', 'light'], ['lord', null, { show: 1, delay: 800 }], ['paul', 'look-up', { look: 0.6, delay: 1200 }]],
      'p2.4': [['paul', 'raise', { look: 0.5 }]],
      // 한 번 더 부탁 — 다시 앉아 쓴다
      'p2.5': [['lord', null, { show: 0 }], ['paul', 'sit-ground', { x: 0.0, z: 0.12, look: 0 }], ['desk', 'write', { delay: 1200 }], ['luke', 'sit-ground', { show: 1, x: -0.4, z: 0.1, look: 1.0, delay: 1500 }]],
      // 겨울이 되기 전에 어서 오너라 — 다 쓴 편지와 빛
      'p2.6': [['desk', 'done'], ['paul', 'look-up', { look: 0.2 }], ['lord', null, { show: 1, delay: 1500 }]],
      w0: [['@env', 'overcast'], ['cell', 'dim'], ['lord', null, { show: 0 }], ['desk', 'write'], ...hide('demas', 'cres', 'titus'), ['luke', 'idle', { show: 1, x: -0.55, z: -0.15, look: 0.8 }], ['paul', 'look-up', { x: 0.0, z: 0.12, look: 0.2 }]],
      w1: [['paul', 'look-up'], ['cell', 'light']],
      w2: [['luke', 'idle', { show: 0 }], ['cell', 'light'], ['lord', null, { show: 1 }], ['paul', 'kneel', { look: 0.6 }]],
      w3: [['lord', null, { show: 0 }], ['paul', 'sit-ground', { look: 0 }], ['desk', 'done'], ['things', null, { show: 1 }], ['luke', 'sit-ground', { show: 1, x: -0.4, z: 0.1, look: 1.0 }]],
      end: [['@env', 'overcast'], ['cell', 'light'], ['lord', null, { show: 1 }], ['desk', 'done'], ['things', null, { show: 1 }], ...hide('demas', 'cres', 'titus'), ['luke', 'idle', { show: 0 }],
        ['paul', 'look-up', { x: 0.0, z: 0.12, look: 0.2 }]],
    },
  },
};

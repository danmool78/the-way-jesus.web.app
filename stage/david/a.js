/* 다윗 여정 대본 묶음 a: d01–d10 (stage/david.js가 합친다)
   베들레헴 들판에서 사울의 궁을 떠나기까지. 소년 다윗은 davidY(불그레한 얼굴, 목자의 막대), 사울의 궁에 들어간 뒤로는 davidW(젊은 용사).
   연출 원칙: 사자·곰은 달아나 사라질 뿐, 골리앗은 쓰러지며 사라지고(벤 머리는 그리지 않는다 — 손에 든 칼만), 날아온 창은 벽에 박힌다.
   하나님은 모습 없이 빛(beam)으로만 */

// 무리(crowd)의 자리: 가운데를 둘러 n명을 흩어 놓는다 (moses.js와 같다)
const flock = (n, rx, rz, seed = 1) => Array.from({ length: n }, (_, i) => {
  const a = i * 2.399 + seed, r = Math.sqrt((i + 0.5) / n);
  return [Math.cos(a) * r * rx, Math.sin(a) * r * rz];
});

export const A = {
  /* d01. 베들레헴 들판의 목동 — 해 질 녘 비탈의 양 떼 곁, 수금을 타는 소년. 사자가 새끼 양을 물고 달아나자 뒤쫓아 막대를 들고,
     사자는 양을 놓고 달아나 사라진다(치는 모습은 그리지 않는다). 곰은 물매를 돌리는 소년 앞에서 물러간다. 밤이 되고 홀로 남는다 */
  d01: {
    env: 'dusk',
    wide: 1.3,
    props: {
      grass: ['grass', 0, 0, { r: 1.9 }],
      rocks: ['rocks', 0, 0, { spots: [[-1.2, -0.55, 0.14], [1.35, 0.35, 0.1], [0.2, -0.75, 0.12]] }],
      olive: ['olive', -0.55, -0.62],
      house: ['house', 1.25, -0.6, { scale: 0.75 }],
      s1: ['sheep', 0.35, -0.15, { rot: 0.4 }],
      s2: ['sheep', 0.7, 0.05, { rot: -0.5 }],
      s3: ['sheep', 0.55, -0.4, { rot: 2.6 }],
      s4: ['sheep', 0.95, -0.2, { rot: 3.4 }],
      s5: ['sheep', 0.15, 0.3, { rot: 0.2 }],
      lamb: ['sheep', -0.55, 0.2, { scale: 0.7, rot: 0.3, speed: 0.75 }],
      lion: ['lion', -1.95, 0.05, { speed: 0.75 }],
      bear: ['bear', 1.95, -0.35, { speed: 0.5, rot: Math.PI }],
    },
    cast: {
      david: ['davidY', -0.15, 0.1, 0.4, { speed: 0.95 }],
      jesse: ['jesse', 1.05, -0.25, -0.6],
    },
    beats: {
      enter: [['lion', null, { show: 0 }], ['bear', null, { show: 0 }], ['jesse', 'idle', { show: 0 }], ['david', 'play', { item: 'lyre', look: 0.4 }]],
      intro: [['@env', 'dusk'], ['lion', null, { show: 0 }], ['bear', null, { show: 0 }], ['jesse', 'idle', { show: 0 }], ['david', 'idle', { look: 0.6 }]],
      // 이새의 막내 — 아버지의 양 떼 곁에서
      'p0.1': [['david', 'idle', { x: 0.05, z: 0.12, look: 0.8 }]],
      'p0.2': [['david', 'idle', { look: 0 }]],
      'p0.3': [['david', 'play', { item: 'lyre', look: 0.3 }]],
      // 사자가 나타나 새끼 양을 물고 달아난다
      'p1.0': [['lion', null, { show: 1, x: -0.78, z: 0.18 }], ['lamb', null, { x: -1.55, z: -0.15, delay: 2000 }], ['lion', null, { x: -1.3, z: -0.1, delay: 2000 }],
        ['david', 'idle', { item: null, look: -1, delay: 900 }]],
      // 망설이지 않고 뒤쫓아 막대를 든다 — 사자는 양을 놓고 달아나 사라진다
      'p1.1': [['david', 'idle', { x: -0.95, z: 0.08 }]],
      'p1.2': [['david', 'rebuke', { look: -1 }], ['lion', null, { x: -2.0, z: -0.45, delay: 600 }], ['lion', null, { show: 0, delay: 1800 }], ['lamb', null, { x: -1.3, z: 0.1, delay: 900 }]],
      'p1.3': [['lion', null, { show: 0 }], ['david', 'idle', { x: -0.95, z: 0.2, look: -0.6 }], ['lamb', null, { x: -0.5, z: 0.25, delay: 1500 }], ['david', 'idle', { x: -0.2, z: 0.15, look: 0.5, delay: 1500 }]],
      // 곰이 왔을 때도 — 물매를 돌리는 소년 앞에서 물러간다
      'p1.4': [['bear', null, { show: 1, x: 1.35, z: -0.4 }], ['david', 'sling', { x: 0.25, z: 0.2, look: 1, item: 'sling' }],
        ['bear', null, { x: 2.1, z: -0.65, delay: 3000 }], ['bear', null, { show: 0, delay: 4800 }]],
      // 손뼉 쳐 줄 사람 없는 들판 — 밤이 오고 소년은 양 곁에 앉는다
      'p2.0': [['bear', null, { show: 0 }], ['@env', 'night'], ['david', 'sit-ground', { item: null, x: 0.1, z: 0.15, look: 0.4 }]],
      'p2.1': [['david', 'look-up', { look: 0.2 }]],
      'p2.3': [['david', 'pray', { look: 0 }]],
      w0: [['david', 'speak', { item: null }]],
      w1: [['david', 'speak']],
      w2: [['jesse', 'speak', { show: 1, x: 0.9, z: -0.15, look: -1 }]],
      end: [['@env', 'night'], ['david', 'play', { item: 'lyre', look: 0.3 }]],
    },
  },

  /* d02. 이새의 막내에게 부은 기름 — 베들레헴 이새의 집 앞. 슬퍼하던 사무엘에게 빛(여호와의 말씀)이 내린다. 암송아지를 끌고 와 제단에 불을 피우고,
     아들들이 하나씩 사무엘 앞을 지나간다. 들에서 불려 온 막내가 들어서면 빛이 그 위에 머물고, 형들 앞에서 뿔의 기름을 붓는다 */
  d02: {
    wide: 1.3,
    props: {
      grass: ['grass', 0, 0, { r: 1.8 }],
      house: ['house', -1.15, -0.6, { scale: 0.85 }],
      altar: ['altar', 1.05, -0.5, { state: 'idle' }],
      heifer: ['ox', 1.4, 0.15, { scale: 0.75, speed: 0.45, rot: Math.PI }],
      beam: ['beam', 0.55, 0.12, { r: 0.32, h: 2.2 }],
    },
    cast: {
      samuel: ['samuel', 0.55, 0.12, -1],
      elder1: ['hebrew2', -0.35, 0.3, 1],
      elder2: ['man', -0.6, 0.15, 1], // 베들레헴 장로
      jesse: ['jesse', -0.85, -0.15, 0.6],
      eliab: ['eliab', -0.55, -0.32, 0.8],
      abin: ['brother', -0.85, 0.2, 0.7],
      shammah: ['brother2', -1.1, 0.05, 0.7],
      david: ['davidY', -1.9, 0.3, 1],
    },
    beats: {
      enter: [['beam', null, { show: 1, x: -0.02, z: 0.22 }], ['altar', 'fire'], ['heifer', null, { show: 0 }], ['elder1', 'idle', { show: 0 }], ['elder2', 'idle', { show: 0 }],
        ['samuel', 'anoint', { x: 0.22, z: 0.18, look: -1, item: 'oilhorn' }], ['david', 'kneel', { x: -0.08, z: 0.22, look: 1 }],
        ['jesse', 'idle', { x: -0.75, z: -0.2, look: 0.8 }], ['eliab', 'idle', { look: 0.8 }], ['abin', 'idle', { look: 0.8 }], ['shammah', 'idle', { look: 0.8 }]],
      // 라마에서 사울 때문에 슬퍼하는 사무엘 — 아무도 없다
      intro: [['beam', null, { show: 0 }], ['altar', 'idle', { show: 0 }], ['heifer', null, { show: 0 }], ['elder1', 'idle', { show: 0 }], ['elder2', 'idle', { show: 0 }],
        ['jesse', 'idle', { show: 0 }], ['eliab', 'idle', { show: 0 }], ['abin', 'idle', { show: 0 }], ['shammah', 'idle', { show: 0 }], ['david', 'idle', { show: 0 }],
        ['samuel', 'mourn', { look: -0.3 }]],
      'p0.1': [['beam', null, { show: 1 }], ['samuel', 'look-up', { look: 0 }]],
      'p0.3': [['samuel', 'listen', { item: 'oilhorn' }]],
      'p0.5': [['samuel', 'afraid', { look: 0 }]],
      // 암송아지를 끌고 — 베들레헴으로
      'p0.6': [['samuel', 'listen'], ['heifer', null, { show: 1, x: 1.05, z: 0.15 }]],
      // 장로들이 떨며 맞는다
      'p1.0': [['beam', null, { show: 0 }], ['samuel', 'idle', { item: null, x: 0.4, z: 0.08, look: -1 }], ['altar', 'idle', { show: 1 }],
        ['elder1', 'afraid', { show: 1, x: -0.2, z: 0.3, look: 1 }], ['elder2', 'afraid', { show: 1, x: -0.45, z: 0.15, look: 1 }]],
      'p1.1': [['elder1', 'speak', { to: 'samuel' }], ['elder2', 'listen']],
      'p1.2': [['samuel', 'speak', { to: 'elder1' }], ['elder1', 'listen'], ['altar', 'fire', { delay: 1500 }]],
      // 이새와 아들들 — 맏아들 엘리압이 앞에 선다
      'p1.3': [['elder1', 'idle', { x: 0.15, z: -0.42, look: 0.5 }], ['elder2', 'idle', { x: 0.45, z: -0.5, look: 0.2 }], ['elder2', 'idle', { show: 0, delay: 2400 }],
        ['jesse', 'idle', { show: 1, x: -0.75, z: -0.2, look: 0.8 }], ['eliab', 'idle', { show: 1, x: -0.12, z: 0.12, look: 1, delay: 600 }],
        ['abin', 'idle', { show: 1, look: 0.7 }], ['shammah', 'idle', { show: 1, look: 0.7 }], ['samuel', 'idle', { look: -1 }]],
      'p1.5': [['beam', null, { show: 1, x: 0.4, z: 0.08 }], ['samuel', 'look-up', { look: -0.3 }]],
      'p1.6': [['samuel', 'listen']],
      'p1.7': [['eliab', 'idle', { x: -0.5, z: -0.35, look: 0.8, delay: 1200 }]],
      // 아비나답도, 삼마도 아니다 — 하나씩 지나간다
      'p2.0': [['beam', null, { show: 0 }], ['samuel', 'idle', { look: -1 }], ['abin', 'idle', { x: -0.1, z: 0.15, look: 1 }], ['abin', 'idle', { x: -0.85, z: 0.2, look: 0.7, delay: 2600 }],
        ['shammah', 'idle', { x: -0.15, z: 0.25, look: 1, delay: 2800 }], ['shammah', 'idle', { x: -1.1, z: 0.05, look: 0.7, delay: 5200 }]],
      'p2.1': [['samuel', 'shrug', { look: -1 }]],
      'p2.2': [['samuel', 'speak', { to: 'jesse' }]],
      'p2.3': [['samuel', 'idle'], ['jesse', 'speak', { to: 'samuel' }]],
      'p2.4': [['jesse', 'idle'], ['samuel', 'speak', { to: 'jesse' }]],
      // 들판에서 불려 온 소년 — 빛이 그 위에 머문다
      'p2.5': [['samuel', 'idle'], ['david', 'idle', { show: 1, x: -0.08, z: 0.22, look: 1 }]],
      'p2.6': [['beam', null, { show: 1, x: -0.02, z: 0.22 }], ['samuel', 'idle', { item: 'oilhorn', x: 0.22, z: 0.18, look: -1 }]],
      // 형들 앞에서 기름을 붓는다
      'p2.7': [['david', 'kneel', { look: 1 }], ['samuel', 'anoint', { item: 'oilhorn', delay: 900 }], ['eliab', 'idle', { look: 0.8 }], ['abin', 'idle', { look: 0.8 }], ['shammah', 'idle', { look: 0.8 }]],
      w0: [['beam', null, { show: 1 }], ['samuel', 'look-up']],
      w1: [['beam', null, { show: 1 }], ['samuel', 'listen']],
      w2: [['samuel', 'speak', { to: 'jesse' }], ['jesse', 'idle', { show: 1 }]],
      end: [['samuel', 'bless', { item: null }], ['david', 'kneel']],
    },
  },

  /* d03. 수금 타는 소년 — 기브아 사울의 궁 안. 왕좌의 사울이 악한 영에 짓눌려 웅크리고, 신하들이 아뢴다. 젊은 신하가 이새의 아들을 말하고,
     소년이 짐 실은 나귀(빵·포도주·염소 새끼)를 끌고 들어온다. 어두워진 방에 수금 가락이 번지면 사울이 숨을 돌린다 */
  d03: {
    env: 'overcast',
    wide: 1.25,
    props: {
      hall: ['hall', 0, -0.05, { tx: 0.62, lamp: -0.85 }],
      donkey: ['packdonkey', -1.95, 0.35, { speed: 0.5 }],
    },
    cast: {
      saul: ['saul', 0.62, -0.42, -0.4, { y: 0.2, pose: 'sit' }],
      official: ['official', 0.1, -0.15, 0.7],
      servant: ['servant', -0.25, 0.1, 0.7],
      david: ['davidY', -1.8, 0.25, 1],
    },
    beats: {
      enter: [['@env', 'dusk'], ['donkey', null, { show: 0 }], ['saul', 'sit', { look: -0.5 }], ['official', 'idle', { x: -0.85, z: -0.25, look: 1 }], ['servant', 'idle', { x: -1.05, z: 0.1, look: 1 }],
        ['david', 'play', { x: -0.05, z: 0.08, look: 0.8, item: 'lyre' }]],
      intro: [['@env', 'overcast'], ['donkey', null, { show: 0 }], ['david', 'idle', { show: 0 }], ['saul', 'sit', { look: -0.3 }]],
      // 여호와의 영이 떠나고, 악한 영이 왕을 괴롭힌다 — 궁에 그늘
      'p0.1': [['@env', 'dusk'], ['saul', 'cower', { look: 0 }]],
      'p0.3': [['official', 'bow', { look: 1 }]],
      'p0.4': [['official', 'speak', { to: 'saul' }]],
      'p0.6': [['official', 'listen'], ['saul', 'sit', { look: -0.6 }]],
      'p0.7': [['saul', 'sit-speak', { to: 'official' }]],
      // 젊은 신하가 나선다
      'p1.0': [['saul', 'sit'], ['servant', 'idle', { x: 0.0, z: 0.1, look: 1 }]],
      'p1.1': [['servant', 'speak', { to: 'saul' }], ['official', 'idle', { look: 0.4 }]],
      'p1.4': [['servant', 'bow'], ['saul', 'sit-speak', { to: 'servant' }]],
      // 나귀에 빵과 포도주, 염소 새끼를 싣고 — 소년이 들어온다
      'p1.6': [['saul', 'sit'], ['servant', 'idle', { x: -0.3, z: 0.3, look: 0.6 }], ['donkey', null, { show: 1, x: -1.15, z: 0.35 }], ['david', 'idle', { show: 1, x: -0.75, z: 0.22, look: 1 }]],
      // 사울이 그를 아껴 무기를 드는 자로
      'p2.0': [['david', 'bow', { x: 0.05, z: 0.05, look: 1 }], ['saul', 'sit', { look: -0.6 }]],
      'p2.1': [['saul', 'sit-speak', { to: 'official' }], ['david', 'idle']],
      'p2.2': [['saul', 'sit-speak', { to: 'david' }]],
      // 악한 영이 덮칠 때마다 — 수금을 든다
      'p2.4': [['@env', 'dark'], ['saul', 'cower', { look: 0 }], ['donkey', null, { show: 0 }], ['david', 'play', { item: 'lyre', x: -0.05, z: 0.08, look: 0.8 }],
        ['official', 'idle', { x: -0.85, z: -0.25, look: 1 }], ['servant', 'idle', { x: -1.05, z: 0.1, look: 1 }]],
      'p2.5': [['@env', 'dusk'], ['saul', 'sit', { look: -0.5 }]],
      w0: [['servant', 'speak', { to: 'saul' }]],
      w1: [['saul', 'sit-speak', { to: 'official' }]],
      w2: [['saul', 'sit-speak', { to: 'david' }], ['david', 'idle', { show: 1 }]],
      end: [['@env', 'dusk'], ['saul', 'sit'], ['david', 'play', { item: 'lyre' }]],
    },
  },

  /* d04. 엘라 골짜기의 거인 — 골짜기를 사이에 둔 두 산의 진. 블레셋 진(오른쪽)에서 골리앗이 방패 든 자를 앞세워 걸어 나와 외치고,
     이스라엘 진(왼쪽)의 사울과 군사들이 두려워 물러난다. 볶은 곡식 바구니를 든 소년이 들어와 묻고, 맏형 엘리압이 꾸짖는다 */
  d04: {
    wide: 1.45,
    props: {
      sand: ['sand', 0, 0.1, { r: 1.9, color: '#b9a57e', stones: 20 }],
      hillL: ['hill', -1.4, -0.42, { w: 0.95, h: 0.32, d: 0.6, color: '#8a7a5e' }],
      hillR: ['hill', 1.4, -0.42, { w: 0.95, h: 0.32, d: 0.6, color: '#8a7a5e' }],
      campL: ['camp', -1.45, -0.6, { y: 0.27, n: 4, span: 0.8, color: '#8a7a62', flag: '#3c5d96' }],
      campR: ['camp', 1.45, -0.6, { y: 0.27, n: 4, span: 0.8, color: '#d8c8a8', flag: '#9d3328' }],
      brook: ['brook', 0, 0.42, { len: 2.6 }],
    },
    cast: {
      saul: ['saul', -1.35, -0.3, 1],
      is1: ['israelite', -1.0, -0.12, 1, { gaze: false }],
      is2: ['israelite2', -1.5, 0.12, 1, { gaze: false }],
      is3: ['israelite', -1.0, 0.32, 1, { gaze: false }],
      eliab: ['eliab', -0.6, -0.05, 0.8],
      ph1: ['philistine', 1.4, -0.05, -1, { gaze: false }],
      ph2: ['philistine', 1.15, -0.25, -1, { gaze: false }],
      goliath: ['goliath', 1.65, 0.05, -1],
      bearer: ['shieldman', 1.85, 0.15, -1, { gaze: false }],
      david: ['davidY', -1.95, 0.4, 1],
    },
    beats: {
      enter: [['goliath', 'point', { x: 0.62, z: 0.02, look: -1 }], ['bearer', 'idle', { x: 0.32, z: 0.1, look: -1, item: 'shield' }],
        ['is1', 'afraid', { look: 1 }], ['is3', 'afraid', { look: 1 }], ['saul', 'afraid', { look: 1 }], ['david', 'listen', { x: -0.3, z: 0.3, look: 1, item: null }], ['eliab', 'idle', { look: 0.5 }]],
      intro: [['@env', 'day'], ['goliath', 'idle', { show: 0 }], ['bearer', 'idle', { show: 0, item: 'shield' }], ['david', 'idle', { show: 0 }]],
      // 날마다 블레셋 진에서 한 사람이 걸어 나온다
      'p0.1': [['goliath', 'idle', { show: 1, x: 0.62, z: 0.02, look: -1 }], ['bearer', 'idle', { show: 1, x: 0.32, z: 0.1, look: -1, item: 'shield' }]],
      'p0.3': [['goliath', 'idle', { look: -0.6 }]],
      // 거인의 목소리가 골짜기를 울린다
      'p1.0': [['goliath', 'rebuke', { look: -1 }]],
      'p1.1': [['goliath', 'point', { look: -1 }]],
      'p1.2': [['goliath', 'rebuke']],
      'p1.3': [['saul', 'afraid', { look: 1 }], ['is1', 'afraid', { x: -1.1, z: -0.15 }], ['is3', 'afraid', { x: -1.1, z: 0.35 }], ['is2', 'cower'], ['eliab', 'afraid']],
      // 아침에도 저녁에도 — 사십 일
      'p1.4': [['goliath', 'idle'], ['@env', 'dusk'], ['@env', 'day', { delay: 2600 }], ['@env', 'dusk', { delay: 5200 }], ['@env', 'day', { delay: 7600 }]],
      // 막내가 볶은 곡식과 빵을 들고 온다
      'p2.0': [['@env', 'day'], ['goliath', 'idle'], ['saul', 'idle', { look: 1 }], ['is1', 'idle'], ['is2', 'idle'], ['is3', 'idle'], ['eliab', 'idle', { look: 0.5 }],
        ['david', 'hold-basket', { show: 1, x: -0.3, z: 0.3, look: 1 }]],
      'p2.1': [['goliath', 'rebuke'], ['david', 'idle', { look: 1 }]],
      // 군사들은 달아나지만 소년은 묻는다
      'p2.2': [['is1', 'afraid', { x: -1.25, z: -0.15 }], ['is3', 'afraid', { x: -1.25, z: 0.38 }], ['goliath', 'idle']],
      'p2.3': [['david', 'speak', { to: 'is3' }]],
      // 맏형 엘리압이 화를 낸다
      'p2.4': [['david', 'idle'], ['eliab', 'rebuke', { x: -0.62, z: 0.12, to: 'david' }]],
      'p2.5': [['eliab', 'speak', { to: 'david' }], ['david', 'listen', { look: -1 }]],
      w0: [['david', 'speak', { show: 1, to: 'is3' }]],
      w1: [['david', 'speak', { show: 1, to: 'eliab' }]],
      w2: [['goliath', 'speak', { show: 1 }]],
      w3: [['eliab', 'speak', { to: 'david' }]],
      end: [['eliab', 'idle'], ['david', 'idle', { look: 1 }]],
    },
  },

  /* d05. 다섯 개의 매끄러운 돌 — 같은 골짜기. 소년이 사울 앞에 나서고, 사울의 군복과 놋 투구를 입었다가(davidA로 바꿔 낌) 벗는다.
     시냇가에서 돌을 고르고 물매를 든다. 거인이 비웃으며 다가오고, 소년이 달려 나가 물매를 돌린다 — 거인은 쓰러지며 사라진다(벤 머리는 그리지 않는다).
     블레셋은 달아나고 이스라엘이 함성을 지르며 뒤쫓는다 */
  d05: {
    wide: 1.45,
    props: {
      sand: ['sand', 0, 0.1, { r: 1.9, color: '#b9a57e', stones: 20 }],
      hillL: ['hill', -1.4, -0.42, { w: 0.95, h: 0.32, d: 0.6, color: '#8a7a5e' }],
      hillR: ['hill', 1.4, -0.42, { w: 0.95, h: 0.32, d: 0.6, color: '#8a7a5e' }],
      campL: ['camp', -1.45, -0.6, { y: 0.27, n: 4, span: 0.8, color: '#8a7a62', flag: '#3c5d96' }],
      campR: ['camp', 1.45, -0.6, { y: 0.27, n: 4, span: 0.8, color: '#d8c8a8', flag: '#9d3328' }],
      brook: ['brook', 0, 0.42, { len: 2.6 }],
    },
    cast: {
      saul: ['saul', -1.2, -0.08, 1],
      is1: ['israelite', -1.5, -0.2, 1, { gaze: false }],
      is2: ['israelite2', -1.5, 0.25, 1, { gaze: false }],
      ph1: ['philistine', 1.45, -0.1, -1, { gaze: false }],
      ph2: ['philistine', 1.2, -0.3, -1, { gaze: false }],
      goliath: ['goliath', 0.95, 0.0, -1],
      bearer: ['shieldman', 0.68, 0.08, -1, { gaze: false }],
      david: ['davidY', -0.8, 0.12, -1, { speed: 0.85 }],
      armed: ['davidA', -0.8, 0.12, -1],
    },
    beats: {
      enter: [['armed', 'idle', { show: 0 }], ['david', 'sling', { x: -0.05, z: 0.18, look: 1, item: 'sling' }], ['goliath', 'rebuke', { x: 0.62, z: 0.02, look: -1 }], ['bearer', 'idle', { x: 0.35, z: 0.1, item: 'shield' }]],
      intro: [['armed', 'idle', { show: 0 }], ['bearer', 'idle', { item: 'shield' }]],
      // 소년의 말이 사울에게 — 종이 나가 싸우겠습니다
      'p0.0': [['saul', 'listen', { look: 1 }]],
      'p0.1': [['david', 'speak', { to: 'saul' }]],
      'p0.3': [['david', 'listen'], ['saul', 'speak', { to: 'david' }]],
      'p0.4': [['saul', 'listen'], ['david', 'speak', { to: 'saul' }]],
      // 사울의 군복과 놋 투구 — 몇 걸음 떼다 벗는다
      'p0.5': [['saul', 'idle'], ['david', 'idle', { show: 0, x: -0.62 }], ['armed', 'idle', { show: 1 }], ['armed', 'idle', { x: -0.62, z: 0.16, look: 1, delay: 1500 }], ['armed', 'shrug', { delay: 3200 }]],
      'p0.6': [['armed', 'idle', { show: 0, x: -0.62, z: 0.16 }], ['david', 'speak', { show: 1, x: -0.62, z: 0.16, to: 'saul' }]],
      // 시냇가에서 매끄러운 돌 다섯 개
      'p1.0': [['armed', 'idle', { show: 0 }], ['david', 'idle', { x: -0.35, z: 0.3, look: 0.4 }], ['david', 'kneel', { delay: 2200 }]],
      'p1.1': [['david', 'idle', { item: 'sling', x: -0.25, z: 0.22, look: 1 }]],
      // 거인이 붉은 얼굴의 소년을 보고 비웃는다
      'p1.2': [['goliath', 'idle', { x: 0.7, z: 0.02, look: -1 }], ['bearer', 'idle', { x: 0.42, z: 0.1, item: 'shield' }]],
      'p1.3': [['goliath', 'speak', { to: 'david' }]],
      'p1.4': [['goliath', 'idle'], ['david', 'speak', { to: 'goliath' }]],
      'p1.6': [['david', 'raise', { look: 1 }]],
      // 달려 나가 물매를 돌린다 — 돌이 이마에, 거인이 쓰러지며 사라진다
      'p2.0': [['david', 'idle', { x: 0.0, z: 0.2, look: 1 }], ['goliath', 'idle', { x: 0.6, z: 0.02 }], ['bearer', 'idle', { x: 0.36, z: 0.12 }]],
      'p2.1': [['david', 'sling', { item: 'sling', look: 1 }]],
      'p2.2': [['goliath', 'topple'], ['goliath', 'topple', { show: 0, delay: 2200 }], ['bearer', 'afraid', { item: null }], ['bearer', 'idle', { x: 1.6, z: 0.2, delay: 1200 }], ['bearer', 'idle', { show: 0, delay: 3200 }],
        ['david', 'idle', { delay: 1200 }]],
      'p2.3': [['goliath', 'idle', { show: 0 }], ['bearer', 'idle', { show: 0 }], ['david', 'idle', { item: null, look: 1 }]],
      // 거인의 칼 — 소년의 손에 (벤 머리는 그리지 않는다)
      'p2.4': [['david', 'idle', { x: 0.5, z: 0.05, look: -0.5 }], ['david', 'kneel', { delay: 2600 }], ['david', 'idle', { item: 'sword', look: -1, delay: 4200 }]],
      // 블레셋이 달아나고 이스라엘이 뒤쫓는다
      'p2.5': [['ph1', 'idle', { x: 2.1, z: -0.3 }], ['ph2', 'idle', { x: 2.0, z: -0.5 }], ['ph1', 'idle', { show: 0, delay: 2200 }], ['ph2', 'idle', { show: 0, delay: 2200 }],
        ['is1', 'raise', { x: 0.4, z: -0.25, look: 1 }], ['is2', 'raise', { x: 0.1, z: 0.35, look: 1 }], ['saul', 'raise', { x: -0.4, z: -0.05, look: 1 }]],
      w0: [['david', 'speak', { show: 1, to: 'goliath' }]],
      w1: [['david', 'speak', { show: 1 }]],
      w2: [['saul', 'speak', { show: 1, to: 'david' }]],
      w3: [['goliath', 'speak', { show: 1, to: 'david' }]],
      end: [['saul', 'idle'], ['david', 'idle', { item: 'sword' }]],
    },
  },

  /* d06. 요나단의 언약 — 기브아 궁. 거인의 칼을 든 소년이 왕좌의 사울 앞에 서고(벤 머리 대신 칼만), 곁의 왕자 요나단이 그를 바라본다.
     요나단이 겉옷과 칼과 활을 하나씩 벗어 건넨다. 소년은 군사들 위에 선 젊은 용사(davidW)가 되어 요나단과 나란히 선다 */
  d06: {
    wide: 1.25,
    props: {
      hall: ['hall', 0, -0.05, { tx: 0.7 }],
    },
    cast: {
      saul: ['saul', 0.7, -0.42, -0.5, { y: 0.2, pose: 'sit' }],
      abner: ['abner', 1.15, -0.2, -0.8],
      jonathan: ['jonathan', 0.28, -0.25, -0.3],
      david: ['davidY', -1.8, 0.2, 1],
      warrior: ['davidW', -0.1, 0.18, -0.5],
      sol1: ['israelite', -0.9, 0.3, 1, { gaze: false }],
      sol2: ['israelite2', -1.2, 0.1, 1, { gaze: false }],
    },
    beats: {
      enter: [['saul', 'sit', { look: -0.5 }], ['warrior', 'idle', { show: 0 }], ['sol1', 'idle', { show: 0 }], ['sol2', 'idle', { show: 0 }],
        ['jonathan', 'idle', { x: -0.45, z: 0.15, look: 1, item: 'cloak' }], ['david', 'idle', { x: 0.0, z: 0.15, look: -1, item: null }]],
      intro: [['warrior', 'idle', { show: 0 }], ['sol1', 'idle', { show: 0 }], ['sol2', 'idle', { show: 0 }], ['david', 'idle', { show: 0, item: 'sword' }]],
      // 거인의 칼을 든 소년이 사울 앞에 선다
      'p0.0': [['david', 'idle', { show: 1, x: 0.05, z: 0.12, look: 1, item: 'sword' }]],
      'p0.1': [['saul', 'sit-speak', { to: 'david' }]],
      'p0.2': [['saul', 'sit'], ['david', 'speak', { to: 'saul', item: null }]],
      // 곁에서 지켜보던 요나단의 마음이 묶인다
      'p0.3': [['david', 'bow'], ['jonathan', 'idle', { look: -0.8 }]],
      'p0.4': [['david', 'idle'], ['jonathan', 'idle', { x: 0.25, z: -0.05, look: -1 }]],
      'p1.0': [['saul', 'sit-speak', { to: 'abner' }], ['abner', 'bow']],
      // 언약 — 겉옷, 칼, 활을 하나씩
      'p1.1': [['saul', 'sit'], ['abner', 'idle'], ['jonathan', 'idle', { x: -0.45, z: 0.15, look: 1 }], ['david', 'idle', { x: 0.0, z: 0.15, look: -1 }], ['jonathan', 'speak', { to: 'david', delay: 1800 }]],
      'p1.2': [['jonathan', 'idle', { item: 'cloak' }], ['david', 'idle', { item: 'cloak', delay: 2600 }], ['jonathan', 'idle', { item: null, delay: 2600 }]],
      'p1.3': [['jonathan', 'idle', { item: 'sword' }], ['david', 'idle', { item: 'sword', delay: 1800 }], ['jonathan', 'idle', { item: 'bow', delay: 1800 }], ['david', 'idle', { item: 'bow', delay: 3600 }], ['jonathan', 'idle', { item: null, delay: 3600 }]],
      'p1.4': [['david', 'bow', { item: null }]],
      // 군사들 위에 선 젊은 용사
      'p2.0': [['david', 'idle', { show: 0, x: -0.1, z: 0.18 }], ['warrior', 'idle', { show: 1, look: -0.6 }], ['jonathan', 'idle', { x: 0.3, z: -0.05, look: -0.6 }]],
      'p2.1': [['sol1', 'bow', { show: 1, look: 1 }], ['sol2', 'bow', { show: 1, look: 1 }], ['warrior', 'speak', { to: 'sol1' }]],
      'p2.2': [['warrior', 'idle'], ['sol1', 'idle'], ['sol2', 'idle'], ['abner', 'bow', { look: -1 }]],
      'p2.3': [['abner', 'idle'], ['warrior', 'idle', { x: -0.2, z: 0.2, look: 0.3 }], ['jonathan', 'idle', { x: 0.15, z: 0.2, look: -0.3 }]],
      w0: [['david', 'speak', { show: 1, to: 'saul' }], ['warrior', 'idle', { show: 0 }]],
      w1: [['saul', 'sit-speak', { to: 'david' }]],
      end: [['warrior', 'idle', { look: 0.3 }], ['jonathan', 'idle', { look: -0.3 }]],
    },
  },

  /* d07. 천천이요 만만이로다 — 기브아 성문 앞. 싸움에서 돌아오는 사울과 다윗을 여인들이 소고 들고 춤추며 맞는다. 노래가 거듭될수록 사울의 얼굴이 굳는다.
     이튿날 궁 안: 수금을 타는 다윗에게 사울이 창을 던지고, 창은 뒷벽에 박힌다. 미갈이 다윗을 사랑하고, 둘이 나란히 선다 */
  d07: {
    wide: 1.3,
    props: {
      gate: ['gate', 0, -0.62, { scale: 1.6 }],
      hall: ['hall', 0, -0.05, { tx: 0.62, lamp: -0.85 }],
      spear: ['spear', 0.42, -0.22, { y: 0.8, len: 0.8, speed: 3.2, rot: 2.79 }],
    },
    cast: {
      saul: ['saul', -1.3, -0.15, 1],
      david: ['davidW', -1.55, 0.15, 1],
      sol: ['israelite', -1.85, -0.05, 1, { gaze: false }],
      official: ['official', 1.2, -0.25, -0.8],
      w1: ['woman', 0.45, 0.25, -0.7, { gaze: false }],
      w2: ['woman2', 0.8, 0.05, -0.8, { gaze: false }],
      w3: ['rahab', 1.05, 0.35, -0.9, { gaze: false }],
      michal: ['michal', -0.85, 0.35, 0.8],
    },
    beats: {
      enter: [['@env', 'dusk'], ['gate', null, { show: 0 }], ['spear', 'stuck', { x: -0.48, z: -0.55 }], ['w1', 'idle', { show: 0 }], ['w2', 'idle', { show: 0 }], ['w3', 'idle', { show: 0 }],
        ['michal', 'idle', { show: 0 }], ['sol', 'idle', { show: 0 }], ['official', 'idle', { show: 0 }],
        ['saul', 'hurl', { x: 0.5, z: -0.2, look: -1 }], ['david', 'afraid', { x: -0.55, z: 0.2, look: 1, item: 'lyre' }]],
      intro: [['@env', 'day'], ['hall', null, { show: 0 }], ['spear', 'fly', { show: 0 }], ['michal', 'idle', { show: 0 }], ['w1', 'idle', { show: 0 }], ['w2', 'idle', { show: 0 }], ['w3', 'idle', { show: 0 }]],
      // 성읍마다 여인들이 소고를 들고 춤추며 맞는다
      'p0.0': [['saul', 'idle', { x: -0.45, z: -0.15, look: 1 }], ['david', 'idle', { x: -0.75, z: 0.15, look: 1 }], ['sol', 'idle', { x: -1.05, z: -0.05 }],
        ['w1', 'dance', { show: 1, item: 'timbrel' }], ['w2', 'dance', { show: 1, item: 'timbrel' }], ['w3', 'dance', { show: 1, item: 'timbrel' }]],
      // 노래가 거듭될수록 왕의 얼굴이 굳는다
      'p0.2': [['saul', 'idle', { look: 0 }]],
      'p0.3': [['saul', 'speak', { to: 'official' }]],
      'p0.4': [['saul', 'rebuke', { to: 'official' }]],
      'p0.5': [['saul', 'idle', { look: -1 }], ['w1', 'idle'], ['w2', 'idle'], ['w3', 'idle']],
      // 이튿날 — 궁 안, 악한 영과 수금
      'p1.0': [['@env', 'dusk'], ['gate', null, { show: 0 }], ['hall', null, { show: 1 }], ['w1', 'idle', { show: 0 }], ['w2', 'idle', { show: 0 }], ['w3', 'idle', { show: 0 }], ['sol', 'idle', { show: 0 }], ['official', 'idle', { show: 0 }],
        ['saul', 'cower', { x: 0.5, z: -0.2, look: -0.5 }], ['david', 'idle', { x: -0.25, z: 0.12, look: 1 }]],
      'p1.1': [['saul', 'rebuke', { look: -0.6 }], ['david', 'play', { item: 'lyre' }]],
      'p1.2': [['saul', 'idle', { look: -1 }]],
      'p1.3': [['saul', 'speak', { to: 'david' }]],
      // 창이 날아오고 다윗은 몸을 피한다 — 창은 뒷벽에 박힌다
      'p1.4': [['saul', 'hurl'], ['spear', 'fly', { show: 1 }], ['spear', 'fly', { x: -0.48, z: -0.55, delay: 150 }], ['spear', 'stuck', { delay: 650 }], ['david', 'afraid', { x: -0.55, z: 0.2 }]],
      'p1.5': [['saul', 'afraid', { look: -1 }], ['david', 'idle', { item: null, look: 1 }]],
      // 천부장으로 싸움터에 — 사울의 딸 미갈
      'p2.0': [['saul', 'idle', { look: -0.6 }], ['spear', 'stuck', { show: 0 }], ['david', 'idle', { x: -0.95, z: 0.2, look: -1 }], ['sol', 'idle', { show: 1, x: -1.3, z: 0.05, look: 1 }]],
      'p2.1': [['saul', 'idle', { look: -0.8 }]],
      'p2.2': [['michal', 'idle', { show: 1, x: -0.35, z: 0.32, look: -1 }], ['david', 'idle', { look: 1 }]],
      'p2.3': [['official', 'idle', { show: 1, x: 1.05, z: -0.15, look: -1 }], ['saul', 'speak', { to: 'official' }]],
      'p2.4': [['saul', 'idle'], ['david', 'idle', { x: -1.6, z: 0.1, look: -1 }], ['sol', 'idle', { x: -1.9, z: -0.05 }], ['david', 'idle', { x: -0.7, z: 0.25, look: 1, delay: 3600 }]],
      'p2.5': [['sol', 'idle', { show: 0 }], ['michal', 'idle', { x: -0.38, z: 0.3, look: -1 }], ['david', 'idle', { look: 1 }], ['saul', 'idle', { look: 0.3 }], ['@env', 'dusk']],
      w0: [['david', 'speak', { to: 'saul' }]],
      w1: [['w1', 'dance', { show: 1, item: 'timbrel' }], ['w2', 'dance', { show: 1, item: 'timbrel' }]],
      w2: [['saul', 'speak', { show: 1 }]],
      end: [['@env', 'dusk']],
    },
  },

  /* d08. 창문으로 내려간 밤 — 왼쪽은 사울의 궁, 오른쪽은 다윗과 미갈의 두 층 집. 요나단이 아버지를 말리고 다윗을 다시 데려온다.
     수금 소리 사이로 창이 날아와 벽에 박히고, 다윗은 밤에 집으로 달아난다. 집을 에워싼 파수꾼들 — 미갈이 위층 창에서 줄을 내리고, 다윗이 어둠 속으로 빠져나간다 */
  d08: {
    wide: 1.45,
    props: {
      hall: ['hall', -0.75, -0.05, { w: 1.55, tx: 0.35, lamp: -0.55 }],
      home: ['tallhouse', 1.0, -0.4],
      spear: ['spear', -0.5, -0.2, { y: 0.8, len: 0.8, speed: 3.2, rot: 2.49 }],
    },
    cast: {
      saul: ['saul', -0.4, -0.42, -0.6, { y: 0.2, pose: 'sit' }],
      official: ['official', -1.25, -0.2, 0.8],
      jonathan: ['jonathan', -0.75, 0.1, 0.8],
      david: ['davidW', 0.4, 0.3, -1],
      michal: ['michal', 1.3, 0.12, -0.8],
      g1: ['israelite', 0.3, 0.6, -0.6, { gaze: false }],
      g2: ['israelite2', 1.75, 0.45, -1.2, { gaze: false }],
    },
    beats: {
      enter: [['@env', 'night'], ['home', 'rope'], ['spear', 'stuck', { show: 0 }], ['saul', 'sit', { show: 0 }], ['official', 'idle', { show: 0 }], ['jonathan', 'idle', { show: 0 }],
        ['michal', 'idle', { show: 1, look: -1 }], ['david', 'idle', { x: 0.35, z: 0.4, look: -1 }], ['g1', 'idle', { show: 1 }], ['g2', 'idle', { show: 1 }]],
      intro: [['@env', 'day'], ['home', 'idle'], ['spear', 'fly', { show: 0 }], ['david', 'idle', { show: 0 }], ['michal', 'idle', { show: 0 }], ['g1', 'idle', { show: 0 }], ['g2', 'idle', { show: 0 }]],
      // 다윗을 죽여라
      'p0.0': [['saul', 'sit-speak', { to: 'jonathan' }]],
      'p0.1': [['saul', 'sit-speak', { to: 'official' }], ['official', 'bow']],
      // 요나단이 다윗에게 숨으라 이른다
      'p0.2': [['saul', 'sit'], ['official', 'idle'], ['jonathan', 'idle', { look: 1 }]],
      'p0.3': [['david', 'idle', { show: 1, x: 0.4, z: 0.3, look: -1 }], ['jonathan', 'idle', { x: 0.0, z: 0.3, look: 1 }], ['jonathan', 'speak', { to: 'david', delay: 2400 }]],
      // 아버지 앞에 선 요나단
      'p0.4': [['jonathan', 'idle', { x: -0.6, z: 0.1, look: 1 }], ['david', 'idle', { x: 0.85, z: 0.6, look: 1 }], ['david', 'idle', { show: 0, delay: 1800 }], ['jonathan', 'idle', { look: 0.6, delay: 2600 }]],
      'p0.5': [['jonathan', 'speak', { to: 'saul' }]],
      'p1.0': [['jonathan', 'listen'], ['saul', 'sit', { look: -0.6 }]],
      'p1.1': [['saul', 'sit-speak', { to: 'jonathan' }]],
      // 다윗이 다시 왕의 곁으로
      'p1.2': [['saul', 'sit'], ['jonathan', 'idle', { x: -1.0, z: 0.25, look: 1 }], ['david', 'bow', { show: 1, x: -0.85, z: 0.12, look: 1 }]],
      // 악한 영이 다시 — 수금 소리 사이로 창이 날아든다
      'p1.3': [['@env', 'dusk'], ['jonathan', 'idle', { show: 0 }], ['official', 'idle', { show: 0 }], ['saul', 'idle', { y: 0, x: -0.4, z: -0.22, look: -0.5 }], ['david', 'play', { item: 'lyre', look: 1 }]],
      'p1.4': [['saul', 'hurl', { look: -1 }], ['spear', 'fly', { show: 1 }], ['spear', 'fly', { x: -0.83, z: -0.45, delay: 150 }], ['spear', 'stuck', { delay: 450 }], ['david', 'afraid', { x: -1.05, z: 0.3 }]],
      // 창은 벽에 꽂히고 다윗은 그 밤 몸을 빼 달아난다
      'p1.5': [['@env', 'night'], ['saul', 'idle', { look: -1 }], ['david', 'idle', { item: null, x: 0.55, z: 0.25, look: 1 }]],
      // 집을 에워싼 사람들
      'p2.0': [['saul', 'idle', { show: 0 }], ['spear', 'stuck', { show: 0 }], ['home', 'lit'], ['g1', 'idle', { show: 1, look: -0.6 }], ['g2', 'idle', { show: 1, look: -1.2 }]],
      'p2.2': [['michal', 'idle', { show: 1, x: 1.2, z: 0.12, look: -1 }]],
      'p2.3': [['michal', 'speak', { to: 'david' }], ['david', 'listen', { look: 1 }]],
      // 창문으로 달아 내린다
      'p2.4': [['michal', 'idle'], ['david', 'idle', { x: 1.15, z: 0.08 }], ['david', 'idle', { show: 0, delay: 1600 }], ['michal', 'idle', { show: 0, delay: 1600 }],
        ['home', 'rope', { delay: 2600 }], ['david', 'idle', { x: 0.82, z: 0.1, delay: 3600 }], ['david', 'idle', { show: 1, delay: 4600 }]],
      'p2.5': [['michal', 'idle', { show: 1, x: 1.3, z: 0.12, look: -1 }], ['david', 'idle', { x: 0.65, z: 0.22, look: -1 }]],
      // 에워싼 자들 사이로 빠져나간다
      'p2.6': [['david', 'idle', { x: -0.4, z: 0.75, look: -1 }], ['david', 'idle', { show: 0, delay: 3800 }]],
      w0: [['jonathan', 'speak', { show: 1, to: 'saul' }], ['saul', 'sit', { show: 1 }]],
      w1: [['saul', 'sit-speak', { show: 1 }]],
      w2: [['michal', 'speak', { show: 1 }]],
      w3: [['saul', 'speak', { show: 1, to: 'michal' }]],
      end: [['@env', 'night'], ['home', 'rope']],
    },
  },

  /* d09. 라마의 선지자들 — 라마 나욧의 집들 앞. 사무엘이 다윗의 이야기를 듣고 함께 나욧으로 간다. 사울이 보낸 병사들이 세 번 오지만,
     하나님의 영(빛)이 임해 그들도 손을 들고 예언한다. 마지막으로 세구의 우물가를 지나 온 사울도 빛 아래 엎드린다 */
  d09: {
    wide: 1.4,
    props: {
      grass: ['grass', 0.3, -0.1, { r: 1.7 }],
      well: ['well', -1.2, 0.25],
      h1: ['house', 0.85, -0.65, { scale: 0.8 }],
      h2: ['house', 1.55, -0.45, { scale: 0.7, stair: false }],
      beam: ['beam', 0.4, 0.02, { r: 0.85, h: 2.4 }],
    },
    cast: {
      samuel: ['samuel', 0.5, 0.05, -1],
      david: ['davidW', 0.15, 0.15, 1],
      pr1: ['hebrew', 1.15, -0.28, -0.8, { gaze: false }],
      pr2: ['hebrew2', 1.5, 0.02, -1, { gaze: false }],
      pr3: ['man', 1.2, 0.35, -0.8, { gaze: false }],
      m1: ['israelite', -1.9, 0.1, 1],
      m2: ['israelite2', -1.9, 0.3, 1],
      m3: ['israelite', -1.9, -0.1, 1],
      saul: ['saul', -1.6, -0.35, 1],
      local: ['man', -1.0, 0.45, -0.3],
    },
    beats: {
      enter: [['beam', null, { show: 1 }], ['samuel', 'bless', { x: 0.78, z: -0.05, look: -1 }], ['david', 'pray', { x: 0.45, z: -0.42, look: 0.6 }], ['pr1', 'raise'], ['pr2', 'raise'], ['pr3', 'raise'],
        ['m1', 'raise', { x: -0.2, z: 0.15, look: 1 }], ['m2', 'raise', { x: -0.55, z: 0.4, look: 1 }], ['m3', 'idle', { show: 0 }], ['saul', 'mourn', { x: 0.3, z: 0.3, look: 1 }], ['local', 'shrug', { x: -0.9, z: 0.4 }]],
      intro: [['@env', 'day'], ['beam', null, { show: 0 }], ['pr1', 'idle', { show: 0 }], ['pr2', 'idle', { show: 0 }], ['pr3', 'idle', { show: 0 }], ['m1', 'idle', { show: 0 }], ['m2', 'idle', { show: 0 }], ['m3', 'idle', { show: 0 }],
        ['saul', 'idle', { show: 0 }], ['local', 'idle', { show: 0 }], ['david', 'idle', { x: -0.3, z: 0.2, look: 1 }], ['david', 'idle', { x: 0.15, z: 0.15, look: 1 }]],
      // 늙은 선지자 앞에서 모두 털어놓는다
      'p0.1': [['david', 'speak', { to: 'samuel' }], ['samuel', 'listen', { look: -1 }]],
      // 함께 나욧으로 — 선지자 무리
      'p0.2': [['david', 'idle', { x: 0.45, z: -0.42, look: 0.6 }], ['samuel', 'idle', { x: 0.78, z: -0.05, look: -1 }],
        ['pr1', 'idle', { show: 1 }], ['pr2', 'idle', { show: 1 }], ['pr3', 'idle', { show: 1 }]],
      // 사울에게 소식이 들어간다
      'p0.3': [['saul', 'idle', { show: 1, x: -1.45, z: -0.3, look: 1 }], ['m1', 'idle', { show: 1, x: -1.1, z: -0.15, look: -1 }]],
      'p0.4': [['m1', 'speak', { to: 'saul' }]],
      // 잡으러 보낸 사람들 — 하나님의 영이 임해 그들도 예언한다
      'p1.0': [['saul', 'point', { look: 1 }], ['m1', 'idle', { x: -0.2, z: 0.15, look: 1 }], ['m2', 'idle', { show: 1, x: -0.55, z: 0.4, look: 1 }]],
      'p1.1': [['saul', 'idle', { show: 0 }], ['samuel', 'bless', { look: -1 }], ['pr1', 'raise'], ['pr2', 'raise'], ['pr3', 'raise'], ['david', 'pray']],
      'p1.2': [['beam', null, { show: 1 }], ['m1', 'raise'], ['m2', 'raise', { delay: 600 }]],
      'p1.3': [['m3', 'idle', { show: 1, x: -0.6, z: -0.1, look: 1 }]],
      'p1.4': [['m3', 'raise']],
      'p1.5': [['m3', 'raise']],
      // 사울이 직접 — 세구의 큰 우물가
      'p2.0': [['beam', null, { show: 0 }], ['saul', 'idle', { show: 1, x: -1.55, z: 0.0, look: 1 }], ['saul', 'idle', { x: -0.95, z: 0.05, look: 1, delay: 300 }], ['local', 'idle', { show: 1, x: -1.25, z: 0.45, look: 0.6 }]],
      'p2.2': [['saul', 'speak', { to: 'local' }], ['local', 'listen']],
      // 나욧으로 가는 길에 그에게도 영이 임한다
      'p2.3': [['saul', 'idle', { x: 0.3, z: 0.3, look: 1 }], ['local', 'idle', { look: 1 }], ['beam', null, { show: 1, delay: 2000 }], ['saul', 'raise', { delay: 3400 }]],
      // 사무엘 앞에 엎드려 그 낮과 밤을
      'p2.4': [['saul', 'mourn'], ['@env', 'dusk'], ['@env', 'night', { delay: 3500 }]],
      'p2.5': [['local', 'shrug', { x: -0.9, z: 0.4 }]],
      'p2.6': [['local', 'speak', { to: 'saul' }]],
      w0: [['m1', 'speak', { show: 1 }]],
      w1: [['saul', 'speak', { show: 1 }]],
      w2: [['local', 'speak', { show: 1 }]],
      end: [['@env', 'dawn'], ['saul', 'mourn']],
    },
  },

  /* d10. 화살 세 개 — 기브아의 들판. 오른쪽 에셀 바위 곁에서 다윗과 요나단이 언약하고, 왼쪽에서는 초하루 잔치 — 비어 있는 다윗의 자리, 노한 사울이 창을 던진다.
     이튿날 아침 요나단이 아이를 데리고 나와 화살을 아이 너머로 쏜다. 아이가 돌아간 뒤 바위 뒤에서 다윗이 나와 세 번 절하고, 두 사람은 끌어안고 운다 */
  d10: {
    wide: 1.4,
    props: {
      grass: ['grass', 0.5, 0.05, { r: 1.5 }],
      stone: ['rocks', 1.25, -0.35, { spots: [[0, 0, 0.26], [0.2, 0.08, 0.14]] }],
      feast: ['feast', -0.95, -0.35, { len: 1.0 }],
      lampF: ['lamp', -0.3, -0.42],
      spear: ['spear', -1.0, -0.15, { y: 0.8, len: 0.8, speed: 3.2, rot: 0.1 }],
      arrow: ['spear', 0.35, 0.1, { arrow: true, y: 0.5, speed: 3.6, rot: 0.15 }],
    },
    cast: {
      jonathan: ['jonathan', 0.35, 0.1, 1],
      david: ['davidW', 0.8, 0.1, -1],
      saul: ['saul', -1.15, -0.55, 0.6, { pose: 'sit' }],
      abner: ['abner', -0.55, -0.6, -0.4, { pose: 'sit' }],
      lad: ['lad', 0.0, 0.3, 1],
    },
    beats: {
      enter: [['@env', 'dawn'], ['feast', null, { show: 0 }], ['lampF', null, { show: 0 }], ['spear', 'fly', { show: 0 }], ['arrow', 'ground', { x: 1.55, z: 0.05 }],
        ['saul', 'sit', { show: 0 }], ['abner', 'sit', { show: 0 }], ['lad', 'idle', { show: 0 }],
        ['jonathan', 'embrace', { x: 0.55, z: 0.15, look: 1, item: null }], ['david', 'embrace', { x: 0.8, z: 0.15, look: -1 }]],
      intro: [['@env', 'day'], ['feast', null, { show: 0 }], ['lampF', null, { show: 0 }], ['spear', 'fly', { show: 0 }], ['arrow', 'fly', { show: 0 }], ['saul', 'sit', { show: 0 }], ['abner', 'sit', { show: 0 }], ['lad', 'idle', { show: 0 }]],
      // 나욧에서 도망쳐 온 다윗 — 무엇을 했기에
      'p0.1': [['david', 'speak', { to: 'jonathan' }]],
      'p0.2': [['david', 'listen'], ['jonathan', 'speak', { to: 'david' }]],
      'p0.3': [['jonathan', 'idle'], ['david', 'shrug']],
      'p0.4': [['david', 'speak', { to: 'jonathan' }]],
      // 들판에 숨기로 — 에셀 바위
      'p0.5': [['david', 'point', { look: 1 }]],
      'p0.6': [['david', 'idle', { look: -1 }], ['jonathan', 'speak', { to: 'david' }]],
      'p0.7': [['jonathan', 'bless', { to: 'david' }], ['david', 'bow']],
      // 초하루 이튿날 — 비어 있는 다윗의 자리
      'p1.0': [['@env', 'dusk'], ['feast', null, { show: 1 }], ['lampF', null, { show: 1 }], ['saul', 'sit', { show: 1, look: 0.6 }], ['abner', 'sit', { show: 1, look: -0.4 }],
        ['jonathan', 'idle', { x: -0.85, z: -0.05, look: -0.3 }], ['jonathan', 'sit', { delay: 3400 }], ['david', 'idle', { x: 1.42, z: -0.55, look: -1 }], ['david', 'cower', { delay: 2600 }]],
      'p1.1': [['saul', 'sit-speak', { to: 'jonathan' }]],
      'p1.2': [['saul', 'sit'], ['jonathan', 'sit-speak', { to: 'saul' }]],
      // 사울이 불같이 일어선다
      'p1.3': [['jonathan', 'sit'], ['saul', 'rebuke', { to: 'jonathan' }]],
      'p1.4': [['saul', 'point', { look: 1 }]],
      'p1.5': [['jonathan', 'speak', { to: 'saul' }]],
      // 대답 대신 창이 날아온다 — 빗나가 사라진다
      'p1.6': [['jonathan', 'afraid', { x: -0.35, z: 0.25 }], ['saul', 'hurl', { look: 1 }], ['spear', 'fly', { show: 1 }], ['spear', 'fly', { x: 0.1, z: -0.05, delay: 150 }], ['spear', 'fly', { show: 0, delay: 700 }]],
      // 이튿날 아침 — 요나단과 어린 종이 들판으로
      'p2.0': [['@env', 'day'], ['spear', 'fly', { show: 0 }], ['feast', null, { show: 0 }], ['lampF', null, { show: 0 }], ['saul', 'idle', { show: 0 }], ['abner', 'idle', { show: 0 }],
        ['jonathan', 'idle', { x: 0.3, z: 0.12, look: 1, item: 'bow' }], ['lad', 'idle', { show: 1, x: 0.55, z: 0.3, look: 1 }]],
      // 화살이 아이 너머로
      'p2.1': [['jonathan', 'shoot', { look: 1 }], ['lad', 'idle', { x: 1.05, z: 0.28, look: 1 }], ['arrow', 'fly', { show: 1, delay: 700 }], ['arrow', 'fly', { x: 1.55, z: 0.05, delay: 800 }], ['arrow', 'ground', { delay: 1300 }]],
      'p2.2': [['jonathan', 'speak', { to: 'lad' }]],
      'p2.3': [['jonathan', 'speak', { to: 'lad' }], ['lad', 'idle', { x: 1.5, z: 0.15 }]],
      // 아이가 성으로 돌아가고 — 다윗이 나와 세 번 절한다
      'p2.5': [['arrow', 'ground', { show: 0 }], ['jonathan', 'idle', { item: null }], ['lad', 'idle', { x: -1.6, z: 0.35, look: -1 }], ['lad', 'idle', { show: 0, delay: 4200 }],
        ['david', 'idle', { x: 0.8, z: 0.15, look: -1, delay: 1500 }], ['david', 'kneel', { delay: 3800 }], ['david', 'bow', { delay: 5000 }], ['david', 'kneel', { delay: 6000 }]],
      'p2.6': [['jonathan', 'embrace', { x: 0.55, z: 0.15, look: 1 }], ['david', 'embrace', { look: -1 }]],
      'p2.7': [['david', 'mourn']],
      'p2.8': [['david', 'idle'], ['jonathan', 'speak', { to: 'david' }], ['david', 'idle', { x: 1.8, z: -0.05, look: 1, delay: 2600 }], ['david', 'idle', { show: 0, delay: 5000 }]],
      w0: [['david', 'speak', { show: 1, to: 'jonathan' }]],
      w1: [['jonathan', 'speak', { to: 'david' }]],
      w2: [['jonathan', 'speak', { to: 'david' }]],
      w3: [['saul', 'speak', { show: 1, to: 'jonathan' }]],
      end: [['jonathan', 'idle', { look: 1 }]],
    },
  },
};

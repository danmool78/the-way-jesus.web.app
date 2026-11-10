/* 열왕기 여정 대본 묶음 b: k12–k22 (stage/kings.js가 합친다)
   엘리야: 아합 앞에서의 선포부터 회오리바람으로 올라가기까지. 엘리야는 털옷의 elijahK, 엘리사는 농부 옷의 elisha → 겉옷을 받은 elishaM.
   하나님은 모습 없이 빛(beam)으로만 — 갈멜산의 불(altar12 'fire'), 손만 한 구름(stormcloud), 로뎀나무 아래의 천사, 세미한 소리, 불수레·불말·회오리바람도 빛과 불꽃으로.
   죽음과 폭력은 그리지 않는다: 바알 선지자들이 제 몸을 상하게 한 것은 미친 듯한 춤으로만(칼·피 없이), 과부의 아들은 살아난 모습만,
   나봇은 성 밖으로 끌려가 사라지는 것까지, 아합의 죽음은 어둠과 떨어진 왕관으로. 묶음 b의 소품·인물은 stage/kings/props-b.js */

// 무리(crowd)의 자리: 가운데를 둘러 n명을 흩어 놓는다 (a.js와 같다)
const flock = (n, rx, rz, seed = 1) => Array.from({ length: n }, (_, i) => {
  const a = i * 2.399 + seed, r = Math.sqrt((i + 0.5) / n);
  return [Math.cos(a) * r * rx, Math.sin(a) * r * rz];
});

export const B = {
  /* k12. 비가 그치리라 — 사마리아 언덕의 왕궁(왼쪽 뒤). 시돈의 공주 이세벨이 들어오고, 아합이 오른쪽에 바알의 산당(제단·돌기둥·아세라 장대)을 세운다.
     백성이 하나둘 그 앞에 무릎 꿇는다. 그때 오른쪽에서 털옷의 엘리야가 걸어 들어와 왕 앞에 선다 — 이슬도 비도 없으리라. 풀빛이 바래고 하늘이 메마른다 */
  k12: {
    env: 'day',
    wide: 1.35,
    props: {
      grass: ['grass', 0.2, 0.05, { r: 2.0, color: '#9aa060' }],
      palace: ['palacebuild', -1.25, -0.85, { w: 1.5, state: 'built' }],
      shrine: ['highplace', 1.15, -0.45, { r: 0.5, color: '#b8a888' }],
      folk: ['crowd', 1.35, 0.3, { spots: flock(6, 0.45, 0.18, 3), face: Math.PI - 0.3 }],
    },
    cast: {
      ahab: ['ahab', -0.45, 0.1, -0.9],
      jezebel: ['jezebel', -2.3, 0.4, 1.2, { speed: 0.5 }],
      maid: ['woman2', -2.6, 0.5, 1.2, { speed: 0.5, gaze: false }],
      bp: ['baalprophet', 1.6, -0.1, -2.6],
      man: ['hebrew', 0.65, 0.2, 2.6, { gaze: false }],
      elijah: ['elijahK', 2.4, 0.5, -1.2, { speed: 0.5 }],
    },
    beats: {
      enter: [['shrine', 'smoke'], ['folk', 'sit'], ['man', 'kneel'], ['jezebel', 'idle', { x: -0.95, z: 0.05, look: 1 }], ['maid', 'idle', { x: -1.3, z: 0.2, look: 1 }],
        ['elijah', 'speak', { x: 0.45, z: 0.3, look: -1.3, to: 'ahab' }], ['ahab', 'idle', { look: 1.3 }]],
      // 사마리아 언덕의 왕궁 — 시돈의 공주를 맞는 왕
      intro: [['@env', 'day'], ['grass', null, { show: 1 }], ['shrine', 'idle', { show: 0 }], ['folk', 'stand', { show: 0 }], ['bp', 'idle', { show: 0 }], ['man', 'idle', { show: 0 }], ['elijah', 'idle', { show: 0 }],
        ['ahab', 'idle', { look: -0.9 }]],
      'p0.0': [['jezebel', 'idle', { x: -0.95, z: 0.05, look: 1 }], ['maid', 'idle', { x: -1.3, z: 0.2, look: 1 }]],
      'p0.1': [['ahab', 'speak', { to: 'jezebel' }], ['jezebel', 'bow', { delay: 1500 }], ['jezebel', 'idle', { delay: 3500 }]],
      // 바알의 신전과 제단, 아세라 목상
      'p0.2': [['ahab', 'point', { look: 1.2 }], ['shrine', 'idle', { show: 1, delay: 600 }], ['bp', 'idle', { show: 1, delay: 1500 }]],
      'p0.3': [['shrine', 'smoke'], ['bp', 'pray']],
      'p0.4': [['ahab', 'bow', { look: 1.3 }], ['jezebel', 'pray', { look: 1.2 }]],
      // 비와 폭풍을 쥐었다고 섬겨지던 신
      'p1.0': [['ahab', 'idle', { look: 1.0 }], ['jezebel', 'idle'], ['bp', 'raise']],
      'p1.1': [['folk', 'stand', { show: 1 }], ['man', 'idle', { show: 1 }]],
      // 백성도 하나둘 바알의 제단 앞에 무릎 꿇는다
      'p1.2': [['bp', 'raise'], ['man', 'kneel'], ['folk', 'sit', { delay: 1200 }]],
      'p1.3': [['@env', 'overcast'], ['bp', 'pray']],
      // 디셉 사람 엘리야가 왕 앞에 선다
      'p2.0': [['@env', 'day'], ['elijah', 'idle', { show: 1, x: 0.45, z: 0.3, look: -1.3 }], ['ahab', 'idle', { look: 1.3, delay: 1800 }], ['jezebel', 'idle', { look: 1.2, delay: 2000 }]],
      'p2.1': [['elijah', 'speak', { to: 'ahab' }]],
      'p2.2': [['elijah', 'raise', { look: -1.2 }]],
      'p2.3': [['elijah', 'rebuke', { look: -1.3 }], ['ahab', 'afraid'], ['jezebel', 'idle', { look: 1.1 }]],
      // 이제 하늘이 대답할 차례 — 풀빛이 바래고 하늘이 메마른다
      'p2.4': [['elijah', 'idle', { look: -1.3 }], ['grass', null, { show: 0.25 }], ['@env', 'dusk'], ['shrine', 'idle']],
      'p2.5': [['elijah', 'idle', { x: 2.4, z: 0.55 }], ['elijah', 'idle', { show: 0, delay: 3800 }], ['ahab', 'idle', { look: 1.3 }]],
      'p2.6': [['elijah', 'idle', { show: 0 }]],
      w0: [['grass', null, { show: 1 }], ['elijah', 'speak', { show: 1, x: 0.45, z: 0.3, look: -1.3, to: 'ahab' }], ['ahab', 'idle', { look: 1.3 }]],
      w1: [['elijah', 'speak', { show: 1, x: 0.45, z: 0.3, to: 'ahab' }], ['ahab', 'rebuke', { look: 1.3 }]],
      end: [['@env', 'dusk'], ['grass', null, { show: 0.25 }], ['shrine', 'smoke', { show: 1 }], ['folk', 'sit', { show: 1 }], ['man', 'kneel', { show: 1 }], ['bp', 'pray', { show: 1 }],
        ['elijah', 'speak', { show: 1, x: 0.45, z: 0.3, look: -1.3, to: 'ahab' }], ['ahab', 'idle', { look: 1.3 }]],
    },
  },

  /* k13. 그릿 시냇가의 까마귀 — 바위 비탈 사이 깊은 골짜기(wadi), 앞으로 흐르는 시냇물. 빛 속에서 말씀을 듣고 숨어든 엘리야에게
     아침저녁으로 까마귀가 빵과 고기를 물어 온다. 하늘은 닫혀 있고, 물줄기가 가늘어지다 웅덩이가 마르고 흰 돌만 남는다 */
  k13: {
    env: 'dawn',
    wide: 1.3,
    props: {
      wadi: ['wadi', 0, -0.05, { len: 3.0 }],
      beam: ['beam', -1.55, 0.5, { r: 0.36, h: 2.4, peak: 0.34 }],
      r1: ['raven', -2.6, 0.0, { speed: 0.9, y: 1.0 }],
      r2: ['raven', -2.9, 0.15, { speed: 0.9, y: 1.15 }],
    },
    cast: {
      elijah: ['elijahK', -1.55, 0.5, 0.6, { speed: 0.45 }],
    },
    beats: {
      enter: [['@env', 'day'], ['beam', null, { show: 0 }], ['elijah', 'sit-ground', { x: 0.05, z: 0.0, look: 0.3 }],
        ['r1', 'rest', { x: 0.35, z: 0.05, y: 0 }], ['r2', 'rest', { x: -0.3, z: 0.1, y: 0 }]],
      // 왕 앞에서 물러난 엘리야 — 아직 시냇물이 흐른다
      intro: [['@env', 'dawn'], ['wadi', 'flow'], ['beam', null, { show: 0 }], ['r1', 'fly', { show: 0, y: 1.0 }], ['r2', 'fly', { show: 0, y: 1.15 }], ['elijah', 'idle', { look: 0.6 }]],
      // 여호와의 말씀이 임했다 — 빛
      'p0.0': [['beam', null, { show: 1 }], ['elijah', 'look-up', { look: 0.2 }]],
      'p0.2': [['elijah', 'listen']],
      'p0.4': [['elijah', 'look-up']],
      'p0.5': [['beam', null, { show: 0 }], ['elijah', 'idle', { x: -0.4, z: 0.42 }], ['elijah', 'idle', { x: 0.05, z: 0.0, delay: 2600 }], ['elijah', 'idle', { look: 0.3, delay: 4200 }]],
      'p1.0': [['@env', 'day'], ['beam', null, { show: 0 }], ['elijah', 'sit-ground', { x: 0.05, z: 0.0, look: 0.3 }]],
      // 아침, 검은 날개가 퍼덕이며 내려앉는다
      'p1.1': [['@env', 'dawn'], ['r1', 'fly', { show: 1, x: 0.35, z: 0.05, y: 0.25 }], ['r2', 'fly', { show: 1, x: -0.3, z: 0.1, y: 0.35, delay: 500 }], ['elijah', 'look-up', { look: -0.6 }]],
      'p1.2': [['r1', 'rest', { y: 0 }], ['r2', 'rest', { y: 0, delay: 400 }], ['elijah', 'sit-ground', { look: 0.3 }],
        ['r1', 'gave', { delay: 1800 }], ['r2', 'gave', { delay: 2000 }], ['elijah', 'sit-ground', { item: 'bread', delay: 2000 }]],
      // 저녁에도 — 날아갔다가 다시 온다
      'p1.3': [['@env', 'dusk'], ['elijah', 'sit-ground', { item: null }], ['r1', 'fly', { x: 2.7, z: -0.3, y: 1.2 }], ['r2', 'fly', { x: 2.9, z: -0.1, y: 1.3 }],
        ['r1', 'fly', { x: 0.35, z: 0.05, y: 0.25, delay: 3500 }], ['r2', 'fly', { x: -0.3, z: 0.1, y: 0.35, delay: 3700 }], ['r1', 'rest', { y: 0, delay: 6200 }], ['r2', 'rest', { y: 0, delay: 6400 }]],
      'p1.4': [['r1', 'rest', { x: 0.35, z: 0.05, y: 0 }], ['r2', 'rest', { x: -0.3, z: 0.1, y: 0 }], ['elijah', 'sit-ground', { item: 'bread' }]],
      // 그 시냇물을 마시며 — 새들은 날아가고
      'p1.5': [['@env', 'day'], ['r1', 'fly', { x: 2.7, z: -0.3, y: 1.2 }], ['r2', 'fly', { x: 2.9, z: -0.1, y: 1.3 }], ['r1', 'fly', { show: 0, delay: 3200 }], ['r2', 'fly', { show: 0, delay: 3200 }],
        ['elijah', 'idle', { item: null, x: 0.05, z: 0.08, look: 0 }], ['elijah', 'kneel', { delay: 1600 }]],
      // 하늘은 닫혀 있고, 물소리가 가늘어진다
      'p2.0': [['r1', 'fly', { show: 0 }], ['r2', 'fly', { show: 0 }], ['elijah', 'sit-ground', { x: 0.05, z: 0.0, look: 0.3 }], ['elijah', 'look-up', { delay: 2000 }]],
      'p2.1': [['wadi', 'low'], ['elijah', 'sit-ground', { look: 0.1 }]],
      'p2.2': [['wadi', 'dry'], ['elijah', 'idle', { x: 0.05, z: 0.05, look: 0 }]],
      'p2.3': [['wadi', 'dry'], ['elijah', 'look-up', { look: 0.2 }]],
      w0: [['beam', null, { show: 1, x: 0.05, z: 0.05 }], ['elijah', 'listen', { show: 1, x: 0.05, z: 0.05, look: 0.2 }]],
      w1: [['beam', null, { show: 1, x: 0.05, z: 0.05 }], ['elijah', 'look-up', { show: 1 }]],
      end: [['@env', 'day'], ['wadi', 'dry'], ['beam', null, { show: 0 }], ['r1', 'fly', { show: 0 }], ['r2', 'fly', { show: 0 }], ['elijah', 'look-up', { show: 1, x: 0.05, z: 0.05, look: 0.2 }]],
    },
  },

  /* k14. 사르밧 과부의 밀가루 통 — 왼쪽 뒤 시돈 땅 성문(kwall), 오른쪽에 다락방이 있는 과부의 집(roomhouse). 성문 앞에서 나뭇가지를 줍던 과부에게
     엘리야가 빵을 청한다. 밀가루 통(flourjar)이 바닥을 보이다가 차오른다. 아이가 숨이 멎은 일은 그리지 않는다 — 어머니의 울음과,
     다락방에 올라가 엎드려 부르짖는 엘리야(등잔), 그리고 다락방에 살아 일어선 아이와 어머니 품으로 */
  k14: {
    env: 'day',
    wide: 1.4,
    props: {
      sand: ['sand', 0, 0.1, { r: 2.0, color: '#d2bc92' }],
      wall: ['kwall', -1.3, -0.95, { scale: 0.7, w: 2.0, color: '#c8b8a0' }],
      house: ['roomhouse', 1.15, -0.35],
      sticks: ['sticks', -0.55, 0.32],
      jar: ['flourjar', 0.45, 0.22, { state: 'low' }],
    },
    cast: {
      widow: ['widow', -0.65, 0.3, -0.5],
      son: ['widowson', 0.55, 0.42, -0.6],
      elijah: ['elijahK', -2.4, 0.4, 1.2, { speed: 0.5 }],
    },
    beats: {
      enter: [['sticks', null, { show: 0 }], ['jar', 'full'], ['elijah', 'bless', { x: -0.2, z: 0.3, look: 1 }], ['widow', 'idle', { x: 0.2, z: 0.35, look: -1 }],
        ['son', 'idle', { x: 0.55, z: 0.42, look: -1 }]],
      // 성문 앞에서 마른 나뭇가지를 줍는 과부 — 아들은 집 앞에
      intro: [['@env', 'day'], ['house', 'idle'], ['sticks', null, { show: 1 }], ['jar', 'low', { show: 0 }], ['elijah', 'idle', { show: 1 }], ['widow', 'bow', { look: -0.5 }], ['son', 'idle', { look: -0.6 }]],
      'p0.0': [['elijah', 'idle', { x: -1.3, z: 0.35, look: 1 }]],
      'p0.1': [['widow', 'bow', { look: -0.3 }], ['sticks', null, { show: 0, delay: 2500 }], ['widow', 'idle', { look: -1.2, delay: 2600 }]],
      'p0.2': [['sticks', null, { show: 0 }], ['elijah', 'speak', { to: 'widow' }], ['widow', 'idle', { look: -1.2 }]],
      // 통에 밀가루 한 줌, 병에 기름 조금
      'p0.3': [['jar', 'low', { show: 1 }], ['elijah', 'idle'], ['widow', 'speak', { to: 'elijah' }]],
      'p0.4': [['widow', 'mourn']],
      'p1.0': [['widow', 'idle', { look: -1.2 }], ['elijah', 'speak', { to: 'widow' }]],
      'p1.1': [['elijah', 'bless', { look: 1 }]],
      'p1.2': [['elijah', 'speak', { to: 'widow' }]],
      'p1.3': [['elijah', 'point', { look: 1.1 }]],
      // 과부는 그 말대로 — 빵을 만들어 건넨다
      'p1.4': [['elijah', 'idle'], ['widow', 'idle', { x: 0.3, z: 0.32 }], ['widow', 'kneel', { look: 1, delay: 2200 }], ['widow', 'idle', { item: 'bread', x: -0.95, z: 0.35, look: -1, delay: 4200 }],
        ['widow', 'idle', { item: null, delay: 7400 }], ['elijah', 'idle', { item: 'bread', delay: 7400 }]],
      // 통은 비지 않았다 — 여러 날을 먹는다
      'p1.5': [['jar', 'full'], ['widow', 'idle', { item: null, x: -0.6, z: 0.35, look: 0.6 }], ['elijah', 'idle', { item: null, x: -1.05, z: 0.3, look: 1 }],
        ['son', 'idle', { x: -0.25, z: 0.42, look: -0.6, delay: 800 }]],
      // 얼마 뒤 아이가 앓는다 — 아이는 그리지 않고 어머니의 울음으로
      'p2.0': [['@env', 'overcast'], ['jar', 'full'], ['son', 'idle', { show: 0 }], ['son', 'idle', { x: 1.3, z: -0.38, delay: 1200 }], ['widow', 'mourn', { x: -0.4, z: 0.38, look: 0.4 }]],
      'p2.1': [['widow', 'mourn']],
      'p2.2': [['widow', 'speak', { to: 'elijah', look: -1 }], ['elijah', 'idle', { look: 1 }]],
      // 다락방으로 안고 올라가 세 번 몸을 펴 엎드리며 부르짖는다 (지붕으로 오르는 계단은 집 왼쪽)
      'p2.3': [['@env', 'dusk'], ['house', 'lit'], ['widow', 'mourn'], ['elijah', 'idle', { x: 0.42, z: 0.15 }], ['elijah', 'idle', { show: 0, delay: 2300 }],
        ['elijah', 'idle', { x: 0.98, z: -0.42, delay: 2600 }], ['elijah', 'kneel', { show: 1, look: 0.9, delay: 4200 }], ['elijah', 'raise', { delay: 6400 }], ['elijah', 'kneel', { delay: 8400 }], ['elijah', 'raise', { delay: 10400 }]],
      // 여호와께서 들으셨다 — 아이가 다시 숨을 쉰다 (다락방에 살아 일어선 아이)
      'p2.4': [['@env', 'dawn'], ['house', 'lit'], ['elijah', 'raise', { show: 1, x: 0.98, z: -0.42, look: 0.9 }], ['son', 'idle', { show: 1, x: 1.3, z: -0.38, look: -0.6, delay: 800 }], ['elijah', 'bless', { look: 1, delay: 1800 }]],
      // 내려와 어머니에게 — 과부가 말한다
      'p2.5': [['@env', 'day'], ['house', 'idle'], ['elijah', 'idle', { show: 0 }], ['son', 'idle', { show: 0 }], ['elijah', 'idle', { x: 0.42, z: 0.15, delay: 300 }], ['son', 'idle', { x: 0.4, z: 0.42, delay: 300 }],
        ['elijah', 'idle', { show: 1, delay: 1600 }], ['son', 'idle', { show: 1, delay: 1600 }], ['son', 'idle', { x: -0.15, z: 0.42, look: -1, delay: 2000 }], ['widow', 'idle', { look: 1, delay: 2400 }]],
      'p2.6': [['widow', 'carry', { look: 1 }], ['son', 'idle', { x: -0.15, z: 0.42 }]],
      'p2.7': [['widow', 'speak', { to: 'elijah' }], ['elijah', 'bless', { look: -1 }]],
      w0: [['jar', 'full', { show: 1 }], ['elijah', 'speak', { show: 1, x: -0.95, z: 0.3, to: 'widow' }], ['widow', 'idle', { x: -0.6, z: 0.35, look: -1.2 }]],
      w1: [['elijah', 'listen', { show: 1 }]],
      w2: [['widow', 'speak', { show: 1, to: 'elijah' }], ['son', 'idle', { show: 1 }], ['elijah', 'idle', { show: 1 }]],
      end: [['@env', 'day'], ['house', 'idle'], ['sticks', null, { show: 0 }], ['jar', 'full', { show: 1 }], ['elijah', 'bless', { show: 1, x: 0.42, z: 0.15, look: -1 }],
        ['widow', 'carry', { show: 1, x: -0.4, z: 0.38, look: 1 }], ['son', 'idle', { show: 1, x: -0.15, z: 0.42, look: -1 }]],
    },
  },

  /* k15. 갈멜산의 불 — 왼쪽에 바알의 제단(altar12 baal)과 붉은 옷의 바알 선지자들, 오른쪽에 무너진 여호와의 제단 자리, 양옆으로 온 이스라엘(crowd).
     바알 선지자들의 부르짖음과 날뜀은 춤(dance)으로만 — 칼·피는 그리지 않는다. 저녁, 엘리야가 돌 열두 개로 제단을 쌓고 물을 세 번 붓게 하고(wet),
     기도하자 하늘에서 불이 떨어져(빛줄기와 불꽃) 제물과 돌과 도랑의 물까지 삼킨다(fire → ash). 백성이 엎드린다 */
  k15: {
    env: 'day',
    wide: 1.45,
    props: {
      grass: ['grass', 0, 0.05, { r: 2.0, color: '#a0a070' }],
      rocks: ['rocks', 0, 0, { spots: [[-2.0, -0.6, 0.12], [2.1, -0.5, 0.1], [0.1, -0.85, 0.12]] }],
      altarB: ['altar12', -0.95, -0.45, { baal: true }],
      altarE: ['altar12', 0.95, -0.4],
      folkL: ['crowd', -1.95, 0.35, { spots: flock(7, 0.35, 0.22, 1), face: Math.PI / 2 - 0.3 }],
      folkR: ['crowd', 2.0, 0.35, { spots: flock(7, 0.35, 0.22, 2), face: -Math.PI / 2 + 0.3 }],
    },
    cast: {
      elijah: ['elijahK', 0.2, 0.35, -0.3],
      bp1: ['baalprophet', -1.45, -0.2, 2.4],
      bp2: ['baalprophet2', -0.5, -0.15, -2.4],
      bp3: ['baalprophet', -1.25, 0.12, 2.8, { gaze: false }],
      bp4: ['baalprophet2', -0.7, 0.18, -2.8, { gaze: false }],
      sv1: ['servantE', 1.6, 0.05, -1.2, { gaze: false }],
      sv2: ['hebrew', 1.75, 0.3, -1.2, { gaze: false }],
      man: ['hebrew2', 1.3, 0.55, -1.5],
    },
    beats: {
      enter: [['altarE', 'fire'], ['folkL', 'sit'], ['folkR', 'sit'], ['bp1', 'cower', { look: 1.2 }], ['bp2', 'cower', { look: 1.2 }], ['bp3', 'afraid', { look: 1.2 }], ['bp4', 'afraid', { look: 1.2 }],
        ['elijah', 'raise', { x: 0.55, z: 0.0, look: 0.6 }], ['sv1', 'kneel', { look: -1.5 }], ['sv2', 'kneel', { look: -1.5 }], ['man', 'kneel', { look: -1.5 }]],
      // 가뭄 셋째 해, 갈멜산 꼭대기에 모인 온 이스라엘과 바알 선지자들 — 여호와의 제단은 무너져 있다
      intro: [['@env', 'day'], ['altarB', 'idle'], ['altarE', 'idle', { show: 0 }], ['folkL', 'stand'], ['folkR', 'stand'],
        ['bp1', 'idle', { look: 1.2 }], ['bp2', 'idle', { look: 0.4 }], ['bp3', 'idle'], ['bp4', 'idle'], ['sv1', 'idle'], ['sv2', 'idle'], ['man', 'idle', { look: -1.5 }], ['elijah', 'idle', { look: -0.3 }]],
      'p0.1': [['bp1', 'idle', { look: 1.2 }], ['bp2', 'speak', { to: 'bp4' }]],
      // 엘리야가 백성 앞에 나선다
      'p0.2': [['elijah', 'idle', { x: 0.0, z: 0.45, look: 0 }], ['elijah', 'speak', { look: -0.9, delay: 2400 }], ['bp2', 'idle']],
      'p0.3': [['elijah', 'speak', { look: -1.0 }]],
      'p0.4': [['elijah', 'point', { look: -1.1 }], ['elijah', 'speak', { look: 1.0, delay: 2400 }]],
      // 한마디도 대답하지 못했다
      'p0.5': [['elijah', 'idle', { look: 0 }], ['man', 'idle', { look: -2.2 }]],
      // 송아지를 나무 위에 — 불로 대답하는 신을 하나님으로
      'p1.0': [['elijah', 'point', { look: -1.2 }], ['bp1', 'idle', { look: 0.8 }]],
      // 아침부터 외친다 — 바알이여, 대답하소서
      'p1.1': [['elijah', 'idle', { x: 0.35, z: 0.3, look: -1.2 }], ['bp1', 'raise', { look: 1.0 }], ['bp2', 'raise', { look: -1.0 }], ['bp3', 'dance'], ['bp4', 'dance', { delay: 500 }]],
      'p1.2': [['bp1', 'dance'], ['bp2', 'raise', { look: -1.6 }], ['bp3', 'raise', { look: 2.6 }], ['bp4', 'dance']],
      // 한낮, 엘리야가 놀린다
      'p1.3': [['@env', 'day'], ['elijah', 'speak', { to: 'bp2' }]],
      'p1.4': [['elijah', 'raise', { look: -1.2 }]],
      'p1.5': [['elijah', 'shrug', { look: -1.2 }]],
      // 미친 듯이 날뛴다 (칼과 창은 그리지 않는다 — 춤으로만)
      'p1.6': [['elijah', 'idle'], ['bp1', 'dance'], ['bp2', 'dance'], ['bp3', 'dance'], ['bp4', 'dance']],
      // 저녁이 되도록 아무 대답이 없다
      'p1.7': [['@env', 'dusk'], ['bp1', 'sit-ground', { look: 1.0 }], ['bp2', 'mourn', { look: 2.6 }], ['bp3', 'sit-ground', { look: 2.6 }], ['bp4', 'idle', { look: -2.6 }]],
      // 돌 열두 개로 다시 쌓고, 물을 세 번 붓게 한다
      'p2.0': [['@env', 'dusk'], ['altarE', 'idle', { show: 1 }], ['elijah', 'idle', { x: 0.45, z: 0.0, look: 0.6 }],
        ['sv1', 'idle', { item: 'jar', x: 1.15, z: -0.2, delay: 2000 }], ['sv2', 'idle', { item: 'jar', x: 1.25, z: -0.05, delay: 2300 }], ['altarE', 'wet', { delay: 4000 }],
        ['sv1', 'idle', { x: 1.6, z: 0.05, delay: 5200 }], ['sv2', 'idle', { x: 1.75, z: 0.3, delay: 5400 }], ['sv1', 'idle', { item: null, x: 1.6, z: 0.05, look: -1.2, delay: 8000 }], ['sv2', 'idle', { item: null, look: -1.2, delay: 8000 }]],
      // 엘리야가 기도한다
      'p2.1': [['altarE', 'wet'], ['sv1', 'idle', { item: null, x: 1.6, z: 0.05, look: -1.2 }], ['sv2', 'idle', { item: null, x: 1.75, z: 0.3, look: -1.2 }], ['elijah', 'raise', { look: 0.6 }]],
      'p2.2': [['elijah', 'raise']],
      // 불이 떨어진다 — 하늘에서 내린 빛과 불꽃
      'p2.3': [['altarE', 'fire'], ['elijah', 'look-up', { look: 0.6 }], ['bp1', 'afraid', { look: 1.2 }], ['bp2', 'cower', { look: 1.2 }], ['bp3', 'afraid', { look: 1.2 }], ['bp4', 'cower', { look: 1.2 }]],
      // 백성이 엎드려 외친다
      'p2.4': [['folkL', 'sit'], ['folkR', 'sit', { delay: 400 }], ['man', 'kneel'], ['sv1', 'kneel', { look: -1.5 }], ['sv2', 'kneel', { look: -1.5 }], ['elijah', 'raise']],
      'p2.5': [['man', 'speak', { look: -1.5 }], ['man', 'kneel', { delay: 2500 }]],
      // 여호와의 소리가 불꽃을 가르신다 — 불이 잦아든다
      'p2.6': [['altarE', 'fire']],
      'p2.7': [['altarE', 'ash', { delay: 2500 }], ['elijah', 'idle', { look: 0.6, delay: 2500 }]],
      w0: [['elijah', 'speak', { show: 1, x: 0.0, z: 0.45, look: -0.9 }]],
      w1: [['elijah', 'raise', { show: 1, x: 0.45, z: 0.0, look: 0.6 }]],
      w2: [['altarE', 'fire', { show: 1 }], ['folkL', 'sit'], ['folkR', 'sit'], ['man', 'speak', { show: 1, look: -1.5 }]],
      end: [['@env', 'dusk'], ['altarE', 'fire', { show: 1 }], ['folkL', 'sit'], ['folkR', 'sit'], ['bp1', 'cower', { look: 1.2 }], ['bp2', 'cower', { look: 1.2 }], ['bp3', 'afraid', { look: 1.2 }], ['bp4', 'afraid', { look: 1.2 }],
        ['elijah', 'raise', { x: 0.45, z: 0.0, look: 0.6 }], ['sv1', 'kneel', { look: -1.5 }], ['sv2', 'kneel', { look: -1.5 }], ['man', 'kneel', { look: -1.5 }]],
    },
  },

  /* k16. 손만 한 구름 — 갈멜산 꼭대기(언덕), 왼쪽 뒤로 서쪽 바다. 아합은 오른쪽 상에서 먹고 마시고, 엘리야는 언덕 위에 얼굴을 무릎 사이에 묻는다.
     사환이 바다 쪽 끝까지 일곱 번 오르내리다 손만 한 구름(stormcloud 'hand')을 본다. 하늘이 캄캄해지고 큰비(storm) —
     아합의 병거가 이스르엘(오른쪽)로 달리고, 허리를 동인 엘리야가 그보다 앞서 빗속을 달린다 */
  k16: {
    env: 'day',
    wide: 1.4,
    props: {
      grass: ['grass', 0.2, 0.1, { r: 1.9, color: '#a0a070' }],
      sea: ['water', -2.5, -0.75, { r: 0.95 }],
      hill: ['hill', -0.75, -0.25, { w: 0.85, h: 0.2, d: 0.5, soft: true, color: '#9a8a70' }],
      rocks: ['rocks', 0, 0, { spots: [[-1.45, 0.45, 0.1], [0.45, -0.8, 0.12]] }],
      feast: ['feast', 1.4, -0.1, { len: 0.7 }],
      car: ['kchariot', 1.75, -0.6, { speed: 0.7 }],
      cloud: ['stormcloud', 0, 0, { hx: -2.2, hz: -1.0 }],
      rain: ['rain', 0, 0],
    },
    cast: {
      elijah: ['elijahK', 0.35, 0.25, 1.0, { speed: 0.8 }],
      servant: ['servantE', 0.05, 0.4, 1.0, { speed: 0.75 }],
      ahab: ['ahab', 1.05, 0.25, -1.2],
    },
    beats: {
      enter: [['@env', 'storm'], ['cloud', 'storm'], ['feast', null, { show: 0 }], ['car', null, { x: 0.6, z: 0.05 }], ['ahab', 'idle', { board: 'car', x: 0, z: 0, look: 1.3 }],
        ['elijah', 'idle', { x: 1.35, z: 0.5, look: 1.35 }], ['servant', 'idle', { show: 0 }]],
      // 불이 내린 뒤 — 하늘은 아직 맑다. 엘리야가 왕에게 말한다
      intro: [['@env', 'day'], ['cloud', 'none'], ['feast', null, { show: 1 }], ['car', null, { show: 1 }], ['ahab', 'idle', { board: null, x: 1.05, z: 0.25, look: -1.2 }], ['servant', 'idle', { show: 1 }], ['elijah', 'idle', { look: 1.0 }]],
      'p0.0': [['elijah', 'speak', { to: 'ahab' }]],
      'p0.1': [['elijah', 'point', { look: 1.3 }]],
      'p0.2': [['elijah', 'speak', { to: 'ahab' }], ['ahab', 'idle', { look: -1.0 }]],
      'p0.3': [['elijah', 'look-up', { look: -0.6 }]],
      // 아합은 먹고 마시러, 엘리야는 꼭대기에 올라 땅에 엎드린다
      'p0.4': [['ahab', 'idle', { x: 1.4, z: -0.32, look: 0 }], ['ahab', 'sit', { delay: 2600 }], ['elijah', 'idle', { x: -0.7, z: -0.22, look: -0.9 }], ['servant', 'idle', { x: -0.15, z: 0.25, look: -1.1, delay: 600 }], ['elijah', 'mourn', { delay: 3500 }]],
      'p0.5': [['ahab', 'sit', { x: 1.4, z: -0.32, look: 0 }], ['elijah', 'mourn', { x: -0.7, z: -0.22, look: -0.9 }]],
      // 바다 쪽을 바라보아라 — 사환이 오르내린다
      'p1.0': [['servant', 'idle', { look: -1.1 }]],
      'p1.1': [['servant', 'idle', { x: -1.7, z: 0.15 }], ['servant', 'idle', { look: -2.2, delay: 2600 }]],
      'p1.2': [['servant', 'idle', { x: -0.15, z: 0.25 }], ['servant', 'idle', { look: -1.1, delay: 2600 }]],
      'p1.3': [['servant', 'shrug', { x: -0.15, z: 0.25, look: -1.1 }]],
      'p1.5': [['servant', 'idle', { x: -1.7, z: 0.15 }], ['servant', 'idle', { look: -2.2, delay: 2600 }]],
      'p1.6': [['servant', 'idle', { x: -0.3, z: 0.3 }], ['servant', 'idle', { x: -1.7, z: 0.15, delay: 2800 }], ['servant', 'idle', { x: -0.3, z: 0.3, delay: 5600 }]],
      // 일곱 번째 — 사람 손만 한 작은 구름이 바다에서 올라온다
      'p1.7': [['servant', 'idle', { x: -1.75, z: 0.15, look: -2.2 }], ['cloud', 'hand', { delay: 1800 }], ['servant', 'idle', { x: -0.25, z: 0.28, delay: 3200 }], ['servant', 'speak', { to: 'elijah', delay: 5400 }]],
      'p1.8': [['cloud', 'hand'], ['servant', 'point', { x: -0.25, z: 0.28, look: -1.4 }], ['elijah', 'look-up', { look: -1.2 }]],
      'p2.0': [['elijah', 'speak', { to: 'servant' }], ['servant', 'idle', { look: 1.0 }]],
      // 아합에게 전한다 — 금세 하늘이 캄캄해지고 큰비
      'p2.1': [['servant', 'idle', { x: 0.95, z: -0.15 }], ['servant', 'speak', { to: 'ahab', delay: 2400 }], ['ahab', 'idle', { look: -0.8, delay: 2600 }]],
      'p2.2': [['@env', 'storm'], ['cloud', 'storm'], ['feast', null, { show: 0, delay: 2000 }], ['ahab', 'look-up', { look: -0.6 }], ['servant', 'afraid', { look: -0.8 }]],
      // 아합은 수레를 몰아 이스르엘로
      'p2.3': [['@env', 'storm'], ['cloud', 'storm'], ['feast', null, { show: 0 }], ['servant', 'idle', { x: 0.6, z: 0.2, look: 1 }], ['ahab', 'idle', { x: 1.6, z: -0.6, look: 1.3 }], ['ahab', 'idle', { board: 'car', x: 0, z: 0, delay: 1800 }],
        ['car', null, { x: 3.2, z: -0.55, delay: 2200 }], ['car', null, { show: 0, delay: 6000 }]],
      // 엘리야는 허리를 동이고 왕의 수레보다 앞서 빗속을 달린다
      'p2.4': [['ahab', 'idle', { board: 'car', x: 0, z: 0 }], ['car', null, { x: 3.2, z: -0.55 }], ['elijah', 'idle', { x: 0.1, z: 0.45 }], ['elijah', 'idle', { x: 3.0, z: 0.55, delay: 1400 }],
        ['elijah', 'idle', { show: 0, delay: 4800 }], ['servant', 'idle', { look: 1.3, delay: 1000 }]],
      w0: [['elijah', 'speak', { show: 1, x: 0.35, z: 0.25, to: 'ahab' }]],
      w1: [['cloud', 'hand'], ['servant', 'speak', { show: 1, x: -0.25, z: 0.28, look: -1.4 }]],
      w2: [['elijah', 'speak', { show: 1, x: -0.7, z: -0.22, to: 'servant' }]],
      end: [['@env', 'storm'], ['cloud', 'storm'], ['feast', null, { show: 0 }], ['car', null, { show: 1, x: 0.6, z: 0.05 }], ['ahab', 'idle', { board: 'car', x: 0, z: 0, look: 1.3 }],
        ['elijah', 'idle', { show: 1, x: 1.35, z: 0.5, look: 1.35 }], ['servant', 'idle', { show: 0 }]],
    },
  },

  /* k17. 로뎀나무 아래 — 브엘세바 남쪽 광야의 모래, 오른쪽에 로뎀나무(broom). 이세벨이 보낸 사람의 말에 엘리야가 두려워 사환을 남겨 두고 홀로 들어간다.
     나무 그늘에 앉아 죽기를 구하고 잠든다. 천사는 모습 없이 빛(beam)으로 — 빛이 어루만지면 머리맡에 구운 빵과 물병(cake)이 놓여 있다. 두 번 먹고, 호렙을 향해 떠난다 */
  k17: {
    env: 'day',
    wide: 1.35,
    props: {
      sand: ['sand', 0, 0.05, { r: 2.1, color: '#d8c094' }],
      rocks: ['rocks', 0, 0, { spots: [[-1.9, -0.5, 0.12], [1.9, 0.45, 0.1], [-0.4, -0.75, 0.09]] }],
      broom: ['broom', 1.0, -0.3],
      cake: ['cake', 0.42, -0.08],
      light: ['beam', 0.85, -0.02, { r: 0.36, h: 2.4, peak: 0.36 }],
    },
    cast: {
      elijah: ['elijahK', -1.2, 0.3, -0.9, { speed: 0.5 }],
      servant: ['servantE', -1.5, 0.45, 1.0],
      runner: ['official', -2.5, 0.1, 1.2, { speed: 0.7 }],
    },
    beats: {
      enter: [['servant', 'idle', { show: 0 }], ['runner', 'idle', { show: 0 }], ['elijah', 'sit-ground', { x: 0.82, z: -0.02, look: -0.4 }], ['cake', null, { show: 1 }], ['light', null, { show: 1 }]],
      // 브엘세바 — 이세벨의 사자가 오기 전
      intro: [['@env', 'day'], ['cake', null, { show: 0 }], ['light', null, { show: 0 }], ['runner', 'idle', { show: 0 }], ['elijah', 'idle', { look: 1.0 }], ['servant', 'idle', { look: -1.0 }]],
      // 이세벨이 사람을 보내 말한다
      'p0.1': [['runner', 'idle', { show: 1, x: -1.85, z: 0.15 }], ['runner', 'speak', { to: 'elijah', delay: 1800 }], ['elijah', 'idle', { look: -1.3, delay: 1200 }], ['servant', 'idle', { look: -1.3, delay: 1200 }]],
      'p0.2': [['runner', 'rebuke', { x: -1.85, z: 0.15, look: 1.2 }], ['elijah', 'listen', { look: -1.3 }]],
      // 왕비의 한마디에 일어나 도망친다
      'p0.3': [['runner', 'idle', { x: -2.6, z: 0.05 }], ['runner', 'idle', { show: 0, delay: 1800 }], ['elijah', 'afraid', { look: -1.3 }], ['elijah', 'idle', { x: -0.9, z: 0.45, delay: 2000 }]],
      // 사환을 남겨 두고 홀로 광야로
      'p1.0': [['runner', 'idle', { show: 0 }], ['servant', 'idle', { x: -1.5, z: 0.45, look: 1.2 }], ['elijah', 'idle', { x: 0.2, z: 0.3 }], ['servant', 'idle', { show: 0, delay: 4000 }]],
      'p1.1': [['servant', 'idle', { show: 0 }], ['elijah', 'idle', { x: 0.82, z: -0.02, look: -0.4 }]],
      // 그늘에 주저앉아 죽기를 구한다
      'p1.2': [['elijah', 'sit-ground', { x: 0.82, z: -0.02, look: -0.4 }]],
      'p1.3': [['elijah', 'look-up', { look: -0.2 }], ['elijah', 'sit-ground', { delay: 3000 }]],
      'p1.4': [['elijah', 'mourn', { look: -0.2 }]],
      'p1.5': [['elijah', 'mourn']],
      'p1.6': [['elijah', 'sleep', { look: 1.2 }]],
      // 누군가 어루만졌다 — 빛
      'p2.0': [['light', null, { show: 1 }], ['elijah', 'sleep', { look: 1.2 }]],
      'p2.1': [['light', null, { show: 1 }]],
      'p2.2': [['elijah', 'sit-ground', { look: -0.4 }], ['cake', null, { show: 1, delay: 600 }]],
      'p2.3': [['cake', null, { show: 1 }], ['elijah', 'sit-ground', { look: -1.0 }]],
      // 먹고 마시고 다시 눕는다
      'p2.4': [['light', null, { show: 0 }], ['elijah', 'sit-ground', { item: 'bread', look: -0.6 }], ['elijah', 'sit-ground', { item: null, delay: 3200 }], ['elijah', 'sleep', { look: 1.2, delay: 3600 }]],
      'p2.5': [['light', null, { show: 1 }], ['elijah', 'sleep', { item: null, look: 1.2 }], ['elijah', 'sit-ground', { look: -0.4, delay: 2200 }]],
      'p2.6': [['elijah', 'sit-ground', { look: -0.4 }]],
      'p2.7': [['elijah', 'idle', { look: 0.4 }]],
      // 사십 일 밤낮을 걸어 호렙으로 — 남쪽(앞)으로 떠난다
      'p2.8': [['light', null, { show: 0 }], ['cake', null, { show: 0, delay: 1500 }], ['@env', 'dusk', { delay: 1500 }], ['elijah', 'idle', { x: 2.4, z: 0.65 }], ['elijah', 'idle', { show: 0, delay: 5000 }]],
      w0: [['light', null, { show: 0 }], ['elijah', 'pray', { show: 1, x: 0.82, z: -0.02, look: -0.4 }]],
      w1: [['light', null, { show: 1 }], ['cake', null, { show: 1 }], ['elijah', 'sit-ground', { show: 1, x: 0.82, z: -0.02, look: -0.4 }]],
      w2: [['light', null, { show: 0 }], ['cake', null, { show: 0 }], ['runner', 'speak', { show: 1, x: -0.4, z: 0.2, look: 1.2 }], ['elijah', 'afraid', { show: 1, x: 0.35, z: 0.25, look: -1.3 }]],
      end: [['@env', 'day'], ['servant', 'idle', { show: 0 }], ['runner', 'idle', { show: 0 }], ['elijah', 'sit-ground', { show: 1, x: 0.82, z: -0.02, look: -0.4 }], ['cake', null, { show: 1 }], ['light', null, { show: 1 }]],
    },
  },

  /* k18. 호렙산의 세미한 소리 — 붉은 화강암의 앞이 트인 굴(grotto)에서 밤을 지낸 엘리야. 말씀은 굴 어귀의 희미한 빛으로.
     산을 가르는 바람, 지진, 불(tempest)이 굴 앞을 지나가도 그 안에 여호와는 계시지 않는다. 불이 지나간 뒤 고요한 빛(세미한 소리) —
     엘리야는 겉옷으로 얼굴을 가리고(bow) 굴 어귀에 선다 */
  k18: {
    env: 'night',
    wide: 1.3,
    props: {
      sand: ['sand', 0, 0.1, { r: 2.0, color: '#b8a08a' }],
      peak: ['mountain', 1.6, -1.05, { scale: 0.55 }],
      cave: ['grotto', -0.55, -0.35, { w: 1.3, h: 1.0, d: 0.65, color: '#8a6a5a' }],
      rocks: ['rocks', 0, 0, { spots: [[-1.6, 0.25, 0.14], [1.9, 0.35, 0.12], [0.9, -0.55, 0.1]] }],
      storm: ['tempest', 0.55, 0.15, { r: 1.5 }],
      voice: ['beam', 0.25, 0.35, { r: 0.38, h: 2.4, peak: 0.4 }],
    },
    cast: {
      elijah: ['elijahK', -0.55, -0.42, 0.2],
    },
    beats: {
      enter: [['@env', 'dawn'], ['voice', null, { show: 1 }], ['elijah', 'bow', { x: -0.3, z: 0.05, look: 0.6 }]],
      // 굴에서 밤을 지낸다
      intro: [['@env', 'night'], ['storm', 'still'], ['voice', null, { show: 0 }], ['elijah', 'sleep', { look: 1.2 }]],
      // 여호와의 말씀이 임한다 — 굴 어귀의 희미한 빛
      'p0.0': [['elijah', 'sit-ground', { look: 0.2 }], ['voice', null, { show: 0.55, x: -0.35, z: 0.3, delay: 1200 }]],
      'p0.2': [['voice', null, { show: 0.55, x: -0.35, z: 0.3 }], ['elijah', 'listen', { look: 0.3 }]],
      'p0.3': [['elijah', 'kneel', { look: 0.3 }]],
      'p0.4': [['elijah', 'speak', { look: 0.3 }]],
      'p0.5': [['elijah', 'mourn']],
      // 나가서 산 위 내 앞에 서라
      'p1.1': [['elijah', 'idle', { x: -0.55, z: -0.3, look: 0.3 }], ['voice', null, { show: 0, delay: 2000 }], ['@env', 'dawn', { delay: 2000 }]],
      // 크고 센 바람이 산을 가르고 바위를 부순다
      'p1.2': [['voice', null, { show: 0 }], ['@env', 'overcast'], ['storm', 'wind'], ['elijah', 'cower', { look: 0.4 }]],
      'p1.3': [['storm', 'wind'], ['elijah', 'cower']],
      // 지진, 그리고 불
      'p1.4': [['storm', 'quake'], ['storm', 'fire', { delay: 3200 }], ['@env', 'dusk', { delay: 3200 }]],
      'p1.5': [['storm', 'fire'], ['@env', 'dusk'], ['elijah', 'cower']],
      // 불이 지나간 뒤, 낮고 세미한 소리 — 고요한 빛
      'p1.6': [['storm', 'still'], ['@env', 'dawn'], ['voice', null, { show: 1, x: 0.25, z: 0.35, delay: 1200 }], ['elijah', 'idle', { look: 0.5, delay: 1600 }]],
      // 겉옷으로 얼굴을 가리고 동굴 어귀에 선다
      'p1.7': [['voice', null, { show: 1, x: 0.25, z: 0.35 }], ['elijah', 'idle', { x: -0.3, z: 0.05, look: 0.6 }], ['elijah', 'bow', { delay: 2600 }]],
      'p2.0': [['elijah', 'bow', { x: -0.3, z: 0.05, look: 0.6 }]],
      'p2.2': [['elijah', 'speak', { look: 0.6 }]],
      'p2.3': [['elijah', 'mourn']],
      'p2.4': [['elijah', 'bow']],
      // 하사엘과 예후와 엘리사를 세워라 — 칠천 명을 남겨 두었다
      'p2.5': [['elijah', 'listen', { look: 0.6 }]],
      'p2.6': [['@env', 'day'], ['elijah', 'look-up', { look: 0.6 }]],
      w0: [['voice', null, { show: 1, x: 0.25, z: 0.35 }], ['elijah', 'bow', { show: 1, x: -0.3, z: 0.05, look: 0.6 }]],
      w1: [['voice', null, { show: 1, x: 0.25, z: 0.35 }], ['elijah', 'look-up', { show: 1, x: -0.3, z: 0.05, look: 0.6 }]],
      w2: [['voice', null, { show: 1, x: 0.25, z: 0.35 }], ['elijah', 'speak', { show: 1, x: -0.3, z: 0.05, look: 0.6 }]],
      end: [['@env', 'dawn'], ['storm', 'still'], ['voice', null, { show: 1, x: 0.25, z: 0.35 }], ['elijah', 'bow', { show: 1, x: -0.3, z: 0.05, look: 0.6 }]],
    },
  },

  /* k19. 엘리사에게 던진 겉옷 — 요단 골짜기 아벨므홀라의 갈아 놓은 밭(furrows). 겨릿소들이 줄지어 갈고, 맨 끝 열두째 겨리를 엘리사가 몬다.
     오른쪽에서 걸어온 엘리야가 곁을 지나며 겉옷(mantle)을 던진다 — 엘리사는 겉옷을 입은 elishaM으로. 뒤쫓아 가 말하고, 돌아와
     소 한 겨리를 잡고(그리지 않는다 — 겨리가 사라진다) 쪼갠 멍에로 불을 지펴 고기를 삶아 사람들에게 나눈 뒤 엘리야를 따라간다 */
  k19: {
    env: 'day',
    wide: 1.4,
    props: {
      field: ['furrows', 0.1, -0.15, { w: 4.0, d: 1.5 }],
      t1: ['ploughteam', 1.2, -0.75, { speed: 0.1 }],
      t2: ['ploughteam', -0.1, -0.6, { speed: 0.1 }],
      t3: ['ploughteam', -1.4, -0.45, { speed: 0.1 }],
      team: ['ploughteam', -0.6, 0.0, { speed: 0.1 }],
      fire: ['cookfire', -0.55, 0.3],
      folk: ['crowd', -1.25, 0.45, { spots: flock(5, 0.35, 0.16, 2), face: Math.PI / 2 }],
      cloak: ['mantle', 0.3, 0.45, { speed: 1.1 }],
    },
    cast: {
      d1: ['hebrew', 0.55, -0.75, 1.3, { gaze: false, speed: 0.1 }],
      d2: ['hebrew2', -0.75, -0.6, 1.3, { gaze: false, speed: 0.1 }],
      elisha: ['elisha', -1.2, 0.0, 1.3, { speed: 0.1 }],
      elishaM: ['elishaM', -0.35, 0.18, 1.3, { speed: 0.7 }],
      elijah: ['elijahK', 2.4, 0.5, -1.2, { speed: 0.45 }],
    },
    beats: {
      enter: [['team', null, { show: 0 }], ['fire', 'fire'], ['folk', 'sit'], ['cloak', null, { show: 0 }], ['elisha', 'idle', { show: 0 }],
        ['elishaM', 'break', { x: -0.3, z: 0.35, look: -1.2 }], ['elijah', 'idle', { x: 0.5, z: 0.45, look: -1.3 }]],
      // 쟁기 끄는 소들의 숨소리 — 맨 끝 겨리를 모는 엘리사
      intro: [['@env', 'day'], ['team', 'go', { show: 1 }], ['t1', 'go'], ['t2', 'go'], ['t3', 'go'], ['fire', 'idle', { show: 0 }], ['folk', 'stand', { show: 0 }], ['cloak', 'ground', { show: 0, y: 0 }],
        ['elisha', 'idle', { look: 1.3 }], ['elishaM', 'idle', { show: 0 }], ['elijah', 'idle', { show: 0 }]],
      'p0.0': [['t1', null, { x: 1.5 }], ['t2', null, { x: 0.2 }], ['t3', null, { x: -1.1 }], ['d1', 'idle', { x: 0.85 }], ['d2', 'idle', { x: -0.45 }]],
      'p0.1': [['team', null, { x: -0.3 }], ['elisha', 'idle', { x: -0.9, z: 0.0 }]],
      // 호렙에서 돌아온 엘리야가 밭머리로
      'p0.2': [['elijah', 'idle', { show: 1, x: 0.7, z: 0.48 }], ['elisha', 'idle', { look: 1.0, delay: 2500 }]],
      // 곁을 지나며 겉옷을 던진다
      'p1.0': [['elijah', 'idle', { x: 0.1, z: 0.48 }], ['cloak', 'fly', { show: 1, x: 0.1, z: 0.4, y: 0.55, delay: 1500 }], ['elijah', 'idle', { x: -1.6, z: 0.55, delay: 1700 }],
        ['cloak', 'fly', { x: -0.85, z: 0.04, y: 0.45, delay: 1900 }], ['cloak', null, { show: 0, delay: 3200 }], ['elisha', 'idle', { show: 0, delay: 3200 }],
        ['elishaM', 'idle', { show: 1, x: -0.9, z: 0.0, look: -0.4, delay: 3200 }]],
      // 소를 버려두고 뒤쫓아 간다
      'p1.1': [['cloak', null, { show: 0 }], ['elisha', 'idle', { show: 0 }], ['elijah', 'idle', { x: -1.6, z: 0.55 }], ['elishaM', 'idle', { show: 1, x: -1.15, z: 0.4 }], ['elijah', 'idle', { look: 1.3, delay: 2000 }]],
      'p1.2': [['elishaM', 'speak', { to: 'elijah' }]],
      'p1.3': [['elishaM', 'listen'], ['elijah', 'speak', { to: 'elishaM' }]],
      'p1.4': [['elijah', 'speak', { to: 'elishaM' }]],
      'p1.5': [['elijah', 'shrug', { look: 1.3 }]],
      // 돌아가서 — 소 한 겨리를 잡는다(겨리가 사라진다)
      'p2.0': [['elijah', 'idle', { look: 1.3 }], ['elishaM', 'idle', { x: -0.35, z: 0.18, look: -0.6 }]],
      'p2.1': [['elishaM', 'idle', { x: -0.35, z: 0.18, look: -0.6 }], ['team', null, { show: 0, delay: 1500 }]],
      // 쟁기와 멍에를 쪼개 불을 지피고, 고기를 삶아 나눈다
      'p2.2': [['team', null, { show: 0 }], ['fire', 'idle', { show: 1 }], ['fire', 'fire', { delay: 1200 }], ['folk', 'stand', { show: 1, delay: 1500 }], ['folk', 'sit', { delay: 3000 }],
        ['elishaM', 'break', { x: -0.3, z: 0.35, look: -1.2, delay: 1500 }]],
      'p2.3': [['fire', 'fire', { show: 1 }], ['elishaM', 'idle', { x: -0.3, z: 0.35, look: -0.4 }], ['elishaM', 'look-up', { delay: 1500 }]],
      // 일어나 엘리야를 따라간다
      'p2.4': [['elishaM', 'idle', { x: -1.35, z: 0.6 }], ['elijah', 'idle', { x: -2.5, z: 0.6, delay: 1200 }], ['elishaM', 'idle', { x: -2.5, z: 0.65, delay: 2600 }],
        ['elijah', 'idle', { show: 0, delay: 4600 }], ['elishaM', 'idle', { show: 0, delay: 5600 }]],
      w0: [['elishaM', 'speak', { show: 1, x: -1.15, z: 0.4, to: 'elijah' }], ['elijah', 'idle', { show: 1, x: -1.6, z: 0.55, look: 1.3 }]],
      w1: [['elijah', 'speak', { show: 1, x: -1.6, z: 0.55, to: 'elishaM' }], ['elishaM', 'listen', { show: 1, x: -1.15, z: 0.4 }]],
      w2: [['elijah', 'listen', { show: 1 }]],
      end: [['team', null, { show: 0 }], ['fire', 'fire', { show: 1 }], ['folk', 'sit', { show: 1 }], ['cloak', null, { show: 0 }], ['elisha', 'idle', { show: 0 }],
        ['elishaM', 'break', { show: 1, x: -0.3, z: 0.35, look: -1.2 }], ['elijah', 'idle', { show: 1, x: 0.5, z: 0.45, look: -1.3 }]],
    },
  },

  /* k20. 나봇의 포도원 — 이스르엘 왕궁(왼쪽 뒤) 바로 곁의 포도원(오른쪽). 아합이 포도원을 달라 하고 나봇이 거절한다. 아합은 침상에 누워 얼굴을 돌린다.
     이세벨이 왕의 이름으로 편지를 쓰고, 금식 자리의 불량배 둘이 거짓 증언 — 나봇은 성 밖으로 끌려가 사라진다(죽음은 그리지 않는다).
     포도원을 차지하러 온 아합 앞에 엘리야가 서 있다. 아합은 옷을 찢고 굵은 베옷(ahabS)을 입는다 */
  k20: {
    env: 'day',
    wide: 1.4,
    props: {
      grass: ['grass', 0.3, 0.05, { r: 1.9 }],
      palace: ['palacebuild', -1.3, -0.85, { w: 1.4, state: 'built' }],
      vines: ['vineyard', 1.15, -0.35, { rows: 3, len: 1.6 }],
      couch: ['couch', -1.55, 0.25],
      folk: ['crowd', -0.15, -0.35, { spots: flock(7, 0.5, 0.15, 4), face: 0.3 }],
    },
    cast: {
      ahab: ['ahab', -0.15, 0.3, 1.2],
      ahabS: ['ahabS', 0.45, 0.35, 1.2],
      naboth: ['naboth', 0.75, 0.3, -1.2],
      jezebel: ['jezebel', -2.4, 0.4, 1.2],
      s1: ['scoundrel', 0.25, 0.1, 1.0],
      s2: ['scoundrel', 0.4, 0.4, 1.0],
      g1: ['israelK', 1.5, 0.35, -1.2, { speed: 0.5 }],
      elijah: ['elijahK', 1.1, 0.05, -1.2],
    },
    beats: {
      enter: [['folk', null, { show: 0 }], ['s1', 'idle', { show: 0 }], ['s2', 'idle', { show: 0 }], ['g1', 'idle', { show: 0 }], ['naboth', 'idle', { show: 0 }], ['jezebel', 'idle', { show: 0 }],
        ['ahabS', 'idle', { show: 0 }], ['ahab', 'rebuke', { x: 0.45, z: 0.35, look: 1.2 }], ['elijah', 'speak', { to: 'ahab' }]],
      // 왕궁 바로 곁의 포도원 — 아합 왕이 나봇에게 말한다
      intro: [['@env', 'day'], ['folk', null, { show: 0 }], ['s1', 'idle', { show: 0 }], ['s2', 'idle', { show: 0 }], ['g1', 'idle', { show: 0 }], ['jezebel', 'idle', { show: 0 }], ['ahabS', 'idle', { show: 0 }], ['elijah', 'idle', { show: 0 }],
        ['naboth', 'idle', { look: -1.2 }], ['ahab', 'idle', { look: 1.2 }]],
      'p0.1': [['ahab', 'speak', { to: 'naboth' }]],
      'p0.2': [['ahab', 'point', { look: 1.0 }]],
      'p0.3': [['ahab', 'speak', { to: 'naboth' }]],
      'p0.4': [['ahab', 'shrug', { look: 1.2 }]],
      'p0.5': [['ahab', 'idle'], ['naboth', 'bow', { look: -1.2 }]],
      'p0.6': [['naboth', 'speak', { to: 'ahab' }]],
      // 시무룩하여 침상에 누워 얼굴을 돌린다
      'p0.7': [['naboth', 'idle', { x: 1.2, z: 0.0, look: -1.0 }], ['ahab', 'idle', { x: -1.55, z: 0.28 }], ['ahab', 'sleep', { y: 0.16, look: -2.6, delay: 3600 }]],
      // 이세벨이 말한다
      'p1.0': [['ahab', 'sleep', { x: -1.55, z: 0.28, y: 0.16, look: -2.6 }], ['jezebel', 'idle', { show: 1, x: -1.0, z: 0.4, look: -1.2 }], ['jezebel', 'speak', { to: 'ahab', delay: 2400 }]],
      'p1.1': [['jezebel', 'speak', { to: 'ahab' }]],
      'p1.2': [['jezebel', 'bless', { look: -1.2 }], ['ahab', 'sit', { y: 0.16, look: 1.2, delay: 800 }]],
      // 왕의 이름으로 편지를 쓰고 도장을 찍는다
      'p1.3': [['jezebel', 'idle', { item: 'scroll', look: 0.6 }], ['jezebel', 'point', { item: 'scroll', look: 1.0, delay: 3500 }]],
      // 금식 자리 — 불량배 둘이 일어나 거짓 증언
      'p1.4': [['jezebel', 'idle', { item: null, show: 0 }], ['folk', null, { show: 1 }], ['naboth', 'idle', { x: 0.85, z: 0.3, look: -1.3 }], ['s1', 'idle', { show: 1, delay: 1200 }], ['s2', 'idle', { show: 1, delay: 1400 }], ['s1', 'point', { look: 1.2, delay: 2600 }]],
      'p1.5': [['s1', 'point', { look: 1.2 }], ['s2', 'speak', { look: 1.2 }], ['naboth', 'afraid', { look: -1.3 }]],
      // 성 밖으로 끌려간다 — 그다음은 그리지 않는다
      'p1.6': [['@env', 'overcast'], ['s1', 'idle'], ['s2', 'idle'], ['g1', 'idle', { show: 1, x: 1.15, z: 0.35, look: -1.2 }], ['naboth', 'idle', { x: 2.5, z: 0.6, delay: 2000 }], ['g1', 'idle', { x: 2.7, z: 0.45, delay: 2200 }],
        ['naboth', 'idle', { show: 0, delay: 5200 }], ['g1', 'idle', { show: 0, delay: 5400 }], ['folk', null, { show: 0, delay: 5600 }], ['s1', 'idle', { show: 0, delay: 5600 }], ['s2', 'idle', { show: 0, delay: 5600 }]],
      // 포도원을 차지하러 내려가자 — 거기 엘리야가 서 있다
      'p2.0': [['@env', 'day'], ['naboth', 'idle', { show: 0 }], ['g1', 'idle', { show: 0 }], ['folk', null, { show: 0 }], ['s1', 'idle', { show: 0 }], ['s2', 'idle', { show: 0 }],
        ['ahab', 'idle', { y: 0, x: 0.45, z: 0.35, look: 1.2 }], ['elijah', 'idle', { show: 1, x: 1.1, z: 0.05, look: -1.2, delay: 2400 }], ['ahab', 'afraid', { delay: 3800 }]],
      'p2.2': [['ahab', 'rebuke', { x: 0.45, z: 0.35, look: 1.2 }], ['elijah', 'idle', { show: 1, x: 1.1, z: 0.05, look: -1.2 }]],
      'p2.4': [['ahab', 'idle'], ['elijah', 'speak', { to: 'ahab' }]],
      'p2.5': [['elijah', 'point', { look: -1.2 }]],
      // 옷을 찢고 굵은 베옷을 입고 금식한다
      'p2.6': [['elijah', 'idle'], ['ahab', 'idle', { show: 0 }], ['ahabS', 'mourn', { show: 1, x: 0.45, z: 0.35, look: 1.0 }]],
      'p2.7': [['@env', 'dusk'], ['ahabS', 'mourn'], ['elijah', 'idle', { look: -1.2 }]],
      w0: [['elijah', 'speak', { show: 1, x: 1.1, z: 0.05, to: 'ahab' }]],
      w1: [['elijah', 'speak', { show: 1, x: 1.1, z: 0.05 }]],
      w2: [['ahabS', 'idle', { show: 0 }], ['elijah', 'idle', { show: 0 }], ['ahab', 'idle', { show: 1, x: -0.15, z: 0.3, y: 0, look: 1.2 }], ['naboth', 'speak', { show: 1, x: 0.75, z: 0.3, to: 'ahab' }]],
      w3: [['naboth', 'idle', { show: 0 }], ['ahab', 'idle', { show: 0 }], ['ahabS', 'mourn', { show: 1, x: 0.45, z: 0.35, look: 1.0 }], ['elijah', 'listen', { show: 1, x: 1.1, z: 0.05, look: -1.2 }]],
      end: [['@env', 'dusk'], ['naboth', 'idle', { show: 0 }], ['ahab', 'idle', { show: 0 }], ['ahabS', 'mourn', { show: 1, x: 0.45, z: 0.35, look: 1.0 }], ['elijah', 'idle', { show: 1, x: 1.1, z: 0.05, look: -1.2 }]],
    },
  },

  /* k21. 미가야의 홀로 다른 예언 — 사마리아 성문(kwall) 앞 타작마당(threshing), 나란히 앉은 두 왕(twothrones): 아합(왼쪽)과 여호사밧(오른쪽).
     흰 옷의 궁정 선지자 사백 명(몇 사람)이 손을 들고 외친다. 데리러 간 신하가 미가야를 데려오고, 미가야는 목자 없이 흩어진 양을 본다(양들이 흩어진다).
     시드기야가 꾸짖고(뺨을 치는 모습은 그리지 않는다) 미가야는 끌려간다. 변장한 아합(ahabA)이 싸움터로 — 그다음은 어둠과 빈 자리에 떨어진 왕관 */
  k21: {
    env: 'day',
    wide: 1.4,
    props: {
      wall: ['kwall', 0, -1.05, { scale: 0.7, w: 3.0 }],
      floor: ['threshing', 0, -0.05, { r: 0.8 }],
      thrones: ['twothrones', 0, -0.42],
      sheep1: ['sheep', 1.55, 0.2],
      sheep2: ['sheep', 1.95, -0.15],
      sheep3: ['sheep', 2.15, 0.45],
      sheep4: ['sheep', 1.3, 0.55],
      crown: ['fallencrown', -0.05, 0.05],
    },
    cast: {
      ahab: ['ahab', -0.18, -0.5, 0.2, { y: 0.15, pose: 'sit' }],
      jehoshaphat: ['jehoshaphat', 0.18, -0.5, -0.2, { y: 0.15, pose: 'sit' }],
      zed: ['zedekiahF', -0.35, 0.3, -2.8],
      fp1: ['falseprophet', -1.1, 0.15, 2.4],
      fp2: ['falseprophet', -0.75, 0.4, 2.9],
      fp3: ['falseprophet', 0.75, 0.4, -2.9],
      fp4: ['falseprophet', 1.05, 0.12, -2.4],
      envoy: ['official', 0.55, -0.2, 1.0, { speed: 0.6 }],
      micaiah: ['micaiah', 2.3, 0.55, -1.2, { speed: 0.5 }],
      guard: ['israelK', -1.6, -0.25, 1.0, { speed: 0.5 }],
      ahabA: ['ahabA', -0.35, -0.1, 1.2, { speed: 0.6 }],
    },
    beats: {
      enter: [['crown', null, { show: 0 }], ['sheep1', null, { show: 0 }], ['sheep2', null, { show: 0 }], ['sheep3', null, { show: 0 }], ['sheep4', null, { show: 0 }], ['ahabA', 'idle', { show: 0 }],
        ['fp1', 'idle', { x: -1.3 }], ['fp4', 'idle', { x: 1.3 }], ['zed', 'idle', { x: -0.75, z: 0.45, look: 1.4 }], ['envoy', 'idle', { x: 1.1, z: 0.45, look: -1.2 }],
        ['micaiah', 'speak', { x: 0.25, z: 0.35, look: -2.9, to: 'ahab' }], ['ahab', 'sit', { look: 0.2 }]],
      // 성문 앞 타작마당 — 두 왕이 나란히 앉고 선지자 사백 명이 외친다
      intro: [['@env', 'day'], ['crown', null, { show: 0 }], ['sheep1', null, { show: 0 }], ['sheep2', null, { show: 0 }], ['sheep3', null, { show: 0 }], ['sheep4', null, { show: 0 }],
        ['micaiah', 'idle', { show: 0 }], ['ahabA', 'idle', { show: 0 }], ['ahab', 'sit', { look: 0.2 }], ['jehoshaphat', 'sit', { look: -0.2 }]],
      'p0.1': [['ahab', 'sit', { look: 0.4 }], ['jehoshaphat', 'sit', { look: -0.4 }]],
      'p0.2': [['ahab', 'sit-speak', { to: 'jehoshaphat' }], ['ahab', 'sit', { delay: 3000 }]],
      // 한목소리로 외친다 — 올라가십시오
      'p0.3': [['fp1', 'raise'], ['fp2', 'raise', { delay: 300 }], ['fp3', 'raise', { delay: 200 }], ['fp4', 'raise', { delay: 500 }], ['zed', 'speak', { to: 'ahab' }]],
      'p0.4': [['zed', 'raise', { look: -2.8 }]],
      'p0.5': [['zed', 'point', { look: 2.4 }], ['fp1', 'raise'], ['fp4', 'raise']],
      // 여기 여호와의 선지자가 또 없습니까
      'p1.0': [['fp1', 'idle'], ['fp2', 'idle'], ['fp3', 'idle'], ['fp4', 'idle'], ['zed', 'idle', { look: -2.8 }], ['jehoshaphat', 'sit-speak', { to: 'ahab' }]],
      'p1.1': [['jehoshaphat', 'sit-speak', { to: 'ahab' }]],
      'p1.2': [['jehoshaphat', 'sit'], ['ahab', 'sit-speak', { to: 'jehoshaphat' }]],
      'p1.4': [['ahab', 'sit', { look: -0.6 }]],
      'p1.5': [['ahab', 'sit-speak', { to: 'jehoshaphat' }]],
      // 데리러 간 신하가 귀띔한다
      'p1.6': [['ahab', 'sit'], ['envoy', 'idle', { x: 1.75, z: 0.5 }], ['micaiah', 'idle', { show: 1, x: 2.2, z: 0.55, look: -1.2, delay: 1500 }], ['envoy', 'speak', { to: 'micaiah', delay: 2800 }]],
      'p1.7': [['envoy', 'speak', { x: 1.75, z: 0.5, to: 'micaiah' }], ['micaiah', 'idle', { show: 1, x: 2.2, z: 0.55, look: -1.2 }]],
      'p1.8': [['envoy', 'idle'], ['micaiah', 'speak', { to: 'envoy' }]],
      'p1.9': [['micaiah', 'raise', { look: -1.2 }]],
      // 미가야가 왕 앞에서 말한다
      'p2.0': [['envoy', 'idle', { x: 1.1, z: 0.45, look: -1.2 }], ['fp3', 'idle', { x: 0.95, z: 0.5, look: -1.6 }], ['micaiah', 'idle', { x: 0.25, z: 0.35 }], ['micaiah', 'speak', { look: -2.9, to: 'ahab', delay: 4200 }]],
      // 목자 없는 양처럼 산에 흩어진 것을 보았다
      'p2.1': [['micaiah', 'speak', { x: 0.25, z: 0.35, look: -2.9 }], ['@env', 'overcast'], ['sheep1', null, { show: 1 }], ['sheep2', null, { show: 1, delay: 400 }], ['sheep3', null, { show: 1, delay: 800 }], ['sheep4', null, { show: 1, delay: 1200 }],
        ['sheep1', null, { x: 1.9, z: 0.5, delay: 1500 }], ['sheep2', null, { x: 2.4, z: -0.35, delay: 1500 }], ['sheep3', null, { x: 2.6, z: 0.75, delay: 1500 }], ['sheep4', null, { x: 1.35, z: 0.9, delay: 1500 }]],
      // 시드기야가 꾸짖고, 아합은 미가야를 옥에 가두게 한다
      'p2.2': [['sheep1', null, { show: 0 }], ['sheep2', null, { show: 0 }], ['sheep3', null, { show: 0 }], ['sheep4', null, { show: 0 }], ['@env', 'day'],
        ['zed', 'rebuke', { x: -0.2, z: 0.4, look: 1.4 }], ['micaiah', 'idle', { look: -1.3 }], ['ahab', 'sit-speak', { to: 'guard', delay: 2000 }],
        ['guard', 'idle', { x: -0.55, z: 0.55, delay: 2400 }], ['micaiah', 'idle', { x: -2.4, z: 0.6, delay: 4400 }], ['guard', 'idle', { x: -2.6, z: 0.5, delay: 4600 }],
        ['micaiah', 'idle', { show: 0, delay: 8400 }], ['guard', 'idle', { show: 0, delay: 8600 }]],
      // 아합은 변장하고 싸움터로
      'p2.3': [['micaiah', 'idle', { show: 0 }], ['guard', 'idle', { show: 0 }], ['zed', 'idle', { x: -0.75, z: 0.45, look: 1.4 }], ['@env', 'dusk'],
        ['ahab', 'idle', { show: 0 }], ['ahabA', 'idle', { show: 1, x: -0.35, z: -0.1, look: 1.2, delay: 300 }], ['ahabA', 'idle', { x: 2.6, z: 0.55, delay: 2000 }], ['ahabA', 'idle', { show: 0, delay: 6600 }],
        ['jehoshaphat', 'sit', { look: 0.8, delay: 2000 }]],
      // 무심코 쏜 화살 — 그리지 않는다: 어둠이 내린다
      'p2.4': [['ahab', 'idle', { show: 0 }], ['ahabA', 'idle', { show: 0 }], ['@env', 'dark'], ['fp1', 'idle', { look: 1.6 }], ['fp4', 'idle', { look: 1.6 }]],
      // 그날 저녁 — 빈 자리에 떨어진 왕관
      'p2.5': [['@env', 'dark'], ['fp1', 'idle', { show: 0 }], ['fp2', 'idle', { show: 0 }], ['fp3', 'idle', { show: 0 }], ['fp4', 'idle', { show: 0 }], ['zed', 'idle', { show: 0 }], ['envoy', 'idle', { show: 0 }],
        ['jehoshaphat', 'idle', { show: 0 }], ['crown', null, { show: 1, delay: 1500 }]],
      w0: [['crown', null, { show: 0 }], ['micaiah', 'speak', { show: 1, x: 2.2, z: 0.55, look: -1.2 }]],
      w1: [['micaiah', 'speak', { show: 1, x: 0.25, z: 0.35, look: -2.9 }]],
      w2: [['micaiah', 'speak', { show: 1, x: 0.25, z: 0.35, look: -2.9 }]],
      w3: [['jehoshaphat', 'sit-speak', { show: 1, to: 'ahab' }], ['ahab', 'sit', { show: 1 }]],
      end: [['@env', 'dark'], ['crown', null, { show: 1 }], ['ahab', 'idle', { show: 0 }], ['ahabA', 'idle', { show: 0 }], ['jehoshaphat', 'idle', { show: 0 }], ['micaiah', 'idle', { show: 0 }], ['guard', 'idle', { show: 0 }],
        ['fp1', 'idle', { show: 0 }], ['fp2', 'idle', { show: 0 }], ['fp3', 'idle', { show: 0 }], ['fp4', 'idle', { show: 0 }], ['zed', 'idle', { show: 0 }], ['envoy', 'idle', { show: 0 }]],
    },
  },

  /* k22. 불수레와 회오리바람 — 여리고 앞 요단강(river, 앞뒤로 흐른다). 서쪽(왼쪽)에서 엘리야와 엘리사가 오고, 선지자의 제자들이 멀찍이 지켜본다.
     엘리야가 겉옷을 말아 물을 치니 물이 갈라지고, 둘은 마른 땅을 밟고 동쪽으로 건넌다. 걸으며 이야기하는데 불수레와 불말(빛)이 둘 사이를 가르고,
     엘리야는 회오리바람(빛)을 타고 오른다. 떨어진 겉옷(mantle)을 주운 엘리사(elishaM)가 물을 치자 물이 다시 갈라진다 */
  k22: {
    env: 'day',
    wide: 1.4,
    props: {
      sand: ['sand', 0, 0.05, { r: 2.1, color: '#cbb488' }],
      river: ['river', 0.1, 0.0, { w: 0.6, len: 3.2, gap: 0.34 }],
      sons: ['crowd', -1.85, -0.55, { spots: flock(9, 0.4, 0.16, 5), face: 0.9 }],
      fc: ['firechariot', -2.8, 0.08, { speed: 1.4 }],
      ww: ['whirlwind', 1.45, -0.3, { h: 2.6 }],
      cloak: ['mantle', 1.4, -0.25, { speed: 0.6 }],
    },
    cast: {
      elijah: ['elijahK', -2.0, 0.25, 1.2, { speed: 0.45 }],
      elisha: ['elisha', -2.35, 0.4, 1.2, { speed: 0.45 }],
      elishaM: ['elishaM', 1.4, 0.05, -1.2, { speed: 0.45 }],
      son1: ['prophetson', -1.45, -0.3, 0.9],
      son2: ['prophetson2', -1.2, -0.45, 0.9],
    },
    beats: {
      enter: [['river', 'part'], ['fc', null, { show: 0 }], ['ww', null, { show: 0 }], ['cloak', null, { show: 0 }], ['elijah', 'idle', { show: 0 }], ['elisha', 'idle', { show: 0 }],
        ['elishaM', 'raise', { x: 0.75, z: 0.0, look: -1.3 }], ['son1', 'bow'], ['son2', 'bow']],
      // 길갈을 떠난 스승과 제자
      intro: [['@env', 'day'], ['river', 'flow'], ['fc', null, { show: 0 }], ['ww', null, { show: 0 }], ['cloak', 'ground', { show: 0, y: 0 }], ['sons', null, { show: 0 }], ['son1', 'idle', { show: 0 }], ['son2', 'idle', { show: 0 }],
        ['elishaM', 'idle', { show: 0 }], ['elijah', 'idle', { look: -1.2 }], ['elisha', 'idle', { look: 1.2 }]],
      'p0.1': [['elijah', 'speak', { to: 'elisha' }]],
      'p0.2': [['elijah', 'bless', { look: -1.2 }]],
      'p0.4': [['elijah', 'idle'], ['elisha', 'speak', { to: 'elijah' }]],
      'p0.5': [['elisha', 'speak', { to: 'elijah' }]],
      // 벧엘에서도 여리고에서도 — 함께 걷는다
      'p0.6': [['elisha', 'idle'], ['elijah', 'idle', { x: -1.2, z: 0.2 }], ['elisha', 'idle', { x: -1.5, z: 0.35, delay: 400 }]],
      'p0.7': [['elijah', 'idle', { x: -1.2, z: 0.2 }], ['elisha', 'idle', { x: -1.5, z: 0.35 }], ['elisha', 'idle', { look: 1.2, delay: 2000 }]],
      // 강가 — 제자 오십 명이 멀찍이 서서 본다
      'p1.0': [['sons', null, { show: 1 }], ['son1', 'idle', { show: 1 }], ['son2', 'idle', { show: 1, delay: 300 }], ['elijah', 'idle', { x: -0.42, z: -0.08 }], ['elisha', 'idle', { x: -0.45, z: 0.15, delay: 300 }]],
      // 겉옷을 말아 물을 치니 물이 갈라지고, 마른 땅을 밟고 건넌다
      'p1.1': [['elijah', 'idle', { x: -0.42, z: -0.08, look: 1.3 }], ['elisha', 'idle', { x: -0.45, z: 0.15 }], ['elijah', 'raise', { delay: 500 }], ['river', 'part', { delay: 1300 }],
        ['elijah', 'idle', { x: 0.75, z: -0.08, delay: 2800 }], ['elisha', 'idle', { x: 0.72, z: 0.15, delay: 3000 }], ['river', 'flow', { delay: 6800 }]],
      'p1.2': [['river', 'flow'], ['elijah', 'idle', { x: 0.75, z: -0.08, look: 1.0 }], ['elisha', 'idle', { x: 0.72, z: 0.15, look: -0.9 }], ['elijah', 'idle', { look: 0.5, delay: 600 }]],
      'p1.3': [['elijah', 'speak', { to: 'elisha' }]],
      'p1.5': [['elijah', 'idle'], ['elisha', 'kneel', { look: -0.7 }], ['elisha', 'speak', { to: 'elijah', delay: 1500 }]],
      'p1.7': [['elisha', 'kneel'], ['elijah', 'speak', { to: 'elisha' }]],
      // 둘이 걸으며 이야기하는데 — 불수레와 불말이 두 사람 사이를 가른다
      'p2.0': [['elisha', 'idle'], ['elijah', 'idle', { x: 1.45, z: -0.3 }], ['elisha', 'idle', { x: 1.45, z: 0.4 }], ['elijah', 'idle', { look: -1.2, delay: 2400 }], ['elisha', 'afraid', { look: -1.2, delay: 2800 }],
        ['fc', null, { show: 1, delay: 1500 }], ['fc', null, { x: 3.2, z: 0.08, delay: 1600 }], ['fc', null, { show: 0, delay: 6000 }]],
      // 엘리야는 회오리바람을 타고 하늘로
      'p2.1': [['fc', null, { show: 0 }], ['elisha', 'afraid', { x: 1.45, z: 0.4, look: -1.2 }], ['ww', null, { show: 1 }], ['elijah', 'look-up', { x: 1.45, z: -0.3, look: 0 }],
        ['elijah', 'look-up', { y: 1.4, delay: 1600 }], ['elijah', 'look-up', { show: 0, delay: 3200 }],
        ['cloak', 'fly', { show: 1, x: 1.45, z: -0.28, y: 1.2, delay: 3400 }], ['cloak', 'fly', { x: 1.25, z: 0.05, y: 0.0, delay: 3600 }], ['cloak', 'ground', { delay: 6000 }]],
      'p2.2': [['elijah', 'idle', { show: 0 }], ['cloak', 'ground', { show: 1, x: 1.25, z: 0.05, y: 0 }], ['elisha', 'look-up', { look: -0.3 }]],
      // 내 아버지, 내 아버지여
      'p2.3': [['elisha', 'raise', { look: -0.3 }], ['ww', null, { show: 0, delay: 2500 }], ['elisha', 'mourn', { delay: 2500 }]],
      // 떨어진 겉옷을 주워 요단 물을 친다
      'p2.4': [['ww', null, { show: 0 }], ['elisha', 'idle', { x: 1.3, z: 0.2 }], ['elisha', 'kneel', { look: -0.4, delay: 1400 }], ['cloak', null, { show: 0, delay: 2600 }], ['elisha', 'idle', { show: 0, delay: 2600 }],
        ['elishaM', 'idle', { show: 1, x: 1.3, z: 0.2, delay: 2600 }], ['elishaM', 'idle', { x: 0.75, z: 0.0, look: -1.3, delay: 3400 }], ['elishaM', 'raise', { delay: 6000 }]],
      'p2.5': [['cloak', null, { show: 0 }], ['elisha', 'idle', { show: 0 }], ['elishaM', 'raise', { show: 1, x: 0.75, z: 0.0, look: -1.3 }]],
      // 물이 갈라졌다 — 다시 건넌다
      'p2.6': [['river', 'part'], ['elishaM', 'idle', { x: -0.6, z: 0.0, delay: 1200 }]],
      'p2.7': [['river', 'part'], ['elishaM', 'idle', { x: -0.6, z: 0.0, look: -1.2 }], ['son1', 'idle', { x: -1.1, z: -0.15 }], ['son2', 'idle', { x: -1.25, z: 0.1 }], ['son1', 'speak', { to: 'elishaM', delay: 2200 }]],
      'p2.8': [['son1', 'bow', { x: -1.1, z: -0.15, look: 1.2 }], ['son2', 'bow', { x: -1.25, z: 0.1, look: 1.2, delay: 300 }], ['river', 'flow', { delay: 3000 }]],
      w0: [['elisha', 'speak', { show: 1, x: 0.72, z: 0.15, to: 'elijah' }], ['elishaM', 'idle', { show: 0 }], ['elijah', 'listen', { show: 1, y: 0, x: 0.75, z: -0.08 }]],
      w1: [['elijah', 'speak', { show: 1, y: 0, x: 0.75, z: -0.08, to: 'elisha' }], ['elisha', 'kneel', { show: 1, x: 0.72, z: 0.15 }], ['elishaM', 'idle', { show: 0 }]],
      w2: [['elijah', 'idle', { show: 0 }], ['ww', null, { show: 1 }], ['elisha', 'raise', { show: 1, x: 1.45, z: 0.4, look: -0.3 }], ['elishaM', 'idle', { show: 0 }]],
      w3: [['ww', null, { show: 0 }], ['elisha', 'idle', { show: 0 }], ['river', 'part'], ['elishaM', 'raise', { show: 1, x: 0.75, z: 0.0, look: -1.3 }]],
      end: [['river', 'part'], ['fc', null, { show: 0 }], ['ww', null, { show: 0 }], ['cloak', null, { show: 0 }], ['elijah', 'idle', { show: 0 }], ['elisha', 'idle', { show: 0 }],
        ['sons', null, { show: 1 }], ['elishaM', 'raise', { show: 1, x: 0.75, z: 0.0, look: -1.3 }], ['son1', 'bow', { show: 1 }], ['son2', 'bow', { show: 1 }]],
    },
  },
};

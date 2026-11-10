/* 다윗 여정 대본 묶음 c: d21–d30 (stage/david.js가 합친다)
   헤브론에서 왕이 되기부터 압살롬의 반역까지. 왕이 된 다윗은 davidK(자주 옷·금관), 법궤 앞에서 춤출 때는 세마포 에봇의 davidE.
   연출 원칙: 웃사의 죽음은 빛 속에 스러지는 모습과 엎드린 사람들로만, 싸움(시온·소금 골짜기)은 군사가 나가고 돌아오는 것으로만.
   밧세바 장면은 해 질 녘 지붕 위에 홀로 선 왕과 멀리 불 켜진 집 — 목욕하는 사람은 그리지 않는다. 밧세바는 단정히 베일을 쓴 모습으로만,
   죄와 우리아의 죽음은 낭독과 어둠, 홀로 남은 왕으로. 아이의 죽음은 땅에 엎드린 왕(애도)으로만. 하나님은 모습 없이 빛(beam)으로만 */
import './props-c.js';

// 무리(crowd)의 자리: 가운데를 둘러 n명을 흩어 놓는다 (moses.js와 같다)
const flock = (n, rx, rz, seed = 1) => Array.from({ length: n }, (_, i) => {
  const a = i * 2.399 + seed, r = Math.sqrt((i + 0.5) / n);
  return [Math.cos(a) * r * rx, Math.sin(a) * r * rz];
});

export const C = {
  /* d21. 헤브론의 왕 — 헤브론의 집들 앞. 다윗이 주께 여쭙고 빛 아래에서 듣는다. 두 아내와 사람들을 데리고 올라와 자리 잡고,
     유다 장로들이 와서 기름을 붓는다(davidW → davidK). 야베스로 보내는 사자가 동쪽(요단 건너)으로 떠나고, 세월이 흘러 온 지파가 몰려와 다시 기름을 붓는다 */
  d21: {
    wide: 1.4,
    props: {
      grass: ['grass', 0, 0, { r: 1.85 }],
      h1: ['house', -1.25, -0.62, { scale: 0.8 }],
      h2: ['house', 0.5, -0.75, { scale: 0.7, stair: false }],
      olive: ['olive', -0.35, -0.72],
      beam: ['beam', -1.15, 0.15, { r: 0.32, h: 2.2 }],
      folk: ['crowd', 1.35, 0.25, { spots: flock(12, 0.42, 0.26, 7), face: -Math.PI / 2, speed: 0.35 }],
    },
    cast: {
      david: ['davidW', -1.15, 0.15, 0.4],
      king: ['davidK', -0.1, 0.15, 1],
      abigail: ['abigail', -2.1, 0.4, 1, { speed: 0.6 }],
      ahinoam: ['woman2', -2.1, 0.2, 1, { speed: 0.6 }],
      m1: ['israelite', -2.15, -0.05, 1, { gaze: false, speed: 0.6 }],
      m2: ['israelite2', -2.2, 0.55, 1, { gaze: false, speed: 0.6 }],
      elder: ['elder', 1.9, 0.1, -1],
      elder2: ['hebrew2', 1.95, 0.35, -1],
      elder3: ['man', 1.95, -0.12, -1],
      envoy: ['man', 1.9, 0.55, -1, { speed: 0.9 }],
    },
    beats: {
      enter: [['beam', null, { show: 0 }], ['david', 'idle', { show: 0 }], ['envoy', 'idle', { show: 0 }],
        ['abigail', 'idle', { x: -0.95, z: 0.42, look: 0.7 }], ['ahinoam', 'idle', { x: -1.2, z: 0.3, look: 0.7 }], ['m1', 'idle', { x: -1.35, z: -0.05, look: 0.6 }], ['m2', 'idle', { x: -1.5, z: 0.5, look: 0.6 }],
        ['king', 'kneel', { x: -0.1, z: 0.15, look: 1 }], ['elder', 'anoint', { x: 0.2, z: 0.12, look: -1, item: 'oilhorn' }], ['elder2', 'idle', { x: 0.55, z: 0.38, look: -1 }], ['elder3', 'idle', { x: 0.55, z: -0.12, look: -1 }]],
      intro: [['@env', 'day'], ['beam', null, { show: 0 }], ['folk', null, { show: 0 }], ['king', 'idle', { show: 0 }], ['abigail', 'idle', { show: 0 }], ['ahinoam', 'idle', { show: 0 }], ['m1', 'idle', { show: 0 }], ['m2', 'idle', { show: 0 }],
        ['elder', 'idle', { show: 0 }], ['elder2', 'idle', { show: 0 }], ['elder3', 'idle', { show: 0 }], ['envoy', 'idle', { show: 0 }], ['david', 'pray', { look: 0.3 }]],
      // 시글락에서 주께 여쭙는다 — 빛 아래에서 듣는다
      'p0.1': [['david', 'look-up', { look: 0 }]],
      'p0.2': [['beam', null, { show: 1 }], ['david', 'listen']],
      'p0.3': [['david', 'look-up']],
      'p0.4': [['david', 'listen']],
      // 두 아내와 사람들을 이끌고 산길을 오른다
      'p0.5': [['beam', null, { show: 0 }], ['david', 'idle', { x: -0.1, z: 0.15, look: 1, delay: 600 }],
        ['abigail', 'idle', { show: 1, x: -0.95, z: 0.42, look: 0.7 }], ['ahinoam', 'idle', { show: 1, x: -1.2, z: 0.3, look: 0.7 }],
        ['m1', 'idle', { show: 1, x: -1.35, z: -0.05, look: 0.6 }], ['m2', 'idle', { show: 1, x: -1.5, z: 0.5, look: 0.6 }]],
      'p0.6': [['david', 'idle', { look: -1 }], ['m1', 'idle', { look: -0.3 }]],
      // 유다 사람들이 와서 기름을 붓는다 — 유다 집의 왕
      'p1.0': [['david', 'idle', { look: 1 }], ['elder', 'idle', { show: 1, x: 0.2, z: 0.12, look: -1, item: 'oilhorn' }], ['elder2', 'idle', { show: 1, x: 0.55, z: 0.38, look: -1 }], ['elder3', 'idle', { show: 1, x: 0.55, z: -0.12, look: -1 }],
        ['david', 'kneel', { delay: 3200 }], ['elder', 'anoint', { delay: 3800 }]],
      'p1.1': [['david', 'kneel', { show: 0 }], ['king', 'idle', { show: 1, x: -0.1, z: 0.15, look: 1 }], ['elder', 'bow', { item: null }], ['elder2', 'bow'], ['elder3', 'bow'],
        ['abigail', 'bow'], ['ahinoam', 'bow'], ['m1', 'raise'], ['m2', 'raise']],
      // 사울을 장사한 야베스 사람들의 소식
      'p1.2': [['elder', 'idle'], ['elder2', 'idle'], ['elder3', 'idle'], ['abigail', 'idle'], ['ahinoam', 'idle'], ['m1', 'idle'], ['m2', 'idle'],
        ['envoy', 'idle', { show: 1, x: 0.35, z: 0.55, look: -1 }]],
      'p1.3': [['envoy', 'speak', { to: 'king' }], ['king', 'listen', { look: 1 }]],
      // 요단 건너로 사자를 보낸다
      'p1.4': [['envoy', 'listen'], ['king', 'speak', { to: 'envoy' }]],
      'p1.6': [['king', 'bless', { to: 'envoy' }], ['envoy', 'bow', { delay: 1500 }], ['envoy', 'idle', { x: 2.1, z: 0.55, delay: 2600 }], ['envoy', 'idle', { show: 0, delay: 5000 }]],
      // 세월이 흘러 — 온 지파가 헤브론으로
      'p2.0': [['envoy', 'idle', { show: 0 }], ['king', 'idle', { look: 1 }], ['@env', 'dusk'], ['@env', 'day', { delay: 2200 }],
        ['folk', null, { show: 1, x: 1.1 }], ['elder', 'idle', { x: 0.3, z: 0.12, look: -1 }], ['elder3', 'idle', { x: 0.5, z: -0.15 }], ['elder2', 'idle', { x: 0.6, z: 0.4 }]],
      'p2.1': [['elder', 'speak', { to: 'king' }]],
      'p2.2': [['elder', 'speak', { to: 'king' }]],
      // 주 앞에서 언약을 맺고 온 이스라엘의 왕으로 — 다시 기름을 붓는다
      'p2.3': [['beam', null, { show: 1, x: -0.1, z: 0.15 }], ['king', 'kneel', { look: 1 }], ['elder', 'anoint', { item: 'oilhorn', x: 0.2, z: 0.12, delay: 900 }], ['elder2', 'bow'], ['elder3', 'bow']],
      'p2.4': [['beam', null, { show: 0 }], ['elder', 'idle', { item: null, x: 0.35, z: 0.1 }], ['king', 'idle', { look: 0.5, delay: 800 }], ['elder2', 'idle'], ['elder3', 'idle'], ['m1', 'raise'], ['m2', 'raise']],
      w0: [['beam', null, { show: 1, x: -0.1, z: 0.15 }], ['king', 'listen', { show: 1 }]],
      w1: [['beam', null, { show: 0 }], ['king', 'speak', { show: 1, to: 'elder' }]],
      w2: [['elder', 'speak', { show: 1, to: 'king' }], ['king', 'listen']],
      end: [['beam', null, { show: 0 }], ['king', 'idle', { show: 1, look: 0.4 }]],
    },
  },

  /* d22. 시온 산성 — 깊은 골짜기 위 여부스의 성벽. 성벽 위의 여부스 사람들이 비웃고, 다윗의 군사들이 성벽 앞에 선다.
     요압과 군사가 동쪽 기혼 샘의 물길로 사라지고, 성벽 위의 사람들이 스러진다(치는 모습 없음). 다윗이 성문으로 들어간다.
     두로의 사절이 백향목과 목수를 데려오고, 다윗성의 왕궁이 아래에서부터 쌓여 오른다 */
  d22: {
    wide: 1.45,
    props: {
      sand: ['sand', 0, 0.15, { r: 1.9, color: '#b9a57e', stones: 18 }],
      wall: ['citywall', -0.1, -0.5, { w: 2.5, h: 0.62, rahab: false }],
      spring: ['rockspring', 1.75, -0.22, { color: '#8a7a62' }],
      zion: ['zion', 0.45, -1.15, { w: 2.4, d: 0.6, palace: false }],
      palace: ['palacebuild', -0.65, -0.55],
      logs: ['cedarlogs', 0.75, 0.35],
      logs2: ['cedarlogs', 1.2, 0.2, { n: 5, rot: 0.3 }],
    },
    cast: {
      david: ['davidK', -0.45, 0.42, 0.3],
      joab: ['joab', 0.05, 0.45, -0.3],
      s1: ['israelite', -0.95, 0.5, -0.3, { gaze: false }],
      s2: ['israelite2', 0.45, 0.6, -0.3, { gaze: false }],
      s3: ['israelite', 0.8, 0.38, -0.3, { gaze: false }],
      j1: ['jebusite', -0.85, -0.7, 0.1, { gaze: false }],
      j2: ['jebusite2', -0.1, -0.72, 0, { gaze: false }],
      j3: ['jebusite', 0.65, -0.7, -0.1, { gaze: false }],
      envoy: ['tyrian', 2.1, 0.35, -1, { speed: 0.7 }],
      w1: ['hebrew', 1.0, 0.55, -1, { gaze: false }],
      w2: ['servant', 2.1, 0.15, -1, { gaze: false }],
    },
    beats: {
      enter: [['@env', 'dusk'], ['wall', null, { show: 0 }], ['spring', null, { show: 0 }], ['j1', 'idle', { show: 0 }], ['j2', 'idle', { show: 0 }], ['j3', 'idle', { show: 0 }],
        ['s1', 'idle', { show: 0 }], ['s2', 'idle', { show: 0 }], ['s3', 'idle', { show: 0 }], ['joab', 'idle', { show: 0 }], ['palace', 'built'],
        ['david', 'look-up', { x: 0.05, z: 0.3, look: -0.6 }], ['envoy', 'bow', { x: 0.55, z: 0.25, look: -1 }], ['w1', 'kneel', { x: 0.95, z: 0.45, look: -0.6 }], ['w2', 'idle', { x: 1.45, z: 0.1, look: -1 }]],
      intro: [['@env', 'day'], ['zion', null, { show: 0 }], ['palace', 'site', { show: 0 }], ['logs', null, { show: 0 }], ['logs2', null, { show: 0 }], ['spring', 'dry'],
        ['envoy', 'idle', { show: 0 }], ['w1', 'idle', { show: 0 }], ['w2', 'idle', { show: 0 }]],
      // 깊은 골짜기 위 좁은 등성이의 산성
      'p0.1': [['david', 'idle', { look: -0.2 }], ['joab', 'idle', { look: -0.1 }]],
      // 성벽 위에서 비웃음이 내려온다
      'p0.2': [['j1', 'point', { look: 0.2 }], ['j3', 'point', { look: -0.3 }]],
      'p0.3': [['j2', 'rebuke', { look: 0 }]],
      'p0.4': [['j2', 'point'], ['j1', 'rebuke']],
      'p0.5': [['j1', 'idle'], ['j3', 'idle'], ['s1', 'afraid', { look: -0.3 }], ['s3', 'afraid']],
      // 물길을 타고 올라가라
      'p1.0': [['s1', 'idle'], ['s3', 'idle'], ['j2', 'idle'], ['david', 'idle', { look: 1 }]],
      'p1.1': [['david', 'speak', { to: 'joab' }], ['joab', 'listen', { look: -1 }], ['spring', 'flow', { delay: 1200 }],
        ['joab', 'idle', { x: 1.45, z: 0.15, delay: 3200 }], ['s3', 'idle', { x: 1.65, z: 0.3, delay: 3400 }],
        ['joab', 'idle', { x: 1.75, z: -0.05, delay: 6000 }], ['s3', 'idle', { x: 1.8, z: 0.08, delay: 6000 }], ['joab', 'idle', { show: 0, delay: 7200 }], ['s3', 'idle', { show: 0, delay: 7400 }]],
      // 성은 무너졌다 — 성벽 위의 사람들이 스러진다
      'p1.2': [['joab', 'idle', { show: 0 }], ['s3', 'idle', { show: 0 }], ['j1', 'afraid'], ['j2', 'afraid'], ['j3', 'afraid'],
        ['j1', 'afraid', { show: 0, delay: 1600 }], ['j2', 'afraid', { show: 0, delay: 1900 }], ['j3', 'afraid', { show: 0, delay: 2200 }],
        ['joab', 'raise', { show: 1, x: -0.1, z: -0.72, look: 0, delay: 2800 }]],
      // 다윗이 산성에 들어가 산다 — 다윗 성
      'p1.3': [['joab', 'idle', { x: -0.1, z: -0.72 }], ['david', 'idle', { x: -0.1, z: -0.3, look: 0 }], ['s1', 'idle', { x: -0.55, z: 0.0, look: 0.3 }], ['s2', 'idle', { x: 0.3, z: 0.05, look: -0.3 }]],
      'p1.4': [['s1', 'raise'], ['s2', 'raise'], ['joab', 'raise']],
      // 밀로에서부터 성을 둘러 쌓는다 — 그리고 날로 강해진다
      'p1.5': [['s1', 'idle'], ['s2', 'idle'], ['joab', 'idle', { show: 0 }], ['wall', null, { show: 0 }], ['spring', 'dry', { show: 0 }], ['zion', null, { show: 1 }],
        ['david', 'idle', { x: 0.05, z: 0.3, look: -0.6 }], ['s1', 'idle', { x: -1.55, z: 0.35, look: 0.6 }], ['s2', 'idle', { x: -1.25, z: 0.5, look: 0.6 }]],
      'p1.6': [['david', 'look-up', { look: -0.3 }]],
      // 두로 왕 히람의 사절 — 백향목과 목수와 석수
      'p2.0': [['david', 'idle', { look: 1 }], ['envoy', 'idle', { show: 1, x: 0.55, z: 0.25, look: -1 }]],
      'p2.1': [['envoy', 'bow'], ['logs', null, { show: 1 }], ['logs2', null, { show: 1 }], ['w1', 'idle', { show: 1, x: 0.95, z: 0.45, look: -1 }], ['w2', 'idle', { show: 1, x: 1.45, z: 0.1, look: -1 }]],
      // 왕궁이 아래에서부터 쌓여 오른다
      'p2.2': [['envoy', 'idle'], ['palace', 'site', { show: 1 }], ['w1', 'kneel', { x: 0.95, z: 0.45, look: -0.6 }], ['w2', 'idle', { x: 0.05, z: -0.1, look: -1 }], ['w2', 'bow', { delay: 2500 }]],
      // 망치 소리가 산성에 울릴 때 — 다윗은 알았다
      'p2.3': [['david', 'idle', { look: -0.6 }], ['w2', 'kneel']],
      'p2.4': [['palace', 'built'], ['w2', 'idle', { x: 1.45, z: 0.1, look: -1 }], ['david', 'look-up', { look: -0.6 }]],
      'p2.5': [['david', 'pray', { look: 0 }], ['envoy', 'bow']],
      w0: [['david', 'speak', { show: 1 }]],
      w1: [['j2', 'speak', { show: 1 }], ['wall', null, { show: 1 }]],
      end: [['@env', 'dusk'], ['palace', 'built'], ['david', 'idle', { look: -0.6 }]],
    },
  },

  /* d23. 웃사와 멈춘 법궤 — 기럇여아림의 길. 새 수레에 실린 궤를 두 소가 끌고, 웃사와 아효가 몰며, 수금 타는 왕과 소고 든 여인들이 뒤따른다.
     나곤의 타작마당에서 소들이 뛰어 수레가 기우뚱하고, 손을 뻗은 웃사 위에 빛이 내려 그는 그 빛 속에 스러진다(쓰러진 몸은 그리지 않는다).
     음악이 끊기고 모두 엎드린다. 레위 사람들이 궤를 메어 오벧에돔의 집으로 옮기고, 석 달의 낮과 밤이 지나며 그 집에 빛이 머문다 */
  d23: {
    wide: 1.45,
    props: {
      grass: ['grass', 0, 0.05, { r: 1.9 }],
      home: ['house', -1.75, -0.6, { scale: 0.75 }], // 아비나답의 집
      obed: ['house', 1.6, -0.78, { scale: 0.7, door: true }], // 오벧에돔의 집
      floor: ['threshing', 0.75, 0.15, { r: 0.5 }],
      cart: ['arkcart', -1.1, 0.12, { speed: 0.32 }],
      cartE: ['emptycart', 0.0, 0.12],
      ark: ['arkc', 0.0, 0.5, { lift: 0.33, on: ['lev1', 'lev2'] }],
      beam: ['beam', 0.0, 0.4, { r: 0.28, h: 2.2 }],
      bless: ['beam', 1.6, -0.2, { r: 0.6, h: 2.3, peak: 0.3 }],
      folk: ['crowd', -1.15, -0.4, { spots: flock(6, 0.45, 0.1, 3), face: Math.PI / 2, speed: 0.32 }],
    },
    cast: {
      uzzah: ['uzzah', -1.5, 0.38, 1, { speed: 0.32 }],
      ahio: ['ahio', 0.25, 0.28, 1, { speed: 0.32 }],
      david: ['davidK', -2.0, 0.45, 1, { speed: 0.32 }],
      lev: ['levite', -2.05, 0.2, 1, { gaze: false, speed: 0.32 }],
      w1: ['woman', -2.05, 0.62, 1, { gaze: false, speed: 0.32 }],
      w2: ['miriam', -1.6, 0.72, 1, { gaze: false, speed: 0.32 }],
      lev1: ['levite', -0.42, 0.5, -1.57, { speed: 0.3, pose: 'carry-pole' }],
      lev2: ['levite', 0.42, 0.5, -1.57, { speed: 0.3, pose: 'carry-pole' }],
      obedEdom: ['hebrew2', 1.95, -0.3, -1],
      wife: ['woman2', 2.0, -0.05, -1],
      kid: ['child', 2.1, 0.15, -1],
    },
    beats: {
      enter: [['cart', 'go', { x: 0.0 }], ['cartE', null, { show: 0 }], ['ark', null, { show: 0 }], ['lev1', 'carry-pole', { show: 0 }], ['lev2', 'carry-pole', { show: 0 }], ['beam', null, { show: 0 }], ['bless', null, { show: 0 }],
        ['obedEdom', 'idle', { show: 0 }], ['wife', 'idle', { show: 0 }], ['kid', 'idle', { show: 0 }], ['folk', null, { x: -0.85 }],
        ['uzzah', 'idle', { x: -0.4, z: 0.38 }], ['ahio', 'idle', { x: 1.3, z: 0.32, look: -1 }], ['david', 'play', { x: -0.90, z: 0.45, item: 'lyre' }],
        ['lev', 'play', { x: -1.20, z: 0.2, item: 'lyre' }], ['w1', 'dance', { x: -1.20, z: 0.62, item: 'timbrel' }], ['w2', 'dance', { x: -0.75, z: 0.72, item: 'timbrel' }]],
      intro: [['@env', 'day'], ['cart', 'go'], ['cartE', null, { show: 0 }], ['ark', null, { show: 0 }], ['lev1', 'carry-pole', { show: 0 }], ['lev2', 'carry-pole', { show: 0 }], ['beam', null, { show: 0 }], ['bless', null, { show: 0 }],
        ['obedEdom', 'idle', { show: 0 }], ['wife', 'idle', { show: 0 }], ['kid', 'idle', { show: 0 }],
        ['david', 'play', { item: 'lyre' }], ['lev', 'play', { item: 'lyre' }], ['w1', 'dance', { item: 'timbrel' }], ['w2', 'dance', { item: 'timbrel' }]],
      // 뽑은 군사 삼만 — 아비나답의 집에 머물던 궤를 새 수레에
      'p0.1': [['folk', null, { x: -1.0 }]],
      'p0.3': [['uzzah', 'idle', { look: 0.4 }], ['ahio', 'idle', { look: 1 }]],
      'p0.4': [['ahio', 'idle', { x: 0.65, z: 0.3, look: 1 }], ['cart', 'go', { x: -0.6 }], ['uzzah', 'idle', { x: -1.0, z: 0.38 }], ['david', 'play', { x: -1.50, z: 0.45 }],
        ['lev', 'play', { x: -1.80, z: 0.2 }], ['w1', 'dance', { x: -1.80, z: 0.62 }], ['w2', 'dance', { x: -1.35, z: 0.72 }]],
      // 나곤의 타작마당에 이르러
      'p1.0': [['cart', 'go', { x: 0.0 }], ['uzzah', 'idle', { x: -0.4, z: 0.38 }], ['ahio', 'idle', { x: 1.3, z: 0.32 }], ['david', 'play', { x: -0.90, z: 0.45 }],
        ['lev', 'play', { x: -1.20, z: 0.2 }], ['w1', 'dance', { x: -1.20, z: 0.62 }], ['w2', 'dance', { x: -0.75, z: 0.72 }], ['folk', null, { x: -0.85 }]],
      // 소들이 비틀거리고, 웃사가 손을 뻗어 궤를 붙든다
      'p1.1': [['cart', 'stumble', { x: 0.0 }], ['uzzah', 'afraid', { x: -0.3, z: 0.36, look: 2.6 }], ['ahio', 'afraid', { look: -1 }]],
      'p1.2': [['uzzah', 'point', { x: -0.15, z: 0.3, look: 2.5 }]],
      // 주의 진노 — 빛이 내리고, 웃사는 그 빛 속에 스러진다
      'p1.3': [['cart', 'go'], ['beam', null, { show: 1, x: -0.15, z: 0.3 }], ['@env', 'overcast'], ['david', 'idle', { item: null }], ['lev', 'idle', { item: null }], ['w1', 'idle', { item: null }], ['w2', 'idle', { item: null }]],
      'p1.4': [['uzzah', 'idle', { show: 0 }], ['beam', null, { show: 0, delay: 2600 }], ['ahio', 'mourn', { delay: 800 }], ['lev', 'kneel', { delay: 1200 }], ['w1', 'mourn', { delay: 1400 }], ['w2', 'kneel', { delay: 1600 }]],
      // 음악이 끊겼다
      'p1.5': [['uzzah', 'idle', { show: 0 }], ['beam', null, { show: 0 }], ['david', 'idle', { look: 0.3 }]],
      'p1.6': [['david', 'idle', { look: -0.6 }], ['david', 'shrug', { delay: 1500 }]],
      // 그날 다윗은 주를 두려워했다
      'p2.0': [['david', 'afraid', { look: 1 }]],
      'p2.1': [['david', 'kneel', { look: 1 }]],
      // 궤를 메어 오벧에돔의 집으로
      'p2.2': [['cart', 'go', { show: 0 }], ['cartE', null, { show: 1 }], ['ark', null, { show: 1 }], ['lev1', 'carry-pole', { show: 1 }], ['lev2', 'carry-pole', { show: 1 }],
        ['ahio', 'idle', { x: 1.0, z: 0.6, look: -1 }],
        ['lev1', 'carry-pole', { x: 0.88, z: -0.2, delay: 1500 }], ['lev2', 'carry-pole', { x: 1.72, z: -0.2, delay: 1500 }],
        ['obedEdom', 'idle', { show: 1, x: 1.95, z: -0.3, look: -1, delay: 2500 }]],
      // 석 달 — 낮과 밤이 지나며 그 집에 복이
      'p2.3': [['@env', 'dusk'], ['@env', 'night', { delay: 1800 }], ['@env', 'dawn', { delay: 3600 }], ['@env', 'day', { delay: 5400 }],
        ['lev', 'idle'], ['w1', 'idle'], ['w2', 'idle'], ['david', 'idle', { look: 1 }]],
      'p2.4': [['bless', null, { show: 1 }], ['obedEdom', 'raise', { x: 1.95, z: -0.3, look: -1 }], ['wife', 'idle', { show: 1, x: 2.0, z: -0.05, look: -1 }], ['kid', 'idle', { show: 1, x: 2.1, z: 0.15, look: -1 }]],
      w0: [['david', 'speak', { show: 1 }]],
      w1: [['beam', null, { show: 1 }]],
      w2: [['bless', null, { show: 1 }], ['obedEdom', 'raise', { show: 1 }]],
      end: [['@env', 'day'], ['bless', null, { show: 1 }]],
    },
  },

  /* d24. 춤추며 올라온 법궤 — 다윗성 골목. 레위 사람 둘이 궤를 메고 오고, 여섯 걸음에 제단의 불, 세마포 에봇의 왕이 온 힘을 다해 춤춘다.
     왼쪽 왕궁 지붕에서 미갈이 내려다보다 돌아선다. 궤는 오른쪽 흰 장막에 놓이고, 왕은 백성을 축복하고 떡을 나눈다.
     집에 돌아온 왕을 미갈이 맞고, 둘이 마주 서서 말한다. 미갈 홀로 남는다 */
  d24: {
    wide: 1.45,
    props: {
      sand: ['sand', 0, 0.1, { r: 1.9, color: '#c4b08a', stones: 10 }],
      zion: ['zion', 0.1, -1.2, { w: 2.6, d: 0.55 }],
      roof: ['roof', -1.35, -0.42, { w: 0.85, d: 0.55, h: 0.48 }],
      tent: ['tent', 1.35, -0.48, { color: '#f2ede0', w: 0.75 }],
      arkT: ['arkc', 1.35, -0.42],
      altar: ['altar', 0.15, -0.45, { state: 'idle' }],
      ark: ['arkc', -1.2, 0.0, { lift: 0.33, on: ['lev1', 'lev2'] }],
      folk: ['crowd', -0.85, 0.62, { spots: flock(8, 0.38, 0.12, 5), face: 1.0, speed: 0.4 }],
    },
    cast: {
      david: ['davidE', -0.65, 0.25, 1, { speed: 0.6 }],
      lev1: ['levite', -1.62, 0.0, 1.57, { speed: 0.3, pose: 'carry-pole' }],
      lev2: ['levite', -0.78, 0.0, 1.57, { speed: 0.3, pose: 'carry-pole' }],
      horn: ['hebrew', -1.75, 0.45, 1, { gaze: false, speed: 0.35 }],
      w1: ['woman', 0.45, 0.6, -0.5, { gaze: false }],
      michal: ['michal', -1.35, -0.45, 1],
    },
    beats: {
      enter: [['arkT', null, { show: 0 }], ['altar', 'fire'], ['michal', 'idle', { look: 1.2 }], ['folk', null, { x: -0.85 }],
        ['lev1', 'carry-pole', { x: -0.22 }], ['lev2', 'carry-pole', { x: 0.62 }], ['david', 'dance', { x: 0.95, z: 0.35 }], ['horn', 'raise', { x: -0.25, z: 0.45, item: 'horn' }]],
      intro: [['@env', 'day'], ['altar', 'idle'], ['arkT', null, { show: 0 }], ['michal', 'idle', { show: 0 }], ['w1', 'idle', { show: 0 }], ['folk', null, { show: 0 }], ['david', 'idle', { look: 1 }]],
      // 오벧에돔의 집에 복을 주셨다는 소식 — 기쁨으로 다시 길을 나선다
      'p0.1': [['david', 'raise', { look: 1 }]],
      // 이번에는 사람들이 궤를 메었다 — 여섯 걸음에 제물을 드린다
      'p0.2': [['david', 'idle', { x: -0.15, z: 0.28, look: -1 }], ['lev1', 'carry-pole', { x: -1.22 }], ['lev2', 'carry-pole', { x: -0.38 }]],
      'p0.3': [['altar', 'fire'], ['david', 'kneel', { x: 0.1, z: -0.12, look: 0 }]],
      // 세마포 에봇을 입고 온 힘을 다해 춤춘다
      'p0.4': [['david', 'dance', { x: 0.95, z: 0.35 }], ['lev1', 'carry-pole', { x: -0.22, delay: 600 }], ['lev2', 'carry-pole', { x: 0.62, delay: 600 }]],
      // 함성과 나팔 소리
      'p0.5': [['horn', 'raise', { x: -0.25, z: 0.45, item: 'horn' }], ['folk', null, { show: 1, x: -0.85 }], ['w1', 'raise', { show: 1 }]],
      // 사울의 딸 미갈이 창문으로 내다본다
      'p1.0': [['michal', 'idle', { show: 1, look: 1.2 }], ['horn', 'idle'], ['w1', 'idle']],
      'p1.1': [['david', 'dance']],
      'p1.2': [['michal', 'idle', { look: -2.6 }]],
      // 궤는 장막 안 제자리에
      'p1.3': [['michal', 'idle', { show: 0 }], ['david', 'idle', { x: 0.6, z: 0.15, look: 1 }], ['lev1', 'carry-pole', { x: 0.93, z: -0.3 }], ['lev2', 'carry-pole', { x: 1.77, z: -0.3 }],
        ['ark', null, { show: 0, delay: 5200 }], ['arkT', null, { show: 1, delay: 5000 }], ['lev1', 'idle', { x: 0.85, z: -0.25, delay: 5600 }], ['lev2', 'idle', { x: 1.85, z: -0.2, delay: 5600 }]],
      // 번제와 화목제 — 만군의 여호와의 이름으로 축복
      'p1.4': [['ark', null, { show: 0 }], ['arkT', null, { show: 1 }], ['lev1', 'bow', { look: 1 }], ['lev2', 'bow', { look: -1 }], ['david', 'bless', { x: 0.45, z: 0.15, look: 0.8 }]],
      // 떡 한 덩이, 고기 한 조각, 건포도 떡 하나씩
      'p1.5': [['lev1', 'idle'], ['lev2', 'idle'], ['david', 'idle', { item: 'bread', look: 0.6 }], ['w1', 'idle', { x: 0.3, z: 0.52, look: 0.3 }], ['w1', 'bow', { item: 'bread', delay: 2400 }],
        ['horn', 'idle', { item: null, x: -0.1, z: 0.45, look: 1 }]],
      // 집으로 돌아온 다윗을 미갈이 맞는다
      'p2.0': [['@env', 'dusk'], ['folk', null, { show: 0 }], ['w1', 'idle', { show: 0 }], ['horn', 'idle', { show: 0 }], ['lev1', 'idle', { show: 0 }], ['lev2', 'idle', { show: 0 }], ['altar', 'idle'],
        ['david', 'idle', { item: null, x: -0.35, z: 0.25, look: -1 }], ['michal', 'idle', { show: 1, x: -0.85, z: 0.12, look: 1 }]],
      'p2.1': [['michal', 'speak', { to: 'david' }], ['david', 'listen']],
      'p2.2': [['michal', 'rebuke', { to: 'david' }]],
      'p2.3': [['michal', 'idle'], ['david', 'idle']],
      'p2.4': [['david', 'speak', { to: 'michal' }], ['michal', 'listen']],
      'p2.5': [['david', 'speak', { to: 'michal' }]],
      'p2.6': [['david', 'bow', { look: -1 }]],
      // 미갈은 죽는 날까지 자식이 없었다 — 홀로 남는다
      'p2.7': [['david', 'idle', { x: 0.75, z: 0.2, look: 1 }], ['david', 'idle', { show: 0, delay: 3200 }], ['michal', 'idle', { look: -2.6, delay: 1200 }]],
      w0: [['david', 'speak', { show: 1, to: 'michal' }], ['michal', 'idle', { show: 1 }]],
      w1: [['david', 'speak', { show: 1, to: 'michal' }]],
      w2: [['michal', 'speak', { show: 1, to: 'david' }]],
      end: [['@env', 'dusk'], ['michal', 'idle', { show: 1 }]],
    },
  },

  /* d25. 영원한 집의 약속 — 저녁빛이 스미는 백향목 궁, 오른쪽 바깥에는 흰 휘장 아래의 법궤. 왕좌의 왕이 일어나 휘장을 가리키고 나단이 답한다.
     그 밤, 홀로 남은 나단 위에 빛이 내린다(여호와의 말씀). 아침에 나단이 말씀을 전하고, 왕은 궤 앞에 들어가 앉아 기도한다 */
  d25: {
    wide: 1.4,
    props: {
      hall: ['hall', -0.4, -0.05, { w: 1.9, tx: -0.2, lamp: -1.05 }],
      tent: ['tent', 1.4, -0.45, { color: '#f2ede0', w: 0.7 }],
      ark: ['arkc', 1.4, -0.32],
      beam: ['beam', 0.95, 0.25, { r: 0.4, h: 2.3 }],
      glory: ['beam', 1.4, -0.2, { r: 0.55, h: 2.3, peak: 0.28 }],
    },
    cast: {
      king: ['davidK', -0.2, -0.42, 0, { y: 0.2, pose: 'sit' }],
      nathan: ['nathan', 0.4, 0.2, -1],
    },
    beats: {
      enter: [['@env', 'dusk'], ['beam', null, { show: 0 }], ['glory', null, { show: 1 }], ['nathan', 'idle', { show: 0 }], ['king', 'sit-ground', { y: 0, x: 1.4, z: 0.12, look: 2.8 }]],
      intro: [['@env', 'dusk'], ['beam', null, { show: 0 }], ['glory', null, { show: 0 }], ['nathan', 'idle', { look: -1 }]],
      // 사방의 원수를 물리쳐 주셔서 — 비로소 쉼
      'p0.1': [['king', 'sit', { look: 0.3 }]],
      'p0.2': [['king', 'sit-speak', { to: 'nathan' }]],
      // 나는 백향목 궁에 사는데 하나님의 궤는 휘장 아래
      'p0.3': [['king', 'idle', { y: 0, x: -0.3, z: -0.1, look: 1 }], ['king', 'point', { look: 1, delay: 1800 }]],
      'p0.4': [['king', 'idle', { look: 1 }]],
      'p0.5': [['nathan', 'speak', { to: 'king' }]],
      'p0.6': [['nathan', 'bless', { to: 'king' }]],
      // 그날 밤 — 홀로 선 나단 위에 빛
      'p0.7': [['@env', 'night'], ['king', 'idle', { x: -0.2, z: -0.3 }], ['king', 'idle', { show: 0, delay: 1500 }], ['nathan', 'idle', { x: 0.95, z: 0.25, look: -0.3 }], ['beam', null, { show: 1, delay: 2600 }], ['nathan', 'look-up', { delay: 3000 }]],
      'p1.0': [['king', 'idle', { show: 0 }], ['beam', null, { show: 1 }], ['nathan', 'listen']],
      'p1.2': [['nathan', 'look-up']],
      'p1.3': [['nathan', 'listen']],
      'p1.5': [['nathan', 'kneel']],
      // 나단이 돌아가 그대로 전한다
      'p2.0': [['@env', 'dawn'], ['beam', null, { show: 0 }], ['king', 'sit', { show: 1, y: 0.2, x: -0.2, z: -0.42, look: 0.4 }], ['nathan', 'idle', { x: 0.4, z: 0.2, look: -1 }], ['nathan', 'speak', { to: 'king', delay: 2600 }]],
      // 왕은 주 앞에 들어가 앉았다
      'p2.1': [['nathan', 'bow'], ['king', 'idle', { y: 0, x: 0.6, z: 0.2, look: 1 }], ['king', 'idle', { x: 1.4, z: 0.12, delay: 2400 }], ['king', 'sit-ground', { look: 2.8, delay: 5000 }],
        ['glory', null, { show: 1, delay: 4500 }], ['nathan', 'idle', { x: -0.5, z: 0.25, look: 1, delay: 1500 }]],
      'p2.2': [['king', 'sit-ground', { y: 0, x: 1.4, z: 0.12, look: 2.8 }], ['glory', null, { show: 1 }]],
      'p2.3': [['king', 'pray']],
      // 말을 잃었다
      'p2.4': [['king', 'sit-ground'], ['nathan', 'idle', { show: 0 }]],
      w0: [['beam', null, { show: 1 }], ['nathan', 'listen', { show: 1 }]],
      w1: [['nathan', 'look-up', { show: 1 }]],
      w2: [['king', 'speak', { show: 1 }]],
      w3: [['nathan', 'speak', { show: 1 }]],
      end: [['@env', 'dusk'], ['beam', null, { show: 0 }], ['glory', null, { show: 1 }], ['king', 'sit-ground', { show: 1 }]],
    },
  },

  /* d26. 므비보셋의 식탁 — 왕궁 안. 왕좌의 왕이 묻고, 사울 집의 종 시바가 불려 와 아뢴다. 지팡이에 기대어 절며 들어온 므비보셋이 엎드리고,
     왕이 일어나 그에게 다가가 말한다. 시바에게 땅을 맡기고, 상보를 드리운 왕의 식탁에 왕자들과 함께 앉은 므비보셋 — 발은 상 아래 가려진다 */
  d26: {
    wide: 1.3,
    props: {
      hall: ['hall', 0, -0.05, { tx: 0.62, lamp: -0.95 }],
      table: ['kingtable', -0.2, 0.3, { len: 1.15 }],
    },
    cast: {
      king: ['davidK', 0.62, -0.42, -0.4, { y: 0.2, pose: 'sit' }],
      official: ['official', 0.05, -0.15, 0.6],
      ziba: ['ziba', -1.9, 0.25, 1],
      walker: ['mephiS', -2.0, 0.2, 1, { speed: 0.35 }],
      meph: ['mephibosheth', -0.2, 0.08, 0, { pose: 'sit' }],
      prince: ['absalom', -0.62, 0.08, 0.3, { pose: 'sit' }],
      mica: ['child', 0.15, 0.1, -0.4],
    },
    beats: {
      enter: [['official', 'idle', { show: 0 }], ['ziba', 'idle', { show: 0 }], ['walker', 'idle', { show: 0 }], ['king', 'sit', { y: 0, x: 0.3, z: 0.1, look: -0.8 }], ['meph', 'sit', { look: 0.2 }], ['mica', 'idle', { x: 0.12, z: 0.12, look: -1 }]],
      intro: [['@env', 'day'], ['table', null, { show: 0 }], ['meph', 'sit', { show: 0 }], ['prince', 'sit', { show: 0 }], ['mica', 'idle', { show: 0 }], ['ziba', 'idle', { show: 0 }], ['walker', 'idle', { show: 0 }], ['king', 'sit', { look: -0.4 }]],
      // 사울의 집안에 아직 남은 사람이 있느냐
      'p0.1': [['king', 'sit-speak', { to: 'official' }], ['official', 'listen', { look: 0.6 }]],
      'p0.2': [['king', 'sit-speak', { to: 'official' }]],
      // 사울의 집 종 시바
      'p0.3': [['king', 'sit'], ['official', 'idle', { x: 1.0, z: -0.05, look: -1 }], ['ziba', 'idle', { show: 1, x: -0.1, z: 0.15, look: 1 }], ['ziba', 'bow', { delay: 3000 }]],
      'p0.4': [['ziba', 'speak', { to: 'king' }]],
      'p0.5': [['ziba', 'speak', { to: 'king' }]],
      'p0.7': [['ziba', 'idle'], ['king', 'sit-speak', { to: 'official' }], ['official', 'bow', { delay: 1200 }]],
      // 절룩이며 들어와 얼굴을 대고 엎드린다
      'p1.0': [['king', 'sit', { look: -0.6 }], ['official', 'idle'], ['ziba', 'idle', { x: -0.8, z: -0.05, look: 0.6 }], ['walker', 'idle', { show: 1, x: -0.25, z: 0.2, look: 1 }], ['walker', 'kneel', { delay: 5600 }]],
      'p1.1': [['walker', 'kneel', { x: -0.25, z: 0.2, look: 1 }], ['king', 'sit-speak', { to: 'walker' }]],
      'p1.3': [['king', 'sit'], ['walker', 'speak', { to: 'king' }]],
      // 두려워하지 마라 — 왕이 일어나 다가간다
      'p1.4': [['walker', 'kneel'], ['king', 'idle', { y: 0, x: 0.25, z: 0.1, look: -1 }], ['king', 'speak', { to: 'walker', delay: 2000 }]],
      'p1.5': [['king', 'speak', { y: 0, x: 0.25, z: 0.1, to: 'walker' }]],
      'p1.7': [['king', 'bless', { to: 'walker' }]],
      'p1.8': [['king', 'idle'], ['walker', 'kneel']],
      'p1.9': [['walker', 'kneel']],
      // 시바에게 땅을 맡긴다
      'p2.0': [['walker', 'idle'], ['king', 'speak', { to: 'ziba' }], ['ziba', 'idle', { x: -0.45, z: 0.2, look: 1 }], ['ziba', 'bow', { delay: 2600 }]],
      'p2.1': [['king', 'idle'], ['ziba', 'idle', { x: -1.9, z: 0.3, look: -1 }], ['ziba', 'idle', { show: 0, delay: 4200 }]],
      // 늘 왕의 식탁에서 — 왕자들과 함께
      'p2.2': [['ziba', 'idle', { show: 0 }], ['table', null, { show: 1 }], ['walker', 'idle', { show: 0, x: -0.2, z: 0.08 }], ['meph', 'sit', { show: 1, look: 0.2 }], ['prince', 'sit', { show: 1 }],
        ['king', 'idle', { x: 0.3, z: 0.1, look: -1 }], ['king', 'sit', { look: -0.8, delay: 1800 }], ['official', 'idle', { x: 0.75, z: -0.1, look: -0.6 }]],
      'p2.3': [['mica', 'idle', { show: 1, x: 0.12, z: 0.12, look: -1 }], ['meph', 'sit', { look: 0.6 }]],
      'p2.4': [['meph', 'sit', { look: 0.2 }]],
      w0: [['king', 'speak', { show: 1 }]],
      w1: [['king', 'speak', { show: 1 }]],
      w2: [['walker', 'speak', { show: 1, to: 'king' }], ['meph', 'sit', { show: 0 }]],
      end: [['table', null, { show: 1 }], ['meph', 'sit', { show: 1 }], ['walker', 'idle', { show: 0 }]],
    },
  },

  /* d27. 소금 골짜기 — 사해 남쪽의 흰 소금 땅에 친 진. 군사들이 사방으로 나갔다 돌아오고(싸우는 모습 없음), 금 방패와 놋이 쌓인다.
     하맛 왕의 아들 요람이 예물을 바치고, 왕은 그 모든 것을 빛 앞에 구별하여 드린다. 다시 소금 골짜기로 나간 군대가 돌아오면,
     왕은 공의로 다스리고 요압·사독·아히멜렉이 곁에 선다. 마지막에 수금 — 이 무렵의 노래 */
  d27: {
    wide: 1.4,
    props: {
      salt: ['sand', 0, 0.1, { r: 1.95, color: '#ddd6c4', stones: 12 }],
      camp: ['camp', -1.2, -0.62, { n: 5, span: 1.2, color: '#8a7a62', flag: '#3c5d96' }],
      rocks: ['rocks', 0, 0, { spots: [[1.55, -0.6, 0.16], [1.85, -0.35, 0.1], [-1.9, 0.35, 0.1]] }],
      treasure: ['treasure', 0.3, -0.38],
      beam: ['beam', 0.05, -0.25, { r: 0.55, h: 2.3, peak: 0.3 }],
    },
    cast: {
      king: ['davidK', -0.4, 0.0, 0.6],
      joab: ['joab', -0.05, 0.38, -0.6],
      s1: ['israelite', 0.85, 0.2, -0.6, { gaze: false, speed: 0.7 }],
      s2: ['israelite2', 1.15, -0.05, -0.6, { gaze: false, speed: 0.7 }],
      s3: ['israelite', 1.25, 0.4, -0.6, { gaze: false, speed: 0.7 }],
      joram: ['joram', 2.1, 0.3, -1],
      zadok: ['zadok', -1.15, -0.15, 0.6],
      priest2: ['abiathar', -1.35, 0.15, 0.6],
    },
    beats: {
      enter: [['beam', null, { show: 0 }], ['joram', 'idle', { show: 0 }], ['king', 'play', { item: 'lyre', look: 0.3 }], ['joab', 'idle', { x: 0.1, z: 0.4, look: -0.6 }], ['s1', 'idle', { x: 1.1, z: 0.25 }], ['s2', 'idle', { x: 1.4, z: 0.0 }], ['s3', 'idle', { x: 1.5, z: 0.45 }],
        ['zadok', 'idle', { x: -0.95, z: -0.2 }], ['priest2', 'idle', { x: -1.15, z: 0.15 }]],
      intro: [['@env', 'day'], ['beam', null, { show: 0 }], ['treasure', null, { show: 0 }], ['joram', 'idle', { show: 0 }], ['zadok', 'idle', { show: 0 }], ['priest2', 'idle', { show: 0 }]],
      // 사방으로 나아간다 — 블레셋, 모압, 소바, 아람
      'p0.0': [['king', 'point', { look: 1 }], ['joab', 'raise', { look: 1 }]],
      'p0.1': [['king', 'idle'], ['joab', 'idle', { x: 2.0, z: 0.1 }], ['s1', 'idle', { x: 2.1, z: 0.35 }], ['s2', 'idle', { x: 2.1, z: -0.1 }], ['s3', 'idle', { x: 2.2, z: 0.55 }],
        ['joab', 'idle', { show: 0, delay: 3400 }], ['s1', 'idle', { show: 0, delay: 3400 }], ['s2', 'idle', { show: 0, delay: 3200 }], ['s3', 'idle', { show: 0, delay: 3600 }]],
      'p0.2': [['joab', 'idle', { show: 0 }], ['s1', 'idle', { show: 0 }], ['s2', 'idle', { show: 0 }], ['s3', 'idle', { show: 0 }], ['@env', 'dusk'], ['king', 'pray', { look: 0.6 }]],
      'p0.3': [['@env', 'night'], ['king', 'pray']],
      // 주께서 어디로 가든지 이기게 하셨다 — 군사들이 돌아온다
      'p0.4': [['@env', 'day'], ['king', 'idle', { look: 1 }], ['joab', 'raise', { show: 1, x: -0.05, z: 0.38, look: -0.6 }], ['s1', 'raise', { show: 1, x: 0.85, z: 0.2 }], ['s2', 'raise', { show: 1, x: 1.15, z: -0.05 }], ['s3', 'raise', { show: 1, x: 1.25, z: 0.4 }]],
      // 금 방패와 놋이 예루살렘으로
      'p1.0': [['joab', 'idle'], ['s1', 'idle'], ['s2', 'bow', { look: -1 }], ['s3', 'idle'], ['treasure', null, { show: 1 }]],
      'p1.1': [['s2', 'idle'], ['king', 'idle', { look: 0.8 }]],
      // 하맛 왕 도이가 보낸 아들 요람
      'p1.2': [['joram', 'idle', { show: 1, x: 0.25, z: 0.05, look: -1, item: 'gift' }], ['joram', 'bow', { delay: 5200 }], ['joab', 'idle', { x: -0.9, z: 0.4 }]],
      // 모두 주께 구별하여 드린다
      'p1.3': [['joram', 'idle', { item: null, x: 0.7, z: 0.1, look: -1 }], ['beam', null, { show: 1 }], ['king', 'idle', { x: -0.3, z: 0.0, look: 0.6 }], ['king', 'kneel', { delay: 1800 }]],
      // 소금 골짜기의 에돔 — 다시 나갔다 돌아온다
      'p2.0': [['beam', null, { show: 0 }], ['joram', 'idle', { show: 0 }], ['king', 'idle', { look: 1 }], ['@env', 'overcast'],
        ['joab', 'idle', { x: 2.0, z: 0.4 }], ['s1', 'idle', { x: 2.1, z: 0.55 }], ['s2', 'idle', { x: 2.1, z: 0.2 }], ['s3', 'idle', { show: 0 }],
        ['joab', 'idle', { show: 0, delay: 3800 }], ['s1', 'idle', { show: 0, delay: 3800 }], ['s2', 'idle', { show: 0, delay: 3600 }]],
      'p2.1': [['@env', 'day'], ['joab', 'raise', { show: 1, x: 0.15, z: 0.38, look: -1 }], ['s1', 'raise', { show: 1, x: 0.85, z: 0.2 }], ['s2', 'raise', { show: 1, x: 1.15, z: -0.05 }]],
      // 공의와 정의로 다스린다
      'p2.2': [['joab', 'idle'], ['s1', 'idle'], ['s2', 'idle'], ['king', 'bless', { look: 0.8 }]],
      // 요압은 군대를, 사독과 아히멜렉은 제사를
      'p2.3': [['king', 'idle', { look: 0.6 }], ['joab', 'bow', { look: -1 }], ['zadok', 'idle', { show: 1, x: -0.95, z: -0.2, look: 0.6 }], ['priest2', 'idle', { show: 1, x: -1.15, z: 0.15, look: 0.6 }]],
      // 이 무렵의 싸움을 제목에 새긴 노래 한 편
      'p2.4': [['joab', 'idle'], ['king', 'play', { item: 'lyre', look: 0.3 }]],
      w0: [['king', 'idle', { show: 1 }]],
      w1: [['king', 'bless', { show: 1 }]],
      w2: [['beam', null, { show: 1 }], ['king', 'listen', { show: 1 }]],
      end: [['beam', null, { show: 0 }], ['king', 'play', { item: 'lyre' }]],
    },
  },

  /* d28. 지붕 위에서 — 봄, 요압과 군대는 랍바로 떠나고 왕은 홀로 남는다. 해 질 녘 왕궁 지붕 위를 거니는 왕, 멀리 불 켜진 집 한 채(목욕하는 사람은 그리지 않는다).
     종이 다녀오고 베일을 단정히 쓴 밧세바가 궁으로 들어간 뒤, 무대는 어두워진다. 불려 온 우리아는 왕궁 문간에서 종들과 함께 자고,
     아침에 왕의 편지를 들고 떠나 돌아오지 않는다(죽음은 그리지 않는다). 소식을 전하는 사람, 상복을 벗은 밧세바, 어둠 속의 왕 */
  d28: {
    wide: 1.45,
    props: {
      sand: ['sand', 0, 0.15, { r: 1.9, color: '#c4b08a', stones: 8 }],
      roof: ['roof', -0.55, -0.42, { w: 1.3, d: 0.75, h: 0.45 }],
      far: ['tallhouse', 1.6, -0.82, { scale: 0.55 }],
      h2: ['house', 1.05, -0.95, { scale: 0.45, stair: false }],
      h3: ['house', 2.05, -0.55, { scale: 0.4, stair: false }],
    },
    cast: {
      king: ['davidK', -0.75, -0.45, 0.3],
      joab: ['joab', -0.2, 0.42, -0.6],
      s1: ['israelite', 0.2, 0.5, -0.6, { gaze: false, speed: 0.8 }],
      s2: ['israelite2', 0.45, 0.35, -0.6, { gaze: false, speed: 0.8 }],
      page: ['servant', -0.05, 0.25, 1, { speed: 0.8 }],
      bathsheba: ['bathsheba', 1.55, -0.35, -1, { speed: 0.55 }],
      uriah: ['uriah', 2.05, 0.35, -1, { speed: 0.75 }],
      guard: ['servant', -0.95, 0.15, 0.4, { gaze: false }],
      runner: ['israelite', 2.05, 0.3, -1, { speed: 0.9 }],
    },
    beats: {
      enter: [['@env', 'dusk'], ['far', 'lit'], ['joab', 'idle', { show: 0 }], ['s1', 'idle', { show: 0 }], ['s2', 'idle', { show: 0 }], ['page', 'idle', { show: 0 }], ['bathsheba', 'idle', { show: 0 }], ['uriah', 'idle', { show: 0 }], ['guard', 'idle', { show: 0 }], ['runner', 'idle', { show: 0 }],
        ['king', 'idle', { x: -0.05, z: -0.38, look: 1 }]],
      intro: [['@env', 'day'], ['far', 'idle'], ['page', 'idle', { show: 0 }], ['bathsheba', 'idle', { show: 0 }], ['uriah', 'idle', { show: 0 }], ['guard', 'idle', { show: 0 }], ['runner', 'idle', { show: 0 }], ['king', 'idle', { look: 0.6 }]],
      // 왕들이 싸움터로 나가는 봄 — 요압과 군대를 랍바로
      'p0.1': [['joab', 'idle', { look: -0.8 }]],
      'p0.2': [['king', 'point', { look: 1 }], ['joab', 'bow', { look: -0.8, delay: 1200 }]],
      // 왕 자신은 예루살렘에 남았다
      'p0.3': [['king', 'idle', { look: 0.6 }], ['joab', 'idle', { x: 2.1, z: 0.3 }], ['s1', 'idle', { x: 2.15, z: 0.5 }], ['s2', 'idle', { x: 2.1, z: 0.12 }],
        ['joab', 'idle', { show: 0, delay: 3800 }], ['s1', 'idle', { show: 0, delay: 3600 }], ['s2', 'idle', { show: 0, delay: 3800 }]],
      // 해 질 녘, 지붕 위를 거니는 왕 — 멀리 불 켜진 집
      'p0.4': [['joab', 'idle', { show: 0 }], ['s1', 'idle', { show: 0 }], ['s2', 'idle', { show: 0 }], ['@env', 'dusk'], ['far', 'lit', { delay: 1500 }],
        ['king', 'idle', { x: -0.3, z: -0.5, look: 0.4 }], ['king', 'idle', { x: -0.05, z: -0.38, look: 1, delay: 3000 }]],
      // 사람을 보내 알아보니
      'p0.5': [['page', 'idle', { show: 1, x: 0.15, z: 0.2, look: 1 }], ['page', 'idle', { x: 1.25, z: -0.2, delay: 1600 }], ['page', 'idle', { x: 0.3, z: 0.15, look: -1, delay: 5200 }]],
      // 데려오게 했고 — 베일 쓴 여인이 궁으로 들어간 뒤, 어둠
      'p0.6': [['page', 'idle', { x: 1.25, z: -0.2 }], ['bathsheba', 'idle', { show: 1, x: 1.45, z: -0.32, look: -1, delay: 1800 }],
        ['page', 'idle', { x: -0.2, z: 0.1, delay: 2800 }], ['bathsheba', 'idle', { x: -0.05, z: 0.1, delay: 3300 }],
        ['page', 'idle', { show: 0, delay: 7000 }], ['bathsheba', 'idle', { show: 0, delay: 7200 }], ['@env', 'dark', { delay: 6500 }], ['king', 'idle', { show: 0, delay: 6000 }]],
      // 얼마 뒤 여인에게서 온 전갈
      'p1.0': [['@env', 'day'], ['page', 'idle', { show: 0 }], ['bathsheba', 'idle', { show: 0 }], ['king', 'idle', { show: 1, x: -0.45, z: 0.25, look: 1 }], ['page', 'idle', { show: 1, x: 0.15, z: 0.25, look: -1, delay: 600 }]],
      'p1.1': [['page', 'speak', { to: 'king' }], ['king', 'listen']],
      // 싸움터에서 우리아를 불러들인다
      'p1.2': [['page', 'idle', { x: -1.0, z: 0.4, look: 1 }], ['page', 'idle', { show: 0, delay: 2600 }], ['uriah', 'idle', { show: 1, x: 0.2, z: 0.25, look: -1 }], ['uriah', 'bow', { delay: 4500 }]],
      'p1.3': [['uriah', 'idle'], ['king', 'speak', { to: 'uriah' }]],
      // 우리아는 왕궁 문간에서 종들과 함께 잤다
      'p1.4': [['@env', 'night'], ['king', 'idle', { x: -1.1, z: -0.05 }], ['king', 'idle', { show: 0, delay: 2200 }], ['guard', 'sleep', { show: 1, x: -0.95, z: 0.15 }], ['uriah', 'idle', { x: -0.35, z: 0.2, look: 0 }], ['uriah', 'sit-ground', { delay: 2800 }]],
      // 어찌 저만 집에 가겠습니까
      'p1.5': [['@env', 'dawn'], ['king', 'idle', { show: 1, x: -0.6, z: 0.4, look: 1 }], ['uriah', 'speak', { x: -0.15, z: 0.25, to: 'king' }], ['guard', 'sleep']],
      // 왕이 그를 취하게 해도 — 끝내 집에 가지 않는다
      'p1.6': [['@env', 'night'], ['king', 'idle', { item: 'cup', look: 1 }], ['uriah', 'shrug', { delay: 1500 }]],
      // 아침에 요압에게 쓴 편지 — 우리아의 손에
      'p2.0': [['@env', 'day'], ['guard', 'idle', { show: 0 }], ['king', 'idle', { item: 'scroll', look: 1 }], ['king', 'idle', { item: null, delay: 2600 }], ['uriah', 'idle', { item: 'scroll', look: -1, delay: 2600 }]],
      'p2.1': [['uriah', 'bow'], ['uriah', 'idle', { x: 2.1, z: 0.35, delay: 1500 }], ['uriah', 'idle', { show: 0, delay: 5200 }], ['king', 'idle', { look: 1 }]],
      // 우리아는 죽었다 — 무대는 비고 어두워진다
      'p2.2': [['uriah', 'idle', { show: 0 }], ['@env', 'overcast'], ['king', 'idle', { look: 0 }]],
      'p2.3': [['runner', 'idle', { show: 1, x: 0.15, z: 0.35, look: -1 }], ['runner', 'bow', { delay: 4200 }]],
      'p2.4': [['runner', 'idle'], ['king', 'speak', { to: 'runner' }]],
      // 애도가 끝나자 아내로 맞는다
      'p2.5': [['runner', 'idle', { x: 2.1, z: 0.45 }], ['runner', 'idle', { show: 0, delay: 3000 }], ['king', 'idle'], ['@env', 'dusk'],
        ['bathsheba', 'mourn', { show: 1, x: 1.45, z: -0.32, look: -0.6 }], ['bathsheba', 'idle', { delay: 3200 }], ['bathsheba', 'idle', { x: 0.05, z: 0.3, look: -1, delay: 3800 }]],
      // 그러나 주의 눈에 악했다
      'p2.6': [['runner', 'idle', { show: 0 }], ['bathsheba', 'idle', { x: 0.05, z: 0.3, look: -0.3 }], ['@env', 'dark'], ['king', 'idle', { look: 0 }]],
      w0: [['king', 'speak', { show: 1 }]],
      w1: [['uriah', 'speak', { show: 1, to: 'king' }]],
      w2: [['king', 'speak', { show: 1 }]],
      w3: [['@env', 'dark']],
      end: [['@env', 'dark']],
    },
  },

  /* d29. 당신이 그 사람이라 — 왕궁 안. 나단이 왕 앞에 서서 이야기를 들려주고, 왕은 일어나 노한다. 나단이 그를 가리키고, 왕은 무릎을 꿇고 엎드린다.
     밤, 등잔 곁 땅바닥에 엎드린 왕과 그를 일으키려는 신하들, 베일 쓴 밧세바의 애도(아이의 죽음은 그리지 않는다). 아침에 왕은 일어나 장막 앞에서 경배하고,
     훗날 아기를 안은 밧세바와 축복하는 나단 */
  d29: {
    wide: 1.45,
    props: {
      hall: ['hall', -0.35, -0.05, { w: 2.1, tx: 0.2, lamp: -1.2 }],
      tent: ['tent', 1.5, -0.45, { color: '#f2ede0', w: 0.7 }],
      ark: ['arkc', 1.5, -0.32],
      glory: ['beam', 1.5, -0.15, { r: 0.55, h: 2.3, peak: 0.3 }],
    },
    cast: {
      king: ['davidK', 0.2, -0.42, -0.4, { y: 0.2, pose: 'sit' }],
      nathan: ['nathan', -1.9, 0.25, 1],
      elder: ['official', -0.9, -0.2, 0.6, { gaze: false }],
      bathsheba: ['bathsheba', -1.1, 0.35, 0.6],
      mother: ['bathsheba', -0.6, 0.25, 0.6],
    },
    beats: {
      enter: [['glory', null, { show: 0 }], ['bathsheba', 'idle', { show: 0 }], ['mother', 'idle', { show: 0 }], ['elder', 'idle', { show: 0 }],
        ['king', 'kneel', { y: 0, x: 0.35, z: 0.05, look: -1 }], ['nathan', 'point', { x: -0.4, z: 0.12, look: 1 }]],
      intro: [['@env', 'day'], ['glory', null, { show: 0 }], ['bathsheba', 'idle', { show: 0 }], ['mother', 'idle', { show: 0 }], ['elder', 'idle', { show: 0 }], ['king', 'sit', { look: -0.4 }]],
      // 예언자 나단이 왕 앞에 선다 — 한 성의 부자와 가난한 사람
      'p0.0': [['nathan', 'idle', { x: -0.4, z: 0.12, look: 1 }], ['nathan', 'bow', { delay: 4200 }]],
      'p0.1': [['nathan', 'speak', { to: 'king' }]],
      'p0.3': [['nathan', 'speak', { to: 'king' }], ['king', 'sit', { look: -0.6 }]],
      'p0.5': [['nathan', 'speak', { to: 'king' }]],
      // 왕의 얼굴이 붉어진다 — 일어나 노한다
      'p1.0': [['nathan', 'idle'], ['king', 'idle', { y: 0, x: 0.35, z: 0.05, look: -1 }]],
      'p1.1': [['king', 'rebuke', { to: 'nathan' }]],
      'p1.2': [['king', 'speak', { to: 'nathan' }]],
      // 당신이 바로 그 사람입니다
      'p1.3': [['king', 'idle'], ['nathan', 'idle', { look: 1 }]],
      'p1.4': [['nathan', 'point', { look: 1 }], ['king', 'afraid', { look: -1, delay: 1200 }]],
      'p1.5': [['king', 'idle'], ['nathan', 'speak', { to: 'king' }]],
      'p1.7': [['nathan', 'rebuke', { to: 'king' }]],
      // 무너지듯 — 내가 주께 죄를 지었습니다
      'p1.8': [['nathan', 'idle'], ['king', 'kneel', { look: -1 }]],
      'p1.9': [['king', 'mourn']],
      'p2.0': [['nathan', 'speak', { to: 'king' }]],
      'p2.1': [['nathan', 'idle', { look: 1 }]],
      // 아이가 앓자 왕은 밤새 땅에 엎드려 금식한다 — 이레째 (애도로만)
      'p2.2': [['@env', 'night'], ['nathan', 'idle', { x: -1.9, z: 0.25, look: -1 }], ['nathan', 'idle', { show: 0, delay: 3000 }], ['king', 'mourn', { x: 0.1, z: 0.15, look: 0 }],
        ['elder', 'idle', { show: 1, x: 0.55, z: 0.05, look: -1, delay: 1500 }], ['elder', 'bow', { delay: 4000 }], ['bathsheba', 'mourn', { show: 1, x: -1.0, z: 0.3, look: 0.6, delay: 2500 }]],
      // 일어나 씻고 주의 집에 들어가 경배한다
      'p2.3': [['@env', 'day'], ['nathan', 'idle', { show: 0 }], ['bathsheba', 'idle', { show: 0 }], ['elder', 'idle', { x: 0.2, z: -0.1, look: 1 }],
        ['king', 'idle', { x: 0.9, z: 0.25, look: 1 }], ['king', 'idle', { x: 1.5, z: 0.15, delay: 2400 }], ['king', 'kneel', { look: 2.8, delay: 4200 }], ['glory', null, { show: 1, delay: 3800 }]],
      // 솔로몬 — 여디디야
      'p2.4': [['king', 'idle', { x: 0.8, z: 0.15, look: -1 }], ['glory', null, { show: 0 }], ['mother', 'carry', { show: 1, x: 0.15, z: 0.3, look: 1, item: 'baby' }],
        ['nathan', 'idle', { show: 1, x: -0.55, z: 0.1, look: 1 }], ['nathan', 'bless', { to: 'mother', delay: 2500 }]],
      // 참회의 노래
      'p2.5': [['nathan', 'idle'], ['king', 'pray', { look: 0 }]],
      w0: [['nathan', 'speak', { show: 1, to: 'king' }]],
      w1: [['king', 'kneel', { show: 1 }]],
      w2: [['nathan', 'point', { show: 1 }]],
      w3: [['king', 'speak', { show: 1 }]],
      end: [['king', 'pray']],
    },
  },

  /* d30. 압살롬의 반역 — 이른 아침 예루살렘 성문 길가, 뒤에 병거와 앞서 달리는 사람들을 거느린 압살롬. 송사하러 오는 사람을 불러 세워 말하고,
     절하려는 사람을 붙들어 끌어안는다. 사 년 뒤 왕 앞에 나아가 헤브론에 가기를 청하고, 왕이 축복한다.
     무대는 헤브론으로 — 제단에 불, 몰래 보낸 사자들이 흩어지고, 초대받은 이백 명과 아히도벨이 모인다. 압살롬이 금관을 쓴다 */
  d30: {
    wide: 1.45,
    props: {
      sand: ['sand', 0, 0.12, { r: 1.9, color: '#c4b08a', stones: 12 }],
      gate: ['gate', -0.35, -0.62, { scale: 1.6 }],
      chariot: ['chariotI', -1.85, -0.25, { speed: 0.5 }],
      altar: ['altar', 1.2, -0.42, { state: 'idle' }],
      hebron: ['house', 1.75, -0.7, { scale: 0.7, stair: false }],
      folk: ['crowd', 0.15, 0.45, { spots: flock(11, 0.5, 0.15, 9), face: 2.3, speed: 0.4 }],
    },
    cast: {
      absalom: ['absalom', -0.55, 0.15, 1],
      absK: ['absalomK', 0.85, -0.15, 0.4],
      r1: ['runner', -1.1, 0.25, 1, { gaze: false, speed: 0.9 }],
      r2: ['runner', -1.4, 0.45, 1, { gaze: false, speed: 0.9 }],
      man1: ['man', 2.05, 0.3, -1, { speed: 0.6 }],
      man2: ['hebrew2', 2.1, 0.0, -1, { speed: 0.6 }],
      king: ['davidK', -0.35, -0.3, 0.6],
      ahith: ['ahithophel', 2.05, -0.1, -1, { speed: 0.6 }],
    },
    beats: {
      enter: [['gate', null, { show: 0 }], ['chariot', null, { x: -0.9, z: -0.35 }], ['altar', 'fire'], ['absalom', 'idle', { show: 0 }], ['king', 'idle', { show: 0 }], ['man1', 'idle', { show: 0 }], ['man2', 'idle', { show: 0 }],
        ['absK', 'raise', { look: 0.4 }], ['ahith', 'idle', { x: 1.35, z: 0.05, look: -1 }], ['r1', 'idle', { x: 0.35, z: 0.05, look: 1 }], ['r2', 'idle', { x: 1.45, z: 0.3, look: -1 }]],
      intro: [['@env', 'dawn'], ['altar', 'idle', { show: 0 }], ['hebron', null, { show: 0 }], ['folk', null, { show: 0 }], ['absK', 'idle', { show: 0 }], ['king', 'idle', { show: 0 }], ['ahith', 'idle', { show: 0 }],
        ['man1', 'idle', { show: 0 }], ['man2', 'idle', { show: 0 }], ['absalom', 'idle', { look: 1 }]],
      // 뒤에는 병거와 말, 앞서 달리는 사람 오십 명
      'p0.1': [['absalom', 'idle', { look: -0.6 }], ['r1', 'bow', { look: 1 }]],
      // 송사하러 오는 사람을 먼저 불러 세운다
      'p0.2': [['@env', 'day'], ['r1', 'idle'], ['absalom', 'idle', { look: 1 }], ['man1', 'idle', { show: 1, x: 0.05, z: 0.2, look: -1 }], ['absalom', 'point', { look: 1, delay: 2500 }]],
      'p0.3': [['absalom', 'speak', { to: 'man1' }]],
      'p0.4': [['man1', 'speak', { to: 'absalom' }], ['absalom', 'listen']],
      'p0.5': [['man1', 'idle'], ['absalom', 'speak', { to: 'man1' }]],
      'p0.6': [['absalom', 'shrug']],
      // 절하려 하면 붙들고 입을 맞춘다
      'p1.0': [['man1', 'bow'], ['absalom', 'idle', { x: -0.22, z: 0.18, look: 1 }], ['absalom', 'embrace', { delay: 1500 }], ['man1', 'embrace', { delay: 1500 }]],
      'p1.1': [['man1', 'idle', { x: -0.95, z: 0.5, look: 1 }], ['absalom', 'idle', { x: -0.55, z: 0.15, look: 1 }], ['man2', 'idle', { show: 1, x: 0.05, z: 0.15, look: -1 }],
        ['absalom', 'speak', { to: 'man2', delay: 3500 }]],
      // 이스라엘 사람들의 마음을 훔쳤다
      'p1.2': [['absalom', 'embrace', { x: -0.25, z: 0.15 }], ['man2', 'embrace', { delay: 400 }], ['man2', 'idle', { x: -0.7, z: 0.55, look: 1, delay: 3200 }], ['man1', 'raise', { delay: 3000 }]],
      // 사 년 뒤 — 왕에게
      'p1.3': [['@env', 'dusk'], ['@env', 'day', { delay: 1600 }], ['man1', 'idle', { show: 0 }], ['man2', 'idle', { show: 0 }], ['king', 'idle', { show: 1, x: -0.35, z: -0.3, look: 0.6 }],
        ['absalom', 'idle', { x: 0.1, z: -0.05, look: -1 }], ['absalom', 'bow', { delay: 2800 }]],
      'p1.4': [['absalom', 'speak', { to: 'king' }]],
      'p1.6': [['absalom', 'speak', { to: 'king' }]],
      // 평안히 가거라
      'p2.0': [['absalom', 'idle'], ['king', 'idle', { look: 0.6 }]],
      'p2.1': [['king', 'bless', { to: 'absalom' }], ['absalom', 'bow', { delay: 1500 }]],
      // 아버지가 처음 왕이 되었던 헤브론으로
      'p2.2': [['king', 'idle', { show: 0 }], ['gate', null, { show: 0 }], ['hebron', null, { show: 1 }], ['altar', 'idle', { show: 1 }],
        ['absalom', 'idle', { x: 0.75, z: -0.1, look: 0.4 }], ['chariot', null, { x: -0.9, z: -0.35 }], ['r1', 'idle', { x: 0.35, z: 0.05, look: 1 }], ['r2', 'idle', { x: 1.45, z: 0.3, look: -1 }]],
      // 모든 지파에 몰래 사람을 보낸다 — 나팔 소리가 들리면
      'p2.3': [['absalom', 'speak', { to: 'r1' }], ['r1', 'idle', { x: -2.1, z: 0.0, delay: 2200 }], ['r2', 'idle', { x: 2.15, z: 0.6, delay: 2600 }],
        ['r1', 'idle', { show: 0, delay: 5000 }], ['r2', 'idle', { show: 0, delay: 4800 }]],
      'p2.4': [['r1', 'idle', { show: 0 }], ['r2', 'idle', { show: 0 }], ['absalom', 'raise', { look: 0.2 }]],
      // 아무것도 모른 채 따라간 이백 명
      'p2.5': [['absalom', 'idle'], ['folk', null, { show: 1, x: 0.15 }]],
      // 제사를 드리며 아히도벨까지
      'p2.6': [['altar', 'fire'], ['absalom', 'idle', { x: 0.85, z: -0.15, look: 0.4 }], ['ahith', 'idle', { show: 1, x: 1.35, z: 0.05, look: -1 }], ['ahith', 'bow', { delay: 4000 }]],
      // 반역의 세력은 점점 커졌다 — 금관
      'p2.7': [['ahith', 'idle'], ['absalom', 'idle', { show: 0 }], ['absK', 'raise', { show: 1, x: 0.85, z: -0.15, look: 0.4 }], ['@env', 'dusk', { delay: 2000 }]],
      w0: [['king', 'speak', { show: 1, to: 'absalom' }], ['absalom', 'idle', { show: 1 }]],
      w1: [['absalom', 'speak', { show: 1 }], ['absK', 'idle', { show: 0 }]],
      w2: [['absalom', 'speak', { show: 1 }]],
      end: [['@env', 'dusk'], ['absalom', 'idle', { show: 0 }], ['absK', 'raise', { show: 1 }]],
    },
  },
};

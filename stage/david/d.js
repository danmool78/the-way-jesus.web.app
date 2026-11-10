/* 다윗 여정 대본 묶음 d: d31–d39 (stage/david.js가 합친다)
   압살롬을 피해 감람산을 넘는 왕에서 다윗의 마지막 말까지. 왕 다윗은 davidK, 머리를 가린 피난길의 왕은 davidH(금관 없이 머릿수건), 늙은 왕은 davidO.
   연출 원칙: 압살롬의 죽음은 그리지 않는다 — 노새가 빈 상수리나무 밑을 빠져나가고 빛만 남는다. 전염병은 어둠과 엎드림, 천사는 타작마당 위의 빛(beam)으로만.
   다윗의 죽음은 모세(느보산)처럼 빛 속으로 서서히 사라진다. 하나님은 모습 없이 빛으로만 */
import './props-d.js';

// 무리(crowd)의 자리: 가운데를 둘러 n명을 흩어 놓는다 (moses.js와 같다)
const flock = (n, rx, rz, seed = 1) => Array.from({ length: n }, (_, i) => {
  const a = i * 2.399 + seed, r = Math.sqrt((i + 0.5) / n);
  return [Math.cos(a) * r * rx, Math.sin(a) * r * rz];
});
const E = Math.PI / 2; // 무리(crowd)가 동쪽(오른쪽)을 보는 방향

export const D = {
  /* d31. 맨발로 오른 감람산 — 왼쪽 뒤에 다윗성, 그 앞을 흐르는 기드론 시내, 오른쪽에 올리브나무 선 감람산 비탈.
     전령이 뛰어들어 압살롬의 소식을 알리고, 왕과 온 집안이 성을 나선다. 잇대가 따르기를 청하고, 시내를 건넌 뒤 사독과 레위 사람들이 멘 궤를 성으로 돌려보낸다.
     머리를 가린 왕(davidH)이 울며 비탈을 오르고, 산마루에서 옷을 찢은 후새가 그를 맞는다 */
  d31: {
    env: 'day',
    wide: 1.4,
    props: {
      grass: ['grass', 0.3, 0.05, { r: 1.9 }],
      zion: ['zion', -1.35, -0.62, { w: 1.4, d: 0.7, tent: true }],
      kidron: ['brook', -0.48, 0.05, { len: 1.5, rot: Math.PI / 2 }],
      mount: ['hill', 1.15, -0.35, { w: 1.05, h: 0.36, d: 0.62, color: '#8f8462', soft: true }],
      ol1: ['olive', 0.85, -0.78],
      ol2: ['olive', 1.62, -0.6],
      ol3: ['olive', 1.75, 0.15, { scale: 0.85 }],
      folk: ['crowd', -1.6, 0.3, { spots: flock(6, 0.22, 0.1, 3), face: E }],
      ark: ['arkc', -0.58, -0.18, { lift: 0.33, on: ['l1', 'l2'] }],
    },
    cast: {
      david: ['davidK', -0.95, 0.12, 1],
      davidH: ['davidH', 0.2, 0.25, 1],
      official: ['official', -1.25, 0.22, 1],
      msg: ['ahimaaz', 1.95, 0.45, -1, { speed: 1.5 }],
      ittai: ['ittai', -1.55, 0.05, 1],
      zadok: ['zadok', -0.95, -0.15, 1],
      l1: ['levite', -1.0, -0.18, 1, { speed: 0.35, pose: 'carry-pole' }],
      l2: ['levite', -0.16, -0.18, 1, { speed: 0.35, pose: 'carry-pole' }],
      hushai: ['hushai', 1.4, -0.42, -1],
    },
    beats: {
      enter: [['@env', 'overcast'], ['david', 'idle', { show: 0 }], ['msg', 'idle', { show: 0 }], ['zadok', 'idle', { show: 0 }], ['l1', 'carry-pole', { show: 0 }], ['l2', 'carry-pole', { show: 0 }], ['ark', null, { show: 0 }],
        ['davidH', 'mourn', { x: 0.88, z: -0.18, look: 0.6 }], ['hushai', 'mourn', { x: 1.18, z: -0.3, look: -1 }], ['official', 'mourn', { x: 0.45, z: 0.15, look: 1 }],
        ['ittai', 'idle', { x: 0.1, z: 0.35, look: 1 }], ['folk', null, { x: -0.25, z: -0.3 }]],
      intro: [['@env', 'day'], ['davidH', 'idle', { show: 0 }], ['msg', 'idle', { show: 0 }], ['ittai', 'idle', { show: 0 }], ['zadok', 'idle', { show: 0 }], ['l1', 'carry-pole', { show: 0 }], ['l2', 'carry-pole', { show: 0 }],
        ['ark', null, { show: 0 }], ['hushai', 'idle', { show: 0 }], ['folk', null, { show: 0 }]],
      // 전령이 숨을 몰아쉬며 뛰어든다
      'p0.0': [['msg', 'idle', { show: 1, x: -0.62, z: 0.2, look: -1 }]],
      'p0.1': [['msg', 'speak', { to: 'david' }], ['david', 'listen', { look: 1 }]],
      // 일어나 피하자
      'p0.3': [['msg', 'idle'], ['david', 'idle', { look: -1 }]],
      'p0.4': [['david', 'speak', { to: 'official' }]],
      'p0.5': [['david', 'rebuke', { to: 'official' }], ['official', 'bow']],
      // 온 집안과 함께 성을 나선다
      'p0.6': [['david', 'idle', { x: -0.75, z: 0.22, look: 1 }], ['official', 'idle', { x: -1.0, z: 0.32, look: 1 }], ['msg', 'idle', { x: -0.55, z: 0.5, look: 1 }], ['msg', 'idle', { show: 0, delay: 2500 }],
        ['folk', null, { show: 1 }]],
      // 가드에서 온 잇대 — 돌아가라 해도
      'p0.7': [['ittai', 'idle', { show: 1, x: -1.1, z: 0.05, look: 1 }], ['david', 'idle', { look: -1, delay: 1200 }], ['david', 'speak', { to: 'ittai', delay: 2400 }]],
      'p0.8': [['david', 'idle'], ['ittai', 'speak', { to: 'david' }]],
      // 온 땅이 소리 내어 운다
      'p1.0': [['@env', 'overcast'], ['ittai', 'idle'], ['official', 'mourn'], ['david', 'idle', { look: 0 }]],
      // 기드론 시내를 건너 광야 쪽으로
      'p1.1': [['official', 'idle', { x: 0.0, z: 0.38, look: 1 }], ['david', 'idle', { x: 0.25, z: 0.22, look: 1 }], ['ittai', 'idle', { x: -0.3, z: 0.1, look: 1, delay: 600 }],
        ['folk', null, { x: -1.55, z: 0.45 }]],
      // 사독과 레위 사람들이 언약궤를 메고 따라온다 — 궤를 성으로 돌려보낸다
      'p1.2': [['zadok', 'idle', { show: 1, x: -0.12, z: 0.05, look: 1 }], ['l1', 'carry-pole', { show: 1, x: -0.98, z: -0.18 }], ['l2', 'carry-pole', { show: 1, x: -0.14, z: -0.18 }], ['ark', null, { show: 1 }],
        ['ittai', 'idle', { x: -0.25, z: 0.4, look: 1 }], ['david', 'idle', { look: -1, delay: 1500 }], ['david', 'speak', { to: 'zadok', delay: 3500 }]],
      // 궤를 성으로 도로 메고 가라
      'p1.4': [['david', 'point', { look: -1 }]],
      'p1.5': [['david', 'speak', { to: 'zadok' }], ['zadok', 'listen', { look: 1 }]],
      'p1.6': [['david', 'look-up', { look: -0.6 }], ['zadok', 'bow'],
        ['l2', 'carry-pole', { x: -1.15, z: -0.22, delay: 1500 }], ['l1', 'carry-pole', { x: -1.99, z: -0.22, delay: 1500 }], ['l1', 'carry-pole', { show: 0, delay: 4500 }], ['l2', 'carry-pole', { show: 0, delay: 4500 }], ['ark', null, { show: 0, delay: 4500 }],
        ['zadok', 'idle', { x: -0.9, z: 0.0, delay: 2500 }], ['zadok', 'idle', { show: 0, delay: 5500 }]],
      // 머리를 가리고 맨발로, 울면서 감람산을 오른다
      'p2.0': [['l1', 'carry-pole', { show: 0 }], ['l2', 'carry-pole', { show: 0 }], ['ark', null, { show: 0 }], ['zadok', 'idle', { show: 0 }],
        ['david', 'idle', { show: 0 }], ['davidH', 'idle', { show: 1, x: 0.25, z: 0.22, look: 1 }], ['davidH', 'idle', { x: 0.88, z: -0.18, look: 0.6, delay: 1200 }], ['davidH', 'mourn', { delay: 4800 }]],
      'p2.1': [['official', 'mourn', { x: 0.45, z: 0.15, look: 1 }], ['ittai', 'idle', { x: 0.1, z: 0.35, look: 1 }], ['folk', null, { x: -0.25, z: -0.3 }], ['davidH', 'mourn', { x: 0.88, z: -0.18 }]],
      // 아히도벨마저 — 왕이 기도한다
      'p2.2': [['official', 'speak', { to: 'davidH' }], ['davidH', 'idle', { look: -0.8 }]],
      'p2.4': [['official', 'idle', { look: 1 }], ['davidH', 'pray', { look: 0.3 }]],
      // 산마루에서 옷을 찢고 흙을 뒤집어쓴 후새가 맞는다
      'p2.6': [['davidH', 'idle', { look: 1 }], ['hushai', 'idle', { show: 1, x: 1.4, z: -0.42, look: -1 }], ['hushai', 'idle', { x: 1.18, z: -0.3, look: -1, delay: 600 }], ['hushai', 'mourn', { delay: 3200 }]],
      'p2.7': [['hushai', 'idle', { x: 1.18, z: -0.3, look: -1 }], ['davidH', 'idle', { look: 1 }]],
      w0: [['davidH', 'speak', { show: 1, to: 'hushai' }]],
      w1: [['davidH', 'pray', { show: 1 }]],
      w2: [['ittai', 'speak', { show: 1, to: 'davidH' }]],
      end: [['@env', 'overcast'], ['davidH', 'mourn', { look: 0.6 }]],
    },
  },

  /* d32. 시므이의 돌 — 바후림 길. 뒤쪽 언덕 비탈에서 사울 집안의 시므이가 내려와 돌을 던지고 흙먼지를 날리며 저주한다(돌은 무리 앞에 떨어진다 — 맞는 모습은 없다).
     아비새가 칼을 뽑아 나서지만 왕이 막는다. 무리는 다시 동쪽(오른쪽)으로 걷고, 시므이는 맞은편 비탈을 나란히 따라온다. 해 질 녘 지쳐 쉰다 */
  d32: {
    env: 'day',
    wide: 1.4,
    props: {
      sand: ['sand', 0, 0.15, { r: 1.9, color: '#b9a57e', stones: 18 }],
      ridge: ['hill', 0.35, -0.62, { w: 1.9, h: 0.32, d: 0.5, color: '#8f7f5e' }],
      rocks: ['rocks', 0, 0, { spots: [[-1.3, -0.3, 0.12], [1.5, 0.55, 0.1], [0.7, -0.15, 0.09]] }],
      ol1: ['olive', -0.45, -0.75, { scale: 0.85 }],
      ol2: ['olive', 1.35, -0.72, { scale: 0.8 }],
      folk: ['crowd', -1.6, 0.0, { spots: flock(6, 0.22, 0.1, 5), face: E }],
      throw: ['stonethrow', 0.45, -0.32, { h: 0.78, dx: -0.3, dz: 0.5, speed: 0.33 }],
    },
    cast: {
      david: ['davidH', -1.15, 0.28, 1, { speed: 0.9 }],
      abishai: ['abishai', -0.85, 0.12, 1],
      joab: ['joab', -1.4, 0.08, 1],
      g1: ['israelite', -0.95, 0.5, 1, { gaze: false }],
      g2: ['israelite2', -1.4, 0.5, 1, { gaze: false }],
      shimei: ['shimei', 0.9, -0.72, -1, { speed: 0.9 }],
    },
    beats: {
      enter: [['shimei', 'hurl', { x: 0.45, z: -0.32, look: -1 }], ['throw', 'throw'], ['david', 'idle', { x: -0.3, z: 0.3, look: 1 }],
        ['abishai', 'idle', { x: 0.0, z: 0.12, look: 1, item: 'sword' }], ['joab', 'idle', { x: -0.6, z: 0.08, look: 1 }],
        ['g1', 'idle', { x: 0.0, z: 0.48, item: 'shield' }], ['g2', 'idle', { x: -0.62, z: 0.5 }], ['folk', null, { x: -1.15, z: -0.02 }]],
      intro: [['@env', 'day'], ['throw', 'idle', { show: 0 }], ['shimei', 'idle', { show: 0 }]],
      // 바후림 — 언덕 위에서 한 사내가 내려온다
      'p0.0': [['david', 'idle', { x: -0.3, z: 0.3, look: 1 }], ['abishai', 'idle', { x: 0.0, z: 0.12, look: 1 }], ['joab', 'idle', { x: -0.6, z: 0.08, look: 1 }],
        ['g1', 'idle', { x: 0.0, z: 0.48 }], ['g2', 'idle', { x: -0.62, z: 0.5 }], ['folk', null, { x: -1.15, z: -0.02 }],
        ['shimei', 'idle', { show: 1, delay: 1500 }], ['shimei', 'idle', { x: 0.45, z: -0.32, look: -1, delay: 1800 }]],
      'p0.1': [['shimei', 'idle', { look: -1 }], ['throw', 'idle', { show: 1 }], ['david', 'idle', { look: 0.6 }]],
      // 돌을 던지며 소리친다
      'p0.2': [['shimei', 'hurl', { look: -1 }], ['throw', 'throw'], ['g1', 'idle', { item: 'shield' }]],
      'p0.3': [['shimei', 'rebuke', { to: 'david' }]],
      'p0.4': [['shimei', 'point', { look: -1 }]],
      'p0.5': [['shimei', 'rebuke', { to: 'david' }]],
      // 왕의 좌우에 둘러선 용사들
      'p0.6': [['shimei', 'hurl'], ['g1', 'idle', { x: 0.05, z: 0.4, look: 0.6 }], ['g2', 'idle', { x: -0.62, z: 0.42, look: 0.6 }]],
      // 아비새가 칼자루를 잡는다
      'p1.0': [['throw', 'idle'], ['shimei', 'idle'], ['abishai', 'idle', { item: 'sword', x: 0.2, z: 0.1, look: 1 }]],
      'p1.1': [['abishai', 'speak', { to: 'david' }]],
      'p1.2': [['abishai', 'point', { look: 0.6 }]],
      // 왕은 고개를 젓는다 — 내버려 두어라
      'p1.3': [['abishai', 'idle', { look: -1 }], ['david', 'idle', { look: 1 }]],
      'p1.4': [['david', 'speak', { to: 'abishai' }], ['joab', 'idle', { look: 1 }]],
      'p1.5': [['david', 'speak', { to: 'abishai' }]],
      'p1.6': [['david', 'mourn']],
      'p1.7': [['david', 'speak', { to: 'abishai' }], ['abishai', 'idle', { item: null, x: 0.05, z: 0.12, look: -1, delay: 1500 }]],
      'p2.1': [['david', 'look-up', { look: 0.3 }]],
      // 다시 길을 걷는다 — 시므이는 맞은편 비탈을 나란히 따라오며 돌을 던진다
      'p2.2': [['david', 'idle', { x: 0.75, z: 0.32, look: 1 }], ['abishai', 'idle', { x: 1.05, z: 0.14, look: 1 }], ['joab', 'idle', { x: 0.45, z: 0.1, look: 1 }],
        ['g1', 'idle', { x: 1.1, z: 0.48 }], ['g2', 'idle', { x: 0.42, z: 0.5 }], ['folk', null, { x: -0.05, z: 0.0 }],
        ['shimei', 'idle', { x: 1.35, z: -0.32, look: -1 }], ['throw', 'idle', { x: 1.35, z: -0.32 }]],
      'p2.3': [['shimei', 'hurl', { look: -1 }], ['throw', 'throw'], ['shimei', 'rebuke', { delay: 3000 }]],
      // 지칠 대로 지쳐 쉴 곳에 이르러 숨을 돌린다
      'p2.5': [['@env', 'dusk'], ['throw', 'idle', { show: 0 }], ['shimei', 'idle', { show: 0 }], ['david', 'sit-ground', { look: -0.4 }], ['joab', 'sit-ground'], ['g2', 'sit-ground'],
        ['abishai', 'idle', { look: -1 }]],
      w0: [['david', 'speak', { show: 1, to: 'abishai' }]],
      w1: [['david', 'speak', { show: 1 }]],
      w2: [['abishai', 'speak', { show: 1, to: 'david' }]],
      w3: [['shimei', 'rebuke', { show: 1 }], ['shimei', 'speak', { show: 1, to: 'david', delay: 300 }]],
      end: [['@env', 'dusk'], ['david', 'sit-ground']],
    },
  },
  /* d33. 마하나임 — 길르앗 성읍의 성문(gatetower). 요단을 건너온 왕과 백성이 성문 앞에 이르고, 왼쪽 멀리 압살롬(금관)과 아마사가 진을 친다 — 같은 땅에서 서로를 노려본다.
     오른쪽(동쪽)에서 소비·마길·바르실래가 짐 실은 나귀를 끌고 와 침상·대야·질그릇, 곡식·꿀·치즈와 양을 하나씩 내려놓는다. 낯선 땅에 차려진 상 앞에 왕이 앉고 지친 사람들이 먹는다 */
  d33: {
    env: 'day',
    wide: 1.4,
    props: {
      grass: ['grass', 0.2, 0.1, { r: 1.9 }],
      gate: ['gatetower', 0.1, -0.6, { w: 2.0 }],
      camp: ['camp', -1.45, -0.62, { n: 4, span: 0.7, color: '#8a7a62', flag: '#2f6a5a' }],
      folk: ['crowd', -1.6, -0.05, { spots: flock(6, 0.22, 0.1, 7), face: E }],
      d1: ['packdonkey', 2.05, 0.3, { speed: 0.5, rot: Math.PI }],
      d2: ['packdonkey', 2.1, 0.05, { speed: 0.5, rot: Math.PI }],
      wares: ['provisions', 0.7, 0.45, { kind: 'wares' }],
      food: ['provisions', 0.15, 0.52, { kind: 'food' }],
      sh1: ['sheep', 1.2, 0.58, { rot: 2.8 }],
      sh2: ['sheep', 1.42, 0.5, { rot: 3.3, scale: 0.8 }],
      feast: ['feast', -0.35, 0.22, { len: 0.8 }],
    },
    cast: {
      david: ['davidK', -1.55, 0.3, 1],
      joab: ['joab', -1.85, 0.12, 1],
      absalom: ['absalomK', -1.95, -0.2, 1],
      amasa: ['amasa', -2.0, -0.4, 1],
      shobi: ['shobi', 1.95, 0.15, -1],
      machir: ['hebrew2', 2.0, 0.45, -1],
      barzillai: ['elder', 1.85, -0.1, -1],
    },
    beats: {
      enter: [['absalom', 'idle', { show: 0 }], ['amasa', 'idle', { show: 0 }], ['camp', null, { show: 0 }], ['d1', null, { x: 1.5, z: 0.28 }], ['d2', null, { x: 1.75, z: 0.02 }],
        ['david', 'sit', { x: -0.35, z: 0.04, look: 0.4 }], ['joab', 'sit-ground', { x: -0.85, z: 0.15, look: 0.6 }], ['folk', null, { x: -0.75, z: -0.25 }], ['folk', 'sit'],
        ['barzillai', 'speak', { x: 0.12, z: 0.12, to: 'david' }], ['shobi', 'idle', { x: 0.42, z: 0.0, look: -1 }], ['machir', 'idle', { x: 0.55, z: 0.25, look: -1 }]],
      intro: [['@env', 'day'], ['folk', 'stand'], ['absalom', 'idle', { show: 0 }], ['amasa', 'idle', { show: 0 }], ['camp', null, { show: 0 }], ['shobi', 'idle', { show: 0 }], ['machir', 'idle', { show: 0 }], ['barzillai', 'idle', { show: 0 }],
        ['d1', null, { show: 0 }], ['d2', null, { show: 0 }], ['wares', null, { show: 0 }], ['food', null, { show: 0 }], ['sh1', null, { show: 0 }], ['sh2', null, { show: 0 }], ['feast', null, { show: 0 }]],
      // 요단을 건너 마하나임 성문 앞에
      'p0.0': [['david', 'idle', { x: -0.15, z: -0.02, look: 1 }], ['joab', 'idle', { x: -0.45, z: -0.12, look: 1, delay: 500 }], ['folk', null, { x: -0.75, z: -0.25 }]],
      // 압살롬도 온 이스라엘을 이끌고 건너온다
      'p0.1': [['absalom', 'idle', { show: 1, x: -1.3, z: 0.02, look: 1 }], ['amasa', 'idle', { show: 1, x: -1.58, z: -0.12, look: 1, delay: 600 }]],
      // 아마사를 군대 장관으로 세우고 길르앗 땅에 진을 친다
      'p0.2': [['absalom', 'speak', { to: 'amasa' }], ['amasa', 'bow', { look: 1 }], ['absalom', 'idle', { look: 1, delay: 3200 }], ['amasa', 'idle', { look: 1, delay: 3200 }], ['camp', null, { show: 1, delay: 3600 }]],
      // 아버지와 아들의 군대가 서로를 노려본다
      'p0.3': [['david', 'idle', { look: -1 }], ['joab', 'idle', { look: -1 }], ['absalom', 'idle', { look: 1 }]],
      // 지치고 굶주린 왕의 사람들 — 진은 물러난다
      'p0.4': [['absalom', 'idle', { show: 0 }], ['amasa', 'idle', { show: 0 }], ['camp', null, { show: 0 }], ['david', 'idle', { look: -0.2 }], ['joab', 'idle', { look: -0.6 }]],
      // 짐 실은 나귀들이 성문으로 들어선다
      'p1.0': [['absalom', 'idle', { show: 0 }], ['amasa', 'idle', { show: 0 }], ['camp', null, { show: 0 }], ['david', 'idle', { look: 1 }], ['joab', 'idle', { look: 1 }],
        ['d1', null, { show: 1, x: 1.5, z: 0.28 }], ['d2', null, { show: 1, x: 1.72, z: 0.02 }],
        ['shobi', 'idle', { show: 1, x: 0.45, z: 0.0, look: -1 }], ['machir', 'idle', { show: 1, x: 0.6, z: 0.25, look: -1, delay: 500 }], ['barzillai', 'idle', { show: 1, x: 0.85, z: -0.12, look: -1, delay: 900 }]],
      'p1.1': [['shobi', 'bow'], ['machir', 'bow', { delay: 1800 }], ['barzillai', 'bow', { delay: 3600 }]],
      // 침상과 대야와 질그릇
      'p1.2': [['shobi', 'idle'], ['machir', 'idle'], ['barzillai', 'idle'], ['wares', null, { show: 1 }]],
      // 밀과 보리, 볶은 곡식, 콩과 팥, 꿀과 엉긴 젖, 양과 치즈
      'p1.3': [['food', null, { show: 1 }], ['sh1', null, { show: 1, delay: 2500 }], ['sh2', null, { show: 1, delay: 3000 }]],
      // 백성이 광야에서 굶주리고 지치고 목말랐을 것입니다
      'p2.0': [['barzillai', 'idle', { x: 0.15, z: 0.1, look: -1 }]],
      'p2.1': [['barzillai', 'speak', { to: 'david' }], ['david', 'listen', { look: 1 }]],
      'p2.2': [['barzillai', 'idle'], ['machir', 'idle', { look: -1 }], ['shobi', 'idle', { look: -1 }]],
      // 낯선 땅에 차려진 상 앞에 앉는다
      'p2.3': [['feast', null, { show: 1 }], ['david', 'idle', { x: -0.35, z: 0.04, look: 0.4 }], ['david', 'sit', { delay: 2600 }], ['joab', 'idle', { x: -0.85, z: 0.15, look: 0.6 }],
        ['barzillai', 'idle', { x: 0.12, z: 0.12, look: -1 }], ['shobi', 'idle', { x: 0.42, z: 0.0 }], ['machir', 'idle', { x: 0.55, z: 0.25 }]],
      'p2.4': [['@env', 'dusk'], ['joab', 'sit-ground'], ['folk', 'sit', { x: -0.75, z: -0.25 }]],
      w0: [['barzillai', 'speak', { show: 1, to: 'david' }]],
      w1: [],
      end: [['@env', 'dusk'], ['david', 'sit']],
    },
  },

  /* d34. 에브라임 숲의 상수리나무 — 앞부분은 마하나임 성문: 왕이 세 장군(요압·아비새·잇대)에게 압살롬을 너그럽게 대하라 당부하고 군사들이 성문을 나간다.
     숲으로 바뀌면 어두운 나무 사이, 노새를 탄 압살롬이 큰 상수리나무의 낮은 가지 밑으로 들어가 사라지고(매달린 모습은 그리지 않는다) 노새만 빠져나간다.
     빈 나무에 빛이 머물고, 요압이 그리로 간 뒤는 어둠으로만. 나팔이 울리고 숲속에 큰 돌무더기가 쌓인다 */
  d34: {
    env: 'day',
    wide: 1.4,
    props: {
      grass: ['grass', 0.1, 0.05, { r: 1.9 }],
      gate: ['gatetower', -0.2, -0.6, { w: 2.2 }],
      oak: ['oak', 0.05, -0.35],
      t1: ['oak', -1.35, -0.62, { scale: 0.62 }],
      t2: ['oak', 1.45, -0.6, { scale: 0.7 }],
      t3: ['oak', -0.75, -0.85, { scale: 0.55 }],
      t4: ['oak', 1.7, 0.25, { scale: 0.5 }],
      t5: ['oak', -1.75, 0.2, { scale: 0.5 }],
      mule: ['mule', -1.9, -0.25, { speed: 0.7 }],
      light: ['beam', 0.55, -0.35, { r: 0.32, h: 2.3, peak: 0.36 }],
      cairn: ['cairn', 0.55, -0.12],
      army: ['crowd', -0.2, -0.25, { spots: flock(8, 0.28, 0.12, 11), face: 0.4 }],
    },
    cast: {
      david: ['davidK', -0.55, -0.18, 1],
      joab: ['joab', 0.0, 0.12, -0.8],
      abishai: ['abishai', 0.35, 0.22, -0.9],
      ittai: ['ittai', 0.7, 0.12, -1],
      absalom: ['absalom', 0, 0, Math.PI, { board: 'mule', pose: 'ride' }],
      soldier: ['israelite', -1.9, 0.4, 1, { speed: 1.2 }],
      y1: ['israelite2', -1.95, 0.15, 1],
      y2: ['israelite', -1.95, 0.6, 1],
    },
    beats: {
      enter: [['gate', null, { show: 0 }], ['army', null, { show: 0 }], ['david', 'idle', { show: 0 }], ['abishai', 'idle', { show: 0 }], ['ittai', 'idle', { show: 0 }],
        ['soldier', 'idle', { show: 0 }], ['y1', 'idle', { show: 0 }], ['y2', 'idle', { show: 0 }], ['absalom', 'ride', { show: 0 }], ['mule', null, { x: 1.2, z: 0.4 }],
        ['light', null, { show: 1 }], ['cairn', null, { show: 0 }], ['joab', 'idle', { x: -0.5, z: 0.25, look: 0.6 }]],
      intro: [['@env', 'day'], ['oak', null, { show: 0 }], ['t1', null, { show: 0 }], ['t2', null, { show: 0 }], ['t3', null, { show: 0 }], ['t4', null, { show: 0 }], ['t5', null, { show: 0 }],
        ['mule', null, { show: 0 }], ['absalom', 'ride', { show: 0 }], ['light', null, { show: 0 }], ['cairn', null, { show: 0 }], ['soldier', 'idle', { show: 0 }], ['y1', 'idle', { show: 0 }], ['y2', 'idle', { show: 0 }],
        ['army', null, { show: 0 }]],
      // 마하나임 성문 곁 — 군사를 셋으로 나눈다
      'p0.0': [['david', 'speak', { to: 'joab' }], ['joab', 'bow', { delay: 1500 }], ['abishai', 'bow', { delay: 2500 }], ['ittai', 'bow', { delay: 3500 }]],
      // 왕은 성에 계시라고 백성이 막는다
      'p0.1': [['joab', 'idle'], ['abishai', 'idle'], ['ittai', 'idle'], ['david', 'idle', { x: -0.3, z: 0.0, look: 1 }]],
      'p0.2': [['joab', 'speak', { to: 'david' }], ['david', 'listen']],
      // 군대가 성문을 빠져나가고 — 왕이 모두가 듣도록 당부한다
      'p0.3': [['joab', 'idle'], ['david', 'idle', { x: -0.55, z: -0.18, look: 1 }], ['army', null, { show: 1, x: -0.2, z: -0.5 }], ['army', null, { x: 1.4, z: -0.05, delay: 400 }], ['army', null, { show: 0, delay: 5000 }]],
      'p0.4': [['david', 'speak', { to: 'joab' }]],
      // 에브라임 숲 — 성문이 숲으로 바뀐다
      'p1.0': [['@env', 'overcast'], ['gate', null, { show: 0 }], ['army', null, { show: 0 }], ['david', 'idle', { show: 0 }], ['abishai', 'idle', { show: 0 }], ['ittai', 'idle', { show: 0 }],
        ['oak', null, { show: 1 }], ['t1', null, { show: 1 }], ['t2', null, { show: 1 }], ['t3', null, { show: 1 }], ['t4', null, { show: 1 }], ['t5', null, { show: 1 }],
        ['joab', 'idle', { x: -0.9, z: 0.3, look: 1 }]],
      'p1.1': [['y1', 'idle', { show: 1, x: -1.2, z: 0.1, look: 1 }], ['y2', 'idle', { show: 1, x: -1.3, z: 0.55, look: 1 }]],
      'p1.2': [['@env', 'dark'], ['@env', 'overcast', { delay: 3000 }]],
      // 노새를 탄 압살롬이 큰 상수리나무의 얽힌 가지 밑으로
      'p1.3': [['mule', null, { show: 1, x: -0.4, z: 0.02 }], ['absalom', 'ride', { show: 1 }], ['mule', null, { x: 0.62, z: -0.24, delay: 3600 }], ['absalom', 'ride', { show: 0, delay: 4300 }]],
      // 노새만 빠져나간다 — 빈 나무에 빛이 머문다
      'p1.4': [['mule', null, { x: 0.62, z: -0.24 }], ['absalom', 'ride', { show: 0 }], ['mule', null, { x: 1.2, z: 0.4, delay: 800 }], ['light', null, { show: 1, delay: 1500 }]],
      // 본 사람이 요압에게 알린다
      'p2.0': [['absalom', 'ride', { show: 0 }], ['mule', null, { x: 1.2, z: 0.4 }], ['light', null, { show: 1 }], ['soldier', 'idle', { show: 1, x: -0.55, z: 0.3, look: -1 }]],
      // 왜 치지 않았느냐는 요압의 다그침 — 군사의 대답
      'p2.1': [['joab', 'rebuke', { to: 'soldier' }], ['soldier', 'idle', { delay: 2500 }]],
      'p2.2': [['joab', 'idle'], ['soldier', 'speak', { to: 'joab' }]],
      // 요압은 더 듣지 않는다
      'p2.3': [['soldier', 'idle'], ['joab', 'idle', { look: 2.8 }]],
      // 요압이 그리로 간다 — 그 뒤는 어둠으로만
      'p2.4': [['joab', 'idle', { x: 0.3, z: -0.05, look: 2.8 }], ['@env', 'dark', { delay: 2500 }], ['soldier', 'mourn', { delay: 1500 }],
        ['y1', 'idle', { x: 0.1, z: 0.0, look: 2.6, delay: 1500 }], ['y2', 'idle', { x: 0.75, z: 0.05, look: 3.2, delay: 1500 }]],
      // 나팔을 불어 싸움을 멈춘다
      'p2.5': [['@env', 'overcast'], ['light', null, { show: 0 }], ['joab', 'idle', { x: -0.3, z: 0.15, look: 0.6, item: 'horn' }], ['y1', 'idle', { x: 0.25, z: 0.1, look: 0 }], ['y2', 'idle', { x: 0.9, z: 0.15, look: -0.4 }],
        ['mule', null, { show: 0 }], ['soldier', 'idle', { delay: 1000 }]],
      // 숲속 구덩이 위에 큰 돌무더기
      'p2.6': [['cairn', null, { show: 1, delay: 800 }], ['joab', 'idle', { look: 0.3, item: null, delay: 600 }]],
      w0: [['david', 'speak', { show: 1, to: 'joab' }]],
      w1: [['joab', 'speak', { show: 1 }]],
      w2: [['soldier', 'speak', { show: 1, to: 'joab' }]],
      end: [['@env', 'overcast'], ['joab', 'idle', { item: null }]],
    },
  },

  /* d35. 내 아들 압살롬아 — 왼쪽은 마하나임 성문, 오른쪽은 요단 들길. 아히마아스가 요압에게 조르고, 구스 사람이 먼저 떠난 뒤 아히마아스가 더 빨리 내달린다.
     두 성문 사이에 앉은 왕, 성벽 위의 파수꾼이 가리키고, 두 전령이 차례로 엎드려 아뢴다. 왕은 성문 위 다락방에 올라 운다(배역을 바꿔 낀다 — davidUp).
     군사들은 몰래 성으로 들어오고, 요압의 다그침에 왕이 다시 성문에 앉는다 */
  d35: {
    env: 'day',
    wide: 1.4,
    solemn: false,
    props: {
      grass: ['grass', 0.3, 0.1, { r: 1.9 }],
      gate: ['gatetower', -0.65, -0.55, { w: 1.9 }],
      road: ['sand', 1.0, 0.2, { r: 0.9, color: '#b9a57e', stones: 8 }],
      t1: ['oak', 1.6, -0.6, { scale: 0.5 }],
      folk: ['crowd', 1.7, 0.35, { spots: flock(6, 0.22, 0.1, 13), face: -E }],
    },
    cast: {
      david: ['davidK', -0.9, -0.2, 0.6, { y: 0.1, pose: 'sit' }],
      davidUp: ['davidK', -0.65, -0.47, 0.2, { y: 0.82 }],
      watch: ['israelite', -0.21, -0.55, 1, { y: 1.0, gaze: false }],
      joab: ['joab', 1.35, -0.12, -0.8],
      ahimaaz: ['ahimaaz', 1.05, 0.12, 0.8, { speed: 1.7 }],
      cushite: ['cushite', 1.55, 0.25, -1, { speed: 1.1 }],
    },
    beats: {
      enter: [['davidUp', 'mourn'], ['david', 'sit', { show: 0 }], ['watch', 'idle', { look: -0.4 }], ['joab', 'idle', { show: 0 }], ['ahimaaz', 'idle', { x: -0.2, z: 0.15, look: -0.6 }], ['cushite', 'idle', { x: 0.15, z: 0.3, look: -0.8 }],
        ['folk', null, { x: 0.6, z: 0.4 }]],
      intro: [['@env', 'day'], ['davidUp', 'idle', { show: 0 }], ['david', 'sit', { show: 0 }], ['watch', 'idle', { show: 0 }], ['folk', null, { show: 0 }]],
      // 싸움이 끝나고 — 아히마아스가 요압에게 조른다
      'p0.0': [['ahimaaz', 'speak', { to: 'joab' }], ['joab', 'listen', { look: -0.8 }]],
      'p0.2': [['ahimaaz', 'idle'], ['joab', 'speak', { to: 'cushite' }], ['cushite', 'bow', { delay: 2200 }], ['cushite', 'idle', { x: 0.2, z: 0.35, delay: 3200 }], ['cushite', 'idle', { show: 0, delay: 4600 }]],
      'p0.3': [['joab', 'idle', { look: -1 }], ['cushite', 'idle', { show: 0 }]],
      // 끝내 허락을 받아 요단 들길로 내달린다 — 먼저 떠난 구스 사람을 앞질러
      'p0.4': [['ahimaaz', 'speak', { to: 'joab' }], ['joab', 'speak', { to: 'ahimaaz', delay: 2000 }]],
      'p0.5': [['joab', 'idle', { look: -1 }], ['ahimaaz', 'idle', { x: 0.1, z: 0.25 }], ['ahimaaz', 'idle', { show: 0, delay: 1400 }]],
      // 두 성문 사이에 앉은 왕 — 성벽 위의 파수꾼
      'p1.0': [['joab', 'idle', { show: 0 }], ['david', 'sit', { show: 1, look: 0.6 }], ['watch', 'idle', { show: 1, look: 1 }],
        ['ahimaaz', 'idle', { x: 1.95, z: 0.2, look: -1 }], ['cushite', 'idle', { x: 1.95, z: 0.35, look: -1 }]],
      'p1.1': [['watch', 'speak', { to: 'david' }]],
      'p1.2': [['watch', 'point', { look: 1 }], ['ahimaaz', 'idle', { show: 1, x: 0.9, z: 0.2, look: -1 }]],
      'p1.3': [['cushite', 'idle', { show: 1, x: 1.6, z: 0.35, look: -1 }]],
      'p1.4': [['watch', 'speak', { to: 'david' }], ['ahimaaz', 'idle', { x: -0.25, z: 0.14, look: -1 }], ['cushite', 'idle', { x: 1.0, z: 0.35, look: -1 }]],
      // 엎드려 승리를 알린다 — 왕이 물은 것은 하나
      'p1.5': [['watch', 'idle', { look: 1 }], ['ahimaaz', 'kneel', { x: -0.25, z: 0.14, look: -1 }], ['ahimaaz', 'speak', { to: 'david', delay: 2400 }]],
      'p1.6': [['ahimaaz', 'kneel'], ['david', 'sit-speak', { to: 'ahimaaz' }]],
      'p1.7': [['david', 'sit'], ['ahimaaz', 'shrug', { look: -1 }]],
      // 뒤이어 온 구스 사람
      'p1.8': [['ahimaaz', 'idle', { x: -0.15, z: 0.35, look: -1 }], ['cushite', 'idle', { x: -0.45, z: 0.15, look: -1 }], ['cushite', 'bow', { delay: 2600 }]],
      'p1.9': [['cushite', 'speak', { to: 'david' }]],
      // 왕은 몸을 떨며 성문 위 다락방으로 올라가 운다
      'p2.0': [['cushite', 'idle'], ['david', 'idle', { y: 0, x: -0.65, z: -0.32, look: 3 }], ['david', 'idle', { show: 0, delay: 1800 }], ['davidUp', 'mourn', { show: 1, delay: 2600 }],
        ['ahimaaz', 'idle', { look: -0.4 }], ['cushite', 'idle', { look: -0.6 }]],
      'p2.1': [['david', 'idle', { show: 0 }], ['davidUp', 'mourn', { show: 1 }]],
      'p2.2': [['davidUp', 'look-up', { look: 0 }], ['davidUp', 'mourn', { delay: 2600 }]],
      // 승리는 울음이 되고 — 군사들이 몰래 성으로 들어온다
      'p2.3': [['davidUp', 'mourn'], ['ahimaaz', 'idle', { show: 0 }], ['cushite', 'idle', { show: 0 }], ['folk', null, { show: 1, x: 1.7, z: 0.35 }], ['folk', null, { x: -0.25, z: 0.05, delay: 500 }],
        ['folk', null, { show: 0, delay: 6500 }]],
      // 요압이 들어와 다그친다
      'p2.4': [['folk', null, { show: 0 }], ['joab', 'idle', { show: 1, x: 0.2, z: 0.0, look: -1 }], ['joab', 'rebuke', { to: 'davidUp', delay: 1500 }]],
      'p2.5': [['joab', 'speak', { to: 'davidUp' }]],
      // 왕은 일어나 성문에 앉는다
      'p2.6': [['joab', 'idle', { x: -0.3, z: 0.2, look: -1 }], ['davidUp', 'idle', { show: 0 }], ['david', 'sit', { show: 1, x: -0.9, z: -0.2, y: 0.1, look: 0.6, delay: 1500 }]],
      w0: [['davidUp', 'mourn', { show: 1 }]],
      w1: [['david', 'sit-speak', { show: 1, y: 0.1, x: -0.9, z: -0.2 }]],
      w2: [['cushite', 'speak', { show: 1, to: 'david' }]],
      w3: [['joab', 'speak', { show: 1, to: 'david' }]],
      end: [['davidUp', 'idle', { show: 0 }], ['david', 'sit', { show: 1, y: 0.1 }]],
    },
  },

  /* d36. 아라우나의 타작마당 — 왼쪽 뒤의 다윗성, 오른쪽 모리아의 타작마당. 왕이 백성을 세라 명하고 요압이 말리다 두루마리(숫자)를 들고 온다. 왕이 가슴을 치며 엎드린다.
     아침에 선견자 갓이 세 가지를 내놓고, 왕은 주의 손을 고른다. 전염병은 어둠과 엎드린 사람들로만 — 천사는 타작마당 위의 빛으로만.
     왕이 올라가 아라우나에게 값을 치르고 제단을 쌓아 불이 오르면 빛이 물러가고 날이 밝는다 */
  d36: {
    env: 'day',
    wide: 1.4,
    props: {
      sand: ['sand', 0.1, 0.1, { r: 1.9, color: '#bba886', stones: 16 }],
      zion: ['zion', -1.3, -0.62, { w: 1.4, d: 0.7, tent: true }],
      floor: ['threshing', 0.65, -0.12, { r: 0.6, altar: true }],
      altar: ['altar', 0.65, -0.32, { state: 'idle' }],
      ox: ['ox', 1.45, -0.42, { scale: 0.6, rot: Math.PI }],
      beam: ['beam', 0.65, -0.12, { r: 0.7, h: 2.6, peak: 0.5 }],
    },
    cast: {
      david: ['davidK', -0.55, 0.18, 1],
      joab: ['joab', -0.2, 0.15, -1],
      gad: ['gad', 1.9, 0.35, -1],
      elder: ['elder', -0.85, 0.38, 1],
      araunah: ['araunah', 0.95, 0.05, -1],
      m1: ['man', -1.25, 0.35, 0.5, { gaze: false }],
      m2: ['woman', 1.35, 0.45, -0.5, { gaze: false }],
      m3: ['hebrew', -0.3, -0.35, 0.3, { gaze: false }],
    },
    beats: {
      enter: [['@env', 'dusk'], ['beam', null, { show: 1 }], ['altar', 'fire'], ['joab', 'idle', { show: 0 }], ['gad', 'idle', { show: 0 }], ['m1', 'idle', { show: 0 }], ['m2', 'idle', { show: 0 }], ['m3', 'idle', { show: 0 }],
        ['david', 'pray', { x: 0.05, z: 0.25, look: 1 }], ['elder', 'kneel', { x: -0.35, z: 0.35, look: 1 }], ['araunah', 'bow', { x: 0.72, z: 0.32, look: -1 }]],
      intro: [['@env', 'day'], ['beam', null, { show: 0 }], ['altar', 'idle', { show: 0 }], ['gad', 'idle', { show: 0 }], ['elder', 'idle', { show: 0 }], ['araunah', 'idle', { show: 0 }],
        ['m1', 'idle', { show: 0 }], ['m2', 'idle', { show: 0 }], ['m3', 'idle', { show: 0 }]],
      // 백성을 세라
      'p0.0': [['david', 'speak', { to: 'joab' }]],
      'p0.2': [['david', 'idle'], ['joab', 'idle', { look: -1 }]],
      'p0.3': [['joab', 'speak', { to: 'david' }]],
      'p0.4': [['joab', 'idle'], ['david', 'point', { look: 1 }], ['joab', 'bow', { delay: 1500 }], ['joab', 'idle', { x: 1.9, z: 0.35, delay: 2600 }], ['joab', 'idle', { show: 0, delay: 6000 }]],
      // 아홉 달 이십 일 만에 — 두루마리의 숫자
      'p0.5': [['david', 'idle', { look: 1 }], ['joab', 'idle', { show: 1, item: 'scroll', x: 0.2, z: 0.2, look: -1 }]],
      'p0.6': [['joab', 'speak', { to: 'david' }]],
      // 다윗의 가슴이 찔린다
      'p0.7': [['joab', 'idle', { item: null }], ['david', 'mourn']],
      'p0.8': [['david', 'pray', { look: 0.3 }], ['joab', 'idle', { x: 1.9, z: 0.4, delay: 1500 }], ['joab', 'idle', { show: 0, delay: 4500 }]],
      // 이튿날 아침 선견자 갓
      'p1.0': [['@env', 'dawn'], ['joab', 'idle', { show: 0 }], ['david', 'idle', { look: 1 }], ['gad', 'idle', { show: 1, x: 0.05, z: 0.22, look: -1 }]],
      'p1.1': [['gad', 'speak', { to: 'david' }]],
      'p1.2': [['gad', 'idle'], ['david', 'speak', { to: 'gad' }]],
      'p1.3': [['david', 'kneel', { look: 1 }]],
      // 전염병 — 어둠과 엎드린 사람들
      'p1.4': [['@env', 'dark'], ['gad', 'idle', { look: 0 }], ['m1', 'mourn', { show: 1 }], ['m2', 'mourn', { show: 1, delay: 800 }], ['m3', 'mourn', { show: 1, delay: 1600 }]],
      // 천사가 예루살렘으로 손을 뻗자 — 타작마당 위의 빛
      'p1.5': [['beam', null, { show: 1 }], ['david', 'look-up', { look: 1 }]],
      'p1.6': [['david', 'kneel', { look: 1 }]],
      // 여부스 사람 아라우나의 타작마당 곁
      'p2.0': [['araunah', 'idle', { show: 1, look: -0.3 }], ['gad', 'idle', { x: -0.95, z: 0.1, look: 1 }]],
      'p2.1': [['david', 'mourn', { look: 1 }], ['elder', 'mourn', { show: 1, x: -0.85, z: 0.38, look: 1 }]],
      'p2.2': [['david', 'pray', { look: 1 }]],
      // 갓의 말대로 올라가자 아라우나가 엎드려 바치겠다고 한다
      'p2.3': [['elder', 'idle'], ['david', 'idle', { x: 0.05, z: 0.25, look: 1 }], ['elder', 'idle', { x: -0.35, z: 0.35, look: 1, delay: 800 }],
        ['araunah', 'idle', { x: 0.72, z: 0.32, look: -1, delay: 1500 }], ['araunah', 'bow', { delay: 3500 }], ['araunah', 'speak', { to: 'david', delay: 5500 }]],
      'p2.4': [['araunah', 'idle'], ['david', 'speak', { to: 'araunah' }]],
      'p2.5': [['david', 'speak', { to: 'araunah' }]],
      // 은 오십 세겔 — 제단을 쌓자 재앙이 그친다
      'p2.6': [['david', 'idle'], ['altar', 'fire', { show: 1 }], ['david', 'pray', { delay: 1500 }], ['elder', 'kneel', { delay: 1500 }], ['araunah', 'bow', { delay: 1500 }],
        ['@env', 'dusk', { delay: 2500 }], ['beam', null, { show: 0, delay: 4000 }], ['m1', 'idle', { delay: 4500 }], ['m2', 'idle', { delay: 4800 }], ['m3', 'idle', { delay: 5100 }]],
      w0: [['beam', null, { show: 1 }]],
      w1: [['david', 'speak', { show: 1 }]],
      w2: [['david', 'speak', { show: 1, to: 'araunah' }], ['araunah', 'idle', { show: 1 }]],
      w3: [['araunah', 'speak', { show: 1, to: 'david' }]],
      end: [['@env', 'dusk'], ['beam', null, { show: 0 }], ['altar', 'fire']],
    },
  },

  /* d37. 기혼 샘의 기름 부음 — 왼쪽은 왕의 방(겹겹이 덮은 침상에 앉은 늙은 왕, 곁의 아비삭), 오른쪽은 다윗성 아래 기혼 샘과 그 아래 엔로겔의 잔치.
     아도니야가 잔치를 열고, 나단과 밧세바가 차례로 왕 앞에 엎드린다. 왕의 노새를 탄 솔로몬이 샘으로 내려가 사독이 기름을 붓고, 나팔과 함성에 잔치 손님이 흩어진다 */
  d37: {
    env: 'day',
    wide: 1.5,
    scale: 0.85,
    props: {
      grass: ['grass', 0.6, 0.15, { r: 1.5 }],
      hall: ['hall', -1.05, -0.05, { w: 1.3, throne: false, lamp: -1.5 }],
      couch: ['couch', -1.0, -0.28],
      zion: ['zion', 0.9, -0.82, { w: 1.3, d: 0.5, palace: false, tent: true }],
      spring: ['rockspring', 0.45, -0.52, { color: '#a89878', scale: 0.6 }],
      feast: ['feast', 1.8, 0.55, { len: 0.6 }],
      mule: ['mule', -0.35, 0.42, { speed: 0.5 }],
    },
    cast: {
      david: ['davidO', -1.0, -0.28, 0.5, { y: 0.13, pose: 'sit' }],
      abishag: ['abishag', -1.45, -0.12, 0.8],
      adonijah: ['adonijah', 1.8, 0.35, -0.3],
      joab: ['joab', 2.05, 0.5, -1],
      abiathar: ['abiathar', 1.5, 0.6, 0.6],
      bathsheba: ['bathsheba', -0.35, 0.3, -1],
      nathan: ['nathan', 0.05, 0.25, -1],
      solomon: ['solomon', 0, 0, Math.PI, { board: 'mule', pose: 'ride' }],
      zadok: ['zadok', 0.9, -0.18, -1],
      benaiah: ['benaiah', 1.15, 0.2, -1],
      horn: ['israelite', 1.3, -0.42, -0.6, { gaze: false }],
    },
    beats: {
      enter: [['spring', 'flow'], ['adonijah', 'idle', { show: 0 }], ['joab', 'idle', { show: 0 }], ['abiathar', 'idle', { show: 0 }], ['feast', null, { show: 0 }],
        ['mule', null, { show: 0 }], ['solomon', 'ride', { show: 0 }], ['solomon', 'kneel', { show: 1, board: null, x: 0.62, z: -0.1, look: 1 }],
        ['zadok', 'anoint', { item: 'oilhorn', look: -1 }], ['nathan', 'idle', { x: 0.25, z: 0.22, look: 1 }], ['benaiah', 'raise'], ['horn', 'idle', { item: 'horn' }],
        ['bathsheba', 'idle', { x: -0.65, z: 0.2, look: -1 }]],
      intro: [['@env', 'day'], ['spring', 'flow'], ['adonijah', 'idle', { show: 0 }], ['joab', 'idle', { show: 0 }], ['abiathar', 'idle', { show: 0 }], ['feast', null, { show: 0 }],
        ['bathsheba', 'idle', { show: 0 }], ['nathan', 'idle', { show: 0 }], ['mule', null, { show: 0 }], ['solomon', 'ride', { show: 0, board: 'mule', x: 0, z: 0, look: Math.PI }], ['zadok', 'idle', { show: 0, item: null }],
        ['benaiah', 'idle', { show: 0 }], ['horn', 'idle', { show: 0, item: 'horn' }]],
      // 늙은 왕 — 수넴 여자 아비삭이 곁에서
      'p0.1': [['abishag', 'idle', { x: -1.42, z: -0.05, look: 1 }]],
      // 아도니야가 나선다 — 내가 왕이 되리라
      'p0.2': [['adonijah', 'idle', { show: 1, look: -0.3 }]],
      'p0.3': [['adonijah', 'raise', { look: -0.2 }]],
      'p0.4': [['adonijah', 'idle'], ['joab', 'idle', { show: 1, look: -1 }], ['abiathar', 'idle', { show: 1, look: 0.6, delay: 800 }]],
      // 엔로겔 곁의 잔치
      'p0.5': [['feast', null, { show: 1 }], ['adonijah', 'sit-speak', { to: 'joab' }], ['joab', 'sit-ground'], ['abiathar', 'sit-ground']],
      // 나단이 밧세바를 찾아간다
      'p1.0': [['adonijah', 'sit'], ['bathsheba', 'idle', { show: 1, look: 1 }], ['nathan', 'idle', { show: 1, x: 0.05, z: 0.25, look: -1 }]],
      'p1.1': [['nathan', 'speak', { to: 'bathsheba' }]],
      // 왕의 방에 들어가 엎드린다
      'p1.2': [['nathan', 'idle'], ['bathsheba', 'idle', { x: -0.68, z: -0.18, look: -1 }], ['bathsheba', 'kneel', { delay: 2600 }]],
      'p1.3': [['bathsheba', 'speak', { to: 'david' }], ['david', 'sit', { look: 0.7 }]],
      'p1.4': [['bathsheba', 'idle', { x: -0.62, z: 0.25, look: -1 }], ['nathan', 'idle', { x: -0.68, z: -0.15, look: -1 }], ['nathan', 'bow', { delay: 2400 }], ['nathan', 'speak', { to: 'david', delay: 3600 }]],
      // 늙은 왕이 입을 연다 — 오늘 그 맹세대로
      'p1.5': [['nathan', 'idle'], ['david', 'sit-speak', { to: 'nathan' }]],
      'p1.6': [['david', 'sit-speak', { to: 'bathsheba' }], ['bathsheba', 'bow']],
      // 다윗의 노새에 오른 솔로몬이 기혼 샘으로
      'p2.0': [['david', 'sit', { look: 0.8 }], ['bathsheba', 'idle', { look: 1 }], ['nathan', 'idle', { x: 0.25, z: 0.22, look: 1 }],
        ['mule', null, { show: 1, x: 0.4, z: 0.06 }], ['solomon', 'ride', { show: 1 }], ['benaiah', 'idle', { show: 1, look: -1 }], ['zadok', 'idle', { show: 1, look: -1 }]],
      // 사독이 기름 뿔을 들어 붓는다
      'p2.1': [['mule', null, { x: 0.4, z: 0.06 }], ['solomon', 'kneel', { board: null, x: 0.62, z: -0.1, look: 1 }], ['mule', null, { x: -0.1, z: -0.8, delay: 1500 }], ['mule', null, { show: 0, delay: 3800 }], ['zadok', 'anoint', { item: 'oilhorn', look: -1, delay: 800 }]],
      // 나팔이 울리고 — 솔로몬 왕 만세
      'p2.2': [['zadok', 'idle', { item: null }], ['horn', 'idle', { show: 1, item: 'horn' }]],
      'p2.3': [['solomon', 'idle', { look: 0.2 }], ['benaiah', 'raise'], ['nathan', 'raise'], ['zadok', 'raise']],
      // 함성에 아도니야의 손님들이 흩어진다
      'p2.4': [['adonijah', 'afraid', { look: -1 }], ['joab', 'idle', { x: 2.3, z: 0.6 }], ['abiathar', 'idle', { x: 2.2, z: 0.8 }], ['adonijah', 'idle', { x: 2.3, z: 0.3, delay: 1200 }],
        ['joab', 'idle', { show: 0, delay: 2600 }], ['abiathar', 'idle', { show: 0, delay: 2600 }], ['adonijah', 'idle', { show: 0, delay: 3800 }]],
      // 왕은 침상에서 몸을 굽힌다
      'p2.5': [['benaiah', 'idle'], ['nathan', 'idle'], ['zadok', 'idle'], ['david', 'sit', { look: 0.3 }], ['abishag', 'kneel']],
      'p2.6': [['david', 'sit-speak', { to: 'abishag' }]],
      w0: [['david', 'sit-speak', { show: 1, to: 'bathsheba' }], ['bathsheba', 'idle', { show: 1 }]],
      w1: [['david', 'sit-speak', { show: 1 }]],
      w2: [['bathsheba', 'speak', { show: 1, to: 'david' }]],
      w3: [['benaiah', 'speak', { show: 1, to: 'solomon' }]],
      end: [['david', 'sit']],
    },
  },

  /* d38. 성전을 위한 준비 — 아라우나의 타작마당(d36의 제단이 그대로), 왼쪽 뒤에 다윗성. 늙은 왕이 '여기가 주의 집이 설 자리'라 가리키고,
     다듬은 돌·놋과 쇠·백향목이 하나씩 쌓인다. 솔로몬을 불러 당부하고, 지도자들 앞에서 설계도(두루마리)를 건넨다. 금과 은을 내놓고 지도자들도 기꺼이 바치며 왕이 찬양한다 */
  d38: {
    env: 'day',
    wide: 1.4,
    props: {
      sand: ['sand', 0.1, 0.1, { r: 1.9, color: '#bba886', stones: 16 }],
      zion: ['zion', -1.3, -0.65, { w: 1.4, d: 0.7, tent: true }],
      floor: ['threshing', 0.6, -0.38, { r: 0.5, altar: true }],
      altar: ['altar', 0.6, -0.5, { state: 'fire' }],
      stone: ['stockpile', -0.35, -0.55, { kind: 'stone' }],
      bronze: ['stockpile', 1.25, -0.68, { kind: 'bronze' }],
      cedar: ['stockpile', 1.5, 0.12, { kind: 'cedar' }],
      gold: ['stockpile', -0.05, 0.5, { kind: 'gold' }],
    },
    cast: {
      david: ['davidO', 0.15, 0.05, 0.8],
      solomon: ['solomon', -1.2, 0.3, 1],
      mason: ['man', -0.65, -0.42, 0.6, { gaze: false }],
      sidon: ['tyrianD', 1.95, 0.35, -1],
      l1: ['elder', -1.0, 0.35, 1],
      l2: ['official', -1.3, 0.12, 1],
      l3: ['hushai', -1.55, 0.38, 1],
    },
    beats: {
      enter: [['stone', null, { show: 1 }], ['bronze', null, { show: 1 }], ['cedar', null, { show: 1 }], ['gold', null, { show: 1 }], ['sidon', 'idle', { show: 0 }], ['mason', 'idle', { show: 0 }],
        ['solomon', 'idle', { x: -0.2, z: 0.15, look: 1, item: 'scroll' }], ['david', 'bless', { look: -1 }], ['l1', 'idle', { x: -0.8, z: 0.42 }], ['l2', 'idle', { x: -1.1, z: 0.22 }], ['l3', 'idle', { x: -1.45, z: 0.45 }]],
      intro: [['@env', 'day'], ['altar', 'fire'], ['stone', null, { show: 0 }], ['bronze', null, { show: 0 }], ['cedar', null, { show: 0 }], ['gold', null, { show: 0 }],
        ['solomon', 'idle', { show: 0 }], ['mason', 'idle', { show: 0 }], ['sidon', 'idle', { show: 0 }], ['l1', 'idle', { show: 0 }], ['l2', 'idle', { show: 0 }], ['l3', 'idle', { show: 0 }]],
      // 타작마당에서 — 여기가 주 하나님의 집이 설 자리
      'p0.0': [['david', 'idle', { look: 1 }]],
      'p0.1': [['david', 'point', { look: 0.8 }]],
      // 석수를 모으고, 쇠와 놋을 쌓는다
      'p0.2': [['david', 'idle', { look: -0.6 }], ['mason', 'idle', { show: 1 }], ['stone', null, { show: 1 }], ['bronze', null, { show: 1, delay: 2500 }]],
      // 시돈과 두로 사람들이 백향목을
      'p0.3': [['sidon', 'idle', { show: 1, x: 1.7, z: 0.4, look: -1 }], ['cedar', null, { show: 1, delay: 1200 }], ['david', 'idle', { look: 1 }]],
      'p0.5': [['david', 'idle', { look: -0.3 }]],
      'p0.6': [['david', 'look-up', { look: 0.4 }]],
      // 솔로몬을 부른다
      'p1.0': [['sidon', 'idle', { show: 0 }], ['solomon', 'idle', { show: 1, x: -0.2, z: 0.15, look: 1 }], ['david', 'idle', { look: -1 }]],
      'p1.1': [['david', 'speak', { to: 'solomon' }]],
      'p1.2': [['david', 'look-up', { look: -0.3 }]],
      'p1.3': [['david', 'speak', { to: 'solomon' }]],
      'p1.4': [['david', 'speak', { to: 'solomon' }], ['solomon', 'listen']],
      // 지도자들 앞에서 설계도를 건넨다
      'p1.5': [['l1', 'idle', { show: 1, x: -0.8, z: 0.42, look: 1 }], ['l2', 'idle', { show: 1, x: -1.1, z: 0.22, look: 1 }], ['l3', 'idle', { show: 1, x: -1.45, z: 0.45, look: 1 }],
        ['david', 'idle', { item: 'scroll', delay: 1200 }], ['solomon', 'idle', { item: 'scroll', delay: 3600 }], ['david', 'idle', { item: null, delay: 3600 }]],
      'p1.6': [['solomon', 'idle', { item: 'scroll' }], ['david', 'bless', { to: 'solomon', look: -1 }]],
      // 금과 은을 내놓는다 — 지도자들도 기꺼이
      'p2.0': [['david', 'idle', { look: -0.4 }], ['gold', null, { show: 1 }]],
      'p2.1': [['l1', 'idle', { item: 'gift', x: -0.5, z: 0.5, look: 1 }], ['l2', 'idle', { item: 'gift', x: -0.85, z: 0.3, look: 1, delay: 700 }], ['l1', 'bow', { delay: 2600 }], ['l2', 'bow', { delay: 3300 }],
        ['l1', 'raise', { item: null, delay: 4800 }], ['l2', 'raise', { item: null, delay: 5200 }], ['l3', 'raise', { delay: 5200 }]],
      // 온 회중 앞에서 찬양한다
      'p2.2': [['l1', 'idle'], ['l2', 'idle'], ['l3', 'idle'], ['david', 'raise', { look: 0 }]],
      'p2.3': [['david', 'speak', { to: 'l1' }]],
      'p2.4': [['david', 'pray', { look: 0.3 }]],
      'p2.5': [['@env', 'dusk'], ['david', 'look-up', { look: 0.3 }]],
      w0: [['david', 'listen', { look: -0.3 }]],
      w1: [['david', 'speak', { show: 1, to: 'solomon' }], ['solomon', 'idle', { show: 1 }]],
      w2: [['david', 'speak', { show: 1, to: 'l1' }]],
      w3: [['david', 'speak', { show: 1, to: 'solomon' }], ['solomon', 'idle', { show: 1 }]],
      end: [['@env', 'dusk']],
    },
  },

  /* d39. 다윗의 마지막 말 — 새벽의 다윗성. 늙은 왕이 수금을 타며 마지막 노래를 부르고, 동쪽(오른쪽)에 구름 없는 아침 해가 떠오르며 비 온 뒤처럼 새 풀이 돋는다.
     침상에 앉아 솔로몬에게 당부하고, 모세(느보산)처럼 빛 속으로 서서히 사라진다(죽음은 그리지 않는다). 솔로몬이 엎드렸다 일어나 떠오르는 해를 바라본다 */
  d39: {
    env: 'dawn',
    wide: 1.4,
    props: {
      sand: ['sand', 0.0, 0.15, { r: 1.9, color: '#b8a888', stones: 10 }],
      grass: ['grass', 0.2, 0.2, { r: 1.7 }],
      zion: ['zion', -0.35, -0.75, { w: 1.8, d: 0.6, tent: true }],
      sun: ['sunrise', 1.5, -0.9],
      couch: ['couch', -0.45, -0.12],
      beam: ['beam', -0.45, -0.12, { r: 0.45, h: 2.6, peak: 0.5 }],
    },
    cast: {
      david: ['davidO', 0.2, 0.1, 0.8],
      solomon: ['solomon', -1.4, 0.35, 1],
    },
    beats: {
      enter: [['sun', 'rise'], ['beam', null, { show: 0 }], ['david', 'play', { item: 'lyre', look: 0.7 }], ['solomon', 'idle', { show: 0 }]],
      intro: [['@env', 'dawn'], ['sun', 'low'], ['grass', null, { show: 0 }], ['beam', null, { show: 0 }], ['solomon', 'idle', { show: 0 }], ['david', 'idle', { look: 0.7 }]],
      // 이스라엘의 노래하는 사람 — 수금을 든다
      'p0.1': [['david', 'play', { item: 'lyre', look: 0.7 }]],
      'p0.2': [['david', 'play', { look: 0.4 }]],
      'p0.3': [['david', 'look-up', { item: null, look: 0.6 }]],
      // 구름 없는 아침에 떠오르는 햇살 — 비 온 뒤 땅에서 돋는 새 풀
      'p0.4': [['sun', 'rise'], ['grass', null, { show: 1, delay: 2500 }], ['david', 'idle', { look: 0.9 }]],
      // 노래를 잇는다 — 내 집이 하나님 앞에
      'p1.0': [['david', 'play', { item: 'lyre', look: 0.6 }]],
      'p1.1': [['david', 'raise', { item: null, look: 0.6 }]],
      'p1.2': [['david', 'pray', { look: 0.5 }]],
      // 죽을 날이 가까워지자 솔로몬을 부른다
      'p1.3': [['david', 'idle', { x: -0.42, z: -0.06, look: 0.6 }], ['david', 'sit', { y: 0.13, look: 0.6, delay: 2600 }], ['solomon', 'idle', { show: 1, x: 0.05, z: 0.15, look: -1, delay: 1000 }],
        ['solomon', 'kneel', { delay: 4000 }]],
      'p1.4': [['david', 'sit-speak', { y: 0.13, x: -0.42, z: -0.06, to: 'solomon' }], ['solomon', 'kneel', { x: 0.05, z: 0.15, look: -1 }]],
      'p1.5': [['david', 'sit-speak', { to: 'solomon' }]],
      'p1.6': [['david', 'sit-speak', { to: 'solomon' }]],
      'p1.7': [['david', 'sit', { look: 0.6 }], ['solomon', 'bow']],
      // 조상들과 함께 잠든다 — 빛 속으로
      'p2.0': [['beam', null, { show: 1 }], ['solomon', 'kneel'], ['david', 'pray', { delay: 600 }], ['david', 'pray', { show: 0, delay: 4000 }], ['solomon', 'mourn', { delay: 2000 }]],
      'p2.1': [['david', 'idle', { show: 0 }], ['beam', null, { show: 0, delay: 2500 }]],
      'p2.2': [['beam', null, { show: 0 }], ['solomon', 'idle', { look: 0.4 }]],
      // 구름 없는 아침처럼 떠오를 그의 자손 왕
      'p2.3': [['solomon', 'look-up', { x: 0.35, z: 0.2, look: 0.9 }]],
      w0: [['solomon', 'listen', { look: 0.9 }]],
      w1: [['david', 'sit-speak', { show: 1, to: 'solomon' }]],
      w2: [['david', 'sit-speak', { show: 1, to: 'solomon' }]],
      w3: [['david', 'sit-speak', { show: 1, to: 'solomon' }], ['solomon', 'kneel', { show: 1 }]],
      end: [['david', 'idle', { show: 0 }], ['beam', null, { show: 0 }], ['solomon', 'idle', { show: 1, look: 0.9 }], ['sun', 'rise']],
    },
  },
};

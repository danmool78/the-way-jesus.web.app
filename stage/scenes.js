/* ---------- 장면 연출 (대본이 있는 장면만 무대를 띄운다) ----------
   cast:  이름 → [유형, x, z, 바라보는 방향, {board(탈 배), y, speed, silhouette, gaze:false}]
   props: 이름 → [소품 종류, x, z, {y, scale, rot, …소품별 옵션}]
   env:   기본 분위기(day·dusk·night·storm·calm·overcast·dark). solemn: 몸짓을 절제하는 장면
   wide:  무대를 넓게(인물 크기는 그대로), scale: 무대 전체 축소
   beats: 'enter'(낭독 없이 볼 때의 정지 장면), 'intro'(낭독 시작), 'p0'…(문단), 'p1.3'(문단의 넷째 문장), 'w0'…(말씀), 'end'
   각 동작: [이름, 자세 또는 소품 상태, {x, z, y, look, show, item, board, delay(ms)}]
   이름 '@env'는 분위기 전환: ['@env', 'storm'] */

// 오병이어 군중 자리: 예수 뒤편과 양옆에 두 겹의 활 모양 (앞쪽은 비워 둔다)
const ring = (r, n, a0, a1, squash = 0.7) => Array.from({ length: n }, (_, i) => {
  const a = a0 + (a1 - a0) * (i / (n - 1)) + (Math.random() - 0.5) * 0.08;
  return [Math.cos(a) * r + (Math.random() - 0.5) * 0.08, Math.sin(a) * r * squash + (Math.random() - 0.5) * 0.06];
});
const CROWD = [...ring(1.2, 11, Math.PI + 0.3, Math.PI * 2 - 0.3, 0.62), ...ring(1.58, 13, Math.PI + 0.12, Math.PI * 2 - 0.12, 0.62), [-1.3, 0.25], [-1.6, 0.45], [1.3, 0.27], [1.62, 0.44]];

export const SCRIPTS = {
  /* 1. 수태고지 */
  e01: {
    cast: { mary: ['mary', 0.25, 0, -0.5], gabriel: ['angel', -0.75, -0.1, 0.9], joseph: ['joseph', 1.0, 0.05, -1] },
    beats: {
      enter: [['gabriel', 'bless', { show: 1, y: 0 }], ['mary', 'kneel', { look: -1 }], ['joseph', 'idle', { show: 0 }]],
      intro: [['gabriel', 'idle', { show: 0, y: 2.2 }], ['mary', 'idle', { look: 0.4 }], ['joseph', 'idle', { show: 0 }]],
      'p0.1': [['mary', 'idle', { look: 0 }]],
      'p0.2': [['gabriel', 'idle', { show: 1, y: 0 }], ['mary', 'look-up', { look: -1 }]],
      'p1.0': [['gabriel', 'speak'], ['mary', 'afraid', { x: 0.45 }]],
      'p1.2': [['gabriel', 'bless']],
      'p1.3': [['mary', 'kneel']],
      'p2.0': [['joseph', 'sleep', { show: 1, x: 1.05, z: -0.3 }], ['gabriel', 'idle', { x: 0.62, z: -0.7, look: 1.2 }], ['mary', 'pray', { x: -0.2, look: -0.3 }]],
      'p2.1': [['gabriel', 'speak']],
      'p2.2': [['joseph', 'idle', { x: 0.75, z: 0.05, look: -1 }], ['gabriel', 'bless', { x: -0.7, z: -0.1, look: 0.9 }], ['mary', 'idle', { x: 0.25, look: -0.8 }]],
      w0: [['gabriel', 'speak', { x: -0.6, look: 1 }], ['mary', 'listen', { look: -1 }], ['joseph', 'idle', { show: 0 }]],
      w1: [['mary', 'kneel'], ['gabriel', 'bless']],
      w2: [['joseph', 'sleep', { show: 1, x: 1.05, z: -0.3 }], ['gabriel', 'speak', { x: 0.62, z: -0.7, look: 1.2 }], ['mary', 'pray', { x: -0.2, look: -0.3 }]],
      end: [['joseph', 'idle', { x: 0.7, z: 0.05, look: -1 }], ['mary', 'idle', { x: 0.2, look: -0.8 }], ['gabriel', 'raise', { y: 0.3, x: -0.7, look: 0.8 }]],
    },
  },

  /* 2. 베들레헴의 밤 — 구유(왼쪽)와 목자들의 들판(오른쪽) */
  e02: {
    env: 'night', wide: 1.45,
    props: {
      manger: ['manger', 0.05, 0.08],
      star: ['star', 0.05, -0.3, { y: 1.6 }],
      beam: ['beam', 1.95, -0.45, { r: 0.6 }],
      host: ['host', 1.8, -0.95, { y: 1.3, n: 7, span: 1.7 }],
      sheep1: ['sheep', 2.0, -0.75, { rot: 0.4 }],
      sheep2: ['sheep', 2.35, -0.4, { rot: 2.6 }],
      sheep3: ['sheep', 1.6, 0.05, { rot: -0.3 }],
    },
    cast: {
      mary: ['mary', -0.28, 0.05, 0.9, { gaze: false }],
      joseph: ['joseph', -0.12, -0.3, 0.6, { gaze: false }],
      angel: ['angel', 1.95, -0.65, -0.6],
      sh1: ['shepherd', 1.75, -0.3, -0.6, { speed: 0.42 }],
      sh2: ['shepherd', 2.1, -0.1, -0.9, { speed: 0.42 }],
    },
    beats: {
      enter: [['manger', 'baby'], ['star', null, { show: 1 }], ['beam', null, { show: 0 }], ['host', null, { show: 0 }],
        ['mary', 'kneel', { x: -0.28, z: 0.05, look: 0.9 }], ['joseph', 'idle', { x: -0.12, z: -0.3, look: 0.6 }],
        ['sh1', 'kneel', { x: 0.42, z: 0.12, look: -1.2 }], ['sh2', 'kneel', { x: 0.64, z: -0.12, look: -1.1 }], ['angel', 'idle', { show: 0 }]],
      intro: [['manger', 'empty'], ['star', null, { show: 0 }], ['beam', null, { show: 0 }], ['host', null, { show: 0 }],
        ['mary', 'idle', { x: -1.35, z: 0.1, look: 0.9 }], ['joseph', 'idle', { x: -1.6, z: -0.05, look: 0.9 }],
        ['sh1', 'idle', { x: 1.75, z: -0.3, look: -0.6 }], ['sh2', 'idle', { x: 2.1, z: -0.1, look: -0.9 }], ['angel', 'idle', { show: 0, y: 1.6 }]],
      'p0.1': [['mary', 'idle', { x: -0.28, z: 0.05 }], ['joseph', 'idle', { x: -0.12, z: -0.3 }]],
      'p0.2': [['joseph', 'listen', { look: -0.3 }]],
      'p1.0': [['joseph', 'shrug', { look: -1.1 }], ['mary', 'listen', { look: 0.9 }]],
      'p1.1': [['manger', 'baby'], ['mary', 'kneel', { look: 0.9 }], ['joseph', 'idle', { look: 0.6 }], ['star', null, { show: 1 }]],
      'p1.2': [['joseph', 'pray']],
      'p2.0': [['beam', null, { show: 1 }], ['angel', 'speak', { show: 1, y: 0.35 }], ['sh1', 'cower'], ['sh2', 'cower']],
      'p2.1': [['host', null, { show: 1 }], ['angel', 'raise'], ['sh1', 'idle', { x: 0.42, z: 0.12, look: -1.2, delay: 2600 }], ['sh2', 'idle', { x: 0.64, z: -0.12, look: -1.1, delay: 3000 }], ['beam', null, { show: 0, delay: 3000 }]],
      'p2.2': [['sh1', 'kneel', { look: -1.2 }], ['sh2', 'kneel', { look: -1.1 }], ['angel', 'idle', { show: 0 }], ['host', null, { show: 0 }], ['mary', 'kneel', { look: 0.9 }]],
      w0: [['angel', 'speak', { show: 1, y: 0.35 }], ['beam', null, { show: 1 }]],
      w1: [['host', null, { show: 1 }], ['angel', 'raise']],
      w2: [['host', null, { show: 0 }], ['angel', 'idle', { show: 0 }], ['beam', null, { show: 0 }], ['sh1', 'speak'], ['sh2', 'listen']],
      end: [['sh1', 'kneel', { look: -1.2 }], ['sh2', 'kneel', { look: -1.1 }], ['star', null, { show: 1 }]],
    },
  },

  /* 28. 바람과 바다를 꾸짖으시다 — 호수 위의 배 */
  e28: {
    env: 'calm', wide: 1.15,
    props: {
      water: ['water', 0, 0, { r: 1.75, y: 0.07 }], // 물결 골이 바닥(가림막) 아래로 내려가지 않게 띄운다
      boat: ['boat', 0, 0.05, { y: 0.06, speed: 0.32 }],
      // 가버나움 북쪽 물가(실제 위경도)에 남겨진 무리 — 지도 확대와 상관없이 늘 뭍에 서고 호수 쪽을 본다
      shore: ['crowd', 0, 0, { geo: [32.9, 35.57], faceCenter: true, face: 0, spots: [[-0.34, 0.02], [-0.16, -0.07], [0.02, 0.03], [0.2, -0.06], [0.37, 0.02]] }],
      boat2: ['boat', 1.3, -1.0, { scale: 0.45, y: 0.06 }],
      rain: ['rain', 0, 0],
    },
    cast: {
      jesus: ['jesus', -0.45, 0, 1.2, { board: 'boat' }],
      peter: ['peter', 0.0, 0.02, -1.0, { board: 'boat' }],
      john: ['john', 0.3, -0.06, -1.0, { board: 'boat' }],
      andrew: ['man', 0.55, 0.05, -1.1, { board: 'boat' }],
    },
    beats: {
      enter: [['@env', 'calm'], ['boat', null, { x: 0, z: 0.05 }], ['jesus', 'bless', { look: 1.2 }], ['peter', 'kneel', { x: 0.0, look: -1.1 }], ['john', 'kneel', { look: -1.0 }], ['andrew', 'pray', { look: -1.1 }]],
      intro: [['@env', 'calm'], ['boat', null, { geo: [32.887, 35.574] }], ['jesus', 'idle', { look: 1.0 }], ['peter', 'idle', { x: 0.0, look: -0.4 }], ['john', 'idle', { look: 0.3 }], ['andrew', 'idle', { look: 0.6 }]],
      'p0.0': [['jesus', 'speak']],
      'p0.1': [['boat', null, { x: 0, z: 0.05 }], ['jesus', 'idle'], ['peter', 'idle', { look: 0.8 }]],
      'p0.2': [['@env', 'storm'], ['jesus', 'sleep', { look: 1.2 }], ['peter', 'afraid'], ['john', 'afraid'], ['andrew', 'cower']],
      'p1.0': [['jesus', 'sleep']],
      'p1.1': [['peter', 'kneel', { x: -0.12, look: -1.3 }]],
      'p1.2': [['peter', 'speak']],
      'p1.3': [['john', 'cower'], ['andrew', 'cower']],
      'p2.0': [['jesus', 'rebuke', { look: 1.3 }], ['peter', 'afraid'], ['@env', 'calm', { delay: 1800 }]],
      'p2.1': [['john', 'look-up'], ['andrew', 'look-up'], ['peter', 'idle', { look: -1.2 }]],
      'p2.2': [['jesus', 'speak']],
      'p2.4': [['john', 'speak'], ['andrew', 'listen'], ['peter', 'afraid']],
      w0: [['@env', 'storm'], ['jesus', 'rebuke', { look: 1.3 }], ['@env', 'calm', { delay: 2200 }]],
      w1: [['jesus', 'speak']],
      w2: [['jesus', 'point', { look: 1.3 }]],
      w3: [['john', 'speak']],
      end: [['@env', 'calm'], ['jesus', 'bless', { look: 1.2 }], ['peter', 'kneel', { look: -1.1 }], ['john', 'kneel', { look: -1.0 }], ['andrew', 'pray', { look: -1.1 }]],
    },
  },

  /* 31. 빈 들의 만찬 — 풀밭의 군중, 다섯 덩이와 열두 바구니 */
  e31: {
    env: 'dusk', wide: 1.35, scale: 0.85,
    props: {
      grass: ['grass', 0, 0.05, { r: 1.85 }],
      crowd: ['crowd', 0, 0, { spots: CROWD }],
      baskets: ['baskets', 0, 1.0],
    },
    cast: {
      jesus: ['jesus', 0, 0.15, 0],
      philip: ['disciple', -0.45, 0.3, 0.6],
      andrew: ['man', 0.45, 0.33, -0.6],
      boy: ['child', 0.85, 0.6, -0.8],
    },
    beats: {
      enter: [['@env', 'dusk'], ['crowd', 'sit', { show: 1 }], ['baskets', null, { show: 1 }], ['jesus', 'break', { x: 0, z: 0.15, look: 0 }],
        ['philip', 'hold-basket', { x: -0.55, z: 0.5, look: 0.4 }], ['andrew', 'hold-basket', { x: 0.55, z: 0.53, look: -0.4 }], ['boy', 'sit-ground', { show: 1, x: 0.88, z: 0.63, look: -0.9 }]],
      intro: [['@env', 'day'], ['crowd', 'stand', { show: 0 }], ['baskets', null, { show: 0 }], ['jesus', 'idle', { x: 0, z: 0.15, look: 0 }],
        ['philip', 'idle', { x: -0.45, z: 0.3, look: 0.6 }], ['andrew', 'idle', { x: 0.45, z: 0.33, look: -0.6 }], ['boy', 'idle', { show: 0, x: 1.25, z: 0.6, item: null }]],
      'p0.0': [['philip', 'bow'], ['andrew', 'bow']],
      'p0.1': [['crowd', 'stand', { show: 1 }]],
      'p0.2': [['jesus', 'speak', { look: 0 }], ['@env', 'dusk', { delay: 2500 }]],
      'p1.0': [['jesus', 'speak', { look: -0.9 }]],
      'p1.1': [['philip', 'shrug'], ['andrew', 'shrug']],
      'p1.2': [['boy', 'idle', { show: 1, item: 'basket' }], ['andrew', 'idle', { x: 0.7, z: 0.53, look: 1 }], ['boy', 'hold-basket', { x: 0.3, z: 0.39, look: -1, delay: 2200 }], ['andrew', 'idle', { x: 0.5, z: 0.33, look: -1, delay: 2200 }]],
      'p1.3': [['crowd', 'sit']],
      'p2.0': [['jesus', 'look-up'], ['jesus', 'break', { delay: 1600 }], ['boy', 'sit-ground', { x: 0.32, z: 0.57, look: -0.8, item: null, delay: 600 }],
        ['philip', 'hold-basket', { x: -0.95, z: 0.6, delay: 2600 }], ['andrew', 'hold-basket', { x: 0.95, z: 0.65, delay: 2800 }]],
      'p2.1': [['baskets', null, { show: 1 }], ['philip', 'hold-basket', { x: -0.55, z: 0.5, look: 0.4 }], ['andrew', 'hold-basket', { x: 0.55, z: 0.53, look: -0.4 }]],
      'p2.2': [['jesus', 'idle', { x: -1.5, z: -1.2 }], ['jesus', 'idle', { show: 0, delay: 2600 }]],
      w0: [['jesus', 'speak', { show: 1, x: 0, z: 0.15, look: -0.8 }]],
      w1: [['jesus', 'speak', { look: 0.8 }]],
      w2: [['jesus', 'point', { look: 0.4 }]],
      end: [['@env', 'dusk'], ['jesus', 'break', { show: 1, x: 0, z: 0.15, look: 0 }], ['philip', 'hold-basket', { x: -0.55, z: 0.5, look: 0.4 }], ['andrew', 'hold-basket', { x: 0.55, z: 0.53, look: -0.4 }]],
    },
  },

  /* 55. 골고다 — 절제된 표현: 십자가는 멀리 윤곽으로만, 고통·폭력은 그리지 않는다.
     조롱과 십자가 지기(p0.0–p0.1)는 낭독만 하고 무대는 비워 둔다. 사람들은 십자가를 향해 등을 보인다. */
  e55: {
    env: 'dusk', wide: 1.2, solemn: true,
    props: {
      hill: ['hill', 0, -0.6, { w: 1.55, h: 0.3, d: 0.75 }],
      crosses: ['crosses', 0, -0.55, { y: 0.2 }],
      beam: ['beam', 0, -0.5, { r: 0.35, h: 3 }],
      tomb: ['tomb', 1.3, -0.2, { scale: 0.85, rot: -0.4 }],
    },
    cast: {
      jesus: ['crossed', 0, -0.5, 0, { silhouette: true, y: 0.5, gaze: false }],
      // 양옆 십자가의 두 죄수 — '회개한 죄수' 이야기가 나올 때 나타난다
      thief1: ['thief', -0.62, -0.62, 0, { silhouette: true, y: 0.36, gaze: false }],
      thief2: ['thief', 0.62, -0.62, 0, { silhouette: true, y: 0.36, gaze: false }],
      // 로마 병사 둘: 창을 세우고 가만히 서 있기만 한다
      soldier1: ['soldier', -1.05, -0.2, 0.5, { gaze: false }],
      soldier2: ['soldier', 0.82, -0.5, -0.6, { gaze: false }],
      mary: ['mary', 0.3, 0.35, 2.5],
      john: ['john', 0.58, 0.22, 2.6],
      magdalene: ['woman', -0.3, 0.38, -2.5],
      salome: ['woman2', -0.62, 0.24, -2.6],
      josephA: ['pharisee', 1.85, 0.3, -1.3],
      nicodemus: ['elder', 2.05, 0.05, -1.3],
    },
    beats: {
      enter: [['@env', 'dusk'], ['jesus', 'crucified-dead', { show: 1 }], ['thief1', 'crucified-dead', { show: 1 }], ['thief2', 'crucified-dead', { show: 1 }], ['soldier1', 'idle', { show: 1 }], ['soldier2', 'idle', { show: 1 }], ['beam', null, { show: 0 }], ['tomb', 'open'],
        ['mary', 'mourn', { show: 1, x: 0.3, z: 0.35, look: 2.5 }], ['john', 'pray', { show: 1, x: 0.5, z: 0.32, look: 2.6 }],
        ['magdalene', 'mourn', { show: 1, x: -0.3, z: 0.38, look: -2.5 }], ['salome', 'kneel', { show: 1, x: -0.62, z: 0.24, look: -2.6 }],
        ['josephA', 'idle', { show: 0 }], ['nicodemus', 'idle', { show: 0 }]],
      intro: [['@env', 'overcast'], ['jesus', 'crucified', { show: 0 }], ['thief1', 'crucified', { show: 0 }], ['thief2', 'crucified', { show: 0 }], ['soldier1', 'idle', { show: 0 }], ['soldier2', 'idle', { show: 0 }], ['beam', null, { show: 0 }], ['tomb', 'open'],
        ['mary', 'idle', { show: 0, x: 1.4, z: 0.4 }], ['john', 'idle', { show: 0, x: 1.65, z: 0.25 }],
        ['magdalene', 'idle', { show: 0, x: -1.4, z: 0.42 }], ['salome', 'idle', { show: 0, x: -1.65, z: 0.25 }],
        ['josephA', 'idle', { show: 0, x: 1.85, z: 0.3 }], ['nicodemus', 'idle', { show: 0, x: 2.05, z: 0.05 }]],
      'p0.2': [['jesus', 'crucified', { show: 1 }], ['soldier1', 'idle', { show: 1 }], ['soldier2', 'idle', { show: 1 }]],
      'p1.0': [['@env', 'dark'], ['mary', 'idle', { show: 1 }], ['john', 'idle', { show: 1 }], ['magdalene', 'idle', { show: 1 }], ['salome', 'idle', { show: 1 }]],
      'p1.1': [['thief1', 'crucified', { show: 1 }], ['thief2', 'crucified', { show: 1 }], ['mary', 'idle', { x: 0.3, z: 0.35, look: 2.5 }], ['john', 'idle', { x: 0.58, z: 0.22, look: 2.6 }], ['magdalene', 'idle', { x: -0.3, z: 0.38, look: -2.5 }], ['salome', 'idle', { x: -0.62, z: 0.24, look: -2.6 }],
        ['mary', 'kneel', { delay: 2800 }], ['magdalene', 'kneel', { delay: 2800 }], ['salome', 'kneel', { delay: 3000 }], ['john', 'pray', { x: 0.5, z: 0.32, delay: 4500 }]],
      'p1.2': [['jesus', 'crucified-dead'], ['mary', 'mourn'], ['magdalene', 'mourn'], ['soldier1', 'look-up']],
      'p2.0': [['@env', 'dusk'], ['josephA', 'idle', { show: 1, x: 1.05, z: 0.32, look: -2.6 }]],
      'p2.1': [['nicodemus', 'idle', { show: 1, x: 1.35, z: 0.18, look: -2.4 }], ['jesus', 'crucified-dead', { show: 0 }], ['thief1', 'crucified-dead', { show: 0 }], ['thief2', 'crucified-dead', { show: 0 }], ['soldier1', 'idle', { show: 0 }], ['soldier2', 'idle', { show: 0 }], ['josephA', 'bow', { delay: 2500 }], ['nicodemus', 'bow', { delay: 2700 }]],
      'p2.2': [['tomb', 'closed'], ['josephA', 'bow', { look: 0.6 }], ['nicodemus', 'bow', { look: 0.4 }]],
      w0: [['@env', 'dark'], ['josephA', 'idle', { show: 0 }], ['nicodemus', 'idle', { show: 0 }], ['tomb', 'open'], ['jesus', 'crucified', { show: 1 }], ['thief1', 'crucified', { show: 1 }], ['thief2', 'crucified', { show: 1 }], ['soldier1', 'idle', { show: 1 }], ['soldier2', 'idle', { show: 1 }], ['mary', 'kneel'], ['magdalene', 'kneel']],
      w2: [['john', 'pray', { x: 0.42, z: 0.38 }]],
      w5: [['beam', null, { show: 1 }], ['jesus', 'crucified-dead']],
      w6: [['beam', null, { show: 0, delay: 5000 }], ['mary', 'mourn'], ['magdalene', 'mourn'], ['salome', 'mourn']],
      end: [['@env', 'dusk'], ['jesus', 'crucified-dead', { show: 1 }], ['thief1', 'crucified-dead', { show: 1 }], ['thief2', 'crucified-dead', { show: 1 }], ['soldier1', 'idle', { show: 1 }], ['soldier2', 'idle', { show: 1 }], ['beam', null, { show: 0 }]],
    },
  },
};

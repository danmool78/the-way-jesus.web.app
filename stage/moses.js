/* ---------- 모세와 여호수아 여정의 장면 연출 (stage/scenes.js의 SCRIPTS에 합쳐진다) ----------
   형식은 scenes.js와 같다. 애굽 사람은 흰 허리치마·가발·목걸이(egyptian·pharaoh·princess…), 히브리 사람은 긴 옷과 수염(hebrew·woman…)으로 한눈에 갈리게.
   연출 원칙(STAGE.md): 죽음과 폭력은 그리지 않는다 — 애굽 사람을 친 일, 맏아들의 죽음, 바다에 잠긴 병거는 낭독과 빛으로만.
   하나님은 모습 없이 빛(beam)·불꽃·기둥으로만 */

// 무리(crowd)의 자리: 가운데(cx, cz)를 둘러 n명을 흩어 놓는다
const flock = (n, rx, rz, seed = 1) => Array.from({ length: n }, (_, i) => {
  const a = i * 2.399 + seed, r = Math.sqrt((i + 0.5) / n);
  return [Math.cos(a) * r * rx, Math.sin(a) * r * rz];
});

export const MOSES = {
  /* m01. 애굽의 종살이 — 뒤로 쌓다 만 국고성의 흙벽돌 성벽, 앞에 벽돌 더미. 히브리 사람은 허리 굽혀 일하고 감독관이 막대를 든다.
     바로는 오른쪽에서 명령하고, 산파 둘이 그 앞에 선다. 사내아이를 강에 던지라는 명령은 낭독으로만 — 무대는 저물어 간다 */
  m01: {
    wide: 1.35,
    props: {
      sand: ['sand', 0, 0, { r: 1.9 }],
      wall: ['brickwall', -0.35, -0.62, { w: 1.9, h: 0.62 }],
      bricks: ['bricks', -0.55, 0.42, { n: 3 }],
      bricks2: ['bricks', 0.25, 0.5, { n: 2 }],
      folk: ['crowd', -1.25, -0.2, { spots: flock(9, 0.35, 0.3), face: 0.6 }],
    },
    cast: {
      h1: ['hebrew', -0.75, 0.12, 0.3],
      h2: ['hebrew2', -0.35, 0.05, -0.4],
      h3: ['hebrew', 0.05, 0.2, 0.6],
      boss: ['taskmaster', 0.45, -0.1, -1],
      pharaoh: ['pharaoh', 1.2, -0.2, -1],
      scribe: ['egyptian', 1.5, 0.05, -1.2],
      mid1: ['woman', 0.7, 0.35, 1.1],
      mid2: ['woman2', 0.88, 0.5, 1.2],
    },
    beats: {
      enter: [['folk', null, { show: 1 }], ['h1', 'bow'], ['h2', 'bow'], ['h3', 'bow'], ['boss', 'point', { look: -1 }], ['pharaoh', 'idle', { show: 1 }], ['scribe', 'idle', { show: 1 }], ['mid1', 'idle', { show: 0 }], ['mid2', 'idle', { show: 0 }]],
      intro: [['folk', null, { show: 0 }], ['h1', 'idle', { look: 0.3 }], ['h2', 'idle', { look: -0.4 }], ['h3', 'idle', { look: 0.6 }], ['boss', 'idle', { show: 0 }], ['pharaoh', 'idle', { show: 0 }], ['scribe', 'idle', { show: 0 }], ['mid1', 'idle', { show: 0 }], ['mid2', 'idle', { show: 0 }]],
      // 일흔 식구가 들판을 메울 만큼 불어나고
      'p0.1': [['folk', null, { show: 1 }]],
      // 요셉을 알지 못하는 새 왕
      'p0.2': [['pharaoh', 'idle', { show: 1 }], ['scribe', 'idle', { show: 1 }], ['h1', 'listen', { look: 1 }], ['h2', 'listen', { look: 1 }], ['h3', 'listen', { look: 1 }]],
      // 진흙을 이기고 벽돌을 굽는 소리 — 허리를 굽히고, 감독관이 막대로 몰아붙인다
      'p1.0': [['h1', 'bow', { look: 0.3 }], ['h2', 'bow', { look: -0.4 }], ['h3', 'bow', { look: 0.6 }]],
      'p1.1': [['boss', 'rebuke', { show: 1, x: 0.4, z: -0.05, look: -1 }]],
      'p1.3': [['boss', 'point', { look: -1 }]],
      // 산파 십브라와 부아가 바로 앞에 선다
      'p2.0': [['mid1', 'idle', { show: 1, x: 0.72, z: 0.3, look: 1 }], ['mid2', 'idle', { show: 1, x: 0.92, z: 0.45, look: 1.1 }], ['boss', 'idle', { show: 0 }]],
      'p2.3': [['pharaoh', 'rebuke', { to: 'mid1' }]],
      'p2.4': [['@env', 'dusk'], ['mid1', 'mourn'], ['mid2', 'mourn']],
      'p2.5': [['@env', 'dusk'], ['pharaoh', 'idle', { show: 0 }], ['scribe', 'idle', { show: 0 }], ['h1', 'mourn'], ['h2', 'mourn'], ['h3', 'mourn']],
      w0: [['pharaoh', 'speak', { show: 1, to: 'scribe' }], ['scribe', 'idle', { show: 1 }]],
      w1: [['mid1', 'speak', { to: 'pharaoh' }]],
      w2: [['pharaoh', 'speak', { show: 1, to: 'mid1' }]],
      end: [['@env', 'dusk']],
    },
  },

  /* m02. 나일강의 갈대 상자 — 앞쪽은 강물, 물가에 파피루스. 어머니가 상자를 띄우고, 누이는 멀찍이 지켜본다.
     바로의 딸과 시녀가 오른쪽에서 내려와 상자를 연다 */
  m02: {
    wide: 1.3,
    props: {
      sand: ['sand', -0.3, -0.25, { r: 1.5, color: '#bfae7e' }],
      river: ['water', 0.2, 0.75, { r: 1.2, y: 0.05, size: [1.6, 1, 0.5] }],
      reeds: ['reeds', 0, 0.3, { spots: [[-0.9, 0.35], [-0.35, 0.42], [0.55, 0.38], [1.05, 0.3]], n: 8 }],
      ark: ['ark', -0.7, 0.0],
      palm: ['palm', 1.35, -0.45, { h: 1.0 }],
    },
    cast: {
      mother: ['mother', -0.95, -0.1, 0.4],
      sister: ['sister', -1.25, -0.35, 0.8],
      princess: ['princess', 0.42, 0.24, -0.6],
      maid: ['egywoman', 0.75, 0.05, -0.8],
      maid2: ['egywoman', 1.0, -0.15, -0.9],
    },
    beats: {
      enter: [['ark', 'open', { x: 0.2, z: 0.45 }], ['mother', 'idle', { show: 0 }], ['sister', 'idle', { x: -0.3, z: 0.05, look: 0.8 }], ['princess', 'kneel', { x: 0.42, z: 0.24, look: -0.4 }], ['maid', 'idle', { show: 1 }], ['maid2', 'idle', { show: 1 }]],
      intro: [['ark', 'closed', { show: 0, x: -0.7, z: 0.05 }], ['mother', 'carry', { show: 1, x: -0.95, z: -0.1, look: 0.4 }], ['sister', 'idle', { show: 1, x: -1.25, z: -0.35, look: 0.8 }],
        ['princess', 'idle', { show: 0, x: 1.7, z: 0.0 }], ['maid', 'idle', { show: 0, x: 1.9, z: -0.1 }], ['maid2', 'idle', { show: 0, x: 2.0, z: -0.25 }]],
      // 석 달을 숨겨 기른 아기 — 울음이 커질수록 숨길 곳이 줄어든다
      'p0.2': [['mother', 'carry', { look: -0.8 }]],
      // 파피루스 상자를 엮어 역청을 바른다
      'p0.3': [['ark', 'closed', { show: 1 }], ['mother', 'kneel', { x: -0.85, z: -0.05, look: 0.6 }]],
      // 갈대 사이에 띄우고 — 어머니는 돌아서 가고 누이가 지켜본다
      'p1.0': [['mother', 'idle', { x: -0.35, z: 0.22, look: 0.3 }], ['ark', 'closed', { x: -0.2, z: 0.45, delay: 2400 }], ['mother', 'kneel', { delay: 2000 }]],
      'p1.1': [['mother', 'idle', { x: -1.6, z: -0.3, look: -1 }], ['mother', 'idle', { show: 0, delay: 2600 }], ['sister', 'idle', { x: -0.9, z: -0.3, look: 0.7 }], ['ark', 'closed', { x: 0.2, z: 0.48 }]],
      // 목욕하러 내려온 바로의 딸
      'p2.0': [['princess', 'idle', { show: 1, x: 0.45, z: 0.24, look: -0.5 }], ['maid', 'idle', { show: 1, x: 0.8, z: 0.05, look: -0.8 }], ['maid2', 'idle', { show: 1, x: 1.05, z: -0.15, look: -0.9 }]],
      'p2.2': [['ark', 'open'], ['princess', 'kneel', { look: -0.4 }]],
      // 누이의 재치로 아기는 어머니 품에
      'p2.6': [['mother', 'idle', { show: 1, x: -0.2, z: 0.05, look: 0.8 }], ['princess', 'idle'], ['mother', 'carry', { delay: 2600 }], ['ark', 'open', { show: 0, delay: 2600 }]],
      'p2.7': [['princess', 'bless', { to: 'mother' }]],
      w0: [['princess', 'speak', { to: 'maid' }]],
      w1: [['sister', 'idle', { x: 0.05, z: -0.05, look: 0.8 }], ['sister', 'speak', { to: 'princess', delay: 1800 }]],
      w2: [['princess', 'speak', { to: 'mother' }]],
      end: [],
    },
  },

  /* m03. 미디안으로 도망하다 — 장면이 애굽(skeleton의 from: 라암셋)에서 시작한다: 궁에서 자란 모세(애굽 옷)가 동족을 보러 나간다. 애굽 사람을 친 일은 그리지 않는다
     (감독관이 사라질 뿐). 낭독이 p1.3(미디안으로 달아났다)에 이르면 지도가 미디안까지 걸어가고(app.js moveWithin), 무대는 그곳 우물가로 — 목자로 다시 나타난다 */
  m03: {
    wide: 1.35,
    props: {
      sand: ['sand', 0, 0, { r: 1.9, color: '#c9a878' }],
      well: ['well', 0.1, -0.05],
      tent: ['tent', 1.15, -0.6, { w: 0.85 }],
      flock: ['sheep', -0.5, -0.35],
      flock2: ['sheep', -0.75, -0.15, { rot: 0.6 }],
      flock3: ['sheep', -0.35, -0.6, { rot: -0.4 }],
      bricks: ['bricks', -0.6, 0.35, { n: 2 }],
    },
    cast: {
      prince: ['mosesP', -1.2, 0.0, 0.5],
      slave: ['hebrew', -0.45, 0.25, -0.6],
      boss: ['taskmaster', -0.1, 0.1, -1],
      slave2: ['hebrew2', 0.05, 0.3, -1],
      moses: ['mosesS', -1.3, 0.15, 1],
      sh1: ['shepherd', 0.55, 0.3, -1],
      sh2: ['shepherd', 0.8, 0.12, -1.1],
      d1: ['woman', -0.15, 0.15, 0.4],
      d2: ['woman2', 0.0, 0.32, 0.2],
      d3: ['samaritan', -0.32, 0.38, 0.6],
      zip: ['woman', 0.4, -0.25, -0.6],
      reuel: ['elder', 1.0, -0.25, -0.8],
    },
    beats: {
      // 장면은 애굽(from: 라암셋)에서 시작한다 — 동족이 일하는 곳을 내려다보는 궁의 모세. 미디안의 우물가는 낭독이 p1.3에서 그곳으로 옮겨 간 뒤에
      enter: [['well', null, { show: 0 }], ['tent', null, { show: 0 }], ['flock', null, { show: 0 }], ['flock2', null, { show: 0 }], ['flock3', null, { show: 0 }], ['bricks', null, { show: 1 }],
        ['prince', 'idle', { show: 1, x: -0.85, z: 0.05, look: 0.6 }], ['slave', 'bow', { show: 1 }], ['boss', 'point', { show: 1, look: -1 }], ['slave2', 'idle', { show: 0 }],
        ['moses', 'idle', { show: 0 }], ['sh1', 'idle', { show: 0 }], ['sh2', 'idle', { show: 0 }], ['d1', 'idle', { show: 0 }], ['d2', 'idle', { show: 0 }], ['d3', 'idle', { show: 0 }], ['zip', 'idle', { show: 0 }], ['reuel', 'idle', { show: 0 }]],
      intro: [['well', null, { show: 0 }], ['tent', null, { show: 0 }], ['flock', null, { show: 0 }], ['flock2', null, { show: 0 }], ['flock3', null, { show: 0 }], ['bricks', null, { show: 1 }],
        ['prince', 'idle', { show: 1, x: -1.2, z: 0.0, look: 0.5 }], ['slave', 'bow', { show: 1 }], ['boss', 'idle', { show: 1 }], ['slave2', 'idle', { show: 0 }],
        ['moses', 'idle', { show: 0, x: -1.6, z: 0.15 }], ['sh1', 'idle', { show: 0 }], ['sh2', 'idle', { show: 0 }], ['d1', 'idle', { show: 0 }], ['d2', 'idle', { show: 0 }], ['d3', 'idle', { show: 0 }], ['zip', 'idle', { show: 0 }], ['reuel', 'idle', { show: 0 }]],
      // 동족이 일하는 곳 — 감독관이 히브리 사람을 몰아붙이고, 모세는 좌우를 살핀다
      'p0.0': [['prince', 'idle', { x: -0.85, z: 0.05, look: 0.6 }]],
      'p0.1': [['boss', 'rebuke', { to: 'slave' }], ['slave', 'cower'], ['prince', 'idle', { look: -1.3, delay: 1200 }], ['prince', 'idle', { look: 1.3, delay: 2600 }], ['boss', 'idle', { show: 0, delay: 4200 }]],
      'p0.3': [['slave', 'idle', { show: 0 }], ['prince', 'idle', { look: 0.3 }]],
      // 이튿날 다투는 두 히브리 사람
      'p1.0': [['slave', 'rebuke', { show: 1, x: -0.4, z: 0.2, look: 1 }], ['slave2', 'afraid', { show: 1, x: -0.05, z: 0.25, look: -1 }], ['prince', 'idle', { x: -0.25, z: 0.0, look: 0.4 }]],
      'p1.4': [['prince', 'afraid', { look: -0.8 }]],
      'p1.5': [['@env', 'overcast']],
      // 모든 것을 두고 동쪽 광야로 — 애굽의 자리는 사라진다
      'p1.6': [['prince', 'idle', { x: 1.7, z: 0.1 }], ['prince', 'idle', { show: 0, delay: 3200 }], ['slave', 'idle', { show: 0, delay: 600 }], ['slave2', 'idle', { show: 0, delay: 600 }], ['bricks', null, { show: 0, delay: 600 }]],
      // 미디안의 우물가: 일곱 자매가 쫓겨나고, 모세가 그들을 돕는다
      'p2.0': [['@env', 'day'], ['well', null, { show: 1 }], ['flock', null, { show: 1 }], ['flock2', null, { show: 1 }], ['flock3', null, { show: 1 }],
        ['d1', 'afraid', { show: 1 }], ['d2', 'afraid', { show: 1 }], ['d3', 'idle', { show: 1 }], ['sh1', 'rebuke', { show: 1, to: 'd2' }], ['sh2', 'point', { show: 1, look: -1 }],
        ['moses', 'idle', { show: 1, x: -0.6, z: 0.05, look: 1, delay: 1500 }], ['moses', 'rebuke', { to: 'sh1', delay: 3600 }],
        ['sh1', 'idle', { x: 1.6, z: 0.4, delay: 5200 }], ['sh2', 'idle', { x: 1.7, z: 0.2, delay: 5200 }], ['sh1', 'idle', { show: 0, delay: 7600 }], ['sh2', 'idle', { show: 0, delay: 7600 }],
        ['moses', 'bow', { x: -0.05, z: 0.18, look: 0.4, delay: 6000 }], ['d1', 'idle', { delay: 5000 }], ['d2', 'idle', { delay: 5000 }]],
      // 르우엘의 장막 — 십보라와 혼인한다
      'p2.2': [['tent', null, { show: 1 }], ['reuel', 'idle', { show: 1, x: 0.85, z: -0.2, look: -1 }], ['zip', 'idle', { show: 1, x: 0.25, z: 0.15, look: -1 }], ['moses', 'idle', { x: -0.05, z: 0.2, look: 0.6 }],
        ['d1', 'idle', { x: -0.55, z: 0.3 }], ['d2', 'idle', { x: -0.75, z: 0.45 }], ['d3', 'idle', { x: -0.95, z: 0.3 }]],
      // 그 사이 애굽에서는 탄식이 하늘에 닿았다
      'p2.5': [['@env', 'dusk'], ['moses', 'look-up', { look: -0.8 }]],
      w0: [['slave', 'speak', { show: 1, x: -0.5, z: 0.35, to: 'moses' }]],
      w1: [['slave', 'idle', { show: 0 }], ['reuel', 'speak', { to: 'd2' }]],
      w2: [['moses', 'speak', { to: 'zip' }]],
      end: [['@env', 'dusk']],
    },
  },

  /* m04. 불붙은 떨기나무 — 호렙의 바위 비탈. 떨기나무가 불에 휩싸였으나 타 없어지지 않는다. 하나님은 불꽃 속의 음성으로만.
     모세는 신을 벗고 얼굴을 가린다(무릎 꿇어 엎드림). 지팡이가 뱀이 되는 표적은 잠깐 */
  m04: {
    wide: 1.2,
    props: {
      sand: ['sand', 0, 0, { r: 1.7, color: '#b39a78', stones: 24 }],
      rocks: ['rocks', 0, 0, { spots: [[0.9, -0.55, 0.22], [1.15, -0.25, 0.15], [-1.1, -0.5, 0.2], [0.55, -0.75, 0.14], [-0.6, 0.55, 0.1]] }],
      bush: ['bush', 0.55, -0.25, { scale: 1.3 }],
      flock: ['sheep', -1.0, 0.1, { rot: 0.5 }],
      flock2: ['sheep', -1.25, -0.15, { rot: -0.3 }],
      serpent: ['serpent', -0.05, 0.2],
    },
    cast: {
      moses: ['mosesS', -0.6, 0.15, 1],
    },
    beats: {
      enter: [['bush', 'fire'], ['serpent', 'rest', { show: 0 }], ['moses', 'kneel', { x: 0.05, z: 0.05, look: 1 }]],
      intro: [['bush', 'plain'], ['serpent', 'rest', { show: 0 }], ['moses', 'idle', { x: -1.5, z: 0.25, look: 1 }]],
      'p0.0': [['moses', 'idle', { x: -0.65, z: 0.15, look: 1 }]],
      'p0.2': [['bush', 'fire']],
      'p0.4': [['moses', 'look-up', { look: 1 }]],
      // 가까이 다가가는 그를 부르는 음성
      'p1.0': [['moses', 'idle', { x: -0.05, z: 0.08, look: 1 }]],
      'p1.1': [['moses', 'afraid', { look: 1 }]],
      // 신을 벗고, 얼굴을 가린다
      'p1.5': [['moses', 'kneel', { look: 1 }], ['moses', 'bow', { delay: 2200 }]],
      'p1.7': [['moses', 'kneel', { look: 1 }]],
      // 이제 가거라, 너를 바로에게 보내겠다
      'p2.0': [['moses', 'listen', { look: 1 }]],
      // 제가 누구라고
      'p2.3': [['moses', 'shrug', { look: 1 }]],
      'p2.4': [['moses', 'idle', { x: -0.3, z: 0.12, look: 1 }]],
      // 지팡이가 뱀이 되는 표적
      'p2.9': [['serpent', 'hiss', { show: 1 }], ['moses', 'afraid', { look: 0.3 }], ['serpent', 'rest', { show: 0, delay: 3800 }], ['moses', 'listen', { look: 1, delay: 4200 }]],
      'p2.11': [['moses', 'bow', { look: 1 }]],
      w0: [['moses', 'listen', { look: 1 }]],
      w1: [['moses', 'listen', { look: 1 }]],
      w2: [['moses', 'listen', { look: 1 }]],
      w3: [['moses', 'speak', { look: 1 }]],
      end: [['moses', 'kneel', { look: 1 }]],
    },
  },

  /* m05. 바로 앞에 서다 — 오른쪽은 기둥 사이 보좌의 바로, 왼쪽은 짚 없이 벽돌을 만드는 들판. 모세와 아론이 가운데 선다 */
  m05: {
    wide: 1.35,
    props: {
      sand: ['sand', -0.6, 0.05, { r: 1.2 }],
      cols: ['egcolumns', 0.95, -0.55, { w: 1.0, h: 1.15 }],
      throne: ['throne', 0.95, -0.35],
      bricks: ['bricks', -1.0, 0.4, { n: 2 }],
    },
    cast: {
      pharaoh: ['pharaoh', 0.95, -0.27, -0.3, { y: 0.12 }],
      scribe: ['egyptian', 1.4, -0.05, -0.9],
      boss: ['taskmaster', -0.55, -0.35, -0.6],
      moses: ['mosesE', -0.25, 0.15, 0.8],
      aaron: ['aaron', -0.0, 0.3, 0.8],
      h1: ['hebrew', -1.15, 0.0, 0.3],
      h2: ['hebrew2', -0.85, 0.25, -0.3],
    },
    beats: {
      enter: [['pharaoh', 'sit'], ['moses', 'idle', { look: 0.8 }], ['aaron', 'speak', { to: 'pharaoh' }], ['h1', 'bow'], ['h2', 'bow'], ['boss', 'point', { look: -0.6 }]],
      intro: [['pharaoh', 'sit'], ['moses', 'idle', { x: -1.6, z: 0.2, show: 0 }], ['aaron', 'idle', { x: -1.7, z: 0.4, show: 0 }], ['h1', 'idle', { show: 0 }], ['h2', 'idle', { show: 0 }], ['boss', 'idle', { show: 0 }]],
      'p0.0': [['moses', 'idle', { show: 1, x: -0.25, z: 0.15, look: 0.8 }], ['aaron', 'idle', { show: 1, x: 0.0, z: 0.3, look: 0.8 }]],
      'p0.1': [['aaron', 'speak', { to: 'pharaoh' }]],
      'p0.5': [['pharaoh', 'rebuke', { to: 'aaron' }]],
      'p0.7': [['pharaoh', 'sit'], ['@env', 'overcast']],
      // 짚 없이 벽돌을 — 들판을 헤매고, 반장들이 매를 맞는다(감독관의 막대만)
      'p1.0': [['h1', 'bow', { show: 1 }], ['h2', 'bow', { show: 1 }], ['boss', 'rebuke', { show: 1, to: 'h1' }]],
      'p1.4': [['h1', 'idle', { x: -1.35, z: -0.2, look: -1 }], ['h2', 'bow', { x: -0.9, z: 0.45 }], ['h1', 'cower', { delay: 2600 }]],
      // 원망이 모세에게
      'p2.0': [['boss', 'idle', { show: 0 }], ['h1', 'rebuke', { x: -0.7, z: 0.05, to: 'moses' }], ['h2', 'rebuke', { x: -0.6, z: 0.35, to: 'moses' }], ['moses', 'idle', { look: -1 }]],
      'p2.2': [['h1', 'idle', { show: 0 }], ['h2', 'idle', { show: 0 }], ['moses', 'kneel', { look: -0.3 }]],
      'p2.3': [['moses', 'look-up', { look: -0.3 }]],
      'p2.5': [['moses', 'pray', { look: -0.3 }]],
      'p2.8': [['h1', 'bow', { show: 1, x: -1.15, z: 0.0 }], ['h2', 'bow', { show: 1, x: -0.85, z: 0.25 }]],
      w0: [['moses', 'listen', { look: 0 }]],
      w1: [['moses', 'listen', { look: 0 }]],
      w2: [['pharaoh', 'speak', { to: 'moses' }]],
      end: [],
    },
  },

  /* m06. 열 가지 재앙 — 앞의 나일이 붉어지고, 개구리·파리·우박·메뚜기·어둠이 차례로. 어둠 속에서도 왼쪽 고센의 집에는 빛.
     맏이의 죽음은 알리는 말까지만 — 무대는 무거운 침묵 */
  m06: {
    wide: 1.4,
    props: {
      sand: ['sand', 0, -0.2, { r: 1.6 }],
      river: ['water', 0.2, 0.62, { r: 1.2, y: 0.05, size: [1.7, 1, 0.5] }],
      cols: ['egcolumns', 1.0, -0.6, { w: 0.9, h: 1.1 }],
      house: ['house', -1.25, -0.55, { scale: 0.7, stair: false }],
      light: ['beam', -1.25, -0.3, { r: 0.55, h: 2.6, peak: 0.6 }],
      frogs: ['frogs', 0.3, 0.1, { r: 1.0 }],
      swarm: ['swarm', 0.4, -0.1],
      hail: ['rain', 0.4, 0],
    },
    cast: {
      moses: ['mosesE', -0.3, 0.25, 0.8],
      aaron: ['aaron', -0.6, 0.15, 0.7],
      pharaoh: ['pharaoh', 0.95, -0.2, -0.8],
      mag1: ['magician', 1.35, -0.05, -1],
      mag2: ['magician', 1.25, 0.25, -1.1],
    },
    beats: {
      enter: [['river', 'blood'], ['frogs', null, { show: 0 }], ['swarm', null, { show: 0 }], ['hail', null, { show: 0 }], ['light', null, { show: 0 }], ['moses', 'raise', { look: 0.6 }], ['pharaoh', 'afraid', { look: -1 }]],
      intro: [['river', 'idle'], ['frogs', null, { show: 0 }], ['swarm', null, { show: 0 }], ['hail', null, { show: 0 }], ['light', null, { show: 0 }], ['moses', 'idle', { look: 0.8 }], ['pharaoh', 'idle', { look: -0.8 }]],
      'p0.0': [['moses', 'raise', { look: 0.4 }], ['river', 'blood', { delay: 1200 }], ['moses', 'idle', { delay: 4000 }]],
      'p0.2': [['frogs', null, { show: 1 }], ['pharaoh', 'afraid']],
      'p0.4': [['mag1', 'bow'], ['mag2', 'bow']],
      // 파리 떼 — 고센 땅만은 비켜 간다
      'p1.0': [['frogs', null, { show: 0 }], ['swarm', null, { show: 1 }], ['mag1', 'idle'], ['mag2', 'idle']],
      'p1.3': [['swarm', null, { show: 0 }], ['@env', 'storm'], ['hail', null, { show: 1 }], ['pharaoh', 'cower']],
      'p1.4': [['hail', null, { show: 0 }], ['@env', 'overcast'], ['swarm', null, { show: 1 }], ['swarm', null, { show: 0, delay: 3500 }], ['@env', 'dark', { delay: 3500 }]],
      // 어둠 속에서도 이스라엘 자손이 사는 곳에는 빛
      'p2.0': [['@env', 'dark'], ['light', null, { show: 1 }]],
      'p2.1': [['@env', 'overcast'], ['light', null, { show: 0 }], ['pharaoh', 'bow'], ['pharaoh', 'rebuke', { to: 'moses', delay: 2600 }]],
      'p2.3': [['moses', 'speak', { to: 'pharaoh' }]],
      'p2.4': [['moses', 'idle', { look: 0.8 }]],
      'p2.5': [['@env', 'dusk'], ['pharaoh', 'idle', { look: -0.6 }], ['aaron', 'mourn'], ['moses', 'mourn']],
      w0: [['moses', 'speak', { to: 'pharaoh' }]],
      w1: [['moses', 'speak', { to: 'pharaoh' }]],
      w2: [['mag1', 'speak', { to: 'pharaoh' }]],
      end: [['@env', 'dusk']],
    },
  },

  /* m07. 첫 유월절 — 해 질 녘 히브리 집의 문설주에 피를 바르고, 밤에 서서 서둘러 먹는다. 애굽의 통곡은 그리지 않는다(어둠과 기도만).
     한밤중 바로가 모세와 아론을 불러 떠나라 하고, 백성은 반죽 그릇을 메고 오른쪽(동쪽)으로 나선다 */
  m07: {
    env: 'dusk', wide: 1.35,
    props: {
      sand: ['sand', 0, 0, { r: 1.8, color: '#bfa982' }],
      house: ['house', -0.75, -0.55, { blood: true }],
      house2: ['house', 0.55, -0.75, { scale: 0.8, stair: false, blood: true }],
      lamb: ['sheep', -0.2, 0.3, { rot: 0.4 }],
      fire: ['fire', -0.35, 0.05],
      folk: ['crowd', 1.0, 0.25, { spots: flock(10, 0.45, 0.25, 3), face: Math.PI / 2 }],
    },
    cast: {
      father: ['hebrew', -0.6, 0.1, 0.5],
      mom: ['woman', -0.15, -0.05, -0.6],
      kid: ['child', -0.45, -0.15, 0.3],
      h2: ['hebrew2', -0.05, 0.3, -0.8],
      moses: ['mosesE', 0.9, -0.05, -1],
      aaron: ['aaron', 1.15, 0.12, -1],
      pharaoh: ['pharaoh', 1.45, -0.25, -1],
    },
    beats: {
      enter: [['@env', 'night'], ['house', 'blood'], ['house2', 'blood'], ['lamb', null, { show: 0 }], ['folk', null, { show: 0 }], ['moses', 'idle', { show: 0 }], ['aaron', 'idle', { show: 0 }], ['pharaoh', 'idle', { show: 0 }],
        ['father', 'break', { item: null }], ['mom', 'listen'], ['kid', 'listen'], ['h2', 'listen']],
      intro: [['@env', 'dusk'], ['house', 'idle'], ['house2', 'idle'], ['lamb', null, { show: 1 }], ['fire', null, { show: 0 }], ['folk', null, { show: 0 }], ['moses', 'idle', { show: 0 }], ['aaron', 'idle', { show: 0 }], ['pharaoh', 'idle', { show: 0 }],
        ['father', 'idle', { x: -0.6, z: 0.1, look: 0.5 }], ['mom', 'idle', { x: -0.15, z: -0.05, look: -0.6 }], ['kid', 'idle', { x: -0.45, z: -0.15 }], ['h2', 'idle', { show: 0 }]],
      'p0.2': [['father', 'kneel', { x: -0.3, z: 0.25, look: 0.6 }]],
      // 우슬초에 피를 적셔 문설주와 인방에
      'p0.3': [['lamb', null, { show: 0 }], ['father', 'idle', { x: -0.55, z: -0.08, look: 2.8 }], ['father', 'raise', { delay: 2200 }], ['house', 'blood', { delay: 2600 }], ['house2', 'blood', { delay: 3400 }]],
      'p0.4': [['father', 'idle', { look: 0.4 }]],
      // 그 밤: 허리띠를 매고 지팡이를 쥔 채 서서 먹는다
      'p1.0': [['@env', 'night'], ['fire', null, { show: 1 }], ['h2', 'idle', { show: 1 }], ['father', 'break', { x: -0.6, z: 0.1, look: 0.5 }], ['mom', 'listen'], ['kid', 'listen']],
      // 한밤중의 통곡 — 집 안의 식구들은 엎드려 기도한다
      'p1.2': [['@env', 'dark'], ['father', 'pray'], ['mom', 'pray'], ['kid', 'pray'], ['h2', 'pray']],
      'p1.4': [['fire', null, { show: 0.5 }]],
      // 바로가 모세와 아론을 불러 떠나라 한다
      'p2.0': [['@env', 'night'], ['pharaoh', 'idle', { show: 1 }], ['moses', 'idle', { show: 1 }], ['aaron', 'idle', { show: 1 }], ['father', 'idle'], ['mom', 'idle'], ['kid', 'idle'], ['h2', 'idle']],
      // 반죽 그릇을 메고 라암셋을 나선다
      'p2.3': [['pharaoh', 'idle', { show: 0 }], ['fire', null, { show: 0 }], ['folk', null, { show: 1 }], ['mom', 'idle', { item: 'basket', x: 0.4, z: 0.15 }], ['father', 'idle', { x: 0.25, z: 0.35 }], ['kid', 'idle', { x: 0.55, z: 0.4 }], ['h2', 'idle', { x: 0.1, z: 0.5 }],
        ['moses', 'idle', { x: 1.35, z: 0.0, look: 1 }], ['aaron', 'idle', { x: 1.5, z: 0.2, look: 1 }]],
      'p2.4': [['folk', null, { x: 1.4 }], ['mom', 'idle', { x: 0.9 }], ['father', 'idle', { x: 0.75 }], ['kid', 'idle', { x: 1.05 }], ['h2', 'idle', { x: 0.6 }]],
      'p2.5': [['@env', 'dawn']],
      w0: [['father', 'listen', { look: 2.8 }]],
      w1: [['father', 'break'], ['mom', 'listen'], ['kid', 'listen']],
      w2: [['pharaoh', 'speak', { show: 1, to: 'moses' }]],
      end: [['@env', 'dawn']],
    },
  },

  /* m08. 구름 기둥과 불 기둥 — 숙곳에서 에담으로 이어진 진영. 백성 앞에 선 기둥이 낮에는 구름, 밤에는 불이 된다 */
  m08: {
    wide: 1.4,
    props: {
      sand: ['sand', 0, 0, { r: 1.9, color: '#cdb68a' }],
      pillar: ['pillar', 0.95, -0.45, { h: 2.4 }],
      tent: ['tent', -0.9, -0.55, { w: 0.8 }],
      tent2: ['tent', -0.2, -0.75, { w: 0.7, color: '#4a3c30' }],
      folk: ['crowd', -0.55, 0.15, { spots: flock(16, 0.75, 0.32, 5), face: Math.PI / 2 }],
      donkey: ['donkey', -1.2, 0.2],
    },
    cast: {
      moses: ['mosesE', 0.3, 0.05, 1],
      aaron: ['aaron', 0.05, 0.25, 1],
      bearer: ['hebrew', -0.2, 0.45, 0.6],
      bearer2: ['hebrew2', 0.05, 0.55, 0.6],
    },
    beats: {
      enter: [['pillar', 'cloud'], ['moses', 'idle', { look: 0.8 }], ['bearer', 'idle', { item: 'gift' }]],
      intro: [['pillar', 'cloud', { show: 0 }], ['tent', null, { show: 0 }], ['tent2', null, { show: 0 }], ['moses', 'idle', { x: -0.4, z: 0.05 }], ['aaron', 'idle', { x: -0.7, z: 0.25 }], ['folk', null, { x: -1.2 }], ['bearer', 'idle', { x: -0.9, z: 0.45, item: null }], ['bearer2', 'idle', { x: -0.7, z: 0.55 }]],
      'p0.0': [['moses', 'idle', { x: 0.3, z: 0.05, look: 0.6 }], ['aaron', 'idle', { x: 0.05, z: 0.25, look: 0.6 }], ['folk', null, { x: -0.55 }], ['bearer', 'idle', { x: -0.2, z: 0.45 }], ['bearer2', 'idle', { x: 0.05, z: 0.55 }]],
      'p0.1': [['moses', 'point', { look: -0.4 }]],
      'p0.3': [['moses', 'idle', { look: 0.8 }]],
      // 요셉의 유골 상자를 챙긴다
      'p1.0': [['bearer', 'idle', { item: 'gift' }], ['moses', 'listen', { look: -1, to: 'bearer' }]],
      'p1.4': [['tent', null, { show: 1 }], ['tent2', null, { show: 1 }]],
      // 낮에는 구름 기둥, 밤에는 불 기둥
      'p1.5': [['pillar', 'cloud', { show: 1 }], ['moses', 'look-up', { look: 0.8 }], ['@env', 'night', { delay: 4500 }], ['pillar', 'fire', { delay: 4500 }]],
      'p2.0': [['folk', null, { x: -0.35 }]],
      // 길을 되돌려 바닷가에 진을 친다
      'p2.2': [['@env', 'day'], ['pillar', 'cloud'], ['moses', 'point', { look: -1.2 }]],
      'p2.3': [['moses', 'idle', { look: 0.8 }]],
      w0: [['moses', 'listen', { look: 0.8 }]],
      w1: [['moses', 'listen', { look: 0.8 }]],
      w2: [['moses', 'listen', { look: -1 }]],
      end: [],
    },
  },

  /* m09. 바다가 갈라지다 — 왼쪽(서쪽) 바닷가에 갇힌 백성, 그 뒤로 병거가 온다. 구름 기둥이 사이를 가르고,
     모세가 손을 내밀면 물이 남북(앞뒤)으로 벽처럼 서서 동쪽(오른쪽)으로 마른 길이 난다. 돌아온 물은 병거를 지울 뿐 — 잠기는 모습은 그리지 않는다 */
  m09: {
    env: 'dusk', wide: 1.5,
    props: {
      sand: ['sand', -1.05, 0, { r: 1.0, color: '#cdb68a' }],
      shore: ['sand', 1.55, 0, { r: 0.7, color: '#cdb68a', stones: 4 }],
      sea: ['sea', 0.3, 0, { w: 2.1, gap: 0.42, d: 0.9 }],
      pillar: ['pillar', -1.55, -0.15, { h: 2.2 }],
      folk: ['crowd', -0.95, -0.05, { spots: flock(14, 0.4, 0.3, 2), face: Math.PI / 2 }],
      car1: ['chariot', -2.4, -0.2, { speed: 0.35 }],
      car2: ['chariot', -2.7, 0.15, { speed: 0.35, coat: '#4a3424' }],
    },
    cast: {
      moses: ['mosesE', -0.55, 0.05, 1],
      aaron: ['aaron', -0.75, 0.25, 0.8],
      man: ['hebrew', -1.15, 0.35, -1],
      wom: ['woman', -1.35, 0.15, -1.2],
    },
    beats: {
      enter: [['sea', 'part'], ['@env', 'night'], ['pillar', 'fire', { x: -1.55 }], ['folk', null, { x: 0.3 }], ['moses', 'raise', { x: -0.55, look: 1 }], ['aaron', 'idle', { x: 0.1, z: 0.05, look: 1 }], ['man', 'idle', { x: 0.45, z: -0.1, look: 1 }], ['wom', 'idle', { x: 0.65, z: 0.1, look: 1 }],
        ['car1', null, { show: 0 }], ['car2', null, { show: 0 }]],
      intro: [['sea', 'calm'], ['@env', 'dusk'], ['pillar', 'cloud', { show: 0, x: -0.2, z: -0.4 }], ['folk', null, { x: -0.95, z: -0.05 }], ['car1', null, { show: 0, x: -2.4 }], ['car2', null, { show: 0, x: -2.7 }],
        ['moses', 'idle', { x: -0.55, z: 0.05, look: 1 }], ['aaron', 'idle', { x: -0.75, z: 0.25, look: 0.8 }], ['man', 'idle', { x: -1.15, z: 0.35, look: 1 }], ['wom', 'idle', { x: -1.35, z: 0.15, look: 1 }]],
      // 병거 육백 대가 뒤쫓는다
      'p0.3': [['car1', null, { show: 1, x: -1.85 }], ['car2', null, { show: 1, x: -2.05 }]],
      'p0.4': [['man', 'afraid', { look: -1.2 }], ['wom', 'afraid', { look: -1.2 }]],
      'p0.5': [['aaron', 'afraid', { look: -1 }]],
      'p1.0': [['man', 'rebuke', { to: 'moses' }]],
      'p1.1': [['moses', 'raise', { look: -0.8 }]],
      // 구름 기둥이 진 뒤로 옮겨 가 밤을 가른다
      'p1.4': [['@env', 'night'], ['pillar', 'fire', { show: 1, x: -1.55, z: -0.15 }], ['car1', null, { x: -1.95 }], ['car2', null, { x: -2.15 }], ['man', 'idle'], ['wom', 'idle'], ['aaron', 'idle', { look: 1 }]],
      // 손을 내밀자 밤새 동풍 — 물이 갈라진다
      'p2.0': [['moses', 'raise', { look: 1 }], ['sea', 'part', { delay: 1200 }]],
      // 좌우에 벽처럼 선 물 사이로
      'p2.2': [['moses', 'idle', { x: 1.35, z: -0.05, look: -1 }], ['aaron', 'idle', { x: 1.25, z: 0.15, delay: 600 }], ['folk', null, { x: 1.55, delay: 400 }], ['man', 'idle', { x: 1.5, z: 0.25, delay: 1400 }], ['wom', 'idle', { x: 1.65, z: 0.05, delay: 2000 }]],
      // 새벽, 병거가 길로 들어서고 물이 돌아온다 — 병거는 물결 속에 사라진다
      'p2.3': [['@env', 'dawn'], ['pillar', 'cloud', { show: 0 }], ['car1', null, { x: -0.4, z: -0.05 }], ['car2', null, { x: -0.7, z: 0.1 }], ['moses', 'raise', { look: -1, delay: 1500 }],
        ['sea', 'return', { delay: 3500 }], ['car1', null, { show: 0, delay: 4200 }], ['car2', null, { show: 0, delay: 4400 }]],
      'p2.5': [['moses', 'pray', { look: -1 }], ['aaron', 'pray', { look: -1 }], ['man', 'kneel', { look: -1 }], ['wom', 'kneel', { look: -1 }]],
      w0: [['moses', 'listen', { look: 0.6 }]],
      w1: [['moses', 'speak', { to: 'man' }]],
      w2: [],
      end: [['@env', 'dawn'], ['sea', 'calm']],
    },
  },

  /* m10. 바닷가의 노래 — 건너편 바닷가의 아침. 모세와 백성이 노래하고, 미리암이 소고를 들자 여인들이 춤추며 따른다 */
  m10: {
    env: 'dawn', wide: 1.35,
    props: {
      sand: ['sand', 0, 0.05, { r: 1.7, color: '#d2bc90' }],
      sea: ['water', -0.2, -0.95, { r: 1.3, y: 0.05, size: [1.6, 1, 0.45] }],
      folk: ['crowd', 0.95, -0.15, { spots: flock(12, 0.45, 0.3, 4), face: -Math.PI / 2 }],
    },
    cast: {
      moses: ['mosesE', -0.25, -0.15, 0.6],
      aaron: ['aaron', 0.05, -0.3, 0.3],
      miriam: ['miriam', -0.75, 0.25, 0.6],
      w1: ['woman', -0.4, 0.45, -0.3],
      w2: ['woman2', -1.05, 0.5, 0.8],
      w3: ['mother', -0.95, 0.05, 1],
    },
    beats: {
      enter: [['miriam', 'raise', { item: 'timbrel' }], ['w1', 'raise', { item: 'timbrel' }], ['w2', 'raise', { item: 'timbrel' }], ['w3', 'raise'], ['moses', 'raise', { look: -0.6 }]],
      intro: [['@env', 'dawn'], ['miriam', 'idle', { item: null }], ['w1', 'idle', { item: null }], ['w2', 'idle', { item: null }], ['w3', 'idle'], ['moses', 'idle', { look: -0.6 }], ['aaron', 'idle']],
      'p0.0': [['@env', 'day']],
      'p0.2': [['moses', 'idle', { look: -1.6 }], ['aaron', 'idle', { look: -2 }]],
      // 모세와 이스라엘 자손이 노래한다
      'p0.3': [['moses', 'raise', { look: 0.6 }], ['aaron', 'raise', { look: 0.3 }]],
      'p1.0': [['moses', 'look-up', { look: 0.4 }]],
      'p1.4': [['moses', 'raise', { look: 0.6 }]],
      // 미리암이 소고를 들고, 여인들이 춤추며 따른다
      'p2.0': [['moses', 'idle'], ['aaron', 'idle'], ['miriam', 'raise', { item: 'timbrel' }]],
      'p2.1': [['w1', 'raise', { item: 'timbrel' }], ['w2', 'raise', { item: 'timbrel' }], ['w3', 'raise'],
        ['miriam', 'raise', { x: -0.5, z: 0.4 }], ['w1', 'raise', { x: -0.85, z: 0.6, delay: 300 }], ['w2', 'raise', { x: -1.15, z: 0.3, delay: 500 }], ['w3', 'raise', { x: -0.7, z: 0.1, delay: 700 }],
        ['miriam', 'raise', { x: -0.75, z: 0.25, delay: 3200 }], ['w1', 'raise', { x: -0.4, z: 0.45, delay: 3400 }], ['w2', 'raise', { x: -1.05, z: 0.5, delay: 3600 }], ['w3', 'raise', { x: -0.95, z: 0.05, delay: 3800 }]],
      'p2.2': [['miriam', 'raise', { x: -0.6, z: 0.15 }], ['w1', 'raise', { x: -0.3, z: 0.35 }], ['w2', 'raise', { x: -0.95, z: 0.55 }], ['w3', 'raise', { x: -1.05, z: 0.2 }]],
      w0: [['moses', 'speak', { look: 0.6 }]],
      w1: [['moses', 'raise', { look: 0.6 }]],
      w2: [['miriam', 'speak', { look: 0.8 }]],
      end: [['miriam', 'raise'], ['w1', 'raise'], ['w2', 'raise']],
    },
  },
  /* m11. 쓴 물이 단 물로 — 사흘 걷고 이른 마라의 물가. 백성은 원망하고, 모세가 주께 부르짖어 나무를 던지자 물이 달아진다.
     셋째 문단에서 엘림의 샘과 종려나무 그늘로 바뀐다 */
  m11: {
    wide: 1.35,
    props: {
      sand: ['sand', 0, 0, { r: 1.9, color: '#d2b98a' }],
      pool: ['water', 0.35, 0.1, { r: 0.6, y: 0.04, size: [1.1, 1, 0.55] }],
      tree: ['olive', 0.95, -0.35, { scale: 0.8 }],
      light: ['beam', 0.35, 0.05, { r: 0.45, h: 2.2, peak: 0.45 }],
      palm1: ['palm', -0.2, -0.55, { h: 1.0 }], palm2: ['palm', 0.55, -0.7, { h: 0.9 }], palm3: ['palm', 1.15, -0.45, { h: 1.05 }], palm4: ['palm', -0.75, -0.6, { h: 0.85 }],
      tent: ['tent', -1.15, -0.3, { w: 0.7 }],
      folk: ['crowd', -1.15, 0.25, { spots: flock(12, 0.4, 0.28, 6), face: Math.PI / 2 }],
    },
    cast: {
      moses: ['mosesE', -0.35, 0.05, 1],
      aaron: ['aaron', -0.6, 0.25, 1],
      man: ['hebrew', -0.1, 0.35, 0.8],
      wom: ['woman', -0.75, 0.05, 0.8],
    },
    beats: {
      enter: [['light', null, { show: 0 }], ['palm1', null, { show: 0 }], ['palm2', null, { show: 0 }], ['palm3', null, { show: 0 }], ['palm4', null, { show: 0 }], ['tent', null, { show: 0 }], ['moses', 'raise', { x: 0.0, z: 0.0, look: 1 }], ['man', 'kneel', { x: 0.15, z: 0.35, look: 0.6 }]],
      intro: [['light', null, { show: 0 }], ['palm1', null, { show: 0 }], ['palm2', null, { show: 0 }], ['palm3', null, { show: 0 }], ['palm4', null, { show: 0 }], ['tent', null, { show: 0 }],
        ['folk', null, { x: -1.6 }], ['moses', 'idle', { x: -1.1, z: 0.05 }], ['aaron', 'idle', { x: -1.3, z: 0.25 }], ['man', 'idle', { x: -0.9, z: 0.4 }], ['wom', 'idle', { x: -1.4, z: -0.05 }]],
      // 사흘 동안 물 없이 — 지친 걸음
      'p0.1': [['folk', null, { x: -1.15 }], ['moses', 'idle', { x: -0.35, z: 0.05, look: 1 }], ['aaron', 'idle', { x: -0.6, z: 0.25 }], ['man', 'idle', { x: -0.1, z: 0.35 }], ['wom', 'idle', { x: -0.75, z: 0.05 }]],
      'p0.2': [['man', 'mourn'], ['wom', 'mourn']],
      // 마라의 물 — 마셔 보지만 쓰다
      'p1.1': [['man', 'kneel', { x: 0.15, z: 0.35, look: 0.6 }], ['man', 'shrug', { delay: 2600 }]],
      'p1.2': [['man', 'rebuke', { to: 'moses' }], ['wom', 'rebuke', { to: 'moses' }]],
      // 주께 부르짖자 나무를 보여 주신다 — 물에 던지니 단 물로
      'p1.3': [['moses', 'pray', { look: 0.4 }], ['moses', 'idle', { x: 0.0, z: 0.0, look: 1, delay: 2400 }], ['moses', 'raise', { delay: 3800 }], ['light', null, { show: 1, delay: 4200 }], ['light', null, { show: 0, delay: 7500 }],
        ['man', 'kneel', { delay: 5200 }], ['wom', 'idle', { delay: 5200 }]],
      'p2.0': [['moses', 'speak', { look: -0.8 }], ['man', 'listen'], ['wom', 'listen']],
      // 엘림: 샘 열두 곳과 종려나무 일흔 그루
      'p2.3': [['tree', null, { show: 0 }], ['palm1', null, { show: 1 }], ['palm2', null, { show: 1 }], ['palm3', null, { show: 1 }], ['palm4', null, { show: 1 }]],
      'p2.4': [['tent', null, { show: 1 }], ['man', 'sit-ground'], ['wom', 'sit-ground'], ['moses', 'idle', { look: -0.6 }]],
      w0: [['moses', 'listen', { look: 0.3 }]],
      w1: [['man', 'speak', { to: 'moses' }]],
      end: [],
    },
  },

  /* m12. 하늘에서 내린 만나 — 저녁엔 메추라기 떼가 진을 덮고, 아침엔 서리 같은 만나가 깔린다. 사람들이 허리 굽혀 하루치만 거둔다 */
  m12: {
    wide: 1.35,
    props: {
      sand: ['sand', 0, 0, { r: 1.9, color: '#d6c29a' }],
      tent: ['tent', -0.95, -0.55, { w: 0.75 }], tent2: ['tent', 0.25, -0.7, { w: 0.7, color: '#4a3c30' }], tent3: ['tent', 1.15, -0.5, { w: 0.65 }],
      quail: ['swarm', 0.1, -0.1, { color: '#7a6448', dot: 0.045, n: 90 }],
      manna: ['manna', 0, 0.2, { r: 1.4 }],
    },
    cast: {
      moses: ['mosesE', -0.2, -0.15, 0.4],
      aaron: ['aaron', 0.15, -0.25, 0.2],
      man: ['hebrew', -0.75, 0.25, 0.6],
      wom: ['woman', 0.55, 0.3, -0.6],
      wom2: ['woman2', 0.95, 0.05, -0.8],
      kid: ['child', -0.45, 0.45, 0.4],
    },
    beats: {
      enter: [['@env', 'dawn'], ['quail', null, { show: 0 }], ['manna', null, { show: 1 }], ['man', 'bow', { item: 'basket' }], ['wom', 'bow'], ['wom2', 'bow', { item: 'basket' }], ['kid', 'kneel'], ['moses', 'idle']],
      intro: [['@env', 'day'], ['quail', null, { show: 0 }], ['manna', null, { show: 0 }], ['man', 'idle', { item: null }], ['wom', 'idle'], ['wom2', 'idle', { item: null }], ['kid', 'idle'], ['moses', 'idle']],
      // 애굽의 고기 가마를 그리며 원망한다
      'p0.2': [['man', 'rebuke', { to: 'moses' }], ['wom', 'rebuke', { to: 'aaron' }], ['wom2', 'mourn']],
      // 저녁의 메추라기
      'p1.0': [['@env', 'dusk'], ['quail', null, { show: 1 }], ['man', 'look-up'], ['wom', 'look-up'], ['wom2', 'look-up'], ['kid', 'look-up'], ['quail', null, { show: 0, delay: 6000 }]],
      // 아침, 서리처럼 희고 가는 것
      'p1.1': [['@env', 'dawn'], ['manna', null, { show: 1 }], ['man', 'idle'], ['wom', 'idle'], ['wom2', 'idle'], ['kid', 'idle']],
      'p1.2': [['man', 'shrug', { look: 0 }], ['kid', 'kneel']],
      'p1.4': [['moses', 'speak', { look: -0.6 }]],
      // 한 사람에 한 오멜씩
      'p2.0': [['@env', 'day'], ['moses', 'idle'], ['man', 'bow', { item: 'basket' }], ['wom', 'bow'], ['wom2', 'bow', { item: 'basket' }], ['kid', 'kneel']],
      'p2.2': [['man', 'idle'], ['wom2', 'idle'], ['wom', 'pray'], ['man', 'pray', { delay: 600 }]],
      'p2.3': [['manna', null, { show: 1 }]],
      w0: [['moses', 'listen', { look: 0.3 }]],
      w1: [['moses', 'listen', { look: 0.3 }]],
      w2: [['moses', 'speak', { look: -0.6 }]],
      end: [['@env', 'dawn']],
    },
  },

  /* m13. 반석에서 솟은 물 — 르비딤의 바위 골짜기. 목마른 백성이 모세와 다투고, 장로들 앞에서 모세가 지팡이로 바위를 치자 물이 솟는다 */
  m13: {
    wide: 1.3,
    props: {
      sand: ['sand', 0, 0, { r: 1.8, color: '#bfa27e', stones: 26 }],
      rocks: ['rocks', 0, 0, { spots: [[-1.2, -0.5, 0.2], [-0.9, -0.7, 0.14], [1.3, -0.2, 0.18], [1.1, 0.4, 0.1]] }],
      rock: ['rockspring', 0.55, -0.45, { scale: 1.2 }],
      folk: ['crowd', -0.9, 0.2, { spots: flock(10, 0.35, 0.25, 7), face: Math.PI / 2 }],
    },
    cast: {
      moses: ['mosesE', -0.2, 0.0, 0.8],
      elder1: ['elder', 0.0, -0.35, 0.6],
      elder2: ['jethro', -0.35, -0.3, 0.6, { gaze: true }],
      man: ['hebrew', -0.45, 0.3, 0.6],
      wom: ['mother', -0.65, 0.05, 0.8],
      kid: ['child', -0.6, 0.4, 0.6],
    },
    beats: {
      enter: [['rock', 'flow'], ['moses', 'idle', { x: 0.3, z: -0.1, look: 0.8 }], ['elder1', 'look-up'], ['man', 'kneel', { x: 0.55, z: 0.15, look: -0.2 }], ['kid', 'kneel', { x: 0.75, z: 0.05, look: -0.3 }], ['wom', 'idle']],
      intro: [['rock', 'dry'], ['elder1', 'idle', { show: 0 }], ['elder2', 'idle', { show: 0 }], ['moses', 'idle', { x: -0.2, z: 0.0, look: 0.8 }], ['man', 'idle', { x: -0.45, z: 0.3 }], ['kid', 'idle', { x: -0.6, z: 0.4 }], ['wom', 'idle']],
      'p0.2': [['kid', 'mourn'], ['wom', 'mourn']],
      'p0.3': [['man', 'rebuke', { to: 'moses' }], ['wom', 'rebuke', { to: 'moses' }], ['moses', 'idle', { look: -1 }]],
      'p1.0': [['moses', 'pray', { look: 0.6 }]],
      'p1.4': [['elder1', 'idle', { show: 1 }], ['elder2', 'idle', { show: 1 }], ['moses', 'idle', { x: 0.3, z: -0.1, look: 0.8 }]],
      // 바위를 치자 물이 솟아 흐른다
      'p2.0': [['moses', 'raise', { look: 0.8 }], ['rock', 'flow', { delay: 1600 }], ['moses', 'idle', { delay: 3000 }], ['man', 'kneel', { x: 0.55, z: 0.15, look: -0.2, delay: 3200 }], ['kid', 'kneel', { x: 0.75, z: 0.05, look: -0.3, delay: 3500 }], ['wom', 'look-up', { delay: 3000 }], ['elder1', 'look-up', { delay: 2000 }]],
      'p2.3': [['moses', 'idle', { look: -0.8 }]],
      w0: [['moses', 'listen', { look: 0.6 }]],
      w1: [['moses', 'speak', { to: 'man' }]],
      w2: [['moses', 'pray', { look: 0.6 }]],
      end: [],
    },
  },

  /* m14. 들어 올린 두 손 — 오른쪽 언덕 꼭대기에 모세와 아론·훌, 왼쪽 아래 골짜기에서 여호수아의 무리와 아말렉이 맞선다.
     싸움은 두 무리가 밀고 밀리는 것으로만 (연출 원칙 1): 손을 들면 이스라엘이 앞으로, 내리면 뒤로 */
  m14: {
    wide: 1.45,
    props: {
      sand: ['sand', -0.4, 0.1, { r: 1.6, color: '#c2a47e' }],
      hill: ['hill', 0.95, -0.35, { w: 0.85, h: 0.42, d: 0.55, color: '#9a7e64', soft: true }],
      seat: ['rocks', 0.95, -0.42, { spots: [[0, 0, 0.07]], y: 0.38 }],
      israel: ['crowd', -0.55, 0.15, { spots: flock(9, 0.28, 0.22, 8), face: -Math.PI / 2 }],
      amalek: ['crowd', -1.45, 0.1, { spots: flock(9, 0.28, 0.22, 9), face: Math.PI / 2 }],
      altar: ['altar', 0.45, 0.35, { state: 'idle' }],
    },
    cast: {
      moses: ['mosesE', 0.95, -0.35, -0.8],
      aaron: ['aaron', 0.72, -0.25, -0.6],
      hur: ['hur', 1.18, -0.3, -0.9],
      joshua: ['joshua', -0.8, 0.35, -1],
    },
    beats: {
      enter: [['moses', 'raise', { look: -0.8 }], ['aaron', 'raise', { look: -0.6 }], ['hur', 'raise', { look: -0.9 }], ['israel', null, { x: -0.75 }], ['amalek', null, { x: -1.6 }], ['altar', null, { show: 0 }]],
      intro: [['moses', 'idle', { x: 0.2, z: 0.1 }], ['aaron', 'idle', { x: 0.0, z: 0.25 }], ['hur', 'idle', { x: 0.4, z: 0.25 }], ['joshua', 'idle', { x: -0.2, z: 0.25, look: 1 }], ['israel', null, { x: -0.55 }], ['amalek', null, { x: -1.9, show: 0 }], ['altar', 'idle', { show: 0 }]],
      'p0.0': [['amalek', null, { show: 1, x: -1.45 }]],
      // 여호수아는 싸우러 나가고, 모세는 지팡이를 들고 언덕 꼭대기에
      'p0.1': [['joshua', 'idle', { x: -0.8, z: 0.35, look: -1 }], ['moses', 'idle', { x: 0.95, z: -0.35, look: -0.8 }]],
      'p0.4': [['aaron', 'idle', { x: 0.72, z: -0.25, look: -0.6 }], ['hur', 'idle', { x: 1.18, z: -0.3, look: -0.9 }]],
      // 손을 들면 이기고, 내리면 진다
      'p1.0': [['moses', 'raise'], ['israel', null, { x: -0.75 }], ['amalek', null, { x: -1.6 }], ['moses', 'idle', { delay: 3500 }], ['israel', null, { x: -0.4, delay: 3500 }], ['amalek', null, { x: -1.2, delay: 3500 }]],
      // 두 사람이 돌을 가져다 앉히고 양쪽에서 손을 붙든다
      'p1.2': [['moses', 'sit', { y: 0.06 }], ['aaron', 'raise', { x: 0.82, z: -0.3 }], ['hur', 'raise', { x: 1.08, z: -0.32 }], ['moses', 'raise', { delay: 2600 }], ['israel', null, { x: -0.75, delay: 2600 }], ['amalek', null, { x: -1.6, delay: 2600 }]],
      'p1.3': [['@env', 'dusk']],
      // 아말렉이 물러나고, 모세는 제단을 쌓는다
      'p2.0': [['amalek', null, { x: -2.2, show: 0 }], ['israel', null, { x: -0.95 }]],
      'p2.4': [['moses', 'idle', { y: 0, x: 0.45, z: 0.15, look: 0 }], ['aaron', 'idle', { x: 0.2, z: 0.25 }], ['hur', 'idle', { x: 0.7, z: 0.3 }], ['joshua', 'idle', { x: 0.0, z: 0.45, look: 1 }], ['altar', 'fire', { show: 1, delay: 2000 }], ['moses', 'raise', { delay: 3000 }]],
      w0: [['moses', 'listen', { look: 0 }]],
      w1: [['moses', 'speak', { to: 'joshua' }]],
      end: [['@env', 'dusk']],
    },
  },

  /* m15. 장인 이드로의 조언 — 산 아래 진영. 이드로가 십보라와 두 아들을 데리고 오고, 이튿날은 아침부터 저녁까지 백성의 송사를 홀로 듣는 모세 */
  m15: {
    wide: 1.35,
    props: {
      sand: ['sand', 0, 0, { r: 1.9, color: '#c9a882' }],
      mount: ['mountain', -0.35, -1.25, { h: 1.6, r: 1.0 }],
      tent: ['tent', -1.15, -0.35, { w: 0.75 }], tent2: ['tent', 0.85, -0.6, { w: 0.7, color: '#4a3c30' }],
      altar: ['altar', 0.15, -0.45, { state: 'idle' }],
      folk: ['crowd', 0.9, 0.3, { spots: flock(8, 0.3, 0.2, 10), face: -Math.PI / 2 }],
      elders: ['crowd', 0.15, -0.15, { spots: [[-0.35, 0], [-0.15, 0.1], [0.15, 0.1], [0.35, 0]], state: 'sit', face: Math.PI }],
    },
    cast: {
      moses: ['mosesE', -0.4, 0.1, 1],
      jethro: ['jethro', 1.7, 0.0, -1],
      zip: ['zipporah', 1.9, 0.2, -1],
      son1: ['child', 2.0, -0.1, -1],
      son2: ['child', 2.1, 0.3, -1],
      aaron: ['aaron', -0.7, -0.1, 0.8],
    },
    beats: {
      enter: [['moses', 'sit', { x: -0.4, z: 0.1, look: 1 }], ['jethro', 'speak', { x: -0.85, z: 0.25, to: 'moses' }], ['folk', null, { show: 1 }], ['elders', null, { show: 0 }], ['zip', 'idle', { show: 0 }], ['son1', 'idle', { show: 0 }], ['son2', 'idle', { show: 0 }]],
      intro: [['altar', 'idle'], ['folk', null, { show: 0 }], ['elders', null, { show: 0 }], ['moses', 'idle', { x: -0.4, z: 0.1 }], ['jethro', 'idle', { show: 0, x: 1.7, z: 0.0 }], ['zip', 'idle', { show: 0, x: 1.9, z: 0.2 }], ['son1', 'idle', { show: 0, x: 2.0, z: -0.1 }], ['son2', 'idle', { show: 0, x: 2.1, z: 0.3 }]],
      // 아내와 두 아들을 데리고 찾아온다
      'p0.1': [['jethro', 'idle', { show: 1, x: 0.45, z: 0.05 }], ['zip', 'idle', { show: 1, x: 0.7, z: 0.25 }], ['son1', 'idle', { show: 1, x: 0.75, z: -0.05 }], ['son2', 'idle', { show: 1, x: 0.95, z: 0.35 }]],
      // 나가서 절하고 입 맞추고, 주께서 하신 일을 들려준다
      'p0.2': [['moses', 'idle', { x: 0.15, z: 0.05, look: 1 }], ['moses', 'bow', { delay: 2200 }], ['moses', 'speak', { to: 'jethro', delay: 4200 }]],
      'p1.1': [['moses', 'idle'], ['jethro', 'raise', { look: -1 }]],
      // 번제를 드리고, 장로들과 하나님 앞에서 빵을 먹는다
      'p1.4': [['altar', 'fire'], ['elders', null, { show: 1 }], ['jethro', 'pray', { look: -0.5 }], ['aaron', 'sit-ground']],
      // 이튿날 — 송사를 홀로 듣는 모세
      'p2.0': [['altar', 'idle'], ['elders', null, { show: 0 }], ['aaron', 'idle'], ['zip', 'idle', { x: 1.2, z: -0.3 }], ['son1', 'idle', { x: 1.35, z: -0.4 }], ['son2', 'idle', { x: 1.45, z: -0.2 }],
        ['moses', 'sit', { x: -0.4, z: 0.1, look: 1 }], ['folk', null, { show: 1 }], ['jethro', 'idle', { x: -0.85, z: 0.25, look: 0.6 }]],
      'p2.1': [['jethro', 'speak', { to: 'moses' }]],
      // 그 말대로 하였고, 이드로는 제 땅으로 돌아간다
      'p2.5': [['moses', 'idle', { look: -0.6 }], ['jethro', 'idle', { x: 1.8, z: 0.1 }], ['jethro', 'idle', { show: 0, delay: 5000 }]],
      w0: [['jethro', 'speak', { show: 1, x: -0.85, z: 0.25, to: 'moses' }]],
      w1: [['jethro', 'point', { look: 1 }]],
      w2: [['jethro', 'speak', { to: 'moses' }]],
      end: [],
    },
  },

  /* m16. 산에 내려오신 하나님 — 뒤로 시내산, 앞에 진을 친 백성과 경계의 돌. 셋째 날 아침 천둥·번개·짙은 구름이 산을 덮는다.
     하나님은 산을 덮은 연기와 불빛으로만 */
  m16: {
    wide: 1.4,
    props: {
      sand: ['sand', 0, 0.2, { r: 1.9, color: '#c9a882' }],
      mount: ['mountain', 0.1, -1.25, { h: 1.9, r: 1.25 }],
      bound: ['rocks', 0, 0, { spots: Array.from({ length: 9 }, (_, i) => [-1.2 + i * 0.3, -0.35 + Math.sin(i) * 0.03, 0.05]) }],
      folk: ['crowd', 0, 0.42, { spots: [...flock(8, 0.35, 0.2, 11).map(([x, z]) => [x - 0.95, z]), ...flock(8, 0.35, 0.2, 12).map(([x, z]) => [x + 0.95, z])], face: Math.PI }],
      tent: ['tent', -1.25, 0.15, { w: 0.6 }], tent2: ['tent', 1.3, 0.2, { w: 0.6, color: '#4a3c30' }],
    },
    cast: {
      moses: ['mosesE', -0.1, -0.1, 3],
      man: ['hebrew', -0.45, 0.2, 2.8],
      wom: ['woman', 0.35, 0.18, 3.2],
    },
    beats: {
      enter: [['@env', 'storm'], ['mount', 'smoke'], ['man', 'afraid', { look: 3 }], ['wom', 'cower', { look: 3 }], ['moses', 'idle', { look: 3 }]],
      intro: [['@env', 'day'], ['mount', 'calm'], ['folk', null, { show: 0 }], ['bound', null, { show: 0 }], ['moses', 'idle', { x: -0.1, z: 0.35, look: 3 }], ['man', 'idle', { show: 0 }], ['wom', 'idle', { show: 0 }]],
      'p0.0': [['folk', null, { show: 1 }], ['man', 'idle', { show: 1 }], ['wom', 'idle', { show: 1 }]],
      // 모세가 산에 오른다 (산기슭으로 걸어가 사라진다)
      'p0.3': [['moses', 'idle', { x: 0.05, z: -0.6, look: 3 }], ['moses', 'idle', { show: 0, delay: 3200 }]],
      'p1.2': [['moses', 'speak', { show: 1, x: -0.1, z: -0.1, look: 0, to: 'man' }], ['man', 'raise'], ['wom', 'raise']],
      // 옷을 빨고 몸을 정결히, 산 둘레에 경계
      'p1.4': [['man', 'idle'], ['wom', 'pray']],
      'p1.5': [['bound', null, { show: 1 }], ['moses', 'point', { look: 3 }]],
      // 셋째 날 아침, 천둥과 번개와 짙은 구름
      'p2.0': [['@env', 'storm'], ['mount', 'smoke'], ['moses', 'idle', { look: 3 }]],
      'p2.1': [['man', 'afraid', { look: 3 }], ['wom', 'cower', { look: 3 }]],
      'p2.3': [['moses', 'look-up', { look: 3 }]],
      w0: [['moses', 'listen', { look: 3 }]],
      w1: [['moses', 'listen', { look: 3 }]],
      w2: [['man', 'speak', { to: 'moses' }], ['wom', 'raise']],
      end: [['@env', 'storm'], ['mount', 'smoke']],
    },
  },

  /* m17. 열 가지 말씀 — 연기와 불에 휩싸인 산. 백성은 떨며 멀찍이 서고, 모세만 짙은 어둠 속으로 다가간다 */
  m17: {
    env: 'storm', wide: 1.4,
    props: {
      sand: ['sand', 0, 0.2, { r: 1.9, color: '#c2a27e' }],
      mount: ['mountain', 0.1, -1.25, { h: 1.9, r: 1.25, state: 'smoke' }],
      bound: ['rocks', 0, 0, { spots: Array.from({ length: 9 }, (_, i) => [-1.2 + i * 0.3, -0.35 + Math.sin(i) * 0.03, 0.05]) }],
      folk: ['crowd', 0, 0.48, { spots: [...flock(8, 0.35, 0.2, 13).map(([x, z]) => [x - 1.0, z]), ...flock(8, 0.35, 0.2, 14).map(([x, z]) => [x + 1.0, z])], face: Math.PI }],
    },
    cast: {
      moses: ['mosesE', -0.05, -0.15, 3],
      man: ['hebrew', -0.5, 0.25, 2.8],
      wom: ['woman', 0.35, 0.22, 3.2],
      elder: ['elder', 0.75, 0.3, 3],
    },
    beats: {
      enter: [['mount', 'smoke'], ['moses', 'idle', { x: 0.05, z: -0.5, look: 3 }], ['man', 'kneel', { look: 3 }], ['wom', 'kneel', { look: 3 }], ['elder', 'bow', { look: 3 }]],
      intro: [['@env', 'storm'], ['mount', 'smoke'], ['moses', 'idle', { x: -0.05, z: -0.15, look: 3 }], ['man', 'afraid', { look: 3 }], ['wom', 'cower', { look: 3 }], ['elder', 'afraid', { look: 3 }]],
      // 자기소개: 너를 종살이하던 집에서 이끌어 낸 주
      'p0.1': [['moses', 'listen', { look: 3 }]],
      'p0.4': [['man', 'kneel'], ['wom', 'kneel'], ['elder', 'kneel']],
      'p1.0': [['@env', 'overcast']],
      'p1.5': [['elder', 'bow']],
      // 떨며 멀찍이 서서 — 모세가 대신 말해 달라
      'p2.0': [['@env', 'storm'], ['man', 'afraid', { z: 0.4 }], ['wom', 'cower', { z: 0.4 }], ['elder', 'afraid', { z: 0.45 }]],
      'p2.1': [['man', 'speak', { to: 'moses' }], ['moses', 'idle', { look: 0 }]],
      'p2.6': [['moses', 'idle', { x: 0.05, z: -0.6, look: 3 }], ['moses', 'idle', { show: 0.4, delay: 3000 }]],
      w0: [['moses', 'listen', { look: 3 }]],
      w1: [['moses', 'listen', { look: 3 }]],
      w2: [['man', 'speak', { to: 'moses' }]],
      w3: [['moses', 'speak', { show: 1, look: 0, to: 'man' }]],
      end: [['@env', 'storm']],
    },
  },

  /* m18. 언약의 피 — 산기슭의 제단과 열두 돌기둥. 소를 바치고, 언약의 책을 읽고, 피를 뿌린다. 장로들이 산에 올라 하나님을 뵙는다(맑은 빛) */
  m18: {
    env: 'dawn', wide: 1.4,
    props: {
      sand: ['sand', 0, 0.15, { r: 1.9, color: '#c9a882' }],
      mount: ['mountain', 0.1, -1.3, { h: 1.9, r: 1.25 }],
      altar: ['altar', 0, -0.45],
      stones: ['pillars12', 0, -0.2, { r: 0.75 }],
      ox: ['ox', -0.9, 0.0, { rot: 0.3 }],
      folk: ['crowd', 0, 0.48, { spots: [...flock(7, 0.32, 0.2, 15).map(([x, z]) => [x - 1.05, z]), ...flock(7, 0.32, 0.2, 16).map(([x, z]) => [x + 1.05, z])], face: Math.PI }],
    },
    cast: {
      moses: ['mosesE', 0.25, -0.1, -0.4],
      aaron: ['aaron', -0.25, -0.1, 0.4],
      youth: ['hebrew2', -0.65, 0.05, 0.6],
      man: ['hebrew', 0.55, 0.25, 2.8],
      elder: ['elder', -0.45, 0.3, 3],
    },
    beats: {
      enter: [['altar', 'fire'], ['moses', 'bless', { look: 3, to: 'man' }], ['ox', null, { show: 0 }]],
      intro: [['mount', 'calm'], ['altar', 'idle'], ['stones', null, { show: 0 }], ['ox', null, { show: 0 }], ['youth', 'idle', { show: 0 }], ['moses', 'idle', { x: 0.25, z: 0.05, look: 3 }]],
      'p0.0': [['moses', 'speak', { to: 'man' }]],
      'p0.4': [['@env', 'dawn'], ['moses', 'idle', { x: 0.25, z: -0.1, look: -0.4 }], ['stones', null, { show: 1, delay: 1500 }], ['altar', 'idle', { show: 1 }]],
      // 젊은이들이 번제를 드린다
      'p0.5': [['youth', 'idle', { show: 1 }], ['ox', null, { show: 1 }], ['altar', 'fire', { delay: 2500 }], ['ox', null, { show: 0, delay: 5000 }]],
      'p1.0': [['@env', 'day'], ['moses', 'raise', { look: 0 }]],
      // 언약의 책을 읽어 들려준다
      'p1.1': [['moses', 'idle', { x: 0.2, z: 0.15, look: 3, item: 'scroll' }]],
      'p1.3': [['man', 'raise'], ['elder', 'raise']],
      // 백성에게 피를 뿌린다
      'p1.4': [['moses', 'bless', { item: null, to: 'man' }], ['man', 'bow'], ['elder', 'bow']],
      // 장로들과 산에 올라 하나님을 뵙는다 — 청보석 같은 맑은 하늘
      'p2.0': [['moses', 'idle', { x: 0.1, z: -0.75, look: 3 }], ['aaron', 'idle', { x: -0.15, z: -0.7, look: 3 }], ['elder', 'idle', { x: -0.4, z: -0.65, look: 3 }]],
      'p2.1': [['@env', 'glory']],
      'p2.2': [['moses', 'look-up'], ['aaron', 'look-up'], ['elder', 'look-up']],
      'p2.3': [['mount', 'cloud'], ['aaron', 'idle', { x: -0.25, z: -0.1, look: 0 }], ['elder', 'idle', { x: -0.45, z: 0.3 }], ['moses', 'idle', { show: 0, delay: 3000 }]],
      w0: [['moses', 'listen', { look: 3 }]],
      w1: [['moses', 'speak', { show: 1, x: 0.2, z: 0.15, to: 'man' }]],
      w2: [['man', 'speak', { to: 'moses' }]],
      end: [['mount', 'cloud']],
    },
  },

  /* m19. 금송아지 — 산 아래 진. 아론이 금을 녹여 송아지를 만들고 백성은 먹고 마시며 뛰논다.
     돌판을 들고 내려온 모세가 그것을 깨뜨리고, 송아지는 불살라 사라진다 */
  m19: {
    wide: 1.4,
    props: {
      sand: ['sand', 0, 0.15, { r: 1.9, color: '#c9a882' }],
      mount: ['mountain', -0.9, -1.3, { h: 1.7, r: 1.1, state: 'cloud' }],
      calf: ['calf', 0.0, -0.3, { scale: 1.5 }],
      fire: ['fire', -0.3, 0.1],
      folk: ['crowd', 1.05, -0.1, { spots: flock(12, 0.35, 0.35, 14), face: -Math.PI / 2 }],
    },
    cast: {
      aaron: ['aaron', -0.35, -0.2, 0.6],
      man: ['hebrew', 0.75, 0.0, -0.8],
      wom: ['woman', 0.95, 0.25, -1],
      wom2: ['woman2', 0.45, 0.25, -0.6],
      moses: ['mosesE', -1.2, -0.55, 1],
      joshua: ['joshua', -1.4, -0.45, 1],
    },
    beats: {
      enter: [['calf', null, { show: 1 }], ['man', 'raise'], ['wom', 'raise'], ['wom2', 'raise'], ['moses', 'raise', { show: 1, x: -0.85, z: 0.0, look: 1, item: 'tablets' }], ['joshua', 'idle', { x: -1.1, z: -0.1 }]],
      intro: [['calf', null, { show: 0 }], ['fire', null, { show: 0 }], ['moses', 'idle', { show: 0, x: -1.2, z: -0.55, item: 'tablets' }], ['joshua', 'idle', { show: 0 }], ['man', 'idle'], ['wom', 'idle'], ['wom2', 'idle'], ['aaron', 'idle']],
      // 앞서 갈 신을 만들어 달라
      'p0.3': [['man', 'rebuke', { to: 'aaron' }], ['wom', 'point', { look: -1 }]],
      'p0.5': [['fire', null, { show: 1 }], ['aaron', 'kneel', { look: 0.8 }], ['calf', null, { show: 1, delay: 3000 }], ['aaron', 'idle', { delay: 3500 }]],
      'p1.0': [['aaron', 'raise', { look: 0.6 }]],
      // 먹고 마시며 일어나 뛰논다
      'p1.2': [['man', 'raise', { x: 0.65, z: 0.1 }], ['wom', 'raise', { x: 0.85, z: 0.2, delay: 400 }], ['wom2', 'raise', { x: 0.55, z: 0.3, delay: 800 }],
        ['man', 'raise', { x: 0.85, z: -0.05, delay: 3000 }], ['wom', 'raise', { x: 1.05, z: 0.25, delay: 3400 }], ['wom2', 'raise', { x: 0.4, z: 0.2, delay: 3800 }]],
      // 산 위에서 엎드려 비는 모세 (멀리)
      'p1.4': [['moses', 'pray', { show: 1, look: 0.4 }]],
      // 돌판을 들고 내려온다
      'p2.0': [['joshua', 'idle', { show: 1 }], ['moses', 'idle', { x: -0.85, z: 0.0, look: 1 }], ['joshua', 'idle', { x: -1.1, z: -0.1, look: 1 }], ['man', 'idle'], ['wom', 'idle'], ['wom2', 'idle']],
      // 돌판을 깨뜨리고, 송아지를 불사른다
      'p2.2': [['moses', 'raise'], ['moses', 'rebuke', { item: null, delay: 2200 }], ['man', 'afraid', { delay: 2200 }], ['wom', 'cower', { delay: 2200 }], ['wom2', 'afraid', { delay: 2200 }], ['aaron', 'bow', { delay: 2600 }],
        ['calf', null, { show: 0, delay: 4500 }], ['fire', null, { show: 0, delay: 6000 }]],
      // 다시 주께 올라가 용서를 빈다
      'p2.4': [['moses', 'idle', { x: -1.1, z: -0.55, look: -2.6 }], ['moses', 'pray', { look: 3, delay: 3500 }]],
      w0: [['moses', 'listen', { look: 0.4 }]],
      w1: [['moses', 'pray', { look: 3 }]],
      w2: [['aaron', 'speak', { to: 'moses' }]],
      end: [],
    },
  },

  /* m20. 지나가는 영광 — 새벽 어스름의 산비탈, 모세는 새로 깎은 돌판 둘을 들고 홀로 오른다. 바위 틈에 선 그의 앞으로 빛이 지나간다 */
  m20: {
    env: 'dawn', wide: 1.2,
    props: {
      sand: ['sand', 0, 0, { r: 1.6, color: '#b08868', stones: 26 }],
      mount: ['mountain', 0.6, -1.15, { h: 1.7, r: 1.0 }],
      cleft: ['rocks', 0, 0, { spots: [[-0.45, -0.2, 0.28], [-0.05, -0.32, 0.24], [0.35, -0.25, 0.2]] }],
      glory: ['beam', 1.4, 0.1, { r: 0.6, h: 2.8, peak: 0.6, speed: 0.25 }],
    },
    cast: {
      moses: ['mosesE', -0.9, 0.3, 0.8],
    },
    beats: {
      enter: [['moses', 'kneel', { x: -0.22, z: -0.05, look: 1, item: 'tablets' }], ['glory', null, { x: 0.3, z: 0.15 }]],
      intro: [['@env', 'overcast'], ['glory', null, { show: 0, x: 1.4, z: 0.1 }], ['moses', 'idle', { x: -0.9, z: 0.3, item: null }]],
      'p0.1': [['moses', 'pray', { look: 0.6 }]],
      'p0.4': [['moses', 'look-up', { look: 0.6 }]],
      // 바위 틈에 두고 손으로 덮어 주신다
      'p1.2': [['moses', 'idle', { x: -0.22, z: -0.05, look: 1 }]],
      // 새 돌판 둘을 들고 새벽 어스름에 홀로
      'p1.3': [['@env', 'dawn'], ['moses', 'idle', { item: 'tablets' }]],
      // 구름 가운데 내려와 그 앞을 지나가신다
      'p2.0': [['glory', null, { show: 1, x: 1.0 }], ['glory', null, { x: -1.2, delay: 1500 }], ['moses', 'bow', { delay: 1000 }]],
      'p2.2': [['moses', 'kneel', { look: 1 }], ['glory', null, { show: 0, delay: 4000 }]],
      w0: [['moses', 'bow']],
      w1: [['moses', 'listen', { look: 0.8 }]],
      w2: [['moses', 'speak', { look: 0.6 }]],
      end: [['@env', 'glory']],
    },
  },

  /* m21. 성막에 가득한 영광 — 진영 한복판에 성막이 차례로 세워지고, 증거궤가 들어간다. 구름이 회막을 덮고 영광이 가득하다 */
  m21: {
    wide: 1.45,
    props: {
      sand: ['sand', 0, 0.1, { r: 2.0, color: '#d2bc90' }],
      mount: ['mountain', -1.3, -1.35, { h: 1.5, r: 0.9 }],
      tab: ['tabernacle', 0.0, -0.4, { scale: 1.25 }],
      ark: ['arkc', 0.9, 0.45],
      cloud: ['pillar', -0.38, -0.45, { h: 1.3 }],
      tent: ['tent', -1.25, 0.2, { w: 0.6 }], tent2: ['tent', 1.35, -0.45, { w: 0.6, color: '#4a3c30' }],
      folk: ['crowd', 0, 0.3, { spots: [...flock(6, 0.25, 0.25, 17).map(([x, z]) => [x - 1.25, z]), ...flock(6, 0.25, 0.25, 18).map(([x, z]) => [x + 1.3, z])], face: Math.PI }],
    },
    cast: {
      moses: ['mosesE', 0.6, 0.35, -0.8],
      aaron: ['aaronP', 0.85, 0.2, -0.8],
      man: ['hebrew', -0.75, 0.45, 0.6],
      wom: ['woman', -0.5, 0.55, 0.6],
    },
    beats: {
      enter: [['tab', null, { show: 1 }], ['ark', null, { show: 0 }], ['cloud', 'cloud', { show: 1 }], ['moses', 'bow', { look: -1 }], ['aaron', 'pray', { look: -1 }]],
      intro: [['tab', null, { show: 0 }], ['ark', null, { show: 0, x: 0.9, z: 0.35 }], ['cloud', 'cloud', { show: 0 }], ['moses', 'idle'], ['aaron', 'idle', { show: 0 }]],
      // 은 받침이 놓이고 금 입힌 널판이 세워진다
      'p0.2': [['tab', null, { show: 0.5 }]],
      'p0.3': [['tab', null, { show: 0.8 }]],
      // 증거판을 궤에 넣는다
      'p1.0': [['ark', null, { show: 1 }], ['moses', 'kneel', { x: 0.75, z: 0.3, look: 0.6 }]],
      'p1.1': [['moses', 'idle'], ['ark', null, { x: -0.38, z: -0.45 }], ['ark', null, { show: 0, delay: 3500 }], ['moses', 'idle', { x: 0.45, z: 0.15, look: -1 }]],
      'p1.3': [['tab', null, { show: 1 }], ['aaron', 'idle', { show: 1 }]],
      // 구름이 회막을 덮고 영광이 가득하다
      'p2.0': [['cloud', 'cloud', { show: 1 }], ['@env', 'glory']],
      'p2.1': [['moses', 'bow', { look: -1 }], ['aaron', 'pray', { look: -1 }], ['man', 'kneel'], ['wom', 'kneel']],
      'p2.2': [['@env', 'day'], ['moses', 'idle'], ['aaron', 'idle'], ['man', 'look-up'], ['wom', 'look-up']],
      'p2.3': [['@env', 'night'], ['cloud', 'fire']],
      w0: [['moses', 'listen', { look: -1 }]],
      w1: [['moses', 'bless', { to: 'aaron' }], ['aaron', 'bow']],
      end: [['@env', 'night'], ['cloud', 'fire', { show: 1 }], ['tab', null, { show: 1 }]],
    },
  },
  /* m22. 탐욕의 무덤 — 진영 끝의 불은 모세의 기도로 꺼지고, 장막 문마다 우는 백성. 칠십 장로에게 영이 내리고(빛),
     바다 쪽 바람에 메추라기 떼가 진을 덮는다. 재앙은 그리지 않는다 — 어둑해지는 빛과 엎드린 사람들로만 */
  m22: {
    wide: 1.4,
    props: {
      sand: ['sand', 0, 0, { r: 1.9, color: '#cdb68a' }],
      tent: ['tent', -1.0, -0.5, { w: 0.75 }], tent2: ['tent', 0.15, -0.7, { w: 0.7, color: '#4a3c30' }], tent3: ['tent', 1.15, -0.45, { w: 0.65 }],
      fire: ['fire', 1.35, 0.1, { scale: 1.6 }],
      elders: ['crowd', -0.35, -0.15, { spots: [[-0.5, 0], [-0.3, 0.1], [-0.1, 0.05], [0.1, 0.1], [0.3, 0.02], [0.5, 0.08]], face: 0 }],
      spirit: ['beam', -0.35, -0.15, { r: 0.75, h: 2.6, peak: 0.45 }],
      quail: ['swarm', 0.3, 0.0, { color: '#7a6448', dot: 0.045, n: 140 }],
    },
    cast: {
      moses: ['mosesE', 0.2, 0.15, 0.6],
      man: ['hebrew', 0.85, 0.3, -0.8],
      wom: ['woman', -0.85, 0.3, 0.6],
      kid: ['child', -0.6, 0.45, 0.6],
      joshua: ['joshua', 0.45, 0.0, -0.4],
    },
    beats: {
      enter: [['fire', null, { show: 0 }], ['spirit', null, { show: 0 }], ['quail', null, { show: 1 }], ['man', 'bow', { item: 'basket' }], ['wom', 'bow', { item: 'basket' }], ['kid', 'look-up'], ['moses', 'idle', { look: 0.4 }]],
      intro: [['fire', null, { show: 0 }], ['elders', null, { show: 0 }], ['spirit', null, { show: 0 }], ['quail', null, { show: 0 }], ['man', 'idle', { item: null }], ['wom', 'idle', { item: null }], ['kid', 'idle'], ['joshua', 'idle', { show: 0 }]],
      // 진영 끝자락의 원망 — 불이 일었다가 모세의 기도로 꺼진다
      'p0.0': [['man', 'rebuke', { look: -0.6 }]],
      'p0.1': [['fire', null, { show: 1 }], ['man', 'afraid', { look: 1.3 }], ['moses', 'pray', { delay: 1500 }], ['fire', null, { show: 0, delay: 4500 }]],
      'p0.3': [['moses', 'idle'], ['man', 'idle']],
      // 장막 문마다 운다
      'p1.3': [['wom', 'mourn'], ['kid', 'mourn'], ['man', 'mourn']],
      'p1.4': [['moses', 'kneel', { look: -0.2 }]],
      // 칠십 장로에게 영을 나누신다
      'p1.6': [['moses', 'idle', { look: -1 }], ['elders', null, { show: 1 }], ['spirit', null, { show: 1, delay: 1500 }], ['spirit', null, { show: 0, delay: 6000 }], ['joshua', 'idle', { show: 1 }]],
      // 바다 쪽 바람과 메추라기 떼
      'p2.0': [['elders', null, { show: 0 }], ['quail', null, { show: 1 }], ['wom', 'look-up'], ['kid', 'look-up'], ['man', 'look-up']],
      'p2.2': [['man', 'bow', { item: 'basket' }], ['wom', 'bow', { item: 'basket' }], ['kid', 'kneel'], ['@env', 'dusk'], ['@env', 'night', { delay: 5000 }]],
      // 큰 재앙 — 빛이 어두워지고 사람들은 엎드린다
      'p2.3': [['@env', 'overcast'], ['quail', null, { show: 0 }], ['man', 'mourn', { item: null }], ['wom', 'kneel', { item: null }], ['kid', 'mourn']],
      'p2.4': [['moses', 'mourn']],
      w0: [['moses', 'listen', { look: 0.3 }]],
      w1: [['moses', 'listen', { look: 0.3 }]],
      w2: [['joshua', 'idle', { show: 1 }], ['moses', 'speak', { to: 'joshua' }]],
      end: [['@env', 'overcast']],
    },
  },

  /* m23. 열두 정탐꾼 — 가데스의 진영. 두 사람이 막대에 꿴 포도송이를 메고 돌아오고, 열 사람은 고개를 젓고 갈렙과 여호수아만 올라가자 한다.
     밤의 울음, 돌을 들려는 무리 — 회막 위에 영광이 나타난다 */
  m23: {
    wide: 1.4,
    props: {
      sand: ['sand', 0, 0, { r: 1.9, color: '#cdb68a' }],
      tab: ['tabernacle', -0.95, -0.6, { scale: 0.85 }],
      glory: ['pillar', -1.05, -0.65, { h: 1.3 }],
      grapes: ['grapepole', 1.15, 0.2, { speed: 0.4 }],
      spies: ['crowd', 0.45, -0.2, { spots: flock(8, 0.3, 0.18, 20), face: 0 }],
      folk: ['crowd', -1.2, 0.3, { spots: flock(10, 0.3, 0.25, 21), face: Math.PI / 2 }],
    },
    cast: {
      moses: ['mosesE', -0.45, -0.05, 0.8],
      aaron: ['aaron', -0.7, 0.1, 0.8],
      joshua: ['joshua', 0.0, 0.15, -0.8],
      caleb: ['caleb', 0.25, 0.3, -0.8],
      sp1: ['hebrew', 0.95, 0.2, -1, { speed: 0.4 }],
      sp2: ['hebrew2', 1.4, 0.2, -1, { speed: 0.4 }],
    },
    beats: {
      enter: [['glory', 'cloud', { show: 0 }], ['grapes', null, { x: 0.68, z: 0.2 }], ['sp1', 'idle', { x: 0.45, z: 0.2 }], ['sp2', 'idle', { x: 0.9, z: 0.2 }], ['caleb', 'raise', { to: 'moses' }], ['joshua', 'idle']],
      intro: [['glory', 'cloud', { show: 0 }], ['grapes', null, { show: 0, x: 1.9, z: 0.2 }], ['sp1', 'idle', { show: 0, x: 1.7, z: 0.2 }], ['sp2', 'idle', { show: 0, x: 2.15, z: 0.2 }], ['spies', null, { show: 1 }], ['folk', null, { show: 0 }],
        ['joshua', 'idle', { x: 0.0, z: 0.15 }], ['caleb', 'idle', { x: 0.25, z: 0.3 }]],
      'p0.0': [['moses', 'speak', { to: 'joshua' }]],
      'p0.1': [['moses', 'bless', { to: 'joshua' }], ['joshua', 'bow']],
      // 사십 일 동안 그 땅을 살핀다 (무대를 떠났다가)
      'p0.3': [['moses', 'idle'], ['joshua', 'idle', { x: 1.8, z: 0.1 }], ['caleb', 'idle', { x: 1.9, z: 0.3 }], ['spies', null, { x: 1.9, show: 0 }], ['joshua', 'idle', { show: 0, delay: 3200 }], ['caleb', 'idle', { show: 0, delay: 3200 }]],
      // 두 사람이 막대에 꿴 포도송이를 메고 돌아온다
      'p1.0': [['grapes', null, { show: 1, x: 0.68, z: 0.2 }], ['sp1', 'idle', { show: 1, x: 0.45, z: 0.2 }], ['sp2', 'idle', { show: 1, x: 0.9, z: 0.2 }], ['folk', null, { show: 1 }],
        ['joshua', 'idle', { show: 1, x: 0.0, z: 0.15, look: -0.8 }], ['caleb', 'idle', { show: 1, x: 0.25, z: 0.35, look: -0.8 }]],
      'p1.2': [['moses', 'raise', { look: 1 }]],
      // 열 사람은 메뚜기 같았다고 — 갈렙만이 올라가자
      'p1.3': [['moses', 'idle'], ['sp1', 'shrug', { look: -1 }], ['sp2', 'afraid', { look: -1 }]],
      'p1.4': [['caleb', 'raise', { to: 'moses' }]],
      // 밤새 운다
      'p2.0': [['@env', 'night'], ['sp1', 'mourn'], ['sp2', 'mourn'], ['caleb', 'idle']],
      'p2.1': [['sp1', 'rebuke', { to: 'moses' }]],
      'p2.2': [['joshua', 'mourn'], ['caleb', 'mourn'], ['sp2', 'rebuke', { to: 'caleb' }]],
      // 회막 위의 영광
      'p2.5': [['@env', 'dusk'], ['glory', 'cloud', { show: 1 }], ['sp1', 'cower'], ['sp2', 'cower'], ['moses', 'bow', { look: -1.5 }]],
      w0: [['caleb', 'idle', { look: -0.8 }]],
      w1: [['moses', 'listen', { look: -1.5 }]],
      w2: [['caleb', 'speak', { to: 'moses' }]],
      end: [],
    },
  },

  /* m24. 싹 난 지팡이 — 고라의 무리가 모세와 아론 앞에 맞선다. 땅이 갈라지고 불이 사른 일은 그리지 않는다(무리가 사라질 뿐).
     아론이 향로를 들고 산 자와 죽은 자 사이에 선다. 이튿날 아침 증거궤 앞의 열두 지팡이 가운데 아론의 것에 꽃이 핀다 */
  m24: {
    wide: 1.35,
    props: {
      sand: ['sand', 0, 0, { r: 1.9, color: '#cdb68a' }],
      tab: ['tabernacle', -0.85, -0.55, { scale: 0.9 }],
      ark: ['arkc', 0.15, -0.35],
      rods: ['rods', 0.15, -0.2],
      rebels: ['crowd', 0.95, 0.15, { spots: flock(10, 0.35, 0.25, 22), face: -Math.PI / 2 }],
      censer: ['fire', -0.2, 0.3, { scale: 0.5 }],
    },
    cast: {
      moses: ['mosesE', -0.3, 0.05, 1],
      aaron: ['aaronP', -0.55, 0.2, 1],
      korah: ['levi', 0.55, 0.1, -1],
      dathan: ['hebrew2', 0.75, 0.3, -1],
    },
    beats: {
      enter: [['rods', 'bloom'], ['rebels', null, { show: 0 }], ['censer', null, { show: 0 }], ['korah', 'idle', { show: 0 }], ['dathan', 'idle', { show: 0 }], ['moses', 'raise', { x: -0.05, z: -0.05, look: 0.6 }], ['aaron', 'pray', { x: 0.35, z: 0.0, look: -0.6 }]],
      intro: [['rods', 'dry', { show: 0 }], ['ark', null, { show: 0 }], ['censer', null, { show: 0 }], ['rebels', null, { show: 1 }], ['korah', 'idle', { show: 1 }], ['dathan', 'idle', { show: 1 }]],
      'p0.0': [['korah', 'rebuke', { to: 'moses' }]],
      'p0.1': [['dathan', 'rebuke', { to: 'aaron' }], ['moses', 'kneel', { look: 0.6 }]],
      'p0.2': [['dathan', 'idle', { x: 1.2, z: 0.4, look: 1 }]],
      // 땅이 갈라지고 불이 — 무리가 사라진다 (그리지 않는다)
      'p1.0': [['@env', 'dark'], ['moses', 'idle'], ['korah', 'idle', { show: 0, delay: 1500 }], ['dathan', 'idle', { show: 0, delay: 1500 }]],
      'p1.2': [['rebels', null, { show: 0, delay: 800 }]],
      // 향로를 들고 산 자와 죽은 자 사이에 선 아론
      'p1.4': [['@env', 'overcast'], ['aaron', 'idle', { x: 0.35, z: 0.3, look: 1 }], ['censer', null, { show: 1, x: 0.35, z: 0.42, delay: 1500 }], ['aaron', 'pray', { delay: 2000 }]],
      // 열두 지팡이를 증거궤 앞에
      'p2.0': [['@env', 'night'], ['censer', null, { show: 0 }], ['ark', null, { show: 1 }], ['rods', 'dry', { show: 1 }], ['aaron', 'idle', { x: -0.55, z: 0.2, look: 0.6 }], ['moses', 'idle', { x: -0.3, z: 0.05, look: 0.8 }]],
      // 이튿날 아침 — 싹이 돋고 꽃이 피고 아몬드가
      'p2.3': [['@env', 'dawn'], ['moses', 'idle', { x: -0.05, z: -0.05, look: 0.6 }], ['rods', 'bloom', { delay: 1500 }], ['moses', 'raise', { delay: 2500 }]],
      'p2.4': [['aaron', 'pray', { x: 0.35, z: 0.0, look: -0.6 }]],
      w0: [['moses', 'listen', { look: 0.6 }]],
      w1: [['moses', 'listen', { look: 0.6 }]],
      w2: [['moses', 'speak', { look: 0.8 }]],
      end: [['@env', 'dawn']],
    },
  },

  /* m25. 므리바의 물 — 미리암을 묻은 가데스(작은 돌무더기 무덤에 우는 사람들). 물이 떨어져 백성이 몰려오고,
     모세는 바위에 말하는 대신 두 번 내리친다. 물은 콸콸 쏟아지지만 무대는 무거운 빛으로 저문다 */
  m25: {
    wide: 1.35,
    props: {
      sand: ['sand', 0, 0, { r: 1.9, color: '#c2a27e', stones: 24 }],
      rock: ['rockspring', 0.6, -0.4, { scale: 1.25 }],
      grave: ['rocks', -1.0, -0.35, { spots: [[0, 0, 0.09], [0.1, 0.05, 0.07], [-0.08, 0.06, 0.07], [0.02, 0.12, 0.06], [0.0, 0.05, 0.05]] }],
      tab: ['tabernacle', -0.2, -0.75, { scale: 0.75 }],
      glory: ['beam', -0.2, -0.65, { r: 0.55, h: 2.4, peak: 0.5 }],
      folk: ['crowd', 1.25, 0.25, { spots: flock(10, 0.3, 0.25, 23), face: -Math.PI / 2 }],
    },
    cast: {
      moses: ['mosesE', -0.35, 0.05, -1],
      aaron: ['aaronP', -0.6, 0.2, -1],
      wom: ['woman', -0.9, 0.0, -2.6],
      man: ['hebrew', 0.25, 0.25, -0.8],
    },
    beats: {
      enter: [['rock', 'flow'], ['glory', null, { show: 0 }], ['moses', 'raise', { x: 0.2, z: -0.15, look: 0.8 }], ['aaron', 'idle', { x: -0.05, z: 0.0 }], ['man', 'kneel', { x: 0.75, z: 0.05, look: -0.3 }]],
      intro: [['rock', 'dry'], ['glory', null, { show: 0 }], ['folk', null, { show: 0 }], ['moses', 'mourn', { x: -0.6, z: -0.1, look: -1.2 }], ['aaron', 'mourn', { x: -0.75, z: 0.1, look: -1.2 }], ['wom', 'mourn'], ['man', 'idle', { show: 0 }]],
      // 미리암이 숨을 거두어 묻혔다
      'p0.2': [['wom', 'kneel', { look: -2.6 }]],
      // 물이 떨어지고, 백성이 몰려와 다툰다
      'p0.4': [['wom', 'idle', { show: 0 }], ['moses', 'idle', { x: -0.35, z: 0.05, look: 0.6 }], ['aaron', 'idle', { x: -0.6, z: 0.2, look: 0.6 }]],
      'p1.0': [['folk', null, { show: 1 }], ['man', 'rebuke', { show: 1, to: 'moses' }]],
      // 회막 문에 엎드리자 영광이 나타난다
      'p1.3': [['moses', 'kneel', { x: -0.3, z: -0.4, look: 3 }], ['aaron', 'kneel', { x: -0.5, z: -0.35, look: 3 }], ['glory', null, { show: 1, delay: 1200 }]],
      // 거역하는 자들아 — 바위를 두 번 내리친다
      'p2.1': [['glory', null, { show: 0 }], ['moses', 'rebuke', { x: 0.2, z: -0.15, look: -0.6, to: 'man' }], ['aaron', 'idle', { x: -0.05, z: 0.0, look: 0.6 }]],
      'p2.2': [['moses', 'raise', { look: 0.8 }], ['moses', 'idle', { delay: 900 }], ['moses', 'raise', { delay: 1800 }], ['rock', 'flow', { delay: 2600 }]],
      'p2.3': [['man', 'kneel', { x: 0.75, z: 0.05, look: -0.3 }], ['moses', 'idle']],
      // 그 땅에 들어가지 못하리라
      'p2.5': [['@env', 'dusk'], ['moses', 'mourn', { look: -0.4 }], ['aaron', 'mourn']],
      w0: [['moses', 'listen', { look: 3 }]],
      w1: [['moses', 'listen', { look: 3 }]],
      w2: [['moses', 'rebuke', { to: 'man' }]],
      end: [['@env', 'dusk']],
    },
  },

  /* m26. 호르산의 아론 — 붉은 바위산 꼭대기로 세 사람이 오르고, 아론의 대제사장 옷이 엘르아살에게 옮겨 간다.
     아론은 산 위에서 빛 속으로 사라지고(죽음은 그리지 않는다), 아래 진영은 삼십 일을 운다 */
  m26: {
    env: 'dusk', wide: 1.4,
    props: {
      sand: ['sand', 0, 0.2, { r: 1.9, color: '#c2a888' }],
      hill: ['hill', 0.55, -0.45, { w: 1.1, h: 0.55, d: 0.6, color: '#a0624a', soft: true }],
      light: ['beam', 0.55, -0.45, { r: 0.4, h: 2.4, peak: 0.45 }],
      folk: ['crowd', -0.85, 0.35, { spots: flock(12, 0.5, 0.2, 24), face: -0.5 }],
    },
    cast: {
      moses: ['mosesE', 0.35, -0.42, 0.4],
      aaron: ['aaronP', 0.55, -0.5, 0],
      aaronP2: ['aaron', 0.55, -0.5, 0],
      eleazar: ['hebrew2', 0.78, -0.42, -0.4],
      eleazarP: ['eleazar', 0.78, -0.42, -0.4],
    },
    beats: {
      enter: [['light', null, { show: 1 }], ['aaron', 'idle', { show: 0 }], ['aaronP2', 'idle', { show: 0 }], ['eleazar', 'idle', { show: 0 }], ['eleazarP', 'idle', { show: 1, x: -0.3, z: 0.25, look: 0 }], ['moses', 'mourn', { x: 0.0, z: 0.15 }], ['folk', null, { show: 1 }]],
      intro: [['light', null, { show: 0 }], ['aaron', 'idle', { show: 1, x: -0.2, z: 0.25 }], ['aaronP2', 'idle', { show: 0 }], ['eleazar', 'idle', { show: 1, x: 0.05, z: 0.3 }], ['eleazarP', 'idle', { show: 0 }], ['moses', 'idle', { x: -0.45, z: 0.2, look: 0.6 }]],
      'p0.1': [['@env', 'dusk']],
      'p0.3': [['aaron', 'bow', { look: -0.8 }], ['moses', 'mourn']],
      // 온 회중이 지켜보는 가운데 산을 오른다
      'p1.0': [['moses', 'idle', { x: 0.35, z: -0.42, look: 0.4 }], ['aaron', 'idle', { x: 0.55, z: -0.5, look: 0 }], ['eleazar', 'idle', { x: 0.78, z: -0.42, look: -0.4 }]],
      // 형의 옷을 벗겨 엘르아살에게
      'p1.2': [['aaron', 'idle', { show: 0 }], ['aaronP2', 'idle', { show: 1, x: 0.55, z: -0.5 }], ['eleazar', 'idle', { show: 0 }], ['eleazarP', 'idle', { show: 1, x: 0.78, z: -0.42, look: -0.6 }], ['moses', 'bless', { to: 'eleazarP' }]],
      // 아론은 산꼭대기에서 — 빛 속으로
      'p2.0': [['@env', 'dark'], ['light', null, { show: 1 }], ['aaronP2', 'pray'], ['aaronP2', 'idle', { show: 0, delay: 3000 }], ['moses', 'mourn', { delay: 1000 }], ['eleazarP', 'mourn', { delay: 1000 }]],
      'p2.1': [['@env', 'dusk'], ['light', null, { show: 0 }], ['moses', 'idle', { x: 0.0, z: 0.15, look: -0.6 }], ['eleazarP', 'idle', { x: -0.3, z: 0.25, look: 0 }]],
      'p2.2': [['moses', 'mourn']],
      'p2.3': [['eleazarP', 'idle', { look: 0 }]],
      w0: [['moses', 'listen', { look: 0.6 }], ['aaron', 'listen', { look: 0.4 }]],
      w1: [['moses', 'listen', { look: 0.4 }]],
      end: [['@env', 'dusk']],
    },
  },

  /* m27. 장대 위의 놋뱀 — 아라바의 뜨거운 바람. 원망하던 진영에 불뱀이 나타나고(무는 모습은 없이) 사람들이 엎드려 빈다.
     모세가 놋뱀을 장대 끝에 높이 세우자, 쓰러진 이들이 고개를 들어 쳐다보고 일어난다 */
  m27: {
    wide: 1.35,
    props: {
      sand: ['sand', 0, 0, { r: 1.9, color: '#d0a87a' }],
      pole: ['brasspole', 0.1, -0.35],
      snakes: ['snakes', 0, 0.15, { n: 11, r: 1.0 }],
      tent: ['tent', -1.15, -0.45, { w: 0.65 }], tent2: ['tent', 1.15, -0.5, { w: 0.65, color: '#4a3c30' }],
      folk: ['crowd', 0.95, 0.3, { spots: flock(9, 0.35, 0.2, 25), face: -Math.PI / 2 }],
    },
    cast: {
      moses: ['mosesE', -0.15, -0.15, 0.6],
      man: ['hebrew', 0.45, 0.25, -0.8],
      wom: ['woman', -0.6, 0.3, 0.6],
      kid: ['child', -0.35, 0.45, 0.4],
      old: ['elder', 0.75, 0.05, -1],
    },
    beats: {
      enter: [['snakes', null, { show: 0 }], ['moses', 'raise', { look: 0.6 }], ['man', 'look-up', { look: -0.6 }], ['wom', 'look-up', { look: 0.6 }], ['kid', 'look-up'], ['old', 'kneel', { look: -1 }]],
      intro: [['pole', null, { show: 0 }], ['snakes', null, { show: 0 }], ['man', 'idle'], ['wom', 'idle'], ['kid', 'idle'], ['old', 'idle']],
      'p0.3': [['@env', 'overcast']],
      // 하나님과 모세를 향해 쏟아 낸다
      'p1.0': [['man', 'rebuke', { to: 'moses' }], ['old', 'rebuke', { to: 'moses' }]],
      // 불뱀들이 진영에 — 사람들이 쓰러진다
      'p1.3': [['snakes', null, { show: 1 }], ['man', 'afraid'], ['wom', 'cower'], ['kid', 'cower'], ['old', 'kneel'], ['@env', 'dusk']],
      'p1.4': [['man', 'kneel', { x: 0.2, z: 0.1, look: -1 }], ['old', 'pray', { look: -1 }]],
      // 기도하자 — 놋뱀을 만들어 장대 끝에 높이
      'p2.0': [['moses', 'pray', { look: 0.4 }]],
      'p2.2': [['@env', 'day'], ['pole', null, { show: 1 }], ['moses', 'raise', { look: 0.6 }]],
      // 고개를 들어 쳐다보면 산다
      'p2.3': [['snakes', null, { show: 0 }], ['man', 'look-up', { x: 0.45, z: 0.25, look: -0.6 }], ['wom', 'look-up', { look: 0.6 }], ['kid', 'look-up'], ['old', 'look-up']],
      w0: [['moses', 'listen', { look: 0.4 }]],
      w1: [['old', 'speak', { to: 'moses' }], ['man', 'kneel']],
      end: [],
    },
  },

  /* m28. 요단 동쪽을 얻다 — 왕의 큰길 앞. 사신이 정중히 청하지만 시혼은 길을 막는다. 싸움은 두 무리가 밀고 밀리는 것으로만 (연출 원칙 1).
     헤스본 성(오른쪽)에 이스라엘이 들어가고, 바산 왕 옥과의 싸움도 같은 흐름으로 */
  m28: {
    wide: 1.45,
    props: {
      sand: ['sand', 0, 0, { r: 1.9, color: '#c8b07e' }],
      city: ['walls', 1.0, -0.6, { w: 1.4 }],
      israel: ['crowd', -0.85, 0.15, { spots: flock(10, 0.32, 0.25, 26), face: Math.PI / 2 }],
      amorite: ['crowd', 0.75, 0.15, { spots: flock(10, 0.32, 0.25, 27), face: -Math.PI / 2 }],
    },
    cast: {
      moses: ['mosesE', -1.2, -0.15, 1],
      joshua: ['joshua', -0.45, 0.0, 1],
      envoy: ['traveler', -0.1, 0.1, 1],
      sihon: ['sihon', 0.55, -0.15, -1],
    },
    beats: {
      enter: [['amorite', null, { show: 0 }], ['sihon', 'idle', { show: 0 }], ['israel', null, { x: 0.6, z: -0.05 }], ['joshua', 'raise', { x: 0.2, z: 0.15, look: 1 }], ['envoy', 'idle', { show: 0 }], ['moses', 'idle', { x: -0.4, z: -0.1 }]],
      intro: [['amorite', null, { show: 0 }], ['sihon', 'idle', { show: 1 }], ['envoy', 'idle', { show: 0, x: -0.6, z: 0.1 }]],
      // 사신을 보내 정중히 청한다
      'p0.1': [['envoy', 'idle', { show: 1, x: 0.2, z: 0.05, look: 1 }], ['envoy', 'bow', { delay: 3000 }]],
      'p0.2': [['envoy', 'speak', { to: 'sihon' }]],
      'p0.3': [['sihon', 'rebuke', { to: 'envoy' }], ['envoy', 'idle', { x: -0.3, z: 0.25, delay: 2000 }]],
      // 야하스에서 맞붙는다 — 두 무리가 밀고 밀린다
      'p1.0': [['amorite', null, { show: 1 }], ['envoy', 'idle', { show: 0 }], ['sihon', 'point', { look: -1 }], ['israel', null, { x: -0.55 }], ['amorite', null, { x: 0.45 }]],
      'p1.1': [['israel', null, { x: -0.25 }], ['amorite', null, { x: 1.4, show: 0 }], ['sihon', 'idle', { show: 0 }], ['joshua', 'raise', { look: 1 }]],
      // 헤스본에 들어가 산다
      'p1.2': [['israel', null, { x: 0.6, z: -0.05 }], ['joshua', 'idle', { x: 0.2, z: 0.15 }], ['moses', 'idle', { x: -0.4, z: -0.1 }]],
      // 바산 왕 옥
      'p2.1': [['amorite', null, { show: 1, x: 1.0, z: 0.3 }], ['@env', 'overcast']],
      'p2.2': [['moses', 'listen', { look: 0.4 }], ['amorite', null, { show: 0, x: 1.6, delay: 3000 }], ['@env', 'day', { delay: 3000 }]],
      'p2.4': [['moses', 'raise', { look: 0.6 }]],
      w0: [['moses', 'listen', { look: 0.4 }]],
      w1: [['envoy', 'speak', { show: 1, to: 'sihon' }]],
      end: [],
    },
  },

  /* m29. 발람과 나귀 — 발람이 나귀를 타고 가다 칼을 든 천사(빛나는 칼)에게 길이 막힌다. 나귀가 주저앉고 말을 한다.
     발락이 높은 곳의 제단으로 데려가지만, 발람의 입에서는 축복이 나온다 — 멀리 보이는 이스라엘의 장막들 */
  m29: {
    wide: 1.45,
    props: {
      sand: ['sand', 0, 0, { r: 1.9, color: '#c8b07e' }],
      wall: ['brickwall', -0.6, -0.45, { w: 1.0, h: 0.32 }],
      donkey: ['donkey', -1.3, 0.15, { speed: 0.35 }],
      sword: ['flamesword', 0.0, 0.1],
      altar1: ['altar', 0.75, -0.4], altar2: ['altar', 1.05, -0.25], altar3: ['altar', 1.3, -0.45],
      camp: ['tent', -0.2, -0.85, { w: 0.5 }], camp2: ['tent', 0.4, -0.95, { w: 0.5, color: '#4a3c30' }],
    },
    cast: {
      balaam: ['balaam', -1.3, 0.15, 1, { board: 'donkey' }],
      angel: ['angel', 0.0, 0.0, -1],
      balak: ['balak', 1.0, 0.1, -1],
      prince: ['official', 1.25, 0.25, -1],
    },
    beats: {
      enter: [['donkey', null, { x: -0.55, z: 0.15 }], ['balaam', 'kneel', { board: null, x: -0.3, z: 0.25, look: 1 }], ['angel', 'idle', { show: 1 }], ['sword', null, { show: 1 }], ['balak', 'idle', { show: 0 }], ['prince', 'idle', { show: 0 }], ['altar1', 'idle', { show: 0 }], ['altar2', 'idle', { show: 0 }], ['altar3', 'idle', { show: 0 }]],
      intro: [['donkey', null, { x: -1.3, z: 0.15 }], ['balaam', 'ride', { board: 'donkey', x: 0, z: 0 }], ['angel', 'idle', { show: 0 }], ['sword', null, { show: 0 }], ['balak', 'idle', { show: 1, x: 1.0, z: 0.1 }], ['prince', 'idle', { show: 1, x: -0.6, z: 0.25, look: -1 }],
        ['altar1', 'idle', { show: 0 }], ['altar2', 'idle', { show: 0 }], ['altar3', 'idle', { show: 0 }], ['camp', null, { show: 1 }], ['camp2', null, { show: 1 }]],
      // 발락이 사신을 보내 저주를 청한다
      'p0.3': [['prince', 'speak', { to: 'balaam' }]],
      // 나귀에 안장을 얹고 길을 나선다
      'p1.0': [['prince', 'idle', { x: 1.25, z: 0.25, look: -1 }], ['donkey', null, { x: -0.55, z: 0.15 }]],
      // 칼을 든 천사가 길을 막는다 — 나귀가 주저앉는다
      'p1.1': [['angel', 'idle', { show: 1 }], ['sword', null, { show: 1 }], ['donkey', null, { x: -0.65, z: 0.25 }]],
      'p1.3': [['balaam', 'rebuke', { look: 1 }]],
      'p1.7': [['balaam', 'afraid', { board: null, x: -0.3, z: 0.3, look: 1 }], ['balaam', 'kneel', { delay: 2500 }]],
      // 높은 곳의 일곱 제단
      'p2.0': [['angel', 'idle', { show: 0 }], ['sword', null, { show: 0 }], ['altar1', 'fire', { show: 1 }], ['altar2', 'fire', { show: 1 }], ['altar3', 'fire', { show: 1 }], ['balaam', 'idle', { x: 0.35, z: 0.05, look: -1.6 }], ['balak', 'idle', { x: 0.75, z: 0.15, look: -0.8 }]],
      // 저주 대신 축복
      'p2.1': [['balaam', 'raise', { look: -1.6 }]],
      'p2.2': [['balaam', 'raise', { look: -1.6 }]],
      'p2.3': [['@env', 'night'], ['balaam', 'look-up', { look: -1.2 }]],
      'p2.4': [['balak', 'rebuke', { to: 'balaam' }], ['balaam', 'idle', { x: -1.6, z: 0.3, delay: 2500 }], ['balaam', 'idle', { show: 0, delay: 5500 }]],
      w0: [['balaam', 'listen', { look: 0.4 }]],
      w1: [['balaam', 'listen', { look: 0.4 }]],
      w2: [['balaam', 'speak', { show: 1, x: 0.35, z: 0.05, look: -1.6 }]],
      end: [['@env', 'night']],
    },
  },

  /* m30. 들으라 이스라엘아 — 모압 평지 (요단과 그 건너 여리고는 지도의 서쪽, 무대 왼쪽 바깥). 광야에서 자란 새 세대가 늙은 모세 앞에 앉아 듣는다 */
  m30: {
    wide: 1.4,
    props: {
      sand: ['sand', 0, 0.1, { r: 1.9, color: '#c8b07e' }],
      folk: ['crowd', 0, 0.45, { spots: flock(18, 1.1, 0.18, 28), state: 'sit', face: Math.PI }],
    },
    cast: {
      moses: ['mosesE', 0.0, -0.15, 0],
      joshua: ['joshua', 0.4, -0.05, -0.6],
      kid: ['child', -0.35, 0.2, 2.8],
      wom: ['woman', 0.75, 0.25, 3.3],
    },
    beats: {
      enter: [['folk', 'sit'], ['moses', 'speak', { to: 'kid' }], ['kid', 'sit-ground'], ['wom', 'sit-ground']],
      intro: [['folk', 'stand'], ['moses', 'idle'], ['kid', 'idle'], ['wom', 'idle']],
      'p0.1': [['moses', 'point', { look: -1.6 }]],
      // 새 세대가 모여 앉는다
      'p0.2': [['folk', 'sit'], ['kid', 'sit-ground'], ['wom', 'sit-ground'], ['moses', 'idle', { look: 0 }]],
      'p0.3': [['moses', 'speak', { to: 'kid' }]],
      'p1.0': [['moses', 'raise']],
      'p1.2': [['moses', 'speak', { to: 'wom' }]],
      // 집에 앉아 있을 때나 길을 걸을 때나 — 자녀에게
      'p1.4': [['wom', 'idle', { x: 0.55, z: 0.3 }], ['wom', 'speak', { to: 'kid', delay: 2000 }], ['kid', 'listen']],
      'p2.0': [['moses', 'rebuke', { to: 'kid' }], ['wom', 'sit-ground', { x: 0.75, z: 0.25 }]],
      'p2.3': [['moses', 'point', { look: -1.6 }], ['kid', 'listen']],
      w0: [['moses', 'speak', { to: 'kid' }]],
      w1: [['moses', 'bless', { to: 'kid' }]],
      w2: [['moses', 'speak', { to: 'wom' }]],
      end: [],
    },
  },

  /* m31. 느보산에서 바라본 땅 — 비스가 꼭대기에 홀로 선 모세가 서쪽(왼쪽)의 약속의 땅을 바라본다.
     죽음은 그리지 않는다 — 빛 속으로 사라지고, 아래 진영은 운다. 여호수아가 뒤를 잇는다 */
  m31: {
    env: 'dusk', wide: 1.35,
    props: {
      sand: ['sand', 0.2, 0.1, { r: 1.7, color: '#b8a07a' }],
      hill: ['hill', 0.35, -0.2, { w: 1.2, h: 0.5, d: 0.7, color: '#a08a6a', soft: true }],
      light: ['beam', 0.3, -0.2, { r: 0.45, h: 2.6, peak: 0.5 }],
      folk: ['crowd', 0.95, 0.5, { spots: flock(9, 0.4, 0.15, 29), face: -2.5 }],
    },
    cast: {
      moses: ['mosesE', 0.3, -0.2, -1.4],
      joshua: ['joshua', 0.55, 0.45, -0.6],
    },
    beats: {
      enter: [['moses', 'idle', { look: -1.4 }], ['light', null, { show: 0 }], ['joshua', 'idle', { show: 0 }], ['folk', null, { show: 0 }]],
      intro: [['moses', 'idle', { x: 1.0, z: 0.35, look: -1 }], ['light', null, { show: 0 }], ['joshua', 'idle', { show: 0 }], ['folk', null, { show: 0 }]],
      // 홀로 느보산에 오른다
      'p0.0': [['moses', 'idle', { x: 0.3, z: -0.2, look: -1.4 }]],
      // 온 땅을 보여 주신다 — 서쪽을 향해
      'p1.0': [['moses', 'point', { look: -1.5 }]],
      'p1.1': [['moses', 'idle', { look: -1.2 }], ['moses', 'idle', { look: -1.6, delay: 4000 }]],
      'p1.5': [['moses', 'look-up', { look: -1.4 }]],
      // 주의 말씀대로 숨을 거두었다 — 빛 속으로
      'p2.0': [['@env', 'dark'], ['light', null, { show: 1 }], ['moses', 'pray'], ['moses', 'idle', { show: 0, delay: 3500 }]],
      'p2.1': [['light', null, { show: 0, delay: 2000 }]],
      // 삼십 일의 울음, 여호수아가 뒤를 잇는다
      'p2.2': [['@env', 'dusk'], ['folk', null, { show: 1 }], ['joshua', 'mourn', { show: 1 }], ['joshua', 'idle', { look: -1.4, delay: 4000 }]],
      w0: [['moses', 'listen', { look: -1.4 }]],
      w1: [],
      end: [['@env', 'dusk'], ['moses', 'idle', { show: 0 }], ['joshua', 'idle', { show: 1, look: -1.4 }], ['folk', null, { show: 1 }]],
    },
  },

  /* m32. 강하고 담대하라 — 싯딤, 아카시아 그늘 아래의 장막. 여호수아가 홀로 말씀을 듣고, 지휘관들에게 명령하고, 백성이 답한다 */
  m32: {
    wide: 1.35,
    props: {
      sand: ['sand', 0, 0, { r: 1.9, color: '#c8b07e' }],
      tree1: ['olive', -1.1, -0.5, { scale: 0.95 }], tree2: ['olive', 0.95, -0.65, { scale: 0.85 }],
      tent: ['tent', -0.45, -0.7, { w: 0.7 }], tent2: ['tent', 0.35, -0.85, { w: 0.65, color: '#4a3c30' }],
      light: ['beam', -0.1, -0.05, { r: 0.5, h: 2.6, peak: 0.4 }],
      folk: ['crowd', 0.85, 0.3, { spots: flock(12, 0.4, 0.22, 30), face: -Math.PI / 2 }],
    },
    cast: {
      joshua: ['joshua', -0.1, -0.05, 0],
      cap1: ['caleb', 0.45, 0.05, -1],
      cap2: ['man', 0.55, 0.3, -1.1],
      cap3: ['hebrew2', 0.3, 0.35, -0.9],
    },
    beats: {
      enter: [['light', null, { show: 0 }], ['joshua', 'speak', { look: 1, to: 'cap1' }], ['folk', null, { show: 1 }]],
      intro: [['light', null, { show: 0 }], ['folk', null, { show: 0 }], ['cap1', 'idle', { show: 0 }], ['cap2', 'idle', { show: 0 }], ['cap3', 'idle', { show: 0 }], ['joshua', 'mourn']],
      // 주께서 여호수아에게 말씀하신다
      'p0.2': [['joshua', 'idle', { look: 0 }], ['light', null, { show: 1 }]],
      'p0.3': [['joshua', 'look-up']],
      'p1.2': [['joshua', 'kneel']],
      // 지휘관들에게 사흘 안에 요단을 건넌다고
      'p2.0': [['light', null, { show: 0 }], ['joshua', 'speak', { look: 1, to: 'cap1' }], ['cap1', 'idle', { show: 1 }], ['cap2', 'idle', { show: 1 }], ['cap3', 'idle', { show: 1 }]],
      'p2.4': [['folk', null, { show: 1 }], ['cap1', 'speak', { to: 'joshua' }]],
      'p2.5': [['cap1', 'raise'], ['cap2', 'raise'], ['cap3', 'raise']],
      w0: [['joshua', 'listen']],
      w1: [['joshua', 'listen']],
      w2: [['joshua', 'listen']],
      w3: [['cap1', 'raise', { to: 'joshua' }], ['cap2', 'raise']],
      end: [],
    },
  },
  /* m33. 라합의 붉은 줄 — 뒤로 여리고 성벽, 성벽에 붙은 라합의 집. 왕의 사람들이 문을 두드리고, 라합이 정탐꾼을 숨겼다가
     밤에 성 밖으로 내려보낸다. 창에 붉은 줄 */
  m33: {
    env: 'dusk', wide: 1.4,
    props: {
      sand: ['sand', 0, 0.1, { r: 1.9, color: '#c8b07e' }],
      city: ['citywall', -0.1, -0.6, { w: 2.2, h: 0.95 }],
      palm1: ['palm', -1.35, -0.1, { h: 0.95 }], palm2: ['palm', 1.4, 0.1, { h: 0.85 }],
    },
    cast: {
      rahab: ['rahab', 0.55, -0.25, 0],
      sp1: ['hebrew', 0.3, -0.15, 0.6],
      sp2: ['hebrew2', 0.75, -0.1, -0.6],
      g1: ['soldier', -0.6, 0.1, 1],
      g2: ['guard', -0.85, 0.25, 1],
    },
    beats: {
      enter: [['city', 'cord'], ['rahab', 'speak', { to: 'sp1' }], ['sp1', 'listen', { x: 0.25, z: 0.2 }], ['sp2', 'listen', { x: 0.85, z: 0.25 }], ['g1', 'idle', { show: 0 }], ['g2', 'idle', { show: 0 }]],
      intro: [['@env', 'day'], ['city', 'stand'], ['rahab', 'idle', { show: 0 }], ['sp1', 'idle', { x: 1.6, z: 0.35 }], ['sp2', 'idle', { x: 1.85, z: 0.5 }], ['g1', 'idle', { show: 0 }], ['g2', 'idle', { show: 0 }]],
      // 두 정탐꾼이 숨어들어 라합의 집에
      'p0.0': [['sp1', 'idle', { x: 0.3, z: -0.15, look: -0.6 }], ['sp2', 'idle', { x: 0.75, z: -0.1, look: -0.6 }]],
      'p0.1': [['rahab', 'idle', { show: 1, look: 0.6 }]],
      // 해 질 녘 왕의 사람들이 문을 두드린다
      'p0.4': [['@env', 'dusk'], ['g1', 'idle', { show: 1, x: -0.2, z: 0.1 }], ['g2', 'idle', { show: 1, x: -0.45, z: 0.25 }], ['sp1', 'idle', { show: 0 }], ['sp2', 'idle', { show: 0 }], ['g1', 'rebuke', { to: 'rahab', delay: 2500 }]],
      // 지붕의 삼대 밑에 숨기고 둘러댄다 — 추격자들은 요단 쪽(오른쪽)으로
      'p1.2': [['rahab', 'point', { look: 1.3 }], ['g1', 'idle', { x: 1.8, z: 0.4, delay: 2500 }], ['g2', 'idle', { x: 1.9, z: 0.5, delay: 2600 }], ['g1', 'idle', { show: 0, delay: 6000 }], ['g2', 'idle', { show: 0, delay: 6000 }]],
      'p1.4': [['@env', 'night'], ['sp1', 'idle', { show: 1, x: 0.25, z: 0.2 }], ['sp2', 'idle', { show: 1, x: 0.85, z: 0.25 }], ['rahab', 'speak', { to: 'sp1' }]],
      // 창문으로 밧줄을 내려 성 밖으로
      'p2.0': [['sp1', 'idle', { x: 0.6, z: 0.45, look: -1 }], ['sp2', 'idle', { x: 0.85, z: 0.5, look: -1 }]],
      'p2.2': [['city', 'cord'], ['sp1', 'point', { look: 3 }]],
      // 사흘을 산에 숨었다가 돌아간다
      'p2.4': [['sp1', 'idle', { x: -1.7, z: 0.45 }], ['sp2', 'idle', { x: -1.8, z: 0.55 }], ['sp1', 'idle', { show: 0, delay: 5000 }], ['sp2', 'idle', { show: 0, delay: 5000 }]],
      w0: [['rahab', 'speak', { to: 'sp1' }]],
      w1: [['rahab', 'bow', { look: 0 }]],
      w2: [['sp1', 'speak', { show: 1, x: 0.25, z: 0.2, to: 'rahab' }], ['sp2', 'idle', { show: 1, x: 0.85, z: 0.25 }]],
      end: [['@env', 'night'], ['city', 'cord']],
    },
  },

  /* m34. 요단을 건너다 — 오른쪽(동쪽)의 불어난 요단. 언약궤를 멘 제사장들의 발이 물에 닿자 물이 끊기고(멀리 위쪽에 쌓였다),
     제사장들이 강바닥 한가운데 서 있는 동안 백성이 서쪽(왼쪽) 길갈로 건넌다. 열두 돌을 세운다 */
  m34: {
    wide: 1.45,
    props: {
      sand: ['sand', -0.3, 0.05, { r: 1.6, color: '#c8b07e' }],
      bank: ['sand', 1.45, 0.05, { r: 0.6, color: '#b8a07a', stones: 6 }],
      bed: ['sand', 0.85, 0, { r: 0.6, color: '#a8936a', stones: 18 }],
      river: ['water', 0.85, 0, { r: 1.0, y: 0.05, size: [0.32, 1, 1.2] }],
      ark: ['arkc', 1.35, -0.05, { lift: 0.33, on: ['p1', 'p2'] }], // 앞뒤 두 제사장의 한가운데
      folk: ['crowd', 1.65, 0.3, { spots: flock(12, 0.3, 0.25, 31), face: -Math.PI / 2 }],
      stones: ['pillars12', -0.85, -0.35, { r: 0.45 }],
    },
    cast: {
      joshua: ['joshua', 1.3, 0.25, -1],
      p1: ['priest', 0.93, -0.05, -1.57, { speed: 0.3, pose: 'carry-pole' }],
      p2: ['priest', 1.77, -0.05, -1.57, { speed: 0.3, pose: 'carry-pole' }],
      man: ['hebrew', 1.6, 0.45, -1],
      kid: ['child', 1.45, 0.55, -1],
    },
    beats: {
      enter: [['river', null, { show: 0 }], ['p1', 'carry-pole', { x: 0.43, z: -0.05 }], ['p2', 'carry-pole', { x: 1.27, z: -0.05 }], ['folk', null, { x: 0.1 }], ['joshua', 'raise', { x: -0.2, z: 0.25, look: 1 }], ['man', 'idle', { x: 0.5, z: 0.35 }], ['kid', 'idle', { x: 0.35, z: 0.45 }], ['stones', null, { show: 0 }]],
      intro: [['river', null, { show: 1 }], ['stones', null, { show: 0 }], ['folk', null, { x: 1.65 }]],
      'p0.1': [['man', 'idle', { look: -1.6 }]],
      'p0.3': [['joshua', 'speak', { to: 'man' }]],
      // 언약궤를 멘 제사장들의 발이 물가에 — 물이 끊긴다
      'p1.1': [['joshua', 'idle'], ['p1', 'carry-pole', { x: 0.43, z: -0.05 }], ['p2', 'carry-pole', { x: 1.27, z: -0.05 }], ['river', null, { show: 0, delay: 2500 }]],
      // 제사장들이 한가운데 서 있는 동안 온 백성이 건넌다
      'p1.2': [['folk', null, { x: 0.1 }], ['joshua', 'idle', { x: -0.2, z: 0.25, look: 1 }], ['man', 'idle', { x: 0.5, z: 0.35, delay: 800 }], ['kid', 'idle', { x: 0.35, z: 0.45, delay: 1200 }]],
      // 열두 돌을 길갈에
      'p2.1': [['stones', null, { show: 1 }], ['man', 'idle', { x: -0.6, z: -0.15, look: -0.8 }], ['kid', 'idle', { x: -0.4, z: 0.0 }]],
      'p2.3': [['@env', 'dusk']],
      'p2.4': [['@env', 'day'], ['p1', 'carry-pole', { x: -0.32, z: -0.15 }], ['p2', 'carry-pole', { x: 0.52, z: -0.15 }], ['river', null, { show: 1, delay: 4000 }]],
      w0: [['joshua', 'listen', { look: 1 }]],
      w1: [['joshua', 'listen']],
      w2: [['joshua', 'speak', { to: 'kid' }], ['kid', 'listen']],
      end: [],
    },
  },

  /* m35. 무너진 성벽 — 굳게 닫힌 여리고. 뿔나팔 든 일곱 제사장과 언약궤가 말없이 성을 돈다. 일곱째 날의 큰 소리에 성벽이 무너지고,
     붉은 줄 걸린 라합의 집만 남는다. 성 안의 진멸은 그리지 않는다 — 무거운 빛과 고요로만 */
  m35: {
    wide: 1.45,
    props: {
      sand: ['sand', 0, 0.15, { r: 1.9, color: '#c8b07e' }],
      city: ['citywall', 0, -0.62, { w: 2.4, h: 0.95, state: 'cord' }],
      ark: ['arkc', 0.9, 0.2, { lift: 0.33, on: ['p1', 'p2'] }],
      folk: ['crowd', 1.5, 0.45, { spots: flock(10, 0.3, 0.18, 32), face: -Math.PI / 2, speed: 0.35 }],
    },
    cast: {
      joshua: ['joshua', -1.1, 0.4, 0.6],
      h1: ['priest', -0.3, 0.2, -1.35, { speed: 0.35 }], h2: ['priest', -0.08, 0.25, -1.35, { speed: 0.35 }], h3: ['priest', 0.14, 0.2, -1.35, { speed: 0.35 }],
      p1: ['priest', 0.48, 0.2, -1.57, { speed: 0.35, pose: 'carry-pole' }], p2: ['priest', 1.32, 0.2, -1.57, { speed: 0.35, pose: 'carry-pole' }],
      rahab: ['rahab', 0.75, -0.35, 0.4],
      kin: ['mother', 0.95, -0.3, 0.2],
    },
    beats: {
      enter: [['city', 'fall'], ['joshua', 'raise', { look: 0.8 }], ['h1', 'idle', { item: 'horn' }], ['h2', 'idle', { item: 'horn' }], ['h3', 'idle', { item: 'horn' }], ['rahab', 'idle', { x: -0.55, z: 0.35, look: 0.6 }], ['kin', 'idle', { x: -0.75, z: 0.45, look: 0.6 }]],
      intro: [['city', 'cord'], ['rahab', 'idle', { show: 0 }], ['kin', 'idle', { show: 0 }], ['h1', 'idle', { item: 'horn' }], ['h2', 'idle', { item: 'horn' }], ['h3', 'idle', { item: 'horn' }]],
      'p0.1': [['@env', 'dawn']],
      'p0.2': [['@env', 'day'], ['joshua', 'listen', { look: 0.8 }]],
      // 엿새 동안 날마다 한 번 — 뿔나팔을 불며 성을 돈다 (오른쪽에서 왼쪽으로 지나간다)
      'p1.0': [['h1', 'idle', { x: -1.3 }], ['h2', 'idle', { x: -1.08 }], ['h3', 'idle', { x: -0.86 }], ['p1', 'carry-pole', { x: -0.52 }], ['p2', 'carry-pole', { x: 0.32 }], ['folk', null, { x: 0.5 }]],
      // 일곱째 날 새벽, 일곱 번 — 그리고 큰 소리
      'p1.3': [['@env', 'dawn'], ['h1', 'look-up', { look: -2.6 }], ['h2', 'look-up', { look: -2.6 }], ['h3', 'look-up', { look: -2.6 }], ['joshua', 'raise', { delay: 2500 }]],
      // 성벽이 무너져 내린다
      'p1.6': [['city', 'fall'], ['joshua', 'raise']],
      // 진멸 — 무겁게
      'p2.0': [['@env', 'overcast'], ['joshua', 'idle', { look: 0.8 }], ['h1', 'idle'], ['h2', 'idle'], ['h3', 'idle']],
      // 붉은 줄이 걸린 집 — 라합과 가족이 나온다
      'p2.1': [['@env', 'day'], ['rahab', 'idle', { show: 1 }], ['kin', 'idle', { show: 1 }]],
      'p2.2': [['rahab', 'idle', { x: -0.55, z: 0.35, look: 0.6 }], ['kin', 'idle', { x: -0.75, z: 0.45, look: 0.6 }], ['joshua', 'bless', { to: 'rahab', delay: 3500 }]],
      w0: [['joshua', 'listen', { look: 0.8 }]],
      w1: [['joshua', 'listen', { look: 0.8 }]],
      w2: [['joshua', 'raise', { look: 0.8 }]],
      end: [['city', 'fall']],
    },
  },

  /* m36. 아간의 죄와 아이 성 — 언덕 위의 작은 성 아이. 올라간 무리가 쫓겨 내려오고, 여호수아는 언약궤 앞에 엎드린다.
     제비가 아간에게 이르고 그가 고백한다. 아골 골짜기의 일은 그리지 않는다 — 큰 돌무더기만. 아이는 연기 속에 사라진다 */
  m36: {
    wide: 1.45,
    props: {
      sand: ['sand', -0.2, 0.15, { r: 1.7, color: '#c2a888' }],
      hill: ['hill', 0.95, -0.55, { w: 0.9, h: 0.32, d: 0.55, color: '#a08a6a', soft: true }],
      city: ['citywall', 0.95, -0.6, { w: 0.85, h: 0.32, rahab: false, y: 0.3 }],
      smoke: ['fire', 0.95, -0.5, { scale: 2.2, y: 0.32 }],
      ark: ['arkc', -0.75, -0.25],
      folk: ['crowd', 0.45, 0.1, { spots: flock(8, 0.25, 0.2, 33), face: Math.PI / 2 }],
      heap: ['rocks', -1.3, 0.3, { spots: [[0, 0, 0.08], [0.1, 0.04, 0.07], [-0.09, 0.05, 0.07], [0.02, 0.1, 0.06], [0.05, 0.02, 0.07], [-0.03, -0.04, 0.06]] }],
    },
    cast: {
      joshua: ['joshua', -0.45, 0.05, -0.8],
      elder: ['elder', -0.2, 0.25, -1],
      achan: ['hebrew2', 0.15, 0.4, -1],
    },
    beats: {
      enter: [['heap', null, { show: 0 }], ['smoke', null, { show: 0 }], ['joshua', 'kneel', { x: -0.5, z: -0.1, look: -0.8 }], ['elder', 'mourn'], ['achan', 'bow', { look: -1 }], ['folk', null, { x: -0.2, z: 0.35 }]],
      intro: [['heap', null, { show: 0 }], ['smoke', null, { show: 0 }], ['city', 'stand', { show: 1 }], ['folk', null, { x: 0.45, z: 0.1 }], ['achan', 'idle', { show: 0 }]],
      // 삼천 명이 올라간다
      'p0.2': [['folk', null, { x: 0.65, z: -0.15 }]],
      // 성문 앞에서 쫓겨 비탈길로
      'p0.3': [['folk', null, { x: -0.15, z: 0.35 }]],
      'p0.4': [['elder', 'mourn']],
      // 옷을 찢고 언약궤 앞에 저물도록 엎드린다
      'p0.5': [['@env', 'dusk'], ['joshua', 'kneel', { x: -0.5, z: -0.1, look: -0.8 }], ['joshua', 'bow', { delay: 2500 }]],
      'p1.1': [['joshua', 'kneel', { look: -0.8 }]],
      // 제비가 아간에게 이른다
      'p1.3': [['@env', 'day'], ['joshua', 'idle', { x: -0.45, z: 0.05, look: 1 }], ['achan', 'idle', { show: 1, x: 0.15, z: 0.4 }]],
      'p1.4': [['achan', 'bow', { look: -1 }]],
      // 큰 돌무더기만 남는다
      'p2.0': [['@env', 'overcast'], ['achan', 'idle', { show: 0 }], ['heap', null, { show: 1, delay: 1500 }]],
      // 아이를 점령하고 성은 불탄다
      'p2.2': [['@env', 'day'], ['joshua', 'raise', { look: 1 }]],
      'p2.3': [['folk', null, { x: 0.95, z: -0.2 }], ['smoke', null, { show: 1, delay: 2500 }], ['city', 'fall', { delay: 3000 }]],
      w0: [['joshua', 'listen', { look: -0.8 }]],
      w1: [['joshua', 'listen', { look: 0.6 }]],
      w2: [['heap', null, { show: 0 }], ['achan', 'speak', { show: 1, x: 0.15, z: 0.4, to: 'joshua' }]],
      end: [['heap', null, { show: 1 }], ['city', 'fall']],
    },
  },

  /* m37. 두 산 사이의 언약 — 북쪽(뒤)에 에발산, 남쪽(앞 오른쪽)에 그리심산. 에발산 기슭의 자연석 제단, 가운데 언약궤와 제사장들,
     양쪽으로 갈라 선 백성. 여호수아가 율법의 말씀을 남김없이 읽는다 */
  m37: {
    wide: 1.45,
    props: {
      sand: ['sand', 0, 0.1, { r: 1.9, color: '#b8b08a' }],
      ebal: ['mountain', -0.3, -1.3, { h: 1.2, r: 1.0, color: '#8a8a6a' }],
      gerizim: ['hill', 1.2, 0.75, { w: 0.9, h: 0.3, d: 0.4, color: '#7a8a5a', soft: true }],
      altar: ['altar', -0.35, -0.5],
      ark: ['arkc', 0.1, -0.1],
      half1: ['crowd', -1.3, 0.15, { spots: flock(9, 0.3, 0.3, 34), face: Math.PI / 2 }],
      half2: ['crowd', 1.35, 0.1, { spots: flock(9, 0.3, 0.3, 35), face: -Math.PI / 2 }],
    },
    cast: {
      joshua: ['joshua', 0.1, 0.25, 0],
      p1: ['priest', -0.15, -0.15, 0.4],
      p2: ['priest', 0.35, -0.15, -0.4],
      wom: ['woman', -0.55, 0.45, 0.5],
      kid: ['child', -0.4, 0.55, 0.4],
      stranger: ['traveler', 0.6, 0.45, -0.5],
    },
    beats: {
      enter: [['joshua', 'speak', { item: 'scroll', look: 0 }], ['half1', null, { show: 1 }], ['half2', null, { show: 1 }]],
      intro: [['altar', 'idle'], ['ark', null, { show: 0 }], ['p1', 'idle', { show: 0 }], ['p2', 'idle', { show: 0 }], ['half1', null, { show: 0 }], ['half2', null, { show: 0 }], ['wom', 'idle', { show: 0 }], ['kid', 'idle', { show: 0 }], ['stranger', 'idle', { show: 0 }], ['joshua', 'idle', { x: 0.1, z: 0.25, item: null }]],
      'p0.1': [['joshua', 'point', { look: 3 }]],
      // 에발산에 자연석 제단
      'p0.2': [['joshua', 'idle', { x: -0.2, z: -0.3, look: 3 }], ['altar', 'fire', { delay: 2500 }]],
      'p1.0': [['joshua', 'kneel', { look: 3 }]],
      // 언약궤를 멘 제사장들이 가운데, 백성은 반씩
      'p1.1': [['ark', null, { show: 1 }], ['p1', 'idle', { show: 1 }], ['p2', 'idle', { show: 1 }], ['half1', null, { show: 1 }], ['half2', null, { show: 1 }], ['joshua', 'idle', { x: 0.1, z: 0.25, look: 0 }]],
      'p1.2': [['wom', 'idle', { show: 1 }], ['kid', 'idle', { show: 1 }], ['stranger', 'idle', { show: 1 }]],
      // 율법의 말씀을 남김없이 읽는다
      'p2.0': [['joshua', 'speak', { item: 'scroll', look: 0 }]],
      'p2.1': [['joshua', 'speak', { look: -0.8 }], ['joshua', 'speak', { look: 0.8, delay: 3500 }]],
      'p2.3': [['kid', 'listen'], ['wom', 'listen'], ['stranger', 'listen']],
      w0: [['joshua', 'listen', { look: 3 }]],
      w1: [['joshua', 'speak', { item: 'scroll' }]],
      w2: [],
      end: [],
    },
  },

  /* m38. 해야 머물라 — 언덕 위의 기브온 성. 다섯 왕의 군대가 에워싸고, 밤새 올라온 여호수아가 새벽에 덮친다(두 무리가 밀고 밀리는 것으로만).
     벧호론 비탈로 우박이 쏟아지고, 여호수아가 두 팔을 들자 해가 하늘 한가운데 멈춰 선다 */
  m38: {
    wide: 1.45,
    props: {
      sand: ['sand', 0, 0.1, { r: 1.9, color: '#bfae86' }],
      hill: ['hill', -0.1, -0.6, { w: 1.0, h: 0.35, d: 0.5, color: '#a0906e', soft: true }],
      city: ['citywall', -0.1, -0.65, { w: 0.95, h: 0.32, rahab: false, y: 0.32 }],
      kings: ['crowd', 0.3, -0.1, { spots: flock(10, 0.45, 0.2, 36), face: Math.PI }],
      israel: ['crowd', 1.7, 0.3, { spots: flock(9, 0.3, 0.22, 37), face: -Math.PI / 2 }],
      sky: ['sunmoon', 0, 0],
      hail: ['rain', -0.6, 0],
    },
    cast: {
      joshua: ['joshua', 1.7, 0.1, -1],
      runner: ['traveler', -0.2, 0.3, 1],
      king: ['king', 0.55, -0.25, 3],
    },
    beats: {
      enter: [['sky', 'still', { show: 1 }], ['kings', null, { show: 0 }], ['king', 'idle', { show: 0 }], ['runner', 'idle', { show: 0 }], ['israel', null, { x: 0.65, z: 0.3 }], ['joshua', 'raise', { x: 0.2, z: 0.3, look: -0.8 }]],
      intro: [['sky', 'idle', { show: 0 }], ['kings', null, { show: 0 }], ['king', 'idle', { show: 0 }], ['israel', null, { show: 0, x: 1.7 }], ['joshua', 'idle', { show: 0, x: 1.7, z: 0.1 }], ['runner', 'idle', { show: 0 }]],
      // 다섯 왕의 군대가 기브온을 에워싼다
      'p0.1': [['king', 'point', { show: 1, look: 3 }]],
      'p0.3': [['kings', null, { show: 1 }]],
      // 길갈의 여호수아에게 급히 사람을 보낸다
      'p0.4': [['runner', 'idle', { show: 1, x: -0.2, z: 0.35 }], ['runner', 'idle', { x: 1.3, z: 0.35, delay: 1200 }], ['joshua', 'idle', { show: 1 }]],
      'p0.5': [['runner', 'speak', { to: 'joshua' }]],
      // 밤새 산길을 올라 새벽에 덮친다
      'p1.2': [['@env', 'night'], ['runner', 'idle', { show: 0 }], ['israel', null, { show: 1, x: 0.95 }], ['joshua', 'idle', { x: 0.75, z: 0.15, look: -1 }], ['@env', 'dawn', { delay: 4000 }]],
      // 혼란에 빠져 비탈로 달아나고 — 우박
      'p1.3': [['@env', 'storm'], ['kings', null, { x: -1.4 }], ['king', 'afraid', { x: -1.1, z: 0.0 }], ['israel', null, { x: 0.3 }]],
      'p1.4': [['kings', null, { show: 0 }], ['king', 'idle', { show: 0 }]],
      // 해야, 기브온 위에 머물러라
      'p2.0': [['@env', 'day'], ['joshua', 'idle', { x: 0.2, z: 0.3, look: -0.8 }]],
      'p2.1': [['sky', 'still', { show: 1 }], ['joshua', 'raise', { look: -0.8 }]],
      'p2.2': [['joshua', 'raise', { look: 0.6 }]],
      'p2.3': [['joshua', 'look-up', { look: -0.6 }]],
      w0: [['joshua', 'listen', { look: -0.6 }]],
      w1: [['joshua', 'raise', { look: -0.8 }], ['sky', 'still', { show: 1 }]],
      w2: [['runner', 'speak', { show: 1, to: 'joshua' }]],
      end: [['sky', 'still', { show: 1 }]],
    },
  },

  /* m39. 실로에서 나눈 땅 — 에브라임 산지의 조용한 언덕에 회막. 일곱 지파의 사람들이 땅을 두루 다니며 적은 두루마리를 들고 돌아오고,
     여호수아가 주 앞에서 제비를 뽑아 나눈다 */
  m39: {
    wide: 1.4,
    props: {
      sand: ['sand', 0, 0.1, { r: 1.9, color: '#b8b08a' }],
      tab: ['tabernacle', -0.2, -0.5, { scale: 0.95 }],
      tree1: ['olive', 1.2, -0.45, { scale: 0.9 }], tree2: ['olive', -1.35, 0.1, { scale: 0.8 }],
      folk: ['crowd', 1.0, 0.35, { spots: flock(9, 0.35, 0.22, 38), face: -Math.PI / 2 }],
    },
    cast: {
      joshua: ['joshua', -0.1, 0.15, 0.4],
      eleazar: ['eleazar', -0.4, 0.05, 0.4],
      m1: ['hebrew', 0.45, 0.2, -0.8, { speed: 0.4 }],
      m2: ['hebrew2', 0.65, 0.35, -0.9, { speed: 0.4 }],
      m3: ['man', 0.35, 0.45, -0.7, { speed: 0.4 }],
    },
    beats: {
      enter: [['joshua', 'speak', { to: 'm1' }], ['m1', 'idle', { item: 'scroll' }], ['m2', 'idle', { item: 'scroll' }], ['m3', 'listen']],
      intro: [['tab', null, { show: 0 }], ['m1', 'idle', { item: null }], ['m2', 'idle', { item: null }]],
      'p0.1': [['tab', null, { show: 1 }]],
      'p0.3': [['m1', 'shrug'], ['m2', 'idle', { look: -1.5 }]],
      'p1.1': [['joshua', 'rebuke', { to: 'm1' }]],
      // 지파마다 세 사람씩 뽑아 땅을 두루 다니게 한다
      'p1.3': [['joshua', 'point', { look: 1.3 }], ['m1', 'idle', { x: 1.8, z: 0.2, delay: 1500 }], ['m2', 'idle', { x: 1.9, z: 0.4, delay: 1700 }], ['m3', 'idle', { x: 1.75, z: 0.55, delay: 1900 }],
        ['m1', 'idle', { show: 0, delay: 5500 }], ['m2', 'idle', { show: 0, delay: 5500 }], ['m3', 'idle', { show: 0, delay: 5500 }]],
      'p1.4': [['joshua', 'idle', { look: -0.6 }], ['eleazar', 'bow']],
      // 두루마리를 들고 돌아온다
      'p2.1': [['m1', 'idle', { show: 1, x: 0.45, z: 0.2, item: 'scroll' }], ['m2', 'idle', { show: 1, x: 0.65, z: 0.35, item: 'scroll' }], ['m3', 'idle', { show: 1, x: 0.35, z: 0.45 }], ['eleazar', 'idle'], ['joshua', 'kneel', { look: -2.6, delay: 3500 }]],
      'p2.3': [['joshua', 'raise', { look: 0.6 }], ['m1', 'raise'], ['m2', 'raise']],
      w0: [['joshua', 'speak', { to: 'm1' }]],
      w1: [['joshua', 'speak', { to: 'm2' }]],
      w2: [['joshua', 'speak', { to: 'm3' }]],
      end: [],
    },
  },

  /* m40. 나와 내 집은 — 세겜, 상수리나무 아래. 늙은 여호수아가 온 지파 앞에서 묻고, 백성이 거듭 답한다. 증인이 될 큰 돌을 세운다.
     그의 죽음은 빛 속으로 사라지는 것으로만 */
  m40: {
    wide: 1.45,
    props: {
      sand: ['sand', 0, 0.1, { r: 1.9, color: '#b8b08a' }],
      ebal: ['mountain', -0.6, -1.35, { h: 1.1, r: 0.95, color: '#8a8a6a' }],
      oak: ['olive', 0.75, -0.45, { scale: 1.3 }],
      stone: ['standing', 0.55, -0.25],
      light: ['beam', 0.0, 0.0, { r: 0.45, h: 2.5, peak: 0.45 }],
      folk: ['crowd', 0, 0.5, { spots: [...flock(8, 0.35, 0.18, 39).map(([x, z]) => [x - 0.95, z]), ...flock(8, 0.35, 0.18, 40).map(([x, z]) => [x + 0.95, z])], face: Math.PI }],
    },
    cast: {
      joshua: ['joshua', 0.0, 0.0, 0],
      elder: ['elder', -0.45, 0.25, 2.8],
      wife: ['woman', 0.3, 0.1, 0.3],
      son: ['hebrew2', 0.45, 0.2, 0.2],
    },
    beats: {
      enter: [['light', null, { show: 0 }], ['joshua', 'raise', { look: 0 }], ['elder', 'raise'], ['stone', null, { show: 1 }]],
      intro: [['light', null, { show: 0 }], ['stone', null, { show: 0 }], ['folk', null, { show: 0 }], ['joshua', 'idle', { show: 1 }]],
      'p0.0': [['folk', null, { show: 1 }]],
      'p0.1': [['elder', 'bow']],
      'p0.2': [['joshua', 'speak', { to: 'elder' }]],
      // 이제 누구를 섬길지 오늘 택하라 — 나와 내 집은
      'p1.1': [['joshua', 'idle', { look: 0 }]],
      'p1.2': [['joshua', 'point', { look: 0 }]],
      'p1.3': [['joshua', 'raise'], ['wife', 'idle', { look: 0 }], ['son', 'idle', { look: 0 }]],
      'p1.5': [['elder', 'raise']],
      // 언약을 세우고 큰 돌을 세운다
      'p2.0': [['joshua', 'idle', { x: 0.35, z: -0.1, look: 0.6 }], ['stone', null, { show: 1, delay: 1500 }], ['elder', 'idle']],
      'p2.1': [['joshua', 'point', { look: 0.6 }]],
      // 백열 살에 숨을 거두어 — 빛 속으로
      'p2.3': [['@env', 'dusk'], ['light', null, { show: 1, x: 0.35, z: -0.1 }], ['joshua', 'pray'], ['joshua', 'idle', { show: 0, delay: 3500 }], ['elder', 'mourn', { delay: 2000 }], ['wife', 'mourn', { delay: 2000 }], ['son', 'mourn', { delay: 2000 }]],
      w0: [['joshua', 'listen', { look: 0 }]],
      w1: [['joshua', 'raise', { look: 0 }]],
      w2: [['elder', 'raise', { to: 'joshua' }]],
      end: [['@env', 'dusk']],
    },
  },
};

// intro 앞에 처음 자리로 되돌리는 명령을 붙인다: 다시 들을 때(끝난 상태에서)나 처음 들을 때(enter 장면 뒤에서)나
// 똑같이 대본의 처음 자리(cast·props)에서 시작하게 — 대본마다 모든 배역을 일일이 되돌리지 않아도 되게
// (탄 사람(board)은 탈것 위의 자리라 건드리지 않는다. 배역 옵션 pose는 그 사람의 기본 자세 — 언약궤를 멘 제사장의 carry-pole. 확인: node _src/tools/stagecheck.mjs)
Object.values(MOSES).forEach(s => {
  const reset = [
    ...Object.entries(s.cast).map(([n, [, x, z, look, o = {}]]) => [n, o.pose || 'idle', o.board ? { show: 1, item: null, look } : { show: 1, x, z, look, item: null, y: o.y || 0 }]),
    ...Object.entries(s.props || {}).map(([n, [, x, z]]) => [n, null, { show: 1, x, z }]),
  ];
  s.beats.intro = [...reset, ...(s.beats.intro || s.beats.enter)];
});

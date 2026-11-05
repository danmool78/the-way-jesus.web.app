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
      'p1.2': [['boss', 'point', { look: -1 }]],
      // 산파 십브라와 부아가 바로 앞에 선다
      'p2.0': [['mid1', 'idle', { show: 1, x: 0.72, z: 0.3, look: 1 }], ['mid2', 'idle', { show: 1, x: 0.92, z: 0.45, look: 1.1 }], ['boss', 'idle', { show: 0 }]],
      'p2.1': [['pharaoh', 'rebuke', { to: 'mid1' }]],
      'p2.2': [['@env', 'dusk'], ['mid1', 'mourn'], ['mid2', 'mourn']],
      'p2.3': [['@env', 'dusk'], ['pharaoh', 'idle', { show: 0 }], ['scribe', 'idle', { show: 0 }], ['h1', 'mourn'], ['h2', 'mourn'], ['h3', 'mourn']],
      w0: [['pharaoh', 'speak', { to: 'scribe' }]],
      w1: [['mid1', 'speak', { to: 'pharaoh' }]],
      w2: [['pharaoh', 'speak', { to: 'mid1' }]],
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
      'p2.1': [['ark', 'open'], ['princess', 'kneel', { look: -0.4 }]],
      // 누이의 재치로 아기는 어머니 품에
      'p2.2': [['mother', 'idle', { show: 1, x: -0.2, z: 0.05, look: 0.8 }], ['princess', 'idle'], ['mother', 'carry', { delay: 2600 }], ['ark', 'open', { show: 0, delay: 2600 }]],
      'p2.3': [['princess', 'bless', { to: 'mother' }]],
      w0: [['princess', 'speak', { to: 'maid' }]],
      w1: [['sister', 'idle', { x: 0.05, z: -0.05, look: 0.8 }], ['sister', 'speak', { to: 'princess', delay: 1800 }]],
      w2: [['princess', 'speak', { to: 'mother' }]],
      end: [],
    },
  },

  /* m03. 미디안으로 도망하다 — 앞 문단은 애굽: 궁에서 자란 모세(애굽 옷)가 동족을 보러 나간다. 애굽 사람을 친 일은 그리지 않는다
     (감독관이 사라질 뿐). 모세가 동쪽(오른쪽)으로 달아나면 무대가 미디안의 우물가로 바뀐다 — 목자로 다시 나타난다 */
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
      enter: [['bricks', null, { show: 0 }], ['prince', 'idle', { show: 0 }], ['slave', 'idle', { show: 0 }], ['boss', 'idle', { show: 0 }], ['slave2', 'idle', { show: 0 }],
        ['moses', 'idle', { x: -0.05, z: 0.2, look: 0.6 }], ['sh1', 'idle', { show: 0 }], ['sh2', 'idle', { show: 0 }], ['d1', 'idle'], ['d2', 'idle'], ['d3', 'idle'], ['zip', 'idle', { x: 0.25, z: 0.15, look: -1 }], ['reuel', 'idle', { x: 0.85, z: -0.2 }]],
      intro: [['well', null, { show: 0 }], ['tent', null, { show: 0 }], ['flock', null, { show: 0 }], ['flock2', null, { show: 0 }], ['flock3', null, { show: 0 }], ['bricks', null, { show: 1 }],
        ['prince', 'idle', { show: 1, x: -1.2, z: 0.0, look: 0.5 }], ['slave', 'bow', { show: 1 }], ['boss', 'idle', { show: 1 }], ['slave2', 'idle', { show: 0 }],
        ['moses', 'idle', { show: 0, x: -1.6, z: 0.15 }], ['sh1', 'idle', { show: 0 }], ['sh2', 'idle', { show: 0 }], ['d1', 'idle', { show: 0 }], ['d2', 'idle', { show: 0 }], ['d3', 'idle', { show: 0 }], ['zip', 'idle', { show: 0 }], ['reuel', 'idle', { show: 0 }]],
      // 동족이 일하는 곳 — 감독관이 히브리 사람을 몰아붙이고, 모세는 좌우를 살핀다
      'p0.0': [['prince', 'idle', { x: -0.85, z: 0.05, look: 0.6 }]],
      'p0.1': [['boss', 'rebuke', { to: 'slave' }], ['slave', 'cower'], ['prince', 'idle', { look: -1.3, delay: 1200 }], ['prince', 'idle', { look: 1.3, delay: 2600 }], ['boss', 'idle', { show: 0, delay: 4200 }]],
      'p0.2': [['slave', 'idle', { show: 0 }], ['prince', 'idle', { look: 0.3 }]],
      // 이튿날 다투는 두 히브리 사람
      'p1.0': [['slave', 'rebuke', { show: 1, x: -0.4, z: 0.2, look: 1 }], ['slave2', 'afraid', { show: 1, x: -0.05, z: 0.25, look: -1 }], ['prince', 'idle', { x: -0.25, z: 0.0, look: 0.4 }]],
      'p1.1': [['prince', 'afraid', { look: -0.8 }]],
      'p1.2': [['@env', 'overcast']],
      // 모든 것을 두고 동쪽 광야로 — 애굽의 자리는 사라진다
      'p1.3': [['prince', 'idle', { x: 1.7, z: 0.1 }], ['prince', 'idle', { show: 0, delay: 3200 }], ['slave', 'idle', { show: 0, delay: 600 }], ['slave2', 'idle', { show: 0, delay: 600 }], ['bricks', null, { show: 0, delay: 600 }]],
      // 미디안의 우물가: 일곱 자매가 쫓겨나고, 모세가 그들을 돕는다
      'p2.0': [['@env', 'day'], ['well', null, { show: 1 }], ['flock', null, { show: 1 }], ['flock2', null, { show: 1 }], ['flock3', null, { show: 1 }],
        ['d1', 'afraid', { show: 1 }], ['d2', 'afraid', { show: 1 }], ['d3', 'idle', { show: 1 }], ['sh1', 'rebuke', { show: 1, to: 'd2' }], ['sh2', 'point', { show: 1, look: -1 }],
        ['moses', 'idle', { show: 1, x: -0.6, z: 0.05, look: 1, delay: 1500 }], ['moses', 'rebuke', { to: 'sh1', delay: 3600 }],
        ['sh1', 'idle', { x: 1.6, z: 0.4, delay: 5200 }], ['sh2', 'idle', { x: 1.7, z: 0.2, delay: 5200 }], ['sh1', 'idle', { show: 0, delay: 7600 }], ['sh2', 'idle', { show: 0, delay: 7600 }],
        ['moses', 'bow', { x: -0.05, z: 0.18, look: 0.4, delay: 6000 }], ['d1', 'idle', { delay: 5000 }], ['d2', 'idle', { delay: 5000 }]],
      // 르우엘의 장막 — 십보라와 혼인한다
      'p2.1': [['tent', null, { show: 1 }], ['reuel', 'idle', { show: 1, x: 0.85, z: -0.2, look: -1 }], ['zip', 'idle', { show: 1, x: 0.25, z: 0.15, look: -1 }], ['moses', 'idle', { x: -0.05, z: 0.2, look: 0.6 }],
        ['d1', 'idle', { x: -0.55, z: 0.3 }], ['d2', 'idle', { x: -0.75, z: 0.45 }], ['d3', 'idle', { x: -0.95, z: 0.3 }]],
      // 그 사이 애굽에서는 탄식이 하늘에 닿았다
      'p2.2': [['@env', 'dusk'], ['moses', 'look-up', { look: -0.8 }]],
      w0: [['slave', 'speak', { to: 'prince' }]],
      w1: [['reuel', 'speak', { to: 'd2' }]],
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
      'p0.1': [['bush', 'fire']],
      'p0.2': [['moses', 'look-up', { look: 1 }]],
      // 가까이 다가가는 그를 부르는 음성
      'p1.0': [['moses', 'idle', { x: -0.05, z: 0.08, look: 1 }]],
      'p1.1': [['moses', 'afraid', { look: 1 }]],
      // 신을 벗고, 얼굴을 가린다
      'p1.2': [['moses', 'kneel', { look: 1 }], ['moses', 'bow', { delay: 2200 }]],
      'p1.3': [['moses', 'kneel', { look: 1 }]],
      // 제가 누구라고
      'p2.0': [['moses', 'shrug', { look: 1 }]],
      'p2.1': [['moses', 'idle', { x: -0.3, z: 0.12, look: 1 }]],
      // 지팡이가 뱀이 되는 표적
      'p2.2': [['serpent', 'hiss', { show: 1 }], ['moses', 'afraid', { look: 0.3 }], ['serpent', 'rest', { show: 0, delay: 3800 }], ['moses', 'listen', { look: 1, delay: 4200 }]],
      'p2.3': [['moses', 'bow', { look: 1 }]],
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
      'p0.2': [['pharaoh', 'rebuke', { to: 'aaron' }]],
      'p0.3': [['pharaoh', 'sit'], ['@env', 'overcast']],
      // 짚 없이 벽돌을 — 들판을 헤매고, 반장들이 매를 맞는다(감독관의 막대만)
      'p1.0': [['h1', 'bow', { show: 1 }], ['h2', 'bow', { show: 1 }], ['boss', 'rebuke', { show: 1, to: 'h1' }]],
      'p1.2': [['h1', 'idle', { x: -1.35, z: -0.2, look: -1 }], ['h2', 'bow', { x: -0.9, z: 0.45 }], ['h1', 'cower', { delay: 2600 }]],
      // 원망이 모세에게
      'p2.0': [['boss', 'idle', { show: 0 }], ['h1', 'rebuke', { x: -0.7, z: 0.05, to: 'moses' }], ['h2', 'rebuke', { x: -0.6, z: 0.35, to: 'moses' }], ['moses', 'idle', { look: -1 }]],
      'p2.1': [['h1', 'idle', { show: 0 }], ['h2', 'idle', { show: 0 }], ['moses', 'kneel', { look: -0.3 }]],
      'p2.2': [['moses', 'look-up', { look: -0.3 }]],
      'p2.3': [['moses', 'pray', { look: -0.3 }]],
      'p2.5': [['h1', 'bow', { show: 1, x: -1.15, z: 0.0 }], ['h2', 'bow', { show: 1, x: -0.85, z: 0.25 }]],
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
      'p0.1': [['frogs', null, { show: 1 }], ['pharaoh', 'afraid']],
      'p0.2': [['mag1', 'bow'], ['mag2', 'bow']],
      // 파리 떼 — 고센 땅만은 비켜 간다
      'p1.0': [['frogs', null, { show: 0 }], ['swarm', null, { show: 1 }], ['mag1', 'idle'], ['mag2', 'idle']],
      'p1.1': [['swarm', null, { show: 0 }], ['@env', 'storm'], ['hail', null, { show: 1 }], ['pharaoh', 'cower']],
      'p1.2': [['hail', null, { show: 0 }], ['@env', 'overcast'], ['swarm', null, { show: 1 }], ['swarm', null, { show: 0, delay: 3500 }], ['@env', 'dark', { delay: 3500 }]],
      // 어둠 속에서도 이스라엘 자손이 사는 곳에는 빛
      'p2.0': [['@env', 'dark'], ['light', null, { show: 1 }]],
      'p2.1': [['@env', 'overcast'], ['light', null, { show: 0 }], ['pharaoh', 'bow'], ['pharaoh', 'rebuke', { to: 'moses', delay: 2600 }]],
      'p2.2': [['moses', 'speak', { to: 'pharaoh' }]],
      'p2.3': [['moses', 'idle', { look: 0.8 }]],
      'p2.4': [['@env', 'dusk'], ['pharaoh', 'idle', { look: -0.6 }], ['aaron', 'mourn'], ['moses', 'mourn']],
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
      'p0.1': [['father', 'kneel', { x: -0.3, z: 0.25, look: 0.6 }]],
      // 우슬초에 피를 적셔 문설주와 인방에
      'p0.2': [['lamb', null, { show: 0 }], ['father', 'idle', { x: -0.55, z: -0.08, look: 2.8 }], ['father', 'raise', { delay: 2200 }], ['house', 'blood', { delay: 2600 }], ['house2', 'blood', { delay: 3400 }]],
      'p0.3': [['father', 'idle', { look: 0.4 }]],
      // 그 밤: 허리띠를 매고 지팡이를 쥔 채 서서 먹는다
      'p1.0': [['@env', 'night'], ['fire', null, { show: 1 }], ['h2', 'idle', { show: 1 }], ['father', 'break', { x: -0.6, z: 0.1, look: 0.5 }], ['mom', 'listen'], ['kid', 'listen']],
      // 한밤중의 통곡 — 집 안의 식구들은 엎드려 기도한다
      'p1.1': [['@env', 'dark'], ['father', 'pray'], ['mom', 'pray'], ['kid', 'pray'], ['h2', 'pray']],
      'p1.2': [['fire', null, { show: 0.5 }]],
      // 바로가 모세와 아론을 불러 떠나라 한다
      'p2.0': [['@env', 'night'], ['pharaoh', 'idle', { show: 1 }], ['moses', 'idle', { show: 1 }], ['aaron', 'idle', { show: 1 }], ['father', 'idle'], ['mom', 'idle'], ['kid', 'idle'], ['h2', 'idle']],
      // 반죽 그릇을 메고 라암셋을 나선다
      'p2.1': [['pharaoh', 'idle', { show: 0 }], ['fire', null, { show: 0 }], ['folk', null, { show: 1 }], ['mom', 'idle', { item: 'basket', x: 0.4, z: 0.15 }], ['father', 'idle', { x: 0.25, z: 0.35 }], ['kid', 'idle', { x: 0.55, z: 0.4 }], ['h2', 'idle', { x: 0.1, z: 0.5 }],
        ['moses', 'idle', { x: 1.35, z: 0.0, look: 1 }], ['aaron', 'idle', { x: 1.5, z: 0.2, look: 1 }]],
      'p2.2': [['folk', null, { x: 1.4 }], ['mom', 'idle', { x: 0.9 }], ['father', 'idle', { x: 0.75 }], ['kid', 'idle', { x: 1.05 }], ['h2', 'idle', { x: 0.6 }]],
      'p2.3': [['@env', 'dawn']],
      w0: [['father', 'listen', { look: 2.8 }]],
      w1: [['father', 'break'], ['mom', 'listen'], ['kid', 'listen']],
      w2: [['pharaoh', 'speak', { to: 'moses' }]],
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
      'p0.2': [['moses', 'idle', { look: 0.8 }]],
      // 요셉의 유골 상자를 챙긴다
      'p1.0': [['bearer', 'idle', { item: 'gift' }], ['moses', 'listen', { look: -1, to: 'bearer' }]],
      'p1.2': [['tent', null, { show: 1 }], ['tent2', null, { show: 1 }]],
      // 낮에는 구름 기둥, 밤에는 불 기둥
      'p1.3': [['pillar', 'cloud', { show: 1 }], ['moses', 'look-up', { look: 0.8 }], ['@env', 'night', { delay: 4500 }], ['pillar', 'fire', { delay: 4500 }]],
      'p2.0': [['folk', null, { x: -0.35 }]],
      // 길을 되돌려 바닷가에 진을 친다
      'p2.1': [['@env', 'day'], ['pillar', 'cloud'], ['moses', 'point', { look: -1.2 }]],
      'p2.2': [['moses', 'idle', { look: 0.8 }]],
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
      'p0.0': [['car1', null, { show: 1, x: -1.85 }], ['car2', null, { show: 1, x: -2.05 }]],
      'p0.1': [['man', 'afraid', { look: -1.2 }], ['wom', 'afraid', { look: -1.2 }]],
      'p0.2': [['aaron', 'afraid', { look: -1 }]],
      'p1.0': [['man', 'rebuke', { to: 'moses' }]],
      'p1.1': [['moses', 'raise', { look: -0.8 }]],
      // 구름 기둥이 진 뒤로 옮겨 가 밤을 가른다
      'p1.2': [['@env', 'night'], ['pillar', 'fire', { show: 1, x: -1.55, z: -0.15 }], ['car1', null, { x: -1.95 }], ['car2', null, { x: -2.15 }], ['man', 'idle'], ['wom', 'idle'], ['aaron', 'idle', { look: 1 }]],
      // 손을 내밀자 밤새 동풍 — 물이 갈라진다
      'p2.0': [['moses', 'raise', { look: 1 }], ['sea', 'part', { delay: 1200 }]],
      // 좌우에 벽처럼 선 물 사이로
      'p2.1': [['moses', 'idle', { x: 1.35, z: -0.05, look: -1 }], ['aaron', 'idle', { x: 1.25, z: 0.15, delay: 600 }], ['folk', null, { x: 1.55, delay: 400 }], ['man', 'idle', { x: 1.5, z: 0.25, delay: 1400 }], ['wom', 'idle', { x: 1.65, z: 0.05, delay: 2000 }]],
      // 새벽, 병거가 길로 들어서고 물이 돌아온다 — 병거는 물결 속에 사라진다
      'p2.2': [['@env', 'dawn'], ['pillar', 'cloud', { show: 0 }], ['car1', null, { x: -0.4, z: -0.05 }], ['car2', null, { x: -0.7, z: 0.1 }], ['moses', 'raise', { look: -1, delay: 1500 }],
        ['sea', 'return', { delay: 3500 }], ['car1', null, { show: 0, delay: 4200 }], ['car2', null, { show: 0, delay: 4400 }]],
      'p2.3': [['moses', 'pray', { look: -1 }], ['aaron', 'pray', { look: -1 }], ['man', 'kneel', { look: -1 }], ['wom', 'kneel', { look: -1 }]],
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
      'p0.1': [['moses', 'idle', { look: -1.6 }], ['aaron', 'idle', { look: -2 }]],
      // 모세와 이스라엘 자손이 노래한다
      'p0.2': [['moses', 'raise', { look: 0.6 }], ['aaron', 'raise', { look: 0.3 }]],
      'p1.0': [['moses', 'look-up', { look: 0.4 }]],
      'p1.2': [['moses', 'raise', { look: 0.6 }]],
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
};

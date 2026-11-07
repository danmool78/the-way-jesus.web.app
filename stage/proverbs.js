/* ---------- 잠언 여정의 장면 연출 (stage/scenes.js의 SCRIPTS에 합쳐진다) ----------
   지혜를 따라 걷는 하루: 솔로몬 때 예루살렘을 사람 눈높이의 거리 무대(stage/street.js)로 걷는다.
   좌표는 세트와 같은 무대 단위(사람 키 0.88 ≈ 1.7m, 1m ≈ 0.52). 성문은 북쪽(-z, 안쪽 얼굴 z ≈ -7.28), 광장 양옆에 집, 동쪽에 좌판.
   look은 몸이 보는 쪽: 0 = 앞(카메라 쪽, +z), ±3.14 = 성문 쪽.
   지혜(wisdom)는 잠언이 그리는 대로 성문 어귀에서 외치는 여인(1:20–21) — 은은한 빛으로 보통 사람과 가른다 */

const GZ = -7.28;
const BENCH = GZ + 0.5; // 성문 돌 의자 앞 (앉은 자세가 스스로 낮아진다)

export const PROVERBS = {
  /* p01. 성문에서 부르는 지혜 (잠 1장) — 아버지와 아들이 아침 성문 광장으로 나온다.
     장로들은 돌 의자에서 송사를 듣고, 장사꾼은 좌판을 편다. 지혜가 성문 어귀에 서서 외치지만 사람들은 지나쳐 간다 */
  p01: {
    street: 'gate', env: 'day',
    cams: {
      wide: { pos: [0.7, 1.05, 7.4], at: [0, 1.05, -6.0], fov: 64 },   // 광장에서 성문을 바라봄
      high: { pos: [4.5, 4.2, 8], at: [-0.3, 0.6, -2.5], fov: 64 },     // 비스듬히 내려다본 광장 (아침이 열리는 모습)
      talk: { pos: [1.0, 0.92, 4.7], at: [-0.5, 0.68, 1.7], fov: 48 },  // 아버지와 아들
      gate: { pos: [0.35, 0.82, -1.2], at: [0, 1.0, -6.8], fov: 58 },   // 성문 어귀의 지혜와 장로들
    },
    cam: 'wide',
    cast: {
      father: ['father', -0.75, 2.0, 1.0],
      son: ['son', -0.2, 2.3, -2.0],
      wisdom: ['wisdom', 0, GZ + 0.95, 0, { gaze: false }],
      // 성문 의자의 장로들과 송사하는 사람
      elder1: ['elder', -1.66, BENCH, 0.15, { gaze: false, pose: 'sit' }],
      elder2: ['elder', -1.2, BENCH, 0.3, { gaze: false, pose: 'sit' }],
      elder3: ['elder', 1.35, BENCH, -0.3, { gaze: false, pose: 'sit' }],
      elder4: ['official', 1.8, BENCH, -0.1, { gaze: false, pose: 'sit' }],
      plaintiff: ['man', -1.45, GZ + 1.35, -2.7, { gaze: false, pose: 'listen' }],
      // 장터: 항아리 좌판(동쪽 앞), 곡식 좌판(동쪽 뒤, 저울), 천 좌판(서쪽)
      potter: ['servant', 4.62, -1.3, -1.57, { gaze: false }],
      buyer: ['woman', 3.65, -1.25, 1.57, { gaze: false, pose: 'listen' }],
      grain: ['shepherd', 4.62, 1.3, -1.57, { gaze: false }],
      weaver: ['woman2', -4.75, 3.1, 1.57, { gaze: false }],
      // 지나가는 사람들
      walker: ['man', 0.9, 5.5, 3.14, { gaze: false }],
      fool: ['rich', -4.0, 0.6, 1.57, { gaze: false }], // 지혜와 훈계를 업신여기는 젊은이 (1:7)
      child: ['child', -3.9, -1.6, 0.8, { gaze: false }],
    },
    beats: {
      // 낭독 없이 볼 때: 성문 어귀에서 외치는 지혜, 그쪽을 가리키는 아버지와 바라보는 아들
      enter: [['@env', 'day'], ['@cam', 'wide'], ['wisdom', 'raise', { show: 1 }],
        ['father', 'point', { x: -0.75, z: 2.0, look: 3.0 }], ['son', 'look-up', { x: -0.2, z: 2.3, look: -3.0 }],
        ['walker', 'idle', { x: 0.6, z: -3.2, look: 3.14 }], ['fool', 'idle', { x: 1.6, z: 0.4, look: -1.0 }]],
      // 해가 막 떠오른 성문 광장: 내려다본 모습에서 시작, 아버지와 아들은 광장 앞쪽에서 걸어 들어온다
      intro: [['@env', 'dawn'], ['@cam', 'high'], ['wisdom', 'idle', { show: 0 }],
        ['father', 'idle', { x: -0.9, z: 6.8, look: 3.14 }], ['son', 'idle', { x: -0.3, z: 7.1, look: 3.14 }],
        ['walker', 'idle', { x: 0.9, z: 5.5, look: 3.14 }], ['fool', 'idle', { x: -4.0, z: 0.6, look: 1.57 }]],
      // 아들아, 오늘은 나와 함께 성문으로 나가자 — 광장으로 걸어 들어온다
      'p0.0': [['@cam', 'wide'], ['father', 'idle', { x: -0.75, z: 2.0, look: 1.0 }], ['son', 'idle', { x: -0.2, z: 2.3, look: -2.0 }]],
      // 해가 막 떠오른 예루살렘 — 날이 밝고, 성문으로 드나드는 사람
      'p0.1': [['@env', 'day'], ['walker', 'idle', { x: 0.6, z: -9.5, look: 3.14 }], ['buyer', 'point', { look: 1.57, delay: 1500 }]],
      // 무엇보다 먼저 이 말을 마음에 새겨라 — 아버지가 아들에게
      'p0.2': [['@cam', 'talk'], ['father', 'speak', { to: 'son' }], ['son', 'listen']],
      'p0.3': [['father', 'raise'], ['son', 'look-up']],
      // 미련한 사람은 지혜와 훈계를 업신여긴다 — 뒤로 지나가며 어깨를 으쓱하는 젊은이
      'p0.4': [['father', 'speak', { to: 'son' }], ['son', 'listen'], ['fool', 'idle', { x: -3.0, z: 0.2, look: 0.9 }], ['fool', 'shrug', { delay: 3600 }]],
      // 들어 보아라 — 성문 쪽을 가리킨다
      'p1.0': [['@cam', 'wide'], ['father', 'point', { look: 3.0 }], ['son', 'idle', { look: -3.0 }]],
      // 지혜가 길거리에서 외치고 — 성문 어귀에 지혜가 선다
      'p1.1': [['@cam', 'gate'], ['wisdom', 'raise', { show: 1 }]],
      'p1.2': [['wisdom', 'speak', { look: 0 }], ['elder1', 'sit', { look: 1.3 }], ['elder3', 'sit', { look: -1.3 }]],
      // 어리석은 사람들아, 언제까지 — 젊은이는 지혜 곁을 지나 성문 밖으로 나가 버린다
      'p1.3': [['wisdom', 'raise', { look: 0.3 }], ['fool', 'idle', { x: 0.55, z: -12, look: 3.14 }]],
      'p1.4': [['wisdom', 'speak', { look: 0 }], ['elder2', 'sit', { look: 1.2 }], ['elder4', 'sit', { look: -1.2 }]],
      // 내 영을 너희에게 부어 주겠다 — 두 팔을 펴 내미는 지혜
      'p1.5': [['wisdom', 'bless', { look: 0 }]],
      // 지혜는 깊은 산속에 숨어 있지 않다 — 다시 광장 전체
      'p2.0': [['@cam', 'high'], ['wisdom', 'raise']],
      'p2.1': [['@cam', 'wide'], ['buyer', 'point', { look: 1.57 }], ['potter', 'shrug', { delay: 1200 }]],
      // 네 아버지의 훈계를 듣고 — 아버지와 아들
      'p2.2': [['@cam', 'talk'], ['father', 'speak', { look: 1.0, to: 'son' }], ['son', 'listen', { look: -2.0 }]],
      'p2.3': [['father', 'speak', { look: 1.0, to: 'son' }], ['son', 'bow', { look: -2.0 }]],
      // 끝: 둘이 함께 성문 쪽으로 걸어간다 (다음 장면은 성 밖 들판)
      end: [['@cam', 'wide'], ['wisdom', 'raise', { show: 1 }], ['father', 'idle', { x: -0.45, z: -2.4, look: 3.14 }], ['son', 'idle', { x: 0.1, z: -2.2, look: 3.14 }]],
    },
  },

  /* p02. 들판의 개미 (잠 6:6–11, 24:30–34) — 성문을 나와 계단식 밭 사이 길로. 왼쪽은 거두는 이웃의 밀밭,
     오른쪽은 가시덤불에 덮이고 돌담이 무너진 게으른 사람의 밭. 아들은 길가 개미집 곁에 무릎 꿇고 개미 행렬을 본다.
     밭 주인은 올리브나무 그늘에서 끝까지 깨지 않는다 (좌표는 세트와 같은 무대 단위, 1m ≈ 0.52) */
  p02: {
    street: 'field', env: 'day',
    cams: {
      wide: { pos: [0.62, 0.99, 7.8], at: [0, 2.2, -40], fov: 66 },   // 길에서 성 쪽을 바라봄 (언덕 위 성벽과 성전)
      high: { pos: [6.2, 4.2, 9.4], at: [-0.5, 0, -2.1], fov: 64 },      // 두 밭을 함께 내려다봄
      reap: { pos: [-0.5, 0.88, 3.1], at: [-3.6, 0.31, -0.5], fov: 56 },  // 거두는 이웃의 밀밭
      ants: { pos: [-0.25, 0.48, 3.75], at: [-0.66, 0.0, 2.15], fov: 34 },   // 길가 개미집 (아들 눈높이 가까이)
      lazy: { pos: [0.9, 1.05, 1.1], at: [3.3, 0.12, -1.55], fov: 40 },   // 게으른 사람의 밭과 낮잠 자는 주인
    },
    cam: 'wide',
    cast: {
      father: ['father', 0.1, 3.6, 2.6],
      son: ['son', 0.45, 3.75, -2.6],
      reaper1: ['man', -3.1, -0.75, -0.6, { gaze: false, pose: 'bow' }],
      reaper2: ['servant', -5.2, -0.3, 0.5, { gaze: false, pose: 'bow' }],
      gleaner: ['woman', -3.7, 1.3, -1.2, { gaze: false }],
      sluggard: ['man', 3.3, -1.3, -0.4, { gaze: false, pose: 'sleep' }], // 게으른 밭 주인 (6:9–10)
    },
    beats: {
      // 낭독 없이 볼 때: 개미집 곁에 무릎 꿇은 아들, 개미를 가리키는 아버지
      enter: [['@env', 'day'], ['@cam', 'ants'], ['son', 'kneel', { x: -0.16, z: 2.18, look: -1.4 }], ['father', 'point', { x: 0.15, z: 2.75, look: -2.0 }]],
      intro: [['@env', 'day'], ['@cam', 'high'], ['father', 'idle', { x: 0.1, z: 8.3, look: 3.14 }], ['son', 'idle', { x: 0.45, z: 8.5, look: 3.14 }]],
      // 성문을 나와 들판으로 — 길을 따라 걸어 들어온다
      'p0.0': [['@cam', 'wide'], ['father', 'idle', { x: 0.1, z: 3.6, look: 2.6 }], ['son', 'idle', { x: 0.45, z: 3.75, look: -2.6 }]],
      // 사람들은 벌써 밭에 나가 곡식을 거둔다
      'p0.1': [['@cam', 'reap'], ['gleaner', 'hold-basket', { item: 'basket', x: -3.4, z: 1.6, look: -0.8 }]],
      // 길가에 쪼그려 앉아 이 작은 것들을 보아라 — 개미집 곁으로
      'p0.2': [['@cam', 'ants'], ['son', 'idle', { x: -0.16, z: 2.18, look: -1.4 }], ['son', 'kneel', { delay: 1800 }], ['father', 'point', { x: 0.15, z: 2.75, look: -2.0 }]],
      'p0.3': [['father', 'speak', { to: 'son' }]],
      'p0.4': [['father', 'point', { look: -2.0 }], ['son', 'kneel', { look: -1.4 }]],
      // 이제 저 밭을 보아라 — 일어나 오른쪽 밭을 본다
      'p1.0': [['@cam', 'lazy'], ['son', 'idle', { look: 1.3 }], ['father', 'point', { look: 1.5 }]],
      'p1.1': [['father', 'speak', { look: 1.2, to: 'son' }]],
      'p1.2': [['father', 'point', { look: 1.4 }], ['son', 'look-up', { look: 1.3 }]],
      'p1.3': [['father', 'speak', { look: 1.2, to: 'son' }]],
      // 좀 더 자자 — 다시 두 밭을 함께
      'p2.0': [['@cam', 'high'], ['son', 'idle', { look: -2.6 }]],
      'p2.1': [['@cam', 'wide'], ['father', 'speak', { to: 'son' }], ['son', 'listen']],
      // 부지런함은 작은 개미에게서도 — 개미 행렬을 한 번 더
      'p2.2': [['@cam', 'ants']],
      // 장터로 돌아가자 — 성 쪽으로 걸어 올라간다
      'p2.3': [['@cam', 'wide'], ['father', 'idle', { x: 0.05, z: -5.5, look: 3.14 }], ['son', 'idle', { x: 0.42, z: -5.3, look: 3.14, delay: 600 }]],
      end: [['@cam', 'wide'], ['father', 'idle', { x: 0.05, z: -5.5, look: 3.14 }], ['son', 'idle', { x: 0.42, z: -5.3, look: 3.14 }]],
    },
  },

  /* p03. 장터의 저울 (잠 11:1, 16:11, 20:10, 22:1) — 오후, 다시 성문 광장의 장터. 동쪽 곡식 좌판의 저울(세트의 scales)을
     가까이 본다: 속이는 추를 꺼내면 들보가 기울고(['@set', 'scales:cheat']), '정확한 추'에서 수평으로 돌아온다.
     좌판: 곡식 좌판 x ≈ 4.47, z ≈ 1.3 (상은 그 서쪽), 저울 (4.1, 높이 0.39, 1.27) */
  p03: {
    street: 'gate', env: 'calm',
    cams: {
      wide: { pos: [-2.2, 1.2, 6.2], at: [3.6, 0.7, 0.5], fov: 64 },   // 광장 남서쪽에서 동쪽 장터를
      stall: { pos: [2.3, 0.95, 2.9], at: [4.3, 0.55, 1.2], fov: 48 }, // 곡식 좌판과 장수
      scales: { pos: [3.1, 0.74, 2.45], at: [4.1, 0.5, 1.27], fov: 32 },
      west: { pos: [3.0, 1.1, 6.8], at: [-3.4, 0.7, 3.4], fov: 60 },   // 해 질 녘 광장 서쪽 (친구의 집 쪽) // 저울 가까이
      talk: { pos: [1.9, 0.9, 3.7], at: [3.35, 0.7, 1.45], fov: 46 },   // 좌판 앞의 아버지와 아들
    },
    cam: 'wide',
    cast: {
      father: ['father', 3.45, 1.15, 1.57],
      son: ['son', 3.3, 1.7, 1.3],
      seller: ['merchant', 4.62, 1.3, -1.57, { gaze: false }],
      buyer: ['woman2', 3.6, 0.55, 1.4, { gaze: false }],
      potter: ['servant', 4.62, -1.3, -1.57, { gaze: false }],
      weaver: ['woman2', -4.75, 3.1, 1.57, { gaze: false }],
      elder1: ['elder', -1.66, BENCH, 0.15, { gaze: false, pose: 'sit' }],
      elder2: ['elder', -1.2, BENCH, 0.3, { gaze: false, pose: 'sit' }],
      elder3: ['elder', 1.35, BENCH, -0.3, { gaze: false, pose: 'sit' }],
      passer: ['man', -1.0, -3.0, 0.2, { gaze: false }],
    },
    beats: {
      // 낭독 없이 볼 때: 기운 저울 앞의 장수, 그것을 보는 아버지와 아들
      enter: [['@env', 'calm'], ['@cam', 'stall'], ['@set', 'scales:cheat'], ['seller', 'point', { look: -1.57 }], ['buyer', 'listen'],
        ['father', 'point', { x: 3.45, z: 1.15, look: 1.57 }], ['son', 'look-up', { x: 3.3, z: 1.7, look: 1.3 }]],
      intro: [['@env', 'calm'], ['@cam', 'wide'], ['@set', 'scales:fair'], ['father', 'idle', { x: -1.2, z: 6.5, look: 1.2 }], ['son', 'idle', { x: -0.8, z: 6.8, look: 1.2 }]],
      // 장터로 돌아가자 — 광장을 가로질러 곡식 좌판 앞으로
      'p0.0': [['father', 'idle', { x: 3.45, z: 1.15, look: 1.57 }], ['son', 'idle', { x: 3.3, z: 1.7, look: 1.3 }], ['passer', 'idle', { x: -0.6, z: -9, look: 3.14 }]],
      'p0.1': [['@cam', 'stall'], ['buyer', 'point', { look: 1.4 }]],
      // 저 곡식 장수의 손을 보아라
      'p0.2': [['seller', 'point', { look: -1.57 }], ['father', 'point', { look: 1.57 }]],
      // 가벼운 추를 꺼낸다 — 저울 가까이, 들보가 기운다
      'p0.3': [['@cam', 'scales'], ['@set', 'scales:cheat', { delay: 1500 }]],
      'p0.4': [['buyer', 'listen'], ['seller', 'shrug']],
      // 속이는 저울은 여호와께서 미워하시지만 — 아버지가 아들에게
      'p1.0': [['@cam', 'talk'], ['father', 'speak', { to: 'son' }], ['son', 'listen']],
      'p1.1': [['father', 'point', { look: 1.57 }], ['son', 'idle', { look: 1.5 }]],
      // 공평한 저울과 접시는 여호와의 것 — 저울이 수평으로 돌아온다
      'p1.2': [['@cam', 'scales'], ['@set', 'scales:fair', { delay: 900 }]],
      // 아무도 보지 않는 주머니 속까지
      'p2.0': [['@cam', 'talk'], ['father', 'speak', { look: 0.6, to: 'son' }], ['son', 'listen', { look: -2.0 }]],
      'p2.1': [['father', 'raise'], ['son', 'look-up']],
      // 친구의 집으로 — 해 질 녘, 광장 서쪽으로 걸어간다
      'p2.2': [['@env', 'dusk'], ['@cam', 'west'], ['father', 'idle', { x: -3.6, z: 4.2, look: -1.57 }], ['son', 'idle', { x: -3.3, z: 4.6, look: -1.57, delay: 600 }]],
      end: [['@env', 'dusk'], ['@cam', 'west'], ['@set', 'scales:fair'], ['father', 'idle', { x: -3.6, z: 4.2, look: -1.57 }], ['son', 'idle', { x: -3.3, z: 4.6, look: -1.57 }]],
    },
  },

  /* p04. 친구의 집 (잠 15:17, 17:17, 27:6, 27:17, 18:24) — 해 질 녘 네 방 집의 안마당(세트 home).
     문간에서 친구가 맞아들이고, 등잔을 밝히고(['@set', 'lamps:on']), 마당 가운데 자리에 둘러앉아 나물과 빵을 먹는다.
     앉은 채 말하는 사람은 'sit-speak'. 자리 가운데 (0, -0.26), 큰방 문 z ≈ -2.08, 거리로 난 문 z ≈ 2.16 */
  p04: {
    street: 'home', env: 'dusk',
    cams: {
      door: { pos: [1.15, 1.05, -1.55], at: [-0.05, 0.42, 1.3], fov: 66 },  // 큰방 쪽에서 거리로 난 문을 — 들어서고 나가는 사람의 얼굴이 보이게
      meal: { pos: [1.9, 1.05, 1.85], at: [-0.1, 0.2, -0.4], fov: 56 },    // 둘러앉은 자리
      pair: { pos: [0.02, 0.5, 0.75], at: [0, 0.24, -0.31], fov: 54 },     // 마주 앉은 아버지와 친구
      son: { pos: [-0.6, 0.8, 1.35], at: [-0.25, 0.25, -0.5], fov: 50 },  // 아버지와 아들 (아버지 옆얼굴과 아들의 얼굴)
      sky: { pos: [1.56, 2.5, 1.87], at: [0, 0.1, -0.52], fov: 66 },     // 위에서 본 저녁 마당
    },
    cam: 'door',
    cast: {
      father: ['father', -0.52, -0.26, 1.57, { pose: 'sit-ground' }],
      friend: ['elder', 0.52, -0.26, -1.57, { pose: 'sit-ground' }],
      son: ['son', 0, -0.74, 0, { pose: 'sit-ground' }],
      wife: ['woman', 0.47, -0.7, -0.6, { pose: 'sit-ground', gaze: false }],
    },
    beats: {
      // 낭독 없이 볼 때: 등잔 둘레에 둘러앉아 친구가 말한다
      enter: [['@env', 'night'], ['@cam', 'meal'], ['@set', 'lamps:on'], ['friend', 'sit-speak', { to: 'father' }]],
      // 해 질 녘, 거리로 난 문으로 들어선다. 친구는 마당에서 맞으러 나오고, 아내는 화덕 곁에
      intro: [['@env', 'dusk'], ['@cam', 'door'], ['@set', 'lamps:dim'],
        ['father', 'idle', { x: -0.15, z: 1.95, look: 3.14 }], ['son', 'idle', { x: -0.5, z: 2.05, look: 3.14 }],
        ['friend', 'idle', { x: 0.38, z: 0.45, look: -0.3 }], ['wife', 'idle', { x: -1.25, z: -1.25, look: 0.6 }]],
      // 내 오랜 친구의 집 — 마당으로 들어서고, 친구가 두 팔을 벌려 맞는다
      'p0.0': [['father', 'idle', { x: -0.2, z: 0.95, look: 3.0 }], ['son', 'idle', { x: -0.55, z: 1.1, look: 2.8 }], ['friend', 'raise', { look: 0, delay: 1800 }]],
      // 등잔을 밝히고 우리를 맞아들인다
      'p0.1': [['@set', 'lamps:on'], ['friend', 'speak', { to: 'father' }]],
      // 나물 한 그릇과 빵 — 자리에 둘러앉는다
      'p0.2': [['@cam', 'meal'], ['father', 'sit-ground', { x: -0.52, z: -0.26, look: 1.57 }], ['friend', 'sit-ground', { x: 0.52, z: -0.26, look: -1.57 }],
        ['son', 'sit-ground', { x: 0, z: -0.74, look: 0 }], ['wife', 'hold-basket', { item: 'basket', x: 0.2, z: -0.62, look: -1.2 }]],
      'p0.3': [['wife', 'sit-ground', { item: null, x: 0.47, z: -0.7, look: -0.6 }], ['father', 'sit-speak', { to: 'son' }]],
      // 친구는 언제나 사랑하고 — 마주 앉은 두 사람
      'p1.0': [['@cam', 'pair'], ['@env', 'night'], ['father', 'sit-ground', { look: 1.57 }], ['friend', 'sit-speak', { to: 'father' }]],
      // 내 잘못을 숨기지 않고 바로 말해 주었다 — 듣는 아버지는 고개를 숙인다
      'p1.1': [['friend', 'sit-speak', { to: 'father' }], ['father', 'sit-ground', { look: 1.4 }]],
      'p1.2': [['friend', 'sit-ground', { look: -1.57 }], ['father', 'sit-speak', { to: 'friend' }]],
      // 철은 철로 날카로워지듯 — 위에서 본 저녁 마당, 등잔 둘레의 넷
      'p1.3': [['@cam', 'sky'], ['father', 'sit-ground', { look: 1.57 }]],
      // 아들아 — 아버지가 아들 쪽으로
      'p2.0': [['@cam', 'son'], ['father', 'sit-speak', { to: 'son' }], ['son', 'sit-ground', { look: -0.7 }]],
      'p2.1': [['son', 'sit-ground', { look: -0.9 }]],
      // 밤이 깊었다 — 일어나 문으로
      'p2.2': [['@cam', 'door'], ['father', 'idle', { x: -0.2, z: 0.9, look: 3.0 }], ['son', 'idle', { x: -0.55, z: 1.05, look: 2.8 }], ['friend', 'bless', { x: 0.4, z: 0.35, look: -0.3, delay: 600 }], ['wife', 'idle', { x: 0.8, z: 0.15, look: -0.4, delay: 900 }]],
      'p2.3': [['father', 'idle', { x: -0.1, z: 2.6, look: 0 }], ['son', 'idle', { x: -0.4, z: 2.7, look: 0, delay: 500 }]],
      end: [['@env', 'night'], ['@cam', 'door'], ['@set', 'lamps:on'], ['father', 'idle', { x: -0.2, z: 0.9, look: 3.0 }], ['son', 'idle', { x: -0.55, z: 1.05, look: 2.8 }], ['friend', 'bless', { x: 0.4, z: 0.35, look: -0.3 }], ['wife', 'idle', { x: 0.8, z: 0.15, look: -0.4 }]],
    },
  },

  /* p05. 해 질 녘 골목 (잠 7장, 4:23) — 집으로 가는 밤 골목(세트 alley). 아버지가 예전에 살창 너머로 본 일을 들려준다.
     연출 원칙에 따라 꾐은 그리지 않는다: 여인은 어두운 윤곽, 젊은이가 따라 들어가면 문이 닫히고 불빛이 꺼진다(['@set', 'door:shut']).
     골목은 -z로 내려가 z ≈ -6 무렵에서 동쪽으로 꺾인다. 그 여인의 문 (0.83, -4.6), 살창 상자 (-0.63, 높이 1.69, 1.14) */
  p05: {
    street: 'alley', env: 'night',
    cams: {
      alley: { pos: [0.16, 0.94, 5.46], at: [0.1, 0.52, -4.68], fov: 58 },   // 골목 위쪽에서 아래로
      lattice: { pos: [-0.64, 1.7, 1.75], at: [0.25, 0.22, -4.4], fov: 54 },  // 살창 상자 안에서 살 너머로
      corner: { pos: [-0.85, 0.85, -2.3], at: [0.6, 0.5, -4.3], fov: 54 },  // 모퉁이의 등불 켠 문 — 비스듬히 옆에서 (젊은이가 여인을 가리지 않게, 여인은 멀리 윤곽으로)
      pair: { pos: [0.15, 0.85, 1.4], at: [-0.22, 0.62, 3.0], fov: 46 },     // 걸음을 멈춘 아버지와 아들
    },
    cam: 'alley',
    cast: {
      father: ['father', -0.39, 2.81, 3.0],
      son: ['son', -0.06, 2.95, 3.1],
      youth: ['rich', 0.26, 7.3, 3.14, { gaze: false, speed: 0.42 }],
      woman: ['woman2', 1.14, -4.6, -1.0, { gaze: false, silhouette: true }],
    },
    beats: {
      // 낭독 없이 볼 때: 살창 너머로 내려다본 골목 — 모퉁이의 등불 켠 문으로 다가가는 젊은이
      enter: [['@env', 'night'], ['@cam', 'lattice'], ['@set', 'door:open'], ['youth', 'idle', { x: 0.3, z: -3.2, look: 3.0 }], ['woman', 'idle', { show: 0 }],
        ['father', 'idle', { show: 0 }], ['son', 'idle', { show: 0 }]],
      intro: [['@env', 'night'], ['@cam', 'alley'], ['@set', 'door:open'], ['woman', 'idle', { show: 0 }], ['youth', 'idle', { show: 0, x: 0.26, z: 7.3 }],
        ['father', 'idle', { x: -0.36, z: 4.94, look: 3.14 }], ['son', 'idle', { x: -0.05, z: 5.1, look: 3.14 }]],
      // 이 골목을 지나 집으로 — 내려오다 살창 아래에서 멈춘다
      'p0.0': [['father', 'idle', { x: -0.39, z: 2.81, look: 3.0 }], ['son', 'idle', { x: -0.06, z: 2.95, look: 3.1 }]],
      // 살창 너머로 내다보았을 때 — 기억 속의 그날 밤: 젊은이가 골목을 내려간다
      'p0.1': [['@cam', 'lattice'], ['father', 'idle', { show: 0 }], ['son', 'idle', { show: 0 }], ['youth', 'idle', { show: 1, x: 0.26, z: 3.6, look: 3.14 }]],
      'p0.2': [['youth', 'idle', { x: 0.3, z: -3.6, look: 3.0 }]],
      // 한 여인이 그를 맞으러 나왔다 — 어두운 윤곽으로만
      'p1.0': [['@cam', 'corner'], ['woman', 'idle', { show: 1, x: 0.6, z: -4.4, look: -0.9 }], ['youth', 'idle', { x: 0.3, z: -3.75, look: 2.6 }]],
      'p1.1': [['woman', 'speak', { to: 'youth' }]],
      // 젊은이는 곧 그 여인을 따라갔다 — 문 안으로, 문이 닫히고 불이 꺼진다
      'p1.2': [['woman', 'idle', { x: 1.3, z: -4.6 }], ['woman', 'idle', { show: 0, delay: 2600 }],
        ['youth', 'idle', { x: 1.3, z: -4.6, delay: 900 }], ['youth', 'idle', { show: 0, delay: 4200 }], ['@set', 'door:shut', { delay: 4600 }]],
      'p1.3': [['@cam', 'lattice']],
      // 아들아 — 다시 지금, 살창 아래의 아버지와 아들
      'p2.0': [['@cam', 'pair'], ['@set', 'door:shut'], ['father', 'speak', { show: 1, to: 'son', look: 2.2 }], ['son', 'listen', { show: 1, look: -1.6 }]],
      'p2.1': [['father', 'speak', { look: 2.2, to: 'son' }], ['son', 'bow', { look: -1.6 }]],
      'p2.3': [['father', 'speak', { look: 2.2, to: 'son' }], ['son', 'look-up', { look: -1.6 }]],
      // 지혜가 너를 지켜 줄 것이다 — 함께 골목을 내려간다
      'p2.4': [['@cam', 'alley'], ['father', 'idle', { x: -0.3, z: -2.0, look: 3.14 }], ['son', 'idle', { x: 0.05, z: -1.8, look: 3.14, delay: 500 }]],
      end: [['@cam', 'alley'], ['@set', 'door:shut'], ['woman', 'idle', { show: 0 }], ['youth', 'idle', { show: 0 }],
        ['father', 'idle', { show: 1, x: -0.3, z: -2.0, look: 3.14 }], ['son', 'idle', { show: 1, x: 0.05, z: -1.8, look: 3.14 }]],
    },
  },

  /* p06. 왕궁 앞에서 (잠 21:1, 16:18, 14:31, 30:7–9, 22:9) — 밤, 솔로몬 궁의 앞뜰 문(세트 palace).
     백향목 기둥 주랑과 잔치 불빛, 파수꾼 사이로 들어가는 귀인들, 문 곁의 가난한 사람. 끝에 아들이 친구가 싸 준 빵을 나눈다.
     앞뜰 문 z ≈ -1.04 (문기둥 x ±1.35), 궁 앞면 z ≈ -8.3 */
  p06: {
    street: 'palace', env: 'night',
    cams: {
      wide: { pos: [0.62, 0.99, 8.3], at: [0, 2.0, -7.3], fov: 66 },     // 광장에서 궁을
      porch: { pos: [1.4, 0.8, 0.9], at: [0, 2.3, -6.8], fov: 60 },     // 문 너머로 올려다본 백향목 기둥
      gate: { pos: [-0.1, 0.8, 2.6], at: [-1.25, 0.4, -0.4], fov: 52 },  // 파수꾼과 문 곁의 가난한 사람
      give: { pos: [-2.6, 0.72, 1.5], at: [-1.45, 0.3, -0.05], fov: 48 },  // 빵을 나누는 아들 — 서쪽에서 (아버지 등이 가리지 않게)
      pair: { pos: [-0.1, 0.8, 3.4], at: [-1.0, 0.62, 1.8], fov: 44 },   // 아버지와 아들
    },
    cam: 'wide',
    cast: {
      father: ['father', -1.14, 1.77, 2.8],
      son: ['son', -0.83, 1.98, 3.0],
      guard1: ['soldier', -0.78, -0.31, 0, { gaze: false }],
      guard2: ['soldier', 0.78, -0.31, 0, { gaze: false }],
      beggar: ['beggar', -1.77, -0.2, 0.5, { gaze: false, pose: 'sit-ground' }],
      noble: ['rich', 1.6, 4.2, 3.14, { gaze: false }],
      lady: ['princess', 2.0, 4.5, 3.14, { gaze: false }],
      porter: ['servant', 1.3, 4.8, 3.14, { gaze: false }],
    },
    beats: {
      // 낭독 없이 볼 때: 문 곁의 가난한 사람에게 빵을 내미는 아들
      enter: [['@env', 'night'], ['@cam', 'give'], ['beggar', 'sit-ground', { item: 'cup' }], ['son', 'kneel', { x: -1.5, z: 0.32, look: -2.6, item: 'bread' }],
        ['father', 'idle', { x: -0.95, z: 1.15, look: -2.5 }], ['noble', 'idle', { show: 0 }], ['lady', 'idle', { show: 0 }], ['porter', 'idle', { show: 0 }]],
      intro: [['@env', 'night'], ['@cam', 'wide'], ['beggar', 'sit-ground', { item: 'cup' }],
        ['father', 'idle', { x: -0.78, z: 6.2, look: 3.14 }], ['son', 'idle', { x: -0.45, z: 6.4, look: 3.14 }]],
      // 왕궁 앞을 지나는구나 — 광장으로 걸어 들어온다
      'p0.0': [['father', 'idle', { x: -1.14, z: 1.77, look: 2.8 }], ['son', 'idle', { x: -0.83, z: 1.98, look: 3.0 }]],
      // 귀인들이 파수꾼 사이로 들어간다 — 등불 든 종을 앞세우고
      'p0.1': [['@cam', 'porch'], ['porter', 'idle', { item: 'torch', x: 0.1, z: -5.0 }], ['noble', 'idle', { x: 0.25, z: -5.6, delay: 500 }], ['lady', 'idle', { x: 0.55, z: -5.4, delay: 900 }],
        ['porter', 'idle', { show: 0, delay: 9000 }], ['noble', 'idle', { show: 0, delay: 9500 }], ['lady', 'idle', { show: 0, delay: 9800 }]],
      // 문 곁의 가난한 사람
      'p0.2': [['@cam', 'gate'], ['beggar', 'sit-ground', { look: 0.7 }]],
      // 왕의 마음도 여호와의 손안에 — 궁을 올려다보며
      'p1.0': [['@cam', 'wide'], ['father', 'point', { look: 3.0 }], ['son', 'look-up', { look: 3.0 }]],
      'p1.1': [['@cam', 'pair'], ['father', 'speak', { look: 2.6, to: 'son' }], ['son', 'listen', { look: -2.0 }]],
      'p1.2': [['father', 'point', { look: -2.6 }], ['son', 'idle', { look: -2.7 }]],
      // 아굴의 기도
      'p2.0': [['father', 'pray', { look: 2.8 }], ['son', 'pray', { look: 3.0 }]],
      'p2.3': [['@cam', 'give'], ['father', 'speak', { look: 2.4, to: 'son' }], ['son', 'idle', { item: 'bread', x: -1.5, z: 0.32, look: -2.6 }], ['son', 'kneel', { delay: 2600 }]],
      // 너그러운 사람은 복을 받는다 — 가난한 사람이 일어나 축복한다
      'p2.4': [['beggar', 'bless', { look: 0.5, item: 'bread' }], ['son', 'idle', { item: null, look: -2.6, delay: 600 }], ['father', 'idle', { x: -0.95, z: 1.15, look: -2.5 }]],
      end: [['@cam', 'give'], ['beggar', 'bless', { look: 0.5, item: 'bread' }], ['son', 'idle', { x: -1.5, z: 0.32, look: -2.6, item: null }], ['father', 'idle', { x: -0.95, z: 1.15, look: -2.5 }],
        ['noble', 'idle', { show: 0 }], ['lady', 'idle', { show: 0 }], ['porter', 'idle', { show: 0 }]],
    },
  },
};

// intro 앞에 처음 자리로 되돌리는 명령을 붙인다 (stage/moses.js와 같은 방식 — 다시 들을 때도 대본의 처음 자리에서)
Object.values(PROVERBS).forEach(s => {
  const reset = Object.entries(s.cast).map(([n, [, x, z, look, o = {}]]) => [n, o.pose || 'idle', { show: 1, x, z, look, item: null, y: o.y || 0 }]);
  s.beats.intro = [...reset, ...(s.beats.intro || s.beats.enter)];
});

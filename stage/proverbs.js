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
};

// intro 앞에 처음 자리로 되돌리는 명령을 붙인다 (stage/moses.js와 같은 방식 — 다시 들을 때도 대본의 처음 자리에서)
Object.values(PROVERBS).forEach(s => {
  const reset = Object.entries(s.cast).map(([n, [, x, z, look, o = {}]]) => [n, o.pose || 'idle', { show: 1, x, z, look, item: null, y: o.y || 0 }]);
  s.beats.intro = [...reset, ...(s.beats.intro || s.beats.enter)];
});

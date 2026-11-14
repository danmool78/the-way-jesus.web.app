// 장면마다 그분 곁에 함께 서는 사람 (예수 여정 — 사용자 2026-11: 사람 위주로).
// 이름으로 고르면 틀린다('마리아'는 베다니의 마리아이기도, '시몬'은 바리새인 시몬이기도 하다) — 그래서 장면마다 손으로 정했다.
// 모델 이름은 assets/models.json의 것. 아직 없는 모델(베드로 등)은 받을 수 없으면 건너뛴다
export const CAST = {
  jesus: {
    e01: ['mary'], e02: ['mary', 'joseph'], e03: ['mary', 'joseph'], e04: ['mary', 'joseph'], e05: ['mary', 'joseph'], e06: ['mary', 'joseph'], e07: ['mary', 'joseph'],
    e08: ['baptist'],
    e11: ['mary', 'john', 'andrew', 'peter'], e12: ['john', 'peter', 'andrew'], // 가나에는 어머니도 계셨고 제자들도 청함을 받았다(요 2:1–2), 성전에서 제자들이 기억했다(요 2:17)
    e10: ['andrew', 'john', 'peter'],
    e13: ['nicodemus'], e14: ['samaritan'], e15: ['pilgrim-man:#4a3a66'], // 왕의 신하(요 4:46)
    e16: ['pilgrim-man:#7a6248', 'pilgrim-woman:#5b6e7a', 'pilgrim-man:#5d5640'], // 고향 회당의 사람들
    e17: ['peter', 'andrew', 'james', 'john'], e18: ['peter', 'andrew'], e20: ['pilgrim-man:#4b3f6e', 'peter', 'john'], // 세리 마태
    e21: ['pilgrim-man:#8a7d66:lie'], // 서른여덟 해 된 병자, 못 가에 누워 (요 5:5–6 — 제자 없이)
    e22: ['peter', 'john', 'andrew', 'james'],
    e24: ['centurion', 'peter'], e25: ['pilgrim-woman:#3a3434', 'peter', 'john'], // 나인성 과부(검은 상복)
    e26: ['pharisee', 'pilgrim-woman:#7b4a3a', 'peter'], e29: ['pilgrim-man:#4d453c', 'peter', 'john'], // 향유를 부은 여인, 무덤 사이의 사람
    e30: ['peter', 'james', 'john'], e31: ['andrew', 'peter'], e32: ['peter', 'john'],
    e34: ['pilgrim-woman:#6b2f4a', 'peter', 'andrew'], e35: ['pilgrim-man:#5f6f4a', 'peter', 'james'], // 수로보니게 여인, 귀먹고 말 더듬는 사람
    e36: ['peter', 'john'], e37: ['moses', 'elijah', 'peter', 'james', 'john'], // 변화산: 모세와 엘리야가 그분 양옆에(마 17:3), 세 제자
    e39: ['pharisee', 'john'], e40: ['pilgrim-man:#7d7462', 'john', 'peter'], // 날 때부터 눈먼 사람
    e43: ['pharisee', 'pilgrim-man:#4b3f6e', 'peter'], // 세리와 죄인들, 수군거리는 바리새인(눅 15:1–2)
    e45: ['pilgrim-man:#6a2a52', 'peter', 'john'], // 부자 청년(자주 옷)
    e41: ['martha', 'mary-bethany'], e44: ['martha', 'mary-bethany', 'lazarus'],
    e46: ['zacchaeus', 'pilgrim-man:#7d7462'], // 삭개오와 눈먼 바디매오
    e47: ['mary-bethany', 'lazarus', 'martha', 'judas'], e48: ['peter', 'john', 'pilgrim-woman:#5b6e7a', 'pilgrim-man:#7a6248'], // 종려가지를 든 무리
    e50: ['pharisee', 'peter'],
    e51: ['peter', 'john', 'andrew', 'james'], e52: ['peter', 'john', 'judas'], e53: ['peter', 'james', 'john', 'judas'],
    e54: ['pilate', 'caiaphas', 'peter'],
    e55: ['mary', 'magdalene', 'john', 'centurion'], e56: ['magdalene'],
    e57: ['pilgrim-man:#6b5a3e', 'pilgrim-man:#4e5b6b'], // 엠마오로 가던 글로바와 다른 제자 — 열두 제자가 아니다(눅 24:13, 18)
    e58: ['thomas', 'peter', 'john'],
    e59: ['peter', 'john', 'james', 'thomas'], e61: ['john', 'andrew', 'james'],
  },
};
// 모세·다윗·열왕기 여정 (이름으로 세면 '요나단' 안의 '나단'까지 걸려 손으로 정했다)
Object.assign(CAST, {
  moses: {
    m01: ['pharaoh', 'miriam'], m03: ['jethro', 'zipporah'], m05: ['aaron', 'pharaoh'], m06: ['aaron', 'pharaoh'], m07: ['aaron'], m09: ['aaron'], m10: ['aaron', 'miriam'],
    m12: ['aaron'], m14: ['aaron', 'joshua'], m15: ['jethro', 'zipporah', 'aaron'], m18: ['aaron', 'joshua'], m19: ['aaron'], m21: ['aaron'],
    m23: ['joshua'], m24: ['aaron'], m25: ['aaron'], m26: ['aaron'], m31: ['joshua'], m32: ['joshua'], m33: ['rahab'], m35: ['rahab'], m39: ['samuel'],
  },
  david: {
    d02: ['samuel', 'pilgrim-man:#6b5a3e', 'pilgrim-man:#4e5b6b'], d03: ['saul'], d04: ['saul', 'goliath'], d05: ['goliath'], d06: ['jonathan'], d07: ['saul', 'michal'], d08: ['michal'], d09: ['samuel'],
    d10: ['jonathan'], d15: ['jonathan'], d16: ['saul'], d18: ['saul', 'joab'], d21: ['joab'], d24: ['michal'], d25: ['nathan'],
    d27: ['joab'], d29: ['nathan'], d30: ['absalom'], d32: ['joab'], d33: ['joab'], d34: ['joab'], d35: ['joab'],
    d36: ['joab'], d37: ['nathan', 'solomon'], d38: ['solomon'], d39: ['solomon'],
  },
  kings: {
    k01: ['solomon'], k02: ['solomon'], k03: ['solomon'], k04: ['solomon'], k05: ['solomon'],
    k06: ['jeroboam'], k07: ['rehoboam', 'jeroboam'], k08: ['jeroboam'], k09: ['jeroboam'], k10: ['pilgrim-woman:#5d5640'], k11: ['rehoboam'],
    k12: ['ahab'], k15: ['ahab'], k16: ['ahab'], k19: ['elisha'], k20: ['ahab', 'jezebel'], k21: ['ahab'], k22: ['elisha'],
    k32: ['hezekiah'], k33: ['hezekiah'], k34: ['hezekiah'], k35: ['hezekiah'], k36: ['hezekiah'], k37: ['hezekiah'], k38: ['josiah'], k39: ['josiah'],
  },
});
// 구약 여정의 엑스트라 (사용자 2026-11): 모델이 없는 사람은 순례자 모델의 옷 색만 바꿔 세운다 — 정해 둔 사람 뒤에 덧붙는다.
// 이름:색:bearer는 앞사람 바로 앞에 서고, :lie는 눕는다. 밧세바(d28)처럼 그리지 않을 장면은 비운다
const OT_EXTRA = {
  moses: {
    m01: ['pilgrim-man:#7a6a52', 'pilgrim-man:#5d5640'], // 벽돌 굽는 히브리 종들
    m02: ['pilgrim-woman:#c9a24a'], // 바로의 딸(출 2:5)
    m07: ['pilgrim-man:#6b5a3e', 'pilgrim-woman:#7a5a3a'], // 어린양을 잡는 집
    m09: ['pilgrim-man:#6b5a3e', 'pilgrim-woman:#5b6e7a'], m10: ['pilgrim-woman:#5b6e7a', 'pilgrim-woman:#7a5a3a'], // 소고 치며 춤추는 여인들(출 15:20)
    m11: ['pilgrim-man:#7a6248', 'pilgrim-woman:#6f5a7a'], m12: ['pilgrim-woman:#7a5a3a', 'pilgrim-man:#5d5640'], m13: ['aaron', 'pilgrim-man:#7a6248'],
    m14: ['pilgrim-man:#6b2f2f'], // 모세의 손을 붙든 훌(출 17:12)
    m19: ['pilgrim-man:#7a6248', 'pilgrim-woman:#6f5a7a'], m22: ['pilgrim-man:#5d5640'],
    m23: ['pilgrim-man:#4e5b6b'], // 갈렙(민 14:6)
    m27: ['pilgrim-man:#7a6248:lie', 'pilgrim-woman:#5b6e7a'], // 뱀에 물려 쓰러진 사람
    m29: ['pilgrim-man:#4a3a66'], // 발람
    m30: ['pilgrim-man:#7a6248', 'pilgrim-woman:#5b6e7a'], m37: ['pilgrim-man:#6b5a3e', 'pilgrim-woman:#6f5a7a'],
    m40: ['pilgrim-man:#7a6248', 'pilgrim-woman:#5b6e7a', 'pilgrim-man:#4e5b6b'],
  },
  david: {
    d01: ['shepherd'],
    d04: ['pilgrim-man:#6b3a24:bearer'], d05: ['pilgrim-man:#6b3a24:bearer'], // 골리앗 앞에 방패 든 자(삼상 17:7, 41)
    d07: ['pilgrim-woman:#5b6e7a', 'pilgrim-woman:#6b2f4a'], // 노래하며 맞은 여인들(삼상 18:6–7)
    d11: ['pilgrim-man:#e2d8c0'], // 제사장 아히멜렉(세마포 에봇)
    d12: ['pilgrim-man:#6b2f4a'], // 가드 왕 아기스
    d13: ['pilgrim-man:#5e2f22', 'pilgrim-man:#5d5640', 'pilgrim-man:#4d453c'], d14: ['pilgrim-man:#5e2f22', 'pilgrim-man:#4d453c'], // 다윗과 함께한 사람들
    d17: ['pilgrim-woman:#7a2e4a'], // 아비가일
    d19: ['pilgrim-man:#5e2f22', 'pilgrim-man:#4d453c'], d22: ['joab'],
    d24: ['pilgrim-man:#7a6248', 'pilgrim-woman:#5b6e7a'], d26: ['pilgrim-man:#4e5b6b'], // 므비보셋
    d31: ['pilgrim-man:#5d5640', 'pilgrim-woman:#6f5a7a'], d32: ['pilgrim-man:#6b3a24'], // 돌 던지는 시므이
    d36: ['pilgrim-man:#7a6248'], // 아라우나
  },
  kings: {
    k02: ['pilgrim-woman:#5b6e7a', 'pilgrim-woman:#6b2f4a'], // 두 어머니
    k04: ['pilgrim-woman:#c9a24a'], // 스바 여왕
    k14: ['pilgrim-woman:#3a3434'], // 사르밧 과부
    k15: ['pilgrim-man:#8a6a2a', 'pilgrim-man:#7e6026'], // 바알 선지자들
    k23: ['pilgrim-woman:#6b2f4a'], // 수넴 여인
    k24: ['pilgrim-man:#4a3a66'], // 나아만
    k25: ['pilgrim-man:#7a6248', 'pilgrim-man:#5d5640'], // 선지자의 제자들
    k26: ['pilgrim-man:#7d7462'], // 엘리사의 사환
    k27: ['pilgrim-man:#8a7d66', 'pilgrim-man:#7d7462'], // 성문 밖 나병 환자들
    k29: ['pilgrim-man:#e2d8c0'], // 제사장 여호야다
    k33: ['pilgrim-man:#5e2f22'], // 앗수르의 랍사게
    k41: ['pilgrim-man:#5d5640', 'pilgrim-woman:#6f5a7a', 'pilgrim-woman:#5b6e7a'], // 바벨론 강가의 포로들
  },
};
for (const [j, m] of Object.entries(OT_EXTRA)) for (const [id, l] of Object.entries(m)) CAST[j][id] = [...new Set([...(CAST[j][id] || []), ...l])];
// 앞서 걷는 그분이 장면에 따라 바뀐다: [이 장면부터, 모델, 화면 이름] (사용자 2026-11 — 소년·청년·왕 다윗을 나눈다)
// 모세가 죽은 뒤로는 여호수아, 열왕기는 시대마다 선지자(솔로몬 때는 나단 모델로 선지자 자리, 나라가 갈라질 때는 아히야)
export const LEADS = {
  moses: [['m01', 'moses', '모세'], ['m32', 'joshua', '여호수아']],
  david: [['d01', 'david', '다윗'], ['d06', 'david-warrior', '다윗'], ['d21', 'david-king', '다윗 왕']],
  kings: [['k01', 'nathan', '선지자'], ['k06', 'ahijah', '아히야'], ['k12', 'elijah', '엘리야'], ['k22', 'elisha', '엘리사'], ['k32', 'isaiah', '이사야']],
};
// 제자를 부르신 뒤(e17부터)에는 정해 둔 사람이 없는 장면에도 제자 둘이 따른다
export const FOLLOW = { jesus: { from: 'e17', pool: ['john', 'andrew', 'james', 'peter'] } };
// 키가 다른 사람 (삭개오는 키가 작았다 — 눅 19:3)
// 골리앗은 여섯 규빗 한 뼘(삼상 17:4 — 약 2.9m, 보통 사람 1.7m의 1.7배), 사울은 모든 백성보다 어깨 위만큼 더 컸다(삼상 9:2 — 30cm 남짓)
export const SIZE = { zacchaeus: 0.82, goliath: 1.7, saul: 1.18 };
// 손에 드는 것 (game-model.js makeGear): 사람마다 하나둘. 순례자·목자·모세의 지팡이, 병정의 창과 방패, 우물가 여인의 물동이
export const GEAR = {
  'pilgrim-man': ['staff'], 'pilgrim-woman': ['staff'], shepherd: ['crook'], jethro: ['crook'], david: ['crook'],
  moses: ['rod'], aaron: ['rod'], elijah: ['staff'], elisha: ['staff'], baptist: ['staff'], samuel: ['staff'],
  soldier: ['spear', 'scutum'], goliath: ['bigspear'], 'pilgrim-man:#6b3a24:bearer': ['bigshield', 'helmet'], 'pilgrim-man:#5e2f22': ['spear'], joab: ['spear', 'shield'], saul: ['spear'], joshua: ['spear'], 'david-warrior': ['shield'],
  samaritan: ['jar'], woman: ['jar'],
};
// 갈릴리 바다 위의 장면: 제자들은 배에 탄다(물 위에 서 있으면 안 된다). at = 배 가운데(목표 자리 기준), seats = 배 안 자리(배 기준, 앞에서부터),
// water = 배 밖 물 위에 서는 사람과 자리 — 물 위로 걸어간 베드로(마 14:29). 그분은 e28에서 배 안(자리 0.6이 배에 든다), e32에서는 물 위
export const BOAT = {
  jesus: {
    e28: { at: [0.25, 0], seats: [[-0.95, 0], [-0.4, 0.1]] },
    e32: { at: [-1.5, -0.7], seats: [[-0.6, 0], [0.05, 0.1], [0.6, -0.05]], water: { peter: [-0.35, -0.25] } },
  },
};
// 장면 자리에 함께 세우는 것 [소품, x, z] (목표 자리 기준) — 수가의 야곱의 우물: 여인이 그 곁에 선다(요 4:6–7)
export const SETS = { jesus: { e14: [['well', -0.1, 0.45]] } };

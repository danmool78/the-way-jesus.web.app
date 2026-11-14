// 장면마다 그분 곁에 함께 서는 사람 (예수 여정 — 사용자 2026-11: 사람 위주로).
// 이름으로 고르면 틀린다('마리아'는 베다니의 마리아이기도, '시몬'은 바리새인 시몬이기도 하다) — 그래서 장면마다 손으로 정했다.
// 모델 이름은 assets/models.json의 것. 아직 없는 모델(베드로 등)은 받을 수 없으면 건너뛴다
export const CAST = {
  jesus: {
    e01: ['mary'], e02: ['mary', 'joseph'], e03: ['mary', 'joseph'], e04: ['mary', 'joseph'], e05: ['mary', 'joseph'], e06: ['mary', 'joseph'], e07: ['mary', 'joseph'],
    e08: ['baptist'],
    e10: ['andrew', 'john', 'peter'],
    e13: ['nicodemus'], e14: ['samaritan'],
    e17: ['peter', 'andrew', 'james', 'john'], e18: ['peter', 'andrew'],
    e22: ['peter', 'john', 'andrew', 'james'],
    e24: ['centurion', 'peter'], e26: ['pharisee', 'peter'],
    e30: ['peter', 'james', 'john'], e31: ['andrew', 'peter'], e32: ['peter', 'john'],
    e36: ['peter', 'john'], e37: ['peter', 'james', 'john'],
    e39: ['pharisee', 'john'],
    e41: ['martha', 'mary-bethany'], e44: ['martha', 'mary-bethany', 'lazarus'],
    e46: ['zacchaeus'],
    e47: ['mary-bethany', 'lazarus', 'martha', 'judas'],
    e50: ['pharisee', 'peter'],
    e51: ['peter', 'john', 'andrew', 'james'], e52: ['peter', 'john', 'judas'], e53: ['peter', 'james', 'john', 'judas'],
    e54: ['pilate', 'caiaphas', 'peter'],
    e55: ['mary', 'magdalene', 'john', 'centurion'], e56: ['magdalene'],
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
    d02: ['samuel', 'shepherd'], d03: ['saul'], d04: ['saul', 'goliath'], d05: ['goliath'], d06: ['jonathan'], d07: ['saul', 'michal'], d08: ['michal'], d09: ['samuel'],
    d10: ['jonathan'], d15: ['jonathan'], d16: ['saul'], d18: ['saul', 'joab'], d21: ['joab'], d24: ['michal'], d25: ['nathan'],
    d27: ['joab'], d29: ['nathan'], d30: ['absalom'], d32: ['joab'], d33: ['joab'], d34: ['joab'], d35: ['joab'],
    d36: ['joab'], d37: ['nathan', 'solomon'], d38: ['solomon'], d39: ['solomon'],
  },
  kings: {
    k01: ['solomon'], k02: ['solomon'], k03: ['solomon'], k04: ['solomon'], k05: ['solomon'],
    k06: ['jeroboam'], k07: ['rehoboam', 'jeroboam'], k08: ['jeroboam'], k09: ['jeroboam'], k10: ['jeroboam'], k11: ['rehoboam'],
    k12: ['ahab'], k15: ['ahab'], k16: ['ahab'], k19: ['elisha'], k20: ['ahab', 'jezebel'], k21: ['ahab'], k22: ['elisha'],
    k32: ['hezekiah'], k33: ['hezekiah'], k34: ['hezekiah'], k35: ['hezekiah'], k36: ['hezekiah'], k37: ['hezekiah'], k38: ['josiah'], k39: ['josiah'],
  },
});
// 앞서 걷는 그분이 장면에 따라 바뀐다: [이 장면부터, 모델, 화면 이름] (사용자 2026-11 — 소년·청년·왕 다윗을 나눈다)
// 모세가 죽은 뒤로는 여호수아, 열왕기는 시대마다 선지자(솔로몬 때는 나단 모델로 선지자 자리, 나라가 갈라질 때는 아히야)
export const LEADS = {
  moses: [['m01', 'moses', '모세'], ['m33', 'joshua', '여호수아']],
  david: [['d01', 'david', '다윗'], ['d06', 'david-warrior', '다윗'], ['d21', 'david-king', '다윗 왕']],
  kings: [['k01', 'nathan', '선지자'], ['k06', 'ahijah', '아히야'], ['k12', 'elijah', '엘리야'], ['k22', 'elisha', '엘리사'], ['k32', 'isaiah', '이사야']],
};
// 제자를 부르신 뒤(e17부터)에는 정해 둔 사람이 없는 장면에도 제자 둘이 따른다
export const FOLLOW = { jesus: { from: 'e17', pool: ['john', 'andrew', 'james', 'peter'] } };
// 키가 다른 사람 (삭개오는 키가 작았다 — 눅 19:3)
export const SIZE = { zacchaeus: 0.82, goliath: 1.6, saul: 1.1 }; // 골리앗은 거인, 사울은 키가 머리 하나만큼 컸다(삼상 9:2)

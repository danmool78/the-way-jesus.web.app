// 장면마다 그분 곁에 함께 서는 사람 (예수 여정 — 사용자 2026-11: 사람 위주로).
// 이름으로 고르면 틀린다('마리아'는 베다니의 마리아이기도, '시몬'은 바리새인 시몬이기도 하다) — 그래서 장면마다 손으로 정했다.
// 모델 이름은 assets/models.json의 것. 아직 없는 모델(베드로 등)은 받을 수 없으면 건너뛴다
export const CAST = {
  jesus: {
    e01: ['mary'], e02: ['mary'], e03: ['mary'], e04: ['mary'], e05: ['mary'], e06: ['mary'], e07: ['mary'],
    e08: ['baptist'],
    e10: ['andrew', 'john', 'peter'],
    e17: ['peter', 'andrew', 'james', 'john'], e18: ['peter', 'andrew'],
    e22: ['peter', 'john', 'andrew', 'james'],
    e30: ['peter', 'james', 'john'], e31: ['andrew', 'peter'], e32: ['peter', 'john'],
    e36: ['peter', 'john'], e37: ['peter', 'james', 'john'],
    e46: ['zacchaeus'],
    e51: ['peter', 'john', 'andrew', 'james'], e52: ['peter', 'john'], e53: ['peter', 'james', 'john'], e54: ['peter'],
    e55: ['mary', 'magdalene', 'john'], e56: ['magdalene'],
    e59: ['peter', 'john', 'james'], e61: ['john', 'andrew', 'james'],
  },
};
// 제자를 부르신 뒤(e17부터)에는 정해 둔 사람이 없는 장면에도 제자 둘이 따른다
export const FOLLOW = { jesus: { from: 'e17', pool: ['john', 'andrew', 'james', 'peter'] } };
// 키가 다른 사람 (삭개오는 키가 작았다 — 눅 19:3)
export const SIZE = { zacchaeus: 0.82 };

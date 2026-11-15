// 고를 수 있는 순례자 (사용자 2026-11: 실존 인물도, 능력치가 다양하게).
// 따라 걷는 분(예수님·모세·여호수아·다윗·선지자들)과 악역은 넣지 않는다. 순례자 형제·자매 말고는 게임에서 그 사람을 만난
// 장면의 카드를 얻으면 풀린다(game-cast.js의 CAST). st = [걸음, 물병, 눈, 지혜, 담대함] (1–5, 3이 보통)
export const STATS = ['걸음', '물병', '눈', '지혜', '담대함'];
export const CHARS = [
  { id: 'pilgrim-man', name: '순례자 형제', st: [3, 3, 3, 3, 3], sp: '옷 색을 고를 수 있어요', free: true },
  { id: 'pilgrim-woman', name: '순례자 자매', st: [3, 3, 3, 3, 3], sp: '옷 색을 고를 수 있어요', free: true },
  { id: 'peter', name: '베드로', st: [4, 3, 2, 2, 5], sp: '갈릴리 바다에서 배를 빨리 저어요 (어부)', fx: 'boat' },
  { id: 'andrew', name: '안드레', st: [3, 3, 3, 4, 3], sp: '길 묻기 점수가 반만 깎여요 (형제를 데려온 사람)', fx: 'ask' },
  { id: 'john', name: '요한', st: [3, 3, 5, 4, 3], sp: '그분과 보물을 더 멀리서 알아봐요' },
  { id: 'thomas', name: '도마', st: [3, 3, 3, 5, 2], sp: '헤맬 때 바른 길 화살표가 더 일찍 떠요' },
  { id: 'magdalene', name: '막달라 마리아', st: [5, 3, 3, 3, 3], sp: '걸음이 빨라요 (무덤으로 달려간 아침)' },
  { id: 'martha', name: '마르다', st: [3, 5, 2, 3, 3], sp: '물병을 다섯 개 들어요 (손님을 맞는 집)' },
  { id: 'mary-bethany', name: '베다니의 마리아', st: [2, 3, 3, 5, 4], sp: '헤맬 때 바른 길 화살표가 더 일찍 떠요' },
  { id: 'samaritan', name: '사마리아 여인', st: [3, 4, 3, 3, 3], sp: '물동이를 이고 물병을 넷 들어요' },
  { id: 'zacchaeus', name: '삭개오', st: [2, 3, 5, 3, 2], sp: '키는 작아도 보물을 멀리서 찾아요 (돌무화과나무 위)' },
  { id: 'nicodemus', name: '니고데모', st: [2, 3, 3, 5, 3], sp: '헤맬 때 바른 길 화살표가 더 일찍 떠요' },
  { id: 'baptist', name: '세례 요한', st: [4, 4, 3, 3, 4], sp: '광야 사람 — 모래바람에도 덜 느려져요', fx: 'wild' },
  { id: 'lazarus', name: '나사로', st: [3, 3, 3, 3, 4], sp: '다시 살아난 사람 — 물병이 처음 바닥나면 한 병이 다시 차요', fx: 'revive' },
  { id: 'rahab', name: '라합', st: [3, 3, 3, 3, 5], sp: '병사에게 붙잡혀도 금세 풀려나요' },
  { id: 'jonathan', name: '요나단', st: [4, 3, 3, 3, 5], sp: '걸음이 빠르고 병사 앞에서 담대해요' },
  { id: 'miriam', name: '미리암', st: [3, 4, 3, 4, 3], sp: '물가의 노래 — 물병을 넷 들어요' },
  { id: 'jethro', name: '이드로', st: [3, 4, 3, 5, 3], sp: '광야의 길잡이 — 모래바람에도 덜 느려져요', fx: 'wild' },
  { id: 'samuel', name: '사무엘', st: [2, 3, 4, 5, 4], sp: '그분과 보물을 멀리서 알아보고 길을 잘 찾아요' },
  { id: 'zipporah', name: '십보라', st: [4, 4, 3, 3, 3], sp: '광야를 오가던 미디안의 딸 — 걸음이 빨라요' },
];
// 능력치 → 게임 값 (3이 지금 그대로)
const pick = (s, a) => a[Math.max(1, Math.min(5, s)) - 1];
export const effects = c => {
  const [walk, water, eye, wis, brave] = c?.st || [3, 3, 3, 3, 3];
  return {
    speed: pick(walk, [0.88, 0.94, 1, 1.07, 1.14]), water: pick(water, [3, 3, 3, 4, 5]), eye: pick(eye, [0.85, 0.92, 1, 1.15, 1.3]),
    stuck: pick(wis, [16, 14, 12, 10, 8]), hintCool: pick(wis, [28, 24, 20, 16, 12]), check: pick(brave, [3.6, 3.2, 2.8, 2.0, 1.4]), fx: c?.fx || '',
  };
};
// 풀렸나: 그 사람이 곁에 선 장면의 카드를 하나라도 얻었으면 (여정마다 theway-game-cards-<여정>)
export function unlockedBy(c, CAST, cardsOf) {
  if (c.free) return { ok: true };
  let hint = null;
  for (const [j, m] of Object.entries(CAST)) for (const [sc, names] of Object.entries(m)) {
    if (!names.some(n => n.split(':')[0] === c.id)) continue;
    if (cardsOf(j)[sc]) return { ok: true };
    hint ??= { j, sc };
  }
  return { ok: false, hint };
}

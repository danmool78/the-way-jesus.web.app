// 고를 수 있는 순례자 (사용자 2026-11: 실존 인물도, 능력이 저마다 다르게).
// 따라 걷는 분(예수님·모세·여호수아·다윗·선지자들)과 악역은 넣지 않는다. 순례자 형제·자매 말고는 게임에서 그 사람을 만난
// 장면의 카드를 얻으면 풀린다(game-cast.js의 CAST).
// 능력치 다섯 줄을 조금씩 다르게 주었더니 누구를 골라도 차이가 느껴지지 않아, 사람마다 뚜렷한 장점 하나(st)에
// 그 사람다운 덤(fx·sp)을 준다 (사용자 2026-11). 순례자 형제·자매는 장점 없이 고르게.
import { t as tr } from './game-i18n.js';
export const STRENGTHS = {
  way: { name: tr('방향감각'), icon: '🧭', desc: tr('헤매면 바른 길 화살표가 금세 뜨고, 그분의 발자국이 더 멀리까지 보여요') },
  speed: { name: tr('속도'), icon: '👣', desc: tr('걸음이 훨씬 빨라요') },
  wis: { name: tr('지혜'), icon: '📜', desc: tr('말씀 고르기와 물병 퀴즈에서 틀린 보기 하나를 지워 줘요') },
  water: { name: tr('체력'), icon: '💧', desc: tr('물병을 다섯 개 들어요') },
};
export const CHARS = [
  { id: 'pilgrim-man', name: tr('순례자 형제'), sp: tr('고르게 걷는 사람 — 옷 색을 고를 수 있어요'), free: true },
  { id: 'pilgrim-woman', name: tr('순례자 자매'), sp: tr('고르게 걷는 사람 — 옷 색을 고를 수 있어요'), free: true },
  { id: 'peter', name: tr('베드로'), st: 'speed', sp: tr('어부 — 갈릴리 바다에서 배를 빨리 저어요 (요 21:7, 바다로 뛰어든 사람)'), fx: 'boat' },
  { id: 'andrew', name: tr('안드레'), st: 'way', sp: tr('형제를 데려온 사람 — 길 묻기 점수가 반만 깎여요'), fx: 'ask' },
  { id: 'john', name: tr('요한'), st: 'way', sp: tr('먼저 무덤에 닿은 제자 (요 20:4)') },
  { id: 'thomas', name: tr('도마'), st: 'wis', sp: tr('보고 만져 보고야 믿은 사람 (요 20:28)') },
  { id: 'magdalene', name: tr('막달라 마리아'), st: 'speed', sp: tr('무덤으로 달려간 아침 (요 20:2)') },
  { id: 'martha', name: tr('마르다'), st: 'water', sp: tr('손님을 맞는 집 (눅 10:38)') },
  { id: 'mary-bethany', name: tr('베다니의 마리아'), st: 'wis', sp: tr('발치에 앉아 말씀을 들은 사람 (눅 10:39)') },
  { id: 'samaritan', name: tr('사마리아 여인'), st: 'way', sp: tr('온 동네에 길을 알린 사람 (요 4:28) — 물동이를 이고 걸어요') },
  { id: 'zacchaeus', name: tr('삭개오'), st: 'speed', sp: tr('급히 내려온 사람 (눅 19:6) — 키는 작아도 보물을 멀리서 찾아요'), fx: 'treasure' },
  { id: 'nicodemus', name: tr('니고데모'), st: 'wis', sp: tr('밤에 찾아와 물은 선생 (요 3:1)') },
  { id: 'baptist', name: tr('세례 요한'), st: 'water', sp: tr('광야 사람 — 모래바람에도 덜 느려져요'), fx: 'wild' },
  { id: 'lazarus', name: tr('나사로'), st: 'water', sp: tr('다시 살아난 사람 — 물병이 처음 바닥나면 한 병이 다시 차요'), fx: 'revive' },
  { id: 'rahab', name: tr('라합'), st: 'way', sp: tr('정탐꾼에게 산길을 알려 준 사람 (수 2:16) — 병사에게 붙잡혀도 금세 풀려나요'), fx: 'brave' },
  { id: 'jonathan', name: tr('요나단'), st: 'speed', sp: tr('바위를 기어오른 용사 (삼상 14:13) — 병사 앞에서도 담대해요'), fx: 'brave' },
  { id: 'miriam', name: tr('미리암'), st: 'water', sp: tr('물가에서 노래한 사람 (출 15:20)') },
  { id: 'jethro', name: tr('이드로'), st: 'way', sp: tr('광야의 길잡이 — 모래바람에도 덜 느려져요'), fx: 'wild' },
  { id: 'samuel', name: tr('사무엘'), st: 'wis', sp: tr('"말씀하옵소서, 듣겠나이다" (삼상 3:10)') },
  { id: 'zipporah', name: tr('십보라'), st: 'speed', sp: tr('광야를 오가던 미디안의 딸 (출 2:16)') },
];
// 장점 → 게임 값 (장점이 없으면 지금 그대로)
export const effects = c => {
  const s = c?.st, fx = c?.fx || '';
  return {
    st: s || '', fx,
    speed: s === 'speed' ? 1.2 : 1, water: s === 'water' ? 5 : 3,
    stuck: s === 'way' ? 6 : 12, hintCool: s === 'way' ? 8 : 20, trail: s === 'way' ? 1.6 : 1, // 헤맴 판단(초)·화살표 쉬는 틈(초)·발자국 보이는 둘레(배)
    cut: s === 'wis', eye: fx === 'treasure' ? 1.4 : 1, check: fx === 'brave' ? 1.2 : 2.8,
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

// 순례 게임의 다국어 (사용자 2026-11): 화면 글씨는 한국어 문장을 그대로 열쇠로 t('…')에 넣고,
// 언어별 사전 assets/game-i18n/<언어>.json({한국어: 옮긴 말})에서 찾는다 — 없으면 한국어 그대로.
// 끼워 넣는 값은 {0}·{1}…, 한국어 조사는 {0:은/는}처럼 받침에 따라 고른다(다른 언어에서는 값만).
// 언어 고르기는 앱(app.js)과 같다: ?lang= → 앱에서 고른 언어(theway-lang) → 브라우저 언어 → 영어.
// 장면 글·말씀은 data.<언어>.json, 만남 이야기는 assets/game-talk/<여정>.<언어>.json (game.js)
export const LANGS = ['ko', 'en', 'es', 'pt', 'fr', 'zh', 'id', 'ja'];
const pick = l => { l = String(l || '').toLowerCase().slice(0, 2); return LANGS.includes(l) ? l : null; };
const web = typeof location !== 'undefined';
let saved = null; try { saved = web && localStorage.getItem('theway-lang'); } catch { /* 사생활 보호 모드 */ }
export const LANG = !web ? 'ko' : pick(new URLSearchParams(location.search).get('lang')) || pick(saved) || (navigator.languages || [navigator.language]).map(pick).find(Boolean) || 'en';
let DICT = {};
if (LANG !== 'ko') { try { DICT = await (await fetch(`assets/game-i18n/${LANG}.json`)).json(); } catch { /* 사전이 없으면 한국어로 */ } }
// 받침이 있으면 앞의 것(은·이·을·과·아·으로), 없으면 뒤의 것
const batchim = w => { const c = String(w).charCodeAt(String(w).length - 1) - 0xac00; return c >= 0 && c < 11172 && c % 28 > 0; };
export function t(ko, ...a) {
  const s = LANG === 'ko' ? ko : DICT[ko] ?? ko;
  return s.replace(/\{(\d)(?::([^}/]+)\/([^}]+))?\}/g, (m, i, x, y) => { const v = String(a[i] ?? ''); return x && LANG === 'ko' ? v + (batchim(v) ? x : y) : v; });
}
// game.html의 data-i18n 글씨(속 HTML 그대로가 열쇠)와 data-i18n-ph(입력 칸 안내)를 바꾼다
export function applyT(root = document) {
  if (LANG === 'ko') return;
  root.querySelectorAll('[data-i18n]').forEach(el => { el.innerHTML = t(el.innerHTML.trim()); });
  root.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.placeholder); });
}

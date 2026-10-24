'use strict';
/* 그 길 — 예수의 발자취. 정적 웹앱: data.json + SVG 지도 + Web Speech 낭독 */

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
let GOSPELS = [['mt', '마태', '마'], ['mk', '마가', '막'], ['lk', '누가', '눅'], ['jn', '요한', '요']];

let DATA, EVENTS, PLACES, PERIODS, idx = 0;

/* ---------- 언어 ---------- */
// 고르는 순서: 주소의 ?lang= → 지난번 고른 언어 → 브라우저 언어 → 그 밖의 언어는 영어.
// LANGS는 번역이 다 된 언어만 (data.<언어>.json이 있는 것) — 새 언어를 올릴 때 여기에 더한다
const LANGS = ['ko', 'en', 'es', 'pt', 'fr', 'zh', 'id', 'ja'];
const LANG = (() => {
  const ok = l => l && LANGS.includes(l) ? l : null, pick = l => ok(String(l || '').toLowerCase().split('-')[0]);
  let saved = null; try { saved = localStorage.getItem('theway-lang'); } catch { /* 사생활 보호 모드 */ }
  return pick(new URLSearchParams(location.search).get('lang')) || pick(saved) || (navigator.languages || [navigator.language]).map(pick).find(Boolean) || 'en';
})();
// 화면 글씨: data의 ui에서 꺼내고 {이름} 자리에 값을 넣는다. 지도 글씨는 한국어 이름으로 찾는다
const t = (k, v = {}) => String(DATA?.ui?.[k] ?? k).replace(/\{(\w+)\}/g, (_, x) => v[x] ?? '');
const tm = s => DATA?.ui?.map?.[s] || s;
function applyStatic() {
  const u = DATA.ui, h = document.documentElement;
  h.lang = LANG; h.dir = u.dir || 'ltr';
  // 중국어·일본어는 한글 글꼴에 없는 한자·가나가 있어 그 언어의 글꼴을 따로 받는다
  const CJK = { zh: ['Noto Serif SC', 'Noto Sans SC'], ja: ['Noto Serif JP', 'Noto Sans JP'] }[LANG];
  if (CJK) {
    const l = document.createElement('link'); l.rel = 'stylesheet';
    l.href = `https://fonts.googleapis.com/css2?family=${CJK[0].replace(/ /g, '+')}:wght@400;700&family=${CJK[1].replace(/ /g, '+')}:wght@400;500;700&display=swap`;
    document.head.appendChild(l);
    h.style.setProperty('--serif', `'${CJK[0]}',serif`); h.style.setProperty('--sans', `'${CJK[1]}',system-ui,sans-serif`);
  }
  document.title = u.docTitle;
  $('meta[name="description"]')?.setAttribute('content', u.metaDesc);
  GOSPELS = ['mt', 'mk', 'lk', 'jn'].map(k => [k, ...u.gospels[k]]);
  // [선택자, 글씨 키, 속성(없으면 글자)]
  [['.brand', 'home', 'aria-label'], ['.brand b', 'appName'], ['.brand small', 'appTag'], ['.tabs', 'tabsLabel', 'aria-label'],
    ['[data-view="journey"]', 'tabJourney'], ['[data-view="words"]', 'tabWords'], ['[data-view="quiz"]', 'tabQuiz'],
    ['#progressPill', 'myFootsteps', 'title'], ['#gear', 'settings', 'aria-label'], ['.mapwrap', 'mapLabel', 'aria-label'], ['#map', 'mapAria', 'aria-label'],
    ['#fitAll', 'fitAll'], ['#fitAll', 'fitAllTitle', 'title'], ['#fitNow', 'fitNowTitle', 'title'],
    ['.dock', 'dockLabel', 'aria-label'], ['#track', 'trackLabel', 'aria-label'], ['#prev', 'prevScene', 'aria-label'], ['#skip', 'nextScene', 'aria-label'],
    ['#listen', 'listenScene', 'aria-label'], ['#next', 'walkNext', 'aria-label'], ['#next .lbl', 'walkNext'], ['.switch', 'autoStart', 'title'],
    ['#rate', 'speedLabel', 'aria-label'], ['#music', 'music', 'aria-label'], ['#music', 'music', 'title'],
    ['#words h2', 'wordsHead'], ['#words .list-head p', 'wordsIntro'], ['#wordSearch', 'wordsSearch', 'placeholder'], ['#wordSearch', 'wordsSearchLabel', 'aria-label'],
    ['#harmony h2', 'harmonyHead'], ['#harmony .list-head p', 'harmonyIntro'], ['#quiz h2', 'quizHead'], ['#quiz .list-head p', 'quizIntro'],
    ['#closeViewer', 'close', 'aria-label'], ['#closeStamps', 'close', 'aria-label'], ['#closeQuiz', 'close', 'aria-label'], ['#stamps h2', 'myFootsteps'], ['#stamps .fine', 'stampsNote'],
    ['#resetProgress', 'resetProgress']
  ].forEach(([sel, k, attr]) => { const el = $(sel); if (!el) return; if (attr) el.setAttribute(attr, t(k)); else el.textContent = t(k); });
  $$('[data-i]').forEach(el => { el.textContent = t(el.dataset.i); }); // 글씨 키를 단 요소들
  document.body.style.setProperty('--walking', `'👣 ${t('walking')} · '`);
  // 언어 고르기
  const sel = $('#langPick');
  if (sel) {
    sel.innerHTML = u.langs.map(l => `<option value="${l}" ${l === LANG ? 'selected' : ''}>${esc(LANG_NAMES[l] || l)}</option>`).join('');
    sel.setAttribute('aria-label', t('language'));
    sel.onchange = () => { try { localStorage.setItem('theway-lang', sel.value); } catch { /* 무시 */ } const q = new URLSearchParams(location.search); q.set('lang', sel.value); location.search = q.toString(); };
  }
}
// 언어 이름은 그 언어로 적는다 (고르는 사람이 자기 언어를 알아보게)
const LANG_NAMES = { ko: '한국어', en: 'English', es: 'Español', pt: 'Português', fr: 'Français', zh: '中文', id: 'Bahasa Indonesia', ja: '日本語' };

/* ---------- 저장된 진행 상황 ---------- */
const store = {
  key: 'theway-progress-v1',
  load() { try { return JSON.parse(localStorage.getItem(this.key)) || {}; } catch { return {}; } },
  save() { try { localStorage.setItem(this.key, JSON.stringify(state)); } catch { /* 사생활 보호 모드 등 */ } }
};
const state = Object.assign({ visited: [], quiz: {}, last: null }, store.load());
const visited = new Set(state.visited);
function markVisited(id) {
  if (!visited.has(id)) { visited.add(id); state.visited = [...visited]; }
  state.last = id; store.save(); updateProgress();
}

/* ---------- 지도 투영 ---------- */
const BOUNDS = { lat0: 30.95, lat1: 33.62, lng0: 34.15, lng1: 36.05 };
const K = 1000, COS = Math.cos(32.3 * Math.PI / 180);
const W = (BOUNDS.lng1 - BOUNDS.lng0) * COS * K, H = (BOUNDS.lat1 - BOUNDS.lat0) * K;
const px = ([lat, lng]) => [(lng - BOUNDS.lng0) * COS * K, (BOUNDS.lat1 - lat) * K];
const P = p => px([p.lat, p.lng]);

// 매끄러운 곡선 (Catmull-Rom → Bézier)
function smooth(points, closed = false) {
  const p = points.map(px), n = p.length;
  const at = i => closed ? p[(i + n) % n] : p[Math.max(0, Math.min(n - 1, i))];
  let d = `M${p[0][0].toFixed(1)},${p[0][1].toFixed(1)}`;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return closed ? d + 'Z' : d;
}

const GEO = {
  coast: [[33.62,35.40],[33.56,35.37],[33.45,35.29],[33.37,35.25],[33.27,35.19],[33.17,35.15],[33.09,35.10],[32.99,35.08],[32.92,35.07],[32.88,35.08],[32.84,35.06],[32.82,35.02],[32.83,34.96],[32.75,34.95],[32.69,34.93],[32.60,34.91],[32.50,34.89],[32.40,34.87],[32.30,34.84],[32.17,34.80],[32.05,34.75],[31.95,34.70],[31.80,34.63],[31.67,34.55],[31.58,34.49],[31.50,34.42],[31.40,34.35],[31.32,34.26],[31.25,34.18],[31.22,34.15]],
  galilee: [[32.885,35.555],[32.895,35.585],[32.888,35.625],[32.86,35.645],[32.82,35.652],[32.77,35.643],[32.73,35.615],[32.705,35.585],[32.72,35.565],[32.76,35.545],[32.80,35.525],[32.825,35.515],[32.85,35.52],[32.873,35.540]],
  dead: [[31.775,35.53],[31.77,35.58],[31.72,35.585],[31.60,35.575],[31.50,35.57],[31.40,35.555],[31.30,35.53],[31.20,35.51],[31.10,35.48],[31.05,35.44],[31.10,35.40],[31.20,35.395],[31.35,35.40],[31.50,35.44],[31.62,35.46],[31.72,35.47],[31.76,35.49]],
  hula: [[33.10,35.605],[33.09,35.625],[33.06,35.628],[33.045,35.612],[33.06,35.595],[33.085,35.595]],
  jordanN: [[33.25,35.63],[33.17,35.62],[33.10,35.61],[33.03,35.615],[32.97,35.62],[32.92,35.615],[32.893,35.60]],
  jordanS: [[32.708,35.572],[32.65,35.578],[32.58,35.566],[32.50,35.562],[32.42,35.552],[32.34,35.552],[32.26,35.536],[32.17,35.532],[32.08,35.538],[31.99,35.536],[31.91,35.546],[31.84,35.548],[31.775,35.556]],
  jwall: [[31.7810,35.2280],[31.7815,35.2365],[31.7790,35.2368],[31.7760,35.2365],[31.7735,35.2355],[31.7712,35.2320],[31.7715,35.2283],[31.7745,35.2270],[31.7780,35.2268]],
  kidron: [[31.787,35.2392],[31.781,35.2385],[31.776,35.2378],[31.771,35.2364],[31.766,35.2360]],
  // 애굽: 나일(카이로 남쪽 골짜기 → 삼각주 꼭짓점)과 1세기의 큰 지류들. 동쪽 끝 펠루시움 지류가 시나이 바닷길과 만나는 관문
  nile: [[29.15,31.18],[29.5,31.22],[29.85,31.26],[30.06,31.23],[30.18,31.13]],
  canopic: [[30.18,31.13],[30.5,30.85],[30.8,30.55],[31.1,30.25],[31.32,30.07]],
  rosetta: [[30.18,31.13],[30.6,30.95],[30.95,30.78],[31.2,30.55],[31.46,30.37]],
  damietta: [[30.18,31.13],[30.5,31.2],[30.8,31.25],[31.05,31.42],[31.3,31.65],[31.52,31.84]],
  pelusiac: [[30.18,31.13],[30.45,31.4],[30.57,31.51],[30.75,31.75],[30.9,32.1],[31.04,32.55]],
  mareotis: [[31.12,29.75],[31.18,29.95],[31.15,30.12],[31.05,30.08],[31.03,29.85]],
  manzala: [[31.42,31.85],[31.35,32.12],[31.2,32.25],[31.1,32.05],[31.18,31.85]],
  sirbonis: [[31.17,32.75],[31.2,33.15],[31.13,33.45],[31.06,33.2],[31.08,32.85]],
  bitter: [[30.45,32.33],[30.4,32.42],[30.28,32.45],[30.32,32.36]],
  suez: [[29.97,32.53],[29.6,32.38],[29.0,32.62],[28.5,32.88],[28.0,33.3],[28.0,33.62],[28.5,33.22],[29.0,32.95],[29.6,32.72],[29.97,32.6]],
  hinnom: [[31.7765,35.2252],[31.7735,35.2258],[31.7705,35.2290],[31.7698,35.2340],[31.7690,35.2362]]
};
// 음영 기복도(assets/relief.webp)가 덮는 범위 — _src/relief.py의 EXTENT와 같게
const RELIEF = { lat0: 29.15, lat1: 34.6, lng0: 33.0, lng1: 37.4 };
// 서쪽 애굽 쪽 바탕(assets/relief-west.webp — 시나이 북부, 나일 삼각주) — _src/relief.py의 WEST와 같게
const RELIEF_WEST = { lat0: 29.15, lat1: 31.9, lng0: 29.4, lng1: 33.25 };
// 확대했을 때만 불러오는 정밀 타일(assets/relief-hi/행_열.webp) — _src/relief.py의 HI와 같게
const RELIEF_HI = { lat0: 30.2, lat1: 34.4, lng0: 33.4, lng1: 37.0, tile: 160, dir: 'relief-hi', below: 1.2 };
// 애굽 쪽 정밀 타일(assets/relief-hi-w/) — _src/relief.py의 HI_W와 같게
const RELIEF_HI_W = { lat0: 29.3, lat1: 31.7, lng0: 29.7, lng1: 33.4, tile: 160, dir: 'relief-hi-w', below: 1.2 };
// 애굽의 이름난 자리 3D 표지 그림(assets/egypt-*.webp) — stage/egypt.js의 각 틀과 같게
const LANDMARKS = [
  { id: 'giza', lat0: 29.965, lat1: 29.989, lng0: 31.11425, lng1: 31.14975, top: 9 },
  { id: 'pharos', lat0: 31.195, lat1: 31.215, lng0: 29.87962, lng1: 29.91038, top: 13 },
  { id: 'helio', lat0: 30.121, lat1: 30.137, lng0: 31.29399, lng1: 31.32001, top: 8 },
];
// 도성까지 확대했을 때 얹는 초정밀 타일(assets/relief-city/) — _src/relief.py의 CITY와 같게
const RELIEF_CITY = { lat0: 31.74, lat1: 31.81, lng0: 35.19, lng1: 35.28, tile: 20, dir: 'relief-city', below: .15 };
// 예루살렘 3D 도성 그림(assets/jerusalem.webp) — stage/jerusalem.js의 EXTENT와 같게.
// top: 그림 위쪽의 건물 솟음 여백(지도 단위, _src/tools/jerusalem.html의 TOP과 같게)
const CITY3D = { lat0: 31.7685, lat1: 31.7840, lng0: 35.2235, lng1: 35.2480, top: 1.6 };
// 비가 아니라 샘·강 덕분에 푸르렀던 곳: [위도, 경도, 반지름(지도 단위≈1/1000도)]
const OASES = [[31.855, 35.455, 22], [31.462, 35.388, 9], [32.865, 35.525, 18]]; // 여리고, 엔게디, 게네사렛 평야
const REGIONS = [
  ['갈릴리', 32.80, 35.30], ['사마리아', 32.27, 35.12], ['유대', 31.52, 35.02], ['베레아', 31.98, 35.78],
  ['데가볼리', 32.52, 35.86], ['빌립의 영지', 33.02, 35.86], ['페니키아', 33.42, 35.42], ['이두매', 31.12, 34.86],
  ['애 굽', 30.72, 30.95], ['시 나 이', 30.55, 33.55]
];
const REFCITIES = [['디베랴', 32.79, 35.535], ['가이사랴', 32.50, 34.905], ['욥바', 32.05, 34.765], ['세바스테', 32.276, 35.19], ['마케루스', 31.565, 35.63],
  ['가사', 31.50, 34.46], ['라피아', 31.28, 34.25], ['리노코루라', 31.13, 33.80], ['펠루시움', 31.04, 32.55], ['부바스티스', 30.57, 31.51],
  ['레온토폴리스', 30.29, 31.33], ['헬리오폴리스 (온)', 30.13, 31.29], ['멤피스', 29.85, 31.25], ['알렉산드리아', 31.20, 29.92]];

const svgNS = 'http://www.w3.org/2000/svg';
const map = $('#map');
let view = { x: 0, y: 0, w: W, h: H }, anim = null, fitMode = 'scene';

function buildMap() {
  // 지도 범위 밖까지 땅과 바다를 넉넉히 이어 그려, 확대·축소 때 빈 가장자리가 보이지 않게 한다
  const far = (lat, lng) => px([lat, lng]).join(',');
  // 남쪽은 시나이 북부 → 나일 삼각주 → 알렉산드리아 해안을 따라, 넓은 화면에서도 바다가 끊기지 않게 서쪽으로 넉넉히
  const sinai = [[31.13, 33.8], [31.15, 33.1], [31.26, 32.3], [31.52, 31.85], [31.47, 30.4], [31.2, 29.9], [30.9, 28.5], [30.8, 26]];
  const sea = `M${far(35.2, 36.0)} L${far(34.2, 35.65)} ` + smooth(GEO.coast).replace(/^M/, 'L') + ' ' + sinai.map(p => 'L' + far(...p)).join(' ') + ` L${far(36, 26)} Z`;
  const lbl = (txt, [x, y], cls) => `<g class="lbl ${cls}" transform="translate(${x},${y})"><text>${esc(txt)}</text></g>`;
  const [rx0, ry0] = px([RELIEF.lat1, RELIEF.lng0]), [rx1, ry1] = px([RELIEF.lat0, RELIEF.lng1]);
  const [wx0, wy0] = px([RELIEF_WEST.lat1, RELIEF_WEST.lng0]), [wx1, wy1] = px([RELIEF_WEST.lat0, RELIEF_WEST.lng1]);
  const [cx0, cy0] = px([CITY3D.lat1, CITY3D.lng0]), [cx1, cy1] = px([CITY3D.lat0, CITY3D.lng1]);
  map.setAttribute('viewBox', `0 0 ${W} ${H}`);
  map.innerHTML = `
  <defs>
    <linearGradient id="seaGrad" x1="0" x2="1"><stop offset="0" stop-color="var(--sea-deep)"/><stop offset="1" stop-color="var(--sea)"/></linearGradient>
    <radialGradient id="oasis"><stop offset="0" stop-color="var(--oasis)" stop-opacity=".75"/><stop offset=".6" stop-color="var(--oasis)" stop-opacity=".4"/><stop offset="1" stop-color="var(--oasis)" stop-opacity="0"/></radialGradient>
    <filter id="waterEdge" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur in="SourceAlpha" stdDeviation="4" result="b"/><feComposite in="SourceAlpha" in2="b" operator="arithmetic" k2="1" k3="-1" result="edge"/><feFlood flood-color="#21474f" flood-opacity=".5"/><feComposite in2="edge" operator="in"/><feComposite in2="SourceGraphic" operator="over"/></filter>
  </defs>
  <rect x="${-W * 2}" y="${-H * 2}" width="${W * 5}" height="${H * 5}" fill="var(--land)"/>
  <image href="assets/relief-west.webp" class="relief" x="${wx0}" y="${wy0}" width="${wx1 - wx0}" height="${wy1 - wy0}" preserveAspectRatio="none"/>
  <image href="assets/relief.webp" class="relief" x="${rx0}" y="${ry0}" width="${rx1 - rx0}" height="${ry1 - ry0}" preserveAspectRatio="none"/>
  <g id="reliefHi" class="relief"></g>
  <g id="reliefCity" class="relief"></g>
  ${['nile', 'canopic', 'rosetta', 'damietta', 'pelusiac'].map(k => `<path d="${smooth(GEO[k])}" class="riverbank nilebank"/>`).join('')}
  <path d="${smooth(GEO.jordanN)}" class="riverbank"/>
  <path d="${smooth(GEO.jordanS)}" class="riverbank"/>
  ${OASES.map(([a, b, r]) => `<circle cx="${px([a, b])[0]}" cy="${px([a, b])[1]}" r="${r}" fill="url(#oasis)"/>`).join('')}
  <path d="${sea}" fill="url(#seaGrad)" class="sea"/>
  <path d="${smooth(GEO.coast)}" class="coast"/>
  <path d="${smooth(GEO.galilee, true)}" class="lake" filter="url(#waterEdge)"/>
  <path d="${smooth(GEO.dead, true)}" class="lake dead" filter="url(#waterEdge)"/>
  <path d="${smooth(GEO.hula, true)}" class="lake"/>
  ${['mareotis', 'manzala', 'sirbonis', 'bitter'].map(k => `<path d="${smooth(GEO[k], true)}" class="lake"/>`).join('')}
  <path d="${smooth(GEO.suez, true)}" fill="url(#seaGrad)" class="sea"/>
  ${['nile', 'canopic', 'rosetta', 'damietta', 'pelusiac'].map(k => `<path d="${smooth(GEO[k])}" class="river nile"/>`).join('')}
  <path d="${smooth(GEO.jordanN)}" class="river"/>
  <path d="${smooth(GEO.jordanS)}" class="river"/>
  <g class="jlm-detail">
    <path d="${smooth(GEO.kidron)}" class="valley"/>
    <path d="${smooth(GEO.hinnom)}" class="valley"/>
  </g>
 ${LANDMARKS.map(L => { const [a, b] = px([L.lat1, L.lng0]), [c, d] = px([L.lat0, L.lng1]); return `<g class="lmk" data-cx="${(a + c) / 2}" data-cy="${(b + d) / 2}" data-w="${c - a}"><image class="landmark" data-src="assets/egypt-${L.id}.webp" x="${a}" y="${b - L.top}" width="${c - a}" height="${d - b + L.top}" preserveAspectRatio="none"/></g>`; }).join('')}
  <image id="city3d" class="city3d" x="${cx0}" y="${cy0 - CITY3D.top}" width="${cx1 - cx0}" height="${cy1 - cy0 + CITY3D.top}" preserveAspectRatio="none"/>
  ${lbl(tm('지 중 해'), px([32.35, 34.48]), 'sea-lbl')}
  ${lbl(tm('갈릴리 바다'), px([32.80, 35.60]), 'water-lbl')}
  ${lbl(tm('사해'), px([31.42, 35.49]), 'water-lbl')}
  ${lbl(tm('요단 강'), px([32.40, 35.585]), 'water-lbl river-lbl')}
  ${REGIONS.map(([n, a, b]) => lbl(tm(n), px([a, b]), 'region')).join('')}
  ${REFCITIES.map(([n, a, b]) => `<g class="lbl refcity" transform="translate(${px([a, b]).join(',')})"><circle r="2.2"/><text x="5" y="3">${esc(tm(n))}</text></g>`).join('')}
  ${lbl(tm('나일 강'), px([29.7, 31.33]), 'water-lbl river-lbl')}
  ${lbl(tm('수에즈 만'), px([29.55, 32.66]), 'water-lbl river-lbl')}
  <path class="offmap" fill-rule="evenodd" d="M${DRAWN.x - 1e5},${DRAWN.y - 1e5}h${DRAWN.w + 2e5}v${DRAWN.h + 2e5}h${-DRAWN.w - 2e5}Z M${DRAWN.x},${DRAWN.y}v${DRAWN.h}h${DRAWN.w}v${-DRAWN.h}Z"/>
  <g id="routes"><path id="nextHint" class="nexthint"/></g>
  <g id="markers"></g>
  <g id="walker" class="walker"><circle class="wglow" r="18"/><g class="wfig"><circle class="wbody" r="8"/><text class="wicon" y="4.5">✦</text></g></g>`;
  // 장소 마커
  const g = $('#markers', map);
  Object.entries(PLACES).forEach(([id, p]) => {
    const [x, y] = P(p);
    const m = document.createElementNS(svgNS, 'g');
    m.setAttribute('class', 'pin' + (p.jlm ? ' jlm' : ''));
    m.dataset.place = id; m.dataset.x = x; m.dataset.y = y;
    m.innerHTML = `<circle class="halo" r="15"/><circle class="dot" r="5.5"/><text x="9" y="4">${esc(p.name)}</text>`;
    m.addEventListener('click', () => { const i = EVENTS.findIndex((e, j) => e.place === id && j > idx) ; go(i >= 0 ? i : EVENTS.findIndex(e => e.place === id)); });
    g.appendChild(m);
  });
  // 경로 (연속된 서로 다른 장소 사이의 곡선)
  const r = $('#routes', map);
  EVENTS.forEach((e, i) => {
    if (!i) return;
    const a = PLACES[EVENTS[i - 1].place], b = PLACES[e.place];
    if (a === b) return;
    const [x1, y1] = P(a), [x2, y2] = P(b), dx = x2 - x1, dy = y2 - y1;
    const bend = (i % 2 ? 1 : -1) * 0.18;
    const cx = (x1 + x2) / 2 - dy * bend, cy = (y1 + y2) / 2 + dx * bend;
    const path = document.createElementNS(svgNS, 'path');
    const via = routeVia(a, b);
    // 경유지가 있는 길(애굽으로 가는 해안 길)은 그 지점들을 잇는 곡선으로
    path.setAttribute('d', via ? smooth([[a.lat, a.lng], ...via, [b.lat, b.lng]]) : `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`);
    path.setAttribute('pathLength', '1');
    path.setAttribute('class', 'route');
    path.style.setProperty('--c', PERIODS[e.p].color);
    path.dataset.i = i;
    r.appendChild(path);
  });
  new ResizeObserver(() => applyView()).observe(map);
}

// 지형 그림(relief·relief-west)이 불투명하게 그려진 범위 — 지도는 이 밖(그림 없는 맨바닥)을 보이지 않는다.
// 두 그림의 바깥 범위(29.15–34.6, 29.4–37.4)에서 가장자리의 투명하게 흐린 띠(0.16–0.32°)를 뺐다
const DRAWN = (() => { const [x0, y0] = px([34.28, 29.63]), [x1, y1] = px([29.47, 37.14]); return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }; })();
function applyView() {
  const r = map.getBoundingClientRect();
  if (!r.width) return;
  // 화면 비율에 맞춰 보이는 영역 확장
  let { x, y, w, h } = view;
  const ar = r.width / r.height;
  if (w / h > ar) { const nh = w / ar; y -= (nh - h) / 2; h = nh; } else { const nw = h * ar; x -= (nw - w) / 2; w = nw; }
  // 카드에 가리지 않고 실제로 보이는 영역(freeArea)이 그려진 범위 안에 있게 한다: 그보다 넓으면 그만큼 당겨 맞추고,
  // 가장자리 밖으로 나가면 안으로 붙인다. 카드 밑으로 들어가는 쪽은 바깥이어도 보이지 않는다 (틈은 .offmap이 바탕색으로 덮는다).
  // 맞춘 값을 view에 되돌려 써서, 끌기·전환이 보이지 않는 바깥에 '걸려' 있지 않게 한다
  const f = freeArea($('#scene')?.classList.contains('peek') ? 'peek' : 'open');
  let q = w / r.width; // 화면 1px 당 지도 단위
  const k = Math.min(1, DRAWN.w / ((f.r - f.l) * q), DRAWN.h / ((f.b - f.t) * q));
  if (k < 1) { const cx = x + (f.l + f.r) / 2 * q, cy = y + (f.t + f.b) / 2 * q; q *= k; w *= k; h *= k; x = cx - (f.l + f.r) / 2 * q; y = cy - (f.t + f.b) / 2 * q; }
  x = Math.min(DRAWN.x + DRAWN.w - f.r * q, Math.max(DRAWN.x - f.l * q, x));
  y = Math.min(DRAWN.y + DRAWN.h - f.b * q, Math.max(DRAWN.y - f.t * q, y));
  view = { x, y, w, h };
  map.setAttribute('viewBox', `${x} ${y} ${w} ${h}`);
  const u = w / r.width; // 화면 1px 당 지도 단위
  map.style.setProperty('--u', u);
  map.classList.toggle('zoom-city', u < 0.06);
  map.classList.toggle('zoom-near', u < 0.6);
  showHiRelief(x, y, w, h, u);
  // 예루살렘 도성 그림: 가까이 들어갔을 때만 받아서(약 200KB) 서서히 보인다
  const city = $('#city3d', map);
  if (u < 0.6 && !city.getAttribute('href')) { city.addEventListener('load', () => city.classList.add('ready'), { once: true }); city.setAttribute('href', 'assets/jerusalem.webp'); }
  $$('.pin, .lbl', map).forEach(el => {
    const tr = el.dataset.x ? `translate(${el.dataset.x},${el.dataset.y})` : (el.dataset.t ||= el.getAttribute('transform'));
    el.setAttribute('transform', `${tr} scale(${u})`);
  });
  const wk = $('#walker', map);
  if (wk.dataset.x) wk.setAttribute('transform', `translate(${wk.dataset.x},${wk.dataset.y}) scale(${u})`);
  // 애굽 표지 그림: 멀리서도 핀처럼 화면에서 일정한 크기(약 70px)로 보이게 키우고, 가까이서는 제 크기로.
  // 화면 안에 들어올 때 처음 받아서 서서히 보인다
  $$('.lmk', map).forEach(gm => {
    const cx = +gm.dataset.cx, cy = +gm.dataset.cy, k = Math.max(1, u * 70 / +gm.dataset.w), im = gm.firstChild;
    gm.setAttribute('transform', `translate(${cx},${cy}) scale(${k}) translate(${-cx},${-cy})`);
    const r = +gm.dataset.w * k;
    if (im.getAttribute('href') || cx + r < x || cx - r > x + w || cy + r < y || cy - r > y + h) return;
    im.addEventListener('load', () => im.classList.add('ready'), { once: true });
    im.setAttribute('href', im.dataset.src);
  });
}

// 바탕 지형은 지도 단위당 0.8픽셀이라 확대하면 뭉개진다. 화면 1px이 지도 1단위보다 작아지면
// 보이는 범위의 정밀 타일(단위당 3.2픽셀)을, 도성까지 들어가면 초정밀 타일(25.6픽셀)을 얹는다.
// 타일은 다 받은 뒤 서서히 나타나고, 한 번 만든 타일은 숨겼다 다시 쓴다
const hiTiles = new Map();
function reliefTiles(L, x, y, w, h, u, show) {
  const T = L.tile, [ox, oy] = px([L.lat1, L.lng0]), keys = [];
  if (u >= L.below) return keys;
  const cols = Math.ceil((L.lng1 - L.lng0) * COS * K / T), rows = Math.ceil((L.lat1 - L.lat0) * K / T);
  const c0 = Math.max(0, Math.floor((x - ox) / T)), c1 = Math.min(cols - 1, Math.floor((x + w - ox) / T));
  const r0 = Math.max(0, Math.floor((y - oy) / T)), r1 = Math.min(rows - 1, Math.floor((y + h - oy) / T));
  for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
    const k = `${L.dir}/${r}_${c}`; keys.push(k);
    if (hiTiles.has(k)) continue;
    const im = document.createElementNS(svgNS, 'image');
    im.setAttribute('class', 'tile');
    im.addEventListener('load', () => im.classList.add('ready'), { once: true });
    im.setAttribute('href', `assets/${k}.webp`);
    // 이웃 타일과의 실선 틈이 보이지 않게 조금 겹친다
    const lap = T / 500;
    Object.entries({ x: ox + c * T, y: oy + r * T, width: T + lap, height: T + lap }).forEach(([a, v]) => im.setAttribute(a, v));
    im.setAttribute('preserveAspectRatio', 'none');
    if (!show) im.style.display = 'none';
    $(L === RELIEF_CITY ? '#reliefCity' : '#reliefHi', map).appendChild(im); hiTiles.set(k, im);
  }
  return keys;
}
function showHiRelief(x, y, w, h, u) {
  const want = new Set([RELIEF_HI, RELIEF_HI_W, RELIEF_CITY].flatMap(L => reliefTiles(L, x, y, w, h, u, true)));
  hiTiles.forEach((im, k) => { im.style.display = want.has(k) ? '' : 'none'; });
}
// 확대가 시작될 때 도착할 화면의 타일을 미리 받아 둔다 — 다 들어왔을 때 이미 준비되어 있게
function preloadRelief(t) {
  const r = map.getBoundingClientRect();
  if (!r.width) return;
  let { x, y, w, h } = t;
  const ar = r.width / r.height;
  if (w / h > ar) { const nh = w / ar; y -= (nh - h) / 2; h = nh; } else { const nw = h * ar; x -= (nw - w) / 2; w = nw; }
  [RELIEF_HI, RELIEF_HI_W, RELIEF_CITY].forEach(L => reliefTiles(L, x, y, w, h, w / r.width, false));
}

function frame(ids, ms = 1300, reserve = true) {
  const pts = ids.map(id => P(PLACES[id]));
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  let x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const allCity = ids.every(id => PLACES[id].jlm || id === 'jerusalem');
  const min = allCity ? 14 : 300;
  const pad = Math.max(x1 - x0, y1 - y0) * 0.28;
  let w = Math.max(x1 - x0 + pad * 2, min), h = Math.max(y1 - y0 + pad * 2, min);
  let target = { x: (x0 + x1) / 2 - w / 2, y: (y0 + y1) / 2 - h / 2, w, h };
  animateTo(reserveCard(target, reserve), ms);
}
// 장면 카드가 가리는 영역을 비워 두고, 남은 지도 영역 가운데에 대상을 놓는다
function reserveCard(t, reserve = true) {
  if (!reserve) return t;
  const r = map.getBoundingClientRect(), mobile = innerWidth <= 900;
  if (!r.width) return t;
  const ar = r.width / r.height;
  // 화면 비율에 맞춘 실제 보이는 박스
  let { x, y, w, h } = t;
  if (w / h > ar) { const nh = w / ar; y -= (nh - h) / 2; h = nh; } else { const nw = h * ar; x -= (nw - w) / 2; w = nw; }
  if (mobile) {
    const f = .6; // 하단 시트가 지도 아래쪽 약 60%를 덮는다
    const nh = h / (1 - f), nw = w * nh / h; return { x: x - (nw - w) / 2, y, w: nw, h: nh };
  }
  const f = Math.min(.5, (Math.min(460, r.width * .42) + 28) / r.width);
  const nw = w / (1 - f), nh = h * nw / w; return { x, y: y - (nh - h) / 2, w: nw, h: nh };
}
// 무대가 있는 장면: 무대(캔버스의 가운데)가 장면 카드에 가리지 않은 지도 영역의 한가운데 오도록 맞춘다.
// 다음 목적지까지 함께 담지 않고 지금 장소만 본다. 무대가 없거나 아직 준비 전이면 false
// 카드 크기는 어림하지 않고 실제 크기로 잰다 — 모바일 시트는 내용에 따라 높이가 달라서 고정 비율로는 무대가 위로 쏠렸다
function freeArea(mode) {
  const r = map.getBoundingClientRect(), c = $('#scene'), mobile = innerWidth <= 900;
  if (mobile) {
    // 펼친 시트는 지도 높이의 66%까지, 접으면 64px (style.css와 같은 값)
    const h = mode === 'peek' ? 64 : Math.min(c.scrollHeight, r.height * .66);
    return { l: 0, t: 0, r: r.width, b: Math.max(r.height * .25, r.height - h) };
  }
  const cw = Math.min(460, r.width * .42) + 14;
  return { l: 0, t: 0, r: r.width - cw, b: r.height };
}
function frameStage(i, ms = 1300, mode = 'open') {
  if (window.terrainOn) return true; // 3D 지형 모드에서는 terrain.js가 카메라를 맡는다
  const e = EVENTS[i], st = window.stageFrame?.(e), r = map.getBoundingClientRect();
  if (!st || !r.width) return false;
  const [cx, cy] = st.at ? px(st.at) : P(PLACES[e.place]);
  const min = PLACES[e.place].jlm || e.place === 'jerusalem' ? 14 : 300;
  const u = reserveCard({ x: 0, y: 0, w: min, h: min }).w / r.width; // 이 확대에서 화면 1px 당 지도 단위
  const f = freeArea(mode), fx = (f.l + f.r) / 2, fy = (f.t + f.b) / 2;
  // 핀 + 무대 어긋남(dx,dy)이 빈 영역의 가운데에 오도록 보기 상자를 놓는다
  animateTo({ x: cx - (fx - st.dx) * u, y: cy - (fy - st.dy) * u, w: r.width * u, h: r.height * u }, ms);
  return true;
}
window.recenterStage = () => { if (fitMode !== 'all' && EVENTS) frameStage(idx, 600, $('#scene').classList.contains('peek') ? 'peek' : 'open'); };
// 화면을 돌리거나 창 크기를 바꾸면 빈 영역도 바뀌므로 다시 맞춘다
let recenterT; addEventListener('resize', () => { clearTimeout(recenterT); recenterT = setTimeout(() => window.recenterStage(), 250); });
// 전체 경로: 지도 틀 전체가 아니라 장소들이 모인 땅을 카드에 가리지 않는 영역에 꽉 차게.
// 애굽 피난길(나일 삼각주의 헬리오폴리스·부바스티스)까지 들어오게 남쪽·서쪽을 넉넉히
const LAND = (() => { const [x0, y0] = px([33.36, 31.0]), [x1, y1] = px([29.95, 35.82]); return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }; })();
function fitAll() { animateTo(reserveCard({ ...LAND }), 1100); }
function animateTo(target, ms) {
  cancelAnimationFrame(anim);
  preloadRelief(target);
  const from = { ...view }, t0 = performance.now();
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) ms = 0;
  // 로그 스케일 보간: 크게 확대/축소할 때도 자연스럽게
  const lerp = (a, b, k) => a + (b - a) * k;
  const step = now => {
    const k = ms ? Math.min(1, (now - t0) / ms) : 1, e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
    const w = Math.exp(lerp(Math.log(from.w), Math.log(target.w), e)), h = Math.exp(lerp(Math.log(from.h), Math.log(target.h), e));
    const cx = lerp(from.x + from.w / 2, target.x + target.w / 2, e), cy = lerp(from.y + from.h / 2, target.y + target.h / 2, e);
    view = { x: cx - w / 2, y: cy - h / 2, w, h };
    applyView();
    if (k < 1) anim = requestAnimationFrame(step);
  };
  anim = requestAnimationFrame(step);
}

// 2D 지도 끌기: 손가락·마우스로 끌어 둘러본다 (3D 모드에서는 terrain.js가 맡는다).
// 6px 넘게 움직여야 끌기로 보고, 그때는 뒤따르는 클릭(핀 누르기)을 삼킨다. 가운데가 전체 경로 땅 밖으로 너무 멀리 나가지 않게 잡는다
(() => {
  let drag = null;
  map.addEventListener('pointerdown', e => {
    if (window.terrainOn || e.button > 0 || drag) return;
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, v: { ...view }, moved: false };
  });
  map.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.id) return;
    if (e.pointerType === 'mouse' && !e.buttons) { drag = null; map.classList.remove('dragging'); return; } // 지도 밖에서 놓아 pointerup을 놓친 경우
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved) {
      if (Math.hypot(dx, dy) < 6) return;
      drag.moved = true; cancelAnimationFrame(anim); map.setPointerCapture(e.pointerId); map.classList.add('dragging');
    }
    const u = map.viewBox.baseVal.width / map.getBoundingClientRect().width;
    const { w, h } = drag.v, cx = Math.min(LAND.x + LAND.w * 1.25, Math.max(LAND.x - LAND.w * 0.25, drag.v.x + w / 2 - dx * u));
    const cy = Math.min(LAND.y + LAND.h * 1.25, Math.max(LAND.y - LAND.h * 0.25, drag.v.y + h / 2 - dy * u));
    view = { x: cx - w / 2, y: cy - h / 2, w, h };
    applyView();
  });
  const end = e => {
    if (!drag || e.pointerId !== drag.id) return;
    if (drag.moved) { map.classList.remove('dragging'); quietUntil = performance.now() + 250; }
    drag = null;
  };
  // 끌기를 끝낸 바로 뒤의 클릭만 막는다 (브라우저에 따라 끌기 뒤 클릭이 오지 않기도 해서 '한 번 삼키기'로는 다음 진짜 클릭을 먹었다)
  let quietUntil = 0;
  map.addEventListener('click', ev => { if (performance.now() < quietUntil) { ev.stopPropagation(); ev.preventDefault(); } }, { capture: true });
  addEventListener('pointerup', end); addEventListener('pointercancel', end); // 지도 밖에서 놓아도 끝나게 (끌기 문턱을 넘기 전엔 포인터를 붙잡지 않았다)
})();

// 위경도 → 화면(client) 좌표. 3D 무대(stage.js)가 물가·들판 같은 실제 지점에 소품을 세울 때 쓴다
window.geoToClient = (lat, lng) => {
  const [x, y] = px([lat, lng]), pt = map.createSVGPoint();
  pt.x = x; pt.y = y;
  const p = pt.matrixTransform(map.getScreenCTM());
  return { x: p.x, y: p.y };
};

function setWalker([x, y]) {
  const wk = $('#walker', map);
  wk.dataset.x = x; wk.dataset.y = y;
  const u = parseFloat(map.style.getPropertyValue('--u')) || 1;
  wk.setAttribute('transform', `translate(${x},${y}) scale(${u})`);
  dispatchEvent(new CustomEvent('walker', { detail: { x, y } })); // 3D 지형 모드의 걷는 사람이 따라온다
}
function updateMap(prevIdx, { camera = true } = {}) {
  const e = EVENTS[idx];
  const seen = new Set(EVENTS.slice(0, idx + 1).map(x => x.place));
  $$('.pin', map).forEach(m => {
    m.classList.toggle('seen', seen.has(m.dataset.place));
    m.classList.toggle('now', m.dataset.place === e.place);
  });
  $$('.route', map).forEach(r => {
    r.classList.toggle('done', +r.dataset.i <= idx);
    r.classList.toggle('last', +r.dataset.i === idx);
    r.classList.remove('walking'); r.style.strokeDashoffset = '';
  });
  setWalker(P(PLACES[e.place]));
  // 다음 목적지를 잇는 점선 힌트
  const nx = EVENTS[idx + 1], hint = $('#nextHint', map);
  if (nx && nx.place !== e.place) {
    const [x1, y1] = P(PLACES[e.place]), [x2, y2] = P(PLACES[nx.place]);
    hint.setAttribute('d', `M${x1},${y1} L${x2},${y2}`); hint.style.display = '';
  } else hint.style.display = 'none';
  if (camera) {
    if (fitMode === 'all') fitAll();
    else if (!frameStage(idx)) frame(nx && nx.place !== e.place ? [e.place, nx.place] : [e.place]);
  }
  const p = PLACES[e.place];
  $('#placeName').textContent = p.name; // 왼쪽 위 장소 칩 (누르면 이 장소로)
  $('#fitNow').title = `${p.name} · ${p.region}${p.approx ? ' · ' + t('approxPlace') : ''}`;
}

/* ---------- 걷기 ---------- */
const toRad = d => d * Math.PI / 180;
// 두 장소 사이의 경유지: 애굽 쪽(via를 가진 장소)에서 가까운 순서가 길의 끝 쪽에 오게
function routeVia(a, b) {
  if (b.via) return b.via;
  if (a.via) return [...a.via].reverse();
  return null;
}
function km(a, b) {
  const via = routeVia(a, b);
  // 해안 길(경유지가 있는 길)은 경유지를 이어 잰다 — 거의 곧은 길이라 덜 가산한다
  if (via) { const pts = [a, ...via.map(([lat, lng]) => ({ lat, lng })), b]; return pts.slice(1).reduce((s, p, i) => s + arc(pts[i], p) * 1.1, 0); }
  return arc(a, b) * 1.25; // 길은 직선보다 굽어 있으므로 25% 가산
}
function arc(a, b) {
  const dLat = toRad(b.lat - a.lat), dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}
function travelText(a, b) {
  const d = km(a, b);
  const w = d < 22 ? t('walkHours', { n: Math.max(1, Math.round(d / 4.5)) }) : t('walkDays', { n: Math.round(d / 25) });
  return t('distance', { d: d < 10 ? d.toFixed(1) : Math.round(d), t: w });
}
let walking = false, walkAnim = null;
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
function banner(html, ms) {
  const b = $('#walkBanner'); b.innerHTML = html; b.classList.add('show');
  clearTimeout(banner.t); if (ms) banner.t = setTimeout(() => b.classList.remove('show'), ms);
}
function walkTo(i, done) {
  const from = EVENTS[idx], to = EVENTS[i], A = PLACES[from.place], B = PLACES[to.place];
  const path = $(`.route[data-i="${i}"]`, map);
  walking = true; document.body.classList.add('is-walking');
  dispatchEvent(new CustomEvent('stage:walk', { detail: { ev: to } }));
  setCard('peek');
  $('#nextHint', map).style.display = 'none';
  banner(`<span class="wk">👣</span><b>${esc(A.name)}</b> → <b>${esc(B.name)}</b><small>${travelText(A, B)}</small>`);
  if (autoOn) speakQueue([{ text: t('walkSpeak', { a: A.name.replace(/[()·]/g, ' '), b: B.name.replace(/[()·]/g, ' ') }) }]);
  frame([from.place, to.place], 900, innerWidth > 900);
  const total = path.getTotalLength(), dur = reduced() ? 0 : Math.min(6500, Math.max(2200, km(A, B) * 30));
  path.classList.add('walking'); path.style.strokeDashoffset = 1;
  $('#walker', map).classList.add('moving');
  const start = performance.now() + (reduced() ? 0 : 700);
  const step = now => {
    const k = dur ? Math.max(0, Math.min(1, (now - start) / dur)) : 1;
    const e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    const pt = path.getPointAtLength(e * total);
    setWalker([pt.x, pt.y]);
    path.style.strokeDashoffset = 1 - e;
    if (k < 1) { walkAnim = requestAnimationFrame(step); return; }
    $('#walker', map).classList.remove('moving');
    walking = false; document.body.classList.remove('is-walking');
    done();
  };
  walkAnim = requestAnimationFrame(step);
}
function cancelWalk() {
  if (!walking) return;
  cancelAnimationFrame(walkAnim); walking = false;
  document.body.classList.remove('is-walking'); $('#walker', map).classList.remove('moving');
}
function setCard(mode) {
  const c = $('#scene');
  c.classList.toggle('peek', mode === 'peek');
  c.classList.toggle('open', mode === 'open');
  const b = $('#cardToggle'); if (b) { b.classList.toggle('folded', mode !== 'open'); b.setAttribute('aria-label', mode === 'open' ? t('showMap') : t('openScene')); b.setAttribute('aria-expanded', mode === 'open'); }
}

/* ---------- 장면 ---------- */
const refText = e => GOSPELS.filter(([k]) => e.refs[k]).map(([k, , ab]) => `${ab} ${e.refs[k]}`).concat(e.refs.acts ? [`${DATA.ui.gospels.acts[1]} ${e.refs.acts}`] : []).join(' · ');

let cardTab = 'story'; // 장면 카드의 탭: story(이야기) · text(본문) · compare(비교)
function renderScene() {
  const e = EVENTS[idx], per = PERIODS[e.p], place = PLACES[e.place];
  document.documentElement.style.setProperty('--period', per.color);
  const img = e.img
    ? `<button class="hero-img" id="heroBtn" aria-label="${esc(t('bigImage'))}"><img src="${e.img.src}" alt="${esc(e.title)} — ${esc(e.img.title)}" loading="eager"></button>`
    : `<div class="hero-img placeholder"><span>${esc(place.name)}</span></div>`;
  const jesus = e.words.filter(w => w.j);
  const word = (w, i) => `<blockquote class="word ${w.j ? 'jesus' : 'other'}" data-say="${i}">
      <p>${esc(w.text)}</p>
      <footer><span>${w.j ? esc(t('jesus')) : esc(w.who)}</span><cite>${esc(w.ref)}</cite><button class="say" data-say="${i}" aria-label="${esc(t('listenWord'))}">🔊</button></footer>
    </blockquote>`;
  const tabs = [['story', t('tabStory')], ['text', t('tabText')], ['compare', t('tabCompare')]];
  cardTab = 'story';
  $('#scene').innerHTML = `
  <div class="cardbar">
    <span class="pdot"></span>
    <div><b>${esc(e.title)}</b><small>${esc(place.name)} · ${esc(e.when)}</small></div>
  </div>
  <button id="cardToggle" class="cardtoggle" aria-controls="scene" aria-label="${esc(t('showMap'))}"><i></i></button>
  <div class="hero">${img}</div>
  <div class="credrow">
    ${e.img ? `<a class="credit" href="${esc(e.img.source)}" target="_blank" rel="noreferrer">${esc(e.img.credit)}</a>` : '<span></span>'}
    ${e.img ? `<button class="viewbtn" id="viewBtn">${esc(t('viewPainting'))} ↗</button>` : ''}
  </div>
  <div class="hero-text">
    <div class="eyebrow"><span class="pdot"></span>${LANG === 'ko' ? esc(per.en) + ' · ' : ''}${esc(per.name)} · ${idx + 1} / ${EVENTS.length}</div>
    <h1>${esc(e.title)}</h1>
    <p class="subtitle">${esc(e.subtitle)}</p>
  </div>
  <div class="ctabs" role="tablist">${tabs.map(([k, n]) => `<button role="tab" data-tab="${k}" class="${k === cardTab ? 'active' : ''}">${esc(n)}</button>`).join('')}</div>
  <section class="pane" data-pane="story" aria-label="${esc(t('storyLabel'))}">
    <div class="story">${e.story.map((s, i) => `<p data-para="${i}">${esc(s)}</p>`).join('')}</div>
    <aside class="note"><h4>${esc(t('noteHead'))}</h4><p>${esc(e.note)}</p></aside>
    <aside class="reflect"><h4>${esc(t('reflectHead'))}</h4><p>${esc(e.reflect)}</p></aside>
  </section>
  <section class="pane words-sec" data-pane="text" hidden>
    <h3>${esc(jesus.length ? t('hisWords') : t('voicesOfDay'))}</h3>
    ${e.words.map(word).join('')}
    <p class="fine">${esc(t('wordsNote', { r: refText(e) }))}</p>
  </section>
  <section class="pane" data-pane="compare" hidden>
    <div class="meta">
      <span>📍 ${esc(place.name)}${place.approx ? ` <i>(${esc(t('approxShort'))})</i>` : ''}</span>
      <span>🕰 ${esc(e.when)}</span>
    </div>
    <div class="gospels" aria-label="${esc(t('gospelsLabel'))}">
      ${GOSPELS.map(([k, name]) => `<span class="g ${e.refs[k] ? 'on' : ''}" title="${esc(t('gospelTitle', { g: name, r: e.refs[k] || t('noRecord') }))}"><b>${esc(name)}</b><small>${e.refs[k] || '—'}</small></span>`).join('')}
    </div>
    <p class="fine pad">${esc(t('compareNote'))}</p>
    <button class="textbtn pad" id="toHarmony">${esc(t('fullHarmony'))} →</button>
  </section>
  <div class="cardfoot"><button class="goldbtn" id="contBtn"></button></div>`;
  $('#scene').scrollTop = 0;
  $('#cardToggle').onclick = () => { setCard($('#scene').classList.contains('open') ? 'peek' : 'open'); window.recenterStage(); };
  $('.cardbar', $('#scene')).ondblclick = () => setCard('open');
  if (e.img) { $('#heroBtn').onclick = () => openViewer(e); $('#viewBtn').onclick = () => openViewer(e); }
  $$('.say', $('#scene')).forEach(b => b.onclick = ev => { ev.stopPropagation(); speakWord(+b.dataset.say); });
  $$('.ctabs button', $('#scene')).forEach(b => b.onclick = () => showTab(b.dataset.tab));
  $('#toHarmony').onclick = () => setView('harmony');
  showTab('story');
  updateQuizBtn();
}
// 탭 바꾸기. 아래 금빛 단추는 다음 탭으로 이어 읽게 하고, 마지막 탭에서는 다음 장소로 걷기
function showTab(k) {
  cardTab = k;
  const sc = $('#scene');
  $$('.ctabs button', sc).forEach(b => b.classList.toggle('active', b.dataset.tab === k));
  $$('.pane', sc).forEach(p => { p.hidden = p.dataset.pane !== k; });
  const order = ['story', 'text', 'compare'], nx = order[order.indexOf(k) + 1], b = $('#contBtn', sc);
  if (nx) { b.innerHTML = `${esc(t('continueReading'))} <span aria-hidden="true">→</span>`; b.onclick = () => { showTab(nx); $('.ctabs', sc).scrollIntoView({ block: 'start', behavior: 'smooth' }); }; }
  else if (idx < EVENTS.length - 1) { b.innerHTML = `${esc(t('walkNext'))} <span aria-hidden="true">→</span>`; b.onclick = () => go(idx + 1); }
  else { b.innerHTML = `${esc(t('quizReview'))}`; b.onclick = () => setView('quiz'); }
}
// 지금 장면의 퀴즈: 아래 조작부의 카드에서 창으로 연다
function updateQuizBtn() {
  const e = EVENTS[idx], done = state.quiz[e.id] === true;
  $('#quizBtn').classList.toggle('done', done);
  $('#quizBtn b').textContent = done ? `${t('tabQuiz')} ★` : t('tabQuiz');
}
function openSceneQuiz() {
  const e = EVENTS[idx], q = e.quiz, answered = state.quiz[e.id];
  $('#quizDlgBody').innerHTML = `<section class="quizcard" aria-label="${esc(t('quizLabel'))}" style="--c:${PERIODS[e.p].color}">
    <div class="eyebrow">${esc(e.title)} · ${esc(PLACES[e.place].name)}</div>
    <h4>${esc(t('quizLabel'))} ${answered === true ? '<span class="star">★</span>' : ''}</h4>
    <p class="q">${esc(q.q)}</p>
    <div class="opts">${q.options.map((o, i) => `<button data-opt="${i}">${esc(o)}</button>`).join('')}</div>
    <p class="explain" hidden></p>
  </section>`;
  const card = $('#quizDlgBody .quizcard');
  $$('.opts button', card).forEach(b => b.onclick = () => { answer(e, +b.dataset.opt, card); updateQuizBtn(); });
  $('#quizDlg').showModal();
}

function answer(e, i, card) {
  const q = e.quiz, ok = i === q.answer;
  $$('.opts button', card).forEach((b, j) => { b.disabled = true; b.classList.toggle('right', j === q.answer); b.classList.toggle('wrong', j === i && !ok); });
  const ex = $('.explain', card); ex.hidden = false;
  ex.innerHTML = `<b>${esc(ok ? t('correct') : t('wrong', { a: q.options[q.answer] }))}</b> ${esc(q.explain)}`;
  if (state.quiz[e.id] !== true) state.quiz[e.id] = ok;
  store.save(); updateProgress();
  return ok;
}

// 시기마다 작은 그림 (아래 시간선): 탄생의 별, 요단의 비둘기, 우물, 갈릴리의 배, 산, 성, 언덕의 십자가, 떠오르는 해
const PICONS = {
  p1: '<path d="M12 3l2 5 5 .5-4 3.5 1.3 5L12 14.3 7.7 17l1.3-5-4-3.5 5-.5Z"/>',
  p2: '<path d="M4 13c3-1 5-3 6-6 1 3 3 4 6 4l4-2-2 4c-1 3-4 5-8 5H5l2-2c-2 0-3-1-3-3Z"/>',
  p3: '<path d="M6 10h12M7 10v9h10v-9M5 7h14l-2-3H7Z M12 13v3"/>',
  p4: '<path d="M3 15h18l-3 4H6Z M12 4v11 M12 5l6 8h-6"/>',
  p5: '<path d="M2 19l7-11 4 6 3-4 6 9Z"/>',
  p6: '<path d="M3 20V10h3V7h3v3h2V6h2v4h2V7h3v3h3v10Z M10 20v-4h4v4"/>',
  p7: '<path d="M12 3v14 M8 7h8 M3 21c3-4 6-5 9-5s6 1 9 5"/>',
  p8: '<path d="M3 18h18 M6 18a6 6 0 0 1 12 0 M12 6V3 M5 9 3 7 M19 9l2-2"/>',
};
function renderTrack() {
  const groups = Object.values(PERIODS).map(per => ({ per, evs: EVENTS.map((e, i) => [e, i]).filter(([e]) => e.p === per.id) }));
  $('#track').innerHTML = groups.map(({ per, evs }) => `<div class="tseg" data-p="${per.id}" style="--c:${per.color};flex:${evs.length + 3}">
      <button class="ticon" data-i="${evs[0][1]}" title="${esc(per.name)}" aria-label="${esc(per.name)}"><svg viewBox="0 0 24 24" aria-hidden="true">${PICONS[per.id] || ''}</svg></button>
      <div class="tline">${evs.map(([e, i]) => `<button class="tick" data-i="${i}" title="${esc(e.title)} · ${esc(PLACES[e.place].name)}" aria-label="${i + 1}. ${esc(e.title)}"></button>`).join('')}</div>
      <span class="tname">${esc(per.name)}</span></div>`).join('');
  $$('#track [data-i]').forEach(b => b.onclick = () => go(+b.dataset.i));
}
function updateTrack() {
  $$('.tick').forEach((b, i) => { b.classList.toggle('now', i === idx); b.classList.toggle('seen', visited.has(EVENTS[i].id)); });
  $$('.tseg').forEach(g => g.classList.toggle('now', g.dataset.p === EVENTS[idx].p));
  const now = $('.tick.now'), tr = $('#track');
  if (now) tr.scrollTo({ left: now.offsetLeft - tr.clientWidth / 2, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}

function go(i, { keepSpeech = false, onArrive } = {}) {
  if (i < 0 || i >= EVENTS.length || i === idx && $('#scene').innerHTML) return;
  if (walking && i === idx + 1) return; // 이미 그곳으로 걷는 중
  if (!keepSpeech) stopSpeech(true);
  cancelWalk();
  const prev = idx;
  const prevPlace = $('#scene').innerHTML ? EVENTS[prev].place : null;
  const stepped = i === prev + 1 && prevPlace !== null;
  const arrive = () => {
    idx = i;
    renderScene(); updateMap(prev, { camera: !stepped || fitMode === 'all' }); updateTrack(); markVisited(EVENTS[i].id);
    window.__stageScene = EVENTS[i]; // stage.js가 늦게 로드돼도 따라잡도록
    dispatchEvent(new CustomEvent('stage:scene', { detail: { ev: EVENTS[i] } }));
    bgmFollow(); // 읽는 중에 장면이 바뀌면 그 장면의 곡으로 겹쳐 바꾼다
    history.replaceState(null, '', '#' + EVENTS[i].id);
    $('#prev').disabled = idx === 0; $('#next').disabled = $('#skip').disabled = idx === EVENTS.length - 1;
    const p = PLACES[EVENTS[i].place];
    if (stepped) {
      banner(`<span class="wk">📍</span>${esc(EVENTS[prev].place === EVENTS[i].place ? t('samePlace') : t('arrive'))} · <b>${esc(p.name)}</b><small>${esc(EVENTS[i].when)}</small>`, 2600);
      const nx = EVENTS[i + 1];
      if (fitMode !== 'all' && !frameStage(i, 1100)) frame(nx && nx.place !== EVENTS[i].place ? [EVENTS[i].place, nx.place] : [EVENTS[i].place], 1100);
      $('#walker', map).classList.remove('arrive'); void $('#walker', map).getBoundingClientRect(); $('#walker', map).classList.add('arrive');
      setTimeout(() => setCard('open'), reduced() ? 0 : 650);
    } else setCard('open');
    onArrive && onArrive();
  };
  if (stepped && prevPlace !== EVENTS[i].place) walkTo(i, arrive);
  else if (stepped) { setCard('peek'); setTimeout(arrive, reduced() ? 0 : 700); }
  else arrive();
}

/* ---------- 랜딩페이지 (첫 시작 화면) ---------- */
// resume: 이어서 걸을 장면 번호(없으면 -1). 다녀간 사람에게는 '이어서 걷기'와 '처음부터 걷기'를 함께 준다
function showIntro(resume) {
  const box = $('#intro'), starts = $$('.go-start', box), agains = $$('.go-again', box);
  $('#introLead').textContent = t('introLead', { n: EVENTS.length });
  $('#statScenes').textContent = EVENTS.length;
  $('#statPlaces').textContent = new Set(EVENTS.map(e => e.place)).size;
  // 안내 글의 단추 이름은 실제 화면 글씨를 그대로 끌어 쓴다 (언어마다 맞게)
  const names = { walk: t('walkNext'), words: t('tabWords'), quiz: t('tabQuiz') };
  [1, 2, 3, 4].forEach(k => { $('#landStep' + k).textContent = t('landStep' + k, names); });
  const label = resume > 0 ? t('introContinue', { n: resume + 1, title: EVENTS[resume].title }) : t('introStart');
  starts.forEach(b => { b.textContent = label; });
  agains.forEach(b => { b.hidden = !(resume > 0); });
  // 떠 있는 동안 뒤 화면은 inert — Tab 초점·클릭이 가려진 단추로 가지 않게 (방향키 단축키는 아래 keydown에서 막는다)
  const behind = [...document.body.children].filter(el => el !== box && el.tagName !== 'SCRIPT');
  // walk: 여정으로 가는 단추(이어서·처음부터)는 다른 탭에서 열었어도 여정 화면으로 돌아간다. Esc는 있던 화면 그대로
  const close = (i, walk) => {
    box.classList.add('out'); removeEventListener('keydown', esc);
    behind.forEach(el => { el.inert = false; });
    setTimeout(() => { box.hidden = true; box.classList.remove('out'); }, 500);
    if (walk && $('#journey').hidden) setView('journey');
    if (i !== idx) go(i);
  };
  const esc = ev => { if (ev.key === 'Escape') close(idx); };
  starts.forEach(b => { b.onclick = () => close(resume > 0 ? resume : 0, true); });
  agains.forEach(b => { b.onclick = () => close(0, true); });
  $('.land-down', box).onclick = ev => { ev.preventDefault(); $('#landHow').scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth' }); };
  addEventListener('keydown', esc);
  behind.forEach(el => { el.inert = true; });
  box.scrollTop = 0; box.hidden = false; starts[0].focus({ preventScroll: true });
}

/* ---------- 낭독 (Web Speech API) ---------- */
const synth = window.speechSynthesis;
let voices = [], speaking = false, autoOn = false, autoTimer = null, speechToken = 0;
function pickVoices() {
  if (!synth) return;
  voices = synth.getVoices().filter(v => v.lang.toLowerCase().replace('_', '-').split('-')[0] === LANG);
}
if (synth) { pickVoices(); synth.onvoiceschanged = pickVoices; }
const sentences = text => text.match(/[^.?!…。！？]+[.?!…。！？]*["”’」』]?\s*/g) || [text];

// 녹음 낭독 (한국어만): _src/tools/voice.mjs가 만든 문장별 mp3. 열쇠는 목소리|문장의 FNV-1a (voice.mjs와 같은 계산)
// 한 번 듣기에 쓸 문장이 모두 녹음돼 있을 때만 녹음으로 읽고, 하나라도 없으면 지금처럼 브라우저 음성으로 읽는다
const VOICE_NAME = { narr: 'Aoede', jesus: 'Algenib' };
const voiceKey = (voice, text) => { let h = 0x811c9dc5; for (const c of `${voice}|${text}`) { h ^= c.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(36); };
let voiceIndex = {};
if (LANG === 'ko') fetch('assets/voice/ko/index.json').then(r => r.ok ? r.json() : {}).then(j => { voiceIndex = j; }).catch(() => {});
const voiceAudio = new Audio();
// 문장 사이 쉼(ms, 1배속 기준). 녹음은 앞뒤 무음을 덜어 냈으므로 여기서 준다 — 문장 끝은 본디 쉼의 0.9배쯤, 제목 뒤는 넉넉히
const VOICE_GAP = { sentence: 800, item: 850, intro: 1700 };

let warnedNoVoice = false;
function speakQueue(items, onDone) {
  // items: [{text, el, jesus, pause}] — 문장 단위로 읽으며 해당 문단을 강조한다
  const token = ++speechToken;
  const rate = +$('#rate').value;
  pickVoices();
  const useVoice = !!synth && voices.length > 0;
  if (synth) synth.cancel();
  voiceAudio.pause();
  // 낭독자와 예수님 목소리는 서로 다른 음성으로 (이름에 성별이 드러나는 음성을 먼저 고른다)
  const narrator = voices.find(v => /female|여|yuna|sun-?hi|heami|samantha|zira|aria|jenny|google/i.test(v.name) && !/\bmale/i.test(v.name)) || voices[0];
  const other = voices.find(v => v !== narrator && /\bmale|남|injoon|hyunsu|minsu|daniel|david|guy|thomas|jorge|diego|kenji|keita/i.test(v.name)) || voices.find(v => v !== narrator);
  const queue = [];
  items.forEach(it => {
    const ss = sentences(it.text).map(s => s.trim()).filter(Boolean);
    ss.forEach((s, k) => queue.push({ ...it, text: s, s: k, last: k === ss.length - 1 }));
  });
  queue.forEach(it => { it.clip = voiceKey(it.jesus ? VOICE_NAME.jesus : VOICE_NAME.narr, it.text); });
  const recorded = LANG === 'ko' && queue.length > 0 && queue.every(it => voiceIndex[it.clip]);
  // 녹음으로 읽는 장면이면 브라우저 음성이 없어도 안내하지 않는다
  if (!recorded && !useVoice && !warnedNoVoice) {
    warnedNoVoice = true;
    toast(synth ? t('noVoiceLang') : t('noVoice'));
  }
  const staged = items.some(it => it.beat);
  const readMs = it => (600 + it.text.length * 140) / rate; // 눈으로 읽는 속도
  let n = 0;
  speaking = true; setListenUI();
  const next = () => {
    if (token !== speechToken) return;
    $$('.speaking').forEach(x => x.classList.remove('speaking'));
    if (n >= queue.length) { speaking = false; setListenUI(); showCaption(null); if (staged) stageBeat('end'); onDone && onDone(); return; }
    const it = queue[n++];
    const pane = it.el && it.el.closest('.pane');
    if (pane && pane.hidden) showTab(pane.dataset.pane);
    if (it.el) { it.el.classList.add('speaking'); scrollToEl(it.el); }
    showCaption(it);
    if (it.beat) stageBeat(it.beat, it.s);
    let done = false, guard;
    const advance = d => { if (done) return; done = true; clearTimeout(guard); autoTimer = setTimeout(next, n >= queue.length ? 0 : d); }; // 마지막 문장 뒤에는 쉬지 않고 곧바로 끝낸다 (배경음악이 낭독과 함께 멈추게)
    if (recorded) {
      const gap = (!it.last ? VOICE_GAP.sentence : it.beat === 'intro' ? VOICE_GAP.intro : VOICE_GAP.item) / rate;
      // 감시 타이머는 실제로 소리가 나기 시작할 때부터 남은 길이로 잰다 (받는 중·버퍼링 시간은 빼고).
      // 15초가 지나도 시작하지 못하면 그 문장은 건너뛴다
      guard = setTimeout(() => advance(0), 15000);
      voiceAudio.src = `assets/voice/ko/${it.clip}.mp3`;
      voiceAudio.playbackRate = rate;
      voiceAudio.onplaying = () => { clearTimeout(guard); guard = setTimeout(() => advance(0), (voiceIndex[it.clip] - voiceAudio.currentTime * 1000) / rate + 3000); };
      voiceAudio.onwaiting = () => { clearTimeout(guard); guard = setTimeout(() => advance(0), 15000); };
      voiceAudio.onended = () => advance(gap);
      // 파일을 못 불러오면 그 문장은 눈으로 읽는 속도만큼 기다린다
      voiceAudio.onerror = () => { clearTimeout(guard); guard = setTimeout(() => advance(0), readMs(it)); };
      voiceAudio.play().catch(err => { if (err.name !== 'AbortError') voiceAudio.onerror(); });
      // 다음 문장 파일을 미리 받아 두어 문장 사이에 불러오는 시간이 끼지 않게
      if (queue[n]) fetch(`assets/voice/ko/${queue[n].clip}.mp3`).catch(() => {});
      return;
    }
    if (!useVoice) { guard = setTimeout(() => advance(it.pause || 0), readMs(it)); return; }
    const u = new SpeechSynthesisUtterance(it.text);
    u.lang = DATA.ui.lang; u.rate = rate;
    const v = it.jesus ? other || narrator : narrator;
    if (v) u.voice = v;
    u.pitch = it.jesus && !other ? 0.8 : 1;
    // 일부 브라우저는 onend를 빠뜨리므로 감시 타이머로 다음 문장을 보장한다
    guard = setTimeout(() => advance(0), 4000 + it.text.length * 260 / rate);
    u.onend = () => advance(it.pause || 120);
    u.onerror = ev => { if (ev.error !== 'interrupted' && ev.error !== 'canceled') { clearTimeout(guard); guard = setTimeout(() => advance(0), readMs(it)); } };
    synth.speak(u);
  };
  next();
}
// 지도 위 자막: 지금 읽는 문장 (말씀이면 말하는 이도). 영화 자막처럼 지도 아래쪽 가운데에
function showCaption(it) {
  const c = $('#caption');
  if (!it || !it.text) { c.classList.remove('show'); return; }
  $('small', c).textContent = it.who || '';
  c.classList.toggle('who', !!it.who);
  $('p', c).textContent = it.text;
  c.classList.add('show');
}
function scrollToEl(el) {
  // 낭독 중인 문단이 보이도록 해당 스크롤 영역만 움직인다 (창 전체가 밀리지 않게)
  const box = el.closest('#scene') || document.scrollingElement;
  const r = el.getBoundingClientRect(), b = box === document.scrollingElement ? { top: 0, height: innerHeight } : box.getBoundingClientRect();
  if (r.top < b.top + 40 || r.bottom > b.top + b.height - 40) box.scrollBy({ top: r.top - b.top - b.height / 3, behavior: 'smooth' });
}

function sceneScript() {
  const e = EVENTS[idx], sc = $('#scene');
  // beat: 3D 무대(stage.js)가 연출을 맞추는 표지 — intro, p0…(문단), w0…(말씀)
  // 제목 줄은 '수태고지. 장소, 나사렛. 시기, BC 6년경.'으로 읽는다 (장소와 때를 이름 붙여 알려 준다)
  const items = [{ text: `${e.title}. ${t('sayPlace')}, ${PLACES[e.place].name.replace(/[()·]/g, ' ')}. ${t('sayWhen')}, ${e.when.replace(/\s*·\s*/g, ', ')}.`, el: $('.hero-text', sc), pause: 500, beat: 'intro' }];
  e.story.forEach((s, i) => items.push({ text: s, el: $(`[data-para="${i}"]`, sc), pause: 350, beat: 'p' + i }));
  const jesus = e.words.some(w => w.j);
  items.push({ text: (jesus ? t('hisWords') : t('voicesOfDay')) + '.', el: $('.words-sec h3', sc), pause: 400 });
  e.words.forEach((w, i) => {
    const who = w.j ? t('jesus') : w.who;
    if (!w.j) items.push({ text: `${w.who}.`, el: $(`blockquote[data-say="${i}"]`, sc), beat: 'w' + i });
    items.push({ text: w.text, who, el: $(`blockquote[data-say="${i}"]`, sc), jesus: !!w.j, pause: 500, beat: 'w' + i });
  });
  return items;
}
function speakScene(onDone) { speakQueue(sceneScript(), onDone); }
function speakWord(i) {
  stopAuto();
  const w = EVENTS[idx].words[i];
  speakQueue([{ text: w.text, who: w.j ? t('jesus') : w.who, el: $(`blockquote[data-say="${i}"]`, $('#scene')), jesus: !!w.j }]);
}
const stageBeat = (beat, s) => dispatchEvent(new CustomEvent('stage:beat', { detail: { beat, s } }));
function stopSpeech(keepAuto) {
  if (speaking) dispatchEvent(new CustomEvent('stage:stop'));
  speechToken++; clearTimeout(autoTimer);
  if (synth) synth.cancel();
  voiceAudio.pause(); voiceAudio.onended = voiceAudio.onerror = voiceAudio.onplaying = voiceAudio.onwaiting = null;
  speaking = false; $$('.speaking').forEach(x => x.classList.remove('speaking'));
  showCaption(null);
  if (!keepAuto) stopAuto();
  setListenUI();
}
function stopAuto() { autoOn = false; clearTimeout(autoTimer); setListenUI(); }
function startAuto() {
  autoOn = true; setListenUI();
  const run = () => {
    if (!autoOn) return;
    speakScene(() => {
      if (!autoOn) return;
      if (idx >= EVENTS.length - 1) { stopAuto(); toast(t('journeyEnd')); return; }
      autoTimer = setTimeout(() => { if (!autoOn) return; go(idx + 1, { keepSpeech: true, onArrive: () => { autoTimer = setTimeout(run, 1400); } }); }, 1200);
    });
  };
  run();
}
function setListenUI() {
  const l = $('#listen');
  l.classList.toggle('on', speaking); // 재생 중이면 일시정지 모양
  l.setAttribute('aria-label', speaking ? t('stop') : t('listenScene'));
  $('#auto').checked = autoOn;
  bgmFollow();
}

/* ---------- 배경음악 (낭독 밑에) ---------- */
// 장면마다 곡 하나(_src/music.json → data의 music, assets/music/<곡>.mp3, 30초 반복 곡). 낭독하는 동안만 낮게 깐다.
// 곡 끝이 다가오면 같은 곡을 처음부터 겹쳐 틀어 이음매가 들리지 않게 하고, 장면이 바뀌어 곡이 다르면 서로 겹쳐 바꾼다.
// 낭독과 함께 켜지고 함께 멈춘다 (자동 여정의 장면 사이에도 낭독이 없으면 쉰다). 딸깍 소리가 나지 않게 0.3초만 오르내린다.
// 소리 크기는 Web Audio 사슬로만 정한다 (아이폰은 audio 요소의 volume을 무시한다). 낭독 소리는 이 사슬에 넣지 않는다
const BGM = { key: 'theway-music', level: 0.144, fade: 2.5 }; // level: 사용자 요청으로 0.16에서 10% 낮춤
let bgmCtx = null, bgmPlayers = [], bgmCur = 0, bgmCue = null, bgmLoop = null, bgmGo = 0;
// 켜고 끈 것은 메모리에 두고 localStorage에는 남겨 두기만 한다 (저장이 막힌 브라우저에서도 이번 방문 동안은 끌 수 있게)
let bgmPref = (() => { try { return localStorage.getItem(BGM.key) !== 'off'; } catch { return true; } })();
const bgmOn = () => bgmPref;
function bgmReady() {
  if (bgmCtx) return true;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return false;
  bgmCtx = new Ctx();
  // 곡 안의 큰 대목은 눌러 두고, 말소리 대역(1~4kHz)을 비워 낭독이 그 위로 또렷하게 (리딩북 music.js와 같은 사슬)
  const squeeze = bgmCtx.createDynamicsCompressor();
  squeeze.threshold.value = -30; squeeze.knee.value = 10; squeeze.ratio.value = 6; squeeze.attack.value = 0.02; squeeze.release.value = 0.4;
  const room = bgmCtx.createBiquadFilter(); room.type = 'peaking'; room.frequency.value = 2000; room.Q.value = 0.8; room.gain.value = -8;
  squeeze.connect(room).connect(bgmCtx.destination);
  bgmPlayers = [0, 1].map(() => {
    const el = new Audio(); el.preload = 'auto';
    const gain = bgmCtx.createGain(); gain.gain.value = 0;
    bgmCtx.createMediaElementSource(el).connect(gain).connect(squeeze);
    el.addEventListener('timeupdate', () => {
      if (bgmPlayers[bgmCur].el !== el || !bgmCue || bgmLoop === el || !(el.duration > BGM.fade * 3)) return;
      if (el.duration - el.currentTime < BGM.fade) { bgmLoop = el; bgmPlay(bgmCue); }
    });
    el.addEventListener('ended', () => { if (bgmPlayers[bgmCur].el === el && bgmCue) bgmPlay(bgmCue); });
    return { el, gain, fade: null };
  });
  return true;
}
// 지금 들리는 크기 (gain.value를 제대로 알려 주지 않는 브라우저가 있어 마지막 램프로 셈한다)
const bgmLevel = p => { const f = p.fade; if (!f) return 0; const k = f.s > 0 ? Math.min(1, (bgmCtx.currentTime - f.at) / f.s) : 1; return f.from + (f.to - f.from) * Math.max(0, k); };
function bgmRamp(p, to, s) {
  const now = bgmCtx.currentTime, g = p.gain.gain, from = bgmLevel(p);
  g.cancelScheduledValues(now); g.setValueAtTime(from, now); g.linearRampToValueAtTime(to, now + s);
  p.fade = { from, to, at: now, s };
}
// s: 올리는 시간. 반복·곡 바꿈은 겹쳐 잇고, 낭독이 시작될 때는 곧바로 올린다
function bgmPlay(cue, s = BGM.fade) {
  const from = bgmPlayers[bgmCur], to = bgmPlayers[1 - bgmCur]; ++bgmGo;
  bgmRamp(from, 0, s);
  setTimeout(() => { if (from !== bgmPlayers[bgmCur]) from.el.pause(); }, s * 1000 + 100);
  bgmCur = 1 - bgmCur; bgmCue = cue; bgmLoop = null;
  if (!to.el.src.endsWith(`/${cue}.mp3`)) to.el.src = `assets/music/${cue}.mp3`;
  to.el.currentTime = 0;
  to.el.play().catch(() => {});
  bgmRamp(to, BGM.level, s);
}
function bgmStop(s) {
  if (!bgmCtx) return;
  const go = ++bgmGo; bgmCue = null;
  bgmPlayers.forEach(p => bgmRamp(p, 0, s));
  setTimeout(() => { if (go === bgmGo) bgmPlayers.forEach(p => p.el.pause()); }, s * 1000 + 100);
}
// 낭독 상태가 바뀔 때마다 (setListenUI)
function bgmFollow() {
  $('#music')?.setAttribute('aria-pressed', String(bgmOn()));
  const cue = bgmOn() && speaking ? EVENTS?.[idx]?.music : null;
  if (!cue) { if (bgmCue) bgmStop(0.3); return; }
  if (!bgmReady()) return;
  if (bgmCtx.state === 'suspended') bgmCtx.resume().catch(() => {});
  if (cue !== bgmCue) { bgmPlay(cue, bgmCue ? BGM.fade : 0.3); return; }
  // 같은 곡이 내려가던 중이면 그 자리에서 다시 올린다
  const p = bgmPlayers[bgmCur];
  if (p.el.paused) p.el.play().catch(() => {});
  if (bgmLevel(p) < BGM.level - 0.01) { ++bgmGo; bgmRamp(p, BGM.level, 0.3); }
}

/* ---------- 말씀 모음 ---------- */
function renderWords() {
  const q = $('#wordSearch').value.trim();
  let html = '', lastP = null, count = 0;
  EVENTS.forEach((e, i) => e.words.forEach((w, j) => {
    if (!w.j) return;
    if (q && !(w.text + e.title + PLACES[e.place].name).toLowerCase().includes(q.toLowerCase())) return;
    if (lastP !== e.p) { html += `<h3 class="psep" style="--c:${PERIODS[e.p].color}">${esc(PERIODS[e.p].name)} <small>${esc(PERIODS[e.p].span)}</small></h3>`; lastP = e.p; }
    count++;
    html += `<div class="wcard" style="--c:${PERIODS[e.p].color}">
      <p>${q ? esc(w.text).replace(new RegExp(esc(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), m => `<mark>${m}</mark>`) : esc(w.text)}</p>
      <footer><cite>${esc(w.ref)}</cite><span>${esc(e.title)} · ${esc(PLACES[e.place].name)}</span>
      <button class="say" data-e="${i}" data-w="${j}" aria-label="${esc(t('listen'))}">🔊</button><button class="goto" data-e="${i}">${esc(t('gotoScene'))}</button></footer></div>`;
  }));
  $('#wordList').innerHTML = (count ? `<p class="count">${esc(t('wordCount', { n: count }))}</p>` : `<p class="empty">${esc(t('noWords'))}</p>`) + html;
  $$('#wordList .goto').forEach(b => b.onclick = () => { setView('journey'); go(+b.dataset.e); });
  $$('#wordList .say').forEach(b => b.onclick = () => { const w = EVENTS[+b.dataset.e].words[+b.dataset.w]; speakQueue([{ text: w.text, el: b.closest('.wcard'), jesus: true }]); });
}

/* ---------- 대조표 ---------- */
let harmonyFilter = 'all';
function renderHarmony() {
  const gn = k => GOSPELS.find(g => g[0] === k)[1];
  const filters = [['all', t('fAll')], ['four', t('fFour')], ...['jn', 'lk', 'mt'].map(k => [k, t('fOnly', { g: gn(k) })])];
  $('#harmonyFilter').innerHTML = filters.map(([k, n]) => `<button data-f="${k}" class="${harmonyFilter === k ? 'active' : ''}">${esc(n)}</button>`).join('');
  $$('#harmonyFilter button').forEach(b => b.onclick = () => { harmonyFilter = b.dataset.f; renderHarmony(); });
  const has = e => GOSPELS.filter(([k]) => e.refs[k]).map(([k]) => k);
  const keep = e => { const h = has(e); return harmonyFilter === 'all' || (harmonyFilter === 'four' ? h.length === 4 : h.length === 1 && h[0] === harmonyFilter); };
  $('#harmonyStats').innerHTML = GOSPELS.map(([k, n]) => {
    const c = EVENTS.filter(e => e.refs[k]).length;
    return `<div><b>${c}</b><span>${esc(t('gospelOf', { g: n }))}</span><i style="width:${c / EVENTS.length * 100}%"></i></div>`;
  }).join('') + `<div><b>${EVENTS.filter(e => has(e).length === 4).length}</b><span>${esc(t('fourCommon'))}</span></div>`;
  let lastP = null;
  $('#harmonyTable').innerHTML = `<thead><tr><th>${esc(t('scene'))}</th>${GOSPELS.map(([, n]) => `<th>${esc(n)}</th>`).join('')}</tr></thead><tbody>` +
    EVENTS.map((e, i) => {
      if (!keep(e)) return '';
      const sep = lastP !== e.p ? `<tr class="psep-row"><td colspan="5" style="--c:${PERIODS[e.p].color}">${esc(PERIODS[e.p].name)} · ${esc(PERIODS[e.p].span)}</td></tr>` : ''; lastP = e.p;
      return `${sep}<tr data-e="${i}"><td><b>${esc(e.title)}</b><small>${esc(PLACES[e.place].name)} · ${esc(e.when)}</small></td>${GOSPELS.map(([k]) => `<td class="${e.refs[k] ? 'on' : ''}">${e.refs[k] || ''}</td>`).join('')}</tr>`;
    }).join('') + '</tbody>';
  $$('#harmonyTable tbody tr[data-e]').forEach(tr => tr.onclick = () => { setView('journey'); go(+tr.dataset.e); });
}

/* ---------- 퀴즈 ---------- */
let quizRun = null;
function renderQuizHome() {
  quizRun = null;
  $('#quizBody').innerHTML = `<div class="pgrid">${Object.values(PERIODS).map(p => {
    const evs = EVENTS.filter(e => e.p === p.id), right = evs.filter(e => state.quiz[e.id] === true).length;
    const done = right === evs.length;
    return `<button class="pcard ${done ? 'done' : ''}" data-p="${p.id}" style="--c:${p.color}">
      <span class="stamp" aria-hidden="true">${done ? '✦' : right ? right : ''}</span>
      <small>${LANG === 'ko' ? esc(p.en) : ''}</small><b>${esc(p.name)}</b><span>${esc(p.span)} · ${esc(t('nQuestions', { n: evs.length }))}</span>
      <span class="bar"><i style="width:${right / evs.length * 100}%"></i></span><em>${esc(t('nRight', { r: right, n: evs.length }))}</em></button>`;
  }).join('')}</div>
  <button class="bigbtn" id="quizAll">${esc(t('random10'))}</button>`;
  $$('.pcard').forEach(b => b.onclick = () => startQuiz(EVENTS.filter(e => e.p === b.dataset.p), PERIODS[b.dataset.p].name));
  $('#quizAll').onclick = () => startQuiz([...EVENTS].sort(() => Math.random() - .5).slice(0, 10), t('random10Name'));
}
function startQuiz(list, name) { quizRun = { list, name, i: 0, score: 0 }; renderQuizStep(); }
function renderQuizStep() {
  const r = quizRun;
  if (r.i >= r.list.length) {
    const pct = r.score / r.list.length;
    $('#quizBody').innerHTML = `<div class="qresult"><div class="big">${r.score} / ${r.list.length}</div>
      <p>${esc(pct === 1 ? t('quizPerfect') : pct >= .7 ? t('quizGood') : t('quizOk'))}</p>
      <button class="bigbtn" id="qBack">${esc(t('backToPeriods'))}</button></div>`;
    $('#qBack').onclick = renderQuizHome; return;
  }
  const e = r.list[r.i], gi = EVENTS.indexOf(e);
  $('#quizBody').innerHTML = `<div class="qrun quizcard" style="--c:${PERIODS[e.p].color}">
    <div class="qtop"><span>${esc(r.name)}</span><span>${r.i + 1} / ${r.list.length}</span></div>
    <div class="eyebrow">${esc(e.title)} · ${esc(PLACES[e.place].name)}</div>
    <p class="q">${esc(e.quiz.q)}</p>
    <div class="opts">${e.quiz.options.map((o, i) => `<button data-opt="${i}">${esc(o)}</button>`).join('')}</div>
    <p class="explain" hidden></p>
    <div class="qnav"><button class="textbtn" id="qScene">${esc(t('reviewScene'))}</button><button class="bigbtn" id="qNext" hidden>${esc(t('nextQ'))}</button></div></div>`;
  const card = $('.qrun');
  $$('.opts button', card).forEach(b => b.onclick = () => { if (answer(e, +b.dataset.opt, card)) r.score++; $('#qNext').hidden = false; $('#qNext').focus(); });
  $('#qNext').onclick = () => { r.i++; renderQuizStep(); };
  $('#qScene').onclick = () => { setView('journey'); go(gi); };
}

/* ---------- 진행 상황 · 도장 ---------- */
function updateProgress() {
  const n = visited.size, total = EVENTS.length;
  $('#progressText').textContent = `${n} / ${total}`;
  $('#ring').style.width = `${n / total * 100}%`;
}
function renderStamps() {
  $('#stampGrid').innerHTML = Object.values(PERIODS).map(p => {
    const evs = EVENTS.filter(e => e.p === p.id), seen = evs.filter(e => visited.has(e.id)).length, stars = evs.filter(e => state.quiz[e.id] === true).length;
    const done = seen === evs.length;
    return `<div class="stampcell ${done ? 'done' : ''}" style="--c:${p.color}"><div class="seal">${done ? '✦' : `${seen}/${evs.length}`}</div><b>${esc(p.name)}</b><small>${esc(t('footsteps', { s: seen, n: evs.length, r: stars }))}</small></div>`;
  }).join('');
}

/* ---------- 보기 전환 · 기타 ---------- */
function setView(v) {
  $$('.view').forEach(m => m.hidden = m.id !== v);
  $$('.tabs button').forEach(b => { const on = b.dataset.view === v || (v === 'harmony' && b.dataset.view === 'words'); b.classList.toggle('active', on); b.setAttribute('aria-selected', on); });
  if (v !== 'journey') stopSpeech();
  if (v === 'words') renderWords();
  if (v === 'harmony') renderHarmony();
  if (v === 'quiz') renderQuizHome();
  if (v === 'journey') requestAnimationFrame(applyView);
  scrollTo(0, 0);
}
function openViewer(e) {
  $('#viewerImg').src = e.img.src; $('#viewerImg').alt = e.img.title;
  $('#viewerCap').textContent = e.img.credit;
  $('#viewer').showModal();
}
let toastT;
function toast(msg) {
  let t = $('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 3800);
}

const getData = f => fetch(f).then(r => { if (!r.ok) throw Error(r.status); return r.json(); });
(LANG === 'ko' ? getData('data.json') : getData(`data.${LANG}.json`).catch(() => getData('data.json'))).then(d => {
  DATA = d; EVENTS = d.events; PLACES = d.places;
  applyStatic();
  window.EVENTS_READY = true; // 3D 지형 모드(terrain.js)가 이것을 기다렸다가 조작기를 단다
  PERIODS = Object.fromEntries(d.periods.map(p => [p.id, p]));
  buildMap(); renderTrack();
  const fromHash = EVENTS.findIndex(e => '#' + e.id === location.hash);
  const fromLast = EVENTS.findIndex(e => e.id === state.last);
  idx = fromHash >= 0 ? fromHash : Math.max(0, fromLast);
  view = { x: 0, y: 0, w: W, h: H }; applyView();
  const start = idx; idx = -1; go(start);
  updateProgress();
  // 첫 시작 화면: 장면 주소로 바로 들어온 때(#e05)와 연출 확인(?beat=)은 건너뛴다
  if (fromHash < 0 && !new URLSearchParams(location.search).has('beat')) showIntro(fromLast > 0 ? fromLast : -1);
  $('.brand').onclick = ev => { ev.preventDefault(); showIntro(idx > 0 ? idx : -1); };

  $('#prev').onclick = () => go(idx - 1);
  $('#next').onclick = () => go(idx + 1);
  $('#skip').onclick = () => go(idx + 1);
  $('#listen').onclick = () => { if (speaking) stopSpeech(); else { stopAuto(); speakScene(); } };
  // stopSpeech가 스위치를 autoOn(=false)으로 되돌리므로 켠 상태를 먼저 읽어 둔다
  $('#auto').onchange = () => { const on = $('#auto').checked; stopSpeech(); if (on) startAuto(); };
  $('#music').hidden = !EVENTS.some(e => e.music);
  $('#music').onclick = () => { bgmPref = !bgmPref; try { localStorage.setItem(BGM.key, bgmPref ? 'on' : 'off'); } catch { /* 이번 방문만 */ } bgmFollow(); };
  $('#quizBtn').onclick = openSceneQuiz;
  $('#closeQuiz').onclick = () => $('#quizDlg').close();
  // 설정: 톱니바퀴를 누르면 언어·대조표·발자취
  const panel = $('#settingsPanel'), gear = $('#gear');
  const closePanel = () => { panel.hidden = true; gear.setAttribute('aria-expanded', 'false'); };
  gear.onclick = ev => { ev.stopPropagation(); panel.hidden = !panel.hidden; gear.setAttribute('aria-expanded', String(!panel.hidden)); };
  document.addEventListener('click', ev => { if (!panel.hidden && !panel.contains(ev.target)) closePanel(); });
  $('#openHarmony').onclick = () => { closePanel(); setView('harmony'); };
  $('#openStamps').onclick = () => { closePanel(); renderStamps(); $('#stamps').showModal(); };
  // 전체 경로는 켜고 끄는 단추: 다시 누르면 지금 장면으로 돌아온다
  $('#fitAll').onclick = () => {
    if (fitMode === 'all') { $('#fitNow').onclick(); return; }
    fitMode = 'all'; fitAll(); $('#fitAll').classList.add('active'); $('#fitNow').classList.remove('active');
  };
  $('#fitNow').onclick = () => { fitMode = 'scene'; if (!frameStage(idx, 900)) frame([EVENTS[idx].place], 900); $('#fitNow').classList.add('active'); $('#fitAll').classList.remove('active'); };
  $$('.tabs button').forEach(b => b.onclick = () => setView(b.dataset.view));
  $('#wordSearch').oninput = renderWords;
  $('#closeViewer').onclick = () => $('#viewer').close();
  $('#viewer').onclick = ev => { if (ev.target.id === 'viewer') $('#viewer').close(); };
  $('#progressPill').onclick = () => { renderStamps(); $('#stamps').showModal(); };
  $('#closeStamps').onclick = () => $('#stamps').close();
  $('#resetProgress').onclick = () => {
    if (!confirm(t('resetConfirm'))) return;
    visited.clear(); state.visited = []; state.quiz = {}; store.save(); markVisited(EVENTS[idx].id); renderStamps(); renderTrack(); updateTrack();
  };
  addEventListener('keydown', ev => {
    if ($('#journey').hidden || ev.target.matches('input, select, textarea') || document.querySelector('dialog[open]') || !$('#intro').hidden) return; // 시작 화면이 떠 있으면 뒤 여정을 움직이지 않는다
    if (ev.key === 'ArrowRight') go(idx + 1);
    if (ev.key === 'ArrowLeft') go(idx - 1);
  });
  addEventListener('hashchange', () => { const i = EVENTS.findIndex(e => '#' + e.id === location.hash); if (i >= 0 && i !== idx) go(i); });
}).catch(err => {
  $('#scene').innerHTML = `<p class="empty">${LANG === 'ko' ? '여정 데이터를 불러오지 못했습니다. 새로고침해 주세요.' : 'The journey data could not be loaded. Please refresh the page.'} (${esc(err.message)})</p>`;
});

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});

/* 그 길 순례 게임: 내 이름과 인형(순례자)을 꾸며, 지도 위를 걸어 예수님(모세·다윗·엘리야)이 계신 다음 장면을 찾아간다.
   길을 잃으면(목표에서 멀어지는 쪽으로 오래 걸으면) 모래바람, 바다로 들어가려 하면 물병을 잃는다. 물병이 다 떨어지면
   그 장면의 퀴즈를 맞혀야 다시 채워지고, 틀리면 이번 길의 처음으로 돌아간다 (사용자 2026-11).
   지도 바탕은 앱과 같은 음영 기복도(assets/relief*.webp), 인물은 3D 무대의 피규어(stage/people.js)를 그대로 쓴다.
   자료는 각 여정의 data(장면·장소·퀴즈·그림). 진행은 이 기기에만 기억한다(theway-game-<여정>, 꾸민 모습은 theway-game-me) */
import { THREE } from './stage/kit.js';
import { TYPES, SKIN, Actor } from './stage/people.js';

const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// 받침에 따라 조사를 고른다 (모세가·예수님이, 모세를·다윗을)
const josa = (w, a, b) => { const c = (w || '').charCodeAt(w.length - 1) - 0xac00; return w + (c >= 0 && c < 11172 && c % 28 ? a : b); };
const store = { get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* 사생활 보호 모드 */ } } };

/* ---------- 여정 ---------- */
// 지도 위를 걷는 여정만 (바울은 뱃길이 많아, 시편·잠언·GoodNews는 지도를 걷지 않아 뺀다)
const JOURNEYS = {
  jesus: { name: '예수님 따라가기', who: '예수님', data: 'data.json', leader: 'jesus', bases: ['main', 'west'] },
  moses: { name: '모세 따라가기', who: '모세', data: 'j/moses/data.json', leader: 'mosesE', bases: ['main', 'west', 'south'] },
  david: { name: '다윗 따라가기', who: '다윗', data: 'j/david/data.json', leader: 'davidW', bases: ['main', 'west'] },
  kings: { name: '엘리야와 두 왕국', who: '선지자', data: 'j/kings/data.json', leader: 'elijah', bases: ['meso', 'main', 'west', 'south'] },
};
// 음영 기복도가 덮는 범위 — app.js의 RELIEF*와 같게. 아래에 깔리는 것부터
const BASES = {
  meso: { src: 'assets/relief-meso.webp', lat0: 26.9, lat1: 37.6, lng0: 35.6, lng1: 46.2 },
  south: { src: 'assets/relief-south.webp', lat0: 27.2, lat1: 30.15, lng0: 31.25, lng1: 37.4 },
  west: { src: 'assets/relief-west.webp', lat0: 29.15, lat1: 31.9, lng0: 29.4, lng1: 33.25 },
  main: { src: 'assets/relief.webp', lat0: 29.15, lat1: 34.6, lng0: 33.0, lng1: 37.4 },
};
// 바다·호수 (app.js의 GEO와 같은 점들). 지중해는 해안선 바깥 전부
const COAST = [[33.62,35.40],[33.56,35.37],[33.45,35.29],[33.37,35.25],[33.27,35.19],[33.17,35.15],[33.09,35.10],[32.99,35.08],[32.92,35.07],[32.88,35.08],[32.84,35.06],[32.82,35.02],[32.83,34.96],[32.75,34.95],[32.69,34.93],[32.60,34.91],[32.50,34.89],[32.40,34.87],[32.30,34.84],[32.17,34.80],[32.05,34.75],[31.95,34.70],[31.80,34.63],[31.67,34.55],[31.58,34.49],[31.50,34.42],[31.40,34.35],[31.32,34.26],[31.25,34.18],[31.22,34.15]];
const SINAI = [[31.13, 33.8], [31.15, 33.1], [31.26, 32.3], [31.52, 31.85], [31.47, 30.4], [31.2, 29.9], [30.9, 28.5]];
const NORTH = [[37.5, 36.0], [36.6, 36.18], [36.4, 35.9], [36.08, 35.93], [35.85, 35.83], [35.52, 35.75], [35.2, 36.0], [34.2, 35.65], [33.9, 35.48]];
const WATERS = {
  sea: [...NORTH, ...COAST, ...SINAI, [30.9, 26], [37.5, 26]],
  galilee: [[32.885,35.555],[32.895,35.585],[32.888,35.625],[32.86,35.645],[32.82,35.652],[32.77,35.643],[32.73,35.615],[32.705,35.585],[32.72,35.565],[32.76,35.545],[32.80,35.525],[32.825,35.515],[32.85,35.52],[32.873,35.540]],
  dead: [[31.775,35.53],[31.77,35.58],[31.72,35.585],[31.60,35.575],[31.50,35.57],[31.40,35.555],[31.30,35.53],[31.20,35.51],[31.10,35.48],[31.05,35.44],[31.10,35.40],[31.20,35.395],[31.35,35.40],[31.50,35.44],[31.62,35.46],[31.72,35.47],[31.76,35.49]],
  hula: [[33.10,35.605],[33.09,35.625],[33.06,35.628],[33.045,35.612],[33.06,35.595],[33.085,35.595]],
  suez: [[29.97,32.53],[29.6,32.38],[29.0,32.62],[28.5,32.88],[28.0,33.3],[27.2,33.8],[27.2,34.25],[28.0,33.62],[28.5,33.22],[29.0,32.95],[29.6,32.72],[29.97,32.6]],
  aqaba: [[29.55,34.96],[29.3,34.9],[29.0,34.68],[28.5,34.48],[28.0,34.4],[27.2,34.3],[27.2,35.3],[28.0,34.62],[28.5,34.82],[29.0,34.88],[29.4,34.99]],
};

/* ---------- 좌표: 1단위 = 1km, 북쪽이 -z ---------- */
const LAT0 = 32, LNG0 = 35, KX = 111.32 * Math.cos(LAT0 * Math.PI / 180), KZ = 110.57;
const toXZ = (lat, lng) => [(lng - LNG0) * KX, (LAT0 - lat) * KZ];
const toLL = (x, z) => [LAT0 - z / KZ, LNG0 + x / KX];
const inPoly = (lat, lng, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [ai, bi] = poly[i], [aj, bj] = poly[j]; if ((ai > lat) !== (aj > lat) && lng < (bj - bi) * (lat - ai) / (aj - ai) + bi) c = !c; } return c; };

/* ---------- 순례자 꾸미기 ---------- */
const OPT = {
  sex: [['m', '형제'], ['f', '자매']],
  skin: SKIN.slice(0, 5),
  hair: ['#1d140c', '#3b2616', '#6b4a2a', '#a87a4a', '#d9d2c4'],
  beard: [[1, '있음'], [0, '없음']],
  robe: ['#e8e0cc', '#d9c49a', '#8b6f50', '#76855e', '#5a6b8a', '#6e5a7a', '#9d4a3a'],
  mantle: [null, '#a58a5c', '#4f6a7d', '#5d6b4a', '#7a3a2e', '#3c5d96', '#5a2a5e'],
  head: [['none', '없음'], ['hood', '두건'], ['turban', '터번'], ['veil', '베일']],
  staff: [[1, '들기'], [0, '빈손']],
};
const shade = (hex, k) => '#' + hex.slice(1).match(/../g).map(h => Math.round(parseInt(h, 16) * k).toString(16).padStart(2, '0')).join('');
let me = { name: '', sex: 'm', skin: 0, hair: '#3b2616', beard: 1, robe: '#d9c49a', mantle: '#4f6a7d', head: 'hood', staff: 1, ...store.get('theway-game-me', {}) };
// 꾸민 모습을 피규어 설정(TYPES.player)으로 — 예수님만 입는 흰 속옷·붉은 겉옷 짝은 고를 수 없게 색을 골라 두었다
function playerType() {
  const f = me.sex === 'f', mantle = me.mantle || (me.head === 'veil' ? '#a58a5c' : null);
  const t = { robe: me.robe, trim: shade(me.robe, .72), sash: shade(me.robe, .6), hair: me.hair, skin: me.skin, staff: !!me.staff };
  if (mantle) t.mantle = mantle;
  if (f) Object.assign(t, { soft: true, slim: true, long: me.head === 'none' });
  else if (me.beard) t.beard = true;
  if (me.head === 'hood') Object.assign(t, { hood: '#d8c9a6', band: shade(me.robe, .6) });
  if (me.head === 'turban') t.turban = '#e9dcc0';
  if (me.head === 'veil') Object.assign(t, { veil: true, inner: '#efe6d4' });
  TYPES.player = t;
}

/* ---------- 렌더러 ---------- */
function renderer(canvas) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true });
  r.setPixelRatio(Math.min(2, devicePixelRatio || 1));
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
  return r;
}
const lights = scene => {
  scene.add(new THREE.HemisphereLight(0xfff4dc, 0x8a7350, 1.6));
  const sun = new THREE.DirectionalLight(0xfff0d0, 2.2); sun.position.set(-3, 6, 4); scene.add(sun);
};

/* 미리보기: 꾸미는 동안 인형이 천천히 돈다 */
const pv = { r: renderer($('#preview')), scene: new THREE.Scene(), cam: new THREE.PerspectiveCamera(30, 1, 0.05, 20), actor: null };
lights(pv.scene);
pv.cam.position.set(0, 0.62, 2.4); pv.cam.lookAt(0, 0.48, 0);
const floor = new THREE.Mesh(new THREE.CircleGeometry(0.5, 48), new THREE.MeshStandardMaterial({ color: '#3a2e22', roughness: 1 }));
floor.rotation.x = -Math.PI / 2; pv.scene.add(floor);
function rebuildPreview() {
  playerType();
  if (pv.actor) pv.scene.remove(pv.actor.p.root);
  pv.actor = new Actor('player', 0, 0, 0, { gaze: false }); pv.actor.realWalk = true;
  pv.scene.add(pv.actor.p.root);
  $('#plate').textContent = me.name || '';
}
function setupUI() {
  for (const el of document.querySelectorAll('#setup [data-k]')) {
    const k = el.dataset.k, sw = el.classList.contains('sw');
    el.innerHTML = OPT[k].map((o, i) => sw
      ? `<button data-i="${i}" class="${o ? '' : 'none'}" style="${o ? `background:${o}` : ''}" aria-label="${k} ${i + 1}"></button>`
      : `<button data-i="${i}">${esc(o[1])}</button>`).join('');
    const val = i => sw ? (k === 'skin' ? i : OPT[k][i]) : OPT[k][i][0];
    const mark = () => el.querySelectorAll('button').forEach((b, i) => b.classList.toggle('on', val(i) === me[k]));
    el.onclick = e => { const b = e.target.closest('button'); if (!b) return; me[k] = val(+b.dataset.i); mark(); refresh(); };
    mark();
  }
  const refresh = () => {
    $('#setup [data-k=beard]').closest('.field').hidden = me.sex === 'f';
    store.set('theway-game-me', me); rebuildPreview();
  };
  $('#name').value = me.name;
  $('#name').oninput = () => { me.name = $('#name').value.trim(); $('#plate').textContent = me.name; store.set('theway-game-me', me); };
  // 여정 고르기
  const jp = document.createElement('div'); jp.className = 'field';
  jp.innerHTML = `<b>누구를 따라 걸을까요</b><div class="chips" id="jpick">${Object.entries(JOURNEYS).map(([k, j]) => `<button data-j="${k}">${esc(j.name)}</button>`).join('')}</div>`;
  $('#setup .lead').after(jp);
  const markJ = () => { document.querySelectorAll('#jpick button').forEach(b => b.classList.toggle('on', b.dataset.j === JID)); const s = store.get('theway-game-' + JID, null); $('#start').textContent = s?.idx ? `이어 걷기 (${s.idx + 1}번째 장면부터)` : '길 떠나기'; $('#restart').classList.toggle('hidden', !s?.idx); };
  $('#jpick').onclick = e => { const b = e.target.closest('button'); if (!b) return; JID = b.dataset.j; markJ(); };
  markJ();
  refresh();
  $('#start').onclick = () => begin(false);
  $('#restart').onclick = () => begin(true);
}
let JID = JOURNEYS[new URLSearchParams(location.search).get('j')] ? new URLSearchParams(location.search).get('j') : 'jesus';

/* ---------- 게임 세계 ---------- */
const G = {
  r: null, scene: new THREE.Scene(), cam: new THREE.PerspectiveCamera(42, 1, 0.5, 4000),
  data: null, events: [], idx: 0, me: null, leader: null, pillar: null,
  zoom: 46, walked: 0, total: 0, legStart: null, legWalked: 0, water: 3, stars: [],
  lostT: 0, prevD: 0, slowT: 0, coolT: 0, seaT: 0, legT: 0, busy: true, speed: 9,
};
const SCALE = 4.2; // 인형 크기 (지도 위에서 보이게 키운다)
const ARRIVE = 5;  // 이만큼(km) 다가가면 도착
const WALK = 30;   // 하루에 걷는 거리(km) — '몇 일째'

function waterMesh(poly, color) {
  const sh = new THREE.Shape(poly.map(([lat, lng]) => { const [x, z] = toXZ(lat, lng); return new THREE.Vector2(x, -z); }));
  const m = new THREE.Mesh(new THREE.ShapeGeometry(sh), new THREE.MeshStandardMaterial({ color, roughness: .35, metalness: .1, transparent: true, opacity: .92, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.y = 0.05; m.renderOrder = -5; return m;
}
function buildWorld(j) {
  const S = G.scene;
  S.background = new THREE.Color('#2a2218'); S.fog = new THREE.Fog('#2a2218', 260, 900);
  lights(S);
  const tl = new THREE.TextureLoader();
  j.bases.forEach((b, i) => {
    const B = BASES[b], [x0, z0] = toXZ(B.lat1, B.lng0), [x1, z1] = toXZ(B.lat0, B.lng1);
    const tex = tl.load(B.src); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = G.r.capabilities.getMaxAnisotropy();
    // 바탕끼리 겹치는 곳은 그리는 차례로 (깊이를 쓰지 않는다 — 0.01 차이로 겹쳐 두면 멀리서 깜박였다)
    const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), new THREE.MeshStandardMaterial({ map: tex, roughness: 1, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.position.set((x0 + x1) / 2, 0, (z0 + z1) / 2); m.renderOrder = i - 20;
    S.add(m);
  });
  for (const [k, p] of Object.entries(WATERS)) S.add(waterMesh(p, k === 'sea' || k === 'suez' || k === 'aqaba' ? '#4f7f99' : '#5f93ad'));
  // 목표를 알리는 빛기둥
  G.pillar = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 90, 24, 1, true),
    new THREE.MeshBasicMaterial({ color: '#ffdf9a', transparent: true, opacity: .22, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  S.add(G.pillar);
}
// 걸을 수 있는 곳: 음영 그림이 있는 땅이고 물이 아닌 곳 (목표 둘레는 물이어도 들어간다 — 홍해를 건너고 물 위를 걸으신 자리)
function blocked(x, z) {
  const [lat, lng] = toLL(x, z), J = JOURNEYS[JID];
  if (!J.bases.some(b => { const B = BASES[b]; return lat > B.lat0 + .02 && lat < B.lat1 - .02 && lng > B.lng0 + .02 && lng < B.lng1 - .02; })) return 'edge';
  const g = goalXZ();
  if (g && Math.hypot(x - g[0], z - g[1]) < ARRIVE * 2.2) return null;
  for (const [k, p] of Object.entries(WATERS)) if (inPoly(lat, lng, p)) return k;
  return null;
}
const placeOf = e => G.data.places[e.place];
const goalXZ = () => { const e = G.events[G.idx]; return e && toXZ(placeOf(e).lat, placeOf(e).lng); };

/* ---------- 입력: 방향키·WASD·조이스틱 ---------- */
const keys = new Set(), stick = { x: 0, y: 0 };
addEventListener('keydown', e => { if (e.target.tagName === 'INPUT') return; keys.add(e.key.toLowerCase()); if (e.key.startsWith('Arrow')) e.preventDefault(); });
addEventListener('keyup', e => keys.delete(e.key.toLowerCase()));
addEventListener('blur', () => keys.clear());
(() => {
  const el = $('#stick'), knob = el.querySelector('i'); let id = null;
  const move = e => { const r = el.getBoundingClientRect(), R = r.width / 2; let dx = e.clientX - r.left - R, dy = e.clientY - r.top - R; const d = Math.hypot(dx, dy); if (d > R) { dx *= R / d; dy *= R / d; } stick.x = dx / R; stick.y = dy / R; knob.style.transform = `translate(${dx}px,${dy}px)`; };
  el.addEventListener('pointerdown', e => { id = e.pointerId; el.setPointerCapture(id); move(e); });
  el.addEventListener('pointermove', e => { if (e.pointerId === id) move(e); });
  const up = e => { if (e.pointerId !== id) return; id = null; stick.x = stick.y = 0; knob.style.transform = ''; };
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
})();
function inputDir() {
  let x = stick.x, z = stick.y;
  if (keys.has('arrowleft') || keys.has('a')) x -= 1;
  if (keys.has('arrowright') || keys.has('d')) x += 1;
  if (keys.has('arrowup') || keys.has('w')) z -= 1;
  if (keys.has('arrowdown') || keys.has('s')) z += 1;
  const d = Math.hypot(x, z);
  return d < 0.15 ? null : [x / Math.max(1, d), z / Math.max(1, d)];
}
const setZoom = k => { G.zoom = Math.min(170, Math.max(16, G.zoom * k)); };
$('#zin').onclick = () => setZoom(1 / 1.35); $('#zout').onclick = () => setZoom(1.35);
addEventListener('wheel', e => { if (G.me && $('#sheet').classList.contains('hidden')) setZoom(e.deltaY > 0 ? 1.12 : 1 / 1.12); }, { passive: true });

/* ---------- 알림·벌칙 ---------- */
let toastT = 0;
function toast(html, good = false, ms = 2600) {
  const t = $('#toast'); t.innerHTML = html; t.classList.toggle('good', good); t.classList.add('on');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), ms);
}
function drawWater() { $('#water').innerHTML = [0, 1, 2].map(i => `<i class="${i < G.water ? '' : 'empty'}"></i>`).join(''); }
const LOST = ['모래바람이 불어와 길을 잃었어요!', '광야에서 방향을 잃었어요!', '엉뚱한 길로 너무 멀리 왔어요!'];
function penalty(kind) {
  if (G.coolT > 0 || G.busy) return;
  G.coolT = 3.5; G.lostT = 0;
  G.water = Math.max(0, G.water - 1); drawWater();
  document.body.classList.remove('shake'); void document.body.offsetWidth; document.body.classList.add('shake');
  if (kind === 'lost') {
    G.slowT = 4; $('#dust').classList.add('on'); setTimeout(() => $('#dust').classList.remove('on'), 3200);
    toast(`${LOST[Math.floor(Math.random() * LOST.length)]}<small>물병 하나를 잃고 잠시 느려집니다 · 빛기둥 쪽으로 가세요</small>`);
  } else {
    const msg = kind === 'dead' ? '사해에 빠질 뻔했어요! 소금물이에요' : kind === 'galilee' ? '갈릴리 바다는 걸어서 못 건너요' : '바다는 걸어서 못 건너요';
    toast(`${msg}<small>물병 하나를 잃었습니다 · 물가를 따라 돌아가세요</small>`);
  }
  if (G.water === 0) setTimeout(quiz, 1400);
}

/* ---------- 장면 카드·퀴즈 ---------- */
const sheet = html => { const s = $('#sheet'); s.innerHTML = `<div class="card">${html}</div>`; s.classList.remove('hidden'); G.busy = true; return s; };
const closeSheet = () => { $('#sheet').classList.add('hidden'); G.busy = false; };
const firstSentences = (t, n = 2) => (t.match(/[^.!?。]+[.!?。]+["”’]?/g) || [t]).slice(0, n).join(' ').trim();
const appLink = e => `${JID === 'jesus' ? 'app.html' : `app.html?j=${JID}`}#${e.id}`;
function quiz() {
  const e = G.events[G.idx], q = e.quiz;
  if (!q) { G.water = 3; drawWater(); return; }
  const s = sheet(`<div class="body quiz"><small>물병이 다 떨어졌어요 · 말씀으로 다시 채우기</small><h2>${esc(q.q)}</h2><div class="opts">${q.options.map((o, i) => `<button data-i="${i}">${esc(o)}</button>`).join('')}</div><div class="explain"></div></div>`);
  s.querySelector('.opts').onclick = ev => {
    const b = ev.target.closest('button'); if (!b || s.querySelector('.right')) return;
    const ok = +b.dataset.i === q.answer;
    s.querySelectorAll('.opts button').forEach((x, i) => { if (i === q.answer) x.classList.add('right'); else if (x === b) x.classList.add('wrong'); });
    s.querySelector('.explain').innerHTML = `${esc(q.explain || '')}<button class="go">${ok ? '물병을 채우고 계속 걷기' : '이번 길의 처음으로 돌아가기'}</button>`;
    s.querySelector('.explain .go').onclick = () => {
      G.water = 3; drawWater(); closeSheet();
      if (ok) toast('맞았어요! 물병 셋이 다시 찼습니다', true);
      else { const [x, z] = G.legStart; G.me.pos.set(x, z); G.me.goal.set(x, z); G.legWalked = 0; toast('이번 길의 처음에서 다시 출발합니다', true); }
    };
  };
}
function arrive() {
  const e = G.events[G.idx], straight = G.legStraight, ratio = straight > 1 ? G.legWalked / straight : 1;
  const stars = straight < ARRIVE * 1.5 ? 3 : ratio < 1.35 ? 3 : ratio < 1.9 ? 2 : 1;
  G.stars[G.idx] = Math.max(G.stars[G.idx] || 0, stars);
  G.leader.set('speak'); G.leader.look(0);
  const w = (e.words || []).find(x => x.j) || (e.words || [])[0];
  const s = sheet(`${e.img ? `<div class="img" style="background-image:url('${esc(e.img.src)}')"><span class="stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</span></div>` : ''}
    <div class="body"><small>${G.idx + 1} / ${G.events.length} · ${esc(placeOf(e).name)}</small><h2>${esc(e.title)}</h2><p class="sub">${esc(e.subtitle || '')}</p>
    ${straight >= ARRIVE * 1.5 ? `<div class="leg"><span>걸은 길 <b>${Math.round(G.legWalked)}km</b></span><span>곧은 길 ${Math.round(straight)}km</span><span>${'★'.repeat(stars)}</span></div>` : ''}
    <p class="story">${esc(firstSentences(e.story?.[0] || ''))}</p>
    ${w ? `<blockquote>${esc(w.text)}<cite>${esc(w.who || '')} · ${esc(w.ref || '')}</cite></blockquote>` : ''}
    <div class="row"><a class="go ghost" href="${appLink(e)}" target="_blank" rel="noopener">이 장면 듣기</a><button class="go" id="next">${G.idx + 1 < G.events.length ? '다음 장면으로 →' : '여정 마치기'}</button></div></div>`);
  s.querySelector('#next').onclick = () => { closeSheet(); G.idx++; save(); G.idx < G.events.length ? startLeg() : finish(); };
}
function finish() {
  const n = G.events.length, st = G.stars.reduce((a, b) => a + (b || 0), 0), km = Math.round(G.total), J = JOURNEYS[JID];
  const text = `그 길 순례 — ${me.name || '순례자'}, ${josa(J.who, '을', '를')} 따라 ${n}장면 ${km}km를 걸었습니다 ★${st}/${n * 3}\nhttps://thewaymap.org/game.html?j=${JID}`;
  const s = sheet(`<div class="body"><small>${esc(J.name)}</small><h2>여정을 마쳤습니다</h2><p class="sub">${esc(me.name || '순례자')}님, ${n}장면을 모두 찾아 걸었어요.</p>
    <div class="leg"><span>걸은 길 <b>${km}km</b></span><span><b>${Math.floor(G.total / WALK) + 1}</b>일</span><span>★ <b>${st}</b>/${n * 3}</span></div>
    <div class="row"><button class="go ghost" id="share">자랑하기</button><button class="go" id="again">다른 여정 걷기</button></div></div>`);
  s.querySelector('#share').onclick = async () => { try { if (navigator.share) await navigator.share({ text }); else { await navigator.clipboard.writeText(text); toast('복사했어요', true); } } catch { /* 닫음 */ } };
  s.querySelector('#again').onclick = () => { store.set('theway-game-' + JID, null); location.href = `game.html?j=${JID}`; };
}
const save = () => store.set('theway-game-' + JID, { idx: G.idx, total: G.total, stars: G.stars });

/* ---------- 한 구간 ---------- */
function startLeg() {
  const e = G.events[G.idx], [gx, gz] = goalXZ();
  G.leader.pos.set(gx + 0.6, gz); G.leader.goal.copy(G.leader.pos); G.leader.set('idle');
  G.pillar.position.set(gx, 45, gz);
  G.legStart = [G.me.pos.x, G.me.pos.y]; G.legWalked = 0; G.legT = 0; G.lostT = 0;
  G.legStraight = Math.hypot(gx - G.me.pos.x, gz - G.me.pos.y);
  G.prevD = G.legStraight;
  G.speed = Math.max(9, G.legStraight / 16); // 먼 길(바벨론 포로길 등)도 20초 남짓에 걷게
  $('#mNo').textContent = `${G.idx + 1} / ${G.events.length} · ${josa(JOURNEYS[JID].who, '이', '가')} 계신 곳`;
  $('#mTitle').textContent = `${placeOf(e).name} — ${e.title}`;
  G.busy = false;
  if (G.legStraight < ARRIVE) { G.busy = true; setTimeout(arrive, 700); } // 같은 자리에서 이어지는 장면
}

async function begin(fresh) {
  me.name = $('#name').value.trim() || '순례자'; store.set('theway-game-me', me);
  if (fresh) store.set('theway-game-' + JID, null);
  const J = JOURNEYS[JID];
  G.data = await (await fetch(J.data)).json();
  G.events = G.data.events.filter(e => G.data.places[e.place] && !G.data.places[e.place].hidden);
  const saved = store.get('theway-game-' + JID, null);
  G.idx = saved?.idx || 0; G.total = saved?.total || 0; G.stars = saved?.stars || [];
  $('#setup').classList.add('hidden');
  for (const s of ['#hud', '#waterBox', '#dayBox', '#arrow', '#stick', '#zoom']) $(s).classList.remove('hidden');
  G.r = renderer($('#world'));
  buildWorld(J);
  playerType();
  // 출발: 처음이면 첫 장면에서 조금 떨어진 곳, 이어 걷기면 앞 장면 자리
  const ref = G.events[Math.max(0, G.idx - 1)], [rx, rz] = toXZ(placeOf(ref).lat, placeOf(ref).lng);
  let sx = rx, sz = rz;
  if (G.idx === 0) for (const [dx, dz] of [[0, 22], [16, 16], [-16, 16], [20, 0], [-20, 0], [0, -22]]) if (!blocked(rx + dx, rz + dz)) { sx = rx + dx; sz = rz + dz; break; }
  G.me = new Actor('player', sx, sz, 0, { gaze: false }); G.me.realWalk = true; G.me.big = SCALE;
  G.leader = new Actor(J.leader, 0, 0, 0, { gaze: false }); G.leader.realWalk = true; G.leader.big = SCALE; G.leader.target = G.me;
  G.scene.add(G.me.p.root, G.leader.p.root);
  drawWater(); resize(); startLeg();
  if (G.idx === 0) toast(`${esc(me.name)}님, ${esc(josa(J.who, '을', '를'))} 따라 걸어요<small>빛기둥이 서 있는 곳으로 · 조이스틱이나 방향키로 움직입니다</small>`, true, 4200);
}

/* ---------- 이름표·화살표 ---------- */
const tags = $('#tags'), v3 = new THREE.Vector3();
const screen = (x, y, z) => { v3.set(x, y, z).project(G.cam); return [(v3.x + 1) / 2 * innerWidth, (1 - v3.y) / 2 * innerHeight, v3.z < 1]; };
let tagEls = [];
function drawTags() {
  const list = [];
  const [gx, gz] = goalXZ() || [0, 0], e = G.events[G.idx];
  list.push({ cls: 'me', text: me.name, pos: [G.me.pos.x, SCALE * 1.15, G.me.pos.y] });
  if (e) list.push({ cls: 'goal', text: placeOf(e).name, pos: [gx, SCALE * 1.25, gz] });
  // 둘레의 다른 장소 이름 (여정에 나오는 곳만, 가까운 순서로 몇 개)
  const seen = new Set([e?.place]), near = [];
  for (const ev of G.events) { if (seen.has(ev.place)) continue; seen.add(ev.place); const p = placeOf(ev), [x, z] = toXZ(p.lat, p.lng); const d = Math.hypot(x - G.me.pos.x, z - G.me.pos.y); if (d < G.zoom * 1.6) near.push({ d, cls: 'place', text: p.name, pos: [x, 0.3, z] }); }
  near.sort((a, b) => a.d - b.d).slice(0, 8).forEach(t => list.push(t));
  while (tagEls.length < list.length) { const d = document.createElement('div'); tags.append(d); tagEls.push(d); }
  tagEls.forEach((el, i) => {
    const t = list[i]; if (!t) { el.hidden = true; return; }
    const [x, y, ok] = screen(...t.pos); el.hidden = !ok || x < -50 || y < -20 || x > innerWidth + 50 || y > innerHeight + 20;
    el.className = 'tag ' + t.cls; el.textContent = t.text; el.style.left = x + 'px'; el.style.top = y + 'px';
  });
  // 화살표: 내 둘레 원 위에서 목표 쪽을 가리킨다
  const [mx, my] = screen(G.me.pos.x, SCALE * .5, G.me.pos.y), [tx, ty] = screen(gx, 0, gz), a = Math.atan2(ty - my, tx - mx);
  const near2 = Math.hypot(gx - G.me.pos.x, gz - G.me.pos.y) < ARRIVE * 2.5;
  const ar = $('#arrow'); ar.style.opacity = near2 || G.busy ? 0 : 1;
  ar.style.left = mx + Math.cos(a) * 78 + 'px'; ar.style.top = my + Math.sin(a) * 78 + 'px'; ar.style.transform = `rotate(${a + Math.PI / 2}rad)`;
}

/* ---------- 매 화면 ---------- */
function resize() {
  for (const [r, c, el] of [[G.r, G.cam, $('#world')], [pv.r, pv.cam, $('#preview')]]) {
    if (!r) continue;
    const w = el.clientWidth, h = el.clientHeight; if (!w || !h) continue;
    r.setSize(w, h, false); c.aspect = w / h; c.updateProjectionMatrix();
  }
}
addEventListener('resize', resize);
let last = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000); last = now; const t = now / 1000;
  if (!$('#setup').classList.contains('hidden')) {
    if (pv.actor) { pv.actor.update(t, dt); pv.actor.p.root.rotation.y = t * 0.6; }
    pv.r.render(pv.scene, pv.cam); return;
  }
  if (!G.me) return;
  G.coolT -= dt; G.slowT -= dt; G.legT += dt;
  const dir = !G.busy && inputDir(), me0 = G.me;
  if (dir) {
    const sp = G.speed * (G.slowT > 0 ? 0.45 : 1), step = sp * dt;
    let nx = me0.pos.x + dir[0] * step, nz = me0.pos.y + dir[1] * step, hit = blocked(nx, nz);
    if (hit) { // 물가에서는 옆으로 미끄러져 따라가게
      if (!blocked(nx, me0.pos.y)) { nz = me0.pos.y; hit = null; } else if (!blocked(me0.pos.x, nz)) { nx = me0.pos.x; hit = null; }
    }
    if (hit) { me0.goal.copy(me0.pos); if (hit !== 'edge') { G.seaT += dt; if (G.seaT > 0.5 && G.legT > 1.5) { G.seaT = 0; penalty(hit); } } }
    else {
      G.seaT = 0;
      const moved = Math.hypot(nx - me0.pos.x, nz - me0.pos.y);
      me0.speed = sp; me0.goal.set(me0.pos.x + (nx - me0.pos.x) * 2, me0.pos.y + (nz - me0.pos.y) * 2);
      G.legWalked += moved; G.total += moved;
      // 길 잃음: 목표에서 멀어지는 쪽으로 오래 걸으면
      const [gx, gz] = goalXZ(), d = Math.hypot(gx - nx, gz - nz);
      if (d > G.prevD + 1e-3) G.lostT += dt; else G.lostT = Math.max(0, G.lostT - dt * 1.5);
      G.prevD = d;
      if (G.lostT > 3.2 && G.legT > 2) penalty('lost');
      if (d < ARRIVE) { G.busy = true; me0.goal.copy(me0.pos); save(); setTimeout(arrive, 350); }
    }
  } else me0.goal.copy(me0.pos);
  me0.update(t, dt); G.leader.update(t, dt);
  G.pillar.material.opacity = 0.16 + Math.sin(t * 2) * 0.06;
  // 카메라: 북쪽이 위, 비스듬히 내려다보며 따라간다
  const cx = me0.pos.x, cz = me0.pos.y, h = G.zoom;
  G.cam.position.lerp(v3.set(cx, h, cz + h * 0.78), 1 - Math.exp(-dt * 5));
  G.cam.lookAt(G.cam.position.x, 0, G.cam.position.z - h * 0.78);
  const [gx, gz] = goalXZ() || [cx, cz];
  $('#mDist').textContent = `남은 길 ${Math.round(Math.hypot(gx - cx, gz - cz))}km`;
  $('#mWalk').textContent = `걸은 길 ${Math.round(G.total)}km`;
  $('#days').textContent = Math.floor(G.total / WALK) + 1;
  G.r.render(G.scene, G.cam);
  drawTags();
}

setupUI(); resize();
requestAnimationFrame(frame);

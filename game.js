/* 그 길 순례 게임: 내 이름과 인형(순례자)을 꾸며, 지도 위를 걸어 예수님(모세·다윗·엘리야)이 계신 다음 장면을 찾아간다.
   길을 잃으면(목표에서 멀어지는 쪽으로 오래 걸으면) 모래바람, 바다로 들어가려 하면 물병을 잃는다. 물병이 다 떨어지면
   그 장면의 퀴즈를 맞혀야 다시 채워지고, 틀리면 이번 길의 처음으로 돌아간다 (사용자 2026-11).
   지도 바탕은 앱과 같은 음영 기복도(assets/relief*.webp), 인물은 3D 무대의 피규어(stage/people.js)를 그대로 쓴다.
   자료는 각 여정의 data(장면·장소·퀴즈·그림). 진행은 이 기기에만 기억한다(theway-game-<여정>, 꾸민 모습은 theway-game-me) */
import { THREE } from './stage/kit.js';
import { TYPES, SKIN, Actor } from './stage/people.js';
import { createWorld, LAKE_LEVEL } from './game-world.js';
import { makeProp } from './stage/props.js';

const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// 받침에 따라 조사를 고른다 (모세가·예수님이, 모세를·다윗을)
const josa = (w, a, b) => { const c = (w || '').charCodeAt(w.length - 1) - 0xac00; return w + (c >= 0 && c < 11172 && c % 28 ? a : b); };
const store = { get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* 사생활 보호 모드 */ } } };

/* ---------- 여정 ---------- */
// 지도 위를 걷는 여정만 (바울은 뱃길이 많아, 시편·잠언·GoodNews는 지도를 걷지 않아 뺀다)
const JOURNEYS = {
  jesus: { name: '예수님 따라가기', who: '예수님', data: 'data.json', leader: 'jesus', bases: ['main', 'west'], terrain: ['galilee', 'judea', 'shephelah', 'carmel', 'egypt'] },
  moses: { name: '모세 따라가기', who: '모세', data: 'j/moses/data.json', leader: 'mosesE', bases: ['main', 'west', 'south'], terrain: ['galilee', 'judea', 'shephelah', 'carmel', 'egypt', 'sinai', 'negev'] },
  david: { name: '다윗 따라가기', who: '다윗', data: 'j/david/data.json', leader: 'davidW', bases: ['main', 'west'], terrain: ['galilee', 'judea', 'shephelah', 'carmel'] },
  kings: { name: '엘리야와 두 왕국', who: '선지자', data: 'j/kings/data.json', leader: 'elijah', bases: ['meso', 'main', 'west', 'south'], terrain: ['galilee', 'judea', 'shephelah', 'carmel', 'sinai', 'negev'] },
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
  // 게임을 시작하지 않고도 고른 여정의 카드 모음을 본다 (사용자 2026-11)
  $('#seeCards').onclick = async () => { await loadJourney(); openCards(); };
  $('#restart').onclick = () => begin(true);
}
let JID = JOURNEYS[new URLSearchParams(location.search).get('j')] ? new URLSearchParams(location.search).get('j') : 'jesus';

/* ---------- 게임 세계 ---------- */
const G = {
  r: null, scene: new THREE.Scene(), cam: new THREE.PerspectiveCamera(42, 1, 0.5, 4000),
  data: null, events: [], idx: 0, me: null, leader: null, pillar: null,
  zoom: 46, walked: 0, total: 0, legStart: null, legWalked: 0, water: 3, stars: [],
  lostT: 0, prevD: 0, slowT: 0, coolT: 0, seaT: 0, legT: 0, busy: true, speed: 9, timeT: 0, timeMax: 0, meetT: 0, missed: [], askT: 0, asks: 0,
};
G.camLook = new THREE.Vector3();
// 그 자리의 땅 높이 (입체 땅, game-world.js) — 이름표·빛기둥을 땅 위에
const GH = (x, z) => Math.max(0, G.world?.heightAt(x, z) || 0);
const SCALE = 4.2; // 인형 크기 (지도 위에서 보이게 키운다)
const ARRIVE = 5;
const SEE = 7;
const PILLAR = 18; // 빛기둥은 이만큼(km) 안에 와야 보인다
const ASK = 50;    // '길 묻기' 한 번에 깎이는 카드 점수     // 이만큼 다가가야 그분이 보인다  // 이만큼(km) 다가가면 도착
const WALK = 30;   // 하루에 걷는 거리(km) — '몇 일째'

function waterMesh(poly, color) {
  const sh = new THREE.Shape(poly.map(([lat, lng]) => { const [x, z] = toXZ(lat, lng); return new THREE.Vector2(x, -z); }));
  const m = new THREE.Mesh(new THREE.ShapeGeometry(sh), new THREE.MeshStandardMaterial({ color, roughness: .35, metalness: .1, transparent: true, opacity: .92, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.y = 0.05; m.renderOrder = 5; return m; // 입체 땅보다 나중에 (솟은 땅이 물을 가린다)
}
function buildWorld(j) {
  const S = G.scene;
  S.background = new THREE.Color('#2a2218'); S.fog = new THREE.Fog('#2a2218', 260, 900);
  const tl = new THREE.TextureLoader();
  j.bases.forEach((b, i) => {
    const B = BASES[b], [x0, z0] = toXZ(B.lat1, B.lng0), [x1, z1] = toXZ(B.lat0, B.lng1);
    const tex = tl.load(B.src); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = G.r.capabilities.getMaxAnisotropy();
    // 바탕끼리 겹치는 곳은 그리는 차례로 (깊이를 쓰지 않는다 — 0.01 차이로 겹쳐 두면 멀리서 깜박였다)
    const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), new THREE.MeshStandardMaterial({ map: tex, roughness: 1, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.position.set((x0 + x1) / 2, 0, (z0 + z1) / 2); m.renderOrder = i - 20;
    S.add(m);
  });
  for (const [k, p] of Object.entries(WATERS)) { const w = waterMesh(p, k === 'sea' || k === 'suez' || k === 'aqaba' ? '#4f7f99' : '#5f93ad'); w.position.y = LAKE_LEVEL[k] ?? 0.05; S.add(w); }
  G.world = createWorld({ scene: S, renderer: G.r, toXZ, regions: j.terrain, places: G.data.places, journeyId: JID });
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
  for (const [k, p] of Object.entries(WATERS)) if (k !== 'galilee' && inPoly(lat, lng, p)) return k; // 갈릴리 바다는 배를 타고 건넌다
  return null;
}
const onGalilee = (x, z) => { const [lat, lng] = toLL(x, z); return inPoly(lat, lng, WATERS.galilee); };

/* ---------- 길 위의 사건 (사용자 2026-11) ----------
   우물: 들르면 물병이 찬다. 유혹하는 뱀: 길 한가운데서 '지름길'로 꾄다 — 닿으면 물려 물병을 잃고, 지나치면 '시험을 이긴 카드'.
   로마 병정: 큰 성읍 둘레를 순찰 — 마주치면 검문으로 잠시 멈춘다. 길가에 쓰러진 사람: 곁에 멈춰 서면 도와 점수를 더 얻는다(시간은 쓴다).
   갈릴리 바다: 배를 타고 건넌다(조금 느리게) */
const TEMPT = [['사람이 떡으로만 살 것이 아니요 하나님의 입에서 나오는 모든 말씀으로 살 것이다.', '마 4:4'], ['주 너의 하나님을 시험하지 마라.', '마 4:7'],
  ['주 너의 하나님께 경배하고 다만 그분만 섬겨라.', '마 4:10'], ['마귀를 대적하라. 그러면 너희를 피할 것이다.', '약 4:7'], ['하나님은 감당하지 못할 시험 당함을 허락하지 않으신다. 피할 길을 내신다.', '고전 10:13']];
const temptKey = () => 'theway-game-tempt-' + JID;
function spawnLegEvents() {
  for (const k of ['serpent', 'wounded']) if (G[k]) { G.scene.remove(G[k].obj || G[k].a.p.root); G[k] = null; }
  const [gx, gz] = goalXZ(), [sx, sz] = [G.me.pos.x, G.me.pos.y], L = G.legStraight;
  if (L < 25) return;
  const at = (f, off) => { const dx = (gx - sx) / L, dz = (gz - sz) / L; return [sx + (gx - sx) * f - dz * off, sz + (gz - sz) * f + dx * off]; };
  if (Math.random() < 0.6) { // 뱀: 곧은 길 한가운데 가까이
    const [x, z] = at(0.4 + Math.random() * 0.15, (Math.random() - 0.5) * 3);
    if (!blocked(x, z)) { const P = makeProp('serpent', x, z, { scale: SCALE * 4 }); P.obj.position.y = GH(x, z); G.scene.add(P.obj); G.serpent = { obj: P.obj, x, z, warned: false, done: false, d0: Math.hypot(gx - x, gz - z) }; }
  }
  if (Math.random() < 0.4) { // 쓰러진 사람: 길 가장자리
    const [x, z] = at(0.6 + Math.random() * 0.2, (Math.random() < 0.5 ? -1 : 1) * 2.5);
    if (!blocked(x, z)) { const a = new Actor('man', x, z, 0, { gaze: false }); a.big = SCALE; a.set('sleep'); a.realWalk = true; G.scene.add(a.p.root); G.wounded = { a, x, z, still: 0, helped: false, told: false }; }
  }
}
function spawnPatrols() {
  // 큰 성읍(예루살렘·가버나움·여리고·가이사랴 등) 둘레를 둘씩 오가는 로마 병정
  G.patrols = [];
  const big = Object.values(G.data.places).filter(p => !p.hidden && /예루살렘|가버나움|여리고|가이사랴|사마리아|세겜|헤브론/.test(p.name)).slice(0, 5);
  for (const p of big) {
    const [x0, z0] = toXZ(p.lat, p.lng), a = Math.random() * 6.28, A = [x0 + Math.cos(a) * 9, z0 + Math.sin(a) * 9], B = [x0 - Math.cos(a) * 9, z0 - Math.sin(a) * 9];
    for (let i = 0; i < 2; i++) { const s = new Actor('soldier', A[0] + i * 1.5, A[1], 0, { gaze: false }); s.big = SCALE; s.realWalk = true; s.speed = 2.2; G.scene.add(s.p.root); G.patrols.push({ s, A, B, to: 1, off: i * 1.5 }); }
  }
}
function updateEvents(dt, me0) {
  const px = me0.pos.x, pz = me0.pos.y, [gx, gz] = goalXZ();
  // 우물
  for (const [wx, wz] of G.world?.wells || []) if (Math.hypot(wx - px, wz - pz) < 4 && G.water < 3 && !(G.wellT > 0)) { G.water = 3; drawWater(); G.wellT = 12; toast('우물에서 물을 길었어요<small>물병 셋이 다시 찼습니다</small>', true); }
  G.wellT -= dt;
  // 뱀
  const S = G.serpent;
  if (S && !S.done) {
    const d = Math.hypot(S.x - px, S.z - pz);
    S.obj.rotation.y += dt * 0.8;
    if (!S.warned && d < 12) { S.warned = true; G.lureT = 4.5; const ang = Math.atan2(gz - pz, gx - px) + (Math.random() < 0.5 ? 1.9 : -1.9); G.lureA = ang; toast('뱀이 속삭여요: "이쪽이 지름길이야…"<small>빨간 화살표는 유혹이에요 · 뱀에게 닿지 말고 지나가세요</small>', false, 3800); }
    if (d < 2.6) { S.done = true; G.scene.remove(S.obj); G.coolT = 0; penalty('serpent'); }
    else if (S.warned && Math.hypot(gx - px, gz - pz) < S.d0 - 6) { // 뱀을 지나쳤다
      S.done = true; G.scene.remove(S.obj);
      const n = (store.get(temptKey(), 0) || 0) + 1; store.set(temptKey(), n);
      const [t, r] = TEMPT[(n - 1) % TEMPT.length];
      G.bonus += 50; toast(`시험을 이겼어요! +50점<small>"${esc(t)}" (${r}) · 시험을 이긴 카드 ${n}장</small>`, true, 4200); drawCardBtn();
    }
  }
  G.lureT -= dt;
  // 쓰러진 사람
  const W = G.wounded;
  if (W && !W.helped) {
    const d = Math.hypot(W.x - px, W.z - pz); W.a.ground = GH(W.x, W.z);
    if (d < 5 && !W.told) { W.told = true; toast('길가에 강도 만난 사람이 쓰러져 있어요<small>곁에 멈춰 서 있으면 도울 수 있어요 (시간이 들어요)</small>', false, 3600); }
    if (d < 5 && !inputDir()) W.still += dt; else W.still = Math.max(0, W.still - dt);
    if (W.still > 2.2) { W.helped = true; W.a.set('idle'); G.bonus += 100; toast('가서 너도 이와 같이 하라 (눅 10:37)<small>쓰러진 이를 도왔어요 · 이 장면 카드 +100점</small>', true, 4000); }
  }
  // 로마 병정
  for (const P of G.patrols || []) {
    const T = P.to ? P.B : P.A; P.s.moveTo(T[0] + P.off, T[1]); P.s.ground = GH(P.s.pos.x, P.s.pos.y);
    if (Math.hypot(P.s.pos.x - T[0] - P.off, P.s.pos.y - T[1]) < 0.4) P.to = 1 - P.to;
    P.s.showT = Math.hypot(P.s.pos.x - px, P.s.pos.y - pz) < 40 ? 1 : 0;
    if (Math.hypot(P.s.pos.x - px, P.s.pos.y - pz) < 2.4 && !(G.checkT > -3)) { G.checkT = 2.8; toast('로마 병정에게 붙잡혔어요!<small>검문을 받느라 잠시 멈춥니다 · 병정을 피해 다니세요</small>', false, 2800); }
  }
  G.checkT -= dt;
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
$('#ask').onclick = () => {
  if (G.busy || !G.me) return;
  if (!G.named) { G.named = true; G.asks += 0.6; missionText(); toast(`${esc(placeOf(G.events[G.idx]).name)}(으)로 가세요<small>지도에서 이름을 찾아보세요 · 이 장면 카드 점수가 ${ASK * 0.6}점 줄어요</small>`, true, 3000); return; }
  G.asks++; G.askT = 5; toast(`이쪽으로 가세요<small>이 장면 카드 점수가 ${ASK}점 줄어요</small>`, true, 2200);
};
// 나가기: 언제든 (진행은 마지막으로 만난 장면까지 저장되어 있어 '이어 걷기'로 돌아온다 — 사용자 2026-11)
$('#quit').onclick = () => {
  const was = G.busy, s = sheet(`<div class="body"><small>${esc(JOURNEYS[JID].name)}</small><h2>잠깐 쉬어 갈까요?</h2>
    <p class="sub">${G.idx + 1}번째 장면을 찾아가는 중이에요. 나가도 지금까지 만난 장면과 카드는 그대로 남고, 다음에 이어 걸을 수 있어요.</p>
    <div class="row"><button class="go ghost" id="qCards">말씀 카드</button><button class="go ghost" id="qHome">처음 화면</button></div>
    <div class="row"><a class="go ghost" href="${JID === 'jesus' ? 'app.html' : 'app.html?j=' + JID}">그 길 앱으로</a><button class="go" id="qBack">계속 걷기</button></div></div>`);
  s.querySelector('#qBack').onclick = () => { closeSheet(); G.busy = was; };
  s.querySelector('#qCards').onclick = () => openCards();
  s.querySelector('#qHome').onclick = () => { location.href = `game.html?j=${JID}`; };
};
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
    const msg = kind === 'serpent' ? '뱀에게 물렸어요! 유혹을 따라가면 안 돼요' : kind === 'dead' ? '사해에 빠질 뻔했어요! 소금물이에요' : kind === 'galilee' ? '갈릴리 바다는 걸어서 못 건너요' : '바다는 걸어서 못 건너요';
    toast(`${msg}<small>물병 하나를 잃었습니다 · 물가를 따라 돌아가세요</small>`);
  }
  if (G.water === 0) setTimeout(quiz, 1400);
}

/* ---------- 장면 카드·퀴즈 ---------- */
const sheet = html => { const s = $('#sheet'); s.innerHTML = `<div class="card">${html}</div>`; s.classList.remove('hidden'); G.busy = true; return s; };
const closeSheet = () => { $('#sheet').classList.add('hidden'); G.busy = false; };
// '이 장면 듣기': 새 창 대신 게임 위에 앱을 덮어 띄운다 — 새 창은 닫아야 게임으로 돌아와 번거로웠다(사용자 2026-11)
document.addEventListener('click', ev => {
  const a = ev.target.closest('a[data-listen]'); if (!a) return;
  ev.preventDefault();
  const id = a.getAttribute('href').split('#')[1]; // 한 장면만 보기(?one): 버튼 없이 연출만, 끝나면 저절로 닫힌다
  const v = $('#listen'); v.querySelector('iframe').src = `app.html?j=${JID}&one&lang=ko#${id}`; v.classList.remove('hidden');
});
addEventListener('message', ev => { if (ev.origin === location.origin && ev.data === 'theway-one-done') $('#listenClose').click(); });
$('#listenClose').onclick = () => { const v = $('#listen'); v.classList.add('hidden'); v.querySelector('iframe').src = 'about:blank'; };
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
// 만남: 그분이 나를 돌아보며 그 장면의 말씀을 하신다 (말풍선, 누르면 넘김)
function meet() {
  const e = G.events[G.idx];
  G.meetLeft = Math.max(0, G.timeT); G.timeT = 0; G.leader.goal.copy(G.leader.pos);
  G.me.goal.copy(G.me.pos);
  G.leader.target = G.me; G.leader.set('speak'); G.me.target = G.leader;
  // 그분이 하신 말씀(j)이 있으면 그분 입으로, 없으면(수태고지처럼 아직 태어나시기 전 등) '이 자리의 말씀'으로 누가 한 말인지 밝혀서
  const own = (e.words || []).find(x => x.j), w = own || (e.words || [])[0];
  // 말씀은 곧 이어지는 '말씀 고르기'에서 맞히게, 말풍선에는 반기는 인사만 (먼저 보여 주면 너무 쉬웠다)
  const nm = me.name || '순례자', call = /^[가-힣]+$/.test(nm) ? josa(nm, '아', '야') : nm;
  G.meetWord = `${call}, 잘 찾아왔구나. 여기는 ${placeOf(e).name}.`;
  G.meetT = 3.2;
  $('#bubble').innerHTML = `<b>${esc(JOURNEYS[JID].who)}</b>${esc(G.meetWord)}`;
  setTimeout(() => $('#bubble').classList.add('on'), 900);
  document.body.classList.add('meeting');
  G.met = true;
}
function bubble() {
  const [x, y] = screen(G.leader.pos.x, G.leader.ground + SCALE * 1.05, G.leader.pos.y), b = $('#bubble'), half = b.offsetWidth / 2 + 10;
  // 화면 밖으로 잘리지 않게 (꼬리는 가운데에 그대로)
  const left = Math.min(innerWidth - half, Math.max(half, x));
  b.style.left = left + 'px'; b.style.top = Math.max(b.offsetHeight + 24, y) + 'px'; b.style.setProperty('--tx', `${Math.max(-half + 24, Math.min(half - 24, x - left))}px`);
}
addEventListener('pointerdown', e => { if (G.meetT > 0.4 && !e.target.closest('#stick,#zoom')) G.meetT = 0.01; });
// 늦음: 그분은 이미 다음 자리로 떠나셨다 — 그 장면은 놓치고 다음 장면으로
function late() {
  G.met = false;
  const e = G.events[G.idx], from = [G.leader.pos.x, G.leader.pos.y];
  G.missed.push(G.idx); G.stars[G.idx] = G.stars[G.idx] || 0;
  G.idx++; save();
  if (G.idx >= G.events.length) { finish(); return; }
  const nx = G.events[G.idx];
  toast(`늦었어요! ${esc(josa(JOURNEYS[JID].who, '은', '는'))} 벌써 ${esc(placeOf(nx).name)}(으)로 떠나셨어요<small>놓친 장면: ${esc(e.title)} · 따라가서 만나세요</small>`, false, 3600);
  startLeg(from);
}
function arrive() {
  const e = G.events[G.idx], straight = G.legStraight, ratio = straight > 1 ? G.legWalked / straight : 1;
  const stars = straight < ARRIVE * 1.5 ? 3 : ratio < 1.35 ? 3 : ratio < 1.9 ? 2 : 1;
  G.stars[G.idx] = Math.max(G.stars[G.idx] || 0, stars);
  G.leader.look(0); G.me.target = null;
  if (G.met) {
    G.met = false;
    pickWord(e, ok => ok ? reveal(e, stars, straight) : missCard(e));
    return;
  }
  cardPlain(e, stars, straight);
}
// 말씀 고르기: 만난 자리에서 들은 말씀을 보기 셋 가운데서 고른다 — 맞히면 카드 (사용자 2026-11)
function pickWord(e, done) {
  const w = cardWord(e);
  if (!w) { done(true); return; }
  const pool = G.events.filter(x => x !== e).map(cardWord).filter(x => x && x.text !== w.text);
  const opts = [w];
  while (opts.length < 3 && pool.length) opts.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  opts.sort(() => Math.random() - .5);
  const s = sheet(`<div class="img" style="background-image:url('${esc(cardSrc(e))}')"></div><div class="body quiz"><small>${G.idx + 1} / ${G.events.length} · ${esc(e.title)}</small>
    <h2>이 자리에서 들은 말씀은?</h2><p class="sub">맞히면 말씀 카드를 얻어요</p>
    <div class="opts">${opts.map((o, i) => `<button data-i="${i}">${esc(o.text)}</button>`).join('')}</div><div class="explain"></div></div>`);
  s.querySelector('.opts').onclick = ev => {
    const b = ev.target.closest('button'); if (!b || s.querySelector('.right')) return;
    const ok = opts[+b.dataset.i] === w;
    s.querySelectorAll('.opts button').forEach((x, i) => { if (opts[i] === w) x.classList.add('right'); else if (x === b) x.classList.add('wrong'); });
    s.querySelector('.explain').innerHTML = `${esc(w.who || '')} · ${esc(w.ref || '')}<button class="go">${ok ? '카드 받기' : '계속'}</button>`;
    s.querySelector('.explain .go').onclick = () => done(ok);
  };
}
function missCard(e) {
  const s = sheet(`<div class="body"><small>${G.idx + 1} / ${G.events.length}</small><h2>아쉬워요, 이번에는 카드를 얻지 못했어요</h2><p class="sub">다시 걸을 때 이 자리의 말씀 카드에 도전할 수 있어요.</p>
    <div class="row"><a class="go ghost" href="${appLink(e)}" data-listen>이 장면 듣기</a><button class="go" id="next">${G.idx + 1 < G.events.length ? '다음 장면으로 →' : '여정 마치기'}</button></div></div>`);
  s.querySelector('#next').onclick = () => { closeSheet(); G.idx++; save(); G.idx < G.events.length ? startLeg() : finish(); };
}
function reveal(e, stars, straight) {
  {
    const pts = Math.max(10, stars * 100 + Math.round(G.meetLeft || 0) * 10 - G.asks * ASK + (G.bonus || 0)), got = collect(e, stars, pts), fresh = got.fresh;
    const v = showCard(tcard(e, G.idx, { s: stars, p: pts }, 'big reveal'),
      `<div class="row"><a class="go ghost" href="${appLink(e)}" data-listen>이 장면 듣기</a><button class="go" id="next">${G.idx + 1 < G.events.length ? '다음 장면으로 →' : '여정 마치기'}</button></div>`,
      `<p class="gotcard">${fresh ? '새 말씀 카드!' : got.best ? '최고 기록 갱신!' : '이미 모은 카드'} +${num(pts)}점${straight >= ARRIVE * 1.5 ? ` · 걸은 길 ${Math.round(G.legWalked)}km / 곧은 길 ${Math.round(straight)}km` : ''}</p>`);
    v.querySelector('#next').onclick = () => { closeSheet(); G.idx++; save(); G.idx < G.events.length ? startLeg() : finish(); };
  }
}
function cardPlain(e, stars, straight) {
  const w = (e.words || []).find(x => x.j) || (e.words || [])[0];
  const s = sheet(`${e.img ? `<div class="img" style="background-image:url('${esc(e.img.src)}')"><span class="stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</span></div>` : ''}
    <div class="body"><small>${G.idx + 1} / ${G.events.length} · ${esc(placeOf(e).name)}</small><h2>${esc(e.title)}</h2><p class="sub">${esc(e.subtitle || '')}</p>
    ${straight >= ARRIVE * 1.5 ? `<div class="leg"><span>걸은 길 <b>${Math.round(G.legWalked)}km</b></span><span>곧은 길 ${Math.round(straight)}km</span><span>${'★'.repeat(stars)}</span></div>` : ''}
    <p class="story">${esc(firstSentences(e.story?.[0] || ''))}</p>
    ${w ? `${G.met ? `<small class="got">${G.newCard ? '새 말씀 카드를 얻었어요!' : '이미 모은 말씀 카드'}</small>` : ''}<blockquote class="${G.met ? 'won' : ''}">${esc(w.text)}<cite>${esc(w.who || '')} · ${esc(w.ref || '')}</cite></blockquote>` : ''}
    <div class="row"><a class="go ghost" href="${appLink(e)}" data-listen>이 장면 듣기</a><button class="go" id="next">${G.idx + 1 < G.events.length ? '다음 장면으로 →' : '여정 마치기'}</button></div></div>`);
  G.met = false;
  s.querySelector('#next').onclick = () => { closeSheet(); G.idx++; save(); G.idx < G.events.length ? startLeg() : finish(); };
}
function finish() {
  const n = G.events.length, st = G.stars.reduce((a, b) => a + (b || 0), 0), km = Math.round(G.total), J = JOURNEYS[JID];
  const text = `그 길 순례 — ${me.name || '순례자'}, ${josa(J.who, '을', '를')} 따라 ${n}장면 ${km}km를 걸었습니다 · 말씀 카드 ${Object.keys(deck()).length}/${n}장 ${num(total(deck()))}점\nhttps://thewaymap.org/game.html?j=${JID}`;
  const s = sheet(`<div class="body"><small>${esc(J.name)}</small><h2>여정을 마쳤습니다</h2><p class="sub">${esc(me.name || '순례자')}님, ${n}장면을 모두 찾아 걸었어요.</p>
    <div class="leg"><span>걸은 길 <b>${km}km</b></span><span><b>${Math.floor(G.total / WALK) + 1}</b>일</span><span>★ <b>${st}</b>/${n * 3}</span></div>
    <p class="sub">말씀 카드 <b>${Object.keys(deck()).length}</b> / ${n}장 · 합계 <b>${num(total(deck()))}점</b></p>
    ${G.missed.length ? `<p class="sub">늦어서 놓친 장면 ${G.missed.length}개 — ${G.missed.slice(0, 6).map(i => esc(G.events[i].title)).join(', ')}${G.missed.length > 6 ? ' …' : ''}. 앱에서 들어 보세요.</p>` : `<p class="sub">한 장면도 놓치지 않고 모두 만났어요!</p>`}
    <div class="row"><button class="go ghost" id="share">자랑하기</button><button class="go" id="again">다른 여정 걷기</button></div></div>`);
  s.querySelector('#share').onclick = async () => { try { if (navigator.share) await navigator.share({ text }); else { await navigator.clipboard.writeText(text); toast('복사했어요', true); } } catch { /* 닫음 */ } };
  s.querySelector('#again').onclick = () => { store.set('theway-game-' + JID, null); location.href = `game.html?j=${JID}`; };
}
// 말씀 카드: 시간 안에 그분을 만난 장면의 말씀을 모은다 (사용자 2026-11). 처음부터 다시 걸어도 지우지 않는다 — 놓친 카드를 채우러 다시 걷게
const cardKey = () => 'theway-game-cards-' + JID;
const cardWord = e => (e.words || []).find(x => x.j) || (e.words || [])[0];
// 카드 점수(사용자 2026-11): 별 하나에 100점 + 만났을 때 남은 시간 1초에 10점. 같은 카드는 더 높은 기록만 남긴다
const deck = () => { const v = store.get(cardKey(), {}); const d = Array.isArray(v) ? Object.fromEntries(v.map(k => [k, 1])) : v;
  for (const k in d) if (typeof d[k] === 'number') d[k] = { s: d[k], p: d[k] * 100 }; return d; };
const total = d => Object.values(d).reduce((t, x) => t + (x.p || 0), 0);
const num = n => n.toLocaleString('ko-KR');
function collect(e, stars, pts) {
  const d = deck(), old = d[e.id], fresh = !old;
  d[e.id] = { s: Math.max(old?.s || 0, stars), p: Math.max(old?.p || 0, pts) }; store.set(cardKey(), d); drawCardBtn();
  return { fresh, best: !old || pts > (old.p || 0) };
}
// 카드 그림은 R2에서 (호스팅 전송량을 아끼려고 — assets/cards.json, _src/tools/cards-manifest.py). 아직 없으면 장면 그림
let CARDS = { base: '', files: {} };
const cardSrc = e => CARDS.files[e.id] ? `${CARDS.base}/${CARDS.files[e.id]}` : e.img?.src || '';
// 트레이딩 카드 앞면: 번호·제목, 그림 창(말씀 카드 그림 — 아직 없으면 장면 그림), 말씀 상자, 등급(별 — 동·은·금 테두리)
const RANK = ['', 'bronze', 'silver', 'gold'];
function tcard(e, i, c, cls = '') {
  const w = cardWord(e), p = placeOf(e), stars = c.s || c, pts = c.p;
  return `<div class="tcard ${RANK[stars] || 'bronze'} ${cls}" data-i="${i}"><div class="tin">
    <div class="thead"><span class="tno">${String(i + 1).padStart(2, '0')}</span><b>${esc(e.title)}</b><span class="tst">${'★'.repeat(stars)}</span></div>
    <div class="tart"><img src="${esc(cardSrc(e))}" alt="" loading="lazy" onerror="this.onerror=null;this.src='${esc(e.img?.src || '')}'"></div>
    <div class="tcap">${esc(p.name)} · ${esc(e.when || '')}</div>
    <div class="tword"><q>${esc(w?.text || e.subtitle || '')}</q><cite>${esc(w?.who || '')}${w?.ref ? ` · ${esc(w.ref)}` : ''}</cite></div>
    <div class="tfoot"><span>그 길 · ${esc(JOURNEYS[JID].name.replace(' 따라가기', ''))}</span>${pts ? `<b class="tpt">${num(pts)}점</b>` : `<span>${i + 1}/${G.events.length}</span>`}</div>
  </div><i class="tholo"></i></div>`;
}
// 기울이면 빛이 흐른다 (손가락·마우스 위치로)
function tilt(root) {
  root.querySelectorAll('.tcard.big').forEach(c => {
    const move = ev => { const r = c.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height;
      c.style.setProperty('--rx', `${(0.5 - y) * 16}deg`); c.style.setProperty('--ry', `${(x - 0.5) * 18}deg`); c.style.setProperty('--mx', `${x * 100}%`); c.style.setProperty('--my', `${y * 100}%`); };
    c.addEventListener('pointermove', move); c.addEventListener('pointerleave', () => { c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); });
  });
}
function showCard(card, below, head = '') {
  const s = $('#sheet'); s.innerHTML = `<div class="cardview">${head}${card}${below}</div>`; s.classList.remove('hidden'); G.busy = true; tilt(s); return s;
}
function drawCardBtn() { const d = deck(), n = Object.keys(d).length; $('#cardsBtn').innerHTML = `<b>${n}</b>/${G.events.length} 말씀 카드<small>${num(total(d))}점</small>`; }
function openCards() {
  const d = deck(), have = new Set(Object.keys(d));
  const s = sheet(`<div class="body"><small>${esc(JOURNEYS[JID].name)}</small><h2>말씀 카드 ${have.size} / ${G.events.length} · ${num(total(d))}점</h2>
    ${store.get(temptKey(), 0) ? `<p class="sub tempt">시험을 이긴 카드 <b>${store.get(temptKey(), 0)}</b>장 — 유혹하는 뱀을 지나쳐 얻었어요</p>` : ''}
    <p class="sub">시간 안에 ${esc(josa(JOURNEYS[JID].who, '을', '를'))} 만나면 그 자리의 말씀 카드를 얻어요. 놓친 카드는 다시 걸어서 채우세요.</p>
    <div class="deck">${G.events.map((e, i) => have.has(e.id) ? `<button class="slot">${tcard(e, i, d[e.id], 'mini')}</button>`
      : `<div class="slot lock"><small>${String(i + 1).padStart(2, '0')}</small><b>?</b></div>`).join('')}</div>
    <button class="go" id="closeCards">${G.me ? "계속 걷기" : "닫기"}</button></div>`);
  s.querySelector('#closeCards').onclick = closeSheet;
  s.querySelector('.deck').onclick = ev => { const b = ev.target.closest('.tcard[data-i]'); if (!b) return; const i = +b.dataset.i, e = G.events[i];
    const v = showCard(tcard(e, i, d[e.id], 'big'), `<div class="row"><a class="go ghost" href="${appLink(e)}" data-listen>이 장면 듣기</a><button class="go" id="backDeck">카드 모음으로</button></div>`);
    v.querySelector('#backDeck').onclick = openCards; };
}
$('#cardsBtn').onclick = () => openCards();
const save = () => store.set('theway-game-' + JID, { idx: G.idx, total: G.total, stars: G.stars, missed: G.missed });

/* ---------- 한 구간 ---------- */
// 시간 안에 닿으면 그분을 3D로 가까이 만나고(meet), 늦으면 그분은 벌써 다음 장면 자리로 걸어가신다 —
// 나는 그 장면을 놓치고 다음 장면으로 간다. 걸어가시는 길 위에서 따라잡아도 만남이다 (사용자 2026-11)
// 미션 글: 처음엔 장소 이름 없이 지방과 장면만(단서) — 어디인지 맞혀 찾아가게 (다 알려 주면 너무 쉬웠다, 사용자 2026-11).
// 길을 물으면(첫 번째) 장소 이름을, 그다음부터는 방향을 잠깐 알려 준다. 빛기둥이 보일 만큼 다가가도 이름이 드러난다
function missionText() {
  const e = G.events[G.idx], p = placeOf(e);
  $('#mTitle').textContent = G.named ? `${p.name} — ${e.title}` : `${p.region || '어딘가'}의 어느 곳 — ${e.title}`;
  $('#mClue').textContent = e.subtitle || '';
}
function startLeg(walkFrom) {
  const e = G.events[G.idx], [gx, gz] = goalXZ();
  if (walkFrom) { G.leader.pos.set(...walkFrom); G.leader.goal.set(gx + 0.6, gz); G.leader.set('idle'); }
  else { G.leader.pos.set(gx + 0.6, gz); G.leader.goal.copy(G.leader.pos); G.leader.set('idle'); }
  G.pillar.position.set(gx, GH(gx, gz) + 45, gz);
  G.legStart = [G.me.pos.x, G.me.pos.y]; G.legWalked = 0; G.legT = 0; G.lostT = 0; G.asks = 0; G.askT = 0;
  G.legStraight = Math.hypot(gx - G.me.pos.x, gz - G.me.pos.y);
  G.prevD = G.legStraight;
  G.speed = Math.max(9, G.legStraight / 16); // 먼 길(바벨론 포로길 등)도 20초 남짓에 걷게
  // 제한 시간: 곧장 걸으면 걸릴 시간의 1.7배 + 6초. 그분은 그 시간의 절반쯤에 다음 자리에 닿으시게 걸으신다
  G.timeMax = G.timeT = G.legStraight / G.speed * 2.3 + 10; // 목적지를 지도에서 찾아야 하니 넉넉히
  if (walkFrom) G.leader.speed = Math.max(4, Math.hypot(gx - walkFrom[0], gz - walkFrom[1]) / (G.timeMax * 0.5));
  $('#mNo').textContent = `${G.idx + 1} / ${G.events.length} · ${josa(JOURNEYS[JID].who, '이', '가')} 계신 곳`;
  G.named = false; missionText(); G.bonus = 0; spawnLegEvents();
  G.busy = false;
  // 같은 자리에서 이어지는 장면: 다시 반기는 인사 없이 곧바로 말씀 고르기로 (사용자 2026-11). 남은 시간 점수는 6초로 친다
  if (G.legStraight < ARRIVE) { G.busy = true; G.timeT = 0; G.meetLeft = 6; G.met = true; setTimeout(arrive, 400); }
}

// 여정의 장면·장소와 카드 그림 목록 (시작 화면에서 카드 모음만 볼 때도)
async function loadJourney() {
  if (G.data && G.dataJ === JID) return;
  [G.data, CARDS] = await Promise.all([fetch(JOURNEYS[JID].data).then(r => r.json()), fetch('assets/cards.json').then(r => r.json()).catch(() => CARDS)]);
  G.dataJ = JID; G.events = G.data.events.filter(e => G.data.places[e.place] && !G.data.places[e.place].hidden);
}
async function begin(fresh) {
  me.name = $('#name').value.trim() || '순례자'; store.set('theway-game-me', me);
  if (fresh) store.set('theway-game-' + JID, null);
  const J = JOURNEYS[JID];
  await loadJourney();
  const saved = store.get('theway-game-' + JID, null);
  G.idx = saved?.idx || 0; G.total = saved?.total || 0; G.stars = saved?.stars || []; G.missed = saved?.missed || [];
  $('#setup').classList.add('hidden');
  for (const s of ['#hud', '#waterBox', '#dayBox', '#arrow', '#stick', '#zoom', '#cardsBtn', '#ask', '#quit']) $(s).classList.remove('hidden');
  G.r = renderer($('#world'));
  buildWorld(J);
  playerType();
  // 출발: 처음이면 첫 장면에서 조금 떨어진 곳, 이어 걷기면 앞 장면 자리
  const ref = G.events[Math.max(0, G.idx - 1)], [rx, rz] = toXZ(placeOf(ref).lat, placeOf(ref).lng);
  let sx = rx, sz = rz;
  if (G.idx === 0) for (const [dx, dz] of [[0, 22], [16, 16], [-16, 16], [20, 0], [-20, 0], [0, -22]]) if (!blocked(rx + dx, rz + dz)) { sx = rx + dx; sz = rz + dz; break; }
  // 출발 자리가 물 위면(갈릴리 바다 한가운데의 장면 다음 등) 가장 가까운 뭍으로
  if (blocked(sx, sz) || onGalilee(sx, sz)) outer: for (let r = 2; r < 80; r += 2) for (let k = 0; k < 16; k++) { const a = k / 16 * 6.283, x = sx + Math.cos(a) * r, z = sz + Math.sin(a) * r; if (!blocked(x, z) && !onGalilee(x, z)) { sx = x; sz = z; break outer; } }
  G.me = new Actor('player', sx, sz, 0, { gaze: false }); G.me.realWalk = true; G.me.big = SCALE;
  G.leader = new Actor(J.leader, 0, 0, 0, { gaze: false }); G.leader.realWalk = true; G.leader.big = SCALE; G.leader.target = G.me;
  G.scene.add(G.me.p.root, G.leader.p.root);
  drawWater(); drawCardBtn(); resize();
  toast('땅과 마을을 세우는 중…', true, 6000);
  await G.world.ready; $('#toast').classList.remove('on');
  spawnPatrols();
  startLeg();
  if (G.idx === 0) toast(`${esc(me.name)}님, ${esc(josa(J.who, '을', '를'))} 따라 걸어요<small>지도에서 장소 이름을 찾아 걸어가세요 · 가까이 가면 빛기둥이 보여요</small>`, true, 4200);
}

/* ---------- 이름표·화살표 ---------- */
const tags = $('#tags'), v3 = new THREE.Vector3();
const screen = (x, y, z) => { v3.set(x, y, z).project(G.cam); return [(v3.x + 1) / 2 * innerWidth, (1 - v3.y) / 2 * innerHeight, v3.z < 1]; };
let tagEls = [];
function drawTags() {
  const list = [];
  const [gx, gz] = goalXZ() || [0, 0], e = G.events[G.idx];
  list.push({ cls: 'me', text: me.name, pos: [G.me.pos.x, G.me.ground + SCALE * 1.15, G.me.pos.y] });
  // 목적지는 따로 드러내지 않는다 — 다른 장소와 같은 이름표로 지도에서 찾게 (빛기둥 둘레에 오면 그때 크게, 사용자 2026-11)
  const dGoal = Math.hypot(gx - G.me.pos.x, gz - G.me.pos.y);
  if (e && dGoal < PILLAR * 0.5) list.push({ cls: 'goal', text: placeOf(e).name, pos: [gx, GH(gx, gz) + SCALE * 1.25, gz] });
  // 둘레의 다른 장소 이름 (여정에 나오는 곳만, 가까운 순서로 몇 개)
  const seen = new Set(e && dGoal < PILLAR * 0.5 ? [e.place] : []), near = [];
  for (const ev of G.events) { if (seen.has(ev.place)) continue; seen.add(ev.place); const p = placeOf(ev), [x, z] = toXZ(p.lat, p.lng); const d = Math.hypot(x - G.me.pos.x, z - G.me.pos.y); if (d < G.zoom * 1.6) near.push({ d, cls: 'place', text: p.name, pos: [x, GH(x, z) + 0.3, z] }); }
  near.sort((a, b) => a.d - b.d).slice(0, 14).forEach(t => list.push(t));
  while (tagEls.length < list.length) { const d = document.createElement('div'); tags.append(d); tagEls.push(d); }
  tagEls.forEach((el, i) => {
    const t = list[i]; if (!t) { el.hidden = true; return; }
    const [x, y, ok] = screen(...t.pos); el.hidden = !ok || x < -50 || y < -20 || x > innerWidth + 50 || y > innerHeight + 20;
    el.className = 'tag ' + t.cls; el.textContent = t.text; el.style.left = x + 'px'; el.style.top = y + 'px';
  });
  // 화살표: 내 둘레 원 위에서 목표 쪽을 가리킨다
  const [mx, my] = screen(G.me.pos.x, G.me.ground + SCALE * .5, G.me.pos.y), [tx, ty] = screen(gx, GH(gx, gz), gz), a = Math.atan2(ty - my, tx - mx);
  const near2 = dGoal < ARRIVE * 2.5;
  const ar = $('#arrow'), lure = G.lureT > 0 && !(G.askT > 0);
  ar.classList.toggle('lure', lure);
  ar.style.opacity = !G.busy && (lure || (!near2 && G.askT > 0)) ? 1 : 0;
  const aa = lure ? G.lureA : a; // 유혹: 엉뚱한 쪽 (지도 좌표의 각을 화면에서 그대로 — 북쪽이 위라 같다)
  ar.style.left = mx + Math.cos(aa) * 78 + 'px'; ar.style.top = my + Math.sin(aa) * 78 + 'px'; ar.style.transform = `rotate(${aa + Math.PI / 2}rad)`;
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
  const me0 = G.me, dir = !G.busy && !(G.checkT > 0) && inputDir();
  if (!G.busy) updateEvents(dt, me0);
  if (dir) {
    const boat = onGalilee(me0.pos.x, me0.pos.y), sp = G.speed * (G.slowT > 0 ? 0.45 : 1) * (boat ? 0.65 : 1), step = sp * dt;
    // 이미 물·가장자리 안에 서 있으면(물 위 장면에서 이어 걷기 등) 어느 쪽으로든 나올 수 있게 — 갇혀 물병만 잃었다(사용자 2026-11)
    let nx = me0.pos.x + dir[0] * step, nz = me0.pos.y + dir[1] * step, hit = blocked(me0.pos.x, me0.pos.y) ? null : blocked(nx, nz);
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
      const dl = Math.hypot(G.leader.pos.x - nx, G.leader.pos.y - nz);
      if (d < ARRIVE || dl < ARRIVE * 0.8) { G.busy = true; me0.goal.copy(me0.pos); save(); meet(); }
    }
  } else me0.goal.copy(me0.pos);
  // 그분은 가까이(몇십 미터 — 이 지도에서는 인형 키의 몇 배) 가야 보인다. 멀리서는 빛기둥(그 장면의 자리)만 (사용자 2026-11)
  const near = Math.hypot(G.leader.pos.x - me0.pos.x, G.leader.pos.y - me0.pos.y) < SEE || G.meetT > 0 || G.busy;
  G.leader.showT = near ? 1 : 0;
  const H = (x, z) => Math.max(0, G.world?.heightAt(x, z) || 0);
  const sailing = onGalilee(me0.pos.x, me0.pos.y);
  me0.ground = sailing ? LAKE_LEVEL.galilee + 0.3 : H(me0.pos.x, me0.pos.y); G.leader.ground = H(G.leader.pos.x, G.leader.pos.y);
  if (sailing && !G.boat) { G.boat = makeProp('boat', 0, 0, { scale: SCALE * 1.4 }).obj; G.scene.add(G.boat); toast('배를 타고 갈릴리 바다를 건너요', true, 2000); }
  if (G.boat) { G.boat.visible = sailing; if (sailing) { G.boat.position.set(me0.pos.x, LAKE_LEVEL.galilee, me0.pos.y); G.boat.rotation.y = -me0.face + Math.PI / 2; } }
  for (const P of G.patrols || []) P.s.update(t, dt);
  if (G.wounded) G.wounded.a.update(t, dt);
  me0.update(t, dt); G.leader.update(t, dt);
  G.world?.update(t, dt, me0.pos);
  // 하루(30km) 걷는 동안 아침 → 밤 (밤에는 마을 불빛)
  G.world?.setTime(((G.total % WALK) / WALK + 0.22) % 1);
  const dp = Math.hypot(G.pillar.position.x - me0.pos.x, G.pillar.position.z - me0.pos.y), pvis = Math.max(0, Math.min(1, (PILLAR - dp) / (PILLAR * 0.35)));
  G.pillar.material.opacity = (0.16 + Math.sin(t * 2) * 0.06) * pvis; G.pillar.visible = pvis > 0;
  G.askT -= dt;
  if (!G.named && pvis > 0.85) { G.named = true; missionText(); }
  // 카메라: 북쪽이 위, 비스듬히 내려다보며 따라간다
  const cx = me0.pos.x, cz = me0.pos.y, h = G.zoom;
  if (!G.busy && G.timeT > 0) { G.timeT -= dt; if (G.timeT <= 0) late(); }
  if (G.meetT > 0) { // 만남: 둘 사이로 내려앉아 비스듬히
    G.meetT -= dt;
    const mx = (cx + G.leader.pos.x) / 2, mz = (cz + G.leader.pos.y) / 2, k = 1 - Math.exp(-dt * 2.2);
    let px = -(G.leader.pos.y - cz), pz = G.leader.pos.x - cx; const pl = Math.hypot(px, pz) || 1; px /= pl; pz /= pl;
    if (pz < 0) { px = -px; pz = -pz; } // 남쪽(화면 아래)에서 보게
    // 세로 폰 화면은 옆이 좁아 더 물러선다 — 둘이 화면에 다 들어오게
    const back = SCALE * 3.4 / Math.min(1, G.cam.aspect * 1.45);
    const gy = (me0.ground + G.leader.ground) / 2;
    G.cam.position.lerp(v3.set(mx + px * back, gy + SCALE * 1.5 + back * 0.18, mz + pz * back), k);
    G.camLook.lerp(v3.set(mx, gy + SCALE * 0.55, mz), k); G.cam.lookAt(G.camLook);
    bubble();
    if (G.meetT <= 0) { $('#bubble').classList.remove('on'); document.body.classList.remove('meeting'); arrive(); }
  } else {
    const gy = me0.ground; // 솟은 땅을 걸을 때 카메라도 따라 오른다
    G.cam.position.lerp(v3.set(cx, gy + h, cz + h * 0.78), 1 - Math.exp(-dt * 5));
    G.camLook.set(G.cam.position.x, G.cam.position.y - h, G.cam.position.z - h * 0.78); G.cam.lookAt(G.camLook);
  }
  const [gx, gz] = goalXZ() || [cx, cz];
  // 남은 거리 대신 등불: 곧은 길 대비 얼마나 가까워졌는지로 밝기만 (숫자를 주면 답이 너무 빤했다 — 사용자 2026-11)
  const warm = Math.max(0, Math.min(1, 1 - Math.hypot(gx - cx, gz - cz) / Math.max(G.legStraight || 1, 40)));
  const lamp = $('#mDist'); lamp.textContent = warm > .85 ? '아주 가까워요' : warm > .6 ? '가까워요' : warm > .3 ? '조금 더' : '멀어요'; lamp.style.setProperty('--w', warm.toFixed(2));
  const tb = $('#mTime'); tb.hidden = !(G.timeT > 0); tb.textContent = `⏳ ${Math.ceil(G.timeT)}초`; tb.classList.toggle('hurry', G.timeT < 6);
  $('#mWalk').textContent = `걸은 길 ${Math.round(G.total)}km`;
  $('#days').textContent = Math.floor(G.total / WALK) + 1;
  G.r.render(G.scene, G.cam);
  drawTags();
}

if (new URLSearchParams(location.search).has('debug')) window.__game = { G, me, startLeg: (...a) => startLeg(...a) }; // 끝까지 자동으로 걸어 보는 확인용
setupUI(); resize();
requestAnimationFrame(frame);

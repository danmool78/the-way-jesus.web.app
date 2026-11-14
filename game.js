/* 그 길 순례 게임: 내 이름과 인형(순례자)을 꾸며, 지도 위를 걸어 예수님(모세·다윗·엘리야)이 계신 다음 장면을 찾아간다.
   길을 잃으면(목표에서 멀어지는 쪽으로 오래 걸으면) 모래바람, 바다로 들어가려 하면 물병을 잃는다. 물병이 다 떨어지면
   그 장면의 퀴즈를 맞혀야 다시 채워지고, 틀리면 이번 길의 처음으로 돌아간다 (사용자 2026-11).
   지도 바탕은 앱과 같은 음영 기복도(assets/relief*.webp), 인물은 3D 무대의 피규어(stage/people.js)를 그대로 쓴다.
   자료는 각 여정의 data(장면·장소·퀴즈·그림). 진행은 이 기기에만 기억한다(theway-game-<여정>, 꾸민 모습은 theway-game-me) */
import { THREE } from './stage/kit.js';
import { TYPES, SKIN, Actor } from './stage/people.js';
import { createWorld, LAKE_LEVEL } from './game-world.js';
import { makeProp } from './stage/props.js';
import { createAudio } from './game-audio.js';
import { TREASURES, RARITY, hideTreasures, treasureCard } from './game-treasure.js';
import { model, tinted, ModelActor } from './game-model.js';
import { CAST, FOLLOW, SIZE, LEADS } from './game-cast.js';

const $ = s => document.querySelector(s);
const snd = createAudio(); // 배경음악·발소리·배 소리·효과음 (game-audio.js)
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// 받침에 따라 조사를 고른다 (모세가·예수님이, 모세를·다윗을)
const josa = (w, a, b) => { const c = (w || '').charCodeAt(w.length - 1) - 0xac00; return w + (c >= 0 && c < 11172 && c % 28 ? a : b); };
const store = { get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* 사생활 보호 모드 */ } } };

/* ---------- 여정 ---------- */
// 지도 위를 걷는 여정만 (바울은 뱃길이 많아, 시편·잠언·GoodNews는 지도를 걷지 않아 뺀다)
const JOURNEYS = {
  jesus: { name: '예수님 따라가기', who: '예수님', data: 'data.json', leader: 'jesus', model: 'jesus', bases: ['main', 'west'], terrain: ['galilee', 'judea', 'shephelah', 'carmel', 'egypt'] },
  moses: { name: '모세 따라가기', who: '모세', data: 'j/moses/data.json', leader: 'mosesE', model: 'moses', bases: ['main', 'west', 'south'], terrain: ['galilee', 'judea', 'shephelah', 'carmel', 'egypt', 'sinai', 'negev'] },
  david: { name: '다윗 따라가기', who: '다윗', data: 'j/david/data.json', leader: 'davidW', model: 'david', bases: ['main', 'west'], terrain: ['galilee', 'judea', 'shephelah', 'carmel'] },
  kings: { name: '엘리야와 두 왕국', who: '선지자', data: 'j/kings/data.json', leader: 'elijah', model: 'elijah', bases: ['meso', 'main', 'west', 'south'], terrain: ['galilee', 'judea', 'shephelah', 'carmel', 'sinai', 'negev'] },
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
// 3D 부품 버리기: 장면에서 빼고 그 안의 모양·재질·그림을 GPU에서도 놓아 준다 — 빼기만 하면 장면마다 쌓여 메모리가 샜다.
// 여럿이 같이 쓰는 재질이면 three.js가 다음에 그릴 때 다시 올리므로 버려도 안전하다
function bin(obj, scene) {
  if (!obj) return; (scene || obj.parent)?.remove(obj);
  obj.traverse(o => { o.geometry?.dispose(); const m = o.material; for (const x of Array.isArray(m) ? m : m ? [m] : []) { x.map?.dispose(); x.dispose(); } });
}
const pv = { r: renderer($('#preview')), scene: new THREE.Scene(), cam: new THREE.PerspectiveCamera(30, 1, 0.05, 20), actor: null };
lights(pv.scene);
pv.cam.position.set(0, 0.62, 2.4); pv.cam.lookAt(0, 0.48, 0);
const floor = new THREE.Mesh(new THREE.CircleGeometry(0.5, 48), new THREE.MeshStandardMaterial({ color: '#3a2e22', roughness: 1 }));
floor.rotation.x = -Math.PI / 2; pv.scene.add(floor);
// 순례자: 3D 모델(형제·자매)이 있으면 그것을 고른 옷 색으로 칠해 쓰고, 없으면 예전 인형 (사용자 2026-11)
const pName = () => me.sex === 'f' ? 'pilgrim-woman' : 'pilgrim-man';
async function pilgrim(x = 0, z = 0) {
  const g = await model(pName());
  if (g) return new ModelActor(tinted(g, pName(), me.robe), x, z);
  playerType(); return new Actor('player', x, z, 0, { gaze: false });
}
let pvTok = 0;
async function rebuildPreview() {
  const tok = ++pvTok, a = await pilgrim(); if (tok !== pvTok) return; // 빨리 바꿔 누르면 마지막 것만
  if (pv.actor) { if (pv.actor.dispose) pv.actor.dispose(); else bin(pv.actor.p.root, pv.scene); } // 앞 인형은 버린다
  pv.actor = a; a.realWalk = true; pv.scene.add(a.p.root);
  // 모델이면 꾸밀 것은 모습과 옷 색뿐 — 나머지(얼굴빛·머리·수염·겉옷·머리에·지팡이)는 모델에 그려져 있다
  const m = a instanceof ModelActor;
  for (const k of ['skin', 'hair', 'beard', 'mantle', 'head', 'staff']) $(`#setup [data-k=${k}]`).closest('.field').hidden = m || (k === 'beard' && me.sex === 'f');
  $('#setup [data-k=robe]').closest('.field').querySelector('b').textContent = m ? '옷 색' : '속옷';
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
  data: null, events: [], idx: 0, me: null, leader: null, prints: null, trail: null,
  zoom: 46, walked: 0, total: 0, legStart: null, legWalked: 0, water: 3, stars: [],
  lostT: 0, prevD: 0, slowT: 0, coolT: 0, seaT: 0, legT: 0, busy: true, speed: 9, timeT: 0, timeMax: 0, meetT: 0, missed: [], askT: 0, asks: 0,
};
G.camLook = new THREE.Vector3();
// 그 자리의 땅 높이 (입체 땅, game-world.js) — 이름표·발자국을 땅 위에
const GH = (x, z) => Math.max(0, G.world?.heightAt(x, z) || 0);
const SCALE = 1.4; // 인형 크기 (지도 위에서 보이게 키운다 — 4.2는 호수·마을에 비해 너무 컸다, PC 캡처 2026-11)
// 그분은 아주 가까이(3km — 인형 키의 두 배 남짓) 가야 보이고, 2.5km 안에 들어서야 만난다 (사용자 2026-11 — 멀리서 보이면 쉬웠다)
const ARRIVE = 2.5;
const SEE = 3;
const SAME = 5; // 이만큼 붙은 장면은 같은 자리로 친다 (걷지 않고 카드를 이어 받는다)
// 발자국 (빛기둥 대신 — 빛기둥은 너무 빤한 힌트였다, 사용자 2026-11): 목적지 TRACK km 안쪽에만 그분이 걸어가신 굽은 발자국이 있고,
// 내 둘레 PRINT_R km 안의 것만 보인다. 그 언저리까지는 단서로 찾아가고, 발자국을 만나면 따라간다
const TRACK = 10, PRINT_R = 2.8, PRINT_GAP = 0.3, MAXP = 140; // 발은 키(약 1.3)의 6분의 1쯤 — 작게 하는 대신 촘촘히 (컸을 때는 사람보다 커 보였다, 사용자 2026-11)
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
  G.world = createWorld({ scene: S, renderer: G.r, toXZ, regions: j.terrain, places: G.data.places, journeyId: JID, wet: (x, z) => { const [la, ln] = toLL(x, z); return Object.values(WATERS).some(p => inPoly(la, ln, p)); } });
  // 발자국: 납작한 타원 하나를 여러 번(InstancedMesh) — 한 번 만들어 장면마다 자리만 바꿔 쓴다
  const fg = new THREE.CircleGeometry(1, 14); fg.rotateX(-Math.PI / 2); fg.scale(0.05, 1, 0.11);
  G.prints = new THREE.InstancedMesh(fg, new THREE.MeshBasicMaterial({ color: '#3a2412', transparent: true, opacity: .85, depthWrite: false }), MAXP);
  G.prints.count = 0; G.prints.frustumCulled = false; G.prints.renderOrder = 6; S.add(G.prints);
}
// 걸을 수 있는 곳: 음영 그림이 있는 땅이고 물이 아닌 곳 (목표 둘레는 물이어도 들어간다 — 홍해를 건너고 물 위를 걸으신 자리)
function blocked(x, z) {
  const [lat, lng] = toLL(x, z), J = JOURNEYS[JID];
  if (!J.bases.some(b => { const B = BASES[b]; return lat > B.lat0 + .02 && lat < B.lat1 - .02 && lng > B.lng0 + .02 && lng < B.lng1 - .02; })) return 'edge';
  const g = goalXZ();
  if (g && Math.hypot(x - g[0], z - g[1]) < SAME * 2.2) return null;
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
  for (const k of ['serpent', 'wounded']) if (G[k]) { if (G[k].a?.dispose) G[k].a.dispose(); else bin(G[k].obj || G[k].a.p.root, G.scene); G[k] = null; }
  const [gx, gz] = goalXZ(), [sx, sz] = [G.me.pos.x, G.me.pos.y], L = G.legStraight;
  if (L < 25) return;
  const at = (f, off) => { const dx = (gx - sx) / L, dz = (gz - sz) / L; return [sx + (gx - sx) * f - dz * off, sz + (gz - sz) * f + dx * off]; };
  if (Math.random() < 0.6) { // 뱀: 곧은 길 한가운데 가까이
    const [x, z] = at(0.4 + Math.random() * 0.15, (Math.random() - 0.5) * 3);
    if (!blocked(x, z)) { const P = makeProp('serpent', x, z, { scale: SCALE * 4 }); P.obj.position.y = GH(x, z); G.scene.add(P.obj); G.serpent = { obj: P.obj, x, z, warned: false, done: false, d0: Math.hypot(gx - x, gz - z) }; }
  }
  if (Math.random() < 0.4) { // 쓰러진 사람: 길 가장자리
    const [x, z] = at(0.6 + Math.random() * 0.2, (Math.random() < 0.5 ? -1 : 1) * 2.5);
    if (!blocked(x, z)) { const a = G.manG ? new ModelActor(tinted(G.manG, 'pilgrim-man', '#8b6f50'), x, z, { noPillow: true }) : new Actor('man', x, z, 0, { gaze: false }); a.big = SCALE; a.set('sleep'); a.realWalk = true; G.scene.add(a.p.root); G.wounded = { a, x, z, still: 0, helped: false, told: false }; }
  }
}
function spawnPatrols() {
  // 큰 성읍(예루살렘·가버나움·여리고·가이사랴 등) 둘레를 둘씩 오가는 로마 병정
  G.patrols = [];
  const big = Object.values(G.data.places).filter(p => !p.hidden && /예루살렘|가버나움|여리고|가이사랴|사마리아|세겜|헤브론/.test(p.name)).slice(0, 5);
  for (const p of big) {
    // 순찰 길은 물(바다·호수)을 건너지 않는 방향으로만 — 아무 쪽으로나 정하니 가버나움·가이사랴 병정이 물 위를 걸었다(사용자 2026-11)
    const [x0, z0] = toXZ(p.lat, p.lng), wet = (x, z) => { const [la, ln] = toLL(x, z); return Object.values(WATERS).some(w => inPoly(la, ln, w)); };
    let A = null, B = null;
    for (let k = 0, a0 = Math.random() * 6.28; k < 12 && !A; k++) {
      const a = a0 + k * 0.52, P = [x0 + Math.cos(a) * 9, z0 + Math.sin(a) * 9], Q = [x0 - Math.cos(a) * 9, z0 - Math.sin(a) * 9];
      if (![...Array(19)].some((_, i) => wet(P[0] + (Q[0] - P[0]) * i / 18, P[1] + (Q[1] - P[1]) * i / 18))) { A = P; B = Q; }
    }
    if (!A) continue;
    for (let i = 0; i < 2; i++) { const s = G.soldierG ? new ModelActor(G.soldierG, A[0] + i * 1.5, A[1]) : new Actor('soldier', A[0] + i * 1.5, A[1], 0, { gaze: false }); s.big = SCALE; s.realWalk = true; s.speed = 2.2; G.scene.add(s.p.root); G.patrols.push({ s, A, B, to: 1, off: i * 1.5 }); }
  }
}
function updateEvents(dt, me0) {
  const px = me0.pos.x, pz = me0.pos.y, [gx, gz] = goalXZ();
  // 우물
  for (const [wx, wz] of G.world?.wells || []) if (Math.hypot(wx - px, wz - pz) < 4 && G.water < 3 && !(G.wellT > 0)) { G.water = 3; drawWater(); G.wellT = 12; snd.play('well'); toast('우물에서 물을 길었어요<small>물병 셋이 다시 찼습니다</small>', true); }
  G.wellT -= dt;
  // 뱀
  const S = G.serpent;
  if (S && !S.done) {
    const d = Math.hypot(S.x - px, S.z - pz);
    S.obj.rotation.y += dt * 0.8;
    if (!S.warned && d < 12) { S.warned = true; G.lureT = 4.5; snd.play('hiss'); const ang = Math.atan2(gz - pz, gx - px) + (Math.random() < 0.5 ? 1.9 : -1.9); G.lureA = ang; toast('뱀이 속삭여요: "이쪽이 지름길이야…"<small>빨간 화살표는 유혹이에요 · 뱀에게 닿지 말고 지나가세요</small>', false, 3800); }
    if (d < 2.6) { S.done = true; bin(S.obj, G.scene); G.coolT = 0; penalty('serpent'); }
    else if (S.warned && Math.hypot(gx - px, gz - pz) < S.d0 - 6) { // 뱀을 지나쳤다
      S.done = true; bin(S.obj, G.scene);
      const n = (store.get(temptKey(), 0) || 0) + 1; store.set(temptKey(), n);
      const [t, r] = TEMPT[(n - 1) % TEMPT.length];
      G.bonus += 50; snd.play('bonus'); toast(`시험을 이겼어요! +50점<small>"${esc(t)}" (${r}) · 시험을 이긴 카드 ${n}장</small>`, true, 4200); drawCardBtn();
    }
  }
  G.lureT -= dt;
  // 쓰러진 사람
  const W = G.wounded;
  if (W && !W.helped) {
    const d = Math.hypot(W.x - px, W.z - pz); W.a.ground = GH(W.x, W.z);
    if (d < 5 && !W.told) { W.told = true; toast('길가에 강도 만난 사람이 쓰러져 있어요<small>곁에 멈춰 서 있으면 도울 수 있어요 (시간이 들어요)</small>', false, 3600); }
    if (d < 5 && !inputDir()) W.still += dt; else W.still = Math.max(0, W.still - dt);
    if (W.still > 2.2) { W.helped = true; W.a.set('idle'); G.bonus += 100; snd.play('bonus'); toast('가서 너도 이와 같이 하라 (눅 10:37)<small>쓰러진 이를 도왔어요 · 이 장면 카드 +100점</small>', true, 4000); }
  }
  // 로마 병정
  for (const P of G.patrols || []) {
    const T = P.to ? P.B : P.A; P.s.moveTo(T[0] + P.off, T[1]); P.s.ground = GH(P.s.pos.x, P.s.pos.y);
    if (Math.hypot(P.s.pos.x - T[0] - P.off, P.s.pos.y - T[1]) < 0.4) P.to = 1 - P.to;
    P.s.showT = Math.hypot(P.s.pos.x - px, P.s.pos.y - pz) < 40 ? 1 : 0;
    if (Math.hypot(P.s.pos.x - px, P.s.pos.y - pz) < 2.4 && !(G.checkT > -3)) { G.checkT = 2.8; snd.play('halt'); toast('로마 병정에게 붙잡혔어요!<small>검문을 받느라 잠시 멈춥니다 · 병정을 피해 다니세요</small>', false, 2800); }
  }
  G.checkT -= dt;
}
const placeOf = e => G.data.places[e.place];
// 같은 자리에서 이어지는 장면 묶음 (가버나움 e17–e20처럼): 걷지 않고 카드를 잇달아 받는다 — 몇 번째인지 알려 주려고
const xzOf = e => toXZ(placeOf(e).lat, placeOf(e).lng);
const near = (a, b) => { const [ax, az] = xzOf(a), [bx, bz] = xzOf(b); return Math.hypot(ax - bx, az - bz) < SAME; };
function group(i = G.idx) {
  let a = i, b = i; const ev = G.events;
  while (a > 0 && near(ev[a - 1], ev[a])) a--;
  while (b < ev.length - 1 && near(ev[b + 1], ev[b])) b++;
  return { k: i - a + 1, n: b - a + 1 };
}
const nextLabel = () => { if (G.idx + 1 >= G.events.length) return '여정 마치기'; const g = group(); return g.k < g.n ? `이 자리의 다음 일 (${g.k + 1}/${g.n}) →` : '다음 장면으로 →'; };
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
// 카메라 높이는 고정 — 확대·축소 없이 늘 같은 비율로 (사용자 2026-11). 화면의 좁은 쪽으로 폰은 반경 8km, PC는 12km쯤 보이게:
// 인형·소품은 지형에 견주어 작게(호수·마을을 덮지 않게) 둔다
const fitZoom = () => G.cam.aspect < 1 ? 8 / (0.487 * G.cam.aspect) : 12 / 0.487;
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
  s.querySelector('#qHome').onclick = () => { snd.close(); location.href = `game.html?j=${JID}`; };
};

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
  G.water = Math.max(0, G.water - 1); drawWater(); snd.play(kind === 'lost' ? 'wind' : 'lose');
  document.body.classList.remove('shake'); void document.body.offsetWidth; document.body.classList.add('shake');
  if (kind === 'lost') {
    G.slowT = 4; $('#dust').classList.add('on'); setTimeout(() => $('#dust').classList.remove('on'), 3200);
    toast(`${LOST[Math.floor(Math.random() * LOST.length)]}<small>물병 하나를 잃고 잠시 느려집니다 · 단서를 다시 읽고 방향을 잡으세요</small>`);
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
  const v = $('#listen'); v.querySelector('iframe').src = `app.html?j=${JID}&one&lang=ko#${id}`; v.classList.remove('hidden'); snd.hold(true); snd.boat(0, false, false);
});
addEventListener('message', ev => { if (ev.origin === location.origin && ev.data === 'theway-one-done') $('#listenClose').click(); });
$('#listenClose').onclick = () => { const v = $('#listen'); v.classList.add('hidden'); v.querySelector('iframe').src = 'about:blank'; snd.hold(false); };
// 소리 켜고 끄기 (이 기기에 기억 — theway-game-sound)
const drawSound = () => { $('#sound').textContent = snd.on ? '소리 켬' : '소리 끔'; $('#sound').classList.toggle('off', !snd.on); };
$('#sound').onclick = () => { snd.unlock(); snd.setOn(!snd.on); drawSound(); }; drawSound();
const firstSentences = (t, n = 2) => (t.match(/[^.!?。]+[.!?。]+["”’]?/g) || [t]).slice(0, n).join(' ').trim();
const appLink = e => `${JID === 'jesus' ? 'app.html' : `app.html?j=${JID}`}#${e.id}`;
function quiz() {
  const e = G.events[G.idx], q = e.quiz;
  if (!q) { G.water = 3; drawWater(); return; }
  const s = sheet(`<div class="body quiz"><small>물병이 다 떨어졌어요 · 말씀으로 다시 채우기</small><h2>${esc(q.q)}</h2><div class="opts">${q.options.map((o, i) => `<button data-i="${i}">${esc(o)}</button>`).join('')}</div><div class="explain"></div></div>`);
  s.querySelector('.opts').onclick = ev => {
    const b = ev.target.closest('button'); if (!b || s.querySelector('.right')) return;
    const ok = +b.dataset.i === q.answer; snd.play(ok ? 'right' : 'wrong');
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
  G.grade = gradeNow(); G.meetLeft = Math.max(0, G.timeT); G.timeT = 0; G.leader.goal.copy(G.leader.pos);
  G.me.goal.copy(G.me.pos);
  G.leader.target = G.me; G.leader.set('speak'); G.me.target = G.leader;
  // 그분이 하신 말씀(j)이 있으면 그분 입으로, 없으면(수태고지처럼 아직 태어나시기 전 등) '이 자리의 말씀'으로 누가 한 말인지 밝혀서
  const own = (e.words || []).find(x => x.j), w = own || (e.words || [])[0];
  // 말씀은 곧 이어지는 '말씀 고르기'에서 맞히게, 말풍선에는 반기는 인사만 (먼저 보여 주면 너무 쉬웠다)
  const nm = me.name || '순례자', call = /^[가-힣]+$/.test(nm) ? josa(nm, '아', '야') : nm;
  G.meetWord = `${call}, 잘 찾아왔구나. 여기는 ${placeOf(e).name}.`;
  G.meetT = 3.2; snd.play('meet');
  $('#bubble').innerHTML = `<b>${esc(whoNow())}</b>${esc(G.meetWord)}`;
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
addEventListener('pointerdown', e => { if (G.meetT > 0.4 && !e.target.closest('#stick')) G.meetT = 0.01; });
// 모래시계 (사용자 2026-11): 늦어도 장면을 놓치지 않는다 — 그분은 그 자리에서 기다리시고, 얼마나 빨리 닿았는지가 카드 등급이 된다.
// 제한 시간 안이면 금, 그 뒤 제한 시간의 60%까지는 은, 그보다 늦으면 동. 등급이 내려갈 때 알린다
const gradeNow = () => G.timeT >= 0 ? 3 : G.timeT >= -G.timeMax * 0.6 ? 2 : 1;
function tickTime(dt) {
  const g0 = gradeNow(); G.timeT -= dt; const g1 = gradeNow();
  if (g1 < g0) { snd.play('late'); toast(g1 === 2 ? '금 카드 시간이 지났어요<small>서두르면 아직 은 카드를 받을 수 있어요</small>' : `은 카드 시간도 지났어요<small>그래도 ${esc(josa(JOURNEYS[JID].who, '은', '는'))} 그 자리에서 기다리세요 · 동 카드</small>`, false, 3000); }
}
function arrive() {
  const e = G.events[G.idx], straight = G.legStraight, ratio = straight > 1 ? G.legWalked / straight : 1;
  const stars = G.grade || 3; // 모래시계 등급 (금 3 · 은 2 · 동 1)
  G.stars[G.idx] = Math.max(G.stars[G.idx] || 0, stars);
  G.leader.look(0); G.me.target = null;
  if (G.met) {
    G.met = false;
    const g = group(); if (g.n > 1 && g.k === 1) toast(`${esc(placeOf(e).name)}에서 일어난 일이 ${g.n}가지예요<small>걷지 않고 이 자리에서 카드를 이어 받아요</small>`, true, 3200);
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
  const s = sheet(`<div class="img" style="background-image:url('${esc(cardSrc(e))}')"></div><div class="body quiz"><small>${G.idx + 1} / ${G.events.length} · ${esc(e.title)}${(g => g.n > 1 ? ` · 이 자리의 일 ${g.k}/${g.n}` : '')(group())}</small>
    <h2>이 자리에서 들은 말씀은?</h2><p class="sub">맞히면 말씀 카드를 얻어요</p>
    <div class="opts">${opts.map((o, i) => `<button data-i="${i}">${esc(o.text)}</button>`).join('')}</div><div class="explain"></div></div>`);
  s.querySelector('.opts').onclick = ev => {
    const b = ev.target.closest('button'); if (!b || s.querySelector('.right')) return;
    const ok = opts[+b.dataset.i] === w; snd.play(ok ? 'right' : 'wrong');
    s.querySelectorAll('.opts button').forEach((x, i) => { if (opts[i] === w) x.classList.add('right'); else if (x === b) x.classList.add('wrong'); });
    s.querySelector('.explain').innerHTML = `${esc(w.who || '')} · ${esc(w.ref || '')}<button class="go">${ok ? '카드 받기' : '계속'}</button>`;
    s.querySelector('.explain .go').onclick = () => done(ok);
  };
}
function missCard(e) {
  const s = sheet(`<div class="body"><small>${G.idx + 1} / ${G.events.length}</small><h2>아쉬워요, 이번에는 카드를 얻지 못했어요</h2><p class="sub">다시 걸을 때 이 자리의 말씀 카드에 도전할 수 있어요.</p>
    <div class="row"><a class="go ghost" href="${appLink(e)}" data-listen>이 장면 듣기</a><button class="go" id="next">${nextLabel()}</button></div></div>`);
  s.querySelector('#next').onclick = () => { closeSheet(); G.idx++; save(); G.idx < G.events.length ? startLeg() : finish(); };
}
function reveal(e, stars, straight) {
  {
    snd.play('card');
    const pts = Math.max(10, stars * 100 + Math.round(G.meetLeft || 0) * 10 - G.asks * ASK + (G.bonus || 0)), got = collect(e, stars, pts), fresh = got.fresh;
    const v = showCard(tcard(e, G.idx, { s: stars, p: pts }, 'big reveal'),
      `<div class="row"><a class="go ghost" href="${appLink(e)}" data-listen>이 장면 듣기</a><button class="go" id="next">${nextLabel()}</button></div>`,
      `<p class="gotcard">${fresh ? '새 말씀 카드!' : got.best ? '최고 기록 갱신!' : '이미 모은 카드'} +${num(pts)}점${straight >= SAME * 1.5 ? ` · 걸은 길 ${Math.round(G.legWalked)}km / 곧은 길 ${Math.round(straight)}km` : ''}</p>`);
    v.querySelector('#next').onclick = () => { closeSheet(); G.idx++; save(); G.idx < G.events.length ? startLeg() : finish(); };
  }
}
function cardPlain(e, stars, straight) {
  const w = (e.words || []).find(x => x.j) || (e.words || [])[0];
  const s = sheet(`${e.img ? `<div class="img" style="background-image:url('${esc(e.img.src)}')"><span class="stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</span></div>` : ''}
    <div class="body"><small>${G.idx + 1} / ${G.events.length} · ${esc(placeOf(e).name)}</small><h2>${esc(e.title)}</h2><p class="sub">${esc(e.subtitle || '')}</p>
    ${straight >= SAME * 1.5 ? `<div class="leg"><span>걸은 길 <b>${Math.round(G.legWalked)}km</b></span><span>곧은 길 ${Math.round(straight)}km</span><span>${'★'.repeat(stars)}</span></div>` : ''}
    <p class="story">${esc(firstSentences(e.story?.[0] || ''))}</p>
    ${w ? `${G.met ? `<small class="got">${G.newCard ? '새 말씀 카드를 얻었어요!' : '이미 모은 말씀 카드'}</small>` : ''}<blockquote class="${G.met ? 'won' : ''}">${esc(w.text)}<cite>${esc(w.who || '')} · ${esc(w.ref || '')}</cite></blockquote>` : ''}
    <div class="row"><a class="go ghost" href="${appLink(e)}" data-listen>이 장면 듣기</a><button class="go" id="next">${nextLabel()}</button></div></div>`);
  G.met = false;
  s.querySelector('#next').onclick = () => { closeSheet(); G.idx++; save(); G.idx < G.events.length ? startLeg() : finish(); };
}
function finish() {
  snd.play('end');
  const n = G.events.length, st = G.stars.reduce((a, b) => a + (b || 0), 0), km = Math.round(G.total), J = JOURNEYS[JID];
  const text = `그 길 순례 — ${me.name || '순례자'}, ${josa(J.who, '을', '를')} 따라 ${n}장면 ${km}km를 걸었습니다 · 말씀 카드 ${Object.keys(deck()).length}/${n}장 ${num(total(deck()))}점\nhttps://thewaymap.org/game.html?j=${JID}`;
  const s = sheet(`<div class="body"><small>${esc(J.name)}</small><h2>여정을 마쳤습니다</h2><p class="sub">${esc(me.name || '순례자')}님, ${n}장면을 모두 찾아 걸었어요.</p>
    <div class="leg"><span>걸은 길 <b>${km}km</b></span><span><b>${Math.floor(G.total / WALK) + 1}</b>일</span><span>★ <b>${st}</b>/${n * 3}</span></div>
    <p class="sub">말씀 카드 <b>${Object.keys(deck()).length}</b> / ${n}장 · 합계 <b>${num(total(deck()))}점</b></p>
    <p class="sub">이번 길의 카드 — 금 <b>${G.stars.filter(x => x === 3).length}</b> · 은 <b>${G.stars.filter(x => x === 2).length}</b> · 동 <b>${G.stars.filter(x => x === 1).length}</b> · 보물 <b>${G.foundRun || 0}</b>개</p>
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
function drawCardBtn() { const d = deck(), n = Object.keys(d).length, tn = Object.keys(tdeck()).length; $('#cardsBtn').innerHTML = `<b>${n}</b>/${G.events.length} 말씀 카드<small>${num(total(d) + tpoints())}점${tn ? ` · 보물 ${tn}` : ''}</small>`; }
// 보물: 찾은 것은 여정마다 이 기기에 (theway-game-treasure-<여정> — {보물: 찾은 횟수}), 이번 길에 숨긴 자리는 진행 기록(hide)에
const TLIST_ALL = TREASURES; let TLIST = [];
const tkey = () => 'theway-game-treasure-' + JID;
const tdeck = () => store.get(tkey(), {}) || {};
const tpoints = () => TLIST.reduce((n, t) => n + (tdeck()[t.id] ? RARITY[t.rarity].pts : 0), 0);
const tsrc = t => CARDS.files['t-' + t.id] ? `${CARDS.base}/${CARDS.files['t-' + t.id]}` : '';
// 반짝임: 둥글게 번지는 빛 한 장(희귀도마다 색) — 가까이(2.5km) 와야 보인다
const TGLOW = { common: '#ffe7a8', rare: '#9fd2ff', legend: '#ffb3f0' };
let glowTex = null;
function glowSprite(color) {
  if (!glowTex) { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,255,255,.7)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); glowTex = new THREE.CanvasTexture(c); }
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  sp.visible = false; return sp;
}
function placeTreasures() {
  G.tfx = {};
  for (const h of G.hide || []) { const t = TLIST.find(x => x.id === h.id); if (!t) continue; const sp = glowSprite(TGLOW[t.rarity]); G.scene.add(sp); G.tfx[h.id] = sp; }
}
function updateTreasures(px, pz, t) {
  for (const h of G.hide || []) {
    const sp = G.tfx?.[h.id]; if (!sp) continue;
    const d = Math.hypot(h.x - px, h.z - pz), vis = d < 2.5;
    sp.visible = vis;
    if (vis) { const k = 0.75 + Math.sin(t * 5 + h.x) * 0.25; sp.position.set(h.x, GH(h.x, h.z) + 0.35 + Math.sin(t * 2) * 0.06, h.z); sp.scale.setScalar(0.9 * k); sp.material.opacity = Math.min(1, (2.5 - d) / 0.8) * (0.6 + 0.4 * k); }
    if (vis && !h.near) { h.near = true; snd.play('twinkle'); }
    if (d < 0.7 && !G.busy) { foundTreasure(h); return; }
  }
}
function foundTreasure(h) {
  const t = TLIST.find(x => x.id === h.id), sp = G.tfx[h.id];
  if (sp) { G.scene.remove(sp); sp.material.dispose(); delete G.tfx[h.id]; } // 반짝임 재질만 버린다 (빛 그림은 함께 쓴다)
  G.hide = G.hide.filter(x => x !== h); G.foundRun = (G.foundRun || 0) + 1;
  const d = tdeck(), fresh = !d[t.id]; d[t.id] = (d[t.id] || 0) + 1; store.set(tkey(), d); save(); drawCardBtn();
  snd.play('treasure');
  const v = showCard(treasureCard(t, tsrc(t), 'big reveal', esc), `<div class="row"><button class="go" id="tBack">계속 걷기</button></div>`,
    `<p class="gotcard">숨겨진 보물을 찾았어요! · ${RARITY[t.rarity].name}${fresh ? ` · +${RARITY[t.rarity].pts}점` : ' · 이미 찾은 보물'}</p>`);
  v.querySelector('#tBack').onclick = closeSheet;
}
function openCards() {
  const d = deck(), have = new Set(Object.keys(d));
  const s = sheet(`<div class="body"><small>${esc(JOURNEYS[JID].name)}</small><h2>말씀 카드 ${have.size} / ${G.events.length} · ${num(total(d))}점</h2>
    ${store.get(temptKey(), 0) ? `<p class="sub tempt">시험을 이긴 카드 <b>${store.get(temptKey(), 0)}</b>장 — 유혹하는 뱀을 지나쳐 얻었어요</p>` : ''}
    <p class="sub">${esc(josa(JOURNEYS[JID].who, '을', '를'))} 만나 그 자리의 말씀을 맞히면 카드를 얻어요. 빨리 닿을수록 금 카드 — 은·동 카드는 다시 걸어 금으로 바꾸세요.</p>
    <div class="deck">${G.events.map((e, i) => have.has(e.id) ? `<button class="slot">${tcard(e, i, d[e.id], 'mini')}</button>`
      : `<div class="slot lock"><small>${String(i + 1).padStart(2, '0')}</small><b>?</b></div>`).join('')}</div>
    ${TLIST.length ? `<h3 class="thd">숨겨진 보물 ${Object.keys(tdeck()).length} / ${TLIST.length}</h3>
    <p class="sub">비유와 이야기 속 보물이 걸을 때마다 새로 숨어요. 가까이 가면 반짝여요 — 전설 보물은 가끔만 나타나요.</p>
    <div class="deck tdeck">${TLIST.map(t => tdeck()[t.id] ? `<button class="slot" data-t="${t.id}">${treasureCard(t, tsrc(t), 'mini', esc)}</button>`
      : `<div class="slot lock tlock ${t.rarity}"><small>${RARITY[t.rarity].name}</small><b>?</b><i>${esc(t.clue)}</i>${(G.hide || []).some(h => h.id === t.id) ? '<em>이번 길에 숨어 있어요</em>' : ''}</div>`).join('')}</div>` : ''}
    <button class="go" id="closeCards">${G.me ? "계속 걷기" : "닫기"}</button></div>`);
  s.querySelector('#closeCards').onclick = closeSheet;
  s.querySelector('.tdeck')?.addEventListener('click', ev => { const b = ev.target.closest('[data-t]'); if (!b) return; const t = TLIST.find(x => x.id === b.dataset.t);
    const v = showCard(treasureCard(t, tsrc(t), 'big', esc), `<div class="row"><button class="go" id="backDeck">카드 모음으로</button></div>`); v.querySelector('#backDeck').onclick = openCards; });
  s.querySelector('.deck').onclick = ev => { const b = ev.target.closest('.tcard[data-i]'); if (!b) return; const i = +b.dataset.i, e = G.events[i];
    const v = showCard(tcard(e, i, d[e.id], 'big'), `<div class="row"><a class="go ghost" href="${appLink(e)}" data-listen>이 장면 듣기</a><button class="go" id="backDeck">카드 모음으로</button></div>`);
    v.querySelector('#backDeck').onclick = openCards; };
}
$('#cardsBtn').onclick = () => openCards();
const save = () => store.set('theway-game-' + JID, { idx: G.idx, total: G.total, stars: G.stars, hide: (G.hide || []).map(({ id, x, z }) => ({ id, x, z })) });

/* ---------- 한 구간 ---------- */
// 시간 안에 닿으면 그분을 3D로 가까이 만나고(meet), 늦으면 그분은 벌써 다음 장면 자리로 걸어가신다 —
// 나는 그 장면을 놓치고 다음 장면으로 간다. 길 위에서 따라잡아도 만남은 다음 장면의 자리에 닿아야 (사용자 2026-11)
// 미션 글: 처음엔 장소 이름 없이 지방과 장면만(단서) — 어디인지 맞혀 찾아가게 (다 알려 주면 너무 쉬웠다, 사용자 2026-11).
// 길을 물으면(첫 번째) 장소 이름을, 그다음부터는 방향을 잠깐 알려 준다. 5km 안으로 다가가도 이름이 드러난다
// 그분이 걸어오신 발자국 길: 앞 장면 쪽에서 목적지까지 마지막 TRACK km를 구불구불하게 (물은 건너뛴다)
function makeTrail(gx, gz, from) {
  const prev = G.events[G.idx - 1], [fx, fz] = from || (prev ? xzOf(prev) : [G.me.pos.x, G.me.pos.y]);
  let dx = fx - gx, dz = fz - gz, L = Math.hypot(dx, dz);
  if (L < SAME) { const a = Math.random() * 6.283; dx = Math.cos(a); dz = Math.sin(a); L = 1; } // 같은 자리·처음: 아무 쪽에서
  dx /= L; dz /= L;
  const len = Math.min(TRACK, Math.max(L * 0.9, 6)), n = Math.round(len / PRINT_GAP), ph = Math.random() * 6.283, amp = 1.1 + Math.random() * 0.8, out = [];
  let px = gx + dx * len, pz = gz + dz * len;
  for (let i = 0; i <= n; i++) {
    const u = i / n, w = Math.sin(u * Math.PI * 2.4 + ph) * amp * Math.pow(1 - u, 0.8); // 목적지에 가까울수록 곧게
    const x = gx + dx * len * (1 - u) - dz * w, z = gz + dz * len * (1 - u) + dx * w;
    const a = Math.atan2(x - px, z - pz); px = x; pz = z;
    if (i && blocked(x, z) && Math.hypot(x - gx, z - gz) > SAME * 2.2) continue;
    out.push([x, z, a, i % 2 ? 1 : -1]);
  }
  return out;
}
const fm = new THREE.Object3D();
function drawPrints(px, pz) {
  const P = G.prints; if (!P) return;
  let n = 0;
  if (!G.busy) for (const [x, z, a, side] of G.trail || []) {
    const d = Math.hypot(x - px, z - pz); if (d > PRINT_R || n >= MAXP) continue;
    const k = Math.min(1, (PRINT_R - d) / 0.6); // 가장자리에서 서서히
    fm.position.set(x + Math.cos(a) * 0.07 * side, GH(x, z) + 0.03, z - Math.sin(a) * 0.07 * side); fm.rotation.set(0, a, 0); fm.scale.setScalar(k);
    fm.updateMatrix(); P.setMatrixAt(n++, fm.matrix);
  }
  P.count = n; P.instanceMatrix.needsUpdate = true;
  if (n > 4 && !G.trailTold) { G.trailTold = true; toast(`${esc(whoNow())}의 발자국이에요!<small>발자국을 따라가면 그분이 계신 곳이 나와요</small>`, true, 3400); }
}
function missionText() {
  const e = G.events[G.idx], p = placeOf(e);
  $('#mTitle').textContent = G.named ? `${p.name} — ${e.title}` : `${p.region || '어딘가'}의 어느 곳 — ${e.title}`;
  $('#mClue').textContent = e.subtitle || '';
}
// 그분 곁에 함께 서는 사람 (game-cast.js): 장면마다 정한 사람, 없으면 제자를 부르신 뒤로는 제자 둘.
// 모델은 그 장면에서 처음 쓸 때 받는다(R2) — 처음부터 다 받으면 무거웠다
const SPOTS = [[-0.55, 0.65], [1.6, 0.55], [0.15, -0.75], [1.3, -0.7]];
function castFor(i) {
  const e = G.events[i], c = CAST[JID]?.[e.id]; if (c) return c;
  const F = FOLLOW[JID], k = F && G.events.findIndex(x => x.id === F.from);
  return F && k >= 0 && i >= k ? [F.pool[i % F.pool.length], F.pool[(i + 1) % F.pool.length]] : [];
}
let castTok = 0;
async function placeCast() {
  const tok = ++castTok;
  for (const c of G.cast || []) c.dispose(); G.cast = [];
  const [gx, gz] = goalXZ(), names = castFor(G.idx).slice(0, SPOTS.length);
  const gs = await Promise.all(names.map(n => model(n)));
  if (tok !== castTok) return; // 그새 다음 장면으로 넘어갔다
  gs.forEach((g, i) => {
    if (!g) return; // 아직 없는 모델(베드로 등)은 건너뛴다
    // 물(호숫가 장소)이면 그분 둘레를 돌며 뭍을 찾아 세운다
    let [ox, oz] = SPOTS[i];
    const wetAt = (x, z) => { const [la, ln] = toLL(x, z); return Object.values(WATERS).some(w => inPoly(la, ln, w)); }; // 목표 둘레·갈릴리도 물로 친다 (blocked는 둘 다 봐준다)
    for (let k = 0; k < 12 && wetAt(gx + ox, gz + oz); k++) { const r = Math.hypot(ox, oz), t = Math.atan2(oz, ox) + 0.52; ox = Math.cos(t) * r; oz = Math.sin(t) * r; }
    const a = new ModelActor(g, gx + ox, gz + oz);
    a.big = SCALE * (SIZE[names[i]] || 1); a.target = G.me; a.showT = 0; a.show = 0;
    if (names[i] === 'goliath') a.set('taunt'); // 골리앗은 가슴을 치며 이스라엘을 모욕한다(삼상 17:10)
    G.scene.add(a.p.root); G.cast.push(a);
  });
}
// 마을 사람: 우물가에 물 긷는 여인, 양 떼 곁에 목자 (예수 여정, 모델이 있을 때만)
async function placeLocals() {
  G.locals = [];
  if (JID !== 'jesus') return;
  const [w, s] = await Promise.all([model('woman'), model('shepherd')]);
  const put = (g, list, n) => g && list.slice(0, n).forEach(([x, z], i) => { const a = new ModelActor(g, x + 0.7, z + 0.4); a.big = SCALE; a.face = i; a.look(i); a.p.root.visible = false; G.scene.add(a.p.root); G.locals.push(a); });
  put(w, G.world.wells, 8); put(s, G.world.flocks || [], 6);
  // 어부: 갈릴리 물가 마을 (그물을 손질하던 자리)
  const f = await model('fisherman'), P = G.data.places;
  put(f, ['capernaum', 'tabgha', 'bethsaida'].filter(k => P[k]).map(k => toXZ(P[k].lat, P[k].lng)), 3);
}
// 이 장면에서 앞서 걷는 사람 (game-cast.js LEADS): 모세 → 여호수아, 소년 → 용사 → 왕 다윗, 열왕기의 선지자들
function leadAt(i) {
  let r = null;
  for (const l of LEADS[JID] || []) { const k = G.events.findIndex(x => x.id === l[0]); if (k >= 0 && k <= i) r = l; }
  return r;
}
const whoNow = () => leadAt(G.idx)?.[2] || JOURNEYS[JID].who;
// 장면이 넘어가 앞서 걷는 사람이 바뀌면 모델만 갈아 끼운다 — 자리·가는 곳·걸음은 그대로
let leadTok = 0;
async function swapLeader() {
  const l = leadAt(G.idx), name = l?.[1] || JOURNEYS[JID].model;
  if (!name || name === G.leaderName) return;
  const tok = ++leadTok, g = await model(name);
  if (!g || tok !== leadTok || !G.leader) return;
  const o = G.leader, a = new ModelActor(g, o.pos.x, o.pos.y);
  a.goal.copy(o.goal); a.speed = o.speed; a.pose = o.pose; a.target = o.target; a.face = o.face;
  a.big = o.big; a.realWalk = true; a.showT = o.showT; a.show = o.show; a.ground = o.ground;
  if (o.dispose) o.dispose(); else bin(o.p.root, G.scene);
  G.leader = a; G.leaderName = name; G.scene.add(a.p.root);
}
function startLeg(walkFrom) {
  const e = G.events[G.idx], [gx, gz] = goalXZ();
  swapLeader();
  if (walkFrom) { G.leader.pos.set(...walkFrom); G.leader.goal.set(gx + 0.6, gz); G.leader.set('idle'); }
  else { G.leader.pos.set(gx + 0.6, gz); G.leader.goal.copy(G.leader.pos); G.leader.set('idle'); }
  G.trail = makeTrail(gx, gz, walkFrom);
  G.legStart = [G.me.pos.x, G.me.pos.y]; G.legWalked = 0; G.legT = 0; G.lostT = 0; G.asks = 0; G.askT = 0;
  G.legStraight = Math.hypot(gx - G.me.pos.x, gz - G.me.pos.y);
  G.prevD = G.legStraight;
  G.speed = Math.max(9, G.legStraight / 16); // 먼 길(바벨론 포로길 등)도 20초 남짓에 걷게
  // 제한 시간: 곧장 걸으면 걸릴 시간의 1.7배 + 6초. 그분은 그 시간의 절반쯤에 다음 자리에 닿으시게 걸으신다
  G.timeMax = G.timeT = G.legStraight / G.speed * 2.3 + 10; // 목적지를 지도에서 찾아야 하니 넉넉히
  if (walkFrom) G.leader.speed = Math.max(4, Math.hypot(gx - walkFrom[0], gz - walkFrom[1]) / (G.timeMax * 0.5));
  $('#mNo').textContent = `${G.idx + 1} / ${G.events.length} · ${josa(whoNow(), '이', '가')} 계신 곳`;
  G.named = false; missionText(); G.bonus = 0; spawnLegEvents();
  snd.music(e.music); // 앱에서 이 장면에 까는 곡 그대로
  placeCast();
  G.busy = false;
  // 같은 자리에서 이어지는 장면: 다시 반기는 인사 없이 곧바로 말씀 고르기로 (사용자 2026-11). 남은 시간 점수는 6초로 친다
  if (G.legStraight < SAME) { G.busy = true; G.timeT = 0; G.meetLeft = 6; G.met = true; G.grade = 3; setTimeout(arrive, 400); }
}

// 여정의 장면·장소와 카드 그림 목록 (시작 화면에서 카드 모음만 볼 때도)
async function loadJourney() {
  if (G.data && G.dataJ === JID) return;
  [G.data, CARDS] = await Promise.all([fetch(JOURNEYS[JID].data).then(r => r.json()), fetch('assets/cards.json').then(r => r.json()).catch(() => CARDS)]);
  TLIST = TLIST_ALL[JID] || [];
  G.dataJ = JID; G.events = G.data.events.filter(e => G.data.places[e.place] && !G.data.places[e.place].hidden);
}
async function begin(fresh) {
  snd.unlock(); // 시작 단추를 누른 이 순간에 소리를 깨운다 (아이폰)
  me.name = $('#name').value.trim() || '순례자'; store.set('theway-game-me', me);
  if (fresh) store.set('theway-game-' + JID, null);
  const J = JOURNEYS[JID];
  await loadJourney();
  const saved = store.get('theway-game-' + JID, null);
  G.idx = saved?.idx || 0; G.total = saved?.total || 0; G.stars = saved?.stars || []; G.missed = [];
  G.hide = saved?.hide || hideTreasures(TLIST, G.data.places, toXZ, (x, z) => { const [la, ln] = toLL(x, z); return Object.values(WATERS).some(p => inPoly(la, ln, p)); });
  $('#setup').classList.add('hidden');
  for (const s of ['#hud', '#waterBox', '#dayBox', '#arrow', '#stick', '#cardsBtn', '#ask', '#quit', '#sound']) $(s).classList.remove('hidden');
  // 꾸미기 화면의 미리보기는 이제 그리지 않으니 인형과 렌더러를 놓아 준다
  if (pv.actor) { if (pv.actor.dispose) pv.actor.dispose(); else bin(pv.actor.p.root, pv.scene); pv.actor = null; } pv.r.dispose(); // 모델은 나와 함께 쓰니 몸은 버리지 않는다
  G.r = renderer($('#world'));
  buildWorld(J); placeTreasures();
  playerType();
  // 출발: 처음이면 첫 장면에서 조금 떨어진 곳, 이어 걷기면 앞 장면 자리
  const ref = G.events[Math.max(0, G.idx - 1)], [rx, rz] = toXZ(placeOf(ref).lat, placeOf(ref).lng);
  let sx = rx, sz = rz;
  if (G.idx === 0) for (const [dx, dz] of [[0, 22], [16, 16], [-16, 16], [20, 0], [-20, 0], [0, -22]]) if (!blocked(rx + dx, rz + dz)) { sx = rx + dx; sz = rz + dz; break; }
  // 출발 자리가 물 위면(갈릴리 바다 한가운데의 장면 다음 등) 가장 가까운 뭍으로
  if (blocked(sx, sz) || onGalilee(sx, sz)) outer: for (let r = 2; r < 80; r += 2) for (let k = 0; k < 16; k++) { const a = k / 16 * 6.283, x = sx + Math.cos(a) * r, z = sz + Math.sin(a) * r; if (!blocked(x, z) && !onGalilee(x, z)) { sx = x; sz = z; break outer; } }
  // 그분: 3D 모델(glb, R2)이 있으면 그것으로, 못 받으면 예전 인형으로 (사용자 2026-11).
  // 모델을 다 받은 뒤에 나(G.me)를 세운다 — 매 화면이 G.me가 있으면 그분도 있다고 보고 그린다
  const lname = leadAt(G.idx)?.[1] || J.model; // 이어 걷기면 그 장면의 사람으로 (여호수아·왕 다윗 등)
  const lead = lname && await model(lname) && new ModelActor(await model(lname));
  G.leader = lead || new Actor(J.leader, 0, 0, 0, { gaze: false }); G.leaderName = lead ? lname : null;
  G.me = await pilgrim(sx, sz); G.me.realWalk = true; G.me.big = SCALE;
  [G.soldierG, G.manG] = await Promise.all([model('soldier'), model('pilgrim-man')]); // 병정·길가의 쓰러진 사람
  G.leader.realWalk = true; G.leader.big = SCALE; G.leader.target = G.me;
  G.scene.add(G.me.p.root, G.leader.p.root);
  drawWater(); drawCardBtn(); resize();
  toast('땅과 마을을 세우는 중…', true, 6000);
  await G.world.ready; $('#toast').classList.remove('on');
  spawnPatrols(); placeLocals();
  startLeg();
  if (G.idx === 0) toast(`${esc(me.name)}님, ${esc(josa(J.who, '을', '를'))} 따라 걸어요<small>지도에서 장소 이름을 찾아 걸어가세요 · 가까이 가면 그분의 발자국이 보여요</small>`, true, 4200);
}

/* ---------- 이름표·화살표 ---------- */
const tags = $('#tags'), v3 = new THREE.Vector3();
const screen = (x, y, z) => { v3.set(x, y, z).project(G.cam); return [(v3.x + 1) / 2 * innerWidth, (1 - v3.y) / 2 * innerHeight, v3.z < 1]; };
let tagEls = [];
function drawTags() {
  const list = [];
  const [gx, gz] = goalXZ() || [0, 0], e = G.events[G.idx];
  list.push({ cls: 'me', text: me.name, pos: [G.me.pos.x, G.me.ground + SCALE * 1.15, G.me.pos.y] });
  // 목적지는 따로 드러내지 않는다 — 다른 장소와 같은 이름표로 지도에서 찾게 (4km 안에 오면 그때 크게, 사용자 2026-11)
  const dGoal = Math.hypot(gx - G.me.pos.x, gz - G.me.pos.y);
  if (e && dGoal < 4) list.push({ cls: 'goal', text: placeOf(e).name, pos: [gx, GH(gx, gz) + SCALE * 1.25, gz] });
  // 둘레의 다른 장소 이름 (여정에 나오는 곳만, 가까운 순서로 몇 개)
  const seen = new Set(e && dGoal < 4 ? [e.place] : []), near = [];
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
      G.seaT = 0; G.stepped = true;
      const moved = Math.hypot(nx - me0.pos.x, nz - me0.pos.y);
      me0.speed = sp; me0.goal.set(me0.pos.x + (nx - me0.pos.x) * 2, me0.pos.y + (nz - me0.pos.y) * 2);
      G.legWalked += moved; G.total += moved;
      // 길 잃음: 목표에서 멀어지는 쪽으로 오래 걸으면
      const [gx, gz] = goalXZ(), d = Math.hypot(gx - nx, gz - nz);
      if (d > G.prevD + 1e-3) G.lostT += dt; else G.lostT = Math.max(0, G.lostT - dt * 1.5);
      G.prevD = d;
      if (G.lostT > 3.2 && G.legT > 2) penalty('lost');
      // 만남은 그 장면의 자리에서만 — 늦게 닿은 앞 자리(두로)에서 떠나시는 그분을 따라잡으면 다음 장면(데가볼리)의 문제가 나와 어리둥절했다(사용자 2026-11)
      if (d < ARRIVE) { G.busy = true; me0.goal.copy(me0.pos); save(); meet(); }
    }
  } else me0.goal.copy(me0.pos);
  // 그분은 가까이(SEE — 이 지도에서는 인형 키의 두 배 남짓) 가야 보인다. 멀리서는 발자국만 (사용자 2026-11)
  const near = Math.hypot(G.leader.pos.x - me0.pos.x, G.leader.pos.y - me0.pos.y) < SEE || G.meetT > 0 || G.busy;
  G.leader.showT = near ? 1 : 0;
  const H = (x, z) => Math.max(0, G.world?.heightAt(x, z) || 0);
  const sailing = onGalilee(me0.pos.x, me0.pos.y);
  snd.walk(dt, G.stepped && !sailing, G.slowT > 0); snd.boat(dt, sailing && !G.busy, G.stepped); G.stepped = false;
  me0.ground = sailing ? LAKE_LEVEL.galilee + 0.3 : H(me0.pos.x, me0.pos.y); G.leader.ground = H(G.leader.pos.x, G.leader.pos.y);
  if (sailing && !G.boat) { G.boat = makeProp('boat', 0, 0, { scale: SCALE * 0.9 }).obj; G.scene.add(G.boat); toast('배를 타고 갈릴리 바다를 건너요', true, 2000); }
  if (G.boat) { G.boat.visible = sailing; if (sailing) { G.boat.position.set(me0.pos.x, LAKE_LEVEL.galilee, me0.pos.y); G.boat.rotation.y = -me0.face + Math.PI / 2; } }
  for (const P of G.patrols || []) P.s.update(t, dt);
  if (G.wounded) G.wounded.a.update(t, dt);
  me0.update(t, dt); G.leader.update(t, dt);
  // 곁에 선 사람은 그분처럼 가까이 가야 보인다. 마을 사람은 가까울 때만 움직인다(멀면 그리지도 셈하지도 않는다)
  for (const c of G.cast || []) { c.showT = G.leader.showT; c.ground = GH(c.pos.x, c.pos.y); c.update(t, dt); }
  for (const a of G.locals || []) { const far = Math.hypot(a.pos.x - me0.pos.x, a.pos.y - me0.pos.y) > 14; a.showT = far ? 0 : 1; if (far && a.show < 0.02) { a.p.root.visible = false; continue; } a.ground = GH(a.pos.x, a.pos.y); a.update(t, dt); }
  G.world?.update(t, dt, me0.pos);
  // 하루(30km) 걷는 동안 아침 → 밤 (밤에는 마을 불빛)
  // 밤낮은 실제로 논 시간으로 6분에 한 바퀴 (걸은 거리로 돌리니 몇 초마다 밤낮이 바뀌었다 — 사용자 2026-11). 아침에서 시작
  G.clock = (G.clock || 0) + dt;
  G.world?.setTime((G.clock / 360 + 0.22) % 1);
  drawPrints(me0.pos.x, me0.pos.y); updateTreasures(me0.pos.x, me0.pos.y, t);
  const dp = Math.hypot(...(goalXZ() || [0, 0]).map((v, i) => v - (i ? me0.pos.y : me0.pos.x)));
  G.askT -= dt;
  if (!G.named && dp < 5) { G.named = true; missionText(); }
  // 카메라: 북쪽이 위, 비스듬히 내려다보며 따라간다
  if (!G.zoomFix) G.zoom = fitZoom(); // 확인용(?debug)만 G.zoomFix로 높이를 바꾼다
  const cx = me0.pos.x, cz = me0.pos.y, h = G.zoom;
  if (!G.busy && !(G.meetT > 0)) tickTime(dt);
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
  const tb = $('#mTime'), gr = gradeNow(), left = gr === 3 ? G.timeT : gr === 2 ? G.timeT + G.timeMax * 0.6 : 0;
  tb.hidden = G.busy; tb.textContent = gr === 1 ? '⏳ 동 카드' : `⏳ ${Math.ceil(left)}초 · ${gr === 3 ? '금' : '은'}`;
  tb.className = ['', 'bronze', 'silver', 'gold'][gr]; tb.classList.toggle('hurry', gr > 1 && left < 6);
  $('#mWalk').textContent = `걸은 길 ${Math.round(G.total)}km`;
  $('#days').textContent = Math.floor(G.total / WALK) + 1;
  G.r.render(G.scene, G.cam);
  drawTags();
}

if (new URLSearchParams(location.search).has('debug')) window.__game = { G, me, toXZ, goalXZ, steer: (x, z) => { stick.x = x; stick.y = z; }, startLeg: (...a) => startLeg(...a) }; // 끝까지 자동으로 걸어 보는 확인용
setupUI(); resize();
requestAnimationFrame(frame);

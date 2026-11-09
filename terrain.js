/* 그 길 — 3D 지형 모드.
   실제 고도 자료(assets/terrain/*-height.png)로 땅을 솟게 하고 2D 지도와 같은 색(-color.webp)을 입혀 비스듬히 내려다본다.
   지역(갈릴리·유대·애굽)은 가까이 갈 때 하나씩 불러오고, 그 바깥은 2D 지도의 바탕 그림을 평평하게 깔아 이어 보인다.
   지도 한켠의 조작기: 3D 켜고 끄기, 기울이기, 돌리기, 당기기, 처음 시점.
   마우스: 끌면 옮기고, 오른쪽 버튼(또는 Shift)으로 끌면 돌리고 기울이고, 바퀴로 당긴다. 손가락: 하나로 옮기고, 둘로 벌려 당기고 비틀어 돌린다.
   좌표는 2D 지도와 같은 지도 단위(app.js의 px, 1단위 = 1/1000도 ≈ 111m). 높이는 EXAG배로 과장한다.
   켜져 있는 동안 window.geoToClient를 3D 투영으로 바꿔 끼워, 3D 무대(stage.js)가 지형 위의 같은 자리에 선다 */
import { THREE, damp, glowTexture } from './stage/kit.js';
import { buildJerusalem, EXTENT as JLM, DECKS } from './stage/jerusalem.js';
import { MODELS as EGYPT_MODELS } from './stage/egypt.js';
import { SCRIPTS } from './stage/scenes.js';

// 지역: _src/terrain.py와 같게. fade: 높이를 해수면으로 풀어 내리는 가장자리 (맞닿은 쪽은 풀지 않는다)
const TREG = {
  galilee: { lat0: 32.55, lat1: 33.45, lng0: 35.0, lng1: 35.95, fade: 'nwe' },
  judea: { lat0: 30.96, lat1: 32.55, lng0: 35.0, lng1: 35.95, fade: 'swe' },
  egypt: { lat0: 29.8, lat1: 31.35, lng0: 30.95, lng1: 32.65, fade: 'nswe' },
  // 모세 여정만(south): 시내 반도와 그 북쪽 광야(가데스·호르산)는 29.8°에서 맞닿는다. 광야라 나무·마을을 두지 않고 오아시스에 종려나무만(wild) — 진영은 무대가 세운다
  sinai: { lat0: 28.2, lat1: 29.8, lng0: 32.65, lng1: 35.6, fade: 'swe', south: 1, wild: 1 },
  negev: { lat0: 29.8, lat1: 30.95, lng0: 32.65, lng1: 35.6, fade: 'nwe', south: 1, wild: 1 },
};
const EXAG = 1.8, M = 1 / 111; // 높이 과장 배율, 1m = 1/111 지도 단위
const lv = m => m * M * EXAG;  // 고도(m) → 높이
// 호수: [GEO 이름, 수면 고도(m) — 없으면 평지의 얕은 호수]
const LAKES = [['galilee', -210], ['dead', -395], ['hula', 72], ['mareotis'], ['manzala'], ['sirbonis'], ['bitter']];
const RIVERS = ['jordanN', 'jordanS', 'nile', 'canopic', 'rosetta', 'damietta', 'pelusiac'];
// 넓게 그리는 강의 반폭(지도 단위, 1 = 약 111m): 요단은 그 시대 골짜기의 물길처럼 넓게 — 가는 관은 멀리서 실처럼 보였다
const RIVER_W = { jordanN: 0.9, jordanS: 1.2 };
const RIVER_SRC = { jordanN: 0.25 }; // 시작에서 이만큼(전체 길이 비율)을 지나며 제 폭이 된다
// 바다 해안선: app.js buildMap의 바다 판과 같게 (남쪽은 시나이 북부 → 나일 삼각주 → 알렉산드리아)
const SINAI = [[31.13, 33.8], [31.15, 33.1], [31.26, 32.3], [31.52, 31.85], [31.47, 30.4], [31.2, 29.9], [30.9, 28.5], [30.8, 26]];
// 바탕 그림 두 장: app.js의 RELIEF, RELIEF_WEST와 같게 (프롤로그의 RELIEF_EAST는 3D를 쓰지 않아 빠진다)
const BASES = [{ src: 'assets/relief.webp', lat0: 29.15, lat1: 34.6, lng0: 33.0, lng1: 37.4, y: 0 }, { src: 'assets/relief-west.webp', lat0: 29.15, lat1: 31.9, lng0: 29.4, lng1: 33.25, y: -0.05 }];
// 시내 반도·미디안 바탕(모세 여정, app.js의 RELIEF_SOUTH): 다른 바탕 위에. 애굽 지형 지역과 겹치는 북쪽 끝은 잘라(cut) 지형의 높이를 덮지 않게
const SOUTH = { src: 'assets/relief-south.webp', lat0: 27.2, lat1: 30.15, lng0: 31.25, lng1: 37.4, y: 0.02, cut: 29.8 };

const wrap = document.querySelector('.mapwrap'), svg = document.getElementById('map');
let renderer, scene, camera, sun, hemi, env, on = false, ready = false, loading = null;
const NIGHT_SKY = new THREE.Color('#121a30'), MOON_H = new THREE.Color('#5c6fae'), MOON_S = new THREE.Color('#b4c4f0'); let nightK = 0;
const SKY = new THREE.Color('#d6dcd6'), LIT = { hemi: new THREE.Color('#fff4dc'), sun: new THREE.Color('#fff0d4') };
const regions = Object.entries(TREG).map(([name, r]) => {
  const [X0, Z0] = px([r.lat1, r.lng0]), [X1, Z1] = px([r.lat0, r.lng1]);
  return { name, ...r, X0, Z0, X1, Z1, heights: null, hw: 0, hh: 0, load: null, color: null };
});
const regionAt = (x, z) => regions.find(r => x >= r.X0 && x <= r.X1 && z >= r.Z0 && z <= r.Z1);
// 카메라: 바라보는 점(tx, tz), 거리, 기울기(내려다보는 각), 방위
const cam = { tx: 0, tz: 0, dist: 150, pitch: 0.62, yaw: 0, goal: null };
const placeDist = k => (isCity(k) ? 42 : 150);
// 장면의 무대가 선 곳: 장면 안에서 옮겨 가는 장면(app.js의 start·stops)은 지금 있는 곳. 무대의 at(핀에서 떨어진 지점)은 장면의 장소에 있을 때만
const placeOf = ev => window.stagePlaceOf?.(ev) || ev.place;
const atOf = ev => (placeOf(ev) === ev.place ? SCRIPTS[ev.id]?.at : null); // 도성 안 장소는 바짝 다가가 3D 도성이 보이게
const CITY = (() => { const [x0, z0] = px([JLM.lat1 + 0.003, JLM.lng0 - 0.004]), [x1, z1] = px([JLM.lat0 - 0.003, JLM.lng1 + 0.004]); return { x0, z0, x1, z1 }; })();
// 3D 도성 모형 안의 장소 (베다니처럼 성 밖 마을은 아니다 — 거기는 보통 거리에서 집을 둔다)
const isCity = k => { const [x, z] = px([PLACES[k].lat, PLACES[k].lng]); return x > CITY.x0 && x < CITY.x1 && z > CITY.z0 && z < CITY.z1; };

/* ---------- 높이 ---------- */
function heightAt(x, z) { // 지도 단위 좌표의 지형 높이 (불러온 지역 안이면 쌍선형, 바깥은 0)
  const r = regionAt(x, z);
  if (!r || !r.heights) return 0;
  const u = (x - r.X0) / (r.X1 - r.X0) * (r.hw - 1), v = (z - r.Z0) / (r.Z1 - r.Z0) * (r.hh - 1);
  const i = Math.min(r.hw - 2, Math.floor(u)), j = Math.min(r.hh - 2, Math.floor(v)), fu = u - i, fv = v - j, H = r.heights, w = r.hw;
  return (H[j * w + i] * (1 - fu) + H[j * w + i + 1] * fu) * (1 - fv) + (H[(j + 1) * w + i] * (1 - fu) + H[(j + 1) * w + i + 1] * fu) * fv;
}
// 무대 인물·소품이 서는 높이: 땅, 호수면(배는 물 위에), 도성 모형의 성전 단 윗면 가운데 높은 것
const inPoly = ([x, z], P) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) if ((P[i][1] > z) !== (P[j][1] > z) && x < (P[j][0] - P[i][0]) * (z - P[i][1]) / (P[j][1] - P[i][1]) + P[i][0]) c = !c; return c; };
let pools = null, decks = null;
function standAt(x, z) {
  let h = heightAt(x, z);
  pools ??= LAKES.filter(([, m]) => m !== undefined).map(([k, m]) => ({ P: GEO[k].map(p => px(p)), top: lv(m) + 0.25 }));
  pools.forEach(L => { if (h < L.top && inPoly([x, z], L.P)) h = L.top; });
  if (city) {
    decks ??= DECKS.map(d => { const P = d.ll.map(p => px(p)), xs = P.map(p => p[0]), zs = P.map(p => p[1]); // 모형 조각은 가운데 땅 높이만큼 올렸다 (addModel)
      return { P, top: heightAt((Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...zs) + Math.max(...zs)) / 2) + d.top }; });
    decks.forEach(d => { if (h < d.top && inPoly([x, z], d.P)) h = d.top; });
  }
  return h;
}
const loadImg = src => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; });
const mapTex = img => { const t = new THREE.Texture(img); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); t.needsUpdate = true; return t; };

/* ---------- 바탕: 하늘·빛·물 반사 ---------- */
async function build() {
  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const c = renderer.domElement; c.className = 'terrain3d'; c.setAttribute('aria-hidden', 'true');
  c.style.display = ''; // three.js가 박아 넣는 display:block을 지워 CSS(.terrain-on일 때만 보임)가 켜고 끄게 한다 — 3D를 꺼도 화면이 남던 것
  svg.after(c);
  scene = new THREE.Scene();
  const sky = '#d6dcd6'; // 땅색이 살짝 섞인 옅은 하늘 — 지평선에서 땅과 하늘이 부드럽게 만난다
  scene.background = new THREE.Color(sky);
  scene.fog = new THREE.Fog(sky, 260, 900);
  camera = new THREE.PerspectiveCamera(38, 1, 1, 4000);
  hemi = new THREE.HemisphereLight('#fff4dc', '#6b5a44', 1.35); scene.add(hemi);
  sun = new THREE.DirectionalLight('#fff0d4', 2.4); // 북서쪽 해 — 그림자 상자는 카메라를 따라다닌다 (loop)
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0005;
  scene.add(sun, sun.target);
  // 물 반사용 주변광: 하늘 그라데이션을 PMREM으로 굽는다
  const envScene = new THREE.Scene(), g = new THREE.SphereGeometry(10, 32, 16), col = [];
  for (let i = 0; i < g.attributes.position.count; i++) { const y = g.attributes.position.getY(i) / 10; const cc = new THREE.Color('#e8eef0').lerp(new THREE.Color('#7fa7c0'), Math.max(0, y)); col.push(cc.r, cc.g, cc.b); }
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  envScene.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
  env = new THREE.PMREMGenerator(renderer).fromScene(envScene).texture;
  // 가장 아래: 땅색 큰 판 (바탕 그림의 투명한 가장자리 밑과 그 바깥)
  const land = new THREE.Mesh(new THREE.PlaneGeometry(30000, 30000), greyable(new THREE.MeshStandardMaterial({ color: '#e3d5b4', roughness: 1 })));
  land.rotation.x = -Math.PI / 2; land.position.y = -8; land.receiveShadow = true; scene.add(land);
  if (window.journeyMap?.south && !BASES.includes(SOUTH)) BASES.push(SOUTH);
  await Promise.all(BASES.map(async b => { b.tex = mapTex(await loadImg(b.src)); }));
  addWalker(); addLabels(); addStars();
  decorate();
  // 3D 무대(stage.js)가 이 장면 안에 서도록 여는 창구: 같은 카메라·깊이로 그리고, 땅 높이에 발을 붙인다
  window.terrain3d = { scene, camera, cam, heightAt: standAt, zoomAt, sceneDist };
  ready = true;
}

/* ---------- 지역 불러오기 ---------- */
function ensureRegion(r) {
  if (r.south && !window.journeyMap?.south) return Promise.resolve(); // 다른 여정에서는 불러오지 않는다
  if (!r.load) {
    r.load = loadRegion(r).then(() => { decorate(); window.recenterStage?.(); });
    // 높이를 풀지 않은 변(맞닿은 지역 쪽)은 그 이웃도 함께 불러온다 — 한쪽만 있으면 경계에 가짜 낭떠러지(턱)가 섰다 (갈릴리·유대 32.55°)
    const near = (a, b) => Math.abs(a - b) < 0.01, overlapX = o => o.X0 < r.X1 && o.X1 > r.X0, overlapZ = o => o.Z0 < r.Z1 && o.Z1 > r.Z0;
    regions.forEach(o => {
      if (o === r) return;
      if ((!r.fade.includes('s') && near(o.Z0, r.Z1) && overlapX(o)) || (!r.fade.includes('n') && near(o.Z1, r.Z0) && overlapX(o)) ||
        (!r.fade.includes('e') && near(o.X0, r.X1) && overlapZ(o)) || (!r.fade.includes('w') && near(o.X1, r.X0) && overlapZ(o))) ensureRegion(o);
    });
  }
  return r.load;
}
function ensureNear(x, z, margin = 120) { // 이 점 둘레의 지역을 미리 불러온다
  regions.forEach(r => { if (x > r.X0 - margin && x < r.X1 + margin && z > r.Z0 - margin && z < r.Z1 + margin) ensureRegion(r); });
}
async function loadRegion(r) {
  const [hImg, cImg] = await Promise.all([loadImg(`assets/terrain/${r.name}-height.png`), loadImg(`assets/terrain/${r.name}-color.webp`)]);
  const hw = hImg.width, hh = hImg.height, cv = document.createElement('canvas'); cv.width = hw; cv.height = hh;
  const cx = cv.getContext('2d', { willReadFrequently: true }); cx.drawImage(hImg, 0, 0);
  const d = cx.getImageData(0, 0, hw, hh).data, H = new Float32Array(hw * hh), sea = new Uint8Array(hw * hh);
  for (let i = 0; i < hw * hh; i++) { const v = d[i * 4] * 256 + d[i * 4 + 1]; if (v === 0) sea[i] = 1; H[i] = lv(v / 10 - 500); }
  // 가장자리 띠(7%)에서는 높이를 서서히 해수면으로 — 바깥의 평평한 바탕 그림과 턱 없이 이어진다. 맞닿은 지역 쪽은 그대로
  const band = 0.07, ease = v => v * v * (3 - 2 * v), F = r.fade;
  for (let j = 0; j < hh; j++) for (let i = 0; i < hw; i++) {
    const e = Math.min(F.includes('w') ? i / (hw - 1) : 1, F.includes('e') ? 1 - i / (hw - 1) : 1, F.includes('n') ? j / (hh - 1) : 1, F.includes('s') ? 1 - j / (hh - 1) : 1);
    const k = j * hw + i;
    H[k] = sea[k] ? -1 : H[k] * ease(Math.min(1, e / band)); // 바다는 수면(바다 판) 아래로
  }
  r.heights = H; r.hw = hw; r.hh = hh; r.color = cImg;
  const geo = new THREE.PlaneGeometry(r.X1 - r.X0, r.Z1 - r.Z0, hw - 1, hh - 1);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  for (let k = 0; k < hw * hh; k++) pos.setY(k, H[k]);
  geo.translate((r.X0 + r.X1) / 2, 0, (r.Z0 + r.Z1) / 2);
  geo.computeVertexNormals();
  r.mesh = new THREE.Mesh(geo, greyable(new THREE.MeshStandardMaterial({ map: mapTex(cImg), roughness: 0.95 })));
  r.mesh.receiveShadow = r.mesh.castShadow = true;
  scene.add(r.mesh);
  if (!r.wild) { addTrees(r); addVillages(r); } else addPalms(r); // 광야에는 나무·마을이 없다 (색 그림의 바닷가 물빛을 풀빛으로 읽어 나무가 줄지어 섰다)
  if (r.name === 'galilee') addBoats();
  if (r.name === 'judea') { if (!window.journeyMap?.noCity) addModel(buildJerusalem(), JLM, 1); addCityDetail(); } // 다윗 여정(noCity): 예수 때의 도성 모형은 천 년 뒤 모습이라 세우지 않는다
  if (r.name === 'egypt') Object.values(EGYPT_MODELS).forEach(m => addModel(m.build(), m.extent, 0.6));
}

// 예루살렘 둘레의 초정밀 색(2D 지도의 도성 타일, 지도 단위당 25.6픽셀)을 지형 위에 덧입힌다 —
// 도성 장면은 바짝 다가가므로 지역 색 그림(단위당 2.2픽셀)으로는 땅이 뭉개져 보였다. 가장자리는 서서히 투명하게
const RCITY = { lat0: 31.74, lat1: 31.81, lng0: 35.19, lng1: 35.28 }, RCITY_T = 20, RCITY_N = 4; // _src/relief.py의 CITY와 같게
let cityDone = false; const models = [];
async function addCityDetail() {
  cityDone = true;
  const P = 512, imgs = await Promise.all([...Array(RCITY_N * RCITY_N)].map((_, i) => loadImg(`assets/relief-city/${Math.floor(i / RCITY_N)}_${i % RCITY_N}.webp`).catch(() => null)));
  const [x0, z0] = px([RCITY.lat1, RCITY.lng0]), [x1, z1] = px([RCITY.lat0, RCITY.lng1]), U = RCITY_T * RCITY_N; // 캔버스가 덮는 단위
  const cv = document.createElement('canvas'); cv.width = cv.height = 2048;
  const c = cv.getContext('2d'), k = cv.width / (P * RCITY_N);
  imgs.forEach((im, i) => im && c.drawImage(im, (i % RCITY_N) * P * k, Math.floor(i / RCITY_N) * P * k, P * k, P * k));
  // 가장자리 띠(6단위)는 투명하게 — 한 변씩 곱해 나간다
  const px2 = u => u / U * cv.width, bw = px2(6), ex = px2(x1 - x0), ez = px2(z1 - z0);
  c.globalCompositeOperation = 'destination-in';
  [[0, 0, bw, 0], [ex, 0, ex - bw, 0], [0, 0, 0, bw], [0, ez, 0, ez - bw]].forEach(([ax, ay, bx, by]) => {
    const g = c.createLinearGradient(ax, ay, bx, by); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, '#000');
    c.fillStyle = g; c.fillRect(0, 0, cv.width, cv.height);
  });
  const nx = Math.round(x1 - x0), nz = Math.round(z1 - z0), geo = new THREE.PlaneGeometry(x1 - x0, z1 - z0, nx, nz);
  geo.rotateX(-Math.PI / 2); geo.translate((x0 + x1) / 2, 0, (z0 + z1) / 2);
  const pos = geo.attributes.position, uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    pos.setY(i, heightAt(x, z) + 0.08); uv.setXY(i, (x - x0) / U, 1 - (z - z0) / U);
  }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, greyable(new THREE.MeshStandardMaterial({ map: mapTex(cv), roughness: 0.95, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })));
  m.receiveShadow = true; m.renderOrder = 1; scene.add(m);
}

/* ---------- 바탕 그림·바다·호수·강·길 (지역을 불러올 때마다 다시 짓는다) ---------- */
let decor = null;
function decorate() {
  if (decor) { scene.remove(decor); decor.traverse(o => { if (o.geometry) o.geometry.dispose(); }); }
  decor = new THREE.Group(); scene.add(decor);
  const V2 = ([lat, lng]) => { const [x, z] = px([lat, lng]); return new THREE.Vector2(x, z); };
  const flat = (shape, mat, y) => { const m = new THREE.Mesh(new THREE.ShapeGeometry(shape, 16), mat); m.rotation.x = Math.PI / 2; m.position.y = y; m.receiveShadow = true; decor.add(m); return m; };
  // 바탕 그림: 불러온 지역 자리는 구멍 — 덮으면 해수면 아래의 호수·골짜기가 바탕 밑에 묻힌다
  BASES.forEach(b => {
    const [bx0, bz0] = px([b.lat1, b.lng0]), [bx1, bz1] = px([b.lat0, b.lng1]), cz = b.cut ? px([b.cut, b.lng0])[1] : bz0; // 그림은 그대로, 판만 잘라 낸다
    const sh = new THREE.Shape([[bx0, cz], [bx1, cz], [bx1, bz1], [bx0, bz1]].map(([x, z]) => new THREE.Vector2(x, z)));
    // 바탕 판과 겹치는 만큼만 뚫는다 — 시내·네게브 지역은 여러 바탕에 걸쳐 있다
    regions.filter(r => r.heights).forEach(r => {
      const e = 0.05, x0 = Math.max(r.X0, bx0 + e), x1 = Math.min(r.X1, bx1 - e), z0 = Math.max(r.Z0, cz + e), z1 = Math.min(r.Z1, bz1 - e); // 구멍이 판 가장자리에 닿으면 삼각형 나누기가 깨져 살짝 안쪽으로
      if (x1 - x0 > 0.01 && z1 - z0 > 0.01) sh.holes.push(new THREE.Path([[x0, z0], [x0, z1], [x1, z1], [x1, z0]].map(([x, z]) => new THREE.Vector2(x, z))));
    });
    const m = flat(sh, greyable(new THREE.MeshStandardMaterial({ map: b.tex, transparent: true, roughness: 1, side: THREE.DoubleSide })), b.y);
    const p = m.geometry.attributes.position, uv = m.geometry.attributes.uv;
    for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) - bx0) / (bx1 - bx0), 1 - (p.getY(i) - bz0) / (bz1 - bz0));
  });
  // 지중해와 수에즈 만 (바탕 그림 위에 — 2D 지도도 바다를 그림 위에 덮는다)
  const seaM = new THREE.MeshStandardMaterial({ color: '#7ea6ad', roughness: 0.4, metalness: 0.1, envMap: env, envMapIntensity: 0.7, side: THREE.DoubleSide });
  flat(new THREE.Shape([[35.2, 36.0], [34.2, 35.65], ...GEO.coast, ...SINAI, [36, 26]].map(V2)), seaM, 0.05);
  if (!window.journeyMap?.south) flat(new THREE.Shape(GEO.suez.map(V2)), seaM, 0.05); // 시내 반도 바탕에는 홍해의 두 만이 이미 바다로 칠해져 있다 (2D와 같게)
  // 호수: 2D 지도처럼 물가 점들을 매끄러운 곡선으로. 수면 고도가 정해진 호수는 그 높이에
  const lakeM = new THREE.MeshStandardMaterial({ color: '#4f8798', roughness: 0.55, metalness: 0.05, envMap: env, envMapIntensity: 0.6, transparent: true, opacity: 0.94, side: THREE.DoubleSide }); // 너무 매끈하면 해가 하얀 얼룩으로 번진다
  LAKES.forEach(([k, m]) => {
    const pts = GEO[k], [cx, cz] = px(pts[0]), r = regionAt(cx, cz);
    if (r && !r.heights) return; // 지역을 불러오기 전에는 그리지 않는다 (바탕 위에 떠 보인다)
    const curve = new THREE.CatmullRomCurve3(pts.map(p => { const [x, z] = px(p); return new THREE.Vector3(x, z, 0); }), true, 'centripetal');
    flat(new THREE.Shape(curve.getPoints(120).map(v => new THREE.Vector2(v.x, v.y))), lakeM, m !== undefined ? lv(m) + 0.25 : 0.12);
  });
  // 강: 땅을 따라 굽는 물빛 띠
  const riverM = new THREE.MeshStandardMaterial({ color: '#5f93a3', roughness: 0.25, metalness: 0.15, envMap: env });
  const riverWideM = new THREE.MeshStandardMaterial({ color: '#5a8fa0', roughness: 0.35, metalness: 0.1, envMap: env, side: THREE.DoubleSide });
  RIVERS.forEach(k => {
    const base = new THREE.CatmullRomCurve3(GEO[k].map(p => { const [x, z] = px(p); return new THREE.Vector3(x, 0, z); }));
    const half = RIVER_W[k];
    if (!half) {
      const pts = base.getPoints(GEO[k].length * 24).map(v => new THREE.Vector3(v.x, heightAt(v.x, v.z) + 0.4, v.z));
      decor.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), pts.length, 0.45, 5), riverM));
      return;
    }
    // 넓은 강(요단): 땅에 붙은 물길 띠. 양쪽 물가 가운데 낮은 쪽 높이에 수면을 둬 비탈을 타고 오르지 않게
    const n = GEO[k].length * 24, pos = [], idx = [];
    for (let i = 0; i <= n; i++) {
      // 물줄기가 시작하는 골짜기(요단 북쪽 끝)는 가늘게 시작해 넓어진다
      const t = i / n, c = base.getPointAt(t), d = base.getTangentAt(t), w = half * (RIVER_SRC[k] ? Math.min(1, 0.3 + t / RIVER_SRC[k]) : 1), nx = -d.z * w, nz = d.x * w;
      const y = Math.min(heightAt(c.x + nx, c.z + nz), heightAt(c.x - nx, c.z - nz), heightAt(c.x, c.z)) + 0.3;
      pos.push(c.x + nx, y, c.z + nz, c.x - nx, y, c.z - nz);
      if (i) { const j = 2 * i; idx.push(j - 2, j - 1, j, j - 1, j + 1, j); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    decor.add(new THREE.Mesh(g, riverWideM));
  });
  // 길: 2D 지도의 경로 곡선을 그대로 따라 땅 위에
  routes = [];
  $$('.route', svg).forEach(path => {
    const i = +path.dataset.i, L = path.getTotalLength(), n = Math.max(16, Math.min(200, Math.round(L / 3))), pts = [];
    for (let k = 0; k <= n; k++) { const q = path.getPointAtLength(k / n * L); pts.push(new THREE.Vector3(q.x, heightAt(q.x, q.y) + 0.8, q.y)); }
    const line = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), n, 0.55, 4), new THREE.MeshBasicMaterial({ color: PERIODS[EVENTS[i].p].color, transparent: true, opacity: 0.85 }));
    line.userData.i = i; decor.add(line); routes.push(line);
  });
}
let routes = [];

/* ---------- 밤하늘의 별 ---------- */
// 카메라를 둘러싼 큰 반구에 흩뿌린다 — 지평선 위 하늘이 보일 때만 보이고, 땅에는 가려진다.
// 밝기·크기를 고르지 않게(어두운 별이 훨씬 많게), 지평선 가까이는 옅게, 은하수 띠를 따라 조금 더 촘촘하게
let stars = null;
function addStars() {
  const N = 6000, pos = [], col = [], c = new THREE.Color(), R = 1500;
  for (let i = 0; i < N; i++) {
    let u = rnd(), az = rnd() * 6.283;
    if (i < N * 0.3) { az = 1.1 + (rnd() - 0.5) * 0.5 + (rnd() - 0.5) * 0.4; u = rnd(); } // 은하수: 한 방향으로 기운 띠
    const el = Math.asin(0.04 + 0.96 * u), m = Math.pow(rnd(), 3.2); // m: 밝기 — 대부분 어둡게
    pos.push(Math.cos(el) * Math.cos(az) * R, Math.sin(el) * R, Math.cos(el) * Math.sin(az) * R);
    const fade = Math.min(1, el / 0.35); // 지평선 가까이는 대기에 묻혀 옅게
    c.setHSL(0.6 - rnd() * 0.12, 0.25 + rnd() * 0.3, 0.55 + 0.45 * m).multiplyScalar((0.75 + 0.9 * m) * fade);
    col.push(c.r, c.g, c.b);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  stars = new THREE.Points(g, new THREE.PointsMaterial({ size: 2.2 * Math.min(devicePixelRatio, 2) / 2 + 0.6, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 0, depthWrite: false, fog: false, blending: THREE.AdditiveBlending }));
  stars.renderOrder = -1; stars.frustumCulled = false; scene.add(stars);
}
function updateStars(dt) {
  if (!stars) return;
  const env = wrap.dataset.env, goal = env === 'night' ? 1 : env === 'dawn' ? 0.35 : 0; // 무대 분위기(stage.js가 정하는 밤·새벽)를 따른다
  stars.material.opacity = damp(stars.material.opacity, goal, 3, dt);
  stars.visible = stars.material.opacity > 0.01;
  stars.position.copy(camera.position); // 하늘은 카메라와 함께 — 아무리 다가가도 별은 멀리
}

/* ---------- 나무·마을·배·건물 ---------- */
let seed = 3; const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
// 광야의 오아시스 (위도, 경도, 반지름°): _src/relief.py의 OASES와 같게 — 엘림, 와디 페이란(르비딤), 가데스, 미디안.
// 샘가에 종려나무 숲. 무대가 서면 그 둘레만 치워져(clearStageSpot) 진영이 숲 가장자리에 선 것처럼 보이게, 숲은 반지름보다 조금 넓게 심는다
const OASES = [[29.28, 32.97, 0.02], [28.7, 33.65, 0.03], [30.65, 34.42, 0.018], [28.48, 35.0, 0.02]];
function addPalms(r) {
  const spots = [];
  OASES.forEach(([lat, lng, rad]) => {
    const [ox, oz] = px([lat, lng]), R = rad * 1000 * 1.5;
    if (!regionAt(ox, oz) || regionAt(ox, oz) !== r) return;
    for (let g = 0; g < 34; g++) { // 고르게 흩뿌리면 점박이로 보여 숲 덩이(5~12그루)로
      const a = rnd() * 6.283, d = Math.sqrt(rnd()) * R, gx = ox + Math.cos(a) * d, gz = oz + Math.sin(a) * d;
      for (let n = 5 + Math.floor(rnd() * 8); n--;) {
        const x = gx + (rnd() - 0.5) * 4, z = gz + (rnd() - 0.5) * 4;
        if (heightAt(x, z) >= 0) spots.push([x, z, 0.9 + rnd() * 0.6]); // 바다 위에는 심지 않는다
      }
    }
  });
  if (!spots.length) return;
  const trunkM = greyable(new THREE.MeshStandardMaterial({ color: '#7a5f43', roughness: 1 })), crownM = greyable(new THREE.MeshStandardMaterial({ color: '#5f7a3c', roughness: 1, flatShading: true, emissive: '#22301a', emissiveIntensity: 0.6 }));
  const trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.035, 0.06, 1, 5), trunkM, spots.length), crown = new THREE.InstancedMesh(new THREE.ConeGeometry(0.42, 0.28, 7), crownM, spots.length);
  const o = new THREE.Object3D(), c = new THREE.Color();
  spots.forEach(([x, z, s], i) => {
    const y = heightAt(x, z), h = 1.3 * s;
    o.position.set(x, y + h / 2, z); o.scale.set(s, h, s); o.rotation.set(0, 0, (rnd() - 0.5) * 0.15); o.updateMatrix(); trunk.setMatrixAt(i, o.matrix);
    o.position.set(x, y + h, z); o.scale.set(s, s, s); o.rotation.set(Math.PI, rnd() * 6, 0); o.updateMatrix(); crown.setMatrixAt(i, o.matrix); // 뒤집은 원뿔: 아래로 처진 종려 잎
    crown.setColorAt(i, c.set('#5f7a3c').multiplyScalar(0.85 + rnd() * 0.3));
  });
  trunk.castShadow = crown.castShadow = true; scene.add(trunk, crown);
  clutterInstanced(trunk, true, 0.5); clutterInstanced(crown, true, 0.5); // 진영 바로 곁까지 — 무대 넓이만큼 다 치우면 숲이 고리처럼 남았다
}
function addTrees(r) {
  // 초록 기운이 있는 곳(색 그림으로 고른다)에 올리브·떡갈나무 덩이. 넓이에 비례해 심는다
  const img = r.color, cv = document.createElement('canvas'); cv.width = 256; cv.height = Math.round(256 * img.height / img.width);
  const cx = cv.getContext('2d', { willReadFrequently: true }); cx.drawImage(img, 0, 0, cv.width, cv.height);
  const d = cx.getImageData(0, 0, cv.width, cv.height).data, spots = [], want = Math.round((r.X1 - r.X0) * (r.Z1 - r.Z0) / (r.name === 'egypt' ? 420 : 150));
  for (let n = 0; n < want * 4 && spots.length < want; n++) {
    const u = rnd(), v = rnd(), k = (Math.floor(v * cv.height) * cv.width + Math.floor(u * cv.width)) * 4;
    if (d[k + 1] - d[k] < 6 || d[k + 1] < 110 || d[k + 2] > d[k + 1]) continue;
    const x = r.X0 + u * (r.X1 - r.X0), z = r.Z0 + v * (r.Z1 - r.Z0), y = heightAt(x, z);
    if (x > CITY.x0 && x < CITY.x1 && z > CITY.z0 && z < CITY.z1) continue; // 도성 모형 자리는 비운다 (모형에 제 나무가 있다)
    const dd = Math.hypot(Math.max(CITY.x0 - x, 0, x - CITY.x1), Math.max(CITY.z0 - z, 0, z - CITY.z1));
    spots.push([x, y, z, dd < 6 ? 0.3 + 0.7 * dd / 6 : 1]); // 도성 둘레는 작게 — 가까이 볼 때 나무가 성전만 해 보이지 않게
  }
  const im = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), greyable(new THREE.MeshStandardMaterial({ color: '#7d8f55', roughness: 1, flatShading: true, emissive: '#2a3418', emissiveIntensity: 0.6 })), spots.length); // emissive: 그늘진 면이 새까매지지 않게
  const o = new THREE.Object3D(), c = new THREE.Color();
  spots.forEach(([x, y, z, f], i) => { const s = (0.35 + rnd() * 0.45) * f; o.position.set(x, y + s * 0.6, z); o.scale.set(s, s * 0.85, s); o.rotation.y = rnd() * 6; o.updateMatrix(); im.setMatrixAt(i, o.matrix); im.setColorAt(i, c.set('#7d8f55').multiplyScalar(0.85 + rnd() * 0.3)); });
  im.castShadow = true; scene.add(im);
  clutterInstanced(im);
}
const villages = new Map(); // 장소 → 집 묶음
function addVillages(r) {
  // 장소마다 흙벽 집 몇 채 (낮은 상자들). 도성 안 장소는 3D 도성 모형이 대신한다
  const m = new THREE.MeshStandardMaterial({ color: '#d8c49c', roughness: 0.9 }), geo = new THREE.BoxGeometry(1, 1, 1);
  Object.entries(PLACES).forEach(([k, p]) => {
    const [x0, z0] = px([p.lat, p.lng]);
    if (isCity(k) || regionAt(x0, z0) !== r || k === 'sea' || p.hidden) return; // 핀 없는 장소(프롤로그의 에덴)에는 마을을 두지 않는다
    const n = 8 + Math.floor(rnd() * 6), grp = new THREE.Group();
    for (let i = 0; i < n; i++) {
      const a = rnd() * 6.28, d = 1.2 + rnd() * 3.5, x = x0 + Math.cos(a) * d, z = z0 + Math.sin(a) * d, y = heightAt(x, z);
      if (y < lv(-205)) continue; // 호수 위에는 짓지 않는다
      const dd = Math.hypot(Math.max(CITY.x0 - x, 0, x - CITY.x1), Math.max(CITY.z0 - z, 0, z - CITY.z1)); // 도성 곁(베다니)은 도성 모형의 집과 어울리게 작게
      const b = new THREE.Mesh(geo, m), s = (0.45 + rnd() * 0.4) * (dd < 14 ? 0.3 + 0.7 * dd / 14 : 1); // 집 한 채 50~90m 남짓 — 멀리서도 보이되 무대 인물보다 크지 않게
      b.scale.set(s, s * 0.7, s * (0.8 + rnd() * 0.5)); b.position.set(x, y + s * 0.35, z); b.rotation.y = rnd() * 3; b.castShadow = b.receiveShadow = true;
      grp.add(b); clutter.meshes.push({ m: b, x, z, y0: b.position.y, g0: heightAt(x, z) });
    }
    villages.set(k, grp); scene.add(grp);
  });
}
const boats = [];
// 배의 높이: 뱃전(원점) 아래로 몸통이 1.2 내려가므로 수면(lv(-210)+0.25)보다 0.5 올려 몸통 절반 남짓이 물 위에 — 전에는 뱃전이 수면에 겨우 걸쳤다
const BOAT_Y = lv(-210) + 0.75;
function addBoats() {
  // 몸통은 위가 뚫린 반구라 안쪽 면도 그린다(DoubleSide) — 한쪽만 그리면 위에서 볼 때 물속 테두리와 돛만 보여 잠긴 배 같았다
  const hull = new THREE.MeshStandardMaterial({ color: '#6e4a2c', roughness: 0.9, side: THREE.DoubleSide }), dark = new THREE.MeshStandardMaterial({ color: '#4a301c', roughness: 0.9 });
  const deck = new THREE.MeshStandardMaterial({ color: '#8a6440', roughness: 0.9 }), sail = new THREE.MeshStandardMaterial({ color: '#efe6d2', side: THREE.DoubleSide });
  [[32.83, 35.57], [32.86, 35.6], [32.79, 35.6]].forEach(([a, b], i) => {
    const g = new THREE.Group(), [x, z] = px([a, b]);
    const h = new THREE.Mesh(new THREE.SphereGeometry(2.4, 16, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), hull); h.scale.set(1.6, 0.5, 0.6); g.add(h);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.09, 6, 32), dark); rim.scale.set(1.6, 0.6, 1); rim.rotation.x = Math.PI / 2; g.add(rim); // 뱃전
    const d = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.08, 1.9), deck); d.position.y = -0.3; g.add(d); // 갑판
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 4.2, 6), dark); mast.position.set(0.6, 1.8, 0); g.add(mast);
    const s = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 3.0), sail); s.position.set(0.6, 2.2, 0); s.rotation.y = 1.2; g.add(s);
    g.traverse(o => { if (o.isMesh) o.castShadow = o.receiveShadow = true; });
    g.position.set(x, BOAT_Y, z); g.rotation.y = i * 1.7; g.userData.phase = i * 2;
    scene.add(g); boats.push(g);
  });
}
// 2D 지도용으로 만든 3D 모형(예루살렘 도성, 애굽 표지)을 지형 위에 앉힌다: 원점은 틀의 북서 모서리, 조각마다 그 자리의 땅 높이만큼 올린다
function addModel(group, E, scale) {
  const [ox, oz] = px([E.lat1, E.lng0]), [ex, ez] = px([E.lat0, E.lng1]);
  if (scale !== 1) { group.scale.setScalar(scale); group.position.set((ex - ox) * (1 - scale) / 2, 0, (ez - oz) * (1 - scale) / 2); }
  const holder = new THREE.Group(); holder.position.set(ox, 0, oz); holder.add(group); scene.add(holder);
  holder.updateMatrixWorld(true);
  const box = new THREE.Box3(), c = new THREE.Vector3(), mx = new THREE.Matrix4(), p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3(), w = new THREE.Vector3();
  const lifts = [];
  group.traverse(o => {
    if (o.isInstancedMesh) {
      for (let i = 0; i < o.count; i++) { o.getMatrixAt(i, mx); mx.decompose(p, q, s); w.copy(p).applyMatrix4(o.matrixWorld); p.y += heightAt(w.x, w.z) / scale; mx.compose(p, q, s); o.setMatrixAt(i, mx); }
      o.instanceMatrix.needsUpdate = true;
    } else if (o.isMesh) { box.setFromObject(o); box.getCenter(c); lifts.push([o, heightAt(c.x, c.z) / scale]); }
  });
  lifts.forEach(([o, h]) => { o.position.y += h; o.castShadow = o.receiveShadow = true; });
  if (E === JLM) city = true;
  models.push([ox, oz, ex, ez]); // 모형 둘레는 땅을 고르지 않는다 (level)
  group.traverse(o => { if (o.isInstancedMesh) clutterInstanced(o, false); }); // 도성의 집·나무, 표지의 대추야자도 무대 자리에서는 비킨다
}
// 무대가 서는 자리의 집·나무는 잠시 치운다. 무대는 지도 위에 겹쳐 그리는 그림이라, 그 밑의 집·나무가 인물 사이로 삐져나와 보인다.
// 치우는 넓이는 무대 그림의 크기(화면 px)를 그 자리의 지도 단위로 바꾼 것 — 당기고 물러나면 따라 바뀐다
let city = false;
const clutter = { inst: [], meshes: [] }, ZERO = new THREE.Matrix4().makeScale(0, 0, 0), M4 = new THREE.Matrix4();
function clutterInstanced(o, follow = true, near = 1) { // follow: 땅을 고를 때 높이를 따라간다 (모형 안의 것은 모형과 함께 제자리)
  o.updateMatrixWorld(true);
  const ms = [], xz = [], m = new THREE.Matrix4(), w = new THREE.Vector3();
  for (let i = 0; i < o.count; i++) { o.getMatrixAt(i, m); ms.push(m.clone()); w.setFromMatrixPosition(m).applyMatrix4(o.matrixWorld); xz.push([w.x, w.z]); }
  clutter.inst.push({ o, ms, xz, near, g0: follow && xz.map(([x, z]) => heightAt(x, z)) }); // near: 무대 반지름의 몇 배 안을 치우나
  cleared = null; // 새로 생긴 것도 한 번 따져 본다
}
let cleared = null;
// 무대 밑 땅 고르기: 거친 산지(시내산 둘레)에서는 무대 앞 능선이 사람의 다리를 가리고, 비탈에 선 사람이 땅에 묻혀 보였다.
// 무대 둘레(r의 1.25배)는 가운데 땅 높이로 평평하게, 그 바깥(2.2배까지)은 서서히 원래 땅으로. 무대가 떠나면 원래대로 되돌린다.
// 도성 안과 그 둘레(도성 모형과 초정밀 색 판이 땅 높이에 맞춰 지어져 있다), 물 위(배 장면)는 손대지 않는다
let leveled = null;
function unlevel() {
  if (!leveled) return;
  leveled.parts.forEach(({ rg, ks, orig }) => { const pos = rg.mesh.geometry.attributes.position; ks.forEach((k, i) => { rg.heights[k] = orig[i]; pos.setY(k, orig[i]); }); pos.needsUpdate = true; rg.mesh.geometry.computeVertexNormals(); });
  leveled = null;
}
function level(cx, cz, r) {
  unlevel();
  leveled = { cx, cz, r, parts: [] };
  const k0 = window.stagePlaceOf?.(curEvent()) || curEvent().place;
  if (r <= 0 || isCity(k0)) return;
  const y0 = heightAt(cx, cz);
  if (standAt(cx, cz) > y0 + 0.01) return;
  const R0 = r * 1.25, R1 = r * 2.2, [qx0, qz0] = px([RCITY.lat1, RCITY.lng0]), [qx1, qz1] = px([RCITY.lat0, RCITY.lng1]);
  const near = ([x0, z0, x1, z1]) => cx + R1 > x0 && cx - R1 < x1 && cz + R1 > z0 && cz - R1 < z1;
  if ((cityDone && near([qx0, qz0, qx1, qz1])) || models.some(near)) return; // 예루살렘 둘레의 초정밀 색 판(베다니)과 도성·애굽 표지 모형은 땅 높이를 미리 따라 지었다
  regions.forEach(rg => {
    if (!rg.heights || cx + R1 < rg.X0 || cx - R1 > rg.X1 || cz + R1 < rg.Z0 || cz - R1 > rg.Z1) return;
    const H = rg.heights, w = rg.hw, sx = (rg.X1 - rg.X0) / (w - 1), sz = (rg.Z1 - rg.Z0) / (rg.hh - 1), ks = [], orig = [];
    const pos = rg.mesh.geometry.attributes.position;
    for (let j = Math.max(0, Math.floor((cz - R1 - rg.Z0) / sz)); j <= Math.min(rg.hh - 1, Math.ceil((cz + R1 - rg.Z0) / sz)); j++)
      for (let i = Math.max(0, Math.floor((cx - R1 - rg.X0) / sx)); i <= Math.min(w - 1, Math.ceil((cx + R1 - rg.X0) / sx)); i++) {
        const d = Math.hypot(rg.X0 + i * sx - cx, rg.Z0 + j * sz - cz), k = j * w + i;
        if (d >= R1 || H[k] === -1) continue; // 바다 꼭짓점은 그대로
        const t = d <= R0 ? 1 : 1 - (d - R0) / (R1 - R0), e = t * t * (3 - 2 * t);
        ks.push(k); orig.push(H[k]); H[k] += (y0 - H[k]) * e; pos.setY(k, H[k]);
      }
    if (!ks.length) return;
    pos.needsUpdate = true; rg.mesh.geometry.computeVertexNormals();
    leveled.parts.push({ rg, ks, orig });
  });
}
function clearStageSpot() {
  const f = window.stageFoot, stageOn = document.body.classList.contains('stage-on') && f;
  let cx = 1e9, cz = 1e9, r = 0;
  if (stageOn) {
    const p = PLACES[placeOf(curEvent())];
    [cx, cz] = f.xz || px(f.at || [p.lat, p.lng]); // xz: 지형 안 무대가 알려 주는 지금의 바닥 중심 (@at으로 옮겨 갈 때)
    const D = camera.position.distanceTo(v3.set(cx, heightAt(cx, cz), cz)), H = wrap.clientHeight || 1;
    r = f.r ?? f.rpx * 2 * D * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) / H; // r: 지형 안에 선 무대가 알려 주는 지도 단위 반지름
  }
  if (cleared && Math.abs(cleared.cx - cx) < 0.01 && Math.abs(cleared.cz - cz) < 0.01 && Math.abs(cleared.r - r) <= cleared.r * 0.08) return;
  if (!leveled || Math.hypot(leveled.cx - cx, leveled.cz - cz) > Math.max(r, leveled.r) * 0.25 || Math.abs(leveled.r - r) > leveled.r * 0.08) level(cx, cz, r);
  cleared = { cx, cz, r };
  // 무대 밑 땅을 고른 둘레의 나무·집은 고른 땅 높이를 따라 올리고 내린다 (g0: 심을 때의 땅 높이)
  clutter.meshes.forEach(c => { c.m.visible = Math.hypot(c.x - cx, c.z - cz) > r; c.m.position.y = c.y0 + heightAt(c.x, c.z) - c.g0; });
  clutter.inst.forEach(({ o, ms, xz, g0, near }) => { ms.forEach((m, i) => { const [x, z] = xz[i];
    if (Math.hypot(x - cx, z - cz) <= r * near) return o.setMatrixAt(i, ZERO);
    const dy = g0 ? heightAt(x, z) - g0[i] : 0; o.setMatrixAt(i, dy ? M4.copy(m).setPosition(m.elements[12], m.elements[13] + dy, m.elements[14]) : m); });
  o.instanceMatrix.needsUpdate = true; });
}

/* ---------- 걷는 사람 (2D 지도의 걷는 표시를 3D로) ----------
   금빛 구슬과 하늘로 솟는 빛기둥, 땅에 퍼지는 고리. 걷는 동안은 빛기둥이 서고 카메라가 따라간다 */
const walker = { g: null, beam: null, ring: null, x: 0, z: 0, has: false };
function addWalker() {
  const g = new THREE.Group();
  const orb = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), new THREE.MeshBasicMaterial({ color: '#fff3cf' }));
  orb.position.y = 3.2; g.add(orb);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  halo.scale.set(9, 9, 1); halo.position.y = 3.2; g.add(halo);
  // 빛기둥: 아래는 진하고 위로 갈수록 사라지는 세로 그라데이션
  const c = document.createElement('canvas'); c.width = 4; c.height = 128;
  const x = c.getContext('2d'), gr = x.createLinearGradient(0, 0, 0, 128);
  gr.addColorStop(0, 'rgba(255,230,170,0)'); gr.addColorStop(0.6, 'rgba(255,215,140,.45)'); gr.addColorStop(1, 'rgba(255,205,120,.9)');
  x.fillStyle = gr; x.fillRect(0, 0, 4, 128);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.9, 26, 20, 1, true), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  beam.position.y = 13; g.add(beam);
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.6, 2.2, 48), new THREE.MeshBasicMaterial({ color: '#f0d79a', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.3; g.add(ring);
  g.visible = false; scene.add(g);
  Object.assign(walker, { g, beam, ring, orb, halo });
}
addEventListener('walker', e => { walker.x = e.detail.x; walker.z = e.detail.y; walker.has = true; });
let walkDist = 220;

/* ---------- 이름표 ---------- */
const labels = [];
function addLabels() {
  const box = document.createElement('div'); box.className = 'tlabels'; renderer.domElement.after(box); // 장면 카드보다 아래에 깔리게 지형 바로 뒤에
  const add = (kind, key, lat, lng, text, pr) => {
    const el = document.createElement('div'); el.className = 'tlabel ' + kind; el.innerHTML = kind === 'place' ? `<i></i><span></span>` : '<span></span>';
    el.querySelector('span').textContent = text; box.appendChild(el);
    labels.push({ el, key, kind, lat, lng, pr, w: 0, h: 0 });
  };
  Object.entries(PLACES).forEach(([k, p]) => { if (!p.hidden) add('place', k, p.lat, p.lng, p.name, isCity(k) ? 3 : 2); });
  // 지형 이름: 산·바다·강 (2D 지도의 이름과 같은 글씨)
  [['hermon', 33.416, 35.857, t('mtHermon')], ['lake', 32.80, 35.60, tm('갈릴리 바다')], ['dead', 31.45, 35.49, tm('사해')],
    ['jordan', 32.30, 35.575, tm('요단 강')], ['med', 32.35, 34.48, tm('지 중 해')], ['nile', 29.95, 31.24, tm('나일 강')], ['suez', 29.6, 32.6, tm('수에즈 만')]]
    .forEach(([k, a, b, n]) => add('feature', k, a, b, n, 4));
  REFCITIES.forEach(([n, a, b]) => add('ref', n, a, b, tm(n), 5));
  REGIONS.forEach(([n, a, b]) => add('region', n, a, b, tm(n), 6));
}
const v3 = new THREE.Vector3();
function project(lat, lng, lift = 0) {
  const [x, z] = px([lat, lng]);
  if (city && x > CITY.x0 && x < CITY.x1 && z > CITY.z0 && z < CITY.z1) lift += 0.3; // 도성 모형의 바닥·성전 단 위로
  v3.set(x, heightAt(x, z) + lift, z);
  const far = v3.distanceTo(camera.position);
  v3.project(camera);
  const r = renderer.domElement.getBoundingClientRect();
  return { x: r.left + (v3.x + 1) / 2 * r.width, y: r.top + (1 - v3.y) / 2 * r.height, behind: v3.z > 1, far };
}
// 겹치는 이름은 덜 중요한 쪽을 숨긴다: 지금 장소 → 장소(도성 안은 뒤로) → 산·바다 → 도시 → 지역
function placeLabels() {
  const cur = placeOf(curEvent()), nx = EVENTS[idx + 1]?.place, r = wrap.getBoundingClientRect(), taken = [];
  const fogFar = scene.fog.far * 0.85;
  const list = labels.map(L => {
    const s = project(L.lat, L.lng, L.kind === 'place' ? 1.5 : 0.5);
    const pr = L.key === cur ? 0 : L.key === nx ? 1 : L.pr;
    return { L, s, pr };
  }).sort((a, b) => a.pr - b.pr);
  list.forEach(({ L, s, pr }) => {
    const x = s.x - r.left, y = s.y - r.top;
    let show = !s.behind && s.far < fogFar && x > -40 && y > -20 && x < r.width + 40 && y < r.height + 20;
    if (show) {
      if (!L.w) { L.w = L.el.offsetWidth || 60; L.h = L.el.offsetHeight || 20; }
      const box = [x - L.w / 2 - 4, y - 6, x + L.w / 2 + 4, y + L.h];
      if (pr > 0 && taken.some(b => box[0] < b[2] && box[2] > b[0] && box[1] < b[3] && box[3] > b[1])) show = false;
      else taken.push(box);
    }
    L.el.style.transform = `translate(${x}px, ${y}px) translateX(-50%)`; // 이름표 가운데(점)를 장소에 — 왼쪽 끝을 맞추면 점이 이름표 너비 절반만큼 오른쪽에 찍혔다
    L.el.style.opacity = show ? 1 : 0;
    L.el.classList.toggle('now', L.key === cur);
  });
}

/* ---------- 카메라 ---------- */
function placeCam() {
  const ground0 = Math.max(heightAt(cam.tx, cam.tz), lv(-210));
  const h = Math.sin(cam.pitch) * cam.dist, d = Math.cos(cam.pitch) * cam.dist;
  camera.position.set(cam.tx + Math.sin(cam.yaw) * d, ground0 + h, cam.tz + Math.cos(cam.yaw) * d);
  camera.lookAt(cam.tx, ground0, cam.tz); camera.updateMatrixWorld(); // 그리기 전에 투영(무대 붙이기)이 새 시점을 쓰게
  // 해와 그림자 상자도 시선을 따라간다
  const S = Math.max(150, cam.dist * 1.6);
  sun.position.set(cam.tx - S * 0.8, S * 1.0, cam.tz - S * 0.6); sun.target.position.set(cam.tx, 0, cam.tz);
  Object.assign(sun.shadow.camera, { left: -S, right: S, top: S, bottom: -S, near: 1, far: S * 4 }); sun.shadow.camera.updateProjectionMatrix();
}
// 장소로 날아가기: 지금 장면의 장소를 화면 가운데(카드에 가리지 않는 쪽)로
function flyTo(k, dist = placeDist(k)) {
  const p = PLACES[k], [x, z] = px([p.lat, p.lng]);
  ensureNear(x, z);
  cam.goal = { tx: x, tz: z, dist };
}
// 장면으로 날아가기: 무대를 핀에서 떨어진 실제 지점(at)에 세운 장면(두로는 핀이 바닷가, 무대는 뭍 안쪽)은
// 핀과 무대 사이를 가운데에 두고, 둘 다 들어오게 물러선다
function flyToScene(ev) {
  const at = atOf(ev);
  if (!at) return flyTo(placeOf(ev));
  const p = PLACES[ev.place], [x0, z0] = px([p.lat, p.lng]), [x1, z1] = px(at), sep = Math.hypot(x1 - x0, z1 - z0);
  if (sep < 8) return flyTo(ev.place);
  ensureNear(x1, z1);
  cam.goal = { tx: (x0 + x1) / 2, tz: (z0 + z1) / 2, dist: sceneDist(ev) };
}
// 장면에 날아가 내려앉는 거리 (무대 축척의 기준이 된다)
function sceneDist(ev) {
  const at = atOf(ev), p = PLACES[ev.place];
  if (!at) return placeDist(placeOf(ev));
  const [x0, z0] = px([p.lat, p.lng]), [x1, z1] = px(at), sep = Math.hypot(x1 - x0, z1 - z0);
  return sep < 8 ? placeDist(ev.place) : Math.max(placeDist(ev.place), sep * 1.6);
}
// 장소 k에서 dist 거리일 때 예전 무대의 인물 크기 (stage.js가 무대 축척을 정할 때 쓴다)
const zoomAt = (dist, k) => figZoom(dist, isCity(k));
// 무대 인물의 크기 (stage.js가 terrainView.zoom으로 받는다). 당기면 천천히 커지다가(0.6제곱) 1.5배에 이르는 거리(FIG_D)부터는
// 땅과 같은 비율로 커진다 — 인물만 멈추면 땅만 계속 커져 인물이 점점 작아 보였다. 도성 안은 그대로 1.5배에서 멈춘다:
// 처음부터 바짝(42) 다가가 있어 같이 키우면 성벽·성전을 가리고, 당길수록 건물이 드러나는 편이 낫다
const FIG_MAX = 1.5, FIG_D = 150 / FIG_MAX ** (1 / 0.6);
function figZoom(dist, city) {
  if (city) return THREE.MathUtils.clamp((150 / dist) ** 0.6, 0.35, FIG_MAX) * 0.62; // 도성 안에서는 인물을 줄여 건물을 덜 가리게
  return dist >= FIG_D ? Math.max(0.35, (150 / dist) ** 0.6) : FIG_MAX * FIG_D / dist;
}
// 가장 가까이 당길 수 있는 거리: 무대(인물과 함께 커지는 캔버스)가 카드에 가리지 않은 지도 영역을 채우는 데까지.
// 크기는 stage.js의 stageBox (폭 300·높이 270, 모바일은 그 1.3배까지, 넓은 무대 wide)
function minDist() {
  const ev = curEvent();
  if (isCity(placeOf(ev))) return 25;
  const r = wrap.getBoundingClientRect(), mobile = innerWidth <= 900, wide = SCRIPTS[ev.id]?.wide || 1;
  const fw = mobile ? r.width : r.width - (Math.min(460, r.width * 0.42) + 28), fh = mobile ? r.height * 0.52 : r.height;
  const b = window.stageBox(wide), zMax = Math.max(FIG_MAX, 0.95 * Math.min(fw / b.w, fh / b.h));
  return Math.max(25, FIG_MAX * FIG_D / zMax);
}
// 확대·축소는 늘 지금 장면의 무대를 가운데로 다시 맞추며 한다 — 끌어서 옮겨 둔 곳을 기준으로 당기면 무대가 화면 밖에 남았다
function zoomToStage(dist) {
  const ev = curEvent(), at = atOf(ev), p = PLACES[placeOf(ev)];
  let [tx, tz] = px([p.lat, p.lng]);
  if (at) { const [x1, z1] = px(at); if (Math.hypot(x1 - tx, z1 - tz) >= 8) { tx = (tx + x1) / 2; tz = (tz + z1) / 2; } }
  cam.goal = { tx, tz, dist: THREE.MathUtils.clamp(dist, minDist(), 520) };
  zoomUser = cam.goal.dist / sceneDist(ev); // 당긴 만큼을 기억해 다음 장면에서도 같은 만큼
}
let zoomUser = 1;
function resize() {
  const r = wrap.getBoundingClientRect();
  if (!r.width) return;
  renderer.setSize(r.width, r.height, false);
  renderer.domElement.style.width = r.width + 'px'; renderer.domElement.style.height = r.height + 'px';
  camera.aspect = r.width / r.height;
  // 장면 카드가 오른쪽(모바일은 아래)을 가리므로 시선의 가운데를 빈 쪽으로 옮긴다
  const mobile = innerWidth <= 900, cardW = Math.min(460, r.width * 0.42) + 28;
  camera.setViewOffset(r.width, r.height, mobile ? 0 : cardW / 2, mobile ? r.height * 0.28 : 0, r.width, r.height);
  camera.updateProjectionMatrix();
}

let last = performance.now(), nearT = 0;
function loop(now) {
  requestAnimationFrame(loop);
  window.terrainDrives = on && ready && !!window.terrainOn; // 무대(stage.js)는 이 루프 안에서 그린다 (지형이 준비된 뒤부터)
  if (!window.terrainDrives || document.body.classList.contains('intro-open')) return; // 랜딩이 떠 있으면 뒤에서 돌지 않게
  const dt = Math.min(0.25, (now - last) / 1000); last = now; // 느린 기기에서도 카메라가 제때 닿게 넉넉히
  const walking = document.body.classList.contains('is-walking');
  // 걷는 동안은 카메라가 걷는 사람을 따라간다
  if (walking && walker.has) cam.goal = { tx: walker.x, tz: walker.z, dist: walkDist };
  if (cam.goal) {
    const k = 1 - Math.exp(-(walking ? 3.5 : 2.2) * dt);
    cam.tx += (cam.goal.tx - cam.tx) * k; cam.tz += (cam.goal.tz - cam.tz) * k; cam.dist += (cam.goal.dist - cam.dist) * k;
    if (!walking && Math.hypot(cam.goal.tx - cam.tx, cam.goal.tz - cam.tz) < 0.01 && Math.abs(cam.goal.dist - cam.dist) < 0.01) cam.goal = null;
  }
  if (now - nearT > 500) { nearT = now; ensureNear(cam.tx, cam.tz, 60); } // 둘러보다 다가간 지역도 불러온다
  cam.pitch = damp(cam.pitch, ui.pitch, 4, dt); cam.yaw = damp(cam.yaw, ui.yaw, 4, dt);
  placeCam();
  window.terrainView = { yaw: cam.yaw, pitch: cam.pitch, zoom: zoomAt(cam.dist, placeOf(curEvent())) };
  window.stageRender?.(); // 바뀐 시점으로 무대를 붙이고 그린다
  // 안개는 카메라 거리에 맞춰 — 멀리 물러나도 땅의 끝이 하늘과 안개 속으로 녹아든다
  // 밤에는 안개를 멀리 민다 — 밤하늘빛 안개가 가까이 깔리면 어두운 땅 위에 회색 막이 낀 것처럼 보였다
  nightK = damp(nightK, wrap.dataset.env === 'night' ? 1 : 0, 1.5, dt);
  scene.fog.near = cam.dist * (1.1 + 1.4 * nightK); scene.fog.far = cam.dist * (3.6 + 3 * nightK);
  updateStars(dt);
  boats.forEach((b, i) => { b.position.y = BOAT_Y + Math.sin(now / 900 + b.userData.phase) * 0.1; b.rotation.z = Math.sin(now / 1300 + i) * 0.04; });
  // 걷는 사람: 화면에서 늘 알아보게 거리에 맞춰 크기를 바꾼다. 서 있을 때는 고리만 은은하게
  if (walker.has) {
    const W = walker, s = Math.max(0.6, cam.dist / 150);
    W.g.visible = true; W.g.position.set(W.x, heightAt(W.x, W.z), W.z); W.g.scale.setScalar(s);
    const t = now / 1000;
    W.beam.visible = W.orb.visible = W.halo.visible = walking;
    W.orb.position.y = W.halo.position.y = 3.2 + Math.sin(t * 6) * 0.35;
    W.ring.visible = walking || !document.body.classList.contains('is-reading'); // 연극 중에는 물결 고리를 끈다
    W.ring.scale.setScalar(walking ? 1 + (t * 1.4 % 1) * 1.6 : 1 + (t * 0.6 % 1) * 1.2);
    W.ring.material.opacity = walking ? 1 - (t * 1.4 % 1) : 0.7 * (1 - (t * 0.6 % 1));
    if (walking) ensureNear(W.x, W.z);
  }
  // 지나온 길만 밝게, 지금 걷는 길은 금빛으로, 아직 가지 않은 길은 흐리게
  // 아주 가까이(도성 안)에서는 길을 옅게 — 굵은 길이 건물을 덮지 않게
  const near = THREE.MathUtils.clamp((cam.dist - 40) / 90, 0.15, 1);
  routes.forEach(l => { const i = l.userData.i; l.material.opacity = (i <= idx ? 0.9 : walking && i === idx + 1 ? 1 : 0.18) * near; });
  clearStageSpot();
  // 장면의 밤·폭풍·새벽: 3D 무대가 서 있으면 그 분위기를 해·하늘빛으로(stage.js의 stageTone), 아니면 2D 지도처럼 색조 필터로
  const tn = window.stageTone;
  hemi.intensity = 1.35 * (tn ? tn.hemi : 1); hemi.color.copy(tn ? tn.hemiC : LIT.hemi);
  sun.intensity = 2.4 * (tn ? tn.sun : 1); sun.color.copy(tn ? tn.sunC : LIT.sun);
  // 밤: 땅 자체를 어둡게 하고(고르게 비추는 하늘빛을 줄이고) 달빛 한 줄기로 산등성이를 살린다.
  // 예전엔 낮처럼 밝은 땅 위에 2D용 푸른 막(.a-cool)을 곱해 덮어, 굴곡이 죽고 회색 안개가 낀 것처럼 보였다
  hemi.intensity *= 1 - 0.7 * nightK; hemi.color.lerp(MOON_H, 0.75 * nightK);
  sun.intensity *= 1 + 0.1 * nightK; sun.color.lerp(MOON_S, 0.8 * nightK);
  scene.background.copy(SKY); if (tn) scene.background.multiply(tn.skyC);
  scene.background.lerp(NIGHT_SKY, 0.85 * nightK); // 밤하늘은 짙은 남색 — 안개도 이 색이라 먼 땅이 밝은 회색으로 뜨지 않고 어둠 속으로 잠긴다
  scene.fog.color.copy(scene.background);
  const tone = tn ? '' : svg.style.filter; if (renderer.domElement.style.filter !== tone) renderer.domElement.style.filter = tone;
  renderer.render(scene, camera);
  placeLabels();
}

/* ---------- 조작: 끌어 옮기기, 바퀴·두 손가락으로 당기기 ---------- */
const ui = { pitch: 0.62, yaw: 0 };
// 색 끄기: 땅·바탕·나무의 색을 옅은 회색으로 바꿔 이동 길(색 선)만 또렷하게. 음영은 남아 지형 굴곡은 그대로 보인다
const PLAIN = { value: (() => { try { return localStorage.getItem('theway-plain') === '1' ? 1 : 0; } catch { return 0; } })() };
function greyable(m) {
  m.onBeforeCompile = s => {
    s.uniforms.uPlain = PLAIN;
    s.fragmentShader = 'uniform float uPlain;\n' + s.fragmentShader.replace('#include <color_fragment>', '#include <color_fragment>\n  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(dot(diffuseColor.rgb, vec3(.299, .587, .114)) * .8 + .2), uPlain);');
  };
  return m;
}
// 끌어 옮길 수 있는 범위: 깔린 바탕 그림 전체 (모세 여정은 시내 반도 바탕까지 — 예전 범위(29.15° 위)로 묶으면 시내에서 끌자마자 북쪽으로 튀었다)
let world = null;
const WORLD = () => world ??= BASES.reduce((w, b) => { const [x0, z0] = px([b.lat1, b.lng0]), [x1, z1] = px([b.lat0, b.lng1]);
  return { x0: Math.min(w.x0, x0), z0: Math.min(w.z0, z0), x1: Math.max(w.x1, x1), z1: Math.max(w.z1, z1) }; }, { x0: Infinity, z0: Infinity, x1: -Infinity, z1: -Infinity });
function bindInput(c) {
  let drag = null; const pts = new Map();
  c.addEventListener('pointerdown', e => { c.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]); drag = { d: null }; cam.goal = null; });
  c.addEventListener('pointermove', e => {
    if (!pts.has(e.pointerId)) return;
    const prev = pts.get(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]);
    if (pts.size === 2) {
      // 두 손가락 (지도 앱처럼): 나란히 위아래로 밀면 지도를 눕히고 세운다. 벌리고 오므리면 당기고, 비틀면 돌리고, 함께 옮기면 끈다.
      // 처음 조금 움직인 모양으로 둘 중 하나를 정해 끝까지 간다 — 섞이면 눕히려다 확대·회전이 같이 흔들린다
      const [a, b] = [...pts.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]), ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
      const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      if (!drag.d) { Object.assign(drag, { d, ang, mx, my, d0: d, ang0: ang, mx0: mx, my0: my, mode: null }); return; }
      if (!drag.mode) {
        const vx = mx - drag.mx0, vy = my - drag.my0, sp = Math.abs(d - drag.d0), tw = Math.abs(Math.atan2(Math.sin(ang - drag.ang0), Math.cos(ang - drag.ang0)));
        if (Math.hypot(vx, vy) + sp > 12) drag.mode = Math.abs(vy) > 2 * Math.abs(vx) && Math.abs(vy) > 1.5 * sp && tw < 0.15 ? 'tilt' : 'pinch';
      }
      if (drag.mode === 'tilt') ui.pitch = THREE.MathUtils.clamp(ui.pitch + (my - drag.my) * 0.005, 0.25, 1.45); // 위로 밀면 지평선 쪽으로 눕는다
      else if (drag.mode === 'pinch') {
        cam.dist = THREE.MathUtils.clamp(cam.dist * drag.d / d, minDist(), 520); zoomToStage(cam.dist);
        ui.yaw += Math.atan2(Math.sin(ang - drag.ang), Math.cos(ang - drag.ang)); // -π/π 경계를 넘을 때 한 바퀴 튀지 않게
        const dx = mx - drag.mx, dy = my - drag.my, s = cam.dist / wrap.clientHeight * 1.3;
        cam.tx -= (dx * Math.cos(cam.yaw) + dy * Math.sin(cam.yaw)) * s;
        cam.tz -= (-dx * Math.sin(cam.yaw) + dy * Math.cos(cam.yaw)) * s;
        const W = WORLD(); cam.tx = THREE.MathUtils.clamp(cam.tx, W.x0, W.x1); cam.tz = THREE.MathUtils.clamp(cam.tz, W.z0, W.z1);
      }
      Object.assign(drag, { d, ang, mx, my }); return;
    }
    cam.goal = null; // 손가락 하나로 끄는 동안은 무대로 되돌아가지 않는다 (두 손가락 확대 뒤 한 손가락만 남은 경우)
    const dx = e.clientX - prev[0], dy = e.clientY - prev[1], s = cam.dist / wrap.clientHeight * 1.3;
    if (e.shiftKey || e.buttons === 2) { ui.yaw -= dx * 0.005; ui.pitch = THREE.MathUtils.clamp(ui.pitch + dy * 0.004, 0.25, 1.45); return; }
    cam.tx -= (dx * Math.cos(cam.yaw) + dy * Math.sin(cam.yaw)) * s;
    cam.tz -= (-dx * Math.sin(cam.yaw) + dy * Math.cos(cam.yaw)) * s;
    const W = WORLD(); cam.tx = THREE.MathUtils.clamp(cam.tx, W.x0, W.x1); cam.tz = THREE.MathUtils.clamp(cam.tz, W.z0, W.z1);
  });
  const up = e => { pts.delete(e.pointerId); if (!pts.size) drag = null; else if (drag) drag = { d: null }; }; // 두 손가락 몸짓은 손가락 수가 바뀌면 처음부터 다시
  c.addEventListener('pointerup', up); c.addEventListener('pointercancel', up);
  c.addEventListener('contextmenu', e => e.preventDefault());
  c.addEventListener('wheel', e => { e.preventDefault(); zoomToStage((cam.goal?.dist ?? cam.dist) * Math.exp(e.deltaY * 0.001)); }, { passive: false });
}

/* ---------- 켜고 끄기 ---------- */
const orig = window.geoToClient;
async function setOn(v) {
  on = v;
  $('#mode3d').classList.toggle('active', on); $('#mode3d').setAttribute('aria-pressed', on);
  if (on) {
    // 지형을 다 불러올 때까지는 2D 지도를 두고 '준비 중'만 보인다 — 하늘색 위에 인물만 먼저 뜨지 않게
    document.body.classList.add('terrain-loading');
    if (!loading) { loading = build().then(() => { bindInput(renderer.domElement); resize(); }); }
    await loading;
    const k = placeOf(curEvent()), p = PLACES[k], [x, z] = px([p.lat, p.lng]);
    await Promise.all(regions.filter(r => regionAt(x, z) === r).map(ensureRegion));
    if (!on) return; // 불러오는 사이에 다시 눌러 껐다
    window.terrainOn = true;
    window.geoToClient = (lat, lng) => { const s = project(lat, lng); return { x: s.x, y: s.y }; };
    cam.tx = x; cam.tz = z; cam.dist = 420; flyToScene(curEvent()); // 높은 곳에서 내려앉듯
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); // 첫 화면을 그린 다음에 보인다
    if (!on) return;
    document.body.classList.remove('terrain-loading'); document.body.classList.add('terrain-on');
  } else {
    document.body.classList.remove('terrain-loading', 'terrain-on');
    window.terrainOn = false; window.geoToClient = orig; window.terrainView = null;
  }
  window.recenterStage?.();
}
function controls() {
  const box = document.createElement('div'); box.className = 'mapctl';
  const spin = document.createElement('div'); spin.className = 'm3load'; spin.setAttribute('aria-hidden', 'true');
  wrap.appendChild(spin);
  // 아이콘은 모두 24칸 SVG 선 그림 — 글자 기호(⌃↺⌖)는 글꼴마다 크기·굵기가 달라 어설퍼 보였다
  const I = d => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const ICON = {
    m3: '<path d="M12 3 20 7.5v9L12 21l-8-4.5v-9Z"/><path d="M4 7.5 12 12l8-4.5M12 12v9"/>', // 입체 상자
    tiltUp: '<path d="M3.5 19h17l-3.5-5h-10Z"/><path d="m8.5 9 3.5-3.5L15.5 9"/>', // 땅을 내려다보게
    tiltDown: '<path d="M3.5 19h17l-3.5-5h-10Z"/><path d="m8.5 6 3.5 3.5L15.5 6"/>', // 지평선 쪽으로
    left: '<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4.5 4v4h4"/>',
    right: '<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M19.5 4v4h-4"/>',
    in: '<path d="M12 5.5v13M5.5 12h13"/>',
    out: '<path d="M5.5 12h13"/>',
    plain: '<path d="M12 3.5s6 6.3 6 10.6a6 6 0 0 1-12 0C6 9.8 12 3.5 12 3.5Z"/><path d="M4.5 4.5l15 15"/>', // 빗금 친 물방울: 색 끄기
    reset: '<circle cx="12" cy="12" r="6.5"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3"/>',
  };
  const tool = (k, title) => `<button data-k="${k}" title="${title}" aria-label="${title}">${I(ICON[k])}</button>`;
  box.innerHTML = `<button id="mode3d" class="m3" aria-pressed="false">${I(ICON.m3)}</button>
    <div class="m3tools">
      ${tool('plain', t('plainTerrain'))}
      ${tool('tiltUp', t('tiltUp'))}${tool('tiltDown', t('tiltDown'))}
      ${tool('left', t('rotate'))}${tool('right', t('rotate'))}
      ${tool('in', '+')}${tool('out', '−')}
      ${tool('reset', t('resetView'))}
    </div>`;
  wrap.appendChild(box);
  $('#mode3d').title = t('map3d'); $('#mode3d').setAttribute('aria-label', t('map3d'));
  $('#mode3d').onclick = () => setOn(!on);
  const plainBtn = box.querySelector('[data-k="plain"]');
  plainBtn.setAttribute('aria-pressed', String(!!PLAIN.value));
  box.querySelectorAll('.m3tools button').forEach(b => b.onclick = () => {
    const k = b.dataset.k;
    if (k === 'plain') {
      PLAIN.value = PLAIN.value ? 0 : 1; plainBtn.setAttribute('aria-pressed', String(!!PLAIN.value));
      try { localStorage.setItem('theway-plain', PLAIN.value ? '1' : '0'); } catch { /* 이번 방문만 */ }
    }
    if (k === 'tiltUp') ui.pitch = Math.min(1.45, ui.pitch + 0.15);
    if (k === 'tiltDown') ui.pitch = Math.max(0.25, ui.pitch - 0.15);
    if (k === 'left') ui.yaw += 0.35;
    if (k === 'right') ui.yaw -= 0.35;
    if (k === 'in') zoomToStage(cam.dist * 0.7);
    if (k === 'out') zoomToStage(cam.dist * 1.4);
    if (k === 'reset') { ui.pitch = 0.62; ui.yaw = 0; zoomUser = 1; flyTo(placeOf(curEvent())); }
  });
}

// app.js가 데이터를 다 불러온 뒤에 조작기를 단다
function start() {
  if (!window.EVENTS_READY) return setTimeout(start, 200);
  controls();
  addEventListener('resize', () => on && ready && resize());
  // 프롤로그(에덴)는 본 지도와 떨어진 2D 무대라 3D를 막는다 — 3D로 보던 중에 들어오면 2D로 돌린다
  const lock = ev => { const pro = !!PLACES[ev.place]?.hidden; $('#mode3d').disabled = pro; if (pro && on) setOn(false); return pro; };
  lock(curEvent());
  // 다음 장면으로: 눕히고 돌린 각도는 그대로, 거리는 그 장면의 기본 거리에 사용자가 당긴 비율을 곱해
  addEventListener('stage:scene', e => { if (!lock(e.detail.ev) && on) { flyToScene(e.detail.ev); if (cam.goal) cam.goal.dist = THREE.MathUtils.clamp(cam.goal.dist * zoomUser, minDist(), 520); } });
  // 장면 안에서 옮겨 갈 때: 걸어가면 그곳으로 미리 날아가고, 장면만 바뀌면 그 자리의 무대로
  addEventListener('stage:here', e => { if (on) e.detail.walk ? flyTo(e.detail.to) : flyToScene(curEvent()); });
  // 걷기를 시작하면: 두 장소 사이 거리에 맞춰 물러나 길 전체의 흐름이 보이게
  addEventListener('stage:walk', e => {
    if (!on) return;
    const a = PLACES[placeOf(curEvent())], b = PLACES[e.detail.ev.start || e.detail.ev.place], [x1, z1] = px([a.lat, a.lng]), [x2, z2] = px([b.lat, b.lng]);
    walkDist = THREE.MathUtils.clamp(Math.hypot(x2 - x1, z2 - z1) * 0.9, 90, 480);
    ensureNear(x2, z2);
  });
  requestAnimationFrame(loop);
}
start();

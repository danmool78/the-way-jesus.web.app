/* 그 길 — 3D 지형 모드.
   실제 고도 자료(assets/terrain/*-height.png)로 땅을 솟게 하고 2D 지도와 같은 색(-color.webp)을 입혀 비스듬히 내려다본다.
   지역(갈릴리·유대·애굽)은 가까이 갈 때 하나씩 불러오고, 그 바깥은 2D 지도의 바탕 그림을 평평하게 깔아 이어 보인다.
   지도 한켠의 조작기: 3D 켜고 끄기, 기울이기, 돌리기, 당기기, 처음 시점.
   마우스: 끌면 옮기고, 오른쪽 버튼(또는 Shift)으로 끌면 돌리고 기울이고, 바퀴로 당긴다. 손가락: 하나로 옮기고, 둘로 벌려 당기고 비틀어 돌린다.
   좌표는 2D 지도와 같은 지도 단위(app.js의 px, 1단위 = 1/1000도 ≈ 111m). 높이는 EXAG배로 과장한다.
   켜져 있는 동안 window.geoToClient를 3D 투영으로 바꿔 끼워, 3D 무대(stage.js)가 지형 위의 같은 자리에 선다 */
import { THREE, damp, glowTexture } from './stage/kit.js';
import { buildJerusalem, EXTENT as JLM } from './stage/jerusalem.js';
import { MODELS as EGYPT_MODELS } from './stage/egypt.js';
import { SCRIPTS } from './stage/scenes.js';

// 지역: _src/terrain.py와 같게. fade: 높이를 해수면으로 풀어 내리는 가장자리 (맞닿은 쪽은 풀지 않는다)
const TREG = {
  galilee: { lat0: 32.55, lat1: 33.45, lng0: 35.0, lng1: 35.95, fade: 'nwe' },
  judea: { lat0: 31.35, lat1: 32.55, lng0: 35.0, lng1: 35.95, fade: 'swe' },
  egypt: { lat0: 29.8, lat1: 31.35, lng0: 30.95, lng1: 32.65, fade: 'nswe' },
};
const EXAG = 1.8, M = 1 / 111; // 높이 과장 배율, 1m = 1/111 지도 단위
const lv = m => m * M * EXAG;  // 고도(m) → 높이
// 호수: [GEO 이름, 수면 고도(m) — 없으면 평지의 얕은 호수]
const LAKES = [['galilee', -210], ['dead', -395], ['hula', 72], ['mareotis'], ['manzala'], ['sirbonis'], ['bitter']];
const RIVERS = ['jordanN', 'jordanS', 'nile', 'canopic', 'rosetta', 'damietta', 'pelusiac'];
// 바다 해안선: app.js buildMap의 바다 판과 같게 (남쪽은 시나이 북부 → 나일 삼각주 → 알렉산드리아)
const SINAI = [[31.13, 33.8], [31.15, 33.1], [31.26, 32.3], [31.52, 31.85], [31.47, 30.4], [31.2, 29.9], [30.9, 28.5], [30.8, 26]];
// 바탕 그림 두 장: app.js의 RELIEF, RELIEF_WEST와 같게
const BASES = [{ src: 'assets/relief.webp', lat0: 29.15, lat1: 34.6, lng0: 33.0, lng1: 37.4, y: 0 }, { src: 'assets/relief-west.webp', lat0: 29.15, lat1: 31.9, lng0: 29.4, lng1: 33.25, y: -0.05 }];

const wrap = document.querySelector('.mapwrap'), svg = document.getElementById('map');
let renderer, scene, camera, sun, env, on = false, ready = false, loading = null;
const regions = Object.entries(TREG).map(([name, r]) => {
  const [X0, Z0] = px([r.lat1, r.lng0]), [X1, Z1] = px([r.lat0, r.lng1]);
  return { name, ...r, X0, Z0, X1, Z1, heights: null, hw: 0, hh: 0, load: null, color: null };
});
const regionAt = (x, z) => regions.find(r => x >= r.X0 && x <= r.X1 && z >= r.Z0 && z <= r.Z1);
// 카메라: 바라보는 점(tx, tz), 거리, 기울기(내려다보는 각), 방위
const cam = { tx: 0, tz: 0, dist: 150, pitch: 0.62, yaw: 0, goal: null };
const placeDist = k => (isCity(k) ? 42 : 150); // 도성 안 장소는 바짝 다가가 3D 도성이 보이게
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
  svg.after(c);
  scene = new THREE.Scene();
  const sky = '#d6dcd6'; // 땅색이 살짝 섞인 옅은 하늘 — 지평선에서 땅과 하늘이 부드럽게 만난다
  scene.background = new THREE.Color(sky);
  scene.fog = new THREE.Fog(sky, 260, 900);
  camera = new THREE.PerspectiveCamera(38, 1, 1, 4000);
  scene.add(new THREE.HemisphereLight('#fff4dc', '#6b5a44', 1.35));
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
  const land = new THREE.Mesh(new THREE.PlaneGeometry(30000, 30000), new THREE.MeshStandardMaterial({ color: '#e3d5b4', roughness: 1 }));
  land.rotation.x = -Math.PI / 2; land.position.y = -8; land.receiveShadow = true; scene.add(land);
  await Promise.all(BASES.map(async b => { b.tex = mapTex(await loadImg(b.src)); }));
  addWalker(); addLabels();
  decorate();
  ready = true;
}

/* ---------- 지역 불러오기 ---------- */
function ensureRegion(r) {
  if (!r.load) r.load = loadRegion(r).then(() => { decorate(); window.recenterStage?.(); });
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
  r.mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: mapTex(cImg), roughness: 0.95 }));
  r.mesh.receiveShadow = r.mesh.castShadow = true;
  scene.add(r.mesh);
  addTrees(r); addVillages(r);
  if (r.name === 'galilee') addBoats();
  if (r.name === 'judea') addModel(buildJerusalem(), JLM, 1);
  if (r.name === 'egypt') Object.values(EGYPT_MODELS).forEach(m => addModel(m.build(), m.extent, 0.6));
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
    const [bx0, bz0] = px([b.lat1, b.lng0]), [bx1, bz1] = px([b.lat0, b.lng1]);
    const sh = new THREE.Shape([[bx0, bz0], [bx1, bz0], [bx1, bz1], [bx0, bz1]].map(([x, z]) => new THREE.Vector2(x, z)));
    regions.filter(r => r.heights && r.X0 >= bx0 && r.X1 <= bx1 && r.Z0 >= bz0 && r.Z1 <= bz1)
      .forEach(r => sh.holes.push(new THREE.Path([[r.X0, r.Z0], [r.X0, r.Z1], [r.X1, r.Z1], [r.X1, r.Z0]].map(([x, z]) => new THREE.Vector2(x, z)))));
    const m = flat(sh, new THREE.MeshStandardMaterial({ map: b.tex, transparent: true, roughness: 1, side: THREE.DoubleSide }), b.y);
    const p = m.geometry.attributes.position, uv = m.geometry.attributes.uv;
    for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) - bx0) / (bx1 - bx0), 1 - (p.getY(i) - bz0) / (bz1 - bz0));
  });
  // 지중해와 수에즈 만 (바탕 그림 위에 — 2D 지도도 바다를 그림 위에 덮는다)
  const seaM = new THREE.MeshStandardMaterial({ color: '#7ea6ad', roughness: 0.4, metalness: 0.1, envMap: env, envMapIntensity: 0.7, side: THREE.DoubleSide });
  flat(new THREE.Shape([[35.2, 36.0], [34.2, 35.65], ...GEO.coast, ...SINAI, [36, 26]].map(V2)), seaM, 0.05);
  flat(new THREE.Shape(GEO.suez.map(V2)), seaM, 0.05);
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
  RIVERS.forEach(k => {
    const base = new THREE.CatmullRomCurve3(GEO[k].map(p => { const [x, z] = px(p); return new THREE.Vector3(x, 0, z); }));
    const pts = base.getPoints(GEO[k].length * 24).map(v => new THREE.Vector3(v.x, heightAt(v.x, v.z) + 0.4, v.z));
    decor.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), pts.length, 0.45, 5), riverM));
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

/* ---------- 나무·마을·배·건물 ---------- */
let seed = 3; const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
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
  const im = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshStandardMaterial({ color: '#7d8f55', roughness: 1, flatShading: true, emissive: '#2a3418', emissiveIntensity: 0.6 }), spots.length); // emissive: 그늘진 면이 새까매지지 않게
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
    if (isCity(k) || regionAt(x0, z0) !== r || k === 'sea') return;
    const n = 8 + Math.floor(rnd() * 6), grp = new THREE.Group();
    for (let i = 0; i < n; i++) {
      const a = rnd() * 6.28, d = 1.2 + rnd() * 3.5, x = x0 + Math.cos(a) * d, z = z0 + Math.sin(a) * d, y = heightAt(x, z);
      if (y < lv(-205)) continue; // 호수 위에는 짓지 않는다
      const b = new THREE.Mesh(geo, m), s = 0.45 + rnd() * 0.4; // 집 한 채 50~90m 남짓 — 멀리서도 보이되 무대 인물보다 크지 않게
      b.scale.set(s, s * 0.7, s * (0.8 + rnd() * 0.5)); b.position.set(x, y + s * 0.35, z); b.rotation.y = rnd() * 3; b.castShadow = b.receiveShadow = true;
      grp.add(b); clutter.meshes.push({ m: b, x, z });
    }
    villages.set(k, grp); scene.add(grp);
  });
}
const boats = [];
function addBoats() {
  const hull = new THREE.MeshStandardMaterial({ color: '#6e4a2c', roughness: 0.9 }), sail = new THREE.MeshStandardMaterial({ color: '#efe6d2', side: THREE.DoubleSide });
  [[32.83, 35.57], [32.86, 35.6], [32.79, 35.6]].forEach(([a, b], i) => {
    const g = new THREE.Group(), [x, z] = px([a, b]);
    const h = new THREE.Mesh(new THREE.SphereGeometry(2.4, 12, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), hull); h.scale.set(1.6, 0.5, 0.6); g.add(h);
    const s = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 3.4), sail); s.position.y = 2.2; s.rotation.y = 1.2; g.add(s);
    g.position.set(x, lv(-210) + 0.3, z); g.rotation.y = i * 1.7; g.userData.phase = i * 2;
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
  group.traverse(o => { if (o.isInstancedMesh) clutterInstanced(o); }); // 도성의 집·나무, 표지의 대추야자도 무대 자리에서는 비킨다
}
// 무대가 서는 자리의 집·나무는 잠시 치운다. 무대는 지도 위에 겹쳐 그리는 그림이라, 그 밑의 집·나무가 인물 사이로 삐져나와 보인다.
// 치우는 넓이는 무대 그림의 크기(화면 px)를 그 자리의 지도 단위로 바꾼 것 — 당기고 물러나면 따라 바뀐다
let city = false;
const clutter = { inst: [], meshes: [] }, ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
function clutterInstanced(o) {
  o.updateMatrixWorld(true);
  const ms = [], xz = [], m = new THREE.Matrix4(), w = new THREE.Vector3();
  for (let i = 0; i < o.count; i++) { o.getMatrixAt(i, m); ms.push(m.clone()); w.setFromMatrixPosition(m).applyMatrix4(o.matrixWorld); xz.push([w.x, w.z]); }
  clutter.inst.push({ o, ms, xz });
  cleared = null; // 새로 생긴 것도 한 번 따져 본다
}
let cleared = null;
function clearStageSpot() {
  const f = window.stageFoot, stageOn = document.body.classList.contains('stage-on') && f;
  let cx = 1e9, cz = 1e9, r = 0;
  if (stageOn) {
    const p = PLACES[EVENTS[idx].place];
    [cx, cz] = px(f.at || [p.lat, p.lng]);
    const D = camera.position.distanceTo(v3.set(cx, heightAt(cx, cz), cz)), H = wrap.clientHeight || 1;
    r = f.rpx * 2 * D * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) / H;
  }
  if (cleared && Math.abs(cleared.cx - cx) < 0.01 && Math.abs(cleared.cz - cz) < 0.01 && Math.abs(cleared.r - r) <= cleared.r * 0.08) return;
  cleared = { cx, cz, r };
  clutter.meshes.forEach(({ m, x, z }) => { m.visible = Math.hypot(x - cx, z - cz) > r; });
  clutter.inst.forEach(({ o, ms, xz }) => { ms.forEach((m, i) => o.setMatrixAt(i, Math.hypot(xz[i][0] - cx, xz[i][1] - cz) > r ? m : ZERO)); o.instanceMatrix.needsUpdate = true; });
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
  Object.entries(PLACES).forEach(([k, p]) => add('place', k, p.lat, p.lng, p.name, isCity(k) ? 3 : 2));
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
  const cur = EVENTS[idx].place, nx = EVENTS[idx + 1]?.place, r = wrap.getBoundingClientRect(), taken = [];
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
    L.el.style.transform = `translate(${x}px, ${y}px)`;
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
  const at = SCRIPTS[ev.id]?.at;
  if (!at) return flyTo(ev.place);
  const p = PLACES[ev.place], [x0, z0] = px([p.lat, p.lng]), [x1, z1] = px(at), sep = Math.hypot(x1 - x0, z1 - z0);
  if (sep < 8) return flyTo(ev.place);
  ensureNear(x1, z1);
  cam.goal = { tx: (x0 + x1) / 2, tz: (z0 + z1) / 2, dist: Math.max(placeDist(ev.place), sep * 1.6) };
}
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
  window.terrainDrives = on && ready; // 무대(stage.js)는 이 루프 안에서 그린다
  if (!on || !ready) return;
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
  // 무대 인물의 크기: 당기면 커지되 천천히 (도성 가까이에서 건물을 다 가리지 않게)
  window.terrainView = { yaw: cam.yaw, pitch: cam.pitch, zoom: THREE.MathUtils.clamp((150 / cam.dist) ** 0.6, 0.35, 1.5) * (isCity(EVENTS[idx].place) ? 0.62 : 1) }; // 도성 안에서는 인물을 줄여 건물을 덜 가리게
  window.stageFrame?.(); // 바뀐 시점으로 무대를 붙이고 그린다
  // 안개는 카메라 거리에 맞춰 — 멀리 물러나도 땅의 끝이 하늘과 안개 속으로 녹아든다
  scene.fog.near = cam.dist * 1.1; scene.fog.far = cam.dist * 3.6;
  boats.forEach((b, i) => { b.position.y = lv(-210) + 0.3 + Math.sin(now / 900 + b.userData.phase) * 0.1; b.rotation.z = Math.sin(now / 1300 + i) * 0.04; });
  // 걷는 사람: 화면에서 늘 알아보게 거리에 맞춰 크기를 바꾼다. 서 있을 때는 고리만 은은하게
  if (walker.has) {
    const W = walker, s = Math.max(0.6, cam.dist / 150);
    W.g.visible = true; W.g.position.set(W.x, heightAt(W.x, W.z), W.z); W.g.scale.setScalar(s);
    const t = now / 1000;
    W.beam.visible = W.orb.visible = W.halo.visible = walking;
    W.orb.position.y = W.halo.position.y = 3.2 + Math.sin(t * 6) * 0.35;
    W.ring.scale.setScalar(walking ? 1 + (t * 1.4 % 1) * 1.6 : 1 + (t * 0.6 % 1) * 1.2);
    W.ring.material.opacity = walking ? 1 - (t * 1.4 % 1) : 0.7 * (1 - (t * 0.6 % 1));
    if (walking) ensureNear(W.x, W.z);
  }
  // 지나온 길만 밝게, 지금 걷는 길은 금빛으로, 아직 가지 않은 길은 흐리게
  // 아주 가까이(도성 안)에서는 길을 옅게 — 굵은 길이 건물을 덮지 않게
  const near = THREE.MathUtils.clamp((cam.dist - 40) / 90, 0.15, 1);
  routes.forEach(l => { const i = l.userData.i; l.material.opacity = (i <= idx ? 0.9 : walking && i === idx + 1 ? 1 : 0.18) * near; });
  clearStageSpot();
  renderer.render(scene, camera);
  placeLabels();
}

/* ---------- 조작: 끌어 옮기기, 바퀴·두 손가락으로 당기기 ---------- */
const ui = { pitch: 0.62, yaw: 0 };
const WORLD = (() => { const [x0, z0] = px([34.6, 29.4]), [x1, z1] = px([29.15, 37.4]); return { x0, z0, x1, z1 }; })();
function bindInput(c) {
  let drag = null; const pts = new Map();
  c.addEventListener('pointerdown', e => { c.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]); drag = { d: null }; cam.goal = null; });
  c.addEventListener('pointermove', e => {
    if (!pts.has(e.pointerId)) return;
    const prev = pts.get(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]);
    if (pts.size === 2) { // 두 손가락: 벌리고 오므려 당기고, 비틀어 돌린다
      const [a, b] = [...pts.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]), ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
      if (drag.d) cam.dist = THREE.MathUtils.clamp(cam.dist * drag.d / d, 25, 520);
      if (drag.ang !== undefined) ui.yaw += ang - drag.ang;
      drag.d = d; drag.ang = ang; return;
    }
    const dx = e.clientX - prev[0], dy = e.clientY - prev[1], s = cam.dist / wrap.clientHeight * 1.3;
    if (e.shiftKey || e.buttons === 2) { ui.yaw -= dx * 0.005; ui.pitch = THREE.MathUtils.clamp(ui.pitch + dy * 0.004, 0.25, 1.45); return; }
    cam.tx -= (dx * Math.cos(cam.yaw) + dy * Math.sin(cam.yaw)) * s;
    cam.tz -= (-dx * Math.sin(cam.yaw) + dy * Math.cos(cam.yaw)) * s;
    cam.tx = THREE.MathUtils.clamp(cam.tx, WORLD.x0, WORLD.x1); cam.tz = THREE.MathUtils.clamp(cam.tz, WORLD.z0, WORLD.z1);
  });
  const up = e => { pts.delete(e.pointerId); if (!pts.size) drag = null; };
  c.addEventListener('pointerup', up); c.addEventListener('pointercancel', up);
  c.addEventListener('contextmenu', e => e.preventDefault());
  c.addEventListener('wheel', e => { e.preventDefault(); cam.goal = null; cam.dist = THREE.MathUtils.clamp(cam.dist * Math.exp(e.deltaY * 0.001), 25, 520); }, { passive: false });
}

/* ---------- 켜고 끄기 ---------- */
const orig = window.geoToClient;
async function setOn(v) {
  on = v;
  document.body.classList.toggle('terrain-on', on);
  $('#mode3d').classList.toggle('active', on); $('#mode3d').setAttribute('aria-pressed', on);
  if (on) {
    if (!loading) { loading = build().then(() => { bindInput(renderer.domElement); resize(); }); }
    await loading;
    const k = EVENTS[idx].place, p = PLACES[k], [x, z] = px([p.lat, p.lng]);
    await Promise.all(regions.filter(r => regionAt(x, z) === r).map(ensureRegion));
    window.terrainOn = true;
    window.geoToClient = (lat, lng) => { const s = project(lat, lng); return { x: s.x, y: s.y }; };
    cam.tx = x; cam.tz = z; cam.dist = 420; flyToScene(EVENTS[idx]); // 높은 곳에서 내려앉듯
  } else {
    window.terrainOn = false; window.geoToClient = orig; window.terrainView = null;
  }
  window.recenterStage?.();
}
function controls() {
  const box = document.createElement('div'); box.className = 'mapctl';
  box.innerHTML = `<button id="mode3d" class="m3" aria-pressed="false">3D</button>
    <div class="m3tools">
      <button data-k="tiltUp" title="${t('tiltUp')}">⌃</button><button data-k="tiltDown" title="${t('tiltDown')}">⌄</button>
      <button data-k="left" title="${t('rotate')}">↺</button><button data-k="right" title="${t('rotate')}">↻</button>
      <button data-k="in" title="+">+</button><button data-k="out" title="−">−</button>
      <button data-k="reset" title="${t('resetView')}">⌖</button>
    </div>`;
  wrap.appendChild(box);
  $('#mode3d').title = t('map3d');
  $('#mode3d').onclick = () => setOn(!on);
  box.querySelectorAll('.m3tools button').forEach(b => b.onclick = () => {
    const k = b.dataset.k;
    if (k === 'tiltUp') ui.pitch = Math.min(1.45, ui.pitch + 0.15);
    if (k === 'tiltDown') ui.pitch = Math.max(0.25, ui.pitch - 0.15);
    if (k === 'left') ui.yaw += 0.35;
    if (k === 'right') ui.yaw -= 0.35;
    if (k === 'in') cam.goal = { tx: cam.tx, tz: cam.tz, dist: Math.max(25, cam.dist * 0.7) };
    if (k === 'out') cam.goal = { tx: cam.tx, tz: cam.tz, dist: Math.min(520, cam.dist * 1.4) };
    if (k === 'reset') { ui.pitch = 0.62; ui.yaw = 0; flyTo(EVENTS[idx].place); }
  });
}

// app.js가 데이터를 다 불러온 뒤에 조작기를 단다
function start() {
  if (!window.EVENTS_READY) return setTimeout(start, 200);
  controls();
  addEventListener('resize', () => on && ready && resize());
  addEventListener('stage:scene', e => { if (on) flyToScene(e.detail.ev); });
  // 걷기를 시작하면: 두 장소 사이 거리에 맞춰 물러나 길 전체의 흐름이 보이게
  addEventListener('stage:walk', e => {
    if (!on) return;
    const a = PLACES[EVENTS[idx].place], b = PLACES[e.detail.ev.place], [x1, z1] = px([a.lat, a.lng]), [x2, z2] = px([b.lat, b.lng]);
    walkDist = THREE.MathUtils.clamp(Math.hypot(x2 - x1, z2 - z1) * 0.9, 90, 480);
    ensureNear(x2, z2);
  });
  requestAnimationFrame(loop);
}
start();

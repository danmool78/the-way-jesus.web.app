/* 그 길 — 3D 지형 모드 (시험판: 갈릴리 호수 둘레).
   실제 고도 자료(assets/terrain/*-height.png)로 땅을 솟게 하고 2D 지도와 같은 색(-color.webp)을 입혀 비스듬히 내려다본다.
   지도 한켠의 조작기: 3D 켜고 끄기, 기울이기, 돌리기, 처음 시점. 끌어서 옮기고 바퀴·두 손가락으로 당겨 본다.
   좌표는 2D 지도와 같은 지도 단위(app.js의 px, 1단위 = 1/1000도 ≈ 111m — 갈릴리 둘레가 약 680×900단위). 높이는 EXAG배로 과장한다.
   켜져 있는 동안 window.geoToClient를 3D 투영으로 바꿔 끼워, 3D 무대(stage.js)가 지형 위의 같은 자리에 선다 */
import { THREE, damp } from './stage/kit.js';

const REGIONS = { galilee: { lat0: 32.55, lat1: 33.45, lng0: 35.15, lng1: 35.95 } }; // _src/terrain.py와 같게
const R = REGIONS.galilee, NAME = 'galilee';
const EXAG = 1.8, M = 1 / 111; // 높이 과장 배율, 1m = 1/111 지도 단위
const LAKE_Y = -210 * M * EXAG; // 갈릴리 호수 수면 (해수면 아래 210m)

const wrap = document.querySelector('.mapwrap'), svg = document.getElementById('map');
let renderer, scene, camera, ground, heights, hw, hh, on = false, ready = false, loading = null;
const labels = new Map();
const [X0, Z0] = px([R.lat1, R.lng0]), [X1, Z1] = px([R.lat0, R.lng1]);
const inRegion = p => p.lat >= R.lat0 && p.lat <= R.lat1 && p.lng >= R.lng0 && p.lng <= R.lng1;

// 카메라: 바라보는 점(tx, tz), 거리, 기울기(내려다보는 각), 방위
const cam = { tx: 0, tz: 0, dist: 150, pitch: 0.62, yaw: 0, goal: null };

/* ---------- 높이 ---------- */
function heightAt(x, z) { // 지도 단위 좌표의 지형 높이 (쌍선형)
  if (!heights) return 0;
  const u = (x - X0) / (X1 - X0) * (hw - 1), v = (z - Z0) / (Z1 - Z0) * (hh - 1);
  if (u < 0 || v < 0 || u > hw - 1 || v > hh - 1) return 0;
  const i = Math.floor(u), j = Math.floor(v), fu = u - i, fv = v - j, g = (a, b) => heights[Math.min(hh - 1, b) * hw + Math.min(hw - 1, a)];
  return ((g(i, j) * (1 - fu) + g(i + 1, j) * fu) * (1 - fv) + (g(i, j + 1) * (1 - fu) + g(i + 1, j + 1) * fu) * fv);
}
const loadImg = src => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; });

async function build() {
  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const c = renderer.domElement; c.className = 'terrain3d'; c.setAttribute('aria-hidden', 'true');
  svg.after(c);
  scene = new THREE.Scene();
  // 하늘과 먼 안개: 위는 맑은 하늘색, 지평선은 옅은 우윳빛
  const sky = '#cfd9dc';
  scene.background = new THREE.Color(sky);
  scene.fog = new THREE.Fog(sky, 260, 900); // 먼 곳은 옅은 안개 속으로
  camera = new THREE.PerspectiveCamera(38, 1, 1, 3000);
  scene.add(new THREE.HemisphereLight('#fff4dc', '#6b5a44', 1.35));
  const sun = new THREE.DirectionalLight('#fff0d4', 2.4);
  sun.position.set(-400, 500, -300); sun.castShadow = true;
  Object.assign(sun.shadow.camera, { left: -500, right: 500, top: 500, bottom: -500, near: 10, far: 2000 });
  sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0005;
  scene.add(sun); scene.add(sun.target);
  // 물 반사용 주변광: 하늘 그라데이션을 PMREM으로 굽는다
  const envScene = new THREE.Scene();
  const g = new THREE.SphereGeometry(10, 32, 16), col = [];
  for (let i = 0; i < g.attributes.position.count; i++) { const y = g.attributes.position.getY(i) / 10; const cc = new THREE.Color('#e8eef0').lerp(new THREE.Color('#7fa7c0'), Math.max(0, y)); col.push(cc.r, cc.g, cc.b); }
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  envScene.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
  const env = new THREE.PMREMGenerator(renderer).fromScene(envScene).texture;

  const [hImg, cImg] = await Promise.all([loadImg(`assets/terrain/${NAME}-height.png`), loadImg(`assets/terrain/${NAME}-color.webp`)]);
  hw = hImg.width; hh = hImg.height;
  const cv = document.createElement('canvas'); cv.width = hw; cv.height = hh;
  const cx = cv.getContext('2d', { willReadFrequently: true }); cx.drawImage(hImg, 0, 0);
  const px8 = cx.getImageData(0, 0, hw, hh).data;
  heights = new Float32Array(hw * hh);
  for (let i = 0; i < hw * hh; i++) heights[i] = ((px8[i * 4] * 256 + px8[i * 4 + 1]) / 10 - 500) * M * EXAG;

  // 땅: 고도 격자를 그대로 꼭짓점으로
  const geo = new THREE.PlaneGeometry(X1 - X0, Z1 - Z0, hw - 1, hh - 1);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  for (let j = 0; j < hh; j++) for (let i = 0; i < hw; i++) pos.setY(j * hw + i, heights[j * hw + i]);
  geo.translate((X0 + X1) / 2, 0, (Z0 + Z1) / 2);
  geo.computeVertexNormals();
  const tex = new THREE.Texture(cImg); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = renderer.capabilities.getMaxAnisotropy(); tex.needsUpdate = true;
  ground = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 }));
  ground.receiveShadow = true; ground.castShadow = true;
  scene.add(ground);
  // 가장자리 치마: 지형 판의 옆면을 땅색으로 내려 덮어 떠 있는 판처럼 보이지 않게
  const skirt = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), new THREE.MeshStandardMaterial({ color: '#b9a47c', roughness: 1 }));
  skirt.rotation.x = -Math.PI / 2; skirt.position.set((X0 + X1) / 2, -6, (Z0 + Z1) / 2); // 가장 낮은 땅(해수면 아래 약 280m)보다 아래 scene.add(skirt);

  // 갈릴리 호수: 2D 지도와 같은 물가 선, 수면은 하늘을 비춘다
  const shape = new THREE.Shape(GEO.galilee.map(p => { const [x, z] = px(p); return new THREE.Vector2(x, z); }));
  const lake = new THREE.Mesh(new THREE.ShapeGeometry(shape, 24), new THREE.MeshStandardMaterial({ color: '#4f8798', roughness: 0.08, metalness: 0.35, envMap: env, envMapIntensity: 1.2, transparent: true, opacity: 0.94, side: THREE.DoubleSide }));
  lake.rotation.x = Math.PI / 2; lake.position.y = LAKE_Y + 0.25; // (모양의 y가 지도 z로 가게 눕힌다 — 그러면 면이 아래를 보므로 양면) lake.receiveShadow = true;
  scene.add(lake);
  // 요단 강: 물빛 띠
  ['jordanN', 'jordanS'].forEach(k => {
    const pts = GEO[k].filter(([a, b]) => a >= R.lat0 && a <= R.lat1).map(p => { const [x, z] = px(p); return new THREE.Vector3(x, heightAt(x, z) + 0.4, z); });
    if (pts.length > 1) scene.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, 0.45, 5), new THREE.MeshStandardMaterial({ color: '#5f93a3', roughness: 0.2, metalness: 0.2, envMap: env })));
  });
  addTrees(); addVillages(); addBoats(); addRoutes(); addLabels();
  ready = true;
}

/* ---------- 나무·마을·배 ---------- */
let seed = 3; const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
function addTrees() {
  // 초록이 짙고 완만한 곳(색 그림의 초록 정도로 고른다)에 올리브·떡갈나무 덩이
  const cImg = ground.material.map.image, cv = document.createElement('canvas'); cv.width = 256; cv.height = Math.round(256 * cImg.height / cImg.width);
  const cx = cv.getContext('2d', { willReadFrequently: true }); cx.drawImage(cImg, 0, 0, cv.width, cv.height);
  const d = cx.getImageData(0, 0, cv.width, cv.height).data, spots = [];
  for (let n = 0; n < 9000 && spots.length < 2600; n++) {
    const u = rnd(), v = rnd(), k = (Math.floor(v * cv.height) * cv.width + Math.floor(u * cv.width)) * 4;
    const r = d[k], gg = d[k + 1], b = d[k + 2];
    if (gg - r < 6 || gg < 110 || b > gg) continue; // 초록 기운이 있는 곳만
    const x = X0 + u * (X1 - X0), z = Z0 + v * (Z1 - Z0), y = heightAt(x, z);
    if (y < LAKE_Y + 0.5) continue;
    spots.push([x, y, z]);
  }
  const im = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshStandardMaterial({ color: '#7d8f55', roughness: 1, flatShading: true, emissive: '#2a3418', emissiveIntensity: 0.6 }), spots.length); // emissive: 그늘진 면이 새까매지지 않게
  const o = new THREE.Object3D(), c = new THREE.Color();
  spots.forEach(([x, y, z], i) => { const s = 0.7 + rnd() * 0.8; o.position.set(x, y + s * 0.6, z); o.scale.set(s, s * 0.85, s); o.rotation.y = rnd() * 6; o.updateMatrix(); im.setMatrixAt(i, o.matrix); im.setColorAt(i, c.set('#7d8f55').multiplyScalar(0.85 + rnd() * 0.3)); });
  im.castShadow = true; scene.add(im);
}
function addVillages() {
  // 장소마다 흙벽 집 몇 채 (낮은 상자들) — 이름난 마을의 자리를 알아보게
  const m = new THREE.MeshStandardMaterial({ color: '#d8c49c', roughness: 0.9 }), geo = new THREE.BoxGeometry(1, 1, 1);
  Object.values(PLACES).filter(inRegion).forEach(p => {
    const [px0, pz0] = px([p.lat, p.lng]), n = 7 + Math.floor(rnd() * 6);
    for (let i = 0; i < n; i++) {
      const a = rnd() * 6.28, r = 1.5 + rnd() * 5, x = px0 + Math.cos(a) * r, z = pz0 + Math.sin(a) * r, y = heightAt(x, z);
      if (y < LAKE_Y + 0.5) continue;
      const b = new THREE.Mesh(geo, m), s = 1.2 + rnd() * 1.0;
      b.scale.set(s, s * 0.7, s * (0.8 + rnd() * 0.5)); b.position.set(x, y + s * 0.35, z); b.rotation.y = rnd() * 3; b.castShadow = b.receiveShadow = true;
      scene.add(b);
    }
  });
}
const boats = [];
function addBoats() {
  const hull = new THREE.MeshStandardMaterial({ color: '#6e4a2c', roughness: 0.9 }), sail = new THREE.MeshStandardMaterial({ color: '#efe6d2', side: THREE.DoubleSide });
  [[32.83, 35.57], [32.86, 35.6], [32.79, 35.6]].forEach(([a, b], i) => {
    const g = new THREE.Group(), [x, z] = px([a, b]);
    const h = new THREE.Mesh(new THREE.SphereGeometry(2.4, 12, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), hull); h.scale.set(1.6, 0.5, 0.6); g.add(h);
    const s = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 3.4), sail); s.position.y = 2.2; s.rotation.y = 1.2; g.add(s);
    g.position.set(x, LAKE_Y + 0.3, z); g.rotation.y = i * 1.7; g.userData.phase = i * 2;
    scene.add(g); boats.push(g);
  });
}
/* ---------- 경로와 이름 ---------- */
let routes = null;
function addRoutes() {
  // 지나온 길을 땅 위에 금빛 선으로 (지형을 따라 굽게 꼭짓점을 촘촘히)
  routes = new THREE.Group(); scene.add(routes);
  for (let i = 1; i < EVENTS.length; i++) {
    const a = PLACES[EVENTS[i - 1].place], b = PLACES[EVENTS[i].place];
    if (a === b || !inRegion(a) || !inRegion(b)) continue;
    const [x1, z1] = px([a.lat, a.lng]), [x2, z2] = px([b.lat, b.lng]), dx = x2 - x1, dz = z2 - z1, bend = (i % 2 ? 1 : -1) * 0.18;
    const qx = (x1 + x2) / 2 - dz * bend, qz = (z1 + z2) / 2 + dx * bend, pts = [];
    for (let k = 0; k <= 40; k++) { const t = k / 40, x = (1 - t) ** 2 * x1 + 2 * (1 - t) * t * qx + t * t * x2, z = (1 - t) ** 2 * z1 + 2 * (1 - t) * t * qz + t * t * z2; pts.push(new THREE.Vector3(x, Math.max(heightAt(x, z), LAKE_Y) + 0.8, z)); }
    const line = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.55, 4), new THREE.MeshBasicMaterial({ color: PERIODS[EVENTS[i].p].color, transparent: true, opacity: 0.85 }));
    line.userData.i = i; routes.add(line);
  }
}
function addLabels() {
  const box = document.createElement('div'); box.className = 'tlabels'; renderer.domElement.after(box); // 장면 카드보다 아래에 깔리게 지형 바로 뒤에
  Object.entries(PLACES).filter(([, p]) => inRegion(p)).forEach(([k, p]) => {
    const el = document.createElement('div'); el.className = 'tlabel'; el.innerHTML = `<i></i><span>${p.name.replace(/[&<>]/g, '')}</span>`;
    box.appendChild(el); labels.set(k, { el, p });
  });
  // 지형 이름 (지도의 '알고 가기' 표지): 헤르몬산 · 다볼산 · 갈릴리 바다
  [['hermon', 33.416, 35.857, t('mtHermon')], ['lake', 32.82, 35.59, tm('갈릴리 바다')]].forEach(([k, a, b, n]) => {
    const el = document.createElement('div'); el.className = 'tlabel feature'; el.innerHTML = `<span>${n}</span>`; box.appendChild(el); labels.set(k, { el, p: { lat: a, lng: b } });
  });
}
const v3 = new THREE.Vector3();
function project(lat, lng, lift = 0) {
  const [x, z] = px([lat, lng]); v3.set(x, Math.max(heightAt(x, z), LAKE_Y) + lift, z).project(camera);
  const r = renderer.domElement.getBoundingClientRect();
  return { x: r.left + (v3.x + 1) / 2 * r.width, y: r.top + (1 - v3.y) / 2 * r.height, behind: v3.z > 1 };
}

/* ---------- 카메라 ---------- */
function placeCam() {
  const ground0 = Math.max(heightAt(cam.tx, cam.tz), LAKE_Y);
  const h = Math.sin(cam.pitch) * cam.dist, d = Math.cos(cam.pitch) * cam.dist;
  camera.position.set(cam.tx + Math.sin(cam.yaw) * d, ground0 + h, cam.tz + Math.cos(cam.yaw) * d);
  camera.lookAt(cam.tx, ground0, cam.tz);
}
// 장소로 날아가기: 지금 장면의 장소를 화면 가운데(카드에 가리지 않는 쪽)로
function flyTo(p, dist = 150) {
  const [x, z] = px([p.lat, p.lng]);
  cam.goal = { tx: x, tz: z, dist };
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

let last = performance.now();
function loop(now) {
  requestAnimationFrame(loop);
  if (!on || !ready) return;
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (cam.goal) {
    const k = 1 - Math.exp(-2.2 * dt);
    cam.tx += (cam.goal.tx - cam.tx) * k; cam.tz += (cam.goal.tz - cam.tz) * k; cam.dist += (cam.goal.dist - cam.dist) * k;
    if (Math.hypot(cam.goal.tx - cam.tx, cam.goal.tz - cam.tz) < 0.01 && Math.abs(cam.goal.dist - cam.dist) < 0.01) cam.goal = null;
  }
  cam.pitch = damp(cam.pitch, ui.pitch, 4, dt); cam.yaw = damp(cam.yaw, ui.yaw, 4, dt);
  placeCam();
  boats.forEach((b, i) => { b.position.y = LAKE_Y + 0.3 + Math.sin(now / 900 + b.userData.phase) * 0.1; b.rotation.z = Math.sin(now / 1300 + i) * 0.04; });
  // 지나온 길만 밝게, 아직 가지 않은 길은 흐리게
  routes.children.forEach(l => { l.material.opacity = l.userData.i <= idx ? 0.9 : 0.18; });
  renderer.render(scene, camera);
  // 이름표: 화면에 투영해 HTML로 (글씨가 언제나 또렷하게)
  const cur = EVENTS[idx].place;
  labels.forEach(({ el, p }, k) => {
    const s = project(p.lat, p.lng, 1.5), r = wrap.getBoundingClientRect();
    el.style.transform = `translate(${s.x - r.left}px, ${s.y - r.top}px)`;
    el.style.opacity = s.behind ? 0 : 1;
    el.classList.toggle('now', k === cur);
  });
}

/* ---------- 조작: 끌어 옮기기, 바퀴·두 손가락으로 당기기 ---------- */
const ui = { pitch: 0.62, yaw: 0 };
function bindInput(c) {
  let drag = null; const pts = new Map();
  c.addEventListener('pointerdown', e => { c.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]); drag = { x: e.clientX, y: e.clientY, d: null }; cam.goal = null; });
  c.addEventListener('pointermove', e => {
    if (!pts.has(e.pointerId)) return;
    const prev = pts.get(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]);
    if (pts.size === 2) { // 두 손가락: 벌리고 오므려 당기기
      const [a, b] = [...pts.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]);
      if (drag.d) cam.dist = THREE.MathUtils.clamp(cam.dist * drag.d / d, 25, 800);
      drag.d = d; return;
    }
    const dx = e.clientX - prev[0], dy = e.clientY - prev[1], s = cam.dist / wrap.clientHeight * 1.3;
    if (e.shiftKey || e.buttons === 2) { ui.yaw -= dx * 0.005; ui.pitch = THREE.MathUtils.clamp(ui.pitch + dy * 0.004, 0.25, 1.45); return; }
    cam.tx -= (dx * Math.cos(cam.yaw) + dy * Math.sin(cam.yaw)) * s;
    cam.tz -= (-dx * Math.sin(cam.yaw) + dy * Math.cos(cam.yaw)) * s;
    cam.tx = THREE.MathUtils.clamp(cam.tx, X0, X1); cam.tz = THREE.MathUtils.clamp(cam.tz, Z0, Z1);
  });
  const up = e => { pts.delete(e.pointerId); if (!pts.size) drag = null; };
  c.addEventListener('pointerup', up); c.addEventListener('pointercancel', up);
  c.addEventListener('contextmenu', e => e.preventDefault());
  c.addEventListener('wheel', e => { e.preventDefault(); cam.goal = null; cam.dist = THREE.MathUtils.clamp(cam.dist * Math.exp(e.deltaY * 0.001), 25, 800); }, { passive: false });
}

/* ---------- 켜고 끄기 ---------- */
const orig = window.geoToClient;
async function setOn(v) {
  const here = PLACES[EVENTS[idx].place];
  if (v && !inRegion(here)) { toast(t('only3dGalilee')); v = false; }
  on = v;
  document.body.classList.toggle('terrain-on', on);
  $('#mode3d').classList.toggle('active', on); $('#mode3d').setAttribute('aria-pressed', on);
  if (on) {
    if (!loading) { loading = build().then(() => { bindInput(renderer.domElement); resize(); }); }
    await loading;
    window.terrainOn = true;
    window.geoToClient = (lat, lng) => { const s = project(lat, lng); return { x: s.x, y: s.y }; };
    const [x, z] = px([here.lat, here.lng]); cam.tx = x; cam.tz = z; cam.dist = 420; flyTo(here); // 높은 곳에서 내려앉듯
  } else {
    window.terrainOn = false; window.geoToClient = orig;
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
    if (k === 'out') cam.goal = { tx: cam.tx, tz: cam.tz, dist: Math.min(800, cam.dist * 1.4) };
    if (k === 'reset') { ui.pitch = 0.62; ui.yaw = 0; flyTo(PLACES[EVENTS[idx].place]); }
  });
}

// app.js가 데이터를 다 불러온 뒤에 조작기를 단다
function start() {
  if (!window.EVENTS_READY) return setTimeout(start, 200);
  controls();
  addEventListener('resize', () => on && ready && resize());
  addEventListener('stage:scene', e => {
    if (!on) return;
    const p = PLACES[e.detail.ev.place];
    if (!inRegion(p)) { setOn(false); toast(t('only3dGalilee')); return; }
    flyTo(p);
  });
  requestAnimationFrame(loop);
}
start();

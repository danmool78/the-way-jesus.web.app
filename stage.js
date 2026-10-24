/* 그 길 — 3D 무대. 장소 핀 위에 장면의 인물을 세우고, 낭독에 맞춰 연기시킨다.
   app.js가 보내는 이벤트: stage:scene {i, ev}, stage:walk {i, ev}, stage:beat {beat, s}, stage:stop */
import { THREE, damp } from './stage/kit.js';
import { Actor } from './stage/people.js';
import { makeProp } from './stage/props.js';
import { SCRIPTS } from './stage/scenes.js';

const wrap = document.querySelector('.mapwrap');
const map = document.getElementById('map');

/* ---------- 렌더러 · 카메라 · 빛 ---------- */
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
} catch { /* WebGL이 없으면 기존 SVG 표시를 그대로 쓴다 */ }

const scene = new THREE.Scene();
const FOV = 28;
const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 50);
camera.position.set(0, 2.55, 8.7);
camera.lookAt(0, 0.5, 0);

const hemi = new THREE.HemisphereLight(0xfff4dc, 0x8a7350, 1.6);
scene.add(hemi);
// 지도 음영과 같은 북서쪽 빛 (화면 왼쪽 위 = 북서)
const sun = new THREE.DirectionalLight(0xfff0d0, 2.2);
sun.position.set(-2.2, 4, -1.6);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
Object.assign(sun.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: 0.5, far: 14 });
sun.shadow.radius = 4;
scene.add(sun);
const ground = new THREE.Mesh(new THREE.CircleGeometry(3, 40), new THREE.ShadowMaterial({ opacity: 0.28 }));
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);
// 땅(물) 아래로 내려간 부분을 가리는 보이지 않는 바닥 — 무릎 꿇은 옷자락, 물에 잠긴 뱃전
const occluder = new THREE.Mesh(new THREE.CircleGeometry(4, 40), new THREE.MeshBasicMaterial({ colorWrite: false }));
occluder.rotation.x = -Math.PI / 2;
occluder.position.y = -0.001;
occluder.renderOrder = -1;
scene.add(occluder);

/* ---------- 장면 분위기: 조명과 지도 색조를 함께 바꾼다 ----------
   wave/rain은 물결·비의 세기(0~1), map은 지도에 거는 CSS 필터 */
const ENV = {
  day:      { hemi: [1.6, '#fff4dc'], sun: [2.2, '#fff0d0'], shadow: 0.28, map: '' },
  dusk:     { hemi: [1.15, '#ffdcb8'], sun: [1.6, '#ffb878'], shadow: 0.32, map: 'sepia(.3) saturate(1.1) brightness(.88)' },
  night:    { hemi: [0.7, '#a9bcff'], sun: [0.55, '#b8c8ff'], shadow: 0.18, map: 'brightness(.5) saturate(.55) hue-rotate(-12deg)' },
  storm:    { hemi: [0.95, '#b9c6cf'], sun: [0.7, '#c9d4dc'], shadow: 0.12, map: 'brightness(.62) saturate(.45) contrast(1.05)', wave: 1, rain: 1 },
  calm:     { hemi: [1.25, '#ffe2c2'], sun: [1.7, '#ffc58e'], shadow: 0.3, map: 'sepia(.22) brightness(.92)', wave: 0 },
  overcast: { hemi: [1.15, '#e8e2d6'], sun: [1.0, '#e9e4da'], shadow: 0.16, map: 'saturate(.6) brightness(.85)' },
  dark:     { hemi: [0.55, '#9a96a8'], sun: [0.3, '#a8a4b4'], shadow: 0.08, map: 'brightness(.36) saturate(.25)' },
  // 부활의 새벽: 골고다의 어둠과 대비되게, 장밋빛 금빛이 번지며 색이 돌아온다
  dawn:     { hemi: [1.35, '#ffe0d0'], sun: [1.9, '#ffc9a0'], shadow: 0.26, map: 'sepia(.12) saturate(1.15) brightness(.97) hue-rotate(-6deg)' },
  // 영광: 맑고 밝은 빛 (승천)
  glory:    { hemi: [1.9, '#fff8e8'], sun: [2.5, '#fff4dc'], shadow: 0.24, map: 'saturate(1.15) brightness(1.06)' },
};
let env = { ...ENV.day, name: 'day' };
const envNow = { hemi: 1.6, sun: 2.2, waveNow: 0, rainNow: 0, wave: 0 };
const hemiCol = new THREE.Color('#fff4dc'), sunCol = new THREE.Color('#fff0d0');
function setEnv(name, instant = false) {
  env = { ...ENV[name], name };
  map.style.filter = env.map;
  if (instant) {
    envNow.hemi = env.hemi[0]; envNow.sun = env.sun[0];
    envNow.waveNow = env.wave || 0; envNow.rainNow = env.rain || 0;
    hemi.color.set(env.hemi[1]); sun.color.set(env.sun[1]);
  }
}
function updateEnv(dt) {
  envNow.hemi = damp(envNow.hemi, env.hemi[0], 1.2, dt);
  envNow.sun = damp(envNow.sun, env.sun[0], 1.2, dt);
  hemi.intensity = envNow.hemi; sun.intensity = envNow.sun;
  hemi.color.lerp(hemiCol.set(env.hemi[1]), 1 - Math.exp(-1.2 * dt));
  sun.color.lerp(sunCol.set(env.sun[1]), 1 - Math.exp(-1.2 * dt));
  ground.material.opacity = damp(ground.material.opacity, env.shadow, 1.2, dt);
  envNow.waveNow = damp(envNow.waveNow, env.wave || 0, 0.9, dt);
  envNow.rainNow = damp(envNow.rainNow, env.rain || 0, 1.5, dt);
  envNow.wave = envNow.waveNow;
}

/* ---------- 무대 상태 ---------- */
let actors = {}, props = {}, script = null, curEv = null, mode = 'off', token = 0; // mode: off | scene
const stageGroup = new THREE.Group();
scene.add(stageGroup);

function clearCast() {
  token++;
  Object.values(actors).forEach(a => a.p.root.removeFromParent());
  Object.values(props).forEach(p => p.obj.removeFromParent());
  actors = {}; props = {};
}
/* 동작 명령: [이름, 자세(또는 소품 상태), 옵션]
   이름이 '@env'면 분위기 전환. 옵션: x, z, y, look, show, item, board('배 이름' 또는 null), delay(ms), to(말을 건네는 상대) */
function apply(cmds, instant = false) {
  (cmds || []).forEach(cmd => {
    const [name, pose, o = {}] = cmd;
    if (o.delay && !instant) { const tk = token; setTimeout(() => tk === token && apply([[name, pose, { ...o, delay: 0 }]]), o.delay); return; }
    if (name === '@env') { setEnv(pose, instant); return; }
    const a = actors[name], p = props[name];
    if (a) {
      if (pose) { a.set(pose); a.talkTo = o.to ? actors[o.to] : null; }
      if ('board' in o) (o.board ? props[o.board].deck : stageGroup).add(a.p.root);
      if (o.x !== undefined || o.z !== undefined) a.moveTo(o.x ?? a.goal.x, o.z ?? a.goal.y);
      if ('board' in o) a.pos.copy(a.goal); // 타고 내릴 때는 그 자리로 바로 (좌표 기준이 바뀌므로 걸어가지 않는다)
      if (o.look !== undefined) a.look(o.look);
      if (o.show !== undefined) a.showT = o.show;
      if (o.y !== undefined) a.yT = o.y;
      if ('item' in o) a.item = o.item;
      if (instant) { a.pos.copy(a.goal); a.face = a.faceT; a.show = a.showT; a.y = a.yT; }
    } else if (p) {
      p.set(pose);
      if (o.show !== undefined) p.showT = o.show;
      // geo: 실제 위경도 지점으로 (움직이는 소품이면 그곳을 향해 가고, instant면 그 자리에 둔다)
      if (o.geo) { p.geoGoal = o.geo; p.snap = instant; }
      if (o.x !== undefined || o.z !== undefined) { p.geoGoal = null; p.goal.set(o.x ?? p.goal.x, o.z ?? p.goal.y); }
      if (o.y !== undefined) p.y = o.y; // 높이 (내려오는 비둘기 등 — 소품이 스스로 그 높이로 옮겨 간다)
      if (instant) { p.show = p.showT; p.obj.position.x = p.goal.x; p.obj.position.z = p.goal.y; if (o.y !== undefined) p.obj.position.y = o.y; }
    }
  });
}
function setScene(ev) {
  curEv = ev;
  clearCast();
  script = SCRIPTS[ev.id] || null;
  mode = script ? 'scene' : 'off';
  document.body.classList.toggle('stage-on', !!script);
  if (!script) { canvas.style.opacity = 0; map.style.filter = ''; window.stageFoot = null; return; }
  stageGroup.scale.setScalar(script.scale || 1);
  size = { w: 0, h: 0 }; // 넓은 무대(wide)가 바뀌었을 수 있으니 다시 잰다
  Object.entries(script.props || {}).forEach(([name, [kind, x, z, o]]) => {
    const p = makeProp(kind, x, z, o);
    props[name] = p; stageGroup.add(p.obj);
  });
  Object.entries(script.cast).forEach(([name, [type, x, z, face, o = {}]]) => {
    const a = new Actor(type, x, z, face, { solemn: script.solemn, ...o });
    actors[name] = a;
    (o.board ? props[o.board].deck : stageGroup).add(a.p.root);
    a.show = 0; a.showT = 1;
  });
  setEnv(script.env || 'day', true);
  apply(script.beats.enter, true);
  Object.values(actors).forEach(a => { a.show = 0; a.settle(); }); // 처음부터 정해진 자세로 놓고 서서히 나타난다
  // 연출 확인용: ?beat=p1.3 이면 그 순간까지의 동작을 즉시 적용한다
  const until = new URLSearchParams(location.search).get('beat');
  if (until) {
    const keys = until === 'enter' ? [] : Object.keys(script.beats).filter(k => k !== 'enter');
    for (const k of keys) { apply(script.beats[k], true); gaze(); if (k === until) break; }
    Object.values(actors).forEach(a => { a.show = a.showT; for (let i = 0; i < 80; i++) a.update(i * 0.05, 0.05); });
    updateEnvInstant();
  }
}
function updateEnvInstant() { for (let i = 0; i < 200; i++) updateEnv(0.05); }
function beat(key) {
  if (!script || mode !== 'scene') return;
  if (key === 'intro') {
    token++; // 예약된 동작 취소
    apply(script.beats.intro || script.beats.enter, true);
    Object.values(actors).forEach(a => { if (a.showT) a.show = 0.0001; a.settle(); });
    return;
  }
  apply(script.beats[key]);
  gaze();
}
// 누군가 말하면(speak) 다른 이들은 말하는 이를 보고, 말하는 이는 to로 정한 상대나 가장 가까운 사람을 본다
function gaze() {
  const all = Object.values(actors), speaker = all.find(a => a.pose === 'speak' && a.showT > 0);
  if (!speaker) return;
  const others = all.filter(a => a !== speaker && a.showT > 0 && !a.noGaze && a.p.root.parent === speaker.p.root.parent);
  others.forEach(a => { a.target = speaker; });
  speaker.target = (speaker.talkTo?.showT > 0 && speaker.talkTo) || others.sort((a, b) => a.goal.distanceTo(speaker.goal) - b.goal.distanceTo(speaker.goal))[0] || null;
}

/* ---------- 화면 배치: 장소 핀에 무대 바닥을 맞춘다 ---------- */
const canvas = renderer && renderer.domElement;
let size = { w: 0, h: 0 }, groundPx = { x: 0, y: 0 };
if (canvas) {
  canvas.className = 'stage3d';
  canvas.setAttribute('aria-hidden', 'true');
  map.after(canvas);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  document.body.classList.add('has-stage');
}
function resize() {
  const tv = window.terrainOn && window.terrainView;
  // 3D 지형에서 당겨 보면 인물도 커지므로 그만큼 화면(캔버스)도 넓힌다
  const mobile = innerWidth <= 900, wide = (script?.wide || 1) * (tv ? Math.max(1, tv.zoom) : 1);
  const w = Math.round((mobile ? 230 : 300) * wide), h = Math.round((mobile ? 200 : 270) * wide);
  if (w === size.w && h === size.h) return;
  size = { w, h };
  // 작은 인물의 윤곽이 매끈하도록 화면 해상도의 2배로 그려 줄여 보인다(슈퍼샘플링)
  renderer.setPixelRatio(Math.min(devicePixelRatio * 2, 3));
  renderer.setSize(w, h, false);
  canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
  // 3D 지형 모드가 무대 밑의 집·나무를 치울 넓이 (무대 바닥이 차지하는 화면 반지름)
  window.stageFoot = { rpx: w * 0.36, at: script?.at || null };
  // 넓은 무대는 화면을 키우는 만큼 시야각도 넓혀 인물 크기는 그대로 둔다
  camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(wide * Math.tan(THREE.MathUtils.degToRad(FOV / 2))));
  camera.aspect = w / h; camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  const v = new THREE.Vector3(0, 0, 0).project(camera);
  groundPx = { x: (v.x + 1) / 2 * w, y: (1 - v.y) / 2 * h };
}
// 무대를 화면 가운데에 두려고 app.js가 묻는다: 장면 무대 캔버스의 가운데가 장소 핀(무대 바닥 중심)에서
// 화면 몇 px 떨어져 있는지. 무대 바닥을 다른 위경도로 옮긴 장면(at)이면 그 지점도 알려 준다
window.stageFrame = ev => {
  const s = ev && SCRIPTS[ev.id];
  if (!s || !canvas) return null;
  const mobile = innerWidth <= 900, wide = s.wide || 1;
  const w = Math.round((mobile ? 230 : 300) * wide), h = Math.round((mobile ? 200 : 270) * wide);
  const cam = camera.clone();
  cam.fov = THREE.MathUtils.radToDeg(2 * Math.atan(wide * Math.tan(THREE.MathUtils.degToRad(FOV / 2))));
  cam.aspect = w / h; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  const v = new THREE.Vector3(0, 0, 0).project(cam);
  return { dx: w / 2 - (v.x + 1) / 2 * w, dy: h / 2 - (1 - v.y) / 2 * h, at: s.at || null };
};
function anchor() {
  // 3D 지형 모드: 지형 위에 투영한 장소(또는 at 지점)에 무대를 붙인다 (terrain.js가 geoToClient를 바꿔 끼운다)
  if (window.terrainOn && curEv) {
    const ll = script?.at || [PLACES[curEv.place].lat, PLACES[curEv.place].lng], c = window.geoToClient(...ll), w = wrap.getBoundingClientRect();
    return { x: c.x - w.left, y: c.y - w.top };
  }
  // 무대 바닥을 실제 지점(at)으로 옮긴 장면은 캔버스도 그 지점에 붙인다 — 핀에 붙여 두면 옮겨 간 인물·집이 캔버스 가장자리에서 잘렸다
  if (script?.at && window.geoToClient) {
    const c = window.geoToClient(...script.at), w = wrap.getBoundingClientRect();
    if (!map.querySelector(`.pin[data-place="${curEv.place}"] .dot`)?.getBoundingClientRect().width) return null;
    return { x: c.x - w.left, y: c.y - w.top };
  }
  const el = curEv && map.querySelector(`.pin[data-place="${curEv.place}"] .dot`);
  if (!el) return null;
  const r = el.getBoundingClientRect(), w = wrap.getBoundingClientRect();
  if (!r.width && !r.height) return null;
  return { x: r.left + r.width / 2 - w.left, y: r.top + r.height / 2 - w.top };
}

/* ---------- 실제 지점에 세우기: 위경도 → 지도 화면 위치 → 무대 바닥(y=0)의 좌표 ---------- */
const ray = new THREE.Raycaster(), floor = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit = new THREE.Vector3();
function geoToWorld([lat, lng]) {
  if (!window.geoToClient) return null;
  const c = window.geoToClient(lat, lng), r = canvas.getBoundingClientRect();
  ray.setFromCamera(new THREE.Vector2((c.x - r.left) / r.width * 2 - 1, -((c.y - r.top) / r.height * 2 - 1)), camera);
  return ray.ray.intersectPlane(floor, hit) ? hit : null;
}
function geoToStage(ll) {
  const w = geoToWorld(ll); if (!w) return null;
  const s = stageGroup.scale.x;
  return new THREE.Vector2((w.x - stageGroup.position.x) / s, (w.z - stageGroup.position.z) / s);
}
function placeGeo() {
  // 무대 바닥의 중심(at): 핀이 물가에 있어 핀 앞이 물인 곳(가버나움)에서, 뭍의 실제 지점으로 무대를 옮긴다 — anchor()가 캔버스째 옮긴다
  // (캔버스를 그 지점에 붙이므로 무대 바닥은 언제나 원점)
  stageGroup.position.set(0, 0, 0);
  Object.values(props).forEach(p => {
    if (p.geo) { // 고정: 매 프레임 그 자리로
      const g = geoToStage(p.geo); if (!g) return;
      p.goal.copy(g); p.obj.position.x = g.x; p.obj.position.z = g.y;
    }
    if (p.geoGoal) { // 이동 목표
      const g = geoToStage(p.geoGoal); if (!g) return;
      p.goal.copy(g);
      if (p.snap) { p.obj.position.x = g.x; p.obj.position.z = g.y; p.snap = false; }
    }
    if (p.faceCenter) p.obj.rotation.y = Math.atan2(-p.obj.position.x, -p.obj.position.z);
  });
}

/* ---------- 3D 지형을 따라 돌고 커지기 ----------
   지형 모드(terrain.js)가 알려 주는 시점(방위·기울기·당긴 정도)에 무대 카메라를 맞춘다.
   기울기는 지형의 처음 기울기(0.62)에서 달라진 만큼만 더해, 평소 무대의 낮은 시선을 지킨다 */
const CAM0 = { d: Math.hypot(2.05, 8.7), pitch: Math.atan2(2.05, 8.7) };
function followTerrain() {
  const tv = window.terrainOn && window.terrainView;
  const yaw = tv ? tv.yaw : 0, pitch = THREE.MathUtils.clamp(CAM0.pitch + (tv ? tv.pitch - 0.62 : 0), 0.05, 1.3);
  camera.position.set(Math.sin(yaw) * Math.cos(pitch) * CAM0.d, 0.5 + Math.sin(pitch) * CAM0.d, Math.cos(yaw) * Math.cos(pitch) * CAM0.d);
  camera.lookAt(0, 0.5, 0);
  const z = tv ? tv.zoom : 1;
  scene.scale.setScalar(z);
  camera.updateMatrixWorld();
  // 무대 바닥 원점이 화면 어디에 오는지 다시 잰다 (돌리면 바뀐다)
  const v = new THREE.Vector3(0, 0, 0).project(camera);
  groundPx = { x: (v.x + 1) / 2 * size.w, y: (1 - v.y) / 2 * size.h };
}

/* ---------- 루프 ---------- */
const clock = new THREE.Clock();
function loop() {
  requestAnimationFrame(loop);
  if (!window.terrainDrives) frame(); // 3D 지형 모드에서는 terrain.js가 카메라를 옮긴 직후에 부른다 — 따로 돌면 무대가 한 박자 늦게 따라와 핀에서 벗어나 보였다
}
window.stageFrame = frame;
function frame() {
  if (!canvas || mode === 'off' || document.hidden || wrap.offsetParent === null) return;
  const dt = Math.min(clock.getDelta(), 0.05), time = clock.elapsedTime;
  resize();
  const a = anchor();
  if (!a) { canvas.style.opacity = 0; return; }
  followTerrain();
  canvas.style.opacity = 1;
  canvas.style.transform = `translate(${Math.round(a.x - groundPx.x)}px, ${Math.round(a.y - groundPx.y)}px)`;
  updateEnv(dt);
  placeGeo();
  Object.values(props).forEach(p => p.update(time, dt, envNow));
  // 지면 높이: 언덕 같은 소품 위에 선 사람은 그 표면에 올라선다 (배에 탄 사람, 높이를 직접 정한 사람은 제외)
  const grounds = Object.values(props).filter(p => p.heightAt);
  Object.values(actors).forEach(ac => {
    ac.ground = ac.fixedY || ac.p.root.parent !== stageGroup ? 0 : Math.max(0, ...grounds.map(p => p.heightAt(ac.pos.x, ac.pos.y)));
    ac.update(time, dt);
  });
  renderer.render(scene, camera);
}

/* ---------- app.js와 연결 ---------- */
if (canvas) {
  addEventListener('stage:scene', e => setScene(e.detail.ev));
  addEventListener('stage:walk', () => { mode = 'off'; canvas.style.opacity = 0; map.style.filter = ''; document.body.classList.remove('stage-on'); });
  addEventListener('stage:beat', e => {
    const { beat: b, s } = e.detail;
    if (!script) return;
    if (s !== undefined && script.beats[`${b}.${s}`]) beat(`${b}.${s}`);
    else if (!s) beat(b);
  });
  addEventListener('stage:stop', () => { if (!script) return; token++; setEnv(script.env || 'day'); apply(script.beats.enter); });
  loop();
  // app.js가 먼저 장면을 열었으면 따라잡는다
  if (window.__stageScene) { setScene(window.__stageScene); window.recenterStage?.(); } // 늦게 로드됐으면 무대 쪽으로 다시 맞춘다
}

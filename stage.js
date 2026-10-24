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
  // 밤의 남빛은 .atmos가 덮으므로 지도는 조금 덜 어둡게
  night:    { hemi: [0.7, '#a9bcff'], sun: [0.55, '#b8c8ff'], shadow: 0.18, map: 'brightness(.62) saturate(.6) hue-rotate(-12deg)' },
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
  wrap.dataset.env = name; // 지도 전체에 덮는 빛 (.atmos)
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
const pending = new Set(); // 늦게 걸어 둔 동작 (delay)
// 다음 문장이 시작되면 아직 남은 늦은 동작을 먼저 끝낸다 — 낭독이 빠르면 앞 문장의 동작이 다음 문장 도중에 끼어들어
// (e15: 무릎 꿇은 신하가 '가거라' 대목에서 뒤늦게 일어나 말했다) 새 문장의 자세를 덮어썼다
function cancelPending() { token++; pending.forEach(j => clearTimeout(j.id)); pending.clear(); }
function flushPending() {
  const jobs = [...pending].sort((a, b) => a.at - b.at);
  pending.clear();
  jobs.forEach(j => { clearTimeout(j.id); apply([j.cmd]); });
}
const stageGroup = new THREE.Group();
scene.add(stageGroup);

function clearCast() {
  cancelPending();
  Object.values(actors).forEach(a => a.p.root.removeFromParent());
  Object.values(props).forEach(p => p.lift.removeFromParent());
  actors = {}; props = {};
}
/* 동작 명령: [이름, 자세(또는 소품 상태), 옵션]
   이름이 '@env'면 분위기 전환. 옵션: x, z, y, look, show, item, board('배 이름' 또는 null), delay(ms), to(말을 건네는 상대) */
function apply(cmds, instant = false) {
  (cmds || []).forEach(cmd => {
    const [name, pose, o = {}] = cmd;
    if (o.delay && !instant) {
      const tk = token, job = { at: performance.now() + o.delay, cmd: [name, pose, { ...o, delay: 0 }] };
      job.id = setTimeout(() => { pending.delete(job); if (tk === token) apply([job.cmd]); }, o.delay);
      pending.add(job); return;
    }
    if (name === '@env') { setEnv(pose, instant); return; }
    if (name === '@at') { moveAt = pose ? { ll: pose, x: o.x || 0, z: o.z || 0 } : null; if (instant) atSnap = true; return; }
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
  moveAt = null; atSnap = true;
  script = SCRIPTS[ev.id] || null;
  mode = script ? 'scene' : 'off';
  document.body.classList.toggle('stage-on', !!script);
  if (!script) { canvas.style.opacity = 0; map.style.filter = ''; delete wrap.dataset.env; window.stageFoot = null; return; }
  stageGroup.scale.setScalar(script.scale || 1);
  size = { w: 0, h: 0 }; // 넓은 무대(wide)가 바뀌었을 수 있으니 다시 잰다
  Object.entries(script.props || {}).forEach(([name, [kind, x, z, o]]) => {
    const p = makeProp(kind, x, z, o);
    p.terrainHide = o?.terrain === false; // 3D 지형의 도성 모형에 이미 있는 건물 — 무대에 또 세우면 모형 위에 걸쳐 떠 보인다
    // lift: 3D 지형 안에서 소품을 그 자리의 땅 높이로 올리고 내리는 받침 (2D 무대에서는 늘 0)
    // 바닥 넓이(소품 자리에서 앞뒤좌우로 얼마나 퍼지나): 바닥이 평평한 건물을 비탈에 앉힐 때 쓴다
    p.obj.updateMatrixWorld(true); const fb = new THREE.Box3().setFromObject(p.obj);
    p.foot = [fb.min.x - p.obj.position.x, fb.max.x - p.obj.position.x, fb.min.z - p.obj.position.z, fb.max.z - p.obj.position.z];
    p.lift = new THREE.Group(); p.lift.add(p.obj); p.kind = kind;
    props[name] = p; stageGroup.add(p.lift);
  });
  Object.entries(script.cast).forEach(([name, [type, x, z, face, o = {}]]) => {
    const a = new Actor(type, x, z, face, { solemn: script.solemn, ...o });
    actors[name] = a;
    (o.board ? props[o.board].deck : stageGroup).add(a.p.root);
    a.show = 0; a.showT = 1;
  });
  // 사람을 비추는 빛(on: 배역 이름)은 그 사람을 따라다닌다 — 빛 아래 서 있다가 옮겨 가도 빛만 남지 않게
  Object.entries(script.props || {}).forEach(([name, [, , , o]]) => { if (o?.on) props[name].follow = actors[o.on]; });
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
    cancelPending(); // 예약된 동작 취소
    apply(script.beats.intro || script.beats.enter, true);
    Object.values(actors).forEach(a => { if (a.showT) a.show = 0.0001; a.settle(); });
    return;
  }
  flushPending();
  apply(script.beats[key]);
  gaze();
}
// 누군가 말하면(speak) 다른 이들은 말하는 이를 보고, 말하는 이는 to로 정한 상대나 가장 가까운 사람을 본다
function gaze() {
  const all = Object.values(actors), speaker = all.find(a => a.pose === 'speak' && a.showT > 0);
  if (!speaker) return;
  const others = all.filter(a => a !== speaker && a.showT > 0 && !a.noGaze && a.p.root.parent === speaker.p.root.parent);
  others.forEach(a => { a.target = speaker; });
  // 몸을 돌린 쪽(look)에 있는 사람 가운데 가장 가까운 이 — 곁에 선 제자보다 앞에서 무릎 꿇은 사람에게 말씀하시게
  const near = (a, b) => a.goal.distanceTo(speaker.goal) - b.goal.distanceTo(speaker.goal);
  const facing = others.filter(a => { const ang = Math.atan2(a.goal.x - speaker.goal.x, a.goal.y - speaker.goal.y); return Math.abs(Math.atan2(Math.sin(ang - speaker.faceT), Math.cos(ang - speaker.faceT))) < 1.0; });
  speaker.target = (speaker.talkTo?.showT > 0 && speaker.talkTo) || facing.sort(near)[0] || others.sort(near)[0] || null;
}

/* ---------- 화면 배치: 장소 핀에 무대 바닥을 맞춘다 ---------- */
const canvas = renderer && renderer.domElement;
let size = { w: 0, h: 0 }, groundPx = { x: 0, y: 0 };
if (canvas) {
  canvas.className = 'stage3d';
  canvas.setAttribute('aria-hidden', 'true');
  map.after(canvas);
  // 장면 분위기의 빛: 밤의 남빛과 별, 서쪽 노을, 동쪽 새벽빛, 폭풍의 구름 그림자를 지도 전체에 덮는다 (style.css의 .atmos).
  // 지형(2D·3D) 위, 무대 인물 아래에 깔린다. 층마다 따로 서서히 나타나 분위기가 바뀔 때 겹쳐 바뀐다
  const atmos = document.createElement('div');
  atmos.className = 'atmos'; atmos.setAttribute('aria-hidden', 'true');
  atmos.innerHTML = ['vig', 'cool', 'moon', 'stars', 'warm', 'dawn', 'glory', 'cloud', 'flash'].map(k => `<i class="a-${k}"></i>`).join('');
  canvas.before(atmos);
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
  // 작은 인물의 윤곽이 매끈하도록 화면 해상도의 2배로 그려 줄여 보인다(슈퍼샘플링). 3D 지형에서 당겨 무대가 커지면
  // 인물도 커서 덜 필요하므로 그만큼 낮춘다 — 큰 캔버스를 3배로 그리면 휴대폰이 버거웠다
  renderer.setPixelRatio(Math.max(devicePixelRatio, Math.min(devicePixelRatio * 2, 3) / Math.max(1, wide / 1.5)));
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
  if (inTerrain) { const [x, z] = px(ll); return new THREE.Vector2((x - base.x) / base.k, (z - base.z) / base.k); } // 지형 안: 지도 좌표에서 바로
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

/* ---------- 3D 지형 안에 세우기 ----------
   지형 모드에서는 무대를 따로 그린 그림으로 겹치지 않고, 지형 장면(terrain.js) 안의 장소 지점에 붙여 같은 카메라·깊이로 그린다 —
   따로 그리면 확대할 때 지도와 다른 비율로 커지고 줄어 소품이 성벽·도성 위로 올라가고, 평평한 바닥이 땅 위에 떠 보였다.
   소품과 자리는 확대와 상관없는 고정 축척(무대 1단위 = 지도 k단위)으로 세우고, 소품마다 그 자리의 땅 높이에 앉힌다.
   k는 장면에 내려앉는 거리에서 예전 무대와 같은 크기로 보이게 정한다. 사람만 물러날수록 조금씩 키워(최대 2배) 멀리서도 알아보게 한다 */
const holder = new THREE.Group();
let inTerrain = false;
const base = { x: 0, z: 0, y: 0, k: 1 }; // 무대 바닥 중심의 지도 좌표·높이, 지도 단위/무대(stageGroup) 단위
// 예전 무대(따로 그린 캔버스)에서 무대 1단위가 지도 몇 단위로 보였나: 무대 화면의 단위당 px ÷ 지형 화면의 지도 단위당 px
function oldUnit(T, dist, zoom) {
  const pxPer = (innerWidth <= 900 ? 200 : 270) / (2 * CAM0.d * Math.tan(THREE.MathUtils.degToRad(FOV / 2))) * zoom;
  return pxPer * 2 * dist * Math.tan(THREE.MathUtils.degToRad(T.camera.fov / 2)) / (wrap.clientHeight || 1);
}
function enterTerrain(T) {
  inTerrain = true;
  T.scene.add(holder); holder.add(stageGroup);
  canvas.style.opacity = 0;
}
function leaveTerrain() {
  inTerrain = false;
  scene.add(stageGroup); holder.removeFromParent();
  stageGroup.traverse(o => { if (o.isPointLight && o.userData.d0 !== undefined) { o.distance = o.userData.d0; o.intensity = o.userData.raw; delete o.userData.d0; delete o.userData.raw; } });
  Object.values(props).forEach(p => { p.lift.position.set(0, 0, 0); if (p.fade !== 'scale') p.obj.scale.copy(p.base); });
  Object.values(actors).forEach(a => { a.big = 1; });
}
// 지형 위 (무대 좌표) 지점의 땅 높이 — 무대 바닥 중심과의 차이를 무대 단위로
// 등잔·불빛: 빛이 닿는 거리는 묶음의 크기를 따라 커지지 않으므로 직접 늘리고, 멀어진 만큼 세기도 올린다.
// 소품이 매 프레임 세기를 정하므로(깜박임·켜짐) 그 뒤에 곱하고, 다음 프레임 전에는 소품이 정한 값으로 되돌려 둔다
function unscaleLights() { stageGroup.traverse(o => { if (o.isPointLight && o.userData.raw !== undefined) o.intensity = o.userData.raw; }); }
function scaleLights() {
  stageGroup.traverse(o => {
    if (!o.isPointLight) return;
    if (o.userData.d0 === undefined) o.userData.d0 = o.distance;
    o.userData.raw = o.intensity; o.distance = o.userData.d0 * base.k; o.intensity = o.userData.raw * base.k ** o.decay;
  });
}
const skyC = new THREE.Color(), toneH = new THREE.Color(), toneS = new THREE.Color(), WHITE = new THREE.Color('#fff4e4');
const groundAt = (x, z) => inTerrain ? (window.terrain3d.heightAt(base.x + x * base.k, base.z + z * base.k) - base.y) / base.k : 0;
let bigNow = 1;
// 땅에 붙은 소품: 지형과 같은 고정 축척에 둔다. 나머지(사람 곁의 십자가·배·짐승·상·바구니…)는 사람과 함께 커진다
// 바닥이 평평한 건물: 가운데 땅 높이에 앉히면 비탈 위쪽이 땅에 묻힌다(골짜기 바닥의 실로암 못) — 바닥 네 귀퉁이 가운데 가장 높은 땅에 앉힌다
const FLAT = new Set(['pool', 'house', 'well', 'synagogue', 'temple', 'gate', 'walls', 'cliffshrine']);
const FIXED = new Set(['water', 'grass', 'hill', 'tomb', 'temple', 'house', 'rocks', 'figtree', 'synagogue', 'well', 'pool', 'flowers', 'gate', 'field', 'cliffshrine', 'palm', 'walls', 'olive', 'star', 'host', 'rain']);
// '@at' 명령: 3D 지형에서만 무대 바닥을 다른 실제 지점으로 옮긴다 — 무대 (x, z) 자리가 그 위경도에 오도록.
// 나사렛 회당에서 낭떠러지로 끌고 가는 대목처럼, 이야기가 근처의 실제 지형으로 옮겨 갈 때. 2D 무대는 그대로 둔다
let moveAt = null, atSnap = true;
const center = { x: 0, z: 0 }, home = { x: 0, z: 0 };
function placeTerrain(T, dt) {
  const ll = script.at || [PLACES[curEv.place].lat, PLACES[curEv.place].lng], d0 = T.sceneDist(curEv);
  const s = stageGroup.scale.x, k = oldUnit(T, d0, T.zoomAt(d0, curEv.place));
  [home.x, home.z] = px(ll);
  let [x, z] = [home.x, home.z];
  if (moveAt) { const [mx, mz] = px(moveAt.ll); x = mx - moveAt.x * k * s; z = mz - moveAt.z * k * s; }
  if (atSnap) { center.x = x; center.z = z; atSnap = false; } // 장면을 열 때나 즉시 적용할 때는 바로, 낭독 중에는 무리가 걸어가는 동안 천천히
  else { center.x = damp(center.x, x, 0.7, dt); center.z = damp(center.z, z, 0.7, dt); }
  ({ x, z } = center);
  holder.position.set(x, T.heightAt(x, z) + 0.08, z); holder.scale.setScalar(k);
  Object.assign(base, { x, z, y: holder.position.y, k: k * s });
  bigNow = THREE.MathUtils.clamp(oldUnit(T, T.cam.dist, window.terrainView?.zoom ?? 1) / k, 1, 2);
  // 무대 밑 집·나무를 치울 넓이 (지도 단위)
  window.stageFoot = { r: k * 1.9 * (script.wide || 1), at: script.at || null, xz: [x, z] };
  // 장면 분위기(밤·폭풍·새벽)는 지형 화면에 색조(CSS 필터)를 거는 대신 지형의 해·하늘빛으로 넘긴다 —
  // 필터는 사람까지 함께 어둡게 해 밤 장면의 무대가 묻혔다. 따로 그릴 때처럼 사람과 땅이 같은 달빛을 받고, 등잔이 빛난다
  // 넓은 땅 전체가 받으므로 따로 그릴 때보다 누그러뜨린다: 빛깔은 반만, 어두운 정도는 6~7할만 (해 질 녘 땅이 온통 주황, 밤 무대가 묻힘)
  const hk = 0.4 + 0.6 * envNow.hemi / ENV.day.hemi[0], sk = 0.3 + 0.7 * envNow.sun / ENV.day.sun[0];
  window.stageTone = { hemi: hk, sun: sk, hemiC: toneH.copy(hemi.color).lerp(WHITE, 0.5), sunC: toneS.copy(sun.color).lerp(WHITE, 0.5),
    skyC: skyC.copy(hemi.color).lerp(WHITE, 0.3).multiplyScalar(Math.min(1, hk * 1.05)) };
}

/* ---------- 루프 ---------- */
const clock = new THREE.Clock();
function loop() {
  requestAnimationFrame(loop);
  if (!window.terrainDrives) frame(); // 3D 지형 모드에서는 terrain.js가 카메라를 옮긴 직후에 부른다 — 따로 돌면 무대가 한 박자 늦게 따라와 핀에서 벗어나 보였다
}
window.stageRender = frame; // 3D 지형 루프가 부른다 (stageFrame은 app.js가 쓰는 무대 위치 계산 — 이름이 겹쳐 덮어쓰던 것을 나눔)
function frame() {
  if (!canvas) return;
  const T = window.terrainDrives && window.terrain3d;
  if (!!T !== inTerrain) T ? enterTerrain(T) : leaveTerrain();
  holder.visible = mode !== 'off' && !!curEv;
  if (!T || mode === 'off') window.stageTone = null;
  if (mode === 'off' || document.hidden || wrap.offsetParent === null) return;
  const dt = Math.min(clock.getDelta(), 0.05), time = clock.elapsedTime;
  if (T) {
    canvas.style.opacity = 0;
    placeTerrain(T, dt);
  } else {
    resize();
    const a = anchor();
    if (!a) { canvas.style.opacity = 0; return; }
    followTerrain();
    canvas.style.opacity = 1;
    canvas.style.transform = `translate(${Math.round(a.x - groundPx.x)}px, ${Math.round(a.y - groundPx.y)}px)`;
  }
  updateEnv(dt);
  if (inTerrain) unscaleLights();
  placeGeo();
  Object.values(props).forEach(p => {
    if (p.follow) { p.goal.copy(p.follow.pos); p.obj.position.x = p.follow.pos.x; p.obj.position.z = p.follow.pos.y; }
    p.update(time, dt, envNow);
    if (p.terrainHide && inTerrain) p.obj.visible = false;
    if (inTerrain) {
      // 땅에 붙은 소품은 무대를 옮겨도(@at) 제자리에 남는다
      const stay = FIXED.has(p.kind);
      p.lift.position.x = stay ? (home.x - base.x) / base.k : 0; p.lift.position.z = stay ? (home.z - base.z) / base.k : 0;
      const ox = p.obj.position.x + p.lift.position.x, oz = p.obj.position.z + p.lift.position.z, f = p.foot;
      p.lift.position.y = FLAT.has(p.kind) ? Math.max(groundAt(ox, oz), groundAt(ox + f[0], oz + f[2]), groundAt(ox + f[1], oz + f[2]), groundAt(ox + f[0], oz + f[3]), groundAt(ox + f[1], oz + f[3]))
        : groundAt(ox, oz);
      if (!FIXED.has(p.kind)) { // 사람과 함께 키운다: 크기는 제자리에서, 높이(십자가가 선 언덕 위, 나는 비둘기)는 바닥에서부터
        if (p.fade === 'scale') p.obj.scale.multiplyScalar(bigNow); else p.obj.scale.copy(p.base).multiplyScalar(bigNow);
        p.lift.position.y += p.obj.position.y * (bigNow - 1);
      }
    }
  });
  // 지면 높이: 언덕 같은 소품 위에 선 사람은 그 표면에 올라선다 (배에 탄 사람, 높이를 직접 정한 사람은 제외)
  // 3D 지형 안에서는 그 자리의 땅 높이를 따른다. 높이를 정한 사람(십자가 위)은 땅만 따르고, 사람만 키우는 배율도 받지 않는다(십자가와 어긋나지 않게)
  const grounds = Object.values(props).filter(p => p.heightAt);
  Object.values(actors).forEach(ac => {
    const onDeck = ac.p.root.parent !== stageGroup, g0 = onDeck ? 0 : groundAt(ac.pos.x, ac.pos.y);
    ac.ground = ac.fixedY || onDeck ? g0 + (ac.fixedY && inTerrain ? ac.y * (bigNow - 1) : 0) : Math.max(g0, ...grounds.map(p => { const h = p.heightAt(ac.pos.x, ac.pos.y); return h > 0 ? p.lift.position.y + h : -Infinity; }));
    ac.big = inTerrain && !onDeck ? bigNow : 1; // 배·나귀에 탄 사람은 그 소품과 함께 커진다
    ac.update(time, dt);
  });
  if (inTerrain) scaleLights();
  if (!T) renderer.render(scene, camera);
}

/* ---------- app.js와 연결 ---------- */
if (canvas) {
  addEventListener('stage:scene', e => setScene(e.detail.ev));
  addEventListener('stage:walk', () => { mode = 'off'; canvas.style.opacity = 0; map.style.filter = ''; delete wrap.dataset.env; document.body.classList.remove('stage-on'); });
  addEventListener('stage:beat', e => {
    const { beat: b, s } = e.detail;
    if (!script) return;
    if (s !== undefined && script.beats[`${b}.${s}`]) beat(`${b}.${s}`);
    else if (!s) beat(b);
  });
  addEventListener('stage:stop', () => { if (!script) return; cancelPending(); setEnv(script.env || 'day'); apply(script.beats.enter); });
  loop();
  // app.js가 먼저 장면을 열었으면 따라잡는다
  if (window.__stageScene) { setScene(window.__stageScene); window.recenterStage?.(); } // 늦게 로드됐으면 무대 쪽으로 다시 맞춘다
}

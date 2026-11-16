/* 그 길 — 3D 무대. 장소 핀 위에 장면의 인물을 세우고, 낭독에 맞춰 연기시킨다.
   app.js가 보내는 이벤트: stage:scene {i, ev}, stage:walk {i, ev}, stage:beat {beat, s}, stage:stop */
import { THREE, damp } from './stage/kit.js';
import { Actor, TYPES } from './stage/people.js';
import { StageModel, seatBlocks } from './stage/model-actor.js';
import { push, personBox, propBoxes, SOLID, box } from './stage/collide.js';
import { model, tinted, plain, restyle } from './game-model.js';
import { makeProp, setCrowd } from './stage/props.js';
import { SCRIPTS } from './stage/scenes.js';
import { createStreet } from './stage/street/view.js';

const wrap = document.querySelector('.mapwrap');
const placeOf = ev => window.stagePlaceOf?.(ev) || ev.place; // 무대를 붙일 장소 (장면 안에서 옮겨 가는 장면은 지금 있는 곳 — app.js의 here)
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
  if (street.on) street.sky(name, instant);
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
  if (street.on) street.sunStep(dt);
}

/* ---------- 거리 무대 (잠언): 사람 눈높이의 실제 크기 세트 — stage/street/view.js ---------- */
const street = createStreet({ scene, sun, camera, renderer, wrap, ground, occluder, getCanvas: () => canvas, onLeave: () => { size = { w: 0, h: 0 }; } });

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

// 3D 모델로 바꿔 세우는 사람 (사용자 2026-11: 인형을 3D 모델로 — 모델이 그리기는 더 가볍다. 삼각형 9천 개·한 번에 그림, 인형은 2만7천 개·수십 번).
// 이름 있는 사람은 그 사람의 모델, 이름 없는 남녀는 순례자 모델에 인형의 옷 색을 입힌다. 소년은 소년 다윗 모델, 소녀는 소녀 모델, 헤롯·동방박사·경비병 등은 비슷한 구약 인물 모델(LIKE), 천사는 천사 모델,·실루엣·빛의 형상은 인형 그대로.
// 모델은 장면에 필요한 것만 그때 받고(R2, 한 번 받으면 남는다), 다 받기 전이면 인형으로 섰다가 낭독 전이면 바꿔 세운다
const OWN = { jesus: 'jesus', risen: 'jesus', peter: 'peter', john: 'john', mary: 'mary', joseph: 'joseph', baptist: 'baptist', pharisee: 'pharisee',
  thomas: 'thomas', martha: 'martha', judas: 'judas', lazarus: 'lazarus', samaritan: 'samaritan', centurion: 'centurion', zacchaeus: 'zacchaeus',
  pilate: 'pilate', shepherd: 'shepherd', soldier: 'soldier', highpriest: 'caiaphas', elder: 'nicodemus', woman: 'woman',
  moses: 'moses', elijah: 'elijah', angel: 'angel', whiteman: 'angel',
  paul: 'paul', paulS: 'paul', paulO: 'paul', paulOS: 'paul', barnabas: 'barnabas', silas: 'silas', timothy: 'timothy', lydia: 'lydia', luke: 'luke' }; // 바울 여정 (바울은 시기별 배역 모두 같은 모델) // 천사(가브리엘·목자들에게 나타난 천사·무덤의 흰 옷 입은 이)
const MEN = new Set(['man', 'servant', 'traveler', 'healed', 'beggar', 'prodigal', 'levi', 'steward', 'groom', 'rich']);
const WOMEN = new Set(['woman2', 'mother', 'anna', 'phoenician']);
const BOYS = new Set(['child', 'boyJesus']);
// 모델이 따로 없는 배역은 비슷한 사람의 모델에 옷을 맞춰 입힌다 (사용자 2026-11: 다 만들 수는 없으니 있는 것에서) — 'plain'은 화려한 색을 바래게
// 옷은 restyle로 색상을 돌리고 살갗 밝기도 달리 — 구약 여정의 그 사람과 같아 보이지 않게(사용자 2026-11)
const LIKE = { official: ['nicodemus', { hue: 200, sat: 1.3 }], // 왕의 신하(요 4:46) — 엑스트라가 뽑히니 신하 같지 않았다
  king: ['rehoboam', { hue: 150, skin: 1.05 }], magus: ['jethro', { hue: 200, sat: 1.4, skin: 0.8 }], magus2: ['nathan', { hue: 90, sat: 1.5, skin: 1.1 }], magus3: ['absalom', { hue: 250, skin: 0.62 }], // 헤롯은 오만한 왕, 동방박사는 사막 족장·현자·젊은 귀공자(먼 나라 사람이라 살갗도 저마다)
  official: ['jeroboam', { plain: true, skin: 0.9 }], youth: ['jonathan', { plain: true, hue: 40, skin: 1.08 }], guard: ['joab', { hue: 30, sat: 0.6, skin: 0.95 }], // 왕의 신하, 나인 성 과부의 아들, 성전 경비병
  wild: ['pilgrim-man', { plain: true, skin: 0.72 }], sadducee: ['nicodemus', { hue: 160, skin: 1.08 }] }; // 거라사의 귀신 들린 사람(해진 옷, 햇볕에 그을림), 사두개인(바리새인 니고데모와 달리)
const DISCIPLES = ['andrew', 'james']; // 이름 없는 제자는 안드레·야고보 모델을 번갈아
// 엑스트라(이름 없는 남녀·군중): 여러 사람을 섞는다 (사용자 2026-11: 순례자로만 하지 말고, 다른 시대 사람도 — 왕은 빼고, 수수하게 입은 사람을
// 평범한 색 옷으로). [모델, 옷] — 옷이 'plain'이면 화려한 색을 바래게, 색이면 그 색으로 (순례자만), 없으면 그대로
// 엑스트라(군중·이름 없는 사람)는 몇 안 되는 모델을 옷 색만 바꿔 쓴다 — 모델마다 1MB라 장면마다 열 몇 개를 받느라 느린 곳에서는
// 한참 동안 인형으로 서 있었다(사용자 2026-11). 남자 넷·여자 둘
const EXTRA = {
  men: [['pilgrim-man'], ['fisherman'], ['shepherd'], ['jethro', { plain: true, skin: 0.85 }], ['pilgrim-man', '#7d4a3a'], ['fisherman', { hue: 40, skin: 1.08 }],
    ['shepherd', { plain: true, skin: 0.8 }], ['pilgrim-man', '#5d6b4a'], ['jethro', { hue: 200, skin: 1.05 }], ['fisherman', { plain: true, skin: 0.9 }], ['shepherd', { hue: 30, skin: 1.1 }]],
  women: [['pilgrim-woman'], ['woman'], ['pilgrim-woman', '#3c5d96'], ['woman', { hue: 120, skin: 0.85 }], ['pilgrim-woman', '#a3554a'], ['woman', { plain: true, skin: 1.05 }], ['pilgrim-woman', '#6b4a6e']],
};
// 엑스트라 모델은 무대가 뜰 때 미리 받아 둔다 — 장면마다 그때 받으니 군중이 잠깐 예전 인형으로 섰다가 바뀌었다
// (예전엔 엑스트라를 페이지가 뜨자마자 다 받았다 — 장면의 배역보다 먼저 줄을 서서 배역이 늦게 왔다. 이제 장면이 배역 다음에 받는다)
// 동작을 빌려 줄 모델: 잠자기는 남자 순례자, 무릎 꿇고 기도는 예수님 모델에서 (같은 Mixamo 뼈대)
// 동작은 예전 예수님 모델(jesus-moves — 무릎 꿇기·서기·말하기·잠자기가 든 것)에서 — 새 예수님 모델(2026-11)은 걷기만 떠 왔다
const BORROW = () => ({ sleep: ready['pilgrim-man'], pray: ready['jesus-moves'], idle: ready['jesus-moves'], talk: ready['jesus-moves'] }); // 천사 모델은 걷기만 있어 서기·말하기도
// 바울 여정의 나머지 배역 (사용자 2026-11: 바울 여정도 모두 모델로) — 비슷한 사람의 모델에 옷 색(hue)·살갗(skin)을 달리 입힌다.
// 로마 관리(토가)는 빌라도, 병사는 병정, 왕과 왕비는 구약의 왕·왕비, 수염 없는 젊은이는 디모데, 사울(회심 전)은 바울 모델 그대로
Object.assign(LIKE, {
  sauly: ['paul'], saulB: ['paul'],
  stephen: ['jonathan', { white: true, skin: 1.05 }], councilor: ['nicodemus', { hue: 230 }], witness: ['pilgrim-man', { plain: true, skin: 0.9 }],
  hellenist: ['isaiah', { hue: 20, skin: 1.02 }], templeguard: ['joab', { hue: 200, sat: 0.7 }], ananias: ['samuel', { hue: 30, skin: 0.95 }],
  judasD: ['jethro', { plain: true, skin: 0.9 }], townsman: ['pilgrim-man', '#9a7a5a'], jewD: ['elisha', { hue: 180, skin: 1.05 }],
  nabatean: ['joab', { hue: 330, skin: 0.72 }], jamesL: ['nathan', { hue: 60, skin: 1.05 }], lucius: ['ahijah', { hue: 160, skin: 0.7 }],
  greek: ['timothy', { hue: 190 }], greek2: ['silas', { hue: 300, skin: 1.08 }], greekW: ['rahab', { hue: 20 }],
  agabus: ['elijah', { plain: true }], simeon: ['barnabas', { hue: 90, skin: 0.62 }], manaen: ['solomon', { plain: true, skin: 0.95 }],
  proconsul: ['pilate'], lictor: ['soldier', { sat: 0.5 }], elymas: ['isaiah', { hue: 250, sat: 0.6, skin: 0.9 }],
  mark: ['timothy', { hue: 230, skin: 1.04 }], ruler: ['nicodemus', { hue: 200, skin: 1.06 }], noblewoman: ['michal', { hue: 300 }],
  lame: ['pilgrim-man', { plain: true, skin: 0.95 }], lycaonian: ['shepherd', { hue: 20, skin: 0.75 }], lycaonianW: ['zipporah', { hue: 25, skin: 0.8 }],
  zeuspriest: ['samuel', { hue: 40, skin: 1.05 }], elderC: ['jethro', { hue: 90, skin: 0.95 }], eunice: ['pilgrim-woman', '#5a6a4a'],
  lois: ['miriam', { plain: true }], macedonian: ['silas', { hue: 20, skin: 1.04 }], slavegirl: ['girl', { plain: true, skin: 1.05 }],
  magistrate: ['pilate', { hue: 330 }], jailer: ['joab', { plain: true, skin: 0.9 }], philosopher: ['samuel', { hue: 200, skin: 1.08 }],
  philosopher2: ['isaiah', { hue: 230, skin: 1.08 }], aquila: ['fisherman', { hue: 20, skin: 0.95 }], priscilla: ['pilgrim-woman', '#3e5a6a'],
  sailor: ['fisherman', { hue: 200, skin: 0.75 }], governor: ['pilate', { hue: 300 }], ephesian: ['pilgrim-man', '#c97a3a'],
  demetrius: ['jeroboam', { hue: 30, sat: 0.7 }], titus: ['timothy', { hue: 40, skin: 1.02 }], tertius: ['nathan', { hue: 210, skin: 1.03 }],
  phoebe: ['woman', { hue: 190 }], eutychus: ['david', { plain: true, skin: 1.03 }], tribune: ['centurion', { hue: 20 }],
  nephew: ['timothy', { hue: 200, skin: 1.06 }], drusilla: ['jezebel', { hue: 180, skin: 1.05 }], tertullus: ['pilate', { plain: true, skin: 1.05 }],
  festus: ['pilate', { hue: 340, skin: 1.03 }], agrippa: ['ahab', { hue: 280 }], bernice: ['jezebel', { hue: 300 }],
  aristarchus: ['barnabas', { hue: 20, skin: 1.05 }], shipowner: ['jeroboam', { hue: 210 }], islander: ['shepherd', { plain: true, skin: 0.68 }],
  islanderW: ['zipporah', { plain: true, skin: 0.72 }], publius: ['pilate', { hue: 250, skin: 0.95 }], epaphroditus: ['silas', { hue: 270 }],
  onesimus: ['timothy', { plain: true, skin: 0.7 }], tychicus: ['luke', { hue: 140 }],
});
const dress = ([n, c]) => c === 'plain' ? plain(ready[n], n) : c && typeof c === 'object' ? restyle(ready[n], n, c) : c ? tinted(ready[n], n, c) : ready[n];
// 3D 모델은 아직 점검 중 — 주소에 ?models가 있을 때만 쓴다. 운영은 예전 인형 (사용자 2026-11: 떠 있고 엉뚱한 곳을 보고 말해서, 다 잡을 때까지)
const USE_MODELS = new URLSearchParams(location.search).has('models');
function modelOf(type, i) {
  if (!USE_MODELS) return null;
  if (OWN[type]) return [OWN[type]];
  if (LIKE[type]) return LIKE[type];
  if (type === 'disciple') return [DISCIPLES[i % DISCIPLES.length]];
  const T = TYPES[type] || {};
  if (BOYS.has(type)) return ['david', 'plain']; // 소년은 소년 다윗 모델에 수수한 옷 (사용자 2026-11)
  if (type === 'girl') return ['girl']; // 갈릴리 시골 소녀 (야이로의 딸 등)
  if (MEN.has(type)) return i % 3 ? EXTRA.men[i % EXTRA.men.length] : ['pilgrim-man', T.mantle || T.robe];
  if (WOMEN.has(type)) return i % 3 ? EXTRA.women[i % EXTRA.women.length] : ['pilgrim-woman', T.robe];
  return null;
}
const ready = {}, loading = {};
function want(names) {
  const todo = names.filter(n => !(n in ready));
  todo.forEach(n => { loading[n] ??= model(n).then(g => { ready[n] = g; }); });
  return todo.length ? Promise.all(todo.map(n => loading[n])) : null;
}
// 겹침 막기(stage/collide.js): 사람·단단한 물건을 바닥의 직육면체로 보고, 멈춰 선 사람이 다른 사람이나 물건과 겹치면 밖으로 밀어낸다.
// 대본의 자리는 작은 인형에 맞춰져 모델끼리 뚫고 섰고, 상·의자·짐승·집 벽을 뚫었다(사용자 2026-11 — 원 말고 직육면체로).
// 누운 사람·탄 사람·십자가·안긴 사람·높이를 정한 사람(걸상·단 위)은 그대로
const STAY = new Set(['sleep', 'ride', 'crucified', 'crucified-dead', 'perch', 'carry', 'carry-pole', 'mourn']);
const actorBox = a => personBox(a.pos.x, a.pos.y, a.p.root.rotation.y, (a.H || 0.9) * (a.big || 1));
const solidBoxes = () => Object.values(props).filter(p => SOLID.has(p.kind) && p.show > 0.5).flatMap(p => propBoxes(p.obj, stageGroup));
function spaceOut(dt) {
  if (!USE_MODELS || !script) return;
  const L = Object.values(actors).filter(a => a.doll && a.showT > 0.5 && a.p.root.parent === stageGroup && !a.y && !a.yT && !STAY.has(a.pose) && a.goal.distanceTo(a.pos) < 0.02);
  const k = Math.min(1, dt * 6), solids = L.length ? solidBoxes() : [];
  for (let i = 0; i < L.length; i++) {
    const a = L[i];
    for (const b of solids) { const d = push(actorBox(a), b); if (d) { a.pos.x += d[0] * k; a.pos.y += d[1] * k; } }
    for (let j = i + 1; j < L.length; j++) { const b = L[j], d = push(actorBox(a), actorBox(b)); if (!d) continue;
      a.pos.x += d[0] * k / 2; a.pos.y += d[1] * k / 2; b.pos.x -= d[0] * k / 2; b.pos.y -= d[1] * k / 2; b.goal.copy(b.pos); }
    a.goal.copy(a.pos);
  }
  // 배 위: 갑판 좌표에서 돛대와, 같은 배에 탄 사람끼리 — 배는 사람이 올라서는 것이라 위의 검사에서 빠져 베드로가 돛대를 뚫었다(e17, 사용자 2026-11)
  const decks = new Map();
  Object.values(actors).forEach(a => { const d = a.p.root.parent; if (a.doll && a.showT > 0.5 && d?.userData.deck && !STAY.has(a.pose) && a.goal.distanceTo(a.pos) < 0.02) (decks.get(d) || decks.set(d, []).get(d)).push(a); });
  for (const [d, B] of decks) {
    const mast = (d.userData.solids || []).map(([x, z, hu, hv]) => box(x, z, 0, hu, hv));
    for (let i = 0; i < B.length; i++) { const a = B[i];
      for (const m of mast) { const p = push(actorBox(a), m); if (p) { a.pos.x += p[0] * k; a.pos.y += p[1] * k; } }
      for (let j = i + 1; j < B.length; j++) { const b = B[j], p = push(actorBox(a), actorBox(b)); if (!p) continue; a.pos.x += p[0] * k / 2; a.pos.y += p[1] * k / 2; b.pos.x -= p[0] * k / 2; b.pos.y -= p[1] * k / 2; b.goal.copy(b.pos); }
      a.goal.copy(a.pos); }
  }
}
// 군중이 비켜설 네모들: 보이는 배역(탄 사람 빼고)과 단단한 물건 (props.js crowd)
const avoidFor = () => ({ stage: stageGroup, boxes: [...Object.values(actors).filter(a => a.showT > 0.5 && a.p.root.parent === stageGroup).map(actorBox), ...solidBoxes()] });
// 낭독 중에 모델이 늦게 도착하면 서 있던 인형을 그 자리에서 모델로 바꿔 끼운다 — 다시 차리면 낭독 중의 움직임이 처음으로 돌아가니,
// 인형은 그대로 보이지 않는 길잡이로 두고 모델만 덧씌운다 (e04 헤롯·박사, e06 어린 예수님이 인형으로 남았다, 사용자 2026-11)
// 군중 모델이 낭독 중에 도착하면 군중 소품만 새로 세운다 (보이던 모양·앉음 그대로)
function rebuildCrowds() {
  const v = new THREE.Vector3();
  Object.entries(script.props || {}).forEach(([name, [kind, x, z, o]]) => {
    if (kind !== 'crowd' || !props[name]) return;
    const old = props[name], p = makeProp(kind, x, z, o);
    p.kind = kind; p.terrainHide = old.terrainHide; p.foot = old.foot; p.lift = old.lift; p.show = old.show; p.showT = old.showT; p.set(old.state); p.obj.position.copy(old.obj.position); p.goal.copy(old.goal);
    old.obj.removeFromParent(); p.lift.add(p.obj); props[name] = p;
    p.avoid = avoidFor;
  });
}
function swapIn(plan) {
  Object.entries(script.cast).forEach(([name, [type, , , , o = {}]], i) => {
    const old = actors[name], m = plan[i]; if (!old || old.doll || !m || !ready[m[0]]) return;
    const parent = old.p.root.parent, a = new StageModel(dress(m), type, old.pos.x, old.pos.y, old.face, { solemn: script.solemn, borrow: BORROW(), wings: type === 'angel' && ready.wings, ...o, doll: old });
    old.p.root.removeFromParent(); parent?.add(a.p.root); a.op = -1; actors[name] = a; a.update(performance.now() / 1000, 0.016);
  });
  Object.entries(script.props || {}).forEach(([name, [, , , o]]) => { if (o?.on && props[name]) props[name].follow = [].concat(o.on).map(n => actors[n]); });
}
function clearCast() {
  cancelPending();
  Object.values(actors).forEach(a => { a.p.root.removeFromParent(); a.dispose?.(); });
  Object.values(props).forEach(p => p.lift.removeFromParent());
  actors = {}; props = {};
}
/* 동작 명령: [이름, 자세(또는 소품 상태), 옵션]
   이름이 '@env'면 분위기 전환. 옵션: x, z, y, look, show, item, board('배 이름' 또는 null), delay(ms), to(말을 건네는 상대) */
const SITTING = new Set(['sit', 'sit-ground', 'sit-speak', 'seat']), KNEELING = new Set(['kneel', 'mourn', 'cower']);
// 앉거나 무릎 꿇은 사람이 자리를 옮기지 않고 말하거나 손짓·기도·쳐다보기만 하면 그 자세 그대로 — 대본의 동작들이 모두 선 자세라
// 혼자 앉았다가 벌떡 일어나 말하고 다시 앉았다(사용자 2026-11). 일부러 일어서는 것은 'idle'·'stand'·'bow'(일어나 이르시되)·'raise'(뛰어 일어남)로 쓴다
function lowPose(a, pose, o) {
  if (!pose || o.x !== undefined || o.z !== undefined) return pose;
  if (SITTING.has(a.pose)) {
    if (['speak', 'bless', 'point', 'shrug'].includes(pose)) return 'sit-speak';
    if (['listen', 'look-up', 'pray', 'afraid'].includes(pose)) return a.sitAs || 'sit';
  }
  if (KNEELING.has(a.pose)) {
    if (['speak', 'pray', 'look-up', 'listen'].includes(pose)) return a.pose === 'kneel' || pose === 'look-up' ? 'kneel' : a.pose; // 엎드렸다가 눈을 들어 보면 무릎 꿇고 고개를 든다
    if (pose === 'afraid') return a.pose;
  }
  return pose;
}
function apply(cmds, instant = false) {
  (cmds || []).forEach(cmd => {
    let [name, pose, o = {}] = cmd;
    if (o.delay && !instant) {
      const tk = token, job = { at: performance.now() + o.delay, cmd: [name, pose, { ...o, delay: 0 }] };
      job.id = setTimeout(() => { pending.delete(job); if (tk === token) apply([job.cmd]); }, o.delay);
      pending.add(job); return;
    }
    if (name === '@env') { setEnv(pose, instant); return; }
    if (name === '@cam') { street.cam(script?.cams, pose, instant); return; }
    if (name === '@set') { street.cmd(pose, instant); return; } // 세트 안의 것 (장터 저울의 기울기 등)
    if (name === '@at') { moveAt = pose ? { ll: pose, x: o.x || 0, z: o.z || 0 } : null; if (instant) atSnap = true; return; }
    const a = actors[name], p = props[name];
    if (a) {
      const want = lowPose(a, pose, o);
      if (want) { if (SITTING.has(want) && want !== 'sit-speak') a.sitAs = want; a.set(want); a.talkTo = o.to ? actors[o.to] : null; }
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
const INDOOR = new Set(['synagogue', 'house', 'temple', 'throne', 'table', 'feast', 'treasury', 'gate', 'booth', 'tabernacle', 'tent', 'walls', 'citywall', 'sukkah', 'palace']);
function setScene(ev) {
  curEv = ev;
  clearCast();
  moveAt = null; atSnap = true;
  script = (!ev.paints && SCRIPTS[ev.id]) || null; // 그림으로 보는 장면(기쁜 소식의 paints)은 3D 무대 대신 그림이 화면을 채운다 (app.js paintScene)
  mode = script ? 'scene' : 'off';
  document.body.classList.toggle('stage-on', !!script);
  street.use(script?.street || null);
  if (!script) { canvas.style.opacity = 0; map.style.filter = ''; delete wrap.dataset.env; window.stageFoot = null; return; }
  if (street.on) street.cam(script.cams, script.cam || Object.keys(script.cams || {})[0], true);
  stageGroup.scale.setScalar(script.scale || 1);
  // 건물이 선 장면에서 앉는 사람은 네모난 의자에, 산·들에서는 돌에 (사용자 2026-11)
  seatBlocks(script.seats ? script.seats === 'block' : Object.values(script.props || {}).some(([k]) => INDOOR.has(k))); // seats로 장면이 정할 수도 (산 위 설교의 비유 속 작은 집은 멀리 있다)
  size = { w: 0, h: 0 }; // 넓은 무대(wide)가 바뀌었을 수 있으니 다시 잰다
  // 배역마다 쓸 모델 (거리 무대·실루엣은 인형 그대로)
  // dolls: 그 장면의 사람은 인형 그대로 (에덴 프롤로그의 아담·하와는 하나님이 지어 주신 가죽옷 — 순례자 모델이 지금 옷처럼 보였다, 사용자 2026-11). 천사만 모델로
  const plan = Object.values(script.cast).map(([type, , , , o = {}], i) => !script.street && !o.silhouette && !(script.dolls && type !== 'angel') && modelOf(type, i));
  {
    const crowd = !script.street && Object.values(script.props || {}).some(([k]) => k === 'crowd');
    // 군중: 엑스트라를 섞되 이 장면에 이름으로 나오는 사람은 빼고 (사무엘이 이름으로 선 장면의 군중에 또 사무엘이 서지 않게)
    const named = new Set(plan.filter(Boolean).map(m => m[0]));
    const pool = { men: EXTRA.men.filter(([n]) => !named.has(n) || n.startsWith('pilgrim')), women: EXTRA.women.filter(([n]) => !named.has(n) || n.startsWith('pilgrim')) };
    const CROWDM = [...pool.men, ...pool.women].map(([n]) => n);
    // 배역(과 동작을 빌려 줄 모델)을 먼저 받고, 군중은 그다음에 — 느린 곳에서 군중 모델 열 몇 개가 배역 앞에 줄을 섰다(사용자 2026-11)
    const names = USE_MODELS ? [...new Set([...named, ...(named.size ? ['pilgrim-man', 'jesus-moves'] : []), ...(named.has('angel') ? ['wings'] : [])])] : []; // 동작을 빌려 줄 모델도 함께 — 늦게 받으면 요셉이 잠자기 동작 없이 통나무처럼 누웠다
    const crowdNames = USE_MODELS && crowd ? [...new Set(CROWDM)] : [];
    // 같은 모델이 무리에 또 나오면(k번째) 옷 색상을 돌리고 살갗 밝기를 달리 한다 (props.js crowd)
    const CHUES = [0, 150, 45, 220, 300, 95], CSKIN = [1, 0.86, 1.1, 0.94, 1.05, 0.8];
    const crowdSet = () => USE_MODELS && crowd && CROWDM.every(n => ready[n]) ? { men: pool.men, women: pool.women, dress: (e, k) => k ? restyle(ready[e[0]], e[0], { hue: CHUES[k % 6], sat: 0.95, skin: CSKIN[k % 6] }) : dress(e) } : null;
    setCrowd(crowdSet());
    const ev0 = ev, wait = names.length ? want(names) : null;
    const thenCrowd = () => { const w = crowdNames.length ? want(crowdNames) : null; w?.then(() => { if (curEv !== ev0) return; if (atStart) return setScene(ev0); setCrowd(crowdSet()); rebuildCrowds(); }); };
    wait ? wait.then(() => { if (curEv !== ev0) return; if (atStart || new URLSearchParams(location.search).has('beat')) setScene(ev0); else { swapIn(plan); thenCrowd(); } }) : thenCrowd();
    // 다음 두 장면의 배역 모델도 미리 받아 둔다 — 장면에 들어선 뒤에야 받기 시작하면 낭독이 이미 시작돼 그 장면엔 인형이 남았다(e04 헤롯·박사, 사용자 2026-11)
    if (USE_MODELS && !script.street) { const ks = Object.keys(SCRIPTS), at = ks.indexOf(ev.id);
      const next = ks.slice(at + 1, at + 3).flatMap(k => { const sc = SCRIPTS[k]; if (!sc?.cast || sc.street) return [];
        return Object.values(sc.cast).map(([type, , , , o = {}], i) => !o.silhouette && !(sc.dolls && type !== 'angel') && modelOf(type, i)).filter(Boolean).map(m => m[0]).concat(Object.values(sc.cast).some(([t]) => t === 'angel') ? ['wings'] : []); });
      const rest = [...new Set(next)].filter(n => !ready[n] && !loading[n]); if (rest.length) wait ? wait.then(() => want(rest)) : want(rest); }
  }
  Object.entries(script.props || {}).forEach(([name, [kind, x, z, o]]) => {
    const p = makeProp(kind, x, z, o);
    p.terrainHide = o?.terrain === false; // 3D 지형의 도성 모형에 이미 있는 건물 — 무대에 또 세우면 모형 위에 걸쳐 떠 보인다
    // lift: 3D 지형 안에서 소품을 그 자리의 땅 높이로 올리고 내리는 받침 (2D 무대에서는 늘 0)
    // 바닥 넓이(소품 자리에서 앞뒤좌우로 얼마나 퍼지나): 바닥이 평평한 건물을 비탈에 앉힐 때 쓴다
    p.obj.updateMatrixWorld(true); const fb = new THREE.Box3().setFromObject(p.obj);
    p.foot = [fb.min.x - p.obj.position.x, fb.max.x - p.obj.position.x, fb.min.z - p.obj.position.z, fb.max.z - p.obj.position.z];
    p.lift = new THREE.Group(); p.lift.add(p.obj); p.kind = kind; p.bench = kind === 'crowd' && (o?.y || 0) > 0;
    props[name] = p; stageGroup.add(p.lift);
  });
  Object.entries(script.cast).forEach(([name, [type, x, z, face, o = {}]], i) => {
    const m = plan[i];
    const g = m && ready[m[0]] && dress(m);
    // 천사는 날개 없는 몸 모델에 따로 뜬 날개를 등에 붙인다 — 날개와 팔이 한 그물이던 모델은 팔을 움직이면 날개가 꼬였다(사용자 2026-11)
    // 승천 때의 '흰 옷 입은 두 사람'(whiteman, 행 1:10)은 날개 없이 — 성경이 사람으로 그린다
    const a = g ? new StageModel(g, type, x, z, face, { solemn: script.solemn, borrow: BORROW(), wings: type === 'angel' && ready.wings, ...o }) : new Actor(type, x, z, face, { solemn: script.solemn, ...o });
    a.realWalk = !!script.street; // 거리 무대: 걷고 돌아보는 방향을 실제대로 (people.js)
    actors[name] = a;
    (o.board ? props[o.board].deck : stageGroup).add(a.p.root);
    a.show = 0; a.showT = 1;
  });
  // 사람을 비추는 빛(on: 배역 이름)은 그 사람을 따라다닌다 — 빛 아래 서 있다가 옮겨 가도 빛만 남지 않게
  // on이 둘이면 두 사람의 한가운데를 따른다 — 앞뒤의 두 제사장이 멘 언약궤
  Object.entries(script.props || {}).forEach(([name, [, , , o]]) => { if (o?.on) props[name].follow = [].concat(o.on).map(n => actors[n]); });
  // 군중은 무대의 배역이 가까이 오면 비켜선다 (props.js crowd)
  Object.values(props).forEach(p => { if (p.kind === 'crowd') p.avoid = avoidFor; });
  // 모델 천사 위의 빛기둥은 끈다 — 흰 옷의 천사가 빛에 묻혀 하얗게 바랬다. 천사 둘레의 은은한 빛(glow)만으로 충분하다(사용자 2026-11)
  Object.entries(script.props || {}).forEach(([name, [kind, , , o]]) => { if (kind === 'beam' && o?.on && props[name]) props[name].muted = [].concat(o.on).every(n => actors[n]?.doll && ['angel', 'whiteman'].includes(actors[n].type)); });
  setEnv(script.env || 'day', true);
  // 연출 확인용: ?beat=p1.3 이면 그 순간까지의 동작을 즉시 적용한다 (?beat=enter는 대표 순간 그대로)
  const until = new URLSearchParams(location.search).get('beat');
  setStart(until !== 'enter');
  Object.values(actors).forEach(a => { a.show = 0; a.settle(); }); // 처음부터 정해진 자세로 놓고 서서히 나타난다
  if (until) {
    atStart = false;
    const keys = until === 'enter' ? [] : Object.keys(script.beats).filter(k => k !== 'enter');
    for (const k of keys) { apply(script.beats[k], true); gaze(); if (k === until) break; }
    Object.values(actors).forEach(a => { a.show = a.showT; for (let i = 0; i < 80; i++) a.update(i * 0.05, 0.05); });
    updateEnvInstant();
  }
}
// 모델 점검용(?models&check): 장면의 순간마다 떠 있거나 묻힌 사람, 상대를 보지 않고 말하는 사람을 잰다 (헤드리스로 61장면을 돌려 본다)
if (USE_MODELS && new URLSearchParams(location.search).has('check')) window.__stage = {
  scene: ev => setScene(ev), beats: () => Object.keys(script?.beats || {}),
  ready: () => !Object.keys(loading).some(n => !(n in ready)),
  step(k) { atStart = false; apply(script.beats[k], true); gaze(); Object.values(actors).forEach(a => { a.show = a.showT; for (let i = 0; i < 60; i++) a.update(i * 0.05, 0.05); }); for (let i = 0; i < 60; i++) { spaceOut(0.05); Object.values(actors).forEach(a => a.update(3 + i * 0.05, 0.05)); } Object.values(props).forEach(p => { for (let i = 0; i < 40; i++) p.update(i * 0.05, 0.05, {}); }); },
  measure() {
    const out = [], v = new THREE.Vector3();
    for (const [name, a] of Object.entries(actors)) {
      if (!a.doll || a.showT < 0.5 || a.p.root.parent !== stageGroup) continue; // 모델만, 보이는 사람만, 배·나귀 위는 빼고
      stageGroup.updateMatrixWorld(true);
      let low = Infinity; a.p.root.traverse(o => { if (o.isBone && /(Foot|ToeBase|Toe_End|Leg)$/.test(o.name)) low = Math.min(low, stageGroup.worldToLocal(o.getWorldPosition(v)).y); });
      if (a.pose === 'sleep') { low = Infinity; a.body.updateMatrixWorld(true); a.body.traverse(o => { if (!o.isSkinnedMesh) return; const c = o.geometry.attributes.position.count; for (let i = 0; i < c; i += 4) { o.getVertexPosition(i, v); o.localToWorld(v); low = Math.min(low, stageGroup.worldToLocal(v).y); } }); } // 누운 사람은 살로 잰다
      const gap = (low - (a.ground + (['seat', 'sit-speak', 'sit'].includes(a.pose) ? 0 : a.y))) / (a.big || 1), r = { name, pose: a.pose, gap: +gap.toFixed(3), big: +(a.big || 1).toFixed(2) }; // 지형 안에서는 사람을 키우니(big) 그만큼 나눈다
      if (inTerrain && !a.y && !a.yT) { const w = new THREE.Vector3(a.pos.x, low + 5, a.pos.y).applyMatrix4(stageGroup.matrixWorld), h = groundHit(w); // 그려진 땅(지형 그물·도성 단)에 직접 대어 본다
        if (h !== null) r.hit = +((low - stageGroup.worldToLocal(new THREE.Vector3(w.x, h, w.z)).y) / (a.big || 1)).toFixed(3); }
      const t = a.talkTo || ((a.pose === 'speak' || a.pose === 'sit-speak') && a.target);
      if (t && t.showT > 0) { const want = Math.atan2(t.pos.x - a.pos.x, t.pos.y - a.pos.y); const f = a.p.root.rotation.y; r.off = +Math.abs(Math.atan2(Math.sin(want - f), Math.cos(want - f))).toFixed(2); r.to = Object.keys(actors).find(k => actors[k] === t); }
      out.push(r);
    }
    return out;
  },
  who(n) { const a = actors[n]; if (!a) return null; const d = a.doll || a; return { model: !!a.doll, pose: d.pose, y: d.y, yT: d.yT, floating: d.floating, sleep: !!a.acts?.sleep, mv: d.goal.distanceTo(d.pos), rotx: a.body?.rotation.x, ground: d.ground, rootY: a.p.root.position.y, parent: a.p.root.parent?.type }; },
  // 되풀이 동작의 이음매: 끝(dur)과 처음(0)의 뼈 각도 차(도) — 큰 뼈 몇 개
  loopGap(n, clip = 'talk') { const a = actors[n]; const act = a?.acts?.[clip]; if (!act) return null; const c = act.getClip(), q0 = new THREE.Quaternion(), q1 = new THREE.Quaternion(), out = [];
    for (const k of c.tracks) { if (k.ValueTypeName !== 'quaternion') continue; const it = k.createInterpolant(); q0.fromArray(it.evaluate(0)); q1.fromArray(it.evaluate(c.duration)); const d = q0.angleTo(q1) * 57.3; if (d > 1) out.push([k.name.split('.')[0].replace('mixamorig', ''), +d.toFixed(1)]); }
    return { dur: +c.duration.toFixed(2), loop: act.loop, n: c.tracks.length, out: out.sort((x, y) => y[1] - x[1]).slice(0, 8) }; },
  // 튐 찾기: secs초 동안 매 프레임 그 사람 뼈들의 (부모 기준) 회전 변화 — 프레임 사이 가장 크게 바뀐 뼈와 각도, 그 순간의 동작 시각
  jumps(n, secs = 8) { const a = actors[n]; if (!a?.body) return Promise.resolve(null); const bones = []; a.body.traverse(o => { if (o.isBone) bones.push(o); });
    let prev = null; const out = [], t0 = performance.now();
    return new Promise(res => { const tick = () => { const cur = bones.map(b => b.quaternion.clone());
      if (prev) { let m = 0, w = ''; cur.forEach((q, i) => { const d = q.angleTo(prev[i]) * 57.3; if (d > m) { m = d; w = bones[i].name.replace('mixamorig', ''); } }); out.push([+((performance.now() - t0) / 1000).toFixed(2), +m.toFixed(1), w, +(a.cur?.time || 0).toFixed(2), a.cur?.getClip().name]); }
      prev = cur; if (performance.now() - t0 < secs * 1000) requestAnimationFrame(tick); else res(out); }; requestAnimationFrame(tick); }); },
  // 같은 것을 화면 없이: dt씩 직접 돌려(느린 컴퓨터에서도 프레임이 촘촘하게) 뼈 회전·몸 위치가 한 번에 크게 바뀌는 순간
  jumpsSim(n, secs = 14, dt = 1 / 30) { const a = actors[n]; if (!a?.body) return null; const bones = []; a.body.traverse(o => { if (o.isBone) bones.push(o); });
    let prev = null, pp = null; const out = [], T0 = performance.now() / 1000;
    for (let t = 0; t < secs; t += dt) { a.update(T0 + t, dt); const cur = bones.map(b => b.quaternion.clone()), bp = a.body.position.clone();
      if (prev) { let m = 0, w = ''; cur.forEach((q, i) => { const d = q.angleTo(prev[i]) * 57.3; if (d > m) { m = d; w = bones[i].name.replace('mixamorig', ''); } });
        out.push([+t.toFixed(2), +m.toFixed(2), w, +(bp.distanceTo(pp) * 1000).toFixed(2), +(a.cur?.time || 0).toFixed(2), a.cur?.getClip().name, a.doll.pose, +(a.w || 0).toFixed(2), Object.entries(a.acts).filter(([, x]) => x.getEffectiveWeight() > 0.01 && x.isRunning()).map(([k, x]) => k + ':' + x.getEffectiveWeight().toFixed(2) + '@' + x.time.toFixed(2)).join(' ')]); }
      prev = cur; pp = bp; }
    return out; },
  keysNear(n, bone, t0, t1, clip = 'talk') { const a = actors[n]; const c = a?.acts?.[clip]?.getClip(); if (!c) return null;
    return c.tracks.filter(k => k.name.includes(bone)).map(k => [k.name, Array.from(k.times).map((t, i) => [t, i]).filter(([t]) => t >= t0 && t <= t1).map(([t, i]) => [+t.toFixed(3), Array.from(k.values.slice(i * k.getValueSize(), (i + 1) * k.getValueSize())).map(v => +v.toFixed(3))])]); },
  trackInfo(n, clip = 'talk') { const c = actors[n]?.acts?.[clip]?.getClip(); return c && c.tracks.map(k => [k.name.replace('mixamorig', ''), k.times.length, +k.times[0].toFixed(2), +k.times[k.times.length - 1].toFixed(2)]); },
  evalAt(n, bone, ts, clip = 'talk') { const c = actors[n]?.acts?.[clip]?.getClip(); const k = c?.tracks.find(k => k.name.includes(bone + '.quaternion')); if (!k) return null; const it = k.createInterpolant(), q0 = new THREE.Quaternion().fromArray(it.evaluate(ts[0]));
    return { interp: k.getInterpolation(), keys: Array.from(k.times).filter(t => t > 3.8).map(t => +t.toFixed(3)), at: ts.map(t => [t, +(q0.angleTo(new THREE.Quaternion().fromArray(it.evaluate(t))) * 57.3).toFixed(1)]) }; },
  probe(n, ts) { const a = actors[n], act = a.acts.talk, nb = a.neckB, q0 = []; return ts.map(t => { for (const [b, q] of a.rest) b.quaternion.copy(q); act.time = t; a.mixer.update(0); const q = nb.quaternion.clone(); if (!q0.length) q0.push(q); return [t, +(q.angleTo(q0[0]) * 57.3).toFixed(1), q.toArray().map(v => +v.toFixed(3))]; }); },
  probe2(n) { const a = actors[n], act = a.acts.talk, c = act.getClip(); const i = c.tracks.findIndex(k => /Neck\.quaternion/.test(k.name)); const ip = act._interpolants[i], k = c.tracks[i];
    return { name: k.name, times: Array.from(k.times).slice(-6).map(t => +t.toFixed(3)), vals: Array.from(k.values).slice(-12).map(v => +v.toFixed(3)), ip: [3.9, 4.0, 5.0, 5.4].map(t => Array.from(ip.evaluate(t)).map(v => +v.toFixed(3))), ending: ip.settings }; },
  // 모델이 정해지지 않아 인형으로 남는 배역 (장면별)
  unmapped() { const out = {}; for (const [id, sc] of Object.entries(SCRIPTS)) { if (!sc?.cast || sc.street || sc.dolls) continue; Object.values(sc.cast).forEach(([t, , , , o = {}], i) => { if (!o.silhouette && !modelOf(t, i)) (out[t] ||= []).push(id); }); } return out; },
  crowdDbg() { const v = new THREE.Vector3(); return Object.entries(props).filter(([, p]) => p.kind === 'crowd').map(([n, p]) => [n, p.obj.children.map(c => [c.type, +c.position.x.toFixed(2), +c.position.z.toFixed(2)]).slice(0, 12), p.avoid().map(q => [+q.x.toFixed(2), +q.z.toFixed(2)]), p.obj.getWorldPosition(v).toArray().map(x => +x.toFixed(2)), p.obj.getWorldScale(v).x]); },
  ghosts() { const roots = new Set(Object.values(actors).map(a => a.p.root)), out = []; stageGroup.children.forEach(c => { let h = false; c.traverse(o => { if (o.isBone && /Hips$/.test(o.name)) h = true; }); if (h && !roots.has(c) && !Object.values(props).some(p => p.lift === c)) out.push([c.type, c.position.x.toFixed(2), c.position.z.toFixed(2), c.visible]); }); return out; },
  cupd() { const p = Object.values(props).find(p => p.kind === 'crowd'); let err = null; try { for (let i = 0; i < 40; i++) p.update(i * 0.05, 0.05, {}); } catch (e) { err = e.message; } return [err, p.obj.children.slice(0, 6).map(c => [+c.position.x.toFixed(2), +c.position.z.toFixed(2)])]; },
  lowSkin(n) { const a = actors[n]; if (!a?.body) return null; const v = new THREE.Vector3(); let low = Infinity, lowB = Infinity; a.body.updateMatrixWorld(true);
    a.body.traverse(o => { if (o.isSkinnedMesh) { const c = o.geometry.attributes.position.count; for (let i = 0; i < c; i += 3) { o.getVertexPosition(i, v); o.localToWorld(v); low = Math.min(low, v.y); } } if (o.isBone) lowB = Math.min(lowB, o.getWorldPosition(v).y); });
    const g = a.p.root.getWorldPosition(v).y, k = a.p.root.getWorldScale(new THREE.Vector3()).y; return { skin: +((low - g) / k).toFixed(3), bone: +((lowB - g) / k).toFixed(3), H: a.H, pose: a.pose, hasSleep: !!a.acts?.sleep, cur: a.cur?.getClip().name }; },
  // 겹침 점검(직육면체, 무대와 같은 기준): 사람끼리·사람과 단단한 물건이 겹친 깊이(0.01 넘는 것만)
  overlaps() { const E = [], v = new THREE.Vector3(), q = new THREE.Quaternion(), sq = stageGroup.getWorldQuaternion(new THREE.Quaternion()).invert(); stageGroup.updateMatrixWorld(true);
    Object.entries(actors).forEach(([n, a]) => { if (a.doll && a.showT > 0.5 && a.p.root.parent === stageGroup && !a.y && !a.yT && !STAY.has(a.pose)) E.push([n, actorBox(a), 'p']); });
    Object.entries(props).forEach(([n, p]) => { if (p.kind === 'crowd' && p.show > 0.5) p.obj.children.forEach((c, i) => { let b = false; c.traverse(o => { if (o.isBone) b = true; }); if (!b) return;
      stageGroup.worldToLocal(c.getWorldPosition(v)); const yaw = new THREE.Euler().setFromQuaternion(sq.clone().multiply(c.getWorldQuaternion(q)), 'YXZ').y; E.push([n + i, personBox(v.x, v.z, yaw), 'p']); });
      if (SOLID.has(p.kind) && p.show > 0.5) propBoxes(p.obj, stageGroup).forEach((b, i) => E.push([n + '(' + p.kind + ')', b, 's'])); });
    const out = []; for (let i = 0; i < E.length; i++) for (let j = i + 1; j < E.length; j++) { if (E[i][2] === 's' && E[j][2] === 's') continue; const d = push(E[i][1], E[j][1]); if (d && Math.hypot(...d) > 0.01) out.push([E[i][0], E[j][0], +Math.hypot(...d).toFixed(3)]); }
    return out; },
  actorsDbg() { return actors; },
  solidCount() { return [solidBoxes().length, Object.values(props).map(p => p.kind).join(',')]; },
  // 겹친 사람: 보이는 모든 사람(배역·군중)의 엉덩이 뼈 자리끼리 너무 가까운 쌍 (무대 좌표)
  crowding(lim = 0.1) { const v = new THREE.Vector3(), P = []; stageGroup.updateMatrixWorld(true); Object.entries(actors).forEach(([n, a]) => { a.p.root.userData.who = n; });
    stageGroup.traverse(o => { if (!o.isBone || !/Hips$/.test(o.name)) return; let vis = true; for (let q = o; q; q = q.parent) if (!q.visible || q.userData.deck || q.userData.saddle) { vis = false; break; } if (!vis) return; // 배·나귀에 탄 사람은 빼고
      let n = o; while (n.parent && n.parent !== stageGroup && !n.userData.who) n = n.parent; stageGroup.worldToLocal(o.getWorldPosition(v)); P.push([v.x, v.z, v.y, n.userData.who || '군중']); });
    // 동물(나귀·낙타·소·양 무리 등)도 한 점으로 — 사람이 동물 몸에 파묻혔다(e12, 사용자 2026-11)
    for (const [n, p] of Object.entries(props)) if (['donkey', 'camel', 'ox', 'pig', 'dog', 'jackal', 'sheep'].includes(p.kind) && p.obj.visible && p.show > 0.5) { p.obj.getWorldPosition(v); stageGroup.worldToLocal(v); P.push([v.x, v.z, v.y, n + '(' + p.kind + ')']); }
    const out = []; for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) { const d = Math.hypot(P[i][0] - P[j][0], P[i][1] - P[j][1]); if (d < lim) out.push([+d.toFixed(3), P[i][3], P[j][3], +P[i][0].toFixed(2), +P[i][1].toFixed(2)]); } return { n: P.length, out }; },
  // 앉은 사람의 엉덩이와 깔고 앉은 돌·의자가 얼마나 어긋났나 (무대 좌표, 사람 키로 나눔)
  seats() { const v = new THREE.Vector3(), w = new THREE.Vector3(), out = []; stageGroup.updateMatrixWorld(true);
    stageGroup.traverse(o => { if (!o.isMesh || !o.visible || !o.userData.tw && o.userData.tw !== 0) return; const hip = o.userData.hips; if (!hip) return;
      hip.getWorldPosition(v); o.getWorldPosition(w); stageGroup.worldToLocal(v); stageGroup.worldToLocal(w); const top = o.scale.y * o.parent.getWorldScale(new THREE.Vector3()).y, hy = hip.getWorldPosition(new THREE.Vector3()).y - o.getWorldPosition(new THREE.Vector3()).y; out.push([+(w.x - v.x).toFixed(3), +(w.z - v.z).toFixed(3), +top.toFixed(3), +hy.toFixed(3)]); }); return out; },
  // 걷는 사람들의 걷기 동작 자리·빠르기 (발이 다 맞는지 점검)
  // 모델 팔 길이: 지금 자세의 위팔·아래팔 길이 ÷ 뼈대(바인드) 길이 — 1이면 늘어나지 않은 것
  armLen() { const v = new THREE.Vector3(), w = new THREE.Vector3(), M = new THREE.Matrix4(), s3 = new THREE.Vector3(); return Object.entries(actors).filter(([, a]) => a.doll).map(([n, a]) => {
    let sk = null; a.body.traverse(o => { if (o.isSkinnedMesh && !sk) sk = o; }); if (!sk) return { n };
    a.body.updateMatrixWorld(true); const S = sk.skeleton, ix = k => S.bones.findIndex(b => b.name.endsWith(k)), sc = sk.matrixWorld.getMaxScaleOnAxis();
    const bind = i => new THREE.Vector3().setFromMatrixPosition(M.copy(S.boneInverses[i]).invert());
    const r = (x, y) => { const i = ix(x), k = ix(y); return S.bones[i].getWorldPosition(v).distanceTo(S.bones[k].getWorldPosition(w)) / (bind(i).distanceTo(bind(k)) * sc); };
    return { n, up: +r('LeftArm', 'LeftForeArm').toFixed(2), lo: +r('LeftForeArm', 'LeftHand').toFixed(2) }; }); },
  // 누운 사람의 머리와 베개 자리 (점검)
  sleepers() { const v = new THREE.Vector3(), w = new THREE.Vector3(), u = new THREE.Vector3(); return Object.entries(actors).filter(([, a]) => a.pillow?.visible).map(([n, a]) => {
    a.p.root.updateMatrixWorld(true); a.headB.getWorldPosition(v); a.pillow.getWorldPosition(w); a.p.root.getWorldPosition(u); const k = a.p.root.getWorldScale(new THREE.Vector3()).y;
    let sk = null; a.body.traverse(o => { if (o.isSkinnedMesh && !sk) sk = o; }); sk.computeBoundingBox(); const bb = sk.boundingBox.clone().applyMatrix4(sk.matrixWorld);
    const pr = q => { const x = q.clone().project(camera), r = canvas.getBoundingClientRect(); return [Math.round(r.left + (x.x + 1) / 2 * r.width), Math.round(r.top + (1 - x.y) / 2 * r.height)]; };
    return { n, sh: pr(v), sp: pr(w), mesh: [bb.min.y, bb.max.y, bb.min.z, bb.max.z].map(x => +x.toFixed(3)), head: [v.x, v.y, v.z].map(x => +x.toFixed(3)), pillow: [w.x, w.y, w.z].map(x => +x.toFixed(3)), root: [u.x, u.y, u.z].map(x => +x.toFixed(3)), k: +k.toFixed(3) }; }); },
  hipsY(n) { const a = actors[n]; if (!a?.body) return null; let h = null; a.body.traverse(o => { if (!h && o.isBone && /Hips$/.test(o.name)) h = o; }); return +h.getWorldPosition(new THREE.Vector3()).y.toFixed(3); },
  goAll(dx) { Object.values(actors).forEach(a => a.moveTo(a.goal.x + dx, a.goal.y)); },
  walkers() { return Object.entries(actors).filter(([, a]) => a.cur?.getClip().name === 'walk').map(([n, a]) => ({ n, t: +(a.cur.time / a.cur.getClip().duration).toFixed(2), pace: +a.cur.timeScale.toFixed(2) })); },
  // 소품이 땅에서 뜨거나 묻혔는지: 보이는 소품의 맨 아래와 그 자리 땅 높이의 차 (일부러 띄운 것 — y를 준 것, 하늘의 것 — 은 뺀다)
  props() {
    const out = [], box = new THREE.Box3(), inv = new THREE.Matrix4();
    stageGroup.updateMatrixWorld(true); inv.copy(stageGroup.matrixWorld).invert();
    for (const [name, p] of Object.entries(props)) {
      if (!p.obj.visible || (p.show ?? 1) < 0.5 || p.obj.position.y > 0.01 || SKY.has(p.kind) || p.lift.parent !== stageGroup) continue;
      box.setFromObject(p.obj).applyMatrix4(inv); if (box.isEmpty()) continue;
      const cx = (box.min.x + box.max.x) / 2, cz = (box.min.z + box.max.z) / 2, g = Math.max(groundAt(cx, cz), floorAt(cx, cz, p));
      const r = { name, kind: p.kind, gap: +((box.min.y - g) / (bigNow || 1)).toFixed(3), size: +((box.max.y - box.min.y) / (bigNow || 1)).toFixed(2) };
      // 지형 안에서는 그려진 땅(지형 그물)에 직접 쏘아 본다 — 계산한 땅 높이와 그려진 땅이 어긋나도 잡히게
      if (inTerrain) { const w = new THREE.Vector3(cx, box.max.y + 5, cz).applyMatrix4(stageGroup.matrixWorld), hit = groundHit(w, [p]);
        if (hit !== null) r.hit = +((box.min.y - stageGroup.worldToLocal(new THREE.Vector3(w.x, hit, w.z)).y) / (bigNow || 1)).toFixed(3); }
      out.push(r);
    }
    return out;
  },
};
const gRay = new THREE.Raycaster();
function groundHit(w, skip) { // 무대 밖의 지형 그물만 (나무·집 묶음·무대는 빼고)
  const T = window.terrain3d; if (!T) return null;
  const meshes = []; T.scene.traverse(o => { if (o.userData.ground) meshes.push(o); }); // 지형 그물과 도성의 성전 단 (terrain.js가 표시)
  Object.values(props).forEach(p => { if (p.heightAt && p.obj.visible && !skip?.includes(p)) p.obj.traverse(o => { if (o.isMesh) meshes.push(o); }); }); // 사람이 올라서는 소품(언덕·회당 바닥·배)도
  gRay.set(w, new THREE.Vector3(0, -1, 0)); const sides = meshes.map(m => m.material.side); meshes.forEach(m => { m.material.side = THREE.DoubleSide; }); // 성전 단 윗면이 아래를 향해 그려져 있어도 맞게
  const h = gRay.intersectObjects(meshes, false)[0]; meshes.forEach((m, i) => { m.material.side = sides[i]; });
  return h ? h.point.y : null;
}
const SKY = new Set(['star', 'host', 'beam', 'rain', 'dove', 'cloud', 'glory', 'bird', 'birds', 'light', 'smoke', 'water', 'sea', 'fire', 'glow', 'darkness', 'veil', 'angel']);
// 낭독 전에 서 있는 모습: 대표 순간(enter) 위에 낭독의 처음 상태(intro)를 얹는다. 예전에는 enter(이야기 중간이나 끝의 모습)로 서 있다가
// ▶를 누르면 intro로 한꺼번에 바뀌어, 다른 장면이 차려져 있다가 치워지고 시작하는 것처럼 보였다(사용자, 2026-11)
let atStart = false; // 낭독 전 모습(setStart) 그대로인가 — 그러면 ▶의 intro는 사람을 지웠다 다시 세우지 않고 그대로 이어 간다
function setStart(withIntro = true, instant = true) {
  atStart = withIntro;
  apply(script.beats.enter, instant);
  if (withIntro && script.beats.intro) apply(script.beats.intro, instant);
}
function updateEnvInstant() { for (let i = 0; i < 200; i++) updateEnv(0.05); }
function beat(key) {
  if (!script || mode !== 'scene') return;
  if (key === 'end' && !atStart) return; // 낭독이 끝나도 이야기의 마지막 모습 그대로 (end는 낭독 없이 볼 때의 그림)
  if (key === 'intro') {
    cancelPending(); // 예약된 동작 취소
    if (atStart) return; // 이미 처음 모습으로 서 있다
    apply(script.beats.intro || script.beats.enter, true);
    Object.values(actors).forEach(a => { if (a.showT) a.show = 0.0001; a.settle(); });
    return;
  }
  flushPending();
  atStart = false;
  apply(script.beats[key]);
  gaze();
}
// 누군가 말하면(speak) 다른 이들은 말하는 이를 보고, 말하는 이는 to로 정한 상대나 가장 가까운 사람을 본다
function gaze() {
  const all = Object.values(actors), speaker = all.find(a => (a.pose === 'speak' || a.pose === 'sit-speak') && a.showT > 0);
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
// 무대 캔버스의 크기(px): 데스크톱 300×270. 휴대폰은 화면이 작아 인물이 너무 작게 보여 1.3배(300×260)로 당겨 보이되,
// 넓은 무대(wide)가 화면 폭을 넘지 않게 줄인다. terrain.js의 minDist도 이것을 쓴다
const MOB_K = 1.3;
const stageBox = (wide = 1) => {
  if (innerWidth > 900) return { w: Math.round(300 * wide), h: Math.round(270 * wide) };
  const k = Math.max(1, Math.min(MOB_K, (innerWidth - 16) / (230 * wide)));
  return { w: Math.round(230 * k * wide), h: Math.round(200 * k * wide) };
};
window.stageBox = stageBox;
function resize() {
  const tv = window.terrainOn && window.terrainView;
  // 3D 지형에서 당겨 보면 인물도 커지므로 그만큼 화면(캔버스)도 넓힌다
  const wide = (script?.wide || 1) * (tv ? Math.max(1, tv.zoom) : 1);
  const { w, h } = stageBox(wide);
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
  const wide = s.wide || 1, { w, h } = stageBox(wide);
  const cam = camera.clone();
  cam.fov = THREE.MathUtils.radToDeg(2 * Math.atan(wide * Math.tan(THREE.MathUtils.degToRad(FOV / 2))));
  cam.aspect = w / h; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  const v = new THREE.Vector3(0, 0, 0).project(cam);
  return { dx: w / 2 - (v.x + 1) / 2 * w, dy: h / 2 - (1 - v.y) / 2 * h, at: s.at || null };
};
function anchor() {
  // 3D 지형 모드: 지형 위에 투영한 장소(또는 at 지점)에 무대를 붙인다 (terrain.js가 geoToClient를 바꿔 끼운다)
  if (window.terrainOn && curEv) {
    const ll = script?.at || [PLACES[placeOf(curEv)].lat, PLACES[placeOf(curEv)].lng], c = window.geoToClient(...ll), w = wrap.getBoundingClientRect();
    return { x: c.x - w.left, y: c.y - w.top };
  }
  // 무대 바닥을 실제 지점(at)으로 옮긴 장면은 캔버스도 그 지점에 붙인다 — 핀에 붙여 두면 옮겨 간 인물·집이 캔버스 가장자리에서 잘렸다
  if (script?.at && window.geoToClient) {
    const c = window.geoToClient(...script.at), w = wrap.getBoundingClientRect();
    // 핀이 아직 그려지지 않았으면 기다린다 (핀이 없는 장소 — 프롤로그의 에덴 — 는 그 지점에 바로)
    const pin = map.querySelector(`.pin[data-place="${placeOf(curEv)}"] .dot`);
    if (pin && !pin.getBoundingClientRect().width) return null;
    return { x: c.x - w.left, y: c.y - w.top };
  }
  const el = curEv && map.querySelector(`.pin[data-place="${placeOf(curEv)}"] .dot`);
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
  const pxPer = (innerWidth <= 900 ? 200 * MOB_K : 270) / (2 * CAM0.d * Math.tan(THREE.MathUtils.degToRad(FOV / 2))) * zoom;
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
  Object.values(props).forEach(p => { p.lift.position.set(0, 0, 0); if (p.fade !== 'scale') p.obj.scale.copy(p.base); if (p.skirt) p.skirt.visible = false; });
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
// 바닥이 있는 소품(궁 안, floor) 위라면 그 바닥의 받침 높이 — 3D 지형 위에서 바닥 위의 가구와 왕좌에 앉은 사람이 바닥에 묻히지 않게 (2D에서는 0)
// 바닥 소품이 없으면 -∞ — 예전엔 0(무대 가운데 땅 높이)을 바닥으로 쳐서 가운데보다 낮은 비탈의 소품(베들레헴 들판의 양·소)이 가운데 높이에 떠 있었다
const floorAt = (x, z, self) => Math.max(-Infinity, ...Object.values(props).filter(f => f.floor && f !== self && f.heightAt(x, z) > 0).map(f => f.lift.position.y));
// 땅에 붙은 소품: 지형과 같은 고정 축척에 둔다. 나머지(사람 곁의 십자가·배·짐승·상·바구니…)는 사람과 함께 커진다
// 바닥이 평평한 건물: 가운데 땅 높이에 앉히면 비탈 위쪽이 땅에 묻힌다(골짜기 바닥의 실로암 못) — 바닥 네 귀퉁이 가운데 가장 높은 땅에 앉힌다
const FLAT = new Set(['pool', 'house', 'well', 'synagogue', 'temple', 'gate', 'walls', 'cliffshrine']);
// 땅에 까는 얇은 판(모래·풀밭): 가운데 땅 높이에 두면 비탈 아래쪽에 선 사람의 다리를 판이 덮어 발만 보였다(가드 성문, 2026-11) — 가장 낮은 귀퉁이에 깐다(높은 쪽은 지형 밑으로 숨는다)
const COVER = new Set(['sand', 'grass', 'field', 'flowers', 'rocks']); // 바위도 낮은 쪽에 — 비탈 위쪽이 조금 묻히는 편이 떠 있는 것보다 낫다
const FIXED = new Set(['water', 'grass', 'hill', 'tomb', 'temple', 'house', 'rocks', 'figtree', 'synagogue', 'well', 'pool', 'flowers', 'gate', 'field', 'cliffshrine', 'palm', 'walls', 'olive', 'star', 'host', 'rain']);
// '@at' 명령: 3D 지형에서만 무대 바닥을 다른 실제 지점으로 옮긴다 — 무대 (x, z) 자리가 그 위경도에 오도록.
// 나사렛 회당에서 낭떠러지로 끌고 가는 대목처럼, 이야기가 근처의 실제 지형으로 옮겨 갈 때. 2D 무대는 그대로 둔다
let moveAt = null, atSnap = true, lastHere = null;
const center = { x: 0, z: 0 }, home = { x: 0, z: 0 };
function placeTerrain(T, dt) {
  if (placeOf(curEv) !== lastHere) { lastHere = placeOf(curEv); atSnap = true; } // 장면 안에서 다른 장소로 옮겨 가면(start·stops) 그 자리로 바로 — 천천히 따라가면 수백 단위를 미끄러졌다
  const ll = script.at || [PLACES[placeOf(curEv)].lat, PLACES[placeOf(curEv)].lng], d0 = T.sceneDist(curEv);
  const s = stageGroup.scale.x, k = oldUnit(T, d0, T.zoomAt(d0, placeOf(curEv)));
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
let lastF = 0;
function loop(now) {
  requestAnimationFrame(loop);
  // 2D 지도 위 무대: 걷거나 지도를 옮기는 중이 아니면 초당 30번만 — 사람들의 몸짓에는 넉넉하고, 늘 60번씩 그리던 몫이 절반으로
  // (지도를 옮기는 동안은 매 프레임 자리만 옮기고 다시 그리지는 않는다 — frame)
  if (!window.terrainDrives && (document.body.classList.contains('is-walking') || now - (window.mapMoveT || 0) < 200 || now - lastF > 31)) { lastF = now; frame(); } // 3D 지형 모드에서는 terrain.js가 카메라를 옮긴 직후에 부른다 — 따로 돌면 무대가 한 박자 늦게 따라와 핀에서 벗어나 보였다
}
window.stageRender = frame; // 3D 지형 루프가 부른다 (stageFrame은 app.js가 쓰는 무대 위치 계산 — 이름이 겹쳐 덮어쓰던 것을 나눔)
function frame() {
  if (!canvas) return;
  const T = !street.on && window.terrainDrives && window.terrain3d; // 거리 무대는 3D 지형에 들어가지 않는다
  if (!!T !== inTerrain) T ? enterTerrain(T) : leaveTerrain();
  // 노래(다윗 장면의 '이 자리에서 부른 노래')가 나오는 동안은 무대를 감춘다 — 가사가 무대 위에 겹쳐 지저분했다(사용자, 2026-11)
  const singing = document.body.classList.contains('singing');
  holder.visible = mode !== 'off' && !!curEv && !(T && singing);
  if (!T || mode === 'off') window.stageTone = null;
  if (mode === 'off' || document.hidden || wrap.offsetParent === null || document.body.classList.contains('intro-open')) return;
  const dt = Math.min(clock.getDelta(), 0.05), time = clock.elapsedTime;
  if (street.on) street.frame(dt, time);
  else if (T) {
    canvas.style.opacity = 0;
    placeTerrain(T, dt);
  } else {
    // 지도를 끌거나 당기는 동안(app.js applyView가 표시)은 이미 그려 둔 무대를 그대로 둔 채 자리만 따라가고 다시 그리지 않는다 —
    // 무대를 함께 다시 그리느라 지도 이동이 버벅였다. 숨기지는 않는다(사용자: 무대를 끄는 것은 장소 사이를 걸어갈 때만). 멈추면 다시 움직인다
    const moving = performance.now() - (window.mapMoveT || 0) < 200;
    resize();
    const a = anchor();
    if (!a) { canvas.style.opacity = 0; return; }
    followTerrain();
    canvas.style.opacity = window.stageHide || singing ? 0 : 1; // 장면 안에서 걸어가는 동안(app.js moveWithin)·노래하는 동안은 숨긴다
    canvas.style.transform = `translate(${Math.round(a.x - groundPx.x)}px, ${Math.round(a.y - groundPx.y)}px)`;
    if (moving) return;
  }
  updateEnv(dt);
  if (inTerrain) unscaleLights();
  placeGeo();
  Object.values(props).forEach(p => {
    if (p.follow) {
      const f = p.follow, x = f.reduce((s, a) => s + a.pos.x, 0) / f.length, z = f.reduce((s, a) => s + a.pos.y, 0) / f.length;
      p.goal.set(x, z); p.obj.position.x = x; p.obj.position.z = z;
    }
    p.update(time, dt, envNow);
    if (p.terrainHide && inTerrain) p.obj.visible = false;
    if (inTerrain) {
      // 땅에 붙은 소품은 무대를 옮겨도(@at) 제자리에 남는다
      const stay = FIXED.has(p.kind);
      p.lift.position.x = stay ? (home.x - base.x) / base.k : 0; p.lift.position.z = stay ? (home.z - base.z) / base.k : 0;
      const ox = p.obj.position.x + p.lift.position.x, oz = p.obj.position.z + p.lift.position.z, f = p.foot;
      const corners = () => [groundAt(ox, oz), groundAt(ox + f[0], oz + f[2]), groundAt(ox + f[1], oz + f[2]), groundAt(ox + f[0], oz + f[3]), groundAt(ox + f[1], oz + f[3])];
      if (FLAT.has(p.kind)) { // 비탈에서는 내리막 쪽 바닥 밑이 비어 떠 보였다(실로암 못·여관) — 가장 낮은 귀퉁이까지 돌 기단을 받친다
        const c = corners(), drop = Math.max(...c) - Math.min(...c);
        if (!p.skirt) { p.skirt = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: '#b9a888', roughness: 0.95 })); p.skirt.receiveShadow = true; p.lift.add(p.skirt); }
        p.skirt.visible = drop > 0.01 && p.obj.visible; p.skirt.scale.set((f[1] - f[0]) * 0.98, drop + 0.02, (f[3] - f[2]) * 0.98);
        p.skirt.position.set(p.obj.position.x + (f[0] + f[1]) / 2, -drop / 2, p.obj.position.z + (f[2] + f[3]) / 2);
      }
      // 걸상에 앉은 무리(y): 그 걸상이 있는 건물과 같은 높이에, 건물처럼 키우지 않는다 — 땅 높이·배율이 건물과 달라 걸상 위 허공에 떠 앉았다(e16, 사용자 2026-11)
      if (p.bench) { const host = Object.values(props).find(q => q !== p && FLAT.has(q.kind) && Math.hypot(q.obj.position.x - p.obj.position.x, q.obj.position.z - p.obj.position.z) < 0.05);
        if (host) { p.lift.position.copy(host.lift.position); return; } }
      p.lift.position.y = FLAT.has(p.kind) || p.floor ? Math.max(...corners())
        : COVER.has(p.kind) ? Math.min(...corners())
        : Math.max(groundAt(ox, oz), floorAt(ox, oz, p));
      if (!FIXED.has(p.kind)) { // 사람과 함께 키운다: 크기는 제자리에서, 높이(십자가가 선 언덕 위, 나는 비둘기)는 바닥에서부터
        if (p.fade === 'scale') p.obj.scale.multiplyScalar(bigNow); else p.obj.scale.copy(p.base).multiplyScalar(bigNow);
        p.lift.position.y += p.obj.position.y * (bigNow - 1);
      }
    }
  });
  // 지면 높이: 언덕 같은 소품 위에 선 사람은 그 표면에 올라선다 (배에 탄 사람, 높이를 직접 정한 사람은 제외)
  // 3D 지형 안에서는 그 자리의 땅 높이를 따른다. 높이를 정한 사람(십자가 위)은 땅만 따르고, 사람만 키우는 배율도 받지 않는다(십자가와 어긋나지 않게)
  spaceOut(dt);
  const grounds = Object.values(props).filter(p => p.heightAt && !(p.terrainHide && inTerrain)); // 3D 지형에서 숨긴 언덕(진짜 산으로 옮긴 e16 벼랑)은 밟지 않는다 — 보이지 않는 언덕 위에 떠 섰다(사용자 2026-11)
  Object.values(actors).forEach(ac => {
    const onDeck = ac.p.root.parent !== stageGroup, g0 = onDeck ? 0 : ac.fixedY ? Math.max(groundAt(ac.pos.x, ac.pos.y), floorAt(ac.pos.x, ac.pos.y)) : groundAt(ac.pos.x, ac.pos.y);
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
  // 멈추면 마지막 모습 그대로 — 사람들이 처음 자리로 걸어 돌아가는 모습이 여정 중에 보였다(사용자 2026-11). 다시 들으면 intro가 처음 모습으로 차린다
  addEventListener('stage:stop', () => { if (!script) return; cancelPending(); });
  loop();
  // app.js가 먼저 장면을 열었으면 따라잡는다
  if (window.__stageScene) { setScene(window.__stageScene); window.recenterStage?.(); } // 늦게 로드됐으면 무대 쪽으로 다시 맞춘다
}

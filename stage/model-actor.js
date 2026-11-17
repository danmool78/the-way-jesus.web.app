/* 3D 무대의 인물을 glb 모델로 (실험: 예수님만 — 사용자 2026-11 '간단하게 인형만 갈아 낄 수 있다면 예수님만 실험해 봐').
   대본(scenes.js)을 고치지 않으려고, 보이지 않는 예전 인형(people.js Actor)이 그대로 걷고 자세를 잡게 두고
   모델은 그 인형을 따라 한다: 자리·방향·크기·나타남은 인형의 root를 베끼고, 자세는
   - 동작이 있는 것(걷기·서 있기·말하기·기도·잠)은 모델의 동작(Mixamo)으로
   - 나머지(축복·손 들기·가리키기·십자가 등)는 서 있는 동작 위에 인형의 팔·팔뚝·머리가 가리키는 쪽으로 모델의 뼈를 돌려 맞춘다
   (뼈마다 축이 달라 각도를 옮기면 엉뚱했다 — 방향으로 맞추면 축을 몰라도 된다) */
import { THREE, damp } from './kit.js';
import { Actor, TYPES } from './people.js';
import { clone } from '../assets/vendor/SkeletonUtils.js';
import { calmClips } from '../game-model.js';

// 팔까지 모델의 동작 그대로 쓰는 자세 (그 밖의 자세는 팔을 인형에 맞춘다)
const CLIP = { idle: 'idle', listen: 'idle', speak: 'talk', sleep: 'sleep' };
// 무릎 꿇은 다리만 모델의 'pray'(무릎 꿇고 두 팔을 높이 듦)에서 빌리고 팔은 인형대로 — 인형의 기도는 서서 두 손을 가슴에 모은다
const KNEEL = new Set(['kneel', 'mourn', 'cower']); // 땅에 앉기(sit-ground)는 무릎 꿇기가 아니다 — 앉아 가르치시는 예수님이 무릎 꿇고 기도하는 다리를 빌려 시도 때도 없이 꿇으셨다(사용자 2026-11)
// 걸터앉기: 넓적다리를 앞으로, 정강이는 아래로 (회당에서 앉아 말씀을 읽으심 — 무릎 꿇고 기도하는 자세가 되었다, 사용자 2026-11)
// 걸터앉기는 앉을 자리가 있을 때만(나귀·높이를 정한 사람·'seat') — 자리 없이 다리를 뻗으니 허공에 떠 앉았다(사용자 2026-11). 그 밖의 '앉기'는 땅에 발뒤꿈치를 깔고
const WING = { scale: 1.0, y: -0.28, back: 0.12, turn: 0 }; // 날개를 붙이는 자리 (몸 모델 단위, 캡처로 맞춤)
// 앉는 돌: 둥글게 깎인 낮은 돌 (크기 1의 틀 — 사람마다 엉덩이 높이에 맞춰 늘린다)
// 깔고 앉는 돌 — 모양·빛깔이 다른 여섯 가지를 섞어 쓴다(다 똑같아 보였다, 사용자). 윗면은 평평하게 깎아 앉을 자리로
// 모델 크기 배율 — 대본의 자리는 작은 인형에 맞춰 짜여 몸이 큰 모델끼리 겹치고 소품을 뚫었다. 0.9로 줄였다(사용자 2026-11). 주소의 ?mscale=로 견주어 본다
export const MS = +(new URLSearchParams(location.search).get('mscale') || 0.9);
const STONE_C = ['#8f8573', '#a39a86', '#7d776b', '#9b8a72', '#b0a58f', '#857d70'];
const STONES = STONE_C.map((c, k) => {
  let s = 97 + k * 131; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const g = new THREE.IcosahedronGeometry(0.5, 1), p = g.attributes.position, v = new THREE.Vector3();
  const w = 0.8 + rnd() * 0.45, d = 0.75 + rnd() * 0.4, cut = 0.22 + rnd() * 0.12;
  const seen = new Map();   // 같은 자리의 꼭짓점은 같이 움직여야 틈이 안 난다
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i); const key = v.toArray().map(n => n.toFixed(3)).join();
    if (!seen.has(key)) seen.set(key, 0.82 + rnd() * 0.3);
    v.multiplyScalar(seen.get(key)); v.x *= w; v.z *= d; v.y = Math.min(v.y, cut + (v.x + v.z) * 0.04);
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeBoundingBox(); const b = g.boundingBox; g.translate(0, -b.min.y, 0); g.scale(1, 1 / (b.max.y - b.min.y), 1); g.computeVertexNormals();
  return [g, new THREE.MeshStandardMaterial({ color: c, roughness: 1, flatShading: true })];
});
// 앉은 몸의 엉덩이 밑면(돌 윗면이 될 높이) — 엉덩이 뼈 바로 밑 둘레의 피부 꼭짓점 중 가장 낮은 것. 뼈 높이에서 어림했더니 돌이 엉덩이를 뚫었다(사용자)
const seatBottom = (body, hips, R) => {
  const h = hips.getWorldPosition(new THREE.Vector3()), v = new THREE.Vector3(); let low = Infinity;
  // 엉덩이 뼈에 가장 크게 붙은 꼭짓점만 — 늘어진 겉옷 자락(다리 뼈에 붙음)까지 재니 돌이 한참 낮았다
  body.traverse(o => { if (!o.isSkinnedMesh) return; const n = o.geometry.attributes.position.count, hi = o.skeleton.bones.indexOf(hips);
    if (hi < 0) return; const si = o.geometry.attributes.skinIndex, sw = o.geometry.attributes.skinWeight;
    for (let i = 0; i < n; i++) { let best = 0, bi = -1; for (let k = 0; k < 4; k++) { const w = sw.getComponent(i, k); if (w > best) { best = w; bi = si.getComponent(i, k); } }
      if (bi !== hi) continue; o.getVertexPosition(i, v); o.localToWorld(v);
      if (v.y < h.y && Math.hypot(v.x - h.x, v.z - h.z) < R && v.y < low) low = v.y; } });
  return low;
};
// 회당·집 같은 건물이 있는 장면은 돌 대신 네모난 의자(사용자 2026-11: 건물 곁은 정육면체 의자, 산·들은 돌) — 무대가 장면마다 정한다
const BLOCK = (() => { const g = new THREE.BoxGeometry(1, 1, 1); g.translate(0, 0.5, 0); return g; })(), BLOCK_M = new THREE.MeshStandardMaterial({ color: '#b39b74', roughness: 0.95 });
const WOOD_M = new THREE.MeshStandardMaterial({ color: '#7a5434', roughness: 0.9 }); // 배 위의 나무 걸상
let SEAT_BLOCK = false;
export const seatBlocks = on => { SEAT_BLOCK = !!on; };
let stoneN = 0;
// 돌을 앉은 사람 엉덩이 밑, 몸이 보는 쪽의 조금 뒤에 몸과 같은 방향으로 놓는다(부모 좌표 기준 z로 밀었더니 옆으로 비켜났다)
const fq = new THREE.Quaternion(), fd = new THREE.Vector3();
const seatStone = (stone, hips, parent, hp, top, H) => {
  // 앞쪽 = 엉덩이에서 두 무릎 가운데로 (엉덩이 뼈의 축은 모델마다 달라 의자가 앞으로 밀려났다)
  const knees = stone.userData.knees || (stone.userData.knees = hips.children.filter(b => /UpLeg$/.test(b.name)).map(b => b.children.find(c => c.isBone)).filter(Boolean));
  fd.set(0, 0, 0); for (const k of knees) fd.add(parent.worldToLocal(k.getWorldPosition(fq._v || (fq._v = new THREE.Vector3()))));
  if (knees.length) fd.multiplyScalar(1 / knees.length).sub(hp); fd.setY(0);
  if (fd.lengthSq() < 1e-8) fd.set(0, 0, 1); fd.normalize();
  stone.userData.hips = hips;
  if (!stone.userData.g) stone.userData.g = [stone.geometry, stone.material];
  // 배 위면 나무 걸상 (배 안에 돌이 깔려 있었다, 사용자 2026-11)
  let onBoat = false; for (let q = parent; q; q = q.parent) if (q.userData.deck) { onBoat = true; break; }
  const block = SEAT_BLOCK || onBoat;
  [stone.geometry, stone.material] = onBoat ? [BLOCK, WOOD_M] : SEAT_BLOCK ? [BLOCK, BLOCK_M] : stone.userData.g;
  stone.position.set(hp.x - fd.x * 0.012 * H, 0, hp.z - fd.z * 0.012 * H); stone.rotation.y = Math.atan2(fd.x, fd.z) + (block ? 0 : stone.userData.tw);
  if (block) stone.scale.set(H * 0.2, top, H * 0.2); else stone.scale.set(H * 0.28, top, H * 0.2); stone.visible = true;   // 넓적하게 — 좁으면 기둥처럼 섰다(사용자)
};
const newStone = () => { const [g, m] = STONES[stoneN++ % STONES.length], o = new THREE.Mesh(g, m);
  o.userData.tw = (stoneN * 0.61) % 0.5 - 0.25; o.castShadow = o.receiveShadow = true; o.visible = false; return o; };
const MARCH = new Set(['soldier', 'guard', 'centurion']); // 발을 맞춰 걷는 사람들
const HOLD = new Set(['carry', 'carry-pole', 'offer', 'hold']); // 두 팔로 안거나 받쳐 드는 자세
const SEAT = new Set(['ride', 'seat']), SITS = new Set(['sit', 'sit-speak', 'sit-ground'])
const bone = (root, n) => { let f = null; root.traverse(o => { if (!f && o.isBone && new RegExp(`(^|mixamorig)${n}$`).test(o.name)) f = o; }); return f; };
const DOWN = new THREE.Vector3(0, -1, 0);
// 밝게: 모델 텍스처는 차분한 색인데 무대 조명은 밝은 단색 인형에 맞춰져 있어 사람만 어둡게 보였다(사용자 2026-11).
// 그림 색 그대로 은은하게 스스로 빛나게(emissiveMap) 그늘을 들어 올린다 — 재질은 원본마다 한 번만 바꿔 함께 쓴다
const LIFT = 0.32, lit = new Map();
function brighten(m) {
  if (!m.map) return m;
  if (!lit.has(m)) { const n = m.clone(); n.emissive = new THREE.Color(1, 1, 1); n.emissiveMap = m.map; n.emissiveIntensity = LIFT; lit.set(m, n); }
  return lit.get(m);
}
const v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), v3 = new THREE.Vector3(), q1 = new THREE.Quaternion(), q2 = new THREE.Quaternion(), q3 = new THREE.Quaternion();

// 인형 키 (서 있을 때 정수리 높이) — 모델을 이만큼으로 맞춘다
const dollH = {};
export function dollHeight(type) {
  if (dollH[type]) return dollH[type];
  // 보통 어른(man)의 키에 그 인형의 키 비율(height)만 곱한다 — 인형 전체 크기로 재니 몸 둘레의 빛(glow, 변화산의 모세·엘리야)까지 들어가 거인이 되었다(사용자 2026-11)
  if (!dollH.man) { const d = new Actor('man'); d.settle(); d.p.root.updateMatrixWorld(true); dollH.man = new THREE.Box3().setFromObject(d.p.root).max.y; }
  return (dollH[type] = dollH.man * (TYPES[type]?.height || 1));
}

// 뼈(b)가 자식 쪽으로 가리키는 방향을 dir(세계 좌표)로 w만큼 돌린다
function aimBone(b, child, dir, w = 1) {
  b.updateWorldMatrix(true, false);
  const from = child.getWorldPosition(v1).sub(b.getWorldPosition(v2)).normalize();
  q1.setFromUnitVectors(from, dir);                      // 세계에서 더 돌릴 만큼
  b.getWorldQuaternion(q2); q1.multiply(q2);               // 새 세계 회전
  b.parent.getWorldQuaternion(q3).invert(); q3.multiply(q1); // 부모 기준으로
  b.quaternion.slerp(q3, w);
  b.updateMatrixWorld(true);
}

const merged = new WeakMap();
function withBorrowed(gltf, body, borrow = {}) {
  const need = Object.entries(borrow).filter(([n, d]) => d && !gltf.animations.some(c => c.name === n));
  if (!need.length) return gltf;
  const key = need.map(([n]) => n).join(), have = merged.get(gltf) || {}; if (have[key]) return have[key];
  const anims = [...gltf.animations];
  for (const [n, donor] of need) {
    const c = donor.animations.find(c => c.name === n); if (!c) continue;
    const hr = bone(gltf.scene, 'Hips')?.position.length(), hd = bone(donor.scene, 'Hips')?.position.length(), k = hr && hd ? hr / hd : 1;
    anims.push(new THREE.AnimationClip(n, c.duration, c.tracks.filter(t => gltf.scene.getObjectByName(t.name.split('.')[0])).map(t => {
      const [bn, prop] = t.name.split('.'), u = t.clone();
      if (/Hips/.test(bn) && prop === 'position') { u.values = u.values.map(v => v * k); return u; }
      if (prop !== 'quaternion') return null; // 다른 뼈의 위치·크기는 빼고 이 모델의 뼈 길이 그대로 — 남의 뼈 길이가 들어가 천사의 팔이 늘어났다(사용자 2026-11)
      return t; // 같은 Mixamo 뼈대라 각도는 그대로 — '기본 자세에서 돈 만큼'으로 옮기니 웅크려 자던 요셉이 통나무처럼 펴졌다(사용자 2026-11)
    }).filter(Boolean)));
  }
  have[key] = { scene: gltf.scene, animations: anims }; merged.set(gltf, have); return have[key];
}
// 제자리에서 꿇기: Mixamo의 꿇기 동작은 엉덩이를 앞으로 0.3쯤 옮겨, 꿇는 사람이 앞사람 쪽으로 미끄러져 겹쳤다(e08 세례 요한, 사용자 2026-11).
// 엉덩이의 앞뒤·좌우 움직임은 서 있을 때(처음 열쇠의 기본 자세가 아니라 모델의 뼈 자리) 그대로 두고 높이만 동작대로
function inPlace(clip, rest) {
  if (!rest) return clip;
  return new THREE.AnimationClip(clip.name, clip.duration, clip.tracks.map(k => {
    if (!/Hips\.position$/.test(k.name)) return k;
    const V = Array.from(k.values); for (let i = 0; i < V.length; i += 3) { V[i] = rest.x; V[i + 2] = rest.z; }
    return new THREE.VectorKeyframeTrack(k.name, Array.from(k.times), V);
  }));
}
export class StageModel {
  constructor(gltf, type, x = 0, z = 0, face = 0, o = {}) {
    this.doll = o.doll || new Actor(type, x, z, face, o); // 보이지 않는 길잡이 (장면에 넣지 않는다) — o.doll: 낭독 중에 모델이 늦게 와서 서 있던 인형을 그대로 길잡이로
    this.type = type;
    this.H = dollHeight(type) * MS;
    this.still = !!o.still; // 아무 동작 없이 모델을 뜬 자세 그대로
    const body = clone(gltf.scene);
    body.updateMatrixWorld(true);
    const top = bone(body, 'HeadTop_End'), h = top ? top.getWorldPosition(v1).y : 1.7;
    body.scale.setScalar(dollHeight(type) * MS * 0.97 / (h > 0.1 ? h : 1.7));
    this.mats = [];
    body.traverse(m => { if (m.isMesh) { m.frustumCulled = false; m.material = brighten(m.material).clone(); this.mats.push(m.material); } });
    this.p = { root: new THREE.Group() }; this.p.root.add(body);
    this.mixer = new THREE.AnimationMixer(body);
    // 없는 동작(잠자기·무릎 꿇고 기도, 천사의 서기·말하기)은 같은 Mixamo 뼈대의 다른 모델에서 빌린다 — 요셉이 잘 때 인형처럼 몸을 통째로 눕혀 어색했다(사용자 2026-11).
    // 뼈 회전은 그대로, 엉덩이 위치만 두 모델의 엉덩이 높이 비로 맞춘 뒤 이 모델의 기본 자세로 곧게 세운다(calmClips)
    this.acts = Object.fromEntries(calmClips(withBorrowed(gltf, body, o.borrow)).map(c => [c.name, this.mixer.clipAction(c)])); // 차분한 말하기·끊김 없는 되풀이·곧게 서기 (game-model.js)
    // 베개: 누워 잘 때 머리 밑에 (막 4:38, 사용자 2026-11)
    const H = dollHeight(type) * MS;
    this.pillow = new THREE.Mesh(new THREE.CapsuleGeometry(H * 0.032, H * 0.09, 4, 12), new THREE.MeshStandardMaterial({ color: '#efe2c2', roughness: 1 }));
    this.pillow.rotation.z = Math.PI / 2; this.pillow.scale.set(1, 1, 0.6); this.pillow.visible = false; this.pillowY = H * 0.022;
    this.p.root.add(this.pillow);
    this.cur = null; this.w = 0; this.op = -1;
    if (o.still) this.acts = {};
    // 무릎 꿇는 동작('pray')은 앉았다(1.9초까지)·꿇은 채(4.6초까지)·일어남이 한 번에 들어 있어, 되풀이하면 꿇었다 일어났다를 거듭했다
    // (스데반·다메섹 길의 바울, 사용자 2026-11) — 꿇은 채 머무는 가운데 토막만 되풀이한다
    if (this.acts.pray) { const c = this.acts.pray.getClip(); if (c.duration > 5) this.acts.pray = this.mixer.clipAction(inPlace(THREE.AnimationUtils.subclip(c, 'pray-hold', 57, 138, 30), bone(body, 'Hips')?.position.clone())); }
    this.march = MARCH.has(type); this.stride = Math.random(); this.pace = 0.9 + Math.random() * 0.2;
    // 인형의 왼팔·오른팔이 모델의 어느 팔인지는 자리(x)로 맞춘다 (서로 앞을 보는 쪽이 같다)
    const L = { up: bone(body, 'LeftArm'), lo: bone(body, 'LeftForeArm'), hand: bone(body, 'LeftHand'), mid: bone(body, 'LeftHandMiddle1'), thumb: bone(body, 'LeftHandThumb1') };
    const R = { up: bone(body, 'RightArm'), lo: bone(body, 'RightForeArm'), hand: bone(body, 'RightHand'), mid: bone(body, 'RightHandMiddle1'), thumb: bone(body, 'RightHandThumb1') };
    const dl = this.doll.p.armL.position.x > 0;
    this.arms = [[this.doll.p.armL, dl === (L.up.getWorldPosition(v1).x > 0) ? L : R], [this.doll.p.armR, dl === (L.up.getWorldPosition(v1).x > 0) ? R : L]];
    for (const [, mb] of this.arms) if (mb.hand) mb.hand0 = mb.hand.quaternion.clone(); // 손목의 기본 자세 (곧게 편 손)
    this.legs = [['Left'], ['Right']].map(([s]) => ({ up: bone(body, s + 'UpLeg'), lo: bone(body, s + 'Leg'), foot: bone(body, s + 'Foot'), toe: bone(body, s + 'ToeBase'), tip: bone(body, s + 'Toe_End') }));
    const hips = bone(body, 'Hips'); this.hipH = hips ? hips.getWorldPosition(v1).y * body.scale.x / (body.scale.x || 1) : 0.5; this.body = body; this.legW = 0;
    this.stone = newStone(); this.p.root.add(this.stone); this.hipsB = bone(body, 'Hips');
    this.headB = bone(body, 'Head'); this.neckB = bone(body, 'Neck'); this.spineB = bone(body, 'Spine1') || bone(body, 'Spine'); this.topB = bone(body, 'HeadTop_End');
    // 날개(천사): 뼈 없는 따로 뜬 모델을 등(Spine2) 자리에 매 화면 붙인다 — 몸통만 따라가고 팔과는 상관없다
    if (o.wings) { this.wings = clone(o.wings.scene); this.wings.traverse(m => { if (m.isMesh) { m.frustumCulled = false; m.material = brighten(m.material).clone(); this.mats.push(m.material); } }); this.p.root.add(this.wings); this.wingB = bone(body, 'Spine2') || this.spineB; }
    this.play('idle', 0);
    this.takeProps();
  }
  // 대본이 쓰는 것들은 인형에게 넘긴다
  get pos() { return this.doll.pos; } get goal() { return this.doll.goal; }
  get face() { return this.doll.face; } set face(v) { this.doll.face = v; }
  get faceT() { return this.doll.faceT; } set faceT(v) { this.doll.faceT = v; }
  get pose() { return this.doll.pose; }
  get show() { return this.doll.show; } set show(v) { this.doll.show = v; }
  get showT() { return this.doll.showT; } set showT(v) { this.doll.showT = v; }
  get y() { return this.doll.y; } set y(v) { this.doll.y = v; }
  get yT() { return this.doll.yT; } set yT(v) { this.doll.yT = v; }
  get item() { return this.doll.item; } set item(v) { this.doll.item = v; }
  get target() { return this.doll.target; } set target(v) { this.doll.target = v; }
  get talkTo() { return this.doll.talkTo; } set talkTo(v) { this.doll.talkTo = v; }
  get ground() { return this.doll.ground; } set ground(v) { this.doll.ground = v; }
  get big() { return this.doll.big; } set big(v) { this.doll.big = v; }
  get speed() { return this.doll.speed; } set speed(v) { this.doll.speed = v; }
  get realWalk() { return this.doll.realWalk; } set realWalk(v) { this.doll.realWalk = v; }
  // 무대가 읽는 것: 높이를 정한 사람(단 위·십자가 위)은 3D 지형에서 사람을 키울 때 그 높이도 함께 올린다 — 없으면 단 위의 사람 발이 바닥에 묻혔다
  get fixedY() { return this.doll.fixedY; } get floating() { return this.doll.floating; } get kneel() { return this.doll.kneel; }
  set(p) { this.doll.set(p); }
  moveTo(x, z) { this.doll.moveTo(x, z); }
  look(d) { this.doll.look(d); }
  settle() { const s = this.show; for (let i = 0; i < 60; i++) this.update(i * 0.05, 0.05); this.show = s; this.fadeTo(Math.min(1, s)); }
  play(name, fade = 0.35) {
    const a = this.acts[name] || this.acts.idle;
    if (!a) { if (this.cur) { this.cur.fadeOut(fade); this.cur = null; } return; } // 서 있는 동작이 없는 모델(천사)은 뜬 자세(A자) 그대로
    if (a === this.cur) return;
    a.reset().setEffectiveWeight(1).play();
    // 여럿이 함께 걸을 때 발이 똑같이 맞으면 행진 같다 — 보통 사람은 걸음의 시작과 빠르기를 저마다 조금씩 달리, 병정만 발을 맞춘다(사용자 2026-11)
    if (name === 'walk' && !this.march) { a.time = this.stride * a.getClip().duration; a.timeScale = this.pace; } else a.timeScale = 1;
    if (this.cur) this.cur.crossFadeTo(a, fade, false); this.cur = a;
  }
  // 나타나고 사라질 때: 인형처럼 점묘 투명도(alphaHash)
  fadeTo(op) {
    if (Math.abs(op - this.op) < 0.004) return;
    const solid = op > 0.995;
    this.mats.forEach(m => { if (m.alphaHash !== !solid) { m.alphaHash = !solid; m.needsUpdate = true; } m.opacity = solid ? 1 : op; });
    this.op = op;
  }
  aim(b, child, dir, w) { aimBone(b, child, dir, w); }
  // 기도하는 한 팔: 팔꿈치는 몸 옆에 내리고, 손목은 가운데(두 손바닥이 맞닿을 자리 — 손 두께만큼 조금 넘겨)로, 손끝은 위로 조금 앞을 향해
  prayArm(mb, side, r, qb) {
    const k = this.prayK, w = this.w;
    this.aim(mb.up, mb.lo, new THREE.Vector3(side * 0.08, -1, 0.3).normalize().applyQuaternion(qb), w);
    const wrist = this.prayAt.clone().add(new THREE.Vector3(-side * 0.012 * k, 0, 0).applyQuaternion(qb));
    this.aim(mb.lo, mb.hand, wrist.sub(mb.lo.getWorldPosition(v1)).normalize(), w);
    if (!mb.mid) return;
    this.aim(mb.hand, mb.mid, new THREE.Vector3(-side * 0.3, 0.9, 0.4).normalize().applyQuaternion(qb), w);
    // 손가락 쪽을 축으로 손을 돌려 엄지가 가슴 쪽을 보게 — 그러면 두 손바닥이 마주 본다. 같은 각도로 돌리니 모델마다 손 뼈의 축이 달라
    // 순례자는 손바닥이 앞을 보았다 — 엄지 방향을 재어 돌린다
    if (!mb.thumb) return;
    const hp = mb.hand.getWorldPosition(new THREE.Vector3()), f = mb.mid.getWorldPosition(v1).sub(hp).normalize();
    const flat = v => v.sub(f.clone().multiplyScalar(v.dot(f))).normalize();
    const t = flat(mb.thumb.getWorldPosition(v3).sub(hp)), want = flat(new THREE.Vector3(0, 0, -1).applyQuaternion(qb));
    const ang = Math.atan2(f.dot(t.clone().cross(want)), t.dot(want)), pw = mb.hand.parent.getWorldQuaternion(new THREE.Quaternion());
    const q = new THREE.Quaternion().setFromAxisAngle(f, ang * w);
    mb.hand.quaternion.premultiply(pw.clone().invert().multiply(q).multiply(pw));
  }
  // 손에 드는 것: 인형의 것(빵·아기·바구니·두루마리·지팡이·창·뿔·칼…)을 그대로 가져와 모델의 손에 옮겨 붙인다 —
  // 보이고 감추는 것은 인형이 자세에 따라 그대로 정한다. 한 손 것은 그 손에, 두 손으로 받쳐 드는 것은 두 손 사이에, 지팡이·창은 손 옆 땅에
  takeProps() {
    const P = this.doll.p, elbowL = P.armL.userData.elbow, elbowR = P.armR.userData.elbow;
    this.props = [];
    const take = (o, kind, side) => { if (!o) return; o.removeFromParent(); this.p.root.add(o); this.props.push({ o, kind, side, q0: o.quaternion.clone(), p0: o.position.clone() }); };
    for (const [e, side] of [[elbowL, 0], [elbowR, 1]]) [...e.children].forEach(o => { if (o.isGroup || o === P.armL.userData.loaf || o === P.armR.userData.loaf) take(o, 'hand', side); });
    [...Object.values(P.items || {}), P.baby].forEach(o => take(o, 'both'));
    if (P.staff) take(P.staff, 'staff', 1);
    if (P.glow) take(P.glow, 'glow');
  }
  placeProps() {
    if (!this.props?.length) return;
    const r = this.p.root, dr = this.doll.p.root; r.updateMatrixWorld(true); dr.updateMatrixWorld(true);
    const inv = r.matrixWorld.clone().invert(), qr = r.getWorldQuaternion(new THREE.Quaternion()), qd = dr.getWorldQuaternion(new THREE.Quaternion()).invert();
    // 손바닥 가운데(손목 뼈와 가운뎃손가락 뿌리 사이) — 손목 뼈 자리에 붙이니 두루마리가 손목에 끼어 보였다(사용자 2026-11)
    const handAt = i => { const m = this.arms[i][1]; if (!m.hand) return null; const h = m.hand.getWorldPosition(new THREE.Vector3()); if (m.mid) h.lerp(m.mid.getWorldPosition(new THREE.Vector3()), 0.75); return h.applyMatrix4(inv); };
    for (const it of this.props) {
      const { o, kind, side } = it;
      if (!o.visible) continue;
      if (kind === 'hand') { // 인형 팔뚝의 방향 그대로 (모델 팔뚝을 그 방향으로 맞춰 두었다)
        const h = handAt(side); if (!h) continue; o.position.copy(h);
        const e = this.doll.p[side ? 'armR' : 'armL'].userData.elbow;
        o.quaternion.copy(qr).invert().multiply(qr).multiply(qd).multiply(e.getWorldQuaternion(new THREE.Quaternion())).multiply(it.q0);
      } else if (kind === 'both') { const a = handAt(0), b = handAt(1); if (!a || !b) continue;
        // 두 손이 벌어지면(말하며 팔을 펼 때) 한가운데는 가슴 앞 허공 — 두루마리가 가슴에서 튀어나와 보였다(사용자 2026-11). 그땐 오른손에
        const apart = a.distanceTo(b) > 0.3 * this.H; if (apart) o.position.copy(b); else { o.position.copy(a).add(b).multiplyScalar(0.5); o.position.y += 0.02; o.position.z += 0.07 * this.H; } o.quaternion.copy(it.q0); } // 두 손 사이 조금 앞 — 손 사이 그대로면 두루마리가 팔뚝에 박혔다(e16, 사용자 2026-11)
      else if (kind === 'staff') { // 손 옆에 세워 땅을 짚는다. 눕거나 나무 위·엎드려 울 때, 기도할 때(두 손을 모은다)는 내려놓는다(허공에 서 있었다)
        const h = handAt(1); if (!h || ['sleep', 'perch', 'mourn', 'kneel', 'pray'].includes(this.doll.pose)) { o.visible = false; continue; } o.position.set(h.x, 0, h.z); }
      else if (kind === 'glow') o.position.set(0, it.p0.y + 0.1, it.p0.z);
    }
  }
  // 높이 든 손의 손바닥(세계 좌표) — 소품(세례 물병)을 그 손에 들린다
  raisedHand() { const hs = this.arms.map(([, m]) => { if (!m.hand) return null; const h = m.hand.getWorldPosition(new THREE.Vector3()); if (m.mid) h.lerp(m.mid.getWorldPosition(new THREE.Vector3()), 0.75); return h; }).filter(Boolean);
    return hs.length ? hs.reduce((a, b) => (b.y > a.y ? b : a)) : null; }
  update(time, dt) { this.posture(time, dt); this.toGround(); this.placeProps(); this.placePillow(); this.placeWings(); }
  placeWings() {
    if (!this.wings || !this.wingB) return;
    const r = this.p.root; r.updateMatrixWorld(true);
    const k = this.body.scale.x, v = r.worldToLocal(this.wingB.getWorldPosition(v1));
    this.wings.scale.setScalar(k * WING.scale); // 날개 모델은 미터 단위(높이 0.95) — 몸 모델(1.7m)과 같은 배율로
    this.wings.position.set(v.x, v.y + k * WING.y, v.z - k * WING.back); // 등뼈에서 조금 아래·뒤 (견갑골)
    this.wings.rotation.set(0, WING.turn, 0);
  }
  placePillow() {
    const on = this.doll.pose === 'sleep' && !!this.acts.sleep && this.doll.goal.distanceTo(this.doll.pos) <= 0.02 && this.headB; this.pillow.visible = !!on;
    if (!on) return;
    // 잠자는 동작은 머리를 땅에서 들고 있어(옆으로 누워 팔을 괸 모습), 땅에 둔 납작한 베개와 머리 사이가 떠 보였다(사용자 2026-11) —
    // 머리 가운데 바로 밑에, 둥글게 만 겉옷 뭉치를 땅에서 머리 밑까지 차도록 키워 둔다
    const r = this.p.root; r.updateMatrixWorld(true);
    const a = r.worldToLocal(this.headB.getWorldPosition(v1)), t = this.topB ? r.worldToLocal(this.topB.getWorldPosition(v2)) : a.clone();
    const c = a.clone().add(t).multiplyScalar(0.5), rad = a.distanceTo(t) * 0.45, d = this.pillowY / 0.022 * 0.064; // c: 머리 가운데, d: 베개 기본 두께
    const bottom = c.y - rad, k = THREE.MathUtils.clamp(bottom / d, 1, 2.8);
    this.pillow.scale.set(k, 1.1, 0.75 * k); this.pillow.position.set(c.x, Math.max(d * k / 2, bottom - d * k / 2), c.z); this.pillow.rotation.y = Math.atan2(c.x, c.z);
  }
  // 땅 딛기: 땅에 서거나 앉거나 꿇는 자세면 가장 낮은 무릎·발·발끝이 땅에 닿게 몸 높이를 맞춘다 — 모델마다 동작의 높이가 조금씩 달라
  // 묻히거나(마리아의 무릎 꿇기) 떠 보였다. 높이를 정한 사람·나무 위·누운 사람·걸터앉은 사람·날아 있는 것은 그대로
  toGround() {
    const d = this.doll;
    const lying = d.pose === 'sleep' && this.acts.sleep && d.goal.distanceTo(d.pos) <= 0.02; // 잠자기 동작(빌린 것 포함)으로 누우면 몸 전체의 가장 낮은 뼈를 땅에 — 엉덩이 높이가 모델마다 달라 떠 있었다(요셉)
    if (d.floating || (d.yT || 0) > 0.05 || (!lying && ['sleep', 'perch', 'seat', 'ride', 'crucified', 'crucified-dead'].includes(d.pose)) || this.body.rotation.x) return;
    const r = this.p.root; r.updateMatrixWorld(true);
    let low = Infinity;
    // 누우면 몸(살)의 가장 낮은 점을 땅에 — 가장 낮은 뼈로 맞추니 살 밖으로 삐져나온 뼈가 있는 모델은 몸이 떠 있었다(e18 시몬의 장모, 사용자 2026-11).
    if (lying) { const hy = this.hipsB.getWorldPosition(v1).y, k = r.getWorldScale(v2).y;
      // 매 화면 잰다(꼭짓점은 띄엄띄엄) — 0.5초마다 재니 그 사이엔 예전 값이라 누운 사람이 떴다가 내려앉고(배에서 주무시는 예수님, 사용자 2026-11),
      // 처음 잴 때까지는 짐작값이라 처음에 떠 있었다. 사람(root) 기준 높이로 재서 배가 흔들려도 같은 값
      { let lo = Infinity; this.body.updateMatrixWorld(true); r.updateMatrixWorld(true); const ri = new THREE.Matrix4().copy(r.matrixWorld).invert();
        this.body.traverse(o => { if (!o.isSkinnedMesh) return; const n = o.geometry.attributes.position.count, st = Math.max(1, Math.floor(n / 600)); for (let i = 0; i < n; i += st) { o.getVertexPosition(i, v3); o.localToWorld(v3).applyMatrix4(ri); lo = Math.min(lo, v3.y); } });
        const hl = v2.copy(this.hipsB.getWorldPosition(v2)).applyMatrix4(ri).y; if (lo < Infinity) this.lieDrop = hl - lo; }
      low = hy - (this.lieDrop ?? 0.1) * k; }
    else for (const l of this.legs) for (const b of [l.lo, l.foot, l.toe, l.tip]) if (b) low = Math.min(low, b.getWorldPosition(v1).y); // 발끝 뼈(Toe_End)까지
    if (low === Infinity) return;
    const k = r.getWorldScale(v2).y, want = r.getWorldPosition(v1).y + (lying ? 0.004 : 0.012) * k; // 발목 뼈는 발바닥보다 조금 위 (누우면 살이 땅에 바로)
    this.body.position.y -= (low - want) / k;
  }
  posture(time, dt) {
    const d = this.doll; d.update(time, dt);
    const r = this.p.root, dr = d.p.root, moving = d.goal.distanceTo(d.pos) > 0.02;
    r.position.copy(dr.position); r.rotation.copy(dr.rotation);
    // 말하거나 듣는 사람은 상대 쪽으로 몸을 온전히 돌린다 — 미니어처 인형은 얼굴이 보이게 앞쪽(±1.15)까지만 돌았는데,
    // 사람 비율의 모델이 그대로 따르니 엉뚱한 곳을 보고 말했다(사용자 2026-11). 걷거나 눕거나 엎드린 때는 인형 그대로
    { const t = d.talkTo || d.target, keep = moving || d.floating || ['sleep', 'perch', 'mourn', 'crucified', 'crucified-dead', 'ride', 'carry-pole'].includes(d.pose);
      let want = dr.rotation.y;
      if (t && t.showT > 0.5 && !keep) want = Math.atan2(t.pos.x - d.pos.x, t.pos.y - d.pos.y);
      this.yaw ??= want; this.yaw += Math.atan2(Math.sin(want - this.yaw), Math.cos(want - this.yaw)) * (1 - Math.exp(-6 * dt));
      r.rotation.y = this.yaw; } r.scale.copy(dr.scale); r.visible = dr.visible;
    this.fadeTo(Math.min(1, d.show));
    // 두루마리처럼 두 손으로 받쳐 든 채 말하면(읽으면) 손짓 없이 가만히 두 손에 들고 — 말하기 동작의 손짓에 두루마리가 이리저리 흔들렸다(e16, 사용자 2026-11)
    const reading = d.pose === 'speak' && d.item && !['oilhorn', 'sling', 'sword', 'bow', 'shield', 'hem'].includes(d.item);
    const walk = moving && !d.floating, clip = walk ? 'walk' : reading ? null : CLIP[d.pose], kneel = !walk && KNEEL.has(d.pose), onSeat = SITS.has(d.pose) && (d.yT || 0) > 0.05, ride = !walk && (SEAT.has(d.pose) || onSeat), perch = !walk && d.pose === 'perch';
    // 무릎 꿇는 동작('pray')이 없는 모델(순례자·어부 등 엑스트라)은 다리를 직접 접어 발뒤꿈치에 앉힌다 — 동작 없이 서 있었다
    // 땅에 앉기는 양반다리, 무릎 꿇기(꿇는 동작이 없는 모델)는 발뒤꿈치를 깔고
    const cross = !walk && SITS.has(d.pose) && !onSeat, seiza = !walk && ((kneel && !this.acts.pray) || cross);
    this.play(clip || (kneel && !seiza ? 'pray' : 'idle'));
    // 손으로 돌린 뼈는 매 화면 기본 자세에서 다시 시작한다 — 동작에 기록이 없는 뼈(줄인 모델의 다리·손목)는 한 번 접으면 그대로 남아,
    // 앉았다 일어선 사람이 무릎을 굽힌 채 떠 있었다(사용자 2026-11)
    if (!this.rest) { this.rest = []; const add = b => b && this.rest.push([b, b.quaternion.clone()]); this.legs.forEach(l => [l.up, l.lo, l.foot].forEach(add)); this.arms.forEach(([, m]) => [m.up, m.lo, m.hand].forEach(add)); [this.headB, this.neckB, this.spineB].forEach(add); }
    for (const [b, q] of this.rest) b.quaternion.copy(q);
    this.mixer.update(dt);
    // 빌린 무릎 꿇기(기도) 동작이면 발등을 뒤로 눕혀 바닥에 편다 — 다른 모델의 발 각도라 발끝이 뒤에서 위로 들렸다(e02 목자, 사용자 2026-11)
    if (this.cur === this.acts.pray && kneel) { const r0 = this.p.root; r0.updateMatrixWorld(true); const back = new THREE.Vector3(0, 0.25, -1).normalize().applyQuaternion(r0.getWorldQuaternion(new THREE.Quaternion()));
      // 정강이도 땅에 눕힌다 — 빌린 동작은 다리 길이가 달라 무릎에서 정강이가 뒤로 치켜 올라가 발바닥이 하늘을 봤다(사용자 2026-11: 발목을 펴서 발등이 땅에)
      // 넓적다리는 곧게 세우고 정강이는 땅과 나란히 — 몸과 정강이가 90도(사용자 2026-11: 70도처럼 보였다)
      const qk = r0.getWorldQuaternion(new THREE.Quaternion()), flat = new THREE.Vector3(0, 0, -1).applyQuaternion(qk), upright = new THREE.Vector3(0, -1, 0.04).normalize().applyQuaternion(qk);
      for (const l of this.legs) { if (l.up && l.lo) this.aim(l.up, l.lo, upright, 1); if (l.lo && l.foot) this.aim(l.lo, l.foot, flat, 1); if (l.foot && l.toe) { l.foot.updateMatrixWorld(true); this.aim(l.foot, l.toe, back, 1); } } }
    if (this.still) return; // 천사: 몸도 팔도 돌리지 않는다
    // 동작이 없는 자세는 인형의 팔을 따른다 (천천히 들어가고 나온다)
    // 아기·물건을 두 팔로 안은 사람(carry)은 걸을 때도 팔을 인형대로 — 걷기 동작대로 두 팔을 흔들어 아기가 배에 붙어 있었다(사용자 2026-11)
    const hold = HOLD.has(d.pose);
    this.w = damp(this.w, this.still || (clip && !(walk && hold)) || perch ? 0 : 1, 6, dt); // still: 팔을 돌리지 않는 모델(천사)
    // 걸터앉기·나귀 타기: 넓적다리를 앞으로, 정강이는 아래로 하고 몸을 인형처럼 내려 앉힌다 (모델에 앉는 동작이 없다)
    this.legW = damp(this.legW, ride ? 1 : 0, 6, dt);
    this.body.position.y = -this.hipH * 0.58 * (d.kneel || 0) * this.legW;
    // 의자·걸상에 걸터앉기(높이를 정한 사람): 엉덩이 뼈가 앉는 높이(root) + 0.09·H에 오게(군중의 걸상과 같은 셈) — 인형처럼 몸을 일정하게만 내리니
    // 엉덩이가 방석보다 한 뼘 위 허공에 떠 앉았다(a08 총독, 사용자 2026-11)
    if (onSeat && this.hipsB) { const r0 = this.p.root; this.body.position.y = 0; r0.updateMatrixWorld(true);
      const hy = r0.worldToLocal(this.hipsB.getWorldPosition(v1)).y; this.body.position.y = -(hy - 0.09 * this.H) * this.legW; }
    // 잠: 잠자는 동작이 없는 모델(베드로 등)은 인형이 눕는 대로 몸을 옆으로 눕힌다 — 서 있는 채 자고 있었다
    const lie = d.pose === 'sleep' && !this.acts.sleep;
    this.body.rotation.z = lie ? d.p.body.rotation.z : 0; this.body.position.x = lie ? d.p.body.position.x : 0;
    if (lie) this.body.position.y += d.p.body.position.y * 0.6 + 0.045 * this.hipH; // 옆으로 누운 몸의 두께만큼 띄운다 (다리가 땅에 묻혔다)
    // 가지에 엎드리기(삭개오, 눅 19:4): 발끝을 축으로 앞으로 눕혀 몸이 가지를 따라 놓이고, 두 팔은 가지를 끌어안고, 고개는 들어 아래를 본다
    this.perchW = damp(this.perchW || 0, perch ? 1 : 0, 5, dt);
    this.body.rotation.x = this.perchW * Math.PI * 0.5;
    this.body.position.y += this.perchW * this.hipH * 0.12;
    if (this.perchW > 0.01) {
      r.updateMatrixWorld(true);
      const qr = r.getWorldQuaternion(new THREE.Quaternion()), hug = new THREE.Vector3(0, -1, 0.25).normalize().applyQuaternion(qr), fore = new THREE.Vector3(0, -0.6, 0.6).normalize().applyQuaternion(qr);
      for (const [, mb] of this.arms) if (mb.up && mb.lo && mb.hand) { this.aim(mb.up, mb.lo, hug, this.perchW); this.aim(mb.lo, mb.hand, fore, this.perchW); }
      if (this.headB) this.headB.rotation.x -= 0.9 * this.perchW;
      if (this.w < 0.01 && this.legW < 0.01) return;
    }
    this.seizaW = damp(this.seizaW || 0, seiza ? 1 : 0, 6, dt);
    if (this.seizaW > 0.01) {
      r.updateMatrixWorld(true);
      const qr = r.getWorldQuaternion(new THREE.Quaternion());
      let knee = Infinity;
      for (const l of this.legs) if (l.up && l.lo && l.foot) {
        const sd = r.worldToLocal(l.up.getWorldPosition(v1)).x > 0 ? 1 : -1; // 몸의 어느 쪽 다리인지
        // 땅에 앉기: 무릎을 세우고 앉는다(넓적다리는 앞으로 조금 들고, 무릎에서 꺾인 정강이는 땅으로) — 양반다리는 긴 겉옷이 두 다리 사이에 늘어나 무릎이 어디서 접혔는지 보이지 않았다(사용자 2026-11) / 꿇어앉기: 넓적다리는 앞으로, 정강이는 뒤로
        const thigh = (cross ? new THREE.Vector3(sd * 0.22, 0.05, 1) : new THREE.Vector3(0, -0.35, 1)).normalize().applyQuaternion(qr);
        const shin = (cross ? new THREE.Vector3(sd * 0.04, -1, 0.08) : new THREE.Vector3(0, -0.04, -1)).normalize().applyQuaternion(qr);
        this.aim(l.up, l.lo, thigh, this.seizaW); this.aim(l.lo, l.foot, shin, this.seizaW);
        // 꿇어앉기: 발등을 뒤로 눕혀 바닥에 편다 — 발이 선 자세의 각도 그대로라 뒤로 누운 정강이 끝에서 발끝이 하늘로 섰다(사용자 2026-11)
        if (!cross && l.toe) this.aim(l.foot, l.toe, new THREE.Vector3(0, 0.25, -1).normalize().applyQuaternion(qr), this.seizaW);
        for (const b of [l.lo, l.foot, l.toe]) if (b) knee = Math.min(knee, b.getWorldPosition(v1).y); } // 무릎·발·발끝 가운데 가장 낮은 곳을 땅에 (무릎만 맞추니 발끝이 묻혔다)
      if (knee < Infinity) this.body.position.y -= (knee - r.getWorldPosition(v2).y) / r.getWorldScale(v1).y - 0.03 * this.hipH;
    }
    // 땅에 앉을 때는 엉덩이 밑에 돌 하나 — 맨땅에 걸터앉은 듯 엉덩이가 떠 보였다(사용자 2026-11: 돌멩이라도 깔고 앉게)
    this.stone.visible = cross && this.seizaW > 0.5;
    if (!this.stone.visible) this.seatT = 0;
    else { r.updateMatrixWorld(true); const hp = r.worldToLocal(this.hipsB.getWorldPosition(v1));
      // 자세가 자리 잡은 뒤 한 번만 잰다(꼭짓점 계산이 무거워서)
      if (++this.seatT === 20 || this.seatT === 60) { const ws = r.getWorldScale(v2).y, low = seatBottom(this.body, this.hipsB, 0.09 * this.H * ws);
        if (low < Infinity) this.seatDrop = (this.hipsB.getWorldPosition(v2).y - low) / ws; }
      const top = Math.max(0.02, hp.y - (this.seatDrop ?? 0.12 * this.H));
      seatStone(this.stone, this.hipsB, r, hp, top, this.H); }
    if (this.w < 0.01 && this.legW < 0.01) return;
    r.updateMatrixWorld(true); dr.updateMatrixWorld(true);
    if (this.legW > 0.01) {
      const qr = r.getWorldQuaternion(new THREE.Quaternion());
      const thigh = new THREE.Vector3(0, -0.25, 1).normalize().applyQuaternion(qr), shin = new THREE.Vector3(0, -1, 0.15).normalize().applyQuaternion(qr);
      const ks = r.getWorldScale(v3).y, ground = r.getWorldPosition(v2).y - (d.y || 0) * ks + 0.045 * ks; // 발이 닿을 땅: root는 땅에서 앉는 높이(y)만큼 올라가 있다 — 발목 뼈는 발바닥보다 발 두께만큼 위(0.01이면 발이 묻혔다)
      for (const l of this.legs) if (l.up && l.lo && l.foot) {
        this.aim(l.up, l.lo, thigh, this.legW); this.aim(l.lo, l.foot, shin, this.legW);
        // 의자가 모델의 정강이보다 낮으면 발이 바닥을 뚫었다(왕좌의 헤롯) — 정강이를 뒤로 접어 발끝이 바닥 위에 오게
        const ky = l.lo.getWorldPosition(v1).y, low = Math.min(l.foot.getWorldPosition(v3).y, l.toe ? l.toe.getWorldPosition(v3).y : Infinity);
        if (low < ground && ky > ground) { const t = Math.max(0.05, (ky - ground) / (ky - low)), back = new THREE.Vector3(0, -t, -Math.sqrt(1 - t * t)).applyQuaternion(qr); this.aim(l.lo, l.foot, back, this.legW); }
      }
    }
    if (this.w < 0.01) return;
    const qm = r.getWorldQuaternion(q2.clone()), qd = dr.getWorldQuaternion(new THREE.Quaternion()).invert();
    // 인형 root 기준의 팔 방향(아래로 뻗은 팔이 가리키는 쪽)을 모델 root에 옮긴다
    const dirOf = (o, v = DOWN) => v.clone().applyQuaternion(o.getWorldQuaternion(new THREE.Quaternion()).premultiply(qd).premultiply(qm));
    // 몸통과 고개도 인형이 가리키는 쪽으로 — 팔만 따르니 절하기·엎드려 울기에서 꼿꼿이 서 있고, 하늘을 우러러도 고개가 들리지 않았다(사용자 2026-11)
    const UP = new THREE.Vector3(0, 1, 0);
    const mourn = d.pose === 'mourn', qb = r.getWorldQuaternion(new THREE.Quaternion());
    // 엎드려 울기: 인형은 몸이 짧아 조금만 숙여도 얼굴이 손에 닿지만 사람 비율의 모델은 훨씬 깊이 숙여야 한다
    if (this.spineB && this.neckB) this.aim(this.spineB, this.neckB, mourn ? new THREE.Vector3(0, 0.55, 0.85).normalize().applyQuaternion(qb) : dirOf(d.p.torso, UP), this.w);
    if (this.headB && this.topB) this.aim(this.headB, this.topB, dirOf(d.p.head, UP), this.w);
    // 땅에 앉거나 무릎 꿇으면 두 손을 넓적다리 위에 가지런히 얹는다 — 인형의 '가슴 앞에 모은 손'을 따르니 손목이 비틀려 무릎 위에서 엉켰다(사용자 2026-11).
    // 엎드려 우는 자세(mourn)는 인형대로
    const lap = this.seizaW > 0.5 && d.pose !== 'mourn';
    const qr = lap && r.getWorldQuaternion(new THREE.Quaternion());
    // 서서 기도: 두 손을 가슴 앞 가운데에 모은다 — 인형의 팔 방향을 그대로 옮기니 사람 비율의 팔뚝이 가운데를 지나쳐 두 손이 엇갈렸다(e18 외딴곳의 기도, 사용자 2026-11)
    // 무릎 꿇기(kneel)도 두 손을 가슴 앞에 모은다 — 빌린 꿇는 동작의 팔이 손바닥을 위로 앞으로 내밀고 있었다(a07, 사용자 2026-11: 예수 여정처럼 두 손 모아)
    const pray = (d.pose === 'pray' || d.pose === 'kneel') && !lap && this.arms.every(([, mb]) => mb.up && mb.lo && mb.hand);
    if (pray) { const [a, b] = this.arms.map(([, mb]) => mb.up.getWorldPosition(new THREE.Vector3())), k = this.H * r.getWorldScale(v2).y;
      this.prayAt = a.add(b).multiplyScalar(0.5).add(new THREE.Vector3(0, -0.13 * k, 0.19 * k).applyQuaternion(qb)); this.prayK = k; }
    this.arms.forEach(([da, mb], i) => {
      if (!mb.up || !mb.lo || !mb.hand) return;
      const side = r.worldToLocal(mb.up.getWorldPosition(v1)).x > 0 ? 1 : -1; // 몸의 어느 쪽 팔인지 (몸 기준)
      const up = lap ? new THREE.Vector3(side * 0.12, -1, 0.42).normalize().applyQuaternion(qr) : dirOf(da);
      const lo = lap ? new THREE.Vector3(-side * 0.18, -0.25, 1).normalize().applyQuaternion(qr) : dirOf(da.userData.elbow);
      this.aim(mb.up, mb.lo, up, this.w);
      this.aim(mb.lo, mb.hand, lo, this.w);
      if (mourn && this.headB) { // 두 손으로 얼굴을 감싼다: 팔뚝이 팔꿈치에서 얼굴 앞으로
        const face = this.headB.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(side * -0.02, -0.03, 0.09).multiplyScalar(r.getWorldScale(v2).y / 0.5 * 0.5).applyQuaternion(qb));
        this.aim(mb.up, mb.lo, new THREE.Vector3(side * 0.15, -0.55, 0.8).normalize().applyQuaternion(qb), this.w);
        this.aim(mb.lo, mb.hand, face.sub(mb.lo.getWorldPosition(v1)).normalize(), this.w);
      }
      mb.hand.quaternion.slerp(mb.hand0, this.w); // 손목은 곧게 (서 있는 동작의 꺾인 손목이 남아 어색했다)
      if (pray) this.prayArm(mb, side, r, qb);
    });
    // 고개: 인형이 숙이거나 드는 만큼 (십자가 위에서 고개를 떨굼, 하늘을 우러름)
  }
  dispose() { this.mixer.stopAllAction(); this.p.root.parent?.remove(this.p.root); this.mats.forEach(m => m.dispose()); this.pillow.geometry.dispose(); this.pillow.material.dispose(); }
}

/* 군중 한 사람: 순례자 모델을 한 번만 자세 잡아 세운다 (매 프레임 움직이지 않아 가볍다 — 장면에 수십 명).
   서 있기는 'idle'의 한 순간, 앉기('sit')는 'pray'의 무릎 꿇은 다리에 'idle'의 팔 (두 팔을 높이 들면 경배하는 듯해서) */
export function crowdPerson(gltf, height) {
  const body = clone(gltf.scene);
  body.updateMatrixWorld(true);
  const top = bone(body, 'HeadTop_End'), h = top ? top.getWorldPosition(v1).y : 1.7;
  body.scale.setScalar(height / (h > 0.1 ? h : 1.7));
  const mats = []; body.traverse(m => { if (m.isMesh) { m.frustumCulled = false; m.material = brighten(m.material).clone(); mats.push(m.material); } }); // 저마다 재질 — 나타날 때 투명도를 따로
  const mixer = new THREE.AnimationMixer(body), clips = calmClips(gltf), clip = n => clips.find(c => c.name === n);
  const t0 = Math.random();
  const legs = ['Left', 'Right'].map(sd => [bone(body, sd + 'UpLeg'), bone(body, sd + 'Leg'), bone(body, sd + 'Foot')]);
  // 다리 뼈의 처음 자세 — 서 있기 동작에 다리 기록이 없는 모델은 앉느라 접은 다리가 일어서도 그대로 남아, 돌 없이 앉은 채였다(a06, 사용자 2026-11)
  const legRest = legs.flat().filter(Boolean).map(b => [b, b.quaternion.clone()]);
  const idle = clip('idle'), act = idle && mixer.clipAction(idle);
  act?.play();
  // 앉기: 걸상 위면 걸터앉고, 땅이면 무릎을 세우고 앉는다 (순례자 모델엔 앉는 동작이 없다)
  const stone = newStone();
  const pose = (sit, seat = 0) => {
    body.position.y = 0; stone.visible = false; if (!stone.parent && body.parent) body.parent.add(stone);
    for (const [b, q] of legRest) b.quaternion.copy(q);
    mixer.setTime(idle ? idle.duration * t0 : 0); // 멈추지(stop) 않는다 — 멈추면 뼈가 처음 자세(A자)로 되돌아간다
    if (!sit) return;
    body.parent?.updateMatrixWorld(true); body.updateMatrixWorld(true);
    const q = body.getWorldQuaternion(new THREE.Quaternion());
    if (seat > 0) { // 걸상(회당·서원의 돌 걸상)에 걸터앉기: 넓적다리는 앞으로 눕히고 정강이는 바닥까지 내린다 — 걸상 위에 꿇어앉아 발이 뒤로 삐져나왔다(사용자 2026-11)
      const w = body.parent ? body.parent.getWorldScale(v2).y : 1, py = body.parent.getWorldPosition(v1).y;
      for (const [u, l, f] of legs) if (u && l && f) aimBone(u, l, new THREE.Vector3(0, -0.08, 1).normalize().applyQuaternion(q));
      let hip = Infinity; for (const [u] of legs) if (u) hip = Math.min(hip, u.getWorldPosition(v1).y);
      body.position.y -= (hip - py) / w - 0.06 * height; body.updateMatrixWorld(true); // 엉덩이를 걸상 위에
      for (const [, l, f] of legs) if (l && f) {
        const k = l.getWorldPosition(v1), L = k.distanceTo(f.getWorldPosition(v3)), drop = Math.max(L * 0.55, Math.min(L * 0.98, k.y - (py - seat * w) - 0.05 * height * w)); // 무릎에서 바닥까지 — 발목 뼈를 바닥에 대니 발바닥이 발목 높이만큼 묻혔다(사용자). 낮은 걸상에서 음수가 되면 정강이가 위로 꺾여 뒤로 누운 듯 떠 보였다 — 정강이는 적어도 반쯤 아래로
        aimBone(l, f, new THREE.Vector3(0, -drop / L, Math.sqrt(Math.max(0, 1 - (drop / L) ** 2))).applyQuaternion(q));
      }
      return;
    }
    // 땅에 앉기: 무릎을 세우고 앉는다(무대의 사람들과 같게) — 발뒤꿈치에 꿇어앉으니 모두 무릎 꿇고 있는 것처럼 보였다(사용자 2026-11)
    let low = Infinity;
    legs.forEach(([u, l, f], i) => { if (!u || !l || !f) return; const sd = i ? -1 : 1;
      aimBone(u, l, new THREE.Vector3(sd * 0.22, 0.05, 1).normalize().applyQuaternion(q)); aimBone(l, f, new THREE.Vector3(sd * 0.04, -1, 0.08).normalize().applyQuaternion(q));
      low = Math.min(low, f.getWorldPosition(v1).y); });
    const w = body.parent ? body.parent.getWorldScale(v2).y : 1, py = body.parent.getWorldPosition(v1).y;
    // 발목 뼈는 발바닥보다 발 두께만큼 위 — 0.02로 대니 앉은 사람의 발이 땅에 묻혔다(a06, 사용자 2026-11)
    if (low < Infinity) body.position.y -= (low - py) / w - 0.05 * height;
    // 엉덩이 밑에 돌 하나 (무대 사람과 같게)
    body.updateMatrixWorld(true); const hp = bone(body, 'Hips'); if (!hp) return;
    const bot = seatBottom(body, hp, 0.09 * height * body.parent.getWorldScale(v2).y);
    const lp = body.parent.worldToLocal(hp.getWorldPosition(v1)), top = Math.max(0.02, bot < Infinity ? body.parent.worldToLocal(v2.set(v1.x, bot, v1.z)).y : lp.y - 0.1 * height);
    seatStone(stone, hp, body.parent, lp, top, height);
  };
  pose(false);
  // 나타나고 사라질 때: 무리 전체를 키우니 사람들이 가운데서 사방으로 날아왔다(사용자 2026-11) — 제자리에서 스르륵(점묘 투명도)
  let op = -1;
  let stoneOn = false; // 돌은 거의 다 나타났을 때 함께 (돌 재질은 여럿이 같이 써서 투명하게 하지 않는다)
  const fade = v => { stone.visible = stoneOn && v > 0.5; if (Math.abs(v - op) < 0.004) return; const solid = v > 0.995; mats.forEach(m => { if (m.alphaHash !== !solid) { m.alphaHash = !solid; m.needsUpdate = true; } m.opacity = solid ? 1 : v; }); op = v; };
  return { obj: body, pose: (...a) => { pose(...a); stoneOn = stone.visible; }, stone, fade };
}

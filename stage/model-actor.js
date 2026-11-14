/* 3D 무대의 인물을 glb 모델로 (실험: 예수님만 — 사용자 2026-11 '간단하게 인형만 갈아 낄 수 있다면 예수님만 실험해 봐').
   대본(scenes.js)을 고치지 않으려고, 보이지 않는 예전 인형(people.js Actor)이 그대로 걷고 자세를 잡게 두고
   모델은 그 인형을 따라 한다: 자리·방향·크기·나타남은 인형의 root를 베끼고, 자세는
   - 동작이 있는 것(걷기·서 있기·말하기·기도·잠)은 모델의 동작(Mixamo)으로
   - 나머지(축복·손 들기·가리키기·십자가 등)는 서 있는 동작 위에 인형의 팔·팔뚝·머리가 가리키는 쪽으로 모델의 뼈를 돌려 맞춘다
   (뼈마다 축이 달라 각도를 옮기면 엉뚱했다 — 방향으로 맞추면 축을 몰라도 된다) */
import { THREE, damp } from './kit.js';
import { Actor } from './people.js';
import { clone } from '../assets/vendor/SkeletonUtils.js';
import { calmClips } from '../game-model.js';

// 팔까지 모델의 동작 그대로 쓰는 자세 (그 밖의 자세는 팔을 인형에 맞춘다)
const CLIP = { idle: 'idle', listen: 'idle', speak: 'talk', sleep: 'sleep' };
// 무릎 꿇은 다리만 모델의 'pray'(무릎 꿇고 두 팔을 높이 듦)에서 빌리고 팔은 인형대로 — 인형의 기도는 서서 두 손을 가슴에 모은다
const KNEEL = new Set(['kneel', 'mourn', 'sit-ground', 'cower']);
// 걸터앉기: 넓적다리를 앞으로, 정강이는 아래로 (회당에서 앉아 말씀을 읽으심 — 무릎 꿇고 기도하는 자세가 되었다, 사용자 2026-11)
const SEAT = new Set(['sit', 'sit-speak', 'ride']);
const bone = (root, n) => { let f = null; root.traverse(o => { if (!f && o.isBone && new RegExp(`(^|mixamorig)${n}$`).test(o.name)) f = o; }); return f; };
const DOWN = new THREE.Vector3(0, -1, 0);
const v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), q1 = new THREE.Quaternion(), q2 = new THREE.Quaternion(), q3 = new THREE.Quaternion();

// 인형 키 (서 있을 때 정수리 높이) — 모델을 이만큼으로 맞춘다
const dollH = {};
export function dollHeight(type) {
  if (dollH[type]) return dollH[type];
  const d = new Actor(type); d.settle(); d.p.root.updateMatrixWorld(true);
  return (dollH[type] = new THREE.Box3().setFromObject(d.p.root).max.y);
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

export class StageModel {
  constructor(gltf, type, x = 0, z = 0, face = 0, o = {}) {
    this.doll = new Actor(type, x, z, face, o); // 보이지 않는 길잡이 (장면에 넣지 않는다)
    const body = clone(gltf.scene);
    body.updateMatrixWorld(true);
    const top = bone(body, 'HeadTop_End'), h = top ? top.getWorldPosition(v1).y : 1.7;
    body.scale.setScalar(dollHeight(type) * 0.97 / (h > 0.1 ? h : 1.7));
    this.mats = [];
    body.traverse(m => { if (m.isMesh) { m.frustumCulled = false; m.material = m.material.clone(); this.mats.push(m.material); } });
    this.p = { root: new THREE.Group() }; this.p.root.add(body);
    this.mixer = new THREE.AnimationMixer(body);
    // 게임과 같은 다듬은 동작: 말할 때 몸은 가만히 팔만, 서 있을 때 허리를 곧게, 끝과 처음이 이어지게 (game-model.js calmClips)
    this.acts = Object.fromEntries(calmClips(gltf).map(c => [c.name, this.mixer.clipAction(c)]));
    this.cur = null; this.w = 0; this.op = -1;
    // 인형의 왼팔·오른팔이 모델의 어느 팔인지는 자리(x)로 맞춘다 (서로 앞을 보는 쪽이 같다)
    const L = { up: bone(body, 'LeftArm'), lo: bone(body, 'LeftForeArm'), hand: bone(body, 'LeftHand') };
    const R = { up: bone(body, 'RightArm'), lo: bone(body, 'RightForeArm'), hand: bone(body, 'RightHand') };
    const dl = this.doll.p.armL.position.x > 0;
    this.arms = [[this.doll.p.armL, dl === (L.up.getWorldPosition(v1).x > 0) ? L : R], [this.doll.p.armR, dl === (L.up.getWorldPosition(v1).x > 0) ? R : L]];
    this.legs = [['Left'], ['Right']].map(([s]) => ({ up: bone(body, s + 'UpLeg'), lo: bone(body, s + 'Leg'), foot: bone(body, s + 'Foot') }));
    const hips = bone(body, 'Hips'); this.hipH = hips ? hips.getWorldPosition(v1).y * body.scale.x / (body.scale.x || 1) : 0.5; this.body = body; this.legW = 0;
    this.headB = bone(body, 'Head'); this.neckB = bone(body, 'Neck'); this.spineB = bone(body, 'Spine1') || bone(body, 'Spine');
    this.play('idle', 0);
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
    const a = this.acts[name] || this.acts.idle; if (!a || a === this.cur) return;
    a.reset().setEffectiveWeight(1).play();
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
  update(time, dt) {
    const d = this.doll; d.update(time, dt);
    const r = this.p.root, dr = d.p.root, moving = d.goal.distanceTo(d.pos) > 0.02;
    r.position.copy(dr.position); r.rotation.copy(dr.rotation); r.scale.copy(dr.scale); r.visible = dr.visible;
    this.fadeTo(Math.min(1, d.show));
    const walk = moving && !d.floating, clip = walk ? 'walk' : CLIP[d.pose], kneel = !walk && KNEEL.has(d.pose), ride = !walk && SEAT.has(d.pose), perch = !walk && d.pose === 'perch';
    this.play(clip || (kneel ? 'pray' : 'idle'));
    this.mixer.update(dt);
    // 동작이 없는 자세는 인형의 팔을 따른다 (천천히 들어가고 나온다)
    this.w = damp(this.w, clip || perch ? 0 : 1, 6, dt);
    // 걸터앉기·나귀 타기: 넓적다리를 앞으로, 정강이는 아래로 하고 몸을 인형처럼 내려 앉힌다 (모델에 앉는 동작이 없다)
    this.legW = damp(this.legW, ride ? 1 : 0, 6, dt);
    this.body.position.y = -this.hipH * 0.58 * (d.kneel || 0) * this.legW;
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
    if (this.w < 0.01 && this.legW < 0.01) return;
    r.updateMatrixWorld(true); dr.updateMatrixWorld(true);
    if (this.legW > 0.01) {
      const qr = r.getWorldQuaternion(new THREE.Quaternion());
      const thigh = new THREE.Vector3(0, -0.25, 1).normalize().applyQuaternion(qr), shin = new THREE.Vector3(0, -1, 0.15).normalize().applyQuaternion(qr);
      for (const l of this.legs) if (l.up && l.lo && l.foot) { this.aim(l.up, l.lo, thigh, this.legW); this.aim(l.lo, l.foot, shin, this.legW); }
    }
    if (this.w < 0.01) return;
    const qm = r.getWorldQuaternion(q2.clone()), qd = dr.getWorldQuaternion(new THREE.Quaternion()).invert();
    // 인형 root 기준의 팔 방향(아래로 뻗은 팔이 가리키는 쪽)을 모델 root에 옮긴다
    const dirOf = o => DOWN.clone().applyQuaternion(o.getWorldQuaternion(new THREE.Quaternion()).premultiply(qd).premultiply(qm));
    for (const [da, mb] of this.arms) {
      if (!mb.up || !mb.lo || !mb.hand) continue;
      this.aim(mb.up, mb.lo, dirOf(da), this.w);
      this.aim(mb.lo, mb.hand, dirOf(da.userData.elbow), this.w);
    }
    // 고개: 인형이 숙이거나 드는 만큼 (십자가 위에서 고개를 떨굼, 하늘을 우러름)
    if (this.headB) this.headB.rotation.x += d.p.head.rotation.x * this.w * 0.8;
  }
  dispose() { this.mixer.stopAllAction(); this.p.root.parent?.remove(this.p.root); this.mats.forEach(m => m.dispose()); }
}

/* 군중 한 사람: 순례자 모델을 한 번만 자세 잡아 세운다 (매 프레임 움직이지 않아 가볍다 — 장면에 수십 명).
   서 있기는 'idle'의 한 순간, 앉기('sit')는 'pray'의 무릎 꿇은 다리에 'idle'의 팔 (두 팔을 높이 들면 경배하는 듯해서) */
export function crowdPerson(gltf, height) {
  const body = clone(gltf.scene);
  body.updateMatrixWorld(true);
  const top = bone(body, 'HeadTop_End'), h = top ? top.getWorldPosition(v1).y : 1.7;
  body.scale.setScalar(height / (h > 0.1 ? h : 1.7));
  body.traverse(m => { if (m.isMesh) m.frustumCulled = false; });
  const mixer = new THREE.AnimationMixer(body), clips = calmClips(gltf), clip = n => clips.find(c => c.name === n);
  const t0 = Math.random();
  const legs = ['Left', 'Right'].map(sd => [bone(body, sd + 'UpLeg'), bone(body, sd + 'Leg'), bone(body, sd + 'Foot')]);
  const idle = clip('idle'), act = idle && mixer.clipAction(idle);
  act?.play();
  // 앉기는 무릎 꿇고 발뒤꿈치에 앉은 모습 — 넓적다리는 앞으로, 정강이는 뒤로 눕히고 무릎이 땅에 닿게 몸을 내린다 (순례자 모델엔 앉는 동작이 없다)
  const pose = sit => {
    body.position.y = 0;
    mixer.setTime(idle ? idle.duration * t0 : 0); // 멈추지(stop) 않는다 — 멈추면 뼈가 처음 자세(A자)로 되돌아간다
    if (!sit) return;
    body.parent?.updateMatrixWorld(true); body.updateMatrixWorld(true);
    const q = body.getWorldQuaternion(new THREE.Quaternion()), thigh = new THREE.Vector3(0, -0.35, 1).normalize().applyQuaternion(q), shin = new THREE.Vector3(0, -0.12, -1).normalize().applyQuaternion(q);
    let knee = Infinity;
    for (const [u, l, f] of legs) if (u && l && f) { aimBone(u, l, thigh); aimBone(l, f, shin); knee = Math.min(knee, l.getWorldPosition(v1).y); }
    const w = body.parent ? body.parent.getWorldScale(v2).y : 1;
    if (knee < Infinity) body.position.y -= (knee - body.parent.getWorldPosition(v1).y) / w - 0.03 * height;
  };
  pose(false);
  return { obj: body, pose };
}

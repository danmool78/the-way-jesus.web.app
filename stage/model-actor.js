/* 3D 무대의 인물을 glb 모델로 (실험: 예수님만 — 사용자 2026-11 '간단하게 인형만 갈아 낄 수 있다면 예수님만 실험해 봐').
   대본(scenes.js)을 고치지 않으려고, 보이지 않는 예전 인형(people.js Actor)이 그대로 걷고 자세를 잡게 두고
   모델은 그 인형을 따라 한다: 자리·방향·크기·나타남은 인형의 root를 베끼고, 자세는
   - 동작이 있는 것(걷기·서 있기·말하기·기도·잠)은 모델의 동작(Mixamo)으로
   - 나머지(축복·손 들기·가리키기·십자가 등)는 서 있는 동작 위에 인형의 팔·팔뚝·머리가 가리키는 쪽으로 모델의 뼈를 돌려 맞춘다
   (뼈마다 축이 달라 각도를 옮기면 엉뚱했다 — 방향으로 맞추면 축을 몰라도 된다) */
import { THREE, damp } from './kit.js';
import { Actor } from './people.js';
import { clone } from '../assets/vendor/SkeletonUtils.js';

const CLIP = { idle: 'idle', listen: 'idle', speak: 'talk', 'sit-speak': 'talk', pray: 'pray', kneel: 'pray', bow: 'pray', mourn: 'pray', sleep: 'sleep' };
const bone = (root, n) => { let f = null; root.traverse(o => { if (!f && o.isBone && new RegExp(`(^|mixamorig)${n}$`).test(o.name)) f = o; }); return f; };
const DOWN = new THREE.Vector3(0, -1, 0);
const v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), q1 = new THREE.Quaternion(), q2 = new THREE.Quaternion(), q3 = new THREE.Quaternion();

// 인형 키 (서 있을 때 정수리 높이) — 모델을 이만큼으로 맞춘다
let dollH = 0;
function dollHeight(type) {
  if (dollH) return dollH;
  const d = new Actor(type); d.settle(); d.p.root.updateMatrixWorld(true);
  dollH = new THREE.Box3().setFromObject(d.p.root).max.y; return dollH;
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
    this.acts = Object.fromEntries(gltf.animations.map(c => [c.name, this.mixer.clipAction(c)]));
    this.cur = null; this.w = 0; this.op = -1;
    // 인형의 왼팔·오른팔이 모델의 어느 팔인지는 자리(x)로 맞춘다 (서로 앞을 보는 쪽이 같다)
    const L = { up: bone(body, 'LeftArm'), lo: bone(body, 'LeftForeArm'), hand: bone(body, 'LeftHand') };
    const R = { up: bone(body, 'RightArm'), lo: bone(body, 'RightForeArm'), hand: bone(body, 'RightHand') };
    const dl = this.doll.p.armL.position.x > 0;
    this.arms = [[this.doll.p.armL, dl === (L.up.getWorldPosition(v1).x > 0) ? L : R], [this.doll.p.armR, dl === (L.up.getWorldPosition(v1).x > 0) ? R : L]];
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
  // 뼈(b)가 자식 쪽으로 가리키는 방향을 dir(세계 좌표)로 w만큼 돌린다
  aim(b, child, dir, w) {
    b.updateWorldMatrix(true, false);
    const from = child.getWorldPosition(v1).sub(b.getWorldPosition(v2)).normalize();
    q1.setFromUnitVectors(from, dir);                    // 세계에서 더 돌릴 만큼
    b.getWorldQuaternion(q2); q1.multiply(q2);             // 새 세계 회전
    b.parent.getWorldQuaternion(q3).invert(); q3.multiply(q1); // 부모 기준으로
    b.quaternion.slerp(q3, w);
    b.updateMatrixWorld(true);
  }
  update(time, dt) {
    const d = this.doll; d.update(time, dt);
    const r = this.p.root, dr = d.p.root, moving = d.goal.distanceTo(d.pos) > 0.02;
    r.position.copy(dr.position); r.rotation.copy(dr.rotation); r.scale.copy(dr.scale); r.visible = dr.visible;
    this.fadeTo(Math.min(1, d.show));
    const clip = moving && !d.floating ? 'walk' : CLIP[d.pose];
    this.play(clip || 'idle');
    this.mixer.update(dt);
    // 동작이 없는 자세는 인형의 팔을 따른다 (천천히 들어가고 나온다)
    this.w = damp(this.w, clip ? 0 : 1, 6, dt);
    if (this.w < 0.01) return;
    r.updateMatrixWorld(true); dr.updateMatrixWorld(true);
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

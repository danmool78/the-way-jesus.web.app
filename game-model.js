// 3D 인물 모델(glb, Mixamo 뼈대 + 동작) — 순례 게임의 인형 대신 (사용자 2026-11: 동그라미·원기둥 인형이 카드 그림 옆에서 어설펐다).
// stage/people.js의 Actor와 같은 꼴(pos·goal·face·set·look·target·showT·big·ground·update·p.root)로 움직여 game.js가 그대로 쓴다.
// 동작 이름: walk·idle·talk·pray·sleep (_src/models의 원본에서 glbslim으로 이름을 붙였다). 파일은 R2에서 (assets/models.json)
import * as THREE from './assets/vendor/three.module.min.js';
import { GLTFLoader } from './assets/vendor/GLTFLoader.js';
import { clone } from './assets/vendor/SkeletonUtils.js';

const BASE_H = 0.91; // 지금 인형(big = 1)의 키 — 모델 키(1.7m)를 이만큼으로 맞춰 big·SCALE을 그대로 쓴다
const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
const wrapA = a => Math.atan2(Math.sin(a), Math.cos(a));
const POSE = { idle: 'idle', speak: 'talk', talk: 'talk', pray: 'pray', sleep: 'sleep' };
const cache = new Map();
// 뼈 찾기: GLTFLoader가 이름의 ':'를 지워 'mixamorig:Head'가 'mixamorigHead'가 된다
const bone = (root, n) => { let f = null; root.traverse(o => { if (!f && o.isBone && new RegExp(`(^|:|mixamorig)${n}$`).test(o.name)) f = o; }); return f; };

export async function loadModel(url) {
  if (!cache.has(url)) cache.set(url, new GLTFLoader().loadAsync(url));
  return cache.get(url);
}

export class ModelActor {
  constructor(gltf, x = 0, z = 0) {
    const body = clone(gltf.scene); // 뼈대째 복제 — 같은 모델로 여럿(병정 등)을 세울 수 있게
    // 키는 정수리 뼈(HeadTop_End) 높이로 잰다 — 뼈대 노드의 배율(Mixamo 0.01 등) 때문에 상자로 재면 엉뚱했다
    body.updateMatrixWorld(true);
    const top = bone(body, 'HeadTop_End'), h = top ? top.getWorldPosition(new THREE.Vector3()).y : 1.7;
    body.scale.setScalar(BASE_H / (h > 0.1 ? h : 1.7));
    body.traverse(o => { if (o.isMesh) { o.frustumCulled = false; o.castShadow = false; if (o.material.map) o.material.map.anisotropy = 4; } });
    this.p = { root: new THREE.Group() }; this.p.root.add(body);
    this.head = bone(body, 'Head');
    this.mixer = new THREE.AnimationMixer(body);
    this.acts = Object.fromEntries(gltf.animations.map(c => [c.name, this.mixer.clipAction(c)]));
    this.cur = null;
    this.pos = new THREE.Vector2(x, z); this.goal = this.pos.clone();
    this.face = 0; this.faceT = 0; this.pose = 'idle'; this.target = null;
    this.speed = 0.55; this.show = 1; this.showT = 1; this.ground = 0; this.big = 1; this.realWalk = true;
    // 베개: 누워 잘 때 머리 밑에 (막 4:38 — 배 고물에서 베개를 베고 주무셨다, 사용자 2026-11)
    this.pillow = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.14, 4, 12), new THREE.MeshStandardMaterial({ color: '#efe2c2', roughness: 1 }));
    this.pillow.rotation.z = Math.PI / 2; this.pillow.scale.set(1, 1, 0.6); this.pillow.visible = false;
    this.p.root.add(this.pillow);
    this.play('idle', 0);
  }
  play(name, fade = 0.35) {
    const a = this.acts[name] || this.acts.idle; if (!a || a === this.cur) return;
    a.reset().setEffectiveWeight(1).play();
    if (this.cur) this.cur.crossFadeTo(a, fade, false); this.cur = a;
  }
  set(pose) { this.pose = pose; }
  moveTo(x, z = this.goal.y) { this.goal.set(x, z); }
  look(dir) { this.faceT = dir; this.target = null; }
  settle() {}
  update(time, dt) {
    const d = this.goal.clone().sub(this.pos), dist = d.length(), moving = dist > 0.02;
    if (moving) this.pos.addScaledVector(d.normalize(), Math.min(dist, this.speed * dt));
    // 걸을 때는 가는 쪽, 서 있을 때는 상대(target) 쪽을 본다 — 사방에서 보는 게임이라 온전히 돈다
    let want = this.faceT;
    if (this.target && this.target.showT > 0) want = Math.atan2(this.target.pos.x - this.pos.x, this.target.pos.y - this.pos.y);
    if (moving) want = Math.atan2(d.x, d.y);
    this.face = damp(this.face, this.face + wrapA(want - this.face), 6, dt);
    this.play(moving ? 'walk' : POSE[this.pose] || 'idle');
    this.mixer.update(dt);
    this.show = damp(this.show, this.showT, 4, dt);
    const r = this.p.root;
    r.position.set(this.pos.x, this.ground, this.pos.y); r.rotation.y = this.face;
    r.scale.setScalar((0.94 + 0.06 * this.show) * this.big); r.visible = this.show > 0.05;
    // 베개는 잘 때만, 머리 밑 땅 위에
    const sleep = !moving && this.pose === 'sleep'; this.pillow.visible = sleep;
    if (sleep && this.head) { r.updateMatrixWorld(true); const v = this.head.getWorldPosition(new THREE.Vector3()); r.worldToLocal(v); this.pillow.position.set(v.x, 0.035, v.z); this.pillow.rotation.y = Math.atan2(v.x, v.z); }
  }
  dispose() {
    this.mixer.stopAllAction(); this.p.root.parent?.remove(this.p.root);
    this.pillow.geometry.dispose(); this.pillow.material.dispose(); // 몸은 같은 모델끼리 함께 쓰므로 버리지 않는다
  }
}

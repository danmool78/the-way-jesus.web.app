// 3D 인물 모델(glb, Mixamo 뼈대 + 동작) — 순례 게임의 인형 대신 (사용자 2026-11: 동그라미·원기둥 인형이 카드 그림 옆에서 어설펐다).
// stage/people.js의 Actor와 같은 꼴(pos·goal·face·set·look·target·showT·big·ground·update·p.root)로 움직여 game.js가 그대로 쓴다.
// 동작 이름: walk·idle·talk·pray·sleep (_src/models의 원본에서 glbslim으로 이름을 붙였다). 파일은 R2에서 (assets/models.json)
import * as THREE from './assets/vendor/three.module.min.js';
import { GLTFLoader } from './assets/vendor/GLTFLoader.js';
import { clone } from './assets/vendor/SkeletonUtils.js';

const BASE_H = 0.91; // 지금 인형(big = 1)의 키 — 모델 키(1.7m)를 이만큼으로 맞춰 big·SCALE을 그대로 쓴다
const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
const wrapA = a => Math.atan2(Math.sin(a), Math.cos(a));
const POSE = { idle: 'idle', speak: 'talk', talk: 'talk', pray: 'pray', sleep: 'sleep', kneel: 'kneel', taunt: 'taunt' };
const cache = new Map();
// 뼈 찾기: GLTFLoader가 이름의 ':'를 지워 'mixamorig:Head'가 'mixamorigHead'가 된다
const bone = (root, n) => { let f = null; root.traverse(o => { if (!f && o.isBone && new RegExp(`(^|:|mixamorig)${n}$`).test(o.name)) f = o; }); return f; };

export async function loadModel(url) {
  if (!cache.has(url)) cache.set(url, new GLTFLoader().loadAsync(url));
  return cache.get(url);
}

// 모델 목록(assets/models.json)과 이름으로 받기 — 없거나 못 받으면 null (그때는 예전 인형)
let list = null;
export async function model(name) {
  try {
    list ??= fetch('assets/models.json').then(r => r.json());
    const M = await list, key = M.files[name];
    return key ? await loadModel(`${M.base}/${key}`) : null;
  } catch (err) { console.warn('model', name, err); return null; }
}

// 옷 색 바꾸기 (순례자 꾸미기): 텍스처에서 그 옷의 색상 범위만 골라 고른 색으로 칠한다 — 밝고 어두운 결은 남긴다.
// [색상 아래·위(도), 최소 채도, 원래 옷의 평균 채도·밝기] — 텍스처를 재어 정했다(남자 순례자 겉옷 청회색, 여자 순례자 속옷 장밋빛)
const TINT = { 'pilgrim-man': [195, 222, 0.12, 0.23, 0.45], 'pilgrim-woman': [335, 365, 0.25, 0.51, 0.67] };
const tints = new Map();
const hsv = (r, g, b) => { const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; let h = 0;
  if (d) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return [(h * 60 + 360) % 360, mx ? d / mx : 0, mx]; };
const rgb = (h, s, v) => { const f = n => { const k = (n + h / 60) % 6; return v - v * s * Math.max(0, Math.min(k, 4 - k, 1)); }; return [f(5), f(3), f(1)]; };
export function tinted(gltf, name, hex) {
  const T = TINT[name]; if (!T || !hex) return gltf;
  const key = name + hex; if (tints.has(key)) return tints.get(key);
  const [h0, h1, smin, sAvg, vAvg] = T, c = new THREE.Color(hex), [th, ts, tv] = hsv(c.r, c.g, c.b);
  let tex = null;
  gltf.scene.traverse(o => { if (!tex && o.isMesh && o.material.map) tex = o.material.map; });
  if (!tex) return gltf;
  const img = tex.image, cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height;
  const x = cv.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0);
  const D = x.getImageData(0, 0, cv.width, cv.height), d = D.data;
  for (let i = 0; i < d.length; i += 4) {
    const [h, s, v] = hsv(d[i] / 255, d[i + 1] / 255, d[i + 2] / 255), hh = h1 > 360 && h < h1 - 360 ? h + 360 : h; // 빨강 둘레는 0°를 넘나든다
    if (hh < h0 || hh > h1 || s < smin || v < 0.12) continue;
    const [r, g, b] = rgb(th, Math.min(1, ts * s / sAvg), Math.min(1, tv * v / vAvg));
    d[i] = r * 255; d[i + 1] = g * 255; d[i + 2] = b * 255;
  }
  x.putImageData(D, 0, 0);
  const nt = new THREE.CanvasTexture(cv); nt.flipY = tex.flipY; nt.colorSpace = tex.colorSpace; nt.wrapS = tex.wrapS; nt.wrapT = tex.wrapT; nt.anisotropy = 4;
  const scene = clone(gltf.scene);
  scene.traverse(o => { if (o.isMesh && o.material.map) { o.material = o.material.clone(); o.material.map = nt; } });
  const out = { scene, animations: gltf.animations }; tints.set(key, out); return out;
}

export class ModelActor {
  constructor(gltf, x = 0, z = 0, o = {}) {
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
    this.p.root.add(this.pillow); this.noPillow = !!o.noPillow; // 길가에 쓰러진 사람은 베개 없이
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
    const sleep = !moving && this.pose === 'sleep' && !this.noPillow; this.pillow.visible = sleep;
    if (sleep && this.head) { r.updateMatrixWorld(true); const v = this.head.getWorldPosition(new THREE.Vector3()); r.worldToLocal(v); this.pillow.position.set(v.x, 0.035, v.z); this.pillow.rotation.y = Math.atan2(v.x, v.z); }
  }
  dispose() {
    this.mixer.stopAllAction(); this.p.root.parent?.remove(this.p.root);
    this.pillow.geometry.dispose(); this.pillow.material.dispose(); // 몸은 같은 모델끼리 함께 쓰므로 버리지 않는다
  }
}

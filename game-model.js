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

// 손에 드는 것 (사용자 2026-11): 지팡이·창·방패·물동이를 코드로 만든다. 크기는 모델 키(BASE_H)에 맞춘 몸 둘레 단위.
// 뼈에 자식으로 달면 뼈의 배율·축(Mixamo 손은 손가락 쪽이 +Y)이 모델마다 달라 막대가 눕거나 엉뚱한 데로 돌아,
// 매 화면 손 뼈의 자리만 따라가고 방향은 몸 기준으로 세운다 — 걸을 때 손을 흔들면 지팡이도 함께 앞뒤로 간다
const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...o });
function makeGear(kind) {
  const g = new THREE.Group();
  const rod = (len, r, color) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.15, len, 6), mat(color)); m.position.y = len / 2; return m; };
  if (kind === 'staff' || kind === 'crook' || kind === 'rod') { // 지팡이: 손에서 아래로 땅까지, 위로 조금 (목자는 끝이 굽은 막대)
    const L = kind === 'crook' ? 0.98 : 1.0; g.add(rod(L, 0.012, '#6b4a2b'));
    if (kind === 'crook') { const h = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.011, 5, 12, Math.PI * 1.25), mat('#6b4a2b')); h.position.set(-0.045, L, 0); g.add(h); }
    g.userData.ground = true;
  } else if (kind === 'spear' || kind === 'bigspear') { // 창: 손 위로 머리를 넘게, 쇠 날
    const k = kind === 'bigspear' ? 1.3 : 1, L = 1.22 * k; g.add(rod(L, 0.01 * k, '#5a4128')); // 골리앗의 창 자루는 베틀 채 같았다(삼상 17:7)
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.022 * k, 0.12 * k, 5), mat('#b9b7ad', { metalness: 0.6, roughness: 0.4 }));
    tip.position.y = L + 0.06 * k; g.add(tip);
    g.userData.ground = true;
  } else if (kind === 'scutum') { // 로마 병정의 긴 네모 방패(붉은 바탕, 쇠 돌기)
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.4, 0.02), mat('#8c2a1e')); g.add(b);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.27, 0.41, 0.012), mat('#5b3d24')); back.position.z = -0.012; g.add(back); // 뒷면은 나무
    for (const y of [-0.2, 0.2]) { const e = new THREE.Mesh(new THREE.BoxGeometry(0.27, 0.014, 0.026), mat('#c8a24a', { metalness: 0.4 })); e.position.y = y; g.add(e); } // 위아래 놋 테
    const boss = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), mat('#c8a24a', { metalness: 0.5 })); boss.rotation.x = Math.PI / 2; boss.position.z = 0.01; g.add(boss);
    g.userData.face = true;
  } else if (kind === 'shield' || kind === 'bigshield') { // 둥근 방패(구약의 병사·요압·골리앗) — 가죽 바탕에 놋 테
    const R = kind === 'bigshield' ? 0.19 : 0.15;
    const d = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 0.02, 18), [mat('#6b4a2c'), mat('#7a5a36'), mat('#4e3420')]); d.rotation.x = Math.PI / 2; g.add(d); // 앞은 가죽, 뒤는 어두운 나무
    const rim = new THREE.Mesh(new THREE.TorusGeometry(R, 0.012, 5, 22), mat('#b08a3e', { metalness: 0.5 })); g.add(rim);
    const boss = new THREE.Mesh(new THREE.SphereGeometry(R * 0.25, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), mat('#b08a3e', { metalness: 0.5 })); boss.rotation.x = Math.PI / 2; boss.position.z = 0.01; g.add(boss);
    g.userData.face = true;
  } else if (kind === 'helmet') { // 놋 투구: 순례자 모델로 세운 구약 병사가 순례자와 똑같아 보여서 (정수리에 씌운다)
    const h = new THREE.Mesh(new THREE.SphereGeometry(0.068, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat('#a07c3a', { metalness: 0.55, roughness: 0.45 }));
    h.scale.set(1, 0.95, 1.08); h.position.y = -0.045; g.add(h);
    const crest = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.03, 0.12), mat('#7a5a2a', { metalness: 0.4 })); crest.position.y = 0.02; g.add(crest);
    g.userData.top = true;
  } else if (kind === 'jar') { // 물동이: 머리에 이고 (요 4:28 — 여인이 물동이를 버려두고)
    const pts = [[0, 0], [0.05, 0.005], [0.075, 0.05], [0.07, 0.1], [0.035, 0.135], [0.03, 0.16], [0.042, 0.17]].map(([x, y]) => new THREE.Vector2(x, y));
    const j = new THREE.Mesh(new THREE.LatheGeometry(pts, 14), mat('#b4693e', { side: THREE.DoubleSide })); g.add(j);
  }
  g.userData.kind = kind;
  return g;
}
const HOLD = { staff: 'R', crook: 'R', rod: 'R', spear: 'R', bigspear: 'R', scutum: 'L', shield: 'L', bigshield: 'L', jar: 'top', helmet: 'top' };

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
    this.hands = { R: bone(body, 'RightHand'), L: bone(body, 'LeftHand'), top: bone(body, 'HeadTop_End') };
    this.gear = [];
    this.play('idle', 0);
  }
  // 손에 들려 주기 (game-cast.js의 GEAR): ['staff'] 등 — 같은 쪽 손에 둘을 주지 않는다
  hold(list = []) {
    for (const k of list) { const b = this.hands[HOLD[k]]; if (!b) continue; const m = makeGear(k); m.userData.bone = b; this.p.root.add(m); this.gear.push(m); }
    return this;
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
    if (this.acts.walk) this.acts.walk.timeScale = this.walkRate || 1; // 빨리 걷는 이는 발도 빨리 (발이 땅에서 미끄러져 보이지 않게)
    this.mixer.update(dt);
    this.show = damp(this.show, this.showT, 4, dt);
    const r = this.p.root;
    r.position.set(this.pos.x, this.ground, this.pos.y); r.rotation.y = this.face;
    r.scale.setScalar((0.94 + 0.06 * this.show) * this.big); r.visible = this.show > 0.05;
    // 베개는 잘 때만, 머리 밑 땅 위에
    const sleep = !moving && this.pose === 'sleep' && !this.noPillow; this.pillow.visible = sleep;
    // 손에 든 것: 손 뼈 자리를 몸 기준 좌표로 옮겨 따라가게 (방향은 몸 기준으로 곧게)
    if (this.gear.length && r.visible) {
      r.updateMatrixWorld(true);
      for (const g of this.gear) {
        const v = g.userData.bone.getWorldPosition(new THREE.Vector3()); r.worldToLocal(v); g.position.copy(v);
        if (g.userData.ground) g.position.y = 0; // 지팡이·창은 땅을 짚고 손을 따라간다 (손 높이에 매달면 걸을 때 공중에 떴다)
        if (g.userData.kind === 'jar') g.position.y += 0.005;
        if (g.userData.top && this.head) { const q = this.head.getWorldQuaternion(new THREE.Quaternion()), rq = r.getWorldQuaternion(new THREE.Quaternion()).invert(); g.quaternion.copy(rq.multiply(q)); } // 투구는 고개를 따라 돈다
        if (g.userData.face) { const a = Math.atan2(v.x, v.z * 0.4); g.rotation.y = a; g.position.x += Math.sign(v.x) * 0.03; } // 방패는 바깥을 보게
      }
    }
    if (sleep && this.head) { r.updateMatrixWorld(true); const v = this.head.getWorldPosition(new THREE.Vector3()); r.worldToLocal(v); this.pillow.position.set(v.x, 0.035, v.z); this.pillow.rotation.y = Math.atan2(v.x, v.z); }
  }
  dispose() {
    this.mixer.stopAllAction(); this.p.root.parent?.remove(this.p.root);
    for (const g of this.gear) g.traverse(o => { if (o.isMesh) { o.geometry.dispose(); for (const m of [].concat(o.material)) m.dispose(); } });
    this.pillow.geometry.dispose(); this.pillow.material.dispose(); // 몸은 같은 모델끼리 함께 쓰므로 버리지 않는다
  }
}

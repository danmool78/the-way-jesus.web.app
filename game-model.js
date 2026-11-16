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

// 멀리 작게 보일 때 텍스처를 한 단계 반 선명하게 읽는다(MAP_BIAS). 조각조각 붙은 텍스처라 흐린 단계에서는 옆 조각(흰 옷 등)의 색이
// 얼굴에 섞여 흰 점이 보였다(천사·예수님 얼굴, 사용자 2026-11). 모델 재질에만 define을 붙인다 — 복제한 재질(restyle·tinted)에도 따라간다
if (!THREE.ShaderChunk.map_fragment.includes('MAP_BIAS')) THREE.ShaderChunk.map_fragment = THREE.ShaderChunk.map_fragment.replace('texture2D( map, vMapUv )', '\n#ifdef MAP_BIAS\n texture2D( map, vMapUv, MAP_BIAS )\n#else\n texture2D( map, vMapUv )\n#endif\n');
export async function loadModel(url) {
  if (!cache.has(url)) cache.set(url, new GLTFLoader().loadAsync(url).then(g => {
    g.scene.traverse(o => { if (o.isMesh && o.material.map) o.material.defines = { ...o.material.defines, MAP_BIAS: '-1.5' }; }); return g; }));
  return cache.get(url);
}

// 동작을 빌려 올 모델 (여자는 순례자 자매에게서)
const DONOR = { jesus: 'jesus-moves', lydia: 'pilgrim-woman', 'pilgrim-woman': 'pilgrim-woman', miriam: 'pilgrim-woman', zipporah: 'pilgrim-woman', rahab: 'pilgrim-woman', samaritan: 'pilgrim-woman', martha: 'pilgrim-woman', magdalene: 'pilgrim-woman', 'mary-bethany': 'pilgrim-woman', mary: 'pilgrim-woman' };
// 모델 목록(assets/models.json)과 이름으로 받기 — 없거나 못 받으면 null (그때는 예전 인형)
let list = null;
export async function model(name) {
  try {
    list ??= fetch('assets/models.json').then(r => r.json());
    const M = await list, key = M.files[name];
    const g = key ? await loadModel(`${M.base}/${key}`) : null; if (!g) return null;
    g.userData.name = name;
    // 걷기만 떠 온 모델(바울 여정의 사람들)은 서 있기·말하기가 없어 팔 벌린 A자로 서 있었다(사용자 2026-11) —
    // 같은 Mixamo 뼈대의 순례자 모델에서 빌린다 (stage/model-actor.js의 withBorrowed와 같은 방식: 뼈 각도만, 엉덩이 높이는 비율로)
    const need = ['idle', 'talk', 'sleep', 'pray'].filter(n => !g.animations.some(c => c.name === n)), dn = DONOR[name] || 'pilgrim-man'; // 예수님(새 모델)은 예전 모델의 동작을 — 배에서 주무시는 것까지
    if (need.length && name !== dn && !g.userData.borrowed) {
      g.userData.borrowed = true;
      const d = await model(dn);
      if (d) for (const n of need) {
        const c = d.animations.find(c => c.name === n); if (!c) continue;
        const hr = bone(g.scene, 'Hips')?.position.length(), hd = bone(d.scene, 'Hips')?.position.length(), k = hr && hd ? hr / hd : 1;
        g.animations.push(new THREE.AnimationClip(n, c.duration, c.tracks.filter(t => g.scene.getObjectByName(t.name.split('.')[0])).map(t => {
          const [bn, prop] = t.name.split('.');
          if (/Hips/.test(bn) && prop === 'position') { const u = t.clone(); u.values = u.values.map(v => v * k); return u; }
          return prop === 'quaternion' ? t : null;
        }).filter(Boolean)));
      }
    }
    return g;
  } catch (err) { console.warn('model', name, err); return null; }
}

// 옷 색 바꾸기 (순례자 꾸미기): 텍스처에서 그 옷의 색상 범위만 골라 고른 색으로 칠한다 — 밝고 어두운 결은 남긴다.
// [색상 아래·위(도), 최소 채도, 원래 옷의 평균 채도·밝기] — 텍스처를 재어 정했다(남자 순례자 겉옷 청회색, 여자 순례자 속옷 장밋빛)
const TINT = { 'pilgrim-man': [195, 222, 0.12, 0.23, 0.45], 'pilgrim-woman': [335, 365, 0.25, 0.51, 0.67] };
const tints = new Map();
const hsv = (r, g, b) => { const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; let h = 0;
  if (d) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return [(h * 60 + 360) % 360, mx ? d / mx : 0, mx]; };
const rgb = (h, s, v) => { const f = n => { const k = (n + h / 60) % 6; return v - v * s * Math.max(0, Math.min(k, 4 - k, 1)); }; return [f(5), f(3), f(1)]; };
// 수수하게: 다른 시대 인물을 엑스트라로 쓸 때 화려한 옷 색(청록 겉옷·보랏빛 등)을 바래게 한다 (사용자 2026-11: 평범한 색깔 옷으로).
// 살갗(주황 둘레의 색상)은 두고, 채도가 높은 색만 낮춘다
const plains = new Map();
export function plain(gltf, key) {
  if (plains.has(key)) return plains.get(key);
  let tex = null;
  gltf.scene.traverse(o => { if (!tex && o.isMesh && o.material.map) tex = o.material.map; });
  if (!tex) return gltf;
  const img = tex.image, cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height;
  const x = cv.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0);
  const D = x.getImageData(0, 0, cv.width, cv.height), d = D.data;
  for (let i = 0; i < d.length; i += 4) {
    const [h, s, v] = hsv(d[i] / 255, d[i + 1] / 255, d[i + 2] / 255);
    if (s < 0.3 || (h > 8 && h < 42)) continue; // 이미 수수하거나 살갗·갈색
    const [r, g, b] = rgb(h, 0.16, v * 0.92);
    d[i] = r * 255; d[i + 1] = g * 255; d[i + 2] = b * 255;
  }
  x.putImageData(D, 0, 0);
  const nt = new THREE.CanvasTexture(cv); nt.flipY = tex.flipY; nt.colorSpace = tex.colorSpace; nt.wrapS = tex.wrapS; nt.wrapT = tex.wrapT; nt.anisotropy = 4;
  const scene = clone(gltf.scene);
  scene.traverse(o => { if (o.isMesh && o.material.map) { o.material = o.material.clone(); o.material.map = nt; } });
  const out = { scene, animations: gltf.animations }; plains.set(key, out); return out;
}
// 다른 배역으로 다시 쓸 때 같은 사람으로 보이지 않게(사용자 2026-11): 옷 색의 색상을 hue°만큼 돌리고(채도 sat배), 살갗은 밝기를 skin배.
// 'plain'처럼 화려한 색을 바래게 하려면 plain: true. 살갗은 색상 8–42°·중간 채도·밝은 곳으로 가른다
const styles = new Map();
// white: 옷을 흰 옷으로 (스데반, 사용자 2026-11) — 어두운 머리·수염은 그대로 두려고 밝은 곳만 희게
export function restyle(gltf, key, { hue = 0, sat = 1, skin = 1, plain: pl = false, white = false } = {}) {
  const id = key + '|' + hue + '|' + sat + '|' + skin + '|' + pl + '|' + white; if (styles.has(id)) return styles.get(id);
  let tex = null;
  gltf.scene.traverse(o => { if (!tex && o.isMesh && o.material.map) tex = o.material.map; });
  if (!tex) return gltf;
  const img = tex.image, cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height;
  const x = cv.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0);
  const D = x.getImageData(0, 0, cv.width, cv.height), d = D.data;
  for (let i = 0; i < d.length; i += 4) {
    let [h, s, v] = hsv(d[i] / 255, d[i + 1] / 255, d[i + 2] / 255);
    const skinny = h > 8 && h < 42 && s > 0.18 && s < 0.7 && v > 0.3;
    if (skinny) { if (skin === 1) continue; v = Math.min(1, v * skin); }
    else if (white) { if (v < 0.3) continue; s *= 0.1; v = 0.7 + v * 0.3; }
    else if (s >= 0.15) { h = (h + hue + 360) % 360; s = Math.min(1, pl ? Math.min(s, 0.18) : s * sat); if (pl) v *= 0.92; }
    else continue;
    const [r, g, b] = rgb(h, s, v); d[i] = r * 255; d[i + 1] = g * 255; d[i + 2] = b * 255;
  }
  x.putImageData(D, 0, 0);
  const nt = new THREE.CanvasTexture(cv); nt.flipY = tex.flipY; nt.colorSpace = tex.colorSpace; nt.wrapS = tex.wrapS; nt.wrapT = tex.wrapT; nt.anisotropy = 4;
  const scene = clone(gltf.scene);
  scene.traverse(o => { if (o.isMesh && o.material.map) { o.material = o.material.clone(); o.material.map = nt; } });
  const out = { scene, animations: gltf.animations }; styles.set(id, out); return out;
}
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
const ROD = 0.0075; // 지팡이·창 자루 반지름 (몸 기준 단위 — 굵었다, 사용자 2026-11)
const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...o });
function makeGear(kind) {
  const g = new THREE.Group();
  const rod = (len, r, color) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.15, len, 6), mat(color)); m.position.y = len / 2; return m; };
  if (kind === 'staff' || kind === 'crook' || kind === 'rod') { // 지팡이: 손에서 아래로 땅까지, 위로 조금 (목자는 끝이 굽은 막대)
    const L = kind === 'crook' ? 0.98 : 1.0; g.add(rod(L, ROD, '#6b4a2b'));
    if (kind === 'crook') { const h = new THREE.Mesh(new THREE.TorusGeometry(0.045, ROD * 0.95, 5, 12, Math.PI * 1.25), mat('#6b4a2b')); h.position.set(-0.045, L, 0); g.add(h); }
    g.userData.ground = true;
  } else if (kind === 'spear' || kind === 'bigspear') { // 창: 손 위로 머리를 넘게, 쇠 날
    // 길이는 키의 1.15배쯤(몸 배율 big이 함께 키운다 — 골리앗은 이미 1.6배라 길이를 또 곱하니 키의 두 배 가까이 됐다, 사용자 2026-11).
    // 골리앗의 창은 자루만 굵게 — 베틀 채 같았다(삼상 17:7)
    const k = kind === 'bigspear' ? 1.8 : 1, L = 1.05; g.add(rod(L, ROD * k, '#5a4128'));
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.02 * Math.sqrt(k), 0.1 * Math.sqrt(k), 5), mat('#b9b7ad', { metalness: 0.6, roughness: 0.4 }));
    tip.position.y = L + 0.05 * Math.sqrt(k); g.add(tip);
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
const QB = new THREE.Quaternion(), AX = new THREE.Vector3(1, 0, 0);
// 지팡이는 왼손에 (사용자 2026-11: 왼손의 반쯤 쥔 모양이 막대를 쥐기에 알맞았다), 창은 오른손 — 방패가 왼손이라
const QW1 = new THREE.Quaternion(), QW2 = new THREE.Quaternion(), QW3 = new THREE.Quaternion(), VA = new THREE.Vector3(), VB = new THREE.Vector3(), VC = new THREE.Vector3(), VD = new THREE.Vector3();
const ROD_OUT = 0.15; // 막대가 몸 가운데서 떨어져 설 거리 — 다리(±0.06)·옷자락·막대 굵기 바깥 (몸 기준 단위)
// 뼈를 돌려 그 자식 뼈 쪽이 몸 기준 방향 dir을 보게 (가장 작은 회전 — 몸 기준 dir은 root 좌표)
function aim(bone, child, root, dir) {
  root.updateMatrixWorld(true);
  const from = child.getWorldPosition(new THREE.Vector3()).sub(bone.getWorldPosition(new THREE.Vector3())).normalize();
  const to = dir.clone().transformDirection(root.matrixWorld);
  const pw = bone.parent.getWorldQuaternion(new THREE.Quaternion()), q = new THREE.Quaternion().setFromUnitVectors(from, to);
  bone.quaternion.premultiply(pw.clone().invert().multiply(q).multiply(pw)); // 세계 회전 q를 부모 좌표로
  bone.updateMatrixWorld(true);
}
const ROD_R = ROD + 0.007; // 막대 반지름 + 손가락 두께의 절반 (몸 기준 단위)
function wrapAngle(pts, root) {
  root.updateMatrixWorld(true);
  const p = pts.map(b => root.worldToLocal(b.getWorldPosition(new THREE.Vector3()))), s = (p[0].distanceTo(p[1]) + p[1].distanceTo(p[2])) / 2;
  return Math.min(1.5, Math.max(0.5, 2 * Math.asin(Math.min(1, s / (2 * ROD_R)))));
}
// 세 점을 지나는 원의 가운데 (세계 좌표로 out에)
function arcCenter(pts, out) {
  const [A, B, C] = pts.map(b => b.getWorldPosition(new THREE.Vector3()));
  const a = A.clone().sub(C), b = B.clone().sub(C), n = a.clone().cross(b), nn = n.lengthSq();
  if (nn < 1e-12) return out.copy(B);
  const t = b.clone().multiplyScalar(a.lengthSq()).sub(a.clone().multiplyScalar(b.lengthSq())).cross(n).multiplyScalar(1 / (2 * nn));
  return out.copy(C).add(t);
}
const HOLD = { staff: 'L', crook: 'L', rod: 'L', spear: 'R', bigspear: 'R', scutum: 'L', shield: 'L', bigshield: 'L', jar: 'top', helmet: 'top' };

// 차분한 말하기: Mixamo 'talk'는 팔 몸짓은 좋은데 엉덩이·허리·고개가 크게 흔들려(고개 29°, 엉덩이 12°) 건들거렸다(사용자 2026-11).
// 팔·어깨·손은 talk 그대로, 몸통·고개·다리는 가만히 선 idle에서 가져와 한 동작으로 합친다 (모델마다 한 번만)
// 끊김 없는 되풀이: Mixamo 동작은 끝 자세가 첫 자세와 달라 한 바퀴 돌 때마다 뚝 끊겼다(말하기는 오른손이 75° 튀었다 — 사용자 2026-11).
// 끝의 W초 동안 첫 자세 쪽으로 부드럽게 끌어 마지막 열쇠를 첫 자세와 같게 한다 (걷기처럼 짧은 동작은 W도 짧게)
const smooth = x => x * x * (3 - 2 * x);
function seamless(clip) {
  const dur = clip.duration, W = Math.min(0.6, dur * 0.12);
  // 이미 이어지는 동작(걷기 — 끝과 처음이 같다)은 그대로: 끌어당기면 한 바퀴 끝에서 걸음이 잠깐 느려졌다
  const gap = Math.max(0, ...clip.tracks.filter(k => k.ValueTypeName === 'quaternion' && k.times.length > 1).map(k => {
    const v = k.values, n = v.length - 4; return 2 * Math.acos(Math.min(1, Math.abs(v[0] * v[n] + v[1] * v[n + 1] + v[2] * v[n + 2] + v[3] * v[n + 3]))) * 57.3;
  }));
  if (gap < 0.5) return clip;
  const tracks = clip.tracks.map(k => {
    const n = k.getValueSize(), T = Array.from(k.times), V = Array.from(k.values);
    if (T.length < 2) return k;
    const first = V.slice(0, n), quat = k.ValueTypeName === 'quaternion';
    if (T[T.length - 1] < dur - W) { T.push(dur - W); V.push(...V.slice(-n)); } // 일찍 끝나는 열쇠(합친 idle)는 그 자세로 버티다가
    for (let i = 0; i < T.length; i++) {
      if (T[i] <= dur - W) continue;
      const a = smooth(Math.min(1, (T[i] - (dur - W)) / W));
      if (quat) THREE.Quaternion.slerpFlat(V, i * n, V, i * n, first, 0, a);
      else for (let c = 0; c < n; c++) V[i * n + c] += (first[c] - V[i * n + c]) * a;
    }
    if (T[T.length - 1] < dur - 1e-4) { T.push(dur); V.push(...first); } else V.splice(-n, n, ...first);
    return new k.constructor(k.name, T, V);
  });
  return new THREE.AnimationClip(clip.name, dur, tracks);
}
const ARM_W = [0.15, 0.1]; // 위팔, 팔뚝을 기본 자세 쪽으로 끄는 비율
// 미리암(사용자 2026-11): 넓은 소매 뒷자락이 팔꿈치 굽힘을 따라 접혀 팔꿈치 뒤로 삐죽 나왔다 — 팔을 벌리면 다른 사람과 달라
// 어색했고, 팔꿈치를 곧게 펴니(팔뚝은 기본 자세 그대로) 자락이 접히지 않았다. 모델마다 [위팔, 팔뚝] — 모든 동작에
const ARM_OPEN = { miriam: [0.25, 1] };
const armW = (name, W = ARM_W) => !name.endsWith('.quaternion') ? 0 : /Hand(Thumb|Index|Middle|Ring|Pinky)\d\.|Hand\./.test(name) ? 1 : /ForeArm\./.test(name) ? W[1] : /Arm\./.test(name) ? W[0] : 0;
const STAND = /(Hips|Leg)\.quaternion$/;
// 쇄골(Shoulder)은 모든 동작에서 모델을 뜬 그대로 — Mixamo 동작이 쇄골을 안쪽 아래로 당겨 어깨가 오므라들고 좁아졌다
// (사용자 2026-11: 어깨 너비는 변하면 안 된다). 쇄골만 되돌리면 위팔이 그 회전을 따라 들리므로(안드레가 두 팔을 벌렸다)
// 위팔에는 그만큼 거꾸로 돌려 준다 — 쇄골과 위팔의 부모가 같은 가슴 뼈라 열쇠마다 arm' = rest⁻¹·c(t)·arm(t)이면 팔 방향이 그대로다
function keepClavicles(clip, rest) {
  const tr = Object.fromEntries(clip.tracks.map(k => [k.name, k]));
  const fix = {};
  for (const S of ['Left', 'Right']) {
    const c = clip.tracks.find(k => new RegExp(`${S}Shoulder\\.quaternion$`).test(k.name)), a = clip.tracks.find(k => new RegExp(`${S}Arm\\.quaternion$`).test(k.name));
    const cn = c?.name.split('.')[0]; if (!c || !a || !rest[cn]) continue;
    const R = new THREE.Quaternion().fromArray(rest[cn]).invert(), ci = c.createInterpolant(), Q = new THREE.Quaternion(), C = new THREE.Quaternion();
    const V = Array.from(a.values);
    for (let i = 0; i < a.times.length; i++) { C.fromArray(ci.evaluate(a.times[i])); Q.fromArray(V, i * 4).premultiply(C).premultiply(R); Q.toArray(V, i * 4); }
    fix[c.name] = new THREE.QuaternionKeyframeTrack(c.name, [0], rest[cn]); fix[a.name] = new THREE.QuaternionKeyframeTrack(a.name, Array.from(a.times), V);
  }
  return Object.keys(fix).length ? new THREE.AnimationClip(clip.name, clip.duration, clip.tracks.map(k => fix[k.name] || k)) : clip;
} // UpLeg도 Leg로 끝난다
// 허리는 기본 자세로 되돌리지 않는다 — 모델마다 기본 자세의 허리가 idle과 20~28° 달라(안드레·사마리아 여인·십보라·삭개오)
// 되돌리면 팔이 앞으로 들려 이상했다(사용자 2026-11). idle의 허리는 그대로 두고, 첫 자세에서 몸통(허리→목)이
// 곧게 서도록 허리 첫 뼈(Spine)만 한 번 돌려 배가 나오지 않게 한다 — 허리 위(가슴·팔·고개)는 idle 그대로 따라온다
function upright(gltf, clip) {
  const sc = clone(gltf.scene), mixer = new THREE.AnimationMixer(sc);
  mixer.clipAction(clip).play(); mixer.update(0); sc.updateMatrixWorld(true);
  const sp = bone(sc, 'Spine'), nk = bone(sc, 'Neck'); if (!sp || !nk) return clip;
  const t = nk.getWorldPosition(new THREE.Vector3()).sub(sp.getWorldPosition(new THREE.Vector3())).normalize();
  const pw = sp.parent.getWorldQuaternion(new THREE.Quaternion()), q = new THREE.Quaternion().setFromUnitVectors(t, new THREE.Vector3(0, 1, 0));
  // 몸통을 세운 만큼 팔과 목은 거꾸로 돌려 원래 동작의 방향을 지킨다 — 그러지 않으면 몸통과 함께 젖혀져
  // 팔이 앞으로 들리고 고개가 위를 보았다(사용자 2026-11, 안드레). 세계 회전 q를 되돌리는 부모 좌표의 회전
  const fix = { [sp.name]: pw.clone().invert().multiply(q).multiply(pw) };
  for (const n of ['LeftArm', 'RightArm', 'Neck']) { const b = bone(sc, n); if (!b) continue; const pa = b.parent.getWorldQuaternion(new THREE.Quaternion()); fix[b.name] = pa.clone().invert().multiply(q.clone().invert()).multiply(pa); }
  const byName = Object.fromEntries(Object.keys(fix).map(n => [n + '.quaternion', n]));
  mixer.stopAllAction();
  const tracks = [...clip.tracks];
  for (const [tn, n] of Object.entries(byName)) if (!tracks.some(k => k.name === tn)) tracks.push(new THREE.QuaternionKeyframeTrack(tn, [0], sc.getObjectByName(n).quaternion.toArray())); // 덜어 낸 뼈면 지금 자세로 하나 만든다
  return new THREE.AnimationClip(clip.name, clip.duration, tracks.map(k => {
    const n = byName[k.name]; if (!n) return k;
    const V = Array.from(k.values), Q = new THREE.Quaternion();
    for (let i = 0; i < V.length; i += 4) { Q.fromArray(V, i).premultiply(fix[n]); Q.toArray(V, i); }
    return new THREE.QuaternionKeyframeTrack(k.name, Array.from(k.times), V);
  }));
}
const calm = new WeakMap(), BODY = /(Hips|Spine|Neck|Head|Leg|Foot|Toe)[^.]*\./;
// 여정의 3D 무대(stage/model-actor.js)도 같은 동작을 쓴다 — 게임과 무대가 같은 모델이니 다듬은 동작도 함께
export function calmClips(gltf) {
  if (calm.has(gltf)) return calm.get(gltf);
  const by = Object.fromEntries(gltf.animations.map(c => [c.name, c])), t = by.talk, i = by.idle;
  let out = gltf.animations.map(seamless);
  if (t && i) {
    const still = i.tracks.filter(k => BODY.test(k.name)), have = new Set(still.map(k => k.name));
    // idle에서 덜어 낸(움직이지 않는) 뼈는 기본 자세로 못 박는다 — 비워 두면 앞 동작(걷기)의 마지막 자세에 멈춰 있었다
    for (const k of t.tracks) if (BODY.test(k.name) && !have.has(k.name)) {
      const [n, prop] = k.name.split('.'), o = gltf.scene.getObjectByName(n); if (!o || !o[prop]) continue;
      const v = o[prop].toArray(), T = prop === 'quaternion' ? THREE.QuaternionKeyframeTrack : THREE.VectorKeyframeTrack;
      still.push(new T(k.name, [0], v));
    }
    // idle(4초)이 talk(6초)보다 짧으면 몸통 열쇠가 4초에서 끝나 그 뒤가 1.4초 비었다 — 그 빈 구간에서 목·어깨가 한순간 기본 자세로 튀었다
    // (예수님 말하기, 사용자 2026-11). idle을 talk 길이만큼 되풀이해 채운다
    const tile = k => { if (k.times.length < 2 || i.duration >= t.duration) return k; const n = k.getValueSize(), T = [], V = [];
      for (let o = 0; o < t.duration; o += i.duration) for (let j = 0; j < k.times.length; j++) { const tt = k.times[j] + o; if (tt > t.duration || (o > 0 && j === 0 && T.length && tt <= T[T.length - 1])) continue; T.push(tt); for (let c = 0; c < n; c++) V.push(k.values[j * n + c]); }
      return new k.constructor(k.name, T, V); };
    const tracks = [...t.tracks.filter(k => !BODY.test(k.name)), ...still.map(tile)];
    out = out.map(c => c.name === 'talk' ? seamless(new THREE.AnimationClip('talk', t.duration, tracks)) : c);
  }
  // 곧게 서기: Mixamo idle은 엉덩이(11°)·허리(12°)를 뒤로 젖혀 배가 나온 자세였다(사용자 2026-11 — 원래 3D 디자인은 그렇지 않다).
  // 서 있거나 말할 때는 엉덩이·허리·목·다리를 기본 자세(모델을 뜬 그대로)로 세운다 — 팔·손·고개의 움직임은 그대로
  const rest = {}, restP = {}; gltf.scene.traverse(o => { if (o.isBone) { rest[o.name] = o.quaternion.toArray(); restP[o.name] = o.position.toArray(); } });
  out = out.map(c => keepClavicles(c, rest));
  out = out.map(c => c.name !== 'idle' && c.name !== 'talk' ? c : upright(gltf, new THREE.AnimationClip(c.name, c.duration, c.tracks.map(k => {
    const n = k.name.split('.')[0];
    if (STAND.test(k.name) && rest[n]) return new THREE.QuaternionKeyframeTrack(k.name, [0], rest[n]);
    // 엉덩이 높이도 기본 자세로 — 다리만 곧게 펴고 엉덩이는 무릎 굽힌 idle의 낮은 높이에 두니 발이 땅에 묻혔다 (사용자 2026-11)
    if (/Hips\.position$/.test(k.name) && restP[n]) return new THREE.VectorKeyframeTrack(k.name, [0], restP[n]);
    return k;
  }))));
  // 팔·손은 A자 기본 자세 쪽으로 조금 (사용자 2026-11): 보내 준 A자 모델은 팔·손이 멀쩡한데, Mixamo idle은 팔을 몸에 붙여 내려
  // 소매·겉옷 속으로 팔이 묻히고 손목이 꺾여 손이 기형처럼 보였다. 서 있는 동작만 — 위팔·팔뚝은 기본 자세 쪽으로 ARM_W만큼, 손·손가락은 기본 자세 그대로
  const open = ARM_OPEN[gltf.userData?.name];
  out = out.map(c => c.name !== 'idle' && !open ? c : new THREE.AnimationClip(c.name, c.duration, c.tracks.map(k => {
    const n = k.name.split('.')[0], w = c.name === 'idle' ? armW(k.name, open || ARM_W) : /Hand/.test(k.name) ? 0 : armW(k.name, open); if (!w || !rest[n]) return k;
    const V = Array.from(k.values); for (let i = 0; i < V.length; i += 4) THREE.Quaternion.slerpFlat(V, i, V, i, rest[n], 0, w);
    return new THREE.QuaternionKeyframeTrack(k.name, Array.from(k.times), V);
  })));
  calm.set(gltf, out); return out;
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
    this.acts = Object.fromEntries(calmClips(gltf).map(c => [c.name, this.mixer.clipAction(c)]));
    this.cur = null;
    this.pos = new THREE.Vector2(x, z); this.goal = this.pos.clone();
    this.face = 0; this.faceT = 0; this.pose = 'idle'; this.target = null;
    this.speed = 0.55; this.show = 1; this.showT = 1; this.ground = 0; this.big = 1; this.realWalk = true;
    // 베개: 누워 잘 때 머리 밑에 (막 4:38 — 배 고물에서 베개를 베고 주무셨다, 사용자 2026-11)
    this.pillow = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.14, 4, 12), new THREE.MeshStandardMaterial({ color: '#efe2c2', roughness: 1 }));
    this.pillow.rotation.z = Math.PI / 2; this.pillow.scale.set(1, 1, 0.6); this.pillow.visible = false;
    this.p.root.add(this.pillow); this.noPillow = !!o.noPillow; // 길가에 쓰러진 사람은 베개 없이
    this.hands = { R: bone(body, 'RightHand'), L: bone(body, 'LeftHand'), top: bone(body, 'HeadTop_End') };
    // 내린 팔의 팔뚝 비틀기: 엄지가 앞, 손바닥이 허벅지를 보게 (아래 update의 turnThumbs)
    this.arms = ['Left', 'Right'].map(S => ({ k: S[0], arm: bone(body, S + 'Arm'), fore: bone(body, S + 'ForeArm'), hand: bone(body, S + 'Hand'), thumb: bone(body, S + 'HandThumb1'), pinky: bone(body, S + 'HandPinky1') })).filter(a => a.fore && a.hand && a.thumb && a.pinky);
    // 지팡이·창을 쥐는 손 (사용자 2026-11): 손목 자리에 세우면 늘어진 팔뚝을 꿰뚫었고, 손 앞에 세우면 들고 있지 않아 보였다.
    // 팔꿈치를 직각으로 들어 팔뚝을 앞으로 눕히고, 손가락을 C자로 둥글게 굽혀 엄지와 만든 고리 속으로 막대가 지나가게 한다.
    // 손가락을 한 번에 크게 꺾으면 기형처럼 보였다 — 세 마디를 0.6씩만. Mixamo 팔뚝·손가락은 제 X축으로 굽는다
    this.grip = {};
    for (const [k, S] of [['R', 'Right'], ['L', 'Left']]) {
      const g = { fore: bone(body, S + 'ForeArm'), pts: ['HandMiddle1', 'HandMiddle2', 'HandMiddle3'].map(n => bone(body, S + n)), on: false, hand: bone(body, S + 'Hand'), arm: bone(body, S + 'Arm'),
        fingers: ['Middle1', 'Middle2', 'Middle3', 'Index1', 'Index2', 'Index3', 'Ring1', 'Ring2', 'Ring3', 'Pinky1', 'Pinky2', 'Pinky3'].map(n => bone(body, S + 'Hand' + n)).filter(Boolean) };
      if (g.fore && g.hand && g.arm && g.pts.every(Boolean)) { g.bones = [g.arm, g.fore, g.hand, ...g.fingers]; g.base = g.bones.map(b => b.quaternion.clone()); this.grip[k] = g; } // 움직이지 않는 뼈는 동작 기록을 덜어 두어(glbslim) 믹서가 되돌려 주지 않으니 처음 자세를 기억해 둔다
    }
    this.gear = [];
    this.play('idle', 0);
  }
  // 손에 들려 주기 (game-cast.js의 GEAR): ['staff'] 등 — 같은 쪽 손에 둘을 주지 않는다
  hold(list = []) {
    for (const k of list) { const b = this.hands[HOLD[k]]; if (!b) continue; const m = makeGear(k); m.userData.bone = b; const gr = m.userData.ground && this.grip[HOLD[k]]; if (gr) { m.userData.grip = gr; gr.on = true; } this.p.root.add(m); this.gear.push(m); }
    return this;
  }
  // 손목을 돌려 손가락이 굽는 축(가운뎃손가락 뿌리 뼈의 X축)이 위를 보게 — 그래야 굽은 손가락이 세로 막대를 감싼다.
  // 동작마다 손목이 달라 손바닥이 아래를 보면 손가락이 막대 앞에서 허공을 쥐었다
  align(g) {
    g.hand.quaternion.copy(g.handA); this.p.root.updateMatrixWorld(true);
    const hw = g.hand.getWorldQuaternion(QW1), ax = VA.set(1, 0, 0).applyQuaternion(g.fingers[0].getWorldQuaternion(QW2)), up = VB.set(0, Math.sign(ax.y) || 1, 0);
    QB.setFromUnitVectors(ax, up); g.hand.quaternion.copy(g.hand.parent.getWorldQuaternion(QW2).invert().multiply(QB.multiply(hw)));
    g.hand.updateMatrixWorld(true);
  }
  // 팔을 내리면 팔뚝이 안쪽으로 돌아 엄지가 앞을 보고 손바닥이 허벅지를 본다(사용자 2026-11). A자로 뜬 손(손바닥이 아래)을
  // 그대로 내리면 손등·손바닥이 엉뚱한 쪽을 보았다 — 팔뚝을 제 축으로 돌려(손목은 꺾지 않는다) 엄지를 몸 앞쪽으로.
  // 팔이 늘어져 있을수록 다 돌리고, 말하며 팔을 들면 덜 (막대를 쥔 손은 grip이 따로 맞춘다)
  turnThumbs(k = 1) {
    const r = this.p.root; r.updateMatrixWorld(true);
    const fwd = VC.set(0, 0, 1).transformDirection(r.matrixWorld);
    for (const a of this.arms) {
      if (this.grip?.[a.k]?.on) continue;
      // 비틀기를 팔뚝 한 곳에서 다 하면 소매가 팔꿈치에서 꼬여 삐죽 튀어나왔다(미리암, 사용자 2026-11) —
      // 실제 팔처럼 위팔(제 축)과 팔뚝에 반씩 나눈다
      for (const [b, end, part] of [[a.arm, a.fore, 0.5], [a.fore, a.hand, 1]]) {
        if (!b) continue;
        const f = b.getWorldPosition(VA), h = end.getWorldPosition(VB), axis = h.clone().sub(f).normalize();
        const fa = a.fore.getWorldPosition(new THREE.Vector3()), fh = a.hand.getWorldPosition(new THREE.Vector3());
        const w = Math.min(1, Math.max(0, (-(fh.y - fa.y) / fh.distanceTo(fa) - 0.4) / 0.4)); if (!w) break; // 팔뚝이 아래로 늘어진 만큼
        const t = a.thumb.getWorldPosition(new THREE.Vector3()).sub(a.pinky.getWorldPosition(new THREE.Vector3())); t.addScaledVector(axis, -t.dot(axis)); // 새끼 쪽에서 엄지 쪽으로 — 엄지 뿌리만 보면 모델마다 손바닥 가운데 가까이 붙어 있어 방향을 잘못 잡았다(안드레)
        const want = fwd.clone().addScaledVector(axis, -fwd.dot(axis));
        if (t.lengthSq() < 1e-10 || want.lengthSq() < 1e-10) break;
        t.normalize(); want.normalize();
        const ang = Math.atan2(axis.dot(t.clone().cross(want)), t.dot(want)) * w * part * k;
        const pw = b.parent.getWorldQuaternion(QW1), q = QW2.setFromAxisAngle(axis, ang);
        b.quaternion.premultiply(pw.clone().invert().multiply(q).multiply(pw));
        b.updateMatrixWorld(true);
      }
    }
  }
  nod() { if (!(this.nodT > 0)) this.nodT = 0.9; }
  play(name, fade = 0.35) {
    const a = this.acts[name] || this.acts.idle; if (!a || a === this.cur) return;
    a.reset().setEffectiveWeight(1).play();
    // 함께 걷는 사람들의 발이 똑같이 맞지 않게 — 걸음의 시작과 빠르기를 저마다 조금씩(병정은 march로 맞춘다, 사용자 2026-11)
    if (name === 'walk' && !this.march) { this.stride ??= Math.random(); this.pace ??= 0.9 + Math.random() * 0.2; a.time = this.stride * a.getClip().duration; a.timeScale = this.pace; } else a.timeScale = 1;
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
    for (const g of Object.values(this.grip)) if (g.on) g.bones.forEach((b, i) => b.quaternion.copy(g.base[i]));
    if (this._nodQ) { this.head.quaternion.copy(this._nodQ); this._nodQ = null; } // 지난 화면의 끄덕임을 걷고 (동작에 고개 기록이 없는 모델은 쌓였다)
    this.mixer.update(dt);
    // 끄덕임: 고개를 두 번 가볍게 숙였다 든다 (곁의 사람이 그분의 말을 들으며)
    if (this.nodT > 0 && this.head) { this.nodT -= dt; const u = 1 - this.nodT / 0.9; this._nodQ = this.head.quaternion.clone(); this.head.quaternion.multiply(QB.setFromAxisAngle(AX, Math.sin(u * Math.PI * 2) ** 2 * 0.22)); }
    // 엄지 돌리기는 팔을 늘어뜨린 서 있기·걷기에만 — 말하기(손바닥을 펴는 손짓)·기도·잠에도 넣으니 손목이 비틀렸다(사용자 2026-11: 동작을 구분해 보정)
    // 다른 동작에서 넘어오는 동안은 그 동작의 무게만큼만
    const calm = ['idle', 'walk'].reduce((w, n) => w + (this.acts[n] && this.acts[n].isRunning() ? this.acts[n].getEffectiveWeight() : 0), 0);
    if (calm > 0.01) this.turnThumbs(Math.min(1, calm));
    // 동작 위에 팔꿈치 굽힘을 덧입힌다 (걸을 때는 덜 — 걷기가 이미 팔꿈치를 굽힌다)
    if (!(this.pose === 'sleep' && !moving)) for (const g of Object.values(this.grip)) if (g.on) {
      // 손가락이 막대를 감싸 쥐게 (사용자 2026-11): 동작의 손가락 자세 위에 더하면 모델마다 굽힘이 달라 이상했다 —
      // 곧게 편 처음 자세에서 마디마다 같은 각도로 굽혀 손가락이 막대 둘레(반지름 + 손가락 두께)의 원을 따르게 한다.
      // 각도는 마디 길이 s에서: 한 마디가 원의 현이 되도록 θ = 2·asin(s / 2R)
      g.th ??= wrapAngle(g.pts, this.p.root);
      QB.setFromAxisAngle(g.fax || AX, g.th); g.fingers.forEach(f => f.quaternion.copy(g.base[g.bones.indexOf(f)]).multiply(QB));
      (g.handA ??= new THREE.Quaternion()).copy(g.hand.quaternion);
      // 팔 자세: 위팔은 어깨에서 바깥으로 벌리고(걸을 때 앞뒤로 흔드는 것은 절반쯤 남김), 팔뚝은 팔꿈치에서 직각으로 앞을 향한다.
      // 팔뚝 뼈만 굽혔더니 동작마다 위팔이 비틀려 있어 팔뚝이 옆으로 꺾였다(사용자 2026-11) — 뼈의 방향을 몸 기준으로 직접 맞춘다.
      // 걸을 때 막대가 무릎·옷자락을 뚫지 않게 막대가 몸 가운데서 ROD_OUT 밖에 설 때까지 조금씩 더 벌린다
      const r = this.p.root, side = g === this.grip.L ? 1 : -1;
      r.updateMatrixWorld(true);
      const swing = r.worldToLocal(g.fore.getWorldPosition(VC)).z - r.worldToLocal(g.arm.getWorldPosition(VD)).z; // 동작이 흔드는 위팔의 앞뒤
      const qa = QW3.copy(g.arm.quaternion);
      for (let t = 0.12; t <= 0.7; t += 0.06) {
        g.arm.quaternion.copy(qa);
        aim(g.arm, g.fore, r, VA.set(side * Math.sin(t), -Math.cos(t), swing * 0.5 / 0.15).normalize());
        aim(g.fore, g.hand, r, VA.set(side * 0.12, -0.08, 1).normalize());
        this.align(g);
        if (side * r.worldToLocal(arcCenter(g.pts, VD)).x >= ROD_OUT) break;
      }
    }
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
        const v = g.userData.bone.getWorldPosition(new THREE.Vector3());
        if (g.userData.grip) arcCenter(g.userData.grip.pts, v); // 막대는 굽은 가운뎃손가락 세 마디가 그리는 원의 가운데로
        r.worldToLocal(v); g.position.copy(v);
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

/* 다윗 여정에만 쓰는 소품: props.js의 MAKERS에 더한다 (공용 파일을 키우지 않게).
   크기는 사람 키(약 0.88)와의 비례로. 무대 x는 오른쪽(+, 동쪽), z는 앞(+, 화면 아래). 앞으로 나아가는 것(짐승·창·수레)은 +x가 머리 */
import { THREE, mat, DS, lathe, mesh, sphere, glowTexture, damp } from '../kit.js';
import { MAKERS, Prop } from '../props.js';

const wood = () => mat('#7a5634', { roughness: 0.95 });
const rockM = (c = '#a8977c') => mat(c, { roughness: 1, flatShading: true });
const glow = (size, opacity = 1) => {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity }));
  s.scale.set(size, size, 1);
  return s;
};
// 바위: 모양이 저마다 다르게 돌리되, 늘인 방향(sc)은 그대로 — 묶음째 돌리면 옆으로 늘인 바위가 앞으로 튀어나왔다
const boulder = (g, m, r, pos, sc = [1, 1, 1], detail = 0) => { const geo = new THREE.DodecahedronGeometry(r, detail); geo.rotateY(pos[0] * 5 + pos[2] * 3); const b = mesh(geo, m, g, pos, sc); b.receiveShadow = true; return b; };
// 다른 소품(짐승·언약궤)을 묶음 안에 넣어 함께 움직인다 — 그 소품의 update도 대신 불러 준다
const inner = (g, kind, o, pos, rot = 0) => { const P = MAKERS[kind](o); P.obj.position.set(...pos); P.obj.rotation.y = rot; g.add(P.obj); return P; };

Object.assign(MAKERS, {
  // 굴 입구 (아둘람·엔게디): 양옆 바위 기둥과 위의 너럭바위 사이로 어두운 입구가 앞(+z)을 향해 열린다. 뒤로 바위 덩이.
  // 사람(키 0.88)이 서서 드나들 만한 높이. o.color로 바위빛 (엔게디는 밝은 석회암 '#c9bb9c')
  cave(o = {}) {
    const g = new THREE.Group(), m = rockM(o.color || '#a8977c'), S = o.size || 1;
    boulder(g, m, 0.62 * S, [0, 0.42 * S, -0.42 * S], [1.6, 1.05, 0.85], 1);   // 뒤의 바위 덩이
    boulder(g, m, 0.3 * S, [-0.52 * S, 0.34 * S, 0.0], [0.7, 1.4, 0.75]);    // 왼쪽 기둥 (입구 너비 약 0.5를 비워 둔다)
    boulder(g, m, 0.3 * S, [0.52 * S, 0.32 * S, 0.02 * S], [0.7, 1.35, 0.75]); // 오른쪽 기둥
    boulder(g, m, 0.32 * S, [0, 0.9 * S, -0.02 * S], [1.9, 0.6, 0.8]);        // 입구 위 너럭바위
    boulder(g, m, 0.2 * S, [-0.85 * S, 0.14 * S, 0.1 * S], [1.2, 0.8, 1]);
    boulder(g, m, 0.16 * S, [0.85 * S, 0.1 * S, 0.14 * S], [1.1, 0.7, 1]);
    // 입구의 어둠: 빛을 받지 않는 검은 면 둘(입구와 그 안쪽 바닥) — 굴 안이 깊어 보이게
    const dark = new THREE.MeshBasicMaterial({ color: '#100b08' });
    const sh = new THREE.Shape(), w = 0.23 * S, h = 0.6 * S;
    sh.moveTo(-w, 0); sh.lineTo(-w, h - w); sh.absarc(0, h - w, w, Math.PI, 0, true); sh.lineTo(w, 0); sh.lineTo(-w, 0);
    const mouth = mesh(new THREE.ShapeGeometry(sh, 12), dark, g, [0, 0.005, 0.25 * S]); mouth.castShadow = false; // 기둥 앞면과 같은 깊이에 — 더 안쪽에 두면 바위 덩이에 가려졌다
    const floor = mesh(new THREE.CircleGeometry(0.22 * S, 20), dark, g, [0, 0.006, 0.2 * S]); floor.rotation.x = -Math.PI / 2; floor.scale.set(1, 0.6, 1); floor.castShadow = false;
    return new Prop(g);
  },

  // 창·화살: 날아가는 것 (앞 +x가 촉). o.arrow면 화살, o.len은 창 길이(기본 1.05 — 방 안에서는 0.8쯤). 움직일 때 가는 쪽을 향한다(directional) — 대본에서 speed를 준다 (창 3, 화살 4쯤).
  // state 'fly'(수평, 높이는 o.y) | 'stuck'(벽에 박혀 떨다가 멎는다) | 'ground'(땅에 꽂혀 곧게 선다 — 잠든 사울의 머리맡, 삼상 26:7)
  spear(o = {}) {
    const g = new THREE.Group(), tilt = new THREE.Group(); g.add(tilt);
    const L = o.arrow ? 0.34 : o.len || 1.05, r = o.arrow ? 0.0035 : 0.009;
    mesh(new THREE.CylinderGeometry(r, r * 1.15, L, 6), mat(o.arrow ? '#a8875a' : '#5e4128'), tilt, [0, 0, 0]).rotation.z = Math.PI / 2;
    mesh(new THREE.ConeGeometry(r * 2.4, o.arrow ? 0.03 : 0.09, 8), mat('#9a9a92', { metalness: 0.6, roughness: 0.4 }), tilt, [L / 2 + (o.arrow ? 0.012 : 0.04), 0, 0]).rotation.z = -Math.PI / 2;
    if (o.arrow) [-1, 1].forEach(k => mesh(new THREE.BoxGeometry(0.05, 0.002, 0.016), mat('#efe6cf', DS), tilt, [-L / 2 + 0.03, 0, k * 0.004]).rotation.x = k * 0.6);
    const P = new Prop(g, (P, t, dt) => {
      const st = P.state, k = Math.max(0, 1.2 - (performance.now() / 1000 - P.t0));
      if (st === 'ground') { tilt.rotation.z = damp(tilt.rotation.z, Math.PI / 2 - 0.1, 8, dt); tilt.position.y = L / 2 - 0.06 - g.position.y; }
      else { tilt.rotation.z = st === 'stuck' ? -0.12 + Math.sin(t * 40) * 0.05 * k : 0; tilt.position.y = 0; }
    }, { state: o.state || 'fly' });
    P.directional = true;
    return P;
  },

  // 물병: 잠든 사울의 머리맡 (삼상 26:11)
  jug() {
    const g = new THREE.Group();
    mesh(lathe([[0.001, 0], [0.04, 0], [0.065, 0.06], [0.06, 0.12], [0.03, 0.16], [0.025, 0.2], [0.032, 0.21], [0.001, 0.21]], 18), mat('#b5653e', { roughness: 0.9 }), g);
    mesh(new THREE.TorusGeometry(0.03, 0.006, 6, 12, Math.PI), mat('#9a5534'), g, [0.035, 0.15, 0]).rotation.z = -Math.PI / 2;
    return new Prop(g);
  },

  // 시냇물 (엘라 골짜기, 삼상 17:40): 굽이진 좁은 물길과 둑의 매끄러운 돌. o.len 길이, 물길은 x 방향
  brook(o = {}) {
    const g = new THREE.Group(), L = o.len || 2.2;
    const geo = new THREE.PlaneGeometry(L, 0.16, 48, 2); geo.rotateX(-Math.PI / 2);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i); p.setZ(i, p.getZ(i) + Math.sin(x * 2.6) * 0.1); }
    geo.computeVertexNormals();
    const wm = new THREE.MeshStandardMaterial({ color: '#7fa8b0', roughness: 0.2, metalness: 0.1, transparent: true, opacity: 0.85, depthWrite: false });
    const w = mesh(geo, wm, g, [0, 0.012, 0]); w.castShadow = false; w.renderOrder = 2;
    const st = mat('#d8d0c0', { roughness: 0.55 }), st2 = mat('#a89a82', { roughness: 1, flatShading: true });
    for (let i = 0; i < 30; i++) {
      const x = (i / 29 - 0.5) * L * 0.95, side = i % 2 ? 1 : -1, z = Math.sin(x * 2.6) * 0.1 + side * (0.1 + (i % 3) * 0.02);
      mesh(sphere(0.014 + (i % 4) * 0.005, 8, 6), i % 3 ? st : st2, g, [x, 0.01, z], [1.3, 0.6, 1]);
    }
    return new Prop(g, (P, t) => { w.material.opacity = 0.85 * P.show; }, { fade: 'opacity' });
  },

  // 진영: 비탈에 늘어선 작은 군막들과 깃대 (엘라 골짜기 양쪽 산 — 이스라엘 '#8a7a62', 블레셋 '#d8c8a8'). o.n 군막 수, o.span 너비
  camp(o = {}) {
    const g = new THREE.Group(), n = o.n || 5, span = o.span || 1.4, cloth = mat(o.color || '#8a7a62', { roughness: 1, flatShading: true });
    for (let i = 0; i < n; i++) {
      const x = (i / Math.max(1, n - 1) - 0.5) * span, z = (i % 2) * 0.16 - 0.08;
      // 네모뿔 군막: 둥근 기둥(세모 기둥)은 매끈한 그늘에 통나무처럼 보였다 — 모난 면으로
      const tnt = mesh(new THREE.ConeGeometry(0.13, 0.19, 4), cloth, g, [x, 0.095, z]); tnt.rotation.y = Math.PI / 4 + (i % 3 - 1) * 0.2; tnt.receiveShadow = true;
      const door = mesh(new THREE.PlaneGeometry(0.05, 0.08), mat('#2a1c10', DS), g, [x, 0.04, z + 0.075]); door.rotation.x = -0.6; door.castShadow = false;
    }
    mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.6, 5), wood(), g, [span * 0.1, 0.3, -0.12]);
    const flag = mesh(new THREE.PlaneGeometry(0.14, 0.08), mat(o.flag || '#9d3328', DS), g, [span * 0.1 + 0.07, 0.55, -0.12]);
    return new Prop(g, (P, t) => { flag.rotation.y = Math.sin(t * 2.5) * 0.25; });
  },

  // 사울의 궁 안 (기브아): 뒤쪽 회벽과 백향목 기둥, 높은 창, 바닥 깔개, 계단 단 위의 왕좌(o.tx: 왕좌의 x, o.throne: false면 없이), 등잔대(o.lamp).
  // 날아온 창은 뒷벽(z ≈ -0.6, 높이 0.5쯤)에 박힌다 — spear 소품을 그 자리로 보내고 'stuck'
  hall(o = {}) {
    const g = new THREE.Group(), W = o.w || 2.4, plaster = mat('#e2d6bc', { roughness: 1 }), cedar = mat('#7a4a2a', { roughness: 0.8 }), stone = mat('#cbbd9e', { roughness: 1 });
    mesh(new THREE.BoxGeometry(W, 0.02, 1.5), stone, g, [0, 0.01, -0.05]).receiveShadow = true;
    const wall = mesh(new THREE.BoxGeometry(W, 1.05, 0.08), plaster, g, [0, 0.525, -0.68]); wall.receiveShadow = true;
    mesh(new THREE.BoxGeometry(W, 0.06, 0.12), cedar, g, [0, 1.06, -0.66]);
    for (let i = 0; i < 5; i++) mesh(new THREE.CylinderGeometry(0.035, 0.04, 1.02, 10), cedar, g, [(i / 4 - 0.5) * (W - 0.2), 0.51, -0.6]);
    [-1, 1].forEach(k => mesh(new THREE.BoxGeometry(0.16, 0.2, 0.02), mat('#2a1c10'), g, [k * W * 0.3, 0.8, -0.635])); // 높은 창
    mesh(new THREE.BoxGeometry(0.4, 0.5, 0.01), mat('#6b2a3a', { roughness: 0.9 }), g, [-W * 0.12, 0.55, -0.633]); // 벽에 건 휘장
    const rug = mesh(new THREE.BoxGeometry(1.0, 0.006, 0.6), mat('#8a3a2a', { roughness: 1 }), g, [0, 0.024, 0.05]); rug.receiveShadow = true;
    mesh(new THREE.BoxGeometry(0.92, 0.007, 0.52), mat('#c9a24a', { roughness: 1 }), g, [0, 0.026, 0.05]).receiveShadow = true;
    mesh(new THREE.BoxGeometry(0.86, 0.008, 0.46), mat('#7a2a20', { roughness: 1 }), g, [0, 0.028, 0.05]).receiveShadow = true;
    if (o.throne !== false) {
      const tx = o.tx ?? 0.7, gold = mat('#d6a93a', { metalness: 0.55, roughness: 0.35 });
      mesh(new THREE.BoxGeometry(0.6, 0.06, 0.45), stone, g, [tx, 0.04, -0.42]).receiveShadow = true;
      mesh(new THREE.BoxGeometry(0.26, 0.2, 0.22), cedar, g, [tx, 0.17, -0.45]);
      mesh(new THREE.BoxGeometry(0.26, 0.03, 0.22), mat('#6b2a5e'), g, [tx, 0.285, -0.45]);
      mesh(new THREE.BoxGeometry(0.28, 0.42, 0.04), cedar, g, [tx, 0.48, -0.55]);
      mesh(new THREE.BoxGeometry(0.3, 0.03, 0.05), gold, g, [tx, 0.7, -0.55]);
    }
    let light;
    if (o.lamp) {
      const lx = o.lamp === true ? -0.75 : o.lamp;
      mesh(new THREE.CylinderGeometry(0.012, 0.03, 0.42, 8), mat('#8a6a3a', { metalness: 0.4, roughness: 0.5 }), g, [lx, 0.21, -0.45]);
      const fl = mesh(new THREE.ConeGeometry(0.014, 0.04, 8), mat('#ffd27a', { emissive: '#ffb347', emissiveIntensity: 2.5 }), g, [lx, 0.45, -0.45]); fl.castShadow = false;
      const h = glow(0.5, 0.8); h.position.set(lx, 0.46, -0.45); g.add(h);
      light = new THREE.PointLight('#ffc070', 1.6, 2.2, 1.4); light.position.set(lx, 0.6, -0.3); g.add(light);
    }
    const P = new Prop(g, (P, t) => { if (light) light.intensity = 1.6 * P.show * (1 + Math.sin(t * 9) * 0.05); });
    // 바닥(floor): 3D 지형의 비탈에서 궁 바닥 밑으로 땅이 꺼진 자리에 선 사람이 바닥에 묻혀 다리가 잘려 보였다 — 바닥 위의 사람·가구는 바닥 높이에 선다
    const tx = o.tx ?? 0.7;
    P.floor = true;
    P.heightAt = (x, z) => { const u = x - g.position.x, v = z - g.position.z;
      if (Math.abs(u) > W / 2 || v < -0.75 || v > 0.7) return 0;
      return o.throne !== false && Math.abs(u - tx) < 0.3 && Math.abs(v + 0.42) < 0.225 ? 0.07 : 0.02; };
    return P;
  },

  // 두 층 흙벽돌 집 (다윗과 미갈의 집, 삼상 19:12): 위층 창. state 'lit'(창에 등불빛) | 'rope'(창에서 땅까지 늘어뜨린 줄, 창도 밝다) | 'idle'
  tallhouse(o = {}) {
    const g = new THREE.Group(), wall = mat(o.wall || '#d3bc96', { roughness: 1 }), roof = mat('#a98f68', { roughness: 1 }), dark = mat('#2a1c10');
    const W = 1.0, H = 1.45, D = 0.8;
    mesh(new THREE.BoxGeometry(W, H, D), wall, g, [0, H / 2, 0]).receiveShadow = true;
    mesh(new THREE.BoxGeometry(W + 0.05, 0.05, D + 0.05), roof, g, [0, H + 0.02, 0]);
    [[0, D / 2], [0, -D / 2]].forEach(([x, z]) => mesh(new THREE.BoxGeometry(W + 0.05, 0.09, 0.04), wall, g, [x, H + 0.09, z]));
    [-W / 2, W / 2].forEach(x => mesh(new THREE.BoxGeometry(0.04, 0.09, D + 0.05), wall, g, [x, H + 0.09, 0]));
    mesh(new THREE.BoxGeometry(W + 0.02, 0.03, D + 0.02), roof, g, [0, 0.72, 0]); // 층 사이 들보 띠
    mesh(new THREE.BoxGeometry(0.24, 0.52, 0.02), dark, g, [0.25, 0.26, D / 2 + 0.006]); // 문
    mesh(new THREE.BoxGeometry(0.28, 0.035, 0.05), roof, g, [0.25, 0.535, D / 2 + 0.02]);
    const WX = -0.2, WY = 1.05;
    mesh(new THREE.BoxGeometry(0.2, 0.22, 0.02), dark, g, [WX, WY, D / 2 + 0.006]); // 위층 창
    mesh(new THREE.BoxGeometry(0.26, 0.03, 0.05), roof, g, [WX, WY - 0.125, D / 2 + 0.02]); // 창턱
    const lm = new THREE.MeshBasicMaterial({ color: '#ffd38a', transparent: true, opacity: 0 });
    mesh(new THREE.BoxGeometry(0.18, 0.2, 0.01), lm, g, [WX, WY, D / 2 + 0.013]).castShadow = false;
    const halo = glow(0.7, 0); halo.position.set(WX, WY, D / 2 + 0.06); g.add(halo);
    const light = new THREE.PointLight('#ffc970', 0, 1.6, 1.5); light.position.set(WX, WY, D / 2 + 0.25); g.add(light);
    const rope = mesh(new THREE.CylinderGeometry(0.01, 0.01, WY - 0.12, 5), mat('#e8dcc0'), g, [WX + 0.05, (WY - 0.12) / 2, D / 2 + 0.04]);
    return new Prop(g, (P, t, dt) => {
      const on = P.state === 'lit' || P.state === 'rope' ? 1 : 0;
      lm.opacity = damp(lm.opacity, on, 1.5, dt); halo.material.opacity = lm.opacity * 0.7 * P.show; light.intensity = lm.opacity * 1.4 * P.show;
      const r = damp(rope.scale.y, P.state === 'rope' ? 1 : 0.001, 2, dt); rope.scale.y = r; rope.position.y = WY - 0.12 - (WY - 0.12) * r / 2; rope.visible = r > 0.02;
    });
  },

  // 다윗성 (시온 산성): 남북으로 긴 언덕 위의 작은 성 — 탑이 선 둘레 성벽, 다닥다닥 붙은 흙벽돌 집, 북쪽 끝 왕궁(o.palace, 기본 true),
  // 법궤의 장막(o.tent). 멀리 뒤(-z)에 세우는 배경. 예수 때 도성 모형은 이 여정에서 꺼져 있으므로(map.noCity) 이것으로 세운다.
  // 크기 o.w(가로, 기본 1.8)·o.d(깊이 0.8). 언덕 위에 사람을 세울 수 있다(heightAt)
  zion(o = {}) {
    const g = new THREE.Group(), W = o.w || 1.8, D = o.d || 0.8, HH = o.h || 0.26;
    const hill = mesh(sphere(1, 40, 14, 0, Math.PI * 2, 0, Math.PI / 2), mat('#9a8a6c', { roughness: 1 }), g, [0, 0, 0], [W / 2 * 1.12, HH, D / 2 * 1.2]); hill.receiveShadow = true;
    const top = (x, z) => { const u = x / (W / 2 * 1.12), v = z / (D / 2 * 1.2), r = u * u + v * v; return r < 1 ? HH * Math.sqrt(1 - r) : 0; };
    const stone = mat('#d8c8a6', { roughness: 0.95 }), house = [mat('#d3bc96', { roughness: 1 }), mat('#c9b088', { roughness: 1 }), mat('#ddc8a4', { roughness: 1 })];
    // 둘레 성벽: 타원을 따라 마디마다 벽과 탑
    const n = 22;
    for (let i = 0; i < n; i++) {
      const a0 = i / n * Math.PI * 2, a1 = (i + 1) / n * Math.PI * 2, rx = W / 2 * 0.86, rz = D / 2 * 0.86;
      const x0 = Math.cos(a0) * rx, z0 = Math.sin(a0) * rz, x1 = Math.cos(a1) * rx, z1 = Math.sin(a1) * rz, L = Math.hypot(x1 - x0, z1 - z0);
      const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2, y = top(mx, mz);
      const s = mesh(new THREE.BoxGeometry(L + 0.01, 0.15, 0.04), stone, g, [mx, y + 0.06, mz]); s.rotation.y = -Math.atan2(z1 - z0, x1 - x0); s.receiveShadow = true;
      if (i % 4 === 0) mesh(new THREE.BoxGeometry(0.08, 0.22, 0.08), stone, g, [x0, top(x0, z0) + 0.09, z0]);
    }
    // 집들: 성 안을 채우는 작은 상자 (가운데가 높게)
    for (let i = 0; i < 26; i++) {
      const a = i * 2.399, r = Math.sqrt((i + 0.5) / 26) * 0.72, x = Math.cos(a) * r * W / 2, z = Math.sin(a) * r * D / 2;
      if (o.palace !== false && x < -W * 0.18 && Math.abs(z) < D * 0.22) continue; // 왕궁 자리
      if (o.tent && Math.abs(x - W * 0.12) < 0.14 && Math.abs(z) < 0.1) continue; // 장막 자리
      const h = 0.07 + (i % 3) * 0.02;
      mesh(new THREE.BoxGeometry(0.1 + (i % 2) * 0.04, h, 0.09), house[i % 3], g, [x, top(x, z) + h / 2 - 0.01, z]).receiveShadow = true;
    }
    if (o.palace !== false) { // 북쪽(왼쪽 위) 끝의 왕궁: 두 층 마름돌 건물과 지붕 난간 (삼하 5:11 — 두로의 백향목과 석수)
      const px = -W * 0.3, pz = -D * 0.04, y = top(px, pz);
      mesh(new THREE.BoxGeometry(0.42, 0.22, 0.26), mat('#e6dcc4', { roughness: 0.9 }), g, [px, y + 0.1, pz]).receiveShadow = true;
      mesh(new THREE.BoxGeometry(0.44, 0.025, 0.28), mat('#7a4a2a'), g, [px, y + 0.22, pz]);
      mesh(new THREE.BoxGeometry(0.2, 0.08, 0.16), mat('#e6dcc4', { roughness: 0.9 }), g, [px - 0.08, y + 0.27, pz]);
    }
    if (o.tent) { // 다윗이 친 법궤의 장막 (삼하 6:17): 흰 휘장에 금빛 기운
      const tx = W * 0.12, y = top(tx, 0);
      const tnt = mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.22, 3, 1), mat('#f2ede0', { ...DS, roughness: 0.9 }), g, [tx, y + 0.045, 0]); tnt.rotation.set(Math.PI / 6, 0, Math.PI / 2);
      const h = glow(0.4, 0.45); h.position.set(tx, y + 0.1, 0.02); g.add(h);
    }
    const P = new Prop(g);
    P.heightAt = (x, z) => P.show > 0.5 ? top(x - g.position.x, z - g.position.z) : 0;
    return P;
  },

  // 왕궁 지붕 (삼하 11:2): 사람이 올라설 수 있는 평평한 지붕(높이 o.h, 기본 0.42)과 낮은 난간, 옆으로 오르는 계단, 천막 차양.
  // 지붕 위에 선 사람은 저절로 그 높이에 선다(heightAt). 해 질 녘 홀로 거니는 왕 — 지붕 아래·멀리의 사람은 그리지 않는다
  roof(o = {}) {
    const g = new THREE.Group(), W = o.w || 1.4, D = o.d || 0.9, H = o.h || 0.42, stone = mat('#e2d6bc', { roughness: 0.95 }), cedar = mat('#7a4a2a');
    mesh(new THREE.BoxGeometry(W, H, D), stone, g, [0, H / 2, 0]).receiveShadow = true;
    mesh(new THREE.BoxGeometry(W + 0.04, 0.03, D + 0.04), mat('#c9b48c', { roughness: 1 }), g, [0, H + 0.005, 0]).receiveShadow = true;
    [[0, -D / 2], [0, D / 2]].forEach(([x, z]) => mesh(new THREE.BoxGeometry(W + 0.04, 0.1, 0.035), stone, g, [x, H + 0.06, z]));
    [-W / 2, W / 2].forEach(x => mesh(new THREE.BoxGeometry(0.035, 0.1, D + 0.04), stone, g, [x, H + 0.06, 0]));
    for (let i = 0; i < 6; i++) mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.06, 6), cedar, g, [-W / 2 + 0.12 + i * (W - 0.24) / 5, H - 0.06, D / 2 + 0.03]).rotation.x = Math.PI / 2;
    for (let i = 0; i < 6; i++) { const h = (i + 1) * H / 6; mesh(new THREE.BoxGeometry(0.15, h, 0.12), stone, g, [W / 2 + 0.08, h / 2, -D / 2 + 0.07 + i * 0.13]).receiveShadow = true; }
    // 차양: 네 기둥 위의 천 (지붕 뒤쪽 한편)
    const ax = -W * 0.28, az = -D * 0.22;
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.42, 5), cedar, g, [ax + a * 0.2, H + 0.21, az + b * 0.14]));
    mesh(new THREE.BoxGeometry(0.46, 0.012, 0.34), mat(o.awning || '#c9b48c', { roughness: 1 }), g, [ax, H + 0.42, az]);
    const P = new Prop(g);
    P.heightAt = (x, z) => { const u = x - g.position.x, v = z - g.position.z; return P.show > 0.5 && Math.abs(u) < W / 2 - 0.02 && Math.abs(v) < D / 2 - 0.02 ? H + 0.02 : 0; };
    return P;
  },

  // 타작마당 (아라우나, 삼하 24:18): 돌을 둘러 깐 둥근 마당, 가장자리의 곡식 단, 가운데 낟알 더미와 타작 썰매. 제단은 altar 소품을 따로 세운다
  threshing(o = {}) {
    const g = new THREE.Group(), R = o.r || 0.62;
    mesh(new THREE.CylinderGeometry(R, R + 0.02, 0.04, 40), mat('#c9b68e', { roughness: 1 }), g, [0, 0.02, 0]).receiveShadow = true;
    const st = rockM('#a89a82');
    for (let i = 0; i < 26; i++) { const a = i / 26 * Math.PI * 2; mesh(new THREE.DodecahedronGeometry(0.035, 0), st, g, [Math.cos(a) * (R + 0.03), 0.03, Math.sin(a) * (R + 0.03)]); }
    const straw = mat('#d9bf6a', { roughness: 1 });
    [[0.5, -0.5], [-0.55, -0.4], [0.62, 0.15], [-0.62, 0.2]].forEach(([u, v]) => { const sh = mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.16, 8), straw, g, [u * R * 1.3, 0.08, v * R * 1.3]); sh.rotation.z = 0.15; });
    const grain = mesh(sphere(0.16, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat('#d8bc72', { roughness: 1 }), g, [o.altar ? 0.3 : 0, 0.035, 0.12], [1.2, 0.4, 1]); grain.castShadow = false;
    const sledge = mesh(new THREE.BoxGeometry(0.32, 0.025, 0.16), wood(), g, [-0.18, 0.055, 0.2]); sledge.rotation.y = 0.4;
    const P = new Prop(g);
    P.heightAt = (x, z) => { const u = x - g.position.x, v = z - g.position.z; return P.show > 0.5 && u * u + v * v < R * R ? 0.04 : 0; };
    return P;
  },

  // 큰 상수리나무 (에브라임 숲, 삼하 18:9): 굵고 비틀린 줄기에서 낮고 넓게 뻗은 가지, 짙은 잎 덩이. 낮은 큰 가지는 오른쪽(+x)으로 뻗는다.
  // 그 가지에 걸린 사람은 그리지 않는다 — 노새가 빠져나가는 것과 빈 나무, 빛으로만
  oak(o = {}) {
    const g = new THREE.Group(), bark = mat('#5a4a3a', { roughness: 1 }), leaf = mat('#4f6a34', { roughness: 0.9 }), leaf2 = mat('#5f7a3e', { roughness: 0.9 });
    const limb = (x0, y0, x1, y1, z1, r0, r1) => { const a = new THREE.Vector3(x0, y0, 0), b = new THREE.Vector3(x1, y1, z1), L = a.distanceTo(b); const c = mesh(new THREE.CylinderGeometry(r1, r0, L, 9), bark, g); c.position.copy(a).add(b).multiplyScalar(0.5); c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize()); };
    limb(0, 0, 0.04, 0.55, 0, 0.11, 0.08);
    limb(0.04, 0.5, 0.75, 0.7, 0.05, 0.065, 0.025);   // 낮게 뻗은 큰 가지
    limb(0.03, 0.55, -0.5, 0.95, -0.05, 0.06, 0.025);
    limb(0.04, 0.55, 0.15, 1.1, -0.12, 0.06, 0.03);
    limb(0.04, 0.5, 0.05, 0.85, 0.35, 0.05, 0.02);
    [[0.65, 0.82, 0.05, 0.26], [0.35, 1.05, 0.0, 0.3], [-0.05, 1.18, -0.1, 0.32], [-0.45, 1.0, -0.05, 0.28], [0.1, 0.95, 0.3, 0.24], [-0.25, 0.92, 0.25, 0.22], [0.25, 1.0, -0.3, 0.26]]
      .forEach(([x, y, z, r], i) => mesh(sphere(r, 16, 12), i % 2 ? leaf : leaf2, g, [x, y, z], [1.15, 0.72, 1]));
    mesh(sphere(0.16, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), bark, g, [0, 0, 0], [1, 0.35, 1]); // 밑동의 뿌리
    return new Prop(g);
  },

  // 노새 (왕의 노새 — 압살롬, 솔로몬이 탄 다윗의 노새 왕상 1:33): 나귀보다 크고 짙은 털, 자줏빛 안장. deck에 태운다
  mule: o => MAKERS.donkey({ coat: '#5e4e42', dark: '#2a2420', size: 1.9, saddle: '#6b2a5e', ears: 0.11, ...o }),
  // 짐 실은 나귀 (아비가일의 예물, 삼상 25:18 · 이새가 보낸 빵과 포도주 16:20): 양옆에 늘어진 짐 꾸러미
  packdonkey: o => {
    const P = MAKERS.donkey({ saddle: null, ...o }), body = P.obj.children[0];
    const bag = mat('#b89a6a', { roughness: 1 }), skin = mat('#6b4a2a', { roughness: 0.8 });
    [-1, 1].forEach(k => mesh(new THREE.BoxGeometry(0.15, 0.13, 0.07), bag, body, [-0.02, 0.38, k * 0.13]));
    mesh(new THREE.CapsuleGeometry(0.045, 0.08, 4, 8), skin, body, [-0.02, 0.5, 0], [1, 1, 1]).rotation.z = Math.PI / 2; // 포도주 부대
    return P;
  },
  // 사자·곰 (다윗이 지킨 양 떼, 삼상 17:34): 짐승이 오고 달아나는 것만 — 치거나 죽이는 모습은 그리지 않는다 (달아나며 show 0)
  lion: o => {
    const P = MAKERS.jackal({ coat: '#c09050', dark: '#6a4a28', size: 1.15, legs: 0.82, fat: 1.15, ears: 0.035, neck: 0.06, ...o });
    const neck = P.obj.children[0].children.find(c => c.isGroup && c.children.length);
    mesh(sphere(0.085, 14, 10), mat('#7a5028', { roughness: 1 }), neck, [0.05, 0.07, 0], [0.9, 1.15, 1.2]); // 갈기
    return P;
  },
  bear: o => {
    const P = MAKERS.dog({ coat: '#4a3626', dark: '#2a1e14', size: 1.6, fat: 1.45, legs: 0.82, len: 0.85, ears: 0.03, neck: 0.04, ...o });
    return P;
  },

  // 법궤를 실은 새 수레 (삼하 6:3): 두 바퀴 수레의 바닥에 언약궤, 멍에를 멘 두 소가 앞(+x)에서 끈다. 대본에서 speed를 주면 바퀴가 구른다.
  // state 'go' | 'stumble'(소들이 뛰어 수레가 기우뚱 — 나곤의 타작마당, 6:6). o.oxen: false면 소 없이
  arkcart(o = {}) {
    const g = new THREE.Group(), cart = new THREE.Group(); g.add(cart);
    const w = mat('#9a7448', { roughness: 0.9 }), dk = mat('#5e4128');
    mesh(new THREE.BoxGeometry(0.56, 0.035, 0.34), w, cart, [0, 0.2, 0]).receiveShadow = true;
    [-1, 1].forEach(k => mesh(new THREE.BoxGeometry(0.56, 0.06, 0.02), w, cart, [0, 0.24, k * 0.17]));
    const wheels = [-1, 1].map(k => { const wh = new THREE.Group(); wh.position.set(0, 0.14, k * 0.21); cart.add(wh);
      mesh(new THREE.TorusGeometry(0.13, 0.014, 6, 20), dk, wh);
      for (let i = 0; i < 3; i++) mesh(new THREE.BoxGeometry(0.25, 0.014, 0.012), dk, wh).rotation.z = i * Math.PI / 3;
      return wh; });
    mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.46, 6), dk, cart, [0, 0.14, 0]).rotation.x = Math.PI / 2; // 굴대
    mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.6, 6), dk, cart, [0.52, 0.22, 0]).rotation.z = Math.PI / 2; // 끌채
    const ark = inner(cart, 'arkc', {}, [0, 0.2, 0]);
    let oxen = [];
    if (o.oxen !== false) {
      oxen = [-1, 1].map(k => inner(g, 'ox', {}, [0.95, 0, k * 0.15]));
      mesh(new THREE.BoxGeometry(0.04, 0.03, 0.44), dk, g, [0.98, 0.44, 0]); // 멍에
    }
    const P = new Prop(g, (P, t, dt, env) => {
      const roll = P.moving ? dt * 3.2 : 0;
      wheels.forEach(wh => { wh.rotation.z -= roll; });
      const st = P.state === 'stumble', k = st ? Math.max(0, 1 - (performance.now() / 1000 - P.t0) / 3) : 0;
      cart.rotation.x = damp(cart.rotation.x, st ? 0.16 + Math.sin(t * 13) * 0.05 * k : 0, 4, dt);
      ark.obj.rotation.z = st ? Math.sin(t * 17) * 0.06 * k : damp(ark.obj.rotation.z, 0, 4, dt);
      ark.upd(ark, t, dt, env);
      oxen.forEach(ox => { ox.moving = P.moving || (st && k > 0.3); ox.upd(ox, t, dt, env); });
    }, { state: o.state || 'go' });
    P.directional = true;
    return P;
  },

  // 침상의 드라빔 (삼상 19:13): 낮은 침상에 옷을 덮어 누인 형상, 머리맡에 염소털
  bedidol() {
    const g = new THREE.Group(), w = wood();
    mesh(new THREE.BoxGeometry(0.62, 0.04, 0.26), w, g, [0, 0.12, 0]);
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, b]) => mesh(new THREE.BoxGeometry(0.03, 0.12, 0.03), w, g, [a * 0.28, 0.06, b * 0.11]));
    mesh(new THREE.CapsuleGeometry(0.07, 0.36, 6, 12), mat('#8a2e24', { roughness: 0.95 }), g, [0.02, 0.19, 0], [1, 0.55, 1]).rotation.z = Math.PI / 2;
    mesh(sphere(0.06, 12, 8), mat('#2a221a', { roughness: 1 }), g, [-0.27, 0.19, 0], [1, 0.7, 1.1]); // 염소털
    return new Prop(g);
  },

  // 진설병 상 (놉, 삼상 21:6): 금 테 두른 상 위에 두 줄로 쌓은 열두 덩이의 빵
  showbread() {
    const g = new THREE.Group(), gold = mat('#d6a93a', { metalness: 0.55, roughness: 0.35 });
    mesh(new THREE.BoxGeometry(0.34, 0.025, 0.18), gold, g, [0, 0.24, 0]);
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, b]) => mesh(new THREE.BoxGeometry(0.02, 0.24, 0.02), gold, g, [a * 0.15, 0.12, b * 0.07]));
    const bread = mat('#c99858', { roughness: 1 });
    [-1, 1].forEach(k => { for (let i = 0; i < 6; i++) mesh(new THREE.CylinderGeometry(0.045, 0.047, 0.016, 12), bread, g, [k * 0.08, 0.262 + i * 0.017, 0]); });
    return new Prop(g);
  },

  // 불탄 성읍 (시글락, 삼상 30:1): 검게 그은 무너진 벽들과 오르는 연기. state 'smoke'(기본) | 'cold'(연기가 걷힌다)
  ruin(o = {}) {
    const g = new THREE.Group(), burnt = mat('#4a3e34', { roughness: 1 }), wall = mat('#9a8466', { roughness: 1 });
    [[-0.55, -0.1, 0.5, 0.42, 0.1], [0.1, -0.3, 0.6, 0.3, -0.2], [0.65, 0.05, 0.4, 0.36, 0.4]].forEach(([x, z, w, h, r], i) => {
      const s = new THREE.Group(); s.position.set(x, 0, z); s.rotation.y = r; g.add(s);
      mesh(new THREE.BoxGeometry(w, h, 0.08), i % 2 ? burnt : wall, s, [0, h / 2, 0]).receiveShadow = true;
      for (let k = 0; k < 4; k++) mesh(new THREE.BoxGeometry(w / 5, 0.06 + (k % 2) * 0.05, 0.08), burnt, s, [(k - 1.5) * w / 4, h + 0.02, 0]);
      mesh(new THREE.BoxGeometry(w * 0.9, 0.04, 0.35), burnt, s, [0, 0.02, 0.2]); // 무너진 들보·재
    });
    // 연기: 오르며 커지고 옅어지는 회색 덩이 (산의 구름처럼 공 — 그림 스프라이트는 이 무대에서 보이지 않았다)
    const puffs = Array.from({ length: 15 }, (_, i) => {
      const m = mesh(sphere(0.1, 12, 8), new THREE.MeshStandardMaterial({ color: '#5a524a', roughness: 1, transparent: true, opacity: 0, depthWrite: false }), g);
      m.castShadow = false; m.userData = { x: [-0.55, 0.1, 0.65][i % 3], s: i * 0.21 }; return m; });
    let k = 0;
    return new Prop(g, (P, t, dt) => {
      k = damp(k, P.state === 'cold' ? 0 : 1, 0.8, dt);
      puffs.forEach(p => { const u = (t * 0.15 + p.userData.s) % 1; p.position.set(p.userData.x + u * 0.3, 0.3 + u * 1.2, -0.1); p.scale.setScalar(0.6 + u * 2.4); p.material.opacity = k * P.show * 0.55 * Math.sin(u * Math.PI); p.visible = p.material.opacity > 0.01; });
    }, { state: o.state || 'smoke' });
  },
});

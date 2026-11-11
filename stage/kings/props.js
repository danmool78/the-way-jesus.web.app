/* 열왕기 여정에만 쓰는 소품: props.js의 MAKERS에 더한다 (공용 파일을 키우지 않게). 네 묶음(a·b·c·d)이 함께 쓴다.
   크기는 사람 키(약 0.88)와의 비례로. 무대 x는 오른쪽(+, 동쪽), z는 앞(+, 화면 아래). 앞으로 나아가는 것(병거·새·소)은 +x가 머리.
   다윗 여정의 소품(stage/david/props*.js — cave·hall·spear·zion·roof·oak·mule·lion·couch·treasure·chariotI·gatetower·sunrise 등)도 그대로 쓸 수 있다.
   하나님의 일(불·불수레·회오리바람·구름)은 모습 없이 빛과 불꽃(글로우)으로만 */
import { THREE, mat, DS, lathe, mesh, sphere, glowTexture, damp } from '../kit.js';
import { MAKERS, Prop } from '../props.js';

const wood = () => mat('#7a5634', { roughness: 0.95 });
const rockM = (c = '#a8977c') => mat(c, { roughness: 1, flatShading: true });
const bronze = () => mat('#b0803a', { metalness: 0.6, roughness: 0.38 });
const goldM = () => mat('#d6a93a', { metalness: 0.6, roughness: 0.35 });
const glow = (size, opacity = 1, color) => {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity, ...(color ? { color } : {}) }));
  s.scale.set(size, size, 1);
  return s;
};
// 불꽃 혀: 가산 혼합의 원뿔 (제단·불수레·불타는 성)
const flameM = (c = '#ffb347', o = 0.85) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, depthWrite: false, blending: THREE.AdditiveBlending });
const tongue = (parent, r, h, pos, m) => { const c = mesh(new THREE.ConeGeometry(r, h, 7), m, parent, pos); c.castShadow = false; return c; };
// 다른 소품을 묶음 안에 넣어 함께 움직인다 — 그 소품의 update도 대신 불러 준다 (david/props.js와 같다)
const inner = (g, kind, o, pos, rot = 0) => { const P = MAKERS[kind](o); P.obj.position.set(...pos); P.obj.rotation.y = rot; g.add(P.obj); return P; };
// 연기: 오르며 커지고 옅어지는 회색 공 (david ruin과 같은 방식 — 스프라이트는 이 무대에서 잘 보이지 않았다)
function smokePuffs(g, spots, n = 12, color = '#5a524a', rise = 1.2, puff = 1) {
  const puffs = Array.from({ length: n }, (_, i) => {
    const m = mesh(sphere(0.1, 12, 8), new THREE.MeshStandardMaterial({ color, roughness: 1, transparent: true, opacity: 0, depthWrite: false }), g);
    m.castShadow = false; m.userData = { at: spots[i % spots.length], s: i / n }; return m; });
  return (k, t) => puffs.forEach(p => {
    const u = (t * 0.15 + p.userData.s) % 1, [x, y, z] = p.userData.at;
    p.position.set(x + u * 0.25, y + u * rise, z); p.scale.setScalar((0.5 + u * 2.2) * puff);
    p.material.opacity = k * 0.42 * Math.sin(u * Math.PI); p.visible = p.material.opacity > 0.01;
  });
}

Object.assign(MAKERS, {
  /* ---------- 예루살렘 ---------- */

  // 솔로몬의 성전 (왕상 6–7장): 마름돌 뜰 단 위에 길쭉한 흰 돌 집, 앞(+z)의 높은 현관(울람), 양옆의 세 층 골방, 금 입힌 문,
  // 현관 앞의 놋 기둥 둘(야긴·보아스 — 백합·석류 기둥머리), 오른쪽 앞의 놋바다(열두 소가 받친 큰 대야), 왼쪽 앞의 놋 제단.
  // 예수 때 헤롯 성전(temple)과 다르게: 기둥 줄 현관이 아니라 높은 탑 같은 현관과 두 놋 기둥.
  // state 'idle' | 'cloud'(영광의 구름이 집을 덮는다 — 왕상 8:10) | 'burn'(창에서 불빛과 연기 — 왕하 25:9, 멀리서만) | 'ruin'(그을리고 지붕이 내려앉음, 놋 기둥·놋바다는 실려 가 없다).
  // o.sea·o.altar·o.pillars: false면 없이. 뜰 단 위에 사람이 선다(heightAt — 단 높이 0.06)
  stemple(o = {}) {
    const g = new THREE.Group(), stone = new THREE.MeshStandardMaterial({ color: '#ece2c8', roughness: 0.85 }), shade = mat('#c9bc9c', { roughness: 1 }), cedar = mat('#7a4a2a', { roughness: 0.8 });
    const burnt = new THREE.Color('#3a3430'), stoneC = stone.color.clone();
    const W = 2.4, D = 1.9, H = 0.06, FZ = 0.0; // 뜰 단(가로 W, 깊이 D), 집의 앞면 z = FZ
    mesh(new THREE.BoxGeometry(W, H, D), shade, g, [0, H / 2, -0.35]).receiveShadow = true;
    const house = new THREE.Group(); g.add(house);
    const body = mesh(new THREE.BoxGeometry(0.78, 0.86, 1.05), stone, house, [0, H + 0.43, FZ - 0.78]); body.receiveShadow = true; // 성소·지성소
    const roof = mesh(new THREE.BoxGeometry(0.82, 0.04, 1.09), cedar, house, [0, H + 0.88, FZ - 0.78]);
    [-1, 1].forEach(k => { // 양옆 세 층 골방 (6:5)
      mesh(new THREE.BoxGeometry(0.16, 0.5, 1.0), stone, house, [k * 0.47, H + 0.25, FZ - 0.8]).receiveShadow = true;
      for (let f = 0; f < 3; f++) mesh(new THREE.BoxGeometry(0.17, 0.012, 1.01), cedar, house, [k * 0.47, H + 0.17 * (f + 1), FZ - 0.8]);
      for (let i = 0; i < 3; i++) mesh(new THREE.BoxGeometry(0.02, 0.06, 0.08), mat('#2a1c10'), house, [k * 0.39, H + 0.72, FZ - 0.45 - i * 0.3]); // 높은 창 (6:4)
    });
    const porch = mesh(new THREE.BoxGeometry(0.86, 1.18, 0.24), stone, house, [0, H + 0.59, FZ - 0.14]); porch.receiveShadow = true; // 현관 (울람)
    mesh(new THREE.BoxGeometry(0.9, 0.05, 0.28), cedar, house, [0, H + 1.2, FZ - 0.14]);
    const door = mesh(new THREE.BoxGeometry(0.26, 0.5, 0.02), goldM(), house, [0, H + 0.25, FZ - 0.015]); // 금 입힌 문 (6:32)
    mesh(new THREE.BoxGeometry(0.012, 0.5, 0.022), mat('#7a5a2a'), house, [0, H + 0.25, FZ - 0.01]);
    mesh(new THREE.BoxGeometry(0.32, 0.04, 0.03), goldM(), house, [0, H + 0.52, FZ - 0.01]);
    // 놋 기둥 둘 (7:15–22): 현관 앞, 기둥머리는 둥근 백합 모양에 석류 두 줄
    const pillars = new THREE.Group(); g.add(pillars);
    if (o.pillars !== false) [-1, 1].forEach(k => {
      mesh(new THREE.CylinderGeometry(0.038, 0.042, 0.66, 16), bronze(), pillars, [k * 0.3, H + 0.33, FZ + 0.12]);
      mesh(lathe([[0.001, 0], [0.05, 0], [0.07, 0.04], [0.066, 0.1], [0.04, 0.13], [0.001, 0.13]], 16), bronze(), pillars, [k * 0.3, H + 0.66, FZ + 0.12]);
      for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; mesh(sphere(0.012, 8, 6), mat('#8a3a2a', { roughness: 0.5 }), pillars, [k * 0.3 + Math.cos(a) * 0.066, H + 0.7, FZ + 0.12 + Math.sin(a) * 0.066]); }
      mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 16), shade, pillars, [k * 0.3, H + 0.015, FZ + 0.12]);
    });
    // 놋바다 (7:23–26): 열두 소가 세 마리씩 네 쪽을 보고 선 위의 큰 대야
    const sea = new THREE.Group(); sea.position.set(0.78, H, FZ + 0.4); g.add(sea);
    if (o.sea !== false) {
      for (let i = 0; i < 12; i++) { const a = Math.floor(i / 3) * Math.PI / 2 + ((i % 3) - 1) * 0.42 + Math.PI / 4, ox = new THREE.Group();
        ox.position.set(Math.cos(a) * 0.09, 0, Math.sin(a) * 0.09); ox.rotation.y = -a; sea.add(ox);
        mesh(new THREE.BoxGeometry(0.075, 0.04, 0.035), bronze(), ox, [0.02, 0.06, 0]);
        mesh(new THREE.BoxGeometry(0.03, 0.03, 0.028), bronze(), ox, [0.065, 0.07, 0]);
        [-1, 1].forEach(s => mesh(new THREE.BoxGeometry(0.012, 0.045, 0.012), bronze(), ox, [0.02 + s * 0.025, 0.022, 0])); }
      mesh(lathe([[0.001, 0.09], [0.1, 0.09], [0.17, 0.13], [0.2, 0.2], [0.21, 0.23], [0.2, 0.23], [0.188, 0.21], [0.001, 0.2]], 28), bronze(), sea);
      const w = mesh(new THREE.CircleGeometry(0.185, 24), mat('#7fa0a8', { roughness: 0.2, metalness: 0.2 }), sea, [0, 0.215, 0]); w.rotation.x = -Math.PI / 2;
    }
    // 놋 제단 (대하 4:1): 네 뿔이 달린 네모 단
    const altar = new THREE.Group(); altar.position.set(-0.72, H, FZ + 0.45); g.add(altar);
    const fire = new THREE.Group(); fire.position.y = 0.2; altar.add(fire); fire.visible = false;
    if (o.altar !== false) {
      mesh(new THREE.BoxGeometry(0.34, 0.16, 0.34), bronze(), altar, [0, 0.08, 0]);
      [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, b]) => mesh(new THREE.ConeGeometry(0.018, 0.05, 6), bronze(), altar, [a * 0.15, 0.185, b * 0.15]));
      for (let i = 0; i < 4; i++) mesh(new THREE.BoxGeometry(0.08, 0.04, 0.12), mat('#3a2a1a'), altar, [-0.06 + i * 0.04, 0.17, 0]).rotation.y = i;
      const fm = flameM(); for (let i = 0; i < 5; i++) tongue(fire, 0.035, 0.14, [Math.cos(i * 1.3) * 0.05, 0.04, Math.sin(i * 1.3) * 0.05], fm);
      const h = glow(0.6, 0.6); h.position.y = 0.06; fire.add(h);
    }
    if (o.fire) fire.visible = true;
    // 영광의 구름 (8:10): 집을 감싸는 밝은 흰 덩이와 번지는 빛
    const cm = mat('#ffffff', { emissive: '#fff3d0', emissiveIntensity: 0.7, transparent: true, opacity: 0, depthWrite: false });
    const puffs = Array.from({ length: 16 }, (_, i) => { const a = i / 16 * Math.PI * 2; const p = mesh(sphere(0.22 + (i % 3) * 0.06, 16, 12), cm, g, [Math.cos(a) * 0.55, H + 0.55 + (i % 4) * 0.15, FZ - 0.6 + Math.sin(a) * 0.6]); p.castShadow = false; return p; });
    const halo = glow(3.2, 0); halo.position.set(0, H + 0.8, FZ - 0.5); g.add(halo);
    const holy = new THREE.PointLight('#fff0c8', 0, 3, 1.4); holy.position.set(0, H + 1.0, FZ + 0.4); g.add(holy);
    // 불탐 (25:9): 창과 문에서 번지는 불빛과 짙은 연기 — 멀리서만, 무너지는 모습 없이
    const ember = glow(2.2, 0, '#ff8a40'); ember.position.set(0, H + 0.7, FZ - 0.5); g.add(ember);
    const firelight = new THREE.PointLight('#ff8040', 0, 3, 1.4); firelight.position.set(0, H + 0.9, FZ + 0.3); g.add(firelight);
    const smoke = smokePuffs(g, [[-0.2, H + 1.0, FZ - 0.6], [0.25, H + 1.1, FZ - 0.9], [0, H + 1.25, FZ - 0.2]], 15, '#4a4440', 1.6);
    let c = 0, b = 0, r = 0;
    const P = new Prop(g, (P, t, dt) => {
      c = damp(c, P.state === 'cloud' ? 1 : 0, 0.9, dt); b = damp(b, P.state === 'burn' ? 1 : 0, 0.8, dt); r = damp(r, P.state === 'ruin' || P.state === 'burn' ? 1 : 0, 0.4, dt);
      cm.opacity = 0.78 * c * P.show; puffs.forEach((p, i) => { p.visible = c > 0.02; p.position.y += Math.sin(t * 0.6 + i) * 0.0005; });
      halo.material.opacity = 0.8 * c * P.show; holy.intensity = 1.8 * c * P.show;
      ember.material.opacity = b * P.show * (0.7 + Math.sin(t * 7) * 0.12); firelight.intensity = b * 2 * P.show * (1 + Math.sin(t * 11) * 0.1);
      smoke(b * P.show, t);
      stone.color.copy(stoneC).lerp(burnt, r * 0.75); // 그을림
      const fall = P.state === 'ruin' ? 1 : 0; roof.visible = fall < 0.5; porch.scale.y = damp(porch.scale.y, fall ? 0.62 : 1, 0.6, dt); porch.position.y = H + 0.59 * porch.scale.y; door.visible = !fall;
      pillars.visible = !fall; sea.visible = !fall; // 놋 기둥과 놋바다는 깨뜨려 바벨론으로 실려 갔다 (25:13)
      fire.visible = !fall && (o.fire || P.state === 'fire');
    }, { state: o.state || 'idle' });
    P.heightAt = (x, z) => { const u = (x - g.position.x) / g.scale.x, v = (z - g.position.z) / g.scale.z;
      return P.show > 0.5 && Math.abs(u) < W / 2 && v > -0.35 - D / 2 && v < -0.35 + D / 2 ? H * g.scale.y : 0; };
    return P;
  },

  // 솔로몬의 상아 보좌 (왕상 10:18–20): 금 입힌 상아 의자, 여섯 층계의 양쪽에 사자 열둘, 팔걸이 곁에 사자 둘, 둥근 등받이.
  // 앉은 왕은 배역 y 0.27, pose 'sit'. 앞(+z)으로 층계가 내려온다
  ivorythrone(o = {}) {
    const g = new THREE.Group(), ivory = mat('#f2ead6', { roughness: 0.5 }), gold = goldM();
    for (let i = 0; i < 6; i++) { // 여섯 층계 (앞이 낮다)
      const z = 0.3 - i * 0.05, h = 0.035 * (i + 1);
      mesh(new THREE.BoxGeometry(0.46 - i * 0.012, h, 0.06), ivory, g, [0, h / 2, z]).receiveShadow = true;
      [-1, 1].forEach(k => { const lion = new THREE.Group(); lion.position.set(k * (0.25 - i * 0.006), h, z); g.add(lion); // 층계 양 끝의 사자
        mesh(new THREE.BoxGeometry(0.026, 0.024, 0.04), gold, lion, [0, 0.016, 0]); mesh(sphere(0.016, 8, 6), gold, lion, [0, 0.036, 0.016]); });
    }
    const seatY = 0.21;
    mesh(new THREE.BoxGeometry(0.34, seatY, 0.26), ivory, g, [0, seatY / 2, -0.04]);
    mesh(new THREE.BoxGeometry(0.3, 0.03, 0.24), mat('#6b2a5e'), g, [0, seatY + 0.015, -0.03]);
    mesh(new THREE.BoxGeometry(0.34, 0.42, 0.05), ivory, g, [0, seatY + 0.2, -0.16]);
    const top = mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.05, 20, 1, false, 0, Math.PI), gold, g, [0, seatY + 0.41, -0.16]); top.rotation.set(Math.PI / 2, Math.PI / 2, 0); // 둥근 등받이 머리 (10:19)
    [-1, 1].forEach(k => { mesh(new THREE.BoxGeometry(0.04, 0.1, 0.22), gold, g, [k * 0.17, seatY + 0.07, -0.04]);
      const lion = new THREE.Group(); lion.position.set(k * 0.2, seatY + 0.12, 0.06); g.add(lion);
      mesh(new THREE.BoxGeometry(0.03, 0.03, 0.05), gold, lion, [0, 0, 0]); mesh(sphere(0.02, 8, 6), gold, lion, [0, 0.025, 0.02]); });
    const P = new Prop(g);
    P.heightAt = (x, z) => { const u = (x - g.position.x) / g.scale.x, v = (z - g.position.z) / g.scale.z;
      if (P.show < 0.5 || Math.abs(u) > 0.23) return 0;
      if (v < 0.08 && v > -0.17) return 0; // 자리 위는 배역 y로 (앉은 왕)
      if (v >= 0.08 && v < 0.33) return 0.035 * Math.min(6, Math.max(1, Math.floor((0.33 - v) / 0.05) + 1)) * g.scale.y;
      return 0; };
    return P;
  },

  // 방패 줄 (왕상 10:16–17 · 14:26–27): 벽 높이(0.55 — 앞에 선 사람 머리 위로 보이게)에 건 둥근 방패 o.n개. state 'gold'(솔로몬의 금 방패) | 'bronze'(르호보암의 놋 방패) | 'none'(빈 벽 — 시삭이 실어 감).
  // 빛깔은 천천히 바뀐다. o.w 너비, 뒤에 낮은 회벽(o.wall false면 없이)
  shields(o = {}) {
    const g = new THREE.Group(), n = o.n || 6, Wd = o.w || 1.4;
    if (o.wall !== false) { mesh(new THREE.BoxGeometry(Wd + 0.2, 0.8, 0.06), mat('#e2d6bc', { roughness: 1 }), g, [0, 0.4, -0.04]).receiveShadow = true; mesh(new THREE.BoxGeometry(Wd + 0.24, 0.04, 0.1), mat('#7a4a2a'), g, [0, 0.81, -0.04]); }
    const gC = new THREE.Color('#e0b040'), bC = new THREE.Color('#9a6a3a');
    const sm = new THREE.MeshStandardMaterial({ color: gC.clone(), metalness: 0.35, roughness: 0.35 });
    const list = Array.from({ length: n }, (_, i) => { const s = new THREE.Group(); s.position.set((i / Math.max(1, n - 1) - 0.5) * Wd, 0.55, 0.01); g.add(s);
      mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.012, 24), sm, s).rotation.x = Math.PI / 2; mesh(sphere(0.022, 10, 8), sm, s, [0, 0, 0.01]); return s; });
    let k = o.state === 'bronze' ? 1 : 0, vis = o.state === 'none' ? 0 : 1;
    return new Prop(g, (P, t, dt) => {
      k = damp(k, P.state === 'bronze' ? 1 : 0, 1.2, dt); vis = damp(vis, P.state === 'none' ? 0 : 1, 3, dt);
      sm.color.copy(gC).lerp(bC, k); sm.metalness = 0.35; sm.emissive.set('#8a6010').multiplyScalar((1 - k) * 0.6); // 금속감을 세게 주면 환경빛이 없는 무대에서 검게 보였다
      list.forEach((s, i) => { s.scale.setScalar(Math.max(1e-3, Math.min(1, vis * n - i))); s.visible = s.scale.x > 0.01; });
    }, { state: o.state || 'gold' });
  },

  // 산당 (왕상 11:7 · 12:31 · 14:23): 돌을 쌓은 높은 단 위의 작은 분향 제단, 돌기둥(맛세바)과 나무 아세라 장대.
  // o.calf: 단 위에 금송아지(벧엘 — 12:29), o.pole false면 장대 없이, o.pillar false면 돌기둥 없이. o.color 단의 돌빛.
  // state 'idle' | 'smoke'(분향 연기가 오른다) | 'split'(제단이 갈라져 재가 쏟아진다 — 13:5)
  highplace(o = {}) {
    const g = new THREE.Group(), st = rockM(o.color || '#b0a080'), R = o.r || 0.55;
    mesh(new THREE.CylinderGeometry(R, R + 0.06, 0.1, 9), st, g, [0, 0.05, 0]).receiveShadow = true;
    const alt = new THREE.Group(); alt.position.set(o.calf ? -0.24 : 0, 0.1, 0.12); g.add(alt);
    const halves = [-1, 1].map(k => { const h = new THREE.Group(); h.position.x = k * 0.042; alt.add(h);
      mesh(new THREE.BoxGeometry(0.084, 0.2, 0.17), st, h, [0, 0.1, 0]);
      [-1, 1].forEach(b => mesh(new THREE.ConeGeometry(0.014, 0.04, 5), st, h, [k * 0.03, 0.22, b * 0.06])); return h; });
    const ash = mesh(sphere(0.07, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat('#8a8278', { roughness: 1 }), alt, [0, 0.2, 0], [1, 0.35, 1]);
    const ember = glow(0.25, 0.5, '#ffa860'); ember.position.y = 0.23; alt.add(ember);
    const spill = mesh(sphere(0.14, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat('#7a7268', { roughness: 1 }), alt, [0, 0, 0.12], [1.4, 0.25, 1]); spill.visible = false;
    if (o.pillar !== false) mesh(new THREE.BoxGeometry(0.08, 0.42, 0.06), mat('#9a8a6a', { roughness: 1, flatShading: true }), g, [R * 0.55, 0.31, -R * 0.45]);
    if (o.pole !== false) { mesh(new THREE.CylinderGeometry(0.014, 0.018, 0.62, 6), wood(), g, [-R * 0.6, 0.41, -R * 0.4]); mesh(new THREE.BoxGeometry(0.12, 0.012, 0.012), wood(), g, [-R * 0.6, 0.62, -R * 0.4]); }
    if (o.calf) { const c = inner(g, 'calf', {}, [0.18, 0.1, -0.08]); c.obj.scale.setScalar(1.15); }
    const smoke = smokePuffs(g, [[alt.position.x, 0.4, alt.position.z]], 8, '#b8b0a4', 0.9);
    let k = 0, sp = 0;
    return new Prop(g, (P, t, dt) => {
      k = damp(k, P.state === 'smoke' ? 1 : 0, 1, dt); smoke(k * P.show, t);
      sp = damp(sp, P.state === 'split' ? 1 : 0, 2.5, dt);
      halves.forEach((h, i) => { h.position.x = (i ? 1 : -1) * (0.042 + sp * 0.05); h.rotation.z = (i ? -1 : 1) * sp * 0.22; });
      ash.visible = sp < 0.3; ember.visible = sp < 0.3 && P.state !== 'idle'; spill.visible = sp > 0.3; spill.scale.set(1.4 * sp, 0.25, sp);
    }, { state: o.state || 'idle' });
  },

  // 찢은 옷 열두 조각 (왕상 11:30): 땅에 활 모양으로 펼쳐진 새 겉옷의 조각. state 'spread' | 'ten'(열 조각이 o.to [x, z] 쪽으로 모여 한 무더기 — 여로보암이 받는다).
  // o.color 겉옷빛 (아히야의 새 겉옷)
  pieces(o = {}) {
    const g = new THREE.Group(), cm = mat(o.color || '#ece2c8', { ...DS, roughness: 1 }), to = o.to || [0.5, 0.15];
    const list = Array.from({ length: 12 }, (_, i) => {
      const a = Math.PI * (0.1 + 0.8 * i / 11), home = [Math.cos(a) * 0.32, Math.sin(a) * 0.14 + 0.06];
      const p = mesh(new THREE.BoxGeometry(0.1, 0.006, 0.075), cm, g, [home[0], 0.004 + i * 0.0005, home[1]]); p.rotation.y = i * 0.7; p.castShadow = false;
      p.userData = { home, pile: [to[0] + (i % 3 - 1) * 0.01, to[1] + (i % 2) * 0.01, 0.006 + i * 0.006] }; return p; });
    let k = 0;
    return new Prop(g, (P, t, dt) => {
      k = damp(k, P.state === 'ten' ? 1 : 0, 1.5, dt);
      list.forEach((p, i) => { const go = i < 10 ? k : 0, { home, pile } = p.userData;
        p.position.x = home[0] + (pile[0] - home[0]) * go; p.position.z = home[1] + (pile[1] - home[1]) * go; p.position.y = 0.004 + (pile[2]) * go + Math.sin(go * Math.PI) * 0.12; });
    }, { state: o.state || 'spread' });
  },

  // 큰 성벽 (사마리아·예루살렘): 탑이 선 마름돌 성벽과 가운데 문, 성벽 위 흉벽. 성벽 위에 선 사람은 배역 y = o.h(기본 0.7)로.
  // o.w 길이(기본 2.6), o.gate false면 문 없이, o.color 돌빛. state 'stand' | 'breach'(가운데 한 마디가 무너져 돌무더기 — 왕하 25:4) | 'siege'(성 둘레의 흙 언덕과 연기 — 25:1)
  kwall(o = {}) {
    const g = new THREE.Group(), Wd = o.w || 2.6, Hh = o.h || 0.7, st = mat(o.color || '#d8c8a6', { roughness: 0.95 }), dk = mat('#2a1c10');
    const segs = []; const n = 6;
    for (let i = 0; i < n; i++) {
      const x = (i + 0.5) / n * Wd - Wd / 2, w = Wd / n;
      if (o.gate !== false && Math.abs(x) < w * 0.6) continue; // 문 자리
      const s = new THREE.Group(); s.position.x = x; g.add(s); segs.push(s);
      mesh(new THREE.BoxGeometry(w + 0.005, Hh, 0.2), st, s, [0, Hh / 2, 0]).receiveShadow = true;
      for (let k = 0; k < 4; k++) mesh(new THREE.BoxGeometry(w / 6, 0.06, 0.05), st, s, [(k - 1.5) * w / 4, Hh + 0.03, 0.08]); // 흉벽
    }
    [-Wd / 2, Wd / 2, ...(o.gate !== false ? [-0.3, 0.3] : [])].forEach(x => { mesh(new THREE.BoxGeometry(0.26, Hh + 0.18, 0.28), st, g, [x, (Hh + 0.18) / 2, 0.02]).receiveShadow = true; // 탑
      for (let k = 0; k < 3; k++) mesh(new THREE.BoxGeometry(0.05, 0.06, 0.05), st, g, [x + (k - 1) * 0.09, Hh + 0.21, 0.13]); });
    if (o.gate !== false) { mesh(new THREE.BoxGeometry(0.36, 0.2, 0.2), st, g, [0, Hh - 0.1, 0]); mesh(new THREE.BoxGeometry(0.32, Hh - 0.2, 0.02), dk, g, [0, (Hh - 0.2) / 2, 0.09]); }
    const mid = segs.find(s => s.position.x > 0.3) || segs[0], rubble = new THREE.Group(); rubble.position.set(mid.position.x, 0, 0.12); g.add(rubble); rubble.visible = false;
    for (let i = 0; i < 9; i++) mesh(new THREE.DodecahedronGeometry(0.05 + (i % 3) * 0.02, 0), rockM('#b8a888'), rubble, [(i % 3 - 1) * 0.12, 0.03 + Math.floor(i / 3) * 0.04, (i % 2) * 0.08]);
    const mound = mesh(sphere(0.5, 20, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat('#a8936e', { roughness: 1 }), g, [-Wd * 0.3, 0, 0.45], [1.2, 0.35, 0.5]); mound.visible = false; // 흙 언덕 (토성)
    const smoke = smokePuffs(g, [[-Wd * 0.35, Hh, -0.3], [Wd * 0.3, Hh, -0.4]], 10, '#6a625a', 1.1);
    return new Prop(g, (P, t, dt) => {
      const br = P.state === 'breach'; mid.scale.y = damp(mid.scale.y, br ? 0.35 : 1, 1.5, dt); rubble.visible = mid.scale.y < 0.8;
      mound.visible = P.state === 'siege' || br; smoke((P.state === 'siege' ? 1 : 0) * P.show, t);
    }, { state: o.state || 'stand' });
  },

  // 높이 솟는 연기 기둥 (불타는 성읍·제사): o.fire면 밑동에 불빛. state 'on' | 'off'(걷힌다)
  smoke(o = {}) {
    const g = new THREE.Group(), s = smokePuffs(g, [[0, 0.1, 0], [0.12, 0.15, 0.05], [-0.1, 0.12, -0.05]], 14, o.color || '#6a625a', o.rise || 1.8, o.puff || 0.6);
    const em = o.fire ? glow(1.2, 0, '#ff8a40') : null; if (em) { em.position.y = 0.15; g.add(em); }
    let k = 1;
    return new Prop(g, (P, t, dt) => { k = damp(k, P.state === 'off' ? 0 : 1, 0.7, dt); s(k * P.show, t); if (em) em.material.opacity = k * P.show * (0.6 + Math.sin(t * 8) * 0.1); }, { state: o.state || 'on', fade: 'none' });
  },

  // 공물 (왕상 10:2·10 스바 여왕의 향품·금·보석 · 왕하 20:13 히스기야의 보물): 깔개 위에 차례로 놓인다(show가 커지면 하나씩).
  // o.kind 'spice'(향품 자루·항아리와 금덩이) | 'gold'(금·은 그릇과 향유 항아리, 방패)
  tribute(o = {}) {
    const g = new THREE.Group(), gold = goldM(), silver = mat('#c8c8c8', { metalness: 0.7, roughness: 0.3 });
    const rug = mesh(new THREE.BoxGeometry(0.7, 0.006, 0.38), mat('#7a2a3a', { roughness: 1 }), g, [0, 0.003, 0]); rug.receiveShadow = true;
    const items = [];
    const put = (fn, x, z) => { const s = new THREE.Group(); s.position.set(x, 0.006, z); g.add(s); fn(s); items.push(s); };
    if (o.kind === 'gold') {
      put(s => mesh(lathe([[0.001, 0], [0.04, 0], [0.06, 0.05], [0.05, 0.1], [0.03, 0.12], [0.001, 0.12]], 14), gold, s), -0.24, -0.05);
      put(s => mesh(lathe([[0.001, 0], [0.05, 0.02], [0.07, 0.06], [0.001, 0.05]], 14), silver, s), -0.1, 0.08);
      put(s => mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.012, 20), gold, s, [0, 0.07, -0.02]).rotation.x = 1.2, 0.04, -0.08);
      put(s => mesh(lathe([[0.001, 0], [0.035, 0], [0.05, 0.06], [0.03, 0.14], [0.02, 0.16], [0.001, 0.16]], 14), mat('#e8dcc0', { roughness: 0.4 }), s), 0.18, 0.05);
      put(s => { for (let i = 0; i < 3; i++) mesh(new THREE.BoxGeometry(0.08, 0.025, 0.04), gold, s, [0, 0.013 + i * 0.026, 0]); }, 0.28, -0.08);
    } else {
      const sack = mat('#c9a878', { roughness: 1 });
      [-0.26, -0.12].forEach((x, i) => put(s => { mesh(sphere(0.065, 12, 10), sack, s, [0, 0.06, 0], [1, 1.1, 1]); mesh(sphere(0.05, 10, 8), mat(i ? '#a8402a' : '#c98a2a', { roughness: 1 }), s, [0, 0.12, 0], [1, 0.4, 1]); }, x, i ? 0.06 : -0.06));
      put(s => mesh(lathe([[0.001, 0], [0.035, 0], [0.055, 0.06], [0.04, 0.13], [0.025, 0.15], [0.001, 0.15]], 14), mat('#b5653e', { roughness: 0.9 }), s), 0.02, -0.06);
      put(s => { for (let i = 0; i < 4; i++) mesh(new THREE.BoxGeometry(0.08, 0.025, 0.04), gold, s, [(i % 2) * 0.04, 0.013 + Math.floor(i / 2) * 0.026, 0]); }, 0.14, 0.07);
      put(s => { for (let i = 0; i < 6; i++) mesh(new THREE.OctahedronGeometry(0.014), mat(['#9d3328', '#2f6a8a', '#3e7a3a'][i % 3], { roughness: 0.2, metalness: 0.2 }), s, [(i % 3 - 1) * 0.025, 0.015, Math.floor(i / 3) * 0.025]); }, 0.28, -0.04);
    }
    return new Prop(g, P => { items.forEach((s, i) => { const k = Math.min(1, Math.max(0, P.show * items.length - i)); s.scale.setScalar(Math.max(1e-3, k)); s.visible = k > 0.01; }); }, { fade: 'none' });
  },

  /* ---------- 엘리야·엘리사 ---------- */

  // 돌 열두 개로 쌓은 제단 (왕상 18:31–38): 둥글게 쌓은 큰 돌 열둘, 둘레의 도랑, 위의 장작과 제물.
  // state 'idle' | 'wet'(물을 부어 돌이 젖고 도랑에 물이 찬다) | 'fire'(하늘의 불 — 큰 불꽃과 빛, 위에서 빛줄기) | 'ash'(다 타고 도랑의 물도 말랐다, 재와 연기 조금).
  // o.baal: 바알의 제단 — 도랑 없이 다듬은 돌, 불이 붙지 않는다
  altar12(o = {}) {
    const g = new THREE.Group(), stC = new THREE.Color(o.baal ? '#c8b088' : '#a89a82'), wetC = new THREE.Color('#6a6258'), blackC = new THREE.Color('#3a3430');
    const st = new THREE.MeshStandardMaterial({ color: stC.clone(), roughness: 1, flatShading: true });
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, r = i < 8 ? 0.17 : 0.09, y = i < 8 ? 0.06 : 0.17;
      const b = mesh(new THREE.DodecahedronGeometry(i < 8 ? 0.08 : 0.075, 0), st, g, [Math.cos(a + (i >= 8 ? 0.4 : 0)) * r, y, Math.sin(a + (i >= 8 ? 0.4 : 0)) * r * 0.85]); b.rotation.y = i; }
    const trench = new THREE.Group(); g.add(trench);
    const water = new THREE.MeshStandardMaterial({ color: '#6f98a8', roughness: 0.15, metalness: 0.2, transparent: true, opacity: 0, depthWrite: false });
    if (!o.baal) {
      const ring = mesh(new THREE.RingGeometry(0.29, 0.36, 40), mat('#5a4a36', { roughness: 1 }), trench, [0, 0.004, 0]); ring.rotation.x = -Math.PI / 2; ring.castShadow = false;
      const wr = mesh(new THREE.RingGeometry(0.295, 0.355, 40), water, trench, [0, 0.008, 0]); wr.rotation.x = -Math.PI / 2; wr.castShadow = false;
    }
    const wd = new THREE.MeshStandardMaterial({ color: '#7a5634', roughness: 0.95 });
    for (let i = 0; i < 5; i++) mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.24, 5), wd, g, [-0.08 + i * 0.04, 0.25, 0], [1, 1, 1]).rotation.set(Math.PI / 2, 0, (i % 2 ? 0.25 : -0.25));
    const off = mesh(new THREE.BoxGeometry(0.14, 0.05, 0.07), mat('#8a4a3a', { roughness: 0.9 }), g, [0, 0.29, 0]); // 제물
    const fire = new THREE.Group(); fire.position.y = 0.28; g.add(fire);
    const fm = flameM('#ffc060', 0.9), fm2 = flameM('#ff7a30', 0.75);
    const tongues = Array.from({ length: 10 }, (_, i) => tongue(fire, 0.05 + (i % 3) * 0.015, 0.36, [Math.cos(i * 0.9) * 0.08, 0.15, Math.sin(i * 0.9) * 0.06], i % 2 ? fm : fm2));
    const halo = glow(1.8, 0); halo.position.y = 0.2; fire.add(halo);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.3, 3, 20, 1, true), new THREE.MeshBasicMaterial({ color: '#ffd890', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    shaft.position.y = 1.5; g.add(shaft);
    const light = new THREE.PointLight('#ffa850', 0, 3, 1.3); light.position.y = 0.6; g.add(light);
    const smoke = smokePuffs(g, [[0, 0.3, 0]], 8, '#6a625a', 1.0);
    let w = 0, f = 0, a = 0;
    return new Prop(g, (P, t, dt) => {
      const s = P.state, burn = s === 'fire';
      w = damp(w, s === 'wet' ? 1 : 0, 1.2, dt); a = damp(a, s === 'ash' || burn ? 1 : 0, burn ? 0.25 : 1, dt);
      const dtF = (performance.now() / 1000 - P.t0); f = damp(f, burn ? 1 : 0, burn ? 5 : 1, dt);
      water.opacity = w * 0.85;
      st.color.copy(stC).lerp(wetC, w * 0.7).lerp(blackC, a * 0.6);
      fire.visible = f > 0.02; tongues.forEach((c, i) => { c.scale.set(1 + f * 0.6, f * (1.4 + Math.sin(t * 11 + i) * 0.35), 1 + f * 0.6); });
      halo.material.opacity = f * P.show * 0.9; light.intensity = f * 3 * P.show;
      shaft.material.opacity = burn ? Math.max(0, 0.45 - dtF * 0.12) * P.show : 0; // 하늘에서 떨어진 불: 처음 몇 초 빛줄기
      wd.color.set(a > 0.5 ? '#2a2420' : '#7a5634'); off.visible = !(s === 'ash' || (burn && dtF > 3));
      smoke((s === 'ash' ? 0.6 : 0) * P.show, t);
    }, { state: o.state || 'idle' });
  },

  // 불수레와 불말 (왕하 2:11 · 6:17): 수레와 말의 모양을 한 빛 — 몸은 반투명한 불빛, 둘레로 불꽃이 인다. 앞이 +x, speed를 주면 달린다.
  // o.small이면 작게(도단을 둘러싼 불말과 불병거 무리에)
  firechariot(o = {}) {
    const P = MAKERS.chariot({ coat: '#ffb347' }), body = P.obj.children[0];
    body.children[body.children.length - 1].visible = false; // 모는 사람 없이
    // 더하기 섞음(additive)만 쓰면 낮의 밝은 모래 위에서 거의 보이지 않았다(k22) — 몸은 보통 섞음의 불빛 주황, 둘레의 빛만 더한다
    const lm = new THREE.MeshBasicMaterial({ color: '#ffa940', transparent: true, opacity: 0.55, depthWrite: false });
    P.obj.traverse(m => { if (m.isMesh) { m.material = lm; m.castShadow = false; } });
    const fm = flameM('#ffb347', 0.6), sparks = [];
    for (let i = 0; i < 9; i++) sparks.push(tongue(body, 0.03, 0.12, [-0.15 + i * 0.1, 0.25 + (i % 3) * 0.08, (i % 2 ? 1 : -1) * 0.08], fm));
    const h1 = glow(1.3, 0.8), h2 = glow(0.9, 0.7); h1.position.set(0.55, 0.35, 0); h2.position.set(-0.05, 0.35, 0); body.add(h1, h2);
    const light = new THREE.PointLight('#ffb050', 1.6, 2.4, 1.4); light.position.set(0.3, 0.5, 0); body.add(light);
    const upd = P.upd;
    P.upd = (P2, t, dt, env) => { upd(P2, t, dt, env); lm.opacity = 0.72 * P2.show * (1 + Math.sin(t * 9) * 0.08); h1.material.opacity = 0.8 * P2.show; h2.material.opacity = 0.7 * P2.show; light.intensity = 1.6 * P2.show;
      sparks.forEach((c, i) => { c.scale.y = 0.7 + Math.sin(t * 12 + i * 2) * 0.4; c.position.y = 0.25 + (i % 3) * 0.08 + Math.sin(t * 6 + i) * 0.02; }); };
    if (o.small) P.obj.scale.setScalar(0.55);
    return P;
  },

  // 회오리바람 (왕하 2:11): 빙빙 돌며 하늘로 솟는 빛과 바람의 기둥. show로 나타나고 사라진다 (사람을 데려가는 것은 배역의 y·show로)
  whirlwind(o = {}) {
    const g = new THREE.Group(), H = o.h || 2.6, n = 26;
    const sprites = Array.from({ length: n }, (_, i) => { const s = glow(0.35 + i / n * 0.6, 0.5); g.add(s); return s; });
    const cm = new THREE.MeshBasicMaterial({ color: '#fff0c8', transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    const funnel = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.12, H, 24, 1, true), cm); funnel.position.y = H / 2; g.add(funnel);
    const dust = mat('#d8c8a8', { transparent: true, opacity: 0.4, depthWrite: false });
    const motes = Array.from({ length: 30 }, () => { const m = mesh(sphere(0.012, 6, 4), dust, g); m.castShadow = false; return m; });
    return new Prop(g, (P, t) => {
      sprites.forEach((s, i) => { const u = i / n, a = t * 3 + u * 9; s.position.set(Math.cos(a) * (0.1 + u * 0.4), u * H, Math.sin(a) * (0.1 + u * 0.4) * 0.6); s.material.opacity = 0.45 * P.show; });
      funnel.rotation.y = t * 2; cm.opacity = 0.22 * P.show;
      motes.forEach((m, i) => { const u = ((t * 0.3 + i / 30) % 1), a = t * 4 + i; m.position.set(Math.cos(a) * (0.15 + u * 0.45), u * H * 0.8, Math.sin(a) * (0.15 + u * 0.45) * 0.6); });
    }, { fade: 'opacity' });
  },

  // 산을 두른 불말과 불병거 (왕하 6:17): 언덕 위에 빙 둘러 선 작은 빛의 수레들. o.n 수, o.r 반지름, o.y 높이(언덕 위)
  firehost(o = {}) {
    const g = new THREE.Group(), n = o.n || 9, r = o.r || 1.6;
    const list = Array.from({ length: n }, (_, i) => { const a = Math.PI * (1.05 + 0.9 * i / Math.max(1, n - 1)); // 뒤쪽 반원
      const c = inner(g, 'firechariot', { small: true }, [Math.cos(a) * r, (o.y || 0) + (i % 2) * 0.05, Math.sin(a) * r * 0.6], -a - Math.PI / 2); return c; });
    return new Prop(g, (P, t, dt, env) => list.forEach(c => { c.show = P.show; c.upd(c, t, dt, env); }), { fade: 'none' });
  },

  // 까마귀 (왕상 17:6): 검은 새, 부리에 떡 한 조각(o.bread). state 'fly'(날갯짓) | 'rest'(땅에 앉음). 높이는 대본의 y로, 앞이 +x
  raven(o = {}) {
    const g = new THREE.Group(), bk = mat('#1a1a1e', { roughness: 0.6 }), b = new THREE.Group(); g.add(b);
    mesh(sphere(0.035, 12, 10), bk, b, [0, 0.05, 0], [1.6, 0.9, 0.9]);
    mesh(sphere(0.022, 10, 8), bk, b, [0.05, 0.07, 0]);
    mesh(new THREE.ConeGeometry(0.008, 0.03, 6), mat('#2a2a2a'), b, [0.078, 0.068, 0]).rotation.z = -Math.PI / 2;
    mesh(new THREE.BoxGeometry(0.05, 0.006, 0.03), bk, b, [-0.06, 0.052, 0]).rotation.z = 0.15;
    const wings = [-1, 1].map(s => { const w = new THREE.Group(); w.position.set(0, 0.06, s * 0.02); b.add(w); mesh(new THREE.BoxGeometry(0.06, 0.004, 0.09), bk, w, [0, 0, s * 0.045]); return w; });
    const legs = [-1, 1].map(s => mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.03, 4), mat('#3a3a3a'), b, [0, 0.015, s * 0.012]));
    const bread = mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.008, 10), mat('#c99858', { roughness: 1 }), b, [0.09, 0.064, 0]); bread.rotation.x = Math.PI / 2; bread.visible = o.bread !== false;
    const P = new Prop(g, (P, t, dt) => {
      const fly = P.state === 'fly';
      wings.forEach((w, i) => { w.rotation.x = (i ? 1 : -1) * (fly ? Math.sin(t * 16) * 0.8 : -0.1); });
      legs.forEach(l => { l.visible = !fly; });
      if (P.y !== undefined) g.position.y = damp(g.position.y, P.y, 2, dt);
      b.position.y = fly ? Math.sin(t * 4) * 0.01 : 0;
      bread.visible = o.bread !== false && P.state !== 'gave';
    }, { state: o.state || 'fly' });
    P.directional = true;
    return P;
  },

  // 로뎀나무 (왕상 19:4, Retama raetam): 광야의 큰 떨기나무 — 밑동에서 굽은 회갈색 줄기 여럿이 비스듬히 갈라져 오르고,
  // 그 끝에서 잎이 거의 없는 가늘고 긴 회록빛 가지가 수백 가닥 솟았다가 끝이 늘어져 성긴 둥근 지붕을 이룬다. 가지마다 흰 꽃이 조금.
  // 사람(약 0.88)보다 한 길 반쯤 높고, 그 아래 앉은 사람 위로 그늘이 진다 — 앞(+z) 쪽 가지는 앉은 머리 위로 높게 둔다
  broom(o = {}) {
    const g = new THREE.Group();
    let seed = o.seed || 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const up = new THREE.Vector3(0, 1, 0), tmp = new THREE.Vector3(), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), one = new THREE.Vector3();
    const bark = mat('#5f5448', { roughness: 1 });
    // 굽은 줄기 한 마디
    const seg = (a, b, r0, r1) => {
      const d = tmp.subVectors(b, a), L = d.length();
      const c = mesh(new THREE.CylinderGeometry(r1, r0, L, 6), bark, g);
      c.position.copy(a).addScaledVector(d, 0.5); c.quaternion.setFromUnitVectors(up, d.clone().normalize()); return c;
    };
    // 가는 가지(낱낱이 그리면 수백 개라 한 번에 그리는 instanced 원기둥, 밑이 0인 높이 1짜리를 늘려 쓴다)
    const rodG = new THREE.CylinderGeometry(0.0028, 0.0045, 1, 3); rodG.translate(0, 0.5, 0);
    const rods = [], blooms = [];
    const rod = (a, b) => rods.push([a.clone(), b.clone()]);
    const forks = [];
    const N = 7;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2 + rnd() * 0.5;
      let p = new THREE.Vector3(Math.cos(a) * 0.05 + (rnd() - 0.5) * 0.04, 0, Math.sin(a) * 0.04 + (rnd() - 0.5) * 0.03), r = 0.034; // 밑동이 한 점으로 모이지 않게 조금씩 벌려 선다
      for (let k = 0; k < 3; k++) {
        const h = 0.15 + rnd() * 0.05, out = (0.28 + k * 0.16) * (0.8 + rnd() * 0.4);
        const n = p.clone().add(new THREE.Vector3(Math.cos(a) * out * h * 2.4 + (rnd() - 0.5) * 0.04, h, Math.sin(a) * out * h * 1.8 + (rnd() - 0.5) * 0.04));
        seg(p, n, r, r * 0.72); p = n; r *= 0.72;
        if (k >= 1) forks.push([p.clone(), a]);
      }
    }
    // 가운데 줄기 끝 — 지붕 한가운데가 비지 않고 둥글게 차도록
    for (let i = 0; i < 4; i++) { const a = rnd() * 6.28, f = new THREE.Vector3(Math.cos(a) * 0.08, 0.42 + rnd() * 0.08, Math.sin(a) * 0.06 - 0.03); seg(new THREE.Vector3(0, 0.12, -0.02), f, 0.022, 0.012); forks.push([f, a]); }
    // 갈래 끝마다 가는 가지 다발: 위·바깥으로 솟았다가 끝이 바깥으로 늘어진다
    forks.forEach(([f, a]) => {
      for (let j = 0; j < 46; j++) {
        const b = a + (rnd() - 0.5) * 2.2, rise = 0.16 + rnd() * 0.36, reach = 0.08 + rnd() * 0.24;
        const s = f.clone().add(new THREE.Vector3((rnd() - 0.5) * 0.06, (rnd() - 0.3) * 0.08, (rnd() - 0.5) * 0.05));
        const m = s.clone().add(new THREE.Vector3(Math.cos(b) * reach, rise, Math.sin(b) * reach * 0.8));
        const front = Math.sin(b) > 0.3; // 앞쪽은 앉은 사람 머리 위로 늘어지지 않게 덜 처진다
        const drop = front ? 0.05 + rnd() * 0.08 : 0.1 + rnd() * 0.26;
        const e = m.clone().add(new THREE.Vector3(Math.cos(b) * (0.1 + rnd() * 0.16), -drop, Math.sin(b) * (0.08 + rnd() * 0.12)));
        if (front) e.y = Math.max(e.y, 0.66);
        rod(s, m); rod(m, e);
        if (rnd() < 0.35) blooms.push(m.clone().lerp(e, 0.3 + rnd() * 0.6));
        if (rnd() < 0.2) blooms.push(s.clone().lerp(m, 0.5 + rnd() * 0.4));
      }
    });
    const rodM = mat('#ffffff', { roughness: 1 });
    const im = new THREE.InstancedMesh(rodG, rodM, rods.length), col = new THREE.Color();
    rods.forEach(([a, b], i) => {
      const d = tmp.subVectors(b, a), L = d.length();
      q.setFromUnitVectors(up, d.normalize()); m4.compose(a, q, one.set(1, L, 1)); im.setMatrixAt(i, m4);
      im.setColorAt(i, col.set('#8e9a78').offsetHSL((rnd() - 0.5) * 0.03, (rnd() - 0.5) * 0.08, (rnd() - 0.5) * 0.08));
    });
    im.castShadow = true; g.add(im);
    // 흰 꽃 (이른 봄)
    const fl = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.011, 0), mat('#f3efe2', { roughness: 1 }), blooms.length);
    blooms.forEach((p, i) => { m4.compose(p, q.identity(), one.set(1, 0.8, 1)); fl.setMatrixAt(i, m4); });
    g.add(fl);
    // 가지 덩이의 엷은 빛 — 가는 가지 사이가 흐리게 차 보이도록 (멀리서도 나무로 읽히게)
    const haze = mat('#97a382', { roughness: 1, transparent: true, opacity: 0.26, depthWrite: false });
    [[0, 0.86, -0.04, 0.46], [-0.3, 0.74, 0.05, 0.3], [0.3, 0.76, -0.1, 0.32], [0.05, 0.78, 0.25, 0.28], [-0.05, 0.8, -0.32, 0.3]]
      .forEach(([x, y, z, s]) => { mesh(sphere(1, 12, 8), haze, g, [x, y, z], [s * 1.2, s * 0.55, s]).castShadow = true; });
    // 그늘: 나무 밑 모래에 진 둥근 그림자
    const sh = mesh(new THREE.CircleGeometry(0.62, 24), new THREE.MeshBasicMaterial({ color: '#3a2e1e', transparent: true, opacity: 0.1, depthWrite: false }), g, [0, 0.006, 0.04]);
    sh.rotation.x = -Math.PI / 2; sh.scale.set(1.25, 1, 1); sh.castShadow = false;
    return new Prop(g);
  },

  // 호렙산의 바람·지진·불 (왕상 19:11–12): 굴 앞을 지나가는 세 가지 — 그 안에 여호와는 계시지 않았다.
  // state 'still' | 'wind'(흙먼지와 부서진 돌이 휘몰아친다) | 'quake'(바위가 흔들리고 금이 빛난다) | 'fire'(불길이 지나간다). 그다음 세미한 소리는 빛(beam)으로
  tempest(o = {}) {
    const g = new THREE.Group(), R = o.r || 1.4;
    const dust = new THREE.MeshStandardMaterial({ color: '#b8a888', roughness: 1, transparent: true, opacity: 0, depthWrite: false });
    const motes = Array.from({ length: 40 }, (_, i) => { const m = mesh(sphere(0.03 + (i % 4) * 0.02, 8, 6), dust, g); m.castShadow = false; return m; });
    const rock = rockM('#8a6a5a'), stones = Array.from({ length: 8 }, (_, i) => mesh(new THREE.DodecahedronGeometry(0.04 + (i % 3) * 0.02, 0), rock, g));
    const crack = new THREE.MeshBasicMaterial({ color: '#ffb070', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    const cracks = Array.from({ length: 5 }, (_, i) => { const c = mesh(new THREE.BoxGeometry(0.5 - i * 0.05, 0.004, 0.012), crack, g, [(i - 2) * 0.3, 0.006, 0.3 + (i % 2) * 0.2]); c.rotation.y = i * 0.9; c.castShadow = false; return c; });
    const fm = flameM('#ff9a40', 0.8), fire = new THREE.Group(); g.add(fire);
    const tongues = Array.from({ length: 14 }, (_, i) => tongue(fire, 0.06, 0.3, [0, 0.15, (i / 13 - 0.5) * 1.6], fm));
    const fh = glow(1.6, 0, '#ff9a50'); fh.position.y = 0.3; fire.add(fh);
    const fl = new THREE.PointLight('#ff8a40', 0, 3, 1.3); fl.position.y = 0.5; fire.add(fl);
    let w = 0, q = 0, f = 0;
    return new Prop(g, (P, t, dt) => {
      const s = P.state, el = performance.now() / 1000 - P.t0;
      w = damp(w, s === 'wind' ? 1 : 0, 2, dt); q = damp(q, s === 'quake' ? 1 : 0, 2, dt); f = damp(f, s === 'fire' ? 1 : 0, 2, dt);
      dust.opacity = w * 0.45 * P.show;
      motes.forEach((m, i) => { const u = (t * 0.6 + i / 40) % 1; m.position.set(-R + u * 2 * R, 0.1 + (i % 5) * 0.12 + Math.sin(t * 3 + i) * 0.05, -0.4 + (i % 7) * 0.15); m.visible = w > 0.03; });
      stones.forEach((m, i) => { const u = (t * 0.9 + i / 8) % 1; m.position.set(-R + u * 2 * R, 0.05 + Math.abs(Math.sin(u * Math.PI * 3)) * 0.3, -0.2 + (i % 4) * 0.12); m.rotation.set(t * 5 + i, t * 3, 0); m.visible = w > 0.3; });
      crack.opacity = q * (0.6 + Math.sin(t * 20) * 0.3) * P.show; g.position.x += q > 0.1 ? Math.sin(t * 40) * 0.0015 : 0;
      fire.visible = f > 0.02; fire.position.x = -R + ((el * 0.5) % 1) * 2 * R; tongues.forEach((c, i) => { c.scale.y = f * (1 + Math.sin(t * 12 + i) * 0.4); });
      fh.material.opacity = f * 0.8 * P.show; fl.intensity = f * 2.2 * P.show;
    }, { state: o.state || 'still', fade: 'none' });
  },

  // 사르밧 과부의 밀가루 통과 기름병 (왕상 17:12–16): 질그릇 통과 작은 병. state 'low'(바닥이 보인다) | 'full'(밀가루가 차오르고 은은히 빛난다)
  flourjar(o = {}) {
    const g = new THREE.Group(), clay = mat('#b5653e', { roughness: 0.9 });
    mesh(lathe([[0.001, 0], [0.06, 0], [0.085, 0.07], [0.08, 0.16], [0.06, 0.2], [0.065, 0.21], [0.058, 0.215], [0.05, 0.2], [0.001, 0.19]], 20), clay, g);
    const flour = mesh(new THREE.CircleGeometry(0.055, 18), mat('#f4efe2', { roughness: 1 }), g, [0, 0.06, 0]); flour.rotation.x = -Math.PI / 2;
    const cruse = new THREE.Group(); cruse.position.set(0.14, 0, 0.04); g.add(cruse);
    mesh(lathe([[0.001, 0], [0.03, 0], [0.04, 0.04], [0.025, 0.08], [0.012, 0.1], [0.016, 0.11], [0.001, 0.11]], 14), mat('#a85a34', { roughness: 0.8 }), cruse);
    const shine = glow(0.4, 0); shine.position.set(0.05, 0.16, 0); g.add(shine);
    let k = o.state === 'full' ? 1 : 0;
    return new Prop(g, (P, t, dt) => { k = damp(k, P.state === 'full' ? 1 : 0, 1, dt); flour.position.y = 0.06 + k * 0.13; shine.material.opacity = k * P.show * (0.35 + Math.sin(t * 2) * 0.1); }, { state: o.state || 'low' });
  },

  // 다락방이 있는 집 (수넴 — 왕하 4:10 · 사르밧 — 왕상 17:19): 흙벽돌 집 지붕 위에 앞이 트인 작은 방 — 침상·상·의자·등잔.
  // 방 안의 사람은 지붕 높이에 선다(heightAt), 침상 위에 누운 사람은 그보다 조금 높게. o.wall 벽빛. state 'idle' | 'lit'(등잔이 켜진다)
  // 다락방 높이는 1.0 — 0.5였을 때 방 안에 선 사람(0.88)의 머리가 지붕을 뚫어 무릎 꿇기·지붕 위 세우기로 피했다(k14 upperroom을 합침)
  roomhouse(o = {}) {
    const g = new THREE.Group(), wall = mat(o.wall || '#cdb48e', { roughness: 1 }), dark = mat('#2a1c10'), roofM = mat('#a98f68', { roughness: 1 });
    const W = 1.15, H = 0.62, D = 0.85; // 아래층(낮게 — 다락방이 화면에 들어오게)
    mesh(new THREE.BoxGeometry(W, H, D), wall, g, [0, H / 2, 0]).receiveShadow = true;
    mesh(new THREE.BoxGeometry(W + 0.04, 0.04, D + 0.04), roofM, g, [0, H + 0.02, 0]).receiveShadow = true;
    mesh(new THREE.BoxGeometry(0.22, 0.46, 0.02), dark, g, [-0.3, 0.23, D / 2 + 0.006]); // 아래층 문
    for (let i = 0; i < 6; i++) { const h = (i + 1) * H / 6; mesh(new THREE.BoxGeometry(0.15, h, 0.12), wall, g, [-W / 2 - 0.08, h / 2, D / 2 - 0.06 - i * 0.12]).receiveShadow = true; } // 지붕으로 오르는 계단
    // 다락방: 지붕의 오른쪽 뒤, 뒷벽·옆벽·지붕만 두고 앞(+z)과 왼쪽은 트였다
    const RX = 0.12, RW = 0.85, RD = 0.62, RH = o.rh || 1.0, ry = H + 0.04; // 선 사람(0.88)이 들어가는 높이
    mesh(new THREE.BoxGeometry(RW, RH, 0.05), wall, g, [RX, ry + RH / 2, -D / 2 + 0.03]).receiveShadow = true;
    mesh(new THREE.BoxGeometry(0.05, RH, RD), wall, g, [RX + RW / 2, ry + RH / 2, -D / 2 + RD / 2]).receiveShadow = true;
    const cap = mesh(new THREE.BoxGeometry(RW + 0.04, 0.035, RD + 0.04), roofM, g, [RX, ry + RH + 0.02, -D / 2 + RD / 2]); cap.receiveShadow = true;
    mesh(new THREE.BoxGeometry(0.05, RH, 0.05), wall, g, [RX - RW / 2, ry + RH / 2, -D / 2 + RD]); // 앞 모서리 기둥
    // 침상·상·의자·등잔 (4:10)
    const bed = new THREE.Group(); bed.position.set(RX + 0.18, ry, -D / 2 + 0.2); g.add(bed);
    mesh(new THREE.BoxGeometry(0.42, 0.05, 0.2), wood(), bed, [0, 0.08, 0]);
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, b]) => mesh(new THREE.BoxGeometry(0.02, 0.08, 0.02), wood(), bed, [a * 0.19, 0.04, b * 0.08]));
    mesh(new THREE.BoxGeometry(0.4, 0.02, 0.18), mat('#e8dcc0', { roughness: 1 }), bed, [0, 0.115, 0]);
    mesh(new THREE.BoxGeometry(0.16, 0.012, 0.12), wood(), g, [RX - 0.22, ry + 0.14, -D / 2 + 0.16]); mesh(new THREE.BoxGeometry(0.02, 0.14, 0.02), wood(), g, [RX - 0.22, ry + 0.07, -D / 2 + 0.16]);
    mesh(new THREE.BoxGeometry(0.08, 0.08, 0.08), wood(), g, [RX - 0.08, ry + 0.04, -D / 2 + 0.3]);
    const flame = mesh(new THREE.ConeGeometry(0.008, 0.024, 6), mat('#ffd27a', { emissive: '#ffb347', emissiveIntensity: 2.5 }), g, [RX - 0.22, ry + 0.17, -D / 2 + 0.16]); flame.castShadow = false;
    const halo = glow(0.45, 0); halo.position.set(RX - 0.22, ry + 0.18, -D / 2 + 0.16); g.add(halo);
    const light = new THREE.PointLight('#ffc070', 0, 1.6, 1.4); light.position.set(RX - 0.15, ry + 0.3, -D / 2 + 0.35); g.add(light);
    let k = 0;
    const P = new Prop(g, (P, t, dt) => { k = damp(k, P.state === 'lit' ? 1 : 0, 1.5, dt); flame.visible = k > 0.1; halo.material.opacity = k * 0.8 * P.show; light.intensity = k * 1.5 * P.show * (1 + Math.sin(t * 9) * 0.05); });
    P.floor = true;
    P.heightAt = (x, z) => { const u = (x - g.position.x) / g.scale.x, v = (z - g.position.z) / g.scale.z;
      if (P.show < 0.5 || Math.abs(u) > W / 2 || Math.abs(v) > D / 2) return 0;
      if (Math.abs(u - bed.position.x) < 0.21 && Math.abs(v - bed.position.z) < 0.1) return (ry + 0.125) * g.scale.y; // 침상 위
      return (H + 0.04) * g.scale.y; };
    P.bed = [RX + 0.18, -D / 2 + 0.2]; // 침상 자리 (소품 기준) — 대본에서 x, z를 맞출 때
    return P;
  },

  // 갈라지는 강 (요단 — 왕하 2:8·14): 앞뒤(z)로 흐르는 강줄기와 갈대 둑. 사람은 서(-x)에서 동(+x)으로 건넌다.
  // state 'flow' | 'part'(가운데 |z| < o.gap 사이의 물이 위아래로 물러나 마른 바닥) | 'stir'(물결이 인다 — 몸을 담그는 자리). o.w 강폭(기본 0.6), o.len 길이(기본 3.2), o.color 물빛
  river(o = {}) {
    const g = new THREE.Group(), Wd = o.w || 0.6, L = o.len || 3.2, gap = o.gap || 0.32;
    const bed = mesh(new THREE.PlaneGeometry(Wd + 0.1, L), mat('#8a7a5a', { roughness: 1 }), g, [0, 0.004, 0]); bed.rotation.x = -Math.PI / 2; bed.receiveShadow = true;
    const wm = new THREE.MeshStandardMaterial({ color: o.color || '#6f98a8', roughness: 0.2, metalness: 0.15, transparent: true, opacity: 0.88, depthWrite: false });
    const halves = [-1, 1].map(k => { const h = new THREE.Group(); h.position.z = k * L / 4; g.add(h);
      const geo = new THREE.PlaneGeometry(Wd, L / 2, 6, 24); geo.rotateX(-Math.PI / 2);
      const m = mesh(geo, wm, h, [0, 0.03, 0]); m.castShadow = false; m.renderOrder = 2; h.userData.geo = geo; h.userData.k = k;
      const edge = mesh(new THREE.BoxGeometry(Wd, 0.06, 0.02), wm, h, [0, 0.03, -k * L / 4]); edge.castShadow = false; h.userData.edge = edge; return h; });
    const reed = mat('#8a9a5a', { roughness: 1 });
    for (let i = 0; i < 40; i++) { const side = i % 2 ? 1 : -1, z = (i / 39 - 0.5) * L * 0.95; if (Math.abs(z) < gap + 0.15) continue;
      mesh(new THREE.CylinderGeometry(0.004, 0.006, 0.16 + (i % 3) * 0.05, 4), reed, g, [side * (Wd / 2 + 0.04 + (i % 3) * 0.02), 0.09, z]); }
    const ring = mesh(new THREE.RingGeometry(0.06, 0.08, 24), new THREE.MeshBasicMaterial({ color: '#e8f4f8', transparent: true, opacity: 0, depthWrite: false }), g, [0, 0.04, 0]); ring.rotation.x = -Math.PI / 2;
    let p = 0;
    return new Prop(g, (P, t, dt) => {
      p = damp(p, P.state === 'part' ? 1 : 0, 1.3, dt);
      halves.forEach(h => { const k = h.userData.k, s = 1 - p * gap / (L / 2); h.scale.z = Math.max(0.01, s); h.position.z = k * (L / 2 - (L / 2) * h.scale.z / 2); h.userData.edge.scale.y = 1 + p * 3; h.userData.edge.position.y = 0.03 + p * 0.06;
        const pos = h.userData.geo.attributes.position; for (let i = 0; i < pos.count; i++) pos.setY(i, Math.sin(pos.getZ(i) * 9 + t * 2 + pos.getX(i) * 5) * 0.004); pos.needsUpdate = true; });
      wm.opacity = 0.88 * P.show;
      const st = P.state === 'stir', u = (t * 0.8) % 1; ring.material.opacity = st ? (1 - u) * 0.7 : 0; ring.scale.setScalar(st ? 1 + u * 3 : 1);
    }, { state: o.state || 'flow', fade: 'opacity' });
  },

  // 빌린 도끼 (왕하 6:5–6): 쇠 도끼날. state 'sink'(물 밑 — 보이지 않는다) | 'float'(떠올라 물 위에서 흔들린다) | 'held'(땅에 놓인 자루 끼운 도끼).
  // 물속에서 떠오를 때 던진 나뭇가지(o.stick)가 곁에 뜬다
  axehead(o = {}) {
    const g = new THREE.Group(), iron = mat('#5a5a5e', { metalness: 0.6, roughness: 0.45 });
    const head = new THREE.Group(); g.add(head);
    mesh(new THREE.BoxGeometry(0.07, 0.035, 0.016), iron, head, [0, 0, 0]);
    mesh(new THREE.BoxGeometry(0.02, 0.06, 0.018), iron, head, [0.04, 0, 0]);
    const haft = mesh(new THREE.CylinderGeometry(0.006, 0.007, 0.26, 6), wood(), head, [-0.12, 0, 0]); haft.rotation.z = Math.PI / 2;
    const stick = mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.16, 5), mat('#6a5a3a'), g, [0.1, 0.05, 0.06]); stick.rotation.set(Math.PI / 2, 0.6, 0);
    const shine = glow(0.3, 0); g.add(shine);
    return new Prop(g, (P, t, dt) => {
      const s = P.state, fl = s === 'float';
      head.position.y = damp(head.position.y, fl ? 0.06 + Math.sin(t * 2) * 0.008 : s === 'held' ? 0.02 : -0.08, 1.5, dt);
      head.visible = head.position.y > -0.05; haft.visible = s === 'held'; head.rotation.z = fl ? Math.sin(t * 1.3) * 0.08 : 0;
      stick.visible = fl && o.stick !== false; stick.position.y = 0.05 + Math.sin(t * 2.2) * 0.006;
      shine.position.copy(head.position); shine.material.opacity = fl ? 0.4 * P.show : 0;
    }, { state: o.state || 'sink', fade: 'none' });
  },

  // 겨릿소와 쟁기 (왕상 19:19): 멍에를 멘 소 두 마리가 나무 쟁기를 끈다. 앞이 +x — speed를 주면 걷는다. state 'go' | 'burn'(멍에와 쟁기를 불살라 — 19:21, 불은 altar 소품으로)
  ploughteam(o = {}) {
    const g = new THREE.Group(), dk = mat('#5e4128');
    const oxen = [-1, 1].map(k => inner(g, 'ox', {}, [0.2, 0, k * 0.15]));
    mesh(new THREE.BoxGeometry(0.04, 0.03, 0.44), dk, g, [0.28, 0.44, 0]); // 멍에
    const plough = new THREE.Group(); g.add(plough);
    mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.6, 6), dk, plough, [-0.08, 0.3, 0]).rotation.z = Math.PI / 2 - 0.45; // 끌채
    mesh(new THREE.CylinderGeometry(0.012, 0.008, 0.22, 6), dk, plough, [-0.36, 0.1, 0]).rotation.z = 0.5; // 보습
    mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.2, 6), dk, plough, [-0.42, 0.24, 0]).rotation.z = -0.4; // 손잡이
    const P = new Prop(g, (P, t, dt, env) => { oxen.forEach(ox => { ox.moving = P.moving; ox.upd(ox, t, dt, env); }); }, { state: o.state || 'go' });
    P.directional = true;
    return P;
  },

  // 갈아 놓은 밭이랑 (아벨므홀라): 길게 갈아엎은 흙 줄. o.w·o.d
  furrows(o = {}) {
    const g = new THREE.Group(), Wd = o.w || 2.4, Dd = o.d || 1.2, soil = mat('#7a5e40', { roughness: 1 }), soil2 = mat('#8a6e4e', { roughness: 1 });
    const base = mesh(new THREE.PlaneGeometry(Wd, Dd), soil2, g, [0, 0.003, 0]); base.rotation.x = -Math.PI / 2; base.receiveShadow = true;
    for (let i = 0; i < 10; i++) { const r = mesh(new THREE.CylinderGeometry(0.02, 0.02, Wd * 0.96, 6), soil, g, [0, 0.008, (i / 9 - 0.5) * Dd * 0.9]); r.rotation.z = Math.PI / 2; r.scale.set(1, 1, 0.5); r.receiveShadow = true; r.castShadow = false; }
    return new Prop(g);
  },

  // 포도원 (나봇의 포도원 — 왕상 21:1): 낮은 시렁에 줄지어 선 포도나무와 송이. o.rows 줄 수, o.len 길이, 앞에 낮은 돌담
  vineyard(o = {}) {
    const g = new THREE.Group(), rows = o.rows || 4, L = o.len || 1.6, vine = mat('#5a4a32', { roughness: 1 }), leaf = mat('#5f7a3e', { roughness: 0.9 }), grape = mat('#4a2a4a', { roughness: 0.5 });
    for (let r = 0; r < rows; r++) { const z = -0.25 * r;
      for (let i = 0; i < 6; i++) { const x = (i / 5 - 0.5) * L;
        mesh(new THREE.CylinderGeometry(0.008, 0.012, 0.22, 5), vine, g, [x, 0.11, z]);
        mesh(sphere(0.07, 10, 8), leaf, g, [x, 0.24, z], [1.4, 0.6, 0.9]);
        if ((i + r) % 2 === 0) mesh(sphere(0.02, 8, 6), grape, g, [x + 0.03, 0.18, z + 0.05], [0.8, 1.3, 0.8]); }
      mesh(new THREE.CylinderGeometry(0.004, 0.004, L, 4), vine, g, [0, 0.22, z]).rotation.z = Math.PI / 2; }
    const st = rockM('#b0a080');
    for (let i = 0; i < 14; i++) mesh(new THREE.DodecahedronGeometry(0.04, 0), st, g, [(i / 13 - 0.5) * (L + 0.2), 0.03, 0.2]);
    return new Prop(g);
  },

  // 이스라엘의 병거 (왕상 12:18 · 22:34 · 왕하 9:20): chariotI에 사람을 태울 자리(deck)를 더했다. 앞이 +x, 대본에서 board로 태운다 (선 채로 — pose idle).
  // o.coat 말빛
  kchariot(o = {}) {
    const P = MAKERS.chariotI(o), body = P.obj.children[0];
    const deck = new THREE.Group(); deck.position.set(-0.04, 0.31, 0); body.add(deck); P.deck = deck;
    return P;
  },

  /* ---------- 히스기야·요시야·바벨론 ---------- */

  // 장대 위의 놋뱀 (왕하 18:4 — 모세가 만든 것, 백성이 분향하던 느후스단): 장대 끝에 감긴 놋뱀과 앞의 작은 분향단.
  // state 'stand' | 'broken'(장대가 쓰러지고 놋뱀이 조각나 흩어진다)
  nehushtan(o = {}) {
    const g = new THREE.Group(), pole = new THREE.Group(); g.add(pole);
    mesh(new THREE.CylinderGeometry(0.014, 0.018, 0.9, 8), wood(), pole, [0, 0.45, 0]);
    const curve = new THREE.CatmullRomCurve3(Array.from({ length: 30 }, (_, i) => { const u = i / 29, a = u * Math.PI * 5; return new THREE.Vector3(Math.cos(a) * 0.035, 0.6 + u * 0.28, Math.sin(a) * 0.035); }));
    const snake = mesh(new THREE.TubeGeometry(curve, 60, 0.011, 8), bronze(), pole);
    mesh(sphere(0.02, 10, 8), bronze(), pole, [0.03, 0.9, 0], [1.4, 0.8, 1]);
    const base = mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.06, 10), rockM('#a89a82'), g, [0, 0.03, 0]);
    const inc = new THREE.Group(); inc.position.set(0.18, 0, 0.12); g.add(inc); mesh(new THREE.BoxGeometry(0.08, 0.12, 0.08), rockM('#b0a080'), inc, [0, 0.06, 0]);
    const smoke = smokePuffs(inc, [[0, 0.14, 0]], 6, '#c8c0b4', 0.6);
    const bits = Array.from({ length: 7 }, (_, i) => { const b = mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.05 + (i % 3) * 0.02, 6), bronze(), g, [(i - 3) * 0.06, 0.012, 0.15 + (i % 2) * 0.06]); b.rotation.set(Math.PI / 2, i, 0); b.visible = false; return b; });
    return new Prop(g, (P, t, dt) => {
      const br = P.state === 'broken';
      pole.rotation.z = damp(pole.rotation.z, br ? -1.45 : 0, 2.5, dt); snake.visible = !br || pole.rotation.z > -0.6;
      bits.forEach(b => { b.visible = br && pole.rotation.z < -0.6; });
      smoke((br ? 0 : 1) * P.show, t);
    }, { state: o.state || 'stand' });
  },

  // 아하스의 해시계 계단 (왕하 20:9–11): 윗방으로 오르는 열두 층계와 그 곁에 선 해시계 기둥, 층계에 드리운 그림자.
  // state 'fwd'(그림자가 층계를 따라 내려가 있다) | 'back'(그림자가 열 층계 뒤로 물러간다 — 천천히, 빛과 함께). 계단은 앞(+z)에서 뒤로 오른다
  sundial(o = {}) {
    const g = new THREE.Group(), st = mat('#e2d6bc', { roughness: 0.95 }), n = 12;
    for (let i = 0; i < n; i++) mesh(new THREE.BoxGeometry(0.6, 0.045 * (i + 1), 0.07), st, g, [0, 0.0225 * (i + 1), 0.4 - i * 0.07]).receiveShadow = true;
    mesh(new THREE.BoxGeometry(0.7, 0.75, 0.3), st, g, [0, 0.375, 0.4 - n * 0.07 - 0.12]).receiveShadow = true; // 윗방 (왕궁의 다락)
    mesh(new THREE.BoxGeometry(0.18, 0.3, 0.02), mat('#2a1c10'), g, [0, 0.69, 0.4 - n * 0.07 + 0.035]);
    mesh(new THREE.CylinderGeometry(0.015, 0.025, 0.5, 8), mat('#b0a080'), g, [-0.42, 0.25, 0.1]); // 해시계 기둥
    const sh = new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.45, depthWrite: false });
    const shadow = mesh(new THREE.PlaneGeometry(0.62, 0.075), sh, g, [0, 0, 0]); shadow.rotation.x = -Math.PI / 2; shadow.castShadow = false;
    const halo = glow(1.6, 0); halo.position.set(-0.3, 1.1, -0.2); g.add(halo);
    let k = 9.5;
    return new Prop(g, (P, t, dt) => {
      const back = P.state === 'back'; k = damp(k, back ? -0.5 : 9.5, back ? 0.35 : 3, dt); // 층계 번호(0이 맨 앞): 그림자가 앞의 층계에서 위로 물러간다
      const i = Math.round(Math.max(0, Math.min(n - 1, 11 - k)));
      shadow.position.set(0, 0.045 * (i + 1) + 0.003, 0.4 - i * 0.07);
      halo.material.opacity = back ? Math.min(1, (performance.now() / 1000 - P.t0) * 0.3) * 0.6 * P.show : 0;
    }, { state: o.state || 'fwd' });
  },

  // 성전에서 찾은 율법책 (왕하 22:8): 수리하던 성전 벽 곁의 상자와 그 안의 두루마리. state 'hidden'(상자만) | 'found'(두루마리가 빛나며 상자 위로 들린다) | 'open'(펼친 두루마리).
  // o.letter면 상자 없이 바닥에 펼친 편지 (히스기야가 여호와 앞에 펼친 산헤립의 편지 — 19:14)
  lawscroll(o = {}) {
    const g = new THREE.Group(), parch = mat('#efe2c0', { ...DS, roughness: 0.85 });
    const chest = new THREE.Group(); g.add(chest); chest.visible = !o.letter;
    mesh(new THREE.BoxGeometry(0.26, 0.12, 0.16), wood(), chest, [0, 0.06, 0]); mesh(new THREE.BoxGeometry(0.28, 0.02, 0.18), mat('#5e4128'), chest, [0, 0.13, -0.06]).rotation.x = -0.9;
    const roll = new THREE.Group(); g.add(roll);
    [-1, 1].forEach(s => mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.14, 12), parch, roll, [s * 0.03, 0, 0]).rotation.x = Math.PI / 2);
    const sheet = mesh(new THREE.PlaneGeometry(0.3, 0.14), parch, g, [0, 0.008, 0]); sheet.rotation.x = -Math.PI / 2; sheet.castShadow = false;
    for (let i = 0; i < 6; i++) { const l = mesh(new THREE.PlaneGeometry(0.24, 0.006), mat('#5a4a3a', DS), sheet, [0, 0.05 - i * 0.02, 0.001]); l.castShadow = false; }
    [-1, 1].forEach(s => mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.15, 10), parch, sheet, [s * 0.16, 0, 0.01]).rotation.x = Math.PI / 2);
    const shine = glow(0.7, 0); g.add(shine);
    return new Prop(g, (P, t, dt) => {
      const s = P.state, open = s === 'open' || o.letter;
      roll.visible = !open && s !== 'hidden'; sheet.visible = open;
      roll.position.y = damp(roll.position.y, s === 'found' ? 0.3 + Math.sin(t * 1.5) * 0.01 : 0.1, 1.5, dt);
      shine.position.set(0, open ? 0.05 : roll.position.y, 0); shine.material.opacity = (s === 'found' || (s === 'open' && !o.letter) ? 0.7 : 0) * P.show;
    }, { state: o.state || (o.letter ? 'open' : 'hidden'), fade: 'none' });
  },

  // 바벨론 강가의 버드나무 (시 137:2): 물가로 늘어진 가는 가지들. o.lyres면 가지에 건 수금 셋
  willow(o = {}) {
    const g = new THREE.Group(), bark = mat('#6a5a46', { roughness: 1 }), leaf = mat('#8a9a5a', { roughness: 0.9, ...DS });
    mesh(new THREE.CylinderGeometry(0.04, 0.07, 0.7, 8), bark, g, [0, 0.35, 0]).rotation.z = 0.12;
    [[-0.2, 0.75, 0.2], [0.25, 0.8, -0.1], [0.05, 0.85, 0.15]].forEach(([x, y, r]) => { const c = mesh(new THREE.CylinderGeometry(0.015, 0.03, 0.4, 6), bark, g, [x * 0.5 + 0.04, y - 0.1, 0]); c.rotation.z = -x * 2.4; });
    for (let i = 0; i < 46; i++) { const a = i * 2.399, r = 0.15 + (i % 6) * 0.06, L = 0.35 + (i % 4) * 0.12;
      const s = mesh(new THREE.PlaneGeometry(0.03, L), leaf, g, [0.04 + Math.cos(a) * r, 0.92 - L / 2, Math.sin(a) * r * 0.7]); s.rotation.y = a; s.castShadow = i % 2 === 0; }
    const lyres = [];
    if (o.lyres) [[-0.2, 0.62, 0.15], [0.22, 0.66, 0.05], [0.02, 0.58, 0.22]].forEach(([x, y, z], i) => {
      const l = new THREE.Group(); l.position.set(x, y, z); l.rotation.z = (i - 1) * 0.2; g.add(l); lyres.push(l);
      const lw = mat('#8a5a2e', { roughness: 0.7 });
      mesh(new THREE.BoxGeometry(0.1, 0.05, 0.025), lw, l, [0, -0.06, 0]);
      [-1, 1].forEach(k => { const a = mesh(new THREE.BoxGeometry(0.012, 0.15, 0.014), lw, l, [k * 0.04, 0.02, 0]); a.rotation.z = -k * 0.14; });
      mesh(new THREE.BoxGeometry(0.13, 0.012, 0.016), lw, l, [0, 0.095, 0]);
      mesh(new THREE.CylinderGeometry(0.002, 0.002, 0.08, 4), mat('#3a2a1a'), l, [0, 0.13, 0]); });
    return new Prop(g, (P, t) => { lyres.forEach((l, i) => { l.rotation.z = (i - 1) * 0.2 + Math.sin(t * 0.8 + i) * 0.04; }); });
  },
});

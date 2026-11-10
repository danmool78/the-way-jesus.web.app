/* 열왕기 여정 묶음 b(k12–k22, 엘리야)에만 쓰는 소품과 인물: props.js의 MAKERS, people.js의 TYPES에 더한다 (공용 파일을 키우지 않게).
   크기는 사람 키(약 0.88)와의 비례로. 하나님의 일(불·구름·회오리바람)은 빛과 불꽃(글로우)으로만 */
import { THREE, mat, DS, lathe, mesh, sphere, glowTexture, damp } from '../kit.js';
import { MAKERS, Prop } from '../props.js';
import { TYPES } from '../people.js';

Object.assign(TYPES, {
  ahabS: { robe: '#5e574c', trim: '#4a4238', mantle: '#4f483e', hair: '#1d140c', beard: true, sash: '#4a4238', skin: 2, height: 1.0 }, // 옷을 찢고 굵은 베옷을 입은 아합 (왕상 21:27 — 금관 없이)
  zedekiahF: { robe: '#e8dcc0', trim: '#2a5a5e', mantle: '#2a5a5e', hair: '#2b1b10', beard: true, turban: '#d6a93a', sash: '#2a5a5e', skin: 2, height: 0.98 }, // 그나아나의 아들 시드기야 (궁정 선지자의 우두머리 — 금빛 머릿수건)
  scoundrel: { robe: '#5a4a3a', trim: '#3a2e22', hair: '#1d140c', beard: true, hood: '#6a5a46', band: '#3a2e22', sash: '#3a2e22', skin: 2 }, // 거짓 증언하는 불량배 (왕상 21:10)
});

const wood = () => mat('#7a5634', { roughness: 0.95 });
const rockM = (c = '#a8977c') => mat(c, { roughness: 1, flatShading: true });
const glow = (size, opacity = 1, color) => {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity, ...(color ? { color } : {}) }));
  s.scale.set(size, size, 1);
  return s;
};
const flameM = (c = '#ffb347', o = 0.85) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, depthWrite: false, blending: THREE.AdditiveBlending });
const boulder = (g, m, r, pos, sc = [1, 1, 1]) => { const geo = new THREE.DodecahedronGeometry(r, 0); geo.rotateY(pos[0] * 5 + pos[2] * 3); const b = mesh(geo, m, g, pos, sc); b.receiveShadow = true; return b; };

Object.assign(MAKERS, {
  // 그릿 시냇가 (왕상 17:3–7): 바위 비탈 사이 깊은 골짜기, 앞에 x 방향으로 흐르는 시냇물과 웅덩이.
  // state 'flow'(물이 흐른다) | 'low'(물줄기가 가늘어지고 웅덩이가 준다) | 'dry'(바닥이 드러나고 젖은 돌이 하얗게 마른다). o.len 길이
  wadi(o = {}) {
    const g = new THREE.Group(), L = o.len || 2.6, rock = rockM('#c2b092'), rock2 = rockM('#d2c2a4');
    // 뒤쪽의 높은 바위 비탈 (골짜기 벽) — 사람 뒤로 깊게
    [[-1.1, -0.66, 0.3, [1.5, 1.5, 0.8]], [-0.35, -0.8, 0.34, [1.5, 1.7, 0.7]], [0.5, -0.76, 0.3, [1.4, 1.55, 0.8]], [1.2, -0.62, 0.26, [1.5, 1.4, 0.9]]]
      .forEach(([x, z, r, sc], i) => boulder(g, i % 2 ? rock : rock2, r, [x, r * 0.55, z], sc));
    [[-1.35, 0.55, 0.16], [1.4, 0.5, 0.14], [-0.6, 0.62, 0.08]].forEach(([x, z, r]) => boulder(g, rock2, r, [x, r * 0.5, z], [1.3, 0.8, 1]));
    // 물길: 굽이진 띠 (x 방향, z ≈ 0.3 — 사람은 그 뒤에)
    const bedGeo = new THREE.PlaneGeometry(L, 0.42, 60, 2); bedGeo.rotateX(-Math.PI / 2);
    const wGeo = new THREE.PlaneGeometry(L, 0.26, 60, 2); wGeo.rotateX(-Math.PI / 2);
    [bedGeo, wGeo].forEach(geo => { const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i); p.setZ(i, p.getZ(i) + Math.sin(x * 2.2) * 0.08); } geo.computeVertexNormals(); });
    const bed = mesh(bedGeo, mat('#8a7a62', { roughness: 1 }), g, [0, 0.004, 0.3]); bed.receiveShadow = true; bed.castShadow = false;
    const wm = new THREE.MeshStandardMaterial({ color: '#7fa8b0', roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.85, depthWrite: false });
    const water = mesh(wGeo, wm, g, [0, 0.014, 0.3]); water.castShadow = false; water.renderOrder = 2;
    // 웅덩이 셋
    const pools = [[-0.75, 0.18], [0.1, 0.16], [0.85, 0.15]].map(([x, r]) => { const m = mesh(new THREE.CircleGeometry(r, 24), wm, g, [x, 0.016, 0.3 + Math.sin(x * 2.2) * 0.08]); m.rotation.x = -Math.PI / 2; m.castShadow = false; m.renderOrder = 2; return m; });
    // 물속의 돌: 젖은 빛 → 하얗게 마른다 (공유 재질을 쓰지 않는다 — 빛깔을 바꾸므로)
    const wetC = new THREE.Color('#6e6458'), dryC = new THREE.Color('#e6e0d2');
    const st = new THREE.MeshStandardMaterial({ color: wetC.clone(), roughness: 0.5 });
    for (let i = 0; i < 34; i++) { const x = (i / 33 - 0.5) * L * 0.95, side = i % 2 ? 1 : -1;
      mesh(sphere(0.016 + (i % 4) * 0.006, 8, 6), st, g, [x, 0.012, 0.3 + Math.sin(x * 2.2) * 0.08 + side * (0.05 + (i % 3) * 0.04)], [1.3, 0.6, 1]); }
    // 둑의 풀 몇 포기 (마르면 누레진다)
    const grassC = new THREE.Color('#7a8c4a'), deadC = new THREE.Color('#b8a070'), tm = new THREE.MeshStandardMaterial({ color: grassC.clone(), roughness: 1 });
    for (let i = 0; i < 26; i++) { const x = (i / 25 - 0.5) * L, side = i % 2 ? 1 : -1; mesh(new THREE.ConeGeometry(0.014, 0.07, 4), tm, g, [x, 0.035, 0.3 + Math.sin(x * 2.2) * 0.08 + side * 0.24]); }
    let k = o.state === 'dry' ? 0 : o.state === 'low' ? 0.45 : 1;
    return new Prop(g, (P, t, dt) => {
      k = damp(k, P.state === 'dry' ? 0 : P.state === 'low' ? 0.42 : 1, 1.0, dt);
      water.scale.z = Math.max(0.02, k); water.visible = k > 0.03;
      pools.forEach((m, i) => { m.scale.setScalar(Math.max(0.02, 0.25 + k * 0.75 - i * 0.05 * (1 - k))); m.visible = k > 0.04; });
      wm.opacity = 0.85 * Math.min(1, k * 2.5) * P.show;
      st.color.copy(wetC).lerp(dryC, 1 - k); st.roughness = 0.5 + (1 - k) * 0.5;
      tm.color.copy(grassC).lerp(deadC, 1 - k);
      const p = wGeo.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, Math.sin(p.getX(i) * 12 - t * 4) * 0.002); p.needsUpdate = true;
    }, { state: o.state || 'flow' });
  },

  // 비구름 (왕상 18:44–45): state 'none' | 'hand'(바다 위 낮은 하늘에 사람 손만 한 작은 흰 구름 — o.hx, o.hz 자리) | 'storm'(무대 위 하늘을 덮는 짙은 먹구름).
  // 구름은 공(구)으로 — 스프라이트는 이 무대에서 잘 보이지 않았다(kings/props.js smoke와 같은 까닭)
  stormcloud(o = {}) {
    const g = new THREE.Group(), hx = o.hx ?? -1.9, hz = o.hz ?? -1.0;
    const small = new THREE.Group(); small.position.set(hx, 0.7, hz); g.add(small);
    const sm = new THREE.MeshStandardMaterial({ color: '#f4f2ec', roughness: 1, transparent: true, opacity: 0, depthWrite: false });
    [[0, 0, 0, 0.09], [0.09, -0.015, 0, 0.065], [-0.08, -0.018, 0, 0.06], [0.03, 0.045, 0, 0.06]].forEach(([x, y, z, r]) => mesh(sphere(r, 12, 8), sm, small, [x, y, z], [1.3, 0.8, 1]).castShadow = false);
    const sg = glow(0.7, 0, '#fff4d8'); small.add(sg);
    const big = new THREE.Group(); g.add(big);
    const bm = new THREE.MeshStandardMaterial({ color: '#5a6068', roughness: 1, transparent: true, opacity: 0, depthWrite: false });
    const puffs = Array.from({ length: 22 }, (_, i) => { const a = i * 2.399, r = Math.sqrt((i + 0.5) / 22);
      const m = mesh(sphere(0.32 + (i % 4) * 0.08, 14, 10), bm, big, [hx * 0.2 + Math.cos(a) * r * 2.4, 1.55 + (i % 3) * 0.12, -0.9 + Math.sin(a) * r * 0.8], [1.6, 0.55, 1]); m.castShadow = false; m.userData.x0 = m.position.x; return m; });
    let h = 0, s = 0;
    return new Prop(g, (P, t, dt) => {
      h = damp(h, P.state === 'hand' ? 1 : 0, 1.2, dt); s = damp(s, P.state === 'storm' ? 1 : 0, 0.7, dt);
      sm.opacity = h * 0.95 * P.show; sg.material.opacity = h * 0.5 * P.show;
      small.position.y = 0.7 + Math.sin(t * 0.5) * 0.02; small.visible = h > 0.02;
      bm.opacity = s * 0.82 * P.show; big.visible = s > 0.02;
      puffs.forEach((m, i) => { m.position.x = m.userData.x0 + Math.sin(t * 0.2 + i) * 0.08 + (1 - s) * hx * 0.5; });
    }, { state: o.state || 'none', fade: 'none' });
  },

  // 갈라지는 요단 (왕하 2:8·14) — 공용 river는 앞뒤(z)로 흐르는 물이 조금 물러나기만 해서, 낮게 보는 무대에서는 갈라진 틈이 보이지 않았다.
  // 이 판은 물이 양쪽으로 크게 물러나며 물러난 끝이 높은 물벽(흰 물거품 테)으로 서고, 가운데 마른 바닥(젖은 진흙과 돌)이 드러난다.
  // 강은 앞뒤(z)로 흐르고 사람은 서(-x)에서 동(+x)으로 건넌다. state 'flow' | 'part'. o.w 강폭(기본 0.62), o.len 길이(기본 2.6), o.gap 반쪽 틈(기본 0.42)
  jordan(o = {}) {
    const g = new THREE.Group(), Wd = o.w || 0.62, L = o.len || 2.6, gap = o.gap || 0.42;
    const bed = mesh(new THREE.PlaneGeometry(Wd + 0.12, L), mat('#7e6c50', { roughness: 1 }), g, [0, 0.003, 0]); bed.rotation.x = -Math.PI / 2; bed.receiveShadow = true;
    const mud = mat('#5e4e3a', { roughness: 0.6 });
    for (let i = 0; i < 16; i++) mesh(sphere(0.018 + (i % 3) * 0.008, 8, 6), mud, g, [(i % 4 - 1.5) * Wd * 0.22, 0.008, (Math.floor(i / 4) - 1.5) * gap * 0.45], [1.3, 0.5, 1]);
    const wm = new THREE.MeshStandardMaterial({ color: '#6f98a8', roughness: 0.2, metalness: 0.1, transparent: true, opacity: 0.9, depthWrite: false });
    const foam = new THREE.MeshStandardMaterial({ color: '#eef6f8', roughness: 0.6, transparent: true, opacity: 0.9, depthWrite: false });
    // 반쪽 물: 바깥 끝(±L/2)에 붙어 있고, 안쪽 끝이 물러나며 솟는다. 물벽은 안쪽 끝의 상자(높이가 커진다)
    const halves = [-1, 1].map(k => {
      const h = new THREE.Group(); g.add(h);
      const top = new THREE.PlaneGeometry(Wd, 1, 6, 12); top.rotateX(-Math.PI / 2); top.translate(0, 0, -k * 0.5); // 바깥 끝(z=0)에서 안쪽(-k)으로 길이 1
      const surf = mesh(top, wm, h, [0, 0.03, 0]); surf.castShadow = false; surf.renderOrder = 2;
      const wall = mesh(new THREE.BoxGeometry(Wd, 1, 0.05), wm, h, [0, 0, 0]); wall.castShadow = false; wall.renderOrder = 3;
      const lip = mesh(new THREE.BoxGeometry(Wd + 0.01, 0.018, 0.06), foam, h, [0, 0, 0]); lip.castShadow = false; lip.renderOrder = 4;
      h.position.z = k * L / 2; h.userData = { k, surf, wall, lip, top }; return h; });
    const reed = mat('#8a9a5a', { roughness: 1 });
    for (let i = 0; i < 36; i++) { const side = i % 2 ? 1 : -1, z = (i / 35 - 0.5) * L * 0.95; if (Math.abs(z) < gap + 0.12) continue;
      mesh(new THREE.CylinderGeometry(0.004, 0.006, 0.16 + (i % 3) * 0.05, 4), reed, g, [side * (Wd / 2 + 0.05 + (i % 3) * 0.02), 0.09, z]); }
    let p = o.state === 'part' ? 1 : 0;
    return new Prop(g, (P, t, dt) => {
      p = damp(p, P.state === 'part' ? 1 : 0, 1.4, dt);
      halves.forEach(h => { const { k, surf, wall, lip, top } = h.userData, len = L / 2 - p * gap, wh = 0.03 + p * 0.2;
        surf.scale.z = Math.max(0.01, len); surf.position.y = 0.03 + p * 0.02;
        wall.scale.y = wh; wall.position.set(0, wh / 2, -k * len); lip.position.set(0, wh + 0.004, -k * len); lip.visible = p > 0.15; lip.position.y += Math.sin(t * 6 + k) * 0.004 * p;
        const pos = top.attributes.position; for (let i = 0; i < pos.count; i++) pos.setY(i, Math.sin(pos.getZ(i) * 9 * len + t * 2 + pos.getX(i) * 5) * 0.003); pos.needsUpdate = true; });
      wm.opacity = 0.9 * P.show; foam.opacity = 0.9 * P.show;
    }, { state: o.state || 'flow', fade: 'opacity' });
  },

  // 엘리야의 겉옷 (왕상 19:19 · 왕하 2:8·13): 털 겉옷 한 장. state 'ground'(땅에 펼쳐져 놓였다) | 'fly'(날리며 펄럭인다 — 높이는 대본의 y) | 'rolled'(말아 쥔 막대 모양).
  // 던지는 것·떨어지는 것은 대본에서 x·z·y로 옮긴다 (speed를 주면 그 속도로 날아간다)
  mantle(o = {}) {
    const g = new THREE.Group(), cm = mat(o.color || '#4e3a26', { ...DS, roughness: 1 });
    const geo = new THREE.PlaneGeometry(0.26, 0.2, 8, 6); geo.rotateX(-Math.PI / 2);
    const cloth = mesh(geo, cm, g, [0, 0.006, 0]); cloth.castShadow = true;
    const base = geo.attributes.position.array.slice();
    const roll = mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.24, 8), cm, g, [0, 0.03, 0]); roll.rotation.z = Math.PI / 2; roll.visible = false;
    return new Prop(g, (P, t, dt) => {
      const s = P.state, fly = s === 'fly';
      if (P.y !== undefined) g.position.y = damp(g.position.y, P.y, 2.2, dt);
      cloth.visible = s !== 'rolled'; roll.visible = s === 'rolled';
      const p = geo.attributes.position;
      for (let i = 0; i < p.count; i++) { const x = base[i * 3], z = base[i * 3 + 2];
        p.setY(i, fly ? Math.sin(x * 18 + t * 9) * 0.03 + Math.cos(z * 20 + t * 7) * 0.02 : Math.sin(x * 30 + z * 20) * 0.006); }
      p.needsUpdate = true;
      cloth.rotation.z = fly ? Math.sin(t * 3) * 0.3 : 0;
    }, { state: o.state || 'ground', fade: 'scale' });
  },

  // 멍에와 쟁기를 쪼개 지핀 불 (왕상 19:21): 쪼갠 나무 더미, 그 위에 걸린 질그릇 솥. state 'idle'(나무만) | 'fire'(불이 붙고 솥에서 김이 오른다)
  cookfire(o = {}) {
    const g = new THREE.Group(), dk = mat('#5e4128', { roughness: 1 });
    for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; const b = mesh(new THREE.BoxGeometry(0.2, 0.025, 0.03), dk, g, [Math.cos(a) * 0.04, 0.02 + (i % 2) * 0.02, Math.sin(a) * 0.04]); b.rotation.set(0, a, (i % 2 ? 0.3 : -0.2)); }
    mesh(new THREE.BoxGeometry(0.03, 0.03, 0.26), dk, g, [0.12, 0.03, 0.05]).rotation.y = 0.5; // 쪼갠 멍에 토막
    [-1, 1].forEach(k => mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.3, 5), dk, g, [k * 0.12, 0.15, 0]).rotation.z = -k * 0.25); // 솥을 거는 가지
    mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.3, 5), dk, g, [0, 0.29, 0]).rotation.z = Math.PI / 2;
    mesh(lathe([[0.001, 0], [0.05, 0.005], [0.075, 0.05], [0.07, 0.1], [0.06, 0.11], [0.001, 0.11]], 16), mat('#a85a34', { roughness: 0.85 }), g, [0, 0.15, 0]);
    const fire = new THREE.Group(); fire.position.y = 0.04; g.add(fire);
    const fm = flameM('#ffb347', 0.85), fm2 = flameM('#ff7a30', 0.7);
    const tongues = Array.from({ length: 7 }, (_, i) => { const c = mesh(new THREE.ConeGeometry(0.025, 0.14, 7), i % 2 ? fm : fm2, fire, [Math.cos(i) * 0.04, 0.06, Math.sin(i) * 0.03]); c.castShadow = false; return c; });
    const halo = glow(0.8, 0, '#ffb060'); halo.position.y = 0.08; fire.add(halo);
    const light = new THREE.PointLight('#ffa850', 0, 1.8, 1.4); light.position.y = 0.3; g.add(light);
    const puffs = Array.from({ length: 5 }, () => { const m = mesh(sphere(0.03, 10, 8), new THREE.MeshStandardMaterial({ color: '#e8e4dc', roughness: 1, transparent: true, opacity: 0, depthWrite: false }), g); m.castShadow = false; return m; });
    let f = 0;
    return new Prop(g, (P, t, dt) => {
      f = damp(f, P.state === 'fire' ? 1 : 0, 1.5, dt);
      fire.visible = f > 0.03; tongues.forEach((c, i) => c.scale.set(1, f * (1 + Math.sin(t * 12 + i * 1.7) * 0.35), 1));
      halo.material.opacity = f * 0.8 * P.show; light.intensity = f * 1.8 * P.show * (1 + Math.sin(t * 10) * 0.06);
      puffs.forEach((m, i) => { const u = (t * 0.25 + i / 5) % 1; m.position.set(Math.sin(t + i) * 0.03, 0.27 + u * 0.4, 0); m.scale.setScalar(0.6 + u * 1.6); m.material.opacity = f * (1 - u) * 0.45 * P.show; });
    }, { state: o.state || 'idle' });
  },

  // 마른 나뭇가지 (왕상 17:10 — 사르밧 과부가 줍던 것): 땅에 흩어진 가지 몇 개. show로 줍는다(사라진다)
  sticks(o = {}) {
    const g = new THREE.Group(), dk = mat('#6a5034', { roughness: 1 });
    for (let i = 0; i < 6; i++) { const s = mesh(new THREE.CylinderGeometry(0.005, 0.006, 0.16 + (i % 3) * 0.04, 4), dk, g, [(i - 2.5) * 0.05, 0.008, (i % 2) * 0.05]); s.rotation.set(Math.PI / 2, 0, i * 0.9); }
    return new Prop(g);
  },

  // 뜨거운 돌에 구운 빵과 물 한 병 (왕상 19:6): 머리맡의 달군 돌 몇 개 위의 둥근 빵, 곁의 질그릇 물병. 은은한 빛(하나님이 차리신 상)
  cake(o = {}) {
    const g = new THREE.Group(), st = rockM('#8a7a6a');
    for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; boulder(g, st, 0.03, [Math.cos(a) * 0.05, 0.015, Math.sin(a) * 0.04]); }
    const ember = glow(0.22, 0.5, '#ffa860'); ember.position.y = 0.03; g.add(ember);
    mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.018, 16), mat('#c99858', { roughness: 1 }), g, [0, 0.04, 0]);
    mesh(lathe([[0.001, 0], [0.03, 0], [0.045, 0.045], [0.04, 0.09], [0.018, 0.12], [0.015, 0.14], [0.02, 0.145], [0.001, 0.145]], 14), mat('#b5653e', { roughness: 0.9 }), g, [0.12, 0, 0.02]);
    const shine = glow(0.45, 0, '#fff0c8'); shine.position.set(0.05, 0.08, 0); g.add(shine);
    return new Prop(g, (P, t) => { shine.material.opacity = 0.45 * P.show * (0.8 + Math.sin(t * 2) * 0.2); ember.material.opacity = 0.5 * P.show; });
  },

  // 성문 앞 타작마당의 두 왕좌 (왕상 22:10): 낮은 단 위에 나란히 놓인 두 의자 — 왼쪽은 아합(청록 방석), 오른쪽은 여호사밧(자주 방석).
  // 앉은 왕은 배역 y 0.12, pose 'sit'. 자리는 o.gap(기본 0.36)만큼 벌어진다. 소품 기준 x = ±gap/2, z = -0.04
  twothrones(o = {}) {
    const g = new THREE.Group(), gap = o.gap || 0.36, cedar = mat('#7a4a2a', { roughness: 0.8 }), gold = mat('#d6a93a', { metalness: 0.5, roughness: 0.4 });
    mesh(new THREE.BoxGeometry(gap + 0.4, 0.05, 0.36), mat('#cbbd9e', { roughness: 1 }), g, [0, 0.025, -0.06]).receiveShadow = true;
    [['#2a5a5e', -1], ['#5a2a5e', 1]].forEach(([c, k]) => { const x = k * gap / 2;
      mesh(new THREE.BoxGeometry(0.2, 0.1, 0.17), cedar, g, [x, 0.1, -0.08]);
      mesh(new THREE.BoxGeometry(0.2, 0.02, 0.17), mat(c, { roughness: 0.9 }), g, [x, 0.16, -0.08]);
      mesh(new THREE.BoxGeometry(0.22, 0.34, 0.03), cedar, g, [x, 0.24, -0.18]);
      mesh(new THREE.BoxGeometry(0.24, 0.025, 0.04), gold, g, [x, 0.42, -0.18]); });
    const P = new Prop(g);
    P.heightAt = (x, z) => { const u = (x - g.position.x) / g.scale.x, v = (z - g.position.z) / g.scale.z; return Math.abs(u) < gap / 2 + 0.2 && v > -0.24 && v < 0.12 ? 0.05 * g.scale.y : 0; };
    return P;
  },

  // 떨어진 왕관 (왕상 22:35–37 — 아합의 죽음은 그리지 않는다): 빈 땅에 비스듬히 누운 금관 하나, 어둠 속에 희미하게 빛난다
  fallencrown(o = {}) {
    const g = new THREE.Group(), gold = mat('#d6a93a', { metalness: 0.5, roughness: 0.4 });
    const c = new THREE.Group(); c.rotation.set(1.2, 0.4, 0.2); c.position.y = 0.04; g.add(c);
    mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.035, 16, 1, true), mat('#d6a93a', { metalness: 0.5, roughness: 0.4, side: THREE.DoubleSide }), c);
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; mesh(new THREE.ConeGeometry(0.01, 0.03, 4), gold, c, [Math.cos(a) * 0.05, 0.03, Math.sin(a) * 0.05]); }
    const gl = glow(0.3, 0, '#ffe0a0'); gl.position.y = 0.05; g.add(gl);
    return new Prop(g, (P, t) => { gl.material.opacity = 0.4 * P.show * (0.8 + Math.sin(t * 1.5) * 0.2); });
  },
});

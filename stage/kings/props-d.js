/* 열왕기 여정 묶음 d(k32–k41)에만 쓰는 소품: props.js의 MAKERS에 더한다 (stage/kings.js가 불러온다).
   크기는 사람 키(약 0.88)와의 비례로. 무대 x는 오른쪽(+, 동쪽), z는 앞(+, 화면 아래).
   죽음과 폭력은 그리지 않는다 — 앗수르 진영은 불이 꺼지고 사람이 사라지는 것으로, 사슬은 손목의 띠로만 */
import { THREE, mat, DS, lathe, mesh, sphere, glowTexture, damp } from '../kit.js';
import { MAKERS, Prop } from '../props.js';

const wood = () => mat('#7a5634', { roughness: 0.95 });
const rockM = (c = '#a8977c') => mat(c, { roughness: 1, flatShading: true });
const glow = (size, opacity = 1, color) => {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity, ...(color ? { color } : {}) }));
  s.scale.set(size, size, 1);
  return s;
};
const flameM = (c = '#ffb347', o = 0.85) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, depthWrite: false, blending: THREE.AdditiveBlending });
const now = () => performance.now() / 1000;

Object.assign(MAKERS, {
  // 아세라 목상과 돌기둥 (왕하 18:4 — 히스기야가 산당을 헐고 돌기둥을 깨뜨리고 아세라 목상을 찍었다).
  // o.kind 'pole'(새김 머리의 나무 기둥 — 찍히면 o.dir 쪽(기본 +x)으로 넘어간다) | 'stone'(세운 돌 — 깨지면 윗동이 기울어 떨어지고 조각이 흩어진다).
  // state 'stand' | 'down'
  asherah(o = {}) {
    const g = new THREE.Group(), dir = o.dir || 1, top = new THREE.Group(); g.add(top);
    const base = mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.05, 9), rockM('#a89a82'), g, [0, 0.025, 0]); base.receiveShadow = true;
    const chips = [];
    if (o.kind === 'stone') {
      // 돌기둥: 아랫동은 남고 윗동이 넘어간다
      const st = rockM('#9a8c78');
      mesh(new THREE.BoxGeometry(0.14, 0.3, 0.1), st, g, [0, 0.2, 0]);
      top.position.set(dir * 0.07, 0.35, 0);
      mesh(new THREE.BoxGeometry(0.13, 0.3, 0.095), st, top, [-dir * 0.07, 0.15, 0]);
      mesh(new THREE.DodecahedronGeometry(0.07, 0), st, top, [-dir * 0.07, 0.3, 0], [1, 0.5, 0.75]);
      for (let i = 0; i < 6; i++) { const c = mesh(new THREE.DodecahedronGeometry(0.025 + (i % 3) * 0.008, 0), st, g, [dir * (0.12 + (i % 3) * 0.07), 0.02, (i - 2.5) * 0.05]); c.visible = false; chips.push(c); }
    } else {
      // 나무 목상: 굵은 기둥 꼭대기에 새긴 머리와 두 팔 같은 가지 (사람 모양의 우상 — 얼굴은 새기지 않는다)
      const w = mat('#6a4a2e', { roughness: 0.9 });
      top.position.set(dir * 0.04, 0.05, 0);
      mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.78, 8), w, top, [-dir * 0.04, 0.39, 0]);
      mesh(sphere(0.055, 10, 8), w, top, [-dir * 0.04, 0.82, 0], [1, 1.25, 1]);
      [-1, 1].forEach(k => { const a = mesh(new THREE.CylinderGeometry(0.012, 0.015, 0.16, 6), w, top, [-dir * 0.04 + k * 0.06, 0.66, 0]); a.rotation.z = -k * 0.9; });
      mesh(new THREE.TorusGeometry(0.04, 0.008, 6, 16), mat('#a8312a'), top, [-dir * 0.04, 0.6, 0]).rotation.x = Math.PI / 2; // 감은 붉은 천
      for (let i = 0; i < 5; i++) { const c = mesh(new THREE.BoxGeometry(0.03, 0.01, 0.02), mat('#c9a878'), g, [dir * (0.06 + i * 0.03), 0.006, (i % 2 - 0.5) * 0.08]); c.rotation.y = i; c.visible = false; chips.push(c); } // 나뭇조각
    }
    let k = 0;
    return new Prop(g, (P, t, dt) => {
      k = damp(k, P.state === 'down' ? 1 : 0, 2.2, dt);
      top.rotation.z = -dir * k * (o.kind === 'stone' ? 1.35 : 1.5);
      if (o.kind === 'stone') top.position.y = 0.35 - k * 0.27;
      chips.forEach(c => { c.visible = k > 0.4; });
    }, { state: o.state || 'stand' });
  },

  // 진영의 모닥불 (왕하 19:35 — 앗수르 진영의 밤): o.spots [[x, z], …]마다 돌을 두른 불과 장작, 번지는 빛.
  // state 'lit' | 'out'(왼쪽(-x)부터 차례로 꺼져 재만 남는다 — 여호와의 사자가 지나간 자리. o.sweep: 1만큼 x를 지나는 데 걸리는 초)
  campfires(o = {}) {
    const g = new THREE.Group(), spots = o.spots || [[0, 0]], x0 = Math.min(...spots.map(s => s[0])), sweep = o.sweep ?? 3;
    const fires = spots.map(([x, z]) => {
      const f = new THREE.Group(); f.position.set(x, 0, z); g.add(f);
      for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; mesh(new THREE.DodecahedronGeometry(0.018, 0), rockM('#6a625a'), f, [Math.cos(a) * 0.06, 0.012, Math.sin(a) * 0.06]); }
      [0.6, -0.6].forEach(r => { const l = mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.1, 6), mat('#4a3420'), f, [0, 0.015, 0]); l.rotation.set(Math.PI / 2, r, 0); });
      const ash = mesh(new THREE.CircleGeometry(0.045, 12), mat('#3a3632', { roughness: 1 }), f, [0, 0.004, 0]); ash.rotation.x = -Math.PI / 2;
      const fl = new THREE.Group(); f.add(fl);
      const fm = flameM('#ffb347', 0.9);
      for (let i = 0; i < 4; i++) { const c = mesh(new THREE.ConeGeometry(0.018, 0.07 + (i % 2) * 0.03, 7), fm, fl, [Math.cos(i * 1.7) * 0.015, 0.05, Math.sin(i * 1.7) * 0.015]); c.castShadow = false; }
      const h = glow(0.42, 0.85, '#ffb070'); h.position.y = 0.06; f.add(h);
      return { f, fl, fm, h, x, k: 1 };
    });
    const light = new THREE.PointLight('#ff9a50', 0, 3.2, 1.3); light.position.set((x0 + Math.max(...spots.map(s => s[0]))) / 2, 0.5, 0); g.add(light);
    return new Prop(g, (P, t, dt) => {
      const out = P.state === 'out', since = now() - P.t0;
      let sum = 0;
      fires.forEach((F, i) => {
        const goOut = out && (P.t0 === 0 || since > (F.x - x0) * sweep + 0.3);
        F.k = damp(F.k, goOut ? 0 : 1, goOut ? 1.6 : 2, dt);
        const fl = F.k * P.show * (0.85 + Math.sin(t * 9 + i * 2) * 0.12);
        F.fl.scale.set(1, Math.max(0.01, fl), 1); F.fl.visible = F.k > 0.03; F.fm.opacity = 0.9 * F.k;
        F.h.material.opacity = 0.85 * fl; sum += F.k;
      });
      light.intensity = 2.2 * P.show * sum / fires.length;
    }, { state: o.state || 'lit', fade: 'none' });
  },

  // 놋사슬 (왕하 25:7 — 시드기야를 놋사슬로 묶어 끌고 갔다): 손목 높이에 감긴 사슬 띠와 늘어진 고리. 대본에서 on: '배역'으로 그 사람을 따른다.
  // o.y 띠 높이(기본 0.44)
  fetters(o = {}) {
    // 어두운 밤 장면이라 금속감을 낮추고 밝은 놋빛으로 (금속감이 세면 환경빛 없는 무대에서 검게 보인다)
    const g = new THREE.Group(), br = new THREE.MeshStandardMaterial({ color: '#d0a050', emissive: '#5a3a10', emissiveIntensity: 0.5, metalness: 0.2, roughness: 0.5 }), y = o.y ?? 0.46;
    for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2, l = mesh(new THREE.TorusGeometry(0.018, 0.006, 5, 10), br, g, [Math.cos(a) * 0.13, y, Math.sin(a) * 0.12]); l.rotation.set(Math.PI / 2 * (i % 2), -a, 0); l.castShadow = false; }
    for (let i = 0; i < 7; i++) { const l = mesh(new THREE.TorusGeometry(0.016, 0.006, 5, 10), br, g, [0.0, y - 0.035 - i * 0.03, 0.125]); l.rotation.y = (i % 2) * Math.PI / 2; l.castShadow = false; }
    return new Prop(g, null, { fade: 'scale' });
  },

  // 히스기야의 보물 창고 (왕하 20:13): 뒷벽에 기댄 세 칸 시렁 — 기름·향품 항아리, 금·은 그릇, 금덩이 — 과 오른쪽의 무기 시렁(창과 방패).
  // o.w 너비(기본 1.4). 앞(+z)이 트였다
  vault(o = {}) {
    const g = new THREE.Group(), W = o.w || 1.4, cedar = mat('#6a4428', { roughness: 0.85 });
    const gold = mat('#d6a93a', { metalness: 0.6, roughness: 0.35 }), silver = mat('#cfd2d4', { metalness: 0.6, roughness: 0.3 }), clay = mat('#b0703e', { roughness: 0.9 });
    const sw = W * 0.72; // 시렁 너비 (나머지는 무기 시렁)
    const sx = -W / 2 + sw / 2;
    [-1, 1].forEach(k => mesh(new THREE.BoxGeometry(0.04, 0.72, 0.2), cedar, g, [sx + k * sw / 2, 0.36, 0]));
    for (let f = 0; f < 3; f++) {
      const y = 0.06 + f * 0.24;
      mesh(new THREE.BoxGeometry(sw, 0.025, 0.2), cedar, g, [sx, y, 0]).receiveShadow = true;
      const n = Math.floor(sw / 0.12);
      for (let i = 0; i < n; i++) {
        const x = sx - sw / 2 + 0.08 + i * (sw - 0.16) / (n - 1), kind = (i + f * 2) % 4;
        if (kind === 0) mesh(lathe([[0.001, 0], [0.03, 0], [0.045, 0.06], [0.035, 0.12], [0.015, 0.14], [0.018, 0.16], [0.001, 0.16]], 12), clay, g, [x, y + 0.012, 0]); // 기름 항아리
        else if (kind === 1) mesh(new THREE.CylinderGeometry(0.05, 0.03, 0.05, 14), gold, g, [x, y + 0.037, 0.02]); // 금 대접
        else if (kind === 2) mesh(lathe([[0.001, 0], [0.025, 0], [0.035, 0.05], [0.02, 0.1], [0.025, 0.12], [0.001, 0.12]], 12), silver, g, [x, y + 0.012, 0]); // 은 병
        else { for (let j = 0; j < 3; j++) mesh(new THREE.BoxGeometry(0.06, 0.02, 0.03), gold, g, [x, y + 0.022 + j * 0.02, (j % 2) * 0.02 - 0.01]); } // 금덩이
      }
    }
    // 무기 시렁: 세운 창 다섯, 걸어 둔 둥근 방패 둘 (20:13 '무기고')
    const rx = W / 2 - (W - sw) / 2;
    mesh(new THREE.BoxGeometry(W - sw - 0.04, 0.03, 0.12), cedar, g, [rx, 0.5, -0.04]);
    for (let i = 0; i < 5; i++) { const x = rx - (W - sw) / 2 + 0.06 + i * (W - sw - 0.12) / 4;
      mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.78, 5), wood(), g, [x, 0.39, -0.02]);
      mesh(new THREE.ConeGeometry(0.014, 0.06, 6), mat('#8a8a88', { metalness: 0.5, roughness: 0.4 }), g, [x, 0.81, -0.02]); }
    [-1, 1].forEach(k => { const s = mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.012, 20), mat('#a8703a', { metalness: 0.5, roughness: 0.45 }), g, [rx + k * 0.07, 0.3, 0.05]); s.rotation.x = Math.PI / 2 - 0.2; });
    return new Prop(g);
  },

  // 바벨론의 감옥 (왕하 25:27): 어두운 돌방 — 뒷벽과 옆벽, 지붕 없이(위에서 들여다보인다), 앞에 나무 창살 문(왼쪽 경첩).
  // state 'shut' | 'open'(창살 문이 열린다). 안의 사람은 소품 자리에 선다
  prison(o = {}) {
    const g = new THREE.Group(), st = mat('#6e665a', { roughness: 1 }), W = 0.7, D = 0.5, H = 0.62;
    mesh(new THREE.BoxGeometry(W, 0.012, D), mat('#4a443c', { roughness: 1 }), g, [0, 0.006, 0]).receiveShadow = true;
    mesh(new THREE.BoxGeometry(W + 0.08, H, 0.06), st, g, [0, H / 2, -D / 2]).receiveShadow = true;
    [-1, 1].forEach(k => mesh(new THREE.BoxGeometry(0.06, H, D), st, g, [k * (W / 2 + 0.01), H / 2, 0]).receiveShadow = true);
    mesh(new THREE.BoxGeometry(0.1, 0.06, 0.02), mat('#d8c8a0', { emissive: '#a89060', emissiveIntensity: 0.4 }), g, [0.12, H - 0.1, -D / 2 + 0.035]); // 높은 틈창 (빛)
    mesh(new THREE.BoxGeometry(0.2, 0.02, 0.12), mat('#8a7a58', { roughness: 1 }), g, [-0.18, 0.012, -0.12]); // 짚 깔개
    const door = new THREE.Group(); door.position.set(-W / 2 + 0.02, 0, D / 2); g.add(door);
    const bar = mat('#4a3420', { roughness: 0.9 });
    for (let i = 0; i < 7; i++) mesh(new THREE.CylinderGeometry(0.009, 0.009, H, 6), bar, door, [0.04 + i * (W - 0.08) / 6, H / 2, 0]);
    [0.08, H - 0.06].forEach(y => mesh(new THREE.BoxGeometry(W - 0.04, 0.025, 0.02), bar, door, [(W - 0.04) / 2, y, 0]));
    return new Prop(g, (P, t, dt) => { door.rotation.y = damp(door.rotation.y, P.state === 'open' ? 1.75 : 0, 1.2, dt); }, { state: o.state || 'shut' });
  },

  // 바벨론의 계단 탑 (지구라트 — 에테메난키): 흙벽돌 네 층, 맨 위에 청금석빛 유약 벽돌의 신전, 앞의 긴 계단. 먼 배경으로 크게
  ziggurat(o = {}) {
    const g = new THREE.Group(), brick = mat('#c9a87a', { roughness: 1 }), dark = mat('#a88a5e', { roughness: 1 });
    [[1.3, 0.28], [1.0, 0.24], [0.72, 0.22], [0.48, 0.2]].reduce((y, [w, h], i) => {
      const m = mesh(new THREE.BoxGeometry(w, h, w * 0.8), i % 2 ? dark : brick, g, [0, y + h / 2, 0]); m.receiveShadow = true; return y + h; }, 0);
    mesh(new THREE.BoxGeometry(0.3, 0.16, 0.24), mat('#2f5a9a', { roughness: 0.5 }), g, [0, 0.94 + 0.08, 0]);
    mesh(new THREE.BoxGeometry(0.32, 0.02, 0.26), mat('#d6a93a', { metalness: 0.4, roughness: 0.4 }), g, [0, 0.94 + 0.17, 0]);
    const ramp = mesh(new THREE.BoxGeometry(0.16, 0.04, 0.8), brick, g, [0, 0.27, 0.72]); ramp.rotation.x = 0.68; // 앞 계단
    return new Prop(g);
  },

  // 아하스의 해시계 계단 (왕하 20:9–11) — sundial의 고친 판: 그림자가 층계 하나에 띠로 놓이면 잘 보이지 않아,
  // 윗방(해를 가리는 집)의 그림자가 맨 위 층계부터 o.n층 아래까지 덮고, 그 끝(그림자 경계)이 층계를 오르내리게 했다.
  // state 'fwd'(그림자가 거의 맨 아래 층계까지 내려와 있다) | 'back'(열 층계 뒤로 — 위로 — 천천히 물러간다, 빛이 번진다). 계단은 앞(+z)에서 뒤로 오른다
  shadowstair(o = {}) {
    const g = new THREE.Group(), st = mat('#e8dcc0', { roughness: 0.95 }), n = 12, D = 0.07, R = 0.045;
    const shades = [];
    for (let i = 0; i < n; i++) {
      const z = 0.4 - i * D, h = R * (i + 1);
      mesh(new THREE.BoxGeometry(0.6, h, D), st, g, [0, h / 2, z]).receiveShadow = true;
      const sm = new THREE.MeshBasicMaterial({ color: '#1a1424', transparent: true, opacity: 0, depthWrite: false });
      const tread = mesh(new THREE.PlaneGeometry(0.6, D), sm, g, [0, h + 0.002, z]); tread.rotation.x = -Math.PI / 2; tread.castShadow = false;
      const riser = mesh(new THREE.PlaneGeometry(0.6, R), sm, g, [0, h - R / 2, z + D / 2 + 0.002]); riser.castShadow = false;
      shades.push(sm);
    }
    const top = 0.4 - n * D;
    mesh(new THREE.BoxGeometry(0.7, 0.75, 0.3), st, g, [0, 0.375, top - 0.12]).receiveShadow = true; // 윗방
    mesh(new THREE.BoxGeometry(0.74, 0.04, 0.34), mat('#a98f68'), g, [0, 0.77, top - 0.12]);
    mesh(new THREE.BoxGeometry(0.16, 0.28, 0.02), mat('#2a1c10'), g, [0, 0.68, top + 0.035]);
    [-1, 1].forEach(k => mesh(new THREE.BoxGeometry(0.03, 0.06 + R * n, 0.05), st, g, [k * 0.315, 0.03 + R * n / 2, 0.4 - (n - 1) * D / 2], [1, 1, n * 1.05])); // 난간
    const halo = glow(1.8, 0, '#fff0c8'); halo.position.set(-0.25, 1.05, -0.3); g.add(halo);
    let edge = o.state === 'back' ? 10.5 : 1.5; // 그림자가 덮는 맨 아래 층계 번호 (0이 맨 앞·아래)
    return new Prop(g, (P, t, dt) => {
      const back = P.state === 'back';
      edge = damp(edge, back ? 10.6 : 1.5, back ? 0.45 : 3, dt);
      shades.forEach((m, i) => { m.opacity = THREE.MathUtils.clamp(i + 1 - edge, 0, 1) * 0.62 * P.show; });
      const since = now() - P.t0;
      halo.material.opacity = back ? Math.min(1, since * 0.35) * 0.65 * P.show * (0.9 + Math.sin(t * 1.4) * 0.1) : 0;
    }, { state: o.state || 'fwd' });
  },
  // 바벨론 강가의 버드나무 (시 137:2) — willow의 고친 판: 세운 잎 판이 갈대처럼 보여, 둥근 잎 덩이에서 실가지가 물가로 휘어 늘어지게 했다.
  // o.lyres면 앞쪽 낮은 가지에 건 수금 셋 (가지 끝에 걸려 흔들린다)
  willowD(o = {}) {
    const g = new THREE.Group(), bark = mat('#6a5a46', { roughness: 1 }), leaf = mat('#9aa866', { roughness: 0.9 }), leaf2 = mat('#86955a', { roughness: 0.9 });
    const trunk = mesh(new THREE.CylinderGeometry(0.035, 0.06, 0.62, 8), bark, g, [0, 0.31, 0]); trunk.rotation.z = 0.1;
    [[-0.18, 0.62, 0.05], [0.16, 0.66, -0.04], [0.02, 0.7, 0.12]].forEach(([x, y, z]) => { const c = mesh(new THREE.CylinderGeometry(0.012, 0.022, 0.3, 6), bark, g, [x * 0.55, y - 0.06, z * 0.5]); c.rotation.z = -x * 3; c.rotation.x = z * 2; });
    [[0, 0.82, 0, 0.3], [-0.2, 0.74, 0.05, 0.22], [0.2, 0.76, -0.03, 0.22], [0.02, 0.76, 0.18, 0.2]].forEach(([x, y, z, r], i) => mesh(sphere(r, 14, 10), i % 2 ? leaf2 : leaf, g, [x, y, z], [1.15, 0.55, 1]).castShadow = true);
    // 늘어진 실가지: 잎 덩이 가장자리에서 아래로 휘어 내려온다
    const strands = new THREE.Group(); g.add(strands);
    for (let i = 0; i < 34; i++) {
      const a = i * 2.399, r = 0.26 + (i % 4) * 0.04, x = Math.cos(a) * r, z = Math.sin(a) * r * 0.85, top = 0.72 + (i % 3) * 0.04, L = 0.32 + (i % 5) * 0.06;
      const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(x * 0.8, top, z * 0.8), new THREE.Vector3(x * 1.08, top - L * 0.3, z * 1.08), new THREE.Vector3(x * 1.12, top - L, z * 1.12));
      const m = mesh(new THREE.TubeGeometry(curve, 6, 0.006, 4), i % 2 ? leaf : leaf2, strands); m.castShadow = false;
    }
    const lyres = [];
    if (o.lyres) [[-0.24, 0.5, 0.2], [0.2, 0.52, 0.2], [0.0, 0.46, 0.3]].forEach(([x, y, z], i) => {
      const l = new THREE.Group(); l.position.set(x, y, z); l.rotation.z = (i - 1) * 0.2; g.add(l); lyres.push(l);
      const lw = mat('#8a5a2e', { roughness: 0.7 });
      mesh(new THREE.CylinderGeometry(0.002, 0.002, 0.07, 4), mat('#3a2a1a'), l, [0, 0.11, 0]); // 건 끈
      mesh(new THREE.BoxGeometry(0.1, 0.05, 0.025), lw, l, [0, -0.06, 0]);
      [-1, 1].forEach(k => { const a = mesh(new THREE.BoxGeometry(0.012, 0.15, 0.014), lw, l, [k * 0.04, 0.02, 0]); a.rotation.z = -k * 0.14; });
      mesh(new THREE.BoxGeometry(0.13, 0.012, 0.016), lw, l, [0, 0.095, 0]);
      for (let k = 0; k < 4; k++) mesh(new THREE.CylinderGeometry(0.0015, 0.0015, 0.13, 3), mat('#e8dcb0'), l, [-0.03 + k * 0.02, 0.015, 0.008]);
    });
    return new Prop(g, (P, t) => { strands.rotation.y = Math.sin(t * 0.4) * 0.03; lyres.forEach((l, i) => { l.rotation.z = (i - 1) * 0.2 + Math.sin(t * 0.8 + i) * 0.04; }); });
  },
});


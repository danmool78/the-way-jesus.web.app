/* 열왕기 여정 묶음 c(k23–k31)에만 쓰는 소품과 인물 — props.js의 MAKERS, people.js의 TYPES에 더한다 (공용 파일을 키우지 않게).
   크기는 사람 키(약 0.88)와의 비례로. 무대 x는 오른쪽(+, 동쪽), z는 앞(+, 화면 아래).
   죽음과 폭력은 그리지 않는다 — 사로잡혀 가는 행렬은 손목을 이은 사슬로만, 매질이나 쓰러진 사람 없이 */
import { THREE, mat, DS, mesh, sphere, glowTexture, damp } from '../kit.js';
import { MAKERS, Prop } from '../props.js';
import { TYPES } from '../people.js';

Object.assign(TYPES, {
  // 성전에 숨어 자란 아이 요아스 (왕하 11:3): 왕관을 쓰기 전 — 흰 옷 (관을 씌울 때 joashboy로 바꿔 낀다)
  joashY:   { robe: '#f1e7cf', trim: '#d6a93a', hair: '#3a2616', sash: '#d6a93a', skin: 2, height: 0.66, kid: true },
  // 나아만의 아내 (왕하 5:2): 아람의 올리브빛 옷에 황토 베일
  arameanW: { robe: '#7a6a2e', trim: '#d6a93a', mantle: '#c9a86a', veil: true, inner: '#f6efe2', skin: 3, soft: true, slim: true, sash: '#d6a93a' },
  // 수넴 여인의 늙은 남편 (왕하 4:14): 흰 머리의 농부
  shunamhus: { robe: '#8a7350', trim: '#5b4630', mantle: '#6a5a46', hair: '#d9d4c8', beard: true, long: true, hood: '#d8c9a6', band: '#5b4630', sash: '#5b4630', skin: 1, height: 0.94 },
  // 아람 왕 (왕하 6:8): 아람의 올리브 옷에 붉은 겉옷, 금관 — 나아만과 같은 결
  aramK:    { robe: '#7a6a2e', trim: '#d6a93a', mantle: '#9d3328', hair: '#1d140c', beard: true, crown: true, sash: '#d6a93a', skin: 3, height: 0.98 },
  // 북이스라엘 궁의 내시 (왕하 9:32): 수염 없는 청록 옷
  eunuch:   { robe: '#e3d6b8', trim: '#2a5a5e', mantle: '#2a5a5e', hair: '#1d140c', sash: '#2a5a5e', skin: 2, height: 0.94 },
});

const wood = () => mat('#7a5634', { roughness: 0.95 });
const glow = (size, opacity = 1, color) => {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity, ...(color ? { color } : {}) }));
  s.scale.set(size, size, 1);
  return s;
};
const puffM = c => new THREE.MeshStandardMaterial({ color: c, roughness: 1, transparent: true, opacity: 0, depthWrite: false });

Object.assign(MAKERS, {
  // 땅을 치는 화살 다발 (왕하 13:18): 촉을 아래로 모아 쥔 화살 셋. 무릎 꿇은 왕의 손 앞에 둔다.
  // state 'held'(들고 있다) | 'strike'(세 번 땅을 치고 멈춘다 — 칠 때마다 흙먼지) | 'down'(땅에 내려놓았다)
  strike(o = {}) {
    const g = new THREE.Group(), bundle = new THREE.Group(); g.add(bundle);
    const shaft = mat('#a8875a'), tip = mat('#9a9a92', { metalness: 0.5, roughness: 0.45 }), fl = mat('#efe6cf', DS);
    [-1, 0, 1].forEach(k => { const a = new THREE.Group(); a.position.set(k * 0.012, 0, k * 0.01); a.rotation.z = k * 0.06; bundle.add(a);
      mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.34, 6), shaft, a, [0, 0.17, 0]);
      mesh(new THREE.ConeGeometry(0.009, 0.03, 8), tip, a, [0, -0.012, 0]).rotation.z = Math.PI; // 촉이 아래
      [-1, 1].forEach(s => mesh(new THREE.BoxGeometry(0.016, 0.05, 0.002), fl, a, [s * 0.006, 0.31, 0]).rotation.y = s * 0.6); });
    const N = 3, PER = 1.1;
    const dust = Array.from({ length: 4 }, () => { const d = mesh(sphere(0.04, 10, 8), puffM('#b8a582'), g); d.castShadow = false; return d; });
    return new Prop(g, (P, t, dt) => {
      const s = P.state, el = performance.now() / 1000 - P.t0;
      let y = 0.3, hit = -1;
      if (s === 'strike' && el < N * PER) { const u = (el % PER) / PER; y = 0.02 + 0.28 * Math.abs(Math.cos(u * Math.PI)); hit = (u > 0.5 ? u - 0.5 : u + 0.5); }
      else if (s === 'strike') y = 0.24; // 세 번 치고 멈춘 손
      else if (s === 'down') y = 0.0;
      bundle.position.y = s === 'strike' && el < N * PER ? y : damp(bundle.position.y, y, 4, dt);
      bundle.rotation.z = s === 'down' ? damp(bundle.rotation.z, Math.PI / 2, 4, dt) : damp(bundle.rotation.z, 0, 6, dt);
      dust.forEach((d, i) => { const k = hit >= 0 && el < N * PER + 0.4 ? Math.max(0, 1 - hit * 2.2) : 0;
        d.position.set(Math.cos(i * 1.6) * (0.03 + hit * 0.1), 0.02 + hit * 0.04, Math.sin(i * 1.6) * (0.03 + hit * 0.08)); d.scale.setScalar(0.6 + hit * 1.6);
        d.material.opacity = k * 0.5 * P.show; d.visible = d.material.opacity > 0.01; });
    }, { state: o.state || 'held', fade: 'none' });
  },

  // 동쪽 창이 난 옆벽 (왕하 13:17): 앞뒤(z)로 놓인 회벽에 창 하나와 나무 덧문. 창은 ±x 쪽으로 난다 (o.side 1이면 +x — 동쪽).
  // state 'shut' | 'open'(덧문이 바깥으로 열리고 아침빛이 든다). o.d 벽 길이, o.h 벽 높이
  kwindow(o = {}) {
    const g = new THREE.Group(), D = o.d || 1.3, Hh = o.h || 1.05, T = 0.08, side = o.side || 1;
    const plaster = mat(o.wall || '#e2d6bc', { roughness: 1 }), cedar = mat('#7a4a2a', { roughness: 0.8 });
    const WY0 = 0.42, WY1 = 0.74, WZ = o.wz ?? 0, WW = 0.34; // 창의 아래·위 높이, 가운데 z, 너비
    const box = (y0, y1, z0, z1) => mesh(new THREE.BoxGeometry(T, y1 - y0, z1 - z0), plaster, g, [0, (y0 + y1) / 2, (z0 + z1) / 2]).receiveShadow = true;
    box(0, WY0, -D / 2, D / 2); box(WY1, Hh, -D / 2, D / 2);
    box(WY0, WY1, -D / 2, WZ - WW / 2); box(WY0, WY1, WZ + WW / 2, D / 2);
    mesh(new THREE.BoxGeometry(T + 0.04, 0.03, WW + 0.06), cedar, g, [0, WY0 - 0.01, WZ]); // 창턱
    mesh(new THREE.BoxGeometry(T + 0.04, 0.03, WW + 0.06), cedar, g, [0, WY1 + 0.01, WZ]);
    mesh(new THREE.BoxGeometry(T + 0.02, 0.06, D), cedar, g, [0, Hh + 0.01, 0]);
    // 덧문: 창 앞쪽(+z) 가장자리에 경첩 — 바깥(side 쪽)으로 열린다
    const hinge = new THREE.Group(); hinge.position.set(side * (T / 2 + 0.01), (WY0 + WY1) / 2, WZ + WW / 2); g.add(hinge);
    mesh(new THREE.BoxGeometry(0.02, WY1 - WY0, WW), wood(), hinge, [0, 0, -WW / 2]);
    for (let i = 0; i < 3; i++) mesh(new THREE.BoxGeometry(0.024, 0.012, WW - 0.02), mat('#5e4128'), hinge, [0, (i - 1) * 0.1, -WW / 2]);
    const sun = glow(0.9, 0, '#fff0c8'); sun.position.set(side * 0.02, (WY0 + WY1) / 2, WZ); g.add(sun);
    const light = new THREE.PointLight('#fff0d0', 0, 2.4, 1.3); light.position.set(-side * 0.3, (WY0 + WY1) / 2 + 0.1, WZ); g.add(light);
    let k = o.state === 'open' ? 1 : 0;
    return new Prop(g, (P, t, dt) => {
      k = damp(k, P.state === 'open' ? 1 : 0, 2, dt);
      hinge.rotation.y = side * k * 1.75; // 바깥으로 젖혀진다
      sun.material.opacity = k * 0.55 * P.show; light.intensity = k * 1.2 * P.show;
    }, { state: o.state || 'shut' });
  },

  // 사로잡혀 가는 사람들의 사슬 (왕하 17:6): 앞(+x) 사람부터 o.gap 간격으로 o.n 사람의 손목(높이 o.y)을 잇는 쇠사슬과 손목 고리.
  // 걸어가는 사람들과 같은 speed로 같은 만큼 옮긴다 — 소품은 가는 쪽으로 돌므로 행렬은 x 방향으로만 걷게 한다
  chain(o = {}) {
    const g = new THREE.Group(), n = o.n || 4, gap = o.gap || 0.32, Y = o.y ?? 0.4, iron = mat('#3e3a36', { metalness: 0.4, roughness: 0.55 });
    const pts = [];
    for (let i = 0; i < n; i++) {
      const x = -i * gap;
      pts.push(new THREE.Vector3(x, Y, 0));
      if (i < n - 1) pts.push(new THREE.Vector3(x - gap / 2, Y - 0.1, 0)); // 사이에서 처진다
      mesh(new THREE.TorusGeometry(0.03, 0.007, 6, 14), iron, g, [x, Y, 0]).rotation.y = Math.PI / 2; // 손목 고리
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    mesh(new THREE.TubeGeometry(curve, n * 16, 0.0055, 6), iron, g).castShadow = true;
    // 고리 마디 (사슬로 보이게 — 매끈한 줄은 밧줄 같았다)
    const L = curve.getLength(), cnt = Math.round(L / 0.03);
    for (let i = 0; i < cnt; i++) { const p = curve.getPointAt(i / cnt); const r = mesh(new THREE.TorusGeometry(0.011, 0.003, 4, 8), iron, g, [p.x, p.y, p.z]); r.rotation.set(0, i % 2 ? 0 : Math.PI / 2, 0); r.castShadow = false; }
    return new Prop(g, null, { fade: 'opacity' });
  },

  // 눈이 어두워짐 (왕하 6:18): 무리 머리 높이에 낮게 깔리는 잿빛 안개. o.w·o.d 넓이. state 'on' | 'off'
  haze(o = {}) {
    const g = new THREE.Group(), W = o.w || 1.4, Dd = o.d || 0.6, n = 18;
    const puffs = Array.from({ length: n }, (_, i) => { const m = mesh(sphere(0.16 + (i % 3) * 0.05, 14, 10), puffM('#4a4652'), g); m.castShadow = false;
      m.userData = { x: ((i * 0.618) % 1 - 0.5) * W, z: ((i * 0.381) % 1 - 0.5) * Dd, y: 0.62 + (i % 4) * 0.06, s: i }; return m; });
    let k = 0;
    return new Prop(g, (P, t, dt) => {
      k = damp(k, P.state === 'on' ? 1 : 0, 0.8, dt);
      puffs.forEach(p => { const u = p.userData; p.position.set(u.x + Math.sin(t * 0.5 + u.s) * 0.06, u.y + Math.sin(t * 0.8 + u.s * 2) * 0.03, u.z + Math.cos(t * 0.4 + u.s) * 0.04);
        p.material.opacity = k * 0.42 * P.show; p.visible = p.material.opacity > 0.01; p.scale.set(1.5, 0.55, 1); });
    }, { state: o.state || 'off', fade: 'none' });
  },

  // 나무를 찍는 도끼 (왕하 6:5): 손 높이에 쥔 자루가 위아래로 휘두른다 (자루 끝이 축). 앞(+x)이 찍는 쪽, o.side -1이면 -x 쪽을 찍는다.
  // state 'chop'(되풀이) | 'idle'(내려 쥠) | 'empty'(날이 빠진 빈 자루 — 날은 axehead 소품으로)
  axe(o = {}) {
    const g = new THREE.Group(), pivot = new THREE.Group(), side = o.side || 1; pivot.scale.x = side; g.add(pivot);
    mesh(new THREE.CylinderGeometry(0.007, 0.008, 0.36, 6), wood(), pivot, [0.17, 0, 0]).rotation.z = Math.PI / 2;
    const head = new THREE.Group(); head.position.set(0.33, 0, 0); pivot.add(head);
    const iron = mat('#5a5a5e', { metalness: 0.5, roughness: 0.45 });
    mesh(new THREE.BoxGeometry(0.035, 0.07, 0.016), iron, head, [0, -0.02, 0]);
    mesh(new THREE.BoxGeometry(0.02, 0.03, 0.018), iron, head, [0, 0.02, 0]);
    return new Prop(g, (P, t, dt) => {
      const s = P.state;
      if (s === 'chop') { const u = (t * 1.3) % 1; pivot.rotation.z = side * (u < 0.7 ? 1.25 - 0.4 * (u / 0.7) : 0.85 - 1.5 * ((u - 0.7) / 0.3)); } // 천천히 들고 빠르게 내리친다
      else pivot.rotation.z = damp(pivot.rotation.z, side * -0.9, 4, dt);
      head.visible = s !== 'empty';
    }, { state: o.state || 'idle', fade: 'none' });
  },
});

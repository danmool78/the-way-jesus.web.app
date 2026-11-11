/* 바울 여정에만 쓰는 소품: props.js의 MAKERS에 더한다 (공용 파일을 키우지 않게). 네 묶음(a·b·c·d)이 함께 쓴다.
   크기는 사람 키(약 0.88)와의 비례로. 무대 x는 오른쪽(+, 동쪽), z는 앞(+, 화면 아래). 앞으로 나아가는 것(배·소)은 +x가 머리.
   뒤 묶음(a12–a42)에서도 다시 쓰게 만든 것: ship(상선 — 돛·키·흔들림, deck에 태운다), wallbasket(창 난 성벽과 광주리), council(공의회),
   synahall(회당 안), housechurch(등잔 켠 집 안의 모임), bema(총독의 재판석), gtemple(헬라 신전과 제단), colonnade(기둥 줄 거리), farcity(먼 성),
   road(길), heavenlight(하늘의 빛), cloakpile·scalefall·pour·garlandox.
   다윗·열왕기 여정의 소품(stonethrow·haze·provisions·kwall·hall…)도 그대로 쓴다. 주님·성령은 모습 없이 빛으로만 */
import { THREE, mat, DS, lathe, mesh, sphere, glowTexture, damp } from '../kit.js';
import { MAKERS, Prop } from '../props.js';

const wood = () => mat('#7a5634', { roughness: 0.95 });
const marble = () => mat('#ece6d8', { roughness: 0.7 });
const stoneM = (c = '#d8c8a6') => mat(c, { roughness: 0.95 });
const glow = (size, opacity = 1, color) => {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity, ...(color ? { color } : {}) }));
  s.scale.set(size, size, 1);
  return s;
};
const inner = (g, kind, o, pos, rot = 0) => { const P = MAKERS[kind](o); P.obj.position.set(...pos); P.obj.rotation.y = rot; g.add(P.obj); return P; };
// 위로 갈수록 옅어지는 빛 기둥의 결
const fadeTex = (top, bottom) => {
  const c = document.createElement('canvas'); c.width = 4; c.height = 128;
  const g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 128);
  gr.addColorStop(0, top); gr.addColorStop(1, bottom); g.fillStyle = gr; g.fillRect(0, 0, 4, 128);
  return new THREE.CanvasTexture(c);
};
// 기둥 하나: 받침·몸·기둥머리 (헬라·로마 기둥)
const column = (parent, x, z, h, r, m) => {
  mesh(new THREE.BoxGeometry(r * 2.6, 0.03, r * 2.6), m, parent, [x, 0.015, z]);
  mesh(new THREE.CylinderGeometry(r * 0.9, r, h - 0.07, 12), m, parent, [x, 0.03 + (h - 0.07) / 2, z]);
  mesh(new THREE.BoxGeometry(r * 2.5, 0.04, r * 2.5), m, parent, [x, h - 0.02, z]);
};

Object.assign(MAKERS, {
  /* ---------- 예루살렘 ---------- */

  // 공의회(산헤드린) 자리 (행 6:12–7:58): 다듬은 돌 바닥, 낮은 뒷벽과 붙임기둥, 앞으로 열린 반원 두 층 돌 의자, 뒤 가운데 대제사장의 자리.
  // 의원은 배역 y 0.12(앞줄)·0.2(뒷줄), pose 'sit'로 의자에 앉힌다. 반원의 가운데는 (0, 0.15) — 피고는 그 앞에 선다. o.r 반원 반지름
  council(o = {}) {
    const g = new THREE.Group(), R = o.r || 0.85, st = stoneM('#d8ccb2'), st2 = stoneM('#c8b898'), CZ = 0.15;
    mesh(new THREE.BoxGeometry(2.6, 0.02, 1.7), stoneM('#cbbd9e'), g, [0, 0.01, -0.05]).receiveShadow = true;
    const wall = mesh(new THREE.BoxGeometry(2.4, 0.72, 0.08), stoneM('#e2d6bc'), g, [0, 0.36, -0.95]); wall.receiveShadow = true;
    for (let i = 0; i < 7; i++) mesh(new THREE.BoxGeometry(0.08, 0.72, 0.04), st2, g, [-1.08 + i * 0.36, 0.36, -0.9]);
    mesh(new THREE.BoxGeometry(2.44, 0.05, 0.12), st2, g, [0, 0.74, -0.93]);
    [[R, 0.12, 0.2], [R + 0.22, 0.2, 0.2]].forEach(([r, h, d]) => {
      const n = Math.round(r * 9);
      for (let i = 0; i <= n; i++) { const a = Math.PI + (i / n) * Math.PI, x = Math.cos(a) * r, z = CZ + Math.sin(a) * r * 0.82;
        const b = mesh(new THREE.BoxGeometry(r * Math.PI / n + 0.01, h, d), st, g, [x, h / 2, z]); b.rotation.y = -a - Math.PI / 2; b.receiveShadow = true; }
    });
    // 대제사장의 자리: 뒤 가운데 한 단 높은 의자
    mesh(new THREE.BoxGeometry(0.3, 0.22, 0.24), st2, g, [0, 0.11, CZ - R * 0.82 - 0.36]);
    mesh(new THREE.BoxGeometry(0.3, 0.3, 0.05), st2, g, [0, 0.37, CZ - R * 0.82 - 0.47]);
    return new Prop(g);
  },

  // 겉옷 무더기 (행 7:58): 증인들이 벗어 둔 겉옷이 하나씩 쌓인다 (show가 커지면 하나씩)
  cloakpile(o = {}) {
    const g = new THREE.Group(), n = o.n || 5, cols = ['#7a3b2e', '#5d6b4a', '#b9a07a', '#3c5d96', '#8a6a48', '#6e5a40'], items = [];
    for (let i = 0; i < n; i++) {
      const c = mesh(new THREE.BoxGeometry(0.2, 0.025, 0.13), mat(cols[i % cols.length], { roughness: 1 }), g, [(i % 2 - 0.5) * 0.04, 0.013 + i * 0.022, (i % 3 - 1) * 0.02]);
      c.rotation.y = (i * 1.7) % 1 - 0.5; items.push(c);
    }
    return new Prop(g, P => items.forEach((c, i) => { const k = THREE.MathUtils.clamp(P.show * n - i, 0, 1); c.scale.setScalar(Math.max(1e-4, k)); c.visible = k > 0.02; }), { fade: 'none' });
  },

  /* ---------- 하늘의 빛 ---------- */

  // 하늘에서 쏟아지는 빛 (행 9:3, 22:6 '정오에 해보다 밝은 빛'): 하늘에서 내리꽂히는 흰 빛 기둥, 땅의 흰 웅덩이, 눈부신 빛무리.
  // 낮에도 보이게 빛 기둥은 보통 섞음의 흰빛(더하기 섞음은 밝은 모래 위에서 사라졌다 — 열왕기 firechariot). state 'on' | 'speak'(말씀하실 때 숨 쉬듯 밝아진다).
  // 주님의 모습은 그리지 않는다 — 빛과 목소리로만. o.r 반지름, o.h 높이
  heavenlight(o = {}) {
    const g = new THREE.Group(), r = o.r || 0.75, H = o.h || 3.2;
    const cm = new THREE.MeshBasicMaterial({ map: fadeTex('rgba(255,255,250,0.05)', 'rgba(255,250,232,0.6)'), transparent: true, depthWrite: false, side: THREE.DoubleSide, opacity: 0 });
    const cone = mesh(new THREE.CylinderGeometry(r * 0.35, r, H, 40, 1, true), cm, g, [0, H / 2, 0]); cone.castShadow = false; cone.renderOrder = 3;
    const core = mesh(new THREE.CylinderGeometry(r * 0.12, r * 0.45, H, 24, 1, true), cm.clone(), g, [0, H / 2, 0]); core.castShadow = false; core.renderOrder = 3;
    const pm = new THREE.MeshBasicMaterial({ color: '#fffdf0', transparent: true, opacity: 0, depthWrite: false });
    const pool = mesh(new THREE.CircleGeometry(r * 1.25, 40), pm, g, [0, 0.012, 0]); pool.rotation.x = -Math.PI / 2; pool.castShadow = false;
    const flare = glow(r * 5, 0, '#fff6dc'); flare.position.y = 0.6; g.add(flare);
    const sky = glow(r * 4, 0, '#fffbe8'); sky.position.y = H; g.add(sky);
    const light = new THREE.PointLight('#fff4d8', 0, 4, 1.2); light.position.y = 1.1; g.add(light);
    let k = 0;
    return new Prop(g, (P, t, dt) => {
      k = damp(k, P.state === 'speak' ? 1.25 + Math.sin(t * 3.2) * 0.15 : 1, 2, dt);
      const s = P.show * k;
      cm.opacity = Math.min(1, s * 0.8); core.material.opacity = Math.min(1, s * 0.55);
      pm.opacity = Math.min(0.9, s * 0.75); flare.material.opacity = Math.min(1, s * 0.85); sky.material.opacity = Math.min(1, s);
      light.intensity = s * 3.2;
    }, { state: o.state || 'on', fade: 'none' });
  },

  // 눈에서 떨어지는 비늘 같은 것 (행 9:18): state 'fall'이 되면 얼굴 높이(o.h)에서 엷은 비늘 몇 조각이 반짝이며 떨어져 사라진다
  scalefall(o = {}) {
    const g = new THREE.Group(), H = o.h || 0.62, m = new THREE.MeshStandardMaterial({ color: '#efe6d0', emissive: '#a89a70', emissiveIntensity: 0.5, roughness: 0.4, transparent: true, side: THREE.DoubleSide });
    const bits = Array.from({ length: 8 }, (_, i) => { const b = mesh(new THREE.CircleGeometry(0.014 + (i % 3) * 0.004, 8), m, g); b.castShadow = false; b.userData = { x: (i % 2 ? 1 : -1) * (0.02 + (i % 4) * 0.008), z: 0.05 + (i % 3) * 0.01, s: i * 0.11 }; return b; });
    const sp = glow(0.4, 0, '#fff4d0'); sp.position.y = H; g.add(sp);
    return new Prop(g, P => {
      const u = P.state === 'fall' ? performance.now() / 1000 - P.t0 : -1;
      bits.forEach(b => { const v = THREE.MathUtils.clamp((u - b.userData.s) / 1.6, 0, 1); b.visible = u >= 0 && v < 1;
        b.position.set(b.userData.x * (1 + v * 2), H - v * v * H * 0.95, b.userData.z + v * 0.06); b.rotation.set(v * 6, v * 4, 0); m.opacity = P.show; });
      sp.material.opacity = u >= 0 ? Math.max(0, 1 - u / 2.2) * 0.8 * P.show : 0;
    }, { state: o.state || 'idle', fade: 'none' });
  },

  // 붓는 물 (세례, 행 9:18): 머리 위 높이(o.h)에서 질그릇 물병이 기울고 가는 물줄기가 떨어진다. state 'pour' | 'idle'
  pour(o = {}) {
    const g = new THREE.Group(), H = o.h || 0.95, jug = new THREE.Group(); jug.position.set(-0.07, H, 0); g.add(jug);
    mesh(lathe([[0.001, 0], [0.03, 0], [0.045, 0.04], [0.04, 0.08], [0.02, 0.1], [0.024, 0.12], [0.001, 0.12]], 14), mat('#b5653e', { roughness: 0.9 }), jug, [0, -0.06, 0]);
    const wm = new THREE.MeshStandardMaterial({ color: '#cfe6ee', emissive: '#4a7a8a', emissiveIntensity: 0.3, roughness: 0.1, transparent: true, opacity: 0, depthWrite: false });
    const stream = mesh(new THREE.CylinderGeometry(0.006, 0.01, 1, 8, 1, true), wm, g, [0, 0, 0]); stream.castShadow = false;
    let k = 0;
    return new Prop(g, (P, t, dt) => {
      k = damp(k, P.state === 'pour' ? 1 : 0, 2.5, dt);
      jug.rotation.z = -k * 1.4;
      const top = H + 0.02, bot = H - 0.32; stream.scale.y = top - bot; stream.position.set(0.0, (top + bot) / 2, 0); wm.opacity = k > 0.6 ? (k - 0.6) * 1.8 * P.show : 0;
    }, { state: o.state || 'idle', fade: 'scale' });
  },

  /* ---------- 길과 성 ---------- */

  // 흙길: 무대를 가로지르는 바퀴 자국 난 길과 길가 돌. o.len 길이, o.w 너비, o.color 흙빛 (rot으로 방향)
  road(o = {}) {
    const g = new THREE.Group(), L = o.len || 4, W = o.w || 0.42;
    const c = document.createElement('canvas'); c.width = 256; c.height = 64;
    const x = c.getContext('2d'); x.fillStyle = o.color || '#c8b088'; x.fillRect(0, 0, 256, 64);
    for (let i = 0; i < 260; i++) { x.fillStyle = `rgba(${i % 2 ? 90 : 240},${i % 2 ? 70 : 225},${i % 2 ? 50 : 190},0.18)`; x.fillRect(Math.random() * 256, Math.random() * 64, 2 + Math.random() * 4, 1 + Math.random() * 2); }
    x.fillStyle = 'rgba(90,70,48,0.25)'; [20, 44].forEach(y => x.fillRect(0, y, 256, 3)); // 바퀴 자국
    const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace;
    // 가장자리를 흐리게 풀어 땅에 녹아 보이게
    const a = document.createElement('canvas'); a.width = 4; a.height = 64; const ax = a.getContext('2d'), gr = ax.createLinearGradient(0, 0, 0, 64);
    gr.addColorStop(0, '#000'); gr.addColorStop(0.25, '#fff'); gr.addColorStop(0.75, '#fff'); gr.addColorStop(1, '#000'); ax.fillStyle = gr; ax.fillRect(0, 0, 4, 64);
    const am = new THREE.CanvasTexture(a);
    const m = new THREE.MeshStandardMaterial({ map: tx, alphaMap: am, transparent: true, roughness: 1, depthWrite: false });
    const p = mesh(new THREE.PlaneGeometry(L, W), m, g, [0, 0.006, 0]); p.rotation.x = -Math.PI / 2; p.receiveShadow = true; p.castShadow = false;
    const rk = mat('#a8977c', { roughness: 1, flatShading: true });
    for (let i = 0; i < Math.round(L * 3); i++) { const s = mesh(new THREE.DodecahedronGeometry(0.025 + (i % 3) * 0.012, 0), rk, g, [-L / 2 + (i + 0.5) * L / Math.round(L * 3), 0.015, (i % 2 ? 1 : -1) * (W / 2 + 0.04 + (i % 4) * 0.02)]); s.rotation.set(i, i * 2, 0); }
    return new Prop(g, P => { m.opacity = P.show; }, { fade: 'none' });
  },

  // 먼 성 (멀리 보이는 다메섹·안디옥): 둥근 성벽과 탑, 그 안의 흰 집들. 무대 뒤쪽에 작게 둔다. o.dia 지름
  farcity(o = {}) {
    const g = new THREE.Group(), S = o.dia || 1, st = stoneM(o.color || '#d8c8a6'), roofs = ['#e8dcc4', '#d8c8a8', '#e2d4b8', '#cbb894'];
    const n = 14;
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, x = Math.cos(a) * 0.5 * S, z = Math.sin(a) * 0.32 * S;
      const w = mesh(new THREE.BoxGeometry(0.24 * S, 0.18 * S, 0.04 * S), st, g, [x, 0.09 * S, z]); w.rotation.y = -a + Math.PI / 2;
      if (i % 2 === 0) mesh(new THREE.BoxGeometry(0.07 * S, 0.25 * S, 0.07 * S), st, g, [x, 0.125 * S, z]); }
    for (let i = 0; i < 22; i++) { const a = i * 2.399, r = Math.sqrt((i + 0.5) / 22) * 0.4 * S, h = (0.08 + (i % 4) * 0.035) * S;
      mesh(new THREE.BoxGeometry(0.09 * S, h, 0.08 * S), mat(roofs[i % 4], { roughness: 1 }), g, [Math.cos(a) * r, h / 2, Math.sin(a) * r * 0.62]); }
    return new Prop(g);
  },

  // 창이 난 성벽과 광주리 (행 9:25, 고후 11:33): 앞(+z)을 보는 높은 마름돌 성벽, 성벽 위 흉벽, 성벽에 붙여 지은 집의 높은 창(o.wx),
  // 창에서 내린 밧줄에 매달린 큰 광주리(deck — 탄 사람은 pose 'sit-ground'). state 'up'(창 앞) | 'lower'(천천히 내려간다) | 'down'(땅).
  // o.gate: 성문 자리 x(없으면 문 없이) — 문 양옆 탑과 횃불. o.lit: 창에 등잔빛. 성벽 위에 선 사람은 배역 y = o.h(기본 1.3)
  wallbasket(o = {}) {
    const g = new THREE.Group(), W = o.w || 2.6, H = o.h || 1.3, T = 0.26, st = stoneM(o.color || '#cdbd9a'), st2 = stoneM('#b8a882'), dk = mat('#1e140c');
    const WX = o.wx ?? 0.35, WY = H * 0.68;
    // 마름돌 결: 줄눈을 그린 캔버스
    const c = document.createElement('canvas'); c.width = 128; c.height = 64; const x = c.getContext('2d');
    x.fillStyle = '#cdbd9a'; x.fillRect(0, 0, 128, 64); x.strokeStyle = 'rgba(80,64,44,0.45)'; x.lineWidth = 1.5;
    for (let r = 0; r < 4; r++) { x.beginPath(); x.moveTo(0, r * 16); x.lineTo(128, r * 16); x.stroke(); for (let k = 0; k < 4; k++) { const xx = k * 32 + (r % 2) * 16; x.beginPath(); x.moveTo(xx, r * 16); x.lineTo(xx, r * 16 + 16); x.stroke(); } }
    const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(W * 2.2, H * 2.2);
    const face = new THREE.MeshStandardMaterial({ map: tx, roughness: 0.95 });
    const gate = o.gate, GW = 0.36;
    const parts = gate === undefined ? [[-W / 2, W / 2]] : [[-W / 2, gate - GW / 2], [gate + GW / 2, W / 2]];
    parts.forEach(([a, b]) => { if (b - a < 0.01) return; mesh(new THREE.BoxGeometry(b - a, H, T), [st, st, st, st, face, st], g, [(a + b) / 2, H / 2, 0]).receiveShadow = true;
      for (let k = a + 0.06; k < b - 0.04; k += 0.16) mesh(new THREE.BoxGeometry(0.08, 0.08, 0.06), st, g, [k, H + 0.04, T / 2 - 0.03]); });
    if (gate !== undefined) {
      [-1, 1].forEach(s => { mesh(new THREE.BoxGeometry(0.3, H + 0.22, 0.36), st2, g, [gate + s * (GW / 2 + 0.15), (H + 0.22) / 2, 0.04]).receiveShadow = true;
        for (let k = 0; k < 3; k++) mesh(new THREE.BoxGeometry(0.06, 0.07, 0.06), st2, g, [gate + s * (GW / 2 + 0.15) + (k - 1) * 0.1, H + 0.25, 0.19]); });
      mesh(new THREE.BoxGeometry(GW, H * 0.3, T), st2, g, [gate, H * 0.85, 0]);
      mesh(new THREE.BoxGeometry(GW, H * 0.7, 0.02), mat('#3a2a1a', { roughness: 1 }), g, [gate, H * 0.35, -0.02]); // 닫힌 문짝
    }
    // 횃불 (성문을 지키는 밤 — 행 9:24)
    const fires = [];
    if (gate !== undefined && o.torches !== false) [-1, 1].forEach(s => {
      const f = new THREE.Group(); f.position.set(gate + s * (GW / 2 + 0.15), H * 0.86, 0.24); g.add(f);
      mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.14, 6), wood(), f, [0, 0, 0]).rotation.x = 0.4;
      const fl = mesh(new THREE.ConeGeometry(0.03, 0.09, 8), new THREE.MeshBasicMaterial({ color: '#ffb347' }), f, [0, 0.1, 0.03]); fl.castShadow = false;
      const h = glow(0.6, 0.8, '#ffaa50'); h.position.set(0, 0.1, 0.04); f.add(h);
      const l = new THREE.PointLight('#ffa850', 1.2, 1.6, 1.5); l.position.set(0, 0.12, 0.15); f.add(l);
      fires.push({ fl, h, l });
    });
    // 성벽에 붙여 지은 집의 창 (고후 11:33 '들창') — 창틀, 어두운 안, 등잔빛
    mesh(new THREE.BoxGeometry(0.3, 0.26, 0.04), st2, g, [WX, WY, T / 2 + 0.005]);
    mesh(new THREE.BoxGeometry(0.22, 0.19, 0.03), dk, g, [WX, WY, T / 2 + 0.018]);
    mesh(new THREE.BoxGeometry(0.34, 0.035, 0.09), st2, g, [WX, WY - 0.13, T / 2 + 0.03]); // 창턱
    const lm = new THREE.MeshBasicMaterial({ color: '#ffc870', transparent: true, opacity: 0 });
    mesh(new THREE.BoxGeometry(0.2, 0.17, 0.01), lm, g, [WX, WY, T / 2 + 0.035]).castShadow = false;
    const wl = new THREE.PointLight('#ffc070', 0, 1.4, 1.5); wl.position.set(WX, WY, T / 2 + 0.25); g.add(wl);
    // 밧줄과 광주리
    const ropeM = mat('#8a6a42', { roughness: 1 });
    const rope = mesh(new THREE.CylinderGeometry(0.006, 0.006, 1, 5), ropeM, g, [WX, 0, T / 2 + 0.2]); rope.castShadow = false;
    const basket = new THREE.Group(); g.add(basket);
    const BR = 0.2, BH = 0.2, wick = mat('#a07a44', { ...DS, roughness: 1 });
    mesh(new THREE.CylinderGeometry(BR, BR * 0.82, BH, 18, 1, true), wick, basket, [0, BH / 2, 0]);
    mesh(new THREE.CircleGeometry(BR * 0.82, 18), wick, basket, [0, 0.01, 0]).rotation.x = -Math.PI / 2;
    for (let i = 0; i < 3; i++) mesh(new THREE.TorusGeometry(BR * (0.86 + i * 0.07), 0.007, 4, 24), mat('#7a5630'), basket, [0, 0.04 + i * 0.07, 0]).rotation.x = Math.PI / 2;
    [-1, 1].forEach(s => { const r = mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.5, 4), ropeM, basket, [s * BR * 0.7, BH + 0.2, 0]); r.rotation.z = -s * 0.42; r.castShadow = false; }); // 광주리를 묶은 두 줄
    const deck = new THREE.Group(); deck.position.y = 0.02; basket.add(deck);
    const TOP = WY - 0.22 - BH; // 창 앞에 매달린 높이
    let y = o.state === 'down' ? 0 : TOP;
    const P = new Prop(g, (P, t, dt) => {
      const want = P.state === 'down' ? 0 : P.state === 'lower' ? 0 : TOP;
      if (P.state === 'lower') y = Math.max(0, y - dt * 0.09); else y = damp(y, want, 3, dt);
      basket.position.set(WX, y + Math.sin(t * 1.3) * 0.004 * (y > 0.02 ? 1 : 0), T / 2 + 0.2); basket.rotation.y = Math.sin(t * 0.7) * 0.05 * (y > 0.02 ? 1 : 0);
      const top = WY - 0.11, len = Math.max(0.02, top - (y + BH + 0.4)); rope.scale.y = len; rope.position.y = top - len / 2;
      const lit = (o.lit || P.state !== 'idle') ? 1 : 0; lm.opacity = damp(lm.opacity, lit * 0.95, 2, dt) * P.show; wl.intensity = lm.opacity * 1.3;
      fires.forEach(f => { const k = (1 + Math.sin(t * 9 + f.l.position.x) * 0.08) * P.show; f.fl.scale.y = k; f.h.material.opacity = 0.75 * k; f.l.intensity = 1.2 * k; });
    }, { state: o.state || 'up' });
    P.deck = deck;
    return P;
  },

  // 기둥 줄 거리 (다메섹의 '곧은 길', 안디옥의 큰 거리): 뒤쪽(-z)에 한 줄로 선 기둥과 처마, 그 뒤 지붕 덮인 회랑과 가게 문들.
  // 앞줄 기둥은 세우지 않는다 — 사람을 가렸다. o.w 길이, o.n 기둥 수, o.h 기둥 높이, o.shops false면 가게 문 없이
  colonnade(o = {}) {
    const g = new THREE.Group(), W = o.w || 3, n = o.n || 8, Hc = o.h || 0.8, m = marble(), wall = stoneM(o.wall || '#d8c8a6'), dk = mat('#2a1c10');
    for (let i = 0; i < n; i++) column(g, -W / 2 + (i + 0.5) * W / n, 0, Hc, 0.035, m);
    mesh(new THREE.BoxGeometry(W + 0.1, 0.06, 0.12), m, g, [0, Hc + 0.03, 0]);
    mesh(new THREE.BoxGeometry(W + 0.1, 0.03, 0.5), mat('#a8673e', { roughness: 0.9 }), g, [0, Hc + 0.075, -0.22]); // 회랑 지붕 (기와)
    const back = mesh(new THREE.BoxGeometry(W + 0.1, Hc + 0.06, 0.06), wall, g, [0, (Hc + 0.06) / 2, -0.46]); back.receiveShadow = true;
    mesh(new THREE.BoxGeometry(W + 0.1, 0.02, 0.5), stoneM('#cbbd9e'), g, [0, 0.01, -0.22]).receiveShadow = true;
    if (o.shops !== false) for (let i = 0; i < n - 1; i++) mesh(new THREE.BoxGeometry(0.18, 0.38, 0.02), dk, g, [-W / 2 + (i + 1) * W / n, 0.19, -0.425]);
    return new Prop(g);
  },

  /* ---------- 회당·집 ---------- */

  // 회당 안 (행 13:14–15): 다듬은 돌 바닥, 낮은 뒷벽 가운데 율법 두루마리 궤(벽감), 뒤와 양옆을 두른 두 층 돌 의자, 네 귀의 기둥, 가운데 낭독대(bema).
  // 앉은 사람은 배역 y 0.1(앞줄)·0.2(뒷줄) pose 'sit'. 낭독대 앞에 서서 말한다. 뒷벽 의자 앞줄 z ≈ -0.62, 양옆 앞줄 x ≈ ±1.02
  synahall(o = {}) {
    const g = new THREE.Group(), st = stoneM('#d8ccb2'), st2 = stoneM('#c4b490'), W = o.w || 2.4;
    mesh(new THREE.BoxGeometry(W + 0.4, 0.02, 1.8), stoneM('#cdbf9f'), g, [0, 0.01, -0.05]).receiveShadow = true;
    const wall = mesh(new THREE.BoxGeometry(W + 0.4, 0.7, 0.08), stoneM('#e4d8c0'), g, [0, 0.35, -0.98]); wall.receiveShadow = true;
    // 율법 궤: 벽감과 휘장
    mesh(new THREE.BoxGeometry(0.34, 0.46, 0.1), st2, g, [0, 0.33, -0.9]);
    mesh(sphere(0.17, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), st2, g, [0, 0.56, -0.9], [1, 0.6, 0.3]);
    mesh(new THREE.BoxGeometry(0.24, 0.32, 0.02), mat('#2f4f8a', { roughness: 0.9 }), g, [0, 0.3, -0.84]);
    // 두 층 돌 의자: 뒤(앞줄 z -0.62)와 양옆(앞줄 x ±1.02)
    [[0.1, 0, 0.2], [0.2, 1, 0.2]].forEach(([h, row]) => {
      mesh(new THREE.BoxGeometry(W - 0.2 + row * 0.4, h, 0.2), st, g, [0, h / 2, -0.62 - row * 0.2]).receiveShadow = true;
      [-1, 1].forEach(s => mesh(new THREE.BoxGeometry(0.2, h, 1.1), st, g, [s * (1.02 + row * 0.2), h / 2, -0.05 - row * 0.1]).receiveShadow = true);
    });
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => column(g, a * 0.75, b > 0 ? 0.55 : -0.42, 0.78, 0.035, st));
    // 낭독대
    mesh(new THREE.BoxGeometry(0.36, 0.05, 0.28), wood(), g, [o.bx ?? 0.35, 0.025, -0.15]);
    mesh(new THREE.BoxGeometry(0.16, 0.34, 0.12), wood(), g, [o.bx ?? 0.35, 0.19, -0.2]);
    mesh(new THREE.BoxGeometry(0.2, 0.02, 0.16), wood(), g, [o.bx ?? 0.35, 0.37, -0.2]).rotation.x = 0.3;
    return new Prop(g);
  },

  // 등잔 켠 집 안의 모임 (안디옥 교회의 예배와 금식 — 행 13:2, 뒤 묶음의 드로아 다락방·집의 교회): 깔개 깐 흙바닥, 낮은 뒷벽과 왼벽,
  // 벽감 선반의 두루마리, 등잔대 둘(o.lamps 자리), 가운데 낮은 상(o.table false면 없이). 앉은 사람은 pose 'sit-ground'
  housechurch(o = {}) {
    const g = new THREE.Group(), wall = mat(o.wall || '#d8c4a0', { roughness: 1 }), W = o.w || 2.4;
    mesh(new THREE.BoxGeometry(W, 0.02, 1.6), mat('#b89a72', { roughness: 1 }), g, [0, 0.01, -0.05]).receiveShadow = true;
    mesh(new THREE.BoxGeometry(W, 0.66, 0.07), wall, g, [0, 0.33, -0.85]).receiveShadow = true;
    mesh(new THREE.BoxGeometry(0.07, 0.66, 1.0), wall, g, [-W / 2 + 0.035, 0.33, -0.38]).receiveShadow = true;
    mesh(new THREE.BoxGeometry(W + 0.02, 0.04, 0.1), mat('#7a4a2a'), g, [0, 0.66, -0.85]);
    // 벽감과 두루마리
    mesh(new THREE.BoxGeometry(0.4, 0.22, 0.03), mat('#8a6a48'), g, [-0.6, 0.42, -0.8]);
    [0, 1, 2].forEach(i => mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.12, 8), mat('#e8dcbf'), g, [-0.72 + i * 0.1, 0.35, -0.78]).rotation.z = Math.PI / 2);
    // 깔개
    [[-0.5, 0.15, '#7a3a2a'], [0.55, 0.2, '#3e5a6a'], [0, -0.35, '#8a6a3a']].forEach(([x, z, c]) => { const r = mesh(new THREE.BoxGeometry(0.7, 0.008, 0.45), mat(c, { roughness: 1 }), g, [x, 0.024, z]); r.receiveShadow = true; });
    if (o.table !== false) {
      mesh(new THREE.BoxGeometry(0.42, 0.04, 0.26), wood(), g, [0, 0.12, 0.05]);
      [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, b]) => mesh(new THREE.BoxGeometry(0.03, 0.1, 0.03), wood(), g, [a * 0.18, 0.05, 0.05 + b * 0.1]));
      mesh(new THREE.CylinderGeometry(0.05, 0.052, 0.02, 14), mat('#c99858', { roughness: 1 }), g, [-0.08, 0.15, 0.05]);
      mesh(lathe([[0.001, 0], [0.02, 0], [0.006, 0.01], [0.006, 0.03], [0.026, 0.05], [0.028, 0.07], [0.001, 0.06]], 12), mat('#b98a4a', { metalness: 0.4, roughness: 0.5 }), g, [0.1, 0.14, 0.05]);
    }
    const lamps = (o.lamps || [[-0.95, -0.6], [0.95, -0.6]]).map(([x, z]) => {
      const s = new THREE.Group(); s.position.set(x, 0, z); g.add(s);
      mesh(new THREE.CylinderGeometry(0.012, 0.03, 0.42, 8), mat('#8a6a3a', { metalness: 0.4, roughness: 0.5 }), s, [0, 0.21, 0]);
      return inner(s, 'lamp', {}, [-0.06, 0.33, 0]);
    });
    return new Prop(g, (P, t, dt, env) => lamps.forEach(L => { L.show = P.show; L.upd(L, t, dt, env); }));
  },

  /* ---------- 로마와 헬라 ---------- */

  // 총독의 재판석(베마) (행 13:7 바보, 18:12 고린도, 25:6 가이사랴): 두 층계로 오르는 돌 단과 상아 접의자(쿠룰레 의자), 뒤에 두 기둥과 처마.
  // 단 위에 사람이 선다(heightAt — 단 높이 0.2). 의자에 앉은 총독은 배역 y 0.16, pose 'sit'. 의자 자리는 소품 자리에서 (0, -0.08)
  bema(o = {}) {
    const g = new THREE.Group(), m = marble(), st = stoneM('#cbbd9e'), H = 0.2, W = o.w || 0.9, D = 0.62;
    mesh(new THREE.BoxGeometry(W, H, D), m, g, [0, H / 2, -0.05]).receiveShadow = true;
    [0, 1].forEach(i => mesh(new THREE.BoxGeometry(W * 0.6, H * (i ? 0.33 : 0.66), 0.1), st, g, [0, H * (i ? 0.165 : 0.33), D / 2 - 0.05 + 0.05 + i * 0.1]).receiveShadow = true);
    // 상아 접의자: X자 다리와 방석
    const ch = new THREE.Group(); ch.position.set(0, H, -0.08); g.add(ch);
    const iv = mat('#efe6d0', { roughness: 0.5 }), gold = mat('#d6a93a', { metalness: 0.6, roughness: 0.35 });
    [-1, 1].forEach(s => [-1, 1].forEach(k => { const l = mesh(new THREE.BoxGeometry(0.02, 0.2, 0.02), iv, ch, [s * 0.1, 0.08, 0]); l.rotation.x = k * 0.55; }));
    mesh(new THREE.BoxGeometry(0.26, 0.03, 0.18), gold, ch, [0, 0.16, 0]);
    mesh(new THREE.BoxGeometry(0.24, 0.02, 0.16), mat('#6b2a5e', { roughness: 0.9 }), ch, [0, 0.18, 0]);
    if (o.columns !== false) { [-1, 1].forEach(s => column(g, s * (W / 2 - 0.08), -0.32, 1.0, 0.04, m)); mesh(new THREE.BoxGeometry(W, 0.08, 0.12), m, g, [0, 1.04, -0.32]); }
    const P = new Prop(g);
    P.heightAt = (x, z) => { const u = (x - g.position.x) / g.scale.x, v = (z - g.position.z) / g.scale.z; return P.show > 0.5 && Math.abs(u) < W / 2 - 0.02 && v > -0.05 - D / 2 && v < -0.05 + D / 2 - 0.02 ? H * g.scale.y : 0; };
    return P;
  },

  // 헬라 신전 (행 14:13 루스드라 성 앞의 제우스 신전, 뒤 묶음의 아덴·에베소): 세 층 기단, 앞 여섯 기둥과 옆 기둥, 안의 신당(cella), 삼각 박공 지붕.
  // 신상은 두지 않는다. o.altar: 앞의 돌 제단(state 'fire'면 불), o.label: 제단에 새긴 글(아덴의 '알지 못하는 신에게' — 작은 판). 앞(+z)이 정면
  gtemple(o = {}) {
    const g = new THREE.Group(), m = marble(), W = o.w || 1.3, D = o.d || 1.0, Hc = 0.72, shade = stoneM('#d2c8b2');
    for (let i = 0; i < 3; i++) mesh(new THREE.BoxGeometry(W + 0.24 - i * 0.08, 0.05, D + 0.24 - i * 0.08), i % 2 ? m : shade, g, [0, 0.025 + i * 0.05, 0]).receiveShadow = true;
    const top = new THREE.Group(); top.position.y = 0.15; g.add(top);
    const cols = Math.max(4, Math.round(W / 0.24));
    for (let i = 0; i < cols; i++) { const x = -W / 2 + 0.08 + i * (W - 0.16) / (cols - 1); column(top, x, D / 2 - 0.08, Hc, 0.032, m); column(top, x, -D / 2 + 0.08, Hc, 0.032, m); }
    for (let i = 1; i < 3; i++) [-1, 1].forEach(s => column(top, s * (W / 2 - 0.08), D / 2 - 0.08 - i * (D - 0.16) / 3, Hc, 0.032, m));
    mesh(new THREE.BoxGeometry(W - 0.4, Hc, D - 0.42), stoneM('#e2d8c2'), top, [0, Hc / 2, -0.04]).receiveShadow = true; // 신당
    mesh(new THREE.BoxGeometry(0.16, 0.36, 0.02), mat('#2a1c10'), top, [0, 0.18, D / 2 - 0.25]);
    mesh(new THREE.BoxGeometry(W + 0.02, 0.09, D + 0.02), m, top, [0, Hc + 0.045, 0]); // 처마
    const gable = new THREE.Shape(); gable.moveTo(-W / 2 - 0.02, 0); gable.lineTo(W / 2 + 0.02, 0); gable.lineTo(0, 0.24); gable.lineTo(-W / 2 - 0.02, 0);
    const roof = new THREE.ExtrudeGeometry(gable, { depth: D + 0.04, bevelEnabled: false }); roof.translate(0, 0, -(D + 0.04) / 2);
    mesh(roof, mat('#c8784a', { roughness: 0.85 }), top, [0, Hc + 0.09, 0]);
    const ped = new THREE.ShapeGeometry(gable); mesh(ped, m, top, [0, Hc + 0.09, D / 2 + 0.025]).scale.set(0.92, 0.85, 1); // 박공 면
    let fire = null;
    if (o.altar) {
      const a = new THREE.Group(); a.position.set(o.altar[0] ?? 0, 0, o.altar[1] ?? D / 2 + 0.45); g.add(a);
      mesh(new THREE.BoxGeometry(0.3, 0.2, 0.22), m, a, [0, 0.1, 0]); mesh(new THREE.BoxGeometry(0.34, 0.03, 0.26), m, a, [0, 0.215, 0]);
      if (o.label) mesh(new THREE.BoxGeometry(0.2, 0.06, 0.005), mat('#b8ab90'), a, [0, 0.12, 0.113]);
      fire = new THREE.Group(); fire.position.y = 0.23; a.add(fire);
      const fm = new THREE.MeshBasicMaterial({ color: '#ffb347', transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending });
      for (let i = 0; i < 4; i++) mesh(new THREE.ConeGeometry(0.03, 0.12, 7), fm, fire, [Math.cos(i * 1.6) * 0.04, 0.05, Math.sin(i * 1.6) * 0.03]).castShadow = false;
      const h = glow(0.5, 0.6, '#ffaa50'); h.position.y = 0.05; fire.add(h);
    }
    const P = new Prop(g, P => { if (fire) fire.visible = P.state === 'fire'; }, { state: o.state || 'idle' });
    P.heightAt = (x, z) => { const u = (x - g.position.x) / g.scale.x, v = (z - g.position.z) / g.scale.z; return P.show > 0.5 && Math.abs(u) < W / 2 + 0.1 && Math.abs(v) < D / 2 + 0.1 ? 0.15 * g.scale.y : 0; };
    return P;
  },

  // 화관을 두른 소 (행 14:13): 소의 목에 꽃다발. 머리가 +x
  garlandox(o = {}) {
    const P = MAKERS.ox(o), fl = ['#e8c040', '#d8604a', '#f1ece0', '#e89a40'];
    const ring = new THREE.Group(); ring.position.set(0.27, 0.48, 0); ring.rotation.z = 0.5; P.obj.add(ring);
    for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; mesh(sphere(0.022, 8, 6), mat(fl[i % 4], { roughness: 0.8 }), ring, [0, Math.cos(a) * 0.085, Math.sin(a) * 0.085]); }
    for (let i = 0; i < 5; i++) mesh(sphere(0.018, 8, 6), mat(fl[i % 4], { roughness: 0.8 }), ring, [0, -0.09 - i * 0.03, 0.0]); // 늘어진 꽃 줄
    return P;
  },

  /* ---------- 바다 ---------- */

  // 상선 (행 13:4 실루기아에서 구브로로, 27장의 알렉산드리아 곡물선): 길고 배가 불룩한 나무 배, 뒤(-x)로 휘어 오른 거위 목 고물대,
  // 큰 네모 돛(state 'sail' 펼침 | 'furled' 접음), 앞으로 기운 작은 앞돛대, 고물 양쪽의 키(노 모양), 고물의 작은 선실. 물결(env.wave)에 흔들린다.
  // 사람은 deck에 태운다(board). +x가 뱃머리 — 가는 쪽으로 돌게 directional로 쓴다(o.speed와 함께). o.big 크기(기본 1 — 길이 약 2.2)
  ship(o = {}) {
    const g = new THREE.Group(), rock = new THREE.Group(); g.add(rock);
    const S = o.big || 1, L = 1.1 * S, B = 0.32 * S;
    const hullM = mat(o.color || '#6e4a2c', { ...DS, roughness: 0.9 }), dark = mat('#3e2a18', { roughness: 0.9 }), plank = mat('#8a6440', { roughness: 0.95 });
    const hull = mesh(sphere(0.5, 40, 14, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), hullM, rock, [0, 0.22 * S, 0], [L * 2, 0.5 * S, B * 2]); hull.receiveShadow = true;
    mesh(new THREE.TorusGeometry(0.5, 0.016, 6, 48), dark, rock, [0, 0.22 * S, 0], [L * 2, B * 2, 1]).rotation.x = Math.PI / 2;
    mesh(new THREE.TorusGeometry(0.5, 0.01, 6, 48), mat('#c9a86a'), rock, [0, 0.15 * S, 0], [L * 1.96, B * 1.9, 1]).rotation.x = Math.PI / 2; // 뱃전의 띠
    const deckY = 0.21 * S;
    mesh(new THREE.BoxGeometry(L * 1.7, 0.02, B * 1.5), plank, rock, [0, deckY, 0]).receiveShadow = true;
    // 고물대: 뒤로 휘어 오른 거위 목
    const pts = []; for (let i = 0; i <= 10; i++) { const u = i / 10; pts.push(new THREE.Vector3(-L * 0.98 - u * 0.12 * S, deckY + u * 0.36 * S, 0).add(new THREE.Vector3(Math.sin(u * 2.4) * 0.06 * S, 0, 0))); }
    mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 14, 0.03 * S, 8), hullM, rock);
    mesh(new THREE.ConeGeometry(0.035 * S, 0.12 * S, 8), hullM, rock, [L * 1.0, deckY + 0.06 * S, 0]).rotation.z = -1.0; // 이물 끝
    // 고물 선실
    mesh(new THREE.BoxGeometry(0.3 * S, 0.16 * S, B * 1.2), mat('#9a7448', { roughness: 0.9 }), rock, [-L * 0.7, deckY + 0.08 * S, 0]);
    mesh(new THREE.BoxGeometry(0.34 * S, 0.02 * S, B * 1.3), dark, rock, [-L * 0.7, deckY + 0.17 * S, 0]);
    // 키 두 자루
    [-1, 1].forEach(s => { const r = mesh(new THREE.BoxGeometry(0.03 * S, 0.42 * S, 0.06 * S), dark, rock, [-L * 0.86, deckY - 0.02 * S, s * B * 0.95]); r.rotation.z = 0.5; });
    // 큰 돛대와 활대, 돛
    const MX = L * 0.08, MH = 1.25 * S;
    mesh(new THREE.CylinderGeometry(0.016 * S, 0.022 * S, MH, 8), dark, rock, [MX, deckY + MH / 2, 0]);
    const yard = new THREE.Group(); yard.position.set(MX, deckY + MH * 0.92, 0.03 * S); rock.add(yard);
    mesh(new THREE.CylinderGeometry(0.01 * S, 0.01 * S, 1.0 * S, 6), dark, yard).rotation.x = Math.PI / 2;
    const sailG = new THREE.PlaneGeometry(0.95 * S, 0.8 * S, 10, 8), sp = sailG.attributes.position;
    for (let i = 0; i < sp.count; i++) { const x = sp.getX(i), y = sp.getY(i); sp.setZ(i, 0.08 * S * (1 - (x / (0.475 * S)) ** 2) * (0.6 + 0.4 * (1 - Math.abs(y) / (0.4 * S)))); }
    sailG.computeVertexNormals(); sailG.rotateY(Math.PI / 2); sailG.translate(0, -0.4 * S, 0);
    const sc = document.createElement('canvas'); sc.width = 64; sc.height = 64; const sx = sc.getContext('2d');
    sx.fillStyle = o.sail || '#ece0c4'; sx.fillRect(0, 0, 64, 64); sx.strokeStyle = 'rgba(120,96,60,0.35)'; sx.lineWidth = 1.2;
    for (let k = 1; k < 6; k++) { sx.beginPath(); sx.moveTo(k * 64 / 6, 0); sx.lineTo(k * 64 / 6, 64); sx.stroke(); sx.beginPath(); sx.moveTo(0, k * 64 / 6); sx.lineTo(64, k * 64 / 6); sx.stroke(); }
    const stx = new THREE.CanvasTexture(sc); stx.colorSpace = THREE.SRGBColorSpace;
    const sail = mesh(sailG, new THREE.MeshStandardMaterial({ map: stx, side: THREE.DoubleSide, roughness: 0.9 }), yard); sail.receiveShadow = true;
    // 앞돛대 (아르테몬): 앞으로 기운 작은 돛대와 작은 돛
    const fm = new THREE.Group(); fm.position.set(L * 0.78, deckY, 0); fm.rotation.z = -0.55; rock.add(fm);
    mesh(new THREE.CylinderGeometry(0.01 * S, 0.012 * S, 0.5 * S, 6), dark, fm, [0, 0.25 * S, 0]);
    const fs = mesh(new THREE.PlaneGeometry(0.28 * S, 0.22 * S), new THREE.MeshStandardMaterial({ map: stx, side: THREE.DoubleSide, roughness: 0.9 }), fm, [0.02 * S, 0.36 * S, 0.02 * S]); fs.rotation.set(0, Math.PI / 2, 0.55);
    // 밧줄: 돛대 꼭대기에서 이물·고물로
    const line = (a, b) => { const d = new THREE.Vector3().subVectors(b, a), c = mesh(new THREE.CylinderGeometry(0.003, 0.003, d.length(), 4), dark, rock); c.position.copy(a).add(b).multiplyScalar(0.5); c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); c.castShadow = false; };
    const mt = new THREE.Vector3(MX, deckY + MH, 0); line(mt, new THREE.Vector3(L * 0.95, deckY + 0.03, 0)); line(mt, new THREE.Vector3(-L * 0.9, deckY + 0.2 * S, 0));
    [-1, 1].forEach(s => line(mt, new THREE.Vector3(MX - 0.05, deckY, s * B * 0.95)));
    // 노 (o.oars: 한쪽 노 수) — 바람이 없을 때 젓는 노
    const oars = [];
    for (let i = 0; i < (o.oars || 0); i++) [-1, 1].forEach(s => { const a = new THREE.Group(); a.position.set(-L * 0.45 + i * L * 0.9 / Math.max(1, o.oars - 1), deckY - 0.02, s * B * 0.98); rock.add(a);
      const r = mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.42 * S, 5), dark, a, [0, -0.1 * S, s * 0.16 * S]); r.rotation.x = s * 1.05; oars.push({ a, s, i }); });
    const deck = new THREE.Group(); deck.position.y = deckY + 0.01; rock.add(deck);
    let furl = o.state === 'furled' ? 1 : 0;
    const P = new Prop(g, (P, t, dt, env) => {
      const wv = env.waveNow || 0;
      rock.rotation.x = Math.sin(t * 1.1) * (0.015 + wv * 0.14); // 옆으로 구르기 (배 길이가 x라 옆놀이는 x축)
      rock.rotation.z = Math.sin(t * 0.8 + 1) * (0.01 + wv * 0.08); // 앞뒤 끄덕임
      rock.position.y = Math.sin(t * 1.4) * (0.006 + wv * 0.04) + wv * 0.04;
      furl = damp(furl, P.state === 'furled' ? 1 : 0, 1.5, dt);
      sail.scale.y = Math.max(0.06, 1 - furl * 0.94); sail.scale.z = 1 + (P.moving ? 0.35 : 0) * (1 - furl) + wv * 0.4 * (1 - furl);
      fs.visible = furl < 0.6;
      oars.forEach(r => { r.a.rotation.z = Math.sin(t * 2.2) * 0.35; r.a.rotation.y = Math.cos(t * 2.2) * 0.08 * r.s; });
    }, { state: o.state || 'sail' });
    P.deck = deck;
    P.directional = !!o.directional;
    return P;
  },
});

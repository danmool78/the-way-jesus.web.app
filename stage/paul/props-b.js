/* 바울 여정 묶음 b(a12–a21)의 소품: props.js의 MAKERS에 더한다 (props.js를 키우지 않게 — paul.js가 import).
   크기는 사람 키(약 0.88)와의 비례로. 무대 x는 오른쪽(+, 동쪽), z는 앞(+, 화면 아래).
   desk(편지 쓰는 낮은 상 — 받아 적는 줄이 늘고 끝에 큰 글씨), stocks(발 족쇄), jail(빌립보의 깊은 감옥 — 지진에 흔들리고 문이 열린다),
   purple(루디아의 자색 옷감), areopagus(아레오바고 바위 언덕), acropolis(먼 아크로폴리스), altarG(알지 못하는 신에게 새긴 제단),
   statues(받침 위의 신상들 — 얼굴 없는 흰 윤곽), tentshop(천막 깁는 일터), dream(밤의 환상 — 부드러운 빛무리) */
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
// 작은 질그릇 등잔과 흔들리는 불빛 (밤에 편지를 쓰는 상 곁)
const oilLamp = (parent, pos) => {
  const l = new THREE.Group(); l.position.set(...pos); parent.add(l);
  mesh(lathe([[0.001, 0], [0.03, 0], [0.034, 0.012], [0.02, 0.022], [0.001, 0.022]], 12), mat('#a8673e', { roughness: 0.9 }), l, [0, 0, 0], [1, 1, 0.75]);
  const f = mesh(new THREE.ConeGeometry(0.008, 0.026, 6), new THREE.MeshBasicMaterial({ color: '#ffc060' }), l, [0.028, 0.034, 0]); f.castShadow = false;
  const h = glow(0.28, 0.7, '#ffb050'); h.position.set(0.028, 0.035, 0); l.add(h);
  const L = new THREE.PointLight('#ffb860', 0.9, 1.3, 1.6); L.position.set(0.028, 0.12, 0.05); l.add(L);
  return { f, h, L };
};

Object.assign(MAKERS, {
  /* ---------- 편지 ---------- */

  // 편지 쓰는 낮은 상 (갈 6:11 '내 손으로 너희에게 이렇게 큰 글자로 쓴 것을 보라', 살전·살후): 낮은 나무 상 위의 파피루스 한 장, 먹 단지와 갈대 붓, 말아 둔 두루마리.
  // state 'idle'(빈 종이) | 'write'(받아 적는 잔글씨 줄이 하나씩 늘고 붓이 움직인다) | 'done'(다 쓴 종이) | 'big'(끝에 손수 쓴 큰 글씨가 더해진다).
  // o.lamp 등잔(밤), o.scroll이면 종이 대신 펼친 두루마리(베뢰아에서 날마다 상고한 성경 — 줄이 처음부터 다 있다). 앉은 사람(sit-ground)은 상의 뒤(-z)나 옆에
  desk(o = {}) {
    const g = new THREE.Group(), w = wood(), H = 0.15, W = o.w || 0.46, D = 0.26;
    mesh(new THREE.BoxGeometry(W, 0.022, D), w, g, [0, H, 0]).receiveShadow = true;
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, b]) => mesh(new THREE.BoxGeometry(0.025, H, 0.025), w, g, [a * (W / 2 - 0.03), H / 2, b * (D / 2 - 0.03)]));
    const top = H + 0.012, ink = mat('#2a2018', { roughness: 0.6 });
    // 종이(또는 펼친 두루마리)
    const paper = mat('#efe2bf', { roughness: 0.95 }), sheet = new THREE.Group(); sheet.position.set(-0.03, top, 0.0); g.add(sheet);
    const SW = o.scroll ? 0.3 : 0.2, SD = o.scroll ? 0.15 : 0.17;
    mesh(new THREE.BoxGeometry(SW, 0.003, SD), paper, sheet, [0, 0.0015, 0]).receiveShadow = true;
    if (o.scroll) [-1, 1].forEach(k => mesh(new THREE.CylinderGeometry(0.016, 0.016, SD + 0.02, 10), paper, sheet, [k * (SW / 2 + 0.012), 0.016, 0]).rotation.x = Math.PI / 2);
    // 잔글씨 줄 — 앞(+z, 쓰는 사람이 상 뒤에 앉으면 아래쪽)부터가 아니라 위(-z)에서 아래로 쓴다
    const N = o.scroll ? 8 : 9, lines = [];
    for (let i = 0; i < N; i++) {
      const col = o.scroll ? (i % 2 ? 1 : -1) : 0, lw = o.scroll ? SW * 0.4 : SW * 0.82;
      const l = mesh(new THREE.BoxGeometry(lw, 0.0015, 0.0055), ink, sheet, [col * SW * 0.23, 0.0035, -SD / 2 + 0.018 + (o.scroll ? Math.floor(i / 2) * 0.03 : i * 0.0135)]);
      l.castShadow = false; l.userData.x0 = l.position.x - lw / 2; l.userData.lw = lw; lines.push(l);
    }
    // 손수 쓴 큰 글씨 (갈 6:11) — 굵고 큰 몇 획
    const bigG = new THREE.Group(); bigG.position.set(0, 0.0035, SD / 2 - 0.035); sheet.add(bigG);
    [[-0.07, 0.3], [-0.04, -0.4], [-0.005, 0.1], [0.03, 0.5], [0.06, -0.2]].forEach(([x, r]) => { const b = mesh(new THREE.BoxGeometry(0.008, 0.002, 0.04), ink, bigG, [x, 0, 0]); b.rotation.y = r; b.castShadow = false; });
    mesh(new THREE.BoxGeometry(0.13, 0.002, 0.007), ink, bigG, [0, 0, 0.024]).castShadow = false;
    // 먹 단지·갈대 붓·말아 둔 두루마리
    mesh(new THREE.CylinderGeometry(0.018, 0.02, 0.03, 10), mat('#5a4a3a', { roughness: 0.7 }), g, [W / 2 - 0.06, top + 0.015, -0.07]);
    const pen = new THREE.Group(); g.add(pen);
    const pm = mesh(new THREE.CylinderGeometry(0.0035, 0.0025, 0.12, 5), mat('#c8a860', { roughness: 0.6 }), pen, [0, 0.05, 0]); pm.rotation.z = 0.5; pm.castShadow = false;
    if (!o.scroll) [0, 1].forEach(i => mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.13, 10), paper, g, [W / 2 - 0.07 - i * 0.015, top + 0.018 + i * 0.03, 0.06]).rotation.z = Math.PI / 2);
    const lamp = o.lamp ? oilLamp(g, [-W / 2 + 0.05, top, -0.08]) : null;
    let k = o.state === 'done' || o.state === 'big' || o.scroll ? N : 0, bigK = o.state === 'big' ? 1 : 0;
    const P = new Prop(g, (P, t, dt) => {
      const writing = P.state === 'write' || (P.state === 'big' && bigK < 0.98);
      if (P.state === 'idle' && !o.scroll) k = 0;
      else if (P.state === 'write') k = Math.min(N, k + dt * 0.9);
      else k = N;
      bigK = P.state === 'big' ? Math.min(1, bigK + dt * 0.35) : 0;
      lines.forEach((l, i) => { const s = THREE.MathUtils.clamp(k - i, 0, 1); l.visible = s > 0.02; l.scale.x = Math.max(0.02, s); l.position.x = l.userData.x0 + l.userData.lw * s / 2; });
      bigG.scale.set(Math.max(0.01, bigK), 1, Math.max(0.01, bigK)); bigG.visible = bigK > 0.02;
      // 붓: 쓰는 줄의 끝을 따라 움직이고, 쉬면 먹 단지 곁에 놓인다
      if (writing) {
        const i = Math.min(N - 1, Math.floor(k)), l = lines[i];
        const px = P.state === 'big' ? -0.07 + bigK * 0.14 : l.userData.x0 + l.userData.lw * (k - i), pz = P.state === 'big' ? SD / 2 - 0.035 : l.position.z;
        pen.position.set(sheet.position.x + px, top + 0.004 + Math.abs(Math.sin(t * 9)) * 0.01, pz + Math.sin(t * 13) * 0.004); pen.rotation.y = 0.4;
      } else { pen.position.set(W / 2 - 0.06, top + 0.03, -0.035); pen.rotation.y = -0.6; }
      if (lamp) { const f = (1 + Math.sin(t * 11) * 0.07 + Math.sin(t * 17) * 0.04) * P.show; lamp.f.scale.y = f; lamp.h.material.opacity = 0.7 * f; lamp.L.intensity = 0.9 * f; }
    }, { state: o.state || (o.scroll ? 'done' : 'idle') });
    return P;
  },

  /* ---------- 빌립보의 감옥 ---------- */

  // 발 족쇄 (행 16:24 '발을 차꼬에 든든히 채웠더니'): 땅에 놓인 두꺼운 나무 두 쪽과 양끝 기둥, 발목 구멍.
  // 앉은 사람(sit-ground) 바로 앞에 둔다. state 'shut' | 'open'(위쪽 나무가 들려 기운다 — 16:26). 길이 o.len (두 사람이면 0.6)
  stocks(o = {}) {
    const g = new THREE.Group(), L = o.len || 0.6, w = mat('#5e4228', { roughness: 1 }), dk = mat('#1c140c');
    mesh(new THREE.BoxGeometry(L, 0.05, 0.08), w, g, [0, 0.025, 0]).receiveShadow = true;
    [-1, 1].forEach(s => mesh(new THREE.BoxGeometry(0.05, 0.16, 0.1), w, g, [s * (L / 2 + 0.02), 0.08, 0]));
    const up = new THREE.Group(); up.position.set(-L / 2, 0.05, 0); g.add(up);
    mesh(new THREE.BoxGeometry(L, 0.045, 0.08), w, up, [L / 2, 0.0225, 0]);
    const n = Math.max(2, Math.round(L / 0.15));
    for (let i = 0; i < n; i++) mesh(new THREE.CircleGeometry(0.018, 10), dk, g, [-L / 2 + (i + 0.5) * L / n, 0.05, 0.041]).castShadow = false;
    // 쇠 띠
    [-1, 1].forEach(s => mesh(new THREE.BoxGeometry(0.02, 0.1, 0.085), mat('#4a4a46', { roughness: 0.6 }), g, [s * L * 0.3, 0.05, 0]));
    let k = o.state === 'open' ? 1 : 0;
    return new Prop(g, (P, t, dt) => { k = damp(k, P.state === 'open' ? 1 : 0, 2.2, dt); up.rotation.z = k * 0.55; up.position.y = 0.05 + k * 0.03; }, { state: o.state || 'shut' });
  },

  // 빌립보의 깊은 옥 (행 16:23–26): 어두운 돌바닥과 세 벽(뒤 벽에 높은 쇠창살 창, 벽의 사슬 고리), 앞은 사람을 가리지 않게 가는 쇠창살만,
  // 오른쪽(o.door) 창살 문이 열린다. state 'shut' | 'quake'(땅이 흔들리고 천장에서 흙먼지가 떨어지며 문이 열리고 사슬이 풀려 떨어진다 — 4초쯤 뒤 잦아든다) | 'open'.
  // o.chains: 사슬 고리 자리 x들 (뒤 벽, 사슬이 늘어져 앉은 죄수의 손목께로). o.lit 안의 흐린 등잔빛. W 너비(기본 1.9), D 깊이 0.85, 벽 높이 0.74
  jail(o = {}) {
    const g = new THREE.Group(), sh = new THREE.Group(); g.add(sh);
    const W = o.w || 1.9, D = 0.85, H = 0.74, st = stoneM('#8a8070'), st2 = stoneM('#6e665a'), iron = mat('#3a3630', { roughness: 0.55 }), dk = mat('#14100c');
    mesh(new THREE.BoxGeometry(W, 0.02, D), mat('#5a5248', { roughness: 1 }), sh, [0, 0.01, 0]).receiveShadow = true;
    // 마름돌 결의 뒷벽
    const c = document.createElement('canvas'); c.width = 128; c.height = 64; const x = c.getContext('2d');
    x.fillStyle = '#8a8070'; x.fillRect(0, 0, 128, 64); x.strokeStyle = 'rgba(30,24,18,0.5)'; x.lineWidth = 1.5;
    for (let r = 0; r < 4; r++) { x.beginPath(); x.moveTo(0, r * 16); x.lineTo(128, r * 16); x.stroke(); for (let q = 0; q < 4; q++) { const xx = q * 32 + (r % 2) * 16; x.beginPath(); x.moveTo(xx, r * 16); x.lineTo(xx, r * 16 + 16); x.stroke(); } }
    const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(W * 2.4, H * 2.4);
    const face = new THREE.MeshStandardMaterial({ map: tx, roughness: 1 });
    mesh(new THREE.BoxGeometry(W + 0.12, H, 0.1), [st, st, st, st, face, st], sh, [0, H / 2, -D / 2 - 0.05]).receiveShadow = true;
    [-1, 1].forEach(s => mesh(new THREE.BoxGeometry(0.1, H, D + 0.1), st2, sh, [s * (W / 2 + 0.01), H / 2, 0]).receiveShadow = true);
    // 높은 창 (달빛 한 줄기)
    mesh(new THREE.BoxGeometry(0.2, 0.1, 0.02), dk, sh, [-W * 0.18, H - 0.12, -D / 2 + 0.005]);
    for (let i = 0; i < 4; i++) mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.1, 4), iron, sh, [-W * 0.18 - 0.075 + i * 0.05, H - 0.12, -D / 2 + 0.02]);
    // 금 간 자리 (지진 뒤에 보인다)
    const crack = new THREE.Group(); crack.position.set(W * 0.22, H * 0.55, -D / 2 + 0.003); sh.add(crack);
    [[0, 0, 0.6, 0.16], [0.03, -0.07, -0.4, 0.12], [-0.02, 0.08, 0.2, 0.1]].forEach(([a, b, r, l]) => { const m = mesh(new THREE.BoxGeometry(0.008, l, 0.004), dk, crack, [a, b, 0]); m.rotation.z = r; m.castShadow = false; });
    // 앞 창살: 위 들보와 가는 쇠창살 — 오른쪽 문(o.door 자리, 너비 0.42)은 경첩을 축으로 열린다
    const DX = o.door ?? W / 2 - 0.3, DW = 0.42;
    mesh(new THREE.BoxGeometry(W + 0.12, 0.06, 0.08), st2, sh, [0, H - 0.03, D / 2]);
    for (let bx = -W / 2 + 0.05; bx < W / 2; bx += 0.085) if (Math.abs(bx - DX) > DW / 2 + 0.01) mesh(new THREE.CylinderGeometry(0.0065, 0.0065, H - 0.06, 5), iron, sh, [bx, (H - 0.06) / 2, D / 2]).castShadow = false;
    const door = new THREE.Group(); door.position.set(DX - DW / 2, 0, D / 2 + 0.01); sh.add(door);
    for (let i = 0; i < 6; i++) mesh(new THREE.CylinderGeometry(0.0075, 0.0075, H - 0.08, 5), iron, door, [0.03 + i * (DW - 0.06) / 5, (H - 0.08) / 2, 0]).castShadow = false;
    [0.08, H * 0.5, H - 0.14].forEach(y => mesh(new THREE.BoxGeometry(DW, 0.02, 0.016), iron, door, [DW / 2, y, 0]));
    // 벽의 사슬: 고리에서 늘어진 사슬 (지진에 풀려 바닥에 떨어진다)
    const chains = (o.chains || []).map(cx => {
      const ch = new THREE.Group(); ch.position.set(cx, H * 0.62, -D / 2 + 0.02); sh.add(ch);
      mesh(new THREE.TorusGeometry(0.02, 0.006, 5, 10), iron, sh, [cx, H * 0.62, -D / 2 + 0.012]);
      for (let i = 0; i < 7; i++) { const l = mesh(new THREE.TorusGeometry(0.014, 0.004, 4, 8), iron, ch, [0, -0.02 - i * 0.024, 0.02 + i * 0.012]); l.rotation.y = (i % 2) * Math.PI / 2; l.castShadow = false; }
      return ch;
    });
    // 흙먼지: 천장 높이에서 떨어지는 알갱이
    const dm = new THREE.MeshBasicMaterial({ color: '#cbbfa8', transparent: true, opacity: 0, depthWrite: false });
    const dust = Array.from({ length: 26 }, (_, i) => { const d = mesh(new THREE.SphereGeometry(0.008 + (i % 3) * 0.004, 5, 4), dm, sh); d.castShadow = false;
      d.userData = { x: ((i * 0.618) % 1 - 0.5) * W * 0.9, z: ((i * 0.381) % 1 - 0.5) * D * 0.8, s: (i * 0.137) % 1 }; return d; });
    let light = null;
    if (o.lit) { light = new THREE.PointLight('#c8b088', 0.8, 2.2, 1.4); light.position.set(-W * 0.18, H - 0.2, -0.1); sh.add(light); }
    let open = o.state === 'open' ? 1 : 0, shake = 0;
    const P = new Prop(g, (P, t, dt) => {
      const q = P.state === 'quake', u = q ? performance.now() / 1000 - P.t0 : 99;
      shake = q ? Math.max(0, 1 - u / 4.5) : damp(shake, 0, 3, dt);
      sh.position.set(Math.sin(t * 41) * 0.018 * shake, Math.abs(Math.sin(t * 29)) * 0.008 * shake, Math.sin(t * 37 + 1) * 0.01 * shake);
      sh.rotation.z = Math.sin(t * 23) * 0.012 * shake;
      open = damp(open, P.state === 'open' || (q && u > 1.0) ? 1 : 0, 1.6, dt);
      door.rotation.y = open * 1.7 + Math.sin(t * 30) * 0.05 * shake;
      chains.forEach((ch, i) => { ch.position.y = H * 0.62 - open * (H * 0.62 - 0.03) * Math.min(1, open * 1.4); ch.rotation.x = open * 1.45; ch.rotation.z = Math.sin(t * 20 + i) * 0.3 * shake; });
      crack.visible = open > 0.3;
      dm.opacity = Math.min(0.9, shake * 1.4) * P.show;
      dust.forEach(d => { const v = (t * 0.7 + d.userData.s) % 1; d.position.set(d.userData.x, H * (1 - v), d.userData.z); d.visible = shake > 0.02; });
      if (light) light.intensity = 0.8 * P.show;
    }, { state: o.state || 'shut' });
    return P;
  },

  /* ---------- 빌립보 강가 ---------- */

  // 루디아의 자색 옷감 (행 16:14): 깔개 위에 쌓은 자색 옷감 필(짙고 옅은 세 빛깔)과 낮은 나무 횃대에 걸쳐 늘어뜨린 한 필, 작은 바구니
  purple(o = {}) {
    const g = new THREE.Group(), cols = ['#5a1f4e', '#7a2a66', '#94407e', '#6b2a5e'], cloth = c => mat(c, { ...DS, roughness: 0.85 });
    mesh(new THREE.BoxGeometry(0.42, 0.008, 0.26), mat('#c8b48c', { roughness: 1 }), g, [0, 0.004, 0]).receiveShadow = true;
    for (let i = 0; i < 4; i++) mesh(new THREE.BoxGeometry(0.16, 0.035, 0.1), cloth(cols[i]), g, [-0.08 + (i % 2) * 0.01, 0.026 + i * 0.035, 0.0 + (i % 2) * 0.012]).rotation.y = (i % 3 - 1) * 0.1;
    [0, 1].forEach(i => mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.18, 12), cloth(cols[i + 1]), g, [0.11, 0.035, -0.05 + i * 0.1]).rotation.z = Math.PI / 2);
    // 횃대와 늘어뜨린 천
    const R = new THREE.Group(); R.position.set(0.02, 0, -0.2); g.add(R);
    [-1, 1].forEach(s => mesh(new THREE.CylinderGeometry(0.008, 0.01, 0.34, 6), wood(), R, [s * 0.16, 0.17, 0]));
    mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.36, 6), wood(), R, [0, 0.33, 0]).rotation.z = Math.PI / 2;
    const dg = new THREE.PlaneGeometry(0.3, 0.28, 6, 6), dp = dg.attributes.position;
    for (let i = 0; i < dp.count; i++) dp.setZ(i, Math.sin(dp.getX(i) * 30) * 0.012);
    dg.computeVertexNormals();
    mesh(dg, cloth('#7a2a66'), R, [0, 0.19, 0.01]);
    mesh(lathe([[0.001, 0], [0.04, 0], [0.05, 0.05], [0.05, 0.06], [0.001, 0.02]], 14), mat('#a07a44', { ...DS, roughness: 1 }), g, [0.17, 0.008, 0.08]);
    return new Prop(g);
  },

  /* ---------- 아테네 ---------- */

  // 아레오바고 바위 언덕 (행 17:19–22): 반들거리는 회색 석회암 바위 — 앞(+z)으로 깎은 돌계단, 위는 평평하고 뒤쪽에 반원 돌 의자(의회가 앉는 곳).
  // 위에 선 사람은 저절로 그 높이에(heightAt — 위 높이 o.h 기본 0.24, 비탈은 고르게). o.r 위 반지름
  areopagus(o = {}) {
    const g = new THREE.Group(), RT = o.r || 0.75, RB = RT + 0.32, H = o.h || 0.24, rock = mat('#b4ab9a', { roughness: 1, flatShading: true });
    const geo = new THREE.CylinderGeometry(RT, RB, H, 28, 2), p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), y = p.getY(i), a = Math.atan2(z, x), n = 1 + Math.sin(a * 5) * 0.06 + Math.sin(a * 11 + 1) * 0.04;
      p.setX(i, x * n); p.setZ(i, z * n * 0.62); if (y < H / 2 - 0.01) p.setY(i, y + Math.sin(a * 7) * 0.01); }
    geo.computeVertexNormals();
    mesh(geo, rock, g, [0, H / 2, 0]).receiveShadow = true;
    // 위의 반원 돌 의자 (뒤쪽)
    const st = stoneM('#c8bfae');
    for (let i = 0; i <= 8; i++) { const a = Math.PI + (i / 8) * Math.PI, r = RT * 0.82, b = mesh(new THREE.BoxGeometry(0.2, 0.09, 0.14), st, g, [Math.cos(a) * r, H + 0.045, Math.sin(a) * r * 0.62]); b.rotation.y = -a - Math.PI / 2; b.receiveShadow = true; }
    // 앞 돌계단 (바위를 깎은 층계)
    for (let i = 0; i < 3; i++) mesh(new THREE.BoxGeometry(0.34, H * (3 - i) / 3, 0.1), stoneM('#a89e8c'), g, [RT * 0.15, H * (3 - i) / 6, RT * 0.62 + 0.06 + i * 0.1]).receiveShadow = true;
    // 둘레의 바위 조각
    [[RB * 0.95, 0.1, 0.07], [-RB * 0.9, 0.2, 0.06], [-RB * 0.5, RB * 0.55, 0.05]].forEach(([x, z, r]) => mesh(new THREE.DodecahedronGeometry(r, 0), rock, g, [x, r * 0.4, z], [1, 0.6, 0.9]));
    const P = new Prop(g);
    P.heightAt = (x, z) => {
      if (P.show < 0.5) return 0;
      const u = (x - g.position.x) / g.scale.x, v = (z - g.position.z) / g.scale.z / 0.62, r = Math.hypot(u, v);
      return (r < RT ? H : r < RB ? H * (RB - r) / (RB - RT) : 0) * g.scale.y;
    };
    return P;
  },

  // 먼 아크로폴리스 (아테네): 무대 뒤쪽 낮은 바위산과 둘레 성벽, 위의 큰 신전(파르테논). 신상은 두지 않는다. o.big 크기
  acropolis(o = {}) {
    const g = new THREE.Group(), S = o.big || 1, rock = mat('#bdb3a0', { roughness: 1, flatShading: true });
    const geo = new THREE.CylinderGeometry(0.75 * S, 1.0 * S, 0.34 * S, 20, 1), p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const a = Math.atan2(p.getZ(i), p.getX(i)), n = 1 + Math.sin(a * 4) * 0.08; p.setX(i, p.getX(i) * n); p.setZ(i, p.getZ(i) * n * 0.45); }
    geo.computeVertexNormals();
    mesh(geo, rock, g, [0, 0.17 * S, 0]).receiveShadow = true;
    const wall = stoneM('#d2c6ae');
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, w = mesh(new THREE.BoxGeometry(0.32 * S, 0.07 * S, 0.03 * S), wall, g, [Math.cos(a) * 0.72 * S, 0.37 * S, Math.sin(a) * 0.32 * S]); w.rotation.y = -a + Math.PI / 2; }
    const T = inner(g, 'gtemple', { w: 0.9, d: 0.5 }, [0.08 * S, 0.34 * S, -0.04 * S]); T.obj.scale.setScalar(0.62 * S);
    return new Prop(g);
  },

  // '알지 못하는 신에게' 새긴 제단 (행 17:23): 흰 대리석 네모 제단, 앞면에 헬라 글자 ΑΓΝΩΣΤΩ ΘΕΩ, 위 테두리와 둥근 장식
  altarG(o = {}) {
    const g = new THREE.Group(), m = marble();
    const c = document.createElement('canvas'); c.width = 256; c.height = 128; const x = c.getContext('2d');
    x.fillStyle = '#ece6d8'; x.fillRect(0, 0, 256, 128); x.strokeStyle = '#b8ab90'; x.lineWidth = 6; x.strokeRect(10, 10, 236, 108);
    x.fillStyle = '#4a3e30'; x.font = 'bold 38px serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText('ΑΓΝΩΣΤΩ', 128, 46); x.fillText('ΘΕΩ', 128, 88);
    const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace;
    const front = new THREE.MeshStandardMaterial({ map: tx, roughness: 0.7 });
    mesh(new THREE.BoxGeometry(0.38, 0.03, 0.26), stoneM('#d2c8b2'), g, [0, 0.015, 0]).receiveShadow = true;
    mesh(new THREE.BoxGeometry(0.3, 0.24, 0.2), [m, m, m, m, front, m], g, [0, 0.15, 0]);
    mesh(new THREE.BoxGeometry(0.34, 0.035, 0.24), m, g, [0, 0.285, 0]);
    [-1, 1].forEach(s => mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.24, 10), m, g, [s * 0.15, 0.325, 0]).rotation.x = Math.PI / 2);
    return new Prop(g);
  },

  // 받침 위의 신상들 (행 17:16 '우상이 가득한 것을 보고'): 높은 받침돌 위에 얼굴 없이 옷자락만 흐르는 흰 대리석·놋 윤곽 — o.spots [[x, z, 높이 배율]…]
  statues(o = {}) {
    const g = new THREE.Group(), mats = [marble(), mat('#9a7a4a', { metalness: 0.3, roughness: 0.5 }), mat('#e2dccb', { roughness: 0.7 })];
    (o.spots || [[0, 0, 1]]).forEach(([x, z, s = 1], i) => {
      const b = new THREE.Group(); b.position.set(x, 0, z); b.scale.setScalar(s); g.add(b);
      mesh(new THREE.BoxGeometry(0.16, 0.22, 0.16), stoneM('#cfc4ac'), b, [0, 0.11, 0]).receiveShadow = true;
      mesh(new THREE.BoxGeometry(0.19, 0.025, 0.19), stoneM('#cfc4ac'), b, [0, 0.232, 0]);
      const m = mats[i % mats.length];
      mesh(lathe([[0.001, 0], [0.06, 0], [0.055, 0.06], [0.045, 0.16], [0.05, 0.22], [0.035, 0.26], [0.015, 0.27], [0.001, 0.27]], 14), m, b, [0, 0.245, 0]);
      mesh(sphere(0.032, 12, 10), m, b, [0, 0.545, 0]);
      if (i % 2) { const a = mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.2, 5), m, b, [0.06, 0.48, 0]); a.rotation.z = -0.5; } // 든 팔(창·횃불의 윤곽)
    });
    return new Prop(g);
  },

  /* ---------- 고린도 ---------- */

  // 천막 깁는 일터 (행 18:3): 네 기둥에 친 검은 염소털 차양(줄무늬), 땅에 펴서 깁는 천막 천, 말아 둔 천과 가죽 걸이, 송곳·실 바구니.
  // 앉아 일하는 사람은 펼친 천 둘레에 sit-ground. o.w 너비(기본 1.1), 앞(+z)이 트였다
  tentshop(o = {}) {
    const g = new THREE.Group(), W = o.w || 1.1, D = 0.7, H = 0.86;
    const c = document.createElement('canvas'); c.width = 64; c.height = 64; const x = c.getContext('2d');
    x.fillStyle = '#3a2e26'; x.fillRect(0, 0, 64, 64); x.fillStyle = '#5a4a3a'; for (let i = 0; i < 64; i += 16) x.fillRect(i, 0, 6, 64);
    const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(W * 2, 1);
    const hair = new THREE.MeshStandardMaterial({ map: tx, side: THREE.DoubleSide, roughness: 1 });
    [[-1, -1, H], [1, -1, H], [-1, 1, H * 0.82], [1, 1, H * 0.82]].forEach(([a, b, h]) => mesh(new THREE.CylinderGeometry(0.014, 0.016, h, 6), wood(), g, [a * W / 2, h / 2, b * D / 2]));
    const roof = mesh(new THREE.PlaneGeometry(W + 0.1, D + 0.12, 8, 1), hair, g, [0, H * 0.91, 0]); roof.rotation.x = -Math.PI / 2 + 0.24; roof.receiveShadow = true;
    // 늘어뜨린 앞 처마 (조금 물결)
    const fg = new THREE.PlaneGeometry(W + 0.1, 0.08, 10, 1), fp = fg.attributes.position;
    for (let i = 0; i < fp.count; i++) fp.setY(i, fp.getY(i) + (fp.getY(i) < 0 ? Math.sin(fp.getX(i) * 18) * 0.012 : 0));
    mesh(fg, hair, g, [0, H * 0.82 - 0.04, D / 2 + 0.06]);
    // 뒤쪽 낮은 벽과 걸어 둔 가죽
    mesh(new THREE.BoxGeometry(W, 0.4, 0.05), stoneM('#c9b08a'), g, [0, 0.2, -D / 2 - 0.02]).receiveShadow = true;
    [[-0.3, '#8a5a32'], [-0.1, '#a0703e'], [0.25, '#6a4a2a']].forEach(([hx, col]) => mesh(new THREE.BoxGeometry(0.16, 0.22, 0.01), mat(col, { roughness: 1 }), g, [hx * W, 0.42, -D / 2 + 0.01]));
    mesh(new THREE.CylinderGeometry(0.006, 0.006, W * 0.8, 5), wood(), g, [0, 0.54, -D / 2 + 0.02]).rotation.z = Math.PI / 2;
    // 땅에 펴 놓고 깁는 천 (두 폭을 잇는 솔기)
    const sp = mesh(new THREE.BoxGeometry(0.62, 0.008, 0.34), mat('#2e2620', { roughness: 1 }), g, [0, 0.006, 0.05]); sp.receiveShadow = true;
    mesh(new THREE.BoxGeometry(0.004, 0.01, 0.34), mat('#b8a07a'), g, [0.0, 0.011, 0.05]);
    mesh(new THREE.BoxGeometry(0.6, 0.009, 0.004), mat('#5a4a3a'), g, [0, 0.011, 0.05]);
    // 말아 둔 천과 실 바구니
    [0, 1, 2].forEach(i => mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.24, 12), mat(i === 1 ? '#4a3a2e' : '#2e2620', { roughness: 1 }), g, [-W / 2 + 0.16, 0.04 + (i === 2 ? 0.07 : 0), -0.12 + (i % 2) * 0.09]).rotation.x = Math.PI / 2);
    mesh(lathe([[0.001, 0], [0.04, 0], [0.05, 0.045], [0.05, 0.055], [0.001, 0.02]], 14), mat('#a07a44', { ...DS, roughness: 1 }), g, [W / 2 - 0.14, 0.006, 0.18]);
    [0, 1].forEach(i => mesh(sphere(0.016, 8, 6), mat(i ? '#d8c49a' : '#8a6a42'), g, [W / 2 - 0.15 + i * 0.03, 0.04, 0.18]));
    return new Prop(g);
  },

  /* ---------- 밤의 환상 ---------- */

  // 꿈의 빛무리 (행 16:9 드로아의 환상): 서 있는 사람(빛의 실루엣) 둘레로 부드럽게 숨 쉬는 푸르스름한 흰 빛과 엷은 안개 고리.
  // 하늘에서 내리꽂히는 빛(beam)과 다르게 땅에서 떠오르는 둥근 빛 — 하나님의 모습이 아니라 꿈속의 사람을 감싼다
  dream(o = {}) {
    const g = new THREE.Group(), R = o.r || 0.5;
    const core = glow(R * 3.2, 0, '#dfe8ff'); core.position.y = 0.48; g.add(core);
    const halo = glow(R * 5, 0, '#9fb4ff'); halo.position.y = 0.5; g.add(halo);
    const motes = Array.from({ length: 10 }, (_, i) => { const s = glow(0.12, 0, '#eef2ff'); g.add(s); s.userData = { a: i / 10 * Math.PI * 2, r: R * (0.7 + (i % 3) * 0.15), y: 0.2 + (i % 4) * 0.2 }; return s; });
    const L = new THREE.PointLight('#c8d4ff', 0, 2.2, 1.3); L.position.y = 0.6; g.add(L);
    return new Prop(g, (P, t) => {
      const b = P.show * (0.85 + Math.sin(t * 1.6) * 0.15);
      core.material.opacity = 0.4 * b; halo.material.opacity = 0.25 * b; L.intensity = 1.2 * b;
      motes.forEach(m => { const u = m.userData, a = u.a + t * 0.35; m.position.set(Math.cos(a) * u.r, u.y + Math.sin(t + u.a) * 0.05, Math.sin(a) * u.r * 0.5); m.material.opacity = 0.7 * b; });
    }, { fade: 'none' });
  },
});

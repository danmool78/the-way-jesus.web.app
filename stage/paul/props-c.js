/* 바울 여정 묶음 c(a22–a32)에만 쓰는 소품: props.js의 MAKERS에 더한다 (stage/paul/c.js가 import).
   에베소의 두란노 서원(schola)·편지 쓰는 상(scribedesk)·불사르는 마술책(bookfire)·은돈(silverheap)·은 신전 모형(shrines)·큰 극장(theater),
   질그릇(clayjar), 드로아의 삼층 다락방(upperroom3), 아가보의 허리띠(beltbind), 안토니아 요새의 층계(fortstairs), 말(horse).
   크기는 사람 키(약 0.88)와의 비례로. 앞(+z)이 화면 아래 */
import { THREE, mat, DS, mesh, sphere, glowTexture, damp } from '../kit.js';
import { MAKERS, Prop } from '../props.js';

const wood = () => mat('#7a5634', { roughness: 0.95 });
const marble = () => mat('#ece6d8', { roughness: 0.7 });
const stoneM = (c = '#d8c8a6') => mat(c, { roughness: 0.95 });
const glow = (size, opacity = 1, color) => {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity, ...(color ? { color } : {}) }));
  s.scale.set(size, size, 1);
  return s;
};
const column = (parent, x, z, h, r, m) => {
  mesh(new THREE.BoxGeometry(r * 2.6, 0.03, r * 2.6), m, parent, [x, 0.015, z]);
  mesh(new THREE.CylinderGeometry(r * 0.9, r, h - 0.07, 12), m, parent, [x, 0.03 + (h - 0.07) / 2, z]);
  mesh(new THREE.BoxGeometry(r * 2.5, 0.04, r * 2.5), m, parent, [x, h - 0.02, z]);
};
// 작은 질그릇 등잔과 불꽃 (다락방에 매단 등불)
const oilLamp = (parent, x, y, z) => {
  const s = new THREE.Group(); s.position.set(x, y, z); parent.add(s);
  mesh(sphere(0.022, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), mat('#a8673e', { roughness: 0.9 }), s, [0, 0, 0], [1.4, 0.6, 1]);
  const fl = mesh(new THREE.ConeGeometry(0.008, 0.026, 6), new THREE.MeshBasicMaterial({ color: '#ffd27a' }), s, [0.024, 0.02, 0]); fl.castShadow = false;
  const h = glow(0.3, 0, '#ffc070'); h.position.set(0.024, 0.025, 0); s.add(h);
  return { fl, h };
};

Object.assign(MAKERS, {
  // 두란노 서원 (행 19:9): 뒤에 기둥 넷과 처마를 둔 강당, 뒷벽 앞 한 단 높은 선생의 자리(돌 단과 의자), 앞으로 세 줄의 긴 나무 의자(강당을 향해 뒤를 본다).
  // 의자에 앉은 사람은 pose 'sit', 배역 y 0.1. 선생의 자리는 소품 자리에서 (0, -0.42), 단 높이 0.24(heightAt). o.w 너비
  schola(o = {}) {
    const g = new THREE.Group(), W = o.w || 1.8, m = marble(), st = stoneM('#d6c8aa');
    mesh(new THREE.BoxGeometry(W + 0.2, 0.02, 1.25), stoneM('#cbbd9e'), g, [0, 0.01, -0.05]).receiveShadow = true;
    mesh(new THREE.BoxGeometry(W + 0.2, 0.62, 0.07), stoneM('#e4d8c0'), g, [0, 0.31, -0.68]).receiveShadow = true;
    for (let i = 0; i < 4; i++) column(g, -W / 2 + 0.1 + i * (W - 0.2) / 3, -0.6, 0.7, 0.03, m);
    mesh(new THREE.BoxGeometry(W + 0.24, 0.06, 0.18), m, g, [0, 0.73, -0.62]);
    // 선생의 자리: 낮은 단과 등받이 의자, 곁의 두루마리 상자
    const DH = 0.24; // 단 높이 — 낮은 시점에서도 앞줄에 앉은 사람 너머로 선생이 보이게
    mesh(new THREE.BoxGeometry(0.6, DH, 0.3), st, g, [0, DH / 2, -0.45]).receiveShadow = true;
    [0, 1].forEach(i => mesh(new THREE.BoxGeometry(0.3, DH * (2 - i) / 3, 0.08), st, g, [0, DH * (2 - i) / 6, -0.26 + i * 0.08]).receiveShadow = true); // 오르는 층계
    mesh(new THREE.BoxGeometry(0.18, 0.12, 0.14), wood(), g, [0.18, DH + 0.06, -0.52]);
    mesh(new THREE.BoxGeometry(0.18, 0.22, 0.03), wood(), g, [0.18, DH + 0.17, -0.59]);
    // 긴 의자 세 줄 (가운데 길을 두고 양쪽으로)
    [0.05, 0.3, 0.55].forEach(z => [-1, 1].forEach(s => {
      const bw = W / 2 - 0.22;
      mesh(new THREE.BoxGeometry(bw, 0.025, 0.1), wood(), g, [s * (bw / 2 + 0.12), 0.09, z]);
      [-1, 1].forEach(k => mesh(new THREE.BoxGeometry(0.025, 0.08, 0.08), wood(), g, [s * (bw / 2 + 0.12) + k * (bw / 2 - 0.04), 0.04, z]));
    }));
    const P = new Prop(g);
    P.heightAt = (x, z) => { const u = (x - g.position.x) / g.scale.x, v = (z - g.position.z) / g.scale.z; return P.show > 0.5 && Math.abs(u) < 0.29 && v > -0.6 && v < -0.31 ? DH * g.scale.y : 0; };
    return P;
  },

  // 편지를 쓰는 낮은 상 (고린도전서·후서, 로마서 — 더디오가 받아 적는다 롬 16:22): 펼친 두루마리, 먹물 단지, 갈대 붓, 말아 둔 두루마리.
  // state 'blank'(빈 두루마리) | 'write'(글줄이 한 줄씩 차오른다) | 'done'(다 쓴 글). 앉아서 쓰는 사람은 상 뒤(-z)에 pose 'sit-ground'
  scribedesk(o = {}) {
    const g = new THREE.Group(), w = wood();
    mesh(new THREE.BoxGeometry(0.4, 0.025, 0.22), w, g, [0, 0.12, 0]);
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, b]) => mesh(new THREE.BoxGeometry(0.025, 0.11, 0.025), w, g, [a * 0.17, 0.055, b * 0.08]));
    const paper = mat('#efe4c8', { roughness: 1 });
    mesh(new THREE.BoxGeometry(0.26, 0.004, 0.14), paper, g, [0, 0.135, 0.01]);
    [-1, 1].forEach(s => mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.15, 10), paper, g, [s * 0.135, 0.145, 0.01]).rotation.x = Math.PI / 2);
    const ink = mat('#3a2a20', { roughness: 1 }), lines = [];
    for (let c = 0; c < 2; c++) for (let r = 0; r < 7; r++) {
      const l = mesh(new THREE.BoxGeometry(0.1, 0.002, 0.006), ink, g, [-0.06 + c * 0.12, 0.138, -0.045 + r * 0.016]); l.castShadow = false; l.visible = false; lines.push(l);
    }
    mesh(new THREE.CylinderGeometry(0.016, 0.02, 0.03, 10), mat('#3e2a1e'), g, [0.16, 0.148, -0.06]); // 먹물 단지
    const pen = mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.12, 5), mat('#c8b070'), g, [0.12, 0.16, 0.06]); pen.rotation.set(0.3, 0, 1.2);
    mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.13, 10), paper, g, [-0.1, 0.02, 0.16]).rotation.z = Math.PI / 2; // 다 쓴 두루마리
    let k = o.state === 'done' ? 1 : 0;
    return new Prop(g, (P, t, dt) => {
      if (P.state === 'write') k = Math.min(1, k + dt * 0.07); else if (P.state === 'done') k = 1; else k = 0;
      lines.forEach((l, i) => { l.visible = k * lines.length > i + 0.2; });
    }, { state: o.state || 'blank' });
  },

  // 불살라지는 마술책 (행 19:19): 두루마리와 묶은 책이 쌓여 간다(show가 커지면 하나씩 — 사람들이 가져와 놓는다).
  // state 'idle'(쌓인 더미) | 'burn'(불꽃·연기 — 더미가 검게 타 줄어든다) | 'ash'(잿더미에 남은 불씨와 가는 연기)
  bookfire(o = {}) {
    const g = new THREE.Group(), n = o.n || 14, items = [];
    const cols = ['#e8dcbf', '#d8c8a0', '#c8a878', '#8a5a3a', '#6a3a2a', '#e0d0b0'];
    for (let i = 0; i < n; i++) {
      const a = i * 2.399, r = 0.03 + Math.sqrt(i / n) * 0.13, layer = Math.floor(i / 6);
      const b = i % 3 === 2
        ? mesh(new THREE.BoxGeometry(0.08, 0.025, 0.06), mat(cols[i % cols.length], { roughness: 1 }), g)
        : mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.11, 8), mat(cols[i % cols.length], { roughness: 1 }), g);
      if (i % 3 !== 2) b.rotation.set(Math.PI / 2, 0, a);
      b.position.set(Math.cos(a) * r * (1 - layer * 0.3), 0.02 + layer * 0.03, Math.sin(a) * r * (1 - layer * 0.3));
      b.userData.c = b.material.color.clone(); items.push(b);
    }
    const fire = new THREE.Group(); g.add(fire);
    const fm = new THREE.MeshBasicMaterial({ color: '#ffb347', transparent: true, opacity: 0, depthWrite: false });
    const flames = Array.from({ length: 7 }, (_, i) => { const f = mesh(new THREE.ConeGeometry(0.035 + (i % 3) * 0.01, 0.16 + (i % 2) * 0.08, 7), fm, fire, [Math.cos(i * 1.7) * 0.07, 0.1, Math.sin(i * 1.7) * 0.06]); f.castShadow = false; return f; });
    const core = mesh(new THREE.ConeGeometry(0.06, 0.3, 8), new THREE.MeshBasicMaterial({ color: '#fff0b0', transparent: true, opacity: 0, depthWrite: false }), fire, [0, 0.16, 0]); core.castShadow = false;
    const halo = glow(1.1, 0, '#ff9a40'); halo.position.y = 0.15; fire.add(halo);
    const light = new THREE.PointLight('#ffa040', 0, 2.2, 1.4); light.position.y = 0.3; fire.add(light);
    const sm = Array.from({ length: 8 }, (_, i) => { const s = mesh(sphere(0.07, 10, 8), new THREE.MeshStandardMaterial({ color: '#6a625a', roughness: 1, transparent: true, opacity: 0, depthWrite: false }), g); s.castShadow = false; s.userData.s = i / 8; return s; });
    let burn = 0, char = o.state === 'ash' ? 1 : 0, hot = 0;
    const black = new THREE.Color('#2a1e18');
    return new Prop(g, (P, t, dt) => {
      const on = P.state === 'burn', ash = P.state === 'ash';
      hot = damp(hot, on ? 1 : ash ? 0.15 : 0, 2, dt);
      if (on) char = Math.min(1, char + dt * 0.05); else if (!ash) char = 0;
      items.forEach((b, i) => { const k = THREE.MathUtils.clamp(P.show * n - i, 0, 1); b.visible = k > 0.02;
        const s = Math.max(1e-4, k * (1 - char * 0.55)); b.scale.set(s, s * (1 - char * 0.4), s); b.material.color.copy(b.userData.c).lerp(black, Math.min(1, char * 1.6)); });
      flames.forEach((f, i) => { f.scale.y = (0.6 + 0.4 * Math.sin(t * 9 + i * 1.3)) * hot; f.scale.x = f.scale.z = Math.max(1e-3, hot); });
      fm.opacity = Math.min(0.9, hot); core.material.opacity = hot * 0.7; core.scale.setScalar(Math.max(1e-3, hot * (1 + Math.sin(t * 12) * 0.08)));
      halo.material.opacity = hot * 0.9; light.intensity = hot * 3 * (1 + Math.sin(t * 11) * 0.08);
      sm.forEach(s => { const u = (t * 0.22 + s.userData.s) % 1; s.position.set(Math.sin(u * 5 + s.userData.s * 9) * 0.06 + u * 0.12, 0.25 + u * 1.3, Math.cos(u * 4) * 0.05);
        s.scale.setScalar(0.6 + u * 2.2); s.material.opacity = Math.max(on ? 0.5 : ash ? 0.18 : 0, 0) * (1 - u) * Math.min(1, hot * 3); });
    }, { state: o.state || 'idle', fade: 'none' });
  },

  // 은돈 무더기 (행 19:19 '은 오만'): 깔개 위에 은돈 기둥이 하나씩 쌓인다(show가 커지면 하나씩).
  // o.kind 'bags'면 동여맨 헌금 자루 (롬 15:26 마게도냐와 아가야의 헌금)
  silverheap(o = {}) {
    const g = new THREE.Group(), items = [], bags = o.kind === 'bags';
    const rug = mesh(new THREE.BoxGeometry(bags ? 0.36 : 0.3, 0.006, 0.2), mat(bags ? '#5a3a2a' : '#3e4a5a', { roughness: 1 }), g, [0, 0.003, 0]); rug.receiveShadow = true;
    const silver = mat('#d8d8d4', { metalness: 0.55, roughness: 0.3 }), leather = mat('#8a6440', { roughness: 1 }), tie = mat('#3a2a1a');
    const n = bags ? 4 : 9;
    for (let i = 0; i < n; i++) {
      const s = new THREE.Group(); s.position.set(((i % (bags ? 2 : 3)) - (bags ? 0.5 : 1)) * (bags ? 0.16 : 0.08), 0.006, (Math.floor(i / (bags ? 2 : 3)) - (bags ? 0.5 : 1)) * 0.06); g.add(s);
      if (bags) { mesh(sphere(0.06, 12, 10), leather, s, [0, 0.055, 0], [1, 1.1, 1]); mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.04, 8), leather, s, [0, 0.13, 0]); mesh(new THREE.TorusGeometry(0.022, 0.005, 4, 12), tie, s, [0, 0.12, 0]).rotation.x = Math.PI / 2; }
      else { const h = 3 + (i * 7) % 5; for (let k = 0; k < h; k++) mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.008, 12), silver, s, [((k * 3) % 2) * 0.003, 0.005 + k * 0.009, 0]); }
      items.push(s);
    }
    const sp = glow(0.45, 0, '#fffbe8'); sp.position.y = 0.06; g.add(sp);
    return new Prop(g, (P, t) => { items.forEach((s, i) => { const k = THREE.MathUtils.clamp(P.show * n - i, 0, 1); s.scale.setScalar(Math.max(1e-4, k)); s.visible = k > 0.02; });
      rug.visible = P.show > 0.02; sp.material.opacity = bags ? 0 : P.show * (0.35 + Math.sin(t * 2) * 0.1); }, { fade: 'none' });
  },

  // 은 신전 모형 (행 19:24 데메드리오의 공방): 좌판 위에 은으로 만든 작은 신전 모형들(기단·기둥·박공). 신상은 두지 않는다
  shrines(o = {}) {
    const g = new THREE.Group(), w = wood(), silver = mat('#cfcfca', { metalness: 0.6, roughness: 0.3 });
    mesh(new THREE.BoxGeometry(0.5, 0.025, 0.22), w, g, [0, 0.16, 0]);
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, b]) => mesh(new THREE.BoxGeometry(0.025, 0.16, 0.025), w, g, [a * 0.22, 0.08, b * 0.09]));
    mesh(new THREE.BoxGeometry(0.5, 0.008, 0.22), mat('#5a2a3a', { roughness: 1 }), g, [0, 0.176, 0]);
    [[-0.16, -0.03, 1], [0, -0.04, 1.2], [0.16, -0.03, 1], [-0.08, 0.06, 0.8], [0.09, 0.06, 0.8]].forEach(([x, z, s]) => {
      const t = new THREE.Group(); t.position.set(x, 0.18, z); t.scale.setScalar(s); g.add(t);
      mesh(new THREE.BoxGeometry(0.08, 0.012, 0.06), silver, t, [0, 0.006, 0]);
      [-1, 1].forEach(a => [-1, 1].forEach(b => mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.05, 6), silver, t, [a * 0.03, 0.037, b * 0.022])));
      mesh(new THREE.BoxGeometry(0.084, 0.01, 0.064), silver, t, [0, 0.066, 0]);
      const gs = new THREE.Shape(); gs.moveTo(-0.044, 0); gs.lineTo(0.044, 0); gs.lineTo(0, 0.025); gs.lineTo(-0.044, 0);
      const rf = new THREE.ExtrudeGeometry(gs, { depth: 0.064, bevelEnabled: false }); rf.translate(0, 0, -0.032); mesh(rf, silver, t, [0, 0.071, 0]);
    });
    return new Prop(g);
  },

  // 에베소의 큰 극장 (행 19:29): 앞(+z)으로 열린 말굽꼴 돌 계단석이 뒤로 갈수록 높아지고, 가운데 둥근 마당(오케스트라). 계단석 위에 작은 무리.
  // state 'empty'(빈 극장) | 'calm'(가득 찬 무리) | 'roar'(들끓어 외친다 — 무리가 들썩이고 팔을 든다). 마당 가운데는 소품 자리 (0, 0.05). o.r 바깥 반지름
  theater(o = {}) {
    const g = new THREE.Group(), R0 = 0.5, N = o.tiers || 7, R1 = o.r || 1.25, step = (R1 - R0) / N, HS = o.hs || 0.1;
    const st = stoneM('#ddd0b4');
    const pts = [new THREE.Vector2(R0, 0)];
    for (let k = 0; k < N; k++) { pts.push(new THREE.Vector2(R0 + k * step, (k + 1) * HS)); pts.push(new THREE.Vector2(R0 + (k + 1) * step, (k + 1) * HS)); }
    pts.push(new THREE.Vector2(R1, 0));
    const ang = Math.PI + 0.5, a0 = Math.PI / 2 - 0.25; // 반원보다 조금 넓게 (뒤 -z 쪽)
    const cav = mesh(new THREE.LatheGeometry(pts, 56, a0, ang), mat('#ddd0b4', { ...DS, roughness: 0.95 }), g); cav.receiveShadow = true;
    // 계단석을 나누는 통로 (방사선)
    for (let i = 1; i < 6; i++) { const a = a0 + ang * i / 6; const d = mesh(new THREE.BoxGeometry(0.025, 0.005, R1 - R0), stoneM('#b8a888'), g); d.position.set(Math.sin(a) * (R0 + R1) / 2, N * HS * 0.5 + 0.003, Math.cos(a) * (R0 + R1) / 2); d.rotation.y = a; d.rotation.x = -Math.atan2(N * HS, R1 - R0); }
    // 맨 위 회랑 담
    for (let i = 0; i < 24; i++) { const a = a0 + ang * (i + 0.5) / 24; const b = mesh(new THREE.BoxGeometry(2 * Math.PI * R1 / 24 * (ang / (2 * Math.PI)) * 2.1, 0.08, 0.05), st, g); b.position.set(Math.sin(a) * R1, N * HS + 0.04, Math.cos(a) * R1); b.rotation.y = a + Math.PI / 2; }
    // 마당과 앞 무대의 낮은 단
    const orc = mesh(new THREE.CircleGeometry(R0 - 0.02, 40), stoneM('#cbbd9e'), g, [0, 0.008, 0]); orc.rotation.x = -Math.PI / 2; orc.receiveShadow = true;
    // 무리: 계단석마다 작은 사람들
    const robes = ['#8b6f50', '#a58a5c', '#c97a3a', '#b9a07a', '#e8d0a0', '#9c7b56', '#c2a77a', '#8e6d4e', '#a3554a', '#5d6b4a', '#4f6a7d', '#d8c8a8'];
    const skins = ['#c99a74', '#b9845d', '#d6ad89', '#a87451'], hair = ['#2b1b10', '#3a2a1c', '#1d140c', '#5a4a3a'];
    const folk = [];
    for (let k = 1; k < N; k += 1) {
      const r = R0 + (k + 0.45) * step, cnt = Math.round(ang * r / 0.085);
      for (let i = 0; i < cnt; i++) {
        if ((i * 7 + k * 3) % 5 === 0) continue; // 빈자리
        const a = a0 + ang * (i + 0.5 + (k % 2) * 0.3) / cnt, p = new THREE.Group(); p.position.set(Math.sin(a) * r, k * HS + HS * 0.0, Math.cos(a) * r);
        const s = 0.74 + ((i * 13 + k) % 5) * 0.03; p.scale.setScalar(s); p.rotation.y = a + Math.PI; g.add(p);
        const j = folk.length;
        mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.32, 8), mat(robes[(j * 5) % robes.length], { roughness: 1 }), p, [0, 0.16, 0]);
        mesh(sphere(0.055, 8, 6), mat(skins[j % 4], { roughness: 0.8 }), p, [0, 0.38, 0]);
        mesh(sphere(0.058, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.5), mat(hair[(j * 3) % 4], { roughness: 1 }), p, [0, 0.39, -0.005]);
        const arm = mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.2, 5), mat(robes[(j * 5) % robes.length], { roughness: 1 }), p, [0.07, 0.42, 0]); arm.rotation.z = -0.25;
        p.userData = { arm, seed: (i * 1.37 + k * 2.1) % 6.28, base: p.position.y, order: ((i * 37 + k * 11) % 97) / 97 };
        folk.push(p);
      }
    }
    let fill = o.state === 'empty' ? 0 : 1, roar = 0;
    const P = new Prop(g, (P, t, dt) => {
      fill = damp(fill, P.state === 'empty' ? 0 : 1, 0.9, dt); roar = damp(roar, P.state === 'roar' ? 1 : 0, 3, dt);
      folk.forEach(f => { const u = f.userData, vis = fill * P.show > u.order + 0.02; f.visible = vis;
        f.position.y = u.base + roar * Math.max(0, Math.sin(t * 7 + u.seed)) * 0.03;
        u.arm.visible = roar > 0.3 && u.order < 0.75; u.arm.rotation.z = -0.2 - Math.sin(t * 6 + u.seed) * 0.25 * roar; });
    }, { state: o.state || 'calm' });
    P.heightAt = () => 0; // 마당은 땅 높이
    return P;
  },

  // 질그릇과 그 안의 보배 (고후 4:7): 투박한 흙 항아리, state 'glow'면 입에서 따스한 빛이 새어 나온다
  clayjar(o = {}) {
    const g = new THREE.Group();
    const pts = [[0.001, 0], [0.04, 0], [0.065, 0.05], [0.07, 0.1], [0.055, 0.15], [0.03, 0.18], [0.034, 0.2], [0.03, 0.2]].map(([x, y]) => new THREE.Vector2(x, y));
    mesh(new THREE.LatheGeometry(pts, 16), mat('#a8673e', { ...DS, roughness: 0.95 }), g);
    const h = glow(0.6, 0, '#ffe2a0'); h.position.y = 0.22; g.add(h);
    const l = new THREE.PointLight('#ffd890', 0, 1.2, 1.5); l.position.y = 0.3; g.add(l);
    let k = 0;
    return new Prop(g, (P, t, dt) => { k = damp(k, P.state === 'glow' ? 1 : 0, 1.5, dt); h.material.opacity = k * P.show * (0.8 + Math.sin(t * 2) * 0.1); l.intensity = k * P.show * 1.2; }, { state: o.state || 'idle' });
  },

  // 드로아의 삼층 다락방 (행 20:8–9): 두 층 집 위의 셋째 층 방 — 앞(+z)은 트였고(들여다보이게), 뒷벽·왼벽, 오른벽에 창(창턱에 걸터앉는 자리),
  // 뒤쪽 절반만 지붕, 앞쪽은 들보만. 들보에 매단 등잔 여럿(state 'lit'), 바깥 왼쪽에 오르는 계단. 방 안 사람은 바닥 높이(heightAt 0.9)에 선다.
  // 창턱에 앉은 사람: 배역 y = P.sill[1], 자리 (P.sill[0], P.sill[2]) (소품 기준) — 떨어진 자리는 창 밖 아래 땅
  upperroom3(o = {}) {
    const g = new THREE.Group(), W = o.w || 1.4, D = 0.8, FY = 0.86, RH = 0.92, wall = mat(o.wall || '#d8c4a0', { roughness: 1 }), dark = mat('#2a1c10'), roofM = mat('#a98f68', { roughness: 1 });
    mesh(new THREE.BoxGeometry(W, FY, D), wall, g, [0, FY / 2, 0]).receiveShadow = true;
    // 아래 두 층의 창과 문, 층을 가르는 띠
    mesh(new THREE.BoxGeometry(W + 0.02, 0.025, D + 0.02), roofM, g, [0, FY / 2, 0]);
    mesh(new THREE.BoxGeometry(0.2, 0.32, 0.02), dark, g, [-0.4, 0.16, D / 2 + 0.006]);
    [-0.05, 0.4].forEach(x => mesh(new THREE.BoxGeometry(0.1, 0.12, 0.02), dark, g, [x, 0.25, D / 2 + 0.006]));
    [-0.45, -0.05, 0.4].forEach(x => mesh(new THREE.BoxGeometry(0.1, 0.12, 0.02), dark, g, [x, FY / 2 + 0.2, D / 2 + 0.006]));
    const FL = FY + 0.04;
    mesh(new THREE.BoxGeometry(W + 0.04, 0.04, D + 0.04), roofM, g, [0, FY + 0.02, 0]).receiveShadow = true;
    mesh(new THREE.BoxGeometry(W - 0.1, 0.006, D - 0.15), mat('#8a5a3a', { roughness: 1 }), g, [0, FL + 0.003, -0.02]).receiveShadow = true; // 깔개
    // 셋째 층 방의 벽: 뒤·왼쪽, 오른쪽은 창(앞쪽)을 낸 벽
    mesh(new THREE.BoxGeometry(W, RH, 0.05), wall, g, [0, FL + RH / 2, -D / 2 + 0.025]).receiveShadow = true;
    mesh(new THREE.BoxGeometry(0.05, RH, D), wall, g, [-W / 2 + 0.025, FL + RH / 2, 0]).receiveShadow = true;
    const WZ = 0.12, WH = 0.26, WT = 0.5; // 창 가운데 z, 창턱 높이(바닥에서), 창 높이
    const rx = W / 2 - 0.025;
    const seg = (z0, z1, y0, y1) => mesh(new THREE.BoxGeometry(0.05, y1 - y0, z1 - z0), wall, g, [rx, FL + (y0 + y1) / 2, (z0 + z1) / 2]).receiveShadow = true;
    seg(-D / 2, WZ - 0.14, 0, RH); seg(WZ + 0.14, D / 2, 0, RH); seg(WZ - 0.14, WZ + 0.14, 0, WH); seg(WZ - 0.14, WZ + 0.14, WH + WT, RH);
    mesh(new THREE.BoxGeometry(0.12, 0.025, 0.3), roofM, g, [rx + 0.02, FL + WH + 0.012, WZ]); // 창턱
    // 지붕: 뒤쪽 절반, 앞쪽은 들보 둘
    mesh(new THREE.BoxGeometry(W + 0.06, 0.04, D * 0.5), roofM, g, [0, FL + RH + 0.02, -D * 0.25]).receiveShadow = true;
    [0.1, 0.32].forEach(z => mesh(new THREE.BoxGeometry(W, 0.03, 0.035), wood(), g, [0, FL + RH - 0.01, z]));
    // 바깥 왼쪽 계단
    for (let i = 0; i < 9; i++) { const h = (i + 1) * FL / 9; mesh(new THREE.BoxGeometry(0.16, h, 0.09), wall, g, [-W / 2 - 0.09, h / 2, D / 2 - 0.05 - i * 0.085]).receiveShadow = true; }
    // 매단 등잔 여럿 (행 20:8 '등불을 많이 켰는데')
    const lamps = [];
    [-0.5, -0.25, 0, 0.25, 0.48].forEach((x, i) => { const z = i % 2 ? 0.1 : 0.32; mesh(new THREE.CylinderGeometry(0.002, 0.002, 0.2, 4), dark, g, [x, FL + RH - 0.12, z]).castShadow = false; lamps.push(oilLamp(g, x, FL + RH - 0.23, z)); });
    [-0.55, 0.0, 0.5].forEach(x => { mesh(new THREE.CylinderGeometry(0.012, 0.03, 0.38, 8), mat('#8a6a3a', { metalness: 0.4, roughness: 0.5 }), g, [x, FL + 0.19, -D / 2 + 0.12]); lamps.push(oilLamp(g, x, FL + 0.39, -D / 2 + 0.12)); });
    const L1 = new THREE.PointLight('#ffc070', 0, 1.8, 1.4); L1.position.set(-0.3, FL + 0.6, 0.15); g.add(L1);
    const L2 = new THREE.PointLight('#ffc070', 0, 1.8, 1.4); L2.position.set(0.35, FL + 0.6, 0.1); g.add(L2);
    let k = o.state === 'lit' ? 1 : 0;
    const P = new Prop(g, (P, t, dt) => {
      k = damp(k, P.state === 'lit' ? 1 : P.state === 'dim' ? 0.45 : 0, 1.5, dt);
      lamps.forEach((L, i) => { const f = 1 + Math.sin(t * 9 + i) * 0.07; L.fl.visible = k > 0.08; L.fl.scale.y = f; L.h.material.opacity = k * 0.85 * f * P.show; });
      L1.intensity = L2.intensity = k * 1.6 * P.show * (1 + Math.sin(t * 8) * 0.05);
    }, { state: o.state || 'lit' });
    P.floor = true;
    P.heightAt = (x, z) => { const u = (x - g.position.x) / g.scale.x, v = (z - g.position.z) / g.scale.z;
      return P.show > 0.5 && Math.abs(u) < W / 2 - 0.03 && Math.abs(v) < D / 2 ? FL * g.scale.y : 0; };
    P.sill = [rx + 0.01, FL + WH + 0.025, WZ];
    return P;
  },

  // 아가보의 허리띠 (행 21:11): 따라다니는 소품(on: 배역). 그 사람이 바라보는 쪽으로 돈다.
  // state 'none' | 'held'(두 손 앞에 늘어뜨려 든 가죽 띠) | 'bound'(띠로 두 손목과 두 발목을 감았다 — 앉은 자세 sit-ground에 맞춤)
  beltbind(o = {}) {
    const g = new THREE.Group(), lm = mat('#6b4a2a', { roughness: 0.9 }), held = new THREE.Group(), bound = new THREE.Group(); g.add(held, bound);
    const pts = []; for (let i = 0; i <= 12; i++) { const u = i / 12; pts.push(new THREE.Vector3(-0.09 + u * 0.18, 0.5 - Math.sin(u * Math.PI) * 0.16, 0.2)); }
    mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, 0.009, 6), lm, held);
    const W = o.wrist || [0, 0.3, 0.17], A = o.ankle || [0, 0.05, 0.16];
    [W, A].forEach(([x, y, z], i) => {
      for (let k = 0; k < 3; k++) { const r = mesh(new THREE.TorusGeometry(i ? 0.075 : 0.06, 0.01, 6, 18), lm, bound, [x, y + (k - 1) * 0.018, z]); r.rotation.x = Math.PI / 2; r.scale.set(1, 0.55, 1); }
    });
    const tail = mesh(new THREE.BoxGeometry(0.018, 0.08, 0.008), lm, bound, [W[0] + 0.05, W[1] - 0.05, W[2] + 0.04]); tail.rotation.z = 0.4;
    return new Prop(g, (P) => {
      const a = P.follow && P.follow[0];
      if (a) { g.rotation.y = a.face; g.position.y = a.ground || 0; }
      held.visible = P.state === 'held' && P.show > 0.05; bound.visible = P.state === 'bound' && P.show > 0.05;
    }, { state: o.state || 'none', fade: 'none' });
  },

  // 안토니아 요새의 층계 (행 21:35·40): 뒤에 흉벽을 두른 높은 요새 벽과 오른쪽 망대, 성문 앞의 돌 층계참(높이 o.lh), 층계는 왼쪽(-x)으로 내려간다.
  // 층계참과 층계 위의 사람은 그 높이에 선다(heightAt). 층계참 가운데는 소품 자리에서 (0, -0.1), 층계 아래 끝은 (-0.35 - run, -0.1)
  fortstairs(o = {}) {
    const g = new THREE.Group(), LH = o.lh || 0.42, W = o.w || 2.2, H = o.h || 1.15, st = stoneM(o.color || '#cdbd9a'), st2 = stoneM('#b8a882'), run = o.run || 0.85, n = 7;
    const wall = mesh(new THREE.BoxGeometry(W, H, 0.22), st, g, [0.3, H / 2, -0.48]); wall.receiveShadow = true;
    for (let x = 0.3 - W / 2 + 0.06; x < 0.3 + W / 2 - 0.03; x += 0.15) mesh(new THREE.BoxGeometry(0.08, 0.08, 0.06), st, g, [x, H + 0.04, -0.4]);
    // 망대
    mesh(new THREE.BoxGeometry(0.42, H + 0.4, 0.42), st2, g, [0.3 + W / 2 - 0.15, (H + 0.4) / 2, -0.5]).receiveShadow = true;
    for (let k = 0; k < 3; k++) mesh(new THREE.BoxGeometry(0.08, 0.08, 0.06), st2, g, [0.3 + W / 2 - 0.29 + k * 0.14, H + 0.44, -0.28]);
    // 성문 (어두운 문길)
    mesh(new THREE.BoxGeometry(0.34, 0.5, 0.02), mat('#2a1c10', { roughness: 1 }), g, [0.1, LH + 0.25, -0.365]);
    mesh(new THREE.BoxGeometry(0.42, 0.06, 0.06), st2, g, [0.1, LH + 0.53, -0.35]);
    // 층계참과 층계
    mesh(new THREE.BoxGeometry(0.8, LH, 0.5), st2, g, [0.05, LH / 2, -0.12]).receiveShadow = true;
    for (let i = 0; i < n; i++) { const h = LH * (n - i) / (n + 1), x = -0.35 - (i + 0.5) * run / n;
      mesh(new THREE.BoxGeometry(run / n + 0.002, h, 0.42), st, g, [x, h / 2, -0.12]).receiveShadow = true; }
    // 층계 난간 (앞쪽 낮은 담)
    mesh(new THREE.BoxGeometry(0.8, 0.07, 0.04), st2, g, [0.05, LH + 0.035, 0.11]);
    const P = new Prop(g);
    P.heightAt = (x, z) => { const u = (x - g.position.x) / g.scale.x, v = (z - g.position.z) / g.scale.z;
      if (P.show < 0.5 || v < -0.36 || v > 0.12) return 0;
      if (u > -0.35 && u < 0.45) return LH * g.scale.y;
      if (u <= -0.35 && u > -0.35 - run) { const i = Math.floor((-0.35 - u) / (run / n)); return LH * (n - i) / (n + 1) * g.scale.y; }
      return 0; };
    return P;
  },

  // 말 (행 23:23–24 마병 칠십과 바울을 태울 짐승): 나귀보다 크고 다리가 긴 말, 붉은 안장 천. deck에 태운다(board, pose 'ride'). 머리가 +x
  horse: o => MAKERS.donkey({ coat: '#9a6e44', dark: '#3a2618', size: 2.0, legs: 1.15, ears: 0.05, neck: 0.15, neckTilt: 0.45, saddle: '#9d3328', ...o }),
});

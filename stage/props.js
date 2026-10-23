/* 3D 무대 소품: 구유·양·배·물결·군중·바구니·언덕·십자가·무덤·빛 */
import { THREE, mat, DS, lathe, folds, mesh, sphere, glowTexture, damp } from './kit.js';

// 소품: show(나타남)와 state(상태)를 가지며, 매 프레임 update로 움직인다
class Prop {
  constructor(obj, update, o = {}) {
    this.obj = obj; this.upd = update;
    this.show = this.showT = 1;
    this.state = o.state || 'idle'; this.t0 = 0;
    this.fade = o.fade || 'scale';       // scale: 커지며 나타남, opacity: 투명도로
    this.base = obj.scale.clone();
    this.goal = new THREE.Vector2(obj.position.x, obj.position.z);
  }
  set(state) { if (state && state !== this.state) { this.state = state; this.t0 = performance.now() / 1000; } }
  update(time, dt, env) {
    this.show = damp(this.show, this.showT, 3, dt);
    const pos = this.obj.position;
    if (this.speed) { // 일정한 속도로 미끄러지듯 (배가 물 위를 나아가듯) — 끝에서 살짝 늦춘다
      const dx = this.goal.x - pos.x, dz = this.goal.y - pos.z, d = Math.hypot(dx, dz);
      if (d > 1e-3) { const s = Math.min(d, this.speed * dt * Math.min(1, 0.3 + d * 2)); pos.x += dx / d * s; pos.z += dz / d * s; }
      // 가는 동안은 앞(+x 축)을 진행 방향으로. 배는 도착하면 다시 옆모습으로 돌아서고(앞뒤가 같으니 가까운 쪽으로),
      // 짐승(directional)은 머리가 앞이라 그대로 가는 쪽을 보고 선다
      this.moving = d > 0.02;
      if (this.directional) {
        if (d > 0.08) { const want = Math.atan2(-dz, dx); let diff = want - this.obj.rotation.y; diff = Math.atan2(Math.sin(diff), Math.cos(diff)); this.obj.rotation.y += diff * (1 - Math.exp(-3 * dt)); }
      } else {
        let head = this.rest || 0;
        if (d > 0.08) { head = Math.atan2(-dz, dx); if (head > Math.PI / 2) head -= Math.PI; if (head < -Math.PI / 2) head += Math.PI; }
        this.obj.rotation.y = damp(this.obj.rotation.y, head, 1.6, dt);
      }
    } else {
      pos.x = damp(pos.x, this.goal.x, 3, dt);
      pos.z = damp(pos.z, this.goal.y, 3, dt);
    }
    if (this.fade === 'scale') this.obj.scale.copy(this.base).multiplyScalar(Math.max(1e-4, this.show));
    this.obj.visible = this.show > 0.02;
    if (this.upd) this.upd(this, time, dt, env);
  }
}

const gradTex = (stops, w = 4, h = 128, vertical = true) => {
  const c = document.createElement('canvas'); c.width = vertical ? w : h; c.height = vertical ? h : w;
  const g = c.getContext('2d'), gr = vertical ? g.createLinearGradient(0, 0, 0, h) : g.createLinearGradient(0, 0, h, 0);
  stops.forEach(([o, col]) => gr.addColorStop(o, col));
  g.fillStyle = gr; g.fillRect(0, 0, c.width, c.height);
  return new THREE.CanvasTexture(c);
};
const radialTex = (inner, outer) => {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, inner); gr.addColorStop(0.65, inner); gr.addColorStop(1, outer);
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
};
const glowSprite = (size, opacity = 1) => {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity }));
  s.scale.set(size, size, 1);
  return s;
};
const wood = () => mat('#7a5634', { roughness: 0.95 });

/* ---------- 각 소품 ---------- */
const MAKERS = {
  // 구유와 아기: state 'empty' | 'baby'
  manger() {
    const g = new THREE.Group();
    const w = wood();
    mesh(new THREE.BoxGeometry(0.32, 0.03, 0.16), w, g, [0, 0.1, 0]);
    [-1, 1].forEach(s => { const side = mesh(new THREE.BoxGeometry(0.34, 0.08, 0.02), w, g, [0, 0.14, s * 0.085]); side.rotation.x = s * 0.35; });
    [-1, 1].forEach(s => mesh(new THREE.BoxGeometry(0.02, 0.08, 0.2), w, g, [s * 0.16, 0.14, 0]));
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, b]) => mesh(new THREE.BoxGeometry(0.025, 0.11, 0.025), w, g, [a * 0.14, 0.05, b * 0.06]).rotation.z = a * 0.15);
    mesh(sphere(0.13, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat('#d9b86a', { roughness: 1 }), g, [0, 0.12, 0], [1.2, 0.3, 0.6]);
    const baby = new THREE.Group();
    mesh(new THREE.CapsuleGeometry(0.035, 0.09, 6, 12), mat('#f6efe0'), baby).rotation.z = Math.PI / 2;
    mesh(sphere(0.033, 14, 10), mat('#d6ad89', { roughness: 0.7 }), baby, [0.075, 0.012, 0]);
    baby.position.set(-0.02, 0.165, 0);
    g.add(baby);
    const halo = glowSprite(0.7, 0.85);
    halo.position.set(0, 0.2, 0);
    g.add(halo);
    // 아기에게서 번지는 따뜻한 빛 — 밤에 둘러선 사람들의 얼굴을 비춘다
    const light = new THREE.PointLight('#ffd9a0', 0, 1.6, 1.4);
    light.position.set(0, 0.35, 0.1);
    g.add(light);
    return new Prop(g, (P, t, dt) => {
      const on = P.state === 'baby';
      baby.visible = on;
      halo.material.opacity = damp(halo.material.opacity, on ? 0.75 + Math.sin(t * 2) * 0.1 : 0, 3, dt);
      light.intensity = damp(light.intensity, on ? 2.2 : 0, 3, dt);
    }, { state: 'empty' });
  },

  // 양: 털 뭉치 + 검은 얼굴, 풀을 뜯으며 고개를 까딱인다
  sheep() {
    const g = new THREE.Group();
    const wool = mat('#efe9dc', { roughness: 1 }), face = mat('#2b2420', { roughness: 0.8 });
    [[0, 0.12, 0, 0.085], [0.07, 0.13, 0.02, 0.07], [-0.07, 0.125, -0.01, 0.072], [0.02, 0.17, 0, 0.065], [-0.03, 0.12, 0.05, 0.06], [0.03, 0.12, -0.05, 0.06]]
      .forEach(([x, y, z, r]) => mesh(sphere(r, 12, 10), wool, g, [x, y, z]));
    const head = new THREE.Group();
    head.position.set(0.12, 0.15, 0);
    g.add(head);
    mesh(sphere(0.04, 12, 10), face, head, [0.03, 0, 0], [1.3, 0.9, 0.85]);
    [-1, 1].forEach(s => mesh(sphere(0.018, 8, 6), face, head, [0.0, 0.015, s * 0.04], [0.6, 0.4, 1.4]));
    [[0.06, 0.04], [0.06, -0.04], [-0.06, 0.04], [-0.06, -0.04]].forEach(([x, z]) => mesh(new THREE.CylinderGeometry(0.011, 0.01, 0.08, 6), face, g, [x, 0.04, z]));
    const seed = Math.random() * 10;
    return new Prop(g, (P, t) => { head.rotation.z = -0.35 + Math.sin(t * 0.8 + seed) * 0.3; head.position.y = 0.13 + Math.sin(t * 0.8 + seed) * 0.02; });
  },

  // 빛나는 별 (높은 하늘)
  star() {
    const g = new THREE.Group();
    const s = glowSprite(0.8, 0.9);
    g.add(s);
    const core = mesh(new THREE.OctahedronGeometry(0.035), mat('#fff6d8', { emissive: '#ffe9a8', emissiveIntensity: 2 }), g);
    core.castShadow = false;
    return new Prop(g, (P, t) => { s.material.opacity = 0.7 + Math.sin(t * 3) * 0.15; core.rotation.y = t; }, { fade: 'scale' });
  },

  // 위에서 내려오는 영광의 빛기둥 (opts.r = 아래 반지름)
  beam(o = {}) {
    // 위로 갈수록 옅어지고, 바닥 근처도 살짝 풀어지는 부드럽고 따뜻한 빛 (무대 조명처럼 보이지 않게)
    const r = o.r || 0.6, hgt = o.h || 2.6, peak = o.peak ?? 0.42;
    const g = new THREE.Group();
    const m = new THREE.MeshBasicMaterial({ map: gradTex([[0, 'rgba(255,226,160,0)'], [0.45, 'rgba(255,226,160,0.22)'], [0.88, 'rgba(255,220,150,0.5)'], [1, 'rgba(255,220,150,0.3)']]), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    const cone = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.45, r, hgt, 32, 1, true), m);
    cone.position.y = hgt / 2;
    g.add(cone);
    const pool = new THREE.Mesh(new THREE.CircleGeometry(r * 1.2, 32), new THREE.MeshBasicMaterial({ map: radialTex('rgba(255,226,160,0.5)', 'rgba(255,226,160,0)'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    pool.rotation.x = -Math.PI / 2; pool.position.y = 0.01;
    g.add(pool);
    const light = new THREE.PointLight('#ffe0a8', 0, 2.2, 1.5);
    light.position.y = 0.9;
    g.add(light);
    return new Prop(g, (P, t) => {
      m.opacity = P.show * peak * (1 + Math.sin(t * 1.6) * 0.08);
      pool.material.opacity = P.show * 0.8;
      light.intensity = P.show * 1.4;
    }, { fade: 'opacity' });
  },

  // 하늘 군대: 작은 천사들이 활 모양으로 떠서 찬양한다
  host(o = {}) {
    const n = o.n || 7, g = new THREE.Group();
    const robe = mat('#fbf7ee', { emissive: '#8a7448', emissiveIntensity: 0.3 }), skin = mat('#d6ad89'), gold = mat('#f3d27a', { emissive: '#d9a940', emissiveIntensity: 0.9 });
    const wing = mat('#fffdf7', { ...DS, emissive: '#8a7448', emissiveIntensity: 0.4 });
    const wingGeo = new THREE.CircleGeometry(0.11, 12, 0, Math.PI * 0.75);
    const angels = [];
    for (let i = 0; i < n; i++) {
      const a = new THREE.Group(), f = i / (n - 1);
      a.position.set((f - 0.5) * (o.span || 1.6), Math.sin(f * Math.PI) * 0.25, -Math.sin(f * Math.PI) * 0.3);
      mesh(lathe([[0.001, 0], [0.07, 0], [0.04, 0.2], [0.001, 0.22]], 14), robe, a);
      mesh(sphere(0.04, 12, 10), skin, a, [0, 0.25, 0]);
      const h = mesh(new THREE.TorusGeometry(0.035, 0.004, 6, 20), gold, a, [0, 0.3, -0.01]); h.rotation.x = Math.PI / 2 - 0.4;
      [-1, 1].forEach(s => { const w = mesh(wingGeo, wing, a, [s * 0.02, 0.17, -0.03]); w.rotation.set(0, s * 0.5, s > 0 ? 0.2 : Math.PI - 0.2 + Math.PI * 0.25); w.userData.s = s; });
      [-1, 1].forEach(s => { const arm = mesh(new THREE.CapsuleGeometry(0.012, 0.09, 4, 6), robe, a, [s * 0.05, 0.22, 0.02]); arm.rotation.z = s * 2.6; });
      a.add(glowSprite(0.35, 0.55));
      g.add(a); angels.push(a);
    }
    return new Prop(g, (P, t) => angels.forEach((a, i) => { a.position.y += (Math.sin(t * 1.5 + i) * 0.0009); a.children.forEach(c => { if (c.userData.s) c.rotation.y = c.userData.s * (0.5 + Math.sin(t * 6 + i) * 0.35); }); }));
  },

  // 물결치는 호수: env.wave(0 잔잔 ~ 1 폭풍)에 따라 물결 높이와 색이 달라진다
  water(o = {}) {
    const R = o.r || 1.6, seg = 56;
    const geo = new THREE.PlaneGeometry(R * 2, R * 2, seg, seg);
    geo.rotateX(-Math.PI / 2);
    const base = geo.attributes.position.array.slice();
    const m = new THREE.MeshStandardMaterial({ color: '#6f97a0', roughness: 0.25, metalness: 0.1, transparent: true, alphaMap: radialTex('#ffffff', '#000000'), flatShading: false });
    const w = new THREE.Mesh(geo, m);
    w.receiveShadow = true;
    const g = new THREE.Group();
    g.add(w);
    const calm = new THREE.Color('#7aa3ab'), storm = new THREE.Color('#5f7f87');
    let amp = 0.01;
    const P = new Prop(g, (P, t, dt, env) => {
      amp = damp(amp, 0.008 + (env.wave || 0) * 0.07, 1.2, dt);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = base[i * 3], z = base[i * 3 + 2];
        pos.array[i * 3 + 1] = amp * (Math.sin(x * 5 + t * 2.2) + Math.sin(z * 6.5 - t * 1.7) * 0.7 + Math.sin((x + z) * 9 + t * 3.1) * 0.35);
      }
      pos.needsUpdate = true;
      geo.computeVertexNormals();
      m.color.copy(calm).lerp(storm, Math.min(1, (env.wave || 0)));
      m.opacity = P.show * (0.9 - Math.min(1, env.wave || 0) * 0.15);
    }, { fade: 'opacity' });
    P.height = (x, z, t) => amp * (Math.sin(x * 5 + t * 2.2) + Math.sin(z * 6.5 - t * 1.7) * 0.7);
    return P;
  },

  // 배: 사람을 태울 수 있는 갑판(deck)이 있고, 물결(env.wave)에 따라 흔들린다
  boat(o = {}) {
    const g = new THREE.Group(), rock = new THREE.Group();
    g.add(rock);
    const hullM = mat('#6e4a2c', { ...DS, roughness: 0.9 }), dark = mat('#4a301c', { roughness: 0.9 });
    const hull = mesh(sphere(0.5, 32, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), hullM, rock, [0, 0.16, 0], [1.7, 0.42, 0.55]);
    hull.receiveShadow = true;
    mesh(new THREE.TorusGeometry(0.5, 0.018, 6, 40), dark, rock, [0, 0.16, 0], [1.7, 0.55, 1]).rotation.x = Math.PI / 2;
    const deck = new THREE.Group();
    deck.position.y = 0.06;
    rock.add(deck);
    mesh(new THREE.BoxGeometry(1.25, 0.015, 0.36), mat('#8a6440'), rock, [0, 0.06, 0]).receiveShadow = true;
    // 돛대와 접은 돛
    mesh(new THREE.CylinderGeometry(0.014, 0.018, 1.0, 8), dark, rock, [0.2, 0.55, 0]);
    mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.62, 6), dark, rock, [0.2, 0.92, 0]).rotation.z = Math.PI / 2 - 0.15;
    mesh(new THREE.CapsuleGeometry(0.03, 0.5, 4, 8), mat('#e8dcc0'), rock, [0.2, 0.9, 0.02]).rotation.z = Math.PI / 2 - 0.15;
    const P = new Prop(g, (P, t, dt, env) => {
      const wv = env.waveNow || 0;
      rock.rotation.z = Math.sin(t * 1.3) * (0.02 + wv * 0.16);
      rock.rotation.x = Math.sin(t * 1.7 + 1) * (0.01 + wv * 0.08);
      rock.position.y = Math.sin(t * 1.9) * (0.005 + wv * 0.04);
    });
    P.deck = deck;
    return P;
  },

  // 비: 폭풍일 때만 보이는 사선 빗줄기
  rain() {
    const n = 140, pos = new Float32Array(n * 6), seeds = [];
    for (let i = 0; i < n; i++) seeds.push([Math.random() * 3.2 - 1.6, Math.random() * 2.4, Math.random() * 2 - 1.2]);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const m = new THREE.LineBasicMaterial({ color: '#c8d6dc', transparent: true, opacity: 0.5 });
    const lines = new THREE.LineSegments(geo, m);
    const g = new THREE.Group(); g.add(lines);
    return new Prop(g, (P, t, dt, env) => {
      const r = env.rainNow || 0;
      m.opacity = r * 0.55;
      lines.visible = r > 0.02;
      seeds.forEach(([x, y0, z], i) => {
        const y = 2.4 - ((y0 + t * 2.6) % 2.4);
        pos.set([x + y * 0.25, y, z, x + y * 0.25 + 0.04, y + 0.16, z], i * 6);
      });
      geo.attributes.position.needsUpdate = true;
    }, { fade: 'opacity' });
  },

  // 풀밭 (부드러운 가장자리)
  grass(o = {}) {
    const g = new THREE.Group();
    const m = new THREE.MeshStandardMaterial({ color: '#8fa45a', roughness: 1, transparent: true, alphaMap: radialTex('#ffffff', '#000000'), depthWrite: false });
    const d = new THREE.Mesh(new THREE.CircleGeometry(o.r || 1.6, 48), m);
    d.rotation.x = -Math.PI / 2; d.position.y = 0.004; d.receiveShadow = true;
    g.add(d);
    // 풀포기
    const tuft = mat('#6f8c40', { roughness: 1 });
    for (let i = 0; i < 40; i++) {
      const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * (o.r || 1.6) * 0.9;
      mesh(new THREE.ConeGeometry(0.015, 0.05, 4), tuft, g, [Math.cos(a) * r, 0.025, Math.sin(a) * r * 0.8]);
    }
    return new Prop(g, (P) => { m.opacity = P.show; }, { fade: 'opacity' });
  },

  // 군중: 단순한 작은 사람들. state 'stand' | 'sit'. opts.spots = [[x, z], …]
  crowd(o = {}) {
    const g = new THREE.Group();
    const robes = ['#8b6f50', '#a58a5c', '#7d6446', '#b9a07a', '#6e5a40', '#9c7b56', '#c2a77a', '#8e6d4e', '#a3554a', '#5d6b4a', '#4f6a7d'];
    const heads = ['#e9dfc8', '#cdbb94', '#d8c9a6', '#3c5d96', '#efe6d4', '#b89b6c'];
    const skins = ['#c99a74', '#b9845d', '#d6ad89', '#a87451'];
    const folk = (o.spots || []).map(([x, z], i) => {
      const p = new THREE.Group(), body = new THREE.Group();
      p.position.set(x, 0, z);
      p.add(body);
      const s = 0.82 + Math.random() * 0.2;
      body.scale.setScalar(s);
      mesh(lathe([[0.001, 0], [0.12, 0], [0.1, 0.25], [0.085, 0.5], [0.08, 0.58], [0.05, 0.62], [0.001, 0.63]], 14), mat(robes[i % robes.length]), body);
      mesh(sphere(0.07, 12, 10), mat(skins[i % skins.length], { roughness: 0.7 }), body, [0, 0.7, 0]);
      mesh(sphere(0.078, 12, 8, Math.PI * 1.5 - 1.9, 3.8, 0, Math.PI * 0.62), mat(heads[(i * 7) % heads.length], DS), body, [0, 0.705, -0.003]);
      p.rotation.y = (o.face ?? Math.atan2(-x, -z)) + (Math.random() - 0.5) * 0.5; // 정한 방향, 없으면 가운데(예수)를 향해
      p.userData = { body, seed: Math.random() * 10 };
      g.add(p);
      return p;
    });
    return new Prop(g, (P, t, dt) => {
      const sit = P.state === 'sit' ? 1 : 0;
      folk.forEach(f => {
        const b = f.userData.body;
        b.scale.y = damp(b.scale.y, (1 - 0.45 * sit) * b.scale.x, 3, dt);
        b.rotation.x = Math.sin(t * 0.7 + f.userData.seed) * 0.03;
      });
    }, { state: o.state || 'stand' });
  },

  // 열두 바구니: show가 커지면 하나씩 차례로 나타난다
  baskets(o = {}) {
    const g = new THREE.Group(), n = o.n || 12, items = [];
    for (let i = 0; i < n; i++) {
      const b = new THREE.Group(), row = i % 2, k = Math.floor(i / 2);
      b.position.set((k - (n / 2 - 1) / 2) * 0.22 + row * 0.11, 0, row * 0.18);
      mesh(new THREE.CylinderGeometry(0.075, 0.055, 0.08, 14, 1, true), mat('#9a7442', { ...DS, roughness: 0.95 }), b, [0, 0.04, 0]);
      mesh(sphere(0.068, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat('#d0a462', { roughness: 0.9 }), b, [0, 0.07, 0], [1, 0.5, 1]);
      g.add(b); items.push(b);
    }
    return new Prop(g, (P) => items.forEach((b, i) => { const k = THREE.MathUtils.clamp(P.show * n - i, 0, 1); b.scale.setScalar(Math.max(1e-4, k)); b.visible = k > 0.02; }), { fade: 'none' });
  },

  // 낮은 언덕 (골고다)
  hill(o = {}) {
    const g = new THREE.Group(), W = o.w || 1.3, Hh = o.h || 0.28, D = o.d || 0.7;
    const h = mesh(sphere(1, 40, 16, 0, Math.PI * 2, 0, Math.PI / 2), mat('#857664', { roughness: 1 }), g, [0, 0, 0], [W, Hh, D]);
    h.receiveShadow = true;
    const P = new Prop(g);
    // 언덕 위 (x, z) 지점의 지면 높이 — 사람이 비탈에 파묻히지 않고 그 위에 서도록
    P.heightAt = (x, z) => {
      const u = (x - g.position.x) / W, v = (z - g.position.z) / D, r = u * u + v * v;
      return r < 1 ? Hh * Math.sqrt(1 - r) * (P.show > 0.5 ? 1 : 0) : 0;
    };
    return P;
  },

  // 세 십자가: 가운데가 크다. 윤곽만 보이도록 어두운 나무
  crosses(o = {}) {
    const g = new THREE.Group(), m = mat('#2e2219', { roughness: 1 });
    const cross = (x, z, hgt, bar) => {
      mesh(new THREE.BoxGeometry(0.05, hgt, 0.05), m, g, [x, hgt / 2, z]);
      mesh(new THREE.BoxGeometry(bar, 0.045, 0.045), m, g, [x, hgt * 0.72, z]);
    };
    cross(0, 0, o.h || 1.3, 0.78);
    cross(-0.62, -0.12, (o.h || 1.3) * 0.85, 0.62);
    cross(0.62, -0.12, (o.h || 1.3) * 0.85, 0.62);
    mesh(new THREE.BoxGeometry(0.16, 0.06, 0.02), m, g, [0, (o.h || 1.3) - 0.02, 0.03]); // 죄패
    return new Prop(g);
  },

  // 바위 무덤: state 'open' | 'closed' (큰 돌이 굴러 입구를 막는다)
  tomb() {
    const g = new THREE.Group();
    const rock = mesh(new THREE.DodecahedronGeometry(0.42, 1), mat('#8a7a64', { roughness: 1, flatShading: true }), g, [0, 0.26, 0], [1.2, 0.75, 0.8]);
    rock.receiveShadow = true;
    const hole = mesh(new THREE.CircleGeometry(0.12, 24), new THREE.MeshBasicMaterial({ color: '#120d09' }), g, [0, 0.16, 0.33]);
    hole.castShadow = false;
    const stone = mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.06, 24), mat('#9a8a72', { roughness: 1 }), g, [0.32, 0.15, 0.36]);
    stone.rotation.x = Math.PI / 2;
    return new Prop(g, (P, t, dt) => {
      const x = P.state === 'closed' ? 0 : 0.32;
      const nx = damp(stone.position.x, x, 1.2, dt);
      stone.rotation.y -= (nx - stone.position.x) / 0.15; // 굴러간다
      stone.position.x = nx;
    }, { state: 'open' });
  },
};

// 네발짐승(나귀·낙타): 앞이 +x. 걸을 때 다리를 엇갈려 움직이고 고개를 끄덕인다. deck에 사람을 태울 수 있다
function beast(o) {
  const g = new THREE.Group(), body = new THREE.Group();
  g.add(body);
  const S = o.size || 1, coat = mat(o.coat || '#8a7a68', { roughness: 0.95 }), dark = mat(o.dark || '#4a3e34', { roughness: 0.9 });
  const H = 0.24 * S; // 등 높이
  mesh(new THREE.CapsuleGeometry(0.075 * S, 0.2 * S, 8, 14), coat, body, [0, H, 0]).rotation.z = Math.PI / 2;
  if (o.hump) mesh(sphere(0.08 * S, 14, 10), coat, body, [-0.01 * S, H + 0.07 * S, 0], [1.1, 1, 0.85]);
  const neck = new THREE.Group();
  neck.position.set(0.15 * S, H + 0.03 * S, 0);
  body.add(neck);
  mesh(new THREE.CapsuleGeometry(0.035 * S, (o.neck || 0.12) * S, 6, 10), coat, neck, [0.03 * S, 0.06 * S, 0]).rotation.z = -0.55;
  const headG = new THREE.Group();
  headG.position.set(0.08 * S, ((o.neck || 0.12) + 0.04) * S, 0);
  neck.add(headG);
  mesh(new THREE.CapsuleGeometry(0.035 * S, 0.07 * S, 6, 10), coat, headG, [0.04 * S, 0, 0]).rotation.z = Math.PI / 2 + 0.35;
  mesh(sphere(0.03 * S, 10, 8), dark, headG, [0.09 * S, -0.025 * S, 0]);
  [-1, 1].forEach(s => mesh(sphere(0.006 * S, 6, 4), mat('#120c08'), headG, [0.045 * S, 0.012 * S, s * 0.03 * S]));
  [-1, 1].forEach(s => { const e = mesh(new THREE.ConeGeometry(0.014 * S, (o.ears || 0.07) * S, 6), coat, headG, [0.0, 0.04 * S, s * 0.022 * S]); e.rotation.x = s * 0.35; });
  const legs = [[0.1, 1], [0.1, -1], [-0.1, 1], [-0.1, -1]].map(([x, s]) => {
    const l = new THREE.Group();
    l.position.set(x * S, H - 0.02 * S, s * 0.045 * S);
    body.add(l);
    mesh(new THREE.CylinderGeometry(0.018 * S, 0.014 * S, H, 8), coat, l, [0, -H / 2, 0]);
    mesh(new THREE.CylinderGeometry(0.017 * S, 0.017 * S, 0.02 * S, 8), dark, l, [0, -H + 0.01 * S, 0]);
    return l;
  });
  const tail = mesh(new THREE.CylinderGeometry(0.006 * S, 0.004 * S, 0.12 * S, 6), dark, body, [-0.19 * S, H - 0.03 * S, 0]);
  tail.rotation.z = -0.3;
  if (o.saddle) mesh(new THREE.BoxGeometry(0.16 * S, 0.02 * S, 0.17 * S), mat(o.saddle), body, [-0.02 * S, H + 0.075 * S, 0]);
  const deck = new THREE.Group();
  deck.position.set(-0.02 * S, H + 0.02 * S, 0);
  body.add(deck); // 탄 사람은 짐승의 옆으로 걸터앉는다 (바라보는 쪽은 look으로)
  let phase = Math.random() * 6;
  const P = new Prop(g, (P, t, dt) => {
    if (P.moving) phase += dt * 9;
    const sw = P.moving ? Math.sin(phase) * 0.45 : 0;
    legs.forEach((l, i) => { l.rotation.z = damp(l.rotation.z, (i === 0 || i === 3 ? sw : -sw), 10, dt); });
    neck.rotation.z = damp(neck.rotation.z, P.moving ? Math.sin(phase * 2) * 0.08 : Math.sin(t * 0.6) * 0.05 - (o.graze ? 0.4 : 0), 4, dt);
    body.position.y = P.moving ? Math.abs(Math.cos(phase)) * 0.012 * S : 0;
    tail.rotation.x = Math.sin(t * 1.3) * 0.25;
  });
  P.deck = deck;
  P.directional = true;
  return P;
}

Object.assign(MAKERS, {
  // 크기는 사람(키 약 0.88)과의 비례로: 나귀 등은 허벅지 높이, 낙타 등은 어깨 높이쯤
  donkey: o => beast({ coat: '#8d8073', dark: '#3e3630', size: 1.65, saddle: '#7a3b2e', ears: 0.08, ...o }),
  camel: o => beast({ coat: '#c4a273', dark: '#7a5f3e', size: 2.5, hump: true, neck: 0.2, ears: 0.03, saddle: '#7a2a5e', ...o }),

  // 성전: 계단 단 위의 흰 돌 건물, 금빛 처마와 기둥 현관 (멀리 배경으로)
  temple(o = {}) {
    const g = new THREE.Group(), stone = mat('#ece4d2', { roughness: 0.85 }), gold = mat('#d6a93a', { metalness: 0.55, roughness: 0.35 }), shade = mat('#b9ad96');
    mesh(new THREE.BoxGeometry(2.2, 0.08, 0.9), shade, g, [0, 0.04, 0]).receiveShadow = true;
    mesh(new THREE.BoxGeometry(2.0, 0.06, 0.8), stone, g, [0, 0.11, 0]).receiveShadow = true;
    mesh(new THREE.BoxGeometry(1.1, 0.95, 0.55), stone, g, [0, 0.62, -0.1]);
    mesh(new THREE.BoxGeometry(1.16, 0.05, 0.6), gold, g, [0, 1.12, -0.1]);
    for (let i = 0; i < 9; i++) mesh(new THREE.ConeGeometry(0.018, 0.06, 4), gold, g, [-0.52 + i * 0.13, 1.17, 0.18]);
    mesh(new THREE.BoxGeometry(0.26, 0.5, 0.02), mat('#3a2a1a'), g, [0, 0.4, 0.18]);
    mesh(new THREE.BoxGeometry(0.3, 0.04, 0.03), gold, g, [0, 0.67, 0.19]);
    for (let i = 0; i < 6; i++) { const x = -0.9 + i * 0.36; if (Math.abs(x) < 0.5) continue; mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.62, 12), stone, g, [x, 0.45, 0.25]); }
    mesh(new THREE.BoxGeometry(1.95, 0.05, 0.16), stone, g, [0, 0.78, 0.25]);
    return new Prop(g);
  },

  // 헤롯의 왕좌
  throne() {
    const g = new THREE.Group(), gold = mat('#d6a93a', { metalness: 0.55, roughness: 0.35 }), cloth = mat('#6b2a5e');
    mesh(new THREE.BoxGeometry(0.42, 0.06, 0.34), mat('#8a7a68'), g, [0, 0.03, 0]);
    mesh(new THREE.BoxGeometry(0.24, 0.16, 0.2), gold, g, [0, 0.14, 0]);
    mesh(new THREE.BoxGeometry(0.24, 0.03, 0.2), cloth, g, [0, 0.235, 0]);
    mesh(new THREE.BoxGeometry(0.26, 0.42, 0.04), gold, g, [0, 0.38, -0.1]);
    mesh(sphere(0.03, 10, 8), gold, g, [0, 0.62, -0.1]);
    return new Prop(g);
  },

  // 흙벽돌 집 (평평한 지붕, 어두운 문)
  house(o = {}) {
    const g = new THREE.Group(), wall = mat(o.wall || '#cdb48e', { roughness: 1 });
    mesh(new THREE.BoxGeometry(0.62, 0.42, 0.42), wall, g, [0, 0.21, 0]).receiveShadow = true;
    mesh(new THREE.BoxGeometry(0.68, 0.04, 0.48), mat('#a98f68'), g, [0, 0.44, 0]);
    mesh(new THREE.BoxGeometry(0.13, 0.24, 0.02), mat('#2a1c10'), g, [0.12, 0.12, 0.215]);
    mesh(new THREE.BoxGeometry(0.07, 0.06, 0.02), mat('#2a1c10'), g, [-0.16, 0.28, 0.215]);
    return new Prop(g);
  },
});

Object.assign(MAKERS, {
  // 들짐승(자칼), 소
  pig: o => beast({ coat: '#4e3a32', dark: '#2a1e18', size: 0.95, ears: 0.035, neck: 0.03, graze: true, ...o }),
  dog: o => beast({ coat: '#b08a5a', dark: '#5a4630', size: 0.7, ears: 0.05, neck: 0.07, ...o }),
  jackal: o => beast({ coat: '#9a7a52', dark: '#5a4630', size: 0.9, ears: 0.06, neck: 0.08, graze: false, ...o }),
  ox: o => {
    const P = beast({ coat: '#7a5a3a', dark: '#3a2a1c', size: 1.9, ears: 0.03, neck: 0.06, ...o });
    const head = P.obj.children[0].children.find(c => c.isGroup && c.children.length); // 목
    [-1, 1].forEach(s => { const h = mesh(new THREE.ConeGeometry(0.012, 0.07, 6), mat('#e8dcc0'), head, [0.17, 0.14, s * 0.06]); h.rotation.x = s * 0.9; });
    return P;
  },

  // 날아 내려오는 비둘기 (성령): state 'fly'면 날갯짓, 'rest'면 날개를 접는다. y로 높이를 정한다
  dove() {
    const g = new THREE.Group(), white = mat('#ffffff', { emissive: '#fff4d8', emissiveIntensity: 0.6 });
    mesh(sphere(0.04, 14, 10), white, g, [0, 0, 0], [1.5, 0.9, 0.9]);
    mesh(sphere(0.026, 12, 8), white, g, [0.055, 0.025, 0]);
    mesh(new THREE.ConeGeometry(0.008, 0.02, 6), mat('#e0a070'), g, [0.084, 0.022, 0]).rotation.z = -Math.PI / 2;
    mesh(new THREE.ConeGeometry(0.03, 0.06, 6), white, g, [-0.07, 0.005, 0]).rotation.z = Math.PI / 2;
    const wings = [-1, 1].map(s => { const w = mesh(new THREE.CircleGeometry(0.07, 10, 0, Math.PI), mat('#ffffff', { ...DS, emissive: '#fff4d8', emissiveIntensity: 0.6 }), g, [0, 0.015, s * 0.02]); w.rotation.x = -s * Math.PI / 2; w.userData.s = s; return w; });
    const halo = glowSprite(0.5, 0.8);
    g.add(halo);
    return new Prop(g, (P, t, dt) => {
      const fly = P.state === 'fly';
      wings.forEach(w => { w.rotation.x = -w.userData.s * (fly ? Math.PI / 2 + Math.sin(t * 14) * 0.8 : 0.2); });
      g.position.y = damp(g.position.y, P.y ?? g.position.y, 1.1, dt);
      halo.material.opacity = 0.6 + Math.sin(t * 2) * 0.15;
    });
  },

  // 바위 몇 개 (광야)
  rocks(o = {}) {
    const g = new THREE.Group(), m = mat('#a08c6e', { roughness: 1, flatShading: true });
    (o.spots || [[0, 0, 0.12]]).forEach(([x, z, r]) => { const s = mesh(new THREE.DodecahedronGeometry(r, 0), m, g, [x, r * 0.5, z], [1, 0.7, 0.9]); s.rotation.y = x * 7; s.receiveShadow = true; });
    return new Prop(g);
  },

  // 무화과나무: 굽은 줄기와 넓은 잎 덩이
  // state 'withered'면 잎이 갈색으로 마르며 줄어든다 (열매 없는 무화과나무)
  figtree() {
    const g = new THREE.Group(), bark = mat('#6e5640'), leaf = mat('#5f7f3a', { roughness: 0.9 });
    const trunk = mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.6, 8), bark, g, [0, 0.3, 0]); trunk.rotation.z = 0.12;
    const leaves = [[0, 0.72, 0, 0.22], [0.18, 0.62, 0.05, 0.16], [-0.17, 0.64, -0.03, 0.17], [0.05, 0.62, 0.18, 0.15], [-0.04, 0.6, -0.17, 0.15]].map(([x, y, z, r]) => mesh(sphere(r, 14, 10), leaf, g, [x, y, z], [1, 0.75, 1]));
    const green = new THREE.Color('#5f7f3a'), dry = new THREE.Color('#7a6038');
    return new Prop(g, (P, t, dt) => {
      const w = P.state === 'withered';
      leaf.color.lerp(w ? dry : green, 1 - Math.exp(-0.8 * dt));
      leaves.forEach(l => l.scale.setScalar(damp(l.scale.x, w ? 0.6 : 1, 0.6, dt)));
    });
  },

  // 돌항아리 여섯 개: state 'empty' | 'water' | 'wine' (포도주가 되면 은은히 빛난다)
  jars(o = {}) {
    const g = new THREE.Group(), stone = mat('#d2c6ae', { roughness: 0.95 }), tops = [];
    const water = new THREE.Color('#7fb0c0'), wine = new THREE.Color('#7a1f2e'), empty = new THREE.Color('#3a2e22');
    for (let i = 0; i < 6; i++) {
      const j = new THREE.Group();
      j.position.set((i - 2.5) * 0.17, 0, (i % 2) * 0.06);
      mesh(lathe([[0.001, 0], [0.05, 0], [0.068, 0.08], [0.064, 0.17], [0.045, 0.22], [0.05, 0.24], [0.001, 0.24]], 20), stone, j);
      const top = mesh(new THREE.CircleGeometry(0.043, 20), new THREE.MeshStandardMaterial({ color: empty, roughness: 0.2, emissive: '#000000' }), j, [0, 0.235, 0]);
      top.rotation.x = -Math.PI / 2; top.castShadow = false;
      tops.push(top);
      g.add(j);
    }
    const glow = glowSprite(1.1, 0);
    glow.position.y = 0.25;
    g.add(glow);
    return new Prop(g, (P, t, dt) => {
      const want = P.state === 'wine' ? wine : P.state === 'water' ? water : empty;
      tops.forEach(tp => { tp.material.color.lerp(want, 1 - Math.exp(-1.5 * dt)); tp.material.emissive.set(P.state === 'wine' ? '#3a0810' : '#000000'); });
      glow.material.opacity = damp(glow.material.opacity, P.state === 'wine' ? 0.45 + Math.sin(t * 2) * 0.1 : 0, 1.5, dt);
    }, { state: 'empty' });
  },

  // 잔칫상: 낮고 긴 상과 음식
  feast(o = {}) {
    const g = new THREE.Group(), w = wood();
    mesh(new THREE.BoxGeometry(o.len || 1.2, 0.03, 0.3), mat('#e9dfc8'), g, [0, 0.12, 0]);
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, b]) => mesh(new THREE.BoxGeometry(0.03, 0.12, 0.03), w, g, [a * ((o.len || 1.2) / 2 - 0.05), 0.06, b * 0.12]));
    const food = [['#c99a5a', 0.04], ['#7a1f2e', 0.03], ['#8fa45a', 0.035], ['#d6a93a', 0.03]];
    for (let i = 0; i < 9; i++) { const [c, r] = food[i % 4]; mesh(sphere(r, 10, 8), mat(c), g, [(i / 8 - 0.5) * ((o.len || 1.2) - 0.2), 0.15, (i % 2 - 0.5) * 0.12], [1, 0.6, 1]); }
    return new Prop(g);
  },

  // 환전상의 상: state 'over'면 옆으로 넘어지고 동전이 쏟아진다
  table() {
    const g = new THREE.Group(), top = new THREE.Group(), w = wood(), coin = mat('#d6a93a', { metalness: 0.6, roughness: 0.35 });
    g.add(top);
    mesh(new THREE.BoxGeometry(0.34, 0.025, 0.2), w, top, [0, 0.16, 0]);
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, b]) => mesh(new THREE.BoxGeometry(0.025, 0.15, 0.025), w, top, [a * 0.15, 0.075, b * 0.08]));
    const coins = [];
    for (let i = 0; i < 10; i++) coins.push(mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.004, 10), coin, g, [(Math.random() - 0.5) * 0.25, 0.177, (Math.random() - 0.5) * 0.14]));
    const start = coins.map(c => c.position.clone()), spill = coins.map(() => new THREE.Vector3((Math.random() - 0.5) * 0.6, 0.004, 0.08 + Math.random() * 0.3));
    return new Prop(g, (P, t, dt) => {
      const over = P.state === 'over' ? 1 : 0;
      top.rotation.x = damp(top.rotation.x, over * 1.45, 4, dt);
      top.position.y = damp(top.position.y, over * 0.0, 4, dt);
      coins.forEach((c, i) => c.position.lerp(over ? spill[i] : start[i], 1 - Math.exp(-3 * dt)));
    });
  },

  // 비둘기 장: 나무 우리 안의 하얀 새들
  cage() {
    const g = new THREE.Group(), w = wood();
    mesh(new THREE.BoxGeometry(0.22, 0.015, 0.14), w, g, [0, 0.008, 0]);
    mesh(new THREE.BoxGeometry(0.22, 0.015, 0.14), w, g, [0, 0.15, 0]);
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, b]) => mesh(new THREE.BoxGeometry(0.012, 0.15, 0.012), w, g, [a * 0.1, 0.075, b * 0.06]));
    for (let i = -2; i <= 2; i++) mesh(new THREE.BoxGeometry(0.004, 0.13, 0.004), w, g, [i * 0.04, 0.075, 0.068]);
    [-0.05, 0.05].forEach(x => mesh(sphere(0.03, 10, 8), mat('#f4f1ea'), g, [x, 0.04, 0], [1.3, 0.9, 0.9]));
    return new Prop(g);
  },
});

Object.assign(MAKERS, {
  // 등잔 하나가 놓인 낮은 상: 흔들리는 불빛이 둘러앉은 사람의 얼굴을 비춘다 (밤의 방)
  lamp() {
    const g = new THREE.Group(), w = wood();
    mesh(new THREE.BoxGeometry(0.22, 0.02, 0.16), w, g, [0, 0.09, 0]);
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, b]) => mesh(new THREE.BoxGeometry(0.02, 0.09, 0.02), w, g, [a * 0.09, 0.045, b * 0.06]));
    const clay = mat('#a8673e', { roughness: 0.9 });
    mesh(sphere(0.035, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), clay, g, [0, 0.1, 0], [1.3, 0.55, 1]);
    mesh(new THREE.CylinderGeometry(0.008, 0.012, 0.03, 8), clay, g, [0.045, 0.11, 0]).rotation.z = -1.2;
    const flame = mesh(new THREE.ConeGeometry(0.011, 0.035, 8), mat('#ffd27a', { emissive: '#ffb347', emissiveIntensity: 2.5 }), g, [0.058, 0.135, 0]);
    flame.castShadow = false;
    const halo = glowSprite(0.55, 0.8);
    halo.position.set(0.058, 0.14, 0);
    g.add(halo);
    const light = new THREE.PointLight('#ffc070', 1.8, 1.8, 1.4);
    light.position.set(0.058, 0.25, 0.05);
    g.add(light);
    return new Prop(g, (P, t) => {
      const f = 1 + Math.sin(t * 9) * 0.06 + Math.sin(t * 23) * 0.04;
      flame.scale.set(1, f, 1); halo.material.opacity = 0.7 * f * P.show;
      light.intensity = 1.8 * f * P.show;
    });
  },

  // 우물: 돌을 쌓은 둥근 둘레, 어두운 물, 두레박을 매다는 나무 틀 (야곱의 우물)
  well() {
    const g = new THREE.Group(), stone = mat('#b8a888', { roughness: 1, flatShading: true });
    mesh(lathe([[0.15, 0], [0.17, 0], [0.17, 0.14], [0.15, 0.15], [0.13, 0.14], [0.13, 0.02]], 18), stone, g).receiveShadow = true;
    mesh(new THREE.CircleGeometry(0.13, 20), mat('#1c2a2e', { roughness: 0.2 }), g, [0, 0.08, 0]).rotation.x = -Math.PI / 2;
    const w = wood();
    [-1, 1].forEach(s => mesh(new THREE.BoxGeometry(0.02, 0.32, 0.02), w, g, [s * 0.15, 0.3, 0]));
    mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.34, 8), w, g, [0, 0.44, 0]).rotation.z = Math.PI / 2;
    mesh(new THREE.CylinderGeometry(0.002, 0.002, 0.2, 4), mat('#6b5a44'), g, [0, 0.34, 0]);
    mesh(new THREE.CylinderGeometry(0.025, 0.02, 0.035, 10), mat('#7a5634'), g, [0, 0.23, 0]);
    return new Prop(g);
  },

  // 땅에 놓인 물동이 하나 (여인이 버려 두고 간)
  pot() {
    const g = new THREE.Group();
    mesh(lathe([[0.001, 0], [0.035, 0], [0.058, 0.05], [0.055, 0.1], [0.03, 0.13], [0.034, 0.15], [0.001, 0.15]], 18), mat('#b5653e', { roughness: 0.9 }), g);
    return new Prop(g);
  },

  // 회당: 뒤쪽 돌벽과 기둥, 양옆의 돌 의자, 가운데 낭독대 (나사렛)
  synagogue(o = {}) {
    const g = new THREE.Group(), stone = mat('#d8ccb2', { roughness: 0.9 }), shade = mat('#b9ab8e', { roughness: 1 });
    mesh(new THREE.BoxGeometry(2.0, 0.05, 1.1), shade, g, [0, 0.025, 0.1]).receiveShadow = true;
    mesh(new THREE.BoxGeometry(1.9, 0.62, 0.08), stone, g, [0, 0.31, -0.45]);
    for (let i = 0; i < 5; i++) mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.62, 12), stone, g, [-0.8 + i * 0.4, 0.31, -0.37]);
    mesh(new THREE.BoxGeometry(1.95, 0.05, 0.16), stone, g, [0, 0.64, -0.4]);
    [-1, 1].forEach(s => mesh(new THREE.BoxGeometry(0.16, 0.1, 0.95), shade, g, [s * 0.88, 0.075, 0.05]).receiveShadow = true);
    // 두루마리를 넣어 두는 궤(벽 가운데)와 낭독대
    mesh(new THREE.BoxGeometry(0.22, 0.22, 0.08), mat('#7a5634'), g, [0, 0.2, -0.38]);
    mesh(new THREE.BoxGeometry(0.14, 0.18, 0.1), wood(), g, [0.05, 0.12, -0.12]);
    return new Prop(g);
  },

  // 그물: 바닥에 펼친 그물망. state 'full'이면 은빛 고기가 가득 차 불룩해진다
  net(o = {}) {
    const g = new THREE.Group();
    const tex = (() => {
      const c = document.createElement('canvas'); c.width = c.height = 64;
      const x = c.getContext('2d'); x.strokeStyle = 'rgba(70,58,40,0.9)'; x.lineWidth = 2;
      for (let i = 0; i <= 64; i += 8) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 64); x.stroke(); x.beginPath(); x.moveTo(0, i); x.lineTo(64, i); x.stroke(); }
      const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 3); return t;
    })();
    const sheet = mesh(new THREE.CircleGeometry(0.32, 24), new THREE.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: 0.3, side: THREE.DoubleSide, roughness: 1 }), g, [0, 0.012, 0], [1, 0.75, 1]);
    sheet.rotation.x = -Math.PI / 2; sheet.castShadow = false;
    const fish = new THREE.Group(), silver = mat('#c9d2d6', { metalness: 0.5, roughness: 0.35 });
    for (let i = 0; i < 26; i++) {
      const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 0.22;
      const f = mesh(new THREE.CapsuleGeometry(0.012, 0.045, 4, 8), silver, fish, [Math.cos(a) * r, 0.02 + Math.random() * 0.05, Math.sin(a) * r * 0.75]);
      f.rotation.set(Math.random(), Math.random() * 3, Math.PI / 2);
    }
    g.add(fish);
    return new Prop(g, (P, t, dt) => {
      const k = damp(fish.scale.x, P.state === 'full' ? 1 : 0.0001, 2.5, dt);
      fish.scale.setScalar(k); fish.visible = k > 0.02;
      fish.children.forEach((f, i) => { f.rotation.y += Math.sin(t * 6 + i) * 0.02 * k; });
    }, { state: 'empty' });
  },
});

Object.assign(MAKERS, {
  // 세관: 동전이 쌓인 상과 햇볕 가리개 (호숫가 길목)
  booth() {
    const g = new THREE.Group(), w = wood(), coin = mat('#d6a93a', { metalness: 0.6, roughness: 0.35 });
    mesh(new THREE.BoxGeometry(0.36, 0.025, 0.2), w, g, [0, 0.17, 0]);
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, b]) => mesh(new THREE.BoxGeometry(0.025, 0.17, 0.025), w, g, [a * 0.16, 0.085, b * 0.08]));
    [[-0.08, 0], [0.02, 0.03], [0.1, -0.02]].forEach(([x, z], i) => { for (let k = 0; k < 3 + i; k++) mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.005, 10), coin, g, [x, 0.185 + k * 0.006, z]); });
    [-1, 1].forEach(s => mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.55, 6), w, g, [s * 0.22, 0.275, -0.14]));
    const cloth = mesh(new THREE.BoxGeometry(0.5, 0.008, 0.3), mat('#b0402e', { ...DS, roughness: 0.9 }), g, [0, 0.55, -0.04]);
    cloth.rotation.x = 0.25;
    return new Prop(g);
  },

  // 베데스다 못: 돌 둘레의 네모난 물과 뒤편의 기둥 회랑
  pool(o = {}) {
    const g = new THREE.Group(), W = o.w || 1.4, D = o.d || 0.4, stone = mat('#d8ccb2', { roughness: 0.9 });
    mesh(new THREE.BoxGeometry(W + 0.12, 0.05, D + 0.12), stone, g, [0, 0.025, 0]).receiveShadow = true;
    const water = mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ color: '#6f97a0', roughness: 0.2, metalness: 0.1 }), g, [0, 0.052, 0]);
    water.rotation.x = -Math.PI / 2; water.castShadow = false;
    const n = Math.round(W / 0.28) + 1;
    for (let i = 0; i < n; i++) mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.55, 12), stone, g, [-W / 2 + i * (W / (n - 1)), 0.3, -D / 2 - 0.22]);
    mesh(new THREE.BoxGeometry(W + 0.2, 0.05, 0.2), stone, g, [0, 0.6, -D / 2 - 0.22]);
    // 물이 움직일 때의 잔물결
    return new Prop(g, (P, t) => { water.position.y = 0.052 + Math.sin(t * 1.5) * 0.002; });
  },
});

Object.assign(MAKERS, {
  // 들꽃: 비탈에 흩어진 작은 꽃들 (들의 백합화)
  flowers(o = {}) {
    const g = new THREE.Group(), cols = ['#f3ece0', '#e9c75a', '#c0607a', '#b9a0d6'], stem = mat('#6f8c40');
    for (let i = 0; i < (o.n || 28); i++) {
      const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * (o.r || 0.6), x = Math.cos(a) * r, z = Math.sin(a) * r * 0.6;
      mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.05, 4), stem, g, [x, 0.025, z]);
      mesh(sphere(0.014, 8, 6), mat(cols[i % cols.length], { roughness: 0.7 }), g, [x, 0.055, z]);
    }
    return new Prop(g);
  },

  // 성문: 돌담 사이의 아치 문 (나인)
  gate(o = {}) {
    const g = new THREE.Group(), stone = mat('#c8b896', { roughness: 1, flatShading: true });
    [-1, 1].forEach(s => mesh(new THREE.BoxGeometry(0.55, 0.42, 0.14), stone, g, [s * 0.42, 0.21, 0]).receiveShadow = true);
    [-1, 1].forEach(s => mesh(new THREE.BoxGeometry(0.1, 0.5, 0.18), stone, g, [s * 0.16, 0.25, 0]));
    const arch = mesh(new THREE.TorusGeometry(0.16, 0.05, 6, 16, Math.PI), stone, g, [0, 0.5, 0]);
    arch.scale.z = 1.8;
    mesh(new THREE.BoxGeometry(0.22, 0.48, 0.02), mat('#2a1c10'), g, [0, 0.24, -0.06]);
    return new Prop(g);
  },

  // 상여: 네 손잡이가 달린 들것. deck에 누운 사람을 싣는다
  bier(o = {}) {
    const g = new THREE.Group(), w = wood();
    mesh(new THREE.BoxGeometry(0.62, 0.025, 0.2), w, g, [0, 0.25, 0]);
    [-1, 1].forEach(s => mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.95, 6), w, g, [0, 0.24, s * 0.11]).rotation.z = Math.PI / 2);
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, b]) => mesh(new THREE.BoxGeometry(0.02, 0.24, 0.02), w, g, [a * 0.26, 0.12, b * 0.08]));
    const deck = new THREE.Group();
    deck.position.y = 0.24;
    g.add(deck);
    const P = new Prop(g);
    P.deck = deck;
    return P;
  },

  // 밭: 갈아 놓은 흙과 이랑. state 'grow'면 이삭이 자라 오른다 (씨 뿌리는 비유)
  field(o = {}) {
    const g = new THREE.Group(), W = o.w || 0.9, D = o.d || 0.45;
    mesh(new THREE.BoxGeometry(W, 0.012, D), mat('#8a6a48', { roughness: 1 }), g, [0, 0.006, 0]).receiveShadow = true;
    for (let i = 0; i < 5; i++) mesh(new THREE.BoxGeometry(W * 0.95, 0.01, 0.02), mat('#755a3c'), g, [0, 0.014, -D / 2 + (i + 0.5) * D / 5]);
    const crop = new THREE.Group(), stalk = mat('#c9b25a', { roughness: 0.9 });
    for (let i = 0; i < 40; i++) mesh(new THREE.CylinderGeometry(0.004, 0.006, 0.12, 4), stalk, crop, [(Math.random() - 0.5) * W * 0.9, 0.06, (Math.random() - 0.5) * D * 0.85]);
    g.add(crop);
    return new Prop(g, (P, t, dt) => {
      const k = damp(crop.scale.y, P.state === 'grow' ? 1 : 0.0001, 1.2, dt);
      crop.scale.set(1, k, 1); crop.visible = k > 0.02;
      crop.rotation.z = Math.sin(t * 0.9) * 0.03;
    }, { state: 'bare' });
  },
});

Object.assign(MAKERS, {
  // 바위 벼랑과 벽감, 그 밑에서 솟는 샘 (가이사랴 빌립보, 헤르몬산 기슭)
  cliffshrine(o = {}) {
    const g = new THREE.Group(), rock = mat('#a8977c', { roughness: 1, flatShading: true });
    mesh(new THREE.BoxGeometry(1.6, 0.75, 0.3), rock, g, [0, 0.375, 0]).receiveShadow = true;
    [[-0.9, 0.5, 0.35], [0.95, 0.42, 0.3], [0.2, 0.8, 0.28]].forEach(([x, y, r]) => mesh(new THREE.DodecahedronGeometry(r, 0), rock, g, [x, y * 0.6, 0.02], [1, 0.9, 0.7]));
    [-0.5, -0.15, 0.2, 0.55].forEach(x => {
      mesh(new THREE.BoxGeometry(0.14, 0.22, 0.05), mat('#3a2e24'), g, [x, 0.42, 0.14]);
      mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 12, 1, false, 0, Math.PI), mat('#3a2e24'), g, [x, 0.53, 0.14]).rotation.set(Math.PI / 2, 0, Math.PI / 2);
    });
    const spring = mesh(new THREE.CircleGeometry(0.3, 24), new THREE.MeshStandardMaterial({ color: '#7aa3ab', roughness: 0.2, transparent: true, opacity: 0.85 }), g, [0.1, 0.012, 0.35], [1.6, 0.6, 1]);
    spring.rotation.x = -Math.PI / 2; spring.castShadow = false;
    return new Prop(g);
  },

  // 빛나는 구름: 부드러운 흰 덩이들이 피어오르며 산 위를 덮는다 (show로 짙어진다)
  cloud(o = {}) {
    const g = new THREE.Group(), m = mat('#ffffff', { emissive: '#fff3d0', emissiveIntensity: 0.6, transparent: true, opacity: 0.8, depthWrite: false });
    const puffs = [];
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2, r = 0.35 + Math.random() * 0.45;
      puffs.push(mesh(sphere(0.22 + Math.random() * 0.15, 16, 12), m, g, [Math.cos(a) * r * 1.4, 0.3 + Math.random() * 0.5, Math.sin(a) * r * 0.5]));
    }
    puffs.forEach(p => { p.castShadow = false; });
    const glow = glowSprite(2.6, 0.7); glow.position.y = 0.6; g.add(glow);
    return new Prop(g, (P, t, dt) => { m.opacity = 0.75 * P.show; glow.material.opacity = 0.6 * P.show; puffs.forEach((p, i) => { p.position.y += Math.sin(t * 0.6 + i) * 0.0006; }); g.position.y = damp(g.position.y, P.y ?? g.position.y, 0.8, dt); }, { fade: 'opacity' });
  },

  // 초막: 나뭇가지로 지붕을 엮은 작은 오두막 (초막절)
  sukkah() {
    const g = new THREE.Group(), w = wood(), leaf = mat('#6f8c40', { roughness: 1 });
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, b]) => mesh(new THREE.BoxGeometry(0.02, 0.36, 0.02), w, g, [a * 0.16, 0.18, b * 0.12]));
    for (let i = 0; i < 7; i++) mesh(new THREE.BoxGeometry(0.4, 0.025, 0.035), leaf, g, [0, 0.37, -0.12 + i * 0.04]).rotation.y = (Math.random() - 0.5) * 0.3;
    mesh(new THREE.BoxGeometry(0.34, 0.3, 0.01), mat('#c8b48c', { ...DS }), g, [0, 0.17, -0.12]);
    return new Prop(g);
  },
});

Object.assign(MAKERS, {
  // 종려나무: 비늘진 줄기와 늘어진 잎 (여리고 오아시스)
  palm(o = {}) {
    const g = new THREE.Group(), bark = mat('#8a7050', { roughness: 1 }), leaf = mat('#5f8a3a', { ...DS, roughness: 0.9 });
    const H = o.h || 0.9;
    for (let i = 0; i < 8; i++) mesh(new THREE.CylinderGeometry(0.03, 0.036, H / 8 + 0.01, 8), bark, g, [Math.sin(i * 0.3) * 0.02, H / 16 + i * H / 8, 0]);
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2, f = new THREE.Group();
      f.position.set(0, H, 0); f.rotation.y = a; g.add(f);
      const l = mesh(new THREE.BoxGeometry(0.34, 0.006, 0.07), leaf, f, [0.16, -0.05, 0]); l.rotation.z = -0.45;
    }
    return new Prop(g);
  },

  // 길에 편 겉옷들 (입성 행렬)
  cloaks(o = {}) {
    const g = new THREE.Group(), cols = ['#a3554a', '#3c5d96', '#b9a07a', '#5d6b4a', '#c99a3a', '#7a3b2e'];
    for (let i = 0; i < (o.n || 7); i++) {
      const c = mesh(new THREE.BoxGeometry(0.22, 0.008, 0.16), mat(cols[i % cols.length], { roughness: 1 }), g, [(i - (o.n || 7) / 2) * 0.26, 0.005, (i % 2) * 0.06]);
      c.rotation.y = (Math.random() - 0.5) * 0.5; c.castShadow = false; c.receiveShadow = true;
    }
    return new Prop(g);
  },

  // 성벽: 탑이 있는 돌담 (멀리 보이는 예루살렘)
  walls(o = {}) {
    const g = new THREE.Group(), stone = mat('#d8c8a6', { roughness: 0.95 }), W = o.w || 2.2;
    mesh(new THREE.BoxGeometry(W, 0.32, 0.12), stone, g, [0, 0.16, 0]).receiveShadow = true;
    for (let i = 0; i <= 4; i++) mesh(new THREE.BoxGeometry(0.16, 0.44, 0.18), stone, g, [-W / 2 + i * W / 4, 0.22, 0]);
    for (let i = 0; i < 18; i++) mesh(new THREE.BoxGeometry(0.05, 0.04, 0.13), stone, g, [-W / 2 + 0.06 + i * (W - 0.12) / 17, 0.34, 0]);
    mesh(new THREE.BoxGeometry(0.5, 0.36, 0.3), mat('#ece4d2'), g, [0.25, 0.5, -0.2]); // 성전의 윤곽
    mesh(new THREE.BoxGeometry(0.52, 0.03, 0.32), mat('#d6a93a', { metalness: 0.5, roughness: 0.4 }), g, [0.25, 0.69, -0.2]);
    return new Prop(g);
  },
});

Object.assign(MAKERS, {
  // 헌금함: 나팔 모양 입구가 달린 나무 궤 (성전 뜰)
  treasury() {
    const g = new THREE.Group(), w = wood(), brass = mat('#c99a3a', { metalness: 0.55, roughness: 0.4 });
    mesh(new THREE.BoxGeometry(0.22, 0.2, 0.16), w, g, [0, 0.1, 0]);
    mesh(new THREE.CylinderGeometry(0.07, 0.02, 0.14, 14, 1, true), mat('#c99a3a', { ...DS, metalness: 0.55, roughness: 0.4 }), g, [0, 0.27, 0]);
    mesh(new THREE.TorusGeometry(0.07, 0.006, 6, 18), brass, g, [0, 0.34, 0]).rotation.x = Math.PI / 2;
    return new Prop(g);
  },

  // 대야와 물동이 (발 씻기기, 손 씻는 빌라도)
  basin() {
    const g = new THREE.Group();
    mesh(lathe([[0.001, 0], [0.07, 0], [0.11, 0.05], [0.115, 0.06], [0.001, 0.02]], 20), mat('#a8673e', { ...DS, roughness: 0.85 }), g);
    const w = mesh(new THREE.CircleGeometry(0.1, 20), mat('#7fb0c0', { roughness: 0.2 }), g, [0, 0.045, 0]); w.rotation.x = -Math.PI / 2; w.castShadow = false;
    return new Prop(g);
  },

  // 올리브 나무: 비틀린 줄기와 은빛 초록 잎 덩이 (겟세마네)
  olive(o = {}) {
    const g = new THREE.Group(), bark = mat('#6a5a48', { roughness: 1 }), leaf = mat('#8a9a6a', { roughness: 0.9 });
    [[0, 0.2, 0, 0.25], [0.04, 0.42, 0.02, -0.35]].forEach(([x, y, z, r]) => { const t = mesh(new THREE.CylinderGeometry(0.035, 0.055, 0.42, 8), bark, g, [x, y, z]); t.rotation.z = r; });
    [[0.08, 0.68, 0, 0.2], [-0.12, 0.6, 0.05, 0.16], [0.2, 0.58, -0.05, 0.14], [-0.02, 0.62, -0.15, 0.15]].forEach(([x, y, z, r]) => mesh(sphere(r, 12, 10), leaf, g, [x, y, z], [1.2, 0.65, 1]));
    return new Prop(g);
  },

  // 숯불: 돌 화로의 불과 일렁이는 빛 (대제사장 집 안뜰)
  fire() {
    const g = new THREE.Group();
    mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.06, 14), mat('#5a4e42', { roughness: 1 }), g, [0, 0.03, 0]);
    const embers = mesh(sphere(0.08, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat('#ff7a2a', { emissive: '#ff5a10', emissiveIntensity: 2 }), g, [0, 0.055, 0], [1, 0.45, 1]);
    embers.castShadow = false;
    const halo = glowSprite(0.7, 0.8); halo.position.y = 0.14; g.add(halo);
    const light = new THREE.PointLight('#ff9a50', 2, 1.8, 1.4); light.position.y = 0.25; g.add(light);
    return new Prop(g, (P, t) => { const f = 1 + Math.sin(t * 11) * 0.08 + Math.sin(t * 27) * 0.05; light.intensity = 2 * f * P.show; halo.material.opacity = 0.7 * f * P.show; });
  },
});

export function makeProp(kind, x = 0, z = 0, o = {}) {
  const P = MAKERS[kind](o);
  P.obj.position.set(x, o.y || 0, z);
  P.goal.set(x, z);
  if (o.scale) { P.obj.scale.setScalar(o.scale); P.base = P.obj.scale.clone(); }
  if (o.size) { P.obj.scale.set(...o.size); P.base = P.obj.scale.clone(); } // 축마다 다른 크기 (물줄기를 길게 등)
  if (o.rot) P.obj.rotation.y = o.rot;
  if (o.speed) P.speed = o.speed;
  if (o.geo) P.geo = o.geo;               // 실제 위경도에 고정 (지도 확대와 무관하게 그 자리에)
  if (o.faceCenter) P.faceCenter = true;  // 무대 가운데(핀)를 바라보게
  return P;
}

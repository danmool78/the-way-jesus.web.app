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
      // 가는 동안은 뱃머리(+x 축)를 진행 방향으로, 도착하면 다시 옆모습(카메라와 나란히)으로 돌아선다
      let head = this.rest || 0;
      if (d > 0.08) { head = Math.atan2(-dz, dx); if (head > Math.PI / 2) head -= Math.PI; if (head < -Math.PI / 2) head += Math.PI; }
      this.obj.rotation.y = damp(this.obj.rotation.y, head, 1.6, dt);
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

export function makeProp(kind, x = 0, z = 0, o = {}) {
  const P = MAKERS[kind](o);
  P.obj.position.set(x, o.y || 0, z);
  P.goal.set(x, z);
  if (o.scale) { P.obj.scale.setScalar(o.scale); P.base = P.obj.scale.clone(); }
  if (o.rot) P.obj.rotation.y = o.rot;
  if (o.speed) P.speed = o.speed;
  if (o.geo) P.geo = o.geo;               // 실제 위경도에 고정 (지도 확대와 무관하게 그 자리에)
  if (o.faceCenter) P.faceCenter = true;  // 무대 가운데(핀)를 바라보게
  return P;
}

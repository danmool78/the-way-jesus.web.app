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
    const m = new THREE.MeshStandardMaterial({ color: '#6f97a0', roughness: 0.25, metalness: 0.1, transparent: true, depthWrite: false, alphaMap: radialTex('#ffffff', '#000000'), flatShading: false }); // depthWrite: 3D 지형에서 밑의 호수를 가려 투명한 가장자리로 호수 바닥이 비쳤다
    const w = new THREE.Mesh(geo, m);
    w.receiveShadow = true; w.renderOrder = 2; // 모래·풀밭(투명한 바닥)보다 나중에 — 겹치면 바닥이 물을 덮어 물빛이 흐려졌다
    const g = new THREE.Group();
    g.add(w);
    const calm = new THREE.Color('#7aa3ab'), storm = new THREE.Color('#5f7f87'), red = new THREE.Color('#9a1c14');
    let amp = 0.01, blood = 0;
    const P = new Prop(g, (P, t, dt, env) => {
      // 폭풍 물결은 배 뱃전(물 위 약 0.15)을 넘지 않게: 넘으면 배가 물에 잠겨 사람만 물 위에 선 것처럼 보였다
      amp = damp(amp, 0.008 + (env.wave || 0) * 0.045, 1.2, dt);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = base[i * 3], z = base[i * 3 + 2];
        pos.array[i * 3 + 1] = amp * (Math.sin(x * 5 + t * 2.2) + Math.sin(z * 6.5 - t * 1.7) * 0.7 + Math.sin((x + z) * 9 + t * 3.1) * 0.35);
      }
      pos.needsUpdate = true;
      geo.computeVertexNormals();
      m.color.copy(calm).lerp(storm, Math.min(1, (env.wave || 0)));
      blood = damp(blood, P.state === 'blood' ? 1 : 0, 0.8, dt); if (blood > 0.01) m.color.lerp(red, blood); // 첫 재앙: 붉게 변한 나일
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
      rock.position.y = Math.sin(t * 1.9) * (0.005 + wv * 0.04) + wv * 0.05; // 높은 물결 위로 들려 오른다
    });
    P.deck = deck;
    return P;
  },

  // 물보라: 'go' 상태가 되면 퍼지는 물결 고리 세 겹과 튀어 오르는 물방울 (돼지 떼가 호수로 뛰어들 때)
  splash(o = {}) {
    const g = new THREE.Group(), R = o.r || 0.25;
    const ringM = new THREE.MeshBasicMaterial({ color: '#e9f3f4', transparent: true, depthWrite: false });
    const rings = [0, 1, 2].map(() => { const r = new THREE.Mesh(new THREE.RingGeometry(0.8, 1, 32), ringM.clone()); r.rotation.x = -Math.PI / 2; r.position.y = 0.01; g.add(r); return r; });
    const dropM = new THREE.MeshStandardMaterial({ color: '#d8ecef', roughness: 0.2, transparent: true });
    const drops = Array.from({ length: 16 }, (_, i) => {
      const d = mesh(sphere(0.012 + Math.random() * 0.01, 6, 4), dropM, g);
      d.userData = { a: (i / 16) * Math.PI * 2 + Math.random() * 0.3, v: 0.5 + Math.random() * 0.6, h: 0.9 + Math.random() * 0.8 };
      return d;
    });
    g.visible = false;
    return new Prop(g, P => {
      const k = P.state === 'go' ? performance.now() / 1000 - P.t0 : -1;
      g.visible = k >= 0 && k < 2.2;
      if (!g.visible) return;
      rings.forEach((r, i) => { const u = Math.max(0, k - i * 0.25); r.scale.setScalar(R * (0.2 + u * 1.3)); r.material.opacity = Math.max(0, 0.75 - u * 0.4); });
      drops.forEach(d => {
        const { a, v, h } = d.userData, u = Math.min(k, 1.2);
        d.position.set(Math.cos(a) * v * u * R * 1.6, Math.max(0, h * u - 1.6 * u * u) * R * 2, Math.sin(a) * v * u * R * 1.6);
        d.visible = k < 1.2;
      });
    }, { fade: 'opacity' });
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
    const geo = sphere(1, 40, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    let m = mat(o.color || '#857664', { roughness: 1 });
    if (o.soft) { // 밑동을 서서히 투명하게 — 무대는 지도 위에 겹쳐 그리는 그림이라 언덕 테두리가 또렷하면 땅 위에 얹힌 접시처럼 떠 보인다
      const p = geo.attributes.position, c = [];
      for (let i = 0; i < p.count; i++) { const a = THREE.MathUtils.smoothstep(p.getY(i), 0, 0.22); c.push(1, 1, 1, a); }
      geo.setAttribute('color', new THREE.Float32BufferAttribute(c, 4));
      m = new THREE.MeshStandardMaterial({ color: o.color || '#857664', roughness: 1, vertexColors: true, transparent: true, depthWrite: false });
    }
    const h = mesh(geo, m, g, [0, 0, 0], [W, Hh, D]);
    h.receiveShadow = true;
    if (o.soft) h.castShadow = false; // 비치는 밑동이 바닥에 진한 그림자 테를 만들지 않게
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
  const H = 0.24 * S * (o.legs || 1), F = o.fat || 1, LN = o.len || 1; // 등 높이 (돼지는 다리가 짧다), 몸통 굵기·길이
  mesh(new THREE.CapsuleGeometry(0.075 * S * F, 0.2 * S * LN, 8, 14), coat, body, [0, H, 0]).rotation.z = Math.PI / 2;
  if (o.hump) mesh(sphere(0.08 * S, 14, 10), coat, body, [-0.01 * S, H + 0.07 * S, 0], [1.1, 1, 0.85]);
  const neck = new THREE.Group();
  neck.position.set((0.1 * LN + 0.05 * F) * S, H + 0.03 * S, 0);
  body.add(neck);
  // 목: 어깨에서 뻗은 원통. 낙타(curve)는 앞으로 처졌다가 들어 올리는 S자 곡선.
  // 머리는 목 끝점에 붙인다 (목 길이·모양이 달라도 떨어지지 않게 끝점을 계산)
  let tip;
  if (o.curve) {
    const pts = o.curve.map(([x, y]) => new THREE.Vector3(x * S, y * S, 0));
    const tube = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, 0.034 * S, 10);
    // 목뿌리는 굵고 머리 쪽은 가늘게
    const tp = tube.attributes.position, c = new THREE.Vector3();
    for (let i = 0; i < tp.count; i++) {
      const k = Math.floor(i / 11) / 16, q = new THREE.Vector3().fromBufferAttribute(tp, i);
      new THREE.CatmullRomCurve3(pts).getPoint(k, c);
      q.sub(c).multiplyScalar(1.25 - 0.55 * k).add(c);
      tp.setXYZ(i, q.x, q.y, q.z);
    }
    tube.computeVertexNormals();
    mesh(tube, coat, neck);
    mesh(sphere(0.045 * S, 12, 10), coat, neck, [0.005 * S, -0.005 * S, 0]); // 목뿌리를 몸에 묻는 둥근 어깨 (원통의 열린 끝을 가린다)
    tip = pts[pts.length - 1];
  } else {
    const nl = (o.neck || 0.12) * S, na = o.neckTilt ?? 0.55, nd = [Math.sin(na), Math.cos(na)];
    mesh(new THREE.CapsuleGeometry(0.035 * S, nl, 6, 10), coat, neck, [nd[0] * nl / 2, nd[1] * nl / 2, 0]).rotation.z = -na;
    tip = new THREE.Vector3(nd[0] * nl, nd[1] * nl, 0);
    if (o.mane) { // 갈기: 목덜미를 따라 선 짧은 털
      const m = mesh(new THREE.BoxGeometry(0.012 * S, nl * 0.95, 0.012 * S), dark, neck, [nd[0] * nl / 2 - 0.03 * S * nd[1], nd[1] * nl / 2 + 0.03 * S * nd[0], 0]);
      m.rotation.z = -na;
    }
  }
  const headG = new THREE.Group();
  headG.position.set(tip.x + 0.012 * S, tip.y + 0.02 * S, 0);
  neck.add(headG);
  if (o.pigHead) {
    // 돼지 머리: 둥근 머리 + 앞으로 내민 납작한 코(콧구멍 둘) + 앞으로 접힌 귀
    headG.position.set(0.02 * S, -0.02 * S, 0);
    mesh(sphere(0.065 * S, 14, 12), coat, headG, [0.03 * S, 0, 0], [1.1, 0.95, 1]);
    const sn = mesh(new THREE.CylinderGeometry(0.03 * S, 0.035 * S, 0.04 * S, 14), coat, headG, [0.1 * S, -0.012 * S, 0]);
    sn.rotation.z = Math.PI / 2;
    mesh(new THREE.CylinderGeometry(0.029 * S, 0.029 * S, 0.004 * S, 14), dark, headG, [0.121 * S, -0.012 * S, 0]).rotation.z = Math.PI / 2;
    [-1, 1].forEach(k => mesh(sphere(0.006 * S, 6, 4), mat('#5a2e2a'), headG, [0.123 * S, -0.012 * S, k * 0.011 * S]));
    [-1, 1].forEach(k => mesh(sphere(0.006 * S, 6, 4), mat('#120c08'), headG, [0.07 * S, 0.022 * S, k * 0.035 * S]));
    [-1, 1].forEach(k => { const e = mesh(new THREE.ConeGeometry(0.025 * S, 0.05 * S, 4), coat, headG, [0.04 * S, 0.06 * S, k * 0.04 * S]); e.rotation.set(k * 0.3, 0, -0.9); });
  } else if (o.camelHead) {
    // 낙타 머리: 길쭉한 머리 + 늘어진 아랫입술 + 작고 둥근 귀
    mesh(new THREE.CapsuleGeometry(0.03 * S, 0.075 * S, 6, 12), coat, headG, [0.045 * S, -0.008 * S, 0]).rotation.z = Math.PI / 2 + 0.25;
    mesh(sphere(0.026 * S, 12, 10), coat, headG, [0.1 * S, -0.03 * S, 0], [1.1, 0.9, 0.95]);           // 주둥이
    mesh(sphere(0.016 * S, 10, 8), dark, headG, [0.105 * S, -0.052 * S, 0], [1.3, 0.6, 1]);           // 처진 입술
    [-1, 1].forEach(k => mesh(sphere(0.006 * S, 6, 4), mat('#120c08'), headG, [0.04 * S, 0.012 * S, k * 0.027 * S]));
    [-1, 1].forEach(k => mesh(sphere(0.012 * S, 8, 6), coat, headG, [0.0, 0.026 * S, k * 0.022 * S], [0.6, 1, 0.5]));
  } else {
    mesh(new THREE.CapsuleGeometry(0.035 * S, 0.07 * S, 6, 10), coat, headG, [0.04 * S, 0, 0]).rotation.z = Math.PI / 2 + 0.35;
    mesh(sphere(0.03 * S, 10, 8), dark, headG, [0.09 * S, -0.025 * S, 0]);
    [-1, 1].forEach(k => mesh(sphere(0.006 * S, 6, 4), mat('#120c08'), headG, [0.045 * S, 0.012 * S, k * 0.03 * S]));
    [-1, 1].forEach(k => { const e = mesh(new THREE.ConeGeometry(0.014 * S, (o.ears || 0.07) * S, 6), coat, headG, [0.0, 0.04 * S, k * 0.022 * S]); e.rotation.x = k * 0.35; });
  }
  const legs = [[0.1, 1], [0.1, -1], [-0.1, 1], [-0.1, -1]].map(([x, s]) => {
    const l = new THREE.Group();
    l.position.set(x * S * LN, H - 0.02 * S, s * 0.045 * S * F);
    body.add(l);
    if (o.camelHead) {
      mesh(new THREE.CylinderGeometry(0.02 * S, 0.012 * S, H * 0.5, 8), coat, l, [0, -H * 0.25, 0]);   // 넓적다리
      mesh(sphere(0.016 * S, 8, 6), coat, l, [0, -H * 0.52, 0]);                                      // 무릎 마디
      mesh(new THREE.CylinderGeometry(0.011 * S, 0.01 * S, H * 0.46, 8), coat, l, [0, -H * 0.76, 0]);  // 정강이
      mesh(sphere(0.022 * S, 10, 6), dark, l, [0.004 * S, -H + 0.008 * S, 0], [1.25, 0.45, 1.1]);     // 넓은 발바닥
    } else {
      mesh(new THREE.CylinderGeometry(0.018 * S, 0.014 * S, H, 8), coat, l, [0, -H / 2, 0]);
      mesh(new THREE.CylinderGeometry(0.017 * S, 0.017 * S, 0.02 * S, 8), dark, l, [0, -H + 0.01 * S, 0]);
    }
    return l;
  });
  const tail = mesh(new THREE.CylinderGeometry(0.006 * S, 0.004 * S, 0.12 * S, 6), dark, body, [-0.19 * S, H - 0.03 * S, 0]);
  tail.rotation.z = -0.3;
  if (o.curl) { tail.visible = false; mesh(new THREE.TorusGeometry(0.018 * S, 0.006 * S, 6, 12, Math.PI * 1.6), coat, body, [-(0.1 * LN + 0.075 * F) * S - 0.01 * S, H + 0.03 * S, 0]); } // 돼지의 말린 꼬리
  else mesh(new THREE.ConeGeometry(0.01 * S, 0.035 * S, 6), dark, tail, [0, -0.07 * S, 0]).rotation.x = Math.PI; // 꼬리 끝의 털 술
  if (o.saddle && o.hump) {
    // 혹을 덮어 양옆으로 늘어진 안장 천 + 금빛 단
    const cl = mat(o.saddle, { side: THREE.DoubleSide, roughness: 0.9 });
    mesh(sphere(0.092 * S, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.62), cl, body, [-0.01 * S, H + 0.05 * S, 0], [1.15, 1.05, 1.05]);
    mesh(new THREE.TorusGeometry(0.087 * S, 0.006 * S, 6, 24), mat('#d6a93a', { metalness: 0.4, roughness: 0.4 }), body, [-0.01 * S, H + 0.02 * S, 0], [1.15, 1.05, 1]).rotation.x = Math.PI / 2;
  } else if (o.saddle) mesh(new THREE.BoxGeometry(0.16 * S, 0.02 * S, 0.17 * S), mat(o.saddle), body, [-0.02 * S, H + 0.075 * S, 0]);
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
    // 'dive': 목표(물가)에 닿으면 그 자리에 물보라를 일으키며 가라앉아 사라진다 (프레임 속도와 상관없이 닿은 뒤에)
    if (P.state === 'dive') {
      if (P.dived === undefined && !P.moving && P.goal.distanceTo(new THREE.Vector2(g.position.x, g.position.z)) < 0.05) {
        P.dived = t;
        if (!P.spray) { P.spray = MAKERS.splash({ r: 0.22 * S }); g.parent.add(P.spray.obj); }
        P.spray.obj.position.set(g.position.x, 0, g.position.z); P.spray.state = 'go'; P.spray.t0 = performance.now() / 1000;
      }
      if (P.dived !== undefined) { g.position.y = damp(g.position.y, -0.3, 2.5, dt); if (t - P.dived > 0.9) P.showT = 0; }
    } else if (P.dived !== undefined) { P.dived = undefined; g.position.y = 0; if (P.spray) P.spray.state = 'idle'; }
    if (P.spray) P.spray.upd(P.spray, t, dt, {});
    tail.rotation.x = Math.sin(t * 1.3) * 0.25;
  });
  P.deck = deck;
  P.directional = true;
  return P;
}

Object.assign(MAKERS, {
  // 크기는 사람(키 약 0.88)과의 비례로: 나귀 등은 허벅지 높이, 낙타 등은 어깨 높이쯤
  donkey: o => beast({ coat: '#8d8073', dark: '#3e3630', size: 1.65, saddle: '#7a3b2e', ears: 0.08, mane: true, ...o }),
  camel: o => beast({ coat: '#c4a273', dark: '#7a5f3e', size: 2.5, hump: true, camelHead: true, curve: [[0, 0], [0.07, -0.03], [0.13, 0.02], [0.16, 0.12], [0.17, 0.19]], ears: 0.03, saddle: '#7a2a5e', ...o }),

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
    // 흙벽돌 집: 벽이 사람(키 0.88)보다 높고, 평평한 지붕에 낮은 난간, 옆벽을 따라 지붕으로 오르는 바깥 계단, 지붕 들보 끝
    const g = new THREE.Group(), wall = mat(o.wall || '#cdb48e', { roughness: 1 }), roof = mat('#a98f68', { roughness: 1 }), dark = mat('#2a1c10');
    const W = 1.05, H = 0.98, D = 0.78;
    const body = mesh(new THREE.BoxGeometry(W, H, D), wall, g, [0, H / 2, 0]); body.receiveShadow = true;
    mesh(new THREE.BoxGeometry(W + 0.04, 0.05, D + 0.04), roof, g, [0, H + 0.02, 0]);
    [[0, D / 2], [0, -D / 2]].forEach(([x, z]) => mesh(new THREE.BoxGeometry(W + 0.04, 0.08, 0.04), wall, g, [x, H + 0.08, z]));
    [-W / 2, W / 2].forEach(x => mesh(new THREE.BoxGeometry(0.04, 0.08, D + 0.04), wall, g, [x, H + 0.08, 0]));
    for (let i = 0; i < 5; i++) mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.08, 6), roof, g, [-W / 2 + 0.12 + i * 0.2, H - 0.07, D / 2 + 0.03]).rotation.x = Math.PI / 2; // 들보 끝
    mesh(new THREE.BoxGeometry(0.24, 0.52, 0.02), dark, g, [0.2, 0.26, D / 2 + 0.006]); // 문
    mesh(new THREE.BoxGeometry(0.28, 0.035, 0.05), roof, g, [0.2, 0.535, D / 2 + 0.02]); // 문 위 인방
    mesh(new THREE.BoxGeometry(0.12, 0.1, 0.02), dark, g, [-0.26, 0.66, D / 2 + 0.006]); // 작은 창
    if (o.stair !== false) for (let i = 0; i < 6; i++) { // 왼쪽 벽을 따라 오르는 계단
      const h = (i + 1) * H / 6;
      mesh(new THREE.BoxGeometry(0.16, h, 0.13), wall, g, [-W / 2 - 0.08, h / 2, D / 2 - 0.065 - i * 0.13]).receiveShadow = true;
    }
    // 유월절: 문 양쪽 기둥과 위 인방에 바른 어린양의 피 (state 'blood'면 서서히 드러난다)
    const bm = new THREE.MeshStandardMaterial({ color: '#b0241c', emissive: '#5a0a06', emissiveIntensity: 0.6, roughness: 0.6, transparent: true, opacity: 0 }); // 밤에도 보이게 조금 밝게, 굵게
    [[0.2 - 0.145, 0.27, 0.05, 0.52], [0.2 + 0.145, 0.27, 0.05, 0.52], [0.2, 0.55, 0.36, 0.07]].forEach(([x, y, w, h]) => { const b = mesh(new THREE.BoxGeometry(w, h, 0.012), bm, g, [x, y, D / 2 + 0.045]); b.castShadow = false; });
    // 열린 문: 문짝 자리에 집 안 등불빛이 번진다 (state 'open' — 기쁜 소식 g04, 문 밖에 서서 두드리시는 분 계 3:20)
    const lm = new THREE.MeshBasicMaterial({ color: '#ffd38a', transparent: true, opacity: 0 });
    const glow = mesh(new THREE.BoxGeometry(0.22, 0.5, 0.012), lm, g, [0.2, 0.26, D / 2 + 0.014]); glow.castShadow = false;
    // 불빛은 열리는 문(door: true)에만 — 집마다 빛을 두면 장면이 무거워진다
    const halo = o.door ? new THREE.PointLight('#ffc970', 0, 1.6, 1.5) : null; if (halo) { halo.position.set(0.2, 0.32, D / 2 + 0.2); g.add(halo); }
    return new Prop(g, (P, t, dt) => {
      bm.opacity = damp(bm.opacity, P.state === 'blood' ? 0.95 : 0, 1.5, dt);
      lm.opacity = damp(lm.opacity, P.state === 'open' ? 1 : 0, 1.2, dt); if (halo) halo.intensity = lm.opacity * 1.6;
    });
  },
});

Object.assign(MAKERS, {
  // 들짐승(자칼), 소
  pig: o => beast({ coat: '#eaaba1', dark: '#c47c74', size: 0.95, neck: 0.02, legs: 0.72, fat: 1.3, len: 0.75, pigHead: true, curl: true, graze: true, ...o }),
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

  // 동산 한가운데의 나무 (프롤로그): 붉은 열매가 달린 나무. state 'fruit' | 'taken'(하와가 딴 열매 하나가 사라진다)
  fruittree(o = {}) {
    const g = new THREE.Group(), bark = mat('#6a5240', { roughness: 1 }), leaf = mat('#4d7a38', { roughness: 0.85 }), red = mat('#c2412c', { roughness: 0.45 });
    [[0, 0.24, 0, 0.1], [0.05, 0.5, 0.02, -0.3], [-0.06, 0.48, 0, 0.4]].forEach(([x, y, z, r], i) => { const t = mesh(new THREE.CylinderGeometry(i ? 0.022 : 0.045, i ? 0.035 : 0.065, i ? 0.32 : 0.5, 8), bark, g, [x, y, z]); t.rotation.z = r; });
    [[0, 0.8, 0, 0.27], [0.22, 0.7, 0.04, 0.2], [-0.22, 0.7, -0.03, 0.21], [0.05, 0.7, 0.2, 0.18], [-0.04, 0.68, -0.2, 0.18]].forEach(([x, y, z, r]) => mesh(sphere(r, 16, 12), leaf, g, [x, y, z], [1, 0.8, 1]));
    const fruits = [[0.16, 0.6, 0.17], [-0.2, 0.58, 0.12], [0.26, 0.66, -0.08], [-0.08, 0.62, 0.24], [0.02, 0.92, 0.16], [-0.27, 0.72, -0.12]].map(p => mesh(sphere(0.035, 10, 8), red, g, p));
    return new Prop(g, P => { fruits[0].visible = P.state !== 'taken'; }, { state: o.state || 'fruit' });
  },
  // 생명나무 (프롤로그): 은은히 빛나는 금빛 잎. dim(0~1)로 빛을 거둔다 — 길이 닫힐 때
  lifetree(o = {}) {
    const g = new THREE.Group(), bark = mat('#7a6248', { roughness: 1 }), leaf = mat('#c9d98a', { roughness: 0.7, emissive: '#e9d27a', emissiveIntensity: 0.45 });
    mesh(new THREE.CylinderGeometry(0.04, 0.07, 0.62, 8), bark, g, [0, 0.31, 0]);
    [[0, 0.86, 0, 0.26], [0.2, 0.74, 0.05, 0.19], [-0.2, 0.75, -0.04, 0.2], [0.04, 0.74, 0.19, 0.17], [-0.03, 0.72, -0.19, 0.17]].forEach(([x, y, z, r]) => mesh(sphere(r, 16, 12), leaf, g, [x, y, z], [1, 0.85, 1]));
    const halo = glowSprite(1.6, 0.5); halo.position.y = 0.78; g.add(halo);
    return new Prop(g, (P, t) => {
      const on = P.state === 'closed' ? 0.35 : 1;
      leaf.emissiveIntensity = damp(leaf.emissiveIntensity, 0.45 * on, 1, 1 / 60);
      halo.material.opacity = P.show * on * (0.42 + Math.sin(t * 1.3) * 0.08);
    }, { state: o.state || 'open' });
  },
  // 뱀 (프롤로그): 나뭇가지에 감긴 어두운 그림자 — 형체만 (연출 원칙 2). state 'rest' | 'hiss'(머리를 들고 흔들며 속삭인다)
  serpent() {
    const g = new THREE.Group(), dark = mat('#1d1813', { roughness: 0.9 });
    const pts = []; for (let i = 0; i <= 40; i++) { const a = i / 40 * Math.PI * 3.2, r = 0.075 - i * 0.0008; pts.push(new THREE.Vector3(Math.cos(a) * r, i * 0.009, Math.sin(a) * r)); }
    mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, 0.014, 8), dark, g);
    const head = new THREE.Group(); head.position.set(pts[40].x, pts[40].y, pts[40].z); g.add(head);
    mesh(new THREE.CylinderGeometry(0.012, 0.014, 0.12, 8), dark, head, [0, 0.06, 0]);
    mesh(sphere(0.022, 10, 8), dark, head, [0.012, 0.12, 0], [1.5, 0.8, 1]);
    return new Prop(g, (P, t) => {
      const up = P.state === 'hiss' ? 1 : 0;
      head.rotation.z = damp(head.rotation.z, -0.5 + up * 0.35 + Math.sin(t * (up ? 3.2 : 1.1)) * (0.08 + up * 0.12), 3, 1 / 60);
      head.scale.y = damp(head.scale.y, 0.8 + up * 0.6, 3, 1 / 60);
    }, { state: 'rest' });
  },
  // 불칼 (프롤로그): 생명나무로 가는 길을 지키는, 스스로 도는 불꽃의 칼 — 빛으로만 그린다
  flamesword() {
    const g = new THREE.Group(), spin = new THREE.Group(); g.add(spin); spin.position.y = 0.5;
    const blade = mesh(new THREE.BoxGeometry(0.022, 0.42, 0.006), new THREE.MeshBasicMaterial({ color: '#ffd27a' }), spin);
    const flame = glowSprite(0.55, 0.85); spin.add(flame);
    const light = new THREE.PointLight('#ffb050', 0, 1.6, 1.6); light.position.y = 0.5; g.add(light);
    return new Prop(g, (P, t) => {
      spin.rotation.z = t * 2.2; blade.scale.y = 1 + Math.sin(t * 9) * 0.04;
      flame.material.opacity = P.show * (0.7 + Math.sin(t * 11) * 0.15);
      light.intensity = P.show * 1.2;
    });
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

// ---- 모세와 여호수아 ----
// 흙벽돌 무늬: 줄마다 엇갈려 쌓은 벽돌과 줄눈 (벽·벽돌 더미에 함께 쓴다)
let brickTex;
const brickMap = () => {
  if (brickTex) return brickTex;
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#8a7356'; g.fillRect(0, 0, 128, 128);
  for (let r = 0; r < 8; r++) for (let k = -1; k < 5; k++) {
    const v = 0.9 + Math.random() * 0.18;
    g.fillStyle = `rgb(${Math.round(176 * v)},${Math.round(146 * v)},${Math.round(104 * v)})`;
    g.fillRect(k * 32 + (r % 2) * 16 + 1, r * 16 + 1, 30, 14);
  }
  brickTex = new THREE.CanvasTexture(c); brickTex.colorSpace = THREE.SRGBColorSpace;
  brickTex.wrapS = brickTex.wrapT = THREE.RepeatWrapping;
  return brickTex;
};
Object.assign(MAKERS, {
  // 마른 모래 바닥 (광야·바닷가): 가장자리가 흐려지는 모래빛 원판과 작은 돌
  sand(o = {}) {
    const g = new THREE.Group(), R = o.r || 1.6;
    const m = new THREE.MeshStandardMaterial({ color: o.color || '#cdb68a', roughness: 1, transparent: true, alphaMap: radialTex('#ffffff', '#000000'), depthWrite: false });
    const d = new THREE.Mesh(new THREE.CircleGeometry(R, 48), m);
    d.rotation.x = -Math.PI / 2; d.position.y = 0.003; d.receiveShadow = true; g.add(d);
    const st = mat('#a08c6e', { roughness: 1, flatShading: true });
    for (let i = 0; i < (o.stones ?? 14); i++) {
      const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * R * 0.85;
      mesh(new THREE.DodecahedronGeometry(0.012 + Math.random() * 0.018, 0), st, g, [Math.cos(a) * r, 0.008, Math.sin(a) * r * 0.8]);
    }
    return new Prop(g, (P) => { m.opacity = P.show; }, { fade: 'opacity' });
  },
  // 흙벽돌 더미: 햇볕에 말리려 줄지어 세운 벽돌 (애굽의 종살이)
  bricks(o = {}) {
    const g = new THREE.Group(), m = mat('#b0925f', { roughness: 1 }), n = o.n || 3;
    for (let k = 0; k < n; k++) for (let r = 0; r < 3; r++) for (let c = 0; c < 4 - r; c++)
      mesh(new THREE.BoxGeometry(0.07, 0.035, 0.04), m, g, [k * 0.34 + c * 0.075 + r * 0.037 - (n - 1) * 0.17, 0.018 + r * 0.036, (k % 2) * 0.12]).receiveShadow = true;
    return new Prop(g);
  },
  // 쌓다 만 흙벽돌 성벽 (국고성 비돔과 라암셋): 위가 들쭉날쭉하고 앞에 비계 장대
  brickwall(o = {}) {
    const g = new THREE.Group(), W = o.w || 1.6, H = o.h || 0.62, tx = brickMap().clone();
    tx.repeat.set(W * 3, H * 3); tx.needsUpdate = true;
    const m = new THREE.MeshStandardMaterial({ map: tx, roughness: 1 });
    const steps = 6;
    for (let i = 0; i < steps; i++) {
      const h = H * (0.55 + 0.45 * Math.abs(Math.sin(i * 1.7 + 0.4)));
      const t2 = tx.clone(); t2.repeat.set(W / steps * 3, h * 3); t2.needsUpdate = true;
      mesh(new THREE.BoxGeometry(W / steps + 0.002, h, 0.16), new THREE.MeshStandardMaterial({ map: t2, roughness: 1 }), g, [-W / 2 + (i + 0.5) * W / steps, h / 2, 0]).receiveShadow = true;
    }
    const w = wood();
    [-0.45, 0.1, 0.55].forEach(x => mesh(new THREE.CylinderGeometry(0.008, 0.008, H + 0.25, 5), w, g, [x * W / 1.6, (H + 0.25) / 2, 0.14]));
    mesh(new THREE.BoxGeometry(W * 0.75, 0.012, 0.06), w, g, [0.05, H * 0.6, 0.14]);
    return new Prop(g);
  },
  // 파피루스 갈대 떨기: 세모진 줄기 끝에 우산처럼 퍼진 꽃차례. 바람에 서걱이며 흔들린다
  reeds(o = {}) {
    const g = new THREE.Group(), stem = mat('#5f7a34', { roughness: 0.9 }), head = mat('#7f9a44', { ...DS, roughness: 0.9 }), stalks = [];
    (o.spots || [[0, 0]]).forEach(([cx, cz]) => {
      for (let i = 0; i < (o.n || 9); i++) {
        const s = new THREE.Group(), h = 0.45 + Math.random() * 0.35, a = Math.random() * Math.PI * 2, r = Math.random() * 0.1;
        s.position.set(cx + Math.cos(a) * r, 0, cz + Math.sin(a) * r * 0.7);
        s.rotation.z = (Math.random() - 0.5) * 0.25; s.rotation.x = (Math.random() - 0.5) * 0.2;
        mesh(new THREE.CylinderGeometry(0.004, 0.007, h, 3), stem, s, [0, h / 2, 0]);
        mesh(new THREE.ConeGeometry(0.05, 0.06, 10, 1, true), head, s, [0, h + 0.02, 0]).rotation.x = Math.PI;
        s.userData.seed = Math.random() * 6; g.add(s); stalks.push(s);
      }
    });
    return new Prop(g, (P, t) => stalks.forEach(s => { s.rotation.z = Math.sin(t * 1.3 + s.userData.seed) * 0.05; }));
  },
  // 갈대 상자: 역청을 바른 작은 파피루스 바구니 배. 물 위에서 살짝 흔들리고, state 'open'이면 뚜껑을 연다
  ark() {
    const g = new THREE.Group(), bob = new THREE.Group(); g.add(bob);
    const weave = mat('#8a6a3a', { ...DS, roughness: 0.95 }), pitch = mat('#3a2a1a', { roughness: 0.6 });
    mesh(sphere(0.1, 20, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), pitch, bob, [0, 0.06, 0], [1.4, 0.55, 0.85]);
    mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 20, 1, true), weave, bob, [0, 0.085, 0], [1.4, 1, 0.85]);
    for (let i = 0; i < 4; i++) mesh(new THREE.TorusGeometry(0.1, 0.004, 4, 24), weave, bob, [0, 0.065 + i * 0.012, 0], [1.4, 0.85, 1]).rotation.x = Math.PI / 2;
    const babyM = mat('#f2ead8');
    mesh(new THREE.CapsuleGeometry(0.03, 0.07, 6, 10), babyM, bob, [0, 0.09, 0]).rotation.z = Math.PI / 2;
    mesh(sphere(0.026, 12, 10), mat('#d6ad89'), bob, [0.07, 0.095, 0]);
    const lid = new THREE.Group(); lid.position.set(-0.13, 0.11, 0); bob.add(lid);
    mesh(sphere(0.1, 20, 8, 0, Math.PI * 2, 0, Math.PI / 2), weave, lid, [0.13, 0, 0], [1.4, 0.4, 0.85]);
    return new Prop(g, (P, t, dt) => {
      bob.position.y = Math.sin(t * 1.6) * 0.008; bob.rotation.z = Math.sin(t * 1.1) * 0.04;
      lid.rotation.z = damp(lid.rotation.z, P.state === 'open' ? 1.6 : 0, 2, dt);
    }, { state: 'closed' });
  },
  // 떨기나무: 마른 가시덤불. state 'fire'면 불꽃에 휩싸이지만 가지는 그대로다 (타 없어지지 않는다)
  bush() {
    const g = new THREE.Group(), twig = mat('#5a4630', { roughness: 1 }), leaf = mat('#7d7a46', { roughness: 1, flatShading: true });
    for (let i = 0; i < 9; i++) {
      const a = i / 9 * Math.PI * 2, l = 0.22 + Math.random() * 0.12, b = mesh(new THREE.CylinderGeometry(0.004, 0.009, l, 4), twig, g, [Math.cos(a) * 0.05, l / 2, Math.sin(a) * 0.05]);
      b.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5);
    }
    [[0, 0.22, 0, 0.13], [0.08, 0.16, 0.03, 0.09], [-0.08, 0.15, -0.02, 0.1], [0.02, 0.12, 0.08, 0.08]].forEach(([x, y, z, r]) => mesh(new THREE.IcosahedronGeometry(r, 0), leaf, g, [x, y, z], [1, 0.7, 1]));
    const fire = new THREE.Group(); g.add(fire);
    const fm = new THREE.MeshBasicMaterial({ color: '#ffb347', transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending });
    const tongues = Array.from({ length: 9 }, (_, i) => { const a = i / 9 * Math.PI * 2, c = mesh(new THREE.ConeGeometry(0.035, 0.18, 6), fm, fire, [Math.cos(a) * 0.08, 0.28, Math.sin(a) * 0.08]); c.castShadow = false; c.userData.s = Math.random() * 6; return c; });
    const halo = glowSprite(1.1, 0.9); halo.position.y = 0.3; fire.add(halo);
    const light = new THREE.PointLight('#ffa040', 0, 2.2, 1.4); light.position.y = 0.35; g.add(light);
    let k = 0;
    return new Prop(g, (P, t, dt) => {
      k = damp(k, P.state === 'fire' ? 1 : 0, 1.5, dt);
      fire.visible = k > 0.02;
      tongues.forEach(c => { const f = 0.8 + Math.sin(t * 9 + c.userData.s) * 0.25; c.scale.set(k, k * f, k); c.position.y = 0.2 + 0.1 * f; });
      halo.material.opacity = k * (0.75 + Math.sin(t * 13) * 0.1) * P.show; light.intensity = k * 2.4 * P.show;
    }, { state: 'plain' });
  },
  // 구름 기둥과 불 기둥: 하늘로 솟은 큰 기둥. state 'cloud'(낮) | 'fire'(밤) — 같은 기둥이 빛깔만 바뀐다
  pillar(o = {}) {
    const g = new THREE.Group(), H = o.h || 2.4, puffs = [];
    const m = new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#fff3d8', emissiveIntensity: 0.5, transparent: true, opacity: 0.85, depthWrite: false, roughness: 1 });
    for (let i = 0; i < 26; i++) {
      const y = (i / 26) * H, r = 0.16 + 0.06 * Math.sin(i * 1.3) + (y > H * 0.8 ? 0.12 : 0);
      const p = mesh(sphere(r, 14, 10), m, g, [Math.sin(i * 2.1) * 0.06, y + 0.12, Math.cos(i * 1.7) * 0.05]);
      p.castShadow = false; p.userData = { y: y + 0.12, s: i }; puffs.push(p);
    }
    const halo = glowSprite(2.4, 0.6); halo.position.y = H * 0.5; g.add(halo);
    const light = new THREE.PointLight('#ffa050', 0, 4, 1.2); light.position.y = H * 0.4; g.add(light);
    const day = new THREE.Color('#ffffff'), night = new THREE.Color('#ff7a26'), dE = new THREE.Color('#fff3d8'), nE = new THREE.Color('#e04a08');
    let f = 0;
    return new Prop(g, (P, t, dt) => {
      f = damp(f, P.state === 'fire' ? 1 : 0, 1, dt);
      m.color.copy(day).lerp(night, f); m.emissive.copy(dE).lerp(nE, f); m.emissiveIntensity = 0.5 + f * 0.5; m.opacity = 0.85 * P.show; // 빛을 너무 세게 하면 톤 매핑에 흰빛으로 바랜다
      halo.material.opacity = (0.35 + f * 0.5) * P.show; light.intensity = f * 3 * P.show;
      puffs.forEach(p => { p.position.y = p.userData.y + Math.sin(t * 0.8 + p.userData.s) * 0.03; p.rotation.y = t * 0.2 + p.userData.s; });
    }, { state: o.state || 'cloud', fade: 'opacity' });
  },
  // 갈라지는 바다: 가로(동서)로 난 마른 길을 사이에 두고 북(뒤)·남(앞)의 물이 벽처럼 선다.
  // state 'calm'(잔잔한 바다) → 'part'(물벽, 마른 바닥) → 'return'(물이 돌아와 덮는다). 앞쪽 물벽은 낮고 투명하게 — 건너는 사람이 가려지지 않게
  sea(o = {}) {
    const g = new THREE.Group(), W = o.w || 3.2, gap = o.gap || 0.42, D = o.d || 1.0;
    const bed = mesh(new THREE.PlaneGeometry(W, gap * 2 + 0.1), mat('#a8936a', { roughness: 1 }), g, [0, 0.004, 0]); bed.rotation.x = -Math.PI / 2; bed.receiveShadow = true;
    const wm = () => new THREE.MeshStandardMaterial({ color: '#3f7f95', roughness: 0.15, metalness: 0.15, transparent: true, opacity: 0.82, depthWrite: false, emissive: '#1f4a5a', emissiveIntensity: 0.25 });
    const mk = (z, d, front) => {
      const m = wm(), geo = new THREE.BoxGeometry(W, 1, d, 48, 6, 1); geo.translate(0, 0.5, 0);
      const base = geo.attributes.position.array.slice(), w = new THREE.Mesh(geo, m); w.position.z = z; g.add(w);
      return { w, m, geo, base, front };
    };
    const back = mk(-gap - D / 2, D, false), front = mk(gap + D / 2, D, true);
    const fill = mk(0, gap * 2 + 0.02, false); // 가운데 길을 덮는 물 (잔잔할 때와 돌아올 때)
    let rise = 0, close = 1;
    return new Prop(g, (P, t, dt) => {
      const st = P.state;
      rise = damp(rise, st === 'part' ? 1 : 0, 0.7, dt);
      close = damp(close, st === 'part' ? 0 : 1, st === 'return' ? 0.9 : 0.6, dt);
      [back, front, fill].forEach(L => {
        const h = L === fill ? 0.06 * close + 0.001 : 0.06 + rise * (L.front ? 0.3 : 1.0);
        const p = L.geo.attributes.position;
        for (let i = 0; i < p.count; i++) {
          const x = L.base[i * 3], y = L.base[i * 3 + 1];
          p.array[i * 3 + 1] = y * h + (y > 0.99 ? Math.sin(x * 6 + t * 2.4) * 0.012 * (1 + rise * 2) : 0);
        }
        p.needsUpdate = true; L.geo.computeVertexNormals();
        L.m.opacity = P.show * (L.front ? 0.82 - rise * 0.5 : 0.85);
        L.w.visible = L !== fill || close > 0.03;
      });
    }, { state: o.state || 'calm', fade: 'opacity' });
  },
  // 애굽 병거: 바퀴살 여섯의 두 바퀴, 가벼운 수레, 끄는 말 한 필과 서서 모는 사람(윤곽만). 앞이 +x
  chariot(o = {}) {
    const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
    const w = mat('#8a5a2a', { roughness: 0.8 }), gold = mat('#c99a3a', { metalness: 0.5, roughness: 0.4 });
    [-1, 1].forEach(s => {
      const wh = new THREE.Group(); wh.position.set(-0.05, 0.19, s * 0.15); body.add(wh);
      mesh(new THREE.TorusGeometry(0.19, 0.012, 6, 28), w, wh);
      for (let i = 0; i < 6; i++) mesh(new THREE.BoxGeometry(0.008, 0.37, 0.008), w, wh).rotation.z = i * Math.PI / 6;
    });
    mesh(new THREE.BoxGeometry(0.22, 0.015, 0.28), w, body, [-0.03, 0.3, 0]);
    mesh(new THREE.BoxGeometry(0.015, 0.2, 0.28), gold, body, [0.08, 0.4, 0]);
    mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.5, 5), w, body, [0.3, 0.33, 0]).rotation.z = Math.PI / 2 - 0.12;
    const horse = beast({ coat: o.coat || '#6b4a30', dark: '#2a1c12', size: 1.45, mane: true, ears: 0.05, neck: 0.15, neckTilt: 0.45, legs: 1.2, graze: false });
    horse.obj.position.set(0.58, 0, 0); body.add(horse.obj);
    // 모는 사람: 흰 허리치마와 검은 가발의 단순한 윤곽
    const d = new THREE.Group(); d.position.set(-0.05, 0.3, 0); d.scale.setScalar(1.55); body.add(d);
    mesh(lathe([[0.001, 0], [0.06, 0], [0.055, 0.14], [0.045, 0.3], [0.03, 0.34], [0.001, 0.35]], 12), mat('#efe9da'), d);
    mesh(sphere(0.045, 12, 10), mat('#a87451'), d, [0, 0.39, 0]);
    mesh(sphere(0.05, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), mat('#1a1210'), d, [0, 0.4, 0]);
    const P = new Prop(g, (P2, t, dt) => { horse.moving = P2.moving; horse.upd(horse, t, dt, {}); }); // 말의 다리만 움직인다 (자리는 병거가 옮긴다)
    P.directional = true;
    return P;
  },
  // 흑염소 털 장막 (광야의 집): 낮게 친 검은 천과 장대·줄
  tent(o = {}) {
    const g = new THREE.Group(), cloth = mat(o.color || '#3a2f28', { ...DS, roughness: 1 }), w = wood(), W = o.w || 0.9;
    const geo = new THREE.PlaneGeometry(W, 0.6, 12, 6), p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); p.setZ(i, -Math.abs(y) * 0.5 + Math.sin(x * 9) * 0.01); }
    geo.computeVertexNormals();
    const roof = mesh(geo, cloth, g, [0, 0.42, 0]); roof.rotation.x = -Math.PI / 2; roof.receiveShadow = true;
    mesh(new THREE.PlaneGeometry(W, 0.4), cloth, g, [0, 0.2, -0.28]);
    [-1, 0, 1].forEach(k => mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.44, 5), w, g, [k * W * 0.45, 0.22, 0.27]));
    return new Prop(g);
  },
  // 메뚜기·파리 떼: 무대 위를 맴도는 검은 점들 (재앙)
  swarm(o = {}) {
    const g = new THREE.Group(), n = o.n || 160, pos = new Float32Array(n * 3), seed = Array.from({ length: n }, () => [Math.random() * 6, 0.4 + Math.random() * 1.2, Math.random()]);
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const m = new THREE.PointsMaterial({ color: o.color || '#2a2418', size: o.dot || 0.028, transparent: true, depthWrite: false });
    g.add(new THREE.Points(geo, m));
    return new Prop(g, (P, t) => {
      seed.forEach(([a, r, h], i) => { const ang = a + t * (0.6 + h); pos[i * 3] = Math.cos(ang) * r * 1.2; pos[i * 3 + 1] = 0.2 + h * 0.9 + Math.sin(t * 3 + a) * 0.06; pos[i * 3 + 2] = Math.sin(ang) * r * 0.6; });
      geo.attributes.position.needsUpdate = true; m.opacity = P.show;
    }, { fade: 'opacity' });
  },
  // 애굽 궁전의 기둥: 파피루스 꽃 모양 기둥머리의 두 기둥과 그 위의 들보 (바로의 궁)
  egcolumns(o = {}) {
    const g = new THREE.Group(), stone = mat('#e3d6b8', { roughness: 0.9 }), paint = mat('#2f6a8a'), gold = mat('#c99a3a', { metalness: 0.4, roughness: 0.5 }), W = o.w || 1.1, H = o.h || 1.25;
    [-1, 1].forEach(s => {
      mesh(new THREE.CylinderGeometry(0.075, 0.09, H, 16), stone, g, [s * W / 2, H / 2, 0]);
      mesh(lathe([[0.07, 0], [0.13, 0.08], [0.12, 0.13], [0.001, 0.13]], 16), stone, g, [s * W / 2, H, 0]);
      [0.25, 0.5, 0.75].forEach(f => mesh(new THREE.TorusGeometry(0.083, 0.008, 6, 20), paint, g, [s * W / 2, H * f, 0]).rotation.x = Math.PI / 2);
    });
    mesh(new THREE.BoxGeometry(W + 0.34, 0.12, 0.24), stone, g, [0, H + 0.19, 0]);
    mesh(new THREE.BoxGeometry(W + 0.34, 0.025, 0.25), paint, g, [0, H + 0.14, 0]);
    mesh(new THREE.BoxGeometry(0.18, 0.06, 0.02), gold, g, [0, H + 0.19, 0.125]);
    return new Prop(g);
  },
  // 개구리: 땅에 흩어진 작은 초록 덩이들이 이따금 뛴다
  frogs(o = {}) {
    const g = new THREE.Group(), m = mat('#5a7a34', { roughness: 0.6 }), list = [];
    for (let i = 0; i < (o.n || 22); i++) {
      const f = new THREE.Group(), a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * (o.r || 1.2);
      f.position.set(Math.cos(a) * r, 0, Math.sin(a) * r * 0.7);
      mesh(sphere(0.022, 8, 6), m, f, [0, 0.016, 0], [1.2, 0.7, 1]);
      mesh(sphere(0.013, 8, 6), m, f, [0.02, 0.026, 0]);
      f.rotation.y = Math.random() * 6; f.userData.s = Math.random() * 6; g.add(f); list.push(f);
    }
    return new Prop(g, (P, t) => list.forEach(f => { f.position.y = Math.max(0, Math.sin(t * 2.2 + f.userData.s)) ** 8 * 0.06; }));
  },
});

// ---- 모세와 여호수아 (시내산) ----
Object.assign(MAKERS, {
  // 시내산: 붉은 화강암 봉우리. state 'calm' | 'smoke'(짙은 구름·연기와 불빛, 번개) | 'cloud'(영광의 밝은 구름이 꼭대기를 덮는다)
  mountain(o = {}) {
    const g = new THREE.Group(), H = o.h || 1.5, R = o.r || 1.1;
    const geo = lathe([[R, 0], [R * 0.78, H * 0.18], [R * 0.55, H * 0.42], [R * 0.32, H * 0.7], [R * 0.12, H * 0.95], [0.001, H]], 28, 0, Math.PI * 2);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = Math.atan2(z, x), k = 1 + 0.16 * Math.sin(a * 5 + y * 7) + 0.08 * Math.sin(a * 11 - y * 13); if (y > 0.001) p.setXYZ(i, x * k, y * (0.92 + 0.1 * Math.sin(a * 3)), z * k); }
    geo.computeVertexNormals();
    const rm = mat(o.color || '#a07a62', { roughness: 1, flatShading: true });
    const rock = mesh(geo, rm, g); rock.receiveShadow = true;
    // 곁봉우리 둘: 하나뿐인 원뿔은 천막이나 흙더미처럼 보였다 — 여러 봉우리가 이어진 산괴로
    [[-0.85, 0.62, 0.15], [0.9, 0.55, -0.1]].forEach(([x, k, z]) => { const s2 = mesh(geo, rm, g, [x * R, 0, z * R], [k, k * 0.95, k]); s2.rotation.y = x * 2; s2.receiveShadow = true; });
    const cap = new THREE.Group(); cap.position.y = H * 0.9; g.add(cap);
    const cm = new THREE.MeshStandardMaterial({ color: '#4a4448', roughness: 1, transparent: true, opacity: 0, depthWrite: false });
    const puffs = Array.from({ length: 22 }, (_, i) => { const a = i / 22 * Math.PI * 2, r = 0.3 + (i % 3) * 0.22; const m = mesh(sphere(0.3 + (i % 4) * 0.07, 14, 10), cm, cap, [Math.cos(a) * r, (i % 5) * 0.08, Math.sin(a) * r * 0.6]); m.castShadow = false; m.userData.s = i; return m; });
    const glow = glowSprite(1.6, 0); glow.position.y = H * 0.85; g.add(glow);
    const light = new THREE.PointLight('#ffa050', 0, 3, 1.3); light.position.y = H * 0.9; g.add(light);
    const dark = new THREE.Color('#6e6870'), bright = new THREE.Color('#fff8e8');
    let k = 0, b = 0;
    return new Prop(g, (P, t, dt) => {
      const st = P.state;
      k = damp(k, st === 'calm' ? 0 : 1, 0.8, dt); b = damp(b, st === 'cloud' ? 1 : 0, 0.8, dt);
      cm.opacity = 0.78 * k * P.show; cm.color.copy(dark).lerp(bright, b); cm.emissive.copy(bright).multiplyScalar(b * 0.35);
      puffs.forEach(m => { m.position.y = (m.userData.s % 5) * 0.08 + Math.sin(t * 0.7 + m.userData.s) * 0.04; m.visible = k > 0.02; });
      cap.rotation.y = t * 0.08;
      const fl = st === 'smoke' ? (Math.sin(t * 7) > 0.96 ? 1.6 : 0.5 + Math.sin(t * 9) * 0.15) : 0; // 번개: 이따금 번쩍
      glow.material.opacity = (st === 'smoke' ? 0.6 * fl : b * 0.7) * P.show; light.intensity = (st === 'smoke' ? 2.5 * fl : b * 1.2) * P.show;
    }, { state: o.state || 'calm' });
  },
  // 만나: 이슬이 걷힌 땅에 서리처럼 깔린 희고 가는 것
  manna(o = {}) {
    const g = new THREE.Group(), m = mat('#f6f2e6', { roughness: 0.7 });
    for (let i = 0; i < (o.n || 160); i++) {
      const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * (o.r || 1.2);
      const f = mesh(new THREE.CircleGeometry(0.012 + Math.random() * 0.01, 6), m, g, [Math.cos(a) * r, 0.006, Math.sin(a) * r * 0.75]);
      f.rotation.x = -Math.PI / 2; f.castShadow = false;
    }
    return new Prop(g);
  },
  // 반석: 큰 바위. state 'flow'면 바위에서 물줄기가 쏟아져 발치에 물이 고인다
  rockspring(o = {}) {
    const g = new THREE.Group(), rock = mat(o.color || '#9a7a62', { roughness: 1, flatShading: true });
    mesh(new THREE.DodecahedronGeometry(0.32, 1), rock, g, [0, 0.24, 0], [1.3, 0.85, 0.9]).receiveShadow = true;
    mesh(new THREE.DodecahedronGeometry(0.18, 0), rock, g, [0.32, 0.12, 0.05], [1, 0.8, 1]);
    const wm = new THREE.MeshStandardMaterial({ color: '#8ec3d0', roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0, emissive: '#3a7a8a', emissiveIntensity: 0.3, depthWrite: false });
    const fall = mesh(new THREE.CylinderGeometry(0.03, 0.06, 0.32, 10, 4, true), wm, g, [0.02, 0.18, 0.3]); fall.castShadow = false;
    const pool = mesh(new THREE.CircleGeometry(0.42, 28), wm, g, [0.05, 0.012, 0.48]); pool.rotation.x = -Math.PI / 2; pool.castShadow = false; pool.renderOrder = 2;
    let k = 0;
    return new Prop(g, (P, t, dt) => {
      k = damp(k, P.state === 'flow' ? 1 : 0, 1, dt);
      wm.opacity = 0.8 * k * P.show; fall.visible = pool.visible = k > 0.02;
      pool.scale.set(k, k * 0.7, 1); fall.scale.y = 0.9 + Math.sin(t * 14) * 0.05;
    }, { state: 'dry' });
  },
  // 돌 제단: 다듬지 않은 돌을 쌓고 그 위에 불 (state 'fire')
  altar(o = {}) {
    const g = new THREE.Group(), st = mat('#a89a82', { roughness: 1, flatShading: true });
    for (let r = 0; r < 3; r++) for (let i = 0; i < 6 - r; i++) { const a = i / (6 - r) * Math.PI * 2; mesh(new THREE.DodecahedronGeometry(0.075, 0), st, g, [Math.cos(a) * (0.16 - r * 0.04), 0.05 + r * 0.1, Math.sin(a) * (0.12 - r * 0.03)]); }
    const fm = new THREE.MeshBasicMaterial({ color: '#ffb347', transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending });
    const fire = new THREE.Group(); fire.position.y = 0.32; g.add(fire);
    const tongues = Array.from({ length: 5 }, (_, i) => { const c = mesh(new THREE.ConeGeometry(0.04, 0.16, 6), fm, fire, [Math.cos(i * 1.3) * 0.04, 0.06, Math.sin(i * 1.3) * 0.03]); c.castShadow = false; return c; });
    const halo = glowSprite(0.8, 0.8); halo.position.y = 0.1; fire.add(halo);
    const light = new THREE.PointLight('#ff9a50', 0, 1.8, 1.4); light.position.y = 0.45; g.add(light);
    return new Prop(g, (P, t) => {
      const on = P.state === 'fire'; fire.visible = on;
      tongues.forEach((c, i) => { c.scale.y = 0.8 + Math.sin(t * 10 + i) * 0.25; });
      halo.material.opacity = on ? 0.7 * P.show : 0; light.intensity = on ? 1.6 * P.show : 0;
    }, { state: o.state || 'fire' });
  },
  // 열두 지파의 돌기둥: 제단 앞에 활 모양으로 선 돌 열두 개
  pillars12(o = {}) {
    const g = new THREE.Group(), st = mat('#b8a888', { roughness: 1, flatShading: true });
    for (let i = 0; i < 12; i++) { const a = Math.PI * (0.15 + 0.7 * i / 11), h = 0.2 + (i % 3) * 0.03; mesh(new THREE.BoxGeometry(0.06, h, 0.05), st, g, [Math.cos(a) * (o.r || 0.6), h / 2, -Math.sin(a) * (o.r || 0.6) * 0.5]).rotation.y = a; }
    return new Prop(g);
  },
  // 금송아지: 돌 받침 위의 금빛 송아지 (부숴 가루로 만들면 show 0으로 사라진다)
  calf() {
    const g = new THREE.Group(), gold = mat('#d8a830', { metalness: 0.75, roughness: 0.3 });
    mesh(new THREE.BoxGeometry(0.3, 0.16, 0.2), mat('#a89a82', { roughness: 1 }), g, [0, 0.08, 0]);
    const b = new THREE.Group(); b.position.y = 0.16; g.add(b);
    mesh(new THREE.CapsuleGeometry(0.055, 0.12, 6, 12), gold, b, [0, 0.12, 0]).rotation.z = Math.PI / 2;
    [[-0.06, -1], [-0.06, 1], [0.06, -1], [0.06, 1]].forEach(([x, s]) => mesh(new THREE.CylinderGeometry(0.014, 0.012, 0.09, 6), gold, b, [x, 0.045, s * 0.03]));
    mesh(sphere(0.045, 12, 10), gold, b, [0.13, 0.19, 0], [1.2, 1, 0.9]);
    [-1, 1].forEach(s => mesh(new THREE.ConeGeometry(0.01, 0.05, 6), gold, b, [0.13, 0.24, s * 0.03]).rotation.x = s * -0.5);
    return new Prop(g, (P, t) => { b.rotation.y = 0; });
  },
  // 언약궤: 금을 입힌 궤, 덮개(속죄소) 위에 마주 보는 두 그룹의 날개, 양옆의 채
  arkc(o = {}) {
    const g = new THREE.Group(), gold = mat('#d8a830', { metalness: 0.7, roughness: 0.3 });
    mesh(new THREE.BoxGeometry(0.26, 0.15, 0.16), gold, g, [0, 0.12 + (o.lift || 0), 0]);
    mesh(new THREE.BoxGeometry(0.28, 0.02, 0.18), gold, g, [0, 0.205 + (o.lift || 0), 0]);
    [-1, 1].forEach(s => { const w = mesh(new THREE.BoxGeometry(0.1, 0.09, 0.01), gold, g, [s * 0.07, 0.26 + (o.lift || 0), 0]); w.rotation.z = s * 0.5; });
    // 채: 궤 양옆의 금고리에 끼운 긴 막대. 멘 궤(lift)는 앞뒤 두 제사장(궤 가운데에서 ±0.42)이 몸 옆(±0.13)에서 손으로 쥔다
    const PL = o.lift ? 1.36 : 0.62, PZ = o.lift ? 0.13 : 0.095;
    [-1, 1].forEach(s => {
      mesh(new THREE.CylinderGeometry(0.007, 0.007, PL, 6), gold, g, [0, 0.11 + (o.lift || 0), s * PZ]).rotation.z = Math.PI / 2;
      [-1, 1].forEach(e => mesh(new THREE.BoxGeometry(0.012, 0.012, PZ - 0.08), gold, g, [e * 0.09, 0.11 + (o.lift || 0), s * (PZ + 0.08) / 2])); // 고리와 궤를 잇는 쇠
    });
    const halo = glowSprite(0.7, 0.35); halo.position.y = 0.25; g.add(halo);
    return new Prop(g, (P, t) => { halo.material.opacity = (0.25 + Math.sin(t * 1.4) * 0.06) * P.show; });
  },
  // 성막: 흰 세마포 포장을 두른 뜰, 그 안의 장막(금 널판 위에 짙은 염소털 덮개), 뜰의 번제단과 물두멍.
  // show가 커지면 받침 → 널판 → 덮개 → 포장 차례로 세워진다
  tabernacle(o = {}) {
    const g = new THREE.Group(), W = 1.5, D = 0.7, linen = mat('#f2ede0', { ...DS, roughness: 0.9 }), post = mat('#b08a4e', { metalness: 0.3, roughness: 0.6 });
    const parts = [];
    const add = (o3, step) => { o3.userData.step = step; parts.push(o3); g.add(o3); return o3; };
    // 받침과 널판
    const tent = add(new THREE.Group(), 0); tent.position.set(-0.3, 0, -0.05);
    mesh(new THREE.BoxGeometry(0.62, 0.02, 0.26), mat('#c0c0c8', { metalness: 0.6, roughness: 0.4 }), tent, [0, 0.01, 0]);
    const boards = add(new THREE.Group(), 1); boards.position.copy(tent.position);
    mesh(new THREE.BoxGeometry(0.6, 0.32, 0.24), mat('#d8a830', { metalness: 0.6, roughness: 0.35 }), boards, [0, 0.18, 0]);
    const cover = add(new THREE.Group(), 2); cover.position.copy(tent.position);
    mesh(new THREE.BoxGeometry(0.64, 0.025, 0.28), mat('#3a2f28', { roughness: 1 }), cover, [0, 0.35, 0]);
    mesh(new THREE.BoxGeometry(0.64, 0.2, 0.012), mat('#2f4f8a', { roughness: 0.8 }), cover, [0, 0.24, 0.142]); // 앞 휘장 (청·자·홍색 실)
    mesh(new THREE.BoxGeometry(0.012, 0.3, 0.28), mat('#3a2f28', { roughness: 1 }), cover, [-0.322, 0.2, 0]);
    // 뜰의 포장과 기둥
    const court = add(new THREE.Group(), 3);
    const side = (x0, z0, x1, z1) => { const L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(2, Math.round(L / 0.18)); const c = mesh(new THREE.PlaneGeometry(L, 0.16), linen, court, [(x0 + x1) / 2, 0.1, (z0 + z1) / 2]); c.rotation.y = -Math.atan2(z1 - z0, x1 - x0); for (let i = 0; i <= n; i++) mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.2, 5), post, court, [x0 + (x1 - x0) * i / n, 0.1, z0 + (z1 - z0) * i / n]); };
    side(-W / 2, -D / 2, W / 2, -D / 2); side(-W / 2, -D / 2, -W / 2, D / 2); side(W / 2, -D / 2, W / 2, -0.12); side(W / 2, 0.12, W / 2, D / 2);
    side(-W / 2, D / 2, -0.15, D / 2); side(0.15, D / 2, W / 2, D / 2);
    mesh(new THREE.PlaneGeometry(0.3, 0.16), mat('#7a2a5e', { ...DS }), court, [0, 0.1, D / 2]); // 뜰 문 휘장
    const brass = mat('#b07a3a', { metalness: 0.5, roughness: 0.45 });
    mesh(new THREE.BoxGeometry(0.14, 0.08, 0.14), brass, court, [0.25, 0.04, 0.05]); // 번제단
    mesh(lathe([[0.001, 0], [0.03, 0], [0.012, 0.03], [0.012, 0.06], [0.05, 0.08], [0.05, 0.1], [0.001, 0.09]], 14), brass, court, [0.02, 0, -0.02]); // 물두멍
    return new Prop(g, (P) => parts.forEach(o3 => { const k = THREE.MathUtils.clamp(P.show * 4 - o3.userData.step, 0, 1); o3.scale.setScalar(Math.max(1e-4, k)); o3.visible = k > 0.02; }), { fade: 'none' });
  },
});

// ---- 모세와 여호수아 (광야) ----
Object.assign(MAKERS, {
  // 에스골의 포도송이: 두 사람이 어깨에 멘 막대에 매달린 큰 송이 (막대 길이 0.6 — 두 정탐꾼 사이)
  grapepole() {
    const g = new THREE.Group(), w = wood(), grape = mat('#5a2a5a', { roughness: 0.45 });
    mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.62, 6), w, g, [0, 0.66, 0]).rotation.z = Math.PI / 2;
    for (let i = 0; i < 26; i++) { const y = 0.6 - (i / 26) * 0.26, r = 0.07 * (1 - i / 30); const a = i * 2.4; mesh(sphere(0.022, 8, 6), grape, g, [Math.cos(a) * r * Math.random(), y, Math.sin(a) * r * Math.random()]); }
    mesh(new THREE.BoxGeometry(0.08, 0.004, 0.06), mat('#5f8a3a', DS), g, [0.02, 0.62, 0]);
    return new Prop(g);
  },
  // 열두 지팡이: 증거궤 앞에 세운 지팡이들. state 'bloom'이면 가운데(아론의 것)에 잎·흰 꽃·아몬드가 돋는다
  rods() {
    const g = new THREE.Group(), w = wood();
    for (let i = 0; i < 12; i++) mesh(new THREE.CylinderGeometry(0.006, 0.007, 0.5, 5), w, g, [(i - 5.5) * 0.045, 0.25, (i % 2) * 0.03]).rotation.z = (i - 5.5) * 0.012;
    const bud = new THREE.Group(); bud.position.set(0.022, 0.42, 0); g.add(bud);
    for (let i = 0; i < 9; i++) { const a = i * 2.3, y = (i / 9) * 0.16; mesh(sphere(0.014, 8, 6), mat(i % 3 ? '#f6eef0' : '#7a9a4a'), bud, [Math.cos(a) * 0.022, y - 0.06, Math.sin(a) * 0.022]); }
    const halo = glowSprite(0.45, 0.6); halo.position.y = 0.42; g.add(halo);
    let k = 0;
    return new Prop(g, (P, t, dt) => { k = damp(k, P.state === 'bloom' ? 1 : 0, 1, dt); bud.scale.setScalar(Math.max(1e-4, k)); bud.visible = k > 0.02; halo.material.opacity = k * 0.6 * P.show; }, { state: 'dry' });
  },
  // 장대 위의 놋뱀: 높은 장대 끝에 감긴 놋빛 뱀
  brasspole() {
    const g = new THREE.Group(), brass = mat('#c08a3a', { metalness: 0.65, roughness: 0.35 });
    mesh(new THREE.CylinderGeometry(0.012, 0.015, 1.35, 8), wood(), g, [0, 0.675, 0]);
    mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.22, 6), wood(), g, [0, 1.25, 0]).rotation.z = Math.PI / 2;
    const pts = []; for (let i = 0; i <= 40; i++) { const a = i / 40 * Math.PI * 4.5; pts.push(new THREE.Vector3(Math.cos(a) * 0.03, 1.0 + i * 0.008, Math.sin(a) * 0.03)); }
    mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, 0.011, 8), brass, g);
    mesh(sphere(0.02, 10, 8), brass, g, [0.03, 1.33, 0], [1.4, 0.8, 1]);
    const halo = glowSprite(0.6, 0.4); halo.position.y = 1.2; g.add(halo);
    return new Prop(g, (P, t) => { halo.material.opacity = (0.3 + Math.sin(t * 1.7) * 0.08) * P.show; });
  },
  // 불뱀: 땅 위를 기는 작은 어두운 뱀들 (무는 모습은 그리지 않는다 — 나타나고 사라질 뿐)
  snakes(o = {}) {
    const g = new THREE.Group(), m = mat('#5a3a22', { roughness: 0.7 }), list = [];
    for (let i = 0; i < (o.n || 9); i++) {
      const pts = []; for (let k = 0; k <= 16; k++) pts.push(new THREE.Vector3(k * 0.012, 0.008, Math.sin(k * 0.8) * 0.012));
      const sn = mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.006, 6), m, g);
      const a = Math.random() * Math.PI * 2, r = 0.3 + Math.random() * (o.r || 1.0);
      sn.position.set(Math.cos(a) * r, 0, Math.sin(a) * r * 0.6); sn.rotation.y = Math.random() * 6; sn.userData.s = Math.random() * 6; list.push(sn);
    }
    return new Prop(g, (P, t) => list.forEach(sn => { sn.rotation.y += Math.sin(t + sn.userData.s) * 0.004; }));
  },
});

// ---- 모세와 여호수아 (가나안) ----
Object.assign(MAKERS, {
  // 성벽 도성(여리고·아이·기브온): 탑이 선 흙벽돌 성벽과 성문. rahab: 성벽에 붙여 지은 라합의 집(창).
  // state 'stand' | 'cord'(라합의 창에 붉은 줄) | 'fall'(성벽이 무너져 내린다 — 라합의 집과 붉은 줄만 남는다)
  citywall(o = {}) {
    const g = new THREE.Group(), W = o.w || 2.0, H = o.h || 0.55, segs = [], tx = brickMap().clone();
    tx.repeat.set(W * 3, H * 3); tx.needsUpdate = true;
    const brick = new THREE.MeshStandardMaterial({ map: tx, roughness: 1 }), dark = mat('#2a1c10');
    const n = 7;
    for (let i = 0; i < n; i++) {
      const x = -W / 2 + (i + 0.5) * W / n, s2 = new THREE.Group(); s2.position.x = x; g.add(s2);
      const tower = i % 3 === 0, h = tower ? H * 1.3 : H;
      mesh(new THREE.BoxGeometry(W / n + 0.004, h, tower ? 0.22 : 0.16), brick, s2, [0, h / 2, 0]).receiveShadow = true;
      for (let k = 0; k < 3; k++) mesh(new THREE.BoxGeometry(0.05, 0.05, tower ? 0.23 : 0.17), brick, s2, [(k - 1) * W / n / 3, h + 0.025, 0]); // 성가퀴
      if (i === Math.floor(n / 2)) mesh(new THREE.BoxGeometry(0.14, 0.26, 0.02), dark, s2, [0, 0.13, (tower ? 0.11 : 0.08) + 0.002]); // 성문
      s2.userData = { seed: i * 1.7, tilt: (i % 2 ? 1 : -1) * (0.3 + (i % 3) * 0.15) };
      segs.push(s2);
    }
    let rahab, cord;
    if (o.rahab !== false) {
      rahab = new THREE.Group(); rahab.position.set(W / 2 - W / n * 1.5, 0, 0.09); g.add(rahab); // 성벽 앞에 붙은 집
      mesh(new THREE.BoxGeometry(0.3, H * 0.95, 0.06), mat('#cdb48e', { roughness: 1 }), rahab, [0, H * 0.475, 0.0]);
      mesh(new THREE.BoxGeometry(0.07, 0.07, 0.01), dark, rahab, [0.03, H * 0.75, 0.031]);
      cord = mesh(new THREE.BoxGeometry(0.008, H * 0.7, 0.008), mat('#c0201a', { emissive: '#5a0806', emissiveIntensity: 0.6 }), rahab, [0.05, H * 0.37, 0.04]);
    }
    let f = 0;
    return new Prop(g, (P, t, dt) => {
      f = damp(f, P.state === 'fall' ? 1 : 0, 1.4, dt);
      segs.forEach(s2 => { s2.position.y = -f * 0.25; s2.rotation.z = f * s2.userData.tilt; s2.scale.y = 1 - f * 0.55; });
      if (cord) cord.visible = P.state === 'cord' || P.state === 'fall';
    }, { state: o.state || 'stand' });
  },
  // 해와 달: 기브온 위의 해, 아얄론 골짜기의 달 (state 'still'이면 해가 더 밝게 멈춰 선다)
  sunmoon() {
    const g = new THREE.Group();
    const sun = glowSprite(1.1, 0.9); sun.position.set(-0.8, 1.7, -0.6); g.add(sun);
    mesh(sphere(0.09, 16, 12), new THREE.MeshBasicMaterial({ color: '#fff1c0' }), g, [-0.8, 1.7, -0.6]).castShadow = false;
    const moon = mesh(sphere(0.06, 16, 12), new THREE.MeshBasicMaterial({ color: '#e8eef4', transparent: true, opacity: 0.8 }), g, [0.9, 1.45, -0.6]); moon.castShadow = false;
    return new Prop(g, (P, t) => { const k = P.state === 'still' ? 1.3 : 0.9; sun.material.opacity = k * P.show * (0.9 + Math.sin(t * 2) * 0.05); sun.scale.setScalar(1.1 * k); moon.material.opacity = 0.8 * P.show; }, { fade: 'opacity' });
  },
  // 증거의 큰 돌: 상수리나무 아래 세운 선돌
  standing() {
    const g = new THREE.Group();
    mesh(new THREE.BoxGeometry(0.16, 0.42, 0.1), mat('#b0a48c', { roughness: 1, flatShading: true }), g, [0, 0.21, 0]).rotation.y = 0.2;
    return new Prop(g);
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

export { MAKERS, Prop }; // 여정마다 쓰는 소품을 따로 파일에서 더할 수 있게 (stage/david/props.js)

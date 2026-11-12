/* 바울 여정 묶음 d(a33–a42)의 소품: props.js의 MAKERS에 더한다 (stage/paul.js가 import).
   크기는 사람 키(약 0.88)와의 비례로. 무대 x는 오른쪽(+, 동쪽), z는 앞(+, 화면 아래).
   aula(가이사랴 헤롯 궁의 접견실), stormship(유라굴로의 상선 — 줄로 감아 맨 배·부서진 고물), cargo(바다에 던지는 짐), anchors(고물의 닻 넷),
   skiff(구명배 — 내렸다가 줄이 끊겨 떠내려간다), plank(헤엄쳐 나갈 때 붙든 널조각 — on: 배역), viper(손에 매달린 독사 — 불 속에 떨어진다, 상처 없음),
   romecell(로마의 옥 — 높은 창살 창의 빛), cloakbooks(드로아에 두고 온 겉옷과 책·양피지), chain2(바울과 지키는 군인을 잇는 사슬 — on: [두 배역]).
   고통과 폭력은 그리지 않는다: 파선은 기울어 멈춘 배와 물에 뜬 널조각으로, 독사는 손에 매달렸다가 떨어질 뿐 */
import { THREE, mat, DS, lathe, mesh, sphere, glowTexture, damp } from '../kit.js';
import { MAKERS, Prop } from '../props.js';

const wood = () => mat('#7a5634', { roughness: 0.95 });
const marble = () => mat('#ece6d8', { roughness: 0.7 });
const stoneM = (c = '#d8c8a6') => mat(c, { roughness: 0.95 });
const now = () => performance.now() / 1000;
const glow = (size, opacity = 1, color) => {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity, ...(color ? { color } : {}) }));
  s.scale.set(size, size, 1);
  return s;
};
const flameM = (c = '#ffb347', o = 0.85) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, depthWrite: false, blending: THREE.AdditiveBlending });
// 두 점을 잇는 가는 줄 (밧줄·사슬 줄)
const rope = (parent, a, b, m, r = 0.004) => {
  const d = new THREE.Vector3().subVectors(b, a), c = mesh(new THREE.CylinderGeometry(r, r, d.length(), 5), m, parent);
  c.position.copy(a).add(b).multiplyScalar(0.5); c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); c.castShadow = false;
  return c;
};
// 기둥 하나: 받침·몸·기둥머리
const column = (parent, x, z, h, r, m) => {
  mesh(new THREE.BoxGeometry(r * 2.6, 0.03, r * 2.6), m, parent, [x, 0.015, z]);
  mesh(new THREE.CylinderGeometry(r * 0.9, r, h - 0.07, 12), m, parent, [x, 0.03 + (h - 0.07) / 2, z]);
  mesh(new THREE.BoxGeometry(r * 2.5, 0.04, r * 2.5), m, parent, [x, h - 0.02, z]);
};
// 질그릇 항아리와 곡식 자루 (배의 짐)
const amphora = (parent, pos, s = 1) => mesh(lathe([[0.001, 0], [0.012, 0.0], [0.03, 0.05], [0.034, 0.1], [0.022, 0.14], [0.012, 0.16], [0.016, 0.18], [0.001, 0.18]].map(([r, y]) => [r * s, y * s]), 10), mat('#b0703e', { roughness: 0.9 }), parent, pos);
const sack = (parent, pos, s = 1) => mesh(sphere(0.045 * s, 10, 8), mat('#cdb88a', { roughness: 1 }), parent, pos, [1.25, 0.8, 1]);

Object.assign(MAKERS, {
  /* ---------- 가이사랴 ---------- */

  // 헤롯 궁의 접견실 (행 23:35 '헤롯 궁에 지키라', 24장 벨릭스의 재판, 25:23 아그립바와 버니게가 '크게 위엄을 갖추고' 들어온 접견 장소):
  // 흰 대리석 바닥과 가운데 붉은 깔개 길, 뒤에 기둥 줄과 자줏빛 휘장 벽, 양끝의 로마 깃대(독수리 표), 뒤 가운데 낮은 단(heightAt 0.12)과 그 위 의자들(o.seats: 자리 x들).
  // 의자에 앉은 사람은 배역 y 0.28, pose 'sit' — 의자 자리는 소품 자리에서 (seat x, o.dz 기본 -0.48). state 'pomp'면 양옆 화로에 불이 오르고 깃대가 선다
  aula(o = {}) {
    const g = new THREE.Group(), m = marble(), W = o.w || 2.6, D = 1.5, H = 0.12, DZ = o.dz ?? -0.48;
    mesh(new THREE.BoxGeometry(W, 0.02, D), m, g, [0, 0.01, 0]).receiveShadow = true;
    // 바닥 무늬: 짙은 대리석 띠
    [-1, 1].forEach(k => mesh(new THREE.BoxGeometry(W, 0.004, 0.05), stoneM('#a89a84'), g, [0, 0.021, k * (D / 2 - 0.06)]).receiveShadow = true);
    const runner = mesh(new THREE.BoxGeometry(0.42, 0.006, D * 0.62), mat('#8a2a24', { roughness: 1 }), g, [0, 0.023, 0.2]); runner.receiveShadow = true;
    // 뒤 휘장 벽과 기둥
    const back = -D / 2 + 0.05;
    mesh(new THREE.BoxGeometry(W, 0.95, 0.06), stoneM('#e2d6bc'), g, [0, 0.475, back - 0.03]).receiveShadow = true;
    const n = Math.max(4, Math.round(W / 0.42));
    for (let i = 0; i < n; i++) { const x = -W / 2 + 0.1 + i * (W - 0.2) / (n - 1); column(g, x, back + 0.06, 0.95, 0.035, m); }
    mesh(new THREE.BoxGeometry(W + 0.04, 0.08, 0.16), m, g, [0, 0.99, back + 0.03]);
    const purple = mat('#7a4a7e', { roughness: 1, side: THREE.DoubleSide });
    for (let i = 0; i < n - 1; i++) { const x = -W / 2 + 0.1 + (i + 0.5) * (W - 0.2) / (n - 1); const c = mesh(new THREE.PlaneGeometry((W - 0.2) / (n - 1) - 0.1, 0.62), purple, g, [x, 0.6, back + 0.005]); c.castShadow = false; }
    // 단과 의자
    const dais = mesh(new THREE.BoxGeometry(o.dw || 1.3, H, 0.42), m, g, [0, H / 2, DZ]); dais.receiveShadow = true;
    mesh(new THREE.BoxGeometry((o.dw || 1.3) * 0.7, H / 2, 0.08), stoneM('#cbbd9e'), g, [0, H / 4, DZ + 0.25]).receiveShadow = true;
    const iv = mat('#efe6d0', { roughness: 0.5 }), gold = mat('#d6a93a', { metalness: 0.5, roughness: 0.4 }), cush = mat('#6b2a5e', { roughness: 0.9 });
    (o.seats || [0]).forEach((x, i) => {
      const ch = new THREE.Group(); ch.position.set(x, H, DZ); g.add(ch);
      [-1, 1].forEach(s => [-1, 1].forEach(k => { const l = mesh(new THREE.BoxGeometry(0.02, 0.18, 0.02), iv, ch, [s * 0.1, 0.08, 0]); l.rotation.x = k * 0.55; }));
      mesh(new THREE.BoxGeometry(0.26, 0.03, 0.18), gold, ch, [0, 0.16, 0]);
      mesh(new THREE.BoxGeometry(0.24, 0.02, 0.16), (o.cushions || [])[i] ? mat(o.cushions[i], { roughness: 0.9 }) : cush, ch, [0, 0.18, 0]);
      if ((o.backs || [])[i]) mesh(new THREE.BoxGeometry(0.26, 0.28, 0.03), gold, ch, [0, 0.32, -0.09]); // 왕의 자리: 등받이
    });
    // 깃대(독수리 표)와 화로
    const pole = mat('#6a4a2a'), brass = mat('#c8963a', { metalness: 0.4, roughness: 0.45 });
    const stds = [-1, 1].map(k => {
      const s = new THREE.Group(); s.position.set(k * (W / 2 - 0.18), 0, back + 0.2); g.add(s);
      mesh(new THREE.CylinderGeometry(0.008, 0.008, 1.0, 6), pole, s, [0, 0.5, 0]);
      mesh(new THREE.BoxGeometry(0.12, 0.14, 0.008), mat('#9d3328', { roughness: 0.9 }), s, [0, 0.82, 0.01]);
      mesh(new THREE.BoxGeometry(0.1, 0.03, 0.01), gold, s, [0, 0.91, 0.01]);
      mesh(sphere(0.022, 10, 8), gold, s, [0, 1.02, 0], [1.6, 0.9, 0.6]); // 독수리
      return s;
    });
    const fires = [-1, 1].map(k => {
      const f = new THREE.Group(); f.position.set(k * (W / 2 - 0.4), 0, back + 0.35); g.add(f);
      mesh(new THREE.CylinderGeometry(0.012, 0.02, 0.32, 6), brass, f, [0, 0.16, 0]);
      mesh(new THREE.CylinderGeometry(0.07, 0.04, 0.05, 12), brass, f, [0, 0.34, 0]);
      const fl = new THREE.Group(); fl.position.y = 0.37; f.add(fl);
      const fm = flameM();
      for (let i = 0; i < 4; i++) mesh(new THREE.ConeGeometry(0.025, 0.1, 7), fm, fl, [Math.cos(i * 1.6) * 0.025, 0.04, Math.sin(i * 1.6) * 0.02]).castShadow = false;
      const h = glow(0.5, 0.7, '#ffaa50'); h.position.y = 0.05; fl.add(h);
      return fl;
    });
    let k = o.state === 'pomp' ? 1 : 0;
    const P = new Prop(g, (P, t, dt) => {
      k = damp(k, P.state === 'pomp' ? 1 : 0, 1.5, dt);
      fires.forEach((fl, i) => { fl.visible = k > 0.03; fl.scale.set(1, Math.max(0.01, k * (0.9 + Math.sin(t * 9 + i) * 0.1)), 1); });
      stds.forEach(s => { s.visible = k > 0.03; s.scale.y = Math.max(0.01, k); });
    }, { state: o.state || 'idle' });
    P.heightAt = (x, z) => { const u = (x - g.position.x) / g.scale.x, v = (z - g.position.z) / g.scale.z; return P.show > 0.5 && Math.abs(u) < (o.dw || 1.3) / 2 - 0.02 && Math.abs(v - DZ) < 0.2 ? H * g.scale.y : 0; };
    return P;
  },

  /* ---------- 바다 ---------- */

  // 유라굴로 광풍의 상선 (행 27:17 '줄을 가지고 선체를 둘러 감고', 27:41 '고물은 큰 물결에 깨어져 가니'): props.js의 ship에 덧붙인다.
  // state 'sail' | 'furled'(돛을 내림) | 'girded'(돛을 내리고 밧줄로 선체를 감았다) | 'wreck'(이물이 모래톱에 박혀 기울어 멈추고, 고물 둘레에 부서진 널조각)
  stormship(o = {}) {
    const P = MAKERS.ship(o), S = o.big || 1, L = 1.1 * S, B = 0.32 * S, rock = P.obj.children[0], up = P.upd;
    const rm = mat('#d8c8a0', { roughness: 1 });
    const girds = new THREE.Group(); rock.add(girds);
    [-0.5, -0.15, 0.2, 0.55].forEach(u => { const r = mesh(new THREE.TorusGeometry(1, 0.006, 5, 40, Math.PI), rm, girds, [u * L, 0.22 * S, 0], [B * 1.04, 0.26 * S, 1]); r.rotation.set(0, Math.PI / 2, Math.PI); r.castShadow = false; });
    const debris = new THREE.Group(); P.obj.add(debris);
    const pm = mat('#7a5634', { roughness: 0.95 });
    const bits = Array.from({ length: 7 }, (_, i) => { const b = mesh(new THREE.BoxGeometry(0.16 + (i % 3) * 0.05, 0.015, 0.035), pm, debris, [-L * 1.05 - (i % 3) * 0.12, 0.07, (i - 3) * 0.08]); b.rotation.y = i * 0.9; b.userData.y = 0.07; return b; });
    const foam = glow(0.9 * S, 0.0, '#f4fbff'); foam.position.set(-L * 0.95, 0.12, 0); P.obj.add(foam);
    let w = o.state === 'wreck' ? 1 : 0;
    P.upd = (P, t, dt, env) => {
      const s = P.state;
      P.state = s === 'sail' ? 'sail' : 'furled'; up(P, t, dt, env); P.state = s;
      w = damp(w, s === 'wreck' ? 1 : 0, 0.8, dt);
      girds.visible = s === 'girded' || s === 'wreck';
      // 파선: 흔들림이 멎고 이물이 들린 채 고물이 물에 잠긴다
      if (w > 0.01) { rock.rotation.x *= 1 - w; rock.rotation.z = rock.rotation.z * (1 - w) + w * 0.3; rock.position.y = rock.position.y * (1 - w) - w * 0.05 * S; }
      debris.visible = w > 0.05;
      bits.forEach((b, i) => { b.position.y = b.userData.y + Math.sin(t * 1.6 + i) * 0.012; b.scale.setScalar(Math.max(0.01, w)); });
      foam.material.opacity = w * (0.35 + Math.sin(t * 2.5) * 0.15);
    };
    return P;
  },

  // 바다에 던지는 짐 (행 27:18–19, 38 '이튿날 짐을 바다에 풀어 버리고 사흘째 되는 날에 배의 기구를 내버리니', '밀을 바다에 버리니'):
  // 갑판 위에 쌓인 곡식 자루와 항아리(배 가운데 자리에 둔다, 갑판 높이 o.y 기본 0.22). state 'stow' | 'throw'(하나씩 뱃전 너머 앞(+z) 바다로 날아가 물보라와 함께 사라진다) | 'gone'
  cargo(o = {}) {
    const g = new THREE.Group(), y = o.y ?? 0.22, sc = o.s || 1;
    const items = [[-0.32, -0.04, 's'], [-0.2, 0.05, 'a'], [-0.08, -0.06, 's'], [0.38, 0.04, 'a'], [0.48, -0.05, 's'], [-0.26, 0.0, 's'], [0.42, 0.0, 'a']].map(([x, z, k], i) => {
      x *= sc;
      const it = new THREE.Group(); it.position.set(x, y + (i > 4 ? 0.06 : 0), z); g.add(it);
      if (k === 's') sack(it, [0, 0.03 * sc, 0], sc); else amphora(it, [0, 0, 0], 0.9 * sc);
      it.userData = { x, z, y: it.position.y, i };
      return it;
    });
    const splashes = items.map(() => { const r = new THREE.Mesh(new THREE.RingGeometry(0.8, 1, 24), new THREE.MeshBasicMaterial({ color: '#eef6f8', transparent: true, depthWrite: false, opacity: 0 })); r.rotation.x = -Math.PI / 2; g.add(r); return r; });
    return new Prop(g, P => {
      const since = now() - P.t0, order = [5, 6, 0, 3, 1, 4, 2];
      items.forEach((it, j) => {
        const d = it.userData, slot = order.indexOf(j), k = P.state === 'gone' ? 9 : P.state === 'throw' && P.t0 ? since - slot * 0.9 : -1;
        const sp = splashes[j], tx = d.x * 1.2, tz = 0.75 + (j % 3) * 0.12;
        if (k < 0) { it.visible = true; it.position.set(d.x, d.y, d.z); it.rotation.set(0, 0, 0); sp.material.opacity = 0; return; }
        const u = Math.min(1, k / 0.8);
        it.position.set(d.x + (tx - d.x) * u, d.y + Math.sin(u * Math.PI) * 0.35 - u * (d.y - 0.02), d.z + (tz - d.z) * u);
        it.rotation.set(u * 3, 0, u * 2); it.visible = u < 1;
        const s = k - 0.8; sp.position.set(tx, 0.09, tz); sp.scale.setScalar(0.04 + Math.max(0, s) * 0.15); sp.material.opacity = s > 0 && s < 1.6 ? 0.7 * (1 - s / 1.6) : 0;
      });
    }, { state: o.state || 'stow', fade: 'none' });
  },

  // 고물에서 내린 닻 넷 (행 27:29): 고물 뱃전에서 비스듬히 물속으로 들어가는 밧줄 넷. state 'up'(감아 올림 — 보이지 않음) | 'down'(내림 — 밧줄이 뻗어 나가 물에 잠긴다)
  // 소품 자리를 고물 끝(배 자리에서 -x)에 두고, o.y 뱃전 높이(기본 0.22)
  anchors(o = {}) {
    const g = new THREE.Group(), y = o.y ?? 0.22, rm = mat('#c8b48a', { roughness: 1 });
    const ropes = [-0.12, -0.04, 0.04, 0.12].map((z, i) => { const r = new THREE.Group(); r.position.set(0, y, z); g.add(r); rope(r, new THREE.Vector3(0, 0, 0), new THREE.Vector3(-0.42 - (i % 2) * 0.08, -y - 0.04, z * 2.2), rm, 0.004); return r; });
    const rings = ropes.map((r, i) => { const s = new THREE.Mesh(new THREE.RingGeometry(0.7, 1, 20), new THREE.MeshBasicMaterial({ color: '#eef6f8', transparent: true, depthWrite: false, opacity: 0.5 })); s.rotation.x = -Math.PI / 2; s.position.set(-0.42 - (i % 2) * 0.08, 0.085, [-0.12, -0.04, 0.04, 0.12][i] * 2.2); s.scale.setScalar(0.03); g.add(s); return s; });
    let k = o.state === 'down' ? 1 : 0;
    return new Prop(g, (P, t, dt) => {
      k = damp(k, P.state === 'down' ? 1 : 0, 1.2, dt);
      ropes.forEach((r, i) => { r.visible = k > 0.02; r.scale.setScalar(Math.max(0.01, Math.min(1, k * 1.3 - i * 0.08))); });
      rings.forEach((s, i) => { s.visible = k > 0.6; s.scale.setScalar(0.03 + Math.sin(t * 2 + i) * 0.006); });
    }, { state: o.state || 'up', fade: 'none' });
  },

  // 구명배(o.small 크기) (행 27:16, 30–32 '거룻배를 바다에 내려놓거늘 … 이에 군인들이 거룻줄을 끊어 떼어 버리니라'): 작은 배와 큰 배로 잇는 밧줄.
  // state 'down'(큰 배 곁 물에 떠 있고 밧줄이 뱃전(o.rope: 소품 자리에서 [x, y, z])으로 이어진다) | 'cut'(줄이 끊겨 빈 배가 물결에 떠밀려 가며 사라진다)
  skiff(o = {}) {
    const g = new THREE.Group(), boat = MAKERS.boat(); boat.obj.scale.setScalar(o.small || 0.42); g.add(boat.obj);
    const ra = o.rope || [0.15, 0.22, -0.4], rm = mat('#c8b48a', { roughness: 1 });
    const line = rope(g, new THREE.Vector3(0.2, 0.08, 0), new THREE.Vector3(...ra), rm, 0.005);
    const P = new Prop(g, (P, t, dt, env) => {
      boat.update(t, dt, env);
      const k = P.state === 'cut' && P.t0 ? now() - P.t0 : 0;
      line.visible = P.state !== 'cut';
      // 끊긴 빈 배는 천천히 떠밀려 가며 옅어진다 (무대 가장자리 전에 사라진다)
      boat.obj.position.set(k * 0.12, 0.06, k * 0.08); boat.obj.rotation.y = k * 0.15;
      const f = P.state === 'cut' ? Math.max(0, 1 - k / 5) : 1;
      boat.obj.scale.setScalar(Math.max(0.001, (o.small || 0.42) * f));
    }, { state: o.state || 'down' });
    return P;
  },

  // 헤엄쳐 나갈 때 붙든 널조각 (행 27:44 '그 남은 사람들은 널조각 혹은 배 물건에 의지하여 나가게 하니'): 물 위에 뜬 판자. on: '배역'으로 그 사람을 따른다
  plank(o = {}) {
    const g = new THREE.Group(), b = mesh(new THREE.BoxGeometry(o.len || 0.3, 0.018, 0.07), mat('#8a6440', { roughness: 0.95 }), g, [0, 0.08, 0.06]);
    b.rotation.y = o.rot || 0.3;
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.75, 1, 24), new THREE.MeshBasicMaterial({ color: '#eef6f8', transparent: true, depthWrite: false, opacity: 0.45 })); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.085; ring.scale.setScalar(0.12); g.add(ring);
    return new Prop(g, (P, t) => { b.position.y = 0.08 + Math.sin(t * 2 + (o.rot || 0) * 5) * 0.008; ring.scale.setScalar(0.12 + Math.sin(t * 1.4) * 0.015); }, { fade: 'scale' });
  },

  /* ---------- 멜리데 ---------- */

  // 손에 매달린 독사 (행 28:3–6): on: '배역'으로 그 사람을 따른다. 손 자리 o.hand [x, y, z](배역 기준, 기본 오른손 앞), 불 자리 o.fire [x, z](배역 기준 — 떨어 버릴 곳).
  // state 'none' | 'bite'(손에서 늘어진 가는 뱀 — 몸이 천천히 흔들린다. 피·상처 없음) | 'shake'(뱀이 포물선으로 불 속에 떨어져 사라진다)
  viper(o = {}) {
    const g = new THREE.Group(), [hx, hy, hz] = o.hand || [0.13, 0.42, 0.08], [fx, fz] = o.fire || [0.35, 0.1];
    const snake = new THREE.Group(); g.add(snake);
    // 작은 무대에서도 보이게 굵게, 짙은 몸에 옅은 띠 무늬
    const sm = mat('#2e2a22', { roughness: 0.6 }), dm = mat('#c8b07a', { roughness: 0.7 });
    const segs = Array.from({ length: 14 }, (_, i) => { const r = 0.016 - i * 0.0008, s = mesh(sphere(r, 8, 6), i % 3 === 2 ? dm : sm, snake, [0, -i * 0.021, 0]); s.castShadow = false; return s; });
    mesh(sphere(0.017, 8, 6), sm, snake, [0, 0.01, 0.008], [1, 0.8, 1.5]).castShadow = false; // 머리 (손에)
    return new Prop(g, (P, t) => {
      const k = P.state === 'shake' && P.t0 ? now() - P.t0 : -1;
      snake.visible = P.state === 'bite' || (k >= 0 && k < 1.0);
      if (P.state === 'bite') { snake.position.set(hx, hy, hz); snake.rotation.set(0, 0, 0); segs.forEach((s, i) => { s.position.x = Math.sin(t * 2.2 + i * 0.5) * 0.006 * i; }); }
      else if (k >= 0) { // 떨어 버림: 손을 털자 불 속으로
        const u = Math.min(1, k / 0.9);
        snake.position.set(hx + (fx - hx) * u, hy + Math.sin(u * Math.PI) * 0.2 - u * (hy - 0.06), hz + (fz - hz) * u);
        snake.rotation.set(u * 4, 0, u * 3);
      }
    }, { state: o.state || 'none', fade: 'none' });
  },

  /* ---------- 로마 ---------- */

  // 로마의 옥 (딤후 1:16–17·4:6 '쇠사슬에 매인'): 어두운 마름돌 방 — 뒷벽과 양옆 벽(앞은 트였다), 뒷벽 높은 곳의 쇠창살 창, 그 창으로 비스듬히 내리는 빛줄기와 바닥의 빛.
  // 짚 깔개와 물병. state 'dim'(가는 빛) | 'light'(빛이 밝게 차오른다 — 4:17 '주께서 내 곁에 서서'). o.w 너비(기본 1.9)
  romecell(o = {}) {
    const g = new THREE.Group(), W = o.w || 1.9, D = 1.15, H = 0.92, st = mat('#7a7064', { roughness: 1 }), dk = mat('#5e564c', { roughness: 1 });
    mesh(new THREE.BoxGeometry(W, 0.02, D), mat('#5a5248', { roughness: 1 }), g, [0, 0.01, 0]).receiveShadow = true;
    mesh(new THREE.BoxGeometry(W + 0.1, H, 0.08), st, g, [0, H / 2, -D / 2]).receiveShadow = true;
    [-1, 1].forEach(k => mesh(new THREE.BoxGeometry(0.08, H * 0.82, D), dk, g, [k * (W / 2 + 0.01), H * 0.41, 0]).receiveShadow = true);
    for (let r = 0; r < 4; r++) mesh(new THREE.BoxGeometry(W + 0.1, 0.006, 0.006), dk, g, [0, 0.2 + r * 0.2, -D / 2 + 0.042]).castShadow = false; // 마름돌 줄눈
    // 높은 창 (뒷벽, 오른쪽 위)
    const wx = o.wx ?? W * 0.22, wy = H - 0.2;
    mesh(new THREE.BoxGeometry(0.22, 0.14, 0.02), mat('#f4ecd4', { emissive: '#d8c8a0', emissiveIntensity: 0.9 }), g, [wx, wy, -D / 2 + 0.035]).castShadow = false;
    for (let i = 0; i < 4; i++) mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.15, 5), mat('#2a2622'), g, [wx - 0.075 + i * 0.05, wy, -D / 2 + 0.05]).castShadow = false;
    // 빛줄기: 창에서 앞쪽 바닥으로 비스듬히 (보통 섞음의 옅은 금빛 — 밝은 바닥 위에서도 보이게)
    const shaftM = new THREE.MeshBasicMaterial({ color: '#fff2c8', transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide });
    const fx = o.fx ?? wx - 0.25, fz = o.fz ?? 0.15;
    const a = new THREE.Vector3(wx, wy, -D / 2 + 0.05), b = new THREE.Vector3(fx, 0.02, fz), d = new THREE.Vector3().subVectors(b, a);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.24, d.length(), 16, 1, true), shaftM); shaft.position.copy(a).add(b).multiplyScalar(0.5);
    shaft.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize().negate()); g.add(shaft); shaft.castShadow = false;
    const poolM = new THREE.MeshBasicMaterial({ color: '#fff0c0', transparent: true, opacity: 0.25, depthWrite: false, map: glowTexture() });
    const pool = new THREE.Mesh(new THREE.CircleGeometry(0.32, 24), poolM); pool.rotation.x = -Math.PI / 2; pool.position.set(fx, 0.024, fz); pool.scale.set(1, 0.7, 1); g.add(pool);
    const halo = glow(1.1, 0, '#fff4d8'); halo.position.set(fx, 0.45, fz); g.add(halo);
    const L = new THREE.PointLight('#ffe8b8', 0.15, 2.4, 1.4); L.position.set(fx, 0.7, fz); g.add(L);
    // 짚 깔개와 물병
    mesh(new THREE.BoxGeometry(0.42, 0.015, 0.26), mat('#a89060', { roughness: 1 }), g, [-W * 0.28, 0.025, -0.15]).receiveShadow = true;
    mesh(lathe([[0.001, 0], [0.025, 0], [0.032, 0.05], [0.018, 0.09], [0.022, 0.1], [0.001, 0.1]], 10), mat('#a8673e', { roughness: 0.9 }), g, [-W / 2 + 0.15, 0.02, -D / 2 + 0.15]);
    let k = o.state === 'light' ? 1 : 0;
    return new Prop(g, (P, t, dt) => {
      k = damp(k, P.state === 'light' ? 1 : 0, 0.6, dt);
      shaftM.opacity = (0.1 + k * 0.22) * P.show; poolM.opacity = (0.22 + k * 0.45) * P.show;
      halo.material.opacity = k * 0.55 * P.show * (0.9 + Math.sin(t * 1.3) * 0.1); L.intensity = (0.15 + k * 1.4) * P.show;
    }, { state: o.state || 'dim' });
  },

  // 드로아에 두고 온 겉옷과 책, 특히 양피지 (딤후 4:13): 접어 둔 두꺼운 겉옷, 가죽 묶음 책(코덱스), 말아 묶은 양피지 둘. show로 나타난다
  cloakbooks(o = {}) {
    const g = new THREE.Group();
    mesh(new THREE.BoxGeometry(0.2, 0.05, 0.14), mat('#7a4a2a', { roughness: 1 }), g, [0, 0.025, 0]).receiveShadow = true; // 겉옷
    mesh(new THREE.BoxGeometry(0.2, 0.012, 0.14), mat('#6a3e22', { roughness: 1 }), g, [0, 0.056, 0]);
    mesh(new THREE.BoxGeometry(0.09, 0.03, 0.12), mat('#5a3a1e', { roughness: 0.8 }), g, [0.17, 0.015, 0.02]).rotation.y = 0.3; // 책
    mesh(new THREE.BoxGeometry(0.08, 0.026, 0.11), mat('#efe2bf', { roughness: 0.9 }), g, [0.17, 0.017, 0.02]).rotation.y = 0.3;
    [0, 1].forEach(i => { const r = mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.14, 10), mat('#e8d8b0', { roughness: 0.9 }), g, [0.02 + i * 0.05, 0.08 + i * 0.006, 0.0]); r.rotation.z = Math.PI / 2; r.rotation.y = 0.2 - i * 0.4; });
    return new Prop(g);
  },

  // 지키는 군인과 바울을 잇는 사슬 (행 28:16·20 '이 쇠사슬에 매인 것이라', 엡 6:20 '쇠사슬에 매인 사신'): on: ['바울', '군인']으로 두 사람의 한가운데를 따른다.
  // 두 사람은 x로 o.len(기본 0.32)만큼 떨어져 선다 — 손목 높이(o.y)에서 아래로 늘어진 고리 사슬
  chain2(o = {}) {
    const g = new THREE.Group(), len = o.len || 0.32, y = o.y ?? 0.42, n = 13;
    const m = new THREE.MeshStandardMaterial({ color: '#8a8a86', emissive: '#2a2a28', emissiveIntensity: 0.4, metalness: 0.25, roughness: 0.5 });
    for (let i = 0; i < n; i++) { const u = i / (n - 1), x = -len / 2 + u * len, l = mesh(new THREE.TorusGeometry(0.012, 0.004, 5, 8), m, g, [x, y - Math.sin(u * Math.PI) * 0.12, 0.05]); l.rotation.y = (i % 2) * Math.PI / 2; l.castShadow = false; }
    [-1, 1].forEach(k => mesh(new THREE.TorusGeometry(0.022, 0.006, 6, 12), m, g, [k * len / 2, y, 0.05]).rotation.x = Math.PI / 2); // 손목 고리
    return new Prop(g, null, { fade: 'scale' });
  },
});

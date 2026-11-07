/* 거리 무대의 부품: 여섯 방 성문, 성벽, 네 방 집, 좌판·저울, 올리브나무, 항아리, 먼 산.
   세트(gate.js·field.js)가 가져다 늘어놓는다 */
import { THREE, mat, mesh } from '../kit.js';
import { M, rnd, ashlar, plaster, rubble, texMat, block, merlons } from './kit.js';

/* ---------- 여섯 방 성문 ----------
   안쪽 얼굴이 z0. 폭 18m, 깊이 20m, 통로 4.2m. 통로 양옆으로 방이 셋씩(장로와 재판관이 앉던 곳) */
export function gate(g, z0) {
  const S = texMat(ashlar('#cbb58f'));
  const W = 18 * M, D = 20 * M, P = 4.2 * M, H = 9.5 * M, half = W / 2, zc = z0 - D / 2;
  // 양쪽 탑
  [-1, 1].forEach(s => {
    block(g, S, s * (half + P / 2) / 2, zc, half - P / 2, D, H);
    merlons(g, S, s > 0 ? P / 2 : -half, s > 0 ? half : -P / 2, z0 - 0.35 * M, H, 0.7 * M);
    merlons(g, S, s > 0 ? P / 2 : -half, s > 0 ? half : -P / 2, z0 - D + 0.35 * M, H, 0.7 * M);
  });
  // 통로 위를 건너는 윗부분 (문 높이 5m) — 나무 상인방 위에
  const DH = 5 * M;
  // 통로 위 덩어리는 양쪽 탑 속으로 조금 넣고, 앞뒷면은 1cm 안으로 — 탑과 맞붙인 이음매가 가는 금으로 벌어져 번쩍였다
  block(g, S, 0, zc, P + 0.4 * M, D - 0.02 * M, H - DH - 0.01 * M, DH); // (윗면도 1cm 낮게 — 탑 윗면과 겹치지 않게)
  merlons(g, S, -P / 2, P / 2, z0 - 0.35 * M, H, 0.7 * M);
  // 통로 양옆의 문설주 기둥(벽면에서 조금 내민 돌띠): 탑과 통로 위 덩어리의 이음매를 덮는다 — 이음매가 가는 빛줄로 번쩍였다
  [-1, 1].forEach(k => block(g, S, k * (P / 2 + 0.3 * M), z0 + 0.12 * M, 0.7 * M, 0.3 * M, H - 0.02 * M, 0, 4 * M));
  const wood = mat('#5d4632', { roughness: 0.9 });
  [z0 - 0.15 * M, z0 - D + 0.15 * M].forEach(z => mesh(new THREE.BoxGeometry(P + 0.6 * M, 0.45 * M, 0.5 * M), wood, g, [0, DH + 0.2 * M, z]));
  // 통로 안: 양옆 방 셋씩 — 기둥벽(피어) 사이로 어두운 방이 열린다
  const dark = mat('#3a3024', { roughness: 1 });
  for (let i = 0; i < 4; i++) {
    const z = z0 - 0.9 * M - i * (D - 1.8 * M) / 3;
    [-1, 1].forEach(s => block(g, S, s * (P / 2 - 0.05 * M), z, 0.1 * M, 1.6 * M, DH, 0)); // 통로 쪽으로 내민 기둥벽 (탑의 면과 겹치면 깜박였다)
  }
  [-1, 1].forEach(s => block(g, dark, s * (P / 2 + 0.25 * M), zc, 0.1 * M, D - 2 * M, DH * 0.98, 0));
  // 바깥쪽 끝의 두 문짝 (활짝 열려 안쪽 벽에 붙어 있다)
  [-1, 1].forEach(s => {
    const leaf = block(g, wood, s * (P / 2 - 0.12 * M), z0 - D + 1.6 * M, 0.18 * M, P / 2, DH * 0.96, 0, 1 * M);
    for (let k = 0; k < 4; k++) mesh(new THREE.BoxGeometry(0.22 * M, 0.15 * M, P / 2), mat('#3b2e22', { metalness: 0.3 }), g, [leaf.position.x, (0.6 + k * 1.2) * M, leaf.position.z]);
  });
  // 성문 안쪽 얼굴의 돌 의자 — 장로들이 앉아 송사를 듣던 곳 (룻 4:1, 잠 31:23)
  const bench = texMat(ashlar('#bfa883'));
  [-1, 1].forEach(s => block(g, bench, s * (half + P / 2) / 2, z0 + 0.32 * M, half - P / 2 - 0.6 * M, 0.65 * M, 0.45 * M, 0, 2 * M));
  return { half, depth: D, H };
}

// 성벽: 성문 양옆으로 (두 겹 벽 사이를 방으로 쓴 카세메이트 벽, 두께 4m)
export function cityWall(g, x0, x1, zFace) {
  const S = texMat(ashlar('#c3ad87'));
  const T = 4 * M, H = 7.5 * M;
  block(g, S, (x0 + x1) / 2, zFace - T / 2, Math.abs(x1 - x0), T, H); // 폭이 음수면 상자가 뒤집혀 안쪽 면이 그려졌다(서쪽 성벽)
  merlons(g, S, Math.min(x0, x1), Math.max(x0, x1), zFace - 0.3 * M, H, 0.6 * M);
}

/* ---------- 집 ----------
   네 방 집(이스라엘 집의 전형): 돌 기초 위 회칠한 흙벽돌, 평평한 흙 지붕에 난간, 들보 끝이 벽 밖으로 나온다.
   face: 문이 난 쪽 (+1 동쪽 / -1 서쪽 / 0 남쪽 앞) */
export const WALLS = ['#d9c7a3', '#e1d0ad', '#cfb991', '#d6c19b', '#e4d6b8'];
export function house(g, x, z, w, d, floors = 2, face = 1, o = {}) {
  const fh = 3 * M, H = floors * fh, base = 1.1 * M;
  const P = texMat(plaster(o.color || WALLS[Math.floor(rnd() * WALLS.length)]));
  const R = texMat(rubble('#a89474'), '#ffffff');
  block(g, R, x, z, w, d, base, 0, 2 * M);
  block(g, P, x, z, w, d, H - base, base, 3 * M);
  // 지붕: 흙을 다진 위층 + 난간
  const roof = mat('#a8916c', { roughness: 1 });
  block(g, roof, x, z, w + 0.12 * M, d + 0.12 * M, 0.25 * M, H);
  const par = 0.9 * M, t = 0.22 * M;
  block(g, P, x, z - d / 2 + t / 2, w - 2 * t, t, par, H + 0.25 * M, 3 * M); // 앞뒤 난간은 옆 난간 사이에만 — 모서리가 겹치면 면이 다퉜다
  block(g, P, x, z + d / 2 - t / 2, w - 2 * t, t, par, H + 0.25 * M, 3 * M);
  block(g, P, x - w / 2 + t / 2, z, t, d, par, H + 0.25 * M, 3 * M);
  block(g, P, x + w / 2 - t / 2, z, t, d, par, H + 0.25 * M, 3 * M);
  // 문이 난 얼굴: 들보 끝, 문, 작은 창
  const doorM = mat('#4e3a28', { roughness: 0.9 }), holeM = mat('#2a221a', { roughness: 1 });
  const fx = face === 0 ? x : x + face * (w / 2 + 0.02 * M), fz = face === 0 ? z + d / 2 + 0.02 * M : z;
  const along = face === 0 ? [1, 0] : [0, 1], span = face === 0 ? w : d;
  const put = (u, y, gw, gh, m, depth = 0.06 * M) => {
    const geo = face === 0 ? new THREE.BoxGeometry(gw, gh, depth) : new THREE.BoxGeometry(depth, gh, gw);
    mesh(geo, m, g, [fx + along[0] * u, y, fz + along[1] * u]);
  };
  const du = o.door ?? (rnd() - 0.5) * span * 0.4;
  put(du, 1.05 * M, 1.1 * M, 2.1 * M, doorM);
  put(du, 2.2 * M, 1.5 * M, 0.22 * M, mat('#6b5238'), 0.12 * M); // 상인방
  for (let f = 1; f < floors; f++) {
    for (let k = 0; k < 2; k++) put((k ? 1 : -1) * span * 0.25, f * fh + 1.4 * M, 0.55 * M, 0.75 * M, holeM);
  }
  if (floors === 1) put(-du * 0.8 + span * 0.18, 1.7 * M, 0.5 * M, 0.5 * M, holeM);
  // 들보 끝
  const n = Math.max(3, Math.round(span / (0.8 * M)));
  for (let f = 1; f <= floors; f++) {
    const y = f * fh - 0.1 * M;
    for (let i = 0; i < n; i++) {
      const u = -span / 2 + span * (i + 0.5) / n;
      const b = mesh(new THREE.CylinderGeometry(0.07 * M, 0.08 * M, 0.35 * M, 7), mat('#5a4330'), g, [fx + along[0] * u, y, fz + along[1] * u]);
      if (face === 0) b.rotation.x = Math.PI / 2; else b.rotation.z = Math.PI / 2;
    }
  }
  // 지붕 위: 말리는 아마 다발, 항아리 (수 2:6)
  if (o.roof !== false && rnd() < 0.7) {
    const jar = mat('#b0754a');
    mesh(new THREE.CylinderGeometry(0.16 * M, 0.12 * M, 0.55 * M, 10), jar, g, [x + (rnd() - 0.5) * w * 0.5, H + 0.5 * M, z + (rnd() - 0.5) * d * 0.5]);
    block(g, mat('#c9b27a', { roughness: 1 }), x + (rnd() - 0.5) * w * 0.4, z + (rnd() - 0.5) * d * 0.4, w * 0.35, d * 0.25, 0.15 * M, H + 0.25 * M);
  }
  // 바깥 돌계단 (지붕으로 오르는)
  if (o.stair) {
    const sm = texMat(rubble('#b19c7a'));
    const steps = 9, sx = face === 0 ? x - w / 2 - 0.6 * M : fx + face * 0.55 * M;
    for (let i = 0; i < steps; i++) {
      const sh = (i + 1) * H / steps;
      if (face === 0) block(g, sm, sx, z + d / 2 - 0.3 * M - i * d * 0.9 / steps, 1.1 * M, d * 0.9 / steps, sh, 0, 2 * M);
      else block(g, sm, sx, z - d / 2 + 0.3 * M + i * d * 0.9 / steps, 1.1 * M, d * 0.9 / steps, sh, 0, 2 * M);
    }
  }
  return H;
}

/* ---------- 장터의 것들 ---------- */
// 차양 친 좌판: 기둥 넷에 천을 얹고, 앞에 상
export function stall(g, x, z, rot, cloth, goods = 'jars') {
  const s = new THREE.Group(); s.position.set(x, 0, z); s.rotation.y = rot; g.add(s);
  const pole = mat('#6a5038');
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => mesh(new THREE.CylinderGeometry(0.05 * M, 0.06 * M, (b < 0 ? 2.5 : 2.2) * M, 7), pole, s, [a * 1.2 * M, (b < 0 ? 1.25 : 1.1) * M, b * 0.9 * M]));
  const c = mesh(new THREE.BoxGeometry(2.7 * M, 0.04 * M, 2.1 * M), mat(cloth, { side: THREE.DoubleSide }), s, [0, 2.36 * M, 0]);
  c.rotation.x = -0.14;
  // 천 끝의 술 (흔들리는 줄무늬)
  mesh(new THREE.BoxGeometry(2.7 * M, 0.3 * M, 0.03 * M), mat('#e8dcc0'), s, [0, 2.1 * M, 1.06 * M]);
  const tbl = texMat(rubble('#9a8466'));
  block(s, tbl, 0, 0.55 * M, 2.2 * M, 0.7 * M, 0.75 * M, 0, 2 * M);
  const clay = ['#b0754a', '#9c6440', '#c48a5c'];
  if (goods === 'jars') for (let i = 0; i < 5; i++) {
    const r = (0.13 + rnd() * 0.06) * M, h = (0.4 + rnd() * 0.3) * M;
    mesh(new THREE.CylinderGeometry(r * 0.7, r, h, 10), mat(clay[i % 3]), s, [(-0.85 + i * 0.42) * M, 0.75 * M + h / 2, 0.55 * M]);
  }
  // 곡식 자루는 상의 양 끝과 뒤쪽에 — 가운데 앞은 저울 자리 (자루가 저울을 가렸다)
  if (goods === 'grain') [[-0.88, 0.32], [-0.5, 0.25], [0.52, 0.25], [0.9, 0.34]].forEach(([u, w], i) => {
    const sack = mesh(new THREE.SphereGeometry(0.2 * M, 10, 8), mat(['#cdb07a', '#d8c08c', '#bfa06c'][i % 3]), s, [u * M, 0.88 * M, w * M]);
    sack.scale.y = 0.8;
  });
  if (goods === 'cloth') ['#8a3a2e', '#2f5a6a', '#c9a24a', '#e8dcc0'].forEach((col, i) =>
    block(s, mat(col), (-0.75 + i * 0.5) * M, 0.55 * M, 0.42 * M, 0.5 * M, 0.12 * M + i * 0.02 * M, 0.75 * M));
  return s;
}
// 저울: 기둥에 매단 들보, 두 접시 (잠 11:1 속이는 저울과 바른 추)
export function scales(g, x, y, z, rot = 0) {
  const s = new THREE.Group(); s.position.set(x, y, z); s.rotation.y = rot; g.add(s);
  const brass = mat('#b8893a', { metalness: 0.55, roughness: 0.4 }), L = 0.45 * M;
  mesh(new THREE.CylinderGeometry(0.02 * M, 0.035 * M, 0.75 * M, 8), mat('#5a4330'), s, [0, 0.375 * M, 0]);
  const beam = new THREE.Group(); beam.position.y = 0.75 * M; s.add(beam);
  mesh(new THREE.BoxGeometry(2 * L + 0.04 * M, 0.03 * M, 0.03 * M), brass, beam);
  mesh(new THREE.ConeGeometry(0.03 * M, 0.12 * M, 6), brass, beam, [0, 0.07 * M, 0]); // 바늘
  // 접시는 들보 끝에 매달려 들보가 기울어도 늘 수평 (update에서 되돌려 돌린다)
  const pans = [-1, 1].map(k => {
    const h = new THREE.Group(); h.position.x = k * L; beam.add(h);
    [-1, 1].forEach(q => { const c = mesh(new THREE.CylinderGeometry(0.004 * M, 0.004 * M, 0.34 * M, 4), brass, h, [q * 0.07 * M, -0.17 * M, 0]); c.rotation.z = q * 0.2; });
    mesh(new THREE.CylinderGeometry(0.14 * M, 0.09 * M, 0.04 * M, 16), brass, h, [0, -0.34 * M, 0]);
    return h;
  });
  // 왼쪽 접시엔 곡식 한 줌, 오른쪽엔 돌 추 둘
  const heap = mesh(new THREE.SphereGeometry(0.11 * M, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), mat('#d8bd78', { roughness: 1 }), pans[0], [0, -0.32 * M, 0]);
  heap.scale.y = 0.6;
  const stone = mat('#4a4440', { roughness: 0.7 });
  const w1 = mesh(new THREE.CylinderGeometry(0.035 * M, 0.045 * M, 0.06 * M, 10), stone, pans[1], [-0.04 * M, -0.29 * M, 0]);
  const w2 = mesh(new THREE.CylinderGeometry(0.03 * M, 0.04 * M, 0.05 * M, 10), stone, pans[1], [0.05 * M, -0.295 * M, 0.02 * M]);
  // tilt: 들보 기울기 (+면 추 쪽이 내려감). 속이는 추(cheat)는 가벼운 추로 곡식 쪽이 덜 내려간다
  const st = { tilt: 0, goal: 0 };
  const set = (v, instant) => { st.goal = v; if (instant) st.tilt = v; };
  const update = (time, dt) => {
    st.tilt += (st.goal - st.tilt) * (1 - Math.exp(-2.2 * dt));
    beam.rotation.z = -st.tilt + Math.sin(time * 1.7) * 0.012; // 접시가 살짝 흔들린다
    pans.forEach(h => { h.rotation.z = -beam.rotation.z; });
  };
  update(0, 1);
  return { group: s, beam, set, update, weights: [w1, w2] };
}
// 올리브나무 (광장 귀퉁이 그늘)
export function olive(g, x, z, k = 1) {
  const t = new THREE.Group(); t.position.set(x, 0, z); t.scale.setScalar(k); g.add(t);
  const bark = mat('#6a5a46', { roughness: 1 });
  const trunk = mesh(new THREE.CylinderGeometry(0.16 * M, 0.3 * M, 2.2 * M, 9), bark, t, [0, 1.1 * M, 0]);
  trunk.rotation.z = 0.12;
  const leaf = ['#7d8a5a', '#8a9668', '#6f7c50'];
  for (let i = 0; i < 9; i++) {
    const a = i * 2.4, r = (0.6 + rnd() * 0.9) * M;
    const b = mesh(new THREE.IcosahedronGeometry((0.9 + rnd() * 0.5) * M, 1), mat(leaf[i % 3], { flatShading: true }), t,
      [Math.cos(a) * r, (2.5 + rnd() * 0.9) * M, Math.sin(a) * r]);
    b.scale.y = 0.62;
  }
  return t;
}
// 땅 위의 흩어진 것들: 항아리·바구니
export function jarsAt(g, list) {
  const clay = ['#b0754a', '#9c6440', '#c48a5c'];
  list.forEach(([x, z, k = 1], i) => {
    const h = 0.75 * M * k, r = 0.22 * M * k;
    const j = mesh(new THREE.LatheGeometry([[0.01, 0], [r * 0.6, 0.02], [r, h * 0.45], [r * 0.85, h * 0.8], [r * 0.4, h * 0.9], [r * 0.45, h]].map(([a, b]) => new THREE.Vector2(a, b)), 14), mat(clay[i % 3]), g, [x, 0, z]);
    j.receiveShadow = true;
  });
}

/* ---------- 멀리: 감람산과 하늘 ---------- */
export function farHills(g, zm = 100) {
  // 능선: 감람산(동쪽 높은 봉우리)이 성벽 위로 조금 보이게. 멀리 있어 안개에 묻히며 푸르스름해진다
  const ridge = x => (12 + 6 * Math.exp(-(((x - 30 * M) / (40 * M)) ** 2)) + 2 * Math.sin(x / (21 * M)) + 0.8 * Math.sin(x / (7 * M) + 1)) * M;
  const N = 120, pos = [], idx = [];
  for (let i = 0; i <= N; i++) {
    const x = (i / N - 0.5) * 300 * M;
    pos.push(x, 0, 0, x, ridge(x), -6 * M);
    if (i < N) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
  const h = mesh(geo, mat('#7a7356', { roughness: 1, side: THREE.DoubleSide }), g, [0, 0, -zm * M]);
  h.castShadow = false;
  // 비탈의 올리브 숲: 작은 점으로
  const dots = mat('#5f6a44', { roughness: 1 }), geoD = new THREE.SphereGeometry(0.55 * M, 6, 4);
  for (let i = 0; i < 260; i++) {
    const x = (rnd() - 0.5) * 240 * M, f = rnd() * 0.85;
    mesh(geoD, dots, g, [x, ridge(x) * f, -zm * M - 6 * M * f + 0.6 * M]).castShadow = false;
  }
}

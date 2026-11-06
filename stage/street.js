/* 거리 높이 무대 — 솔로몬 때(주전 950년 무렵) 예루살렘. 잠언 여정의 성문 광장.
   지도 위 미니어처 무대와 달리 사람 눈높이에서 보는 실제 크기의 세트다.
   축척: 사람 키 0.88 ≈ 1.7m 이므로 1m = 0.52단위. x는 동쪽(오른쪽), z는 남쪽(앞), y는 높이.
   성문은 북쪽(-z)에 있고, 보는 사람은 성 안 광장에서 성문을 바라본다.
   고증(대략): 철기 시대의 여섯 방 성문(므깃도·게셀·하솔과 같은 꼴), 회칠한 흙벽돌 위에 돌 기초를 둔 집, 평평한 흙 지붕과 난간(신 22:8) */
import { THREE, mat, mesh } from './kit.js';

export const M = 0.52; // 1m

/* ---------- 결이 있는 재질: 캔버스로 그린 돌·회벽·포석 ----------
   상자 그대로는 장난감처럼 보였다 — 돌 줄눈과 얼룩만 있어도 크기가 실감 난다 */
let seed = 11;
const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const texCache = new Map();
function canvasTex(key, size, draw) {
  if (texCache.has(key)) return texCache.get(key);
  const c = document.createElement('canvas'); c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  texCache.set(key, t);
  return t;
}
const shade = (hex, k) => { const c = new THREE.Color(hex); c.offsetHSL(0, (rnd() - 0.5) * 0.04, k); return '#' + c.getHexString(); };
// 다듬은 돌을 줄지어 쌓은 벽 (성벽·성문): 한 장이 가로 4m × 세로 4m
function ashlar(base) {
  return canvasTex('ashlar' + base, 512, (g, S) => {
    g.fillStyle = shade(base, -0.12); g.fillRect(0, 0, S, S);
    const rows = 8, rh = S / rows;
    for (let r = 0; r < rows; r++) {
      let x = -rnd() * 80;
      while (x < S) {
        const w = 70 + rnd() * 90;
        g.fillStyle = shade(base, (rnd() - 0.5) * 0.09);
        g.fillRect(x + 3, r * rh + 3, w - 6, rh - 6);
        // 돌 가장자리를 쪼아 낸 테두리(드래프트) — 이스라엘 왕국 시대 마름돌의 특징
        g.strokeStyle = 'rgba(255,255,255,.10)'; g.lineWidth = 3; g.strokeRect(x + 7, r * rh + 7, w - 14, rh - 14);
        for (let k = 0; k < 14; k++) { g.fillStyle = `rgba(0,0,0,${rnd() * 0.06})`; g.fillRect(x + rnd() * w, r * rh + rnd() * rh, 3 + rnd() * 8, 2 + rnd() * 6); }
        if (x + w > S) { g.fillStyle = shade(base, (rnd() - 0.5) * 0.09); g.fillRect(x + 3 - S, r * rh + 3, w - 6, rh - 6); }
        x += w;
      }
    }
  });
}
// 회칠한 벽 (집): 얼룩과 흙빛 번짐, 아래쪽은 빗물에 더 어둡게
function plaster(base) {
  return canvasTex('plaster' + base, 256, (g, S) => {
    g.fillStyle = base; g.fillRect(0, 0, S, S);
    for (let k = 0; k < 900; k++) {
      g.fillStyle = `rgba(${rnd() < 0.5 ? '90,70,40' : '255,250,235'},${rnd() * 0.07})`;
      const r = 2 + rnd() * 14; g.beginPath(); g.arc(rnd() * S, rnd() * S, r, 0, 7); g.fill();
    }
  });
}
// 거친 돌 기초 (집 아랫단)
function rubble(base) {
  return canvasTex('rubble' + base, 256, (g, S) => {
    g.fillStyle = shade(base, -0.18); g.fillRect(0, 0, S, S);
    for (let k = 0; k < 70; k++) {
      g.fillStyle = shade(base, (rnd() - 0.5) * 0.14);
      const x = rnd() * S, y = rnd() * S, w = 18 + rnd() * 30, h = 12 + rnd() * 18;
      g.beginPath(); g.ellipse(x, y, w / 2, h / 2, rnd() * 0.5, 0, 7); g.fill();
    }
  });
}
// 광장 바닥: 크고 작은 판돌을 깐 길 (판돌 사이로 흙)
function paving(base) {
  return canvasTex('paving' + base, 512, (g, S) => {
    g.fillStyle = '#9c8564'; g.fillRect(0, 0, S, S);
    for (let y = 0; y < S; y += 46) for (let x = -rnd() * 40; x < S; x += 50 + rnd() * 40) {
      g.fillStyle = shade(base, (rnd() - 0.5) * 0.12);
      const w = 44 + rnd() * 34, h = 38 + rnd() * 6;
      g.beginPath(); g.roundRect(x + 2, y + 2, w - 4, h - 4, 6); g.fill();
      g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect(x + 6, y + 6, w - 14, 4);
    }
  });
}
// 상자 UV를 실제 크기로: 면마다 위치에서 UV를 다시 매겨, 크기가 다른 벽도 돌 크기가 같게 보인다
function worldUV(geo, tile) {
  const p = geo.attributes.position, n = geo.attributes.normal, uv = geo.attributes.uv;
  for (let i = 0; i < p.count; i++) {
    const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i));
    const [u, v] = ax > 0.5 ? [p.getZ(i), p.getY(i)] : ay > 0.5 ? [p.getX(i), p.getZ(i)] : [p.getX(i), p.getY(i)];
    uv.setXY(i, u / tile, v / tile);
  }
  return geo;
}
const texMat = (tex, color = '#ffffff', o = {}) => mat(color, { map: tex, roughness: 0.95, ...o });

// 상자 하나: 바닥 가운데 (x, z), 높이 y에서 위로
function block(parent, m, x, z, w, d, h, y = 0, tile = 4 * M) {
  const o = mesh(worldUV(new THREE.BoxGeometry(w, h, d), tile), m, parent, [x, y + h / 2, z]);
  o.receiveShadow = true;
  return o;
}
// 나무 들보 끝 (지붕 아래로 삐죽 나온 둥근 나무)
function beams(parent, x0, x1, y, z, n, r = 0.07, len = 0.25) {
  const w = mat('#5a4330');
  for (let i = 0; i < n; i++) {
    const b = mesh(new THREE.CylinderGeometry(r, r, len, 8), w, parent, [x0 + (x1 - x0) * (i + 0.5) / n, y, z]);
    b.rotation.x = Math.PI / 2;
  }
}
// 성가퀴(톱니 모양 흉벽)
function merlons(parent, m, x0, x1, z, y, d) {
  const step = 1.5 * M, w = 0.85 * M;
  for (let x = x0 + w / 2; x <= x1 - w / 2 + 1e-6; x += step) block(parent, m, x, z, w, d, 0.9 * M, y);
}

/* ---------- 여섯 방 성문 ----------
   안쪽 얼굴이 z0. 폭 18m, 깊이 20m, 통로 4.2m. 통로 양옆으로 방이 셋씩(장로와 재판관이 앉던 곳) */
function gate(g, z0) {
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
  block(g, S, 0, zc, P, D, H - DH, DH);
  merlons(g, S, -P / 2, P / 2, z0 - 0.35 * M, H, 0.7 * M);
  const wood = mat('#5d4632', { roughness: 0.9 });
  [z0 - 0.15 * M, z0 - D + 0.15 * M].forEach(z => mesh(new THREE.BoxGeometry(P + 0.6 * M, 0.45 * M, 0.5 * M), wood, g, [0, DH + 0.2 * M, z]));
  // 통로 안: 양옆 방 셋씩 — 기둥벽(피어) 사이로 어두운 방이 열린다
  const dark = mat('#3a3024', { roughness: 1 });
  for (let i = 0; i < 4; i++) {
    const z = z0 - 0.9 * M - i * (D - 1.8 * M) / 3;
    [-1, 1].forEach(s => block(g, S, s * (P / 2 + 0.05 * M), z, 0.1 * M, 1.6 * M, DH, 0));
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
function cityWall(g, x0, x1, zFace) {
  const S = texMat(ashlar('#c3ad87'));
  const T = 4 * M, H = 7.5 * M;
  block(g, S, (x0 + x1) / 2, zFace - T / 2, x1 - x0, T, H);
  merlons(g, S, Math.min(x0, x1), Math.max(x0, x1), zFace - 0.3 * M, H, 0.6 * M);
}

/* ---------- 집 ----------
   네 방 집(이스라엘 집의 전형): 돌 기초 위 회칠한 흙벽돌, 평평한 흙 지붕에 난간, 들보 끝이 벽 밖으로 나온다.
   face: 문이 난 쪽 (+1 동쪽 / -1 서쪽 / 0 남쪽 앞) */
const WALLS = ['#d9c7a3', '#e1d0ad', '#cfb991', '#d6c19b', '#e4d6b8'];
function house(g, x, z, w, d, floors = 2, face = 1, o = {}) {
  const fh = 3 * M, H = floors * fh, base = 1.1 * M;
  const P = texMat(plaster(o.color || WALLS[Math.floor(rnd() * WALLS.length)]));
  const R = texMat(rubble('#a89474'), '#ffffff');
  block(g, R, x, z, w, d, base, 0, 2 * M);
  block(g, P, x, z, w, d, H - base, base, 3 * M);
  // 지붕: 흙을 다진 위층 + 난간
  const roof = mat('#a8916c', { roughness: 1 });
  block(g, roof, x, z, w + 0.12 * M, d + 0.12 * M, 0.25 * M, H);
  const par = 0.9 * M, t = 0.22 * M;
  block(g, P, x, z - d / 2 + t / 2, w, t, par, H + 0.25 * M, 3 * M);
  block(g, P, x, z + d / 2 - t / 2, w, t, par, H + 0.25 * M, 3 * M);
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
function stall(g, x, z, rot, cloth, goods = 'jars') {
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
  if (goods === 'grain') for (let i = 0; i < 4; i++) {
    const sack = mesh(new THREE.SphereGeometry(0.28 * M, 10, 8), mat(['#cdb07a', '#d8c08c', '#bfa06c'][i % 3]), s, [(-0.8 + i * 0.52) * M, 0.95 * M, 0.55 * M]);
    sack.scale.y = 0.75;
  }
  if (goods === 'cloth') ['#8a3a2e', '#2f5a6a', '#c9a24a', '#e8dcc0'].forEach((col, i) =>
    block(s, mat(col), (-0.75 + i * 0.5) * M, 0.55 * M, 0.42 * M, 0.5 * M, 0.12 * M + i * 0.02 * M, 0.75 * M));
  return s;
}
// 저울: 기둥에 매단 들보, 두 접시 (잠 11:1 속이는 저울과 바른 추)
export function scales(g, x, y, z) {
  const s = new THREE.Group(); s.position.set(x, y, z); g.add(s);
  const brass = mat('#b8893a', { metalness: 0.55, roughness: 0.4 });
  mesh(new THREE.CylinderGeometry(0.02 * M, 0.03 * M, 0.7 * M, 8), mat('#5a4330'), s, [0, 0.35 * M, 0]);
  const beam = new THREE.Group(); beam.position.y = 0.7 * M; s.add(beam);
  mesh(new THREE.BoxGeometry(0.7 * M, 0.025 * M, 0.025 * M), brass, beam);
  [-1, 1].forEach(k => {
    mesh(new THREE.CylinderGeometry(0.005 * M, 0.005 * M, 0.28 * M, 4), brass, beam, [k * 0.33 * M, -0.14 * M, 0]);
    mesh(new THREE.CylinderGeometry(0.12 * M, 0.08 * M, 0.04 * M, 14), brass, beam, [k * 0.33 * M, -0.29 * M, 0]);
  });
  return { group: s, beam };
}
// 올리브나무 (광장 귀퉁이 그늘)
function olive(g, x, z, k = 1) {
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
function jarsAt(g, list) {
  const clay = ['#b0754a', '#9c6440', '#c48a5c'];
  list.forEach(([x, z, k = 1], i) => {
    const h = 0.75 * M * k, r = 0.22 * M * k;
    const j = mesh(new THREE.LatheGeometry([[0.01, 0], [r * 0.6, 0.02], [r, h * 0.45], [r * 0.85, h * 0.8], [r * 0.4, h * 0.9], [r * 0.45, h]].map(([a, b]) => new THREE.Vector2(a, b)), 14), mat(clay[i % 3]), g, [x, 0, z]);
    j.receiveShadow = true;
  });
}

/* ---------- 멀리: 감람산과 하늘 ---------- */
function farHills(g) {
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
  const h = mesh(geo, mat('#7a7356', { roughness: 1, side: THREE.DoubleSide }), g, [0, 0, -100 * M]);
  h.castShadow = false;
  // 비탈의 올리브 숲: 작은 점으로
  const dots = mat('#5f6a44', { roughness: 1 }), geoD = new THREE.SphereGeometry(0.55 * M, 6, 4);
  for (let i = 0; i < 260; i++) {
    const x = (rnd() - 0.5) * 240 * M, f = rnd() * 0.85;
    mesh(geoD, dots, g, [x, ridge(x) * f, -100 * M - 6 * M * f + 0.6 * M]).castShadow = false;
  }
}
export function skyTexture(top = '#9cc2e0', mid = '#dce8ee', low = '#f3e8d2') {
  return canvasTex('sky' + top + low, 256, (g, S) => {
    const gr = g.createLinearGradient(0, 0, 0, S);
    gr.addColorStop(0, top); gr.addColorStop(0.55, mid); gr.addColorStop(1, low);
    g.fillStyle = gr; g.fillRect(0, 0, S, S);
  });
}

/* ---------- 성문 광장 세트 ----------
   돌려주는 것: group, 서 있을 자리 표(spots), 저울 */
export function gateSquare() {
  seed = 11;
  const g = new THREE.Group();
  const GZ = -7 * M * 2; // 성문 안쪽 얼굴 (광장 북쪽 끝) ≈ 14m 앞
  // 바닥: 광장 포석 + 성 밖 흙
  const floor = mesh(new THREE.PlaneGeometry(80 * M, 70 * M), texMat(paving('#c2ab84')), g, [0, 0, 0]);
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; floor.castShadow = false;
  floor.material.map.repeat.set(80 / 3.2, 70 / 3.2); // 한 장이 약 3.2m — 판돌 하나가 사람 걸음 반쯤
  const out = mesh(new THREE.PlaneGeometry(260 * M, 120 * M), mat('#b9a47c', { roughness: 1 }), g, [0, -0.01, -90 * M]);
  out.rotation.x = -Math.PI / 2; out.receiveShadow = true; out.castShadow = false;
  const G = gate(g, GZ);
  cityWall(g, -G.half, -60 * M, GZ - 3 * M);
  cityWall(g, G.half, 60 * M, GZ - 3 * M);
  // 광장 양옆의 집들 (서쪽 줄은 문이 동쪽으로, 동쪽 줄은 서쪽으로)
  house(g, -13 * M, -7.5 * M, 7 * M, 8 * M, 2, 1, { stair: true });
  house(g, -14 * M, 3 * M, 8 * M, 9 * M, 2, 1);
  house(g, -13.5 * M, 13 * M, 7 * M, 8 * M, 1, 1);
  house(g, 13 * M, -8 * M, 7 * M, 7 * M, 2, -1);
  house(g, 14 * M, 1.5 * M, 8 * M, 8 * M, 1, -1, { stair: true });
  house(g, 13.5 * M, 11 * M, 7 * M, 8 * M, 2, -1);
  // 성벽 가까이 뒤쪽 집 (지붕선이 겹겹이)
  house(g, -22 * M, -9 * M, 7 * M, 7 * M, 2, 0, { roof: false });
  house(g, 22 * M, -9 * M, 7 * M, 7 * M, 2, 0, { roof: false });
  // 장터: 동쪽 집 앞에 좌판 셋
  stall(g, 8.6 * M, -2.5 * M, -Math.PI / 2, '#a5452f', 'jars');
  stall(g, 8.6 * M, 2.5 * M, -Math.PI / 2, '#d8c49a', 'grain');
  stall(g, -8.4 * M, 6 * M, Math.PI / 2, '#3f6a72', 'cloth');
  const sc = scales(g, 8.0 * M, 0.75 * M, 2.4 * M);
  olive(g, -8.5 * M, -4 * M, 1.05);
  olive(g, 7 * M, 9 * M, 0.85);
  jarsAt(g, [[7.2 * M, -4.6 * M], [7.6 * M, -4.0 * M, 0.8], [-7.2 * M, 8.4 * M, 0.9], [-6.6 * M, 8.9 * M, 0.7]]);
  farHills(g);
  return {
    group: g, scales: sc, gateZ: GZ,
    // 사람 자리(무대 단위). 의자 높이 0.45m
    seat: 0.45 * M,
  };
}

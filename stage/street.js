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
// off: 상자의 자리 — 세상 좌표로 매겨야 맞붙은 두 상자(성문 탑과 통로 위)의 돌 줄이 이어진다 (따로 매기면 이음매에 줄이 어긋나 금처럼 보였다)
function worldUV(geo, tile, [ox, oy, oz] = [0, 0, 0]) {
  const p = geo.attributes.position, n = geo.attributes.normal, uv = geo.attributes.uv;
  for (let i = 0; i < p.count; i++) {
    const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), X = p.getX(i) + ox, Y = p.getY(i) + oy, Z = p.getZ(i) + oz;
    const [u, v] = ax > 0.5 ? [Z, Y] : ay > 0.5 ? [X, Z] : [X, Y];
    uv.setXY(i, u / tile, v / tile);
  }
  return geo;
}
const texMat = (tex, color = '#ffffff', o = {}) => mat(color, { map: tex, roughness: 0.95, ...o });
// 바닥 위에 덧까는 면(길·축대 윗면): 깊이를 조금 앞으로 당겨 아래 면과 다투지 않게
const overlay = m => { m.polygonOffset = true; m.polygonOffsetFactor = -2; m.polygonOffsetUnits = -2; return m; };

// 상자 하나: 바닥 가운데 (x, z), 높이 y에서 위로
function block(parent, m, x, z, w, d, h, y = 0, tile = 4 * M) {
  const o = mesh(worldUV(new THREE.BoxGeometry(w, h, d), tile, [x, y + h / 2, z]), m, parent, [x, y + h / 2, z]);
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
function cityWall(g, x0, x1, zFace) {
  const S = texMat(ashlar('#c3ad87'));
  const T = 4 * M, H = 7.5 * M;
  block(g, S, (x0 + x1) / 2, zFace - T / 2, Math.abs(x1 - x0), T, H); // 폭이 음수면 상자가 뒤집혀 안쪽 면이 그려졌다(서쪽 성벽)
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
function farHills(g, zm = 100) {
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
  const out = mesh(new THREE.PlaneGeometry(260 * M, 115 * M), mat('#b9a47c', { roughness: 1 }), g, [0, -0.01, -92.5 * M]); // 광장 바닥과 겹치지 않게 (성문 통로 끝에서 깜박였다)
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
  const sc = scales(g, 7.88 * M, 0.75 * M, 2.45 * M, Math.PI / 2); // 들보가 광장 쪽에서 옆으로 보이게 (남북으로)
  olive(g, -8.5 * M, -4 * M, 1.05);
  olive(g, 7 * M, 9 * M, 0.85);
  jarsAt(g, [[7.2 * M, -4.6 * M], [7.6 * M, -4.0 * M, 0.8], [-7.2 * M, 8.4 * M, 0.9], [-6.6 * M, 8.9 * M, 0.7]]);
  farHills(g);
  return {
    group: g, scales: sc, gateZ: GZ,
    update: (time, dt) => sc.update(time, dt),
    // 대본의 ['@set', '저울:상태'] — fair 수평, cheat 속이는 추(곡식 쪽이 들림), heavy 무거운 추
    cmd(what, instant) { const [k, v] = what.split(':'); if (k === 'scales') sc.set({ fair: 0, cheat: 0.22, heavy: -0.18 }[v] ?? 0, instant); },
    // 사람 자리(무대 단위). 의자 높이 0.45m
    seat: 0.45 * M,
  };
}

/* ---------- 성 밖 들판 ----------
   성벽이 선 언덕 아래 계단식 밭. 길 왼쪽은 부지런한 이웃의 밀밭(앞쪽은 이미 거두어 단을 세웠다),
   오른쪽은 게으른 사람의 밭 — 가시덤불과 거친 풀이 덮고 돌담은 무너졌다(잠 24:30–31). 길가 개미집에서 개미가 줄지어 낟알을 나른다(6:6–8).
   단위는 미터로 적고 M을 곱한다. 길은 z를 따라 성 쪽(-z)으로 뻗는다 */
// 흙 바닥
function soil(base) {
  return canvasTex('soil' + base, 256, (g, S) => {
    g.fillStyle = base; g.fillRect(0, 0, S, S);
    for (let k = 0; k < 1400; k++) {
      g.fillStyle = `rgba(${rnd() < 0.5 ? '80,60,36' : '235,220,190'},${rnd() * 0.12})`;
      g.fillRect(rnd() * S, rnd() * S, 1 + rnd() * 4, 1 + rnd() * 3);
    }
  });
}
// 같은 모양 여럿: 자리 표 [x, z, 크기, 돌림, 기울기]로 InstancedMesh 하나를 만든다 (밀 포기 수천 개를 하나로 그린다)
function many(parent, geo, m, list, y = 0, shadow = true) {
  const im = new THREE.InstancedMesh(geo, m, list.length), o = new THREE.Object3D();
  list.forEach(([x, z, k = 1, r = 0, tilt = 0, yy = y], i) => {
    o.position.set(x, yy, z); o.rotation.set(tilt * Math.cos(r * 3), r, tilt * Math.sin(r * 3)); o.scale.setScalar(k);
    o.updateMatrix(); im.setMatrixAt(i, o.matrix);
  });
  im.castShadow = shadow; im.receiveShadow = true;
  parent.add(im);
  return im;
}
const geoUp = (geo, h) => { geo.translate(0, h / 2, 0); return geo; }; // 밑동이 땅에 닿게

export function fieldSet() {
  seed = 23;
  const g = new THREE.Group(), m = v => v * M;
  // 바닥: 밭의 흙, 그 위에 밝은 길
  const ground = mesh(new THREE.PlaneGeometry(m(300), m(260)), texMat(soil('#a88a62')), g, [0, 0, m(-70)]);
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; ground.castShadow = false;
  ground.material.map.repeat.set(55, 48);
  const path = mesh(new THREE.PlaneGeometry(m(2.6), m(48)), overlay(texMat(soil('#cbb48a'), '#ffffff', { polygonOffset: true })), g, [0, 0.004, m(-2)]);
  path.rotation.x = -Math.PI / 2; path.receiveShadow = true; path.castShadow = false;
  path.material.map.repeat.set(1, 18);

  // 왼쪽: 부지런한 이웃의 밀밭 — 뒤쪽은 서 있는 밀, 앞쪽(z > -1)은 거두어 단을 세운 그루터기
  const stalkM = mat('#c9a457', { roughness: 0.9, flatShading: true }), headM = mat('#e0bd6a', { roughness: 0.8, flatShading: true });
  const stalks = [];
  for (let z = -24; z < -1; z += 0.42) for (let x = -23.5; x < -2.6; x += 0.42)
    stalks.push([m(x + (rnd() - 0.5) * 0.3), m(z + (rnd() - 0.5) * 0.3), 0.85 + rnd() * 0.3, rnd() * 6, 0.05 + rnd() * 0.08]);
  many(g, geoUp(new THREE.CylinderGeometry(m(0.05), m(0.09), m(0.9), 5), m(0.9)), stalkM, stalks);
  many(g, new THREE.ConeGeometry(m(0.07), m(0.22), 5).rotateX(Math.PI).translate(0, m(1.0), 0), headM, stalks, 0, false);
  const stubble = [];
  for (let z = -1; z < 7; z += 0.5) for (let x = -23.5; x < -2.6; x += 0.5) stubble.push([m(x + (rnd() - 0.5) * 0.3), m(z + (rnd() - 0.5) * 0.3), 0.8 + rnd() * 0.4]);
  many(g, geoUp(new THREE.CylinderGeometry(m(0.04), m(0.06), m(0.15), 4), m(0.15)), mat('#b8995a', { flatShading: true }), stubble, 0, false);
  // 밀단: 허리를 묶어 세운 단 (룻 2장처럼 거두는 밭)
  const sheaf = new THREE.LatheGeometry([[0, 0], [0.32, 0], [0.24, 0.35], [0.16, 0.55], [0.3, 0.95], [0.12, 1.1], [0, 1.12]].map(([a, b]) => new THREE.Vector2(m(a), m(b))), 9);
  const sheaves = [];
  for (let i = 0; i < 22; i++) sheaves.push([m(-4 - rnd() * 18), m(-0.2 + rnd() * 6.5), 0.6 + rnd() * 0.15, rnd() * 6, 0.06]); // 허리 높이보다 낮게 — 사람만 한 단은 항아리처럼 보였다
  many(g, sheaf, mat('#d2ae62', { roughness: 0.95, flatShading: true }), sheaves);
  // 가지런한 돌담 (길 왼쪽)
  const R = texMat(rubble('#b5a07c'));
  block(g, R, m(-2.1), m(-11.1), m(0.6), m(25.8), m(0.85), 0, m(2));
  block(g, R, m(-2.1), m(4.85), m(0.6), m(4.1), m(0.85), 0, m(2)); // 밭으로 드는 틈 (z 1.8~2.8) — 두 담이 겹치면 면이 깜박였다

  // 오른쪽: 게으른 사람의 밭 — 가시덤불, 거친 풀, 무너진 돌담
  const thornGeo = new THREE.IcosahedronGeometry(m(0.55), 0), tp = thornGeo.attributes.position;
  for (let i = 0; i < tp.count; i++) tp.setXYZ(i, tp.getX(i) * (0.7 + rnd() * 0.6), tp.getY(i) * (0.6 + rnd() * 0.5), tp.getZ(i) * (0.7 + rnd() * 0.6));
  thornGeo.computeVertexNormals(); thornGeo.translate(0, m(0.3), 0);
  const thorns = [], weeds = [];
  // 밭 주인이 누운 올리브나무 그늘(7.2, -3.4)과 길에서 그쪽으로 보이는 틈은 비워 둔다 — 덤불이 주인을 가렸다
  const clear = (x, z) => Math.hypot(x - 6.6, z + 2.6) < 2.6 || (x < 6.5 && Math.abs(z + 1.4 + (x - 2) * 0.25) < 0.9);
  for (let i = 0; thorns.length < 380 && i < 4000; i++) { const x = 3.2 + rnd() * 20.5, z = -24 + rnd() * 31; if (!clear(x, z)) thorns.push([m(x), m(z), 0.45 + rnd() * 0.6, rnd() * 6]); }
  for (let i = 0; weeds.length < 1500 && i < 6000; i++) { const x = 2.6 + rnd() * 21.5, z = -24 + rnd() * 31; if (!clear(x, z) || rnd() < 0.25) weeds.push([m(x), m(z), 0.5 + rnd() * 0.7, rnd() * 6, 0.25 + rnd() * 0.3]); }
  many(g, thornGeo, mat('#5a5236', { roughness: 1, flatShading: true }), thorns);
  many(g, geoUp(new THREE.ConeGeometry(m(0.12), m(0.75), 4), m(0.75)), mat('#a59a62', { roughness: 1, flatShading: true }), weeds);
  // 무너진 돌담: 군데군데 끊기고, 돌이 밭과 길로 굴러 나와 있다
  const stones = [], fallen = [];
  for (let z = -23.5; z < 6.5; z += 0.55) {
    const gap = Math.sin(z * 0.7) + Math.sin(z * 1.9) > 0.9; // 무너진 자리
    for (let r = 0; r < (gap ? 0 : 1 + (rnd() < 0.6)); r++) stones.push([m(2.1 + (rnd() - 0.5) * 0.12), m(z), 0.9 + rnd() * 0.3, rnd() * 0.4, 0, m(0.22 + r * 0.42)]);
    if (gap) for (let k = 0; k < 2; k++) fallen.push([m(2.1 + (rnd() - 0.4) * 2.4), m(z + (rnd() - 0.5) * 0.8), 0.7 + rnd() * 0.5, rnd() * 6, 0.4, m(0.15)]);
  }
  const stoneGeo = new THREE.DodecahedronGeometry(m(0.27), 0); stoneGeo.scale(1.25, 0.8, 1);
  const stoneM = mat('#b19f80', { roughness: 1, flatShading: true });
  many(g, stoneGeo, stoneM, stones); many(g, stoneGeo, stoneM, fallen);
  // 게으른 사람이 낮잠 자는 올리브나무 (그 밭 안)
  olive(g, m(7.2), m(-3.4), 1.0);
  olive(g, m(-9), m(9.5), 0.9);
  olive(g, m(14), m(8), 1.1);

  // 개미집과 개미 행렬: 길가 둔덕에서 나와 길을 건너, 밀단 쪽 흘린 낟알을 물고 돌아온다
  // 개미집: 파낸 흙알갱이가 쌓인 낮은 둔덕 (매끈한 반구는 빵처럼 보였다)
  const nestGeo = new THREE.SphereGeometry(m(0.24), 18, 8, 0, Math.PI * 2, 0, Math.PI / 2), np = nestGeo.attributes.position;
  for (let i = 0; i < np.count; i++) { const k = 0.85 + rnd() * 0.3; np.setXYZ(i, np.getX(i) * k, np.getY(i) * (0.7 + rnd() * 0.6), np.getZ(i) * k); }
  nestGeo.computeVertexNormals();
  const nest = mesh(nestGeo, texMat(soil('#9c7e56')), g, [m(-1.15), 0, m(4.6)]);
  nest.scale.y = 0.4;
  const crumbs = [];
  for (let i = 0; i < 160; i++) { const a = rnd() * 6.3, r = m(0.1 + rnd() * 0.32); crumbs.push([m(-1.15) + Math.cos(a) * r, m(4.6) + Math.sin(a) * r, 0.6 + rnd() * 0.8, rnd() * 6, 0, m(0.004)]); }
  many(g, new THREE.DodecahedronGeometry(m(0.012), 0), mat('#8a6c48', { flatShading: true }), crumbs, 0, false);
  mesh(new THREE.CircleGeometry(m(0.04), 10).rotateX(-Math.PI / 2), mat('#2a2018'), g, [m(-1.15), m(0.098), m(4.6)]);
  const spill = [];
  for (let i = 0; i < 70; i++) spill.push([m(-1.55 - rnd() * 0.6), m(3.0 + rnd() * 0.9), 1, rnd() * 6, 0, m(0.01)]); // 길가에 흘린 낟알
  many(g, new THREE.SphereGeometry(m(0.012), 5, 3).scale(1.6, 0.8, 1), mat('#e6cf8a'), spill, 0, false);
  // 개미 길: 집 → 담 밑 → 낟알 (구부러진 길)
  const trail = new THREE.CatmullRomCurve3([[-1.15, 4.6], [-1.0, 4.1], [-1.25, 3.6], [-1.6, 3.3], [-1.85, 3.25]].map(([x, z]) => new THREE.Vector3(m(x), m(0.012), m(z))));
  const N = 90, antGeo = new THREE.SphereGeometry(m(0.009), 6, 4).scale(1.9, 0.9, 1);
  const ants = new THREE.InstancedMesh(antGeo, mat('#1e1612', { roughness: 0.6 }), N);
  const seeds = new THREE.InstancedMesh(new THREE.SphereGeometry(m(0.011), 5, 3), mat('#ecd79a'), N);
  ants.castShadow = seeds.castShadow = false;
  g.add(ants, seeds);
  const antPh = Array.from({ length: N }, () => [rnd(), rnd() < 0.5 ? 1 : -1, 0.035 + rnd() * 0.02, (rnd() - 0.5) * m(0.035)]);
  const o3 = new THREE.Object3D(), pt = new THREE.Vector3(), tg = new THREE.Vector3(), side = new THREE.Vector3();
  function antsAt(time) {
    antPh.forEach(([u0, dir, sp, off], i) => {
      let u = (u0 + dir * sp * time) % 1; if (u < 0) u += 1;
      trail.getPointAt(u, pt); trail.getTangentAt(u, tg);
      side.set(-tg.z, 0, tg.x).multiplyScalar(off + Math.sin(time * 9 + i) * m(0.004)); // 줄에서 조금씩 비껴 걷는다
      o3.position.copy(pt).add(side); o3.rotation.set(0, Math.atan2(tg.x * dir, tg.z * dir) - Math.PI / 2, 0); o3.scale.setScalar(1);
      o3.updateMatrix(); ants.setMatrixAt(i, o3.matrix);
      // 집으로 가는 개미(dir -1)만 낟알을 문다
      o3.position.addScaledVector(tg, dir * m(0.016)); o3.position.y += m(0.006); o3.scale.setScalar(dir < 0 ? 1 : 0.0001);
      o3.updateMatrix(); seeds.setMatrixAt(i, o3.matrix);
    });
    ants.instanceMatrix.needsUpdate = seeds.instanceMatrix.needsUpdate = true;
  }
  antsAt(0);

  // 성 쪽: 계단식 밭(돌로 쌓은 축대)이 언덕을 오르고, 꼭대기에 성벽과 왕궁·성전
  const terraces = [[-27, 1.0], [-37, 2.4], [-47, 4.0], [-57, 5.8], [-67, 7.8], [-77, 10], [-87, 12.4]];
  terraces.forEach(([z0, h], i) => {
    const d = 10, top = overlay(mat(['#9d8a5c', '#95855a', '#a08c62', '#988660'][i % 4], { roughness: 1, polygonOffset: true }));
    block(g, R, 0, m(z0 - d / 2), m(300), m(d), m(h), 0, m(2));
    const t = mesh(new THREE.PlaneGeometry(m(300), m(d)), top, g, [0, m(h) + 0.02, m(z0 - d / 2)]); // 축대 윗면과 조금 띄운다 (멀리서 깜박였다)
    t.rotation.x = -Math.PI / 2; t.receiveShadow = true; t.castShadow = false;
    // 축대 위의 올리브·포도나무 (드문드문)
    const dots = [];
    for (let k = 0; k < 34; k++) dots.push([m((rnd() - 0.5) * 260), m(z0 - 1.5 - rnd() * (d - 3)), 0.5 + rnd() * 0.5, rnd() * 6, 0, m(h)]);
    many(g, new THREE.IcosahedronGeometry(m(1.2), 0).translate(0, m(1.3), 0), mat(['#7d8a5a', '#6f7c50'][i % 2], { flatShading: true, roughness: 1 }), dots);
  });
  // 성벽 (언덕 꼭대기, 망대가 일정하게) — 길에서 100m 남짓, 올려다보이게
  const S = texMat(ashlar('#c8b28a')), WZ = m(-100), WY = m(14.8);
  block(g, S, 0, WZ, m(240), m(4), m(10), WY);
  block(g, R, 0, m(-113.5), m(300), m(33), m(14.8), 0, m(2)); // 성이 선 언덕: 마지막 축대 뒤(-97)부터 성 안까지 — 축대와 앞면이 겹쳐 깜박였고, 성 안 집이 떠 있었다
  merlons(g, S, m(-120), m(120), WZ + m(1.7), WY + m(10), m(0.6));
  for (let x = -110; x <= 110; x += 22) { block(g, S, m(x), WZ + m(0.8), m(6), m(5.6), m(12.5), WY); merlons(g, S, m(x - 3), m(x + 3), WZ + m(3.3), WY + m(12.5), m(0.6)); }
  // 성 안: 높은 곳에 왕궁과 성전 (흰 마름돌, 금빛 테)
  const temple = mat('#efe6d0', { roughness: 0.8 }), gold = mat('#d6b45a', { metalness: 0.3, roughness: 0.5 });
  block(g, temple, m(-14), m(-118), m(34), m(14), m(16), WY + m(6), m(4)); // 성전 (동서로 길게 — 남쪽에서 옆모습)
  mesh(new THREE.BoxGeometry(m(34.4), m(0.8), m(14.4)), gold, g, [m(-14), WY + m(22), m(-118)]);
  block(g, texMat(plaster('#e1d0ad')), m(26), m(-112), m(30), m(18), m(12), WY + m(3), m(3)); // 왕궁
  for (let i = 0; i < 12; i++) block(g, texMat(plaster(WALLS[i % WALLS.length])), m(-90 + i * 15 + (rnd() - 0.5) * 4), m(-106 - rnd() * 6), m(9), m(8), m(6 + rnd() * 4), WY, m(3)); // 성 안 집들
  farHills(g, 200);
  return { group: g, update: (time) => antsAt(time) };
}

/* ---------- stage.js가 쓰는 표 ----------
   STREETS: 대본의 street 이름 → 세트 만들기. 세트는 sun(해가 오는 쪽, 아침 동쪽)도 알려 준다
   SKIES: 분위기(env)마다 하늘빛 [위, 가운데, 아래]과 안개 색 */
export const STREETS = { gate: gateSquare, field: fieldSet };
export const SKIES = {
  day:      { sky: ['#8fb8da', '#d6e4ec', '#efe4cc'], fog: '#c8d2d6', sun: [30, 40, 18] },
  dawn:     { sky: ['#7d8fb8', '#e8c8b8', '#f6d8b0'], fog: '#d8c8bc', sun: [45, 14, -10] },
  dusk:     { sky: ['#5a6890', '#d89a78', '#f0b880'], fog: '#c8a088', sun: [-45, 10, 8] },
  calm:     { sky: ['#8aa8c8', '#e6d4bc', '#f2dcb8'], fog: '#d0c4b4', sun: [-30, 22, 10] },
  overcast: { sky: ['#9aa4ac', '#c4c8c8', '#d4d0c4'], fog: '#b8bcbc', sun: [10, 40, 10] },
  night:    { sky: ['#0e1630', '#26345a', '#3a4462'], fog: '#2a3450', sun: [-20, 30, 20] },
  dark:     { sky: ['#2a2830', '#4a4650', '#5a5458'], fog: '#3a383e', sun: [10, 30, 10] },
  storm:    { sky: ['#4a5560', '#7a8690', '#8a9298'], fog: '#6a747c', sun: [10, 40, 10] },
  glory:    { sky: ['#a8cce8', '#eef4f4', '#fff4dc'], fog: '#dce4e4', sun: [20, 45, 15] },
};

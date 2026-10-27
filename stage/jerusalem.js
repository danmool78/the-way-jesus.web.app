/* 예루살렘 도성 (주후 30년 무렵) 3D 모형 — 지도에 까는 그림을 만들기 위한 것.
   좌표: 지도 단위(1/1000도 위도 ≈ 111m). x는 동쪽, z는 남쪽, y는 높이. 원점은 EXTENT의 북서 모서리.
   높이는 잘 보이게 3.2배 키운다. _src/tools/jerusalem.html이 비스듬히 내려다본 모습을 그려 assets/jerusalem.webp로 저장한다.
   (사실 고증은 대략: 성벽은 첫째·둘째 성벽, 성전산은 헤롯의 확장 단, 골고다는 둘째 성벽 밖) */
import { THREE, mat, mesh, sphere } from './kit.js';

// app.js의 CITY3D와 같게
export const EXTENT = { lat0: 31.7685, lat1: 31.7840, lng0: 35.2235, lng1: 35.2480 };
const COS = Math.cos(32.3 * Math.PI / 180), K = 1000;
const M = 1 / 111, V = 3.2 / 111; // 수평 1m, 수직 1m (3.2배 과장)
const L = (lat, lng) => [(lng - EXTENT.lng0) * COS * K, (EXTENT.lat1 - lat) * K];

// 결정적인 난수 (그릴 때마다 같은 집 배치)
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

const STONE = '#e3d6b8', STONE2 = '#d8c8a4', WALL = '#cdb88e', ROOF = '#c3a578', GOLD = '#d9b24a';

function boxAt(parent, m, [x, z], w, d, h, y = 0, rot = 0) {
  const o = mesh(new THREE.BoxGeometry(w, h, d), m, parent, [x, y + h / 2, z]);
  o.rotation.y = rot; o.receiveShadow = true;
  return o;
}
// 두 점 사이 벽 (길이 방향으로 돌린 상자)
function wallSeg(parent, m, a, b, thick, h, y = 0) {
  const dx = b[0] - a[0], dz = b[1] - a[1], len = Math.hypot(dx, dz);
  return boxAt(parent, m, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], len + thick, thick, h, y, -Math.atan2(dz, dx));
}
// 성벽: 꼭짓점마다, 그리고 70m마다 망대
function walls(parent, pts, { thick = 8, h = 13, tower = 15, th = 20, every = 70 } = {}) {
  const m = mat(WALL, { roughness: 0.9 }), P = pts.map(p => L(...p));
  for (let i = 0; i < P.length - 1; i++) {
    const a = P[i], b = P[i + 1];
    wallSeg(parent, m, a, b, thick * M, h * V);
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) / M, n = Math.floor(len / every);
    for (let k = 0; k <= n; k++) {
      const f = n ? k / n : 0, p = [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
      boxAt(parent, m, p, tower * M, tower * M, th * V, 0, -Math.atan2(b[1] - a[1], b[0] - a[0]));
    }
  }
}
function inside([x, z], poly) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i], [xj, zj] = poly[j];
    if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) c = !c;
  }
  return c;
}
// 집들: 다각형 안을 격자로 채우되 몇 줄마다 길을 비우고, 크기·높이·색을 조금씩 다르게
function houses(parent, polyLL, { step = 21, colors, hmin = 5, hmax = 11, skip = 0.18, avoid = [] }) {
  const poly = polyLL.map(p => L(...p)), av = avoid.map(a => a.map(p => L(...p)));
  const xs = poly.map(p => p[0]), zs = poly.map(p => p[1]);
  const spots = [];
  const s = step * M;
  for (let z = Math.min(...zs), r = 0; z < Math.max(...zs); z += s, r++) {
    if (r % 5 === 2) continue; // 동서로 난 길
    for (let x = Math.min(...xs), c = 0; x < Math.max(...xs); x += s, c++) {
      if (c % 6 === 3) continue; // 남북으로 난 길
      const p = [x + (rnd() - 0.5) * s * 0.3, z + (rnd() - 0.5) * s * 0.3];
      if (!inside(p, poly) || av.some(a => inside(p, a)) || rnd() < skip) continue;
      spots.push(p);
    }
  }
  const geo = new THREE.BoxGeometry(1, 1, 1); geo.translate(0, 0.5, 0);
  const im = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ roughness: 0.9 }), spots.length);
  const q = new THREE.Object3D(), col = new THREE.Color();
  spots.forEach((p, i) => {
    const w = (10 + rnd() * 8) * M, d = (10 + rnd() * 8) * M, h = (hmin + rnd() * (hmax - hmin)) * V;
    q.position.set(p[0], 0, p[1]); q.rotation.y = (rnd() - 0.5) * 0.25; q.scale.set(w, h, d); q.updateMatrix();
    im.setMatrixAt(i, q.matrix);
    im.setColorAt(i, col.set(colors[Math.floor(rnd() * colors.length)]).multiplyScalar(0.94 + rnd() * 0.1));
  });
  im.castShadow = im.receiveShadow = true;
  parent.add(im);
  return spots.length;
}
// 나무: 둥근 수관 + 짧은 줄기 (보이게 2배 크기)
function trees(parent, spots, { r = 9, color = '#7f8a58' } = {}) {
  const crown = new THREE.InstancedMesh(sphere(1, 10, 8), new THREE.MeshStandardMaterial({ roughness: 1 }), spots.length);
  const q = new THREE.Object3D(), col = new THREE.Color();
  spots.forEach((p, i) => {
    const s = r * M * (0.75 + rnd() * 0.5);
    q.position.set(p[0], s * 0.9, p[1]); q.scale.set(s, s * 0.8, s); q.updateMatrix();
    crown.setMatrixAt(i, q.matrix);
    crown.setColorAt(i, col.set(color).multiplyScalar(0.85 + rnd() * 0.25));
  });
  crown.castShadow = crown.receiveShadow = true;
  parent.add(crown);
}
function scatter(polyLL, n, avoid = []) {
  const poly = polyLL.map(p => L(...p)), av = avoid.map(a => a.map(p => L(...p)));
  const xs = poly.map(p => p[0]), zs = poly.map(p => p[1]), out = [];
  for (let t = 0; t < n * 30 && out.length < n; t++) {
    const p = [Math.min(...xs) + rnd() * (Math.max(...xs) - Math.min(...xs)), Math.min(...zs) + rnd() * (Math.max(...zs) - Math.min(...zs))];
    if (inside(p, poly) && !av.some(a => inside(p, a))) out.push(p);
  }
  return out;
}
function pool(parent, [lat, lng], w, d) {
  const p = L(lat, lng);
  boxAt(parent, mat(STONE2), p, (w + 8) * M, (d + 8) * M, 2 * V);
  boxAt(parent, mat('#6f9aa6', { roughness: 0.3, metalness: 0.1 }), p, w * M, d * M, 2.3 * V);
}

// 성전산 돌 단의 네 모서리와 높이 — 3D 지형(terrain.js)이 무대 인물을 단 위에 세울 때도 쓴다
const MOUNT = [[31.7802, 35.2341], [31.7798, 35.2368], [31.7757, 35.2367], [31.7760, 35.2342]];
export const DECKS = [{ ll: MOUNT, top: 10 * V }];

export function buildJerusalem() {
  seed = 7;
  const g = new THREE.Group();

  // 성전산: 헤롯이 넓힌 돌 단 (네 모서리)
  const mount = MOUNT;
  const shape = new THREE.Shape(mount.map(p => new THREE.Vector2(...L(...p))));
  const plat = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 10 * V, bevelEnabled: false }), mat('#e8dfca', { roughness: 0.85 }));
  plat.rotation.x = Math.PI / 2; plat.position.y = 10 * V; plat.castShadow = plat.receiveShadow = true;
  g.add(plat);
  const top = 10 * V, MP = mount.map(p => L(...p)), por = mat('#d9cba8', { roughness: 0.85 }), roof = mat(ROOF, { roughness: 0.9 });
  // 주랑: 서·북·동쪽은 두 줄 기둥 회랑, 남쪽은 높은 왕의 주랑
  [[0, 1], [1, 2], [3, 0]].forEach(([i, j]) => { wallSeg(g, por, MP[i], MP[j], 14 * M, 11 * V, top); wallSeg(g, roof, MP[i], MP[j], 15 * M, 1.5 * V, top + 11 * V); });
  wallSeg(g, por, MP[2], MP[3], 30 * M, 22 * V, top); wallSeg(g, roof, MP[2], MP[3], 31 * M, 2 * V, top + 22 * V);
  // 안뜰 담장 (여인의 뜰·이스라엘의 뜰)
  const court = L(31.7783, 35.2353), cw = 165 * M, cd = 110 * M, cm = mat(STONE, { roughness: 0.85 });
  boxAt(g, mat('#efe7d6'), court, cw, cd, 3 * V, top);
  [[0, -cd / 2, cw, 7 * M], [0, cd / 2, cw, 7 * M], [-cw / 2, 0, 7 * M, cd], [cw / 2, 0, 7 * M, cd]].forEach(([dx, dz, w, d]) =>
    boxAt(g, cm, [court[0] + dx, court[1] + dz], w, d, 14 * V, top));
  // 성소: 흰 돌 본채 + 동쪽을 향한 넓고 높은 현관 + 금빛 처마, 그 앞 번제단
  const san = L(31.7783, 35.2349), white = mat('#f6f1e4', { roughness: 0.6 }), gold = mat(GOLD, { roughness: 0.45, emissive: '#5a4310', emissiveIntensity: 0.25 }); // 금속 재질은 반사할 주변이 없어 검게 보여 쓰지 않는다
  boxAt(g, white, san, 55 * M, 26 * M, 38 * V, top);
  boxAt(g, white, [san[0] + 31 * M, san[1]], 10 * M, 50 * M, 46 * V, top);
  boxAt(g, gold, san, 56 * M, 27 * M, 1.6 * V, top + 38 * V);
  boxAt(g, gold, [san[0] + 31 * M, san[1]], 11 * M, 51 * M, 1.8 * V, top + 46 * V);
  boxAt(g, mat('#5a3a22'), [san[0] + 36.2 * M, san[1]], 0.6 * M, 10 * M, 22 * V, top + 3 * V); // 현관 문
  boxAt(g, mat('#cbbd9e'), [san[0] + 52 * M, san[1]], 15 * M, 15 * M, 6 * V, top);           // 번제단
  // 이방인의 뜰 남쪽, 왕의 주랑 앞: 환전상의 상과 비둘기 장 (기도하는 집 장면의 자리).
  // 높은 주랑 바로 뒤는 비스듬히 내려다보면 가려지므로 주랑에서 조금 떨어뜨리고, 알아보게 실제보다 크게
  const tbl = mat('#8a6440', { roughness: 0.9 }), cg = mat('#b49a6a', { roughness: 0.9 });
  for (let i = 0; i < 14; i++) {
    const p = [MP[3][0] + (MP[2][0] - MP[3][0]) * (0.15 + i * 0.05), MP[3][1] + (MP[2][1] - MP[3][1]) * (0.15 + i * 0.05) - (60 + (i % 2) * 12) * M];
    boxAt(g, i % 3 ? tbl : cg, p, (i % 3 ? 9 : 6) * M, (i % 3 ? 4 : 6) * M, (i % 3 ? 1.5 : 2.5) * V, top);
  }
  // 안토니아 요새: 성전산 북서 모서리, 네 망대 (남동 망대가 가장 높다)
  const ant = L(31.7807, 35.2333), am = mat('#cbb68c', { roughness: 0.9 });
  boxAt(g, am, ant, 100 * M, 60 * M, 20 * V);
  [[-1, -1, 30], [1, -1, 30], [-1, 1, 30], [1, 1, 42]].forEach(([sx, sz, h]) => boxAt(g, am, [ant[0] + sx * 45 * M, ant[1] + sz * 26 * M], 16 * M, 16 * M, h * V));
  // 헤롯 궁전: 서쪽 성벽에 붙은 긴 궁전과 정원, 북쪽 끝의 세 망대(힙피쿠스·파사엘·마리암네)
  const pal = mat('#e6d9bb', { roughness: 0.8 });
  boxAt(g, pal, L(31.7757, 35.2289), 55 * M, 70 * M, 14 * V);
  boxAt(g, pal, L(31.7735, 35.2289), 55 * M, 60 * M, 14 * V);
  boxAt(g, mat('#8a9a5a', { roughness: 1 }), L(31.7746, 35.2290), 40 * M, 40 * M, 1 * V);
  trees(g, [L(31.7748, 35.2286), L(31.7745, 35.2293), L(31.7743, 35.2287), L(31.7749, 35.2292)], { r: 7, color: '#6f8a4a' });
  [[31.7769, 35.2281, 36], [31.7768, 35.2288, 46], [31.7767, 35.2294, 28]].forEach(([a, b, h]) => boxAt(g, am, L(a, b), 18 * M, 18 * M, h * V));
  // 하스몬 궁전과 성전산으로 건너는 다리(크시스투스)
  boxAt(g, pal, L(31.7770, 35.2326), 45 * M, 35 * M, 16 * V);
  wallSeg(g, mat(STONE2), L(31.7772, 35.2334), L(31.7771, 35.2342), 14 * M, 10 * V);

  // 성벽: 바깥 성벽(둘째 성벽 — 골고다는 그 밖), 첫째 성벽(윗도시 북쪽)
  walls(g, [[31.7769, 35.2281], [31.7769, 35.2292], [31.7779, 35.2300], [31.7790, 35.2312], [31.7800, 35.2325], [31.7806, 35.2337],
    [31.7802, 35.2341]]);
  walls(g, [[31.7757, 35.2367], [31.7745, 35.2366], [31.7725, 35.2362], [31.7705, 35.2358], [31.7698, 35.2348], [31.7699, 35.2335],
    [31.7705, 35.2318], [31.7712, 35.2300], [31.7718, 35.2285], [31.7735, 35.2277], [31.7752, 35.2277], [31.7769, 35.2281]]);
  walls(g, [[31.7769, 35.2292], [31.7771, 35.2310], [31.7772, 35.2330]], { th: 17 });

  // 집: 윗도시(부유한 서쪽 언덕, 밝은 돌·큰 집), 아랫도시(다윗성·오벨, 흙빛 작은 집), 둘째 구역(북쪽 시장)
  const palace = [[31.7772, 35.2276], [31.7772, 35.2300], [31.7725, 35.2300], [31.7725, 35.2276]];
  const hasmon = [[31.7775, 35.2318], [31.7775, 35.2345], [31.7765, 35.2345], [31.7765, 35.2318]];
  houses(g, [[31.7766, 35.2296], [31.7768, 35.2333], [31.7745, 35.2336], [31.7712, 35.2332], [31.7707, 35.2318], [31.7713, 35.2299], [31.7720, 35.2287]],
    { step: 22, colors: ['#ece2ca', '#e4d6b6', '#dccba6', '#efe5d0'], hmin: 6, hmax: 12, avoid: [palace, hasmon] });
  houses(g, [[31.7756, 35.2340], [31.7756, 35.2364], [31.7740, 35.2363], [31.7708, 35.2356], [31.7702, 35.2345], [31.7711, 35.2335], [31.7745, 35.2337]],
    { step: 17, colors: ['#d8c39c', '#cdb48a', '#c9ad80', '#dcc8a2'], hmin: 4, hmax: 8, skip: 0.12, avoid: [hasmon, [[31.7711, 35.2345], [31.7711, 35.2357], [31.7700, 35.2357], [31.7700, 35.2345]]] });
  houses(g, [[31.7772, 35.2296], [31.7780, 35.2303], [31.7797, 35.2323], [31.7801, 35.2333], [31.7776, 35.2337], [31.7773, 35.2312]],
    { step: 19, colors: ['#dccaa4', '#d2bd94', '#e2d2b0'], hmin: 5, hmax: 9, avoid: [hasmon] });

  // 못: 실로암(남쪽 끝), 베데스다(성전 북쪽의 두 못)
  // 실로암: 사방으로 내려가는 돌계단(세 단)으로 둘러싼 못
  const sil = L(31.7706, 35.2351), stepM = mat(STONE2, { roughness: 0.9 });
  // (계단은 통짜 상자를 겹쳐 쌓아 만든다: 바깥 상자일수록 낮게, 물은 가장 위에 — 위에서 보면 둘레 계단 띠로 보인다)
  [70, 62, 54].forEach((w, i) => boxAt(g, i % 2 ? stepM : mat(STONE, { roughness: 0.9 }), sil, w * M, (w - 5) * M, (0.6 + i * 0.4) * V));
  boxAt(g, mat('#6f9aa6', { roughness: 0.3, metalness: 0.1 }), sil, 46 * M, 41 * M, 1.7 * V);
  // 베데스다: 두 못과 다섯 줄 행각(네 둘레 + 두 못 사이) — 지붕 덮인 기둥 회랑
  const bw = 45, bd = 50, b1 = L(31.7816, 35.2351), b2 = L(31.7816, 35.2359);
  pool(g, [31.7816, 35.2351], bw, bd); pool(g, [31.7816, 35.2359], bw, bd);
  const bx0 = b1[0] - (bw / 2 + 6) * M, bx1 = b2[0] + (bw / 2 + 6) * M, bz0 = b1[1] - (bd / 2 + 6) * M, bz1 = b1[1] + (bd / 2 + 6) * M, mid = (b1[0] + b2[0]) / 2;
  const colM = mat('#efe6d2', { roughness: 0.8 });
  [[[bx0, bz0], [bx1, bz0]], [[bx0, bz1], [bx1, bz1]], [[bx0, bz0], [bx0, bz1]], [[bx1, bz0], [bx1, bz1]], [[mid, bz0], [mid, bz1]]].forEach(([a, b]) => {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(2, Math.round(len / (7 * M)));
    for (let i = 0; i <= n; i++) { const f = i / n; boxAt(g, colM, [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f], 1.6 * M, 1.6 * M, 7 * V); }
    wallSeg(g, roof, a, b, 6 * M, 1.2 * V, 7 * V);
  });

  // 골고다: 둘째 성벽 밖의 바위 언덕과 무덤 동산 (십자가는 그리지 않는다)
  const gol = L(31.7786, 35.2296);
  mesh(sphere(1, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), mat('#b8a888', { roughness: 1 }), g, [gol[0], 0, gol[1]], [32 * M, 12 * V, 26 * M]).receiveShadow = true;
  trees(g, scatter([[31.7796, 35.2283], [31.7796, 35.2300], [31.7790, 35.2300], [31.7790, 35.2283]], 9), { r: 7, color: '#6f8a4a' });

  // 기드론 골짜기 건너 감람산: 겟세마네 동산(낮은 돌담 안 올리브 숲)과 산비탈의 올리브 나무
  const geth = [[31.7800, 35.2392], [31.7800, 35.2404], [31.7788, 35.2404], [31.7788, 35.2392]];
  walls(g, [...geth, geth[0]], { thick: 3, h: 2.5, tower: 3, th: 2.5, every: 1000 });
  trees(g, scatter(geth, 26), { r: 8 });
  trees(g, scatter([[31.7835, 35.2390], [31.7835, 35.2475], [31.7690, 35.2475], [31.7690, 35.2395]], 150, [geth]), { r: 8 });
  // 성 밖 서쪽·북쪽 동산 몇 그루
  trees(g, scatter([[31.7835, 35.2240], [31.7835, 35.2330], [31.7810, 35.2330], [31.7780, 35.2270], [31.7700, 35.2265], [31.7690, 35.2240]], 40), { r: 7 });

  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return g;
}

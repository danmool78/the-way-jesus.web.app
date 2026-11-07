/* ---------- 성 밖 들판 ----------
   성벽이 선 언덕 아래 계단식 밭. 길 왼쪽은 부지런한 이웃의 밀밭(앞쪽은 이미 거두어 단을 세웠다),
   오른쪽은 게으른 사람의 밭 — 가시덤불과 거친 풀이 덮고 돌담은 무너졌다(잠 24:30–31). 길가 개미집에서 개미가 줄지어 낟알을 나른다(6:6–8).
   단위는 미터로 적고 M을 곱한다. 길은 z를 따라 성 쪽(-z)으로 뻗는다 */
// 흙 바닥
import { THREE, mat, mesh } from '../kit.js';
import { M, reseed, rnd, ashlar, plaster, rubble, soil, texMat, overlay, block, merlons, many, geoUp } from './kit.js';
import { WALLS, olive, farHills } from './parts.js';

export function fieldSet() {
  reseed(23);
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


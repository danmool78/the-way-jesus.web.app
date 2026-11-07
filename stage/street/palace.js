/* 왕궁 앞 세트 (잠언 p06 왕궁 앞, 밤) — 솔로몬의 궁(왕상 7장)의 앞뜰. 마름돌 높은 단 위에 '레바논 나무 궁'처럼
   백향목 기둥이 숲처럼 늘어선 주랑(7:2, 6)과 세 줄 창(7:4), 창마다 잔치 불빛. 앞뜰은 담으로 두르고 가운데 문에 파수꾼, 문 곁에 횃불.
   보는 사람은 남쪽 광장에서 북쪽(-z)의 궁을 바라본다. 단위는 미터로 적고 M을 곱한다 */
import { THREE, mat, mesh } from '../kit.js';
import { M, reseed, ashlar, paving, texMat, block, merlons, many } from './kit.js';
import { house, torchPost, farHills } from './parts.js';

export function palaceSet() {
  reseed(53);
  const g = new THREE.Group(), m = v => v * M;
  const floor = mesh(new THREE.PlaneGeometry(m(90), m(80)), texMat(paving('#bba98a')), g, [0, 0, m(-10)]);
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; floor.castShadow = false;
  floor.material.map.repeat.set(90 / 3.2, 80 / 3.2);
  const S = texMat(ashlar('#ddd0b4')), S2 = texMat(ashlar('#cfbf9e'));
  // 궁: 높은 단(계단 셋) 위의 긴 건물, 앞에 백향목 기둥 주랑
  const PZ = -16, PW = 46, PD = 22, PH = 13, ST = 1.5; // 앞면 z, 폭, 깊이, 높이, 단 높이
  for (let i = 0; i < 3; i++) block(g, S2, 0, m(PZ - PD / 2 + 0.6 * (3 - i)), m(PW + 4 - i * 0.8), m(PD + 1.2 * (3 - i)), m(ST * (i + 1) / 3), 0, m(4));
  block(g, S, 0, m(PZ - PD / 2 - 3), m(PW), m(PD - 6), m(PH), m(ST), m(4)); // 몸채 (주랑 뒤로 6m 들여)
  merlons(g, S, m(-PW / 2), m(PW / 2), m(PZ - 3.3), m(ST + PH), m(0.6));
  // 세 줄 창 (7:4) — 잔치 불빛
  const glow = new THREE.MeshBasicMaterial({ color: '#ffb866' });
  for (let r = 0; r < 3; r++) for (let x = -20; x <= 20; x += 4) {
    const w = mesh(new THREE.PlaneGeometry(m(1.0), m(1.6)), glow, g, [m(x), m(ST + 3 + r * 3.4), m(PZ - 2.98)]); w.castShadow = false;
  }
  // 주랑: 지붕판과 백향목 기둥 두 줄 (기둥은 굵고 붉은 갈색, 머리에 받침)
  mesh(new THREE.BoxGeometry(m(PW), m(0.8), m(6.4)), mat('#6a4a30', { roughness: 0.8 }), g, [0, m(ST + 7.4), m(PZ - 0.2)]).receiveShadow = true;
  const cedar = mat('#7a4a2e', { roughness: 0.7 }), cap = mat('#c9a24a', { metalness: 0.4, roughness: 0.5 });
  const cols = [];
  for (let x = -21; x <= 21.01; x += 3.5) for (const z of [PZ + 2.6, PZ - 0.6]) cols.push([m(x), m(z), 1, 0, 0, m(ST)]);
  many(g, new THREE.CylinderGeometry(m(0.38), m(0.45), m(7), 14).translate(0, m(3.5), 0), cedar, cols);
  many(g, new THREE.CylinderGeometry(m(0.6), m(0.42), m(0.5), 14).translate(0, m(7.25), 0), cap, cols);
  // 큰 문 (주랑 가운데 안쪽) — 열려 있고 안이 밝다
  const door = mesh(new THREE.PlaneGeometry(m(3.4), m(5.2)), new THREE.MeshBasicMaterial({ color: '#ffc27a' }), g, [0, m(ST + 2.6), m(PZ - 2.97)]); door.castShadow = false;
  const hall = new THREE.PointLight('#ffb060', 2.4, m(16), 1.4); hall.position.set(0, m(ST + 3), m(PZ - 1)); g.add(hall);
  // 앞뜰 담과 가운데 문 (z -2) — 파수꾼이 선다
  const CZ = -2;
  [-1, 1].forEach(s => {
    block(g, S2, s * m(14.5), m(CZ), m(24), m(1.2), m(3.2), 0, m(4));
    block(g, S, s * m(2.6), m(CZ), m(1.6), m(1.6), m(5), 0, m(4)); // 문 기둥
  });
  mesh(new THREE.BoxGeometry(m(6.8), m(0.7), m(1.8)), mat('#5d4632'), g, [0, m(5.2), m(CZ)]);
  // 횃불: 문 양옆과 앞뜰 안, 광장 둘레
  const torches = [[-3.9, CZ + 1.4], [3.9, CZ + 1.4], [-9, PZ + 4.5], [9, PZ + 4.5], [-14, 8], [14, 8]].map(([x, z]) => torchPost(g, m(x), m(z)));
  // 광장 둘레의 집들 (남쪽 양옆)
  house(g, m(-22), m(10), m(8), m(9), 2, 1, { roof: false });
  house(g, m(22), m(10), m(8), m(9), 2, -1, { roof: false });
  house(g, m(-21), m(22), m(9), m(8), 2, 1, { roof: false });
  house(g, m(21), m(22), m(9), m(8), 2, -1, { roof: false });
  farHills(g, 160);
  return { group: g, update: time => torches.forEach(t => t.update(time)) };
}

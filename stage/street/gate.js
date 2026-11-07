/* 성문 광장 세트 (잠언 p01 성문에서 부르는 지혜, p03 장터의 저울) — 솔로몬 때 예루살렘.
   보는 사람은 성 안 광장에서 북쪽(-z)의 성문을 바라본다 */
import { THREE, mat, mesh } from '../kit.js';
import { M, reseed, paving, texMat } from './kit.js';
import { gate, cityWall, house, stall, scales, olive, jarsAt, farHills } from './parts.js';

/* ---------- 성문 광장 세트 ----------
   돌려주는 것: group, 서 있을 자리 표(spots), 저울 */
export function gateSquare() {
  reseed(11);
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


/* 친구의 집 세트 (잠언 p04 친구의 집) — 솔로몬 때의 네 방 집 안마당, 해 질 녘.
   가운데는 하늘이 열린 흙 마당, 양옆은 돌기둥이 늘어선 방(기둥 위에 위층 벽), 뒤쪽은 가로로 긴 큰방, 앞쪽(+z)은 거리로 난 문.
   마당 한가운데 자리를 깔고 나물 한 그릇과 빵(잠 15:17), 둘레에 등잔. 진흙 화덕(탄누르)에 불씨가 남아 있다.
   단위는 미터로 적고 M을 곱한다 */
import { THREE, mat, mesh } from '../kit.js';
import { M, reseed, rnd, canvasTex, plaster, rubble, soil, texMat, overlay, block, many } from './kit.js';
import { WALLS, jarsAt, oilLamp } from './parts.js';

// 줄무늬 깔개 (염소털·양털 직물)
function rug(cols = ['#7a2e22', '#a8653a', '#d8c49a', '#3e2a22', '#a8653a']) {
  return canvasTex('rug' + cols.join(), 256, (g, S) => {
    for (let y = 0, i = 0; y < S; i++) { const h = 10 + (i % 3) * 8; g.fillStyle = cols[i % cols.length]; g.fillRect(0, y, S, h); y += h; }
    for (let k = 0; k < 900; k++) { g.fillStyle = `rgba(0,0,0,${Math.random() * 0.08})`; g.fillRect(Math.random() * S, Math.random() * S, 3, 1); }
  });
}

// own: 아버지와 아들의 집 (p07) — 같은 네 방 집의 꼴이지만 벽빛·깔개·살림을 바꿔 친구의 집과 다르게:
// 차린 음식 대신 양털 바구니, 베틀은 마당에 내놓고(31:13, 19), 등잔은 어머니 곁에 하나 (31:18 등불이 밤에 꺼지지 않는다)
export function homeSet(o = {}) {
  const own = !!o.own;
  reseed(own ? 37 : 31);
  const g = new THREE.Group(), m = v => v * M;
  const wall = texMat(plaster(WALLS[own ? 4 : 1])), wall2 = texMat(plaster(WALLS[own ? 0 : 3])), stone = texMat(rubble('#b19c7a')), wood = mat('#5d4632', { roughness: 0.9 });
  // 바닥: 다진 흙 (마당과 방이 한 바닥)
  const floor = mesh(new THREE.PlaneGeometry(m(40), m(40)), texMat(soil('#a08462')), g, [0, 0, 0]);
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; floor.castShadow = false;
  floor.material.map.repeat.set(10, 10);
  const H = 5.8, F = 2.8; // 집 높이, 아래층 천장 높이
  // 바깥벽: 뒤(z -7), 양옆(x ±7), 앞(z 4 — 가운데 문)
  block(g, wall, 0, m(-7.15), m(14.6), m(0.3), m(H), 0, m(3));
  [-1, 1].forEach(s => block(g, wall, s * m(7.15), m(-1.5), m(0.3), m(11.3), m(H), 0, m(3)));
  [-1, 1].forEach(s => block(g, wall, s * m(4.05), m(4.15), m(6.2), m(0.3), m(H), 0, m(3)));
  block(g, wall, 0, m(4.15), m(1.9), m(0.3), m(H - 2.3), m(2.3), m(3)); // 문 위
  mesh(new THREE.BoxGeometry(m(2.1), m(0.2), m(0.42)), wood, g, [0, m(2.35), m(4.15)]); // 상인방
  // 큰방 앞벽 (z -4, 가운데 문) 과 위층 벽
  [-1, 1].forEach(s => block(g, wall2, s * m(4), m(-4), m(5.8), m(0.3), m(F), 0, m(3)));
  block(g, wall2, 0, m(-4), m(14), m(0.3), m(H - F), m(F), m(3));
  mesh(new THREE.BoxGeometry(m(2.4), m(0.2), m(0.4)), wood, g, [0, m(F) - m(0.1), m(-4)]);
  // 양옆 기둥방: 돌기둥 줄, 기둥 위 들보, 그 위 위층 벽, 방 천장(위층 바닥)
  [-1, 1].forEach(s => {
    for (let z = -3.2; z <= 3.2; z += 1.6) {
      for (let k = 0; k < 3; k++) block(g, stone, s * m(4), m(z), m(0.36), m(0.36), m(F / 3) - 0.002, k * m(F / 3), m(1)); // 돌을 쌓은 기둥
    }
    mesh(new THREE.BoxGeometry(m(0.4), m(0.24), m(8)), wood, g, [s * m(4), m(F) + m(0.12), m(0)]);
    block(g, wall2, s * m(4), m(0), m(0.3), m(8), m(H - F - 0.24), m(F + 0.24), m(3));
    mesh(new THREE.BoxGeometry(m(3), m(0.2), m(8)), mat('#6a5038'), g, [s * m(5.5), m(F) + m(0.1), m(0)]).receiveShadow = true;
    // 위층의 작은 창
    for (let z = -2.5; z <= 2.5; z += 2.5) mesh(new THREE.BoxGeometry(m(0.32), m(0.6), m(0.5)), mat('#241c14'), g, [s * m(3.88), m(F + 1.4), m(z)]);
  });
  // 큰방 천장, 마당 위로 나온 위층 난간 들보 끝
  mesh(new THREE.BoxGeometry(m(14), m(0.2), m(3)), mat('#6a5038'), g, [0, m(F) + m(0.1), m(-5.5)]).receiveShadow = true;
  // 마당 가운데 자리: 깔개 위 그릇과 빵
  const mat0 = mesh(new THREE.PlaneGeometry(m(2.2), m(1.5)), overlay(texMat(rug(own ? ['#2f4f6a', '#c9a24a', '#e6dcc4', '#3e2a22', '#8a6a48'] : undefined), '#ffffff', { polygonOffset: true })), g, [0, 0.004, m(-0.5)]);
  mat0.rotation.x = -Math.PI / 2; mat0.receiveShadow = true; mat0.castShadow = false;
  const clay = mat('#b0754a'), greens = mat('#6f8a4a', { roughness: 1 }), bread = mat('#c99858', { roughness: 1 });
  if (!own) {
    mesh(new THREE.CylinderGeometry(m(0.2), m(0.13), m(0.1), 14), clay, g, [m(0.1), m(0.05), m(-0.5)]);
    mesh(new THREE.SphereGeometry(m(0.17), 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), greens, g, [m(0.1), m(0.08), m(-0.5)]).scale.y = 0.5; // 나물 한 그릇 (15:17)
    [[-0.45, -0.2], [-0.5, -0.75], [0.6, -0.85]].forEach(([x, z]) => mesh(new THREE.CylinderGeometry(m(0.16), m(0.16), m(0.04), 14), bread, g, [m(x), m(0.02), m(z)]));
    mesh(new THREE.CylinderGeometry(m(0.07), m(0.05), m(0.16), 10), clay, g, [m(0.55), m(0.08), m(-0.25)]); // 물 단지
  } else {
    // 양털 바구니와 자은 실타래 (31:13 양털과 삼을 구하여 부지런히 손으로 일하며)
    mesh(new THREE.CylinderGeometry(m(0.24), m(0.2), m(0.22), 14, 1, true), mat('#a0804e', { roughness: 1, side: THREE.DoubleSide }), g, [m(-0.75), m(0.11), m(-0.75)]);
    mesh(new THREE.SphereGeometry(m(0.21), 12, 8), mat('#efe8da', { roughness: 1 }), g, [m(-0.75), m(0.2), m(-0.75)]).scale.y = 0.55;
    [[0.5, -0.9], [0.68, -0.75]].forEach(([x, z]) => mesh(new THREE.SphereGeometry(m(0.08), 10, 6), mat('#9a3a2e', { roughness: 1 }), g, [m(x), m(0.07), m(z)]));
    mesh(new THREE.CylinderGeometry(m(0.07), m(0.05), m(0.16), 10), clay, g, [m(0.55), m(0.08), m(-0.25)]);
  }
  // 진흙 화덕(탄누르)과 불씨, 곁의 땔감
  const oven = mesh(new THREE.CylinderGeometry(m(0.38), m(0.48), m(0.75), 16, 1, true), mat('#9a6a46', { roughness: 1, side: THREE.DoubleSide }), g, [m(-2.9), m(0.375), m(-2.9)]);
  oven.castShadow = true;
  const ember = mesh(new THREE.CircleGeometry(m(0.34), 16).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#ff7a2e' }), g, [m(-2.9), m(0.5), m(-2.9)]);
  const ovenLight = new THREE.PointLight('#ff8a3c', 0.9, m(5), 1.6); ovenLight.position.set(m(-2.9), m(1.0), m(-2.9)); g.add(ovenLight);
  many(g, new THREE.CylinderGeometry(m(0.04), m(0.04), m(0.9), 5).rotateZ(Math.PI / 2), mat('#5a4330'), [[m(-2.1), m(-3.3), 1, 0.3, 0, m(0.05)], [m(-2.15), m(-3.15), 1, 0.5, 0, m(0.12)], [m(-2.0), m(-3.0), 1, -0.2, 0, m(0.05)]]);
  // 위층으로 오르는 사다리 (마당 동쪽 뒤)
  const lad = new THREE.Group(); lad.position.set(m(3.3), 0, m(-3.3)); lad.rotation.z = 0.22; g.add(lad);
  [-1, 1].forEach(s => mesh(new THREE.BoxGeometry(m(0.07), m(3.1), m(0.07)), wood, lad, [0, m(1.55), s * m(0.22)]));
  for (let i = 0; i < 8; i++) mesh(new THREE.BoxGeometry(m(0.05), m(0.05), m(0.5)), wood, lad, [0, m(0.3 + i * 0.36), 0]);
  // 기둥방 안의 항아리와 베틀(서쪽), 둘둘 만 잠자리(동쪽)
  jarsAt(g, [[m(-5.6), m(-2.6)], [m(-5.9), m(-2.0), 0.85], [m(-6.3), m(-2.4), 1.1], [m(5.7), m(2.4), 0.9], [m(6.2), m(2.0)]]);
  const loom = new THREE.Group(); g.add(loom);
  if (own) { loom.position.set(m(-2.2), 0, m(-1.9)); loom.rotation.y = 0.5; } else { loom.position.set(m(-5.6), 0, m(1.2)); loom.rotation.y = Math.PI / 2; }
  [-1, 1].forEach(s => mesh(new THREE.BoxGeometry(m(0.08), m(1.9), m(0.08)), wood, loom, [s * m(0.6), m(0.95), 0]));
  mesh(new THREE.BoxGeometry(m(1.4), m(0.08), m(0.08)), wood, loom, [0, m(1.85), 0]);
  mesh(new THREE.PlaneGeometry(m(1.1), m(1.4)), mat('#d8c8a4', { side: THREE.DoubleSide, roughness: 1 }), loom, [0, m(1.1), 0]);
  many(g, new THREE.CylinderGeometry(m(0.22), m(0.22), m(1.6), 10).rotateX(Math.PI / 2), mat('#8a6a48', { roughness: 1 }), [[m(5.4), m(-1.5), 1, 0, 0, m(0.22)], [m(5.9), m(-1.6), 1, 0, 0, m(0.22)]]);
  // 등잔: 자리 둘레 셋, 큰방 문가와 기둥방 벽감에 하나씩
  const lamps = (own ? [[-0.25, -0.15]] : [[0.75, -0.05], [-0.8, -0.95], [0.85, -1.05]]).map(([x, z]) => oilLamp(g, m(x), 0.002, m(z), own ? { power: 1.5, reach: 3.6 } : undefined))
    .concat([oilLamp(g, m(-1.3), m(1.3), m(-3.82), { power: 0.9 }), oilLamp(g, m(5.5), m(1.2), m(-3.6), { power: 0.8 })]);
  // 마당 너머로 보이는 이웃집 지붕 (밤하늘 아래 윤곽)
  [[-10, -12, 7], [8, -13, 8], [-14, 2, 6.5], [15, -3, 7.5]].forEach(([x, z, h]) => block(g, texMat(plaster(WALLS[Math.floor(rnd() * WALLS.length)])), m(x), m(z), m(7), m(7), m(h), 0, m(3)));
  const st = { lit: 0.25, goal: 0.25 };
  return {
    group: g,
    // ['@set', 'lamps:on'|'lamps:off'|'lamps:dim'] — 해가 지며 등잔을 켠다
    cmd(what, instant) { const [k, v] = what.split(':'); if (k === 'lamps') { st.goal = { on: 1, off: 0, dim: 0.25 }[v] ?? 1; if (instant) st.lit = st.goal; } },
    update(time, dt) {
      st.lit += (st.goal - st.lit) * (1 - Math.exp(-1.5 * dt));
      lamps.forEach(l => l.update(time, st.lit));
      ovenLight.intensity = 0.8 + Math.sin(time * 3.1) * 0.12 + Math.sin(time * 7.3) * 0.06;
      ember.material.color.setHSL(0.06, 1, 0.5 + Math.sin(time * 2.3) * 0.05);
    },
  };
}

/* 지혜의 집 세트 (잠언 p08 지혜의 집, 새벽) — "지혜가 일곱 기둥을 다듬어 집을 짓고 … 상을 차리고, 성의 높은 곳에서 부른다"(9:1–3).
   성에서 가장 높은 둔덕 위에 흰 집과 그 앞 일곱 기둥 주랑, 주랑 앞 긴 상에 빵과 포도주. 둔덕 아래로 성의 지붕들이 펼쳐지고,
   동쪽(+x) 감람산 위로 해가 떠오른다(['@set', 'sun:rise'] — 4:18 의인의 길은 돋는 햇살 같아서).
   길은 남쪽(+z)에서 올라온다. 단위는 미터로 적고 M을 곱한다 */
import { THREE, mat, mesh, glowTexture } from '../kit.js';
import { M, reseed, rnd, plaster, rubble, paving, soil, texMat, overlay, block } from './kit.js';
import { WALLS, house, olive, jarsAt, farHills } from './parts.js';

export function wisdomSet() {
  reseed(61);
  const g = new THREE.Group(), m = v => v * M;
  // 둔덕: 위는 흙 마당(가운데 판돌), 옆은 돌로 쌓은 축대. 아래(6m 밑)는 성의 지붕들
  // 둔덕은 작게 — 넓으면 가장자리에서도 아래 성이 보이지 않았다
  const hill = mesh(new THREE.CylinderGeometry(m(13), m(15), m(6), 40), texMat(rubble('#b5a07c')), g, [0, -m(3), m(-4)]);
  hill.material.map.repeat.set(14, 2); hill.receiveShadow = true;
  const top = mesh(new THREE.CircleGeometry(m(13), 48).rotateX(-Math.PI / 2), texMat(soil('#b39a72')), g, [0, 0.002, m(-4)]);
  top.material.map.repeat.set(6, 6); top.receiveShadow = true; top.castShadow = false;
  const court = mesh(new THREE.PlaneGeometry(m(16), m(7)).rotateX(-Math.PI / 2), overlay(texMat(paving('#e2d6bc'), '#ffffff', { polygonOffset: true })), g, [0, 0.006, m(-5.2)]);
  court.material.map.repeat.set(5, 2.2); court.receiveShadow = true; court.castShadow = false;
  const low = new THREE.Group(); low.position.y = -m(6); g.add(low);
  const lowGround = mesh(new THREE.PlaneGeometry(m(400), m(400)).rotateX(-Math.PI / 2), mat('#a8916c', { roughness: 1 }), low, [0, 0, 0]);
  lowGround.receiveShadow = true; lowGround.castShadow = false;
  // 성의 지붕들: 둔덕 둘레로 (지붕은 둔덕보다 낮아 감람산과 해를 가리지 않는다)
  for (let i = 0; i < 90; i++) {
    const a = rnd() * Math.PI * 2, r = 17 + rnd() * 42; // 둘레 모두 — 동쪽을 비웠더니 해 쪽으로 빈 들만 보였다
    house(low, m(Math.cos(a) * r), m(-4 + Math.sin(a) * r), m(6 + rnd() * 3), m(6 + rnd() * 3), rnd() < 0.5 ? 1 : 2, rnd() < 0.5 ? 1 : -1, { roof: rnd() < 0.4 });
  }
  // 동쪽 감람산 (먼 산을 돌려 동쪽에 둔다)
  const east = new THREE.Group(); east.rotation.y = -Math.PI / 2; low.add(east);
  farHills(east, 150);
  // 지혜의 집: 흰 집채와 그 앞 일곱 기둥 주랑 (기둥은 흰 돌, 머리에 금빛 받침)
  const white = texMat(plaster('#f1e9d6')), stone = mat('#ece2cc', { roughness: 0.7 }), gold = mat('#d6b45a', { metalness: 0.35, roughness: 0.45 });
  block(g, white, 0, m(-11), m(15), m(6), m(5.4), 0, m(3));
  mesh(new THREE.PlaneGeometry(m(1.6), m(2.6)), new THREE.MeshBasicMaterial({ color: '#ffd9a0' }), g, [0, m(1.3), m(-7.99)]).castShadow = false; // 열린 문 안의 빛
  for (let i = 0; i < 7; i++) {
    const x = m(-6 + i * 2);
    mesh(new THREE.CylinderGeometry(m(0.3), m(0.36), m(0.3), 16), stone, g, [x, m(0.15), m(-6.2)]);
    mesh(new THREE.CylinderGeometry(m(0.25), m(0.29), m(3.9), 16), stone, g, [x, m(2.25), m(-6.2)]);
    mesh(new THREE.CylinderGeometry(m(0.42), m(0.28), m(0.3), 16), gold, g, [x, m(4.35), m(-6.2)]);
  }
  mesh(new THREE.BoxGeometry(m(14.4), m(0.5), m(3.2)), white, g, [0, m(4.75), m(-7.0)]).receiveShadow = true; // 주랑 지붕
  mesh(new THREE.BoxGeometry(m(14.6), m(0.16), m(0.4)), gold, g, [0, m(4.55), m(-5.55)]);
  // 차린 상 (9:2) — 긴 낮은 상에 빵과 포도주 단지, 잔
  const tbl = mat('#7a5634', { roughness: 0.8 }), cloth = mat('#f4efe2', { roughness: 1, side: THREE.DoubleSide });
  mesh(new THREE.BoxGeometry(m(4.6), m(0.08), m(1.0)), tbl, g, [0, m(0.62), m(-3.3)]);
  [-2.1, 2.1].forEach(x => [-0.4, 0.4].forEach(z => mesh(new THREE.BoxGeometry(m(0.08), m(0.6), m(0.08)), tbl, g, [m(x), m(0.3), m(-3.3 + z)])));
  mesh(new THREE.PlaneGeometry(m(4.4), m(0.8)).rotateX(-Math.PI / 2), cloth, g, [0, m(0.665), m(-3.3)]).castShadow = false;
  const bread = mat('#c99858', { roughness: 1 }), wine = mat('#6a1e28', { roughness: 0.3 }), clay = mat('#b0754a');
  [-1.6, -0.6, 0.5, 1.5].forEach(x => mesh(new THREE.CylinderGeometry(m(0.17), m(0.17), m(0.05), 14), bread, g, [m(x), m(0.69), m(-3.45)]));
  [-1.1, 0, 1.0].forEach(x => { mesh(new THREE.CylinderGeometry(m(0.06), m(0.04), m(0.1), 10), clay, g, [m(x), m(0.72), m(-3.05)]); mesh(new THREE.CircleGeometry(m(0.05), 10).rotateX(-Math.PI / 2), wine, g, [m(x), m(0.771), m(-3.05)]); });
  [-2.6, 2.6].forEach(x => mesh(new THREE.LatheGeometry([[0.01, 0], [0.16, 0.05], [0.22, 0.35], [0.18, 0.6], [0.08, 0.7], [0.09, 0.78]].map(([a, b]) => new THREE.Vector2(m(a), m(b))), 14), mat('#9c6440'), g, [m(x), 0, m(-3.3)]));
  olive(g, m(-11), m(-1), 1.0); olive(g, m(8.5), m(-10), 0.9);
  jarsAt(g, [[m(-7.6), m(-6.8)], [m(-7.9), m(-6.2), 0.8]]);
  // 해: 동쪽 산 위 (처음엔 산마루 가까이, 'sun:rise'면 천천히 오른다)
  const sunG = new THREE.Group(); sunG.position.set(m(160), 0, m(-10)); g.add(sunG);
  const disc = mesh(new THREE.SphereGeometry(m(4.5), 20, 14), new THREE.MeshBasicMaterial({ color: '#ffe2a8', fog: false }), sunG);
  disc.castShadow = false;
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: '#ffc27a', blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  halo.scale.setScalar(m(46)); sunG.add(halo);
  const st = { y: 4, goal: 4 };
  return {
    group: g,
    // ['@set', 'sun:low'|'sun:rise']
    cmd(what, instant) { const [k, v] = what.split(':'); if (k === 'sun') { st.goal = v === 'rise' ? 24 : 4; if (instant) st.y = st.goal; } },
    update(time, dt) {
      st.y += (st.goal - st.y) * (1 - Math.exp(-0.12 * dt)); // 아주 천천히 (해가 뜨는 빠르기로)
      sunG.position.y = m(st.y);
      halo.material.opacity = 0.9 - (st.y - 4) / 40;
    },
  };
}

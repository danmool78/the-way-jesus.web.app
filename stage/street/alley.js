/* 밤 골목 세트 (잠언 p05 해 질 녘 골목, 잠 7장) — 집으로 가는 좁은 골목. 폭 3m 남짓, 양옆에 두 층 집.
   골목은 성 안쪽(-z)으로 내려가다 z -12 무렵에서 동쪽(오른쪽)으로 꺾인다. 꺾이는 모퉁이 오른쪽 집(z -9)에 등불 켠 문 — '그 여인의 집'(7:8).
   왼쪽 위쪽 집(z 3)의 위층에 나무 살창(7:6 "내 집 창문 살창으로 내다보다가") — 카메라가 그 살창 뒤에서 골목을 내려다본다.
   연출 원칙: 꾐은 그리지 않는다. 여인은 어두운 윤곽으로만, 젊은이가 따라 들어가면 문이 닫히고 불빛이 꺼진다.
   단위는 미터로 적고 M을 곱한다 */
import { THREE, mat, mesh, glowTexture } from '../kit.js';
import { M, reseed, rnd, plaster, rubble, paving, texMat, block } from './kit.js';
import { WALLS, house, jarsAt, oilLamp } from './parts.js';

export function alleySet() {
  reseed(47);
  const g = new THREE.Group(), m = v => v * M;
  // 바닥: 낡은 판돌 골목
  const floor = mesh(new THREE.PlaneGeometry(m(60), m(60)), texMat(paving('#a8957a')), g, [0, 0, m(-4)]);
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; floor.castShadow = false;
  floor.material.map.repeat.set(60 / 3.2, 60 / 3.2);
  // 오른쪽 줄 (문이 서쪽, 골목 쪽)
  house(g, m(5.1), m(9), m(7), m(7), 2, -1, { door: m(1) });
  house(g, m(5.1), m(1.5), m(7), m(7.6), 2, -1);
  house(g, m(5.1), m(-4.6), m(7), m(4.4), 1, -1);
  // 그 여인의 집 (모퉁이 바로 앞, 두 층) — 문은 따로 짓는다 (등불과 닫히는 문짝)
  const WZ = -9.4, P = texMat(plaster(WALLS[2])), R = texMat(rubble('#a89474'));
  block(g, R, m(5.1), m(WZ), m(7), m(5.4), m(1.1), 0, m(2));
  block(g, P, m(5.1), m(WZ), m(7), m(5.4), m(4.9), m(1.1), m(3));
  // 문간: 벽에 난 어두운 구멍 대신, 안쪽이 따뜻하게 밝은 문 — 열려 있다가 닫힌다
  const doorX = m(1.6), dz = m(WZ + 0.6);
  const glow = mesh(new THREE.PlaneGeometry(m(1.0), m(2.0)), new THREE.MeshBasicMaterial({ color: '#ffb35c' }), g, [doorX - 0.004, m(1.0), dz]);
  glow.rotation.y = -Math.PI / 2; glow.castShadow = false;
  mesh(new THREE.BoxGeometry(m(0.12), m(0.2), m(1.4)), mat('#4e3a28'), g, [doorX + 0.01, m(2.1), dz]); // 상인방
  const leafPivot = new THREE.Group(); leafPivot.position.set(doorX - m(0.04), 0, dz + m(0.5)); g.add(leafPivot);
  mesh(new THREE.BoxGeometry(m(0.06), m(2.0), m(1.0)), mat('#3e2e20', { roughness: 0.9 }), leafPivot, [0, m(1.0), -m(0.5)]);
  const doorLamp = oilLamp(g, doorX - m(0.25), m(1.9), dz + m(0.75), { power: 1.4, reach: 2.6 }); // 문설주의 등잔
  const inLight = new THREE.PointLight('#ffa050', 1.2, m(5), 1.6); inLight.position.set(doorX + m(0.6), m(1.4), dz); g.add(inLight);
  // 왼쪽 줄 (문이 동쪽). z 3의 집은 위층 살창이 있는 '내 집' — 창 구멍 없이 직접 짓는다 (카메라가 그 안에서 내다본다)
  house(g, m(-5.1), m(11), m(7), m(7), 2, 1);
  const H2 = texMat(plaster(WALLS[0]));
  block(g, R, m(-5.1), m(3), m(7), m(8), m(1.1), 0, m(2));
  block(g, H2, m(-5.1), m(3), m(7), m(8), m(4.9), m(1.1), m(3));
  // 살창(7:6): 위층 벽에서 골목 쪽으로 내민 나무 창틀 상자. 골목 아래쪽(-z)을 향한 앞면에 엇갈린 살 —
  // 카메라가 그 안에서 살 너머로 골목을 내려다본다 (옆벽에 낸 창은 골목을 비스듬히만 보여 살이 한 줄로 겹쳤다)
  const wood = mat('#4a3626', { roughness: 0.9 }), LX = m(-1.22), LY = m(3.25), LZ = m(2.2), LW = m(0.72), LH = m(1.05);
  mesh(new THREE.BoxGeometry(LW + m(0.1), m(0.1), m(0.9)), wood, g, [LX, LY - LH / 2 - m(0.05), LZ + m(0.45)]); // 바닥판
  mesh(new THREE.BoxGeometry(LW + m(0.1), m(0.1), m(0.9)), wood, g, [LX, LY + LH / 2 + m(0.05), LZ + m(0.45)]); // 지붕판
  [-1, 1].forEach(s2 => mesh(new THREE.BoxGeometry(m(0.07), LH, m(0.07)), wood, g, [LX + s2 * LW / 2, LY, LZ]));
  for (let i = -3; i <= 3; i++) {
    [1, -1].forEach(k => {
      const bar = mesh(new THREE.BoxGeometry(m(1.5), m(0.03), m(0.03)), wood, g, [LX + m(i * 0.17), LY, LZ]);
      bar.rotation.z = k * Math.PI / 4; bar.scale.x = Math.max(0.15, 0.62 - Math.abs(i) * 0.12);
    });
  }
  house(g, m(-5.1), m(-4.5), m(7), m(7), 2, 1);
  house(g, m(-5.1), m(-12), m(7), m(7), 1, 1);
  // 꺾인 골목 끝을 막는 집 (꺾인 길은 동쪽으로 이어진다)
  house(g, m(2), m(-19.5), m(14), m(7), 2, 0, { door: m(-3) });
  house(g, m(14), m(-9.5), m(7), m(10), 2, -1);
  // 창마다 새어 나오는 불빛 (몇 집만) — 작은 등잔을 창 안쪽에
  const winLamps = [[-1.7, 2.6, 11.5], [1.7, 3.1, 1.0], [-1.7, 3.0, -5.5]].map(([x, y, z]) => oilLamp(g, m(x), m(y), m(z), { power: 0.6, reach: 2.2 }));
  jarsAt(g, [[m(1.2), m(4.5), 0.8], [m(-1.25), m(-2.0), 0.9], [m(1.25), m(-6.5)]]);
  // 달: 동쪽 하늘에 은은한 빛 (밤 장면의 하늘)
  const moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: '#dfe8ff', depthWrite: false, fog: false }));
  moon.scale.setScalar(m(14)); moon.position.set(m(40), m(48), m(-120)); g.add(moon);
  mesh(new THREE.SphereGeometry(m(2.2), 16, 12), new THREE.MeshBasicMaterial({ color: '#f4f2e6', fog: false }), g, [m(40), m(48), m(-121)]).castShadow = false;
  const st = { open: 1, goal: 1 };
  return {
    group: g,
    // ['@set', 'door:open'|'door:shut'] — 젊은이가 따라 들어가면 문이 닫히고 불빛이 꺼진다
    cmd(what, instant) { const [k, v] = what.split(':'); if (k === 'door') { st.goal = v === 'shut' ? 0 : 1; if (instant) st.open = st.goal; } },
    update(time, dt) {
      st.open += (st.goal - st.open) * (1 - Math.exp(-1.8 * dt));
      // 열린 문짝은 경첩에서 반 바퀴 돌아 바깥벽에 납작 붙는다 — 1.35만 돌리면 골목으로 비스듬히 튀어나와, 문간에 선 사람이 문짝을 뚫고 나오는 듯 보였다
      leafPivot.rotation.y = st.open * Math.PI;
      glow.material.color.setRGB(1 * st.open + 0.05, 0.7 * st.open + 0.04, 0.36 * st.open + 0.03);
      inLight.intensity = 1.2 * st.open;
      doorLamp.update(time, st.open);
      winLamps.forEach(l => l.update(time, 1));
    },
  };
}

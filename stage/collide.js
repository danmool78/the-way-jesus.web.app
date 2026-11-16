// 겹침 막기(사용자 2026-11): 사람·물건을 바닥에 놓인 직육면체(위에서 보면 돌아간 네모, OBB)로 보고, 겹치면 가장 짧은 쪽으로 밀어낸다.
// 원으로 재니 사람 몸보다 커서 너무 떨어졌다(사용자). 좌표는 무대(stageGroup) 기준 x·z
import * as THREE from '../assets/vendor/three.module.min.js';

// 네모: { c: [x, z], u: [ux, uz] 너비 방향(단위), v: [vx, vz] 깊이 방향(단위), hu, hv: 반 너비·반 깊이 }
export const box = (cx, cz, yaw, hu, hv) => ({ c: [cx, cz], u: [Math.cos(yaw), -Math.sin(yaw)], v: [Math.sin(yaw), Math.cos(yaw)], hu, hv });

// a를 b 밖으로 내보내는 가장 짧은 [dx, dz] (겹치지 않으면 null) — 분리축(SAT): 두 네모의 네 축에 그림자를 내려 본다
export function push(a, b) {
  const d = [a.c[0] - b.c[0], a.c[1] - b.c[1]];
  let best = Infinity, ax = null;
  for (const n of [a.u, a.v, b.u, b.v]) {
    const ra = a.hu * Math.abs(a.u[0] * n[0] + a.u[1] * n[1]) + a.hv * Math.abs(a.v[0] * n[0] + a.v[1] * n[1]);
    const rb = b.hu * Math.abs(b.u[0] * n[0] + b.u[1] * n[1]) + b.hv * Math.abs(b.v[0] * n[0] + b.v[1] * n[1]);
    const p = d[0] * n[0] + d[1] * n[1], o = ra + rb - Math.abs(p);
    if (o <= 0) return null;
    if (o < best) { best = o; ax = p >= 0 ? n : [-n[0], -n[1]]; }
  }
  return [ax[0] * best, ax[1] * best];
}

// 사람의 네모: 어깨 너비·몸 두께 (키 0.9인 사람 기준 0.17 × 0.11)
export const personBox = (x, z, yaw, H = 0.9) => box(x, z, yaw, 0.085 * H / 0.9, 0.055 * H / 0.9);

// 단단한 물건: 사람이 그 안이나 위에 서지 않는 것만 — 회당·성전·배·언덕처럼 안에 서거나 올라서는 것은 뺀다
export const SOLID = new Set(['house', 'well', 'table', 'feast', 'jars', 'pot', 'tomb', 'donkey', 'camel', 'ox', 'pig', 'dog', 'jackal', 'sheep', 'manger',
  'olive', 'figtree', 'palm', 'lifetree', 'fruittree', 'basin', 'altar', 'baskets', 'cage', 'bier', 'throne', 'treasury', 'crosses', 'pillar', 'egcolumns', 'bush', 'rocks']);

// 물건의 부분마다(맨 위 자식마다) 자기 좌표의 상자를 한 번 재 둔다 — 양 떼·항아리처럼 여럿이 흩어진 것을 통째 한 상자로 막지 않게
const inv = new THREE.Matrix4(), m = new THREE.Matrix4(), bb = new THREE.Box3(), tb = new THREE.Box3();
function parts(obj) {
  if (obj.userData.parts) return obj.userData.parts;
  obj.updateMatrixWorld(true); inv.copy(obj.matrixWorld).invert();
  const out = [];
  for (const c of obj.children) {
    bb.makeEmpty();
    c.traverse(o => { if (!o.isMesh || o.isSprite || !o.geometry || o.material?.blending === THREE.AdditiveBlending) return; if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
      tb.copy(o.geometry.boundingBox).applyMatrix4(m.multiplyMatrices(inv, o.matrixWorld)); bb.union(tb); });
    if (bb.isEmpty() || bb.max.y - bb.min.y < 0.03 || bb.min.y > 0.3) continue; // 바닥에 깔린 것·머리 위의 것은 걸리지 않는다
    out.push([(bb.min.x + bb.max.x) / 2, (bb.min.z + bb.max.z) / 2, (bb.max.x - bb.min.x) / 2, (bb.max.z - bb.min.z) / 2]);
  }
  return obj.userData.parts = out;
}
// 물건의 네모들을 무대 좌표로 (물건이 움직이고 돌아도 매번 따라간다)
const p3 = new THREE.Vector3(), ax = new THREE.Vector3(), az = new THREE.Vector3();
export function propBoxes(obj, stage) {
  if (!obj.visible) return [];
  stage.updateMatrixWorld(true); obj.updateMatrixWorld(true);
  m.copy(stage.matrixWorld).invert().multiply(obj.matrixWorld);
  ax.setFromMatrixColumn(m, 0); az.setFromMatrixColumn(m, 2);
  const sx = Math.hypot(ax.x, ax.z), sz = Math.hypot(az.x, az.z), yaw = Math.atan2(-ax.z, ax.x);
  return parts(obj).map(([x, z, hx, hz]) => { p3.set(x, 0, z).applyMatrix4(m); return box(p3.x, p3.z, yaw, hx * sx, hz * sz); });
}

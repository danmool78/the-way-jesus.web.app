/* 다윗 여정 묶음 b(d11–d20)에만 쓰는 소품과 인물: props.js의 MAKERS, people.js의 TYPES에 더한다 (공용 파일을 키우지 않게) */
import { THREE, mat, mesh } from '../kit.js';
import { MAKERS, Prop } from '../props.js';
import { TYPES } from '../people.js';

Object.assign(TYPES, {
  abishai:   { robe: '#6a5236', trim: '#3e2a1a', mantle: '#5a3a24', hair: '#1d140c', beard: true, cap: '#6a4a2a', sword: true, sash: '#3e2a1a', skin: 2, height: 0.96 }, // 아비새 (다윗의 조카, 스루야의 아들 — 삼상 26:6)
  amalekite: { robe: '#8a7a5e', trim: '#5a4a36', hair: '#8a7c64', sash: '#5a4a36', skin: 3, height: 0.9 }, // 옷을 찢고 머리에 흙을 쓴 아말렉 청년 (삼하 1:2 — 흙빛 머리)
  egyslave:  { robe: '#d8ccb0', trim: '#8a7a5a', cloth: '#d8ccb0', hair: '#1a1210', bare: true, kilt: true, skin: 3, height: 0.88 }, // 아말렉 사람의 종이던 애굽 청년 (삼상 30:11 — 허리치마만)
});
// 잠든 아브넬 (삼상 26:7): 창 없이 — 누운 사람의 창이 몸에서 곧게 솟아 보였다
TYPES.abnerS = { ...TYPES.abner, spear: false };

const rockM = (c = '#a8977c') => mat(c, { roughness: 1, flatShading: true });
const boulder = (g, m, r, pos, sc = [1, 1, 1]) => { const geo = new THREE.DodecahedronGeometry(r, 0); geo.rotateY(pos[0] * 5 + pos[2] * 3); const b = mesh(geo, m, g, pos, sc); b.receiveShadow = true; return b; };

Object.assign(MAKERS, {
  // 앞이 트인 굴 (엔게디 — 삼상 24:3 '굴 깊은 곳'): 반쪽 바위 지붕이 뒤(-z)를 덮어 안쪽이 어둡게 보이고, 앞(+z)은 열려 안에 앉은 사람이 보인다.
  // 굴 입구(cave)는 바깥에서 본 모습이라 안에 숨은 사람을 보일 수 없었다. o.w 너비, o.h 높이(사람 키 0.88보다 높게), o.d 깊이, o.color 바위빛
  grotto(o = {}) {
    const g = new THREE.Group(), W = o.w || 1.5, H = o.h || 0.95, D = o.d || 0.7, m = rockM(o.color || '#c9bb9c');
    const half = new THREE.SphereGeometry(1, 28, 12, Math.PI, Math.PI, 0, Math.PI / 2); // 뒤쪽 반구 (z < 0)
    const outer = mesh(half, m, g, [0, 0, 0], [W / 2, H, D]); outer.receiveShadow = true;
    const inner = mesh(half, new THREE.MeshStandardMaterial({ color: '#3a3026', roughness: 1, side: THREE.BackSide }), g, [0, 0, 0], [W / 2 * 0.99, H * 0.99, D * 0.99]);
    inner.castShadow = false;
    const fl = mesh(new THREE.CircleGeometry(1, 28, Math.PI, Math.PI), new THREE.MeshStandardMaterial({ color: '#4a3e32', roughness: 1 }), g, [0, 0.006, 0], [W / 2 * 0.98, D * 0.98, 1]);
    fl.rotation.x = -Math.PI / 2; fl.castShadow = false; fl.receiveShadow = true;
    // 입구 둘레의 바위 테 — 얇은 껍데기가 아니라 바위산으로 보이게
    for (let i = 0; i <= 8; i++) {
      const a = i / 8 * Math.PI, x = Math.cos(a) * W / 2, y = Math.sin(a) * H;
      boulder(g, m, 0.11 + (i % 3) * 0.03, [x * 1.02, y * 0.98, 0.0], [1.1, 1, 0.8]);
    }
    boulder(g, m, 0.4, [0.1, H * 0.95, -D * 0.5], [1.8, 0.7, 1]);
    boulder(g, m, 0.3, [-W * 0.45, H * 0.55, -D * 0.6], [1, 1.2, 1]);
    boulder(g, m, 0.28, [W * 0.5, H * 0.45, -D * 0.5], [1, 1.1, 1]);
    return new Prop(g);
  },

  // 양 우리 (엔게디 길가의 양 우리, 삼상 24:3): 둥글게 쌓은 낮은 돌담, 앞쪽에 드나드는 틈. o.r 반지름
  fold(o = {}) {
    const g = new THREE.Group(), R = o.r || 0.32, m = rockM(o.color || '#b3a486');
    for (let i = 0; i < 22; i++) {
      const a = i / 22 * Math.PI * 2 + Math.PI / 2;
      if (Math.sin(a) > 0.95) continue; // 앞(+z) 쪽 틈
      boulder(g, m, 0.045 + (i % 3) * 0.008, [Math.cos(a) * R, 0.04, Math.sin(a) * R], [1.3, 0.9, 1]);
    }
    return new Prop(g);
  },
});

/* 애굽의 이름난 자리 3D 모형 — 지도에 까는 그림을 만들기 위한 것 (예루살렘 도성과 같은 방식, _src/tools/jerusalem.html?m=giza).
   좌표: 지도 단위(1/1000도 위도 ≈ 111m), 원점은 각 틀의 북서 모서리. 각 틀(위경도·top)은 app.js의 LANDMARKS와 같게 */
import { THREE, mat, mesh, sphere } from './kit.js';

const COS = Math.cos(32.3 * Math.PI / 180), K = 1000;
let seed = 11;
const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const box = (parent, m, [x, z], w, d, h, y = 0, rot = 0) => {
  const o = mesh(new THREE.BoxGeometry(w, h, d), m, parent, [x, y + h / 2, z]);
  o.rotation.y = rot; o.receiveShadow = true; return o;
};
// 사각뿔(피라미드): 밑변 b, 높이 h. 네 면이 동서남북을 향한다
function pyramid(parent, m, [x, z], b, h) {
  const g = new THREE.ConeGeometry(b / Math.SQRT2, h, 4, 1);
  g.rotateY(Math.PI / 4);
  const o = mesh(g, m, parent, [x, h / 2, z]); o.receiveShadow = true;
  return o;
}
function palms(parent, spots, s) {
  const trunk = mat('#8a6a44'), leaf = mat('#5f7d3c', { side: THREE.DoubleSide, roughness: 1 });
  spots.forEach(([x, z]) => {
    const h = s * (0.8 + rnd() * 0.5);
    const t = mesh(new THREE.CylinderGeometry(s * 0.05, s * 0.08, h, 6), trunk, parent, [x, h / 2, z]);
    t.rotation.z = (rnd() - 0.5) * 0.2;
    for (let i = 0; i < 7; i++) {
      const f = mesh(new THREE.ConeGeometry(s * 0.14, s * 0.7, 3), leaf, parent, [x, h, z]);
      f.rotation.set(Math.PI / 2 + 0.5, (i / 7) * Math.PI * 2, 0, 'YXZ'); f.translateY(s * 0.3);
    }
  });
}

// 각 표지는 중심 위경도 둘레 w×h 지도 단위 틀 안에 그린다 (틀의 북서 모서리가 원점). 실제보다 훨씬 크게:
// 넓은 지도에서 몇 픽셀로 사라지지 않게 '그림 지도의 아이콘' 크기로 키운 것이다
const frame = (lat, lng, w, h, top) => ({ lat0: lat - h / 2 / K, lat1: lat + h / 2 / K, lng0: lng - w / 2 / (COS * K), lng1: lng + w / 2 / (COS * K), top });

// 기자: 쿠푸·카프레·멘카우레 세 피라미드(남서로 비스듬히 늘어선 자리 그대로), 왕비 피라미드, 스핑크스와 골짜기 신전, 무덤들, 강가 대추야자
const GIZA = frame(29.977, 31.132, 30, 24, 9);
function giza() {
  seed = 11;
  const g = new THREE.Group(), cx = 15, cz = 12;
  const lime = mat('#e9d9b0', { roughness: 0.9 }), lime2 = mat('#dcc898', { roughness: 0.9 }), cap = mat('#f4eedc', { roughness: 0.6 });
  pyramid(g, lime, [cx - 4.5, cz - 4], 7.5, 6.2);                                   // 쿠푸
  pyramid(g, lime2, [cx + 0.3, cz], 7, 6);                                          // 카프레
  pyramid(g, cap, [cx + 0.3, cz], 1.6, 1.4).position.y = 5.3;                       // 카프레 꼭대기에 남은 덮개돌
  pyramid(g, lime2, [cx + 4.6, cz + 4.4], 3.6, 3);                                  // 멘카우레
  [[0, 0], [0, 1.7], [0, 3.4]].forEach(([dx, dz]) => pyramid(g, lime2, [cx - 0.2 + dx, cz - 7.3 + dz * 0.3 + dz], 1.4, 1.1)); // 왕비 피라미드
  [[6.2, 4.4], [6.2, 6.0], [6.2, 7.6]].forEach(([dx, dz]) => pyramid(g, lime2, [cx + dx, cz + dz - 2], 1.1, 0.9));
  // 스핑크스: 엎드린 몸 + 앞발 + 머리 (동쪽 나일을 본다)
  const sp = [cx + 5.5, cz - 1.5], sm = mat('#d4bc88', { roughness: 1 });
  box(g, sm, sp, 3.2, 1.1, 0.9);
  box(g, sm, [sp[0] + 1.9, sp[1]], 1.2, 1.0, 0.35);
  box(g, sm, [sp[0] + 1.3, sp[1]], 0.8, 0.8, 1.6);
  box(g, mat('#c9b07c'), [sp[0] + 3.4, sp[1] + 0.6], 1.6, 1.8, 0.6);                 // 골짜기 신전
  // 쿠푸 둘레의 무덤들(마스타바)
  for (let i = 0; i < 24; i++) box(g, lime2, [cx - 11 + (i % 6) * 0.9, cz - 7 + Math.floor(i / 6) * 1.0], 0.6, 0.45, 0.3);
  palms(g, Array.from({ length: 14 }, (_, i) => [cx + 11 + (rnd() - 0.5) * 2.5, 1.5 + i * 1.5]), 1.4);
  return g;
}

// 알렉산드리아의 등대(파로스): 섬 위 세 단 탑(사각·팔각·원통)과 꼭대기 불, 뭍으로 잇는 둑길(헵타스타디온), 항구 도시 한 자락
const PHAROS = frame(31.205, 29.895, 26, 20, 13);
function pharos() {
  seed = 13;
  const g = new THREE.Group(), w = mat('#f1e8d2', { roughness: 0.7 }), w2 = mat('#e2d6ba', { roughness: 0.8 }), p = [9, 6];
  box(g, mat('#c9b48a', { roughness: 1 }), p, 9, 5, 0.3);                           // 섬
  box(g, w2, p, 4, 4, 1);                                                            // 기단
  box(g, w, p, 2.4, 2.4, 6, 1);                                                      // 사각 탑
  mesh(new THREE.CylinderGeometry(1.0, 1.15, 2.8, 8), w, g, [p[0], 8.4, p[1]]);       // 팔각 탑
  mesh(new THREE.CylinderGeometry(0.55, 0.7, 1.8, 16), w, g, [p[0], 10.7, p[1]]);     // 원통 탑
  mesh(sphere(0.45, 12, 8), mat('#ffcf6a', { emissive: '#ff9a30', emissiveIntensity: 1 }), g, [p[0], 12, p[1]]);
  // 헵타스타디온 둑길과 도시
  box(g, mat('#cbb68c'), [p[0] + 4, p[1] + 5], 1.0, 7, 0.4, 0, -0.5);
  for (let i = 0; i < 70; i++) box(g, i % 3 ? w2 : w, [p[0] + 3 + rnd() * 14, p[1] + 8 + rnd() * 5.5], 0.7 + rnd() * 0.6, 0.7 + rnd() * 0.6, 0.4 + rnd() * 0.6);
  return g;
}

// 헬리오폴리스(온): 해의 신전과 탑문, 그 앞 오벨리스크 한 쌍 (하나는 지금도 서 있다), 둘레 대추야자
const HELIO = frame(30.129, 31.307, 22, 16, 8);
function helio() {
  seed = 17;
  const g = new THREE.Group(), red = mat('#b77a5c', { roughness: 0.7 }), gold = mat('#e2bd55', { roughness: 0.4 }), st = mat('#dcc898', { roughness: 0.9 }), c = [11, 8];
  box(g, mat('#cbb68c'), c, 14, 8, 0.3);                                     // 신전 터 단
  box(g, st, [c[0] - 3, c[1]], 5, 5, 2.2, 0.3);                              // 신전
  box(g, st, [c[0] + 0.8, c[1] - 1.7], 1.3, 2.2, 3.2, 0.3);                  // 탑문 두 날개
  box(g, st, [c[0] + 0.8, c[1] + 1.7], 1.3, 2.2, 3.2, 0.3);
  [-1.3, 1.3].forEach(dz => {
    const o = mesh(new THREE.CylinderGeometry(0.22, 0.4, 6, 4), red, g, [c[0] + 3.5, 0.3 + 3, c[1] + dz]);
    o.rotation.y = Math.PI / 4;
    mesh(new THREE.ConeGeometry(0.3, 0.7, 4), gold, g, [c[0] + 3.5, 0.3 + 6.35, c[1] + dz]).rotation.y = Math.PI / 4;
  });
  palms(g, Array.from({ length: 14 }, () => [c[0] + (rnd() - 0.5) * 20, c[1] + (rnd() < 0.5 ? -1 : 1) * (4.8 + rnd() * 2.5)]), 1.3);
  return g;
}

export const MODELS = {
  giza: { extent: GIZA, build: giza },
  pharos: { extent: PHAROS, build: pharos },
  helio: { extent: HELIO, build: helio },
};
export const sizeOf = E => ({ w: (E.lng1 - E.lng0) * COS * K, h: (E.lat1 - E.lat0) * K });

/* 다윗 여정 묶음 c(d21–d30)에만 쓰는 소품과 인물 — props.js의 MAKERS, people.js의 TYPES에 더한다 (공용 파일을 키우지 않게).
   크기는 사람 키(약 0.88)와의 비례로. 앞으로 나아가는 것(병거)은 +x가 머리 */
import { THREE, mat, DS, mesh, sphere, damp } from '../kit.js';
import { MAKERS, Prop } from '../props.js';
import { TYPES } from '../people.js';

Object.assign(TYPES, {
  // 여부스 사람 (시온 산성의 파수꾼, 삼하 5:6): 가나안 사람의 짙은 붉은 옷과 둘러 감은 머릿수건 — 이스라엘 병사의 가죽 투구와 갈리게
  jebusite:  { robe: '#7a3a2e', trim: '#c9a24a', mantle: '#4a3a2a', hair: '#1d140c', beard: true, turban: '#c8a878', spear: true, sash: '#c9a24a', skin: 3 },
  jebusite2: { robe: '#5a4a6a', trim: '#c9a24a', hair: '#1d140c', beard: true, turban: '#b89868', sash: '#c9a24a', skin: 3 },
  // 세마포 에봇을 입고 춤추는 왕 (삼하 6:14): 금관과 붉은 겉옷을 벗은 흰 옷
  davidE:    { robe: '#f4eedf', trim: '#a8312a', mantle: '#e6d3a0', hair: '#6a3a22', beard: true, sash: '#a8312a', skin: 4 }, // 붉은 띠 — 흰 옷의 레위 사람들과 갈리게
  // 아비나답의 아들 웃사(소 모는 막대)와 아효 (삼하 6:3)
  uzzah:     { robe: '#7a6a4a', trim: '#4a3a28', mantle: '#4f6a7d', hair: '#2e1d12', beard: true, sash: '#4a3a28', staff: true, skin: 1 },
  ahio:      { robe: '#8a7350', trim: '#5b4630', mantle: '#8a5a3a', hair: '#3a2616', beard: true, sash: '#5b4630', skin: 3 },
  // 사울 집의 종 시바 (삼하 9:2)
  ziba:      { robe: '#9a8466', trim: '#5a4a36', mantle: '#6a5a46', hair: '#3a2a1c', beard: true, hood: '#cdbb94', band: '#5a4a36', sash: '#5a4a36', skin: 1 },
  // 절며 걷는 므비보셋: 지팡이에 기대어 (앉을 때는 mephibosheth)
  mephiS:    { ...TYPES.mephibosheth, staff: true },
  // 두로 왕 히람의 사절 (삼하 5:11): 자줏빛 옷에 흰 머릿수건
  tyrian:    { robe: '#6b2a5e', trim: '#d6a93a', mantle: '#d8c49a', hair: '#1d140c', beard: true, turban: '#efe6d4', sash: '#d6a93a', skin: 2 },
  // 하맛 왕 도이의 아들 요람 (삼하 8:10)
  joram:     { robe: '#2f6a6a', trim: '#d6a93a', mantle: '#c99a5a', hair: '#1d140c', beard: true, turban: '#d8b45a', sash: '#d6a93a', skin: 3 },
  // 앞서 달리는 사람 (삼하 15:1): 망토 없는 짧은 옷
  runner:    { robe: '#c9b48c', trim: '#2f6a5a', hair: '#2b1b10', beard: true, sash: '#2f6a5a', skin: 2 },
});

const wood = () => mat('#7a5634', { roughness: 0.95 });

Object.assign(MAKERS, {
  // 백향목 재목 (두로에서 온, 삼하 5:11): 껍질 벗긴 붉은 통나무 더미. o.n 개수
  cedarlogs(o = {}) {
    const g = new THREE.Group(), m = [mat('#a0603a', { roughness: 0.85 }), mat('#8a4e2e', { roughness: 0.85 })], end = mat('#d8a878', { roughness: 0.9 });
    const rows = [[-0.09, 0.035], [0, 0.035], [0.09, 0.035], [-0.045, 0.1], [0.045, 0.1], [0, 0.165]].slice(0, o.n || 6);
    rows.forEach(([z, y], i) => {
      const L = 0.62 - (i % 2) * 0.06;
      mesh(new THREE.CylinderGeometry(0.04, 0.042, L, 12), m[i % 2], g, [0, y, z]).rotation.z = Math.PI / 2;
      [-1, 1].forEach(s => mesh(new THREE.CircleGeometry(0.038, 12), end, g, [s * (L / 2 + 0.001), y, z]).rotation.y = s * Math.PI / 2);
    });
    return new Prop(g);
  },

  // 짓고 있는 왕궁 (다윗성의 백향목 궁, 삼하 5:11): 마름돌 단 위의 두 층 집과 백향목 기둥·들보, 둘레의 비계.
  // show가 커지며 아래에서부터 쌓여 오른다(fade 'none'). state 'built'면 비계가 걷힌다
  palacebuild(o = {}) {
    const g = new THREE.Group(), W = o.w || 1.1, D = o.d || 0.6, H = o.h || 0.82;
    const stone = mat('#e6dcc4', { roughness: 0.9 }), cedar = mat('#7a4a2a', { roughness: 0.8 }), dark = mat('#2a1c10');
    const base = mesh(new THREE.BoxGeometry(W + 0.12, 0.06, D + 0.12), mat('#cbbd9e', { roughness: 1 }), g, [0, 0.03, 0]); base.receiveShadow = true;
    const body = new THREE.Group(); body.position.y = 0.06; g.add(body);
    mesh(new THREE.BoxGeometry(W, H, D), stone, body, [0, H / 2, 0]).receiveShadow = true;
    [0.42, 0.98].forEach(f => mesh(new THREE.BoxGeometry(W + 0.02, 0.035, D + 0.02), cedar, body, [0, H * f, 0])); // 층 사이·지붕 들보 띠
    for (let i = 0; i < 4; i++) mesh(new THREE.CylinderGeometry(0.03, 0.034, H * 0.42, 10), cedar, body, [(i / 3 - 0.5) * (W - 0.2), H * 0.21, D / 2 + 0.05]); // 앞 주랑의 백향목 기둥
    mesh(new THREE.BoxGeometry(W - 0.1, 0.03, 0.1), cedar, body, [0, H * 0.42, D / 2 + 0.04]);
    mesh(new THREE.BoxGeometry(0.2, 0.3, 0.02), dark, body, [0, 0.15, D / 2 + 0.006]); // 문
    [-1, 1].forEach(k => mesh(new THREE.BoxGeometry(0.1, 0.12, 0.02), dark, body, [k * W * 0.3, H * 0.68, D / 2 + 0.006])); // 위층 창
    mesh(new THREE.BoxGeometry(W + 0.04, 0.06, 0.03), stone, body, [0, H + 0.03, D / 2]);
    // 비계: 앞과 옆에 선 장대와 가로대
    const scaf = new THREE.Group(); g.add(scaf);
    const pole = wood();
    [-0.5, -0.17, 0.17, 0.5].forEach(f => mesh(new THREE.CylinderGeometry(0.008, 0.008, H + 0.2, 5), pole, scaf, [f * W * 1.04, (H + 0.2) / 2, D / 2 + 0.16]));
    [0.3, 0.6].forEach(f => mesh(new THREE.BoxGeometry(W * 1.08, 0.012, 0.012), pole, scaf, [0, H * f + 0.06, D / 2 + 0.16]));
    return new Prop(g, (P, t, dt) => {
      const k = Math.max(0.04, Math.min(1, P.show));
      body.scale.y = k; scaf.visible = P.state !== 'built' && P.show > 0.02;
      body.visible = P.show > 0.02;
    }, { fade: 'none', state: o.state || 'site' });
  },

  // 궤를 내린 빈 수레 (오벧에돔의 집으로 메고 간 뒤, 삼하 6:10): arkcart에서 궤만 감춘다
  emptycart(o = {}) {
    const P = MAKERS.arkcart(o), cart = P.obj.children[0];
    cart.children[cart.children.length - 1].visible = false; // 수레에 넣은 마지막 것이 언약궤
    return P;
  },

  // 이스라엘의 병거 (압살롬, 삼하 15:1): 애굽 병거에서 모는 사람(허리치마·가발)을 빼고 말빛을 바꾼다
  chariotI(o = {}) {
    const P = MAKERS.chariot({ coat: '#8a6a4a', ...o }), body = P.obj.children[0];
    body.children[body.children.length - 1].visible = false;
    return P;
  },

  // 왕의 식탁 (삼하 9:13): 앉은 사람의 가슴께 높이의 긴 상에 바닥까지 드리운 흰 상보(자줏빛 단) — 그 뒤에 앉은 므비보셋의 발이 가려진다.
  // 사람은 상 뒤(-z)에 앉힌다. o.len 길이
  kingtable(o = {}) {
    const g = new THREE.Group(), L = o.len || 1.1, H = 0.24, linen = mat('#efe8d8', { roughness: 0.95 });
    mesh(new THREE.BoxGeometry(L, 0.025, 0.3), mat('#7a4a2a', { roughness: 0.8 }), g, [0, H, 0]);
    const cloth = mesh(new THREE.BoxGeometry(L + 0.02, H, 0.012), linen, g, [0, H / 2, 0.152]); cloth.receiveShadow = true; // 앞으로 드리운 상보
    [-1, 1].forEach(s => mesh(new THREE.BoxGeometry(0.012, H, 0.3), linen, g, [s * (L / 2 + 0.006), H / 2, 0]));
    mesh(new THREE.BoxGeometry(L + 0.03, 0.03, 0.016), mat('#6b2a5e', { roughness: 0.9 }), g, [0, 0.02, 0.155]); // 단
    mesh(new THREE.BoxGeometry(L + 0.02, 0.006, 0.31), linen, g, [0, H + 0.015, 0]);
    const food = [['#c99a5a', 0.04], ['#7a1f2e', 0.03], ['#8fa45a', 0.035], ['#d6a93a', 0.03]];
    for (let i = 0; i < 9; i++) { const [c, r] = food[i % 4]; mesh(sphere(r, 10, 8), mat(c), g, [(i / 8 - 0.5) * (L - 0.2), H + 0.03, (i % 2 - 0.5) * 0.1], [1, 0.6, 1]); }
    return new Prop(g);
  },

  // 거둔 보물 (삼하 8:7–11): 하닷에셀 신하들의 금 방패, 놋 더미, 은과 금 그릇. 바닥의 깔개 위에
  treasure(o = {}) {
    const g = new THREE.Group(), gold = mat('#d8a830', { metalness: 0.7, roughness: 0.3 }), bronze = mat('#a8703a', { metalness: 0.55, roughness: 0.45 }), silver = mat('#cfd2d4', { metalness: 0.7, roughness: 0.3 });
    mesh(new THREE.BoxGeometry(0.62, 0.008, 0.36), mat('#7a2a20', { roughness: 1 }), g, [0, 0.004, 0]).receiveShadow = true;
    // 금 방패: 비스듬히 세운 둥근 방패들
    for (let i = 0; i < 5; i++) {
      const s = mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.012, 20), gold, g, [-0.2 + i * 0.07, 0.08, -0.1]); s.rotation.x = Math.PI / 2 - 0.35; s.rotation.z = (i - 2) * 0.08;
      mesh(sphere(0.016, 8, 6), gold, g, [-0.2 + i * 0.07, 0.085, -0.093]);
    }
    // 놋 더미와 그릇
    mesh(sphere(0.09, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), bronze, g, [0.18, 0.008, 0.06], [1.2, 0.6, 1]);
    [[-0.12, 0.08, silver], [0.0, 0.1, gold], [0.06, 0.03, silver]].forEach(([x, z, m]) => {
      mesh(new THREE.CylinderGeometry(0.035, 0.022, 0.04, 14), m, g, [x, 0.028, z]);
    });
    mesh(new THREE.CylinderGeometry(0.018, 0.03, 0.09, 12), bronze, g, [0.27, 0.05, -0.08]);
    return new Prop(g);
  },
});

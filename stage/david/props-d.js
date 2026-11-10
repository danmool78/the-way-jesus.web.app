/* 다윗 여정 묶음 d(d31–d39)에만 쓰는 소품과 인물 — props.js의 MAKERS, people.js의 TYPES에 더한다 (공용 파일을 키우지 않게).
   크기는 사람 키(약 0.88)와의 비례로. 무대 x는 오른쪽(+, 동쪽), z는 앞(+, 화면 아래) */
import { THREE, mat, DS, lathe, mesh, sphere, glowTexture, damp } from '../kit.js';
import { MAKERS, Prop } from '../props.js';
import { TYPES } from '../people.js';

Object.assign(TYPES, {
  // 머리를 가리고 맨발로 감람산을 오르는 왕 (삼하 15:30): 금관 대신 붉은 겉옷 빛 머릿수건
  davidH:  { ...TYPES.davidK, crown: false, hood: '#8a2e24', band: '#d6a93a' },
  // 가드 사람 잇대 (삼하 15:19): 블레셋 결(맨 윗몸·깃털 관·띠 갑옷)에 청색 띠 — 다윗 편의 이방 장수
  ittai:   { robe: '#c9b28a', trim: '#2f4f6a', cloth: '#e6dcc4', hair: '#1d140c', beard: true, bare: true, kilt: true, armor: '#a88a4a', plume: '#d8c49a', spear: true, skin: 3, height: 0.98 },
  // 압살롬의 군대 장관 아마사 (삼하 17:25): 압살롬의 청록 겉옷 빛
  amasa:   { robe: '#4a4a3a', trim: '#2f6a5a', mantle: '#2f6a5a', hair: '#2b1b10', beard: true, cap: '#7a5a34', armor: '#8a7a54', spear: true, sash: '#2f6a5a', skin: 2 },
  // 사독의 아들 아히마아스 (삼하 18:19) — 달리는 젊은이, 망토 없는 짧은 옷
  ahimaaz: { robe: '#e8e0cc', trim: '#2f4f8a', hair: '#2b1b10', sash: '#2f4f8a', skin: 2, height: 0.9 },
  // 구스 사람 (삼하 18:21): 흰 옷에 붉은 띠, 짙은 얼굴
  cushite: { robe: '#efe9da', trim: '#9d3328', hair: '#140e0a', beard: true, sash: '#9d3328', skin: 3, height: 0.94 },
  // 수넴 여자 아비삭 (왕상 1:3): 늘씬한 젊은 여인
  abishag: { robe: '#a8665a', trim: '#d6a93a', mantle: '#e8dcc0', veil: true, inner: '#f6efe2', skin: 2, soft: true, slim: true, sash: '#d6a93a' },
  // 여호야다의 아들 브나야 (왕상 1:38): 왕의 호위대장 — 놋 흉갑과 칼
  benaiah: { robe: '#3e4a5a', trim: '#d6a93a', mantle: '#7a2a20', hair: '#1d140c', beard: true, cap: '#a88a4a', capMetal: true, armor: '#a88a4a', sword: true, sash: '#d6a93a', skin: 1, height: 1.02 },
  // 랍바에서 온 암몬 사람 소비 (삼하 17:27): 감아 올린 머릿수건과 짙은 남빛 옷
  shobi:   { robe: '#3a3a5a', trim: '#c9a24a', mantle: '#a8805a', hair: '#1d140c', beard: true, turban: '#c8a878', sash: '#c9a24a', skin: 3 },
  // 백향목을 실어 온 시돈·두로 사람 (대상 22:4): 자줏빛 옷에 흰 머릿수건
  tyrianD: { robe: '#6b2a5e', trim: '#d6a93a', mantle: '#d8c49a', hair: '#1d140c', beard: true, turban: '#efe6d4', sash: '#d6a93a', skin: 2 },
});
// 아비새는 묶음 b가 먼저 만든 것을 쓴다 (없을 때만 — 같은 사람이 장면마다 달라 보이지 않게)
TYPES.abishai ||= { robe: '#6a5236', trim: '#3e2a1a', mantle: '#5a3a24', hair: '#1d140c', beard: true, cap: '#6a4a2a', sword: true, sash: '#3e2a1a', skin: 2, height: 0.96 };

const wood = () => mat('#7a5634', { roughness: 0.95 });
const stoneM = (c = '#c8b896') => mat(c, { roughness: 1, flatShading: true });
const glow = (size, opacity = 1) => {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity }));
  s.scale.set(size, size, 1);
  return s;
};
// show가 커지면 하나씩 차례로 나타난다 (props.js baskets와 같은 방식) — 쌓이고 부려지는 것들
const reveal = (items) => (P) => items.forEach((b, i) => { const k = THREE.MathUtils.clamp(P.show * items.length - i, 0, 1); b.scale.setScalar(Math.max(1e-4, k)); b.visible = k > 0.02; });
const piece = (g, x, z, ry = 0) => { const b = new THREE.Group(); b.position.set(x, 0, z); b.rotation.y = ry; g.add(b); return b; };

Object.assign(MAKERS, {
  // 마하나임 성문 (삼하 18:24): 두 망대 사이의 문길(바깥 문과 안 문 '사이'), 양옆 성벽, 문길 위의 다락방(18:33 — 앞이 트여 안의 사람이 보인다).
  // 문 곁에 왕이 앉는 돌 의자. 성벽 위 파수꾼·다락방의 왕은 배역의 y로 세운다(문길 위 바닥 높이 GH, 성벽 위 WH) — 땅 높이(heightAt)를 주면 문을 지나는 사람이 올라탔다.
  // o.w 전체 너비(기본 2.2)
  gatetower(o = {}) {
    const g = new THREE.Group(), W = o.w || 2.2, st = stoneM('#c8b896'), st2 = stoneM('#b8a684'), dark = mat('#21170e');
    const GW = 0.62, GH = 0.82, GD = 0.4, WH = 0.62, TW = 0.3, TH = 1.0;
    // 문길 덩이와 어두운 문길 (아치 꼴)
    mesh(new THREE.BoxGeometry(GW, GH, GD), st, g, [0, GH / 2, 0]).receiveShadow = true;
    const sh = new THREE.Shape(), w = 0.15, h = 0.56;
    sh.moveTo(-w, 0); sh.lineTo(-w, h - w); sh.absarc(0, h - w, w, Math.PI, 0, true); sh.lineTo(w, 0); sh.lineTo(-w, 0);
    mesh(new THREE.ShapeGeometry(sh, 12), dark, g, [0, 0.003, GD / 2 + 0.003]).castShadow = false;
    // 망대 둘 (성가퀴)
    [-1, 1].forEach(k => {
      const x = k * (GW / 2 + TW / 2 - 0.02);
      mesh(new THREE.BoxGeometry(TW, TH, GD + 0.08), st2, g, [x, TH / 2, 0.02]).receiveShadow = true;
      for (let i = 0; i < 3; i++) mesh(new THREE.BoxGeometry(0.06, 0.06, 0.06), st2, g, [x + (i - 1) * 0.11, TH + 0.03, GD / 2 + 0.03]);
      mesh(new THREE.BoxGeometry(0.03, 0.1, 0.01), dark, g, [x, TH * 0.7, GD / 2 + 0.065]); // 활 쏘는 틈
    });
    // 양옆 성벽 (성가퀴)
    const side = (W - GW - TW * 2) / 2;
    [-1, 1].forEach(k => {
      const x = k * (GW / 2 + TW + side / 2 - 0.04);
      mesh(new THREE.BoxGeometry(side, WH, 0.18), st, g, [x, WH / 2, -0.04]).receiveShadow = true;
      for (let i = 0; i < 7; i++) mesh(new THREE.BoxGeometry(0.05, 0.05, 0.05), st, g, [x - side / 2 + 0.06 + i * (side - 0.12) / 6, WH + 0.025, 0.03]);
    });
    // 문길 위의 다락방: 뒤쪽에 지붕 덮인 방, 앞은 기둥 둘로 트였다 (안이 어두워 보이게 뒷벽은 짙게)
    const room = new THREE.Group(); room.position.set(0, GH, -0.06); g.add(room);
    mesh(new THREE.BoxGeometry(GW - 0.04, 0.4, 0.04), mat('#5a4632'), room, [0, 0.2, -0.12]);
    [-1, 1].forEach(k => mesh(new THREE.BoxGeometry(0.04, 0.4, 0.26), st, room, [k * (GW / 2 - 0.04), 0.2, 0]));
    [-1, 1].forEach(k => mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.4, 6), wood(), room, [k * 0.13, 0.2, 0.12]));
    mesh(new THREE.BoxGeometry(GW + 0.02, 0.04, 0.32), mat('#9a8466', { roughness: 1 }), room, [0, 0.42, 0]);
    mesh(new THREE.BoxGeometry(GW, 0.05, 0.02), st, g, [0, GH + 0.025, GD / 2 - 0.01]); // 다락 앞 낮은 난간
    // 문 곁 돌 의자 (왕이 앉는 자리 — 문길 왼쪽 앞)
    mesh(new THREE.BoxGeometry(0.26, 0.11, 0.12), st2, g, [-0.25, 0.055, GD / 2 + 0.12]).receiveShadow = true;
    return new Prop(g);
  },

  // 던진 돌과 흙먼지 (시므이, 삼하 16:6·13): 던지는 사람 손 높이(o.h)에서 (o.dx, o.dz)쪽으로 돌이 포물선을 그리며 날아가 땅에 떨어지고 흙먼지가 인다.
  // state 'throw'(되풀이) | 'idle'. 돌은 왕의 무리 앞에 떨어진다 — 맞는 모습은 없다. 던지는 사람과 함께 옮기려면 speed를 준다
  stonethrow(o = {}) {
    const g = new THREE.Group(), H = o.h ?? 0.62, DX = o.dx ?? -0.4, DZ = o.dz ?? 0.5, N = 3, PER = 1.6;
    const sm = mat('#8a7a62', { roughness: 1, flatShading: true });
    const stones = Array.from({ length: N }, (_, i) => { const s = mesh(new THREE.DodecahedronGeometry(0.034 + i * 0.006, 0), sm, g); s.visible = false; return s; });
    const dm = () => new THREE.MeshStandardMaterial({ color: '#b8a582', roughness: 1, transparent: true, opacity: 0, depthWrite: false });
    const dust = Array.from({ length: N * 2 }, () => { const d = mesh(sphere(0.06, 10, 8), dm(), g); d.castShadow = false; return d; });
    let k = 0;
    return new Prop(g, (P, t, dt) => {
      k = damp(k, P.state === 'throw' ? 1 : 0, 2, dt);
      stones.forEach((s, i) => {
        const u = ((t + i * PER / N) % PER) / PER, fly = Math.min(1, u / 0.45), land = u > 0.45 ? (u - 0.45) / 0.55 : -1;
        const tx = DX * (0.85 + i * 0.1), tz = DZ * (0.8 + (i % 2) * 0.25);
        s.position.set(tx * fly, H * (1 - fly) + 0.32 * Math.sin(fly * Math.PI) + 0.02, tz * fly);
        s.rotation.set(t * 7, t * 5, 0);
        s.visible = k > 0.3 && P.show > 0.5;
        // 떨어진 자리의 흙먼지, 손에서 흩뿌린 흙
        [dust[i * 2], dust[i * 2 + 1]].forEach((d, j) => {
          const v = j === 0 ? land : (u < 0.35 ? u / 0.35 : -1);
          if (v < 0) { d.visible = false; return; }
          d.visible = true;
          if (j === 0) d.position.set(tx, 0.04 + v * 0.08, tz); else d.position.set(DX * 0.15 * v, H * 0.9 + v * 0.12, DZ * 0.1 * v);
          d.scale.setScalar(0.7 + v * 2.0); d.material.opacity = k * P.show * 0.5 * Math.sin(v * Math.PI);
        });
      });
    }, { state: o.state || 'idle', fade: 'none' });
  },

  // 마하나임에 부린 물건 (삼하 17:28–29): o.kind 'wares'(침상·대야·질그릇) | 'food'(밀·보리 자루, 볶은 곡식·콩 바구니, 꿀 항아리, 치즈).
  // show가 커지면 하나씩 차례로 내려놓인다
  provisions(o = {}) {
    const g = new THREE.Group(), items = [];
    const clay = mat('#b5653e', { roughness: 0.9 }), clay2 = mat('#c98a5a', { roughness: 0.9 }), bronze = mat('#b0803a', { metalness: 0.55, roughness: 0.4 });
    const sack = mat('#cbb48a', { roughness: 1 }), sack2 = mat('#b89a6a', { roughness: 1 });
    if (o.kind === 'food') {
      [[-0.28, -0.06, sack], [-0.15, -0.1, sack2], [-0.22, 0.06, sack2]].forEach(([x, z, m]) => { // 자루
        const b = piece(g, x, z); items.push(b);
        mesh(new THREE.CapsuleGeometry(0.055, 0.07, 4, 10), m, b, [0, 0.09, 0], [1, 1, 0.9]);
        mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.03, 8), m, b, [0, 0.19, 0]);
      });
      [[0.0, 0.0, '#d6b46a'], [0.14, -0.08, '#7a4a2a'], [0.12, 0.08, '#a8402a']].forEach(([x, z, c]) => { // 바구니: 볶은 곡식·콩·팥
        const b = piece(g, x, z); items.push(b);
        mesh(new THREE.CylinderGeometry(0.06, 0.045, 0.06, 14, 1, true), mat('#9a7442', { ...DS, roughness: 0.95 }), b, [0, 0.03, 0]);
        mesh(sphere(0.056, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat(c, { roughness: 1 }), b, [0, 0.05, 0], [1, 0.45, 1]);
      });
      { const b = piece(g, 0.28, -0.04); items.push(b); // 꿀·엉긴 젖 항아리
        mesh(lathe([[0.001, 0], [0.04, 0], [0.06, 0.06], [0.055, 0.12], [0.03, 0.15], [0.032, 0.17], [0.001, 0.17]], 16), clay, b);
        mesh(lathe([[0.001, 0], [0.03, 0], [0.045, 0.05], [0.04, 0.09], [0.025, 0.11], [0.001, 0.11]], 16), clay2, b, [0.08, 0, 0.06]); }
      { const b = piece(g, 0.3, 0.12); items.push(b); // 치즈 덩이
        [0, 1, 2].forEach(i => mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.025, 14), mat('#efe2b8', { roughness: 0.8 }), b, [(i % 2) * 0.03, 0.013 + i * 0.026, 0])); }
    } else {
      { const b = piece(g, -0.12, -0.04); items.push(b); // 침상: 나무 틀에 깔개와 겹친 담요
        mesh(new THREE.BoxGeometry(0.42, 0.03, 0.18), wood(), b, [0, 0.09, 0]);
        [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, c]) => mesh(new THREE.BoxGeometry(0.025, 0.09, 0.025), wood(), b, [a * 0.19, 0.045, c * 0.075]));
        mesh(new THREE.BoxGeometry(0.4, 0.025, 0.16), mat('#c9b48c', { roughness: 1 }), b, [0, 0.118, 0]);
        mesh(new THREE.BoxGeometry(0.2, 0.03, 0.17), mat('#6a4a7a', { roughness: 1 }), b, [0.08, 0.14, 0]); }
      [[0.2, -0.08], [0.24, 0.08]].forEach(([x, z]) => { // 놋 대야
        const b = piece(g, x, z); items.push(b);
        mesh(lathe([[0.001, 0], [0.04, 0], [0.07, 0.035], [0.075, 0.045], [0.068, 0.045], [0.001, 0.012]], 18), bronze, b);
      });
      [[0.38, -0.02, 0.9], [0.46, 0.1, 1.1], [0.36, 0.16, 0.8], [0.02, 0.14, 0.9]].forEach(([x, z, s], i) => { // 질그릇
        const b = piece(g, x, z); items.push(b);
        mesh(lathe([[0.001, 0], [0.035, 0], [0.055, 0.05], [0.05, 0.1], [0.026, 0.13], [0.03, 0.145], [0.001, 0.145]], 16), i % 2 ? clay2 : clay, b, [0, 0, 0], [s, s, s]);
      });
    }
    g.traverse(m => { if (m.isMesh) m.receiveShadow = true; });
    return new Prop(g, reveal(items), { fade: 'none' });
  },

  // 큰 돌무더기 (삼하 18:17): 숲속 구덩이 위에 쌓은 돌. show가 커지면 아래부터 쌓여 오른다
  cairn(o = {}) {
    const g = new THREE.Group(), items = [], m = stoneM('#9a8c74'), m2 = stoneM('#b0a28a'), R = o.r || 0.26;
    for (let i = 0; i < 26; i++) {
      const layer = i < 12 ? 0 : i < 20 ? 1 : i < 24 ? 2 : 3, n = [12, 8, 4, 2][layer], j = [0, 12, 20, 24][layer], a = (i - j) / n * Math.PI * 2 + layer;
      const r = R * [0.85, 0.6, 0.32, 0.1][layer], b = piece(g, Math.cos(a) * r, Math.sin(a) * r * 0.8); items.push(b);
      mesh(new THREE.DodecahedronGeometry(0.055 - layer * 0.004, 0), i % 3 ? m : m2, b, [0, 0.04 + layer * 0.075, 0], [1.2, 0.8, 1]).receiveShadow = true;
    }
    return new Prop(g, reveal(items), { fade: 'none' });
  },

  // 늙은 왕의 침상 (왕상 1:1·47): 나무 틀에 깔개, 겹겹이 덮은 담요와 베개. 앉은 사람은 배역 y로 (자리 높이 약 0.16)
  couch(o = {}) {
    const g = new THREE.Group(), w = mat('#6a4428', { roughness: 0.8 }), gold = mat('#d6a93a', { metalness: 0.5, roughness: 0.4 });
    mesh(new THREE.BoxGeometry(0.62, 0.04, 0.3), w, g, [0, 0.11, 0]);
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, b]) => mesh(new THREE.BoxGeometry(0.035, 0.11, 0.035), w, g, [a * 0.28, 0.055, b * 0.13]));
    mesh(new THREE.BoxGeometry(0.035, 0.2, 0.3), w, g, [-0.3, 0.19, 0]); // 머리 쪽 판
    mesh(new THREE.BoxGeometry(0.04, 0.02, 0.32), gold, g, [-0.3, 0.29, 0]);
    mesh(new THREE.BoxGeometry(0.6, 0.03, 0.28), mat('#efe6d2', { roughness: 1 }), g, [0, 0.145, 0]);
    mesh(new THREE.CapsuleGeometry(0.04, 0.14, 4, 10), mat('#f6f1e6', { roughness: 1 }), g, [-0.22, 0.18, 0]).rotation.x = Math.PI / 2; // 베개
    mesh(new THREE.BoxGeometry(0.34, 0.035, 0.3), mat('#6a4a7a', { roughness: 1 }), g, [0.13, 0.17, 0.005]); // 겹친 담요
    mesh(new THREE.BoxGeometry(0.3, 0.03, 0.31), mat('#a8312a', { roughness: 1 }), g, [0.15, 0.195, 0.005]);
    g.traverse(m => { if (m.isMesh) m.receiveShadow = true; });
    return new Prop(g);
  },

  // 성전을 위해 쌓아 둔 것 (대상 22:2–4·29:2–7): o.kind 'stone'(다듬은 돌) | 'cedar'(백향목) | 'bronze'(놋과 쇠) | 'gold'(금과 은).
  // show가 커지면 하나씩 쌓인다
  stockpile(o = {}) {
    const g = new THREE.Group(), items = [], kind = o.kind || 'stone';
    if (kind === 'stone') {
      const m = mat('#e2d6bc', { roughness: 0.9 }), m2 = mat('#d4c6a6', { roughness: 0.9 });
      [[-1, 0, 0], [0, 0, 0], [1, 0, 0], [-0.5, 1, 0], [0.5, 1, 0], [0, 2, 0], [-1, 0, 1], [0, 0, 1], [1, 0, 1]].forEach(([c, r, d], i) => {
        const b = piece(g, c * 0.15, (d - 0.5) * 0.13); items.push(b);
        mesh(new THREE.BoxGeometry(0.14, 0.08, 0.12), i % 2 ? m : m2, b, [0, 0.04 + r * 0.082, 0]).receiveShadow = true;
      });
    } else if (kind === 'cedar') {
      const m = mat('#8a4a2a', { roughness: 0.85 }), end = mat('#c98a5a', { roughness: 0.9 });
      [[-0.09, 0], [0, 0], [0.09, 0], [-0.045, 1], [0.045, 1], [0, 2]].forEach(([z, r]) => {
        const b = piece(g, 0, z * 1.4); items.push(b);
        const L = mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.62, 10), m, b, [0, 0.05 + r * 0.08, 0]); L.rotation.z = Math.PI / 2; L.receiveShadow = true;
        mesh(new THREE.CircleGeometry(0.045, 10), end, b, [0.311, 0.05 + r * 0.08, 0]).rotation.y = Math.PI / 2;
      });
    } else if (kind === 'bronze') {
      const br = mat('#b0743a', { metalness: 0.6, roughness: 0.4 }), fe = mat('#5a5652', { metalness: 0.5, roughness: 0.5 });
      for (let i = 0; i < 10; i++) { // 놋 덩이 (달 수 없을 만큼)
        const r = i < 5 ? 0 : i < 8 ? 1 : 2, c = i < 5 ? i - 2 : i < 8 ? i - 6 : i - 8.5, b = piece(g, c * 0.09, 0, (i % 2) * 0.15); items.push(b);
        mesh(new THREE.BoxGeometry(0.08, 0.035, 0.16), br, b, [0, 0.018 + r * 0.036, 0]);
      }
      [[0.32, 0.0], [0.34, 0.1]].forEach(([x, z]) => { const b = piece(g, x, z); items.push(b); // 쇠못 꾸러미
        for (let i = 0; i < 5; i++) mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.1, 5), fe, b, [(i - 2) * 0.014, 0.01, 0]).rotation.x = Math.PI / 2; });
    } else { // 금과 은 (오빌의 금 삼천 달란트, 은 칠천 달란트)
      const au = mat('#e0b040', { metalness: 0.75, roughness: 0.28 }), ag = mat('#d8d8d4', { metalness: 0.75, roughness: 0.3 });
      for (let i = 0; i < 12; i++) {
        const silver = i >= 6, j = i % 6, r = j < 3 ? 0 : j < 5 ? 1 : 2, c = j < 3 ? j - 1 : j < 5 ? j - 3.5 : 0;
        const b = piece(g, c * 0.09 + (silver ? 0.3 : 0), 0); items.push(b);
        mesh(new THREE.BoxGeometry(0.08, 0.035, 0.12), silver ? ag : au, b, [0, 0.018 + r * 0.036, 0]);
      }
      const h = glow(0.6, 0.35); h.position.set(0.15, 0.12, 0.05); g.add(h);
    }
    return new Prop(g, reveal(items), { fade: 'none' });
  },

  // 떠오르는 해 (삼하 23:4 '구름 없는 아침에 돋는 해'): 동쪽(오른쪽) 뒤 낮은 하늘의 해와 번지는 빛. state 'low' | 'rise'(아주 천천히 오른다)
  sunrise(o = {}) {
    const g = new THREE.Group(), disc = new THREE.Group(); g.add(disc);
    const core = mesh(sphere(0.1, 18, 14), new THREE.MeshBasicMaterial({ color: '#fff0c4', transparent: true }), disc); core.castShadow = false;
    const halo = glow(1.4, 0.8); disc.add(halo);
    const wide = glow(1.9, 0.3); disc.add(wide);
    const light = new THREE.PointLight('#ffd9a0', 0, 5, 1.2); disc.add(light);
    const Y0 = o.y0 ?? 0.15, Y1 = o.y1 ?? 1.25;
    disc.position.y = Y0;
    return new Prop(g, (P, t, dt) => {
      disc.position.y = damp(disc.position.y, P.state === 'rise' ? Y1 : Y0, 0.18, dt);
      const up = (disc.position.y - Y0) / (Y1 - Y0);
      core.material.opacity = P.show; halo.material.opacity = P.show * (0.6 + up * 0.35); wide.material.opacity = P.show * (0.2 + up * 0.25);
      light.intensity = P.show * (0.6 + up * 1.2);
    }, { state: o.state || 'low', fade: 'opacity' });
  },
});

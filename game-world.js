/* 순례 게임의 세계 (game.js가 쓴다): 입체 땅, 장소마다 작은 마을 디오라마, 예루살렘·애굽 모형, 살아 있는 풍경(양 떼·낙타 대상·배·새), 낮과 밤.
   지도 한 칸이 너무 평평하고 심심했다(사용자 2026-11) — 앱의 3D 지형 자료(assets/terrain/<지역>-height.png·-color.webp, terrain.js와 같은 것)로
   땅을 솟게 하고, 3D 무대 소품(stage/props.js)으로 마을을 세운다. 단위는 game.js와 같은 km(1단위 = 1km, 북쪽이 -z) */
import { THREE } from './stage/kit.js';
import { makeProp } from './stage/props.js';
import { buildJerusalem, EXTENT as JLM } from './stage/jerusalem.js';
import { MODELS as EGYPT } from './stage/egypt.js';

// 지형 지역 (terrain.js의 TREG와 같게). fade: 가장자리를 해수면으로 풀어 바깥 평평한 바탕과 턱 없이 잇는 쪽
const TREG = {
  galilee: { lat0: 32.55, lat1: 33.45, lng0: 35.0, lng1: 35.95, fade: 'ne' },
  judea: { lat0: 30.96, lat1: 32.55, lng0: 35.0, lng1: 35.95, fade: 'se' },
  shephelah: { lat0: 30.96, lat1: 32.55, lng0: 34.2, lng1: 35.0, fade: 'sw' },
  carmel: { lat0: 32.55, lat1: 32.95, lng0: 34.6, lng1: 35.0, fade: 'nw' },
  egypt: { lat0: 29.8, lat1: 31.35, lng0: 30.95, lng1: 32.65, fade: 'nswe' },
  sinai: { lat0: 28.2, lat1: 29.8, lng0: 32.65, lng1: 35.6, fade: 'swe', wild: 1 },
  negev: { lat0: 29.8, lat1: 30.95, lng0: 32.65, lng1: 35.6, fade: 'nwe', wild: 1 },
};
export const EXAG = 4;               // 높이 과장 (인형이 크게 서 있어 실제 높이로는 땅이 납작해 보였다)
const KM = m => m / 1000 * EXAG;     // 고도(m) → 높이(km 단위)
// 호수 수면 고도(m) — 땅이 솟은 만큼 물도 그 높이에
export const LAKE_LEVEL = { galilee: KM(-210) + 0.04, dead: KM(-395) + 0.04, hula: KM(72) + 0.04 };
// 강 물길 [위도, 경도] — app.js의 GEO에서 그대로 옮겼다 (게임은 app.js를 싣지 않는다)
const RIVERS = {
  jordanN: [[33.299,35.6318],[33.29,35.6258],[33.281,35.6206],[33.272,35.6206],[33.263,35.6214],[33.254,35.6226],[33.245,35.6246],[33.236,35.6222],[33.227,35.617],[33.218,35.6156],[33.209,35.6156],[33.2,35.6156],[33.191,35.6156],[33.182,35.6158],[33.173,35.6164],[33.164,35.6166],[33.155,35.6172],[33.146,35.6176],[33.137,35.6176],[33.128,35.6178],[33.119,35.6184],[33.11,35.6194],[33.101,35.6206],[33.092,35.6206],[33.083,35.6206],[33.074,35.6216],[33.065,35.6252],[33.056,35.628],[33.047,35.6288],[33.038,35.6298],[33.029,35.63],[33.02,35.6288],[33.011,35.629],[33.002,35.6276],[32.993,35.6262],[32.984,35.6266],[32.975,35.6262],[32.966,35.625],[32.957,35.6252],[32.948,35.6258],[32.939,35.625],[32.93,35.6234],[32.921,35.6224],[32.912,35.6212],[32.903,35.6206],[32.893,35.6]],
  jordanS: [[32.708,35.572],[32.699,35.5664],[32.69,35.5632],[32.681,35.559],[32.672,35.56],[32.663,35.5646],[32.654,35.5666],[32.645,35.5662],[32.636,35.5654],[32.627,35.5654],[32.618,35.5678],[32.609,35.5694],[32.6,35.5716],[32.591,35.5748],[32.582,35.576],[32.573,35.5754],[32.564,35.5736],[32.555,35.5714],[32.546,35.5672],[32.537,35.562],[32.528,35.561],[32.519,35.5614],[32.51,35.5636],[32.501,35.568],[32.492,35.5714],[32.483,35.5712],[32.474,35.571],[32.465,35.5704],[32.456,35.5688],[32.447,35.5666],[32.438,35.5646],[32.429,35.56],[32.42,35.558],[32.411,35.558],[32.402,35.558],[32.393,35.558],[32.384,35.558],[32.375,35.558],[32.366,35.558],[32.357,35.5572],[32.348,35.5564],[32.339,35.556],[32.33,35.556],[32.321,35.5576],[32.312,35.5606],[32.303,35.561],[32.294,35.5622],[32.285,35.5626],[32.276,35.5614],[32.267,35.562],[32.258,35.5638],[32.249,35.5638],[32.24,35.5632],[32.231,35.563],[32.222,35.563],[32.213,35.563],[32.204,35.563],[32.195,35.5626],[32.186,35.5604],[32.177,35.5554],[32.168,35.5518],[32.159,35.551],[32.15,35.551],[32.141,35.5504],[32.132,35.5498],[32.123,35.5476],[32.114,35.5426],[32.105,35.54],[32.096,35.54],[32.087,35.5396],[32.078,35.5374],[32.069,35.5348],[32.06,35.5322],[32.051,35.5276],[32.042,35.5236],[32.033,35.523],[32.024,35.5232],[32.015,35.5242],[32.006,35.5268],[31.997,35.5312],[31.988,35.5364],[31.979,35.5402],[31.97,35.5412],[31.961,35.5418],[31.952,35.542],[31.943,35.542],[31.934,35.5394],[31.925,35.5332],[31.916,35.5278],[31.907,35.5278],[31.898,35.5336],[31.889,35.5368],[31.88,35.5394],[31.871,35.5416],[31.862,35.5422],[31.853,35.5428],[31.844,35.5434],[31.835,35.544],[31.826,35.544],[31.817,35.5438],[31.808,35.5438],[31.799,35.5466],[31.79,35.548],[31.781,35.55],[31.775,35.556]],
  nile: [[29.15,31.18],[29.5,31.22],[29.85,31.26],[30.06,31.23],[30.18,31.13]],
  canopic: [[30.18,31.13],[30.5,30.85],[30.8,30.55],[31.1,30.25],[31.32,30.07]],
  rosetta: [[30.18,31.13],[30.6,30.95],[30.95,30.78],[31.2,30.55],[31.46,30.37]],
  damietta: [[30.18,31.13],[30.5,31.2],[30.8,31.25],[31.05,31.42],[31.3,31.65],[31.52,31.84]],
  pelusiac: [[30.18,31.13],[30.45,31.4],[30.57,31.51],[30.75,31.75],[30.9,32.1],[31.04,32.55]]
};
// 강 반폭(km, 인형 크기에 맞춰 과장) — 요단은 북쪽 끝에서 가늘게 시작해 넓어진다
const RIVER_W = { jordanN: 0.35, jordanS: 0.45, nile: 0.9 }, RIVER_SRC = { jordanN: 0.25 };
const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })(); // 늘 같은 배치

export function createWorld({ scene, renderer, toXZ, regions: want, places, journeyId, wet = () => false }) {
  const regs = want.map(name => {
    const r = TREG[name], [X0, Z0] = toXZ(r.lat1, r.lng0), [X1, Z1] = toXZ(r.lat0, r.lng1);
    return { name, ...r, X0, Z0, X1, Z1, H: null };
  });
  const regionAt = (x, z) => regs.find(r => r.H && x >= r.X0 && x <= r.X1 && z >= r.Z0 && z <= r.Z1);
  function heightAt(x, z) {
    const r = regionAt(x, z); if (!r) return 0;
    const u = (x - r.X0) / (r.X1 - r.X0) * (r.hw - 1), v = (z - r.Z0) / (r.Z1 - r.Z0) * (r.hh - 1);
    const i = Math.min(r.hw - 2, Math.max(0, Math.floor(u))), j = Math.min(r.hh - 2, Math.max(0, Math.floor(v))), fu = u - i, fv = v - j, H = r.H, w = r.hw;
    return (H[j * w + i] * (1 - fu) + H[j * w + i + 1] * fu) * (1 - fv) + (H[(j + 1) * w + i] * (1 - fu) + H[(j + 1) * w + i + 1] * fu) * fv;
  }
  const loadImg = src => new Promise((ok, no) => { const im = new Image(); im.onload = () => ok(im); im.onerror = no; im.src = src; });
  async function loadRegion(r) {
    const [hImg, cImg] = await Promise.all([loadImg(`assets/terrain/${r.name}-height.png`), loadImg(`assets/terrain/${r.name}-color.webp`)]);
    const sw = hImg.width, sh = hImg.height, cv = document.createElement('canvas'); cv.width = sw; cv.height = sh;
    const cx = cv.getContext('2d', { willReadFrequently: true }); cx.drawImage(hImg, 0, 0);
    const d = cx.getImageData(0, 0, sw, sh).data;
    // 폰에서도 가볍게: 세 칸에 하나씩만 꼭짓점으로 (약 200m 간격 — 이 배율에서는 충분히 매끄럽다)
    const step = 3, hw = Math.floor((sw - 1) / step) + 1, hh = Math.floor((sh - 1) / step) + 1, H = new Float32Array(hw * hh);
    const band = 0.07, ease = v => v * v * (3 - 2 * v), F = r.fade;
    for (let j = 0; j < hh; j++) for (let i = 0; i < hw; i++) {
      const k = (j * step * sw + i * step) * 4, v = d[k] * 256 + d[k + 1];
      const e = Math.min(F.includes('w') ? i / (hw - 1) : 1, F.includes('e') ? 1 - i / (hw - 1) : 1, F.includes('n') ? j / (hh - 1) : 1, F.includes('s') ? 1 - j / (hh - 1) : 1);
      H[j * hw + i] = v === 0 ? -0.3 : KM(v / 10 - 500) * ease(Math.min(1, e / band)); // 바다는 수면 밑으로
    }
    Object.assign(r, { H, hw, hh });
    const geo = new THREE.PlaneGeometry(r.X1 - r.X0, r.Z1 - r.Z0, hw - 1, hh - 1);
    geo.rotateX(-Math.PI / 2); geo.translate((r.X0 + r.X1) / 2, 0, (r.Z0 + r.Z1) / 2);
    const pos = geo.attributes.position;
    for (let k = 0; k < hw * hh; k++) pos.setY(k, H[k]);
    geo.computeVertexNormals();
    const tex = new THREE.Texture(cImg); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = renderer.capabilities.getMaxAnisotropy(); tex.needsUpdate = true;
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 }));
    scene.add(m);
  }

  /* ---------- 마을 디오라마 ---------- */
  const deco = new THREE.Group(); scene.add(deco);
  const SC = 1.05; // 소품 배율 (인형과 어울리게 — 인형을 줄이며 함께 줄였다)
  const houseGeo = new THREE.BoxGeometry(1, 1, 1), roofGeo = new THREE.BoxGeometry(1.08, 0.06, 1.08);
  const houseM = new THREE.MeshStandardMaterial({ color: '#d8c49c', roughness: 0.95 }), roofM = new THREE.MeshStandardMaterial({ color: '#a98f68', roughness: 1 });
  const treeGeo = new THREE.IcosahedronGeometry(1, 0), treeM = new THREE.MeshStandardMaterial({ color: '#7d8f55', roughness: 1, flatShading: true, emissive: '#2a3418', emissiveIntensity: 0.5 });
  const trunkGeo = new THREE.CylinderGeometry(0.05, 0.08, 1, 5), trunkM = new THREE.MeshStandardMaterial({ color: '#6b4f36', roughness: 1 });
  const lights = []; // 밤에 켜지는 마을 불빛
  const wells = [];  // 물병을 채우는 우물 [x, z]
  const cityBox = (() => { const [x0, z0] = toXZ(JLM.lat1, JLM.lng0), [x1, z1] = toXZ(JLM.lat0, JLM.lng1), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2; return { cx, cz, r: Math.max(x1 - x0, z1 - z0) * 1.6 }; })();
  function buildVillages() {
    const spots = [], trees = [], built = [];
    // 마을은 사람이 사는 곳에만, 서로 7km 안이면 하나만 — 갈릴리 바닷가처럼 장소가 몰린 곳에서 집이 겹겹이 쌓여
    // 호수와 이름을 다 덮었다(PC 화면, 사용자 2026-11). 산·들판·바다·광야 같은 곳은 집 없이 둔다
    // 이름에 '광야'가 없어도 광야·진 친 곳(모세 여정의 머문 자리들), 굴·숲·샘·타작마당, 지방 이름(베레아)도 집 없이 (사용자 2026-11)
    // 강 위(물길 반폭 + 여유)에도 집·나무를 두지 않는다 — 나일 물길 위에 집이 섰다(2026-11)
    const rv = Object.entries(RIVERS).map(([k, l]) => [RIVER_W[k] ?? 0.4, l.map(([la, ln]) => toXZ(la, ln))]);
    const onRiver = (x, z) => rv.some(([w, P]) => P.some((p, i) => { if (!i) return false; const q = P[i - 1], dx = p[0] - q[0], dz = p[1] - q[1], L = dx * dx + dz * dz || 1, t = Math.max(0, Math.min(1, ((x - q[0]) * dx + (z - q[1]) * dz) / L)); return Math.hypot(x - q[0] - dx * t, z - q[1] - dz * t) < w + 0.5; }));
    const wild = /바다|바닷가|산$|산 |언덕|들판|광야|강$|강 |강가|한가운데|동굴|굴$|숲|샘|시냇가|타작마당|평지|길$|물가|호수|사막|골짜기|베레아|미디안|마라|르비딤|기브롯|가데스|부논|숙곳|싯딤/;
    Object.entries(places).forEach(([k, p], n) => {
      if (p.hidden || k === 'sea' || p.lat == null || wild.test(p.name)) return;
      const [x0, z0] = toXZ(p.lat, p.lng);
      if (regs.some(r => r.wild && x0 >= r.X0 && x0 <= r.X1 && z0 >= r.Z0 && z0 <= r.Z1)) return; // 시내·네게브 광야 지역에는 마을이 없다
      if (wet(x0, z0) || built.some(([x, z]) => Math.hypot(x - x0, z - z0) < 7)) return;
      if (journeyId !== 'david' && Math.hypot(x0 - cityBox.cx, z0 - cityBox.cz) < cityBox.r) return; // 예루살렘은 도성 모형이 대신 (다윗 때는 예수 때 도성이 아니라 마을로)
      built.push([x0, z0]);
      const big = /성|도성|가버나움|세겜|여리고|가이사랴|애굽|헤브론/.test(p.name) ? 1.4 : 1;
      // 우물은 마을 어귀(집들이 서는 둘레 바깥)에 두고, 그 둘레에는 집을 짓지 않는다 — 한가운데 두니 집 상자에 가려 보이지 않았다(사용자)
      let wa = rnd() * 6.283, wd = 4.2 * Math.sqrt(big), well = n % 3 === 0 ? [x0 + Math.cos(wa) * wd, z0 + Math.sin(wa) * wd] : null;
      if (well && (wet(...well) || onRiver(...well))) well = null;
      // 집은 작게, 마을 가운데 가까이 (집이 인형만큼 커서 마을이 산처럼 보였다). 물 위에는 짓지 않는다
      const cnt = Math.round((5 + rnd() * 4) * big);
      for (let i = 0; i < cnt; i++) {
        const a = rnd() * 6.283, d = (0.8 + rnd() * 2.2) * Math.sqrt(big), x = x0 + Math.cos(a) * d, z = z0 + Math.sin(a) * d;
        if (wet(x, z) || onRiver(x, z) || well && Math.hypot(x - well[0], z - well[1]) < 2.4) continue;
        spots.push([x, z, (0.7 + rnd() * 0.5) * SC * 0.38, rnd() * 3]);
      }
      for (let i = 0; i < 5; i++) { const a = rnd() * 6.283, d = 3.4 + rnd() * 3, x = x0 + Math.cos(a) * d, z = z0 + Math.sin(a) * d; if (wet(x, z) || onRiver(x, z) || well && Math.hypot(x - well[0], z - well[1]) < 2) continue; trees.push([x, z, (0.5 + rnd() * 0.5) * SC * 0.26]); }
      // 마을마다 불빛 하나 (밤에 보인다), 셋에 하나꼴로 우물
      lights.push([x0, z0]);
      if (well) wells.push(well);
    });
    const hm = new THREE.InstancedMesh(houseGeo, houseM, spots.length), rm = new THREE.InstancedMesh(roofGeo, roofM, spots.length), o = new THREE.Object3D(), c = new THREE.Color();
    spots.forEach(([x, z, s, ry], i) => {
      const y = heightAt(x, z);
      o.position.set(x, y + s * 0.42, z); o.rotation.set(0, ry, 0); o.scale.set(s, s * 0.85, s * (0.8 + rnd() * 0.4)); o.updateMatrix(); hm.setMatrixAt(i, o.matrix);
      hm.setColorAt(i, c.set('#d8c49c').multiplyScalar(0.85 + rnd() * 0.25));
      o.position.y = y + s * 0.85 + 0.02; o.scale.y = 1; o.updateMatrix(); rm.setMatrixAt(i, o.matrix);
    });
    const tm = new THREE.InstancedMesh(treeGeo, treeM, trees.length), km = new THREE.InstancedMesh(trunkGeo, trunkM, trees.length);
    trees.forEach(([x, z, s], i) => {
      const y = heightAt(x, z);
      o.rotation.set(0, rnd() * 6, 0); o.position.set(x, y + s * 1.1, z); o.scale.set(s, s * 0.85, s); o.updateMatrix(); tm.setMatrixAt(i, o.matrix);
      tm.setColorAt(i, c.set('#7d8f55').multiplyScalar(0.8 + rnd() * 0.35));
      o.position.set(x, y + s * 0.4, z); o.scale.set(s, s * 0.8, s); o.updateMatrix(); km.setMatrixAt(i, o.matrix);
    });
    deco.add(hm, rm, tm, km);
    wells.forEach(([x, z]) => { const P = makeProp('well', x, z, { scale: SC * 1.7 }); P.obj.position.y = heightAt(x, z); deco.add(P.obj); });
    // 불빛: 밤에 밝아지는 작은 점들
    const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(lights.flatMap(([x, z]) => [x, heightAt(x, z) + 1.4, z]), 3));
    // 둥글게 번지는 빛 (그냥 점은 네모로 그려져 흰 종이처럼 보였다 — 사용자 캡처)
    const gc = document.createElement('canvas'); gc.width = gc.height = 64; const gx = gc.getContext('2d'), gr = gx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,230,170,1)'); gr.addColorStop(0.35, 'rgba(255,190,90,.55)'); gr.addColorStop(1, 'rgba(255,170,60,0)'); gx.fillStyle = gr; gx.fillRect(0, 0, 64, 64);
    lampPts = new THREE.Points(lg, new THREE.PointsMaterial({ map: new THREE.CanvasTexture(gc), color: '#ffffff', size: 2.2, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
    deco.add(lampPts);
  }
  let lampPts = null;
  // 앱의 3D 모형(지도 단위 1 = 1/1000도)을 km로 옮겨 세운다. 인형이 크게 서 있어 모형도 boost배 키운다 (가운데를 제자리에 두고)
  function addModel(group, E, boost) {
    const [x0, z0] = toXZ(E.lat1, E.lng0), [x1, z1] = toXZ(E.lat0, E.lng1), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    const unit = 0.1113 * boost, w = (x1 - x0) / 0.1113, dz = (z1 - z0) / 0.1113;
    // 모형의 건물 높이는 실제 크기라 과장한 땅(EXAG배)에 묻혔다 — 높이도 그만큼 키우고, 틀 안에서 가장 높은 땅 위에 앉힌다
    group.scale.set(unit, unit * EXAG * 1.2, unit);
    let top = 0; for (let i = 0; i <= 8; i++) for (let j = 0; j <= 8; j++) top = Math.max(top, heightAt(cx + (i / 8 - 0.5) * w * unit, cz + (j / 8 - 0.5) * dz * unit));
    group.position.set(cx - w / 2 * unit, top * 0.85, cz - dz / 2 * unit);
    deco.add(group);
  }

  /* ---------- 살아 있는 풍경 ---------- */
  const life = [];
  function buildLife() {
    const ks = Object.entries(places).filter(([k, p]) => !p.hidden && p.lat != null && k !== 'sea');
    // 양 떼: 마을 둘레의 들판을 천천히 거닌다
    for (let f = 0; f < Math.min(8, ks.length); f++) {
      const [, p] = ks[Math.floor(rnd() * ks.length)], [x0, z0] = toXZ(p.lat, p.lng), cx = x0 + (rnd() - 0.5) * 16, cz = z0 + (rnd() - 0.5) * 16;
      if (wet(cx, cz)) continue;
      for (let i = 0; i < 5; i++) {
        const P = makeProp('sheep', cx + (rnd() - 0.5) * 3, cz + (rnd() - 0.5) * 3, { scale: SC * 0.75 }); P.speed = 0.25; P.directional = true;
        life.push({ P, home: [cx, cz], r: 3, wait: rnd() * 6 }); deco.add(P.obj);
      }
    }
    // 낙타 대상: 두 장소 사이를 오간다
    for (let c = 0; c < 3 && ks.length > 3; c++) {
      const a = ks[Math.floor(rnd() * ks.length)][1], b = ks[Math.floor(rnd() * ks.length)][1], A = toXZ(a.lat, a.lng), B = toXZ(b.lat, b.lng);
      if (Math.hypot(A[0] - B[0], A[1] - B[1]) < 25) continue;
      // 물을 건너는 길이면 대상을 두지 않는다 (낙타가 갈릴리 바다 위를 걸었다)
      if ([...Array(24)].some((_, i) => wet(A[0] + (B[0] - A[0]) * i / 23, A[1] + (B[1] - A[1]) * i / 23))) continue;
      for (let i = 0; i < 3; i++) {
        const P = makeProp('camel', A[0] - i * 1.6, A[1], { scale: SC * 0.5 }); P.speed = 1.6; P.directional = true;
        life.push({ P, route: [A, B], leg: 1, lag: i * 1.6 }); deco.add(P.obj);
      }
    }
    // 갈릴리 바다의 고기잡이배
    if (regs.some(r => r.name === 'galilee')) [[32.84, 35.57], [32.80, 35.6], [32.87, 35.6]].forEach(([la, ln]) => {
      const [x, z] = toXZ(la, ln), P = makeProp('boat', x, z, { scale: SC * 0.75 }); P.speed = 0.4;
      P.obj.position.y = LAKE_LEVEL.galilee; life.push({ P, home: [x, z], r: 3, wait: rnd() * 5, boat: true }); deco.add(P.obj);
    });
    // 새 떼: 하늘을 맴도는 작은 V자들
    const bg = new THREE.BufferGeometry(), v = [];
    for (let i = 0; i < 30; i++) v.push(-0.4, 0, -0.2, 0, 0, 0.1, 0, 0, 0.1, 0.4, 0, -0.2);
    bg.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
    birds = new THREE.LineSegments(bg, new THREE.LineBasicMaterial({ color: '#2a2218', transparent: true, opacity: 0.6 }));
    birds.userData.off = Array.from({ length: 30 }, () => [rnd() * 6, (rnd() - 0.5) * 12, (rnd() - 0.5) * 12, 0.8 + rnd() * 0.6]);
    deco.add(birds);
  }
  let birds = null;
  const ENV = { wave: 0.3, waveNow: 0.3, rainNow: 0 }; // 소품이 무대에서 받던 물결·비 (잔잔한 날)
  function updateLife(t, dt, me) {
    for (const L of life) {
      const P = L.P;
      if (L.route) { // 대상: 끝에 닿으면 돌아선다
        const [A, B] = L.route, T = L.leg ? B : A;
        P.goal.set(T[0] - L.lag, T[1]);
        if (Math.hypot(P.obj.position.x - P.goal.x, P.obj.position.z - P.goal.y) < 0.5) L.leg = 1 - L.leg;
      } else if ((L.wait -= dt) < 0) { // 떼·배: 둘레에서 이따금 자리를 옮긴다
        L.wait = 3 + rnd() * 6; P.goal.set(L.home[0] + (rnd() - 0.5) * 2 * L.r, L.home[1] + (rnd() - 0.5) * 2 * L.r);
      }
      P.update(t, dt, ENV);
      P.obj.position.y = L.boat ? LAKE_LEVEL.galilee : heightAt(P.obj.position.x, P.obj.position.z);
    }
    if (birds && me) { // 내 둘레 하늘에서 맴돈다
      const p = birds.geometry.attributes.position, off = birds.userData.off;
      for (let i = 0; i < 30; i++) {
        const [ph, ox, oz, sp] = off[i], a = t * 0.25 * sp + ph, fl = Math.sin(t * 6 * sp + ph) * 0.25;
        const cx = me.x + ox + Math.cos(a) * 14, cz = me.y + oz + Math.sin(a) * 14, cy = 9 + Math.sin(a * 2) * 1.5;
        // 인형을 줄이며 새도 작게 (날개 반폭 0.18km)
        p.setXYZ(i * 4, cx - 0.18, cy + fl * 0.5, cz - 0.09); p.setXYZ(i * 4 + 1, cx, cy, cz + 0.05); p.setXYZ(i * 4 + 2, cx, cy, cz + 0.05); p.setXYZ(i * 4 + 3, cx + 0.18, cy + fl * 0.5, cz - 0.09);
      }
      p.needsUpdate = true;
    }
  }

  /* ---------- 낮과 밤 ---------- */
  // 하루(30km)를 걷는 동안 아침 → 낮 → 저녁 → 밤이 한 바퀴. 밤에는 마을 불빛과 달빛
  const hemi = new THREE.HemisphereLight(0xfff4dc, 0x8a7350, 1.6), sun = new THREE.DirectionalLight(0xfff0d0, 2.2);
  sun.position.set(-3, 6, 4); scene.add(hemi, sun);
  const DAY = new THREE.Color('#2a2218'), NIGHT = new THREE.Color('#0d1222'), DUSK = new THREE.Color('#4a2c22'), sky = new THREE.Color();
  function setTime(f) { // f: 하루 가운데 위치 0~1 (0 = 새벽)
    // +0.6: 밤은 하루의 3분의 1쯤만
    const day = Math.max(0, Math.sin(f * Math.PI * 2 - 0.3) * 1.15 + 0.6), dusk = Math.max(0, 1 - Math.abs(f - 0.5) * 8) + Math.max(0, 1 - Math.abs(f - 0.02) * 10) * 0.6;
    const k = Math.min(1, day);
    hemi.intensity = 0.85 + 0.75 * k; sun.intensity = 0.55 + 1.65 * k; // 밤도 길과 땅이 보일 만큼은 밝게 (너무 어두웠다 — PC 캡처)
    hemi.color.setRGB(0.75 + 0.25 * k, 0.8 + 0.16 * k, 0.95 - 0.1 * k); sun.color.setRGB(1, 0.75 + 0.2 * k, 0.6 + 0.3 * k);
    sky.copy(NIGHT).lerp(DAY, k).lerp(DUSK, Math.min(0.6, dusk * 0.6));
    scene.background = sky; if (scene.fog) scene.fog.color.copy(sky);
    if (lampPts) lampPts.material.opacity = Math.max(0, 1 - k * 1.6);
    return k;
  }

  /* ---------- 강: 땅을 따라 굽는 물빛 띠 (앱 3D 지형의 terrain.js와 같은 방식) ---------- */
  // 양쪽 물가와 가운데 가운데 가장 낮은 높이에 수면을 둬 비탈을 타고 오르지 않게. 불러온 지역 안의 강만
  function buildRivers() {
    const M = new THREE.MeshStandardMaterial({ color: '#5a8fa0', roughness: 0.3, metalness: 0.1, side: THREE.DoubleSide });
    for (const [k, line] of Object.entries(RIVERS)) {
      const ps = line.map(([la, ln]) => { const [x, z] = toXZ(la, ln); return new THREE.Vector3(x, 0, z); });
      if (!ps.some(p => regionAt(p.x, p.z))) continue;
      const base = new THREE.CatmullRomCurve3(ps), half = RIVER_W[k] ?? 0.4, n = line.length * 16, pos = [], idx = [];
      for (let i = 0; i <= n; i++) {
        const t = i / n, c = base.getPointAt(t), d = base.getTangentAt(t), w = half * (RIVER_SRC[k] ? Math.min(1, 0.3 + t / RIVER_SRC[k]) : 1), nx = -d.z * w, nz = d.x * w;
        const y = Math.min(heightAt(c.x + nx, c.z + nz), heightAt(c.x - nx, c.z - nz), heightAt(c.x, c.z)) + 0.03;
        pos.push(c.x + nx, y, c.z + nz, c.x - nx, y, c.z - nz);
        if (i) { const j = 2 * i; idx.push(j - 2, j - 1, j, j - 1, j + 1, j); }
      }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
      deco.add(new THREE.Mesh(g, M));
    }
  }

  const ready = Promise.all(regs.map(r => loadRegion(r).catch(() => null))).then(() => {
    buildRivers(); buildVillages(); buildLife();
    if (journeyId !== 'david' && journeyId !== 'moses') addModel(buildJerusalem(), JLM, 3); // 인형을 줄이며 도성도 (6배는 베들레헴까지 덮었다)
    if (regs.some(r => r.name === 'egypt')) Object.values(EGYPT).forEach(m => addModel(m.build(), m.extent, 1.5));
  });
  return { ready, heightAt, update: updateLife, setTime, wells };
}

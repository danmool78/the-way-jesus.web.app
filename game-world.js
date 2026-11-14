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
const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })(); // 늘 같은 배치

export function createWorld({ scene, renderer, toXZ, regions: want, places, journeyId }) {
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
    // 폰에서도 가볍게: 두 칸에 하나씩만 꼭짓점으로
    const step = 2, hw = Math.floor((sw - 1) / step) + 1, hh = Math.floor((sh - 1) / step) + 1, H = new Float32Array(hw * hh);
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
  const SC = 3.2; // 소품 배율 (인형과 어울리게)
  const houseGeo = new THREE.BoxGeometry(1, 1, 1), roofGeo = new THREE.BoxGeometry(1.08, 0.06, 1.08);
  const houseM = new THREE.MeshStandardMaterial({ color: '#d8c49c', roughness: 0.95 }), roofM = new THREE.MeshStandardMaterial({ color: '#a98f68', roughness: 1 });
  const treeGeo = new THREE.IcosahedronGeometry(1, 0), treeM = new THREE.MeshStandardMaterial({ color: '#7d8f55', roughness: 1, flatShading: true, emissive: '#2a3418', emissiveIntensity: 0.5 });
  const trunkGeo = new THREE.CylinderGeometry(0.05, 0.08, 1, 5), trunkM = new THREE.MeshStandardMaterial({ color: '#6b4f36', roughness: 1 });
  const lights = []; // 밤에 켜지는 마을 불빛
  const wells = [];  // 물병을 채우는 우물 [x, z]
  const cityBox = (() => { const [x0, z0] = toXZ(JLM.lat1, JLM.lng0), [x1, z1] = toXZ(JLM.lat0, JLM.lng1), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2; return { cx, cz, r: Math.max(x1 - x0, z1 - z0) * 1.6 }; })();
  function buildVillages() {
    const spots = [], trees = [];
    Object.entries(places).forEach(([k, p], n) => {
      if (p.hidden || k === 'sea' || p.lat == null) return;
      const [x0, z0] = toXZ(p.lat, p.lng);
      if (journeyId !== 'david' && Math.hypot(x0 - cityBox.cx, z0 - cityBox.cz) < cityBox.r) return; // 예루살렘은 도성 모형이 대신 (다윗 때는 예수 때 도성이 아니라 마을로)
      const big = /성|도성|가버나움|세겜|여리고|가이사랴|애굽|헤브론/.test(p.name) ? 1.6 : 1;
      const cnt = Math.round((6 + rnd() * 5) * big);
      for (let i = 0; i < cnt; i++) {
        const a = rnd() * 6.283, d = (1.2 + rnd() * 3.2) * Math.sqrt(big), x = x0 + Math.cos(a) * d, z = z0 + Math.sin(a) * d;
        spots.push([x, z, (0.7 + rnd() * 0.5) * SC * 0.55, rnd() * 3]);
      }
      for (let i = 0; i < 6; i++) { const a = rnd() * 6.283, d = 4 + rnd() * 4, x = x0 + Math.cos(a) * d, z = z0 + Math.sin(a) * d; trees.push([x, z, (0.5 + rnd() * 0.5) * SC * 0.3]); }
      // 마을마다 불빛 하나 (밤에 보인다), 셋에 하나꼴로 우물
      lights.push([x0, z0]);
      if (n % 3 === 0) wells.push([x0 + 3.5, z0 + 2.5]);
    });
    const hm = new THREE.InstancedMesh(houseGeo, houseM, spots.length), rm = new THREE.InstancedMesh(roofGeo, roofM, spots.length), o = new THREE.Object3D(), c = new THREE.Color();
    spots.forEach(([x, z, s, ry], i) => {
      const y = Math.max(0, heightAt(x, z));
      o.position.set(x, y + s * 0.42, z); o.rotation.set(0, ry, 0); o.scale.set(s, s * 0.85, s * (0.8 + rnd() * 0.4)); o.updateMatrix(); hm.setMatrixAt(i, o.matrix);
      hm.setColorAt(i, c.set('#d8c49c').multiplyScalar(0.85 + rnd() * 0.25));
      o.position.y = y + s * 0.85 + 0.02; o.scale.y = 1; o.updateMatrix(); rm.setMatrixAt(i, o.matrix);
    });
    const tm = new THREE.InstancedMesh(treeGeo, treeM, trees.length), km = new THREE.InstancedMesh(trunkGeo, trunkM, trees.length);
    trees.forEach(([x, z, s], i) => {
      const y = Math.max(0, heightAt(x, z));
      o.rotation.set(0, rnd() * 6, 0); o.position.set(x, y + s * 1.1, z); o.scale.set(s, s * 0.85, s); o.updateMatrix(); tm.setMatrixAt(i, o.matrix);
      tm.setColorAt(i, c.set('#7d8f55').multiplyScalar(0.8 + rnd() * 0.35));
      o.position.set(x, y + s * 0.4, z); o.scale.set(s, s * 0.8, s); o.updateMatrix(); km.setMatrixAt(i, o.matrix);
    });
    deco.add(hm, rm, tm, km);
    wells.forEach(([x, z]) => { const P = makeProp('well', x, z, { scale: SC * 2.2 }); P.obj.position.y = Math.max(0, heightAt(x, z)); deco.add(P.obj); });
    // 불빛: 밤에 밝아지는 작은 점들
    const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(lights.flatMap(([x, z]) => [x, Math.max(0, heightAt(x, z)) + 1.6, z]), 3));
    lampPts = new THREE.Points(lg, new THREE.PointsMaterial({ color: '#ffcf7a', size: 1.6, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
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
      for (let i = 0; i < 5; i++) {
        const P = makeProp('sheep', cx + (rnd() - 0.5) * 3, cz + (rnd() - 0.5) * 3, { scale: SC * 1.1 }); P.speed = 0.25; P.directional = true;
        life.push({ P, home: [cx, cz], r: 3, wait: rnd() * 6 }); deco.add(P.obj);
      }
    }
    // 낙타 대상: 두 장소 사이를 오간다
    for (let c = 0; c < 3 && ks.length > 3; c++) {
      const a = ks[Math.floor(rnd() * ks.length)][1], b = ks[Math.floor(rnd() * ks.length)][1], A = toXZ(a.lat, a.lng), B = toXZ(b.lat, b.lng);
      if (Math.hypot(A[0] - B[0], A[1] - B[1]) < 25) continue;
      for (let i = 0; i < 3; i++) {
        const P = makeProp('camel', A[0] - i * 2.5, A[1], { scale: SC * 0.8 }); P.speed = 1.6; P.directional = true;
        life.push({ P, route: [A, B], leg: 1, lag: i * 2.5 }); deco.add(P.obj);
      }
    }
    // 갈릴리 바다의 고기잡이배
    if (regs.some(r => r.name === 'galilee')) [[32.84, 35.57], [32.80, 35.6], [32.87, 35.6]].forEach(([la, ln]) => {
      const [x, z] = toXZ(la, ln), P = makeProp('boat', x, z, { scale: SC * 1.4 }); P.speed = 0.4;
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
      P.obj.position.y = L.boat ? LAKE_LEVEL.galilee : Math.max(0, heightAt(P.obj.position.x, P.obj.position.z));
    }
    if (birds && me) { // 내 둘레 하늘에서 맴돈다
      const p = birds.geometry.attributes.position, off = birds.userData.off;
      for (let i = 0; i < 30; i++) {
        const [ph, ox, oz, sp] = off[i], a = t * 0.25 * sp + ph, fl = Math.sin(t * 6 * sp + ph) * 0.25;
        const cx = me.x + ox + Math.cos(a) * 14, cz = me.y + oz + Math.sin(a) * 14, cy = 9 + Math.sin(a * 2) * 1.5;
        p.setXYZ(i * 4, cx - 0.4, cy + fl, cz - 0.2); p.setXYZ(i * 4 + 1, cx, cy, cz + 0.1); p.setXYZ(i * 4 + 2, cx, cy, cz + 0.1); p.setXYZ(i * 4 + 3, cx + 0.4, cy + fl, cz - 0.2);
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
    const day = Math.max(0, Math.sin(f * Math.PI * 2 - 0.3) * 1.15), dusk = Math.max(0, 1 - Math.abs(f - 0.5) * 8) + Math.max(0, 1 - Math.abs(f - 0.02) * 10) * 0.6;
    const k = Math.min(1, day);
    hemi.intensity = 0.45 + 1.15 * k; sun.intensity = 0.25 + 1.95 * k;
    hemi.color.setRGB(0.75 + 0.25 * k, 0.8 + 0.16 * k, 0.95 - 0.1 * k); sun.color.setRGB(1, 0.75 + 0.2 * k, 0.6 + 0.3 * k);
    sky.copy(NIGHT).lerp(DAY, k).lerp(DUSK, Math.min(0.6, dusk * 0.6));
    scene.background = sky; if (scene.fog) scene.fog.color.copy(sky);
    if (lampPts) lampPts.material.opacity = Math.max(0, 1 - k * 1.6);
    return k;
  }

  const ready = Promise.all(regs.map(r => loadRegion(r).catch(() => null))).then(() => {
    buildVillages(); buildLife();
    if (journeyId !== 'david' && journeyId !== 'moses') addModel(buildJerusalem(), JLM, 6);
    if (regs.some(r => r.name === 'egypt')) Object.values(EGYPT).forEach(m => addModel(m.build(), m.extent, 2));
  });
  return { ready, heightAt, update: updateLife, setTime, wells };
}

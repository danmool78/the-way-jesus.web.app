/* 거리 무대(stage/street/)의 공통 도구: 축척, 결이 있는 재질(캔버스로 그린 돌·회벽·포석·흙), 상자·여럿 그리기.
   세트(gate.js·field.js)와 부품(parts.js)이 함께 쓴다 */
import { THREE, mat, mesh } from '../kit.js';

export const M = 0.52; // 1m

/* ---------- 결이 있는 재질: 캔버스로 그린 돌·회벽·포석 ----------
   상자 그대로는 장난감처럼 보였다 — 돌 줄눈과 얼룩만 있어도 크기가 실감 난다 */
let seed = 11;
// 세트마다 처음 씨앗을 정해 그릴 때마다 같은 배치가 나오게 한다
export const reseed = n => { seed = n; };
export const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const texCache = new Map();
export function canvasTex(key, size, draw) {
  if (texCache.has(key)) return texCache.get(key);
  const c = document.createElement('canvas'); c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  texCache.set(key, t);
  return t;
}
export const shade = (hex, k) => { const c = new THREE.Color(hex); c.offsetHSL(0, (rnd() - 0.5) * 0.04, k); return '#' + c.getHexString(); };
// 다듬은 돌을 줄지어 쌓은 벽 (성벽·성문): 한 장이 가로 4m × 세로 4m
export function ashlar(base) {
  return canvasTex('ashlar' + base, 512, (g, S) => {
    g.fillStyle = shade(base, -0.12); g.fillRect(0, 0, S, S);
    const rows = 8, rh = S / rows;
    for (let r = 0; r < rows; r++) {
      let x = -rnd() * 80;
      while (x < S) {
        const w = 70 + rnd() * 90;
        g.fillStyle = shade(base, (rnd() - 0.5) * 0.09);
        g.fillRect(x + 3, r * rh + 3, w - 6, rh - 6);
        // 돌 가장자리를 쪼아 낸 테두리(드래프트) — 이스라엘 왕국 시대 마름돌의 특징
        g.strokeStyle = 'rgba(255,255,255,.10)'; g.lineWidth = 3; g.strokeRect(x + 7, r * rh + 7, w - 14, rh - 14);
        for (let k = 0; k < 14; k++) { g.fillStyle = `rgba(0,0,0,${rnd() * 0.06})`; g.fillRect(x + rnd() * w, r * rh + rnd() * rh, 3 + rnd() * 8, 2 + rnd() * 6); }
        if (x + w > S) { g.fillStyle = shade(base, (rnd() - 0.5) * 0.09); g.fillRect(x + 3 - S, r * rh + 3, w - 6, rh - 6); }
        x += w;
      }
    }
  });
}
// 회칠한 벽 (집): 얼룩과 흙빛 번짐, 아래쪽은 빗물에 더 어둡게
export function plaster(base) {
  return canvasTex('plaster' + base, 256, (g, S) => {
    g.fillStyle = base; g.fillRect(0, 0, S, S);
    for (let k = 0; k < 900; k++) {
      g.fillStyle = `rgba(${rnd() < 0.5 ? '90,70,40' : '255,250,235'},${rnd() * 0.07})`;
      const r = 2 + rnd() * 14; g.beginPath(); g.arc(rnd() * S, rnd() * S, r, 0, 7); g.fill();
    }
  });
}
// 거친 돌 기초 (집 아랫단)
export function rubble(base) {
  return canvasTex('rubble' + base, 256, (g, S) => {
    g.fillStyle = shade(base, -0.18); g.fillRect(0, 0, S, S);
    for (let k = 0; k < 70; k++) {
      g.fillStyle = shade(base, (rnd() - 0.5) * 0.14);
      const x = rnd() * S, y = rnd() * S, w = 18 + rnd() * 30, h = 12 + rnd() * 18;
      g.beginPath(); g.ellipse(x, y, w / 2, h / 2, rnd() * 0.5, 0, 7); g.fill();
    }
  });
}
// 광장 바닥: 크고 작은 판돌을 깐 길 (판돌 사이로 흙)
export function paving(base) {
  return canvasTex('paving' + base, 512, (g, S) => {
    g.fillStyle = '#9c8564'; g.fillRect(0, 0, S, S);
    for (let y = 0; y < S; y += 46) for (let x = -rnd() * 40; x < S; x += 50 + rnd() * 40) {
      g.fillStyle = shade(base, (rnd() - 0.5) * 0.12);
      const w = 44 + rnd() * 34, h = 38 + rnd() * 6;
      g.beginPath(); g.roundRect(x + 2, y + 2, w - 4, h - 4, 6); g.fill();
      g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect(x + 6, y + 6, w - 14, 4);
    }
  });
}
// 상자 UV를 실제 크기로: 면마다 위치에서 UV를 다시 매겨, 크기가 다른 벽도 돌 크기가 같게 보인다
// off: 상자의 자리 — 세상 좌표로 매겨야 맞붙은 두 상자(성문 탑과 통로 위)의 돌 줄이 이어진다 (따로 매기면 이음매에 줄이 어긋나 금처럼 보였다)
export function worldUV(geo, tile, [ox, oy, oz] = [0, 0, 0]) {
  const p = geo.attributes.position, n = geo.attributes.normal, uv = geo.attributes.uv;
  for (let i = 0; i < p.count; i++) {
    const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), X = p.getX(i) + ox, Y = p.getY(i) + oy, Z = p.getZ(i) + oz;
    const [u, v] = ax > 0.5 ? [Z, Y] : ay > 0.5 ? [X, Z] : [X, Y];
    uv.setXY(i, u / tile, v / tile);
  }
  return geo;
}
export const texMat = (tex, color = '#ffffff', o = {}) => mat(color, { map: tex, roughness: 0.95, ...o });
// 바닥 위에 덧까는 면(길·축대 윗면): 깊이를 조금 앞으로 당겨 아래 면과 다투지 않게
export const overlay = m => { m.polygonOffset = true; m.polygonOffsetFactor = -2; m.polygonOffsetUnits = -2; return m; };

// 상자 하나: 바닥 가운데 (x, z), 높이 y에서 위로
export function block(parent, m, x, z, w, d, h, y = 0, tile = 4 * M) {
  const o = mesh(worldUV(new THREE.BoxGeometry(w, h, d), tile, [x, y + h / 2, z]), m, parent, [x, y + h / 2, z]);
  o.receiveShadow = true;
  return o;
}
// 나무 들보 끝 (지붕 아래로 삐죽 나온 둥근 나무)
export function beams(parent, x0, x1, y, z, n, r = 0.07, len = 0.25) {
  const w = mat('#5a4330');
  for (let i = 0; i < n; i++) {
    const b = mesh(new THREE.CylinderGeometry(r, r, len, 8), w, parent, [x0 + (x1 - x0) * (i + 0.5) / n, y, z]);
    b.rotation.x = Math.PI / 2;
  }
}
// 성가퀴(톱니 모양 흉벽)
export function merlons(parent, m, x0, x1, z, y, d) {
  const step = 1.5 * M, w = 0.85 * M;
  for (let x = x0 + w / 2; x <= x1 - w / 2 + 1e-6; x += step) block(parent, m, x, z, w, d, 0.9 * M, y);
}


export function soil(base) {
  return canvasTex('soil' + base, 256, (g, S) => {
    g.fillStyle = base; g.fillRect(0, 0, S, S);
    for (let k = 0; k < 1400; k++) {
      g.fillStyle = `rgba(${rnd() < 0.5 ? '80,60,36' : '235,220,190'},${rnd() * 0.12})`;
      g.fillRect(rnd() * S, rnd() * S, 1 + rnd() * 4, 1 + rnd() * 3);
    }
  });
}
// 같은 모양 여럿: 자리 표 [x, z, 크기, 돌림, 기울기]로 InstancedMesh 하나를 만든다 (밀 포기 수천 개를 하나로 그린다)
export function many(parent, geo, m, list, y = 0, shadow = true) {
  const im = new THREE.InstancedMesh(geo, m, list.length), o = new THREE.Object3D();
  list.forEach(([x, z, k = 1, r = 0, tilt = 0, yy = y], i) => {
    o.position.set(x, yy, z); o.rotation.set(tilt * Math.cos(r * 3), r, tilt * Math.sin(r * 3)); o.scale.setScalar(k);
    o.updateMatrix(); im.setMatrixAt(i, o.matrix);
  });
  im.castShadow = shadow; im.receiveShadow = true;
  parent.add(im);
  return im;
}
export const geoUp = (geo, h) => { geo.translate(0, h / 2, 0); return geo; }; // 밑동이 땅에 닿게

export function skyTexture(top = '#9cc2e0', mid = '#dce8ee', low = '#f3e8d2') {
  return canvasTex('sky' + top + low, 256, (g, S) => {
    const gr = g.createLinearGradient(0, 0, 0, S);
    gr.addColorStop(0, top); gr.addColorStop(0.55, mid); gr.addColorStop(1, low);
    g.fillStyle = gr; g.fillRect(0, 0, S, S);
  });
}


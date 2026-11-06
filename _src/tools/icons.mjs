// 여정마다 설치 아이콘과 설치 정보(manifest): 예수 여정의 금빛 아이콘(assets/icon.svg)을 여정의 테마색(style.css [data-journey])으로 바꿔
// j/<여정>/icon.svg, icon-192.png, icon-512.png, apple-touch-icon.png, manifest.webmanifest를 만든다.
// index.html 머리의 작은 스크립트가 ?j=<여정>이면 이 파일들로 링크를 바꾼다 — 여정마다 홈 화면에 따로 설치된다
// 사용: node _src/tools/icons.mjs [moses david …]   (없으면 아래 표의 모든 여정)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

// 금빛 아이콘의 네 색(밝은 빛, 해, 짙은 테두리, 길) → 여정의 색 (style.css의 --gold2 둘레, --gold, --gold-deep, --gold2)
const GOLD = ['#fcebbb', '#e6c275', '#b1823a', '#f0d79a'];
const J = {
  moses: { name: '그 길 — 모세와 여호수아', short: '그 길 · 모세', c: ['#fbe0c8', '#dc8f5f', '#a65a33', '#f3c29c'] },
  david: { name: '그 길 — 다윗', short: '그 길 · 다윗', c: ['#eef3d2', '#a9bf6a', '#6f8638', '#d6e3a8'] },
  kings: { name: '그 길 — 열왕기', short: '그 길 · 열왕기', c: ['#efe6fb', '#b99ade', '#7c58a8', '#ddcdf3'] },
  paul: { name: '그 길 — 바울', short: '그 길 · 바울', c: ['#e1f1fb', '#70b5da', '#3e7fa8', '#bbdff3'] },
  psalms: { name: '그 길 — 시편', short: '그 길 · 시편', c: ['#e0f4f0', '#5fb3a5', '#2f7d70', '#b5e0d8'] },
  proverbs: { name: '그 길 — 잠언', short: '그 길 · 잠언', c: ['#fbe6ef', '#d98fb0', '#a2547a', '#f2c8da'] },
  goodnews: { name: 'GoodNews', short: 'GoodNews', c: ['#fde6e2', '#e58a7f', '#a8473f', '#f4c3bb'] },
};
const base = readFileSync('assets/icon.svg', 'utf8'), man = JSON.parse(readFileSync('manifest.webmanifest', 'utf8'));
const ids = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(J);
const b = await chromium.launch(); const p = await b.newPage();
for (const id of ids) {
  const j = J[id], dir = `j/${id}/`; mkdirSync(dir, { recursive: true });
  let svg = base; GOLD.forEach((g, i) => { svg = svg.replaceAll(new RegExp(g, 'gi'), j.c[i]); });
  writeFileSync(dir + 'icon.svg', svg);
  for (const [f, n] of [['icon-192.png', 192], ['icon-512.png', 512], ['apple-touch-icon.png', 180]]) {
    await p.setViewportSize({ width: n, height: n });
    // PNG는 모서리 없이 꽉 채운다 — 홈 화면이 저마다 모양대로 깎는다 (예수 여정의 PNG와 같게)
    const s = svg.replace(/rx="112"/, 'rx="0"');
    await p.setContent(`<style>html,body{margin:0;background:transparent}</style><img src="data:image/svg+xml;base64,${Buffer.from(s).toString('base64')}" width="${n}" height="${n}" style="display:block">`);
    await p.waitForTimeout(100);
    await p.screenshot({ path: dir + f, omitBackground: true });
  }
  // 같은 사이트 안의 다른 앱: id와 시작 주소를 여정 주소로 — 예수 여정과 따로 설치된다
  writeFileSync(dir + 'manifest.webmanifest', JSON.stringify({ ...man, id: `/?j=${id}`, name: j.name, short_name: j.short, start_url: `/app.html?j=${id}`, scope: '/',
    icons: [{ src: `/${dir}icon.svg`, sizes: 'any', type: 'image/svg+xml', purpose: 'any' }, { src: `/${dir}icon-192.png`, sizes: '192x192', type: 'image/png' }, { src: `/${dir}icon-512.png`, sizes: '512x512', type: 'image/png' }] }));
  console.log(id, 'ok');
}
await b.close();

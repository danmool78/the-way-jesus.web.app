// 랜딩의 '장면마다 새 놀이' 띠에 넣을 놀이 화면 — python3 -m http.server 8765 를 띄우고 _src/tools/ 밖 임시 폴더에서 node minishots.mjs <여정> (mg/<장면>.png) → 224×280 webp로 assets/land/minis/
import { createRequire } from 'module'; const { chromium } = createRequire('/opt/node22/lib/node_modules/')('playwright');
const SETS = { jesus: ['e11', 'e17', 'e23', 'e42', 'e46', 'e04'], moses: ['m35', 'm02', 'm09', 'm12'], david: ['d05', 'd03', 'd16'], kings: ['k15', 'k26', 'k30'], paul: ['a35', 'a37', 'a04'] };
const J = process.argv[2];
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader'] });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1.5 });
await p.addInitScript(() => { localStorage.setItem('theway-game-me', JSON.stringify({ name: 'a', sex: 'm' })); });
await p.goto(`http://localhost:8765/game.html?j=${J}&debug&lang=ko`); await p.waitForTimeout(3000);
await p.click('#start'); await p.waitForFunction(() => window.__game?.G.patrols, null, { timeout: 150000 });
for (const id of SETS[J]) {
  await p.evaluate(id => __game.mini(id), id); await p.waitForTimeout(1500);
  await p.evaluate(() => document.querySelector('.mpanel .go').click()); await p.waitForTimeout(3500);
  const r = await p.evaluate(() => { const b = document.querySelector('.mhost canvas').getBoundingClientRect(); return { x: b.left, y: b.top, width: b.width, height: b.height }; }); await p.screenshot({ path: `mg/${id}.png`, clip: r }); console.log(id);
  await p.evaluate(() => document.querySelector('.mhost')._close()); await p.waitForTimeout(500);
}
await b.close();

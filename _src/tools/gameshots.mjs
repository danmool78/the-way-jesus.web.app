// 랜딩의 순례 게임 띠에 넣을 실제 게임 화면(지도 걷기·만남·장면 놀이·말씀 카드)을 언어마다 찍는다
// 쓰는 법: python3 -m http.server 8765 를 띄워 두고 node _src/tools/gameshots.mjs <언어> <임시 폴더> [1|2|3] → python3 _src/tools/gameshots.py <임시 폴더>
import { createRequire } from 'module'; const { chromium } = createRequire('/opt/node22/lib/node_modules/')('playwright');
const L = process.argv[2] || 'ko', OUT = process.argv[3], ONLY = process.argv[4];
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader'] });
async function open(idx) {
  const p = await b.newPage({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await p.addInitScript(i => { localStorage.clear(); localStorage.setItem('theway-game-me', JSON.stringify({ name: 'Daniel', sex: 'm' })); localStorage.setItem('theway-game-jesus', JSON.stringify({ idx: i, total: 2400, stars: [], oil: 4, hide: [] })); }, idx);
  await p.goto(`http://localhost:8765/game.html?j=jesus&debug&lang=${L}`); await p.waitForTimeout(3500);
  await p.evaluate(() => document.querySelector('#start').click()); await p.waitForFunction(() => window.__game?.G.patrols, null, { timeout: 150000 }); await p.waitForTimeout(2000);
  return p; }
if (!ONLY || ONLY === '1') { const p = await open(27); await p.evaluate(() => { __game.G.askT = 30; }); await p.waitForTimeout(1200); await p.screenshot({ path: `${OUT}/${L}-1.png` }); await p.close(); }
if (!ONLY || ONLY === '2') { const p = await open(13); await p.evaluate(() => { const [x, z] = __game.standXZ(); __game.G.me.pos.x = x + 1.5; __game.G.me.pos.y = z + 1.5; }); await p.waitForTimeout(1500); await p.evaluate(() => __game.meet()); await p.waitForTimeout(9000); await p.screenshot({ path: `${OUT}/${L}-2.png` }); await p.close(); }
if (!ONLY || ONLY === '3') { const p = await open(27);
  await p.evaluate(() => __game.mini('e28')); await p.waitForTimeout(800); await p.evaluate(() => document.querySelector('.mpanel .go').click()); await p.waitForTimeout(2500);
  await p.screenshot({ path: `${OUT}/${L}-3.png` });
  await p.evaluate(() => document.querySelector('.mhost')._close()); await p.waitForTimeout(800);
  await p.evaluate(() => __game.reveal('e32', 3)); await p.waitForTimeout(2500); await p.screenshot({ path: `${OUT}/${L}-4.png` }); await p.close(); }
await b.close();

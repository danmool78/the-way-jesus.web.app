// 무대 한꺼번에 점검: node _src/tools/stage-audit.cjs <여정> [장면…]   (python3 -m http.server 8765 를 띄워 두고, 장면이 없으면 그 여정 전부)
// 순간마다 대본대로 세우고 화면처럼 1.2초 밀어내게 둔 뒤 __stage.audit()(자세와 상관없이 몸 네모의 겹침·앉을 바닥 없음) + measure()(뜸·묻힘)를 잰다.
// 일부러 붙는 것(타기·높이 앉기·나무 위·누움·십자가, 짐승 끄는 손, 보좌·족쇄·관 곁에 꿇기)은 거른다. 모델은 로컬 _src/models/*.glb로 받는다(사용자 2026-11)
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), ROOT = path.resolve(__dirname, '../..');
let [j, ...ids] = process.argv.slice(2);
if (!ids.length) { const files = j === 'jesus' ? ['stage/scenes.js'] : fs.readdirSync(path.join(ROOT, 'stage', j)).filter(f => /^[a-z]\.js$/.test(f)).map(f => `stage/${j}/${f}`);
  ids = files.flatMap(f => [...fs.readFileSync(path.join(ROOT, f), 'utf8').matchAll(/^  ([a-z]\d\d): \{/gm)].map(m => m[1])).sort(); }
// 일부러 붙는 것: 타기·앉기(높이)·나무 위·누움·십자가·껴안기, 그리고 그런 사람이 기대는 물건, 짐승을 끄는 손(조금)
const HOLD = /^(ride|seat|perch|sleep|topple|crucified|crucified-dead|carry|carry-pole|embrace)/, ON = /(throne|bema|stocks|bier|cage|crosses|donkey|camel|figtree)\)$/;
const skip = a => { if (a[1] === 'no-seat') return false; const [n1, n2, d, p1, p2] = a; const lean = s => HOLD.test(s) || s.includes('@');
  if (lean(p1 || '') || lean(p2 || '')) return true; if (/\((donkey|camel|ox|sheep|garlandox)\)$/.test(n2) && d < 0.09) return true; if (ON.test(n2) && /kneel|mourn|pray/.test(p1 || '')) return true; return false; };
(async () => {
  const order = ks => { const rank = k => { const m = k.match(/^([pw])(\d+)(?:\.(\d+))?$/); return m ? [m[1] === 'p' ? 0 : 1, +m[2], m[3] === undefined ? -1 : +m[3]] : [9, 0, 0]; };
    return ['intro', ...ks.filter(k => !['enter', 'intro', 'end'].includes(k)).sort((a, b) => { const x = rank(a), y = rank(b); return x[0] - y[0] || x[1] - y[1] || x[2] - y[2]; }), 'end']; };
  for (const id of ids) {
    const br = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader'] }); const pg = await br.newPage({ viewport: { width: 900, height: 700 } });
    await pg.route(/models\/([a-z-]+)-[0-9a-f]+\.glb/, r => { const n = r.request().url().match(/models\/([a-z-]+)-[0-9a-f]+\.glb/)[1]; r.fulfill({ path: path.join(ROOT, '_src/models', `${n}.glb`) }); });
    try {
      await pg.goto(`http://127.0.0.1:8765/app.html?j=${j}&models&check#${id}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await pg.waitForFunction(() => window.__stage, null, { timeout: 60000 }); await pg.waitForTimeout(3000);
      for (let i = 0; i < 40 && !(await pg.evaluate(() => window.__stage.ready())); i++) await pg.waitForTimeout(500);
      await pg.waitForTimeout(1500);
      const keys = order(await pg.evaluate(() => window.__stage.beats())); const bad = new Map();
      for (const k of keys) {
        await pg.evaluate(k => window.__stage.step(k), k); await pg.waitForTimeout(1200); const [au, me] = await pg.evaluate(() => [window.__stage.audit(), window.__stage.measure()]);
        for (const a of au) { if (skip(a)) continue; const key = a[1] === 'no-seat' ? `${a[0]} 앉을바닥없음` : `겹침 ${a[0]}~${a[1]}`; if (!bad.has(key)) bad.set(key, [k, a[2]]); }
        for (const x of me) { if (x.gap > 0.03 && x.name !== 'eut') { const key = `${x.name}(${x.pose}) 뜸`; if (!bad.has(key)) bad.set(key, [k, x.gap]); } else if (x.gap < -0.03) { const key = `${x.name}(${x.pose}) 묻힘`; if (!bad.has(key)) bad.set(key, [k, x.gap]); } }
      }
      console.log(id, bad.size ? '\n' + [...bad].map(([k, [b, v]]) => `  ${b} ${k} ${v}`).join('\n') : 'ok');
    } catch (e) { console.log(id, 'ERR', e.message.split('\n')[0]); }
    await br.close().catch(() => {});
  }
})();

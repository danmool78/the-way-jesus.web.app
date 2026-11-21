// 무대 자리 굽기: 장면마다 모든 순간을 대본대로 세워 직육면체로 겹침을 밀어낸 자리를 계산하고(stage.js __stage.bake),
// 그 사람을 그 자리에 세운 대본 줄(stage/scenes.js)의 x·z를 고쳐 쓴다 — 화면에서 매번 밀어내며 미끄러지지 않게(사용자 2026-11)
// 쓰는 법: python3 -m http.server 8765 를 띄워 두고  node _src/tools/bake-positions.cjs [--j paul] [e01 a03 …]   (장면이 없으면 그 여정 전부)
// 대본 파일: 예수 여정은 stage/scenes.js, 다른 여정은 stage/<여정>/*.js 가운데 그 장면이 든 파일(폴더가 없는 여정은 stage/<여정>.js — 모세)
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const argv = process.argv.slice(2), ji = argv.indexOf('--j'), J = ji >= 0 ? argv.splice(ji, 2)[1] : 'jesus';
const ROOT = path.join(__dirname, '../..');
const FILES = J === 'jesus' ? [path.join(ROOT, 'stage/scenes.js')] : !fs.existsSync(path.join(ROOT, 'stage', J)) ? [path.join(ROOT, 'stage', J + '.js')] : fs.readdirSync(path.join(ROOT, 'stage', J)).filter(f => /^[a-z]\.js$|^[a-z]+\.js$/.test(f) && !f.startsWith('props')).map(f => path.join(ROOT, 'stage', J, f));
const fileOf = id => FILES.find(f => fs.readFileSync(f, 'utf8').includes(`  ${id}: {`));
const ids = argv.length ? argv : FILES.flatMap(f => [...fs.readFileSync(f, 'utf8').matchAll(/^  ([a-z]\d\d): \{/gm)].map(m => m[1])).sort();
const order = ks => { const rank = k => { const m = k.match(/^([pw])(\d+)(?:\.(\d+))?$/); return m ? [m[1] === 'p' ? 0 : 1, +m[2], m[3] === undefined ? -1 : +m[3]] : [9, 0, 0]; };
  return ['enter', 'intro', ...ks.filter(k => !['enter', 'intro', 'end'].includes(k)).sort((a, b) => { const x = rank(a), y = rank(b); return x[0] - y[0] || x[1] - y[1] || x[2] - y[2]; }), 'end'].filter(k => ks.includes(k)); };

// 대본 글에서 괄호 짝 찾기 (따옴표 안은 건너뜀)
function close(s, i) { let d = 0, q = null; for (let j = i; j < s.length; j++) { const c = s[j]; if (q) { if (c === q && s[j - 1] !== '\\') q = null; continue; } if (c === "'" || c === '"' || c === '`') q = c; else if (c === '[' || c === '{') d++; else if (c === ']' || c === '}') { d--; if (!d) return j; } } return -1; }
function sceneRange(s, id) { const i = s.indexOf(`  ${id}: {`); if (i < 0) return null; return [i, close(s, s.indexOf('{', i))]; }
function setXZ(cmd, x, z) { // 한 명령(['name', pose, {...}]) 안의 x·z를 고친다 — 없으면 더한다
  let t = cmd;
  const rx = /\bx:\s*-?[\d.]+/, rz = /\bz:\s*-?[\d.]+/;
  if (rx.test(t)) t = t.replace(rx, `x: ${x}`); if (rz.test(t)) t = t.replace(rz, `z: ${z}`);
  if (!rx.test(cmd) && !rz.test(cmd)) { const b = t.lastIndexOf('{'); if (b > 0) t = t.slice(0, b + 1) + ` x: ${x}, z: ${z},` + t.slice(b + 1); else t = t.replace(/\]$/, `, { x: ${x}, z: ${z} }]`); }
  else if (!rz.test(cmd)) t = t.replace(/\bx:\s*-?[\d.]+/, m => `${m}, z: ${z}`);
  else if (!rx.test(cmd)) t = t.replace(/\bz:\s*-?[\d.]+/, m => `x: ${x}, ${m}`);
  return t;
}
function patch(s, id, list) {
  let n = 0;
  for (const p of list) {
    const r = sceneRange(s, id); if (!r) break;
    let block = s.slice(r[0], r[1] + 1);
    if (p.src === 'cast') {
      const re = new RegExp(`(\\b${p.name}:\\s*\\['[^']+',\\s*)(-?[\\d.]+)(,\\s*)(-?[\\d.]+)`);
      if (!re.test(block)) continue; block = block.replace(re, `$1${p.x}$3${p.z}`);
    } else {
      const [k, i] = p.src, key = /^[a-z]\w*$/i.test(k) ? `${k}:` : `'${k}':`;
      const bi = block.indexOf(`      ${key} [`); if (bi < 0) continue;
      const a0 = block.indexOf('[', bi), a1 = close(block, a0);
      let arr = block.slice(a0, a1 + 1), starts = [], j = 1;
      while (j < arr.length) { if (arr[j] === '[') { const e = close(arr, j); starts.push([j, e]); j = e + 1; } else if (arr[j] === '/' && arr[j + 1] === '/') { j = arr.indexOf('\n', j); if (j < 0) break; } else j++; }
      const c = starts[i]; if (!c) continue;
      const cmd = arr.slice(c[0], c[1] + 1); if (!cmd.startsWith(`['${p.name}'`)) continue;
      arr = arr.slice(0, c[0]) + setXZ(cmd, p.x, p.z) + arr.slice(c[1] + 1);
      block = block.slice(0, a0) + arr + block.slice(a1 + 1);
    }
    s = s.slice(0, r[0]) + block + s.slice(r[1] + 1); n++;
  }
  return [s, n];
}

(async () => {
  const br = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader'] });
  let total = 0;
  for (const id of ids) {
    const pg = await br.newPage({ viewport: { width: 900, height: 700 } });
    await pg.route(/(r2\.dev|workers\.dev\/f)\/models\/([a-z-]+)-[0-9a-f]+\.glb/, r => { const n = r.request().url().match(/models\/([a-z-]+)-[0-9a-f]+\.glb/)[1]; r.fulfill({ path: path.join(__dirname, `../models/${n}.glb`), contentType: 'model/gltf-binary' }); });
    try {
      await pg.goto(`http://127.0.0.1:8765/app.html?models&check${J === 'jesus' ? '' : '&j=' + J}#${id}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await pg.waitForFunction(() => window.__stage, null, { timeout: 60000 });
      for (let i = 0; i < 60 && !(await pg.evaluate(() => window.__stage.ready())); i++) await pg.waitForTimeout(500);
      await pg.waitForTimeout(1500);
      const keys = order(await pg.evaluate(() => window.__stage.beats()));
      const res = await pg.evaluate(k => window.__stage.bake(k), keys);
      // 같은 대본 줄이 여러 순간에 걸리면 처음 것만 (처음 고친 자리가 다음 순간에 이어진다)
      const seen = new Set(), list = res.filter(p => { const key = p.name + JSON.stringify(p.src); if (seen.has(key)) return false; seen.add(key); return true; });
      const FILE = fileOf(id); if (!FILE) throw new Error('no script file');
      const [s2, n] = patch(fs.readFileSync(FILE, 'utf8'), id, list); fs.writeFileSync(FILE, s2); total += n;
      console.log(id, n + '/' + list.length, list.map(p => `${p.name}@${p.src === 'cast' ? 'cast' : p.src.join('#')}→(${p.x},${p.z})`).join(' '));
    } catch (e) { console.log(id, 'ERR', e.message.split('\n')[0]); }
    await pg.close();
  }
  await br.close(); console.log('patched', total);
})();

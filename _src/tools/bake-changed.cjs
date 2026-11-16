// 배포 때: 이번에 대본(stage/scenes.js, stage/<여정>/<글자>.js)이 바뀐 장면만 골라 자리 굽기(bake-positions.cjs)를 돌린다
// 쓰는 법: node _src/tools/bake-changed.cjs <이전 커밋>   — 바뀐 장면이 없으면 아무것도 하지 않는다
const { execFileSync, spawnSync } = require('child_process'), fs = require('fs'), path = require('path');
const before = process.argv[2], ROOT = path.join(__dirname, '../..');
const blocks = t => Object.fromEntries([...t.matchAll(/^  ([a-z]\d\d): \{/gm)].map((m, i, all) => [m[1], t.slice(m.index, all[i + 1]?.index ?? t.length)]));
const old = f => { try { return execFileSync('git', ['show', `${before}:${f}`], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64e6 }); } catch { return ''; } };
const files = [['jesus', 'stage/scenes.js'], ...fs.readdirSync(path.join(ROOT, 'stage')).filter(d => fs.statSync(path.join(ROOT, 'stage', d)).isDirectory())
  .flatMap(d => fs.readdirSync(path.join(ROOT, 'stage', d)).filter(f => /^[a-z]\.js$/.test(f)).map(f => [d, `stage/${d}/${f}`]))];
const want = {};
for (const [j, f] of files) { const a = blocks(old(f)), b = blocks(fs.readFileSync(path.join(ROOT, f), 'utf8'));
  for (const id of Object.keys(b)) if (a[id] !== b[id]) (want[j] ||= []).push(id); }
if (!Object.keys(want).length) { console.log('바뀐 장면 없음'); process.exit(0); }
for (const [j, ids] of Object.entries(want)) { console.log(j, ids.join(' '));
  const r = spawnSync('node', [path.join(__dirname, 'bake-positions.cjs'), '--j', j, ...ids], { cwd: ROOT, stdio: 'inherit' }); if (r.status) process.exitCode = r.status; }

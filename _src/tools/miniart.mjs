// 놀이 그림 한꺼번에 만들기: _src/mini-art.json의 목록 중 아직 없는 것만 Gemini로 그려(paint.mjs) 투명 조각/바탕으로 바꾼다(sprite.py)
// 쓰는 법: GEMINI_API_KEY=… node _src/tools/miniart.mjs [장면…] [--force]  → assets/mini/<장면>/<이름>.webp (원본은 _src/mini-art/에, 배포 제외)
// 목록: { "<장면>": { "<이름>": { "bg": true | "h": 420, "p": "그림 설명", "ref": ["_src/cards/saul.png"], "key": "m"(초록 물건이면 자홍 바탕) } } }
import { readFile, mkdir, access } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const run = promisify(execFile), argv = process.argv.slice(2), force = argv.includes('--force'), only = argv.filter(a => !a.startsWith('--'));
const STY = 'Cinematic semi-flat painterly illustration in exactly the style, palette and lighting of the first reference image (game card art): clean shapes, soft painted shading, rich warm light, no text, no letters, no watermark.';
const SPR = 'A single game sprite on a perfectly flat pure green (#00FF00) background, no shadow and no ground drawn, nothing else in the image:';
const spec = JSON.parse(await readFile('_src/mini-art.json', 'utf8')), jobs = [];
const has = f => access(f).then(() => true, () => false);
for (const [scene, items] of Object.entries(spec)) { if (only.length && !only.includes(scene)) continue;
  await mkdir(`assets/mini/${scene}`, { recursive: true }); await mkdir(`_src/mini-art/${scene}`, { recursive: true });
  for (const [name, it] of Object.entries(items)) { const out = `assets/mini/${scene}/${name}.webp`, src = `_src/mini-art/${scene}/${name}.png`;
    if (!force && await has(out)) continue;
    jobs.push(async () => {
      if (force || !await has(src)) { const prompt = it.bg ? `${STY} Portrait game background (4:5). ${it.p}` : `${STY} ${it.key === 'm' ? SPR.replace('pure green (#00FF00)', 'pure magenta (#FF00FF)') : SPR} ${it.p}`;
        for (let k = 0; k < 3; k++) { try { await run('node', ['_src/tools/paint.mjs', src, prompt, '_src/cards/style-ref.png', ...(it.ref || []), '--ratio', it.bg ? '4:5' : (it.ratio || '1:1'), '--size', '1K', '--raw'], { maxBuffer: 1e7 }); break; } catch (e) { if (k === 2) { console.error('실패', scene, name, e.stderr?.slice(0, 200)); return; } } } }
      const r = await run('python3', ['_src/tools/sprite.py', src, out, ...(it.bg ? ['--bg', '800x1000'] : ['--h', String(it.h || 420), ...(it.key ? ['--key', it.key] : [])])]); process.stdout.write(r.stdout);
    }); } }
// 네 개씩 함께
let i = 0; await Promise.all(Array.from({ length: 4 }, async () => { while (i < jobs.length) await jobs[i++](); }));
console.log('끝', jobs.length);

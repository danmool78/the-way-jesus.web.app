// 무리 자리 굽기: node _src/tools/bake-crowds.cjs <여정> [장면…]   (python3 -m http.server 8765 를 띄워 두고)
// 무리(crowd)의 자리(spots)는 작은 인형에 맞춰 촘촘했다 — 모델로 바꾸니 무리 안에서, 또 곁의 배역·기둥과 서로 뚫고 섰다(모세 여정, 사용자 2026-11).
// 장면의 모든 순간을 대본대로 세워 그 무리가 보이는 순간마다 배역(뼈로 잰 몸 네모)·단단한 소품의 자리를 모으고, 무리 자리를 처음 자리에서 되도록
// 덜 옮기면서 그 모두와 서로를 피하게 밀어 벌린 뒤, 대본의 spots를 그 숫자로 바꿔 쓴다(flock(…) 호출도 숫자 배열로).
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), ROOT = path.join(__dirname, '../..');
const [J, ...argIds] = process.argv.slice(2);
const FILES = J === 'jesus' ? [path.join(ROOT, 'stage/scenes.js')] : !fs.existsSync(path.join(ROOT, 'stage', J)) ? [path.join(ROOT, 'stage', J + '.js')]
  : fs.readdirSync(path.join(ROOT, 'stage', J)).filter(f => /^[a-z]\.js$/.test(f)).map(f => path.join(ROOT, 'stage', J, f));
const fileOf = id => FILES.find(f => fs.readFileSync(f, 'utf8').includes(`  ${id}: {`));
const ids = argIds.length ? argIds : FILES.flatMap(f => [...fs.readFileSync(f, 'utf8').matchAll(/^  ([a-z]\d\d): \{/gm)].map(m => m[1])).sort();
const order = ks => { const rank = k => { const m = k.match(/^([pw])(\d+)(?:\.(\d+))?$/); return m ? [m[1] === 'p' ? 0 : 1, +m[2], m[3] === undefined ? -1 : +m[3]] : [9, 0, 0]; };
  return ['intro', ...ks.filter(k => !['enter', 'intro', 'end'].includes(k) && !/^w/.test(k)).sort((a, b) => { const x = rank(a), y = rank(b); return x[0] - y[0] || x[1] - y[1] || x[2] - y[2]; }), 'end'].filter(k => ks.includes(k)); }; // 말씀 순간(w)은 무대에서 돌지 않는다
// 대본 글에서 괄호 짝 찾기 (따옴표 안은 건너뜀)
function close(s, i) { let d = 0, q = null; for (let j = i; j < s.length; j++) { const c = s[j]; if (q) { if (c === q && s[j - 1] !== '\\') q = null; continue; }
  if (c === "'" || c === '"' || c === '`') q = c; else if (c === '[' || c === '{' || c === '(') d++; else if (c === ']' || c === '}' || c === ')') { d--; if (!d) return j; } } return -1; }

(async () => {
  let patched = 0;
  for (const id of ids) {
    const br = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader'] }); const pg = await br.newPage({ viewport: { width: 700, height: 560 } });
    await pg.route(/models\/([a-z-]+)-[0-9a-f]+\.glb/, r => { const n = r.request().url().match(/models\/([a-z-]+)-[0-9a-f]+\.glb/)[1]; r.fulfill({ path: path.join(ROOT, '_src/models', `${n}.glb`) }); });
    try {
      await pg.goto(`http://127.0.0.1:8765/app.html?j=${J}&models&check#${id}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await pg.waitForFunction(() => window.__stage, null, { timeout: 60000 }); await pg.waitForTimeout(2000);
      for (let i = 0; i < 40 && !(await pg.evaluate(() => window.__stage.ready())); i++) await pg.waitForTimeout(500);
      await pg.waitForTimeout(1500);
      const keys = order(await pg.evaluate(() => window.__stage.beats()));
      // 순간마다: 무리의 자리 행렬과 장애물(배역 몸 네모, 단단한 소품 네모)
      const snaps = [];
      for (const k of keys) {
        await pg.evaluate(k => window.__stage.step(k), k);
        snaps.push(await pg.evaluate(async () => {
          const THREE = await import('/assets/vendor/three.module.min.js'), C = await import('/stage/collide.js');
          const A = __stage.actorsDbg(), P = __stage.propsDbg(), v = new THREE.Vector3(), BONE = /(Hips|Spine2|Head|UpLeg|Leg|Foot|ToeBase|Arm|ForeArm|Hand)$/;
          const sg = Object.values(A)[0]?.p.root.parent; if (!sg) return null; sg.updateMatrixWorld(true);
          const obs = [];
          for (const a of Object.values(A)) { if (!a.doll || a.showT < 0.5 || a.p.root.parent !== sg) continue; const r = a.p.root;
            let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity; a.body.traverse(o => { if (!o.isBone || !BONE.test(o.name)) return; r.worldToLocal(o.getWorldPosition(v)); x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x); z0 = Math.min(z0, v.z); z1 = Math.max(z1, v.z); });
            if (x0 === Infinity) continue; const s = r.scale.x, c = new THREE.Vector3((x0 + x1) / 2, 0, (z0 + z1) / 2).applyMatrix4(r.matrix);
            obs.push(C.box(c.x, c.z, r.rotation.y, Math.max(0.03, (x1 - x0) / 2 * s * 0.8) + 0.02, Math.max(0.03, (z1 - z0) / 2 * s * 0.8) + 0.02)); }
          for (const p of Object.values(P)) if (C.SOLID.has(p.kind) && p.show > 0.5) obs.push(...C.propBoxes(p.obj, sg).map(b => ({ ...b, hu: b.hu + 0.02, hv: b.hv + 0.02 })));
          const crowds = {};
          for (const [n, p] of Object.entries(P)) { if (p.kind !== 'crowd' || p.show < 0.5 || !p.obj.visible) continue;
            const m = new THREE.Matrix4().copy(sg.matrixWorld).invert().multiply(p.obj.matrixWorld), e = m.elements;
            crowds[n] = { m: [e[0], e[2], e[8], e[10], e[12], e[14]], yaw: Math.atan2(-e[2], e[0]), rot: p.obj.children.map(c => c.rotation.y), sit: p.state === 'sit' }; }
          return { obs, crowds };
        }));
      }
      // 무리마다 자리 고르기
      const file = fileOf(id); let src = fs.readFileSync(file, 'utf8');
      const a0 = src.indexOf(`  ${id}: {`), a1 = close(src, src.indexOf('{', a0)); let scene = src.slice(a0, a1 + 1);
      const names = [...new Set(snaps.flatMap(s => s ? Object.keys(s.crowds) : []))];
      const results = {};
      for (const n of names) {
        // 대본의 그 무리 줄에서 spots 식을 찾아 계산한다
        const lineAt = scene.search(new RegExp(`\\n\\s+${n}: \\['crowd'`)); if (lineAt < 0) continue;
        const sIdx = scene.indexOf('spots:', lineAt); const lineEnd = close(scene, scene.indexOf('[', lineAt));
        if (sIdx < 0 || sIdx > lineEnd) continue;
        let e0 = sIdx + 'spots:'.length; while (scene[e0] === ' ') e0++;
        const e1 = scene[e0] === '[' ? close(scene, e0) : close(scene, scene.indexOf('(', e0)); const expr = scene.slice(e0, e1 + 1);
        const helpers = src.slice(0, src.search(/^export /m)).replace(/^import [^\n]*$/gm, ''); // 대본 파일 머리의 도우미(flock·row …)
        let spots; try { spots = new Function(helpers + `\nreturn ${expr};`)(); } catch (err) { console.log(id, n, 'spots 식을 못 읽음', expr); continue; }
        const P0 = spots.map(([x, z]) => [x, z]), Pn = spots.map(([x, z]) => [x, z]);
        const beats = snaps.filter(s => s?.crowds[n] && !s.crowds[n].sit);
        if (!beats.length) continue;
        // 상자 겹침 밀어내기 (collide.js push와 같은 셈 — 분리축)
        const box = (cx, cz, yaw, hu, hv) => ({ c: [cx, cz], u: [Math.cos(yaw), -Math.sin(yaw)], v: [Math.sin(yaw), Math.cos(yaw)], hu, hv });
        const push = (a, b) => { const axes = [a.u, a.v, b.u, b.v]; let best = null; const d = [b.c[0] - a.c[0], b.c[1] - a.c[1]];
          for (const ax of axes) { const ra = a.hu * Math.abs(ax[0] * a.u[0] + ax[1] * a.u[1]) + a.hv * Math.abs(ax[0] * a.v[0] + ax[1] * a.v[1]), rb = b.hu * Math.abs(ax[0] * b.u[0] + ax[1] * b.u[1]) + b.hv * Math.abs(ax[0] * b.v[0] + ax[1] * b.v[1]);
            const dd = d[0] * ax[0] + d[1] * ax[1], o = ra + rb - Math.abs(dd); if (o <= 0) return null; if (!best || o < best.o) best = { o, s: dd > 0 ? -1 : 1, ax }; }
          return [best.ax[0] * best.o * best.s, best.ax[1] * best.o * best.s]; };
        const HU = 0.085 * 1.15, HV = 0.055 * 1.15; let worst = 0;
        for (let it = 0; it < 400; it++) {
          worst = 0;
          for (let i = 0; i < Pn.length; i++) {
            let dx = 0, dz = 0;
            for (const s of beats) { const C = s.crowds[n], [a, b, c, d, tx, tz] = C.m; // 무리 → 무대: x' = a x + c z + tx, z' = b x + d z + tz
              const x = a * Pn[i][0] + c * Pn[i][1] + tx, z = b * Pn[i][0] + d * Pn[i][1] + tz, me = box(x, z, C.yaw + (C.rot[i] || 0), HU, HV);
              for (const o of s.obs) { const p = push(me, o); if (p) { const det = a * d - b * c; dx += (d * p[0] - c * p[1]) / det; dz += (-b * p[0] + a * p[1]) / det; worst = Math.max(worst, Math.hypot(...p)); } } }
            for (let j = 0; j < Pn.length; j++) { if (j === i) continue; const ddx = Pn[i][0] - Pn[j][0], ddz = Pn[i][1] - Pn[j][1], dist = Math.hypot(ddx, ddz) || 1e-3; if (dist < 0.21) { dx += ddx / dist * (0.21 - dist) / 2; dz += ddz / dist * (0.21 - dist) / 2; worst = Math.max(worst, 0.21 - dist); } }
            dx += (P0[i][0] - Pn[i][0]) * 0.01; dz += (P0[i][1] - Pn[i][1]) * 0.01; // 처음 자리로 조금 당긴다 — 너무 멀리 흩어지지 않게
            Pn[i][0] += dx * 0.5; Pn[i][1] += dz * 0.5;
          }
        }
        const moved = Math.max(...Pn.map((p, i) => Math.hypot(p[0] - P0[i][0], p[1] - P0[i][1])));
        if (moved < 0.01) continue;
        results[n] = { expr, arr: '[' + Pn.map(([x, z]) => `[${+x.toFixed(2)}, ${+z.toFixed(2)}]`).join(', ') + ']', moved, worst };
      }
      for (const [n, r] of Object.entries(results)) { scene = scene.replace(`spots: ${r.expr}`, `spots: ${r.arr}`); patched++; }
      if (Object.keys(results).length) { src = src.slice(0, a0) + scene + src.slice(a1 + 1); fs.writeFileSync(file, src); }
      console.log(id, Object.entries(results).map(([n, r]) => `${n} 옮김≤${r.moved.toFixed(2)} 남은겹침 ${r.worst.toFixed(3)}`).join(', ') || '그대로');
    } catch (e) { console.log(id, 'ERR', e.message.split('\n')[0]); }
    await br.close().catch(() => {});
  }
  console.log('patched', patched);
})();

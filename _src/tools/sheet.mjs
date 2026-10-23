// 3D 무대 확인용 캡처: 한 브라우저 세션에서 장면 순간마다 무대(캔버스) 주변만 잘라 PNG로 저장한다.
// 사용: node _src/tools/sheet.mjs <base-url> <out-dir> <장면:순간> [장면:순간 ...]
//   예) node _src/tools/sheet.mjs http://127.0.0.1:8765 /tmp/shots e02:enter e02:p2.0
//   순간: enter(낭독 없이 볼 때) | intro | p1.2(문단·문장) | w0(말씀) — 앱 주소의 ?beat= 로 그 순간까지 즉시 적용된다
// 환경 변수: CHROME(크롬 실행 파일 경로), DPR(배율, 기본 1 — 자세히 보려면 3), W/H(창 크기, 기본 1400x900)
import { spawn } from 'node:child_process';
import { writeFileSync, mkdtempSync, mkdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [base, outDir, ...shots] = process.argv.slice(2);
if (!base || !outDir || !shots.length) { console.error('사용: node sheet.mjs <base-url> <out-dir> <장면:순간>...'); process.exit(1); }
mkdirSync(outDir, { recursive: true });
const CHROME = process.env.CHROME || ['C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find(p => existsSync(p));
if (!CHROME) { console.error('크롬을 찾지 못했습니다. CHROME 환경 변수로 경로를 지정하세요.'); process.exit(1); }
const W = +(process.env.W || 1400), H = +(process.env.H || 900), DPR = +(process.env.DPR || 1), port = 9300 + Math.floor(Math.random() * 500);
// WebGL은 소프트웨어 렌더러(SwiftShader)로 — GPU 없는 환경에서도 돈다
const chrome = spawn(CHROME, ['--headless=new', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--hide-scrollbars', '--no-sandbox',
  `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'sheet-'))}`, `--window-size=${W},${H}`, 'about:blank']);
const sleep = ms => new Promise(r => setTimeout(r, ms));
let target;
for (let i = 0; i < 60 && !target; i++) { await sleep(200); try { target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t => t.type === 'page'); } catch {} }
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r));
let id = 0; const pending = new Map(), logs = [];
ws.addEventListener('message', ev => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') logs.push('EXC ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text));
  if (m.method === 'Runtime.consoleAPICalled' && /error|warn/.test(m.params.type)) logs.push(m.params.type + ' ' + m.params.args.map(a => a.value ?? a.description).join(' '));
});
const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await send('Runtime.enable'); await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: DPR, mobile: W < 600 });
for (const s of shots) {
  const [ev, beat] = s.split(':');
  await send('Page.navigate', { url: `${base}/?beat=${beat}#${ev}` });
  // 지도 카메라 이동이 끝나고 무대가 자리를 잡을 때까지 기다린다 (캔버스가 보일 때까지, 최대 8초)
  let rect = null;
  for (let i = 0; i < 32; i++) {
    await sleep(250);
    const r = await send('Runtime.evaluate', { expression: `(()=>{const c=document.querySelector('canvas.stage3d');if(!c)return null;const b=c.getBoundingClientRect();return [b.x,b.y,b.width,b.height,+getComputedStyle(c).opacity]})()`, returnByValue: true });
    rect = r.result.result.value;
    if (i >= 10 && rect && rect[4] > 0.95) break;
  }
  if (!rect || rect[4] < 0.5) { console.log(s, '무대가 보이지 않음 (대본이 없는 장면이거나 아직 자리를 못 잡음)'); continue; }
  const [x, y, w, h, op] = rect, pad = 20, cx = Math.max(0, x - pad), cy = Math.max(0, y - pad);
  const shot = await send('Page.captureScreenshot', { format: 'png', clip: { x: cx, y: cy, width: Math.min(W - cx, w + pad * 2), height: Math.min(H - cy, h + pad * 2), scale: 1 } });
  writeFileSync(join(outDir, `${ev}_${beat}.png`), Buffer.from(shot.result.data, 'base64'));
  console.log(s, 'canvas', Math.round(x), Math.round(y), Math.round(w), Math.round(h), 'opacity', op.toFixed(2));
}
logs.forEach(l => console.log(l));
ws.close(); chrome.kill(); process.exit(0);

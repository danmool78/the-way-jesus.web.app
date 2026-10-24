// 예루살렘 3D 도성 그림 만들기: _src/tools/jerusalem.html을 헤드리스 크롬으로 열어 그린 그림을 assets/jerusalem.webp로 저장한다.
// 사용: (저장소 루트에서 python3 -m http.server 8765 를 띄운 뒤) node _src/tools/jerusalem.mjs http://127.0.0.1:8765 [giza|pharos|helio]
//   모형 이름을 주면 stage/egypt.js의 애굽 표지 모형을 assets/egypt-<이름>.webp로 저장한다
// 환경 변수: CHROME(크롬 실행 파일 경로), PX(지도 단위당 픽셀, 기본 100). 웹프 변환에 python3 + Pillow를 쓴다
import { spawn, execFileSync } from 'node:child_process';
import { writeFileSync, mkdtempSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const base = process.argv[2] || 'http://127.0.0.1:8765', model = process.argv[3], out = model ? `assets/egypt-${model}.webp` : 'assets/jerusalem.webp';
const CHROME = process.env.CHROME || ['C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find(p => existsSync(p));
if (!CHROME) { console.error('크롬을 찾지 못했습니다. CHROME 환경 변수로 경로를 지정하세요.'); process.exit(1); }
const port = 9800 + Math.floor(Math.random() * 100), dir = mkdtempSync(join(tmpdir(), 'jlm-'));
const chrome = spawn(CHROME, ['--headless=new', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox',
  `--remote-debugging-port=${port}`, `--user-data-dir=${dir}`, 'about:blank']);
const sleep = ms => new Promise(r => setTimeout(r, ms));
let target;
for (let i = 0; i < 60 && !target; i++) { await sleep(200); try { target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t => t.type === 'page'); } catch {} }
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r));
let id = 0; const pending = new Map();
ws.addEventListener('message', ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async expr => (await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })).result.result.value;
await send('Page.navigate', { url: `${base}/_src/tools/jerusalem.html?px=${process.env.PX || 100}${model ? '&m=' + model : ''}` });
for (let i = 0; i < 600 && (await ev('document.title')) !== 'ready'; i++) await sleep(200);
const png = join(dir, 'jerusalem.png');
writeFileSync(png, Buffer.from((await ev('window.png()')).split(',')[1], 'base64'));
execFileSync('python3', ['-c', `from PIL import Image; Image.open(${JSON.stringify(png)}).save(${JSON.stringify(out)}, 'WEBP', quality=82, method=6)`]);
console.log(out);
chrome.kill(); process.exit(0);

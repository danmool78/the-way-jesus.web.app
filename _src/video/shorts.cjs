// 핵심 기능 소개 쇼츠(세로 1080×1920): 실제 앱을 휴대폰 화면으로 띄워 한 프레임씩 찍고, 큰 자막과 배경음악을 입힌다.
// 쓰는 법: 저장소 맨 위를 http://localhost:8765 로 띄워 두고  node _src/video/shorts.cjs [출력.mp4] [--preview]
//   --preview: 작게(405×720)·초당 8장으로 빨리 훑어보기
// 시간은 Playwright의 가짜 시계로 한 프레임씩 넘긴다 — 3D(소프트웨어 그리기)가 느려도 영상은 고르게 흐른다.
// CSS 애니메이션·전환은 가짜 시계를 따르지 않아, 프레임마다 멈춰 두고 그 시각으로 직접 맞춘다(syncCss)
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const argv = process.argv.slice(2), PREVIEW = argv.includes('--preview');
const OUT = argv.find(a => !a.startsWith('--')) || 'shorts.mp4';
const FPS = PREVIEW ? 8 : 30, DPR = PREVIEW ? 1 : 2, W = 405, H = 720; // 405×720 × 2 = 810×1440 → 1080×1920로 키운다
const URL = 'http://localhost:8765/';
const DIR = fs.mkdtempSync('/tmp/shorts-'), MUSIC = 'assets/music/glory.mp3';
let n = 0;

// 자막 띠: 지도 위쪽(머리 아래)에 크게. 두 줄까지, 작은 설명 한 줄
const CAP_CSS = `#shortCap{position:fixed;left:0;right:0;top:104px;z-index:99999;padding:14px 18px 22px;text-align:center;pointer-events:none;
  background:linear-gradient(rgba(14,10,6,.78),rgba(14,10,6,.55) 70%,rgba(14,10,6,0));font-family:'Noto Sans KR',sans-serif;opacity:0}
#shortCap b{display:block;color:#fff;font-size:27px;line-height:1.32;font-weight:800;letter-spacing:-.01em;text-shadow:0 2px 10px rgba(0,0,0,.6);white-space:pre-line}
#shortCap small{display:block;margin-top:8px;color:#f0d28a;font-size:15px;font-weight:600;letter-spacing:.02em}`;

async function main() {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: DPR, isMobile: true, hasTouch: true, locale: 'ko-KR' });
  const p = await ctx.newPage();
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.clock.install();
  const cdp = await ctx.newCDPSession(p);
  const tick = ms => p.clock.runFor(ms);
  const settle = async (ms) => { for (let t = 0; t < ms; t += 100) { await tick(100); await p.waitForTimeout(40); } }; // 화면에 담지 않고 흘려보내기(불러오기 등)
  const syncCss = () => p.evaluate(() => { const vt = performance.now(); for (const a of document.getAnimations()) { if (a.__v === undefined) { a.__v = vt - (a.currentTime || 0); a.pause(); } a.currentTime = vt - a.__v; } });
  const grab = async () => { const r = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 92 }); fs.writeFileSync(path.join(DIR, `f${String(n++).padStart(5, '0')}.jpg`), Buffer.from(r.data, 'base64')); };
  // 한 토막: sec초 동안 찍는다. each(k, 0..1)는 프레임마다 (지도 당기기 같은 것)
  const shoot = async (sec, cap, each) => {
    const N = Math.round(sec * FPS);
    await setCap(cap);
    for (let k = 0; k < N; k++) {
      const u = k / (N - 1), fade = Math.min(1, u * sec / 0.45, (1 - u) * sec / 0.35); // 자막: 0.45초에 떠오르고 끝 0.35초에 사라진다
      await p.evaluate(o => { const c = document.getElementById('shortCap'); if (c) c.style.opacity = o; }, cap ? fade : 0);
      if (each) await each(k, u);
      await tick(1000 / FPS); await syncCss(); await grab();
    }
    console.log(`토막 ${(cap?.t || '').replace(/\n/g, ' ')} → ${n}장`);
  };
  const setCap = cap => p.evaluate(([css, cap]) => {
    if (!document.getElementById('shortCapCss')) { const s = document.createElement('style'); s.id = 'shortCapCss'; s.textContent = css; document.head.appendChild(s); }
    let c = document.getElementById('shortCap'); if (!c) { c = document.createElement('div'); c.id = 'shortCap'; document.body.appendChild(c); }
    c.innerHTML = cap ? `<b></b>${cap.s ? '<small></small>' : ''}` : ''; if (cap) { c.querySelector('b').textContent = cap.t; if (cap.s) c.querySelector('small').textContent = cap.s; }
  }, [CAP_CSS, cap]);
  const open = async (u, wait = 5000) => {
    await p.goto(URL + u); await settle(wait);
    await p.evaluate(() => { document.querySelectorAll('.intro').forEach(x => x.remove()); document.body.classList.remove('intro-open'); localStorage.setItem('theway-realms', '1'); });
    await settle(1500);
  };

  // 1) 첫 화면: 예수 여정 전체 경로 — 성경 속 그 길을 지도 위에서
  await open('app.html#e01');
  await p.click('#fitAll'); await settle(1800);
  await shoot(3.6, { t: '성경 속 그 길을\n지도 위에서 걷는다', s: '그 길 — 예수의 발자취' }, k => k % Math.round(FPS * 0.5) === 0 && p.evaluate(() => window.zoomMap(0.965)));

  // 2) 걷기: 베들레헴에서 애굽으로 — 장면을 따라 실제 길을 걷는다
  await open('app.html#e04');
  await shoot(5.4, { t: '사복음서 61장면을\n시간과 장소 순서대로', s: '다음 장소로 — 실제 길을 따라 걷는다' }, k => k === Math.round(FPS * 0.6) && p.click('#next'));

  // 3) 3D 미니어처 무대: 장면을 열면 그 자리에서 사람들이 움직인다
  await open('app.html?beat=p0.2#e10', 6000);
  await p.evaluate(() => window.zoomMap(0.6)); await settle(1200);
  await shoot(4.6, { t: '장면마다 살아 움직이는\n3D 미니어처 무대', s: '말씀 속 그 순간이 지도 위에' });

  // 4) 3D 지형: 실제 고도 자료로 빚은 땅 — 눕혀 보기
  await open('app.html#e33', 5000);
  await p.click('#mode3d'); await settle(9000);
  await shoot(5.0, { t: '실제 고도로 빚은\n3D 지형', s: '갈릴리 바다와 산과 골짜기 그대로' }, async (k) => {
    if (k % 2 === 0) await p.evaluate(() => { const c = document.querySelector('canvas.terrain, #terrain canvas, canvas'); }); // (조작은 아래 드래그로)
  });

  // 5) 명화와 이야기, 성우 낭독
  await open('app.html#e14', 5000);
  await p.evaluate(() => { const c = document.getElementById('scene'); c.classList.remove('peek'); c.classList.add('open', 'full'); });
  await settle(1500);
  await shoot(4.8, { t: '명화와 함께 읽고\n성우의 낭독으로 듣는다', s: '장면마다 그림 · 이야기 · 말씀 · 대조표' }, (k, u) => k % 4 === 0 && p.evaluate(u => { const s = document.querySelector('#scene .scroll, #scene'); if (s) s.scrollTop = u * 260; }, u));

  // 6) 영역: 장면이 넘어가 시대가 바뀌면 다스린 나라가 바뀐다 (열왕기 — 통일 왕국에서 남북으로)
  await open('app.html?j=kings#k06', 5000);
  await p.click('#fitAll'); await settle(2000);
  await shoot(5.2, { t: '그 시대 누가 다스렸나\n영역이 시대 따라 바뀐다', s: '통일 왕국 → 북이스라엘 · 남유다' }, k => k === Math.round(FPS * 1.2) && p.evaluate(() => { location.hash = '#k07'; }));

  // 7) 그 길 시리즈 — 첫 화면의 여정 카드
  await p.goto(URL); await settle(3500);
  await shoot(5.0, { t: '예수 · 모세 · 다윗 · 열왕기 · 바울\n시편 · 잠언 · GoodNews', s: '그 길 시리즈 — 같은 지도로 성경 전체를' }, (k, u) => k % 3 === 0 && p.evaluate(u => window.scrollTo(0, u * Math.max(0, document.documentElement.scrollHeight * 0.55 - innerHeight * 0.2)), u));

  // 8) 끝 화면
  await p.goto(URL + '_src/video/shorts-end.html'); await settle(800);
  await shoot(3.6, null);
  await b.close();

  // 묶기: 810×1440 → 1080×1920, 배경음악은 처음 1초 올리고 끝 1.5초 내린다
  const dur = n / FPS;
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-framerate', String(FPS), '-i', path.join(DIR, 'f%05d.jpg'), '-i', MUSIC,
    '-filter_complex', `[0:v]scale=1080:1920:flags=lanczos,format=yuv420p[v];[1:a]atrim=0:${dur},afade=t=in:d=1,afade=t=out:st=${Math.max(0, dur - 1.6)}:d=1.5,volume=0.9[a]`,
    '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-preset', 'slow', '-crf', PREVIEW ? '28' : '19', '-r', '30', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', '-shortest', OUT], { stdio: 'inherit' });
  console.log('완성', OUT, dur.toFixed(1) + '초', n + '장');
  fs.rmSync(DIR, { recursive: true, force: true });
}
main().catch(e => { console.error(e); process.exit(1); });

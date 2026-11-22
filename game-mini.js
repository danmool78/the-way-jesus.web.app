// 장면 놀이 (사용자 2026-11): 그분을 만나 이야기를 다 들은 뒤, 몇몇 장면에서는 말씀 고르기 대신 그 장면의 짧은 놀이를 모달로 한다.
// 제한 시간 안에 성공해야 그 장면의 말씀 카드를 얻는다(사용자: '성공해야 카드 줌'). 한 번 더 도전할 수 있다. 보너스는 남은 시간 비율×200점.
// 그림은 모두 캔버스에 코드로 그린다(파일을 더 받지 않는다). 좌표는 400×500 논리 단위 — 화면 크기에 맞춰 늘린다.
// 놀이 하나 = { title, ask(그분이 이야기 끝에 맡기시는 말), quote, ref, help, seconds, init(), update(dt, S), draw(g, S), down(x, y, S), up(S), won(S), end(g, k, S) }

import { t as tr, LANG } from './game-i18n.js';
const W = 400, H = 500, TRIES = 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ease = t => 1 - Math.pow(1 - t, 3);
const rnd = (a, b) => a + Math.random() * (b - a);
// 그림 조각(assets/mini/…, 카드와 같은 화풍 — _src/tools/sprite.py): 놀이가 열릴 때 미리 불러 두고, 아직 못 받았으면 코드 그림으로 그린다
const ART = {};
function art(n) { if (typeof Image === 'undefined') return null; let a = ART[n]; if (!a) { a = ART[n] = new Image(); a.src = `assets/mini/${n}.webp`; } return a.complete && a.naturalWidth ? a : null; }
function spr(g, n, x, y, h, o = {}) { // (x, y) = 발밑 가운데(ax·ay로 바꿈), h = 그릴 높이
  const im = art(n); if (!im) return false; const w = im.width * h / im.height;
  g.save(); g.globalAlpha *= o.a ?? 1; g.translate(x, y); if (o.rot) g.rotate(o.rot); if (o.flip) g.scale(-1, 1);
  g.drawImage(im, -w * (o.ax ?? 0.5), -h * (o.ay ?? 1), w, h); g.restore(); return true;
}
const bgArt = (g, n) => { const im = art(n); if (!im) return false; g.drawImage(im, 0, 0, W, H);
  const sh = g.createLinearGradient(0, 0, 0, 70); sh.addColorStop(0, 'rgba(0,0,0,.45)'); sh.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = sh; g.fillRect(0, 0, W, 70); return true; }; // 위쪽 글씨가 읽히게

/* ---------- 가나의 혼인 잔치 (요 2:1–11): 돌항아리 여섯을 아귀까지 ---------- */
// 누르고 있으면 하인의 물동이가 기울어 물을 붓는다 — 오래 누를수록 콸콸(빨라진다), 손을 떼도 떨어지던 물줄기는 잠깐 더 들어간다.
// 아귀(금줄)까지 차면 그 항아리는 끝. 넘치면 쏟아져 다시 채워야 한다(시간을 잃는다). 여섯을 다 채우면 물이 포도주로 바뀐다.
const FULL = 0.95, OVER = 1.05, SPILL_TO = 0.72, LAG = 0.24;
const cana = {
  title: tr('가나의 혼인 잔치'), task: tr('돌항아리 여섯에 물을 아귀까지'),
  quote: tr('항아리에 물을 채우라 하시니 아귀까지 채우니'), ref: tr('요 2:7'),
  help: tr('항아리를 누르고 있으면 물을 부어요. 오래 누를수록 빨라져요.<br>금줄(아귀)까지 — 넘치면 쏟아져 다시 채워야 해요.'),
  ask: [tr('그날 하인들에게 맡긴 일을 이번엔 네게 맡기마.'), tr('저 돌항아리 여섯에 물을 채워라 — 아귀까지. 시간이 많지 않구나!')], // 이야기 끝에 그분이 맡기시는 일 (말풍선)
  art: ['e11/bg', 'e11/jar', 'e11/pitcher'],
  seconds: 21, // 아슬아슬하게(사용자): 적당히 빠르면 17초쯤(4초 남음), 한 번 넘치면 +2초, 조금씩만 부으면 24초 — 모자란다
  init() {
    // 두 줄로 셋씩 (폰 세로 화면에서도 항아리가 커 보이게) — 뒷줄은 조금 작고 위에
    const jars = [];
    for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) {
      const s = r ? 0.92 : 1, w = 84 * s, h = 118 * s;
      jars.push({ x: 82 + c * 118 + (r ? 0 : 0), y: r ? 262 : 430, w, h, lv: rnd(0.04, 0.12), done: false, flash: 0, spill: 0, wob: rnd(0, 6) });
    }
    return { jars, cur: -1, hold: 0, rate: 0, lag: 0, lagJar: -1, drops: [], sparks: [], wine: 0, tilt: 0, msg: null };
  },
  update(dt, S) {
    const J = S.jars;
    // 붓는 중: 누른 시간에 따라 빨라진다(처음엔 졸졸 → 콸콸)
    if (S.cur >= 0 && !J[S.cur].done) { S.hold += dt; S.rate = 0.16 + Math.min(1, S.hold / 1.6) * 0.62; S.lag = LAG; S.lagJar = S.cur; }
    else if (S.lag > 0) S.lag -= dt;
    S.tilt += ((S.cur >= 0 ? 1 : 0) - S.tilt) * Math.min(1, dt * 10);
    const k = S.cur >= 0 ? S.cur : S.lag > 0 ? S.lagJar : -1;
    if (k >= 0 && !J[k].done) {
      const j = J[k];
      j.lv += S.rate * dt;
      S.fx.pour(j.lv);
      if (j.lv >= OVER) { // 넘쳤다 — 쏟아지고 다시
        j.lv = SPILL_TO; j.spill = 1; S.cur = -1; S.lag = 0; S.hold = 0; S.fx.pour(null); S.fx.play('splash');
        S.msg = { t: tr('넘쳤어요! 다시 채워요'), c: '#ffb38a', at: 1.4, x: j.x, y: j.y - j.h - 8 };
        for (let i = 0; i < 26; i++) S.drops.push({ x: j.x + rnd(-j.w * 0.35, j.w * 0.35), y: j.y - j.h + 6, vx: rnd(-90, 90), vy: rnd(-160, -40), life: rnd(0.6, 1.1) });
      }
    } else S.fx.pour(null);
    // 아귀까지 찬 항아리: 손을 뗀 뒤(물줄기가 다 들어간 뒤) 판정
    for (const [i, j] of J.entries()) {
      if (!j.done && j.lv >= FULL && S.cur !== i && !(S.lag > 0 && S.lagJar === i)) {
        j.done = true; j.flash = 1; S.fx.play('plink');
        S.msg = { t: j.lv <= 1.01 ? tr('아귀까지!') : tr('찰랑찰랑'), c: '#ffe29a', at: 1, x: j.x, y: j.y - j.h - 8 };
        for (let n = 0; n < 14; n++) S.sparks.push({ x: j.x + rnd(-j.w * 0.4, j.w * 0.4), y: j.y - j.h * j.lv + rnd(-6, 6), vy: rnd(-50, -15), life: rnd(0.6, 1.2), r: rnd(1.5, 3) });
      }
      j.flash = Math.max(0, j.flash - dt * 1.5); j.spill = Math.max(0, j.spill - dt * 1.2); j.wob += dt * 3;
    }
    for (const d of S.drops) { d.vy += 520 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.life -= dt; }
    S.drops = S.drops.filter(d => d.life > 0 && d.y < H + 20);
    for (const p of S.sparks) { p.y += p.vy * dt; p.life -= dt; }
    S.sparks = S.sparks.filter(p => p.life > 0);
    if (S.msg) S.msg.at -= dt;
  },
  down(x, y, S) {
    const i = S.jars.findIndex(j => !j.done && Math.abs(x - j.x) < j.w * 0.62 && y > j.y - j.h - 46 && y < j.y + 12);
    if (i >= 0) { S.cur = i; S.hold = 0; }
  },
  up(S) { S.cur = -1; S.hold = 0; },
  won: S => S.jars.every(j => j.done),
  draw(g, S) {
    courtyard(g);
    const J = S.jars, active = S.cur >= 0 ? S.cur : S.lag > 0 ? S.lagJar : -1;
    for (const [i, j] of J.entries()) drawJar(g, j, S.wine, i === active);
    // 물줄기와 물동이 (붓는 항아리 위)
    if (active >= 0) {
      const j = J[active], top = j.y - j.h, sx = j.x + 6, sy = top - 40;
      const surf = j.y - 8 - (j.h - 16) * Math.min(1, j.lv);
      if (S.cur >= 0 || S.lag > 0) {
        const wdt = 2.5 + S.rate * 7;
        g.save(); g.strokeStyle = 'rgba(170,215,240,.9)'; g.lineWidth = wdt; g.lineCap = 'round';
        g.beginPath(); g.moveTo(sx, sy + 4); const t = performance.now() / 70;
        for (let yy = sy + 4; yy < surf; yy += 6) g.lineTo(sx + Math.sin(t + yy * 0.25) * 0.9, yy);
        g.stroke();
        g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = Math.max(1, wdt * 0.3); g.beginPath(); g.moveTo(sx - wdt * 0.2, sy + 6); g.lineTo(sx - wdt * 0.2, surf - 2); g.stroke();
        // 물이 닿는 곳의 거품
        g.fillStyle = 'rgba(255,255,255,.7)';
        for (let n = 0; n < 4; n++) { g.beginPath(); g.arc(sx + rnd(-7, 7), surf + rnd(-2, 1), rnd(1, 2.4), 0, 7); g.fill(); }
        g.restore();
      }
      pitcher(g, sx, sy, S.tilt);
    }
    for (const d of S.drops) { g.fillStyle = `rgba(170,215,240,${clamp(d.life, 0, 1)})`; g.beginPath(); g.arc(d.x, d.y, 2.4, 0, 7); g.fill(); }
    for (const p of S.sparks) { g.fillStyle = `rgba(255,226,150,${clamp(p.life, 0, 1)})`; star(g, p.x, p.y, p.r * 2.2); }
    if (S.msg && S.msg.at > 0) {
      const a = clamp(S.msg.at * 2, 0, 1), rise = (1 - clamp(S.msg.at, 0, 1)) * 14;
      g.save(); g.globalAlpha = a; g.font = '800 17px "Noto Sans KR",sans-serif'; g.textAlign = 'center';
      g.lineWidth = 4; g.strokeStyle = 'rgba(30,18,8,.8)'; g.strokeText(S.msg.t, clamp(S.msg.x, 70, W - 70), S.msg.y - rise);
      g.fillStyle = S.msg.c; g.fillText(S.msg.t, clamp(S.msg.x, 70, W - 70), S.msg.y - rise); g.restore();
    }
    // 다 채운 수
    const n = J.filter(j => j.done).length;
    g.save(); g.font = '700 14px "Noto Sans KR",sans-serif'; g.textAlign = 'left'; g.fillStyle = 'rgba(255,240,210,.9)';
    g.fillText(tr('채운 항아리 {0} / 6', n), 16, 26); g.restore();
  },
  // 성공: 물이 위에서부터 포도주 빛으로 (요 2:9)
  end(g, k, S) { S.wine = ease(k); this.draw(g, S);
    if (k > 0.3) { g.save(); g.globalAlpha = clamp((k - 0.3) * 2, 0, 1); g.font = '700 20px "Gowun Batang",serif'; g.textAlign = 'center';
      g.lineWidth = 5; g.strokeStyle = 'rgba(30,12,10,.75)'; g.strokeText(tr('물이 포도주가 되었다'), W / 2, 118); g.fillStyle = '#ffe1c2'; g.fillText(tr('물이 포도주가 되었다'), W / 2, 118);
      g.font = '600 12px "Noto Sans KR",sans-serif'; g.fillStyle = '#f0c9a0'; g.fillText(tr('요 2:9'), W / 2, 137); g.restore(); }
    for (const j of S.jars) if (Math.random() < 0.25) S.sparks.push({ x: j.x + rnd(-j.w * 0.35, j.w * 0.35), y: j.y - j.h + rnd(4, 20), vy: rnd(-40, -12), life: rnd(0.5, 1), r: rnd(1.2, 2.6) });
  },
};

// 잔칫집 안마당: 회벽, 아치 문, 매단 등잔의 따뜻한 빛, 돌바닥
function courtyard(g) {
  if (bgArt(g, 'e11/bg')) return;
  const sky = g.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#5a3d28'); sky.addColorStop(0.55, '#8a6242'); sky.addColorStop(0.56, '#6e5440'); sky.addColorStop(1, '#3e2e22');
  g.fillStyle = sky; g.fillRect(0, 0, W, H);
  // 벽의 아치
  g.fillStyle = 'rgba(30,18,10,.45)';
  for (const x of [70, 200, 330]) { g.beginPath(); g.moveTo(x - 42, 275); g.lineTo(x - 42, 120); g.arc(x, 120, 42, Math.PI, 0); g.lineTo(x + 42, 275); g.closePath(); g.fill(); }
  g.strokeStyle = 'rgba(255,225,180,.12)'; g.lineWidth = 2;
  for (const x of [70, 200, 330]) { g.beginPath(); g.moveTo(x - 46, 276); g.lineTo(x - 46, 120); g.arc(x, 120, 46, Math.PI, 0); g.lineTo(x + 46, 276); g.stroke(); }
  // 등잔 빛
  for (const [x, y] of [[135, 70], [265, 70]]) {
    const l = g.createRadialGradient(x, y, 2, x, y, 120); l.addColorStop(0, 'rgba(255,200,110,.55)'); l.addColorStop(1, 'rgba(255,200,110,0)');
    g.fillStyle = l; g.fillRect(x - 120, y - 120, 240, 240);
    g.strokeStyle = 'rgba(40,25,12,.7)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, y - 6); g.stroke();
    g.fillStyle = '#c98a4a'; g.beginPath(); g.ellipse(x, y, 9, 4, 0, 0, 7); g.fill();
    g.fillStyle = '#ffd98a'; g.beginPath(); g.ellipse(x + 6, y - 4, 2.2, 4.5, 0, 0, 7); g.fill();
  }
  // 포도 덩굴 (잔칫집)
  g.strokeStyle = 'rgba(70,90,40,.55)'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 30);
  for (let x = 0; x <= W; x += 20) g.lineTo(x, 30 + Math.sin(x * 0.05) * 8); g.stroke();
  for (let x = 12; x < W; x += 46) { g.fillStyle = 'rgba(90,110,50,.6)'; g.beginPath(); g.ellipse(x, 34 + Math.sin(x * 0.05) * 8, 9, 5, 0.4, 0, 7); g.fill();
    g.fillStyle = 'rgba(110,40,60,.7)'; for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(x + 8 + (k % 2) * 4, 44 + Math.sin(x * 0.05) * 8 + k * 3.5, 2.6, 0, 7); g.fill(); } }
  // 돌바닥 줄눈
  g.strokeStyle = 'rgba(20,12,6,.35)'; g.lineWidth = 1;
  for (let y = 290; y < H; y += 26) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke();
    for (let x = ((y / 26) % 2) * 30; x < W; x += 60) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 26); g.stroke(); } }
}
// 돌항아리 하나 (석회암 — 요 2:6, 결례에 쓰는 돌로 깎은 것). 안의 물은 돌 너머로 비쳐 보이게(놀이를 위해)
function jarPath(g, j, inset = 0) {
  // 석회암을 깎은 원통형 항아리: 위에 두툼한 테, 몸통은 거의 곧게 조금 불룩, 아래로 살짝 좁아졌다가 굽
  const { x, y, w, h } = j, i = inset, P = (sx, fy) => [x + sx * (w * 0.5 - i), y - fy * h + (fy > 0.5 ? i : -i)];
  const pts = [[0.92, 1], [0.84, 0.93], [0.9, 0.75], [0.94, 0.45], [0.84, 0.1], [0.9, 0]];
  g.beginPath(); g.moveTo(...P(-pts[0][0], pts[0][1]));
  for (let k = 1; k < pts.length; k++) { const [a0, f0] = pts[k - 1], [a1, f1] = pts[k], m = P(-(a0 + a1) / 2, (f0 + f1) / 2); g.quadraticCurveTo(...P(-a0, f0), ...m); }
  g.lineTo(...P(-pts.at(-1)[0], 0)); g.lineTo(...P(pts.at(-1)[0], 0));
  for (let k = pts.length - 1; k > 0; k--) { const [a0, f0] = pts[k], [a1, f1] = pts[k - 1], m = P((a0 + a1) / 2, (f0 + f1) / 2); g.quadraticCurveTo(...P(a0, f0), ...m); }
  g.lineTo(...P(pts[0][0], 1)); g.closePath();
}
function drawJar(g, j, wine, active) {
  if (art('e11/jar')) return drawJarArt(g, j, wine, active);
  const { x, y, w, h } = j;
  g.save();
  // 그림자
  g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(x + 4, y + 2, w * 0.46, 7, 0, 0, 7); g.fill();
  // 돌
  const st = g.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
  st.addColorStop(0, '#8d8372'); st.addColorStop(0.35, '#e2d9c4'); st.addColorStop(0.7, '#b9ae97'); st.addColorStop(1, '#6f665a');
  jarPath(g, j); g.fillStyle = st; g.fill();
  // 물 (안쪽에 비쳐 보이게)
  g.save(); jarPath(g, j, 6); g.clip();
  const lv = Math.min(1.02, j.lv), surf = y - 8 - (h - 16) * lv;
  const water = mix([95, 170, 210], [128, 22, 48], wine), deep = mix([40, 100, 150], [70, 8, 26], wine);
  const wg = g.createLinearGradient(0, surf, 0, y);
  wg.addColorStop(0, `rgba(${water},.82)`); wg.addColorStop(1, `rgba(${deep},.9)`);
  g.fillStyle = wg; g.beginPath(); g.moveTo(x - w, surf);
  for (let xx = x - w; xx <= x + w; xx += 4) g.lineTo(xx, surf + Math.sin(xx * 0.18 + j.wob) * (active ? 1.6 : 0.7));
  g.lineTo(x + w, y + 4); g.lineTo(x - w, y + 4); g.closePath(); g.fill();
  g.strokeStyle = `rgba(255,255,255,${0.5 - wine * 0.25})`; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x - w * 0.45, surf + 1); g.lineTo(x + w * 0.45, surf + 1); g.stroke();
  g.restore();
  // 돌의 잔 점(석회암)·테 아래 새긴 두 줄·굽 위 한 줄 — 나무통처럼 가로줄을 촘촘히 그었더니 통 같았다
  g.save(); jarPath(g, j); g.clip();
  j.dots ??= Array.from({ length: 34 }, () => [rnd(-0.45, 0.45), rnd(0.05, 0.95), rnd(0.6, 1.4), Math.random() < 0.5]);
  for (const [dx, fy, r, dk] of j.dots) { g.fillStyle = dk ? 'rgba(70,60,48,.22)' : 'rgba(255,250,235,.25)'; g.beginPath(); g.arc(x + dx * w, y - fy * h, r, 0, 7); g.fill(); }
  g.strokeStyle = 'rgba(70,58,44,.45)'; g.lineWidth = 1.2;
  for (const fy of [0.86, 0.82, 0.12]) { g.beginPath(); g.moveTo(x - w * 0.6, y - fy * h); g.quadraticCurveTo(x, y - fy * h + 4, x + w * 0.6, y - fy * h); g.stroke(); }
  const hi = g.createLinearGradient(x - w / 2, 0, x + w / 2, 0); hi.addColorStop(0.18, 'rgba(255,255,255,0)'); hi.addColorStop(0.3, 'rgba(255,255,255,.22)'); hi.addColorStop(0.42, 'rgba(255,255,255,0)');
  g.fillStyle = hi; g.fillRect(x - w, y - h, w * 2, h);
  g.restore();
  jarPath(g, j); g.strokeStyle = active ? '#ffe29a' : 'rgba(40,30,20,.75)'; g.lineWidth = active ? 2.5 : 1.5; g.stroke();
  // 아귀(입) 테두리와 금줄 — 여기까지 채운다
  g.fillStyle = '#d9cfb8'; g.beginPath(); g.ellipse(x, y - h, w * 0.46, 6, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(40,30,20,.55)'; g.beginPath(); g.ellipse(x, y - h + 0.5, w * 0.36, 4, 0, 0, 7); g.fill();
  g.strokeStyle = 'rgba(60,45,30,.6)'; g.lineWidth = 1; g.stroke();
  const fy = y - 8 - (h - 16) * FULL;
  g.strokeStyle = j.done ? 'rgba(255,226,150,.95)' : 'rgba(255,215,120,.75)'; g.setLineDash(j.done ? [] : [4, 3]); g.lineWidth = 1.6;
  g.beginPath(); g.moveTo(x - w * 0.44, fy); g.lineTo(x + w * 0.44, fy); g.stroke(); g.setLineDash([]);
  // 다 찼을 때 반짝, 넘쳤을 때 겉으로 흘러내린 물
  if (j.flash > 0) { g.globalAlpha = j.flash; jarPath(g, j); g.strokeStyle = '#fff2c0'; g.lineWidth = 5; g.stroke(); g.globalAlpha = 1; }
  if (j.spill > 0) { g.globalAlpha = j.spill; g.fillStyle = 'rgba(150,205,235,.7)';
    for (const s of [-1, 1]) { g.beginPath(); g.moveTo(x + s * w * 0.36, y - h); g.quadraticCurveTo(x + s * w * 0.55, y - h * 0.5, x + s * w * 0.42, y); g.lineTo(x + s * w * 0.34, y); g.quadraticCurveTo(x + s * w * 0.46, y - h * 0.5, x + s * w * 0.3, y - h); g.fill(); }
    g.beginPath(); g.ellipse(x, y + 3, w * 0.7 * (1.6 - j.spill * 0.6), 6, 0, 0, 7); g.fill(); g.globalAlpha = 1; }
  if (j.done) { g.fillStyle = '#ffe29a'; g.font = '800 15px "Noto Sans KR",sans-serif'; g.textAlign = 'center'; g.fillText('✓', x, y + 20); }
  g.restore();
}
// 그림 항아리: 돌 그림의 모양 그대로 안의 물을 비춰 보이게(놀이를 위해) — 작은 캔버스에 돌을 그리고 그 모양 안에만 물을 칠한다
let jarCv = null, boatCv = null;
function drawJarArt(g, j, wine, active) {
  const im = art('e11/jar'), { x, y, h } = j, w = im.width * h / im.height, R = 2;
  jarCv ??= typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(8, 8) : document.createElement('canvas');
  jarCv.width = Math.ceil(w * R); jarCv.height = Math.ceil(h * R); const c = jarCv.getContext('2d');
  c.drawImage(im, 0, 0, jarCv.width, jarCv.height); c.globalCompositeOperation = 'source-atop';
  const lv = Math.min(1.02, j.lv), surf = (h - 8 - (h - 16) * lv) * R, water = mix([95, 170, 210], [128, 22, 48], wine), deep = mix([40, 100, 150], [70, 8, 26], wine);
  const wg = c.createLinearGradient(0, surf, 0, h * R); wg.addColorStop(0, `rgba(${water},.72)`); wg.addColorStop(1, `rgba(${deep},.85)`); c.fillStyle = wg;
  c.beginPath(); c.moveTo(0, surf); for (let xx = 0; xx <= jarCv.width; xx += 6) c.lineTo(xx, surf + Math.sin(xx * 0.09 + j.wob) * (active ? 3 : 1.4)); c.lineTo(jarCv.width, h * R); c.lineTo(0, h * R); c.fill();
  c.fillStyle = `rgba(255,255,255,${0.55 - wine * 0.25})`; c.fillRect(w * R * 0.2, surf, w * R * 0.6, 2.5);
  g.save(); g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(x + 4, y + 2, w * 0.5, 7, 0, 0, 7); g.fill();
  if (active) { g.shadowColor = '#ffe29a'; g.shadowBlur = 18; }
  g.drawImage(jarCv, x - w / 2, y - h, w, h); g.shadowBlur = 0;
  const fy = y - 8 - (h - 16) * FULL; // 아귀 금줄 — 여기까지
  g.strokeStyle = j.done ? 'rgba(255,226,150,.95)' : 'rgba(255,215,120,.8)'; g.setLineDash(j.done ? [] : [4, 3]); g.lineWidth = 1.8;
  g.beginPath(); g.moveTo(x - w * 0.4, fy); g.lineTo(x + w * 0.4, fy); g.stroke(); g.setLineDash([]);
  if (j.flash > 0) { g.globalAlpha = j.flash; g.fillStyle = 'rgba(255,242,192,.6)'; g.beginPath(); g.ellipse(x, y - h / 2, w * 0.7, h * 0.6, 0, 0, 7); g.fill(); g.globalAlpha = 1; }
  if (j.spill > 0) { g.globalAlpha = j.spill; g.fillStyle = 'rgba(150,205,235,.75)';
    for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(x + sd * w * 0.36, y - h); g.quadraticCurveTo(x + sd * w * 0.6, y - h * 0.5, x + sd * w * 0.46, y); g.lineTo(x + sd * w * 0.36, y); g.quadraticCurveTo(x + sd * w * 0.5, y - h * 0.5, x + sd * w * 0.3, y - h); g.fill(); }
    g.beginPath(); g.ellipse(x, y + 3, w * 0.8 * (1.6 - j.spill * 0.6), 6, 0, 0, 7); g.fill(); g.globalAlpha = 1; }
  if (j.done) { g.fillStyle = '#ffe29a'; g.font = '800 15px "Noto Sans KR",sans-serif'; g.textAlign = 'center'; g.fillText('✓', x, y + 20); }
  g.restore();
}
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',');
// 하인의 물동이: 누르면 기울어 붓는다
function pitcher(g, x, y, tilt) {
  if (spr(g, 'e11/pitcher', x + 22, y + 14, 62, { ay: 0.7, rot: -0.15 - tilt * 0.85 })) return;
  g.save(); g.translate(x + 22, y - 6); g.rotate(-0.15 - tilt * 0.85);
  const c = g.createLinearGradient(-20, 0, 20, 0); c.addColorStop(0, '#7a3f22'); c.addColorStop(0.45, '#c9774a'); c.addColorStop(1, '#6a341b');
  g.fillStyle = c; g.beginPath(); g.ellipse(0, 0, 19, 23, 0, 0, 7); g.fill();
  g.fillRect(-8, -30, 16, 10); g.beginPath(); g.ellipse(0, -30, 10, 3.5, 0, 0, 7); g.fill();
  g.beginPath(); g.moveTo(-9, -28); g.lineTo(-24, -26); g.lineTo(-9, -21); g.fill(); // 주둥이
  g.strokeStyle = '#5a2c16'; g.lineWidth = 4; g.beginPath(); g.arc(17, -6, 10, -1.2, 1.2); g.stroke(); // 손잡이
  g.strokeStyle = 'rgba(255,230,200,.25)'; g.lineWidth = 2; g.beginPath(); g.arc(-4, -2, 13, 2.4, 3.6); g.stroke();
  g.restore();
}
function star(g, x, y, r) { g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr = i % 2 ? r * 0.35 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.fill(); }

/* ---------- 사람을 낚는 어부 (눅 5:1–11): 깊은 데로 가서 그물을 내리라 ---------- */
// 누르면 그 자리로 그물을 던진다(날아가는 동안 떼가 움직이니 앞을 노린다). 걸린 고기는 누르고 있어야 끌어올려진다 —
// 많이 걸릴수록 그물이 빨리 팽팽해져(눅 5:6 '그물이 찢어지는지라') 빨개지면 잠깐 놓았다 당긴다. 찢어지면 반을 잃는다.
// 깊은 데(위쪽)일수록 떼가 크다. 제한 시간 안에 GOAL 마리를 잡으면 배가 잠기도록 가득 찬다(눅 5:7)
const BOAT = [200, 452], NET_R = 44, GOAL = 110; // 잘 노리면 한 번에 20~38마리 — 몇 번 빗나가거나 한 번 찢어지면 빠듯하게
const fishing = {
  title: tr('사람을 낚는 어부'), task: tr('그물을 던져 고기 {0}마리', GOAL),
  ask: [tr('밤새 수고했는데 한 마리도 못 잡았다고?'), tr('깊은 데로 가서 그물을 내려라. 그물이 찢어지지 않게 끌어올려야 한다!')],
  quote: tr('깊은 데로 가서 그물을 내려 고기를 잡으라'), ref: tr('눅 5:4'),
  help: tr('물고기 떼를 노려 누르면 그물을 던져요. 날아가는 동안 떼가 움직이니 앞을 노려요.<br>걸리면 누르고 있어 끌어올려요 — 빨개지면 잠깐 놓았다 당겨요. 찢어지면 반을 잃어요.'),
  seconds: 32, art: ['e17/bg', 'e17/boat'],
  init() {
    const S = { goal: this.goal || GOAL, schools: [], net: { st: 'ready' }, got: 0, sparks: [], rip: [], msg: null, spawnT: 0, boatY: 0, shine: [] };
    for (let i = 0; i < 4; i++) S.schools.push(school(true));
    for (let i = 0; i < 18; i++) S.shine.push([rnd(0, W), rnd(70, 420), rnd(0, 6)]);
    return S;
  },
  update(dt, S) {
    for (const f of S.schools) { f.t += dt; f.x += f.vx * dt; f.y += f.vy * dt + Math.sin(f.t * 0.9 + f.ph) * 6 * dt; }
    S.schools = S.schools.filter(f => f.x > -90 && f.x < W + 90 && f.n > 0);
    S.spawnT -= dt; if (S.schools.length < 5 && S.spawnT <= 0) { const f = school(false); if (this.right && f.x < BOAT[0] && Math.random() < 0.7) { f.x = W - f.x; f.vx = -f.vx; } S.schools.push(f); S.spawnT = rnd(0.6, 1.4); } // 오른편(요 21:6)에 떼가 더 많이
    const N = S.net;
    if (N.st === 'fly') {
      N.t += dt;
      if (N.t >= N.dur) { // 물에 닿아 펼쳐진다 — 그 둘레의 고기가 걸린다
        let n = 0; const wrong = this.right && N.x < BOAT[0] - 6; // 요 21:6 — 배 오른편에
        if (!wrong) for (const f of S.schools) for (const o of f.fish) if (!o.gone && Math.hypot(f.x + o.x - N.x, f.y + o.y - N.y) < NET_R) { o.gone = true; n++; f.n--; }
        S.fx.play(n ? 'plop' : 'plop'); if (n) S.fx.play('flap');
        Object.assign(N, { st: n ? 'haul' : 'empty', n, prog: 0, ten: 0, t: 0, hold: false });
        if (!n) S.msg = { t: wrong ? tr('배 오른편에 던지라') : tr('허탕!'), c: '#cfd8e0', at: wrong ? 1.4 : 0.9, x: N.x, y: N.y - 30 };
        else S.msg = { t: tr('{0}마리!', n), c: '#ffe29a', at: 1, x: N.x, y: N.y - 34 };
      }
    } else if (N.st === 'empty') { N.t += dt; if (N.t > 0.55) N.st = 'ready'; }
    else if (N.st === 'haul') {
      // 끌어올리기: 누르는 동안 나아가고 팽팽해진다. 놓으면 풀린다. 고기가 많을수록 빨리 팽팽
      const load = 0.32 + N.n / 52;
      if (N.stall && N.ten < 0.4) N.stall = false; // 그물이 너무 무거우면 잠깐 놓았다 당겨야 다시 올라온다(찢어지지는 않는다 — 요 21:11)
      if (N.hold) { if (!N.stall) N.prog += dt * 0.95; N.ten = Math.min(1, N.ten + dt * load); if (Math.random() < dt * 6) S.fx.play('creak'); }
      else N.ten = Math.max(0, N.ten - dt * 1.1);
      if (N.ten >= 1 && this.noTear) { if (!N.stall) { N.stall = true; S.fx.play('creak'); S.msg = { t: tr('너무 무거워요 — 잠깐 놓았다 당겨요'), c: '#ffd0a0', at: 1.1, x: N.x, y: N.y - 34 }; } }
      else if (N.ten >= 1) { // 찢어졌다
        const lost = Math.ceil(N.n / 2); N.n -= lost; N.ten = 0.35; N.hold = false; S.fx.play('rip');
        S.msg = { t: tr('그물이 찢어졌어요 -{0}', lost), c: '#ffb38a', at: 1.3, x: N.x, y: N.y - 34 };
        for (let i = 0; i < lost; i++) S.rip.push({ x: N.x + rnd(-20, 20), y: N.y + rnd(-10, 10), vx: rnd(-60, 60), vy: rnd(-40, 40), life: rnd(0.5, 0.9) });
      }
      if (N.prog >= 1) { // 배에 올렸다
        S.got += N.n; S.fx.play('haul'); S.boatY = Math.min(9, S.got / S.goal * 9);
        S.msg = { t: `+${N.n}`, c: '#ffe29a', at: 1, x: BOAT[0], y: BOAT[1] - 40 };
        for (let i = 0; i < 12; i++) S.sparks.push({ x: BOAT[0] + rnd(-50, 50), y: BOAT[1] - rnd(0, 20), vy: rnd(-60, -20), life: rnd(0.5, 1), r: rnd(1.5, 3) });
        N.st = 'ready';
      }
    }
    for (const p of S.sparks) { p.y += p.vy * dt; p.life -= dt; } S.sparks = S.sparks.filter(p => p.life > 0);
    for (const p of S.rip) { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; } S.rip = S.rip.filter(p => p.life > 0);
    if (S.msg) S.msg.at -= dt;
  },
  down(x, y, S) {
    const N = S.net;
    if (N.st === 'ready' && y < BOAT[1] - 30) { // 던진다: 멀수록 오래 난다
      const d = Math.hypot(x - BOAT[0], y - BOAT[1]);
      Object.assign(N, { st: 'fly', x, y, t: 0, dur: 0.3 + d / 620 }); S.fx.play('cast');
    } else if (N.st === 'haul') N.hold = true;
  },
  up(S) { if (S.net.st === 'haul') S.net.hold = false; },
  won: S => S.got >= S.goal,
  draw(g, S) {
    lake(g, S, this.bg); this.under?.(g, S);
    for (const f of S.schools) drawSchool(g, f);
    const N = S.net;
    drawBoat(g, S);
    if (N.st === 'fly') { // 날아가는 그물: 배에서 포물선으로, 점점 펼쳐진다
      const k = N.t / N.dur, x = BOAT[0] + (N.x - BOAT[0]) * k, y = BOAT[1] - 20 + (N.y - BOAT[1] + 20) * k - Math.sin(k * Math.PI) * 60;
      g.strokeStyle = 'rgba(80,60,40,.6)'; g.lineWidth = 1; g.beginPath(); g.moveTo(BOAT[0], BOAT[1] - 20); g.quadraticCurveTo((BOAT[0] + x) / 2, y - 30, x, y); g.stroke();
      drawNet(g, x, y, NET_R * (0.35 + 0.65 * k), 0, null);
      g.strokeStyle = 'rgba(255,255,255,.35)'; g.setLineDash([3, 4]); g.beginPath(); g.arc(N.x, N.y, NET_R, 0, 7); g.stroke(); g.setLineDash([]);
    } else if (N.st === 'empty') drawNet(g, N.x, N.y, NET_R, 0, null, 1 - N.t / 0.55);
    else if (N.st === 'haul') {
      const x = N.x + (BOAT[0] - N.x) * ease(N.prog), y = N.y + (BOAT[1] - 20 - N.y) * ease(N.prog);
      g.strokeStyle = N.ten > 0.75 ? '#ff7a5c' : 'rgba(80,60,40,.85)'; g.lineWidth = 1.5 + N.ten * 1.5; g.beginPath(); g.moveTo(BOAT[0], BOAT[1] - 20); g.lineTo(x, y); g.stroke();
      drawNet(g, x, y, NET_R * (1 - N.prog * 0.45), N.n, N.ten);
      // 팽팽함 고리
      g.lineWidth = 5; g.strokeStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.arc(x, y, NET_R * (1 - N.prog * 0.45) + 9, 0, 7); g.stroke();
      g.strokeStyle = N.ten > 0.75 ? '#ff5a3c' : N.ten > 0.5 ? '#ffc35c' : '#9fe0a0'; g.beginPath(); g.arc(x, y, NET_R * (1 - N.prog * 0.45) + 9, -Math.PI / 2, -Math.PI / 2 + N.ten * Math.PI * 2); g.stroke();
      if (!N.hold) { g.font = '800 14px "Noto Sans KR",sans-serif'; g.textAlign = 'center'; g.lineWidth = 4; g.strokeStyle = 'rgba(10,20,30,.7)'; g.strokeText(tr('누르고 있어 끌어올리기'), x, y + NET_R + 26); g.fillStyle = '#fff'; g.fillText(tr('누르고 있어 끌어올리기'), x, y + NET_R + 26); }
    }
    for (const p of S.rip) { g.fillStyle = `rgba(200,215,225,${clamp(p.life, 0, 1)})`; fish(g, p.x, p.y, Math.atan2(p.vy, p.vx), 1, 1); }
    for (const p of S.sparks) { g.fillStyle = `rgba(255,226,150,${clamp(p.life, 0, 1)})`; star(g, p.x, p.y, p.r * 2.2); }
    floatMsg(g, S.msg);
    g.save(); g.font = '700 14px "Noto Sans KR",sans-serif'; g.textAlign = 'left'; g.fillStyle = 'rgba(255,255,255,.92)'; g.lineWidth = 3; g.strokeStyle = 'rgba(10,25,40,.6)';
    g.strokeText(tr('잡은 고기 {0} / {1}', S.got, S.goal), 16, 26); g.fillText(tr('잡은 고기 {0} / {1}', S.got, S.goal), 16, 26); g.restore();
  },
  end(g, k, S) { S.boatY = 9 + ease(k) * 7; S.net.st = 'done'; this.draw(g, S);
    if (k > 0.3) { g.save(); g.globalAlpha = clamp((k - 0.3) * 2, 0, 1); g.font = '700 19px "Gowun Batang",serif'; g.textAlign = 'center';
      g.lineWidth = 5; g.strokeStyle = 'rgba(8,20,32,.75)'; const [a, r] = this.endLine || [tr('이제 후로는 사람을 취하리라'), tr('눅 5:10')]; g.strokeText(a, W / 2, 120); g.fillStyle = '#eaf4ff'; g.fillText(a, W / 2, 120);
      g.font = '600 12px "Noto Sans KR",sans-serif'; g.fillStyle = '#bcd6ea'; g.fillText(r, W / 2, 139); g.restore(); }
  },
};
// 고기 떼 하나: 위(깊은 데)일수록 크고 느리다. 처음 넷은 화면 안에, 그 뒤로는 양옆에서 들어온다
function school(inside) {
  const deep = Math.random() < 0.6, y = deep ? rnd(90, 230) : rnd(240, 380), n = deep ? Math.round(rnd(14, 34)) : Math.round(rnd(5, 13));
  const dir = Math.random() < 0.5 ? 1 : -1, sp = deep ? rnd(22, 42) : rnd(35, 60), r = 14 + Math.sqrt(n) * 4.2;
  const fishList = Array.from({ length: n }, () => { const a = rnd(0, 7), d = Math.sqrt(Math.random()) * r; return { x: Math.cos(a) * d, y: Math.sin(a) * d * 0.6, ph: rnd(0, 6), gone: false }; });
  return { x: inside ? rnd(60, W - 60) : dir > 0 ? -70 : W + 70, y, vx: dir * sp, vy: rnd(-4, 4), n, fish: fishList, t: 0, ph: rnd(0, 6) };
}
function fish(g, x, y, a, s = 1, al = 1) { g.save(); g.translate(x, y); g.rotate(a); g.globalAlpha *= al; g.beginPath(); g.ellipse(0, 0, 6 * s, 2.3 * s, 0, 0, 7); g.moveTo(-5 * s, 0); g.lineTo(-10 * s, -3 * s); g.lineTo(-10 * s, 3 * s); g.closePath(); g.fill(); g.restore(); }
function drawSchool(g, f) {
  const a = f.vx > 0 ? 0 : Math.PI;
  // 수면 아래 어두운 그림자 + 은빛 반짝임 (떼가 클수록 진하게)
  const r = 14 + Math.sqrt(f.n) * 4.2, sh = g.createRadialGradient(f.x, f.y, 2, f.x, f.y, r * 1.3);
  sh.addColorStop(0, 'rgba(10,30,45,.35)'); sh.addColorStop(1, 'rgba(10,30,45,0)'); g.fillStyle = sh; g.beginPath(); g.ellipse(f.x, f.y, r * 1.3, r * 0.9, 0, 0, 7); g.fill();
  for (const o of f.fish) { if (o.gone) continue; const w = Math.sin(f.t * 7 + o.ph);
    g.fillStyle = w > 0.85 ? 'rgba(220,235,245,.85)' : 'rgba(20,45,60,.7)'; fish(g, f.x + o.x + Math.sin(f.t * 2 + o.ph) * 2, f.y + o.y, a + w * 0.15, 1); }
}
function drawNet(g, x, y, r, n, ten, al = 1) {
  g.save(); g.globalAlpha = al; g.translate(x, y);
  g.fillStyle = 'rgba(230,220,190,.12)'; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill();
  g.strokeStyle = ten > 0.75 ? 'rgba(255,170,140,.9)' : 'rgba(235,225,195,.75)'; g.lineWidth = 1;
  g.beginPath(); g.arc(0, 0, r, 0, 7); g.clip();
  for (let k = -r; k <= r; k += 8) { g.beginPath(); g.moveTo(k, -r); g.lineTo(k + r * 0.3, r); g.stroke(); g.beginPath(); g.moveTo(-r, k); g.lineTo(r, k - r * 0.3); g.stroke(); }
  // 걸린 고기: 그물 안에서 퍼덕인다
  const t = performance.now() / 120;
  for (let i = 0; i < Math.min(n, 40); i++) { const a = i * 2.39, d = Math.sqrt((i + 0.5) / Math.max(n, 1)) * r * 0.8;
    g.fillStyle = (i + Math.floor(t)) % 5 ? 'rgba(200,215,225,.95)' : 'rgba(255,255,255,1)'; fish(g, Math.cos(a) * d, Math.sin(a) * d, a + Math.sin(t + i) * 0.5, 0.85); }
  g.restore();
  g.save(); g.globalAlpha = al; g.strokeStyle = 'rgba(150,120,80,.9)'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke();
  g.fillStyle = '#7a6a55'; for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5; g.beginPath(); g.arc(x + Math.cos(a) * r, y + Math.sin(a) * r, 2, 0, 7); g.fill(); } // 그물 추
  g.restore();
}
// 새벽의 갈릴리 바다: 밤새 허탕친 뒤(눅 5:5) — 먼 기슭의 언덕, 동트는 하늘빛이 물에 비침
function lake(g, S, bg = 'e17/bg') {
  if (bgArt(g, bg)) { const t = performance.now() / 1000; for (const [x, y, p] of S.shine) { const a = (Math.sin(t * 1.3 + p) + 1) / 2; g.strokeStyle = `rgba(255,236,200,${a * 0.22})`; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x - 9, y); g.quadraticCurveTo(x, y - 3, x + 9, y); g.stroke(); } return; }
  const w = g.createLinearGradient(0, 0, 0, H); w.addColorStop(0, '#1d4560'); w.addColorStop(0.5, '#2a6a86'); w.addColorStop(1, '#3d8aa2');
  g.fillStyle = w; g.fillRect(0, 0, W, H);
  const sky = g.createLinearGradient(0, 0, 0, 62); sky.addColorStop(0, '#f2c58c'); sky.addColorStop(1, '#e89a6a'); g.fillStyle = sky; g.fillRect(0, 0, W, 62);
  g.fillStyle = '#5c5a4a'; g.beginPath(); g.moveTo(0, 62); for (let x = 0; x <= W; x += 20) g.lineTo(x, 44 + Math.sin(x * 0.02) * 8 + Math.sin(x * 0.07) * 3); g.lineTo(W, 62); g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,210,150,.25)'; g.fillRect(0, 60, W, 4);
  // 깊은 데 표시: 위쪽 물빛이 짙다
  const d = g.createLinearGradient(0, 64, 0, 260); d.addColorStop(0, 'rgba(5,20,40,.35)'); d.addColorStop(1, 'rgba(5,20,40,0)'); g.fillStyle = d; g.fillRect(0, 64, W, 200);
  g.font = '600 11px "Noto Sans KR",sans-serif'; g.fillStyle = 'rgba(220,235,245,.45)'; g.textAlign = 'right'; g.fillText(tr('깊은 데'), W - 12, 84);
  // 물결 반짝임
  const t = performance.now() / 1000;
  for (const [x, y, p] of S.shine) { const a = (Math.sin(t * 1.3 + p) + 1) / 2; g.strokeStyle = `rgba(255,230,190,${0.08 + a * 0.18})`; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x - 9, y); g.quadraticCurveTo(x, y - 3, x + 9, y); g.stroke(); }
}
function drawBoat(g, S) {
  const [x, y0] = BOAT, y = y0 + S.boatY;
  if (art('e17/boat')) { // 그림 배 — 실은 고기는 배 안에 코드로 쌓는다
    g.save(); g.fillStyle = 'rgba(10,30,45,.35)'; g.beginPath(); g.ellipse(x, y0 + 16, 110, 16, 0, 0, 7); g.fill();
    spr(g, 'e17/boat', x, y + 40, 132);
    const n = Math.min(60, Math.round(S.got / (S.goal || GOAL) * 60));
    for (let i = 0; i < n; i++) { const fx = x - 70 + (i * 37 % 140), fy = y - 28 + ((i * 13) % 12) - Math.floor(i / 20) * 3; g.fillStyle = i % 4 ? '#c9d6dd' : '#e8f0f4'; fish(g, fx, fy, (i * 1.7) % 6.28, 0.8); }
    g.strokeStyle = 'rgba(220,240,250,.45)'; g.lineWidth = 2; for (let k = 0; k < 3; k++) { g.beginPath(); g.ellipse(x, y0 + 30 + k * 6, 96 + k * 14, 9 + k * 3, 0, 0.1, Math.PI - 0.1); g.stroke(); } // 뱃전의 물결
    g.restore(); return; }
  g.save();
  g.fillStyle = 'rgba(10,30,45,.35)'; g.beginPath(); g.ellipse(x, y0 + 14, 92, 14, 0, 0, 7); g.fill();
  const h = g.createLinearGradient(0, y - 22, 0, y + 20); h.addColorStop(0, '#8a5a34'); h.addColorStop(1, '#4a2c16');
  g.fillStyle = h; g.beginPath(); g.moveTo(x - 92, y - 16); g.quadraticCurveTo(x, y + 30, x + 92, y - 16); g.lineTo(x + 80, y - 22); g.lineTo(x - 80, y - 22); g.closePath(); g.fill();
  g.fillStyle = '#3a2210'; g.beginPath(); g.moveTo(x - 80, y - 22); g.lineTo(x + 80, y - 22); g.quadraticCurveTo(x, y + 8, x - 80, y - 22); g.fill();
  // 실은 고기 (잡을수록 배 안이 찬다)
  const n = Math.min(60, Math.round(S.got / (S.goal || GOAL) * 60));
  for (let i = 0; i < n; i++) { const fx = x - 60 + (i * 37 % 120), fy = y - 14 + ((i * 13) % 9) - Math.floor(i / 20) * 3; g.fillStyle = i % 4 ? '#c9d6dd' : '#e8f0f4'; fish(g, fx, fy, (i * 1.7) % 6.28, 0.8); }
  g.strokeStyle = 'rgba(255,220,170,.25)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 86, y - 18); g.quadraticCurveTo(x, y + 22, x + 86, y - 18); g.stroke();
  // 물에 잠긴 가장자리 (가득 차면 배가 잠길 지경 — 눅 5:7)
  const wl = g.createLinearGradient(0, y0 + 2, 0, y0 + 26); wl.addColorStop(0, 'rgba(61,138,162,.0)'); wl.addColorStop(0.3, 'rgba(61,138,162,.85)'); wl.addColorStop(1, 'rgba(61,138,162,.95)');
  g.fillStyle = wl; g.fillRect(x - 100, y0 + 4, 200, 30);
  g.restore();
}
function floatMsg(g, m) {
  if (!m || m.at <= 0) return;
  const a = clamp(m.at * 2, 0, 1), rise = (1 - clamp(m.at, 0, 1)) * 14;
  g.save(); g.globalAlpha = a; g.font = '800 17px "Noto Sans KR",sans-serif'; g.textAlign = 'center';
  const hw = g.measureText(m.t).width / 2 + 10, x = clamp(m.x, hw, W - hw); // 글 길이만큼 안쪽으로 — 긴 글이 화면 밖으로 잘렸다
  g.lineWidth = 4; g.strokeStyle = 'rgba(15,20,25,.8)'; g.strokeText(m.t, x, m.y - rise); g.fillStyle = m.c; g.fillText(m.t, x, m.y - rise); g.restore();
}

/* ---------- 빈 들의 만찬 (막 6:30–44, 눅 9:10–17): 오십 명씩 앉히기 — 머리 쓰는 놀이 ---------- */
// 크기가 다른 가족들을 끌어다 풀밭 넷에 앉힌다. 풀밭마다 꼭 50명(눅 9:14 '떼를 지어 한 오십 명씩') — 넘치면 들어가지 않는다.
// 앉힌 가족을 누르면 다시 빠진다. 어디에도 맞지 않는 가족이 둘 섞여 있어, 아무렇게나 넣으면 막힌다(풀밭마다 꼭 맞는 묶음은 있다).
// 넷이 다 차면 그분이 축사하시고 떡과 물고기가 무리마다 흘러가며, 남은 조각이 열두 바구니(눅 9:17)
const PATCH = 50, PATCHES = [[106, 128], [294, 128], [106, 262], [294, 262]];
const loaves = {
  title: tr('빈 들의 만찬'), task: tr('풀밭마다 꼭 오십 명씩'),
  ask: [tr('이 많은 사람을 먹이려면 먼저 질서 있게 앉혀야겠지.'), tr('푸른 풀밭에 오십 명씩 무리 지어 앉혀 다오 — 넘치지도 모자라지도 않게!')],
  quote: tr('떼를 지어 한 오십 명씩 앉히라'), ref: tr('눅 9:14'),
  help: tr('가족을 끌어다 풀밭에 놓아요. 풀밭마다 꼭 50명이어야 해요.<br>앉힌 가족을 누르면 다시 빠져요. 어디에도 맞지 않는 가족이 둘 섞여 있어요.'),
  art: ['e31/bg', 'e31/fam-a', 'e31/fam-b', 'e31/fam-c', 'e31/bread', 'e31/fish'],
  seconds: 55,
  init() {
    // 풀밭마다 50을 3~4 묶음으로 나눠 가족을 만들고, 맞지 않는 가족 둘을 섞는다 — 늘 풀 수 있게
    const fams = [];
    for (let k = 0; k < 4; k++) {
      let ns; do { const parts = Math.random() < 0.5 ? 3 : 4; let left = PATCH; ns = [];
        for (let i = 0; i < parts; i++) { const n = i === parts - 1 ? left : Math.round(rnd(5, Math.min(left - (parts - i - 1) * 5, 24))); ns.push(n); left -= n; }
      } while (ns.some(n => n < 4 || n > 26)); // 너무 작거나 큰 가족은 다시
      fams.push(...ns);
    }
    for (let i = 0; i < 2; i++) fams.push([7, 9, 11, 13, 17, 19, 23][Math.floor(Math.random() * 7)]); // 남는 가족 (홀수라 어디에 넣으면 50을 깨기 쉽다)
    fams.sort(() => Math.random() - 0.5);
    const S = { fams: fams.map((n, i) => ({ n, i, at: -1, x: 0, y: 0, hue: [28, 200, 340, 120, 48, 265][i % 6], bob: rnd(0, 6) })), drag: null, msg: null, sparks: [], shake: [0, 0, 0, 0], flow: 0 };
    S.relayout = () => layout(S); layout(S); return S; // relayout: 확인용
  },
  update(dt, S) {
    for (const f of S.fams) if (f !== S.drag?.f) { f.x += (f.tx - f.x) * Math.min(1, dt * 14); f.y += (f.ty - f.y) * Math.min(1, dt * 14); }
    for (let k = 0; k < 4; k++) S.shake[k] = Math.max(0, S.shake[k] - dt * 3);
    for (const p of S.sparks) { p.x += (p.vx || 0) * dt; p.y += p.vy * dt; p.life -= dt; } S.sparks = S.sparks.filter(p => p.life > 0);
    if (S.msg) S.msg.at -= dt;
  },
  down(x, y, S) {
    const f = [...S.fams].reverse().find(f => Math.hypot(f.x - x, f.y - y) < famR(f) + 6);
    if (!f) return;
    S.drag = { f, dx: f.x - x, dy: f.y - y, x0: x, y0: y, moved: false }; S.fx.play('pick');
  },
  move(x, y, S) { const D = S.drag; if (!D) return; if (Math.hypot(x - D.x0, y - D.y0) > 6) D.moved = true; D.f.x = x + D.dx; D.f.y = y + D.dy; },
  up(S, x, y) {
    const D = S.drag; if (!D) return; S.drag = null; const f = D.f;
    if (!D.moved) { if (f.at >= 0) { f.at = -1; S.fx.play('drop'); layout(S); } return; } // 앉힌 가족을 누르면 빠진다
    const k = PATCHES.findIndex(([px, py]) => Math.abs(x - px) < 92 && Math.abs(y - py) < 62);
    if (k < 0) { f.at = -1; layout(S); return; }
    const sum = S.fams.filter(o => o.at === k && o !== f).reduce((a, o) => a + o.n, 0);
    if (sum + f.n > PATCH) { // 넘친다 — 들어가지 않는다
      S.shake[k] = 1; S.fx.play('wrong'); S.msg = { t: tr('{0}명 — 넘쳐요', sum + f.n), c: '#ffb38a', at: 1, x: PATCHES[k][0], y: PATCHES[k][1] - 50 };
      layout(S); return;
    }
    f.at = k; layout(S); S.fx.play('drop');
    if (sum + f.n === PATCH) { S.fx.play('plink'); S.msg = { t: tr('오십 명!'), c: '#ffe29a', at: 1, x: PATCHES[k][0], y: PATCHES[k][1] - 50 };
      for (let i = 0; i < 16; i++) S.sparks.push({ x: PATCHES[k][0] + rnd(-80, 80), y: PATCHES[k][1] + rnd(-45, 45), vy: rnd(-40, -10), life: rnd(0.5, 1.1), r: rnd(1.5, 3) }); }
  },
  won: S => PATCHES.every((_, k) => S.fams.filter(f => f.at === k).reduce((a, f) => a + f.n, 0) === PATCH),
  draw(g, S) {
    meadow(g);
    for (const [k, [px, py]] of PATCHES.entries()) {
      const sum = S.fams.filter(f => f.at === k).reduce((a, f) => a + f.n, 0), full = sum === PATCH, sx = Math.sin(S.shake[k] * 30) * S.shake[k] * 6;
      g.save(); g.translate(px + sx, py);
      g.fillStyle = full ? 'rgba(200,240,140,.32)' : 'rgba(150,200,100,.22)'; g.strokeStyle = full ? 'rgba(255,230,150,.95)' : S.shake[k] > 0 ? '#ff8a6a' : 'rgba(255,255,255,.45)';
      g.lineWidth = full ? 3 : 2; g.setLineDash(full ? [] : [6, 5]); g.beginPath(); g.ellipse(0, 0, 88, 58, 0, 0, 7); g.fill(); g.stroke(); g.setLineDash([]);
      // 몇 명 찼는지: 아래 막대 + 숫자
      g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(-50, 44, 100, 7); g.fillStyle = full ? '#ffe29a' : '#bfe7a0'; g.fillRect(-50, 44, 100 * sum / PATCH, 7);
      g.font = '800 15px "Noto Sans KR",sans-serif'; g.textAlign = 'center'; g.lineWidth = 3; g.strokeStyle = 'rgba(20,40,10,.6)';
      const t = full ? '50 ✓' : `${sum} / 50`; g.strokeText(t, 0, -40); g.fillStyle = full ? '#ffe29a' : '#fff'; g.fillText(t, 0, -40);
      g.restore();
    }
    // 떡과 물고기가 흘러가는 연출(성공 뒤)
    if (S.flow > 0) for (const [k, [px, py]] of PATCHES.entries()) for (let i = 0; i < 4; i++) {
      const t = (S.flow * 1.4 - i * 0.12 - k * 0.08); if (t <= 0 || t >= 1) continue;
      const x = 200 + (px - 200) * t, y = 430 + (py - 430) * t - Math.sin(t * Math.PI) * 40; bread(g, x, y, i % 2);
    }
    // 풀밭 아래 기다리는 곳
    g.fillStyle = 'rgba(40,60,20,.25)'; g.fillRect(0, 342, W, 2);
    g.font = '600 11px "Noto Sans KR",sans-serif'; g.textAlign = 'left'; g.fillStyle = 'rgba(255,255,255,.6)'; g.fillText(tr('기다리는 가족'), 14, 360);
    for (const f of S.fams) if (f !== S.drag?.f) drawFam(g, f, false);
    if (S.drag) drawFam(g, S.drag.f, true);
    for (const p of S.sparks) { g.fillStyle = `rgba(255,226,150,${clamp(p.life, 0, 1)})`; star(g, p.x, p.y, p.r * 2.2); }
    floatMsg(g, S.msg);
    const done = PATCHES.filter((_, k) => S.fams.filter(f => f.at === k).reduce((a, f) => a + f.n, 0) === PATCH).length;
    g.save(); g.font = '700 14px "Noto Sans KR",sans-serif'; g.textAlign = 'left'; g.lineWidth = 3; g.strokeStyle = 'rgba(20,40,10,.55)'; g.fillStyle = '#fff';
    g.strokeText(tr('앉힌 무리 {0} / 4', done), 16, 26); g.fillText(tr('앉힌 무리 {0} / 4', done), 16, 26); g.restore();
  },
  end(g, k, S) {
    S.flow = k; this.draw(g, S);
    if (k > 0.55) { // 남은 조각 열두 바구니
      const a = clamp((k - 0.55) * 3, 0, 1);
      g.save(); g.globalAlpha = a; g.fillStyle = 'rgba(30,20,10,.55)'; g.fillRect(0, 360, W, 140);
      for (let i = 0; i < 12; i++) basket(g, 34 + (i % 6) * 66, 400 + Math.floor(i / 6) * 50, Math.min(1, (k - 0.55) * 4 - i * 0.05));
      g.font = '700 16px "Gowun Batang",serif'; g.textAlign = 'center'; g.fillStyle = '#ffe9c8'; g.lineWidth = 4; g.strokeStyle = 'rgba(30,20,10,.7)';
      g.strokeText(tr('남은 조각을 열두 바구니에 거두니라'), W / 2, 382); g.fillText(tr('남은 조각을 열두 바구니에 거두니라'), W / 2, 382);
      g.font = '600 11px "Noto Sans KR",sans-serif'; g.fillStyle = '#e9d6b4'; g.fillText(tr('눅 9:17'), W / 2, 497); g.restore();
    }
  },
};
const famR = f => 15 + Math.sqrt(f.n) * 2.6;
// 자리: 풀밭에 앉은 가족은 그 풀밭 안에 둥글게, 기다리는 가족은 아래 칸에 줄지어
function layout(S) {
  for (let k = 0; k < 4; k++) { const in_ = S.fams.filter(f => f.at === k), [px, py] = PATCHES[k];
    in_.forEach((f, i) => { const a = -Math.PI / 2 + i * (Math.PI * 2 / Math.max(in_.length, 1)) + 0.4, r = in_.length > 1 ? 34 : 0; f.tx = px + Math.cos(a) * r * 1.35; f.ty = py + 4 + Math.sin(a) * r * 0.62; }); }
  const wait = S.fams.filter(f => f.at < 0);
  wait.forEach((f, i) => { const c = i % 6, r = Math.floor(i / 6); f.tx = 36 + c * 66; f.ty = 386 + r * 44 + (c % 2) * 6; });
  for (const f of S.fams) if (!f.x) { f.x = f.tx; f.y = f.ty; }
}
function drawFam(g, f, lifted) {
  const r = famR(f), t = performance.now() / 1000;
  if (art('e31/fam-a')) { // 그림 가족 — 큰 가족일수록 크게, 숫자 표는 오른쪽 위
    g.save(); g.translate(f.x, f.y + (lifted ? -4 : Math.sin(t * 2 + f.bob) * 1)); if (lifted) g.scale(1.12, 1.12);
    spr(g, `e31/fam-${'abc'[Math.round(f.hue) % 3]}`, 0, r * 0.8, r * 1.75);
    const bx = r * 0.85, by = -r * 0.75; g.fillStyle = 'rgba(30,24,12,.75)'; g.beginPath(); g.arc(bx, by, 13, 0, 7); g.fill(); g.strokeStyle = '#ffe29a'; g.lineWidth = 1.5; g.stroke();
    g.font = '800 14px "Noto Sans KR",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff'; g.fillText(f.n, bx, by + 1); g.restore(); return; }
  g.save(); g.translate(f.x, f.y + (lifted ? -4 : Math.sin(t * 2 + f.bob) * 1));
  g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(0, r * 0.8 + (lifted ? 10 : 2), r * 0.9, 4, 0, 0, 7); g.fill();
  if (lifted) g.scale(1.12, 1.12);
  const c = g.createRadialGradient(-r * 0.3, -r * 0.4, 2, 0, 0, r);
  c.addColorStop(0, `hsl(${f.hue},45%,72%)`); c.addColorStop(1, `hsl(${f.hue},40%,42%)`);
  g.fillStyle = c; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 1.5; g.stroke();
  // 사람 머리 몇 개(가족이 클수록 많이) — 숫자만 있으면 그냥 숫자 놀이 같았다
  const heads = Math.min(5, 1 + Math.floor(f.n / 5));
  for (let i = 0; i < heads; i++) { const a = Math.PI + (i + 0.5) / heads * Math.PI; g.fillStyle = `hsl(${f.hue},30%,28%)`; g.beginPath(); g.arc(Math.cos(a) * r * 0.62, Math.sin(a) * r * 0.62 + 2, r * 0.17, 0, 7); g.fill(); }
  g.font = `800 ${Math.round(r * 0.78)}px "Noto Sans KR",sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.lineWidth = 3; g.strokeStyle = 'rgba(30,20,10,.55)'; g.strokeText(f.n, 0, r * 0.18); g.fillStyle = '#fff'; g.fillText(f.n, 0, r * 0.18);
  g.restore();
}
// 갈릴리 빈 들: 봄의 푸른 풀(막 6:39), 멀리 호수
function meadow(g) {
  if (bgArt(g, 'e31/bg')) return;
  const s = g.createLinearGradient(0, 0, 0, H); s.addColorStop(0, '#9cc7d8'); s.addColorStop(0.09, '#c9dfc0'); s.addColorStop(0.1, '#7fae5a'); s.addColorStop(0.7, '#5f9440'); s.addColorStop(1, '#3f6a2a');
  g.fillStyle = s; g.fillRect(0, 0, W, H);
  g.fillStyle = '#6a9fb8'; g.beginPath(); g.moveTo(0, 46); g.quadraticCurveTo(200, 36, W, 48); g.lineTo(W, 52); g.lineTo(0, 52); g.fill();
  g.strokeStyle = 'rgba(30,60,20,.25)'; g.lineWidth = 1;
  for (let i = 0; i < 70; i++) { const x = (i * 97) % W, y = 60 + ((i * 53) % 420); g.beginPath(); g.moveTo(x, y); g.lineTo(x - 2, y - 6); g.moveTo(x + 3, y); g.lineTo(x + 4, y - 7); g.stroke(); }
  g.fillStyle = 'rgba(255,240,200,.5)'; for (let i = 0; i < 26; i++) { g.beginPath(); g.arc((i * 151) % W, 70 + (i * 71) % 400, 1.6, 0, 7); g.fill(); } // 들꽃
}
function bread(g, x, y, fishy) {
  if (spr(g, fishy ? 'e31/fish' : 'e31/bread', x, y, fishy ? 12 : 16, { ay: 0.5 })) return;
  g.save(); g.translate(x, y);
  if (fishy) { g.fillStyle = '#c9d6dd'; fish(g, 0, 0, 0, 1.6); }
  else { g.fillStyle = '#d9a55a'; g.beginPath(); g.ellipse(0, 0, 9, 6, 0, 0, 7); g.fill(); g.strokeStyle = '#a8742e'; g.lineWidth = 1; g.beginPath(); g.moveTo(-5, -2); g.lineTo(5, -2); g.stroke(); }
  g.restore();
}
function basket(g, x, y, k) {
  if (k <= 0) return;
  g.save(); g.translate(x, y); g.scale(k, k);
  g.fillStyle = '#9a6a32'; g.beginPath(); g.moveTo(-20, -8); g.lineTo(20, -8); g.lineTo(15, 14); g.lineTo(-15, 14); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(60,35,10,.6)'; g.lineWidth = 1; for (let i = -6; i <= 14; i += 5) { g.beginPath(); g.moveTo(-20, i); g.lineTo(20, i); g.stroke(); }
  g.fillStyle = '#e0b46a'; for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(-12 + i * 8, -10, 6, 4, 0, 0, 7); g.fill(); }
  g.restore();
}

/* ---------- 열두 사람을 세우시다 (막 3:13–19): 이름과 그 사람의 이야기 짝 맞추기 — 기억력 ---------- */
// 이름 카드 열둘과 이야기 카드 열둘. 처음 3초 모두 보여 준 뒤 뒤집는다. 두 장씩 뒤집어 같은 사람이면 남고, 아니면 다시 덮인다.
// 제자 얼굴 그림이 넷뿐이라 얼굴 대신 성경에 나오는 그 사람의 이야기로 짝짓는다(외우게 되는 것이 덤)
const TWELVE = [
  [tr('시몬 베드로'), '🪨', tr('반석'), tr('마 16:18')], [tr('안드레'), '🐟', tr('형을 예수께 데려옴'), tr('요 1:41')],
  [tr('세베대의 아들 야고보'), '⚔️', tr('열둘 중 처음 순교'), tr('행 12:2')], [tr('요한'), '❤️', tr('예수께서 사랑하신 제자'), tr('요 13:23')],
  [tr('빌립'), '🍞', tr('"떡을 어디서 사서?"'), tr('요 6:5')], [tr('바돌로매 (나다나엘)'), '🌳', tr('무화과나무 아래'), tr('요 1:48')],
  [tr('마태'), '💰', tr('세관에 앉은 세리'), tr('마 9:9')], [tr('도마'), '✋', tr('"손을 넣어 보리라"'), tr('요 20:25')],
  [tr('알패오의 아들 야고보'), '🔹', tr('작은 야고보'), tr('막 15:40')], [tr('다대오'), '🕯️', tr('가룟인 아닌 유다'), tr('요 14:22')],
  [tr('열심당원 시몬'), '🔥', tr('열심당원'), tr('눅 6:15')], [tr('가룟 유다'), '👛', tr('돈궤를 맡은 자'), tr('요 12:6')],
];
const CW = 86, CH = 70, PEEK = 3.2;
const twelve = {
  title: tr('열두 사람을 세우시다'), task: tr('이름과 그 사람의 이야기 짝 맞추기'),
  ask: [tr('여기 모인 열두 사람, 서로 너무 다르지 않니?'), tr('누가 누구인지 기억해 다오 — 이름과 그 사람의 이야기를 짝지어 보렴.')],
  quote: tr('이에 열둘을 세우셨으니 이는 자기와 함께 있게 하시고'), ref: tr('막 3:14'),
  help: tr('처음 3초 동안 카드를 모두 보여 줘요 — 잘 봐 두세요.<br>두 장씩 뒤집어 이름과 그 사람의 이야기를 짝지어요. 틀리면 다시 덮여요.'),
  seconds: 95,
  art: ['e22/bg', 'e22/back', 'e22/face'],
  init() {
    // 카드는 덮인 채(up 0)로 만들어 소개 화면에서는 뒷면만 — 시작하면 뒤집혀 보인다
    const data = this.data || TWELVE, cards = data.flatMap((d, i) => [{ p: i, name: true }, { p: i, name: false }]).sort(() => Math.random() - 0.5);
    cards.forEach((c, k) => { c.x = 12 + (k % 4) * (CW + 9) + CW / 2 + 4; c.y = 48 + Math.floor(k / 4) * (CH + 6) + CH / 2; c.up = 0; c.want = 1; c.done = false; c.glow = 0; c.shake = 0; });
    return { cards, data, peek: PEEK, open: [], wait: 0, msg: null, sparks: [], pairs: 0, fin: 0, sc: this.scene || 'e22', icons: !!this.icons };
  },
  update(dt, S) {
    if (S.peek > 0) { S.peek -= dt; if (S.peek <= 0) { S.cards.forEach(c => c.want = 0); S.fx.play('flipall'); } }
    for (const c of S.cards) { c.up += (c.want - c.up) * Math.min(1, dt * 12); c.glow = Math.max(0, c.glow - dt); c.shake = Math.max(0, c.shake - dt * 2.5); }
    if (S.wait > 0) { S.wait -= dt; if (S.wait <= 0) { S.open.forEach(c => c.want = 0); S.open = []; } }
    for (const p of S.sparks) { p.y += p.vy * dt; p.life -= dt; } S.sparks = S.sparks.filter(p => p.life > 0);
    if (S.msg) S.msg.at -= dt;
  },
  down(x, y, S) {
    if (S.peek > 0 || S.wait > 0) return;
    const c = S.cards.find(c => !c.done && c.want === 0 && Math.abs(x - c.x) < CW / 2 && Math.abs(y - c.y) < CH / 2);
    if (!c) return;
    c.want = 1; S.open.push(c); S.fx.play('flip');
    if (S.open.length < 2) return;
    const [a, b] = S.open;
    if (a.p === b.p && a.name !== b.name) { // 짝
      a.done = b.done = true; a.glow = b.glow = 1; S.open = []; S.pairs++; S.fx.play('plink');
      const d = S.data[a.p]; S.msg = { t: `${d[0]} — ${d[3]}`, c: '#ffe29a', at: 1.6, x: W / 2, y: 30 };
      for (const o of [a, b]) for (let i = 0; i < 8; i++) S.sparks.push({ x: o.x + rnd(-30, 30), y: o.y + rnd(-20, 20), vy: rnd(-40, -10), life: rnd(0.4, 0.9), r: rnd(1.5, 2.6) });
    } else { a.shake = b.shake = 1; S.wait = 0.85; S.fx.play('miss'); }
  },
  up() {},
  won: S => S.pairs === 12,
  draw(g, S) {
    // 산 위(막 3:13): 저녁빛 언덕, 멀리 갈릴리 바다
    if (bgArt(g, `${S.sc}/bg`)) { g.fillStyle = 'rgba(10,10,20,.35)'; g.fillRect(0, 0, W, H); } // 카드가 도드라지게 조금 어둡게
    else { const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#2c3a4a'); bg.addColorStop(0.5, '#3c4a3a'); bg.addColorStop(1, '#2a2a1e');
    g.fillStyle = bg; g.fillRect(0, 0, W, H); }
    for (const c of S.cards) drawCard12(g, c, S);
    for (const p of S.sparks) { g.fillStyle = `rgba(255,226,150,${clamp(p.life, 0, 1)})`; star(g, p.x, p.y, p.r * 2.2); }
    if (S.peek > 0) { g.save(); g.font = '800 15px "Noto Sans KR",sans-serif'; g.textAlign = 'center'; g.fillStyle = '#ffe29a'; g.fillText(tr('잘 봐 두세요 · {0}', Math.ceil(S.peek)), W / 2, 30); g.restore(); }
    else if (!(S.msg && S.msg.at > 0)) { g.save(); g.font = '700 14px "Noto Sans KR",sans-serif'; g.textAlign = 'left'; g.fillStyle = 'rgba(255,255,255,.9)'; g.fillText(tr('맞춘 짝 {0} / 12', S.pairs), 16, 30); g.restore(); }
    if (S.msg && S.msg.at > 0) { g.save(); g.globalAlpha = clamp(S.msg.at * 2, 0, 1); g.font = '800 15px "Noto Sans KR",sans-serif'; g.textAlign = 'center'; g.fillStyle = S.msg.c; g.fillText(S.msg.t, W / 2, 30); g.restore(); }
  },
  end(g, k, S) {
    S.cards.forEach(c => { c.want = 1; c.up = 1; c.glow = 0.5 + Math.sin(performance.now() / 300 + c.p) * 0.3; }); this.draw(g, S);
    if (k > 0.2) { g.save(); g.globalAlpha = clamp((k - 0.2) * 2, 0, 1); g.fillStyle = 'rgba(15,18,12,.93)'; g.fillRect(0, 214, W, 92); g.fillStyle = 'rgba(230,194,117,.5)'; g.fillRect(0, 214, W, 1.5); g.fillRect(0, 304, W, 1.5); g.globalAlpha = clamp((k - 0.2) * 2, 0, 1);
      const [l1, l2, rf] = this.endLines || [tr('자기와 함께 있게 하시고'), tr('보내사 전도도 하게 하시려 함이러라'), tr('막 3:14')];
      g.font = '700 19px "Gowun Batang",serif'; g.textAlign = 'center'; g.fillStyle = '#ffe9c8'; g.fillText(l1, W / 2, 246);
      g.fillText(l2, W / 2, 272); g.font = '600 11px "Noto Sans KR",sans-serif'; g.fillStyle = '#d9c9a4'; g.fillText(rf, W / 2, 290); g.restore(); }
  },
};
function drawCard12(g, c, S) {
  const d = S.data[c.p], open = c.up > 0.5, sx = Math.abs(Math.cos(c.up * Math.PI)) || 0.02, sh = Math.sin(c.shake * 25) * c.shake * 4;
  g.save(); g.translate(c.x + sh, c.y); g.scale(sx, 1);
  g.fillStyle = 'rgba(0,0,0,.35)'; rrect(g, -CW / 2 + 2, -CH / 2 + 3, CW, CH, 8); g.fill();
  const back = art(`${S.sc}/back`), face = art('e22/face');
  if (!open && back) g.drawImage(back, -CW / 2, -CH / 2, CW, CH);
  else if (!open) { // 뒷면: 여정 금빛 무늬
    const b = g.createLinearGradient(0, -CH / 2, 0, CH / 2); b.addColorStop(0, '#5a4424'); b.addColorStop(1, '#3a2a14');
    g.fillStyle = b; rrect(g, -CW / 2, -CH / 2, CW, CH, 8); g.fill(); g.strokeStyle = 'rgba(230,194,117,.6)'; g.lineWidth = 1.5; g.stroke();
    g.strokeStyle = 'rgba(230,194,117,.35)'; rrect(g, -CW / 2 + 5, -CH / 2 + 5, CW - 10, CH - 10, 5); g.stroke();
    g.fillStyle = 'rgba(230,194,117,.75)'; g.font = '700 20px "Gowun Batang",serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('✝', 0, 1);
  } else {
    if (face) { g.save(); rrect(g, -CW / 2, -CH / 2, CW, CH, 8); g.clip(); g.drawImage(face, -CW / 2, -CH / 2, CW, CH); if (c.done) { g.fillStyle = 'rgba(255,230,160,.18)'; g.fillRect(-CW / 2, -CH / 2, CW, CH); } g.restore(); rrect(g, -CW / 2, -CH / 2, CW, CH, 8); }
    else { g.fillStyle = c.done ? '#f6ecd2' : '#efe5cf'; rrect(g, -CW / 2, -CH / 2, CW, CH, 8); g.fill(); }
    g.strokeStyle = c.done ? '#d9a84a' : 'rgba(90,70,40,.5)'; g.lineWidth = c.done ? 2.5 : 1; g.stroke();
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#2a1f14';
    if (c.name) { // 이름 카드 (icons: 축복 카드와 같은 그림 글자를 위에)
      const words = d[0].split(' '), two = d[0].length > 6 && words.length > 1, oy = S.icons ? 9 : 0;
      if (S.icons) { g.font = '17px "Apple Color Emoji","Noto Color Emoji",sans-serif'; g.fillText(d[1], 0, -14); }
      g.font = `800 ${d[0].length > 9 ? 13 : 15}px "Noto Sans KR",sans-serif`;
      if (two) { const h = Math.ceil(words.length / 2); g.fillText(words.slice(0, h).join(' '), 0, -9 + oy); g.fillText(words.slice(h).join(' '), 0, 10 + oy); } else g.fillText(d[0], 0, oy);
    } else { // 이야기 카드: 그림 글자 + 한 줄
      g.font = '24px "Apple Color Emoji","Noto Color Emoji",sans-serif'; g.fillText(d[1], 0, -12);
      let fs = 11; g.font = `600 ${fs}px "Noto Sans KR",sans-serif`; while (g.measureText(d[2]).width > CW - 8 && fs > 8) g.font = `600 ${--fs}px "Noto Sans KR",sans-serif`; // 카드 폭에 맞게
      g.fillStyle = '#5a4022'; g.fillText(d[2], 0, 19);
    }
    if (c.glow > 0) { g.strokeStyle = `rgba(255,220,120,${c.glow})`; g.lineWidth = 5; rrect(g, -CW / 2, -CH / 2, CW, CH, 8); g.stroke(); }
  }
  g.restore();
}
function rrect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }

/* ---------- 물 위로 오시는 분 (마 14:22–33): 예수님만 바라보고 물 위를 걷기 — 집중 ---------- */
// 시선(빛 고리)을 손가락으로 끌어 예수님께 맞춰 두면 한 걸음씩 다가간다. 돌풍이 시선을 휘몰아 가고, 번개가 번쩍인다.
// 시선이 예수님을 벗어나면 가라앉기 시작한다(마 14:30 '바람을 보고 무서워 빠져 가는지라') — 물이 차오르고, 다 잠기면 실패.
// 가까이 갈수록 바람이 세진다. 손가락은 고리를 가리지 않게 '밀어서' 움직인다(고리 위를 누르지 않아도 된다)
const GAZE = 44;
const water = {
  title: tr('물 위로 오시는 분'), task: tr('예수님만 바라보고 물 위를 걸어오기'),
  ask: [tr('베드로처럼 물 위로 걸어와 보겠니?'), tr('바람을 보지 말고 나만 바라보아라. 눈을 떼면 빠져 간다!')],
  quote: tr('오라 하시니 베드로가 배에서 내려 물 위로 걸어서 예수께로 가되'), ref: tr('마 14:29'),
  help: tr('화면을 끌면 빛 고리(시선)가 움직여요. 고리 안에 예수님을 두면 다가가요.<br>돌풍이 시선을 흔들어요 — 예수님을 놓치면 물에 빠져 가요.'),
  art: ['e32/bg', 'e32/calm', 'e32/jesus', 'e32/jesus-hand'],
  seconds: 26,
  init() { return { gx: 200, gy: art('e32/bg') ? 266 : 156, wvx: 0, wvy: 0, gustT: 1.6, prog: 0, sink: 0, flash: 0, boltT: rnd(2.5, 4), focus: true, t: 0, last: null, rain: Array.from({ length: 70 }, () => [rnd(0, W), rnd(0, H), rnd(0.6, 1)]), calm: 0 }; },
  jesus(S) { const hz = art('e32/bg') ? 262 : 150, k = S.prog; return { x: 200 + Math.sin(S.t * 0.7) * 46 + Math.sin(S.t * 1.9) * 12 * (1 - S.calm), y: hz + 26 + k * 150, s: 0.75 + k * 1.6 }; },
  update(dt, S) {
    S.t += dt; S.fx.storm?.(clamp(0.45 + S.prog * 0.55 - S.calm, 0, 1));
    // 돌풍: 가까이 갈수록 세다
    S.gustT -= dt;
    if (S.gustT <= 0 && !S.calm) { const a = rnd(0, Math.PI * 2), m = rnd(85, 150) * (1 + S.prog * 0.7); S.wvx += Math.cos(a) * m; S.wvy += Math.sin(a) * m * 0.7; S.gustT = rnd(0.8, 1.8) * (1 - S.prog * 0.3); S.fx.play('gust'); }
    S.wvx *= Math.exp(-dt * 1.8); S.wvy *= Math.exp(-dt * 1.8);
    S.gx = clamp(S.gx + (S.wvx + Math.sin(S.t * 1.3) * 14) * dt, 20, W - 20); S.gy = clamp(S.gy + (S.wvy + Math.cos(S.t * 1.1) * 10) * dt, 70, H - 40);
    S.boltT -= dt; if (S.boltT <= 0 && !S.calm) { S.flash = 1; S.boltT = rnd(2.6, 4.5); S.fx.play('thunder'); }
    S.flash = Math.max(0, S.flash - dt * 2.5);
    const j = this.jesus(S); S.focus = Math.hypot(S.gx - j.x, S.gy - (j.y - 30 * j.s)) < GAZE + 10 * j.s;
    if (S.calm) return;
    // 바라보면 13초에 닿고, 2.5초 놓치면 빠진다
    if (S.focus) { S.prog = Math.min(1, S.prog + dt / 13); S.sink = Math.max(0, S.sink - dt * 0.45); }
    else { const was = S.sink; S.sink = Math.min(1, S.sink + dt * 0.4); if (was < 0.3 && S.sink >= 0.3) S.fx.play('gurgle'); }
    for (const r of S.rain) { r[1] += 620 * r[2] * dt; r[0] -= 160 * dt; if (r[1] > H) { r[1] = -10; r[0] = rnd(0, W + 120); } }
  },
  down(x, y, S) { S.last = [x, y]; },
  move(x, y, S) { if (!S.last) return; S.gx = clamp(S.gx + (x - S.last[0]) * 1.15, 20, W - 20); S.gy = clamp(S.gy + (y - S.last[1]) * 1.15, 70, H - 40); S.last = [x, y]; },
  up(S) { S.last = null; },
  won: S => S.prog >= 1,
  lost: S => S.sink >= 1,
  failText: S => S.sink >= 1 ? tr('"주여 나를 구원하소서"') : tr('시간이 다 되었어요'), // 마 14:30
  draw(g, S) {
    if (art('e32/bg')) return this.drawArt(g, S);
    const hz = 150, c = S.calm;
    // 밤하늘과 구름 (번개 때 밝게)
    const sky = g.createLinearGradient(0, 0, 0, hz); sky.addColorStop(0, mixc('#070d16', '#c9a77a', c)); sky.addColorStop(1, mixc('#1d3044', '#f3d2a2', c));
    g.fillStyle = sky; g.fillRect(0, 0, W, hz);
    g.fillStyle = `rgba(${mix([20, 30, 44], [255, 236, 210], c)},${0.7 - c * 0.5})`;
    for (let i = 0; i < 6; i++) { const x = ((i * 97 + S.t * 18) % (W + 160)) - 80; g.beginPath(); g.ellipse(x, 40 + (i % 3) * 30, 90, 22, 0, 0, 7); g.fill(); }
    // 바다: 원근 파도 줄
    const sea = g.createLinearGradient(0, hz, 0, H); sea.addColorStop(0, mixc('#16283a', '#6a8ea0', c)); sea.addColorStop(1, mixc('#0a1622', '#2f5566', c));
    g.fillStyle = sea; g.fillRect(0, hz, W, H - hz);
    const amp = 1 - c * 0.85;
    for (let r = 0; r < 14; r++) { const d = r / 13, y = hz + 6 + d * d * (H - hz), a = (3 + d * 16) * amp;
      g.strokeStyle = `rgba(${mix([170, 200, 220], [255, 240, 220], c)},${0.12 + d * 0.22})`; g.lineWidth = 1 + d * 2.2; g.beginPath();
      for (let x = -10; x <= W + 10; x += 8) g.lineTo(x, y + Math.sin(x * (0.04 - d * 0.025) + S.t * (2.2 + r * 0.15) + r) * a); g.stroke(); }
    // 예수님: 물 위에 서신 흰 옷, 빛
    const j = this.jesus(S), sz = 34 * j.s;
    const glow = g.createRadialGradient(j.x, j.y - sz * 0.9, 2, j.x, j.y - sz * 0.9, sz * 1.8); glow.addColorStop(0, 'rgba(255,240,200,.5)'); glow.addColorStop(1, 'rgba(255,240,200,0)');
    g.fillStyle = glow; g.beginPath(); g.arc(j.x, j.y - sz * 0.9, sz * 1.8, 0, 7); g.fill(); // 네모로 칠하니 빛 가장자리가 잘려 보였다
    figure(g, j.x, j.y, sz, S.prog > 0.85 || c ? 1 : 0);
    g.fillStyle = 'rgba(255,240,210,.25)'; g.beginPath(); g.ellipse(j.x, j.y + 2, sz * 0.5, sz * 0.08, 0, 0, 7); g.fill(); // 물에 비친 빛
    this.overlay(g, S);
  },
  overlayBody(g, S) { const c = S.calm;
    // 비
    g.strokeStyle = `rgba(200,220,240,${0.35 * (1 - c)})`; g.lineWidth = 1;
    for (const [x, y, d] of S.rain) { g.beginPath(); g.moveTo(x, y); g.lineTo(x - 5 * d, y + 16 * d); g.stroke(); }
    // 가라앉음: 앞에서 물이 차오른다
    if (S.sink > 0) { const top = H - S.sink * 330;
      g.fillStyle = 'rgba(10,30,44,.82)'; g.beginPath(); g.moveTo(0, H);
      for (let x = 0; x <= W; x += 10) g.lineTo(x, top + Math.sin(x * 0.05 + S.t * 4) * 8); g.lineTo(W, H); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(200,230,245,.5)'; g.lineWidth = 2; g.beginPath(); for (let x = 0; x <= W; x += 10) g.lineTo(x, top + Math.sin(x * 0.05 + S.t * 4) * 8); g.stroke();
      const v = g.createRadialGradient(W / 2, H / 2, 120, W / 2, H / 2, 330); v.addColorStop(0, 'rgba(120,0,0,0)'); v.addColorStop(1, `rgba(120,10,10,${S.sink * 0.45})`); g.fillStyle = v; g.fillRect(0, 0, W, H); }
    // 시선 고리
    if (!c) { const ok = S.focus; g.save(); g.lineWidth = 3; g.strokeStyle = ok ? 'rgba(255,226,150,.95)' : 'rgba(255,120,100,.9)';
      g.shadowColor = ok ? '#ffd27a' : '#ff6a50'; g.shadowBlur = 12; g.beginPath(); g.arc(S.gx, S.gy, GAZE, 0, 7); g.stroke(); g.shadowBlur = 0;
      g.fillStyle = ok ? 'rgba(255,226,150,.08)' : 'rgba(255,120,100,.06)'; g.fill(); g.restore();
      if (!ok) { g.save(); g.font = '800 16px "Noto Sans KR",sans-serif'; g.textAlign = 'center'; g.lineWidth = 4; g.strokeStyle = 'rgba(10,10,20,.8)'; g.strokeText(tr('예수님을 바라보세요!'), W / 2, H - 22); g.fillStyle = '#ffb38a'; g.fillText(tr('예수님을 바라보세요!'), W / 2, H - 22); g.restore(); } }
    // 번개
    if (S.flash > 0) { g.fillStyle = `rgba(230,240,255,${S.flash * 0.55})`; g.fillRect(0, 0, W, H); }
    // 얼마나 다가갔나
    g.save(); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(16, 16, 120, 6); g.fillStyle = '#ffe29a'; g.fillRect(16, 16, 120 * S.prog, 6);
    g.font = '700 12px "Noto Sans KR",sans-serif'; g.fillStyle = 'rgba(255,255,255,.85)'; g.textAlign = 'left'; g.fillText(tr('예수님께로'), 142, 23); g.restore();
  },
  drawArt(g, S) { // 폭풍 그림 위에 잔잔한 새벽 그림을 겹쳐(바람이 그침), 파도 줄은 코드로 움직인다
    const c = S.calm, hz = 262; bgArt(g, 'e32/bg');
    if (c > 0) { g.save(); g.globalAlpha = c; g.drawImage(art('e32/calm'), -20, 0, W + 40, H + 50); g.restore(); }
    else { g.fillStyle = 'rgba(10,16,26,.25)'; g.fillRect(0, 0, W, H); }
    const amp = 1 - c * 0.9;
    for (let r = 0; r < 10; r++) { const d = r / 9, y = hz + 10 + d * d * (H - hz), a = (3 + d * 14) * amp;
      g.strokeStyle = `rgba(220,235,245,${(0.06 + d * 0.16) * amp})`; g.lineWidth = 1 + d * 2; g.beginPath();
      for (let x = -10; x <= W + 10; x += 8) g.lineTo(x, y + Math.sin(x * (0.04 - d * 0.025) + S.t * (2.2 + r * 0.15) + r) * a); g.stroke(); }
    const j = this.jesus(S), sz = 34 * j.s;
    const glow = g.createRadialGradient(j.x, j.y - sz, 2, j.x, j.y - sz, sz * 2.2); glow.addColorStop(0, 'rgba(255,240,200,.5)'); glow.addColorStop(1, 'rgba(255,240,200,0)');
    g.fillStyle = glow; g.beginPath(); g.arc(j.x, j.y - sz, sz * 2.2, 0, 7); g.fill();
    spr(g, S.prog > 0.85 || c ? 'e32/jesus-hand' : 'e32/jesus', j.x, j.y, sz * 2.1);
    g.fillStyle = 'rgba(255,240,210,.25)'; g.beginPath(); g.ellipse(j.x, j.y + 2, sz * 0.6, sz * 0.09, 0, 0, 7); g.fill();
    this.overlay(g, S);
  },
  overlay(g, S) { this.overlayBody(g, S); },
  // 성공: 손을 내밀어 붙잡으시고, 배에 오르니 바람이 그친다 (마 14:31–32)
  end(g, k, S) { S.calm = ease(k); S.prog = 1; this.update(0.016, S); this.draw(g, S);
    if (k > 0.3) { g.save(); g.globalAlpha = clamp((k - 0.3) * 2, 0, 1); g.font = '700 21px "Gowun Batang",serif'; g.textAlign = 'center';
      g.lineWidth = 6; g.strokeStyle = 'rgba(60,34,12,.85)'; g.strokeText(tr('바람이 그치는지라'), W / 2, 96); g.fillStyle = '#fff4dc'; g.fillText(tr('바람이 그치는지라'), W / 2, 96);
      g.font = '600 12px "Noto Sans KR",sans-serif'; g.fillStyle = '#f3dcb4'; g.fillText(tr('마 14:32'), W / 2, 116); g.restore(); }
  },
};
const mixc = (a, b, t) => `rgb(${mix(hex(a), hex(b), t)})`;
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
// 물 위에 서신 분: 흰 옷·붉은 겉옷, 가까이 오시면 손을 내미신다(reach)
function figure(g, x, y, h, reach) {
  g.save(); g.translate(x, y);
  g.fillStyle = '#f4efe2'; g.beginPath(); g.moveTo(-h * 0.2, -h * 0.78); g.quadraticCurveTo(-h * 0.3, -h * 0.2, -h * 0.26, 0); g.lineTo(h * 0.26, 0); g.quadraticCurveTo(h * 0.3, -h * 0.2, h * 0.2, -h * 0.78); g.closePath(); g.fill();
  g.fillStyle = '#9b2a2a'; g.beginPath(); g.moveTo(-h * 0.2, -h * 0.76); g.quadraticCurveTo(h * 0.05, -h * 0.4, h * 0.2, -h * 0.05); g.lineTo(h * 0.24, -h * 0.25); g.quadraticCurveTo(h * 0.12, -h * 0.6, h * 0.12, -h * 0.78); g.closePath(); g.fill();
  g.fillStyle = '#c99872'; g.beginPath(); g.arc(0, -h * 0.88, h * 0.1, 0, 7); g.fill();
  g.fillStyle = '#2a1c14'; g.beginPath(); g.arc(0, -h * 0.91, h * 0.11, Math.PI, 0); g.fill(); g.fillRect(-h * 0.11, -h * 0.91, h * 0.04, h * 0.14); g.fillRect(h * 0.07, -h * 0.91, h * 0.04, h * 0.14);
  g.strokeStyle = '#f4efe2'; g.lineWidth = h * 0.07; g.lineCap = 'round'; g.beginPath(); g.moveTo(-h * 0.17, -h * 0.66);
  if (reach) g.lineTo(-h * 0.42, -h * 0.5); else g.lineTo(-h * 0.24, -h * 0.36); g.stroke();
  g.beginPath(); g.moveTo(h * 0.17, -h * 0.66); g.lineTo(h * 0.22, -h * 0.36); g.stroke();
  if (reach) { g.fillStyle = '#c99872'; g.beginPath(); g.arc(-h * 0.45, -h * 0.49, h * 0.04, 0, 7); g.fill(); }
  g.restore();
}

/* ---------- 잃은 것을 찾는 기쁨 (눅 15:8–10): 등불을 켜고 집을 쓸며 잃은 드라크마 찾기 — 찾기·추리 ---------- */
// 어두운 집. 손가락을 끄는 곳의 조금 위에 등불이 따라오고, 등불 아래 먼지 더미를 쓸면 걷힌다(눅 15:8 '등불을 켜고 집을 쓸며').
// 은전은 더미 하나 밑에 있다. 은전 가까이의 더미를 다 쓸면 희미하게 반짝인다 — 그 반짝임으로 범위를 좁힌다.
// 찾은 은전을 눌러 주우면 집이 환해진다(15:9). 손가락이 등불을 가리지 않게 등불은 손가락보다 위에 있다
const LAMP = 66, LIFT = 58, NEAR = 105;
const coin = {
  title: tr('잃은 것을 찾는 기쁨'), task: tr('등불을 켜고 잃은 드라크마 찾기'),
  ask: [tr('어떤 여자가 은전 열 개 가운데 하나를 잃었단다.'), tr('등불을 켜고 집을 쓸며 찾아보렴 — 은전 가까이를 쓸면 희미하게 반짝일 거야.')],
  quote: tr('등불을 켜고 집을 쓸며 찾도록 부지런히 찾지 아니하겠느냐'), ref: tr('눅 15:8'),
  help: tr('끌면 등불이 따라오고, 등불 아래 먼지 더미가 쓸려요.<br>은전 가까이를 쓸면 희미하게 반짝여요 — 반짝임을 따라 범위를 좁혀요. 찾으면 눌러서 주워요.'),
  art: ['e43/bg', 'e43/coin', 'e43/lamp', 'e43/pile'],
  seconds: 26,
  init() {
    const piles = [];
    for (let tries = 0; piles.length < 24 && tries < 900; tries++) { // 방 안 빈자리에 고르게 흩어 놓는다(가구 자리는 피함)
      const x = rnd(40, W - 40), y = rnd(80, H - 40);
      if (FURN.some(f => x > f[0] - 22 && x < f[0] + f[2] + 22 && y > f[1] - 22 && y < f[1] + f[3] + 22)) continue;
      if (piles.some(p => Math.hypot(p.x - x, p.y - y) < 54)) continue;
      piles.push({ x, y, amt: 1, r: rnd(18, 26), seed: Math.random() * 1000, hint: false });
    }
    const k = Math.floor(Math.random() * piles.length); piles[k].coin = true;
    return { piles, lx: 200, ly: 300, down: false, mx: 0, my: 0, dust: [], sparks: [], found: false, sweepT: 0, msg: null, light: 0, got: false };
  },
  update(dt, S) {
    S.sweepT -= dt;
    if (S.down && !S.got) {
      for (const p of S.piles) {
        if (p.amt <= 0 || Math.hypot(p.x - S.lx, p.y - S.ly) > LAMP * 0.62 + p.r) continue;
        p.amt -= dt * 2.3;
        if (S.sweepT <= 0) { S.fx.play('sweep'); S.sweepT = 0.12; }
        if (Math.random() < 0.6) S.dust.push({ x: p.x + rnd(-p.r, p.r), y: p.y + rnd(-p.r * 0.6, p.r * 0.6), vx: (S.lx - S.mx) * 4 + rnd(-30, 30), vy: rnd(-40, -5), life: rnd(0.4, 0.8) });
        if (p.amt <= 0) { // 다 쓸었다
          if (p.coin) { S.found = true; S.fx.play('glint'); S.msg = { t: tr('반짝! 은전이다 — 눌러서 주워요'), c: '#fff2c0', at: 2, x: p.x, y: p.y - 34 }; }
          else { const c = S.piles.find(q => q.coin), d = Math.hypot(c.x - p.x, c.y - p.y);
            if (d < NEAR) { p.hint = true; S.fx.play('glint'); S.msg = { t: tr('희미하게 반짝였어요…'), c: '#e8dcb0', at: 1.3, x: p.x, y: p.y - 30 }; for (let i = 0; i < 6; i++) S.sparks.push({ x: p.x + rnd(-10, 10), y: p.y + rnd(-8, 8), vy: rnd(-25, -8), life: rnd(0.5, 1), r: rnd(1, 2) }); } }
        }
      }
    }
    for (const d of S.dust) { d.x += d.vx * dt; d.y += d.vy * dt; d.vy += 30 * dt; d.life -= dt; } S.dust = S.dust.filter(d => d.life > 0);
    for (const p of S.sparks) { p.y += p.vy * dt; p.life -= dt; } S.sparks = S.sparks.filter(p => p.life > 0);
    if (S.msg) S.msg.at -= dt;
  },
  down(x, y, S) {
    const c = S.piles.find(p => p.coin);
    if (S.found && Math.hypot(x - c.x, y - c.y) < 34 || S.found && Math.hypot(x - c.x, y - LIFT - c.y) < 34) { S.got = true; S.fx.play('coin'); return; } // 손가락이나 등불 자리로 은전을 누르면
    S.down = true; this.move(x, y, S);
  },
  move(x, y, S) { S.mx = S.lx; S.lx = clamp(x, 10, W - 10); S.ly = clamp(y - LIFT, 60, H - 10); },
  up(S) { S.down = false; },
  won: S => S.got,
  draw(g, S) {
    // 돌바닥과 흙
    if (!bgArt(g, 'e43/bg')) { g.fillStyle = '#5a4630'; g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(30,20,10,.45)'; g.lineWidth = 1.2;
    for (let y = 40; y < H; y += 34) for (let x = ((y / 34) % 2) * 26 - 26; x < W; x += 52) { g.beginPath(); g.rect(x + 1, y + 1, 50, 32); g.stroke(); }
    for (const f of FURN) furniture(g, f); }
    // 먼지 더미
    for (const p of S.piles) {
      if (p.coin && p.amt < 0.6) drawCoin(g, p.x, p.y, S.got ? 1 : 0.6 + Math.sin(performance.now() / 150) * 0.4);
      if (p.amt > 0) dustPile(g, p);
      else if (p.hint) { g.fillStyle = 'rgba(255,235,170,.18)'; g.beginPath(); g.arc(p.x, p.y, 12, 0, 7); g.fill(); }
    }
    for (const d of S.dust) { g.fillStyle = `rgba(170,140,100,${clamp(d.life, 0, 1) * 0.6})`; g.beginPath(); g.arc(d.x, d.y, 2, 0, 7); g.fill(); }
    // 어둠: 등불 둘레만 밝게 (성공하면 방 전체가 밝아진다)
    const L = S.light;
    g.save(); const dark = g.createRadialGradient(S.lx, S.ly, LAMP * 0.35, S.lx, S.ly, LAMP * 1.5 + L * 600);
    dark.addColorStop(0, 'rgba(8,5,2,0)'); dark.addColorStop(1, `rgba(8,5,2,${0.93 * (1 - L)})`); g.fillStyle = dark; g.fillRect(0, 0, W, H);
    const warm = g.createRadialGradient(S.lx, S.ly, 2, S.lx, S.ly, LAMP); warm.addColorStop(0, 'rgba(255,190,100,.22)'); warm.addColorStop(1, 'rgba(255,190,100,0)'); g.fillStyle = warm; g.fillRect(S.lx - LAMP, S.ly - LAMP, LAMP * 2, LAMP * 2);
    g.restore();
    // 등불 (기름 등잔)과 비
    lampIcon(g, S.lx, S.ly - 8);
    for (const p of S.sparks) { g.fillStyle = `rgba(255,236,170,${clamp(p.life, 0, 1)})`; star(g, p.x, p.y, p.r * 2.4); }
    floatMsg(g, S.msg);
    g.save(); g.font = '700 13px "Noto Sans KR",sans-serif'; g.textAlign = 'left'; g.fillStyle = 'rgba(255,230,190,.85)';
    g.fillText(tr('쓸어 낸 더미 {0} / {1}', S.piles.filter(p => p.amt <= 0).length, S.piles.length), 14, 24); g.restore();
  },
  // 성공: 집이 환해지고 이웃을 불러 함께 기뻐한다 (눅 15:9–10)
  end(g, k, S) { S.light = ease(k); const c = S.piles.find(p => p.coin); S.lx = c.x; S.ly = c.y; this.draw(g, S);
    if (Math.random() < 0.4) S.sparks.push({ x: c.x + rnd(-30, 30), y: c.y + rnd(-20, 20), vy: rnd(-40, -10), life: rnd(0.5, 1), r: rnd(1.4, 2.6) });
    if (k > 0.3) { g.save(); g.globalAlpha = clamp((k - 0.3) * 2, 0, 1); g.fillStyle = 'rgba(30,18,8,.78)'; g.fillRect(0, 96, W, 82);
      g.font = '700 18px "Gowun Batang",serif'; g.textAlign = 'center'; g.fillStyle = '#ffeccb';
      g.fillText(tr('나와 함께 즐기자'), W / 2, 128); g.fillText(tr('잃은 드라크마를 찾았노라'), W / 2, 152);
      g.font = '600 11px "Noto Sans KR",sans-serif'; g.fillStyle = '#e6cfa6'; g.fillText(tr('눅 15:9'), W / 2, 170); g.restore(); }
  },
};
// 집 안의 세간: [x, y, w, h, 종류] — 먼지 더미는 이 자리를 피한다
const FURN = [[18, 52, 70, 46, 'jars'], [300, 50, 84, 40, 'loom'], [150, 222, 100, 58, 'mat'], [24, 400, 60, 66, 'bin'], [318, 412, 64, 52, 'jars']];
function furniture(g, [x, y, w, h, k]) {
  g.save();
  if (k === 'jars') for (let i = 0; i < 3; i++) { const cx = x + 12 + i * (w - 24) / 2, cy = y + h * 0.55; g.fillStyle = '#8a5a34'; g.beginPath(); g.ellipse(cx, cy, 11, 15, 0, 0, 7); g.fill(); g.fillStyle = '#6a4224'; g.beginPath(); g.ellipse(cx, cy - 14, 6, 3, 0, 0, 7); g.fill(); }
  else if (k === 'loom') { g.fillStyle = '#6e5232'; g.fillRect(x, y, w, 6); g.fillRect(x, y + h - 6, w, 6); g.strokeStyle = 'rgba(220,200,160,.55)'; g.lineWidth = 1; for (let i = 4; i < w; i += 5) { g.beginPath(); g.moveTo(x + i, y + 6); g.lineTo(x + i, y + h - 6); g.stroke(); } }
  else if (k === 'mat') { g.fillStyle = '#8a7444'; g.fillRect(x, y, w, h); g.strokeStyle = 'rgba(60,40,20,.4)'; for (let i = 6; i < h; i += 6) { g.beginPath(); g.moveTo(x, y + i); g.lineTo(x + w, y + i); g.stroke(); } }
  else if (k === 'bin') { g.fillStyle = '#7a6040'; g.beginPath(); g.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, 7); g.fill(); g.fillStyle = '#d9b86a'; g.beginPath(); g.ellipse(x + w / 2, y + h / 2, w / 2 - 6, h / 2 - 6, 0, 0, 7); g.fill(); } // 곡식 통
  g.restore();
}
function dustPile(g, p) {
  const a = clamp(p.amt, 0, 1), r = p.r * (0.45 + a * 0.55);
  if (spr(g, 'e43/pile', p.x, p.y, r * 1.7, { ay: 0.5, a: 0.35 + a * 0.5, rot: p.seed })) return;
  g.save(); g.globalAlpha = 0.35 + a * 0.65;
  g.fillStyle = '#8e7550'; g.beginPath(); g.ellipse(p.x, p.y, r * 1.2, r * 0.75, 0, 0, 7); g.fill();
  g.fillStyle = '#a88c60'; for (let i = 0; i < 7; i++) { const s = (p.seed + i * 37) % 1; g.beginPath(); g.ellipse(p.x + Math.cos(i * 2.4 + p.seed) * r * 0.6, p.y + Math.sin(i * 2.4 + p.seed) * r * 0.35, r * 0.4 * (0.6 + s * 0.4), r * 0.22, i, 0, 7); g.fill(); }
  g.strokeStyle = 'rgba(200,170,110,.5)'; g.lineWidth = 1; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(p.x - r + i * r * 0.5, p.y - r * 0.2); g.lineTo(p.x - r + i * r * 0.5 + 8, p.y - r * 0.35); g.stroke(); } // 지푸라기
  g.restore();
}
function drawCoin(g, x, y, shine) {
  if (spr(g, 'e43/coin', x, y, 20, { ay: 0.5 })) { g.save(); g.globalAlpha = shine; g.fillStyle = '#fffbe6'; star(g, x + 7, y - 7, 7); g.restore(); return; }
  g.save(); const c = g.createRadialGradient(x - 3, y - 3, 1, x, y, 10); c.addColorStop(0, '#ffffff'); c.addColorStop(0.5, '#d9dde0'); c.addColorStop(1, '#8a9096');
  g.fillStyle = c; g.beginPath(); g.ellipse(x, y, 10, 8, 0, 0, 7); g.fill(); g.strokeStyle = '#6e747a'; g.lineWidth = 1; g.stroke();
  g.fillStyle = 'rgba(90,96,100,.6)'; g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill();
  g.globalAlpha = shine; g.fillStyle = '#fffbe6'; star(g, x + 6, y - 6, 7); g.restore();
}
function lampIcon(g, x, y) {
  if (spr(g, 'e43/lamp', x + 4, y + 8, 34)) return;
  g.save(); g.translate(x, y);
  g.fillStyle = '#b5713c'; g.beginPath(); g.ellipse(0, 0, 13, 7, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(9, -2); g.lineTo(19, -4); g.lineTo(19, 1); g.lineTo(9, 3); g.fill();
  g.fillStyle = '#3a2410'; g.beginPath(); g.ellipse(-2, -2, 4, 2, 0, 0, 7); g.fill();
  const t = performance.now() / 90; g.fillStyle = '#ffd27a'; g.beginPath(); g.ellipse(19, -9 + Math.sin(t) * 0.6, 3, 6 + Math.sin(t * 1.3), 0, 0, 7); g.fill();
  g.fillStyle = '#fff4cc'; g.beginPath(); g.ellipse(19, -7, 1.4, 3, 0, 0, 7); g.fill();
  g.restore();
}

/* ---------- 나는 선한 목자 (요 10:1–18): 양 열둘을 우리로 몰기 ---------- */
// 손가락으로 목자를 움직이면 양들이 목자를 피해 몰려 다닌다(서로 모이고, 떨어지고, 제멋대로 풀을 뜯으며). 이것을 써서 우리 문 안으로 몰아넣는다.
// 중간에 이리가 나타나 우리 밖의 양을 쫓는다 — 목자가 가까이 가면 물러난다(요 10:11–12, 삯꾼은 달아나지만 목자는 지킨다). 이리에 쫓긴 양은 흩어진다
const FOLD = { x: 296, y: 124, r: 70, gate: Math.PI * 0.75, open: 0.62 }, FLEE = 96, SHEEP = 10;
const sheep = {
  title: tr('나는 선한 목자'), task: tr('흩어진 양 {0}마리를 우리로', SHEEP),
  ask: [tr('양은 목자의 음성을 듣고 따라온단다.'), tr('흩어진 양 {0}마리를 우리 안으로 데려다 주렴 — 이리가 오면 네가 지켜야 한다!', SHEEP)],
  quote: tr('나는 선한 목자라 선한 목자는 양들을 위하여 목숨을 버리거니와'), ref: tr('요 10:11'),
  help: tr('끌면 목자가 따라와요. 양은 목자를 피해 움직여요 — 뒤에서 몰아 우리 문(왼쪽 아래 틈)으로 넣어요.<br>이리가 나타나면 가까이 가서 쫓아요.'),
  art: ['e42/bg', 'e42/sheep', 'e42/wolf', 'e42/shepherd', 'e42/stone'],
  seconds: 45, // 무리 뒤에서 문 쪽으로 미는 자동 목자로 60fps 시뮬레이션: 절반이 25초, 80%가 45초 안에
  init() {
    const flock = Array.from({ length: SHEEP }, () => ({ x: rnd(40, 220), y: rnd(260, 460), vx: 0, vy: 0, in: false, ph: rnd(0, 6), baaT: rnd(1, 6), scared: 0 }));
    return { flock, sx: 120, sy: 300, tx: 120, ty: 300, wolf: null, wolfT: rnd(14, 18), msg: null, sparks: [], t: 0 };
  },
  update(dt, S) {
    S.t += dt;
    // 목자는 손가락 쪽으로 걸어간다(순간이동하지 않게)
    const dx = S.tx - S.sx, dy = S.ty - S.sy, d = Math.hypot(dx, dy), sp = Math.min(d, 260 * dt); if (d > 1) { S.sx += dx / d * sp; S.sy += dy / d * sp; }
    // 이리
    S.wolfT -= dt;
    if (!S.wolf && S.wolfT <= 0 && S.flock.some(q => !q.in)) { const L = Math.random() < 0.5; S.wolf = { x: L ? -20 : W + 20, y: rnd(300, 470), flee: 0 }; S.fx.play('howl'); S.msg = { t: tr('{0:이/가} 온다!', this.pred?.name || tr('이리')), c: '#ffb38a', at: 1.6, x: W / 2, y: 60 }; }
    if (S.wolf) {
      const w = S.wolf, out = S.flock.filter(q => !q.in);
      if (w.flee > 0) { w.flee -= dt; const a = Math.atan2(w.y - S.sy, w.x - S.sx); w.x += Math.cos(a) * 200 * dt; w.y += Math.sin(a) * 200 * dt; if (w.x < -40 || w.x > W + 40 || w.y < -40 || w.y > H + 40) { S.wolf = null; S.wolfT = rnd(9, 13); } }
      else if (out.length) { const q = out.reduce((a, b) => Math.hypot(a.x - w.x, a.y - w.y) < Math.hypot(b.x - w.x, b.y - w.y) ? a : b), a = Math.atan2(q.y - w.y, q.x - w.x);
        w.x += Math.cos(a) * 95 * dt; w.y += Math.sin(a) * 95 * dt;
        if (Math.hypot(q.x - w.x, q.y - w.y) < 16) { q.scared = 1.6; const b = Math.atan2(q.y - w.y, q.x - w.x); q.vx = Math.cos(b) * 220; q.vy = Math.sin(b) * 220; S.fx.play('baa'); } }
      if (w.flee <= 0 && Math.hypot(w.x - S.sx, w.y - S.sy) < 62) { w.flee = 3; S.fx.play('shoo'); S.msg = { t: tr('{0:을/를} 쫓았어요', this.pred?.name || tr('이리')), c: '#ffe29a', at: 1.2, x: w.x, y: w.y - 24 }; }
    }
    // 양 무리: 목자·이리를 피하고, 가까운 양끼리 모이고, 부딪히지 않게 떨어지고, 가끔 풀을 뜯으며 어슬렁
    for (const q of S.flock) {
      let ax = 0, ay = 0;
      if (q.in) { // 우리 안에서는 조용히 거닐기만
        ax += (FOLD.x - q.x) * 0.8 + Math.sin(S.t + q.ph) * 6; ay += (FOLD.y - q.y) * 0.8 + Math.cos(S.t * 0.8 + q.ph) * 6;
      } else {
        const ds = Math.hypot(q.x - S.sx, q.y - S.sy); if (ds < FLEE) { const k = (FLEE - ds) / FLEE * 700; ax += (q.x - S.sx) / ds * k; ay += (q.y - S.sy) / ds * k; }
        if (S.wolf && S.wolf.flee <= 0) { const dw = Math.hypot(q.x - S.wolf.x, q.y - S.wolf.y); if (dw < 80) { ax += (q.x - S.wolf.x) / dw * 500; ay += (q.y - S.wolf.y) / dw * 500; } }
        let cx = 0, cy = 0, n = 0;
        for (const o of S.flock) { if (o === q || o.in) continue; const dd = Math.hypot(o.x - q.x, o.y - q.y); if (dd < 90) { cx += o.x; cy += o.y; n++; } if (dd < 18 && dd > 0) { ax += (q.x - o.x) / dd * 260; ay += (q.y - o.y) / dd * 260; } }
        if (n) { ax += (cx / n - q.x) * 0.9; ay += (cy / n - q.y) * 0.9; }
        ax += Math.sin(S.t * 0.7 + q.ph * 3) * 22; ay += Math.cos(S.t * 0.6 + q.ph * 2) * 22;
        // 우리 담: 문(gate 방향) 말고는 막힌다
        const fd = Math.hypot(q.x - FOLD.x, q.y - FOLD.y), fa = Math.atan2(q.y - FOLD.y, q.x - FOLD.x), atGate = Math.abs(Math.atan2(Math.sin(fa - FOLD.gate), Math.cos(fa - FOLD.gate))) < FOLD.open;
        if (fd < FOLD.r + 10 && !atGate) { ax += (q.x - FOLD.x) / fd * 900; ay += (q.y - FOLD.y) / fd * 900; }
        if (fd < FOLD.r - 12) { q.in = true; S.fx.play('baa'); S.msg = { t: `${S.flock.filter(o => o.in).length} / ${SHEEP}`, c: '#ffe29a', at: 1, x: FOLD.x, y: FOLD.y - FOLD.r - 10 };
          for (let i = 0; i < 8; i++) S.sparks.push({ x: q.x + rnd(-10, 10), y: q.y + rnd(-8, 8), vy: rnd(-30, -10), life: rnd(0.4, 0.9), r: rnd(1.2, 2.4) }); }
      }
      q.scared = Math.max(0, q.scared - dt);
      q.vx = (q.vx + ax * dt) * Math.exp(-dt * (q.scared ? 1 : 3)); q.vy = (q.vy + ay * dt) * Math.exp(-dt * (q.scared ? 1 : 3));
      const v = Math.hypot(q.vx, q.vy), mx = q.scared ? 230 : q.in ? 25 : 120; if (v > mx) { q.vx *= mx / v; q.vy *= mx / v; }
      q.x = clamp(q.x + q.vx * dt, 12, W - 12); q.y = clamp(q.y + q.vy * dt, 46, H - 10);
      q.baaT -= dt; if (q.baaT <= 0) { q.baaT = rnd(4, 9); if (Math.random() < 0.5) S.fx.play('baa'); }
    }
    for (const p of S.sparks) { p.y += p.vy * dt; p.life -= dt; } S.sparks = S.sparks.filter(p => p.life > 0);
    if (S.msg) S.msg.at -= dt;
  },
  down(x, y, S) { S.tx = x; S.ty = y; },
  move(x, y, S) { S.tx = x; S.ty = y; },
  up() {},
  won: S => S.flock.every(q => q.in),
  draw(g, S) {
    const A = bgArt(g, 'e42/bg');
    if (!A) { const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#8fb06a'); bg.addColorStop(1, '#5c8a3e'); g.fillStyle = bg; g.fillRect(0, 0, W, H); }
    if (!A) g.fillStyle = 'rgba(40,70,20,.18)'; if (!A) for (let i = 0; i < 40; i++) { g.beginPath(); g.ellipse((i * 113) % W, 50 + (i * 67) % 440, 18, 6, 0, 0, 7); g.fill(); }
    if (!A) for (const [x, y, r] of [[60, 120, 16], [190, 190, 12], [350, 330, 18], [90, 440, 11]]) { g.fillStyle = '#9a9384'; g.beginPath(); g.ellipse(x, y, r, r * 0.7, 0.3, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.ellipse(x - r * 0.3, y - r * 0.25, r * 0.4, r * 0.25, 0.3, 0, 7); g.fill(); }
    // 돌담 우리 (문 틈)
    g.save(); g.lineCap = 'round';
    for (let a = 0; a < Math.PI * 2; a += 0.16) { const off = Math.abs(Math.atan2(Math.sin(a - FOLD.gate), Math.cos(a - FOLD.gate))); if (off < FOLD.open) continue;
      const x = FOLD.x + Math.cos(a) * FOLD.r, y = FOLD.y + Math.sin(a) * FOLD.r; if (spr(g, 'e42/stone', x, y, 12 + (a * 13 % 3), { ay: 0.5, rot: a * 3 })) continue; g.fillStyle = (a * 7) % 2 > 1 ? '#a89f8c' : '#8f8774'; g.beginPath(); g.ellipse(x, y, 9, 7, a, 0, 7); g.fill(); }
    g.fillStyle = 'rgba(255,240,190,.25)'; const ga = FOLD.gate; g.beginPath(); g.arc(FOLD.x + Math.cos(ga) * FOLD.r, FOLD.y + Math.sin(ga) * FOLD.r, 26, 0, 7); g.fill(); // 문 자리
    g.font = '600 11px "Noto Sans KR",sans-serif'; g.textAlign = 'center'; g.fillStyle = 'rgba(255,255,255,.85)'; g.fillText(tr('문'), FOLD.x + Math.cos(ga) * (FOLD.r + 26), FOLD.y + Math.sin(ga) * (FOLD.r + 26) + 4);
    g.restore();
    for (const q of S.flock) drawSheep(g, q, S.t);
    if (S.wolf) drawWolf(g, S.wolf, this.pred);
    shepherd(g, S.sx, S.sy, this.pred ? 'd01/shepherd' : 'e42/shepherd');
    g.strokeStyle = 'rgba(255,255,255,.18)'; g.setLineDash([4, 5]); g.beginPath(); g.arc(S.sx, S.sy, FLEE, 0, 7); g.stroke(); g.setLineDash([]); // 양이 피하는 거리
    for (const p of S.sparks) { g.fillStyle = `rgba(255,236,170,${clamp(p.life, 0, 1)})`; star(g, p.x, p.y, p.r * 2.4); }
    floatMsg(g, S.msg);
    g.save(); g.font = '700 14px "Noto Sans KR",sans-serif'; g.textAlign = 'left'; g.lineWidth = 3; g.strokeStyle = 'rgba(30,50,20,.55)'; g.fillStyle = '#fff';
    const n = S.flock.filter(q => q.in).length; g.strokeText(tr('우리 안의 양 {0} / {1}', n, SHEEP), 14, 24); g.fillText(tr('우리 안의 양 {0} / {1}', n, SHEEP), 14, 24); g.restore();
  },
  end(g, k, S) { S.wolf = null; this.update(0.016, S); this.draw(g, S);
    if (k > 0.3) { g.save(); g.globalAlpha = clamp((k - 0.3) * 2, 0, 1); g.fillStyle = 'rgba(20,34,12,.78)'; g.fillRect(0, 226, W, 78);
      g.font = '700 18px "Gowun Batang",serif'; g.textAlign = 'center'; g.fillStyle = '#f4ecd2'; const [l1, l2, rf] = this.endLines || [tr('내 양은 내 음성을 들으며'), tr('나는 그들을 알며 그들은 나를 따르느니라'), tr('요 10:27')]; g.fillText(l1, W / 2, 256); g.fillText(l2, W / 2, 280);
      g.font = '600 11px "Noto Sans KR",sans-serif'; g.fillStyle = '#d8d0b0'; g.fillText(rf, W / 2, 297); g.restore(); }
  },
};
function drawSheep(g, q, t) {
  const a = Math.hypot(q.vx, q.vy) > 8 ? Math.atan2(q.vy, q.vx) : (q.a ?? 0); q.a = a; const bob = Math.sin(t * 8 + q.ph) * (Math.hypot(q.vx, q.vy) > 20 ? 1.2 : 0.2);
  if (art('e42/sheep')) { const L = Math.cos(a) < 0; g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(q.x + 2, q.y + 8, 13, 4, 0, 0, 7); g.fill(); spr(g, 'e42/sheep', q.x, q.y + bob, 24, { ay: 0.5, flip: L, rot: L ? a - Math.PI : a }); return; } // 왼쪽으로 갈 때는 뒤집어 거꾸로 서지 않게
  g.save(); g.translate(q.x, q.y + bob); g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(2, 6, 11, 4, 0, 0, 7); g.fill(); g.rotate(a);
  g.fillStyle = '#f4f0e6'; for (const [x, y, r] of [[-5, -3, 6], [-5, 3, 6], [1, -4, 6], [1, 4, 6], [-1, 0, 7]]) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
  g.fillStyle = '#3e342a'; g.beginPath(); g.ellipse(9, 0, 4.5, 3.4, 0, 0, 7); g.fill();
  g.fillStyle = '#5a4c3e'; g.beginPath(); g.ellipse(8, -4, 1.6, 2.6, 0.6, 0, 7); g.fill(); g.beginPath(); g.ellipse(8, 4, 1.6, 2.6, -0.6, 0, 7); g.fill();
  g.restore();
}
function drawWolf(g, w, pred) { // 이리(기본) · 사자(다윗의 들판 — 갈기)
  if (spr(g, pred?.mane ? 'd01/lion' : 'e42/wolf', w.x, w.y, pred?.mane ? 30 : 26, { ay: 0.5, flip: (w.vx ?? 1) < 0 })) return;
  g.save(); g.translate(w.x, w.y); g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(2, 7, 14, 4, 0, 0, 7); g.fill();
  if (pred?.mane) { g.fillStyle = pred.mane; g.beginPath(); g.arc(12, -2, 10, 0, 7); g.fill(); }
  g.fillStyle = pred?.color || '#5e5a56'; g.beginPath(); g.ellipse(0, 0, 13, 7, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(-12, 0); g.lineTo(-22, -4); g.lineTo(-20, 3); g.fill();
  g.beginPath(); g.ellipse(13, -2, 6, 5, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(15, -6); g.lineTo(17, -12); g.lineTo(19, -5); g.fill();
  g.fillStyle = '#ffcf5a'; g.beginPath(); g.arc(16, -3, 1.3, 0, 7); g.fill(); g.restore();
}
function shepherd(g, x, y, n = 'e42/shepherd') {
  if (spr(g, n, x, y + 16, 50)) return;
  g.save(); g.translate(x, y); g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(2, 10, 12, 4, 0, 0, 7); g.fill();
  g.fillStyle = '#7a5a3a'; g.beginPath(); g.arc(0, 0, 10, 0, 7); g.fill(); g.fillStyle = '#c4a26e'; g.beginPath(); g.arc(0, -1, 7, 0, 7); g.fill(); // 위에서 본 머리쓰개
  g.strokeStyle = '#5a3e22'; g.lineWidth = 2.5; g.lineCap = 'round'; g.beginPath(); g.moveTo(8, 4); g.lineTo(20, -14); g.arc(17, -16, 3.5, 0, Math.PI * 1.3, true); g.stroke(); // 목자 막대
  g.restore();
}

/* ---------- 산 위의 가르침 (마 7:24–27): 반석 위에 집 짓기 — 떨어지는 돌 맞춰 쌓기 ---------- */
// 네 칸짜리 돌이 하나씩 내려온다. 좌우로 끌어 옮기고, 톡 누르면 돌리고, 아래로 휙 쓸면 바로 내린다(PC는 방향키·스페이스).
// 한 줄이 빈틈없이 차면 단단한 벽 한 켜가 된다(그 줄은 걷히고 위가 내려온다). 여섯 켜를 쌓으면 성공 — 비가 와도 무너지지 않는다(7:25).
// 돌이 맨 위까지 차면 모래 위에 지은 집처럼 무너진다(7:27). 켜가 쌓일수록 조금씩 빨라진다
const COLS = 10, ROWS = 17, CELL = 25, BX = 22, BY = 46, GOALROWS = 6;
const SHAPES = [[[0, 1], [1, 1], [2, 1], [3, 1]], [[0, 0], [1, 0], [0, 1], [1, 1]], [[1, 0], [0, 1], [1, 1], [2, 1]], [[0, 0], [0, 1], [1, 1], [2, 1]], [[2, 0], [0, 1], [1, 1], [2, 1]], [[1, 0], [2, 0], [0, 1], [1, 1]], [[0, 0], [1, 0], [1, 1], [2, 1]]];
const STONE = ['#cfc3a6', '#b9a988', '#d8cdb2', '#a8987a', '#c4b494', '#bfae8e', '#d2c4a2'];
const rock = {
  title: tr('산 위의 가르침'), task: tr('반석 위에 벽 {0}켜 쌓기', GOALROWS),
  ask: [tr('내 말을 듣고 행하는 사람은 반석 위에 집을 지은 지혜로운 사람 같단다.'), tr('돌을 빈틈없이 맞춰 벽을 쌓아 보렴 — {0}켜!', GOALROWS)],
  quote: tr('내 말을 듣고 행하는 자는 그 집을 반석 위에 지은 지혜로운 사람 같으리니'), ref: tr('마 7:24'),
  help: tr('좌우로 끌면 돌이 옮겨지고, 톡 누르면 돌아가요. 아래로 휙 쓸면 바로 내려가요(PC: 방향키·스페이스).<br>한 줄이 빈틈없이 차면 벽 한 켜! 맨 위까지 차면 무너져요.'),
  art: ['e23/bg', 'e23/block'],
  seconds: 110,
  init() { const S = { grid: Array.from({ length: ROWS }, () => Array(COLS).fill(-1)), rows: 0, fallT: 0, clearing: null, msg: null, sparks: [], rain: 0, flood: 0, dead: false, bag: [] };
    // 주춧돌: 맨 아래 세 줄은 놓여 있고 줄마다 빈자리가 한두 칸 — 그 틈을 메우는 것부터 (빈 판에서 시작하니 처음이 지루하고 길었다)
    for (let r = ROWS - 3; r < ROWS; r++) { const gap = Math.floor(Math.random() * COLS), gap2 = Math.random() < 0.5 ? (gap + 1 + Math.floor(Math.random() * (COLS - 1))) % COLS : -1;
      S.grid[r] = S.grid[r].map((_, c) => c === gap || c === gap2 ? -1 : Math.floor(Math.random() * 7)); }
    S.next = draw7(S); spawn(S); return S; },
  update(dt, S) {
    for (const p of S.sparks) { p.y += p.vy * dt; p.life -= dt; } S.sparks = S.sparks.filter(p => p.life > 0);
    if (S.msg) S.msg.at -= dt;
    if (S.clearing) { S.clearing.t -= dt; if (S.clearing.t <= 0) { for (const r of S.clearing.rows) { S.grid.splice(r, 1); S.grid.unshift(Array(COLS).fill(-1)); } S.clearing = null; spawn(S); } return; }
    if (S.dead || !S.cur) return;
    const speed = 0.62 * Math.pow(0.86, S.rows);
    S.fallT += dt; if (S.fallT >= speed) { S.fallT = 0; if (!step(S, 0, 1)) land(S); }
  },
  down(x, y, S) { S.drag = { x0: x, y0: y, x, y, t: performance.now(), moved: false, col: S.cur?.x }; },
  move(x, y, S) { const D = S.drag; if (!D || !S.cur || S.clearing) return; D.x = x; D.y = y;
    const want = D.col + Math.round((x - D.x0) / (CELL * 0.9)); // 끈 만큼 칸을 옮긴다
    while (S.cur.x < want && step(S, 1, 0)) { D.moved = true; S.fx.play('tick'); } while (S.cur.x > want && step(S, -1, 0)) { D.moved = true; S.fx.play('tick'); }
    if (Math.abs(x - D.x0) > 8) D.moved = true; },
  up(S, x, y) { const D = S.drag; S.drag = null; if (!D || !S.cur || S.clearing) return;
    const dt = performance.now() - D.t, dy = (y ?? D.y) - D.y0;
    if (dy > 60 && dt < 500) { while (step(S, 0, 1)); land(S); S.fx.play('drop'); return; } // 아래로 휙 — 바로 내린다
    if (!D.moved && dt < 300) rot(S); },
  key(k, S) { if (!S.cur || S.clearing) return false;
    if (k === 'ArrowLeft') step(S, -1, 0); else if (k === 'ArrowRight') step(S, 1, 0); else if (k === 'ArrowUp') rot(S);
    else if (k === 'ArrowDown') { if (!step(S, 0, 1)) land(S); } else if (k === ' ') { while (step(S, 0, 1)); land(S); S.fx.play('drop'); } else return false; },
  won: S => S.rows >= GOALROWS && !S.clearing,
  lost: S => S.dead,
  failText: S => S.dead ? tr('모래 위에 지은 집처럼 무너졌어요') : tr('시간이 다 되었어요'),
  draw(g, S) {
    if (bgArt(g, this.glory ? 'd38/bg' : 'e23/bg')) { if (S.rain && !this.glory) { g.fillStyle = `rgba(30,36,44,${S.rain * 0.55})`; g.fillRect(0, 0, W, H); } }
    else { const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, mixc('#7aa6c8', '#3a4652', S.rain)); sky.addColorStop(1, mixc('#d8c8a2', '#5a5a52', S.rain));
    g.fillStyle = sky; g.fillRect(0, 0, W, H); }
    // 판(집 지을 터)과 그 밑의 반석
    g.fillStyle = 'rgba(28,22,16,.82)'; g.fillRect(BX - 2, BY - 2, COLS * CELL + 4, ROWS * CELL + 4); // 어두운 터 — 밝으면 돌이 묻혔다
    g.strokeStyle = 'rgba(255,255,255,.06)'; g.lineWidth = 1; for (let c = 1; c < COLS; c++) { g.beginPath(); g.moveTo(BX + c * CELL, BY); g.lineTo(BX + c * CELL, BY + ROWS * CELL); g.stroke(); }
    const rk = g.createLinearGradient(0, BY + ROWS * CELL, 0, H); rk.addColorStop(0, '#7d7468'); rk.addColorStop(1, '#4e463c'); g.fillStyle = rk;
    g.beginPath(); g.moveTo(0, BY + ROWS * CELL + 2); for (let x = 0; x <= W; x += 20) g.lineTo(x, BY + ROWS * CELL + 2 + Math.sin(x * 0.07) * 3); g.lineTo(W, H); g.lineTo(0, H); g.fill();
    g.font = '700 11px "Noto Sans KR",sans-serif'; g.textAlign = 'center'; g.fillStyle = 'rgba(255,255,255,.7)'; g.fillText(tr('반석'), BX + COLS * CELL / 2, H - 8);
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (S.grid[r][c] >= 0) {
      const glow = S.clearing?.rows.includes(r); stoneCell(g, BX + c * CELL, BY + r * CELL, S.grid[r][c], glow ? 1 - S.clearing.t / 0.35 : 0); }
    if (S.cur && !S.clearing && !S.dead) { // 떨어질 자리 그림자 + 지금 돌
      let gy = 0; while (fits(S, S.cur.cells, S.cur.x, S.cur.y + gy + 1)) gy++;
      g.fillStyle = 'rgba(255,255,255,.12)'; for (const [cx, cy] of S.cur.cells) g.fillRect(BX + (S.cur.x + cx) * CELL + 2, BY + (S.cur.y + cy + gy) * CELL + 2, CELL - 4, CELL - 4);
      for (const [cx, cy] of S.cur.cells) if (S.cur.y + cy >= 0) stoneCell(g, BX + (S.cur.x + cx) * CELL, BY + (S.cur.y + cy) * CELL, S.cur.k, 0); }
    // 옆 칸: 다음 돌, 쌓은 켜
    const sx = BX + COLS * CELL + 16;
    g.fillStyle = 'rgba(28,22,16,.75)'; rrect(g, sx - 8, BY - 4, W - sx, 256, 8); g.fill();
    g.textAlign = 'left'; g.font = '700 12px "Noto Sans KR",sans-serif'; g.fillStyle = 'rgba(255,240,210,.85)'; g.fillText(tr('다음 돌'), sx, BY + 10);
    for (const [cx, cy] of SHAPES[S.next]) stoneCell(g, sx + cx * 17, BY + 22 + cy * 17, S.next, 0, 17);
    g.fillStyle = 'rgba(255,240,210,.85)'; g.fillText(tr('쌓은 켜'), sx, BY + 110);
    for (let i = 0; i < GOALROWS; i++) { g.fillStyle = i < S.rows ? '#ffe29a' : 'rgba(255,240,210,.14)'; g.fillRect(sx, BY + 122 + (GOALROWS - 1 - i) * 16, 92, 12); }
    g.font = '800 20px "Noto Sans KR",sans-serif'; g.fillStyle = '#ffe9c0'; g.fillText(`${Math.min(S.rows, GOALROWS)} / ${GOALROWS}`, sx, BY + 236);
    // 비와 물 (성공 연출)
    if (S.rain > 0) { g.strokeStyle = `rgba(200,220,240,${0.5 * S.rain})`; g.lineWidth = 1; const t = performance.now() / 1000;
      for (let i = 0; i < 90; i++) { const x = (i * 53 + t * 240) % (W + 60) - 30, y = (i * 97 + t * 700) % H; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 5, y + 16); g.stroke(); }
      const fy = H - S.flood * 150; g.fillStyle = 'rgba(70,96,110,.6)'; g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= W; x += 10) g.lineTo(x, fy + Math.sin(x * 0.06 + t * 3) * 5); g.lineTo(W, H); g.fill(); }
    for (const p of S.sparks) { g.fillStyle = `rgba(255,236,170,${clamp(p.life, 0, 1)})`; star(g, p.x, p.y, p.r * 2.4); }
    floatMsg(g, S.msg);
  },
  end(g, k, S) { if (this.glory) { this.draw(g, S); const gl = g.createRadialGradient(W / 2, 0, 10, W / 2, 0, 520); gl.addColorStop(0, `rgba(255,230,160,${0.55 * k})`); gl.addColorStop(1, 'rgba(255,230,160,0)'); g.fillStyle = gl; g.fillRect(0, 0, W, H); } // 성전 돌: 비 대신 영광의 빛
    else { S.rain = clamp(k * 2, 0, 1); S.flood = ease(clamp(k * 1.4, 0, 1)); this.draw(g, S); }
    if (k > 0.45) { g.save(); g.globalAlpha = clamp((k - 0.45) * 2.5, 0, 1); g.fillStyle = 'rgba(20,24,28,.8)'; g.fillRect(0, 150, W, 84);
      g.font = '700 17px "Gowun Batang",serif'; g.textAlign = 'center'; g.fillStyle = '#eef2f4'; const [l1, l2, rf] = this.endLines || [tr('비가 내리고 창수가 나고 바람이 불어'), tr('그 집에 부딪치되 무너지지 아니하나니'), tr('마 7:25')]; g.fillText(l1, W / 2, 180); g.fillText(l2, W / 2, 204);
      g.font = '600 11px "Noto Sans KR",sans-serif'; g.fillStyle = '#c8d2d8'; g.fillText(rf, W / 2, 223); g.restore(); }
  },
};
function draw7(S) { if (!S.bag.length) S.bag = [0, 1, 2, 3, 4, 5, 6].sort(() => Math.random() - 0.5); return S.bag.pop(); } // 일곱 모양을 고르게
function fits(S, cells, x, y) { return cells.every(([cx, cy]) => { const c = x + cx, r = y + cy; return c >= 0 && c < COLS && r < ROWS && (r < 0 || S.grid[r][c] < 0); }); }
function spawn(S) { const k = S.next; S.next = draw7(S); S.cur = { k, cells: SHAPES[k].map(c => [...c]), x: 3, y: -1 }; S.fallT = 0; if (!fits(S, S.cur.cells, S.cur.x, S.cur.y + 1)) { S.dead = true; S.fx.play('splash'); } }
function step(S, dx, dy) { if (!fits(S, S.cur.cells, S.cur.x + dx, S.cur.y + dy)) return false; S.cur.x += dx; S.cur.y += dy; return true; }
function rot(S) { // 시계 방향으로, 벽에 닿으면 한두 칸 비켜서(벽 차기)
  const n = Math.max(...S.cur.cells.flat()), cells = S.cur.cells.map(([x, y]) => [n - y, x]);
  for (const kx of [0, -1, 1, -2, 2]) if (fits(S, cells, S.cur.x + kx, S.cur.y)) { S.cur.cells = cells; S.cur.x += kx; S.fx.play('flip'); return; } }
function land(S) {
  for (const [cx, cy] of S.cur.cells) { const r = S.cur.y + cy; if (r < 0) { S.dead = true; S.fx.play('splash'); return; } S.grid[r][S.cur.x + cx] = S.cur.k; }
  S.fx.play('drop'); S.cur = null;
  const full = S.grid.map((row, r) => row.every(v => v >= 0) ? r : -1).filter(r => r >= 0);
  if (full.length) { S.rows += full.length; S.clearing = { rows: full, t: 0.35 }; S.fx.play('plink');
    S.msg = { t: full.length > 1 ? tr('벽 {0}켜!', full.length) : tr('벽 한 켜!'), c: '#ffe29a', at: 1, x: BX + COLS * CELL / 2, y: BY + full[0] * CELL };
    for (const r of full) for (let i = 0; i < 10; i++) S.sparks.push({ x: BX + rnd(0, COLS * CELL), y: BY + r * CELL + rnd(0, CELL), vy: rnd(-40, -10), life: rnd(0.4, 0.9), r: rnd(1.4, 2.6) }); }
  else spawn(S);
}
// 깎은 돌 한 칸: 돌마다 빛깔이 조금 다르고 위·왼쪽은 밝게, 아래·오른쪽은 어둡게
function stoneCell(g, x, y, k, glow, sz = CELL) {
  const B = art('e23/block');
  if (B) { g.fillStyle = '#2a2016'; g.fillRect(x, y, sz, sz); const sx = (k * 37) % 60, sy = (k * 53) % 60; g.drawImage(B, sx, sy, B.width - 60, B.height - 60, x + 1, y + 1, sz - 2, sz - 2); // 같은 돌 그림의 다른 부분을 잘라 돌마다 결이 다르게
    g.fillStyle = `rgba(${k % 2 ? '255,240,210' : '60,40,20'},${0.05 + (k % 3) * 0.05})`; g.fillRect(x + 1, y + 1, sz - 2, sz - 2);
    if (glow > 0) { g.fillStyle = `rgba(255,236,160,${glow * 0.8})`; g.fillRect(x, y, sz, sz); } return; }
  g.fillStyle = '#3a2c1c'; g.fillRect(x, y, sz, sz); g.fillStyle = STONE[k]; g.fillRect(x + 1, y + 1, sz - 2, sz - 2); // 진한 줄눈
  g.fillStyle = 'rgba(255,255,255,.28)'; g.fillRect(x + 1, y + 1, sz - 2, 3); g.fillRect(x + 1, y + 1, 3, sz - 2);
  g.fillStyle = 'rgba(60,40,20,.28)'; g.fillRect(x + 1, y + sz - 4, sz - 2, 3); g.fillRect(x + sz - 4, y + 1, 3, sz - 2);
  g.fillStyle = 'rgba(80,60,40,.18)'; g.fillRect(x + sz * 0.3, y + sz * 0.45, 2, 2); g.fillRect(x + sz * 0.62, y + sz * 0.3, 2, 2);
  if (glow > 0) { g.fillStyle = `rgba(255,236,160,${glow * 0.8})`; g.fillRect(x, y, sz, sz); }
}

/* ---------- 돌을 내려놓은 사람들 (요 8:2–11): 던지려는 돌을 막아 여인 지키기 ---------- */
// 여인 둘레를 도는 겉옷(방패)을 끌어 날아오는 돌을 막는다. 돌을 든 사람은 먼저 돌을 치켜들어(빨간 표시) 곧 던진다 — 보고 미리 막는다.
// 갈수록 빨라지고 둘이 한꺼번에 던지기도 한다. 세 번 맞으면 실패, 버티면 그분의 한마디에 모두 돌을 내려놓고 하나씩 떠난다(8:7·9).
// (본문에서 실제로 돌을 던진 사람은 없다 — 놀이에서는 다그치는 손을 막는 것으로, 끝은 본문대로)
const WOM = [200, 372], SHIELD_R = 64, SHIELD_W = 0.92, HITS = 3, HOLD = 25, WIND = 1.0;
const stones = {
  title: tr('돌을 내려놓은 사람들'), task: tr('여인을 지켜 {0}초 버티기', HOLD),
  ask: [tr('저들이 여인을 끌고 와 돌을 들고 다그치는구나.'), tr('네 겉옷으로 이 여인을 지켜 다오 — {0}초만 버티면 내가 말하마.', HOLD)],
  quote: tr('예수께서 몸을 굽히사 손가락으로 땅에 쓰시니'), ref: tr('요 8:6'), // 끝의 한마디(8:7)는 성공 연출에서
  help: tr('끌면 겉옷(방패)이 여인 둘레를 돌아요. 돌을 치켜든 사람(빨간 표시)을 보고 미리 막아요.<br>세 번 맞으면 실패 — 25초를 버티면 돼요.'),
  art: ['e39/bg', 'e39/woman', 'e39/elder-low', 'e39/elder-up', 'e39/scribe-low', 'e39/scribe-up', 'e39/jesus-write'],
  seconds: HOLD,
  init() {
    const men = Array.from({ length: 7 }, (_, i) => { const a = Math.PI + 0.25 + i * (Math.PI - 0.5) / 6; return { x: WOM[0] + Math.cos(a) * 168, y: WOM[1] + Math.sin(a) * 210 + 40, a, wind: 0, hue: [20, 200, 40, 280, 10, 160, 30][i], gone: 0 }; });
    return { men, flying: [], ang: -Math.PI / 2, hits: 0, t: 0, nextT: 1.2, shake: 0, msg: null, sparks: [], fallen: [], leave: 0 };
  },
  update(dt, S) {
    S.t += dt; S.shake = Math.max(0, S.shake - dt * 3);
    if (!S.leave) {
      S.nextT -= dt;
      if (S.nextT <= 0) { // 누군가 돌을 치켜든다 — 갈수록 자주, 가끔 둘이
        // 둘이 한꺼번에 던질 때는 이웃한 두 사람만 — 서로 먼 두 곳을 한 방패로는 막을 수 없었다
        const free = S.men.map((m, i) => i).filter(i => !S.men[i].wind), i0 = free[Math.floor(Math.random() * free.length)];
        if (i0 != null) { S.men[i0].wind = WIND; const nb = [i0 - 1, i0 + 1].filter(j => free.includes(j)); if (S.t > 12 && nb.length && Math.random() < 0.35) S.men[nb[Math.floor(Math.random() * nb.length)]].wind = WIND + 0.15; }
        S.nextT = Math.max(0.75, 1.6 - S.t * 0.035) * rnd(0.85, 1.2);
      }
      for (const m of S.men) if (m.wind) { m.wind -= dt; if (m.wind <= 0) { m.wind = 0; const d = Math.hypot(WOM[0] - m.x, WOM[1] - 20 - m.y), sp = 175 + S.t * 4;
        S.flying.push({ x: m.x, y: m.y - 18, vx: (WOM[0] - m.x) / d * sp, vy: (WOM[1] - 20 - m.y) / d * sp, rot: 0 }); S.fx.play('cast'); } }
    }
    for (const f of S.flying) {
      f.x += f.vx * dt; f.y += f.vy * dt; f.rot += dt * 9;
      const d = Math.hypot(f.x - WOM[0], f.y - (WOM[1] - 14));
      if (!f.done && d < SHIELD_R + 6 && d > SHIELD_R - 14) { const a = Math.atan2(f.y - (WOM[1] - 14), f.x - WOM[0]), off = Math.abs(Math.atan2(Math.sin(a - S.ang), Math.cos(a - S.ang)));
        if (off < SHIELD_W / 2 + 0.08) { f.done = true; f.vx *= -0.25; f.vy = -80; f.fall = 1; S.fx.play('drop'); for (let i = 0; i < 5; i++) S.sparks.push({ x: f.x, y: f.y, vy: rnd(-40, -10), life: rnd(0.3, 0.6), r: rnd(1, 2) }); } }
      if (!f.done && d < 16) { f.done = true; f.hit = true; S.hits++; S.shake = 1; S.ouch = 1; S.hitAt = [f.x, f.y]; S.fx.play('thud'); S.fx.play('rip'); // 맞으면 여인이 움찔하고 붉게 번쩍, 돌이 부서진다 — 그냥 사라지니 안 맞은 줄 알았다(사용자 2026-11)
        for (let i = 0; i < 10; i++) S.sparks.push({ x: f.x, y: f.y, vy: rnd(-90, 10), vx: rnd(-80, 80), life: rnd(0.4, 0.8), r: rnd(1.4, 2.8), rock: 1 }); S.msg = { t: S.hits < HITS ? tr('맞았어요 {0} / {1}', S.hits, HITS) : tr('지키지 못했어요'), c: '#ffb38a', at: 1.2, x: WOM[0], y: WOM[1] - 70 }; }
      if (f.fall) { f.vy += 500 * dt; f.fall -= dt * 0.6; }
    }
    S.flying = S.flying.filter(f => !f.hit && f.y < H + 20 && (!f.fall || f.fall > 0));
    for (const p of S.sparks) { p.y += p.vy * dt; p.x += (p.vx || 0) * dt; if (p.rock) p.vy += 300 * dt; p.life -= dt; } S.sparks = S.sparks.filter(p => p.life > 0);
    S.ouch = Math.max(0, (S.ouch || 0) - dt * 1.8);
    if (S.msg) S.msg.at -= dt;
  },
  down(x, y, S) { this.move(x, y, S); },
  move(x, y, S) { S.ang = Math.atan2(y - (WOM[1] - 14), x - WOM[0]); },
  up() {},
  won: () => false, // 버티면 시간이 다 되었을 때 — 틀은 시간이 다 되면 진 것으로 보므로 survive로 따로 판정
  survive: true, bonus: S => Math.round(200 * (1 - S.hits / HITS)), // 버티는 놀이: 덜 맞을수록 보너스
  lost: S => S.hits >= HITS,
  failText: () => tr('지키지 못했어요'),
  draw(g, S) {
    const sh = Math.sin(S.t * 60) * S.shake * 5;
    g.save(); g.translate(sh, 0);
    const A = bgArt(g, 'e39/bg');
    // 성전 뜰: 돌바닥과 주랑 기둥
    if (!A) { const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#c9b48e'); bg.addColorStop(1, '#a8916a'); g.fillStyle = bg; g.fillRect(-10, 0, W + 20, H);
    g.fillStyle = '#e3d6b8'; for (let i = 0; i < 7; i++) { g.fillRect(14 + i * 62, 0, 18, 70); g.fillStyle = 'rgba(80,60,30,.25)'; g.fillRect(28 + i * 62, 0, 4, 70); g.fillStyle = '#e3d6b8'; }
    g.fillStyle = 'rgba(70,50,20,.25)'; g.fillRect(0, 70, W, 6);
    g.strokeStyle = 'rgba(90,70,40,.22)'; g.lineWidth = 1; for (let y = 90; y < H; y += 30) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); } }
    // 그분: 몸을 굽혀 땅에 쓰신다(요 8:6) — 오른쪽 아래
    if (!spr(g, 'e39/jesus-write', 336, 488, 104)) figure(g, 330, 462, 64, 0); g.strokeStyle = 'rgba(90,70,40,.6)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(296, 470); g.quadraticCurveTo(306, 462, 316, 471); g.moveTo(300, 476); g.lineTo(318, 476); g.stroke();
    // 돌 든 사람들
    for (const m of S.men) accuser(g, m, S);
    // 여인 (무릎 꿇고 고개 숙임)
    g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(WOM[0], WOM[1] + 4, 26, 7, 0, 0, 7); g.fill();
    const ou = S.ouch || 0, kick = ou * Math.sin(ou * 20) * 6;
    if (spr(g, 'e39/woman', WOM[0] + kick, WOM[1] + 8, 92, { rot: ou * 0.12 * Math.sign((S.hitAt?.[0] ?? 0) - WOM[0] || 1) * -1 })) {
      if (ou > 0) { const rg = g.createRadialGradient(WOM[0], WOM[1] - 40, 4, WOM[0], WOM[1] - 40, 70); rg.addColorStop(0, `rgba(255,60,40,${0.55 * ou})`); rg.addColorStop(1, 'rgba(255,60,40,0)'); g.fillStyle = rg; g.fillRect(WOM[0] - 70, WOM[1] - 110, 140, 140);
        g.font = '900 18px "Noto Sans KR",sans-serif'; g.textAlign = 'center'; g.lineWidth = 4; g.strokeStyle = 'rgba(40,10,10,.7)'; g.globalAlpha = ou; g.strokeText(tr('아!'), WOM[0] + 34, WOM[1] - 92); g.fillStyle = '#ffb0a0'; g.fillText(tr('아!'), WOM[0] + 34, WOM[1] - 92); g.globalAlpha = 1; } }
    else { g.fillStyle = '#6a5a8a'; g.beginPath(); g.moveTo(WOM[0] - 20, WOM[1]); g.quadraticCurveTo(WOM[0] - 14, WOM[1] - 34, WOM[0], WOM[1] - 36); g.quadraticCurveTo(WOM[0] + 14, WOM[1] - 34, WOM[0] + 20, WOM[1]); g.fill();
    g.fillStyle = '#3a2e4a'; g.beginPath(); g.arc(WOM[0], WOM[1] - 38, 9, 0, 7); g.fill(); }
    // 겉옷 방패
    if (!S.leave) { g.save(); g.lineCap = 'round'; g.strokeStyle = '#7a2e2a'; g.lineWidth = 12; g.beginPath(); g.arc(WOM[0], WOM[1] - 14, SHIELD_R, S.ang - SHIELD_W / 2, S.ang + SHIELD_W / 2); g.stroke();
      g.strokeStyle = 'rgba(255,220,180,.5)'; g.lineWidth = 2; g.beginPath(); g.arc(WOM[0], WOM[1] - 14, SHIELD_R - 4, S.ang - SHIELD_W / 2 + 0.05, S.ang + SHIELD_W / 2 - 0.05); g.stroke(); g.restore();
      g.strokeStyle = 'rgba(255,255,255,.16)'; g.setLineDash([3, 6]); g.beginPath(); g.arc(WOM[0], WOM[1] - 14, SHIELD_R, 0, 7); g.stroke(); g.setLineDash([]); }
    for (const f of S.flying) { g.save(); g.translate(f.x, f.y); g.rotate(f.rot); g.fillStyle = '#8a8274'; g.beginPath(); g.moveTo(-6, -3); g.lineTo(0, -6); g.lineTo(6, -2); g.lineTo(5, 4); g.lineTo(-4, 5); g.closePath(); g.fill(); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(-3, -4, 4, 2); g.restore(); }
    for (const [x, y] of S.fallen) { g.fillStyle = '#8a8274'; g.beginPath(); g.ellipse(x, y, 6, 4, 0, 0, 7); g.fill(); }
    for (const p of S.sparks) { if (p.rock) { g.fillStyle = `rgba(150,140,124,${clamp(p.life * 2, 0, 1)})`; g.beginPath(); g.arc(p.x, p.y, p.r, 0, 7); g.fill(); continue; } g.fillStyle = `rgba(255,236,170,${clamp(p.life, 0, 1)})`; star(g, p.x, p.y, p.r * 2.4); }
    g.restore();
    floatMsg(g, S.msg);
    g.save(); g.font = '700 14px "Noto Sans KR",sans-serif'; g.textAlign = 'left'; g.lineWidth = 3; g.strokeStyle = 'rgba(60,40,20,.5)'; g.fillStyle = '#fff';
    const hp = '♥'.repeat(HITS - S.hits) + '♡'.repeat(S.hits); g.strokeText(tr('여인 {0}', hp), 14, 96); g.fillStyle = '#ffd0c0'; g.fillText(tr('여인 {0}', hp), 14, 96); g.restore();
  },
  // 버텼다: 그분이 일어나 한마디 하시면 하나씩 돌을 내려놓고 떠난다(어른부터 — 요 8:9)
  end(g, k, S) {
    if (!S.leave) { S.leave = 1; S.flying = []; for (const m of S.men) m.wind = 0; }
    S.men.forEach((m, i) => { const t = clamp(k * 2.2 - i * 0.18, 0, 1); if (t > 0.05 && !m.dropped) { m.dropped = true; S.fallen.push([m.x + 8, m.y + 14]); S.fx.play('drop'); } m.gone = t; });
    this.draw(g, S);
    g.save(); g.globalAlpha = clamp(k * 2.5, 0, 1); g.fillStyle = 'rgba(40,28,14,.82)'; g.fillRect(0, 196, W, 78);
    g.font = '700 18px "Gowun Batang",serif'; g.textAlign = 'center'; g.fillStyle = '#fff0d6'; g.fillText(tr('너희 중에 죄 없는 자가'), W / 2, 226); g.fillText(tr('먼저 돌로 치라'), W / 2, 250);
    g.font = '600 11px "Noto Sans KR",sans-serif'; g.fillStyle = '#e6cfa6'; g.fillText(tr('요 8:7'), W / 2, 267); g.restore();
  },
};
function accuser(g, m, S) {
  if (m.gone >= 1) return;
  const x = m.x + (m.gone || 0) * (m.x < WOM[0] ? -160 : 160), y = m.y - (m.gone || 0) * 40;
  if (art('e39/elder-low')) { // 그림: 노인 바리새인·서기관을 번갈아, 여인 쪽을 보게. 돌을 치켜들면 '든' 그림으로 바꾼다
    const who = m.hue % 40 === 0 ? 'elder' : 'scribe', up = !S.leave && m.wind ? clamp(1 - m.wind / WIND, 0, 1) : 0, flip = m.x > WOM[0], h = 96 + (y - 200) * 0.12, o = { flip, a: 1 - (m.gone || 0) };
    g.fillStyle = `rgba(0,0,0,${0.22 * o.a})`; g.beginPath(); g.ellipse(x, y + 22, 18, 5, 0, 0, 7); g.fill();
    spr(g, `e39/${who}-low`, x, y + 24, h, { ...o, a: o.a * (1 - up) }); spr(g, `e39/${who}-up`, x + (flip ? 8 : -8) * up, y + 24, h, { ...o, a: o.a * up });
    if (m.wind && !S.leave) { g.strokeStyle = `rgba(255,70,50,${0.5 + up * 0.5})`; g.lineWidth = 3; g.beginPath(); g.ellipse(x, y + 22, 26 + (1 - up) * 8, 9 + (1 - up) * 3, 0, 0, 7); g.stroke(); }
    return; }
  g.save(); g.globalAlpha = 1 - (m.gone || 0); g.translate(x, y);
  g.fillStyle = 'rgba(0,0,0,.22)'; g.beginPath(); g.ellipse(0, 18, 14, 4, 0, 0, 7); g.fill();
  g.fillStyle = `hsl(${m.hue},28%,42%)`; g.beginPath(); g.moveTo(-12, 18); g.quadraticCurveTo(-10, -10, 0, -12); g.quadraticCurveTo(10, -10, 12, 18); g.fill();
  g.fillStyle = '#d9c9a8'; g.beginPath(); g.arc(0, -18, 7, 0, 7); g.fill(); g.fillStyle = '#4a3a2a'; g.fillRect(-6, -14, 12, 6); // 수염
  if (!S.leave) { // 돌 든 손 — 치켜들면 위로, 빨간 표시
    const up = m.wind ? clamp(1 - m.wind / WIND, 0, 1) : 0; g.strokeStyle = `hsl(${m.hue},28%,38%)`; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(8, -6); g.lineTo(14, -6 - up * 18); g.stroke();
    g.fillStyle = '#8a8274'; g.beginPath(); g.arc(15, -9 - up * 18, 4, 0, 7); g.fill();
    if (m.wind) { g.strokeStyle = `rgba(255,70,50,${0.5 + up * 0.5})`; g.lineWidth = 2.5; g.beginPath(); g.arc(0, -4, 22 + (1 - up) * 8, 0, 7); g.stroke(); } }
  g.restore();
}

/* ---------- 여리고의 두 만남 (눅 19:1–10): 키 작은 삭개오, 돌무화과나무 오르기 — 타이밍 ---------- */
// 가지가 바람에 흔들려 몸 가까이 올 때(빛날 때) 그쪽(왼쪽·오른쪽 화면)을 누르면 한 칸 오른다. 엉뚱한 쪽이거나 멀 때 누르면 미끄러져 한 칸 내려간다.
// 아래 길로 예수님 일행이 지나가신다 — 다 지나가시기 전에 꼭대기에 올라야 한다(19:4). 높이 오를수록 가지가 빨리 흔들린다
const BRANCH = 9;
const climb = {
  title: tr('여리고의 두 만남'), task: tr('돌무화과나무 꼭대기까지'),
  ask: [tr('여리고에 키가 작은 세리장 삭개오가 있었단다. 사람들에 가려 나를 볼 수가 없었지.'), tr('그가 앞으로 달려가 나무에 올랐단다 — 너도 내가 지나가기 전에 꼭대기까지 올라 보렴!')],
  quote: tr('앞으로 달려가서 보기 위하여 돌무화과나무에 올라가니'), ref: tr('눅 19:4'),
  help: tr('가지가 몸 가까이 흔들려 올 때(빛날 때) 그쪽 — 화면 왼쪽이나 오른쪽 — 을 누르면 올라가요.<br>멀 때 누르거나 반대쪽을 누르면 미끄러져요. 예수님이 다 지나가시기 전에!'),
  art: ['e46/bg', 'e46/trunk', 'e46/leaves', 'e46/zac', 'e46/jesus-walk', 'e46/jesus-up', 'e46/crowd'],
  seconds: 14, // 반응 지연을 둔 자동 오르기로 60fps 시뮬레이션: 빠른 반응 6초, 보통 9초, 느린 반응 12초
  init() {
    const br = Array.from({ length: BRANCH }, (_, i) => ({ side: i === 0 ? -1 : Math.random() < 0.5 ? -1 : 1, ph: rnd(0, 6), w: 2.6 + i * 0.28 }));
    for (let i = 1; i < BRANCH; i++) if (br[i].side === br[i - 1].side && Math.random() < 0.5) br[i].side *= -1; // 좌우가 섞이게
    return { br, lv: 0, view: 0, t: 0, slip: 0, msg: null, sparks: [], leaves: Array.from({ length: 40 }, () => [rnd(0, W), rnd(-400, H), rnd(0.6, 1.4)]) };
  },
  near(S, i) { const b = S.br[i]; return b && (Math.sin(S.t * b.w + b.ph) + 1) / 2; }, // 0 멀다 → 1 가깝다
  update(dt, S) {
    S.t += dt; S.view += (S.lv - S.view) * Math.min(1, dt * 6); S.slip = Math.max(0, S.slip - dt * 2.5);
    for (const p of S.sparks) { p.y += p.vy * dt; p.life -= dt; } S.sparks = S.sparks.filter(p => p.life > 0);
    if (S.msg) S.msg.at -= dt;
  },
  down(x, y, S) {
    if (S.lv >= BRANCH) return;
    const side = x < W / 2 ? -1 : 1, b = S.br[S.lv], n = this.near(S, S.lv);
    if (side === b.side && n > 0.68) { S.lv++; S.fx.play('flip'); if (S.lv >= BRANCH) S.fx.play('plink');
      for (let i = 0; i < 6; i++) S.sparks.push({ x: W / 2 + side * 60, y: 250 + rnd(-10, 10), vy: rnd(-40, -10), life: rnd(0.3, 0.7), r: rnd(1.2, 2.2) }); }
    else { const was = S.lv; S.lv = Math.max(0, S.lv - 1); S.slip = 1; S.fx.play('miss'); S.msg = { t: was ? tr('미끄러졌어요!') : tr('아직 멀어요'), c: '#ffb38a', at: 0.9, x: W / 2, y: 200 }; }
  },
  up() {},
  won: S => S.lv >= BRANCH,
  draw(g, S) {
    const v = S.view, span = 64; // 가지 사이 높이 — 오를수록 화면이 아래로(위로 올라간 듯)
    const A = art('e46/trunk'); if (A) { g.drawImage(art('e46/bg'), 0, -20 + v * 2, W, H + 20); } else { const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#9cc9e6'); sky.addColorStop(1, '#e8dcb4'); g.fillStyle = sky; g.fillRect(0, 0, W, H); }
    // 아래 길과 무리 (오를수록 아래로 멀어진다), 지나가시는 예수님 일행
    const roadY = 452 + v * 3, prog = clamp(S.t / this.seconds, 0, 1); // 길은 늘 아래에 보이게 — 오를수록 무리가 작아 보이기만(끝에 그분이 올려다보시는 것이 보여야)
    g.fillStyle = '#c9b48a'; g.fillRect(0, roadY - 10, W, 200);
    const ks = 1 - v / BRANCH * 0.45; // 오를수록 아래 사람들이 작게
    if (A) { spr(g, 'e46/crowd', 100, roadY + 22, 70 * ks); spr(g, 'e46/crowd', 330, roadY + 26, 74 * ks, { flip: true }); } else
    for (let i = 0; i < 16; i++) { const x = (i * 29 + 6) % W, y = roadY - 4 + (i % 3) * 7; g.fillStyle = `hsl(${(i * 47) % 360},25%,40%)`; g.beginPath(); g.arc(x, y, 9 * ks, Math.PI, 0); g.fill(); g.fillStyle = '#c99872'; g.beginPath(); g.arc(x, y - 11 * ks, 5 * ks, 0, 7); g.fill(); }
    const jx = S.lv >= BRANCH ? W / 2 + 60 : -30 + prog * (W + 60); if (!spr(g, S.lv >= BRANCH ? 'e46/jesus-up' : 'e46/jesus-walk', jx, Math.min(H - 2, roadY + 30), 84 * Math.max(0.75, ks))) figure(g, jx, Math.min(H - 4, roadY + 20), 42, S.lv >= BRANCH ? 1 : 0); // 오르면 나무 아래 멈춰 올려다보신다
    // 나무 줄기
    const trk = g.createLinearGradient(W / 2 - 22, 0, W / 2 + 22, 0); trk.addColorStop(0, '#5a4630'); trk.addColorStop(0.5, '#8a6e4a'); trk.addColorStop(1, '#4a3826');
    if (A) { const tw = 74, th = A.height * tw / A.width, off = ((v * span) % th + th) % th; for (let y = -th + off, n = Math.floor((v * span) / th); y < H; y += th, n--) { g.save(); g.translate(W / 2, y + th / 2); if (n % 2) g.scale(1, -1); g.drawImage(A, -tw / 2, -th / 2 - 0.5, tw, th + 1); g.restore(); } } // 한 칸씩 뒤집어 이음매가 맞게 // 줄기 그림을 이어 붙여 오를수록 흘러내린다
    else { g.fillStyle = trk; g.beginPath(); g.moveTo(W / 2 - 30, H); g.lineTo(W / 2 - 18, 0); g.lineTo(W / 2 + 18, 0); g.lineTo(W / 2 + 30, H); g.fill(); }
    // 가지 (지금 붙잡을 가지는 흔들림에 따라 빛난다)
    for (let i = 0; i < BRANCH; i++) {
      const y = 330 - (i - v) * span; if (y < -40 || y > H + 20) continue;
      const b = S.br[i], n = this.near(S, i), reach = 70 + (1 - n) * 70, x0 = W / 2 + b.side * 16, x1 = W / 2 + b.side * (16 + reach);
      const cur = i === S.lv, hot = cur && n > 0.68;
      g.strokeStyle = hot ? '#ffe29a' : '#6a5236'; g.lineWidth = hot ? 9 : 7; g.lineCap = 'round';
      g.beginPath(); g.moveTo(x0, y); g.quadraticCurveTo((x0 + x1) / 2, y - 14, x1, y - 6 + Math.sin(S.t * b.w + b.ph) * 4); g.stroke();
      g.fillStyle = i < S.lv ? 'rgba(90,130,60,.7)' : 'rgba(110,150,70,.9)';
      if (!spr(g, 'e46/leaves', x1 - b.side * 16, y + 8, 50, { flip: b.side < 0, a: i < S.lv ? 0.75 : 1 })) for (let k = 0; k < 4; k++) { g.beginPath(); g.ellipse(x1 - b.side * k * 14, y - 14 - (k % 2) * 6, 13, 8, b.side * 0.4, 0, 7); g.fill(); }
      if (cur && !hot) { g.strokeStyle = 'rgba(255,255,255,.25)'; g.setLineDash([3, 5]); g.beginPath(); g.arc(W / 2 + b.side * 86, y - 6, 18, 0, 7); g.stroke(); g.setLineDash([]); }
    }
    // 삭개오 (줄기에 매달림)
    const zy = 360 + S.slip * 18, zx = W / 2 + Math.sin(S.t * 3) * 2;
    if (spr(g, 'e46/zac', zx, zy + 34, 86)) {} else { g.fillStyle = '#5a4a7a'; g.beginPath(); g.ellipse(zx, zy, 13, 18, 0, 0, 7); g.fill();
    g.fillStyle = '#c99872'; g.beginPath(); g.arc(zx, zy - 22, 8, 0, 7); g.fill(); g.fillStyle = '#3a2a1a'; g.beginPath(); g.arc(zx, zy - 25, 8, Math.PI, 0); g.fill();
    g.strokeStyle = '#c99872'; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(zx - 10, zy - 10); g.lineTo(zx - 18, zy - 30); g.moveTo(zx + 10, zy - 10); g.lineTo(zx + 18, zy - 30); g.stroke(); }
    // 흩날리는 잎
    for (const l of S.leaves) { l[1] += 0.6 * l[2]; l[0] += Math.sin(S.t + l[1] * 0.02) * 0.4; if (l[1] > H) l[1] = -10; g.fillStyle = 'rgba(110,150,70,.45)'; g.beginPath(); g.ellipse(l[0], l[1], 4 * l[2], 2 * l[2], l[1] * 0.05, 0, 7); g.fill(); }
    for (const p of S.sparks) { g.fillStyle = `rgba(255,236,170,${clamp(p.life, 0, 1)})`; star(g, p.x, p.y, p.r * 2.4); }
    floatMsg(g, S.msg);
    // 높이, 지나가시는 정도
    g.save(); g.font = '700 14px "Noto Sans KR",sans-serif'; g.textAlign = 'left'; g.lineWidth = 3; g.strokeStyle = 'rgba(40,50,60,.5)'; g.fillStyle = '#fff';
    g.strokeText(tr('높이 {0} / {1}', S.lv, BRANCH), 14, 24); g.fillText(tr('높이 {0} / {1}', S.lv, BRANCH), 14, 24); g.restore();
    g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(W - 140, 16, 124, 6); g.fillStyle = '#ffb38a'; g.fillRect(W - 140, 16, 124 * prog, 6);
    g.font = '600 11px "Noto Sans KR",sans-serif'; g.textAlign = 'right'; g.fillStyle = 'rgba(255,255,255,.9)'; g.fillText(tr('예수님이 지나가심'), W - 16, 36);
  },
  end(g, k, S) { this.update(0.016, S); this.draw(g, S);
    if (k > 0.25) { g.save(); g.globalAlpha = clamp((k - 0.25) * 2, 0, 1); g.fillStyle = 'rgba(30,24,14,.8)'; g.fillRect(0, 92, W, 84);
      g.font = '700 17px "Gowun Batang",serif'; g.textAlign = 'center'; g.fillStyle = '#fff0d6'; g.fillText(tr('삭개오야 속히 내려오라'), W / 2, 122); g.fillText(tr('내가 오늘 네 집에 유하여야 하겠다'), W / 2, 146);
      g.font = '600 11px "Noto Sans KR",sans-serif'; g.fillStyle = '#e6cfa6'; g.fillText(tr('눅 19:5'), W / 2, 165); g.restore(); }
  },
};

/* ---------- 다른 여정에서 다시 쓰는 놀이 (사용자 2026-11: 여정마다 비슷한 방식이어도 된다) — 글·끝 말씀·생김새만 바꿔 끼운다 ---------- */
// 다윗: 베들레헴 들판의 목동(d01) — 양 몰기, 이리 대신 사자(삼상 17:34–35)
const herdDavid = { ...sheep, title: tr('베들레헴 들판의 목동'), art: ['e42/bg', 'e42/sheep', 'e42/stone', 'd01/lion', 'd01/shepherd'], pred: { name: tr('사자'), color: '#b98a44', mane: '#7a4e22' },
  ask: [tr('나도 이 들판에서 아버지의 양을 쳤단다. 사자나 곰이 새끼를 물어 가면 쫓아가 건져 냈지.'), tr('흩어진 양을 우리로 데려다 주렴 — 사자가 오면 네가 지켜야 해!')],
  quote: tr('사자나 곰이 와서 양 떼에서 새끼를 물어 가면 내가 따라가서 그 입에서 새끼를 건져내었고'), ref: tr('삼상 17:34–35'),
  help: tr('끌면 목동이 따라와요. 양은 목동을 피해 움직여요 — 뒤에서 몰아 우리 문(왼쪽 아래 틈)으로 넣어요.<br>사자가 나타나면 가까이 가서 쫓아요.'),
  endLines: [tr('여호와는 나의 목자시니'), tr('내게 부족함이 없으리로다'), tr('시 23:1')] };
// 다윗: 성전을 위한 준비(d38) — 다듬은 돌 쌓기(대상 22:2), 끝은 비 대신 영광의 빛
const templeStones = { ...rock, title: tr('성전을 위한 준비'), glory: true, art: ['d38/bg', 'e23/block'],
  ask: [tr('내 아들 솔로몬이 지을 여호와의 집을 위해 돌을 다듬어 두려 한다.'), tr('다듬은 돌을 빈틈없이 맞춰 쌓아 보렴 — 여섯 켜!')],
  quote: tr('석수를 세워 하나님의 성전을 건축할 돌을 다듬게 하고'), ref: tr('대상 22:2'),
  failText: S => S.dead ? tr('돌이 무너졌어요 — 다시 쌓아요') : tr('시간이 다 되었어요'),
  endLines: [tr('이제 너희는 마음과 뜻을 바쳐'), tr('너희 하나님 여호와를 구하라'), tr('대상 22:19')] };
// 모세와 여호수아: 실로에서 나눈 땅(m39) — 열두 지파와 야곱·모세가 남긴 축복 짝 맞추기(창 49장·신 33장)
const TRIBES = [
  [tr('르우벤'), '🌊', tr('물의 끓음 같으니'), tr('창 49:4')], [tr('시므온'), '🗡️', tr('그 칼은 폭력의 도구'), tr('창 49:5')],
  [tr('유다'), '🦁', tr('사자 새끼로다'), tr('창 49:9')], [tr('잇사갈'), '🫏', tr('건장한 나귀'), tr('창 49:14')],
  [tr('스불론'), '⛵', tr('배 매는 해변'), tr('창 49:13')], [tr('단'), '🐍', tr('길의 뱀이요'), tr('창 49:17')],
  [tr('갓'), '⚔️', tr('도리어 추격하리라'), tr('창 49:19')], [tr('아셀'), '🍞', tr('먹을 것이 기름진 자'), tr('창 49:20')],
  [tr('납달리'), '🦌', tr('놓인 암사슴'), tr('창 49:21')], [tr('베냐민'), '🐺', tr('물어뜯는 이리'), tr('창 49:27')],
  [tr('에브라임'), '🐂', tr('첫 수송아지 같은 위엄'), tr('신 33:17')], [tr('므낫세'), '🌿', tr('담을 넘은 무성한 가지'), tr('창 49:22 · 신 33:17')],
];
// 이름 카드에도 축복의 그림 글자를 — 창세기 49장을 외우지 않아도 그림으로 짝을 찾고, 맞추며 축복을 읽게(사용자 2026-11: '유다가 사자인 것밖에 모르겠다')
const tribes = { ...twelve, icons: true, title: tr('실로에서 나눈 땅'), task: tr('열두 지파와 그 축복 짝 맞추기'), data: TRIBES, scene: 'm39', art: ['m39/bg', 'm39/back', 'e22/face'],
  ask: [tr('이제 이 땅을 열두 지파에게 제비 뽑아 나누었다.'), tr('야곱이 아들들에게 남긴 축복을 기억하니? 지파와 그 축복을 짝지어 보렴.')],
  quote: tr('이들은 이스라엘의 열두 지파라 … 각 사람의 분량대로 축복하였더라'), ref: tr('창 49:28'),
  help: tr('처음 3초 동안 카드를 모두 보여 줘요 — 잘 봐 두세요.<br>두 장씩 뒤집어 <b>같은 그림</b>의 지파 이름과 그 축복을 짝지어요. 틀리면 다시 덮여요.'),
  endLines: [tr('여호와께서 조상들에게 맹세하신 온 땅을'), tr('이스라엘에게 다 주셨으므로'), tr('수 21:43')] };

/* ---------- 다섯 개의 매끄러운 돌 (삼상 17:40–50): 물매로 골리앗의 이마를 — 겨누기 ---------- */
// 화면을 끌었다 놓으면(뒤로 당긴 만큼 세게, 반대 방향으로) 물매 돌이 날아간다. 처음 몇 점만 궤적이 보인다.
// 골리앗은 방패 든 자를 앞세우고(17:41) 걸어오며 몸이 흔들린다. 놋 투구·비늘 갑옷·방패에 맞으면 튕겨 나가고, 이마(17:49)에 맞아야 쓰러진다.
// 돌은 다섯(17:40). 다 쓰거나 골리앗이 코앞까지 오면 실패
const DAV = [62, 420], GRAV = 390, VMAX = 560;
const sling = {
  title: tr('다섯 개의 매끄러운 돌'), task: tr('물매 돌로 골리앗의 이마를'),
  ask: [tr('저 거인은 칼과 창과 단창을 의지하지만, 나는 만군의 여호와의 이름을 의지한다.'), tr('시냇가에서 고른 매끄러운 돌 다섯 개가 있다 — 이마를 노려라!')],
  quote: tr('시내에서 매끄러운 돌 다섯을 골라서 자기 목자의 제구 곧 주머니에 넣고 손에 물매를 가지고'), ref: tr('삼상 17:40'),
  help: tr('화면을 뒤로 끌었다 놓으면 돌이 날아가요 — 당긴 만큼 세게, 반대쪽으로.<br>과녁은 투구 바로 아래 <b>이마</b>(깜박이는 고리). 투구·갑옷·방패는 튕겨 내요. 돌은 다섯 개, 거인이 다가와요.'),
  art: ['d05/bg', 'd05/goliath', 'd05/bearer', 'd05/david'],
  seconds: 30,
  init() { return { stones: 5, shot: null, gx: 360, t: 0, aim: null, msg: null, sparks: [], down: 0, fallen: 0, trail: [] }; },
  head(S) { const bob = Math.sin(S.t * 3.2) * 4, sway = Math.sin(S.t * 1.6) * 3; return { x: S.gx - 4 + sway, y: 236 + bob }; }, // 이마(투구 아래) 자리
  update(dt, S) {
    S.t += dt;
    if (!S.down) S.gx = Math.max(150, S.gx - dt * 6.2); // 천천히 다가온다 (30초에 약 190)
    const sh = S.shot;
    if (sh) {
      sh.vy += GRAV * dt; sh.x += sh.vx * dt; sh.y += sh.vy * dt; S.trail.push([sh.x, sh.y]); if (S.trail.length > 14) S.trail.shift();
      const h = this.head(S);
      if (!S.down && !sh.dead && Math.hypot(sh.x - h.x, sh.y - h.y) < 8.5) { // 이마!
        S.down = 1; S.shot = null; S.fx.play('thunder'); S.fx.play('plink'); S.msg = { t: tr('이마에 맞았다!'), c: '#ffe29a', at: 1.6, x: h.x - 40, y: h.y - 40 };
        for (let i = 0; i < 16; i++) S.sparks.push({ x: h.x, y: h.y, vy: rnd(-60, -10), life: rnd(0.4, 0.9), r: rnd(1.4, 2.6) });
      } else if (!S.down && !sh.dead && armorHit(S, sh)) { // 투구·갑옷·방패 — 한 번만 튕겨 다윗 쪽으로 떨어져 나간다(튕긴 돌이 갑옷 안에서 거듭 튀었다 — 사용자 2026-11)
        S.fx.play('halt'); S.msg = { t: armorHit(S, sh), c: '#cfd8e0', at: 0.9, x: sh.x, y: sh.y - 20 }; sh.vx = -Math.max(60, Math.abs(sh.vx) * 0.4); sh.vy = -110; sh.dead = true;
      }
      if (sh.y > 470 || sh.x > W + 20 || sh.x < -20) { S.shot = null; S.trail = []; }
    }
    if (S.down) S.fallen = Math.min(1, S.fallen + dt * 1.4);
    for (const p of S.sparks) { p.y += p.vy * dt; p.life -= dt; } S.sparks = S.sparks.filter(p => p.life > 0);
    if (S.msg) S.msg.at -= dt;
  },
  down(x, y, S) { if (S.shot || S.down || S.stones <= 0) return; S.aim = { x0: x, y0: y, x, y }; },
  move(x, y, S) { if (S.aim) { S.aim.x = x; S.aim.y = y; } },
  up(S) { const a = S.aim; S.aim = null; if (!a || S.shot || S.down) return;
    const v = vel(a); if (Math.hypot(v[0], v[1]) < 80) return; // 너무 약하면 던지지 않는다(실수로 톡 누름)
    S.shot = { x: DAV[0] + 14, y: DAV[1] - 40, vx: v[0], vy: v[1] }; S.trail = []; S.stones--; S.fx.play('cast'); },
  won: S => S.fallen >= 1,
  lost: S => (!S.down && (S.gx <= 150 || (S.stones <= 0 && !S.shot))),
  failText: S => S.stones <= 0 ? tr('돌이 다 떨어졌어요') : tr('거인이 코앞까지 왔어요'),
  draw(g, S) {
    // 엘라 골짜기: 양쪽 산, 가운데 시내
    const A = bgArt(g, 'd05/bg');
    if (!A) { const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#a9c8dc'); sky.addColorStop(0.55, '#e6d9b4'); sky.addColorStop(1, '#b49a6c'); g.fillStyle = sky; g.fillRect(0, 0, W, H);
    g.fillStyle = '#9a8a62'; g.beginPath(); g.moveTo(0, 300); g.quadraticCurveTo(90, 190, 200, 290); g.quadraticCurveTo(300, 200, W, 280); g.lineTo(W, H); g.lineTo(0, H); g.fill();
    g.fillStyle = '#b5a274'; g.fillRect(0, 432, W, 70); g.fillStyle = '#6e9aa8'; g.beginPath(); g.ellipse(170, 470, 120, 10, 0, 0, 7); g.fill(); // 시내
    for (const [x, y] of [[120, 466], [150, 474], [205, 468], [235, 476], [180, 480]]) { g.fillStyle = '#d8d0c0'; g.beginPath(); g.ellipse(x, y, 4, 2.6, 0, 0, 7); g.fill(); } } // 매끄러운 돌
    // 골리앗과 방패 든 자
    giant(g, S);
    // 다윗
    const ax = S.aim ? clamp(S.aim.x - S.aim.x0, -90, 90) : 0, ay = S.aim ? clamp(S.aim.y - S.aim.y0, -90, 90) : 0;
    if (A && art('d05/david')) { g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(DAV[0], DAV[1] + 12, 18, 5, 0, 0, 7); g.fill(); spr(g, 'd05/david', DAV[0], DAV[1] + 14, 104);
      if (S.aim) { g.strokeStyle = '#5a3a1a'; g.lineWidth = 1.6; const hx = DAV[0] + 14, hy = DAV[1] - 40; g.beginPath(); g.moveTo(hx, hy); g.lineTo(hx + ax * 0.5, hy + ay * 0.5); g.stroke(); g.fillStyle = '#d8d0c0'; g.beginPath(); g.arc(hx + ax * 0.5, hy + ay * 0.5, 3.5, 0, 7); g.fill(); } }
    else { g.save(); g.translate(DAV[0], DAV[1]);
    g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(0, 12, 14, 4, 0, 0, 7); g.fill();
    g.fillStyle = '#c9a874'; g.beginPath(); g.moveTo(-10, 10); g.quadraticCurveTo(-8, -26, 0, -28); g.quadraticCurveTo(8, -26, 10, 10); g.fill();
    g.fillStyle = '#c99872'; g.beginPath(); g.arc(0, -34, 7, 0, 7); g.fill(); g.fillStyle = '#6a3a1a'; g.beginPath(); g.arc(0, -37, 7.5, Math.PI, 0); g.fill();
    g.strokeStyle = '#c99872'; g.lineWidth = 3.5; g.lineCap = 'round'; g.beginPath(); g.moveTo(5, -22); const hx = 14 + ax * 0.15, hy = -40 + ay * 0.15; g.lineTo(hx, hy); g.stroke();
    g.strokeStyle = '#5a3a1a'; g.lineWidth = 1.4; // 물매 줄 — 당기면 늘어진다
    if (S.aim) { g.beginPath(); g.moveTo(hx, hy); g.lineTo(hx + ax * 0.5, hy + ay * 0.5); g.stroke(); g.fillStyle = '#d8d0c0'; g.beginPath(); g.arc(hx + ax * 0.5, hy + ay * 0.5, 3.5, 0, 7); g.fill(); }
    else { const r = S.t * 12; g.beginPath(); g.moveTo(hx, hy); g.lineTo(hx + Math.cos(r) * 14, hy + Math.sin(r) * 14); g.stroke(); } // 빙빙 돌린다
    g.restore(); }
    // 겨눔: 처음 몇 점만 궤적
    if (S.aim) { const v = vel(S.aim); let x = DAV[0] + 14, y = DAV[1] - 40, vx = v[0], vy = v[1];
      for (let i = 0; i < 6; i++) { for (let k = 0; k < 4; k++) { vy += GRAV * 0.016; x += vx * 0.016; y += vy * 0.016; } g.fillStyle = `rgba(255,255,255,${0.8 - i * 0.12})`; g.beginPath(); g.arc(x, y, 2.4, 0, 7); g.fill(); } }
    for (const [i, [x, y]] of S.trail.entries()) { g.fillStyle = `rgba(230,225,210,${i / S.trail.length * 0.6})`; g.beginPath(); g.arc(x, y, 2, 0, 7); g.fill(); }
    if (S.shot) { g.fillStyle = '#e6dfcf'; g.beginPath(); g.arc(S.shot.x, S.shot.y, 3.6, 0, 7); g.fill(); }
    for (const p of S.sparks) { g.fillStyle = `rgba(255,236,170,${clamp(p.life, 0, 1)})`; star(g, p.x, p.y, p.r * 2.4); }
    floatMsg(g, S.msg);
    // 남은 돌
    g.save(); g.font = '700 14px "Noto Sans KR",sans-serif'; g.textAlign = 'left'; g.fillStyle = '#3a2a14'; g.fillText(tr('남은 돌'), 14, 26);
    for (let i = 0; i < 5; i++) { g.fillStyle = i < S.stones ? '#e6dfcf' : 'rgba(60,40,20,.25)'; g.beginPath(); g.ellipse(76 + i * 16, 21, 6, 4.5, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(60,40,20,.5)'; g.lineWidth = 1; g.stroke(); }
    g.restore();
  },
  end(g, k, S) { this.update(0.016, S); this.draw(g, S);
    if (k > 0.35) { g.save(); g.globalAlpha = clamp((k - 0.35) * 2, 0, 1); g.fillStyle = 'rgba(30,22,12,.8)'; g.fillRect(0, 96, W, 84);
      g.font = '700 18px "Gowun Batang",serif'; g.textAlign = 'center'; g.fillStyle = '#fff0d6'; g.fillText(tr('전쟁은 여호와께 속한 것인즉'), W / 2, 126); g.fillText(tr('그가 너희를 우리 손에 넘기시리라'), W / 2, 150);
      g.font = '600 11px "Noto Sans KR",sans-serif'; g.fillStyle = '#e6cfa6'; g.fillText(tr('삼상 17:47'), W / 2, 169); g.restore(); }
  },
};
const vel = a => { const dx = a.x0 - a.x, dy = a.y0 - a.y, L = Math.hypot(dx, dy), k = Math.min(1, L / 120) * VMAX / (L || 1); return [dx * k, dy * k]; }; // 당긴 반대쪽으로, 120까지 당기면 최대
// 맞은 곳: 투구·갑옷·방패면 그 이름(튕긴다), 아니면 null
function armorHit(S, sh) {
  const h = sling.head(S), gx = S.gx;
  if (Math.hypot(sh.x - h.x, sh.y - (h.y - 13)) < 13) return tr('놋 투구에 튕겼어요');
  if (sh.x > gx - 22 && sh.x < gx + 22 && sh.y > h.y + 12 && sh.y < 430) return tr('비늘 갑옷에 튕겼어요');
  const bx = gx - 74; if (sh.x > bx - 18 && sh.x < bx + 14 && sh.y > 330 && sh.y < 428) return tr('방패에 막혔어요');
  return null;
}
function giant(g, S) {
  const h = sling.head(S), gx = S.gx, f = S.fallen, bx = gx - 74;
  if (art('d05/goliath')) { // 그림: 이마(그림 속 195,62 / 351×420)가 과녁 자리(h)에 오도록 — 왼쪽(다윗 쪽)을 보게 뒤집는다
    g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(bx, 430, 26, 6, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(gx, 432, 40, 8, 0, 0, 7); g.fill();
    spr(g, 'd05/bearer', bx, 432, 132, { a: 1 - f * 0.5 });
    const k = (430 - h.y) / (420 - 62), gh = 420 * k; spr(g, 'd05/goliath', h.x, 430, gh, { flip: true, ax: 195 / 351, rot: -f * 1.45 });
    if (!f) { const p = 0.5 + 0.5 * Math.sin(S.t * 6); g.strokeStyle = `rgba(255,236,170,${0.55 + p * 0.4})`; g.lineWidth = 2; g.beginPath(); g.arc(h.x, h.y, 8.5 + p * 2, 0, 7); g.stroke(); g.fillStyle = 'rgba(255,240,200,.35)'; g.beginPath(); g.arc(h.x, h.y, 3, 0, 7); g.fill(); } // 이마 — 맞힐 자리(고리 크기 = 맞는 범위)
    return; }
  // 방패 든 자 (앞서 걷는다)
  g.save(); g.translate(bx, 428); g.globalAlpha = 1 - f * 0.5;
  g.fillStyle = '#7a6a52'; g.beginPath(); g.moveTo(-6, 0); g.quadraticCurveTo(-5, -38, 4, -40); g.quadraticCurveTo(13, -38, 14, 0); g.fill();
  g.fillStyle = '#c99872'; g.beginPath(); g.arc(5, -46, 6, 0, 7); g.fill();
  g.fillStyle = '#a07a3a'; g.strokeStyle = '#6e4e1e'; g.lineWidth = 2; g.beginPath(); g.ellipse(-4, -50, 16, 48, 0, 0, 7); g.fill(); g.stroke(); // 큰 방패
  g.fillStyle = '#d9b46a'; g.beginPath(); g.arc(-4, -50, 5, 0, 7); g.fill();
  g.restore();
  // 골리앗 (쓰러지면 앞으로 엎드러진다 — 17:49)
  g.save(); g.translate(gx, 430); g.rotate(-f * 1.45); g.translate(0, 0);
  const hy = h.y - 430, hx = h.x - gx;
  g.fillStyle = '#4a3a2a'; g.fillRect(-18, -40, 14, 40); g.fillRect(4, -40, 14, 40); // 다리
  g.fillStyle = '#8a7a5a'; g.beginPath(); g.moveTo(-26, -36); g.lineTo(-22, hy + 16); g.lineTo(22, hy + 16); g.lineTo(26, -36); g.closePath(); g.fill(); // 몸
  g.fillStyle = '#9a8a6a'; for (let y = hy + 20; y < -40; y += 8) for (let x = -20; x < 22; x += 8) { g.beginPath(); g.arc(x + ((y / 8) % 2) * 4, y, 3.6, 0, Math.PI); g.fill(); } // 비늘 갑옷
  g.fillStyle = '#c99872'; g.beginPath(); g.ellipse(hx, hy, 11, 13, 0, 0, 7); g.fill(); // 얼굴
  g.fillStyle = '#3a2a1a'; g.beginPath(); g.ellipse(hx, hy + 8, 10, 7, 0, 0, Math.PI); g.fill(); // 수염
  g.fillStyle = '#b8873a'; g.beginPath(); g.arc(hx, hy - 6, 13, Math.PI, 0); g.fill(); g.fillRect(hx - 13, hy - 7, 26, 4); // 놋 투구
  g.fillStyle = '#ffeec0'; g.globalAlpha = 0.35 + Math.sin(S.t * 6) * 0.15; g.beginPath(); g.arc(hx, hy - 1, 5, 0, 7); g.fill(); g.globalAlpha = 1; // 이마 — 희미하게 빛나는 과녁
  g.strokeStyle = '#5a4a2a'; g.lineWidth = 5; g.beginPath(); g.moveTo(30, 0); g.lineTo(26, hy - 50); g.stroke(); g.fillStyle = '#9aa0a6'; g.beginPath(); g.moveTo(22, hy - 50); g.lineTo(26, hy - 70); g.lineTo(30, hy - 50); g.fill(); // 창 (베틀채 같은 자루 — 17:7)
  g.restore();
}

/* ---------- 무너진 성벽 (수 6:1–20): 양각 나팔에 맞춰 여리고 돌기 — 박자 ---------- */
// 나팔 소리(음표)가 오른쪽에서 흘러와 왼쪽 표시선에 닿는 순간 누른다. 날마다 한 바퀴(박자 여섯), 일곱째 날은 일곱 바퀴를 몰아서 빠르게(6:3–4).
// 여섯 번 놓치면 행렬이 흐트러져 실패. 다 돌면 '외치라!' — 마구 눌러 함성을 채우면 성벽이 무너진다(6:20)
const LANE = 430, HITX = 70, NSPEED = 230, MISSMAX = 6, WIN = 0.15;
const jericho = {
  title: tr('무너진 성벽'), task: tr('나팔에 맞춰 일곱째 날까지 성 돌기'),
  ask: [tr('엿새 동안 날마다 이 성을 한 바퀴 돌고, 일곱째 날에는 일곱 바퀴를 돌라 하셨다.'), tr('제사장들의 양각 나팔 소리에 맞춰 걸어라 — 마지막엔 크게 외쳐라!')],
  quote: tr('일곱째 날에는 그 성을 일곱 번 돌며 제사장들은 나팔을 불 것이며'), ref: tr('수 6:4'),
  help: tr('나팔(음표)이 오른쪽에서 흘러와요. 왼쪽 원에 닿을 때 화면을 눌러요.<br>날이 갈수록 빨라져요. 여섯 번 놓치면 흐트러져요. 마지막에 "외치라!" — 마구 눌러요!'),
  seconds: 55,
  // 박자표 [박 수, 간격]: 날마다 여섯 박(1–6일은 0.85→0.6초 간격), 일곱째 날은 박자 열넷을 빠르게
  plan: [1, 2, 3, 4, 5, 6, 7].map(d => d < 7 ? [6, 0.9 - d * 0.05] : [14, 0.42]), art: ['m35/bg', 'm35/fallen', 'm35/priests', 'm35/ark', 'm35/people'],
  label: (S, d) => S.shoutOn ? tr('일곱째 날 — 외치라!') : tr('{0}일째{1}', d, d === 7 ? tr(' — 일곱 바퀴') : ''),
  shoutText: [tr('마구 눌러 크게 외쳐요!'), tr('성벽이 무너진다!')], hitFx: ['horn', 'step'], note: horn,
  missText: tr('나팔 소리에서 흐트러졌어요'),
  endLines: [tr('백성이 큰 소리로 외쳐 부를 때에'), tr('성벽이 무너져 내린지라'), tr('수 6:20')],
  init() {
    const notes = []; let t = 1.6;
    this.plan.forEach(([n, gap], i) => { for (let k = 0; k < n; k++) { notes.push({ t, day: i + 1, st: 0, last: i === this.plan.length - 1 }); t += gap; } t += 1.1; });
    return { notes, t: 0, miss: 0, hit: 0, combo: 0, msg: null, sparks: [], shout: 0, shoutOn: false, fall: 0, flash: 0, endT: t };
  },
  day(S) { const n = S.notes.find(n => !n.st); return n ? n.day : this.plan.length; },
  update(dt, S) {
    S.t += dt; S.flash = Math.max(0, S.flash - dt * 4);
    for (const n of S.notes) if (!n.st && S.t - n.t > WIN) { n.st = -1; S.miss++; S.combo = 0; S.msg = { t: tr('놓쳤어요'), c: '#ffb38a', at: 0.6, x: HITX + 40, y: LANE - 48 }; }
    if (!S.shoutOn && S.notes.every(n => n.st)) { S.shoutOn = true; S.msg = { t: this.shoutMsg || tr('외치라!'), c: '#ffe29a', at: 2, x: W / 2, y: 120 }; S.fx.play(this.hitFx[0]); }
    if (S.shoutOn && S.fall === 0) S.shout = Math.max(0, S.shout - dt * 0.22); // 쉬면 함성이 잦아든다
    if (S.fall) S.fall = Math.min(1, S.fall + dt * 0.7);
    for (const p of S.sparks) { p.y += p.vy * dt; p.life -= dt; } S.sparks = S.sparks.filter(p => p.life > 0);
    if (S.msg) S.msg.at -= dt;
  },
  down(x, y, S) {
    if (S.shoutOn) { if (!S.fall) { S.shout = Math.min(1, S.shout + 0.075); S.fx.play('shout'); if (S.shout >= 1) { S.fall = 0.001; S.fx.play(this.doneFx || 'collapse'); } } return; }
    const n = S.notes.filter(n => !n.st).sort((a, b) => Math.abs(a.t - S.t) - Math.abs(b.t - S.t))[0];
    if (!n || Math.abs(n.t - S.t) > WIN) return; // 음표 근처가 아니면 그냥 (헛누름은 벌하지 않는다)
    const d = Math.abs(n.t - S.t); n.st = 1; S.hit++; S.combo++; for (const f of this.hitFx) S.fx.play(f); S.flash = 1;
    S.msg = { t: d < 0.08 ? tr('딱 맞게!') : tr('좋아요'), c: d < 0.08 ? '#ffe29a' : '#e8f0d0', at: 0.5, x: HITX + 50, y: LANE - 44 };
    for (let i = 0; i < (d < 0.08 ? 8 : 4); i++) S.sparks.push({ x: HITX + rnd(-12, 12), y: LANE + rnd(-12, 12), vy: rnd(-50, -15), life: rnd(0.3, 0.6), r: rnd(1.2, 2.4) });
  },
  up() {},
  won: S => S.fall >= 1,
  lost: S => S.miss >= MISSMAX,
  failText(S) { return S.miss >= MISSMAX ? this.missText : tr('시간이 다 되었어요'); },
  draw(g, S) {
    if (this === jericho && art('m35/bg')) this.sceneArt(g, S); else this.scene(g, S);
    const day = this.day(S); g.save(); g.font = '800 16px "Noto Sans KR",sans-serif'; g.textAlign = 'left'; g.fillStyle = this.ink || '#3a2a14';
    g.fillText(this.label(S, day), 14, 28);
    g.font = '700 12px "Noto Sans KR",sans-serif'; g.globalAlpha = 0.8; g.fillText(tr('놓침 {0} / {1}', S.miss, MISSMAX), 14, 48); g.restore();
    this.lane(g, S);
  },
  sceneArt(g, S) { // 그림: 서 있는 성 → 무너진 성(S.fall로 겹쳐 바꿈), 앞 들판을 행렬이 지나간다(제사장의 나팔·법궤·백성)
    bgArt(g, 'm35/bg'); const f = S.fall; if (f > 0) { g.save(); g.globalAlpha = Math.min(1, f * 1.4); g.drawImage(art('m35/fallen'), 0, 0, W, H); g.restore(); }
    if (f > 0 && f < 1) { g.fillStyle = `rgba(210,180,130,${Math.sin(f * Math.PI) * 0.55})`; for (let i = 0; i < 12; i++) { g.beginPath(); g.arc(30 + i * 32, 250 - f * 40 - (i % 3) * 14, 26 + f * 30, 0, 7); g.fill(); } g.translate(Math.sin(S.t * 50) * 3 * (1 - f), 0); }
    const loop = 1100, u = (S.t * 34) % loop; let x = -380 + u;
    for (const [n, w] of [['m35/people', 170], ['m35/ark', 200], ['m35/priests', 170]]) { const k = art(n); if (k) { spr(g, n, x + w / 2, 396, 64); } x += w + 10; } // 앞에서부터: 나팔 → 법궤 → 백성(6:9)
  },
  scene(g, S) {
    const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#e8c48a'); sky.addColorStop(0.6, '#d9b27a'); sky.addColorStop(1, '#a8885a'); g.fillStyle = sky; g.fillRect(0, 0, W, H);
    // 여리고 성 (가운데) — 무너질 때 아래로 주저앉고 먼지
    const cx = 200, cy = 220, f = S.fall;
    g.fillStyle = '#b08a5a'; g.beginPath(); g.ellipse(cx, cy + 60, 150, 44, 0, 0, 7); g.fill(); // 언덕
    g.save(); g.beginPath(); g.rect(0, 0, W, cy + 70); g.clip(); g.translate(0, f * 90);
    g.fillStyle = '#c9a86e'; g.fillRect(cx - 110, cy - 30, 220, 80); g.fillStyle = '#b8945a';
    for (let x = cx - 110; x < cx + 110; x += 16) g.fillRect(x, cy - 40, 10, 12); // 성가퀴
    for (const tx of [cx - 110, cx + 90]) { g.fillStyle = '#b8945a'; g.fillRect(tx, cy - 60, 20, 110); for (let k = 0; k < 2; k++) g.fillRect(tx - 2 + k * 14, cy - 70, 8, 12); }
    g.fillStyle = '#6a4a2a'; g.beginPath(); g.moveTo(cx - 14, cy + 50); g.lineTo(cx - 14, cy + 20); g.arc(cx, cy + 20, 14, Math.PI, 0); g.lineTo(cx + 14, cy + 50); g.fill(); // 성문
    g.strokeStyle = 'rgba(90,60,30,.35)'; for (let y = cy - 24; y < cy + 50; y += 12) { g.beginPath(); g.moveTo(cx - 110, y); g.lineTo(cx + 110, y); g.stroke(); }
    g.restore();
    if (f > 0) { g.fillStyle = `rgba(200,170,120,${Math.sin(f * Math.PI) * 0.8})`; for (let i = 0; i < 14; i++) { g.beginPath(); g.arc(cx - 120 + i * 18, cy + 40 - f * 30 - (i % 3) * 10, 20 + f * 20, 0, 7); g.fill(); } }
    // 성을 도는 행렬(나팔 부는 제사장 셋·법궤·백성, 6:6–9) — 성 앞 길을 줄지어 지나간다
    for (let i = 0; i < 9; i++) { const u = (((S.t * 34 + i * 26) % 420) + 420) % 420, x = W + 10 - u, y = cy + 92 + Math.sin(x / 70) * 6, sc = 1.3;
      if (i === 3) { g.fillStyle = '#e0b850'; g.fillRect(x - 11 * sc, y - 14 * sc, 22 * sc, 9 * sc); g.fillStyle = '#5a3a1a'; g.fillRect(x - 14 * sc, y - 6 * sc, 28 * sc, 2 * sc); } // 법궤
      else { g.fillStyle = i < 3 ? '#f2ead8' : '#6e5a40'; g.beginPath(); g.ellipse(x, y - 8 * sc, 4.5 * sc, 9 * sc, 0, 0, 7); g.fill(); g.fillStyle = '#c99a6a'; g.beginPath(); g.arc(x, y - 19 * sc, 3.2 * sc, 0, 7); g.fill(); }
      }
  },
  lane(g, S) { // 나팔 길 (음표가 흘러온다)
    g.fillStyle = 'rgba(40,28,14,.55)'; g.fillRect(0, LANE - 30, W, 60);
    g.strokeStyle = S.flash ? `rgba(255,226,150,${0.5 + S.flash * 0.5})` : 'rgba(255,240,210,.6)'; g.lineWidth = 3; g.beginPath(); g.arc(HITX, LANE, 22 + S.flash * 4, 0, 7); g.stroke();
    if (!S.shoutOn) for (const n of S.notes) { if (n.st) continue; const x = HITX + (n.t - S.t) * NSPEED; if (x > W + 20 || x < HITX - 30) continue; this.note(g, x, LANE, n.last); }
    // 함성 막대
    if (S.shoutOn) { g.fillStyle = 'rgba(255,255,255,.2)'; g.fillRect(40, LANE - 10, W - 80, 20); g.fillStyle = '#ffd27a'; g.fillRect(40, LANE - 10, (W - 80) * S.shout, 20);
      g.font = '800 15px "Noto Sans KR",sans-serif'; g.textAlign = 'center'; g.fillStyle = '#fff'; g.fillText(this.shoutText[S.fall ? 1 : 0], W / 2, LANE - 18); }
    for (const p of S.sparks) { g.fillStyle = `rgba(255,236,170,${clamp(p.life, 0, 1)})`; star(g, p.x, p.y, p.r * 2.4); }
    floatMsg(g, S.msg);
  },
  end(g, k, S) { S.fall = Math.max(S.fall, 1); this.update(0.016, S); this.draw(g, S);
    if (k > 0.3) { g.save(); g.globalAlpha = clamp((k - 0.3) * 2, 0, 1); g.fillStyle = 'rgba(40,24,10,.8)'; g.fillRect(0, 300, W, 84);
      const [a, b, r] = this.endLines; g.font = '700 18px "Gowun Batang",serif'; g.textAlign = 'center'; g.fillStyle = '#fff0d6'; g.fillText(a, W / 2, 330); g.fillText(b, W / 2, 354);
      g.font = '600 11px "Noto Sans KR",sans-serif'; g.fillStyle = '#e6cfa6'; g.fillText(r, W / 2, 373); g.restore(); }
  },
};
function horn(g, x, y, fast) { // 양각 나팔 음표
  g.save(); g.translate(x, y); g.scale(1.6, 1.6); g.fillStyle = fast ? '#ffd27a' : '#e8d2a0'; g.strokeStyle = '#6a4a2a'; g.lineWidth = 1.5;
  g.beginPath(); g.moveTo(-14, 6); g.quadraticCurveTo(-4, -14, 14, -8); g.lineTo(14, -2); g.quadraticCurveTo(-2, -6, -10, 10); g.closePath(); g.fill(); g.stroke();
  g.restore();
}

/* ---------- 종려가지의 행렬 (요 12:12–13, 눅 19:37–40): 여리고 박자 놀이를 다시 씀 ---------- */
// 감람산 비탈을 내려가시는 나귀 앞에서 종려가지(음표)에 맞춰 흔든다. 네 구간, 갈수록 빨라짐. 끝은 '호산나!' — 마구 눌러 찬송을 채운다
const PALM_SEG = [tr('감람산 꼭대기'), tr('벳바게 비탈'), tr('길이 꺾이는 곳'), tr('성문 앞 — 호산나!')];
const palms = { ...jericho, title: tr('종려가지의 행렬'), task: tr('종려가지를 흔들며 성까지'),
  ask: [tr('오늘은 너도 저 무리 속에 서 보렴.'), tr('종려가지를 박자에 맞춰 흔들어라 — 성문 앞에서는 크게 호산나!')],
  quote: tr('종려나무 가지를 가지고 맞으러 나가 외치되 호산나 찬송하리로다'), ref: tr('요 12:13'),
  help: tr('종려가지(음표)가 오른쪽에서 흘러와요. 왼쪽 원에 닿을 때 눌러요.<br>길을 내려갈수록 빨라져요. 여섯 번 놓치면 흐트러져요. 마지막에 "호산나!" — 마구 눌러요!'),
  seconds: 36, art: ['e48/bg', 'e48/rider', 'e48/crowd-a', 'e48/crowd-b'], plan: [[6, 0.78], [8, 0.62], [10, 0.5], [12, 0.4]],
  label: (S, d) => S.shoutOn ? tr('호산나! 찬송하리로다') : PALM_SEG[d - 1],
  shoutMsg: tr('호산나!'), shoutText: [tr('마구 눌러 호산나!'), tr('찬송하리로다!')], hitFx: ['swish', 'step'], doneFx: 'shout', note: palmNote, ink: '#2a2a18',
  missText: tr('행렬의 박자가 흐트러졌어요'),
  endLines: [tr('찬송하리로다 주의 이름으로 오시는 왕이여'), tr('하늘에는 평화요 가장 높은 곳에는 영광이로다'), tr('눅 19:38')],
  scene(g, S) {
    if (art('e48/bg')) return this.sceneArt(g, S);
    const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#f3d9a4'); sky.addColorStop(0.55, '#e7c690'); sky.addColorStop(1, '#9c9a66'); g.fillStyle = sky; g.fillRect(0, 0, W, H);
    const f = S.fall, joy = S.shoutOn ? 0.4 + S.shout * 0.6 : 0;
    if (f) { g.save(); g.globalAlpha = Math.min(1, f) * 0.5; g.fillStyle = '#fff6d8'; for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * 0.22; g.beginPath(); g.moveTo(300, 120); g.lineTo(300 + Math.cos(a - 0.05) * 500, 120 + Math.sin(a - 0.05) * 500); g.lineTo(300 + Math.cos(a + 0.05) * 500, 120 + Math.sin(a + 0.05) * 500); g.fill(); } g.restore(); }
    // 건너편 예루살렘(오른쪽 위)과 성전
    g.fillStyle = '#c8ad7a'; g.beginPath(); g.moveTo(170, 190); g.lineTo(400, 150); g.lineTo(400, 230); g.lineTo(170, 230); g.fill();
    g.fillStyle = '#d9c08c'; g.fillRect(220, 150, 180, 44); g.fillStyle = '#c4a46e'; for (let x = 220; x < 400; x += 14) g.fillRect(x, 144, 8, 8);
    g.fillStyle = '#efe2c2'; g.fillRect(290, 112, 56, 40); g.fillStyle = '#e0b850'; g.fillRect(286, 108, 64, 6);
    // 감람산 비탈 길(왼쪽 위에서 오른쪽 아래로 꺾여 내려옴)
    g.fillStyle = '#8f9a5e'; g.beginPath(); g.moveTo(0, 210); g.quadraticCurveTo(200, 230, 400, 300); g.lineTo(400, H); g.lineTo(0, H); g.fill();
    g.strokeStyle = '#d8c39a'; g.lineWidth = 26; g.lineCap = 'round'; g.beginPath(); g.moveTo(-10, 250); g.quadraticCurveTo(150, 300, 420, 330); g.stroke();
    // 길에 편 겉옷들
    const cloth = ['#9a3d32', '#3d5a8a', '#c49a3a', '#6b4a7a', '#4f7a52'];
    for (let i = 0; i < 12; i++) { const u = i / 11, x = -10 + u * 430, y = 250 + (1 - (1 - u) * (1 - u)) * 80 - 4; g.fillStyle = cloth[i % 5]; g.save(); g.translate(x, y + 2); g.rotate(0.2 + u * 0.1); g.fillRect(-14, -5, 28, 10); g.restore(); }
    // 나귀 탄 분이 천천히 길을 내려가신다 (박자가 지날수록)
    const done = S.notes.filter(n => n.st).length / S.notes.length, u = 0.1 + done * 0.6, rx = -10 + u * 430, ry = 250 + (1 - (1 - u) * (1 - u)) * 80;
    g.save(); g.translate(rx, ry + 6); g.scale(1.8, 1.8); donkeyRider(g, S.t); g.restore();
    // 길가의 무리 — 두 줄, 종려가지를 흔든다 (맞힐 때마다 세게, 호산나 때는 더)
    for (let row = 0; row < 2; row++) for (let i = 0; i < 9; i++) {
      const x = 22 + i * 46 + (row ? 23 : 0), y = row ? 380 : 354, sc = row ? 1.1 : 0.92, k = row * 9 + i, sw = Math.sin(S.t * 5 + k * 1.3) * (0.18 + S.flash * 0.45 + joy * 0.5);
      g.save(); g.translate(x, y); g.scale(sc, sc);
      g.fillStyle = ['#7a5a3e', '#5a4a6a', '#9a6a3a', '#4a5a4a', '#8a4a3a'][k % 5]; g.beginPath(); g.moveTo(-10, 18); g.quadraticCurveTo(-11, -8, 0, -12); g.quadraticCurveTo(11, -8, 10, 18); g.fill();
      g.fillStyle = ['#e9dcc0', '#d8c8a8', '#c9b6d0'][k % 3]; g.beginPath(); g.arc(0, -19, 7.5, Math.PI * 0.9, Math.PI * 2.1); g.fill(); // 머릿수건
      g.fillStyle = '#c99a6a'; g.beginPath(); g.arc(0, -17, 5.5, 0, 7); g.fill();
      g.save(); g.translate(7, -8); g.rotate(-0.35 + sw); g.strokeStyle = '#c99a6a'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 6); g.lineTo(0, 0); g.stroke(); frond(g, 42); g.restore();
      g.restore(); }
  },
  sceneArt(g, S) { // 그림: 감람산 비탈 길(그림의 길을 따라 나귀가 내려가신다), 길가의 무리는 맞힐 때마다 가지를 흔든다
    bgArt(g, 'e48/bg'); const joy = S.shoutOn ? 0.5 + S.shout * 0.5 : 0, f = S.fall;
    if (f) { g.save(); g.globalAlpha = Math.min(1, f) * 0.45; g.fillStyle = '#fff6d8'; for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * 0.22; g.beginPath(); g.moveTo(330, 70); g.lineTo(330 + Math.cos(a - 0.05) * 500, 70 + Math.sin(a - 0.05) * 500); g.lineTo(330 + Math.cos(a + 0.05) * 500, 70 + Math.sin(a + 0.05) * 500); g.fill(); } g.restore(); }
    const P = [[52, 170], [80, 240], [140, 310], [220, 368], [300, 418]], done = S.notes.filter(n => n.st).length / S.notes.length, u = done * (P.length - 1) * 0.96, i0 = Math.floor(u), t = u - i0, a = P[i0], b = P[Math.min(P.length - 1, i0 + 1)];
    const rx = a[0] + (b[0] - a[0]) * t, ry = a[1] + (b[1] - a[1]) * t, bob = Math.sin(S.t * 7) * 1.2;
    spr(g, 'e48/rider', rx, ry + bob, 54 + (ry - 170) * 0.28);
    const sw = (k) => Math.sin(S.t * 5 + k) * (0.012 + S.flash * 0.03 + joy * 0.03);
    spr(g, 'e48/crowd-b', 336, 336 - S.flash * 3 - joy * 4 * Math.abs(Math.sin(S.t * 8)), 74, { rot: sw(1) });
    spr(g, 'e48/crowd-a', 86, 402 - S.flash * 4 - joy * 5 * Math.abs(Math.sin(S.t * 8 + 1)), 96, { rot: sw(2) });
  },
};
function donkeyRider(g, t) { // 나귀 새끼와 그 위의 분 (원점 = 발 아래)
  const b = Math.sin(t * 7) * 0.8;
  g.fillStyle = '#7d6a58'; for (const [lx, ph] of [[-9, 0], [-4, 2], [7, 1], [12, 3]]) { const sw = Math.sin(t * 7 + ph) * 2; g.fillRect(lx + sw * 0.4, -8, 2.6, 9); }
  g.beginPath(); g.ellipse(1, -12 + b, 14, 6.5, 0, 0, 7); g.fill();
  g.beginPath(); g.moveTo(11, -14 + b); g.quadraticCurveTo(16, -22 + b, 19, -22 + b); g.lineTo(21, -17 + b); g.quadraticCurveTo(16, -14 + b, 13, -9 + b); g.fill(); // 목과 머리
  g.fillStyle = '#6a5848'; g.beginPath(); g.ellipse(17, -25 + b, 1.4, 4, -0.3, 0, 7); g.fill(); g.beginPath(); g.ellipse(20, -25 + b, 1.4, 4, 0.2, 0, 7); g.fill(); // 귀
  g.fillStyle = '#5a7a9a'; g.fillRect(-5, -19 + b, 12, 4); // 안장 대신 편 겉옷
  g.fillStyle = '#f4efe2'; g.beginPath(); g.moveTo(-5, -15 + b); g.quadraticCurveTo(-6, -32 + b, 1, -34 + b); g.quadraticCurveTo(7, -32 + b, 6, -15 + b); g.fill();
  g.fillStyle = '#b5523e'; g.beginPath(); g.moveTo(-3, -32 + b); g.lineTo(1, -16 + b); g.lineTo(-1, -16 + b); g.lineTo(-5, -30 + b); g.fill(); // 붉은 겉옷 띠
  g.fillStyle = '#f4efe2'; g.fillRect(2, -16 + b, 3, 8); // 다리
  g.fillStyle = '#c99a6a'; g.beginPath(); g.arc(1, -38 + b, 3.6, 0, 7); g.fill(); g.fillStyle = '#5a3a24'; g.beginPath(); g.arc(0.4, -39 + b, 3.8, Math.PI * 0.95, Math.PI * 2.05); g.fill();
}
function frond(g, L) { // 종려가지 하나(위로)
  g.strokeStyle = '#4f7a32'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -L); g.stroke();
  g.strokeStyle = '#6fa046'; g.lineWidth = 1.2; for (let k = 4; k < L; k += 3.2) { const w = (1 - k / L) * 9 + 2; g.beginPath(); g.moveTo(0, -k); g.lineTo(-w, -k + 4); g.moveTo(0, -k); g.lineTo(w, -k + 4); g.stroke(); }
}
function palmNote(g, x, y, fast) { g.save(); g.translate(x, y + 18); g.rotate(0.25); g.scale(1.25, 1.25); frond(g, 30); if (fast) { g.fillStyle = 'rgba(255,226,150,.5)'; g.beginPath(); g.arc(0, -16, 15, 0, 7); g.fill(); } g.restore(); }

/* ---------- 별을 따라온 박사들 (마 2:1–10): 어제 없던 별 찾기 — 눈썰미·기억 ---------- */
// 밤하늘을 잠깐 보여 주고 구름이 지나간 뒤, 별 하나가 새로 떠 있다. 그 별을 누른다. 네 밤, 밤마다 별이 많아진다.
// 엉뚱한 데를 누르면 구름이 잠깐 덮어 시간을 잃는다. 오래 못 찾으면 새 별이 조금씩 반짝여 돕는다
const NIGHTS = 4, LOOK = [3.0, 2.8, 2.6, 2.4], CLOUD = 0.8;
const magi = {
  title: tr('별을 따라온 박사들'), task: tr('어제 없던 별 하나 찾기 — 네 밤'),
  ask: [tr('박사들은 밤마다 하늘을 살피던 사람들이었단다. 그러다 처음 보는 별 하나를 알아보았지.'), tr('너도 찾아보렴 — 하늘을 잘 봐 두었다가, 새로 뜬 별을!')],
  quote: tr('우리가 동방에서 그의 별을 보고 그에게 경배하러 왔노라'), ref: tr('마 2:2'),
  help: tr('밤하늘을 잠깐 보여 줘요 — 잘 봐 두세요.<br>구름이 지나간 뒤 새로 뜬 별 하나를 눌러요. 엉뚱한 곳을 누르면 구름이 덮어요. 네 밤.'),
  seconds: 44, art: ['e04/bg'],
  init() { const S = { dust: Array.from({ length: 160 }, () => ({ x: rnd(0, W), y: rnd(0, 340), a: rnd(0.08, 0.22) })), night: 0, ph: 'look', pt: 0, stars: [], nova: null, found: 0, msg: null, sparks: [], cover: 0, wrong: [], tw: 0 }; this.sky(S); return S; },
  sky(S) { // 밤마다 별을 새로 흩는다 — 서로 너무 붙지 않게
    const n = 14 + S.night * 6, st = [];
    const ok = (x, y) => st.every(s => Math.hypot(s.x - x, s.y - y) > 30);
    for (let k = 0; st.length < n + 1 && k < 4000; k++) { const x = rnd(24, 376), y = rnd(40, 280); if (ok(x, y)) st.push({ x, y, r: rnd(1.5, 3.0), ph: rnd(0, 7) }); }
    S.nova = st.pop(); S.nova.r = rnd(1.6, 2.3); S.stars = st; S.ph = 'look'; S.pt = 0; S.wrong = [];
  },
  update(dt, S) {
    S.pt += dt; S.tw += dt; S.cover = Math.max(0, S.cover - dt);
    if (S.ph === 'look' && S.pt > LOOK[S.night]) { S.ph = 'cloud'; S.pt = 0; S.fx.play('gust'); }
    else if (S.ph === 'cloud' && S.pt > CLOUD) { S.ph = 'find'; S.pt = 0; }
    else if (S.ph === 'got' && S.pt > 1.1) { S.found++; S.night++; if (S.night < NIGHTS) { this.sky(S); S.fx.play('go'); } }
    for (const p of S.sparks) { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; } S.sparks = S.sparks.filter(p => p.life > 0);
    if (S.msg) S.msg.at -= dt;
  },
  down(x, y, S) {
    if (S.ph !== 'find' || S.cover > 0) return;
    if (Math.hypot(x - S.nova.x, y - S.nova.y) < 24) {
      S.ph = 'got'; S.pt = 0; S.fx.play('glint'); S.fx.play('coin');
      S.msg = { t: S.night === NIGHTS - 1 ? tr('그의 별이다!') : tr('찾았어요!'), c: '#ffe29a', at: 0.9, x: S.nova.x, y: S.nova.y - 26 };
      for (let i = 0; i < 16; i++) { const a = rnd(0, 7), v = rnd(30, 90); S.sparks.push({ x: S.nova.x, y: S.nova.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rnd(0.4, 0.9), r: rnd(1, 2.2) }); }
    } else { S.cover = 1.0; S.wrong.push({ x, y }); S.fx.play('miss'); S.msg = { t: tr('그 별이 아니에요'), c: '#ffc2a0', at: 0.8, x, y: y - 20 }; }
  },
  up() {},
  won: S => S.found >= NIGHTS,
  failText: () => tr('새 별을 다 찾지 못했어요'),
  draw(g, S) {
    nightSky(g, S);
    const show = S.ph !== 'cloud';
    if (show) { for (const s of S.stars) skyStar(g, s, S.tw, 0); if (S.ph === 'find' || S.ph === 'got') skyStar(g, S.nova, S.tw, S.ph === 'got' ? 1 : clamp((S.pt - 7) / 6, 0, 0.5)); } // 7초가 지나면 새 별이 조금씩 반짝여 돕는다
    if (S.ph === 'got') { g.save(); g.globalAlpha = 0.5; g.strokeStyle = '#ffe29a'; g.lineWidth = 2; g.beginPath(); g.arc(S.nova.x, S.nova.y, 10 + S.pt * 20, 0, 7); g.stroke(); g.restore(); }
    for (const w of S.wrong) { g.strokeStyle = 'rgba(255,160,130,.5)'; g.lineWidth = 1.5; g.beginPath(); g.arc(w.x, w.y, 9, 0, 7); g.stroke(); }
    // 구름 — 밤이 바뀔 때, 또 잘못 누르면 잠깐
    const ck = S.ph === 'cloud' ? Math.sin(S.pt / CLOUD * Math.PI) : 0, cv = Math.max(ck, Math.min(1, S.cover * 1.6));
    if (cv > 0) { g.save(); g.globalAlpha = cv; g.fillStyle = '#2a2f52'; for (let i = 0; i < 9; i++) { g.beginPath(); g.ellipse((i * 61 + S.tw * 40) % 520 - 60, 60 + (i * 37) % 260, 90, 40, 0, 0, 7); g.fill(); } g.fillStyle = 'rgba(30,34,64,.85)'; g.fillRect(0, 20, W, 300); g.restore(); }
    // 땅과 박사들의 낙타 (아래)
    dunes(g);
    for (let i = 0; i < 3; i++) camel(g, 90 + i * 70 + S.found * 18, 384 + i * 6, 1 - i * 0.08);
    // 밤 표시
    g.save(); g.font = '800 15px "Noto Sans KR",sans-serif'; g.textAlign = 'left'; g.fillStyle = '#e9e2ff';
    g.fillText(tr('{0}째 밤', S.night + 1 > NIGHTS ? NIGHTS : S.night + 1), 14, 26);
    g.font = '700 12px "Noto Sans KR",sans-serif'; g.fillStyle = 'rgba(233,226,255,.75)';
    g.fillText(S.ph === 'look' ? tr('하늘을 잘 봐 두세요') : S.ph === 'cloud' ? tr('구름이 지나가요…') : S.ph === 'find' ? tr('새로 뜬 별 하나를 눌러요') : '', 14, 45);
    for (let i = 0; i < NIGHTS; i++) { g.fillStyle = i < S.found ? '#ffe29a' : 'rgba(255,255,255,.25)'; star(g, W - 20 - i * 22, 22, 7); }
    if (S.ph === 'look') { g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(14, 52, 120, 4); g.fillStyle = '#c9c2ff'; g.fillRect(14, 52, 120 * (1 - S.pt / LOOK[S.night]), 4); }
    g.restore();
    for (const p of S.sparks) { g.fillStyle = `rgba(255,236,170,${clamp(p.life, 0, 1)})`; star(g, p.x, p.y, p.r * 2.4); }
    floatMsg(g, S.msg);
  },
  end(g, k, S) { // 그 별이 앞서가 아기 있는 곳 위에 머문다(2:9)
    nightSky(g, S);
    for (const s of S.stars) skyStar(g, s, S.tw += 0.016, 0);
    const A = art('e04/bg'), hx = A ? 384 : 300, hy = A ? 366 : 362, sx = S.nova.x + (hx - S.nova.x) * k, sy = S.nova.y + ((A ? 230 : 150) - S.nova.y) * k; // 그림에서는 오른쪽 끝 작은 집 위로
    g.save(); g.globalAlpha = 0.25 * k; g.fillStyle = '#ffe9a8'; g.beginPath(); g.moveTo(sx, sy); g.lineTo(hx - 26, hy); g.lineTo(hx + 26, hy); g.fill(); g.restore();
    dunes(g);
    if (!A) { g.fillStyle = '#2a2236'; g.fillRect(276, 330, 48, 32); g.fillStyle = '#ffcf7a'; g.fillRect(294, 342, 12, 20); } // 작은 집, 불빛
    for (let i = 0; i < 3; i++) camel(g, 120 + i * 50 + k * 60, 384 + i * 6, 1 - i * 0.08);
    g.save(); g.shadowColor = '#ffe9a8'; g.shadowBlur = 24; g.fillStyle = '#fff4c8'; star(g, sx, sy, 10 + 3 * Math.sin(k * 12)); g.restore();
    if (k > 0.35) { g.save(); g.globalAlpha = clamp((k - 0.35) * 2, 0, 1); g.textAlign = 'center'; g.font = '700 17px "Gowun Batang",serif'; g.fillStyle = '#fff0d6';
      g.fillText(tr('그 별이 앞서 인도하여 가다가'), W / 2, 220); g.fillText(tr('아기 있는 곳 위에 머물러 서 있는지라'), W / 2, 246);
      g.font = '600 11px "Noto Sans KR",sans-serif'; g.fillStyle = '#d8cfa8'; g.fillText(tr('마 2:9'), W / 2, 266); g.restore(); }
  },
};
function nightSky(g, S) {
  if (bgArt(g, 'e04/bg')) { g.save(); g.translate(200, 170); g.rotate(-0.5); const mw = g.createLinearGradient(0, -60, 0, 60); mw.addColorStop(0, 'rgba(150,160,220,0)'); mw.addColorStop(0.5, 'rgba(150,160,220,.1)'); mw.addColorStop(1, 'rgba(150,160,220,0)'); g.fillStyle = mw; g.fillRect(-320, -60, 640, 120); g.restore();
    for (const d of S.dust) if (d.y < 290) { g.fillStyle = `rgba(220,225,255,${d.a})`; g.fillRect(d.x, d.y, 0.9, 0.9); } return; } // 짙은 밤 + 은하수 띠 + 아주 옅은 잔별(누를 별과 헷갈리지 않게 작고 흐리게)
  const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#070a24'); sky.addColorStop(0.55, '#16204a'); sky.addColorStop(0.75, '#2c2a52'); sky.addColorStop(1, '#4a3550'); g.fillStyle = sky; g.fillRect(0, 0, W, H);
  g.save(); g.translate(200, 190); g.rotate(-0.5); const mw = g.createLinearGradient(0, -60, 0, 60); mw.addColorStop(0, 'rgba(150,160,220,0)'); mw.addColorStop(0.5, 'rgba(150,160,220,.12)'); mw.addColorStop(1, 'rgba(150,160,220,0)'); g.fillStyle = mw; g.fillRect(-320, -60, 640, 120); g.restore();
  const hz = g.createRadialGradient(330, 360, 10, 330, 360, 220); hz.addColorStop(0, 'rgba(255,170,120,.18)'); hz.addColorStop(1, 'rgba(255,170,120,0)'); g.fillStyle = hz; g.fillRect(0, 160, W, 220);
  for (const d of S.dust) { g.fillStyle = `rgba(220,225,255,${d.a})`; g.fillRect(d.x, d.y, 0.9, 0.9); }
}
function dunes(g) {
  if (art('e04/bg')) return;
  g.fillStyle = '#231c33'; g.beginPath(); g.moveTo(0, 348); g.quadraticCurveTo(90, 326, 190, 342); g.quadraticCurveTo(300, 356, 400, 330); g.lineTo(400, H); g.lineTo(0, H); g.fill();
  g.fillStyle = '#16111f'; g.beginPath(); g.moveTo(0, 372); g.quadraticCurveTo(120, 344, 230, 366); g.quadraticCurveTo(320, 382, 400, 360); g.lineTo(400, H); g.lineTo(0, H); g.fill();
}
function skyStar(g, s, t, glow) {
  const tw = 0.75 + 0.25 * Math.sin(t * 2.2 + s.ph);
  if (glow) { g.save(); g.globalAlpha = glow; g.shadowColor = '#ffe9a8'; g.shadowBlur = 14; g.fillStyle = '#fff4c8'; star(g, s.x, s.y, s.r * 3.4); g.restore(); }
  g.fillStyle = `rgba(255,250,235,${tw})`; g.beginPath(); g.arc(s.x, s.y, s.r, 0, 7); g.fill();
  if (s.r > 2.4) { g.strokeStyle = `rgba(255,250,235,${tw * 0.35})`; g.lineWidth = 0.8; g.beginPath(); g.moveTo(s.x - s.r * 3, s.y); g.lineTo(s.x + s.r * 3, s.y); g.moveTo(s.x, s.y - s.r * 3); g.lineTo(s.x, s.y + s.r * 3); g.stroke(); } // 밝은 별은 십자 빛
}
function camel(g, x, y, s) { // 실루엣
  if (art('e04/bg')) return;
  g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#0e0b16';
  g.beginPath(); g.ellipse(0, -16, 18, 9, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(-2, -26, 8, 7, 0, 0, 7); g.fill();
  g.beginPath(); g.moveTo(14, -18); g.quadraticCurveTo(26, -26, 24, -36); g.lineTo(30, -36); g.lineTo(28, -30); g.quadraticCurveTo(28, -22, 18, -12); g.fill();
  for (const lx of [-12, -6, 8, 14]) g.fillRect(lx, -10, 3, 18);
  g.beginPath(); g.ellipse(-2, -36, 4, 6, 0, 0, 7); g.fill(); // 탄 사람
  g.restore();
}

/* ---------- 광주리에 담겨 성벽을 내려가다 (행 9:23–25, 고후 11:32–33): 숨죽여 내리기 — 때 맞추기 ---------- */
// 누르고 있으면 광주리가 내려가고(점점 빨라짐) 떼면 멈춘다. 성벽에 붙은 집의 창은 덧문이 열리며 불이 켜진다 — 켜지기 전에 깜박여 미리 알려 준다.
// 불빛이나 성 위 경비병의 횃불 빛 안에 머물면 '들킴'이 찬다. 다 차면 실패. 땅까지 내려가면 성공
const B_X = 200, B_TOP = 96, B_BOT = 438, WINS = [[176, 196], [222, 292], [180, 386]];
const wallBasket = {
  title: tr('광주리에 담겨 성벽을 내려가다'), task: tr('불빛을 피해 광주리를 땅까지'),
  ask: [tr('다메섹 성문마다 나를 잡으려는 자들이 밤낮으로 지켜 섰을 때, 제자들이 나를 광주리에 담아 성벽으로 달아 내렸단다.'), tr('이번엔 네가 줄을 잡아 보렴 — 창에 불이 켜질 때는 멈추고!')],
  quote: tr('나는 광주리를 타고 들창문으로 성벽을 내려가 그 손에서 벗어났노라'), ref: tr('고후 11:33'),
  help: tr('누르고 있으면 광주리가 내려가고, 떼면 멈춰요.<br>창이 깜박이면 곧 불이 켜져요 — 불빛과 위쪽 횃불 빛 안에 머물면 들켜요. 땅까지 내려가요.'),
  seconds: 10, art: ['a04/bg', 'a04/basket', 'a04/guard', 'a04/win-shut', 'a04/win-open'],
  init() {
    return { y: B_TOP, v: 0, hold: false, seen: 0, t: 0, msg: null, cr: 0, landed: 0,
      wins: WINS.map(([x, y], i) => ({ x, y, st: 'dark', at: rnd(0.8, 2.2) + i * 0.4, lit: 0 })),
      guards: [{ x: 60, dir: 1, sp: 34 }, { x: 330, dir: -1, sp: 28 }] };
  },
  // 이 자리가 지금 얼마나 밝은가(0–1): 창 불빛 + 횃불 빛
  light(S, y) {
    let L = 0;
    for (const w of S.wins) if (w.lit > 0) { const dx = Math.abs(B_X - w.x), dy = Math.abs(y - w.y); if (dx < 62 && dy < 30) L = Math.max(L, w.lit * (1 - Math.max(dx / 62, dy / 30) ** 2)); }
    for (const g of S.guards) { const d = y - 70, spread = 18 + d * 0.32, dx = Math.abs(B_X - g.x); if (d > 0 && d < 150 && dx < spread) L = Math.max(L, (1 - dx / spread) * (1 - d / 150)); }
    return L;
  },
  update(dt, S) {
    S.t += dt; if (S.msg) S.msg.at -= dt;
    if (S.landed) { S.landed += dt; return; }
    // 창: 어둠 → 깜박임(0.7초, 미리 알림) → 불(1.1–1.9초) → 어둠
    for (const w of S.wins) { w.at -= dt;
      if (w.at <= 0) { if (w.st === 'dark') { w.st = 'warn'; w.at = 0.7; } else if (w.st === 'warn') { w.st = 'lit'; w.at = rnd(1.1, 1.9); S.fx.play('creak'); } else { w.st = 'dark'; w.at = rnd(1.4, 3.0); } }
      w.lit += ((w.st === 'lit' ? 1 : 0) - w.lit) * Math.min(1, dt * 9); }
    for (const g of S.guards) { g.x += g.dir * g.sp * dt; if (g.x < 30 || g.x > 370) { g.dir *= -1; g.x = clamp(g.x, 30, 370); } }
    // 내리기: 누르는 동안 빨라지고, 떼면 곧 멈춘다(줄을 잡는다)
    S.v = S.hold ? Math.min(64, S.v + 130 * dt) : Math.max(0, S.v - 160 * dt);
    S.y = Math.min(B_BOT, S.y + S.v * dt);
    if (S.v > 6 && (S.cr -= dt) <= 0) { S.cr = 0.34 - S.v / 300; S.fx.play('creak'); }
    const L = this.light(S, S.y);
    if (L > 0.15) { S.seen = Math.min(1, S.seen + L * 0.95 * dt); if (!S.msg || S.msg.at < 0) S.msg = { t: tr('불빛 안이에요!'), c: '#ffc28a', at: 0.5, x: B_X + 70, y: S.y }; }
    else S.seen = Math.max(0, S.seen - 0.1 * dt); // 어둠 속에서는 의심이 조금씩 가라앉는다
    if (S.y >= B_BOT && !S.landed) { S.landed = 0.001; S.fx.play('drop'); }
  },
  down(x, y, S) { S.hold = true; },
  up(S) { S.hold = false; },
  key(k, S) { if (k === ' ' || k === 'ArrowDown') { S.hold = true; clearTimeout(S._kt); S._kt = setTimeout(() => S.hold = false, 140); return; } return false; },
  won: S => S.landed > 0,
  lost: S => S.seen >= 1,
  failText: S => S.seen >= 1 ? tr('경비병에게 들켰어요') : tr('날이 밝아 오고 있어요'),
  draw(g, S) {
    const A = art('a04/bg'); if (A) { g.drawImage(A, 108, 275, 583, 728, 0, 0, W, H); // 그림의 성벽을 경비병 발밑 아래로 잘라 그리고, 위에 밤하늘과 성가퀴를 얹는다
      const sk = g.createLinearGradient(0, 0, 0, 62); sk.addColorStop(0, '#070b1e'); sk.addColorStop(1, '#141a34'); g.fillStyle = sk; g.fillRect(0, 0, W, 62);
      g.fillStyle = 'rgba(230,235,255,.7)'; for (let i = 0; i < 22; i++) g.fillRect((i * 97) % 400, (i * 41) % 50, 1, 1); g.fillStyle = '#e8e4c8'; g.beginPath(); g.arc(350, 26, 9, 0, 7); g.fill(); g.fillStyle = '#070b1e'; g.beginPath(); g.arc(354, 23, 8, 0, 7); g.fill();
      g.fillStyle = '#2a2630'; for (let x = 0; x < W; x += 30) g.fillRect(x, 50, 20, 14); g.fillStyle = '#24202a'; g.fillRect(0, 62, W, 14); g.fillStyle = 'rgba(255,255,255,.06)'; g.fillRect(0, 62, W, 2); }
    if (!A) { const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#0a0f26'); sky.addColorStop(1, '#1c2238'); g.fillStyle = sky; g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(230,235,255,.6)'; for (let i = 0; i < 26; i++) g.fillRect((i * 97) % 400, (i * 53) % 60, 1, 1);
    g.fillStyle = '#e8e4c8'; g.beginPath(); g.arc(350, 30, 11, 0, 7); g.fill(); g.fillStyle = '#0a0f26'; g.beginPath(); g.arc(355, 27, 10, 0, 7); g.fill(); // 그믐달
    // 성벽 — 다듬은 돌을 엇갈려 쌓음
    g.fillStyle = '#3a3a48'; g.fillRect(0, 70, W, B_BOT - 50);
    for (let r = 0, y = 78; y < B_BOT + 20; r++, y += 22) for (let x = (r % 2) * 24 - 48; x < W; x += 48) { const h = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453 % 1; g.fillStyle = `rgba(${h > 0 ? '120,115,140' : '10,10,20'},${Math.abs(h) * 0.16})`; g.fillRect(x + 1, y + 1, 46, 20); } // 돌마다 조금씩 다른 빛
    g.strokeStyle = 'rgba(15,15,25,.6)'; g.lineWidth = 1.2;
    for (let r = 0, y = 78; y < B_BOT + 20; r++, y += 22) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); for (let x = (r % 2) * 24; x < W; x += 48) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 22); g.stroke(); } }
    g.fillStyle = '#2e2e3a'; for (let x = 0; x < W; x += 28) g.fillRect(x, 56, 18, 16); g.fillRect(0, 68, W, 8); } // 성가퀴
    // 경비병과 횃불 빛(성 위에서 아래로)
    for (const gd of S.guards) {
      const fl = 0.85 + 0.15 * Math.sin(S.t * 17 + gd.x);
      const cone = g.createLinearGradient(0, 70, 0, 220); cone.addColorStop(0, `rgba(255,170,80,${0.34 * fl})`); cone.addColorStop(1, 'rgba(255,170,80,0)');
      g.fillStyle = cone; g.beginPath(); g.moveTo(gd.x - 14, 70); g.lineTo(gd.x - 18 - 48, 220); g.lineTo(gd.x + 18 + 48, 220); g.lineTo(gd.x + 14, 70); g.fill();
      if (spr(g, 'a04/guard', gd.x, 74, 62, { flip: gd.dir < 0 })) continue;
      g.save(); g.translate(gd.x, 60); g.scale(1.45, 1.45); const st = Math.sin(S.t * 6 + gd.x) * 1.2;
      g.fillStyle = '#12121a'; g.fillRect(-4 + st, -8, 3, 8); g.fillRect(1 - st, -8, 3, 8); // 다리
      g.beginPath(); g.ellipse(0, -16, 6, 10, 0, 0, 7); g.fill(); g.beginPath(); g.arc(0, -29, 4.5, 0, 7); g.fill();
      g.beginPath(); g.moveTo(-6, -30); g.lineTo(0, -38); g.lineTo(6, -30); g.fill(); // 투구
      g.strokeStyle = '#12121a'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(-gd.dir * 8, 0); g.lineTo(-gd.dir * 8, -46); g.stroke(); g.beginPath(); g.moveTo(-gd.dir * 8 - 2, -44); g.lineTo(-gd.dir * 8, -50); g.lineTo(-gd.dir * 8 + 2, -44); g.fill(); // 창
      g.strokeStyle = '#3a2a1a'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(gd.dir * 5, -18); g.lineTo(gd.dir * 10, -24); g.stroke();
      g.shadowColor = '#ffb050'; g.shadowBlur = 10; g.fillStyle = `rgba(255,190,90,${fl})`; g.beginPath(); g.ellipse(gd.dir * 10, -29, 2.6, 5 * fl, 0, 0, 7); g.fill(); g.restore(); // 횃불
    }
    // 성벽에 붙은 집의 창
    for (const w of S.wins) {
      if (w.lit > 0.02) { const rg = g.createRadialGradient(w.x, w.y, 4, w.x, w.y, 70); rg.addColorStop(0, `rgba(255,190,110,${0.55 * w.lit})`); rg.addColorStop(1, 'rgba(255,190,110,0)'); g.fillStyle = rg; g.fillRect(w.x - 70, w.y - 70, 140, 140); }
      const blink = w.st === 'warn' && Math.sin(S.t * 30) > 0;
      if (art('a04/win-shut')) { spr(g, 'a04/win-shut', w.x, w.y + 18, 38, { a: 1 - w.lit }); spr(g, 'a04/win-open', w.x, w.y + 18, 38, { a: Math.max(w.lit, blink ? 0.45 : 0) }); continue; }
      g.fillStyle = w.lit > 0.3 ? '#ffd28a' : blink ? '#8a6a3a' : '#15151d'; g.fillRect(w.x - 11, w.y - 14, 22, 26);
      g.fillStyle = '#4a3a2a'; const o = w.lit * 10; g.fillRect(w.x - 15 - o, w.y - 15, 6, 28); g.fillRect(w.x + 9 + o, w.y - 15, 6, 28); // 덧문
      g.fillStyle = '#2a2a34'; g.fillRect(w.x - 16, w.y + 12, 32, 4);
    }
    // 들창문과 줄
    if (!A || !spr(g, 'a04/win-shut', B_X, 100, 26, { a: 0.9 })) { g.fillStyle = '#0c0c14'; g.fillRect(B_X - 13, 78, 26, 20); g.fillStyle = '#2a2a34'; g.fillRect(B_X - 16, 96, 32, 4); } // 들창문
    g.strokeStyle = '#a08a60'; g.lineWidth = 1.5; const sway = Math.sin(S.t * 2.2) * S.v * 0.05; g.beginPath(); g.moveTo(B_X, 92); g.quadraticCurveTo(B_X + sway, (92 + S.y) / 2, B_X + sway, S.y - 14); g.stroke();
    // 땅
    if (!A) { g.fillStyle = '#141a14'; g.fillRect(0, B_BOT + 14, W, H); g.fillStyle = '#1e2a1c'; for (let i = 0; i < 8; i++) { g.beginPath(); g.arc(20 + i * 54, B_BOT + 18, 14 + (i % 3) * 5, Math.PI, 0); g.fill(); } }
    // 광주리(바울이 웅크려 탔다)
    const bx = B_X + sway;
    { const L = this.light(S, S.y); if (L > 0.15) { g.strokeStyle = `rgba(255,120,80,${0.4 + 0.4 * Math.sin(S.t * 14)})`; g.lineWidth = 2; g.beginPath(); g.arc(bx, S.y, 32, 0, 7); g.stroke(); }
      if (spr(g, 'a04/basket', bx, S.y + 24, 58)) { /* 그림 광주리 */ } else {
    g.save(); g.translate(bx, S.y); g.scale(1.3, 1.3);
    if (L > 0.15) { g.strokeStyle = `rgba(255,120,80,${0.4 + 0.4 * Math.sin(S.t * 14)})`; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, 26, 0, 7); g.stroke(); }
    g.fillStyle = '#3a2c1e'; g.beginPath(); g.arc(0, -8, 7, 0, 7); g.fill(); // 웅크린 머리(겉옷을 뒤집어씀)
    g.fillStyle = '#8a6a3e'; g.beginPath(); g.moveTo(-17, -6); g.lineTo(17, -6); g.lineTo(13, 13); g.lineTo(-13, 13); g.closePath(); g.fill();
    g.strokeStyle = '#5e4628'; g.lineWidth = 1; for (let k = -4; k < 13; k += 4) { g.beginPath(); g.moveTo(-16 + (k + 6) * 0.2, k); g.lineTo(16 - (k + 6) * 0.2, k); g.stroke(); }
    for (let k = -12; k <= 12; k += 6) { g.beginPath(); g.moveTo(k, -6); g.lineTo(k * 0.8, 13); g.stroke(); }
    g.strokeStyle = '#a08a60'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-15, -6); g.lineTo(0, -14); g.lineTo(15, -6); g.stroke();
    g.restore(); } }
    // 들킴 표시와 남은 높이
    g.save(); g.font = '800 13px "Noto Sans KR",sans-serif'; g.textAlign = 'left'; g.fillStyle = '#e8e4f4'; g.fillText(tr('들킴'), 14, 100);
    g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(50, 90, 90, 12); g.fillStyle = S.seen > 0.66 ? '#ff7a5a' : '#ffb36a'; g.fillRect(50, 90, 90 * S.seen, 12);
    g.textAlign = 'right'; g.fillStyle = '#c9c4dc'; g.fillText(`${Math.max(0, Math.round((B_BOT - S.y) / 34))}m`, W - 14, 100); g.restore();
    floatMsg(g, S.msg);
  },
  end(g, k, S) { // 땅에 내려 어둠 속으로 — 행 9:25
    S.v = 0; this.update(0.016, S); this.draw(g, S);
    g.fillStyle = '#1a1410'; const px = B_X + 24 + k * 150; g.beginPath(); g.ellipse(px, B_BOT + 4, 6, 13, 0, 0, 7); g.fill(); g.beginPath(); g.arc(px, B_BOT - 13, 5, 0, 7); g.fill();
    if (k > 0.3) { g.save(); g.globalAlpha = clamp((k - 0.3) * 2, 0, 1); g.fillStyle = 'rgba(10,10,20,.82)'; g.fillRect(0, 230, W, 84);
      g.font = '700 17px "Gowun Batang",serif'; g.textAlign = 'center'; g.fillStyle = '#f0ecff'; g.fillText(tr('그의 제자들이 밤에 광주리에 바울을 담아'), W / 2, 260); g.fillText(tr('성벽에서 달아 내리니라'), W / 2, 284);
      g.font = '600 11px "Noto Sans KR",sans-serif'; g.fillStyle = '#bdb6d8'; g.fillText(tr('행 9:25'), W / 2, 303); g.restore(); }
  },
};

/* ---------- 갈멜산의 불 (왕상 18:30–38): 열두 돌로 제단 쌓기 — 때 맞춰 떨어뜨리기 ---------- */
// 지파 이름이 새겨진 돌이 좌우로 오가면 눌러 떨어뜨린다. 아래 돌에서 삐져나온 만큼은 깎여 떨어지고 돌이 좁아진다.
// 딱 맞게 놓으면(4px 안) 조금 넓어진다. 아예 빗나가면 돌 하나를 잃는다(셋까지). 열둘을 쌓으면 물을 붓고 하늘에서 불이 내린다
const SONS = [tr('르우벤'), tr('시므온'), tr('레위'), tr('유다'), tr('단'), tr('납달리'), tr('갓'), tr('아셀'), tr('잇사갈'), tr('스불론'), tr('요셉'), tr('베냐민')];
const ALT_Y = 440, ST_H = 24, ALT_W = 150, PERFECT = 4;
const carmel = {
  title: tr('갈멜산의 불'), task: tr('열두 돌로 여호와의 제단 쌓기'),
  ask: [tr('무너진 여호와의 제단을, 야곱의 아들들의 지파 수대로 돌 열두 개를 취해 다시 쌓았단다.'), tr('네가 쌓아 보렴 — 돌이 오갈 때 아래 돌 위에 꼭 맞게 내려놓아라!')],
  quote: tr('야곱의 아들들의 지파의 수효를 따라 엘리야가 돌 열두 개를 취하니'), ref: tr('왕상 18:31'),
  help: tr('돌이 좌우로 오가요. 아래 돌과 겹칠 때 눌러 떨어뜨려요.<br>삐져나온 만큼 깎여 좁아져요. 딱 맞게 놓으면 조금 넓어져요. 빗나가면 돌을 잃어요(셋까지).'),
  seconds: 40, art: ['k15/bg', 'k15/elijah', 'k15/elijah-up', 'e23/block'],
  init() { return { tower: [{ x: 200, w: ALT_W }], cur: null, chips: [], lives: 3, msg: null, sparks: [], t: 0, cam: 0, flash: 0, next: 0.4, done: 0 }; },
  spawn(S) { const n = S.tower.length - 1, top = S.tower[S.tower.length - 1], sp = 135 + n * 14;
    S.cur = { x: Math.random() < 0.5 ? 40 : 360, w: top.w, dir: 1, sp, y: null, vy: 0, name: SONS[n] }; S.cur.dir = S.cur.x < 200 ? 1 : -1; },
  topY: S => ALT_Y - (S.tower.length - 1) * ST_H,
  update(dt, S) {
    S.t += dt; S.flash = Math.max(0, S.flash - dt * 3); if (S.msg) S.msg.at -= dt;
    const want = Math.max(0, (S.tower.length - 1) * ST_H - 200); S.cam += (want - S.cam) * Math.min(1, dt * 4); // 높아지면 화면을 내린다
    if (!S.cur && S.tower.length <= 12) { if ((S.next -= dt) <= 0) this.spawn(S); }
    const c = S.cur;
    if (c && c.y === null) { c.x += c.dir * c.sp * dt; const hw = c.w / 2; if (c.x < hw + 6 || c.x > W - hw - 6) { c.dir *= -1; c.x = clamp(c.x, hw + 6, W - hw - 6); } }
    else if (c) { c.vy += 1400 * dt; c.y += c.vy * dt; const ty = this.topY(S) - ST_H;
      if (c.y >= ty) { c.y = ty; this.land(S); } }
    for (const p of S.chips) { p.vy += 900 * dt; p.y += p.vy * dt; p.x += p.vx * dt; p.r += p.vr * dt; } S.chips = S.chips.filter(p => p.y < H + 60 + S.cam);
    for (const p of S.sparks) { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; } S.sparks = S.sparks.filter(p => p.life > 0);
  },
  land(S) {
    const c = S.cur, top = S.tower[S.tower.length - 1], dx = c.x - top.x, ov = c.w - Math.abs(dx), y = this.topY(S) - ST_H;
    S.cur = null; S.next = 0.35;
    if (ov <= 0) { // 빗나감 — 돌이 굴러떨어진다
      S.lives--; S.chips.push({ x: c.x, y, w: c.w, vx: dx > 0 ? 90 : -90, vy: -60, r: 0, vr: dx > 0 ? 3 : -3, name: c.name }); S.fx.play('miss');
      S.msg = { t: S.lives > 0 ? tr('돌이 굴러떨어졌어요 (남은 {0})', S.lives) : tr('돌이 다 떨어졌어요'), c: '#ffb38a', at: 1.3, x: 200, y: y - 70 + S.cam }; return;
    }
    if (Math.abs(dx) <= PERFECT) { // 딱 맞게 — 조금 넓어진다
      const w = Math.min(ALT_W, top.w + 6); S.tower.push({ x: top.x, w, name: c.name, perfect: 1 }); S.fx.play('thud'); S.fx.play('glint'); S.flash = 1;
      S.msg = { t: tr('딱 맞게!'), c: '#ffe29a', at: 0.7, x: top.x, y: y - 20 + S.cam };
      for (let i = 0; i < 12; i++) S.sparks.push({ x: top.x + rnd(-w / 2, w / 2), y: y + ST_H, vx: rnd(-40, 40), vy: rnd(-60, -10), life: rnd(0.3, 0.7) });
    } else {
      const L = Math.max(c.x - c.w / 2, top.x - top.w / 2), R = Math.min(c.x + c.w / 2, top.x + top.w / 2);
      S.tower.push({ x: (L + R) / 2, w: R - L, name: c.name }); S.fx.play('thud');
      const cw = c.w - (R - L), cx = dx > 0 ? R + cw / 2 : L - cw / 2; // 깎여 나간 조각
      S.chips.push({ x: cx, y, w: cw, vx: dx > 0 ? 50 : -50, vy: -30, r: 0, vr: dx > 0 ? 2 : -2 });
      if (R - L < 26) S.msg = { t: tr('좁아졌어요 — 조심!'), c: '#ffd0a0', at: 0.9, x: 200, y: y - 70 + S.cam };
    }
    if (S.tower.length > 12) { S.done = 1; S.fx.play('go'); }
  },
  down(x, y, S) { const c = S.cur; if (c && c.y === null) { c.y = this.topY(S) - ST_H - 110 - 0; c.vy = 0; c.y = Math.min(c.y, this.hangY(S)); } },
  hangY(S) { return this.topY(S) - ST_H - 110; },
  up() {},
  key(k, S) { if (k === ' ' || k === 'ArrowDown') { this.down(0, 0, S); return; } return false; },
  won: S => S.done > 0,
  lost: S => S.lives <= 0,
  failText: S => S.lives <= 0 ? tr('돌이 다 굴러떨어졌어요') : tr('해가 저물었어요'),
  scene(g, S, fire) {
    const A = art('k15/bg');
    if (A) { g.drawImage(A, 0, S.cam * 0.5 - 30, W, H + 30); } else {
    const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#5a6a9a'); sky.addColorStop(0.5, '#e0a070'); sky.addColorStop(1, '#a86a48'); g.fillStyle = sky; g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(255,230,180,.5)'; g.beginPath(); g.arc(70, 150 + S.cam * 0.2, 26, 0, 7); g.fill(); // 저녁 해 (18:36 저녁 소제 드릴 때)
    g.fillStyle = '#6a5a4a'; g.beginPath(); g.moveTo(0, 300 + S.cam * 0.4); g.quadraticCurveTo(140, 250 + S.cam * 0.4, 260, 290 + S.cam * 0.4); g.quadraticCurveTo(340, 310 + S.cam * 0.4, 400, 280 + S.cam * 0.4); g.lineTo(400, H); g.lineTo(0, H); g.fill(); // 먼 능선
    }
    g.save(); g.translate(0, S.cam);
    if (!A) { g.fillStyle = '#7a6448'; g.fillRect(0, ALT_Y + 4, W, 200); } else { g.fillStyle = 'rgba(70,52,34,.85)'; g.fillRect(0, ALT_Y + 4, W, 200); } // 산마루
    // 바알 선지자들의 제단(왼쪽, 아무 대답 없이 지쳐 있다)과 백성(오른쪽)
    if (!A) { g.fillStyle = '#5a4a3a'; g.fillRect(14, ALT_Y - 30, 46, 34); g.fillStyle = '#3a2e24'; for (let i = 0; i < 5; i++) { g.beginPath(); g.ellipse(20 + i * 10, ALT_Y + 18, 4, 9, 0, 0, 7); g.fill(); }
    for (let i = 0; i < 6; i++) { g.fillStyle = ['#6a5040', '#5a5060', '#7a6040'][i % 3]; g.beginPath(); g.ellipse(334 + i * 11, ALT_Y + 10 + (i % 2) * 6, 5, 11, 0, 0, 7); g.fill(); g.fillStyle = '#b08a64'; g.beginPath(); g.arc(334 + i * 11, ALT_Y - 4 + (i % 2) * 6, 4, 0, 7); g.fill(); } }
    const pr = fire ? clamp(fire.pray, 0, 1) : 0; if (!(spr(g, 'k15/elijah', 330, ALT_Y + 8, 96, { a: 1 - pr }) & spr(g, 'k15/elijah-up', 330, ALT_Y + 8, 100, { a: pr }))) elijah(g, 318, ALT_Y + 2, pr); // 제단 곁의 엘리야 (불이 내릴 때 두 팔을 든다)
    // 도랑(제단 둘레)
    g.fillStyle = '#4a3a2c'; g.fillRect(200 - ALT_W / 2 - 22, ALT_Y + 2, ALT_W + 44, 10);
    if (fire && fire.water > 0) { g.fillStyle = `rgba(120,170,210,${0.8 * fire.water})`; g.fillRect(200 - ALT_W / 2 - 20, ALT_Y + 4, ALT_W + 40, 7); }
    // 쌓은 돌
    S.tower.forEach((b, i) => { if (i === 0) { g.fillStyle = '#6a5440'; g.fillRect(b.x - b.w / 2, ALT_Y - 0, b.w, 6); return; }
      altarStone(g, b.x, ALT_Y - i * ST_H, b.w, b.name, b.perfect && S.flash && i === S.tower.length - 1 ? S.flash : 0, fire && fire.wet, fire && fire.burnt); });
    for (const p of S.chips) { g.save(); g.translate(p.x, p.y + ST_H / 2); g.rotate(p.r); altarStone(g, 0, ST_H / 2, p.w, p.name || '', 0); g.restore(); }
    for (const p of S.sparks) { g.fillStyle = `rgba(255,236,170,${clamp(p.life * 2, 0, 1)})`; g.fillRect(p.x, p.y, 2, 2); }
    g.restore();
  },
  draw(g, S) {
    this.scene(g, S);
    const c = S.cur;
    if (c) { const y = (c.y === null ? this.hangY(S) : c.y) + S.cam;
      if (c.y === null) { const top = S.tower[S.tower.length - 1]; g.save(); g.setLineDash([4, 5]); g.strokeStyle = 'rgba(255,240,210,.35)'; g.beginPath(); g.moveTo(c.x - c.w / 2, y + ST_H); g.lineTo(c.x - c.w / 2, this.topY(S) - ST_H + S.cam); g.moveTo(c.x + c.w / 2, y + ST_H); g.lineTo(c.x + c.w / 2, this.topY(S) - ST_H + S.cam); g.stroke(); g.restore(); }
      if (c.y === null) { g.strokeStyle = 'rgba(90,64,40,.85)'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(c.x - c.w / 2 + 8, y + 2); g.lineTo(c.x - 4, y - 40); g.lineTo(c.x + c.w / 2 - 8, y + 2); g.moveTo(c.x, y - 40); g.lineTo(c.x, -10); g.stroke(); } // 밧줄에 매달아 내린다
      altarStone(g, c.x, y + ST_H, c.w, c.name, 0); }
    g.save(); g.font = '800 15px "Noto Sans KR",sans-serif'; g.textAlign = 'left'; g.fillStyle = '#2a1e14';
    g.fillText(tr('돌 {0} / 12', Math.min(12, S.tower.length - 1)), 14, 26);
    for (let i = 0; i < 3; i++) { g.fillStyle = i < S.lives ? '#d9c8a0' : 'rgba(0,0,0,.2)'; rrect(g, W - 30 - i * 24, 14, 18, 12, 3); g.fill(); }
    g.restore();
    floatMsg(g, S.msg);
  },
  end(g, k, S) { // 물을 붓고(18:33–35) 하늘에서 불이 내려 돌과 흙까지 태우고 도랑의 물을 핥는다(18:38)
    const h = (S.tower.length - 1) * ST_H; S.cam += (Math.max(0, h - 300) - S.cam) * 0.08; // 제단 전체와 도랑이 보이게
    const pourK = clamp(k / 0.35, 0, 1), fireK = clamp((k - 0.38) / 0.3, 0, 1), after = clamp((k - 0.68) / 0.3, 0, 1);
    const water = pourK * (1 - fireK);
    if (k > 0.02 && !S.pourSnd) { S.pourSnd = 1; S.fx.play('splash'); } if (fireK > 0 && !S.fireSnd) { S.fireSnd = 1; S.fx.play('fire'); }
    this.update(0.016, S); this.scene(g, S, { water, wet: water, burnt: fireK, pray: clamp(k * 4, 0, 1) });
    const topY = this.topY(S) + S.cam, baseY = ALT_Y + S.cam, x0 = 200 - ALT_W / 2;
    if (pourK < 1 && fireK === 0) for (let i = 0; i < 4; i++) { // 네 통의 물을 세 번(18:34)
      const x = x0 + 22 + i * 36, a = 0.75; g.fillStyle = `rgba(150,195,235,${a})`; g.beginPath(); g.moveTo(x - 3, topY - 70); g.quadraticCurveTo(x + 8, topY - 30, x + 2, topY); g.lineTo(x + 7, topY); g.quadraticCurveTo(x + 12, topY - 30, x + 4, topY - 70); g.fill();
      g.fillStyle = '#8a6a4a'; g.beginPath(); g.ellipse(x - 2, topY - 76, 10, 8, -0.6, 0, 7); g.fill();
      for (let d = 0; d < 4; d++) { g.fillStyle = 'rgba(170,210,240,.8)'; g.beginPath(); g.arc(x + rnd(-14, 18), topY + rnd(-8, 2), rnd(1, 2.2), 0, 7); g.fill(); } }
    if (fireK > 0) {
      g.save(); g.globalCompositeOperation = 'lighter';
      const beam = g.createLinearGradient(0, 0, 0, baseY); beam.addColorStop(0, 'rgba(255,240,200,0)'); beam.addColorStop(1, `rgba(255,190,110,${0.55 * fireK * (1 - after * 0.7)})`);
      g.fillStyle = beam; g.beginPath(); g.moveTo(170, 0); g.lineTo(230, 0); g.lineTo(x0 + ALT_W + 30, baseY); g.lineTo(x0 - 30, baseY); g.fill(); // 하늘에서 내리는 불기둥
      const glow = g.createRadialGradient(200, (topY + baseY) / 2, 10, 200, (topY + baseY) / 2, 200); glow.addColorStop(0, `rgba(255,170,80,${0.45 * fireK})`); glow.addColorStop(1, 'rgba(255,120,40,0)'); g.fillStyle = glow; g.fillRect(0, 0, W, H);
      const reach = topY + (baseY + 12 - topY) * Math.min(1, fireK * 1.4); // 위에서부터 아래로 번져 도랑까지
      const hash = n => { const v = Math.sin(n) * 43758.5453; return v - Math.floor(v); };
      for (let i = 0; i < 64; i++) { const fy = topY + hash(i * 78.233) * (baseY + 10 - topY); if (fy > reach) continue;
        const row = clamp(Math.floor((ALT_Y + S.cam - fy) / ST_H) + 1, 1, S.tower.length - 1), b = S.tower[row] || S.tower[1], fx = fy > baseY - 2 ? x0 - 20 + hash(i * 12.99) * (ALT_W + 40) : b.x + (hash(i * 12.99) - 0.5) * (b.w + 16); // 돌 위·도랑
        const fh = (24 + hash(i * 3.7) * 34) * (0.8 + 0.3 * Math.sin(k * 60 + i * 2.1)) * (1 - after * 0.6); flame(g, fx, fy, fh, 8 + hash(i * 5.1) * 6); }
      g.restore();
    }
    if (after > 0) for (let i = 0; i < 8; i++) { const r = 18 + i * 6, y = topY - 30 - i * 24 * after, sg = g.createRadialGradient(200, y, 2, 200, y, r); sg.addColorStop(0, `rgba(90,80,70,${0.22 * after})`); sg.addColorStop(1, 'rgba(90,80,70,0)'); g.fillStyle = sg; g.fillRect(200 - r, y - r, r * 2, r * 2); } // 연기
    if (k > 0.6) { g.save(); g.globalAlpha = clamp((k - 0.6) * 3, 0, 1); g.fillStyle = 'rgba(30,16,8,.82)'; g.fillRect(0, 22, W, 92);
      g.font = '700 16px "Gowun Batang",serif'; g.textAlign = 'center'; g.fillStyle = '#fff0d6'; g.fillText(tr('이에 여호와의 불이 내려서 번제물과 나무와'), W / 2, 52); g.fillText(tr('돌과 흙을 태우고 또 도랑의 물을 핥은지라'), W / 2, 76);
      g.font = '600 11px "Noto Sans KR",sans-serif'; g.fillStyle = '#e6cfa6'; g.fillText(tr('왕상 18:38'), W / 2, 98); g.restore(); }
  },
};
function flame(g, x, y, h, w) { // 불꽃 혀 하나 — 노란 속불에서 붉은 겉불로
  const gr = g.createLinearGradient(0, y, 0, y - h); gr.addColorStop(0, 'rgba(255,210,120,.55)'); gr.addColorStop(0.45, 'rgba(255,120,30,.45)'); gr.addColorStop(1, 'rgba(200,40,10,0)');
  g.fillStyle = gr; g.beginPath(); g.moveTo(x - w, y); g.bezierCurveTo(x - w, y - h * 0.45, x - w * 0.2, y - h * 0.6, x + w * 0.15, y - h); g.bezierCurveTo(x + w * 0.4, y - h * 0.55, x + w, y - h * 0.4, x + w, y); g.closePath(); g.fill();
}
function elijah(g, x, y, pray) { // 털옷에 가죽 띠(왕하 1:8)
  g.save(); g.translate(x, y); g.scale(1.5, 1.5);
  g.fillStyle = '#6a4e32'; g.beginPath(); g.moveTo(-8, 0); g.quadraticCurveTo(-9, -22, 0, -26); g.quadraticCurveTo(9, -22, 8, 0); g.fill();
  g.fillStyle = '#3a2a1a'; g.fillRect(-8, -12, 16, 2.5);
  g.strokeStyle = '#6a4e32'; g.lineWidth = 3.5; g.lineCap = 'round'; const th = 0.25 + pray * 2.4; // 팔: 아래로 → 하늘을 향해
  for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(sd * 5, -22); g.lineTo(sd * (5 + Math.sin(th) * 12), -22 + Math.cos(th) * 12); g.stroke(); }
  g.fillStyle = '#c99a6a'; g.beginPath(); g.arc(0, -31, 5, 0, 7); g.fill();
  g.fillStyle = '#e8e2d4'; g.beginPath(); g.moveTo(-4.5, -29); g.quadraticCurveTo(0, -20, 4.5, -29); g.fill(); // 흰 수염
  g.fillStyle = '#e8e2d4'; g.beginPath(); g.arc(0, -33, 5.2, Math.PI, 0); g.fill();
  g.restore();
}
function altarStone(g, x, yb, w, name, glow, wet, burnt) { // yb = 돌 아랫면
  const y = yb - ST_H, B = art('e23/block');
  if (B) { g.save(); rrect(g, x - w / 2, y + 1, w, ST_H - 2, 4); g.clip(); g.drawImage(B, 10, 60, B.width - 20, 60, x - w / 2, y + 1, w, ST_H - 2);
    if (wet || burnt) { g.fillStyle = burnt ? `rgba(30,20,12,${0.65 * burnt})` : `rgba(40,60,80,${0.35 * wet})`; g.fillRect(x - w / 2, y, w, ST_H); } g.restore();
    g.strokeStyle = 'rgba(60,40,20,.6)'; g.lineWidth = 1; rrect(g, x - w / 2, y + 1, w, ST_H - 2, 4); g.stroke();
    if (glow) { g.strokeStyle = `rgba(255,226,150,${glow})`; g.lineWidth = 2.5; rrect(g, x - w / 2 - 2, y - 1, w + 4, ST_H + 2, 5); g.stroke(); }
    if (name && w > 34) { g.font = `700 ${w > 60 ? 12 : 10}px "Noto Sans KR",sans-serif`; g.textAlign = 'center'; g.fillStyle = burnt ? 'rgba(255,220,180,.7)' : 'rgba(60,40,20,.8)'; g.fillText(name, x, y + ST_H / 2 + 4); }
    return; }
  g.fillStyle = burnt ? `rgb(${184 - 110 * burnt},${162 - 110 * burnt},${126 - 90 * burnt})` : wet ? `rgb(${184 - 62 * wet},${162 - 46 * wet},${126 - 22 * wet})` : '#b8a27e'; rrect(g, x - w / 2, y + 1, w, ST_H - 2, 4); g.fill();
  g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(x - w / 2 + 3, y + 3, w - 6, 4);
  g.strokeStyle = 'rgba(60,40,20,.55)'; g.lineWidth = 1; rrect(g, x - w / 2, y + 1, w, ST_H - 2, 4); g.stroke();
  if (glow) { g.strokeStyle = `rgba(255,226,150,${glow})`; g.lineWidth = 2.5; rrect(g, x - w / 2 - 2, y - 1, w + 4, ST_H + 2, 5); g.stroke(); }
  if (name && w > 34) { g.font = `700 ${w > 60 ? 12 : 10}px "Noto Sans KR",sans-serif`; g.textAlign = 'center'; g.fillStyle = 'rgba(60,40,20,.75)'; g.fillText(name, x, y + ST_H / 2 + 4); }
}

/* ---------- 들어 올린 두 손 (출 17:8–13): 모세의 두 팔 받치기 — 균형·때 맞추기 ---------- */
// 화면 왼쪽을 누르면 아론이 왼팔을, 오른쪽을 누르면 훌이 오른팔을 받쳐 올린다. 팔은 점점 무거워져 처진다(때로 한쪽이 덜컥).
// 이미 높이 든 팔을 또 밀면 흔들려 내려간다 — 때를 맞춰야 한다. 두 팔이 다 올라가 있으면 이스라엘이, 하나라도 처지면 아말렉이 밀고 온다.
// 반쯤 이기면 돌을 가져다 모세를 앉힌다(17:12 — 덜 처진다). 싸움 막대가 끝까지 차면 이긴다
// 처지는 빠르기는 마우스에 맞췄다 — 커서 하나로 좌우를 오가니 터치보다 0.3초쯤 늦다(사용자 2026-11)
const ARM_UP = 0.55, ARM_LOW = 0.38;
const hands = {
  title: tr('들어 올린 두 손'), task: tr('모세의 두 팔을 해 지기까지'),
  ask: [tr('내 팔이 너무 무거웠단다. 아론과 훌이 양쪽에서 붙들어 주지 않았다면 견디지 못했을 거야.'), tr('이번엔 네가 붙들어 다오 — 팔이 처지기 전에, 너무 세게는 말고!')],
  quote: tr('모세가 손을 들면 이스라엘이 이기고 손을 내리면 아말렉이 이기더니'), ref: tr('출 17:11'),
  help: tr('왼쪽을 누르면 왼팔, 오른쪽을 누르면 오른팔을 받쳐 올려요.<br>팔이 높이 있을 때 또 밀면 흔들려 내려가요. 두 팔이 다 올라가 있어야 이스라엘이 이겨요.'),
  art: ['m14/bg', 'm14/moses-up', 'm14/moses-mid', 'm14/moses-down', 'm14/aaron', 'm14/hur', 'm14/israel', 'm14/amalek'],
  seconds: 36,
  init() { return { arms: [{ a: 0.8, v: 0, wob: 0, slip: 0, warn: 0 }, { a: 0.8, v: 0, wob: 0, slip: 0, warn: 0 }], war: 0.36, t: 0, seat: 0, msg: null, nextSlip: 3.5, push: [0, 0], dust: [] }; },
  update(dt, S) {
    S.t += dt; if (S.msg) S.msg.at -= dt;
    const tired = (1 + S.t * 0.045) * (S.seat ? 0.8 : 1);
    if ((S.nextSlip -= dt) <= 0) { const k = Math.random() < 0.5 ? 0 : 1; S.arms[k].warn = 0.6; S.nextSlip = rnd(2.4, 4.2) / (1 + S.t * 0.02); } // 한쪽 팔이 덜컥 — 0.6초 전에 떨림
    for (const A of S.arms) {
      if (A.warn > 0) { A.warn -= dt; if (A.warn <= 0) { A.v -= 0.5; S.fx.play('creak'); } }
      A.v -= 0.25 * tired * dt; A.v *= Math.pow(0.12, dt); A.a = clamp(A.a + A.v * dt, 0, 1); if (A.a <= 0 || A.a >= 1) A.v = 0;
      A.wob = Math.max(0, A.wob - dt * 2);
    }
    for (let i = 0; i < 2; i++) S.push[i] = Math.max(0, S.push[i] - dt * 3);
    const up = S.arms.every(A => A.a >= ARM_UP), down = S.arms.some(A => A.a < ARM_LOW);
    S.war = clamp(S.war + (up ? 0.035 : down ? -0.07 : 0) * dt, 0, 1);
    if (S.war > 0.55 && !S.seat) { S.seat = 1; S.msg = { t: tr('돌을 가져다 앉혔어요'), c: '#e8f0d0', at: 1.6, x: W / 2, y: 120 }; S.fx.play('thud'); }
    if (Math.random() < dt * 8) S.dust.push({ x: 120 + S.war * 160 + rnd(-30, 30), y: 430 + rnd(-10, 10), r: rnd(3, 8), life: 1 });
    for (const d of S.dust) { d.life -= dt * 0.8; d.y -= dt * 8; d.r += dt * 6; } S.dust = S.dust.filter(d => d.life > 0);
  },
  down(x, y, S) { const i = x < W / 2 ? 0 : 1, A = S.arms[i]; S.push[i] = 1;
    if (A.a > 0.86) { A.v -= 0.45; A.wob = 1; S.fx.play('miss'); S.msg = { t: tr('너무 세게!'), c: '#ffc2a0', at: 0.6, x: i ? 300 : 100, y: 150 }; }
    else { A.v += 1.05; A.warn = 0; S.fx.play('step'); } },
  up() {},
  key(k, S) { if (k === 'ArrowLeft' || k === 'a') { this.down(0, 0, S); return; } if (k === 'ArrowRight' || k === 'd') { this.down(W, 0, S); return; } return false; },
  won: S => S.war >= 1,
  lost: S => S.war <= 0,
  failText: S => S.war <= 0 ? tr('아말렉이 이겼어요') : tr('해가 졌어요'),
  draw(g, S, k = 0) {
    const sun = clamp(S.t / this.seconds, 0, 1); // 해가 진다(17:12)
    if (art('m14/bg')) return this.drawArt(g, S, sun);
    const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, `rgb(${120 + sun * 90},${150 - sun * 40},${190 - sun * 90})`); sky.addColorStop(1, `rgb(${230},${190 - sun * 40},${140 - sun * 40})`); g.fillStyle = sky; g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(255,240,200,.8)'; g.beginPath(); g.arc(340, 60 + sun * 200, 18, 0, 7); g.fill();
    // 르비딤 골짜기의 싸움(아래) — 줄이 싸움 막대만큼 오른쪽(아말렉)으로 밀려간다
    g.fillStyle = '#b89868'; g.fillRect(0, 380, W, H); g.fillStyle = '#a88858'; g.beginPath(); g.moveTo(0, 380); g.quadraticCurveTo(200, 360, 400, 384); g.lineTo(400, 400); g.lineTo(0, 400); g.fill();
    const line = 70 + S.war * 260;
    for (const d of S.dust) { g.fillStyle = `rgba(210,190,150,${d.life * 0.5})`; g.beginPath(); g.arc(d.x, d.y, d.r, 0, 7); g.fill(); }
    for (let i = 0; i < 14; i++) { const side = i < 7 ? -1 : 1, j = i % 7, x = line + side * (10 + j * 15) + Math.sin(S.t * 8 + i) * 2, y = 418 + (j % 3) * 14;
      g.fillStyle = side < 0 ? '#e8dcc0' : '#5a3a30'; g.beginPath(); g.ellipse(x, y, 4.5, 9, 0, 0, 7); g.fill(); g.fillStyle = '#b08a64'; g.beginPath(); g.arc(x, y - 12, 3.6, 0, 7); g.fill();
      g.strokeStyle = '#555'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x - side * -3, y - 4); g.lineTo(x + side * -1 + (side < 0 ? 9 : -9), y - 14 + Math.sin(S.t * 10 + i) * 3); g.stroke(); }
    g.font = '700 11px "Noto Sans KR",sans-serif'; g.textAlign = 'left'; g.fillStyle = '#3a2a14'; g.fillText(tr('여호수아'), 10, 470); g.textAlign = 'right'; g.fillText(tr('아말렉'), W - 10, 470);
    // 산꼭대기
    g.fillStyle = '#9a7a54'; g.beginPath(); g.moveTo(40, 380); g.quadraticCurveTo(200, 210, 360, 380); g.fill();
    const mx = 200, my = 318, MS = 2.3;
    if (S.seat) { g.fillStyle = '#8a8070'; rrect(g, mx - 28, my + 4, 56, 30, 8); g.fill(); g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(mx - 24, my + 7, 48, 5); }
    const el = moses(g, mx, my - (S.seat ? 8 : 0), S.arms, S.t, S.seat, MS);
    // 아론(왼쪽)과 훌(오른쪽) — 모세의 팔꿈치 밑을 받친다. 누르면 몸을 뻗어 밀어 올린다
    helper(g, mx - 66, my + 30, -1, S.push[0], '#6a5a8a', el[0]); helper(g, mx + 66, my + 30, 1, S.push[1], '#8a5a3a', el[1]);
    g.font = '700 12px "Noto Sans KR",sans-serif'; g.textAlign = 'center'; g.fillStyle = '#3a2a14'; g.fillText(tr('아론'), mx - 70, my + 74); g.fillText(tr('훌'), mx + 70, my + 74);
    this.hud(g, S);
  },
  hud(g, S) {
    // 싸움 막대
    g.fillStyle = 'rgba(0,0,0,.25)'; rrect(g, 40, 18, W - 80, 14, 7); g.fill(); g.fillStyle = '#e8dcc0'; rrect(g, 40, 18, (W - 80) * S.war, 14, 7); g.fill();
    g.fillStyle = '#3a2a14'; g.font = '800 12px "Noto Sans KR",sans-serif'; g.textAlign = 'center'; g.fillText(S.arms.every(A => A.a >= ARM_UP) ? tr('이스라엘이 이기고 있어요') : S.arms.some(A => A.a < ARM_LOW) ? tr('팔이 처졌어요 — 아말렉이 밀고 와요') : tr('버티는 중'), W / 2, 50);
    // 팔 높이 표시(양쪽 가장자리)
    for (let i = 0; i < 2; i++) { const A = S.arms[i], x = i ? W - 22 : 14; g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(x, 100, 8, 150);
      g.fillStyle = A.a > 0.86 ? '#ffd08a' : A.a >= ARM_UP ? '#9ad08a' : A.a >= ARM_LOW ? '#e8d28a' : '#ff8a6a'; g.fillRect(x, 100 + 150 * (1 - A.a), 8, 150 * A.a);
      g.fillStyle = 'rgba(255,255,255,.7)'; g.fillRect(x - 2, 100 + 150 * (1 - ARM_UP), 12, 1.5); g.fillStyle = 'rgba(255,200,150,.7)'; g.fillRect(x - 2, 100 + 150 * (1 - 0.86), 12, 1.5); }
    floatMsg(g, S.msg);
  },
  drawArt(g, S, sun) { // 그림: 르비딤 언덕(바탕) · 모세(팔 높이마다 세 그림 — 왼쪽 반과 오른쪽 반을 따로 골라 겹친다) · 아론과 훌 · 아래 골짜기의 두 무리
    bgArt(g, 'm14/bg'); if (sun > 0.3) { g.fillStyle = `rgba(255,140,60,${(sun - 0.3) * 0.3})`; g.fillRect(0, 0, W, H); } // 해가 저문다(17:12)
    const line = 70 + S.war * 260;
    for (const d of S.dust) { g.fillStyle = `rgba(210,190,150,${d.life * 0.5})`; g.beginPath(); g.arc(d.x, d.y, d.r, 0, 7); g.fill(); }
    const bob = Math.sin(S.t * 9) * 2; spr(g, 'm14/israel', line - 66, 468 + bob, 64); spr(g, 'm14/amalek', line + 70, 470 - bob, 64);
    g.font = '700 11px "Noto Sans KR",sans-serif'; g.lineWidth = 3; g.strokeStyle = 'rgba(30,20,10,.6)'; g.fillStyle = '#fff2dc';
    g.textAlign = 'left'; g.strokeText(tr('여호수아'), 10, 490); g.fillText(tr('여호수아'), 10, 490); g.textAlign = 'right'; g.strokeText(tr('아말렉'), W - 10, 490); g.fillText(tr('아말렉'), W - 10, 490);
    const mx = 200, my = 300 - (S.seat ? 6 : 0), MH = 150, lv = ['m14/moses-down', 'm14/moses-mid', 'm14/moses-up'];
    for (let side = 0; side < 2; side++) { // side 0 = 화면 왼쪽(모세의 왼팔 — 아론이 받침)
      const A = S.arms[side], v = clamp(A.a, 0, 1) * 2, i0 = Math.min(1, Math.floor(v)), t = clamp((v - i0 - 0.35) / 0.3, 0, 1) /* 거의 한 그림으로 — 경계 근처에서만 짧게 겹쳐 바꾼다(겹치면 팔이 둘로 보였다) */, wob = (A.warn > 0 ? Math.sin(S.t * 50) * 1.5 : 0) + A.wob * Math.sin(S.t * 30) * 2;
      g.save(); g.beginPath(); side ? g.rect(mx, 0, W, H) : g.rect(0, 0, mx, H); g.clip();
      spr(g, lv[i0], mx + wob, my, MH, { a: 1 - t }); spr(g, lv[i0 + 1], mx + wob, my, MH, { a: t }); g.restore(); }
    const ar = (k, p) => -0.15 * p - (1 - S.arms[k].a) * 0.1; // 받칠 때 몸을 모세 쪽으로
    spr(g, 'm14/aaron', mx - 70, my + 10 - S.push[0] * 4, 112, { rot: ar(0, S.push[0]) }); spr(g, 'm14/hur', mx + 70, my + 10 - S.push[1] * 4, 112, { flip: true, rot: -ar(1, S.push[1]) });
    g.font = '700 12px "Noto Sans KR",sans-serif'; g.textAlign = 'center'; g.lineWidth = 3; g.strokeStyle = 'rgba(30,20,10,.6)'; g.fillStyle = '#fff2dc';
    g.strokeText(tr('아론'), mx - 76, my + 26); g.fillText(tr('아론'), mx - 76, my + 26); g.strokeText(tr('훌'), mx + 76, my + 26); g.fillText(tr('훌'), mx + 76, my + 26);
    this.hud(g, S);
  },
  end(g, k, S) { S.arms.forEach(A => { A.a = 0.85; A.v = 0; A.warn = 0; }); S.war = 1; this.update(0.016, S); this.draw(g, S);
    if (k > 0.3) { g.save(); g.globalAlpha = clamp((k - 0.3) * 2, 0, 1); g.fillStyle = 'rgba(40,24,10,.8)'; g.fillRect(0, 130, W, 84);
      g.font = '700 17px "Gowun Batang",serif'; g.textAlign = 'center'; g.fillStyle = '#fff0d6'; g.fillText(tr('그 손이 해가 지도록 내려오지 아니한지라'), W / 2, 160); g.fillText(tr('여호수아가 아말렉을 쳐서 무찌르니라'), W / 2, 184);
      g.font = '600 11px "Noto Sans KR",sans-serif'; g.fillStyle = '#e6cfa6'; g.fillText(tr('출 17:12–13'), W / 2, 203); g.restore(); }
  },
};
function moses(g, x, y, arms, t, seat, sc = 1.6) { // 흰 수염, 오른손에 하나님의 지팡이(17:9). 팔꿈치 자리(화면 좌표)를 돌려준다
  const el = []; g.save(); g.translate(x, y); g.scale(sc, sc);
  g.fillStyle = '#7a5a3a'; g.beginPath(); g.moveTo(-10, seat ? 4 : 14); g.quadraticCurveTo(-11, -16, 0, -20); g.quadraticCurveTo(11, -16, 10, seat ? 4 : 14); g.fill();
  g.fillStyle = '#c8b48a'; g.fillRect(-10, -6, 20, 3);
  arms.forEach((A, i) => { const sd = i ? 1 : -1, th = 0.35 + A.a * 2.5 + (A.warn > 0 ? Math.sin(t * 50) * 0.08 : 0) + A.wob * Math.sin(t * 30) * 0.15; // 0: 아래, 1: 하늘로
    const ex = sd * (6 + Math.sin(th) * 9), ey = -15 + Math.cos(th) * 9, hx = sd * (6 + Math.sin(th) * 18), hy = -15 + Math.cos(th) * 18;
    el.push([x + ex * sc, y + ey * sc]);
    g.strokeStyle = '#7a5a3a'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(sd * 6, -15); g.lineTo(ex, ey); g.lineTo(hx, hy); g.stroke();
    g.fillStyle = '#c99a6a'; g.beginPath(); g.arc(hx, hy, 2.6, 0, 7); g.fill();
    if (i) { g.strokeStyle = '#5a3a1a'; g.lineWidth = 2; g.beginPath(); g.moveTo(hx - Math.sin(th) * 4, hy - Math.cos(th) * 4 + 12); g.lineTo(hx + Math.sin(th) * 2, hy + Math.cos(th) * -2 - 14); g.stroke(); } });
  g.fillStyle = '#c99a6a'; g.beginPath(); g.arc(0, -25, 6, 0, 7); g.fill();
  g.fillStyle = '#eee8da'; g.beginPath(); g.moveTo(-5.5, -24); g.quadraticCurveTo(0, -11, 5.5, -24); g.fill(); g.beginPath(); g.arc(0, -27, 6.4, Math.PI, 0); g.fill();
  g.restore(); return el;
}
function helper(g, x, y, sd, push, col, [tx, ty]) { // 아론·훌 — 두 손으로 모세의 팔꿈치 밑을 받친다
  const S2 = 1.9, sh = [x - sd * 4 * S2, y - 10 * S2]; // 어깨(화면 좌표)
  const hx = tx + sd * 2, hy = ty + 6 - push * 4, mx = (sh[0] + hx) / 2 + sd * 6, my = (sh[1] + hy) / 2 + 8;
  g.save(); g.translate(x, y); g.scale(S2, S2); g.rotate(-sd * (0.12 + push * 0.12));
  g.fillStyle = col; g.beginPath(); g.moveTo(-8, 16); g.quadraticCurveTo(-9, -12, 0, -16); g.quadraticCurveTo(9, -12, 8, 16); g.fill();
  g.fillStyle = '#c99a6a'; g.beginPath(); g.arc(0, -21, 5, 0, 7); g.fill(); g.fillStyle = '#4a3a2a'; g.beginPath(); g.arc(0, -23, 5.3, Math.PI, 0); g.fill();
  g.restore();
  g.strokeStyle = col; g.lineWidth = 7; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(...sh); g.lineTo(mx, my); g.lineTo(hx, hy); g.stroke();
  g.fillStyle = '#c99a6a'; g.beginPath(); g.arc(hx, hy, 4, 0, 7); g.fill();
}

/* ---------- 디베랴 바닷가의 아침 (요 21:1–11): 그물 던지기를 다시 씀 — 배 오른편에, 153마리, 찢어지지 않는 그물 ---------- */
const tiberias = { ...fishing, title: tr('디베랴 바닷가의 아침'), task: tr('배 오른편에 그물을 — 153마리'), goal: 153, right: true, noTear: true, seconds: 40, bg: 'e59/bg', art: ['e59/bg', 'e17/boat'],
  ask: [tr('얘들아, 고기가 있느냐? 밤새 아무것도 잡지 못했구나.'), tr('그물을 배 오른편에 던져라. 그러면 잡으리라!')],
  quote: tr('그물을 배 오른편에 던지라 그리하면 잡으리라'), ref: tr('요 21:6'),
  help: tr('배 <b>오른편</b>의 물고기 떼를 노려 눌러 그물을 던져요. 왼편은 허탕이에요.<br>걸리면 누르고 있어 끌어올려요. 그물이 너무 무거워지면 잠깐 놓았다가 다시 당겨요 — 찢어지지는 않아요.'),
  endLine: [tr('백쉰세 마리라 그물이 찢어지지 아니하였더라'), tr('요 21:11')],
  under(g, S) { // 왼편은 그늘, 오른편에 아침 빛 — 그리고 물가의 숯불 곁에 서신 분(21:4, 9)
    const top = art('e59/bg') ? 150 : 64; g.fillStyle = 'rgba(5,15,30,.16)'; g.fillRect(0, top, BOAT[0], H - top);
    const lg = g.createLinearGradient(BOAT[0], 0, W, 0); lg.addColorStop(0, 'rgba(255,220,160,0)'); lg.addColorStop(1, 'rgba(255,220,160,.12)'); g.fillStyle = lg; g.fillRect(BOAT[0], top, W - BOAT[0], H - top);
    g.save(); g.setLineDash([5, 7]); g.strokeStyle = 'rgba(255,240,210,.25)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(BOAT[0], top + 6); g.lineTo(BOAT[0], BOAT[1] - 60); g.stroke(); g.restore();
    g.font = '800 12px "Noto Sans KR",sans-serif'; g.textAlign = 'center'; g.fillStyle = 'rgba(255,236,200,.8)'; g.fillText(tr('오른편 →'), BOAT[0] + 44, BOAT[1] - 40); g.fillStyle = 'rgba(200,215,230,.45)'; g.fillText(tr('← 왼편'), BOAT[0] - 44, BOAT[1] - 40);
    if (art('e59/bg')) return; // 그림에 물가의 숯불과 그분이 있다
    const fx = 300, fy = 52, fl = 0.8 + 0.2 * Math.sin(performance.now() / 90);
    g.fillStyle = `rgba(255,150,60,${0.5 * fl})`; g.beginPath(); g.arc(fx + 14, fy + 4, 7, 0, 7); g.fill(); g.fillStyle = '#ffcf6a'; g.beginPath(); g.ellipse(fx + 14, fy + 2, 2.5, 4 * fl, 0, 0, 7); g.fill(); // 숯불
    g.fillStyle = '#f2ece0'; g.beginPath(); g.ellipse(fx, fy - 4, 4, 9, 0, 0, 7); g.fill(); g.fillStyle = '#b5523e'; g.fillRect(fx - 4, fy - 10, 2, 9); g.fillStyle = '#c99a6a'; g.beginPath(); g.arc(fx, fy - 15, 3.2, 0, 7); g.fill();
  } };

/* ---------- 춤추며 올라온 법궤 (삼하 6:12–16): 여리고 박자 놀이를 다시 씀 — 여섯 걸음마다 제사, 다윗 성으로 ---------- */
const ARK_SEG = [tr('오벧에돔의 집에서 — 여섯 걸음'), tr('제사를 드리고 — 다시 여섯 걸음'), tr('온 힘을 다해 춤추며'), tr('다윗 성 언덕길'), tr('성문으로 — 나팔을 불며')];
const arkDance = { ...jericho, title: tr('춤추며 올라온 법궤'), task: tr('소고 박자에 맞춰 다윗 성까지'),
  ask: [tr('여섯 걸음을 떼었을 때 나는 제사를 드렸고, 세마포 에봇을 입고 주 앞에서 힘을 다해 춤을 추었단다.'), tr('너도 함께 가자 — 소고 박자에 맞춰 발을 구르렴. 성문에 이르면 크게 환호하고!')],
  quote: tr('다윗이 여호와 앞에서 힘을 다하여 춤을 추는데 그 때에 다윗이 베 에봇을 입었더라'), ref: tr('삼하 6:14'),
  help: tr('소고(음표)가 오른쪽에서 흘러와요. 왼쪽 원에 닿을 때 눌러요.<br>여섯 걸음마다 잠깐 멈춰요(제사). 갈수록 빨라져요. 여섯 번 놓치면 흐트러져요. 마지막에 마구 눌러 환호해요!'),
  seconds: 40, art: ['d24/bg', 'd24/david', 'd24/crowd', 'm35/ark'], plan: [[6, 0.74], [6, 0.64], [8, 0.54], [8, 0.47], [10, 0.41]],
  label: (S, d) => S.shoutOn ? tr('즐거이 환호하며 나팔을 불고!') : ARK_SEG[d - 1],
  shoutMsg: tr('환호하라!'), shoutText: [tr('마구 눌러 환호해요!'), tr('여호와의 궤가 다윗 성으로!')], hitFx: ['timbrel', 'step'], doneFx: 'horn', note: drumNote, ink: '#2a1e10',
  missText: tr('춤의 박자가 흐트러졌어요'),
  endLines: [tr('다윗과 온 이스라엘 족속이 즐거이 환호하며'), tr('나팔을 불고 여호와의 궤를 메어 오니라'), tr('삼하 6:15')],
  scene(g, S) {
    if (art('d24/bg')) return this.sceneArt(g, S);
    const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#9cc0d8'); sky.addColorStop(0.6, '#e8d6a8'); sky.addColorStop(1, '#b89a68'); g.fillStyle = sky; g.fillRect(0, 0, W, H);
    const joy = S.shoutOn ? 0.5 + S.shout * 0.5 : 0, prog = S.notes.filter(n => n.st).length / S.notes.length;
    // 시온 산성(오른쪽 위) — 창가의 미갈(6:16)
    g.fillStyle = '#c8b088'; g.beginPath(); g.moveTo(180, 220); g.lineTo(400, 120); g.lineTo(400, 260); g.lineTo(180, 260); g.fill();
    g.fillStyle = '#dcc49a'; g.fillRect(250, 96, 150, 70); for (let x = 250; x < 400; x += 14) g.fillRect(x, 88, 8, 10);
    g.fillStyle = '#3a2a1a'; g.fillRect(300, 116, 16, 18); g.fillStyle = '#c99a6a'; g.beginPath(); g.arc(308, 126, 4, 0, 7); g.fill(); g.fillStyle = '#7a3a5a'; g.fillRect(303, 129, 10, 5);
    g.fillStyle = '#5a3a24'; g.beginPath(); g.moveTo(352, 166); g.lineTo(352, 140); g.arc(364, 140, 12, Math.PI, 0); g.lineTo(376, 166); g.fill(); // 성문
    // 오르막길
    g.fillStyle = '#a8905e'; g.beginPath(); g.moveTo(0, 300); g.quadraticCurveTo(220, 270, 400, 190); g.lineTo(400, H); g.lineTo(0, H); g.fill();
    g.strokeStyle = '#d8c49a'; g.lineWidth = 30; g.lineCap = 'round'; g.beginPath(); g.moveTo(-20, 340); g.quadraticCurveTo(200, 310, 380, 176); g.stroke();
    const at = u => { const a = 1 - u; return [a * a * -20 + 2 * a * u * 200 + u * u * 380, a * a * 340 + 2 * a * u * 310 + u * u * 176]; };
    // 법궤를 멘 레위 사람들 — 박자가 지날수록 언덕을 오른다
    const u0 = 0.12 + prog * 0.62, [ax, ay] = at(u0);
    g.save(); g.translate(ax, ay); g.scale(1.3, 1.3);
    g.strokeStyle = '#8a6a3a'; g.lineWidth = 2; g.beginPath(); g.moveTo(-24, -18); g.lineTo(24, -18); g.stroke(); // 채
    for (const px of [-20, -8, 8, 20]) { g.fillStyle = '#efe6d2'; g.beginPath(); g.ellipse(px, -6, 4, 9, 0, 0, 7); g.fill(); g.fillStyle = '#c99a6a'; g.beginPath(); g.arc(px, -17, 3.2, 0, 7); g.fill(); }
    g.fillStyle = '#e0b850'; g.fillRect(-12, -32, 24, 13); g.fillStyle = '#f2d27a'; g.fillRect(-12, -32, 24, 3);
    g.fillStyle = '#e0b850'; g.beginPath(); g.moveTo(-11, -32); g.quadraticCurveTo(-6, -42, -1, -33); g.fill(); g.beginPath(); g.moveTo(11, -32); g.quadraticCurveTo(6, -42, 1, -33); g.fill(); // 그룹
    g.restore();
    // 앞에서 춤추는 다윗 — 베 에봇, 맞힐 때마다 뛰어오른다
    const [dx, dy] = at(Math.min(0.95, u0 + 0.12)), hop = Math.abs(Math.sin(S.t * 7)) * (4 + S.flash * 10 + joy * 8);
    g.save(); g.translate(dx, dy - hop); g.scale(1.7, 1.7); const sw = Math.sin(S.t * 7);
    g.strokeStyle = '#c99a6a'; g.lineWidth = 2.4; g.lineCap = 'round'; g.beginPath(); g.moveTo(-3, -16); g.lineTo(-10, -26 + sw * 4); g.moveTo(3, -16); g.lineTo(10, -26 - sw * 4); g.stroke(); // 두 팔을 들고
    g.fillStyle = '#f6f1e4'; g.beginPath(); g.moveTo(-6, 0); g.quadraticCurveTo(-7, -18, 0, -20); g.quadraticCurveTo(7, -18, 6, 0); g.fill();
    g.fillStyle = '#e8dfc8'; g.fillRect(-6, -12, 12, 2);
    g.strokeStyle = '#c99a6a'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(-2, 0); g.lineTo(-4 - sw * 3, 8); g.moveTo(2, 0); g.lineTo(4 + sw * 3, 8); g.stroke();
    g.fillStyle = '#c99a6a'; g.beginPath(); g.arc(0, -24, 4, 0, 7); g.fill(); g.fillStyle = '#8a4a2a'; g.beginPath(); g.arc(0, -25.5, 4.2, Math.PI, 0); g.fill(); // 붉은 머리(삼상 16:12)
    g.restore();
    // 따르는 무리 — 소고·수금(6:5)
    for (let i = 0; i < 12; i++) { const x = 14 + i * 33 + (i % 2) * 8, y = 368 + (i % 3) * 10, b = Math.abs(Math.sin(S.t * 7 + i)) * (2 + S.flash * 4 + joy * 6);
      g.fillStyle = ['#7a5a3e', '#5a4a6a', '#9a6a3a', '#4a5a4a', '#8a4a3a'][i % 5]; g.beginPath(); g.ellipse(x, y - b, 8, 15, 0, 0, 7); g.fill();
      g.fillStyle = '#c99a6a'; g.beginPath(); g.arc(x, y - 19 - b, 5.5, 0, 7); g.fill();
      if (i % 3 === 0) { g.fillStyle = '#d8b878'; g.beginPath(); g.arc(x + 9, y - 26 - b, 6, 0, 7); g.fill(); g.strokeStyle = '#8a6a3a'; g.lineWidth = 1; g.stroke(); } }
  },
  sceneArt(g, S) { // 그림: 다윗 성으로 오르는 돌길을 따라 법궤가 오르고, 앞에서 다윗이 춤춘다. 아래에는 소고·수금 든 무리
    bgArt(g, 'd24/bg'); const joy = S.shoutOn ? 0.5 + S.shout * 0.5 : 0, prog = S.notes.filter(n => n.st).length / S.notes.length;
    const P = [[150, 470], [180, 380], [215, 300], [236, 236], [262, 196]], at = u => { const v = clamp(u, 0, 0.999) * (P.length - 1), i = Math.floor(v), t = v - i; return [P[i][0] + (P[i + 1][0] - P[i][0]) * t, P[i][1] + (P[i + 1][1] - P[i][1]) * t]; };
    const u0 = 0.05 + prog * 0.6, [ax, ay] = at(u0), [dx, dy] = at(u0 + 0.16), hop = Math.abs(Math.sin(S.t * 7)) * (3 + S.flash * 8 + joy * 6);
    spr(g, 'm35/ark', ax, ay, 30 + (ay - 196) * 0.22, { flip: ax > 200 && false });
    spr(g, 'd24/david', dx, dy - hop, 36 + (dy - 196) * 0.26, { rot: Math.sin(S.t * 7) * 0.08 });
    spr(g, 'd24/crowd', 96, 404 - S.flash * 3 - joy * 4 * Math.abs(Math.sin(S.t * 8)), 92, { rot: Math.sin(S.t * 5) * (0.01 + joy * 0.02) });
  },
};
function drumNote(g, x, y, fast) { // 소고
  g.save(); g.translate(x, y); g.scale(1.4, 1.4); g.fillStyle = fast ? '#ffe0a0' : '#e8d4a8'; g.strokeStyle = '#7a5a30'; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, 10, 0, 7); g.fill(); g.stroke();
  g.fillStyle = '#c9a050'; for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; g.beginPath(); g.arc(Math.cos(a) * 10, Math.sin(a) * 10, 2, 0, 7); g.fill(); } g.restore();
}

/* ---------- 바다가 갈라지다 (출 14:19–29): 구름 기둥으로 병거 막기 — 버티기 ---------- */
// 백성이 물벽 사이로 건너는 동안 애굽 병거가 네 길로 달려온다(먼저 왼쪽에 흙먼지가 인다). 구름 기둥을 위아래로 끌어 그 길을 막으면
// 병거가 어둠 속에서 멈춰 돌아간다(14:20). 막지 못한 병거가 백성에게 닿으면 한 번 — 세 번이면 실패. 끝까지 버티면 물이 다시 덮는다(14:28)
const LANES = [176, 248, 320, 392], PIL_X = 168, PIL_H = 96, PEOPLE_X = 270, CAUGHT = 3;
const redSea = {
  title: tr('바다가 갈라지다'), task: tr('구름 기둥으로 병거를 막아 백성이 건너기까지'), survive: true,
  ask: [tr('앞은 바다, 뒤는 바로의 병거였지. 그 밤 구름 기둥이 우리 뒤로 옮겨 와 애굽 진과 우리 사이에 섰단다.'), tr('백성이 다 건널 때까지 구름 기둥으로 병거를 막아 다오!')],
  quote: tr('구름 기둥도 앞에서 그들의 뒤로 옮겨 애굽 진과 이스라엘 진 사이에 이르러 서니'), ref: tr('출 14:19–20'),
  help: tr('구름 기둥을 위아래로 끌어 병거가 오는 길을 막아요. 흙먼지가 이는 길에 곧 병거가 와요.<br>막지 못한 병거가 백성에게 닿으면 한 번 — 세 번이면 실패. 백성이 다 건널 때까지 버텨요.'),
  art: ['m09/sand', 'm09/water', 'm09/shore', 'm09/pillar', 'm09/chariot'],
  seconds: 28,
  init() { return { py: LANES[1] + 36, ty: null, cars: [], hits: 0, t: 0, next: 1.2, msg: null, dust: [], shake: 0, people: Array.from({ length: 40 }, (_, i) => ({ k: i / 40, s: rnd(0.8, 1.2) })) }; },
  update(dt, S) {
    S.t += dt; if (S.msg) S.msg.at -= dt; S.shake = Math.max(0, S.shake - dt * 3);
    if (S.ty !== null) S.py += (S.ty - S.py) * Math.min(1, dt * 14); // 손가락을 바로 따라가되 조금 무겁게
    const lvl = Math.min(1, S.t / 24);
    if ((S.next -= dt) <= 0) { // 병거: 흙먼지 0.9초 뒤 달려온다. 뒤로 갈수록 빠르고, 두 길에서 함께 오기도
      const n = Math.random() < 0.1 + lvl * 0.35 ? 2 : 1, used = new Set();
      for (let i = 0; i < n; i++) { let L; do L = Math.floor(Math.random() * 4); while (used.has(L)); used.add(L);
        S.cars.push({ L, x: -50 - i * rnd(70, 130), sp: rnd(85, 115) + lvl * 55, warn: 1.0, st: 'run', back: 0 }); }
      S.next = rnd(1.5, 2.3) - lvl * 0.6; S.fx.play('chariot');
    }
    const top = S.py - PIL_H / 2, bot = S.py + PIL_H / 2;
    for (const c of S.cars) {
      if (c.warn > 0) { c.warn -= dt; continue; }
      if (c.st === 'run') { c.x += c.sp * dt; const y = LANES[c.L];
        if (c.x > PIL_X - 46 && c.x < PIL_X - 20 && y > top && y < bot) { c.st = 'stop'; S.fx.play('neigh'); S.msg = { t: tr('어둠 속에 멈췄어요'), c: '#d8e0ff', at: 0.7, x: PIL_X - 60, y: y - 26 }; }
        else if (c.x > PEOPLE_X - 10) { c.st = 'hit'; S.hits++; S.shake = 1; S.fx.play('splash'); S.msg = { t: S.hits < CAUGHT ? tr('병거가 백성에게 닿았어요 ({0}/{1})', S.hits, CAUGHT) : tr('병거에 따라잡혔어요'), c: '#ffb38a', at: 1.2, x: 200, y: y - 30 }; } }
      else if (c.st === 'stop') { c.back += dt; c.x -= 70 * dt * Math.min(1, c.back); }
      else if (c.st === 'hit') c.back += dt;
    }
    S.cars = S.cars.filter(c => c.x > -160 && !(c.st === 'hit' && c.back > 0.8));
    for (const p of S.people) p.k = Math.min(1, p.k + dt * 0.032 * p.s);
    if (Math.random() < dt * 20) S.dust.push({ x: rnd(0, 120), y: LANES[Math.floor(Math.random() * 4)] + rnd(-10, 10), r: rnd(4, 10), life: 1 });
    for (const d of S.dust) { d.life -= dt; d.r += dt * 10; } S.dust = S.dust.filter(d => d.life > 0);
  },
  down(x, y, S) { S.ty = clamp(y, LANES[0] - 20, LANES[3] + 20); },
  move(x, y, S) { if (S.ty !== null) S.ty = clamp(y, LANES[0] - 20, LANES[3] + 20); },
  up(S) {},
  key(k, S) { const i = LANES.findIndex(l => Math.abs(l - S.py) < 36); if (k === 'ArrowUp') { S.ty = LANES[Math.max(0, i - 1)]; return; } if (k === 'ArrowDown') { S.ty = LANES[Math.min(3, i + 1)]; return; } return false; },
  won: () => false,
  lost: S => S.hits >= CAUGHT,
  bonus: S => Math.round(200 * (1 - S.hits / CAUGHT)),
  failText: () => tr('병거에 따라잡혔어요'),
  sea(g, S, close = 0, part = 3) { // part: 1 땅, 2 물벽, 3 둘 다
    // 위에서 내려다본 모습: 왼쪽은 애굽 쪽 바닷가(캄캄), 오른쪽은 물벽 사이로 드러난 마른 바닥(출 14:22). 끝나면 물벽이 다시 덮인다
    const SH = 196, top = LANES[0] - 40, bot = LANES[3] + 40, cl = close * (bot - top) / 2;
    const TX = art('m09/sand');
    if (part & 1) {
    if (TX) { g.drawImage(art('m09/shore'), 0, 0, W, H); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, 0, W, H); } else { g.fillStyle = '#211c14'; g.fillRect(0, 0, W, H); }
    const lit = g.createRadialGradient(PIL_X + 60, (top + bot) / 2, 20, PIL_X + 60, (top + bot) / 2, 300); lit.addColorStop(0, 'rgba(255,190,110,.22)'); lit.addColorStop(1, 'rgba(255,190,110,0)'); g.fillStyle = lit; g.fillRect(0, 0, W, H);
    if (TX) { g.save(); g.beginPath(); g.rect(SH, top, W - SH, bot - top); g.clip(); g.drawImage(TX, 0, 0, W, H); g.fillStyle = 'rgba(20,14,8,.25)'; g.fillRect(SH, top, W - SH, bot - top); g.restore(); }
    else { g.fillStyle = '#5e5038'; g.beginPath(); g.moveTo(SH, top); g.lineTo(W, top); g.lineTo(W, bot); g.lineTo(SH, bot); g.fill(); } // 바다 밑 마른 땅
    g.fillStyle = 'rgba(30,24,16,.25)'; for (let k = 0; k < 30; k++) { g.beginPath(); g.ellipse(SH + 10 + (k * 53) % (W - SH), top + 10 + (k * 37) % (bot - top - 20), 6, 2.5, 0, 0, 7); g.fill(); } // 물결 자국
    }
    if (part & 2) {
    for (const [y0, y1, sd] of [[0, top + cl, 1], [bot - cl, H, -1]]) {
      const wg = g.createLinearGradient(0, y0, 0, y1); wg.addColorStop(sd > 0 ? 0 : 1, '#0e2a48'); wg.addColorStop(sd > 0 ? 1 : 0, '#2f6f96'); g.fillStyle = wg;
      if (TX) { g.save(); g.beginPath(); g.rect(SH - 30, y0, W, y1 - y0); g.clip(); g.drawImage(art('m09/water'), 0, (S.t * 6) % 40 - 40, W, H + 40); g.globalAlpha = 0.35; g.fillRect(SH - 30, y0, W, y1 - y0); g.restore(); }
      else { g.beginPath(); g.moveTo(SH - 30, y0); g.lineTo(W, y0); g.lineTo(W, y1); g.lineTo(SH - 30, y1); g.fill(); }
      const edge = sd > 0 ? y1 : y0; g.strokeStyle = 'rgba(210,235,255,.55)'; g.lineWidth = 2.5; g.beginPath();
      for (let x = SH - 30; x <= W; x += 8) { const yy = edge + Math.sin(x * 0.15 + S.t * 4) * 2.5 * sd; x === SH - 30 ? g.moveTo(x, yy) : g.lineTo(x, yy); } g.stroke();
      g.fillStyle = 'rgba(210,235,255,.18)'; for (let x = SH - 20; x < W; x += 26) g.fillRect(x + Math.sin(S.t * 2 + x) * 3, edge - sd * 10, 14, 2); }
    if (!TX) { g.fillStyle = '#16120c'; g.fillRect(0, 0, SH - 30, top); g.fillRect(0, bot, SH - 30, H - bot); } // 애굽 쪽 뭍(위아래)
    g.fillStyle = 'rgba(230,225,255,.5)'; for (let k = 0; k < 14; k++) g.fillRect((k * 29) % (SH - 40), (k * 17) % (top - 10), 1, 1);
    }
  },
  draw(g, S) {
    g.save(); if (S.shake) g.translate(Math.sin(S.t * 60) * 4 * S.shake, 0);
    this.sea(g, S);
    // 길(네 줄) 표시
    for (const y of LANES) { g.strokeStyle = 'rgba(255,230,190,.06)'; g.lineWidth = 30; g.beginPath(); g.moveTo(0, y); g.lineTo(PEOPLE_X - 20, y); g.stroke(); } // 병거가 오는 네 길
    for (const d of S.dust) { g.fillStyle = `rgba(150,130,100,${d.life * 0.25})`; g.beginPath(); g.arc(d.x, d.y, d.r, 0, 7); g.fill(); }
    // 백성 — 물벽 사이로 건너간다
    for (const p of S.people) { const x = 262 + p.k * 170, y = LANES[0] - 16 + ((p.s * 997) % 1) * (LANES[3] - LANES[0] + 32); if (x > W + 10) continue;
      g.fillStyle = 'rgba(0,0,0,.4)'; g.beginPath(); g.ellipse(x + 2, y + 4, 8, 4, 0, 0, 7); g.fill();
      g.fillStyle = ['#7a4a8a', '#3a6a9a', '#9a4a3a', '#5a7a3a'][Math.floor(p.s * 30) % 4]; g.beginPath(); g.ellipse(x, y, 8, 6, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(20,12,6,.7)'; g.lineWidth = 1.2; g.stroke();
      g.fillStyle = '#e8dcc0'; g.beginPath(); g.arc(x + 2, y, 3.6, 0, 7); g.fill(); } // 위에서 본 머릿수건과 어깨 — 모래의 조개와 헷갈리지 않게 짙은 옷빛
    // 병거
    for (const c of S.cars) { const y = LANES[c.L];
      if (c.warn > 0) { g.fillStyle = `rgba(210,180,130,${0.5 * Math.sin((0.9 - c.warn) / 0.9 * Math.PI)})`; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(8 + i * 10, y + rnd(-4, 4), 12 + i * 3, 0, 7); g.fill(); }
        g.fillStyle = '#ffcf8a'; g.font = '900 18px "Noto Sans KR",sans-serif'; g.textAlign = 'left'; g.fillText('!', 10, y + 6); continue; }
      chariot(g, c.x, y, c.st === 'stop' ? c.back : 0, S.t); }
    // 구름 기둥 — 끌 수 있다
    pillar(g, PIL_X, S.py, S.t);
    // 남은 목숨·건넌 백성
    g.restore();
    g.save(); g.font = '800 14px "Noto Sans KR",sans-serif'; g.textAlign = 'left'; g.fillStyle = '#e8e4f4'; g.fillText(tr('백성이 건너는 중'), 14, 26);
    const pk = S.people.reduce((a, p) => a + p.k, 0) / S.people.length; g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(14, 34, 140, 8); g.fillStyle = '#ffd27a'; g.fillRect(14, 34, 140 * pk, 8);
    for (let i = 0; i < CAUGHT; i++) { g.fillStyle = i < CAUGHT - S.hits ? '#e8dcc0' : 'rgba(255,255,255,.15)'; g.beginPath(); g.arc(W - 22 - i * 20, 28, 7, 0, 7); g.fill(); }
    g.restore();
    floatMsg(g, S.msg);
  },
  end(g, k, S) { // 물이 다시 흘러 병거를 덮고(14:28), 백성은 건너편에
    S.cars.forEach(c => { if (c.st === 'run') c.st = 'stop'; }); this.update(0.016, S);
    const close = clamp((k - 0.15) * 2.2, 0, 1); this.sea(g, S, close, 1);
    for (const c of S.cars) chariot(g, c.x, LANES[c.L], 1, S.t);
    this.sea(g, S, close, 2); // 물이 병거 위를 덮는다(14:28)
    pillar(g, PIL_X, S.py, S.t, 1 - k);
    if (close > 0 && close < 1) { g.fillStyle = `rgba(220,240,255,${0.5 * Math.sin(close * Math.PI)})`; const mid = (LANES[0] + LANES[3]) / 2, half = (1 - close) * (LANES[3] - LANES[0] + 80) / 2; for (let i = 0; i < 26; i++) { const x = 170 + (i * 37) % 230; g.beginPath(); g.arc(x, mid + (i % 2 ? -half : half) + Math.sin(i) * 6, 6 + (i % 4) * 3, 0, 7); g.fill(); } } // 덮이는 물거품
    if (k > 0.35) { g.save(); g.globalAlpha = clamp((k - 0.35) * 2, 0, 1); g.fillStyle = 'rgba(10,14,30,.82)'; g.fillRect(0, 50, W, 84);
      g.font = '700 16px "Gowun Batang",serif'; g.textAlign = 'center'; g.fillStyle = '#eef2ff'; g.fillText(tr('이스라엘 자손은 바다 가운데를 육지로 행하였고'), W / 2, 80); g.fillText(tr('물이 좌우에 벽이 되었더라'), W / 2, 104);
      g.font = '600 11px "Noto Sans KR",sans-serif'; g.fillStyle = '#b8c2e0'; g.fillText(tr('출 14:29'), W / 2, 123); g.restore(); }
  },
};
function pillar(g, x, y, t, al = 1) { // 구름과 불 기둥 — 끄는 자리(가운데)를 중심으로 위아래로 길게, 가운데가 막는 폭
  if (art('m09/pillar')) { g.save(); g.globalAlpha = al; const glow = g.createRadialGradient(x, y, 6, x, y, 100); glow.addColorStop(0, 'rgba(255,190,110,.45)'); glow.addColorStop(1, 'rgba(255,190,110,0)'); g.fillStyle = glow; g.fillRect(x - 100, y - 100, 200, 200);
    spr(g, 'm09/pillar', x + Math.sin(t * 1.3) * 2, y + PIL_H / 2 + 34, PIL_H + 68, { a: al });
    g.strokeStyle = 'rgba(255,240,210,.5)'; g.setLineDash([4, 5]); g.lineWidth = 1.5; g.beginPath(); g.moveTo(x - 40, y - PIL_H / 2); g.lineTo(x - 40, y + PIL_H / 2); g.stroke(); g.setLineDash([]); g.restore(); return; }
  g.save(); g.globalAlpha = al;
  const glow = g.createRadialGradient(x, y, 6, x, y, 90); glow.addColorStop(0, 'rgba(255,190,110,.45)'); glow.addColorStop(1, 'rgba(255,190,110,0)'); g.fillStyle = glow; g.fillRect(x - 90, y - 90, 180, 180);
  for (let i = 0; i < 16; i++) { const yy = y - PIL_H / 2 - 30 + i * ((PIL_H + 60) / 15), w = (i > 2 && i < 13 ? 26 : 18) + Math.sin(t * 2 + i) * 4;
    g.fillStyle = `rgba(${200 + (i % 3) * 15},${200 + (i % 3) * 12},${215},${i > 2 && i < 13 ? 0.82 : 0.5})`; g.beginPath(); g.ellipse(x + Math.sin(t * 1.5 + i * 0.8) * 4, yy, w, 13, 0, 0, 7); g.fill(); }
  g.fillStyle = `rgba(255,200,120,${0.35 + 0.15 * Math.sin(t * 6)})`; g.beginPath(); g.ellipse(x, y, 9, PIL_H / 2 - 6, 0, 0, 7); g.fill(); // 속의 불빛(14:24)
  g.strokeStyle = 'rgba(255,240,210,.5)'; g.setLineDash([4, 5]); g.lineWidth = 1.5; g.beginPath(); g.moveTo(x - 36, y - PIL_H / 2); g.lineTo(x - 36, y + PIL_H / 2); g.stroke(); g.setLineDash([]);
  g.restore();
}
function chariot(g, x, y, stop, t) { // 말 두 필 + 병거(옆모습), 멈추면 말이 앞발을 든다
  if (spr(g, 'm09/chariot', x, y + 16, 44, { rot: -Math.min(1, stop * 2) * Math.max(0, 1 - stop) * 0.35, ax: 0.6 })) return;
  g.save(); g.translate(x, y); g.scale(1.5, 1.5); const rear = Math.min(1, stop * 2) * Math.max(0, 1 - stop) * 0.5;
  g.fillStyle = '#2a1c12'; g.save(); g.translate(18, 0); g.rotate(-rear);
  for (const dy of [-4, 3]) { g.beginPath(); g.ellipse(0, dy - 4, 12, 5, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(9, dy - 6); g.lineTo(17, dy - 14); g.lineTo(20, dy - 11); g.lineTo(12, dy - 3); g.fill();
    const l = Math.sin(t * 18 + dy) * 3 * (1 - stop); g.fillRect(-9 + l, dy - 1, 2, 7); g.fillRect(7 - l, dy - 1, 2, 7); }
  g.restore();
  g.strokeStyle = '#1a140e'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-4, -4); g.lineTo(8, -4); g.stroke();
  g.fillStyle = '#3a2a1a'; g.fillRect(-16, -14, 12, 10); g.strokeStyle = '#5a4430'; g.lineWidth = 2; g.beginPath(); g.arc(-10, 0, 6, 0, 7); g.stroke(); // 바퀴
  g.fillStyle = '#2a1c12'; g.beginPath(); g.arc(-10, -20, 3.5, 0, 7); g.fill(); g.fillRect(-12, -18, 4, 6); g.fillStyle = '#c8a050'; g.fillRect(-13, -24, 6, 2); g.fillRect(-16, -14, 12, 1.5); // 투구·병거 테의 금빛
  g.restore();
}

/* ---------- 바람과 바다를 꾸짖으시다 (막 4:35–41): 배에 들이친 물 퍼내기 — 버티기 ---------- */
// 배는 네 칸. 파도가 한쪽 칸 위로 솟아오르면(0.7초 먼저 보임) 곧 그 칸에 물이 들이치고 이웃 칸으로도 조금 넘친다. 비도 계속 샌다.
// 칸을 누르면 바가지로 물을 퍼서 던진다(한 번에 조금, 바가지는 잠깐 쉰다). 어느 칸이든 물이 가득 차면 실패. 끝까지 버티면 그분이 일어나 바다를 꾸짖으신다
const HULL = { x0: 40, x1: 360, top: 368, bot: 438 }, CELLS = 4, BAIL = 0.15, BAIL_CD = 0.26;
const bail = {
  title: tr('바람과 바다를 꾸짖으시다'), task: tr('배에 들이치는 물을 퍼내며 버티기'), survive: true,
  ask: [tr('그날 밤, 파도가 배 안으로 들이쳐 배에 물이 가득하게 되었단다.'), tr('나는 고물에서 자고 있을 테니 — 그때까지 물을 퍼내며 버텨 보렴!')],
  quote: tr('큰 광풍이 일어나며 물결이 배에 부딪쳐 들어와 배에 가득하게 되었더라'), ref: tr('막 4:37'),
  help: tr('파도가 솟는 칸에 곧 물이 들이쳐요. 칸을 눌러 물을 퍼내요(한 번에 조금).<br>어느 칸이든 물이 가득 차면 실패. 끝까지 버텨요.'),
  seconds: 26, art: ['e32/bg', 'e32/calm', 'e28/boat', 'e28/men', 'e28/sleep', 'e28/rebuke'],
  init() { return { lv: [0.12, 0.08, 0.1, 0.06], waves: [], next: 1.0, cd: 0, t: 0, drops: [], bucket: null, msg: null, flash: 0, bolt: 0, rock: 0 }; },
  cellX(i) { const w = (HULL.x1 - HULL.x0) / CELLS; return [HULL.x0 + i * w, HULL.x0 + (i + 1) * w]; },
  update(dt, S) {
    S.t += dt; S.cd = Math.max(0, S.cd - dt); S.flash = Math.max(0, S.flash - dt * 2); if (S.msg) S.msg.at -= dt;
    const lvl = Math.min(1, S.t / 22); S.fx.storm?.(0.55 + lvl * 0.45); S.rock = Math.sin(S.t * 1.6) * 0.05 + Math.sin(S.t * 2.7) * 0.025;
    if ((S.next -= dt) <= 0) { const i = Math.floor(Math.random() * CELLS); S.waves.push({ i, t: 0, amt: rnd(0.24, 0.36) + lvl * 0.08 }); S.next = rnd(1.15, 1.55) - lvl * 0.45;
      if (Math.random() < 0.08 + lvl * 0.2) { S.bolt = 0.25; S.fx.play('thunder'); } }
    for (const w of S.waves) { w.t += dt; if (w.t >= 0.7 && !w.hit) { w.hit = 1; S.lv[w.i] += w.amt; if (w.i > 0) S.lv[w.i - 1] += w.amt * 0.25; if (w.i < CELLS - 1) S.lv[w.i + 1] += w.amt * 0.25; S.fx.play('splash');
        const [a, b] = this.cellX(w.i); for (let k = 0; k < 16; k++) S.drops.push({ x: rnd(a, b), y: HULL.top - rnd(0, 30), vx: rnd(-40, 40), vy: rnd(40, 160), life: rnd(0.4, 0.8), c: 1 }); } }
    S.waves = S.waves.filter(w => w.t < 1.4);
    for (let i = 0; i < CELLS; i++) S.lv[i] = Math.min(1, S.lv[i] + (0.006 + lvl * 0.01) * dt); // 빗물
    if (S.bucket) { S.bucket.t += dt; if (S.bucket.t > 0.35) S.bucket = null; }
    for (const d of S.drops) { d.vy += 500 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.life -= dt; } S.drops = S.drops.filter(d => d.life > 0);
    S.bolt = Math.max(0, S.bolt - dt);
  },
  down(x, y, S) {
    if (y < HULL.top - 80) return; const i = clamp(Math.floor((x - HULL.x0) / ((HULL.x1 - HULL.x0) / CELLS)), 0, CELLS - 1);
    if (S.cd > 0) return; S.cd = BAIL_CD; S.lv[i] = Math.max(0, S.lv[i] - BAIL); S.fx.play('bail');
    const [a, b] = this.cellX(i), cx = (a + b) / 2, side = i < 2 ? -1 : 1; S.bucket = { i, t: 0, x: cx };
    for (let k = 0; k < 12; k++) S.drops.push({ x: cx, y: HULL.top - 10, vx: side * rnd(90, 200), vy: rnd(-260, -120), life: rnd(0.5, 0.9), c: 0 }); // 배 밖으로 던진다
  },
  up() {},
  key(k, S) { const n = '1234'.indexOf(k); if (n >= 0) { const [a, b] = this.cellX(n); this.down((a + b) / 2, HULL.top + 40, S); return; } return false; },
  won: () => false,
  lost: S => S.lv.some(v => v >= 1),
  bonus: S => Math.round(200 * (1 - S.lv.reduce((a, b) => a + b, 0) / CELLS)),
  failText: () => tr('배에 물이 가득 찼어요'),
  draw(g, S, calm = 0) {
    const st = 1 - calm, A = art('e28/boat');
    if (A) { bgArt(g, 'e32/bg'); if (calm) { g.save(); g.globalAlpha = calm; g.drawImage(art('e32/calm'), -20, 0, W + 40, H + 50); g.restore(); } } else {
    const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, `rgb(${20 + calm * 120},${26 + calm * 130},${40 + calm * 150})`); sky.addColorStop(1, `rgb(${40 + calm * 90},${56 + calm * 100},${70 + calm * 110})`); g.fillStyle = sky; g.fillRect(0, 0, W, H); }
    if (S.bolt > 0 && st > 0.5) { g.fillStyle = `rgba(230,240,255,${S.bolt * 2})`; g.fillRect(0, 0, W, H); g.strokeStyle = '#f4f8ff'; g.lineWidth = 2; g.beginPath(); g.moveTo(260, 0); g.lineTo(240, 60); g.lineTo(262, 70); g.lineTo(230, 150); g.stroke(); }
    // 먹구름 — 빠르게 흘러간다
    if (!A) for (let i = 0; i < 9; i++) { const x = ((i * 83 + S.t * (30 + i * 4)) % 560) - 80, y = 20 + (i % 3) * 34; g.fillStyle = `rgba(${14 + calm * 150},${18 + calm * 150},${28 + calm * 160},${0.75 * st})`; g.beginPath(); g.ellipse(x, y, 90, 34, 0, 0, 7); g.fill(); }
    // 비
    if (st > 0.05) { g.strokeStyle = `rgba(200,215,235,${0.35 * st})`; g.lineWidth = 1; for (let i = 0; i < 60; i++) { const x = (i * 71 + S.t * 300) % 460 - 30, y = (i * 113 + S.t * 700) % H; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 6, y + 16); g.stroke(); } }
    // 바다 — 큰 너울
    const sea = y0 => { g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= W; x += 10) g.lineTo(x, y0 + Math.sin(x * 0.03 + S.t * 1.8) * 18 * st + Math.sin(x * 0.07 - S.t * 2.6) * 8 * st); g.lineTo(W, H); g.fill(); };
    g.fillStyle = A ? 'rgba(20,46,66,.55)' : '#1e3a50'; sea(250); g.fillStyle = A ? 'rgba(28,62,86,.7)' : '#244a62'; sea(330);
    // 솟는 파도 — 곧 들이칠 칸 위
    g.save(); g.translate(200, 420); g.rotate(S.rock * st); g.translate(-200, -420);
    for (const w of S.waves) { const [a, b] = this.cellX(w.i), k = w.t < 0.7 ? w.t / 0.7 : Math.max(0, 1 - (w.t - 0.7) / 0.5), m = (a + b) / 2, hgt = 130 * k;
      const wg = g.createLinearGradient(0, HULL.top - hgt, 0, HULL.top + 20); wg.addColorStop(0, `rgba(150,200,225,${0.95 * k})`); wg.addColorStop(1, `rgba(40,90,120,${0.95 * k})`); g.fillStyle = wg;
      g.beginPath(); g.moveTo(a - 30, HULL.top + 20); g.bezierCurveTo(a - 10, HULL.top - hgt * 0.5, m - 30, HULL.top - hgt, m + 10, HULL.top - hgt * 0.95); g.bezierCurveTo(m + 34, HULL.top - hgt * 0.9, b + 4, HULL.top - hgt * 0.6, m + 18, HULL.top - hgt * 0.55); // 말려드는 물마루
      g.quadraticCurveTo(b + 20, HULL.top - hgt * 0.4, b + 30, HULL.top + 20); g.closePath(); g.fill();
      g.fillStyle = `rgba(240,250,255,${0.85 * k})`; for (let j = 0; j < 9; j++) { g.beginPath(); g.arc(m - 26 + j * 7 + Math.sin(S.t * 9 + j) * 2, HULL.top - hgt * (0.92 - Math.abs(j - 4) * 0.03), 3 + (j % 3), 0, 7); g.fill(); } // 흰 물거품
      if (w.t < 0.7) { g.fillStyle = '#ffd08a'; g.font = '900 22px "Noto Sans KR",sans-serif'; g.textAlign = 'center'; g.lineWidth = 4; g.strokeStyle = 'rgba(20,30,40,.7)'; g.strokeText('!', m, HULL.top - hgt - 12); g.fillText('!', m, HULL.top - hgt - 12); } }
    // 배 (옆 단면) — 네 칸과 물
    const hull = () => { g.beginPath(); g.moveTo(HULL.x0 - 14, HULL.top - 12); g.lineTo(HULL.x1 + 14, HULL.top - 18); g.quadraticCurveTo(HULL.x1 + 4, HULL.bot - 10, HULL.x1 - 40, HULL.bot); g.lineTo(HULL.x0 + 40, HULL.bot); g.quadraticCurveTo(HULL.x0 - 4, HULL.bot - 10, HULL.x0 - 14, HULL.top - 12); g.closePath(); };
    // 제자들(그림) — 배 안에 서서 뱃전 위로 몸이 보인다, 배보다 먼저 그려 아래가 가린다
    if (A) for (let i = 0; i < 3; i++) { const [a, b] = this.cellX(i); spr(g, 'e28/men', (a + b) / 2, HULL.top + 34, 80, { flip: i === 1 }); }
    if (A && calm > 0) spr(g, 'e28/rebuke', this.cellX(3)[0] + 40, HULL.top + 30, 118, { a: Math.min(1, calm * 2) });
    if (A) { // 그림 배: 작은 캔버스에 배를 그리고 그 모양 안에만 칸마다 물을 비춰 칠한다(가나 항아리처럼)
      const bw = 380, bh = A.height * bw / A.width, bx = 200 - bw / 2, by = HULL.bot + 10 - bh * 0.93, R = 2;
      boatCv ??= typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(8, 8) : document.createElement('canvas');
      boatCv.width = Math.ceil(bw * R); boatCv.height = Math.ceil(bh * R); const o = boatCv.getContext('2d'); o.drawImage(A, 0, 0, boatCv.width, boatCv.height); o.globalCompositeOperation = 'source-atop';
      for (let i = 0; i < CELLS; i++) { const [a, b] = this.cellX(i), v = S.lv[i], wy = HULL.bot - v * (HULL.bot - HULL.top + 8);
        const wg = o.createLinearGradient(0, (wy - by) * R, 0, (HULL.bot - by) * R); wg.addColorStop(0, `rgba(${v > 0.8 ? '150,190,230' : '110,170,210'},.78)`); wg.addColorStop(1, 'rgba(36,74,98,.85)'); o.fillStyle = wg;
        o.beginPath(); o.moveTo((a - bx) * R, (HULL.bot + 20 - by) * R); for (let x = a; x <= b; x += 6) o.lineTo((x - bx) * R, (wy + Math.sin(x * 0.2 + S.t * 6) * 2 - by) * R); o.lineTo((b - bx) * R, (HULL.bot + 20 - by) * R); o.fill();
        if (v > 0.8) { o.fillStyle = `rgba(255,120,90,${0.2 + 0.2 * Math.sin(S.t * 12)})`; o.fillRect((a - bx) * R, (HULL.top - 6 - by) * R, (b - a) * R, 10 * R); } }
      g.drawImage(boatCv, bx, by, bw, bh); }
    else { g.fillStyle = '#5a3a22'; hull(); g.fill(); }
    if (!A) { g.save(); hull(); g.clip(); g.fillStyle = '#3a2414'; g.fillRect(HULL.x0, HULL.top, HULL.x1 - HULL.x0, HULL.bot - HULL.top); // 배 안
    for (let i = 0; i < CELLS; i++) { const [a, b] = this.cellX(i), v = S.lv[i], wy = HULL.bot - v * (HULL.bot - HULL.top + 8);
      const wg = g.createLinearGradient(0, wy, 0, HULL.bot); wg.addColorStop(0, A ? 'rgba(110,170,210,.8)' : v > 0.8 ? '#5a8ab0' : '#4a7a9c'); wg.addColorStop(1, A ? 'rgba(36,74,98,.85)' : '#244a62'); g.fillStyle = wg;
      g.beginPath(); g.moveTo(a, HULL.bot); for (let x = a; x <= b; x += 6) g.lineTo(x, wy + Math.sin(x * 0.2 + S.t * 6) * 2); g.lineTo(b, HULL.bot); g.fill();
      if (v > 0.8) { g.fillStyle = `rgba(255,120,90,${0.25 + 0.2 * Math.sin(S.t * 12)})`; g.fillRect(a, HULL.top, b - a, 6); } }
    g.restore(); }
    g.strokeStyle = A ? 'rgba(90,60,36,.85)' : '#7a5434'; g.lineWidth = A ? 3 : 5; for (let i = 1; i < CELLS; i++) { const [a] = this.cellX(i); g.beginPath(); g.moveTo(a, HULL.top - 8); g.lineTo(a, HULL.bot - 4); g.stroke(); } // 가름대
    if (!A) { g.strokeStyle = '#8a6040'; g.lineWidth = 4; g.beginPath(); g.moveTo(HULL.x0 - 14, HULL.top - 12); g.lineTo(HULL.x1 + 14, HULL.top - 18); g.stroke();
    // 돛대
    g.strokeStyle = '#4a3020'; g.lineWidth = 5; g.beginPath(); g.moveTo(170, HULL.top); g.lineTo(170 + S.rock * 60, 110); g.stroke(); }
    // 제자들(칸마다 둘) — 물 위로 몸
    if (!A) for (let i = 0; i < CELLS; i++) { if (i === 3) continue; const [a, b] = this.cellX(i);
      for (let k = 0; k < 2; k++) { const x = a + 22 + k * 36, y = HULL.top - 6; g.fillStyle = ['#7a5a3e', '#5a4a6a', '#4a5a4a'][(i + k) % 3]; g.beginPath(); g.ellipse(x, y, 8, 14, 0, 0, 7); g.fill(); g.fillStyle = '#c99a6a'; g.beginPath(); g.arc(x, y - 17, 5.5, 0, 7); g.fill(); } }
    // 고물에서 베개를 베고 주무시는 분(4:38) — 끝에는 일어나신다
    const [sa] = this.cellX(3);
    if (A) { if (calm <= 0) spr(g, 'e28/sleep', sa + 40, HULL.top + 6, 30); }
    else if (calm <= 0) { g.fillStyle = '#c8b890'; g.beginPath(); g.ellipse(sa + 70, HULL.top - 4, 10, 6, 0, 0, 7); g.fill(); g.fillStyle = '#f2ece0'; g.beginPath(); g.ellipse(sa + 40, HULL.top + 2, 28, 8, -0.08, 0, 7); g.fill(); g.fillStyle = '#c99a6a'; g.beginPath(); g.arc(sa + 68, HULL.top - 10, 6, 0, 7); g.fill(); g.fillStyle = '#5a3a24'; g.beginPath(); g.arc(sa + 70, HULL.top - 12, 6, Math.PI * 0.5, Math.PI * 1.6); g.fill(); }
    else if (!A) { const x = sa + 46, y = HULL.top - 6; g.fillStyle = '#f2ece0'; g.beginPath(); g.ellipse(x, y - 6, 9, 20, 0, 0, 7); g.fill(); g.fillStyle = '#b5523e'; g.fillRect(x - 8, y - 22, 3, 22);
      g.strokeStyle = '#f2ece0'; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(x + 4, y - 18); g.lineTo(x + 18, y - 40 * calm); g.stroke(); g.fillStyle = '#c99a6a'; g.beginPath(); g.arc(x, y - 30, 6, 0, 7); g.fill(); g.fillStyle = '#5a3a24'; g.beginPath(); g.arc(x, y - 32, 6.2, Math.PI, 0); g.fill(); }
    // 바가지
    if (S.bucket) { const [a, b] = this.cellX(S.bucket.i), k = S.bucket.t / 0.35, cx = (a + b) / 2, side = S.bucket.i < 2 ? -1 : 1;
      g.save(); g.translate(cx + side * k * 30, HULL.top - 20 - Math.sin(k * Math.PI) * 40); g.rotate(side * k * 2); g.scale(1.6, 1.6); g.fillStyle = '#9a7040'; g.beginPath(); g.arc(0, 0, 10, 0, Math.PI); g.fill(); g.strokeStyle = '#6a4a28'; g.lineWidth = 1.5; g.stroke(); g.restore(); }
    g.restore();
    for (const d of S.drops) { g.fillStyle = d.c ? `rgba(200,225,245,${clamp(d.life * 2, 0, 1)})` : `rgba(170,210,240,${clamp(d.life * 2, 0, 1)})`; g.beginPath(); g.arc(d.x, d.y, 2.2, 0, 7); g.fill(); }
    // 칸 번호 + 바가지 준비
    if (!calm) { g.save(); g.font = '700 11px "Noto Sans KR",sans-serif'; g.textAlign = 'center'; for (let i = 0; i < CELLS; i++) { const [a, b] = this.cellX(i); g.fillStyle = 'rgba(255,255,255,.55)'; g.fillText(`${Math.round(S.lv[i] * 100)}%`, (a + b) / 2, HULL.bot + 20); }
      g.font = '800 14px "Noto Sans KR",sans-serif'; g.textAlign = 'left'; g.fillStyle = '#e8eef4'; g.fillText(tr('칸을 눌러 물을 퍼내요'), 14, 26); g.restore(); }
    floatMsg(g, S.msg);
  },
  end(g, k, S) { // 그분이 깨어 일어나 바람을 꾸짖으시니 아주 잔잔해진다(4:39)
    S.waves = []; S.fx.storm?.(Math.max(0, 0.6 - k * 1.2)); if (!S.calmSnd && k > 0.15) { S.calmSnd = 1; S.fx.play('calm'); }
    S.t += 0.016; S.lv = S.lv.map(v => Math.max(0.05, v - 0.004));
    for (const d of S.drops) { d.vy += 500 * 0.016; d.x += d.vx * 0.016; d.y += d.vy * 0.016; d.life -= 0.016; } S.drops = S.drops.filter(d => d.life > 0);
    this.draw(g, S, clamp(k * 1.6, 0, 1));
    if (k > 0.35) { g.save(); g.globalAlpha = clamp((k - 0.35) * 2, 0, 1); g.fillStyle = 'rgba(20,30,45,.78)'; g.fillRect(0, 40, W, 84);
      g.font = '700 17px "Gowun Batang",serif'; g.textAlign = 'center'; g.fillStyle = '#f2f6ff'; g.fillText(tr('잠잠하라 고요하라 하시니'), W / 2, 70); g.fillText(tr('바람이 그치고 아주 잔잔하여지더라'), W / 2, 94);
      g.font = '600 11px "Noto Sans KR",sans-serif'; g.fillStyle = '#c0cce0'; g.fillText(tr('막 4:39'), W / 2, 113); g.restore(); }
  },
};

/* ---------- 하늘에서 내린 만나 (출 16:13–21): 장막마다 먹을 만큼 거두기 — 받기 + 어림 ---------- */
// 이슬이 걷힌 아침, 하늘에서 깟씨 같은 만나가 내린다. 바구니를 좌우로 끌어 받는다. 알이 크면 많이, 작으면 조금 담긴다.
// 장막마다 식구 수만큼(한 사람에 한 오멜, 16:16) — 초록 띠 안에서 장막을 누르면 담아 준다. 넘치면 남은 것에 벌레가 생겨 쏟고 다시(16:20).
// 해가 뜨거워지면 만나가 녹아(16:21) 점점 덜 내린다
const MANNA_TENTS = [2, 3, 2, 4], BASKET_Y = 392, BASKET_W = 70, BAND = 0.25;
const manna = {
  title: tr('하늘에서 내린 만나'), task: tr('장막마다 식구 수만큼 거두기'),
  ask: [tr('아침마다 이슬이 마르면 들판에 작고 둥근 것이 서리처럼 깔려 있었단다.'), tr('각 사람이 먹을 만큼만 거두어라 — 한 사람에 한 오멜씩. 남기면 벌레가 생긴다!')],
  quote: tr('각 사람은 먹을 만큼만 거둘지니 곧 너희 사람 수효대로 한 사람에 한 오멜씩'), ref: tr('출 16:16'),
  help: tr('바구니를 좌우로 끌어 내리는 만나를 받아요. 큰 알은 많이, 작은 알은 조금 담겨요.<br>막대가 초록 띠 안일 때 아래 장막을 눌러 담아요. 넘치면 벌레가 생겨 쏟아요. 해가 뜨거워지면 만나가 녹아요.'),
  art: ['m12/bg', 'm12/tent', 'm12/basket'],
  seconds: 40,
  init() { return { bx: 200, tx: 200, fl: [], amt: 0, tent: 0, done: [], t: 0, msg: null, spawn: 0, worms: 0, sparks: [], hop: 0 }; },
  target: S => MANNA_TENTS[S.tent] || 0,
  update(dt, S) {
    S.t += dt; if (S.msg) S.msg.at -= dt; S.worms = Math.max(0, S.worms - dt); S.hop = Math.max(0, S.hop - dt * 4);
    S.bx += (S.tx - S.bx) * Math.min(1, dt * 16);
    const heat = clamp((S.t - 26) / 14, 0, 0.6); // 해가 뜨거워지면 덜 내린다
    if ((S.spawn -= dt) <= 0) { S.spawn = rnd(0.09, 0.15) / (1 - heat); const big = Math.random() < 0.4;
      S.fl.push({ x: rnd(20, W - 20), y: -8, v: rnd(70, 110), ph: rnd(0, 7), a: big ? rnd(0.45, 0.7) : rnd(0.12, 0.25), r: big ? 6 : 3.4 }); }
    for (const f of S.fl) { f.y += f.v * dt; f.x += Math.sin(S.t * 2 + f.ph) * 14 * dt;
      if (!f.got && f.y > BASKET_Y - 6 && f.y < BASKET_Y + 8 && Math.abs(f.x - S.bx) < BASKET_W / 2) { f.got = 1; if (!S.worms) { S.amt += f.a; S.fx.play(f.a > 0.4 ? 'drop' : 'tick'); S.hop = 1; } } }
    S.fl = S.fl.filter(f => !f.got && f.y < 470);
    if (S.amt > this.target(S) + BAND && !S.worms) { S.worms = 1.0; S.amt = Math.max(0, this.target(S) - 1.2); S.fx.play('miss'); S.msg = { t: tr('넘쳐서 벌레가 생겼어요 — 덜어 냈어요'), c: '#ffc2a0', at: 1.4, x: W / 2, y: 260 }; } // 16:20
    for (const p of S.sparks) { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; } S.sparks = S.sparks.filter(p => p.life > 0);
  },
  tentX: i => 44 + i * 78,
  down(x, y, S) { if (y > 430) this.give(S); else S.tx = clamp(x, 30, W - 30); },
  move(x, y, S) { if (y <= 430) S.tx = clamp(x, 30, W - 30); },
  give(S) { const T = this.target(S); if (!T) return;
    if (Math.abs(S.amt - T) <= BAND) { S.done.push(S.amt); S.fx.play('coin'); S.msg = { t: Math.abs(S.amt - T) < 0.07 ? tr('꼭 맞게!') : tr('알맞게 담았어요'), c: '#ffe29a', at: 0.9, x: this.tentX(S.tent), y: 420 };
      for (let i = 0; i < 12; i++) S.sparks.push({ x: this.tentX(S.tent), y: 450, vx: rnd(-50, 50), vy: rnd(-90, -30), life: rnd(0.4, 0.8) }); S.amt = 0; S.tent++; }
    else if (S.amt < T) { S.msg = { t: tr('아직 모자라요'), c: '#e8e0c8', at: 0.7, x: this.tentX(S.tent), y: 420 }; S.fx.play('miss'); } },
  up() {},
  key(k, S) { if (k === 'ArrowLeft') { S.tx = clamp(S.tx - 40, 30, W - 30); return; } if (k === 'ArrowRight') { S.tx = clamp(S.tx + 40, 30, W - 30); return; } if (k === ' ' || k === 'Enter') { this.give(S); return; } return false; },
  won: S => S.tent >= MANNA_TENTS.length,
  failText: () => tr('해가 뜨거워 만나가 다 녹았어요'),
  draw(g, S) {
    const heat = clamp(S.t / this.seconds, 0, 1);
    const A = bgArt(g, 'm12/bg'); if (A && heat > 0.4) { g.fillStyle = `rgba(255,200,120,${(heat - 0.4) * 0.35})`; g.fillRect(0, 0, W, H); } // 해가 뜨거워진다
    if (!A) { const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, `rgb(${150 + heat * 80},${180 + heat * 40},${210 - heat * 40})`); sky.addColorStop(0.6, `rgb(${240},${215 - heat * 20},${170 - heat * 30})`); sky.addColorStop(1, '#d8b47a'); g.fillStyle = sky; g.fillRect(0, 0, W, H);
    g.fillStyle = `rgba(255,${240 - heat * 60},${190 - heat * 90},.9)`; g.beginPath(); g.arc(330, 150 - heat * 110, 18 + heat * 6, 0, 7); g.fill(); // 해가 높이 뜬다
    g.fillStyle = '#c9a46a'; g.beginPath(); g.moveTo(0, 300); g.quadraticCurveTo(200, 270, 400, 300); g.lineTo(400, H); g.lineTo(0, H); g.fill();
    g.fillStyle = `rgba(255,255,255,${0.3 * (1 - heat)})`; for (let i = 0; i < 40; i++) g.fillRect((i * 47) % W, 300 + (i * 23) % 120, 2, 1); } // 이슬과 들판의 서리 같은 것(16:14)
    // 장막들 — 지금 채울 장막은 빛난다
    for (let i = 0; i < MANNA_TENTS.length; i++) { const x = this.tentX(i), y = 470, cur = i === S.tent, ok = i < S.tent;
      if (cur) { g.fillStyle = 'rgba(255,236,170,.35)'; g.beginPath(); g.ellipse(x, y - 10, 40, 34, 0, 0, 7); g.fill(); }
      if (!spr(g, 'm12/tent', x, y + 16, 50, { a: ok ? 0.75 : 1 })) { g.fillStyle = ok ? '#8a7a58' : '#6a5238'; g.beginPath(); g.moveTo(x - 32, y + 14); g.lineTo(x, y - 30); g.lineTo(x + 32, y + 14); g.fill();
      g.fillStyle = '#2a1e12'; g.beginPath(); g.moveTo(x - 7, y + 14); g.lineTo(x, y - 6); g.lineTo(x + 7, y + 14); g.fill(); }
      for (let k = 0; k < MANNA_TENTS[i]; k++) { g.fillStyle = ok ? '#e8dcc0' : '#d8c8a0'; g.beginPath(); g.arc(x - (MANNA_TENTS[i] - 1) * 5 + k * 10, y - 38, 3.4, 0, 7); g.fill(); } // 식구 수
      g.font = '800 12px "Noto Sans KR",sans-serif'; g.textAlign = 'center'; g.fillStyle = ok ? '#4a6a2a' : '#3a2a14'; g.fillText(ok ? '✓' : tr('{0}명', MANNA_TENTS[i]), x, y + 28); }
    // 내리는 만나
    for (const f of S.fl) { const fg = g.createRadialGradient(f.x - f.r * 0.3, f.y - f.r * 0.3, 0.5, f.x, f.y, f.r); fg.addColorStop(0, '#ffffff'); fg.addColorStop(1, '#e8dcc0'); g.fillStyle = 'rgba(60,40,20,.3)'; g.beginPath(); g.arc(f.x + 1, f.y + 1.5, f.r + 0.6, 0, 7); g.fill(); g.fillStyle = fg; g.beginPath(); g.arc(f.x, f.y, f.r + 0.6, 0, 7); g.fill(); g.strokeStyle = 'rgba(110,80,40,.75)'; g.lineWidth = 1; g.stroke(); /* 밝은 하늘·모래 위에서도 보이게 그림자와 테 */ if (f.a > 0.4) { g.strokeStyle = 'rgba(255,240,200,.6)'; g.lineWidth = 1; g.beginPath(); g.arc(f.x, f.y, f.r + 2.5, 0, 7); g.stroke(); } }
    // 바구니와 오멜 막대
    const T = this.target(S), bx = S.bx, by = BASKET_Y - S.hop * 3;
    const BA = spr(g, 'm12/basket', bx, by + 28, 36, { a: S.worms ? 0.7 : 1 });
    if (!BA) { g.fillStyle = S.worms ? '#7a6a48' : '#a8804a'; g.beginPath(); g.moveTo(bx - BASKET_W / 2, by); g.lineTo(bx + BASKET_W / 2, by); g.lineTo(bx + BASKET_W / 2 - 8, by + 26); g.lineTo(bx - BASKET_W / 2 + 8, by + 26); g.fill();
    g.strokeStyle = '#6a4a28'; g.lineWidth = 1; for (let k = 4; k < 26; k += 5) { g.beginPath(); g.moveTo(bx - BASKET_W / 2 + k * 0.3, by + k); g.lineTo(bx + BASKET_W / 2 - k * 0.3, by + k); g.stroke(); } }
    if (S.amt > 0) { g.fillStyle = '#fffaf0'; g.beginPath(); g.ellipse(bx, by + 2, (BASKET_W / 2 - 4) * Math.min(1, S.amt / (T || 1) + 0.2), 4 + Math.min(6, S.amt * 2), 0, Math.PI, 0); g.fill(); }
    if (S.worms) { g.strokeStyle = '#6a5a3a'; g.lineWidth = 2; for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(bx - 20 + k * 10, by + 8); g.quadraticCurveTo(bx - 16 + k * 10, by + 2 + Math.sin(S.t * 12 + k) * 4, bx - 12 + k * 10, by + 8); g.stroke(); } }
    if (T) { const gx = 16, gy = 90, gh = 190, mx = T + 1, yOf = v => gy + gh * (1 - v / mx);
      g.fillStyle = 'rgba(0,0,0,.25)'; rrect(g, gx, gy, 16, gh, 6); g.fill();
      g.fillStyle = 'rgba(120,200,110,.55)'; g.fillRect(gx - 3, yOf(T + BAND), 22, yOf(T - BAND) - yOf(T + BAND));
      const v = Math.min(S.amt, mx); g.fillStyle = S.amt > T + BAND ? '#ff8a6a' : Math.abs(S.amt - T) <= BAND ? '#9ee08a' : '#fff4d8'; g.fillRect(gx + 3, yOf(v), 10, gy + gh - yOf(v));
      g.font = '700 11px "Noto Sans KR",sans-serif'; g.textAlign = 'left'; g.fillStyle = '#3a2a14'; for (let k = 1; k <= T; k++) g.fillRect(gx + 16, yOf(k), 5, 1.5); g.fillText(tr('{0}오멜', T), gx + 22, yOf(T) + 4);
      g.font = '800 14px "Noto Sans KR",sans-serif'; g.fillText(tr('장막 {0} / {1} — {2}명', S.tent + 1, MANNA_TENTS.length, T), 14, 26);
      const inb = Math.abs(S.amt - T) <= BAND && !S.worms, lab = tr('{0} / {1} 오멜', S.amt.toFixed(1), T); // 바구니 위에 담긴 양 — 눈을 바구니에 둔 채로
      g.font = '800 13px "Noto Sans KR",sans-serif'; g.textAlign = 'center'; g.lineWidth = 4; g.strokeStyle = 'rgba(40,26,10,.75)'; g.strokeText(lab, bx, by - 12); g.fillStyle = inb ? '#b6f0a0' : S.amt > T ? '#ffb090' : '#fff4d8'; g.fillText(lab, bx, by - 12);
      if (inb) { g.font = '900 15px "Noto Sans KR",sans-serif'; g.strokeText(tr('지금! 아래 장막을 눌러요'), W / 2, 352); g.fillStyle = `rgba(255,236,170,${0.7 + 0.3 * Math.sin(S.t * 10)})`; g.fillText(tr('지금! 아래 장막을 눌러요'), W / 2, 352); } }
    for (const p of S.sparks) { g.fillStyle = `rgba(255,236,170,${clamp(p.life * 2, 0, 1)})`; star(g, p.x, p.y, 4); }
    floatMsg(g, S.msg);
  },
  end(g, k, S) { S.fl = []; this.update(0.016, S); this.draw(g, S);
    if (k > 0.3) { g.save(); g.globalAlpha = clamp((k - 0.3) * 2, 0, 1); g.fillStyle = 'rgba(50,34,14,.8)'; g.fillRect(0, 140, W, 106);
      g.font = '700 16px "Gowun Batang",serif'; g.textAlign = 'center'; g.fillStyle = '#fff0d6'; g.fillText(tr('많이 거둔 자도 남음이 없고'), W / 2, 170); g.fillText(tr('적게 거둔 자도 부족함이 없이'), W / 2, 194); g.fillText(tr('각 사람은 먹을 만큼 거두었더라'), W / 2, 218);
      g.font = '600 11px "Noto Sans KR",sans-serif'; g.fillStyle = '#e6cfa6'; g.fillText(tr('출 16:18'), W / 2, 237); g.restore(); }
  },
};

/* ---------- 엔게디 굴의 옷자락 (삼상 24:3–7): 사울이 돌아보지 않을 때만 — 살금살금 ---------- */
// 누르고 있으면 다윗이 굴 안쪽 어둠에서 사울 쪽으로 살금살금 다가가고, 떼면 멈춘다. 사울은 가끔 뒤척이다(먼저 '음…' 하고 고개가 움찔) 굴 안쪽을 돌아본다.
// 돌아보는 동안 움직이면 의심이 찬다. 겉옷 자락에 닿으면 그가 돌아보지 않을 때 눌러 자락을 베고(24:4), 다시 어둠 속으로 돌아오면 성공
const CAVE_DARK = 70, ROBE_X = 180;
const cave = {
  title: tr('엔게디 굴의 옷자락'), task: tr('사울 몰래 겉옷 자락을 베고 돌아오기'),
  ask: [tr('사울이 바로 우리가 숨은 굴로 들어왔단다. 사람들은 하나님이 원수를 내 손에 넘기셨다고 속삭였지.'), tr('그러나 여호와께서 기름 부으신 이를 해칠 수는 없어 — 겉옷 자락만 가만히 베고 돌아오너라. 그가 돌아볼 땐 멈추고!')],
  quote: tr('다윗이 일어나서 사울의 겉옷 자락을 가만히 베니라'), ref: tr('삼상 24:4'),
  help: tr('누르고 있으면 살금살금 다가가고, 떼면 멈춰요. 사울이 "음…" 하고 움찔하면 곧 돌아봐요 — 그때는 멈춰요.<br>겉옷 자락에 닿으면 눌러서 베고, 다시 왼쪽 어둠까지 돌아와요.'),
  seconds: 22, art: ['d16/bg', 'd16/saul-a', 'd16/saul-b', 'd16/david-sneak'],
  init() { return { x: 36, hold: false, phase: 'go', sus: 0, st: 'calm', stT: rnd(1.6, 2.6), t: 0, msg: null, cut: 0, stepT: 0, look: 0, chips: [] }; },
  update(dt, S) {
    S.t += dt; if (S.msg) S.msg.at -= dt; S.cut = Math.max(0, S.cut - dt);
    // 사울: 편히 있음 → 뒤척임(0.65초, 미리 알림) → 돌아봄(1.0–1.8초) → 편히
    if ((S.stT -= dt) <= 0) {
      if (S.st === 'calm') { S.st = 'stir'; S.stT = 0.45; S.fx.play('hum'); }
      else if (S.st === 'stir') { if (Math.random() < 0.25) { S.st = 'calm'; S.stT = rnd(0.8, 1.6); } else { S.st = 'look'; S.stT = rnd(1.0, 1.8); } } // 뒤척이기만 하고 마는 때도 있다
      else { S.st = 'calm'; S.stT = rnd(1.1, 2.4) / (1 + S.t * 0.015); }
    }
    S.look += ((S.st === 'look' ? 1 : 0) - S.look) * Math.min(1, dt * 8);
    const goal = S.phase === 'go' ? ROBE_X : CAVE_DARK - 40, dir = Math.sign(goal - S.x);
    if (S.hold && S.phase !== 'cut') { S.x += dir * 40 * dt; if ((S.stepT -= dt) <= 0) { S.stepT = 0.32; S.fx.play('creep'); } }
    if (S.phase === 'go' && S.x >= ROBE_X) { S.x = ROBE_X; S.phase = 'cut'; S.hold = false; S.msg = { t: tr('지금 — 눌러서 자락을 베요'), c: '#ffe29a', at: 1.4, x: 220, y: 220 }; }
    // 의심: 돌아보는 눈길 안에서 움직이면 빠르게, 가만히 있어도 밝은 곳(굴 어귀 가까이)이면 천천히
    const near = clamp((S.x - CAVE_DARK) / (ROBE_X - CAVE_DARK), 0, 1);
    if (S.look > 0.5) S.sus += ((S.hold ? 1.4 : 0) + near * 0.12) * S.look * dt; else S.sus = Math.max(0, S.sus - 0.08 * dt);
    S.sus = Math.min(1, S.sus);
    for (const c of S.chips) { c.vy += 300 * dt; c.x += c.vx * dt; c.y += c.vy * dt; c.r += c.vr * dt; if (c.y > 420) { c.y = 420; c.vy = 0; c.vx *= 0.8; c.vr = 0; } }
  },
  down(x, y, S) {
    if (S.phase === 'cut') {
      if (S.look > 0.4) { S.sus = Math.min(1, S.sus + 0.5); S.fx.play('miss'); S.msg = { t: tr('돌아보고 있어요!'), c: '#ffb38a', at: 0.8, x: 240, y: 220 }; return; }
      S.phase = 'back'; S.cut = 0.6; S.fx.play('snip'); S.chips.push({ x: ROBE_X - 4, y: 400, vx: -30, vy: -60, r: 0, vr: -2 });
      S.msg = { t: tr('자락을 베었어요 — 이제 돌아가요'), c: '#ffe29a', at: 1.3, x: 200, y: 220 }; return; }
    S.hold = true; },
  up(S) { S.hold = false; },
  key(k, S) { if (k === ' ' || k === 'ArrowRight' || k === 'ArrowLeft') { if (S.phase === 'cut') this.down(0, 0, S); else { S.hold = true; clearTimeout(S._kt); S._kt = setTimeout(() => S.hold = false, 160); } return; } return false; },
  won: S => S.phase === 'back' && S.x <= CAVE_DARK - 38,
  lost: S => S.sus >= 1,
  failText: S => S.sus >= 1 ? tr('사울이 알아챘어요') : tr('사울이 굴을 나갔어요'),
  draw(g, S) {
    if (bgArt(g, 'd16/bg')) this.drawArt(g, S); else this.drawVec(g, S);
    // 의심 막대 + 할 일
    g.save(); g.font = '800 13px "Noto Sans KR",sans-serif'; g.textAlign = 'left'; g.fillStyle = '#efe2cc'; g.fillText(S.phase === 'go' ? tr('겉옷 자락까지 살금살금') : S.phase === 'cut' ? tr('자락을 베어요') : tr('어둠 속으로 돌아가요'), 14, 26);
    g.fillText(tr('의심'), 14, 50); g.fillStyle = 'rgba(255,255,255,.15)'; g.fillRect(50, 40, 100, 12); g.fillStyle = S.sus > 0.66 ? '#ff7a5a' : '#ffb36a'; g.fillRect(50, 40, 100 * S.sus, 12); g.restore();
    floatMsg(g, S.msg);
  },
  drawVec(g, S) {
    // 굴 안: 오른쪽 어귀로 빛이 들고, 왼쪽 안쪽은 캄캄
    g.fillStyle = '#120d0a'; g.fillRect(0, 0, W, H);
    const lg = g.createLinearGradient(0, 0, W, 0); lg.addColorStop(0, 'rgba(0,0,0,0)'); lg.addColorStop(0.45, 'rgba(120,90,60,.25)'); lg.addColorStop(1, 'rgba(255,220,160,.55)'); g.fillStyle = lg; g.fillRect(0, 0, W, H);
    g.fillStyle = '#f2dca8'; g.beginPath(); g.moveTo(W, 120); g.quadraticCurveTo(356, 220, 380, 420); g.lineTo(W, 420); g.fill(); // 굴 어귀의 바깥 빛
    g.fillStyle = '#2a1e16'; g.beginPath(); g.moveTo(0, 0); g.lineTo(W, 0); g.lineTo(W, 110); g.quadraticCurveTo(300, 70, 220, 96); g.quadraticCurveTo(120, 120, 0, 90); g.fill(); // 천장
    g.beginPath(); g.moveTo(0, 420); g.lineTo(W, 420); g.lineTo(W, H); g.lineTo(0, H); g.fill(); // 바닥
    g.fillStyle = 'rgba(255,230,190,.06)'; for (let i = 0; i < 18; i++) { g.beginPath(); g.ellipse((i * 61) % W, 426 + (i * 13) % 70, 14 + (i % 4) * 5, 4, 0, 0, 7); g.fill(); } // 바닥 돌
    g.fillStyle = '#1e1610'; for (let i = 0; i < 7; i++) { g.beginPath(); g.moveTo(30 + i * 52, 96 - (i % 2) * 10); g.lineTo(44 + i * 52, 140 + (i % 3) * 16); g.lineTo(56 + i * 52, 96); g.fill(); } // 종유석
    // 안쪽 어둠 속 다윗의 사람들 — 눈만 반짝
    g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(0, 90, CAVE_DARK, 330);
    for (let i = 0; i < 5; i++) { const ex = 12 + (i % 3) * 18, ey = 300 + i * 22; if (Math.sin(S.t * 0.7 + i * 3) > -0.8) { g.fillStyle = 'rgba(255,240,200,.55)'; g.fillRect(ex, ey, 2, 1.5); g.fillRect(ex + 5, ey, 2, 1.5); } }
    // 사울 — 어귀 가까이 등을 돌리고 앉아 있다. 겉옷 자락이 안쪽으로 펼쳐져 있다
    const sx = 324, sy = 418, turn = S.look, stir = S.st === 'stir' ? Math.sin(S.t * 40) * 1.5 : 0;
    g.save(); g.translate(sx, sy); g.scale(1.6, 1.6);
    g.fillStyle = '#6a2a3a'; g.beginPath(); g.moveTo(-20, 0); g.quadraticCurveTo(-24, -40, 0, -52); g.quadraticCurveTo(22, -40, 18, 0); g.fill(); // 겉옷
    g.fillStyle = S.cut ? '#8a3a4a' : '#6a2a3a'; g.beginPath(); g.moveTo(-18, -4); g.quadraticCurveTo(-46, 2, -60, 8); g.lineTo(-22, 8); g.fill(); // 펼쳐진 자락
    if (S.phase === 'back' || S.phase === 'done') { g.fillStyle = '#120d0a'; g.beginPath(); g.moveTo(-60, 8); g.lineTo(-50, 2); g.lineTo(-44, 8); g.fill(); } // 베어 낸 귀퉁이
    g.fillStyle = '#d8b24a'; g.fillRect(-14, -40, 28, 3);
    g.fillStyle = '#c99a6a'; g.beginPath(); g.arc(-turn * 6 + stir, -60, 8, 0, 7); g.fill(); // 머리 — 돌아보면 안쪽(왼쪽)으로
    g.fillStyle = '#3a2416'; g.beginPath(); g.arc(-turn * 6 + 3 * (1 - turn) + stir, -62, 8.4, Math.PI * (0.9 - turn * 0.6), Math.PI * (2.1 - turn * 0.6)); g.fill();
    g.fillStyle = '#e0b850'; g.fillRect(-7 - turn * 6 + stir, -72, 14, 4); for (let k = 0; k < 3; k++) g.fillRect(-6 + k * 5 - turn * 6 + stir, -76, 2.5, 4); // 왕관
    if (turn > 0.3) { g.fillStyle = '#fff'; g.fillRect(-12 - turn * 4, -61, 2.4, 2); } // 눈
    g.restore();
    if (S.look > 0.05) { const hx = sx - 10, hy = sy - 96, cone = g.createRadialGradient(hx, hy, 4, hx, hy, 280); cone.addColorStop(0, `rgba(255,120,90,${0.28 * S.look})`); cone.addColorStop(1, 'rgba(255,120,90,0)');
      g.fillStyle = cone; g.beginPath(); g.moveTo(hx, hy); g.lineTo(30, 170); g.lineTo(30, 440); g.closePath(); g.fill(); } // 눈길
    if (S.st === 'stir') { g.font = '800 14px "Noto Sans KR",sans-serif'; g.textAlign = 'center'; g.fillStyle = '#ffd08a'; g.fillText(tr('음…'), sx - 8, sy - 132); }
    for (const c of S.chips) { g.save(); g.translate(c.x, c.y); g.rotate(c.r); g.fillStyle = '#6a2a3a'; g.beginPath(); g.moveTo(-6, -3); g.lineTo(7, -2); g.lineTo(3, 4); g.fill(); g.restore(); }
    // 다윗 — 살금살금(무릎을 굽힌 실루엣), 칼
    const dx = S.x, dy = 420, bob = S.hold ? Math.abs(Math.sin(S.t * 8)) * 2 : 0, lit = clamp((dx - CAVE_DARK) / 220, 0, 1);
    g.save(); g.translate(dx, dy - bob); g.scale(S.phase === 'back' ? -2.1 : 2.1, 2.1);
    g.fillStyle = `rgb(${30 + lit * 60},${24 + lit * 46},${20 + lit * 34})`;
    g.beginPath(); g.ellipse(0, -16, 7, 11, 0.5, 0, 7); g.fill(); g.beginPath(); g.arc(6, -28, 5, 0, 7); g.fill();
    g.fillRect(-5, -8, 3, 8); g.fillRect(3, -6, 3, 6);
    g.strokeStyle = `rgba(220,220,230,${0.3 + lit * 0.5})`; g.lineWidth = 1.4; g.beginPath(); g.moveTo(8, -16); g.lineTo(16, -20); g.stroke(); // 칼
    g.restore();
    if (S.phase === 'cut') { g.strokeStyle = `rgba(255,226,150,${0.6 + 0.4 * Math.sin(S.t * 10)})`; g.lineWidth = 2; g.beginPath(); g.arc(ROBE_X - 2, 420, 20, 0, 7); g.stroke(); }
  },
  drawArt(g, S) { // 그림 조각으로: 굴(바탕) · 사울(등 돌림 ↔ 돌아봄을 겹쳐 바꿈) · 다윗
    g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, 0, CAVE_DARK, H); // 안쪽 어둠
    for (let i = 0; i < 5; i++) { const ex = 12 + (i % 3) * 18, ey = 330 + i * 18; if (Math.sin(S.t * 0.7 + i * 3) > -0.8) { g.fillStyle = 'rgba(255,240,200,.6)'; g.fillRect(ex, ey, 2, 1.5); g.fillRect(ex + 5, ey, 2, 1.5); } }
    const stir = S.st === 'stir' ? Math.sin(S.t * 40) * 1.2 : 0;
    spr(g, 'd16/saul-a', 396 + stir, 446, 168, { ax: 1, a: 1 - S.look }); spr(g, 'd16/saul-b', 396 + stir, 446, 168, { ax: 1, a: S.look });
    if (S.look > 0.05) { const hx = 330, hy = 300, cone = g.createRadialGradient(hx, hy, 4, hx, hy, 300); cone.addColorStop(0, `rgba(255,110,80,${0.25 * S.look})`); cone.addColorStop(1, 'rgba(255,110,80,0)');
      g.fillStyle = cone; g.beginPath(); g.moveTo(hx, hy); g.lineTo(20, 200); g.lineTo(20, 470); g.closePath(); g.fill(); }
    if (S.st === 'stir') { g.font = '800 15px "Noto Sans KR",sans-serif'; g.textAlign = 'center'; g.lineWidth = 4; g.strokeStyle = 'rgba(30,18,10,.7)'; g.strokeText(tr('음…'), 300, 330); g.fillStyle = '#ffd08a'; g.fillText(tr('음…'), 300, 330); }
    for (const c of S.chips) { g.save(); g.translate(c.x, c.y); g.rotate(c.r); g.fillStyle = '#8a2a2a'; g.beginPath(); g.moveTo(-8, -3); g.lineTo(9, -2); g.lineTo(4, 5); g.fill(); g.restore(); }
    const lit = clamp((S.x - CAVE_DARK) / 220, 0, 1), bob = S.hold ? Math.abs(Math.sin(S.t * 8)) * 2 : 0;
    g.save(); g.filter = `brightness(${0.45 + lit * 0.55})`; spr(g, 'd16/david-sneak', S.x, 448 - bob, 128, { flip: S.phase === 'back' }); g.restore(); // 어둠 속에서는 어둡게
    if (S.phase === 'cut') { g.strokeStyle = `rgba(255,226,150,${0.6 + 0.4 * Math.sin(S.t * 10)})`; g.lineWidth = 2.5; g.beginPath(); g.arc(ROBE_X + 8, 440, 18, 0, 7); g.stroke(); }
  },
  end(g, k, S) { S.st = 'calm'; S.look = 0; S.hold = false; this.update(0.016, S); this.draw(g, S);
    if (k > 0.3) { g.save(); g.globalAlpha = clamp((k - 0.3) * 2, 0, 1); g.fillStyle = 'rgba(20,12,8,.82)'; g.fillRect(0, 140, W, 84);
      g.font = '700 16px "Gowun Batang",serif'; g.textAlign = 'center'; g.fillStyle = '#fff0d6'; g.fillText(tr('내 손을 들어 그를 치는 것은'), W / 2, 170); g.fillText(tr('여호와께서 금하시는 것이니'), W / 2, 194);
      g.font = '600 11px "Noto Sans KR",sans-serif'; g.fillStyle = '#e6cfa6'; g.fillText(tr('삼상 24:6'), W / 2, 213); g.restore(); }
  },
};

/* ---------- 독사를 떨어 버린 손 (행 28:1–6): 비 오는 멜리데 바닷가, 불 지피기 ---------- */
// 비에 불이 자꾸 사그라든다. 바닷가에 밀려온 나뭇가지를 끌어다 불에 넣어 불을 끝까지 키운다(28:3).
// 불이 반쯤 오르면 뜨거움에 나뭇단에서 독사가 나와 손에 달라붙는다. 그때는 불 쪽으로 손을 휙 뿌려 떨어 버린다(28:5). 그 사이에도 불은 줄어든다
const FIRE = [200, 380], FIRE_R = 52;
const viper = {
  title: tr('독사를 떨어 버린 손'), task: tr('비를 이기고 불을 끝까지 지피기'),
  ask: [tr('비가 오고 날이 추웠지. 섬 사람들이 불을 피워 우리 모두를 맞아 주었단다.'), tr('나뭇가지를 모아 불에 넣어 주렴 — 그리고 무엇이 손에 달라붙거든 불에 떨어 버려라!')],
  quote: tr('바울이 나무 한 묶음을 거두어 불에 넣으니 뜨거움으로 말미암아 독사가 나와 그 손을 물고 있는지라'), ref: tr('행 28:3'),
  help: tr('나뭇가지를 끌어다 불에 넣어요(큰 가지는 더 세게 타요). 비에 불이 줄어들어요.<br>독사가 손에 달라붙으면 화면을 누른 채 좌우로 세게 흔들어 불에 떨어 버려요. 불이 끝까지 오르면 성공.'),
  seconds: 22, art: ['a37/bg', 'a37/people', 'a37/viper', 'a37/stick'],
  init() { const S = { fire: 0.3, sticks: [], hold: null, px: 200, py: 300, vip: 0, bit: 0, flung: 0, t: 0, msg: null, sparks: [], drops: [], trail: [], spawn: 0, fed: 0 };
    for (let i = 0; i < 6; i++) this.addStick(S); return S; },
  addStick(S) { let x, y; do { x = rnd(30, 370); y = rnd(200, 470); } while (Math.hypot(x - FIRE[0], y - FIRE[1]) < 100);
    S.sticks.push({ x, y, a: rnd(0, 3.14), big: Math.random() < 0.35, born: S.t }); },
  update(dt, S) {
    S.t += dt; if (S.msg) S.msg.at -= dt;
    const rain = 0.042 + S.t * 0.001; S.fire = Math.max(0, S.fire - rain * dt);
    if ((S.spawn -= dt) <= 0 && S.sticks.length < 7) { this.addStick(S); S.spawn = rnd(0.4, 0.9); }
    if (S.vip === 1) { S.bit += dt; }
    S.trail.push([S.px, S.py, S.t]); S.trail = S.trail.filter(p => S.t - p[2] < 0.15);
    for (const p of S.sparks) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy -= 30 * dt; p.life -= dt; } S.sparks = S.sparks.filter(p => p.life > 0);
    if (Math.random() < S.fire * dt * 10) S.sparks.push({ x: FIRE[0] + rnd(-20, 20), y: FIRE[1] - 30, vx: rnd(-10, 10), vy: rnd(-60, -30), life: rnd(0.5, 1.1) });
    if (S.flung) S.flung = Math.max(0, S.flung - dt);
  },
  down(x, y, S) { S.px = x; S.py = y; S.trail = [];
    if (S.vip === 1) return; // 독사가 달린 손 — 뿌리기만
    let best = null, bd = 30; for (const st of S.sticks) { const d = Math.hypot(st.x - x, st.y - y); if (d < bd) { bd = d; best = st; } }
    if (best) { S.hold = best; S.sticks.splice(S.sticks.indexOf(best), 1); S.fx.play('pick'); } },
  move(x, y, S) { const dx = x - S.px; S.px = x; S.py = y;
    // 손을 좌우로 세게 흔든다 — 한쪽으로 22px 넘게 움직였다가 방향이 바뀔 때마다 한 번, 1.2초 안에 세 번이면 떨어진다.
    // 이벤트 한 번의 움직임으로 재면 마우스(이벤트가 아주 촘촘하다)에서는 흔들어도 세지지 않았다(사용자 2026-11)
    if (S.vip === 1 && dx) {
      const d = Math.sign(dx); if (d === S.shDir || !S.shDir) { S.run = (S.run || 0) + Math.abs(dx); S.shDir = d; return; }
      const far = (S.run || 0) >= 22; S.run = Math.abs(dx);
      if (far) { S.shakes = (S.shakes || []).filter(tt => S.t - tt < 1.2); S.shakes.push(S.t); S.fx.play('swish');
        if (S.shakes.length >= 3) { S.vip = 2; S.flung = 1; S.flX = x; S.flY = y; S.fx.play('crackle'); S.fire = Math.min(1, S.fire + 0.05);
          S.msg = { t: tr('불에 떨어 버렸어요 — 아무 해도 없어요'), c: '#ffe29a', at: 1.6, x: 200, y: 200 }; } }
      S.shDir = d; } },
  up(S, x, y) {
    if (!S.hold) return; const st = S.hold; S.hold = null;
    if (Math.hypot(S.px - FIRE[0], S.py - FIRE[1]) < FIRE_R + 10) {
      S.fire = Math.min(1, S.fire + (st.big ? 0.13 : 0.08)); S.fed++; S.fx.play('crackle');
      for (let i = 0; i < 10; i++) S.sparks.push({ x: FIRE[0] + rnd(-16, 16), y: FIRE[1] - 20, vx: rnd(-40, 40), vy: rnd(-120, -50), life: rnd(0.4, 0.9) });
      if (S.vip === 0 && S.fire > 0.5) { S.vip = 1; S.bit = 0; S.fx.play('hiss'); S.shakes = []; S.shDir = 0; S.run = 0; S.msg = { t: tr('독사가 나와 손을 물었어요! 손을 세게 흔들어요!'), c: '#ffb38a', at: 1.8, x: 200, y: 200 }; } // 28:3
    } else { st.x = S.px; st.y = S.py; S.sticks.push(st); }
  },
  won: S => S.fire >= 0.97 && S.vip === 2,
  lost: S => S.fire <= 0,
  failText: S => S.fire <= 0 ? tr('비에 불이 꺼졌어요') : tr('날이 저물었어요'),
  draw(g, S) {
    const A = bgArt(g, 'a37/bg');
    if (!A) { const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#4a5868'); sky.addColorStop(0.4, '#6a7480'); sky.addColorStop(1, '#5a5448'); g.fillStyle = sky; g.fillRect(0, 0, W, H);
    g.fillStyle = '#3a5060'; g.fillRect(0, 110, W, 70); // 바다
    g.strokeStyle = 'rgba(220,230,240,.35)'; g.lineWidth = 1.5; for (let i = 0; i < 8; i++) { g.beginPath(); g.moveTo(i * 60 - 20 + Math.sin(S.t + i) * 8, 140 + (i % 3) * 12); g.quadraticCurveTo(i * 60 + 10, 132 + (i % 3) * 12, i * 60 + 40, 140 + (i % 3) * 12); g.stroke(); }
    g.fillStyle = '#2a2420'; g.save(); g.translate(330, 132); g.rotate(-0.4); g.fillRect(-40, -6, 80, 12); g.fillRect(-4, -46, 6, 44); g.restore(); // 부서진 배(28:41의 고물)
    g.fillStyle = '#8a7a5e'; g.beginPath(); g.moveTo(0, 180); g.quadraticCurveTo(200, 170, 400, 182); g.lineTo(400, H); g.lineTo(0, H); g.fill(); } // 젖은 모래
    // 빗줄기
    g.strokeStyle = 'rgba(210,220,235,.35)'; g.lineWidth = 1; for (let i = 0; i < 70; i++) { const x = (i * 59 + S.t * 160) % 440 - 20, y = (i * 97 + S.t * 620) % H; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 4, y + 14); g.stroke(); }
    // 둘러선 사람들 — 섬 사람들과 배의 사람들
    if (A) spr(g, 'a37/people', FIRE[0], FIRE[1] - 34, 104); else for (let i = 0; i < 10; i++) { const a = Math.PI * (1.05 + i * 0.09), x = FIRE[0] + Math.cos(a) * 120, y = FIRE[1] - 40 + Math.sin(a) * 50; if (i % 2) continue;
      g.fillStyle = ['#5a4a3a', '#6a5a4a', '#4a3e30'][i % 3]; g.beginPath(); g.ellipse(x, y, 9, 16, 0, 0, 7); g.fill(); g.fillStyle = '#b08a64'; g.beginPath(); g.arc(x, y - 20, 6, 0, 7); g.fill(); }
    if (!A) for (const [x, y] of [[60, 300], [340, 300], [40, 360], [360, 370]]) { g.fillStyle = '#4e4032'; g.beginPath(); g.ellipse(x, y, 10, 18, 0, 0, 7); g.fill(); g.fillStyle = '#b08a64'; g.beginPath(); g.arc(x, y - 22, 6.5, 0, 7); g.fill(); }
    if (S.vip === 1) { g.font = '700 12px "Noto Sans KR",sans-serif'; g.textAlign = 'center'; g.fillStyle = 'rgba(255,240,220,.9)'; g.fillText(tr('“이 사람은 분명 살인한 자로다…”'), 200, 232); } // 28:4
    // 불
    const f = S.fire, fx = FIRE[0], fy = FIRE[1];
    const glow = g.createRadialGradient(fx, fy - 20, 4, fx, fy - 20, 60 + f * 110); glow.addColorStop(0, `rgba(255,180,90,${0.25 + f * 0.4})`); glow.addColorStop(1, 'rgba(255,150,60,0)'); g.fillStyle = glow; g.fillRect(0, 0, W, H);
    g.fillStyle = '#3a2a1a'; for (let i = 0; i < 5; i++) { g.save(); g.translate(fx, fy); g.rotate(-0.8 + i * 0.4); g.fillRect(-28, -3, 56, 6); g.restore(); } // 장작
    g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 6 + f * 14; i++) { const u = (i * 0.37) % 1; flame(g, fx - 24 + u * 48, fy - 2, (16 + f * 60) * (0.6 + 0.4 * Math.sin(S.t * 9 + i * 1.7)), 7 + f * 5); } g.restore();
    for (const p of S.sparks) { g.fillStyle = `rgba(255,200,120,${clamp(p.life, 0, 1)})`; g.fillRect(p.x, p.y, 2, 2); }
    // 나뭇가지
    for (const st of S.sticks) stick(g, st.x, st.y, st.a, st.big, 1);
    if (S.hold) stick(g, S.px, S.py, S.hold.a, S.hold.big, 1, true);
    // 독사가 달린 손
    if (S.vip === 1 && art('a37/viper')) { const x = S.px, y = S.py, w = Math.sin(S.t * 14) * 0.25;
      g.fillStyle = '#c99a6a'; g.beginPath(); g.ellipse(x, y + 6, 13, 10, 0, 0, 7); g.fill(); g.fillRect(x - 6, y + 12, 12, 24); spr(g, 'a37/viper', x + 4, y + 10, 44, { ay: 0.7, rot: w });
      const n = (S.shakes || []).filter(tt => S.t - tt < 1.2).length; g.font = '900 16px "Noto Sans KR",sans-serif'; g.textAlign = 'center'; g.lineWidth = 4; g.strokeStyle = 'rgba(30,20,10,.7)';
      g.strokeText(tr('← 흔들어요 → {0}/3', n), x, y - 36); g.fillStyle = '#ffd08a'; g.fillText(tr('← 흔들어요 → {0}/3', n), x, y - 36); }
    else if (S.vip === 1) { const x = S.px, y = S.py, w = Math.sin(S.t * 14) * 4;
      g.fillStyle = '#c99a6a'; g.beginPath(); g.ellipse(x, y, 13, 10, 0, 0, 7); g.fill(); g.fillRect(x - 6, y + 6, 12, 22);
      g.strokeStyle = '#4a4a2a'; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - 16, y - 2); g.bezierCurveTo(x - 6, y - 18 + w, x + 10, y + 14 - w, x + 22, y - 6 + w); g.stroke();
      g.strokeStyle = '#7a7a4a'; g.lineWidth = 2; g.setLineDash([3, 4]); g.stroke(); g.setLineDash([]);
      g.fillStyle = '#4a4a2a'; g.beginPath(); g.ellipse(x - 18, y - 2, 6, 4, 0.4, 0, 7); g.fill(); g.fillStyle = '#ffde5a'; g.fillRect(x - 21, y - 4, 2, 2);
      const n = (S.shakes || []).filter(tt => S.t - tt < 1.2).length; g.font = '900 16px "Noto Sans KR",sans-serif'; g.textAlign = 'center'; g.lineWidth = 4; g.strokeStyle = 'rgba(30,20,10,.7)';
      g.strokeText(tr('← 흔들어요 → {0}/3', n), x, y - 36); g.fillStyle = '#ffd08a'; g.fillText(tr('← 흔들어요 → {0}/3', n), x, y - 36); }
    if (S.flung) { const k = 1 - S.flung, x = S.flX + (fx - S.flX) * k, y = S.flY + (fy - 20 - S.flY) * k - Math.sin(k * Math.PI) * 40; if (spr(g, 'a37/viper', x, y, 30, { ay: 0.5, rot: k * 8 })) {} else { g.strokeStyle = '#4a4a2a'; g.lineWidth = 5; g.beginPath(); g.moveTo(x - 10, y); g.quadraticCurveTo(x, y - 10, x + 10, y); g.stroke(); } }
    // 불 막대
    g.save(); g.font = '800 13px "Noto Sans KR",sans-serif'; g.textAlign = 'left'; g.fillStyle = '#f4ece0'; g.fillText(tr('불'), 14, 28);
    g.fillStyle = 'rgba(0,0,0,.3)'; rrect(g, 34, 18, 160, 13, 6); g.fill(); const fg2 = g.createLinearGradient(34, 0, 194, 0); fg2.addColorStop(0, '#ff7a3a'); fg2.addColorStop(1, '#ffd27a'); g.fillStyle = fg2; rrect(g, 34, 18, 160 * f, 13, 6); g.fill();
    g.fillStyle = 'rgba(255,255,255,.8)'; g.fillRect(34 + 160 * 0.5, 16, 1.5, 17); g.restore();
    floatMsg(g, S.msg);
  },
  end(g, k, S) { S.fire = 1; this.update(0.016, S); this.draw(g, S);
    if (k > 0.2) { g.font = '700 12px "Noto Sans KR",sans-serif'; g.textAlign = 'center'; g.fillStyle = 'rgba(255,240,220,.9)'; g.fillText(tr('“…아무렇지도 않다니, 신이라 하더라”'), 200, 232); } // 28:6
    if (k > 0.3) { g.save(); g.globalAlpha = clamp((k - 0.3) * 2, 0, 1); g.fillStyle = 'rgba(30,24,18,.8)'; g.fillRect(0, 60, W, 84);
      g.font = '700 17px "Gowun Batang",serif'; g.textAlign = 'center'; g.fillStyle = '#fff0d6'; g.fillText(tr('바울이 그 짐승을 불에 떨어 버리매'), W / 2, 90); g.fillText(tr('조금도 상함이 없더라'), W / 2, 114);
      g.font = '600 11px "Noto Sans KR",sans-serif'; g.fillStyle = '#e6cfa6'; g.fillText(tr('행 28:5'), W / 2, 133); g.restore(); }
  },
};
function stick(g, x, y, a, big, al, held) {
  if (art('a37/stick')) { g.save(); const hl = g.createRadialGradient(x, y, 2, x, y, big ? 40 : 30); hl.addColorStop(0, 'rgba(255,230,150,.45)'); hl.addColorStop(1, 'rgba(255,230,150,0)'); g.fillStyle = hl; g.beginPath(); g.ellipse(x, y, big ? 44 : 32, big ? 18 : 14, a, 0, 7); g.fill(); // 주울 수 있는 가지 — 바탕 그림의 나무와 구별되게
    if (held) { g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 8; g.shadowOffsetY = 5; } spr(g, 'a37/stick', x, y, big ? 22 : 15, { ay: 0.5, rot: a }); g.restore(); return; }
  g.save(); g.translate(x, y); g.rotate(a); g.globalAlpha = al; const L = big ? 30 : 20;
  if (held) { g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 6; g.shadowOffsetY = 4; }
  g.strokeStyle = '#5a3e24'; g.lineWidth = big ? 6 : 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(-L, 0); g.lineTo(L, 0); g.stroke();
  g.lineWidth = 2.5; g.beginPath(); g.moveTo(L * 0.3, 0); g.lineTo(L * 0.6, -8); g.stroke(); g.strokeStyle = '#7a5a38'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-L + 3, -1); g.lineTo(L - 3, -1); g.stroke();
  g.restore();
}

/* ---------- 나아만의 일곱 번 (왕하 5:10–14): 요단 강에 일곱 번 몸을 잠그기 — 누르고 있다 알맞게 떼기 ---------- */
// 누르고 있으면 나아만이 물속에 잠기고 고리가 찬다. 초록 띠 안에서 떼야 한 번으로 센다 — 일찍 떼면 다시, 너무 오래면 숨이 차 물을 먹고 한 번을 잃는다.
// 잠길 때마다 고리 빠르기와 띠가 조금씩 달라진다. 일곱 번을 채우면 살이 어린아이 살같이 깨끗해진다(5:14)
const DIPS = 7;
const naaman = {
  title: tr('나아만의 일곱 번'), task: tr('요단 강에 일곱 번 몸을 잠그기'), art: ['k24/bg', 'k24/naaman', 'k24/naaman-clean', 'k24/servants'],
  ask: [tr('나는 나가 보지도 않고 요단 강에 가서 일곱 번 몸을 씻으라고만 전했단다. 나아만은 화가 나서 돌아섰지.'), tr('그래도 종들의 말을 듣고 이 물에 내려왔어 — 네가 함께 세어 주렴, 꼭 일곱 번!')],
  quote: tr('나아만이 이에 내려가서 하나님의 사람의 말대로 요단 강에 일곱 번 몸을 잠그니'), ref: tr('왕하 5:14'),
  help: tr('누르고 있으면 물속에 잠기고 고리가 차요. 초록 띠 안에서 떼면 한 번!<br>일찍 떼면 다시, 너무 오래면 숨이 차서 한 번을 잃어요. 일곱 번 채우기.'),
  seconds: 20,
  init() { const S = { n: 0, hold: false, k: 0, sp: 1, lo: 0.7, hi: 0.95, dep: 0, t: 0, msg: null, bub: [], ripple: [], clean: 0, choke: 0 }; this.next(S); return S; },
  next(S) { S.sp = rnd(1.05, 1.5) + S.n * 0.05; const w = 0.19 - S.n * 0.01; S.lo = rnd(0.55, 0.8); S.hi = S.lo + w; S.k = 0; }, // 잠길 때마다 빠르기·띠가 달라진다
  update(dt, S) {
    S.t += dt; if (S.msg) S.msg.at -= dt; S.choke = Math.max(0, S.choke - dt);
    S.dep += ((S.hold && !S.choke ? 1 : 0) - S.dep) * Math.min(1, dt * 9);
    if (S.hold && !S.choke) { S.k += dt * S.sp / 1.2; if (Math.random() < dt * 14) S.bub.push({ x: 200 + rnd(-30, 30), y: 330, vy: rnd(-60, -30), life: rnd(0.5, 1) });
      if (S.k > S.hi + 0.22) { S.hold = false; S.choke = 0.9; S.n = Math.max(0, S.n - 1); S.fx.play('splash'); S.msg = { t: tr('숨이 차요! 한 번을 잃었어요'), c: '#ffb38a', at: 1.2, x: 200, y: 200 }; this.next(S); } }
    S.clean += (S.n / DIPS - S.clean) * Math.min(1, dt * 3);
    for (const b of S.bub) { b.y += b.vy * dt; b.life -= dt; } S.bub = S.bub.filter(b => b.life > 0);
    for (const r of S.ripple) r.t += dt; S.ripple = S.ripple.filter(r => r.t < 1.2);
  },
  down(x, y, S) { if (S.choke || S.n >= DIPS) return; S.hold = true; S.k = 0; S.fx.play('plop'); S.ripple.push({ t: 0 }); },
  up(S) { if (!S.hold) return; S.hold = false; S.ripple.push({ t: 0 });
    if (S.k >= S.lo && S.k <= S.hi) { S.n++; S.fx.play(S.n >= DIPS ? 'wine' : 'coin'); S.msg = { t: `${[tr('하나'), tr('둘'), tr('셋'), tr('넷'), tr('다섯'), tr('여섯'), tr('일곱!')][S.n - 1]}`, c: '#ffe29a', at: 0.9, x: 200, y: 200 }; }
    else if (S.k < S.lo) { S.fx.play('miss'); S.msg = { t: tr('너무 일찍 — 다시'), c: '#e8e0c8', at: 0.8, x: 200, y: 200 }; }
    else { S.fx.play('miss'); S.msg = { t: tr('조금 늦었어요 — 다시'), c: '#e8e0c8', at: 0.8, x: 200, y: 200 }; }
    this.next(S); },
  key(k, S) { if (k === ' ') { if (!S.hold) this.down(0, 0, S); return; } return false; },
  won: S => S.n >= DIPS && !S.hold,
  failText: () => tr('해가 저물었어요'),
  draw(g, S) {
    const WL = 300; // 물 높이
    if (!bgArt(g, 'k24/bg')) { g.fillStyle = '#9cc0d0'; g.fillRect(0, 0, W, WL); g.fillStyle = '#5a6a48'; g.fillRect(0, WL, W, H); }
    spr(g, 'k24/servants', 70, 470, 66, { flip: true });
    // 나아만 — 잠기면 물 아래로 내려간다(물 위 부분만 보이게 자른다), 셀수록 살이 깨끗해진다
    const ny = WL + 100 + S.dep * 120 + Math.sin(S.t * 2) * 2;
    g.save(); g.beginPath(); g.rect(0, 0, W, WL + 4); g.clip();
    const who = S.n >= DIPS ? 'k24/naaman-clean' : 'k24/naaman'; spr(g, who, 200, ny, 190); // 두 그림의 얼굴 자리가 달라 겹치면 머리가 둘로 보여, 일곱 번째에 한 번에 바꾼다
    g.restore();
    // 물속에 잠긴 몸이 흐리게 비친다
    g.save(); g.beginPath(); g.rect(0, WL + 4, W, H); g.clip(); g.globalAlpha = 0.25; spr(g, who, 200, ny, 190); g.restore();
    g.fillStyle = 'rgba(90,110,80,.35)'; g.fillRect(0, WL + 2, W, 3);
    for (const r of S.ripple) { g.strokeStyle = `rgba(255,255,255,${0.5 * (1 - r.t / 1.2)})`; g.lineWidth = 2; g.beginPath(); g.ellipse(200, WL + 3, 40 + r.t * 90, 6 + r.t * 10, 0, 0, 7); g.stroke(); }
    for (const b of S.bub) { g.strokeStyle = `rgba(230,245,255,${b.life})`; g.lineWidth = 1.2; g.beginPath(); g.arc(b.x, b.y, 3, 0, 7); g.stroke(); }
    // 고리: 잠겨 있는 동안 찬다, 초록 띠 안에서 떼기
    const cx = 200, cy = 112, R = 40;
    g.save(); g.lineWidth = 10; g.strokeStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.stroke();
    const A = k => -Math.PI / 2 + k * Math.PI * 2; g.strokeStyle = 'rgba(120,220,120,.85)'; g.beginPath(); g.arc(cx, cy, R, A(S.lo), A(Math.min(1, S.hi))); g.stroke();
    if (S.hold) { g.strokeStyle = S.k > S.hi ? '#ff7a5a' : '#fff4d8'; g.lineWidth = 5; g.beginPath(); g.arc(cx, cy, R, A(0), A(Math.min(1.2, S.k))); g.stroke(); }
    g.font = '900 26px "Noto Sans KR",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 5; g.strokeStyle = 'rgba(30,24,14,.7)'; g.strokeText(`${S.n}`, cx, cy); g.fillStyle = '#fff'; g.fillText(`${S.n}`, cx, cy);
    g.font = '700 11px "Noto Sans KR",sans-serif'; g.lineWidth = 3; g.strokeText(tr('/ {0}번', DIPS), cx, cy + 22); g.fillStyle = '#ffe9c0'; g.fillText(tr('/ {0}번', DIPS), cx, cy + 22); g.restore();
    g.save(); g.font = '800 14px "Noto Sans KR",sans-serif'; g.textAlign = 'left'; g.lineWidth = 3; g.strokeStyle = 'rgba(20,30,20,.6)'; g.fillStyle = '#fff';
    const tip = S.choke ? tr('콜록… 잠깐 숨을 골라요') : S.hold ? tr('초록 띠에서 떼요!') : tr('누르고 있으면 잠겨요'); g.strokeText(tip, 14, 26); g.fillText(tip, 14, 26); g.restore();
    floatMsg(g, S.msg);
  },
  end(g, k, S) { S.hold = false; this.update(0.016, S); this.draw(g, S);
    if (k > 0.1) { g.save(); g.globalAlpha = 0.3 * Math.sin(Math.min(1, k * 2) * Math.PI); g.fillStyle = '#fff6d8'; g.fillRect(0, 0, W, H); g.restore(); }
    if (k > 0.3) { g.save(); g.globalAlpha = clamp((k - 0.3) * 2, 0, 1); g.fillStyle = 'rgba(20,30,24,.78)'; g.fillRect(0, 40, W, 84);
      g.font = '700 16px "Gowun Batang",serif'; g.textAlign = 'center'; g.fillStyle = '#f4fff0'; g.fillText(tr('그의 살이 어린아이의 살 같이'), W / 2, 70); g.fillText(tr('회복되어 깨끗하게 되었더라'), W / 2, 94);
      g.font = '600 11px "Noto Sans KR",sans-serif'; g.fillStyle = '#c8dcc0'; g.fillText(tr('왕하 5:14'), W / 2, 113); g.restore(); }
  },
};

/* ---------- 한밤의 찬송과 흔들린 감옥 (행 16:25–26): 여리고 박자 놀이를 다시 씀 — 찬송의 박자, 끝은 지진 ---------- */
const HYMN_SEG = [tr('한밤중 — 첫 찬송'), tr('기도하며 둘째 노래'), tr('죄수들이 귀를 기울이고'), tr('마지막 찬송')];
const prison = { ...jericho, title: tr('한밤의 찬송과 흔들린 감옥'), task: tr('찬송의 박자에 맞춰 밤새 노래하기'),
  art: ['a17/bg', 'a17/paul-silas', 'a17/prisoners', 'a17/door-open'],
  ask: [tr('매를 맞고 발이 차꼬에 묶였어도, 실라와 나는 한밤중에 하나님을 찬송했단다.'), tr('너도 같이 부르자 — 음표에 맞춰. 마지막엔 마음껏 소리 높여!')],
  quote: tr('한밤중에 바울과 실라가 기도하고 하나님을 찬송하매 죄수들이 듣더라'), ref: tr('행 16:25'),
  help: tr('음표가 오른쪽에서 흘러와요. 왼쪽 원에 닿을 때 눌러요.<br>갈수록 빨라져요. 여섯 번 놓치면 흐트러져요. 마지막에 마구 눌러 찬송을 높이면 —'),
  seconds: 36, plan: [[6, 0.85], [8, 0.7], [8, 0.58], [10, 0.48]],
  label: (S, d) => S.shoutOn ? tr('소리 높여 찬송!') : HYMN_SEG[d - 1],
  shoutMsg: tr('소리 높여!'), shoutText: [tr('마구 눌러 찬송을 높여요!'), tr('땅이 흔들린다!')], hitFx: ['plink'], doneFx: 'collapse', note: hymnNote, ink: '#f4ecd8',
  missText: tr('찬송의 박자가 흐트러졌어요'),
  endLines: [tr('홀연히 큰 지진이 나서 옥터가 움직이고'), tr('문이 곧 다 열리며 모든 사람의 매인 것이 다 벗어진지라'), tr('행 16:26')],
  scene(g, S) {
    const f = S.fall, sh = f > 0 && f < 1 ? Math.sin(S.t * 60) * 6 * (1 - f) : 0;
    g.save(); g.translate(sh, sh * 0.4);
    if (!bgArt(g, 'a17/bg')) { g.fillStyle = '#1a1612'; g.fillRect(-10, -10, W + 20, H + 20); }
    if (f > 0) spr(g, 'a17/door-open', 336, 330, 200, { a: Math.min(1, f * 1.5) }); // 문이 열린다
    const lift = S.flash * 3; spr(g, 'a17/prisoners', 330, 452, 92);
    spr(g, 'a17/paul-silas', 140, 404 - lift, 110);
    g.restore();
    if (f > 0 && f < 1) { g.fillStyle = `rgba(200,180,150,${Math.sin(f * Math.PI) * 0.35})`; for (let i = 0; i < 16; i++) { g.beginPath(); g.arc((i * 61) % W, (i * 37) % 300, 3 + (i % 3), 0, 7); g.fill(); } } // 떨어지는 먼지
    g.fillStyle = 'rgba(10,8,6,.25)'; g.fillRect(0, 0, W, H);
  },
};
function hymnNote(g, x, y, fast) { g.save(); g.translate(x, y); g.fillStyle = fast ? '#ffe29a' : '#f4ecd8'; g.strokeStyle = '#3a2a14'; g.lineWidth = 1.2;
  g.beginPath(); g.ellipse(-4, 8, 8, 6, -0.4, 0, 7); g.fill(); g.stroke(); g.fillRect(3, -16, 3, 24); g.beginPath(); g.moveTo(6, -16); g.quadraticCurveTo(18, -10, 14, 0); g.lineTo(13, -2); g.quadraticCurveTo(15, -8, 6, -11); g.fill(); g.restore(); }

/* ---------- 도단을 둘러싼 불말과 불병거 (왕하 6:15–17): 눈을 열어 보기 — 찾기 ---------- */
// 아람 군대가 둘러싼 산에 불말과 불병거가 숨어 있다. 끌면 '열린 눈'(빛 고리)이 손가락 조금 위를 따라가고, 그 안에서만 불병거가 보인다.
// 불병거가 고리 가운데에 0.5초 머물면 찾은 것. 여섯을 찾으면 산 가득 불병거가 드러난다(6:17). 한동안 못 찾으면 가장 가까운 것이 희미하게 일렁인다
const LENS = 56, SEEN = 0.6, CHARIOTS = 6;
const dothan = {
  title: tr('도단을 둘러싼 불말과 불병거'), task: tr('눈을 열어 숨은 불병거 여섯 찾기'), art: ['k26/bg', 'k26/firechariot', 'k26/elisha'],
  ask: [tr('사환이 새벽에 나가 보니 아람 군대가 성을 에워쌌단다. 그는 떨며 어찌하리이까 외쳤지.'), tr('두려워 말라 — 우리와 함께한 자가 더 많다. 눈을 열어 산을 살펴보렴!')],
  quote: tr('여호와여 원하건대 그의 눈을 열어서 보게 하옵소서 하니'), ref: tr('왕하 6:17'),
  help: tr('끌면 빛 고리(열린 눈)가 따라와요. 고리 안에서만 불병거가 보여요.<br>불병거를 고리 가운데에 잠깐 두면 찾아요. 여섯을 찾아요.'),
  seconds: 18,
  init() { const C = []; for (let k = 0; C.length < CHARIOTS && k < 500; k++) { const x = rnd(50, 350), y = rnd(110, 300); if (C.every(c => Math.hypot(c.x - x, c.y - y) > 80)) C.push({ x, y, s: 0.6 + (y - 110) / 190 * 0.5, flip: Math.random() < 0.5, got: 0, dwell: 0 }); }
    return { C, lx: 200, ly: 230, on: false, t: 0, last: 0, msg: null, sparks: [], found: 0 }; },
  update(dt, S) {
    S.t += dt; if (S.msg) S.msg.at -= dt;
    for (const c of S.C) { if (c.got) { c.got = Math.min(1, c.got + dt); continue; }
      const d = Math.hypot(c.x - S.lx, c.y - S.ly); if (S.on && d < 30) { c.dwell += dt; if (c.dwell >= SEEN) { c.got = 0.01; S.found++; S.last = S.t; S.fx.play('glint'); S.fx.play('coin');
          S.msg = { t: S.found >= CHARIOTS ? tr('산에 불말과 불병거가 가득!') : tr('불병거가 보여요!'), c: '#ffe29a', at: 1, x: c.x, y: c.y - 34 };
          for (let i = 0; i < 16; i++) { const a = rnd(0, 7), v = rnd(30, 100); S.sparks.push({ x: c.x, y: c.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rnd(0.4, 0.9) }); } } } else c.dwell = Math.max(0, c.dwell - dt * 2); }
    for (const p of S.sparks) { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; } S.sparks = S.sparks.filter(p => p.life > 0);
  },
  down(x, y, S) { S.on = true; S.lx = x; S.ly = y - 50; },
  move(x, y, S) { if (S.on) { S.lx = x; S.ly = y - 50; } },
  up(S) { S.on = false; },
  won: S => S.found >= CHARIOTS,
  failText: () => tr('아직 다 보지 못했어요'),
  fire(g, c, a) { spr(g, 'k26/firechariot', c.x, c.y + 26 * c.s, 54 * c.s, { flip: c.flip, a }); },
  draw(g, S) {
    if (!bgArt(g, 'k26/bg')) { g.fillStyle = '#7a6a4a'; g.fillRect(0, 0, W, H); }
    g.fillStyle = 'rgba(20,24,40,.22)'; g.fillRect(0, 0, W, H); // 새벽의 어스름
    spr(g, 'k26/elisha', 74, 494, 120);
    // 한동안 못 찾으면 가장 가까운 것이 일렁인다
    const hint = S.t - S.last > 8; let nearest = null, nd = 1e9; for (const c of S.C) if (!c.got) { const d = Math.hypot(c.x - S.lx, c.y - S.ly); if (d < nd) { nd = d; nearest = c; } }
    for (const c of S.C) { if (c.got) this.fire(g, c, c.got); else if (hint && c === nearest) { const a = 0.08 + 0.08 * Math.sin(S.t * 6); this.fire(g, c, a); } }
    if (S.on) { // 열린 눈: 고리 안만 밝고 금빛, 그 안의 숨은 불병거가 보인다
      g.save(); g.beginPath(); g.arc(S.lx, S.ly, LENS, 0, 7); g.clip();
      g.fillStyle = 'rgba(255,220,140,.22)'; g.fillRect(0, 0, W, H);
      for (const c of S.C) if (!c.got) this.fire(g, c, 0.95);
      g.restore();
      g.save(); g.shadowColor = '#ffd27a'; g.shadowBlur = 16; g.strokeStyle = 'rgba(255,230,160,.95)'; g.lineWidth = 3; g.beginPath(); g.arc(S.lx, S.ly, LENS, 0, 7); g.stroke(); g.restore();
      for (const c of S.C) if (!c.got && c.dwell > 0) { g.strokeStyle = '#fff4c8'; g.lineWidth = 4; g.beginPath(); g.arc(S.lx, S.ly, 30, -Math.PI / 2, -Math.PI / 2 + c.dwell / SEEN * Math.PI * 2); g.stroke(); }
    }
    for (const p of S.sparks) { g.fillStyle = `rgba(255,220,140,${clamp(p.life, 0, 1)})`; star(g, p.x, p.y, 4); }
    g.save(); g.font = '800 14px "Noto Sans KR",sans-serif'; g.textAlign = 'left'; g.lineWidth = 3; g.strokeStyle = 'rgba(20,16,10,.7)'; g.fillStyle = '#fff';
    const t = tr('찾은 불병거 {0} / {1}', S.found, CHARIOTS); g.strokeText(t, 14, 26); g.fillText(t, 14, 26); g.restore();
    floatMsg(g, S.msg);
  },
  end(g, k, S) { // 산에 불말과 불병거가 가득(6:17)
    this.update(0.016, S); this.draw(g, S);
    S.extra ??= Array.from({ length: 18 }, () => ({ x: rnd(20, 380), y: rnd(90, 320), flip: Math.random() < 0.5 })).map(c => ({ ...c, s: 0.5 + (c.y - 90) / 230 * 0.5 }));
    g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.25 * k; g.fillStyle = '#ffb060'; g.fillRect(0, 0, W, 340); g.restore();
    S.extra.forEach((c, i) => this.fire(g, c, clamp(k * 2.5 - i * 0.08, 0, 1)));
    if (k > 0.35) { g.save(); g.globalAlpha = clamp((k - 0.35) * 2, 0, 1); g.fillStyle = 'rgba(30,18,8,.8)'; g.fillRect(0, 340, W, 84);
      g.font = '700 16px "Gowun Batang",serif'; g.textAlign = 'center'; g.fillStyle = '#fff0d6'; g.fillText(tr('그가 보니 불말과 불병거가 산에 가득하여'), W / 2, 370); g.fillText(tr('엘리사를 둘렀더라'), W / 2, 394);
      g.font = '600 11px "Noto Sans KR",sans-serif'; g.fillStyle = '#e6cfa6'; g.fillText(tr('왕하 6:17'), W / 2, 413); g.restore(); }
  },
};

/* ---------- 한 사람도 잃지 않으리라 (행 27:39–44): 파선한 배에서 모두 뭍으로 — 널빤지 던지기 ---------- */
// 깨진 배에서 사람들이 물로 뛰어든다. 저마다 힘(고리)이 줄어들고, 헤엄칠 줄 아는 이는 스스로 천천히 뭍으로 온다(27:43).
// 사람을 누르면 바닷가의 바울 곁에서 널빤지를 던져 준다(쌓인 널빤지는 둘까지, 2초마다 하나씩 다시 모인다). 널빤지를 붙들면 빨리 뭍으로 온다(27:44).
// 헤엄치는 이는 힘이 넉넉해 스스로 닿는다 — 처음엔 그들도 도중에 가라앉아 '헤엄침'을 믿고 두면 늘 실패했다(사용자 2026-11)
// 한 사람이라도 힘이 다해 가라앉으면 실패 — 모두 뭍에 오르면 성공
const PEOPLE = 10, SHORE_Y = 398, PAUL = [352, 452];
const wreck = {
  title: tr('한 사람도 잃지 않으리라'), task: tr('널빤지를 던져 모두 뭍으로'), art: ['a36/bg', 'a36/swimmer', 'a36/floater', 'a36/plank', 'a36/paul', 'a37/people'],
  ask: [tr('배가 두 물이 합하여 흐르는 곳에 걸려 깨어지고 있단다. 그러나 너희 중 생명은 하나도 잃지 않으리라 하셨지.'), tr('헤엄 못 치는 이들에게 널빤지를 던져 주렴 — 한 사람도 잃지 않게!')],
  quote: tr('너희 중 아무도 생명에는 아무런 손상이 없겠고 오직 배뿐이리라'), ref: tr('행 27:22'),
  help: tr('물에 빠진 사람을 누르면 널빤지를 던져 줘요(둘까지, 다시 모여요). 널빤지를 붙들면 빨리 뭍으로 와요.<br>고리는 남은 힘 — 빨개진 사람부터! <b>헤엄치는 사람은 스스로 와요.</b> 한 사람이라도 가라앉으면 실패.'),
  seconds: 34,
  init() { return { P: [], spawn: 0.4, made: 0, saved: 0, planks: 2, regen: 0, fly: [], t: 0, msg: null, sank: 0, splash: [] }; },
  update(dt, S) {
    S.t += dt; if (S.msg) S.msg.at -= dt;
    if (S.made < PEOPLE && (S.spawn -= dt) <= 0) { const sw = Math.random() < 0.3; // 헤엄칠 줄 아는 사람(27:43)
      S.P.push({ x: rnd(70, 320), y: rnd(118, 150), vy: sw ? rnd(13, 17) : rnd(4, 7), drain: sw ? rnd(0.03, 0.038) : rnd(0.12, 0.16), st: 1, ph: rnd(0, 7), plank: 0, swim: sw, saved: 0 });
      S.made++; S.spawn = rnd(0.7, 1.2); S.fx.play('splash'); }
    if (S.planks < 2 && (S.regen += dt) >= 2.0) { S.regen = 0; S.planks++; }
    for (const p of S.P) { if (p.saved) continue;
      const sway = Math.sin(S.t * 1.7 + p.ph) * 10 * dt;
      if (p.plank) { p.y += 30 * dt; p.x += sway; } else { p.y += p.vy * dt; p.x += sway; p.st -= p.drain * dt; }
      if (p.y >= SHORE_Y) { p.saved = 1; S.saved++; S.fx.play('coin'); S.msg = { t: tr('뭍에 올랐어요 {0} / {1}', S.saved, PEOPLE), c: '#ffe29a', at: 0.9, x: p.x, y: SHORE_Y - 30 }; }
      if (p.st <= 0 && !p.saved) { S.sank = 1; } }
    for (const f of S.fly) { f.t += dt; if (f.t >= f.dur && !f.done) { f.done = 1; f.p.plank = 1; S.fx.play('plop'); S.splash.push({ x: f.p.x, y: f.p.y, t: 0 }); } }
    S.fly = S.fly.filter(f => !f.done);
    for (const s2 of S.splash) s2.t += dt; S.splash = S.splash.filter(s2 => s2.t < 0.8);
  },
  down(x, y, S) {
    let best = null, bd = 34; for (const p of S.P) { if (p.saved || p.plank || S.fly.some(f => f.p === p)) continue; const d = Math.hypot(p.x - x, p.y - 10 - y); if (d < bd) { bd = d; best = p; } }
    if (!best) return; if (S.planks <= 0) { S.msg = { t: tr('널빤지를 모으는 중…'), c: '#e8e0c8', at: 0.6, x, y: y - 24 }; S.fx.play('miss'); return; }
    S.planks--; const d = Math.hypot(best.x - PAUL[0], best.y - PAUL[1]); S.fly.push({ p: best, t: 0, dur: 0.25 + d / 900 }); S.fx.play('cast'); },
  up() {},
  won: S => S.saved >= PEOPLE,
  lost: S => S.sank > 0,
  failText: S => S.sank ? tr('한 사람이 물에 잠겼어요') : tr('시간이 다 되었어요'),
  draw(g, S) {
    if (!bgArt(g, 'a36/bg')) { g.fillStyle = '#3a5a68'; g.fillRect(0, 0, W, H); g.fillStyle = '#b89a6a'; g.fillRect(0, SHORE_Y, W, H); }
    // 물결 줄 (움직임)
    g.strokeStyle = 'rgba(235,245,250,.18)'; g.lineWidth = 1.5; for (let r = 0; r < 8; r++) { const y = 140 + r * 32; g.beginPath(); for (let x = 0; x <= W; x += 10) g.lineTo(x, y + Math.sin(x * 0.04 + S.t * 2 + r) * 4); g.stroke(); }
    spr(g, 'a36/paul', PAUL[0], PAUL[1] + 36, 96);
    for (let i = 0; i < S.planks; i++) spr(g, 'a36/plank', PAUL[0] - 44 - i * 6, PAUL[1] + 30 - i * 5, 16); // 쌓인 널빤지
    // 뭍에 오른 사람 수 — 바닷가에 앉아 있다
    if (S.saved && !spr(g, 'a37/people', 96, 494, 34 + Math.min(S.saved, PEOPLE) * 3.2)) for (let i = 0; i < S.saved; i++) { const x = 30 + i * 28, y = 470; g.fillStyle = ['#7a5a3e', '#5a4a6a', '#4a5a4a', '#8a6a4a'][i % 4]; g.beginPath(); g.ellipse(x, y, 8, 12, 0, 0, 7); g.fill(); g.fillStyle = '#c99a6a'; g.beginPath(); g.arc(x, y - 15, 5, 0, 7); g.fill(); } // 뭍에 오른 무리 — 오를수록 커진다
    for (const p of S.P) { if (p.saved) continue; const bob = Math.sin(S.t * 3 + p.ph) * 2;
      if (p.plank) spr(g, 'a36/floater', p.x, p.y + 14 + bob, 34);
      else { spr(g, 'a36/swimmer', p.x, p.y + 14 + bob, 40, { flip: p.ph > 3.5 });
        const low = p.st < 0.35, c = low ? (Math.sin(S.t * 14) > 0 ? '#ff5a3c' : '#ffb08a') : p.st < 0.6 ? '#ffd27a' : '#9ee08a';
        g.lineWidth = 3.5; g.strokeStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.arc(p.x, p.y - 8, 21, 0, 7); g.stroke();
        g.strokeStyle = c; g.beginPath(); g.arc(p.x, p.y - 8, 21, -Math.PI / 2, -Math.PI / 2 + p.st * Math.PI * 2); g.stroke();
        if (p.swim) { g.font = '700 10px "Noto Sans KR",sans-serif'; g.textAlign = 'center'; g.fillStyle = 'rgba(255,255,255,.85)'; g.fillText(tr('헤엄침'), p.x, p.y + 26); } } }
    for (const f of S.fly) { const k = f.t / f.dur, x = PAUL[0] + (f.p.x - PAUL[0]) * k, y = PAUL[1] - 30 + (f.p.y - PAUL[1] + 30) * k - Math.sin(k * Math.PI) * 50; spr(g, 'a36/plank', x, y, 16, { ay: 0.5, rot: k * 6 }); }
    for (const s2 of S.splash) { g.strokeStyle = `rgba(255,255,255,${0.7 * (1 - s2.t / 0.8)})`; g.lineWidth = 2; g.beginPath(); g.ellipse(s2.x, s2.y + 10, 14 + s2.t * 30, 5 + s2.t * 8, 0, 0, 7); g.stroke(); }
    g.save(); g.font = '800 14px "Noto Sans KR",sans-serif'; g.textAlign = 'left'; g.lineWidth = 3; g.strokeStyle = 'rgba(10,20,30,.7)'; g.fillStyle = '#fff';
    const t = tr('뭍에 오른 사람 {0} / {1}', S.saved, PEOPLE); g.strokeText(t, 14, 26); g.fillText(t, 14, 26);
    g.textAlign = 'right'; const pk = tr('널빤지 {0}', S.planks); g.strokeText(pk, W - 14, 26); g.fillText(pk, W - 14, 26); g.restore();
    floatMsg(g, S.msg);
  },
  end(g, k, S) { this.update(0.016, S); this.draw(g, S);
    if (k > 0.3) { g.save(); g.globalAlpha = clamp((k - 0.3) * 2, 0, 1); g.fillStyle = 'rgba(14,24,34,.8)'; g.fillRect(0, 150, W, 84);
      g.font = '700 17px "Gowun Batang",serif'; g.textAlign = 'center'; g.fillStyle = '#eef6ff'; g.fillText(tr('그 남은 사람들은 널조각 혹은 배 물건에 의지하여'), W / 2, 180); g.fillText(tr('마침내 모두 상륙하여 구조되니라'), W / 2, 204);
      g.font = '600 11px "Noto Sans KR",sans-serif'; g.fillStyle = '#b8c8d8'; g.fillText(tr('행 27:44'), W / 2, 223); g.restore(); }
  },
};

/* ---------- 화살 세 개 (삼상 20:20–22, 35–38): 아이 너머로 쏘는 신호 화살 — 겨누기 + 바람 ---------- */
// 요나단이 되어 끌었다 놓아 활을 쏜다(당긴 만큼 세게, 반대쪽으로). 화살이 달려가는 아이 '너머'에 떨어져야 다윗에게 떠나라는 신호다(20:22).
// 아이 앞에 떨어지면 잘못된 신호, 아이에게 맞으면 실패. 쏠 때마다 바람이 바뀐다(깃발). 화살 다섯 개로 신호 셋을 보내면 성공
const ARCH = [126, 388], GY = 438, AV = 430, AG = 330, GOOD = 3, ARROWS = 5;
const arrows = {
  title: tr('화살 세 개'), task: tr('아이 너머로 신호 화살 셋'), art: ['d10/bg', 'd10/jonathan', 'd10/boy', 'd10/david'],
  ask: [tr('요나단과 나는 약속했단다. 화살이 아이 너머에 떨어지면 내가 떠나야 한다는 뜻이라고.'), tr('이번엔 네가 요나단이 되어 쏘아 보렴 — 꼭 아이 너머로! 바람도 살피고.')],
  quote: tr('내가 아이에게 이르기를 화살이 네 앞쪽에 있다 하거든 너는 갈지니 여호와께서 너를 보내셨음이니라'), ref: tr('삼상 20:22'),
  help: tr('화면을 뒤로 끌었다 놓으면 화살이 날아가요(당긴 만큼 세게).<br>달려가는 아이 <b>너머</b>(초록 띠)에 떨어뜨려요. 아이에게 맞으면 실패! 깃발로 바람을 보고, 다섯 발로 신호 셋.'),
  seconds: 34,
  init() { const S = { bx: 250, tx: 250, run: 0, wind: 0, shot: null, aim: null, good: 0, left: ARROWS, stuck: [], msg: null, hurt: 0, t: 0, trail: [] }; this.roll(S); return S; },
  roll(S) { S.wind = Math.round(rnd(-1, 1) * 10) / 10; },
  zone: S => [S.bx + 26, S.bx + 126],
  update(dt, S) {
    S.t += dt; if (S.msg) S.msg.at -= dt;
    if (S.run > 0) { S.run -= dt; S.bx += (S.tx - S.bx) * Math.min(1, dt * 3.2); }
    const a = S.shot;
    if (a) { a.vy += AG * dt; a.vx += S.wind * 70 * dt; a.x += a.vx * dt; a.y += a.vy * dt; S.trail.push([a.x, a.y]); if (S.trail.length > 10) S.trail.shift();
      if (Math.abs(a.x - S.bx) < 10 && a.y > GY - 50 && a.y < GY) { S.hurt = 1; S.shot = null; S.fx.play('miss'); S.msg = { t: tr('아이가 다칠 뻔했어요!'), c: '#ffb38a', at: 1.6, x: S.bx, y: GY - 90 }; return; }
      if (a.y >= GY || a.x > W + 30) { const x = a.x, [z0, z1] = this.zone(S); S.shot = null; S.trail = [];
        if (x <= W) S.stuck.push({ x, ang: Math.atan2(a.vy, a.vx) });
        if (x >= z0 && x <= z1) { S.good++; S.fx.play('coin'); S.msg = { t: S.good >= GOOD ? tr('세 번째 신호 — 다윗이 알아들었어요') : tr('화살이 네 앞쪽에 있다! ({0}/{1})', S.good, GOOD), c: '#ffe29a', at: 1.3, x: Math.min(330, x), y: GY - 80 }; }
        else if (x < S.bx) { S.fx.play('miss'); S.msg = { t: tr('아이 앞에 떨어졌어요 — 반대 신호'), c: '#e8e0c8', at: 1.2, x: Math.max(90, x), y: GY - 80 }; }
        else { S.fx.play('miss'); S.msg = { t: tr('너무 멀리 갔어요'), c: '#e8e0c8', at: 1.1, x: Math.min(330, x), y: GY - 80 }; }
        // 아이가 화살을 주우러 달려갔다 다음 자리로
        S.tx = rnd(170, 300); S.run = 1.4; this.roll(S); } }
  },
  down(x, y, S) { if (S.shot || S.run > 0.3 || S.left <= 0 || S.hurt) return; S.aim = { x0: x, y0: y, x, y }; },
  move(x, y, S) { if (S.aim) { S.aim.x = x; S.aim.y = y; } },
  up(S) { const A = S.aim; S.aim = null; if (!A || S.shot) return; const v = this.vel(A); if (Math.hypot(v[0], v[1]) < 70) return;
    S.shot = { x: ARCH[0] + 20, y: ARCH[1] - 30, vx: v[0], vy: v[1] }; S.left--; S.fx.play('cast'); S.trail = []; },
  vel(a) { const dx = a.x0 - a.x, dy = a.y0 - a.y, L = Math.hypot(dx, dy), k = Math.min(1, L / 130) * AV / (L || 1); return [dx * k, dy * k]; },
  won: S => S.good >= GOOD && !S.shot,
  lost: S => S.hurt > 0 || (S.left <= 0 && !S.shot && S.good < GOOD),
  failText: S => S.hurt ? tr('아이가 다칠 뻔했어요') : tr('화살이 다 떨어졌어요'),
  draw(g, S) {
    if (!bgArt(g, 'd10/bg')) { g.fillStyle = '#b8d0c0'; g.fillRect(0, 0, W, H); g.fillStyle = '#7a9a4a'; g.fillRect(0, GY, W, H); }
    g.save(); g.beginPath(); g.rect(0, 0, W, 352); g.clip(); spr(g, 'd10/david', 52, 372, 50); g.restore(); // 에셀 바위 뒤에 숨은 다윗 — 바위 위로 머리만
    // 바람 깃발
    const fx0 = 330, fy0 = 120; g.strokeStyle = '#5a3e22'; g.lineWidth = 3; g.beginPath(); g.moveTo(fx0, fy0 + 60); g.lineTo(fx0, fy0); g.stroke();
    const wl = 10 + Math.abs(S.wind) * 34, dir = Math.sign(S.wind) || 1; g.fillStyle = '#c9423a';
    g.beginPath(); g.moveTo(fx0, fy0); for (let i = 0; i <= 8; i++) { const u = i / 8; g.lineTo(fx0 + dir * wl * u, fy0 + 4 + Math.sin(S.t * 8 + u * 6) * 3 * u); } for (let i = 8; i >= 0; i--) { const u = i / 8; g.lineTo(fx0 + dir * wl * u, fy0 + 18 + Math.sin(S.t * 8 + u * 6) * 3 * u); } g.fill();
    g.font = '700 11px "Noto Sans KR",sans-serif'; g.textAlign = 'center'; g.lineWidth = 3; g.strokeStyle = 'rgba(20,20,10,.6)'; g.fillStyle = '#fff';
    const wt = S.wind === 0 ? tr('바람 없음') : tr('바람 {0} {1}', S.wind > 0 ? '→' : '←', Math.abs(S.wind * 10).toFixed(0)); g.strokeText(wt, fx0, fy0 + 78); g.fillText(wt, fx0, fy0 + 78);
    // 신호 띠(아이 너머)
    const [z0, z1] = this.zone(S); g.fillStyle = 'rgba(130,230,120,.28)'; g.fillRect(z0, GY - 4, z1 - z0, 10); g.strokeStyle = 'rgba(160,255,150,.8)'; g.lineWidth = 1.5; g.strokeRect(z0, GY - 4, z1 - z0, 10);
    for (const st of S.stuck) { g.save(); g.translate(st.x, GY); g.rotate(st.ang); g.strokeStyle = '#4a3520'; g.lineWidth = 2; g.beginPath(); g.moveTo(-22, 0); g.lineTo(2, 0); g.stroke(); g.fillStyle = '#e8e0c8'; g.fillRect(-24, -3, 6, 6); g.restore(); }
    spr(g, 'd10/boy', S.bx, GY + 4, 62, { flip: S.run > 0 && S.tx < S.bx });
    spr(g, 'd10/jonathan', ARCH[0], ARCH[1] + 52, 108);
    if (S.aim) { const v = this.vel(S.aim); let x = ARCH[0] + 20, y = ARCH[1] - 30, vx = v[0], vy = v[1]; // 처음 몇 점만 궤적
      g.fillStyle = 'rgba(255,255,255,.85)'; for (let i = 0; i < 6; i++) { for (let k = 0; k < 4; k++) { vy += AG / 60; x += vx / 60; y += vy / 60; } g.beginPath(); g.arc(x, y, 2.5 - i * 0.25, 0, 7); g.fill(); } }
    if (S.shot) { const a = S.shot; g.save(); g.translate(a.x, a.y); g.rotate(Math.atan2(a.vy, a.vx)); g.strokeStyle = '#4a3520'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(-24, 0); g.lineTo(4, 0); g.stroke(); g.fillStyle = '#9aa0a6'; g.beginPath(); g.moveTo(8, 0); g.lineTo(2, -3); g.lineTo(2, 3); g.fill(); g.fillStyle = '#e8e0c8'; g.fillRect(-26, -3, 6, 6); g.restore(); }
    g.save(); g.font = '800 14px "Noto Sans KR",sans-serif'; g.textAlign = 'left'; g.lineWidth = 3; g.strokeStyle = 'rgba(20,24,10,.6)'; g.fillStyle = '#fff';
    const t = tr('신호 {0} / {1} · 남은 화살 {2}', S.good, GOOD, S.left); g.strokeText(t, 14, 26); g.fillText(t, 14, 26); g.restore();
    floatMsg(g, S.msg);
  },
  end(g, k, S) { this.update(0.016, S); this.draw(g, S);
    if (k > 0.3) { g.save(); g.globalAlpha = clamp((k - 0.3) * 2, 0, 1); g.fillStyle = 'rgba(24,30,14,.8)'; g.fillRect(0, 170, W, 84);
      g.font = '700 16px "Gowun Batang",serif'; g.textAlign = 'center'; g.fillStyle = '#f6ffe8'; g.fillText(tr('요나단이 그 아이 뒤에서 외치되'), W / 2, 200); g.fillText(tr('지체 말고 빨리 달음질하라 하매'), W / 2, 224);
      g.font = '600 11px "Noto Sans KR",sans-serif'; g.fillStyle = '#c8d8b0'; g.fillText(tr('삼상 20:38'), W / 2, 243); g.restore(); }
  },
};

/* ---------- 떠오른 도끼 (왕하 6:1–7): 거품을 보고 가라앉은 자리에 나뭇가지 던지기 → 떠오른 쇠도끼 건지기 ---------- */
// 흐린 요단 물속에 빌린 도끼(6:5)가 가라앉아 바닥을 따라 천천히 떠밀린다. 가끔 거품이 올라오는데, 물살에 밀려 실제 자리보다 아래쪽(오른쪽)에 터진다.
// 짐작한 자리를 누르면 엘리사가 나뭇가지를 던진다 — 가깝게 맞으면 쇠도끼가 떠오른다(6:6). 떠내려가기 전에 눌러 건지면 성공(6:7). 가지는 넷
const AXE_R = 20, STICKS = 4, RIVER = [130, 340];
const axe = {
  title: tr('떠오른 도끼'), task: tr('거품을 보고 도끼 자리에 가지 던지기'), art: ['k25/bg', 'k25/elisha', 'k25/disciple', 'k25/axe', 'a37/stick'],
  ask: [tr('들보를 베다가 빌려 온 쇠도끼가 자루에서 빠져 물에 떨어졌단다. 제자가 아이고 하며 소리쳤지.'), tr('어디 떨어졌느냐? 거품을 잘 보아라 — 물살에 밀린다는 것도 잊지 말고!')],
  quote: tr('하나님의 사람이 이르되 어디 빠졌느냐 하매 그 곳을 보이는지라 엘리사가 나뭇가지를 베어 물에 던져 쇠도끼를 떠오르게 하고'), ref: tr('왕하 6:6'),
  help: tr('가끔 물속에서 거품이 올라와요 — 물살에 밀려 실제 자리보다 오른쪽에서 터지니, <b>거품보다 조금 왼쪽</b>을 눌러요.<br>누르면 그 자리에 나뭇가지를 던져요(넷). 도끼가 떠오르면 떠내려가기 전에 눌러 건져요.'),
  seconds: 18,
  init() { return { ax: rnd(110, 260), ay: rnd(RIVER[0] + 40, RIVER[1] - 30), ph: 'find', bub: [], next: 0.8, sticks: STICKS, fly: null, rip: [], drift: [], t: 0, msg: null, fx2: 0, gone: 0, got: 0 }; },
  update(dt, S) {
    S.t += dt; if (S.msg) S.msg.at -= dt;
    if (S.ph === 'find') { S.ax = Math.min(330, S.ax + 3 * dt);
      if ((S.next -= dt) <= 0) { S.next = rnd(1.0, 1.7); S.bub.push({ x: S.ax + rnd(-7, 7), y: S.ay + rnd(-5, 5), t: 0, v: rnd(26, 38) }); } }
    for (const b of S.bub) { b.t += dt; b.x += b.v * dt; } // 떠오르는 동안 물살에 밀린다(1초에 26–38px)
    S.bub = S.bub.filter(b => b.t < 1.9);
    if (S.fly) { const f = S.fly; f.t += dt; if (f.t >= f.dur) { S.fly = null; S.fx.play('plop'); S.rip.push({ x: f.x, y: f.y, t: 0 });
        if (S.ph === 'find' && Math.hypot(f.x - S.ax, f.y - S.ay) < AXE_R) { S.ph = 'float'; S.fy = S.ay; S.fxx = S.ax; S.fx.play('glint'); S.msg = { t: tr('쇠도끼가 떠올랐어요! 얼른 건져요'), c: '#ffe29a', at: 1.4, x: Math.min(300, S.ax), y: S.ay - 40 }; }
        else { S.drift.push({ x: f.x, y: f.y, a: rnd(0, 3) }); S.msg = { t: S.sticks > 0 ? tr('여기는 아니에요') : tr('가지가 다 떨어졌어요'), c: '#e8e0c8', at: 0.9, x: f.x, y: f.y - 30 }; } } }
    if (S.ph === 'float') { S.fxx += 30 * dt; S.fy += Math.sin(S.t * 4) * 6 * dt; if (S.fxx > W + 10) { S.gone = 1; S.fx.play('miss'); } }
    for (const d of S.drift) d.x += 28 * dt; S.drift = S.drift.filter(d => d.x < W + 40);
    for (const r of S.rip) r.t += dt; S.rip = S.rip.filter(r => r.t < 1.2);
  },
  down(x, y, S) {
    if (S.ph === 'float') { if (Math.hypot(x - S.fxx, y - S.fy) < 34) { S.ph = 'got'; S.got = 1; S.fx.play('coin'); S.msg = { t: tr('손을 내밀어 집었어요!'), c: '#ffe29a', at: 1.4, x: S.fxx, y: S.fy - 34 }; } return; }
    if (S.ph !== 'find' || S.fly || S.sticks <= 0 || y < RIVER[0] - 10 || y > RIVER[1] + 10) return;
    S.sticks--; S.fly = { x, y, t: 0, dur: 0.35 + Math.hypot(x - 80, y - 400) / 900 }; S.fx.play('cast');
  },
  up() {},
  won: S => S.got > 0,
  lost: S => S.gone > 0 || (S.ph === 'find' && S.sticks <= 0 && !S.fly),
  failText: S => S.gone ? tr('도끼가 떠내려갔어요') : tr('가지가 다 떨어졌어요'),
  draw(g, S) {
    if (!bgArt(g, 'k25/bg')) { g.fillStyle = '#5a6a50'; g.fillRect(0, 0, W, H); }
    // 물살 줄
    g.strokeStyle = 'rgba(230,240,230,.14)'; g.lineWidth = 1.5; for (let r = 0; r < 7; r++) { const y = RIVER[0] + 14 + r * 30, off = (S.t * 30 + r * 40) % 80; g.beginPath(); for (let x = -80 + off; x < W; x += 80) { g.moveTo(x, y); g.lineTo(x + 34, y + 2); } g.stroke(); }
    // 바닥의 도끼 — 흐린 물 때문에 거의 안 보인다(아주 희미한 그림자만)
    if (S.ph === 'find') spr(g, 'k25/axe', S.ax, S.ay + 6, 16, { ay: 0.5, a: 0.05 });
    for (const b of S.bub) { if (b.t < 0.9) continue; const k = (b.t - 0.9) / 1, yy = b.y - 10; for (let i = 0; i < 3; i++) { /* 물속을 오르는 동안은 흐려서 안 보이고, 물 위에서야 터진다 */ g.strokeStyle = `rgba(240,250,255,${0.85 * (1 - k)})`; g.lineWidth = 1.4; g.beginPath(); g.arc(b.x + i * 5 - 5, yy - (i % 2) * 4, 2.5 + k * 6 + i, 0, 7); g.stroke(); } }
    for (const r of S.rip) { g.strokeStyle = `rgba(255,255,255,${0.6 * (1 - r.t / 1.2)})`; g.lineWidth = 2; g.beginPath(); g.ellipse(r.x, r.y, 10 + r.t * 30, 4 + r.t * 10, 0, 0, 7); g.stroke(); }
    for (const d of S.drift) spr(g, 'a37/stick', d.x, d.y, 10, { ay: 0.5, rot: d.a + S.t * 0.4, a: 0.85 });
    if (S.ph === 'float' || S.ph === 'got') { const x = S.ph === 'got' ? 150 : S.fxx, y = S.ph === 'got' ? 420 : S.fy;
      const gl = g.createRadialGradient(x, y, 2, x, y, 36); gl.addColorStop(0, 'rgba(255,236,170,.6)'); gl.addColorStop(1, 'rgba(255,236,170,0)'); g.fillStyle = gl; g.fillRect(x - 36, y - 36, 72, 72);
      spr(g, 'k25/axe', x, y, 34, { ay: 0.5, rot: Math.sin(S.t * 3) * 0.15 }); }
    spr(g, 'k25/elisha', 64, 486, 118); spr(g, 'k25/disciple', 150, 488, 112);
    if (S.fly) { const f = S.fly, k = f.t / f.dur, x = 86 + (f.x - 86) * k, y = 400 + (f.y - 400) * k - Math.sin(k * Math.PI) * 60; spr(g, 'a37/stick', x, y, 10, { ay: 0.5, rot: k * 9 }); }
    g.save(); g.font = '800 14px "Noto Sans KR",sans-serif'; g.textAlign = 'left'; g.lineWidth = 3; g.strokeStyle = 'rgba(14,20,14,.7)'; g.fillStyle = '#fff';
    const tip = S.ph === 'find' ? tr('거품을 보고 자리를 짐작해요 · 가지 {0}', S.sticks) : S.ph === 'float' ? tr('떠내려가기 전에 눌러 건져요!') : '';
    g.strokeText(tip, 14, 26); g.fillText(tip, 14, 26); g.restore();
    floatMsg(g, S.msg);
  },
  end(g, k, S) { this.update(0.016, S); this.draw(g, S);
    if (k > 0.3) { g.save(); g.globalAlpha = clamp((k - 0.3) * 2, 0, 1); g.fillStyle = 'rgba(20,26,16,.8)'; g.fillRect(0, 170, W, 84);
      g.font = '700 17px "Gowun Batang",serif'; g.textAlign = 'center'; g.fillStyle = '#f4ffe8'; g.fillText(tr('그것을 들라 하니'), W / 2, 200); g.fillText(tr('그 사람이 손을 내밀어 그것을 집으니라'), W / 2, 224);
      g.font = '600 11px "Noto Sans KR",sans-serif'; g.fillStyle = '#c8d8b0'; g.fillText(tr('왕하 6:7'), W / 2, 243); g.restore(); }
  },
};

/* ---------- 열두 살, 아버지의 집에서 (눅 2:41–51): 사흘 동안 무리 속에서 소년 예수 찾기 — 눈썰미 ---------- */
// 흰 옷에 붉은 띠를 맨 열두 살 소년을 찾는다. 비슷한 아이(흰 옷에 푸른 띠, 베이지 옷에 붉은 띠)가 섞여 걷는다.
// 첫날·둘째 날은 명절 거리의 무리 속을 걷고, 사흘째에는 성전 뜰에서 선생들 가운데 앉아 있다(2:46). 엉뚱한 사람을 누르면 잠깐 두리번거린다
const BOY_DAYS = [{ bg: 'e07/street', n: 14, decoy: 3 }, { bg: 'e07/street', n: 22, decoy: 5 }, { bg: 'e07/temple', n: 16, decoy: 5, sit: true }];
const boyJesus = {
  title: tr('열두 살, 아버지의 집에서'), task: tr('사흘 동안 무리 속에서 소년 예수 찾기'), art: ['e07/street', 'e07/temple', 'e07/jesus', 'e07/jesus-sit', 'e07/boy-a', 'e07/boy-b', 'e07/man', 'e07/woman', 'e07/elder'],
  ask: [tr('명절을 마치고 다들 돌아갈 때, 나는 예루살렘에 남았단다. 부모님은 동행 중에 있는 줄 알고 하룻길을 가셨지.'), tr('너도 함께 찾아보렴 — 흰 옷에 붉은 띠를 맨 아이야. 비슷한 아이들이 많단다!')],
  quote: tr('사흘 후에 성전에서 만난즉 그가 선생들 중에 앉으사 그들에게 듣기도 하시며 묻기도 하시니'), ref: tr('눅 2:46'),
  help: tr('흰 옷에 <b>붉은 띠</b>를 맨 소년을 찾아 눌러요. 푸른 띠·베이지 옷의 비슷한 아이가 섞여 있어요.<br>엉뚱한 사람을 누르면 잠깐 두리번거려요. 사흘(세 번) 찾기.'),
  seconds: 45,
  init() { const S = { day: 0, t: 0, msg: null, lock: 0, found: 0, flash: 0, sparks: [] }; this.crowd(S); return S; },
  crowd(S) { const D = BOY_DAYS[S.day], P = [], kinds = ['e07/man', 'e07/woman'];
    const put = (kind, opt = {}) => { const y = rnd(170, 470), dir = Math.random() < 0.5 ? 1 : -1; P.push({ kind, x: rnd(20, 380), y, dir, sp: opt.sit ? 0 : rnd(14, 34), ph: rnd(0, 7), ...opt }); };
    for (let i = 0; i < D.n; i++) put(kinds[i % 2]);
    for (let i = 0; i < D.decoy; i++) put(i % 2 ? 'e07/boy-a' : 'e07/boy-b');
    if (D.sit) { const gx = rnd(90, 310), gy = rnd(260, 420); for (let i = 0; i < 3; i++) P.push({ kind: 'e07/elder', x: gx + (i - 1) * 46, y: gy - (i === 1 ? 26 : 0), dir: i === 2 ? -1 : 1, sp: 0, ph: 0 });
      P.push({ kind: 'e07/jesus-sit', x: gx, y: gy + 22, dir: 1, sp: 0, ph: 0, me: 1 });
      const ox = gx < 200 ? 300 : 100; for (let i = 0; i < 3; i++) P.push({ kind: 'e07/elder', x: ox + (i - 1) * 46, y: 300 + (i % 2) * 20, dir: 1, sp: 0, ph: 0 }); } // 다른 선생 무리(가짜 자리)
    else put('e07/jesus', { me: 1, sp: rnd(18, 28) });
    S.P = P; },
  h: y => 54 + (y - 170) * 0.12, // 멀리(위) 작게
  update(dt, S) {
    S.t += dt; if (S.msg) S.msg.at -= dt; S.lock = Math.max(0, S.lock - dt); S.flash = Math.max(0, S.flash - dt);
    for (const p of S.P) if (p.sp) { p.x += p.dir * p.sp * dt; if (p.x < -30) p.x = W + 30; if (p.x > W + 30) p.x = -30; }
    for (const q of S.sparks) { q.x += q.vx * dt; q.y += q.vy * dt; q.life -= dt; } S.sparks = S.sparks.filter(q => q.life > 0);
    if (S.next && (S.next -= dt) <= 0) { S.next = 0; S.day++; if (S.day < BOY_DAYS.length) { this.crowd(S); S.fx.play('go'); } }
  },
  down(x, y, S) { if (S.lock || S.next || S.day >= BOY_DAYS.length) return;
    let hit = null; for (const p of [...S.P].sort((a, b) => b.y - a.y)) { const h = this.h(p.y), w = h * 0.34; if (Math.abs(x - p.x) < w && y < p.y && y > p.y - h) { hit = p; break; } } // 앞사람부터
    if (!hit) return;
    if (hit.me) { S.found++; S.flash = 1; S.fx.play('glint'); S.fx.play('coin'); S.next = 1.3; S.msg = { t: S.day < 2 ? tr('찾았어요! ({0}일째)', S.day + 1) : tr('성전에서 찾았어요!'), c: '#ffe29a', at: 1.2, x: hit.x, y: hit.y - this.h(hit.y) - 14 };
      for (let i = 0; i < 14; i++) { const a = rnd(0, 7), v = rnd(30, 90); S.sparks.push({ x: hit.x, y: hit.y - this.h(hit.y) / 2, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rnd(0.4, 0.9) }); } }
    else { S.lock = 1.1; S.fx.play('miss'); S.msg = { t: hit.kind.includes('boy') ? tr('다른 아이예요') : tr('아니에요'), c: '#ffc2a0', at: 0.9, x: hit.x, y: hit.y - this.h(hit.y) - 10 }; } },
  up() {},
  won: S => S.found >= BOY_DAYS.length,
  failText: () => tr('아직 찾지 못했어요'),
  draw(g, S) {
    const D = BOY_DAYS[Math.min(S.day, 2)];
    if (!bgArt(g, D.bg)) { g.fillStyle = '#c9b48e'; g.fillRect(0, 0, W, H); }
    for (const p of [...S.P].sort((a, b) => a.y - b.y)) { const h = this.h(p.y) * (p.kind.includes('sit') || p.kind.includes('elder') ? 0.8 : 1), bob = p.sp ? Math.abs(Math.sin(S.t * 6 + p.ph)) * 1.5 : 0;
      g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(p.x, p.y, h * 0.2, h * 0.05, 0, 0, 7); g.fill();
      spr(g, p.kind, p.x, p.y - bob, h, { flip: p.dir < 0 && !p.kind.includes('jesus-sit') && !p.kind.includes('elder') });
      if (p.me && S.next) { g.strokeStyle = `rgba(255,226,150,${0.9})`; g.lineWidth = 3; g.beginPath(); g.ellipse(p.x, p.y - h / 2, h * 0.32, h * 0.6, 0, 0, 7); g.stroke(); } }
    if (S.lock) { g.fillStyle = `rgba(30,20,10,${0.25 * S.lock})`; g.fillRect(0, 0, W, H); }
    for (const q of S.sparks) { g.fillStyle = `rgba(255,236,170,${clamp(q.life, 0, 1)})`; star(g, q.x, q.y, 4); }
    // 찾는 아이 그림표(왼쪽 위)
    g.save(); g.fillStyle = 'rgba(30,22,12,.72)'; rrect(g, 10, 36, 82, 96, 10); g.fill(); spr(g, 'e07/jesus', 51, 122, 76);
    g.font = '700 10px "Noto Sans KR",sans-serif'; g.textAlign = 'center'; g.fillStyle = '#ffe9c0'; g.fillText(tr('흰 옷 · 붉은 띠'), 51, 48); g.restore();
    g.save(); g.font = '800 14px "Noto Sans KR",sans-serif'; g.textAlign = 'left'; g.lineWidth = 3; g.strokeStyle = 'rgba(30,20,10,.7)'; g.fillStyle = '#fff';
    const t = tr('{0}일째 · {1} ({2}/3)', Math.min(S.day + 1, 3), D.sit ? tr('성전 뜰') : tr('명절 거리'), S.found); g.strokeText(t, 14, 26); g.fillText(t, 14, 26); g.restore();
    floatMsg(g, S.msg);
  },
  end(g, k, S) { S.day = 2; this.update(0.016, S); this.draw(g, S);
    if (k > 0.3) { g.save(); g.globalAlpha = clamp((k - 0.3) * 2, 0, 1); g.fillStyle = 'rgba(30,22,10,.8)'; g.fillRect(0, 150, W, 84);
      g.font = '700 16px "Gowun Batang",serif'; g.textAlign = 'center'; g.fillStyle = '#fff0d6'; g.fillText(tr('내가 내 아버지 집에 있어야 될 줄을'), W / 2, 180); g.fillText(tr('알지 못하셨나이까'), W / 2, 204);
      g.font = '600 11px "Noto Sans KR",sans-serif'; g.fillStyle = '#e6cfa6'; g.fillText(tr('눅 2:49'), W / 2, 223); g.restore(); }
  },
};

/* ---------- 애굽으로 피하다 (마 2:13–15): 밤길에 헤롯 병정의 횃불을 피해 — 멈췄다 가기 ---------- */
// 누르고 있으면 요셉이 나귀를 끌고 남쪽으로 걷고(길이 흐른다), 떼면 멈춘다. 언덕 위에 병정이 나타나 횃불을 들면(먼저 '!') 곧 불빛이 길을 훑는다.
// 불빛 안에서 걸으면 '눈에 띔'이 빨리, 멈춰 있어도 천천히 찬다 — 바위·종려나무 뒤에 멈춰 있으면 숨는다. 다 차면 실패, 애굽 땅까지 가면 성공
const ROAD = 960, FAM_X = 116, ROAD_Y = 432;
const egypt = {
  title: tr('애굽으로 피하다'), task: tr('횃불을 피해 애굽 땅까지'), art: ['e05/bg', 'e05/family', 'e05/palm', 'e05/rock', 'a04/guard'],
  ask: [tr('헤롯이 아기를 찾아 죽이려 하니, 그 밤에 일어나 애굽으로 떠나라는 말씀을 꿈에 받았단다.'), tr('요셉과 함께 길을 가 주렴 — 횃불이 오면 바위나 나무 뒤에 멈춰 숨고!')],
  quote: tr('요셉이 일어나서 밤에 아기와 그의 어머니를 데리고 애굽으로 떠나가'), ref: tr('마 2:14'),
  help: tr('누르고 있으면 걷고, 떼면 멈춰요. 언덕에 병정이 나타나면(!) 곧 횃불이 길을 훑어요.<br>불빛 안에서 걸으면 들켜요 — <b>바위·종려나무 뒤</b>에 멈추면 숨어요. 애굽 땅까지!'),
  seconds: 38,
  init() { const C = []; for (let x = 140; x < ROAD - 60; x += rnd(110, 160)) C.push({ x, k: C.length % 2 ? 'e05/rock' : 'e05/palm' });
    return { px: 0, hold: false, C, beam: null, nextBeam: 2.2, seen: 0, t: 0, msg: null, step: 0 }; },
  hidden(S) { return !S.hold && S.C.some(c => Math.abs(c.x - S.px - 20) < 44); }, // 가족(화면 FAM_X) 둘레에 가림이 있고 멈춰 있으면 숨는다
  update(dt, S) {
    S.t += dt; if (S.msg) S.msg.at -= dt;
    if (S.hold) { S.px = Math.min(ROAD, S.px + 48 * dt); if ((S.step -= dt) <= 0) { S.step = 0.45; S.fx.play('creep'); } }
    if (!S.beam && (S.nextBeam -= dt) <= 0) { const dir = Math.random() < 0.5 ? 1 : -1; S.beam = { warn: 0.9, x: dir > 0 ? -60 : W + 60, dir, sp: rnd(95, 125), gx: dir > 0 ? rnd(40, 160) : rnd(240, 360) }; S.fx.play('hum'); }
    const B = S.beam; let lit = 0;
    if (B) { if (B.warn > 0) B.warn -= dt; else { B.x += B.dir * B.sp * dt; const d = Math.abs(B.x - FAM_X); lit = d < 46 ? 1 - d / 46 : 0;
        if (B.x < -80 || B.x > W + 80) { S.beam = null; S.nextBeam = rnd(1.8, 3.4); } } }
    const hid = this.hidden(S);
    if (lit > 0 && !hid) { S.seen = Math.min(1, S.seen + (S.hold ? 2.8 : 1.9) * lit * dt); if (!S.msg || S.msg.at < 0) S.msg = { t: S.hold ? tr('불빛 안에서 걷고 있어요!') : tr('숨을 곳이 없어요…'), c: '#ffc28a', at: 0.5, x: FAM_X + 60, y: 330 }; }
    else S.seen = Math.max(0, S.seen - 0.1 * dt);
    S.lit = lit; S.hid = hid;
  },
  down(x, y, S) { S.hold = true; },
  up(S) { S.hold = false; },
  key(k, S) { if (k === ' ' || k === 'ArrowRight') { S.hold = true; clearTimeout(S._kt); S._kt = setTimeout(() => S.hold = false, 160); return; } return false; },
  won: S => S.px >= ROAD,
  lost: S => S.seen >= 1,
  failText: S => S.seen >= 1 ? tr('헤롯의 병정에게 들켰어요') : tr('날이 밝아 왔어요'),
  dark(g, n, x, y, h, o = {}) { g.save(); g.filter = 'brightness(0.5) saturate(0.7)'; spr(g, n, x, y, h, o); g.restore(); }, // 낮빛 그림을 밤빛으로
  draw(g, S) {
    // 바탕은 천천히(먼 산), 길과 가림은 걷는 만큼 흐른다
    const A = art('e05/bg'); if (A) { const off = (S.px * 0.25) % W; g.drawImage(A, -off, 0, W, H); g.save(); g.translate(2 * W - off, 0); g.scale(-1, 1); g.drawImage(A, 0, 0, W, H); g.restore(); } else { g.fillStyle = '#101830'; g.fillRect(0, 0, W, H); }
    const B = S.beam;
    if (B) { const sx = B.gx; spr(g, 'a04/guard', sx, 312, 52, { flip: B.dir < 0 });
      if (B.warn > 0) { g.font = '900 20px "Noto Sans KR",sans-serif'; g.textAlign = 'center'; g.lineWidth = 4; g.strokeStyle = 'rgba(30,10,0,.7)'; g.strokeText('!', sx, 250); g.fillStyle = '#ffd08a'; g.fillText('!', sx, 250); }
      else { const cone = g.createRadialGradient(B.x, ROAD_Y - 10, 4, B.x, ROAD_Y - 10, 90); cone.addColorStop(0, 'rgba(255,190,100,.5)'); cone.addColorStop(1, 'rgba(255,190,100,0)');
        g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,190,110,.22)'; g.beginPath(); g.moveTo(sx, 290); g.lineTo(B.x - 50, ROAD_Y + 20); g.lineTo(B.x + 50, ROAD_Y + 20); g.closePath(); g.fill(); g.fillStyle = cone; g.fillRect(B.x - 90, ROAD_Y - 100, 180, 160); g.restore(); } } // 밤빛 위에서 보이게 더해 칠한다
    // 애굽 땅 표 (길 끝)
    const ex = ROAD - S.px + FAM_X + 80; if (ex < W + 60) { g.fillStyle = 'rgba(255,230,170,.85)'; g.font = '800 13px "Noto Sans KR",sans-serif'; g.textAlign = 'center'; g.fillText(tr('애굽 땅'), ex, ROAD_Y - 60); g.fillStyle = '#c8a060'; g.beginPath(); g.moveTo(ex - 22, ROAD_Y - 14); g.lineTo(ex, ROAD_Y - 50); g.lineTo(ex + 22, ROAD_Y - 14); g.fill(); }
    // 가림 — 가족 뒤에 있는 것 먼저, 가족, 앞의 가림(가족을 가린다)
    const bob = S.hold ? Math.abs(Math.sin(S.t * 6)) * 1.5 : 0, cov = c => this.dark(g, c.k, c.x - S.px + FAM_X, ROAD_Y + (c.k.includes('rock') ? 14 : 18), c.k.includes('rock') ? 60 : 112);
    g.save(); g.globalAlpha = S.hid ? 0.75 : 1; this.dark(g, 'e05/family', FAM_X, ROAD_Y + 10 - bob, 78); g.restore();
    for (const c of S.C) { const x = c.x - S.px + FAM_X; if (x > -80 && x < W + 80) cov(c); }
    if (S.hid) { g.font = '700 11px "Noto Sans KR",sans-serif'; g.textAlign = 'center'; g.fillStyle = 'rgba(200,230,255,.85)'; g.fillText(tr('숨었어요'), FAM_X, ROAD_Y + 34); }
    // 막대들
    g.save(); g.font = '800 13px "Noto Sans KR",sans-serif'; g.textAlign = 'left'; g.fillStyle = '#e8ecf8'; g.fillText(tr('눈에 띔'), 14, 28);
    g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(66, 18, 90, 12); g.fillStyle = S.seen > 0.66 ? '#ff7a5a' : '#ffb36a'; g.fillRect(66, 18, 90 * S.seen, 12);
    g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(180, 22, 200, 5); g.fillStyle = '#ffe29a'; g.fillRect(180, 22, 200 * S.px / ROAD, 5); g.fillStyle = '#e8ecf8'; g.font = '700 10px "Noto Sans KR",sans-serif'; g.textAlign = 'right'; g.fillText(tr('애굽까지'), W - 20, 42); g.restore();
    floatMsg(g, S.msg);
  },
  end(g, k, S) { S.beam = null; this.update(0.016, S); this.draw(g, S);
    if (k > 0.3) { g.save(); g.globalAlpha = clamp((k - 0.3) * 2, 0, 1); g.fillStyle = 'rgba(10,14,30,.82)'; g.fillRect(0, 140, W, 84);
      g.font = '700 16px "Gowun Batang",serif'; g.textAlign = 'center'; g.fillStyle = '#eef2ff'; g.fillText(tr('애굽으로부터 내 아들을 불렀다 함을'), W / 2, 170); g.fillText(tr('이루려 하심이라'), W / 2, 194);
      g.font = '600 11px "Noto Sans KR",sans-serif'; g.fillStyle = '#b8c2e0'; g.fillText(tr('마 2:15'), W / 2, 213); g.restore(); }
  },
};

/* ---------- 나일강의 갈대 상자 (출 2:1–10): 물살을 타고 바로의 딸에게 — 피하기 ---------- */
// 위에서 내려다본 강. 끌거나 방향키로 갈대 상자를 좌우로 몬다. 강 가운데일수록 물살이 빨라 빨리 가지만 악어·소용돌이도 가운데에 많다.
// 하마는 먼저 물거품(0.9초)이 일고 솟는다. 소용돌이는 가까이 가면 끌어당긴다. 세 번 부딪히면 실패. 끝은 목욕하러 나온 바로의 딸(2:5–6).
const NILE = 3300, NB_Y = 392, BANK = 62, NR = 19;
const nileSpeed = x => 72 + 78 * clamp(1 - Math.abs(x - W / 2) / (W / 2 - BANK), 0, 1); // 가장자리 72, 가운데 150 px/s
const nile = {
  title: tr('나일강의 갈대 상자'), task: tr('물살을 타고 바로의 딸에게'), art: ['m02/river', 'm02/basket', 'm02/croc', 'm02/hippo', 'm02/lotus', 'm02/princess', 'm02/miriam'],
  ask: [tr('그 갈대 상자를 이번엔 네가 몰아 주렴 — 바로의 딸이 목욕하던 물가까지.'), tr('악어와 하마, 소용돌이를 피해서! 강 가운데로 갈수록 물살이 빠르단다.')],
  quote: tr('갈대 상자를 가져다가 역청과 나무 진을 칠하고 아기를 거기 담아 나일 강 가 갈대 사이에 두매'), ref: tr('출 2:3'),
  help: tr('끌거나 ←→ 키로 상자를 좌우로 몰아요. <b>가운데 물살이 빨라요</b> — 가장자리는 느려요.<br>하마는 물거품이 인 뒤 솟아요. 소용돌이는 끌어당겨요. 세 번 부딪히면 실패!'),
  seconds: 30,
  init() { return { d: 0, x: W / 2, tx: W / 2, O: [], next: 420, lot: 300, hits: 0, inv: 0, spin: 0, stall: 0, flash: 0, t: 0, msg: null, drops: [] }; },
  spawn(S, wy) {
    const r = Math.random(), late = S.d / NILE;
    if (r < 0.4) { const up = Math.random() < 0.5; S.O.push({ k: 'croc', wy, x: rnd(95, 305), up, ph: rnd(0, 6), sw: up ? 26 : -34 }); }
    else if (r < 0.7) S.O.push({ k: 'hippo', wy, x: rnd(95, 305), st: 'sub', tm: 0 });
    else S.O.push({ k: 'whirl', wy, x: rnd(135, 265), r: 0 });
    S.next = wy + rnd(125, 185) - 35 * late; // 갈수록 촘촘
  },
  sy: (S, o) => NB_Y - (o.wy - S.d),
  update(dt, S) {
    S.t += dt; if (S.msg) S.msg.at -= dt; S.inv -= dt; S.flash -= dt; S.spin = Math.max(0, S.spin - dt * 1.4); S.stall -= dt;
    if (S.d >= NILE) return; // 끝 연출에서는 멈춤
    // 좌우: 손가락을 따라가되 너무 빠르진 않게, 소용돌이가 끌어당긴다
    let vx = clamp((S.tx - S.x) * 7, -280, 280);
    for (const o of S.O) if (o.k === 'whirl') { const dx = o.x - S.x, dy = this.sy(S, o) - NB_Y, dd = Math.hypot(dx, dy); if (dd < 92) vx += dx / (dd || 1) * 150 * (1 - dd / 92); }
    S.x = clamp(S.x + vx * dt, BANK + NR, W - BANK - NR);
    const v = nileSpeed(S.x) * (S.stall > 0 ? 0.2 : 1); S.d = Math.min(NILE, S.d + v * dt);
    while (S.next < S.d + 560 && S.next < NILE - 160) this.spawn(S, S.next);
    if (S.lot < S.d + 560) { S.O.push({ k: 'lotus', wy: S.lot, x: Math.random() < 0.5 ? rnd(70, 110) : rnd(290, 330), rot: rnd(0, 6) }); S.lot += rnd(180, 320); }
    for (const o of S.O) {
      const y = this.sy(S, o);
      if (o.k === 'croc') { o.wy += o.sw * dt; o.ph += dt * 1.6; o.x = clamp(o.x + Math.sin(o.ph) * 18 * dt, 80, 320); }
      if (o.k === 'whirl') o.r += dt * 3.2;
      if (o.k === 'hippo') { // 화면에 들어오면 거품 → 솟음 → 다시 잠김
        if (o.st === 'sub' && y > 70) { o.st = 'warn'; o.tm = 0.9; S.fx.play('gurgle'); }
        else if (o.st === 'warn' && (o.tm -= dt) <= 0) { o.st = 'up'; o.tm = 2.4; S.fx.play('splash'); }
        else if (o.st === 'up' && (o.tm -= dt) <= 0) { o.st = 'down'; o.tm = 0.5; }
        else if (o.st === 'down') o.tm -= dt; }
      if (S.inv > 0 || Math.abs(y - NB_Y) > 70) continue;
      let hit = false, what = '';
      if (o.k === 'croc') { const cy = clamp(NB_Y, y - 50, y + 50); hit = Math.hypot(S.x - o.x, NB_Y - cy) < NR + 11; what = tr('악어!'); }
      else if (o.k === 'hippo') { hit = o.st === 'up' && Math.hypot(S.x - o.x, NB_Y - y) < NR + 28; what = tr('하마!'); }
      else if (o.k === 'whirl') { hit = Math.hypot(S.x - o.x, NB_Y - y) < NR + 6; what = tr('소용돌이!'); }
      if (hit) { S.hits++; S.inv = 1.5; S.spin = 1; S.stall = 0.9; S.flash = 0.35; S.fx.play('thud'); S.fx.play('splash');
        S.msg = { t: S.hits >= 3 ? tr('상자가 뒤집혔어요…') : what, c: '#ffb08a', at: 0.9, x: S.x, y: NB_Y - 50 };
        if (o.k === 'whirl') { o.wy = -999; S.x += S.x < W / 2 ? 30 : -30; } // 한 번 휘돌고 빠져나온다
        if (o.k === 'hippo') { o.st = 'down'; o.tm = 0.5; } }
    }
    S.O = S.O.filter(o => this.sy(S, o) < H + 120);
    if (Math.random() < dt * 8) S.drops.push({ x: S.x + rnd(-14, 14), y: NB_Y + 26, a: 1 }); // 상자 뒤 물결
    for (const p of S.drops) { p.y += (nileSpeed(S.x) * 0.9) * dt; p.a -= dt * 1.2; } S.drops = S.drops.filter(p => p.a > 0);
  },
  down(x, y, S) { S.tx = x; },
  move(x, y, S) { S.tx = x; },
  up() {},
  key(k, S) { if (k === 'ArrowLeft') S.tx = Math.max(BANK, S.x - 46); else if (k === 'ArrowRight') S.tx = Math.min(W - BANK, S.x + 46); else return false; },
  won: S => S.d >= NILE,
  lost: S => S.hits >= 3,
  failText: S => S.hits >= 3 ? tr('갈대 상자가 뒤집혔어요') : tr('바로의 딸이 돌아가 버렸어요'),
  river(g, S) {
    const A = art('m02/river');
    if (!A) { g.fillStyle = '#4e6a4a'; g.fillRect(0, 0, W, H); g.fillStyle = '#5d7e72'; g.fillRect(BANK, 0, W - 2 * BANK, H); return; }
    const off = S.d % (2 * H); // 위아래로 뒤집어 이어 붙여 끝없이 흐르게
    for (const b of [off - 2 * H, off]) { g.drawImage(A, 0, b, W, H); g.save(); g.translate(0, b + 2 * H); g.scale(1, -1); g.drawImage(A, 0, 0, W, H); g.restore(); }
    // 가운데 빠른 물살 — 옅은 물줄기
    g.save(); g.globalAlpha = 0.18; g.strokeStyle = '#e8f4ff'; g.lineWidth = 1.5;
    for (let i = 0; i < 9; i++) { const x = 150 + (i * 37) % 100, y = ((i * 131 + S.d * 1.1) % (H + 80)) - 40; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 26); g.stroke(); }
    g.restore();
  },
  whirl(g, x, y, r) {
    g.save(); g.translate(x, y); g.rotate(-r);
    const sh = g.createRadialGradient(0, 0, 2, 0, 0, 46); sh.addColorStop(0, 'rgba(10,30,30,.7)'); sh.addColorStop(1, 'rgba(10,30,30,0)'); g.fillStyle = sh; g.beginPath(); g.arc(0, 0, 46, 0, 7); g.fill();
    g.strokeStyle = 'rgba(220,240,235,.55)'; g.lineWidth = 2;
    for (let a = 0; a < 3; a++) { g.beginPath(); for (let i = 0; i <= 30; i++) { const t = i / 30, ang = a * 2.09 + t * 4.2, rr = 6 + t * 38; g.lineTo(Math.cos(ang) * rr, Math.sin(ang) * rr); } g.stroke(); }
    g.restore();
  },
  draw(g, S) {
    this.river(g, S);
    for (const o of S.O) { const y = this.sy(S, o); if (y < -120 || y > H + 120) continue;
      if (o.k === 'lotus') spr(g, 'm02/lotus', o.x, y, 46, { ay: 0.5, rot: o.rot });
      else if (o.k === 'whirl') this.whirl(g, o.x, y, o.r); }
    for (const o of S.O) { const y = this.sy(S, o); if (y < -120 || y > H + 120) continue;
      if (o.k === 'croc') { if (!spr(g, 'm02/croc', o.x, y, 116, { ay: 0.5, rot: (o.up ? 0 : Math.PI) + Math.cos(o.ph) * 0.12 })) { g.fillStyle = '#5c6e48'; g.fillRect(o.x - 9, y - 50, 18, 100); } }
      else if (o.k === 'hippo') {
        if (o.st === 'warn' || o.st === 'up' || o.st === 'down') { // 거품 고리 — 미리 알림
          g.save(); g.strokeStyle = 'rgba(235,250,245,.7)'; g.lineWidth = 2; for (let i = 0; i < 3; i++) { const p = (S.t * 1.4 + i / 3) % 1; g.globalAlpha = 1 - p; g.beginPath(); g.ellipse(o.x, y, 14 + p * 34, 10 + p * 24, 0, 0, 7); g.stroke(); } g.restore();
          if (o.st === 'warn') { g.font = '900 20px "Noto Sans KR",sans-serif'; g.textAlign = 'center'; g.lineWidth = 4; g.strokeStyle = 'rgba(20,20,10,.7)'; g.strokeText('!', o.x, y - 30); g.fillStyle = '#ffe08a'; g.fillText('!', o.x, y - 30); } }
        const k = o.st === 'up' ? clamp((2.4 - o.tm) * 4, 0, 1) : o.st === 'down' ? clamp(o.tm * 2, 0, 1) : 0;
        if (k > 0) { if (!spr(g, 'm02/hippo', o.x, y, 64 * (0.6 + 0.4 * k), { ay: 0.5, a: k })) { g.fillStyle = '#7a6058'; g.beginPath(); g.ellipse(o.x, y, 26, 30, 0, 0, 7); g.fill(); } } } }
    // 물결 자국과 상자
    g.save(); g.strokeStyle = 'rgba(235,250,245,.6)'; g.lineWidth = 1.5; for (const p of S.drops) { g.globalAlpha = p.a * 0.6; g.beginPath(); g.arc(p.x, p.y, 4 + (1 - p.a) * 10, 0.2, Math.PI - 0.2); g.stroke(); } g.restore();
    const blink = S.inv > 0 && Math.floor(S.inv * 10) % 2 === 0;
    g.save(); g.globalAlpha = blink ? 0.45 : 1;
    if (!spr(g, 'm02/basket', S.x, NB_Y, 62, { ay: 0.5, rot: S.spin * Math.PI * 2 + Math.sin(S.t * 2) * 0.06 })) { g.fillStyle = '#a07a44'; g.beginPath(); g.ellipse(S.x, NB_Y, 20, 26, 0, 0, 7); g.fill(); }
    g.restore();
    if (S.flash > 0) { g.fillStyle = `rgba(255,60,40,${S.flash * 0.6})`; g.fillRect(0, 0, W, H); }
    // 누이 미리암이 갈대 사이로 따라오며 지켜본다(2:4)
    spr(g, 'm02/miriam', -6, 300 + Math.sin(S.t * 3) * 3, 92, { ax: 0 });
    // 위: 부딪힌 수, 바로의 딸까지
    g.save(); g.font = '800 13px "Noto Sans KR",sans-serif'; g.textAlign = 'left'; g.fillStyle = '#eef4ea'; g.fillText(tr('상자'), 14, 28);
    for (let i = 0; i < 3; i++) { g.fillStyle = i < 3 - S.hits ? '#d8b070' : 'rgba(255,255,255,.2)'; g.beginPath(); g.ellipse(56 + i * 20, 23, 7, 5, 0, 0, 7); g.fill(); }
    g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(140, 22, 240, 5); g.fillStyle = '#ffe29a'; g.fillRect(140, 22, 240 * S.d / NILE, 5);
    g.fillStyle = '#eef4ea'; g.font = '700 10px "Noto Sans KR",sans-serif'; g.textAlign = 'right'; g.fillText(tr('바로의 딸까지'), W - 20, 42); g.restore();
    floatMsg(g, S.msg);
  },
  end(g, k, S) {
    S.O = S.O.filter(o => o.k === 'lotus'); this.river(g, S);
    for (const o of S.O) { const y = this.sy(S, o); spr(g, 'm02/lotus', o.x, y, 46, { ay: 0.5, rot: o.rot }); }
    const e = ease(clamp(k * 1.4, 0, 1)), bx = S.x + (210 - S.x) * e, by = NB_Y + (300 - NB_Y) * e;
    const py = 70 + 190 * ease(clamp(k * 1.6, 0, 1)); spr(g, 'm02/princess', 205, py, 170); // 물가로 내려오는 바로의 딸
    g.save(); g.translate(205, py - 6); g.scale(1, 0.2); const wl = g.createRadialGradient(0, 0, 40, 0, 0, 175); wl.addColorStop(0, 'rgba(92,118,84,.95)'); wl.addColorStop(0.7, 'rgba(92,118,84,.85)'); wl.addColorStop(1, 'rgba(92,118,84,0)'); // 그림 밑동이 물에 잠긴 듯 — 가장자리는 흐리게
    g.fillStyle = wl; g.beginPath(); g.arc(0, 0, 175, 0, 7); g.fill(); g.restore(); g.save(); g.strokeStyle = 'rgba(235,250,240,.5)'; g.lineWidth = 1.5; for (let i = 0; i < 5; i++) { g.beginPath(); g.ellipse(110 + i * 48, py - 14 + (i % 2) * 6, 22, 4, 0, 0, Math.PI); g.stroke(); } g.restore();
    spr(g, 'm02/basket', bx, by, 62, { ay: 0.5, rot: Math.sin(S.t * 2) * 0.06 });
    if (k > 0.35) { g.save(); g.globalAlpha = clamp((k - 0.35) * 2, 0, 1); g.fillStyle = 'rgba(18,24,16,.82)'; g.fillRect(0, 372, W, 96);
      g.font = '700 16px "Gowun Batang",serif'; g.textAlign = 'center'; g.fillStyle = '#f2f0e2'; g.fillText(tr('그가 그의 이름을 모세라 하여 이르되'), W / 2, 402); g.fillText(tr('이는 내가 그를 물에서 건져내었음이라'), W / 2, 426);
      g.font = '600 11px "Noto Sans KR",sans-serif'; g.fillStyle = '#c8c8b0'; g.fillText(tr('출 2:10'), W / 2, 448); g.restore(); }
  },
};

/* ---------- 엘리사의 마지막 화살 (왕하 13:14–19): 동쪽 창으로 구원의 화살 → 땅을 끝까지 치기 ---------- */
// 1) 누르고 있으면 활을 당기고(힘), 끄는 만큼 겨냥이 움직인다. 엘리사의 손이 얹혀(13:16) 알맞게 당기면 겨냥이 덜 흔들리고,
//    너무 오래 당기고 있으면 팔이 떨린다. 떼면 쏜다 — 힘이 모자라면 화살이 못 미친다. 창 너머 아람 진(아벡)에 맞으면 13:17.
// 2) 화살 묶음으로 땅을 친다: 팔이 올라가 화살이 빛날 때 누르면 한 번. 일찍 누르면 헛침, 빛이 지나도록 머뭇거리면 '멈춤'.
//    여섯 번(대여섯 번, 13:19) 치면 성공, 세 번 머뭇거리면 실패 — 왕처럼 멈춘 것(13:18).
const KWIN = { x0: 132, x1: 270, y0: 88, y1: 242 }, STRIKES = 6;
const lastArrow = {
  title: tr('엘리사의 마지막 화살'), task: tr('구원의 화살을 쏘고, 땅을 끝까지 쳐라'), art: ['k30/bg', 'k30/king', 'k30/strike', 'k30/elisha', 'k30/camp'],
  ask: [tr('이번엔 네가 왕의 활을 잡아 보렴 — 내 손을 네 손 위에 얹으마. 동쪽 창 너머 아람 진을 겨누어라.'), tr('그다음엔 화살로 땅을 쳐라. 세 번 치고 멈추지 말고, 끝까지!')],
  quote: tr('엘리사가 또 이르되 화살들을 집으소서 곧 집으매 엘리사가 또 이스라엘 왕에게 이르되 땅을 치소서'), ref: tr('왕하 13:18'),
  help: tr('<b>누르고 있으면</b> 활을 당기고, 끄는 만큼 겨냥이 움직여요. 힘이 금빛일 때 떼면 쏴요 — 창 너머 <b>아람 진</b>을 맞히세요.<br>그다음엔 화살이 빛날 때 눌러 땅을 쳐요. 여섯 번! 머뭇거리면 멈춘 것이 돼요(세 번이면 실패).'),
  seconds: 13,
  init() {
    return { ph: 'aim', t: 0, aim: { x: 201, y: 196 }, hold: false, p: 0, over: 0, grab: null, cx: rnd(158, 244), cy: rnd(188, 214), shot: null, hitT: 0,
      n: 0, stop: 0, ring: 0, rise: rnd(0.35, 0.8), win: 0, swing: 0, dust: [], msg: null, fl: rnd(0, 9) };
  },
  sway(S) { // 겨냥 흔들림: 알맞게 당기면(엘리사의 손) 잔잔, 덜 당기면 보통, 너무 오래 당기면 떨림
    const A = !S.hold ? 9 : S.p >= 0.72 && S.over < 0.55 ? 5 : S.over >= 0.55 ? 9 + Math.min(14, (S.over - 0.55) * 20) : 8, t = S.t + S.fl;
    return [A * (Math.sin(t * 2.3) * 0.6 + Math.sin(t * 3.9 + 1) * 0.4), A * 0.8 * (Math.sin(t * 2.9 + 2) * 0.6 + Math.sin(t * 4.4) * 0.4)];
  },
  update(dt, S) {
    S.t += dt; if (S.msg) S.msg.at -= dt; S.hitT -= dt; S.swing = Math.max(0, S.swing - dt * 5);
    for (const d of S.dust) { d.x += d.vx * dt; d.y += d.vy * dt; d.vy += 30 * dt; d.a -= dt * 1.6; } S.dust = S.dust.filter(d => d.a > 0);
    if (S.ph === 'aim') {
      if (S.hold) { S.p = Math.min(1.1, S.p + dt / 0.95); if (S.p >= 1) S.over += dt; if (S.p >= 1 && Math.random() < dt * 3) S.fx.play('creak'); }
      const A = S.shot; if (A) { A.k += dt / 0.55;
        if (A.k >= 1 && !A.done) { A.done = true;
          if (Math.hypot((A.tx - S.cx) / 17, (A.ty - S.cy) / 9) < 1) { S.hitT = 1.6; S.fx.play('bonus'); S.msg = { t: tr('여호와의 구원의 화살!'), c: '#ffe39a', at: 1.4, x: 200, y: 290 }; S.ph = 'hit'; S.next = 1.6; }
          else { S.fx.play('miss'); S.msg = { t: A.short ? tr('힘이 모자라 못 미쳤어요') : tr('빗나갔어요 — 다시'), c: '#ffc0a0', at: 0.9, x: 200, y: 290 }; S.reload = 0.7; } }
        if (A.k >= 1.5) S.shot = null; }
      if (S.reload > 0) S.reload -= dt;
    } else if (S.ph === 'hit') { if ((S.next -= dt) <= 0) { S.ph = 'strike'; S.ring = 0; S.fx.play('pick'); } }
    else if (S.ph === 'strike' && S.n < STRIKES) { // 팔이 올라가는 동안 고리가 차고, 다 차면 화살이 빛나는 동안(win)만 친다
      if (S.ring < 1) { S.ring = Math.min(1, S.ring + dt / S.rise); if (S.ring >= 1) { S.win = S.n >= 3 ? 0.4 : 0.48; S.fx.play('glint'); } }
      else if ((S.win -= dt) <= 0) { S.stop++; S.fx.play('late'); S.msg = { t: S.stop >= 3 ? tr('왕이 멈추었어요…') : tr('머뭇거렸어요 — 계속 치세요!'), c: '#ffb08a', at: 0.9, x: 200, y: 300 }; this.reset(S); }
    }
  },
  reset(S) { S.ring = 0; S.rise = rnd(0.35, 0.8); },
  down(x, y, S) {
    if (S.ph === 'aim') { if (S.shot || S.reload > 0) return; S.hold = true; S.p = 0; S.over = 0; S.grab = { x, y, ax: S.aim.x, ay: S.aim.y }; S.fx.play('creak'); }
    else if (S.ph === 'strike' && S.n < STRIKES) {
      if (S.ring >= 1) { S.n++; S.swing = 1; S.fx.play('thud'); for (let i = 0; i < 10; i++) S.dust.push({ x: 196 + rnd(-20, 20), y: 452, vx: rnd(-60, 60), vy: rnd(-70, -20), a: 1 });
        if (S.n >= STRIKES) S.fx.play('bonus'); this.reset(S); }
      else { S.fx.play('miss'); S.msg = { t: tr('아직 — 팔이 다 올라가면!'), c: '#ffd9a0', at: 0.7, x: 200, y: 300 }; this.reset(S); }
    }
  },
  move(x, y, S) { if (S.ph === 'aim' && S.hold && S.grab) { S.aim.x = clamp(S.grab.ax + (x - S.grab.x), KWIN.x0, KWIN.x1); S.aim.y = clamp(S.grab.ay + (y - S.grab.y), KWIN.y0, KWIN.y1); } },
  up(S) { if (S.ph !== 'aim' || !S.hold) return; S.hold = false; const [sx, sy] = this.sway(S), short = S.p < 0.72;
    S.shot = { k: 0, tx: S.aim.x + sx, ty: S.aim.y + sy + (short ? (0.72 - S.p) * 160 : 0), short }; S.fx.play('swish'); S.p = 0; S.over = 0; },
  key(k, S) { if (k === ' ') { if (S.ph === 'strike') this.down(0, 0, S); else return false; } else if (k.startsWith('Arrow') && S.ph === 'aim') { const d = { ArrowLeft: [-6, 0], ArrowRight: [6, 0], ArrowUp: [0, -6], ArrowDown: [0, 6] }[k]; if (!d) return false; S.aim.x = clamp(S.aim.x + d[0], KWIN.x0, KWIN.x1); S.aim.y = clamp(S.aim.y + d[1], KWIN.y0, KWIN.y1); } else return false; },
  won: S => S.n >= STRIKES,
  lost: S => S.stop >= 3,
  failText: S => S.stop >= 3 ? tr('세 번 머뭇거리고 멈추었어요 (13:18)') : S.ph === 'aim' ? tr('화살을 쏘지 못했어요') : tr('날이 저물었어요'),
  scene(g, S, k = 0) {
    if (!bgArt(g, 'k30/bg')) { g.fillStyle = '#3a2a1c'; g.fillRect(0, 0, W, H); g.fillStyle = '#e8b878'; g.fillRect(KWIN.x0, KWIN.y0, KWIN.x1 - KWIN.x0, KWIN.y1 - KWIN.y0); }
    spr(g, 'k30/camp', S.cx, S.cy + 14, 34 + 4 * k); // 멀리 아벡의 아람 진
    if (S.hitT > 0 || k) { g.save(); g.globalCompositeOperation = 'lighter'; const a = k || clamp(S.hitT, 0, 1), r = g.createRadialGradient(S.cx, S.cy, 2, S.cx, S.cy, 60); r.addColorStop(0, `rgba(255,230,150,${0.7 * a})`); r.addColorStop(1, 'rgba(255,230,150,0)'); g.fillStyle = r; g.fillRect(S.cx - 60, S.cy - 60, 120, 120); g.restore(); }
    spr(g, 'k30/elisha', 300, 478, 118, { flip: true });
  },
  draw(g, S) {
    this.scene(g, S);
    if (S.ph === 'aim' || S.ph === 'hit') {
      // 화살 (멀어질수록 작게)
      const A = S.shot, ox = 150, oy = 300;
      if (A) { const k = Math.min(1, A.k), x = ox + (A.tx - ox) * k, y = oy + (A.ty - oy) * k - Math.sin(k * Math.PI) * 30, L = 34 * (1 - k * 0.8), ang = Math.atan2(A.ty - oy, A.tx - ox);
        if (A.k < 1.02) { g.save(); g.translate(x, y); g.rotate(ang); g.strokeStyle = '#3a2a18'; g.lineWidth = 2.2 * (1 - k * 0.6); g.beginPath(); g.moveTo(-L, 0); g.lineTo(0, 0); g.stroke(); g.fillStyle = '#d8d0c0'; g.beginPath(); g.moveTo(2, 0); g.lineTo(-5, -3); g.lineTo(-5, 3); g.fill(); g.restore(); } }
      if (!spr(g, 'k30/king', 104, 494, 236)) { g.fillStyle = '#2a3e78'; g.fillRect(70, 290, 60, 200); }
      if (S.ph === 'aim') { // 겨냥 고리
        const [sx, sy] = this.sway(S), x = S.aim.x + sx, y = S.aim.y + sy, good = S.hold && S.p >= 0.72 && S.over < 0.55;
        g.save(); g.strokeStyle = good ? '#ffe08a' : 'rgba(255,255,255,.85)'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 10, 0, 7); g.stroke();
        g.beginPath(); g.moveTo(x - 16, y); g.lineTo(x - 5, y); g.moveTo(x + 5, y); g.lineTo(x + 16, y); g.moveTo(x, y - 16); g.lineTo(x, y - 5); g.moveTo(x, y + 5); g.lineTo(x, y + 16); g.stroke(); g.restore();
        // 당긴 힘
        g.save(); g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(118, 268, 164, 14); const pc = Math.min(1, S.p);
        g.fillStyle = S.over >= 0.55 ? '#ff8a6a' : S.p >= 0.72 ? '#ffd76a' : '#c9c2b0'; g.fillRect(120, 270, 160 * pc, 10);
        g.fillStyle = 'rgba(255,215,106,.35)'; g.fillRect(120 + 160 * 0.72, 270, 160 * 0.28, 10); g.strokeStyle = 'rgba(255,255,255,.5)'; g.strokeRect(118, 268, 164, 14);
        g.font = '700 11px "Noto Sans KR",sans-serif'; g.textAlign = 'center'; g.fillStyle = '#f4ecd8'; g.fillText(S.hold ? (S.over >= 0.55 ? tr('팔이 떨려요 — 쏘세요!') : tr('당기는 중')) : tr('눌러서 당기기'), 200, 300); g.restore();
      }
    } else { // 땅 치기
      const up = S.ring, sw = S.swing, rot = -0.12 * up + 0.22 * sw, dy = -10 * up + 14 * sw;
      if (!spr(g, 'k30/strike', 150, 488 + dy, 220, { rot })) { g.fillStyle = '#2a3e78'; g.fillRect(110, 300, 70, 180); }
      const glow = S.ring >= 1; // 고리: 바닥의 칠 자리
      g.save(); g.translate(206, 452); g.scale(1, 0.38); g.lineWidth = 6; g.strokeStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.arc(0, 0, 40, 0, 7); g.stroke();
      g.strokeStyle = glow ? '#ffe08a' : 'rgba(255,240,210,.8)'; g.beginPath(); g.arc(0, 0, 40, -Math.PI / 2, -Math.PI / 2 + 6.283 * Math.min(1, S.ring)); g.stroke();
      if (glow) { g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,220,120,.35)'; g.beginPath(); g.arc(0, 0, 36, 0, 7); g.fill(); } g.restore();
      for (const d of S.dust) { g.fillStyle = `rgba(200,170,120,${d.a * 0.7})`; g.beginPath(); g.arc(d.x, d.y, 4 + (1 - d.a) * 6, 0, 7); g.fill(); }
      g.save(); g.font = '800 14px "Noto Sans KR",sans-serif'; g.textAlign = 'center'; g.fillStyle = '#f4ecd8'; g.fillText(glow ? tr('지금 치세요!') : tr('팔을 드는 중…'), 206, 496); g.restore();
    }
    // 위: 단계·횟수
    g.save(); g.font = '800 13px "Noto Sans KR",sans-serif'; g.textAlign = 'left'; g.fillStyle = '#f4ecd8';
    if (S.ph === 'strike') { g.fillText(tr('땅을 친 횟수 {0} / {1}', S.n, STRIKES), 14, 28); for (let i = 0; i < 3; i++) { g.fillStyle = i < S.stop ? '#ff8a6a' : 'rgba(255,255,255,.22)'; g.beginPath(); g.arc(W - 70 + i * 22, 24, 7, 0, 7); g.fill(); } g.fillStyle = '#f4ecd8'; g.font = '700 10px "Noto Sans KR",sans-serif'; g.textAlign = 'right'; g.fillText(tr('머뭇거림'), W - 92, 28); }
    else g.fillText(tr('동쪽 창 너머 아람 진을 겨누어 쏘세요'), 14, 28);
    g.restore(); floatMsg(g, S.msg);
  },
  end(g, k, S) {
    this.scene(g, S, Math.min(1, k * 1.5));
    spr(g, 'k30/strike', 150, 478, 220);
    if (k > 0.35) { g.save(); g.globalAlpha = clamp((k - 0.35) * 2, 0, 1); g.fillStyle = 'rgba(24,16,8,.84)'; g.fillRect(0, 150, W, 92);
      g.font = '700 16px "Gowun Batang",serif'; g.textAlign = 'center'; g.fillStyle = '#f6eedc'; g.fillText(tr('여호와를 위한 구원의 화살'), W / 2, 182); g.fillText(tr('곧 아람에 대한 구원의 화살이니'), W / 2, 206);
      g.font = '600 11px "Noto Sans KR",sans-serif'; g.fillStyle = '#cdbf9e'; g.fillText(tr('왕하 13:17'), W / 2, 226); g.restore(); }
  },
};

/* ---------- 유라굴로 광풍 (행 27:13–26): 짐을 던져 배를 가볍게 — 균형 잡기 ---------- */
// 폭풍에 배가 기울면 갑판의 짐이 낮은 쪽으로 미끄러지고, 짐이 쏠린 쪽으로 더 기운다. 짐을 끌어 배 밖으로 던지거나(27:18–19)
// 갑판의 다른 자리로 옮겨 균형을 잡는다. 큰 파도는 '!'로 1초 먼저 알린다. 너무 기운 채 0.9초가 지나면 뒤집힌다. 여덟 개를 던지면 성공.
const SHIP = { x: 200, y: 300, h: 212, deck: 146 }, THROW = 8, CARGO = { crate: [2, 39], amphora: [1.2, 48], sack: [1, 35], tackle: [1.5, 28] };
const storm = {
  title: tr('유라굴로 광풍'), task: tr('짐을 바다에 던져 배를 가볍게'), art: ['a35/bg', 'a35/ship', 'a35/crate', 'a35/amphora', 'a35/sack', 'a35/tackle'],
  ask: [tr('배가 몹시 흔들려, 이튿날 사공들은 짐을 바다에 풀어 버렸단다.'), tr('이번엔 네가 짐을 던져 배를 가볍게 해 다오 — 한쪽만 던지면 배가 기우니, 균형을 보면서!')],
  quote: tr('우리가 폭풍으로 심히 애쓰다가 이튿날 사공들이 짐을 바다에 풀어 버리고'), ref: tr('행 27:18'),
  help: tr('짐을 끌어 <b>배 밖 바다로</b> 던져요 — 여덟 개!<br>배가 기울면 짐이 낮은 쪽으로 미끄러지고 더 기울어요. 짐을 갑판의 다른 자리로 옮겨 균형을 잡을 수도 있어요. 큰 파도(!)를 조심 — 너무 오래 기울면 뒤집혀요.'),
  seconds: 20,
  init() {
    const kinds = ['crate', 'sack', 'amphora', 'tackle', 'crate', 'amphora', 'sack', 'crate', 'amphora', 'sack'], C = kinds.map((k, i) => ({ k, m: CARGO[k][0], h: CARGO[k][1], x: -130 + i * 29 + rnd(-4, 4), v: 0 }));
    return { C, th: 0, om: 0, held: null, px: 0, py: 0, thrown: 0, cap: 0, wave: null, nextWave: 2.6, t: 0, splash: [], msg: null, rain: Array.from({ length: 50 }, () => [rnd(0, W), rnd(0, H)]) };
  },
  local(S, x, y) { const c = Math.cos(-S.th), s = Math.sin(-S.th), dx = x - SHIP.x, dy = y - this.bob(S); return [dx * c - dy * s, dx * s + dy * c]; },
  bob: S => SHIP.y + Math.sin(S.t * 1.7) * 6,
  update(dt, S) {
    S.t += dt; if (S.msg) S.msg.at -= dt;
    for (const r of S.rain) { r[0] -= 160 * dt; r[1] += 620 * dt; if (r[1] > H) { r[1] = -10; r[0] = rnd(0, W + 120); } }
    for (const p of S.splash) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 420 * dt; p.a -= dt * 1.4; } S.splash = S.splash.filter(p => p.a > 0);
    if (S.thrown >= THROW) { S.om += (-2.2 * S.th - 1.6 * S.om) * dt; S.th += S.om * dt; return; } // 끝 연출: 잦아듦
    // 큰 파도: 1초 먼저 '!' — 한쪽에서 배를 세게 민다
    if (!S.wave && (S.nextWave -= dt) <= 0) { S.wave = { dir: Math.random() < 0.5 ? -1 : 1, warn: 1 }; S.fx.play('gust'); }
    if (S.wave && (S.wave.warn -= dt) <= 0) { S.om += S.wave.dir * rnd(0.34, 0.46); S.fx.play('splash'); S.wave = null; S.nextWave = rnd(2.4, 3.8); }
    let tq = 0; for (const c of S.C) if (c !== S.held) tq += c.m * c.x;
    S.om += (-2.2 * S.th - 0.8 * S.om + tq * 0.00082 + 0.22 * Math.sin(S.t * 1.3)) * dt; S.th += S.om * dt;
    // 짐은 기울어진 쪽으로 미끄러진다(무거울수록 덜)
    for (const c of S.C) { if (c === S.held) continue; const a = Math.abs(S.th) > 0.07 ? Math.sin(S.th) * 360 / Math.sqrt(c.m) : 0;
      c.v = (c.v + a * dt) * Math.pow(0.04, dt); c.x += c.v * dt; if (Math.abs(c.x) > SHIP.deck) { c.x = Math.sign(c.x) * SHIP.deck; c.v = 0; } }
    if (Math.abs(S.th) > 0.48) { S.cap += dt; if (S.cap > 0.2 && (!S.msg || S.msg.at < 0)) S.msg = { t: tr('배가 뒤집히려 해요!'), c: '#ffb08a', at: 0.5, x: 200, y: 140 }; } else S.cap = Math.max(0, S.cap - dt * 2);
  },
  down(x, y, S) {
    if (S.held || S.thrown >= THROW) return; const [lx, ly] = this.local(S, x, y);
    let best = null, bd = 34; for (const c of S.C) { const d = Math.hypot(lx - c.x, ly + c.h / 2); if (d < bd) { bd = d; best = c; } }
    if (best) { S.held = best; S.px = x; S.py = y; S.fx.play('pick'); }
  },
  move(x, y, S) { if (S.held) { S.px = x; S.py = y; } },
  up(S, x = S.px, y = S.py) {
    const c = S.held; if (!c) return; S.held = null; const [lx] = this.local(S, x, y);
    if (Math.abs(lx) > SHIP.deck + 22 || y > this.bob(S) + 60) { // 배 밖 — 바다로
      S.C.splice(S.C.indexOf(c), 1); S.thrown++; S.fx.play('plop'); for (let i = 0; i < 12; i++) S.splash.push({ x, y: Math.max(y, this.bob(S) + 30), vx: rnd(-80, 80), vy: rnd(-240, -90), a: 1 });
      if (S.thrown >= THROW) { S.fx.play('calm'); } }
    else { c.x = clamp(lx, -SHIP.deck, SHIP.deck); c.v = 0; S.fx.play('drop'); }
  },
  won: S => S.thrown >= THROW,
  lost: S => S.cap > 0.9,
  failText: S => S.cap > 0.9 ? tr('배가 뒤집혔어요') : tr('짐을 다 던지지 못했어요'),
  sea(g, S, calm = 0) {
    const A = art('a35/bg'), sw = Math.sin(S.t * 1.1) * 8 * (1 - calm);
    if (A) { g.drawImage(A, -12 + sw, -14 + Math.cos(S.t * 0.9) * 6 * (1 - calm), W + 24, H + 28); } else { g.fillStyle = '#2c3a40'; g.fillRect(0, 0, W, H); }
    if (calm) { g.fillStyle = `rgba(255,236,200,${0.18 * calm})`; g.fillRect(0, 0, W, H); }
  },
  front(g, S) { // 배 앞을 지나가는 물결 — 선체 아랫부분이 물에 잠겨 보이게
    const y0 = this.bob(S) + 34, gr = g.createLinearGradient(0, y0 - 10, 0, H); gr.addColorStop(0, 'rgba(60,92,96,.0)'); gr.addColorStop(0.12, 'rgba(60,92,96,.88)'); gr.addColorStop(1, 'rgba(28,44,50,.96)');
    g.fillStyle = gr; g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= W; x += 10) g.lineTo(x, y0 + Math.sin(x * 0.035 + S.t * 2.6) * 7 + Math.sin(x * 0.011 - S.t * 1.3) * 6); g.lineTo(W, H); g.fill();
    g.strokeStyle = 'rgba(230,240,240,.45)'; g.lineWidth = 2; g.beginPath(); for (let x = 0; x <= W; x += 10) g.lineTo(x, y0 + Math.sin(x * 0.035 + S.t * 2.6) * 7 + Math.sin(x * 0.011 - S.t * 1.3) * 6); g.stroke();
  },
  cargo(g, c, x, y, rot = 0) { if (!spr(g, 'a35/' + c.k, x, y, c.h, { rot })) { g.fillStyle = '#7a5a34'; g.fillRect(x - c.h * 0.45, y - c.h, c.h * 0.9, c.h); } },
  ship(g, S) {
    g.save(); g.translate(SHIP.x, this.bob(S)); g.rotate(S.th);
    if (!spr(g, 'a35/ship', 0, 0, SHIP.h, { ay: 0.74 })) { g.fillStyle = '#6a4a2a'; g.fillRect(-160, 0, 320, 44); g.fillRect(-3, -150, 6, 150); }
    for (const c of S.C) if (c !== S.held) this.cargo(g, c, c.x, 2);
    g.restore();
  },
  draw(g, S) {
    this.sea(g, S); this.ship(g, S); this.front(g, S);
    g.save(); g.strokeStyle = 'rgba(220,230,240,.35)'; g.lineWidth = 1; g.beginPath(); for (const [x, y] of S.rain) { g.moveTo(x, y); g.lineTo(x - 5, y + 16); } g.stroke(); g.restore();
    for (const p of S.splash) { g.fillStyle = `rgba(235,245,250,${p.a})`; g.beginPath(); g.arc(p.x, p.y, 3, 0, 7); g.fill(); }
    if (S.held) { const [lx] = this.local(S, S.px, S.py), out = Math.abs(lx) > SHIP.deck + 22 || S.py > this.bob(S) + 60;
      this.cargo(g, S.held, S.px, S.py + S.held.h / 2, S.th);
      g.save(); g.font = '800 13px "Noto Sans KR",sans-serif'; g.textAlign = 'center'; g.lineWidth = 4; g.strokeStyle = 'rgba(10,20,25,.7)'; const t = out ? tr('놓으면 바다로') : tr('놓으면 이 자리에'); const tx = clamp(S.px, 60, W - 60); g.strokeText(t, tx, S.py - S.held.h - 6); g.fillStyle = out ? '#bfe6ff' : '#f2ead8'; g.fillText(t, tx, S.py - S.held.h - 6); g.restore(); }
    if (S.wave) { const x = S.wave.dir < 0 ? 34 : W - 34; g.save(); g.font = '900 26px "Noto Sans KR",sans-serif'; g.textAlign = 'center'; g.lineWidth = 5; g.strokeStyle = 'rgba(10,20,25,.75)'; g.strokeText('!', x, 250); g.fillStyle = '#ffe08a'; g.fillText('!', x, 250);
      g.font = '800 12px "Noto Sans KR",sans-serif'; g.lineWidth = 4; g.strokeText(tr('큰 파도'), x, 270); g.fillText(tr('큰 파도'), x, 270); g.restore(); }
    // 위: 던진 짐, 기울기
    g.save(); g.font = '800 13px "Noto Sans KR",sans-serif'; g.textAlign = 'left'; g.fillStyle = '#eef2f4'; g.fillText(tr('던진 짐 {0} / {1}', S.thrown, THROW), 14, 28);
    const cx = W - 60, cy = 34, r = 26, lim = 0.48; g.lineWidth = 6; g.strokeStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.arc(cx, cy, r, Math.PI + 0.25, -0.25); g.stroke();
    g.strokeStyle = 'rgba(255,120,90,.7)'; g.beginPath(); g.arc(cx, cy, r, Math.PI + 0.25, Math.PI + 0.62); g.stroke(); g.beginPath(); g.arc(cx, cy, r, -0.62, -0.25); g.stroke();
    const a = -Math.PI / 2 + clamp(S.th / lim, -1.15, 1.15) * (Math.PI / 2 - 0.62); g.strokeStyle = Math.abs(S.th) > lim ? '#ff7a5a' : '#f2ead8'; g.lineWidth = 3; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * (r + 2), cy + Math.sin(a) * (r + 2)); g.stroke();
    g.font = '700 10px "Noto Sans KR",sans-serif'; g.textAlign = 'center'; g.fillStyle = '#eef2f4'; g.fillText(tr('기울기'), cx, cy + 14); g.restore();
    floatMsg(g, S.msg);
  },
  end(g, k, S) {
    this.update(0.016, S); this.sea(g, S, k); this.ship(g, S); this.front(g, S);
    if (k > 0.35) { g.save(); g.globalAlpha = clamp((k - 0.35) * 2, 0, 1); g.fillStyle = 'rgba(12,20,26,.84)'; g.fillRect(0, 120, W, 96);
      g.font = '700 16px "Gowun Batang",serif'; g.textAlign = 'center'; g.fillStyle = '#eef3f6'; g.fillText(tr('이제는 안심하라 너희 중 아무도'), W / 2, 152); g.fillText(tr('생명에는 아무런 손상이 없겠고 오직 배뿐이리라'), W / 2, 176);
      g.font = '600 11px "Noto Sans KR",sans-serif'; g.fillStyle = '#b8c6cc'; g.fillText(tr('행 27:22'), W / 2, 198); g.restore(); }
  },
};

/* ---------- 수금 타는 소년 (삼상 16:14–23): 가락을 듣고 따라 타기 — 기억 ---------- */
// 수금 줄 일곱(오음 음계). 먼저 한 가락이 울리며 줄이 빛나고(듣기), 그대로 따라 퉁긴다(타기). 맞으면 사울을 덮은 어둠이 걷히고,
// 틀리면 어긋난 소리와 함께 어둠이 짙어지고 같은 가락을 다시 들려준다. 가락은 3·4·5·6음, 뒤로 갈수록 빠르게. 세 번 틀리면 실패.
const HARP = [293.7, 329.6, 370, 440, 493.9, 587.3, 659.3], PHRASES = [3, 4, 5, 6], HARP_Y = [318, 486], harpX = i => 72 + i * 42.7;
const lyre = {
  title: tr('수금 타는 소년'), task: tr('가락을 듣고 똑같이 따라 타기'), art: ['d03/bg', 'd03/saul', 'd03/saul-calm', 'd03/david'],
  ask: [tr('이번엔 네가 내 수금을 타 보렴 — 내가 먼저 한 가락을 타면, 똑같이 따라 타는 거야.'), tr('줄을 틀리면 왕의 마음이 더 어두워지니, 귀 기울여 잘 들어!')],
  quote: tr('하나님께서 부리시는 악령이 사울에게 이를 때에 다윗이 수금을 들고 와서 손으로 탄즉'), ref: tr('삼상 16:23'),
  help: tr('먼저 줄이 빛나며 한 가락이 울려요 — 잘 듣고 보세요.<br>그다음 <b>같은 차례로 줄을 눌러</b> 따라 타요. 맞히면 왕을 덮은 어둠이 걷혀요. 세 번 틀리면 실패!'),
  seconds: 34,
  init() { const S = { r: 0, seq: [], i: 0, ph: 'wait', wait: 1.2, play: [], glow: HARP.map(() => 0), dark: 0.85, miss: 0, t: 0, msg: null, notes: [] }; this.make(S); return S; },
  make(S) { // 오음 음계 위를 걷듯이 — 한두 칸씩 오르내리는 노래 같은 가락
    const n = PHRASES[S.r]; let x = Math.floor(rnd(1, 6)); S.seq = [x];
    while (S.seq.length < n) { let y; do { y = x + [-2, -1, -1, 1, 1, 2][Math.floor(Math.random() * 6)]; } while (y < 0 || y > 6 || y === x); S.seq.push(x = y); }
  },
  listen(S) { S.ph = 'listen'; S.i = 0; S.gap = S.r >= 2 ? 0.42 : 0.55; S.next = 0.3; },
  pluck(S, k) { S.glow[k] = 1; S.fx.pluck?.(HARP[k]); S.notes.push({ x: harpX(k), y: 300, a: 1 }); },
  update(dt, S) {
    S.t += dt; if (S.msg) S.msg.at -= dt; S.glow = S.glow.map(g => Math.max(0, g - dt * 2.6));
    for (const n of S.notes) { n.y -= 40 * dt; n.a -= dt * 0.8; } S.notes = S.notes.filter(n => n.a > 0);
    S.dark += ((S.goal ?? S.dark) - S.dark) * Math.min(1, dt * 3);
    if (S.ph === 'wait' && (S.wait -= dt) <= 0) this.listen(S);
    else if (S.ph === 'listen' && (S.next -= dt) <= 0) {
      if (S.i < S.seq.length) { this.pluck(S, S.seq[S.i++]); S.next = S.gap; }
      else { S.ph = 'play'; S.i = 0; S.msg = { t: tr('이제 따라 타세요'), c: '#ffe8b0', at: 0.9, x: 200, y: 300 }; }
    }
  },
  down(x, y, S) {
    if (S.ph !== 'play' || y < HARP_Y[0] - 30) return;
    const k = clamp(Math.round((x - 72) / 42.7), 0, 6); this.pluck(S, k);
    if (k === S.seq[S.i]) { if (++S.i >= S.seq.length) { S.r++; S.goal = Math.max(0, 0.85 - S.r * 0.2125); S.fx.play('right');
        S.msg = { t: S.r >= PHRASES.length ? tr('왕의 얼굴이 밝아졌어요') : tr('좋아요 — 어둠이 걷혀요'), c: '#ffe8b0', at: 1, x: 200, y: 240 };
        if (S.r < PHRASES.length) { this.make(S); S.ph = 'wait'; S.wait = 1.1; } else S.ph = 'done'; } }
    else { S.miss++; S.goal = Math.min(1, (S.goal ?? S.dark) + 0.12); S.fx.play('sour'); S.ph = S.miss >= 3 ? 'fail' : 'wait'; S.wait = 1.1;
      S.msg = { t: S.miss >= 3 ? tr('왕의 마음이 더 어두워졌어요') : tr('줄이 어긋났어요 — 다시 들어 보세요'), c: '#ffb08a', at: 1, x: 200, y: 240 }; }
  },
  up() {},
  key(k, S) { const i = '1234567'.indexOf(k); if (i < 0) return false; this.down(harpX(i), 400, S); },
  won: S => S.ph === 'done' && S.dark < 0.05,
  lost: S => S.miss >= 3,
  failText: S => S.miss >= 3 ? tr('세 번 틀렸어요 — 왕의 마음이 더 어두워졌어요') : tr('시간이 다 되었어요'),
  scene(g, S, calm = 0) {
    if (!bgArt(g, 'd03/bg')) { g.fillStyle = '#1c1612'; g.fillRect(0, 0, W, H); }
    const d = S.dark * (1 - calm);
    g.save(); g.globalAlpha = 1 - calm; spr(g, 'd03/saul', 106, 300, 208); g.restore();
    if (calm > 0) { g.save(); g.globalAlpha = calm; spr(g, 'd03/saul-calm', 106, 300, 208); g.restore(); }
    // 사울을 덮은 어둠: 짙은 보랏빛 안개가 일렁인다
    g.save(); const r = g.createRadialGradient(100, 200, 10, 100, 200, 150); r.addColorStop(0, `rgba(30,10,40,${0.75 * d})`); r.addColorStop(1, 'rgba(30,10,40,0)'); g.fillStyle = r; g.fillRect(-60, 40, 320, 320);
    for (let i = 0; i < 7; i++) { const a = S.t * 0.6 + i; g.fillStyle = `rgba(20,6,30,${0.22 * d})`; g.beginPath(); g.ellipse(100 + Math.cos(a) * 60, 190 + Math.sin(a * 1.3) * 60, 50, 30, a, 0, 7); g.fill(); } g.restore();
    if (calm > 0) { g.save(); g.globalCompositeOperation = 'lighter'; const w = g.createRadialGradient(150, 200, 10, 150, 200, 220); w.addColorStop(0, `rgba(255,220,150,${0.3 * calm})`); w.addColorStop(1, 'rgba(255,220,150,0)'); g.fillStyle = w; g.fillRect(0, 0, W, 420); g.restore(); }
    spr(g, 'd03/david', 304, 300, 168, { flip: true });
  },
  harp(g, S) { // 수금: 나무 틀과 일곱 줄
    g.save(); g.fillStyle = 'rgba(18,12,8,.72)'; g.fillRect(0, 296, W, H - 296);
    g.strokeStyle = '#8a5a2e'; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath(); g.moveTo(44, HARP_Y[1] + 4); g.quadraticCurveTo(30, 330, 52, HARP_Y[0] - 12); g.moveTo(356, HARP_Y[1] + 4); g.quadraticCurveTo(370, 330, 348, HARP_Y[0] - 12); g.stroke();
    g.lineWidth = 9; g.beginPath(); g.moveTo(46, HARP_Y[0] - 10); g.lineTo(354, HARP_Y[0] - 10); g.stroke(); g.lineWidth = 12; g.beginPath(); g.moveTo(44, HARP_Y[1] + 6); g.lineTo(356, HARP_Y[1] + 6); g.stroke();
    for (let i = 0; i < 7; i++) { const x = harpX(i), gl = S.glow[i], wob = gl ? Math.sin(S.t * 60 + i) * 2.5 * gl : 0;
      if (gl) { g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = `rgba(255,210,120,${0.5 * gl})`; g.lineWidth = 12; g.beginPath(); g.moveTo(x, HARP_Y[0]); g.lineTo(x, HARP_Y[1]); g.stroke(); g.restore(); }
      g.strokeStyle = gl ? '#fff1c8' : '#d8c8a0'; g.lineWidth = 2.4 - i * 0.18; g.beginPath(); g.moveTo(x, HARP_Y[0]); g.quadraticCurveTo(x + wob, (HARP_Y[0] + HARP_Y[1]) / 2, x, HARP_Y[1]); g.stroke(); }
    for (const n of S.notes) { g.fillStyle = `rgba(255,226,160,${n.a})`; g.font = '700 18px serif'; g.textAlign = 'center'; g.fillText('♪', n.x, n.y); }
    g.restore();
  },
  draw(g, S) {
    this.scene(g, S); this.harp(g, S);
    g.save(); g.font = '800 13px "Noto Sans KR",sans-serif'; g.textAlign = 'left'; g.fillStyle = '#f2e8d4';
    g.fillText(tr('가락 {0} / {1}', Math.min(S.r + 1, PHRASES.length), PHRASES.length), 14, 28);
    for (let i = 0; i < 3; i++) { g.fillStyle = i < S.miss ? '#ff8a6a' : 'rgba(255,255,255,.22)'; g.beginPath(); g.arc(W - 70 + i * 22, 24, 7, 0, 7); g.fill(); }
    g.font = '800 14px "Noto Sans KR",sans-serif'; g.textAlign = 'center'; g.fillStyle = S.ph === 'play' ? '#ffe39a' : '#c8bca4';
    g.fillText(S.ph === 'listen' || S.ph === 'wait' ? tr('잘 들어 보세요…') : S.ph === 'play' ? tr('따라 타기 {0} / {1}', S.i, S.seq.length) : '', 200, 312 - 24);
    g.restore(); floatMsg(g, S.msg);
  },
  end(g, k, S) {
    this.update(0.016, S); this.scene(g, S, Math.min(1, k * 1.6)); this.harp(g, S);
    if (k > 0.35) { g.save(); g.globalAlpha = clamp((k - 0.35) * 2, 0, 1); g.fillStyle = 'rgba(20,14,10,.84)'; g.fillRect(0, 60, W, 86);
      g.font = '700 16px "Gowun Batang",serif'; g.textAlign = 'center'; g.fillStyle = '#f6eedc'; g.fillText(tr('사울이 상쾌하여 낫고'), W / 2, 92); g.fillText(tr('악령이 그에게서 떠나더라'), W / 2, 116);
      g.font = '600 11px "Noto Sans KR",sans-serif'; g.fillStyle = '#cdbf9e'; g.fillText(tr('삼상 16:23'), W / 2, 136); g.restore(); }
  },
};

/* ---------- 장인 이드로의 조언 (출 18:13–27): 송사를 나눠 맡기기 — 분류 ---------- */
// 송사를 들고 온 사람들이 줄을 선다(카드에 그 일에 얽힌 사람 수). 끌어서 알맞은 재판장에게: 열 명까지 십부장, 쉰 명까지 오십부장,
// 백 명까지 백부장, 그 위는 천부장 — '어려운 일'(⚖)만 모세에게(18:22). 재판장은 한 건을 듣는 동안 바쁘고, 모세는 훨씬 오래 걸린다
// (모두 모세에게 가져가면 줄이 넘친다 — 18:18). 줄이 여섯을 넘으면 실패, 스무 건을 마치면 성공.
const JUDGES = [{ cap: 10, name: tr('십부장') }, { cap: 50, name: tr('오십부장') }, { cap: 100, name: tr('백부장') }, { cap: 1000, name: tr('천부장') }, { cap: 0, name: tr('모세'), hard: true }];
const SEAT_X = [42, 121, 200, 279, 354], SEAT_Y = 236, SLOTS = [[70, 340], [200, 340], [330, 340], [70, 440], [200, 440], [330, 440]], CASES = 20, QMAX = 6;
const counsel = {
  title: tr('장인 이드로의 조언'), task: tr('송사를 알맞은 재판장에게 나눠 맡기기'), art: ['m15/bg', 'm15/moses', 'm15/elder', 'm15/man', 'm15/woman', 'm15/jethro'],
  ask: [tr('장인 말씀대로 천부장·백부장·오십부장·십부장을 세웠단다. 이번엔 네가 송사를 나눠 맡겨 보렴.'), tr('작은 일은 알맞은 재판장에게, 어려운 일만 내게 가져오너라 — 줄이 넘치지 않게!')],
  quote: tr('큰 일은 모두 네게 가져갈 것이요 작은 일은 모두 그들이 스스로 재판할 것이니'), ref: tr('출 18:22'),
  help: tr('송사 카드를 끌어 재판장에게 맡겨요. 카드의 사람 수를 보세요 — <b>열 명까지 십부장, 쉰까지 오십부장, 백까지 백부장, 그 위는 천부장.</b><br>⚖ 어려운 일만 모세에게! 모세는 오래 걸려요. 줄이 여섯을 넘으면 실패.'),
  seconds: 38,
  init() { return { Q: [], next: 0.4, gap: 1.7, done: 0, busy: JUDGES.map(() => 0), drag: null, t: 0, msg: null, fly: [], over: false, made: 0 }; },
  card(S) {
    const hard = S.made > 2 && Math.random() < 0.16, tier = Math.floor(Math.random() * 4), lo = [2, 11, 51, 101][tier], hi = [10, 50, 100, 900][tier];
    const n = Math.round(rnd(lo, hi) / (tier === 3 ? 10 : 1)) * (tier === 3 ? 10 : 1);
    S.made++; return { n, hard, who: Math.random() < 0.5 ? 'm15/man' : 'm15/woman', k: hard ? 4 : JUDGES.findIndex(j => j.cap >= n), x: W + 80, y: 0, slot: -1, wob: rnd(0, 6) };
  },
  update(dt, S) {
    S.t += dt; if (S.msg) S.msg.at -= dt; S.busy = S.busy.map(b => Math.max(0, b - dt));
    if ((S.next -= dt) <= 0 && S.made < CASES + 8) { // 줄에 한 사람씩 — 갈수록 빨리
      if (S.Q.length >= QMAX) { S.over = true; S.fx.play('late'); }
      else { S.Q.push(this.card(S)); S.fx.play('step'); }
      S.gap = Math.max(1.35, S.gap - 0.025); S.next = S.gap * rnd(0.85, 1.15);
    }
    S.Q.forEach((c, i) => { if (c === S.drag) return; const [x, y] = SLOTS[i]; c.x += (x - c.x) * Math.min(1, dt * 8); c.y += (y - c.y) * Math.min(1, dt * 8); });
    for (const f of S.fly) { f.k += dt * 2.6; } S.fly = S.fly.filter(f => f.k < 1);
  },
  down(x, y, S) { for (const c of S.Q) if (Math.abs(x - c.x) < 62 && Math.abs(y - c.y) < 40) { S.drag = c; S.ox = x - c.x; S.oy = y - c.y; S.fx.play('pick'); return; } },
  move(x, y, S) { if (S.drag) { S.drag.x = x - S.ox; S.drag.y = y - S.oy; } },
  up(S, x, y) {
    const c = S.drag; if (!c) return; S.drag = null;
    if (y > SEAT_Y + 40) return; // 줄로 되돌아간다
    const j = SEAT_X.reduce((b, sx, i) => Math.abs(sx - x) < Math.abs(SEAT_X[b] - x) ? i : b, 0);
    this.give(S, c, j);
  },
  give(S, c, j) {
    if (S.busy[j] > 0) { S.msg = { t: tr('{0:은/는} 아직 듣는 중이에요', JUDGES[j].name), c: '#ffd9a0', at: 0.8, x: SEAT_X[j], y: SEAT_Y - 120 }; S.fx.play('miss'); return; }
    if (j !== c.k) { S.fx.play('wrong');
      S.msg = { t: c.hard ? tr('어려운 일은 모세에게') : j === 4 ? tr('작은 일은 재판장들에게') : JUDGES[j].cap < c.n ? tr('{0}에게는 너무 큰 일이에요', JUDGES[j].name) : tr('더 작은 재판장에게 맡겨요'), c: '#ffb08a', at: 1, x: SEAT_X[j], y: SEAT_Y - 120 }; return; }
    S.Q.splice(S.Q.indexOf(c), 1); S.busy[j] = j === 4 ? 2.4 : 0.85; S.done++; S.fx.play('drop');
    S.fly.push({ x: c.x, y: c.y, tx: SEAT_X[j], ty: SEAT_Y - 30, k: 0 });
    if (S.done >= CASES) S.fx.play('bonus');
  },
  key() { return false; },
  won: S => S.done >= CASES,
  lost: S => S.over,
  failText: S => S.over ? tr('줄이 너무 길어져 백성이 지쳤어요 (18:18)') : tr('해가 저물었어요'),
  seats(g, S) {
    for (let i = 0; i < 5; i++) { const x = SEAT_X[i], mo = i === 4;
      if (!spr(g, mo ? 'm15/moses' : 'm15/elder', x, SEAT_Y, mo ? 112 : 90)) { g.fillStyle = mo ? '#8a7a60' : '#7a6248'; g.fillRect(x - 22, SEAT_Y - 80, 44, 80); }
      g.save(); g.fillStyle = 'rgba(20,14,8,.78)'; g.beginPath(); g.roundRect(x - 37, SEAT_Y + 4, 74, 34, 8); g.fill();
      g.font = '800 12px "Noto Sans KR",sans-serif'; g.textAlign = 'center'; g.fillStyle = mo ? '#ffe39a' : '#f2e8d4'; g.fillText(JUDGES[i].name, x, SEAT_Y + 19, 70);
      g.font = '700 10px "Noto Sans KR",sans-serif'; g.fillStyle = '#cdbf9e'; g.fillText(mo ? tr('⚖ 어려운 일') : tr('{0}명까지', JUDGES[i].cap), x, SEAT_Y + 32, 70);
      if (S.busy[i] > 0) { const T = mo ? 2.4 : 0.85; g.strokeStyle = 'rgba(255,226,150,.9)'; g.lineWidth = 4; g.beginPath(); g.arc(x, SEAT_Y - (mo ? 126 : 104), 10, -Math.PI / 2, -Math.PI / 2 + 6.283 * (S.busy[i] / T)); g.stroke(); }
      g.restore(); }
  },
  drawCard(g, c) {
    g.save(); g.translate(c.x, c.y); g.rotate(Math.sin(c.wob) * 0.02);
    g.fillStyle = c.hard ? '#f6e2b0' : '#efe4cc'; g.strokeStyle = c.hard ? '#b8862e' : '#8a7458'; g.lineWidth = 2; g.beginPath(); g.roundRect(-58, -36, 116, 72, 10); g.fill(); g.stroke();
    g.save(); g.beginPath(); g.roundRect(-58, -36, 116, 72, 10); g.clip(); spr(g, c.who, -36, 52, 92); g.restore();
    g.textAlign = 'center'; g.fillStyle = '#3a2a18'; g.font = '900 22px "Noto Sans KR",sans-serif'; g.fillText(c.hard ? '⚖' : String(c.n), 22, 2, 66);
    g.font = '700 11px "Noto Sans KR",sans-serif'; g.fillText(c.hard ? tr('어려운 일') : tr('{0}명의 일', c.n), 22, 22, 66);
    g.restore();
  },
  draw(g, S) {
    if (!bgArt(g, 'm15/bg')) { g.fillStyle = '#d8b884'; g.fillRect(0, 0, W, H); }
    this.seats(g, S);
    g.save(); g.fillStyle = 'rgba(30,20,10,.55)'; g.fillRect(0, 290, W, H - 290); g.restore();
    for (const c of S.Q) if (c !== S.drag) this.drawCard(g, c);
    for (const f of S.fly) { g.save(); g.globalAlpha = 1 - f.k; g.fillStyle = '#efe4cc'; g.beginPath(); g.arc(f.x + (f.tx - f.x) * f.k, f.y + (f.ty - f.y) * f.k, 14 * (1 - f.k * 0.6), 0, 7); g.fill(); g.restore(); }
    if (S.drag) this.drawCard(g, S.drag);
    g.save(); g.font = '800 13px "Noto Sans KR",sans-serif'; g.textAlign = 'left'; g.fillStyle = '#fff6e4'; g.lineWidth = 3; g.strokeStyle = 'rgba(30,20,10,.6)';
    const a = tr('마친 송사 {0} / {1}', S.done, CASES), b = tr('줄 {0} / {1}', S.Q.length, QMAX); g.strokeText(a, 14, 28); g.fillText(a, 14, 28);
    g.textAlign = 'right'; g.fillStyle = S.Q.length >= QMAX - 1 ? '#ff9a7a' : '#fff6e4'; g.strokeText(b, W - 14, 28); g.fillText(b, W - 14, 28); g.restore();
    floatMsg(g, S.msg);
  },
  end(g, k, S) {
    if (!bgArt(g, 'm15/bg')) { g.fillStyle = '#d8b884'; g.fillRect(0, 0, W, H); }
    S.Q = []; this.seats(g, S); spr(g, 'm15/jethro', 70 + 30 * ease(Math.min(1, k * 1.5)), 470, 200);
    if (k > 0.35) { g.save(); g.globalAlpha = clamp((k - 0.35) * 2, 0, 1); g.fillStyle = 'rgba(30,20,10,.82)'; g.fillRect(0, 300, W, 86);
      g.font = '700 16px "Gowun Batang",serif'; g.textAlign = 'center'; g.fillStyle = '#f6eedc'; g.fillText(tr('이 모든 백성도 자기 곳으로'), W / 2, 332); g.fillText(tr('평안히 가리라'), W / 2, 356);
      g.font = '600 11px "Noto Sans KR",sans-serif'; g.fillStyle = '#cdbf9e'; g.fillText(tr('출 18:23'), W / 2, 374); g.restore(); }
  },
};

export const MINI = { jesus: { e04: magi, e05: egypt, e07: boyJesus, e11: cana, e17: fishing, e22: twelve, e23: rock, e28: bail, e31: loaves, e32: water, e39: stones, e42: sheep, e43: coin, e46: climb, e48: palms, e59: tiberias },
  david: { d01: herdDavid, d03: lyre, d05: sling, d10: arrows, d16: cave, d24: arkDance, d38: templeStones }, moses: { m02: nile, m09: redSea, m15: counsel, m12: manna, m14: hands, m35: jericho, m39: tribes }, paul: { a04: wallBasket, a17: prison, a35: storm, a36: wreck, a37: viper }, kings: { k15: carmel, k24: naaman, k25: axe, k26: dothan, k30: lastArrow } };

/* ---------- 놀이 틀: 소개 → 놀이(제한 시간) → 성공 연출/실패 → 결과 ---------- */
// host: 모달 안의 상자. fx: { play, pour } (game-audio.js). 끝나면 done({ ok, left, tries })
export function playMini(game, host, fx, done) {
  let tries = 0, raf = 0, S = null, phase = 'intro', t = 0, last = 0, endT = 0, left = 0, bonus = 0;
  host.innerHTML = `<div class="mini">
    <div class="mhead"><small>${game.title}</small><b>${game.task}</b><span class="mtime"><i></i><em></em></span></div>
    <div class="mstage"><canvas></canvas>
      <div class="mpanel intro"><q>${game.quote}</q><cite>${game.ref}</cite><p>${game.help}</p><button class="go">${tr('시작')}</button></div>
    </div></div>`;
  host._mini = () => S; // 확인용(캡처 스크립트)
  (game.art || []).forEach(art); // 그림 조각을 소개 화면 동안 미리 받는다
  const cv = host.querySelector('canvas'), g = cv.getContext('2d'), stage = host.querySelector('.mstage'), bar = host.querySelector('.mtime i'), sec = host.querySelector('.mtime em');
  // 글이 화면 밖으로 넘치지 않게(사용자 2026-11: 긴 끝 말씀이 잘렸다): 너비를 주지 않은 글이 화면 폭보다 길면 글씨를 줄여 한 줄에 맞춘다.
  // 가운데 맞춤은 화면 폭, 왼쪽·오른쪽 맞춤은 그 자리에서 화면 끝까지. 그래도 넘치면 마지막으로 좌우를 눌러 담는다
  for (const f of ['fillText', 'strokeText']) { const o = g[f].bind(g);
    g[f] = (s, x, y, mw) => { if (mw != null) return o(s, x, y, mw); s = String(s);
      const room = g.textAlign === 'center' ? W - 16 : g.textAlign === 'right' || g.textAlign === 'end' ? x - 8 : W - 8 - x, w = g.measureText(s).width;
      if (w <= room || room <= 0) return o(s, x, y);
      const font = g.font, m = font.match(/(\d+(?:\.\d+)?)px/); if (!m) return o(s, x, y, room);
      g.font = font.replace(m[0], `${(+m[1] * room / w).toFixed(1)}px`); o(s, x, y, room); g.font = font; }; }
  const fit = () => { const r = stage.getBoundingClientRect(), d = Math.min(3, devicePixelRatio || 1); cv.width = Math.round(r.width * d); cv.height = Math.round(r.width * H / W * d); g.setTransform(cv.width / W, 0, 0, cv.height / H, 0, 0); };
  fit(); addEventListener('resize', fit);
  const pt = ev => { const r = cv.getBoundingClientRect(); return [(ev.clientX - r.left) / r.width * W, (ev.clientY - r.top) / r.height * H]; };
  cv.addEventListener('pointerdown', ev => { if (phase !== 'play') return; cv.setPointerCapture(ev.pointerId); ev.preventDefault(); game.down(...pt(ev), S); });
  cv.addEventListener('pointermove', ev => { if (phase === 'play') game.move?.(...pt(ev), S); });
  const onKey = ev => { if (phase === 'play' && game.key && game.key(ev.key, S) !== false) ev.preventDefault(); }; addEventListener('keydown', onKey); // PC의 방향키
  const up = ev => { if (phase === 'play') game.up(S, ...pt(ev)); };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  const panel = (cls, html) => { stage.querySelector('.mpanel')?.remove(); stage.insertAdjacentHTML('beforeend', `<div class="mpanel ${cls}">${html}</div>`); return stage.querySelector('.mpanel'); };
  const start = () => {
    tries++; S = game.init(); S.fx = fx; t = game.seconds; phase = 'play'; last = performance.now(); fx.play('go');
    stage.querySelector('.mpanel')?.remove(); host.querySelector('.mini').classList.add('playing');
  };
  host.querySelector('.intro .go').onclick = start;
  const finish = ok => {
    fx.pour?.(null); fx.storm?.(null); phase = ok ? 'won' : 'lost'; host.querySelector('.mini').classList.remove('playing');
    if (ok) { left = Math.ceil(t); bonus = game.bonus ? game.bonus(S) : Math.round(200 * t / game.seconds); endT = 0; fx.play('wine'); return; } // 보너스는 남은 시간의 비율로(최대 200) — 제한 시간이 긴 놀이만 점수가 커지지 않게
    fx.play('late');
    const p = panel('lost', `<h3>${game.failText?.(S) || tr('시간이 다 되었어요')}</h3><p>${tries < TRIES ? tr('한 번 더 해 볼까요?') : tr('이번에는 카드를 얻지 못했어요.<br>다시 걸을 때 또 도전할 수 있어요.')}</p>
      <div class="row">${tries < TRIES ? tr('<button class="go ghost" data-q>그만두기</button><button class="go" data-r>다시 도전</button>') : tr('<button class="go" data-q>계속</button>')}</div>`);
    p.querySelector('[data-r]')?.addEventListener('click', start);
    p.querySelector('[data-q]').onclick = () => close({ ok: false, left: 0, tries });
  };
  const close = r => { cancelAnimationFrame(raf); removeEventListener('resize', fit); removeEventListener('keydown', onKey); fx.pour?.(null); fx.storm?.(null); done(r); };
  // 점검(game.html?minis): 끝 장면을 곧장 보거나(성공·실패) 놀이를 닫는다
  host._end = ok => { if (phase === 'intro') start(); if (phase === 'play') finish(ok); };
  host._close = () => close({ ok: false, left: 0, tries });
  const loop = now => {
    raf = requestAnimationFrame(loop);
    const raw = (now - last) / 1000 || 0, dt = Math.min(0.05, raw); last = now;
    if (!S) { S = game.init(); S.fx = fx; }
    if (phase === 'play') {
      const before = Math.ceil(t); t -= dt;
      if (Math.ceil(t) < before && t < 5.5 && t > 0) fx.play('tick');
      game.update(dt, S);
      if (game.lost?.(S)) { t = Math.max(0, t); finish(false); } else if (game.won(S) || (game.survive && t <= 0)) finish(true); else if (t <= 0) { t = 0; finish(false); } // survive: 끝까지 버티면 성공
    } else if (phase === 'won') {
      endT += Math.min(0.2, raw); game.update(dt, S); // 성공 연출은 실제 시간으로 (느린 폰에서 판이 한참 늦게 떴다)
      if (endT > 3.4 && !stage.querySelector('.won')) {
        const p = panel('won', `<h3>${tr('성공!')}</h3><p>${game.survive ? tr('끝까지 버텼어요') : tr('남은 시간 <b>{0}초</b>', left)} · ${tr('보너스 <b>+{0}점</b>', bonus)}</p><button class="go">${tr('카드 받기')}</button>`);
        p.querySelector('.go').onclick = () => close({ ok: true, left, bonus, tries });
      }
    }
    const k = Math.min(1, endT / 2.2);
    g.clearRect(0, 0, W, H);
    if (phase === 'won') game.end(g, k, S); else game.draw(g, S);
    const f = phase === 'intro' ? 1 : clamp(t / game.seconds, 0, 1);
    bar.style.width = `${f * 100}%`; bar.classList.toggle('low', f < 0.25 && phase === 'play'); sec.textContent = phase === 'intro' ? tr('{0}초', game.seconds) : tr('{0}초', Math.ceil(t));
  };
  raf = requestAnimationFrame(loop);
}

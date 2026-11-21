// 장면 놀이 (사용자 2026-11): 그분을 만나 이야기를 다 들은 뒤, 몇몇 장면에서는 말씀 고르기 대신 그 장면의 짧은 놀이를 모달로 한다.
// 제한 시간 안에 성공해야 그 장면의 말씀 카드를 얻는다(사용자: '성공해야 카드 줌'). 한 번 더 도전할 수 있다.
// 그림은 모두 캔버스에 코드로 그린다(파일을 더 받지 않는다). 좌표는 400×500 논리 단위 — 화면 크기에 맞춰 늘린다.
// 놀이 하나 = { title, ask(그분이 이야기 끝에 맡기시는 말), quote, ref, help, seconds, init(), update(dt, S), draw(g, S), down(x, y, S), up(S), won(S), end(g, k, S) }

const W = 400, H = 500, TRIES = 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ease = t => 1 - Math.pow(1 - t, 3);
const rnd = (a, b) => a + Math.random() * (b - a);

/* ---------- 가나의 혼인 잔치 (요 2:1–11): 돌항아리 여섯을 아귀까지 ---------- */
// 누르고 있으면 하인의 물동이가 기울어 물을 붓는다 — 오래 누를수록 콸콸(빨라진다), 손을 떼도 떨어지던 물줄기는 잠깐 더 들어간다.
// 아귀(금줄)까지 차면 그 항아리는 끝. 넘치면 쏟아져 다시 채워야 한다(시간을 잃는다). 여섯을 다 채우면 물이 포도주로 바뀐다.
const FULL = 0.95, OVER = 1.05, SPILL_TO = 0.72, LAG = 0.24;
const cana = {
  title: '가나의 혼인 잔치', task: '돌항아리 여섯에 물을 아귀까지',
  quote: '항아리에 물을 채우라 하시니 아귀까지 채우니', ref: '요 2:7',
  help: '항아리를 누르고 있으면 물을 부어요. 오래 누를수록 빨라져요.<br>금줄(아귀)까지 — 넘치면 쏟아져 다시 채워야 해요.',
  ask: ['그날 하인들에게 맡긴 일을 이번엔 네게 맡기마.', '저 돌항아리 여섯에 물을 채워라 — 아귀까지. 시간이 많지 않구나!'], // 이야기 끝에 그분이 맡기시는 일 (말풍선)
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
        S.msg = { t: '넘쳤어요! 다시 채워요', c: '#ffb38a', at: 1.4, x: j.x, y: j.y - j.h - 8 };
        for (let i = 0; i < 26; i++) S.drops.push({ x: j.x + rnd(-j.w * 0.35, j.w * 0.35), y: j.y - j.h + 6, vx: rnd(-90, 90), vy: rnd(-160, -40), life: rnd(0.6, 1.1) });
      }
    } else S.fx.pour(null);
    // 아귀까지 찬 항아리: 손을 뗀 뒤(물줄기가 다 들어간 뒤) 판정
    for (const [i, j] of J.entries()) {
      if (!j.done && j.lv >= FULL && S.cur !== i && !(S.lag > 0 && S.lagJar === i)) {
        j.done = true; j.flash = 1; S.fx.play('plink');
        S.msg = { t: j.lv <= 1.01 ? '아귀까지!' : '찰랑찰랑', c: '#ffe29a', at: 1, x: j.x, y: j.y - j.h - 8 };
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
    g.fillText(`채운 항아리 ${n} / 6`, 16, 26); g.restore();
  },
  // 성공: 물이 위에서부터 포도주 빛으로 (요 2:9)
  end(g, k, S) { S.wine = ease(k); this.draw(g, S);
    if (k > 0.3) { g.save(); g.globalAlpha = clamp((k - 0.3) * 2, 0, 1); g.font = '700 20px "Gowun Batang",serif'; g.textAlign = 'center';
      g.lineWidth = 5; g.strokeStyle = 'rgba(30,12,10,.75)'; g.strokeText('물이 포도주가 되었다', W / 2, 118); g.fillStyle = '#ffe1c2'; g.fillText('물이 포도주가 되었다', W / 2, 118);
      g.font = '600 12px "Noto Sans KR",sans-serif'; g.fillStyle = '#f0c9a0'; g.fillText('요 2:9', W / 2, 137); g.restore(); }
    for (const j of S.jars) if (Math.random() < 0.25) S.sparks.push({ x: j.x + rnd(-j.w * 0.35, j.w * 0.35), y: j.y - j.h + rnd(4, 20), vy: rnd(-40, -12), life: rnd(0.5, 1), r: rnd(1.2, 2.6) });
  },
};

// 잔칫집 안마당: 회벽, 아치 문, 매단 등잔의 따뜻한 빛, 돌바닥
function courtyard(g) {
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
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',');
// 하인의 물동이: 누르면 기울어 붓는다
function pitcher(g, x, y, tilt) {
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

export const MINI = { jesus: { e11: cana } };

/* ---------- 놀이 틀: 소개 → 놀이(제한 시간) → 성공 연출/실패 → 결과 ---------- */
// host: 모달 안의 상자. fx: { play, pour } (game-audio.js). 끝나면 done({ ok, left, tries })
export function playMini(game, host, fx, done) {
  let tries = 0, raf = 0, S = null, phase = 'intro', t = 0, last = 0, endT = 0, left = 0;
  host.innerHTML = `<div class="mini">
    <div class="mhead"><small>${game.title}</small><b>${game.task}</b><span class="mtime"><i></i><em></em></span></div>
    <div class="mstage"><canvas></canvas>
      <div class="mpanel intro"><q>${game.quote}</q><cite>${game.ref}</cite><p>${game.help}</p><button class="go">시작</button></div>
    </div></div>`;
  host._mini = () => S; // 확인용(캡처 스크립트)
  const cv = host.querySelector('canvas'), g = cv.getContext('2d'), stage = host.querySelector('.mstage'), bar = host.querySelector('.mtime i'), sec = host.querySelector('.mtime em');
  const fit = () => { const r = stage.getBoundingClientRect(), d = Math.min(3, devicePixelRatio || 1); cv.width = Math.round(r.width * d); cv.height = Math.round(r.width * H / W * d); g.setTransform(cv.width / W, 0, 0, cv.height / H, 0, 0); };
  fit(); addEventListener('resize', fit);
  const pt = ev => { const r = cv.getBoundingClientRect(); return [(ev.clientX - r.left) / r.width * W, (ev.clientY - r.top) / r.height * H]; };
  cv.addEventListener('pointerdown', ev => { if (phase !== 'play') return; cv.setPointerCapture(ev.pointerId); ev.preventDefault(); game.down(...pt(ev), S); });
  const up = () => { if (phase === 'play') game.up(S); };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  const panel = (cls, html) => { stage.querySelector('.mpanel')?.remove(); stage.insertAdjacentHTML('beforeend', `<div class="mpanel ${cls}">${html}</div>`); return stage.querySelector('.mpanel'); };
  const start = () => {
    tries++; S = game.init(); S.fx = fx; t = game.seconds; phase = 'play'; last = performance.now(); fx.play('go');
    stage.querySelector('.mpanel')?.remove(); host.querySelector('.mini').classList.add('playing');
  };
  host.querySelector('.intro .go').onclick = start;
  const finish = ok => {
    fx.pour?.(null); phase = ok ? 'won' : 'lost'; host.querySelector('.mini').classList.remove('playing');
    if (ok) { left = Math.ceil(t); endT = 0; fx.play('wine'); return; }
    fx.play('late');
    const p = panel('lost', `<h3>시간이 다 되었어요</h3><p>${tries < TRIES ? '한 번 더 해 볼까요?' : '이번에는 카드를 얻지 못했어요.<br>다시 걸을 때 또 도전할 수 있어요.'}</p>
      <div class="row">${tries < TRIES ? '<button class="go ghost" data-q>그만두기</button><button class="go" data-r>다시 도전</button>' : '<button class="go" data-q>계속</button>'}</div>`);
    p.querySelector('[data-r]')?.addEventListener('click', start);
    p.querySelector('[data-q]').onclick = () => close({ ok: false, left: 0, tries });
  };
  const close = r => { cancelAnimationFrame(raf); removeEventListener('resize', fit); fx.pour?.(null); done(r); };
  const loop = now => {
    raf = requestAnimationFrame(loop);
    const raw = (now - last) / 1000 || 0, dt = Math.min(0.05, raw); last = now;
    if (!S) { S = game.init(); S.fx = fx; }
    if (phase === 'play') {
      const before = Math.ceil(t); t -= dt;
      if (Math.ceil(t) < before && t < 5.5 && t > 0) fx.play('tick');
      game.update(dt, S);
      if (game.won(S)) finish(true); else if (t <= 0) { t = 0; finish(false); }
    } else if (phase === 'won') {
      endT += Math.min(0.2, raw); game.update(dt, S); // 성공 연출은 실제 시간으로 (느린 폰에서 판이 한참 늦게 떴다)
      if (endT > 2.6 && !stage.querySelector('.won')) {
        const p = panel('won', `<h3>성공!</h3><p>남은 시간 <b>${left}초</b> · 보너스 <b>+${left * 10}점</b></p><button class="go">카드 받기</button>`);
        p.querySelector('.go').onclick = () => close({ ok: true, left, tries });
      }
    }
    const k = Math.min(1, endT / 2.2);
    g.clearRect(0, 0, W, H);
    if (phase === 'won') game.end(g, k, S); else game.draw(g, S);
    const f = phase === 'intro' ? 1 : clamp(t / game.seconds, 0, 1);
    bar.style.width = `${f * 100}%`; bar.classList.toggle('low', f < 0.25 && phase === 'play'); sec.textContent = phase === 'intro' ? `${game.seconds}초` : `${Math.ceil(t)}초`;
  };
  raf = requestAnimationFrame(loop);
}

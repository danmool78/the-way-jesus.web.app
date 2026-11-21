// 장면 놀이 (사용자 2026-11): 그분을 만나 이야기를 다 들은 뒤, 몇몇 장면에서는 말씀 고르기 대신 그 장면의 짧은 놀이를 모달로 한다.
// 제한 시간 안에 성공해야 그 장면의 말씀 카드를 얻는다(사용자: '성공해야 카드 줌'). 한 번 더 도전할 수 있다. 보너스는 남은 시간 비율×200점.
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

/* ---------- 사람을 낚는 어부 (눅 5:1–11): 깊은 데로 가서 그물을 내리라 ---------- */
// 누르면 그 자리로 그물을 던진다(날아가는 동안 떼가 움직이니 앞을 노린다). 걸린 고기는 누르고 있어야 끌어올려진다 —
// 많이 걸릴수록 그물이 빨리 팽팽해져(눅 5:6 '그물이 찢어지는지라') 빨개지면 잠깐 놓았다 당긴다. 찢어지면 반을 잃는다.
// 깊은 데(위쪽)일수록 떼가 크다. 제한 시간 안에 GOAL 마리를 잡으면 배가 잠기도록 가득 찬다(눅 5:7)
const BOAT = [200, 452], NET_R = 44, GOAL = 110; // 잘 노리면 한 번에 20~38마리 — 몇 번 빗나가거나 한 번 찢어지면 빠듯하게
const fishing = {
  title: '사람을 낚는 어부', task: `그물을 던져 고기 ${GOAL}마리`,
  ask: ['밤새 수고했는데 한 마리도 못 잡았다고?', '깊은 데로 가서 그물을 내려라. 그물이 찢어지지 않게 끌어올려야 한다!'],
  quote: '깊은 데로 가서 그물을 내려 고기를 잡으라', ref: '눅 5:4',
  help: '물고기 떼를 노려 누르면 그물을 던져요. 날아가는 동안 떼가 움직이니 앞을 노려요.<br>걸리면 누르고 있어 끌어올려요 — 빨개지면 잠깐 놓았다 당겨요. 찢어지면 반을 잃어요.',
  seconds: 32,
  init() {
    const S = { schools: [], net: { st: 'ready' }, got: 0, sparks: [], rip: [], msg: null, spawnT: 0, boatY: 0, shine: [] };
    for (let i = 0; i < 4; i++) S.schools.push(school(true));
    for (let i = 0; i < 18; i++) S.shine.push([rnd(0, W), rnd(70, 420), rnd(0, 6)]);
    return S;
  },
  update(dt, S) {
    for (const f of S.schools) { f.t += dt; f.x += f.vx * dt; f.y += f.vy * dt + Math.sin(f.t * 0.9 + f.ph) * 6 * dt; }
    S.schools = S.schools.filter(f => f.x > -90 && f.x < W + 90 && f.n > 0);
    S.spawnT -= dt; if (S.schools.length < 5 && S.spawnT <= 0) { S.schools.push(school(false)); S.spawnT = rnd(0.6, 1.4); }
    const N = S.net;
    if (N.st === 'fly') {
      N.t += dt;
      if (N.t >= N.dur) { // 물에 닿아 펼쳐진다 — 그 둘레의 고기가 걸린다
        let n = 0;
        for (const f of S.schools) for (const o of f.fish) if (!o.gone && Math.hypot(f.x + o.x - N.x, f.y + o.y - N.y) < NET_R) { o.gone = true; n++; f.n--; }
        S.fx.play(n ? 'plop' : 'plop'); if (n) S.fx.play('flap');
        Object.assign(N, { st: n ? 'haul' : 'empty', n, prog: 0, ten: 0, t: 0, hold: false });
        if (!n) S.msg = { t: '허탕!', c: '#cfd8e0', at: 0.9, x: N.x, y: N.y - 30 };
        else S.msg = { t: `${n}마리!`, c: '#ffe29a', at: 1, x: N.x, y: N.y - 34 };
      }
    } else if (N.st === 'empty') { N.t += dt; if (N.t > 0.55) N.st = 'ready'; }
    else if (N.st === 'haul') {
      // 끌어올리기: 누르는 동안 나아가고 팽팽해진다. 놓으면 풀린다. 고기가 많을수록 빨리 팽팽
      const load = 0.32 + N.n / 52;
      if (N.hold) { N.prog += dt * 0.95; N.ten += dt * load; if (Math.random() < dt * 6) S.fx.play('creak'); }
      else N.ten = Math.max(0, N.ten - dt * 1.1);
      if (N.ten >= 1) { // 찢어졌다
        const lost = Math.ceil(N.n / 2); N.n -= lost; N.ten = 0.35; N.hold = false; S.fx.play('rip');
        S.msg = { t: `그물이 찢어졌어요 -${lost}`, c: '#ffb38a', at: 1.3, x: N.x, y: N.y - 34 };
        for (let i = 0; i < lost; i++) S.rip.push({ x: N.x + rnd(-20, 20), y: N.y + rnd(-10, 10), vx: rnd(-60, 60), vy: rnd(-40, 40), life: rnd(0.5, 0.9) });
      }
      if (N.prog >= 1) { // 배에 올렸다
        S.got += N.n; S.fx.play('haul'); S.boatY = Math.min(9, S.got / GOAL * 9);
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
  won: S => S.got >= GOAL,
  draw(g, S) {
    lake(g, S);
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
      if (!N.hold) { g.font = '800 14px "Noto Sans KR",sans-serif'; g.textAlign = 'center'; g.lineWidth = 4; g.strokeStyle = 'rgba(10,20,30,.7)'; g.strokeText('누르고 있어 끌어올리기', x, y + NET_R + 26); g.fillStyle = '#fff'; g.fillText('누르고 있어 끌어올리기', x, y + NET_R + 26); }
    }
    for (const p of S.rip) { g.fillStyle = `rgba(200,215,225,${clamp(p.life, 0, 1)})`; fish(g, p.x, p.y, Math.atan2(p.vy, p.vx), 1, 1); }
    for (const p of S.sparks) { g.fillStyle = `rgba(255,226,150,${clamp(p.life, 0, 1)})`; star(g, p.x, p.y, p.r * 2.2); }
    floatMsg(g, S.msg);
    g.save(); g.font = '700 14px "Noto Sans KR",sans-serif'; g.textAlign = 'left'; g.fillStyle = 'rgba(255,255,255,.92)'; g.lineWidth = 3; g.strokeStyle = 'rgba(10,25,40,.6)';
    g.strokeText(`잡은 고기 ${S.got} / ${GOAL}`, 16, 26); g.fillText(`잡은 고기 ${S.got} / ${GOAL}`, 16, 26); g.restore();
  },
  end(g, k, S) { S.boatY = 9 + ease(k) * 7; S.net.st = 'done'; this.draw(g, S);
    if (k > 0.3) { g.save(); g.globalAlpha = clamp((k - 0.3) * 2, 0, 1); g.font = '700 19px "Gowun Batang",serif'; g.textAlign = 'center';
      g.lineWidth = 5; g.strokeStyle = 'rgba(8,20,32,.75)'; g.strokeText('이제 후로는 사람을 취하리라', W / 2, 120); g.fillStyle = '#eaf4ff'; g.fillText('이제 후로는 사람을 취하리라', W / 2, 120);
      g.font = '600 12px "Noto Sans KR",sans-serif'; g.fillStyle = '#bcd6ea'; g.fillText('눅 5:10', W / 2, 139); g.restore(); }
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
function lake(g, S) {
  const w = g.createLinearGradient(0, 0, 0, H); w.addColorStop(0, '#1d4560'); w.addColorStop(0.5, '#2a6a86'); w.addColorStop(1, '#3d8aa2');
  g.fillStyle = w; g.fillRect(0, 0, W, H);
  const sky = g.createLinearGradient(0, 0, 0, 62); sky.addColorStop(0, '#f2c58c'); sky.addColorStop(1, '#e89a6a'); g.fillStyle = sky; g.fillRect(0, 0, W, 62);
  g.fillStyle = '#5c5a4a'; g.beginPath(); g.moveTo(0, 62); for (let x = 0; x <= W; x += 20) g.lineTo(x, 44 + Math.sin(x * 0.02) * 8 + Math.sin(x * 0.07) * 3); g.lineTo(W, 62); g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,210,150,.25)'; g.fillRect(0, 60, W, 4);
  // 깊은 데 표시: 위쪽 물빛이 짙다
  const d = g.createLinearGradient(0, 64, 0, 260); d.addColorStop(0, 'rgba(5,20,40,.35)'); d.addColorStop(1, 'rgba(5,20,40,0)'); g.fillStyle = d; g.fillRect(0, 64, W, 200);
  g.font = '600 11px "Noto Sans KR",sans-serif'; g.fillStyle = 'rgba(220,235,245,.45)'; g.textAlign = 'right'; g.fillText('깊은 데', W - 12, 84);
  // 물결 반짝임
  const t = performance.now() / 1000;
  for (const [x, y, p] of S.shine) { const a = (Math.sin(t * 1.3 + p) + 1) / 2; g.strokeStyle = `rgba(255,230,190,${0.08 + a * 0.18})`; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x - 9, y); g.quadraticCurveTo(x, y - 3, x + 9, y); g.stroke(); }
}
function drawBoat(g, S) {
  const [x, y0] = BOAT, y = y0 + S.boatY;
  g.save();
  g.fillStyle = 'rgba(10,30,45,.35)'; g.beginPath(); g.ellipse(x, y0 + 14, 92, 14, 0, 0, 7); g.fill();
  const h = g.createLinearGradient(0, y - 22, 0, y + 20); h.addColorStop(0, '#8a5a34'); h.addColorStop(1, '#4a2c16');
  g.fillStyle = h; g.beginPath(); g.moveTo(x - 92, y - 16); g.quadraticCurveTo(x, y + 30, x + 92, y - 16); g.lineTo(x + 80, y - 22); g.lineTo(x - 80, y - 22); g.closePath(); g.fill();
  g.fillStyle = '#3a2210'; g.beginPath(); g.moveTo(x - 80, y - 22); g.lineTo(x + 80, y - 22); g.quadraticCurveTo(x, y + 8, x - 80, y - 22); g.fill();
  // 실은 고기 (잡을수록 배 안이 찬다)
  const n = Math.min(60, Math.round(S.got / GOAL * 60));
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
  title: '빈 들의 만찬', task: '풀밭마다 꼭 오십 명씩',
  ask: ['이 많은 사람을 먹이려면 먼저 질서 있게 앉혀야겠지.', '푸른 풀밭에 오십 명씩 무리 지어 앉혀 다오 — 넘치지도 모자라지도 않게!'],
  quote: '떼를 지어 한 오십 명씩 앉히라', ref: '눅 9:14',
  help: '가족을 끌어다 풀밭에 놓아요. 풀밭마다 꼭 50명이어야 해요.<br>앉힌 가족을 누르면 다시 빠져요. 어디에도 맞지 않는 가족이 둘 섞여 있어요.',
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
      S.shake[k] = 1; S.fx.play('wrong'); S.msg = { t: `${sum + f.n}명 — 넘쳐요`, c: '#ffb38a', at: 1, x: PATCHES[k][0], y: PATCHES[k][1] - 50 };
      layout(S); return;
    }
    f.at = k; layout(S); S.fx.play('drop');
    if (sum + f.n === PATCH) { S.fx.play('plink'); S.msg = { t: '오십 명!', c: '#ffe29a', at: 1, x: PATCHES[k][0], y: PATCHES[k][1] - 50 };
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
    g.font = '600 11px "Noto Sans KR",sans-serif'; g.textAlign = 'left'; g.fillStyle = 'rgba(255,255,255,.6)'; g.fillText('기다리는 가족', 14, 360);
    for (const f of S.fams) if (f !== S.drag?.f) drawFam(g, f, false);
    if (S.drag) drawFam(g, S.drag.f, true);
    for (const p of S.sparks) { g.fillStyle = `rgba(255,226,150,${clamp(p.life, 0, 1)})`; star(g, p.x, p.y, p.r * 2.2); }
    floatMsg(g, S.msg);
    const done = PATCHES.filter((_, k) => S.fams.filter(f => f.at === k).reduce((a, f) => a + f.n, 0) === PATCH).length;
    g.save(); g.font = '700 14px "Noto Sans KR",sans-serif'; g.textAlign = 'left'; g.lineWidth = 3; g.strokeStyle = 'rgba(20,40,10,.55)'; g.fillStyle = '#fff';
    g.strokeText(`앉힌 무리 ${done} / 4`, 16, 26); g.fillText(`앉힌 무리 ${done} / 4`, 16, 26); g.restore();
  },
  end(g, k, S) {
    S.flow = k; this.draw(g, S);
    if (k > 0.55) { // 남은 조각 열두 바구니
      const a = clamp((k - 0.55) * 3, 0, 1);
      g.save(); g.globalAlpha = a; g.fillStyle = 'rgba(30,20,10,.55)'; g.fillRect(0, 360, W, 140);
      for (let i = 0; i < 12; i++) basket(g, 34 + (i % 6) * 66, 400 + Math.floor(i / 6) * 50, Math.min(1, (k - 0.55) * 4 - i * 0.05));
      g.font = '700 16px "Gowun Batang",serif'; g.textAlign = 'center'; g.fillStyle = '#ffe9c8'; g.lineWidth = 4; g.strokeStyle = 'rgba(30,20,10,.7)';
      g.strokeText('남은 조각을 열두 바구니에 거두니라', W / 2, 382); g.fillText('남은 조각을 열두 바구니에 거두니라', W / 2, 382);
      g.font = '600 11px "Noto Sans KR",sans-serif'; g.fillStyle = '#e9d6b4'; g.fillText('눅 9:17', W / 2, 497); g.restore();
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
  const s = g.createLinearGradient(0, 0, 0, H); s.addColorStop(0, '#9cc7d8'); s.addColorStop(0.09, '#c9dfc0'); s.addColorStop(0.1, '#7fae5a'); s.addColorStop(0.7, '#5f9440'); s.addColorStop(1, '#3f6a2a');
  g.fillStyle = s; g.fillRect(0, 0, W, H);
  g.fillStyle = '#6a9fb8'; g.beginPath(); g.moveTo(0, 46); g.quadraticCurveTo(200, 36, W, 48); g.lineTo(W, 52); g.lineTo(0, 52); g.fill();
  g.strokeStyle = 'rgba(30,60,20,.25)'; g.lineWidth = 1;
  for (let i = 0; i < 70; i++) { const x = (i * 97) % W, y = 60 + ((i * 53) % 420); g.beginPath(); g.moveTo(x, y); g.lineTo(x - 2, y - 6); g.moveTo(x + 3, y); g.lineTo(x + 4, y - 7); g.stroke(); }
  g.fillStyle = 'rgba(255,240,200,.5)'; for (let i = 0; i < 26; i++) { g.beginPath(); g.arc((i * 151) % W, 70 + (i * 71) % 400, 1.6, 0, 7); g.fill(); } // 들꽃
}
function bread(g, x, y, fishy) {
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
  ['시몬 베드로', '🪨', '반석', '마 16:18'], ['안드레', '🐟', '형을 예수께 데려옴', '요 1:41'],
  ['세베대의 아들 야고보', '⚔️', '열둘 중 처음 순교', '행 12:2'], ['요한', '❤️', '예수께서 사랑하신 제자', '요 13:23'],
  ['빌립', '🍞', '"떡을 어디서 사서?"', '요 6:5'], ['바돌로매 (나다나엘)', '🌳', '무화과나무 아래', '요 1:48'],
  ['마태', '💰', '세관에 앉은 세리', '마 9:9'], ['도마', '✋', '"손을 넣어 보리라"', '요 20:25'],
  ['알패오의 아들 야고보', '🔹', '작은 야고보', '막 15:40'], ['다대오', '🕯️', '가룟인 아닌 유다', '요 14:22'],
  ['열심당원 시몬', '🔥', '열심당원', '눅 6:15'], ['가룟 유다', '👛', '돈궤를 맡은 자', '요 12:6'],
];
const CW = 86, CH = 70, PEEK = 3.2;
const twelve = {
  title: '열두 사람을 세우시다', task: '이름과 그 사람의 이야기 짝 맞추기',
  ask: ['여기 모인 열두 사람, 서로 너무 다르지 않니?', '누가 누구인지 기억해 다오 — 이름과 그 사람의 이야기를 짝지어 보렴.'],
  quote: '이에 열둘을 세우셨으니 이는 자기와 함께 있게 하시고', ref: '막 3:14',
  help: '처음 3초 동안 카드를 모두 보여 줘요 — 잘 봐 두세요.<br>두 장씩 뒤집어 이름과 그 사람의 이야기를 짝지어요. 틀리면 다시 덮여요.',
  seconds: 95,
  init() {
    // 카드는 덮인 채(up 0)로 만들어 소개 화면에서는 뒷면만 — 시작하면 뒤집혀 보인다
    const data = this.data || TWELVE, cards = data.flatMap((d, i) => [{ p: i, name: true }, { p: i, name: false }]).sort(() => Math.random() - 0.5);
    cards.forEach((c, k) => { c.x = 12 + (k % 4) * (CW + 9) + CW / 2 + 4; c.y = 48 + Math.floor(k / 4) * (CH + 6) + CH / 2; c.up = 0; c.want = 1; c.done = false; c.glow = 0; c.shake = 0; });
    return { cards, data, peek: PEEK, open: [], wait: 0, msg: null, sparks: [], pairs: 0, fin: 0 };
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
    const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#2c3a4a'); bg.addColorStop(0.5, '#3c4a3a'); bg.addColorStop(1, '#2a2a1e');
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    for (const c of S.cards) drawCard12(g, c, S);
    for (const p of S.sparks) { g.fillStyle = `rgba(255,226,150,${clamp(p.life, 0, 1)})`; star(g, p.x, p.y, p.r * 2.2); }
    if (S.peek > 0) { g.save(); g.font = '800 15px "Noto Sans KR",sans-serif'; g.textAlign = 'center'; g.fillStyle = '#ffe29a'; g.fillText(`잘 봐 두세요 · ${Math.ceil(S.peek)}`, W / 2, 30); g.restore(); }
    else if (!(S.msg && S.msg.at > 0)) { g.save(); g.font = '700 14px "Noto Sans KR",sans-serif'; g.textAlign = 'left'; g.fillStyle = 'rgba(255,255,255,.9)'; g.fillText(`맞춘 짝 ${S.pairs} / 12`, 16, 30); g.restore(); }
    if (S.msg && S.msg.at > 0) { g.save(); g.globalAlpha = clamp(S.msg.at * 2, 0, 1); g.font = '800 15px "Noto Sans KR",sans-serif'; g.textAlign = 'center'; g.fillStyle = S.msg.c; g.fillText(S.msg.t, W / 2, 30); g.restore(); }
  },
  end(g, k, S) {
    S.cards.forEach(c => { c.want = 1; c.up = 1; c.glow = 0.5 + Math.sin(performance.now() / 300 + c.p) * 0.3; }); this.draw(g, S);
    if (k > 0.2) { g.save(); g.globalAlpha = clamp((k - 0.2) * 2, 0, 1); g.fillStyle = 'rgba(15,18,12,.93)'; g.fillRect(0, 214, W, 92); g.fillStyle = 'rgba(230,194,117,.5)'; g.fillRect(0, 214, W, 1.5); g.fillRect(0, 304, W, 1.5); g.globalAlpha = clamp((k - 0.2) * 2, 0, 1);
      const [l1, l2, rf] = this.endLines || ['자기와 함께 있게 하시고', '보내사 전도도 하게 하시려 함이러라', '막 3:14'];
      g.font = '700 19px "Gowun Batang",serif'; g.textAlign = 'center'; g.fillStyle = '#ffe9c8'; g.fillText(l1, W / 2, 246);
      g.fillText(l2, W / 2, 272); g.font = '600 11px "Noto Sans KR",sans-serif'; g.fillStyle = '#d9c9a4'; g.fillText(rf, W / 2, 290); g.restore(); }
  },
};
function drawCard12(g, c, S) {
  const d = S.data[c.p], open = c.up > 0.5, sx = Math.abs(Math.cos(c.up * Math.PI)) || 0.02, sh = Math.sin(c.shake * 25) * c.shake * 4;
  g.save(); g.translate(c.x + sh, c.y); g.scale(sx, 1);
  g.fillStyle = 'rgba(0,0,0,.35)'; rrect(g, -CW / 2 + 2, -CH / 2 + 3, CW, CH, 8); g.fill();
  if (!open) { // 뒷면: 여정 금빛 무늬
    const b = g.createLinearGradient(0, -CH / 2, 0, CH / 2); b.addColorStop(0, '#5a4424'); b.addColorStop(1, '#3a2a14');
    g.fillStyle = b; rrect(g, -CW / 2, -CH / 2, CW, CH, 8); g.fill(); g.strokeStyle = 'rgba(230,194,117,.6)'; g.lineWidth = 1.5; g.stroke();
    g.strokeStyle = 'rgba(230,194,117,.35)'; rrect(g, -CW / 2 + 5, -CH / 2 + 5, CW - 10, CH - 10, 5); g.stroke();
    g.fillStyle = 'rgba(230,194,117,.75)'; g.font = '700 20px "Gowun Batang",serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('✝', 0, 1);
  } else {
    g.fillStyle = c.done ? '#f6ecd2' : '#efe5cf'; rrect(g, -CW / 2, -CH / 2, CW, CH, 8); g.fill();
    g.strokeStyle = c.done ? '#d9a84a' : 'rgba(90,70,40,.5)'; g.lineWidth = c.done ? 2.5 : 1; g.stroke();
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#2a1f14';
    if (c.name) { // 이름 카드
      const words = d[0].split(' '), two = d[0].length > 6 && words.length > 1;
      g.font = `800 ${d[0].length > 9 ? 13 : 15}px "Noto Sans KR",sans-serif`;
      if (two) { const h = Math.ceil(words.length / 2); g.fillText(words.slice(0, h).join(' '), 0, -9); g.fillText(words.slice(h).join(' '), 0, 10); } else g.fillText(d[0], 0, 0);
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
  title: '물 위로 오시는 분', task: '예수님만 바라보고 물 위를 걸어오기',
  ask: ['베드로처럼 물 위로 걸어와 보겠니?', '바람을 보지 말고 나만 바라보아라. 눈을 떼면 빠져 간다!'],
  quote: '오라 하시니 베드로가 배에서 내려 물 위로 걸어서 예수께로 가되', ref: '마 14:29',
  help: '화면을 끌면 빛 고리(시선)가 움직여요. 고리 안에 예수님을 두면 다가가요.<br>돌풍이 시선을 흔들어요 — 예수님을 놓치면 물에 빠져 가요.',
  seconds: 26,
  init() { return { gx: 200, gy: 156, wvx: 0, wvy: 0, gustT: 1.6, prog: 0, sink: 0, flash: 0, boltT: rnd(2.5, 4), focus: true, t: 0, last: null, rain: Array.from({ length: 70 }, () => [rnd(0, W), rnd(0, H), rnd(0.6, 1)]), calm: 0 }; },
  jesus(S) { const hz = 150 + S.calm * 0, k = S.prog; return { x: 200 + Math.sin(S.t * 0.7) * 46 + Math.sin(S.t * 1.9) * 12 * (1 - S.calm), y: hz + 26 + k * 150, s: 0.75 + k * 1.6 }; },
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
  failText: S => S.sink >= 1 ? '"주여 나를 구원하소서"' : '시간이 다 되었어요', // 마 14:30
  draw(g, S) {
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
      if (!ok) { g.save(); g.font = '800 16px "Noto Sans KR",sans-serif'; g.textAlign = 'center'; g.lineWidth = 4; g.strokeStyle = 'rgba(10,10,20,.8)'; g.strokeText('예수님을 바라보세요!', W / 2, H - 22); g.fillStyle = '#ffb38a'; g.fillText('예수님을 바라보세요!', W / 2, H - 22); g.restore(); } }
    // 번개
    if (S.flash > 0) { g.fillStyle = `rgba(230,240,255,${S.flash * 0.55})`; g.fillRect(0, 0, W, H); }
    // 얼마나 다가갔나
    g.save(); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(16, 16, 120, 6); g.fillStyle = '#ffe29a'; g.fillRect(16, 16, 120 * S.prog, 6);
    g.font = '700 12px "Noto Sans KR",sans-serif'; g.fillStyle = 'rgba(255,255,255,.85)'; g.textAlign = 'left'; g.fillText('예수님께로', 142, 23); g.restore();
  },
  // 성공: 손을 내밀어 붙잡으시고, 배에 오르니 바람이 그친다 (마 14:31–32)
  end(g, k, S) { S.calm = ease(k); S.prog = 1; this.update(0.016, S); this.draw(g, S);
    if (k > 0.3) { g.save(); g.globalAlpha = clamp((k - 0.3) * 2, 0, 1); g.font = '700 21px "Gowun Batang",serif'; g.textAlign = 'center';
      g.lineWidth = 6; g.strokeStyle = 'rgba(60,34,12,.85)'; g.strokeText('바람이 그치는지라', W / 2, 96); g.fillStyle = '#fff4dc'; g.fillText('바람이 그치는지라', W / 2, 96);
      g.font = '600 12px "Noto Sans KR",sans-serif'; g.fillStyle = '#f3dcb4'; g.fillText('마 14:32', W / 2, 116); g.restore(); }
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
  title: '잃은 것을 찾는 기쁨', task: '등불을 켜고 잃은 드라크마 찾기',
  ask: ['어떤 여자가 은전 열 개 가운데 하나를 잃었단다.', '등불을 켜고 집을 쓸며 찾아보렴 — 은전 가까이를 쓸면 희미하게 반짝일 거야.'],
  quote: '등불을 켜고 집을 쓸며 찾도록 부지런히 찾지 아니하겠느냐', ref: '눅 15:8',
  help: '끌면 등불이 따라오고, 등불 아래 먼지 더미가 쓸려요.<br>은전 가까이를 쓸면 희미하게 반짝여요 — 반짝임을 따라 범위를 좁혀요. 찾으면 눌러서 주워요.',
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
          if (p.coin) { S.found = true; S.fx.play('glint'); S.msg = { t: '반짝! 은전이다 — 눌러서 주워요', c: '#fff2c0', at: 2, x: p.x, y: p.y - 34 }; }
          else { const c = S.piles.find(q => q.coin), d = Math.hypot(c.x - p.x, c.y - p.y);
            if (d < NEAR) { p.hint = true; S.fx.play('glint'); S.msg = { t: '희미하게 반짝였어요…', c: '#e8dcb0', at: 1.3, x: p.x, y: p.y - 30 }; for (let i = 0; i < 6; i++) S.sparks.push({ x: p.x + rnd(-10, 10), y: p.y + rnd(-8, 8), vy: rnd(-25, -8), life: rnd(0.5, 1), r: rnd(1, 2) }); } }
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
    g.fillStyle = '#5a4630'; g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(30,20,10,.45)'; g.lineWidth = 1.2;
    for (let y = 40; y < H; y += 34) for (let x = ((y / 34) % 2) * 26 - 26; x < W; x += 52) { g.beginPath(); g.rect(x + 1, y + 1, 50, 32); g.stroke(); }
    for (const f of FURN) furniture(g, f);
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
    g.fillText(`쓸어 낸 더미 ${S.piles.filter(p => p.amt <= 0).length} / ${S.piles.length}`, 14, 24); g.restore();
  },
  // 성공: 집이 환해지고 이웃을 불러 함께 기뻐한다 (눅 15:9–10)
  end(g, k, S) { S.light = ease(k); const c = S.piles.find(p => p.coin); S.lx = c.x; S.ly = c.y; this.draw(g, S);
    if (Math.random() < 0.4) S.sparks.push({ x: c.x + rnd(-30, 30), y: c.y + rnd(-20, 20), vy: rnd(-40, -10), life: rnd(0.5, 1), r: rnd(1.4, 2.6) });
    if (k > 0.3) { g.save(); g.globalAlpha = clamp((k - 0.3) * 2, 0, 1); g.fillStyle = 'rgba(30,18,8,.78)'; g.fillRect(0, 96, W, 82);
      g.font = '700 18px "Gowun Batang",serif'; g.textAlign = 'center'; g.fillStyle = '#ffeccb';
      g.fillText('나와 함께 즐기자', W / 2, 128); g.fillText('잃은 드라크마를 찾았노라', W / 2, 152);
      g.font = '600 11px "Noto Sans KR",sans-serif'; g.fillStyle = '#e6cfa6'; g.fillText('눅 15:9', W / 2, 170); g.restore(); }
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
  g.save(); g.globalAlpha = 0.35 + a * 0.65;
  g.fillStyle = '#8e7550'; g.beginPath(); g.ellipse(p.x, p.y, r * 1.2, r * 0.75, 0, 0, 7); g.fill();
  g.fillStyle = '#a88c60'; for (let i = 0; i < 7; i++) { const s = (p.seed + i * 37) % 1; g.beginPath(); g.ellipse(p.x + Math.cos(i * 2.4 + p.seed) * r * 0.6, p.y + Math.sin(i * 2.4 + p.seed) * r * 0.35, r * 0.4 * (0.6 + s * 0.4), r * 0.22, i, 0, 7); g.fill(); }
  g.strokeStyle = 'rgba(200,170,110,.5)'; g.lineWidth = 1; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(p.x - r + i * r * 0.5, p.y - r * 0.2); g.lineTo(p.x - r + i * r * 0.5 + 8, p.y - r * 0.35); g.stroke(); } // 지푸라기
  g.restore();
}
function drawCoin(g, x, y, shine) {
  g.save(); const c = g.createRadialGradient(x - 3, y - 3, 1, x, y, 10); c.addColorStop(0, '#ffffff'); c.addColorStop(0.5, '#d9dde0'); c.addColorStop(1, '#8a9096');
  g.fillStyle = c; g.beginPath(); g.ellipse(x, y, 10, 8, 0, 0, 7); g.fill(); g.strokeStyle = '#6e747a'; g.lineWidth = 1; g.stroke();
  g.fillStyle = 'rgba(90,96,100,.6)'; g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill();
  g.globalAlpha = shine; g.fillStyle = '#fffbe6'; star(g, x + 6, y - 6, 7); g.restore();
}
function lampIcon(g, x, y) {
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
  title: '나는 선한 목자', task: `흩어진 양 ${SHEEP}마리를 우리로`,
  ask: ['양은 목자의 음성을 듣고 따라온단다.', `흩어진 양 ${SHEEP}마리를 우리 안으로 데려다 주렴 — 이리가 오면 네가 지켜야 한다!`],
  quote: '나는 선한 목자라 선한 목자는 양들을 위하여 목숨을 버리거니와', ref: '요 10:11',
  help: '끌면 목자가 따라와요. 양은 목자를 피해 움직여요 — 뒤에서 몰아 우리 문(왼쪽 아래 틈)으로 넣어요.<br>이리가 나타나면 가까이 가서 쫓아요.',
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
    if (!S.wolf && S.wolfT <= 0 && S.flock.some(q => !q.in)) { const L = Math.random() < 0.5; S.wolf = { x: L ? -20 : W + 20, y: rnd(300, 470), flee: 0 }; S.fx.play('howl'); S.msg = { t: `${this.pred?.name || '이리'}가 온다!`, c: '#ffb38a', at: 1.6, x: W / 2, y: 60 }; }
    if (S.wolf) {
      const w = S.wolf, out = S.flock.filter(q => !q.in);
      if (w.flee > 0) { w.flee -= dt; const a = Math.atan2(w.y - S.sy, w.x - S.sx); w.x += Math.cos(a) * 200 * dt; w.y += Math.sin(a) * 200 * dt; if (w.x < -40 || w.x > W + 40 || w.y < -40 || w.y > H + 40) { S.wolf = null; S.wolfT = rnd(9, 13); } }
      else if (out.length) { const q = out.reduce((a, b) => Math.hypot(a.x - w.x, a.y - w.y) < Math.hypot(b.x - w.x, b.y - w.y) ? a : b), a = Math.atan2(q.y - w.y, q.x - w.x);
        w.x += Math.cos(a) * 95 * dt; w.y += Math.sin(a) * 95 * dt;
        if (Math.hypot(q.x - w.x, q.y - w.y) < 16) { q.scared = 1.6; const b = Math.atan2(q.y - w.y, q.x - w.x); q.vx = Math.cos(b) * 220; q.vy = Math.sin(b) * 220; S.fx.play('baa'); } }
      if (w.flee <= 0 && Math.hypot(w.x - S.sx, w.y - S.sy) < 62) { w.flee = 3; S.fx.play('shoo'); S.msg = { t: `${this.pred?.name || '이리'}를 쫓았어요`, c: '#ffe29a', at: 1.2, x: w.x, y: w.y - 24 }; }
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
    const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#8fb06a'); bg.addColorStop(1, '#5c8a3e'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(40,70,20,.18)'; for (let i = 0; i < 40; i++) { g.beginPath(); g.ellipse((i * 113) % W, 50 + (i * 67) % 440, 18, 6, 0, 0, 7); g.fill(); }
    for (const [x, y, r] of [[60, 120, 16], [190, 190, 12], [350, 330, 18], [90, 440, 11]]) { g.fillStyle = '#9a9384'; g.beginPath(); g.ellipse(x, y, r, r * 0.7, 0.3, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.ellipse(x - r * 0.3, y - r * 0.25, r * 0.4, r * 0.25, 0.3, 0, 7); g.fill(); }
    // 돌담 우리 (문 틈)
    g.save(); g.lineCap = 'round';
    for (let a = 0; a < Math.PI * 2; a += 0.16) { const off = Math.abs(Math.atan2(Math.sin(a - FOLD.gate), Math.cos(a - FOLD.gate))); if (off < FOLD.open) continue;
      const x = FOLD.x + Math.cos(a) * FOLD.r, y = FOLD.y + Math.sin(a) * FOLD.r; g.fillStyle = (a * 7) % 2 > 1 ? '#a89f8c' : '#8f8774'; g.beginPath(); g.ellipse(x, y, 9, 7, a, 0, 7); g.fill(); }
    g.fillStyle = 'rgba(255,240,190,.25)'; const ga = FOLD.gate; g.beginPath(); g.arc(FOLD.x + Math.cos(ga) * FOLD.r, FOLD.y + Math.sin(ga) * FOLD.r, 26, 0, 7); g.fill(); // 문 자리
    g.font = '600 11px "Noto Sans KR",sans-serif'; g.textAlign = 'center'; g.fillStyle = 'rgba(255,255,255,.85)'; g.fillText('문', FOLD.x + Math.cos(ga) * (FOLD.r + 26), FOLD.y + Math.sin(ga) * (FOLD.r + 26) + 4);
    g.restore();
    for (const q of S.flock) drawSheep(g, q, S.t);
    if (S.wolf) drawWolf(g, S.wolf, this.pred);
    shepherd(g, S.sx, S.sy);
    g.strokeStyle = 'rgba(255,255,255,.18)'; g.setLineDash([4, 5]); g.beginPath(); g.arc(S.sx, S.sy, FLEE, 0, 7); g.stroke(); g.setLineDash([]); // 양이 피하는 거리
    for (const p of S.sparks) { g.fillStyle = `rgba(255,236,170,${clamp(p.life, 0, 1)})`; star(g, p.x, p.y, p.r * 2.4); }
    floatMsg(g, S.msg);
    g.save(); g.font = '700 14px "Noto Sans KR",sans-serif'; g.textAlign = 'left'; g.lineWidth = 3; g.strokeStyle = 'rgba(30,50,20,.55)'; g.fillStyle = '#fff';
    const n = S.flock.filter(q => q.in).length; g.strokeText(`우리 안의 양 ${n} / ${SHEEP}`, 14, 24); g.fillText(`우리 안의 양 ${n} / ${SHEEP}`, 14, 24); g.restore();
  },
  end(g, k, S) { S.wolf = null; this.update(0.016, S); this.draw(g, S);
    if (k > 0.3) { g.save(); g.globalAlpha = clamp((k - 0.3) * 2, 0, 1); g.fillStyle = 'rgba(20,34,12,.78)'; g.fillRect(0, 226, W, 78);
      g.font = '700 18px "Gowun Batang",serif'; g.textAlign = 'center'; g.fillStyle = '#f4ecd2'; const [l1, l2, rf] = this.endLines || ['내 양은 내 음성을 들으며', '나는 그들을 알며 그들은 나를 따르느니라', '요 10:27']; g.fillText(l1, W / 2, 256); g.fillText(l2, W / 2, 280);
      g.font = '600 11px "Noto Sans KR",sans-serif'; g.fillStyle = '#d8d0b0'; g.fillText(rf, W / 2, 297); g.restore(); }
  },
};
function drawSheep(g, q, t) {
  const a = Math.hypot(q.vx, q.vy) > 8 ? Math.atan2(q.vy, q.vx) : (q.a ?? 0); q.a = a; const bob = Math.sin(t * 8 + q.ph) * (Math.hypot(q.vx, q.vy) > 20 ? 1.2 : 0.2);
  g.save(); g.translate(q.x, q.y + bob); g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(2, 6, 11, 4, 0, 0, 7); g.fill(); g.rotate(a);
  g.fillStyle = '#f4f0e6'; for (const [x, y, r] of [[-5, -3, 6], [-5, 3, 6], [1, -4, 6], [1, 4, 6], [-1, 0, 7]]) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
  g.fillStyle = '#3e342a'; g.beginPath(); g.ellipse(9, 0, 4.5, 3.4, 0, 0, 7); g.fill();
  g.fillStyle = '#5a4c3e'; g.beginPath(); g.ellipse(8, -4, 1.6, 2.6, 0.6, 0, 7); g.fill(); g.beginPath(); g.ellipse(8, 4, 1.6, 2.6, -0.6, 0, 7); g.fill();
  g.restore();
}
function drawWolf(g, w, pred) { // 이리(기본) · 사자(다윗의 들판 — 갈기)
  g.save(); g.translate(w.x, w.y); g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(2, 7, 14, 4, 0, 0, 7); g.fill();
  if (pred?.mane) { g.fillStyle = pred.mane; g.beginPath(); g.arc(12, -2, 10, 0, 7); g.fill(); }
  g.fillStyle = pred?.color || '#5e5a56'; g.beginPath(); g.ellipse(0, 0, 13, 7, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(-12, 0); g.lineTo(-22, -4); g.lineTo(-20, 3); g.fill();
  g.beginPath(); g.ellipse(13, -2, 6, 5, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(15, -6); g.lineTo(17, -12); g.lineTo(19, -5); g.fill();
  g.fillStyle = '#ffcf5a'; g.beginPath(); g.arc(16, -3, 1.3, 0, 7); g.fill(); g.restore();
}
function shepherd(g, x, y) {
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
  title: '산 위의 가르침', task: `반석 위에 벽 ${GOALROWS}켜 쌓기`,
  ask: ['내 말을 듣고 행하는 사람은 반석 위에 집을 지은 지혜로운 사람 같단다.', `돌을 빈틈없이 맞춰 벽을 쌓아 보렴 — ${GOALROWS}켜!`],
  quote: '내 말을 듣고 행하는 자는 그 집을 반석 위에 지은 지혜로운 사람 같으리니', ref: '마 7:24',
  help: '좌우로 끌면 돌이 옮겨지고, 톡 누르면 돌아가요. 아래로 휙 쓸면 바로 내려가요(PC: 방향키·스페이스).<br>한 줄이 빈틈없이 차면 벽 한 켜! 맨 위까지 차면 무너져요.',
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
  failText: S => S.dead ? '모래 위에 지은 집처럼 무너졌어요' : '시간이 다 되었어요',
  draw(g, S) {
    const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, mixc('#7aa6c8', '#3a4652', S.rain)); sky.addColorStop(1, mixc('#d8c8a2', '#5a5a52', S.rain));
    g.fillStyle = sky; g.fillRect(0, 0, W, H);
    // 판(집 지을 터)과 그 밑의 반석
    g.fillStyle = 'rgba(28,22,16,.82)'; g.fillRect(BX - 2, BY - 2, COLS * CELL + 4, ROWS * CELL + 4); // 어두운 터 — 밝으면 돌이 묻혔다
    g.strokeStyle = 'rgba(255,255,255,.06)'; g.lineWidth = 1; for (let c = 1; c < COLS; c++) { g.beginPath(); g.moveTo(BX + c * CELL, BY); g.lineTo(BX + c * CELL, BY + ROWS * CELL); g.stroke(); }
    const rk = g.createLinearGradient(0, BY + ROWS * CELL, 0, H); rk.addColorStop(0, '#7d7468'); rk.addColorStop(1, '#4e463c'); g.fillStyle = rk;
    g.beginPath(); g.moveTo(0, BY + ROWS * CELL + 2); for (let x = 0; x <= W; x += 20) g.lineTo(x, BY + ROWS * CELL + 2 + Math.sin(x * 0.07) * 3); g.lineTo(W, H); g.lineTo(0, H); g.fill();
    g.font = '700 11px "Noto Sans KR",sans-serif'; g.textAlign = 'center'; g.fillStyle = 'rgba(255,255,255,.7)'; g.fillText('반석', BX + COLS * CELL / 2, H - 8);
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (S.grid[r][c] >= 0) {
      const glow = S.clearing?.rows.includes(r); stoneCell(g, BX + c * CELL, BY + r * CELL, S.grid[r][c], glow ? 1 - S.clearing.t / 0.35 : 0); }
    if (S.cur && !S.clearing && !S.dead) { // 떨어질 자리 그림자 + 지금 돌
      let gy = 0; while (fits(S, S.cur.cells, S.cur.x, S.cur.y + gy + 1)) gy++;
      g.fillStyle = 'rgba(255,255,255,.12)'; for (const [cx, cy] of S.cur.cells) g.fillRect(BX + (S.cur.x + cx) * CELL + 2, BY + (S.cur.y + cy + gy) * CELL + 2, CELL - 4, CELL - 4);
      for (const [cx, cy] of S.cur.cells) if (S.cur.y + cy >= 0) stoneCell(g, BX + (S.cur.x + cx) * CELL, BY + (S.cur.y + cy) * CELL, S.cur.k, 0); }
    // 옆 칸: 다음 돌, 쌓은 켜
    const sx = BX + COLS * CELL + 16;
    g.fillStyle = 'rgba(28,22,16,.75)'; rrect(g, sx - 8, BY - 4, W - sx, 256, 8); g.fill();
    g.textAlign = 'left'; g.font = '700 12px "Noto Sans KR",sans-serif'; g.fillStyle = 'rgba(255,240,210,.85)'; g.fillText('다음 돌', sx, BY + 10);
    for (const [cx, cy] of SHAPES[S.next]) stoneCell(g, sx + cx * 17, BY + 22 + cy * 17, S.next, 0, 17);
    g.fillStyle = 'rgba(255,240,210,.85)'; g.fillText('쌓은 켜', sx, BY + 110);
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
      g.font = '700 17px "Gowun Batang",serif'; g.textAlign = 'center'; g.fillStyle = '#eef2f4'; const [l1, l2, rf] = this.endLines || ['비가 내리고 창수가 나고 바람이 불어', '그 집에 부딪치되 무너지지 아니하나니', '마 7:25']; g.fillText(l1, W / 2, 180); g.fillText(l2, W / 2, 204);
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
    S.msg = { t: full.length > 1 ? `벽 ${full.length}켜!` : '벽 한 켜!', c: '#ffe29a', at: 1, x: BX + COLS * CELL / 2, y: BY + full[0] * CELL };
    for (const r of full) for (let i = 0; i < 10; i++) S.sparks.push({ x: BX + rnd(0, COLS * CELL), y: BY + r * CELL + rnd(0, CELL), vy: rnd(-40, -10), life: rnd(0.4, 0.9), r: rnd(1.4, 2.6) }); }
  else spawn(S);
}
// 깎은 돌 한 칸: 돌마다 빛깔이 조금 다르고 위·왼쪽은 밝게, 아래·오른쪽은 어둡게
function stoneCell(g, x, y, k, glow, sz = CELL) {
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
  title: '돌을 내려놓은 사람들', task: `여인을 지켜 ${HOLD}초 버티기`,
  ask: ['저들이 여인을 끌고 와 돌을 들고 다그치는구나.', `네 겉옷으로 이 여인을 지켜 다오 — ${HOLD}초만 버티면 내가 말하마.`],
  quote: '예수께서 몸을 굽히사 손가락으로 땅에 쓰시니', ref: '요 8:6', // 끝의 한마디(8:7)는 성공 연출에서
  help: '끌면 겉옷(방패)이 여인 둘레를 돌아요. 돌을 치켜든 사람(빨간 표시)을 보고 미리 막아요.<br>세 번 맞으면 실패 — 25초를 버티면 돼요.',
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
      if (!f.done && d < 16) { f.done = true; f.hit = true; S.hits++; S.shake = 1; S.fx.play('rip'); S.msg = { t: S.hits < HITS ? `맞았어요 ${S.hits} / ${HITS}` : '지키지 못했어요', c: '#ffb38a', at: 1.2, x: WOM[0], y: WOM[1] - 70 }; }
      if (f.fall) { f.vy += 500 * dt; f.fall -= dt * 0.6; }
    }
    S.flying = S.flying.filter(f => !f.hit && f.y < H + 20 && (!f.fall || f.fall > 0));
    for (const p of S.sparks) { p.y += p.vy * dt; p.life -= dt; } S.sparks = S.sparks.filter(p => p.life > 0);
    if (S.msg) S.msg.at -= dt;
  },
  down(x, y, S) { this.move(x, y, S); },
  move(x, y, S) { S.ang = Math.atan2(y - (WOM[1] - 14), x - WOM[0]); },
  up() {},
  won: () => false, // 버티면 시간이 다 되었을 때 — 틀은 시간이 다 되면 진 것으로 보므로 survive로 따로 판정
  survive: true, bonus: S => Math.round(200 * (1 - S.hits / HITS)), // 버티는 놀이: 덜 맞을수록 보너스
  lost: S => S.hits >= HITS,
  failText: () => '지키지 못했어요',
  draw(g, S) {
    const sh = Math.sin(S.t * 60) * S.shake * 5;
    g.save(); g.translate(sh, 0);
    // 성전 뜰: 돌바닥과 주랑 기둥
    const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#c9b48e'); bg.addColorStop(1, '#a8916a'); g.fillStyle = bg; g.fillRect(-10, 0, W + 20, H);
    g.fillStyle = '#e3d6b8'; for (let i = 0; i < 7; i++) { g.fillRect(14 + i * 62, 0, 18, 70); g.fillStyle = 'rgba(80,60,30,.25)'; g.fillRect(28 + i * 62, 0, 4, 70); g.fillStyle = '#e3d6b8'; }
    g.fillStyle = 'rgba(70,50,20,.25)'; g.fillRect(0, 70, W, 6);
    g.strokeStyle = 'rgba(90,70,40,.22)'; g.lineWidth = 1; for (let y = 90; y < H; y += 30) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    // 그분: 몸을 굽혀 땅에 쓰신다(요 8:6) — 오른쪽 아래
    figure(g, 330, 462, 64, 0); g.strokeStyle = 'rgba(90,70,40,.6)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(296, 470); g.quadraticCurveTo(306, 462, 316, 471); g.moveTo(300, 476); g.lineTo(318, 476); g.stroke();
    // 돌 든 사람들
    for (const m of S.men) accuser(g, m, S);
    // 여인 (무릎 꿇고 고개 숙임)
    g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(WOM[0], WOM[1] + 4, 22, 6, 0, 0, 7); g.fill();
    g.fillStyle = '#6a5a8a'; g.beginPath(); g.moveTo(WOM[0] - 20, WOM[1]); g.quadraticCurveTo(WOM[0] - 14, WOM[1] - 34, WOM[0], WOM[1] - 36); g.quadraticCurveTo(WOM[0] + 14, WOM[1] - 34, WOM[0] + 20, WOM[1]); g.fill();
    g.fillStyle = '#3a2e4a'; g.beginPath(); g.arc(WOM[0], WOM[1] - 38, 9, 0, 7); g.fill();
    // 겉옷 방패
    if (!S.leave) { g.save(); g.lineCap = 'round'; g.strokeStyle = '#7a2e2a'; g.lineWidth = 12; g.beginPath(); g.arc(WOM[0], WOM[1] - 14, SHIELD_R, S.ang - SHIELD_W / 2, S.ang + SHIELD_W / 2); g.stroke();
      g.strokeStyle = 'rgba(255,220,180,.5)'; g.lineWidth = 2; g.beginPath(); g.arc(WOM[0], WOM[1] - 14, SHIELD_R - 4, S.ang - SHIELD_W / 2 + 0.05, S.ang + SHIELD_W / 2 - 0.05); g.stroke(); g.restore();
      g.strokeStyle = 'rgba(255,255,255,.16)'; g.setLineDash([3, 6]); g.beginPath(); g.arc(WOM[0], WOM[1] - 14, SHIELD_R, 0, 7); g.stroke(); g.setLineDash([]); }
    for (const f of S.flying) { g.save(); g.translate(f.x, f.y); g.rotate(f.rot); g.fillStyle = '#8a8274'; g.beginPath(); g.moveTo(-6, -3); g.lineTo(0, -6); g.lineTo(6, -2); g.lineTo(5, 4); g.lineTo(-4, 5); g.closePath(); g.fill(); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(-3, -4, 4, 2); g.restore(); }
    for (const [x, y] of S.fallen) { g.fillStyle = '#8a8274'; g.beginPath(); g.ellipse(x, y, 6, 4, 0, 0, 7); g.fill(); }
    for (const p of S.sparks) { g.fillStyle = `rgba(255,236,170,${clamp(p.life, 0, 1)})`; star(g, p.x, p.y, p.r * 2.4); }
    g.restore();
    floatMsg(g, S.msg);
    g.save(); g.font = '700 14px "Noto Sans KR",sans-serif'; g.textAlign = 'left'; g.lineWidth = 3; g.strokeStyle = 'rgba(60,40,20,.5)'; g.fillStyle = '#fff';
    const hp = '♥'.repeat(HITS - S.hits) + '♡'.repeat(S.hits); g.strokeText(`여인 ${hp}`, 14, 96); g.fillStyle = '#ffd0c0'; g.fillText(`여인 ${hp}`, 14, 96); g.restore();
  },
  // 버텼다: 그분이 일어나 한마디 하시면 하나씩 돌을 내려놓고 떠난다(어른부터 — 요 8:9)
  end(g, k, S) {
    if (!S.leave) { S.leave = 1; S.flying = []; for (const m of S.men) m.wind = 0; }
    S.men.forEach((m, i) => { const t = clamp(k * 2.2 - i * 0.18, 0, 1); if (t > 0.05 && !m.dropped) { m.dropped = true; S.fallen.push([m.x + 8, m.y + 14]); S.fx.play('drop'); } m.gone = t; });
    this.draw(g, S);
    g.save(); g.globalAlpha = clamp(k * 2.5, 0, 1); g.fillStyle = 'rgba(40,28,14,.82)'; g.fillRect(0, 196, W, 78);
    g.font = '700 18px "Gowun Batang",serif'; g.textAlign = 'center'; g.fillStyle = '#fff0d6'; g.fillText('너희 중에 죄 없는 자가', W / 2, 226); g.fillText('먼저 돌로 치라', W / 2, 250);
    g.font = '600 11px "Noto Sans KR",sans-serif'; g.fillStyle = '#e6cfa6'; g.fillText('요 8:7', W / 2, 267); g.restore();
  },
};
function accuser(g, m, S) {
  if (m.gone >= 1) return;
  const x = m.x + (m.gone || 0) * (m.x < WOM[0] ? -160 : 160), y = m.y - (m.gone || 0) * 40;
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
  title: '여리고의 두 만남', task: '돌무화과나무 꼭대기까지',
  ask: ['여리고에 키가 작은 세리장 삭개오가 있었단다. 사람들에 가려 나를 볼 수가 없었지.', '그가 앞으로 달려가 나무에 올랐단다 — 너도 내가 지나가기 전에 꼭대기까지 올라 보렴!'],
  quote: '앞으로 달려가서 보기 위하여 돌무화과나무에 올라가니', ref: '눅 19:4',
  help: '가지가 몸 가까이 흔들려 올 때(빛날 때) 그쪽 — 화면 왼쪽이나 오른쪽 — 을 누르면 올라가요.<br>멀 때 누르거나 반대쪽을 누르면 미끄러져요. 예수님이 다 지나가시기 전에!',
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
    else { const was = S.lv; S.lv = Math.max(0, S.lv - 1); S.slip = 1; S.fx.play('miss'); S.msg = { t: was ? '미끄러졌어요!' : '아직 멀어요', c: '#ffb38a', at: 0.9, x: W / 2, y: 200 }; }
  },
  up() {},
  won: S => S.lv >= BRANCH,
  draw(g, S) {
    const v = S.view, span = 64; // 가지 사이 높이 — 오를수록 화면이 아래로(위로 올라간 듯)
    const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#9cc9e6'); sky.addColorStop(1, '#e8dcb4'); g.fillStyle = sky; g.fillRect(0, 0, W, H);
    // 아래 길과 무리 (오를수록 아래로 멀어진다), 지나가시는 예수님 일행
    const roadY = 452 + v * 3, prog = clamp(S.t / this.seconds, 0, 1); // 길은 늘 아래에 보이게 — 오를수록 무리가 작아 보이기만(끝에 그분이 올려다보시는 것이 보여야)
    g.fillStyle = '#c9b48a'; g.fillRect(0, roadY - 10, W, 200);
    const ks = 1 - v / BRANCH * 0.45; // 오를수록 아래 사람들이 작게
    for (let i = 0; i < 16; i++) { const x = (i * 29 + 6) % W, y = roadY - 4 + (i % 3) * 7; g.fillStyle = `hsl(${(i * 47) % 360},25%,40%)`; g.beginPath(); g.arc(x, y, 9 * ks, Math.PI, 0); g.fill(); g.fillStyle = '#c99872'; g.beginPath(); g.arc(x, y - 11 * ks, 5 * ks, 0, 7); g.fill(); }
    const jx = S.lv >= BRANCH ? W / 2 + 60 : -30 + prog * (W + 60); figure(g, jx, Math.min(H - 4, roadY + 20), 42, S.lv >= BRANCH ? 1 : 0); // 오르면 나무 아래 멈춰 올려다보신다
    // 나무 줄기
    const tr = g.createLinearGradient(W / 2 - 22, 0, W / 2 + 22, 0); tr.addColorStop(0, '#5a4630'); tr.addColorStop(0.5, '#8a6e4a'); tr.addColorStop(1, '#4a3826');
    g.fillStyle = tr; g.beginPath(); g.moveTo(W / 2 - 30, H); g.lineTo(W / 2 - 18, 0); g.lineTo(W / 2 + 18, 0); g.lineTo(W / 2 + 30, H); g.fill();
    // 가지 (지금 붙잡을 가지는 흔들림에 따라 빛난다)
    for (let i = 0; i < BRANCH; i++) {
      const y = 330 - (i - v) * span; if (y < -40 || y > H + 20) continue;
      const b = S.br[i], n = this.near(S, i), reach = 70 + (1 - n) * 70, x0 = W / 2 + b.side * 16, x1 = W / 2 + b.side * (16 + reach);
      const cur = i === S.lv, hot = cur && n > 0.68;
      g.strokeStyle = hot ? '#ffe29a' : '#6a5236'; g.lineWidth = hot ? 9 : 7; g.lineCap = 'round';
      g.beginPath(); g.moveTo(x0, y); g.quadraticCurveTo((x0 + x1) / 2, y - 14, x1, y - 6 + Math.sin(S.t * b.w + b.ph) * 4); g.stroke();
      g.fillStyle = i < S.lv ? 'rgba(90,130,60,.7)' : 'rgba(110,150,70,.9)';
      for (let k = 0; k < 4; k++) { g.beginPath(); g.ellipse(x1 - b.side * k * 14, y - 14 - (k % 2) * 6, 13, 8, b.side * 0.4, 0, 7); g.fill(); }
      if (cur && !hot) { g.strokeStyle = 'rgba(255,255,255,.25)'; g.setLineDash([3, 5]); g.beginPath(); g.arc(W / 2 + b.side * 86, y - 6, 18, 0, 7); g.stroke(); g.setLineDash([]); }
    }
    // 삭개오 (줄기에 매달림)
    const zy = 360 + S.slip * 18, zx = W / 2 + Math.sin(S.t * 3) * 2;
    g.fillStyle = '#5a4a7a'; g.beginPath(); g.ellipse(zx, zy, 13, 18, 0, 0, 7); g.fill();
    g.fillStyle = '#c99872'; g.beginPath(); g.arc(zx, zy - 22, 8, 0, 7); g.fill(); g.fillStyle = '#3a2a1a'; g.beginPath(); g.arc(zx, zy - 25, 8, Math.PI, 0); g.fill();
    g.strokeStyle = '#c99872'; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(zx - 10, zy - 10); g.lineTo(zx - 18, zy - 30); g.moveTo(zx + 10, zy - 10); g.lineTo(zx + 18, zy - 30); g.stroke();
    // 흩날리는 잎
    for (const l of S.leaves) { l[1] += 0.6 * l[2]; l[0] += Math.sin(S.t + l[1] * 0.02) * 0.4; if (l[1] > H) l[1] = -10; g.fillStyle = 'rgba(110,150,70,.45)'; g.beginPath(); g.ellipse(l[0], l[1], 4 * l[2], 2 * l[2], l[1] * 0.05, 0, 7); g.fill(); }
    for (const p of S.sparks) { g.fillStyle = `rgba(255,236,170,${clamp(p.life, 0, 1)})`; star(g, p.x, p.y, p.r * 2.4); }
    floatMsg(g, S.msg);
    // 높이, 지나가시는 정도
    g.save(); g.font = '700 14px "Noto Sans KR",sans-serif'; g.textAlign = 'left'; g.lineWidth = 3; g.strokeStyle = 'rgba(40,50,60,.5)'; g.fillStyle = '#fff';
    g.strokeText(`높이 ${S.lv} / ${BRANCH}`, 14, 24); g.fillText(`높이 ${S.lv} / ${BRANCH}`, 14, 24); g.restore();
    g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(W - 140, 16, 124, 6); g.fillStyle = '#ffb38a'; g.fillRect(W - 140, 16, 124 * prog, 6);
    g.font = '600 11px "Noto Sans KR",sans-serif'; g.textAlign = 'right'; g.fillStyle = 'rgba(255,255,255,.9)'; g.fillText('예수님이 지나가심', W - 16, 36);
  },
  end(g, k, S) { this.update(0.016, S); this.draw(g, S);
    if (k > 0.25) { g.save(); g.globalAlpha = clamp((k - 0.25) * 2, 0, 1); g.fillStyle = 'rgba(30,24,14,.8)'; g.fillRect(0, 92, W, 84);
      g.font = '700 17px "Gowun Batang",serif'; g.textAlign = 'center'; g.fillStyle = '#fff0d6'; g.fillText('삭개오야 속히 내려오라', W / 2, 122); g.fillText('내가 오늘 네 집에 유하여야 하겠다', W / 2, 146);
      g.font = '600 11px "Noto Sans KR",sans-serif'; g.fillStyle = '#e6cfa6'; g.fillText('눅 19:5', W / 2, 165); g.restore(); }
  },
};

/* ---------- 다른 여정에서 다시 쓰는 놀이 (사용자 2026-11: 여정마다 비슷한 방식이어도 된다) — 글·끝 말씀·생김새만 바꿔 끼운다 ---------- */
// 다윗: 베들레헴 들판의 목동(d01) — 양 몰기, 이리 대신 사자(삼상 17:34–35)
const herdDavid = { ...sheep, title: '베들레헴 들판의 목동', pred: { name: '사자', color: '#b98a44', mane: '#7a4e22' },
  ask: ['나도 이 들판에서 아버지의 양을 쳤단다. 사자나 곰이 새끼를 물어 가면 쫓아가 건져 냈지.', '흩어진 양을 우리로 데려다 주렴 — 사자가 오면 네가 지켜야 해!'],
  quote: '사자나 곰이 와서 양 떼에서 새끼를 물어 가면 내가 따라가서 그 입에서 새끼를 건져내었고', ref: '삼상 17:34–35',
  help: '끌면 목동이 따라와요. 양은 목동을 피해 움직여요 — 뒤에서 몰아 우리 문(왼쪽 아래 틈)으로 넣어요.<br>사자가 나타나면 가까이 가서 쫓아요.',
  endLines: ['여호와는 나의 목자시니', '내게 부족함이 없으리로다', '시 23:1'] };
// 다윗: 성전을 위한 준비(d38) — 다듬은 돌 쌓기(대상 22:2), 끝은 비 대신 영광의 빛
const templeStones = { ...rock, title: '성전을 위한 준비', glory: true,
  ask: ['내 아들 솔로몬이 지을 여호와의 집을 위해 돌을 다듬어 두려 한다.', '다듬은 돌을 빈틈없이 맞춰 쌓아 보렴 — 여섯 켜!'],
  quote: '석수를 세워 하나님의 성전을 건축할 돌을 다듬게 하고', ref: '대상 22:2',
  failText: S => S.dead ? '돌이 무너졌어요 — 다시 쌓아요' : '시간이 다 되었어요',
  endLines: ['이제 너희는 마음과 뜻을 바쳐', '너희 하나님 여호와를 구하라', '대상 22:19'] };
// 모세와 여호수아: 실로에서 나눈 땅(m39) — 열두 지파와 야곱·모세가 남긴 축복 짝 맞추기(창 49장·신 33장)
const TRIBES = [
  ['르우벤', '🌊', '물의 끓음 같으니', '창 49:4'], ['시므온', '🗡️', '그 칼은 폭력의 도구', '창 49:5'],
  ['유다', '🦁', '사자 새끼로다', '창 49:9'], ['잇사갈', '🫏', '건장한 나귀', '창 49:14'],
  ['스불론', '⛵', '배 매는 해변', '창 49:13'], ['단', '🐍', '길의 뱀이요', '창 49:17'],
  ['갓', '⚔️', '도리어 추격하리라', '창 49:19'], ['아셀', '🍞', '먹을 것이 기름진 자', '창 49:20'],
  ['납달리', '🦌', '놓인 암사슴', '창 49:21'], ['베냐민', '🐺', '물어뜯는 이리', '창 49:27'],
  ['에브라임', '🐂', '첫 수송아지 같은 위엄', '신 33:17'], ['므낫세', '🌿', '담을 넘은 무성한 가지', '창 49:22 · 신 33:17'],
];
const tribes = { ...twelve, title: '실로에서 나눈 땅', task: '열두 지파와 그 축복 짝 맞추기', data: TRIBES,
  ask: ['이제 이 땅을 열두 지파에게 제비 뽑아 나누었다.', '야곱이 아들들에게 남긴 축복을 기억하니? 지파와 그 축복을 짝지어 보렴.'],
  quote: '이들은 이스라엘의 열두 지파라 … 각 사람의 분량대로 축복하였더라', ref: '창 49:28',
  help: '처음 3초 동안 카드를 모두 보여 줘요 — 잘 봐 두세요.<br>두 장씩 뒤집어 지파 이름과 그 축복을 짝지어요. 틀리면 다시 덮여요.',
  endLines: ['여호와께서 조상들에게 맹세하신 온 땅을', '이스라엘에게 다 주셨으므로', '수 21:43'] };

/* ---------- 다섯 개의 매끄러운 돌 (삼상 17:40–50): 물매로 골리앗의 이마를 — 겨누기 ---------- */
// 화면을 끌었다 놓으면(뒤로 당긴 만큼 세게, 반대 방향으로) 물매 돌이 날아간다. 처음 몇 점만 궤적이 보인다.
// 골리앗은 방패 든 자를 앞세우고(17:41) 걸어오며 몸이 흔들린다. 놋 투구·비늘 갑옷·방패에 맞으면 튕겨 나가고, 이마(17:49)에 맞아야 쓰러진다.
// 돌은 다섯(17:40). 다 쓰거나 골리앗이 코앞까지 오면 실패
const DAV = [62, 420], GRAV = 390, VMAX = 560;
const sling = {
  title: '다섯 개의 매끄러운 돌', task: '물매 돌로 골리앗의 이마를',
  ask: ['저 거인은 칼과 창과 단창을 의지하지만, 나는 만군의 여호와의 이름을 의지한다.', '시냇가에서 고른 매끄러운 돌 다섯 개가 있다 — 이마를 노려라!'],
  quote: '시내에서 매끄러운 돌 다섯을 골라서 자기 목자의 제구 곧 주머니에 넣고 손에 물매를 가지고', ref: '삼상 17:40',
  help: '화면을 뒤로 끌었다 놓으면 돌이 날아가요 — 당긴 만큼 세게, 반대쪽으로.<br>투구·갑옷·방패는 튕겨 내요. 이마를 맞혀요! 돌은 다섯 개, 거인이 다가와요.',
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
      if (!S.down && Math.hypot(sh.x - h.x, sh.y - h.y) < 8.5) { // 이마!
        S.down = 1; S.shot = null; S.fx.play('thunder'); S.fx.play('plink'); S.msg = { t: '이마에 맞았다!', c: '#ffe29a', at: 1.6, x: h.x - 40, y: h.y - 40 };
        for (let i = 0; i < 16; i++) S.sparks.push({ x: h.x, y: h.y, vy: rnd(-60, -10), life: rnd(0.4, 0.9), r: rnd(1.4, 2.6) });
      } else if (!S.down && armorHit(S, sh)) { // 투구·갑옷·방패 — 튕긴다
        S.fx.play('halt'); S.msg = { t: armorHit(S, sh), c: '#cfd8e0', at: 0.9, x: sh.x, y: sh.y - 20 }; sh.vx = -sh.vx * 0.35; sh.vy = -120; sh.dead = true;
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
  failText: S => S.stones <= 0 ? '돌이 다 떨어졌어요' : '거인이 코앞까지 왔어요',
  draw(g, S) {
    // 엘라 골짜기: 양쪽 산, 가운데 시내
    const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#a9c8dc'); sky.addColorStop(0.55, '#e6d9b4'); sky.addColorStop(1, '#b49a6c'); g.fillStyle = sky; g.fillRect(0, 0, W, H);
    g.fillStyle = '#9a8a62'; g.beginPath(); g.moveTo(0, 300); g.quadraticCurveTo(90, 190, 200, 290); g.quadraticCurveTo(300, 200, W, 280); g.lineTo(W, H); g.lineTo(0, H); g.fill();
    g.fillStyle = '#b5a274'; g.fillRect(0, 432, W, 70); g.fillStyle = '#6e9aa8'; g.beginPath(); g.ellipse(170, 470, 120, 10, 0, 0, 7); g.fill(); // 시내
    for (const [x, y] of [[120, 466], [150, 474], [205, 468], [235, 476], [180, 480]]) { g.fillStyle = '#d8d0c0'; g.beginPath(); g.ellipse(x, y, 4, 2.6, 0, 0, 7); g.fill(); } // 매끄러운 돌
    // 골리앗과 방패 든 자
    giant(g, S);
    // 다윗
    const ax = S.aim ? clamp(S.aim.x - S.aim.x0, -90, 90) : 0, ay = S.aim ? clamp(S.aim.y - S.aim.y0, -90, 90) : 0;
    g.save(); g.translate(DAV[0], DAV[1]);
    g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(0, 12, 14, 4, 0, 0, 7); g.fill();
    g.fillStyle = '#c9a874'; g.beginPath(); g.moveTo(-10, 10); g.quadraticCurveTo(-8, -26, 0, -28); g.quadraticCurveTo(8, -26, 10, 10); g.fill();
    g.fillStyle = '#c99872'; g.beginPath(); g.arc(0, -34, 7, 0, 7); g.fill(); g.fillStyle = '#6a3a1a'; g.beginPath(); g.arc(0, -37, 7.5, Math.PI, 0); g.fill();
    g.strokeStyle = '#c99872'; g.lineWidth = 3.5; g.lineCap = 'round'; g.beginPath(); g.moveTo(5, -22); const hx = 14 + ax * 0.15, hy = -40 + ay * 0.15; g.lineTo(hx, hy); g.stroke();
    g.strokeStyle = '#5a3a1a'; g.lineWidth = 1.4; // 물매 줄 — 당기면 늘어진다
    if (S.aim) { g.beginPath(); g.moveTo(hx, hy); g.lineTo(hx + ax * 0.5, hy + ay * 0.5); g.stroke(); g.fillStyle = '#d8d0c0'; g.beginPath(); g.arc(hx + ax * 0.5, hy + ay * 0.5, 3.5, 0, 7); g.fill(); }
    else { const r = S.t * 12; g.beginPath(); g.moveTo(hx, hy); g.lineTo(hx + Math.cos(r) * 14, hy + Math.sin(r) * 14); g.stroke(); } // 빙빙 돌린다
    g.restore();
    // 겨눔: 처음 몇 점만 궤적
    if (S.aim) { const v = vel(S.aim); let x = DAV[0] + 14, y = DAV[1] - 40, vx = v[0], vy = v[1];
      for (let i = 0; i < 6; i++) { for (let k = 0; k < 4; k++) { vy += GRAV * 0.016; x += vx * 0.016; y += vy * 0.016; } g.fillStyle = `rgba(255,255,255,${0.8 - i * 0.12})`; g.beginPath(); g.arc(x, y, 2.4, 0, 7); g.fill(); } }
    for (const [i, [x, y]] of S.trail.entries()) { g.fillStyle = `rgba(230,225,210,${i / S.trail.length * 0.6})`; g.beginPath(); g.arc(x, y, 2, 0, 7); g.fill(); }
    if (S.shot) { g.fillStyle = '#e6dfcf'; g.beginPath(); g.arc(S.shot.x, S.shot.y, 3.6, 0, 7); g.fill(); }
    for (const p of S.sparks) { g.fillStyle = `rgba(255,236,170,${clamp(p.life, 0, 1)})`; star(g, p.x, p.y, p.r * 2.4); }
    floatMsg(g, S.msg);
    // 남은 돌
    g.save(); g.font = '700 14px "Noto Sans KR",sans-serif'; g.textAlign = 'left'; g.fillStyle = '#3a2a14'; g.fillText('남은 돌', 14, 26);
    for (let i = 0; i < 5; i++) { g.fillStyle = i < S.stones ? '#e6dfcf' : 'rgba(60,40,20,.25)'; g.beginPath(); g.ellipse(76 + i * 16, 21, 6, 4.5, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(60,40,20,.5)'; g.lineWidth = 1; g.stroke(); }
    g.restore();
  },
  end(g, k, S) { this.update(0.016, S); this.draw(g, S);
    if (k > 0.35) { g.save(); g.globalAlpha = clamp((k - 0.35) * 2, 0, 1); g.fillStyle = 'rgba(30,22,12,.8)'; g.fillRect(0, 96, W, 84);
      g.font = '700 18px "Gowun Batang",serif'; g.textAlign = 'center'; g.fillStyle = '#fff0d6'; g.fillText('전쟁은 여호와께 속한 것인즉', W / 2, 126); g.fillText('그가 너희를 우리 손에 넘기시리라', W / 2, 150);
      g.font = '600 11px "Noto Sans KR",sans-serif'; g.fillStyle = '#e6cfa6'; g.fillText('삼상 17:47', W / 2, 169); g.restore(); }
  },
};
const vel = a => { const dx = a.x0 - a.x, dy = a.y0 - a.y, L = Math.hypot(dx, dy), k = Math.min(1, L / 120) * VMAX / (L || 1); return [dx * k, dy * k]; }; // 당긴 반대쪽으로, 120까지 당기면 최대
// 맞은 곳: 투구·갑옷·방패면 그 이름(튕긴다), 아니면 null
function armorHit(S, sh) {
  const h = sling.head(S), gx = S.gx;
  if (Math.hypot(sh.x - h.x, sh.y - (h.y - 13)) < 13) return '놋 투구에 튕겼어요';
  if (sh.x > gx - 22 && sh.x < gx + 22 && sh.y > h.y + 12 && sh.y < 430) return '비늘 갑옷에 튕겼어요';
  const bx = gx - 74; if (sh.x > bx - 18 && sh.x < bx + 14 && sh.y > 330 && sh.y < 428) return '방패에 막혔어요';
  return null;
}
function giant(g, S) {
  const h = sling.head(S), gx = S.gx, f = S.fallen, bx = gx - 74;
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
  title: '무너진 성벽', task: '나팔에 맞춰 일곱째 날까지 성 돌기',
  ask: ['엿새 동안 날마다 이 성을 한 바퀴 돌고, 일곱째 날에는 일곱 바퀴를 돌라 하셨다.', '제사장들의 양각 나팔 소리에 맞춰 걸어라 — 마지막엔 크게 외쳐라!'],
  quote: '일곱째 날에는 그 성을 일곱 번 돌며 제사장들은 나팔을 불 것이며', ref: '수 6:4',
  help: '나팔(음표)이 오른쪽에서 흘러와요. 왼쪽 원에 닿을 때 화면을 눌러요.<br>날이 갈수록 빨라져요. 여섯 번 놓치면 흐트러져요. 마지막에 "외치라!" — 마구 눌러요!',
  seconds: 55,
  // 박자표 [박 수, 간격]: 날마다 여섯 박(1–6일은 0.85→0.6초 간격), 일곱째 날은 박자 열넷을 빠르게
  plan: [1, 2, 3, 4, 5, 6, 7].map(d => d < 7 ? [6, 0.9 - d * 0.05] : [14, 0.42]),
  label: (S, d) => S.shoutOn ? '일곱째 날 — 외치라!' : `${d}일째${d === 7 ? ' — 일곱 바퀴' : ''}`,
  shoutText: ['마구 눌러 크게 외쳐요!', '성벽이 무너진다!'], hitFx: ['horn', 'step'], note: horn,
  missText: '나팔 소리에서 흐트러졌어요',
  endLines: ['백성이 큰 소리로 외쳐 부를 때에', '성벽이 무너져 내린지라', '수 6:20'],
  init() {
    const notes = []; let t = 1.6;
    this.plan.forEach(([n, gap], i) => { for (let k = 0; k < n; k++) { notes.push({ t, day: i + 1, st: 0, last: i === this.plan.length - 1 }); t += gap; } t += 1.1; });
    return { notes, t: 0, miss: 0, hit: 0, combo: 0, msg: null, sparks: [], shout: 0, shoutOn: false, fall: 0, flash: 0, endT: t };
  },
  day(S) { const n = S.notes.find(n => !n.st); return n ? n.day : this.plan.length; },
  update(dt, S) {
    S.t += dt; S.flash = Math.max(0, S.flash - dt * 4);
    for (const n of S.notes) if (!n.st && S.t - n.t > WIN) { n.st = -1; S.miss++; S.combo = 0; S.msg = { t: '놓쳤어요', c: '#ffb38a', at: 0.6, x: HITX + 40, y: LANE - 48 }; }
    if (!S.shoutOn && S.notes.every(n => n.st)) { S.shoutOn = true; S.msg = { t: this.shoutMsg || '외치라!', c: '#ffe29a', at: 2, x: W / 2, y: 120 }; S.fx.play(this.hitFx[0]); }
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
    S.msg = { t: d < 0.08 ? '딱 맞게!' : '좋아요', c: d < 0.08 ? '#ffe29a' : '#e8f0d0', at: 0.5, x: HITX + 50, y: LANE - 44 };
    for (let i = 0; i < (d < 0.08 ? 8 : 4); i++) S.sparks.push({ x: HITX + rnd(-12, 12), y: LANE + rnd(-12, 12), vy: rnd(-50, -15), life: rnd(0.3, 0.6), r: rnd(1.2, 2.4) });
  },
  up() {},
  won: S => S.fall >= 1,
  lost: S => S.miss >= MISSMAX,
  failText(S) { return S.miss >= MISSMAX ? this.missText : '시간이 다 되었어요'; },
  draw(g, S) {
    this.scene(g, S);
    const day = this.day(S); g.save(); g.font = '800 16px "Noto Sans KR",sans-serif'; g.textAlign = 'left'; g.fillStyle = this.ink || '#3a2a14';
    g.fillText(this.label(S, day), 14, 28);
    g.font = '700 12px "Noto Sans KR",sans-serif'; g.globalAlpha = 0.8; g.fillText(`놓침 ${S.miss} / ${MISSMAX}`, 14, 48); g.restore();
    this.lane(g, S);
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
const PALM_SEG = ['감람산 꼭대기', '벳바게 비탈', '길이 꺾이는 곳', '성문 앞 — 호산나!'];
const palms = { ...jericho, title: '종려가지의 행렬', task: '종려가지를 흔들며 성까지',
  ask: ['오늘은 너도 저 무리 속에 서 보렴.', '종려가지를 박자에 맞춰 흔들어라 — 성문 앞에서는 크게 호산나!'],
  quote: '종려나무 가지를 가지고 맞으러 나가 외치되 호산나 찬송하리로다', ref: '요 12:13',
  help: '종려가지(음표)가 오른쪽에서 흘러와요. 왼쪽 원에 닿을 때 눌러요.<br>길을 내려갈수록 빨라져요. 여섯 번 놓치면 흐트러져요. 마지막에 "호산나!" — 마구 눌러요!',
  seconds: 36, plan: [[6, 0.78], [8, 0.62], [10, 0.5], [12, 0.4]],
  label: (S, d) => S.shoutOn ? '호산나! 찬송하리로다' : PALM_SEG[d - 1],
  shoutMsg: '호산나!', shoutText: ['마구 눌러 호산나!', '찬송하리로다!'], hitFx: ['swish', 'step'], doneFx: 'shout', note: palmNote, ink: '#2a2a18',
  missText: '행렬의 박자가 흐트러졌어요',
  endLines: ['찬송하리로다 주의 이름으로 오시는 왕이여', '하늘에는 평화요 가장 높은 곳에는 영광이로다', '눅 19:38'],
  scene(g, S) {
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
  title: '별을 따라온 박사들', task: '어제 없던 별 하나 찾기 — 네 밤',
  ask: ['박사들은 밤마다 하늘을 살피던 사람들이었단다. 그러다 처음 보는 별 하나를 알아보았지.', '너도 찾아보렴 — 하늘을 잘 봐 두었다가, 새로 뜬 별을!'],
  quote: '우리가 동방에서 그의 별을 보고 그에게 경배하러 왔노라', ref: '마 2:2',
  help: '밤하늘을 잠깐 보여 줘요 — 잘 봐 두세요.<br>구름이 지나간 뒤 새로 뜬 별 하나를 눌러요. 엉뚱한 곳을 누르면 구름이 덮어요. 네 밤.',
  seconds: 44,
  init() { const S = { dust: Array.from({ length: 160 }, () => ({ x: rnd(0, W), y: rnd(0, 340), a: rnd(0.08, 0.22) })), night: 0, ph: 'look', pt: 0, stars: [], nova: null, found: 0, msg: null, sparks: [], cover: 0, wrong: [], tw: 0 }; this.sky(S); return S; },
  sky(S) { // 밤마다 별을 새로 흩는다 — 서로 너무 붙지 않게
    const n = 14 + S.night * 6, st = [];
    const ok = (x, y) => st.every(s => Math.hypot(s.x - x, s.y - y) > 30);
    for (let k = 0; st.length < n + 1 && k < 4000; k++) { const x = rnd(24, 376), y = rnd(40, 300); if (ok(x, y)) st.push({ x, y, r: rnd(1.5, 3.0), ph: rnd(0, 7) }); }
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
      S.msg = { t: S.night === NIGHTS - 1 ? '그의 별이다!' : '찾았어요!', c: '#ffe29a', at: 0.9, x: S.nova.x, y: S.nova.y - 26 };
      for (let i = 0; i < 16; i++) { const a = rnd(0, 7), v = rnd(30, 90); S.sparks.push({ x: S.nova.x, y: S.nova.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rnd(0.4, 0.9), r: rnd(1, 2.2) }); }
    } else { S.cover = 1.0; S.wrong.push({ x, y }); S.fx.play('miss'); S.msg = { t: '그 별이 아니에요', c: '#ffc2a0', at: 0.8, x, y: y - 20 }; }
  },
  up() {},
  won: S => S.found >= NIGHTS,
  failText: () => '새 별을 다 찾지 못했어요',
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
    g.fillText(`${S.night + 1 > NIGHTS ? NIGHTS : S.night + 1}째 밤`, 14, 26);
    g.font = '700 12px "Noto Sans KR",sans-serif'; g.fillStyle = 'rgba(233,226,255,.75)';
    g.fillText(S.ph === 'look' ? '하늘을 잘 봐 두세요' : S.ph === 'cloud' ? '구름이 지나가요…' : S.ph === 'find' ? '새로 뜬 별 하나를 눌러요' : '', 14, 45);
    for (let i = 0; i < NIGHTS; i++) { g.fillStyle = i < S.found ? '#ffe29a' : 'rgba(255,255,255,.25)'; star(g, W - 20 - i * 22, 22, 7); }
    if (S.ph === 'look') { g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(14, 52, 120, 4); g.fillStyle = '#c9c2ff'; g.fillRect(14, 52, 120 * (1 - S.pt / LOOK[S.night]), 4); }
    g.restore();
    for (const p of S.sparks) { g.fillStyle = `rgba(255,236,170,${clamp(p.life, 0, 1)})`; star(g, p.x, p.y, p.r * 2.4); }
    floatMsg(g, S.msg);
  },
  end(g, k, S) { // 그 별이 앞서가 아기 있는 곳 위에 머문다(2:9)
    nightSky(g, S);
    for (const s of S.stars) skyStar(g, s, S.tw += 0.016, 0);
    const sx = S.nova.x + (300 - S.nova.x) * k, sy = S.nova.y + (150 - S.nova.y) * k;
    g.save(); g.globalAlpha = 0.25 * k; g.fillStyle = '#ffe9a8'; g.beginPath(); g.moveTo(sx, sy); g.lineTo(270, 362); g.lineTo(330, 362); g.fill(); g.restore();
    dunes(g);
    g.fillStyle = '#2a2236'; g.fillRect(276, 330, 48, 32); g.fillStyle = '#ffcf7a'; g.fillRect(294, 342, 12, 20); // 작은 집, 불빛
    for (let i = 0; i < 3; i++) camel(g, 120 + i * 50 + k * 60, 384 + i * 6, 1 - i * 0.08);
    g.save(); g.shadowColor = '#ffe9a8'; g.shadowBlur = 24; g.fillStyle = '#fff4c8'; star(g, sx, sy, 10 + 3 * Math.sin(k * 12)); g.restore();
    if (k > 0.35) { g.save(); g.globalAlpha = clamp((k - 0.35) * 2, 0, 1); g.textAlign = 'center'; g.font = '700 17px "Gowun Batang",serif'; g.fillStyle = '#fff0d6';
      g.fillText('그 별이 앞서 인도하여 가다가', W / 2, 220); g.fillText('아기 있는 곳 위에 머물러 서 있는지라', W / 2, 246);
      g.font = '600 11px "Noto Sans KR",sans-serif'; g.fillStyle = '#d8cfa8'; g.fillText('마 2:9', W / 2, 266); g.restore(); }
  },
};
function nightSky(g, S) { // 짙은 밤 + 은하수 띠 + 아주 옅은 잔별(누를 별과 헷갈리지 않게 작고 흐리게)
  const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#070a24'); sky.addColorStop(0.55, '#16204a'); sky.addColorStop(0.75, '#2c2a52'); sky.addColorStop(1, '#4a3550'); g.fillStyle = sky; g.fillRect(0, 0, W, H);
  g.save(); g.translate(200, 190); g.rotate(-0.5); const mw = g.createLinearGradient(0, -60, 0, 60); mw.addColorStop(0, 'rgba(150,160,220,0)'); mw.addColorStop(0.5, 'rgba(150,160,220,.12)'); mw.addColorStop(1, 'rgba(150,160,220,0)'); g.fillStyle = mw; g.fillRect(-320, -60, 640, 120); g.restore();
  const hz = g.createRadialGradient(330, 360, 10, 330, 360, 220); hz.addColorStop(0, 'rgba(255,170,120,.18)'); hz.addColorStop(1, 'rgba(255,170,120,0)'); g.fillStyle = hz; g.fillRect(0, 160, W, 220);
  for (const d of S.dust) { g.fillStyle = `rgba(220,225,255,${d.a})`; g.fillRect(d.x, d.y, 0.9, 0.9); }
}
function dunes(g) {
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
  g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#0e0b16';
  g.beginPath(); g.ellipse(0, -16, 18, 9, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(-2, -26, 8, 7, 0, 0, 7); g.fill();
  g.beginPath(); g.moveTo(14, -18); g.quadraticCurveTo(26, -26, 24, -36); g.lineTo(30, -36); g.lineTo(28, -30); g.quadraticCurveTo(28, -22, 18, -12); g.fill();
  for (const lx of [-12, -6, 8, 14]) g.fillRect(lx, -10, 3, 18);
  g.beginPath(); g.ellipse(-2, -36, 4, 6, 0, 0, 7); g.fill(); // 탄 사람
  g.restore();
}

export const MINI = { jesus: { e04: magi, e11: cana, e17: fishing, e22: twelve, e23: rock, e31: loaves, e32: water, e39: stones, e42: sheep, e43: coin, e46: climb, e48: palms },
  david: { d01: herdDavid, d05: sling, d38: templeStones }, moses: { m35: jericho, m39: tribes } };

/* ---------- 놀이 틀: 소개 → 놀이(제한 시간) → 성공 연출/실패 → 결과 ---------- */
// host: 모달 안의 상자. fx: { play, pour } (game-audio.js). 끝나면 done({ ok, left, tries })
export function playMini(game, host, fx, done) {
  let tries = 0, raf = 0, S = null, phase = 'intro', t = 0, last = 0, endT = 0, left = 0, bonus = 0;
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
    const p = panel('lost', `<h3>${game.failText?.(S) || '시간이 다 되었어요'}</h3><p>${tries < TRIES ? '한 번 더 해 볼까요?' : '이번에는 카드를 얻지 못했어요.<br>다시 걸을 때 또 도전할 수 있어요.'}</p>
      <div class="row">${tries < TRIES ? '<button class="go ghost" data-q>그만두기</button><button class="go" data-r>다시 도전</button>' : '<button class="go" data-q>계속</button>'}</div>`);
    p.querySelector('[data-r]')?.addEventListener('click', start);
    p.querySelector('[data-q]').onclick = () => close({ ok: false, left: 0, tries });
  };
  const close = r => { cancelAnimationFrame(raf); removeEventListener('resize', fit); removeEventListener('keydown', onKey); fx.pour?.(null); fx.storm?.(null); done(r); };
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
        const p = panel('won', `<h3>성공!</h3><p>${game.survive ? '끝까지 버텼어요' : `남은 시간 <b>${left}초</b>`} · 보너스 <b>+${bonus}점</b></p><button class="go">카드 받기</button>`);
        p.querySelector('.go').onclick = () => close({ ok: true, left, bonus, tries });
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

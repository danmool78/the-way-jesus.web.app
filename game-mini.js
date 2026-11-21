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
  g.lineWidth = 4; g.strokeStyle = 'rgba(15,20,25,.8)'; g.strokeText(m.t, clamp(m.x, 80, W - 80), m.y - rise); g.fillStyle = m.c; g.fillText(m.t, clamp(m.x, 80, W - 80), m.y - rise); g.restore();
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
    const cards = TWELVE.flatMap((d, i) => [{ p: i, name: true }, { p: i, name: false }]).sort(() => Math.random() - 0.5);
    cards.forEach((c, k) => { c.x = 12 + (k % 4) * (CW + 9) + CW / 2 + 4; c.y = 48 + Math.floor(k / 4) * (CH + 6) + CH / 2; c.up = 0; c.want = 1; c.done = false; c.glow = 0; c.shake = 0; });
    return { cards, peek: PEEK, open: [], wait: 0, msg: null, sparks: [], pairs: 0, fin: 0 };
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
      const d = TWELVE[a.p]; S.msg = { t: `${d[0]} — ${d[3]}`, c: '#ffe29a', at: 1.6, x: W / 2, y: 30 };
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
      g.font = '700 19px "Gowun Batang",serif'; g.textAlign = 'center'; g.fillStyle = '#ffe9c8'; g.fillText('자기와 함께 있게 하시고', W / 2, 246);
      g.fillText('보내사 전도도 하게 하시려 함이러라', W / 2, 272); g.font = '600 11px "Noto Sans KR",sans-serif'; g.fillStyle = '#d9c9a4'; g.fillText('막 3:14', W / 2, 290); g.restore(); }
  },
};
function drawCard12(g, c, S) {
  const d = TWELVE[c.p], open = c.up > 0.5, sx = Math.abs(Math.cos(c.up * Math.PI)) || 0.02, sh = Math.sin(c.shake * 25) * c.shake * 4;
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

export const MINI = { jesus: { e11: cana, e17: fishing, e22: twelve, e31: loaves } };

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
  const up = ev => { if (phase === 'play') game.up(S, ...pt(ev)); };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  const panel = (cls, html) => { stage.querySelector('.mpanel')?.remove(); stage.insertAdjacentHTML('beforeend', `<div class="mpanel ${cls}">${html}</div>`); return stage.querySelector('.mpanel'); };
  const start = () => {
    tries++; S = game.init(); S.fx = fx; t = game.seconds; phase = 'play'; last = performance.now(); fx.play('go');
    stage.querySelector('.mpanel')?.remove(); host.querySelector('.mini').classList.add('playing');
  };
  host.querySelector('.intro .go').onclick = start;
  const finish = ok => {
    fx.pour?.(null); phase = ok ? 'won' : 'lost'; host.querySelector('.mini').classList.remove('playing');
    if (ok) { left = Math.ceil(t); bonus = Math.round(200 * t / game.seconds); endT = 0; fx.play('wine'); return; } // 보너스는 남은 시간의 비율로(최대 200) — 제한 시간이 긴 놀이만 점수가 커지지 않게
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
      if (endT > 3.4 && !stage.querySelector('.won')) {
        const p = panel('won', `<h3>성공!</h3><p>남은 시간 <b>${left}초</b> · 보너스 <b>+${bonus}점</b></p><button class="go">카드 받기</button>`);
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

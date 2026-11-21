// 순례 게임의 소리 (사용자 2026-11): 배경음악 + 발소리 + 배 소리 + 효과음.
// 배경음악만 파일(앱과 같은 R2의 여정 곡), 나머지는 Web Audio로 그 자리에서 합성한다 — 파일을 더 받지 않아 호스팅 전송량이 들지 않는다.
// 한 번 울리는 소리는 끝나면(onended) 노드를 모두 끊어 버리고, 배 소리처럼 이어지는 소리는 멈출 때 서서히 줄인 뒤 끊는다.
const MEDIA = 'https://theway-admin.danmool78.workers.dev/f/';
const MUSIC_VOL = 0.3;

export function createAudio() {
  let ctx = null, master = null, noise = null, verb = null, on = true;
  try { on = localStorage.getItem('theway-game-sound') !== '0'; } catch { /* 사생활 보호 모드 */ }

  // 소리는 사용자가 한 번 누른 뒤에야 낼 수 있다(아이폰) — 시작 단추·화면을 누를 때 깨운다
  function unlock() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      ctx = new AC(); master = ctx.createGain(); master.gain.value = on ? 1 : 0; master.connect(ctx.destination);
      // 흰 소음 2초 — 발소리·물소리·바람이 모두 이것을 걸러 쓴다
      noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      // 잔향: 지수로 줄어드는 소음을 충격 응답으로 — 마른 합성음이 방 안에서 울리듯 (종소리·물소리가 덜 싸구려처럼, 사용자 2026-11)
      const n = ctx.sampleRate * 2.4, ir = ctx.createBuffer(2, n, ctx.sampleRate);
      for (let c = 0; c < 2; c++) { const x = ir.getChannelData(c); for (let i = 0; i < n; i++) x[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3.2); }
      verb = ctx.createConvolver(); verb.buffer = ir; const vg = ctx.createGain(); vg.gain.value = 0.32; verb.connect(vg); vg.connect(master);
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  }
  addEventListener('pointerdown', unlock, { passive: true });
  addEventListener('keydown', unlock);

  // 노드 묶음을 끝난 뒤 끊는다
  const drop = (src, nodes) => { src.onended = () => { for (const n of [src, ...nodes]) { try { n.disconnect(); } catch { /* 이미 끊김 */ } } }; };

  // 걸러 낸 소음 한 번: 발소리·물 튐·쉿 소리·바람
  function burst({ type = 'lowpass', f = 800, f2, q = 0.8, vol = 0.2, a = 0.004, d = 0.12, rate = 1, pan = 0, at = 0 }) {
    if (!ctx || !on) return;
    const t = ctx.currentTime + at, s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain(), p = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    s.buffer = noise; s.playbackRate.value = rate;
    fl.type = type; fl.frequency.setValueAtTime(f, t); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + a + d); fl.Q.value = q;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
    s.connect(fl); fl.connect(g);
    if (p) { p.pan.value = pan; g.connect(p); p.connect(master); } else g.connect(master);
    s.start(t, Math.random() * 1.5, a + d + 0.05); drop(s, [fl, g, p].filter(Boolean));
  }
  // 음 하나: 종·반짝임·알림
  function tone({ f, f2, type = 'sine', vol = 0.15, a = 0.01, d = 0.5, at = 0, lp }) {
    if (!ctx || !on) return;
    const t = ctx.currentTime + at, o = ctx.createOscillator(), g = ctx.createGain(), nodes = [g];
    o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + a + d);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
    let last = o;
    if (lp) { const fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = lp; o.connect(fl); last = fl; nodes.push(fl); }
    last.connect(g); g.connect(master); if (verb) g.connect(verb);
    o.start(t); o.stop(t + a + d + 0.05); drop(o, nodes);
  }
  // 물방울 하나: 터지는 거품은 짧게 울리며 음이 위로 미끄러진다 — 이것을 여럿 겹치면 물소리가 된다(소음을 거르는 것보다 훨씬 물 같다)
  function bubble(f, vol = 0.06, at = 0) {
    if (!ctx || !on) return;
    const t = ctx.currentTime + at, o = ctx.createOscillator(), g = ctx.createGain(), d = 0.03 + Math.random() * 0.05;
    o.type = 'sine'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * (1.6 + Math.random() * 0.8), t + d);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(master); if (verb && Math.random() < 0.5) g.connect(verb);
    o.start(t); o.stop(t + d + 0.02); drop(o, [g]);
  }
  const bell = (f, at = 0, vol = 0.12, d = 1.4) => { tone({ f, vol, d, at }); tone({ f: f * 2.01, vol: vol * 0.35, d: d * 0.6, at }); tone({ f: f * 3.02, vol: vol * 0.12, d: d * 0.35, at }); };

  const SFX = {
    meet: () => { bell(523.3); bell(659.3, 0.12); bell(784, 0.24, 0.11, 1.8); },                 // 그분을 만남
    card: () => { [880, 1046.5, 1318.5, 1568, 1760, 2093].forEach((f, i) => tone({ f, type: 'triangle', vol: 0.07, d: 0.35, at: i * 0.055 })); bell(1046.5, 0.36, 0.08, 1.6); }, // 카드 받기
    right: () => { tone({ f: 659.3, type: 'triangle', vol: 0.12, d: 0.18 }); tone({ f: 987.8, type: 'triangle', vol: 0.12, d: 0.4, at: 0.11 }); },
    wrong: () => { tone({ f: 329.6, type: 'square', vol: 0.06, d: 0.18, lp: 900 }); tone({ f: 246.9, type: 'square', vol: 0.06, d: 0.4, at: 0.16, lp: 700 }); },
    lose: () => { tone({ f: 620, f2: 180, vol: 0.14, d: 0.35 }); burst({ type: 'bandpass', f: 1400, f2: 500, q: 1.2, vol: 0.12, d: 0.3, at: 0.05 }); }, // 물병을 잃음
    well: () => { burst({ type: 'bandpass', f: 400, f2: 1500, q: 1.5, vol: 0.16, a: 0.08, d: 0.8 }); bell(1046.5, 0.7, 0.07, 1); }, // 물 긷기
    late: () => { tone({ f: 196, f2: 174.6, type: 'sawtooth', vol: 0.07, a: 0.08, d: 0.9, lp: 600 }); tone({ f: 146.8, type: 'sawtooth', vol: 0.05, a: 0.08, d: 1, at: 0.25, lp: 500 }); },
    hiss: () => burst({ type: 'highpass', f: 3800, q: 0.7, vol: 0.09, a: 0.12, d: 0.9 }),            // 뱀
    wind: () => burst({ type: 'bandpass', f: 280, f2: 900, q: 0.6, vol: 0.2, a: 0.6, d: 2.2 }),       // 모래바람
    halt: () => { burst({ type: 'bandpass', f: 2600, q: 4, vol: 0.12, d: 0.08 }); burst({ type: 'bandpass', f: 2300, q: 4, vol: 0.1, d: 0.1, at: 0.14 }); tone({ f: 130.8, type: 'square', vol: 0.05, d: 0.25, lp: 500 }); }, // 병정의 창·방패
    bonus: () => [523.3, 659.3, 784, 1046.5].forEach((f, i) => tone({ f, type: 'triangle', vol: 0.09, d: 0.4, at: i * 0.08 })), // 시험을 이김·도움
    twinkle: () => [2093, 2637, 3136].forEach((f, i) => tone({ f, vol: 0.035, d: 0.5, at: i * 0.09 })), // 보물이 가까이서 반짝임
    treasure: () => { [523.3, 659.3, 784, 1046.5, 1318.5].forEach((f, i) => tone({ f, type: 'triangle', vol: 0.08, d: 0.45, at: i * 0.07 })); bell(1568, 0.4, 0.09, 2); bell(2093, 0.55, 0.06, 2); },
    end: () => { [392, 523.3, 659.3, 784].forEach((f, i) => bell(f, i * 0.18, 0.1, 2)); },
    // 장면 놀이 (game-mini.js)
    go: () => { bell(659.3, 0, 0.09, 0.9); bell(987.8, 0.1, 0.08, 1.1); },                                              // 시작
    plink: () => { bell(1318.5, 0, 0.08, 1.2); tone({ f: 1975.5, vol: 0.05, d: 0.6, at: 0.06 }); for (let i = 0; i < 5; i++) bubble(900 + i * 160, 0.035, 0.02 + i * 0.03); }, // 딱 맞음
    splash: () => { burst({ type: 'lowpass', f: 2400, f2: 400, q: 0.7, vol: 0.26, a: 0.008, d: 0.55 }); burst({ type: 'highpass', f: 3500, vol: 0.05, d: 0.3, at: 0.04 });
      for (let i = 0; i < 26; i++) bubble(250 + Math.random() * 900, 0.05 + Math.random() * 0.05, Math.random() * 0.6); // 쏟아져 바닥에 튀는 물방울
      tone({ f: 220, f2: 150, type: 'triangle', vol: 0.07, d: 0.35, lp: 900 }); }, // 넘침
    wine: () => { // 물이 포도주로: 낮은 울림 위로 종이 오르고, 오래 남는 화음
      [130.8, 196, 261.6].forEach(f => tone({ f, type: 'sine', vol: 0.06, a: 0.6, d: 2.6 }));
      [523.3, 659.3, 784, 987.8, 1174.7, 1568].forEach((f, i) => bell(f, 0.15 + i * 0.13, 0.065, 2.6));
      [1046.5, 1318.5, 1568, 2093].forEach((f, i) => tone({ f, type: 'triangle', vol: 0.025, a: 0.4, d: 2.2, at: 0.9 + i * 0.05 })); },
    tick: () => tone({ f: 1760, type: 'triangle', vol: 0.04, d: 0.06 }),
    flip: () => { burst({ type: 'bandpass', f: 2400, f2: 1200, q: 1.4, vol: 0.09, a: 0.004, d: 0.07 }); tone({ f: 880, type: 'triangle', vol: 0.03, d: 0.06 }); }, // 카드 뒤집기
    flipall: () => { for (let i = 0; i < 12; i++) burst({ type: 'bandpass', f: 2200 + Math.random() * 800, q: 1.4, vol: 0.05, a: 0.004, d: 0.06, at: i * 0.025 }); },
    miss: () => { tone({ f: 311, type: 'triangle', vol: 0.06, d: 0.18 }); tone({ f: 277, type: 'triangle', vol: 0.06, d: 0.25, at: 0.1 }); },
    thunder: () => { burst({ type: 'lowpass', f: 300, f2: 60, q: 0.5, vol: 0.4, a: 0.02, d: 2.2, rate: 0.5 }); burst({ type: 'lowpass', f: 900, f2: 120, vol: 0.18, a: 0.005, d: 0.6, rate: 0.7 }); }, // 천둥
    gust: () => burst({ type: 'bandpass', f: 500, f2: 1400, q: 1.1, vol: 0.12, a: 0.25, d: 0.8 }),                                  // 돌풍
    gurgle: () => { for (let i = 0; i < 12; i++) bubble(160 + Math.random() * 260, 0.05, i * 0.05); },                                // 가라앉음
    calm: () => { [196, 293.7, 392].forEach(f => tone({ f, vol: 0.06, a: 0.8, d: 3 })); [784, 987.8, 1174.7].forEach((f, i) => bell(f, 0.6 + i * 0.25, 0.05, 2.4)); }, // 바람이 그침
    sweep: () => burst({ type: 'bandpass', f: 3200 + Math.random() * 1200, f2: 1800, q: 0.9, vol: 0.06, a: 0.02, d: 0.16 }),   // 비질
    glint: () => [2637, 3520].forEach((f, i) => tone({ f, vol: 0.03, d: 0.35, at: i * 0.07 })),                            // 희미한 반짝임
    coin: () => { [2093, 2637, 3322].forEach((f, i) => tone({ f: f * (1 + Math.random() * 0.01), type: 'sine', vol: 0.07, d: 0.9, at: i * 0.01 })); tone({ f: 4186, vol: 0.03, d: 0.4 }); bell(1046.5, 0.12, 0.06, 1.4); }, // 은전
    baa: () => { // 양 울음: 떨리는 톱니파를 콧소리처럼 걸러서
      if (!ctx || !on) return; const t = ctx.currentTime, o = ctx.createOscillator(), l = ctx.createOscillator(), lg = ctx.createGain(), f = ctx.createBiquadFilter(), g = ctx.createGain(), base = 280 + Math.random() * 120;
      o.type = 'sawtooth'; o.frequency.setValueAtTime(base, t); o.frequency.linearRampToValueAtTime(base * 0.86, t + 0.55); l.frequency.value = 7 + Math.random() * 3; lg.gain.value = base * 0.06; l.connect(lg); lg.connect(o.frequency);
      f.type = 'bandpass'; f.frequency.value = 1100; f.Q.value = 2.5; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.07, t + 0.06); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
      o.connect(f); f.connect(g); g.connect(master); if (verb) g.connect(verb); o.start(t); l.start(t); o.stop(t + 0.65); l.stop(t + 0.65); drop(o, [l, lg, f, g]); },
    howl: () => { tone({ f: 330, f2: 520, type: 'sine', vol: 0.05, a: 0.4, d: 1.2, lp: 1200 }); tone({ f: 520, f2: 380, type: 'sine', vol: 0.04, a: 0.1, d: 0.8, at: 1.4, lp: 1200 }); }, // 먼 이리 울음
    shoo: () => { burst({ type: 'bandpass', f: 900, q: 1, vol: 0.12, a: 0.01, d: 0.15 }); tone({ f: 180, f2: 120, type: 'square', vol: 0.05, d: 0.2, lp: 700 }); }, // 막대로 쫓음
    horn: () => { // 양각 나팔(쇼파르): 낮게 시작해 위로 미끄러지는 거친 소리
      if (!ctx || !on) return; const t = ctx.currentTime, o = ctx.createOscillator(), o2 = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      o.type = 'sawtooth'; o2.type = 'square'; o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(330, t + 0.12); o2.frequency.setValueAtTime(221, t); o2.frequency.exponentialRampToValueAtTime(331, t + 0.12);
      f.type = 'lowpass'; f.frequency.setValueAtTime(700, t); f.frequency.linearRampToValueAtTime(1800, t + 0.1); f.Q.value = 3;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.07, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
      o.connect(f); o2.connect(f); f.connect(g); g.connect(master); if (verb) g.connect(verb); o.start(t); o2.start(t); o.stop(t + 0.45); o2.stop(t + 0.45); drop(o, [o2, f, g]); },
    swish: () => { burst({ type: 'bandpass', f: 900, f2: 2600, q: 1.4, vol: 0.12, a: 0.02, d: 0.16 }); burst({ type: 'highpass', f: 3000, vol: 0.04, a: 0.01, d: 0.1, at: 0.03 }); }, // 종려가지를 휙
    thud: () => { burst({ type: 'lowpass', f: 260, f2: 80, q: 0.9, vol: 0.4, a: 0.003, d: 0.22 }); burst({ type: 'bandpass', f: 1600, q: 1.5, vol: 0.05, a: 0.002, d: 0.05 }); }, // 돌이 돌 위에 놓임
    fire: () => { burst({ type: 'lowpass', f: 300, f2: 1800, q: 0.7, vol: 0.4, a: 0.3, d: 2.2, rate: 0.6 }); for (let i = 0; i < 26; i++) burst({ type: 'bandpass', f: 1500 + Math.random() * 2500, q: 2, vol: 0.05, a: 0.002, d: 0.05, at: 0.2 + Math.random() * 2 }); }, // 하늘에서 내린 불(쏴아 + 타닥)
    timbrel: () => { for (let i = 0; i < 5; i++) burst({ type: 'highpass', f: 6000 + Math.random() * 3000, vol: 0.05, a: 0.002, d: 0.05 + Math.random() * 0.06, at: i * 0.018 }); burst({ type: 'bandpass', f: 220, q: 2, vol: 0.18, a: 0.002, d: 0.08 }); }, // 소고(방울 + 가죽)
    chariot: () => { for (let i = 0; i < 8; i++) burst({ type: 'lowpass', f: 380, q: 1, vol: 0.12, a: 0.003, d: 0.06, at: i * 0.09 + Math.random() * 0.02 }); }, // 말발굽
    neigh: () => tone({ f: 700, f2: 520, type: 'sawtooth', vol: 0.03, a: 0.03, d: 0.5, lp: 1600 }), // 말이 놀라 멈춤
    bail: () => { burst({ type: 'bandpass', f: 900, f2: 400, q: 0.8, vol: 0.14, a: 0.01, d: 0.18 }); for (let i = 0; i < 4; i++) bubble(500 + Math.random() * 700, 0.04, 0.06 + i * 0.03); }, // 물을 퍼서 던짐
    step: () => burst({ type: 'lowpass', f: 300, q: 0.8, vol: 0.16, a: 0.004, d: 0.12 }),                                          // 발 구름(박자)
    shout: () => { for (let i = 0; i < 6; i++) burst({ type: 'bandpass', f: 500 + Math.random() * 700, q: 0.8, vol: 0.07, a: 0.02, d: 0.25, at: Math.random() * 0.05 }); },
    collapse: () => { burst({ type: 'lowpass', f: 400, f2: 50, vol: 0.45, a: 0.02, d: 2.6, rate: 0.5 }); for (let i = 0; i < 20; i++) burst({ type: 'bandpass', f: 600 + Math.random() * 1500, q: 1, vol: 0.08, a: 0.01, d: 0.2, at: Math.random() * 1.8 }); },
    pick: () => { tone({ f: 520, f2: 700, type: 'triangle', vol: 0.06, a: 0.005, d: 0.08 }); },                         // 집어 듦
    drop: () => { burst({ type: 'lowpass', f: 500, q: 0.8, vol: 0.12, a: 0.004, d: 0.1 }); tone({ f: 392, type: 'triangle', vol: 0.05, d: 0.15 }); }, // 내려놓음
    cast: () => { burst({ type: 'bandpass', f: 600, f2: 2600, q: 1.2, vol: 0.12, a: 0.05, d: 0.3 }); burst({ type: 'highpass', f: 2000, vol: 0.04, d: 0.2, at: 0.08 }); }, // 그물이 휙
    plop: () => { burst({ type: 'lowpass', f: 1400, f2: 300, q: 1, vol: 0.18, a: 0.006, d: 0.3 }); for (let i = 0; i < 9; i++) bubble(300 + Math.random() * 600, 0.04, 0.02 + Math.random() * 0.25); }, // 그물이 물에
    flap: () => { for (let i = 0; i < 10; i++) burst({ type: 'bandpass', f: 1800 + Math.random() * 1500, q: 2, vol: 0.06, a: 0.003, d: 0.04, at: i * 0.06 + Math.random() * 0.03 }); }, // 고기가 퍼덕
    creak: () => tone({ f: 140 + Math.random() * 40, f2: 120, type: 'sawtooth', vol: 0.025, a: 0.02, d: 0.18, lp: 700 }), // 그물 줄이 삐걱
    rip: () => { burst({ type: 'highpass', f: 1200, f2: 4000, q: 0.6, vol: 0.18, a: 0.005, d: 0.22 }); burst({ type: 'bandpass', f: 900, q: 3, vol: 0.1, d: 0.15, at: 0.06 }); tone({ f: 300, f2: 120, type: 'square', vol: 0.05, d: 0.25, lp: 800 }); },
    haul: () => { burst({ type: 'lowpass', f: 900, f2: 200, vol: 0.2, a: 0.01, d: 0.4 }); for (let i = 0; i < 14; i++) burst({ type: 'bandpass', f: 2000 + Math.random() * 1200, q: 2, vol: 0.05, a: 0.003, d: 0.04, at: 0.1 + i * 0.05 }); bell(784, 0.05, 0.07, 0.9); bell(1174.7, 0.15, 0.06, 1); }, // 배에 쏟음                                                   // 남은 초
  };
  const play = k => { unlock(); SFX[k]?.(); };

  // 발소리: 걷는 동안 일정한 박자로 (왼발·오른발 번갈아, 조금씩 다르게)
  let stepT = 0, foot = 1;
  function walk(dt, moving, slow) {
    if (!moving) { stepT = 0.12; return; }
    stepT -= dt; if (stepT > 0) return;
    stepT = slow ? 0.48 : 0.34; foot = -foot;
    burst({ type: 'lowpass', f: 700 + Math.random() * 300, q: 0.7, vol: 0.13 + Math.random() * 0.05, a: 0.003, d: 0.09, rate: 0.8 + Math.random() * 0.4, pan: foot * 0.15 });
    burst({ type: 'bandpass', f: 2600, q: 1, vol: 0.025, a: 0.002, d: 0.05, at: 0.01 }); // 모래 밟는 사각임
  }

  // 배: 물결 소리를 이어 깔고(느리게 출렁), 노 젓는 물 튐을 박자마다
  let boatN = null, oarT = 0;
  function boat(dt, sailing, rowing) {
    if (!ctx || !on) sailing = false;
    if (sailing && !boatN) {
      const s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
      s.buffer = noise; s.loop = true; fl.type = 'lowpass'; fl.frequency.value = 520; g.gain.value = 0;
      lfo.frequency.value = 0.45; lg.gain.value = 0.05; lfo.connect(lg); lg.connect(g.gain);
      s.connect(fl); fl.connect(g); g.connect(master); s.start(); lfo.start();
      g.gain.setTargetAtTime(0.09, ctx.currentTime, 0.4);
      boatN = { s, fl, g, lfo, lg };
    } else if (!sailing && boatN) {
      const n = boatN; boatN = null;
      n.g.gain.cancelScheduledValues(ctx.currentTime); n.g.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
      setTimeout(() => { try { n.s.stop(); n.lfo.stop(); } catch { /* 이미 멈춤 */ } for (const k of ['s', 'fl', 'g', 'lfo', 'lg']) { try { n[k].disconnect(); } catch { /* */ } } }, 1500);
    }
    if (sailing && rowing) {
      oarT -= dt;
      if (oarT <= 0) { oarT = 1.25; burst({ type: 'bandpass', f: 900, f2: 400, q: 1, vol: 0.12, a: 0.02, d: 0.35 }); burst({ type: 'bandpass', f: 1800, q: 2, vol: 0.05, a: 0.01, d: 0.2, at: 0.08 }); }
    } else oarT = 0.3;
  }

  // 물 붓기 (가나의 돌항아리): 물줄기 소리(낮게 거른 소음)에 거품 소리를 계속 흩뿌린다. 항아리가 찰수록 공명(대역)과 거품의 음이 높아진다
  // — 빈 병에 물을 부을 때처럼 귀로도 아귀가 가까워지는 것을 안다
  let pourN = null, pourK = 0;
  function pour(k) {
    if (!ctx || !on) k = null;
    if (k != null && !pourN) {
      const s = ctx.createBufferSource(), lp = ctx.createBiquadFilter(), bp = ctx.createBiquadFilter(), g = ctx.createGain(), gb = ctx.createGain();
      s.buffer = noise; s.loop = true; lp.type = 'lowpass'; lp.frequency.value = 2200; bp.type = 'bandpass'; bp.Q.value = 6; g.gain.value = 0; gb.gain.value = 0;
      s.connect(lp); lp.connect(g); g.connect(master); lp.connect(bp); bp.connect(gb); gb.connect(master); if (verb) gb.connect(verb);
      s.start(); g.gain.setTargetAtTime(0.06, ctx.currentTime, 0.05); gb.gain.setTargetAtTime(0.22, ctx.currentTime, 0.05);
      const iv = setInterval(() => { const n = 1 + (Math.random() < 0.6); for (let i = 0; i < n; i++) bubble((260 + pourK * 900) * (0.7 + Math.random() * 0.7), 0.03 + Math.random() * 0.04, Math.random() * 0.03); }, 28);
      pourN = { s, lp, bp, g, gb, iv };
    }
    if (k != null) { pourK = Math.min(1.1, k); pourN.bp.frequency.setTargetAtTime(320 + pourK * 1300, ctx.currentTime, 0.06); }
    else if (pourN) { const n = pourN; pourN = null; clearInterval(n.iv); n.g.gain.setTargetAtTime(0, ctx.currentTime, 0.05); n.gb.gain.setTargetAtTime(0, ctx.currentTime, 0.08);
      setTimeout(() => { try { n.s.stop(); } catch { /* */ } [n.s, n.lp, n.bp, n.g, n.gb].forEach(x => { try { x.disconnect(); } catch { /* */ } }); }, 500); }
  }

  // 폭풍 (물 위로 오시는 분): 낮은 바람·파도 소리를 이어 깐다. 세기(k 0~1)에 따라 커지고 밝아진다
  let stormN = null;
  function storm(k) {
    if (!ctx || !on) k = null;
    if (k != null && !stormN) {
      const s = ctx.createBufferSource(), lp = ctx.createBiquadFilter(), g = ctx.createGain(), w = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), gw = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
      s.buffer = noise; s.loop = true; lp.type = 'lowpass'; lp.frequency.value = 380; g.gain.value = 0; // 파도의 낮은 울림
      w.buffer = noise; w.loop = true; w.playbackRate.value = 0.7; bp.type = 'bandpass'; bp.Q.value = 1.6; bp.frequency.value = 700; gw.gain.value = 0; // 바람이 우는 소리
      lfo.frequency.value = 0.23; lg.gain.value = 350; lfo.connect(lg); lg.connect(bp.frequency);
      s.connect(lp); lp.connect(g); g.connect(master); w.connect(bp); bp.connect(gw); gw.connect(master); if (verb) gw.connect(verb);
      s.start(); w.start(0.7); lfo.start(); stormN = { s, lp, g, w, bp, gw, lfo, lg };
    }
    if (k != null) { const t = ctx.currentTime; stormN.g.gain.setTargetAtTime(0.1 + k * 0.22, t, 0.3); stormN.gw.gain.setTargetAtTime(0.03 + k * 0.1, t, 0.3); stormN.lp.frequency.setTargetAtTime(300 + k * 500, t, 0.3); }
    else if (stormN) { const n = stormN; stormN = null; n.g.gain.setTargetAtTime(0, ctx.currentTime, 0.4); n.gw.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
      setTimeout(() => { try { n.s.stop(); n.w.stop(); n.lfo.stop(); } catch { /* */ } Object.values(n).forEach(x => { try { x.disconnect(); } catch { /* */ } }); }, 2500); }
  }

  // 배경음악: 장면마다 앱과 같은 곡(e.music)으로, 바뀔 때는 서서히 겹쳐 넘긴다
  let cur = null, curName = '', paused = false;
  const fade = (el, to, ms, after) => {
    clearInterval(el._f); const from = el.volume, t0 = performance.now();
    el._f = setInterval(() => { const k = Math.min(1, (performance.now() - t0) / ms); el.volume = from + (to - from) * k; if (k >= 1) { clearInterval(el._f); after?.(); } }, 50);
  };
  function music(cue) {
    if (!cue) return;
    const [name, ver] = cue.split('?');
    if (name === curName) return;
    curName = name;
    const old = cur;
    if (old) fade(old, 0, 1800, () => { old.pause(); old.removeAttribute('src'); old.load(); }); // 다 줄면 버린다
    const el = new Audio(); el.crossOrigin = 'anonymous'; el.loop = true; el.preload = 'auto'; el.volume = 0;
    el.src = `${MEDIA}assets/music/${name}.mp3${ver ? '?' + ver : ''}`;
    cur = el;
    if (on && !paused) el.play().then(() => fade(el, MUSIC_VOL, 2200)).catch(() => {});
  }
  // 장면 듣기 창(앱이 제 음악을 튼다)·다른 탭으로 갈 때는 멈췄다가 돌아오면 이어서
  function hold(h) {
    paused = h;
    if (!cur) return;
    if (h) fade(cur, 0, 500, () => cur?.pause());
    else if (on) cur.play().then(() => fade(cur, MUSIC_VOL, 1200)).catch(() => {});
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { hold(true); ctx?.suspend().catch(() => {}); }
    else { ctx?.resume().catch(() => {}); hold(false); }
  });

  function setOn(v) {
    on = v; try { localStorage.setItem('theway-game-sound', v ? '1' : '0'); } catch { /* */ }
    if (master) master.gain.setTargetAtTime(v ? 1 : 0, ctx.currentTime, 0.05);
    if (!v) boat(0, false, false);
    if (cur) { if (v && !paused) cur.play().then(() => fade(cur, MUSIC_VOL, 800)).catch(() => {}); else fade(cur, 0, 300, () => cur?.pause()); }
  }
  // 나갈 때 모두 끊는다
  function close() { boat(0, false, false); pour(null); storm(null); if (cur) { cur.pause(); cur.removeAttribute('src'); cur.load(); cur = null; } ctx?.close().catch(() => {}); ctx = null; }

  return { unlock, play, walk, boat, pour, storm, music, hold, setOn, close, get on() { return on; } };
}

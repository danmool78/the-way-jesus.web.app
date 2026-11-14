// 순례 게임의 소리 (사용자 2026-11): 배경음악 + 발소리 + 배 소리 + 효과음.
// 배경음악만 파일(앱과 같은 R2의 여정 곡), 나머지는 Web Audio로 그 자리에서 합성한다 — 파일을 더 받지 않아 호스팅 전송량이 들지 않는다.
// 한 번 울리는 소리는 끝나면(onended) 노드를 모두 끊어 버리고, 배 소리처럼 이어지는 소리는 멈출 때 서서히 줄인 뒤 끊는다.
const MEDIA = 'https://pub-7d2b46014d5b4769a48e210890df23c4.r2.dev/';
const MUSIC_VOL = 0.3;

export function createAudio() {
  let ctx = null, master = null, noise = null, on = true;
  try { on = localStorage.getItem('theway-game-sound') !== '0'; } catch { /* 사생활 보호 모드 */ }

  // 소리는 사용자가 한 번 누른 뒤에야 낼 수 있다(아이폰) — 시작 단추·화면을 누를 때 깨운다
  function unlock() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      ctx = new AC(); master = ctx.createGain(); master.gain.value = on ? 1 : 0; master.connect(ctx.destination);
      // 흰 소음 2초 — 발소리·물소리·바람이 모두 이것을 걸러 쓴다
      noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
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
    last.connect(g); g.connect(master);
    o.start(t); o.stop(t + a + d + 0.05); drop(o, nodes);
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
    end: () => { [392, 523.3, 659.3, 784].forEach((f, i) => bell(f, i * 0.18, 0.1, 2)); },
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
  function close() { boat(0, false, false); if (cur) { cur.pause(); cur.removeAttribute('src'); cur.load(); cur = null; } ctx?.close().catch(() => {}); ctx = null; }

  return { unlock, play, walk, boat, music, hold, setOn, close, get on() { return on; } };
}

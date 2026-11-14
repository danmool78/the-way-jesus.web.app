// 길 거리 (사용자 2026-11): 바다·호수를 돌아가야 하는 길(모세의 시내산, 열왕기의 바벨론)에서 직선거리로 재니
// 맞는 길을 돌아가도 '멀어진다'고 물병을 잃고, 길 묻기는 바다 쪽을 가리켰다.
// 장면마다 출발·목적지 둘레를 칸으로 나눠 걸을 수 있는 칸만 따라 목적지까지의 거리를 미리 채워 둔다(다익스트라).
// dist(x, z): 그 자리에서 목적지까지 걸어야 할 거리, ahead(x, z, k): 그 길을 따라 k만큼 앞의 자리(길 묻기 화살표)
// 둘레를 넉넉히 잡아도 닿지 않으면(미디안→호렙: 아카바 만 북쪽 끝까지 100km 넘게 돌아야 한다) 더 넓게 다시 잰다
export function buildNav(o) {
  const span = Math.max(Math.abs(o.to[0] - o.from[0]), Math.abs(o.to[1] - o.from[1]));
  let n = null;
  for (const pad of [Math.max(60, span * 0.6), Math.max(220, span * 1.5), Math.max(500, span * 3)]) { n = grid(o, pad); if (n.reach) break; }
  return n;
}
function grid({ from, to, walkable }, pad) {
  const [sx, sz] = from, [gx, gz] = to;
  const x0 = Math.min(sx, gx) - pad, z0 = Math.min(sz, gz) - pad, x1 = Math.max(sx, gx) + pad, z1 = Math.max(sz, gz) + pad;
  const cs = Math.max(0.8, Math.max(x1 - x0, z1 - z0) / 240); // 칸 크기 — 칸 수를 240×240 안팎으로
  const W = Math.ceil((x1 - x0) / cs) + 1, H = Math.ceil((z1 - z0) / cs) + 1, N = W * H;
  const ok = new Uint8Array(N), D = new Float64Array(N).fill(Infinity); // Float32는 반올림으로 힙의 값보다 작아져 칸을 건너뛰었다
  // 칸 가운데만 보면 길이 물가에 바짝 붙어 칸 사이의 물에 걸렸다(아카바 만 북쪽 끝에서 물병을 잃음) — 둘레 네 점까지 뭍이어야 길로 쓴다
  const r = cs * 0.7, dry = (x, z) => walkable(x, z) && walkable(x + r, z) && walkable(x - r, z) && walkable(x, z + r) && walkable(x, z - r);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) ok[j * W + i] = dry(x0 + i * cs, z0 + j * cs) ? 1 : 0;
  const cell = (x, z) => [Math.round((x - x0) / cs), Math.round((z - z0) / cs)];
  const inside = (i, j) => i >= 0 && j >= 0 && i < W && j < H;
  // 목적지 칸에서 거꾸로 퍼진다 (작은 이진 힙)
  const heap = [], push = (d, k) => { heap.push([d, k]); let c = heap.length - 1; while (c) { const p = (c - 1) >> 1; if (heap[p][0] <= heap[c][0]) break; [heap[p], heap[c]] = [heap[c], heap[p]]; c = p; } };
  const pop = () => { const t = heap[0], l = heap.pop(); if (heap.length) { heap[0] = l; let c = 0; for (;;) { const a = 2 * c + 1, b = a + 1; let m = c; if (a < heap.length && heap[a][0] < heap[m][0]) m = a; if (b < heap.length && heap[b][0] < heap[m][0]) m = b; if (m === c) break; [heap[m], heap[c]] = [heap[c], heap[m]]; c = m; } } return t; };
  const [gi, gj] = cell(gx, gz);
  if (inside(gi, gj)) { const k = gj * W + gi; ok[k] = 1; D[k] = 0; push(0, k); }
  const NB = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, 1, Math.SQRT2], [-1, -1, Math.SQRT2]];
  while (heap.length) {
    const [d, k] = pop(); if (d > D[k]) continue;
    const i = k % W, j = (k - i) / W;
    for (const [di, dj, w] of NB) {
      const a = i + di, b = j + dj; if (!inside(a, b)) continue;
      const n = b * W + a; if (!ok[n]) continue;
      if (di && dj && !(ok[j * W + a] && ok[b * W + i])) continue; // 대각선으로 물가 모서리를 뚫고 가지 않게
      const nd = d + w * cs; if (nd < D[n]) { D[n] = nd; push(nd, n); }
    }
  }
  const straight = (x, z) => Math.hypot(gx - x, gz - z);
  // 그 자리 둘레(물 위에 서 있어도) 가장 가까운 닿는 칸으로
  function near(x, z) {
    const [i, j] = cell(x, z);
    for (let r = 0; r < 6; r++) {
      let best = -1, bd = Infinity;
      for (let b = j - r; b <= j + r; b++) for (let a = i - r; a <= i + r; a++) {
        if (!inside(a, b) || Math.max(Math.abs(a - i), Math.abs(b - j)) !== r) continue;
        const n = b * W + a; if (D[n] < Infinity) { const dd = D[n] + Math.hypot(x0 + a * cs - x, z0 + b * cs - z); if (dd < bd) { bd = dd; best = n; } }
      }
      if (best >= 0) return [best, bd];
    }
    return [-1, Infinity];
  }
  const dist = (x, z) => { const [k, d] = near(x, z); return k < 0 || straight(x, z) < cs * 2 ? straight(x, z) : d; };
  function ahead(x, z, len) {
    let [k] = near(x, z); if (k < 0) return [gx, gz];
    for (let walked = 0; walked < len && D[k] > 0;) {
      const i = k % W, j = (k - i) / W; let nk = k;
      for (const [di, dj, w] of NB) { const a = i + di, b = j + dj; if (!inside(a, b)) continue; const n = b * W + a; if (D[n] < D[nk]) nk = n; }
      if (nk === k) break; walked += cs * Math.hypot(nk % W - i, (nk - nk % W) / W - j); k = nk;
    }
    if (D[k] === 0) return [gx, gz];
    return [x0 + (k % W) * cs, z0 + Math.floor(k / W) * cs];
  }
  return { dist, ahead, reach: near(sx, sz)[0] >= 0 };
}

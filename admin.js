/* 그 길 — 관리자: 장면의 말씀(_src/content-*.json의 words)을 고쳐 GitHub main에 바로 올린다.
   올리면 Actions(firebase-hosting-merge.yml)가 data를 다시 만들고 바뀐 장면의 녹음을 새로 만들어 배포한다.
   들어가는 열쇠는 이 저장소에 쓰기 권한이 있는 GitHub 토큰 — 토큰이 없으면 아무도 고칠 수 없다 */
const REPO = 'danmool78/the-way-jesus.web.app', BRANCH = 'main', KEY = 'theway-admin-token';
const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
let token = '', files = {}, data = null; // files: 경로 → { raw, json }

async function gh(path, init = {}) {
  const r = await fetch(`https://api.github.com${path}`, { ...init, cache: 'no-store',
    headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28', ...(init.body ? { 'Content-Type': 'application/json' } : {}) } });
  const j = r.status === 204 ? null : await r.json().catch(() => null);
  if (!r.ok) throw Object.assign(new Error(j?.message || `GitHub ${r.status}`), { status: r.status });
  return j;
}
// GitHub 내용 API는 base64 — 한글이 깨지지 않게 바이트로 풀고 묶는다
const fromB64 = b => new TextDecoder().decode(Uint8Array.from(atob(b.replace(/\n/g, '')), c => c.charCodeAt(0)));
const toB64 = s => { let bin = ''; new TextEncoder().encode(s).forEach(b => { bin += String.fromCharCode(b); }); return btoa(bin); };

async function readFile(path) {
  const j = await gh(`/repos/${REPO}/contents/${path}?ref=${BRANCH}`);
  const raw = fromB64(j.content);
  return files[path] = { raw, json: JSON.parse(raw), sha: j.sha };
}

/* ---------- 들어가기 ---------- */
async function enter(t, user) {
  token = t.trim();
  const msg = $('#loginMsg');
  msg.className = 'msg'; msg.textContent = '확인하는 중…';
  try {
    // 토큰의 주인이 적은 아이디와 같은지, 그 계정이 이 저장소에 쓸 수 있는지 GitHub에 묻는다
    const [me, repo] = await Promise.all([gh('/user'), gh(`/repos/${REPO}`)]);
    if (user && me.login.toLowerCase() !== user.trim().toLowerCase()) throw new Error(`이 토큰은 ${me.login} 계정의 것입니다`);
    if (!repo.permissions?.push) throw new Error('이 토큰에는 저장소에 쓸 권한이 없습니다');
    try { localStorage.setItem(KEY, token); } catch { /* 이번 방문만 */ }
    // 크롬은 이 줄로 바로 "비밀번호 저장"을 띄운다 (다른 브라우저는 양식 제출로 알아본다)
    if (user && window.PasswordCredential) navigator.credentials.store(new PasswordCredential({ id: me.login, password: token })).catch(() => {});
    await load();
  } catch (err) {
    token = '';
    try { localStorage.removeItem(KEY); } catch { /* 없음 */ }
    $('#login').hidden = false; $('#editor').hidden = $('#search').hidden = $('#logout').hidden = true;
    msg.className = 'msg bad'; msg.textContent = err.status === 401 ? '토큰이 맞지 않습니다' : err.message;
  }
}
$('#loginForm').onsubmit = e => { e.preventDefault(); enter($('#token').value, $('#user').value); };
$('#logout').onclick = () => { try { localStorage.removeItem(KEY); } catch { /* 없음 */ } location.reload(); };

/* ---------- 목록 ---------- */
async function load() {
  $('#loginMsg').textContent = '말씀을 불러오는 중…';
  // 장면 제목·장소는 배포된 data.json에서, 말씀은 GitHub의 최신 원본에서 (방금 고친 것도 바로 보이게)
  const [d, dir] = await Promise.all([fetch('data.json', { cache: 'no-store' }).then(r => r.json()), gh(`/repos/${REPO}/contents/_src?ref=${BRANCH}`)]);
  data = d;
  await loadVoices();
  await Promise.all(dir.filter(f => /^content-.*\.json$/.test(f.name)).map(f => readFile(f.path)));
  $('#login').hidden = true; $('#editor').hidden = $('#search').hidden = $('#logout').hidden = false;
  render();
}
const sceneOf = id => { for (const [path, f] of Object.entries(files)) { const c = f.json.find(x => x.id === id); if (c) return { path, c }; } return null; };

// ---------- 녹음 듣기 ----------
// 배포된 녹음(assets/voice/ko)을 앱과 같은 열쇠로 찾아 문장 차례로 튼다 (app.js의 sentences·voiceKey·VOICE_NAME과 같은 계산).
// 저장한 말씀 기준이라 고치는 중인 글은 저장·배포가 끝나야 들린다
const sentences = text => text.match(/[^.?!…。！？]+[.?!…。！？]*["”’」』]?\s*/g) || [text];
const voiceKey = (voice, text) => { let h = 0x811c9dc5; for (const c of `${voice}|${text}`) { h ^= c.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(36); };
let voiceIndex = {};
const loadVoices = () => fetch('assets/voice/ko/index.json', { cache: 'no-store' }).then(r => r.ok ? r.json() : {}).then(j => { voiceIndex = j; }).catch(() => {});
const clipsOf = w => sentences(w.text).map(t => t.trim()).filter(Boolean)
  .map(t => voiceKey(`${w.tts === 'gemini' ? 'gemini-' : ''}${w.who === '예수' ? 'Algenib' : 'Aoede'}`, t));
const player = new Audio();
let playing = null; // 지금 트는 말씀 칸
function stopPlay() {
  player.pause(); player.onended = player.onerror = null;
  if (playing) { $('.play', playing).textContent = '▶ 듣기'; playing.classList.remove('playing'); }
  playing = null;
}
function play(box) {
  if (playing === box) { stopPlay(); return; }
  stopPlay();
  const clips = clipsOf(original(box));
  if (!clips.every(k => voiceIndex[k])) { setState(box, '이 말씀의 녹음이 아직 없습니다 (앱에서는 브라우저 음성으로 읽힘)', 'bad'); return; }
  playing = box; box.classList.add('playing'); $('.play', box).textContent = '■ 멈춤';
  let n = 0;
  const next = () => { if (playing !== box) return; if (n >= clips.length) { stopPlay(); return; } player.src = `assets/voice/ko/${clips[n++]}.mp3`; player.play().catch(stopPlay); };
  player.onended = () => setTimeout(next, 500); player.onerror = stopPlay;
  next();
}

// 시대 → 장면 → 말씀, 시대와 장면은 접었다 폈다 (펼친 자리는 이 브라우저에 기억해 둔다)
const OPEN = 'theway-admin-open';
let opened = new Set(); try { opened = new Set(JSON.parse(localStorage.getItem(OPEN) || '[]')); } catch { /* 처음 */ }
const keepOpen = () => { try { localStorage.setItem(OPEN, JSON.stringify([...opened])); } catch { /* 이번 방문만 */ } };
function wordHtml(e, w, i) {
  return `<div class="word${w.who === '예수' ? ' jesus' : ''}" data-e="${e.id}" data-w="${i}">
        <div class="meta"><div><label>말하는 이</label><input class="f who" value="${esc(w.who)}"></div><div><label>출처</label><input class="f ref" value="${esc(w.ref)}"></div>
          <div><label>목소리</label><select class="f tts"><option value="">Google 음성</option><option value="gemini"${w.tts === 'gemini' ? ' selected' : ''}>Gemini 성우</option></select></div></div>
        <textarea class="text" rows="2">${esc(w.text)}</textarea>
        <div class="act"><button class="ghost play" type="button">▶ 듣기</button><span class="state"></span><button class="ghost undo" hidden>되돌리기</button><button class="btn save" disabled>저장</button></div></div>`;
}
function render() {
  const html = data.periods.map(p => {
    const scenes = data.events.filter(e => e.p === p.id).map(e => ({ e, s: sceneOf(e.id) })).filter(x => x.s);
    if (!scenes.length) return '';
    const words = scenes.reduce((n, x) => n + x.s.c.words.length, 0);
    return `<details class="period" data-key="${p.id}" style="--c:${p.color}"${opened.has(p.id) ? ' open' : ''}>
      <summary><i class="dot"></i><b>${esc(p.name)}</b><span>${esc(p.span || '')} · 장면 ${scenes.length} · 말씀 ${words}</span><em class="mark">고침</em></summary>` +
      scenes.map(({ e, s }) => `<details class="scene" data-key="${e.id}" data-scene="${e.id}"${opened.has(e.id) ? ' open' : ''}>
        <summary><b>${esc(e.title)}</b><span>${e.id} · ${esc(data.places[e.place]?.name || '')} · 말씀 ${s.c.words.length}${s.c.words.some(w => w.tts === 'gemini') ? ' · Gemini' : ''}</span><em class="mark">고침</em></summary>
        ${s.c.words.map((w, i) => wordHtml(e, w, i)).join('')}</details>`).join('') + '</details>';
  }).join('');
  $('#list').innerHTML = html || '<p class="empty">말씀이 없습니다</p>';
  document.querySelectorAll('.word').forEach(bind);
  document.querySelectorAll('#list details').forEach(d => d.addEventListener('toggle', () => {
    if (searching()) return; // 찾는 동안 저절로 펼친 것은 기억하지 않는다
    d.open ? opened.add(d.dataset.key) : opened.delete(d.dataset.key); keepOpen();
  }));
  filter();
}
const searching = () => !!$('#search').value.trim();
function setAll(open) {
  document.querySelectorAll('#list details').forEach(d => { d.open = open; d.hidden = false; });
  opened = open ? new Set([...document.querySelectorAll('#list details')].map(d => d.dataset.key)) : new Set(); keepOpen();
}
$('#openAll').onclick = () => setAll(true);
$('#closeAll').onclick = () => setAll(false);
const fields = box => ({ who: $('.who', box).value.trim(), ref: $('.ref', box).value.trim(), text: $('.text', box).value.trim().replace(/\s*\n\s*/g, ' '), tts: $('.tts', box).value });
const original = box => sceneOf(box.dataset.e).c.words[+box.dataset.w];
function bind(box) {
  const changed = () => { const o = original(box), n = fields(box); return o.who !== n.who || o.ref !== n.ref || o.text !== n.text || (o.tts || '') !== n.tts; };
  const sync = () => { const c = changed(); box.classList.toggle('dirty', c); $('.save', box).disabled = !c || !fields(box).text || !fields(box).who; $('.undo', box).hidden = !c; };
  box.addEventListener('input', sync);
  $('.play', box).onclick = () => play(box);
  $('.undo', box).onclick = () => { const o = original(box); $('.who', box).value = o.who; $('.ref', box).value = o.ref; $('.text', box).value = o.text; $('.tts', box).value = o.tts || ''; sync(); };
  $('.save', box).onclick = () => save(box).catch(err => setState(box, `저장하지 못했습니다: ${err.message}`, 'bad')).finally(sync);
}
// 찾을 때는 맞는 말씀이 있는 시대·장면만 펼쳐 보이고, 지우면 내가 펼쳐 둔 대로 돌아간다
function filter() {
  const q = $('#search').value.trim().toLowerCase();
  document.querySelectorAll('.scene').forEach(sc => {
    const head = !q || $('summary', sc).textContent.toLowerCase().includes(q);
    let any = false;
    sc.querySelectorAll('.word').forEach(b => { const f = fields(b), show = head || `${f.who} ${f.ref} ${f.text}`.toLowerCase().includes(q); b.hidden = !show; any ||= show; });
    sc.hidden = !any;
    sc.open = q ? any : opened.has(sc.dataset.key);
  });
  document.querySelectorAll('.period').forEach(pd => {
    const any = [...pd.querySelectorAll('.scene')].some(sc => !sc.hidden);
    pd.hidden = !any;
    pd.open = q ? any : opened.has(pd.dataset.key);
  });
}
$('#search').oninput = filter;
const setState = (box, text, cls = '') => { const s = $('.state', box); s.className = `state ${cls}`; s.innerHTML = text; };

/* ---------- 저장 ---------- */
// 원본은 사람이 손으로 정리한 JSON이라 통째로 다시 쓰지 않는다: 그 말씀 객체 안의 값만 바꿔 끼우고,
// 바꾼 파일을 다시 읽어 그 말씀 하나만 바뀌었는지 확인한 뒤에 올린다
const valueRe = (key, v) => new RegExp(`"${key}"\\s*:\\s*${JSON.stringify(v).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);
function patch(raw, id, i, from, to) {
  const start = raw.indexOf(`"id": "${id}"`);
  if (start < 0) throw new Error(`${id} 장면을 원본에서 찾지 못했습니다`);
  const next = raw.indexOf('"id": "', start + 1), end = next < 0 ? raw.length : next;
  const block = raw.slice(start, end), m = block.match(valueRe('text', from.text));
  if (!m || block.indexOf(m[0]) !== block.lastIndexOf(m[0])) throw new Error('원본에서 이 말씀을 하나로 찾지 못했습니다');
  const at = start + m.index, open = raw.lastIndexOf('{', at), close = raw.indexOf('}', at);
  let obj = raw.slice(open, close + 1);
  for (const k of ['who', 'ref', 'text']) obj = obj.replace(valueRe(k, from[k]), () => `"${k}": ${JSON.stringify(to[k])}`);
  // 목소리: Gemini 성우면 "tts": "gemini"를 그 말씀 끝에 붙이고, Google 음성(기본)이면 뺀다
  if ((from.tts || '') !== to.tts) obj = from.tts ? obj.replace(/,\s*"tts"\s*:\s*"[^"]*"/, to.tts ? `, "tts": "${to.tts}"` : '') : obj.replace(/\s*}$/, m => `, "tts": "${to.tts}"${m}`);
  const out = raw.slice(0, open) + obj + raw.slice(close + 1);
  const want = JSON.parse(raw), word = { ...from, ...to };
  if (!word.tts) delete word.tts;
  want.find(c => c.id === id).words[i] = word;
  if (JSON.stringify(JSON.parse(out)) !== JSON.stringify(want)) throw new Error('바꾼 원본을 확인하는 데 실패했습니다');
  return out;
}
async function save(box) {
  const id = box.dataset.e, i = +box.dataset.w, to = fields(box);
  setState(box, '저장하는 중…');
  const { path } = sceneOf(id);
  const from = files[path].json.find(c => c.id === id).words[i];
  // 그사이 다른 곳에서 고쳤을 수 있으니 올리기 직전에 최신 원본을 다시 받는다
  const fresh = await readFile(path), now = fresh.json.find(c => c.id === id).words[i];
  if (now.text !== from.text || now.who !== from.who || now.ref !== from.ref || now.tts !== from.tts) throw new Error('그사이 이 말씀이 바뀌었습니다 — 새로 고침 뒤 다시 고쳐 주세요');
  const raw = patch(fresh.raw, id, i, now, to);
  const title = data.events.find(e => e.id === id)?.title || id;
  const res = await gh(`/repos/${REPO}/contents/${path}`, { method: 'PUT', body: JSON.stringify({
    message: `Edit words in ${id} (#${i + 1}) from the admin page\n\n${title}: ${to.text}${to.tts ? ` (voice: ${to.tts})` : ''}`, content: toB64(raw), sha: fresh.sha, branch: BRANCH }) });
  files[path] = { raw, json: JSON.parse(raw), sha: res.content.sha };
  box.classList.toggle('jesus', to.who === '예수');
  follow(box, res.commit.sha);
}
// 저장한 커밋의 배포 작업을 지켜본다 (녹음을 새로 만드느라 몇 분 걸린다)
async function follow(box, sha) {
  const link = `<a href="https://github.com/${REPO}/commit/${sha}" target="_blank" rel="noopener">${sha.slice(0, 7)}</a>`;
  setState(box, `저장됨 ${link} · 음성 만들고 배포하는 중…`);
  for (let n = 0; n < 60; n++) {
    await new Promise(r => setTimeout(r, 10000));
    let run;
    try { run = (await gh(`/repos/${REPO}/actions/runs?head_sha=${sha}&per_page=1`)).workflow_runs?.[0]; } catch { continue; }
    if (!run || run.status !== 'completed') continue;
    // 연달아 저장하면 앞의 배포는 건너뛰고 마지막 배포가 모두 담아 간다
    if (run.conclusion === 'cancelled') { setState(box, `저장됨 ${link} · 다음 저장의 배포에 함께 반영됩니다`, 'ok'); return; }
    const ok = run.conclusion === 'success';
    if (ok) await loadVoices(); // 새 녹음을 바로 들을 수 있게
    setState(box, ok ? `저장됨 ${link} · 음성 교체·배포 완료 ✓` : `저장됨 ${link} · <a href="${run.html_url}" target="_blank" rel="noopener">배포 실패 — 기록 보기</a>`, ok ? 'ok' : 'bad');
    return;
  }
  setState(box, `저장됨 ${link} · 배포 상태를 확인하지 못했습니다 (GitHub Actions에서 확인)`);
}

let saved = null; try { saved = localStorage.getItem(KEY); } catch { /* 없음 */ }
if (saved) enter(saved); else $('#login').hidden = false;

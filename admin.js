/* 그 길 — 관리자: 장면의 말씀(_src/content-*.json의 words)을 고쳐 GitHub main에 바로 올린다.
   올리면 Actions(firebase-hosting-merge.yml)가 data를 다시 만들고 바뀐 장면의 녹음을 새로 만들어 배포한다.
   들어가는 열쇠는 이 저장소에 쓰기 권한이 있는 GitHub 토큰 — 토큰이 없으면 아무도 고칠 수 없다 */
const REPO = 'danmool78/the-way-jesus.web.app', BRANCH = 'main', KEY = 'theway-admin-token';
const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
let token = '', files = {}, data = null; // files: 경로 → { raw, json }
// 구글 로그인(기본): 토큰 대신 Firebase 인증으로 들어가고, GitHub·R2는 관리자 Worker(_src/worker)가 대신 쓴다 —
// 컴퓨터마다 복잡한 토큰을 넣어야 했다(사용자). 토큰으로 들어가는 길은 없앴다
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
const auth = getAuth(initializeApp({ apiKey: 'AIzaSyA5wjIVA5kc8_Zyar6_-8X7kNVPaQn4j1Y', authDomain: 'the-way-jesus.firebaseapp.com', projectId: 'the-way-jesus', appId: '1:618365957327:web:d42bd6b7e94f79390673ba' })); // 공개 설정값
export const WORKER = 'https://theway-admin.danmool78.workers.dev';
let google = false; // 구글로 들어왔으면 true — gh()가 Worker를 거친다
// 시리즈의 여정: 주소의 ?j=<여정> (없으면 예수). 예수 여정의 원본은 _src/, 다른 여정은 _src/journeys/<여정>/
// 배포된 data는 예수가 data.json, 다른 여정이 j/<여정>/data.json. 녹음(음성 교체)은 예수 여정만 — 다른 여정은 기기 음성으로 읽는다
const JOURNEY = (q => /^[a-z]+$/.test(q || '') ? q : 'jesus')(new URLSearchParams(location.search).get('j'));
const SRC = JOURNEY === 'jesus' ? '_src' : `_src/journeys/${JOURNEY}`, DATA_URL = JOURNEY === 'jesus' ? 'data.json' : `j/${JOURNEY}/data.json`;
const VOICED = JOURNEY === 'jesus';

async function gh(path, init = {}) {
  const r = await fetch(google ? `${WORKER}/gh${path}` : `https://api.github.com${path}`, { ...init, cache: 'no-store',
    headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${google ? await auth.currentUser.getIdToken() : token}`, 'X-GitHub-Api-Version': '2022-11-28', ...(init.body ? { 'Content-Type': 'application/json' } : {}) } });
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
  google = t === null; token = google ? '' : t.trim();
  const msg = $('#loginMsg');
  msg.className = 'msg'; msg.textContent = '확인하는 중…';
  try {
    // 토큰의 주인이 적은 아이디와 같은지, 그 계정이 이 저장소에 쓸 수 있는지 GitHub에 묻는다
    const [me, repo] = await Promise.all([gh('/user'), gh(`/repos/${REPO}`)]);
    if (user && me.login.toLowerCase() !== user.trim().toLowerCase()) throw new Error(`이 토큰은 ${me.login} 계정의 것입니다`);
    if (!repo.permissions?.push) throw new Error('이 토큰에는 저장소에 쓸 권한이 없습니다');
    if (!google) try { localStorage.setItem(KEY, token); } catch { /* 이번 방문만 */ }
    // 크롬은 이 줄로 바로 "비밀번호 저장"을 띄운다 (다른 브라우저는 양식 제출로 알아본다)
    if (!google && user && window.PasswordCredential) navigator.credentials.store(new PasswordCredential({ id: me.login, password: token })).catch(() => {});
    await load();
  } catch (err) {
    // 기억한 토큰은 GitHub가 '틀린 토큰'(401)이라고 할 때만 지운다 — 전에는 잠깐의 연결 오류나 요청 한도에도 지워져
    // 들어올 때마다 토큰을 다시 넣어야 했다 (사용자). 그 밖의 오류는 토큰을 남겨 두고 다시 시도하게 한다
    const wasGoogle = google;
    if (google) { google = false; signOut(auth).catch(() => {}); }
    const bad = !wasGoogle && (err.status === 401 || /권한|계정/.test(err.message || ''));
    if (bad) { token = ''; try { localStorage.removeItem(KEY); } catch { /* 없음 */ } }
    else token = '';
    $('#login').hidden = false; $('#editor').hidden = $('#studio').hidden = $('#search').hidden = $('#logout').hidden = true;
    msg.className = 'msg bad'; msg.textContent = wasGoogle && err.status === 403 && /허락/.test(err.message) ? '이 구글 계정은 관리자로 허락되지 않았습니다' : err.status === 401 ? '토큰이 맞지 않습니다' : bad ? err.message : `연결하지 못했습니다 (${err.message}) — 잠시 뒤 새로 고침해 다시 로그인해 주세요`;
  }
}
$('#logout').onclick = async () => { try { localStorage.removeItem(KEY); } catch { /* 없음 */ } await signOut(auth).catch(() => {}); location.reload(); };
$('#gLogin').onclick = async () => {
  const msg = $('#loginMsg'); msg.className = 'msg'; msg.textContent = '구글 로그인 창을 여는 중…';
  try { await signInWithPopup(auth, new GoogleAuthProvider()); } // 들어오면 아래 onAuthStateChanged가 이어 간다
  catch (e) { msg.className = 'msg bad'; msg.textContent = e.code === 'auth/popup-closed-by-user' ? '' : `로그인하지 못했습니다 (${e.code || e.message})`; }
};

/* ---------- 목록 ---------- */
// 여정 고르기: 원본이 만들어진 여정(built)만 — 원본이 없는 여정을 고르면 불러오지 못해 로그인이 풀린다. 맨 끝에 시편 노래 작업실
function fillPick(series) {
  const pick = $('#journeyPick'), names = { jesus: '예수', moses: '모세와 여호수아', david: '다윗', kings: '열왕기', paul: '바울', proverbs: '잠언', goodnews: '복음', psalms: '시편' };
  pick.innerHTML = (series || [{ id: 'jesus' }]).filter(j => j.built !== false && j.id !== 'psalms').map(j => `<option value="${j.id}"${j.id === JOURNEY ? ' selected' : ''}>${esc(names[j.id] || j.id)}${j.ready ? '' : ' (준비 중)'}</option>`).join('')
    + `<option value="psalms"${JOURNEY === 'psalms' ? ' selected' : ''}>시편 노래 작업실</option>`;
  pick.hidden = false;
  pick.onchange = () => { location.search = pick.value === 'jesus' ? '' : `?j=${pick.value}`; };
}
/* ---------- 방문 수 ---------- */
// 대시보드에 안 가도 보게(사용자): 매일 Actions가 stats 가지에 적는 visits.json을 읽어 맨 위에 띄운다. 로봇은 빠진 수(자바스크립트를 실행한 방문만)
async function showVisits() {
  const box = $('#visits');
  let v;
  try { v = JSON.parse(fromB64((await gh(`/repos/${REPO}/contents/visits.json?ref=stats`)).content)); }
  catch (e) { box.innerHTML = `<p class="note" style="margin:0">방문 수: ${e.status === 404 ? '아직 모은 기록이 없습니다 (매일 0시 넘어 모읍니다)' : '불러오지 못했습니다'}</p>`; box.hidden = false; return; }
  const d = v.days || [], n = k => d.slice(-k).reduce((s, x) => s + x.visits, 0), num = x => x.toLocaleString('ko-KR');
  const today = new Date(Date.now() + 9 * 36e5).toISOString().slice(0, 10); // 한국 날짜
  const past = d.filter(x => x.date < today), yday = past.at(-1);
  const max = Math.max(1, ...d.map(x => x.visits));
  const top = (h, rows, f = x => x) => rows?.length ? `<div><h4>${h}</h4>${rows.slice(0, 8).map(([k, vis]) => `<p><span>${esc(f(k))}</span><em>${num(vis)}</em></p>`).join('')}</div>` : '';
  box.innerHTML = `<div class="nums">
      <div><b>${num(yday?.visits || 0)}</b><small>어제 방문${yday ? ` (${yday.date.slice(5).replace('-', '/')})` : ''}</small></div>
      <div><b>${num(n(7))}</b><small>최근 7일</small></div>
      <div><b>${num(n(30))}</b><small>최근 30일 · 페이지 보기 ${num(d.reduce((s, x) => s + x.views, 0))}</small></div>
    </div>
    <div class="bars" title="최근 30일 날마다 방문">${d.map(x => `<i style="height:${Math.max(2, x.visits / max * 100)}%" title="${x.date} · ${num(x.visits)}명"></i>`).join('')}</div>
    <details><summary><span class="note" style="margin:0">많이 본 페이지 · 나라 · 들어온 곳 (30일) — ${new Date(v.updated).toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' })} 기준</span></summary>
      <div class="tops">${top('페이지', v.paths)}${top('나라', v.countries)}${top('들어온 곳', v.referers, k => k === '(없음)' ? '직접·앱' : k)}${top('기기', v.devices)}</div>
    </details>`;
  box.hidden = false;
}
async function load() {
  showVisits().catch(() => {});
  // 시편: 해설·말씀 대신 노래 작업실(studio.js)을 편다 — 노래 목록과 가사는 _src/journeys/psalms/songs.json
  if (JOURNEY === 'psalms') {
    $('#loginMsg').textContent = '노래 목록을 불러오는 중…';
    const [{ mountStudio }, d] = await Promise.all([import('./studio.js'), fetch('data.json', { cache: 'no-store' }).then(r => r.json())]);
    fillPick(d.journey?.series);
    await mountStudio($('#studio'), token, google ? { gh, r2Put: async (key, bytes) => { const r = await fetch(`${WORKER}/r2/${key}`, { method: 'PUT', headers: { Authorization: `Bearer ${await auth.currentUser.getIdToken()}`, 'Content-Type': 'audio/mpeg' }, body: bytes }); if (!r.ok) throw new Error(`R2 ${r.status}`); } } : null);
    $('#login').hidden = true; $('#studio').hidden = $('#logout').hidden = false;
    return;
  }
  $('#loginMsg').textContent = '말씀을 불러오는 중…';
  // 장면 제목·장소는 배포된 data.json에서, 말씀은 GitHub의 최신 원본에서 (방금 고친 것도 바로 보이게)
  const [d, dir] = await Promise.all([fetch(DATA_URL, { cache: 'no-store' }).then(r => r.json()), gh(`/repos/${REPO}/contents/${SRC}?ref=${BRANCH}`)]);
  data = d;
  fillPick(d.journey?.series);
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
const loadVoices = () => !VOICED ? Promise.resolve() : fetch('assets/voice/ko/index.json', { cache: 'no-store' }).then(r => r.ok ? r.json() : {}).then(j => { voiceIndex = j; }).catch(() => {});
// 해설 문단(story)은 말하는 이가 없어 늘 해설 목소리(Aoede)
const clipsOf = w => sentences(w.text).map(t => t.trim()).filter(Boolean)
  .map(t => voiceKey(`${w.tts === 'gemini' ? 'gemini-' : ''}${w.voice === 'child' ? 'Leda' : w.who === '예수' ? 'Algenib' : w.who === '하나님' ? 'Charon' : 'Aoede'}`, t)); // 하나님(프롤로그)은 Charon, 열두 살 소년 예수(voice: 'child')는 Leda
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
  if (!clips.every(k => voiceIndex[k])) { setState(box, VOICED ? '녹음이 아직 없습니다 (앱에서는 브라우저 음성으로 읽힘)' : '이 여정은 녹음 없이 기기 음성으로 읽습니다', 'bad'); return; }
  playing = box; box.classList.add('playing'); $('.play', box).textContent = '■ 멈춤';
  let n = 0;
  const next = () => { if (playing !== box) return; if (n >= clips.length) { stopPlay(); return; } { const k = clips[n++]; player.src = `assets/voice/ko/${k}.mp3?v=${voiceIndex[k]}`; /* 다시 녹음한 파일도 캐시 말고 새것으로 (app.js voiceUrl과 같게) */ } player.play().catch(stopPlay); };
  player.onended = () => setTimeout(next, 500); player.onerror = stopPlay;
  next();
}

// 시대 → 장면 → 해설·말씀, 시대와 장면은 접었다 폈다 (펼친 자리는 이 브라우저에 기억해 둔다)
const OPEN = 'theway-admin-open';
let opened = new Set(); try { opened = new Set(JSON.parse(localStorage.getItem(OPEN) || '[]')); } catch { /* 처음 */ }
const keepOpen = () => { try { localStorage.setItem(OPEN, JSON.stringify([...opened])); } catch { /* 이번 방문만 */ } };
const ttsSelect = tts => `<div><label>목소리</label><select class="f tts"><option value="">Google 음성</option><option value="gemini"${tts === 'gemini' ? ' selected' : ''}>Gemini 성우</option></select></div>`;
// 말씀(본문)은 낭독하지 않으므로(2026-11) 듣기·목소리 고르기는 해설 문단에만
const actHtml = (listen = true) => `<div class="act">${listen ? '<button class="ghost play" type="button">▶ 듣기</button>' : ''}<span class="state"></span><button class="ghost undo" hidden>되돌리기</button><button class="btn save" disabled>저장</button></div>`;
// 해설 문단: 글과 목소리만 (data-kind="story", data-w는 문단 번호)
function storyHtml(e, c, i) {
  return `<div class="word story" data-kind="story" data-e="${e.id}" data-w="${i}">
        <div class="meta"><b class="ptitle">해설 ${i + 1}</b>${ttsSelect((c.storyTts || []).includes(i) ? 'gemini' : '')}</div>
        <textarea class="text" rows="4">${esc(c.story[i])}</textarea>${actHtml()}</div>`;
}
function wordHtml(e, w, i) {
  return `<div class="word${w.who === '예수' ? ' jesus' : ''}" data-e="${e.id}" data-w="${i}">
        <div class="meta"><div><label>말하는 이</label><input class="f who" value="${esc(w.who)}"></div><div><label>출처</label><input class="f ref" value="${esc(w.ref)}"></div></div>
        <textarea class="text" rows="2">${esc(w.text)}</textarea>${actHtml(false)}</div>`;
}
function render() {
  // 맨 앞에 프롤로그(data.prologue, 61개 장면 목록 밖)를 한 묶음으로 — 시대와 같은 모양
  const groups = [...(data.prologue ? [{ id: 'p0', name: '프롤로그', span: '창세기', color: '#b89a5e', evs: [data.prologue] }] : []),
    ...data.periods.map(p => ({ ...p, evs: data.events.filter(e => e.p === p.id) }))];
  const html = groups.map(p => {
    const scenes = p.evs.map(e => ({ e, s: sceneOf(e.id) })).filter(x => x.s);
    if (!scenes.length) return '';
    const words = scenes.reduce((n, x) => n + x.s.c.words.length, 0);
    return `<details class="period" data-key="${p.id}" style="--c:${p.color}"${opened.has(p.id) ? ' open' : ''}>
      <summary><i class="dot"></i><b>${esc(p.name)}</b><span>${esc(p.span || '')} · 장면 ${scenes.length} · 말씀 ${words}</span><em class="mark">고침</em></summary>` +
      scenes.map(({ e, s }) => `<details class="scene" data-key="${e.id}" data-scene="${e.id}"${opened.has(e.id) ? ' open' : ''}>
        <summary><b>${esc(e.title)}</b><span>${e.id} · ${esc(data.places[e.place]?.name || '')} · 해설 ${s.c.story.length} · 말씀 ${s.c.words.length}${s.c.words.some(w => w.tts === 'gemini') || s.c.storyTts?.length ? ' · Gemini' : ''}</span><em class="mark">고침</em></summary>
        <h3 class="part">해설</h3>${s.c.story.map((t, i) => storyHtml(e, s.c, i)).join('')}
        <h3 class="part">말씀</h3>${s.c.words.map((w, i) => wordHtml(e, w, i)).join('')}</details>`).join('') + '</details>';
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
const isStory = box => box.dataset.kind === 'story';
const fields = box => ({ ...(isStory(box) ? {} : { who: $('.who', box).value.trim(), ref: $('.ref', box).value.trim() }),
  text: $('.text', box).value.trim().replace(/\s*\n\s*/g, ' '), tts: $('.tts', box) ? $('.tts', box).value : (original(box).tts || '') }); // 말씀은 목소리 칸이 없다 — 있던 값을 그대로
// 해설 문단도 말씀과 같은 모양으로 ({text, tts})
const storyOf = (c, i) => ({ text: c.story[i], ...((c.storyTts || []).includes(i) ? { tts: 'gemini' } : {}) });
const original = box => { const c = sceneOf(box.dataset.e).c, i = +box.dataset.w; return isStory(box) ? storyOf(c, i) : c.words[i]; };
const same = (o, n) => Object.keys(n).every(k => (o[k] || '') === n[k]);
function bind(box) {
  const changed = () => !same(original(box), fields(box));
  const sync = () => { const c = changed(), f = fields(box); box.classList.toggle('dirty', c); $('.save', box).disabled = !c || !f.text || f.who === ''; $('.undo', box).hidden = !c; };
  box.addEventListener('input', sync);
  if ($('.play', box)) $('.play', box).onclick = () => play(box);
  $('.undo', box).onclick = () => { const o = original(box); for (const k of ['who', 'ref', 'text', 'tts']) { const el = $(`.${k}`, box); if (el) el.value = o[k] || ''; } sync(); };
  $('.save', box).onclick = () => save(box).catch(err => setState(box, `저장하지 못했습니다: ${err.message}`, 'bad')).finally(sync);
}
// 찾을 때는 맞는 말씀이 있는 시대·장면만 펼쳐 보이고, 지우면 내가 펼쳐 둔 대로 돌아간다
function filter() {
  const q = $('#search').value.trim().toLowerCase();
  document.querySelectorAll('.scene').forEach(sc => {
    const head = !q || $('summary', sc).textContent.toLowerCase().includes(q);
    let any = false;
    sc.querySelectorAll('.word').forEach(b => { const f = fields(b), show = head || `${f.who || ''} ${f.ref || ''} ${f.text}`.toLowerCase().includes(q); b.hidden = !show; any ||= show; });
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
// 해설 문단: 그 장면 안에서 그 문장(JSON 문자열)을 바꿔 끼우고, Gemini로 고른 문단 번호는 장면의 "storyTts": [..]에 둔다
// ("id" 바로 뒤에 붙이고, 비면 뺀다)
function patchStory(raw, id, i, from, to) {
  const start = raw.indexOf(`"id": "${id}"`);
  if (start < 0) throw new Error(`${id} 장면을 원본에서 찾지 못했습니다`);
  const next = raw.indexOf('"id": "', start + 1), end = next < 0 ? raw.length : next;
  let block = raw.slice(start, end);
  const old = JSON.stringify(from.text);
  if (block.indexOf(old) < 0 || block.indexOf(old) !== block.lastIndexOf(old)) throw new Error('원본에서 이 해설을 하나로 찾지 못했습니다');
  block = block.replace(old, () => JSON.stringify(to.text));
  const want = JSON.parse(raw), scene = want.find(c => c.id === id);
  scene.story[i] = to.text;
  if ((from.tts || '') !== to.tts) {
    const list = new Set(scene.storyTts || []); to.tts ? list.add(i) : list.delete(i);
    const keep = [...list].sort((a, b) => a - b), entry = keep.length ? `, "storyTts": ${JSON.stringify(keep)}` : '';
    block = /"storyTts"/.test(block) ? block.replace(/,\s*"storyTts"\s*:\s*\[[^\]]*\]/, entry) : block.replace(`"id": "${id}"`, m => m + entry);
    if (keep.length) scene.storyTts = keep; else delete scene.storyTts;
  }
  const out = raw.slice(0, start) + block + raw.slice(end);
  // 열쇠 순서는 그대로 두고 값만 견준다 (storyTts가 "id" 바로 뒤에 들어가므로)
  const norm = x => JSON.stringify(x.map(c => Object.fromEntries(Object.entries(c).sort(([a], [b]) => a < b ? -1 : 1))));
  if (norm(JSON.parse(out)) !== norm(want)) throw new Error('바꾼 원본을 확인하는 데 실패했습니다');
  return out;
}
async function save(box) {
  const id = box.dataset.e, i = +box.dataset.w, to = fields(box), story = isStory(box);
  const pick = c => story ? storyOf(c, i) : c.words[i];
  setState(box, '저장하는 중…');
  const { path } = sceneOf(id);
  const from = pick(files[path].json.find(c => c.id === id));
  // 그사이 다른 곳에서 고쳤을 수 있으니 올리기 직전에 최신 원본을 다시 받는다
  const fresh = await readFile(path), now = pick(fresh.json.find(c => c.id === id));
  if (JSON.stringify(now) !== JSON.stringify(from)) throw new Error('그사이 이 글이 바뀌었습니다 — 새로 고침 뒤 다시 고쳐 주세요');
  const raw = story ? patchStory(fresh.raw, id, i, now, to) : patch(fresh.raw, id, i, now, to);
  const title = (data.prologue?.id === id ? data.prologue : data.events.find(e => e.id === id))?.title || id;
  const res = await gh(`/repos/${REPO}/contents/${path}`, { method: 'PUT', body: JSON.stringify({
    message: `Edit ${story ? 'narration' : 'words'} in ${JOURNEY === 'jesus' ? '' : JOURNEY + '/'}${id} (#${i + 1}) from the admin page\n\n${title}: ${to.text}${to.tts ? ` (voice: ${to.tts})` : ''}`, content: toB64(raw), sha: fresh.sha, branch: BRANCH }) });
  files[path] = { raw, json: JSON.parse(raw), sha: res.content.sha };
  box.classList.toggle('jesus', to.who === '예수');
  follow(box, res.commit.sha);
}
// 저장한 커밋의 배포 작업을 지켜본다 (녹음을 새로 만드느라 몇 분 걸린다)
async function follow(box, sha) {
  const link = `<a href="https://github.com/${REPO}/commit/${sha}" target="_blank" rel="noopener">${sha.slice(0, 7)}</a>`;
  setState(box, `저장됨 ${link} · ${VOICED ? '음성 만들고 ' : ''}배포하는 중…`);
  for (let n = 0; n < 60; n++) {
    await new Promise(r => setTimeout(r, 10000));
    let run;
    try { run = (await gh(`/repos/${REPO}/actions/runs?head_sha=${sha}&per_page=1`)).workflow_runs?.[0]; } catch { continue; }
    if (!run || run.status !== 'completed') continue;
    // 연달아 저장하면 앞의 배포는 건너뛰고 마지막 배포가 모두 담아 간다
    if (run.conclusion === 'cancelled') { setState(box, `저장됨 ${link} · 다음 저장의 배포에 함께 반영됩니다`, 'ok'); return; }
    const ok = run.conclusion === 'success';
    if (ok) await loadVoices(); // 새 녹음을 바로 들을 수 있게
    setState(box, ok ? `저장됨 ${link} · ${VOICED ? '음성 교체·' : ''}배포 완료 ✓` : `저장됨 ${link} · <a href="${run.html_url}" target="_blank" rel="noopener">배포 실패 — 기록 보기</a>`, ok ? 'ok' : 'bad');
    return;
  }
  setState(box, `저장됨 ${link} · 배포 상태를 확인하지 못했습니다 (GitHub Actions에서 확인)`);
}

// 토큰으로 들어가던 예전 방식은 없앴다(사용자) — 남아 있던 토큰은 지운다
try { localStorage.removeItem(KEY); } catch { /* 없음 */ }
// 구글로 로그인해 둔 상태면 그대로 들어가고, 아니면 로그인 화면
let first = true;
onAuthStateChanged(auth, u => {
  if (u) { enter(null); return; }
  if (!first) return; first = false;
  $('#login').hidden = false;
});

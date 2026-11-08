/* 그 길 — 시편 노래 작업실: 노래마다 Suno에 넣을 스타일·가사를 복사하고, 만든 mp3를 올리거나 바꾸고, 가사 시간을 맞춘다.
   원본은 _src/journeys/psalms/songs.json, 노래는 assets/psalms/<id>.mp3, 가사 시간은 assets/psalms/<id>.json
   ({ audio: 노래 파일의 git blob sha, by: 'auto'|'tap', lines: [{ t: 초, text }] }).
   mp3를 main에 올리면 배포 작업(firebase-hosting-merge.yml)이 _src/tools/lyricsync.mjs로 가사 시간을 자동으로 맞춘다 */
const REPO = 'danmool78/the-way-jesus.web.app', BRANCH = 'main', KEY = 'theway-admin-token';
const SRC = '_src/journeys/psalms/songs.json', DIR = 'assets/psalms';
const RAW = p => `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${p}`;
const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
let token = '', songs = [], groups = {}, dir = {};

async function gh(path, init = {}) {
  const r = await fetch(`https://api.github.com${path}`, { ...init, cache: 'no-store',
    headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28', ...(init.body ? { 'Content-Type': 'application/json' } : {}) } });
  const j = r.status === 204 ? null : await r.json().catch(() => null);
  if (!r.ok) throw Object.assign(new Error(j?.message || `GitHub ${r.status}`), { status: r.status });
  return j;
}
const fromB64 = b => new TextDecoder().decode(Uint8Array.from(atob(b.replace(/\n/g, '')), c => c.charCodeAt(0)));
const toB64 = s => bytesB64(new TextEncoder().encode(s));
function bytesB64(u8) { let bin = ''; for (let i = 0; i < u8.length; i += 0x8000) bin += String.fromCharCode(...u8.subarray(i, i + 0x8000)); return btoa(bin); }

// 가사에서 부르는 줄만: [Verse] 같은 표시와 빈 줄은 뺀다 (lyricsync.mjs·app.js와 같은 규칙)
export const sungLines = lyrics => (lyrics || '').split('\n').map(s => s.trim()).filter(s => s && !/^\[.*\]$/.test(s));

/* ---------- 들어가기 ---------- */
async function enter(t) {
  token = t.trim();
  const msg = $('#loginMsg'); msg.className = 'msg'; msg.textContent = '확인하는 중…';
  try {
    const repo = await gh(`/repos/${REPO}`);
    if (!repo.permissions?.push) throw new Error('이 토큰에는 저장소에 쓸 권한이 없습니다');
    try { localStorage.setItem(KEY, token); } catch { /* 이번 방문만 */ }
    await load();
    $('#login').hidden = true; $('#work').hidden = $('#logout').hidden = false;
  } catch (err) {
    token = ''; try { localStorage.removeItem(KEY); } catch { /* 없음 */ }
    $('#login').hidden = false; msg.className = 'msg bad'; msg.textContent = err.status === 401 ? '토큰이 맞지 않습니다' : err.message;
  }
}
$('#loginForm').onsubmit = e => { e.preventDefault(); enter($('#token').value); };
$('#logout').onclick = () => { try { localStorage.removeItem(KEY); } catch { /* 없음 */ } location.reload(); };

/* ---------- 목록 ---------- */
async function readDir() {
  try { dir = Object.fromEntries((await gh(`/repos/${REPO}/contents/${DIR}?ref=${BRANCH}`)).map(f => [f.name, f])); }
  catch (e) { if (e.status === 404) dir = {}; else throw e; }
}
async function syncOf(id) {
  const f = dir[`${id}.json`]; if (!f) return null;
  try { return await fetch(`${RAW(`${DIR}/${id}.json`)}?v=${f.sha}`, { cache: 'no-store' }).then(r => r.json()); } catch { return null; }
}
async function load() {
  const [src] = await Promise.all([gh(`/repos/${REPO}/contents/${SRC}?ref=${BRANCH}`), readDir()]);
  const j = JSON.parse(fromB64(src.content));
  songs = j.songs; groups = j.groups || {};
  render();
}
function summary() {
  const n = k => songs.filter(k).length;
  $('#sum').innerHTML = `<span>모두 <b>${songs.length}</b>편</span><span>가사 준비 <b>${n(s => s.lyrics)}</b></span><span>노래 올림 <b>${n(s => dir[`${s.id}.mp3`])}</b></span><span>시간 맞춤 <b>${n(s => dir[`${s.id}.json`])}</b></span>`;
}
function render() {
  summary();
  const list = $('#list'); list.innerHTML = '';
  let g = null;
  for (const s of songs) {
    if (s.group !== g) { g = s.group; list.insertAdjacentHTML('beforeend', `<h2 class="group">${esc(g)}. ${esc(groups[g] || '')}</h2>`); }
    const el = document.createElement('details'); el.className = 'song'; el.dataset.id = s.id;
    el.innerHTML = `<summary><span class="no">${s.psalm}편</span><b>${esc(s.title)}</b><span class="set">${esc(s.setting)}</span><span class="tags">
      <span class="tag${s.lyrics ? ' ok' : ''}">가사</span><span class="tag${dir[`${s.id}.mp3`] ? ' ok' : ''}">노래</span><span class="tag${dir[`${s.id}.json`] ? ' ok' : ''}">시간</span></span></summary>
      <div class="body"></div>`;
    el.addEventListener('toggle', () => { if (el.open && !el.dataset.ready) { el.dataset.ready = 1; fill(el, s); } });
    list.append(el);
  }
}
async function copy(btn, text) {
  try { await navigator.clipboard.writeText(text); btn.textContent = '복사됨 ✓'; setTimeout(() => { btn.textContent = btn.dataset.label; }, 1500); }
  catch { btn.textContent = '복사 실패'; }
}

/* ---------- 노래 하나 ---------- */
async function fill(el, s) {
  const body = $('.body', el), mp3 = dir[`${s.id}.mp3`];
  body.innerHTML = `${s.intro ? `<p class="intro">${esc(s.intro)}</p>` : ''}
    ${s.lyrics ? `<div class="box"><h3>Suno 스타일<span class="grow"></span><button class="ghost" data-label="스타일 복사" data-c="style">스타일 복사</button></h3><pre class="style">${esc(s.style)}</pre></div>
    <div class="box"><h3>가사<span class="grow"></span><button class="ghost" data-label="가사 복사" data-c="lyrics">가사 복사</button></h3><pre>${esc(s.lyrics)}</pre></div>`
    : '<p class="note">아직 가사를 쓰지 않은 노래입니다.</p>'}
    <div class="box"><h3>노래 파일<span class="grow"></span><label class="btn" style="cursor:pointer">${mp3 ? 'mp3 바꾸기' : 'mp3 올리기'}<input type="file" accept="audio/mpeg,.mp3" hidden></label></h3>
      <div class="state up">${mp3 ? `올린 파일: ${(mp3.size / 1048576).toFixed(1)}MB` : '아직 올리지 않았습니다'}</div>
      ${mp3 ? `<audio controls preload="none" src="${RAW(`${DIR}/${s.id}.mp3`)}?v=${mp3.sha}"></audio>` : ''}</div>
    <div class="box sync" hidden></div>`;
  body.querySelectorAll('[data-c]').forEach(b => { b.onclick = () => copy(b, s[b.dataset.c]); });
  $('input[type=file]', body).onchange = e => upload(el, s, e.target.files[0]);
  if (mp3 && s.lyrics) showSync(el, s, await syncOf(s.id));
}

async function upload(el, s, file) {
  if (!file) return;
  const st = $('.state.up', el);
  if (file.size > 40 * 1048576) { st.className = 'state up bad'; st.textContent = '파일이 너무 큽니다 (40MB까지)'; return; }
  st.className = 'state up'; st.textContent = '올리는 중…';
  try {
    const content = bytesB64(new Uint8Array(await file.arrayBuffer()));
    await readDir(); // 그사이 다른 곳에서 바꿨을 수 있으니 최신 sha로
    const old = dir[`${s.id}.mp3`];
    const res = await gh(`/repos/${REPO}/contents/${DIR}/${s.id}.mp3`, { method: 'PUT', body: JSON.stringify({
      message: `Psalms: ${old ? 'replace' : 'add'} song for Psalm ${s.psalm} (${s.id}) from the studio`, content, branch: BRANCH, ...(old ? { sha: old.sha } : {}) }) });
    dir[`${s.id}.mp3`] = res.content;
    st.innerHTML = `올림 ✓ <a href="https://github.com/${REPO}/commit/${res.commit.sha}" target="_blank" rel="noopener">${res.commit.sha.slice(0, 7)}</a> · 배포하며 가사 시간을 맞추는 중…`;
    summary();
    el.dataset.ready = ''; await waitSync(el, s, res.content.sha);
  } catch (err) { st.className = 'state up bad'; st.textContent = `올리지 못했습니다: ${err.message}`; }
}
// 배포 작업이 이 노래 파일(sha)에 맞춘 가사 시간을 올릴 때까지 기다린다
async function waitSync(el, s, sha) {
  for (let n = 0; n < 60; n++) {
    await new Promise(r => setTimeout(r, 15000));
    await readDir().catch(() => {});
    const j = await syncOf(s.id);
    if (j?.audio === sha) { summary(); el.dataset.ready = 1; return fill(el, s); }
  }
  $('.state.up', el).textContent += ' (시간이 오래 걸립니다 — GitHub Actions를 확인하세요)';
}

/* ---------- 가사 시간 ---------- */
const fmt = t => t == null ? '—' : `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, '0')}`;
function showSync(el, s, j) {
  const box = $('.sync', el), audio = $('audio', el), mp3 = dir[`${s.id}.mp3`];
  const want = sungLines(s.lyrics);
  // 맞춘 시간이 지금 노래 파일·지금 가사와 맞을 때만 쓴다 (노래를 바꾸거나 가사를 고치면 다시 맞춰야)
  const fresh = j && j.audio === mp3.sha && j.lines?.length === want.length;
  let times = fresh ? j.lines.map(l => l.t) : want.map(() => null);
  box.hidden = false;
  box.innerHTML = `<h3>가사 시간<span class="grow"></span><span class="state ${fresh ? 'ok' : 'bad'}">${fresh ? (j.by === 'tap' ? '탭으로 맞춤' : '자동으로 맞춤') : j ? '노래나 가사가 바뀌어 다시 맞춰야 합니다' : '아직 맞추지 않음'}</span>
    <button class="ghost tap">탭으로 맞추기</button></h3>
    <div class="tapbar"><button class="ghost undo">한 줄 되돌리기</button><button class="btn hit">지금 이 줄 시작 (Space)</button><button class="ghost save" disabled>저장</button></div>
    <p class="state tapmsg"></p>
    <ol class="lines">${want.map((t, i) => `<li data-i="${i}"><i>${fmt(times[i])}</i><span>${esc(t)}</span></li>`).join('')}</ol>`;
  const lis = [...box.querySelectorAll('li')];
  const paint = () => lis.forEach((li, i) => { $('i', li).textContent = fmt(times[i]); });
  // 재생 중인 줄을 밝힌다. 줄을 누르면 그 자리부터
  audio.ontimeupdate = () => { const t = audio.currentTime; let k = -1; times.forEach((x, i) => { if (x != null && x <= t) k = i; }); lis.forEach((li, i) => li.classList.toggle('now', i === k)); };
  lis.forEach((li, i) => { li.onclick = () => { if (times[i] != null && !tapping) { audio.currentTime = Math.max(0, times[i] - 0.3); audio.play(); } }; });
  // 탭으로 맞추기: 처음부터 틀고, 줄이 시작될 때마다 단추(또는 스페이스)를 누른다
  let tapping = false, next = 0;
  const hit = () => { if (!tapping || next >= want.length) return; times[next] = +audio.currentTime.toFixed(2); lis[next].classList.add('tapped'); next++; paint();
    $('.tapmsg', box).textContent = next < want.length ? `다음 줄: ${want[next]}` : '마지막 줄까지 맞췄습니다 — 저장을 누르세요'; $('.save', box).disabled = next < want.length; };
  $('.tap', box).onclick = () => {
    tapping = !tapping; el.classList.toggle('tapping', tapping); $('.tap', box).classList.toggle('on', tapping);
    if (tapping) { times = want.map(() => null); next = 0; lis.forEach(li => li.classList.remove('tapped')); paint(); audio.currentTime = 0; audio.play(); $('.tapmsg', box).textContent = `첫 줄: ${want[0]}`; }
    else { audio.pause(); $('.tapmsg', box).textContent = ''; }
  };
  $('.hit', box).onclick = hit;
  $('.undo', box).onclick = () => { if (next > 0) { next--; times[next] = null; lis[next].classList.remove('tapped'); paint(); audio.currentTime = Math.max(0, (times[next - 1] ?? 0)); $('.save', box).disabled = true; $('.tapmsg', box).textContent = `다음 줄: ${want[next]}`; } };
  el.onkeydown = e => { if (tapping && e.code === 'Space') { e.preventDefault(); hit(); } };
  el.tabIndex = -1;
  $('.save', box).onclick = async () => {
    const b = $('.save', box); b.disabled = true; $('.tapmsg', box).textContent = '저장하는 중…';
    try {
      const path = `${DIR}/${s.id}.json`, old = dir[`${s.id}.json`];
      const out = { audio: mp3.sha, by: 'tap', lines: want.map((text, i) => ({ t: times[i], text })) };
      const res = await gh(`/repos/${REPO}/contents/${path}`, { method: 'PUT', body: JSON.stringify({
        message: `Psalms: tap-synced lyrics for Psalm ${s.psalm} (${s.id})`, content: toB64(JSON.stringify(out, null, 1) + '\n'), branch: BRANCH, ...(old ? { sha: old.sha } : {}) }) });
      dir[`${s.id}.json`] = res.content; tapping = false; el.classList.remove('tapping');
      $('.tapmsg', box).className = 'state tapmsg ok'; $('.tapmsg', box).textContent = '저장했습니다 ✓ (배포가 끝나면 앱에 반영)'; summary();
    } catch (err) { b.disabled = false; $('.tapmsg', box).className = 'state tapmsg bad'; $('.tapmsg', box).textContent = `저장하지 못했습니다: ${err.message}`; }
  };
}

let saved = null; try { saved = localStorage.getItem(KEY); } catch { /* 없음 */ }
if (saved) enter(saved); else $('#login').hidden = false;

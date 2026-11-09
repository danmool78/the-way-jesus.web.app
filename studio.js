/* 그 길 — 시편 노래 작업실: 노래마다 Suno에 넣을 스타일·가사를 복사하고, 만든 mp3를 올리거나 바꾸고, 가사 시간을 맞춘다.
   원본은 _src/journeys/psalms/songs.json. 노래는 Cloudflare R2(버킷 theway, 공개 주소로 스트리밍)의 psalms/<id>-<내용 해시>.mp3 —
   올릴 때마다 주소가 달라 바꾼 노래가 캐시에 걸리지 않는다. 어느 파일이 지금 노래인지와 가사 시간은 저장소의 assets/psalms/<id>.json
   ({ src: 노래 주소, audio: 내용 해시, by: 'pending'|'auto'|'tap', lines: [{ t: 초, text }] }).
   노래를 올리면 이 json을 by: 'pending'으로 main에 올리고, 배포 작업(firebase-hosting-merge.yml)이 _src/tools/lyricsync.mjs로 가사 시간을 맞춘다.
   R2 열쇠는 이 버킷에만 쓸 수 있는 토큰으로, GitHub 토큰처럼 이 기기에만 기억한다.
   관리자 페이지(admin.html?j=psalms, 위쪽 고르기의 '시편 노래 작업실')가 들어간 토큰으로 mountStudio를 부른다 */
const REPO = 'danmool78/the-way-jesus.web.app', BRANCH = 'main', R2KEY = 'theway-r2';
const SRC = '_src/journeys/psalms/songs.json', DIR = 'assets/psalms';
import { R2, r2Sign, sha256 } from './studio-r2.js';
const RAW = p => `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${p}`;
const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
let token = '', songs = [], groups = {}, dir = {}, r2 = null;

async function gh(path, init = {}) {
  const r = await fetch(`https://api.github.com${path}`, { ...init, cache: 'no-store',
    headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28', ...(init.body ? { 'Content-Type': 'application/json' } : {}) } });
  const j = r.status === 204 ? null : await r.json().catch(() => null);
  if (!r.ok) throw Object.assign(new Error(j?.message || `GitHub ${r.status}`), { status: r.status });
  return j;
}
const fromB64 = b => new TextDecoder().decode(Uint8Array.from(atob(b.replace(/\n/g, '')), c => c.charCodeAt(0)));
const toB64 = s => { const u8 = new TextEncoder().encode(s); let bin = ''; for (let i = 0; i < u8.length; i += 0x8000) bin += String.fromCharCode(...u8.subarray(i, i + 0x8000)); return btoa(bin); };

// 가사에서 부르는 줄만: [Verse] 같은 표시와 빈 줄은 뺀다 (lyricsync.mjs·app.js와 같은 규칙)
export const sungLines = lyrics => (lyrics || '').split('\n').map(s => s.trim()).filter(s => s && !/^\[.*\]$/.test(s));

async function r2Put(key, bytes, hash) {
  const { url, headers } = await r2Sign(r2, 'PUT', key, hash, 'audio/mpeg');
  const r = await fetch(url, { method: 'PUT', headers, body: bytes });
  if (!r.ok) throw new Error(`R2 ${r.status}${r.status === 403 ? ' — R2 열쇠를 확인해 주세요' : ''}`);
}

// R2 열쇠 (노래를 올릴 때만 필요)
function showR2() { $('#r2State').textContent = r2 ? `R2 열쇠: ${r2.keyId.slice(0, 6)}… 기억함` : 'R2 열쇠가 없습니다 — 노래를 올리려면 넣어 주세요'; $('#r2Form').hidden = !!r2; $('#r2Forget').hidden = !r2; }
function bindR2() {
$('#r2Form').onsubmit = e => { e.preventDefault(); const keyId = $('#r2Id').value.trim(), secret = $('#r2Secret').value.trim(); if (!keyId || !secret) return;
  r2 = { keyId, secret }; try { localStorage.setItem(R2KEY, JSON.stringify(r2)); } catch { /* 이번 방문만 */ } showR2(); };
$('#r2Forget').onclick = () => { r2 = null; try { localStorage.removeItem(R2KEY); } catch { /* 없음 */ } showR2(); };

}

/* ---------- 관리자 페이지(admin.html?j=psalms) 안에 작업실을 편다 — 같은 GitHub 토큰으로 ---------- */
const CSS = `
.st h2.group{font:700 17px var(--serif);color:var(--gold2);margin:26px 0 8px}
.st .sum{display:flex;gap:14px;flex-wrap:wrap;color:var(--muted);font-size:13px;margin:0 0 12px}.st .sum b{color:var(--gold2)}
.st .card.r2{padding:12px 14px;margin:0 0 12px}.st .card.r2 input{max-width:260px}
.st .r2row{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
.st details.song{background:var(--panel);border:1px solid var(--line);border-radius:14px;margin:8px 0;padding:0 14px}
.st details.song>summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:10px;padding:12px 0;flex-wrap:wrap}
.st details.song>summary::before{content:none}
.st summary .no{font:700 13px var(--sans);color:#1b140c;background:var(--gold);border-radius:7px;padding:1px 7px}
.st summary b{font:700 16px var(--serif)}
.st summary .set{color:var(--faint);font-size:13px;flex:1;min-width:200px}
.st .tags{display:flex;gap:5px}.st .tag{font-size:11px;border-radius:6px;padding:1px 7px;border:1px solid var(--line);color:var(--faint)}.st .tag.ok{border-color:var(--ok);color:var(--ok)}
.st .body{padding:0 0 16px}.st .intro{font:15px/1.8 var(--serif);color:var(--muted);margin:2px 0 12px}
.st .box{background:var(--panel2);border:1px solid var(--line);border-radius:12px;padding:10px 12px;margin:10px 0}
.st .box h3{display:flex;align-items:center;gap:8px;margin:0 0 6px;font:600 13px var(--sans);color:var(--faint)}.st .box h3 .grow{flex:1}
.st .box pre{margin:0;white-space:pre-wrap;font:14px/1.7 var(--sans);color:var(--ink);max-height:22em;overflow:auto}.st .box pre.style{font-size:13px;color:var(--muted)}
.st .state{font-size:13px;color:var(--muted)}.st .state.ok{color:var(--ok)}.st .state.bad{color:var(--bad)}
.st audio{width:100%;margin:6px 0}
.st ol.lines{list-style:none;margin:6px 0 0;padding:0;max-height:24em;overflow:auto}
.st ol.lines li{display:flex;gap:10px;padding:3px 6px;border-radius:8px;font-size:14px;cursor:pointer}
.st ol.lines li i{font:12px ui-monospace,monospace;color:var(--faint);min-width:4.2em;padding-top:2px;font-style:normal}
.st ol.lines li.now{background:rgba(217,180,106,.18);color:var(--gold2)}.st ol.lines li.tapped i{color:var(--ok)}
.st .tapbar{display:none;margin:8px 0;gap:8px;align-items:center}.st .tapping .tapbar{display:flex}.st .tapbar .btn{flex:1;padding:14px}
.st .ghost.on{border-color:var(--gold);color:var(--gold2)}`;
export async function mountStudio(root, tok) {
  token = tok;
  if (!document.getElementById('studioCss')) document.head.insertAdjacentHTML('beforeend', `<style id="studioCss">${CSS}</style>`);
  root.classList.add('st');
  root.innerHTML = `<p class="note">시편 노래 작업실 — ① 스타일과 가사를 복사해 Suno에서 노래를 만든다 → ② 고른 mp3를 올린다(다시 올리면 교체) → ③ 몇 분 뒤 가사 시간이 자동으로 맞춰진다 → ④ 어긋나면 '탭으로 맞추기'로 고친다. 노래는 Cloudflare R2(theway 버킷 psalms/)에서 스트리밍한다.</p>
    <div class="card r2"><b>R2 열쇠</b> <span id="r2State" class="state"></span> <button id="r2Forget" class="ghost" hidden>잊기</button>
      <form id="r2Form" class="r2row" hidden><input id="r2Id" class="f" type="text" placeholder="Access Key ID" autocomplete="off" spellcheck="false"><input id="r2Secret" class="f" type="password" placeholder="Secret Access Key" autocomplete="off"><button class="btn" type="submit">기억하기</button></form>
      <p class="note" style="margin:6px 0 0">Cloudflare R2 → API 토큰(버킷 theway, 개체 읽기·쓰기)의 두 값. 노래를 올릴 때만 필요하고, 이 기기에만 기억합니다.</p></div>
    <div class="sum" id="stSum"></div><div id="stList"></div>`;
  try { r2 = JSON.parse(localStorage.getItem(R2KEY) || 'null'); } catch { r2 = null; }
  bindR2();
  await load();
}

/* ---------- 목록 ---------- */
async function readDir() {
  try { dir = Object.fromEntries((await gh(`/repos/${REPO}/contents/${DIR}?ref=${BRANCH}`)).map(f => [f.name, f])); }
  catch (e) { if (e.status === 404) dir = {}; else throw e; }
}
async function infoOf(id) {
  const f = dir[`${id}.json`]; if (!f) return null;
  try { return await fetch(`${RAW(`${DIR}/${id}.json`)}?v=${f.sha}`, { cache: 'no-store' }).then(r => r.json()); } catch { return null; }
}
async function load() {
  const [src] = await Promise.all([gh(`/repos/${REPO}/contents/${SRC}?ref=${BRANCH}`), readDir()]);
  const j = JSON.parse(fromB64(src.content));
  songs = j.songs; groups = j.groups || {};
  showR2(); render();
}
function summary() {
  const n = k => songs.filter(k).length;
  $('#stSum').innerHTML = `<span>모두 <b>${songs.length}</b>편</span><span>가사 준비 <b>${n(s => s.lyrics)}</b></span><span>노래 올림 <b>${n(s => dir[`${s.id}.json`])}</b></span>`;
}
function render() {
  summary();
  const list = $('#stList'); list.innerHTML = '';
  let g = null;
  for (const s of songs) {
    if (s.group !== g) { g = s.group; list.insertAdjacentHTML('beforeend', `<h2 class="group">${esc(g)}. ${esc(groups[g] || '')}</h2>`); }
    const el = document.createElement('details'); el.className = 'song'; el.dataset.id = s.id;
    el.innerHTML = `<summary><span class="no">${s.psalm}편</span><b>${esc(s.title)}</b><span class="set">${esc(s.setting)}</span><span class="tags">
      <span class="tag${s.lyrics ? ' ok' : ''}">가사</span><span class="tag${dir[`${s.id}.json`] ? ' ok' : ''}">노래</span></span></summary>
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
  const body = $('.body', el), info = await infoOf(s.id);
  body.innerHTML = `${s.intro ? `<p class="intro">${esc(s.intro)}</p>` : ''}
    ${s.lyrics ? `<div class="box"><h3>Suno 스타일<span class="grow"></span><button class="ghost" data-label="스타일 복사" data-c="style">스타일 복사</button></h3><pre class="style">${esc(s.style)}</pre></div>
    <div class="box"><h3>가사<span class="grow"></span><button class="ghost" data-label="가사 복사" data-c="lyrics">가사 복사</button></h3><pre>${esc(s.lyrics)}</pre></div>`
    : '<p class="note">아직 가사를 쓰지 않은 노래입니다.</p>'}
    <div class="box"><h3>노래 파일<span class="grow"></span><label class="btn" style="cursor:pointer">${info ? 'mp3 바꾸기' : 'mp3 올리기'}<input type="file" accept="audio/mpeg,.mp3" hidden></label></h3>
      <div class="state up">${info ? `올린 노래: <a href="${esc(info.src)}" target="_blank" rel="noopener">${esc(info.src.split('/').pop())}</a>` : '아직 올리지 않았습니다'}</div>
      ${info ? `<audio controls preload="none" src="${esc(info.src)}"></audio>` : ''}</div>
    <div class="box sync" hidden></div>`;
  body.querySelectorAll('[data-c]').forEach(b => { b.onclick = () => copy(b, s[b.dataset.c]); });
  $('input[type=file]', body).onchange = e => upload(el, s, e.target.files[0]);
  if (info && s.lyrics) showSync(el, s, info);
}

async function upload(el, s, file) {
  if (!file) return;
  const st = $('.state.up', el);
  if (!r2) { st.className = 'state up bad'; st.textContent = '먼저 위에서 R2 열쇠를 넣어 주세요'; return; }
  if (file.size > 40 * 1048576) { st.className = 'state up bad'; st.textContent = '파일이 너무 큽니다 (40MB까지)'; return; }
  st.className = 'state up'; st.textContent = 'R2에 올리는 중…';
  try {
    const bytes = new Uint8Array(await file.arrayBuffer()), hash = await sha256(bytes);
    const key = `${R2.prefix}${s.id}-${hash.slice(0, 10)}.mp3`;
    await r2Put(key, bytes, hash);
    // 지금 노래가 이것임을 저장소에 적는다 — 배포 작업이 이 노래를 듣고 가사 시간을 맞춘다
    await readDir();
    const old = dir[`${s.id}.json`];
    const out = { src: `${R2.base}/${key}`, audio: hash, by: 'pending', lines: [] };
    const res = await gh(`/repos/${REPO}/contents/${DIR}/${s.id}.json`, { method: 'PUT', body: JSON.stringify({
      message: `Psalms: ${old ? 'replace' : 'add'} song for Psalm ${s.psalm} (${s.id}) from the studio`, content: toB64(JSON.stringify(out, null, 1) + '\n'), branch: BRANCH, ...(old ? { sha: old.sha } : {}) }) });
    dir[`${s.id}.json`] = res.content; summary();
    st.innerHTML = `올림 ✓ <a href="https://github.com/${REPO}/commit/${res.commit.sha}" target="_blank" rel="noopener">${res.commit.sha.slice(0, 7)}</a> · 배포하며 가사 시간을 맞추는 중… (몇 분)`;
    await waitSync(el, s, hash);
  } catch (err) { st.className = 'state up bad'; st.textContent = `올리지 못했습니다: ${err.message}`; }
}
// 배포 작업이 이 노래(hash)에 맞춘 가사 시간을 올릴 때까지 기다린다
async function waitSync(el, s, hash) {
  for (let n = 0; n < 60; n++) {
    await new Promise(r => setTimeout(r, 15000));
    await readDir().catch(() => {});
    const j = await infoOf(s.id);
    if (j?.audio === hash && j.by !== 'pending') { el.dataset.ready = 1; return fill(el, s); }
  }
  $('.state.up', el).textContent += ' (시간이 오래 걸립니다 — GitHub Actions를 확인하세요)';
}

/* ---------- 가사 시간 ---------- */
const fmt = t => t == null ? '—' : `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, '0')}`;
function showSync(el, s, info) {
  const box = $('.sync', el), audio = $('audio', el);
  const want = sungLines(s.lyrics);
  // 맞춘 시간이 지금 가사와 맞을 때만 쓴다 (가사를 고치면 다시 맞춰야)
  const fresh = info.by !== 'pending' && info.lines?.length === want.length && info.lines.every((l, i) => l.text === want[i]);
  let times = fresh ? info.lines.map(l => l.t) : want.map(() => null);
  box.hidden = false;
  box.innerHTML = `<h3>가사 시간<span class="grow"></span><span class="state ${fresh ? 'ok' : 'bad'}">${fresh ? (info.by === 'tap' ? '탭으로 맞춤' : '자동으로 맞춤') : info.by === 'pending' ? '자동으로 맞추는 중…' : '가사가 바뀌어 다시 맞춰야 합니다'}</span>
    <button class="ghost tap">탭으로 맞추기</button></h3>
    <div class="tapbar"><button class="ghost undo">한 줄 되돌리기</button><button class="btn hit">지금 이 줄 시작 (Space)</button><button class="ghost save" disabled>저장</button></div>
    <p class="state tapmsg"></p>
    <ol class="lines">${want.map((t, i) => `<li data-i="${i}"><i>${fmt(times[i])}</i><span>${esc(t)}</span></li>`).join('')}</ol>`;
  const lis = [...box.querySelectorAll('li')];
  const paint = () => lis.forEach((li, i) => { $('i', li).textContent = fmt(times[i]); });
  let tapping = false, next = 0;
  // 재생 중인 줄을 밝힌다. 줄을 누르면 그 자리부터
  audio.ontimeupdate = () => { const t = audio.currentTime; let k = -1; times.forEach((x, i) => { if (x != null && x <= t) k = i; }); lis.forEach((li, i) => li.classList.toggle('now', i === k)); };
  lis.forEach((li, i) => { li.onclick = () => { if (times[i] != null && !tapping) { audio.currentTime = Math.max(0, times[i] - 0.3); audio.play(); } }; });
  // 탭으로 맞추기: 처음부터 틀고, 줄이 시작될 때마다 단추(또는 스페이스)를 누른다
  const hit = () => { if (!tapping || next >= want.length) return; times[next] = +audio.currentTime.toFixed(2); lis[next].classList.add('tapped'); next++; paint();
    $('.tapmsg', box).textContent = next < want.length ? `다음 줄: ${want[next]}` : '마지막 줄까지 맞췄습니다 — 저장을 누르세요'; $('.save', box).disabled = next < want.length; };
  $('.tap', box).onclick = () => {
    tapping = !tapping; el.classList.toggle('tapping', tapping); $('.tap', box).classList.toggle('on', tapping);
    if (tapping) { times = want.map(() => null); next = 0; lis.forEach(li => li.classList.remove('tapped')); paint(); audio.currentTime = 0; audio.play(); $('.tapmsg', box).textContent = `첫 줄: ${want[0]}`; el.focus(); }
    else { audio.pause(); $('.tapmsg', box).textContent = ''; }
  };
  $('.hit', box).onclick = hit;
  $('.undo', box).onclick = () => { if (next > 0) { next--; times[next] = null; lis[next].classList.remove('tapped'); paint(); audio.currentTime = Math.max(0, (times[next - 1] ?? 0)); $('.save', box).disabled = true; $('.tapmsg', box).textContent = `다음 줄: ${want[next]}`; } };
  el.tabIndex = -1;
  el.onkeydown = e => { if (tapping && e.code === 'Space') { e.preventDefault(); hit(); } };
  $('.save', box).onclick = async () => {
    const b = $('.save', box); b.disabled = true; $('.tapmsg', box).textContent = '저장하는 중…';
    try {
      await readDir();
      const old = dir[`${s.id}.json`];
      const out = { src: info.src, audio: info.audio, by: 'tap', lines: want.map((text, i) => ({ t: times[i], text })) };
      const res = await gh(`/repos/${REPO}/contents/${DIR}/${s.id}.json`, { method: 'PUT', body: JSON.stringify({
        message: `Psalms: tap-synced lyrics for Psalm ${s.psalm} (${s.id})`, content: toB64(JSON.stringify(out, null, 1) + '\n'), branch: BRANCH, ...(old ? { sha: old.sha } : {}) }) });
      dir[`${s.id}.json`] = res.content; tapping = false; el.classList.remove('tapping');
      $('.tapmsg', box).className = 'state tapmsg ok'; $('.tapmsg', box).textContent = '저장했습니다 ✓ (배포가 끝나면 앱에 반영)';
    } catch (err) { b.disabled = false; $('.tapmsg', box).className = 'state tapmsg bad'; $('.tapmsg', box).textContent = `저장하지 못했습니다: ${err.message}`; }
  };
}


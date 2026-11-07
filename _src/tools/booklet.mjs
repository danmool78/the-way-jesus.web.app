// '왜 기독교인가' 소책자(A5 인쇄용 PDF): why.html을 브라우저로 열어 인쇄용으로 바꾼 뒤 PDF로 뽑는다 — 웹 글을 고치면 다시 돌리기만 하면 된다.
// 쓰는 법: node _src/tools/booklet.mjs [언어] [출력.pdf] [--print]   (언어 없으면 ko → why.html, 그 밖은 why.<언어>.html)
//   --print: 인쇄소용 — 사방 3mm 재단 여유(도련)를 둔 쪽에 그린 뒤 _src/tools/bookfinish.py가 재단선을 단다. 쪽 번호도 bookfinish.py가 찍는다(pypdf·reportlab)
// 저장소 맨 위를 http://localhost:8765 로 띄워 둔다(python3 -m http.server 8765). QR 코드는 python segno(pip install segno)
// 웹과 다른 점: 접어 둔 풀이를 모두 펼친다, 장마다 새 쪽, 앱으로 가는 링크·단추·음악은 뺀다, 앞뒤 표지와 QR,
// 교단 이단 결의 목록은 뺀다(인쇄물에서는 출처 링크를 열 수 없어서)
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const PRINT = process.argv.includes('--print'), args = process.argv.slice(2).filter(a => a !== '--print');
const lang = args[0] || 'ko', out = args[1] || `why-booklet${lang === 'ko' ? '' : '.' + lang}${PRINT ? '-print' : ''}.pdf`;
const BL = PRINT ? 3 : 0, PW = 148 + BL * 2, PH = 210 + BL * 2; // 쪽 크기(mm) — 인쇄용은 재단 여유만큼 크게
const page = lang === 'ko' ? 'why.html' : `why.${lang}.html`;
const SITE = 'https://the-way-jesus.web.app';
const qr = url => execFileSync('python3', ['-c', `import segno,sys,io;b=io.BytesIO();segno.make(sys.argv[1],error='m').save(b,kind='svg',scale=4,border=1,dark='#2b2620',light=None,xmldecl=False,svgns=True);print(b.getvalue().decode())`, url]).toString();
const T = {
  ko: { app: '그 길', talkH: '함께 나눠 볼 물음', memo: '메모', talk: ['나는 지금 \'올라가는 길\'과 \'내려오신 하나님\' 가운데 어디에 서 있나요?', '"모든 종교는 다 같다"는 말을 들으면 어떤 생각이 드나요?', '탕자의 아버지처럼 나에게 먼저 달려와 준 사람이 있었나요?', '재판관 이야기에서, 공의와 사랑이 함께 이루어진다는 말이 어떻게 들리나요?', '믿고 한 걸음 내디뎌서 비로소 알게 된 일이 있나요?', '이번 주에 가 볼 수 있는 교회는 어디인가요? 누구와 함께 가고 싶나요?'], back: ['당신을 기다리는 가족이 있습니다', '예수님은 혼자 걷게 두지 않으십니다. 이번 주일, 가까운 교회의 문을 두드려 보세요.'], qr: ['그 길 — 성경의 길을 지도 위에서', '이 글을 휴대폰으로', '예수의 발자취', 'GoodNews — 네 장면으로 듣는 복음'], coverFoot: '그림과 도표로 견주어 보는 이야기', bnote: '그림은 AI로 만들고 사람이 다듬었습니다 · 말씀은 새로 옮긴 글입니다', colo: [['펴낸 날', '2026년 11월'], ['펴낸이', '김성수<small>대한예수교장로회(합동) 대전 새로남교회를 섬기고 있습니다 · 삼은케미칼, SSSOFT 대표</small>'], ['만든 곳', 'SSSOFT'], ['펴낸 곳', '<span class="bk-blank"></span><small>나누는 교회나 단체가 이름을 적거나 도장을 찍으세요</small>']] },
  en: { app: 'The Way', talkH: 'Questions to talk over', memo: 'Notes', talk: ['Where do I stand now — on the road up, or before the God who came down?', 'What comes to mind when you hear "all religions are the same"?', 'Has anyone ever run to you first, like the father in the story?', 'In the judge story, how does it sound that justice and love meet?', 'Is there something you only came to know after trusting and taking a step?', 'Which church could you visit this week, and who would you like to go with?'], back: ['A family is waiting for you', 'Jesus does not leave you to walk alone. This Sunday, knock on the door of a church near you.'], qr: ['The Way — Bible journeys on the map', 'Read this on your phone', 'The footsteps of Jesus', 'GoodNews — the gospel in four scenes'], coverFoot: 'A comparison in pictures and charts', bnote: 'Pictures made with AI and refined by hand · Scripture newly translated', colo: [['Published', 'November 2026'], ['Publisher', '김성수<small>Serves at 새로남교회, Daejeon (Presbyterian Church in Korea, Hapdong) · CEO of 삼은케미칼 and SSSOFT</small>'], ['Made by', 'SSSOFT'], ['Distributed by', '<span class="bk-blank"></span><small>Churches and groups sharing this may write their name or stamp here</small>']] },
};
const t = { ...T.en, ...(T[lang] || {}) };
// 뒤표지 QR: 그 길 첫 화면 · 이 글 · 예수 여정 · GoodNews
const qrs = [`${SITE}/?lang=${lang}`, `${SITE}/${page}`, `${SITE}/jesus`, `${SITE}/goodnews/`].map(qr);

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 560, height: 800 } });
await p.goto(`${process.env.SITE_URL || 'http://localhost:8765'}/${page}`, { waitUntil: 'networkidle' }); // SITE_URL: 다른 곳에 띄운 사본(작업 폴더)으로 뽑을 때
await p.evaluate(({ t, qrs }) => {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  // 화면에만 있는 것: 위 메뉴, 음악 단추, 끝의 단추·꼬리말, 앱으로 가는 링크
  $$('.why-top, #bgm, script, .end, .dl').forEach(e => e.remove());
  $$('.when a, .tl a').forEach(e => e.remove());
  // 교단 이단 결의 목록(한국어판) — 제목·안내·접힌 목록
  const hh = $$('h3').find(h => h.nextElementSibling?.classList.contains('notice'));
  if (hh) { const n = hh.nextElementSibling, d = n.nextElementSibling; [hh, n, d].forEach(e => e?.remove()); }
  // 접힌 풀이는 모두 펼치고 '펼쳐 보기' 단추는 감춘다
  $$('details').forEach(d => d.open = true);
  // 꼬리말(그림·말씀 출처)은 뒤표지로 옮긴다
  const foot = $('.foot'); foot?.querySelector('br')?.remove(); foot?.querySelector('a')?.remove();
  // 앞표지: 제목·부제·산 그림
  const main = $('main.why'), h1 = $('h1'), sub = $('.sub');
  const cover = document.createElement('div'); cover.className = 'bk-cover';
  cover.innerHTML = `<div class="bk-app"><img src="assets/logo.svg" alt="">${t.app}</div><h1>${h1.textContent}</h1><p class="sub">${sub.textContent}</p>
    <img class="bk-art" src="assets/img/why/mountain.webp" alt=""><p class="bk-cfoot">${t.coverFoot}</p>`;
  main.prepend(cover); h1.remove(); sub.remove();
  // 뒤표지: 교회로 초대 + QR 셋 + 출처
  const last = main.querySelector('.card.warm[style*="margin-top:48px"]') || [...main.querySelectorAll('.card.warm')].pop();
  last?.remove();
  const back = document.createElement('div'); back.className = 'bk-back';
  back.innerHTML = `<p class="motto">${t.back[0]}</p><p class="bk-inv">${t.back[1]}</p>
    <div class="bk-qr">${qrs.map((q, i) => `<figure>${q}<figcaption>${t.qr[i]}</figcaption></figure>`).join('')}</div>
    `;
  // 판권면: 제목·펴낸 날·펴낸이·만든 곳·펴낸 곳(주소는 적지 않는다 — 도메인을 정하기 전이라 QR만, 2026-11 사용자) (뒤표지 바로 앞, 아래쪽에 모은다)
  const colo = document.createElement('div'); colo.className = 'bk-colo';
  colo.innerHTML = `<p class="bk-ct">${h1.textContent}<small>${sub.textContent}</small></p>
    <dl>${t.colo.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>
    <p class="bk-note">© SSSOFT</p><p class="bk-note bk-bnote">${t.bnote}</p>`; // 그림·말씀 안내는 겉표지가 아니라 안쪽 면(뒤표지 안쪽 = 판권면)에 한 줄로 작게 (2026-11 사용자 — 웹 꼬리말을 그대로 옮기면 네 줄이었다)
  foot?.remove();
  const talk = document.createElement('div'); talk.className = 'bk-talk';
  talk.innerHTML = `<h2>${t.talkH}</h2><ol>${t.talk.map(q => `<li>${q}<span></span></li>`).join('')}</ol>`;
  main.append(talk, colo, back);
}, { t, qrs });
await p.addStyleTag({ content: `
  @page{size:${PW}mm ${PH}mm;margin:${13 + BL}mm ${12 + BL}mm ${15 + BL}mm}
  @page cover{margin:0}
  html,body{background:#fff!important}
  body{font-size:12px}
  .why{max-width:none;padding:0}
  .why p{font-size:10.2pt;line-height:1.68}
  .why h2{font-size:17pt;margin:0 0 6px}
  .why section{margin:0;padding:0;border:0;break-before:page}
  .why section>small{margin-top:0}
  .part{break-before:page;margin:30mm 0 0}
  details.more>summary,.spec .chev{display:none!important}
  details.more>div{margin-top:4px;animation:none}
  .ans>div{break-inside:avoid} /* 세 물음 카드가 쪽 사이에서 잘리지 않게 */
  details.more.qa>summary{display:block!important;background:none!important;border:0!important;padding:0!important;margin:5mm 0 1mm!important;font-weight:700;color:var(--gold2)} details.more.qa>summary::after,details.more.qa>summary .c{display:none!important} /* '그래도 남는 물음'은 물음이 곧 제목 — 접기 단추 대신 굵은 글씨로 */
  .art{max-width:92mm;margin:4mm auto 2mm}
  .pair{max-width:none;gap:4mm}
  .art img{box-shadow:none;border:1px solid #eadfcd}
  .ill{max-width:110mm}
  .card,.verse,.claim,.ox-r,.ox-h,.steps>div,.price>div,.know>div,.roles>div,.tests>div,figure,.tl li,.fv li,.ache p,.vs,.flip,.when,.spec details,.asks{break-inside:avoid}
  h2,h3,.cap{break-after:avoid}
  .why .lead{font-size:10.5pt}
  .know{grid-template-columns:repeat(4,1fr)}
  .roles{grid-template-columns:repeat(3,1fr)}
  .bk-cover,.bk-back{page:cover;width:${PW}mm;height:${PH}mm;box-sizing:border-box;background:#f7f1e6;overflow:hidden}
  .bk-cover{display:flex;flex-direction:column;align-items:center;text-align:center;padding:${24 + BL}mm ${16 + BL}mm ${14 + BL}mm;break-after:page}
  .bk-cover .bk-app{display:flex;align-items:center;gap:3mm;font-family:var(--serif);color:var(--gold2);letter-spacing:.25em;font-size:13pt;margin-bottom:16mm}
  .bk-cover .bk-app img{width:9mm;height:9mm}
  .bk-cover h1{font-size:34pt;letter-spacing:.04em;margin:0 0 5mm}
  .bk-cover .sub{font-size:13.5pt;margin:0}
  .bk-cover .bk-art{width:118mm;margin-top:auto;mix-blend-mode:multiply;filter:brightness(1.05)} /* 가장자리를 지우면 그림이 잘려 보였다 — 종이색을 곱해 표지 크림색에 녹인다 */
  .why .bk-cfoot{font-size:9.5pt!important;color:var(--muted);letter-spacing:.08em;margin:2mm 0 0!important}
  .asks{margin-top:45mm}
  .spec summary{padding:5px 0}
  .spec dl{font-size:8.6pt;line-height:1.6;padding:6px 10px;margin:0 0 6px}
  .spec-head{margin-top:8px}
  .ox{border:0;background:none;box-shadow:none;overflow:visible;display:grid;gap:4px}
  .ox-h{break-after:avoid}
  .ox-r{border:1px solid #e8dece;border-radius:10px;overflow:hidden;background:#fffdf9}
  .verse{margin:8px 0;padding:9px 13px;font-size:10.4pt;line-height:1.7}
  .bk-talk,.bk-memo{break-before:page}
  .bk-talk h2,.bk-memo h2{text-align:center;margin:6mm 0 8mm}
  .bk-talk ol{margin:0;padding-left:6mm}
  .bk-talk li{font-size:10.6pt;line-height:1.7;color:#3d362d;margin:0 0 3mm}
  .bk-talk li span,.bk-memo span{display:block;height:9mm;border-bottom:1px dashed #d6c8b2}
  .bk-colo{break-before:page;display:flex;flex-direction:column;justify-content:flex-end;height:${PH - 28 - BL * 2 - 4}mm}
  .why .bk-ct{font-family:var(--serif);font-size:13pt!important;color:#2b2620;margin:0 0 5mm!important;padding-bottom:4mm;border-bottom:1px solid #e3d6c2}
  .bk-ct small{display:block;font-size:9.5pt;color:var(--muted);margin-top:1mm}
  .bk-colo dl{display:grid;grid-template-columns:auto 1fr;gap:1.5mm 6mm;margin:0 0 6mm;font-size:9pt;line-height:1.6}
  .bk-colo dt{color:var(--faint)}.bk-colo dd{margin:0;color:#3d362d}
  .bk-blank{display:block;width:70mm;height:9mm;border-bottom:1px solid #b9ab95} /* 펴낸 곳: 비워 둔다 — 나누는 교회·단체가 적거나 도장 */
  .bk-colo dd small{display:block;font-size:7.6pt;color:var(--muted);margin-top:.5mm}
  .bk-colo .bk-note{margin:1.5mm 0!important}
  .bk-back{break-before:page;text-align:center;padding:${36 + BL}mm ${12 + BL}mm 0}
  .why .bk-bnote{margin:5mm 0 0!important;text-align:left;white-space:nowrap;font-size:6pt!important;line-height:1.55!important;color:#bdb3a3!important} /* 안내는 눈에 띌 필요 없다 — 작고 옅게 (2026-11 사용자) */
  .bk-back .motto{font-size:17pt;margin:0 0 4mm}
  .bk-inv{color:var(--muted);margin:0 0 12mm!important}
  .bk-qr{display:grid;grid-template-columns:repeat(4,1fr);gap:4mm;margin:0 0 16mm}
  .bk-qr figure{margin:0}
  .bk-qr svg{width:24mm;height:24mm;display:block;margin:0 auto 2mm;background:#fff;border-radius:2mm;padding:1.5mm}
  .bk-qr figcaption{font-size:8pt;line-height:1.5;color:var(--muted)}
  .why .bk-note{font-size:8pt!important;color:var(--faint);line-height:1.7;margin:2mm 10mm}
` });
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(800);
const pdf = () => p.pdf({ path: out, width: `${PW}mm`, height: `${PH}mm`, printBackground: true, preferCSSPageSize: true });
const pages = () => +execFileSync('pdfinfo', [out]).toString().match(/Pages:\s+(\d+)/)[1];
await pdf();
for (let n = pages(); n % 4; n = pages()) {
  await p.evaluate(memo => { const m = document.createElement('div'); m.className = 'bk-memo'; m.innerHTML = `<h2>${memo}</h2>` + '<span></span>'.repeat(14); document.querySelector('.bk-colo').before(m); }, t.memo);
  await pdf();
}
await b.close();
// 마무리: 쪽 번호(표지 빼고), 인쇄용이면 재단선(코너 표시)을 단 큰 종이 위에 올린다
execFileSync('python3', ['_src/tools/bookfinish.py', out, out, String(BL), ...(PRINT ? ['--marks'] : [])]);
console.log('ok', out, pages() + '쪽');

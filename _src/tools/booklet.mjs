// '왜 기독교인가' 소책자(A5 인쇄용 PDF): why.html을 브라우저로 열어 인쇄용으로 바꾼 뒤 PDF로 뽑는다 — 웹 글을 고치면 다시 돌리기만 하면 된다.
// 쓰는 법: node _src/tools/booklet.mjs [언어] [출력.pdf]   (언어 없으면 ko → why.html, 그 밖은 why.<언어>.html)
// 저장소 맨 위를 http://localhost:8765 로 띄워 둔다(python3 -m http.server 8765). QR 코드는 python segno(pip install segno)
// 웹과 다른 점: 접어 둔 풀이를 모두 펼친다, 장마다 새 쪽, 앱으로 가는 링크·단추·음악은 뺀다, 앞뒤 표지와 QR,
// 교단 이단 결의 목록은 뺀다(인쇄물에서는 출처 링크를 열 수 없어서)
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const lang = process.argv[2] || 'ko', out = process.argv[3] || `why-booklet${lang === 'ko' ? '' : '.' + lang}.pdf`;
const page = lang === 'ko' ? 'why.html' : `why.${lang}.html`;
const SITE = 'https://the-way-jesus.web.app';
const qr = url => execFileSync('python3', ['-c', `import segno,sys,io;b=io.BytesIO();segno.make(sys.argv[1],error='m').save(b,kind='svg',scale=4,border=1,dark='#2b2620',light=None,xmldecl=False,svgns=True);print(b.getvalue().decode())`, url]).toString();
const T = {
  ko: { app: '그 길', talkH: '함께 나눠 볼 물음', memo: '메모', talk: ['나는 지금 \'올라가는 길\'과 \'내려오신 하나님\' 가운데 어디에 서 있나요?', '"모든 종교는 다 같다"는 말을 들으면 어떤 생각이 드나요?', '탕자의 아버지처럼 나에게 먼저 달려와 준 사람이 있었나요?', '재판관 이야기에서, 공의와 사랑이 함께 이루어진다는 말이 어떻게 들리나요?', '믿고 한 걸음 내디뎌서 비로소 알게 된 일이 있나요?', '이번 주에 가 볼 수 있는 교회는 어디인가요? 누구와 함께 가고 싶나요?'], back: ['당신을 기다리는 가족이 있습니다', '예수님은 혼자 걷게 두지 않으십니다. 이번 주일, 가까운 교회의 문을 두드려 보세요.'], q1: '이 글을 휴대폰으로', q2: '예수의 발자취를 지도 위에서', q3: 'GoodNews — 네 장면으로 듣는 복음' },
  en: { app: 'The Way', talkH: 'Questions to talk over', memo: 'Notes', talk: ['Where do I stand now — on the road up, or before the God who came down?', 'What comes to mind when you hear "all religions are the same"?', 'Has anyone ever run to you first, like the father in the story?', 'In the judge story, how does it sound that justice and love meet?', 'Is there something you only came to know after trusting and taking a step?', 'Which church could you visit this week, and who would you like to go with?'], back: ['A family is waiting for you', 'Jesus does not leave you to walk alone. This Sunday, knock on the door of a church near you.'], q1: 'Read this on your phone', q2: 'Walk the footsteps of Jesus on the map', q3: 'GoodNews — the gospel in four scenes' },
};
const t = { ...T.en, ...(T[lang] || {}) };
const qWhy = qr(`${SITE}/${page}`), qApp = qr(`${SITE}/?lang=${lang}`), qGood = qr(`${SITE}/goodnews/`);

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 560, height: 800 } });
await p.goto(`http://localhost:8765/${page}`, { waitUntil: 'networkidle' });
await p.evaluate(({ t, qWhy, qApp, qGood }) => {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  // 화면에만 있는 것: 위 메뉴, 음악 단추, 끝의 단추·꼬리말, 앱으로 가는 링크
  $$('.why-top, #bgm, script, .end').forEach(e => e.remove());
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
  cover.innerHTML = `<div class="bk-app">${t.app}</div><h1>${h1.textContent}</h1><p class="sub">${sub.textContent}</p><img src="assets/img/why/mountain.webp" alt="">`;
  main.prepend(cover); h1.remove(); sub.remove();
  // 뒤표지: 교회로 초대 + QR 셋 + 출처
  const last = main.querySelector('.card.warm[style*="margin-top:48px"]') || [...main.querySelectorAll('.card.warm')].pop();
  last?.remove();
  const back = document.createElement('div'); back.className = 'bk-back';
  back.innerHTML = `<p class="motto">${t.back[0]}</p><p class="bk-inv">${t.back[1]}</p>
    <div class="bk-qr"><figure>${qWhy}<figcaption>${t.q1}</figcaption></figure><figure>${qApp}<figcaption>${t.q2}</figcaption></figure><figure>${qGood}<figcaption>${t.q3}</figcaption></figure></div>
    <p class="bk-note">${foot ? foot.innerHTML : ''}</p><p class="bk-note">© SSSOFT · the-way-jesus.web.app</p>`;
  foot?.remove();
  const talk = document.createElement('div'); talk.className = 'bk-talk';
  talk.innerHTML = `<h2>${t.talkH}</h2><ol>${t.talk.map(q => `<li>${q}<span></span></li>`).join('')}</ol>`;
  main.append(talk, back);
}, { t, qWhy, qApp, qGood });
await p.addStyleTag({ content: `
  @page{size:A5;margin:13mm 12mm 15mm}
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
  .art{max-width:92mm;margin:4mm auto 2mm}
  .pair{max-width:none;gap:4mm}
  .art img{box-shadow:none;border:1px solid #eadfcd}
  .ill{max-width:110mm}
  .card,.verse,.claim,.ox-r,.ox-h,.steps>div,.price>div,.know>div,.roles>div,.tests>div,figure,.tl li,.fv li,.ache p,.vs,.flip,.when,.spec details,.asks{break-inside:avoid}
  h2,h3,.cap{break-after:avoid}
  .why .lead{font-size:10.5pt}
  .know{grid-template-columns:repeat(4,1fr)}
  .roles{grid-template-columns:repeat(3,1fr)}
  .bk-cover{height:180mm;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;break-after:page}
  .bk-cover .bk-app{font-family:var(--serif);color:var(--gold2);letter-spacing:.3em;font-size:12pt;margin-bottom:14mm}
  .bk-cover h1{font-size:30pt;margin:0 0 4mm}
  .bk-cover .sub{font-size:13pt;margin:0 0 12mm}
  .bk-cover img{width:110mm;border-radius:6mm}
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
  .bk-back{break-before:page;text-align:center;padding-top:20mm}
  .bk-back .motto{font-size:17pt;margin:0 0 4mm}
  .bk-inv{color:var(--muted);margin:0 0 12mm!important}
  .bk-qr{display:flex;justify-content:center;gap:8mm;margin:0 0 14mm}
  .bk-qr figure{margin:0;width:32mm}
  .bk-qr svg{width:28mm;height:28mm;display:block;margin:0 auto 2mm}
  .bk-qr figcaption{font-size:8pt;line-height:1.5;color:var(--muted)}
  .why .bk-note{font-size:8pt!important;color:var(--faint);line-height:1.7;margin:2mm 10mm}
` });
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(800);
const pdf = () => p.pdf({ path: out, format: 'A5', printBackground: true, preferCSSPageSize: true, displayHeaderFooter: true, headerTemplate: '<div></div>',
  footerTemplate: '<div style="width:100%;text-align:center;font-size:7px;color:#a39a8a;font-family:sans-serif"><span class="pageNumber"></span></div>' });
const pages = () => +execFileSync('pdfinfo', [out]).toString().match(/Pages:\s+(\d+)/)[1];
await pdf();
for (let n = pages(); n % 4; n = pages()) {
  await p.evaluate(memo => { const m = document.createElement('div'); m.className = 'bk-memo'; m.innerHTML = `<h2>${memo}</h2>` + '<span></span>'.repeat(14); document.querySelector('.bk-back').before(m); }, t.memo);
  await pdf();
}
await b.close();
console.log('ok', out);

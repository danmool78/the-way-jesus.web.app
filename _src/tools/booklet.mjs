// '왜 기독교인가' 소책자(A5 인쇄용 PDF): why.html을 브라우저로 열어 인쇄용으로 바꾼 뒤 PDF로 뽑는다 — 웹 글을 고치면 다시 돌리기만 하면 된다.
// 쓰는 법: node _src/tools/booklet.mjs [언어] [출력.pdf] [--print]   (언어 없으면 ko → why.html, 그 밖은 why.<언어>.html)
//   --print: 인쇄소용 — 사방 3mm 재단 여유(도련)를 둔 쪽에 그린 뒤 _src/tools/bookfinish.py가 재단선을 단다. 쪽 번호도 bookfinish.py가 찍는다(pypdf·reportlab)
// 저장소 맨 위를 http://localhost:8765 로 띄워 둔다(python3 -m http.server 8765). QR 코드는 python segno(pip install segno)
// 웹과 다른 점: 접어 둔 풀이를 모두 펼친다, 장마다 새 쪽, 앱으로 가는 링크·단추·음악은 뺀다, 앞뒤 표지와 QR,
// 교단 이단 결의 목록은 뺀다(인쇄물에서는 출처 링크를 열 수 없어서)
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const PRINT = process.argv.includes('--print'), args = process.argv.slice(2).filter(a => a !== '--print');
const lang = args[0] || 'ko', out = args[1] || `why-booklet${lang === 'ko' ? '' : '.' + lang}${PRINT ? '-print' : ''}.pdf`;
const BL = PRINT ? 3 : 0, PW = 148 + BL * 2, PH = 210 + BL * 2; // 쪽 크기(mm) — 인쇄용은 재단 여유만큼 크게
const page = lang === 'ko' ? 'why.html' : `why.${lang}.html`;
const SITE = 'https://thewaymap.org';
const qr = url => execFileSync('python3', ['-c', `import segno,sys,io;b=io.BytesIO();segno.make(sys.argv[1],error='m').save(b,kind='svg',scale=4,border=1,dark='#2b2620',light=None,xmldecl=False,svgns=True);print(b.getvalue().decode())`, url]).toString();
const T = {
  ko: { app: '그 길', talkH: '함께 나눠 볼 물음', memo: '메모', talk: ['나는 지금 \'올라가는 길\'과 \'내려오신 하나님\' 가운데 어디에 서 있나요?', '"모든 종교는 다 같다"는 말을 들으면 어떤 생각이 드나요?', '탕자의 아버지처럼 나에게 먼저 달려와 준 사람이 있었나요?', '재판관 이야기에서, 공의와 사랑이 함께 이루어진다는 말이 어떻게 들리나요?', '믿고 한 걸음 내디뎌서 비로소 알게 된 일이 있나요?', '이번 주에 가 볼 수 있는 교회는 어디인가요? 누구와 함께 가고 싶나요?'], back: ['당신을 기다리는 가족이 있습니다', '예수님은 혼자 걷게 두지 않으십니다. 이번 주일, 가까운 교회의 문을 두드려 보세요.'], qr: ['그 길 — 성경의 길을 지도 위에서', '이 글을 휴대폰으로', '예수의 발자취', 'GoodNews — 네 장면으로 듣는 복음'], coverFoot: '그림과 도표로 견주어 보는 이야기', bnote: '그림은 AI로 만들고 사람이 다듬었습니다 · 말씀은 새로 옮긴 글입니다', colo: [['펴낸 날', '2026년 11월'], ['펴낸이', '김성수<small>대전 새로남교회 집사</small>'], ['만든 곳', 'SSSOFT'], ['펴낸 곳', '<span class="bk-blank"></span><small>나누는 교회나 단체가 이름을 적거나 도장을 찍으세요</small>']] },
  en: { app: 'The Way', talkH: 'Questions to talk over', memo: 'Notes', talk: ['Where do I stand now — on the road up, or before the God who came down?', 'What comes to mind when you hear "all religions are the same"?', 'Has anyone ever run to you first, like the father in the story?', 'In the judge story, how does it sound that justice and love meet?', 'Is there something you only came to know after trusting and taking a step?', 'Which church could you visit this week, and who would you like to go with?'], back: ['A family is waiting for you', 'Jesus does not leave you to walk alone. This Sunday, knock on the door of a church near you.'], qr: ['The Way — Bible journeys on the map', 'Read this on your phone', 'The footsteps of Jesus', 'GoodNews — the gospel in four scenes'], coverFoot: 'A comparison in pictures and charts', bnote: 'Pictures made with AI and refined by hand · Scripture newly translated', colo: [['Published', 'November 2026'], ['Publisher', '김성수<small>Deacon, 새로남 Church, Daejeon</small>'], ['Made by', 'SSSOFT'], ['Distributed by', '<span class="bk-blank"></span><small>Churches and groups sharing this may write their name or stamp here</small>']] },
  es: { app: 'El Camino', talkH: 'Preguntas para conversar', memo: 'Notas', talk: ['¿Dónde estoy ahora: en el camino que sube, o ante el Dios que bajó?', '¿Qué piensas cuando oyes «todas las religiones son iguales»?', '¿Alguien corrió primero hacia ti, como el padre de la historia?', 'En la historia del juez, ¿cómo te suena que la justicia y el amor se encuentren?', '¿Hay algo que solo entendiste después de confiar y dar un paso?', '¿A qué iglesia podrías ir esta semana, y con quién te gustaría ir?'], back: ['Una familia te está esperando', 'Jesús no te deja caminar solo. Este domingo, llama a la puerta de una iglesia cercana.'], qr: ['El Camino — viajes bíblicos sobre el mapa', 'Lee esto en tu teléfono', 'Las huellas de Jesús', 'GoodNews — el evangelio en cuatro escenas'], coverFoot: 'Una comparación con dibujos y esquemas', bnote: 'Dibujos hechos con IA y retocados a mano · Escrituras traducidas de nuevo', colo: [['Publicado', 'Noviembre de 2026'], ['Editor', '김성수<small>Diácono de la iglesia 새로남, Daejeon</small>'], ['Realizado por', 'SSSOFT'], ['Distribuido por', '<span class="bk-blank"></span><small>Las iglesias y grupos que lo compartan pueden escribir aquí su nombre o poner su sello</small>']] },
  pt: { app: 'O Caminho', talkH: 'Perguntas para conversar', memo: 'Anotações', talk: ['Onde estou agora: no caminho que sobe, ou diante do Deus que desceu?', 'O que você pensa quando ouve “todas as religiões são iguais”?', 'Alguém já correu primeiro até você, como o pai da história?', 'Na história do juiz, como soa para você que a justiça e o amor se encontrem?', 'Existe algo que você só entendeu depois de confiar e dar um passo?', 'Que igreja você poderia visitar nesta semana, e com quem gostaria de ir?'], back: ['Uma família está esperando por você', 'Jesus não deixa você caminhar sozinho. Neste domingo, bata à porta de uma igreja perto de você.'], qr: ['O Caminho — jornadas bíblicas no mapa', 'Leia isto no celular', 'Os passos de Jesus', 'GoodNews — o evangelho em quatro cenas'], coverFoot: 'Uma comparação em desenhos e quadros', bnote: 'Desenhos feitos com IA e retocados à mão · Escrituras traduzidas de novo', colo: [['Publicado', 'Novembro de 2026'], ['Editor', '김성수<small>Diácono da igreja 새로남, Daejeon</small>'], ['Feito por', 'SSSOFT'], ['Distribuído por', '<span class="bk-blank"></span><small>Igrejas e grupos que o compartilharem podem escrever aqui o nome ou carimbar</small>']] },
  fr: { app: 'Le Chemin', talkH: 'Questions pour échanger', memo: 'Notes', talk: ['Où suis-je aujourd’hui : sur le chemin qui monte, ou devant le Dieu qui est descendu ?', 'Que pensez-vous quand vous entendez « toutes les religions se valent » ?', 'Quelqu’un a-t-il déjà couru vers vous le premier, comme le père de l’histoire ?', 'Dans l’histoire du juge, que vous inspire l’idée que la justice et l’amour se rejoignent ?', 'Y a-t-il une chose que vous n’avez comprise qu’après avoir fait confiance et fait un pas ?', 'Quelle église pourriez-vous visiter cette semaine, et avec qui aimeriez-vous y aller ?'], back: ['Une famille vous attend', 'Jésus ne vous laisse pas marcher seul. Ce dimanche, frappez à la porte d’une église près de chez vous.'], qr: ['Le Chemin — parcours bibliques sur la carte', 'Lire ceci sur votre téléphone', 'Les pas de Jésus', 'GoodNews — l’Évangile en quatre scènes'], coverFoot: 'Une comparaison en images et en schémas', bnote: 'Images créées avec l’IA et retouchées à la main · Écritures traduites à nouveau', colo: [['Publié', 'Novembre 2026'], ['Éditeur', '김성수<small>Diacre à l’église 새로남 de Daejeon</small>'], ['Réalisé par', 'SSSOFT'], ['Diffusé par', '<span class="bk-blank"></span><small>Les Églises et groupes qui le partagent peuvent inscrire ici leur nom ou apposer leur tampon</small>']] },
  id: { app: 'Sang Jalan', talkH: 'Pertanyaan untuk dibicarakan', memo: 'Catatan', talk: ['Di mana saya berdiri sekarang: di jalan yang mendaki, atau di hadapan Allah yang turun?', 'Apa yang terpikir ketika mendengar "semua agama sama saja"?', 'Pernahkah seseorang berlari lebih dulu kepada Anda, seperti sang ayah dalam cerita itu?', 'Dalam cerita hakim, bagaimana kedengarannya bahwa keadilan dan kasih bertemu?', 'Adakah sesuatu yang baru Anda pahami setelah percaya dan melangkah?', 'Gereja mana yang bisa Anda kunjungi minggu ini, dan dengan siapa Anda ingin pergi?'], back: ['Ada keluarga yang menanti Anda', 'Yesus tidak membiarkan Anda berjalan sendirian. Hari Minggu ini, ketuklah pintu gereja di dekat Anda.'], qr: ['Sang Jalan — perjalanan Alkitab di atas peta', 'Baca ini di ponsel', 'Jejak langkah Yesus', 'GoodNews — Injil dalam empat adegan'], coverFoot: 'Perbandingan dalam gambar dan bagan', bnote: 'Gambar dibuat dengan AI dan dirapikan dengan tangan · Firman diterjemahkan ulang', colo: [['Terbit', 'November 2026'], ['Penerbit', '김성수<small>Diaken gereja 새로남, Daejeon</small>'], ['Dibuat oleh', 'SSSOFT'], ['Dibagikan oleh', '<span class="bk-blank"></span><small>Gereja atau kelompok yang membagikannya dapat menulis nama atau memberi cap di sini</small>']] },
  ja: { app: 'その道', talkH: '分かち合いのための問い', memo: 'メモ', talk: ['わたしはいま、「登っていく道」と「降りてこられた神」のどちらの前に立っているでしょうか。', '「宗教はみな同じ」という言葉を聞くと、どんなことを思いますか。', '放蕩息子の父のように、先に駆け寄ってくれた人がいましたか。', '裁判官の話で、正義と愛が共に成し遂げられるということは、どう聞こえますか。', '信じて一歩踏み出してから、はじめて分かったことがありますか。', '今週行ってみることのできる教会はどこですか。だれと一緒に行きたいですか。'], back: ['あなたを待っている家族があります', 'イエスはあなたをひとりで歩かせません。この日曜日、近くの教会の扉をたたいてみてください。'], qr: ['その道 — 地図の上を歩く聖書の旅', 'この文をスマートフォンで', 'イエスの足跡', 'GoodNews — 四つの場面で聞く福音'], coverFoot: '絵と図で見比べる話', bnote: '絵はAIで作り人の手で整えました・聖書の言葉は新しく訳した文です', colo: [['発行日', '2026年11月'], ['発行者', '김성수<small>大田セロナム教会 執事</small>'], ['制作', 'SSSOFT'], ['配布', '<span class="bk-blank"></span><small>配布する教会や団体は、ここに名前を書くか印を押してください</small>']] },
  zh: { app: '那条路', talkH: '一起分享的问题', memo: '笔记', talk: ['我现在站在哪里：是在“向上攀登的路”上，还是在“降卑而来的神”面前？', '听到“所有宗教都一样”这句话，你会怎么想？', '有没有人像浪子的父亲那样，先向你跑来？', '在法官的故事里，公义与慈爱一同成就，这话在你听来如何？', '有没有什么事，是你信了并迈出一步之后才明白的？', '这周你可以去哪一间教会？你想和谁一起去？'], back: ['有一个家在等着你', '耶稣不会让你独自行走。这个主日，去敲一敲附近教会的门吧。'], qr: ['那条路 — 在地图上走圣经的路', '用手机读这篇文章', '耶稣的足迹', 'GoodNews — 用四个场景讲福音'], coverFoot: '用图画和图表来比较', bnote: '图画由AI生成并经人工修饰 · 经文为重新翻译', colo: [['出版日期', '2026年11月'], ['出版人', '김성수<small>大田新路南教会 执事</small>'], ['制作', 'SSSOFT'], ['分发', '<span class="bk-blank"></span><small>分发此书的教会或团体可在此写上名称或盖章</small>']] },
};
const t = { ...T.en, ...(T[lang] || {}) };
t.url = SITE.replace(/^https:\/\//, ''); // 뒤표지 QR 아래에 적는 누리집 주소 (브라우저 안에서 쓰므로 t에 실어 보낸다)
t.toc = { ko: '차례', en: 'Contents', es: 'Índice', pt: 'Sumário', fr: 'Sommaire', id: 'Daftar Isi', ja: '目次', zh: '目录' }[lang] || 'Contents';
// 뒤표지 QR: 그 길 첫 화면 · 이 글 · 예수 여정 · GoodNews
const qrs = [`${SITE}/?lang=${lang}`].map(qr); // QR이 넷이면 어수선했다(사용자, 2026-11) — 그 길 첫 화면 하나만, 대신 시리즈를 보여 준다
// 뒤표지의 '그 길 시리즈': 랜딩과 같은 카드(land.json — 제목·설명·아이콘)를 그 언어로
{ const land = JSON.parse(readFileSync('land.json', 'utf8')), U = land.ui[lang] || land.ui.en;
  t.seriesH = U.seriesHead || '';
  t.series = land.cards.map(c => ({ icon: c.icon || (c.id === 'jesus' ? 'assets/icon.svg' : `j/${c.id}/icon.svg`), h: U[c.title] || c.title, d: U[c.desc] || c.desc })); }

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 560, height: 800 } });
await p.goto(`${process.env.SITE_URL || 'http://localhost:8765'}/${page}`, { waitUntil: 'networkidle' }); // SITE_URL: 다른 곳에 띄운 사본(작업 폴더)으로 뽑을 때
await p.evaluate(({ t, qrs }) => {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  // 화면에만 있는 것: 위 메뉴, 음악 단추, 끝의 단추·꼬리말, 앱으로 가는 링크
  $$('.why-top, #bgm, script, .end, .dl, .vid').forEach(e => e.remove());
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
  // 차례: 장(작은 이름표 + 제목)과 '그다음 이야기', 나눔 물음. 쪽 번호는 한 번 뽑은 PDF에서 찾아 나중에 채운다 (사용자, 2026-11)
  const items = [];
  $$('main.why > section, main.why > .part').forEach(sec => {
    if (sec.classList.contains('part')) { items.push({ part: sec.querySelector('span')?.textContent || '', h: sec.querySelector('h2').innerText.replace(/\s+/g, ' ') }); return; }
    const h = sec.querySelector(':scope > h2'), sm = sec.querySelector(':scope > small'); if (h) items.push({ lb: sm?.textContent || '', h: h.textContent });
  });
  items.push({ lb: '', h: t.talkH });
  const toc = document.createElement('div'); toc.className = 'bk-toc';
  const row = (it, i, two) => `<li><span class="lb">${two ? it.lb.split(/[·\s]+/).pop() : it.lb}</span><span class="tt">${it.h}</span><span class="pg" data-i="${i}"></span></li>`;
  const k = items.findIndex(it => it.part), z = items.length - 1;
  toc.innerHTML = `<p class="bk-tt">${t.toc}</p>
    <div class="bk-tp"><span>${h1.textContent}</span></div><ol>${items.slice(0, k).map((it, i) => row(it, i)).join('')}</ol>
    <div class="bk-tp"><span>${items[k].part}</span><em class="pg" data-i="${k}"></em></div><ol>${items.slice(k + 1, z).map((it, i) => row(it, k + 1 + i, true)).join('')}</ol>
    <ol class="bk-tend"><li><span class="lb">✎</span><span class="tt">${items[z].h}</span><span class="pg" data-i="${z}"></span></li></ol>`;
  cover.after(toc); window.__toc = items.map(it => it.h);
  // 뒤표지: 교회로 초대 + QR 셋 + 출처
  const last = main.querySelector('.card.warm[style*="margin-top:48px"]') || [...main.querySelectorAll('.card.warm')].pop();
  last?.remove();
  const back = document.createElement('div'); back.className = 'bk-back';
  back.innerHTML = `<p class="motto">${t.back[0]}</p><p class="bk-inv">${t.back[1]}</p>
    <p class="bk-sh">${t.seriesH}</p>
    <ul class="bk-series">${t.series.map(c => `<li><img src="${c.icon}" alt=""><span><b>${c.h}</b><small>${c.d}</small></span></li>`).join('')}</ul>
    <div class="bk-qr1">${qrs[0]}<p><b>${t.url}</b><span>${t.qr[0]}</span></p></div>`; // 도메인을 정해(thewaymap.org, 2026-11) QR 아래에 주소도 적는다 — 휴대폰 카메라가 없어도 칠 수 있게
  // 판권면: 제목·펴낸 날·펴낸이·만든 곳·펴낸 곳 (누리집 주소는 뒤표지 QR 아래에) (뒤표지 바로 앞, 아래쪽에 모은다)
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
  .bk-cover h1{font-size:34pt;letter-spacing:.04em;margin:0 0 5mm;text-wrap:balance} /* 일본어 제목이 마지막 한 글자만 다음 줄로 넘어갔다 — 두 줄을 고르게 */
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
  .bk-toc{break-before:page;break-after:page;padding:10mm 4mm 0}
  .why .bk-tt{text-align:center;font-family:var(--serif);font-size:19pt!important;letter-spacing:.35em;color:var(--gold2);margin:0 0 2mm!important}
  .bk-tt::after{content:'';display:block;width:10mm;height:.6mm;border-radius:1mm;background:var(--gold);opacity:.55;margin:4mm auto 0}
  .bk-tp{display:flex;align-items:baseline;gap:3mm;margin:9mm 0 2.5mm;font-size:8pt;letter-spacing:.18em;color:var(--gold2);font-weight:700}
  .bk-tp::after{content:'';order:1;flex:1;height:0;border-top:.3mm solid #ecd9cc;align-self:center}
  .bk-tp em{order:2;font-style:normal;font-weight:400;letter-spacing:0}
  .bk-toc ol{list-style:none;margin:0;padding:0}
  .bk-toc li{display:grid;grid-template-columns:13mm 1fr auto;align-items:baseline;gap:2mm;padding:1.7mm 0}
  .bk-toc .lb{font-size:7.4pt;color:var(--faint);letter-spacing:.06em}
  .bk-toc .tt{font-family:var(--serif);font-size:10.4pt;color:#2b2620;line-height:1.45}
  .bk-toc .pg{font-size:8.6pt;color:var(--gold2);font-variant-numeric:tabular-nums}
  .bk-tend{margin-top:7mm!important;padding-top:3mm!important;border-top:.3mm solid #ecd9cc!important}
  .bk-tend .lb{color:var(--gold)}
  .bk-back{break-before:page;text-align:center;padding:${22 + BL}mm ${12 + BL}mm 0}
  .why .bk-bnote{margin:5mm 0 0!important;text-align:left;white-space:nowrap;font-size:6pt!important;line-height:1.55!important;color:#bdb3a3!important} /* 안내는 눈에 띌 필요 없다 — 작고 옅게 (2026-11 사용자) */
  .bk-back .motto{font-size:17pt;margin:0 0 4mm}
  .bk-inv{color:var(--muted);margin:0 0 10mm!important}
  .bk-sh{font-family:var(--serif);font-size:12pt!important;letter-spacing:.3em;color:var(--gold2);margin:0 0 4mm!important}
  .bk-series{list-style:none;margin:0 0 9mm;padding:0;display:grid;grid-template-columns:repeat(3,1fr);gap:3.2mm 3mm;text-align:left}
  .bk-series li{display:flex;gap:2mm;align-items:flex-start;margin:0!important}
  .bk-series img{width:8.5mm;height:8.5mm;border-radius:2mm;flex:none}
  .bk-series b{display:block;font-family:var(--serif);font-size:8.6pt;color:#2b2620;line-height:1.3}
  .bk-series small{display:block;font-size:6.4pt;line-height:1.4;color:var(--muted)}
  .bk-qr1{display:flex;flex-direction:column;align-items:center;gap:3mm} /* QR을 정중앙에, 주소·설명은 그 아래 — 옆에 두니 묶음만 가운데라 QR이 왼쪽으로 치우쳐 보였다(사용자) */
  .bk-qr1 svg{width:24mm;height:24mm;background:#fff;border-radius:2mm;padding:1.5mm}
  .bk-qr1 p{margin:0!important;text-align:center}
  .bk-qr1 b{display:block;font:700 13pt var(--sans, sans-serif);letter-spacing:.04em;color:#2b2620}
  .bk-qr1 span{display:block;font-size:8pt;color:var(--muted);margin-top:1mm}
  .bk-qr{display:grid;grid-template-columns:repeat(4,1fr);gap:4mm;margin:0 0 16mm}
  .bk-qr figure{margin:0}
  .bk-qr svg{width:24mm;height:24mm;display:block;margin:0 auto 2mm;background:#fff;border-radius:2mm;padding:1.5mm}
  .bk-url{margin:-10mm 0 12mm;text-align:center;font:600 11pt var(--sans, sans-serif);letter-spacing:.06em;color:var(--ink, #2b2620)}
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
{ // 차례 쪽 번호 채우기 — 번호만 바뀌어 쪽 나눔은 그대로다
  const heads = await p.evaluate(() => window.__toc), norm = x => x.replace(/\s+/g, '');
  const texts = []; for (let i = 1; i <= pages(); i++) texts.push(norm(execFileSync('pdftotext', ['-f', String(i), '-l', String(i), out, '-']).toString()));
  const nums = heads.map(h => { const k = texts.findIndex((x, i) => i > 1 && x.includes(norm(h))); return k < 0 ? '' : k + 1; });
  await p.evaluate(nums => document.querySelectorAll('.bk-toc .pg').forEach(e => { e.textContent = nums[+e.dataset.i]; }), nums);
  await pdf();
}
await b.close();
// 마무리: 쪽 번호(표지 빼고), 인쇄용이면 재단선(코너 표시)을 단 큰 종이 위에 올린다
execFileSync('python3', ['_src/tools/bookfinish.py', out, out, String(BL), ...(PRINT ? ['--marks'] : [])]);
console.log('ok', out, pages() + '쪽');

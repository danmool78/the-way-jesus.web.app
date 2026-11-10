// 여정마다 짧은 공유 주소(/moses)와 미리보기 카드 (첫 주소 /는 여정을 고르는 랜딩 index.html, 앱은 app.html): 카톡·문자는 주소를 받으면 그 페이지의 og 정보로 카드를 만드는데,
// 앱은 index.html 하나라 ?j=moses를 보내도 예수 여정의 카드가 떴다. 그래서 여정마다 og만 담은 작은 페이지(<여정>/index.html)를 두고,
// 열면 곧바로 앱(/?j=<여정>)으로 넘긴다. 미리보기 그림 j/<여정>/og.jpg(1200×630)도 예수 여정의 assets/og.jpg와 같은 꼴로 그린다.
// 사용: node _src/tools/share.mjs [moses …]   (없으면 아래 표의 모든 여정)
import { writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const SITE = 'https://the-way-jesus.web.app';
// sub: 그림의 둘째 줄, foot: 셋째 줄, title·desc: 미리보기 카드의 제목·설명, c: 테마색(밝은 빛, 해, 짙은 테두리 — icons.mjs와 같게)
const J = {
  jesus: { title: '그 길 — 예수의 발자취', desc: '지도 위를 걸으며 예수의 생애를 생생한 장면으로 만나 보세요.', og: 'assets/og.jpg' }, // 그림은 처음 만든 것 그대로
  moses: { title: '그 길 — 모세와 여호수아', sub: '출애굽에서 약속의 땅까지', foot: '지도 위 40개 장면 · 낭독 · 3D 무대',
    desc: '지도 위를 걸으며 출애굽에서 약속의 땅까지, 모세와 여호수아의 길을 만나 보세요.', c: ['#fbe0c8', '#dc8f5f', '#a65a33'] },
  david: { title: '그 길 — 다윗', sub: '목동에서 왕으로', foot: '지도 위 39개 장면 · 낭독 · 3D 무대 · 시편 노래',
    desc: '베들레헴 들판의 목동이 엘라 골짜기와 광야의 굴을 지나 예루살렘의 왕이 되기까지. 지도 위에서 다윗의 길을 걷고 그 자리의 시편을 노래로 들어 보세요.', c: ['#eef3d2', '#a9bf6a', '#6f8638'] },
  psalms: { title: '그 길 — 시편', sub: '노래가 태어난 자리를 따라', foot: '지도 위 62편 · 노래와 가사',
    desc: '광야와 굴, 왕궁과 성전, 바벨론 강가까지 — 시편이 불린 자리를 지도 위에서 따라가며 노래로 들어 보세요.', c: ['#e0f4f0', '#5fb3a5', '#2f7d70'] },
  proverbs: { title: '그 길 — 잠언', sub: '지혜를 따라 걷는 하루', foot: '솔로몬 때 예루살렘 · 낭독 · 3D 거리 무대',
    desc: '솔로몬 때 예루살렘의 성문과 장터를 사람 눈높이로 걸으며 잠언의 지혜를 들어 보세요.', c: ['#fbe6ef', '#d98fb0', '#a2547a'] },
  goodnews: { title: '그 길 — GoodNews (복음)', sub: '네 장면으로 듣는 복음', foot: '에덴에서 골고다, 그리고 당신에게까지',
    desc: '하나님의 사랑, 죄와 단절, 예수 그리스도, 믿음의 응답. 지도 위 네 장면으로 복음을 만나 보세요.', c: ['#fbe1db', '#e0877a', '#a84a3f'] },
};
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const ids = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(J);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
// 첫 화면(시리즈 고르기, 맨 첫 주소)의 미리보기 그림: 금빛 해와 '그 길', 시리즈의 여정들 (index.html의 og)
const HUB = { sub: '지도 위에서 걷는 성경의 길', foot: '예수 · 모세와 여호수아 · 다윗 · 열왕기 · 바울', c: ['#fcebbb', '#e6c275', '#b1823a'], icon: 'assets/icon.svg', out: 'assets/og-series.jpg' };
async function card(j, iconFile, out) {
  const icon = (await import('node:fs')).readFileSync(iconFile, 'utf8').replace(/<rect[^>]*\/>/, '');
  await p.setContent(`<link href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&family=Noto+Sans+KR:wght@400&display=swap" rel="stylesheet">
  <style>html,body{margin:0;width:1200px;height:630px;overflow:hidden}
  body{background:radial-gradient(ellipse 60% 75% at 26% 45%,#3a2a1c,#1e1712 60%,#14100c);display:flex;align-items:center;gap:66px;padding-left:224px;box-sizing:border-box;font-family:'Gowun Batang',serif}
  .sun{width:182px;height:182px;border-radius:50%;box-shadow:0 0 70px 14px ${j.c[1]}55;flex:none;overflow:hidden}.sun svg{width:182px;height:182px;transform:scale(1.48)}
  h1{margin:0;font-size:104px;letter-spacing:.38em;color:${j.c[0]};font-weight:700;line-height:1.1}
  h2{margin:26px 0 0;font-size:36px;color:${j.c[1]};font-weight:400}
  p{margin:30px 0 0;font:400 24px 'Noto Sans KR',sans-serif;color:#cfc3b2;letter-spacing:.02em}</style>
  <div class="sun">${icon}</div><div><h1>그 길</h1><h2>${esc(j.sub)}</h2><p>${esc(j.foot)}</p></div>`);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(800);
  await p.screenshot({ path: out, type: 'jpeg', quality: 88 });
}
if (!process.argv.slice(2).length) { await card(HUB, HUB.icon, HUB.out); console.log('hub ok'); }
for (const id of ids) {
  const j = J[id];
  mkdirSync(id, { recursive: true });
  const og = j.og || `j/${id}/og.jpg`;
  if (!j.og) { mkdirSync(`j/${id}`, { recursive: true }); await card(j, `j/${id}/icon.svg`, og); } // 여정 색의 해와 길, 오른쪽에 글 (assets/og.jpg와 같은 짜임)
  // 공유 주소의 페이지: og만 담고 곧바로 앱으로 (뒤로 가기에 이 페이지가 남지 않게 replace, #장면은 이어 붙인다)
  const app = `/app.html?j=${id}`;
  writeFileSync(`${id}/index.html`, `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<!-- _src/tools/share.mjs가 만든다 (직접 고치지 말 것): 이 여정의 공유 주소와 미리보기 카드 -->
<title>${esc(j.title)}</title>
<meta name="description" content="${esc(j.desc)}">
<link rel="canonical" href="${SITE}${app}">
<meta property="og:type" content="website">
<meta property="og:url" content="${SITE}/${id}">
<meta property="og:title" content="${esc(j.title)}">
<meta property="og:description" content="${esc(j.desc)}">
<meta property="og:image" content="${SITE}/${og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/${id === 'jesus' ? 'assets' : `j/${id}`}/icon.svg" type="image/svg+xml">
<meta http-equiv="refresh" content="0; url=${app}">
<script>location.replace('${app}' + location.hash)</script>
</head>
<body style="background:#16120e;color:#e8dcc8;font-family:sans-serif"><p><a href="${app}" style="color:#e6c275">${esc(j.title)}</a></p></body>
</html>
`);
  console.log(id, 'ok');
}
await b.close();

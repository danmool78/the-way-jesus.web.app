// 여정마다 짧은 공유 주소(/moses)와 미리보기 카드: 카톡·문자는 주소를 받으면 그 페이지의 og 정보로 카드를 만드는데,
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
  moses: { title: '그 길 — 모세와 여호수아', sub: '출애굽에서 약속의 땅까지', foot: '지도 위 40개 장면 · 낭독 · 3D 무대',
    desc: '지도 위를 걸으며 출애굽에서 약속의 땅까지, 모세와 여호수아의 길을 만나 보세요.', c: ['#fbe0c8', '#dc8f5f', '#a65a33'] },
  goodnews: { title: '그 길 — GoodNews (복음)', sub: '네 장면으로 듣는 복음', foot: '에덴에서 골고다, 그리고 당신에게까지',
    desc: '하나님의 사랑, 죄와 단절, 예수 그리스도, 믿음의 응답. 지도 위 네 장면으로 복음을 만나 보세요.', c: ['#fbe1db', '#e0877a', '#a84a3f'] },
};
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const ids = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(J);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
for (const id of ids) {
  const j = J[id];
  mkdirSync(`j/${id}`, { recursive: true }); mkdirSync(id, { recursive: true });
  // 미리보기 그림: 왼쪽에 여정 색의 해와 길, 오른쪽에 글 (assets/og.jpg와 같은 짜임)
  const icon = (await import('node:fs')).readFileSync(`j/${id}/icon.svg`, 'utf8').replace(/<rect[^>]*\/>/, '');
  await p.setContent(`<link href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&family=Noto+Sans+KR:wght@400&display=swap" rel="stylesheet">
  <style>html,body{margin:0;width:1200px;height:630px;overflow:hidden}
  body{background:radial-gradient(ellipse 60% 75% at 26% 45%,#3a2a1c,#1e1712 60%,#14100c);display:flex;align-items:center;gap:66px;padding-left:224px;box-sizing:border-box;font-family:'Gowun Batang',serif}
  .sun{width:182px;height:182px;border-radius:50%;box-shadow:0 0 70px 14px ${j.c[1]}55;flex:none;overflow:hidden}.sun svg{width:182px;height:182px;transform:scale(1.48)}
  h1{margin:0;font-size:104px;letter-spacing:.38em;color:${j.c[0]};font-weight:700;line-height:1.1}
  h2{margin:26px 0 0;font-size:36px;color:${j.c[1]};font-weight:400}
  p{margin:30px 0 0;font:400 24px 'Noto Sans KR',sans-serif;color:#cfc3b2;letter-spacing:.02em}</style>
  <div class="sun">${icon}</div><div><h1>그 길</h1><h2>${esc(j.sub)}</h2><p>${esc(j.foot)}</p></div>`);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(800);
  await p.screenshot({ path: `j/${id}/og.jpg`, type: 'jpeg', quality: 88 });
  // 공유 주소의 페이지: og만 담고 곧바로 앱으로 (뒤로 가기에 이 페이지가 남지 않게 replace, #장면은 이어 붙인다)
  const app = `/?j=${id}`;
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
<meta property="og:image" content="${SITE}/j/${id}/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/j/${id}/icon.svg" type="image/svg+xml">
<meta http-equiv="refresh" content="0; url=${app}">
<script>location.replace('${app}' + location.hash)</script>
</head>
<body style="background:#16120e;color:#e8dcc8;font-family:sans-serif"><p><a href="${app}" style="color:${j.c[1]}">${esc(j.title)}</a></p></body>
</html>
`);
  console.log(id, 'ok');
}
await b.close();

// 방문 수를 Cloudflare Web Analytics에서 받아 JSON으로 적는다 — 관리자 페이지(admin.html) 위쪽에 띄우려고 (대시보드에 안 가도 보게, 사용자)
// GitHub Actions(.github/workflows/visits.yml)가 매일 돌려 stats 가지(배포되지 않는 따로 떨어진 가지)의 visits.json에 올린다.
// 열쇠: CF_API_TOKEN(Account Analytics: Read 하나만), CF_ACCOUNT_ID — GitHub 비밀값에만 둔다
// Run: CF_API_TOKEN=… CF_ACCOUNT_ID=… node _src/tools/visits.mjs <출력.json>
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
const SITE = 'f33dcbc61cc949909499f044d7eeae69'; // 페이지에 넣은 비컨의 사이트 표시(공개값)
const { CF_API_TOKEN: TOKEN, CF_ACCOUNT_ID: ACCOUNT } = process.env;
if (!TOKEN || !ACCOUNT) { console.error('CF_API_TOKEN, CF_ACCOUNT_ID가 필요합니다'); process.exit(1); }
const out = process.argv[2] || 'visits.json';
const day = d => d.toISOString().slice(0, 10);
const now = new Date(), from = new Date(now - 29 * 864e5); // 오늘 포함 30일

// 묶음 하나: dims로 나눠 방문(visits)·페이지 보기(count)를 센다. bot: 0 — 알려진 로봇은 뺀다
const group = (name, dims, limit, order = 'sum_visits_DESC') =>
  `${name}: rumPageloadEventsAdaptiveGroups(limit: ${limit}, orderBy: [${order}], filter: $f) { count sum { visits } dimensions { ${dims} } }`;
const query = `query ($a: string!, $f: AccountRumPageloadEventsAdaptiveGroupsFilter_InputObject) {
  viewer { accounts(filter: { accountTag: $a }) {
    ${group('days', 'date', 40, 'date_ASC')}
    ${group('paths', 'requestPath', 15)}
    ${group('countries', 'countryName', 40)}
    ${group('referers', 'refererHost', 15)}
    ${group('devices', 'deviceType', 5)}
  } } }`;
const variables = { a: ACCOUNT, f: { AND: [{ date_geq: day(from), date_leq: day(now) }, { siteTag: SITE }, { bot: 0 }] } };

const r = await fetch('https://api.cloudflare.com/client/v4/graphql', {
  method: 'POST', headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ query, variables }) });
const j = await r.json();
if (!r.ok || j.errors?.length) { console.error('Cloudflare:', r.status, JSON.stringify(j.errors || j).slice(0, 600)); process.exit(1); }
const acc = j.data.viewer.accounts[0] || {};
const row = (g, k) => [g.dimensions[k] || '(없음)', g.sum.visits, g.count];
const stats = {
  updated: now.toISOString(),
  days: (acc.days || []).map(g => ({ date: g.dimensions.date, visits: g.sum.visits, views: g.count })),
  paths: (acc.paths || []).map(g => row(g, 'requestPath')),
  countries: (acc.countries || []).map(g => row(g, 'countryName')),
  referers: (acc.referers || []).map(g => row(g, 'refererHost')),
  devices: (acc.devices || []).map(g => row(g, 'deviceType')),
};

// 여정·장면별 (앱이 Worker /hit로 보낸 기록, Analytics Engine theway_hits) — 쓰는 열쇠는 같은 CF_API_TOKEN(Account Analytics: Read)
// blob1 종류(open|scene) · blob2 여정 · blob3 장면 · blob4 언어 · blob5 나라 코드. 표본으로 줄여 담을 수 있어 _sample_interval을 더한다
const sql = async q => {
  const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/analytics_engine/sql`, { method: 'POST', headers: { Authorization: `Bearer ${TOKEN}` }, body: q });
  const t = await r.text(); if (!r.ok) throw new Error(`${r.status} ${t.slice(0, 300)}`);
  return JSON.parse(t).data.map(x => ({ ...x, n: Number(x.n) }));
};
const W = `FROM theway_hits WHERE timestamp > NOW() - INTERVAL '30' DAY`;
try {
  const opens = await sql(`SELECT blob2 AS j, blob5 AS c, SUM(_sample_interval) AS n ${W} AND blob1 = 'open' GROUP BY j, c ORDER BY n DESC LIMIT 2000`);
  const scenes = await sql(`SELECT blob2 AS j, blob3 AS s, SUM(_sample_interval) AS n ${W} AND blob1 = 'scene' GROUP BY j, s LIMIT 5000`);
  const langs = await sql(`SELECT blob4 AS l, SUM(_sample_interval) AS n ${W} AND blob1 = 'open' GROUP BY l ORDER BY n DESC LIMIT 20`);
  // 장면 이름과 차례는 저장소의 data에서 (관리자 페이지가 여정마다 data를 받지 않게)
  const order = j => { const f = j === 'jesus' ? 'data.json' : `j/${j}/data.json`; if (!existsSync(f)) return [];
    const d = JSON.parse(readFileSync(f, 'utf8')); return [...(d.prologue ? [d.prologue] : []), ...d.events].map(e => [e.id, e.title]); };
  const ids = [...new Set(opens.map(x => x.j))];
  stats.journeys = ids.map(j => {
    const mine = opens.filter(x => x.j === j), got = Object.fromEntries(scenes.filter(x => x.j === j).map(x => [x.s, x.n]));
    return { id: j, opens: mine.reduce((t, x) => t + x.n, 0), countries: mine.map(x => [x.c, x.n]),
      scenes: order(j).map(([id, title]) => [id, title, got[id] || 0]) };
  }).sort((a, b) => b.opens - a.opens);
  stats.langs = langs.map(x => [x.l || '(없음)', x.n]);
} catch (e) { console.warn('::warning::여정별 기록을 읽지 못함 —', e.message); }
writeFileSync(out, JSON.stringify(stats, null, 1) + '\n');
const sum = stats.days.reduce((s, d) => s + d.visits, 0);
console.log(`visits: 30일 방문 ${sum}, ${stats.days.length}일 → ${out}`);

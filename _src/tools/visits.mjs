// 방문 수를 Cloudflare Web Analytics에서 받아 JSON으로 적는다 — 관리자 페이지(admin.html) 위쪽에 띄우려고 (대시보드에 안 가도 보게, 사용자)
// GitHub Actions(.github/workflows/visits.yml)가 매일 돌려 stats 가지(배포되지 않는 따로 떨어진 가지)의 visits.json에 올린다.
// 열쇠: CF_API_TOKEN(Account Analytics: Read 하나만), CF_ACCOUNT_ID — GitHub 비밀값에만 둔다
// Run: CF_API_TOKEN=… CF_ACCOUNT_ID=… node _src/tools/visits.mjs <출력.json>
import { writeFileSync } from 'node:fs';
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
    ${group('countries', 'countryName', 15)}
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
writeFileSync(out, JSON.stringify(stats, null, 1) + '\n');
const sum = stats.days.reduce((s, d) => s + d.visits, 0);
console.log(`visits: 30일 방문 ${sum}, ${stats.days.length}일 → ${out}`);

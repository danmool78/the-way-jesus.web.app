// 그 길 관리자 Worker (Cloudflare): 관리자 페이지(admin.html)가 GitHub 토큰·R2 열쇠 없이 '구글로 로그인'만으로 고치고 올리게 한다.
// 컴퓨터마다 복잡한 토큰을 넣어야 했다(사용자) — 열쇠는 이 Worker에만 두고, 로그인한 사람이 허락된 구글 계정일 때만 대신 쓴다.
//   GET/PUT/… /gh/<GitHub API 경로>  → 이 저장소에 한해 api.github.com으로 (열쇠: GH_TOKEN 비밀값)
//   PUT /r2/psalms/<파일>            → R2 버킷 theway에 바로 (BUCKET 연결 — 열쇠 필요 없음)
// 로그인 확인: Firebase 인증(프로젝트 the-way-jesus)의 ID 토큰을 구글 공개 열쇠로 검증하고, 이메일의 SHA-256이 ALLOWED에 있는지 본다
// (이메일을 저장소에 그대로 적지 않으려고 해시로). 올리기: .github/workflows/worker.yml
const PROJECT = 'the-way-jesus', REPO = 'danmool78/the-way-jesus.web.app';
const ORIGINS = ['https://thewaymap.org', 'https://www.thewaymap.org', 'https://the-way-jesus.web.app', 'https://the-way-jesus.firebaseapp.com'];
const JWKS = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';

const b64url = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), c => c.charCodeAt(0));
const hex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
let keys = null, keysAt = 0;
async function verify(token, env) {
  const [h, p, sig] = (token || '').split('.');
  if (!sig) throw new Error('no token');
  const head = JSON.parse(new TextDecoder().decode(b64url(h))), body = JSON.parse(new TextDecoder().decode(b64url(p)));
  if (!keys || Date.now() - keysAt > 3600e3) { keys = (await (await fetch(JWKS)).json()).keys; keysAt = Date.now(); }
  const jwk = keys.find(k => k.kid === head.kid);
  if (head.alg !== 'RS256' || !jwk) throw new Error('bad key');
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  if (!await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64url(sig), new TextEncoder().encode(`${h}.${p}`))) throw new Error('bad signature');
  const now = Date.now() / 1000;
  if (body.aud !== PROJECT || body.iss !== `https://securetoken.google.com/${PROJECT}` || body.exp < now || body.iat > now + 60) throw new Error('bad claims');
  if (!body.email || !body.email_verified) throw new Error('no email');
  const h256 = hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(body.email.trim().toLowerCase())));
  if (!(env.ALLOWED || '').split(',').map(s => s.trim()).includes(h256)) throw Object.assign(new Error('not allowed'), { status: 403 });
  return body.email;
}

export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || '';
    const cors = { 'Access-Control-Allow-Origin': ORIGINS.includes(origin) || /^http:\/\/localhost(:\d+)?$/.test(origin) ? origin : ORIGINS[0],
      // 허용 머리말: 관리자 페이지가 GitHub에 보내던 그대로 — X-GitHub-Api-Version이 빠져 브라우저가 요청을 막았다(Failed to fetch)
      'Access-Control-Allow-Methods': 'GET, PUT, POST, PATCH, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Authorization, Content-Type, Accept, X-GitHub-Api-Version', 'Access-Control-Max-Age': '86400', Vary: 'Origin' };
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
    const url = new URL(req.url);
    try { await verify((req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, ''), env); }
    catch (e) { return json({ message: e.status === 403 ? '허락된 계정이 아닙니다' : '로그인이 필요합니다' }, e.status || 401); }

    if (url.pathname.startsWith('/gh/')) {
      const path = url.pathname.slice(3);
      // 이 저장소와 '나' 정보만 (Worker가 다른 저장소를 건드리지 않게)
      if (!(path === '/user' || path === `/repos/${REPO}` || path.startsWith(`/repos/${REPO}/`))) return json({ message: 'forbidden path' }, 403);
      const r = await fetch(`https://api.github.com${path}${url.search}`, { method: req.method,
        headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${env.GH_TOKEN}`, 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'theway-admin-worker', ...(req.body ? { 'Content-Type': 'application/json' } : {}) },
        body: ['GET', 'HEAD'].includes(req.method) ? undefined : await req.text() });
      return new Response(r.body, { status: r.status, headers: { ...cors, 'Content-Type': r.headers.get('Content-Type') || 'application/json' } });
    }
    if (url.pathname.startsWith('/r2/') && req.method === 'PUT') {
      const key = decodeURIComponent(url.pathname.slice(4));
      if (!/^psalms\/[\w.-]+\.(mp3|m4a)$/.test(key)) return json({ message: 'bad key' }, 400);
      // 노래는 mp4(AAC, .m4a)로도 올린다 — 일시정지 뒤 위치가 정확하다
      await env.BUCKET.put(key, req.body, { httpMetadata: { contentType: key.endsWith('.m4a') ? 'audio/mp4' : 'audio/mpeg' } });
      return json({ ok: true, key });
    }
    return json({ message: 'not found' }, 404);
  },
};

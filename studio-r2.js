// 시편 노래 작업실(studio.js)이 노래를 Cloudflare R2에 바로 올릴 때 쓰는 서명. 버킷 theway, 공개 주소로 스트리밍한다
export const R2 = { account: '70b5783f686d3f01f4f0e1df1ea021d7', bucket: 'theway', base: 'https://pub-7d2b46014d5b4769a48e210890df23c4.r2.dev', prefix: 'psalms/' };
/* ---------- R2에 올리기 (S3 서명 v4, 지역 auto — 다정 리딩북 lib/r2.mjs와 같은 계산을 브라우저 WebCrypto로) ---------- */
const hex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
export const sha256 = async data => hex(await crypto.subtle.digest('SHA-256', typeof data === 'string' ? new TextEncoder().encode(data) : data));
const hmac = async (key, data) => crypto.subtle.sign('HMAC', await crypto.subtle.importKey('raw', typeof key === 'string' ? new TextEncoder().encode(key) : key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']), new TextEncoder().encode(data));
const enc = (v, slash) => encodeURIComponent(v).replace(/[!'()*]/g, c => `%${c.charCodeAt(0).toString(16).toUpperCase()}`).replace(slash ? /%2F/g : /$^/, '/');
// 서명한 머리말을 돌려준다 (stamp를 주면 그 시각으로 — 시험용)
export async function r2Sign({ keyId, secret }, method, key, payloadHash, type, stamp = new Date().toISOString().replace(/[-:]|\.\d{3}/g, '')) {
  const host = `${R2.account}.r2.cloudflarestorage.com`, path = `/${R2.bucket}/${enc(key, true)}`, day = stamp.slice(0, 8), scope = `${day}/auto/s3/aws4_request`;
  const headers = { host, 'x-amz-content-sha256': payloadHash, 'x-amz-date': stamp, ...(type ? { 'content-type': type } : {}) };
  const names = Object.keys(headers).sort();
  const request = [method, path, '', ...names.map(n => `${n}:${String(headers[n]).trim()}`), '', names.join(';'), payloadHash].join('\n');
  const toSign = ['AWS4-HMAC-SHA256', stamp, scope, await sha256(request)].join('\n');
  let k = await hmac(`AWS4${secret}`, day); k = await hmac(k, 'auto'); k = await hmac(k, 's3'); k = await hmac(k, 'aws4_request');
  headers.authorization = `AWS4-HMAC-SHA256 Credential=${keyId}/${scope}, SignedHeaders=${names.join(';')}, Signature=${hex(await hmac(k, toSign))}`;
  delete headers.host;
  return { url: `https://${host}${path}`, headers };
}

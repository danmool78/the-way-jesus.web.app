// 시편 노래에 자리 표(Xing 헤더)를 붙인다: Suno가 만든 mp3는 가변 비트레이트(VBR)인데 Xing 헤더가 없어, 아이폰 사파리가 재생 위치를
// 어림으로 셈했다 — 일시정지했다 다시 틀면 소리와 앱이 아는 시각이 어긋나 가사 싱크가 틀어졌다(사용자, 2026-11).
// 다시 인코딩하지 않고(소리는 그대로) ffmpeg로 다시 담아 헤더만 붙여 R2에 새 이름으로 올리고, assets/psalms/<id>.json의 src·audio를 바꾼다.
// 이미 붙인 노래는 seek: true로 표시해 건너뛴다. 가사 시각(lines)·맞춘 방식(by)은 그대로 둔다 (소리가 같으므로).
// 쓰는 법(배포 작업): CLOUDFLARE_API_TOKEN·CLOUDFLARE_ACCOUNT_ID가 있을 때 node _src/tools/xing.mjs — wrangler로 R2 버킷 theway에 올린다
import { readFile, writeFile, readdir, mkdtemp } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const DIR = 'assets/psalms', BUCKET = 'theway', tmp = await mkdtemp(join(tmpdir(), 'xing-'));
let done = 0;
for (const f of (await readdir(DIR)).filter(f => f.endsWith('.json'))) {
  const p = join(DIR, f), info = JSON.parse(await readFile(p, 'utf8'));
  if (!info.src || info.seek) continue;
  const id = f.replace(/\.json$/, ''), base = info.src.slice(0, info.src.lastIndexOf('/psalms/'));
  try {
    const r = await fetch(info.src); if (!r.ok) throw new Error('받기 ' + r.status);
    const src = join(tmp, id + '.mp3'), out = join(tmp, id + '-x.mp3');
    await writeFile(src, Buffer.from(await r.arrayBuffer()));
    // 작업실에 AAC(mp4) 파일이 mp3 이름으로 올라온 곡도 있다 — mp4는 표본마다 자리가 적힌 표가 있어 위치가 정확하니 표시만 한다
    const codec = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'a:0', '-show_entries', 'stream=codec_name', '-of', 'csv=p=0', src]).toString().trim();
    if (codec !== 'mp3') { await writeFile(p, JSON.stringify({ ...info, seek: true }, null, 1) + '\n'); console.log(`${id}: ${codec} — 자리 표가 필요 없음`); continue; }
    // 소리만(표지 그림은 빼고) 그대로 다시 담으며 Xing 헤더(자리 표)를 쓴다 — 그림이 함께 있으면 ffmpeg가 헤더를 쓰지 않았다
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', src, '-map', '0:a', '-c', 'copy', '-map_metadata', '-1', '-write_xing', '1', out]);
    const buf = await readFile(out);
    if (buf.subarray(0, 8192).indexOf('Xing') < 0 && buf.subarray(0, 8192).indexOf('Info') < 0) throw new Error('헤더가 붙지 않음');
    const hash = createHash('sha256').update(buf).digest('hex'), key = `psalms/${id}-${hash.slice(0, 10)}.mp3`;
    // wrangler 3에는 --remote가 없고 4는 기본이 로컬이라, 4에 --remote를 준다 (3으로 돌렸다가 Unknown argument로 실패)
    execFileSync('npx', ['--yes', 'wrangler@4', 'r2', 'object', 'put', `${BUCKET}/${key}`, '--file', out, '--content-type', 'audio/mpeg', '--remote'], { stdio: 'inherit' });
    // 올라간 것을 공개 주소로 확인한 뒤에야 바꾼다
    const chk = await fetch(`${base}/${key}`, { method: 'HEAD' }); if (!chk.ok) throw new Error('올린 파일이 보이지 않음 ' + chk.status);
    await writeFile(p, JSON.stringify({ ...info, src: `${base}/${key}`, audio: hash, seek: true }, null, 1) + '\n');
    console.log(`${id}: 자리 표를 붙임 → ${key}`); done++;
  } catch (e) { console.warn(`::warning::${id}: 자리 표를 붙이지 못함 — ${e.message}`); }
}
console.log(`자리 표: ${done}편`);

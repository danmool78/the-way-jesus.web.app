// 말씀 카드 그림 (순례 게임 game.html의 말씀 카드): 장면마다 한 장, 시네마틱 반평면 일러스트(애니메이션 영화 콘셉트 아트 결 — 사용자가 시안 여섯 가운데 고름, 2026-11).
// 화풍은 _src/cards/style-ref.png, 예수님 모습은 _src/cards/jesus-ref.png를 참고로 넣어 장마다 맞춘다. 성화(후광·제단화) 결은 쓰지 않는다(사용자).
// 쓰는 법: GEMINI_API_KEY=… node _src/tools/cards.mjs [여정=jesus] [장면 id…] [--force] [--n 4]
//   결과: assets/img/cards/<장면>.webp (720px 폭, 3:4). 이미 있는 장은 건너뛴다(--force면 다시)
//   node _src/tools/cards.mjs refs — 인물 기준 그림(_src/cards/<인물>.png, chars.json)을 먼저 만든다. 장면 글에 그 이름이 나오면
//   기준 그림을 함께 넣어 얼굴·옷이 장마다 변하지 않게 한다 (사용자 2026-11)
import { readFile, writeFile, access } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error('GEMINI_API_KEY 환경변수가 없습니다'); process.exit(1); }
const argv = process.argv.slice(2), force = argv.includes('--force');
const ni = argv.indexOf('--n'), N = ni >= 0 ? +argv[ni + 1] : 4;
const rest = argv.filter((a, i) => !a.startsWith('--') && argv[i - 1] !== '--n');
const refsMode = rest[0] === 'refs' && rest.shift();
const J = rest[0] && !/\d/.test(rest[0]) ? rest.shift() : 'jesus', only = new Set(rest);
const CHARS = Object.fromEntries(Object.entries(JSON.parse(await readFile('_src/cards/chars.json', 'utf8'))).filter(([k]) => k !== '_comment'));
const data = JSON.parse(await readFile(J === 'jesus' ? 'data.json' : `j/${J}/data.json`, 'utf8'));
const LEAD = { jesus: ['예수', 'jesus-ref.png', 'Jesus'], moses: ['모세', null, 'Moses'], david: ['다윗', null, 'David'], kings: ['엘리야', null, 'Elijah'] }[J];

const STYLE = `Contemporary CINEMATIC SEMI-FLAT ILLUSTRATION like modern animated film concept art, in exactly the rendering style of the first reference image:
soft gradients, crisp clean shapes, atmospheric depth, a cool blue palette with a single warm light source, stylish and restrained, not painterly oil, not a religious icon.
Lighting may follow the time of day of the scene, but keep the same cool-and-warm mood and the same level of simplification.
ONE SINGLE IMAGE of ONE moment — never a comic, never multiple panels, never a grid or storyboard, no speech bubbles. If the story has several events, choose only the single most important moment.
No halos, no glowing rings around heads, no text, no letters, no captions, no border or frame. Full-bleed artwork filling the frame, portrait 3:4.
People are first-century Jews of Galilee and Judea (olive skin, dark hair, simple linen and wool garments). Keep the composition clear with one focal point and breathing space.
Violence is never shown graphically: suffering is conveyed with restraint, distance and light. God the Father is never drawn as a person.`;
const JESUS = `Jesus appears only once in the image, and no other person wears his off-white tunic with a deep red mantle. If Jesus appears, he must look exactly like the character in the second reference image (same face, dark shoulder-length hair, short beard, off-white tunic, deep red mantle), and he must be clearly recognizable.
Exception — on the cross (and when being taken down and buried) Jesus wears NO tunic and NO red mantle: the soldiers divided his garments and cast lots for his tunic (John 19:23-24), so he wears only a simple white loincloth; keep the same face and hair. Show this with restraint and dignity.`;

// 장면마다 꼭 고를 순간 (이야기에 여러 일이 있어 엉뚱한 순간을 고른 장)
const HINT = {
  e55: 'Choose the moment of "It is finished" at the cross: Jesus on the central cross wearing only a white loincloth, seen from a respectful distance under a darkened sky, two other crosses, Mary his mother and John standing near, women watching from farther away, a Roman centurion looking up. Jesus appears ONLY on the cross — nobody standing below wears an off-white tunic with a red mantle (John is young, clean-shaven, olive-green tunic with an ochre mantle). No halo or glow around any head.',
};
const exists = f => access(f).then(() => true, () => false);
const refs = [await readFile('_src/cards/style-ref.png')];
if (LEAD[1]) refs.push(await readFile('_src/cards/' + LEAD[1]));
// 장면 글에 나오는 인물 (동명이인은 not으로 거른다) — 많이 나오는 순으로 넷까지
function castOf(e) {
  const t = [e.title, e.subtitle, ...(e.story || []), ...(e.words || []).map(w => w.who + ' ' + w.text)].join(' ');
  return Object.entries(CHARS).map(([k, c]) => [k, c, c.names.reduce((n, x) => n + (t.split(x).length - 1), 0)])
    .filter(([, c, n]) => n && !(c.not || []).some(x => t.includes(x) && !c.names.some(y => y.includes(x))))
    .sort((a, b) => b[2] - a[2]).slice(0, 4);
}
async function gen(parts, out, w = 720) {
  for (let a = 0; a < 3; a++) {
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image:generateContent', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': KEY },
      body: JSON.stringify({ contents: [{ parts }], generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '3:4', imageSize: '1K' } } }),
    });
    const j = await res.json().catch(() => ({}));
    const img = j.candidates?.[0]?.content?.parts?.find(p => p.inlineData || p.inline_data);
    if (img) {
      const buf = Buffer.from((img.inlineData || img.inline_data).data, 'base64');
      if (out.endsWith('.png')) { await writeFile(out, buf); return 'ok'; }
      const tmp = `/tmp/card-${Math.random().toString(36).slice(2)}.png`;
      await writeFile(tmp, buf);
      execFileSync('python3', ['-c', `from PIL import Image;import sys;im=Image.open(sys.argv[1]).convert('RGB');w=int(sys.argv[3]);im=im.resize((w,round(im.height*w/im.width)),Image.LANCZOS);im.save(sys.argv[2],'WEBP',quality=82)`, tmp, out, String(w)]);
      return 'ok';
    }
    console.warn(out, '다시', res.status, JSON.stringify(j).slice(0, 200));
    await new Promise(r => setTimeout(r, 4000 * (a + 1)));
  }
  return 'fail';
}
const b64 = b => ({ inline_data: { mime_type: 'image/png', data: b.toString('base64') } });
if (refsMode) {
  const ks = Object.keys(CHARS).filter(k => force || !only.size || only.has(k));
  let i = 0;
  await Promise.all(Array.from({ length: N }, async () => { while (i < ks.length) { const k = ks[i++], out = `_src/cards/${k}.png`;
    if (!force && await exists(out)) { console.log(k, 'skip'); continue; }
    console.log(k, await gen([b64(refs[0]), { text: `${STYLE}\n\nCharacter reference sheet for a recurring Bible character, used to keep the face and clothes identical across many illustrations. One person standing alone, full body, facing three-quarters toward the viewer, neutral calm expression, plain softly lit background:\n${CHARS[k].desc}` }], out)); } }));
  process.exit(0);
}
const evs = [...(data.prologue ? [data.prologue] : []), ...data.events].filter(e => !only.size || only.has(e.id));

async function paint(e) {
  const out = `assets/img/cards/${e.id}.webp`;
  if (!force && await exists(out)) return 'skip';
  const words = (e.words || []).slice(0, 2).map(w => `${w.who}: "${w.text}"`).join(' / ');
  const prompt = `${STYLE}\n${LEAD[1] ? JESUS : ''}\n${HINT[e.id] ? 'Moment to paint: ' + HINT[e.id] + '\n' : ''}\nPaint this Bible scene as one moment (the description is in Korean):\n제목: ${e.title}\n부제: ${e.subtitle || ''}\n장소: ${data.places[e.place]?.name || ''}\n이야기: ${(e.story || []).join(' ').slice(0, 900)}\n말씀: ${words}`;
  const cast = castOf(e), parts = refs.map(b64);
  let castText = '';
  for (const [k, c] of cast) {
    const f = `_src/cards/${k}.png`;
    if (!await exists(f)) continue;
    parts.push(b64(await readFile(f)));
    castText += `\nReference image ${parts.length} is ${c.desc.split(':')[0]} — if this person appears, keep exactly this face, hair and clothing: ${c.desc}`;
  }
  parts.push({ text: prompt + (castText ? `\n\nRecurring characters (keep them identical to their reference images):${castText}` : '') });
  return gen(parts, out);
}
let i = 0, done = 0;
await Promise.all(Array.from({ length: N }, async () => {
  while (i < evs.length) { const e = evs[i++]; const r = await paint(e); done++; console.log(`${done}/${evs.length} ${e.id} ${e.title} ${r}`); }
}));

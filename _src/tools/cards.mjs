// 말씀 카드 그림 (순례 게임 game.html의 말씀 카드): 장면마다 한 장, 시네마틱 반평면 일러스트(애니메이션 영화 콘셉트 아트 결 — 사용자가 시안 여섯 가운데 고름, 2026-11).
// 화풍은 _src/cards/style-ref.png, 예수님 모습은 _src/cards/jesus-ref.png를 참고로 넣어 장마다 맞춘다. 성화(후광·제단화) 결은 쓰지 않는다(사용자).
// 쓰는 법: GEMINI_API_KEY=… node _src/tools/cards.mjs [여정=jesus] [장면 id…] [--force] [--n 4]
//   결과: _src/cards/out/<장면>.webp (720px 폭, 3:4 — 배포에서 빠지고 R2에서 받는다: 그린 뒤 python3 _src/tools/cards-manifest.py, 올리기는 cards-r2.yml). 이미 있는 장은 건너뛴다(--force면 다시)
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
const treasureMode = rest[0] === 'treasures' && rest.shift(); // 보물 카드 그림 (_src/cards/treasures.json → out/t-<id>.webp)
const J = rest[0] && !/\d/.test(rest[0]) ? rest.shift() : 'jesus', only = new Set(rest);
// 인물은 그 여정의 사람만 (j가 없으면 예수 여정 — '요셉'이 모세 여정에서 나사렛 요셉으로 그려지지 않게)
const CHARS = Object.fromEntries(Object.entries(JSON.parse(await readFile('_src/cards/chars.json', 'utf8'))).filter(([k, c]) => k !== '_comment' && (c.j || ['jesus']).includes(J)));
const data = JSON.parse(await readFile(J === 'jesus' ? 'data.json' : `j/${J}/data.json`, 'utf8'));
const ORDER = data.events.map(e => e.id); // 나이에 따라 모습이 다른 사람(scenes)을 가리려고
const LEAD = { jesus: ['예수', 'jesus-ref.png', 'Jesus'] }[J] || []; // 다른 여정의 주인공은 chars.json의 인물로(나이마다 따로)

const STYLE = `Contemporary CINEMATIC SEMI-FLAT ILLUSTRATION like modern animated film concept art, in exactly the rendering style of the first reference image:
soft gradients, crisp clean shapes, atmospheric depth, a cool blue palette with a single warm light source, stylish and restrained, not painterly oil, not a religious icon.
Lighting may follow the time of day of the scene, but keep the same cool-and-warm mood and the same level of simplification.
ONE SINGLE IMAGE of ONE moment — never a comic, never multiple panels, never a grid or storyboard, no speech bubbles. If the story has several events, choose only the single most important moment.
No halos, no glowing rings around heads, no text, no letters, no captions, no border or frame. Full-bleed artwork filling the frame, portrait 3:4.
${J === 'jesus' ? 'People are first-century Jews of Galilee and Judea (olive skin, dark hair, simple linen and wool garments).' : 'People are ancient Israelites and their neighbours of the Bronze and Iron Age (olive to brown skin, dark hair, simple wool and linen garments; Egyptians, Philistines, Phoenicians, Assyrians and Babylonians in their own dress and armor where the story has them). No Roman soldiers, no first-century clothing, no anachronisms. Nobody wears an off-white tunic with a deep red mantle (that look belongs to Jesus in this series). Angels look like radiant men WITHOUT wings (seraphim and cherubim aside).'} Keep the composition clear with one focal point and breathing space.
Finish: a polished, high-detail finished frame — clean anatomy and hands, readable faces, believable architecture and landscape of the real place, consistent light; nothing smeared, melted or half-drawn.
Violence is never shown graphically: suffering is conveyed with restraint, distance and light. God the Father is never drawn as a person.`;
const JESUS = `Jesus appears only once in the image, and no other person wears his off-white tunic with a deep red mantle. If Jesus appears, he must look exactly like the character in the second reference image (same face, dark shoulder-length hair, short beard, off-white tunic, deep red mantle), and he must be clearly recognizable.
Exception — on the cross (and when being taken down and buried) Jesus wears NO tunic and NO red mantle: the soldiers divided his garments and cast lots for his tunic (John 19:23-24), so he wears only a simple white loincloth; keep the same face and hair. Show this with restraint and dignity.`;

// 장면마다 꼭 고를 순간 (이야기에 여러 일이 있어 엉뚱한 순간을 고른 장)
const HINT = {
  m05: 'Moses (old, long white hair and beard, brown tunic with a striped golden-ochre and cream mantle, shepherd staff) and his brother Aaron (old, white beard, simple brown and blue robes — not yet in high-priest garments) stand before Pharaoh on his throne. No one in an off-white tunic with a red mantle.',
  m29: 'The angel of the LORD stands in the narrow vineyard path with a drawn sword: a tall radiant man in white, NO wings. The donkey has lain down under Balaam, and Balaam, a robed Mesopotamian diviner, has just had his eyes opened and bows his face down.',
  e55: 'Choose the moment of "It is finished" at the cross: Jesus on the central cross wearing only a white loincloth, seen from a respectful distance under a darkened sky, two other crosses, Mary his mother and John standing near, women watching from farther away, a Roman centurion looking up. Jesus appears ONLY on the cross — nobody standing below wears an off-white tunic with a red mantle (John is young, clean-shaven, olive-green tunic with an ochre mantle). No halo or glow around any head.',
};
const exists = f => access(f).then(() => true, () => false);
const SIZE = argv.includes('--hi') ? '2K' : '1K'; // --hi: 크게 그려 줄인다 (잔손질이 또렷해진다)
const LOOK = process.env.CARD_LOOK; // refs: 이 폴더에 <인물>.png(게임 3D 인형을 뜬 정면 그림)가 있으면 옷·머리·색을 그대로 따른다
const refs = [await readFile('_src/cards/style-ref.png')];
if (LEAD[1]) refs.push(await readFile('_src/cards/' + LEAD[1]));
// 장면 글에 나오는 인물 (동명이인은 not으로 거른다) — 많이 나오는 순으로 넷까지
function castOf(e) {
  const t = [e.title, e.subtitle, ...(e.story || []), ...(e.words || []).map(w => w.who + ' ' + w.text)].join(' '), at = ORDER.indexOf(e.id);
  const count = (s, x) => s.split(x).length - 1;
  return Object.entries(CHARS).filter(([, c]) => !c.scenes || (at >= ORDER.indexOf(c.scenes[0]) && at <= ORDER.indexOf(c.scenes[1])))
    .map(([k, c]) => [k, c, c.names.reduce((n, x) => n + count(t, x), 0) - (c.sub || []).reduce((n, x) => n + count(t, x), 0)])
    .filter(([, c, n]) => n && !(c.not || []).some(x => t.includes(x) && !c.names.some(y => y.includes(x))))
    .sort((a, b) => b[2] - a[2]).slice(0, 4);
}
async function gen(parts, out, w = 720) {
  for (let a = 0; a < 3; a++) {
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image:generateContent', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': KEY },
      body: JSON.stringify({ contents: [{ parts }], generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '3:4', imageSize: SIZE } } }),
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
    const look = LOOK && await exists(`${LOOK}/${k}.png`) ? await readFile(`${LOOK}/${k}.png`) : null;
    const lookText = look ? '\nThe second reference image is the same character as a flat game-model sheet: keep exactly that costume, colors, hair and face, but repaint him or her in the cinematic style of the first image.' : '';
    console.log(k, await gen([b64(refs[0]), ...(look ? [b64(look)] : []), { text: `${STYLE}${lookText}\n\nCharacter reference sheet for a recurring Bible character, used to keep the face and clothes identical across many illustrations. One person standing alone, full body, facing three-quarters toward the viewer, neutral calm expression, plain softly lit background:\n${CHARS[k].desc}` }], out)); } }));
  process.exit(0);
}
if (treasureMode) {
  // 물건 하나를 가까이서 — 이야기 속 그 물건이 주인공인 정물 같은 한 장 (사람은 손이나 뒷모습 정도만)
  const T = JSON.parse(await readFile('_src/cards/treasures.json', 'utf8')).filter(t => !only.size || only.has(t.id));
  let k = 0;
  await Promise.all(Array.from({ length: N }, async () => { while (k < T.length) { const t = T[k++], out = `_src/cards/out/t-${t.id}.webp`;
    if (!force && await exists(out)) { console.log(t.id, 'skip'); continue; }
    console.log(t.id, await gen([b64(refs[0]), { text: `${STYLE}\n\nA treasure card: one precious object from a parable or story of Jesus, shown close up as the hero of the image, softly lit like a jewel in a cinematic still life, with a hint of its setting behind it. People may appear only as hands or distant silhouettes, never as the focus.\nObject and setting: ${t.prompt}` }], out)); } }));
  process.exit(0);
}
const evs = [...(data.prologue ? [data.prologue] : []), ...data.events].filter(e => !only.size || only.has(e.id));

async function paint(e) {
  const out = `_src/cards/out/${e.id}.webp`;
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

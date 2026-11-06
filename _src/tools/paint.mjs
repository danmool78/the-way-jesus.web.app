// 장면 그림 만들기 (기쁜 소식 여정의 그림 장면): Gemini 이미지 모델로, 기존 그림을 참고(화풍·인물을 맞추려고)로 넣어 새 그림을 그린다.
// 쓰는 법: GEMINI_API_KEY=... node _src/tools/paint.mjs <출력.webp|png> "<그림 설명>" [참고그림 …] [--ratio 16:9] [--model gemini-3-pro-image]
// 키는 저장소에 두지 않는다. 결과는 1600px 폭 webp로 줄여 저장한다(png로 주면 원본 그대로)
import { readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error('GEMINI_API_KEY 환경변수가 없습니다'); process.exit(1); }
const argv = process.argv.slice(2), opt = n => { const i = argv.indexOf('--' + n); if (i < 0) return null; const v = argv[i + 1]; argv.splice(i, 2); return v; };
const ratio = opt('ratio') || '16:9', model = opt('model') || 'gemini-3-pro-image';
const [out, prompt, ...refs] = argv;
// 모든 그림에 붙는 화풍 (지금 기쁜 소식 그림 네 장의 결): 따뜻한 해 질 녘 빛, 부드러운 붓결, 분홍·주황·보라의 따뜻한 색, 이야기책 같은 사실감
const STYLE = 'Painterly digital illustration in exactly the same style, palette and lighting as the reference images: warm golden-hour light, soft visible brush texture, warm pinks, oranges and violets, gentle storybook realism, cinematic composition, no text, no letters, no watermark.';
const parts = [];
for (const r of refs) parts.push({ inline_data: { mime_type: r.endsWith('.png') ? 'image/png' : r.endsWith('.jpg') ? 'image/jpeg' : 'image/webp', data: (await readFile(r)).toString('base64') } });
parts.push({ text: `${STYLE}\n\n${prompt}` });
const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
  method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': KEY },
  body: JSON.stringify({ contents: [{ parts }], generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: ratio } } }),
});
const j = await res.json();
const img = j.candidates?.[0]?.content?.parts?.find(p => p.inlineData || p.inline_data);
if (!res.ok || !img) { console.error('실패', res.status, JSON.stringify(j).slice(0, 400)); process.exit(1); }
const data = Buffer.from((img.inlineData || img.inline_data).data, 'base64');
if (out.endsWith('.png')) await writeFile(out, data);
else { const tmp = out + '.src.png'; await writeFile(tmp, data); execFileSync('python3', ['-c', `from PIL import Image;import sys;im=Image.open(sys.argv[1]).convert('RGB');w=1600;im=im.resize((w,round(im.height*w/im.width)),Image.LANCZOS) if im.width>w else im;im.save(sys.argv[2],'WEBP',quality=82)`, tmp, out]); execFileSync('rm', [tmp]); }
console.log('ok', out);

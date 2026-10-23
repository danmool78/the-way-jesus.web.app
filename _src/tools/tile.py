# sheet.mjs로 찍은 PNG들을 이름표를 붙여 한 장의 격자로 이어 붙인다 (한눈에 비교하기 위해). Pillow 필요.
# 사용: python _src/tools/tile.py <in-dir> <out.png> <열 수> e02_enter e02_p2.0 ...
import sys
from pathlib import Path
from PIL import Image, ImageDraw

d, out, cols, names = Path(sys.argv[1]), sys.argv[2], int(sys.argv[3]), sys.argv[4:]
ims = [Image.open(d / f'{n}.png').convert('RGB') for n in names]
w = max(i.width for i in ims); h = max(i.height for i in ims)
rows = (len(ims) + cols - 1) // cols
sheet = Image.new('RGB', (w * cols, h * rows), 'white')
for k, (n, im) in enumerate(zip(names, ims)):
    ImageDraw.Draw(im).rectangle((0, 0, 9 * len(n) + 8, 16), fill='white')
    ImageDraw.Draw(im).text((4, 2), n, fill='black')
    sheet.paste(im, ((k % cols) * w, (k // cols) * h))
sheet.save(out)
print(sheet.size)

# 놀이 그림 조각 만들기: Gemini가 초록(#00FF00) 바탕에 그린 인물·물건을 투명 바탕 webp로 (바탕 그림은 --bg로 크기만 맞춤)
# 쓰는 법: python3 _src/tools/sprite.py 원본.png assets/mini/<놀이>/<이름>.webp [--h 높이px] [--bg 폭x높이]
import sys
from PIL import Image, ImageFilter
import numpy as np
a = sys.argv[1:]
src, out = a[0], a[1]
opt = lambda n, d=None: a[a.index('--' + n) + 1] if '--' + n in a else d
im = Image.open(src).convert('RGBA')
if opt('bg'):
    w, h = map(int, opt('bg').split('x'))
    s = max(w / im.width, h / im.height); im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    l, t = (im.width - w) // 2, (im.height - h) // 2
    im.crop((l, t, l + w, t + h)).convert('RGB').save(out, 'WEBP', quality=82); print('bg', out); sys.exit()
p = np.asarray(im).astype(np.float32); r, g, b = p[..., 0], p[..., 1], p[..., 2]
# 초록이 다른 두 빛보다 얼마나 센가 → 투명도 (가장자리는 부드럽게)
if opt('key') == 'm': # 자홍(#FF00FF) 바탕 — 초록 물건(종려가지·잎)이 있을 때
    k = np.minimum(r, b) - g
    alpha = np.clip(1 - (k - 30) / 70, 0, 1)
    m = np.minimum(r, b); p[..., 0] = np.where(k > 0, np.minimum(r, g + 0.0 + np.maximum(0, r - b)), r); p[..., 2] = np.where(k > 0, np.minimum(b, g + np.maximum(0, b - r)), b)
else:
    k = g - np.maximum(r, b)
    alpha = np.clip(1 - (k - 30) / 70, 0, 1)
    # 초록 번짐 걷어내기: 가장자리 초록 빛을 빨강·파랑의 큰 값으로 누른다
    p[..., 1] = np.where(k > 0, np.maximum(r, b) + np.minimum(k, 0) , g)
p[..., 3] = alpha * 255
im = Image.fromarray(p.clip(0, 255).astype(np.uint8), 'RGBA')
bb = im.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox(); im = im.crop(bb)
H = int(opt('h', '0'))
if H and im.height > H: im = im.resize((round(im.width * H / im.height), H), Image.LANCZOS)
im.save(out, 'WEBP', quality=86); print('sprite', out, im.size)

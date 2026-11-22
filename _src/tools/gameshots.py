# gameshots.mjs가 찍은 <언어>-<n>.png(780×1560)를 랜딩용 webp(300×600)로 → assets/land/game/
import sys, glob, os
from PIL import Image
src = sys.argv[1]
for f in glob.glob(os.path.join(src, '*-[1-4].png')):
    im = Image.open(f).convert('RGB').resize((300, 600), Image.LANCZOS)
    im.save(os.path.join('assets/land/game', os.path.basename(f)[:-4] + '.webp'), quality=78, method=6)
    print(os.path.basename(f))

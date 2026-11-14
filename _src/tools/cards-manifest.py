"""말씀 카드 그림 목록: _src/cards/out/*.webp의 내용 해시로 R2 열쇠(cards/<장면>-<해시10>.webp)를 정해 assets/cards.json에 적는다.
그림은 호스팅으로 내려보내지 않고 R2(버킷 theway, 공개 주소)에서 받는다 — 호스팅 전송량을 아끼려고(사용자 2026-11).
올리기는 .github/workflows/cards-r2.yml이 이 목록을 보고 R2에 없는 것만 올린다. 그림을 새로 그리면(cards.mjs) 이것을 다시 돌린다.
쓰는 법: python3 _src/tools/cards-manifest.py"""
import glob, hashlib, json, os
root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BASE = 'https://pub-7d2b46014d5b4769a48e210890df23c4.r2.dev'  # 시편 노래와 같은 그 길 버킷의 공개 주소
files = {}
for f in sorted(glob.glob(os.path.join(root, '_src', 'cards', 'out', '*.webp'))):
    k = os.path.basename(f)[:-5]
    files[k] = 'cards/%s-%s.webp' % (k, hashlib.sha256(open(f, 'rb').read()).hexdigest()[:10])
json.dump({'base': BASE, 'files': files}, open(os.path.join(root, 'assets', 'cards.json'), 'w'), ensure_ascii=False, indent=0)
print('assets/cards.json:', len(files), 'cards')

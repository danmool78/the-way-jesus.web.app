"""말씀 카드 그림 목록: _src/cards/out/*.webp의 내용 해시로 R2 열쇠(cards/<장면>-<해시10>.webp)를 정해 assets/cards.json에 적는다.
그림은 호스팅으로 내려보내지 않고 R2(버킷 theway, 공개 주소)에서 받는다 — 호스팅 전송량을 아끼려고(사용자 2026-11).
올리기는 .github/workflows/cards-r2.yml이 이 목록을 보고 R2에 없는 것만 올린다. 그림을 새로 그리면(cards.mjs) 이것을 다시 돌린다.
쓰는 법: python3 _src/tools/cards-manifest.py"""
import glob, hashlib, json, os
root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BASE = 'https://theway-admin.danmool78.workers.dev/f'  # 그 길 버킷을 관리자 Worker가 내준다 — r2.dev 공개 주소는 속도 제한이 있어 느렸다(사용자 2026-11)
files = {}
for f in sorted(glob.glob(os.path.join(root, '_src', 'cards', 'out', '*.webp'))):
    k = os.path.basename(f)[:-5]
    files[k] = 'cards/%s-%s.webp' % (k, hashlib.sha256(open(f, 'rb').read()).hexdigest()[:10])
json.dump({'base': BASE, 'files': files}, open(os.path.join(root, 'assets', 'cards.json'), 'w'), ensure_ascii=False, indent=0)
print('assets/cards.json:', len(files), 'cards')

# 순례 게임의 3D 인물 모델 (_src/models/*.glb → R2 models/<이름>-<해시10>.glb) — 같은 워크플로가 올린다
models = {}
for f in sorted(glob.glob(os.path.join(root, '_src', 'models', '*.glb'))):
    k = os.path.basename(f)[:-4]
    models[k] = 'models/%s-%s.glb' % (k, hashlib.sha256(open(f, 'rb').read()).hexdigest()[:10])
json.dump({'base': BASE, 'files': models}, open(os.path.join(root, 'assets', 'models.json'), 'w'), ensure_ascii=False, indent=0)
print('assets/models.json:', len(models), 'models')

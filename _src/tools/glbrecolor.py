# GLB 옷 색 바꾸기: 바탕색 텍스처에서 색상(hue) 범위·채도로 고른 곳만 새 색으로 (명암은 그대로). 카드 그림의 옷 색에 맞출 때
# (사마리아 여인의 붉은 겉옷 → 카드의 회갈색, 사용자 2026-11). 게임과 무대가 같은 모델을 쓰니 파일 자체를 고친다
# 쓰는 법: python3 glbrecolor.py 모델.glb 색상시작 색상끝 최소채도 '#새색'   (색상은 도, 시작>끝이면 0도를 넘어 감는다)
# 얼굴(머리·목 뼈에 붙은 곳)은 빼고 칠한다 — 붉은 옷을 바꾸니 입술까지 회색이 되었다
import json, struct, io, sys, colorsys
import numpy as np
from PIL import Image
path, h0, h1, smin, hexc = sys.argv[1], float(sys.argv[2]) / 360, float(sys.argv[3]) / 360, float(sys.argv[4]), sys.argv[5]
b = open(path, 'rb').read()
jl = struct.unpack_from('<I', b, 12)[0]; J = json.loads(b[20:20 + jl]); off = 20 + jl
bl = struct.unpack_from('<I', b, off)[0]; BIN = bytearray(b[off + 8: off + 8 + bl])
t = J['materials'][0]['pbrMetallicRoughness']['baseColorTexture']['index']; v = J['bufferViews'][J['images'][J['textures'][t]['source']]['bufferView']]
o0, n0 = v.get('byteOffset', 0), v['byteLength']
a = np.array(Image.open(io.BytesIO(bytes(BIN[o0:o0 + n0]))).convert('RGB'), np.float32) / 255
mx, mn = a.max(2), a.min(2); V = mx; S = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
r, g, bb = a[..., 0], a[..., 1], a[..., 2]; d = np.maximum(mx - mn, 1e-6)
H = np.where(mx == r, ((g - bb) / d) % 6, np.where(mx == g, (bb - r) / d + 2, (r - g) / d + 4)) / 6
sel = (S >= smin) & ((H >= h0) & (H <= h1) if h0 <= h1 else (H >= h0) | (H <= h1))
# 머리·목 뼈에 가장 크게 붙은 삼각형이 덮는 텍스처 자리는 칠하지 않는다
from PIL import ImageDraw
NC = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}; DT = {5126: np.float32, 5125: np.uint32, 5123: np.uint16, 5121: np.uint8}
def acc(i):
    A = J['accessors'][i]; w = J['bufferViews'][A['bufferView']]; o = w.get('byteOffset', 0) + A.get('byteOffset', 0); n = NC[A['type']]
    return np.frombuffer(bytes(BIN), DT[A['componentType']], A['count'] * n, o).reshape(A['count'], n)
Hh, Ww = a.shape[:2]; keep = Image.new('L', (Ww, Hh)); kd = ImageDraw.Draw(keep)
joints = J['skins'][0]['joints'] if J.get('skins') else []
headIdx = {i for i, j in enumerate(joints) if any(k in J['nodes'][j].get('name', '') for k in ('Head', 'Neck'))}
for me in J['meshes']:
    for pr in me['primitives']:
        at = pr['attributes']; uv = acc(at['TEXCOORD_0']) * [Ww, Hh]; ix = acc(pr['indices']).reshape(-1, 3)
        if 'JOINTS_0' not in at: continue
        jt, wt = acc(at['JOINTS_0']), acc(at['WEIGHTS_0']).astype(np.float32)
        top = jt[np.arange(len(jt)), wt.argmax(1)]; head = np.isin(top, list(headIdx))
        for tri in ix:
            if head[tri].sum() >= 2: kd.polygon([tuple(uv[k]) for k in tri], fill=255)
sel &= ~(np.array(keep) > 0)
tr, tg, tb = [int(hexc[i:i + 2], 16) / 255 for i in (1, 3, 5)]; th, ts, tv = colorsys.rgb_to_hsv(tr, tg, tb)
# 명암: 고른 곳의 밝기 평균을 새 색의 밝기에 맞춘다
k = tv / max(1e-6, V[sel].mean()) if sel.any() else 1
out = a.copy()
vv = np.clip(V * k, 0, 1)
rgb = np.stack(np.vectorize(colorsys.hsv_to_rgb)(np.full_like(vv, th), np.full_like(vv, ts), vv), -1)
out[sel] = rgb[sel]
buf = io.BytesIO(); Image.fromarray((out * 255).clip(0, 255).astype(np.uint8)).save(buf, 'JPEG', quality=88); data = buf.getvalue()
BIN = BIN[:o0] + BIN[o0 + n0:]
for w in J['bufferViews']:
    if w is not v and w.get('byteOffset', 0) > o0: w['byteOffset'] -= n0
while len(BIN) % 4: BIN.append(0)
v['byteOffset'] = len(BIN); v['byteLength'] = len(data); BIN += data
while len(BIN) % 4: BIN.append(0)
J['buffers'][0]['byteLength'] = len(BIN)
js = json.dumps(J, separators=(',', ':')).encode()
while len(js) % 4: js += b' '
open(path, 'wb').write(struct.pack('<III', 0x46546C67, 2, 28 + len(js) + len(BIN)) + struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(BIN), 0x004E4942) + bytes(BIN))
print(path, 'recolored', int(sel.sum()), 'px')

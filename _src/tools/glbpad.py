# GLB 텍스처 이음매 다듬기: UV 조각 밖(빈칸)을 가장 가까운 조각의 색으로 채운다.
# 빈칸이 이웃 조각의 색으로 번져 있으면 멀리서(밉맵) 볼 때 이음매에 다른 색 줄이 보였다(예수님 붉은 겉옷의 살색 줄, 사용자 2026-11)
# 쓰는 법: python3 glbpad.py 모델.glb   (바탕색 텍스처만 고쳐 같은 파일에 다시 쓴다)
import json, struct, io, sys
import numpy as np
from PIL import Image, ImageDraw
path = sys.argv[1]
b = open(path, 'rb').read()
jl = struct.unpack_from('<I', b, 12)[0]; J = json.loads(b[20:20 + jl]); off = 20 + jl
bl = struct.unpack_from('<I', b, off)[0]; BIN = bytearray(b[off + 8: off + 8 + bl])

def acc(i):
    a = J['accessors'][i]; v = J['bufferViews'][a['bufferView']]; o = v.get('byteOffset', 0) + a.get('byteOffset', 0)
    n = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3}[a['type']]; dt = {5126: np.float32, 5125: np.uint32, 5123: np.uint16, 5121: np.uint8}[a['componentType']]
    x = np.frombuffer(bytes(BIN), dt, a['count'] * n, o); return x.reshape(-1, n) if n > 1 else x

tex = J['materials'][0]['pbrMetallicRoughness']['baseColorTexture']['index']
img_i = J['textures'][tex]['source']; bv_i = J['images'][img_i]['bufferView']; v = J['bufferViews'][bv_i]
im = Image.open(io.BytesIO(bytes(BIN[v.get('byteOffset', 0): v.get('byteOffset', 0) + v['byteLength']]))).convert('RGB')
W, H = im.size
# 조각이 덮는 곳 (가장자리 한 칸은 조각 안쪽으로 줄여 번진 테두리도 다시 채운다)
m = Image.new('L', (W, H)); d = ImageDraw.Draw(m)
for me in J['meshes']:
    for p in me['primitives']:
        uv = acc(p['attributes']['TEXCOORD_0']) * [W, H]; ix = acc(p['indices']).reshape(-1, 3)
        for t in ix: d.polygon([tuple(uv[k]) for k in t], fill=255)
cov = np.array(m) > 0
inner = cov.copy()
inner[1:] &= cov[:-1]; inner[:-1] &= cov[1:]; inner[:, 1:] &= cov[:, :-1]; inner[:, :-1] &= cov[:, 1:]
c = np.array(im, np.float32); have = inner.copy(); c[~have] = 0
# 한 칸씩 밖으로: 채워진 이웃의 평균
for _ in range(64):
    if have.all(): break
    s = np.zeros_like(c); n = np.zeros(have.shape, np.float32)
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (1, -1), (-1, 1), (-1, -1)):
        hs = np.roll(have, (dy, dx), (0, 1)); cs = np.roll(c, (dy, dx), (0, 1)); s += cs * hs[..., None]; n += hs
    new = (~have) & (n > 0); c[new] = s[new] / n[new][:, None]; have |= new
out = io.BytesIO(); Image.fromarray(c.clip(0, 255).astype(np.uint8)).save(out, 'JPEG', quality=88)
data = out.getvalue()
# 새 그림은 버퍼 끝에 붙이고 그 bufferView만 옮긴다 (예전 자리는 비워 둔다 — 아래에서 쓰지 않는 바이트를 덜어낸다)
old = (v.get('byteOffset', 0), v['byteLength'])
BIN = BIN[:old[0]] + BIN[old[0] + old[1]:]
for bv in J['bufferViews']:
    if bv is not v and bv.get('byteOffset', 0) > old[0]: bv['byteOffset'] = bv.get('byteOffset', 0) - old[1]
while len(BIN) % 4: BIN.append(0)
v['byteOffset'] = len(BIN); v['byteLength'] = len(data); BIN += data
while len(BIN) % 4: BIN.append(0)
J['buffers'][0]['byteLength'] = len(BIN)
js = json.dumps(J, separators=(',', ':')).encode()
while len(js) % 4: js += b' '
outb = struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(BIN)) + struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(BIN), 0x004E4942) + bytes(BIN)
open(path, 'wb').write(outb)
print(path, W, 'x', H, 'covered %.0f%%' % (cov.mean() * 100), len(outb) // 1024, 'KB')

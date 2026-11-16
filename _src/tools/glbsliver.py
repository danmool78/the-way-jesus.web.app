# GLB 옷 얼룩 고치기: 겉옷이 아래위로 긴 삼각형 띠로 되어 있는데, 띠 하나가 텍스처에서 옷 자리를 넘어 이웃 조각(살색·갈색)까지
# 덮어 옷에 살색·갈색 쐐기가 보였다(예수님, 사용자 2026-11). 삼각형 안을 촘촘히 찍어 보고 대부분 옷 색(흰·붉은)인데 다른 색이 섞였으면
# 그 삼각형이 옷 색 한 점만 보게 UV를 모은다(그 삼각형만 꼭짓점을 따로 떼어). 옷은 원래 거의 한 빛깔이라 티가 나지 않는다
# 쓰는 법: python3 glbsliver.py 모델.glb   (같은 파일에 다시 쓴다. 먼저 glbpad.py로 빈칸을 채워 둔다)
import json, struct, io, sys, colorsys
import numpy as np
from PIL import Image
path = sys.argv[1]
b = open(path, 'rb').read()
jl = struct.unpack_from('<I', b, 12)[0]; J = json.loads(b[20:20 + jl]); off = 20 + jl
bl = struct.unpack_from('<I', b, off)[0]; BIN = bytearray(b[off + 8: off + 8 + bl])
NC = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}; DT = {5126: np.float32, 5125: np.uint32, 5123: np.uint16, 5121: np.uint8}
def acc(i):
    a = J['accessors'][i]; v = J['bufferViews'][a['bufferView']]; o = v.get('byteOffset', 0) + a.get('byteOffset', 0); n = NC[a['type']]
    return np.frombuffer(bytes(BIN), DT[a['componentType']], a['count'] * n, o).reshape(a['count'], n).copy()
def put(i, arr):  # 새 자리에 쓰고 accessor를 옮긴다
    global BIN
    while len(BIN) % 4: BIN.append(0)
    data = np.ascontiguousarray(arr.astype(DT[J['accessors'][i]['componentType']])).tobytes()
    J['bufferViews'].append({'buffer': 0, 'byteOffset': len(BIN), 'byteLength': len(data)}); BIN += data
    a = J['accessors'][i]; a['bufferView'] = len(J['bufferViews']) - 1; a.pop('byteOffset', None); a['count'] = len(arr)

tex = J['materials'][0]['pbrMetallicRoughness']['baseColorTexture']['index']
v = J['bufferViews'][J['images'][J['textures'][tex]['source']]['bufferView']]
img = np.array(Image.open(io.BytesIO(bytes(BIN[v.get('byteOffset', 0): v.get('byteOffset', 0) + v['byteLength']]))).convert('RGB'), np.float32) / 255
H, W = img.shape[:2]
def col(uv): x = np.clip((uv[:, 0] * W).astype(int), 0, W - 1); y = np.clip((uv[:, 1] * H).astype(int), 0, H - 1); return img[y, x]
def cls(c):
    h, s, l = colorsys.rgb_to_hsv(*c)
    if s < 0.18 and l > 0.72: return 'white'
    if (h > 0.93 or h < 0.02) and s > 0.45 and l > 0.3: return 'red'
    return 'other'

fixed = 0
G = 12; BW = [(i / G, j / G, 1 - (i + j) / G) for i in range(G + 1) for j in range(G + 1 - i)]  # 삼각형 안 91점(모서리 포함)
for me in J['meshes']:
    for p in me['primitives']:
        A = {k: acc(i) for k, i in p['attributes'].items()}; ix = acc(p['indices']).reshape(-1, 3); uv = A['TEXCOORD_0']
        pts = np.stack([uv[ix[:, 0]] * w0 + uv[ix[:, 1]] * w1 + uv[ix[:, 2]] * w2 for w0, w1, w2 in BW], 1)
        samp = np.array([[cls(c) for c in col(pts[:, j])] for j in range(len(BW))]).T   # 삼각형 × 점
        newuv = {}
        for t in range(len(ix)):
            for want in ('white',):   # 붉은 띠는 흰 바탕과 맞닿은 곳이 많아 오히려 흰 쐐기가 생겼다 — 흰 옷만
                k = samp[t] == want
                if 0.6 <= k.mean() < 1:   # 거의 옷인데 다른 색이 섞임 → 옷 색 점들의 가운데에 가장 가까운 옷 점으로
                    js = np.nonzero(k)[0]; c = pts[t, js].mean(0); newuv[t] = pts[t, js[np.argmin(np.sum((pts[t, js] - c) ** 2, 1))]]; break
        if not newuv: continue
        # 고칠 삼각형은 꼭짓점을 새로 떼어 UV를 그 이웃 삼각형의 가운데로
        n0 = len(uv); extra = {k: [] for k in A}; ix = ix.copy()
        for j, (t, u) in enumerate(newuv.items()):
            for c in range(3):
                k = ix[t, c]
                for a in A: extra[a].append(A[a][k] if a != 'TEXCOORD_0' else u)
                ix[t, c] = n0 + j * 3 + c
        for a, i in p['attributes'].items(): put(i, np.vstack([A[a], np.array(extra[a])]))
        if len(uv) + len(newuv) * 3 > 65535: J['accessors'][p['indices']]['componentType'] = 5125
        put(p['indices'], ix.reshape(-1, 1)); fixed += len(newuv)
while len(BIN) % 4: BIN.append(0)
J['buffers'][0]['byteLength'] = len(BIN)
js = json.dumps(J, separators=(',', ':')).encode()
while len(js) % 4: js += b' '
open(path, 'wb').write(struct.pack('<III', 0x46546C67, 2, 28 + len(js) + len(BIN)) + struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(BIN), 0x004E4942) + bytes(BIN))
print(path, 'fixed triangles', fixed)

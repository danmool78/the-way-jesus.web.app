# GLB 줄이기: 텍스처를 1024px JPEG로, 동작에 이름을 붙이고 안 쓰는 동작은 빼고, 남은 자료만 다시 묶는다
# 쓰는 법: python3 glbslim.py 입력.glb 출력.glb '이름1,이름2,…(동작 차례대로, -는 뺌)' [텍스처 크기=1024]
import json, struct, sys, io
from PIL import Image
src, dst, names = sys.argv[1], sys.argv[2], sys.argv[3].split(',')
size = int(sys.argv[4]) if len(sys.argv) > 4 else 1024
b = open(src, 'rb').read()
jl = struct.unpack_from('<I', b, 12)[0]; J = json.loads(b[20:20 + jl]); off = 20 + jl
bl = struct.unpack_from('<I', b, off)[0]; BIN = b[off + 8: off + 8 + bl]

# 동작 이름·고르기
anims = []
for a, n in zip(J.get('animations', []), names):
    if n != '-': a['name'] = n; anims.append(a)
J['animations'] = anims

def view(i):
    v = J['bufferViews'][i]; o = v.get('byteOffset', 0); return BIN[o:o + v['byteLength']]

# 동작 다듬기: 움직이지 않는 채널(값이 늘 같은 것)은 열쇠 하나로, 긴 동작(2초 넘게)은 열쇠를 하나 걸러 (선형 보간이라 티가 거의 안 난다)
NC = {'SCALAR': 1, 'VEC3': 3, 'VEC4': 4}
newbin = bytearray(BIN)
def acc_floats(i):
    a = J['accessors'][i]; v = J['bufferViews'][a['bufferView']]; o = v.get('byteOffset', 0) + a.get('byteOffset', 0); n = a['count'] * NC[a['type']]
    return list(struct.unpack_from('<%df' % n, BIN, o))
def new_acc(vals, typ):
    global newbin
    while len(newbin) % 4: newbin.append(0)
    o = len(newbin); newbin.extend(struct.pack('<%df' % len(vals), *vals))
    J['bufferViews'].append({'buffer': 0, 'byteOffset': o, 'byteLength': len(vals) * 4})
    k = NC[typ]; cols = [vals[i::k] for i in range(k)]
    J['accessors'].append({'bufferView': len(J['bufferViews']) - 1, 'componentType': 5126, 'count': len(vals) // k, 'type': typ, 'min': [min(c) for c in cols], 'max': [max(c) for c in cols]})
    return len(J['accessors']) - 1
for an in J['animations']:
    for sm in an['samplers']:
        t = acc_floats(sm['input']); typ = J['accessors'][sm['output']]['type']; k = NC[typ]; v = acc_floats(sm['output'])
        keys = [v[i * k:(i + 1) * k] for i in range(len(t))]
        if all(max(abs(x - y) for x, y in zip(keys[0], q)) < 1e-4 for q in keys):
            sm['input'] = new_acc([t[0]], 'SCALAR'); sm['output'] = new_acc(keys[0], typ); continue
        if t[-1] > 2 and len(t) > 8:
            idx = list(range(0, len(t), 2)); idx[-1:] = [idx[-1]] if idx[-1] == len(t) - 1 else [idx[-1], len(t) - 1]
            sm['input'] = new_acc([t[i] for i in idx], 'SCALAR'); sm['output'] = new_acc([x for i in idx for x in keys[i]], typ)
BIN = bytes(newbin)

# 쓰는 accessor 모으기
used = set()
for m in J['meshes']:
    for p in m['primitives']:
        used.update(p['attributes'].values())
        if 'indices' in p: used.add(p['indices'])
        for t in p.get('targets', []): used.update(t.values())
for s in J.get('skins', []):
    if 'inverseBindMatrices' in s: used.add(s['inverseBindMatrices'])
for a in J['animations']:
    for s in a['samplers']: used.update([s['input'], s['output']])
amap = {}; accs = []
for i, a in enumerate(J['accessors']):
    if i in used: amap[i] = len(accs); accs.append(a)

# 새 버퍼: accessor가 쓰는 view와 그림
out = bytearray(); views = []; vmap = {}
def add(data, extra=None):
    while len(out) % 4: out.append(0)
    v = {'buffer': 0, 'byteOffset': len(out), 'byteLength': len(data)}
    if extra: v.update(extra)
    out.extend(data); views.append(v); return len(views) - 1
for a in accs:
    i = a['bufferView']
    if i not in vmap:
        ov = J['bufferViews'][i]; ex = {k: ov[k] for k in ('byteStride', 'target') if k in ov}
        vmap[i] = add(view(i), ex)
    a['bufferView'] = vmap[i]
for im in J.get('images', []):
    pic = Image.open(io.BytesIO(view(im['bufferView'])))
    alpha = pic.mode in ('RGBA', 'LA') and pic.getchannel('A').getextrema()[0] < 250
    pic = pic.convert('RGBA' if alpha else 'RGB').resize((size, size), Image.LANCZOS)
    bio = io.BytesIO()
    if alpha: pic.save(bio, 'PNG', optimize=True); im['mimeType'] = 'image/png'
    else: pic.save(bio, 'JPEG', quality=86, optimize=True); im['mimeType'] = 'image/jpeg'
    im['bufferView'] = add(bio.getvalue())

# accessor 번호 다시 매기기
for m in J['meshes']:
    for p in m['primitives']:
        p['attributes'] = {k: amap[v] for k, v in p['attributes'].items()}
        if 'indices' in p: p['indices'] = amap[p['indices']]
        if 'targets' in p: p['targets'] = [{k: amap[v] for k, v in t.items()} for t in p['targets']]
for s in J.get('skins', []):
    if 'inverseBindMatrices' in s: s['inverseBindMatrices'] = amap[s['inverseBindMatrices']]
for a in J['animations']:
    for s in a['samplers']: s['input'] = amap[s['input']]; s['output'] = amap[s['output']]
J['accessors'] = accs; J['bufferViews'] = views
while len(out) % 4: out.append(0)
J['buffers'] = [{'byteLength': len(out)}]
js = json.dumps(J, separators=(',', ':')).encode()
while len(js) % 4: js += b' '
glb = struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(out)) + struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(out), 0x004E4942) + bytes(out)
open(dst, 'wb').write(glb)
print(dst, len(b), '->', len(glb), 'anims', [a['name'] for a in J['animations']])

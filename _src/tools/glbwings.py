"""날개를 등에 붙이기: 자동 리깅이 등 뒤의 날개를 팔 뼈(그리고 아래쪽은 다리 뼈)에 붙여, 팔을 들면 날개가 팔과 함께 휘저어졌다(천사, 사용자 2026-11).
몸 뒤(앞이 +Z)에서 팔 줄기와 떨어진 꼭짓점과, 등 뒤로 옆으로 뻗은 꼭짓점을 모두 Spine2(등 위쪽)에 붙인다 — 날개는 가만히, 몸만 따라 움직인다.

  python3 _src/tools/glbwings.py _src/models/angel.glb [같은 파일에 덮어씀]"""
import json, struct, sys
import numpy as np

CT = {5126: '<f4', 5121: 'u1', 5123: '<u2', 5125: '<u4'}

def main(src, dst):
    b = bytearray(open(src, 'rb').read())
    jl = struct.unpack('<I', b[12:16])[0]; j = json.loads(b[20:20 + jl]); off = 20 + jl + 8
    def acc(i):
        a = j['accessors'][i]; v = j['bufferViews'][a['bufferView']]; n = {'SCALAR': 1, 'VEC3': 3, 'VEC4': 4, 'MAT4': 16}[a['type']]
        o = off + v.get('byteOffset', 0) + a.get('byteOffset', 0); dt = np.dtype(CT[a['componentType']])
        return np.frombuffer(bytes(b[o:o + a['count'] * n * dt.itemsize]), dtype=dt).reshape(a['count'], n).copy(), o
    at = j['meshes'][0]['primitives'][0]['attributes']
    P, _ = acc(at['POSITION']); J, jo = acc(at['JOINTS_0']); W, wo = acc(at['WEIGHTS_0'])
    sk = j['skins'][0]; names = [j['nodes'][k]['name'].split(':')[-1] for k in sk['joints']]
    ibm, _ = acc(sk['inverseBindMatrices']); jp = np.array([np.linalg.inv(m.reshape(4, 4).T)[:3, 3] for m in ibm])
    ix = {n: i for i, n in enumerate(names)}
    back = jp[ix['Spine2']][2]  # 등뼈의 앞뒤 자리
    # 모델은 텍스처 조각(UV 섬) 수백 개로 이루어져 있다. 꼭짓점 하나하나를 자리로 가르면 손 가까이에서 날개와 손이 섞였다 —
    # 조각째로 본다: 조각의 평균 자리가 등뼈보다 확실히 뒤에 있으면 날개(날개에는 어떤 동작도 이어지지 않게, 사용자 2026-11)
    I, _ = acc(j['meshes'][0]['primitives'][0]['indices']); I = I.reshape(-1, 3)
    par = np.arange(len(P))
    def f(a):
        while par[a] != a: par[a] = par[par[a]]; a = par[a]
        return a
    for a, b2, c in I:
        for u, v in ((a, b2), (b2, c)):
            ru, rv = f(u), f(v)
            if ru != rv: par[ru] = rv
    roots = np.array([f(v) for v in range(len(P))])
    wing = np.zeros(len(P), bool)
    for r in np.unique(roots):
        m = roots == r; c = P[m].mean(0)
        if c[2] < back - 0.09 and c[1] > 0.5: wing |= m
    s2 = ix['Spine2']
    J[wing] = 0; J[wing, 0] = s2; W[wing] = 0; W[wing, 0] = 1
    b[jo:jo + J.nbytes] = J.astype(J.dtype).tobytes(); b[wo:wo + W.nbytes] = W.astype('<f4').tobytes()
    open(dst, 'wb').write(b)
    print(f'{src}: 날개 꼭짓점 {int(wing.sum())}개를 Spine2에 붙임 → {dst}')

if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else sys.argv[1])

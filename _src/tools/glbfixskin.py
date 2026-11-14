"""팔에 잘못 붙은 옷자락 떼기: glb 모델에서 팔 뼈와 멀리 떨어진 꼭짓점이 팔 뼈에 붙어 있으면(자동 리깅이 긴 겉옷을 팔에 붙였을 때)
팔을 내리거나 움직일 때 옷자락이 끌려가 찢어진다(나단, 사용자 2026-11). 그런 꼭짓점의 팔 가중치를 가장 가까운 몸통·다리 뼈로 옮긴다.

  python3 _src/tools/glbfixskin.py _src/models/nathan.glb [같은 파일에 덮어씀]

팔 뼈 줄기(어깨→위팔→아래팔→손→가운뎃손가락)에서 NEAR 안은 그대로, FAR 밖은 모두 옮기고, 그 사이는 고르게 섞는다.
멀쩡한 모델은 팔에 붙은 꼭짓점이 모두 팔에서 0.19m 안에 있다."""
import json, struct, sys
import numpy as np

NEAR, FAR = 0.18, 0.26
CT = {5126: '<f4', 5121: 'u1', 5123: '<u2'}

def main(src, dst):
    b = bytearray(open(src, 'rb').read())
    jl = struct.unpack('<I', b[12:16])[0]; j = json.loads(b[20:20 + jl]); off = 20 + jl + 8
    def acc(i):
        a = j['accessors'][i]; v = j['bufferViews'][a['bufferView']]; n = {'SCALAR': 1, 'VEC3': 3, 'VEC4': 4, 'MAT4': 16}[a['type']]
        o = off + v.get('byteOffset', 0) + a.get('byteOffset', 0); dt = np.dtype(CT[a['componentType']])
        assert not v.get('byteStride') or v['byteStride'] == dt.itemsize * n
        return np.frombuffer(bytes(b[o:o + a['count'] * n * dt.itemsize]), dtype=dt).reshape(a['count'], n).copy(), o
    at = j['meshes'][0]['primitives'][0]['attributes']
    P, _ = acc(at['POSITION']); J, jo = acc(at['JOINTS_0']); W, wo = acc(at['WEIGHTS_0'])
    sk = j['skins'][0]; names = [j['nodes'][k]['name'].split(':')[-1] for k in sk['joints']]
    ibm, _ = acc(sk['inverseBindMatrices']); jp = np.array([np.linalg.inv(m.reshape(4, 4).T)[:3, 3] for m in ibm])
    ix = {n: i for i, n in enumerate(names)}
    def segd(A, B):
        d = B - A; t = np.clip(((P - A) @ d) / (d @ d + 1e-9), 0, 1); return np.linalg.norm(P - (A + t[:, None] * d), axis=1)
    # 몸통·다리 뼈 마디: [이 마디에 붙일 뼈, 시작, 끝]
    body = [('Hips', 'Hips', 'Spine'), ('Spine', 'Spine', 'Spine1'), ('Spine1', 'Spine1', 'Spine2'), ('Spine2', 'Spine2', 'Neck')]
    for s in ('Left', 'Right'): body += [(s + 'UpLeg', s + 'UpLeg', s + 'Leg'), (s + 'Leg', s + 'Leg', s + 'Foot')]
    bd = np.stack([segd(jp[ix[a]], jp[ix[c]]) for _, a, c in body]); target = np.array([ix[body[k][0]] for k in bd.argmin(0)])
    moved = 0
    for side in ('Left', 'Right'):
        chain = [jp[ix[side + k]] for k in ('Shoulder', 'Arm', 'ForeArm', 'Hand', 'HandMiddle1')]
        d = np.min([segd(chain[i], chain[i + 1]) for i in range(4)], axis=0)
        arm = [i for n, i in ix.items() if n.startswith(side) and any(k in n for k in ('Arm', 'Hand', 'Shoulder'))]
        keep = np.clip((FAR - d) / (FAR - NEAR), 0, 1)
        for v in np.nonzero(keep < 1)[0]:
            isarm = np.isin(J[v], arm) & (W[v] > 0)
            if not isarm.any(): continue
            take = (W[v] * isarm).sum() * (1 - keep[v]); W[v] = np.where(isarm, W[v] * keep[v], W[v])
            t = target[v]; slot = np.nonzero(J[v] == t)[0]
            if len(slot) and W[v][slot[0]] > 0: W[v][slot[0]] += take
            else: s = W[v].argmin(); J[v][s] = t; W[v][s] += take  # 가장 가벼운 자리를 내어 준다
            W[v] /= W[v].sum(); moved += 1
    b[jo:jo + J.nbytes] = J.astype(J.dtype).tobytes(); b[wo:wo + W.nbytes] = W.astype('<f4').tobytes()
    open(dst, 'wb').write(b)
    print(f'{src}: 옷자락 꼭짓점 {moved}개의 팔 가중치를 몸통·다리로 옮김 → {dst}')

if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else sys.argv[1])

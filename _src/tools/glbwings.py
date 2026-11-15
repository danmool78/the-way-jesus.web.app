"""날개를 등에 붙이기: 자동 리깅이 등 뒤의 날개를 팔 뼈(그리고 아래쪽은 다리 뼈)에 붙여, 팔을 들면 날개가 팔과 함께 휘저어졌다(천사, 사용자 2026-11).
몸 뒤(앞이 +Z)에서 팔 줄기와 떨어진 꼭짓점과, 등 뒤로 옆으로 뻗은 꼭짓점을 모두 Spine2(등 위쪽)에 붙인다 — 날개는 가만히, 몸만 따라 움직인다.

  python3 _src/tools/glbwings.py _src/models/angel.glb [같은 파일에 덮어씀]"""
import json, struct, sys
import numpy as np

CT = {5126: '<f4', 5121: 'u1', 5123: '<u2'}

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
    def segd(A, B):
        d = B - A; t = np.clip(((P - A) @ d) / (d @ d + 1e-9), 0, 1); return np.linalg.norm(P - (A + t[:, None] * d), axis=1)
    arm_d = np.full(len(P), 9.0)
    for side in ('Left', 'Right'):
        chain = [jp[ix[side + k]] for k in ('Shoulder', 'Arm', 'ForeArm', 'Hand', 'HandMiddle1')]
        arm_d = np.minimum(arm_d, np.min([segd(chain[i], chain[i + 1]) for i in range(4)], axis=0))
    back = jp[ix['Spine2']][2]  # 등뼈의 앞뒤 자리
    x, y, z = P[:, 0], P[:, 1], P[:, 2]
    wing = ((z < back - 0.1) & (arm_d > 0.08) & (y > 0.55)) | ((z < back - 0.14) & (np.abs(x) > 0.12) & (y > 0.55))
    s2 = ix['Spine2']
    J[wing] = 0; J[wing, 0] = s2; W[wing] = 0; W[wing, 0] = 1
    b[jo:jo + J.nbytes] = J.astype(J.dtype).tobytes(); b[wo:wo + W.nbytes] = W.astype('<f4').tobytes()
    open(dst, 'wb').write(b)
    print(f'{src}: 날개 꼭짓점 {int(wing.sum())}개를 Spine2에 붙임 → {dst}')

if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else sys.argv[1])

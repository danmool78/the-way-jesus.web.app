"""지도 바탕 음영 기복도(assets/relief.webp) 생성.

AWS Open Data의 Terrarium 고도 타일(SRTM 등, Mapzen 제공)을 받아
app.js 지도와 같은 등장방형(위경도 선형) 격자로 다시 표본화한 뒤,
양피지 톤의 고도 채색 + 북서쪽 빛의 음영을 입힌다.

  python _src/relief.py <타일 캐시 폴더>

EXTENT를 바꾸면 app.js의 RELIEF도 같이 바꿀 것.
"""
import io
import math
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import numpy as np
from PIL import Image

EXTENT = dict(lat0=30.45, lat1=34.05, lng0=33.85, lng1=36.65)  # app.js RELIEF와 동일
COS = math.cos(32.3 * math.pi / 180)
PX_PER_UNIT = 0.8  # 지도 단위(1/1000도) 당 픽셀
Z = 10
URL = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'
OUT = Path(__file__).resolve().parent.parent / 'assets' / 'relief.webp'

# 고도(m) → 색. 바탕 땅색 #e3d5b4를 해수면 근처에 두고, 꺼진 요단 골짜기는 짙게, 헤르몬 정상은 희게
STOPS = [(-450, (196, 172, 126)), (-200, (210, 189, 146)), (0, (227, 213, 180)), (300, (228, 214, 179)),
         (700, (220, 203, 164)), (1100, (208, 189, 147)), (1900, (194, 178, 144)), (2600, (236, 231, 219))]


def tile_xy(lat, lng):
    n = 2 ** Z
    x = (lng + 180) / 360 * n
    y = (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n
    return x, y


def fetch(cache, x, y):
    f = cache / f'{Z}_{x}_{y}.png'
    if not f.exists():
        with urllib.request.urlopen(URL.format(z=Z, x=x, y=y), timeout=60) as r:
            f.write_bytes(r.read())
    a = np.asarray(Image.open(io.BytesIO(f.read_bytes())).convert('RGB'), dtype=np.float32)
    return a[..., 0] * 256 + a[..., 1] + a[..., 2] / 256 - 32768


def main(cache):
    cache = Path(cache)
    cache.mkdir(parents=True, exist_ok=True)
    e = EXTENT
    x0, y0 = tile_xy(e['lat1'], e['lng0'])
    x1, y1 = tile_xy(e['lat0'], e['lng1'])
    tx = range(int(x0), int(x1) + 1)
    ty = range(int(y0), int(y1) + 1)
    with ThreadPoolExecutor(8) as ex:
        tiles = {(x, y): ex.submit(fetch, cache, x, y) for x in tx for y in ty}
    mosaic = np.vstack([np.hstack([tiles[x, y].result() for x in tx]) for y in ty])

    # 출력 격자 (지도 투영과 같은 위경도 선형)
    w = round((e['lng1'] - e['lng0']) * COS * 1000 * PX_PER_UNIT)
    h = round((e['lat1'] - e['lat0']) * 1000 * PX_PER_UNIT)
    lng = e['lng0'] + (np.arange(w) + .5) / w * (e['lng1'] - e['lng0'])
    lat = e['lat1'] - (np.arange(h) + .5) / h * (e['lat1'] - e['lat0'])
    n = 2 ** Z
    mx = ((lng + 180) / 360 * n - tx.start) * 256
    my = ((1 - np.arcsinh(np.tan(np.radians(lat))) / np.pi) / 2 * n - ty.start) * 256
    MX, MY = np.meshgrid(mx - .5, my - .5)
    ix, iy = np.floor(MX).astype(int), np.floor(MY).astype(int)
    fx, fy = MX - ix, MY - iy
    g = lambda dy, dx: mosaic[np.clip(iy + dy, 0, mosaic.shape[0] - 1), np.clip(ix + dx, 0, mosaic.shape[1] - 1)]
    dem = (g(0, 0) * (1 - fx) + g(0, 1) * fx) * (1 - fy) + (g(1, 0) * (1 - fx) + g(1, 1) * fx) * fy

    # 지중해 해저는 평평하게 지운다(바다는 지도에서 벡터로 덮음). 각 행의 서쪽 끝에서
    # 첫 육지까지만 바다로 보므로, 해수면 아래인 요단·아라바 골짜기는 그대로 남는다
    first_land = np.argmax(dem > 0, axis=1)
    sea = np.arange(w)[None, :] < first_land[:, None]
    dem = np.where(sea, 0, dem)

    # 음영: 북서쪽(315°) 높이 40°의 빛, 고도 2.5배 과장
    dxm = (e['lng1'] - e['lng0']) / w * 111320 * np.cos(np.radians(lat))[:, None]
    dym = (e['lat1'] - e['lat0']) / h * 110574
    zf = 2.5
    gy, gx = np.gradient(dem * zf)
    gx, gy = gx / dxm, -gy / dym  # gy: 북쪽이 +
    az, alt = math.radians(315), math.radians(40)
    lx, ly, lz = math.sin(az) * math.cos(alt), math.cos(az) * math.cos(alt), math.sin(alt)
    shade = (-gx * lx - gy * ly + lz) / np.sqrt(gx ** 2 + gy ** 2 + 1)
    k = np.clip(1 + (shade - lz) * 0.95, 0.58, 1.22)

    el = np.array([s[0] for s in STOPS], dtype=np.float32)
    rgb = np.stack([np.interp(dem, el, [s[1][c] for s in STOPS]) for c in range(3)], -1) * k[..., None]

    # 가장자리는 투명하게 풀어 바탕 땅색으로 자연스럽게 이어지게
    ramp = lambda n, m: np.clip(np.minimum(np.arange(n), np.arange(n)[::-1]) / m, 0, 1)
    alpha = np.outer(ramp(h, h * .06), ramp(w, w * .06)) ** .8 * 255

    img = Image.fromarray(np.dstack([np.clip(rgb, 0, 255), alpha]).astype(np.uint8), 'RGBA')
    OUT.parent.mkdir(exist_ok=True)
    img.save(OUT, 'WEBP', quality=80, method=6)
    print(f'{OUT} {w}x{h} {OUT.stat().st_size // 1024}KB, dem {dem.min():.0f}..{dem.max():.0f}m')


if __name__ == '__main__':
    main(sys.argv[1])

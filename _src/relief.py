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

# 확대용 정밀 타일: 장소들이 모인 핵심 지역만, 약 30m 고도 자료로. app.js의 RELIEF_HI와 같게
HI = dict(lat0=30.95, lat1=33.45, lng0=34.6, lng1=36.0)
Z_HI = 12
HI_TILE_UNITS = 160  # 타일 한 장이 덮는 지도 단위
HI_TILE_PX = 512     # → 지도 단위당 3.2픽셀
HI_OUT = OUT.parent / 'relief-hi'

# 도성 확대용 초정밀 타일: 예루살렘과 감람산·베다니만, 약 8m 고도 자료로. app.js의 RELIEF_CITY와 같게
CITY = dict(lat0=31.74, lat1=31.81, lng0=35.19, lng1=35.28)
Z_CITY = 14
CITY_TILE_UNITS = 20  # → 지도 단위당 25.6픽셀
CITY_OUT = OUT.parent / 'relief-city'

# 고도(m) → 색. 낮은 땅은 밝은 모래색, 오를수록 황토·갈색 바위, 헤르몬 정상은 눈. 꺼진 요단 골짜기는 짙은 흙빛
STOPS = [(-450, (170, 140, 98)), (-200, (196, 166, 118)), (0, (226, 204, 156)), (300, (218, 192, 140)),
         (700, (196, 164, 114)), (1100, (172, 140, 100)), (1900, (150, 126, 100)), (2600, (242, 240, 234))]


def tile_xy(lat, lng, z):
    n = 2 ** z
    x = (lng + 180) / 360 * n
    y = (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n
    return x, y


def fetch(cache, z, x, y):
    f = cache / f'{z}_{x}_{y}.png'
    if not f.exists():
        with urllib.request.urlopen(URL.format(z=z, x=x, y=y), timeout=60) as r:
            f.write_bytes(r.read())
    a = np.asarray(Image.open(io.BytesIO(f.read_bytes())).convert('RGB'), dtype=np.float32)
    return a[..., 0] * 256 + a[..., 1] + a[..., 2] / 256 - 32768


def blur(a, r):
    """r픽셀 상자 흐림(가로·세로 각각 누적합)."""
    for ax in (0, 1):
        c = np.cumsum(np.pad(a, [(r + 1, r) if i == ax else (0, 0) for i in range(2)], mode='edge'), axis=ax)
        a = (np.take(c, range(2 * r + 1, c.shape[ax]), axis=ax) - np.take(c, range(0, c.shape[ax] - 2 * r - 1), axis=ax)) / (2 * r + 1)
    return a


# 연 강수량(mm) → (섞을 색, 비율). 사막은 그대로, 비가 많을수록 초원 → 올리브·관목 → 숲·곡창
# 갈릴리·해안 평야는 또렷한 초록으로, 유대 광야·네게브는 모래색 그대로 남긴다
VEG = [(180, (0, 0, 0), 0), (300, (196, 190, 118), .3), (450, (148, 166, 88), .55), (650, (102, 140, 72), .72)]


def rain_field(dem, lat, first_land, w):
    """1세기 식생 추정용 연 강수량(mm): 위도·고도·비그늘·내륙 거리로 어림한다.
    기후는 지금과 비슷했다고 보고, 오늘날 강수 분포를 흉내 낸 근사다."""
    km_px = (EXTENT['lng1'] - EXTENT['lng0']) / w * 111.32 * COS
    sm = blur(np.maximum(dem, 0), 6)
    # 서쪽(바람 불어오는 쪽) 약 36km 안의 가장 높은 능선
    ridge = sm.copy()
    s = 1
    while s < 36 / km_px:
        ridge[:, s:] = np.maximum(ridge[:, s:], ridge[:, :-s])
        s *= 2
    base = np.interp(lat, [31.0, 31.5, 32.0, 32.8, 33.5], [180, 330, 520, 640, 760])[:, None]
    oro = np.minimum(1 + sm / 1000 * .6, 1.35)
    shadow = np.exp(-np.maximum(ridge - dem, 0) / 700)
    inland = (np.arange(w)[None, :] - first_land[:, None]) * km_px
    cont = np.exp(-np.maximum(inland - 60, 0) / 60)
    return blur(base * oro * shadow * cont, 10)


def mosaic_for(cache, ext, z):
    """ext를 덮는 고도 타일을 받아 이어 붙인다. (모자이크, 첫 타일 x, 첫 타일 y)"""
    x0, y0 = tile_xy(ext['lat1'], ext['lng0'], z)
    x1, y1 = tile_xy(ext['lat0'], ext['lng1'], z)
    tx = range(int(x0), int(x1) + 1)
    ty = range(int(y0), int(y1) + 1)
    with ThreadPoolExecutor(8) as ex:
        tiles = {(x, y): ex.submit(fetch, cache, z, x, y) for x in tx for y in ty}
    return np.vstack([np.hstack([tiles[x, y].result() for x in tx]) for y in ty]), tx.start, ty.start


def sample(mos, z, lat, lng):
    """위경도 격자에서 모자이크를 쌍선형 보간으로 읽는다."""
    m, tx0, ty0 = mos
    n = 2 ** z
    mx = ((lng + 180) / 360 * n - tx0) * 256
    my = ((1 - np.arcsinh(np.tan(np.radians(lat))) / np.pi) / 2 * n - ty0) * 256
    MX, MY = np.meshgrid(mx - .5, my - .5)
    ix, iy = np.floor(MX).astype(int), np.floor(MY).astype(int)
    fx, fy = MX - ix, MY - iy
    g = lambda dy, dx: m[np.clip(iy + dy, 0, m.shape[0] - 1), np.clip(ix + dx, 0, m.shape[1] - 1)]
    return (g(0, 0) * (1 - fx) + g(0, 1) * fx) * (1 - fy) + (g(1, 0) * (1 - fx) + g(1, 1) * fx) * fy


def shading(dem, lat, lng, zf):
    """북서쪽(315°) 높이 40°의 빛. zf는 고도 과장 배율."""
    dxm = (lng[1] - lng[0]) * 111320 * np.cos(np.radians(lat))[:, None]
    dym = (lat[0] - lat[1]) * 110574
    gy, gx = np.gradient(dem * zf)
    gx, gy = gx / dxm, -gy / dym  # gy: 북쪽이 +
    az, alt = math.radians(315), math.radians(40)
    lx, ly, lz = math.sin(az) * math.cos(alt), math.cos(az) * math.cos(alt), math.sin(alt)
    shade = (-gx * lx - gy * ly + lz) / np.sqrt(gx ** 2 + gy ** 2 + 1)
    return np.clip(1 + (shade - lz) * 0.95, 0.58, 1.22)


def paint(dem, rain, land, k):
    """고도 채색 + 식생 + 음영."""
    el = np.array([s[0] for s in STOPS], dtype=np.float32)
    rgb = np.stack([np.interp(dem, el, [s[1][c] for s in STOPS]) for c in range(3)], -1)
    mm = np.array([v[0] for v in VEG])
    amt = np.interp(rain, mm, [v[2] for v in VEG])
    col = np.stack([np.interp(rain, mm, [v[1][c] if v[2] else VEG[1][1][c] for v in VEG]) for c in range(3)], -1)
    amt = amt * np.clip((2200 - dem) / 600, 0, 1) * land  # 헤르몬 높은 곳은 바위·눈, 바다 제외
    rgb = rgb * (1 - amt[..., None]) + col * amt[..., None]
    return np.clip(rgb * k[..., None], 0, 255)


def main(cache):
    cache = Path(cache)
    cache.mkdir(parents=True, exist_ok=True)
    e = EXTENT

    # 1) 전체 바탕 (assets/relief.webp)
    w = round((e['lng1'] - e['lng0']) * COS * 1000 * PX_PER_UNIT)
    h = round((e['lat1'] - e['lat0']) * 1000 * PX_PER_UNIT)
    lng = e['lng0'] + (np.arange(w) + .5) / w * (e['lng1'] - e['lng0'])
    lat = e['lat1'] - (np.arange(h) + .5) / h * (e['lat1'] - e['lat0'])
    dem = sample(mosaic_for(cache, e, Z), Z, lat, lng)

    # 지중해 해저는 평평하게 지운다(바다는 지도에서 벡터로 덮음). 각 행의 서쪽 끝에서
    # 첫 육지까지만 바다로 보므로, 해수면 아래인 요단·아라바 골짜기는 그대로 남는다
    first_land = np.argmax(dem > 0, axis=1)
    land = np.arange(w)[None, :] >= first_land[:, None]
    dem = np.where(land, dem, 0)
    rain = rain_field(dem, lat, first_land, w)
    rgb = paint(dem, rain, land, shading(dem, lat, lng, 2.5))

    # 가장자리는 투명하게 풀어 바탕 땅색으로 자연스럽게 이어지게
    ramp = lambda n, m: np.clip(np.minimum(np.arange(n), np.arange(n)[::-1]) / m, 0, 1)
    alpha = np.outer(ramp(h, h * .06), ramp(w, w * .06)) ** .8 * 255
    img = Image.fromarray(np.dstack([rgb, alpha]).astype(np.uint8), 'RGBA')
    OUT.parent.mkdir(exist_ok=True)
    img.save(OUT, 'WEBP', quality=80, method=6)
    print(f'{OUT} {w}x{h} {OUT.stat().st_size // 1024}KB, dem {dem.min():.0f}..{dem.max():.0f}m')

    # 2) 확대용 정밀 타일 (assets/relief-hi/행_열.webp), 3) 도성 초정밀 타일 (assets/relief-city/)
    # 강수량·해안선은 바탕 격자에서 보간
    coast = e['lng0'] + (first_land + .5) / w * (e['lng1'] - e['lng0'])  # 행마다 첫 육지 경도
    for ext, z, units, out, zf in [(HI, Z_HI, HI_TILE_UNITS, HI_OUT, 1.8), (CITY, Z_CITY, CITY_TILE_UNITS, CITY_OUT, 1.4)]:
        tiles(cache, ext, z, units, out, zf, lat, lng, coast, rain, w, h)


def tiles(cache, ext, z, units, out, zf, lat, lng, coast, rain, w, h):
    mos = mosaic_for(cache, {**ext, 'lat0': ext['lat0'] - .05 * units / 160, 'lng1': ext['lng1'] + .05 * units / 160}, z)
    cols = math.ceil((ext['lng1'] - ext['lng0']) * COS * 1000 / units)
    rows = math.ceil((ext['lat1'] - ext['lat0']) * 1000 / units)
    out.mkdir(exist_ok=True)
    total, P = 0, HI_TILE_PX
    for r in range(rows):
        for c in range(cols):
            # 경사 계산이 타일 경계에서 끊기지 않게 1픽셀씩 여유를 두고 계산한 뒤 잘라 낸다
            u = (np.arange(-1, P + 1) + .5) / P * units
            tlng = ext['lng0'] + (c * units + u) / (COS * 1000)
            tlat = ext['lat1'] - (r * units + u) / 1000
            tdem = sample(mos, z, tlat, tlng)
            tland = tlng[None, :] >= np.interp(tlat, lat[::-1], coast[::-1])[:, None]
            tdem = np.where(tland, tdem, 0)
            # 바탕 강수량을 이 타일 좌표로 쌍선형 보간
            fx = np.interp(tlng, lng, np.arange(w)); fy = np.interp(tlat, lat[::-1], np.arange(h)[::-1])
            FX, FY = np.meshgrid(fx, fy)
            ix, iy = np.clip(np.floor(FX).astype(int), 0, w - 2), np.clip(np.floor(FY).astype(int), 0, h - 2)
            ax, ay = FX - ix, FY - iy
            train = (rain[iy, ix] * (1 - ax) + rain[iy, ix + 1] * ax) * (1 - ay) + (rain[iy + 1, ix] * (1 - ax) + rain[iy + 1, ix + 1] * ax) * ay
            trgb = paint(tdem, train, tland, shading(tdem, tlat, tlng, zf))[1:-1, 1:-1]
            f = out / f'{r}_{c}.webp'
            Image.fromarray(trgb.astype(np.uint8), 'RGB').save(f, 'WEBP', quality=74, method=6)
            total += f.stat().st_size
    print(f'{out} {rows}x{cols} tiles, {total // 1024}KB')


if __name__ == '__main__':
    main(sys.argv[1])

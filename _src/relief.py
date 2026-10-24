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

EXTENT = dict(lat0=29.15, lat1=34.6, lng0=33.0, lng1=37.4)  # app.js RELIEF와 동일 (넓은 화면에서도 가장자리가 비지 않게)
COS = math.cos(32.3 * math.pi / 180)
PX_PER_UNIT = 0.56  # 지도 단위(1/1000도) 당 픽셀 (휴대폰 메모리를 생각해 약 650만 화소 이내로)
Z = 10
# 애굽 쪽 바탕: 본 바탕의 서쪽에 이어 붙인다 (겹치는 띠는 가장자리 투명으로 섞인다). app.js의 RELIEF_WEST와 같게
WEST = dict(lat0=29.15, lat1=31.9, lng0=29.4, lng1=33.25)
# 강물로 푸른 땅 (비는 거의 없다): 나일 삼각주 전체, 카이로 남쪽 나일 골짜기의 띠, 파이윰 오아시스, 동쪽 와디 투밀라트
DELTA = [(30.12, 31.2), (30.45, 30.82), (30.85, 30.35), (31.12, 30.1), (31.3, 30.05), (31.48, 30.4), (31.58, 30.95), (31.56, 31.45),
         (31.48, 31.85), (31.3, 32.15), (31.05, 32.25), (30.62, 32.1), (30.55, 31.9), (30.4, 31.55), (30.2, 31.35)]
# 나일과 1세기 지류들 (app.js의 GEO.nile 등과 같은 점) — 물가의 짙은 초록 띠를 그리는 데 쓴다
NILE = [[(29.15, 31.18), (29.5, 31.22), (29.85, 31.26), (30.06, 31.23), (30.18, 31.13)],
        [(30.18, 31.13), (30.5, 30.85), (30.8, 30.55), (31.1, 30.25), (31.32, 30.07)],
        [(30.18, 31.13), (30.6, 30.95), (30.95, 30.78), (31.2, 30.55), (31.46, 30.37)],
        [(30.18, 31.13), (30.5, 31.2), (30.8, 31.25), (31.05, 31.42), (31.3, 31.65), (31.52, 31.84)],
        [(30.18, 31.13), (30.45, 31.4), (30.57, 31.51), (30.75, 31.75), (30.9, 32.1), (31.04, 32.55)]]
NILE_VALLEY = [(30.12, 31.17), (29.8, 31.18), (29.5, 31.12), (29.15, 31.08), (29.15, 31.3), (29.5, 31.32), (29.8, 31.33), (30.12, 31.3)]
FAYUM = [(29.45, 30.55), (29.5, 30.85), (29.35, 31.05), (29.2, 31.0), (29.17, 30.7), (29.3, 30.5)]
WADI_TUMILAT = [(30.52, 31.6), (30.58, 31.95), (30.6, 32.25), (30.52, 32.25), (30.48, 31.95), (30.45, 31.6)]
URL = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'
OUT = Path(__file__).resolve().parent.parent / 'assets' / 'relief.webp'

# 확대용 정밀 타일: 바탕과 거의 같은 넓이로, 약 30m 고도 자료로. app.js의 RELIEF_HI와 같게
# (핵심 지역만 덮었더니 넓은 화면에서 그 바깥만 흐려 지도를 일부만 그린 것처럼 보였다)
HI = dict(lat0=30.2, lat1=34.4, lng0=33.4, lng1=37.0)
Z_HI = 12
HI_TILE_UNITS = 160  # 타일 한 장이 덮는 지도 단위
HI_TILE_PX = 512     # → 지도 단위당 3.2픽셀
HI_OUT = OUT.parent / 'relief-hi'
# 애굽 쪽 정밀 타일: 나일 삼각주·시나이 북부. app.js의 RELIEF_HI_W와 같게
HI_W = dict(lat0=29.3, lat1=31.7, lng0=29.7, lng1=33.4)

# 도성 확대용 초정밀 타일: 예루살렘과 감람산·베다니만, 약 8m 고도 자료로. app.js의 RELIEF_CITY와 같게
CITY = dict(lat0=31.74, lat1=31.81, lng0=35.19, lng1=35.28)
Z_CITY = 14
CITY_TILE_UNITS = 20  # → 지도 단위당 25.6픽셀
CITY_OUT = OUT.parent / 'relief-city'

# 고도(m) → 색. 낮은 땅은 밝은 모래색, 오를수록 황토·갈색 바위, 헤르몬 정상은 눈. 꺼진 요단 골짜기는 짙은 흙빛
STOPS = [(-450, (170, 140, 98)), (-200, (196, 166, 118)), (0, (226, 204, 156)), (300, (218, 192, 140)),
         (700, (196, 164, 114)), (1100, (172, 140, 100)), (1900, (150, 126, 100)), (2600, (242, 240, 234))]

EGYPT_GREEN = [DELTA, NILE_VALLEY, FAYUM, WADI_TUMILAT]


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


def hash2(a, b):
    return np.modf(np.abs(np.sin(a * 12.9898 + b * 78.233) * 43758.5453))[0]


def vnoise(lat, lng, cell):
    """위경도 격자 위의 부드러운 값 잡음 (0~1). 바탕과 정밀 타일이 같은 값을 갖도록 위경도로만 정한다"""
    Y, X = lat[:, None] / cell, lng[None, :] / cell
    y0, x0 = np.floor(Y), np.floor(X)
    fy, fx = Y - y0, X - x0
    fy, fx = fy * fy * (3 - 2 * fy), fx * fx * (3 - 2 * fx)
    a, b, c, d = hash2(y0, x0), hash2(y0, x0 + 1), hash2(y0 + 1, x0), hash2(y0 + 1, x0 + 1)
    return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy


def farmland(lat, lng, polys):
    """강물로 짓는 밭: (덮는 정도 0~1, 색). 다각형 가장자리는 잡음으로 들쭉날쭉하게, 안은 크고 작은 밭 조각
    (푸른 보리·밀, 누런 밀, 아마, 묵힌 땅)의 조각보, 물줄기에서 1~2km 안은 짙은 초록(대추야자·갈대)"""
    from PIL import ImageDraw
    h, w = len(lat), len(lng)
    m = Image.new('L', (w, h), 0)
    sx = lambda g: (g - lng[0]) / (lng[-1] - lng[0]) * (w - 1)
    sy = lambda a: (lat[0] - a) / (lat[0] - lat[-1]) * (h - 1)
    for poly in polys:
        ImageDraw.Draw(m).polygon([(sx(g), sy(a)) for a, g in poly], fill=255)
    px_deg = abs(lat[0] - lat[-1]) / h
    m = blur(np.asarray(m, dtype=np.float32) / 255, max(1, int(0.03 / px_deg)))
    edge = vnoise(lat, lng, 0.06) * 0.6 + vnoise(lat, lng, 0.015) * 0.4
    cover = np.clip((m - 0.5 + (edge - 0.5) * 0.55) * 6 + 0.5, 0, 1)
    # 밭 조각: 약 2km 조각마다 작물 색(푸른 보리·밀, 누런 밀, 아마, 묵힌 땅), 그 안의 약 600m 조각은 밝기만 조금씩.
    # 바둑판처럼 보이지 않게 칸 경계를 잡음으로 휘고 칸마다 살짝 비튼다. 색 차이도 작게 (멀리서는 고른 초록으로 보이게)
    LA, LO = lat[:, None] + 0.006 * (vnoise(lat, lng, 0.03) - 0.5), lng[None, :] + 0.007 * (vnoise(lat + 3, lng, 0.03) - 0.5)
    U, V = LA * 0.94 + LO * 0.34, LO * 0.94 - LA * 0.34
    big = hash2(np.floor(U / 0.018), np.floor(V / 0.022))
    small = hash2(np.floor(U / 0.0055) + 7, np.floor(V / 0.0065) + 3)
    pal = np.array([(108, 142, 68), (118, 148, 72), (126, 152, 76), (146, 154, 84), (124, 140, 80), (112, 136, 70)], np.float32)
    idx = np.minimum((big * len(pal)).astype(int), len(pal) - 1)
    col = pal[idx] * (0.97 + 0.05 * small[..., None]) * (0.95 + 0.1 * vnoise(lat, lng, 0.05)[..., None])
    col = np.stack([blur(col[..., c], 1) for c in range(3)], -1)
    # 물줄기 둘레의 짙은 초록
    near = np.full((h, w), 1e9, np.float32)
    LA, LO = lat[:, None], lng[None, :] * COS
    for line in NILE:
        for (a1, g1), (a2, g2) in zip(line, line[1:]):
            ax, ay, bx, by = g1 * COS, a1, g2 * COS, a2
            dx, dy = bx - ax, by - ay
            t = np.clip(((LO - ax) * dx + (LA - ay) * dy) / (dx * dx + dy * dy), 0, 1)
            near = np.minimum(near, np.hypot(LO - ax - t * dx, LA - ay - t * dy))
    river = np.clip(1 - near / 0.02, 0, 1) ** 1.5
    col = col * (1 - river[..., None] * 0.55) + np.array([62, 104, 50], np.float32) * river[..., None] * 0.55
    return np.maximum(cover, river * (m > 0.05)), col


def paint(dem, rain, land, k, farm=None):
    """고도 채색 + 식생 + 음영. farm: (덮는 정도, 색) — 강물로 짓는 밭"""
    el = np.array([s[0] for s in STOPS], dtype=np.float32)
    rgb = np.stack([np.interp(dem, el, [s[1][c] for s in STOPS]) for c in range(3)], -1)
    mm = np.array([v[0] for v in VEG])
    amt = np.interp(rain, mm, [v[2] for v in VEG])
    col = np.stack([np.interp(rain, mm, [v[1][c] if v[2] else VEG[1][1][c] for v in VEG]) for c in range(3)], -1)
    amt = amt * np.clip((2200 - dem) / 600, 0, 1) * land  # 헤르몬 높은 곳은 바위·눈, 바다 제외
    rgb = rgb * (1 - amt[..., None]) + col * amt[..., None]
    if farm is not None:
        fc, fcol = farm
        fc = fc * land
        rgb = rgb * (1 - fc[..., None]) + fcol * fc[..., None]
    return np.clip(rgb * k[..., None], 0, 255)


def base(cache, e, out, green=None, keep=''):
    """넓은 바탕 한 장. green: 강·관개로 푸른 땅의 (위도, 경도) 다각형들 — 비가 적어도 초록으로 칠한다(나일 삼각주).
    keep: 투명하게 풀지 않을 가장자리('l','r') — 두 장이 맞닿는 쪽을 둘 다 풀면 그 사이로 바탕색 띠가 보인다"""
    w = round((e['lng1'] - e['lng0']) * COS * 1000 * PX_PER_UNIT)
    h = round((e['lat1'] - e['lat0']) * 1000 * PX_PER_UNIT)
    lng = e['lng0'] + (np.arange(w) + .5) / w * (e['lng1'] - e['lng0'])
    lat = e['lat1'] - (np.arange(h) + .5) / h * (e['lat1'] - e['lat0'])
    dem = sample(mosaic_for(cache, e, Z), Z, lat, lng)

    # 지중해 해저는 평평하게 지운다(바다는 지도에서 벡터로 덮음). 각 행의 서쪽 끝에서
    # 첫 육지까지만 바다로 보므로, 해수면 아래인 요단·아라바 골짜기는 그대로 남는다.
    # 육지가 하나도 없는 행(삼각주 북쪽 바다)은 통째로 바다
    has = (dem > 0).any(axis=1)
    first_land = np.where(has, np.argmax(dem > 0, axis=1), w)
    land = np.arange(w)[None, :] >= first_land[:, None]
    dem = np.where(land, dem, 0)
    rain = rain_field(dem, lat, np.minimum(first_land, w - 1), w)
    rgb = paint(dem, rain, land, shading(dem, lat, lng, 2.5), farmland(lat, lng, green) if green else None)

    # 가장자리는 투명하게 풀어 바탕 땅색으로 자연스럽게 이어지게
    ramp = lambda n, m: np.clip(np.minimum(np.arange(n), np.arange(n)[::-1]) / m, 0, 1)
    rx = ramp(w, w * .06)
    if 'l' in keep: rx[:w // 2] = 1
    if 'r' in keep: rx[w // 2:] = 1
    alpha = np.outer(ramp(h, h * .06), rx) ** .8 * 255
    img = Image.fromarray(np.dstack([rgb, alpha]).astype(np.uint8), 'RGBA')
    out.parent.mkdir(exist_ok=True)
    img.save(out, 'WEBP', quality=80, method=6)
    print(f'{out} {w}x{h} {out.stat().st_size // 1024}KB, dem {dem.min():.0f}..{dem.max():.0f}m')
    return lat, lng, first_land, rain, w, h


def main(cache):
    cache = Path(cache)
    cache.mkdir(parents=True, exist_ok=True)
    e = EXTENT

    # 1) 전체 바탕 (assets/relief.webp), 서쪽 애굽 쪽 바탕 (assets/relief-west.webp — 시나이 북부와 나일 삼각주 동쪽)
    lat, lng, first_land, rain, w, h = base(cache, e, OUT, keep='l')
    wlat, wlng, wfirst, wrain, ww, wh = base(cache, WEST, OUT.parent / 'relief-west.webp', green=EGYPT_GREEN, keep='r')
    wcoast = WEST['lng0'] + (np.minimum(wfirst, ww - 1) + .5) / ww * (WEST['lng1'] - WEST['lng0'])

    # 2) 확대용 정밀 타일 (assets/relief-hi/행_열.webp), 3) 도성 초정밀 타일 (assets/relief-city/)
    # 강수량·해안선은 바탕 격자에서 보간
    coast = e['lng0'] + (first_land + .5) / w * (e['lng1'] - e['lng0'])  # 행마다 첫 육지 경도
    for ext, z, units, out, zf in [(HI, Z_HI, HI_TILE_UNITS, HI_OUT, 1.8), (CITY, Z_CITY, CITY_TILE_UNITS, CITY_OUT, 1.4)]:
        tiles(cache, ext, z, units, out, zf, lat, lng, coast, rain, w, h)
    # 애굽 쪽 확대용 정밀 타일 (assets/relief-hi-w/) — 강수량(푸른 땅)은 서쪽 바탕 격자에서
    tiles(cache, HI_W, Z_HI, HI_TILE_UNITS, OUT.parent / 'relief-hi-w', 1.8, wlat, wlng, wcoast, wrain, ww, wh, green=EGYPT_GREEN)


def tiles(cache, ext, z, units, out, zf, lat, lng, coast, rain, w, h, green=None):
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
            trgb = paint(tdem, train, tland, shading(tdem, tlat, tlng, zf), farmland(tlat, tlng, green) if green else None)[1:-1, 1:-1]
            f = out / f'{r}_{c}.webp'
            Image.fromarray(trgb.astype(np.uint8), 'RGB').save(f, 'WEBP', quality=70, method=6)
            total += f.stat().st_size
    print(f'{out} {rows}x{cols} tiles, {total // 1024}KB')


if __name__ == '__main__':
    main(sys.argv[1])

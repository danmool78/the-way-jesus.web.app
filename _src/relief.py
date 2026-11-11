"""지도 바탕 음영 기복도(assets/relief.webp) 생성.

AWS Open Data의 Terrarium 고도 타일(SRTM 등, Mapzen 제공)을 받아
app.js 지도와 같은 등장방형(위경도 선형) 격자로 다시 표본화한 뒤,
양피지 톤의 고도 채색 + 북서쪽 빛의 음영을 입힌다.

  python _src/relief.py <타일 캐시 폴더> [east|south|west|meso|med]   (그 바탕만)

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
# 프롤로그의 에덴(메소포타미아 남부) 둘레 바탕: 다른 바탕과 떨어져 홀로 있다. app.js의 RELIEF_EAST와 같게
EAST = dict(lat0=29.2, lat1=32.8, lng0=44.6, lng1=49.9)
# 동산의 땅: 화면을 꽉 채우는 푸른 들 (높은 자그로스 산자락만 바위). 들판 조각보 대신 부드러운 풀빛 얼룩으로 (farmland의 meadow)
MESO_GREEN = [[(32.8, 44.6), (32.8, 49.9), (29.2, 49.9), (29.2, 44.6)]]
# 시내 반도·미디안 바탕(모세와 여호수아 여정): 본 바탕과 애굽 쪽 바탕의 남쪽에 이어 붙인다. app.js 여정 설정(journey.map)의 RELIEF_SOUTH와 같게.
# 사막이라 비·풀빛 없이(dry) 바위와 모래로만 칠한다. 홍해의 두 만은 지도에서 벡터로 덮는다
SOUTH = dict(lat0=27.2, lat1=30.15, lng0=31.25, lng1=37.4)  # 북쪽은 수에즈 만 끝(30.0)까지 — 지도에서 다른 바탕들 위에 깐다
# 시내 광야의 색 (relief-south와 3D 시내·네게브 지역이 함께 쓴다, terrain.js의 OASES와 같게):
# - 남쪽 시내의 높은 산지와 미디안의 산은 붉은 화강암 — 모래색 대신 붉은 바위빛으로
# - 오아시스: 샘가의 종려나무 숲 (엘림 와디 가란델, 르비딤 곁 와디 페이란, 가데스 아인 쿠데이랏, 미디안 알바드)
OASES = [(29.28, 32.97, .02), (28.70, 33.65, .03), (30.65, 34.42, .018), (28.48, 35.0, .02)]
# 시리아 사막과 메소포타미아 바탕(열왕기 여정 — 바벨론 포로길): 본 바탕 밑에 넓게 깐다. app.js 여정 설정(journey.map.meso)의 RELIEF_MESO와 같게.
# 멀리 지나가는 땅이라 해상도를 낮춰(지도 단위당 0.24픽셀, 고도는 z9) 다른 바탕과 비슷한 파일 크기로. 서쪽 끝은 레바논·시리아 해안(바다는 그림에 칠함)
MESO = dict(lat0=26.9, lat1=37.6, lng0=35.6, lng1=46.2)  # 남쪽은 시내 반도 바탕의 동쪽(아라비아)까지 — 바벨론 장면의 전체 경로에 호렙산도 함께 들어온다
# 바벨론 둘레를 가까이 볼 때 그 위에 얹는 더 고운 바탕 (지도 단위당 1픽셀, 고도 z10). app.js의 RELIEF_BABYLON과 같게
BABYLON = dict(lat0=31.95, lat1=33.15, lng0=43.65, lng1=45.2)
# 강물로 푸른 땅: app.js의 GEO.euphrates·GEO.tigris와 같은 점 (도시들로 짚은 물길). 이 선 둘레 몇 km만 초록으로
EUPHRATES = [(38.75, 38.75), (37.6, 38.3), (37.0, 38.05), (36.6, 38.15), (36.05, 38.15), (35.9, 38.55), (35.95, 39.0), (35.69, 39.82), (35.33, 40.14), (35.02, 40.45),
             (34.45, 40.92), (34.37, 41.1), (34.47, 41.9), (34.13, 42.38), (33.87, 42.53), (33.64, 42.83), (33.42, 43.3), (33.35, 43.78), (32.78, 44.29), (32.54, 44.42),
             (32.03, 44.4), (31.6, 44.9), (31.31, 45.28)]
TIGRIS = [(38.0, 40.2), (37.5, 41.6), (37.32, 42.19), (36.34, 43.13), (35.47, 43.26), (34.93, 43.48), (34.6, 43.68), (34.2, 43.87), (34.0, 44.15), (33.32, 44.42),
          (33.1, 44.58), (32.9, 44.9), (32.5, 45.82), (31.84, 47.15)]
# 바벨론 땅(두 강 사이의 충적 평야): 운하로 물을 대어 온통 밭이었다 — 낮은 땅(70m 아래)만
BABYLONIA = [(34.25, 43.75), (33.55, 43.45), (33.05, 43.95), (32.45, 44.15), (31.85, 44.35), (31.3, 44.95), (31.1, 45.6), (31.4, 46.2), (32.3, 46.2),
             (32.7, 45.6), (33.35, 44.85), (34.0, 44.4), (34.35, 44.0)]

# 지중해 동쪽·가운데 바탕(바울 여정 — journey.map.med): 예루살렘에서 로마까지. app.js의 RELIEF_MED와 같게.
# 다른 바탕들은 바다를 땅색으로 지우고 벡터 바다를 덮지만, 이 넓은 바다의 섬·반도를 손으로 그릴 수는 없어서
# 고도 자료의 해안선 그대로 바다를 투명하게 비운다(지도는 그 밑에 바다색을 깐다). 레반트·애굽(HOLE)도 투명하게 비워
# 그 밑의 원래 바탕(relief·relief-west, 정밀 타일, 벡터 바다·호수·강)이 그대로 보이게 한다
MED = dict(lat0=30.5, lat1=43.0, lng0=11.0, lng1=38.0)
MED_PPU, MED_Z = .16, 8  # 약 700m 한 픽셀 — 1.5MB 안으로
# 장면 둘레를 가까이 볼 때 얹는 고운 타일(assets/relief-med-hi/행_열.webp, 바울의 장소 둘레에만 — tiles.json에 목록). app.js의 RELIEF_MED_HI와 같게
MED_HI_UNITS, MED_HI_Z = 256, 11  # 512픽셀 → 지도 단위당 2픽셀
MED_HI_REACH = (.62, .6)  # 장소 둘레 (경도, 위도)° — 휴대폰 세로 화면의 장면 보기까지 덮게
# 비워 두는 자리: [(북, 서, 남, 동)] — 원래 바탕이 불투명한 곳 안쪽으로 (가장자리의 투명한 띠를 피해서)
MED_HOLE = [(34.25, 33.75, 0, 37.0), (31.6, 29.75, 0, 37.0)]
MED_HOLE_SOFT = .12


def med_hole(lat, lng):
    """레반트·애굽 자리에서 1(비움) → 바깥 0, 경계는 부드럽게"""
    LA, LO = lat[:, None], lng[None, :]
    s = lambda d: np.clip(d / MED_HOLE_SOFT + .5, 0, 1)
    return np.maximum.reduce([s(n - LA) * s(LO - w) * s(e - LO) for n, w, _, e in MED_HOLE])


def coast_km(land, km_px):
    """바다까지의 거리(km) 어림: 둘레의 바다 비율을 반지름을 늘려 가며 본다 (scipy 없이)"""
    sea = (~land).astype(np.float32)
    d = np.full(land.shape, np.inf, np.float32)
    r = 1
    while r < 400:
        f = blur(sea, r)
        d = np.where(np.isinf(d) & (f > .004), r, d)
        r *= 2
    d = np.where(np.isinf(d), 400, d)
    d = np.where(land, d, 0)
    return blur(d, 6) * km_px


def med_rain(dem, land, lat, km_px):
    """지중해 둘레의 연 강수량(mm) 어림: 위도(남쪽 리비아·애굽 해안은 메마르다) × 고도 × 바다에서의 거리 × 비그늘.
    비그늘은 바다에서 먼 내륙에서만 — 해안 평야(밤빌리아)가 뒤의 높은 산 때문에 메마르게 칠해지지 않게"""
    sm = blur(np.maximum(dem, 0), 3)
    d = coast_km(land, km_px)
    base = np.interp(lat, [30.5, 31.5, 32.5, 34.0, 36.0, 38.0, 40.0, 43.0], [40, 120, 260, 400, 440, 470, 540, 700])[:, None]
    oro = np.minimum(1 + sm / 1000 * .6, 1.45)
    ridge = sm.copy()
    s = 1
    while s < 90 / km_px:  # 둘레 약 90km 안의 가장 높은 능선 (사방)
        for ax in (0, 1):
            a = np.moveaxis(ridge, ax, 0)
            a[s:] = np.maximum(a[s:], a[:-s]); a[:-s] = np.maximum(a[:-s], a[s:].copy())
        s *= 2
    shadow = np.exp(-np.maximum(ridge - sm, 0) / 1100)
    far = 1 - np.exp(-d / 70)
    cont = np.exp(-np.maximum(d - 40, 0) / 260)
    return blur(base * oro * (1 - far + far * shadow) * cont, 4)


def med_paint(dem, land, rain, lat, lng, zf):
    """땅은 다른 바탕과 같은 고도 채색·식생·음영, 바다는 투명. 해안에는 지도의 해안선(.coast)처럼 옅은 띠를 1픽셀"""
    lf = land.astype(np.float32)
    rgb = paint(np.where(land, dem, 0), rain, lf, shading(np.where(land, dem, 0), lat, lng, zf))
    soft = blur(lf, 1)  # 해안의 계단을 조금 누그러뜨린다
    rim = np.clip((soft - lf) * 3, 0, 1) * (~land)  # 바다 쪽 바로 바깥 한 픽셀
    rgb = np.where(rim[..., None] > 0, np.array([246, 239, 220], np.float32), rgb)
    alpha = np.maximum(lf, rim * .55)
    alpha = alpha * (1 - med_hole(lat, lng))
    return np.dstack([rgb, alpha * 255]).astype(np.uint8)


def med(cache):
    e = MED
    w = round((e['lng1'] - e['lng0']) * COS * 1000 * MED_PPU)
    h = round((e['lat1'] - e['lat0']) * 1000 * MED_PPU)
    lng = e['lng0'] + (np.arange(w) + .5) / w * (e['lng1'] - e['lng0'])
    lat = e['lat1'] - (np.arange(h) + .5) / h * (e['lat1'] - e['lat0'])
    dem = sample(mosaic_for(cache, e, MED_Z), MED_Z, lat, lng)
    land = dem > 0
    km_px = (e['lng1'] - e['lng0']) / w * 111.32 * COS
    rain = med_rain(dem, land, lat, km_px)
    out = OUT.parent / 'relief-med.webp'
    Image.fromarray(med_paint(dem, land, rain, lat, lng, 3.2), 'RGBA').save(out, 'WEBP', quality=72, method=6)
    print(f'{out} {w}x{h} {out.stat().st_size // 1024}KB')
    # 고운 타일: 바울의 장소(레반트 밖) 둘레만
    import json
    places = json.loads((Path(__file__).parent / 'journeys' / 'paul' / 'places.json').read_text())
    T, P = MED_HI_UNITS, HI_TILE_PX
    ox, oy = 0, 0  # 타일 격자는 MED의 북서쪽 모서리에서
    cols = math.ceil((e['lng1'] - e['lng0']) * COS * 1000 / T)
    rows = math.ceil((e['lat1'] - e['lat0']) * 1000 / T)
    want = set()
    for p in places.values():
        if p.get('region') == '바다' or med_hole(np.array([p['lat']]), np.array([p['lng']]))[0, 0] > 0:
            continue
        c0 = int(((p['lng'] - MED_HI_REACH[0]) - e['lng0']) * COS * 1000 // T)
        c1 = int(((p['lng'] + MED_HI_REACH[0]) - e['lng0']) * COS * 1000 // T)
        r0 = int((e['lat1'] - (p['lat'] + MED_HI_REACH[1])) * 1000 // T)
        r1 = int((e['lat1'] - (p['lat'] - MED_HI_REACH[1])) * 1000 // T)
        want |= {(r, c) for r in range(max(0, r0), min(rows - 1, r1) + 1) for c in range(max(0, c0), min(cols - 1, c1) + 1)}
    hi = OUT.parent / 'relief-med-hi'
    hi.mkdir(exist_ok=True)
    for f in hi.glob('*.webp'):
        f.unlink()
    have, total = [], 0
    for r, c in sorted(want):
        u = (np.arange(-1, P + 1) + .5) / P * T
        tlng = e['lng0'] + (c * T + u) / (COS * 1000)
        tlat = e['lat1'] - (r * T + u) / 1000
        ext = dict(lat0=tlat.min(), lat1=tlat.max(), lng0=tlng.min(), lng1=tlng.max())
        tdem = sample(mosaic_for(cache, ext, MED_HI_Z), MED_HI_Z, tlat, tlng)
        tland = tdem > 0
        if not tland.any():
            continue  # 바다뿐인 타일은 만들지 않는다 (밑의 바다색 그대로)
        fx = np.interp(tlng, lng, np.arange(w)); fy = np.interp(tlat, lat[::-1], np.arange(h)[::-1])
        FX, FY = np.meshgrid(fx, fy)
        ix, iy = np.clip(np.floor(FX).astype(int), 0, w - 2), np.clip(np.floor(FY).astype(int), 0, h - 2)
        ax, ay = FX - ix, FY - iy
        train = (rain[iy, ix] * (1 - ax) + rain[iy, ix + 1] * ax) * (1 - ay) + (rain[iy + 1, ix] * (1 - ax) + rain[iy + 1, ix + 1] * ax) * ay
        img = med_paint(tdem, tland, train, tlat, tlng, 1.8)[1:-1, 1:-1]
        f = hi / f'{r}_{c}.webp'
        Image.fromarray(img, 'RGBA').save(f, 'WEBP', quality=70, method=6)
        total += f.stat().st_size
        have.append(f'{r}_{c}')
    (hi / 'tiles.json').write_text(json.dumps(have, separators=(',', ':')))
    print(f'{hi} {len(have)} tiles, {total // 1024}KB')


def desert_tint(rgb, dem, lat, lng):
    LA, LO = lat[:, None], lng[None, :]
    south = np.clip((29.05 - LA) / .2, 0, 1)
    high = np.clip((dem - 550) / 650, 0, 1)
    grain = .85 + .3 * vnoise(lat, lng, .05)  # 바위 결: 고르게 칠하지 않는다
    g = (south * high * grain)[..., None] * .75
    rgb = rgb * (1 - g) + rgb * np.array([1.0, .74, .64]) * g
    for a, o, r in OASES:  # 물가는 짙은 종려 초록, 가장자리는 잡음으로 들쭉날쭉
        d = np.hypot((LA - a) / r, (LO - o) * COS / r) + (vnoise(lat, lng, r / 2) - .5) * .8
        m = np.clip(1.4 - d, 0, 1)[..., None] * .85
        rgb = rgb * (1 - m) + np.array([92, 120, 64]) * (rgb / 200) * m
    return rgb


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
    for k in range(5):  # 많이 받을 때 가끔 연결이 끊긴다 — 몇 번 다시
        if f.exists():
            break
        try:
            with urllib.request.urlopen(URL.format(z=z, x=x, y=y), timeout=60) as r:
                f.write_bytes(r.read())
        except OSError:
            if k == 4:
                raise
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


def rain_field(dem, lat, first_land, w, e=EXTENT):
    """1세기 식생 추정용 연 강수량(mm): 위도·고도·비그늘·내륙 거리로 어림한다.
    기후는 지금과 비슷했다고 보고, 오늘날 강수 분포를 흉내 낸 근사다. e: 바탕의 범위 (애굽 쪽 바탕은 예전처럼 본 바탕 값으로 셈)"""
    km_px = (e['lng1'] - e['lng0']) / w * 111.32 * COS
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


def flood(cache, lat, lng):
    """애굽의 강물 땅이 닿는 높이: 범람원(삼각주 북쪽 약 16m, 남쪽 꼭지로 갈수록 조금 높게)보다 높은 땅은 사막으로 둔다.
    손으로 찍은 다각형만으로 칠하면 경계가 둥근 덩어리였다 — 이것을 곱하면 경계가 사막 턱을 따라 들쭉날쭉하고,
    와디 투밀랏은 골짜기 모양대로 가늘어진다. 바탕과 정밀 타일이 같은 값을 갖도록 z10 고도(이미 부드럽다)와 위경도 잡음으로만 정한다"""
    e = dict(lat0=lat.min() - .01, lat1=lat.max() + .01, lng0=lng.min() - .01, lng1=lng.max() + .01)
    d = sample(mosaic_for(cache, e, 10), 10, lat, lng)
    thr = 16 + np.clip(30.9 - lat, 0, None)[:, None] * 18
    return np.clip((thr - d) / 5 + (vnoise(lat, lng, .01) - .5) * .8, 0, 1)


def farmland(lat, lng, polys, lines=NILE, meadow=False):
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
    if meadow:  # 조각보는 가까이서 각진 칸으로 보인다: 여러 크기의 부드러운 잡음으로 풀빛·숲빛만 섞는다
        n = vnoise(lat, lng, 0.4) * 0.5 + vnoise(lat + 5, lng, 0.12) * 0.3 + vnoise(lat, lng + 5, 0.035) * 0.2
        col = (np.array([132, 160, 82], np.float32) * (1 - n[..., None]) + np.array([86, 128, 62], np.float32) * n[..., None])
    # 물줄기 둘레의 짙은 초록
    near = np.full((h, w), 1e9, np.float32)
    LA, LO = lat[:, None], lng[None, :] * COS
    for line in lines:
        for (a1, g1), (a2, g2) in zip(line, line[1:]):
            ax, ay, bx, by = g1 * COS, a1, g2 * COS, a2
            dx, dy = bx - ax, by - ay
            t = np.clip(((LO - ax) * dx + (LA - ay) * dy) / (dx * dx + dy * dy), 0, 1)
            near = np.minimum(near, np.hypot(LO - ax - t * dx, LA - ay - t * dy))
    river = np.clip(1 - near / 0.02, 0, 1) ** 1.5
    col = col * (1 - river[..., None] * 0.55) + np.array([62, 104, 50], np.float32) * river[..., None] * 0.55
    return np.maximum(cover, river * (m > 0.05)), col


def meso_green(dem, lat, lng):
    """메소포타미아의 강물 땅: (덮는 정도, 색). 유브라데·티그리스 물길 둘레 약 5km의 대추야자·밭 띠(가장자리는 잡음으로 들쭉날쭉)와,
    바벨론 땅(두 강 사이 충적 평야의 낮은 땅) — 운하 둘레만 푸르러 얼룩진 밭. 나머지는 비가 적어 모래·자갈 그대로"""
    LA, LO = lat[:, None], lng[None, :] * COS
    near = np.full(dem.shape, 1e9, np.float32)
    for line in (EUPHRATES, TIGRIS):
        for (a1, g1), (a2, g2) in zip(line, line[1:]):
            ax, ay, bx, by = g1 * COS, a1, g2 * COS, a2
            dx, dy = bx - ax, by - ay
            t = np.clip(((LO - ax) * dx + (LA - ay) * dy) / (dx * dx + dy * dy), 0, 1)
            near = np.minimum(near, np.hypot(LO - ax - t * dx, LA - ay - t * dy))
    # 골짜기 바닥: 둘레(약 25km) 평균보다 낮은 땅. 물길 선(거칠다) 둘레 약 9km 안에서 그 바닥만 푸르게 — 띠가 실제 골짜기를 따라 굽고 넓어진다
    rel = dem - blur(blur(dem, 12), 12)
    corridor = np.clip((.085 + .03 * vnoise(lat, lng, .1) - near) / .03, 0, 1)
    band = corridor * np.clip((6 - rel) / 12, 0, 1) * (.7 + .25 * vnoise(lat, lng, .05))
    plain, col = farmland(lat, lng, [BABYLONIA], lines=(), meadow=True)  # 밭 조각보는 이 크기에서 각진 칸으로 보였다 — 부드러운 풀빛으로
    patch = .4 + .3 * vnoise(lat + 2, lng, .2) + .2 * vnoise(lat, lng + 3, .07)  # 운하 둘레만 짙은 얼룩
    plain = plain * np.clip((75 - dem) / 15, 0, 1) * patch
    return np.maximum(band, plain), col


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


def base(cache, e, out, green=None, keep='', lines=NILE, dry=False, meadow=False, sea=False, sinai=False, meso=False, ppu=PX_PER_UNIT, z=Z):
    """넓은 바탕 한 장. green: 강·관개로 푸른 땅의 (위도, 경도) 다각형들 — 비가 적어도 초록으로 칠한다(나일 삼각주).
    keep: 투명하게 풀지 않을 가장자리('l','r') — 두 장이 맞닿는 쪽을 둘 다 풀면 그 사이로 바탕색 띠가 보인다.
    meso: 시리아 사막·메소포타미아 (강 골짜기와 바벨론 땅만 초록, 북쪽 초원, 서쪽 지중해는 그림에 칠함). ppu·z: 해상도와 고도 타일 확대 단계"""
    w = round((e['lng1'] - e['lng0']) * COS * 1000 * ppu)
    h = round((e['lat1'] - e['lat0']) * 1000 * ppu)
    lng = e['lng0'] + (np.arange(w) + .5) / w * (e['lng1'] - e['lng0'])
    lat = e['lat1'] - (np.arange(h) + .5) / h * (e['lat1'] - e['lat0'])
    dem = sample(mosaic_for(cache, e, z), z, lat, lng)

    # 지중해 해저는 평평하게 지운다(바다는 지도에서 벡터로 덮음). 각 행의 서쪽 끝에서
    # 첫 육지까지만 바다로 보므로, 해수면 아래인 요단·아라바 골짜기는 그대로 남는다.
    # 육지가 하나도 없는 행(삼각주 북쪽 바다)은 통째로 바다
    has = (dem > 0).any(axis=1)
    first_land = np.where(has, np.argmax(dem > 0, axis=1), w)
    land = np.arange(w)[None, :] >= first_land[:, None]
    if dry:  # 메소포타미아: 바다(페르시아 만)가 동쪽이고 비는 거의 없다 — 강물로 푸른 땅만 초록
        land = np.ones_like(dem, bool)  # 만은 지도에서 벡터로 덮는다 (해안의 낮은 땅이 모래 구멍으로 남지 않게)
        rain = np.zeros_like(dem)
    elif meso:
        # 해안선이 들쭉날쭉한 줄(이스켄데룬 만)마다 내륙 거리가 튀어 비가 가로 띠로 갈렸다 — 해안 위치를 위아래로 고르게 펴서 잰다
        fl = np.minimum(first_land, w - 1).astype(np.float32)
        fl = np.convolve(np.pad(fl, 30, mode='edge'), np.ones(61) / 61, mode='valid')
        rain = blur(rain_field(np.where(land, dem, 0), lat, fl, w, e), 20)  # 이 해상도(1픽셀 약 4km)에선 비그늘 계산이 각진 덩이로 보여 더 넓게 편다
        if e['lng0'] > 38:  # 바다에서 먼 바벨론 둘레(고운 바탕): 서쪽 끝을 해안으로 잘못 보지 않게 비는 없다
            rain = np.zeros_like(dem)
        # 북쪽 초원(하란·갈그미스 둘레, 오늘날 연 300~450mm — 비로 짓는 밀밭): 위도를 따라 서서히. 높은 산은 바위로 둔다
        rain = rain + np.interp(lat, [34.6, 36.0, 37.4], [0, 230, 420])[:, None] * np.clip((1600 - dem) / 600, 0, 1)
    else:
        rain = rain_field(np.where(land, dem, 0), lat, np.minimum(first_land, w - 1), w)
    dem = np.where(land, dem, 0)
    farm = farmland(lat, lng, green, lines, meadow) if green else None
    if meso:
        farm = meso_green(dem, lat, lng)
    if green is EGYPT_GREEN:
        farm = (farm[0] * flood(cache, lat, lng), farm[1])
    if farm is not None and dry:  # 높은 산자락(300m 넘게)은 풀빛을 걷어 바위로
        farm = (farm[0] * np.clip((500 - dem) / 200, 0, 1), farm[1])
    rgb = paint(np.minimum(dem, 1900) if sinai else dem, rain, land, shading(dem, lat, lng, 2.5), farm)  # 시내: 봉우리를 눈빛으로 칠하지 않는다
    if sinai:
        rgb = desert_tint(rgb, dem, lat, lng)
    if sea:  # 시내 반도: 홍해의 두 만은 고도 자료의 해안선 그대로 바다색으로 (지도의 바다 색 --sea·--sea-deep과 같게, 깊을수록 짙게)
        raw = sample(mosaic_for(cache, e, Z), Z, lat, lng)
        deep = np.clip(-raw / 900, 0, 1)[..., None]
        water = (raw < -6)[..., None]  # 산호초 얕은 곳(-6m 위)은 땅빛으로 두어 점점이 흩어지지 않게
        rgb = np.where(water, np.array([143, 178, 180]) * (1 - deep) + np.array([111, 151, 160]) * deep, rgb)

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


def main(cache, only=None):
    cache = Path(cache)
    cache.mkdir(parents=True, exist_ok=True)
    e = EXTENT
    if only == 'med':  # 바울 여정의 지중해 바탕과 장소 둘레의 고운 타일만 (`... med`)
        med(cache)
        return
    if only == 'meso':  # 시리아 사막·메소포타미아 바탕과 바벨론 둘레의 고운 바탕만 (`... meso`)
        base(cache, MESO, OUT.parent / 'relief-meso.webp', lines=(), meso=True, ppu=.24, z=9)
        base(cache, BABYLON, OUT.parent / 'relief-babylon.webp', lines=(), meso=True, ppu=1.0, z=10)
        return
    if only == 'west':  # 애굽 쪽 바탕과 그 정밀 타일만 (`... west`)
        wlat, wlng, wfirst, wrain, ww, wh = base(cache, WEST, OUT.parent / 'relief-west.webp', green=EGYPT_GREEN, keep='r')
        wcoast = WEST['lng0'] + (np.minimum(wfirst, ww - 1) + .5) / ww * (WEST['lng1'] - WEST['lng0'])
        tiles(cache, HI_W, Z_HI, HI_TILE_UNITS, OUT.parent / 'relief-hi-w', 1.8, wlat, wlng, wcoast, wrain, ww, wh, green=EGYPT_GREEN)
        return
    # 시내 반도·미디안 바탕 (assets/relief-south.webp) — 따로 만들 수 있다 (`... south`)
    base(cache, SOUTH, OUT.parent / 'relief-south.webp', lines=(), dry=True, sea=True, sinai=True)
    if only == 'south':
        return
    # 에덴 둘레 바탕 (assets/relief-east.webp) — 홀로 있어 네 가장자리를 모두 풀고, 따로 만들 수 있다 (`... east`)
    base(cache, EAST, OUT.parent / 'relief-east.webp', green=MESO_GREEN, lines=(), dry=True, meadow=True)  # 강은 지도의 벡터(푸른 선)로
    if only == 'east':
        return
    # 시리아 사막·메소포타미아 바탕 (assets/relief-meso.webp, 열왕기 여정에서만 깐다) — 따로 만들 수 있다 (`... meso`)
    base(cache, MESO, OUT.parent / 'relief-meso.webp', lines=(), meso=True, ppu=.24, z=9)
    base(cache, BABYLON, OUT.parent / 'relief-babylon.webp', lines=(), meso=True, ppu=1.0, z=10)

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
            farm = farmland(tlat, tlng, green) if green else None
            if green is EGYPT_GREEN:
                farm = (farm[0] * flood(cache, tlat, tlng), farm[1])
            trgb = paint(tdem, train, tland, shading(tdem, tlat, tlng, zf), farm)[1:-1, 1:-1]
            f = out / f'{r}_{c}.webp'
            Image.fromarray(trgb.astype(np.uint8), 'RGB').save(f, 'WEBP', quality=70, method=6)
            total += f.stat().st_size
    print(f'{out} {rows}x{cols} tiles, {total // 1024}KB')


if __name__ == '__main__':
    main(sys.argv[1], *sys.argv[2:3])

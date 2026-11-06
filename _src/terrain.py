"""3D 지형 모드 자료 만들기: 지역마다 높이 그림과 색 그림 (assets/terrain/<지역>-height.png, -color.webp).
   python3 _src/terrain.py <고도 타일 캐시 폴더> [지역…]   (relief.py와 같은 캐시를 쓴다)

   - 높이: 위경도 격자의 고도(m)를 8비트 PNG의 R·G에 나눠 담는다 — 값 = R*256 + G, 고도 = 값/10 - 500.
     (브라우저 캔버스는 16비트 PNG를 읽지 못하므로). 값 0(-500m)은 '바다'라는 표시다
   - 격자의 첫·끝 칸은 지역 경계선 위에 놓는다 — 맞닿은 두 지역의 경계 꼭짓점이 같은 고도를 가져 틈이 없다
   - 색: 2D 지도의 정밀 타일(assets/relief-hi, 애굽은 relief-hi-w)을 이어 붙여 같은 색을 쓴다. 헤르몬에는 눈
   - 범위는 terrain.js의 REGIONS와 같게"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
import relief as R  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'assets' / 'terrain'
# 지역: 북쪽 갈릴리와 남쪽 유대·사마리아는 위도 32.55에서 맞닿는다. 애굽(나일 삼각주)은 따로.
# grid: 지도 단위당 꼭짓점 수, color: 지도 단위당 색 그림 픽셀 수, src: 색 정밀 타일
REGIONS = {
    'galilee': dict(lat0=32.55, lat1=33.45, lng0=35.0, lng1=35.95, grid=0.6, color=2.2, src=('relief-hi', R.HI)),
    'judea': dict(lat0=30.96, lat1=32.55, lng0=35.0, lng1=35.95, grid=0.6, color=2.2, src=('relief-hi', R.HI)),
    'egypt': dict(lat0=29.8, lat1=31.35, lng0=30.95, lng1=32.65, grid=0.25, color=1.2, src=('relief-hi-w', R.HI_W)),
    # 모세 여정: 시내 반도 남쪽(마라·신 광야·르비딤·시내산·미디안)과 그 북쪽(가데스·호르산·부논)은 위도 29.8에서 맞닿는다.
    # 정밀 타일이 없는 사막이라 색은 2D 바탕(relief-south)과 같은 방식으로 고도에서 바로 칠한다(src 없음, dry). 바다는 홍해의 두 만
    'sinai': dict(lat0=28.2, lat1=29.8, lng0=32.65, lng1=35.6, grid=0.25, color=1.0, src=None, gulf=True),
    'negev': dict(lat0=29.8, lat1=30.95, lng0=32.65, lng1=35.6, grid=0.25, color=1.0, src=None),
}


def gulf(cache, e, lat, lng):
    """홍해의 두 만: z11 타일은 바다를 0으로 메워 두어, 해저 깊이가 남은 z10에서 읽는다 (해수면 아래 6m보다 깊으면 바다)"""
    return np.minimum(R.sample(R.mosaic_for(Path(cache), e, 10), 10, lat, lng), 0) if e.get('gulf') else np.zeros((len(lat), len(lng)))


def dry_color(cache, e, size):
    """사막 지역의 색: relief.py의 바탕(dry, sea)과 같게 — 비·풀빛 없이 고도 채색과 음영, 홍해는 깊을수록 짙은 바다색.
    2D 채색표의 2600m(눈빛)까지 가면 시내산 봉우리가 눈 덮인 듯해, 색은 1900m에서 멈춘다(음영은 실제 높이로)"""
    w, h = size
    lng = e['lng0'] + (np.arange(w) + .5) / w * (e['lng1'] - e['lng0'])
    lat = e['lat1'] - (np.arange(h) + .5) / h * (e['lat1'] - e['lat0'])
    dem = R.sample(R.mosaic_for(Path(cache), e, 11), 11, lat, lng)
    rgb = R.desert_tint(R.paint(np.minimum(dem, 1900), np.zeros_like(dem), np.ones_like(dem), R.shading(dem, lat, lng, 1.8)), dem, lat, lng)  # 붉은 화강암 산지·오아시스
    sea = gulf(cache, e, lat, lng)
    deep = np.clip(-sea / 900, 0, 1)[..., None]
    rgb = np.where((sea < -6)[..., None], np.array([143, 178, 180]) * (1 - deep) + np.array([111, 151, 160]) * deep, rgb)
    return Image.fromarray(rgb.astype(np.uint8))


def units(e):
    return (e['lng1'] - e['lng0']) * R.COS * 1000, (e['lat1'] - e['lat0']) * 1000


def hi_mosaic(ext, src, size):
    """정밀 타일을 이어 붙여 ext 범위를 잘라 낸다"""
    d, H = src
    T, P = R.HI_TILE_UNITS, R.HI_TILE_PX
    ux = lambda lng: (lng - H['lng0']) * R.COS * 1000
    uy = lambda lat: (H['lat1'] - lat) * 1000
    x0, x1, y0, y1 = ux(ext['lng0']), ux(ext['lng1']), uy(ext['lat1']), uy(ext['lat0'])
    c0, c1, r0, r1 = int(x0 // T), int(x1 // T), int(y0 // T), int(y1 // T)
    big = Image.new('RGB', ((c1 - c0 + 1) * P, (r1 - r0 + 1) * P), (226, 204, 156))
    for r in range(r0, r1 + 1):
        for c in range(c0, c1 + 1):
            f = ROOT / 'assets' / d / f'{r}_{c}.webp'
            if f.exists():
                big.paste(Image.open(f).convert('RGB'), ((c - c0) * P, (r - r0) * P))
    k = P / T
    crop = big.crop((round((x0 - c0 * T) * k), round((y0 - r0 * T) * k), round((x1 - c0 * T) * k), round((y1 - r0 * T) * k)))
    return crop.resize(size, Image.LANCZOS)


def main(cache, only=None):
    OUT.mkdir(parents=True, exist_ok=True)
    for name, e in REGIONS.items():
        if only and name not in only:
            continue
        uw, uh = units(e)
        gw, gh = round(uw * e['grid']) + 1, round(uh * e['grid']) + 1
        lng = e['lng0'] + np.arange(gw) / (gw - 1) * (e['lng1'] - e['lng0'])
        lat = e['lat1'] - np.arange(gh) / (gh - 1) * (e['lat1'] - e['lat0'])
        dem = R.sample(R.mosaic_for(Path(cache), e, 11), 11, lat, lng)
        # 바다: 행마다 서쪽 끝에서 첫 육지까지 (해수면 아래의 호수·골짜기는 그대로 남는다).
        # 애굽 북쪽 해안은 행 전체가 바다일 수도 있다
        land = dem > 0
        first = np.where(land.any(axis=1), np.argmax(land, axis=1), gw)
        sea = np.arange(gw)[None, :] < first[:, None]
        if e.get('gulf'):  # 홍해의 두 만은 동쪽에도 있다 (아카바 만)
            sea = gulf(cache, e, lat, lng) < -6
        dem = np.clip(dem, -480, 6000)
        v = np.round((dem + 500) * 10).astype(np.int32)
        v[sea] = 0
        img = np.zeros((gh, gw, 3), np.uint8)
        img[..., 0], img[..., 1] = v // 256, v % 256
        Image.fromarray(img, 'RGB').save(OUT / f'{name}-height.png', optimize=True)

        cw, ch = round(uw * e['color']), round(uh * e['color'])
        col = hi_mosaic(e, e['src'], (cw, ch)) if e['src'] else dry_color(cache, e, (cw, ch))
        a = np.asarray(col, np.float32)
        # 헤르몬의 눈: 1900m 위로 갈수록 희게 (시내산 둘레의 2000m대 봉우리는 눈이 없는 바위)
        d = np.asarray(Image.fromarray(dem.astype(np.float32)).resize(col.size, Image.BILINEAR))
        snow = np.clip((d - 1900) / 500, 0, 1)[..., None] * (0.85 if e['src'] else 0)
        a = a * (1 - snow) + np.array([246, 246, 242], np.float32) * snow
        Image.fromarray(a.astype(np.uint8)).save(OUT / f'{name}-color.webp', 'WEBP', quality=82, method=6)
        print(name, 'grid', (gw, gh), 'color', col.size, f'{dem.min():.0f}..{dem.max():.0f}m',
              (OUT / f'{name}-color.webp').stat().st_size // 1024, 'KB +', (OUT / f'{name}-height.png').stat().st_size // 1024, 'KB')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2:])  # 지역 이름을 더 주면 그 지역만

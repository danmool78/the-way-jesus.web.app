"""3D 지형 모드 자료 만들기: 지역마다 높이 그림과 색 그림 (assets/terrain/<지역>-height.png, -color.webp).
   python3 _src/terrain.py <고도 타일 캐시 폴더>   (relief.py와 같은 캐시를 쓴다)

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
    'judea': dict(lat0=31.35, lat1=32.55, lng0=35.0, lng1=35.95, grid=0.6, color=2.2, src=('relief-hi', R.HI)),
    'egypt': dict(lat0=29.8, lat1=31.35, lng0=30.95, lng1=32.65, grid=0.25, color=1.2, src=('relief-hi-w', R.HI_W)),
}


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


def main(cache):
    OUT.mkdir(parents=True, exist_ok=True)
    for name, e in REGIONS.items():
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
        dem = np.clip(dem, -480, 6000)
        v = np.round((dem + 500) * 10).astype(np.int32)
        v[sea] = 0
        img = np.zeros((gh, gw, 3), np.uint8)
        img[..., 0], img[..., 1] = v // 256, v % 256
        Image.fromarray(img, 'RGB').save(OUT / f'{name}-height.png', optimize=True)

        cw, ch = round(uw * e['color']), round(uh * e['color'])
        col = hi_mosaic(e, e['src'], (cw, ch))
        a = np.asarray(col, np.float32)
        # 헤르몬의 눈: 1900m 위로 갈수록 희게
        d = np.asarray(Image.fromarray(dem.astype(np.float32)).resize(col.size, Image.BILINEAR))
        snow = np.clip((d - 1900) / 500, 0, 1)[..., None] * 0.85
        a = a * (1 - snow) + np.array([246, 246, 242], np.float32) * snow
        Image.fromarray(a.astype(np.uint8)).save(OUT / f'{name}-color.webp', 'WEBP', quality=82, method=6)
        print(name, 'grid', (gw, gh), 'color', col.size, f'{dem.min():.0f}..{dem.max():.0f}m',
              (OUT / f'{name}-color.webp').stat().st_size // 1024, 'KB +', (OUT / f'{name}-height.png').stat().st_size // 1024, 'KB')


if __name__ == '__main__':
    main(sys.argv[1])

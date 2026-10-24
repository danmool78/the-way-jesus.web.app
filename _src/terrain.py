"""3D 지형 모드 자료 만들기: 높이 그림과 색 그림 (assets/terrain/<지역>-height.png, -color.webp).
   python3 _src/terrain.py <고도 타일 캐시 폴더>   (relief.py와 같은 캐시를 쓴다)

   - 높이: 위경도 격자의 고도(m)를 8비트 PNG의 R·G에 나눠 담는다 — 값 = R*256 + G, 고도 = 값/10 - 500.
     (브라우저 캔버스는 16비트 PNG를 읽지 못하므로)
   - 색: 2D 지도의 정밀 타일(assets/relief-hi)을 이어 붙여 같은 색을 쓴다. 높은 곳(헤르몬)은 눈을 얹는다
   - 범위는 terrain.js의 REGIONS와 같게"""
import math
import sys
from pathlib import Path

import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
import relief as R  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'assets' / 'terrain'
# 시험판: 갈릴리 호수 둘레 — 나사렛·다볼산에서 가이사랴 빌립보·헤르몬까지
REGIONS = {'galilee': dict(lat0=32.55, lat1=33.45, lng0=35.15, lng1=35.95, grid=(448, 576), color=2048)}


def hi_mosaic(ext, out_h):
    """정밀 타일을 이어 붙여 ext 범위를 잘라 낸다 (가로세로는 지도 단위 비율대로)"""
    H, T, P = R.HI, R.HI_TILE_UNITS, R.HI_TILE_PX
    ux = lambda lng: (lng - H['lng0']) * R.COS * 1000   # 정밀 타일 기준 지도 단위
    uy = lambda lat: (H['lat1'] - lat) * 1000
    x0, x1, y0, y1 = ux(ext['lng0']), ux(ext['lng1']), uy(ext['lat1']), uy(ext['lat0'])
    c0, c1, r0, r1 = int(x0 // T), int(x1 // T), int(y0 // T), int(y1 // T)
    big = Image.new('RGB', ((c1 - c0 + 1) * P, (r1 - r0 + 1) * P))
    for r in range(r0, r1 + 1):
        for c in range(c0, c1 + 1):
            f = ROOT / 'assets' / 'relief-hi' / f'{r}_{c}.webp'
            if f.exists():
                big.paste(Image.open(f).convert('RGB'), ((c - c0) * P, (r - r0) * P))
    k = P / T
    crop = big.crop((round((x0 - c0 * T) * k), round((y0 - r0 * T) * k), round((x1 - c0 * T) * k), round((y1 - r0 * T) * k)))
    w = round(out_h * (x1 - x0) / (y1 - y0))
    return crop.resize((w, out_h), Image.LANCZOS)


def main(cache):
    OUT.mkdir(parents=True, exist_ok=True)
    for name, e in REGIONS.items():
        gw, gh = e['grid']
        lng = e['lng0'] + (np.arange(gw) + .5) / gw * (e['lng1'] - e['lng0'])
        lat = e['lat1'] - (np.arange(gh) + .5) / gh * (e['lat1'] - e['lat0'])
        dem = R.sample(R.mosaic_for(Path(cache), e, 11), 11, lat, lng)
        dem = np.clip(dem, -499, 6000)
        v = np.round((dem + 500) * 10).astype(np.int32)
        img = np.zeros((gh, gw, 3), np.uint8)
        img[..., 0], img[..., 1] = v // 256, v % 256
        Image.fromarray(img, 'RGB').save(OUT / f'{name}-height.png', optimize=True)

        col = hi_mosaic(e, e['color'])
        a = np.asarray(col, np.float32)
        # 헤르몬의 눈: 1900m 위로 갈수록 희게 (경사가 급한 곳은 덜 — 바위가 드러난다)
        d = np.asarray(Image.fromarray(dem.astype(np.float32)).resize(col.size, Image.BILINEAR))
        snow = np.clip((d - 1900) / 500, 0, 1)[..., None] * 0.85
        a = a * (1 - snow) + np.array([246, 246, 242], np.float32) * snow
        Image.fromarray(a.astype(np.uint8)).save(OUT / f'{name}-color.webp', 'WEBP', quality=82, method=6)
        print(name, 'height', (gw, gh), 'color', col.size, f'{dem.min():.0f}..{dem.max():.0f}m',
              (OUT / f'{name}-color.webp').stat().st_size // 1024, 'KB')


if __name__ == '__main__':
    main(sys.argv[1])

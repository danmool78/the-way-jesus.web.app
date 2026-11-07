"""소책자 마무리(booklet.mjs가 부른다, pypdf·reportlab): 쪽 번호를 찍고(앞·뒤표지는 빼고), --marks면 인쇄소용으로
재단 여유(도련)를 둔 쪽마다 둘레에 10mm 여백을 더한 종이에 올려 네 모서리에 재단선(코너 표시)을 단다.
쓰는 법: python3 _src/tools/bookfinish.py 입력.pdf 출력.pdf [도련mm=0] [--marks]
TrimBox(완성 크기)·BleedBox(도련까지)도 적어 둔다 — 인쇄소 프로그램이 이것으로 재단 위치를 안다"""
import sys, io
from pypdf import PdfReader, PdfWriter, Transformation
from pypdf.generic import RectangleObject
from reportlab.pdfgen import canvas

MM = 72 / 25.4
src, dst = sys.argv[1], sys.argv[2]
MARKS = '--marks' in sys.argv
bleed = float(sys.argv[3]) * MM if len(sys.argv) > 3 and sys.argv[3] != '--marks' else 0
slug = 10 * MM if MARKS else 0               # 재단선을 그릴 바깥 여백
mark, gap = 5 * MM, 2 * MM   # 재단선 길이, 도련에서 떨어진 거리

reader = PdfReader(src); writer = PdfWriter(); N = len(reader.pages)
for i, page in enumerate(reader.pages):
    w, h = float(page.mediabox.width), float(page.mediabox.height)
    W, H = w + slug * 2, h + slug * 2
    # 재단선 그림
    buf = io.BytesIO(); c = canvas.Canvas(buf, pagesize=(W, H)); c.setLineWidth(0.25); c.setStrokeColorCMYK(1, 1, 1, 1)
    x0, y0, x1, y1 = slug + bleed, slug + bleed, slug + w - bleed, slug + h - bleed   # 완성 크기(재단 위치)
    if 0 < i < N - 1:   # 쪽 번호: 완성 크기 아래쪽 8mm, 표지(처음·끝)는 빼고
        c.setFillColorRGB(0.64, 0.6, 0.54); c.setFont('Helvetica', 7); c.drawCentredString((x0 + x1) / 2, y0 + 8 * MM, str(i + 1))
    for x, dx in ((x0, -1), (x1, 1)) if MARKS else ():
        for y, dy in ((y0, -1), (y1, 1)):
            c.line(x + dx * (bleed + gap), y, x + dx * (bleed + gap + mark), y)   # 가로 표시
            c.line(x, y + dy * (bleed + gap), x, y + dy * (bleed + gap + mark))   # 세로 표시
    c.save(); buf.seek(0)
    sheet = PdfReader(buf).pages[0]
    sheet.merge_transformed_page(page, Transformation().translate(slug, slug))
    sheet.mediabox = RectangleObject([0, 0, W, H])
    sheet.trimbox = RectangleObject([x0, y0, x1, y1])
    sheet.bleedbox = RectangleObject([slug, slug, slug + w, slug + h])
    writer.add_page(sheet)
with open(dst, 'wb') as f: writer.write(f)

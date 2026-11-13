"""시대별 영역(누가 다스렸나)을 지도에 깔 다각형으로 만든다 → _src/realms/<여정>.json (build.py가 journey.realms로 싣는다).
장면이 바뀌어 시대가 넘어가면 앱이 영역 색을 서서히 바꾼다(사용자, 2026-11).
- 바깥 경계는 AWMC(고대세계지도센터, Barrington Atlas 바탕)의 헤롯 왕국 경계(_src/realms/awmc-herods_kingdom.geojson, ODbL — 출처를 밝힌다)를 그대로 쓰고,
  안쪽 나눔(분봉 영역)은 표준 지도책(Carta·Zondervan)의 경계를 따라 손으로 찍은 '구역'을 그 안에서 잘라 만든다 — 고대 경계는 원래 어림이다
- 구역 좌표는 [위도, 경도]. 나중 시대 구역은 앞의 구역을 빼고 남는 자리를 갖는 것도 있다(rest)
Run: python3 _src/tools/realms.py   (pip install shapely)"""
import json, os
from shapely.geometry import Polygon, shape, mapping
from shapely.ops import unary_union

here = os.path.dirname(os.path.abspath(__file__)); src = os.path.join(here, '..', 'realms')
P = lambda pts: Polygon([(b, a) for a, b in pts])  # [위도, 경도] → (x=경도, y=위도)
herod = unary_union([shape(f['geometry']) for f in json.load(open(os.path.join(src, 'awmc-herods_kingdom.geojson')))['features']])

# 이름은 8개 언어 (앱이 지금 언어로 고른다)
N = {
 'herod': {'ko': '헤롯 대왕의 왕국', 'en': 'Kingdom of Herod the Great', 'es': 'Reino de Herodes el Grande', 'pt': 'Reino de Herodes, o Grande', 'fr': 'Royaume d’Hérode le Grand', 'zh': '大希律王的王国', 'id': 'Kerajaan Herodes Agung', 'ja': 'ヘロデ大王の王国'},
 'antipas': {'ko': '분봉 왕 헤롯 안디바 (갈릴리·베레아)', 'en': 'Herod Antipas, tetrarch (Galilee, Perea)', 'es': 'Herodes Antipas, tetrarca (Galilea, Perea)', 'pt': 'Herodes Antipas, tetrarca (Galileia, Pereia)', 'fr': 'Hérode Antipas, tétrarque (Galilée, Pérée)', 'zh': '分封王希律·安提帕（加利利、比利亚）', 'id': 'Herodes Antipas, raja wilayah (Galilea, Perea)', 'ja': '領主ヘロデ・アンティパス（ガリラヤ・ペレア）'},
 'archelaus': {'ko': '아켈라오 (유대·사마리아·이두매)', 'en': 'Archelaus (Judea, Samaria, Idumea)', 'es': 'Arquelao (Judea, Samaria, Idumea)', 'pt': 'Arquelau (Judeia, Samaria, Idumeia)', 'fr': 'Archélaüs (Judée, Samarie, Idumée)', 'zh': '亚基老（犹太、撒玛利亚、以土买）', 'id': 'Arkhelaus (Yudea, Samaria, Idumea)', 'ja': 'アルケラオ（ユダヤ・サマリア・イドマヤ）'},
 'prefect': {'ko': '로마 총독이 다스린 유대 (유대·사마리아·이두매)', 'en': 'Judea under a Roman governor (Judea, Samaria, Idumea)', 'es': 'Judea bajo un gobernador romano (Judea, Samaria, Idumea)', 'pt': 'Judeia sob um governador romano (Judeia, Samaria, Idumeia)', 'fr': 'Judée sous un gouverneur romain (Judée, Samarie, Idumée)', 'zh': '罗马巡抚治下的犹太（犹太、撒玛利亚、以土买）', 'id': 'Yudea di bawah wali negeri Romawi (Yudea, Samaria, Idumea)', 'ja': 'ローマ総督が治めるユダヤ（ユダヤ・サマリア・イドマヤ）'},
 'philip': {'ko': '분봉 왕 빌립 (이두래·드라고닛)', 'en': 'Philip the tetrarch (Iturea, Trachonitis)', 'es': 'Filipo, tetrarca (Iturea, Traconítide)', 'pt': 'Filipe, tetrarca (Itureia, Traconítide)', 'fr': 'Philippe le tétrarque (Iturée, Trachonitide)', 'zh': '分封王腓力（以土利亚、特拉可尼）', 'id': 'Filipus, raja wilayah (Iturea, Trakhonitis)', 'ja': '領主フィリポ（イトラヤ・トラコニティス）'},
 'decapolis': {'ko': '데가볼리 (열 성읍, 로마 수리아 아래)', 'en': 'Decapolis (Ten Cities, under Roman Syria)', 'es': 'Decápolis (diez ciudades, bajo la Siria romana)', 'pt': 'Decápolis (dez cidades, sob a Síria romana)', 'fr': 'Décapole (dix villes, sous la Syrie romaine)', 'zh': '低加波利（十城，属罗马叙利亚）', 'id': 'Dekapolis (sepuluh kota, di bawah Siria Romawi)', 'ja': 'デカポリス（十の町、ローマのシリア州の下）'},
}
# 폰의 작은 이름표에 쓰는 짧은 이름
S = {
 'herod': {'ko': '헤롯 대왕', 'en': 'Herod the Great', 'es': 'Herodes el Grande', 'pt': 'Herodes, o Grande', 'fr': 'Hérode le Grand', 'zh': '大希律王', 'id': 'Herodes Agung', 'ja': 'ヘロデ大王'},
 'antipas': {'ko': '헤롯 안디바', 'en': 'Herod Antipas', 'es': 'Herodes Antipas', 'pt': 'Herodes Antipas', 'fr': 'Hérode Antipas', 'zh': '希律·安提帕', 'id': 'Herodes Antipas', 'ja': 'ヘロデ・アンティパス'},
 'archelaus': {'ko': '아켈라오', 'en': 'Archelaus', 'es': 'Arquelao', 'pt': 'Arquelau', 'fr': 'Archélaüs', 'zh': '亚基老', 'id': 'Arkhelaus', 'ja': 'アルケラオ'},
 'prefect': {'ko': '로마 총독', 'en': 'Roman governor', 'es': 'Gobernador romano', 'pt': 'Governador romano', 'fr': 'Gouverneur romain', 'zh': '罗马巡抚', 'id': 'Wali negeri Romawi', 'ja': 'ローマ総督'},
 'philip': {'ko': '빌립', 'en': 'Philip', 'es': 'Filipo', 'pt': 'Filipe', 'fr': 'Philippe', 'zh': '腓力', 'id': 'Filipus', 'ja': 'フィリポ'},
 'decapolis': {'ko': '데가볼리', 'en': 'Decapolis', 'es': 'Decápolis', 'pt': 'Decápolis', 'fr': 'Décapole', 'zh': '低加波利', 'id': 'Dekapolis', 'ja': 'デカポリス'},
}
# 분봉 영역 구역 (헤롯 경계 안에서 자른다) — 갈릴리 남쪽은 이스르엘 골짜기 북쪽 끝(나인은 갈릴리, 벧산은 데가볼리),
# 베레아는 요단 동쪽 펠라 남쪽부터 마케루스까지(데가볼리 성읍들 서쪽), 빌립은 갈릴리 바다·훌레 동쪽과 그 북동(벳새다·가이사랴 빌립보 포함)
Z = {
 'galilee': P([(33.12, 35.22), (33.12, 35.63), (32.92, 35.615), (32.80, 35.60), (32.70, 35.585), (32.625, 35.565), (32.58, 35.42), (32.53, 35.30), (32.58, 35.14), (32.70, 35.12), (32.88, 35.18)]),  # 서쪽은 돌레마이(악고) 땅을 비켜
 'perea': P([(32.43, 35.555), (32.43, 35.70), (32.25, 35.76), (32.00, 35.80), (31.75, 35.80), (31.42, 35.72), (31.42, 35.57), (31.75, 35.53), (32.05, 35.535), (32.25, 35.55)]),
 'philip': P([(33.42, 35.50), (33.42, 35.95), (33.25, 36.35), (33.15, 36.95), (32.60, 36.95), (32.62, 36.30), (32.78, 35.98), (32.86, 35.80), (32.86, 35.645), (32.92, 35.625), (33.12, 35.63), (33.12, 35.50)]),
}
# 데가볼리: 헤롯 경계와 따로(헤롯이 죽은 뒤 대부분 수리아 몫) — 벧산(스구도볼리)은 요단 서쪽, 나머지는 동쪽 거라사·빌라델비아까지
DECAPOLIS = unary_union([
 P([(32.625, 35.565), (32.58, 35.42), (32.46, 35.40), (32.43, 35.555)]),
 P([(32.86, 35.645), (32.86, 35.80), (32.78, 35.98), (32.62, 36.30), (32.40, 36.10), (32.10, 36.05), (31.88, 36.00), (31.90, 35.86), (32.00, 35.80), (32.25, 35.76), (32.43, 35.70), (32.43, 35.555), (32.625, 35.565), (32.70, 35.585), (32.80, 35.60)]),
])

def ring(g, tol=0.004):
    g = g.simplify(tol, preserve_topology=True)
    polys = [g] if g.geom_type == 'Polygon' else [p for p in g.geoms if p.area > 0.0005]
    return [[[round(y, 3), round(x, 3)] for x, y in p.exterior.coords] for p in polys]

antipas = unary_union([Z['galilee'], Z['perea']]).intersection(herod)
philip = Z['philip'].intersection(herod)
judea = herod.intersection(P([(32.75, 34.0), (32.75, 35.565), (31.0, 35.565), (31.0, 34.0)])).difference(unary_union([Z['galilee'], DECAPOLIS]))
area = lambda k, g, color: {'id': k, 'color': color, 'name': N[k], 'short': S[k], 'd': ring(g)}
deca = area('decapolis', DECAPOLIS.difference(Z['galilee']), '#8f7fb0')
out = {
 '_comment': '시대별 영역 — _src/tools/realms.py가 만든다(직접 고치지 말 것). 바깥 경계: AWMC(Ancient World Mapping Center) geodata, ODbL, Barrington Atlas 바탕',
 'credit': 'AWMC (Ancient World Mapping Center) · ODbL',
 'eras': [
  {'from': 'e01', 'areas': [area('herod', herod.difference(DECAPOLIS), '#c9a24a'), deca]},                       # 헤롯 대왕 (BC 6–4)
  {'from': 'e06', 'areas': [area('archelaus', judea, '#c96a3a'), area('antipas', antipas, '#5f8a4f'), area('philip', philip, '#3f8fa0'), deca]},   # 헤롯이 죽은 뒤 셋으로
  {'from': 'e07', 'areas': [area('prefect', judea, '#c0453a'), area('antipas', antipas, '#5f8a4f'), area('philip', philip, '#3f8fa0'), deca]},     # AD 6 아켈라오를 내쫓고 로마 총독
 ],
}
json.dump(out, open(os.path.join(src, 'jesus.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print('realms jesus:', [(e['from'], [(a['id'], sum(len(r) for r in a['d'])) for a in e['areas']]) for e in out['eras']])

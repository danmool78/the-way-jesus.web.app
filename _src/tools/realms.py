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
def _chaikin(pts, n=2):  # 모서리를 깎아 둥글게 — 손으로 찍은 구역이 자로 그은 네모처럼 보였다(사용자)
    for _ in range(n):
        q = []
        for i in range(len(pts)):
            (x0, y0), (x1, y1) = pts[i], pts[(i + 1) % len(pts)]
            q += [(x0 * .75 + x1 * .25, y0 * .75 + y1 * .25), (x0 * .25 + x1 * .75, y0 * .25 + y1 * .75)]
        pts = q
    return pts
P = lambda pts: Polygon(_chaikin([(b, a) for a, b in pts]))  # [위도, 경도] → (x=경도, y=위도), 둥글게
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

def ring(g, tol=0.004, nd=3):  # nd: 좌표 자릿수 (지중해 지도는 둘로 — 1km쯤이면 충분하고 자료가 작아진다)
    g = g.simplify(tol, preserve_topology=True)
    polys = [g] if g.geom_type == 'Polygon' else [p for p in g.geoms if p.area > 0.0005]
    return [[[round(y, nd), round(x, nd)] for x, y in p.exterior.coords] for p in polys]

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

# ---------- 다윗·열왕기: 철기 시대 나라들 (AWMC에는 이 시대 경계가 없어 표준 지도책의 경계를 따라 구역을 찍는다) ----------
NO = {  # 이름 [ko, en, es, pt, fr, zh, id, ja] — 앞은 긴 이름, 뒤는 짧은 이름(폰)
 'saul': (['사울의 이스라엘', 'Israel under Saul', 'Israel bajo Saúl', 'Israel sob Saul', 'Israël sous Saül', '扫罗治下的以色列', 'Israel di bawah Saul', 'サウルのイスラエル'],
          ['사울', 'Saul', 'Saúl', 'Saul', 'Saül', '扫罗', 'Saul', 'サウル']),
 'ishbosheth': (['이스보셋의 이스라엘', "Ish-bosheth's Israel", 'Israel de Is-boset', 'Israel de Isbosete', 'Israël d’Ishbosheth', '伊施波设的以色列', 'Israel di bawah Isyboset', 'イシュ・ボシェテのイスラエル'],
                ['이스보셋', 'Ish-bosheth', 'Is-boset', 'Isbosete', 'Ishbosheth', '伊施波设', 'Isyboset', 'イシュ・ボシェテ']),
 'davidjudah': (['헤브론의 다윗 (유다)', 'David at Hebron (Judah)', 'David en Hebrón (Judá)', 'Davi em Hebrom (Judá)', 'David à Hébron (Juda)', '希伯仑的大卫（犹大）', 'Daud di Hebron (Yehuda)', 'ヘブロンのダビデ（ユダ）'],
                ['다윗 (유다)', 'David (Judah)', 'David (Judá)', 'Davi (Judá)', 'David (Juda)', '大卫（犹大）', 'Daud (Yehuda)', 'ダビデ（ユダ）']),
 'united': (['통일 왕국 이스라엘', 'United kingdom of Israel', 'Reino unido de Israel', 'Reino unido de Israel', 'Royaume uni d’Israël', '统一的以色列王国', 'Kerajaan Israel bersatu', '統一王国イスラエル'],
            ['통일 이스라엘', 'Israel', 'Israel', 'Israel', 'Israël', '以色列', 'Israel', 'イスラエル']),
 'tribute4': (['조공을 바친 나라 (에돔·모압·암몬·아람)', 'Tributary lands (Edom, Moab, Ammon, Aram)', 'Tierras tributarias (Edom, Moab, Amón, Aram)', 'Terras tributárias (Edom, Moabe, Amom, Arã)', 'Pays tributaires (Édom, Moab, Ammon, Aram)', '进贡之地（以东、摩押、亚扪、亚兰）', 'Negeri pembayar upeti (Edom, Moab, Amon, Aram)', '貢ぎ物を納めた国々（エドム・モアブ・アンモン・アラム）'],
              ['조공 나라', 'Tributaries', 'Tributarios', 'Tributários', 'Tributaires', '进贡之地', 'Pembayar upeti', '朝貢国']),
 'tribute3': (['조공을 바친 나라 (에돔·모압·암몬)', 'Tributary lands (Edom, Moab, Ammon)', 'Tierras tributarias (Edom, Moab, Amón)', 'Terras tributárias (Edom, Moabe, Amom)', 'Pays tributaires (Édom, Moab, Ammon)', '进贡之地（以东、摩押、亚扪）', 'Negeri pembayar upeti (Edom, Moab, Amon)', '貢ぎ物を納めた国々（エドム・モアブ・アンモン）'],
              ['조공 나라', 'Tributaries', 'Tributarios', 'Tributários', 'Tributaires', '进贡之地', 'Pembayar upeti', '朝貢国']),
 'israel': (['북이스라엘', 'Israel (northern kingdom)', 'Israel (reino del norte)', 'Israel (reino do norte)', 'Israël (royaume du Nord)', '北国以色列', 'Israel (kerajaan utara)', '北イスラエル王国'],
            ['북이스라엘', 'Israel', 'Israel', 'Israel', 'Israël', '北以色列', 'Israel', '北イスラエル']),
 'judah': (['남유다', 'Judah (southern kingdom)', 'Judá (reino del sur)', 'Judá (reino do sul)', 'Juda (royaume du Sud)', '南国犹大', 'Yehuda (kerajaan selatan)', '南ユダ王国'],
           ['남유다', 'Judah', 'Judá', 'Judá', 'Juda', '南犹大', 'Yehuda', '南ユダ']),
 'philistia': (['블레셋', 'Philistia', 'Filistea', 'Filístia', 'Philistie', '非利士', 'Filistia', 'ペリシテ'], None),
 'phoenicia': (['시돈·두로 (베니게)', 'Sidon and Tyre (Phoenicia)', 'Sidón y Tiro (Fenicia)', 'Sidom e Tiro (Fenícia)', 'Sidon et Tyr (Phénicie)', '西顿、推罗（腓尼基）', 'Sidon dan Tirus (Fenisia)', 'シドン・ツロ（フェニキア）'],
               ['시돈·두로', 'Phoenicia', 'Fenicia', 'Fenícia', 'Phénicie', '腓尼基', 'Fenisia', 'フェニキア']),
 'aram': (['아람 (다메섹)', 'Aram (Damascus)', 'Aram (Damasco)', 'Arã (Damasco)', 'Aram (Damas)', '亚兰（大马士革）', 'Aram (Damsyik)', 'アラム（ダマスコ）'],
          ['아람', 'Aram', 'Aram', 'Arã', 'Aram', '亚兰', 'Aram', 'アラム']),
 'ammon': (['암몬', 'Ammon', 'Amón', 'Amom', 'Ammon', '亚扪', 'Amon', 'アンモン'], None),
 'moab': (['모압', 'Moab', 'Moab', 'Moabe', 'Moab', '摩押', 'Moab', 'モアブ'], None),
 'edom': (['에돔', 'Edom', 'Edom', 'Edom', 'Édom', '以东', 'Edom', 'エドム'], None),
 'assyria': (['앗수르 제국 (북이스라엘과 아람을 삼킴)', 'Assyrian Empire (swallowing Israel and Aram)', 'Imperio asirio (absorbe Israel y Aram)', 'Império Assírio (engole Israel e Arã)', 'Empire assyrien (absorbe Israël et Aram)', '亚述帝国（吞并以色列与亚兰）', 'Kekaisaran Asyur (menelan Israel dan Aram)', 'アッシリア帝国（イスラエルとアラムを併合）'],
             ['앗수르', 'Assyria', 'Asiria', 'Assíria', 'Assyrie', '亚述', 'Asyur', 'アッシリア']),
 'babylon': (['바벨론 제국 (유다까지 삼킴)', 'Babylonian Empire (swallowing Judah too)', 'Imperio babilónico (absorbe también Judá)', 'Império Babilônico (engole também Judá)', 'Empire babylonien (absorbe aussi Juda)', '巴比伦帝国（连犹大也吞并）', 'Kekaisaran Babel (menelan Yehuda juga)', 'バビロン帝国（ユダも併合）'],
             ['바벨론', 'Babylon', 'Babilonia', 'Babilônia', 'Babylone', '巴比伦', 'Babel', 'バビロン']),
}
LL = ['ko', 'en', 'es', 'pt', 'fr', 'zh', 'id', 'ja']
nm = lambda xs: dict(zip(LL, xs))
# 구역 [위도, 경도] — 바다 쪽으로 넘친 곳은 앱에서 바다가 덮는다
ISRAEL_W = P([(31.92, 35.53), (31.90, 35.30), (31.92, 35.10), (32.05, 34.88), (32.10, 34.70), (32.62, 34.80), (32.83, 34.90), (32.92, 35.08), (33.08, 35.15), (33.10, 35.35), (33.30, 35.55), (33.30, 35.68), (32.90, 35.64), (32.70, 35.58), (32.40, 35.56), (32.10, 35.55)])
GILEAD = P([(32.69, 35.60), (32.73, 35.85), (32.72, 36.10), (32.45, 36.15), (32.15, 35.95), (31.75, 35.80), (31.75, 35.55), (32.10, 35.55), (32.40, 35.57)])
JUDAH = P([(31.92, 35.53), (31.88, 35.10), (31.80, 34.95), (31.65, 34.88), (31.50, 34.78), (31.35, 34.70), (31.15, 34.52), (30.85, 34.38), (30.55, 34.45), (30.45, 34.90), (30.75, 35.20), (31.10, 35.38), (31.45, 35.39), (31.75, 35.45)])
PHILISTIA = P([(32.12, 34.70), (32.05, 34.88), (31.80, 34.95), (31.65, 34.88), (31.50, 34.78), (31.35, 34.70), (31.15, 34.52), (31.20, 34.10), (31.60, 34.30), (31.95, 34.55)]).difference(JUDAH)
PHOENICIA = P([(32.83, 34.90), (32.92, 35.08), (33.08, 35.15), (33.10, 35.35), (33.30, 35.55), (33.55, 35.70), (34.00, 35.92), (34.45, 36.12), (34.45, 35.70), (34.00, 35.40), (33.55, 35.10), (33.10, 34.90)])
ARAM = P([(33.30, 35.68), (33.55, 35.70), (34.00, 35.92), (34.45, 36.12), (34.60, 36.60), (34.35, 37.10), (33.80, 37.30), (33.20, 37.05), (32.85, 36.75), (32.62, 36.45), (32.72, 36.10), (32.73, 35.85), (32.69, 35.62), (32.90, 35.64)])
AMMON = P([(32.15, 35.95), (32.30, 36.20), (32.10, 36.50), (31.80, 36.40), (31.70, 36.10), (31.70, 35.85), (31.75, 35.80)])
MOAB = P([(31.75, 35.55), (31.75, 35.80), (31.70, 35.85), (31.70, 36.15), (31.05, 36.25), (31.05, 35.56), (31.45, 35.57)])
EDOM = P([(31.05, 35.40), (31.05, 36.15), (30.40, 35.95), (29.55, 35.15), (29.55, 34.95), (30.20, 35.10), (30.75, 35.25)]).difference(JUDAH)
# 앗수르·바벨론 땅: 메소포타미아와 수리아(비옥한 초승달) — 아라비아 사막은 뺀다
EMPIRE = P([(36.95, 35.6), (36.95, 45.5), (30.9, 45.5), (31.4, 44.3), (32.6, 43.6), (33.8, 42.2), (34.5, 40.8), (34.8, 38.6), (34.6, 37.4), (34.45, 36.12)])
NORTH = unary_union([ISRAEL_W, GILEAD])
C = {'united': '#c9a24a', 'saul': '#c9a24a', 'israel': '#5f8a4f', 'ishbosheth': '#5f8a4f', 'judah': '#b5603e', 'davidjudah': '#b5603e', 'philistia': '#8f7fb0',
     'phoenicia': '#3f8fa0', 'aram': '#6b8fb5', 'ammon': '#b58a3e', 'moab': '#9a6a9a', 'edom': '#c0453a', 'tribute3': '#a98a5a', 'tribute4': '#a98a5a', 'assyria': '#6a4a7a', 'babylon': '#3f5a7a'}
def ar(k, g):
    full, short = NO[k]
    return {'id': k, 'color': C[k], 'name': nm(full), 'short': nm(short or full), 'd': ring(g)}
NEIGH = lambda *skip: [ar(k, g) for k, g in [('philistia', PHILISTIA), ('phoenicia', PHOENICIA), ('aram', ARAM), ('ammon', AMMON), ('moab', MOAB), ('edom', EDOM)] if k not in skip]
CREDIT = nm(['경계는 성경 지도책을 따른 어림', 'Approximate borders, after Bible atlases', 'Fronteras aproximadas, según atlas bíblicos', 'Fronteiras aproximadas, segundo atlas bíblicos', 'Frontières approximatives, d’après les atlas bibliques', '边界为参照圣经地图集的大致范围', 'Batas perkiraan, menurut atlas Alkitab', '境界はおおよそ（聖書地図帳による）'])
david = {'credit': CREDIT, 'eras': [
  {'from': 'd01', 'areas': [ar('saul', unary_union([NORTH, JUDAH]))] + NEIGH()},
  {'from': 'd21', 'areas': [ar('davidjudah', JUDAH), ar('ishbosheth', NORTH)] + NEIGH()},     # 헤브론의 다윗과 마하나임의 이스보셋
  {'from': 'd22', 'areas': [ar('united', unary_union([NORTH, JUDAH]))] + NEIGH()},           # 예루살렘을 차지하고 온 이스라엘의 왕으로
  {'from': 'd27', 'areas': [ar('united', unary_union([NORTH, JUDAH])), ar('tribute4', unary_union([EDOM, MOAB, AMMON, ARAM]))] + NEIGH('aram', 'ammon', 'moab', 'edom')},  # 삼하 8장
]}
kings = {'credit': CREDIT, 'eras': [
  {'from': 'k01', 'areas': [ar('united', unary_union([NORTH, JUDAH])), ar('tribute3', unary_union([EDOM, MOAB, AMMON]))] + NEIGH('ammon', 'moab', 'edom')},  # 솔로몬 (아람은 르손이 등을 돌렸다 — 왕상 11:24)
  {'from': 'k07', 'areas': [ar('israel', NORTH), ar('judah', JUDAH)] + NEIGH()},                # 세겜에서 갈라짐
  {'from': 'k31', 'areas': [ar('assyria', unary_union([EMPIRE, NORTH, ARAM])), ar('judah', JUDAH)] + NEIGH('aram')},   # 사마리아 함락 (BC 722)
  {'from': 'k40', 'areas': [ar('babylon', unary_union([EMPIRE, NORTH, ARAM, JUDAH, PHILISTIA, PHOENICIA, AMMON, MOAB, EDOM]))]},  # 예루살렘 함락 (BC 586)
]}
for k, v in [('david', david), ('kings', kings)]:
    v = {'_comment': '시대별 영역 — _src/tools/realms.py가 만든다(직접 고치지 말 것). 철기 시대 경계는 어림', **v}
    json.dump(v, open(os.path.join(src, k + '.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print('realms %s:' % k, [(e['from'], [a['id'] for a in e['areas']]) for e in v['eras']])

# ---------- 바울: AD 50 무렵 로마 속주 (지중해 지도 — 바다로 넘친 색은 앱이 육지 가림판(relief-med-mask)으로 잘라 낸다) ----------
NP = {
 'judaea': (['유대 (로마 속주)', 'Judea (Roman province)', 'Judea (provincia romana)', 'Judeia (província romana)', 'Judée (province romaine)', '犹太（罗马行省）', 'Yudea (provinsi Romawi)', 'ユダヤ（ローマ属州）'], ['유대', 'Judea', 'Judea', 'Judeia', 'Judée', '犹太', 'Yudea', 'ユダヤ']),
 'judaea0': (['유대 (로마 총독)', 'Judea (Roman governor)', 'Judea (gobernador romano)', 'Judeia (governador romano)', 'Judée (gouverneur romain)', '犹太（罗马巡抚）', 'Yudea (wali negeri Romawi)', 'ユダヤ（ローマ総督）'], ['유대', 'Judea', 'Judea', 'Judeia', 'Judée', '犹太', 'Yudea', 'ユダヤ']),
 'antipas': (['분봉 왕 헤롯 안디바 (갈릴리·베레아)', 'Herod Antipas, tetrarch (Galilee, Perea)', 'Herodes Antipas, tetrarca (Galilea, Perea)', 'Herodes Antipas, tetrarca (Galileia, Pereia)', 'Hérode Antipas, tétrarque (Galilée, Pérée)', '分封王希律·安提帕（加利利、比利亚）', 'Herodes Antipas, raja wilayah (Galilea, Perea)', '領主ヘロデ・アンティパス（ガリラヤ・ペレア）'],
             ['헤롯 안디바', 'Herod Antipas', 'Herodes Antipas', 'Herodes Antipas', 'Hérode Antipas', '希律·安提帕', 'Herodes Antipas', 'ヘロデ・アンティパス']),
 'syria': (['수리아와 길리기아', 'Syria and Cilicia', 'Siria y Cilicia', 'Síria e Cilícia', 'Syrie et Cilicie', '叙利亚和基利家', 'Siria dan Kilikia', 'シリアとキリキア'], ['수리아·길리기아', 'Syria-Cilicia', 'Siria-Cilicia', 'Síria-Cilícia', 'Syrie-Cilicie', '叙利亚·基利家', 'Siria-Kilikia', 'シリア・キリキア']),
 'cyprus': (['구브로', 'Cyprus', 'Chipre', 'Chipre', 'Chypre', '塞浦路斯', 'Siprus', 'キプロス'], None),
 'galatia': (['갈라디아 (비시디아·루가오니아 포함)', 'Galatia (with Pisidia and Lycaonia)', 'Galacia (con Pisidia y Licaonia)', 'Galácia (com Pisídia e Licaônia)', 'Galatie (avec Pisidie et Lycaonie)', '加拉太（含彼西底、吕高尼）', 'Galatia (termasuk Pisidia dan Likaonia)', 'ガラテヤ（ピシディア・ルカオニアを含む）'], ['갈라디아', 'Galatia', 'Galacia', 'Galácia', 'Galatie', '加拉太', 'Galatia', 'ガラテヤ']),
 'lycia': (['루기아·밤빌리아', 'Lycia and Pamphylia', 'Licia y Panfilia', 'Lícia e Panfília', 'Lycie et Pamphylie', '吕家和旁非利亚', 'Likia dan Pamfilia', 'ルキア・パンフリア'], None),
 'cappadocia': (['갑바도기아', 'Cappadocia', 'Capadocia', 'Capadócia', 'Cappadoce', '加帕多家', 'Kapadokia', 'カパドキア'], None),
 'asia': (['아시아', 'Asia', 'Asia', 'Ásia', 'Asie', '亚细亚', 'Asia', 'アジア'], None),
 'bithynia': (['비두니아·본도', 'Bithynia and Pontus', 'Bitinia y Ponto', 'Bitínia e Ponto', 'Bithynie et Pont', '庇推尼和本都', 'Bitinia dan Pontus', 'ビテニヤ・ポント'], ['비두니아', 'Bithynia', 'Bitinia', 'Bitínia', 'Bithynie', '庇推尼', 'Bitinia', 'ビテニヤ']),
 'macedonia': (['마게도냐', 'Macedonia', 'Macedonia', 'Macedônia', 'Macédoine', '马其顿', 'Makedonia', 'マケドニア'], None),
 'achaia': (['아가야', 'Achaia', 'Acaya', 'Acaia', 'Achaïe', '亚该亚', 'Akhaya', 'アカイア'], None),
 'dalmatia': (['달마디아 (일루리곤)', 'Dalmatia (Illyricum)', 'Dalmacia (Ilírico)', 'Dalmácia (Ilírico)', 'Dalmatie (Illyrie)', '挞马太（以利哩古）', 'Dalmatia (Ilirikum)', 'ダルマテヤ（イルリコ）'], ['달마디아', 'Dalmatia', 'Dalmacia', 'Dalmácia', 'Dalmatie', '挞马太', 'Dalmatia', 'ダルマテヤ']),
 'italia': (['이달리야', 'Italy', 'Italia', 'Itália', 'Italie', '意大利', 'Italia', 'イタリア'], None),
 'sicilia': (['시실리 (멜리데 포함)', 'Sicily (with Malta)', 'Sicilia (con Malta)', 'Sicília (com Malta)', 'Sicile (avec Malte)', '西西里（含马耳他）', 'Sisilia (termasuk Malta)', 'シチリア（マルタを含む）'], ['시실리', 'Sicily', 'Sicilia', 'Sicília', 'Sicile', '西西里', 'Sisilia', 'シチリア']),
 'crete': (['그레데와 구레네', 'Crete and Cyrene', 'Creta y Cirene', 'Creta e Cirene', 'Crète et Cyrénaïque', '克里特和古利奈', 'Kreta dan Kirene', 'クレタとクレネ'], ['그레데·구레네', 'Crete-Cyrene', 'Creta-Cirene', 'Creta-Cirene', 'Crète-Cyrénaïque', '克里特·古利奈', 'Kreta-Kirene', 'クレタ・クレネ']),
 'egypt': (['애굽', 'Egypt', 'Egipto', 'Egito', 'Égypte', '埃及', 'Mesir', 'エジプト'], None),
}
G = {
 'italia': P([(46.5, 6.6), (46.6, 13.7), (45.6, 13.9), (44.0, 13.5), (42.0, 15.9), (41.0, 18.6), (39.8, 19.0), (37.85, 16.4), (38.2, 15.62), (40.0, 14.6), (41.3, 12.2), (42.5, 10.0), (44.0, 8.0), (44.0, 6.6)]),
 'sicilia': unary_union([P([(38.4, 12.0), (38.4, 15.6), (37.8, 15.5), (36.5, 15.3), (36.5, 12.0)]), P([(36.15, 14.0), (36.15, 14.7), (35.7, 14.7), (35.7, 14.0)])]),
 'dalmatia': P([(45.6, 13.9), (45.4, 17.0), (44.6, 19.5), (42.6, 20.5), (41.9, 19.3), (42.4, 18.0), (43.5, 15.6), (44.6, 14.4)]),
 'macedonia': P([(41.9, 19.3), (42.6, 20.5), (42.3, 22.6), (41.6, 24.0), (41.1, 24.7), (40.6, 24.7), (39.9, 23.9), (39.0, 23.3), (38.95, 22.2), (39.6, 21.0), (40.1, 19.4)]),
 'achaia': P([(40.1, 19.4), (39.6, 21.0), (38.95, 22.2), (39.0, 23.3), (38.9, 24.3), (38.3, 24.8), (37.7, 24.3), (36.2, 23.1), (36.2, 21.4), (37.6, 20.4), (38.7, 20.0), (39.6, 19.6)]),
 'asia': P([(40.5, 25.6), (40.4, 27.4), (40.25, 29.0), (40.2, 29.8), (39.6, 30.6), (38.7, 30.65), (37.9, 30.3), (37.25, 29.6), (36.85, 28.3), (36.5, 27.2), (36.3, 25.0), (37.4, 24.9), (39.5, 25.0)]),
 'bithynia': P([(41.4, 28.8), (41.5, 31.0), (42.1, 33.0), (42.1, 34.6), (41.2, 34.8), (40.6, 33.0), (40.35, 31.3), (40.2, 29.8), (40.25, 29.0)]),
 'galatia': P([(42.1, 34.6), (41.7, 36.6), (40.6, 37.8), (39.8, 36.0), (39.0, 34.4), (37.9, 34.0), (37.1, 33.9), (37.0, 32.4), (37.25, 31.7), (37.4, 30.75), (38.7, 30.65), (39.6, 30.6), (40.2, 29.8), (40.35, 31.3), (40.6, 33.0), (41.2, 34.8)]),
 'lycia': P([(37.25, 29.6), (37.4, 30.75), (37.25, 31.7), (37.0, 32.4), (36.4, 32.4), (35.9, 30.0), (36.0, 28.6), (36.85, 28.3)]),
 'cappadocia': P([(39.8, 36.0), (40.6, 37.8), (40.0, 38.8), (38.4, 38.8), (37.7, 37.4), (37.6, 35.9), (37.35, 34.4), (37.9, 34.0), (39.0, 34.4)]),
 'cilicia': P([(37.1, 33.9), (37.35, 34.4), (37.6, 35.9), (37.2, 36.6), (36.5, 36.3), (36.0, 34.6), (36.0, 32.4), (37.0, 32.4)]),
 'syria': P([(37.2, 36.6), (37.7, 37.4), (37.4, 38.6), (36.0, 39.0), (34.5, 39.0), (33.5, 37.6), (32.75, 36.7), (32.6, 36.3), (32.4, 35.9), (32.45, 35.57), (32.86, 35.645), (33.12, 35.63), (33.12, 35.22), (33.10, 34.6), (35.0, 35.4), (36.5, 35.6)]),
 'cyprus': P([(35.8, 32.1), (35.8, 34.8), (34.4, 34.8), (34.4, 32.1)]),
# 구레네: 해안을 따라 사막 쪽으로 150km쯤
 'crete': unary_union([P([(35.8, 23.3), (35.8, 26.5), (34.75, 26.5), (34.75, 23.3)]), P([(33.3, 19.9), (33.3, 22.8), (32.5, 24.2), (31.9, 25.15), (30.9, 25.0), (30.7, 23.6), (30.9, 21.6), (31.3, 20.0)])]),
 'egypt': P([(31.9, 25.15), (31.75, 29.0), (31.8, 32.4), (31.5, 33.8), (31.1, 34.25), (30.4, 33.2), (29.6, 32.5), (29.3, 31.0), (29.6, 29.3), (30.3, 27.4), (30.9, 25.0)]),  # 서쪽은 구레네와 같은 경계, 남쪽은 사막 쪽으로 둥글게
}
syria = unary_union([G['syria'], G['cilicia']]).difference(herod)
# 바울 지도의 육지 모양: 육지 가림판(assets/relief-med-mask.png — 위도 24.5–48.5·경도 8–41)을 벡터로 바꿔 속주를 해안선에 맞춰 자른다.
# 그래야 해안을 따라 점선 테두리가 보인다(전엔 바다 쪽 테두리가 가림판에 잘려 이탈리아 둘레에 점선이 없었다 — 사용자). pip install rasterio
def med_land():
    import numpy as np, rasterio.features
    from PIL import Image as _I
    from rasterio.transform import from_bounds
    m = np.array(_I.open(os.path.join(here, '..', '..', 'assets', 'relief-med-mask.png'))) > 128
    tr = from_bounds(8.0, 24.5, 41.0, 48.5, m.shape[1], m.shape[0])
    polys = [shape(g) for g, v in rasterio.features.shapes(m.astype('uint8'), mask=m, transform=tr) if v == 1]
    land = unary_union([p for p in polys if p.area > 0.02]).buffer(0.02).buffer(-0.02)  # 아주 작은 섬은 빼고, 해안선은 대충(사용자: 바다 위에서 대충 잘려도 된다)
    return land.simplify(0.02, preserve_topology=True)
LAND = med_land()
def ap(k, g, color):
    full, short = NP[k]
    return {'id': k, 'color': color, 'name': nm(full), 'short': nm(short or full), 'd': ring(g.intersection(LAND), 0.015, 2)}
# 흙빛·초록 지형과 대비되게, 이웃한 속주끼리는 따뜻한 색·차가운 색이 번갈아 (전엔 이탈리아·아가야·시실리가 지형 색에 묻혔다 — 사용자)
PC = {'italia': '#c0392b', 'sicilia': '#2f7fa8', 'dalmatia': '#7d5ab5', 'macedonia': '#1f8f8f', 'achaia': '#c0392b', 'asia': '#2f6fb5', 'bithynia': '#9a4a9a', 'galatia': '#c0392b',
      'lycia': '#1f8f8f', 'cappadocia': '#7d5ab5', 'syria': '#2f6fb5', 'cyprus': '#c0392b', 'crete': '#7d5ab5', 'egypt': '#b5603e', 'judaea': '#c0392b', 'judaea0': '#c0392b', 'antipas': '#1f8f8f'}
REST = lambda: [ap(k, G[k] if k != 'syria' else syria, PC[k]) for k in ['italia', 'sicilia', 'dalmatia', 'macedonia', 'achaia', 'asia', 'bithynia', 'galatia', 'lycia', 'cappadocia', 'syria', 'cyprus', 'crete', 'egypt']]
paul = {'credit': nm(['로마 속주 경계는 어림 (AWMC·바링턴 지도책 참고)', 'Approximate provincial borders (after AWMC / Barrington Atlas)', 'Fronteras provinciales aproximadas (según AWMC / Barrington Atlas)', 'Fronteiras provinciais aproximadas (segundo AWMC / Barrington Atlas)', 'Frontières provinciales approximatives (d’après AWMC / Barrington Atlas)', '行省边界为大致范围（参照 AWMC、Barrington 地图集）', 'Batas provinsi perkiraan (menurut AWMC / Barrington Atlas)', '属州の境界はおおよそ（AWMC・バリントン地図帳による）']),
        'eras': [
  {'from': 'a01', 'areas': [ap('judaea0', judea, PC['judaea']), ap('antipas', antipas, PC['antipas'])] + REST()},   # AD 34: 빌라도 무렵의 유대 총독령, 안디바의 갈릴리·베레아
  {'from': 'a07', 'areas': [ap('judaea', unary_union([judea, antipas]), PC['judaea'])] + REST()},                  # AD 44 뒤: 갈릴리·베레아까지 로마 속주 유대
]}
json.dump({'_comment': '시대별 영역 — _src/tools/realms.py가 만든다(직접 고치지 말 것). AD 50 무렵 로마 속주, 경계는 어림', **paul}, open(os.path.join(src, 'paul.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print('realms paul:', [(e['from'], len(e['areas'])) for e in paul['eras']])

# ---------- 모세와 여호수아: 애굽·가나안 성읍·아모리 왕들 → 요단 동쪽 → 열두 지파 (수 13–19장, 표준 지도책 따라 어림) ----------
NM = {
 'egypt': (['애굽 (신왕국)', 'Egypt (New Kingdom)', 'Egipto (Imperio Nuevo)', 'Egito (Novo Império)', 'Égypte (Nouvel Empire)', '埃及（新王国）', 'Mesir (Kerajaan Baru)', 'エジプト（新王国）'], ['애굽', 'Egypt', 'Egipto', 'Egito', 'Égypte', '埃及', 'Mesir', 'エジプト']),
 'canaan': (['가나안 성읍들', 'Canaanite city-states', 'Ciudades-estado cananeas', 'Cidades-Estado cananeias', 'Cités-États cananéennes', '迦南诸城邦', 'Negara-kota Kanaan', 'カナンの町々'],),
 'midian': (['미디안', 'Midian', 'Madián', 'Midiã', 'Madian', '米甸', 'Midian', 'ミデヤン'],),
 'sihon': (['아모리 왕 시혼 (헤스본)', 'Sihon, king of the Amorites (Heshbon)', 'Sehón, rey de los amorreos (Hesbón)', 'Seom, rei dos amorreus (Hesbom)', 'Sihon, roi des Amoréens (Heshbon)', '亚摩利王西宏（希实本）', 'Sihon, raja orang Amori (Hesybon)', 'アモリ人の王シホン（ヘシュボン）'], ['시혼', 'Sihon', 'Sehón', 'Seom', 'Sihon', '西宏', 'Sihon', 'シホン']),
 'og': (['바산 왕 옥', 'Og, king of Bashan', 'Og, rey de Basán', 'Ogue, rei de Basã', 'Og, roi de Basan', '巴珊王噩', 'Og, raja Basan', 'バシャンの王オグ'], ['옥', 'Og', 'Og', 'Ogue', 'Og', '噩', 'Og', 'オグ']),
 'israelE': (['이스라엘이 얻은 요단 동쪽 (르우벤·갓·므낫세 반)', 'Israel east of the Jordan (Reuben, Gad, half Manasseh)', 'Israel al este del Jordán (Rubén, Gad, media Manasés)', 'Israel a leste do Jordão (Rúben, Gade, meia Manassés)', 'Israël à l’est du Jourdain (Ruben, Gad, demi-Manassé)', '约旦河东归以色列（流便、迦得、玛拿西半支派）', 'Israel di timur Yordan (Ruben, Gad, setengah Manasye)', 'ヨルダン川東のイスラエル（ルベン・ガド・マナセの半部族）'], ['이스라엘', 'Israel', 'Israel', 'Israel', 'Israël', '以色列', 'Israel', 'イスラエル']),
}
TR = ['reuben', 'gad', 'manasseh', 'judah', 'simeon', 'benjamin', 'dan', 'ephraim', 'issachar', 'zebulun', 'naphtali', 'asher']
TN = dict(zip(TR, zip(
 ['르우벤', '갓', '므낫세', '유다', '시므온', '베냐민', '단', '에브라임', '잇사갈', '스불론', '납달리', '아셀'],
 ['Reuben', 'Gad', 'Manasseh', 'Judah', 'Simeon', 'Benjamin', 'Dan', 'Ephraim', 'Issachar', 'Zebulun', 'Naphtali', 'Asher'],
 ['Rubén', 'Gad', 'Manasés', 'Judá', 'Simeón', 'Benjamín', 'Dan', 'Efraín', 'Isacar', 'Zabulón', 'Neftalí', 'Aser'],
 ['Rúben', 'Gade', 'Manassés', 'Judá', 'Simeão', 'Benjamim', 'Dã', 'Efraim', 'Issacar', 'Zebulom', 'Naftali', 'Aser'],
 ['Ruben', 'Gad', 'Manassé', 'Juda', 'Siméon', 'Benjamin', 'Dan', 'Éphraïm', 'Issacar', 'Zabulon', 'Nephtali', 'Aser'],
 ['流便', '迦得', '玛拿西', '犹大', '西缅', '便雅悯', '但', '以法莲', '以萨迦', '西布伦', '拿弗他利', '亚设'],
 ['Ruben', 'Gad', 'Manasye', 'Yehuda', 'Simeon', 'Benyamin', 'Dan', 'Efraim', 'Isakhar', 'Zebulon', 'Naftali', 'Asyer'],
 ['ルベン', 'ガド', 'マナセ', 'ユダ', 'シメオン', 'ベニヤミン', 'ダン', 'エフライム', 'イッサカル', 'ゼブルン', 'ナフタリ', 'アシェル'])))
EGYPT = P([(31.6, 30.0), (31.6, 32.45), (30.4, 32.45), (29.95, 32.5), (29.3, 32.55), (28.6, 32.85), (27.45, 33.3), (27.45, 30.0)])
CANAAN = P([(31.3, 34.25), (31.25, 34.9), (31.25, 35.42), (31.76, 35.52), (32.75, 35.58), (33.30, 35.65), (33.60, 35.70), (33.60, 35.25), (33.0, 34.95), (32.0, 34.6), (31.6, 34.35)])
MIDIAN = P([(29.5, 35.02), (29.5, 36.6), (28.0, 36.6), (27.45, 35.6), (27.45, 35.25), (28.4, 34.9), (29.2, 34.98)])
SIHON = P([(31.47, 35.57), (31.47, 36.0), (32.25, 36.0), (32.25, 35.57)])
OG = P([(32.25, 35.57), (32.25, 36.0), (32.30, 36.6), (33.3, 36.6), (33.3, 35.68), (32.95, 35.65), (32.75, 35.62)])
MOAB_M, AMMON_M = MOAB.difference(SIHON), AMMON.difference(unary_union([SIHON, OG]))
EDOM_M = P([(31.05, 35.40), (31.05, 36.15), (30.40, 35.95), (29.55, 35.15), (29.55, 35.02), (30.20, 35.10), (30.75, 35.25)])
# 열두 지파 — 앞에서부터 차례로 빼서 겹치지 않게
T0 = {
 'reuben': P([(31.47, 35.57), (31.47, 36.0), (31.82, 36.0), (31.82, 35.55)]),
 'gad': P([(31.82, 35.55), (31.82, 36.0), (32.30, 35.95), (32.40, 35.75), (32.75, 35.62), (32.75, 35.58), (32.40, 35.57)]),
 'manasseh': unary_union([P([(32.30, 35.95), (32.40, 35.75), (32.75, 35.62), (32.95, 35.65), (33.3, 35.75), (33.3, 36.6), (32.5, 36.6), (32.3, 36.2)]),
                          P([(32.10, 35.55), (32.55, 35.57), (32.50, 35.30), (32.55, 35.10), (32.70, 34.97), (32.62, 34.70), (32.15, 34.70), (32.15, 35.05), (32.17, 35.35)])]),
 'simeon': P([(31.40, 34.55), (31.40, 35.00), (31.05, 35.10), (30.95, 34.65), (31.15, 34.45)]),
 'judah': P([(31.76, 35.52), (31.78, 35.25), (31.80, 35.10), (31.76, 34.98), (31.80, 34.85), (31.87, 34.60), (31.30, 34.15), (31.13, 33.80), (30.68, 34.40), (30.60, 34.90), (30.90, 35.35), (31.25, 35.42), (31.55, 35.45)]),
 'benjamin': P([(31.93, 35.56), (31.93, 35.22), (31.88, 35.08), (31.80, 35.10), (31.78, 35.25), (31.76, 35.52)]),
 'dan': P([(31.88, 35.08), (31.80, 35.10), (31.76, 34.98), (31.80, 34.85), (31.87, 34.60), (32.12, 34.70), (32.05, 34.95), (31.93, 35.05)]),
 'ephraim': P([(31.93, 35.56), (32.10, 35.55), (32.17, 35.35), (32.15, 35.05), (32.12, 34.70), (32.05, 34.95), (31.93, 35.05), (31.88, 35.08), (31.93, 35.22)]),
 'issachar': P([(32.55, 35.57), (32.72, 35.57), (32.72, 35.40), (32.65, 35.30), (32.50, 35.30)]),
 'zebulun': P([(32.62, 35.12), (32.65, 35.30), (32.72, 35.40), (32.82, 35.38), (32.87, 35.22), (32.80, 35.10), (32.70, 35.05)]),
 'naphtali': P([(32.72, 35.57), (33.25, 35.62), (33.30, 35.50), (33.10, 35.40), (32.87, 35.40), (32.82, 35.38), (32.72, 35.40)]),
 'asher': P([(32.70, 34.97), (32.80, 35.10), (32.87, 35.22), (32.87, 35.40), (33.10, 35.40), (33.30, 35.50), (33.55, 35.45), (33.55, 35.05), (33.0, 34.90), (32.82, 34.85)]),
}
TC = {'reuben': '#c9a24a', 'gad': '#5f8a4f', 'manasseh': '#3f8fa0', 'judah': '#b5603e', 'simeon': '#c98a6a', 'benjamin': '#8f7fb0', 'dan': '#6b8fb5',
      'ephraim': '#7a9a3e', 'issachar': '#b58a3e', 'zebulun': '#4f9a8a', 'naphtali': '#9a6a9a', 'asher': '#c0453a'}
taken, TG = None, {}
for k in ['simeon', 'judah', 'benjamin', 'dan', 'ephraim', 'manasseh', 'issachar', 'zebulun', 'naphtali', 'asher', 'reuben', 'gad']:
    g = T0[k] if taken is None else T0[k].difference(taken)
    TG[k] = g; taken = g if taken is None else unary_union([taken, g])
def am(k, g, color, at=False):
    v = NM[k]; full = v[0]; short = v[1] if len(v) > 1 else None
    a = {'id': k, 'color': color, 'name': nm(full), 'short': nm(short or full), 'd': ring(g)}
    return a
def tribe(k):
    g = TG[k]; big = max([g] if g.geom_type == 'Polygon' else list(g.geoms), key=lambda p: p.area); pt = big.representative_point()
    return {'id': k, 'color': TC[k], 'name': nm(list(TN[k])), 'short': nm(list(TN[k])), 'd': ring(g), 'at': [round(pt.y, 3), round(pt.x, 3)]}
MCOL = {'egypt': '#b58a3e', 'canaan': '#8f7fb0', 'midian': '#7a6a52', 'sihon': '#6b8fb5', 'og': '#3f8fa0', 'israelE': '#c9a24a'}
EDOM_A = lambda: {'id': 'edom', 'color': '#c0453a', 'name': nm(NO['edom'][0]), 'short': nm(NO['edom'][0]), 'd': ring(EDOM_M)}
MOAB_A = lambda: {'id': 'moab', 'color': '#9a6a9a', 'name': nm(NO['moab'][0]), 'short': nm(NO['moab'][0]), 'd': ring(MOAB_M)}
AMMON_A = lambda: {'id': 'ammon', 'color': '#b58a3e', 'name': nm(NO['ammon'][0]), 'short': nm(NO['ammon'][0]), 'd': ring(AMMON_M)}
moses = {'credit': CREDIT, 'eras': [
  {'from': 'm01', 'areas': [am('egypt', EGYPT, MCOL['egypt']), am('canaan', CANAAN, MCOL['canaan']), am('midian', MIDIAN, MCOL['midian']), EDOM_A(), MOAB_A(), AMMON_A(), am('sihon', SIHON, MCOL['sihon']), am('og', OG, MCOL['og'])]},
  {'from': 'm28', 'areas': [am('egypt', EGYPT, MCOL['egypt']), am('canaan', CANAAN, MCOL['canaan']), am('midian', MIDIAN, MCOL['midian']), EDOM_A(), MOAB_A(), AMMON_A(), am('israelE', unary_union([SIHON, OG]), MCOL['israelE'])]},   # 시혼과 옥을 이기고 (민 21장)
  {'from': 'm39', 'areas': [tribe(k) for k in TR] + [am('egypt', EGYPT, MCOL['egypt']), am('midian', MIDIAN, MCOL['midian']), EDOM_A(), MOAB_A(), AMMON_A()]},     # 실로에서 나눈 땅 (수 13–19장)
]}
json.dump({'_comment': '시대별 영역 — _src/tools/realms.py가 만든다(직접 고치지 말 것). 지파 경계는 어림', **moses}, open(os.path.join(src, 'moses.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print('realms moses:', [(e['from'], [a['id'] for a in e['areas']]) for e in moses['eras']])

# ---------- 모든 영역에 이름 자리(at): 색만으로는 무엇인지 몰랐다(사용자) ----------
# 영역 안에서 지도의 지역 이름·장소 핀·앞서 고른 이름과 가장 덜 겹치는 점을 고른다 (전엔 '빌립의 영지'·'데가볼리' 같은 지역 이름과 같은 자리에 겹쳤다)
import re
from shapely.geometry import Point
APP = open(os.path.join(here, '..', '..', 'app.js'), encoding='utf-8').read()
BASE_REGIONS = [(float(a), float(b)) for a, b in re.findall(r"\['[^']+', ([\d.]+), ([\d.]+)\]", APP[APP.index('let REGIONS = ['):APP.index('let REFCITIES')])]
def marks(j):
    d = os.path.join(here, '..') if j == 'jesus' else os.path.join(here, '..', 'journeys', j)
    pl = json.load(open(os.path.join(d, 'places.json'), encoding='utf-8'))
    pts = [(v['lat'], v['lng']) for v in pl.values() if isinstance(v, dict) and 'lat' in v]
    mp = json.load(open(os.path.join(d, 'journey.json'), encoding='utf-8')).get('map', {}) if j != 'jesus' else {}
    regs = [(r[1], r[2]) for r in mp.get('regions', BASE_REGIONS and [[0, a, b] for a, b in BASE_REGIONS])] + [(r[1], r[2]) for r in mp.get('labels', [])]
    return regs, pts
for fn in ['jesus', 'david', 'kings', 'paul', 'moses']:
    fp = os.path.join(src, fn + '.json'); R = json.load(open(fp, encoding='utf-8'))
    regs, pts = marks(fn)
    for er in R['eras']:
        chosen = []
        for a in er['areas']:
            if fn == 'moses' and 'at' in a: chosen.append(tuple(a['at'])); continue  # 지파는 이미 골라 둠
            polys = [Polygon([(y, x) for x, y in r]) for r in a['d']]
            big = max(polys, key=lambda p: p.area)
            x0, y0, x1, y1 = big.bounds; st = max(x1 - x0, y1 - y0) / 24
            best, bs = big.representative_point(), -1
            yy = y0
            while yy <= y1:
                xx = x0
                while xx <= x1:
                    q = Point(xx, yy)
                    if big.contains(q):
                        edge = big.exterior.distance(q)
                        near = min([((yy - la) ** 2 + ((xx - ln) * .4) ** 2) ** .5 for la, ln in regs + chosen] + [9])  # 지역 이름은 가로로 길어 옆으로 더 멀리 비킨다
                        pin = min([((yy - la) ** 2 + (xx - ln) ** 2) ** .5 for la, ln in pts] + [9])
                        sc = min(edge, .6) * 1.2 + min(near, .5) + min(pin, .12) * 2
                        if sc > bs: bs, best = sc, q
                    xx += st
                yy += st
            a['at'] = [round(best.y, 3), round(best.x, 3)]; chosen.append(tuple(a['at']))
    json.dump(R, open(fp, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print('at: done')

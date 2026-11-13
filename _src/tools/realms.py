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
GILEAD = P([(32.75, 35.60), (32.75, 36.05), (32.45, 36.10), (32.15, 35.95), (31.75, 35.80), (31.75, 35.55), (32.10, 35.55), (32.40, 35.57)])
JUDAH = P([(31.92, 35.53), (31.88, 35.10), (31.80, 34.95), (31.65, 34.88), (31.50, 34.78), (31.35, 34.70), (31.15, 34.52), (30.85, 34.38), (30.55, 34.45), (30.45, 34.90), (30.75, 35.20), (31.10, 35.38), (31.45, 35.39), (31.75, 35.45)])
PHILISTIA = P([(32.12, 34.70), (32.05, 34.88), (31.80, 34.95), (31.65, 34.88), (31.50, 34.78), (31.35, 34.70), (31.15, 34.52), (31.20, 34.10), (31.60, 34.30), (31.95, 34.55)]).difference(JUDAH)
PHOENICIA = P([(32.83, 34.90), (32.92, 35.08), (33.08, 35.15), (33.10, 35.35), (33.30, 35.55), (33.55, 35.70), (34.00, 35.92), (34.45, 36.12), (34.45, 35.70), (34.00, 35.40), (33.55, 35.10), (33.10, 34.90)])
ARAM = P([(33.30, 35.68), (33.55, 35.70), (34.00, 35.92), (34.45, 36.12), (34.60, 36.60), (34.40, 37.40), (33.30, 37.40), (32.75, 36.70), (32.75, 36.05), (32.75, 35.60), (32.90, 35.64)])
AMMON = P([(32.15, 35.95), (32.25, 36.45), (31.70, 36.45), (31.70, 35.85), (31.75, 35.80)])
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

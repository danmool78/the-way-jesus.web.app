"""모세 여정 명화의 출처 글: images.json(한국어 credit)과 번역본 i18n/<언어>.json의 events.<id>.credit을 한꺼번에 쓴다.
그림 파일은 assets/img/mXX.webp (Wikimedia Commons의 퍼블릭 도메인 그림을 1000px 안으로 줄여 webp로).
Run: python3 _src/journeys/moses/art.py"""
import json, os
here = os.path.dirname(os.path.abspath(__file__))
L = ['ko', 'en', 'es', 'pt', 'fr', 'zh', 'id', 'ja']
ARTIST = {  # 언어별 화가 이름 (en·es·pt·fr·id는 원래 이름 그대로)
    'tissot': ['제임스 티소', 'James Tissot', '詹姆斯·蒂索', 'ジェームズ・ティソ'],
    'domenichino': ['도메니키노', 'Domenichino', '多梅尼基诺', 'ドメニキーノ'],
    'roberts': ['데이비드 로버츠', 'David Roberts', '大卫·罗伯茨', 'デイヴィッド・ロバーツ'],
    'poussin': ['니콜라 푸생', 'Nicolas Poussin', '尼古拉·普桑', 'ニコラ・プッサン'],
    'gerome': ['장레옹 제롬', 'Jean-Léon Gérôme', '让-莱昂·热罗姆', 'ジャン＝レオン・ジェローム'],
    'rembrandt': ['렘브란트', 'Rembrandt', '伦勃朗', 'レンブラント'],
    'schiavone': ['안드레아 스키아보네', 'Andrea Schiavone', '安德烈亚·斯基亚沃内', 'アンドレア・スキアヴォーネ'],
    'botticelli': ['산드로 보티첼리', 'Sandro Botticelli', '桑德罗·波提切利', 'サンドロ・ボッティチェッリ'],
    'west': ['벤저민 웨스트', 'Benjamin West', '本杰明·韦斯特', 'ベンジャミン・ウェスト'],
    'martin': ['존 마틴', 'John Martin', '约翰·马丁', 'ジョン・マーティン'],
}
MUSEUM = {  # ko, en, es, pt, fr, zh, id, ja
    'jm': ['뉴욕 유대 박물관', 'The Jewish Museum, New York', 'Museo Judío de Nueva York', 'Museu Judaico de Nova York', 'Jewish Museum de New York', '纽约犹太博物馆', 'Museum Yahudi New York', 'ニューヨーク・ユダヤ博物館'],
    'met': ['메트로폴리탄 미술관', 'The Metropolitan Museum of Art', 'Museo Metropolitano de Arte', 'Museu Metropolitano de Arte', 'Metropolitan Museum of Art', '大都会艺术博物馆', 'Museum Seni Metropolitan', 'メトロポリタン美術館'],
    'bmag': ['버밍엄 박물관·미술관', 'Birmingham Museum and Art Gallery', 'Museo y Galería de Arte de Birmingham', 'Museu e Galeria de Arte de Birmingham', 'Birmingham Museum and Art Gallery', '伯明翰博物馆与美术馆', 'Museum dan Galeri Seni Birmingham', 'バーミンガム美術館'],
    'bma': ['볼티모어 미술관', 'Baltimore Museum of Art', 'Museo de Arte de Baltimore', 'Museu de Arte de Baltimore', 'Baltimore Museum of Art', '巴尔的摩艺术博物馆', 'Museum Seni Baltimore', 'ボルティモア美術館'],
    'private': ['개인 소장', 'Private collection', 'Colección privada', 'Coleção particular', 'Collection particulière', '私人收藏', 'Koleksi pribadi', '個人蔵'],
    'berlin': ['베를린 회화관', 'Gemäldegalerie, Berlin', 'Gemäldegalerie de Berlín', 'Gemäldegalerie de Berlim', 'Gemäldegalerie de Berlin', '柏林画廊', 'Gemäldegalerie Berlin', 'ベルリン絵画館'],
    'sistine': ['시스티나 예배당', 'Sistine Chapel', 'Capilla Sixtina', 'Capela Sistina', 'Chapelle Sixtine', '西斯廷礼拜堂', 'Kapel Sistina', 'システィーナ礼拝堂'],
    'agnsw': ['뉴사우스웨일스 미술관', 'Art Gallery of New South Wales', 'Galería de Arte de Nueva Gales del Sur', 'Galeria de Arte de Nova Gales do Sul', 'Art Gallery of New South Wales', '新南威尔士美术馆', 'Galeri Seni New South Wales', 'ニューサウスウェールズ州立美術館'],
    'ycba': ['예일 영국 미술 센터', 'Yale Center for British Art', 'Centro de Arte Británico de Yale', 'Centro de Arte Britânica de Yale', 'Yale Center for British Art', '耶鲁英国艺术中心', 'Yale Center for British Art', 'イェール英国美術センター'],
}
PD = ['퍼블릭 도메인', 'Public domain', 'Dominio público', 'Domínio público', 'Domaine public', '公有领域', 'Domain publik', 'パブリックドメイン']
# id: (화가, 제목, 연도, 어림 여부, 소장처, Commons 파일 이름)
ART = {
 'm01': ('tissot', 'Pharaoh Notes the Importance of the Jewish People', '1896–1902', 1, 'jm', 'Tissot Pharaoh Notes the Importance of the Jewish People.jpg'),
 'm02': ('tissot', 'Moses Laid Amid the Flags', '1896–1902', 1, 'jm', 'Tissot Moses Laid Amid the Flags.jpg'),
 'm03': ('tissot', 'Moses Slays an Egyptian', '1896–1902', 1, 'jm', 'Tissot Moses Slays an Egyptian.jpg'),
 'm04': ('domenichino', 'Landscape with Moses and the Burning Bush', '1610–1616', 1, 'met', 'Landscape with Moses and the Burning Bush MET DT10296.jpg'),
 'm05': ('tissot', 'Moses Speaks to Pharaoh', '1896–1902', 1, 'jm', 'Tissot Moses Speaks to Pharaoh.jpg'),
 'm06': ('tissot', 'Water Is Changed into Blood', '1896–1902', 1, 'jm', 'Tissot Water Is Changed into Blood.jpg'),
 'm07': ('tissot', 'The Signs on the Door', '1896–1902', 1, 'jm', 'Tissot The Signs on the Door.jpg'),
 'm08': ('roberts', 'The Israelites Leaving Egypt', '1829', 0, 'bmag', 'David Roberts-IsraelitesLeavingEgypt 1828.jpg'),
 'm09': ('tissot', 'The Waters Are Divided', '1896–1902', 1, 'jm', 'Tissot The Waters Are Divided.jpg'),
 'm10': ('tissot', 'The Songs of Joy', '1896–1902', 1, 'jm', 'Tissot The Songs of Joy.jpg'),
 'm11': ('poussin', 'Moses Sweetening the Bitter Waters of Marah', '1629–1630', 1, 'bma', 'Moïse adoucissant les eaux de Marah - Poussin - BaltimoreMA.jpg'),
 'm12': ('tissot', 'The Gathering of the Manna', '1896–1902', 1, 'jm', 'Tissot The Gathering of the Manna (color).jpg'),
 'm13': ('tissot', 'Moses Strikes the Rock', '1896–1902', 1, 'jm', 'Tissot Moses Strikes the Rock.jpg'),
 'm14': ('tissot', 'Moses on the Mountain During the Battle', '1896–1902', 1, 'jm', 'Tissot Moses on the Mountain During the Battle.jpg'),
 'm15': ('tissot', 'Jethro and Moses', '1896–1902', 1, 'jm', 'Tissot Jethro and Moses.jpg'),
 'm16': ('gerome', 'Moses on Mount Sinai', '1895–1900', 1, 'private', 'Gérôme, Jean-Léon - Moses on Mount Sinai Jean-Léon Gérôme -1895-1900.jpg'),
 'm17': ('tissot', 'Moses and the Ten Commandments', '1896–1902', 1, 'jm', 'Tissot Moses and the Ten Commandments.jpg'),
 'm18': ('tissot', 'Moses Forbids the People to Follow Him', '1896–1902', 1, 'jm', 'Tissot Moses Forbids the People to Follow Him.jpg'),
 'm19': ('tissot', 'The Golden Calf', '1896–1902', 1, 'jm', 'Tissot The Golden Calf.jpg'),
 'm20': ('rembrandt', 'Moses with the Tablets of the Law', '1659', 0, 'berlin', 'Rembrandt - Moses with the Ten Commandments - Google Art Project.jpg'),
 'm21': ('tissot', 'Bezalel', '1896–1902', 1, 'jm', 'Tissot Bezalel.jpg'),
 'm22': ('schiavone', 'Moses Showing the Quails to the Israelites', '1545', 1, 'met', 'Moses Showing the Quails to the Israelites MET DP269451.jpg'),
 'm23': ('tissot', 'The Grapes of Canaan', '1896–1902', 1, 'jm', 'Tissot The Grapes of Canaan.jpg'),
 'm24': ('botticelli', 'The Punishment of Korah', '1481–1482', 0, 'sistine', 'Sandro Botticelli - The Punishment of Korah and the Stoning of Moses and Aaron - WGA2747.jpg'),
 'm25': ('tissot', 'Moses Smites the Rock in the Desert', '1896–1902', 1, 'jm', 'Tissot Moses Smites the Rock in the Desert.jpg'),
 'm26': ('tissot', 'The Death of Aaron', '1896–1902', 1, 'jm', 'Tissot The Death of Aaron.jpg'),
 'm27': ('tissot', 'The Brazen Serpent', '1896–1902', 1, 'jm', 'Tissot The Brazen Serpent.jpg'),
 'm28': ('tissot', 'The Conquest of the Amorites', '1896–1902', 1, 'jm', 'Tissot The Conquest of the Amorites.jpg'),
 'm29': ('tissot', 'Balaam and the Ass', '1896–1902', 1, 'jm', 'Tissot Balaam and the Ass.jpg'),
 'm30': ('tissot', 'Moses and Joshua in the Tabernacle', '1896–1902', 1, 'jm', 'Tissot Moses and Joshua in the Tabernacle.jpg'),
 'm31': ('tissot', 'Moses Sees the Promised Land from Afar', '1896–1902', 1, 'jm', 'Tissot Moses Sees the Promised Land from Afar.jpg'),
 'm32': ('tissot', 'Moses Blesses Joshua Before the High Priest', '1896–1902', 1, 'jm', 'Tissot Moses Blesses Joshua Before the High Priest.jpg'),
 'm33': ('tissot', 'The Harlot of Jericho and the Two Spies', '1896–1902', 1, 'jm', 'Tissot The Harlot of Jericho and the Two Spies.jpg'),
 'm34': ('west', 'Joshua Passing the River Jordan with the Ark of the Covenant', '1800', 0, 'agnsw', 'Benjamin West - Joshua passing the River Jordan with the Ark of the Covenant - Google Art Project.jpg'),
 'm35': ('tissot', 'The Seven Trumpets of Jericho', '1896–1902', 1, 'jm', 'Tissot The Seven Trumpets of Jericho.jpg'),
 'm36': ('tissot', 'Ai Is Taken by Joshua', '1896–1902', 1, 'jm', 'Ai is taken by Joshua (Joshua 8 19) gouache on board by James Tissot Jewish Museum New York.jpg'),
 'm37': ('tissot', 'The Ark of the Covenant', '1896–1902', 1, 'jm', 'Tissot The Ark of the Covenant.jpg'),
 'm38': ('martin', 'Joshua Commanding the Sun to Stand Still', '1840', 1, 'ycba', 'John Martin - Joshua Commanding the Sun to Stand Still - Google Art Project.jpg'),
}
def when(y, c, l):
    if l == 'ko': return f'{y}년경' if c else f'{y}년'
    if l == 'zh': return f'约{y}年' if c else f'{y}年'
    if l == 'ja': return f'{y}年頃' if c else f'{y}年'
    if not c: return y
    return {'fr': f'vers {y}', 'id': f'sekitar {y}'}.get(l, f'c. {y}')
def credit(a, l):
    who, title, y, c, mus, _ = a
    n = ARTIST[who]; i = L.index(l)
    name = n[0] if l == 'ko' else n[2] if l == 'zh' else n[3] if l == 'ja' else n[1]
    if l == 'ko': return f'{name} 〈{title}〉 {when(y, c, l)} · {MUSEUM[mus][i]} · {PD[i]}'
    if l == 'zh': return f'{name}《{title}》{when(y, c, l)} · {MUSEUM[mus][i]} · {PD[i]}'
    if l == 'ja': return f'{name}《{title}》{when(y, c, l)}・{MUSEUM[mus][i]}・{PD[i]}'
    return f'{name}, {title}, {when(y, c, l)} · {MUSEUM[mus][i]} · {PD[i]}'
# 명화를 찾지 못한 장면은 AI로 그린 그림으로 대신하고, 그렇다고 밝힌다 (출처 주소 없음)
AI = {'m39': 'Shiloh', 'm40': 'Shechem'}
AI_CREDIT = ['AI로 그린 그림 · 명화를 찾지 못한 장면이라 대신 그렸습니다', 'AI-generated image · drawn in place of a painting, as none was found for this scene',
             'Imagen generada con IA · en lugar de una pintura, pues no se halló ninguna para esta escena', 'Imagem gerada por IA · no lugar de uma pintura, pois não se encontrou nenhuma para esta cena',
             'Image générée par IA · à la place d’un tableau, faute d’en avoir trouvé un pour cette scène', 'AI 生成的图画 · 此场景未找到名画，故以此代替',
             'Gambar buatan AI · pengganti lukisan karena tidak ditemukan lukisan untuk adegan ini', 'AIで描いた絵・この場面に合う名画が見つからなかったため代わりに描きました']
src = lambda f: 'https://commons.wikimedia.org/wiki/File:' + f.replace(' ', '_')
json.dump({**{k: {'title': a[1], 'credit': credit(a, 'ko'), 'source': src(a[5])} for k, a in ART.items()}, **{k: {'title': v, 'credit': AI_CREDIT[0], 'source': ''} for k, v in AI.items()}},
          open(os.path.join(here, 'images.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
for l in L[1:]:
    p = os.path.join(here, 'i18n', f'{l}.json'); d = json.load(open(p, encoding='utf-8'))
    for k, e in d['events'].items():
        e['credit'] = credit(ART[k], l) if k in ART else AI_CREDIT[L.index(l)] if k in AI else ''
    json.dump(d, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(ART), 'paintings,', len(AI), 'AI images')

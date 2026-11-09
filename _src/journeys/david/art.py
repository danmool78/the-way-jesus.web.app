"""다윗 여정 명화의 출처 글: images.json(한국어 credit)과 번역본 i18n/<언어>.json의 events.<id>.credit을 한꺼번에 쓴다.
그림 파일은 assets/img/dXX.webp (Wikimedia Commons의 퍼블릭 도메인 그림을 1000px 안으로 줄여 webp로). 모세 여정의 art.py와 같은 틀.
번역본 파일이 아직 없는 언어는 건너뛴다 (번역을 만든 뒤 다시 돌리면 credit이 채워진다).
Run: python3 _src/journeys/david/art.py"""
import json, os
here = os.path.dirname(os.path.abspath(__file__))
L = ['ko', 'en', 'es', 'pt', 'fr', 'zh', 'id', 'ja']
ARTIST = {  # 언어별 화가 이름: [ko, en(es·pt·fr·id도), zh, ja] — 이름 모를 화가처럼 언어마다 다르면 L 순서로 8개
    'tissot': ['제임스 티소', 'James Tissot', '詹姆斯·蒂索', 'ジェームズ・ティソ'],
    'roberts': ['데이비드 로버츠', 'David Roberts', '大卫·罗伯茨', 'デイヴィッド・ロバーツ'],
    'rembrandt': ['렘브란트', 'Rembrandt', '伦勃朗', 'レンブラント'],
    'gardner': ['엘리자베스 제인 가드너', 'Elizabeth Jane Gardner', '伊丽莎白·简·加德纳', 'エリザベス・ジェーン・ガードナー'],
    'veronese': ['파올로 베로네세', 'Paolo Veronese', '保罗·委罗内塞', 'パオロ・ヴェロネーゼ'],
    'schindler': ['오스마르 쉰들러', 'Osmar Schindler', '奥斯马尔·申德勒', 'オスマール・シンドラー'],
    'dore': ['귀스타브 도레', 'Gustave Doré', '古斯塔夫·多雷', 'ギュスターヴ・ドレ'],
    'guercino': ['구에르치노', 'Guercino', '圭尔奇诺', 'グエルチーノ'],
    'gelder': ['아르트 더 헬더르', 'Aert de Gelder', '阿尔特·德·赫尔德', 'アールト・デ・ヘルデル'],
    'schnorr': ['율리우스 슈노어 폰 카롤스펠트', 'Julius Schnorr von Carolsfeld', '尤利乌斯·施诺尔·冯·卡罗尔斯费尔德', 'ユリウス・シュノル・フォン・カロルスフェルト'],
    'rubens': ['페테르 파울 루벤스', 'Peter Paul Rubens', '彼得·保罗·鲁本斯', 'ピーテル・パウル・ルーベンス'],
    'hardy': ['폴 하디', 'Paul Hardy', '保罗·哈迪', 'ポール・ハーディ'],
    'grebber': ['피터르 더 흐레버르', 'Pieter de Grebber', '彼得·德·格雷伯', 'ピーテル・デ・フレッベル'],
    'lastman': ['피터르 라스트만', 'Pieter Lastman', '彼得·拉斯特曼', 'ピーテル・ラストマン'],
    'palma': ['팔마 일 조바네', 'Palma il Giovane', '小帕尔马', 'パルマ・イル・ジョーヴァネ'],
    'devos': ['코르넬리스 더 보스', 'Cornelis de Vos', '科内利斯·德·沃斯', 'コルネリス・デ・フォス'],
    'honthorst': ['헤릿 반 혼토르스트', 'Gerard van Honthorst', '赫拉德·范·洪特霍斯特', 'ヘラルト・ファン・ホントホルスト'],
    'bleyswijck': ['프랑수아 반 블레이스베이크', 'François van Bleyswijck', '弗朗索瓦·范·布莱斯韦克', 'フランソワ・ファン・ブレイスウェイク'],
    'harding': ['스테파노 하딩 성경의 채식사', 'Illuminator of the Bible of Stephen Harding', 'Iluminador de la Biblia de Esteban Harding', 'Iluminador da Bíblia de Estêvão Harding',
                "Enlumineur de la Bible d'Étienne Harding", '斯蒂芬·哈丁圣经的插图画家', 'Iluminator Alkitab Stephen Harding', 'スティーブン・ハーディングの聖書の彩飾師'],
}
MUSEUM = {  # ko, en, es, pt, fr, zh, id, ja
    'jm': ['뉴욕 유대 박물관', 'The Jewish Museum, New York', 'Museo Judío de Nueva York', 'Museu Judaico de Nova York', 'Jewish Museum de New York', '纽约犹太博物馆', 'Museum Yahudi New York', 'ニューヨーク・ユダヤ博物館'],
    'private': ['개인 소장', 'Private collection', 'Colección privada', 'Coleção particular', 'Collection particulière', '私人收藏', 'Koleksi pribadi', '個人蔵'],
    'rylands': ['맨체스터 존 라일랜즈 도서관', 'John Rylands Library, Manchester', 'Biblioteca John Rylands, Mánchester', 'Biblioteca John Rylands, Manchester', 'John Rylands Library, Manchester', '曼彻斯特约翰·赖兰兹图书馆', 'Perpustakaan John Rylands, Manchester', 'マンチェスター、ジョン・ライランズ図書館'],
    'nmwa': ['국립 여성 예술 박물관', 'National Museum of Women in the Arts', 'Museo Nacional de la Mujer en las Artes', 'Museu Nacional das Mulheres nas Artes', 'National Museum of Women in the Arts', '国家女性艺术博物馆', 'Museum Nasional Perempuan dalam Seni', '国立女性美術館'],
    'khm': ['빈 미술사 박물관', 'Kunsthistorisches Museum, Vienna', 'Museo de Historia del Arte de Viena', 'Museu de História da Arte de Viena', 'Kunsthistorisches Museum de Vienne', '维也纳艺术史博物馆', 'Museum Sejarah Seni Wina', 'ウィーン美術史美術館'],
    'mauritshuis': ['헤이그 마우리츠하위스 미술관', 'Mauritshuis, The Hague', 'Mauritshuis, La Haya', 'Mauritshuis, Haia', 'Mauritshuis, La Haye', '海牙莫瑞泰斯皇家美术馆', 'Mauritshuis, Den Haag', 'マウリッツハイス美術館'],
    'barberini': ['로마 국립 고전 미술관', "Galleria Nazionale d'Arte Antica, Rome", 'Galería Nacional de Arte Antiguo, Roma', 'Galeria Nacional de Arte Antiga, Roma', "Galerie nationale d'art ancien, Rome", '罗马国立古代艺术画廊', "Galleria Nazionale d'Arte Antica, Roma", 'ローマ国立古典絵画館'],
    'hermitage': ['에르미타주 미술관', 'Hermitage Museum, Saint Petersburg', 'Museo del Hermitage, San Petersburgo', 'Museu Hermitage, São Petersburgo', "Musée de l'Ermitage, Saint-Pétersbourg", '圣彼得堡艾尔米塔什博物馆', 'Museum Hermitage, Sankt Peterburg', 'エルミタージュ美術館'],
    'getty': ['J. 폴 게티 미술관', 'J. Paul Getty Museum', 'Museo J. Paul Getty', 'Museu J. Paul Getty', 'J. Paul Getty Museum', '保罗·盖蒂博物馆', 'Museum J. Paul Getty', 'J・ポール・ゲティ美術館'],
    'dijon': ['디종 시립 도서관', 'Bibliothèque municipale de Dijon', 'Biblioteca municipal de Dijon', 'Biblioteca municipal de Dijon', 'Bibliothèque municipale de Dijon', '第戎市立图书馆', 'Perpustakaan Kota Dijon', 'ディジョン市立図書館'],
    'rijks': ['암스테르담 국립 미술관', 'Rijksmuseum, Amsterdam', 'Rijksmuseum, Ámsterdam', 'Rijksmuseum, Amsterdã', 'Rijksmuseum, Amsterdam', '阿姆斯特丹国立博物馆', 'Rijksmuseum, Amsterdam', 'アムステルダム国立美術館'],
    'dia': ['디트로이트 미술관', 'Detroit Institute of Arts', 'Instituto de Artes de Detroit', 'Instituto de Artes de Detroit', 'Detroit Institute of Arts', '底特律美术馆', 'Detroit Institute of Arts', 'デトロイト美術館'],
    'loc': ['미국 의회도서관', 'Library of Congress', 'Biblioteca del Congreso', 'Biblioteca do Congresso', 'Bibliothèque du Congrès', '美国国会图书馆', 'Perpustakaan Kongres AS', 'アメリカ議会図書館'],
    'catharijne': ['위트레흐트 카타레이너콘번트 박물관', 'Museum Catharijneconvent, Utrecht', 'Museo Catharijneconvent, Utrecht', 'Museu Catharijneconvent, Utrecht', 'Musée Catharijneconvent, Utrecht', '乌得勒支圣凯瑟琳修道院博物馆', 'Museum Catharijneconvent, Utrecht', 'ユトレヒト、カタレイネコンフェント美術館'],
    'leiden': ['라이덴 컬렉션', 'The Leiden Collection, New York', 'The Leiden Collection, Nueva York', 'The Leiden Collection, Nova York', 'The Leiden Collection, New York', '莱顿收藏', 'The Leiden Collection, New York', 'ライデン・コレクション'],
    'centraal': ['위트레흐트 중앙 박물관', 'Centraal Museum, Utrecht', 'Centraal Museum, Utrecht', 'Centraal Museum, Utrecht', 'Centraal Museum, Utrecht', '乌得勒支中央博物馆', 'Centraal Museum, Utrecht', 'ユトレヒト中央美術館'],
    # 판화 성경 — 소장처 대신 실린 책
    'dorebible': ['도레 성경 판화', "Doré's English Bible", 'Biblia ilustrada por Doré', 'Bíblia ilustrada por Doré', 'Bible illustrée par Doré', '多雷插图圣经', 'Alkitab bergambar Doré', 'ドレの挿絵聖書'],
    'bibelbild': ['《그림 성경》(Die Bibel in Bildern)', 'Die Bibel in Bildern', 'Die Bibel in Bildern', 'Die Bibel in Bildern', 'Die Bibel in Bildern', '《图画圣经》', 'Die Bibel in Bildern', '『絵で見る聖書』'],
}
PD = ['퍼블릭 도메인', 'Public domain', 'Dominio público', 'Domínio público', 'Domaine public', '公有领域', 'Domain publik', 'パブリックドメイン']
# id: (화가, 제목, 연도, 어림 여부, 소장처, Commons 파일 이름) — 연도·소장처가 None이면 빼고 적는다
# 티소의 다윗 장면은 채색 그림(뉴욕 유대 박물관)이 Commons에 거의 없어, 그 그림의 밑그림인 펜 스케치(존 라일랜즈 도서관)를 쓴다
TD = lambda n, en, ref, fr: f'Tissot Drawing {n} {en} {ref} for Brunoff {fr}.jpg'
ART = {}  # 아래 표는 그림을 고른 뒤 채운다
def when(y, c, l):
    if l == 'ko': return f'{y}년경' if c else f'{y}년'
    if l == 'zh': return f'约{y}年' if c else f'{y}年'
    if l == 'ja': return f'{y}年頃' if c else f'{y}年'
    if not c: return y
    return {'fr': f'vers {y}', 'id': f'sekitar {y}'}.get(l, f'c. {y}')
def credit(a, l):
    who, title, y, c, mus, _ = a
    n = ARTIST[who]; i = L.index(l)
    name = n[i] if len(n) == 8 else n[0] if l == 'ko' else n[2] if l == 'zh' else n[3] if l == 'ja' else n[1]
    tail = [when(y, c, l)] if y else []
    rest = ([MUSEUM[mus][i]] if mus else []) + [PD[i]]
    if l == 'ko': return ' '.join([f'{name} 〈{title}〉'] + tail) + ' · ' + ' · '.join(rest)
    if l == 'zh': return ''.join([f'{name}《{title}》'] + tail) + ' · ' + ' · '.join(rest)
    if l == 'ja': return ''.join([f'{name}《{title}》'] + tail) + '・' + '・'.join(rest)
    return ', '.join([name, title] + tail) + ' · ' + ' · '.join(rest)
src = lambda f: 'https://commons.wikimedia.org/wiki/File:' + f.replace(' ', '_')
if __name__ == '__main__':
    json.dump({k: {'title': a[1], 'credit': credit(a, 'ko'), 'source': src(a[5])} for k, a in ART.items()},
              open(os.path.join(here, 'images.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    done = []
    for l in L[1:]:
        p = os.path.join(here, 'i18n', f'{l}.json')
        if not os.path.exists(p): continue  # 번역본이 아직 없다
        d = json.load(open(p, encoding='utf-8'))
        for k, e in d['events'].items():
            e['credit'] = credit(ART[k], l) if k in ART else ''
        json.dump(d, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        done.append(l)
    print(len(ART), 'paintings;', 'credits in', ', '.join(done) if done else 'no translations yet')

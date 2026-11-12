"""바울 여정 명화의 출처 글: images.json(한국어 credit)과 번역본 i18n/<언어>.json의 events.<id>.credit을 한꺼번에 쓴다.
그림 파일은 assets/img/aXX.webp (Wikimedia Commons의 퍼블릭 도메인·CC0 그림을 1000px 안으로 줄여 webp로). 열왕기 여정의 art.py와 같은 틀.
번역본 파일이 아직 없는 언어는 건너뛴다 (번역을 만든 뒤 다시 돌리면 credit이 채워진다).
Run: python3 _src/journeys/paul/art.py"""
import json, os
here = os.path.dirname(os.path.abspath(__file__))
L = ['ko', 'en', 'es', 'pt', 'fr', 'zh', 'id', 'ja']
ARTIST = {  # 언어별 화가 이름: [ko, en(es·pt·fr·id도), zh, ja] — 언어마다 다르면 L 순서로 8개
    'west': ['벤저민 웨스트', 'Benjamin West', '本杰明·韦斯特', 'ベンジャミン・ウェスト'],
    'caravaggio': ['카라바조', 'Caravaggio', '卡拉瓦乔', 'カラヴァッジョ'],
    'cortona': ['피에트로 다 코르토나', 'Pietro da Cortona', '彼得罗·达·科尔托纳', 'ピエトロ・ダ・コルトーナ'],
    'heemskerck': ['필립스 갈레(마르턴 판 헤임스케르크 밑그림)', 'Philips Galle after Maarten van Heemskerck', 'Philips Galle según Maarten van Heemskerck', 'Philips Galle segundo Maarten van Heemskerck', "Philips Galle d'après Maarten van Heemskerck", '菲利普斯·加勒（仿马尔滕·范·海姆斯凯克）', 'Philips Galle menurut Maarten van Heemskerck', 'フィリップス・ハレ（マルテン・ファン・ヘームスケルク原画）'],
    'bos': ['코르넬리스 보스', 'Cornelis Bos', '科内利斯·博斯', 'コルネリス・ボス'],
    'dubourg': ['루이 파브리티우스 뒤부르', 'Louis Fabritius Dubourg', '路易·法布里蒂乌斯·杜布尔', 'ルイ・ファブリティウス・デュブール'],
    'grebber': ['피터르 더 흐레버르(전칭)', 'Attributed to Pieter de Grebber', 'Atribuido a Pieter de Grebber', 'Atribuído a Pieter de Grebber', 'Attribué à Pieter de Grebber', '传彼得·德·格雷伯', 'Diatribusikan kepada Pieter de Grebber', 'ピーテル・デ・フレッベル（伝）'],
    'raphael': ['라파엘로', 'Raphael', '拉斐尔', 'ラファエロ'],
    'sandrart': ['요한 야코프 폰 잔트라르트 밑그림', 'After Johann Jakob von Sandrart', 'Según Johann Jakob von Sandrart', 'Segundo Johann Jakob von Sandrart', "D'après Johann Jakob von Sandrart", '仿约翰·雅各布·冯·桑德拉特', 'Menurut Johann Jakob von Sandrart', 'ヨハン・ヤーコプ・フォン・ザンドラルト原画'],
    'jluyken': ['얀 라위컨', 'Jan Luyken', '扬·吕肯', 'ヤン・ライケン'],
    'rembrandt': ['렘브란트', 'Rembrandt', '伦勃朗', 'レンブラント'],
    'drost': ['빌럼 드로스트', 'Willem Drost', '威廉·德罗斯特', 'ウィレム・ドロスト'],
    'ellenrieder': ['마리 엘렌리더', 'Marie Ellenrieder', '玛丽·埃伦里德', 'マリー・エレンリーダー'],
    'howson': ['《Scenes from the Life of St. Paul》 삽화', 'Illustration from Scenes from the Life of St. Paul', 'Ilustración de Scenes from the Life of St. Paul', 'Ilustração de Scenes from the Life of St. Paul', 'Illustration de Scenes from the Life of St. Paul', '《Scenes from the Life of St. Paul》插图', 'Ilustrasi dari Scenes from the Life of St. Paul', '『Scenes from the Life of St. Paul』挿絵'],
    'dore': ['귀스타브 도레', 'Gustave Doré', '古斯塔夫·多雷', 'ギュスターヴ・ドレ'],
    'sadeler': ['라파엘 사델러르(요스 판 빙허 밑그림)', 'Raphael Sadeler after Joos van Winghe', 'Raphael Sadeler según Joos van Winghe', 'Raphael Sadeler segundo Joos van Winghe', "Raphael Sadeler d'après Joos van Winghe", '拉斐尔·萨德勒（仿约斯·范·温赫）', 'Raphael Sadeler menurut Joos van Winghe', 'ラファエル・サデレル（ヨース・ファン・ウィンゲ原画）'],
    'valentin': ['발랑탱 드 불로뉴', 'Valentin de Boulogne', '瓦朗坦·德·布洛涅', 'ヴァランタン・ド・ブーローニュ'],
    'lesueur': ['외스타슈 르 쉬외르', 'Eustache Le Sueur', '厄斯塔什·勒叙厄尔', 'ウスタシュ・ル・シュウール'],
    'figures': ['《Figures de la Bible》 판화가들', 'Illustrators of Figures de la Bible', 'Ilustradores de Figures de la Bible', 'Ilustradores de Figures de la Bible', 'Illustrateurs des Figures de la Bible', '《Figures de la Bible》插画家', 'Para ilustrator Figures de la Bible', '『Figures de la Bible』の挿絵画家たち'],
    'bodarevsky': ['니콜라이 보다렙스키', 'Nikolai Bodarevsky', '尼古拉·博达列夫斯基', 'ニコライ・ボダレフスキー'],
    'lahyre': ['로랑 드 라 이르', 'Laurent de La Hyre', '洛朗·德·拉伊尔', 'ローラン・ド・ラ・イール'],
    'biblecard': ['성경 카드', 'Bible card', 'Tarjeta bíblica', 'Cartão bíblico', 'Carte biblique', '圣经卡片', 'Kartu Alkitab', '聖書カード'],
    'anon': ['작자 미상', 'Unknown artist', 'Autor desconocido', 'Autor desconhecido', 'Artiste inconnu', '佚名', 'Seniman tak dikenal', '作者不詳'],
}
MUSEUM = {  # ko, en, es, pt, fr, zh, id, ja
    'mfa': ['보스턴 미술관', 'Museum of Fine Arts, Boston', 'Museo de Bellas Artes de Boston', 'Museu de Belas Artes de Boston', 'Musée des Beaux-Arts de Boston', '波士顿美术馆', 'Museum of Fine Arts, Boston', 'ボストン美術館'],
    'popolo': ['로마 산타 마리아 델 포폴로 성당', 'Santa Maria del Popolo, Rome', 'Santa Maria del Popolo, Roma', 'Santa Maria del Popolo, Roma', 'Santa Maria del Popolo, Rome', '罗马人民圣母圣殿', 'Santa Maria del Popolo, Roma', 'ローマ、サンタ・マリア・デル・ポポロ教会'],
    'concezione': ['로마 산타 마리아 델라 콘체치오네 성당', 'Santa Maria della Concezione, Rome', 'Santa Maria della Concezione, Roma', 'Santa Maria della Concezione, Roma', 'Santa Maria della Concezione, Rome', '罗马圣母无染原罪堂', 'Santa Maria della Concezione, Roma', 'ローマ、サンタ・マリア・デッラ・コンチェツィオーネ教会'],
    'kbr': ['벨기에 왕립 도서관', 'Royal Library of Belgium', 'Biblioteca Real de Bélgica', 'Biblioteca Real da Bélgica', 'Bibliothèque royale de Belgique', '比利时皇家图书馆', 'Perpustakaan Kerajaan Belgia', 'ベルギー王立図書館'],
    'rijks': ['암스테르담 국립 미술관', 'Rijksmuseum, Amsterdam', 'Rijksmuseum, Ámsterdam', 'Rijksmuseum, Amsterdã', 'Rijksmuseum, Amsterdam', '阿姆斯特丹国立博物馆', 'Rijksmuseum, Amsterdam', 'アムステルダム国立美術館'],
    'va': ['런던 빅토리아 앨버트 박물관', 'Victoria and Albert Museum, London', 'Museo Victoria y Alberto, Londres', 'Museu Victoria and Albert, Londres', 'Victoria and Albert Museum, Londres', '伦敦维多利亚与艾伯特博物馆', 'Museum Victoria and Albert, London', 'ヴィクトリア&アルバート博物館'],
    'ngv': ['빅토리아 국립 미술관', 'National Gallery of Victoria, Melbourne', 'Galería Nacional de Victoria, Melbourne', 'Galeria Nacional de Victoria, Melbourne', 'National Gallery of Victoria, Melbourne', '维多利亚国立美术馆', 'Galeri Nasional Victoria, Melbourne', 'ヴィクトリア国立美術館'],
    'hermitage': ['상트페테르부르크 에르미타주 미술관', 'Hermitage Museum, Saint Petersburg', 'Museo del Hermitage, San Petersburgo', 'Museu Hermitage, São Petersburgo', "Musée de l'Ermitage, Saint-Pétersbourg", '圣彼得堡埃尔米塔日博物馆', 'Museum Hermitage, Sankt Peterburg', 'エルミタージュ美術館'],
    'boijmans': ['로테르담 보이만스 판 뵈닝언 미술관', 'Museum Boijmans Van Beuningen, Rotterdam', 'Museo Boijmans Van Beuningen, Róterdam', 'Museu Boijmans Van Beuningen, Roterdã', 'Musée Boijmans Van Beuningen, Rotterdam', '鹿特丹博伊曼斯·范·伯宁根博物馆', 'Museum Boijmans Van Beuningen, Rotterdam', 'ボイマンス・ファン・ベーニンゲン美術館'],
    'mfah': ['휴스턴 미술관', 'Museum of Fine Arts, Houston', 'Museo de Bellas Artes de Houston', 'Museu de Belas Artes de Houston', 'Musée des Beaux-Arts de Houston', '休斯敦美术馆', 'Museum of Fine Arts, Houston', 'ヒューストン美術館'],
    'ng': ['런던 내셔널 갤러리', 'National Gallery, London', 'National Gallery de Londres', 'National Gallery de Londres', 'National Gallery de Londres', '伦敦国家美术馆', 'National Gallery, London', 'ロンドン・ナショナル・ギャラリー'],
    'nuremberg': ['뉘른베르크 게르만 국립 박물관', 'Germanisches Nationalmuseum, Nuremberg', 'Museo Nacional Germano, Núremberg', 'Museu Nacional Germânico, Nuremberg', 'Musée national germanique, Nuremberg', '纽伦堡日耳曼国家博物馆', 'Museum Nasional Jerman, Nürnberg', 'ゲルマン国立博物館'],
    'getty': ['로스앤젤레스 게티 미술관', 'J. Paul Getty Museum, Los Angeles', 'Museo J. Paul Getty, Los Ángeles', 'Museu J. Paul Getty, Los Angeles', 'J. Paul Getty Museum, Los Angeles', '洛杉矶盖蒂博物馆', 'Museum J. Paul Getty, Los Angeles', 'J・ポール・ゲティ美術館'],
    'stuttgart': ['슈투트가르트 국립 미술관', 'Staatsgalerie Stuttgart', 'Staatsgalerie de Stuttgart', 'Staatsgalerie de Stuttgart', 'Staatsgalerie de Stuttgart', '斯图加特国立美术馆', 'Staatsgalerie Stuttgart', 'シュトゥットガルト州立美術館'],
    # 판화 성경·책 — 소장처 대신 실린 책
    'story': ['《The Story of the Bible from Genesis to Revelation》', 'The Story of the Bible from Genesis to Revelation', 'The Story of the Bible from Genesis to Revelation', 'The Story of the Bible from Genesis to Revelation', 'The Story of the Bible from Genesis to Revelation', '《The Story of the Bible from Genesis to Revelation》', 'The Story of the Bible from Genesis to Revelation', '『The Story of the Bible from Genesis to Revelation』'],
}
PD = ['퍼블릭 도메인', 'Public domain', 'Dominio público', 'Domínio público', 'Domaine public', '公有领域', 'Domain publik', 'パブリックドメイン']
# id: (화가, 제목, 연도, 어림 여부, 소장처, Commons 파일 이름) — 연도·소장처가 None이면 빼고 적는다
# 암스테르담 국립 미술관 판화(라위컨·잔트라르트 판화 성경 등)는 Commons에 CC0으로 올라와 있다
# 장면에 꼭 맞는 그림이 없는 곳(가장 가까운 그림으로 대신): a06(안디옥 — 성전 앞에서 함께 가르치는 바울과 바나바), a07(따로 세움 — 첫 전도 여행에서 말씀을 전하는 바울),
# a11(돌아가 굳게 함 — 회당에서 가르치는 바울), a12(예루살렘 회의 — 교회 앞에서 편지를 읽음, 행 15:30–31), a13(갈라섬 — 렘브란트의 '다투는 두 노인', 흔히 베드로와 바울),
# a21(고린도 — 편지를 쓰는 바울, 데살로니가전후서), a24(에베소 소동 — 에베소 극장 터 풍경), a25(눈물의 편지 — 책상 앞의 바울), a41(그레데의 디도 — 감독에게 편지를 건네는 바울, 13세기 성경 사본의 머리글자)
ART = {
 'a01': ('west', 'Devout Men Taking the Body of Saint Stephen', '1776', 0, 'mfa', 'Benjamin West - Devout Men Taking the Body of Saint Stephen - 2015.2163 - Museum of Fine Arts.jpg'),
 'a02': ('caravaggio', 'The Conversion on the Way to Damascus', '1600–1601', 1, 'popolo', 'Conversion on the Way to Damascus-Caravaggio (c.1600-1).jpg'),
 'a03': ('cortona', 'Ananias Restoring the Sight of Saint Paul', '1631', 1, 'concezione', 'Saint Paul Ananias Sight Restored.jpg'),
 'a04': ('heemskerck', 'Saint Paul Escaping from Damascus by Night', '1575', 0, 'kbr', 'St Paul Escaping from Damascus by Night 1575 print by Maarten van Heemskerck, S.I 55768, Prints Department, Royal Library of Belgium.jpg'),
 'a05': ('bos', 'Barnabas Brings Paul to the Apostles', '1546', 0, 'rijks', 'Barnabas brengt Paulus naar de apostelen Het leven van Paulus (serietitel), RP-P-1877-A-330.jpg'),
 'a06': ('dubourg', 'Paul and Barnabas Preaching before the Temple', '1713–1775', 1, 'rijks', 'Paulus en Barnabas predikend voor de tempel, RP-P-1878-A-880.jpg'),
 'a07': ('grebber', 'Paul Preaching on His First Missionary Journey', '1610–1652', 1, 'rijks', 'Paulus verkondight het woord op zijn eerste apostolische reis, RP-T-1981-101.jpg'),
 'a08': ('raphael', 'The Conversion of the Proconsul', '1515', 0, 'va', 'V&A - Raphael, The Conversion of the Proconsul (1515).jpg'),
 'a09': ('sandrart', 'Paul Preaches the Gospel in Antioch', '1697', 0, 'rijks', 'Apostel Paulus predikt in Antiochië het evangelie, RP-P-OB-53.940.jpg'),
 'a10': ('raphael', 'The Sacrifice at Lystra', '1515', 0, 'va', 'V&A - Raphael, The Sacrifice at Lystra (1515).jpg'),
 'a11': ('bos', 'Paul Preaching in the Synagogue', '1546', 0, 'rijks', 'Paulus preekt in de synagoge Het leven van Paulus (serietitel), RP-P-1877-A-329.jpg'),
 'a12': ('jluyken', 'A Letter Read Aloud to a Great Gathering of Christians', '1712', 0, 'rijks', 'Voorlezing van een zendbrief voor een grote menigte Christenen, RP-P-OB-46.094.jpg'),
 'a13': ('rembrandt', 'Two Old Men Disputing (Peter and Paul)', '1628', 0, 'ngv', 'Rembrandt Two old men disputing 1628.jpg'),
 'a14': ('drost', 'Timothy and His Grandmother Lois', '1650s', 0, 'hermitage', 'Timothy-and-Lois.jpg'),
 'a15': ('sandrart', "Paul's Vision of a Man of Macedonia", '1697', 0, 'rijks', 'Apostel Paulus heeft een visioen van een Macedonische man, RP-P-OB-53.902.jpg'),
 'a16': ('ellenrieder', 'The Baptism of Lydia', '1861', 0, None, '1861 Ellenrieder Die Taufe der Lydia anagoria.JPG'),
 'a17': ('howson', 'The Conversion of the Jailer at Philippi', '1909', 0, None, 'Scenes from the life of St. Paul and their religious lessons (1909) (14595202559).jpg'),
 'a18': ('dore', 'Saint Paul Preaching to the Thessalonians', '1866', 0, None, 'DoreStPaulPreachingtotheThessalonians.jpg'),
 'a19': ('raphael', 'Saint Paul Preaching in Athens', '1515', 0, 'va', 'V&A - Raphael, St Paul Preaching in Athens (1515).jpg'),
 'a20': ('sadeler', 'Saint Paul with the Tentmakers Aquila and Priscilla in Corinth', '1588–1589', 1, 'boijmans', 'Aquila en zijn vrouw Priscillia, St.Paulus te Corinthe bij de tentmaker.jpg'),
 'a21': ('valentin', 'Saint Paul Writing His Epistles', '1618–1620', 1, 'mfah', 'File"-Saint Paul Writing His Epistles" by Valentin de Boulogne.jpg'),
 'a22': ('sandrart', "The Sick Healed by Paul's Handkerchiefs", '1697', 0, 'rijks', 'Zieken worden genezen door de zweetdoeken van apostel Paulus, RP-P-OB-53.948.jpg'),
 'a23': ('lesueur', 'Saint Paul Preaching at Ephesus', '1649', 0, 'ng', 'Eustache Le Sueur (1616-1655) - Saint Paul preaching at Ephesus - NG6299 - National Gallery.jpg'),
 'a24': ('anon', 'View of the Theatre at Ephesus', '1873', 0, 'story', 'View of the theatre at Ephesus.jpg'),
 'a25': ('rembrandt', 'Saint Paul at His Writing Desk', '1629–1630', 1, 'nuremberg', 'Saint Paul at his Writing-Desk, by Rembrandt.jpg'),
 'a26': ('sandrart', 'Paul Writes His Letter to the Romans', '1697', 0, 'rijks', 'Apostel Paulus schrijft zijn brief aan de Romeinen, RP-P-OB-53.891.jpg'),
 'a27': ('figures', 'Paul Raises Eutychus to Life', '1728', 0, None, 'Paul raiseth Eutychus to life.jpg'),
 'a28': ('jluyken', 'Paul Takes Leave of the Elders', '1712', 0, 'rijks', 'Paulus neemt afscheid van de ouderlingen, RP-P-OB-46.090.jpg'),
 'a29': ('jluyken', "Paul Watches Agabus Bind Himself with Paul's Belt", '1700', 0, 'rijks', 'Paulus ziet hoe Agabus zichzelf vastbindt aan zijn gordel, RP-P-OB-44.982.jpg'),
 'a30': ('jluyken', 'Paul Seized by Roman Soldiers in Jerusalem', '1708', 0, 'rijks', 'Paulus wordt door Romeinse soldaten gevangen genomen Paulus binnen Jerusalem gevangen (titel op object), RP-P-OB-67.919.jpg'),
 'a31': ('dore', 'Paul Addresses the Crowd after His Arrest', '1866', 0, None, 'Paul Addresses the Crowd After His Arrest by Gustave Doré.jpg'),
 'a32': ('sandrart', "Paul's Nephew Warns of the Plot to Kill Him", '1697', 0, 'rijks', 'Apostel Paulus krijgt bericht van de zoon van zijn zus dat de Joden hem willen vermoorden, RP-P-OB-53.951.jpg'),
 'a33': ('sandrart', 'Paul before Felix and Drusilla', '1697', 0, 'rijks', 'Apostel Paulus voor Felix en Drusilla, RP-P-OB-53.953.jpg'),
 'a34': ('bodarevsky', 'Paul before Agrippa', '1875', 0, None, 'Nikolai Bodarevsky 001.jpg'),
 'a35': ('sandrart', 'Paul in the Storm at Sea', '1697', 0, 'rijks', 'Apostel Paulus adviseert om niet uit te varen, RP-P-OB-53.960.jpg'),
 'a36': ('anon', 'Paul Forbids the Sailors to Leave the Ship', '1873', 0, 'story', 'Paul forbids the sailors to leave the ships.jpg'),
 'a37': ('lahyre', 'Saint Paul Shipwrecked on Malta', '1630', 0, None, "Laurent de La Hyre's Saint Paul Shipwrecked on Malta.jpg"),
 'a38': ('anon', 'Paul Reaches Rome in Chains', '1873', 0, 'story', 'Paul reaches Rome in chains.jpg'),
 'a39': ('biblecard', 'Saint Paul in Rome', '1900s', 0, None, 'Paul in Rome.jpg'),
 'a40': ('dore', 'Saint Paul in Prison Hands His Letter to Tychicus', None, 0, None, 'St Paul in prison.jpg'),
 'a41': ('anon', 'Initial P: Saint Paul Giving a Letter to a Bishop', '1280–1290', 1, 'getty', 'Initial P- Saint Paul Giving a Letter to a Bishop - Google Art Project.jpg'),
 'a42': ('rembrandt', 'Saint Paul in Prison', '1627', 0, 'stuttgart', 'Rembrandt St. Paul in Prison.jpg'),
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

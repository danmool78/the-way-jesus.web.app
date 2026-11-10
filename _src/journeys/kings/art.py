"""열왕기 여정 명화의 출처 글: images.json(한국어 credit)과 번역본 i18n/<언어>.json의 events.<id>.credit을 한꺼번에 쓴다.
그림 파일은 assets/img/kXX.webp (Wikimedia Commons의 퍼블릭 도메인·CC0 그림을 1000px 안으로 줄여 webp로). 다윗 여정의 art.py와 같은 틀.
번역본 파일이 아직 없는 언어는 건너뛴다 (번역을 만든 뒤 다시 돌리면 credit이 채워진다).
Run: python3 _src/journeys/kings/art.py"""
import json, os
here = os.path.dirname(os.path.abspath(__file__))
L = ['ko', 'en', 'es', 'pt', 'fr', 'zh', 'id', 'ja']
ARTIST = {  # 언어별 화가 이름: [ko, en(es·pt·fr·id도), zh, ja] — 언어마다 다르면 L 순서로 8개
    'tissot': ['제임스 티소', 'James Tissot', '詹姆斯·蒂索', 'ジェームズ・ティソ'],
    'roberts': ['데이비드 로버츠', 'David Roberts', '大卫·罗伯茨', 'デイヴィッド・ロバーツ'],
    'dore': ['귀스타브 도레', 'Gustave Doré', '古斯塔夫·多雷', 'ギュスターヴ・ドレ'],
    'schnorr': ['율리우스 슈노어 폰 카롤스펠트', 'Julius Schnorr von Carolsfeld', '尤利乌斯·施诺尔·冯·卡罗尔斯费尔德', 'ユリウス・シュノル・フォン・カロルスフェルト'],
    'hardy': ['폴 하디', 'Paul Hardy', '保罗·哈迪', 'ポール・ハーディ'],
    'poynter': ['에드워드 포인터', 'Edward Poynter', '爱德华·波因特', 'エドワード・ポインター'],
    'vinkeles': ['레이니르 핑컬레스', 'Reinier Vinkeles', '赖尼尔·芬克莱斯', 'ライニール・フィンケレス'],
    'jluyken': ['얀 라위컨', 'Jan Luyken', '扬·吕肯', 'ヤン・ライケン'],
    'cluyken': ['카스파르 라위컨', 'Caspar Luyken', '卡斯帕·吕肯', 'カスパル・ライケン'],
    'koning': ['테오도르 코닝', 'Theodoor Koning', '特奥多尔·科宁', 'テオドール・コーニング'],
    'sichem': ['크리스토펄 판 시헴', 'Christoffel van Sichem', '克里斯托费尔·范·西赫姆', 'クリストッフェル・ファン・シッヘム'],
    'savoldo': ['조반니 지롤라모 사볼도', 'Giovanni Girolamo Savoldo', '乔瓦尼·吉罗拉莫·萨沃尔多', 'ジョヴァンニ・ジローラモ・サヴォルド'],
    'strozzi': ['베르나르도 스트로치', 'Bernardo Strozzi', '贝尔纳多·斯特罗齐', 'ベルナルド・ストロッツィ'],
    'matsys': ['얀 마시스', 'Jan Matsys', '扬·马西斯', 'ヤン・マセイス'],
    'dicksee': ['프랭크 딕시', 'Frank Dicksee', '弗兰克·迪克西', 'フランク・ディクシー'],
    'angeli': ['주세페 안젤리', 'Giuseppe Angeli', '朱塞佩·安杰利', 'ジュゼッペ・アンジェリ'],
    'eeckhout': ['헤르브란트 판 덴 에이크하우트', 'Gerbrand van den Eeckhout', '赫布兰德·范·登·埃克豪特', 'ヘルブラント・ファン・デン・エークハウト'],
    'ljacobsz': ['람베르트 야코프스', 'Lambert Jacobsz', '兰伯特·雅各布斯', 'ランベルト・ヤーコプス'],
    'providence': ['프로비던스 석판 인쇄소', 'Providence Lithograph Company', '普罗维登斯石印公司', 'プロビデンス・リトグラフ社'],
    'flandrin': ['이폴리트 플랑드랭', 'Hippolyte Flandrin', '伊波利特·弗朗德兰', 'イポリット・フランドラン'],
    'bendemann': ['에두아르트 벤데만', 'Eduard Bendemann', '爱德华·本德曼', 'エドゥアルト・ベンデマン'],
    'mieris': ['프란스 판 미리스(아버지)', 'Frans van Mieris the Elder', 'Frans van Mieris el Viejo', 'Frans van Mieris, o Velho', "Frans van Mieris l'Ancien", '老弗兰斯·范·米里斯', 'Frans van Mieris Tua', 'フランス・ファン・ミーリス（父）'],
    'galle': ['필립스 갈레 공방', 'Workshop of Philips Galle', 'Taller de Philips Galle', 'Oficina de Philips Galle', 'Atelier de Philips Galle', '菲利普斯·加勒工作室', 'Bengkel Philips Galle', 'フィリップス・ハレ工房'],
    'anon': ['작자 미상', 'Unknown artist', 'Autor desconocido', 'Autor desconhecido', 'Artiste inconnu', '佚名', 'Seniman tak dikenal', '作者不詳'],
}
MUSEUM = {  # ko, en, es, pt, fr, zh, id, ja
    'jm': ['뉴욕 유대 박물관', 'The Jewish Museum, New York', 'Museo Judío de Nueva York', 'Museu Judaico de Nova York', 'Jewish Museum de New York', '纽约犹太博物馆', 'Museum Yahudi New York', 'ニューヨーク・ユダヤ博物館'],
    'rijks': ['암스테르담 국립 미술관', 'Rijksmuseum, Amsterdam', 'Rijksmuseum, Ámsterdam', 'Rijksmuseum, Amsterdã', 'Rijksmuseum, Amsterdam', '阿姆斯特丹国立博物馆', 'Rijksmuseum, Amsterdam', 'アムステルダム国立美術館'],
    'agnsw': ['뉴사우스웨일스 미술관', 'Art Gallery of New South Wales', 'Galería de Arte de Nueva Gales del Sur', 'Galeria de Arte de Nova Gales do Sul', 'Art Gallery of New South Wales', '新南威尔士美术馆', 'Galeri Seni New South Wales', 'ニューサウスウェールズ州立美術館'],
    'lille': ['릴 미술관', 'Palais des Beaux-Arts de Lille', 'Palacio de Bellas Artes de Lille', 'Palácio de Belas-Artes de Lille', 'Palais des Beaux-Arts de Lille', '里尔美术宫', 'Palais des Beaux-Arts Lille', 'リール宮殿美術館'],
    'nga': ['워싱턴 국립 미술관', 'National Gallery of Art, Washington', 'Galería Nacional de Arte, Washington', 'Galeria Nacional de Arte, Washington', 'National Gallery of Art de Washington', '华盛顿国家美术馆', 'Galeri Seni Nasional, Washington', 'ワシントン・ナショナル・ギャラリー'],
    'warsaw': ['바르샤바 국립 미술관', 'National Museum in Warsaw', 'Museo Nacional de Varsovia', 'Museu Nacional de Varsóvia', 'Musée national de Varsovie', '华沙国家博物馆', 'Museum Nasional Warsawa', 'ワルシャワ国立美術館'],
    'leiden': ['라이덴 컬렉션', 'The Leiden Collection, New York', 'The Leiden Collection, Nueva York', 'The Leiden Collection, Nova York', 'The Leiden Collection, New York', '莱顿收藏', 'The Leiden Collection, New York', 'ライデン・コレクション'],
    'met': ['메트로폴리탄 미술관', 'The Metropolitan Museum of Art', 'Museo Metropolitano de Arte', 'Museu Metropolitano de Arte', 'Metropolitan Museum of Art', '大都会艺术博物馆', 'Museum Seni Metropolitan', 'メトロポリタン美術館'],
    'loc': ['미국 의회도서관', 'Library of Congress', 'Biblioteca del Congreso', 'Biblioteca do Congresso', 'Bibliothèque du Congrès', '美国国会图书馆', 'Perpustakaan Kongres AS', 'アメリカ議会図書館'],
    'wallraf': ['쾰른 발라프 리하르츠 미술관', 'Wallraf-Richartz-Museum, Cologne', 'Museo Wallraf-Richartz, Colonia', 'Museu Wallraf-Richartz, Colônia', 'Musée Wallraf-Richartz, Cologne', '科隆瓦尔拉夫-里夏茨博物馆', 'Museum Wallraf-Richartz, Köln', 'ヴァルラフ・リヒャルツ美術館'],
    # 판화 성경 — 소장처 대신 실린 책
    'dorebible': ['도레 성경 판화', "Doré's English Bible", 'Biblia ilustrada por Doré', 'Bíblia ilustrada por Doré', 'Bible illustrée par Doré', '多雷插图圣经', 'Alkitab bergambar Doré', 'ドレの挿絵聖書'],
    'bibelbild': ['《그림 성경》(Die Bibel in Bildern)', 'Die Bibel in Bildern', 'Die Bibel in Bildern', 'Die Bibel in Bildern', 'Die Bibel in Bildern', '《图画圣经》', 'Die Bibel in Bildern', '『絵で見る聖書』'],
    'story': ['《The Story of the Bible from Genesis to Revelation》', 'The Story of the Bible from Genesis to Revelation', 'The Story of the Bible from Genesis to Revelation', 'The Story of the Bible from Genesis to Revelation', 'The Story of the Bible from Genesis to Revelation', '《The Story of the Bible from Genesis to Revelation》', 'The Story of the Bible from Genesis to Revelation', '『The Story of the Bible from Genesis to Revelation』'],
}
PD = ['퍼블릭 도메인', 'Public domain', 'Dominio público', 'Domínio público', 'Domaine public', '公有领域', 'Domain publik', 'パブリックドメイン']
# id: (화가, 제목, 연도, 어림 여부, 소장처, Commons 파일 이름) — 연도·소장처가 None이면 빼고 적는다
# 암스테르담 국립 미술관 판화(라위컨 부자의 1708·1712년 성경 판화 등)는 Commons에 CC0으로 올라와 있다
# 장면에 꼭 맞는 그림이 없는 곳: k31(사마리아 함락)·k39(므깃도)는 데이비드 로버츠의 그 땅 풍경, k37(바벨론 사신)은 히스기야 초상
T = '1896–1902'  # 티소의 성경 그림
ART = {
 'k01': ('vinkeles', 'God Appears to Solomon', '1767', 0, 'rijks', 'God verschijnt aan Salomo, RP-P-OB-64.635.jpg'),
 'k02': ('dore', 'The Judgment of Solomon', '1866', 0, 'dorebible', '084.The Judgment of Solomon.jpg'),
 'k03': ('tissot', 'Solomon Dedicates the Temple at Jerusalem', T, 1, 'jm', 'Tissot Solomon Dedicates the Temple at Jerusalem.jpg'),
 'k04': ('poynter', 'The Visit of the Queen of Sheba to King Solomon', '1890', 0, 'agnsw', 'Sir Edward John Poynter - The visit of the Queen of Sheba to King Solomon - Google Art ProjectFXD.jpg'),
 'k05': ('cluyken', 'The Idolatry of Solomon', '1712', 0, 'rijks', 'Afgoderij van Salomo, RP-P-OB-45.880.jpg'),
 'k06': ('cluyken', 'Ahijah Tears His Garment into Twelve Pieces', '1712', 0, 'rijks', 'Achia verdeelt zijn jas in twaalf stukken en overhandigt er tien aan Jerobeam, RP-P-OB-45.881.jpg'),
 'k07': ('hardy', 'King Rehoboam Consulted with the Old Men', None, 0, None, 'King Rehoboam consulted with the old men.jpg'),
 'k08': ('koning', "Jeroboam's Idolatry", '1780', 0, 'rijks', 'Afgoderij van Jerobeam Jeroboams afgoderij (titel op object), RP-P-1934-436.jpg'),
 'k09': ('cluyken', 'The Man of God from Judah Prophesies against the Altar', '1712', 0, 'rijks', 'De godsman uit Juda profeteert tegen het altaar waarop Jerobeam de kalverdienst uitoefent, RP-P-OB-45.882.jpg'),
 'k10': ('mieris', "Jeroboam's Wife Visits the Prophet Ahijah", '1671', 0, 'lille', 'Lille PdBA mieris femme de jeroboam.jpg'),
 'k11': ('sichem', 'Shishak of Egypt Plunders the Temple Treasures', '1645–1646', 0, 'rijks', 'Sisak van Egypte rooft schatten uit de tempel, RP-P-2015-17-119-6.jpg'),
 'k12': ('galle', 'Elijah Foretells the Drought to King Ahab', '1579', 0, 'rijks', 'Elia voorspelt koning Achab dat er droogte zal komen Geschiedenis van Elia (serietitel), RP-P-1904-3306.jpg'),
 'k13': ('savoldo', 'Elijah Fed by the Raven', '1510', 1, 'nga', 'Elijah Fed by the Raven sc1073.jpg'),
 'k14': ('strozzi', 'The Prophet Elijah and the Widow of Zarephath', '1630–1639', 1, None, 'Bernardo Strozzi - Prophet Elijah and the Widow of Sarepta - WGA21919.jpg'),
 'k15': ('cluyken', "Elijah's Sacrifice Consumed by Fire", '1712', 0, 'rijks', 'Offer van Elia door vuur verteerd, RP-P-OB-45.889.jpg'),
 'k16': ('cluyken', "Elijah's Servant Sees a Small Cloud", '1712', 0, 'rijks', 'De knecht van Elia ziet een kleine regenwolk, RP-P-OB-45.890.jpg'),
 'k17': ('dore', 'Elijah Is Nourished by an Angel', '1866', 0, 'dorebible', '091.Elijah Is Nourished by an Angel.jpg'),
 'k18': ('jluyken', 'Elijah in the Cave', '1704', 0, 'rijks', 'Elia in de grot, RP-P-OB-45.152.jpg'),
 'k19': ('matsys', 'The Calling of Elisha', '1572', 0, None, 'Jan Massijs - The Calling of Elisha.jpg'),
 'k20': ('dicksee', "Jezebel and Ahab Meeting Elijah in Naboth's Vineyard", None, 0, None, 'Jezabel-and-Ahab-Meeting-Elijah-in-Naboth-s-Vineyard.jpg'),
 'k21': ('cluyken', 'The Prophet Micaiah before Jehoshaphat and Ahab', '1712', 0, 'rijks', 'Profeet Micha voor Josafat en Achab, RP-P-OB-45.893.jpg'),
 'k22': ('angeli', 'Elijah Taken Up in a Chariot of Fire', '1740–1755', 1, 'nga', 'Elijah Taken Up in a Chariot of Fire E11219.jpg'),
 'k23': ('eeckhout', 'Elisha and the Shunammite Woman on Mount Carmel', '1649', 0, 'warsaw', 'Gerbrand van den Eeckhout - Prophet Elisha and the Shunammite woman on Mt. Carmel - M.Ob.551 MNW - National Museum in Warsaw.jpg'),
 'k24': ('ljacobsz', "Elisha Refusing Naaman's Gifts", '1628–1633', 1, 'leiden', 'Lambert Jacobsz - Elisha Refusing Naaman’s Gifts - LJ-100 - Leiden Collection.jpg'),
 'k25': ('anon', 'Elisha Makes the Axe Swim', '1873', 0, 'story', 'Elisha makes the axe swim.jpg'),
 'k26': ('providence', 'Elisha at Dothan', '1898', 0, None, 'Elisha at Dothan.jpg'),
 'k27': ('jluyken', 'The People of Samaria Plunder the Abandoned Syrian Camp', '1708', 0, 'rijks', 'Verloste bewoners van Samaria vinden overvloedig levensmiddelen in het door Syriërs verlaten kamp, RP-P-OB-45.365.jpg'),
 'k28': ('cluyken', "Jehu's Arrow Strikes Joram in His Chariot", '1712', 0, 'rijks', 'Joram op zijn wagen wordt door Jehu doorschoten, RP-P-OB-45.903.jpg'),
 'k29': ('anon', 'The Crowning of Joash', '1873', 0, 'story', 'The crowning of Joash.jpg'),
 'k30': ('anon', 'The Death of Elisha', '1873', 0, 'story', 'The death of Elisha.jpg'),
 'k31': ('roberts', 'Sebaste, Ancient Samaria', '1842', 0, 'loc', 'Sebasté, ancient Samaria, April 17th, 1839 - David Roberts, R.A. LCCN92509006.jpg'),
 'k32': ('jluyken', 'King Hezekiah Destroys the Idols', '1708', 0, 'rijks', 'Koning Hizkia laat afgodsbeelden vernielen, RP-P-OB-45.368.jpg'),
 'k33': ('anon', 'Assyrians Crying to the Men on the Wall', '1873', 0, 'story', 'Assyrians crying to the men on the wall.jpg'),
 'k34': ('anon', 'Hezekiah Spreads the Letter before the Lord', '1873', 0, 'story', 'King Hezekiah, clouthed in sackcloth, spreads open the letter before the Lord.jpg'),
 'k35': ('sichem', 'The Angel Strikes the Army of Sennacherib', '1645–1646', 0, 'rijks', 'Engel doodt de troepen van Sanherib, RP-P-2015-17-120-2.jpg'),
 'k36': ('jluyken', "The Shadow on Hezekiah's Sundial Turns Back", '1708', 0, 'rijks', 'Schaduw op zonnewijzer teruggezet voor Hizkia, RP-P-OB-45.371.jpg'),
 'k37': ('flandrin', 'Hezekiah, King of Judah', None, 0, 'met', 'Hezekiah, King of Judah MET 1985.246.1.jpg'),
 'k38': ('schnorr', 'Josiah Hears the Book of the Law', '1851–1860', 1, 'bibelbild', 'Schnorr von Carolsfeld Bibel in Bildern 1860 123.png'),
 'k39': ('roberts', 'Mount Tabor from the Plain of Esdraelon', '1842', 0, 'loc', 'Mount Tabor from the Plain of Esdraelon April 19th 1839 LCCN2002717475.jpg'),
 'k40': ('tissot', 'The Flight of the Prisoners', T, 1, 'jm', 'Tissot The Flight of the Prisoners.jpg'),
 'k41': ('bendemann', 'The Mourning Jews in Exile', '1832', 0, 'wallraf', 'Jews Mourning in Exile - Eduard Bendemann - Wallraf-Richartz-Museum & Fondation Corboud-6071 (without frame).jpg'),
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

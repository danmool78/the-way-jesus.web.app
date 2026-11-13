"""검색엔진(SEO)·AI 답변엔진(AEO)용 머리 정보: build.py 끝에서 부른다 (pages.py 다음).
- qna(.언어).html: 대표 주소·언어 짝(hreflang)·og와 FAQPage 구조화 데이터(물음과 답을 그대로) — AI 답변이 '묻고 답하기'를 바로 인용하게
- why(.언어).html: 대표 주소·언어 짝·og와 Article 구조화 데이터
- index.html(랜딩): WebSite·Organization·여정 목록(ItemList) 구조화 데이터, 꼬리말에 여정별 장면 목록 링크(글로 된 링크라야 검색엔진이 따라 들어간다)
- llms.txt: AI가 이 사이트를 한눈에 읽는 안내
손으로 쓰는 페이지에는 <!--seo--> … <!--/seo-->(랜딩 꼬리말은 seo-lists) 사이만 다시 쓴다 (그 밖은 건드리지 않는다)
Run: python3 _src/seo.py"""
import json, os, re, html
here = os.path.dirname(os.path.abspath(__file__)); root = os.path.join(here, '..')
SITE = 'https://thewaymap.org'
land = json.load(open(os.path.join(root, 'land.json'), encoding='utf-8'))
LANGS = land['langs']
fname = lambda base, l: '%s.html' % base if l == 'ko' else '%s.%s.html' % (base, l)
text = lambda s: re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', s))).strip()
ORG = {'@type': 'Organization', 'name': 'SSSOFT', 'url': 'https://sssoft-idea.web.app/'}

def put(path, block, where='</head>', tag='seo'):  # tag: 한 페이지에 넣는 곳이 둘이면 표시 이름을 달리한다
    s = open(path, encoding='utf-8').read()
    block = '<!--%s-->\n' % tag + block + '\n<!--/%s-->' % tag
    if '<!--%s-->' % tag in s: s = re.sub(r'<!--%s-->.*?<!--/%s-->' % (tag, tag), lambda m: block, s, count=1, flags=re.S)
    else: s = s.replace(where, block + '\n' + where, 1)
    open(path, 'w', encoding='utf-8').write(s)

def meta(s, name):
    m = re.search(r'<meta name="%s" content="([^"]*)"' % name, s); return html.unescape(m.group(1)) if m else ''

def head_block(base, l, title, desc, image, ld, typ='article'):
    alts = ''.join('<link rel="alternate" hreflang="%s" href="%s/%s">' % (x, SITE, fname(base, x)) for x in LANGS)
    alts += '<link rel="alternate" hreflang="x-default" href="%s/%s">' % (SITE, fname(base, 'ko'))
    url = '%s/%s' % (SITE, fname(base, l))
    e = lambda v: html.escape(v, quote=True)
    return (f'<link rel="canonical" href="{url}">{alts}\n'
            f'<meta property="og:type" content="{typ}"><meta property="og:url" content="{url}"><meta property="og:title" content="{e(title)}">'
            f'<meta property="og:description" content="{e(desc)}"><meta property="og:image" content="{SITE}/{image}"><meta name="twitter:card" content="summary_large_image">\n'
            f'<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>')

# 묻고 답하기의 '글로만 읽을 수 있나요?': 여정마다 장면 글 모음(s/, pages.py) 링크 — 그 언어 판이 있는 여정만
def reads(l):
    U2 = land['ui'].get(l, land['ui']['ko']); out = []
    for c in land['cards']:
        base = 's/index' if c['id'] == 'jesus' else 's/%s' % c['id']
        u = '%s.html' % base if l == 'ko' else '%s.%s.html' % (base, l)
        if os.path.exists(os.path.join(root, u)): out.append('<li><a href="%s">%s</a></li>' % (u, html.escape(U2.get(c['title'], c['title']))))
    return '<ul>%s</ul>' % ''.join(out)

for l in LANGS:
    put(os.path.join(root, fname('qna', l)), reads(l), tag='seo-reads')
    # 묻고 답하기: <details><summary>물음</summary><div class="a">답</div></details>
    p = os.path.join(root, fname('qna', l)); s = open(p, encoding='utf-8').read()
    title, desc = text(re.search(r'<title>(.*?)</title>', s, re.S).group(1)), meta(s, 'description')
    qa = [(text(q), text(a)) for q, a in re.findall(r'<summary>(.*?)</summary>\s*<div class="a">(.*?)</div>\s*</details>', s, re.S)]
    ld = {'@context': 'https://schema.org', '@type': 'FAQPage', 'inLanguage': l, 'name': title, 'url': '%s/%s' % (SITE, fname('qna', l)), 'publisher': ORG,
          'mainEntity': [{'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in qa]}
    put(p, head_block('qna', l, title, desc, 'assets/og-series.jpg', ld, 'website'))
    # 왜 기독교인가
    p = os.path.join(root, fname('why', l)); s = open(p, encoding='utf-8').read()
    title, desc = text(re.search(r'<title>(.*?)</title>', s, re.S).group(1)), meta(s, 'description')
    h1 = text(re.search(r'<h1[^>]*>(.*?)</h1>', s, re.S).group(1))
    ld = {'@context': 'https://schema.org', '@type': 'Article', 'headline': h1, 'description': desc, 'inLanguage': l, 'url': '%s/%s' % (SITE, fname('why', l)),
          'image': '%s/assets/img/why/mountain.webp' % SITE, 'author': ORG, 'publisher': ORG, 'isPartOf': {'@type': 'WebSite', 'name': 'The Way', 'url': SITE + '/'}}
    put(p, head_block('why', l, title, desc, 'assets/img/why/mountain.webp', ld))

# 랜딩: 사이트·만든 곳·여정 목록 + 꼬리말의 장면 목록 링크 (랜딩은 한국어로 먼저 그려지므로 한국어 이름으로)
U = land['ui']['ko']; cards = [c for c in land['cards']]
href = lambda c: c.get('href') or '/%s' % c['id']
ld = [{'@context': 'https://schema.org', '@type': 'WebSite', 'name': '그 길 — The Way', 'alternateName': ['그 길', 'The Way', 'thewaymap'], 'url': SITE + '/',
       'inLanguage': LANGS, 'description': U.get('hubTag', ''), 'publisher': ORG},
      {'@context': 'https://schema.org', '@type': 'ItemList', 'name': U.get('seriesHead', '그 길 시리즈'),
       'itemListElement': [{'@type': 'ListItem', 'position': i + 1, 'url': SITE + href(c), 'name': U.get(c['title'], c['title']), 'description': U.get(c['desc'], c['desc'])} for i, c in enumerate(cards)]}]
put(os.path.join(root, 'index.html'), '<script type="application/ld+json">%s</script>' % json.dumps(ld, ensure_ascii=False))
lists = [(c, 's/index.html' if c['id'] == 'jesus' else 's/%s.html' % c['id']) for c in cards]
nav = '<nav class="scene-lists" aria-label="장면 목록">장면 목록 — %s</nav>' % ' · '.join('<a href="%s">%s</a>' % (u, html.escape(U.get(c['title'], c['title']))) for c, u in lists if os.path.exists(os.path.join(root, u)))
put(os.path.join(root, 'index.html'), nav, '</footer>', 'seo-lists')

# llms.txt — https://llmstxt.org 형식
L = ['# 그 길 — The Way (thewaymap.org)', '',
     '> 성경의 이야기를 지도 위에서 걷는 무료 웹앱. 예수의 발자취(사복음서 61장면)에서 모세와 여호수아, 다윗, 열왕기, 바울(편지 13편과 함께), 시편, 잠언, GoodNews(복음)까지 여정마다 장면을 시간과 장소의 순서로 엮었다. 장면마다 이야기 낭독, 명화, 3D 무대, 말씀, 배경 지식, 묵상 질문, 퀴즈가 있다. 8개 언어(한국어·영어·스페인어·포르투갈어·프랑스어·중국어·인도네시아어·일본어). 광고·가입 없음. 말씀은 기존 번역을 베끼지 않고 원문의 뜻을 살려 새로 옮겼다.', '',
     'A free web app for walking the stories of the Bible on a map: the life of Jesus from the four Gospels, Moses and Joshua, David, Kings, Paul with his 13 letters, Psalms, Proverbs and GoodNews. Each scene has a narrated story, a painting, a 3D diorama, Scripture, background notes, a reflection question and a quiz. Available in 8 languages.', '',
     '## 여정 (Journeys)']
for c, u in lists:
    L.append('- [%s](%s%s): %s%s' % (U.get(c['title'], c['title']), SITE, href(c), U.get(c['desc'], c['desc']), ' — 장면 목록 %s/%s' % (SITE, u) if os.path.exists(os.path.join(root, u)) else ''))
L += ['', '## 안내 (About)', '- [묻고 답하기](%s/qna.html): 왜 만들었는지, 3D 무대 원칙, 기능 활용법 (English: %s/qna.en.html)' % (SITE, SITE),
      '- [왜 기독교인가](%s/why.html): 사람이 올라가는 종교와 내려오신 하나님, 그리고 교회 (English: %s/why.en.html)' % (SITE, SITE),
      '- [사이트맵](%s/sitemap.xml): 모든 장면 페이지(언어별)' % SITE, '']
open(os.path.join(root, 'llms.txt'), 'w', encoding='utf-8').write('\n'.join(L))
print('seo: qna·why ×', len(LANGS), 'languages, landing, llms.txt')

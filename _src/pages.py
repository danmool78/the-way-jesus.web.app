"""검색엔진용 장면 페이지: data*.json으로 ../s/<장면>.html(한국어)·../s/<장면>.<언어>.html과 장면 목록 ../s/index(.<언어>).html,
../sitemap.xml을 만든다. 앱은 #e05 같은 주소로 장면을 열어 검색엔진이 장면마다 따로 읽지 못하므로, 글을 미리 써 둔 정적 페이지를
두고 '지도 위에서 이 장면 걷기'로 앱에 잇는다. build.py 끝에서 부른다 (직접 고치지 말 것)
Run: python3 _src/pages.py"""
import json, os, html
here = os.path.dirname(os.path.abspath(__file__))
root = os.path.join(here, '..')
SITE = 'https://the-way-jesus.web.app'
out_dir = os.path.join(root, 's')
os.makedirs(out_dir, exist_ok=True)
esc = lambda s: html.escape(str(s), quote=True)
# 이 페이지에만 쓰는 글씨 (앱 화면 글씨 ui.<언어>.json에 없는 것)
PAGE = {
    'ko': {'walk': '지도 위에서 이 장면 걷기', 'all': '예수의 생애 {n}장면 모두 보기', 'listTitle': '예수의 생애 {n}장면 — 일어난 순서대로',
           'listLead': '마태·마가·누가·요한, 네 복음서의 이야기를 일어난 때와 장소의 순서로 엮었습니다. 장면을 누르면 이야기와 말씀을 읽을 수 있고, 지도 위에서 그 길을 따라 걸을 수 있습니다.',
           'open': '앱으로 여정 시작하기', 'pro': '프롤로그'},
    'en': {'walk': 'Walk this scene on the map', 'all': 'All {n} scenes of the life of Jesus', 'listTitle': 'The life of Jesus in {n} scenes — in order',
           'listLead': 'The accounts of Matthew, Mark, Luke and John, woven together in the order of when and where things happened. Open a scene to read the story and the words, and walk the road on the map.',
           'open': 'Start the journey in the app', 'pro': 'Prologue'},
    'es': {'walk': 'Recorre esta escena en el mapa', 'all': 'Las {n} escenas de la vida de Jesús', 'listTitle': 'La vida de Jesús en {n} escenas — en orden',
           'listLead': 'Los relatos de Mateo, Marcos, Lucas y Juan, entrelazados en el orden en que sucedieron. Abre una escena para leer la historia y las palabras, y recorre el camino en el mapa.',
           'open': 'Empezar el viaje en la app', 'pro': 'Prólogo'},
    'pt': {'walk': 'Percorra esta cena no mapa', 'all': 'As {n} cenas da vida de Jesus', 'listTitle': 'A vida de Jesus em {n} cenas — em ordem',
           'listLead': 'Os relatos de Mateus, Marcos, Lucas e João, entrelaçados na ordem em que aconteceram. Abra uma cena para ler a história e as palavras, e percorra o caminho no mapa.',
           'open': 'Começar a jornada no app', 'pro': 'Prólogo'},
    'fr': {'walk': 'Parcourir cette scène sur la carte', 'all': 'Les {n} scènes de la vie de Jésus', 'listTitle': 'La vie de Jésus en {n} scènes — dans l’ordre',
           'listLead': 'Les récits de Matthieu, Marc, Luc et Jean, tissés ensemble selon l’ordre des temps et des lieux. Ouvrez une scène pour lire le récit et les paroles, et parcourez le chemin sur la carte.',
           'open': 'Commencer le voyage dans l’appli', 'pro': 'Prologue'},
    'zh': {'walk': '在地图上走这一幕', 'all': '耶稣生平的全部 {n} 个场景', 'listTitle': '耶稣生平 {n} 个场景 — 按发生顺序',
           'listLead': '将马太、马可、路加、约翰四卷福音书的记载，按事情发生的时间与地点编织在一起。点开场景可阅读故事与话语，并在地图上沿路行走。',
           'open': '在应用中开始旅程', 'pro': '序幕'},
    'id': {'walk': 'Jelajahi adegan ini di peta', 'all': 'Semua {n} adegan kehidupan Yesus', 'listTitle': 'Kehidupan Yesus dalam {n} adegan — berurutan',
           'listLead': 'Kisah Matius, Markus, Lukas, dan Yohanes dirangkai menurut urutan waktu dan tempat terjadinya. Buka adegan untuk membaca kisah dan sabda, lalu jelajahi jalannya di peta.',
           'open': 'Mulai perjalanan di aplikasi', 'pro': 'Prolog'},
    'ja': {'walk': '地図の上でこの場面を歩く', 'all': 'イエスの生涯 全{n}場面', 'listTitle': 'イエスの生涯 {n}の場面 — 起きた順に',
           'listLead': 'マタイ・マルコ・ルカ・ヨハネ、四つの福音書の記事を、出来事の起きた時と場所の順に編みました。場面を開くと物語と言葉を読み、地図の上でその道を歩けます。',
           'open': 'アプリで旅を始める', 'pro': 'プロローグ'},
}
CSS = '''
:root{--bg:#15110d;--panel:#1d1813;--line:#3a3026;--ink:#f1e8d8;--muted:#b3a58f;--faint:#7f735f;--gold:#d9b46a;--gold2:#f0d79a;
--serif:'Gowun Batang','Nanum Myeongjo',Georgia,serif;--sans:'Noto Sans KR',system-ui,-apple-system,'Apple SD Gothic Neo',sans-serif;color-scheme:dark}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--sans);font-size:16px;line-height:1.85;-webkit-font-smoothing:antialiased}
:lang(ko) body{word-break:keep-all}a{color:var(--gold2)}main{max-width:720px;margin:0 auto;padding:20px 20px 60px}
.top{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--gold2);font-family:var(--serif);font-size:20px;letter-spacing:.12em;margin:4px 0 28px}
.top img{width:30px;height:30px}.eyebrow{font-size:12px;letter-spacing:.14em;color:var(--gold);font-weight:700}
h1{font-family:var(--serif);font-size:32px;line-height:1.35;margin:8px 0 4px;color:#f6ead0}.sub{font-family:var(--serif);color:var(--gold2);font-size:18px;margin:0 0 6px}
.meta{color:var(--muted);font-size:14px;margin:0 0 22px}figure{margin:0 0 26px}figure img{display:block;width:100%;height:auto;border-radius:12px}
figcaption{font-size:12px;color:var(--faint);margin-top:6px;line-height:1.5}h2{font-family:var(--serif);font-size:20px;color:var(--gold2);margin:34px 0 10px}
blockquote{margin:0 0 14px;padding:12px 16px;border-left:3px solid var(--gold);background:rgba(217,180,106,.07);border-radius:0 10px 10px 0}
blockquote p{font-family:var(--serif);font-size:17px;margin:0}blockquote footer{font-size:13px;color:var(--muted);margin-top:4px}
.fine{font-size:12.5px;color:var(--faint)}.box{padding:14px 18px;border:1px solid var(--line);border-radius:12px;background:rgba(255,255,255,.02)}
.go{display:block;text-align:center;margin:30px 0;padding:15px 18px;border-radius:14px;text-decoration:none;font-family:var(--serif);font-size:17px;color:#2a1d0c;background:linear-gradient(180deg,#e9c97f,#b88a3e)}
nav.pn{display:flex;justify-content:space-between;gap:12px;font-size:14px;margin-top:10px}nav.pn a{text-decoration:none;max-width:48%}
.list ol{padding-left:0;list-style:none}.list li{border-top:1px solid var(--line);padding:10px 2px}.list li a{text-decoration:none;font-family:var(--serif);font-size:17px}
.list li small{display:block;color:var(--muted);font-size:13px}.list h2{margin-top:30px}.langs{font-size:13px;color:var(--faint);margin-top:40px}
'''
FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet">'

def load(lang):
    return json.load(open(os.path.join(root, 'data.json' if lang == 'ko' else 'data.%s.json' % lang), encoding='utf-8'))

def fname(base, lang):  # 한국어는 꼬리 없이, 다른 언어는 .<언어> (qna.html과 같은 방식)
    return '%s.html' % base if lang == 'ko' else '%s.%s.html' % (base, lang)

def app_url(lang, eid=''):  # 앱으로: 한국어 말고는 ?lang=을 붙여 그 언어로 열리게
    return '/' + ('' if lang == 'ko' else '?lang=' + lang) + ('#' + eid if eid else '')

def head(lang, langs, base, title, desc, image, ld):
    alts = ''.join('<link rel="alternate" hreflang="%s" href="%s/s/%s">' % (l, SITE, fname(base, l)) for l in langs)
    alts += '<link rel="alternate" hreflang="x-default" href="%s/s/%s">' % (SITE, fname(base, 'ko'))
    url = '%s/s/%s' % (SITE, fname(base, lang))
    return f'''<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#16120e">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<link rel="canonical" href="{url}">{alts}
<link rel="icon" href="/assets/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta property="og:type" content="article"><meta property="og:url" content="{url}"><meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(desc)}"><meta property="og:image" content="{SITE}/{image}">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
{FONTS}
<style>{CSS}</style>
</head>
<body>
<main>
<a class="top" href="{app_url(lang)}"><img src="/assets/logo.svg" alt="" width="30" height="30">{esc(D['ui']['appName'])}</a>
'''

def langline(langs, base, lang):
    return '<p class="langs">' + ' · '.join('<a href="%s" hreflang="%s" lang="%s">%s</a>' % (fname(base, l), l, l, esc(LANG_NAMES[l])) for l in langs if l != lang) + '</p>'

LANG_NAMES = {'ko': '한국어', 'en': 'English', 'es': 'Español', 'pt': 'Português', 'fr': 'Français', 'zh': '中文', 'id': 'Bahasa Indonesia', 'ja': '日本語'}
ko = json.load(open(os.path.join(root, 'data.json'), encoding='utf-8'))
LANGS = ko['ui']['langs']
urls = []  # sitemap: (주소, {언어: 주소})
for lang in LANGS:
    D = load(lang)
    ui, P = D['ui'], PAGE[lang]
    t = lambda k, **kw: ui[k].format(**kw) if kw else ui[k]
    scenes = ([D['prologue']] if 'prologue' in D else []) + D['events']
    n = len(D['events'])
    per = {p['id']: p for p in D['periods']}
    G = ui['gospels']
    def refs(e):
        return ' · '.join('%s %s' % (G[k][1], v) for k, v in e['refs'].items() if k in G)
    for i, e in enumerate(scenes):
        pro = 'prologue' in D and e is D['prologue']
        place = D['places'][e['place']]['name']
        p = per.get(e['p'], {}).get('name', '') if not pro else P['pro']
        title = '%s — %s · %s | %s' % (e['title'], place, e['when'], ui['appName'])
        desc = (e.get('subtitle', '') + '. ' if e.get('subtitle') else '') + e['story'][0]
        desc = desc[:150] + ('…' if len(desc) > 150 else '')
        img = e['img']['src'] if 'img' in e else 'assets/og.jpg'
        ld = {'@context': 'https://schema.org', '@type': 'Article', 'headline': e['title'], 'description': desc, 'inLanguage': lang,
              'image': '%s/%s' % (SITE, img), 'about': {'@type': 'Place', 'name': place}, 'isPartOf': {'@type': 'WebSite', 'name': ui['appName'], 'url': SITE + '/'}}
        b = [head(lang, LANGS, e['id'], title, desc, img, ld)]
        b.append('<article>\n<div class="eyebrow">%s%s</div>\n<h1>%s</h1>\n' % (esc(p), '' if pro else ' · %d / %d' % (i + (0 if 'prologue' in D else 1), n), esc(e['title'])))
        if e.get('subtitle'): b.append('<p class="sub">%s</p>\n' % esc(e['subtitle']))
        b.append('<p class="meta">%s · %s · %s</p>\n' % (esc(place), esc(e['when']), esc(refs(e))))
        if 'img' in e:
            b.append('<figure><img src="/%s" alt="%s" loading="lazy" width="1200" height="900"><figcaption>%s</figcaption></figure>\n' % (esc(e['img']['src']), esc(e['img'].get('title', e['title'])), esc(e['img']['credit'])))
        b.append('<h2>%s</h2>\n' % esc(t('storyLabel')) + ''.join('<p>%s</p>\n' % esc(s) for s in e['story']))
        b.append('<a class="go" href="%s">%s →</a>\n' % (app_url(lang, e['id']), esc(P['walk'])))
        b.append('<h2>%s</h2>\n' % esc(t('hisWords')) + ''.join('<blockquote><p>%s</p><footer>%s · %s</footer></blockquote>\n' % (esc(w['text']), esc(w['who']), esc(w['ref'])) for w in e['words']))
        b.append('<p class="fine">%s</p>\n' % esc(t('wordsNote', r=refs(e))))
        if e.get('note'): b.append('<h2>%s</h2>\n<div class="box"><p>%s</p></div>\n' % (esc(t('noteHead')), esc(e['note'])))
        if e.get('reflect'): b.append('<h2>%s</h2>\n<div class="box"><p>%s</p></div>\n' % (esc(t('reflectHead')), esc(e['reflect'])))
        b.append('</article>\n<nav class="pn">%s%s</nav>\n' % (
            '<a href="%s" rel="prev">← %s</a>' % (fname(scenes[i - 1]['id'], lang), esc(scenes[i - 1]['title'])) if i > 0 else '<span></span>',
            '<a href="%s" rel="next">%s →</a>' % (fname(scenes[i + 1]['id'], lang), esc(scenes[i + 1]['title'])) if i + 1 < len(scenes) else '<span></span>'))
        b.append('<p style="text-align:center;margin-top:26px"><a href="%s">%s</a></p>\n' % (fname('index', lang), esc(P['all'].format(n=n))))
        b.append(langline(LANGS, e['id'], lang) + '</main>\n</body>\n</html>\n')
        open(os.path.join(out_dir, fname(e['id'], lang)), 'w', encoding='utf-8').write(''.join(b))
        if lang == 'ko': urls.append(e['id'])
    # 장면 목록: 시대별로 묶어 모든 장면 페이지로 잇는다
    title = '%s | %s' % (P['listTitle'].format(n=n), ui['appName'])
    ld = {'@context': 'https://schema.org', '@type': 'ItemList', 'name': P['listTitle'].format(n=n), 'numberOfItems': len(scenes),
          'itemListElement': [{'@type': 'ListItem', 'position': k + 1, 'url': '%s/s/%s' % (SITE, fname(e['id'], lang)), 'name': e['title']} for k, e in enumerate(scenes)]}
    b = [head(lang, LANGS, 'index', title, P['listLead'], 'assets/og.jpg', ld), '<div class="list">\n<h1>%s</h1>\n<p>%s</p>\n<a class="go" href="%s">%s →</a>\n' % (esc(P['listTitle'].format(n=n)), esc(P['listLead']), app_url(lang), esc(P['open']))]
    groups = ([(P['pro'], [D['prologue']])] if 'prologue' in D else []) + [(pp['name'] + ' · ' + pp['span'], [e for e in D['events'] if e['p'] == pp['id']]) for pp in D['periods']]
    for name, es in groups:
        if not es: continue
        b.append('<h2>%s</h2>\n<ol>\n' % esc(name) + ''.join('<li><a href="%s">%s</a><small>%s · %s</small></li>\n' % (fname(e['id'], lang), esc(e['title']), esc(D['places'][e['place']]['name']), esc(e['when'])) for e in es) + '</ol>\n')
    b.append('</div>\n' + langline(LANGS, 'index', lang) + '</main>\n</body>\n</html>\n')
    open(os.path.join(out_dir, fname('index', lang)), 'w', encoding='utf-8').write(''.join(b))

# sitemap.xml: 첫 화면·묻고 답하기·장면 목록·장면 페이지 (언어별 짝을 hreflang으로). 날짜(lastmod)는 빼서 빌드마다 바뀌지 않게
def entry(path_of):
    alts = ''.join('<xhtml:link rel="alternate" hreflang="%s" href="%s/%s"/>' % (l, SITE, path_of(l)) for l in LANGS)
    return ''.join('<url><loc>%s/%s</loc>%s</url>\n' % (SITE, path_of(l), alts) for l in LANGS)
sm = ['<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n',
      '<url><loc>%s/</loc></url>\n' % SITE,
      entry(lambda l: fname('qna', l)), entry(lambda l: 's/' + fname('index', l))]
sm += [entry(lambda l, b=b: 's/' + fname(b, l)) for b in urls]
sm.append('</urlset>\n')
open(os.path.join(root, 'sitemap.xml'), 'w', encoding='utf-8').write(''.join(sm))
print('pages:', len(urls), 'scenes ×', len(LANGS), 'languages + lists, sitemap.xml')

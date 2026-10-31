"""Merge skeleton + content parts into ../data.json (한국어) and ../data.<lang>.json (번역본 _src/i18n/<lang>.json마다).
Run: python3 _src/build.py"""
import json, os, glob, re, copy
here = os.path.dirname(os.path.abspath(__file__))
load = lambda n: json.load(open(os.path.join(here, n), encoding='utf-8'))
skeleton, places, periods = load('skeleton.json'), load('places.json'), load('periods.json')
content = {}
for f in sorted(glob.glob(os.path.join(here, 'content-*.json'))):
    for c in json.load(open(f, encoding='utf-8')):
        content[c['id']] = c
images = load('images.json') if os.path.exists(os.path.join(here, 'images.json')) else {}
music = load('music.json')['scenes']  # 장면마다 배경음악 곡 — 곡 파일이 만들어진 것만 싣는다
events = []
for s in skeleton:
    c = content[s['id']]
    e = {**s, **{k: v for k, v in c.items() if k != 'id'}}
    if s['id'] in images and os.path.exists(os.path.join(here, '..', 'assets', 'img', s['id'] + '.webp')):
        e['img'] = {'src': 'assets/img/%s.webp' % s['id'], **images[s['id']]}
    if os.path.exists(os.path.join(here, '..', 'assets', 'music', '%s.mp3' % music.get(s['id']))):
        e['music'] = music[s['id']]
    assert len(e['story']) == 3 and e['words'] and (s['id'] == 'e00' or len(e['quiz']['options']) == 4), s['id']  # 프롤로그는 퀴즈 없음
    for w in e['words']:
        w['j'] = 1 if w['who'] == '예수' else 0  # 예수님 말씀 표시 (번역본에서도 이름 대신 이 표로 가른다)
        if w['who'] == '하나님': w['g'] = 1  # 하나님 말씀 (프롤로그): 따로 남성 목소리로 읽는다
    events.append(e)
# 프롤로그(e00, 창세기의 첫 아담)는 61개 장면 목록 밖에 따로 싣는다 — 장면 수·퀴즈·도장·대조표에 들지 않게
prologue = events.pop(0) if events and events[0]['id'] == 'e00' else None
ui_ko = load('i18n/ui.ko.json'); ui_ko.pop('_comment', None)
LANGS = ['ko'] + sorted(os.path.basename(f)[3:-5] for f in glob.glob(os.path.join(here, 'i18n', 'ui.*.json')) if not f.endswith('ui.ko.json'))
ui_ko['langs'] = LANGS
out = {'periods': periods, 'places': places, 'events': events, 'ui': ui_ko, **({'prologue': prologue} if prologue else {})}
json.dump(out, open(os.path.join(here, '..', 'data.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print(len(events), 'events,', sum(1 for e in events if 'img' in e), 'with images')

# 번역본: 한국어 데이터를 바탕으로 글만 갈아 끼운다. 빠진 글은 한국어로 남겨 두고 알려 준다
BOOKS = {  # 말씀 출처(ref)의 책 이름 약자: 마태·마가·누가·요한·사도행전·창세기(프롤로그)
    'en': ['Mt', 'Mk', 'Lk', 'Jn', 'Acts', 'Gen'], 'es': ['Mt', 'Mc', 'Lc', 'Jn', 'Hch', 'Gn'], 'pt': ['Mt', 'Mc', 'Lc', 'Jo', 'At', 'Gn'],
    'fr': ['Mt', 'Mc', 'Lc', 'Jn', 'Ac', 'Gn'], 'zh': ['太', '可', '路', '约', '徒', '创'], 'id': ['Mat', 'Mrk', 'Luk', 'Yoh', 'Kis', 'Kej'], 'ja': ['マタ', 'マコ', 'ルカ', 'ヨハ', '使', '創'],
}
KO_BOOKS = ['마', '막', '눅', '요', '행', '창']
for lang in LANGS[1:]:
    f = os.path.join(here, 'i18n', lang + '.json')
    tr, miss = (json.load(open(f, encoding='utf-8')) if os.path.exists(f) else {}), []
    o = copy.deepcopy(out)
    ui = load('i18n/ui.%s.json' % lang)
    miss += [k for k in ui_ko if k not in ui and k != 'langs']
    o['ui'] = {**ui_ko, **ui, 'map': {**ui_ko['map'], **ui.get('map', {})}, 'langs': LANGS}
    for p in o['periods']:
        p.update(tr.get('periods', {}).get(p['id'], {}) or miss.append(p['id']) or {})
    for k, v in o['places'].items():
        v.update(tr.get('places', {}).get(k, {}) or miss.append(k) or {})
    books = dict(zip(KO_BOOKS, BOOKS[lang]))
    for e in o['events'] + ([o['prologue']] if 'prologue' in o else []):
        t = tr.get('events', {}).get(e['id'])
        if not t:
            miss.append(e['id']); continue
        for k in ('title', 'when', 'subtitle', 'note', 'reflect'):
            e[k] = t[k]
        assert len(t['story']) == 3 and len(t['words']) == len(e['words']) and ('quiz' not in e or len(t['quiz']['options']) == 4), (lang, e['id'])
        e['story'] = t['story']
        for w, tw in zip(e['words'], t['words']):
            w['who'], w['text'] = tw['who'], tw['text']
            w['ref'] = re.sub(r'(^|[;,·]\s*)([가-힣]+)(?=\s*\d)', lambda m: m.group(1) + books.get(m.group(2), m.group(2)), w['ref'])
        if 'quiz' in e:
            e['quiz'].update(q=t['quiz']['q'], options=t['quiz']['options'], explain=t['quiz']['explain'])
        if 'img' in e and t.get('credit'):
            e['img']['credit'] = t['credit']
    json.dump(o, open(os.path.join(here, '..', 'data.%s.json' % lang), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print('data.%s.json' % lang, 'missing:', (miss[:12] + ['…'] if len(miss) > 12 else miss) or 'none')

# 검색엔진용 장면 페이지(s/)와 sitemap.xml도 새 data로 다시 만든다
exec(open(os.path.join(here, 'pages.py'), encoding='utf-8').read(), {'__file__': os.path.join(here, 'pages.py')})

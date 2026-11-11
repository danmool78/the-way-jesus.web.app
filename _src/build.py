"""Merge skeleton + content parts into data files, one set per journey of the series (_src/series.json).
- 예수(jesus): 원본은 _src/ 바로 아래, 결과는 ../data.json(한국어)·../data.<lang>.json (예전 그대로)
- 다른 여정(<id>): 원본은 _src/journeys/<id>/ (같은 모양), 결과는 ../j/<id>/data.json·data.<lang>.json
  원본 폴더가 아직 없는 여정(준비 중)은 건너뛴다
Run: python3 _src/build.py"""
import hashlib
import json, os, glob, re, copy
here = os.path.dirname(os.path.abspath(__file__))
root = os.path.join(here, '..')
loadf = lambda p: json.load(open(p, encoding='utf-8'))
series = loadf(os.path.join(here, 'series.json'))
ui_ko = loadf(os.path.join(here, 'i18n', 'ui.ko.json')); ui_ko.pop('_comment', None)
LANGS = ['ko'] + sorted(os.path.basename(f)[3:-5] for f in glob.glob(os.path.join(here, 'i18n', 'ui.*.json')) if not f.endswith('ui.ko.json'))
ui_ko['langs'] = LANGS

# 말씀 출처(ref)의 책 이름 약자: 한국어 → 언어별. 여정이 늘면 그 책을 더한다 (없는 책은 한국어 약자 그대로)
# 말씀 출처의 책 이름(번역본에서 바꿔 단다) — 다윗·열왕기 여정의 사무엘·열왕기·역대·시편까지
BOOKS = {
    'ko': ['마', '막', '눅', '요', '행', '창', '출', '레', '민', '신', '수', '롬', '고전', '엡', '계', '사', '렘', '잠', '삼상', '삼하', '왕상', '왕하', '대상', '대하', '시'],
    'en': ['Mt', 'Mk', 'Lk', 'Jn', 'Acts', 'Gen', 'Ex', 'Lev', 'Num', 'Deut', 'Josh', 'Rom', '1 Cor', 'Eph', 'Rev', 'Isa', 'Jer', 'Prov', '1 Sam', '2 Sam', '1 Kgs', '2 Kgs', '1 Chr', '2 Chr', 'Ps'],
    'es': ['Mt', 'Mc', 'Lc', 'Jn', 'Hch', 'Gn', 'Éx', 'Lv', 'Nm', 'Dt', 'Jos', 'Ro', '1 Co', 'Ef', 'Ap', 'Is', 'Jer', 'Pr', '1 S', '2 S', '1 R', '2 R', '1 Cr', '2 Cr', 'Sal'],
    'pt': ['Mt', 'Mc', 'Lc', 'Jo', 'At', 'Gn', 'Êx', 'Lv', 'Nm', 'Dt', 'Js', 'Rm', '1 Co', 'Ef', 'Ap', 'Is', 'Jr', 'Pv', '1 Sm', '2 Sm', '1 Rs', '2 Rs', '1 Cr', '2 Cr', 'Sl'],
    'fr': ['Mt', 'Mc', 'Lc', 'Jn', 'Ac', 'Gn', 'Ex', 'Lv', 'Nb', 'Dt', 'Jos', 'Rm', '1 Co', 'Ep', 'Ap', 'Es', 'Jr', 'Pr', '1 S', '2 S', '1 R', '2 R', '1 Ch', '2 Ch', 'Ps'],
    'zh': ['太', '可', '路', '约', '徒', '创', '出', '利', '民', '申', '书', '罗', '林前', '弗', '启', '赛', '耶', '箴', '撒上', '撒下', '王上', '王下', '代上', '代下', '诗'],
    'id': ['Mat', 'Mrk', 'Luk', 'Yoh', 'Kis', 'Kej', 'Kel', 'Im', 'Bil', 'Ul', 'Yos', 'Rm', '1Kor', 'Ef', 'Why', 'Yes', 'Yer', 'Ams', '1Sam', '2Sam', '1Raj', '2Raj', '1Taw', '2Taw', 'Mzm'],
    'ja': ['マタ', 'マコ', 'ルカ', 'ヨハ', '使', '創', '出', 'レビ', '民', '申', 'ヨシュ', 'ロマ', '一コリ', 'エフェ', '黙', 'イザ', 'エレ', '箴', 'サム上', 'サム下', '王上', '王下', '代上', '代下', '詩'],
}

# 시편: 노래 목록(songs.json — 관리자 페이지의 시편 노래 작업실이 고치는 원본)에서 장면을 만든다. 장면 하나 = 노래 하나:
# 이야기는 노래 앞 낭독 한 문단, song은 가사(작업실에서 올린 노래와 가사 시간은 앱이 assets/psalms/<id>.json에서 받는다).
# 말씀 탭 자리에는 후렴 첫머리를 둔다(시편 장·편 표시). 묶음이 시대(periods)
SONG_COLORS = ['#c8963e', '#b5503f', '#7d6aa8', '#c9a227', '#3f8fa0', '#8c6a62', '#a83f3f', '#d6a441']
def songs_scenes(src):
    groups = src['groups']
    periods = [{'id': 's%s' % g, 'name': n, 'en': 'PSALMS ' + ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][int(g) - 1], 'span': '시편', 'color': SONG_COLORS[(int(g) - 1) % len(SONG_COLORS)]} for g, n in groups.items()]
    skeleton, content = [], {}
    for s in src['songs']:
        if not s.get('lyrics'):
            continue
        lines = s['lyrics'].split('\n')
        sung = [x.strip() for x in lines if x.strip() and not re.match(r'^\[.*\]$', x.strip())]
        ch = lines.index(next((x for x in lines if x.strip().lower().startswith('[chorus')), lines[0]))
        hook = [x.strip() for x in lines[ch + 1:] if x.strip() and not x.strip().startswith('[')][:2] or sung[:2]
        skeleton.append({'id': s['id'], 'p': 's%s' % s['group'], 'when': '시편 %s편' % s['psalm'], 'year': 0, 'place': s['place'], 'title': '%s편 · %s' % (s['psalm'], s['title']), 'refs': {}})
        content[s['id']] = {'id': s['id'], 'subtitle': s['setting'], 'story': [s['intro']], 'song': {'psalm': s['psalm'], 'lyrics': s['lyrics']},
                            'words': [{'who': '시편', 'text': ' '.join(hook), 'ref': '시 %s편' % s['psalm']}]}
    return skeleton, periods, content

def build(jid, src, out_dir):
    """src의 원본으로 out_dir에 data.json·data.<lang>.json을 쓴다"""
    load = lambda n: loadf(os.path.join(src, n))
    has = lambda n: os.path.exists(os.path.join(src, n))
    meta = load('journey.json') if has('journey.json') else {}  # 여정마다 다른 것: 주인공 이름(main), 대조표 여부(harmony) 등
    main = meta.get('main', '예수')
    places = load('places.json')
    if has('songs.json'):
        skeleton, periods, content = songs_scenes(load('songs.json'))
    else:
        skeleton, periods = load('skeleton.json'), load('periods.json')
        content = {}
        for f in sorted(glob.glob(os.path.join(src, 'content-*.json'))):
            for c in loadf(f):
                content[c['id']] = c
    images = load('images.json') if has('images.json') else {}
    music = load('music.json')['scenes'] if has('music.json') else {}
    # 그림도 주소에 내용의 짧은 해시를 붙인다(?v=…): 그림은 7일씩 캐시되어, 같은 이름으로 다시 그리면 앱이 예전 그림을 보였다
    fver = lambda f: hashlib.md5(open(f, 'rb').read()).hexdigest()[:8]  # 장면마다 배경음악 곡 — 곡 파일이 만들어진 것만 싣는다
    events = []
    for s in skeleton:
        c = content[s['id']]
        e = {**s, **{k: v for k, v in c.items() if k != 'id'}}
        if s['id'] in images and os.path.exists(os.path.join(root, 'assets', 'img', s['id'] + '.webp')):
            e['img'] = {'src': 'assets/img/%s.webp?v=%s' % (s['id'], fver(os.path.join(root, 'assets', 'img', s['id'] + '.webp'))), **images[s['id']]}
        mp = os.path.join(root, 'assets', 'music', '%s.mp3' % music.get(s['id']))
        if os.path.exists(mp):
            # 곡 이름 뒤에 파일 내용의 짧은 해시를 붙인다(곡?v=…): 곡을 다시 만들어도 이름이 같아 브라우저가 예전 곡을 7일씩 캐시로 틀었다
            e['music'] = '%s?v=%s' % (music[s['id']], hashlib.md5(open(mp, 'rb').read()).hexdigest()[:8])
        assert len(e['story']) == (1 if 'song' in e else 3) and e['words'] and ('quiz' not in e or len(e['quiz']['options']) == 4), s['id']  # 프롤로그는 퀴즈 없음
        # 한국어 이야기의 문단별 문장 수: 무대 대본·장면 안 이동은 한국어 문장 번호(p1.2 등)에 걸려 있다.
        # 번역은 문장 수가 달라, 앱이 번역 문장의 자리를 이 수에 비례해 한국어 문장 번호로 바꿔 무대를 움직인다 (app.js speakQueue)
        e['sn'] = [len([x for x in re.findall(r'[^.?!…。！？]+[.?!…。！？]*["”’」』]?\s*', p) if x.strip()]) or 1 for p in e['story']]
        for w in e['words']:
            w['j'] = 1 if w['who'] in (main if isinstance(main, list) else [main]) else 0  # 주인공 말씀 표시 (번역본에서도 이름 대신 이 표로 가른다). main이 목록이면 그 모두 (잠언: 솔로몬·지혜·아굴 — 말씀 모음에 다 실리게)
            if w['who'] == '하나님': w['g'] = 1  # 하나님 말씀: 따로 남성 목소리로 읽는다
        events.append(e)
    # 프롤로그(예수 여정의 e00, 창세기의 첫 아담)는 장면 목록 밖에 따로 싣는다 — 장면 수·퀴즈·도장·대조표에 들지 않게
    prologue = events.pop(0) if meta.get('prologue', jid == 'jesus') and events and events[0]['id'].endswith('00') else None
    # 여정 정보: 시리즈 목록(고르기)과 이 여정의 설정. 화면 글씨는 공통 ui 위에 여정의 ui를 덧씌운다
    journey = {'id': jid, 'harmony': meta.get('harmony', jid == 'jesus'), 'voice': meta.get('voice', jid == 'jesus'), 'series': series,
               **({'map': meta['map']} if 'map' in meta else {}),
               **({'main': main} if isinstance(main, list) else {}),  # 말하는 이가 여럿인 여정(잠언): 앱이 말씀 카드에 '예수' 대신 그 이름을 쓴다  # 여정의 지도 설정(그린 범위·지역 이름 등)
               **{k: meta[k] for k in ('quick', 'next', 'odo', 'sponsor', 'where', 'rate', 'narrator', 'stageOnly', 'koOnly', 'no3d') if k in meta}}  # quick: 첫 화면 없이 첫 장면부터, next: 끝 화면에서 이어 걸을 여정, odo·sponsor: false면 걸은 거리·후원 안내를 숨김, where: false면 낭독에서 장소·때와 걸어가는 안내를 읽지 않음, narrator: 해설 성우('eleven:<id>' 일레븐랩스), stageOnly: 지도 없이 어두운 바탕에 무대만 크게 (GoodNews)
    # 그림 장면(paints)의 그림 해시: app.js paintSrc가 주소 뒤에 붙인다. '왜 기독교인가' 아이콘도 (앱의 시리즈 목록 맨 끝)
    pv = {}
    for e in events:
        for n in [n for _, n in e.get('paints', [])] + [n for n, _ in e.get('act', {}).get('seq', [])]:  # act의 seq는 [그림, ms]
            f = os.path.join(root, 'assets', 'img', ('goodnews/' if '-' in n else '') + n + '.webp')
            if os.path.exists(f): pv[n] = fver(f)
    if pv: journey['pv'] = pv
    if has('daily.json'): journey['daily'] = load('daily.json')['days']  # 하루 한 장 31일 잠언 (그날 날짜의 장) — app.js renderDaily
    journey['whyIcon'] = 'assets/why-icon.webp?v=' + fver(os.path.join(root, 'assets', 'why-icon.webp'))
    def ui_for(lang):
        u = {**ui_ko, **(loadf(os.path.join(here, 'i18n', 'ui.%s.json' % lang)) if lang != 'ko' else {})}
        u['map'] = {**ui_ko['map'], **u.get('map', {})}
        for l in ('ko', lang):  # 여정 글씨: 한국어 위에 그 언어를 (번역이 빠지면 한국어로)
            p = os.path.join(src, 'i18n', 'ui.%s.json' % l) if jid != 'jesus' else None
            if p and os.path.exists(p):
                over = loadf(p); over.pop('_comment', None)
                u.update({k: v for k, v in over.items() if k != 'map'}); u['map'].update(over.get('map', {}))
        u['langs'] = LANGS
        return u
    os.makedirs(out_dir, exist_ok=True)
    out = {'periods': periods, 'places': places, 'events': events, 'ui': ui_for('ko'), 'journey': journey, **({'prologue': prologue} if prologue else {})}
    json.dump(out, open(os.path.join(out_dir, 'data.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print('[%s]' % jid, len(events), 'events,', sum(1 for e in events if 'img' in e), 'with images')

    # 번역본: 한국어 데이터를 바탕으로 글만 갈아 끼운다. 빠진 글은 한국어로 남겨 두고 알려 준다
    # 한국어 전용 여정(시편, koOnly)은 번역본을 만들지 않는다 — 앱이 이 여정에서는 늘 한국어로 연다
    ui_tr = lambda lang: loadf(os.path.join(here, 'i18n', 'ui.%s.json' % lang))
    for lang in ([] if meta.get('koOnly') else LANGS[1:]):
        f = os.path.join(src, 'i18n', lang + '.json')
        tr, miss = (loadf(f) if os.path.exists(f) else {}), []
        o = copy.deepcopy(out)
        miss += [k for k in ui_ko if k not in ui_tr(lang) and k != 'langs']
        o['ui'] = ui_for(lang)
        for p in o['periods']:
            p.update(tr.get('periods', {}).get(p['id'], {}) or miss.append(p['id']) or {})
        for k, v in o['places'].items():
            v.update(tr.get('places', {}).get(k, {}) or miss.append(k) or {})
        books = dict(zip(BOOKS['ko'], BOOKS[lang]))
        for e in o['events'] + ([o['prologue']] if 'prologue' in o else []):
            t = tr.get('events', {}).get(e['id'])
            if not t:
                miss.append(e['id']); continue
            for k in ('title', 'when', 'subtitle', 'note', 'reflect'):
                e[k] = t[k]
            if 'core' in e:  # 복음의 중심(바울 여정) — 번역본에 없으면 한국어로 남기지 않고 뺀다
                if t.get('core'): e['core'] = t['core']
                else: del e['core']
            assert len(t['story']) == 3 and len(t['words']) == len(e['words']) and ('quiz' not in e or len(t['quiz']['options']) == 4), (lang, e['id'])
            e['story'] = t['story']
            for w, tw in zip(e['words'], t['words']):
                w['who'], w['text'] = tw['who'], tw['text']
                w['ref'] = re.sub(r'(^|[;,·]\s*)([가-힣]+)(?=\s*\d)', lambda m: m.group(1) + books.get(m.group(2), m.group(2)), w['ref'])
            if 'quiz' in e:
                e['quiz'].update(q=t['quiz']['q'], options=t['quiz']['options'], explain=t['quiz']['explain'])
            if 'img' in e and t.get('credit'):
                e['img']['credit'] = t['credit']
        json.dump(o, open(os.path.join(out_dir, 'data.%s.json' % lang), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
        print('[%s] data.%s.json' % (jid, lang), 'missing:', (miss[:12] + ['…'] if len(miss) > 12 else miss) or 'none')

src_of = lambda jid: here if jid == 'jesus' else os.path.join(here, 'journeys', jid)
for j in series:  # 원본이 있어 data가 만들어지는 여정 표시 (관리자의 여정 고르기는 이것만 보인다)
    songs_src = os.path.join(src_of(j['id']), 'songs.json')
    j['built'] = os.path.exists(os.path.join(src_of(j['id']), 'skeleton.json')) or os.path.exists(songs_src)
    if j['built']:  # 장면 수(프롤로그 빼고): 첫 화면의 여정 카드에 쓴다 (시편은 가사가 있는 노래 수)
        if os.path.exists(songs_src):
            j['n'] = sum(1 for x in loadf(songs_src)['songs'] if x.get('lyrics'))
        else:
            sk = loadf(os.path.join(src_of(j['id']), 'skeleton.json'))
            j['n'] = len(sk) - (1 if sk and sk[0]['id'].endswith('00') else 0)
for j in series:
    if j['built']:  # 아직 원본이 없는 여정(준비 중)은 건너뛴다
        build(j['id'], src_of(j['id']), root if j['id'] == 'jesus' else os.path.join(root, 'j', j['id']))

# 첫 주소의 랜딩(index.html)이 읽는 land.json: 여정 카드(시리즈 + 마지막에 4영리)와 랜딩 글씨만 언어마다 — 앱의 data.json은 크다
LAND_KEYS = ['appName', 'hubTag', 'hubLead', 'seriesHead', 'seriesGo', 'seriesScenes', 'shareShort', 'shareApp', 'linkCopied', 'soon',
             'mvGo', 'mvLead', 'mvNote', 'qnaHelp', 'language', 'close', 'goodnewsGo', 'whyGo']
land = {'langs': LANGS, 'cards': [{'id': j['id'], 'title': j['title'], 'desc': j['desc'], 'ready': j['ready'], **({'n': j['n']} if j.get('n') else {})} for j in series if j['id'] != 'goodnews']
        + [{'id': 'goodnews', 'title': 'goodnewsH', 'desc': 'goodnews', 'ready': True, 'href': '/goodnews/', 'go': 'goodnewsGo'},  # 4영리는 따로 만든 페이지(/goodnews/)로
           {'id': 'why', 'title': 'whyH', 'desc': 'why', 'ready': True, 'href': '/why.html', 'langHref': True, 'go': 'whyGo', 'icon': 'assets/why-icon.webp?v=' + hashlib.md5(open(os.path.join(root, 'assets', 'why-icon.webp'), 'rb').read()).hexdigest()[:8]}], 'ui': {}}  # '왜 기독교인가'는 언어마다 why.<언어>.html
for lang in LANGS:
    u = {**ui_ko, **(loadf(os.path.join(here, 'i18n', 'ui.%s.json' % lang)) if lang != 'ko' else {})}
    keys = LAND_KEYS + sorted({c['title'] for c in land['cards']} | {c['desc'] for c in land['cards']})
    land['ui'][lang] = {k: u[k] for k in keys if k in u}
json.dump(land, open(os.path.join(root, 'land.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))

# 검색엔진용 장면 페이지(s/)와 sitemap.xml도 새 data로 다시 만든다
exec(open(os.path.join(here, 'pages.py'), encoding='utf-8').read(), {'__file__': os.path.join(here, 'pages.py')})

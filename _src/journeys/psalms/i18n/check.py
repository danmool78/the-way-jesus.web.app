"""시편 번역본 검사: python3 check.py <언어> — 빠진 노래·줄, 한국어가 남은 줄, 화면에서 보기 흉하게 꺾일 만큼 긴 가사 줄을 알린다"""
import json, os, re, sys
here = os.path.dirname(os.path.abspath(__file__))
lang = sys.argv[1]
ko = json.load(open(os.path.join(here, 'ko.json'), encoding='utf-8'))
tr = json.load(open(os.path.join(here, lang + '.json'), encoding='utf-8'))
cjk = lang in ('zh', 'ja')
LIM = 22 if cjk else 52  # 가사 밑 번역 한 줄 길이(글자) — 폰 폭에서 두 줄을 넘지 않게
bad = []
hang = re.compile('[가-힣]')
for k in ('title', 'when', 'who', 'ref', 'span'):
    if not tr.get('fmt', {}).get(k): bad.append('fmt.' + k)
for g in ko['groups']:
    if not tr.get('groups', {}).get(g) or hang.search(tr['groups'][g]): bad.append('group ' + g)
for p, v in ko['places'].items():
    t = tr.get('places', {}).get(p, {})
    for f in v:
        if not t.get(f) or hang.search(t[f]): bad.append('place %s.%s' % (p, f))
long = []
for sid, s in ko['songs'].items():
    t = tr.get('songs', {}).get(sid)
    if not t: bad.append('song ' + sid); continue
    for f in ('title', 'setting', 'intro'):
        if not t.get(f) or hang.search(t[f]): bad.append('%s.%s' % (sid, f))
    for l in s['lines']:
        x = t.get('lines', {}).get(l)
        if not x or hang.search(x): bad.append('%s line: %s' % (sid, l))
        elif len(x) > LIM: long.append('%s (%d): %s' % (sid, len(x), x))
    extra = set(t.get('lines', {})) - set(s['lines'])
    if extra: bad.append('%s extra lines: %s' % (sid, list(extra)[:3]))
print(lang, 'problems:', len(bad), '| long lines:', len(long))
for b in bad[:40]: print('  ', b)
for b in long[:40]: print('  long', b)
sys.exit(1 if bad else 0)

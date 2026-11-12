"""바울 여정 번역 원본 뽑기: python3 _src/journeys/paul/i18n/extract.py → i18n/ko.json
skeleton·periods·places·content-*.json·letters.json에서 번역할 글만 모은다. 번역본 <언어>.json은 이것과 같은 모양으로 옮긴다
(그림 출처 credit은 art.py가 언어마다 채운다 — 번역하지 않는다. 지도 이름표는 ui.<언어>.json의 map에)"""
import json, os, glob
here = os.path.dirname(os.path.abspath(__file__)); src = os.path.dirname(here)
L = lambda f: json.load(open(os.path.join(src, f), encoding='utf-8'))
sk, per, pl, lt = L('skeleton.json'), L('periods.json'), L('places.json'), L('letters.json')
lt.pop('_comment', None)
ct = {c['id']: c for f in sorted(glob.glob(os.path.join(src, 'content-*.json'))) for c in json.load(open(f, encoding='utf-8'))}
ev = {}
for s in sk:
    c = ct[s['id']]
    ev[s['id']] = {'title': s['title'], 'when': s['when'], 'subtitle': c['subtitle'], 'story': c['story'],
                   'words': [{'who': w['who'], 'text': w['text']} for w in c['words']], 'note': c['note'], **({'core': c['core']} if c.get('core') else {}),
                   'reflect': c['reflect'], 'quiz': {'q': c['quiz']['q'], 'options': c['quiz']['options'], 'explain': c['quiz']['explain']}}
letters = {k: {'name': v['name'], 'to': v['to']['name'], 'when': v['when'], 'carrier': v.get('carrier', ''), 'why': v['why'], 'heart': v['heart'],
               'verses': [x['text'] for x in v['verses']], 'view': v.get('view', '')} for k, v in lt.items()}
out = {'periods': {p['id']: {'name': p['name'], 'span': p['span']} for p in per},
       'places': {k: {'name': v['name'], 'region': v['region']} for k, v in pl.items()}, 'events': ev, 'letters': letters}
json.dump(out, open(os.path.join(here, 'ko.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(ev), 'events,', len(letters), 'letters')

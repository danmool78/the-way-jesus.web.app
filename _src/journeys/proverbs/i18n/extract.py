"""잠언 여정 번역 원본 뽑기: python3 _src/journeys/proverbs/i18n/extract.py → i18n/ko.json
skeleton·periods·places·content-*.json에서 번역할 글만 모은다. 번역본 <언어>.json은 이것과 같은 모양으로 옮긴다
(그림 출처 credit은 art.py가 언어마다 채운다 — 번역하지 않는다)"""
import json, os, glob
here = os.path.dirname(os.path.abspath(__file__)); src = os.path.dirname(here)
L = lambda f: json.load(open(os.path.join(src, f), encoding='utf-8'))
sk, per, pl = L('skeleton.json'), L('periods.json'), L('places.json')
ct = {c['id']: c for f in sorted(glob.glob(os.path.join(src, 'content-*.json'))) for c in json.load(open(f, encoding='utf-8'))}
ev = {}
for s in sk:
    c = ct[s['id']]
    ev[s['id']] = {'title': s['title'], 'when': s['when'], 'subtitle': c['subtitle'], 'story': c['story'],
                   'words': [{'who': w['who'], 'text': w['text']} for w in c['words']], 'note': c['note'], 'reflect': c['reflect'],
                   'quiz': {'q': c['quiz']['q'], 'options': c['quiz']['options'], 'explain': c['quiz']['explain']}}
out = {'periods': {p['id']: {'name': p['name'], 'span': p['span']} for p in per},
       'places': {k: {'name': v['name'], 'region': v['region']} for k, v in pl.items()}, 'events': ev}
# 하루 한 장 31일 잠언(daily.json): 장마다 제목 t, 구절 셋 v(장:절은 그대로 두고 글만), 아버지의 한마디 n
dl = L('daily.json')['days']
out['daily'] = [{'t': d['t'], 'v': [x[1] for x in d['v']], 'n': d['n']} for d in dl]
json.dump(out, open(os.path.join(here, 'ko.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(ev), 'events,', len(dl), 'days')

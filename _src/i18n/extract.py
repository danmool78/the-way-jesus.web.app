"""번역할 글만 뽑아 _src/i18n/ko.json(번역 원본)으로 쓴다. 번역본 _src/i18n/<언어>.json도 같은 모양이다.
   python3 _src/i18n/extract.py
   - 성경 장절(refs)·좌표·색 같은 값은 번역하지 않으므로 뽑지 않는다
   - 말씀의 ref(눅 1:30 등)는 build.py가 언어별 책 이름 약자로 바꾼다
   - 뼈대(skeleton·places·periods·images)를 고치면 다시 뽑아 번역본에 같은 키를 채운다"""
import json, os, glob
here = os.path.dirname(os.path.abspath(__file__))
src = os.path.dirname(here)
load = lambda n: json.load(open(os.path.join(src, n), encoding='utf-8'))
skeleton, places, periods, images = load('skeleton.json'), load('places.json'), load('periods.json'), load('images.json')
content = {}
for f in sorted(glob.glob(os.path.join(src, 'content-*.json'))):
    for c in json.load(open(f, encoding='utf-8')):
        content[c['id']] = c
out = {
    'periods': {p['id']: {'name': p['name'], 'span': p['span']} for p in periods},
    'places': {k: {'name': v['name'], 'region': v['region']} for k, v in places.items()},
    'events': {},
}
for s in skeleton:
    c = content[s['id']]
    out['events'][s['id']] = {
        'title': s['title'], 'when': s['when'], 'subtitle': c['subtitle'], 'story': c['story'],
        'words': [{'who': w['who'], 'text': w['text']} for w in c['words']],
        'note': c['note'], 'reflect': c['reflect'],
        **({'quiz': {'q': c['quiz']['q'], 'options': c['quiz']['options'], 'explain': c['quiz']['explain']}} if 'quiz' in c else {}),  # 프롤로그는 퀴즈 없음
        'credit': images[s['id']]['credit'] if s['id'] in images else '',
    }
json.dump(out, open(os.path.join(here, 'ko.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('ko.json', len(out['events']), 'events')

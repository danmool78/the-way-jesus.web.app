"""Merge skeleton + content parts into ../data.json. Run: python3 _src/build.py"""
import json, os, glob
here = os.path.dirname(os.path.abspath(__file__))
load = lambda n: json.load(open(os.path.join(here, n), encoding='utf-8'))
skeleton, places, periods = load('skeleton.json'), load('places.json'), load('periods.json')
content = {}
for f in sorted(glob.glob(os.path.join(here, 'content-*.json'))):
    for c in json.load(open(f, encoding='utf-8')):
        content[c['id']] = c
images = load('images.json') if os.path.exists(os.path.join(here, 'images.json')) else {}
events = []
for s in skeleton:
    c = content[s['id']]
    e = {**s, **{k: v for k, v in c.items() if k != 'id'}}
    if s['id'] in images and os.path.exists(os.path.join(here, '..', 'assets', 'img', s['id'] + '.webp')):
        e['img'] = {'src': 'assets/img/%s.webp' % s['id'], **images[s['id']]}
    assert len(e['story']) == 3 and e['words'] and len(e['quiz']['options']) == 4, s['id']
    events.append(e)
out = {'periods': periods, 'places': places, 'events': events}
json.dump(out, open(os.path.join(here, '..', 'data.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print(len(events), 'events,', sum(1 for e in events if 'img' in e), 'with images')

# 낭독 음원(audio.json)이 원고와 어긋나면 알린다. 음원 생성은 _src/voice.py (배포는 멈추지 않는다)
import narration
audio = os.path.join(here, '..', 'audio.json')
have = json.load(open(audio, encoding='utf-8'))['clips'] if os.path.exists(audio) else {}
ids_path = os.path.join(here, 'voices', 'eleven.json')
ids = json.load(open(ids_path, encoding='utf-8')) if os.path.exists(ids_path) else {}
clips = narration.clips(out)
stale = [c['key'] for c in clips if have.get(c['key']) != narration.filename(c, narration.digest(c, ids))]
if stale:
    print(f'낭독 음원: {len(clips)}개 중 {len(stale)}개가 없거나 원고와 다릅니다 (음성 합성으로 읽음). 예: {", ".join(stale[:5])}')

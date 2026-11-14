"""시편 여정의 번역 원본 ko.json을 songs.json·places.json에서 뽑는다 — 이것을 옮긴 <언어>.json을 build.py가 읽는다.
노래는 한국어로 부르고, 화면에는 부르는 줄 밑에 그 언어의 뜻을 작게 띄운다(사용자 2026-11). 그래서 가사는 줄마다 옮긴다:
lines는 부르는 줄(같은 줄은 한 번만)이고, 번역본은 {한국어 줄: 옮긴 줄}로 짝을 둔다 — 작업실에서 가사를 고쳐도 남은 줄은 그대로 맞는다.
쓰는 법: python3 _src/journeys/psalms/i18n/extract.py → 검사: python3 _src/journeys/psalms/i18n/check.py <언어>"""
import json, os, re
here = os.path.dirname(os.path.abspath(__file__)); src = os.path.dirname(here)
songs = json.load(open(os.path.join(src, 'songs.json'), encoding='utf-8'))
places = json.load(open(os.path.join(src, 'places.json'), encoding='utf-8'))
def sung(lyrics):
    out = []
    for x in (lyrics or '').split('\n'):
        x = x.strip()
        if x and not re.match(r'^\[.*\]$', x) and x not in out: out.append(x)
    return out
ko = {
    '_comment': '시편 번역 원본(한국어) — extract.py가 만든다. 옮긴 글은 <언어>.json: fmt(제목 틀), groups, places, songs{id: title·setting·intro·lines{한국어 줄: 옮긴 줄}}',
    'fmt': {'title': '{n}편 · {t}', 'when': '시편 {n}편', 'who': '시편', 'ref': '시 {n}편', 'span': '시편'},
    'groups': songs['groups'],
    'places': {k: {f: v[f] for f in ('name', 'region') if f in v} for k, v in places.items()},
    'songs': {s['id']: {'psalm': s['psalm'], 'title': s['title'], 'setting': s['setting'], 'intro': s['intro'], 'lines': sung(s['lyrics'])} for s in songs['songs'] if s.get('lyrics')},
}
json.dump(ko, open(os.path.join(here, 'ko.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('ko.json:', len(ko['songs']), 'songs,', sum(len(s['lines']) for s in ko['songs'].values()), 'lines')

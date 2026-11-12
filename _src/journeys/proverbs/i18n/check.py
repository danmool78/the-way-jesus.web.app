"""잠언 여정 번역본 검사: python3 _src/journeys/proverbs/i18n/check.py <언어>
ko.json(번역 원본)과 같은 모양인지(장면·말씀·퀴즈 수), 빠진 글·한글이 남은 글이 없는지, 화면 글씨(ui.<언어>.json)가 다 있는지 본다"""
import json, os, re, sys
here = os.path.dirname(os.path.abspath(__file__))
lang = sys.argv[1]
ko = json.load(open(os.path.join(here, 'ko.json'), encoding='utf-8'))
tr = json.load(open(os.path.join(here, f'{lang}.json'), encoding='utf-8'))
ui_ko = json.load(open(os.path.join(here, 'ui.ko.json'), encoding='utf-8'))
ui = json.load(open(os.path.join(here, f'ui.{lang}.json'), encoding='utf-8'))
mp = json.load(open(os.path.join(here, '..', 'journey.json'), encoding='utf-8')).get('map', {})
hangul = re.compile(r'[가-힣]')
bad = []
def walk(a, b, path):
    if isinstance(a, dict):
        if not isinstance(b, dict): bad.append(f'{path}: 모양이 다름'); return
        for k in a:
            if k not in b: bad.append(f'{path}.{k}: 빠짐')
            else: walk(a[k], b[k], f'{path}.{k}')
    elif isinstance(a, list):
        if not isinstance(b, list) or len(a) != len(b): bad.append(f'{path}: 개수가 다름 ({len(a)} vs {len(b) if isinstance(b, list) else "-"})'); return
        for i, (x, y) in enumerate(zip(a, b)): walk(x, y, f'{path}[{i}]')
    elif isinstance(a, str):
        if not isinstance(b, str) or (a and not b.strip()): bad.append(f'{path}: 비었음')
        elif hangul.search(b): bad.append(f'{path}: 한글이 남음')
walk(ko, tr, lang)
for k, v in ui_ko.items():
    if k == '_comment': continue
    if k not in ui: bad.append(f'ui.{k}: 빠짐')
    elif isinstance(v, str) and hangul.search(ui[k]): bad.append(f'ui.{k}: 한글이 남음')
names = [r[0] for r in mp.get('regions', [])] + [r[0] for r in mp.get('refcities', [])] + [r[0] for r in mp.get('labels', [])]
for n in names:
    if n not in ui.get('map', {}): bad.append(f'ui.map["{n}"]: 빠짐')
print('\n'.join(bad[:40]) or 'OK', f'({len(bad)} problems)' if bad else '')

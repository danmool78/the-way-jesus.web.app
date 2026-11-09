"""다윗 장면 원본 검사: python3 _src/journeys/david/check.py [content-A.json ...]
뼈대(skeleton.json)와 id가 맞는지, 글 길이·말씀·퀴즈 모양이 STYLE.md 규칙에 맞는지 본다"""
import json, os, re, sys, glob
here = os.path.dirname(os.path.abspath(__file__))
sk = {s['id']: s for s in json.load(open(os.path.join(here, 'skeleton.json'), encoding='utf-8'))}
files = sys.argv[1:] or sorted(glob.glob(os.path.join(here, 'content-*.json')))
bad, seen, answers = [], [], []
for f in files:
    for c in json.load(open(f if os.path.isabs(f) or os.path.exists(f) else os.path.join(here, f), encoding='utf-8')):
        i = c.get('id'); seen.append(i)
        if i not in sk: bad.append(f'{i}: 뼈대에 없는 id'); continue
        if set(c) - {'id', 'subtitle', 'story', 'words', 'note', 'reflect', 'quiz'}: bad.append(f'{i}: 모르는 열쇠 {set(c) - {"id","subtitle","story","words","note","reflect","quiz"}}')
        st = c.get('story', [])
        if len(st) != 3: bad.append(f'{i}: story는 3문단')
        for k, p in enumerate(st):
            if not 80 <= len(p) <= 220: bad.append(f'{i}: story[{k}] 길이 {len(p)} (90~200)')
            if re.search(r'[()\[\]A-Za-z]', p): bad.append(f'{i}: story[{k}]에 괄호·영문')
        ws = c.get('words', [])
        if not 2 <= len(ws) <= 4: bad.append(f'{i}: words는 2~4개')
        for w in ws:
            if set(w) != {'who', 'text', 'ref'}: bad.append(f'{i}: words 열쇠는 who·text·ref')
            if len(w.get('text', '')) > 120: bad.append(f'{i}: 말씀 {len(w["text"])}자 (120자 이내)')
            if not re.match(r'^(출|민|신|수) \d', w.get('ref', '')): bad.append(f'{i}: ref "{w.get("ref")}" (출/민/신/수 장:절)')
        if not 50 <= len(c.get('note', '')) <= 180: bad.append(f'{i}: note 길이 {len(c.get("note", ""))}')
        if not c.get('reflect', '').endswith('?'): bad.append(f'{i}: reflect는 물음 한 문장')
        q = c.get('quiz', {})
        if len(q.get('options', [])) != 4 or q.get('answer') not in range(4) or not q.get('q') or not q.get('explain'): bad.append(f'{i}: quiz 모양')
        else: answers.append(q['answer'])
print('scenes:', len(seen), '| answer spread:', {a: answers.count(a) for a in range(4)})
print('\n'.join(bad) or 'OK')

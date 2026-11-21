#!/usr/bin/env python3
"""순례 게임 다국어: 게임 파일의 t('…')·data-i18n 글씨를 뽑아 _src/game-i18n/ko.json(목록)을 만들고,
언어별 사전 assets/game-i18n/<언어>.json에서 빠진 것·쓰이지 않는 것을 알린다.
  python3 _src/tools/gamei18n.py            뽑기
  python3 _src/tools/gamei18n.py check en   빠진 것 보기 (missing.<언어>.json도 적음)
  python3 _src/tools/gamei18n.py prune en   쓰이지 않는 열쇠 지우기"""
import json, re, sys, os, glob
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FILES = sorted(glob.glob(os.path.join(ROOT, 'game*.js')))
def unq(s, q):
    return s.encode('utf-8').decode('unicode_escape').encode('latin-1').decode('utf-8') if '\\' in s else s
def keys():
    out = {}
    for f in FILES:
        src = open(f, encoding='utf-8').read()
        for m in re.finditer(r"""\btr?\(\s*(['"])((?:\\.|(?!\1).)*)\1""", src):
            k = m.group(2).replace("\\'", "'").replace('\\"', '"').replace('\\n', '\n').replace('\\\\', '\\')
            out.setdefault(k, os.path.basename(f))
    html = open(os.path.join(ROOT, 'game.html'), encoding='utf-8').read()
    for m in re.finditer(r'<(\w+)[^>]*\sdata-i18n[\s>][^>]*>(.*?)</\1>', html, re.S):
        out.setdefault(m.group(2).strip(), 'game.html')
    for m in re.finditer(r'placeholder="([^"]+)"[^>]*data-i18n-ph|data-i18n-ph[^>]*placeholder="([^"]+)"', html):
        out.setdefault(m.group(1) or m.group(2), 'game.html')
    # 만남 이야기와 여정 이름 등 json 자료는 따로(game-talk) 옮긴다
    return out
def main():
    ks = keys()
    os.makedirs(os.path.join(ROOT, '_src/game-i18n'), exist_ok=True)
    json.dump(ks, open(os.path.join(ROOT, '_src/game-i18n/ko.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    if len(sys.argv) < 3: print(len(ks), 'keys'); return
    cmd, lang = sys.argv[1], sys.argv[2]
    p = os.path.join(ROOT, f'assets/game-i18n/{lang}.json')
    d = json.load(open(p, encoding='utf-8')) if os.path.exists(p) else {}
    miss = {k: v for k, v in ks.items() if k not in d}
    extra = [k for k in d if k not in ks]
    if cmd == 'check':
        bad = [k for k, v in d.items() if k in ks and sorted(re.findall(r'\{\d', k)) != sorted(re.findall(r'\{\d', v))]
        json.dump(miss, open(os.path.join(ROOT, f'_src/game-i18n/missing.{lang}.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        print(f'{lang}: {len(ks) - len(miss)}/{len(ks)} · 빠짐 {len(miss)} · 안 쓰임 {len(extra)} · 자리표 어긋남 {len(bad)}')
        for k in bad[:20]: print('  {}', k, '→', d[k])
    elif cmd == 'prune':
        for k in extra: d.pop(k)
        json.dump(d, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1); print('지움', len(extra))
main()

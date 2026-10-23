"""낭독 원고: data.json에서 앱이 소리 내어 읽는 모든 문장을 뽑고, 녹음용 표기로 다듬는다.

앱(app.js의 sceneScript, walkTo)이 읽는 순서·단위와 같다. 각 조각(clip)은
  key   — 앱이 찾는 이름 (예: e01/s0, e01/w1, who/마리아, move/nazareth/bethlehem)
  voice — 목소리 (VOICES 참고)
  text  — 실제로 읽을 문장
을 가진다. voice.py가 이것으로 음원을 만들고 audio.json에 목록을 적는다.
"""
import hashlib, re

# 목소리 설계 (OmniVoice voice design). 같은 설계라도 생성할 때마다 목소리가 달라지므로,
# seed로 기준 목소리를 한 번 만들어 _src/voices/에 두고 모든 문장을 그 목소리로 복제해 읽는다.
# 설계나 seed를 바꾸면 기준 목소리와 그 목소리의 음원이 모두 다시 만들어진다.
VOICES = {
    'narrator':   ('female, middle-aged, moderate pitch', 1),
    'jesus':      ('male, young adult, low pitch', 1),
    'gabriel':    ('male, young adult, high pitch', 1),
    'angel':      ('male, young adult, moderate pitch', 7),
    'host':       ('female, young adult, high pitch', 1),
    'heaven':     ('male, elderly, very low pitch', 1),
    'mary':       ('female, teenager, high pitch', 1),
    'shepherd':   ('male, middle-aged, low pitch', 1),
    'simeon':     ('male, elderly, moderate pitch', 1),
    'magi':       ('male, middle-aged, moderate pitch', 1),
    'priest':     ('male, middle-aged, very low pitch', 1),
    'herod':      ('male, elderly, low pitch', 1),
    'nathanael':  ('male, young adult, high pitch', 2),
    'samaritan':  ('female, young adult, moderate pitch', 1),
    'official':   ('male, middle-aged, high pitch', 1),
    'peter':      ('male, middle-aged, low pitch', 2),
    'centurion':  ('male, middle-aged, very low pitch', 2),
    'crowd':      ('male, young adult, moderate pitch', 3),
    'disciples':  ('male, young adult, moderate pitch', 4),
    'canaanite':  ('female, middle-aged, low pitch', 1),
    'healed':     ('male, young adult, high pitch', 3),
    'martha':     ('female, young adult, low pitch', 1),
    'magdalene':  ('female, young adult, high pitch', 2),
    'thomas':     ('male, middle-aged, moderate pitch', 2),
}
# 기준 목소리가 읽는 문장 (3~10초)
REF_TEXT = '오늘은 바람이 잔잔합니다. 호숫가 마을에 햇빛이 고요히 내려앉고, 사람들이 하나둘 모여들었습니다.'

# 인물 → 목소리. 기록·예언 인용은 내레이터가 읽는다.
SPEAKER_VOICE = {
    '예수': 'jesus',
    '가브리엘': 'gabriel',
    '주의 천사': 'angel', '천사': 'angel', '흰옷 입은 두 사람': 'angel',
    '하늘 군대': 'host',
    '하늘의 음성': 'heaven',
    '마리아': 'mary',
    '목자들': 'shepherd',
    '시므온': 'simeon',
    '박사들': 'magi',
    '대제사장과 율법학자들': 'priest', '유대인들': 'priest',
    '헤롯': 'herod',
    '예레미야의 예언': 'narrator', '누가의 기록': 'narrator', '누가': 'narrator', '마가': 'narrator',
    '나다나엘': 'nathanael',
    '사마리아 여인': 'samaritan',
    '왕의 신하': 'official',
    '시몬 베드로': 'peter', '시몬': 'peter', '베드로': 'peter',
    '백부장': 'centurion',
    '무리': 'crowd',
    '제자들': 'disciples', '두 제자': 'disciples',
    '어머니': 'canaanite',
    '눈을 뜬 사람': 'healed',
    '마르다': 'martha',
    '막달라 마리아': 'magdalene',
    '도마': 'thomas',
}


def place_name(name):
    """'엠마오 (추정)' → '엠마오', '골고다 · 동산 무덤' → '골고다, 동산 무덤'"""
    return re.sub(r'\s*\([^)]*\)', '', name).replace(' · ', ', ').strip()


def when_text(when):
    """'BC 5–4년' → '기원전 5년에서 4년', 'AD 28년 · 안식일' → '서기 28년, 안식일'"""
    t = re.sub(r'(\d+)–(\d+)년', r'\1년에서 \2년', when)
    t = t.replace('BC ', '기원전 ').replace('AD ', '서기 ')
    return t.replace(' · ', ', ').replace('–', '에서 ')


def title_text(title):
    return title.replace(' — ', ', ')


def ro(word):
    """방향 조사: 받침이 없거나 ㄹ 받침이면 '로', 아니면 '으로'."""
    c = ord(word[-1]) - 0xAC00
    return '로' if not 0 <= c < 11172 or c % 28 in (0, 8) else '으로'


def move_text(a, b):
    a, b = place_name(a), place_name(b)
    return f'{a}에서 {b}{ro(b)}.'


LABEL_JESUS, LABEL_VOICES = '그분의 말씀.', '그날의 목소리.'


def clips(data):
    events, places = data['events'], data['places']
    out = {}
    add = lambda key, voice, text: out.setdefault(key, {'key': key, 'voice': voice, 'text': text})
    add('say/words', 'narrator', LABEL_JESUS)
    add('say/voices', 'narrator', LABEL_VOICES)
    for e in events:
        add(f"{e['id']}/h", 'narrator',
            f"{title_text(e['title'])}. {place_name(places[e['place']]['name'])}, {when_text(e['when'])}.")
        for i, s in enumerate(e['story']):
            add(f"{e['id']}/s{i}", 'narrator', s)
        for i, w in enumerate(e['words']):
            if w['who'] != '예수':
                add(f"who/{w['who']}", 'narrator', f"{w['who']}.")
            add(f"{e['id']}/w{i}", SPEAKER_VOICE[w['who']], w['text'])
    for a, b in zip(events, events[1:]):
        if a['place'] != b['place']:
            add(f"move/{a['place']}/{b['place']}", 'narrator',
                move_text(places[a['place']]['name'], places[b['place']]['name']))
    return list(out.values())


def digest(clip):
    """문장이나 목소리 설계가 바뀌면 달라지는 지문. 음원을 다시 만들지 판단한다."""
    instruct, seed = VOICES[clip['voice']]
    return hashlib.sha1(f"{instruct}|{seed}|{REF_TEXT}\n{clip['text']}".encode()).hexdigest()[:10]


def filename(clip, h):
    key = clip['key']
    if key.startswith('who/'):  # 인물 이름은 한글이므로 지문으로 파일명을 만든다
        key = 'who/' + hashlib.sha1(key.encode()).hexdigest()[:8]
    return key.replace('/', '-') + '.' + h + '.mp3'

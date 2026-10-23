"""낭독 원고: data.json에서 앱이 소리 내어 읽는 모든 문장을 뽑고, 녹음용 표기로 다듬는다.

앱(app.js의 sceneScript, walkTo)이 읽는 순서·단위와 같다. 각 조각(clip)은
  key   — 앱이 찾는 이름 (예: e01/s0, e01/w1, who/마리아, move/nazareth/bethlehem)
  voice — 목소리 (VOICES 참고)
  text  — 실제로 읽을 문장
을 가진다. voice.py가 이것으로 음원을 만들고 audio.json에 목록을 적는다.
"""
import hashlib, re

# 목소리 설계 (Qwen3-TTS VoiceDesign). 목소리마다 기준 음성을 한 번 만들어 _src/voices/에 두고,
# 모든 문장은 그 기준 음성을 복제해(Qwen3-TTS Base) 읽는다. 그래서 장면이 바뀌어도 같은 목소리다.
# 기준 음성은 직접 듣고 고른 것이므로 지우지 않는다. 묘사를 바꾸려면 해당 wav를 지우고 다시 만든다.
_PLAIN = ' Natural Korean speech at a normal pace; sincere, not theatrical, not slow.'
VOICES = {
    'narrator':  'A Korean woman in her late forties, a seasoned audiobook narrator. Mature, warm mid-low voice with a firm, grounded delivery and natural speaking pace. Sincere and moving but composed, every word clear and alive.',
    'jesus':     'A Korean man in his thirties, a plain-spoken village carpenter. Clear, grounded, natural voice; short, firm and sincere sentences, simple and direct with quiet confidence. No sweetness, no whispering, no theatrical drama, not greasy.',
    'gabriel':   'A Korean man in his twenties with a bright, clear, ringing voice, an angel bringing astonishing news; gentle reassurance with radiant joy.' + _PLAIN,
    'angel':     'A Korean man in his thirties with a calm, clear, solemn voice, a heavenly messenger giving urgent instructions in a dream; steady and certain.' + _PLAIN,
    'host':      'A Korean woman in her twenties with a pure, bright, uplifting voice, joyfully proclaiming glory and peace, full of wonder.' + _PLAIN,
    'heaven':    'A Korean man in his sixties with a very deep, resonant, majestic voice; slow-measured but warm, like a loving father speaking from above.',
    'mary':      'A Korean young woman, about seventeen, with a soft but steady voice; humble, earnest and brave, a little trembling yet sure.' + _PLAIN,
    'shepherd':  'A Korean man in his forties, a rough rural shepherd with a husky, earthy voice, excited and eager, speaking to his friends.' + _PLAIN,
    'simeon':    'A Korean man in his eighties with a frail, cracked but joyful voice, an old man whose long wait is finally fulfilled; tearful gratitude.' + _PLAIN,
    'magi':      'A Korean man in his fifties, a learned foreign scholar with a dignified, polite, deliberate voice and curious eagerness.' + _PLAIN,
    'priest':    'A Korean man in his fifties, a stern religious official with a low, formal, cold and authoritative voice.' + _PLAIN,
    'herod':     'A Korean man in his sixties, a cunning king with a smooth, low, oily voice that hides suspicion behind politeness.' + _PLAIN,
    'nathanael': 'A Korean man in his twenties with a clear, youthful voice, bursting with sudden amazement and conviction.' + _PLAIN,
    'samaritan': 'A Korean woman in her thirties with a lively, slightly husky voice, breathless with excitement, calling her neighbors.' + _PLAIN,
    'official':  'A Korean man in his forties, a royal official with a refined voice strained by desperation, begging urgently for his dying son.' + _PLAIN,
    'peter':     'A Korean man in his thirties, a burly Galilean fisherman with a strong, rough, honest voice; impulsive and deeply sincere.' + _PLAIN,
    'centurion': 'A Korean man in his forties, a Roman army officer with a firm, low, disciplined voice, humble and respectful.' + _PLAIN,
    'crowd':     'A Korean man in his forties among a crowd, voice full of awe and amazement, speaking with excitement to the people around him.' + _PLAIN,
    'disciples': 'A Korean man in his twenties, a young disciple with a clear voice filled with wonder and a little fear.' + _PLAIN,
    'canaanite': 'A Korean woman in her forties, a desperate but quick-witted mother with a steady, warm, pleading voice.' + _PLAIN,
    'healed':    'A Korean man in his twenties, plain and blunt, who was born blind and now sees; simple, bold, unshakable voice.' + _PLAIN,
    'martha':    'A Korean woman in her thirties with a firm, mature voice, grieving yet speaking with strong faith.' + _PLAIN,
    'magdalene': 'A Korean woman in her twenties, voice trembling with tears turning into overwhelming joy, breathless.' + _PLAIN,
    'thomas':    'A Korean man in his thirties with a deep, earnest voice breaking with emotion, overwhelmed with awe.' + _PLAIN,
}
# 기준 음성을 만들 때 각 목소리가 읽는 문장
REF_TEXT = {
    'narrator': '갈릴리 언덕 마을 나사렛. 구약 어디에도 이름이 나오지 않는 작은 동네의 오후, 물동이를 내려놓은 소녀 마리아 앞에 빛이 섰다.',
    'jesus': '두려워하지 마라. 나다. 평안히 가거라, 네 믿음이 너를 살렸다.',
}
REF_DEFAULT = '정말입니다. 제 눈으로 똑똑히 보았어요. 그날 일은 평생 잊지 못할 겁니다.'

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
    return hashlib.sha1(f"{VOICES[clip['voice']]}\n{clip['text']}".encode()).hexdigest()[:10]


def filename(clip, h):
    key = clip['key']
    if key.startswith('who/'):  # 인물 이름은 한글이므로 지문으로 파일명을 만든다
        key = 'who/' + hashlib.sha1(key.encode()).hexdigest()[:8]
    return key.replace('/', '-') + '.' + h + '.mp3'

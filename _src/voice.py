"""낭독 음원 생성: data.json의 낭독 원고를 ElevenLabs(eleven_v3)로 읽어 assets/audio/와 audio.json을 만든다.

키는 다정 리딩북과 같은 환경 변수 ELEVENLABS_API_KEY에서 읽는다 (저장소에 두지 않는다). 변수가 없으면 키 없이
보내므로, 프록시가 xi-api-key 헤더를 붙여 주는 환경(Claude 클라우드의 네트워크 시크릿)에서도 쓸 수 있다. ffmpeg가 필요하다.
목소리 ID는 _src/voices/eleven.json에 둔다 (비밀 아님).

  python3 _src/voice.py --design              # ID가 없는 목소리를 VOICES 묘사로 만든다 (보이스 디자인)
  python3 _src/voice.py --clone jesus         # _src/voices/jesus.wav로 목소리를 복제해 만든다
  python3 _src/voice.py --sample DIR          # 목소리마다 샘플 한 조각씩 DIR에 만든다 (들어 보기용)
  python3 _src/voice.py                       # 바뀌었거나 없는 음원만 만든다 (중단해도 이어서 진행)
  python3 _src/voice.py --only e01            # 이름이 e01로 시작하는 조각만
"""
import argparse, base64, json, os, subprocess, tempfile, time, urllib.error, urllib.request, uuid, wave
import narration as N

here = os.path.dirname(os.path.abspath(__file__))
root = os.path.join(here, '..')
audio_dir = os.path.join(root, 'assets', 'audio')
voice_dir = os.path.join(here, 'voices')
ids_path = os.path.join(voice_dir, 'eleven.json')
API, RATE = 'https://api.elevenlabs.io/v1', 24000


def key_header():
    # 환경 변수가 없으면 키 없이 보낸다: Claude 클라우드 환경의 네트워크 시크릿처럼 프록시가 xi-api-key를 붙이는 경우
    k = os.environ.get('ELEVENLABS_API_KEY', '').strip()
    return {'xi-api-key': k} if k else {}


def call(path, body=None, files=None, raw=False):
    """ElevenLabs API 호출. body는 JSON, files는 multipart(필드 → 값 또는 (파일명, 바이트))."""
    headers = key_header()
    if files is not None:
        b = uuid.uuid4().hex
        parts = []
        for name, value in files:
            if isinstance(value, tuple):
                parts.append(f'--{b}\r\nContent-Disposition: form-data; name="{name}"; filename="{value[0]}"\r\n'
                             f'Content-Type: audio/wav\r\n\r\n'.encode() + value[1] + b'\r\n')
            else:
                parts.append(f'--{b}\r\nContent-Disposition: form-data; name="{name}"\r\n\r\n{value}\r\n'.encode())
        data = b''.join(parts) + f'--{b}--\r\n'.encode()
        headers['Content-Type'] = f'multipart/form-data; boundary={b}'
    else:
        data = json.dumps(body).encode() if body is not None else None
        headers['Content-Type'] = 'application/json'
    for attempt in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(API + path, data, headers), timeout=240) as r:
                out = r.read()
                return out if raw else json.loads(out)
        except urllib.error.HTTPError as e:
            msg = e.read().decode(errors='replace')[:300]
            if e.code == 401:
                raise SystemExit('ElevenLabs 키가 없거나 맞지 않습니다: ELEVENLABS_API_KEY 환경 변수나 api.elevenlabs.io 네트워크 시크릿(xi-api-key)을 확인하세요.')
            if e.code in (429, 500, 502, 503) and attempt < 3:  # 혼잡하면 잠시 쉬었다 다시
                time.sleep(5 * 2 ** attempt); continue
            raise SystemExit(f'ElevenLabs {e.code} {path}: {msg}')


def load_ids():
    return json.load(open(ids_path, encoding='utf-8')) if os.path.exists(ids_path) else {}


def save_ids(ids):
    json.dump(ids, open(ids_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=1, sort_keys=True)


def speak(clip, ids):
    """한 조각을 읽어 PCM(16bit, 24kHz) 바이트로 돌려준다."""
    return call(f"/text-to-speech/{ids[clip['voice']]}?output_format=pcm_{RATE}", {
        'text': clip['text'], 'model_id': N.ELEVEN_MODEL, 'language_code': 'ko',
        'voice_settings': {'stability': N.stability(clip['voice'])}}, raw=True)


def encode(pcm, out):
    """음량을 -16 LUFS로 맞추고 모노 mp3로 저장한다."""
    with tempfile.NamedTemporaryFile(suffix='.wav') as tmp:
        with wave.open(tmp.name, 'wb') as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(RATE); w.writeframes(pcm)
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', tmp.name,
                        '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '24000', '-ac', '1',
                        '-c:a', 'libmp3lame', '-b:a', '64k', out], check=True)


def write_manifest(clips, ids):
    have = {c['key']: N.filename(c, N.digest(c, ids)) for c in clips if c['voice'] in ids}
    have = {k: f for k, f in have.items() if os.path.exists(os.path.join(audio_dir, f))}
    json.dump({'clips': have}, open(os.path.join(root, 'audio.json'), 'w', encoding='utf-8'),
              ensure_ascii=False, separators=(',', ':'), sort_keys=True)
    return have


def design(voices, ids):
    for v in voices:
        if v in ids:
            continue
        r = call('/text-to-voice/design', {'voice_description': N.VOICES[v], 'model_id': 'eleven_ttv_v3',
                                           'text': N.SAMPLE_TEXT.get(v, N.SAMPLE_DEFAULT)})
        made = call('/text-to-voice', {'voice_name': f'그 길 · {v}', 'voice_description': N.VOICES[v],
                                       'generated_voice_id': r['previews'][0]['generated_voice_id']})
        ids[v] = made['voice_id']; save_ids(ids)
        print('목소리 만듦', v, flush=True)


def clone(v, ids):
    wav = os.path.join(voice_dir, f'{v}.wav')
    made = call('/voices/add', files=[('name', f'그 길 · {v}'), ('files', (f'{v}.wav', open(wav, 'rb').read()))])
    ids[v] = made['voice_id']; save_ids(ids)
    print('목소리 복제함', v, flush=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--only', help='이 접두어로 시작하는 조각만 만든다')
    ap.add_argument('--design', nargs='*', metavar='VOICE', help='묘사로 목소리를 만든다 (이름이 없으면 ID 없는 전부)')
    ap.add_argument('--clone', nargs='+', metavar='VOICE', help='_src/voices/VOICE.wav를 복제해 목소리를 만든다')
    ap.add_argument('--sample', metavar='DIR', help='목소리마다 샘플 한 조각을 DIR에 만든다')
    args = ap.parse_args()

    data = json.load(open(os.path.join(root, 'data.json'), encoding='utf-8'))
    clips = N.clips(data)
    used = sorted({c['voice'] for c in clips})
    ids = load_ids()
    if args.clone:
        for v in args.clone: clone(v, ids)
    if args.design is not None:
        design(args.design or used, ids)
    if args.clone or args.design is not None:
        return
    if args.sample:
        os.makedirs(args.sample, exist_ok=True)
        for v in used:
            if v in ids:
                c = next(c for c in clips if c['voice'] == v and not c['key'].startswith(('who/', 'say/')))
                encode(speak(c, ids), os.path.join(args.sample, f'{v}.mp3'))
                print('샘플', v, c['key'], flush=True)
        return

    missing = [v for v in used if v not in ids]
    if missing:
        print('목소리 ID가 없어 건너뜀:', ', '.join(missing), flush=True)
    os.makedirs(audio_dir, exist_ok=True)
    todo = [c for c in clips if c['voice'] in ids and (not args.only or c['key'].startswith(args.only))
            and not os.path.exists(os.path.join(audio_dir, N.filename(c, N.digest(c, ids))))]
    print(f'{len(clips)}개 중 {len(todo)}개 생성 ({sum(len(c["text"]) for c in todo)}자)', flush=True)
    t0 = time.time()
    for n, c in enumerate(todo, 1):
        encode(speak(c, ids), os.path.join(audio_dir, N.filename(c, N.digest(c, ids))))
        if n % 10 == 0 or n == len(todo):
            write_manifest(clips, ids)
            el = time.time() - t0
            print(f'{n}/{len(todo)}  경과 {el / 60:.0f}분, 남은 시간 약 {el / n * (len(todo) - n) / 60:.0f}분', flush=True)

    # 원고에서 사라졌거나 바뀐 조각의 옛 음원을 지운다
    keep = set(write_manifest(clips, ids).values())
    if not args.only and not missing:
        for f in os.listdir(audio_dir):
            if f.endswith('.mp3') and f not in keep:
                os.remove(os.path.join(audio_dir, f))


if __name__ == '__main__':
    main()

"""낭독 음원 생성: data.json의 낭독 원고를 OmniVoice로 읽어 assets/audio/와 audio.json을 만든다.

준비 (배포에는 필요 없다):
  pip install torch torchaudio omnivoice   # ffmpeg도 필요
실행:
  python3 _src/voice.py --refs-only     # 목소리별 기준 음성만 만들기 (_src/voices/)
  python3 _src/voice.py                 # 바뀌었거나 없는 음원만 만들기 (중단해도 이어서 진행)
  python3 _src/voice.py --only e01      # 이름이 e01로 시작하는 조각만
"""
import argparse, json, os, subprocess, tempfile, time
import narration as N

here = os.path.dirname(os.path.abspath(__file__))
root = os.path.join(here, '..')
audio_dir = os.path.join(root, 'assets', 'audio')
voice_dir = os.path.join(here, 'voices')


def encode(wav, out):
    """음량을 -16 LUFS로 맞추고 모노 mp3로 저장한다."""
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', wav,
                    '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '24000', '-ac', '1',
                    '-c:a', 'libmp3lame', '-b:a', '64k', out], check=True)


def write_manifest(clips):
    have = {c['key']: N.filename(c, N.digest(c)) for c in clips}
    have = {k: f for k, f in have.items() if os.path.exists(os.path.join(audio_dir, f))}
    json.dump({'clips': have}, open(os.path.join(root, 'audio.json'), 'w', encoding='utf-8'),
              ensure_ascii=False, separators=(',', ':'), sort_keys=True)
    return have


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--only', help='이 접두어로 시작하는 조각만 만든다')
    ap.add_argument('--refs-only', action='store_true')
    ap.add_argument('--steps', type=int, default=32, help='확산 단계 (16이면 빠르지만 품질이 조금 낮다)')
    args = ap.parse_args()

    import soundfile as sf, torch
    from omnivoice import OmniVoice
    torch.set_num_threads(os.cpu_count() or 1)
    device = 'cuda:0' if torch.cuda.is_available() else 'cpu'
    model = OmniVoice.from_pretrained('k2-fsa/OmniVoice', device_map=device,
                                      dtype=torch.float16 if device != 'cpu' else torch.float32)

    data = json.load(open(os.path.join(root, 'data.json'), encoding='utf-8'))
    clips = N.clips(data)
    os.makedirs(audio_dir, exist_ok=True)
    os.makedirs(voice_dir, exist_ok=True)

    prompts = {}
    def prompt(v):
        if v not in prompts:
            instruct, seed = N.VOICES[v]
            ref = os.path.join(voice_dir, f'{v}.wav')
            spec = os.path.join(voice_dir, f'{v}.txt')
            want = f'{instruct}|{seed}|{N.REF_TEXT}'
            if not os.path.exists(spec) or open(spec, encoding='utf-8').read() != want:
                torch.manual_seed(seed)
                audio = model.generate(text=N.REF_TEXT, language='ko', instruct=instruct, num_step=args.steps)
                sf.write(ref, audio[0], 24000)
                open(spec, 'w', encoding='utf-8').write(want)
                print('기준 목소리', v, instruct, flush=True)
            prompts[v] = model.create_voice_clone_prompt(ref_audio=ref, ref_text=N.REF_TEXT)
        return prompts[v]

    used = sorted({c['voice'] for c in clips})
    if args.refs_only:
        for v in used: prompt(v)
        return

    todo = [c for c in clips if (not args.only or c['key'].startswith(args.only))
            and not os.path.exists(os.path.join(audio_dir, N.filename(c, N.digest(c))))]
    print(f'{len(clips)}개 중 {len(todo)}개 생성', flush=True)
    t0 = time.time()
    for n, c in enumerate(todo, 1):
        torch.manual_seed(0)
        audio = model.generate(text=c['text'], language='ko', voice_clone_prompt=prompt(c['voice']), num_step=args.steps)
        with tempfile.NamedTemporaryFile(suffix='.wav') as tmp:
            sf.write(tmp.name, audio[0], 24000)
            encode(tmp.name, os.path.join(audio_dir, N.filename(c, N.digest(c))))
        if n % 10 == 0 or n == len(todo):
            write_manifest(clips)
            el = time.time() - t0
            print(f'{n}/{len(todo)}  경과 {el / 60:.0f}분, 남은 시간 약 {el / n * (len(todo) - n) / 60:.0f}분', flush=True)

    # 원고에서 사라졌거나 바뀐 조각의 옛 음원을 지운다
    keep = set(write_manifest(clips).values())
    for f in os.listdir(audio_dir):
        if f.endswith('.mp3') and f not in keep and not args.only:
            os.remove(os.path.join(audio_dir, f))


if __name__ == '__main__':
    main()

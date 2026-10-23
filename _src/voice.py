"""낭독 음원 생성: data.json의 낭독 원고를 Qwen3-TTS로 읽어 assets/audio/와 audio.json을 만든다.

준비 (배포에는 필요 없다):
  pip install torch torchaudio qwen-tts   # ffmpeg도 필요
실행:
  python3 _src/voice.py --refs-only     # 목소리별 기준 음성만 만들기 (_src/voices/, 없는 것만)
  python3 _src/voice.py                 # 바뀌었거나 없는 음원만 만들기 (중단해도 이어서 진행)
  python3 _src/voice.py --only e01      # 이름이 e01로 시작하는 조각만
"""
import argparse, gc, json, os, subprocess, tempfile, time
import narration as N

here = os.path.dirname(os.path.abspath(__file__))
root = os.path.join(here, '..')
audio_dir = os.path.join(root, 'assets', 'audio')
voice_dir = os.path.join(here, 'voices')
DESIGN, BASE = 'Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign', 'Qwen/Qwen3-TTS-12Hz-1.7B-Base'


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
    args = ap.parse_args()

    import soundfile as sf, torch
    from qwen_tts import Qwen3TTSModel
    torch.set_num_threads(os.cpu_count() or 1)
    device = 'cuda:0' if torch.cuda.is_available() else 'cpu'
    load = lambda name: Qwen3TTSModel.from_pretrained(
        name, device_map=device, dtype=torch.bfloat16 if device != 'cpu' else torch.float32)

    data = json.load(open(os.path.join(root, 'data.json'), encoding='utf-8'))
    clips = N.clips(data)
    os.makedirs(audio_dir, exist_ok=True)
    os.makedirs(voice_dir, exist_ok=True)
    ref_text = lambda v: N.REF_TEXT.get(v, N.REF_DEFAULT)
    ref_wav = lambda v: os.path.join(voice_dir, f'{v}.wav')

    # 1. 없는 기준 음성을 목소리 묘사로 만든다
    used = sorted({c['voice'] for c in clips})
    missing = [v for v in used if not os.path.exists(ref_wav(v))]
    if missing:
        design = load(DESIGN)
        for v in missing:
            torch.manual_seed(1)
            wavs, sr = design.generate_voice_design(text=ref_text(v), language='Korean', instruct=N.VOICES[v])
            sf.write(ref_wav(v), wavs[0], sr)
            print('기준 음성', v, flush=True)
        del design; gc.collect()
    if args.refs_only:
        return

    # 2. 기준 음성을 복제해 모든 문장을 읽는다
    todo = [c for c in clips if (not args.only or c['key'].startswith(args.only))
            and not os.path.exists(os.path.join(audio_dir, N.filename(c, N.digest(c))))]
    print(f'{len(clips)}개 중 {len(todo)}개 생성', flush=True)
    if not todo:
        write_manifest(clips)
        return
    base = load(BASE)
    prompts = {}
    t0 = time.time()
    for n, c in enumerate(todo, 1):
        v = c['voice']
        if v not in prompts:
            prompts[v] = base.create_voice_clone_prompt(ref_audio=ref_wav(v), ref_text=ref_text(v))
        torch.manual_seed(1)
        wavs, sr = base.generate_voice_clone(text=c['text'], language='Korean', voice_clone_prompt=prompts[v])
        with tempfile.NamedTemporaryFile(suffix='.wav') as tmp:
            sf.write(tmp.name, wavs[0], sr)
            encode(tmp.name, os.path.join(audio_dir, N.filename(c, N.digest(c))))
        if n % 10 == 0 or n == len(todo):
            write_manifest(clips)
            el = time.time() - t0
            print(f'{n}/{len(todo)}  경과 {el / 60:.0f}분, 남은 시간 약 {el / n * (len(todo) - n) / 60:.0f}분', flush=True)

    # 원고에서 사라졌거나 바뀐 조각의 옛 음원을 지운다
    keep = set(write_manifest(clips).values())
    if not args.only:
        for f in os.listdir(audio_dir):
            if f.endswith('.mp3') and f not in keep:
                os.remove(os.path.join(audio_dir, f))


if __name__ == '__main__':
    main()

"""큰 소리·영상 파일(낭독 assets/voice/ko/*.mp3, 배경음악 assets/music/*.mp3, 영상 assets/video/*.mp4)을 R2 버킷 theway에 같은 경로로 올린다.
호스팅 전송량을 아끼려고(사용자 2026-11) 이 파일들은 배포에서 빼고(firebase.json ignore) 앱은 R2 공개 주소에서 받는다(app.js MEDIA).
원본은 저장소에 그대로 둔다 — 녹음 도구(voice.mjs)·빌드(파일 해시)가 그대로 쓰게.
  python3 _src/tools/r2sync.py all            — 저장소의 파일 가운데 R2에 없거나 내용(md5 = ETag)이 다른 것을 올린다
  python3 _src/tools/r2sync.py changed <git 기준> — 그 기준 이후 바뀐 파일만 (배포 작업이 쓴다)
  python3 _src/tools/r2sync.py cors           — 버킷 CORS(우리 사이트에서 웹 오디오로 배경음악을 틀게)
열쇠: 환경변수 CLOUDFLARE_API_TOKEN·CLOUDFLARE_ACCOUNT_ID (GitHub 비밀값 CF_WORKERS_TOKEN·CF_ACCOUNT_ID — 저장소에 두지 않는다)"""
import glob, hashlib, json, os, subprocess, sys, time, urllib.request, urllib.parse
from concurrent.futures import ThreadPoolExecutor

BUCKET, PUB = 'theway', 'https://pub-7d2b46014d5b4769a48e210890df23c4.r2.dev'
TOKEN, ACCT = os.environ.get('CLOUDFLARE_API_TOKEN'), os.environ.get('CLOUDFLARE_ACCOUNT_ID')
API = 'https://api.cloudflare.com/client/v4/accounts/%s/r2/buckets/%s' % (ACCT, BUCKET)
GLOBS = ['assets/voice/ko/*.mp3', 'assets/music/*.mp3', 'assets/video/*.mp4']
KIND = {'.mp3': 'audio/mpeg', '.mp4': 'video/mp4'}
# 낭독 파일 이름은 글의 해시라 바뀌지 않는다(1년). 배경음악·영상은 같은 이름으로 다시 만들 수 있어 주소 뒤 ?v=로 새로 받게 하고 7일
CACHE = lambda p: 'public, max-age=31536000, immutable' if p.startswith('assets/voice/') else 'public, max-age=604800'
if not TOKEN or not ACCT: sys.exit('CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID가 필요합니다')

def remote_etag(path):
    try:
        r = urllib.request.urlopen(urllib.request.Request(PUB + '/' + urllib.parse.quote(path), method='HEAD'), timeout=30)
        return (r.headers.get('ETag') or '').strip('"')
    except Exception:
        return None
def put(path):
    data = open(path, 'rb').read()
    req = urllib.request.Request(API + '/objects/' + urllib.parse.quote(path, safe='/'), data=data, method='PUT', headers={
        'Authorization': 'Bearer ' + TOKEN, 'Content-Type': KIND[os.path.splitext(path)[1]], 'Cache-Control': CACHE(path)})
    # Cloudflare API는 5분에 1200번까지라 많이 올리면 429가 온다 — 기다렸다 다시
    for a in range(10):
        try:
            urllib.request.urlopen(req, timeout=120); return True
        except Exception as e:
            err = e
            time.sleep(30 if getattr(e, 'code', 0) == 429 else 3)
    print('::warning::못 올림', path, err); return False
def sync(paths, check=True):
    def one(p):
        if check and remote_etag(p) == hashlib.md5(open(p, 'rb').read()).hexdigest(): return 0
        return 1 if put(p) else -1
    with ThreadPoolExecutor(4) as ex: res = list(ex.map(one, paths))
    print('R2: %d개 중 %d개 올림, %d개 실패' % (len(paths), res.count(1), res.count(-1)))
    if res.count(-1): sys.exit(1)

mode = sys.argv[1] if len(sys.argv) > 1 else 'all'
if mode == 'cors':
    rules = {'rules': [{'allowed': {'origins': ['https://thewaymap.org', 'https://www.thewaymap.org', 'https://the-way-jesus.web.app', 'https://the-way-jesus.firebaseapp.com', 'http://localhost:8765'],
                                    'methods': ['GET', 'HEAD'], 'headers': ['*']}, 'exposeHeaders': ['ETag', 'Content-Length', 'Content-Range'], 'maxAgeSeconds': 86400}]}
    req = urllib.request.Request(API + '/cors', data=json.dumps(rules).encode(), method='PUT', headers={'Authorization': 'Bearer ' + TOKEN, 'Content-Type': 'application/json'})
    print(urllib.request.urlopen(req, timeout=30).read().decode()[:200])
elif mode == 'changed':
    base = sys.argv[2]
    out = subprocess.run(['git', 'diff', '--name-only', '--diff-filter=AM', base, 'HEAD', '--'] + GLOBS, capture_output=True, text=True).stdout.split()
    sync([p for p in out if os.path.exists(p)], check=False)
else:
    sync(sorted(p for g in GLOBS for p in glob.glob(g)))

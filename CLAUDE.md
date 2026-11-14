# 그 길 — 예수의 발자취 (작업 지침)

사복음서를 시간·장소 순서로 엮어 지도 위를 걸으며 61개 장면을 만나는 정적 웹앱. 배포: https://thewaymap.org (Firebase 맞춤 도메인, 2026-11 — 예전 주소 the-way-jesus.web.app도 그대로 열린다. 사이트 주소는 pages.py·share.mjs·booklet.mjs의 SITE와 app.html·index.html 머리에)

## 사용자와 일하는 방식
- **한국어로** 답한다. 사용자는 짧게 말하고("ㅇㅇ" = 네), 화면 캡처로 어색한 곳을 짚는다. 원인을 찾아 설명하고 고친다.
- 화면에 보이는 변경은 **직접 캡처해서 확인한 뒤** 보고한다(`_src/STAGE.md`의 확인 절차).
- 보고는 간결하게: 무엇을 했고, 어떻게 확인했고, 남은 문제가 무엇인지.

## 배포
- `main`에 push하면 GitHub Actions가 운영 사이트에 배포한다. **main에는 사용자가 확인한 것만** 올린다.
- 새 작업은 브랜치 → PR. PR마다 Actions가 미리보기 주소를 단다. 사용자가 보고 병합한다.
- 비밀키(서비스 계정 json 등)는 저장소에 두지 않는다. `firebase.json`의 ignore에 걸려 있지만 만들지도 말 것.

### GitHub 비밀값 (Settings → Secrets and variables → Actions)
값은 GitHub에만 있다. 바꾸거나 만료되면 같은 이름으로 다시 넣는다(지우지 말 것 — 모두 쓰는 중).

| 이름 | 하는 일 | 쓰는 곳 | 만드는 곳 |
|---|---|---|---|
| `FIREBASE_SERVICE_ACCOUNT_THE_WAY_JESUS` | 사이트 배포 | firebase-hosting-merge.yml(main), firebase-hosting-pull-request.yml(PR 미리보기) | Firebase 서비스 계정 |
| `GOOGLE_TTS_KEY` | 낭독 녹음(Chirp 3 HD) | firebase-hosting-merge.yml(관리자에서 고친 장면 다시 녹음), voice-run.yml(잠언 등) | Google Cloud API 키 |
| `GEMINI_API_KEY` | 시편 가사 시간 맞추기(lyricsync.mjs), Gemini 성우 녹음 | firebase-hosting-merge.yml | Google AI Studio |
| `CF_ACCOUNT_ID` | Cloudflare 계정 번호 | visits.yml, worker.yml | 대시보드 주소의 계정 ID |
| `CF_API_TOKEN` | 방문 수 읽기(Account Analytics: Read 하나) | visits.yml(매일 stats 가지의 visits.json) | Cloudflare API 토큰 'thewaymap.org' |
| `CF_WORKERS_TOKEN` | 관리자 Worker 올리기('Cloudflare Workers 편집' 템플릿, 영역 정책 없이) | worker.yml | Cloudflare API 토큰 'thewaymap workers' |
| `ADMIN_GH_TOKEN` | 관리자 Worker가 대신 GitHub에 저장(이 저장소만, Contents 읽기·쓰기 + Actions 읽기) | worker.yml이 Worker 비밀값 GH_TOKEN으로 넣음 | GitHub fine-grained 토큰 'theway admin worker' — 만료되면 새로 만들어 넣고 worker.yml을 손으로 돌린다 |

Cloudflare 토큰 목록의 다른 'Cloudflare Workers 편집'(2026-10)은 다른 서비스 것 — 건드리지 않는다.

## 구조
- `index.html` — 첫 주소의 랜딩(그 길 시리즈의 여정 카드·주제가 뮤직비디오·공유). 가볍게 따로 둔 페이지로, 글씨와 카드는 build.py가 만드는 `land.json`을 읽는다(마지막 카드 GoodNews — 4영리 — 는 다른 세션에서 만드는 `/goodnews/`로 잇는다. 화면 이름은 GoodNews). 예전 주소(`/?j=…`, `/#e05`)는 앱으로 넘긴다
- `app.html`, `style.css`, `app.js` — 앱 (지도 SVG, 장면 카드, 낭독, 말씀·대조표·퀴즈). 여정은 `app.html?j=<여정>`
- `qna.html` — 묻고 답하기(왜 만들었는지, 3D 무대를 왜 이렇게 그렸는지, 기능 활용법). 번역본은 `qna.<언어>.html`(같은 마크업, 화면 글씨는 `ui.<언어>.json`의 말 그대로), 링크(랜딩 첫 화면·설정 패널의 `.qna-link`)는 app.js가 언어에 맞춰 바꾼다. 기능이나 연출 원칙이 바뀌면 모든 언어를 함께 고친다
- `why.html` — '왜 기독교인가' 단원(부록이 아니라 그 길의 중요한 단원 — 화면에 '부록'이라 쓰지 않는다). 번역본은 `why.<언어>.html`(교단 이단 결의 목록은 한국어판에만 — 외국 상황을 몰라서). 여러 종교를 '사람이 올라가는 길 / 하나님이 내려오신 길'로 견주고, 배타적이라는 오해를 푼다. 끝에 '그다음 이야기'로 교회(탄생·역할·혼자 믿으면 안 되는 까닭·진짜와 가짜(진주)·고르는 법과 처음 가는 법)를 잇는다. 진짜와 가짜는 교회 이야기 안에 둔다 — 종교 비교 바로 뒤에 두니 다른 종교를 깎는 흐름으로 읽혔다(사용자, 2026-11). '가짜'는 다른 종교가 아니라 기독교의 이름을 빌린 가르침임을 먼저 밝힌다. 처음엔 그림과 물음만, 풀이는 '펼쳐 보기'로 접는다. 이 페이지만 밝은 종이 바탕, 그림은 펜 선 일러스트(`assets/img/why/`, `paint.mjs --raw`). 랜딩의 마지막 카드(build.py가 land.json에 넣는다)와 앱의 '그 길 시리즈' 목록 맨 끝(app.js, 어느 여정에서 보든), qna에서 언어에 맞는 why.<언어>.html로 잇는다. 카드 글씨는 ui.<언어>.json의 whyH·why·whyGo, 아이콘 `assets/why-icon.webp`(다른 여정 아이콘과 같은 결 — 흰 달빛 원 안 언덕의 굽은 길 끝에 비스듬히 선 작은 교회, paint.mjs로 그려 흰색으로 바꿈). 10분 영상 `assets/video/why.mp4`(한국어판 끝, 소책자 상자 위 — 맨 위에 두면 글을 안 읽을 것 같아서(사용자), 원본은 `_src/video/`의 render.mjs — 1280px로 줄여 올림, 영상을 틀면 배경음악은 멈춤). 배경음악 `assets/music/why.mp3`(약 3분, Lyria 3 Pro로 만든 피아노·현악 곡, 처음 누를 때 켜지고 오른쪽 아래 단추로 끈다 — 끈 선택은 theway-why-music에 기억). 소책자(A5 PDF) `assets/why-booklet.pdf`는 `node _src/tools/booklet.mjs [언어] [출력] [--print]`이 why.html을 그대로 열어 인쇄용으로 바꿔 뽑는다(접힌 풀이를 펼치고 장마다 새 쪽, 앞뒤 표지·차례(표지 안쪽 면, 쪽 번호는 한 번 뽑은 PDF에서 제목을 찾아 채움)·뒤표지는 '그 길 시리즈' 아홉 여정(land.json의 카드·아이콘)과 첫 화면 QR 하나 + 주소 thewaymap.org — QR 넷은 어수선했다(사용자 2026-11)·나눔 물음·판권면(펴낸이 김성수 — 밑에 작게 '대전 새로남교회 집사'만(교단명·회사는 빼기로, 담임목사가 아니라서 — 사용자 2026-11) · 펴낸 곳은 빈칸 — 나누는 교회·단체가 적거나 도장, 그림·말씀 안내는 겉표지가 아니라 뒤표지 안쪽 면(판권면) 맨 아래에 한 줄로 작고 옅게), 쪽수는 4의 배수로 메모 쪽을 채움, 교단 이단 결의 목록은 뺌, 쪽 번호·재단선은 `_src/tools/bookfinish.py`) — 웹 글을 고치면 다시 뽑는다. `--print`는 인쇄소용 `assets/why-booklet-print.pdf`(사방 3mm 도련 + 재단선). 8개 언어 모두 뽑는다(`why-booklet.<언어>.pdf`·`why-booklet.<언어>-print.pdf`, 한국어는 언어 없이, 언어별 표지·물음·판권 글은 booklet.mjs의 T 표, QR은 python segno·쪽 번호는 pypdf·reportlab). 각 언어 why 페이지 끝의 '소책자로 나누기' 상자에서 내려받는다(주소 뒤 ?v=는 PDF 해시 — 다시 뽑으면 바꾼다)
- 프롤로그 `e00`(잃어버린 동산, 창 2–3장): 61개 장면 앞에 따로 둔 장면. `_src/content-0.json`과 skeleton 맨 앞, build.py가 data의 `prologue`로 뺀다. 앱에서는 장면 번호 -1(`evAt`, `isPro`), 장면 수·퀴즈·도장·대조표에 들지 않는다. 처음 걷는 사람은 여기서 시작한다
- **시리즈(그 길 시리즈)**: 예수 여정 다음으로 모세와 여호수아·다윗·열왕기·바울·시편·잠언을 같은 엔진으로 만든다. 목록과 준비 여부는 `_src/series.json`(첫 화면 '그 길 시리즈'가 이것으로 그려지고, 준비 중인 여정을 누르면 후원 안내). 앱은 주소의 `?j=<여정>`으로 여정을 고른다. 맨 첫 주소(`/`)는 여정을 고르는 랜딩 `index.html`이고, 앱은 `app.html?j=<여정>`(없으면 예수, 공유 주소는 `/jesus`·`/moses`)
  - 예수 여정: 원본은 `_src/` 바로 아래, 결과는 맨 위의 `data*.json` (예전 그대로)
  - 다른 여정: 원본은 `_src/journeys/<여정>/`(같은 모양 — skeleton·places·periods·content-*.json, `journey.json`에 주인공 이름 `main`·대조표 `harmony`·녹음 `voice`, 여정 화면 글씨는 `i18n/ui.<언어>.json`으로 공통 글씨 위에 덧씌움, 책 이름표 `gospels`도 여기서), 결과는 `j/<여정>/data*.json`. 장면 id는 여정마다 겹치지 않게(모세 `m01`…)
  - 다른 여정도 같은 방식으로 녹음한다(Chirp 3 HD Aoede, `node _src/tools/voice.mjs --j moses all walks`, 같은 assets/voice/ko) — 앱은 녹음이 있는 문장만 녹음으로 튼다. 배경음악은 `_src/journeys/<여정>/music.json`(`node _src/tools/music.mjs --j moses`, 곡 이름 m-…, 모세 여정은 현대 다큐멘터리 영화음악 결). 진행 기록도 여정마다 따로(`theway-progress-<여정>`)
  - 관리자 페이지도 `admin.html?j=<여정>`으로 나뉜다(위쪽 고르기)
  - 설치 아이콘·앱 이름도 여정마다 따로(테마색): `j/<여정>/icon*.png·apple-touch-icon.png·manifest.webmanifest`, `node _src/tools/icons.mjs [여정…]`로 만든다(색 표는 그 안에). index.html 머리의 스크립트가 `?j=`에 맞춰 링크를 바꾼다
  - **GoodNews (복음, goodnews)**: 시리즈 맨 끝의 전도용 여정. 화면 이름은 'GoodNews (복음)' — '4영리'는 우리끼리 부르는 말이라 화면에 쓰지 않는다. 4영리의 네 흐름(하나님의 사랑 → 죄와 단절 → 예수 그리스도 → 믿음의 응답)을 이 앱의 말로 새로 쓴 네 장면(g01–g04, CCC 소책자 문장은 쓰지 않는다). 4영리처럼 **분명하게**: 장면마다 첫 문단에 '첫째, …'로 원리를 선언하고 핵심 구절을 낭독 안에서 직접 읽는다(말씀 탭은 낭독하지 않으므로), 둘째 문단은 성경 이야기와 둘째 구절, 셋째 문단은 다음 원리로 넘어가는 물음. 이 여정만 이야기는 '당신'에게 말하는 합니다체. g04의 셋째 문단은 영접 기도(skeleton의 `prayer`: 문단 번호 → 카드에서 기도 상자로). `journey.json`의 `quick`(첫 화면 없이 늘 첫 장면부터)·`next`(끝 화면에서 이어 걸을 여정 단추)·`where: false`(낭독에서 장소·때와 걸어가는 안내를 읽지 않고 제목만)·`narrator`(해설 성우를 바꿈, `eleven:<목소리 id>`면 일레븐랩스로 녹음 — 환경변수·GitHub 비밀값 `ELEVENLABS_API_KEY`). g01·g02는 장소 `eden` — 장소가 에덴인 장면은 프롤로그처럼 따로 떨어진 에덴 무대(app.js `onEden`)에 선다. 배경음악은 예수 여정의 곡을 다시 쓴다. 그림(카드 g0X·장면 assets/img/goodnews)은 '왜 기독교인가' 그림과 같은 결 — 크림 종이에 가는 펜 선, 작은 인물 하나와 꼭 필요한 것만 두고 나머지는 비운다 — 에 붉은 기운만 남긴다(초록은 회색으로). 그릴 때는 '왜 기독교인가' 그림만 참고로 넣는다(옛 그림을 구도 참고로 넣으면 배경이 꽉 차 결이 달라졌다) — 따뜻한 유화풍은 여호와의 증인 그림체와 비슷해 거부감이 든다는 사용자 판단(2026-11), 초록도 쓰지 않는다
  - **다윗 (david)**·**열왕기 (kings)**: 같은 틀의 지도+3D 무대 여정(39·41장면, 녹음 Aoede, 7개 언어). 장면마다 그 자리의 시편을 이어 둔다(skeleton의 `psalm` — 시편 여정의 노래가 올라오면 저절로 이어진다). 열왕기는 '선지자를 따라 걷는 두 왕국'(k01–k41), 지도는 바벨론까지(`map.meso`). 글 원칙(사용자): 대사 앞에 말하는 사람을 늘 밝히고, 다 쓰면 본문과 문장마다 대조한다(누가 무엇을 했고 말했는지가 바뀐 왜곡을 놓쳤었다), '머물러 생각하기'는 장면의 그림을 붙든 짧은 우리말 질문 하나 — 같은 틀을 되풀이하지 않는다. 번역 원본은 `i18n/extract.py` → ko.json, 검사 `i18n/check.py <언어>`, 그림 출처 `art.py`
  - **바울 (paul)**: 계획만 있다 — `_src/journeys/paul/PLAN.md`('복음이 땅끝까지' 42장면, 바울 서신 13편을 장면·지도·편지 탭에 잇는 것이 중심)
  - **잠언 (proverbs)**: 지혜를 따라 걷는 하루(아침 성문 → … → 밤 집, A안) + 다 걸은 뒤 '하루 한 장 31일 잠언'(B안)을 붙이기로 했다(2026-11 사용자). 지도 대신 솔로몬 때 예루살렘을 **사람 눈높이의 거리 무대**(`stage/street.js`와 `stage/street/` — 세트 하나에 파일 하나, 공통 도구·부품·그리는 쪽을 나눠 둔다. 파일이 커지지 않게 새 세트·부품은 따로 파일로; 대본 `stage/proverbs.js`, `stageOnly`)로 걷는다. 낭독은 아버지가 아들에게 들려주는 말(해라체)로, 잠언 구절은 낭독 안에서 직접 읽는다(말씀 낭독 안 함 원칙의 이 여정만 예외 — 사용자 결정). 잠언 구절(이야기 속 인용과 말씀 탭)은 **개역 문장에 아주 가깝게** — 문장 틀과 낱말은 개역대로 두고 끝맺음만 오늘 말로(…하느니라 → …한다). 개역개정을 그대로 베끼지는 않는다(저작권). 구절을 풀어 쓰지 말 것(사용자, 2026-11). 아버지의 말(구절 밖의 이야기)은 자연스러운 우리말로. 지혜는 성문에서 외치는 여인(은은한 빛)으로. 배경음악은 새로 만들지 않고 예수·모세 여정의 곡을 장면 결에 맞게 섞어 쓴다(사용자). 낭독은 남자 성우 Chirp 3 HD **Algieba**(0.95배속, journey.json `narrator: "Algieba"` — `:` 없는 이름이면 voice.mjs가 Chirp으로 녹음). 열쇠가 GitHub 비밀값에만 있어 Actions로 녹음한다: `claude/…` 브랜치에서 `_src/voice-run/proverbs`의 내용을 아무렇게나 바꿔 push하면 `.github/workflows/voice-run.yml`이 녹음이 없는 문장만 새로 녹음해 같은 브랜치에 커밋한다(장면을 더하거나 글을 고친 뒤 병합 전에). 녹음이 없는 문장은 브라우저 음성으로 읽힌다. 아직 p01(성문에서 부르는 지혜)·p02(들판의 개미 — 성 밖 들판 세트)·p03(장터의 저울 — 성문 광장 세트, `@set scales:cheat|fair`)·p04(친구의 집 — 네 방 집 안마당, 등잔)·p05(해 질 녘 골목 — 밤 골목, 살창)·p06(왕궁 앞에서 — 백향목 주랑, 아굴의 기도)·p07(꺼지지 않는 등불 — 우리 집, 31장)·p08(지혜의 집 — 새벽, 9장·4:18)로 하루 걷기 8장면이 다 찼다. B안 '하루 한 장 31일 잠언'은 `_src/journeys/proverbs/daily.json`(31장마다 제목·구절 셋·아버지의 한마디 — build.py가 journey.daily로 싣는다) → 앱 머리의 '하루 한 장' 탭(app.js `renderDaily`, journey에 daily가 있을 때만 보임): 오늘 날짜의 장을 펴고 31칸으로 옮겨 가며, '읽었어요'는 이 기기에만 이달 기록(`theway-daily-<여정>`). 끝 화면에서도 잇는다. 랜딩·시리즈 목록에 열어 두었다(series.json ready: true, 공유 주소 /proverbs). 7개 언어 번역(i18n/extract.py → ko.json, check.py, 하루 한 장 31일도 build.py가 갈아 끼운다)
  - **시편 (psalms)**: 노래가 태어난 자리를 따라 걷는 62편(여덟 묶음 — 태초와 출애굽·다윗의 노래·무너지는 집·솔로몬과 성전·올라가는 노래 120–134·무너짐과 돌아옴·예수님의 길을 비추는 시편·할렐루야, 2026-11 31편에서 늘림). **한국어 전용**, 3D 미니어처 연출 없이 지도를 따라가며 가사를 크게 띄우는 것이 중심(사용자, 2026-11). 노래는 사용자가 Suno로 시간 날 때 한 편씩 만든다 — 원본 `_src/journeys/psalms/songs.json`(편마다 자리·배경·노래 앞 짧은 낭독 intro·Suno 스타일 style·가사 lyrics, 가사는 개역의 뜻과 낱말에 가깝게 부르기 좋게, 개역개정을 그대로 베끼지 않음). 작업실 `studio.html`(관리자 토큰으로 들어가 스타일·가사 복사, mp3 올리기/바꾸기, 가사 시간 보기·탭으로 맞추기). 음원은 Cloudflare R2 버킷 `theway`의 `psalms/<id>-<내용 해시>.m4a`(앞으로 Suno에서 mp4로 받아 올린다 — mp4는 자리 표가 있어 일시정지 뒤에도 가사가 맞는다(사용자 2026-11), 예전 곡과 끝을 다듬어 다시 만든 곡은 .mp3)(공개 주소 pub-7d2b…r2.dev로 스트리밍, 그 길 전용 버킷 — 다정 리딩북 버킷은 비공개라 따로 둠, 서비스별로 폴더를 나눈다). 작업실이 R2 열쇠(그 버킷만 쓰는 토큰, 브라우저에만 기억)로 바로 올리고(`studio-r2.js`, 리딩북 lib/r2.mjs와 같은 서명), 저장소의 `assets/psalms/<id>.json`({src, audio, by: pending|auto|tap, lines:[{t,text}]})에 지금 노래를 적는다 → 배포 작업이 먼저 `_src/tools/xing.mjs`로 mp3 노래에 자리 표(Xing 헤더)를 붙여 R2에 다시 올리고(Suno mp3는 VBR인데 헤더가 없어 아이폰이 일시정지 뒤 위치를 잘못 셈해 가사 싱크가 틀어졌다 — 소리는 그대로 다시 담기만, json에 seek: true, wrangler·CF_WORKERS_TOKEN), `_src/tools/lyricsync.mjs`(Gemini가 노래를 듣고 줄마다 시작 시각)로 가사 시간을 맞춘다. 어긋나면 작업실에서 탭으로 고친다. 노래 앞 낭독은 여자 성우 Aoede(예수·모세 여정과 같은 해설 목소리 — 남자 Algieba로 녹음했다가 사용자가 여자가 낫다고 해서 바꿈, 2026-11)
  - 공유 주소도 여정마다: `thewaymap.org/<여정>`(예: /moses)은 그 여정의 미리보기 카드(og, 그림 `j/<여정>/og.jpg`)만 담은 `<여정>/index.html`로, 열면 `/app.html?j=<여정>`으로 넘긴다. `node _src/tools/share.mjs [여정…]`로 만든다(직접 고치지 말 것, 여정 없이 돌리면 첫 화면의 미리보기 그림 `assets/og-series.jpg`도). 앱의 공유 단추도 이 주소를 보낸다. 새 여정을 열 때 share.mjs의 표에 더한다
- `data.json` — `_src/`의 원본으로 `python3 _src/build.py`가 만든다. 직접 고치지 말 것 (작성 규칙 `_src/STYLE.md`)
- `_src/seo.py`(build.py 끝) — 검색엔진·AI 답변엔진용: qna·why 8개 언어에 대표 주소·hreflang·og·구조화 데이터(qna는 FAQPage, why는 Article), 랜딩에 WebSite·여정 ItemList와 꼬리말의 여정별 장면 목록 링크, 맨 위 `llms.txt`. 손으로 쓰는 페이지는 `<!--seo-->` 표시 사이만 다시 쓴다
- `s/`, `sitemap.xml` — 검색엔진용 장면 페이지(`s/e05.html`, 번역은 `s/e05.<언어>.html`, 목록 `s/index.html`)와 사이트맵. 예수 말고 장면이 있는 여정(모세·다윗·열왕기·바울·잠언·GoodNews)도 같은 꼴로 `s/<장면>.html`, 목록 `s/<여정>.html`(번역이 있는 언어만 — 잠언은 아직 한국어만, 시편은 노래라 뺀다). 사이트맵에는 첫 화면·여정 공유 주소·qna·why·목록·장면(그림 image:image 함께)을 언어 짝(hreflang)과 함께 싣는다. 앱은 `#e05` 주소라 검색에 장면이 따로 잡히지 않아, 글을 미리 써 둔 정적 페이지를 두고 앱으로 잇는다. build.py 끝에서 `_src/pages.py`가 만든다(직접 고치지 말 것). `robots.txt`가 사이트맵을 알린다
- 다국어: `data.<언어>.json`도 build.py가 만든다. 번역 원본은 `_src/i18n/` — `ko.json`(뽑기: `python3 _src/i18n/extract.py`)을 옮긴 `<언어>.json`과 화면 글씨 `ui.<언어>.json`. 새 언어는 app.js의 `LANGS`에도 더한다. 말씀은 기존 성경 번역을 베끼지 않고 새로 옮긴다
- `stage.js`, `stage/` — 3D 무대. **연출 가이드: `_src/STAGE.md`** (합의한 연출 원칙 포함 — 반드시 읽을 것)
- `assets/relief.webp`, `assets/relief-west.webp`(애굽 쪽), `assets/relief-hi/`, `assets/relief-hi-w/`(애굽 쪽), `assets/relief-city/` — 지형 음영과 확대용 정밀·도성 타일 (`_src/relief.py`로 생성)
- `assets/relief-med.webp`, `assets/relief-med-wide.webp`, `assets/relief-med-hi/`(장소 둘레만, 목록 tiles.json) — 바울 여정(`journey.map.med`)에서만 까는 지중해 바탕. 바다를 지도의 바다색(seaMed)으로 칠하고 레반트·애굽 자리는 투명하게 비워 원래 바탕이 비친다. `python3 _src/relief.py <캐시> med`. 뱃길은 skeleton의 장면 `via`로 해안·섬을 피한다
- `assets/jerusalem.webp` — 예루살렘 3D 도성 그림. 모형은 `stage/jerusalem.js`, 다시 그리기는 `node _src/tools/jerusalem.mjs`
- `assets/egypt-*.webp` — 애굽 표지 그림(기자·파로스 등대·헬리오폴리스). 모형은 `stage/egypt.js`, 다시 그리기는 `node _src/tools/jerusalem.mjs <url> giza`
- `terrain.js`, `assets/terrain/` — 3D 지형 모드. 지역별(갈릴리·유대·애굽, 모세 여정에서만 시내·네게브) 높이·색 그림을 장소 가까이 갈 때 불러온다. 지역 밖은 2D 음영을 평면으로 깐다. 자료는 `python3 _src/terrain.py <고도 캐시> [지역…]`로 만든다(시내·네게브는 정밀 타일이 없어 색을 고도에서 바로 칠한다)
- `assets/voice/ko/` — 한국어 녹음 낭독(문장별 mp3 + index.json). `GOOGLE_TTS_KEY=… node _src/tools/voice.mjs e01 …`로 만든다. 녹음이 없는 장면은 브라우저 음성으로 읽는다. 다음 장소로 걸어갈 때의 안내("○○에서 ○○로.")는 `voice.mjs walks`로 만든다. **낭독은 제목 줄과 이야기만** — 말씀(본문)은 소리 내어 읽지 않고 참고용 글로만 둔다(2026-11 사용자 결정, 말씀 녹음은 모두 지웠다. 다시 만들지 말 것)
- `assets/music/<곡>.mp3` — 낭독 밑에 깔리는 배경음악(2분 곡, 끝나면 천천히 줄었다가 처음부터). 장면별 곡 배정과 곡 설명은 `_src/music.json`, 만들기는 `GEMINI_API_KEY=… node _src/tools/music.mjs` (Lyria 3.5 — 예전 30초 곡은 너무 짧았다)
- `admin.html`, `admin.js` — 관리자 페이지(해설 문단·말씀 고치기, 녹음 듣기). 이 저장소에 쓰기 권한이 있는 GitHub 토큰으로만 들어간다. 저장하면 `_src/content-*.json`을 main에 바로 커밋하고, `firebase-hosting-merge.yml`이 data를 다시 만들고 바뀐 장면의 녹음(`voice.mjs changed`, GitHub 비밀값 `GOOGLE_TTS_KEY`)을 새로 만들어 배포한다. 글마다 목소리를 Gemini 성우로 고를 수 있다(말씀은 words의 `"tts": "gemini"`, 해설 문단은 장면의 `"storyTts": [문단 번호]`, 녹음 열쇠에 `gemini-`가 붙음, GitHub 비밀값 `GEMINI_API_KEY`, 하루 한도가 찬 모델은 건너뛰고 모두 막히면 Google 음성으로 대신)
- 관리자 로그인: **Google로 로그인**(Firebase 인증, 프로젝트 the-way-jesus — 데이터베이스 없음). GitHub 토큰은 Cloudflare Worker `theway-admin`(https://theway-admin.danmool78.workers.dev, 원본 `_src/worker/`, 올리기 `.github/workflows/worker.yml`)에만 두고, 허락된 구글 계정(이메일 SHA-256, wrangler.toml의 ALLOWED)일 때만 이 저장소의 GitHub API를 대신 부른다. 시편 작업실의 노래 올리기도 Worker가 R2 버킷에 바로(R2 열쇠 필요 없음). 토큰으로 들어가는 길은 없앴다(사용자) — 컴퓨터마다 토큰을 넣기 번거로웠다(사용자, 2026-11)
- 방문 수: 공개 페이지마다 Cloudflare Web Analytics 비컨(쿠키 없음, pages.py의 CF와 손으로 쓰는 페이지 끝). 매일 visits.yml이 stats 가지에 visits.json을 적고 관리자 페이지 맨 위에 어제·7일·30일 방문을 띄운다
- 글로 읽기: 도움말 '앱 없이 글로만 읽을 수 있나요?'(목록은 seo.py가 `<!--seo-reads-->`에)와 앱 설정의 '글로 읽기'가 s/의 여정별 장면 글 모음으로 잇는다(시편은 없음)
- 시대별 영역(누가 다스렸나): `_src/tools/realms.py`(shapely)가 `_src/realms/<여정>.json`을 만들고 build.py가 journey.realms로 싣는다(직접 고치지 말 것). 시대마다 영역 묶음(from: 그 시대가 시작하는 장면)을 지도에 옅은 색·점선으로 깔고, 장면이 넘어가 시대가 바뀌면 서서히 바꾼다(사용자, 2026-11). 예수: 헤롯 대왕 → 헤롯 사후 셋 → 로마 총독의 유대(AWMC 헤롯 왕국 경계 `_src/realms/awmc-herods_kingdom.geojson`, ODbL — 출처 밝힘). 다윗·열왕기: 사울 → 헤브론·이스보셋 → 통일 왕국(조공 나라) → 북이스라엘·남유다 → 앗수르 → 바벨론(표준 지도책 따라 어림). 모세와 여호수아: 애굽·가나안 성읍·미디안·아모리 왕 시혼과 옥 → 요단 동쪽을 얻음(m28) → 열두 지파(m39, 수 13–19). 바울: AD 50 무렵 로마 속주 — 지중해 지도는 바탕이 바다까지 칠해져 있어 영역을 그 위에 깐다. 바다는 realms.py가 육지 가림판 `assets/relief-med-mask.png`(relief-med에서 흙빛만)을 벡터로 바꿔 속주를 미리 잘라 둔다 — 앱에서 SVG mask로 자르면 지도를 움직일 때마다 다시 그려 버벅였다(2026-11). 지도 위 '영역' 단추로 끄고 켜며(theway-realms), 보이는 지도 칸 오른쪽 아래에 이름표(폰은 짧은 이름, 이름이 많으면 폰에서는 감춤). 3D 지형에서는 그리지 않는다. 영역마다 그 안에 짧은 이름을 그 색으로 바로 적는다(at — 지역 이름·장소 핀과 덜 겹치는 자리를 realms.py가 고름, 색만으로는 몰랐다 — 사용자). 손으로 찍은 구역은 모서리를 둥글게(Chaikin) — 자로 그은 네모 같았다
- 휠·두 손가락 확대·축소는 전체 경로 크기까지 줄어든다(maxViewW)
- 지도 확대·축소는 휠(폰은 두 손가락)로만 — +/− 단추는 뺐다(사용자, 2026-11)
- `assets/vendor/three.module.min.js` — three.js 0.160.0 (오프라인용으로 저장소에 포함)
- `_src/` — 원본 데이터와 도구 (배포 제외). `_src/tools/` — 캡처·문장 나누기 도구

## 3D 무대 진행 상황
61개 장면 모두 대본이 있고 main에 병합되어 운영에 배포되었다 (PR #1–#10).
고칠 때는 `_src/STAGE.md`의 원칙과 확인 절차를 따르고, 브랜치 → PR로 올린다.

## 코드 습관
- 주석은 한국어, 왜 그렇게 했는지를 짧게. 기존 코드의 밀도와 말투를 따른다.
- 빌드 도구 없음. 브라우저에서 바로 도는 ES 모듈.
- 커밋 메시지는 영어, 끝에 Co-Authored-By 줄.

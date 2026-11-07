# 그 길 — 예수의 발자취 (작업 지침)

사복음서를 시간·장소 순서로 엮어 지도 위를 걸으며 61개 장면을 만나는 정적 웹앱. 배포: https://the-way-jesus.web.app

## 사용자와 일하는 방식
- **한국어로** 답한다. 사용자는 짧게 말하고("ㅇㅇ" = 네), 화면 캡처로 어색한 곳을 짚는다. 원인을 찾아 설명하고 고친다.
- 화면에 보이는 변경은 **직접 캡처해서 확인한 뒤** 보고한다(`_src/STAGE.md`의 확인 절차).
- 보고는 간결하게: 무엇을 했고, 어떻게 확인했고, 남은 문제가 무엇인지.

## 배포
- `main`에 push하면 GitHub Actions가 운영 사이트에 배포한다. **main에는 사용자가 확인한 것만** 올린다.
- 새 작업은 브랜치 → PR. PR마다 Actions가 미리보기 주소를 단다. 사용자가 보고 병합한다.
- 비밀키(서비스 계정 json 등)는 저장소에 두지 않는다. `firebase.json`의 ignore에 걸려 있지만 만들지도 말 것.

## 구조
- `index.html` — 첫 주소의 랜딩(그 길 시리즈의 여정 카드·주제가 뮤직비디오·공유). 가볍게 따로 둔 페이지로, 글씨와 카드는 build.py가 만드는 `land.json`을 읽는다(마지막 카드 GoodNews — 4영리 — 는 다른 세션에서 만드는 `/goodnews/`로 잇는다. 화면 이름은 GoodNews). 예전 주소(`/?j=…`, `/#e05`)는 앱으로 넘긴다
- `app.html`, `style.css`, `app.js` — 앱 (지도 SVG, 장면 카드, 낭독, 말씀·대조표·퀴즈). 여정은 `app.html?j=<여정>`
- `qna.html` — 묻고 답하기(왜 만들었는지, 3D 무대를 왜 이렇게 그렸는지, 기능 활용법). 번역본은 `qna.<언어>.html`(같은 마크업, 화면 글씨는 `ui.<언어>.json`의 말 그대로), 링크(랜딩 첫 화면·설정 패널의 `.qna-link`)는 app.js가 언어에 맞춰 바꾼다. 기능이나 연출 원칙이 바뀌면 모든 언어를 함께 고친다
- `why.html` — '왜 기독교인가' 단원(부록이 아니라 그 길의 중요한 단원 — 화면에 '부록'이라 쓰지 않는다). 번역본은 `why.<언어>.html`(교단 이단 결의 목록은 한국어판에만 — 외국 상황을 몰라서). 여러 종교를 '사람이 올라가는 길 / 하나님이 내려오신 길'로 견주고, 배타적이라는 오해를 푼다. 끝에 '그다음 이야기'로 교회(탄생·역할·혼자 믿으면 안 되는 까닭·고르는 법과 처음 가는 법)를 잇는다. 처음엔 그림과 물음만, 풀이는 '펼쳐 보기'로 접는다. 이 페이지만 밝은 종이 바탕, 그림은 펜 선 일러스트(`assets/img/why/`, `paint.mjs --raw`). 랜딩의 마지막 카드(build.py가 land.json에 넣는다)와 앱의 '그 길 시리즈' 목록 맨 끝(app.js, 어느 여정에서 보든), qna에서 언어에 맞는 why.<언어>.html로 잇는다. 카드 글씨는 ui.<언어>.json의 whyH·why·whyGo, 아이콘 `assets/why-icon.webp`(다른 여정 아이콘과 같은 결 — 흰 달빛 원 안 언덕의 굽은 길 끝에 비스듬히 선 작은 교회, paint.mjs로 그려 흰색으로 바꿈). 배경음악 `assets/music/why.mp3`(약 3분, Lyria 3 Pro로 만든 피아노·현악 곡, 처음 누를 때 켜지고 오른쪽 아래 단추로 끈다 — 끈 선택은 theway-why-music에 기억). 소책자(A5 PDF) `assets/why-booklet.pdf`는 `node _src/tools/booklet.mjs [언어] [출력] [--print]`이 why.html을 그대로 열어 인쇄용으로 바꿔 뽑는다(접힌 풀이를 펼치고 장마다 새 쪽, 앞뒤 표지·QR(주소 글씨는 적지 않음 — 도메인 정하기 전)·나눔 물음·판권면(펴낸이 김성수 — 밑에 작게 대한예수교장로회(합동) 대전 새로남교회를 섬기고, 삼은케미칼·SSSOFT 대표 · 펴낸 곳은 빈칸 — 나누는 교회·단체가 적거나 도장), 쪽수는 4의 배수로 메모 쪽을 채움, 교단 이단 결의 목록은 뺌, 쪽 번호·재단선은 `_src/tools/bookfinish.py`) — 웹 글을 고치면 다시 뽑는다. `--print`는 인쇄소용(사방 3mm 도련 + 재단선, 저장소에는 두지 않음)
- 프롤로그 `e00`(잃어버린 동산, 창 2–3장): 61개 장면 앞에 따로 둔 장면. `_src/content-0.json`과 skeleton 맨 앞, build.py가 data의 `prologue`로 뺀다. 앱에서는 장면 번호 -1(`evAt`, `isPro`), 장면 수·퀴즈·도장·대조표에 들지 않는다. 처음 걷는 사람은 여기서 시작한다
- **시리즈(그 길 시리즈)**: 예수 여정 다음으로 모세와 여호수아·다윗·열왕기·바울·시편·잠언을 같은 엔진으로 만든다. 목록과 준비 여부는 `_src/series.json`(첫 화면 '그 길 시리즈'가 이것으로 그려지고, 준비 중인 여정을 누르면 후원 안내). 앱은 주소의 `?j=<여정>`으로 여정을 고른다. 맨 첫 주소(`/`)는 여정을 고르는 랜딩 `index.html`이고, 앱은 `app.html?j=<여정>`(없으면 예수, 공유 주소는 `/jesus`·`/moses`)
  - 예수 여정: 원본은 `_src/` 바로 아래, 결과는 맨 위의 `data*.json` (예전 그대로)
  - 다른 여정: 원본은 `_src/journeys/<여정>/`(같은 모양 — skeleton·places·periods·content-*.json, `journey.json`에 주인공 이름 `main`·대조표 `harmony`·녹음 `voice`, 여정 화면 글씨는 `i18n/ui.<언어>.json`으로 공통 글씨 위에 덧씌움, 책 이름표 `gospels`도 여기서), 결과는 `j/<여정>/data*.json`. 장면 id는 여정마다 겹치지 않게(모세 `m01`…)
  - 다른 여정도 같은 방식으로 녹음한다(Chirp 3 HD Aoede, `node _src/tools/voice.mjs --j moses all walks`, 같은 assets/voice/ko) — 앱은 녹음이 있는 문장만 녹음으로 튼다. 배경음악은 `_src/journeys/<여정>/music.json`(`node _src/tools/music.mjs --j moses`, 곡 이름 m-…, 모세 여정은 현대 다큐멘터리 영화음악 결). 진행 기록도 여정마다 따로(`theway-progress-<여정>`)
  - 관리자 페이지도 `admin.html?j=<여정>`으로 나뉜다(위쪽 고르기)
  - 설치 아이콘·앱 이름도 여정마다 따로(테마색): `j/<여정>/icon*.png·apple-touch-icon.png·manifest.webmanifest`, `node _src/tools/icons.mjs [여정…]`로 만든다(색 표는 그 안에). index.html 머리의 스크립트가 `?j=`에 맞춰 링크를 바꾼다
  - **GoodNews (복음, goodnews)**: 시리즈 맨 끝의 전도용 여정. 화면 이름은 'GoodNews (복음)' — '4영리'는 우리끼리 부르는 말이라 화면에 쓰지 않는다. 4영리의 네 흐름(하나님의 사랑 → 죄와 단절 → 예수 그리스도 → 믿음의 응답)을 이 앱의 말로 새로 쓴 네 장면(g01–g04, CCC 소책자 문장은 쓰지 않는다). 4영리처럼 **분명하게**: 장면마다 첫 문단에 '첫째, …'로 원리를 선언하고 핵심 구절을 낭독 안에서 직접 읽는다(말씀 탭은 낭독하지 않으므로), 둘째 문단은 성경 이야기와 둘째 구절, 셋째 문단은 다음 원리로 넘어가는 물음. 이 여정만 이야기는 '당신'에게 말하는 합니다체. g04의 셋째 문단은 영접 기도(skeleton의 `prayer`: 문단 번호 → 카드에서 기도 상자로). `journey.json`의 `quick`(첫 화면 없이 늘 첫 장면부터)·`next`(끝 화면에서 이어 걸을 여정 단추)·`where: false`(낭독에서 장소·때와 걸어가는 안내를 읽지 않고 제목만)·`narrator`(해설 성우를 바꿈, `eleven:<목소리 id>`면 일레븐랩스로 녹음 — 환경변수·GitHub 비밀값 `ELEVENLABS_API_KEY`). g01·g02는 장소 `eden` — 장소가 에덴인 장면은 프롤로그처럼 따로 떨어진 에덴 무대(app.js `onEden`)에 선다. 배경음악은 예수 여정의 곡을 다시 쓴다. 그림(카드 g0X·장면 assets/img/goodnews)은 '왜 기독교인가' 그림과 같은 결 — 크림 종이에 가는 펜 선, 작은 인물 하나와 꼭 필요한 것만 두고 나머지는 비운다 — 에 붉은 기운만 남긴다(초록은 회색으로). 그릴 때는 '왜 기독교인가' 그림만 참고로 넣는다(옛 그림을 구도 참고로 넣으면 배경이 꽉 차 결이 달라졌다) — 따뜻한 유화풍은 여호와의 증인 그림체와 비슷해 거부감이 든다는 사용자 판단(2026-11), 초록도 쓰지 않는다
  - **잠언 (proverbs)**: 지혜를 따라 걷는 하루(아침 성문 → … → 밤 집, A안) + 다 걸은 뒤 '하루 한 장 31일 잠언'(B안)을 붙이기로 했다(2026-11 사용자). 지도 대신 솔로몬 때 예루살렘을 **사람 눈높이의 거리 무대**(`stage/street.js`와 `stage/street/` — 세트 하나에 파일 하나, 공통 도구·부품·그리는 쪽을 나눠 둔다. 파일이 커지지 않게 새 세트·부품은 따로 파일로; 대본 `stage/proverbs.js`, `stageOnly`)로 걷는다. 낭독은 아버지가 아들에게 들려주는 말(해라체)로, 잠언 구절은 낭독 안에서 직접 읽는다(말씀 낭독 안 함 원칙의 이 여정만 예외 — 사용자 결정). 지혜는 성문에서 외치는 여인(은은한 빛)으로. 배경음악은 새로 만들지 않고 예수·모세 여정의 곡을 장면 결에 맞게 섞어 쓴다(사용자). 낭독은 남자 성우 Chirp 3 HD **Algieba**(0.95배속, journey.json `narrator: "Algieba"` — `:` 없는 이름이면 voice.mjs가 Chirp으로 녹음). 열쇠가 GitHub 비밀값에만 있어 Actions로 녹음한다: `claude/…` 브랜치에서 `_src/voice-run/proverbs`의 내용을 아무렇게나 바꿔 push하면 `.github/workflows/voice-run.yml`이 녹음이 없는 문장만 새로 녹음해 같은 브랜치에 커밋한다(장면을 더하거나 글을 고친 뒤 병합 전에). 녹음이 없는 문장은 브라우저 음성으로 읽힌다. 아직 p01(성문에서 부르는 지혜)·p02(들판의 개미 — 성 밖 들판 세트)·p03(장터의 저울 — 성문 광장 세트, `@set scales:cheat|fair`)·p04(친구의 집 — 네 방 집 안마당, 등잔)·p05(해 질 녘 골목 — 밤 골목, 살창)뿐이지만 랜딩·시리즈 목록에 열어 두었다(series.json ready: true, 공유 주소 /proverbs)
  - 공유 주소도 여정마다: `the-way-jesus.web.app/<여정>`(예: /moses)은 그 여정의 미리보기 카드(og, 그림 `j/<여정>/og.jpg`)만 담은 `<여정>/index.html`로, 열면 `/app.html?j=<여정>`으로 넘긴다. `node _src/tools/share.mjs [여정…]`로 만든다(직접 고치지 말 것, 여정 없이 돌리면 첫 화면의 미리보기 그림 `assets/og-series.jpg`도). 앱의 공유 단추도 이 주소를 보낸다. 새 여정을 열 때 share.mjs의 표에 더한다
- `data.json` — `_src/`의 원본으로 `python3 _src/build.py`가 만든다. 직접 고치지 말 것 (작성 규칙 `_src/STYLE.md`)
- `s/`, `sitemap.xml` — 검색엔진용 장면 페이지(`s/e05.html`, 번역은 `s/e05.<언어>.html`, 목록 `s/index.html`)와 사이트맵. 앱은 `#e05` 주소라 검색에 장면이 따로 잡히지 않아, 글을 미리 써 둔 정적 페이지를 두고 앱으로 잇는다. build.py 끝에서 `_src/pages.py`가 만든다(직접 고치지 말 것). `robots.txt`가 사이트맵을 알린다
- 다국어: `data.<언어>.json`도 build.py가 만든다. 번역 원본은 `_src/i18n/` — `ko.json`(뽑기: `python3 _src/i18n/extract.py`)을 옮긴 `<언어>.json`과 화면 글씨 `ui.<언어>.json`. 새 언어는 app.js의 `LANGS`에도 더한다. 말씀은 기존 성경 번역을 베끼지 않고 새로 옮긴다
- `stage.js`, `stage/` — 3D 무대. **연출 가이드: `_src/STAGE.md`** (합의한 연출 원칙 포함 — 반드시 읽을 것)
- `assets/relief.webp`, `assets/relief-west.webp`(애굽 쪽), `assets/relief-hi/`, `assets/relief-hi-w/`(애굽 쪽), `assets/relief-city/` — 지형 음영과 확대용 정밀·도성 타일 (`_src/relief.py`로 생성)
- `assets/jerusalem.webp` — 예루살렘 3D 도성 그림. 모형은 `stage/jerusalem.js`, 다시 그리기는 `node _src/tools/jerusalem.mjs`
- `assets/egypt-*.webp` — 애굽 표지 그림(기자·파로스 등대·헬리오폴리스). 모형은 `stage/egypt.js`, 다시 그리기는 `node _src/tools/jerusalem.mjs <url> giza`
- `terrain.js`, `assets/terrain/` — 3D 지형 모드. 지역별(갈릴리·유대·애굽, 모세 여정에서만 시내·네게브) 높이·색 그림을 장소 가까이 갈 때 불러온다. 지역 밖은 2D 음영을 평면으로 깐다. 자료는 `python3 _src/terrain.py <고도 캐시> [지역…]`로 만든다(시내·네게브는 정밀 타일이 없어 색을 고도에서 바로 칠한다)
- `assets/voice/ko/` — 한국어 녹음 낭독(문장별 mp3 + index.json). `GOOGLE_TTS_KEY=… node _src/tools/voice.mjs e01 …`로 만든다. 녹음이 없는 장면은 브라우저 음성으로 읽는다. 다음 장소로 걸어갈 때의 안내("○○에서 ○○로.")는 `voice.mjs walks`로 만든다. **낭독은 제목 줄과 이야기만** — 말씀(본문)은 소리 내어 읽지 않고 참고용 글로만 둔다(2026-11 사용자 결정, 말씀 녹음은 모두 지웠다. 다시 만들지 말 것)
- `assets/music/<곡>.mp3` — 낭독 밑에 깔리는 배경음악(2분 곡, 끝나면 천천히 줄었다가 처음부터). 장면별 곡 배정과 곡 설명은 `_src/music.json`, 만들기는 `GEMINI_API_KEY=… node _src/tools/music.mjs` (Lyria 3.5 — 예전 30초 곡은 너무 짧았다)
- `admin.html`, `admin.js` — 관리자 페이지(해설 문단·말씀 고치기, 녹음 듣기). 이 저장소에 쓰기 권한이 있는 GitHub 토큰으로만 들어간다. 저장하면 `_src/content-*.json`을 main에 바로 커밋하고, `firebase-hosting-merge.yml`이 data를 다시 만들고 바뀐 장면의 녹음(`voice.mjs changed`, GitHub 비밀값 `GOOGLE_TTS_KEY`)을 새로 만들어 배포한다. 글마다 목소리를 Gemini 성우로 고를 수 있다(말씀은 words의 `"tts": "gemini"`, 해설 문단은 장면의 `"storyTts": [문단 번호]`, 녹음 열쇠에 `gemini-`가 붙음, GitHub 비밀값 `GEMINI_API_KEY`, 하루 한도가 찬 모델은 건너뛰고 모두 막히면 Google 음성으로 대신)
- `assets/vendor/three.module.min.js` — three.js 0.160.0 (오프라인용으로 저장소에 포함)
- `_src/` — 원본 데이터와 도구 (배포 제외). `_src/tools/` — 캡처·문장 나누기 도구

## 3D 무대 진행 상황
61개 장면 모두 대본이 있고 main에 병합되어 운영에 배포되었다 (PR #1–#10).
고칠 때는 `_src/STAGE.md`의 원칙과 확인 절차를 따르고, 브랜치 → PR로 올린다.

## 코드 습관
- 주석은 한국어, 왜 그렇게 했는지를 짧게. 기존 코드의 밀도와 말투를 따른다.
- 빌드 도구 없음. 브라우저에서 바로 도는 ES 모듈.
- 커밋 메시지는 영어, 끝에 Co-Authored-By 줄.

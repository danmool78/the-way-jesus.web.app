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
- `index.html` — 첫 주소의 랜딩(그 길 시리즈의 여정 카드·주제가 뮤직비디오·공유). 가볍게 따로 둔 페이지로, 글씨와 카드는 build.py가 만드는 `land.json`을 읽는다(마지막 카드 4영리는 다른 세션에서 만드는 `/goodnews/`로 잇는다). 예전 주소(`/?j=…`, `/#e05`)는 앱으로 넘긴다
- `app.html`, `style.css`, `app.js` — 앱 (지도 SVG, 장면 카드, 낭독, 말씀·대조표·퀴즈). 여정은 `app.html?j=<여정>`
- `qna.html` — 묻고 답하기(왜 만들었는지, 3D 무대를 왜 이렇게 그렸는지, 기능 활용법). 번역본은 `qna.<언어>.html`(같은 마크업, 화면 글씨는 `ui.<언어>.json`의 말 그대로), 링크(랜딩 첫 화면·설정 패널의 `.qna-link`)는 app.js가 언어에 맞춰 바꾼다. 기능이나 연출 원칙이 바뀌면 모든 언어를 함께 고친다
- 프롤로그 `e00`(잃어버린 동산, 창 2–3장): 61개 장면 앞에 따로 둔 장면. `_src/content-0.json`과 skeleton 맨 앞, build.py가 data의 `prologue`로 뺀다. 앱에서는 장면 번호 -1(`evAt`, `isPro`), 장면 수·퀴즈·도장·대조표에 들지 않는다. 처음 걷는 사람은 여기서 시작한다
- **시리즈(그 길 시리즈)**: 예수 여정 다음으로 모세와 여호수아·다윗·열왕기·바울을 같은 엔진으로 만든다. 목록과 준비 여부는 `_src/series.json`(첫 화면 '그 길 시리즈'가 이것으로 그려지고, 준비 중인 여정을 누르면 후원 안내). 앱은 주소의 `?j=<여정>`으로 여정을 고른다. 맨 첫 주소(`/`)는 여정을 고르는 랜딩 `index.html`이고, 앱은 `app.html?j=<여정>`(없으면 예수, 공유 주소는 `/jesus`·`/moses`)
  - 예수 여정: 원본은 `_src/` 바로 아래, 결과는 맨 위의 `data*.json` (예전 그대로)
  - 다른 여정: 원본은 `_src/journeys/<여정>/`(같은 모양 — skeleton·places·periods·content-*.json, `journey.json`에 주인공 이름 `main`·대조표 `harmony`·녹음 `voice`, 여정 화면 글씨는 `i18n/ui.<언어>.json`으로 공통 글씨 위에 덧씌움, 책 이름표 `gospels`도 여기서), 결과는 `j/<여정>/data*.json`. 장면 id는 여정마다 겹치지 않게(모세 `m01`…)
  - 다른 여정도 같은 방식으로 녹음한다(Chirp 3 HD Aoede, `node _src/tools/voice.mjs --j moses all walks`, 같은 assets/voice/ko) — 앱은 녹음이 있는 문장만 녹음으로 튼다. 배경음악은 `_src/journeys/<여정>/music.json`(`node _src/tools/music.mjs --j moses`, 곡 이름 m-…, 모세 여정은 현대 다큐멘터리 영화음악 결). 진행 기록도 여정마다 따로(`theway-progress-<여정>`)
  - 관리자 페이지도 `admin.html?j=<여정>`으로 나뉜다(위쪽 고르기)
  - 설치 아이콘·앱 이름도 여정마다 따로(테마색): `j/<여정>/icon*.png·apple-touch-icon.png·manifest.webmanifest`, `node _src/tools/icons.mjs [여정…]`로 만든다(색 표는 그 안에). index.html 머리의 스크립트가 `?j=`에 맞춰 링크를 바꾼다
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
- `assets/music/<곡>.mp3` — 낭독 밑에 깔리는 배경음악(30초 반복 곡). 장면별 곡 배정과 곡 설명은 `_src/music.json`, 만들기는 `GEMINI_API_KEY=… node _src/tools/music.mjs` (Lyria 3 Clip, 리딩북과 같은 방식)
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

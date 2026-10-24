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
- `index.html`, `style.css`, `app.js` — 앱 (지도 SVG, 장면 카드, 낭독, 말씀·대조표·퀴즈)
- `data.json` — `_src/`의 원본으로 `python3 _src/build.py`가 만든다. 직접 고치지 말 것 (작성 규칙 `_src/STYLE.md`)
- 다국어: `data.<언어>.json`도 build.py가 만든다. 번역 원본은 `_src/i18n/` — `ko.json`(뽑기: `python3 _src/i18n/extract.py`)을 옮긴 `<언어>.json`과 화면 글씨 `ui.<언어>.json`. 새 언어는 app.js의 `LANGS`에도 더한다. 말씀은 기존 성경 번역을 베끼지 않고 새로 옮긴다
- `stage.js`, `stage/` — 3D 무대. **연출 가이드: `_src/STAGE.md`** (합의한 연출 원칙 포함 — 반드시 읽을 것)
- `assets/relief.webp`, `assets/relief-west.webp`(애굽 쪽), `assets/relief-hi/`, `assets/relief-hi-w/`(애굽 쪽), `assets/relief-city/` — 지형 음영과 확대용 정밀·도성 타일 (`_src/relief.py`로 생성)
- `assets/jerusalem.webp` — 예루살렘 3D 도성 그림. 모형은 `stage/jerusalem.js`, 다시 그리기는 `node _src/tools/jerusalem.mjs`
- `assets/egypt-*.webp` — 애굽 표지 그림(기자·파로스 등대·헬리오폴리스). 모형은 `stage/egypt.js`, 다시 그리기는 `node _src/tools/jerusalem.mjs <url> giza`
- `terrain.js`, `assets/terrain/` — 3D 지형 모드. 지역별(갈릴리·유대·애굽) 높이·색 그림을 장소 가까이 갈 때 불러온다. 지역 밖은 2D 음영을 평면으로 깐다. 자료는 `python3 _src/terrain.py <고도 캐시>`로 만든다
- `assets/vendor/three.module.min.js` — three.js 0.160.0 (오프라인용으로 저장소에 포함)
- `_src/` — 원본 데이터와 도구 (배포 제외). `_src/tools/` — 캡처·문장 나누기 도구

## 3D 무대 진행 상황
61개 장면 모두 대본이 있고 main에 병합되어 운영에 배포되었다 (PR #1–#10).
고칠 때는 `_src/STAGE.md`의 원칙과 확인 절차를 따르고, 브랜치 → PR로 올린다.

## 코드 습관
- 주석은 한국어, 왜 그렇게 했는지를 짧게. 기존 코드의 밀도와 말투를 따른다.
- 빌드 도구 없음. 브라우저에서 바로 도는 ES 모듈.
- 커밋 메시지는 영어, 끝에 Co-Authored-By 줄.

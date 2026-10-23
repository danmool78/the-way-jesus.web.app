# 그 길 — 예수의 발자취

사복음서를 시간·장소 순서로 엮어, 지도 위를 걸으며 예수의 생애 61개 장면을 만나는 웹 앱.
배포: https://the-way-jesus.web.app

- **여정**: 갈릴리·사마리아·유대 지도 위를 걷는 사람이 다음 장소로 이동하고(거리·도보 일수 표시), 도착하면 장면이 열립니다. 예루살렘 장면은 도성 안까지 확대됩니다.
- **장면**: 그림, 문학적 재구성 이야기, 예수의 말씀(현대어 재구성), 알고 가기, 묵상 질문, 확인 퀴즈.
- **낭독**: 미리 만든 AI 낭독 음원(내레이터·예수·인물별 목소리)을 재생하고, 음원이 없는 문장은 브라우저 음성 합성(Web Speech API)으로 읽습니다. *자동 여정*은 걷기 → 도착 → 낭독 → 다음 장소로 이어집니다.
- **말씀 / 대조표 / 퀴즈**: 말씀 모음과 검색, 사복음서 대조표, 시기별 퀴즈와 발자취 도장(기기에 저장).

빌드 도구 없는 정적 사이트입니다. 로컬 실행: `python3 -m http.server` 후 http://localhost:8000

## 데이터 편집
원본은 `_src/`(배포 제외)에 있습니다.

| 파일 | 내용 |
|---|---|
| `skeleton.json` | 장면 순서·시기·연대·장소·복음서 본문 범위 |
| `places.json`, `periods.json` | 장소 좌표, 시기 구분 |
| `content-*.json` | 이야기·말씀·배경·묵상·퀴즈 (작성 규칙: `STYLE.md`) |
| `images.json` | 장면별 그림 출처 |

수정한 뒤 `python3 _src/build.py`로 `data.json`을 다시 만듭니다. CI는 `data.json`이 원본과 어긋나면 배포를 멈춥니다.

## 낭독 음원
`_src/narration.py`가 앱이 읽는 모든 문장(장면 머리말·이야기·말씀·이동 안내, 540조각)을 녹음용 표기로 뽑고, 인물별 목소리 설계(`VOICES`)를 담고 있습니다.
`_src/voice.py`는 ElevenLabs(`eleven_v3`)로 음원을 만들어 `assets/audio/`와 `audio.json`에 씁니다. 키는 다정 리딩북과 같은 환경 변수 `ELEVENLABS_API_KEY`에서 읽습니다(저장소에 두지 않음).
인물 목소리는 묘사로 만들고(`--design`), 예수는 직접 고른 음성(`_src/voices/jesus.wav`)을 복제합니다(`--clone jesus`). 목소리 ID는 `_src/voices/eleven.json`에 남아 장면이 바뀌어도 같은 목소리로 읽습니다.
원고를 고친 뒤 `python3 _src/voice.py`를 다시 돌리면 바뀐 문장만 새로 만듭니다. `build.py`는 원고와 어긋난 음원 수를 알려 줍니다.

## 배포
`main`에 머지하면 GitHub Actions가 Firebase Hosting(`the-way-jesus`)에 배포하고, PR에는 미리보기 URL이 달립니다.
저장소 Secrets에 `FIREBASE_SERVICE_ACCOUNT_THE_WAY_JESUS`(Firebase 서비스 계정 JSON)가 필요합니다.

## 출처
그림은 제임스 티소(James Tissot, 1836–1902)의 「그리스도의 생애」 연작(브루클린 미술관 소장, 퍼블릭 도메인)을 위키미디어 공용에서 가져왔습니다. 연대는 학계의 대표적 추정(공생애 AD 26–30)을 따른 근사값입니다.

자매 앱: [열왕기 — 두 왕국의 연대기](https://kings-chronicle-app.web.app/)

# 3D 무대 연출 가이드 — "그 길"

지도 위 장소 핀에 미니어처 인물을 세우고, 낭독되는 **문장에 맞춰** 연기시킨다. 이 문서는 새 장면 대본을 쓰거나 무대를 고칠 때의 기준이다.

## 파일

| 파일 | 역할 |
|---|---|
| `stage.js` | 무대 실행: 렌더러·카메라·분위기(env)·동작 명령 적용(apply)·시선(gaze)·핀 위치 맞추기·실제 위경도(geo) 배치 |
| `stage/kit.js` | 공통 도구: 재질(mat), 회전체(lathe), 옷 주름(folds), 구(sphere), damp |
| `stage/people.js` | 인물 생성(makePerson, TYPES)과 배우(Actor: 자세·이동·시선·나타남) |
| `stage/props.js` | 소품(MAKERS)과 Prop(나타남·이동·상태) |
| `stage/scenes.js` | **장면 대본(SCRIPTS)** — 새 장면은 여기에 추가한다 |
| `app.js` | 낭독할 때 `stage:beat` 이벤트를 보낸다 (intro, p0…, w0…, end; 문장마다 s) |

`?beat=p1.2#e03` 처럼 주소에 붙이면 그 순간까지의 동작을 즉시 적용한 화면을 볼 수 있다(확인용).

## 연출 원칙 (사용자와 합의한 것)

1. **고통과 폭력은 그리지 않는다.** 골고다는 멀리 보이는 십자가 **실루엣**(얼굴·상처 없음, 허리에 천만 두른 윤곽)과 십자가를 향해 등을 보이고 무릎 꿇은 사람들, 어두워지는 빛으로만. 조롱·채찍질·못 박기·아이들의 죽음 같은 장면은 낭독만 하고 무대는 비우거나, 우는 사람들로만 표현한다. 이런 장면은 `solemn: true`(입·손짓을 멈추고 느리게).
2. **악한 존재는 형체만.** 시험하는 자는 두건 쓴 어두운 실루엣. 뿔 같은 표현 없음.
3. **사람은 늘씬하게.** 여인은 `slim` 체형(좁은 어깨, 잘록한 허리). 뚱뚱해 보이면 안 된다.
4. **말할 때는 서로 본다.** `speak` 자세의 인물을 다른 이들이 자동으로 바라본다(gaze). 멀리 있어 돌아보면 어색한 사람은 cast 옵션 `gaze: false`.
5. **지리를 맞춘다.** 물가·들판처럼 실제 지형과 맞아야 하는 것은 소품 옵션 `geo: [위도, 경도]`로 실제 지점에 세운다(지도 확대와 무관하게 그 자리). 핀에서 얼마만큼 떨어진 x, z로 놓으면 화면 크기에 따라 물속에 서는 일이 생긴다.
6. **갑자기 생기지 않는다.** 사람은 서서히 나타나고(show 0→1), 등장은 가능하면 걸어 들어오게 한다. 목자들처럼 멀리서 듣고 걸어오는 흐름을 살린다.
7. **본문에 충실하게.** 문장에 없는 일을 크게 지어내지 않는다. 무대는 낭독을 받쳐 주는 역할.

## 3D 지형 모드의 무대

2D 지도에서는 무대를 따로 그린 그림(캔버스)으로 핀 위에 겹친다. 3D 지형 모드에서는 무대 묶음을 **지형 장면(terrain.js) 안**의 장소(또는 `at`) 지점에 붙여, 지형·도성 모형과 같은 카메라와 깊이로 그린다 (`stage.js`의 `placeTerrain`).

- **축척은 고정**: 무대 1단위 = 지도 k단위. k는 장면에 내려앉는 거리에서 예전 무대와 같은 크기로 보이게 정한다(도성 안 ≈ 2, 바깥 ≈ 8). 당기고 물러나도 언덕·무덤·물과 지형의 관계는 그대로다.
- **땅에 붙은 소품**(`stage.js`의 `FIXED`: 언덕·물·풀·바위·집·무덤·나무·꽃…)은 그 축척 그대로, 각자 그 자리의 땅 높이에 앉는다.
- **사람과 사람 곁의 소품**(십자가·배·짐승·상·바구니…)은 멀리 물러날수록 최대 2배까지 함께 커진다(멀리서도 알아보게). 자리는 그대로, 크기만.
- 서는 높이는 `terrain3d.heightAt`: 땅, 호수면(배), 도성 모형의 성전 단 윗면 가운데 높은 것.
- 분위기(env)는 지형의 해·하늘빛으로 넘긴다(`window.stageTone`). 색조 필터(CSS)는 사람까지 어둡게 해 밤 장면이 묻혔다. 넓은 땅 전체가 받으므로 빛깔과 어둡기는 누그러뜨린다. 등잔·불빛은 축척만큼 닿는 거리를 늘린다.
- 지형 모드에서 비스듬히 내려다보는 각도는 지형 카메라를 따른다(따로 그릴 때보다 위에서 본다).
- `['@at', [위도, 경도], { x, z }]`: 3D 지형에서만 무대 바닥을 옮겨, 무대의 (x, z) 자리가 그 실제 지점에 오게 한다(낭독 중에는 천천히). 땅에 붙은 소품은 제자리에 남는다. `['@at', null]`로 되돌린다. 2D 무대는 움직이지 않으므로 2D용 소품(벼랑 등)은 `terrain: false`로 3D에서 숨긴다. 예: e16 나사렛 회당 → 낭떠러지 산.

## 대본 형식 (`stage/scenes.js`)

```js
e02: {
  env: 'night',        // 기본 분위기: day · dusk · night · storm · calm · overcast · dark · dawn(부활의 새벽) · glory(승천)
  wide: 1.3,           // 무대를 넓게(인물 크기는 그대로). 넓은 장면일수록 키운다
  scale: 0.85,         // 무대 전체 축소 (군중 장면 등)
  at: [32.888, 35.572], // 무대 바닥의 중심을 이 위경도로 옮긴다 (핀이 물가라 핀 앞이 물인 곳의 뭍 장면)
  solemn: false,
  props: { 이름: ['종류', x, z, { y, scale, size:[sx,sy,sz], rot, speed, geo, faceCenter, …소품별 옵션 }] },
  cast:  { 이름: ['유형', x, z, 바라보는 방향, { board, y, speed, silhouette, gaze:false }] },
  beats: {
    enter: [...],   // 낭독 없이 볼 때의 정지 장면(장면의 대표 순간). 즉시 적용
    intro: [...],   // 낭독이 시작될 때의 처음 상태. 즉시 적용
    'p0.1': [...],  // 첫 문단의 둘째 문장이 읽힐 때
    p2: [...],      // 셋째 문단 시작 (문장 키가 없을 때)
    w0: [...],      // 첫 말씀
    end: [...],     // 낭독이 끝났을 때
  },
},
```

- 좌표: x는 오른쪽(+)·왼쪽(−), z는 앞(+, 화면 아래)·뒤(−). 인물 키는 약 0.88. 화면 오른쪽이 동쪽, 위쪽(−z)이 북쪽.
- 바라보는 방향(look): 0 정면, +1 오른쪽, −1 왼쪽, ±2.5~3 등 돌림(십자가를 향해 등 보이기).
- 동작 명령: `[이름, 자세 또는 소품 상태, { x, z, y, look, show, item, board, geo, delay, to }]`
  - `to: '이름'`: 말하는(speak) 사람이 바라볼 상대. 없으면 가장 가까운 사람을 본다(곁의 제자 말고 앞의 사람에게 말씀하실 때 쓴다).
  - `delay`(ms): 같은 문장 안에서 순서를 줄 때. 낭독이 멈추거나 처음으로 돌아가면 취소된다.
  - 이름이 `'@env'`면 분위기 전환: `['@env', 'storm']`
  - 이동은 x/z를 주면 걸어간다. 걷는 동안엔 가는 쪽을, 멈추면 look 방향을 본다(놀라 뒷걸음질 `afraid`는 예외).
  - `board: '나귀'`면 그 소품의 등(deck)에 태운다(배·나귀·낙타). `board: null`이면 내린다.
- 문장 키는 `node _src/tools/beats.mjs e13`으로 확인한다.

### 프롤로그 (e00 · 잃어버린 동산)

61개 장면 앞의 창세기 장면. data의 `prologue`로 따로 실리고 앱에서는 장면 번호 -1이다(장면 수·퀴즈·도장·대조표 밖). 장소 `eden`은 `hidden`이라 지도에 핀이 없고, 무대는 대본의 `at`(전통적 추정지인 메소포타미아 남부, 유프라테스·티그리스가 만나는 곳)에 선다. 지도는 그 자리만큼 동쪽으로 강·만을 벡터로 더 그렸고, 프롤로그에서만 그 범위까지 끌 수 있다. 다음 장면(나사렛)으로는 두 번에 나눠 날아간다(둘을 함께 담고 → 무대로).
아담과 하와는 타락 전에는 빛의 실루엣(cast 옵션 `silhouette: 'light'`), 범죄한 뒤에는 어두운 실루엣, 마지막에 가죽옷 입은 모습 — 세 쌍을 `show`로 바꿔 낀다. 하나님은 모습 없이 빛(`beam`)으로만, 뱀은 가지에 감긴 그림자(`serpent`)로만.

### 인물 유형 (TYPES)
jesus, mary, joseph, angel, woman, woman2, mother, anna, john(젊은 제자, 수염 없음), disciple, peter, man, elder, shepherd, magus, magus2, magus3, king, soldier(창), pharisee, child, boyJesus, baptist, tempter, steward, groom, servant, crossed(십자가 위 예수 — 실루엣 전용), thief(실루엣 전용)

새 인물은 TYPES에 옷 색(robe/trim/mantle), 머리(hair, long, curls), 수염(beard), 베일(veil+inner)·머릿수건(hood+band), slim, height 등을 조합해 추가한다.

### 자세 (pose)
idle, walk(자동), speak, listen, afraid, kneel, pray, bless, raise, bow, look-up, sleep, carry(아기), ride(나귀에 걸터앉음), point, sit, sit-ground, rebuke, break(빵 떼기), shrug, cower, mourn, crucified, crucified-dead, hold-basket
손에 드는 물건(item): basket, doves, gift, baby

### 소품 (MAKERS)
manger, sheep, star, beam(내려오는 빛), fruittree(fruit/taken), lifetree(open/closed), serpent(rest/hiss), flamesword, host(하늘 군대), water(호수·강 — size로 길게), boat(deck), rain, grass, crowd(spots, state stand/sit, face, faceCenter), baskets, hill(지면 높이 제공), crosses, tomb(open/closed), temple, throne, house, donkey(deck), camel(deck), jackal, ox, dove(fly/rest, y), rocks, figtree, jars(empty/water/wine), feast, table(over), cage

새 소품은 `MAKERS`에 추가하고, 움직이는 것은 `new Prop(group, update)`의 update에서 처리한다. 사람이 올라설 수 있는 지형은 `P.heightAt(x, z)`를 제공하면 자동으로 그 위에 선다.

## 확인 절차 (묶음마다)

1. `node _src/tools/beats.mjs e13 e14 …`로 문장을 읽고 연출을 짠다.
2. `python -m http.server 8765`로 저장소 루트를 띄운다.
3. `node _src/tools/sheet.mjs http://127.0.0.1:8765 <출력폴더> e13:enter e13:p1.2 …`로 주요 순간을 찍고, `python _src/tools/tile.py`로 한 장에 모아 **직접 본다.** 자세히 볼 때는 `DPR=3`.
4. 겹침, 땅에 묻힘, 엉뚱한 방향, 크기 비례, 화면 밖으로 나감, 지형과 어긋남을 고친다.
5. 브랜치로 올리고 PR을 만든다 → GitHub Actions가 미리보기 주소를 PR에 단다. 사용자가 확인하고 병합하면 운영에 배포된다.

## 이미 겪은 함정

- **허리를 숙이면 끊어져 보임** → 상체는 허리 높이의 축(torso)에서 돌린다.
- **무릎 꿇으면 땅에 묻히거나 치마가 그릇처럼** → 꿇은 치마는 별도 모양으로 모핑한다(크기 늘이기 금지).
- **나타날 때 옷이 비침** → 반투명 대신 alphaHash로 나타나게 한다.
- **언덕에 다리가 묻힘** → 지형 소품은 heightAt을 제공.
- **물결 골이 바닥 아래로** → 물은 y를 띄운다(0.05~0.07).
- **배·짐승 방향** → 배는 도착하면 옆모습으로, 짐승(directional)은 머리가 앞.
- **물가 핀 앞의 뭍 장면이 물 위에** → 가버나움처럼 핀이 물가에 있으면 핀 앞(+z)이 호수다. 집·마을 장면은 대본의 `at`으로 무대를 뭍의 실제 지점에 옮긴다.
- **확대하면 지형이 흐림** → 정밀 지형 타일(assets/relief-hi)은 확대할 때만, 도성 초정밀 타일(assets/relief-city)은 예루살렘까지 들어갈 때만 불러온다. 확대가 시작될 때 도착 화면의 타일을 미리 받고, 다 받은 타일은 서서히 나타난다.
- **예루살렘 장면의 건물** → 도성까지 확대하면 지도에 3D 도성(`assets/jerusalem.webp`)이 깔린다. 성전·성벽 소품을 무대에 따로 세우면 지도의 성전과 어긋나 겹쳐 보이므로, 성전 핀 장면에는 `temple` 소품을 두지 않는다. 방향도 지도를 따른다(감람산에서 도성은 서쪽 = 화면 왼쪽).
- **3D 지형에서 도성 성벽 위에 걸친 언덕·무덤** → 무대는 지도 위에 실제보다 훨씬 크게(멀리 물러날수록 더) 그려진다. 성벽 바로 곁의 장소(골고다)는 `at`으로 무대를 성 밖 빈 들로 조금 옮기고, 언덕은 낮고 작게. 언덕 소품의 `soft: true`는 밑동을 투명하게 풀어 땅에 녹아 보이게 한다. 도성 모형에 이미 있는 집은 소품 옵션 `terrain: false`로 3D 지형 모드에서만 숨긴다.

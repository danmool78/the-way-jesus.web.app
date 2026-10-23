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

## 대본 형식 (`stage/scenes.js`)

```js
e02: {
  env: 'night',        // 기본 분위기: day · dusk · night · storm · calm · overcast · dark
  wide: 1.3,           // 무대를 넓게(인물 크기는 그대로). 넓은 장면일수록 키운다
  scale: 0.85,         // 무대 전체 축소 (군중 장면 등)
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
- 동작 명령: `[이름, 자세 또는 소품 상태, { x, z, y, look, show, item, board, geo, delay }]`
  - `delay`(ms): 같은 문장 안에서 순서를 줄 때. 낭독이 멈추거나 처음으로 돌아가면 취소된다.
  - 이름이 `'@env'`면 분위기 전환: `['@env', 'storm']`
  - 이동은 x/z를 주면 걸어간다. 걷는 동안엔 가는 쪽을, 멈추면 look 방향을 본다(놀라 뒷걸음질 `afraid`는 예외).
  - `board: '나귀'`면 그 소품의 등(deck)에 태운다(배·나귀·낙타). `board: null`이면 내린다.
- 문장 키는 `node _src/tools/beats.mjs e13`으로 확인한다.

### 인물 유형 (TYPES)
jesus, mary, joseph, angel, woman, woman2, mother, anna, john(젊은 제자, 수염 없음), disciple, peter, man, elder, shepherd, magus, magus2, magus3, king, soldier(창), pharisee, child, boyJesus, baptist, tempter, steward, groom, servant, crossed(십자가 위 예수 — 실루엣 전용), thief(실루엣 전용)

새 인물은 TYPES에 옷 색(robe/trim/mantle), 머리(hair, long, curls), 수염(beard), 베일(veil+inner)·머릿수건(hood+band), slim, height 등을 조합해 추가한다.

### 자세 (pose)
idle, walk(자동), speak, listen, afraid, kneel, pray, bless, raise, bow, look-up, sleep, carry(아기), ride(나귀에 걸터앉음), point, sit, sit-ground, rebuke, break(빵 떼기), shrug, cower, mourn, crucified, crucified-dead, hold-basket
손에 드는 물건(item): basket, doves, gift, baby

### 소품 (MAKERS)
manger, sheep, star, beam(내려오는 빛), host(하늘 군대), water(호수·강 — size로 길게), boat(deck), rain, grass, crowd(spots, state stand/sit, face, faceCenter), baskets, hill(지면 높이 제공), crosses, tomb(open/closed), temple, throne, house, donkey(deck), camel(deck), jackal, ox, dove(fly/rest, y), rocks, figtree, jars(empty/water/wine), feast, table(over), cage

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
- **확대하면 지형이 흐림** → 정밀 지형 타일(assets/relief-hi)은 확대할 때만 불러온다. 도성 확대에서는 지형을 끈다.

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
| `stage/moses.js` | 모세와 여호수아 여정의 대본(MOSES) — scenes.js가 SCRIPTS에 합친다. 장면 id(m01…)는 여정마다 겹치지 않게 |
| `stage/goodnews.js` | 기쁜 소식 여정의 대본(GOODNEWS, g01–g04) |
| `stage/proverbs.js` | 잠언 여정의 대본(PROVERBS, p01…) — 거리 무대 |
| `stage/street.js` | 거리 높이 세트(솔로몬 때 예루살렘): 성문 광장 등, 하늘빛 표(SKIES) |
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

61개 장면 앞의 창세기 장면. data의 `prologue`로 따로 실리고 앱에서는 장면 번호 -1이다(장면 수·퀴즈·도장·대조표 밖). 장소 `eden`은 `hidden`이라 지도에 핀이 없고, 무대는 대본의 `at`(전통적 추정지인 메소포타미아 남부, 유프라테스·티그리스가 만나는 곳)에 선다. 본 지도와 이어지지 않는 따로 떨어진 2D 무대다: 바탕은 화면을 꽉 채우는 푸른 들(`assets/relief-east.webp`, `python3 _src/relief.py <캐시> east`)에 두 강과 만을 벡터로 그리고, 화면은 그 안(app.js의 `EDEN`)에만 머문다. 3D 버튼과 전체 경로는 막고, 첫 장면과 오갈 때는 날아가지 않고 새로 시작하듯 바로 바꾼다.
아담과 하와는 타락 전에는 벌거벗은 빛의 실루엣(인물 `adam`·`eve`의 `nude` — 옷 없는 몸의 윤곽, cast 옵션 `silhouette: 'light'`), 범죄한 뒤에는 무화과 잎을 두른 어두운 실루엣(`adamFig`·`eveFig`, 창 3:7), 마지막에 가죽옷 입은 모습 — 세 쌍을 `show`로 바꿔 낀다. 하나님은 모습 없이 빛(`beam`)으로만, 뱀은 가지에 감긴 그림자(`serpent`)로만.

### 모세와 여호수아 여정
- **애굽 사람과 히브리 사람을 한눈에 가른다.** 애굽 사람은 맨 윗몸에 흰 아마포 허리치마(`kilt`), 검은 단발 가발(`wig`, 여인은 `wigLong`), 넓은 목걸이(`collar: [색…]`), 바로는 줄무늬 네메스 두건(`nemes: [바탕, 줄]`). 히브리 사람은 긴 옷·수염·머릿수건.
- 하나님은 모습 없이 불꽃(`bush`)·빛(`beam`)·기둥(`pillar`)으로만. 애굽 사람을 친 일, 맏아들의 죽음, 바다에 잠긴 병거는 그리지 않는다(사라지게 하거나 어둠·기도로).
- 시내 반도·미디안은 3D 지형 지역이 없어, 3D 모드에서는 2D 바탕(`assets/relief-south.webp`)을 평평하게 깐다(`terrain.js`의 SOUTH, 여정 지도에 `south`가 있을 때만).
- 죽음은 그리지 않는다: 아론(호르산)과 모세(느보산)는 산 위의 빛 속에서 서서히 사라진다. 고라의 무리를 삼킨 땅·불, 불뱀에 물림, 메추라기 재앙도 사라짐·어둠·엎드림으로만.
- 무대 안에 강을 그리면 지도의 요단과 방향이 어긋난다(모압 평지). 지도에 이미 있는 강은 무대에 다시 그리지 않는다.
- **장면 안의 이동**: 이야기가 장면의 장소 아닌 곳에서 시작하거나 낭독 중에 옮겨 가는 장면은 skeleton에 `start`(시작하는 곳)와 `stops`(`[{ at: 문장 키, to: 장소, walk: true면 걸어가고 아니면 장면만 바꿈 }]`)를 둔다. 앞 장면에서 걸어오면 start에 닿고, 무대·걷는 사람·장소 칩·카메라도 거기서 시작한다. 걸어가는 동안 무대는 잠시 숨는다(app.js `moveWithin`). 낭독이 끝나면(end) 장면의 장소로, 다시 듣거나 멈추면 start로 돌아간다. enter 장면도 start의 모습으로. 예: m03 라암셋 → 미디안, e05 베들레헴 → 애굽 → (학살) 베들레헴, e06 애굽 → 나사렛
- 산 아래 무리(crowd)는 가운데를 비우고 양옆에 둔다 — 낮은 시점이라 앞의 무리가 산·제단·성막을 다 가렸다.
- 모세 여정의 intro 앞에는 처음 자리로 되돌리는 명령이 자동으로 붙는다(`stage/moses.js` 끝). 말씀(w…)에서 말하는 사람은 앞 문단에서 사라졌어도 `show: 1`로 다시 세운다. `node _src/tools/stagecheck.mjs m01 …`로 낭독 순서를 흉내 내 이 두 가지를 점검한다.
- 장면 확인: `sheet.mjs`는 m으로 시작하는 장면이면 `?j=moses`로 연다. `beats.mjs`도 여정 데이터를 함께 읽는다.

### 기쁜 소식 여정 (stage/goodnews.js)
- 네 장면: g01 에덴의 빛(하나님의 사랑) → g02 어두운 실루엣과 닫힌 동산(죄와 단절) → g03 고치시는 예수, 멀리 보이는 십자가 윤곽, 빈 무덤과 부활하신 예수(유일한 길) → g04 저녁의 한 집 문 앞에 서서 두드리시는 예수(계 3:20), 기도의 '문을 엽니다'에서 문이 열려 등불빛이 번지고(house 소품의 state 'open', 옵션 `door: true`일 때만 불빛) 집 안의 사람이 나와 무릎 꿇는다.
- 에덴 두 장면은 e00과 같은 자리(`at`)·같은 배우. 장소가 `eden`이면 앱이 본 지도 대신 에덴 무대에 세운다(프롤로그와 같다).
- intro 앞에 처음 자리로 되돌리는 명령이 자동으로 붙는다(moses.js와 같은 방식).

### 잠언 여정 — 거리 무대 (stage/street.js, stage/proverbs.js)
- 지도 핀 위의 미니어처가 아니라 **사람 눈높이의 실제 크기 세트**를 화면 가득 그린다. 대본에 `street: 'gate'`(세트 이름, street.js의 `STREETS`)가 있으면 stage.js가 거리 무대 모드로 바뀐다(3D 지형에 들어가지 않음, 여정은 `stageOnly`).
- 축척은 사람 키 0.88 ≈ 1.7m, 1m ≈ 0.52단위(`M`). 세트는 다듬은 돌·회벽·포석을 캔버스로 그린 결(texture)을 쓴다 — 상자 그대로는 장난감처럼 보였다.
- 카메라: 대본의 `cams: { 이름: { pos, at, fov } }`(fov는 **가로** 시야각 — 세로로 긴 폰에서도 광장 폭이 같게), 처음 자리 `cam`, 동작 명령 `['@cam', 이름]`으로 천천히 옮겨 간다. 장면 카드가 가리는 쪽(넓은 화면은 오른쪽, 폰은 아래)을 비켜 보이는 곳 가운데에 오게 그린다(setViewOffset).
- 하늘빛·안개·해의 자리는 분위기(env)마다 `SKIES`. 아침 해는 동쪽(감람산 쪽)에서.
- 성문 광장(gate): 여섯 방 성문(안쪽 얼굴 z ≈ -7.28)과 돌 의자, 성벽, 네 방 집, 동쪽 좌판(항아리·곡식·저울)과 서쪽 천 좌판, 올리브나무, 멀리 감람산. 인물: father(아버지), son(아들), wisdom(성문에서 외치는 지혜 — 은은한 빛).
- 성 밖 들판(field): 성 쪽(-z)으로 뻗은 길, 왼쪽은 거두는 이웃의 밀밭(앞쪽은 그루터기와 밀단), 오른쪽은 가시덤불과 거친 풀에 덮이고 돌담이 무너진 게으른 사람의 밭(올리브나무 그늘에 낮잠 자는 주인 — 그 둘레와 길에서 보이는 틈은 덤불을 비운다), 길가 개미집에서 개미 행렬이 낟알을 나른다(세트의 `update`가 매 프레임 움직인다). 뒤로 계단식 축대가 언덕을 올라 100m 남짓 위에 성벽, 그 너머 성전과 왕궁. 밀·덤불·돌은 InstancedMesh 하나씩으로 그린다.
- 세트 안의 움직이는 것은 동작 명령 `['@set', '이름:상태']`로 바꾼다(세트의 `cmd`). 성문 광장의 저울: `scales:fair`(수평)·`scales:cheat`(속이는 추 — 곡식 쪽이 들림)·`scales:heavy`. 접시는 들보가 기울어도 늘 수평으로 매달린다.
- **걷는 방향**: 미니어처 무대는 걸을 때 옆모습(±1.35)으로만 돌고 대화 상대도 앞쪽(±1.15)으로만 본다. 거리 무대는 사방에서 보므로 사람이 실제로 가는 쪽·상대 쪽으로 온전히 돈다(stage.js가 배우에 `realWalk`, people.js). 그대로 두면 성문 쪽으로 가는 사람이 옆으로 게걸음 쳤다.
- **깜박임(z-fighting)**: 세트의 면이 같은 자리에 겹치지 않게 한다(두 담·축대와 언덕·기둥벽과 탑이 겹쳐 번쩍였다). 바닥 위에 덧까는 면은 `overlay`(polygonOffset)로 깐다. 거리 무대의 near는 0.15.
- 멀리까지 보이도록 거리 무대에서는 카메라의 far를 400으로 늘린다(미니어처 무대는 50 — 그대로 두면 성벽이 잘렸다).
- 장면 사이 사람들(장사꾼·장로)은 `gaze: false` — 말하는 사람이 멀리 있어도 모두 돌아보면 어색했다. 말하는 사람(speak)은 한 장면에 한 명만 두어야 시선이 엉키지 않는다.
- 세트만 따로 보는 도구: `/_src/tools/street.html?view=eye|high|low&env=day|dawn|dusk`.

### 인물 유형 (TYPES)
jesus, mary, joseph, angel, woman, woman2, mother, anna, john(젊은 제자, 수염 없음), disciple, peter, man, elder, shepherd, magus, magus2, magus3, king, soldier(창), pharisee, child, boyJesus, baptist, tempter, steward, groom, servant, crossed(십자가 위 예수 — 실루엣 전용), thief(실루엣 전용)
모세 여정: pharaoh, egyptian, taskmaster(막대), egysoldier(창), princess, egywoman, magician, mosesP(궁의 모세, 애굽 옷), mosesS(미디안의 목자), mosesE(여든의 모세, 흰 수염·지팡이), aaron, hebrew, hebrew2, miriam, sister(모세의 누이), joshua(창), hur, jethro, zipporah, aaronP(대제사장: 흰 옷·청색 에봇·관·흉패 `breast`), caleb, eleazar(대제사장 옷을 이은 아론의 아들), balaam, balak, sihon, rahab, priest(언약궤를 멘 레위 제사장)

새 인물은 TYPES에 옷 색(robe/trim/mantle), 머리(hair, long, curls), 수염(beard), 베일(veil+inner)·머릿수건(hood+band), slim, height 등을 조합해 추가한다.

### 자세 (pose)
idle, walk(자동), speak, listen, afraid, kneel, pray, bless, raise, bow, look-up, sleep, carry(아기), ride(나귀에 걸터앉음), point, sit, sit-ground, rebuke, break(빵 떼기), shrug, cower, mourn, crucified, crucified-dead, hold-basket
손에 드는 물건(item): basket, doves, gift, baby, timbrel(소고), tablets(돌판 둘)

### 소품 (MAKERS)
manger, sheep, star, beam(내려오는 빛), fruittree(fruit/taken), lifetree(open/closed), serpent(rest/hiss), flamesword, host(하늘 군대), water(호수·강 — size로 길게), boat(deck), rain, grass, crowd(spots, state stand/sit, face, faceCenter), baskets, hill(지면 높이 제공), crosses, tomb(open/closed), temple, throne, house, donkey(deck), camel(deck), jackal, ox, dove(fly/rest, y), rocks, figtree, jars(empty/water/wine), feast, table(over), cage
모세 여정: sand(모래 바닥, color), bricks, brickwall, reeds(파피루스), ark(갈대 상자 closed/open), bush(떨기나무 plain/fire), pillar(구름·불 기둥 cloud/fire), sea(갈라지는 바다 calm/part/return), chariot(병거, 말), tent(장막), swarm(파리·메뚜기 떼), egcolumns(애굽 궁 기둥), frogs, mountain(시내산 calm/smoke/cloud — 봉우리 셋의 산괴), manna, rockspring(반석 dry/flow), altar(돌 제단 idle/fire), pillars12(열두 돌기둥), calf(금송아지), arkc(언약궤 — 멘 궤는 `lift: 0.33, on: ['p1', 'p2']`로 앞뒤 두 제사장(궤 가운데에서 ±0.42)의 한가운데를 따르고, 제사장은 `carry-pole` 자세로 몸 옆의 채를 손에 쥔다), tabernacle(성막 — show 0→1에 받침·널판·덮개·뜰 차례로). grapepole(에스골 포도송이), rods(열두 지팡이 dry/bloom), brasspole(장대 위의 놋뱀), snakes(불뱀). citywall(성벽 도성 stand/cord/fall — `rahab: false`면 라합의 집 없이), sunmoon(해와 달, still), standing(증거의 선돌). arkc의 `lift`는 멘 높이(제사장이 메고 가는 궤). item: horn(숫양 뿔나팔). swarm은 `dot`으로 점 크기(메추라기). house는 state 'blood'(문설주의 피), water는 'blood'(붉어진 나일)

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

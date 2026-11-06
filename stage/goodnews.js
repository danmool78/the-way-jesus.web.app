/* ---------- 기쁜 소식 여정의 장면 연출 (stage/scenes.js의 SCRIPTS에 합쳐진다) ----------
   네 장면으로 듣는 복음: 에덴(사랑) → 닫힌 동산(죄와 단절) → 골고다와 빈 무덤(예수 그리스도) → 감람산에서 '당신'의 문 앞(믿음의 응답).
   연출 원칙(STAGE.md)을 그대로 따른다: 하나님은 모습 없이 빛(beam)으로만, 십자가는 멀리 윤곽으로만, 사람은 등을 보이고 무릎 꿇는다.
   에덴의 두 장면은 예수 여정의 프롤로그(e00)와 같은 자리·같은 배우(빛의 실루엣 → 어두운 실루엣)를 쓴다.
   '당신'(you, 푸른 옷의 오늘의 사람)이 보는 사람을 대신해 g02–g04를 함께 걷는다: 갈라진 틈(rift) 앞에서 건너지 못하고(g02),
   십자가가 그 틈 위에 다리로 놓이는 것을 건너편에서 바라보고(g03 — 아직 그분을 맞아들이기 전이라 건너지 않는다),
   무대는 zoom으로 크게 본다(작은 인물로는 틈과 다리가 잘 보이지 않았다). 문을 열고 예수님을 맞아들여 기도한 뒤에야 보는 사람이 직접 '예수님과 함께 건너기'를 눌러 그 다리를 건넌다(g04, @prompt → cross) */

const EDEN = [31.0, 47.43]; // e00과 같은 에덴의 전승 자리 — 본 지도와 떨어진 에덴 무대(app.js의 EDEN) 위에 선다
const GOLGOTHA = [31.7797, 35.2272]; // e55·e56과 같은 자리 — 성벽에 걸치지 않게 북서쪽 빈 들

export const GOODNEWS = {
  /* g01. 하나님은 당신을 사랑하십니다 — 빛이 내려오고, 동산이 피어나고, 흙으로 빚은 사람이 빛 속에서 고개를 든다.
     마지막 문단(그 사랑은 오늘 당신에게도)에서 두 사람이 앞(보는 사람 쪽)을 돌아본다 */
  g01: {
    env: 'glory', wide: 1.25, zoom: 2, at: EDEN,
    props: {
      grass: ['grass', 0, 0.05, { r: 1.9 }],
      river: ['water', 0, -1.0, { r: 1.2, y: 0.05, size: [1.9, 1, 0.22] }],
      flowers: ['flowers', -1.05, 0.42, { r: 0.42 }],
      flowers2: ['flowers', 0.95, 0.5, { r: 0.36 }],
      olive: ['olive', 1.15, -0.62],
      olive2: ['olive', -1.55, -0.22, { scale: 1.1 }],
      life: ['lifetree', -0.95, -0.6, { scale: 1.1 }],
      tree: ['fruittree', 0.18, -0.38, { scale: 1.15 }],
      presence: ['beam', -0.3, -0.05, { r: 0.55, h: 3, peak: 0.5 }],
    },
    cast: {
      adam: ['adam', -0.45, 0.2, 0.5, { silhouette: 'light', gaze: false }],
      eve: ['eve', -0.15, 0.26, -0.5, { silhouette: 'light', gaze: false }],
    },
    beats: {
      enter: [['@env', 'glory'], ['presence', null, { show: 1 }], ['adam', 'look-up', { show: 1, x: -0.45, z: 0.2, look: 0.2 }], ['eve', 'look-up', { show: 1, x: -0.15, z: 0.26, look: -0.2 }],
        ['tree', 'fruit'], ['life', 'open']],
      intro: [['@env', 'dark'], ['presence', null, { show: 0 }], ['adam', 'idle', { show: 0, x: -0.3, z: 0.1, look: 0 }], ['eve', 'idle', { show: 0, x: 0.2, z: 0.2, look: -0.5 }],
        ['flowers', null, { show: 0 }], ['flowers2', null, { show: 0 }], ['olive', null, { show: 0 }], ['olive2', null, { show: 0 }], ['life', null, { show: 0 }], ['tree', null, { show: 0 }], ['river', null, { show: 0 }], ['grass', null, { show: 0 }],
        ['tree', 'fruit'], ['life', 'open']],
      // 첫째, 하나님은 당신을 사랑하시고 — 어둠 속에 빛이 내려온다
      'p0.0': [['@env', 'dawn'], ['presence', null, { show: 1 }]],
      // 하나님은 세상을 이처럼 사랑하셔서 — 온 동산이 빛 속에 피어난다
      'p0.2': [['@env', 'glory'], ['grass', null, { show: 1 }], ['river', null, { show: 1, delay: 600 }], ['olive', null, { show: 1, delay: 1200 }], ['olive2', null, { show: 1, delay: 1600 }],
        ['life', null, { show: 1, delay: 2000 }], ['tree', null, { show: 1, delay: 2300 }], ['flowers', null, { show: 1, delay: 2700 }], ['flowers2', null, { show: 1, delay: 3000 }]],
      // 흙으로 사람을 빚어 생명의 숨을 — 빛 속에서 사람이 고개를 들고, 곁에 하와
      'p1.0': [['adam', 'look-up', { show: 1, look: 0 }], ['eve', 'idle', { show: 1, delay: 3500 }]],
      // 하나님과 함께 걷고 — 나란히 동산을 거닌다
      'p1.2': [['adam', 'idle', { x: -0.45, z: 0.2, look: 0.5 }], ['eve', 'idle', { x: -0.15, z: 0.26, look: -0.5 }], ['adam', 'look-up', { look: 0.2, delay: 3000 }], ['eve', 'look-up', { look: -0.2, delay: 3000 }]],
      // 넘치는 생명 — 앞(보는 사람 쪽)을 돌아보고 손을 든다
      'p2.1': [['adam', 'raise', { look: 0 }], ['eve', 'raise', { look: 0 }]],
      // 그런데 왜 — 빛이 조금 흐려진다 (다음 장면으로)
      'p2.2': [['@env', 'calm'], ['adam', 'idle', { look: 0.3 }], ['eve', 'idle', { look: -0.3 }]],
      end: [['@env', 'glory'], ['presence', null, { show: 1 }], ['adam', 'look-up', { show: 1, x: -0.45, z: 0.2, look: 0.2 }], ['eve', 'look-up', { show: 1, x: -0.15, z: 0.26, look: -0.2 }]],
    },
  },

  /* g02. 죄가 우리를 갈라놓았습니다 — 뱀의 그림자와 따 먹은 열매, 빛의 윤곽이 어두운 그림자로 바뀌고 빛(하나님)은 물러난다.
     두 사람은 동산 동쪽(오른쪽)으로 멀어지고, 돌아보며 손을 들어도 그룹과 불칼이 생명나무로 가는 길을 막고 있다 */
  g02: {
    env: 'overcast', wide: 1.25, zoom: 2, at: EDEN,
    props: {
      grass: ['grass', 0, 0.05, { r: 1.9 }],
      river: ['water', 0, -1.0, { r: 1.2, y: 0.05, size: [1.9, 1, 0.22] }],
      olive: ['olive', 1.15, -0.62],
      olive2: ['olive', -1.55, -0.22, { scale: 1.1 }],
      life: ['lifetree', -0.95, -0.6, { scale: 1.1 }],
      tree: ['fruittree', 0.18, -0.38, { scale: 1.15 }],
      serpent: ['serpent', 0.36, -0.34, { y: 0.4 }],
      presence: ['beam', -0.95, -0.45, { r: 0.45, h: 3, peak: 0.45 }],
      sword: ['flamesword', -0.2, 0.05],
      rift: ['rift', 0.82, 0.32, { len: 1.9, w: 0.26 }],
    },
    cast: {
      adam: ['adam', -0.3, 0.12, 0.6, { silhouette: 'light', gaze: false }],
      eve: ['eve', 0.0, 0.1, 0.8, { silhouette: 'light', gaze: false }],
      adamD: ['adamFig', -0.3, 0.12, 0.6, { silhouette: true, gaze: false }],
      eveD: ['eveFig', 0.0, 0.1, 0.8, { silhouette: true, gaze: false }],
      cherub: ['angel', -0.45, -0.05, 0.9, { gaze: false }],
      you: ['you', 1.3, 0.75, -1.3, { gaze: false }],
    },
    beats: {
      enter: [['@env', 'dusk'], ['tree', 'taken'], ['life', 'closed'], ['serpent', 'rest', { show: 0 }], ['presence', null, { show: 1 }], ['adam', 'idle', { show: 0 }], ['eve', 'idle', { show: 0 }],
        ['adamD', 'kneel', { show: 1, x: 1.35, z: 0.35, look: -1.3 }], ['eveD', 'mourn', { show: 1, x: 1.62, z: 0.45, look: -1.3 }], ['cherub', 'idle', { show: 1 }], ['sword', null, { show: 1 }],
        ['rift', 'open', { show: 1 }], ['you', 'kneel', { show: 1, x: 1.05, z: 0.7, look: -1.4 }]],
      intro: [['rift', 'open', { show: 0 }], ['you', 'idle', { show: 0, x: 1.3, z: 0.75, look: -1.3 }], ['@env', 'overcast'], ['tree', 'fruit'], ['life', 'open'], ['serpent', 'rest', { show: 0 }], ['presence', null, { show: 1 }], ['cherub', 'idle', { show: 0 }], ['sword', null, { show: 0 }],
        ['adam', 'idle', { show: 1, x: -0.3, z: 0.12, look: 0.6 }], ['eve', 'idle', { show: 1, x: 0.0, z: 0.1, look: 0.8 }], ['adamD', 'idle', { show: 0, x: -0.3, z: 0.12, look: 0.6 }], ['eveD', 'idle', { show: 0, x: 0.0, z: 0.1, look: 0.8 }]],
      // 둘째, 죄 때문에 — 뱀의 그림자가 나타난다
      'p0.0': [['serpent', 'hiss', { show: 1 }], ['eve', 'listen', { look: 1.2 }]],
      // 먹지 말라 하신 열매를 — 빛의 윤곽이 어두운 그림자로, 하나님의 빛은 물러난다
      'p1.0': [['eve', 'raise', { look: 1.2 }], ['tree', 'taken', { delay: 1400 }], ['serpent', 'rest', { delay: 2000 }],
        ['@env', 'dusk', { delay: 2600 }], ['adam', 'idle', { show: 0, delay: 2600 }], ['eve', 'idle', { show: 0, delay: 2600 }], ['adamD', 'cower', { show: 1, look: -1.2, delay: 2600 }], ['eveD', 'cower', { show: 1, look: -1.2, delay: 2600 }],
        ['presence', null, { show: 0, delay: 3200 }], ['serpent', 'rest', { show: 0, delay: 4500 }]],
      // 내가 내 삶의 주인이 되어 — 동산 동쪽(오른쪽)으로 멀어진다
      'p1.2': [['adamD', 'idle', { x: 1.35, z: 0.35, look: 1.3 }], ['eveD', 'idle', { x: 1.62, z: 0.45, look: 1.3 }], ['rift', 'open', { show: 1, delay: 1800 }]], // 그 사이에 틈이 갈라진다
      // 죄의 삯은 죽음
      'p1.4': [['@env', 'dark'], ['adamD', 'mourn', { look: 0.4 }], ['eveD', 'mourn', { look: 0.6 }]],
      // 그 틈을 건너 보려고 — 돌아서서 동산을 향해 손을 들고 무릎 꿇는다
      'p2.0': [['@env', 'dusk'], ['presence', null, { show: 1 }], ['adamD', 'raise', { look: -1.3 }], ['eveD', 'look-up', { look: -1.3 }], ['adamD', 'kneel', { look: -1.3, delay: 3500 }], ['eveD', 'pray', { look: -1.3, delay: 3800 }],
        // '당신'이 나타나 틈 가장자리까지 걸어가 손을 뻗는다
        ['you', 'idle', { show: 1, delay: 600 }], ['you', 'idle', { x: 1.05, z: 0.7, look: -1.4, delay: 1200 }], ['you', 'raise', { look: -1.4, delay: 3600 }]],
      // 누구도 자기 힘으로는 — 그룹과 불칼이 생명나무로 가는 길을 막는다
      'p2.1': [['cherub', 'idle', { show: 1 }], ['sword', null, { show: 1, delay: 400 }], ['life', 'closed', { delay: 400 }], ['eveD', 'mourn', { delay: 1500 }],
        ['you', 'kneel', { look: -1.4, delay: 900 }], ['you', 'mourn', { look: -1.4, delay: 3200 }]], // 건너지 못하고 주저앉는다
      end: [['@env', 'dusk'], ['tree', 'taken'], ['life', 'closed'], ['serpent', 'rest', { show: 0 }], ['presence', null, { show: 1 }], ['adam', 'idle', { show: 0 }], ['eve', 'idle', { show: 0 }],
        ['adamD', 'kneel', { show: 1, x: 1.35, z: 0.35, look: -1.3 }], ['eveD', 'mourn', { show: 1, x: 1.62, z: 0.45, look: -1.3 }], ['cherub', 'idle', { show: 1 }], ['sword', null, { show: 1 }],
        ['rift', 'open', { show: 1 }], ['you', 'kneel', { show: 1, x: 1.05, z: 0.7, look: -1.4 }]],
    },
  },

  /* g03. 예수 그리스도가 그 길이 되셨습니다 — 사람들 사이를 걸으시며 고치시는 예수, 해 저무는 골고다의 멀리 보이는 십자가 윤곽(e55와 같은 절제),
     그리고 새벽의 빈 무덤과 부활하신 예수(e56의 흰옷). 십자가 앞의 사람들은 등을 보이고 무릎 꿇는다 */
  g03: {
    env: 'day', wide: 1.3, zoom: 2, at: GOLGOTHA,
    props: {
      hill: ['hill', 0, -0.6, { w: 1.05, h: 0.24, d: 0.5, soft: true, color: '#9a8a6a' }],
      crosses: ['crosses', 0, -0.55, { y: 0.18 }],
      tomb: ['tomb', 1.2, -0.4, { scale: 0.75, rot: -0.4 }],
      beam: ['beam', 1.2, -0.25, { r: 0.4, h: 2.6, peak: 0.4 }],
      flowers: ['flowers', 1.55, 0.25, { r: 0.35, n: 16 }],
      rift: ['rift', -0.8, 0.42, { len: 1.5, w: 0.24, rot: Math.PI }], // 가로대가 빛(오른쪽) 쪽 끝에 오게 돌려 놓는다
    },
    cast: {
      you: ['you', -1.45, 0.48, 1.3, { gaze: false }],
      walk: ['jesus', -1.6, 0.3, 1.2],
      sick: ['man', -0.6, 0.35, -1],
      friend: ['woman', -0.85, 0.15, -0.8],
      jesus: ['crossed', 0, -0.5, 0, { silhouette: true, y: 0.5, gaze: false }],
      mary: ['mary', 0.25, 0.35, 2.5],
      john: ['john', 0.55, 0.22, 2.6],
      magdalene: ['woman2', -0.3, 0.38, -2.5],
      risen: ['risen', 0.75, -0.05, 0.6],
    },
    beats: {
      enter: [['@env', 'day'], ['crosses', null, { show: 0 }], ['jesus', 'crucified-dead', { show: 0 }], ['tomb', 'open'], ['beam', null, { show: 1 }], ['walk', 'idle', { show: 0 }], ['sick', 'idle', { show: 0 }], ['friend', 'idle', { show: 0 }],
        ['risen', 'bless', { show: 1, x: 0.75, z: -0.05, look: -0.6 }], ['mary', 'kneel', { show: 1, x: 0.35, z: 0.35, look: 1.2 }], ['john', 'look-up', { show: 1, x: 0.05, z: 0.3, look: 1.2 }], ['magdalene', 'kneel', { show: 1, x: -0.25, z: 0.42, look: 1.1 }],
        ['rift', 'bridge', { show: 1 }], ['you', 'look-up', { show: 1, x: -1.45, z: 0.48, look: 1.3 }]],
      intro: [['rift', 'open', { show: 0 }], ['you', 'idle', { show: 0 }], ['@env', 'day'], ['crosses', null, { show: 0 }], ['jesus', 'crucified', { show: 0 }], ['tomb', 'closed'], ['beam', null, { show: 0 }], ['risen', 'idle', { show: 0, x: 0.75, z: -0.05 }],
        ['walk', 'idle', { show: 0, x: -1.6, z: 0.3, look: 1.2 }], ['sick', 'idle', { show: 0, x: -0.6, z: 0.35, look: -1 }], ['friend', 'idle', { show: 0, x: -0.85, z: 0.15, look: -0.8 }],
        ['mary', 'idle', { show: 0, x: 1.4, z: 0.4 }], ['john', 'idle', { show: 0, x: 1.65, z: 0.25 }], ['magdalene', 'idle', { show: 0, x: -1.4, z: 0.42 }]],
      // 내가 곧 길이고 — 예수께서 사람들 사이로 걸어오신다
      'p0.3': [['walk', 'idle', { show: 1 }], ['walk', 'idle', { x: -0.95, z: 0.4, look: 1.0, delay: 400 }], ['sick', 'kneel', { show: 1, look: -1 }], ['friend', 'pray', { show: 1, look: -0.8 }]],
      // 하나님의 아들이 사람이 되어 — 손을 얹어 일으키신다
      'p1.0': [['walk', 'bless', { look: 1.0 }], ['sick', 'look-up', { delay: 1500 }], ['sick', 'raise', { delay: 3000 }], ['friend', 'raise', { delay: 3300 }]],
      // 골고다의 십자가 — 멀리 윤곽으로만, 사람들은 등을 보이고 무릎 꿇는다
      'p1.1': [['@env', 'dusk'], ['walk', 'idle', { show: 0 }], ['sick', 'idle', { show: 0 }], ['friend', 'idle', { show: 0 }], ['crosses', null, { show: 1 }], ['jesus', 'crucified', { show: 1 }],
        ['mary', 'idle', { show: 1, x: 0.25, z: 0.35, look: 2.5 }], ['john', 'idle', { show: 1, x: 0.55, z: 0.22, look: 2.6 }], ['magdalene', 'idle', { show: 1, x: -0.3, z: 0.38, look: -2.5 }],
        ['mary', 'kneel', { delay: 2500 }], ['magdalene', 'kneel', { delay: 2700 }], ['john', 'pray', { delay: 3500 }]],
      // 우리를 위해 죽으셨습니다
      'p1.3': [['@env', 'dark'], ['jesus', 'crucified-dead', { delay: 1500 }], ['mary', 'mourn', { delay: 1800 }], ['magdalene', 'mourn', { delay: 1900 }]],
      // 사흘째 새벽, 무덤은 비어 — 십자가는 물러나고 무덤이 열린다
      'p2.0': [['@env', 'dawn'], ['crosses', null, { show: 0 }], ['jesus', 'crucified-dead', { show: 0 }], ['tomb', 'open', { delay: 800 }], ['beam', null, { show: 1, delay: 1200 }],
        ['mary', 'idle', { x: 0.35, z: 0.35, look: 1.2, delay: 1500 }], ['john', 'idle', { x: 0.05, z: 0.3, look: 1.2, delay: 1500 }], ['magdalene', 'idle', { x: -0.25, z: 0.42, look: 1.1, delay: 1500 }]],
      // 다시 살아나셨고
      'p2.1': [['risen', 'idle', { show: 1, look: -0.6 }], ['mary', 'kneel', { delay: 1500 }], ['magdalene', 'kneel', { delay: 1700 }], ['john', 'look-up', { delay: 1600 }]],
      // 하나님과 우리 사이를 잇는 다리 — 두 손 들어 축복하신다
      'p2.2': [['@env', 'day'], ['risen', 'bless', { look: -0.3 }],
        // 갈라진 틈이 드러나고, 그 위로 십자가가 내려와 다리가 된다. '당신'은 건너편에서 바라본다
        ['rift', 'open', { show: 1, delay: 300 }], ['rift', 'bridge', { delay: 1500 }], ['you', 'idle', { show: 1, delay: 600 }], ['you', 'look-up', { look: 1.3, delay: 3800 }]],
      end: [['@env', 'day'], ['crosses', null, { show: 0 }], ['jesus', 'crucified-dead', { show: 0 }], ['tomb', 'open'], ['beam', null, { show: 1 }], ['walk', 'idle', { show: 0 }], ['sick', 'idle', { show: 0 }], ['friend', 'idle', { show: 0 }],
        ['risen', 'bless', { show: 1, x: 0.75, z: -0.05, look: -0.6 }], ['mary', 'kneel', { show: 1, x: 0.35, z: 0.35, look: 1.2 }], ['john', 'look-up', { show: 1, x: 0.05, z: 0.3, look: 1.2 }], ['magdalene', 'kneel', { show: 1, x: -0.25, z: 0.42, look: 1.1 }],
        ['rift', 'bridge', { show: 1 }], ['you', 'look-up', { show: 1, x: -1.45, z: 0.48, look: 1.3 }]],
    },
  },

  /* g04. 믿음으로 그분을 맞아들이세요 — 저녁, 부활하신 예수께서 한 집으로 걸어가 문 앞에 서서 두드리신다(계 3:20).
     기도의 '지금 제 마음의 문을 엽니다'에서 문이 열려 등불빛이 번지고, 집 안의 사람(보는 사람)이 나와 무릎 꿇는다. 감람산에서 도성은 서쪽(왼쪽) */
  g04: {
    env: 'day', wide: 1.35, zoom: 2,
    props: {
      grass: ['grass', 0, 0.05, { r: 1.7 }],
      olive: ['olive', -1.55, -0.55], olive2: ['olive', 1.65, -0.5, { scale: 0.9 }],
      flowers: ['flowers', -0.9, 0.4, { r: 0.35, n: 16 }],
      house: ['house', 0.45, -0.75, { door: true, stair: false, scale: 0.95 }],
      beam: ['beam', 0.64, -0.25, { r: 0.42, h: 2.8, peak: 0.4 }],
      rift: ['rift', -0.3, 0.3, { len: 1.6, w: 0.24, bz: 0.06 }],
      far: ['beam', -1.15, 0.3, { r: 0.5, h: 3, peak: 0.55 }], // 건너편의 빛
    },
    cast: {
      jesus: ['risen', -0.9, 0.15, 1.0],
      you: ['you', 0.64, -0.36, 0, { gaze: false }],
    },
    act: 'cross', // 보는 사람이 직접 하는 동작 — 한 뒤에는 낭독이 끝나도 done 모습으로 둔다 (stage.js)
    beats: {
      enter: [['@env', 'dawn'], ['house', 'open'], ['beam', null, { show: 1 }],
        ['jesus', 'bless', { show: 1, x: 0.95, z: -0.05, look: -0.9 }], ['you', 'kneel', { show: 1, x: 0.62, z: 0.02, look: 0.9 }]],
      intro: [['rift', 'open', { show: 0 }], ['far', null, { show: 0 }], ['@env', 'dusk'], ['house', 'closed'], ['beam', null, { show: 0 }], ['jesus', 'idle', { show: 1, x: -0.9, z: 0.15, look: 1.0 }], ['you', 'idle', { show: 0, x: 0.64, z: -0.36, look: 0 }]],
      // 넷째, 맞아들여야 — 저녁의 한 집으로 걸어가신다
      'p0.0': [['jesus', 'idle', { x: 0.1, z: 0.1, look: 1.0 }]],
      // 문 밖에 서서 두드린다 — 문 앞에 서신다
      'p1.3': [['jesus', 'idle', { x: 0.82, z: -0.1, look: -2.6 }], ['jesus', 'speak', { look: -2.6, delay: 2500 }]],
      // 지금 당신의 삶의 주인 자리에는 — 기다리신다
      'p1.5': [['jesus', 'idle', { look: -2.8 }]],
      // 함께 기도해 보세요 — 밤
      'p2.0': [['@env', 'night']],
      // 지금 제 마음의 문을 엽니다 — 문이 열리고 등불빛, 집 안의 사람이 나온다
      'p2.3': [['house', 'open'], ['you', 'idle', { show: 1, delay: 1000 }], ['you', 'idle', { x: 0.62, z: 0.02, look: 0.9, delay: 1500 }], ['jesus', 'idle', { x: 0.95, z: -0.05, look: -0.9, delay: 1500 }]],
      // 제 삶의 주인이 되어 주세요 — 무릎 꿇는 사람, 축복하시는 손
      'p2.4': [['you', 'kneel', { look: 0.9 }], ['jesus', 'bless', { look: -0.9, delay: 1200 }]],
      // 하나님의 자녀로 — 새벽빛이 내려온다
      'p2.5': [['@env', 'dawn'], ['beam', null, { show: 1 }]],
      // 아멘 — 일어나 바라보면, 갈라진 틈 위에 십자가 다리가 놓여 있다. 예수님이 앞장서 다리 앞에 서시고, 단추가 뜬다
      'p2.7': [['you', 'look-up', { look: 0.9 }], ['rift', 'open', { show: 1, delay: 1200 }], ['rift', 'bridge', { delay: 2200 }],
        ['jesus', 'idle', { x: 0.42, z: 0.28, look: -1.5, delay: 3000 }], ['you', 'idle', { x: 0.62, z: 0.4, look: -1.4, delay: 3400 }], ['@prompt', 'gnCross', { beat: 'cross', delay: 5200 }]],
      end: [['@env', 'dawn'], ['house', 'open'], ['beam', null, { show: 1 }], ['rift', 'bridge', { show: 1 }],
        ['jesus', 'idle', { show: 1, x: 0.42, z: 0.28, look: -1.5 }], ['you', 'idle', { show: 1, x: 0.62, z: 0.4, look: -1.4 }], ['@prompt', 'gnCross', { beat: 'cross', delay: 800 }]],
      // 보는 사람이 누르면: 예수님과 함께 십자가 다리를 건너 빛 속으로
      cross: [['jesus', 'idle', { x: -0.95, z: 0.34, look: -1.5 }], ['you', 'idle', { x: -0.75, z: 0.4, look: -1.5, delay: 500 }],
        ['far', null, { show: 1, delay: 2500 }], ['@env', 'glory', { delay: 3600 }], ['jesus', 'bless', { look: 0.6, delay: 5200 }], ['you', 'raise', { look: -0.3, delay: 5600 }]],
      done: [['@env', 'glory'], ['house', 'open'], ['beam', null, { show: 1 }], ['rift', 'bridge', { show: 1 }], ['far', null, { show: 1 }],
        ['jesus', 'bless', { show: 1, x: -0.95, z: 0.34, look: 0.6 }], ['you', 'raise', { show: 1, x: -0.75, z: 0.4, look: -0.3 }]],
    },
  },
};

// intro 앞에 처음 자리로 되돌리는 명령을 붙인다 (stage/moses.js와 같은 방식 — 다시 들을 때도 대본의 처음 자리에서)
Object.values(GOODNEWS).forEach(s => {
  const reset = [
    ...Object.entries(s.cast).map(([n, [, x, z, look, o = {}]]) => [n, o.pose || 'idle', { show: 1, x, z, look, item: null, y: o.y || 0 }]),
    ...Object.entries(s.props || {}).map(([n, [, x, z]]) => [n, null, { show: 1, x, z }]),
  ];
  s.beats.intro = [...reset, ...(s.beats.intro || s.beats.enter)];
});

/* 다윗 여정 대본 묶음 b: d11–d20 (stage/david.js가 합친다)
   놉의 성소에서 길보아의 슬픔까지 — 쫓기는 젊은 용사 다윗(davidW). 이 묶음에만 쓰는 소품·인물은 props-b.js(grotto·fold, abishai·amalekite·egyslave).
   연출 원칙: 놉의 제사장들(d11)과 사울의 죽음(d20)은 그리지 않는다 — 어두워지는 빛, 빈자리, 엎드려 우는 사람들로만.
   싸움(그일라·아말렉)도 치는 모습 없이 달아나 사라지는 무리와 되찾아 돌아오는 사람들로. 하나님은 빛(beam)으로만 */
import './props-b.js';

export const B = {
  /* d11. 놉의 진설병과 골리앗의 칼 — 놉의 성소(흰 휘장의 장막) 앞. 홀로 온 다윗을 아히멜렉이 떨며 맞고, 진설병 상의 거룩한 빵을 건넨다.
     장막 뒤에서 천에 싸인 골리앗의 칼을 꺼내 준다. 한쪽에서 에돔 사람 도엑이 지켜본다. 뒤에 기브아의 나무 아래 사울에게 도엑이 고하고 —
     제사장들의 죽음은 그리지 않는다: 빛이 꺼지고 제사장들이 사라진 빈 성소. 홀로 살아남은 아비아달이 다윗에게 달려와 엎드린다 */
  d11: {
    wide: 1.4,
    props: {
      grass: ['grass', 0, 0, { r: 1.8 }],
      tent: ['tent', 0.15, -0.5, { color: '#ece4d2', w: 0.95 }],
      bread: ['showbread', -0.3, -0.2],
      tree: ['olive', 1.55, -0.55, { scale: 0.9 }],
    },
    cast: {
      ahimelech: ['ahimelech', 0.1, -0.12, -0.8],
      abiathar: ['abiathar', 0.55, -0.3, -0.6, { gaze: false, speed: 0.85 }],
      priest: ['levite', -0.65, -0.35, 0.5, { gaze: false }],
      doeg: ['doeg', 0.95, 0.05, -1],
      david: ['davidW', -1.85, 0.25, 1],
      saul: ['saul', 1.42, -0.32, -0.8],
    },
    beats: {
      enter: [['saul', 'idle', { show: 0 }], ['ahimelech', 'idle', { x: 0.05, z: 0.05, look: -1, item: 'bread' }], ['david', 'idle', { x: -0.35, z: 0.12, look: 1, item: 'sword' }],
        ['doeg', 'idle', { look: -1 }]],
      intro: [['@env', 'day'], ['saul', 'idle', { show: 0 }], ['david', 'idle', { show: 0 }], ['doeg', 'idle', { show: 0 }]],
      // 홀로 놉의 성소에 닿는다
      'p0.0': [['david', 'idle', { show: 1, x: -0.55, z: 0.15, look: 1 }]],
      // 아히멜렉이 떨며 나와 맞는다
      'p0.1': [['ahimelech', 'afraid', { x: 0.0, z: 0.08, look: -1 }]],
      'p0.2': [['ahimelech', 'speak', { to: 'david' }]],
      'p0.3': [['ahimelech', 'listen'], ['david', 'speak', { to: 'ahimelech' }]],
      'p0.4': [['david', 'speak', { to: 'ahimelech' }]],
      // 막 물려 낸 거룩한 빵 — 진설병 상에서
      'p0.5': [['david', 'idle'], ['ahimelech', 'idle', { x: -0.22, z: -0.06, look: -0.6 }]],
      'p0.6': [['ahimelech', 'idle', { item: 'bread', x: -0.1, z: 0.1, look: -1, delay: 1400 }], ['david', 'idle', { item: 'bread', delay: 3600 }], ['ahimelech', 'idle', { item: null, delay: 3600 }]],
      // 창이나 칼이 없소 — 에봇 뒤에 천에 싸인 거인의 칼
      'p1.0': [['ahimelech', 'idle', { look: -1 }], ['david', 'idle', { item: null }]],
      'p1.1': [['david', 'speak', { to: 'ahimelech' }]],
      'p1.2': [['david', 'idle'], ['ahimelech', 'idle', { x: 0.3, z: -0.3, look: 1 }], ['ahimelech', 'idle', { item: 'cloak', x: 0.0, z: 0.08, look: -1, delay: 2600 }]],
      'p1.3': [['david', 'speak', { to: 'ahimelech' }], ['david', 'idle', { item: 'sword', delay: 2200 }], ['ahimelech', 'idle', { item: null, delay: 2200 }]],
      // 그 자리에 또 한 사람 — 에돔 사람 도엑
      'p1.4': [['david', 'idle'], ['doeg', 'idle', { show: 1, look: -1 }]],
      'p1.5': [['doeg', 'idle', { x: 0.85, z: 0.12, look: -1 }]],
      'p1.6': [['ahimelech', 'idle', { look: 1 }], ['david', 'idle', { look: 1 }]],
      // 다윗은 떠나고 — 기브아의 나무 아래 사울에게 도엑이 고한다
      'p2.0': [['david', 'idle', { x: -1.85, z: 0.3, look: -1 }], ['david', 'idle', { show: 0, delay: 3200 }], ['saul', 'idle', { show: 1, look: -1 }],
        ['doeg', 'bow', { x: 0.95, z: 0.08, look: 1, delay: 600 }], ['doeg', 'speak', { to: 'saul', delay: 3400 }]],
      // 제사장들이 쓰러진 날 — 그리지 않는다: 빛이 꺼지고 성소가 빈다
      'p2.1': [['saul', 'idle', { show: 0 }], ['doeg', 'idle', { show: 0 }], ['@env', 'dark'], ['ahimelech', 'idle', { show: 0, delay: 1500 }], ['priest', 'idle', { show: 0, delay: 1500 }], ['abiathar', 'idle', { show: 0, delay: 1500 }]],
      // 홀로 살아남은 아비아달이 다윗에게 달려온다
      'p2.2': [['@env', 'dusk'], ['david', 'idle', { show: 1, x: -1.0, z: 0.2, look: 1 }], ['abiathar', 'idle', { show: 1, x: 0.4, z: 0.25, look: -1 }], ['abiathar', 'idle', { x: -0.6, z: 0.2, delay: 300 }],
        ['abiathar', 'mourn', { delay: 3000 }]],
      'p2.3': [['david', 'mourn', { look: 1 }]],
      'p2.4': [['david', 'speak', { to: 'abiathar' }]],
      'p2.5': [['abiathar', 'idle', { look: -1 }], ['david', 'bless', { to: 'abiathar' }]],
      'p2.6': [['david', 'idle', { look: 0.5 }], ['abiathar', 'idle', { look: -1 }]],
      w0: [['david', 'speak', { show: 1, to: 'abiathar' }]],
      w1: [['david', 'speak', { show: 1, to: 'abiathar' }]],
      w2: [['david', 'speak', { show: 1, to: 'ahimelech' }], ['ahimelech', 'listen', { show: 1 }]],
      w3: [['ahimelech', 'speak', { show: 1 }]],
      end: [['@env', 'dusk'], ['david', 'idle', { look: 0.4 }], ['abiathar', 'idle', { look: -1 }]],
    },
  },
  /* d12. 가드에서 미친 척 — 블레셋 가드의 성문 앞. 깃털 관을 쓴 아기스 왕과 신하들. 다윗이 홀로 들어와 절하고, 신하들이 그를 알아보아 손가락질한다.
     두려워진 다윗은 성문 문짝에 금을 긋고 몸을 비틀며 미친 척하고(자세 point·cower·shrug를 엇갈려), 아기스가 손을 내젓는 사이 빠져나간다 */
  d12: {
    wide: 1.35,
    props: {
      sand: ['sand', 0, 0.05, { r: 1.8, color: '#c9b58c', stones: 14 }],
      gate: ['gate', 0.15, -0.6, { scale: 1.5 }],
    },
    cast: {
      achish: ['achish', 0.62, -0.15, -1],
      ph1: ['philistine', 1.0, 0.18, -1],
      ph2: ['philistine', 1.38, -0.05, -1.1, { gaze: false }],
      david: ['davidW', -1.9, 0.2, 1],
    },
    beats: {
      enter: [['david', 'cower', { x: 0.0, z: -0.3, look: 0.6 }], ['achish', 'shrug', { look: -1 }], ['ph1', 'listen', { look: -1 }]],
      intro: [['@env', 'day'], ['david', 'idle', { show: 0 }]],
      // 원수의 땅, 골리앗의 고향으로
      'p0.0': [['david', 'idle', { show: 1, x: -1.0, z: 0.15, look: 1 }]],
      'p0.2': [['david', 'idle', { look: 0.4 }]],
      'p0.3': [['david', 'idle', { x: -0.15, z: 0.05, look: 1 }], ['david', 'bow', { delay: 3200 }]],
      // 신하들이 먼저 알아본다
      'p1.0': [['david', 'idle'], ['ph1', 'point', { look: -1 }]],
      'p1.1': [['ph1', 'speak', { to: 'achish' }]],
      'p1.2': [['ph1', 'idle', { look: -1 }], ['ph2', 'speak', { to: 'achish' }]],
      'p1.3': [['ph2', 'point', { look: -1 }]],
      // 그 말이 가슴에 박힌다
      'p1.4': [['ph2', 'idle'], ['david', 'afraid', { look: 1 }]],
      'p1.5': [['david', 'cower', { look: 1 }]],
      // 딴사람이 된다 — 문짝에 금을 긋고, 몸을 비튼다
      'p2.0': [['david', 'shrug', { look: 0.4 }], ['achish', 'idle', { look: -1 }]],
      'p2.1': [['david', 'idle', { x: 0.0, z: -0.32, look: 0.6 }], ['david', 'point', { delay: 1800 }], ['david', 'cower', { delay: 3400 }], ['david', 'shrug', { delay: 4800 }], ['david', 'cower', { delay: 6200 }],
        ['ph1', 'afraid', { delay: 2600 }]],
      // 미친 사람이 아니냐
      'p2.2': [['ph1', 'idle'], ['achish', 'speak', { to: 'ph1' }]],
      'p2.3': [['achish', 'point', { look: -1 }]],
      'p2.4': [['achish', 'rebuke', { to: 'ph1' }], ['ph1', 'bow']],
      // 다윗은 가드를 빠져나온다
      'p2.5': [['achish', 'shrug'], ['ph1', 'idle'], ['david', 'idle', { x: -1.9, z: 0.25, look: -1 }], ['david', 'idle', { show: 0, delay: 4800 }]],
      'p2.6': [['achish', 'idle', { look: -1 }]],
      w0: [['ph1', 'speak', { show: 1, to: 'achish' }]],
      w1: [['achish', 'speak', { show: 1, to: 'ph1' }]],
      end: [['achish', 'idle']],
    },
  },

  /* d13. 아둘람 굴의 사백 명 — 유다 산기슭의 굴 입구. 어두운 굴 앞에 홀로 앉은 다윗에게 아버지 집안 사람들이 내려오고,
     쫓기는 사람·빚진 사람·원통한 사람들이 하나둘 모여 무리(사백 명)가 된다. 늙은 부모를 모압으로 모셔 가고, 선지자 갓의 말을 듣고 굴을 떠난다 */
  d13: {
    wide: 1.4,
    props: {
      sand: ['sand', 0, 0.05, { r: 1.85, color: '#ab9c7e', stones: 16 }],
      cave: ['cave', 0, -0.5, { scale: 1.15 }],
      crowd: ['crowd', 0, 0, { spots: [[1.0, -0.2], [1.25, -0.05], [1.45, -0.25], [1.5, 0.1], [1.2, 0.25], [1.65, 0.35], [-1.0, -0.25], [-1.25, -0.1], [-1.5, -0.3], [-1.55, 0.05], [-1.3, 0.3], [-1.7, 0.35]], face: 0 }],
    },
    cast: {
      david: ['davidW', 0.0, -0.08, 0, { pose: 'sit-ground' }],
      jesse: ['jesse', -1.9, 0.25, 1],
      mother: ['mother', -2.0, 0.4, 1],
      eliab: ['eliab', -1.95, 0.05, 1],
      brother: ['brother', -2.05, 0.15, 1],
      m1: ['hebrew', 1.95, 0.2, -1],
      m2: ['man', 2.0, 0.4, -1, { gaze: false }],
      m3: ['hebrew2', 2.05, 0.0, -1, { gaze: false }],
      gad: ['gad', -1.95, 0.45, 1],
    },
    beats: {
      enter: [['@env', 'dusk'], ['jesse', 'idle', { show: 0 }], ['mother', 'idle', { show: 0 }], ['gad', 'idle', { show: 0 }],
        ['david', 'speak', { x: 0.05, z: 0.15, look: 0 }], ['eliab', 'listen', { x: -0.55, z: 0.2, look: 1 }], ['brother', 'listen', { x: -0.75, z: 0.05, look: 1 }],
        ['m1', 'listen', { x: 0.55, z: 0.25, look: -1 }], ['m2', 'cower', { x: 0.75, z: 0.4, look: -1 }], ['m3', 'mourn', { x: 0.5, z: 0.5, look: -1 }]],
      intro: [['@env', 'overcast'], ['crowd', null, { show: 0 }], ['jesse', 'idle', { show: 0 }], ['mother', 'idle', { show: 0 }], ['eliab', 'idle', { show: 0 }], ['brother', 'idle', { show: 0 }],
        ['m1', 'idle', { show: 0 }], ['m2', 'idle', { show: 0 }], ['m3', 'idle', { show: 0 }], ['gad', 'idle', { show: 0 }]],
      // 바위 틈으로 스미는 빛 말고는 어둠
      'p0.1': [['@env', 'dusk'], ['david', 'sit-ground', { look: -0.2 }]],
      // 형들과 아버지 집안이 내려온다
      'p0.2': [['jesse', 'idle', { show: 1, x: -0.55, z: 0.18, look: 1 }], ['mother', 'idle', { show: 1, x: -0.75, z: 0.35, look: 1 }], ['eliab', 'idle', { show: 1, x: -0.4, z: -0.02, look: 1 }],
        ['brother', 'idle', { show: 1, x: -0.85, z: 0.05, look: 1 }], ['david', 'idle', { look: -1, delay: 2500 }]],
      // 쫓기는 사람, 빚에 짓눌린 사람, 마음이 원통한 사람
      'p1.0': [['m1', 'idle', { show: 1, x: 0.55, z: 0.22, look: -1 }]],
      'p1.1': [['m2', 'cower', { show: 1, x: 0.75, z: 0.4, look: -1 }], ['m3', 'mourn', { show: 1, x: 0.45, z: 0.5, look: -1 }], ['m1', 'cower', { delay: 1500 }]],
      'p1.2': [['crowd', null, { show: 1 }]],
      // 그들의 우두머리
      'p1.3': [['david', 'speak', { x: 0.05, z: 0.15, look: 0 }], ['m1', 'listen'], ['m2', 'listen'], ['m3', 'listen'], ['eliab', 'listen', { look: 1 }]],
      'p1.4': [['david', 'raise', { look: 0 }]],
      // 늙은 부모를 모압 땅으로
      'p2.0': [['david', 'idle', { x: 1.3, z: 0.65, look: 1 }], ['jesse', 'idle', { x: 1.55, z: 0.6, look: 1, delay: 400 }], ['mother', 'idle', { x: 1.7, z: 0.72, look: 1, delay: 700 }],
        ['m1', 'idle', { look: 1 }], ['m2', 'idle', { look: 1 }], ['m3', 'idle', { look: 1 }]],
      'p2.1': [['david', 'speak', { to: 'jesse' }], ['jesse', 'listen', { look: -1 }]],
      // 선지자 갓이 말한다
      'p2.2': [['jesse', 'idle', { show: 0 }], ['mother', 'idle', { show: 0 }], ['david', 'idle', { x: 0.05, z: 0.2, look: -1 }], ['gad', 'idle', { show: 1, x: -0.45, z: 0.4, look: 1, delay: 1200 }]],
      'p2.3': [['gad', 'speak', { to: 'david' }], ['david', 'listen', { look: -1 }]],
      // 헤렛 숲으로 — 무리가 굴을 떠난다
      'p2.4': [['gad', 'idle'], ['crowd', null, { show: 0 }], ['david', 'idle', { x: -1.9, z: 0.4, look: -1 }], ['eliab', 'idle', { x: -1.9, z: 0.15, delay: 400 }], ['brother', 'idle', { x: -2.0, z: 0.3, delay: 700 }],
        ['m1', 'idle', { x: -1.95, z: 0.55, delay: 1000 }], ['m2', 'idle', { x: -2.0, z: 0.65, delay: 1300 }], ['m3', 'idle', { x: -1.9, z: 0.75, delay: 1600 }],
        ['eliab', 'idle', { show: 0, delay: 4800 }], ['brother', 'idle', { show: 0, delay: 5000 }], ['m1', 'idle', { show: 0, delay: 5200 }], ['m2', 'idle', { show: 0, delay: 5400 }], ['m3', 'idle', { show: 0, delay: 5600 }],
        ['gad', 'idle', { show: 0, delay: 3000 }], ['david', 'idle', { show: 0, delay: 4500 }]],
      // 굴에 숨어 지내던 그때의 부르짖음
      'p2.5': [['crowd', null, { show: 0 }], ['eliab', 'idle', { show: 0 }], ['brother', 'idle', { show: 0 }], ['m1', 'idle', { show: 0 }], ['m2', 'idle', { show: 0 }], ['m3', 'idle', { show: 0 }], ['gad', 'idle', { show: 0 }],
        ['david', 'kneel', { show: 1, x: 0.0, z: -0.05, look: 0 }], ['david', 'pray', { delay: 1500 }]],
      w0: [['david', 'speak', { show: 1 }]],
      w1: [['gad', 'speak', { show: 1, to: 'david' }]],
      end: [['@env', 'dusk'], ['david', 'pray']],
    },
  },

  /* d14. 그일라를 구하다 — 그일라 성벽 앞의 타작마당. 블레셋 사람들이 곡식을 거두어 가고, 다윗이 무릎 꿇어 여쭈면 빛이 내린다.
     두려워하는 부하들, 다시 여쭈는 다윗. 내려가자 블레셋은 달아나 사라지고(치는 모습 없이) 가축을 끌고 온다. 에봇을 든 아비아달이 오고,
     멀리 사울이 기뻐한다. 에봇 앞에서 다시 여쭙고 — 성 사람들이 돌아서자 육백 명과 함께 성을 떠난다 */
  d14: {
    wide: 1.45,
    props: {
      grass: ['grass', 0, 0.05, { r: 1.9 }],
      wall: ['citywall', 1.05, -0.68, { w: 1.4, h: 0.45, rahab: false }],
      floor: ['threshing', 0.5, 0.05, { r: 0.42 }],
      s1: ['sheep', 0.95, 0.35, { rot: 3.3, speed: 0.6 }],
      s2: ['sheep', 1.2, 0.25, { rot: 3.0, speed: 0.6 }],
      beam: ['beam', -1.05, 0.12, { r: 0.3, h: 2.2 }],
    },
    cast: {
      david: ['davidW', -1.05, 0.12, 1],
      i1: ['israelite', -1.45, -0.05, 1],
      i2: ['israelite2', -1.5, 0.32, 1, { gaze: false }],
      ph1: ['philistine', 0.4, -0.02, 0.6, { gaze: false }],
      ph2: ['philistine', 0.78, 0.18, -1, { gaze: false }],
      t1: ['man', 0.85, -0.38, -1, { gaze: false }],
      t2: ['woman', 1.2, -0.4, -1, { gaze: false }],
      abiathar: ['abiathar', -1.95, 0.45, 1],
      saul: ['saul', -1.55, -0.55, 0.6],
      abner: ['abner', -1.85, -0.45, 0.8, { gaze: false }],
    },
    beats: {
      enter: [['ph1', 'idle', { show: 0 }], ['ph2', 'idle', { show: 0 }], ['saul', 'idle', { show: 0 }], ['abner', 'idle', { show: 0 }], ['beam', null, { show: 1, x: -0.3, z: 0.2 }],
        ['abiathar', 'idle', { x: -0.6, z: 0.15, look: 1, item: 'cloak' }], ['david', 'kneel', { x: -0.3, z: 0.2, look: -1 }], ['i1', 'idle', { x: -0.85, z: -0.05 }], ['i2', 'idle', { x: -0.95, z: 0.4 }],
        ['s1', null, { x: -0.1, z: 0.5 }], ['s2', null, { x: 0.15, z: 0.55 }], ['t1', 'raise'], ['t2', 'raise']],
      intro: [['@env', 'day'], ['beam', null, { show: 0 }], ['t1', 'idle', { show: 0 }], ['t2', 'idle', { show: 0 }], ['abiathar', 'idle', { show: 0, item: null }], ['saul', 'idle', { show: 0 }], ['abner', 'idle', { show: 0 }],
        ['ph1', 'kneel', { look: 0.6 }], ['ph2', 'point', { look: -1 }]],
      // 주께 여쭙는다
      'p0.1': [['ph1', 'idle'], ['ph2', 'idle'], ['david', 'kneel', { look: 0 }]],
      'p0.2': [['david', 'pray']],
      'p0.3': [['beam', null, { show: 1, x: -1.05, z: 0.12 }], ['david', 'look-up']],
      // 부하들은 고개를 젓는다
      'p0.4': [['beam', null, { show: 0 }], ['david', 'idle', { look: -1 }], ['i1', 'shrug'], ['i2', 'afraid']],
      'p0.5': [['i1', 'speak', { to: 'david' }], ['i2', 'idle']],
      // 다시 여쭙고 — 더 분명한 대답
      'p1.0': [['i1', 'idle'], ['david', 'kneel', { look: 0 }], ['beam', null, { show: 1, x: -1.05, z: 0.12, delay: 800 }]],
      'p1.1': [['david', 'look-up']],
      'p1.2': [['david', 'listen']],
      // 내려가 블레셋을 친다 — 그들은 달아나 사라지고, 가축을 끌고 온다
      'p1.3': [['beam', null, { show: 0 }], ['david', 'raise', { x: -0.05, z: 0.2, look: 1 }], ['i1', 'idle', { x: -0.3, z: 0.0, look: 1 }], ['i2', 'idle', { x: -0.25, z: 0.42, look: 1 }],
        ['ph1', 'afraid', { delay: 600 }], ['ph2', 'afraid', { delay: 600 }], ['ph1', 'idle', { x: 2.0, z: -0.15, delay: 1500 }], ['ph2', 'idle', { x: 2.0, z: 0.25, delay: 1500 }],
        ['ph1', 'idle', { show: 0, delay: 4500 }], ['ph2', 'idle', { show: 0, delay: 4500 }], ['s1', null, { x: -0.1, z: 0.5, delay: 3500 }], ['s2', null, { x: 0.15, z: 0.55, delay: 3800 }]],
      // 그일라 주민이 살아났다
      'p1.4': [['ph1', 'idle', { show: 0 }], ['ph2', 'idle', { show: 0 }], ['david', 'idle', { look: 1 }], ['t1', 'raise', { show: 1 }], ['t2', 'raise', { show: 1 }]],
      // 에봇을 들고 온 아비아달
      'p1.5': [['t1', 'idle'], ['t2', 'idle'], ['abiathar', 'idle', { show: 1, x: -0.75, z: 0.3, look: 1, item: 'cloak' }], ['david', 'idle', { look: -1, delay: 2500 }]],
      // 멀리 기브아에서 사울이 기뻐한다
      'p2.0': [['saul', 'raise', { show: 1, look: 0.6 }], ['abner', 'idle', { show: 1, look: 1 }]],
      'p2.1': [['saul', 'speak', { to: 'abner' }]],
      'p2.2': [['saul', 'point', { look: 1 }]],
      // 에봇 앞에서 여쭙는다
      'p2.3': [['saul', 'idle'], ['abiathar', 'idle', { x: -0.6, z: 0.15, look: 1 }], ['david', 'kneel', { x: -0.3, z: 0.2, look: -1 }], ['beam', null, { show: 1, x: -0.3, z: 0.2 }]],
      'p2.4': [['david', 'pray']],
      'p2.5': [['david', 'listen']],
      'p2.6': [['david', 'pray']],
      // 그들이 너를 넘겨줄 것이다 — 성 사람들이 돌아선다
      'p2.7': [['david', 'listen'], ['t1', 'idle', { look: 2.8 }], ['t2', 'idle', { look: 2.8 }]],
      // 육백 명과 함께 정처 없이
      'p2.8': [['beam', null, { show: 0 }], ['david', 'idle', { x: -1.2, z: 0.65, look: -1 }], ['abiathar', 'idle', { x: -1.4, z: 0.55, delay: 500 }], ['i1', 'idle', { x: -1.35, z: 0.8, delay: 800 }], ['i2', 'idle', { x: -1.6, z: 0.75, delay: 1100 }],
        ['david', 'idle', { show: 0, delay: 4200 }], ['abiathar', 'idle', { show: 0, delay: 4400 }], ['i1', 'idle', { show: 0, delay: 4600 }], ['i2', 'idle', { show: 0, delay: 4800 }]],
      // 사울은 출정을 그만둔다
      'p2.9': [['david', 'idle', { show: 0 }], ['abiathar', 'idle', { show: 0 }], ['i1', 'idle', { show: 0 }], ['i2', 'idle', { show: 0 }],
        ['saul', 'idle', { x: -2.0, z: -0.6, look: -1 }], ['abner', 'idle', { x: -2.1, z: -0.4 }], ['saul', 'idle', { show: 0, delay: 2500 }], ['abner', 'idle', { show: 0, delay: 2500 }]],
      w0: [['beam', null, { show: 1 }], ['david', 'listen', { show: 1 }]],
      w1: [['beam', null, { show: 1 }], ['david', 'listen', { show: 1 }]],
      w2: [['david', 'speak', { show: 1 }]],
      w3: [['beam', null, { show: 1 }], ['david', 'listen', { show: 1 }]],
      end: [['@env', 'dusk']],
    },
  },

  /* d15. 십 광야의 밀고 — 가운데 바위산을 둔 광야. 오른쪽 호레스 수풀에서 요나단이 찾아와 다윗을 붙들어 주고, 빛 아래 언약을 맺고 떠난다(마지막 만남).
     왼쪽에서 십 사람들이 사울에게 고하고, 사울이 군사를 이끌고 산 이쪽으로 — 다윗은 산 저쪽으로. 에워싸며 좁혀 올 때 전령이 달려오고 사울이 돌아선다 */
  d15: {
    wide: 1.45,
    props: {
      sand: ['sand', 0, 0.05, { r: 1.9, color: '#b9a57e', stones: 22 }],
      hill: ['hill', 0.05, -0.35, { w: 0.75, h: 0.4, d: 0.5, color: '#9a8a6a' }],
      o1: ['olive', 1.35, -0.5, { scale: 0.75 }],
      o2: ['olive', 1.7, -0.25, { scale: 0.6 }],
      beam: ['beam', 1.05, 0.15, { r: 0.45, h: 2.2 }],
    },
    cast: {
      david: ['davidW', 0.95, 0.15, -0.5],
      m1: ['israelite2', 1.4, 0.35, -1, { gaze: false }],
      jonathan: ['jonathan', 1.95, 0.2, -1],
      z1: ['man', -0.35, 0.35, -1],
      z2: ['hebrew2', -0.15, 0.48, -1, { gaze: false }],
      saul: ['saul', -1.45, -0.05, 1],
      sol1: ['israelite', -1.8, 0.1, 1, { gaze: false }],
      sol2: ['israelite2', -1.75, -0.25, 1, { gaze: false }],
      runner: ['israelite', -2.0, 0.5, 1],
    },
    beats: {
      enter: [['z1', 'idle', { show: 0 }], ['z2', 'idle', { show: 0 }], ['runner', 'idle', { show: 0 }], ['beam', null, { show: 1 }],
        ['jonathan', 'embrace', { x: 1.2, z: 0.15, look: -1 }], ['david', 'embrace', { x: 0.95, z: 0.15, look: 1 }], ['saul', 'idle', { show: 0 }], ['sol1', 'idle', { show: 0 }], ['sol2', 'idle', { show: 0 }]],
      intro: [['@env', 'day'], ['beam', null, { show: 0 }], ['jonathan', 'idle', { show: 0 }], ['z1', 'idle', { show: 0 }], ['z2', 'idle', { show: 0 }], ['saul', 'idle', { show: 0 }],
        ['sol1', 'idle', { show: 0 }], ['sol2', 'idle', { show: 0 }], ['runner', 'idle', { show: 0 }]],
      // 광야의 요새와 산지를 떠돈다
      'p0.0': [['david', 'idle', { x: 0.8, z: 0.25, look: -1 }], ['m1', 'idle', { x: 1.15, z: 0.4, look: -1 }]],
      // 호레스 수풀로 요나단이 찾아온다
      'p0.2': [['jonathan', 'idle', { show: 1, x: 1.2, z: 0.15, look: -1 }], ['david', 'idle', { x: 0.92, z: 0.18, look: 1 }], ['m1', 'idle', { x: 1.45, z: 0.45, look: -1 }]],
      'p0.3': [['jonathan', 'speak', { to: 'david' }]],
      'p0.5': [['jonathan', 'bless', { to: 'david' }], ['david', 'bow']],
      // 주 앞에서 언약을 맺고
      'p0.6': [['beam', null, { show: 1 }], ['jonathan', 'kneel', { look: -1 }], ['david', 'kneel', { look: 1 }]],
      // 마지막 만남 — 끌어안고 헤어진다
      'p0.7': [['beam', null, { show: 0 }], ['jonathan', 'embrace', { look: -1 }], ['david', 'embrace', { look: 1 }], ['jonathan', 'idle', { x: 2.0, z: 0.0, delay: 2600 }], ['jonathan', 'idle', { show: 0, delay: 5600 }],
        ['david', 'idle', { look: 1, delay: 2600 }]],
      // 십 사람들이 기브아의 사울에게
      'p1.0': [['jonathan', 'idle', { show: 0 }], ['saul', 'idle', { show: 1, look: 1 }], ['z1', 'idle', { show: 1, x: -1.05, z: 0.08, look: -1 }], ['z2', 'idle', { show: 1, x: -0.95, z: 0.3, look: -1 }]],
      'p1.1': [['z1', 'speak', { to: 'saul' }]],
      'p1.2': [['z1', 'bow'], ['z2', 'bow'], ['saul', 'bless', { to: 'z1' }]],
      'p1.3': [['saul', 'speak', { to: 'z1' }]],
      'p1.4': [['saul', 'point', { look: 1 }], ['z1', 'idle'], ['z2', 'idle']],
      // 군사를 이끌고 마온 광야까지
      'p1.5': [['z1', 'idle', { x: -0.55, z: 0.5 }], ['z2', 'idle', { x: -0.4, z: 0.62 }], ['z1', 'idle', { show: 0, delay: 2600 }], ['z2', 'idle', { show: 0, delay: 2600 }],
        ['saul', 'idle', { x: -0.85, z: -0.05, look: 1 }], ['sol1', 'idle', { show: 1, x: -1.15, z: 0.15 }], ['sol2', 'idle', { show: 1, x: -1.1, z: -0.3 }]],
      // 사울은 산 이쪽, 다윗은 산 저쪽
      'p2.0': [['z1', 'idle', { show: 0 }], ['z2', 'idle', { show: 0 }], ['saul', 'idle', { x: -0.6, z: -0.05, look: 1 }], ['david', 'idle', { x: 0.62, z: -0.05, look: 1 }], ['m1', 'idle', { x: 0.85, z: 0.12 }]],
      // 서둘러 피하고 — 군사들이 에워싸며 좁혀 온다
      'p2.1': [['david', 'idle', { x: 1.3, z: 0.2, look: -1 }], ['m1', 'idle', { x: 1.55, z: 0.32, look: -1 }], ['sol1', 'idle', { x: 0.0, z: 0.3, look: 1 }], ['sol2', 'idle', { x: -0.15, z: -0.68, look: 1 }]],
      // 전령이 달려온다
      'p2.2': [['runner', 'idle', { show: 1, x: -0.95, z: 0.3, look: 1 }]],
      'p2.3': [['runner', 'speak', { to: 'saul' }], ['saul', 'idle', { look: -1 }]],
      // 사울이 발길을 돌린다
      'p2.4': [['runner', 'idle'], ['saul', 'idle', { x: -2.0, z: 0.0, look: -1 }], ['sol1', 'idle', { x: -2.0, z: 0.3 }], ['sol2', 'idle', { x: -2.0, z: -0.3 }], ['runner', 'idle', { x: -2.0, z: 0.5 }],
        ['saul', 'idle', { show: 0, delay: 5500 }], ['sol1', 'idle', { show: 0, delay: 5500 }], ['sol2', 'idle', { show: 0, delay: 5500 }], ['runner', 'idle', { show: 0, delay: 5500 }]],
      // 갈라짐의 바위
      'p2.5': [['saul', 'idle', { show: 0 }], ['sol1', 'idle', { show: 0 }], ['sol2', 'idle', { show: 0 }], ['runner', 'idle', { show: 0 }], ['david', 'idle', { x: 0.62, z: 0.05, look: -1 }]],
      'p2.6': [['david', 'pray', { look: -0.3 }]],
      w0: [['jonathan', 'speak', { show: 1, to: 'david' }], ['david', 'listen', { show: 1 }]],
      w1: [['z1', 'speak', { show: 1, to: 'saul' }], ['saul', 'idle', { show: 1 }]],
      w2: [['saul', 'speak', { show: 1, to: 'z1' }], ['z1', 'bow', { show: 1 }]],
      w3: [['runner', 'speak', { show: 1, to: 'saul' }], ['saul', 'idle', { show: 1 }]],
      end: [['david', 'pray']],
    },
  },

  /* d16. 엔게디 굴의 옷자락 — 들염소 바위의 밝은 석회암. 앞이 트인 굴(grotto) 깊은 곳에 다윗과 부하들이 숨죽여 앉아 있고,
     사울이 홀로 굴 어귀로 들어선다. 다윗이 소리 없이 다가가 옷자락을 베고(item hem), 마음이 찔려 부하들을 말린다.
     굴을 나선 사울 뒤에서 엎드려 옷자락을 들어 보이고, 사울이 소리 높여 운다 */
  d16: {
    wide: 1.4,
    at: [31.462, 35.36], // 핀이 사해 물가라 핀 앞(동쪽)이 물 — 굴과 양 우리를 뭍에 세운다
    props: {
      sand: ['sand', 0, 0.05, { r: 1.85, color: '#d2c6a6', stones: 18 }],
      cave: ['grotto', 0.4, -0.3, { w: 1.65, h: 1.12, d: 0.7 }],
      fold: ['fold', -0.85, -0.45, { r: 0.28 }],
      s1: ['sheep', -0.9, -0.45, { rot: 0.4, scale: 0.8 }],
      s2: ['sheep', -0.75, -0.5, { rot: 2.4, scale: 0.8 }],
      rocks: ['rocks', 0, 0, { spots: [[-1.45, -0.3, 0.16], [1.45, 0.15, 0.14], [1.25, -0.55, 0.18], [-0.3, 0.6, 0.08]] }],
    },
    cast: {
      david: ['davidW', 0.72, -0.5, -0.6, { pose: 'sit-ground' }],
      m1: ['abishai', 0.38, -0.6, 0.4, { pose: 'sit-ground' }],
      m2: ['hebrew2', 1.0, -0.38, -0.8, { pose: 'sit-ground', gaze: false }],
      saul: ['saulS', -1.9, 0.25, 1],
      sol1: ['israelite', -2.0, 0.05, 1, { gaze: false }],
      sol2: ['israelite2', -2.05, 0.45, 1, { gaze: false }],
    },
    beats: {
      enter: [['saul', 'mourn', { x: -0.85, z: 0.25, look: 1 }], ['sol1', 'idle', { x: -1.4, z: -0.12 }], ['sol2', 'idle', { x: -1.6, z: 0.5 }],
        ['david', 'kneel', { x: -0.2, z: 0.25, look: -1, item: 'hem' }], ['m1', 'idle', { x: 0.25, z: 0.0, look: -1 }], ['m2', 'idle', { show: 0 }]],
      intro: [['@env', 'day'], ['saul', 'idle', { show: 0 }], ['sol1', 'idle', { show: 0 }], ['sol2', 'idle', { show: 0 }], ['david', 'sit-ground', { show: 0 }], ['m1', 'sit-ground', { show: 0 }], ['m2', 'sit-ground', { show: 0 }]],
      // 삼천 명의 정예를 이끌고 사울이 온다
      'p0.0': [['saul', 'idle', { show: 1, x: -1.15, z: 0.25, look: 1 }], ['sol1', 'idle', { show: 1, x: -1.4, z: -0.12 }], ['sol2', 'idle', { show: 1, x: -1.6, z: 0.5 }]],
      // 홀로 그 굴로 들어간다
      'p0.2': [['saul', 'idle', { x: 0.0, z: 0.05, look: 0 }], ['sol1', 'idle', { look: 0 }], ['sol2', 'idle', { look: 0 }]],
      // 굴 깊숙한 곳, 숨죽인 다윗과 부하들
      'p0.3': [['david', 'sit-ground', { show: 1 }], ['m1', 'sit-ground', { show: 1 }], ['m2', 'sit-ground', { show: 1 }]],
      'p1.0': [['m1', 'speak', { to: 'david' }]],
      'p1.1': [['m1', 'point', { look: -0.6 }]],
      // 소리 없이 다가가 옷자락을 벤다
      'p1.2': [['m1', 'sit-ground'], ['david', 'idle', { x: 0.25, z: -0.1, look: -1 }], ['david', 'kneel', { delay: 2200 }], ['david', 'kneel', { item: 'hem', delay: 3600 }]],
      // 마음이 찔린다
      'p1.3': [['david', 'idle', { x: 0.72, z: -0.48, look: -0.6 }], ['david', 'mourn', { delay: 2200 }]],
      'p1.4': [['david', 'speak', { to: 'm1' }]],
      'p1.5': [['david', 'rebuke', { to: 'm1' }], ['m1', 'idle', { x: 0.4, z: -0.55, look: 0.6 }]],
      // 굴을 나선 사울 — 뒤따라 나와 외친다
      'p2.0': [['saul', 'idle', { x: -0.9, z: 0.25, look: -1 }], ['david', 'idle', { x: -0.15, z: 0.25, look: -1, delay: 1800 }], ['m1', 'idle', { x: 0.3, z: 0.0, look: -1, delay: 2400 }]],
      'p2.1': [['david', 'speak', { to: 'saul' }], ['saul', 'idle', { look: 1 }]],
      // 땅에 엎드려 옷자락을 들어 보인다
      'p2.2': [['david', 'kneel', { look: -1, item: 'hem' }]],
      'p2.3': [['david', 'speak', { to: 'saul', item: 'hem' }]],
      'p2.4': [['david', 'kneel']],
      // 사울이 소리 높여 운다
      'p2.5': [['saul', 'mourn']],
      'p2.6': [['saul', 'speak', { to: 'david' }]],
      'p2.7': [['saul', 'speak', { to: 'david' }], ['david', 'idle', { item: null }]],
      // 사울은 집으로, 다윗은 요새로
      'p2.8': [['saul', 'idle', { x: -2.0, z: 0.3, look: -1 }], ['sol1', 'idle', { x: -2.1, z: 0.1, delay: 800 }], ['sol2', 'idle', { x: -2.1, z: 0.5, delay: 800 }],
        ['saul', 'idle', { show: 0, delay: 4000 }], ['sol1', 'idle', { show: 0, delay: 4500 }], ['sol2', 'idle', { show: 0, delay: 4500 }],
        ['david', 'idle', { x: 1.45, z: -0.15, look: 1, delay: 1500 }], ['m1', 'idle', { x: 1.6, z: 0.0, look: 1, delay: 1800 }], ['m2', 'idle', { x: 1.7, z: -0.3, delay: 2000 }]],
      // 굴에서 사울을 피하던 날의 노래
      'p2.9': [['saul', 'idle', { show: 0 }], ['sol1', 'idle', { show: 0 }], ['sol2', 'idle', { show: 0 }], ['m1', 'idle', { show: 0 }], ['m2', 'idle', { show: 0 }],
        ['david', 'kneel', { x: 0.4, z: -0.3, look: 0, item: null }], ['david', 'pray', { delay: 3500 }]],
      w0: [['david', 'speak', { show: 1, to: 'm1' }], ['m1', 'listen', { show: 1 }]],
      w1: [['david', 'speak', { show: 1, item: 'hem', to: 'saul' }], ['saul', 'listen', { show: 1 }]],
      w2: [['saul', 'speak', { show: 1, to: 'david' }]],
      w3: [['saul', 'speak', { show: 1, to: 'david' }]],
      end: [['david', 'pray', { item: null }]],
    },
  },

  /* d17. 나발과 아비가일 — 갈멜의 양털 깎는 잔치. 오른쪽 나발의 집 앞 잔칫상에 앉은 나발, 양 떼와 털 깎는 일꾼. 다윗의 젊은이들이 와서 절하고,
     나발이 비웃어 돌려보낸다. 왼쪽의 다윗이 칼을 찬다. 종이 아비가일에게 달려가고, 아비가일이 짐 실은 나귀를 타고 내려와 다윗 앞에 엎드린다.
     나발의 죽음은 그리지 않는다 — 해 질 녘 잔칫자리에서 그가 사라질 뿐. 아비가일이 다윗 곁에 선다 */
  d17: {
    wide: 1.45,
    props: {
      grass: ['grass', 0, 0.05, { r: 1.9 }],
      house: ['house', 1.4, -0.6, { scale: 0.8 }],
      feast: ['feast', 0.62, -0.38, { len: 0.8 }],
      s1: ['sheep', 0.38, 0.28, { rot: 0.3 }],
      s2: ['sheep', 0.7, 0.5, { rot: -0.4 }],
      s3: ['sheep', 0.9, 0.3, { rot: 2.8 }],
      s4: ['sheep', 0.3, 0.55, { rot: 3.4 }],
      donkey: ['packdonkey', 1.55, 0.3, { speed: 0.45, rot: Math.PI }],
    },
    cast: {
      nabal: ['nabal', 0.55, -0.62, 0.2, { pose: 'sit' }],
      guest: ['man', 0.92, -0.6, -0.3, { pose: 'sit', gaze: false }],
      shearer: ['shepherd', 0.6, 0.32, 0.3, { gaze: false }],
      y1: ['israelite2', -1.9, 0.0, 1],
      y2: ['hebrew', -1.95, 0.2, 1, { gaze: false }],
      david: ['davidW', -1.55, -0.2, 1],
      m1: ['israelite', -1.85, -0.38, 1, { gaze: false }],
      servant: ['servant', 0.95, 0.0, -1],
      abigail: ['abigail', 1.45, 0.02, -1],
    },
    beats: {
      enter: [['nabal', 'sit', { show: 0 }], ['guest', 'sit', { show: 0 }], ['y1', 'idle', { show: 0 }], ['y2', 'idle', { show: 0 }], ['servant', 'idle', { show: 0 }], ['donkey', null, { x: -0.3, z: 0.42 }],
        ['abigail', 'kneel', { board: null, x: -0.62, z: 0.22, look: -1 }], ['david', 'speak', { x: -1.0, z: 0.15, look: 1 }], ['m1', 'idle', { x: -1.35, z: 0.0 }]],
      intro: [['@env', 'day'], ['abigail', 'idle', { board: null, x: 1.45, z: 0.02, look: -1 }], ['donkey', null, { show: 0 }], ['david', 'idle', { show: 0 }], ['m1', 'idle', { show: 0 }], ['y1', 'idle', { show: 0 }], ['y2', 'idle', { show: 0 }], ['shearer', 'kneel', { look: 0.3 }]],
      // 부자 나발의 잔치
      'p0.1': [['nabal', 'sit-speak', { to: 'guest' }]],
      // 젊은이들이 와서 정중히 인사한다
      'p0.2': [['nabal', 'sit'], ['y1', 'idle', { show: 1, x: 0.15, z: -0.1, look: 1 }], ['y2', 'idle', { show: 1, x: -0.1, z: 0.02, look: 1 }], ['y1', 'bow', { delay: 4500 }], ['y2', 'bow', { delay: 4500 }]],
      // 나발이 비웃는다
      'p0.3': [['y1', 'idle'], ['y2', 'idle'], ['nabal', 'shrug', { look: -0.5 }]],
      'p0.4': [['nabal', 'sit-speak', { to: 'y1' }]],
      'p0.5': [['nabal', 'sit-speak', { to: 'y1' }], ['guest', 'sit', { look: -1 }]],
      // 돌아가 전하자 — 모두 칼을 차라
      'p1.0': [['nabal', 'sit', { look: 0.3 }], ['y1', 'idle', { x: -1.1, z: 0.05, look: -1 }], ['y2', 'idle', { x: -1.15, z: 0.25, look: -1 }],
        ['david', 'idle', { show: 1, x: -1.45, z: -0.12, look: 1 }], ['m1', 'idle', { show: 1, x: -1.75, z: -0.3, look: 1 }], ['y1', 'speak', { to: 'david', delay: 3800 }]],
      'p1.1': [['y1', 'idle'], ['david', 'rebuke', { look: 1, item: 'sword' }]],
      'p1.2': [['david', 'idle', { item: 'sword' }], ['y1', 'idle', { look: 1 }], ['y2', 'idle', { look: 1 }], ['m1', 'idle', { look: 1 }]],
      // 한 종이 아비가일에게 달려간다
      'p1.3': [['servant', 'idle', { show: 1, x: 1.2, z: 0.05, look: 1 }], ['abigail', 'idle', { look: -1 }]],
      'p1.4': [['servant', 'speak', { to: 'abigail' }], ['abigail', 'listen']],
      // 아비가일은 서두른다 — 나귀에 예물을 싣고
      'p1.5': [['servant', 'idle'], ['donkey', null, { show: 1, x: 1.4, z: 0.32 }], ['abigail', 'idle', { x: 1.42, z: 0.18, look: 0 }]],
      'p1.6': [['abigail', 'ride', { board: 'donkey', x: 0, z: 0, look: 3 }], ['donkey', null, { x: -0.3, z: 0.42, delay: 1500 }], ['servant', 'idle', { x: 1.1, z: 0.45, look: -1, delay: 1800 }]],
      // 산골짜기 길에서 마주친다 — 나귀에서 내려 엎드린다
      'p2.0': [['donkey', null, { x: -0.3, z: 0.42 }], ['david', 'idle', { item: null, x: -1.0, z: 0.15, look: 1 }], ['m1', 'idle', { x: -1.35, z: 0.0, look: 1 }], ['y1', 'idle', { x: -1.3, z: 0.38 }],
        ['abigail', 'idle', { board: null, x: -0.62, z: 0.22, look: -1, delay: 1500 }], ['abigail', 'kneel', { delay: 3000 }]],
      'p2.1': [['abigail', 'bow', { look: -1 }]],
      'p2.2': [['abigail', 'kneel']],
      'p2.3': [['david', 'speak', { to: 'abigail' }]],
      'p2.4': [['david', 'raise', { look: 0.4 }]],
      'p2.5': [['david', 'bless', { to: 'abigail' }]],
      // 열흘쯤 뒤 — 나발은 잔칫자리에서 사라진다
      'p2.6': [['@env', 'dusk'], ['nabal', 'sit', { show: 0 }], ['guest', 'mourn', { look: -0.6 }], ['david', 'idle']],
      // 다윗이 아비가일을 아내로
      'p2.7': [['@env', 'day'], ['guest', 'sit', { show: 0 }], ['donkey', null, { show: 0 }], ['abigail', 'idle', { x: -0.72, z: 0.2, look: -1 }], ['david', 'idle', { x: -0.98, z: 0.15, look: 1 }]],
      w0: [['david', 'speak', { show: 1, to: 'abigail' }], ['abigail', 'listen', { show: 1 }]],
      w1: [['abigail', 'speak', { show: 1, to: 'david' }], ['david', 'listen', { show: 1 }]],
      w2: [['nabal', 'sit-speak', { show: 1 }]],
      end: [['abigail', 'idle', { look: -1 }], ['david', 'idle', { look: 1 }]],
    },
  },

  /* d18. 잠든 사울의 창과 물병 — 밤의 하길라 산. 왼쪽 산에서 다윗과 아비새가 진영을 내려다보고, 가운데 군막 앞에 사울이 누워 자고
     머리맡 땅에 창이 꽂혀 있다(spear 'ground'), 곁에 물병. 아브넬과 군사들이 둘러 잔다. 둘이 걸어 들어가 아비새가 창을 들려 하자 다윗이 막고,
     창과 물병만 가지고 건너편 산꼭대기로 — 그 산 위에 창과 물병이 다시 선다. 다윗이 외치고, 사울이 깨어 운다 */
  d18: {
    env: 'night',
    wide: 1.45,
    props: {
      sand: ['sand', 0, 0.05, { r: 1.9, color: '#c9b892', stones: 18 }],
      hillL: ['hill', -1.4, -0.25, { w: 0.6, h: 0.3, d: 0.5, color: '#8a7a5e' }],
      hillR: ['hill', 1.45, -0.3, { w: 0.6, h: 0.32, d: 0.5, color: '#8a7a5e' }],
      camp: ['camp', 0.0, -0.62, { n: 3, span: 1.0, color: '#8a7a62', flag: '#3c5d96', scale: 1.3 }],
      spear: ['spear', -0.32, 0.05, { state: 'ground', len: 0.9 }],
      jug: ['jug', -0.22, 0.14],
    },
    cast: {
      saul: ['saulS', 0.0, 0.05, 0, { pose: 'sleep' }],
      abner: ['abnerS', 0.6, 0.38, 0, { pose: 'sleep' }],
      sol1: ['israelite2', -0.55, 0.45, 0, { pose: 'sleep', gaze: false }],
      sol2: ['hebrew2', 0.55, -0.25, 0, { pose: 'sleep', gaze: false }],
      david: ['davidW', -1.4, -0.22, 1],
      abishai: ['abishai', -1.2, -0.05, 1],
    },
    beats: {
      enter: [['spear', 'ground', { show: 0 }], ['jug', null, { show: 0 }], ['david', 'point', { x: 1.42, z: -0.28, look: -1 }], ['abishai', 'idle', { x: 1.25, z: -0.08, look: -1 }],
        ['spear', 'ground', { show: 1, x: 1.62, z: -0.25, delay: 300 }], ['jug', null, { show: 1, x: 1.6, z: -0.1, delay: 300 }]],
      intro: [['@env', 'dusk'], ['saul', 'idle', { look: 0.4 }], ['abner', 'idle', { look: -0.6 }], ['sol1', 'idle', { look: 0.4 }], ['sol2', 'idle', { look: -0.4 }],
        ['spear', 'ground', { show: 0 }], ['jug', null, { show: 0 }], ['david', 'idle', { show: 0 }], ['abishai', 'idle', { show: 0 }]],
      // 하길라 산 길가에 진을 친다
      'p0.1': [['saul', 'speak', { to: 'abner' }]],
      // 그날 밤 — 다윗이 산 위에서 내려다본다
      'p0.2': [['@env', 'night'], ['saul', 'idle'], ['david', 'idle', { show: 1, look: 1 }], ['abishai', 'idle', { show: 1, look: 1 }]],
      // 진 한가운데 누운 사울, 둘러 누운 아브넬과 군사들
      'p0.3': [['saul', 'sleep'], ['abner', 'sleep'], ['sol1', 'sleep'], ['sol2', 'sleep'], ['spear', 'ground', { show: 1 }], ['jug', null, { show: 1 }]],
      'p0.4': [['david', 'speak', { to: 'abishai' }]],
      'p0.6': [['david', 'idle'], ['abishai', 'speak', { to: 'david' }]],
      // 잠든 진영 사이로
      'p1.0': [['abishai', 'idle'], ['david', 'idle', { x: -0.55, z: -0.12, look: 1 }], ['abishai', 'idle', { x: -0.75, z: 0.05, look: 1, delay: 500 }]],
      // 머리맡에 꽂힌 창
      'p1.1': [['david', 'point', { look: 1 }]],
      'p1.2': [['david', 'idle'], ['abishai', 'speak', { to: 'david' }]],
      'p1.3': [['abishai', 'rebuke', { look: 1 }]],
      // 다윗이 막는다
      'p1.5': [['abishai', 'idle'], ['david', 'rebuke', { to: 'abishai' }]],
      'p1.6': [['david', 'speak', { to: 'abishai' }]],
      // 창과 물병만 가지고
      'p1.7': [['david', 'idle', { x: -0.42, z: 0.0, look: 1 }], ['david', 'kneel', { delay: 1800 }], ['spear', 'ground', { show: 0, delay: 2800 }], ['jug', null, { show: 0, delay: 2800 }],
        ['spear', 'ground', { x: 1.62, z: -0.25, delay: 3600 }], ['jug', null, { x: 1.6, z: -0.1, delay: 3600 }], ['david', 'idle', { delay: 3800 }]],
      // 주께서 내리신 깊은 잠 — 아무도 깨지 않는다. 건너편 산으로
      'p1.8': [['spear', 'ground', { show: 0, x: 1.62, z: -0.25 }], ['jug', null, { show: 0, x: 1.6, z: -0.1 }], ['david', 'idle', { x: 1.42, z: -0.28, look: -1 }], ['abishai', 'idle', { x: 1.25, z: -0.08, look: -1, delay: 600 }]],
      // 산꼭대기에서 외친다
      'p2.0': [['david', 'raise', { look: -1 }]],
      'p2.1': [['david', 'speak', { to: 'abner' }], ['abner', 'idle', { look: 1 }]],
      'p2.2': [['david', 'point', { look: -1 }], ['spear', 'ground', { show: 1 }], ['jug', null, { show: 1 }]],
      // 사울이 그 목소리를 알아듣는다
      'p2.3': [['david', 'idle'], ['saul', 'idle', { look: 1 }]],
      'p2.4': [['saul', 'mourn', { look: 1 }]],
      'p2.5': [['saul', 'speak', { to: 'david' }]],
      // 창을 가져가라 — 젊은이 하나가 건너온다
      'p2.6': [['saul', 'idle'], ['david', 'speak', { to: 'saul' }], ['sol1', 'idle', { x: 1.15, z: 0.12, look: 1, delay: 1000 }], ['spear', 'ground', { show: 0, delay: 6500 }], ['sol1', 'idle', { x: 0.2, z: 0.4, look: -1, delay: 6800 }]],
      // 마지막으로 주고받은 말 — 다윗은 제 길을 간다
      'p2.7': [['spear', 'ground', { show: 0 }], ['david', 'idle', { x: 2.0, z: -0.1, look: 1 }], ['abishai', 'idle', { x: 2.0, z: 0.1, delay: 400 }], ['david', 'idle', { show: 0, delay: 3500 }], ['abishai', 'idle', { show: 0, delay: 3800 }],
        ['saul', 'idle', { look: 1 }]],
      'p2.8': [['@env', 'dawn'], ['david', 'idle', { show: 0 }], ['abishai', 'idle', { show: 0 }]],
      w0: [['david', 'speak', { show: 1, to: 'abishai' }], ['abishai', 'listen', { show: 1 }]],
      w1: [['david', 'speak', { show: 1, to: 'saul' }]],
      w2: [['saul', 'speak', { show: 1, to: 'david' }]],
      w3: [['abishai', 'speak', { show: 1, to: 'david' }], ['david', 'listen', { show: 1 }]],
      end: [['@env', 'dawn']],
    },
  },

  /* d19. 시글락이 불탄 날 — 블레셋 땅의 작은 성읍. 가드 왕 아기스가 다윗에게 시글락을 내주고, 집들 앞에 가족이 산다.
     사흘 길에서 돌아오니 집은 불탄 폐허(ruin)와 연기뿐 — 가족은 끌려가 보이지 않는다. 모두 엎드려 울고, 부하들이 다윗에게 손가락질한다.
     다윗이 주 안에서 힘을 얻어 에봇 앞에서 여쭙고(빛), 브솔 시냇가에 지친 이들이 남는다. 굶은 애굽 청년에게 빵을 주고 길을 얻는다.
     싸움은 그리지 않는다 — 끌려간 아내와 아이들이 돌아오고, 남았던 이들과 몫을 나눈다 */
  d19: {
    wide: 1.45,
    props: {
      sand: ['sand', 0, 0.05, { r: 1.9, color: '#c6b088', stones: 18 }],
      h1: ['house', -0.25, -0.58, { scale: 0.7 }],
      h2: ['house', 0.5, -0.62, { scale: 0.65, stair: false }],
      ruin: ['ruin', 0.1, -0.6, { scale: 1.3 }],
      brook: ['brook', 0, 0.62, { len: 2.6 }],
      beam: ['beam', -0.45, 0.12, { r: 0.3, h: 2.2 }],
    },
    cast: {
      david: ['davidW', -0.45, 0.12, 1],
      m1: ['israelite', -0.8, 0.0, 1],
      m2: ['israelite2', -0.85, 0.32, 1, { gaze: false }],
      m3: ['hebrew2', -0.15, 0.38, -1, { gaze: false }],
      achish: ['achish', 1.45, 0.0, -1],
      abigail: ['abigail', 0.05, -0.22, 0],
      ahinoam: ['woman2', 0.3, -0.25, 0, { gaze: false }],
      kid: ['child', 0.18, -0.12, 0, { gaze: false }],
      abiathar: ['abiathar', -1.95, 0.3, 1],
      egy: ['egyslave', 1.15, 0.42, -1, { pose: 'sit-ground' }],
    },
    beats: {
      enter: [['h1', null, { show: 0 }], ['h2', null, { show: 0 }], ['achish', 'idle', { show: 0 }], ['abiathar', 'idle', { show: 0 }], ['egy', 'idle', { show: 0 }], ['beam', null, { show: 0 }],
        ['ruin', 'cold'], ['abigail', 'embrace', { x: 0.62, z: 0.25, look: -1 }], ['ahinoam', 'idle', { x: 0.95, z: 0.15, look: -1 }], ['kid', 'idle', { x: 0.8, z: 0.4, look: -1 }],
        ['david', 'embrace', { x: 0.38, z: 0.25, look: 1 }], ['m1', 'raise', { x: -0.2, z: 0.05, look: 1 }], ['m2', 'idle', { x: -0.55, z: 0.45, look: 1 }], ['m3', 'idle', { x: -0.85, z: 0.3, look: 1 }]],
      intro: [['@env', 'day'], ['ruin', 'smoke', { show: 0 }], ['brook', null, { show: 0 }], ['beam', null, { show: 0 }], ['abiathar', 'idle', { show: 0 }], ['egy', 'idle', { show: 0 }],
        ['david', 'idle', { look: 0.3 }]],
      // 언젠가는 사울의 손에 — 블레셋 땅 가드 왕에게 몸을 맡긴다
      'p0.0': [['david', 'mourn', { look: 0 }]],
      'p0.1': [['david', 'idle', { x: 0.95, z: 0.15, look: 1 }], ['m1', 'idle', { x: 0.62, z: 0.08, look: 1, delay: 400 }], ['david', 'bow', { delay: 4500 }]],
      'p0.2': [['david', 'idle'], ['achish', 'speak', { to: 'david' }], ['achish', 'point', { look: -1, delay: 3000 }]],
      // 일 년 넉 달 — 가족과 함께
      'p0.3': [['achish', 'idle', { x: 2.0, z: 0.0, look: 1 }], ['achish', 'idle', { show: 0, delay: 2500 }], ['david', 'idle', { x: -0.45, z: 0.12, look: 0.6 }], ['m1', 'idle', { x: -0.8, z: 0.0, look: 1 }]],
      // 사흘 길에서 돌아오니 연기만
      'p0.4': [['achish', 'idle', { show: 0 }], ['@env', 'overcast'], ['abigail', 'idle', { show: 0 }], ['ahinoam', 'idle', { show: 0 }], ['kid', 'idle', { show: 0 }],
        ['h1', null, { show: 0 }], ['h2', null, { show: 0 }], ['ruin', 'smoke', { show: 1 }], ['david', 'idle', { look: 0 }], ['m1', 'idle', { look: 0.6 }]],
      'p0.5': [['david', 'afraid', { look: 0 }], ['m1', 'afraid'], ['m2', 'afraid'], ['m3', 'afraid', { look: -0.6 }]],
      // 소리 높여 운다 — 울 힘이 없을 때까지
      'p1.0': [['david', 'mourn'], ['m1', 'mourn'], ['m2', 'mourn'], ['m3', 'mourn']],
      'p1.1': [['m3', 'kneel']],
      // 돌로 치자 — 부하들이 다윗을 가리킨다
      'p1.3': [['m3', 'mourn'], ['m1', 'rebuke', { to: 'david' }], ['m2', 'point', { look: 1 }]],
      'p1.4': [['david', 'cower', { look: 0 }]],
      // 주 안에서 힘을 얻는다
      'p1.5': [['m1', 'idle'], ['m2', 'idle'], ['david', 'kneel', { look: 0 }], ['beam', null, { show: 1, x: -0.45, z: 0.12 }], ['david', 'pray', { delay: 1500 }]],
      // 에봇을 가져오게 하고 여쭙는다
      'p1.6': [['abiathar', 'idle', { show: 1, x: -0.75, z: 0.28, look: 1, item: 'cloak' }], ['david', 'kneel', { look: -1, delay: 2500 }]],
      'p1.7': [['david', 'look-up']],
      // 브솔 시내 — 지친 이백 명이 남는다
      'p2.0': [['beam', null, { show: 0 }], ['ruin', 'smoke', { show: 0 }], ['brook', null, { show: 1 }], ['abiathar', 'idle', { item: null, x: -1.1, z: 0.42, look: 1 }],
        ['m2', 'sit-ground', { x: -0.8, z: 0.48, look: 1 }], ['m3', 'sit-ground', { x: -0.45, z: 0.5, look: 1 }], ['david', 'idle', { x: 0.55, z: 0.25, look: 1 }], ['m1', 'idle', { x: 0.25, z: 0.12, look: 1 }]],
      // 굶은 애굽 사람을 먹이고 길을 얻는다
      'p2.1': [['egy', 'sit-ground', { show: 1 }], ['david', 'idle', { x: 0.85, z: 0.38, look: 1, item: 'bread' }], ['egy', 'sit-ground', { item: 'bread', delay: 3500 }], ['david', 'idle', { item: null, delay: 3500 }],
        ['egy', 'idle', { item: null, delay: 6500 }], ['egy', 'point', { look: 1, delay: 7500 }]],
      // 모든 것을 되찾는다 — 끌려간 이들이 돌아온다
      'p2.2': [['egy', 'idle', { show: 0 }], ['ahinoam', 'idle', { show: 1, x: 1.9, z: 0.0 }], ['abigail', 'idle', { show: 1, x: 1.95, z: 0.2 }], ['kid', 'idle', { show: 1, x: 2.0, z: 0.35 }],
        ['ahinoam', 'idle', { x: 0.95, z: 0.15, look: -1, delay: 300 }], ['abigail', 'idle', { x: 0.62, z: 0.25, look: -1, delay: 300 }], ['kid', 'idle', { x: 0.8, z: 0.4, look: -1, delay: 300 }],
        ['david', 'idle', { x: 0.38, z: 0.25, look: 1 }]],
      'p2.3': [['abigail', 'embrace', { look: -1 }], ['david', 'embrace', { look: 1 }], ['m1', 'raise', { x: -0.2, z: 0.05, look: 1 }]],
      // 나누지 말자 — 짐 곁에 남은 사람의 몫도 같다
      'p2.4': [['abigail', 'idle'], ['m1', 'rebuke', { look: -1 }], ['m2', 'idle', { x: -0.55, z: 0.45, look: 1 }], ['m3', 'idle', { x: -0.85, z: 0.3, look: 1 }]],
      'p2.5': [['m1', 'idle'], ['david', 'speak', { to: 'm1' }]],
      w0: [['beam', null, { show: 1 }], ['david', 'listen', { show: 1 }]],
      w1: [['david', 'speak', { show: 1, to: 'm1' }]],
      w2: [['david', 'speak', { show: 1, to: 'm1' }]],
      w3: [['david', 'speak', { show: 1 }]],
      end: [['m1', 'idle'], ['m2', 'idle'], ['david', 'idle', { look: 1 }]],
    },
  },

  /* d20. 길보아의 슬픔 — 사울의 죽음은 그리지 않는다(solemn). 흐린 길보아 산 위에 무릎 꿇은 사울과 방패 든 자, 빈 비탈에 꽂힌 창 하나.
     사울이 엎드리면 빛이 어두워지고 산 위가 빈다. 밤에 길르앗 야베스 사람들이 와서 에셀나무 아래 엎드려 금식한다.
     시글락의 다윗에게 아말렉 청년이 왕관을 내밀고, 다윗과 사람들이 옷을 찢고 운다. 요나단의 활을 들고 '활의 노래'를 짓는다 — 산 위에 희미한 빛 */
  d20: {
    env: 'overcast',
    wide: 1.45,
    solemn: true,
    props: {
      sand: ['sand', 0, 0.05, { r: 1.9, color: '#9a8c6e', stones: 16 }],
      hill: ['hill', 0.35, -0.42, { w: 0.85, h: 0.42, d: 0.55, color: '#7d7058' }],
      spear: ['spear', 0.0, -0.18, { state: 'ground', len: 0.9 }],
      tree: ['olive', 1.45, -0.05, { scale: 0.8 }],
      beam: ['beam', 0.35, -0.42, { r: 0.4, h: 2.4 }],
    },
    cast: {
      saul: ['saul', 0.3, -0.42, 0.6],
      bearer: ['israelite2', 0.62, -0.35, -1],
      j1: ['man', 2.0, 0.3, -1, { gaze: false }],
      j2: ['hebrew2', 2.05, 0.5, -1, { gaze: false }],
      david: ['davidW', -1.0, 0.25, 1],
      m1: ['israelite', -1.35, 0.08, 1, { gaze: false }],
      m2: ['hebrew', -1.4, 0.42, 1, { gaze: false }],
      lad: ['amalekite', 1.95, 0.3, -1],
    },
    beats: {
      enter: [['@env', 'dusk'], ['saul', 'idle', { show: 0 }], ['bearer', 'idle', { show: 0 }], ['j1', 'idle', { show: 0 }], ['j2', 'idle', { show: 0 }], ['lad', 'idle', { show: 0 }],
        ['beam', null, { show: 1 }], ['david', 'mourn', { item: 'bow', look: 1 }], ['m1', 'mourn'], ['m2', 'kneel']],
      intro: [['@env', 'overcast'], ['beam', null, { show: 0 }], ['j1', 'idle', { show: 0 }], ['j2', 'idle', { show: 0 }], ['david', 'idle', { show: 0 }], ['m1', 'idle', { show: 0 }], ['m2', 'idle', { show: 0 }], ['lad', 'idle', { show: 0 }],
        ['bearer', 'idle', { item: 'shield' }]],
      // 쓰러진 용사들 — 비탈에는 창 하나만
      'p0.1': [['saul', 'kneel', { look: 0.6 }]],
      'p0.2': [['saul', 'speak', { to: 'bearer' }]],
      'p0.4': [['saul', 'kneel'], ['bearer', 'afraid', { look: -1 }]],
      // 사울이 엎드린다 — 빛이 어두워지고 산 위가 빈다
      'p0.5': [['@env', 'dark'], ['saul', 'mourn'], ['saul', 'mourn', { show: 0, delay: 3000 }], ['bearer', 'mourn', { delay: 1500 }], ['bearer', 'mourn', { show: 0, delay: 4500 }]],
      'p0.6': [['saul', 'idle', { show: 0 }], ['bearer', 'idle', { show: 0 }]],
      // 길르앗 야베스의 용사들이 밤새 걸어와 — 에셀나무 아래 이레를 금식한다
      'p1.0': [['@env', 'night'], ['j1', 'idle', { show: 1, x: 0.85, z: 0.0, look: -1 }], ['j2', 'idle', { show: 1, x: 1.0, z: 0.22, look: -1 }], ['j1', 'kneel', { delay: 4500 }], ['j2', 'kneel', { delay: 4800 }]],
      'p1.1': [['j1', 'idle', { x: 1.12, z: 0.18, look: 0.4 }], ['j2', 'idle', { x: 1.75, z: 0.22, look: -0.6 }], ['j1', 'mourn', { delay: 2800 }], ['j2', 'mourn', { delay: 3000 }]],
      // 사흘째 시글락 — 옷을 찢고 흙을 쓴 아말렉 청년
      'p1.2': [['@env', 'overcast'], ['j1', 'idle', { show: 0 }], ['j2', 'idle', { show: 0 }], ['david', 'idle', { show: 1, look: 1 }], ['m1', 'idle', { show: 1 }], ['m2', 'idle', { show: 1 }],
        ['lad', 'idle', { show: 1, x: -0.5, z: 0.28, look: -1 }], ['lad', 'kneel', { delay: 5500 }]],
      'p1.3': [['lad', 'kneel', { item: 'gift', look: -1 }]],
      // 옷을 찢고 저녁까지 울며 금식한다
      'p1.4': [['@env', 'dusk'], ['lad', 'idle', { item: null, x: 0.4, z: 0.55, look: 1, delay: 1500 }], ['lad', 'idle', { show: 0, delay: 4500 }], ['david', 'mourn'], ['m1', 'mourn'], ['m2', 'kneel', { delay: 800 }]],
      // 노래를 지어 가르친다 — 활의 노래
      'p2.0': [['lad', 'idle', { show: 0 }], ['david', 'speak', { to: 'm1' }], ['m1', 'listen'], ['m2', 'listen']],
      'p2.1': [['david', 'idle', { item: 'bow', look: 1 }]],
      'p2.2': [['beam', null, { show: 1 }], ['david', 'look-up', { look: 1 }]],
      'p2.3': [['david', 'mourn']],
      'p2.4': [['david', 'speak', { to: 'm1' }]],
      'p2.5': [['david', 'point', { look: 1 }]],
      'p2.6': [['david', 'idle', { look: 0.6 }]],
      'p2.7': [['david', 'mourn']],
      w0: [['david', 'speak', { show: 1, to: 'm1' }]],
      w1: [['david', 'speak', { show: 1, to: 'm1' }]],
      w2: [['david', 'speak', { show: 1, to: 'm1' }]],
      w3: [['saul', 'speak', { show: 1, to: 'bearer' }], ['bearer', 'afraid', { show: 1 }]],
      end: [['@env', 'dusk'], ['beam', null, { show: 1 }], ['saul', 'idle', { show: 0 }], ['bearer', 'idle', { show: 0 }], ['david', 'mourn', { item: 'bow' }]],
    },
  },
};

// 숨겨진 보물 (사용자 2026-11): 예수님의 비유와 이야기에 나오는 물건을 어울리는 자리 둘레에 숨겨 두고, 가까이 가면 반짝인다.
// 걸을 때마다 다시 숨긴다 — 보물마다 희귀도만큼의 확률로 나오고(전설은 가끔만), 어울리는 후보 자리 가운데 한 곳에 숨는다.
// 찾으면 '보물 카드'(희귀도별 보석 테두리 — 보통·귀함·전설). 말씀은 기존 번역을 베끼지 않고 새로 옮겼다.
// 카드 그림은 cards.mjs treasures (_src/cards/treasures.json의 그림 설명) → _src/cards/out/t-<id>.webp → R2
export const RARITY = {
  common: { name: '보통', p: 1, pts: 150 },
  rare: { name: '귀함', p: 0.6, pts: 300 },
  legend: { name: '전설', p: 0.25, pts: 600 },
};

// 여정마다의 보물: at = 숨길 만한 장소(그 둘레 1.5–3.5km), clue = 보물 도감에 미리 보이는 단서
export const TREASURES = {
  jesus: [
    { id: 'field', name: '밭에 감춘 보화', rarity: 'legend', at: ['galilee_town', 'nazareth', 'nain', 'cana'], clue: '갈릴리 마을 둘레의 밭 어딘가',
      ref: '마 13:44', text: '하늘나라는 밭에 숨겨 둔 보물과 같다. 그것을 찾은 사람은 다시 숨겨 두고, 기뻐하며 가서 가진 것을 다 팔아 그 밭을 산다.' },
    { id: 'pearl', name: '값진 진주', rarity: 'legend', at: ['tyre'], clue: '지중해 바닷가, 큰 항구 둘레',
      ref: '마 13:45–46', text: '하늘나라는 좋은 진주를 찾는 장사꾼과 같다. 값진 진주 하나를 찾으면, 가서 가진 것을 다 팔아 그것을 산다.' },
    { id: 'net', name: '물고기 가득한 그물', rarity: 'legend', at: ['tabgha'], clue: '디베랴 바닷가, 새벽의 물가',
      ref: '요 21:11', text: '시몬 베드로가 올라가 그물을 뭍으로 끌어 올리니, 큰 물고기가 백쉰세 마리나 가득하였다. 그렇게 많아도 그물은 찢어지지 않았다.' },
    { id: 'sheep', name: '잃은 양 한 마리', rarity: 'rare', at: ['beatitudes', 'galilee_mountain', 'tabor', 'bethlehem'], clue: '산과 들 어딘가, 무리에서 떨어진 한 마리',
      ref: '눅 15:4–5', text: '양 백 마리 가운데 하나를 잃으면, 아흔아홉 마리를 들에 두고 잃은 것을 찾을 때까지 다니지 않겠느냐? 찾으면 기뻐하며 어깨에 메고 온다.' },
    { id: 'stater', name: '물고기 입의 은전', rarity: 'rare', at: ['capernaum', 'tabgha'], clue: '가버나움 물가, 낚시를 던질 만한 곳',
      ref: '마 17:27', text: '바다에 가서 낚시를 던져 먼저 올라오는 물고기를 잡아 입을 열어 보아라. 은전 하나가 있을 것이다.' },
    { id: 'mites', name: '과부의 두 렙돈', rarity: 'rare', at: ['temple', 'jerusalem'], clue: '예루살렘 성전, 헌금함 곁',
      ref: '막 12:43–44', text: '이 가난한 과부는 헌금함에 넣은 어느 누구보다 많이 넣었다. 그는 가진 것 전부, 살아갈 것 모두를 넣었다.' },
    { id: 'jar', name: '향유 옥합', rarity: 'rare', at: ['bethany'], clue: '감람산 너머 작은 마을',
      ref: '막 14:8', text: '이 여자는 할 수 있는 일을 하였다. 내 몸에 향유를 부어 장례를 미리 준비한 것이다.' },
    { id: 'ring', name: '돌아온 아들의 가락지', rarity: 'rare', at: ['perea', 'jericho', 'decapolis'], clue: '먼 길에서 돌아오는 길, 요단 건너편',
      ref: '눅 15:22', text: '아버지는 종들에게 말하였다. 어서 가장 좋은 옷을 꺼내 입히고, 손에 가락지를 끼우고, 발에 신을 신겨라.' },
    { id: 'coin', name: '잃은 드라크마', rarity: 'common', at: ['capernaum', 'nazareth', 'bethany', 'jericho', 'cana'], clue: '어느 마을 집 둘레, 등불을 켜고 쓸어 볼 곳',
      ref: '눅 15:8', text: '은화 열 개를 가진 여자가 하나를 잃으면, 등불을 켜고 집을 쓸며 찾을 때까지 꼼꼼히 찾지 않겠느냐?' },
    { id: 'mustard', name: '겨자씨 한 알', rarity: 'common', at: ['galilee_town', 'nain', 'cana', 'capernaum'], clue: '갈릴리의 밭, 가장 작은 씨앗',
      ref: '마 13:31–32', text: '하늘나라는 겨자씨 한 알과 같다. 어떤 씨보다 작지만 자라면 나무가 되어, 하늘의 새들이 그 가지에 깃든다.' },
    { id: 'bread', name: '보리떡 다섯과 물고기 둘', rarity: 'common', at: ['bethsaida', 'tabgha'], clue: '갈릴리 바다 북쪽의 풀밭',
      ref: '요 6:9', text: '여기 한 아이가 보리떡 다섯 개와 물고기 두 마리를 가지고 있습니다. 그러나 이 많은 사람에게 그것이 무슨 소용이 있겠습니까?' },
    { id: 'lamp', name: '기름 채운 등잔', rarity: 'common', at: ['nazareth', 'cana', 'nain', 'bethany'], clue: '어느 마을, 밤을 밝힐 등잔',
      ref: '마 25:4, 13', text: '슬기로운 처녀들은 등과 함께 그릇에 기름을 담아 갔다. 그러니 깨어 있어라. 너희는 그날과 그 시각을 모른다.' },
  ],
};

// 이번 길에 숨길 보물: 희귀도만큼의 확률로 고르고, 후보 자리 둘레 땅 위(물이 아닌 곳)에 둔다
export function hideTreasures(list, places, toXZ, blocked) {
  const out = [];
  for (const t of list || []) {
    if (Math.random() > RARITY[t.rarity].p) continue;
    const spots = t.at.filter(k => places[k]); if (!spots.length) continue;
    const p = places[spots[Math.floor(Math.random() * spots.length)]], [x0, z0] = toXZ(p.lat, p.lng);
    for (let k = 0; k < 20; k++) {
      const a = Math.random() * 6.283, d = 1.5 + Math.random() * 2, x = x0 + Math.cos(a) * d, z = z0 + Math.sin(a) * d;
      if (!blocked(x, z)) { out.push({ id: t.id, x: +x.toFixed(2), z: +z.toFixed(2) }); break; }
    }
  }
  return out;
}

// 보물 카드 (희귀도별 테두리 — CSS .ttcard.common/.rare/.legend)
// 앞뒤 카드 (사용자 2026-11): 카드 틀 안에 말씀 상자까지 넣으니 그림이 절반쯤만 보여 주인공이 잘렸다 —
// 앞면은 그림 전체에 제목·별만, 뒷면은 그 그림을 어둡게 깔고 말씀·장소·점수. 카드 모음에서는 앞면
export function flipCard(esc, cls, attr, src, alt, head, cap, word, foot, turn) {
  const fb = alt && alt !== src ? `this.onerror=null;this.src='${esc(alt)}'` : `this.style.visibility='hidden'`;
  return `<div class="${cls}" ${attr}><div class="tin">
    <div class="tface tfront"><img class="tbg" src="${esc(src)}" alt="" loading="lazy" onerror="${fb}">${head}<div class="tlow"><div class="tcap">${cap}</div>${foot}</div><span class="tturn">↻ ${turn}</span></div>
    <div class="tface tback" style="--bg:url('${esc(src)}')">${head}<div class="tword">${word}</div><div class="tcap">${cap}</div>${foot}</div>
  </div><i class="tholo"></i></div>`;
}
export function treasureCard(t, src, cls = '', esc = s => s) {
  const r = RARITY[t.rarity];
  return flipCard(esc, `tcard ttcard ${t.rarity} ${cls}`, '', src, '', `<div class="thead"><span class="tno">보물</span><b>${esc(t.name)}</b><span class="tst">${esc(r.name)}</span></div>`,
    esc(t.clue), `<q>${esc(t.text)}</q><cite>${esc(t.ref)}</cite>`, `<div class="tfoot"><span>그 길 · 숨겨진 보물</span><b class="tpt">${r.pts}점</b></div>`, '이야기');
}

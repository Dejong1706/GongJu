import type { Surface } from "./types";

/*
  벽지는 그림이 아니라 **무늬 종류(`kind`) + 색** 이라 한 파일에 목록으로 둔다.
  같은 무늬를 여러 벽지가 같이 쓰기 때문이다. 무늬는 두 군데에서 그린다 —
  방은 `PetRoom` 의 `backdrop`, 상점 칸은 `PetView` 의 `swatch`. **새 무늬는 둘 다 넣을 것**
*/
export const WALLS: Surface[] = [
  { id: "w0", name: "민무늬", price: 0, base: "#D9CCD4" },
  { id: "w1", name: "분홍", price: 80, base: "#F3DCE8" },
  { id: "w2", name: "민트", price: 80, base: "#D6EDE2" },
  { id: "w3", name: "하늘", price: 80, base: "#D8E8F5" },
  { id: "w4", name: "물방울", price: 160, base: "#F7E3EE", accent: "#E5C4D8", kind: "dot" },
  { id: "w5", name: "줄무늬", price: 160, base: "#FFF3F8", accent: "#F0D6E4", kind: "stripe" },
  // 값을 한 단계 올린 것들. 무늬가 한 겹 더 들어가거나 벽이 위아래로 나뉜다
  { id: "w6", name: "몰딩 벽", price: 220, base: "#F7F1F5", accent: "#E6DAE4", kind: "panel" },
  {
    id: "w7",
    name: "작은 꽃",
    price: 220,
    base: "#FFF7FB",
    accent: "#EFC3D8",
    accent2: "#FFD98A",
    kind: "flower",
  },
  // 골드(700) — 연분홍 넓은 띠 · 가장자리 금실 · 진주 알, 아래 금줄 몰딩 (9/17 시안실)
  {
    id: "w_goldstripe",
    name: "금실 줄무늬 벽지",
    price: 700,
    base: "#FFF4F8",
    accent: "#E3B85C",
    accent2: "#FBE3EC",
    kind: "goldstripe",
  },
  // 프리미엄(1,000) — 왕실 카펫과 한 벌. 크림 바탕 금 마름모, 위 진홍 띠, 아래 진홍 벽널에 금테 칸
  {
    id: "w_palace",
    name: "궁전 벽지",
    price: 1000,
    base: "#F8EEE6",
    accent: "#E3B85C",
    accent2: "#C8384F",
    kind: "palace",
  },
  /*
    조선 세트 · 골드(680) — 크림 한지, 맨 위만 먹빛 띠 · 아래 나무 벽널. 가운데는 비워 조용하게.

    9/21 까지는 **단청 띠**(진홍 · 청록에 금 · 흰 네모) 였다. 사용자가 "한국스럽기보다
    몽골 · 유목민 무늬 같다" 고 해서 기와 처마와 먹빛 띠를 시안으로 내고 **먹빛**을 골랐다.
    **id 는 그대로 둔다** — 9/17 에 상점으로 나간 뒤라 산 사람 문서에 `w_dancheong` 이 남아 있다.
    id 를 바꾸면 산 것이 사라지고 다시 사야 한다
  */
  {
    id: "w_dancheong",
    name: "먹빛 한지 벽지",
    price: 680,
    base: "#F4EBDD",
    accent: "#343B46",
    accent2: "#C9A227",
    kind: "meok",
  },
];

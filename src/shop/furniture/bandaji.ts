import type { ItemDef } from "../types";

/* 반닫이 20 x 13 (조선 세트 · 골드) — 나무 궤짝에 놋쇠 모서리 · 자물쇠. 가운데 줄에서 앞판이 반만 열린다 */
const PALETTE = { B: "#B9824F", b: "#7A4E2E", Y: "#C9A24A", K: "#3A2A20" };

const bandaji: ItemDef = {
  id: "bandaji",
  name: "반닫이",
  slot: "floor",
  price: 650,
  at: [8, 58],
  sprite: {
    rows: [
      "bbbbbbbbbbbbbbbbbbbb",
      "BBBBBBBBBBBBBBBBBBBB",
      "bbbbbbbbbbbbbbbbbbbb",
      "bYYbBBBBBBBBBBBBbYYb",
      "bYbBBBBBBBBBBBBBBbYb",
      "bBBBBBBYYYYYYBBBBBBb",
      "bBBBBBBYKYYKYBBBBBBb",
      "bBBBBBBYYYYYYBBBBBBb",
      "bbbbbbbbbbbbbbbbbbbb",
      "bYbBBBBBBBBBBBBBBbYb",
      "bYYbBBBBBBBBBBBBbYYb",
      "bbbbbbbbbbbbbbbbbbbb",
      "bbb..............bbb",
    ],
    palette: PALETTE,
  },
  views: {
    // 옆 10 폭 — 옆판에 놋쇠 모서리만
    right: {
      rows: [
        "bbbbbbbbbb",
        "BBBBBBBBBB",
        "bbbbbbbbbb",
        "bYYbBBbYYb",
        "bYbBBBBbYb",
        "bBBBBBBBBb",
        "bBBBBBBBBb",
        "bBBBBBBBBb",
        "bBBBBBBBBb",
        "bYbBBBBbYb",
        "bYYbBBbYYb",
        "bbbbbbbbbb",
        "bbb....bbb",
      ],
      palette: PALETTE,
    },
    // 뒤 — 장식 없는 널 세 장
    back: {
      rows: [
        "bbbbbbbbbbbbbbbbbbbb",
        "BBBBBBBBBBBBBBBBBBBB",
        "bbbbbbbbbbbbbbbbbbbb",
        "bBBBBBbBBBBBBbBBBBBb",
        "bBBBBBbBBBBBBbBBBBBb",
        "bBBBBBbBBBBBBbBBBBBb",
        "bBBBBBbBBBBBBbBBBBBb",
        "bBBBBBbBBBBBBbBBBBBb",
        "bBBBBBbBBBBBBbBBBBBb",
        "bBBBBBbBBBBBBbBBBBBb",
        "bBBBBBbBBBBBBbBBBBBb",
        "bbbbbbbbbbbbbbbbbbbb",
        "bbb..............bbb",
      ],
      palette: PALETTE,
    },
  },
};
export default bandaji;

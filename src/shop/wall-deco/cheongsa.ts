import type { ItemDef } from "../types";

/* 청사초롱 8 x 16 (조선 세트 · 골드) — 위아래 파랑 · 가운데 빨강, 금 고리 · 빨간 술. 불빛이 일렁인다 */
const lantern = (on: boolean) => [
  "...YY...",
  "...Y....",
  "..YYYY..",
  ".RRRRRR.",
  "BBBBBBBB",
  "BbBBBBbB",
  "RRRRRRRR",
  on ? "RLLLLLLR" : "RRLLLLRR",
  on ? "RRLLLLRR" : "RRRLLRRR",
  "BbBBBBbB",
  "BBBBBBBB",
  ".RRRRRR.",
  "..YYYY..",
  "...YY...",
  "...rr...",
  "...rr...",
];

const cheongsa: ItemDef = {
  id: "cheongsa",
  name: "청사초롱",
  slot: "wall",
  price: 600,
  at: [16, 8],
  sprite: { rows: lantern(false), palette: { Y: "#E3B85C", R: "#D8423A", r: "#B5302A", L: "#FF9A7A", B: "#3E6DB5", b: "#2E4F8A" } },
  anim: [lantern(false), lantern(true)],
};
export default cheongsa;

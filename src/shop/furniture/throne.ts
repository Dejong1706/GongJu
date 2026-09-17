import type { ItemDef } from "../types";
import { GOLD } from "../common/palette";

/* 왕좌 20 x 22 — 왕관 등받이 · 진홍 벨벳(단추 박음) · 금 팔걸이와 다리 */
const ROWS = [
  "......Y..YY..Y......",
  "......YY.YY.YY......",
  "......YYYYYYYY......",
  ".....YyyyyyyyyY.....",
  "....YYRRRRRRRRYY....",
  "....YRRRRRRRRRRY....",
  "....YRRRrRRrRRRY....",
  "....YRRRRRRRRRRY....",
  "....YRRrRRRRrRRY....",
  "....YRRRRRRRRRRY....",
  "....YRRRrRRrRRRY....",
  "....YRRRRRRRRRRY....",
  "YYY.YRRRRRRRRRRY.YYY",
  "YyY.YRRRRRRRRRRY.YyY",
  "YRY" + "Y".repeat(14) + "YRY",
  "YRY" + "R".repeat(14) + "YRY",
  "YRY" + "R".repeat(14) + "YRY",
  "Y".repeat(20),
  "Y" + "y".repeat(18) + "Y",
  ".Y..Y..........Y..Y.",
  ".Y..Y..........Y..Y.",
  ".YY.YY........YY.YY.",
];

const throne: ItemDef = {
  id: "throne",
  name: "왕좌",
  slot: "floor",
  price: 850,
  at: [48, 52],
  sprite: { rows: ROWS, palette: { ...GOLD, R: "#C8384F", r: "#9E2A3E" } },
};
export default throne;

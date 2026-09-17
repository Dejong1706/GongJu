import type { ItemDef } from "../types";
import { INK } from "../common/palette";

/* 까치호랑이 민화 16 x 14 (조선 세트 · 골드) — 한지에 눈 큰 호랑이, 오른쪽 위 소나무 가지에 까치 */
const minhwa: ItemDef = {
  id: "minhwa",
  name: "까치호랑이 민화",
  slot: "wall",
  price: 620,
  at: [52, 12],
  sprite: {
    rows: [
      "TTTTTTTTTTTTTTTT",
      "THHHHHHHHHHLLLHT",
      "THHHHHHHHHLLkLLT",
      "THHHHHHHHHHpkWHT",
      "TOOHHHHOOHHpHHHT",
      "TOOOOOOOOHHpHHOT",
      "TOWKOOWKOHHHHHOT",
      "TKOOOOOOKHHHHOHT",
      "TOOWWWWOOHHHOHHT",
      "TOOWKKWOOOOOOHHT",
      "TKOOWWOOKOKOKOHT",
      "TOOOOOOOOOOOOOHT",
      "THOHOHHHHOHOHHHT",
      "TTTTTTTTTTTTTTTT",
    ],
    palette: { T: "#8E6544", H: "#F4E6CC", O: "#F2994A", K: INK, W: "#FFFFFF", L: "#4E8F5A", p: "#7A5236", k: "#2E2A3A" },
  },
};
export default minhwa;

import type { ItemDef } from "../types";

/* 화관 12 x 8 (조선 세트 · 골드) — 머리 위로 솟은 금관에 분홍 꽃 · 옥, 양옆으로 옥 구슬이 늘어진다 */
const hwagwan: ItemDef = {
  id: "hwagwan",
  name: "화관",
  slot: "head",
  price: 650,
  at: [2, -4],
  sprite: {
    rows: [
      "J....YY....J",
      "PP..YJJY..PP",
      "PpP.YYYY.PpP",
      "YYYYYYYYYYYY",
      "YrYRYrrYRYrY",
      "yyyyyyyyyyyy",
      "J..........J",
      "J..........J",
    ],
    palette: { Y: "#FFD34D", y: "#E5A93A", P: "#FF7BAC", p: "#FFF3C4", J: "#7FD1B9", r: "#D8423A", R: "#3E6DB5" },
  },
};
export default hwagwan;

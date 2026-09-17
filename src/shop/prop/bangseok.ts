import type { ItemDef } from "../types";

/* 비단 방석 22 x 7 (조선 세트 · 깔개라 일반) — 바닥에 깔려 판다가 올라선다. 진홍 비단에 금테 · 가운데 마름모 */
const bangseok: ItemDef = {
  id: "bangseok",
  name: "비단 방석",
  slot: "flat",
  price: 380,
  at: [28, 76],
  sprite: {
    rows: [
      "...YYYYYYYYYYYYYYYY...",
      "..YRRRRRRRRRRRRRRRRY..",
      ".YRRRRRRRYYYYRRRRRRRY.",
      "YRRRRRRRYRRRRYRRRRRRRY",
      ".YRRRRRRRYYYYRRRRRRRY.",
      "..YRRRRRRRRRRRRRRRRY..",
      "...YYYYYYYYYYYYYYYY...",
    ],
    palette: { Y: "#E3B85C", R: "#C8463C" },
  },
};
export default bangseok;

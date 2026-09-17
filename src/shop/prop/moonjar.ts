import type { ItemDef } from "../types";

/* 달항아리 10 x 10 (조선 세트 · 작아서 일반) — 둥근 백자. 어느 쪽에서 봐도 같다 */
const moonjar: ItemDef = {
  id: "moonjar",
  name: "달항아리",
  slot: "floor",
  price: 420,
  at: [62, 66],
  sprite: {
    rows: [
      "...wwww...",
      "..wWWWWw..",
      ".wWWWWWWw.",
      "wWWiWWWWWw",
      "wWiWWWWWWw",
      "wWWWWWWWWw",
      "wWWWWWWWWw",
      ".wWWWWWWw.",
      "..wWWWWw..",
      "...wwww...",
    ],
    palette: { W: "#FBF7EE", w: "#D9CFBF", i: "#FFFFFF" },
  },
};
export default moonjar;

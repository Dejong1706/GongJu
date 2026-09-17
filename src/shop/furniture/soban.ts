import type { ItemDef } from "../types";
import { flipRows } from "../common/draw";

/* 소반 다과상 16 x 9 (조선 세트 · 작아서 일반) — 작은 상에 청자 주전자 · 찻잔 · 약과 */
const ROWS = [
  "...ww...........",
  "..wwwwwh....YY..",
  ".wwwwww..cc.YYYY",
  "bbbbbbbbbbbbbbbb",
  "BBBBBBBBBBBBBBBB",
  "bbbbbbbbbbbbbbbb",
  ".bB..........Bb.",
  ".bB..........Bb.",
  ".bb..........bb.",
];
const PALETTE = { w: "#9FC9B4", h: "#9FC9B4", c: "#FFFFFF", Y: "#B5652E", B: "#C08A55", b: "#7A4E2E" };

const soban: ItemDef = {
  id: "soban",
  name: "소반 다과상",
  slot: "floor",
  price: 450,
  at: [40, 70],
  sprite: { rows: ROWS, palette: PALETTE },
  views: {
    // 옆 10 폭 — 상이 좁아지고 주전자 뒤로 약과 · 찻잔이 겹친다
    right: {
      rows: [
        "..ww......",
        ".wwwwh....",
        ".wwww.YYc.",
        "bbbbbbbbbb",
        "BBBBBBBBBB",
        "bbbbbbbbbb",
        ".bB....Bb.",
        ".bB....Bb.",
        ".bb....bb.",
      ],
      palette: PALETTE,
    },
    // 뒤 — 맞은편에서 보면 주전자와 약과 자리가 바뀐다
    back: { rows: flipRows(ROWS), palette: PALETTE },
  },
};
export default soban;

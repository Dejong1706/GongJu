import type { ItemDef } from "../types";
import { INK } from "../common/palette";
import { HW } from "../common/halloween";

/* 호박 등 12 x 10 (할로윈 세트) — 눈 · 코 · 입에 촛불이 비친다. 불빛이 두 색으로 일렁인다 (세 장) */
const jackRows = (hot: boolean) =>
  [
    ".....gg.....",
    "....gg......",
    "..KKKKKKKK..",
    ".KOOoOOoOOK.",
    "KOOoOOOOoOOK",
    "KOYYoOOoYYOK",
    "KOOoOYYOoOOK",
    "KOYoYYYYoYOK",
    ".KOoOYYOoOK.",
    "..KKKKKKKK..",
  ].map((r) => (hot ? r : r.replace(/Y/g, "y")));

const hwJack: ItemDef = {
  id: "hw_jack",
  name: "호박 등",
  slot: "floor",
  price: 400,
  at: [23, 76],
  sprite: {
    rows: jackRows(true),
    palette: { K: INK, O: HW.pump, o: HW.pumpSh, g: HW.stem, Y: HW.glow, y: HW.glow2 },
  },
  anim: [jackRows(true), jackRows(true), jackRows(false)],
};
export default hwJack;

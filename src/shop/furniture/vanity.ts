import type { ItemDef } from "../types";
import { FURN } from "../common/palette";

/* 공주 화장대 20 x 22 */
const ROWS = [
  ".......YYYYYY.......",
  ".....YYmmmmmmYY.....",
  "....YmmMMmmmmmmY....",
  "...YmmMMmmmmmmmmY...",
  "...YmMMmmmmmmmmmY...",
  "...YmMmmmmmmmmmmY...",
  "...YmmmmmmmmmmmmY...",
  "...YmmmmmmmmmmmmY...",
  "....YmmmmmmmmmmY....",
  ".....YYmmmmmmYY.....",
  ".......YYYYYY.......",
  "..pp.....YY....jjj..",
  "..PP.....YY....jJj..",
  "hhhhhhhhhhhhhhhhhhhh",
  "HHHHHHHHHHHHHHHHHHHH",
  "hhhhhhhhhhhhhhhhhhhh",
  "hHHHHHHh....hHHHHHHh",
  "hHHYHHHh....hHHHYHHh",
  "hhhhhhhh....hhhhhhhh",
  "hHh..............hHh",
  "hHh..............hHh",
  "hhh..............hhh",
];

/* 옆 12 x 22 — 거울은 옆에서 보면 금테 한 줄. 향수병만 보이고 서랍장은 옆판 */
const SIDE = [
  ".....Y......",
  "....Yh......",
  "....Yh......",
  "....Yh......",
  "....Yh......",
  "....Yh......",
  "....Yh......",
  "....Yh......",
  "....Yh......",
  "....Yh......",
  ".....Y......",
  ".....Y..pp..",
  ".....Y..PP..",
  "hhhhhhhhhhhh",
  "HHHHHHHHHHHH",
  "hhhhhhhhhhhh",
  "hHHHHHHHHHHh",
  "hHHHHHHHHHHh",
  "hhhhhhhhhhhh",
  "hHh......hHh",
  "hHh......hHh",
  "hhh......hhh",
];

/* 뒤 20 x 22 — 거울 뒷면은 흰 판, 향수병 · 보석함은 자리가 바뀌고, 서랍 대신 뒤판 */
const BACK = [
  ...ROWS.slice(0, 11).map((r) => r.replace(/[mM]/g, "H")),
  "..jjj....YY.....pp..",
  "..jJj....YY.....PP..",
  "hhhhhhhhhhhhhhhhhhhh",
  "HHHHHHHHHHHHHHHHHHHH",
  "hhhhhhhhhhhhhhhhhhhh",
  "hHHHHHHHHHHHHHHHHHHh",
  "hHHHHHHHHHHHHHHHHHHh",
  "hhhhhhhhhhhhhhhhhhhh",
  "hHh..............hHh",
  "hHh..............hHh",
  "hhh..............hhh",
];

const vanity: ItemDef = {
  id: "vanity",
  name: "공주 화장대",
  slot: "floor",
  price: 800,
  at: [52, 50],
  sprite: { rows: ROWS, palette: FURN },
  views: { right: { rows: SIDE, palette: FURN }, back: { rows: BACK, palette: FURN } },
};
export default vanity;

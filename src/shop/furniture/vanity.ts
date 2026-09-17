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

const vanity: ItemDef = {
  id: "vanity",
  name: "공주 화장대",
  slot: "floor",
  price: 800,
  at: [52, 50],
  sprite: { rows: ROWS, palette: FURN },
};
export default vanity;

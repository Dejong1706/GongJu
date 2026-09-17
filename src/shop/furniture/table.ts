import type { ItemDef } from "../types";
import { s } from "../common/palette";

const table: ItemDef = {
  id: "table",
  name: "둥근 탁자",
  slot: "floor",
  price: 180,
  at: [34, 66],
  sprite: s(
    [
      "..hhhhhhhh..",
      "hHHHHHHHHHHh",
      "hhhhhhhhhhhh",
      "....hHHh....",
      "....hHHh....",
      "....hHHh....",
      "..hhHHHHhh..",
      "..hhhhhhhh..",
    ],
    "Hh"
  ),
};
export default table;

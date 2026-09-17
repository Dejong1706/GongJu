import type { ItemDef } from "../types";
import { s } from "../common/palette";

const desk: ItemDef = {
  id: "desk",
  name: "책상",
  slot: "floor",
  price: 300,
  at: [52, 60],
  sprite: s(
    [
      "hhhhhhhhhhhhhhhhhhhh",
      "HHHHHHHHHHHHHHHHHHHH",
      "hhhhhhhhhhhhhhhhhhhh",
      "hH................Hh",
      "hH................Hh",
      "hH................Hh",
      "hH................Hh",
      "hh................hh",
    ],
    "Hh"
  ),
};
export default desk;

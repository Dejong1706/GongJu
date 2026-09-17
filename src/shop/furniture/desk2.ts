import type { ItemDef } from "../types";
import { s } from "../common/palette";

const desk2: ItemDef = {
  id: "desk2",
  name: "공부 책상",
  slot: "floor",
  price: 280,
  at: [46, 58],
  sprite: s(
    [
      "hhhhhhhhhhhhhhhhhhhhhh",
      "HHHHHHHHHHHHHHHHHHHHHH",
      "hhhhhhhhhhhhhhhhhhhhhh",
      "hH.............hHHHHHh",
      "hH.............hhhhhhh",
      "hH.............hHHHHHh",
      "hH.............hhhhhhh",
      "hH.............hHHHHHh",
      "hH.............hH...Hh",
      "hh.............hh...hh",
    ],
    "Hh"
  ),
};
export default desk2;

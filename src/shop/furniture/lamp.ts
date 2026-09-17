import type { ItemDef } from "../types";
import { s } from "../common/palette";

const lamp: ItemDef = {
  id: "lamp",
  name: "스탠드",
  slot: "floor",
  price: 120,
  at: [33, 57],
  sprite: s(
    [
      ".NNNN.",
      "NNNNNN",
      "NNNNNN",
      ".nnnn.",
      "..hH..",
      "..hH..",
      "..hH..",
      "..hH..",
      "..hH..",
      "..hH..",
      ".hHHh.",
      "hhHHhh",
    ],
    "NnHh"
  ),
};
export default lamp;

import type { ItemDef } from "../types";
import { s } from "../common/palette";

const bunny: ItemDef = {
  id: "bunny",
  name: "토끼 인형",
  slot: "floor",
  price: 90,
  at: [24, 76],
  sprite: s(
    [
      ".WW..WW.",
      ".WW..WW.",
      ".WW..WW.",
      ".WWWWWW.",
      "WWWWWWWW",
      "WKWWWWKW",
      "WWWppWWW",
      "WWWWWWWW",
      ".WWWWWW.",
      "..WWWW..",
    ],
    "WKp"
  ),
};
export default bunny;

import type { ItemDef } from "../types";
import { s } from "../common/palette";

const clock: ItemDef = {
  id: "clock",
  name: "벽시계",
  slot: "wall",
  price: 100,
  at: [56, 14],
  sprite: s(
    [
      "..KKKK..",
      ".KWWWWK.",
      "KWWKWWWK",
      "KWWKWWWK",
      "KWWKKWWK",
      "KWWWWWWK",
      ".KWWWWK.",
      "..KKKK..",
    ],
    "KW"
  ),
};
export default clock;

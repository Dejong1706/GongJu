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
  // 옆 10 폭 — 다리 사이만 좁아진다. 뒤에서 봐도 앞과 같은 모양이다
  views: {
    right: s(
      [
        "hhhhhhhhhh",
        "HHHHHHHHHH",
        "hhhhhhhhhh",
        "hH......Hh",
        "hH......Hh",
        "hH......Hh",
        "hH......Hh",
        "hh......hh",
      ],
      "Hh"
    ),
    back: s(
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
  },
};
export default desk;

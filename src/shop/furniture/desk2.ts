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
  /*
    옆 10 폭 — 서랍장 옆판이 다리 사이를 막는다. 반대쪽 옆도 서랍장이 비쳐 같은 모양이라 뒤집기로 둔다.
    뒤 — 서랍장이 왼쪽으로 가고 서랍 줄 없이 뒤판만
  */
  views: {
    right: s(
      [
        "hhhhhhhhhh",
        "HHHHHHHHHH",
        "hhhhhhhhhh",
        "hHHHHHHHHh",
        "hHHHHHHHHh",
        "hHHHHHHHHh",
        "hHHHHHHHHh",
        "hHHHHHHHHh",
        "hH......Hh",
        "hh......hh",
      ],
      "Hh"
    ),
    back: s(
      [
        "hhhhhhhhhhhhhhhhhhhhhh",
        "HHHHHHHHHHHHHHHHHHHHHH",
        "hhhhhhhhhhhhhhhhhhhhhh",
        "hHHHHHh.............Hh",
        "hHHHHHh.............Hh",
        "hHHHHHh.............Hh",
        "hHHHHHh.............Hh",
        "hHHHHHh.............Hh",
        "hH...Hh.............Hh",
        "hh...hh.............hh",
      ],
      "Hh"
    ),
  },
};
export default desk2;

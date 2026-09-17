import type { ItemDef } from "../types";
import { s } from "../common/palette";

const shelf: ItemDef = {
  id: "shelf",
  name: "책장",
  slot: "floor",
  price: 300,
  at: [60, 55],
  // 흰 책장에 책만 색을 준다. 칸을 나누는 줄도 테두리색이라 책이 도드라진다
  sprite: s(
    [
      "hhhhhhhhhhhh",
      "hHHHHHHHHHHh",
      "hRRUUGGNNRRh",
      "hRRUUGGNNRRh",
      "hhhhhhhhhhhh",
      "hUUNNRRGGUUh",
      "hUUNNRRGGUUh",
      "hhhhhhhhhhhh",
      "hGGRRUUNNGGh",
      "hGGRRUUNNGGh",
      "hhhhhhhhhhhh",
      "hHHHHHHHHHHh",
      "hHHHHHHHHHHh",
      "hhh......hhh",
    ],
    "HhRUGN"
  ),
  // 옆 5 폭은 옆판 한 장, 뒤는 뒤판 — 칸 줄만 남기고 책은 안 보인다
  views: {
    right: s(
      [
        "hhhhh",
        "hHHHh",
        "hHHHh",
        "hHHHh",
        "hHHHh",
        "hHHHh",
        "hHHHh",
        "hHHHh",
        "hHHHh",
        "hHHHh",
        "hHHHh",
        "hHHHh",
        "hHHHh",
        "hh.hh",
      ],
      "Hh"
    ),
    back: s(
      [
        "hhhhhhhhhhhh",
        "hHHHHHHHHHHh",
        "hHHHHHHHHHHh",
        "hHHHHHHHHHHh",
        "hhhhhhhhhhhh",
        "hHHHHHHHHHHh",
        "hHHHHHHHHHHh",
        "hhhhhhhhhhhh",
        "hHHHHHHHHHHh",
        "hHHHHHHHHHHh",
        "hhhhhhhhhhhh",
        "hHHHHHHHHHHh",
        "hHHHHHHHHHHh",
        "hhh......hhh",
      ],
      "Hh"
    ),
  },
};
export default shelf;

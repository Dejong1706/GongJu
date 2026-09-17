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
};
export default shelf;

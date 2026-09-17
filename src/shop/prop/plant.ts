import type { ItemDef } from "../types";
import { s } from "../common/palette";

const plant: ItemDef = {
  id: "plant",
  name: "화분",
  slot: "floor",
  price: 140,
  at: [10, 62],
  sprite: s(
    [
      "..GG.GG.",
      ".GGGGGGG",
      "GGGGGGGG",
      ".GGGGGG.",
      "...GG...",
      "...GG...",
      "TTTTTTTT",
      ".TTTTTT.",
      ".TTTTTT.",
    ],
    "GT"
  ),
};
export default plant;

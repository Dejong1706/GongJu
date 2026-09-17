import type { ItemDef } from "../types";
import { s } from "../common/palette";

const pot: ItemDef = {
  id: "pot",
  name: "작은 화분",
  slot: "top",
  price: 60,
  at: [54, 51],
  sprite: s(["..GG..", ".GGGG.", "GGgGGG", ".GGGG.", "..GG..", "TTTTTT", ".TTTT."], "GgT"),
};
export default pot;

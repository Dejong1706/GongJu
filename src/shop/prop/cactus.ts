import type { ItemDef } from "../types";
import { s } from "../common/palette";

const cactus: ItemDef = {
  id: "cactus",
  name: "선인장",
  slot: "top",
  price: 60,
  at: [36, 60],
  sprite: s(
    ["..GG..", "G.GG..", "GGGG.G", ".GGGGG", "..gG..", "..GG..", "TTTTTT", ".TTTT."],
    "GgT"
  ),
};
export default cactus;

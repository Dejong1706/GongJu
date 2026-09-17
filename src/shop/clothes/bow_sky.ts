import type { ItemDef } from "../types";
import { BOW } from "../common/bow";
import { INK } from "../common/palette";

const bowSky: ItemDef = {
  id: "bow_sky",
  name: "하늘 왕리본",
  slot: "head",
  price: 60,
  at: [1, -4],
  sprite: { rows: BOW, palette: { K: INK, R: "#8FC4F0", d: "#5A93C9" } },
};
export default bowSky;

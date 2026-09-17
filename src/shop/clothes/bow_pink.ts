import type { ItemDef } from "../types";
import { BOW } from "../common/bow";
import { INK } from "../common/palette";

const bowPink: ItemDef = {
  id: "bow_pink",
  name: "분홍 왕리본",
  slot: "head",
  price: 60,
  at: [1, -4],
  sprite: { rows: BOW, palette: { K: INK, R: "#FF8FBC", d: "#E2648F" } },
};
export default bowPink;

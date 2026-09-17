import type { ItemDef } from "../types";
import { BED } from "../common/bed";
import { s } from "../common/palette";

/* 그림은 캐노피 침대와 같이 쓰느라 common/bed.ts 에 있다 */
const bed: ItemDef = {
  id: "bed",
  name: "침대",
  slot: "floor",
  price: 320,
  at: [9, 56],
  sprite: s(BED, "HhWQq"),
};
export default bed;

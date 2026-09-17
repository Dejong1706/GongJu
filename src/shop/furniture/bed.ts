import type { ItemDef } from "../types";
import { BED, BED_BACK, BED_FRONT } from "../common/bed";
import { s } from "../common/palette";

/* 그림은 캐노피 침대와 같이 쓰느라 common/bed.ts 에 있다. 기본은 긴 쪽이 보이는 오른쪽 모습 */
const bed: ItemDef = {
  id: "bed",
  name: "침대",
  slot: "floor",
  price: 320,
  at: [9, 56],
  sprite: s(BED, "HhWQq"),
  face: "right",
  views: { front: s(BED_FRONT, "HhWQq"), back: s(BED_BACK, "HhWQq") },
};
export default bed;

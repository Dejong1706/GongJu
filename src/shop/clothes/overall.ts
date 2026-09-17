import type { ItemDef } from "../types";
import { s } from "../common/palette";

const overall: ItemDef = {
  id: "overall",
  name: "멜빵바지",
  slot: "body",
  price: 220,
  at: [3, 13],
  sprite: s(["...U..U...", "..UUUUUU..", "..uuuuuu.."], "Uu"),
};
export default overall;

import type { ItemDef } from "../types";
import { s } from "../common/palette";

const bear: ItemDef = {
  id: "bear",
  name: "곰 인형",
  slot: "floor",
  price: 90,
  at: [36, 78],
  sprite: s(
    [
      "ZZ....ZZ",
      "ZZZZZZZZ",
      "ZKZZZZKZ",
      "ZZZWWZZZ",
      "ZZZWKWZZ",
      "ZZZZZZZZ",
      "zZZZZZZz",
      "zzZZZZzz",
      ".zzzzzz.",
    ],
    "ZzKW"
  ),
};
export default bear;

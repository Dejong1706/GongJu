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
  // 옆은 귀 하나 · 눈 하나 · 앞으로 나온 주둥이, 뒤는 얼굴 없이 꼬리 한 점
  views: {
    right: s(
      [
        ".ZZ.....",
        "ZZZZZZ..",
        "ZZZZKZZ.",
        "ZZZZZWWK",
        "ZZZZZZW.",
        ".ZZZZZ..",
        "zZZZZZz.",
        "zzZZZzz.",
        ".zzzzz..",
      ],
      "ZzKW"
    ),
    back: s(
      [
        "ZZ....ZZ",
        "ZZZZZZZZ",
        "ZZZZZZZZ",
        "ZZZZZZZZ",
        "ZZZZZZZZ",
        "ZZZZZZZZ",
        "zZZzzZZz",
        "zzZZZZzz",
        ".zzzzzz.",
      ],
      "Zz"
    ),
  },
};
export default bear;

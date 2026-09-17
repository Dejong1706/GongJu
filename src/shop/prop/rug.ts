import type { ItemDef } from "../types";
import { s } from "../common/palette";

const rug: ItemDef = {
  id: "rug",
  name: "분홍 러그",
  slot: "flat",
  price: 100,
  at: [26, 74],
  // 28 x 8. 판다(16폭) 가 올라서도 자리가 남아야 깔개로 보인다
  sprite: s(
    [
      "......QQQQQQQQQQQQQQQQ......",
      "...QQQQQQQQQQQQQQQQQQQQQQ...",
      ".QQQQQQQQQQQQQQQQQQQQQQQQQQ.",
      "QQQqqqqqqqqqqqqqqqqqqqqqqQQQ",
      "QQQqqqqqqqqqqqqqqqqqqqqqqQQQ",
      ".QQQQQQQQQQQQQQQQQQQQQQQQQQ.",
      "...QQQQQQQQQQQQQQQQQQQQQQ...",
      "......QQQQQQQQQQQQQQQQ......",
    ],
    "Qq"
  ),
};
export default rug;

import type { ItemDef } from "../types";
import { s } from "../common/palette";

const bunny: ItemDef = {
  id: "bunny",
  name: "토끼 인형",
  slot: "floor",
  price: 90,
  at: [24, 76],
  sprite: s(
    [
      ".WW..WW.",
      ".WW..WW.",
      ".WW..WW.",
      ".WWWWWW.",
      "WWWWWWWW",
      "WKWWWWKW",
      "WWWppWWW",
      "WWWWWWWW",
      ".WWWWWW.",
      "..WWWW..",
    ],
    "WKp"
  ),
  // 옆은 귀가 뒤로 눕고 눈 하나 · 코끝, 뒤는 얼굴 없이 분홍 꼬리
  views: {
    right: s(
      [
        "..WW....",
        ".WW.....",
        ".WW.....",
        "WWWWWW..",
        "WWWWWWW.",
        "WWWWKWWW",
        "WWWWWWWp",
        "WWWWWWW.",
        ".WWWWWW.",
        "..WWWW..",
      ],
      "WKp"
    ),
    back: s(
      [
        ".WW..WW.",
        ".WW..WW.",
        ".WW..WW.",
        ".WWWWWW.",
        "WWWWWWWW",
        "WWWWWWWW",
        "WWWWWWWW",
        "WWWppWWW",
        ".WWWWWW.",
        "..WWWW..",
      ],
      "Wp"
    ),
  },
};
export default bunny;

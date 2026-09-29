import type { ItemDef } from "../types";
import { HW } from "../common/halloween";

/*
  해골 가면 10 x 8 (할로윈 세트) — 판다 얼굴(머리 안쪽 x 3~12 · y 3~10) 을 통째로 덮어 **귀여운 해골 얼굴**이 된다.
  귀와 머리 테두리는 판다 것이 그대로 보인다. 꽉 찬 눈구멍 왼쪽 위에 반짝이 한 점 · 볼에 분홍 · 꿰맨 입.
  반짝이를 눈구멍 한가운데 찍었더니 속 빈 네모라 **안경**처럼 보여서 모서리로 옮겼다.
  머리(head) 칸이라 모자와는 같이 못 쓴다
*/
const hwSkull: ItemDef = {
  id: "hw_skull",
  name: "해골 가면",
  slot: "head",
  price: 500,
  at: [3, 3],
  sprite: {
    rows: [
      "WWWWWWWWWW",
      "WHKKWWHKKW",
      "WKKKWWKKKW",
      "WKKKWWKKKW",
      "WPWWKKWWPW",
      "WWWWWWWWWW",
      "WwKKKKKKwW",
      "wWWKWWKWWw",
    ],
    palette: { W: HW.bone, w: HW.boneSh, K: HW.suit, H: "#FFFFFF", P: "#FFB7D0" },
  },
};
export default hwSkull;

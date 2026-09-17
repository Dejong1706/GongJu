import type { ItemDef } from "../types";
import { INK } from "../common/palette";

const frame: ItemDef = {
  id: "frame",
  name: "액자",
  slot: "wall",
  price: 120,
  at: [16, 16],
  // 창문과 같은 하늘·풀색을 써서 창밖 풍경을 담아놓은 것처럼 보이게 했다
  sprite: {
    rows: [
      "KKKKKKKKKK",
      "KWWWWWWWWK",
      "KWAAAAAAWK",
      "KWAAASSAWK",
      "KWAAASSAWK",
      "KWALLAAAWK",
      "KWALLAAAWK",
      "KWEEEEEEWK",
      "KWWWWWWWWK",
      "KKKKKKKKKK",
    ],
    palette: { K: INK, W: "#FFFFFF", A: "#A8D8F0", S: "#FFD34D", L: "#5FA34E", E: "#8FC97A" },
  },
};
export default frame;

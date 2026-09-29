import type { ItemDef } from "../types";
import { INK } from "../common/palette";
import { HW } from "../common/halloween";

/* 호박 모자 10 x 7 (할로윈 세트) — 귀 사이에 작은 호박 등을 얹는다. 얼굴을 가리면 판다가 안 보여서 머리 위에만 */
const hwPumpkinHat: ItemDef = {
  id: "hw_pumpkin_hat",
  name: "호박 모자",
  slot: "head",
  price: 450,
  at: [3, -5],
  sprite: {
    rows: [
      "....gg....",
      "...gg.....",
      ".OOoOOoOO.",
      "OOoKOOKoOO",
      "OOoOOOOoOO",
      "OOoKKKKoOO",
      ".OOoOOoOO.",
    ],
    palette: { O: HW.pump, o: HW.pumpSh, K: INK, g: HW.stem },
  },
};
export default hwPumpkinHat;

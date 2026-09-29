import type { ItemDef } from "../types";
import { HW } from "../common/halloween";

/* 마녀 모자 18 x 11 (할로윈 세트) — 끝이 오른쪽으로 꺾인 보라 고깔 · 주황 띠 · 금 버클, 챙이 머리보다 넓다 */
const hwWitch: ItemDef = {
  id: "hw_witch",
  name: "마녀 모자",
  slot: "head",
  price: 600,
  at: [-1, -9],
  sprite: {
    rows: [
      "............PPp...",
      "..........PPPp....",
      ".........PPPp.....",
      "........PPPPp.....",
      ".......PPPPPp.....",
      ".......PPPPPPp....",
      "......PPPPPPPp....",
      "......OOOYYOOO....",
      ".....PPPPPPPPPp...",
      "PPPPPPPPPPPPPPPPPP",
      ".pppppppppppppppp.",
    ],
    palette: { P: HW.witch, p: HW.witchSh, O: HW.band, Y: HW.buckle },
  },
};
export default hwWitch;

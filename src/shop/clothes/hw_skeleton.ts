import type { ItemDef } from "../types";
import { HW } from "../common/halloween";

/*
  해골 옷 12 x 5 (할로윈 세트) — 검은 옷 위에 갈비뼈 · 등뼈, 소매 끝에 손뼈가 삐죽 나온다 (몸 밖으로 뻗어야 옷이 산다).
  4줄로는 뼈가 안 보여서 머리 아래 한 줄까지 덮는 5줄로 그렸다
*/
const hwSkeleton: ItemDef = {
  id: "hw_skeleton",
  name: "해골 옷",
  slot: "body",
  price: 550,
  at: [2, 11],
  sprite: {
    rows: [
      "...BBWWBB...",
      "WWBWWWWWWBWW",
      "..BBBWWBBB..",
      "..BWWBWWWB..",
      "..BWBBBBWB..",
    ],
    palette: { B: HW.suit, W: HW.bone },
  },
};
export default hwSkeleton;

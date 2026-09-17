import { CLOUD, SPRING, win } from "../common/window";

const BLOOM: [number, number][] = [
  [2, 14], [5, 15], [9, 14], [13, 15], [17, 14], [7, 16], [15, 16],
];

export default win("win_flower", "꽃밭 창문", 220, SPRING, [[CLOUD, 13, 2]], BLOOM, "F");

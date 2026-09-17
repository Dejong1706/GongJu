import { win } from "../common/window";

const SNOW: [number, number][] = [
  [2, 1], [8, 3], [15, 2], [5, 6], [13, 7], [18, 5], [3, 9], [10, 4], [16, 9], [7, 11], [11, 13],
];

export default win("win_snow", "눈 오는 창문", 260, { A: "#BFC8D4", B: "#DDE4EC", G: "#FFFFFF" }, [], SNOW, "C");

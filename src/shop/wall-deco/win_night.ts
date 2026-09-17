import type { ItemDef } from "../types";
import { type Part, win, windowRows } from "../common/window";

/* 밤하늘 창문 — 틀은 다른 창문과 같다. 별 두 벌이 번갈아 반짝 (두 장씩 머물러 느리게) */
const MOON = [".SSS", "SS..", "SS..", "SS..", ".SSS"];
const STARS_A: [number, number][] = [[2, 1], [9, 2], [5, 5], [17, 8], [3, 9], [7, 8], [15, 1]];
const STARS_B: [number, number][] = [[6, 1], [2, 4], [10, 5], [19, 6], [5, 8], [18, 10], [13, 2]];
const PARTS: Part[] = [[MOON, 14, 2], [["F"], 6, 15]];
const NIGHT_A = windowRows(PARTS, STARS_A, "C");
const NIGHT_B = windowRows(PARTS, STARS_B, "C");

const winNight: ItemDef = {
  ...win(
    "win_night", "밤하늘 창문", 550,
    { A: "#27305C", B: "#36427A", G: "#2E5446" },
    PARTS, STARS_A, "C",
    { S: "#FFE58A", F: "#F4FF8A" }
  ),
  anim: [NIGHT_A, NIGHT_A, NIGHT_B, NIGHT_B],
};
export default winNight;

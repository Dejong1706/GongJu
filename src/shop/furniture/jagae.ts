import type { ItemDef } from "../types";
import { blank, gridRows, put } from "../common/draw";

/* 자개장 20 x 26 (조선 세트 · 골드) — 검은 옻칠 두 문짝에 자개 꽃, 놋쇠 경첩 · 자물쇠, 아래 서랍 둘. 자개가 반짝인다 */
function frame(f: number) {
  const g = blank(20, 26);
  for (let y = 0; y <= 23; y++) for (let x = 0; x <= 19; x++) put(g, x, y, x === 0 || x === 19 || y === 0 ? "k" : "K");
  const box = (x0: number, y0: number, x1: number, y1: number) => {
    for (let x = x0; x <= x1; x++) { put(g, x, y0, "k"); put(g, x, y1, "k"); }
    for (let y = y0; y <= y1; y++) { put(g, x0, y, "k"); put(g, x1, y, "k"); }
  };
  box(2, 3, 8, 16);
  box(11, 3, 17, 16);
  box(2, 18, 8, 21);
  box(11, 18, 17, 21);
  for (let x = 0; x <= 19; x++) put(g, x, 22, "k");
  const flower = (cx: number, cy: number) => {
    put(g, cx, cy, "J");
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => put(g, cx + dx, cy + dy, "j"));
  };
  [2, 11].forEach((ox) => {
    flower(ox + 3, 6);
    flower(ox + 3, 13);
    [[ox + 2, 9], [ox + 4, 10], [ox + 3, 11]].forEach(([x, y]) => put(g, x, y, "j"));
  });
  // 반짝임 — 자개 몇 알이 돌아가며 흰빛이 된다
  for (let y = 0; y < 26; y++)
    for (let x = 0; x < 20; x++) if ((g[y][x] === "j" || g[y][x] === "J") && (x + y + f) % 3 === 0) put(g, x, y, "i");
  [[1, 5], [1, 14], [18, 5], [18, 14], [9, 9], [10, 9], [9, 10], [10, 10], [5, 19], [5, 20], [14, 19], [14, 20]]
    .forEach(([x, y]) => put(g, x, y, "Y"));
  [1, 2, 17, 18].forEach((x) => { put(g, x, 24, "K"); put(g, x, 25, "K"); });
  return gridRows(g);
}
const FRAMES = [0, 1, 2].map(frame);

/* 옆 10 x 26 — 옆판에도 자개 꽃 하나 (방향 그림은 한 장이라 안 반짝인다), 놋쇠 모서리 · 다리 */
const SIDE = (() => {
  const g = blank(10, 26);
  for (let y = 0; y <= 23; y++) for (let x = 0; x <= 9; x++) put(g, x, y, x === 0 || x === 9 || y === 0 || y === 22 ? "k" : "K");
  for (let x = 2; x <= 7; x++) { put(g, x, 3, "k"); put(g, x, 19, "k"); }
  for (let y = 3; y <= 19; y++) { put(g, 2, y, "k"); put(g, 7, y, "k"); }
  [[4, 10], [5, 10], [4, 11], [5, 11]].forEach(([x, y]) => put(g, x, y, "J"));
  [[4, 9], [5, 9], [3, 10], [6, 11], [4, 12], [5, 12], [3, 11], [6, 10]].forEach(([x, y]) => put(g, x, y, "j"));
  [[4, 14], [5, 15], [4, 16]].forEach(([x, y]) => put(g, x, y, "j"));
  [[1, 1], [8, 1], [1, 21], [8, 21]].forEach(([x, y]) => put(g, x, y, "Y"));
  [1, 2, 7, 8].forEach((x) => { put(g, x, 24, "K"); put(g, x, 25, "K"); });
  return gridRows(g);
})();

/* 뒤 20 x 26 — 자개 없는 검은 뒤판, 널 이음 줄만 */
const BACK = (() => {
  const g = blank(20, 26);
  for (let y = 0; y <= 23; y++) for (let x = 0; x <= 19; x++) put(g, x, y, x === 0 || x === 19 || y === 0 || y === 22 ? "k" : "K");
  [6, 12, 18].forEach((y) => { for (let x = 1; x <= 18; x++) put(g, x, y, "k"); });
  [1, 2, 17, 18].forEach((x) => { put(g, x, 24, "K"); put(g, x, 25, "K"); });
  return gridRows(g);
})();

const PALETTE = { K: "#2B2330", k: "#4A3F4C", j: "#BFE6E8", J: "#F6C9E4", i: "#FFFFFF", Y: "#D4AE5A" };

const jagae: ItemDef = {
  id: "jagae",
  name: "자개장",
  slot: "floor",
  price: 690,
  at: [58, 42],
  sprite: { rows: FRAMES[0], palette: PALETTE },
  anim: FRAMES,
  views: { right: { rows: SIDE, palette: PALETTE }, back: { rows: BACK, palette: PALETTE } },
};
export default jagae;

import type { ItemDef } from "../types";
import { blank, gridRows, put } from "../common/draw";

/*
  달밤 창호문 30 x 30 (조선 세트 · 골드) — 왼쪽 문을 열어 보름달 · 매화 가지가 보이고, 오른쪽은 닫힌 띠살 한지문.
  꽃잎이 네 장에 걸쳐 떨어진다. 창문 자리라 `only: "win"`
*/
function frame(f: number) {
  const g = blank(30, 30, "T");
  for (let y = 2; y <= 27; y++) for (let x = 2; x <= 27; x++) put(g, x, y, x <= 14 ? "N" : "H");
  for (let y = 2; y <= 27; y++)
    for (let x = 2; x <= 14; x++) if ((x - 8) ** 2 + (y - 8) ** 2 <= 12) put(g, x, y, "M");
  [[4, 4], [13, 4], [12, 14], [3, 16], [13, 24]].forEach(([x, y]) => put(g, x, y, "S"));
  // 매화 가지 — 왼쪽 아래에서 오른쪽 위로
  [[2, 26], [3, 25], [4, 24], [5, 23], [6, 23], [7, 22], [8, 21], [9, 20], [10, 20], [11, 19], [12, 18], [13, 17], [5, 22], [5, 21], [4, 20]]
    .forEach(([x, y]) => put(g, x, y, "B"));
  [[6, 22], [9, 19], [12, 17], [4, 19], [11, 20], [8, 22], [14, 16]].forEach(([x, y]) => {
    put(g, x, y, "p");
    [[1, 0], [-1, 0], [0, -1], [0, 1]].forEach(([dx, dy]) => {
      if (g[y + dy]?.[x + dx] === "N") put(g, x + dx, y + dy, "P");
    });
  });
  // 떨어지는 꽃잎
  const paths = [
    [[12, 6], [11, 8], [12, 10], [11, 12]],
    [[4, 10], [5, 12], [4, 14], [5, 16]],
    [[9, 13], [8, 15], [9, 17], [8, 19]],
  ];
  paths.forEach((p) => put(g, p[f][0], p[f][1], "P"));
  // 닫힌 문 — 문짝 테두리 · 세로 살 둘 · 띠살 세 줄
  for (let y = 2; y <= 27; y++) { put(g, 15, y, "T"); put(g, 19, y, "t"); put(g, 23, y, "t"); }
  [6, 7, 15, 16, 23, 24].forEach((y) => { for (let x = 16; x <= 27; x++) put(g, x, y, "t"); });
  put(g, 17, 15, "Y"); put(g, 17, 16, "Y");
  return gridRows(g);
}
const FRAMES = [0, 1, 2, 3].map(frame);

const winMoon: ItemDef = {
  id: "win_moon",
  name: "달밤 창호문",
  slot: "wall",
  price: 700,
  at: [25, 6],
  only: "win",
  sprite: {
    rows: FRAMES[0],
    palette: { T: "#6B4A34", t: "#9C7556", H: "#F4E6CC", N: "#2E3A64", M: "#FFF3C4", S: "#FFFFFF", B: "#4A3428", P: "#FF9EC4", p: "#FFF3C4", Y: "#E3B85C" },
  },
  anim: FRAMES,
};
export default winMoon;

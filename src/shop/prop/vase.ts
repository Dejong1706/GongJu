import type { ItemDef } from "../types";
import { GOLD } from "../common/palette";

/* 장미 꽃병 10 x 12 — 화장대 · 탁자 위에 얹는다. 분홍 장미 셋, 금 꽃병에 분홍 보석 */
const ROWS = (() => {
  const g = Array.from({ length: 12 }, () => [..."..........".slice(0, 10)]);
  const rose = (cx: number, cy: number) =>
    [[0, -1, "R"], [-1, 0, "R"], [0, 0, "r"], [1, 0, "R"], [0, 1, "R"]].forEach(([dx, dy, c]) => {
      g[cy + (dy as number)][cx + (dx as number)] = c as string;
    });
  rose(2, 2);
  rose(7, 2);
  rose(5, 1);
  [[1, 4], [8, 4], [3, 4], [6, 4]].forEach(([x, y]) => (g[y][x] = "g"));
  [[4, 3], [5, 4], [4, 5], [5, 5]].forEach(([x, y]) => (g[y][x] = "G"));
  const vase = ["..YYYYYY..", "...YyyY...", "..YYYYYY..", ".YYYjjYYY.", ".YYYYYYYY.", "..yyyyyy.."];
  vase.forEach((r, i) => [...r].forEach((c, x) => { if (c !== ".") g[6 + i][x] = c; }));
  return g.map((r) => r.join(""));
})();

const vase: ItemDef = {
  id: "vase",
  name: "장미 꽃병",
  slot: "top",
  price: 500,
  at: [58, 51],
  sprite: { rows: ROWS, palette: { ...GOLD, R: "#FF7BAC", r: "#E2648F", g: "#6FAE6A", G: "#5A9A6A", j: "#FF6FA8" } },
};
export default vase;

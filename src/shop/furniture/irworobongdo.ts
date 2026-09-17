import type { ItemDef } from "../types";
import { blank, gridRows, put } from "../common/draw";

/* 일월오봉도 병풍 34 x 22 (조선 세트 · 골드) — 세 폭. 해 · 달 · 다섯 봉우리 · 붉은 소나무 · 물결 */
const ROWS = (() => {
  const g = blank(34, 22);
  for (let y = 0; y <= 19; y++) for (let x = 0; x <= 33; x++) put(g, x, y, "A");
  // 낮은 봉우리부터 그려야 가운데 높은 봉우리가 앞에 온다
  [{ c: 4, t: 11 }, { c: 30, t: 11 }, { c: 9, t: 8 }, { c: 25, t: 8 }, { c: 17, t: 5 }].forEach(({ c, t }) => {
    for (let y = t; y <= 15; y++) {
      const half = y - t;
      for (let x = c - half; x <= c + half; x++) put(g, x, y, x === c - half || y === t ? "g" : "G");
    }
  });
  for (let y = 1; y <= 6; y++)
    for (let x = 1; x <= 32; x++) {
      if ((x - 27) ** 2 + (y - 3) ** 2 <= 3) put(g, x, y, "S");
      if ((x - 7) ** 2 + (y - 3) ** 2 <= 3) put(g, x, y, "M");
    }
  for (let y = 15; y <= 18; y++) for (let x = 1; x <= 32; x++) put(g, x, y, (x + y * 2) % 5 === 0 ? "W" : "w");
  [2, 31].forEach((px) => {
    for (let y = 9; y <= 15; y++) put(g, px, y, "p");
    [[-1, 8], [0, 8], [1, 8], [-1, 11], [0, 10], [1, 11]].forEach(([dx, y]) => put(g, px + dx, y, "L"));
  });
  // 병풍 틀 · 폭 사이 금 경첩 · 발
  for (let x = 0; x <= 33; x++) { put(g, x, 0, "b"); put(g, x, 19, "b"); }
  [0, 11, 22, 33].forEach((x) => {
    for (let y = 0; y <= 19; y++) put(g, x, y, "b");
    put(g, x, 4, "Y"); put(g, x, 15, "Y");
  });
  [1, 2, 16, 17, 31, 32].forEach((x) => { put(g, x, 20, "b"); put(g, x, 21, "b"); });
  return gridRows(g);
})();

/*
  옆 7 x 22 — 접힌 세 폭이 비스듬히 좁은 띠로 보인다. 폭마다 하늘 · 봉우리 · 물결 한 줄씩만
  뒤 34 x 22 — 그림 없는 뒷면. 크림 배접지에 작은 점무늬, 틀 · 경첩 · 발은 앞과 같다
*/
const SIDE = [
  "bbbbbbb",
  ...Array.from({ length: 6 }, () => "bAbAbAb"),
  ...Array.from({ length: 8 }, () => "bGbgbGb"),
  ...Array.from({ length: 4 }, () => "bwbWbwb"),
  "bbbbbbb",
  "bb...bb",
  "bb...bb",
];
const BACK = ROWS.map((r, y) =>
  [...r].map((c, x) => (y >= 1 && y <= 18 && c !== "b" && c !== "Y" && c !== "." ? ((x * 3 + y * 5) % 13 === 0 ? "d" : "c") : c)).join("")
);

const PALETTE = { A: "#8FB9C4", G: "#2E7D6B", g: "#5FB39A", S: "#D8423A", M: "#FFFFFF", w: "#3E6DB5", W: "#FFFFFF", p: "#B5452E", L: "#2E6B3A", b: "#6B2E2A", Y: "#E3B85C", c: "#EADFC8", d: "#CDB892" };

const irworobongdo: ItemDef = {
  id: "irworobongdo",
  name: "일월오봉도 병풍",
  slot: "floor",
  price: 700,
  at: [23, 44],
  sprite: { rows: ROWS, palette: PALETTE },
  views: { right: { rows: SIDE, palette: PALETTE }, back: { rows: BACK, palette: PALETTE } },
};
export default irworobongdo;

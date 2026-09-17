import type { ItemDef } from "../types";
import { outline } from "../common/draw";
import { INK } from "../common/palette";

/* 유니콘 인형 11 x 11 (+ 둘레 13 x 13) — 판다(16) 보다 작게. 흰 몸, 분홍 · 보라 갈기, 금 뿔 · 금 발굽 */
const ROWS = outline([
  ".......Y...",
  "......YY...",
  "....mWWW...",
  "...mnWKWW..",
  "...nmWWWWp.",
  "..mnWWW....",
  ".mWWWWWWWW.",
  "nmWWWWWWWWW",
  "m.WWWWWWWW.",
  "..W.W..W.W.",
  "..g.g..g.g.",
]);

/* 앞 — 뿔이 가운데, 눈 둘, 갈기가 양옆. 앞다리 둘만 보인다 */
const FRONT = outline([
  ".....Y.....",
  ".....Y.....",
  "...mWWWn...",
  "..mWKWKWn..",
  "..mWWWWWn..",
  "..mWWpWWn..",
  "...WWWWW...",
  "..WWWWWWW..",
  "..WWWWWWW..",
  "..WW...WW..",
  "..gg...gg..",
]);

/* 뒤 — 갈기가 등을 따라 내려오고 꼬리가 다리 사이로 */
const BACK = outline([
  ".....Y.....",
  "....WmW....",
  "...WWmnW...",
  "..WWWnmWW..",
  "..WWWmnWW..",
  "...WWnmW...",
  "..WWWmWWW..",
  ".WWWWWWWWW.",
  "..WWWmWWW..",
  "..WW.n.WW..",
  "..gg.m.gg..",
]);

const PAL = { o: "#D9B8CC", W: "#FFFFFF", h: "#EBDCE5", m: "#FF9EC4", n: "#CDB6F0", K: INK, p: "#FFB3CF", Y: "#E3B85C", g: "#E3B85C" };

const unicorn: ItemDef = {
  id: "unicorn",
  name: "유니콘 인형",
  slot: "floor",
  price: 600,
  at: [14, 76],
  sprite: { rows: ROWS, palette: PAL },
  face: "right",
  views: { front: { rows: FRONT, palette: PAL }, back: { rows: BACK, palette: PAL } },
};
export default unicorn;

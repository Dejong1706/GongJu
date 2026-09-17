import type { ItemDef } from "../types";
import { INK } from "./palette";

/*
  창문 24 x 22. 테두리 2칸, 안쪽 20 x 18 에 십자 창살.
  뒷벽(12~67) 한가운데에 걸려서 방 분위기를 결정한다.
  틀은 공통이고 하늘색·땅색·부품 몇 개만 갈아 끼우면 새 창문이 된다.
  (궁전 · 발코니 창문은 38 x 38 로 따로 그린다 — 이 틀을 안 쓴다)
*/
const WIN = { w: 24, h: 22, ix: 2, iy: 2, iw: 20, ih: 18 };
export const WIN_AT: readonly [number, number] = [28, 10];

/** 창밖에 놓는 부품 — [그림, 안쪽에서 x, y] */
export type Part = [string[], number, number];

export const SUN = [".SS.", "SSSS", "SSSS", ".SS."];
export const CLOUD = [".CCC.", "CCCCC"];
const CANOPY = ["..LLLL..", ".LLLLLL.", "LLLLLLLL", "LLLLLLLL", ".LLLLLL.", "..LLLL.."];
const STEM = ["TT", "TT", "TT"];
export const tree = (x: number, y: number): Part[] => [[CANOPY, x, y], [STEM, x + 3, y + 6]];

export const DAY = { A: "#A8D8F0", B: "#C7E7F7", G: "#8FC97A" };
export const SPRING = { A: "#CFE8F5", B: "#E6F3FA", G: "#9ACB84" };

export function windowRows(parts: Part[], dots: [number, number][], dotChar: string) {
  const g: string[][] = [];
  for (let y = 0; y < WIN.h; y++) g.push(new Array(WIN.w).fill("K"));
  for (let y = 0; y < WIN.ih; y++)
    for (let x = 0; x < WIN.iw; x++)
      g[WIN.iy + y][WIN.ix + x] = y >= WIN.ih - 5 ? "G" : y < 6 ? "A" : "B";
  parts.forEach(([art, px, py]) =>
    art.forEach((row, ry) =>
      [...row].forEach((ch, rx) => {
        if (ch !== ".") g[WIN.iy + py + ry][WIN.ix + px + rx] = ch;
      })
    )
  );
  dots.forEach(([x, y]) => (g[WIN.iy + y][WIN.ix + x] = dotChar));
  for (let y = WIN.iy; y < WIN.iy + WIN.ih; y++) { g[y][11] = "K"; g[y][12] = "K"; }
  for (let x = WIN.ix; x < WIN.ix + WIN.iw; x++) { g[10][x] = "K"; g[11][x] = "K"; }
  return g.map((r) => r.join(""));
}

/** 창문 하나. 같은 창문 자리라 `only: "win"` 로 하나만 걸린다 */
export const win = (
  id: string, name: string, price: number,
  sky: { A: string; B: string; G: string },
  parts: Part[] = [], dots: [number, number][] = [], dotChar = "C",
  extra: Record<string, string> = {}
): ItemDef => ({
  id, name, slot: "wall", price, at: WIN_AT, only: "win",
  sprite: {
    rows: windowRows(parts, dots, dotChar),
    palette: { K: INK, S: "#FFD34D", C: "#FFFFFF", L: "#5FA34E", T: "#8E6544", F: "#FF7BAC", ...sky, ...extra },
  },
});

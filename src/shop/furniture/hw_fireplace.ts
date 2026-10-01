import type { ItemDef } from "../types";
import { outline } from "../common/draw";
import { INK } from "../common/palette";
import { HW } from "../common/halloween";

/*
  할로윈 벽난로 28 x 26 (둘레 포함 · 할로윈 세트) — 보랏빛 돌 벽난로. 선반 위 촛불 둘 · 작은 호박,
  아치 안에서 장작불이 세 장으로 타오른다. 어두운 바닥에 묻히지 않게 둘레를 잉크로 두른다.
  사용자가 말한 "화로" 를 벽난로로 읽었다 (같이 낸 마녀 가마솥은 빠졌다)
*/
const FLAMES = [
  ["....Y.....", "...FY..F..", "..FFYF.FF.", ".FFYYFFFF.", ".FFYYYYFF.", "FFYYYYYYFF"],
  ["..F.......", "..FF..Y...", ".FFF.FYF..", ".FYFFFYFF.", "FFYYYYYFF.", "FFYYYYYYFF"],
  ["......F...", ".F...FF...", ".FF.FYFF..", "FFYFFYYF..", "FYYYYYYFF.", "FFYYYYYYFF"],
];

function frame(f: number) {
  const W = 26, H = 24;
  const g = Array.from({ length: H }, () => Array(W).fill("."));
  const fill = (x0: number, y0: number, x1: number, y1: number, c: string) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[y][x] = c;
  };
  // 촛불 둘 — 불꽃도 장마다 흔들린다
  [3, 21].forEach((x, i) => {
    g[0][x + ((f + i) % 2)] = "Y";
    g[1][x] = "Y";
    fill(x, 2, x + 1, 3, "c");
  });
  // 선반 위 작은 호박
  g[1][12] = "g";
  fill(11, 2, 14, 3, "O");
  g[2][12] = "o"; g[3][13] = "o";
  // 선반
  fill(0, 4, 25, 4, "M");
  fill(1, 5, 24, 5, "m");
  // 돌 몸통 — 세 줄마다 줄눈, 세로 줄눈은 줄마다 엇갈린다
  fill(2, 6, 23, 23, "S");
  for (let y = 6; y <= 23; y++) {
    const row = Math.floor((y - 6) / 3);
    if ((y - 6) % 3 === 2) fill(2, y, 23, y, "s");
    else for (let x = 2 + (row % 2 ? 2 : 5); x <= 23; x += 6) g[y][x] = "s";
  }
  // 아치 입구
  fill(8, 10, 17, 10, "k");
  fill(7, 11, 18, 11, "k");
  fill(6, 12, 19, 23, "k");
  // 불 · 장작
  FLAMES[f].forEach((r, dy) => [...r].forEach((c, dx) => { if (c !== ".") g[15 + dy][8 + dx] = c; }));
  fill(8, 21, 17, 21, "L");
  fill(9, 22, 16, 22, "l");
  // 바닥돌
  fill(0, 23, 25, 23, "m");
  return outline(g.map((r) => r.join("")), "K");
}
const FRAMES = [0, 1, 2].map(frame);

const hwFireplace: ItemDef = {
  id: "hw_fireplace",
  name: "할로윈 벽난로",
  slot: "floor",
  price: 800,
  at: [56, 46],
  sprite: {
    rows: FRAMES[0],
    palette: {
      K: INK, M: "#5B4A5E", m: "#46384A", S: "#7A6A80", s: "#5C4E62", k: "#1A1320",
      F: "#FF8A2A", Y: "#FFE066", L: "#8E6544", l: "#6B4A30",
      c: HW.bone, O: HW.pump, o: HW.pumpSh, g: HW.stem,
    },
  },
  anim: FRAMES,
};
export default hwFireplace;

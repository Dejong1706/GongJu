import type { ItemDef } from "../types";
import { GOLD } from "../common/palette";

/* 왕좌 20 x 22 — 왕관 등받이 · 진홍 벨벳(단추 박음) · 금 팔걸이와 다리 */
const ROWS = [
  "......Y..YY..Y......",
  "......YY.YY.YY......",
  "......YYYYYYYY......",
  ".....YyyyyyyyyY.....",
  "....YYRRRRRRRRYY....",
  "....YRRRRRRRRRRY....",
  "....YRRRrRRrRRRY....",
  "....YRRRRRRRRRRY....",
  "....YRRrRRRRrRRY....",
  "....YRRRRRRRRRRY....",
  "....YRRRrRRrRRRY....",
  "....YRRRRRRRRRRY....",
  "YYY.YRRRRRRRRRRY.YYY",
  "YyY.YRRRRRRRRRRY.YyY",
  "YRY" + "Y".repeat(14) + "YRY",
  "YRY" + "R".repeat(14) + "YRY",
  "YRY" + "R".repeat(14) + "YRY",
  "Y".repeat(20),
  "Y" + "y".repeat(18) + "Y",
  ".Y..Y..........Y..Y.",
  ".Y..Y..........Y..Y.",
  ".YY.YY........YY.YY.",
];

const PAL = { ...GOLD, R: "#C8384F", r: "#9E2A3E" };

/* 옆 12 x 22 — 등받이가 왼쪽 기둥이 되고 방석 · 팔걸이가 오른쪽으로 나온다 */
const SIDE = [
  "..Y.........",
  "..YY........",
  "..YY........",
  ".YyY........",
  ".YRY........",
  ".YRY........",
  ".YRY........",
  ".YRY........",
  ".YRY........",
  ".YRY........",
  ".YRY........",
  ".YRY........",
  ".YRYYYYYYYY.",
  ".YRYyyyyyyY.",
  ".YRYYYYYYYYY",
  ".YRRRRRRRRRY",
  ".YRRRRRRRRRY",
  ".YYYYYYYYYYY",
  ".YyyyyyyyyyY",
  ".Y........Y.",
  ".Y........Y.",
  ".YY.......YY",
];

/* 뒤 20 x 22 — 벨벳 대신 금 뒤판, 가운데 금 마름모. 방석은 등받이에 가려 안 보인다 */
const BACK = ROWS.map((r, y) => {
  const row = [...r];
  if (y >= 4 && y <= 16) for (let x = 3; x <= 16; x++) if (row[x] === "R" || row[x] === "r") row[x] = "y";
  if (y === 7 || y === 9) { row[9] = "Y"; row[10] = "Y"; }
  if (y === 8) for (let x = 8; x <= 11; x++) row[x] = "Y";
  return row.join("");
});

const throne: ItemDef = {
  id: "throne",
  name: "왕좌",
  slot: "floor",
  price: 850,
  at: [48, 52],
  sprite: { rows: ROWS, palette: PAL },
  views: { right: { rows: SIDE, palette: PAL }, back: { rows: BACK, palette: PAL } },
};
export default throne;

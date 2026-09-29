import type { ItemDef } from "../types";
import { outline } from "../common/draw";
import { INK } from "../common/palette";
import { HW } from "../common/halloween";

/*
  할로윈 만찬 식탁 22 x 40 (둘레 포함 24 x 42 · 할로윈 세트) — 방 가운데에 **앞뒤로 긴** 와인빛 식탁.
  뒤로 갈수록 좁아지는 식탁보 윗면에 음식을 줄지어 놓고, 앞쪽은 식탁보가 주름져 늘어진다.
  식탁 뒤쪽에 **금 촛대**가 붙어 있다 — 처음엔 쇠 촛대를 따로 사서 얹는 소품이었는데,
  사용자가 식탁과 한 세트로 묶고 금색으로 바꿔 달라고 했다. 촛대가 위로 솟는 여섯 줄만큼 그림이 길다.
  음식은 촛대 앞에서부터 통닭 구이 · 포도 · 호박 파이, 양옆에 접시와 와인잔. 촛불이 흔들린다 (두 장)
*/
const CANDLES = (f: number) => [
  f ? "...Y....." : "....Y....",
  f ? ".Y..F.Y.." : ".Y..F..Y.",
  ".F..c..F.",
  ".c..c..c.",
  ".c..c..c.",
  ".c..i..c.",
  "iIi.I.iIi",
  ".IIIIIII.",
  "....I....",
  "...iIi...",
  "..IIIII..",
];

function frame(f: number) {
  const UP = 6; // 촛대가 식탁 위로 솟는 줄
  const W = 22, H = 34 + UP;
  const g = Array.from({ length: H }, () => Array(W).fill("."));
  // 식탁은 UP 줄 아래에서 시작한다 — 아래 좌표는 전부 식탁 기준
  const put = (x: number, y: number, c: string) => { if (g[y + UP]?.[x] !== undefined) g[y + UP][x] = c; };
  const art = (rows: string[], x: number, y: number) =>
    rows.forEach((r, dy) => [...r].forEach((c, dx) => { if (c !== ".") put(x + dx, y + dy, c); }));
  // 윗면 — 뒤(y 0) 는 폭 14, 앞(y 24) 은 22
  const TOP = 24;
  const edge = (y: number) => { const half = 7 + (4 * y) / TOP; return [Math.round(10.5 - half), Math.round(10.5 + half)]; };
  for (let y = 0; y <= TOP; y++) {
    const [l, r] = edge(y);
    for (let x = l; x <= r; x++) put(x, y, x === l || x === r ? "w" : "W");
  }
  // 가운데 러너 — 식탁보보다 한 톤 밝은 띠
  for (let y = 1; y < TOP; y++) for (let x = 9; x <= 12; x++) put(x, y, "v");
  // 앞으로 늘어진 식탁보 — 세로 주름, 밑단은 물결
  for (let y = TOP + 1; y <= 30; y++)
    for (let x = 0; x <= 21; x++) put(x, y, y === TOP + 1 ? "v" : x % 4 === 1 ? "w" : "W");
  for (let x = 0; x <= 21; x++) put(x, 31, x % 4 ? "W" : "w");
  // 다리
  for (let y = 31; y <= 33; y++) { put(2, y, "L"); put(3, y, "L"); put(18, y, "L"); put(19, y, "L"); }
  // 통닭 구이 — 양끝에 다리뼈. 가운데 어두운 점 둘을 찍었더니 얼굴로 보여서 그늘은 아래 줄에만
  art(["..PPPPPP..", ".PBBBBBBP.", "PcBBBBBBcP", ".PbbbbbbP.", "..PPPPPP.."], 6, 7);
  art([".PPPP.", "PgGgGP", "PGgGgP", ".PgGP."], 8, 14);                     // 포도
  art([".oooo.", "oOOOOo", "oOTOOo", ".oooo."], 8, 19);                      // 호박 파이
  // 양옆 접시 · 와인잔 — 뒤는 좁아서 안쪽으로
  [[3, 1], [4, 1], [16, 1], [17, 1]].forEach(([x, y]) => put(x, y, "R"));
  [[3, 5], [15, 5]].forEach(([x, y]) => art(["PP", "PP"], x, y));
  [[2, 12], [17, 12]].forEach(([x, y]) => art(["PPP", "PpP"], x, y));
  [[2, 10], [18, 10], [2, 17], [18, 17]].forEach(([x, y]) => art(["R", "R"], x, y));
  [[1, 20], [18, 20]].forEach(([x, y]) => art(["PPP", "PpP"], x, y));
  // 금 촛대 — 받침이 식탁 뒤쪽(4줄) 에 놓이고 초는 위로 솟는다
  art(CANDLES(f), 6, 4 - 10);
  return outline(g.map((r) => r.join("")), "K");
}

const hwFeast: ItemDef = {
  id: "hw_feast",
  name: "할로윈 만찬 식탁",
  slot: "floor",
  price: 1000,
  at: [28, 42],
  sprite: {
    rows: frame(0),
    palette: {
      K: INK, W: "#7A1F3D", w: "#5A1230", v: "#932A4E", L: "#3A2418",
      I: "#E3B85C", i: "#B8862B", F: "#FF8A2A", Y: "#FFE066",
      P: HW.bone, p: HW.boneSh, B: "#C07A38", b: "#8A4E1E", c: HW.bone,
      O: HW.pump, o: "#E0B070", T: HW.pumpSh, G: "#6A3D8C", g: "#8E5AB5", R: "#B3203A",
    },
  },
  anim: [frame(0), frame(1)],
};
export default hwFeast;

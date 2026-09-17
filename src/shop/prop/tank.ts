import type { ItemDef } from "../types";
import { flipRows } from "../common/draw";
import { INK } from "../common/palette";

/* 어항 18 x 14 — 물고기 둘이 엇갈려 헤엄치고 방울이 올라간다. 여덟 장 */
const FISH = ["O.OOO", "OOOKO", "O.OOO"];
const MINI = ["PP.P", "PPPP"];
function frame(f: number) {
  const g = [
    "hhhhhhhhhhhhhhhhhh",
    "hBBBBBBBBBBBBBBBBh",
    "hbbbbbbbbbbbbbbbbh",
    "hbbbbbbbbbbbbbbbbh",
    "hbbbbbbbbbbbbbbbbh",
    "hbbbbbbbbbbbbbbbbh",
    "hbbbbbbbbbbbbbbbbh",
    "hbGbbbbbbbbbbbbbbh",
    "hGGbbbbbbbbbbbbGbh",
    "hsGssSsssssSssGGsh",
    "hssSsssssSsssssssh",
    "hhhhhhhhhhhhhhhhhh",
    "..hHh........hHh..",
    "..hhh........hhh..",
  ].map((r) => [...r]);
  const put = (art: string[], x: number, y: number) =>
    art.forEach((r, dy) => [...r].forEach((c, dx) => { if (c !== ".") g[y + dy][x + dx] = c; }));
  // 앞 네 장은 오른쪽으로, 뒤 네 장은 돌아서 왼쪽으로. 작은 물고기는 반대로
  put(f < 4 ? FISH : flipRows(FISH), [2, 5, 8, 11, 11, 8, 5, 2][f], 2);
  put(f < 4 ? MINI : flipRows(MINI), [12, 9, 6, 3, 3, 6, 9, 12][f], 6);
  const by = 8 - f;
  g[by][14] = "W";
  if (by + 3 <= 8) g[by + 3][13] = "W";
  return g.map((r) => r.join(""));
}
const FRAMES = Array.from({ length: 8 }, (_, f) => frame(f));

const tank: ItemDef = {
  id: "tank",
  name: "어항",
  slot: "floor",
  price: 650,
  at: [52, 56],
  sprite: {
    rows: FRAMES[0],
    palette: {
      h: "#D5C7D0", H: "#FDFAFC", B: "#D6F1FF", b: "#9ED8F0", G: "#6FBF7F", s: "#EAD6B8",
      S: "#C9AE8C", O: "#FF9A5C", P: "#FF8FBC", K: INK, W: "#FFFFFF",
    },
  },
  anim: FRAMES,
};
export default tank;

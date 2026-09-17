import type { ItemDef } from "../types";

/* 요정 날개 28 x 11 — 왼쪽 절반을 그리고 뒤집어 붙인다. 바깥 한 칸을 당긴 장과 번갈아 팔랑 */
const WING = [
  ".OOO..........",
  "OaaaOO........",
  "OaWaaaOO......",
  "OaaaaaaaOO....",
  ".OaaaaaaaaO...",
  "..OOaaaaaaO...",
  "...OaaaaaOO...",
  "..ObbaaaO.....",
  "..ObbbaO......",
  "...ObbO.......",
  "....OO........",
];
const wingsOf = (half: string[]) => half.map((r) => r + [...r].reverse().join("").replace(/W/g, "a"));
const OPEN = wingsOf(WING);
const FOLD = wingsOf(WING.map((r) => "." + r.slice(0, 13)));

const wings: ItemDef = {
  id: "wings",
  name: "요정 날개",
  slot: "back",
  price: 650,
  at: [-6, 5],
  sprite: { rows: OPEN, palette: { O: "#8FC4F0", a: "#DDF3FF", W: "#FFFFFF", b: "#FFD6E8" } },
  anim: [OPEN, FOLD],
};
export default wings;

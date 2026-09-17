import type { ItemDef } from "../types";
import { GOLD } from "../common/palette";

/* 왕실 깃발 12 x 22 — 금 막대에 걸린 진홍 천, 금 테두리 · 왕관 무늬, 아래는 제비꼬리와 금술 */
const ROWS = (() => {
  const mid = (inner: string) => `.RY${inner}YR.`;
  return [
    "yYYYYYYYYYYy",
    ".RRRRRRRRRR.",
    ".RYYYYYYYYR.",
    mid("RRRRRR"),
    mid("YRYYRY"),
    mid("YYYYYY"),
    mid("YWYYWY"),
    ...Array.from({ length: 9 }, () => mid("RRRRRR")),
    ".RYYYYYYYYR.",
    ".RRRRRRRRRR.",
    ".RRRR..RRRR.",
    ".RRR....RRR.",
    ".RR......RR.",
    ".Y........Y.",
  ];
})();

const banner: ItemDef = {
  id: "banner",
  name: "왕실 깃발",
  slot: "wall",
  price: 550,
  at: [56, 4],
  sprite: { rows: ROWS, palette: { ...GOLD, R: "#C8384F", W: "#FFFFFF" } },
};
export default banner;

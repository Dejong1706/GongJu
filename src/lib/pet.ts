import type { Sprite } from "./sprites";

const INK = "#3A2230";

/**
 * 판다 방. 판다는 (10,28) 에 서고 오른쪽으로 WALK 칸을 오간다.
 * 걸레받이가 44 줄이라 바닥에 놓는 소품은 아랫변이 44 에 닿아야 한다.
 *
 * h 만 줄이면 바닥 깊이만 줄어든다 — 나머지가 전부 44 줄 위에 고정돼 있어서
 * 따라 옮길 것이 없다. 68 이었을 때는 폰에서 스크롤해야 상점 버튼이 보였다.
 */
export const ROOM = { w: 48, h: 57, base: 44, floorTop: 45 } as const;
export const PANDA_AT = { x: 10, y: 28 } as const;   // 16줄이라 발끝이 44
/** 판다가 오른쪽으로 몇 칸까지 걸어갔다 오는지 */
export const WALK = 14;
export const BASEBOARD = "#8A6B7C";

export type Slot = "head" | "body" | "wall" | "floorL" | "floorR";
export type Cat = "옷" | "벽지" | "타일" | "기타";

export type Item = {
  id: string;
  name: string;
  cat: Cat;
  slot: Slot;
  price: number;
  /** 방 안에서의 왼쪽 위 모서리 */
  at: readonly [number, number];
  sprite: Sprite;
};

const P: Record<string, string> = {
  K: INK,
  W: "#FFFFFF",
  N: "#FFD34D",
  n: "#E5A93A",   // 유치원 노랑
  U: "#6FA8DC",
  u: "#4A7DB5",   // 멜빵바지
  G: "#7FBF8F",
  T: "#D98E6A",   // 화분
  B: "#B4835C",
  b: "#8E6544",   // 책상
};

const s = (rows: string[], keys: string): Sprite => ({
  rows,
  palette: Object.fromEntries(
    [...keys].map((k) => [k, P[k as keyof typeof P]])
  ),
});

/*
  왕리본. 바깥 모서리를 한 칸씩만 깎아 각을 남겼다 — 완전히 둥글리면
  리본이 아니라 덩어리로 보인다. 고리가 매듭 쪽으로 좁아지는 기울기가
  리본으로 읽히게 하는 핵심. 색만 바꿔 두 벌로 쓴다.
*/
const BOW = [
  ".KK........KK.",
  "KRRK......KRRK",
  "KRRRK.KK.KRRRK",
  "KRRRRKddKRRRRK",
  "KRRRK.KK.KRRRK",
  "KRRK......KRRK",
  ".KK........KK.",
];

/*
  창문 24 x 22. 테두리 2칸, 안쪽 20 x 18 에 십자 창살.
  판다 뒤 벽 한가운데(12,8) 에 걸려서 방 분위기를 결정한다.
  틀은 공통이고 하늘색·땅색·부품 몇 개만 갈아 끼우면 새 창문이 된다.
*/
const WIN = { w: 24, h: 22, ix: 2, iy: 2, iw: 20, ih: 18 };
export const WIN_AT: readonly [number, number] = [12, 8];

const SUN = [".SS.", "SSSS", "SSSS", ".SS."];
const CLOUD = [".CCC.", "CCCCC"];
const CANOPY = ["..LLLL..", ".LLLLLL.", "LLLLLLLL", "LLLLLLLL", ".LLLLLL.", "..LLLL.."];
const STEM = ["TT", "TT", "TT"];
const SNOW: [number, number][] = [
  [2, 1], [8, 3], [15, 2], [5, 6], [13, 7], [18, 5], [3, 9], [10, 4], [16, 9], [7, 11], [11, 13],
];
const BLOOM: [number, number][] = [
  [2, 14], [5, 15], [9, 14], [13, 15], [17, 14], [7, 16], [15, 16],
];
type Part = [string[], number, number];
const tree = (x: number, y: number): Part[] => [[CANOPY, x, y], [STEM, x + 3, y + 6]];

function windowRows(parts: Part[], dots: [number, number][], dotChar: string) {
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

const win = (
  id: string, name: string, price: number,
  sky: { A: string; B: string; G: string },
  parts: Part[] = [], dots: [number, number][] = [], dotChar = "C",
  extra: Record<string, string> = {}
): Item => ({
  id, name, cat: "기타", slot: "wall", price, at: WIN_AT,
  sprite: {
    rows: windowRows(parts, dots, dotChar),
    palette: { K: INK, S: "#FFD34D", C: "#FFFFFF", L: "#5FA34E", T: "#8E6544", F: "#FF7BAC", ...sky, ...extra },
  },
});

const DAY = { A: "#A8D8F0", B: "#C7E7F7", G: "#8FC97A" };
const SPRING = { A: "#CFE8F5", B: "#E6F3FA", G: "#9ACB84" };

const WINDOWS: Item[] = [
  win("win_morn", "아침 창문", 200, { A: "#FFD9B0", B: "#FFEBD4", G: "#A8D48C" }, [[SUN, 14, 2], [CLOUD, 3, 6]]),
  win("win_day", "낮 창문", 180, DAY, [[CLOUD, 2, 2], [CLOUD, 12, 5]]),
  win("win_eve", "저녁 창문", 220, { A: "#E8845C", B: "#F0A882", G: "#6E9A63" }, [[SUN, 13, 8]]),
  win("win_snow", "눈 오는 창문", 260, { A: "#BFC8D4", B: "#DDE4EC", G: "#FFFFFF" }, [], SNOW, "C"),
  win("win_sakura", "벚꽃 창문", 260, SPRING, tree(4, 4), [], "C", { L: "#FFB7D0", T: "#A9744F" }),
  win("win_tree", "여름 창문", 200, DAY, tree(5, 3)),
  win("win_flower", "꽃밭 창문", 220, SPRING, [[CLOUD, 13, 2]], BLOOM, "F"),
];

/**
 * 값은 세 가지를 봤다 — 방이 얼마나 달라지는지, 도트를 얼마나 그렸는지,
 * 그리고 처음 살 것이 있는지. 리본이 제일 싼 건 사흘이면 첫 구매가 되게 하려는 것.
 */
export const ITEMS: Item[] = [
  {
    id: "hat",
    name: "유치원 모자",
    cat: "옷",
    slot: "head",
    price: 180,
    at: [11, 29],
    // 챙을 머리보다 한 칸씩만 넓게. 더 넓으면 갓처럼 보인다
    sprite: s(["..NNNNNNNNNN..", ".NNNNNNNNNNNN.", "nnnnnnnnnnnnnn"], "Nn"),
  },
  {
    id: "bow_pink",
    name: "분홍 왕리본",
    cat: "옷",
    slot: "head",
    price: 60,
    at: [11, 24],
    sprite: { rows: BOW, palette: { K: INK, R: "#FF8FBC", d: "#E2648F" } },
  },
  {
    id: "bow_sky",
    name: "하늘 왕리본",
    cat: "옷",
    slot: "head",
    price: 60,
    at: [11, 24],
    sprite: { rows: BOW, palette: { K: INK, R: "#8FC4F0", d: "#5A93C9" } },
  },
  {
    id: "overall",
    name: "멜빵바지",
    cat: "옷",
    slot: "body",
    price: 220,
    at: [13, 41],
    sprite: s(["...U..U...", "..UUUUUU..", "..uuuuuu.."], "Uu"),
  },
  {
    id: "plant",
    name: "화분",
    cat: "기타",
    slot: "floorL",
    price: 140,
    at: [1, 35],
    sprite: s(
      [
        "..GG.GG.",
        ".GGGGGGG",
        "GGGGGGGG",
        ".GGGGGG.",
        "...GG...",
        "...GG...",
        "TTTTTTTT",
        ".TTTTTT.",
        ".TTTTTT.",
      ],
      "GT"
    ),
  },
  {
    id: "desk",
    name: "책상",
    cat: "기타",
    slot: "floorR",
    price: 300,
    at: [36, 36],
    sprite: s(
      [
        "BBBBBBBBBBBB",
        "bbbbbbbbbbbb",
        "B..........B",
        "B..........B",
        "B..........B",
        "B..........B",
        "B..........B",
        "B..........B",
      ],
      "Bb"
    ),
  },
  ...WINDOWS,
];

/** 벽지 · 타일은 스프라이트가 아니라 면을 칠하는 방식이라 따로 둔다 */
export type Surface = {
  id: string;
  name: string;
  price: number;
  base: string;
  accent?: string;
  kind?: "dot" | "stripe" | "plank" | "check" | "grid";
};

export const WALLS: Surface[] = [
  { id: "w0", name: "민무늬", price: 0, base: "#D9CCD4" },
  { id: "w1", name: "분홍", price: 80, base: "#F3DCE8" },
  { id: "w2", name: "민트", price: 80, base: "#D6EDE2" },
  { id: "w3", name: "하늘", price: 80, base: "#D8E8F5" },
  { id: "w4", name: "물방울", price: 160, base: "#F7E3EE", accent: "#E5C4D8", kind: "dot" },
  { id: "w5", name: "줄무늬", price: 160, base: "#FFF3F8", accent: "#F0D6E4", kind: "stripe" },
];

export const FLOORS: Surface[] = [
  { id: "f0", name: "맨바닥", price: 0, base: "#C2A184" },
  { id: "f1", name: "마루", price: 120, base: "#D2AE8A", accent: "#B28A66", kind: "plank" },
  { id: "f2", name: "체크", price: 160, base: "#F4E2EA", accent: "#E3C3D3", kind: "check" },
  { id: "f3", name: "타일", price: 160, base: "#DDE9EC", accent: "#B9CFD5", kind: "grid" },
  { id: "f4", name: "분홍 카펫", price: 80, base: "#F6CFDF" },
  { id: "f5", name: "잔디", price: 140, base: "#A9D3A0", accent: "#8CBB83", kind: "check" },
];

export const CATS: Cat[] = ["옷", "벽지", "타일", "기타"];

/** 스티커 하나에 20점, 그 달에 열 개 모을 때마다 100점 더 */
export const PER_STICKER = 20;
export const BONUS_EVERY = 10;
export const BONUS = 100;

export const monthPoints = (count: number) =>
  count * PER_STICKER + Math.floor(count / BONUS_EVERY) * BONUS;

export const itemById = (id: string) => ITEMS.find((i) => i.id === id);
export const wallById = (id: string) => WALLS.find((w) => w.id === id) ?? WALLS[0];
export const floorById = (id: string) => FLOORS.find((f) => f.id === id) ?? FLOORS[0];

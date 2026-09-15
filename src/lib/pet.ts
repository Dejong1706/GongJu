import type { Sprite } from "./sprites";

const INK = "#3A2230";

/**
 * 판다 방. 48 x 68 칸이고 판다는 (16,25) 에 선다.
 * 걸레받이가 44 줄이라 바닥에 놓는 소품은 아랫변이 44 에 닿아야 한다.
 */
export const ROOM = { w: 48, h: 68, base: 44, floorTop: 45 } as const;
export const PANDA_AT = { x: 16, y: 25 } as const;
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

const P = {
  K: INK,
  W: "#FFFFFF",
  R: "#E2648F",
  N: "#FFD34D",
  n: "#E5A93A",
  U: "#6FA8DC",
  u: "#4A7DB5",
  G: "#7FBF8F",
  T: "#D98E6A",
  Y: "#BFE3F5",
  B: "#B4835C",
  b: "#8E6544",
};

const s = (rows: string[], keys: string): Sprite => ({
  rows,
  palette: Object.fromEntries(
    [...keys].map((k) => [k, P[k as keyof typeof P]])
  ),
});

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
    at: [15, 26],
    sprite: s(
      [
        ".....NNNNNNNN.....",
        "...NNNNNNNNNNNN...",
        "..NNNNNNNNNNNNNN..",
        "NNNNNNNNNNNNNNNNNN",
        "..nnnnnnnnnnnnnn..",
      ],
      "Nn"
    ),
  },
  {
    id: "ribbon",
    name: "리본",
    cat: "옷",
    slot: "head",
    price: 60,
    at: [15, 25],
    sprite: s(["RR...", "RRRR.", ".RRRR", "...RR"], "R"),
  },
  {
    id: "overall",
    name: "멜빵바지",
    cat: "옷",
    slot: "body",
    price: 220,
    at: [19, 41],
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
  {
    id: "window",
    name: "창문",
    cat: "기타",
    slot: "wall",
    price: 260,
    at: [31, 8],
    sprite: s(
      [
        "KKKKKKKKKKK",
        "KYYYYKYYYYK",
        "KYYYYKYYYYK",
        "KYYYYKYYYYK",
        "KKKKKKKKKKK",
        "KYYYYKYYYYK",
        "KYYYYKYYYYK",
        "KYYYYKYYYYK",
        "KKKKKKKKKKK",
      ],
      "KY"
    ),
  },
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

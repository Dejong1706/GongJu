import type { Sprite } from "./sprites";

const INK = "#3A2230";

/**
 * 판다 방 — 세 면으로 세운다.
 *
 * 벽을 세 장 그리는 게 아니라 **열마다 바닥이 시작하는 높이를 다르게** 준 것이다.
 * 가운데 `side` ~ `w - side` 는 뒷벽이라 늘 같은 줄에서 바닥이 시작하고,
 * 양옆 `side` 칸은 앞으로 올수록 바닥이 내려온다. 그래서 바닥이 사다리꼴이 된다.
 *
 * 아래 세 함수가 **벽·바닥·걸레받이·판다가 다닐 곳을 전부** 정한다.
 * 방 크기를 바꾸고 싶으면 이 숫자 넷만 만지면 나머지는 따라온다.
 * 폰(가로 393px)에서 한 칸이 4.0px, 방 높이가 366px — 스크롤 없이 한 화면에 들어간다.
 */
export const ROOM = { w: 80, h: 92, base: 54, floorTop: 55, side: 12 } as const;
export const BASEBOARD = "#8A6B7C";
/** 가구는 두 칸 격자에 붙는다. 손가락으로 끌면 한 칸은 못 맞춘다 */
export const SNAP = 2;

/** 그 열에서 바닥이 시작하는 줄. 옆벽이면 앞으로 올수록 내려온다 */
export function floorTopAt(x: number) {
  const d = ROOM.h - ROOM.floorTop;
  if (x < ROOM.side) return Math.round(ROOM.floorTop + ((ROOM.side - x) * d) / ROOM.side);
  if (x >= ROOM.w - ROOM.side)
    return Math.round(ROOM.floorTop + ((x - (ROOM.w - ROOM.side - 1)) * d) / ROOM.side);
  return ROOM.floorTop;
}
/** 그 줄에서 바닥의 왼쪽·오른쪽 끝. 위 함수를 거꾸로 푼 것이라 늘 맞물린다 */
export const floorLeftAt = (y: number) =>
  Math.max(0, ROOM.side - ((y - ROOM.floorTop) * ROOM.side) / (ROOM.h - ROOM.floorTop));
export const floorRightAt = (y: number) =>
  Math.min(
    ROOM.w,
    ROOM.w - ROOM.side + ((y - ROOM.floorTop) * ROOM.side) / (ROOM.h - ROOM.floorTop)
  );

/** 판다 16 x 16. 처음 서 있는 자리 — 그다음부터는 스스로 돌아다닌다 */
export const PANDA = { w: 16, h: 16, x: 30, y: 62 } as const;

/**
 * head·body 는 판다가 입는 것, 나머지는 방에 두는 것.
 *
 * - flat: 바닥에 까는 것(러그). 늘 맨 아래에 깔린다 — 판다가 그 위를 밟고 지나간다
 * - floor: 바닥에 놓는 것. 발끝 높이로 판다와 앞뒤를 가린다
 * - top: 가구 위에 얹는 것(책상 위 화분). 바닥 가구보다 나중에 그려야 안 숨는다
 * - wall: 벽에 거는 것. 늘 판다 뒤
 */
export type Slot = "head" | "body" | "back" | "wall" | "floor" | "top" | "flat";
export type Cat = "옷" | "가구" | "인형" | "소품" | "벽 장식" | "벽지" | "바닥";

export type Item = {
  id: string;
  name: string;
  cat: Cat;
  slot: Slot;
  price: number;
  /**
   * 입는 것이면 **판다 왼쪽 위에서 잰 자리**(음수가 될 수 있다),
   * 방에 두는 것이면 **처음 꺼냈을 때 놓이는 자리**. 그다음부터는 끌어다 옮긴 자리를 저장한다.
   */
  at: readonly [number, number];
  /** 같은 표를 단 것끼리는 하나만 놓인다 (창문 일곱 종) */
  only?: string;
  /**
   * 움직이는 것 — 그림 여러 장을 `ANIM_MS` 마다 한 장씩 넘긴다. 첫 장은 `sprite` 와 같다.
   * 상점 칸에는 첫 장만 보인다
   */
  anim?: string[][];
  sprite: Sprite;
};

/**
 * 상점 등급 — **값으로 정한다** (9/17 사용자가 정한 구간).
 *
 * - 일반 ~499 · 골드 500~999 (금테 · 왕관 표) · 프리미엄 1,000~ (보라 바탕 · 보석 표)
 *
 * 전에는 아이템마다 premium · legend 표를 달았는데, 값을 바꾸면 표도 같이 고쳐야 해서
 * 어긋나기 쉬웠다. 이제 값만 바꾸면 칸 모양이 따라온다
 */
export type Grade = "normal" | "gold" | "premium";
export const GOLD_FROM = 500;
export const PREMIUM_FROM = 1000;
export const gradeOf = (price: number): Grade =>
  price >= PREMIUM_FROM ? "premium" : price >= GOLD_FROM ? "gold" : "normal";

/** 움직이는 소품이 한 장을 넘기는 간격 */
export const ANIM_MS = 400;

/** 그 순간 보여줄 그림. 장마다 같은 객체를 돌려줘야 방에서 다시 그리지 않는다 */
const frameCache = new Map<string, Sprite[]>();
export function spriteAt(it: Item, tick: number): Sprite {
  if (!it.anim) return it.sprite;
  let frames = frameCache.get(it.id);
  if (!frames) {
    frames = it.anim.map((rows) => ({ rows, palette: it.sprite.palette }));
    frameCache.set(it.id, frames);
  }
  return frames[tick % frames.length];
}

/**
 * 자리로 판단한다. id 목록으로 들고 있으면 이름을 바꿀 때 빠뜨린다 (한 번 그랬다).
 * back(요정 날개) 은 판다 **뒤에** 그리는 입는 것이라 body 와 따로 걸친다
 */
export const isWorn = (it: Item): it is Item & { slot: "head" | "body" | "back" } =>
  it.slot === "head" || it.slot === "body" || it.slot === "back";

const P: Record<string, string> = {
  K: INK,
  W: "#FFFFFF",
  N: "#FFD34D",
  n: "#E5A93A",   // 유치원 노랑
  U: "#6FA8DC",
  u: "#4A7DB5",   // 멜빵바지
  G: "#7FBF8F",
  g: "#5A9A6A",   // 잎 · 진한 잎
  T: "#D98E6A",   // 화분 흙
  /*
   * 가구는 흰색이다. 흰 가구는 밝은 벽지·타일 위에서 통째로 묻히므로
   * **h 로 실루엣 둘레를 한 겹 두른다.** 이게 없으면 민무늬 벽에서 가구가 사라진다.
   */
  H: "#FDFAFC",
  h: "#D5C7D0",   // 가구 · 가구 테두리
  R: "#E2648F",   // 책 더미
  Q: "#F6A8C6",
  q: "#E08AAC",   // 러그
  Z: "#C89B6A",
  z: "#A97C4E",   // 곰 인형
  p: "#FFA5C3",   // 인형 코
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
  뒷벽(12~67) 한가운데에 걸려서 방 분위기를 결정한다.
  틀은 공통이고 하늘색·땅색·부품 몇 개만 갈아 끼우면 새 창문이 된다.
*/
const WIN = { w: 24, h: 22, ix: 2, iy: 2, iw: 20, ih: 18 };
export const WIN_AT: readonly [number, number] = [28, 10];

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
  id, name, cat: "벽 장식", slot: "wall", price, at: WIN_AT, only: "win",
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

/*
  침대 30 x 12. 캐노피 침대가 이 그림 위에 기둥 · 지붕 · 커튼을 올려 쓰므로 따로 뺐다.
  프레임도 베개도 흰색이라 붙어 보인다. 베개 둘레를 테두리로 끊어 떼어놨다.
  22폭이던 걸 30폭으로 늘렸다 — 판다(16) 옆에 두면 아기 침대처럼 짧다는 말을 들었다.
*/
const BED = [
  "hhh...........................",
  "hHh...........................",
  "hHhhhhhhhhhhhhhhhhhhhhhhhhhhhh",
  "hHhWWWWWWWQQQQQQQQQQQQQQQQQQQh",
  "hHhWWWWWWWQQQQQQQQQQQQQQQQQQQh",
  "hHhWWWWWWWQqqqqqqqqqqqqqqqqqQh",
  "hHhWWWWWWWQQQQQQQQQQQQQQQQQQQh",
  "hHhhhhhhhhQQQQQQQQQQQQQQQQQQQh",
  "hHhQQQQQQQQQQQQQQQQQQQQQQQQQQh",
  "hhhhhhhhhhhhhhhhhhhhhhhhhhhhhh",
  "hHh........................hHh",
  "hhh........................hhh",
];

/*
  ── 프리미엄 (500점 넘는 것) ──
  9/17 시안 두 번을 거쳐 고른 것들. 공주 방 한 벌(왕관 · 날개 · 캐노피 침대 · 화장대 ·
  궁전 벽지 · 왕실 카펫) 과 움직이는 것 둘(밤하늘 창문 · 어항).
  드레스는 판다 몸이 네 줄뿐이라 느낌이 안 살아서 뺐다 — 입는 건 몸 밖으로 뻗어야 산다.
*/
const FURN = {
  h: "#D5C7D0", H: "#FDFAFC", W: "#FFFFFF", Q: "#F6A8C6", q: "#E08AAC",
  c: "#FFD1E3", C: "#F6A8C6", d: "#E2648F", Y: "#E3B85C", K: INK,
  m: "#DDF1F8", M: "#FFFFFF", p: "#FF9EC4", P: "#E2648F", j: "#FFD1E3", J: "#E3B85C",
};

/* 캐노피 침대 30 x 26 — 침대 위에 지붕 다섯 줄, 리본으로 묶은 커튼 아홉 줄 */
const CANOPY_BED = (() => {
  const top = [
    "hhhhhhhhhhhhhhYYhhhhhhhhhhhhhh",
    "hHHHHHHHHHHHHHYYHHHHHHHHHHHHHh",
    "hcccccccccccccccccccccccccccch",
    "hCcCcCcCcCcCcCcCcCcCcCcCcCcCch",
    "hHh" + ".c".repeat(12) + "hHh",
  ];
  // 커튼 폭 — 위에서 좁아지다 리본(가운데 줄) 에서 묶이고 다시 퍼진다
  const curtain = [4, 3, 3, 2, 1, 2, 2, 3, 3].map((w, k) => {
    const row = [..."hHh........................hHh"];
    for (let i = 0; i < w; i++) row[3 + i] = row[26 - i] = k === 4 ? "d" : "c";
    return row.join("");
  });
  // 침대 머리판 두 줄 오른쪽에 뒷기둥을 잇는다
  return [...top, ...curtain, ...BED.map((r, i) => (i < 2 ? r.slice(0, 27) + "hHh" : r))];
})();

/* 어항 18 x 14 — 물고기 둘이 엇갈려 헤엄치고 방울이 올라간다. 여덟 장 */
const FISH = ["O.OOO", "OOOKO", "O.OOO"];
const MINI = ["PP.P", "PPPP"];
const flipRows = (rows: string[]) => rows.map((r) => [...r].reverse().join(""));
function tankFrame(f: number) {
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
const TANK = Array.from({ length: 8 }, (_, f) => tankFrame(f));

/* 밤하늘 창문 — 틀은 다른 창문과 같다. 별 두 벌이 번갈아 반짝 (두 장씩 머물러 느리게) */
const MOON = [".SSS", "SS..", "SS..", "SS..", ".SSS"];
const STARS_A: [number, number][] = [[2, 1], [9, 2], [5, 5], [17, 8], [3, 9], [7, 8], [15, 1]];
const STARS_B: [number, number][] = [[6, 1], [2, 4], [10, 5], [19, 6], [5, 8], [18, 10], [13, 2]];
const NIGHT_PARTS: Part[] = [[MOON, 14, 2], [["F"], 6, 15]];
const NIGHT_A = windowRows(NIGHT_PARTS, STARS_A, "C");
const NIGHT_B = windowRows(NIGHT_PARTS, STARS_B, "C");

/* 공주 화장대 20 x 22 */
const VANITY = [
  ".......YYYYYY.......",
  ".....YYmmmmmmYY.....",
  "....YmmMMmmmmmmY....",
  "...YmmMMmmmmmmmmY...",
  "...YmMMmmmmmmmmmY...",
  "...YmMmmmmmmmmmmY...",
  "...YmmmmmmmmmmmmY...",
  "...YmmmmmmmmmmmmY...",
  "....YmmmmmmmmmmY....",
  ".....YYmmmmmmYY.....",
  ".......YYYYYY.......",
  "..pp.....YY....jjj..",
  "..PP.....YY....jJj..",
  "hhhhhhhhhhhhhhhhhhhh",
  "HHHHHHHHHHHHHHHHHHHH",
  "hhhhhhhhhhhhhhhhhhhh",
  "hHHHHHHh....hHHHHHHh",
  "hHHYHHHh....hHHHYHHh",
  "hhhhhhhh....hhhhhhhh",
  "hHh..............hHh",
  "hHh..............hHh",
  "hhh..............hhh",
];

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
const wings = (half: string[]) => half.map((r) => r + [...r].reverse().join("").replace(/W/g, "a"));
const WINGS_OPEN = wings(WING);
const WINGS_FOLD = wings(WING.map((r) => "." + r.slice(0, 13)));

/*
  궁전 창문 38 x 38 — 발코니 창문과 같은 크기. (30 x 30 에서 키우며 다시 그렸다)
  두 겹 금 아치 틀 위에 작은 왕관 장식, 주름 세 자락 가림막에 금 술 장식,
  양옆 벨벳 커튼은 금술로 묶었다. 창밖은 노을 해를 등진 분홍 지붕 동화 성과 장미 정원.
  성 꼭대기 깃발이 펄럭이고 새 두 마리가 난다 (네 장)
*/
function palaceFrame(f: number) {
  const W = 38, H = 38, cx = 18.5, sp = 17;
  const g: string[][] = Array.from({ length: H }, () => Array(W).fill("."));
  const arch = (x: number, y: number, r: number, x0: number, x1: number, y1: number) =>
    y > y1 ? false : y >= sp ? x >= x0 && x <= x1 : (x - cx) ** 2 + (y - sp) ** 2 <= r * r;
  const inView = (x: number, y: number) => arch(x, y, 13.6, 5, 32, 32);
  const set = (x: number, y: number, c: string) => { if (inView(x, y)) g[y][x] = c; };
  const put = (x: number, y: number, c: string) => { if (g[y]?.[x] !== undefined) g[y][x] = c; };
  const art = (rows: string[], x: number, y: number, only = true) =>
    rows.forEach((r, dy) => [...r].forEach((c, dx) => { if (c !== ".") (only ? set : put)(x + dx, y + dy, c); }));

  // 하늘 — 분홍에서 살구로, 성 뒤에 노을 해와 햇무리
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (!inView(x, y)) continue;
      const d = Math.hypot(x - cx, y - 20);
      g[y][x] = d <= 5 ? "S" : d <= 6.6 ? "E" : y < 9 ? "A" : y < 15 ? "B" : "D";
    }
  art([".CC..", "CCCCC"], 7, 9);
  art(["..CC.", "CCCCC", ".CCC."], 26, 7);
  // 새 두 마리 — 한 칸씩 오른쪽으로
  const bx = 9 + f;
  art(["K.K", ".K."], bx, 5 + (f % 2));
  art(["K.K", ".K."], bx + 5, 7 - (f % 2));

  // 언덕 · 장미 정원 · 성으로 가는 길
  for (let y = 28; y <= 32; y++)
    for (let x = 5; x <= 32; x++) {
      const path = Math.abs(x - cx) <= 1 + (y - 28) * 0.8;
      set(x, y, path ? "p" : (x * 5 + y * 3) % 7 === 0 ? "o" : y === 28 ? "g" : "G");
    }

  // 성 — 가운데 큰 탑 · 양옆 탑 · 성벽
  const tower = (x0: number, x1: number, top: number, roofRows: number) => {
    for (let y = top; y <= 28; y++) for (let x = x0; x <= x1; x++) set(x, y, x === x1 ? "v" : "w");
    for (let k = 0; k < roofRows; k++)
      for (let x = x0 - 1 + k; x <= x1 + 1 - k; x++) set(x, top - 1 - k, x > (x0 + x1) / 2 ? "u" : "T");
    return top - roofRows; // 지붕 꼭대기 바로 위 줄
  };
  for (let x = 13; x <= 24; x++) for (let y = 22; y <= 28; y++) set(x, y, x >= 23 ? "v" : "w");
  for (let x = 13; x <= 24; x += 2) set(x, 21, "w");                 // 성가퀴
  const lt = tower(10, 12, 18, 3);
  const rt = tower(25, 27, 18, 3);
  const ct = tower(16, 21, 14, 4);
  // 창 · 문
  [[18, 16], [19, 16], [18, 17], [19, 17], [11, 21], [26, 21], [15, 24], [22, 24]].forEach(([x, y]) => set(x, y, "k"));
  [[18, 25], [19, 25], [17, 26], [18, 26], [19, 26], [20, 26], [17, 27], [18, 27], [19, 27], [20, 27], [17, 28], [18, 28], [19, 28], [20, 28]]
    .forEach(([x, y]) => set(x, y, "k"));
  // 깃발 — 장마다 펄럭이는 모양이 바뀐다
  const flag = (x: number, y: number) => {
    set(x, y, "Y"); set(x, y - 1, "Y"); set(x, y - 2, "Y");
    art(f % 2 ? ["FF.", "FFF"] : ["FFF", "FF."], x + 1, y - 2);
  };
  flag(18, ct - 1);
  flag(11, lt - 1);
  flag(26, rt - 1);

  // 가느다란 금 창살 둘 — 성을 안 가리게 성 바깥에
  for (let y = 0; y <= 32; y++) { set(8, y, "Y"); set(29, y, "Y"); }

  // 틀 — 금 두 겹, 바깥은 짙은 금
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (inView(x, y)) continue;
      if (arch(x, y, 16.4, 2, 35, 33)) g[y][x] = arch(x, y, 15.5, 3, 34, 33) ? (arch(x, y, 14.5, 4, 33, 33) ? "Y" : "j") : "y";
    }
  // 틀 가운데 줄에 보석이 줄지어 박히게 — j 는 한 칸 건너 하나만 남긴다
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (g[y][x] === "j" && (x + y) % 3) g[y][x] = "Y";
  // 창턱 — 금 두 줄, 가운데 보석
  for (let x = 1; x <= 36; x++) { put(x, 33, "Y"); put(x, 34, "y"); }
  put(18, 33, "j"); put(19, 33, "j");

  // 가림막 — 주름 세 자락, 아래 가장자리에 금 술
  for (let x = 0; x < W; x++) {
    const t = (x % 13) / 12;
    const depth = 3 + Math.round(Math.sin(Math.PI * t) * 3);
    for (let y = 0; y < depth; y++) put(x, y, y === 0 ? "d" : (x + y) % 4 === 0 ? "r" : "R");
    put(x, depth, x % 2 ? "Y" : "y");
  }
  // 양옆 커튼 — 위가 넓고 금술로 묶은 곳에서 좁아졌다가 바닥까지 퍼진다
  for (let y = 4; y < H; y++) {
    const w = y < 20 ? Math.ceil(6 - (y - 4) * 0.25) : y < 23 ? 2 : Math.min(5, 2 + Math.round((y - 22) * 0.3));
    for (let i = 0; i < w; i++) {
      const c = i === w - 1 ? "d" : i % 2 ? "r" : "R";
      put(i, y, c);
      put(W - 1 - i, y, c);
    }
  }
  // 금술 — 묶은 끈과 늘어진 술
  art(["YYYY", ".YY.", ".yy.", "Y..Y"], 1, 20, false);
  art(["YYYY", ".YY.", ".yy.", "Y..Y"], W - 5, 20, false);
  // 꼭대기 왕관 장식 — 가림막 위에
  art(["Y..YY..Y", "YYYYYYYY", "YjYYYYjY"], 15, 0, false);
  return g.map((r) => r.join(""));
}
const PALACE = [0, 1, 2, 3].map(palaceFrame);
const PALACE_PAL = {
  Y: "#E3B85C", y: "#B8862B", j: "#FF6FA8",
  R: "#D9537F", r: "#EE7FA7", d: "#A93B63",
  A: "#FFB3CF", B: "#FFCBCB", D: "#FFE1C4", S: "#FFF1A8", E: "#FFE6B8", C: "#FFFFFF", K: "#8A5A78",
  G: "#8FC48A", g: "#6FAE6A", o: "#FF7BAC", p: "#F3D9B8",
  w: "#FBF4FA", v: "#DCCBE6", T: "#FF8FBC", u: "#E2648F", k: "#9B7BC0", F: "#FF4F8B",
};

/* ── 왕궁 장식 (9/17) — 궁전 벽지 · 왕실 카펫 · 캐노피 침대에 맞춘 것 ── */
const GOLD = { Y: "#E3B85C", y: "#B8862B" };

/** 흰 인형처럼 밝은 그림이 벽 · 바닥에 묻히지 않게 둘레를 한 겹 두른다 (가구와 같은 수법) */
function outline(rows: string[], ch = "o") {
  const w = rows[0].length + 2;
  const g = [".".repeat(w), ...rows.map((r) => `.${r}.`), ".".repeat(w)].map((r) => [...r]);
  const filled = (x: number, y: number) => g[y]?.[x] !== undefined && g[y][x] !== "." && g[y][x] !== ch;
  for (let y = 0; y < g.length; y++)
    for (let x = 0; x < w; x++)
      if (g[y][x] === "." && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => filled(x + dx, y + dy)))
        g[y][x] = ch;
  return g.map((r) => r.join(""));
}

/* 왕실 깃발 12 x 22 — 금 막대에 걸린 진홍 천, 금 테두리 · 왕관 무늬, 아래는 제비꼬리와 금술 */
const BANNER = (() => {
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

/* 왕좌 20 x 22 — 왕관 등받이 · 진홍 벨벳(단추 박음) · 금 팔걸이와 다리 */
const THRONE = [
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

/* 유니콘 인형 11 x 11 (+ 둘레 13 x 13) — 판다(16) 보다 작게. 흰 몸, 분홍 · 보라 갈기, 금 뿔 · 금 발굽 */
const UNICORN = outline([
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

/* 장미 꽃병 10 x 12 — 화장대 · 탁자 위에 얹는다. 분홍 장미 셋, 금 꽃병에 분홍 보석 */
const VASE = (() => {
  const g = Array.from({ length: 12 }, () => [..."..........".slice(0, 10)]);
  const rose = (cx: number, cy: number) =>
    [[0, -1, "R"], [-1, 0, "R"], [0, 0, "r"], [1, 0, "R"], [0, 1, "R"]].forEach(([dx, dy, c]) => {
      g[cy + (dy as number)][cx + (dx as number)] = c as string;
    });
  rose(2, 2);
  rose(7, 2);
  rose(5, 1);
  [[1, 4], [8, 4], [3, 4], [6, 4]].forEach(([x, y]) => (g[y][x] = "g"));
  [[4, 3], [5, 4], [4, 5], [5, 5]].forEach(([x, y]) => (g[y][x] = "G"));
  const vase = ["..YYYYYY..", "...YyyY...", "..YYYYYY..", ".YYYjjYYY.", ".YYYYYYYY.", "..yyyyyy.."];
  vase.forEach((r, i) => [...r].forEach((c, x) => { if (c !== ".") g[6 + i][x] = c; }));
  return g.map((r) => r.join(""));
})();

/*
  발코니 창문 38 x 38 — 궁전 창문(30 x 30) 보다 크다.
  흰 프렌치 창에 금 테두리, 아치 윗창엔 햇살 창살, 아래엔 금 발코니 난간.
  창밖은 보랏빛 노을 속 도시 — 시계탑 · 청록 양파 돔 궁전 · 뾰족탑 · 분홍 집들, 강물.
  열기구가 둥실 오르내리고 집 창문 불빛이 깜빡인다 (네 장)
*/
function balconyFrame(f: number) {
  const W = 38, H = 38, cx = 18.5, sp = 18;
  const g: string[][] = Array.from({ length: H }, () => Array(W).fill("."));
  const arch = (x: number, y: number, r: number, x0: number, x1: number, y1: number) =>
    y > y1 ? false : y >= sp ? x >= x0 && x <= x1 : (x - cx) ** 2 + (y - sp) ** 2 <= r * r;

  // 창밖 — 하늘 세 겹, 강물
  const view = (x: number, y: number) => (y >= 31 ? "w" : y < 11 ? "A" : y < 22 ? "B" : "D");
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) if (arch(x, y, 15.6, 3, 34, 33)) g[y][x] = view(x, y);
  const inView = (x: number, y: number) => arch(x, y, 15.6, 3, 34, 33);
  const set = (x: number, y: number, c: string) => { if (inView(x, y)) g[y][x] = c; };
  const box = (x0: number, x1: number, y0: number, y1: number, c: string) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, c);
  };
  const roof = (x0: number, x1: number, yBase: number, c: string) => {
    // 삼각 지붕 — 한 줄 올라갈 때마다 양쪽에서 한 칸씩
    for (let k = 0; x0 + k <= x1 - k; k++) for (let x = x0 + k; x <= x1 - k; x++) set(x, yBase - k, c);
  };
  const lit = (x: number, y: number, seed: number) => set(x, y, (seed + f) % 4 === 0 ? "l" : "L");

  // 뒤 건물부터
  box(3, 7, 24, 30, "c"); roof(3, 7, 23, "r"); lit(5, 26, 1); lit(5, 28, 2);                 // 왼쪽 집
  box(8, 11, 13, 30, "C"); roof(8, 11, 12, "r"); set(9, 16, "W"); set(10, 16, "W");           // 시계탑
  set(9, 17, "W"); set(10, 17, "W"); set(10, 16, "K"); set(10, 17, "K");
  lit(9, 21, 0); lit(10, 25, 3);
  box(12, 17, 26, 30, "q"); roof(12, 17, 25, "r"); lit(14, 28, 2); lit(16, 28, 1);           // 분홍 집
  box(20, 33, 25, 30, "c");                                                                  // 궁전 몸통
  // 청록 양파 돔 — 아래가 불룩하고 위로 뾰족. 금 꼭지
  ["...tt...", "..tttt..", ".tttttt.", "tttttttt", "tttttttt", ".tttttt."].forEach((r, dy) =>
    [...r].forEach((c, dx) => { if (c !== ".") set(23 + dx, 19 + dy, c); })
  );
  set(26, 17, "Y"); set(27, 17, "Y"); set(26, 16, "Y");
  [21, 24, 29, 32].forEach((x, i) => lit(x, 26, i));                                        // 난간에 안 가리게 26줄
  box(32, 34, 17, 30, "C"); roof(32, 34, 16, "r"); set(33, 14, "Y");                         // 뾰족탑
  lit(33, 22, 1);

  // 열기구 — 왼쪽 윗창에서 한 칸씩 오르내린다
  const by = 4 + [0, 0, 1, 1][f];
  [".RRR.", "RRWRR", "RRWRR", ".RWR.", ".h.h.", ".YYY."].forEach((r, dy) =>
    [...r].forEach((c, dx) => { if (c !== ".") set(7 + dx, by + dy, c); })
  );

  // 틀 — 흰 창틀에 금 한 줄, 바깥은 테두리색
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (inView(x, y)) continue;
      if (arch(x, y, 18.4, 0, 37, 35)) g[y][x] = arch(x, y, 17.4, 1, 36, 35) ? (arch(x, y, 16.5, 2, 35, 34) ? "Y" : "H") : "h";
    }
  // 가운데 창살 · 윗창 가로대 · 햇살 창살
  for (let y = 2; y <= 33; y++) { if (inView(18, y)) g[y][18] = "H"; if (inView(19, y)) g[y][19] = "H"; }
  for (let x = 3; x <= 34; x++) set(x, sp, "H");
  for (let y = 2; y < sp; y++)
    for (let x = 3; x <= 34; x++) {
      const d = Math.hypot(x - cx, y - sp);
      if (d > 3 && Math.abs(Math.sin(Math.atan2(y - sp, x - cx) * 3)) < 0.1) set(x, y, "H");
    }
  // 발코니 난간 — 금 윗난간 · 아랫난간 · 기둥
  for (let x = 3; x <= 34; x++) { set(x, 27, "Y"); set(x, 33, "y"); if (x % 3 === 0) for (let y = 28; y <= 32; y++) set(x, y, "Y"); }
  // 창턱
  for (let x = 0; x <= 37; x++) { g[36][x] = "H"; g[37][x] = "h"; }
  return g.map((r) => r.join(""));
}
const BALCONY = [0, 1, 2, 3].map(balconyFrame);

/*
  왕실 침대 35 x 34 — 궁전 벽지 · 왕실 카펫과 한 벌 (크림 · 진홍 · 금).
  캐노피 침대처럼 네 기둥 위에 지붕을 얹었다. 지붕 가운데 보석 왕관, 진홍 휘장에 금 술.
  양옆에는 **비치는 망사 커튼** — 한 칸 건너 한 칸만 칠해서 뒤 벽지가 비쳐 보이게 했고, 금술로 묶었다.
  이불은 **흰색**에 금 테두리 (처음엔 진홍 이불이었는데 궁전 벽지 진홍에 묻혀서 바꿨다),
  가운데 진홍 마름모 하나 · 아래 진홍 단. 금 기둥 · 금 다리.
*/
function royalBed() {
  const W = 35, H = 34;
  const g: string[][] = Array.from({ length: H }, () => Array(W).fill("."));
  const put = (x: number, y: number, c: string) => { if (g[y]?.[x] !== undefined) g[y][x] = c; };
  const art = (rows: string[], x: number, y: number) =>
    rows.forEach((r, dy) => [...r].forEach((c, dx) => { if (c !== ".") put(x + dx, y + dy, c); }));

  // 기둥 넷 (앞에서 보면 둘) — 금, 꼭대기 금 구슬
  for (let y = 2; y < H; y++) { put(1, y, "Y"); put(2, y, "y"); put(32, y, "Y"); put(33, y, "y"); }
  art(["YY"], 1, 1); art(["YY"], 32, 1);

  // 지붕 — 금 막대 · 진홍 휘장 · 물결 끝 · 금 술
  for (let x = 1; x <= 33; x++) {
    put(x, 2, "Y");
    put(x, 3, "R");
    put(x, 4, x % 3 === 0 ? "r" : "R");
    if (x % 3 !== 2) put(x, 5, "R");
    if (x % 3 === 0) put(x, 6, "Y");
  }
  // 지붕 가운데 보석 왕관
  art(["Y.YjY.Y", "YYYYYYY"], 14, 0);

  // 베개 · 진홍 쿠션
  art(["wwwwwww", "wWWWWWw", "wWWWWWw", "wwwwwww"], 3, 18);
  art([".wwwww.", "wWWWWWw", "wwwwwww"], 5, 16);
  art(["yyy", "yRy", "yYy", "yyy"], 10, 19);

  // 흰 이불 — 금 테두리, 접힌 결, 가운데 진홍 마름모, 아래 진홍 단
  for (let y = 22; y <= 27; y++) for (let x = 3; x <= 31; x++) put(x, y, (x + y) % 6 === 0 ? "w" : "W");
  for (let x = 3; x <= 31; x++) { put(x, 22, "Y"); put(x, 26, "R"); put(x, 27, "Y"); }
  art(["..R..", ".R.R.", "R.Y.R", ".R.R."], 15, 22);
  put(17, 22, "Y");
  // 매트리스 · 틀
  for (let x = 3; x <= 31; x++) { put(x, 28, "Y"); put(x, 29, "y"); }
  put(16, 30, "Y"); put(17, 30, "y"); put(16, 31, "Y"); put(17, 31, "y");

  // 망사 커튼 — 한 칸 건너 칠해 비치게. 바깥 줄은 진하게, 묶은 곳은 금술
  const widths = [7, 7, 6, 6, 5, 4, 3, 2, 2, 2, 3, 4, 5, 6, 6]; // 이불 금테(22줄) 위에서 끝난다
  widths.forEach((w, k) => {
    const y = 7 + k;
    for (let i = 0; i < w; i++) {
      const c = i === 0 ? "N" : (i + y) % 2 === 0 ? "n" : "";
      if (c) { put(3 + i, y, c); put(31 - i, y, c); }
    }
  });
  art(["YY", "yY"], 3, 14);
  art(["YY", "Yy"], 30, 14);
  return g.map((r) => r.join(""));
}

const PREMIUM: Item[] = [
  {
    id: "crown",
    name: "왕관",
    cat: "옷",
    slot: "head",
    price: 600,
    at: [3, -2],
    // 귀 사이 정수리에 얹는다. 가운데 분홍 보석, 양옆 하늘 보석
    sprite: {
      rows: ["Y...YY...Y", "YY.YYYY.YY", "YYYYYYYYYY", "YJYYPPYYJY", "yyyyyyyyyy"],
      palette: { Y: "#FFD34D", y: "#E5A93A", P: "#FF6FA8", J: "#7FC8F0" },
    },
  },
  {
    id: "wings",
    name: "요정 날개",
    cat: "옷",
    slot: "back",
    price: 650,
    at: [-6, 5],
    sprite: { rows: WINGS_OPEN, palette: { O: "#8FC4F0", a: "#DDF3FF", W: "#FFFFFF", b: "#FFD6E8" } },
    anim: [WINGS_OPEN, WINGS_FOLD],
  },
  {
    id: "canopy",
    name: "캐노피 침대",
    cat: "가구",
    slot: "floor",
    price: 750,
    at: [8, 46],
    sprite: { rows: CANOPY_BED, palette: FURN },
  },
  {
    id: "vanity",
    name: "공주 화장대",
    cat: "가구",
    slot: "floor",
    price: 800,
    at: [52, 50],
    sprite: { rows: VANITY, palette: FURN },
  },
  {
    id: "tank",
    name: "어항",
    cat: "소품",
    slot: "floor",
    price: 650,
    at: [52, 56],
    sprite: {
      rows: TANK[0],
      palette: {
        h: "#D5C7D0", H: "#FDFAFC", B: "#D6F1FF", b: "#9ED8F0", G: "#6FBF7F", s: "#EAD6B8",
        S: "#C9AE8C", O: "#FF9A5C", P: "#FF8FBC", K: INK, W: "#FFFFFF",
      },
    },
    anim: TANK,
  },
  {
    ...win(
      "win_night", "밤하늘 창문", 550,
      { A: "#27305C", B: "#36427A", G: "#2E5446" },
      NIGHT_PARTS, STARS_A, "C",
      { S: "#FFE58A", F: "#F4FF8A" }
    ),
    anim: [NIGHT_A, NIGHT_A, NIGHT_B, NIGHT_B],
  },
  /*
    ── 왕궁 세트 ── 궁전 벽지 · 왕실 카펫 · 캐노피 침대와 맞춘 것 (9/17 시안실).
    창문 둘은 프리미엄보다 한 단계 위 **전설** — 1,000점, 상점 칸이 보라색이다
  */
  {
    id: "win_palace", name: "궁전 창문", cat: "벽 장식", slot: "wall", price: 1000,
    at: [21, 3], only: "win",
    sprite: { rows: PALACE[0], palette: PALACE_PAL }, anim: PALACE,
  },
  {
    id: "win_balcony", name: "발코니 창문", cat: "벽 장식", slot: "wall", price: 1000,
    at: [21, 3], only: "win",
    sprite: {
      rows: BALCONY[0],
      palette: {
        h: "#D5C7D0", H: "#FDFAFC", Y: "#E3B85C", y: "#B8862B", K: INK, W: "#FFFFFF",
        A: "#BBA7E6", B: "#F2B6D3", D: "#FFD6B3", w: "#A9CBEB",
        c: "#9C86C4", C: "#7E68A8", q: "#E58FB5", t: "#6FBFB5", r: "#D0587E",
        L: "#FFE58A", l: "#8E7AB8", R: "#FF7BAC",
      },
    },
    anim: BALCONY,
  },
  {
    id: "banner", name: "왕실 깃발", cat: "벽 장식", slot: "wall", price: 550,
    at: [56, 4],
    sprite: { rows: BANNER, palette: { ...GOLD, R: "#C8384F", W: "#FFFFFF" } },
  },
  {
    id: "throne", name: "왕좌", cat: "가구", slot: "floor", price: 850,
    at: [48, 52],
    sprite: { rows: THRONE, palette: { ...GOLD, R: "#C8384F", r: "#9E2A3E" } },
  },
  {
    id: "unicorn", name: "유니콘 인형", cat: "인형", slot: "floor", price: 600,
    at: [14, 76],
    sprite: {
      rows: UNICORN,
      palette: { o: "#D9B8CC", W: "#FFFFFF", h: "#EBDCE5", m: "#FF9EC4", n: "#CDB6F0", K: INK, p: "#FFB3CF", Y: "#E3B85C", g: "#E3B85C" },
    },
  },
  {
    id: "royal_bed", name: "왕실 침대", cat: "가구", slot: "floor", price: 1000, at: [6, 38],
    sprite: {
      rows: royalBed(),
      palette: {
        Y: "#E3B85C", y: "#B8862B", R: "#C8384F", r: "#9E2A3E", j: "#FF6FA8",
        W: "#FFFFFF", w: "#E6D9E2", N: "#D2A9C6", n: "#EBD3E6",
      },
    },
  },
  {
    id: "vase", name: "장미 꽃병", cat: "소품", slot: "top", price: 500,
    at: [58, 51],
    sprite: { rows: VASE, palette: { ...GOLD, R: "#FF7BAC", r: "#E2648F", g: "#6FAE6A", G: "#5A9A6A", j: "#FF6FA8" } },
  },
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
    at: [1, 1],
    // 챙을 머리보다 한 칸씩만 넓게. 더 넓으면 갓처럼 보인다
    sprite: s(["..NNNNNNNNNN..", ".NNNNNNNNNNNN.", "nnnnnnnnnnnnnn"], "Nn"),
  },
  {
    id: "bow_pink",
    name: "분홍 왕리본",
    cat: "옷",
    slot: "head",
    price: 60,
    at: [1, -4],
    sprite: { rows: BOW, palette: { K: INK, R: "#FF8FBC", d: "#E2648F" } },
  },
  {
    id: "bow_sky",
    name: "하늘 왕리본",
    cat: "옷",
    slot: "head",
    price: 60,
    at: [1, -4],
    sprite: { rows: BOW, palette: { K: INK, R: "#8FC4F0", d: "#5A93C9" } },
  },
  {
    id: "overall",
    name: "멜빵바지",
    cat: "옷",
    slot: "body",
    price: 220,
    at: [3, 13],
    sprite: s(["...U..U...", "..UUUUUU..", "..uuuuuu.."], "Uu"),
  },
  {
    id: "plant",
    name: "화분",
    cat: "소품",
    slot: "floor",
    price: 140,
    at: [10, 62],
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
    cat: "가구",
    slot: "floor",
    price: 300,
    at: [52, 60],
    sprite: s(
      [
        "hhhhhhhhhhhhhhhhhhhh",
        "HHHHHHHHHHHHHHHHHHHH",
        "hhhhhhhhhhhhhhhhhhhh",
        "hH................Hh",
        "hH................Hh",
        "hH................Hh",
        "hH................Hh",
        "hh................hh",
      ],
      "Hh"
    ),
  },
  {
    id: "rug",
    name: "분홍 러그",
    cat: "소품",
    slot: "flat",
    price: 100,
    at: [26, 74],
    // 28 x 8. 판다(16폭) 가 올라서도 자리가 남아야 깔개로 보인다
    sprite: s(
      [
        "......QQQQQQQQQQQQQQQQ......",
        "...QQQQQQQQQQQQQQQQQQQQQQ...",
        ".QQQQQQQQQQQQQQQQQQQQQQQQQQ.",
        "QQQqqqqqqqqqqqqqqqqqqqqqqQQQ",
        "QQQqqqqqqqqqqqqqqqqqqqqqqQQQ",
        ".QQQQQQQQQQQQQQQQQQQQQQQQQQ.",
        "...QQQQQQQQQQQQQQQQQQQQQQ...",
        "......QQQQQQQQQQQQQQQQ......",
      ],
      "Qq"
    ),
  },
  /*
    ── 가구 ──
    같은 책상이라도 모양이 달라야 고르는 재미가 있다. 전부 흰색이고,
    상판 아래 한 줄을 테두리색으로 깔아 두께를 낸다 — 이게 없으면 판자 한 장으로 보인다.
  */
  {
    id: "bed",
    name: "침대",
    cat: "가구",
    slot: "floor",
    price: 320,
    at: [9, 56],
    /*
     * 프레임도 베개도 흰색이라 붙어 보인다. 베개 둘레를 테두리로 끊어 떼어놨다.
     * 22폭이던 걸 30폭으로 늘렸다 — 판다(16) 옆에 두면 아기 침대처럼 짧다는 말을 들었다.
     * 베개는 그대로 두고 이불만 길어졌다
     */
    sprite: s(BED, "HhWQq"),
  },
  {
    id: "desk2",
    name: "공부 책상",
    cat: "가구",
    slot: "floor",
    price: 280,
    at: [46, 58],
    sprite: s(
      [
        "hhhhhhhhhhhhhhhhhhhhhh",
        "HHHHHHHHHHHHHHHHHHHHHH",
        "hhhhhhhhhhhhhhhhhhhhhh",
        "hH.............hHHHHHh",
        "hH.............hhhhhhh",
        "hH.............hHHHHHh",
        "hH.............hhhhhhh",
        "hH.............hHHHHHh",
        "hH.............hH...Hh",
        "hh.............hh...hh",
      ],
      "Hh"
    ),
  },
  {
    id: "table",
    name: "둥근 탁자",
    cat: "가구",
    slot: "floor",
    price: 180,
    at: [34, 66],
    sprite: s(
      [
        "..hhhhhhhh..",
        "hHHHHHHHHHHh",
        "hhhhhhhhhhhh",
        "....hHHh....",
        "....hHHh....",
        "....hHHh....",
        "..hhHHHHhh..",
        "..hhhhhhhh..",
      ],
      "Hh"
    ),
  },
  {
    id: "shelf",
    name: "책장",
    cat: "가구",
    slot: "floor",
    price: 300,
    at: [60, 55],
    // 흰 책장에 책만 색을 준다. 칸을 나누는 줄도 테두리색이라 책이 도드라진다
    sprite: s(
      [
        "hhhhhhhhhhhh",
        "hHHHHHHHHHHh",
        "hRRUUGGNNRRh",
        "hRRUUGGNNRRh",
        "hhhhhhhhhhhh",
        "hUUNNRRGGUUh",
        "hUUNNRRGGUUh",
        "hhhhhhhhhhhh",
        "hGGRRUUNNGGh",
        "hGGRRUUNNGGh",
        "hhhhhhhhhhhh",
        "hHHHHHHHHHHh",
        "hHHHHHHHHHHh",
        "hhh......hhh",
      ],
      "HhRUGN"
    ),
  },
  {
    id: "lamp",
    name: "스탠드",
    cat: "가구",
    slot: "floor",
    price: 120,
    at: [33, 57],
    sprite: s(
      [
        ".NNNN.",
        "NNNNNN",
        "NNNNNN",
        ".nnnn.",
        "..hH..",
        "..hH..",
        "..hH..",
        "..hH..",
        "..hH..",
        "..hH..",
        ".hHHh.",
        "hhHHhh",
      ],
      "NnHh"
    ),
  },
  /* 인형은 판다와 같은 한 칸짜리 눈을 쓴다. 두 칸으로 키우면 주인공이 둘로 보인다 */
  {
    id: "bear",
    name: "곰 인형",
    cat: "인형",
    slot: "floor",
    price: 90,
    at: [36, 78],
    sprite: s(
      [
        "ZZ....ZZ",
        "ZZZZZZZZ",
        "ZKZZZZKZ",
        "ZZZWWZZZ",
        "ZZZWKWZZ",
        "ZZZZZZZZ",
        "zZZZZZZz",
        "zzZZZZzz",
        ".zzzzzz.",
      ],
      "ZzKW"
    ),
  },
  {
    id: "bunny",
    name: "토끼 인형",
    cat: "인형",
    slot: "floor",
    price: 90,
    at: [24, 76],
    sprite: s(
      [
        ".WW..WW.",
        ".WW..WW.",
        ".WW..WW.",
        ".WWWWWW.",
        "WWWWWWWW",
        "WKWWWWKW",
        "WWWppWWW",
        "WWWWWWWW",
        ".WWWWWW.",
        "..WWWW..",
      ],
      "WKp"
    ),
  },
  /*
    ── 가구 위에 얹는 것 ──
    바닥이 아니라 책상·탁자·책장 위에 올린다. 바닥 가구보다 **나중에 그려야**
    책상 위에 올려도 책상 뒤로 숨지 않는다 (PetRoom 의 그리는 차례 참고).
  */
  {
    id: "pot",
    name: "작은 화분",
    cat: "소품",
    slot: "top",
    price: 60,
    at: [54, 51],
    sprite: s(["..GG..", ".GGGG.", "GGgGGG", ".GGGG.", "..GG..", "TTTTTT", ".TTTT."], "GgT"),
  },
  {
    id: "cactus",
    name: "선인장",
    cat: "소품",
    slot: "top",
    price: 60,
    at: [36, 60],
    sprite: s(
      ["..GG..", "G.GG..", "GGGG.G", ".GGGGG", "..gG..", "..GG..", "TTTTTT", ".TTTT."],
      "GgT"
    ),
  },
  {
    id: "books",
    name: "책 더미",
    cat: "소품",
    slot: "top",
    price: 50,
    at: [47, 53],
    sprite: s([".RRRRRR.", ".RRRRRR.", "UUUUUUUU", "UUUUUUUU", "GGGGGGGG"], "RUG"),
  },
  {
    id: "clock",
    name: "벽시계",
    cat: "벽 장식",
    slot: "wall",
    price: 100,
    at: [56, 14],
    sprite: s(
      [
        "..KKKK..",
        ".KWWWWK.",
        "KWWKWWWK",
        "KWWKWWWK",
        "KWWKKWWK",
        "KWWWWWWK",
        ".KWWWWK.",
        "..KKKK..",
      ],
      "KW"
    ),
  },
  {
    id: "frame",
    name: "액자",
    cat: "벽 장식",
    slot: "wall",
    price: 120,
    at: [16, 16],
    // 창문과 같은 하늘·풀색을 써서 창밖 풍경을 담아놓은 것처럼 보이게 했다
    sprite: {
      rows: [
        "KKKKKKKKKK",
        "KWWWWWWWWK",
        "KWAAAAAAWK",
        "KWAAASSAWK",
        "KWAAASSAWK",
        "KWALLAAAWK",
        "KWALLAAAWK",
        "KWEEEEEEWK",
        "KWWWWWWWWK",
        "KKKKKKKKKK",
      ],
      palette: { K: INK, W: "#FFFFFF", A: "#A8D8F0", S: "#FFD34D", L: "#5FA34E", E: "#8FC97A" },
    },
  },
  ...WINDOWS,
  ...PREMIUM,
];

/**
 * 자리를 저장하기 전에 쓰던 방식에서 옮겨오기.
 * 예전에는 소품마다 자리가 코드에 박혀 있고 "왼쪽 바닥·오른쪽 바닥" 한 칸씩만 썼다.
 * 그때 놓아둔 것들을 새 자리(소품마다 정해둔 처음 자리)로 옮겨준다.
 * 한 번 저장되고 나면 다시 탈 일이 없지만, 지워버리면 놓아둔 게 사라진다.
 */
export function spotsFromPlaced(placed: Record<string, string | null | undefined>) {
  return Object.values(placed ?? {})
    .filter((id): id is string => !!id)
    .map((id) => {
      const it = ITEMS.find((i) => i.id === id);
      return it ? { id, x: it.at[0], y: it.at[1] } : null;
    })
    .filter((v): v is { id: string; x: number; y: number } => !!v);
}

/** 벽지 · 타일은 스프라이트가 아니라 면을 칠하는 방식이라 따로 둔다 */
export type Surface = {
  id: string;
  name: string;
  price: number;
  base: string;
  accent?: string;
  /** 꽃 벽지의 꽃술처럼 색이 하나 더 필요할 때 */
  accent2?: string;
  kind?:
    | "dot" | "stripe" | "panel" | "flower" | "palace" | "goldstripe"
    | "plank" | "check" | "grid" | "parquet" | "royal" | "flowertile";
};

export const WALLS: Surface[] = [
  { id: "w0", name: "민무늬", price: 0, base: "#D9CCD4" },
  { id: "w1", name: "분홍", price: 80, base: "#F3DCE8" },
  { id: "w2", name: "민트", price: 80, base: "#D6EDE2" },
  { id: "w3", name: "하늘", price: 80, base: "#D8E8F5" },
  { id: "w4", name: "물방울", price: 160, base: "#F7E3EE", accent: "#E5C4D8", kind: "dot" },
  { id: "w5", name: "줄무늬", price: 160, base: "#FFF3F8", accent: "#F0D6E4", kind: "stripe" },
  // 값을 한 단계 올린 것들. 무늬가 한 겹 더 들어가거나 벽이 위아래로 나뉜다
  { id: "w6", name: "몰딩 벽", price: 220, base: "#F7F1F5", accent: "#E6DAE4", kind: "panel" },
  {
    id: "w7",
    name: "작은 꽃",
    price: 220,
    base: "#FFF7FB",
    accent: "#EFC3D8",
    accent2: "#FFD98A",
    kind: "flower",
  },
  // 골드(700) — 연분홍 넓은 띠 · 가장자리 금실 · 진주 알, 아래 금줄 몰딩 (9/17 시안실)
  {
    id: "w_goldstripe",
    name: "금실 줄무늬 벽지",
    price: 700,
    base: "#FFF4F8",
    accent: "#E3B85C",
    accent2: "#FBE3EC",
    kind: "goldstripe",
  },
  // 프리미엄(1,000) — 왕실 카펫과 한 벌. 크림 바탕 금 마름모, 위 진홍 띠, 아래 진홍 벽널에 금테 칸
  {
    id: "w_palace",
    name: "궁전 벽지",
    price: 1000,
    base: "#F8EEE6",
    accent: "#E3B85C",
    accent2: "#C8384F",
    kind: "palace",
  },
];

export const FLOORS: Surface[] = [
  { id: "f0", name: "맨바닥", price: 0, base: "#C2A184" },
  { id: "f1", name: "마루", price: 120, base: "#D2AE8A", accent: "#B28A66", kind: "plank" },
  { id: "f2", name: "체크", price: 160, base: "#F4E2EA", accent: "#E3C3D3", kind: "check" },
  { id: "f3", name: "타일", price: 160, base: "#DDE9EC", accent: "#B9CFD5", kind: "grid" },
  { id: "f4", name: "분홍 카펫", price: 80, base: "#F6CFDF" },
  { id: "f5", name: "잔디", price: 140, base: "#A9D3A0", accent: "#8CBB83", kind: "check" },
  { id: "f6", name: "쪽매 마루", price: 220, base: "#E9D9C6", accent: "#C9AE92", kind: "parquet" },
  // 골드(650) — 금 줄눈 크림 타일, 한 칸 건너 연분홍, 칸마다 분홍 꽃 (9/17 시안실)
  {
    id: "f_flowertile",
    name: "꽃 타일",
    price: 650,
    base: "#FFF6EC",
    accent: "#E6C37A",
    accent2: "#EE6F9E",
    kind: "flowertile",
  },
  // 프리미엄(1,000) — 크림 마루 가운데로 금테 빨간 카펫이 앞까지. accent 가 카펫, accent2 가 금
  {
    id: "f_royal",
    name: "왕실 카펫",
    price: 1000,
    base: "#F3EAE0",
    accent: "#C8384F",
    accent2: "#E8C170",
    kind: "royal",
  },
];

/**
 * 상점에 늘어놓는 순서 — **비싼 것부터.** 값이 같으면 코드에 적은 순서를 지킨다 (sort 는 안정 정렬).
 * 기본 벽 · 바닥(0점) 은 저절로 맨 뒤로 간다. 원본 배열은 건드리지 않는다
 */
export const byPrice = <T extends { price: number }>(list: T[]) => [...list].sort((a, b) => b.price - a.price);

/**
 * 상점 칸. 두 줄로 나눈다 — 윗줄은 **꺼내놓는 물건**, 아랫줄은 **방 자체를 바꾸는 것**.
 * 예전엔 옷 · 벽지 · 타일 · 기타 넷이었는데 기타에 열여섯 개가 몰려서 찾기 어려웠다.
 * 벽지 · 바닥은 소품(ITEMS) 이 아니라 WALLS · FLOORS 에서 보여준다
 */
export const CAT_ROWS: Cat[][] = [
  ["옷", "가구", "인형", "소품"],
  ["벽 장식", "벽지", "바닥"],
];

/*
 * ── 포인트 ─────────────────────────
 *
 * 값을 한 군데에 몰지 않고 **하는 일마다 조금씩** 준다.
 * 예전에는 스티커와 체크에만 붙어 있어서, 체크(5초) 와 공부(3시간) 의 값이 같았다.
 *
 * 상점 전체가 16,340점. **부지런한 날 180점**(9/17 사용자가 정한 값) — 스티커(보너스 포함 약 42) · 퀴즈 50 ·
 * 타이머 네 번 60 · 과제(주 10개 기준 하루 약 28). 보통 날은 135점쯤이라 **넉 달**이면 다 모은다.
 * 속도를 바꾸려면 아래 값만 만지면 된다 — 셈하는 곳은 전부 이 상수를 본다.
 */

/** 스티커 하나. 그 달에 열 개 모을 때마다 100점 더 */
export const PER_STICKER = 25;
export const BONUS_EVERY = 10;
export const BONUS = 100;
/** 스티커를 이어 붙인 날이 이만큼 갈 때마다 */
export const STREAK_EVERY = 7;
export const STREAK_BONUS = 50;
/**
 * 강의·과제 하나를 다 했다고 표시할 때마다. 하루 다섯 번까지.
 * 한도가 없으면 빈 과제를 만들어 체크하기를 되풀이해 끝없이 모을 수 있다.
 */
export const PER_TASK = 20;
export const TASK_CAP = 5;
/** 토익 퀴즈를 다 맞혔을 때. 하루 한 번만 준다 */
export const PER_QUIZ = 50;
/**
 * 타이머를 **일시정지 없이** 이만큼 잴 때마다. 하루 네 번까지.
 * 조건 없이 시간당으로 주면 켜두기 게임이 된다 — 이 둘이 그걸 막는 전부다.
 */
export const PER_FOCUS = 15;
export const FOCUS_MIN = 25;
export const FOCUS_CAP = 4;

export const monthPoints = (count: number) =>
  count * PER_STICKER + Math.floor(count / BONUS_EVERY) * BONUS;

/**
 * 이어 붙인 날이 7일 갈 때마다 50점.
 *
 * 개수가 아니라 **이어진 길이**를 세므로, 떼면 그만큼 되돌아간다 (연타로 못 불린다).
 * 달을 넘는 연속은 안 센다 — 스티커 문서가 달마다 따로라 지난 달을 읽어와야 하는데,
 * 그 한 번을 위해 읽기를 늘릴 만큼의 값은 아니라고 봤다.
 */
export function streakPoints(days: number[]) {
  let total = 0;
  let run = 0;
  let prev = -99;
  for (const d of [...days].sort((a, b) => a - b)) {
    run = d === prev + 1 ? run + 1 : 1;
    prev = d;
    if (run % STREAK_EVERY === 0) total += STREAK_BONUS;
  }
  return total;
}

/** 그 달 스티커로 번 점수 전부 */
export const stickerPoints = (days: number[]) =>
  monthPoints(days.length) + streakPoints(days);

export const itemById = (id: string) => ITEMS.find((i) => i.id === id);
export const wallById = (id: string) => WALLS.find((w) => w.id === id) ?? WALLS[0];
export const floorById = (id: string) => FLOORS.find((f) => f.id === id) ?? FLOORS[0];

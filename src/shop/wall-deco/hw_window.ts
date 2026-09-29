import type { ItemDef } from "../types";
import { INK } from "../common/palette";
import { HW } from "../common/halloween";

/*
 * 할로윈 창문 38 x 38 (할로윈 세트 · 프리미엄) — 궁전 · 발코니 창문과 같은 크기 (사용자: "궁전 · 발코니처럼 퀄리티 확").
 * 공통 창틀(24 x 22) → 34 x 22 금테 아치를 거쳐 여기까지 왔다. 공통 창틀은 잉크 틀이라 보라 벽지 위에서 아예 안 보였다.
 *
 * - 틀: 고딕 **뾰족 아치** (두 원이 겹친 모양). **검은 쇠틀** 두 겹 · 바깥 잉크 한 줄.
 *   처음엔 금틀에 주황 보석이었는데, 보라 커튼이 틀을 감싸고 나니 안쪽 노란 계열이 지저분하다고 해서(사용자) 전부 어두운 색으로 바꿨다.
 *   벽과 가르는 일은 이제 커튼이 한다 — 34 x 22 때 "틀이 벽보다 밝아야" 했던 건 커튼이 없어서였다
 * - 꼭대기: 호박 장식 — 눈 · 입이 일렁인다
 * - 위 가림막: 끝이 톱니처럼 해진 보라 벨벳, 톱니 끝마다 주황 술. 양옆 커튼은 주황 끈으로 묶었다
 * - 창밖: 보라 밤하늘 · 크림빛 보름달 앞 앙상한 나무 · 언덕 위 유령 저택(창 불빛이 깜빡) · 묘지 · 호박 등 · 박쥐 셋 (네 장)
 * - 창턱: 쇠 두 줄, 양끝 촛불
 */
const HW_TOMB = [".TT.", "TTTT", "TtTT", "TTTT", "TTTT"];
const HW_TOMB2 = [".TT.", "TtTT", "TTTT"];
const HW_CROSS = [".T.", "TTT", ".T.", ".T."];
const HW_BAT = [["V...V", "VVVVV", ".V.V."], [".VVV.", "VVVVV", "V...V"]];
/* 박쥐 셋 — 가운데 녀석은 달 앞을 지나며 검은 그림자가 된다 */
const HW_BATS: [number, number][][] = [
  [[12, 8], [22, 6], [26, 13]],
  [[13, 7], [23, 5], [27, 12]],
  [[14, 8], [24, 6], [26, 11]],
  [[13, 9], [23, 7], [25, 12]],
];
const HW_STARS: [number, number][] = [[20, 4], [27, 9], [30, 14], [8, 9], [18, 16], [6, 22], [25, 3], [17, 3]];
function frame(f: number) {
  const W = 38, Hh = 38, cx = 18.5, sp = 20, k = 4;
  const g: string[][] = Array.from({ length: Hh }, () => Array(W).fill("."));
  // 뾰족 아치 — 스프링 줄(sp) 위는 두 원이 겹친 곳, 아래는 곧은 옆면
  const arch = (x: number, y: number, hw: number, y1: number) =>
    y > y1 ? false
      : y >= sp ? Math.abs(x - cx) <= hw
      : Math.hypot(x - (cx + k), y - sp) <= hw + k && Math.hypot(x - (cx - k), y - sp) <= hw + k;
  const HW = 13.5;
  const inView = (x: number, y: number) => arch(x, y, HW, 32);
  const set = (x: number, y: number, c: string) => { if (inView(x, y)) g[y][x] = c; };
  const put = (x: number, y: number, c: string) => { if (g[y]?.[x] !== undefined) g[y][x] = c; };
  const art = (rows: string[], x: number, y: number, only = true) =>
    rows.forEach((r, dy) => [...r].forEach((c, dx) => { if (c !== ".") (only ? set : put)(x + dx, y + dy, c); }));

  /*
   * 하늘 — 위로 갈수록 짙은 보라, 왼쪽에 크림빛 보름달과 달무리.
   * 처음엔 달을 주황으로 오른쪽 위에 뒀더니 **금틀과 색이 같아 틀에 녹아 붙었다.** 달은 틀보다 밝은 크림으로, 틀에서 떨어뜨렸다
   */
  const MX = 14, MY = 11;
  for (let y = 0; y < Hh; y++)
    for (let x = 0; x < W; x++) {
      if (!inView(x, y)) continue;
      const d = Math.hypot(x - MX, y - MY);
      g[y][x] = d <= 5.4 ? (x - MX + (y - MY) > 4 ? "s" : "S") : d <= 7 ? "E" : y < 9 ? "a" : y < 15 ? "A" : y < 22 ? "B" : "D";
    }
  [[12, 9], [13, 9], [16, 12], [11, 13]].forEach(([x, y]) => set(x, y, "s"));
  HW_STARS.forEach(([x, y], i) => (i + f) % 4 !== 0 && set(x, y, "C"));

  // 언덕 — 저택 쪽이 솟는다. 저택보다 **어둡게** 둬야 저택이 땅에 안 묻힌다
  const ridge = (x: number) => 27 - Math.round(4 * Math.exp(-(((x - 25) / 6) ** 2)));
  for (let x = 0; x < W; x++) for (let y = ridge(x); y <= 32; y++) set(x, y, y === ridge(x) ? "g" : "G");

  // 유령 저택 — 오른쪽 언덕 위. 몸통 · 뾰족 지붕 · 양옆 탑, 창 불빛은 장마다 하나씩 꺼진다
  const h = "h";
  for (let y = 19; y <= 25; y++) for (let x = 22; x <= 28; x++) set(x, y, h);
  for (let r = 0; r < 4; r++) for (let x = 22 + r; x <= 28 - r; x++) set(x, 18 - r, h);
  for (let y = 15; y <= 25; y++) for (let x = 19; x <= 21; x++) set(x, y, h);
  for (let r = 0; r < 4; r++) set(20, 14 - r, h);
  set(19, 14, h); set(21, 14, h);
  for (let y = 17; y <= 25; y++) for (let x = 29; x <= 30; x++) set(x, y, h);
  set(29, 16, h); set(30, 16, h); set(30, 15, h);
  const wins: [number, number][] = [[20, 17], [20, 21], [23, 21], [27, 21], [25, 17], [29, 19], [23, 23], [27, 23]];
  wins.forEach(([x, y], i) => set(x, y, (i + f) % 5 === 0 ? "l" : "L"));
  set(25, 23, "k"); set(25, 24, "k"); set(25, 25, "k");

  // 앙상한 나무 — 달 앞에 가지를 뻗는다 (달에 비친 검은 나무가 할로윈 그림의 단골)
  const TREE: [number, number][] = [
    [11, 28], [12, 28], [13, 28], [12, 27], [12, 26], [12, 25], [12, 24], [12, 23], [12, 22], [12, 21], [12, 20], [12, 19],
    [11, 19], [10, 18], [10, 17], [9, 16], [9, 15], [8, 14],
    [13, 19], [14, 18], [15, 17], [15, 16], [16, 15], [17, 14],
    [12, 18], [12, 17], [11, 16], [11, 15], [12, 14], [12, 13], [12, 12],
    [10, 14], [16, 13], [13, 11], [11, 21], [10, 21], [9, 20],
  ];
  TREE.forEach(([x, y]) => set(x, y, "V"));

  // 묘지 · 호박 등
  // 왼쪽 끝은 커튼 · 촛불에 가려서 나무 양옆으로 모았다
  art(HW_TOMB, 14, 27);
  art(HW_TOMB2, 16, 30);
  art(HW_CROSS, 9, 28);
  const glow = f % 3 === 2 ? "N" : "n";
  art([".v..", "FFFF", `F${glow}${glow}F`, "FFFF"], 20, 28);
  art(["..v.", "FFFF", `F${glow}${glow}F`], 27, 29);

  HW_BATS[f].forEach(([x, y], i) => art(HW_BAT[(f + i) % 2], x, y));

  // 가는 쇠 창살 둘 — 나무 · 저택을 안 가리게 가장자리에
  for (let y = 0; y <= 32; y++) { set(7, y, "Y"); set(31, y, "Y"); }

  /*
   * 틀 — 창밖에서 한 칸씩 떨어진 거리로 겹을 두른다: 쇠 · 쇠 · 짙은 쇠 · 바깥 잉크.
   * 아치 반지름을 늘려 겹을 만들었더니 **뾰족한 꼭대기에서 틀이 세 배로 두꺼워졌다** — 거리로 재야 어디서나 같은 두께다
   */
  const dist: number[][] = Array.from({ length: Hh }, (_, y) => Array.from({ length: W }, (_, x) => (inView(x, y) ? 0 : 99)));
  for (let d = 1; d <= 4; d++)
    for (let y = 0; y < Hh; y++)
      for (let x = 0; x < W; x++)
        if (dist[y][x] === 99 && y <= 33 && [-1, 0, 1].some((dy) => [-1, 0, 1].some((dx) => dist[y + dy]?.[x + dx] === d - 1)))
          dist[y][x] = d;
  for (let y = 0; y < Hh; y++)
    for (let x = 0; x < W; x++) {
      const d = dist[y][x];
      if (d === 1) g[y][x] = "Y";
      else if (d === 2) g[y][x] = "Y";
      else if (d === 3) g[y][x] = "y";
      else if (d === 4) g[y][x] = "K";
    }
  // 창턱 — 쇠 두 줄, 바깥 잉크
  for (let x = 1; x <= 36; x++) { put(x, 33, "Y"); put(x, 34, "y"); put(x, 35, "K"); }
  put(0, 33, "K"); put(0, 34, "K"); put(37, 33, "K"); put(37, 34, "K");

  // 위 가림막 — 해진 톱니 끝, 톱니 끝마다 주황 술
  for (let x = 0; x < W; x++) {
    const t = x % 6;
    const depth = 3 + (t < 3 ? t : 6 - t);
    for (let y = 0; y < depth; y++) put(x, y, y === 0 ? "d" : (x + y) % 4 === 0 ? "r" : "R");
    put(x, depth, t === 3 ? "O" : "d");
  }
  // 양옆 커튼 — 위가 넓고 주황 끈으로 묶은 곳에서 좁아졌다가 아래로 퍼진다. 밑단은 해져 들쭉날쭉
  for (let y = 5; y < Hh; y++) {
    const w = y < 20 ? Math.ceil(6 - (y - 5) * 0.25) : y < 23 ? 2 : Math.min(5, 2 + Math.round((y - 22) * 0.3));
    for (let i = 0; i < w; i++) {
      if (y >= 36 && (i + y) % 2) continue;
      const c = i === w - 1 ? "d" : i % 2 ? "r" : "R";
      put(i, y, c);
      put(W - 1 - i, y, c);
    }
  }
  art(["OOOO", ".OO.", ".oo.", "O..O"], 0, 20, false);
  art(["OOOO", ".OO.", ".oo.", "O..O"], W - 4, 20, false);

  // 꼭대기 호박 장식 — 눈 · 입이 일렁인다
  art(["...vv...", ".KKKKKK.", "KFFFFFFK", `KF${glow}FF${glow}FK`, `KFF${glow}${glow}FFK`, ".KKKKKK."], 15, 0, false);

  // 창턱 촛불 — 불꽃이 장마다 흔들린다
  [6, 30].forEach((x, i) => {
    put(x, 31, "c"); put(x + 1, 31, "c"); put(x, 32, "c"); put(x + 1, 32, "c");
    put(x + ((f + i) % 2), 30, "N");
    put(x + ((f + i) % 2), 29, "F");
  });
  return g.map((r) => r.join(""));
}
const FRAMES = [0, 1, 2, 3].map(frame);

const hwWindow: ItemDef = {
  id: "hw_window",
  name: "할로윈 창문",
  slot: "wall",
  price: 1250,
  at: [21, 3],
  only: "win",
  sprite: {
    rows: FRAMES[0],
    palette: {
      K: INK, Y: "#3E3150", y: "#241A30",
      R: "#5A2A7A", r: "#7A3E9E", d: "#3A1850", O: "#F28C28", o: "#C8651A",
      a: "#1E1030", A: "#2E1A48", B: "#46286A", D: "#5E3A80", E: "#6E4690",
      S: "#FFF0C0", s: "#EBCB85", C: "#E9DDF7",
      h: "#2A1E3A", L: "#FFD34D", l: "#7A5A2A", k: "#050308",
      G: "#1A1224", g: "#34284A", T: "#8C8499", t: "#6B6478",
      F: HW.pump, v: HW.stem, n: HW.glow, N: HW.glow2, V: "#0B0710", c: HW.bone,
    },
  },
  anim: FRAMES,
};
export default hwWindow;

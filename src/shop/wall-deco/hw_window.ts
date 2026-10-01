import type { ItemDef } from "../types";
import { INK } from "../common/palette";
import { HW } from "../common/halloween";

/*
 * 할로윈 창문 34 x 34 (할로윈 세트 · 프리미엄) — 궁전 · 발코니 창문과 같은 크기 (사용자: "궁전 · 발코니처럼 퀄리티 확").
 * 38 x 38 이던 셋을 "너무 크다" 해서 한 치수씩 줄였다 (10/1).
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
/* 박쥐 셋 — 한 녀석은 달 앞을 지나며 검은 그림자가 된다. 나머지 둘은 저택 지붕에 안 묻히게 그 위 하늘에 */
const HW_BATS: [number, number][][] = [
  [[10, 7], [18, 5], [21, 9]],
  [[11, 6], [19, 5], [22, 9]],
  [[12, 7], [20, 5], [22, 9]],
  [[11, 8], [19, 5], [21, 9]],
];
const HW_STARS: [number, number][] = [[18, 5], [24, 8], [26, 13], [7, 9], [16, 14], [6, 19], [22, 4], [15, 4]];
function frame(f: number) {
  const W = 34, Hh = 34, cx = 16.5, sp = 17, k = 4;
  const g: string[][] = Array.from({ length: Hh }, () => Array(W).fill("."));
  // 뾰족 아치 — 스프링 줄(sp) 위는 두 원이 겹친 곳, 아래는 곧은 옆면
  const arch = (x: number, y: number, hw: number, y1: number) =>
    y > y1 ? false
      : y >= sp ? Math.abs(x - cx) <= hw
      : Math.hypot(x - (cx + k), y - sp) <= hw + k && Math.hypot(x - (cx - k), y - sp) <= hw + k;
  const HW = 11.5;
  const inView = (x: number, y: number) => arch(x, y, HW, 28);
  const set = (x: number, y: number, c: string) => { if (inView(x, y)) g[y][x] = c; };
  const put = (x: number, y: number, c: string) => { if (g[y]?.[x] !== undefined) g[y][x] = c; };
  const art = (rows: string[], x: number, y: number, only = true) =>
    rows.forEach((r, dy) => [...r].forEach((c, dx) => { if (c !== ".") (only ? set : put)(x + dx, y + dy, c); }));

  /*
   * 하늘 — 위로 갈수록 짙은 보라, 왼쪽에 크림빛 보름달과 달무리.
   * 처음엔 달을 주황으로 오른쪽 위에 뒀더니 **금틀과 색이 같아 틀에 녹아 붙었다.** 달은 틀보다 밝은 크림으로, 틀에서 떨어뜨렸다
   */
  const MX = 12, MY = 10;
  for (let y = 0; y < Hh; y++)
    for (let x = 0; x < W; x++) {
      if (!inView(x, y)) continue;
      const d = Math.hypot(x - MX, y - MY);
      g[y][x] = d <= 4.8 ? (x - MX + (y - MY) > 3 ? "s" : "S") : d <= 6.2 ? "E" : y < 8 ? "a" : y < 13 ? "A" : y < 19 ? "B" : "D";
    }
  [[10, 8], [11, 8], [14, 11], [9, 12]].forEach(([x, y]) => set(x, y, "s"));
  HW_STARS.forEach(([x, y], i) => (i + f) % 4 !== 0 && set(x, y, "C"));

  // 언덕 — 저택 쪽이 솟는다. 저택보다 **어둡게** 둬야 저택이 땅에 안 묻힌다
  const ridge = (x: number) => 23 - Math.round(3.5 * Math.exp(-(((x - 21) / 5) ** 2)));
  for (let x = 0; x < W; x++) for (let y = ridge(x); y <= 28; y++) set(x, y, y === ridge(x) ? "g" : "G");

  // 유령 저택 — 오른쪽 언덕 위. 몸통 · 뾰족 지붕 · 양옆 탑, 창 불빛은 장마다 하나씩 꺼진다
  const h = "h";
  for (let y = 16; y <= 21; y++) for (let x = 19; x <= 24; x++) set(x, y, h);
  for (let r = 0; r < 3; r++) for (let x = 19 + r; x <= 24 - r; x++) set(x, 15 - r, h);
  for (let y = 12; y <= 21; y++) for (let x = 16; x <= 18; x++) set(x, y, h);
  for (let r = 0; r < 4; r++) set(17, 11 - r, h);
  set(16, 11, h); set(18, 11, h);
  for (let y = 14; y <= 21; y++) for (let x = 25; x <= 26; x++) set(x, y, h);
  set(25, 13, h); set(26, 13, h); set(26, 12, h);
  const wins: [number, number][] = [[17, 14], [17, 18], [20, 17], [23, 17], [21, 14], [25, 16], [25, 19]];
  wins.forEach(([x, y], i) => set(x, y, (i + f) % 5 === 0 ? "l" : "L"));
  set(21, 20, "k"); set(22, 20, "k"); set(21, 21, "k"); set(22, 21, "k");

  // 앙상한 나무 — 달 앞에 가지를 뻗는다 (달에 비친 검은 나무가 할로윈 그림의 단골)
  const TREE: [number, number][] = [
    [10, 24], [11, 24], [12, 24], [11, 23], [11, 22], [11, 21], [11, 20], [11, 19], [11, 18], [11, 17], [11, 16], [11, 15],
    [10, 15], [9, 14], [9, 13], [8, 12], [8, 11], [7, 10],
    [12, 15], [13, 14], [14, 13], [14, 12], [15, 11],
    [11, 14], [11, 13], [10, 12], [10, 11], [11, 10], [11, 9], [11, 8],
    [9, 10], [15, 9], [12, 7], [10, 17], [9, 17], [8, 16],
  ];
  TREE.forEach(([x, y]) => set(x, y, "V"));

  // 묘지 · 호박 등
  // 왼쪽 끝은 커튼 · 촛불에 가려서 나무 양옆으로 모았다
  art(HW_TOMB, 12, 23);
  art(HW_TOMB2, 14, 26);
  art(HW_CROSS, 8, 24);
  const glow = f % 3 === 2 ? "N" : "n";
  art([".v..", "FFFF", `F${glow}${glow}F`, "FFFF"], 18, 24);
  art(["..v.", "FFFF", `F${glow}${glow}F`], 23, 25);

  HW_BATS[f].forEach(([x, y], i) => art(HW_BAT[(f + i) % 2], x, y));

  // 가는 쇠 창살 둘 — 나무 · 저택을 안 가리게 가장자리에
  for (let y = 0; y <= 28; y++) { set(7, y, "Y"); set(27, y, "Y"); }

  /*
   * 틀 — 창밖에서 한 칸씩 떨어진 거리로 겹을 두른다: 쇠 · 쇠 · 짙은 쇠 · 바깥 잉크.
   * 아치 반지름을 늘려 겹을 만들었더니 **뾰족한 꼭대기에서 틀이 세 배로 두꺼워졌다** — 거리로 재야 어디서나 같은 두께다
   */
  const dist: number[][] = Array.from({ length: Hh }, (_, y) => Array.from({ length: W }, (_, x) => (inView(x, y) ? 0 : 99)));
  for (let d = 1; d <= 4; d++)
    for (let y = 0; y < Hh; y++)
      for (let x = 0; x < W; x++)
        if (dist[y][x] === 99 && y <= 29 && [-1, 0, 1].some((dy) => [-1, 0, 1].some((dx) => dist[y + dy]?.[x + dx] === d - 1)))
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
  for (let x = 1; x <= 32; x++) { put(x, 29, "Y"); put(x, 30, "y"); put(x, 31, "K"); }
  put(0, 29, "K"); put(0, 30, "K"); put(33, 29, "K"); put(33, 30, "K");

  // 위 가림막 — 해진 톱니 끝, 톱니 끝마다 주황 술
  for (let x = 0; x < W; x++) {
    const t = x % 6;
    const depth = 2 + (t < 3 ? t : 6 - t);
    for (let y = 0; y < depth; y++) put(x, y, y === 0 ? "d" : (x + y) % 4 === 0 ? "r" : "R");
    put(x, depth, t === 3 ? "O" : "d");
  }
  // 양옆 커튼 — 위가 넓고 주황 끈으로 묶은 곳에서 좁아졌다가 아래로 퍼진다. 밑단은 해져 들쭉날쭉
  for (let y = 5; y < Hh; y++) {
    const w = y < 17 ? Math.ceil(5 - (y - 5) * 0.22) : y < 20 ? 2 : Math.min(4, 2 + Math.round((y - 19) * 0.3));
    for (let i = 0; i < w; i++) {
      if (y >= 32 && (i + y) % 2) continue;
      const c = i === w - 1 ? "d" : i % 2 ? "r" : "R";
      put(i, y, c);
      put(W - 1 - i, y, c);
    }
  }
  art(["OOOO", ".OO.", ".oo.", "O..O"], 0, 17, false);
  art(["OOOO", ".OO.", ".oo.", "O..O"], W - 4, 17, false);

  // 꼭대기 호박 장식 — 눈 · 입이 일렁인다
  art(["...vv...", ".KKKKKK.", "KFFFFFFK", `KF${glow}FF${glow}FK`, `KFF${glow}${glow}FFK`, ".KKKKKK."], 13, 0, false);

  // 창턱 촛불 — 불꽃이 장마다 흔들린다
  [5, 27].forEach((x, i) => {
    put(x, 27, "c"); put(x + 1, 27, "c"); put(x, 28, "c"); put(x + 1, 28, "c");
    put(x + ((f + i) % 2), 26, "N");
    put(x + ((f + i) % 2), 25, "F");
  });
  return g.map((r) => r.join(""));
}
const FRAMES = [0, 1, 2, 3].map(frame);

const hwWindow: ItemDef = {
  id: "hw_window",
  name: "할로윈 창문",
  slot: "wall",
  price: 1250,
  at: [31, 4],
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

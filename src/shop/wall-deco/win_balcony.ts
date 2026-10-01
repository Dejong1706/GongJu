import type { ItemDef } from "../types";
import { INK } from "../common/palette";

/*
  발코니 창문 34 x 34 — 궁전 창문과 같은 크기. (38 x 38 이 "너무 크다" 해서 한 치수 줄여 다시 그렸다)
  흰 프렌치 창에 금 테두리, 아치 윗창엔 햇살 창살, 아래엔 금 발코니 난간.
  창밖은 보랏빛 노을 속 도시 — 시계탑 · 청록 양파 돔 궁전 · 뾰족탑 · 분홍 집들, 강물.
  열기구가 둥실 오르내리고 집 창문 불빛이 깜빡인다 (네 장)
*/
function frame(f: number) {
  const W = 34, H = 34, cx = 16.5, sp = 16;
  const g: string[][] = Array.from({ length: H }, () => Array(W).fill("."));
  const arch = (x: number, y: number, r: number, x0: number, x1: number, y1: number) =>
    y > y1 ? false : y >= sp ? x >= x0 && x <= x1 : (x - cx) ** 2 + (y - sp) ** 2 <= r * r;

  // 창밖 — 하늘 세 겹, 강물
  const view = (x: number, y: number) => (y >= 27 ? "w" : y < 10 ? "A" : y < 19 ? "B" : "D");
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) if (arch(x, y, 13.6, 3, 30, 29)) g[y][x] = view(x, y);
  const inView = (x: number, y: number) => arch(x, y, 13.6, 3, 30, 29);
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
  box(3, 7, 21, 26, "c"); roof(3, 7, 20, "r"); lit(5, 22, 1); lit(5, 24, 2);                 // 왼쪽 집
  box(8, 11, 12, 26, "C"); roof(8, 11, 11, "r"); set(9, 14, "W"); set(10, 14, "W");           // 시계탑
  set(9, 15, "W"); set(10, 15, "W"); set(10, 14, "K"); set(10, 15, "K");
  lit(9, 18, 0); lit(10, 21, 3);
  box(12, 16, 22, 26, "q"); roof(12, 16, 21, "r"); lit(13, 24, 2); lit(15, 24, 1);           // 분홍 집
  box(18, 29, 21, 26, "c");                                                                  // 궁전 몸통
  // 청록 양파 돔 — 아래가 불룩하고 위로 뾰족. 금 꼭지
  ["...tt...", "..tttt..", ".tttttt.", "tttttttt", "tttttttt", ".tttttt."].forEach((r, dy) =>
    [...r].forEach((c, dx) => { if (c !== ".") set(20 + dx, 16 + dy, c); })
  );
  set(23, 15, "Y"); set(24, 15, "Y"); set(23, 14, "Y");
  [19, 22, 25, 28].forEach((x, i) => lit(x, 22, i));                                        // 난간에 안 가리게 22줄
  box(28, 30, 15, 26, "C"); roof(28, 30, 14, "r"); set(29, 12, "Y");                         // 뾰족탑
  lit(29, 19, 1);

  // 열기구 — 왼쪽 윗창 가운데 창살 옆에서 한 칸씩 오르내린다
  const by = 3 + [0, 0, 1, 1][f];
  [".RRR.", "RRWRR", "RRWRR", ".RWR.", ".h.h.", ".YYY."].forEach((r, dy) =>
    [...r].forEach((c, dx) => { if (c !== ".") set(11 + dx, by + dy, c); })
  );

  // 틀 — 흰 창틀에 금 한 줄, 바깥은 테두리색
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (inView(x, y)) continue;
      if (arch(x, y, 16.4, 0, 33, 31)) g[y][x] = arch(x, y, 15.4, 1, 32, 31) ? (arch(x, y, 14.5, 2, 31, 30) ? "Y" : "H") : "h";
    }
  // 가운데 창살 · 윗창 가로대 · 햇살 창살
  for (let y = 2; y <= 29; y++) { if (inView(16, y)) g[y][16] = "H"; if (inView(17, y)) g[y][17] = "H"; }
  for (let x = 3; x <= 30; x++) set(x, sp, "H");
  for (let y = 2; y < sp; y++)
    for (let x = 3; x <= 30; x++) {
      const d = Math.hypot(x - cx, y - sp);
      if (d > 3 && Math.abs(Math.sin(Math.atan2(y - sp, x - cx) * 3)) < 0.1) set(x, y, "H");
    }
  // 발코니 난간 — 금 윗난간 · 아랫난간 · 기둥
  for (let x = 3; x <= 30; x++) { set(x, 23, "Y"); set(x, 29, "y"); if (x % 3 === 0) for (let y = 24; y <= 28; y++) set(x, y, "Y"); }
  // 창턱
  for (let x = 0; x <= 33; x++) { g[32][x] = "H"; g[33][x] = "h"; }
  return g.map((r) => r.join(""));
}
const FRAMES = [0, 1, 2, 3].map(frame);

const winBalcony: ItemDef = {
  id: "win_balcony",
  name: "발코니 창문",
  slot: "wall",
  price: 1000,
  at: [31, 4],
  only: "win",
  sprite: {
    rows: FRAMES[0],
    palette: {
      h: "#D5C7D0", H: "#FDFAFC", Y: "#E3B85C", y: "#B8862B", K: INK, W: "#FFFFFF",
      A: "#BBA7E6", B: "#F2B6D3", D: "#FFD6B3", w: "#A9CBEB",
      c: "#9C86C4", C: "#7E68A8", q: "#E58FB5", t: "#6FBFB5", r: "#D0587E",
      L: "#FFE58A", l: "#8E7AB8", R: "#FF7BAC",
    },
  },
  anim: FRAMES,
};
export default winBalcony;

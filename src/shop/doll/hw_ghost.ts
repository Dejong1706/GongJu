import type { ItemDef } from "../types";
import { outline } from "../common/draw";
import { INK } from "../common/palette";
import { HW } from "../common/halloween";

/*
  유령 인형 16 x 16 (둘레 포함 · 할로윈 세트 · 프리미엄) — 흰 천을 뒤집어쓴 동그란 유령. 오른손에 호박 사탕 바구니를 들었다.
  둥실 떠서 한 칸 오르내리고, 뜰 때는 바닥 그림자가 작아진다. 바구니 불빛이 일렁인다 (네 장).
  명암 — 왼쪽 위에 빛, 오른쪽 아래로 연보라 그늘. 천 밑단은 물결 셋.

  사용자가 "프리미엄 등급으로 퀄리티 좋게" 라고 했다. 20 x 21 로 키웠다가 "생각보다 많이 크다" 고 해서
  판다(16) · 유니콘(13) 사이로 다시 찍었다 — 도트는 비율로 줄이면 깨져서 줄인 크기에 맞춰 새로 그린다.
  같이 그린 검은 고양이 인형은 빠졌다
*/
type Grid = string[][];
const dot = (g: Grid, x: number, y: number, c: string) => { if (g[y]?.[x] !== undefined) g[y][x] = c; };
const stamp = (g: Grid, rows: string[], x: number, y: number) =>
  rows.forEach((r, dy) => [...r].forEach((c, dx) => { if (c !== ".") dot(g, x + dx, y + dy, c); }));
/** 타원을 채운다. 칸마다 색을 고르는 함수를 주면 명암이 된다 */
function oval(g: Grid, cx: number, cy: number, rx: number, ry: number, c: (x: number, y: number) => string) {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++)
      if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1.02) dot(g, x, y, c(x, y));
}

function frame(f: number) {
  const g: Grid = Array.from({ length: 14 }, () => Array(15).fill("."));
  const up = f === 1 || f === 2 ? 1 : 0; // 둘째 · 셋째 장에서 한 칸 떠오른다
  const oy = up ? 0 : 1;
  const tone = (x: number, y: number) => {
    const d = (x - 5.5) + (y - oy - 5) * 0.8;
    return d > 4 ? "w" : d < -4 ? "H" : "W";
  };
  oval(g, 5.5, oy + 4.5, 5, 4.5, tone);
  for (let y = oy + 5; y <= oy + 9; y++) for (let x = 1; x <= 10; x++) dot(g, x, y, tone(x, y));
  // 물결 밑단 — 볼록 셋
  for (let x = 1; x <= 10; x++) {
    const k = (x - 1) % 3;
    dot(g, x, oy + 10, k === 2 ? "." : tone(x, oy + 10));
    if (k === 1) dot(g, x, oy + 11, "w");
  }
  // 얼굴 — 까만 콩눈 · 분홍 볼 · 작은 입. 두 칸 폭 눈에 반짝이를 찍으면 비스듬히 깎여 보여서 통째로 칠한다
  stamp(g, ["K", "K"], 3, oy + 4); stamp(g, ["K", "K"], 8, oy + 4);
  dot(g, 2, oy + 6, "P"); dot(g, 9, oy + 6, "P");
  stamp(g, ["pp"], 5, oy + 6);
  // 팔 — 왼쪽은 작게 흔들고, 오른쪽은 바구니를 든다
  dot(g, 0, oy + 6 + (f % 2), "W");
  // 호박 사탕 바구니 — 손잡이 · 꼭지 · 불빛 눈. 몸에 붙여 그렸더니 호박이 몸에 먹혀서 한 칸 떼었다
  const glow = f === 3 ? "y" : "Y";
  stamp(g, [".kk.", "k..k"], 11, oy + 4);
  stamp(g, [".g..", "OOOO", `O${glow}${glow}O`, ".OO."], 11, oy + 6);
  // 그림자 — 뜰 때는 작게
  const sw = up ? 3 : 4;
  for (let x = Math.round(5.5 - sw); x <= Math.round(5.5 + sw); x++) dot(g, x, 13, "z");
  // 그림자 줄에는 테두리를 두르지 않는다
  return outline(g.map((r) => r.join("")), "K").map((r, y) => (y >= 14 ? r.replace(/K/g, ".") : r));
}
const FRAMES = [0, 1, 2, 3].map(frame);

const hwGhost: ItemDef = {
  id: "hw_ghost",
  name: "유령 인형",
  slot: "floor",
  price: 1000,
  at: [14, 70],
  sprite: {
    rows: FRAMES[0],
    palette: {
      K: INK, W: "#FBF8FF", H: "#FFFFFF", w: "#D6CCE8", P: "#FFB7D0", p: "#F27A9E",
      O: HW.pump, g: HW.stem, Y: HW.glow, y: HW.glow2, k: "#4A3A5E", z: "#241A30",
    },
  },
  anim: FRAMES,
};
export default hwGhost;

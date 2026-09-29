import type { ItemDef } from "../types";

/** 한 칸 굵기 직선(브레젠험) — 각도로 점을 찍으면 계단마다 두 칸씩 겹쳐 선이 굵어진다 */
function lineOn(g: string[][], x0: number, y0: number, x1: number, y1: number, c: string) {
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let e = dx + dy;
  for (;;) {
    if (g[y0]?.[x0] !== undefined) g[y0][x0] = c;
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * e;
    if (e2 >= dy) { e += dy; x0 += sx; }
    if (e2 <= dx) { e += dx; y0 += sy; }
  }
}

/*
  거미줄 21 x 11 (할로윈 세트) — 바닥에 까는 작은 육각 거미줄 (flat · 판다가 밟고 지나간다).
  처음엔 뒷벽 왼쪽 위 구석에 치는 20 x 24 벽 장식이었는데, 사용자가 **바닥에 조그만 육각형**으로 바꿔 달라고 했다.
  바닥에 누운 모양이라 세로를 반쯤 눌렀다. 가로줄을 셋 두면 눌린 윗변끼리 한 칸씩 붙어 하얗게 뭉친다 — **둘만** 둔다.
  가운데서 뻗는 살 여섯 + 육각 가로줄 둘, 거미가 가운데를 오간다 (네 장)
*/
function webRows(f: number) {
  const W = 21, Hh = 11, cx = 10, cy = 5;
  const g = Array.from({ length: Hh }, () => Array(W).fill("."));
  const vx = (r: number, i: number) => cx + Math.round(r * Math.cos((Math.PI / 3) * i));
  const vy = (r: number, i: number) => cy + Math.round(r * 0.58 * Math.sin((Math.PI / 3) * i));
  for (let i = 0; i < 6; i++) lineOn(g, cx, cy, vx(10, i), vy(10, i), "w");
  [5.5, 10].forEach((r) => {
    for (let i = 0; i < 6; i++) lineOn(g, vx(r, i), vy(r, i), vx(r, i + 1), vy(r, i + 1), "w");
  });
  // 거미 — 가운데에서 한 칸씩 좌우로 오간다
  const sx = cx + [0, 1, 0, -1][f];
  const spider: [number, number, string][] = [
    [-1, -1, "k"], [1, -1, "k"], [-1, 0, "S"], [0, 0, "R"], [1, 0, "S"], [-2, 0, "k"], [2, 0, "k"], [-1, 1, "k"], [1, 1, "k"],
  ];
  spider.forEach(([dx, dy, c]) => { if (g[cy + dy]?.[sx + dx] !== undefined) g[cy + dy][sx + dx] = c; });
  return g.map((r) => r.join(""));
}
const FRAMES = [0, 1, 2, 3].map(webRows);

const hwWeb: ItemDef = {
  id: "hw_web",
  name: "거미줄",
  slot: "flat",
  price: 300,
  at: [46, 76],
  sprite: { rows: FRAMES[0], palette: { w: "#D8CBE8", S: "#241A2E", k: "#241A2E", R: "#E2483A" } },
  anim: FRAMES,
};
export default hwWeb;

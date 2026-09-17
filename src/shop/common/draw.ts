/** 그림 줄을 좌우로 뒤집는다 */
export const flipRows = (rows: string[]) => rows.map((r) => [...r].reverse().join(""));

/** 흰 인형처럼 밝은 그림이 벽 · 바닥에 묻히지 않게 둘레를 한 겹 두른다 (가구와 같은 수법) */
export function outline(rows: string[], ch = "o") {
  const w = rows[0].length + 2;
  const g = [".".repeat(w), ...rows.map((r) => `.${r}.`), ".".repeat(w)].map((r) => [...r]);
  const filled = (x: number, y: number) => g[y]?.[x] !== undefined && g[y][x] !== "." && g[y][x] !== ch;
  for (let y = 0; y < g.length; y++)
    for (let x = 0; x < w; x++)
      if (g[y][x] === "." && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => filled(x + dx, y + dy)))
        g[y][x] = ch;
  return g.map((r) => r.join(""));
}

/*
  빈 판에 점을 찍어 그리는 것들(달밤 창호문 · 일월오봉도 병풍 · 자개장) 이 같이 쓴다.
  put 은 판 밖을 조용히 건너뛴다 — 원 · 삼각형을 그리다 가장자리를 넘어도 안 깨진다
*/
export type Grid = string[][];
export const blank = (w: number, h: number, fill = "."): Grid =>
  Array.from({ length: h }, () => Array(w).fill(fill));
export const put = (g: Grid, x: number, y: number, c: string) => {
  if (g[y]?.[x] !== undefined) g[y][x] = c;
};
export const gridRows = (g: Grid) => g.map((r) => r.join(""));

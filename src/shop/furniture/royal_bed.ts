import type { ItemDef } from "../types";

/*
  왕실 침대 35 x 34 — 궁전 벽지 · 왕실 카펫과 한 벌 (크림 · 진홍 · 금).
  캐노피 침대처럼 네 기둥 위에 지붕을 얹었다. 지붕 가운데 보석 왕관, 진홍 휘장에 금 술.
  양옆에는 **비치는 망사 커튼** — 한 칸 건너 한 칸만 칠해서 뒤 벽지가 비쳐 보이게 했고, 금술로 묶었다.
  이불은 **흰색**에 금 테두리 (처음엔 진홍 이불이었는데 궁전 벽지 진홍에 묻혀서 바꿨다),
  가운데 진홍 마름모 하나 · 아래 진홍 단. 금 기둥 · 금 다리.
*/
function draw() {
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

const royalBed: ItemDef = {
  id: "royal_bed",
  name: "왕실 침대",
  slot: "floor",
  price: 1000,
  at: [6, 38],
  sprite: {
    rows: draw(),
    palette: {
      Y: "#E3B85C", y: "#B8862B", R: "#C8384F", r: "#9E2A3E", j: "#FF6FA8",
      W: "#FFFFFF", w: "#E6D9E2", N: "#D2A9C6", n: "#EBD3E6",
    },
  },
};
export default royalBed;

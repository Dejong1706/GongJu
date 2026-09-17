import type { ItemDef } from "../types";

/*
  궁전 창문 38 x 38 — 발코니 창문과 같은 크기. (30 x 30 에서 키우며 다시 그렸다)
  두 겹 금 아치 틀 위에 작은 왕관 장식, 주름 세 자락 가림막에 금 술 장식,
  양옆 벨벳 커튼은 금술로 묶었다. 창밖은 노을 해를 등진 분홍 지붕 동화 성과 장미 정원.
  성 꼭대기 깃발이 펄럭이고 새 두 마리가 난다 (네 장)
*/
function frame(f: number) {
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
const FRAMES = [0, 1, 2, 3].map(frame);

/* 왕궁 세트 — 궁전 벽지 · 왕실 카펫 · 캐노피 침대와 맞춘 것 (9/17 시안실) */
const winPalace: ItemDef = {
  id: "win_palace",
  name: "궁전 창문",
  slot: "wall",
  price: 1000,
  at: [21, 3],
  only: "win",
  sprite: {
    rows: FRAMES[0],
    palette: {
      Y: "#E3B85C", y: "#B8862B", j: "#FF6FA8",
      R: "#D9537F", r: "#EE7FA7", d: "#A93B63",
      A: "#FFB3CF", B: "#FFCBCB", D: "#FFE1C4", S: "#FFF1A8", E: "#FFE6B8", C: "#FFFFFF", K: "#8A5A78",
      G: "#8FC48A", g: "#6FAE6A", o: "#FF7BAC", p: "#F3D9B8",
      w: "#FBF4FA", v: "#DCCBE6", T: "#FF8FBC", u: "#E2648F", k: "#9B7BC0", F: "#FF4F8B",
    },
  },
  anim: FRAMES,
};
export default winPalace;

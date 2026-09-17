import type { ItemDef } from "../types";
import { BED, BED_BACK, BED_FRONT } from "../common/bed";
import { FURN } from "../common/palette";

/*
  캐노피 침대 30 x 26 — 침대 그림(common/bed.ts) 위에 지붕 다섯 줄, 리본으로 묶은 커튼 아홉 줄.
  **침대를 고치면 이것도 바뀐다**
*/
const ROWS = (() => {
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

/*
  앞 · 뒤 20 x 31 — 폭이 좁아진 지붕 · 커튼 다섯 줄 아래에 침대 앞 · 뒤 그림을 그대로 붙인다.
  침대 그림의 둥근 모서리(..) 는 기둥이 지나가는 자리라 기둥으로 메운다
*/
const narrow = (bed: string[], corners: number[]) => {
  const top = [
    "hhhhhhhhhYYhhhhhhhhh",
    "hHHHHHHHHYYHHHHHHHHh",
    "hcccccccccccccccccch",
    "h" + "Cc".repeat(9) + "h",
    "hHh" + ".c".repeat(7) + "hHh",
  ];
  const curtain = [3, 2, 1, 2, 2].map((w, k) => {
    const row = [..."hHh..............hHh"];
    for (let i = 0; i < w; i++) row[3 + i] = row[16 - i] = k === 2 ? "d" : "c";
    return row.join("");
  });
  const body = bed.map((r, i) => (corners.includes(i) ? "hH" + r.slice(2, 18) + "Hh" : r));
  return [...top, ...curtain, ...body];
};

const canopy: ItemDef = {
  id: "canopy",
  name: "캐노피 침대",
  slot: "floor",
  price: 750,
  at: [8, 46],
  sprite: { rows: ROWS, palette: FURN },
  face: "right",
  views: {
    front: { rows: narrow(BED_FRONT, [0, 1]), palette: FURN },
    back: { rows: narrow(BED_BACK, [11, 12]), palette: FURN },
  },
};
export default canopy;

import type { ItemDef } from "../types";
import { BED } from "../common/bed";
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

const canopy: ItemDef = {
  id: "canopy",
  name: "캐노피 침대",
  slot: "floor",
  price: 750,
  at: [8, 46],
  sprite: { rows: ROWS, palette: FURN },
};
export default canopy;

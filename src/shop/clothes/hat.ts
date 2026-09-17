import type { ItemDef } from "../types";
import { s } from "../common/palette";

const hat: ItemDef = {
  id: "hat",
  name: "유치원 모자",
  slot: "head",
  price: 180,
  at: [1, 1],
  // 챙을 머리보다 한 칸씩만 넓게. 더 넓으면 갓처럼 보인다
  sprite: s(["..NNNNNNNNNN..", ".NNNNNNNNNNNN.", "nnnnnnnnnnnnnn"], "Nn"),
};
export default hat;

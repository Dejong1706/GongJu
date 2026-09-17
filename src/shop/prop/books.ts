import type { ItemDef } from "../types";
import { s } from "../common/palette";

const books: ItemDef = {
  id: "books",
  name: "책 더미",
  slot: "top",
  price: 50,
  at: [47, 53],
  sprite: s([".RRRRRR.", ".RRRRRR.", "UUUUUUUU", "UUUUUUUU", "GGGGGGGG"], "RUG"),
};
export default books;

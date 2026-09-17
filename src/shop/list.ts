import type { Cat, Item, ItemDef } from "./types";

/** 폴더 목록(index.ts) 이 칸을 붙인다. 아이템 파일에는 칸을 안 적는다 */
export const inCat = (cat: Cat, defs: ItemDef[]): Item[] => defs.map((d) => ({ ...d, cat }));

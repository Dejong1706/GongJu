/**
 * 시안 — 아직 상점에 안 넣은 것들.
 *
 * 시안실 페이지에서만 보인다. 채택되면 여기서 지우고 `src/lib/pet.ts` 로 옮긴다.
 * 떨어진 것도 지운다 (이유는 history.md 에 남긴다).
 */
import type { Item, Surface } from "@/lib/pet";

export const DRAFT_ITEMS: Item[] = [];
export const DRAFT_WALLS: Surface[] = [];
export const DRAFT_FLOORS: Surface[] = [];

/** 시안이 붙는 날짜 · 한 줄 설명. 페이지에서 눌렀을 때 보여준다 */
export const DRAFT_NOTES: Record<string, string> = {};

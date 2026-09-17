/**
 * 상점 — 판다 방에 사는 모든 것.
 *
 *   types.ts          Item · Surface 모양
 *   rules.ts          등급 · 움직이는 그림 · 상점 칸 · 늘어놓는 순서
 *   common/           **두 아이템 이상이 같이 쓰는 것만** (색표 · 창문 틀 · 침대 그림 · 리본 …)
 *   clothes/ furniture/ doll/ prop/ wall-deco/
 *                     아이템 하나 = 파일 하나. 파일 이름은 아이템 id 와 같다
 *                     폴더의 index.ts 가 목록이고, **칸(cat) 도 여기서 붙인다**
 *   wallpaper.ts · floor.ts
 *                     벽지 · 바닥은 그림이 아니라 무늬 종류 + 색이라 목록 한 장
 *
 * 새 아이템: 칸 폴더에 `<id>.ts` 를 만들고 그 폴더 index.ts 에 한 줄. 목록에 안 넣으면 상점에 안 뜬다.
 * id 는 Firestore 에 저장되므로 **한 번 내보낸 id 는 바꾸지 않는다**
 */
import clothes from "./clothes";
import furniture from "./furniture";
import doll from "./doll";
import prop from "./prop";
import wallDeco from "./wall-deco";
import { WALLS } from "./wallpaper";
import { FLOORS } from "./floor";
import type { Item } from "./types";

export * from "./types";
export * from "./rules";
export { WALLS, FLOORS };

/* 시안실이 시안을 뒤에 덧붙이므로 배열 하나로 둔다 */
export const ITEMS: Item[] = [...clothes, ...furniture, ...doll, ...prop, ...wallDeco];

export const itemById = (id: string) => ITEMS.find((i) => i.id === id);
export const wallById = (id: string) => WALLS.find((w) => w.id === id) ?? WALLS[0];
export const floorById = (id: string) => FLOORS.find((f) => f.id === id) ?? FLOORS[0];

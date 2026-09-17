import type { Sprite } from "@/lib/sprites";
import type { Cat, Facing, Item } from "./types";
import { flipRows } from "./common/draw";

/**
 * 상점 등급 — **값으로 정한다** (9/17 사용자가 정한 구간).
 *
 * - 일반 ~499 · 골드 500~999 (금테 · 왕관 표) · 프리미엄 1,000~ (보라 바탕 · 보석 표)
 *
 * 전에는 아이템마다 premium · legend 표를 달았는데, 값을 바꾸면 표도 같이 고쳐야 해서
 * 어긋나기 쉬웠다. 이제 값만 바꾸면 칸 모양이 따라온다
 */
export type Grade = "normal" | "gold" | "premium";
export const GOLD_FROM = 500;
export const PREMIUM_FROM = 1000;
export const gradeOf = (price: number): Grade =>
  price >= PREMIUM_FROM ? "premium" : price >= GOLD_FROM ? "gold" : "normal";

/** 움직이는 소품이 한 장을 넘기는 간격 */
export const ANIM_MS = 400;

/** 그 순간 보여줄 그림. 장마다 같은 객체를 돌려줘야 방에서 다시 그리지 않는다 */
const frameCache = new Map<string, Sprite[]>();
export function spriteAt(it: Item, tick: number): Sprite {
  if (!it.anim) return it.sprite;
  let frames = frameCache.get(it.id);
  if (!frames) {
    frames = it.anim.map((rows) => ({ rows, palette: it.sprite.palette }));
    frameCache.set(it.id, frames);
  }
  return frames[tick % frames.length];
}

/*
 * ── 방향 ─────────────────────────
 *
 * 위에서 내려다봤을 때 **시계방향** 순서. 오른쪽 화살표(↻) 는 다음 칸, 왼쪽(↺) 은 앞 칸.
 * 저장된 방향이 없으면 그 아이템의 `face`(없으면 앞) — 방향이 생기기 전에 놓은 가구는 그대로 보인다
 */
export const FACINGS: Facing[] = ["front", "left", "back", "right"];
export const FACING_NAME: Record<Facing, string> = { front: "앞", left: "왼쪽", back: "뒤", right: "오른쪽" };

const flipSprite = (sp: Sprite): Sprite => ({ rows: flipRows(sp.rows), palette: sp.palette });

/** 방향마다 그림. 뒤집어 채운 것도 **늘 같은 객체**라 방에서 다시 그리지 않는다 */
const viewCache = new Map<string, Partial<Record<Facing, Sprite>>>();
export function viewsOf(it: Item): Partial<Record<Facing, Sprite>> {
  let v = viewCache.get(it.id);
  if (!v) {
    v = { ...it.views, [it.face ?? "front"]: it.sprite };
    if (it.views) {
      if (!v.left && v.right) v.left = flipSprite(v.right);
      if (!v.right && v.left) v.right = flipSprite(v.left);
    }
    viewCache.set(it.id, v);
  }
  return v;
}

/** 그 방향 그림. 그 방향이 없거나 방향이 안 정해졌으면 기본 그림 */
export const viewAt = (it: Item, f?: Facing): Sprite => (f && viewsOf(it)[f]) || it.sprite;

export const canTurn = (it: Item) => !!it.views;

/** dir 1 = 시계방향. 그림이 없는 방향은 건너뛴다 */
export function turn(it: Item, f: Facing | undefined, dir: 1 | -1): Facing {
  const views = viewsOf(it);
  const cur = f && views[f] ? f : it.face ?? "front";
  const i = FACINGS.indexOf(cur);
  for (let k = 1; k < 4; k++) {
    const next = FACINGS[(i + dir * k + 4) % 4];
    if (views[next]) return next;
  }
  return cur;
}

/**
 * 자리로 판단한다. id 목록으로 들고 있으면 이름을 바꿀 때 빠뜨린다 (한 번 그랬다).
 * back(요정 날개) 은 판다 **뒤에** 그리는 입는 것이라 body 와 따로 걸친다
 */
export const isWorn = (it: Item): it is Item & { slot: "head" | "body" | "back" } =>
  it.slot === "head" || it.slot === "body" || it.slot === "back";

/**
 * 상점에 늘어놓는 순서 — **비싼 것부터.** 값이 같으면 목록(index.ts)에 적은 순서를 지킨다 (sort 는 안정 정렬).
 * 기본 벽 · 바닥(0점) 은 저절로 맨 뒤로 간다. 원본 배열은 건드리지 않는다
 */
export const byPrice = <T extends { price: number }>(list: T[]) => [...list].sort((a, b) => b.price - a.price);

/**
 * 상점 칸. 두 줄로 나눈다 — 윗줄은 **꺼내놓는 물건**, 아랫줄은 **방 자체를 바꾸는 것**.
 * 예전엔 옷 · 벽지 · 타일 · 기타 넷이었는데 기타에 열여섯 개가 몰려서 찾기 어려웠다.
 * 벽지 · 바닥은 소품(ITEMS) 이 아니라 WALLS · FLOORS 에서 보여준다
 */
export const CAT_ROWS: Cat[][] = [
  ["옷", "가구", "인형", "소품"],
  ["벽 장식", "벽지", "바닥"],
];

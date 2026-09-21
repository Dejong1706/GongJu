import type { Sprite } from "@/lib/sprites";

/**
 * head·body 는 판다가 입는 것, 나머지는 방에 두는 것.
 *
 * - flat: 바닥에 까는 것(러그). 늘 맨 아래에 깔린다 — 판다가 그 위를 밟고 지나간다
 * - floor: 바닥에 놓는 것. 발끝 높이로 판다와 앞뒤를 가린다
 * - top: 가구 위에 얹는 것(책상 위 화분). 바닥 가구보다 나중에 그려야 안 숨는다
 * - wall: 벽에 거는 것. 늘 판다 뒤
 */
export type Slot = "head" | "body" | "back" | "wall" | "floor" | "top" | "flat";
export type Cat = "옷" | "가구" | "인형" | "소품" | "벽 장식" | "벽지" | "바닥";

export type Item = {
  id: string;
  name: string;
  cat: Cat;
  slot: Slot;
  price: number;
  /**
   * 입는 것이면 **판다 왼쪽 위에서 잰 자리**(음수가 될 수 있다),
   * 방에 두는 것이면 **처음 꺼냈을 때 놓이는 자리**. 그다음부터는 끌어다 옮긴 자리를 저장한다.
   */
  at: readonly [number, number];
  /** 같은 표를 단 것끼리는 하나만 놓인다 (창문 일곱 종) */
  only?: string;
  /**
   * 움직이는 것 — 그림 여러 장을 `ANIM_MS` 마다 한 장씩 넘긴다. 첫 장은 `sprite` 와 같다.
   * 상점 칸에는 첫 장만 보인다
   */
  anim?: string[][];
  sprite: Sprite;
  /**
   * `sprite` 가 바라보는 쪽. 없으면 앞. 침대처럼 **긴 쪽이 보이는 옆모습**이 기본인 것은 "right"
   */
  face?: Facing;
  /**
   * 다른 방향 그림 — 90도 돌린 그림이 아니라 **그쪽을 보고 놓인 모습**이다.
   * 오른쪽 · 왼쪽 중 하나만 있으면 반대쪽은 좌우 뒤집기로 채운다 (`viewsOf`).
   * 없는 방향은 돌릴 때 건너뛴다. 어느 쪽에서 봐도 같은 것(둥근 탁자) 은 안 단다
   */
  views?: Partial<Record<Facing, Sprite>>;
};

/** 가구 · 인형이 바라보는 쪽. 앞 = 보는 사람 쪽 */
export type Facing = "front" | "left" | "back" | "right";

/** 아이템 파일 하나에 적는 것. 칸(`cat`) 은 적지 않는다 — 들어 있는 폴더가 정한다 */
export type ItemDef = Omit<Item, "cat">;

/** 벽지 · 바닥은 스프라이트가 아니라 면을 칠하는 방식이라 따로 둔다 */
export type Surface = {
  id: string;
  name: string;
  price: number;
  base: string;
  accent?: string;
  /** 꽃 벽지의 꽃술처럼 색이 하나 더 필요할 때 */
  accent2?: string;
  kind?:
    | "dot" | "stripe" | "panel" | "flower" | "palace" | "goldstripe" | "meok"
    | "plank" | "check" | "grid" | "parquet" | "royal" | "flowertile" | "maru";
};

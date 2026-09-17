"use client";

import { ROOM } from "@/lib/pet";
import { FACING_NAME, canTurn, itemById } from "@/shop";
import type { Spot } from "@/lib/types";
import { fit, lookOf } from "./PetRoom";

/**
 * 화살표를 띄울 가구. 옮기기 중 마지막으로 누른 것이 돌릴 수 있으면 그것,
 * 아니면 방에 있는 첫 돌릴 수 있는 가구 — **눌러야 뜨면 어디를 눌러야 하는지 모른다** (시안실에서 한 번 헤맸다)
 */
export function turnTarget(spots: Spot[], picked: string | null) {
  const turnable = (id: string) => {
    const it = itemById(id);
    return !!it && canTurn(it);
  };
  const id = picked && turnable(picked) ? picked : spots.find((s) => turnable(s.id))?.id;
  return id ? spots.find((s) => s.id === id) : undefined;
}

/** 지금 방향 이름 — "침대 · 앞" */
export function turnLabel(spot: Spot) {
  const it = itemById(spot.id);
  return it ? `${it.name} · ${FACING_NAME[spot.face ?? it.face ?? "front"]}` : "";
}

/**
 * 가구 옆 ↺ ↻ (9/17 사용자가 안내 띠 대신 골랐다). 동그라미 버튼 없이 모양만 — 버튼이 부자연스럽다고 했다.
 *
 * 방 그림 위에 따로 얹는 층이라 끌기는 안 막는다 (층은 pointer-events: none, 화살표만 눌린다).
 * 벽 가까이에서는 방 밖으로 잘리지 않게 안쪽으로 밀어 넣는다 — 그러면 가구를 조금 가린다
 */
export default function TurnArrows({ spot, onTurn }: { spot: Spot; onTurn: (dir: 1 | -1) => void }) {
  const it = itemById(spot.id);
  if (!it) return null;
  const look = lookOf(it, spot);
  const at = fit(it, spot.x, spot.y, look);
  const w = look.rows[0].length;
  const h = look.rows.length;
  return (
    <div className="pet-turn-layer">
      <div
        className="pet-turn-side"
        style={{
          left: `max(0px, calc(${(at.x / ROOM.w) * 100}% - 34px))`,
          right: `max(0px, calc(${100 - ((at.x + w) / ROOM.w) * 100}% - 34px))`,
          top: `${((at.y + h / 2) / ROOM.h) * 100}%`,
        }}
      >
        <button type="button" className="pet-turn" aria-label={`${it.name} 왼쪽으로 돌리기`} onClick={() => onTurn(-1)}>
          ↺
        </button>
        <button type="button" className="pet-turn" aria-label={`${it.name} 오른쪽으로 돌리기`} onClick={() => onTurn(1)}>
          ↻
        </button>
      </div>
    </div>
  );
}

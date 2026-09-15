"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BABY, HEART, type Sprite } from "@/lib/sprites";
import {
  BASEBOARD,
  ITEMS,
  PANDA_AT,
  ROOM,
  floorById,
  itemById,
  wallById,
  type Surface,
} from "@/lib/pet";
import type { Pet } from "@/lib/types";

/** 도트 하나를 사각형 하나로. 팔레트에 없는 글자는 건너뛴다 (PixelSprite 와 같은 규칙) */
function dots(sprite: Sprite, ox: number, oy: number) {
  const out: React.ReactElement[] = [];
  sprite.rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      const fill = sprite.palette[ch];
      if (!fill) return;
      out.push(
        <rect key={`${ox}-${oy}-${x}-${y}`} x={ox + x} y={oy + y} width={1} height={1} fill={fill} />
      );
    });
  });
  return out;
}

function wallDots(w: Surface) {
  const out: React.ReactElement[] = [];
  if (w.kind === "dot") {
    for (let y = 3; y < ROOM.base; y += 6)
      for (let x = y % 12 === 3 ? 3 : 6; x < ROOM.w; x += 6)
        out.push(<rect key={`wd${x}-${y}`} x={x} y={y} width={1} height={1} fill={w.accent} />);
  } else if (w.kind === "stripe") {
    for (let x = 2; x < ROOM.w; x += 6)
      out.push(<rect key={`ws${x}`} x={x} y={0} width={1} height={ROOM.base} fill={w.accent} />);
  }
  return out;
}

function floorDots(f: Surface) {
  const out: React.ReactElement[] = [];
  const top = ROOM.floorTop;
  const h = ROOM.h - top;
  if (f.kind === "plank") {
    for (let y = top + 3; y < ROOM.h; y += 5)
      out.push(<rect key={`fp${y}`} x={0} y={y} width={ROOM.w} height={1} fill={f.accent} />);
  } else if (f.kind === "check") {
    for (let y = top; y < ROOM.h; y += 4)
      for (let x = ((y - top) / 4) % 2 === 0 ? 0 : 4; x < ROOM.w; x += 8)
        out.push(<rect key={`fc${x}-${y}`} x={x} y={y} width={4} height={4} fill={f.accent} />);
  } else if (f.kind === "grid") {
    for (let y = top + 5; y < ROOM.h; y += 6)
      out.push(<rect key={`fgy${y}`} x={0} y={y} width={ROOM.w} height={1} fill={f.accent} />);
    for (let x = 3; x < ROOM.w; x += 8)
      out.push(<rect key={`fgx${x}`} x={x} y={top} width={1} height={h} fill={f.accent} />);
  }
  return out;
}

export default function PetRoom({ pet }: { pet: Pet }) {
  const wall = wallById(pet.wall);
  const floor = floorById(pet.floor);

  const worn = [pet.worn.head, pet.worn.body].filter(Boolean) as string[];
  const placed = [pet.placed.wall, pet.placed.floorL, pet.placed.floorR].filter(
    Boolean
  ) as string[];

  // 하트는 눌렀을 때만. 연타해도 다시 튀어오르게 열쇠를 갈아 끼운다.
  const [beat, setBeat] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pat = useCallback(() => {
    setBeat((n) => n + 1);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setBeat(0), 900);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <div className="pet-room">
      <svg
        className="room"
        viewBox={`0 0 ${ROOM.w} ${ROOM.h}`}
        shapeRendering="crispEdges"
        role="img"
        aria-label="아기 판다의 방"
      >
        <rect x={0} y={0} width={ROOM.w} height={ROOM.base} fill={wall.base} />
        {wallDots(wall)}
        <rect x={0} y={ROOM.base} width={ROOM.w} height={1} fill={BASEBOARD} />
        <rect
          x={0}
          y={ROOM.floorTop}
          width={ROOM.w}
          height={ROOM.h - ROOM.floorTop}
          fill={floor.base}
        />
        {floorDots(floor)}

        {/* 방에 둔 것 먼저 */}
        {placed.map((id) => {
          const it = itemById(id);
          return it ? <g key={it.id}>{dots(it.sprite, it.at[0], it.at[1])}</g> : null;
        })}

        {/*
          판다 무리는 반드시 마지막. SVG 는 나중에 그린 것이 위로 올라오므로
          이 순서가 곧 z-index 다. 새 소품을 이 아래에 끼워 넣지 말 것.
        */}
        <g className="pet-walk">
          <g className="pet-bob">
            {dots(BABY, PANDA_AT.x, PANDA_AT.y)}
            {worn.map((id) => {
              const it = itemById(id);
              return it ? <g key={it.id}>{dots(it.sprite, it.at[0], it.at[1])}</g> : null;
            })}
            {/* 도트 사이 빈틈까지 눌리도록 투명한 판을 덮는다 */}
            <rect
              className="pet-hit"
              x={PANDA_AT.x}
              y={PANDA_AT.y}
              width={BABY.rows[0].length}
              height={BABY.rows.length}
              fill="#fff"
              fillOpacity={0}
              pointerEvents="all"
              onClick={pat}
            />
            {beat > 0 && (
              <g key={beat} className="pet-heart">
                {dots(HEART, PANDA_AT.x + 12, PANDA_AT.y - 10)}
              </g>
            )}
          </g>
        </g>
      </svg>
    </div>
  );
}

/** 아직 살 수 있는 게 없어도 방은 보여야 하므로 소품 목록은 여기서 내보낸다 */
export { ITEMS };

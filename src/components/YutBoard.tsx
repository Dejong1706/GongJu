"use client";

import { useMemo } from "react";
import {
  ART,
  BOARD,
  DIGIT,
  FIELD_NAME,
  FRUIT_PAL,
  GOAL,
  K,
  NODES,
  WAIT,
  type Horses,
  type YutSide,
} from "@/lib/yut";

/**
 * 윷판. 판다 방과 같은 방식으로 **도트를 rect 로 하나씩 찍는다.**
 * 바탕(한지 · 길 · 밭) 은 한 번 만들어두고, 말만 다시 그린다.
 *
 * 이벤트가 끝나면 이 파일째 지운다.
 */

type Cell = { x: number; y: number; w: number; h: number; f: string };

const cell = (x: number, y: number, w: number, h: number, f: string): Cell => ({ x, y, w, h, f });

/** 도트로 찍은 원 — 줄마다 rect 하나. 테두리가 계단으로 남아야 도트답다 */
function circle(cx: number, cy: number, r: number, f: string): Cell[] {
  const out: Cell[] = [];
  for (let dy = -r; dy <= r; dy++) {
    const dx = Math.floor(Math.sqrt(r * r - dy * dy) + 0.35);
    out.push(cell(cx - dx, cy + dy, dx * 2 + 1, 1, f));
  }
  return out;
}

/** 두 밭 사이를 도트로 잇는다. every 를 키우면 듬성듬성해져 지름길로 보인다 */
function line(a: number, b: number, f: string, every: number): Cell[] {
  const p = NODES[a];
  const q = NODES[b];
  const dx = q.x - p.x;
  const dy = q.y - p.y;
  const n = Math.max(Math.abs(dx), Math.abs(dy));
  const out: Cell[] = [];
  for (let i = 0; i <= n; i += every) {
    out.push(cell(Math.round(p.x + (dx * i) / n), Math.round(p.y + (dy * i) / n), 1, 1, f));
  }
  return out;
}

function art(rows: string[], x: number, y: number): Cell[] {
  const out: Cell[] = [];
  rows.forEach((row, r) =>
    row.split("").forEach((ch, c) => {
      if (ch !== ".") out.push(cell(x + c, y + r, 1, 1, FRUIT_PAL[ch]));
    })
  );
  return out;
}

/** 업은 개수 — 나무패에 새긴 것처럼 먹빛 배지에 금색 숫자 */
function count(n: number, x: number, y: number): Cell[] {
  const out = [cell(x, y, 7, 9, K.woodD), cell(x + 1, y + 1, 5, 7, K.ink)];
  const d = DIGIT[n] ?? DIGIT[3];
  d.forEach((row, r) =>
    row.split("").forEach((ch, c) => {
      if (ch === "#") out.push(cell(x + 2 + c, y + 2 + r, 1, 1, K.gold));
    })
  );
  return out;
}

const BACKDROP: Cell[] = (() => {
  const out: Cell[] = [
    cell(0, 0, BOARD, BOARD, K.woodD),
    cell(2, 2, BOARD - 4, BOARD - 4, K.wood),
    cell(3, 3, BOARD - 6, BOARD - 6, K.woodL),
    cell(5, 5, BOARD - 10, BOARD - 10, K.hanji),
  ];
  // 한지 결
  for (let y = 10; y < BOARD - 5; y += 7) out.push(cell(6, y, BOARD - 12, 1, "#f2e4cd"));
  for (let x = 13; x < BOARD - 5; x += 19) out.push(cell(x, 6, 1, BOARD - 12, "#f4e8d4"));

  // 길 — 바깥은 촘촘하게, 지름길은 두 칸마다
  ([[0, 5], [5, 10], [10, 15], [15, 0]] as [number, number][]).forEach(([a, b]) =>
    out.push(...line(a, b, "#ddc8a8", 1))
  );
  ([[5, 15], [10, 0]] as [number, number][]).forEach(([a, b]) =>
    out.push(...line(a, b, "#ddc8a8", 2))
  );

  // 밭
  for (let i = 0; i <= 29; i++) {
    const n = NODES[i];
    if (i === GOAL || !n) continue;
    if (n.mid) {
      // 방 — 가운데 밭. 단청 적청으로 꽃을 앉힌다
      out.push(...circle(n.x, n.y, 7, K.woodD));
      out.push(...circle(n.x, n.y, 6, "#f6e6c8"));
      out.push(...circle(n.x, n.y, 4, K.blue));
      out.push(...circle(n.x, n.y, 3, "#f6e6c8"));
      out.push(
        cell(n.x - 1, n.y - 1, 3, 3, K.red),
        cell(n.x - 4, n.y, 2, 1, K.red),
        cell(n.x + 3, n.y, 2, 1, K.red),
        cell(n.x, n.y - 4, 1, 2, K.red),
        cell(n.x, n.y + 3, 1, 2, K.red)
      );
    } else if (n.big) {
      out.push(...circle(n.x, n.y, 6, K.woodD));
      out.push(...circle(n.x, n.y, 5, "#f6e6c8"));
      out.push(...circle(n.x, n.y, 2, K.ochre));
    } else {
      out.push(...circle(n.x, n.y, 4, K.woodL));
      out.push(...circle(n.x, n.y, 3, "#fffaf0"));
    }
  }

  /*
   * 예전에는 참먹이에 진행 방향을 가리키는 빨간 화살표가 있었다.
   * 이제 그 자리에 "참먹이" 라고 적고, 오른쪽 변에 도 · 개 · 걸 · 윷 · 모 가 올라가므로
   * **이름이 곧 방향**이다 (9/23). 말도 한 칸씩 걸어가서 길이 보인다
   */
  return out;
})();

export default function YutBoard({
  horses,
  pick = [],
  onPick,
  go = [],
  onGo,
}: {
  horses: Horses;
  /** 지금 고를 수 있는 밭 — 점선 테두리 */
  pick?: number[];
  onPick?: (pos: number) => void;
  /** 갈림길에서 고를 **갈 곳** — 금빛 과녁. 밭 고르기와 동시에 서지 않는다 */
  go?: number[];
  onGo?: (pos: number) => void;
}) {
  const pieces = useMemo(() => {
    const out: Cell[] = [];
    (["a", "b"] as YutSide[]).forEach((side) => {
      const on: Record<number, number> = {};
      horses[side].forEach((p) => {
        if (p !== WAIT && p !== GOAL) on[p] = (on[p] ?? 0) + 1;
      });
      Object.entries(on).forEach(([key, n]) => {
        const pos = Number(key);
        const node = NODES[pos];
        // 업은 말은 위로 조금씩 겹쳐 쌓는다
        for (let s = n - 1; s >= 0; s--) {
          out.push(...art(ART[side], node.x - 4 + s * 2, node.y - 5 - s * 3));
        }
        if (n > 1) out.push(...count(n, node.x + 3, node.y + 1));
      });
    });
    return out;
  }, [horses]);

  return (
    <svg
      className="yut-board"
      viewBox={`0 0 ${BOARD} ${BOARD}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label="윷판"
    >
      {BACKDROP.map((c, i) => (
        <rect key={`b${i}`} x={c.x} y={c.y} width={c.w} height={c.h} fill={c.f} />
      ))}

      {/*
       * 밭 이름 — **말보다 먼저 그려서 말이 덮게** 한다. 말이 선 밭은 이름을 볼 일이 없다.
       * 도트가 아니라 진짜 글자다 (세 글자를 5칸 도트로는 못 쓴다).
       * 옅은 고동이라 판 무늬처럼 깔리고 말·점선을 방해하지 않는다
       */}
      {Object.entries(FIELD_NAME).map(([key, name]) => {
        const n = NODES[Number(key)];
        return (
          <text
            key={`n${key}`}
            className="yut-name-field"
            x={n.x}
            y={n.y}
            textAnchor="middle"
            dominantBaseline="central"
          >
            {name}
          </text>
        );
      })}

      {pieces.map((c, i) => (
        <rect key={`p${i}`} x={c.x} y={c.y} width={c.w} height={c.h} fill={c.f} />
      ))}

      {/* 고를 수 있는 밭 — 점선 테두리와 누를 자리. 말보다 위에 얹어야 겹쳐 있어도 눌린다 */}
      {pick.map((pos) => {
        const n = NODES[pos];
        const dots = [];
        for (let d = -7; d <= 7; d += 2) {
          dots.push(
            <rect key={`t${d}`} x={n.x + d} y={n.y - 8} width={1} height={1} fill={K.ink} />,
            <rect key={`u${d}`} x={n.x + d} y={n.y + 7} width={1} height={1} fill={K.ink} />,
            <rect key={`l${d}`} x={n.x - 8} y={n.y + d} width={1} height={1} fill={K.ink} />,
            <rect key={`r${d}`} x={n.x + 7} y={n.y + d} width={1} height={1} fill={K.ink} />
          );
        }
        return (
          <g key={`pick${pos}`}>
            {dots}
            <rect
              x={n.x - 8}
              y={n.y - 9}
              width={17}
              height={18}
              fill="transparent"
              style={{ cursor: "pointer" }}
              onClick={() => onPick?.(pos)}
            />
          </g>
        );
      })}

      {/*
       * 갈림길에서 고를 갈 곳 — 금빛 과녁. 점선(고를 말) 과 헷갈리지 않게 **꽉 찬 테두리**다.
       * 참먹이를 지나 나는 수는 NODES[20] 이 참먹이 자리라 거기 선다
       */}
      {go.map((pos) => {
        const n = NODES[pos];
        if (!n) return null;
        return (
          <g key={`go${pos}`} className="yut-go">
            {[
              cell(n.x - 8, n.y - 9, 17, 1, K.gold),
              cell(n.x - 8, n.y + 8, 17, 1, K.gold),
              cell(n.x - 8, n.y - 9, 1, 18, K.gold),
              cell(n.x + 8, n.y - 9, 1, 18, K.gold),
              cell(n.x - 2, n.y - 1, 5, 1, K.red),
              cell(n.x, n.y - 3, 1, 5, K.red),
            ].map((c, i) => (
              <rect key={i} x={c.x} y={c.y} width={c.w} height={c.h} fill={c.f} />
            ))}
            <rect
              x={n.x - 8}
              y={n.y - 9}
              width={17}
              height={18}
              fill="transparent"
              style={{ cursor: "pointer" }}
              onClick={() => onGo?.(pos)}
            />
          </g>
        );
      })}
    </svg>
  );
}

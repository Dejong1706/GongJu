"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BABY, HEART, type Sprite } from "@/lib/sprites";
import {
  ANIM_MS,
  BASEBOARD,
  spriteAt,
  ITEMS,
  PANDA,
  ROOM,
  SNAP,
  floorById,
  floorLeftAt,
  floorRightAt,
  floorTopAt,
  itemById,
  wallById,
  type Item,
  type Surface,
} from "@/lib/pet";
import type { Pet } from "@/lib/types";

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** 도트 하나를 사각형 하나로. 팔레트에 없는 글자는 건너뛴다 (PixelSprite 와 같은 규칙) */
function dots(sprite: Sprite) {
  const out: React.ReactElement[] = [];
  sprite.rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      const fill = sprite.palette[ch];
      if (!fill) return;
      out.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />);
    });
  });
  return out;
}

/**
 * 소품 한 점.
 * 자리가 그대로면 다시 그리지 않는다 — 판다가 한 걸음 옮길 때마다
 * 방에 있는 도트를 전부 다시 그리면 폰에서 버벅인다.
 */
const Piece = memo(function Piece({
  sprite,
  x,
  y,
}: {
  sprite: Sprite;
  x: number;
  y: number;
}) {
  return <g transform={`translate(${x},${y})`}>{dots(sprite)}</g>;
});

/** 꺾인 자리 한 줄에만 쓴다 */
function shade(hex: string, k: number) {
  const n = parseInt(hex.slice(1), 16);
  return (
    "#" +
    [(n >> 16) & 255, (n >> 8) & 255, n & 255]
      .map((v) => Math.round(v * k).toString(16).padStart(2, "0"))
      .join("")
  );
}

/** 바닥 무늬를 끊는 가로줄. 앞으로 올수록 사이가 벌어져야 멀어 보인다 */
function depthRows() {
  const out: number[] = [];
  let gap = Math.max(3, Math.round(ROOM.h / 23));
  const grow = Math.max(1, Math.round(gap / 4));
  for (let y = ROOM.floorTop + gap; y < ROOM.h; y += gap) {
    out.push(y);
    gap += grow;
  }
  return out;
}

/**
 * 벽·바닥·걸레받이. 벽지와 타일이 그대로면 통째로 재활용한다.
 *
 * 세 벽은 **같은 색**이다. 꺾인 자리 한 줄만 살짝 어둡게 해서 접힌 것만 알린다 —
 * 옆벽을 통째로 어둡게 했더니 벽지 색이 두 개로 보였다.
 */
function backdrop(wall: Surface, floor: Surface) {
  const out: React.ReactElement[] = [];
  const pd = Math.max(4, Math.round(ROOM.w / 10)); // 무늬 간격
  const half = Math.round(pd / 2);

  for (let x = 0; x < ROOM.w; x++) {
    const h = floorTopAt(x) - 1; // 걸레받이 한 줄은 남긴다
    if (h <= 0) continue;
    out.push(<rect key={`w${x}`} x={x} y={0} width={1} height={h} fill={wall.base} />);
    if (wall.kind === "stripe" && x % pd === half)
      out.push(<rect key={`ws${x}`} x={x} y={0} width={1} height={h} fill={wall.accent} />);
    if (wall.kind === "dot")
      for (let y = half; y < h; y += pd) {
        const off = Math.floor(y / pd) % 2 ? half : 0;
        if ((((x - off) % pd) + pd) % pd === 0)
          out.push(
            <rect key={`wd${x}-${y}`} x={x} y={y} width={1} height={1} fill={wall.accent} />
          );
      }
    /*
     * 몰딩 벽 — 아랫단을 한 톤 눌러 깔고 경계에 줄 하나.
     * 줄을 **그 열의 바닥에서 같은 높이**에 두면 옆벽에서 저절로 기울어 방이 깊어 보인다.
     */
    if (wall.kind === "panel") {
      const my = h - 18;
      if (my > 2) {
        const deep = shade(wall.accent ?? wall.base, 0.93);
        out.push(
          <rect key={`wp${x}`} x={x} y={my + 1} width={1} height={h - my - 1} fill={wall.accent} />
        );
        out.push(<rect key={`wm${x}`} x={x} y={my} width={1} height={1} fill={deep} />);
        if (x % 7 === 3)
          out.push(
            <rect key={`wv${x}`} x={x} y={my + 2} width={1} height={h - my - 2} fill={deep} />
          );
      }
    }
    /* 작은 꽃 — 가운데 한 점에 꽃잎 넉 장. 줄마다 반 칸씩 엇갈리게 놓는다 */
    if (wall.kind === "flower") {
      const fp = pd * 2;
      const fh = Math.round(fp / 2);
      for (let fy = 5; fy < h - 1; fy += fp) {
        const fo = Math.floor(fy / fp) % 2 ? fh : 0;
        const dx = (((x - fo) % fp) + fp) % fp;
        if (dx === 0) {
          out.push(<rect key={`fa${x}-${fy}`} x={x} y={fy - 1} width={1} height={1} fill={wall.accent} />);
          out.push(
            <rect key={`fb${x}-${fy}`} x={x} y={fy} width={1} height={1} fill={wall.accent2 ?? wall.accent} />
          );
          out.push(<rect key={`fc${x}-${fy}`} x={x} y={fy + 1} width={1} height={1} fill={wall.accent} />);
        } else if (dx === 1 || dx === fp - 1) {
          out.push(<rect key={`fd${x}-${fy}`} x={x} y={fy} width={1} height={1} fill={wall.accent} />);
        }
      }
    }
  }
  /*
   * 궁전 벽지 (프리미엄) — 분홍 마름모를 줄마다 반 칸씩 엇갈려 찍고 가운데 금점.
   * 위에 금 · 분홍 테두리, 아래는 몰딩 벽처럼 한 톤 눌러 깔고 금테 칸을 나눈다.
   * 칸도 몰딩 줄도 **그 열의 바닥에서 잰 높이**라 옆벽에서 저절로 기운다
   */
  if (wall.kind === "palace") {
    const gold = wall.accent ?? wall.base;
    const motif = wall.accent2 ?? gold;
    const lower = shade(wall.base, 0.95);
    for (let x = 0; x < ROOM.w; x++) {
      const h = floorTopAt(x) - 1;
      if (h <= 0) continue;
      const my = h - 16;
      out.push(<rect key={`pt${x}`} x={x} y={2} width={1} height={1} fill={gold} />);
      out.push(<rect key={`pu${x}`} x={x} y={3} width={1} height={1} fill={motif} />);
      for (let fy = 9, row = 0; fy < my - 3; fy += 9, row++) {
        const off = row % 2 ? 5 : 0;
        const dx = (((x - off) % 10) + 10) % 10;
        const d = dx > 5 ? dx - 10 : dx;
        const reach = 2 - Math.abs(d);
        if (reach < 0) continue;
        for (let dy = -reach; dy <= reach; dy++)
          out.push(
            <rect key={`pd${x}-${fy}-${dy}`} x={x} y={fy + dy} width={1} height={1} fill={d === 0 && dy === 0 ? gold : motif} />
          );
      }
      if (my > 6) {
        out.push(<rect key={`pl${x}`} x={x} y={my + 1} width={1} height={h - my - 1} fill={lower} />);
        out.push(<rect key={`pm${x}`} x={x} y={my} width={1} height={1} fill={gold} />);
        const k = ((x % 10) + 10) % 10;
        if (k >= 2) {
          out.push(<rect key={`pb${x}`} x={x} y={my + 3} width={1} height={1} fill={gold} />);
          out.push(<rect key={`pc${x}`} x={x} y={h - 3} width={1} height={1} fill={gold} />);
        }
        if (k === 2 || k === 9)
          out.push(<rect key={`pv${x}`} x={x} y={my + 3} width={1} height={h - my - 5} fill={gold} />);
      }
    }
  }

  const seam = shade(wall.base, 0.9);
  [ROOM.side - 1, ROOM.w - ROOM.side].forEach((x) => {
    const h = floorTopAt(x) - 1;
    if (h > 0) out.push(<rect key={`sm${x}`} x={x} y={0} width={1} height={h} fill={seam} />);
  });

  for (let x = 0; x < ROOM.w; x++) {
    const top = floorTopAt(x);
    if (top < ROOM.h)
      out.push(
        <rect key={`f${x}`} x={x} y={top} width={1} height={ROOM.h - top} fill={floor.base} />
      );
  }

  /** 그 줄에서 바닥이 차지하는 가로 구간만 칠한다 (무늬는 전부 이걸로 눕는다) */
  const span = (key: string, y: number) => {
    const a = Math.ceil(floorLeftAt(y));
    const b = Math.floor(floorRightAt(y));
    if (b > a) out.push(<rect key={key} x={a} y={y} width={b - a} height={1} fill={floor.accent} />);
  };

  const rows = depthRows();
  /*
   * 왕실 카펫 (프리미엄) — 바닥 폭의 22 ~ 78% 에 빨간 카펫을 앞까지 깐다.
   * 폭을 줄마다 비율로 다시 재서 뒤로 갈수록 좁아진다. 금 테두리 안쪽에 진한 줄 하나,
   * 가운데에는 금색 마름모가 세로로 이어진다
   */
  if (floor.kind === "royal") {
    const red = floor.accent ?? floor.base;
    const gold = floor.accent2 ?? floor.base;
    const deep = shade(red, 0.82);
    rows.forEach((y) => span(`rr${y}`, y));
    const head = ROOM.floorTop + 3;
    for (let y = head; y < ROOM.h; y++) {
      const l = floorLeftAt(y);
      const r = floorRightAt(y);
      const a = Math.round(l + (r - l) * 0.22);
      const b = Math.round(l + (r - l) * 0.78);
      out.push(<rect key={`rc${y}`} x={a} y={y} width={b - a} height={1} fill={y === head ? gold : red} />);
      if (y === head) continue;
      out.push(<rect key={`rl${y}`} x={a} y={y} width={1} height={1} fill={gold} />);
      out.push(<rect key={`re${y}`} x={b - 1} y={y} width={1} height={1} fill={gold} />);
      if (y > head + 2) {
        out.push(<rect key={`ri${y}`} x={a + 2} y={y} width={1} height={1} fill={deep} />);
        out.push(<rect key={`rj${y}`} x={b - 3} y={y} width={1} height={1} fill={deep} />);
      }
      const c = Math.round((a + b) / 2);
      const t = (y - ROOM.floorTop) % 8;
      const reach = t <= 4 ? Math.min(t, 4 - t) : -1;
      if (reach >= 0) {
        out.push(<rect key={`rd${y}`} x={c - reach} y={y} width={1} height={1} fill={gold} />);
        if (reach > 0) out.push(<rect key={`rf${y}`} x={c + reach} y={y} width={1} height={1} fill={gold} />);
      }
    }
  }
  if (floor.kind === "plank" || floor.kind === "grid") rows.forEach((y) => span(`fr${y}`, y));
  if (floor.kind === "grid") {
    // 세로줄은 뒤로 갈수록 모인다 — 줄마다 x 를 다시 잰다
    for (let i = 1; i < 7; i++)
      for (let y = ROOM.floorTop; y < ROOM.h; y++) {
        const l = floorLeftAt(y);
        const r = floorRightAt(y);
        if (r - l < 2) continue;
        out.push(
          <rect
            key={`fg${i}-${y}`}
            x={Math.round(l + ((r - l) * i) / 7)}
            y={y}
            width={1}
            height={1}
            fill={floor.accent}
          />
        );
      }
  }
  if (floor.kind === "parquet") {
    /*
     * 쪽매 마루 — 칸마다 결을 가로 · 세로로 번갈아 깐다.
     * 나무 조각을 엇갈려 붙인 것처럼 보이게 하는 건 이것뿐이다.
     */
    const bands = [ROOM.floorTop, ...rows, ROOM.h];
    for (let b = 0; b + 1 < bands.length; b++) {
      span(`pq${b}`, bands[b]);
      const mid = Math.round((bands[b] + bands[b + 1]) / 2);
      for (let y = bands[b]; y < bands[b + 1]; y++) {
        const l = floorLeftAt(y);
        const w = floorRightAt(y) - l;
        if (w < 2) continue;
        for (let c = 0; c < 4; c++) {
          const x0 = Math.round(l + (w * c) / 4);
          const x1 = Math.round(l + (w * (c + 1)) / 4);
          if ((c + b) % 2 === 0) {
            if (y === mid)
              out.push(
                <rect key={`ph${b}-${c}`} x={x0} y={y} width={x1 - x0} height={1} fill={floor.accent} />
              );
          } else {
            out.push(
              <rect key={`pv${b}-${y}-${c}a`} x={Math.round(x0 + (x1 - x0) / 3)} y={y} width={1} height={1} fill={floor.accent} />
            );
            out.push(
              <rect key={`pv${b}-${y}-${c}b`} x={Math.round(x0 + ((x1 - x0) * 2) / 3)} y={y} width={1} height={1} fill={floor.accent} />
            );
          }
        }
      }
    }
  }
  if (floor.kind === "marble") {
    /* 대리석 — 칸을 크게 잡고 결을 몇 줄만 흘린다. 촘촘하면 싸 보인다 */
    rows.forEach((y, i) => {
      if (i % 2 === 0) span(`mr${y}`, y);
    });
    for (let i = 1; i < 3; i++)
      for (let y = ROOM.floorTop; y < ROOM.h; y++) {
        const l = floorLeftAt(y);
        const r = floorRightAt(y);
        if (r - l < 2) continue;
        out.push(
          <rect key={`mv${i}-${y}`} x={Math.round(l + ((r - l) * i) / 3)} y={y} width={1} height={1} fill={floor.accent} />
        );
      }
    const vein = shade(floor.accent ?? floor.base, 0.96);
    [
      [0.28, 0.12],
      [0.62, 0.45],
      [0.4, 0.74],
    ].forEach(([u, t], vi) => {
      const y0 = Math.round(ROOM.floorTop + (ROOM.h - ROOM.floorTop) * t);
      for (let k = 0; k < 10; k++) {
        const y = y0 + k;
        if (y >= ROOM.h) break;
        const l = floorLeftAt(y);
        const r = floorRightAt(y);
        out.push(
          <rect key={`mk${vi}-${k}`} x={Math.round(l + (r - l) * (u + k * 0.006))} y={y} width={1} height={1} fill={vein} />
        );
      }
    });
  }
  if (floor.kind === "check") {
    const bands = [ROOM.floorTop, ...rows, ROOM.h];
    for (let b = 0; b + 1 < bands.length; b++)
      for (let y = bands[b]; y < bands[b + 1]; y++) {
        const l = floorLeftAt(y);
        const w = floorRightAt(y) - l;
        if (w < 2) continue;
        for (let c = 0; c < 6; c++) {
          if ((c + b) % 2) continue;
          const x0 = Math.round(l + (w * c) / 6);
          const x1 = Math.round(l + (w * (c + 1)) / 6);
          if (x1 > x0)
            out.push(
              <rect key={`fc${b}-${y}-${c}`} x={x0} y={y} width={x1 - x0} height={1} fill={floor.accent} />
            );
        }
      }
  }

  // 걸레받이. 옆벽에서는 계단처럼 내려오는데 이웃 열까지 이어 붙여야 줄이 안 끊긴다
  for (let x = 0; x < ROOM.w; x++) {
    const top = floorTopAt(x);
    if (top >= ROOM.h) continue;
    const near = floorTopAt(x < ROOM.w / 2 ? x + 1 : x - 1);
    const y0 = Math.min(top, near) - 1;
    out.push(
      <rect key={`bb${x}`} x={x} y={y0} width={1} height={Math.max(1, top - y0)} fill={BASEBOARD} />
    );
  }
  return out;
}

/** 소품이 방 밖으로 못 나가게. 바닥 것은 발끝이 놓인 줄에 따라 좌우 끝이 달라진다 */
export function fit(it: Item, x: number, y: number) {
  const w = it.sprite.rows[0].length;
  const h = it.sprite.rows.length;
  if (it.slot === "wall") {
    return {
      x: clamp(x, ROOM.side, ROOM.w - ROOM.side - w),
      y: clamp(y, 1, ROOM.base - h - 1),
    };
  }
  if (it.slot === "top") {
    // 가구 위로 올라가야 하니 걸레받이 위까지 허용한다. 좌우는 방 안이기만 하면 된다
    return {
      x: clamp(x, 0, ROOM.w - w),
      y: clamp(y, ROOM.base - h - 14, ROOM.h - h),
    };
  }
  const ny = clamp(y, ROOM.floorTop - Math.floor(h / 2), ROOM.h - h);
  const feet = ny + h;
  return {
    x: clamp(x, Math.ceil(floorLeftAt(feet)), Math.floor(floorRightAt(feet)) - w),
    y: ny,
  };
}

/** 판다가 지금 선 자리. face 가 -1 이면 왼쪽을 본다 */
type Pose = { x: number; y: number; face: number; bob: number };

const WALK_Y0 = ROOM.floorTop + 4 - PANDA.h;
const WALK_Y1 = ROOM.h - 2 - PANDA.h;
const walkLo = (feet: number) => Math.ceil(floorLeftAt(feet));
const walkHi = (feet: number) => Math.floor(floorRightAt(feet)) - PANDA.w;

export default function PetRoom({
  pet,
  editing = false,
  onMove,
}: {
  pet: Pet;
  editing?: boolean;
  onMove?: (id: string, x: number, y: number) => void;
}) {
  const wall = wallById(pet.wall);
  const floor = floorById(pet.floor);
  const scene = useMemo(() => backdrop(wall, floor), [wall, floor]);

  /*
   * 판다 산책.
   *
   * 정해진 선을 오가는 게 아니라 바닥 안에서 갈 곳을 스스로 정한다.
   * 한 칸씩 정수로만 움직인다 — 반 칸이 나오면 도트가 어긋나 깨져 보인다.
   * 뒤로 물러설수록 다닐 수 있는 폭이 좁아지므로 매 걸음 다시 가둔다.
   */
  const [pos, setPos] = useState<Pose>(() => ({ x: PANDA.x, y: PANDA.y, face: 1, bob: 0 }));
  const target = useRef<{ x: number; y: number }>({ x: PANDA.x, y: PANDA.y });
  const rest = useRef(0);

  const pickTarget = useCallback(() => {
    const y = WALK_Y0 + Math.floor(Math.random() * (WALK_Y1 - WALK_Y0 + 1));
    const lo = walkLo(y + PANDA.h);
    const hi = Math.max(lo, walkHi(y + PANDA.h));
    target.current = { x: lo + Math.floor(Math.random() * (hi - lo + 1)), y };
  }, []);

  useEffect(() => {
    // 가구를 옮기는 동안에는 세워둔다. 손가락 밑에서 돌아다니면 집기 어렵다
    if (editing) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const id = setInterval(() => {
      setPos((p) => {
        if (rest.current > 0) {
          rest.current--;
          return p.bob ? { ...p, bob: 0 } : p;
        }
        const dx = target.current.x - p.x;
        const dy = target.current.y - p.y;
        if (dx === 0 && dy === 0) {
          rest.current = 8 + Math.floor(Math.random() * 24); // 0.9 ~ 3.5초 쉰다
          pickTarget();
          return p.bob ? { ...p, bob: 0 } : p;
        }
        const y = p.y + Math.sign(dy);
        const lo = walkLo(y + PANDA.h);
        const hi = Math.max(lo, walkHi(y + PANDA.h));
        return {
          x: clamp(p.x + Math.sign(dx), lo, hi),
          y,
          face: dx === 0 ? p.face : dx > 0 ? 1 : -1,
          bob: p.bob ? 0 : -1, // 한 칸씩 들썩인다. 없으면 미끄러지듯 보인다
        };
      });
    }, 110);
    return () => clearInterval(id);
  }, [editing, pickTarget]);

  // 하트는 눌렀을 때만. 연타해도 다시 튀어오르게 열쇠를 갈아 끼운다
  /*
   * 움직이는 소품(어항 · 밤하늘 창문 · 요정 날개) 의 장 넘김.
   * 판다 걸음과 따로 둔다 — 옮기기 중에는 판다가 멈춰서 걸음에 묶으면 어항도 같이 멈춘다.
   * 움직이는 게 방에 없으면 타이머를 아예 안 돌린다
   */
  const [tick, setTick] = useState(0);
  const moving = [...(pet.spots ?? []).map((s) => s.id), pet.worn.head, pet.worn.body, pet.worn.back]
    .some((id) => !!id && !!itemById(id)?.anim);
  useEffect(() => {
    if (!moving) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setTick((t) => (t + 1) % 840), ANIM_MS);
    return () => clearInterval(id);
  }, [moving]);

  const [beat, setBeat] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pat = useCallback(() => {
    setBeat((n) => n + 1);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setBeat(0), 900);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);

  /* ── 가구 끌어 옮기기 ── */
  const svgRef = useRef<SVGSVGElement>(null);
  const grab = useRef<{ id: string; dx: number; dy: number; x: number; y: number } | null>(null);
  const [drag, setDrag] = useState<{ id: string; x: number; y: number } | null>(null);

  /*
   * 손을 뗐을 때 — **그리고 터치가 취소됐을 때도** 여기서 저장한다.
   *
   * 아이폰 사파리는 끄는 도중 위아래로 움직이면 스크롤로 보고 pointercancel 을 보낸다.
   * 그러면 pointerup 이 안 와서, 예전에는 저장을 건너뛴 채 임시 자리(drag) 만 화면에 남았다.
   * 다음에 다른 가구를 잡는 순간 drag 가 그쪽으로 넘어가면서 앞의 가구가 원래 자리로 튀었다.
   * grab 을 먼저 비우므로 up 과 cancel 이 둘 다 와도 한 번만 저장한다.
   */
  const drop = (it: Item) => {
    const g = grab.current;
    if (!g || g.id !== it.id) return;
    grab.current = null;
    // 두 칸 격자에 붙인다. 손가락으로 한 칸은 못 맞춘다
    const f = fit(it, Math.round(g.x / SNAP) * SNAP, Math.round(g.y / SNAP) * SNAP);
    setDrag(null);
    onMove?.(it.id, f.x, f.y);
  };

  // 옮기기를 끝내면 임시 자리를 비운다. 화면과 저장된 자리가 어긋난 채로 남지 않게
  useEffect(() => {
    if (editing) return;
    grab.current = null;
    setDrag(null);
  }, [editing]);

  const toDots = (e: React.PointerEvent) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r) return { x: 0, y: 0 };
    return {
      x: Math.round(((e.clientX - r.left) / r.width) * ROOM.w),
      y: Math.round(((e.clientY - r.top) / r.height) * ROOM.h),
    };
  };

  const out = (pet.spots ?? [])
    .map((sp) => ({ sp, it: itemById(sp.id) }))
    .filter((v): v is { sp: { id: string; x: number; y: number }; it: Item } => !!v.it)
    .map(({ sp, it }) => {
      if (drag?.id === sp.id) return { it, x: drag.x, y: drag.y };
      /*
       * 저장된 자리도 그릴 때 한 번 더 가둔다. 그림이 넓어지면(침대 22 → 30)
       * 벽 가까이 놓아둔 것이 방 밖으로 삐져나온다. 저장된 값은 건드리지 않는다
       */
      const f = fit(it, sp.x, sp.y);
      return { it, x: f.x, y: f.y };
    });

  const pandaFeet = pos.y + PANDA.h;
  const feetOf = (o: { y: number; it: Item }) => o.y + o.it.sprite.rows.length;
  const byFeet = (slot: string) =>
    out.filter((o) => o.it.slot === slot).sort((a, b) => feetOf(a) - feetOf(b));
  const onFloor = byFeet("floor");
  const onTop = byFeet("top");

  const worn = [pet.worn.head, pet.worn.body]
    .map((id) => (id ? itemById(id) : undefined))
    .filter((v): v is Item => !!v);
  // 등에 거는 것(요정 날개) 은 판다 몸보다 먼저 그려야 뒤로 간다
  const back = pet.worn.back ? itemById(pet.worn.back) : undefined;

  const pandaG = (
    <g
      key="panda"
      transform={
        pos.face < 0
          ? `translate(${pos.x + PANDA.w},${pos.y + pos.bob}) scale(-1,1)`
          : `translate(${pos.x},${pos.y + pos.bob})`
      }
    >
      {back && <Piece key={back.id} sprite={spriteAt(back, tick)} x={back.at[0]} y={back.at[1]} />}
      {dots(BABY)}
      {worn.map((it) => (
        <Piece key={it.id} sprite={spriteAt(it, tick)} x={it.at[0]} y={it.at[1]} />
      ))}
      {/* 도트 사이 빈틈까지 눌리도록 투명한 판을 덮는다 */}
      <rect
        className="pet-hit"
        x={0}
        y={-5}
        width={PANDA.w}
        height={PANDA.h + 5}
        fill="#fff"
        fillOpacity={0}
        pointerEvents={editing ? "none" : "all"}
        onClick={pat}
      />
      {beat > 0 && (
        // 튀어오르는 건 바깥 g 가 하고, 머리 위로 올리는 건 안쪽 g 가 한다.
        // 한 g 에 둘 다 주면 CSS 애니메이션이 transform 을 덮어써서 제자리로 내려온다
        <g key={beat} className="pet-heart">
          <g transform="translate(12,-12)">{dots(HEART)}</g>
        </g>
      )}
    </g>
  );

  return (
    <div className="pet-room">
      <svg
        ref={svgRef}
        className={`room ${editing ? "room-editing" : ""}`}
        viewBox={`0 0 ${ROOM.w} ${ROOM.h}`}
        shapeRendering="crispEdges"
        role="img"
        aria-label="아기 판다의 방"
      >
        {scene}

        {/* 바닥에 까는 것은 늘 맨 아래 — 판다가 그 위를 밟고 지나간다 */}
        {out
          .filter((o) => o.it.slot === "flat")
          .map((o) => (
            <Piece key={o.it.id} sprite={spriteAt(o.it, tick)} x={o.x} y={o.y} />
          ))}

        {/* 벽에 거는 것은 늘 판다 뒤 */}
        {out
          .filter((o) => o.it.slot === "wall")
          .map((o) => (
            <Piece key={o.it.id} sprite={spriteAt(o.it, tick)} x={o.x} y={o.y} />
          ))}

        {/*
          바닥에 놓는 것과 판다는 발끝 높이로 정렬한다 — 앞에 있으면 앞에 그린다.
          SVG 에는 z-index 가 없어서 그리는 순서가 곧 순서다.
        */}
        {onFloor
          .filter((o) => feetOf(o) <= pandaFeet)
          .map((o) => (
            <Piece key={o.it.id} sprite={spriteAt(o.it, tick)} x={o.x} y={o.y} />
          ))}
        {/*
          가구 위에 얹는 것은 **같은 차례 안에서 바닥 가구보다 뒤에** 그린다.
          그래야 책상 위 화분이 책상에 안 가리면서도, 앞을 지나가는 판다에는 가린다.
        */}
        {onTop
          .filter((o) => feetOf(o) <= pandaFeet)
          .map((o) => (
            <Piece key={o.it.id} sprite={spriteAt(o.it, tick)} x={o.x} y={o.y} />
          ))}
        {pandaG}
        {onFloor
          .filter((o) => feetOf(o) > pandaFeet)
          .map((o) => (
            <Piece key={o.it.id} sprite={spriteAt(o.it, tick)} x={o.x} y={o.y} />
          ))}
        {onTop
          .filter((o) => feetOf(o) > pandaFeet)
          .map((o) => (
            <Piece key={o.it.id} sprite={spriteAt(o.it, tick)} x={o.x} y={o.y} />
          ))}

        {/* 집는 자리는 맨 위에 따로 얹는다. 소품끼리 겹쳐 있어도 집을 수 있어야 한다 */}
        {editing &&
          out.map((o) => {
            const w = o.it.sprite.rows[0].length;
            const h = o.it.sprite.rows.length;
            return (
              <g key={`h${o.it.id}`}>
                <rect
                  x={o.x - 0.5}
                  y={o.y - 0.5}
                  width={w + 1}
                  height={h + 1}
                  fill="none"
                  stroke="var(--pink)"
                  strokeWidth={0.6}
                  strokeDasharray="2 2"
                />
                <rect
                  className="pet-grab"
                  x={o.x}
                  y={o.y}
                  width={w}
                  height={h}
                  fill="#fff"
                  fillOpacity={0}
                  pointerEvents="all"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.currentTarget.setPointerCapture(e.pointerId);
                    const p = toDots(e);
                    grab.current = { id: o.it.id, dx: p.x - o.x, dy: p.y - o.y, x: o.x, y: o.y };
                    setDrag({ id: o.it.id, x: o.x, y: o.y });
                  }}
                  onPointerMove={(e) => {
                    const g = grab.current;
                    if (!g || g.id !== o.it.id) return;
                    const p = toDots(e);
                    const f = fit(o.it, p.x - g.dx, p.y - g.dy);
                    g.x = f.x;
                    g.y = f.y;
                    setDrag({ id: o.it.id, ...f });
                  }}
                  onPointerUp={() => drop(o.it)}
                  onPointerCancel={() => drop(o.it)}
                />
              </g>
            );
          })}
      </svg>
    </div>
  );
}

/** 아직 살 수 있는 게 없어도 방은 보여야 하므로 소품 목록은 여기서 내보낸다 */
export { ITEMS };

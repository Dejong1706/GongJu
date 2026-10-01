import { ITEMS, itemById, type Item } from "@/shop";
import type { Spot } from "./types";

/**
 * 판다 방 — 세 면으로 세운다.
 *
 * 벽을 세 장 그리는 게 아니라 **열마다 바닥이 시작하는 높이를 다르게** 준 것이다.
 * 가운데 `side` ~ `w - side` 는 뒷벽이라 늘 같은 줄에서 바닥이 시작하고,
 * 양옆 `side` 칸은 앞으로 올수록 바닥이 내려온다. 그래서 바닥이 사다리꼴이 된다.
 *
 * 아래 세 함수가 **벽·바닥·걸레받이·판다가 다닐 곳을 전부** 정한다.
 * 방 크기를 바꾸고 싶으면 이 숫자 넷만 만지면 나머지는 따라온다.
 * 폰(가로 393px)에서 한 칸이 3.3px, 방 높이가 366px — 스크롤 없이 한 화면에 들어간다.
 *
 * 10/1 에 80 x 92 → 96 x 110 (1.2배) 으로 칸을 촘촘하게 했다 ("방이 좁아 보인다").
 * 화면 크기는 그대로라 그림이 저절로 작아지고 바닥이 넓어진다. **w 를 바꾸면 저장된 자리가 `fitGrid` 로 따라온다**
 */
export const ROOM = { w: 96, h: 110, base: 65, floorTop: 66, side: 14 } as const;
export const BASEBOARD = "#8A6B7C";

/** 그 열에서 바닥이 시작하는 줄. 옆벽이면 앞으로 올수록 내려온다 */
export function floorTopAt(x: number) {
  const d = ROOM.h - ROOM.floorTop;
  if (x < ROOM.side) return Math.round(ROOM.floorTop + ((ROOM.side - x) * d) / ROOM.side);
  if (x >= ROOM.w - ROOM.side)
    return Math.round(ROOM.floorTop + ((x - (ROOM.w - ROOM.side - 1)) * d) / ROOM.side);
  return ROOM.floorTop;
}
/** 그 줄에서 바닥의 왼쪽·오른쪽 끝. 위 함수를 거꾸로 푼 것이라 늘 맞물린다 */
export const floorLeftAt = (y: number) =>
  Math.max(0, ROOM.side - ((y - ROOM.floorTop) * ROOM.side) / (ROOM.h - ROOM.floorTop));
export const floorRightAt = (y: number) =>
  Math.min(
    ROOM.w,
    ROOM.w - ROOM.side + ((y - ROOM.floorTop) * ROOM.side) / (ROOM.h - ROOM.floorTop)
  );

/** 판다 16 x 16. 처음 서 있는 자리 — 그다음부터는 스스로 돌아다닌다 */
export const PANDA = { w: 16, h: 16, x: 36, y: 74 } as const;

/**
 * 방 칸 수가 바뀌었을 때 놓인 자리를 옮긴다 (k = 새 칸 수 / 옛 칸 수).
 * 그림 크기는 그대로라 왼쪽 위를 비율대로 옮기면 오른쪽 · 아래로 쏠린다.
 * 가로는 **가운데**, 세로는 바닥 것은 **발끝**, 벽 것은 **윗줄**을 비율대로 옮긴다
 */
export function rescaleAt(it: Item, x: number, y: number, k: number): [number, number] {
  const w = it.sprite.rows[0].length;
  const h = it.sprite.rows.length;
  const nx = Math.round((x + w / 2) * k - w / 2);
  const ny = it.slot === "wall" ? Math.round(y * k) : Math.round((y + h) * k - h);
  return [nx, ny];
}

/**
 * 저장된 자리를 지금 방 칸 수에 맞춘다. `grid` 는 그 자리를 잰 방의 가로 칸 수 —
 * 이 값이 생기기 전(80 x 92 시절) 에 저장된 것에는 없어서 80 으로 본다
 */
export function fitGrid(spots: Spot[], grid = 80): Spot[] {
  if (grid === ROOM.w) return spots;
  const k = ROOM.w / grid;
  return spots.map((sp) => {
    const it = itemById(sp.id);
    if (!it) return sp;
    const [x, y] = rescaleAt(it, sp.x, sp.y, k);
    return { ...sp, x, y };
  });
}

/**
 * 자리를 저장하기 전에 쓰던 방식에서 옮겨오기.
 * 예전에는 소품마다 자리가 코드에 박혀 있고 "왼쪽 바닥·오른쪽 바닥" 한 칸씩만 썼다.
 * 그때 놓아둔 것들을 새 자리(소품마다 정해둔 처음 자리)로 옮겨준다.
 * 한 번 저장되고 나면 다시 탈 일이 없지만, 지워버리면 놓아둔 게 사라진다.
 */
export function spotsFromPlaced(placed: Record<string, string | null | undefined>) {
  return Object.values(placed ?? {})
    .filter((id): id is string => !!id)
    .map((id) => {
      const it = ITEMS.find((i) => i.id === id);
      return it ? { id, x: it.at[0], y: it.at[1] } : null;
    })
    .filter((v): v is { id: string; x: number; y: number } => !!v);
}

/*
 * ── 포인트 ─────────────────────────
 *
 * 값을 한 군데에 몰지 않고 **하는 일마다 조금씩** 준다.
 * 예전에는 스티커와 체크에만 붙어 있어서, 체크(5초) 와 공부(3시간) 의 값이 같았다.
 *
 * 상점 전체가 16,340점. **부지런한 날 약 300점**(9/17 사용자가 스티커 100 · 10개 보너스 500 으로 올림) — 스티커(보너스 포함 약 157) · 퀴즈 50 ·
 * 타이머 네 번 60 · 과제(주 10개 기준 하루 약 28). 스티커가 하루 벌이의 절반이다.
 * 속도를 바꾸려면 아래 값만 만지면 된다 — 셈하는 곳은 전부 이 상수를 본다.
 */

/** 스티커 하나. 그 달에 열 개 모을 때마다 500점 더 */
export const PER_STICKER = 100;
export const BONUS_EVERY = 10;
export const BONUS = 500;
/** 스티커를 이어 붙인 날이 이만큼 갈 때마다 */
export const STREAK_EVERY = 7;
export const STREAK_BONUS = 50;
/**
 * 강의·과제 하나를 다 했다고 표시할 때마다. 하루 다섯 번까지.
 * 한도가 없으면 빈 과제를 만들어 체크하기를 되풀이해 끝없이 모을 수 있다.
 */
export const PER_TASK = 20;
export const TASK_CAP = 5;
/**
 * 토익 퀴즈 한 문제 맞힐 때마다. **그날 처음 끝까지 푼 한 판만** 친다 (0~50점).
 * 다시 풀어 만점을 노리는 걸 막으려고 틀려도 기회가 끝난다.
 */
export const PER_QUIZ = 10;
/**
 * 타이머를 **일시정지 없이** 이만큼 잴 때마다. 하루 네 번까지.
 * 조건 없이 시간당으로 주면 켜두기 게임이 된다 — 이 둘이 그걸 막는 전부다.
 */
export const PER_FOCUS = 15;
export const FOCUS_MIN = 25;
export const FOCUS_CAP = 4;

export const monthPoints = (count: number) =>
  count * PER_STICKER + Math.floor(count / BONUS_EVERY) * BONUS;

/**
 * 이어 붙인 날이 7일 갈 때마다 50점.
 *
 * 개수가 아니라 **이어진 길이**를 세므로, 떼면 그만큼 되돌아간다 (연타로 못 불린다).
 * 달을 넘는 연속은 안 센다 — 스티커 문서가 달마다 따로라 지난 달을 읽어와야 하는데,
 * 그 한 번을 위해 읽기를 늘릴 만큼의 값은 아니라고 봤다.
 */
export function streakPoints(days: number[]) {
  let total = 0;
  let run = 0;
  let prev = -99;
  for (const d of [...days].sort((a, b) => a - b)) {
    run = d === prev + 1 ? run + 1 : 1;
    prev = d;
    if (run % STREAK_EVERY === 0) total += STREAK_BONUS;
  }
  return total;
}

/** 그 달 스티커로 번 점수 전부 */
export const stickerPoints = (days: number[]) =>
  monthPoints(days.length) + streakPoints(days);

/**
 * 윷놀이 규칙. 화면이 아니라 **규칙만** 들어 있다 —
 * 밭 하나하나의 자리, 말이 갈 길, 잡기 · 업기, 윷가락 판정.
 *
 * 이벤트가 끝나면 이 파일과 EventView · YutBoard · YutThrow 를 통째로 지운다.
 * 다른 곳은 건드리지 않았으므로 지워도 앱은 그대로 돈다 (지울 것 목록은 history.md).
 */

export type YutSide = "a" | "b";
/** 백도 · 도 · 개 · 걸 · 윷 · 모 */
export type Throw = -1 | 1 | 2 | 3 | 4 | 5;

export const WAIT = -1; // 아직 안 나간 말
export const GOAL = 20; // 다 돌아 난 말 (판 위가 아니다)
export const CHAM = 30; // 참먹이 — 출발이자 **마지막 밭**. 여기 서면 아직 난 게 아니다
export const HORSES = 3; // 한 편의 말 수

export const THROW_NAME: Record<number, string> = {
  "-1": "백도",
  1: "도",
  2: "개",
  3: "걸",
  4: "윷",
  5: "모",
};
export const THROW_STEP: Record<number, string> = {
  "-1": "뒤로 한 칸",
  1: "한 칸",
  2: "두 칸",
  3: "세 칸",
  4: "네 칸",
  5: "다섯 칸",
};

/** 윷 · 모는 한 번 더 던진다 */
export const isExtra = (t: Throw) => t === 4 || t === 5;

/* ──────────────────────────────────────────────
   밭 29개의 자리.
   한 변에 밭 6개(모서리 포함) = 바깥 20칸, 대각선은 모서리에서 중앙까지 2칸씩.
   0 = 참먹이 자리(오른쪽 아래). 거기서 **오른쪽 변을 타고 위로** 올라가 반시계로 돈다
   (우하 → 우상 → 좌상 → 좌하 → 우하). 20 = 골 — 참먹이를 **지나쳐** 판을 떠난 말이다.

   **한 밭에 이름이 여럿인 것들** — 자리는 같고 '어느 길로 들어왔는지'만 다르다.
   백도는 온 길로 되물러야 해서(대회규정: 직전에 움직인 방향의 반대) 이름을 나눠 둔다.
     · 방(가운데)  23 지나가는 중 · 33 둘째 지름길로 멈춤 · 34 첫 지름길로 멈춤
     · 찌모(15)    15 바깥길로 · 35 첫 지름길로
     · 참먹이      30 바깥길로 · 31 둘째 지름길로 · 32 '도'에서 백도로 물러나서
   ALIAS 가 이 이름들을 다시 한 밭으로 모은다 — 잡기 · 업기는 자리로만 따진다.

   좌표는 도트 격자다 (1 = 도트 한 칸, 폰에서 약 4px).
────────────────────────────────────────────── */
export type Node = { x: number; y: number; big?: boolean; mid?: boolean };

const PAD = 8;
const GAP = 14;
const at = (c: number, r: number, big?: boolean): Node => ({
  x: PAD + c * GAP,
  y: PAD + r * GAP,
  big,
});

export const NODES: Record<number, Node> = (() => {
  const n: Record<number, Node> = {};
  for (let i = 0; i <= 5; i++) n[i] = at(5, 5 - i, i === 0 || i === 5); // 오른쪽 변 — 위로
  for (let i = 6; i <= 10; i++) n[i] = at(10 - i, 0, i === 10); // 윗변 — 왼쪽으로
  for (let i = 11; i <= 15; i++) n[i] = at(0, i - 10, i === 15); // 왼쪽 변 — 아래로
  for (let i = 16; i <= 19; i++) n[i] = at(i - 15, 5); // 아랫변 — 오른쪽으로 골까지
  n[20] = n[0];
  n[21] = { x: 66, y: 20 }; // 우상 모서리(5)에서 방으로 내려오는 지름길
  n[22] = { x: 55, y: 31 };
  n[23] = { x: 43, y: 43, big: true, mid: true };
  n[24] = { x: 31, y: 55 };
  n[25] = { x: 20, y: 66 }; // 좌하 모서리(15)로 합류
  n[26] = { x: 20, y: 20 };
  n[27] = { x: 31, y: 31 };
  n[28] = { x: 55, y: 55 };
  n[29] = { x: 66, y: 66 };
  // 같은 자리의 딴 이름들 — 말은 여기 서 있어도 같은 밭에 그려진다
  n[30] = n[31] = n[32] = n[0]; // 참먹이
  n[33] = n[34] = n[23]; // 방
  n[35] = n[15]; // 찌모
  return n;
})();

/** 이름이 여럿인 밭을 하나로 모은다 — 잡기 · 업기 · 수 고르기는 **자리**로만 따진다 */
const ALIAS: Record<number, number> = { 0: CHAM, 31: CHAM, 32: CHAM, 34: 33, 35: 15 };
export const field = (pos: number) => ALIAS[pos] ?? pos;

/** 판 한 변의 길이 (도트 칸) */
export const BOARD = PAD * 2 + GAP * 5;

/**
 * 판에 적는 밭 이름 (9/23 사용자 요청). **아는 이름만** 적는다 —
 * 스무 밭에 다 붙이면 (모도 · 모개 · 꺾도 …) 판이 글자로 덮인다.
 *
 * 글씨는 **밭 한가운데, 말보다 아래**에 깔린다 — 말이 선 밭은 이름을 볼 일이 없다.
 * 도 → 모 가 오른쪽 변을 타고 올라가므로 **이름이 곧 진행 방향**이다.
 * 그래서 참먹이에 있던 빨간 화살표는 뺐다 (말이 한 칸씩 걸어가는 것도 방향을 보여준다).
 */
export const FIELD_NAME: Record<number, string> = {
  1: "도",
  2: "개",
  3: "걸",
  4: "윷",
  5: "모",
  10: "꺾",
  15: "찌모",
  23: "방",
  0: "참먹이",
};

/**
 * 다음 밭. 지름길은 **모서리에 멈춘 말이 떠날 때만** 탄다 (FIRST).
 * 바깥길 · 지름길 모두 **참먹이를 거쳐** 골로 나간다 — 참먹이에 서면 아직 안 난 것이다.
 */
const NEXT: Record<number, number> = {
  19: CHAM, 30: GOAL, 31: GOAL, 32: GOAL,
  21: 22, 22: 23, 23: 24, 24: 25, 25: 35, 35: 16,
  26: 27, 27: 33, 33: 28, 34: 28, 28: 29, 29: 31,
};
for (let i = 0; i <= 18; i++) NEXT[i] = i + 1;

/**
 * 갈림길 — **멈춘 말이 떠날 때** 고를 수 있는 다음 밭. 앞이 지름길(0), 뒤가 바깥길(1).
 * 지나쳐 가는 말은 못 고른다 (대회규정: 멈춘 자리에서만 방향을 정한다).
 *
 * 9/22 까지는 늘 지름길을 태웠는데(`FIRST`), **일부러 돌아서 잡으러 가는 수**가 아예 없어서
 * 9/23 에 고르게 했다 (사용자 요청).
 *
 * - `5` 우상 모서리 · `10` 좌상 모서리 — 지름길로 들어갈지 변을 따라 갈지
 * - `34` **첫 지름길로 멈춘 방** — 참먹이로 질러갈지(28) 첫 지름길을 마저 타 찌모로 갈지(24)
 * - `33`(둘째 지름길로 멈춘 방) 은 갈림길이 아니다 — 나머지 팔이 전부 왔던 길 쪽이다
 */
const FORK: Record<number, number[]> = {
  5: [21, 6],
  10: [26, 11],
  34: [28, 24],
};

/** 갈림길에 선 말인가 — 화면이 "갈 곳을 고르라" 고 물을 자리다 */
export const isFork = (pos: number) => FORK[pos] !== undefined;

/**
 * 백도로 되돌아갈 밭 — **온 길로** 되돌아간다.
 * '도'(1) 에서 백도면 참먹이에 선 것으로 친다(32) — 다음에 뭐가 나오든 난다.
 * 거기서 백도가 또 나오면 도로 '도' 자리로 간다.
 */
const BACK: Record<number, number> = {
  1: 32, 30: 19, 31: 29, 32: 1,
  21: 5, 22: 21, 23: 22, 24: 23, 25: 24, 35: 25,
  26: 10, 27: 26, 33: 27, 34: 22, 28: 33, 29: 28,
};

/** 첫 지름길로 가운데에 멈췄으면 34 로 둔다 — 다음엔 골 쪽으로 나간다 */
const settle = (pos: number) => (pos === 23 ? 34 : pos);

function backOne(pos: number): number | null {
  if (pos === WAIT || pos === GOAL) return null;
  if (BACK[pos] !== undefined) return settle(BACK[pos]);
  return pos - 1; // 바깥길은 한 칸 뒤 — 도(1) · 참먹이 · 지름길은 BACK 에 적어 뒀다
}

/** 참먹이 규칙을 고치기 전 판에서 0 에 서 있던 말 — 도에서 백도로 물러난 것이었다 */
const old0 = (pos: number) => (pos === 0 ? 32 : pos);

/**
 * 한 걸음씩 밟아 간다. `fields` 는 **거쳐 가는 밭을 순서대로** 담고 (화면이 한 칸씩 걸린다),
 * `end` 는 닿은 자리다. 골은 딱 맞지 않아도 **참먹이를 지나치기만 하면** 난다 —
 * 그때 `fields` 는 참먹이까지만 담는다 (판을 떠나는 걸음은 그릴 자리가 없다).
 */
function run(pos: number, t: Throw, branch: number): { fields: number[]; end: number } {
  const fields: number[] = [];
  let cur = pos;
  for (let i = 0; i < t; i++) {
    if (cur === WAIT) {
      cur = 1; // 대기하던 말이 첫 칸에 들어선다
      fields.push(cur);
      continue;
    }
    const fork = i === 0 ? FORK[cur] : undefined;
    const next = fork ? fork[branch] ?? fork[0] : NEXT[cur];
    /*
     * **번호가 크다고 골이 아니다** — 지름길 밭은 21~29 · 33 이라 GOAL(20) 보다 크다.
     * 여기서 next >= GOAL 로 끊었더니 지름길에 들어서는 순간 나 버렸다.
     * 골에 닿으면 남은 걸음은 버린다 (딱 맞지 않아도 난다)
     */
    if (next === undefined || next === GOAL) return { fields, end: GOAL };
    cur = next;
    fields.push(cur);
  }
  const end = settle(cur);
  if (fields.length > 0) fields[fields.length - 1] = end; // 방에 멈췄으면 이름을 바꿔 둔다
  return { fields, end };
}

/**
 * pos 에 있는 말이 t 만큼 갔을 때 닿는 밭. 갈 수 없으면 null.
 * `branch` 는 갈림길에서 고른 길 — 0 지름길 · 1 바깥길 (FORK 참고).
 */
export function advance(raw: number, t: Throw, branch = 0): number | null {
  const pos = old0(raw);
  if (pos === GOAL) return null;
  if (t === -1) return backOne(pos);
  return run(pos, t, branch).end;
}

/** 거쳐 가는 밭들 — 말이 한 칸씩 걸어가는 데 쓴다. 백도는 한 걸음이다 */
export function pathOf(raw: number, t: Throw, branch = 0): number[] {
  const pos = old0(raw);
  if (pos === GOAL) return [];
  if (t === -1) {
    const back = backOne(pos);
    return back === null ? [] : [back];
  }
  return run(pos, t, branch).fields;
}

/* ── 윷가락 ────────────────────────────────── */

/** 면 — 0 배(평평한 면) · 2 등(둥근 면). 배가 위를 보면 한 칸씩 친다 */
export type Faces = [number, number, number, number];

/** 네 번째 가락이 백도 가락이다 (그림에도 점을 새겨둔다) */
export function judge(faces: Faces): Throw {
  const up = faces.filter((f) => f === 0).length;
  if (up === 1 && faces[3] === 0) return -1;
  if (up === 0) return 5;
  return up as Throw;
}

export function rollFaces(): Faces {
  // 배가 조금 더 잘 나오게 둔다 — 진짜 윷도 평평한 쪽이 더 잘 뒤집힌다
  return [0, 0, 0, 0].map(() => (Math.random() < 0.55 ? 0 : 2)) as Faces;
}

/* ── 판 위의 말 ────────────────────────────── */

export type Horses = Record<YutSide, number[]>;

export const other = (s: YutSide): YutSide => (s === "a" ? "b" : "a");

/**
 * 그 자리에 선 같은 편 말의 번호들 — 업은 말은 늘 같이 움직인다.
 * 이름이 여럿인 밭(방 · 찌모 · 참먹이)이 있어 **자리로** 따진다
 */
export const stackAt = (horses: number[], pos: number) =>
  horses.map((p, i) => (field(p) === field(pos) ? i : -1)).filter((i) => i >= 0);

/** 판 위(대기 · 골 제외)에 있는 밭들 */
export const onBoard = (horses: number[]) =>
  [...new Set(horses.filter((p) => p !== WAIT && p !== GOAL))];

/** `branch` 는 갈림길에서 고른 길 — 0 지름길 · 1 바깥길 */
export type Move = { from: number; to: number; horses: number[]; branch: number };

/**
 * 지금 던진 값으로 갈 수 있는 수를 모은다.
 * 같은 밭에 선 말은 한 덩어리(업은 것)라 수 하나로 묶인다.
 *
 * **갈림길에 선 말은 수가 둘**이다 — `from` 이 같고 `to` 가 다르다.
 * 어느 쪽인지는 화면이 물어본다 (`isFork`).
 */
export function movesFor(horses: number[], t: Throw): Move[] {
  const list: Move[] = [];
  const seen = new Set<number>();
  horses.forEach((pos, i) => {
    if (pos === GOAL) return;
    if (seen.has(field(pos))) return;
    seen.add(field(pos));
    const mine = pos === WAIT ? [i] : stackAt(horses, pos);
    const branches = t > 0 && isFork(pos) ? [0, 1] : [0];
    branches.forEach((branch) => {
      const to = advance(pos, t, branch);
      if (to === null) return;
      // 두 길이 같은 밭에 닿으면 고를 것이 없다
      if (list.some((m) => m.from === pos && m.to === to)) return;
      list.push({ from: pos, to, horses: mine, branch });
    });
  });
  return list;
}

/**
 * 판 위에 말이 하나도 없는데 백도가 나왔다 — **그 값으로는 아무것도 못 한다.**
 * 9/23 까지는 도로 바꿔 쳤는데(`realThrow`), 진짜 윷놀이에는 없는 규칙이라 걷어냈다
 * (사용자가 고른 것 — 대회규정대로 한 번 쉰다). 화면은 `건너뛰기` 만 내준다
 */
export const stuck = (horses: number[], t: Throw) =>
  t === -1 && onBoard(horses).length === 0;

export type MoveResult = {
  horses: Horses;
  /** 잡았으면 한 번 더 던진다 */
  caught: boolean;
  /** 말 셋이 다 났으면 이긴 것 */
  won: boolean;
};

export function applyMove(
  horses: Horses,
  side: YutSide,
  move: Move
): MoveResult {
  /*
   * 먼저 가 있던 내 말도 **방금 들어온 말의 이름**을 따라간다 —
   * 업은 덩어리는 같이 움직이니 되물릴 길도 하나여야 한다
   */
  const mine = horses[side].map((p, i) =>
    move.horses.includes(i) || (move.to !== GOAL && field(p) === field(move.to)) ? move.to : p
  );

  const foeSide = other(side);
  let foe = [...horses[foeSide]];
  let caught = false;
  if (move.to !== GOAL) {
    caught = foe.some((p) => p !== WAIT && field(p) === field(move.to));
    if (caught) foe = foe.map((p) => (p !== WAIT && field(p) === field(move.to) ? WAIT : p));
  }

  return {
    horses: { [side]: mine, [foeSide]: foe } as Horses,
    caught,
    won: mine.every((p) => p === GOAL),
  };
}

/* ── 말 그림 (도트) ────────────────────────── */

/** o 테두리 · 나머지 글자는 FRUIT_PAL 의 색 */
export const FRUIT_PAL: Record<string, string> = {
  o: "#4a2a26",
  R: "#d8404f", r: "#ad2b3c", H: "#f2707c", w: "#ffe9a8",
  G: "#5f9e58", g: "#417a3e",
  M: "#e8a52c", m: "#c07d15", h: "#ffd985", Y: "#d4562a",
};

/** 정연 쪽 — 딸기 */
export const BERRY = [
  "...gGg...",
  "..GgGgG..",
  ".oRRRRRo.",
  "oRHwRRwRo",
  "oRHRRRRRo",
  "orRwRRwro",
  ".orRRRro.",
  "..orRro..",
  "...ooo...",
];

/** 상대 쪽 — 망고 */
export const MANGO = [
  "....Go...",
  "...GgG...",
  "..oMMMo..",
  ".oMhMMYo.",
  "oMhMMMMYo",
  "oMMMMMMYo",
  "oMMMMMmmo",
  ".omMMMmo.",
  "..ommo...",
];

export const ART: Record<YutSide, string[]> = { a: MANGO, b: BERRY };
export const FRUIT: Record<YutSide, string> = { a: "망고", b: "딸기" };

/** 업은 개수를 찍을 숫자 (3 x 5 도트) */
export const DIGIT: Record<number, string[]> = {
  2: ["###", "..#", "###", "#..", "###"],
  3: ["###", "..#", ".##", "..#", "###"],
};

/** 이벤트 화면에서만 쓰는 색 — 먹 · 고동 · 한지 · 단청 */
export const K = {
  ink: "#2b2622",
  wood: "#6b4a2c",
  woodD: "#47301b",
  woodL: "#a87a4e",
  hanji: "#f7ecd9",
  hanji2: "#efe0c8",
  gold: "#d2a84f",
  red: "#a6362b",
  blue: "#2e6f6a",
  ochre: "#c9962c",
};

/** 이겼을 때 정연이 받는 포인트 */
export const PER_WIN = 100;

/**
 * 선 뽑기에서의 높낮이 — 모 > 윷 > 걸 > 개 > 도 > 백도.
 * 백도는 판에서는 뒤로 가는 값이라 여기서는 **맨 아래**로 둔다
 */
export const rank = (t: Throw) => (t === -1 ? 0 : t);

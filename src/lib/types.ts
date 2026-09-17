import type { Facing } from "@/shop";

export type TabKey = "cal" | "lec" | "tt" | "toeic" | "panda";

export type Course = {
  id: string;
  name: string;
  short: string;
  color: string;
  days: number[]; // 0=일 ~ 6=토
  start: string; // "HH:MM"
  end: string; // "HH:MM"
  building: string; // 건물 이름
  room: string; // 강의실 번호
};

export type SchoolEvent = {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  color: string;
};

export type TaskKind = "강의" | "과제";

export type Task = {
  id: string;
  kind: TaskKind;
  courseId: string;
  title: string;
  date: string; // YYYY-MM-DD
  done: boolean;
  /**
   * 체크할 때 실제로 준 점수와 그 날. 풀거나 지울 때 이만큼만 되돌려받는다.
   * 하루 한도를 넘겨 체크한 것은 0 이다. 이 규칙 전에 체크한 것에는 없다
   */
  paid?: number;
  paidDay?: string;
};

export type Word = {
  id: string;
  en: string;
  ko: string;
  createdAt: number; // ms
};

/** 저장할 때는 id 가 없다 (Firestore 가 만들어준다) */
export type NewEvent = Omit<SchoolEvent, "id">;
export type NewTask = Omit<Task, "id">;

/** 판다 방의 상태. users/{uid}/pet/state 문서 하나에 통째로 들어간다. */
/**
 * 방에 꺼내놓은 소품 하나.
 * face 는 바라보는 쪽 — **없으면 그 아이템의 기본 방향**(지금 그림). 방향이 생기기 전에 놓은 가구에는 없다.
 * Firestore 는 undefined 를 못 쓰므로 face 는 **돌렸을 때만 붙이고** 옮길 때는 `...spot` 으로 들고 간다
 */
export type Spot = { id: string; x: number; y: number; face?: Facing };

export type Pet = {
  /** 지금까지 번 포인트. 스티커를 붙이고 뗄 때 그만큼 더하고 뺀다 */
  earned: number;
  /** 지금까지 쓴 포인트 */
  spent: number;
  /** 산 것들의 id */
  owned: string[];
  /** 몸에 걸친 것 — 자리마다 하나씩 */
  worn: { head?: string | null; body?: string | null; back?: string | null };
  /**
   * 방에 꺼내놓은 소품과 그 자리. 목록에 있으면 방에 있는 것이고, 빼면 치운 것이다.
   * 맵이 아니라 배열인 건 Firestore 때문이다 — merge 로 쓰면 맵은 키가 안 지워진다.
   */
  spots: Spot[];
  wall: string;
  floor: string;
  /*
   * 하루에 몇 번까지만 주는 것들의 기록.
   * 다른 값과 달리 **날짜가 바뀌면 처음부터**라서, 언제 줬는지를 같이 들고 있어야 한다.
   */
  /** 강의·과제 체크로 점수를 준 날과 그 날 준 횟수 */
  taskDay?: string;
  taskCount?: number;
  /** 토익 퀴즈 점수를 준 날 (YYYY-MM-DD) */
  quizDay?: string;
  /** 타이머 점수를 준 날과 그 날 준 횟수 */
  focusDay?: string;
  focusCount?: number;
};

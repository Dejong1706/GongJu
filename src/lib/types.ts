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
export type Pet = {
  /** 지금까지 번 포인트. 스티커를 붙이고 뗄 때 그만큼 더하고 뺀다 */
  earned: number;
  /** 지금까지 쓴 포인트 */
  spent: number;
  /** 산 것들의 id */
  owned: string[];
  /** 몸에 걸친 것 — 자리마다 하나씩 */
  worn: { head?: string | null; body?: string | null };
  /** 방에 놓은 것 */
  placed: { wall?: string | null; floorL?: string | null; floorR?: string | null };
  wall: string;
  floor: string;
};

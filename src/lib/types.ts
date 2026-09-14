export type TabKey = "cal" | "lec" | "tt" | "toeic" | "star";

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

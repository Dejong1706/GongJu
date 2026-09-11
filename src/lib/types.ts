export type TabKey = "cal" | "lec" | "toeic" | "star";

export type Course = {
  id: string;
  name: string;
  short: string;
  color: string;
  days: number[]; // 0=일 ~ 6=토
  time: string;
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
  date: string;
  done: boolean;
};

export type Word = { id: string; en: string; ko: string };

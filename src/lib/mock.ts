import type { Course, SchoolEvent, Task, Word } from "./types";
import { ymd } from "./date";

/** 일정에 쓰는 파스텔 6색 */
export const PALETTE = ["#FFA5C3", "#C9A7E8", "#9EDCC4", "#FFCE9E", "#A9C9F5", "#FFE9A0"];

/** 학기 시작일 (월요일로 맞춘다) */
export const SEM_START = new Date(2026, 7, 31);
export const SEM_WEEKS = 15;

export const COURSES: Course[] = [
  { id: "c1", name: "경영학원론", short: "경영", color: "#FF8FBC", days: [1, 3], time: "19:00" },
  { id: "c2", name: "경제학", short: "경제", color: "#C9A7E8", days: [2], time: "19:00" },
  { id: "c3", name: "컴퓨터개론", short: "컴개", color: "#9EDCC4", days: [4], time: "20:40" },
  { id: "c4", name: "영어회화", short: "영회", color: "#FFCE9E", days: [5], time: "19:00" },
];

const M = (d: number) => ymd(new Date(2026, 8, d)); // 2026년 9월

export const EVENTS: SchoolEvent[] = [
  { id: "e1", date: M(15), title: "중간고사", color: PALETTE[0] },
  { id: "e2", date: M(15), title: "경영학 발표", color: PALETTE[3] },
  { id: "e3", date: M(20), title: "토익 시험", color: PALETTE[4] },
  { id: "e4", date: M(30), title: "과제 마감", color: PALETTE[1] },
];

export const TASKS: Task[] = [
  { id: "t1", kind: "강의", courseId: "c1", title: "마케팅 기초", date: M(9), done: false },
  { id: "t2", kind: "강의", courseId: "c2", title: "탄력성", date: M(8), done: false },
  { id: "t3", kind: "과제", courseId: "c4", title: "에세이 1차 제출", date: M(11), done: false },
  { id: "t4", kind: "강의", courseId: "c3", title: "알고리즘 개요", date: M(10), done: true },
  { id: "t5", kind: "강의", courseId: "c1", title: "조직 행동론", date: M(2), done: false },
  { id: "t6", kind: "강의", courseId: "c2", title: "경제학 입문", date: M(1), done: true },
  { id: "t7", kind: "강의", courseId: "c3", title: "컴퓨터의 구조", date: M(3), done: true },
];

export const WORDS: Word[] = [
  { id: "w1", en: "accommodate", ko: "수용하다 / 맞추다" },
  { id: "w2", en: "retain", ko: "유지하다" },
  { id: "w3", en: "comply", ko: "준수하다" },
  { id: "w4", en: "prompt", ko: "촉구하다 / 즉각적인" },
  { id: "w5", en: "revenue", ko: "수익" },
  { id: "w6", en: "tentative", ko: "잠정적인" },
  { id: "w7", en: "eligible", ko: "자격이 있는" },
  { id: "w8", en: "waive", ko: "면제하다" },
];

export const STICKERS = [1, 2, 4, 5, 6, 8, 9, 11, 12, 15, 16, 18];

export const uid = () => Math.random().toString(36).slice(2, 10);

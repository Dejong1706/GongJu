import type { Course } from "./types";

/** 일정에 쓰는 파스텔 6색 */
export const PALETTE = [
  "#FFA5C3",
  "#C9A7E8",
  "#9EDCC4",
  "#FFCE9E",
  "#A9C9F5",
  "#FFE9A0",
];

/** 학기 시작일. 주차 계산의 기준이므로 반드시 월요일로 맞춘다. */
export const SEM_START = new Date(2026, 7, 31);
export const SEM_WEEKS = 15;
export const SEM_NAME = "2학기";

/**
 * 시간표. 아직 편집 화면이 없어서 코드에 둔다.
 * days: 0=일 ~ 6=토
 */
export const COURSES: Course[] = [
  {
    id: "c1",
    name: "경영학원론",
    short: "경영",
    color: "#FF8FBC",
    days: [1, 3],
    time: "19:00",
  },
  {
    id: "c2",
    name: "경제학",
    short: "경제",
    color: "#C9A7E8",
    days: [2],
    time: "19:00",
  },
  {
    id: "c3",
    name: "컴퓨터개론",
    short: "컴개",
    color: "#9EDCC4",
    days: [4],
    time: "20:40",
  },
  {
    id: "c4",
    name: "영어회화",
    short: "영회",
    color: "#FFCE9E",
    days: [5],
    time: "19:00",
  },
];

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
    id: "apac",
    name: "아태지역통상론",
    short: "아태",
    color: "#F58A80",
    days: [2],
    start: "19:30",
    end: "20:45",
    building: "숭덕경상관",
    room: "02110",
  },
  {
    id: "bizeng",
    name: "국제비즈니스영어",
    short: "영어",
    color: "#F0C36B",
    days: [3],
    start: "19:30",
    end: "20:45",
    building: "숭덕경상관",
    room: "02201",
  },
  {
    id: "startup",
    name: "혁신과기업가정신",
    short: "혁신",
    color: "#9CCB6B",
    days: [4],
    start: "19:30",
    end: "21:15",
    building: "조만식기념관",
    room: "12203",
  },
  {
    id: "market",
    name: "해외시장조사론",
    short: "해외",
    color: "#6FCFB0",
    days: [6],
    start: "10:30",
    end: "11:45",
    building: "숭덕경상관",
    room: "02111",
  },
  {
    id: "policy",
    name: "통상정책론",
    short: "통상",
    color: "#8FB4F2",
    days: [6],
    start: "12:00",
    end: "13:15",
    building: "숭덕경상관",
    room: "02109",
  },
  {
    id: "trade",
    name: "국제무역이론",
    short: "무역",
    color: "#FFA45C",
    days: [6],
    start: "13:30",
    end: "14:45",
    building: "숭덕경상관",
    room: "02111",
  },
  {
    id: "cte",
    name: "글로벌소통과언어",
    short: "소통",
    color: "#B08BE8",
    days: [6],
    start: "15:00",
    end: "17:45",
    building: "진리관",
    room: "11106",
  },
];

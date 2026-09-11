export const DOW = ["일", "월", "화", "수", "목", "금", "토"];
const DAY_MS = 86_400_000;

export const pad = (n: number) => String(n).padStart(2, "0");

/** Date -> "YYYY-MM-DD" */
export const ymd = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** "YYYY-MM-DD" -> Date (로컬 자정) */
export const parseYmd = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** 달력 6주(42칸) 생성 */
export function monthGrid(year: number, month: number) {
  const first = new Date(year, month - 1, 1);
  const start = new Date(year, month - 1, 1 - first.getDay());
  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    return { date, inMonth: date.getMonth() === month - 1 };
  });
}

/** 학기 시작일 기준 몇 주차인지 */
export const weekOf = (dateStr: string, semStart: Date) =>
  Math.floor((parseYmd(dateStr).getTime() - semStart.getTime()) / (7 * DAY_MS)) + 1;

/** N주차의 월~일 범위 */
export function weekRange(week: number, semStart: Date) {
  const a = new Date(semStart.getTime() + (week - 1) * 7 * DAY_MS);
  const b = new Date(a.getTime() + 6 * DAY_MS);
  return `${a.getMonth() + 1}/${a.getDate()} ~ ${b.getMonth() + 1}/${b.getDate()}`;
}

export const shortDate = (s: string) => {
  const d = parseYmd(s);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

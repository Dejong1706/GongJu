import type { Sprite } from "@/lib/sprites";

export const INK = "#3A2230";

/** 여러 아이템이 같이 쓰는 색. 한 아이템만 쓰는 색은 그 파일에 둔다 */
export const P: Record<string, string> = {
  K: INK,
  W: "#FFFFFF",
  N: "#FFD34D",
  n: "#E5A93A",   // 유치원 노랑
  U: "#6FA8DC",
  u: "#4A7DB5",   // 멜빵바지
  G: "#7FBF8F",
  g: "#5A9A6A",   // 잎 · 진한 잎
  T: "#D98E6A",   // 화분 흙
  /*
   * 가구는 흰색이다. 흰 가구는 밝은 벽지·타일 위에서 통째로 묻히므로
   * **h 로 실루엣 둘레를 한 겹 두른다.** 이게 없으면 민무늬 벽에서 가구가 사라진다.
   */
  H: "#FDFAFC",
  h: "#D5C7D0",   // 가구 · 가구 테두리
  R: "#E2648F",   // 책 더미
  Q: "#F6A8C6",
  q: "#E08AAC",   // 러그
  Z: "#C89B6A",
  z: "#A97C4E",   // 곰 인형
  p: "#FFA5C3",   // 인형 코
};

/** 그림 줄과 쓸 글자만 주면 P 에서 색을 골라 붙인다 */
export const s = (rows: string[], keys: string): Sprite => ({
  rows,
  palette: Object.fromEntries(
    [...keys].map((k) => [k, P[k as keyof typeof P]])
  ),
});

/* 프리미엄 가구(캐노피 침대 · 화장대) 가 같이 쓰는 색 */
export const FURN = {
  h: "#D5C7D0", H: "#FDFAFC", W: "#FFFFFF", Q: "#F6A8C6", q: "#E08AAC",
  c: "#FFD1E3", C: "#F6A8C6", d: "#E2648F", Y: "#E3B85C", K: INK,
  m: "#DDF1F8", M: "#FFFFFF", p: "#FF9EC4", P: "#E2648F", j: "#FFD1E3", J: "#E3B85C",
};

/* ── 왕궁 장식 (9/17) — 궁전 벽지 · 왕실 카펫 · 캐노피 침대에 맞춘 금 ── */
export const GOLD = { Y: "#E3B85C", y: "#B8862B" };

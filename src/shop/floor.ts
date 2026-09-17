import type { Surface } from "./types";

/* 바닥도 벽지처럼 무늬 종류 + 색 목록이다 (wallpaper.ts 참고) */
export const FLOORS: Surface[] = [
  { id: "f0", name: "맨바닥", price: 0, base: "#C2A184" },
  { id: "f1", name: "마루", price: 120, base: "#D2AE8A", accent: "#B28A66", kind: "plank" },
  { id: "f2", name: "체크", price: 160, base: "#F4E2EA", accent: "#E3C3D3", kind: "check" },
  { id: "f3", name: "타일", price: 160, base: "#DDE9EC", accent: "#B9CFD5", kind: "grid" },
  { id: "f4", name: "분홍 카펫", price: 80, base: "#F6CFDF" },
  { id: "f5", name: "잔디", price: 140, base: "#A9D3A0", accent: "#8CBB83", kind: "check" },
  { id: "f6", name: "쪽매 마루", price: 220, base: "#E9D9C6", accent: "#C9AE92", kind: "parquet" },
  // 골드(650) — 금 줄눈 크림 타일, 한 칸 건너 연분홍, 칸마다 분홍 꽃 (9/17 시안실)
  {
    id: "f_flowertile",
    name: "꽃 타일",
    price: 650,
    base: "#FFF6EC",
    accent: "#E6C37A",
    accent2: "#EE6F9E",
    kind: "flowertile",
  },
  // 프리미엄(1,000) — 크림 마루 가운데로 금테 빨간 카펫이 앞까지. accent 가 카펫, accent2 가 금
  {
    id: "f_royal",
    name: "왕실 카펫",
    price: 1000,
    base: "#F3EAE0",
    accent: "#C8384F",
    accent2: "#E8C170",
    kind: "royal",
  },
];

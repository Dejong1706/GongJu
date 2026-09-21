"use client";

import type { TabKey } from "@/lib/types";

const ICONS: Record<TabKey, React.ReactNode> = {
  cal: (
    <svg width="16" height="16" viewBox="0 0 18 18" shapeRendering="crispEdges" fill="currentColor">
      <rect x="1" y="3" width="16" height="2" /><rect x="1" y="3" width="2" height="13" />
      <rect x="15" y="3" width="2" height="13" /><rect x="1" y="14" width="16" height="2" />
      <rect x="4" y="0" width="2" height="4" /><rect x="12" y="0" width="2" height="4" />
      <rect x="4" y="8" width="3" height="3" /><rect x="11" y="8" width="3" height="3" />
    </svg>
  ),
  lec: (
    <svg width="16" height="16" viewBox="0 0 18 18" shapeRendering="crispEdges" fill="currentColor">
      <rect x="1" y="2" width="6" height="6" /><rect x="3" y="4" width="2" height="2" fill="#FFD9E8" />
      <rect x="9" y="4" width="8" height="2" /><rect x="1" y="10" width="6" height="6" />
      <rect x="3" y="12" width="2" height="2" fill="#FFD9E8" /><rect x="9" y="12" width="8" height="2" />
    </svg>
  ),
  tt: (
    <svg width="16" height="16" viewBox="0 0 18 18" shapeRendering="crispEdges" fill="currentColor">
      <rect x="1" y="2" width="16" height="2" /><rect x="1" y="2" width="2" height="14" />
      <rect x="15" y="2" width="2" height="14" /><rect x="1" y="14" width="16" height="2" />
      <rect x="1" y="7" width="16" height="2" /><rect x="7" y="2" width="2" height="14" />
    </svg>
  ),
  toeic: (
    <svg width="16" height="16" viewBox="0 0 18 18" shapeRendering="crispEdges" fill="currentColor">
      <rect x="2" y="1" width="14" height="2" /><rect x="2" y="1" width="2" height="16" />
      <rect x="14" y="1" width="2" height="16" /><rect x="2" y="15" width="14" height="2" />
      <rect x="5" y="5" width="8" height="2" /><rect x="5" y="9" width="5" height="2" />
    </svg>
  ),
  panda: (
    <svg width="16" height="16" viewBox="0 0 18 18" shapeRendering="crispEdges" fill="currentColor">
      <rect x="8" y="1" width="2" height="16" /><rect x="1" y="8" width="16" height="2" />
      <rect x="4" y="4" width="2" height="2" /><rect x="12" y="4" width="2" height="2" />
      <rect x="4" y="12" width="2" height="2" /><rect x="12" y="12" width="2" height="2" />
    </svg>
  ),
  event: (
    <svg width="16" height="16" viewBox="0 0 18 18" shapeRendering="crispEdges" fill="currentColor">
      <rect x="2" y="2" width="3" height="14" /><rect x="6" y="3" width="3" height="13" />
      <rect x="10" y="2" width="3" height="14" /><rect x="14" y="4" width="3" height="12" />
    </svg>
  ),
};

const LABELS: [TabKey, string][] = [
  ["cal", "캘린더"],
  ["lec", "강의"],
  ["tt", "시간표"],
  ["toeic", "토익"],
  ["panda", "판다"],
  // 윷놀이 이벤트 — 기간이 끝나면 이 줄과 위 아이콘을 지운다 (탭은 다시 다섯 칸)
  ["event", "이벤트"],
];

export default function TabBar({
  tab,
  onChange,
}: {
  tab: TabKey;
  onChange: (t: TabKey) => void;
}) {
  return (
    <nav className="tabwrap">
      <div className="sprinkle" />
      <div
        className="tabs"
        style={{ gridTemplateColumns: `repeat(${LABELS.length}, 1fr)` }}
      >
        {LABELS.map(([key, label]) => (
          <button
            key={key}
            className={`tab ${tab === key ? "tab-on" : ""}`}
            onClick={() => onChange(key)}
          >
            <span className="tab-ic">{ICONS[key]}</span>
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}

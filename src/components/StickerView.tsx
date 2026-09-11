"use client";

import PixelSprite from "./PixelSprite";
import { PANDA } from "@/lib/sprites";

const Spark = () => (
  <svg
    className="spark"
    viewBox="0 0 24 24"
    shapeRendering="crispEdges"
    fill="#FFD34D"
  >
    <rect x="1" y="0" width="2" height="2" />
    <rect x="0" y="1" width="4" height="1" opacity=".7" />
    <rect x="21" y="3" width="2" height="2" />
    <rect x="20" y="4" width="4" height="1" opacity=".7" />
    <rect x="2" y="20" width="2" height="2" />
    <rect x="1" y="21" width="4" height="1" opacity=".7" />
    <rect x="20" y="19" width="2" height="2" />
    <rect x="19" y="20" width="4" height="1" opacity=".7" />
  </svg>
);

export default function StickerView({
  stickers,
  onToggle,
  today,
}: {
  stickers: number[];
  onToggle: (day: number) => Promise<void>;
  today: Date;
}) {
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const days = new Date(year, month, 0).getDate();

  const filled = [...stickers].sort((a, b) => a - b);
  // 10개째 · 20개째 · 30개째 스티커가 반짝인다
  const glow = new Set([filled[9], filled[19], filled[29]].filter(Boolean));

  const n = stickers.length;
  const remain = 10 - (n % 10);

  const tap = (d: number) => void onToggle(d);

  return (
    <>
      <div className="bubble">
        {n === 0 ? (
          "오늘 잘했으면 눌러주세요"
        ) : n % 10 === 0 ? (
          <>
            <b>{n}개</b> 달성! 반짝반짝
          </>
        ) : (
          <>
            이번 달 <b>{n}개</b> · {remain}개 더 모으면 반짝여요
          </>
        )}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <b className="text-[14px]">
            {year}년 {month}월
          </b>
          <span className="text-[11px] border-2 border-ink bg-band px-2 py-[5px]">
            {n} / {days}
          </span>
        </div>

        <div className="grid grid-cols-5 gap-[7px]">
          {Array.from({ length: days }, (_, i) => {
            const d = i + 1;
            const on = stickers.includes(d);
            return (
              <div
                key={d}
                className={`slot ${on ? "slot-on" : ""} ${
                  glow.has(d) ? "slot-glow" : ""
                } ${d === today.getDate() ? "slot-today" : ""}`}
                onClick={() => tap(d)}
              >
                {on ? (
                  <>
                    <PixelSprite sprite={PANDA} className="stamp" />
                    {glow.has(d) && <Spark />}
                  </>
                ) : (
                  <span className="text-[10px] text-[#D9BFCF]">{d}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

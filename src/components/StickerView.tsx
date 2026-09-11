"use client";

import { useEffect, useRef, useState } from "react";
import Popup from "./Popup";
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
  cursor,
  onMoveMonth,
}: {
  stickers: number[];
  onToggle: (day: number) => Promise<void>;
  today: Date;
  cursor: Date; // 보고 있는 달의 1일
  onMoveMonth: (diff: number) => void;
}) {
  const year = cursor.getFullYear();
  const month = cursor.getMonth() + 1;
  const days = new Date(year, month, 0).getDate();

  // 이번 달을 보고 있을 때만 오늘 칸을 누를 수 있다
  const thisMonth =
    year === today.getFullYear() && month === today.getMonth() + 1;
  const monthKey = `${year}-${month}`;

  const filled = [...stickers].sort((a, b) => a - b);
  // 10개째 · 20개째 · 30개째 스티커가 반짝인다
  const glow = new Set([filled[9], filled[19], filled[29]].filter(Boolean));

  const n = stickers.length;
  const remain = 10 - (n % 10);

  // 스티커는 그날 그날만 붙일 수 있다. 지난 날짜는 잠근다.
  const todayDate = thisMonth ? today.getDate() : 0;
  const stampedToday = stickers.includes(todayDate);

  const [msg, setMsg] = useState("");

  const tap = (d: number) => {
    if (d !== todayDate) return;
    onToggle(d).then(
      () => setMsg(""),
      () => setMsg("저장하지 못했어요")
    );
  };

  // 10개째를 새로 채웠을 때만 축하 창을 띄운다 (0 이면 닫힘)
  const [reward, setReward] = useState(0);
  const prev = useRef<{ key: string; n: number } | null>(null);

  useEffect(() => {
    const before = prev.current;
    prev.current = { key: monthKey, n };
    // 처음 불러온 개수나 달을 옮겨서 바뀐 개수로는 띄우지 않는다
    if (!before || before.key !== monthKey) return;
    if (n > before.n && n % 10 === 0) setReward(n);
  }, [n, monthKey]);

  return (
    <>
      <div className="bubble">
        {!thisMonth ? (
          <>
            {month}월에 <b>{n}개</b> 모았어요
          </>
        ) : !stampedToday ? (
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
        <div className="flex items-center justify-between mb-3 gap-2">
          <button
            className="cal-arrow"
            onClick={() => onMoveMonth(-1)}
            aria-label="지난 달"
          >
            ◀
          </button>
          <b className="text-[13px] text-center flex-1">
            {year}년 {month}월
            <span className="block mt-[3px] text-[10px] font-normal text-ink-soft">
              {n} / {days}
            </span>
          </b>
          <button
            className="cal-arrow"
            onClick={() => onMoveMonth(1)}
            disabled={thisMonth}
            aria-label="다음 달"
          >
            ▶
          </button>
        </div>

        <div className="grid grid-cols-5 gap-[7px]">
          {Array.from({ length: days }, (_, i) => {
            const d = i + 1;
            const on = stickers.includes(d);
            const isToday = d === todayDate;
            return (
              <button
                key={d}
                type="button"
                disabled={!isToday}
                aria-pressed={on}
                aria-label={`${month}월 ${d}일`}
                className={`slot ${on ? "slot-on" : ""} ${
                  glow.has(d) ? "slot-glow" : ""
                } ${isToday ? "slot-today cursor-pointer" : "slot-locked"}`}
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
              </button>
            );
          })}
        </div>

        {msg && <div className="empty text-center">{msg}</div>}
      </div>

      {reward > 0 && (
        <Popup
          title={`판다 ${reward}개 달성!`}
          onClose={() => setReward(0)}
          footer={
            <button className="btn" onClick={() => setReward(0)}>
              좋아요
            </button>
          }
        >
          <div className="text-center py-1">
            <div className="w-[68px] mx-auto mb-3">
              <PixelSprite sprite={PANDA} />
            </div>
            <b className="block text-[12px] leading-[1.8]">
              병근이한테 인증하고
              <br />
              맛있는거 사달라하기
            </b>
          </div>
        </Popup>
      )}
    </>
  );
}

"use client";

import { useMemo, useState } from "react";
import Popup from "./Popup";
import { COURSES, PALETTE } from "@/lib/config";
import { DOW, isSameDay, monthGrid, parseYmd, ymd } from "@/lib/date";
import type { NewEvent, SchoolEvent } from "@/lib/types";

type EditState = {
  id: string | null;
  date: string;
  title: string;
  color: string;
};

export default function CalendarView({
  events,
  onSave,
  onRemove,
  today,
  weekLeft,
}: {
  events: SchoolEvent[];
  onSave: (id: string | null, data: NewEvent) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  today: Date;
  weekLeft: number;
}) {
  const [cursor, setCursor] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [dayOpen, setDayOpen] = useState<Date | null>(null);
  const [edit, setEdit] = useState<EditState | null>(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth() + 1;
  const cells = useMemo(() => monthGrid(year, month), [year, month]);

  const moveMonth = (diff: number) =>
    setCursor(new Date(year, month - 1 + diff, 1));
  const eventsOf = (d: Date) => events.filter((e) => e.date === ymd(d));
  const coursesOf = (d: Date) =>
    COURSES.filter((c) => c.days.includes(d.getDay()));

  const openAdd = (d: Date) =>
    setEdit({ id: null, date: ymd(d), title: "", color: PALETTE[0] });

  const save = async () => {
    if (!edit || !edit.title.trim()) return;
    await onSave(edit.id, {
      date: edit.date,
      title: edit.title.trim(),
      color: edit.color,
    });
    setEdit(null);
  };

  const remove = async () => {
    if (!edit?.id) return;
    await onRemove(edit.id);
    setEdit(null);
  };

  return (
    <>
      <div className="bubble">
        {weekLeft > 0 ? (
          <>
            이번 주 안 들은 강의가 <b>{weekLeft}개</b> 남았어요
          </>
        ) : (
          "이번 주 강의는 다 들었어요"
        )}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-[10px]">
          <button className="cal-arrow" onClick={() => moveMonth(-1)}>
            ◀
          </button>
          <strong className="text-[15px] text-center">
            {year}. {String(month).padStart(2, "0")}
            <span className="block mt-[3px] text-[10px] font-normal text-ink-soft">
              2학기 · 14주 남음
            </span>
          </strong>
          <button className="cal-arrow" onClick={() => moveMonth(1)}>
            ▶
          </button>
        </div>

        <div className="grid grid-cols-7 mb-[3px]">
          {DOW.map((d, i) => (
            <span
              key={d}
              className={`text-center text-[10px] py-[3px] ${
                i === 0 ? "text-pink-deep" : "text-ink-soft"
              }`}
            >
              {d}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-[2px]">
          {cells.map(({ date, inMonth }, i) => {
            const isToday = isSameDay(date, today);
            return (
              <div
                key={i}
                className={`day ${isToday ? "day-today" : ""} ${
                  inMonth ? "" : "opacity-[.28] pointer-events-none"
                }`}
                onClick={() => setDayOpen(date)}
              >
                <span
                  className={`text-[12px] leading-none ${
                    date.getDay() === 0 ? "text-pink-deep" : ""
                  }`}
                >
                  {date.getDate()}
                </span>
                <div className="flex gap-[2px] justify-center min-h-[5px]">
                  {inMonth &&
                    coursesOf(date).map((c) => (
                      <i
                        key={c.id}
                        className="w-[5px] h-[5px]"
                        style={{ background: c.color }}
                      />
                    ))}
                </div>
                <div className="w-full flex flex-col gap-[2px] px-[2px]">
                  {inMonth &&
                    eventsOf(date)
                      .slice(0, 3)
                      .map((e) => (
                        <i
                          key={e.id}
                          className="bar-ev"
                          style={{ background: e.color }}
                        />
                      ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button className="btn" onClick={() => openAdd(today)}>
        일정 추가하기
      </button>

      {/* 날짜 팝업 */}
      {dayOpen && (
        <Popup
          title={`${dayOpen.getMonth() + 1}월 ${dayOpen.getDate()}일 (${
            DOW[dayOpen.getDay()]
          })`}
          onClose={() => setDayOpen(null)}
          footer={
            <button
              className="btn"
              onClick={() => {
                openAdd(dayOpen);
                setDayOpen(null);
              }}
            >
              이 날에 일정 추가
            </button>
          }
        >
          {coursesOf(dayOpen).length > 0 && (
            <>
              <div className="mlabel">수업</div>
              {coursesOf(dayOpen).map((c) => (
                <div key={c.id} className="mrow">
                  <i
                    className="w-[11px] h-[11px] flex-none border border-ink/40"
                    style={{ background: c.color }}
                  />
                  <span className="text-[12px] flex-1">{c.name}</span>
                  <span className="text-[9px] text-ink-soft">{c.time}</span>
                </div>
              ))}
            </>
          )}

          <div className="mlabel">일정</div>
          {eventsOf(dayOpen).length === 0 ? (
            <div className="empty">아직 없어요</div>
          ) : (
            eventsOf(dayOpen).map((e) => (
              <div
                key={e.id}
                className="mrow active:bg-cream"
                onClick={() => {
                  setEdit({
                    id: e.id,
                    date: e.date,
                    title: e.title,
                    color: e.color,
                  });
                  setDayOpen(null);
                }}
              >
                <i
                  className="w-[11px] h-[11px] flex-none border border-ink/40"
                  style={{ background: e.color }}
                />
                <span className="text-[12px] flex-1">{e.title}</span>
                <span className="text-[9px] text-ink-soft">수정</span>
              </div>
            ))
          )}
        </Popup>
      )}

      {/* 일정 입력 팝업 */}
      {edit && (
        <Popup
          title={edit.id ? "일정 수정" : "일정 추가"}
          onClose={() => setEdit(null)}
          footer={
            <>
              <button className="btn" onClick={save}>
                저장하기
              </button>
              {edit.id && (
                <button className="btn btn-danger" onClick={remove}>
                  삭제하기
                </button>
              )}
            </>
          }
        >
          <div className="field">
            <label>날짜</label>
            <input
              type="date"
              value={edit.date}
              onChange={(e) => setEdit({ ...edit, date: e.target.value })}
            />
          </div>
          <div className="field">
            <label>제목</label>
            <input
              value={edit.title}
              placeholder="중간고사"
              onChange={(e) => setEdit({ ...edit, title: e.target.value })}
            />
          </div>
          <div className="field">
            <label>색상</label>
            <div className="flex gap-[7px]">
              {PALETTE.map((c) => (
                <button
                  key={c}
                  className="w-full aspect-square border-2 border-ink"
                  style={{
                    background: c,
                    boxShadow:
                      c === edit.color
                        ? "inset 0 0 0 3px #fff, 0 0 0 2px #6E3D57"
                        : undefined,
                  }}
                  onClick={() => setEdit({ ...edit, color: c })}
                  aria-label={`색상 ${c}`}
                />
              ))}
            </div>
          </div>
          <div className="empty text-center">
            {parseYmd(edit.date).getMonth() + 1}월{" "}
            {parseYmd(edit.date).getDate()}일에 저장됩니다
          </div>
        </Popup>
      )}
    </>
  );
}

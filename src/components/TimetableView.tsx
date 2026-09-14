"use client";

import Image from "next/image";
import { COURSES } from "@/lib/config";
import { DOW } from "@/lib/date";
import type { Course } from "@/lib/types";

/** 월요일부터 훑고 일요일로 끝낸다. 수업 없는 요일은 건너뛴다. */
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

/**
 * 요일별 수업. 한 과목이 여러 요일에 걸릴 수 있어서 요일 기준으로 다시 편다.
 * 같은 요일 안에서는 시작 시각 순.
 */
function byDay(day: number) {
  return COURSES.filter((c) => c.days.includes(day)).sort((a, b) =>
    a.start.localeCompare(b.start)
  );
}

function ClassRow({ course: c }: { course: Course }) {
  return (
    <div className="tt-item">
      <i className="tt-bar" style={{ background: c.color }} />
      <span className="tt-time">
        <b>{c.start}</b>
        <span>{c.end}</span>
      </span>
      <span className="tt-main">
        <b className="tt-name">{c.name}</b>
        <span className="tt-place">
          <span className="tt-bld">{c.building}</span>
          <b className="tt-room">{c.room}</b>
        </span>
      </span>
    </div>
  );
}

export default function TimetableView({ today }: { today: Date }) {
  const todayCount = byDay(today.getDay()).length;

  return (
    <>
      {/*
        원본이 1254px 이라 next/image 로 줄여서 내보낸다.
        4분의 1 로 줄면 건물 이름이 뭉개져서 여기서는 부드럽게 깐다.
      */}
      <div className="tt-map">
        <Image
          src="/map.png"
          alt="숭실대학교 캠퍼스 지도"
          width={1254}
          height={1254}
          sizes="(max-width: 420px) 100vw, 393px"
        />
      </div>

      <div className="bubble">
        {todayCount > 0 ? (
          <>
            오늘 <b>{todayCount}개</b> 수업이 있어요
          </>
        ) : (
          "오늘은 수업이 없어요"
        )}
      </div>

      {WEEK_ORDER.map((day) => {
        const list = byDay(day);
        if (list.length === 0) return null;
        const isToday = day === today.getDay();

        return (
          <div key={day} className="mb-[18px]">
            <div className="wk-head">
              <span>
                <b className="text-[13px]">{DOW[day]}요일</b>
                <span className="ml-[7px] text-[10px] font-normal text-ink-soft">
                  {list.length}개 수업
                </span>
              </span>
              {isToday && <span className="wk-left wk-left-clear">오늘</span>}
            </div>

            {list.map((c) => (
              <ClassRow key={`${day}-${c.id}`} course={c} />
            ))}
          </div>
        );
      })}
    </>
  );
}

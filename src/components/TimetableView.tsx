"use client";

import Image from "next/image";
// 정적 import 라야 흐린 미리보기(blurDataURL)와 크기를 빌드 때 뽑아준다.
// 지도를 갈아끼워도 코드에 적힌 크기가 낡을 일이 없다.
import mapImage from "../../public/map.png";
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
        priority: 시간표 탭의 첫 화면이라 lazy 로 미루지 않는다.
          이 탭을 열 때만 마운트되므로 다른 탭에서는 받지 않는다.
        sizes="250px": 실제 상자는 365px 쯤이지만, 브라우저는 여기에
          화면 배율을 곱해 srcset 에서 고른다. 손그림 지도라 3배까지는
          필요 없어서, 배율 3 인 폰이 750px(57KB) 을 집도록 낮춰 적었다.
          그대로 두면 1200px(104KB) 을 받는다.
      */}
      <div className="tt-map">
        <Image
          src={mapImage}
          alt="숭실대학교 캠퍼스 지도"
          placeholder="blur"
          priority
          sizes="250px"
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

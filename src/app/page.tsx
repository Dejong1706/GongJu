"use client";

import { useState } from "react";
import CalendarView from "@/components/CalendarView";
import LectureView from "@/components/LectureView";
import ToeicView from "@/components/ToeicView";
import StickerView from "@/components/StickerView";
import TabBar from "@/components/TabBar";
import { EVENTS, SEM_START, STICKERS, TASKS, WORDS } from "@/lib/mock";
import { DOW, weekOf, ymd } from "@/lib/date";
import type { SchoolEvent, TabKey, Task, Word } from "@/lib/types";

export default function Home() {
  const [today] = useState(() => new Date());
  const [tab, setTab] = useState<TabKey>("cal");

  // TODO: 다음 단계에서 Firestore 로 교체
  const [events, setEvents] = useState<SchoolEvent[]>(EVENTS);
  const [tasks, setTasks] = useState<Task[]>(TASKS);
  const [words, setWords] = useState<Word[]>(WORDS);
  const [stickers, setStickers] = useState<number[]>(STICKERS);

  const week = weekOf(ymd(today), SEM_START);

  return (
    <div className="device">
      <div className="island" />

      <header className="appbar">
        <div className="sprinkle" />
        <h1 className="font-display text-[13px] leading-[1.4] text-white relative [text-shadow:2px_2px_0_var(--pink-deep)]">
          Study
          <br />
          Diary
        </h1>
        <div className="text-[11px] relative text-right leading-[1.5]">
          {today.getMonth() + 1}월 {today.getDate()}일 {DOW[today.getDay()]}
          <br />
          {week > 0 ? `${week}주차` : "개강 전"}
        </div>
      </header>
      <div className="edge edge-down" />

      <div className={`scroll ${tab === "toeic" ? "flex flex-col" : ""}`}>
        {tab === "cal" && (
          <CalendarView events={events} setEvents={setEvents} today={today} />
        )}
        {tab === "lec" && <LectureView tasks={tasks} setTasks={setTasks} today={today} />}
        {tab === "toeic" && <ToeicView words={words} setWords={setWords} />}
        {tab === "star" && (
          <StickerView stickers={stickers} setStickers={setStickers} today={today} />
        )}
      </div>

      <div className="edge edge-up" />
      <TabBar tab={tab} onChange={setTab} />
    </div>
  );
}

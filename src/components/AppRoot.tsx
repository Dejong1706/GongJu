"use client";

import { useState } from "react";
import CalendarView from "@/components/CalendarView";
import LectureView from "@/components/LectureView";
import ToeicView from "@/components/ToeicView";
import StickerView from "@/components/StickerView";
import TabBar from "@/components/TabBar";
import LoginScreen from "@/components/LoginScreen";
import PixelSprite from "@/components/PixelSprite";
import { BUNNY } from "@/lib/sprites";
import { AuthProvider, useAuth } from "@/lib/auth";
import { useEvents, useStickers, useTasks, useWords } from "@/lib/store";
import { SEM_START } from "@/lib/config";
import { DOW, pad, weekOf, ymd } from "@/lib/date";
import type { TabKey } from "@/lib/types";

export default function AppRoot() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
}

function Root() {
  const { user, loading } = useAuth();
  if (loading) return <Splash />;
  if (!user) return <LoginScreen />;
  return <App uid={user.uid} />;
}

function Splash() {
  return (
    <div className="device">
      <div className="island" />
      <div className="flex-1 flex items-center justify-center">
        <div className="bunny w-[100px]">
          <PixelSprite sprite={BUNNY} />
        </div>
      </div>
    </div>
  );
}

function Loading() {
  return <div className="empty text-center">불러오는 중</div>;
}

function App({ uid }: { uid: string }) {
  const [today] = useState(() => new Date());
  const [tab, setTab] = useState<TabKey>("cal");
  const { logout } = useAuth();

  const monthKey = `${today.getFullYear()}-${pad(today.getMonth() + 1)}`;
  const { events, save: saveEvent, remove: removeEvent } = useEvents(uid);
  const {
    tasks,
    save: saveTask,
    toggle: toggleTask,
    remove: removeTask,
  } = useTasks(uid);
  const { words, add: addWord } = useWords(uid);
  const { days: stickers, toggle: toggleSticker } = useStickers(uid, monthKey);

  const week = weekOf(ymd(today), SEM_START);
  const weekLeft = (tasks ?? []).filter(
    (t) => !t.done && weekOf(t.date, SEM_START) === week
  ).length;

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
        <div className="relative text-right leading-[1.5]">
          <div className="text-[11px]">
            {today.getMonth() + 1}월 {today.getDate()}일 {DOW[today.getDay()]}
            <br />
            {week > 0 ? `${week}주차` : "개강 전"}
          </div>
          <button
            className="mt-1 text-[9px] text-ink-soft underline"
            onClick={() => logout()}
          >
            로그아웃
          </button>
        </div>
      </header>
      <div className="edge edge-down" />

      <div className={`scroll ${tab === "toeic" ? "flex flex-col" : ""}`}>
        {tab === "cal" &&
          (events === null ? (
            <Loading />
          ) : (
            <CalendarView
              events={events}
              onSave={saveEvent}
              onRemove={removeEvent}
              today={today}
              weekLeft={weekLeft}
            />
          ))}

        {tab === "lec" &&
          (tasks === null ? (
            <Loading />
          ) : (
            <LectureView
              tasks={tasks}
              onSave={saveTask}
              onToggle={toggleTask}
              onRemove={removeTask}
              today={today}
            />
          ))}

        {tab === "toeic" &&
          (words === null ? (
            <Loading />
          ) : (
            <ToeicView words={words} onAdd={addWord} today={today} />
          ))}

        {tab === "star" &&
          (stickers === null ? (
            <Loading />
          ) : (
            <StickerView
              stickers={stickers}
              onToggle={toggleSticker}
              today={today}
            />
          ))}
      </div>

      <div className="edge edge-up" />
      <TabBar tab={tab} onChange={setTab} />
    </div>
  );
}

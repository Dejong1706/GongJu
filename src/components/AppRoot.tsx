"use client";

import { useState } from "react";
import CalendarView from "@/components/CalendarView";
import LectureView from "@/components/LectureView";
import TimeView from "@/components/TimeView";
import ToeicView from "@/components/ToeicView";
import PandaView from "@/components/PandaView";
import TabBar from "@/components/TabBar";
import GuidePopup from "@/components/GuidePopup";
import LoginScreen from "@/components/LoginScreen";
import PixelSprite from "@/components/PixelSprite";
import { BUNNY } from "@/lib/sprites";
import { AuthProvider, useAuth } from "@/lib/auth";
import { useEvents, usePet, useRewards, useStickers, useTasks, useWords } from "@/lib/store";
import { useToday } from "@/lib/useToday";
import { SEM_START } from "@/lib/config";
import { DOW, displayWeek, pad, weekOf, ymd } from "@/lib/date";
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
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <div className="bunny w-[100px]">
          <PixelSprite sprite={BUNNY} />
        </div>
        <p className="loading-wait" aria-label="잠깐만">
          <span>잠</span>
          <span>깐</span>
          <span>만</span>
        </p>
      </div>
    </div>
  );
}

function Loading() {
  return <div className="empty text-center">불러오는 중</div>;
}

function Failed() {
  return (
    <div className="empty text-center">
      불러오지 못했어요
      <br />
      인터넷 연결을 확인하고 다시 들어와주세요
    </div>
  );
}

function App({ uid }: { uid: string }) {
  const today = useToday();
  const [tab, setTab] = useState<TabKey>("cal");
  const [guide, setGuide] = useState(false);
  const { logout } = useAuth();

  // 스티커는 지난 달도 넘겨볼 수 있다
  const [starCursor, setStarCursor] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const monthKey = `${starCursor.getFullYear()}-${pad(
    starCursor.getMonth() + 1
  )}`;

  const {
    events,
    error: eventsError,
    save: saveEvent,
    remove: removeEvent,
  } = useEvents(uid);
  const {
    tasks,
    error: tasksError,
    save: saveTask,
    toggle: toggleTask,
    remove: removeTask,
  } = useTasks(uid);
  const {
    words,
    error: wordsError,
    add: addWord,
    update: updateWord,
    remove: removeWord,
  } = useWords(uid);
  const {
    days: stickers,
    error: stickersError,
    toggle: toggleSticker,
  } = useStickers(uid, monthKey);
  const { pet, error: petError, write: writePet } = usePet(uid);
  // 하루에 몇 번까지만 주는 것들 — 토익 퀴즈 만점, 타이머 25분
  const { quiz: rewardQuiz, focus: rewardFocus } = useRewards(uid, pet, ymd(today));

  const week = weekOf(ymd(today), SEM_START);
  /*
   * 캘린더 말풍선은 "안 들은 강의" 만 센다. 과제까지 섞으면 헷갈린다.
   * 주차는 강의 목록과 같은 기준(밀린 것은 이번 주로) 을 쓴다.
   */
  const weekLeft = (tasks ?? []).filter(
    (t) =>
      t.kind === "강의" && !t.done && displayWeek(t, week, SEM_START) === week
  ).length;

  return (
    <div className="device">
      <div className="island" />

      <header className="appbar">
        <div className="sprinkle" />
        <div className="flex flex-col">
          <button type="button" className="guide-btn" onClick={() => setGuide(true)}>
            가이드
          </button>
          <h1 className="font-pixel text-[17px] leading-[1.4] text-white relative [text-shadow:2px_2px_0_var(--pink-deep)]">
            정연공듀
          </h1>
        </div>
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
          (eventsError ? (
            <Failed />
          ) : events === null ? (
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
          (tasksError ? (
            <Failed />
          ) : tasks === null ? (
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

        {/* 시간표도 타이머도 불러올 게 없다 — 하나는 설정값, 하나는 이 폰에만 있다 */}
        {tab === "tt" && <TimeView today={today} onFocus={rewardFocus} />}

        {tab === "toeic" &&
          (wordsError ? (
            <Failed />
          ) : words === null ? (
            <Loading />
          ) : (
            <ToeicView
              words={words}
              onAdd={addWord}
              onUpdate={updateWord}
              onRemove={removeWord}
              today={today}
              onPerfect={rewardQuiz}
            />
          ))}

        {tab === "panda" &&
          (stickersError ? (
            <Failed />
          ) : stickers === null ? (
            <Loading />
          ) : (
            <PandaView
              stickers={stickers}
              onToggleSticker={toggleSticker}
              today={today}
              cursor={starCursor}
              onMoveMonth={(diff) =>
                setStarCursor(
                  (c) => new Date(c.getFullYear(), c.getMonth() + diff, 1)
                )
              }
              pet={pet}
              petError={petError}
              onChangePet={writePet}
            />
          ))}
      </div>

      <div className="edge edge-up" />
      <TabBar tab={tab} onChange={setTab} />

      {/* 헤더 안에 두면 .dim 이 헤더(position: relative) 크기에 갇힌다. 앱 전체를 덮게 여기 둔다 */}
      {guide && <GuidePopup onClose={() => setGuide(false)} />}
    </div>
  );
}

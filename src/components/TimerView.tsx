"use client";

import { useEffect, useRef, useState } from "react";
import ClockFace, { FACE_H, faceWidth } from "./ClockFace";
import { pad } from "@/lib/date";
import { useDayTimer } from "@/lib/timer";

/** 밀리초 → "00:00:00" */
function clockText(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`;
}

/** 시계 아래로 비워둘 자리 — 버튼이 이 안의 한가운데 선다 */
const BELOW = 112;

export default function TimerView({
  today,
  onBack,
}: {
  today: Date;
  onBack: () => void;
}) {
  const { ms, running, start, pause } = useDayTimer(today);

  /*
   * 가로로 쓰는 화면이다.
   *
   * 회전 잠금이 켜져 있으면 폰을 눕혀도 브라우저는 계속 세로라서 `(orientation: landscape)`
   * 가 영영 안 맞는다. 그래서 방향을 미디어쿼리로 묻지 않고 **자리가 세로로 길면 시계를
   * 직접 90도 돌린다.** 잠금이 꺼져 있으면 눕히는 순간 자리가 가로로 길어져 안 돌린 채로 맞는다.
   * 어느 쪽이든 폰을 눕히면 똑바로 읽힌다.
   *
   * 돌리는 방향이 시계방향이라 폰은 반대로 — 왼쪽으로 눕혀야 한다.
   */
  const stage = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) =>
      setBox({ w: e.contentRect.width, h: e.contentRect.height })
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const text = clockText(ms);
  const ratio = faceWidth(text) / FACE_H;

  const turned = box.h > box.w;
  const panelW = turned ? box.h : box.w;
  const panelH = turned ? box.w : box.h;

  // 폭도 높이도 안 넘치는 선에서 제일 크게
  const clockW = Math.max(
    140,
    Math.min(panelW * 0.92, Math.max(34, panelH - BELOW) * ratio)
  );
  // 버튼은 시계 아랫변과 화면 바닥의 딱 중간. 시계가 한가운데 있으니 이렇게 나온다
  const keysY = panelH * 0.75 + clockW / ratio / 4;

  return (
    <div className="timer-full" ref={stage}>
      <div
        className="timer-panel"
        style={
          turned
            ? {
                top: "50%",
                left: "50%",
                width: box.h,
                height: box.w,
                transform: "translate(-50%,-50%) rotate(90deg)",
              }
            : { top: 0, left: 0, width: box.w, height: box.h }
        }
      >
        <div className="timer-clock" style={{ width: clockW }}>
          <ClockFace text={text} fill="var(--pink)" />
        </div>

        <div className="timer-keys" style={{ top: keysY }}>
          <button
            type="button"
            className="timer-key"
            onClick={running ? pause : start}
          >
            {running ? "일시정지" : "시작하기"}
          </button>
          <button
            type="button"
            className="timer-key timer-key-quiet"
            onClick={onBack}
          >
            돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}

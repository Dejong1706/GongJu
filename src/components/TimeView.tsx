"use client";

import { useState } from "react";
import TimetableView from "./TimetableView";
import TimerView from "./TimerView";

type Sub = "tt" | "timer";

/**
 * 시간 탭의 껍데기 — 시간표(수업 시간) 와 타이머(공부 시간).
 *
 * 타이머를 아래 탭으로 빼면 여섯 칸이 돼서 번잡했다. 판다(스티커/키우기) 처럼 안에 나눠 넣는다.
 * 탭을 옮기면 화면이 언마운트되지만 타이머는 흐른 시간이 아니라 시작한 시각을
 * localStorage 에 들고 있어서, 여기서 왔다 갔다 해도 시간이 안 끊긴다.
 */
export default function TimeView({
  today,
  onFocus,
}: {
  today: Date;
  onFocus?: (times: number) => Promise<number> | void;
}) {
  // 탭 이름이 시간표라 그쪽을 먼저 연다
  const [sub, setSub] = useState<Sub>("tt");

  return (
    <>
      <div className="seg">
        {(
          [
            ["tt", "시간표"],
            ["timer", "타이머"],
          ] as [Sub, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={sub === key ? "seg-on" : ""}
            aria-pressed={sub === key}
            onClick={() => setSub(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {sub === "tt" ? (
        <TimetableView today={today} />
      ) : (
        <TimerView today={today} onBack={() => setSub("tt")} onFocus={onFocus} />
      )}
    </>
  );
}

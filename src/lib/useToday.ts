"use client";

import { useEffect, useState } from "react";
import { isSameDay } from "./date";

/**
 * 자정이 지나면 스스로 갱신되는 오늘 날짜.
 * 앱을 켜둔 채 하루가 넘어가도 날짜·주차·스티커가 어제에 머물지 않는다.
 */
export function useToday() {
  const [today, setToday] = useState(() => new Date());

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const sync = () => {
      clearTimeout(timer);
      const now = new Date();
      setToday((prev) => (isSameDay(prev, now) ? prev : now));

      const nextDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1
      ).getTime();
      timer = setTimeout(sync, nextDay - now.getTime() + 500);
    };

    sync();

    // 화면이 꺼진 동안에는 타이머가 밀릴 수 있어 돌아올 때 다시 맞춘다
    const wake = () => {
      if (document.visibilityState === "visible") sync();
    };
    document.addEventListener("visibilitychange", wake);
    window.addEventListener("focus", wake);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", wake);
      window.removeEventListener("focus", wake);
    };
  }, []);

  return today;
}

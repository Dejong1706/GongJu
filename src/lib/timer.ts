"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ymd } from "./date";

/**
 * 하루짜리 스톱워치.
 *
 * 기록은 남기지 않는다. 오늘 잰 시간만 들고 있다가 날짜가 바뀌면 0 으로 돌아간다.
 * Firestore 가 아니라 localStorage 에 두는 이유 — 남길 값이 아니고,
 * 초 단위로 쓰면 쓰기 횟수만 먹는다.
 *
 * 저장하는 건 두 개뿐이다. `acc`(멈춰 있던 동안 쌓인 시간) 와
 * `since`(지금 돌고 있다면 시작한 시각). 흐른 시간을 저장하지 않고 시계로 다시 재기 때문에
 * 앱을 닫아두거나 화면이 꺼져 있어도 시간이 밀리지 않는다.
 */
const KEY = "gongju.timer";

type Saved = {
  /** 이 값이 오늘과 다르면 어제 것이다 — 버린다 */
  day: string;
  /** 멈춘 채 쌓아둔 밀리초 */
  acc: number;
  /** 돌고 있으면 시작한 시각, 멈춰 있으면 null */
  since: number | null;
};

function read(): Saved | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Partial<Saved>;
    if (typeof s.day !== "string" || typeof s.acc !== "number") return null;
    return { day: s.day, acc: s.acc, since: typeof s.since === "number" ? s.since : null };
  } catch {
    return null;
  }
}

function save(s: Saved) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // 사파리 비공개 모드에서 막힐 수 있다. 화면은 그대로 돌아가야 한다
  }
}

export function useDayTimer(today: Date) {
  const day = ymd(today);
  const [state, setState] = useState<Saved>({ day, acc: 0, since: null });
  const [now, setNow] = useState(() => Date.now());

  /*
   * localStorage 는 첫 렌더가 아니라 여기서 읽는다.
   * useToday 가 자정에 날짜를 바꿔주므로 이 훅도 그때 다시 돈다 — 그게 곧 초기화다.
   */
  useEffect(() => {
    const old = read();
    if (old && old.day === day) {
      setState(old);
    } else {
      // 날이 바뀌었다. 0 부터 다시 — 돌아가는 중이었으면 계속 돌아간다
      const fresh: Saved = { day, acc: 0, since: old?.since ? Date.now() : null };
      setState(fresh);
      save(fresh);
    }
    setNow(Date.now());
  }, [day]);

  // 돌고 있을 때만 다시 그린다. 초만 보여주지만 0.2초마다 맞춰야 숫자가 늦게 안 바뀐다
  useEffect(() => {
    if (!state.since) return;
    const id = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(id);
  }, [state.since]);

  // 화면이 꺼져 있던 동안에는 setInterval 이 멈춘다. 돌아오면 바로 맞춘다
  useEffect(() => {
    const wake = () => setNow(Date.now());
    document.addEventListener("visibilitychange", wake);
    window.addEventListener("focus", wake);
    return () => {
      document.removeEventListener("visibilitychange", wake);
      window.removeEventListener("focus", wake);
    };
  }, []);

  const ms = state.acc + (state.since ? Math.max(0, now - state.since) : 0);

  // 버튼이 늘 최신 값을 보게 한다 (setState 가 반영되기 전에 눌릴 수 있다)
  const latest = useRef({ state, ms });
  latest.current = { state, ms };

  const apply = useCallback((next: Saved) => {
    setState(next);
    save(next);
    setNow(Date.now());
  }, []);

  const start = useCallback(() => {
    const { state: s } = latest.current;
    if (s.since) return;
    apply({ ...s, since: Date.now() });
  }, [apply]);

  const pause = useCallback(() => {
    const { state: s, ms: cur } = latest.current;
    if (!s.since) return;
    apply({ day: s.day, acc: cur, since: null });
  }, [apply]);


  return { ms, running: state.since !== null, start, pause };
}

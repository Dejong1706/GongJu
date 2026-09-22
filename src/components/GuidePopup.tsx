"use client";

import { useState } from "react";
import Popup from "./Popup";
import {
  BONUS,
  BONUS_EVERY,
  FOCUS_CAP,
  FOCUS_MIN,
  PER_FOCUS,
  PER_QUIZ,
  PER_STICKER,
  PER_TASK,
  STREAK_BONUS,
  STREAK_EVERY,
  TASK_CAP,
} from "@/lib/pet";
// 윷놀이 이벤트 — 기간이 끝나면 이 줄과 아래 WAYS 의 이벤트 칸을 지운다
import { PER_WIN } from "@/lib/yut";
import { UPDATES, UPDATE_LABEL, type UpdateKind } from "@/lib/updates";

type Page = "points" | "updates";

/**
 * 이벤트 잠금 (한시적 — 이벤트와 함께 지운다).
 * **정연에게 보이면 안 되는 자리**라 업데이트 내역 맨 아래에 색 없이 붙여둔다.
 * 잠그는 건 그냥 잠그고, **푸는 것만** 네 자리를 받는다.
 */
const LOCK_PW = "2320";

/** 잠금 칸에 붙는 작은 자물쇠 */
function LockMark() {
  return (
    <svg width="11" height="11" viewBox="0 0 18 18" shapeRendering="crispEdges" fill="currentColor" aria-hidden="true">
      <rect x="6" y="2" width="6" height="2" /><rect x="5" y="3" width="2" height="5" />
      <rect x="11" y="3" width="2" height="5" /><rect x="3" y="8" width="12" height="9" />
    </svg>
  );
}

/** 네 자리 비밀번호 창. 폰 자판이 올라오면 창이 가려져서 숫자판을 직접 그린다 */
function LockPad({ onPass, onClose }: { onPass: () => void; onClose: () => void }) {
  const [typed, setTyped] = useState("");
  const [wrong, setWrong] = useState(false);

  const push = (key: string) => {
    if (key === "clear") {
      setTyped("");
      setWrong(false);
      return;
    }
    if (key === "back") {
      setTyped((t) => t.slice(0, -1));
      setWrong(false);
      return;
    }
    if (typed.length >= 4) return;
    setWrong(false);
    const next = typed + key;
    setTyped(next);
    if (next.length < 4) return;

    // 네 자리가 차면 바로 본다. 틀리면 비우고 흔든다
    if (next === LOCK_PW) onPass();
    else
      setTimeout(() => {
        setTyped("");
        setWrong(true);
      }, 120);
  };

  return (
    <Popup title="비밀번호" onClose={onClose}>
      <div className={`pw-dots ${wrong ? "pw-shake" : ""}`}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={`pw-dot ${i < typed.length ? "filled" : ""}`}>
            {i < typed.length ? "●" : ""}
          </span>
        ))}
      </div>
      <div className="pw-msg">{wrong ? "비밀번호가 달라요" : ""}</div>
      <div className="pw-keys">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((n) => (
          <button key={n} type="button" onClick={() => push(n)}>
            {n}
          </button>
        ))}
        <button type="button" className="quiet" onClick={() => push("clear")}>
          지움
        </button>
        <button type="button" onClick={() => push("0")}>
          0
        </button>
        <button type="button" className="quiet" onClick={() => push("back")} aria-label="한 칸 지우기">
          ←
        </button>
      </div>
    </Popup>
  );
}

/*
 * 숫자는 전부 pet.ts 상수에서 가져온다. 값을 바꿔도 가이드를 따로 안 고쳐도 된다.
 * 어디서 · 얼마 · 조건 세 줄로 끊어서 폰에서 한눈에 읽히게 한다.
 */
const WAYS = [
  {
    icon: "🌟",
    name: "칭찬 스티커",
    where: "판다 → 스티커",
    point: PER_STICKER,
    notes: [
      "오늘 칸에 한 장씩",
      `한 달에 ${BONUS_EVERY}장 모을 때마다 +${BONUS}`,
      `${STREAK_EVERY}일 연속으로 붙이면 +${STREAK_BONUS}`,
    ],
  },
  {
    icon: "✅",
    name: "강의 · 과제 · 할일 체크",
    where: "강의 탭",
    point: PER_TASK,
    notes: [`하루 ${TASK_CAP}번까지`],
  },
  {
    icon: "📖",
    name: "토익 퀴즈",
    where: "토익 탭",
    point: PER_QUIZ,
    notes: ["한 문제 맞힐 때마다", `하루 첫 판만 · 최대 ${PER_QUIZ * 5}`],
  },
  {
    icon: "⏱️",
    name: "공부 타이머",
    where: "시간표 → 타이머",
    point: PER_FOCUS,
    notes: [`멈추지 않고 ${FOCUS_MIN}분마다`, `하루 ${FOCUS_CAP}번까지`],
  },
  {
    icon: "🎲",
    name: "윷놀이 이기기",
    where: "이벤트 탭",
    point: PER_WIN,
    notes: ["한 판 이길 때마다", "져도 깎이지 않아요"],
  },
];

/** 한 날짜 안에서 보여줄 순서 */
const KINDS: UpdateKind[] = ["new", "change", "fix"];

/** "2026-09-16" → "9월 16일 화요일" */
const dateLabel = (d: string) => {
  const [y, m, day] = d.split("-").map(Number);
  const dow = "일월화수목금토"[new Date(y, m - 1, day).getDay()];
  return `${m}월 ${day}일 ${dow}요일`;
};

export default function GuidePopup({
  onClose,
  eventLocked,
  onSetEventLock,
}: {
  onClose: () => void;
  /* 이벤트 잠금 (한시적) — 이벤트를 지울 때 이 둘도 지운다 */
  eventLocked: boolean;
  onSetEventLock: (locked: boolean) => void;
}) {
  const [page, setPage] = useState<Page>("points");
  const [pad, setPad] = useState(false);

  return (
    <>
    <Popup title="가이드" onClose={onClose}>
      <div className="guide-tabs">
        {(
          [
            ["points", "포인트 얻기"],
            ["updates", "업데이트 내역"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={page === key ? "on" : ""}
            aria-pressed={page === key}
            onClick={() => setPage(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {page === "points" ? (
        <>
          <ul className="guide-ways">
            {WAYS.map((w) => (
              <li key={w.name} className="guide-way">
                <span className="guide-icon" aria-hidden="true">
                  {w.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="guide-name">{w.name}</div>
                  <div className="guide-where">{w.where}</div>
                  {w.notes.map((n) => (
                    <div key={n} className="guide-note">
                      {n}
                    </div>
                  ))}
                </div>
                <span className="guide-point">+{w.point}</span>
              </li>
            ))}
          </ul>

          <div className="guide-tip">
            <b>알아두기</b>
            <p>스티커를 떼거나 체크를 풀면 받은 포인트도 돌아가요</p>
            <p>산 물건은 벗을 수 있지만 환불은 안 돼요</p>
          </div>
        </>
      ) : (
        <>
        <ol className="guide-log">
          {UPDATES.map((u, i) => (
            <li key={u.date} className="guide-day">
              <div className="guide-day-head">
                <span className="guide-date">{dateLabel(u.date)}</span>
                {i === 0 && <span className="guide-latest">최신</span>}
              </div>
              {/*
               * 줄마다 꼬리표를 붙이면 꼬리표가 글보다 눈에 먼저 들어온다.
               * 종류별로 묶어 소제목을 한 번만 달고, 줄 앞에는 색 점만 둔다
               */}
              {KINDS.map((kind) => {
                const items = u.items.filter((it) => it.kind === kind);
                if (items.length === 0) return null;
                return (
                  <div key={kind} className="guide-group">
                    <div className={`guide-kind guide-kind-${kind}`}>{UPDATE_LABEL[kind]}</div>
                    <ul>
                      {items.map((it) => (
                        <li key={it.text} className={`guide-item guide-item-${kind}`}>
                          {it.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </li>
          ))}
        </ol>

        {/*
         * 이벤트 잠금 (한시적 — 이벤트와 함께 지운다).
         * 목록에서 한 칸 떨어뜨리고 색을 하나도 안 쓴다. 숨기는 방법이 그것뿐이다
         */}
        <div className="lockbox">
          <div className="lockhead">
            <LockMark />
            <span className="lockttl">이벤트</span>
            <span className={`lockchip ${eventLocked ? "" : "open"}`}>
              {eventLocked ? "잠김" : "열림"}
            </span>
          </div>
          <div className="lockbtns">
            <button type="button" disabled={eventLocked} onClick={() => onSetEventLock(true)}>
              잠금
            </button>
            <button type="button" disabled={!eventLocked} onClick={() => setPad(true)}>
              잠금해제
            </button>
          </div>
        </div>
        </>
      )}
    </Popup>

    {/* 이벤트 잠금 (한시적). 가이드 위에 겹쳐 뜬다 — 가이드 안에 두면 좁은 칸에 갇힌다 */}
    {pad && (
      <LockPad
        onClose={() => setPad(false)}
        onPass={() => {
          onSetEventLock(false);
          setPad(false);
        }}
      />
    )}
    </>
  );
}

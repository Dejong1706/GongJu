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

export default function GuidePopup({ onClose }: { onClose: () => void }) {
  const [page, setPage] = useState<Page>("points");

  return (
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
      )}
    </Popup>
  );
}

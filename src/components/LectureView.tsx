"use client";

import { useState } from "react";
import Popup from "./Popup";
import { COURSES, SEM_START } from "@/lib/config";
import { shortDate, weekOf, weekRange, ymd } from "@/lib/date";
import type { NewTask, Task, TaskKind } from "@/lib/types";

type EditState = {
  id: string | null;
  kind: TaskKind;
  courseId: string;
  title: string;
  date: string;
};

export default function LectureView({
  tasks,
  onSave,
  onToggle,
  onRemove,
  today,
}: {
  tasks: Task[];
  onSave: (id: string | null, data: NewTask) => Promise<void>;
  onToggle: (id: string, done: boolean) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  today: Date;
}) {
  const [edit, setEdit] = useState<EditState | null>(null);

  const courseOf = (id: string) =>
    COURSES.find((c) => c.id === id) ?? COURSES[0];

  // 이번 주가 맨 위, 아래로 갈수록 과거
  const weeks = [...new Set(tasks.map((t) => weekOf(t.date, SEM_START)))].sort(
    (a, b) => b - a
  );

  const save = async () => {
    if (!edit || !edit.title.trim()) return;
    const done = edit.id
      ? tasks.find((t) => t.id === edit.id)?.done ?? false
      : false;
    await onSave(edit.id, {
      kind: edit.kind,
      courseId: edit.courseId,
      title: edit.title.trim(),
      date: edit.date,
      done,
    });
    setEdit(null);
  };

  const remove = async () => {
    if (!edit?.id) return;
    await onRemove(edit.id);
    setEdit(null);
  };

  return (
    <>
      <button
        className="btn mb-4"
        onClick={() =>
          setEdit({
            id: null,
            kind: "강의",
            courseId: COURSES[0].id,
            title: "",
            date: ymd(today),
          })
        }
      >
        ＋ 강의 · 과제 추가
      </button>

      {weeks.map((w) => {
        const list = tasks
          .filter((t) => weekOf(t.date, SEM_START) === w)
          .sort(
            (a, b) =>
              Number(a.done) - Number(b.done) || a.date.localeCompare(b.date)
          );
        const left = list.filter((t) => !t.done).length;

        return (
          <div key={w} className="mb-[18px]">
            <div className="wk-head">
              <span>
                <b className="text-[13px]">{w}주차</b>
                <span className="ml-[7px] text-[10px] font-normal text-ink-soft">
                  {weekRange(w, SEM_START)}
                </span>
              </span>
              <span className={`wk-left ${left === 0 ? "wk-left-clear" : ""}`}>
                {left > 0 ? `${left}개 남음` : "다 했어요"}
              </span>
            </div>

            {list.map((t) => {
              const c = courseOf(t.courseId);
              return (
                <div
                  key={t.id}
                  className={`item ${t.done ? "item-done" : ""}`}
                  onClick={() =>
                    setEdit({
                      id: t.id,
                      kind: t.kind,
                      courseId: t.courseId,
                      title: t.title,
                      date: t.date,
                    })
                  }
                >
                  <div
                    className={`check ${t.done ? "check-on" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      void onToggle(t.id, !t.done);
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <span
                      className={`block text-[12px] ${
                        t.done ? "line-through" : ""
                      }`}
                    >
                      {t.title}
                    </span>
                    <span className="block mt-1 text-[10px] text-ink-soft">
                      {c.name} · {shortDate(t.date)}
                    </span>
                  </div>
                  <span className="kind" style={{ background: c.color }}>
                    {t.kind}
                  </span>
                </div>
              );
            })}
          </div>
        );
      })}

      {edit && (
        <Popup
          title={edit.id ? "수정하기" : "강의 · 과제 추가"}
          onClose={() => setEdit(null)}
          footer={
            <>
              <button className="btn" onClick={save}>
                저장하기
              </button>
              {edit.id && (
                <button className="btn btn-danger" onClick={remove}>
                  삭제하기
                </button>
              )}
            </>
          }
        >
          <div className="field">
            <label>종류</label>
            <div className="flex gap-[7px]">
              {(["강의", "과제"] as TaskKind[]).map((k) => (
                <button
                  key={k}
                  className={`toggle-btn ${edit.kind === k ? "toggle-on" : ""}`}
                  onClick={() => setEdit({ ...edit, kind: k })}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label>과목</label>
            <div className="flex gap-[6px] flex-wrap">
              {COURSES.map((c) => (
                <button
                  key={c.id}
                  className={`subj-btn ${
                    edit.courseId === c.id ? "subj-on" : ""
                  }`}
                  onClick={() => setEdit({ ...edit, courseId: c.id })}
                >
                  <i
                    className="w-[9px] h-[9px] block flex-none"
                    style={{ background: c.color }}
                  />
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label>제목</label>
            <input
              value={edit.title}
              placeholder="마케팅 기초"
              onChange={(e) => setEdit({ ...edit, title: e.target.value })}
            />
          </div>

          <div className="field">
            <label>날짜</label>
            <input
              type="date"
              value={edit.date}
              onChange={(e) => setEdit({ ...edit, date: e.target.value })}
            />
          </div>

          <div className="empty text-center">
            {weekOf(edit.date, SEM_START)}주차에 들어갑니다
          </div>
        </Popup>
      )}
    </>
  );
}

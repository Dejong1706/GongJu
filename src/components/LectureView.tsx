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
  const [msg, setMsg] = useState("");

  const openEdit = (next: EditState) => {
    setEdit(next);
    setMsg("");
  };

  const courseOf = (id: string) =>
    COURSES.find((c) => c.id === id) ?? COURSES[0];

  // 오늘이 몇 주차인지
  const curWeek = weekOf(ymd(today), SEM_START);

  // 종료일이 따로 없으니, 아직 체크 못 한 지난 주차 항목은 이번 주차로 끌어온다
  const displayWeek = (t: Task) => {
    const w = weekOf(t.date, SEM_START);
    return !t.done && w < curWeek ? curWeek : w;
  };

  // 이번 주가 맨 위, 아래로 갈수록 과거
  const weeks = [...new Set(tasks.map(displayWeek))].sort((a, b) => b - a);

  const save = async () => {
    if (!edit) return;
    if (!edit.title.trim()) {
      setMsg("제목을 적어주세요");
      return;
    }
    const done = edit.id
      ? tasks.find((t) => t.id === edit.id)?.done ?? false
      : false;
    try {
      await onSave(edit.id, {
        kind: edit.kind,
        courseId: edit.courseId,
        title: edit.title.trim(),
        date: edit.date,
        done,
      });
      setEdit(null);
    } catch {
      setMsg("저장하지 못했어요");
    }
  };

  const remove = async () => {
    if (!edit?.id) return;
    try {
      await onRemove(edit.id);
      setEdit(null);
    } catch {
      setMsg("삭제하지 못했어요");
    }
  };

  return (
    <>
      <button
        className="btn mb-4"
        onClick={() =>
          openEdit({
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

      {!edit && msg && <div className="empty text-center">{msg}</div>}

      {weeks.map((w) => {
        const list = tasks
          .filter((t) => displayWeek(t) === w)
          .sort(
            (a, b) =>
              Number(a.done) - Number(b.done) || a.date.localeCompare(b.date)
          );
        const left = list.filter((t) => !t.done).length;

        const renderItem = (t: Task) => {
          const c = courseOf(t.courseId);
          return (
            <div key={t.id} className={`item ${t.done ? "item-done" : ""}`}>
              <button
                type="button"
                aria-label={`${t.title} 다 했는지 표시`}
                aria-pressed={t.done}
                className={`check ${t.done ? "check-on" : ""}`}
                onClick={() => {
                  onToggle(t.id, !t.done).then(
                    () => setMsg(""),
                    () => setMsg("표시를 바꾸지 못했어요")
                  );
                }}
              />
              <button
                type="button"
                className="item-body"
                onClick={() =>
                  openEdit({
                    id: t.id,
                    kind: t.kind,
                    courseId: t.courseId,
                    title: t.title,
                    date: t.date,
                  })
                }
              >
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
              </button>
              <span className="kind" style={{ background: c.color }}>
                {t.kind}
              </span>
            </div>
          );
        };

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

            {(["강의", "과제"] as TaskKind[]).map((kind) => {
              const group = list.filter((t) => t.kind === kind);
              if (group.length === 0) return null;
              return (
                <div key={kind}>
                  <div className="cat-head">{kind}</div>
                  {group.map(renderItem)}
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
            {msg || `${weekOf(edit.date, SEM_START)}주차에 들어갑니다`}
          </div>
        </Popup>
      )}
    </>
  );
}

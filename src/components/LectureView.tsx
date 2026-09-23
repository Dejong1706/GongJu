"use client";

import { useState } from "react";
import Popup from "./Popup";
import { COURSES, SEM_START } from "@/lib/config";
import { displayWeek, shortDate, weekOf, weekRange, ymd } from "@/lib/date";
import type { NewTask, Task, TaskKind } from "@/lib/types";

/** 화면에 묶는 차례이자 팝업 버튼 차례. 종류를 늘리면 두 곳이 같이 는다 */
const KINDS: TaskKind[] = ["강의", "과제", "할일"];

/** 종류 뱃지 색. 한 종류는 한 색으로만 — 과목 색은 이름 앞 네모가 맡는다 */
const KIND_COLOR: Record<TaskKind, string> = {
  강의: "var(--band)",
  과제: "#FFE9A0",
  할일: "var(--mint)",
};

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
  onToggle: (id: string, done: boolean, today: string) => Promise<number>;
  onRemove: (id: string, today: string) => Promise<void>;
  today: Date;
}) {
  const [edit, setEdit] = useState<EditState | null>(null);
  const [msg, setMsg] = useState("");
  /*
   * 저장이 끝나기 전의 체크 칸. 트랜잭션은 서버를 다녀와야 화면에 반영되니
   * 그동안 누른 모양을 먼저 보여주고, 또 누르는 것은 받지 않는다
   */
  const [busy, setBusy] = useState<Record<string, boolean>>({});

  const openEdit = (next: EditState) => {
    setEdit(next);
    setMsg("");
  };

  // 할일은 courseId 가 비어 있다. 못 찾으면 과목 없이 보여준다
  const courseOf = (id: string) => COURSES.find((c) => c.id === id) ?? null;

  // 오늘이 몇 주차인지
  const curWeek = weekOf(ymd(today), SEM_START);

  const weekOfTask = (t: Task) => displayWeek(t, curWeek, SEM_START);

  // 이번 주가 맨 위, 아래로 갈수록 과거
  const weeks = [...new Set(tasks.map((t) => weekOfTask(t)))].sort(
    (a, b) => b - a
  );

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
    // 다 했다고 표시돼 있었으면 받은 점수도 같이 돌려준다 — 체크 여부는 저장하는 쪽이 다시 읽는다
    try {
      await onRemove(edit.id, ymd(today));
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
        ＋ 강의 · 과제 · 할일 추가
      </button>

      {!edit && msg && <div className="empty text-center">{msg}</div>}

      {weeks.map((w) => {
        const list = tasks
          .filter((t) => weekOfTask(t) === w)
          .sort(
            (a, b) =>
              Number(a.done) - Number(b.done) || a.date.localeCompare(b.date)
          );
        const left = list.filter((t) => !t.done).length;

        const renderItem = (t: Task) => {
          const c = courseOf(t.courseId);
          const done = busy[t.id] ?? t.done;
          return (
            <div key={t.id} className={`item ${done ? "item-done" : ""}`}>
              <button
                type="button"
                aria-label={`${t.title} 다 했는지 표시`}
                aria-pressed={done}
                className={`check ${done ? "check-on" : ""}`}
                onClick={() => {
                  if (t.id in busy) return;
                  const next = !t.done;
                  setBusy((b) => ({ ...b, [t.id]: next }));
                  onToggle(t.id, next, ymd(today))
                    .then(
                      (pay) =>
                        setMsg(
                          next && pay === 0
                            ? "오늘 체크 포인트는 다 받았어요"
                            : ""
                        ),
                      () => setMsg("표시를 바꾸지 못했어요")
                    )
                    .finally(() =>
                      setBusy(({ [t.id]: _, ...rest }) => rest)
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
                  {c && (
                    <i className="course-dot" style={{ background: c.color }} />
                  )}
                  {c ? `${c.name} · ` : ""}
                  {shortDate(t.date)}
                </span>
              </button>
              <span className="kind" style={{ background: KIND_COLOR[t.kind] }}>
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

            {KINDS.map((kind) => {
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
          title={edit.id ? "수정하기" : "강의 · 과제 · 할일 추가"}
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
              {KINDS.map((k) => (
                <button
                  key={k}
                  className={`toggle-btn ${edit.kind === k ? "toggle-on" : ""}`}
                  onClick={() =>
                    setEdit({
                      ...edit,
                      kind: k,
                      // 할일은 과목을 안 고른다. 강의 · 과제로 되돌리면 첫 과목부터
                      courseId:
                        k === "할일" ? "" : edit.courseId || COURSES[0].id,
                    })
                  }
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          {edit.kind !== "할일" && (
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
          )}

          <div className="field">
            <label>제목</label>
            <input
              value={edit.title}
              placeholder={edit.kind === "할일" ? "도서관 책 반납" : "마케팅 기초"}
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

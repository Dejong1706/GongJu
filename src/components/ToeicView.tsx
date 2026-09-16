"use client";

import { PER_QUIZ } from "@/lib/pet";
import { useRef, useState } from "react";
import Popup from "./Popup";
import PixelSprite from "./PixelSprite";
import { BUNNY } from "@/lib/sprites";
import type { Word } from "@/lib/types";

/** 한 판에 낼 문제 수. 단어가 모자라면 있는 만큼만 낸다. */
const QN = 5;
const shuffle = <T,>(a: T[]) =>
  a
    .map((v) => [Math.random(), v] as const)
    .sort((x, y) => x[0] - y[0])
    .map(([, v]) => v);

const norm = (s: string) => s.trim().toLowerCase();

type Screen = "home" | "quiz" | "result" | "list";

/** 목록에서 고른 단어를 고치는 중일 때의 입력값 */
type EditState = { id: string; en: string; ko: string };

export default function ToeicView({
  words,
  onAdd,
  onUpdate,
  onRemove,
  today,
  onPerfect,
}: {
  words: Word[];
  onAdd: (en: string, ko: string) => Promise<unknown>;
  onUpdate: (id: string, en: string, ko: string) => Promise<unknown>;
  onRemove: (id: string) => Promise<unknown>;
  today: Date;
  /** 다섯 문제를 다 맞혔을 때. 점수가 실제로 붙었으면 true 를 돌려준다 */
  onPerfect?: () => Promise<boolean> | void;
}) {
  const [screen, setScreen] = useState<Screen>("home");
  const [wordOpen, setWordOpen] = useState(false);
  const [en, setEn] = useState("");
  const [ko, setKo] = useState("");
  const [msg, setMsg] = useState("");
  const [jump, setJump] = useState(false);
  const [edit, setEdit] = useState<EditState | null>(null);
  const [editMsg, setEditMsg] = useState("");
  const [find, setFind] = useState("");

  // 이 판에 점수가 붙었는지. 오늘 이미 받았으면 만점이어도 안 붙는다
  const [gained, setGained] = useState(false);
  const [quiz, setQuiz] = useState<Word[]>([]);
  const [qi, setQi] = useState(0);
  const [opts, setOpts] = useState<string[]>([]);
  const [picked, setPicked] = useState<string | null>(null);
  const [marks, setMarks] = useState<boolean[]>([]);
  const enRef = useRef<HTMLInputElement>(null);

  const hop = () => {
    setJump(false);
    requestAnimationFrame(() => setJump(true));
    setTimeout(() => setJump(false), 400);
  };

  // 오늘 / 이번 주 개수는 저장 시각에서 바로 계산한다
  const dayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  ).getTime();
  const weekStart = dayStart - 6 * 86_400_000;
  const todayN = words.filter((w) => w.createdAt >= dayStart).length;
  const weekN = words.filter((w) => w.createdAt >= weekStart).length;

  /** 같은 영단어가 이미 있는지 (자기 자신은 빼고) */
  const duplicateOf = (text: string, exceptId?: string) =>
    words.find((w) => w.id !== exceptId && norm(w.en) === norm(text));

  const saveWord = async () => {
    const e = en.trim();
    const k = ko.trim();
    if (!e || !k) {
      setMsg("단어와 뜻을 모두 적어주세요");
      return;
    }
    const same = duplicateOf(e);
    if (same) {
      setMsg(`이미 있어요 · ${same.en} : ${same.ko}`);
      return;
    }
    try {
      await onAdd(e, k);
      // 저장이 끝난 다음에 지운다. 실패하면 적은 내용이 남아 있어야 한다.
      setEn("");
      setKo("");
      enRef.current?.focus();
      hop();
      setMsg(`${e} 저장했어요`);
    } catch {
      setMsg("저장하지 못했어요");
    }
  };

  const openEdit = (w: Word) => {
    setEdit({ id: w.id, en: w.en, ko: w.ko });
    setEditMsg("");
  };

  const saveEdit = async () => {
    if (!edit) return;
    const e = edit.en.trim();
    const k = edit.ko.trim();
    if (!e || !k) {
      setEditMsg("단어와 뜻을 모두 적어주세요");
      return;
    }
    const same = duplicateOf(e, edit.id);
    if (same) {
      setEditMsg(`이미 있어요 · ${same.en} : ${same.ko}`);
      return;
    }
    try {
      await onUpdate(edit.id, e, k);
      setEdit(null);
    } catch {
      setEditMsg("수정하지 못했어요");
    }
  };

  const removeEdit = async () => {
    if (!edit) return;
    try {
      await onRemove(edit.id);
      setEdit(null);
    } catch {
      setEditMsg("삭제하지 못했어요");
    }
  };

  const makeOptions = (list: Word[], index: number) => {
    const w = list[index];
    // 뜻이 같은 단어를 오답으로 쓰면 보기에 정답이 두 번 나온다. 뜻 기준으로 거른다.
    const seen = new Set([w.ko]);
    const wrong: string[] = [];
    for (const x of shuffle(words)) {
      if (wrong.length === 3) break;
      if (seen.has(x.ko)) continue;
      seen.add(x.ko);
      wrong.push(x.ko);
    }
    setOpts(shuffle([w.ko, ...wrong]));
    setPicked(null);
  };

  const canQuiz = words.length > 0;

  const startQuiz = () => {
    if (!canQuiz) return;
    setGained(false);
    const picked = shuffle([...words]).slice(0, QN);
    setQuiz(picked);
    setQi(0);
    setMarks([]);
    makeOptions(picked, 0);
    setScreen("quiz");
  };

  const answer = (text: string) => {
    if (picked) return;
    setPicked(text);
    setMarks((m) => {
      const next = [...m];
      next[qi] = text === quiz[qi].ko;
      return next;
    });
  };

  // 등록한 단어가 다섯 개가 안 되면 뽑힌 만큼만 푼다
  const total = quiz.length;

  const next = () => {
    if (qi < total - 1) {
      setQi(qi + 1);
      makeOptions(quiz, qi + 1);
    } else {
      setScreen("result");
      hop();
      // 다섯 문제를 다 뽑아 다 맞혔을 때만. 단어가 모자라 세 문제만 푼 판은 안 친다
      if (total === QN && marks.filter(Boolean).length === total) {
        Promise.resolve(onPerfect?.()).then((ok) => setGained(!!ok));
      }
    }
  };

  const right = marks.filter(Boolean).length;
  const wrongWords = quiz.filter((_, i) => !marks[i]);

  if (screen === "list") {
    const key = norm(find);
    // 최근에 등록한 단어가 맨 위로
    const list = [...words]
      .sort((a, b) => b.createdAt - a.createdAt)
      .filter(
        (w) => !key || norm(w.en).includes(key) || w.ko.includes(find.trim())
      );

    return (
      <>
        <div className="flex items-center justify-between mb-[14px]">
          <button
            className="w-[38px] h-[34px] border-[3px] border-ink bg-white text-[11px] shadow-[3px_3px_0_var(--band-dark)]"
            onClick={() => setScreen("home")}
          >
            ✕
          </button>
          <span className="text-[11px]">단어 {words.length}개</span>
          <span className="w-[38px]" />
        </div>

        <div className="field">
          <input
            value={find}
            onChange={(e) => setFind(e.target.value)}
            placeholder="단어나 뜻으로 찾기"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </div>

        {words.length === 0 ? (
          <div className="empty text-center">아직 등록한 단어가 없어요</div>
        ) : list.length === 0 ? (
          <div className="empty text-center">찾는 단어가 없어요</div>
        ) : (
          list.map((w) => (
            <button
              key={w.id}
              type="button"
              className="item"
              onClick={() => openEdit(w)}
            >
              <span className="item-body">
                <span className="block text-[12px] break-all">{w.en}</span>
                <span className="block mt-1 text-[10px] text-ink-soft break-all">
                  {w.ko}
                </span>
              </span>
              <span className="text-[9px] text-ink-soft flex-none">수정</span>
            </button>
          ))
        )}

        {edit && (
          <Popup
            title="단어 고치기"
            onClose={() => setEdit(null)}
            footer={
              <>
                <button className="btn" onClick={saveEdit}>
                  저장하기
                </button>
                <button className="btn btn-danger" onClick={removeEdit}>
                  삭제하기
                </button>
              </>
            }
          >
            <div className="field">
              <label>영단어</label>
              <input
                value={edit.en}
                onChange={(e) => setEdit({ ...edit, en: e.target.value })}
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
              />
            </div>
            <div className="field">
              <label>뜻</label>
              <input
                value={edit.ko}
                onChange={(e) => setEdit({ ...edit, ko: e.target.value })}
              />
            </div>
            <div className="empty text-center">{editMsg}</div>
          </Popup>
        )}
      </>
    );
  }

  if (screen === "quiz") {
    const w = quiz[qi];
    return (
      <>
        <div className="flex items-center justify-between mb-[14px]">
          <button
            className="w-[38px] h-[34px] border-[3px] border-ink bg-white text-[11px] shadow-[3px_3px_0_var(--band-dark)]"
            onClick={() => setScreen("home")}
          >
            ✕
          </button>
          <span className="text-[11px]">
            {qi + 1} / {total}
          </span>
          <span className="flex gap-[3px]">
            {Array.from({ length: total }, (_, i) => (
              <i
                key={i}
                className={`qdot ${
                  marks[i] === true
                    ? "qdot-o"
                    : marks[i] === false
                    ? "qdot-x"
                    : ""
                }`}
              />
            ))}
          </span>
        </div>

        <div className="quiz-word">
          <b className="font-display text-[15px] block break-all">{w.en}</b>
          <span className="block mt-[11px] text-[10px] text-ink-soft">
            뜻을 골라주세요
          </span>
        </div>

        {opts.map((o) => (
          <button
            key={o}
            className={`opt ${picked && o === w.ko ? "opt-right" : ""} ${
              picked === o && o !== w.ko ? "opt-wrong" : ""
            }`}
            onClick={() => answer(o)}
          >
            {o}
          </button>
        ))}

        {picked && (
          <button className="btn" onClick={next}>
            {qi === total - 1 ? "결과 보기" : "다음 문제"}
          </button>
        )}
      </>
    );
  }

  if (screen === "result") {
    return (
      <>
        <div className="score">
          <b className="font-display text-[26px] block mb-3">
            {right}/{total}
          </b>
          <span className="text-[11px]">
            {right === total
              ? "전부 맞았어요!"
              : right >= total - 1
              ? "거의 다 맞았어요"
              : "다시 한 번 볼까요"}
          </span>
          {gained && <span className="got">+{PER_QUIZ}점</span>}
        </div>

        <div className="card">
          {wrongWords.length === 0 ? (
            <div className="empty text-center">틀린 단어가 없어요</div>
          ) : (
            <>
              <div className="mlabel">다시 볼 단어</div>
              {wrongWords.map((w) => (
                <div key={w.id} className="mrow">
                  <span className="text-[12px] flex-1">{w.en}</span>
                  <span className="text-[9px] text-ink-soft">{w.ko}</span>
                </div>
              ))}
            </>
          )}
        </div>

        <button className="btn" onClick={startQuiz}>
          다시 풀기
        </button>
        <button
          className="btn btn-ghost mt-2"
          onClick={() => setScreen("home")}
        >
          그만할래요
        </button>
      </>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="grid grid-cols-2 gap-[11px] mb-2">
        <button
          className="duo-btn"
          onClick={() => {
            setWordOpen(true);
            setMsg("");
          }}
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 20 20"
            shapeRendering="crispEdges"
            fill="#6E3D57"
          >
            <rect x="3" y="2" width="12" height="2" />
            <rect x="3" y="2" width="2" height="16" />
            <rect x="13" y="2" width="2" height="16" />
            <rect x="3" y="16" width="12" height="2" />
            <rect x="6" y="6" width="6" height="2" />
            <rect x="6" y="10" width="4" height="2" />
            <rect x="16" y="8" width="2" height="6" fill="#FF8FBC" />
            <rect x="14" y="10" width="6" height="2" fill="#FF8FBC" />
          </svg>
          단어 등록
        </button>
        <button
          className="duo-btn bg-band"
          onClick={startQuiz}
          disabled={!canQuiz}
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 20 20"
            shapeRendering="crispEdges"
            fill="#6E3D57"
          >
            <rect x="2" y="4" width="16" height="2" />
            <rect x="2" y="4" width="2" height="12" />
            <rect x="16" y="4" width="2" height="12" />
            <rect x="2" y="14" width="16" height="2" />
            <rect x="6" y="8" width="3" height="3" fill="#FF8FBC" />
            <rect x="11" y="8" width="3" height="3" fill="#FF8FBC" />
          </svg>
          랜덤 테스트
        </button>
      </div>

      <button
        className="btn btn-ghost"
        onClick={() => {
          setEdit(null);
          setFind("");
          setScreen("list");
        }}
      >
        등록한 단어 {words.length}개 보기
      </button>

      {!canQuiz && (
        <div className="empty text-center">
          단어를 먼저 등록하면 테스트를 볼 수 있어요
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center gap-[14px] pt-[6px] pb-[10px]">
        <div className="bubble !mb-0">
          오늘 <b>{todayN}개</b> 외웠어요
        </div>
        <div className={`bunny ${jump ? "bunny-jump" : ""}`}>
          <PixelSprite sprite={BUNNY} />
        </div>
        <div className="count">
          <div>
            <b className="block text-[14px] mb-1">{words.length}</b>
            <span className="text-[9px] text-ink-soft">전체</span>
          </div>
          <div>
            <b className="block text-[14px] mb-1">{todayN}</b>
            <span className="text-[9px] text-ink-soft">오늘</span>
          </div>
          <div>
            <b className="block text-[14px] mb-1">{weekN}</b>
            <span className="text-[9px] text-ink-soft">이번 주</span>
          </div>
        </div>
      </div>

      {wordOpen && (
        <Popup
          title="단어 등록"
          onClose={() => setWordOpen(false)}
          footer={
            <button className="btn" onClick={saveWord}>
              저장하고 계속 쓰기
            </button>
          }
        >
          <div className="field">
            <label>영단어</label>
            <input
              ref={enRef}
              value={en}
              onChange={(e) => setEn(e.target.value)}
              placeholder="accommodate"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>
          <div className="field">
            <label>뜻</label>
            <input
              value={ko}
              onChange={(e) => setKo(e.target.value)}
              placeholder="수용하다 / 맞추다"
            />
          </div>
          <div className="empty text-center">{msg}</div>
        </Popup>
      )}
    </div>
  );
}

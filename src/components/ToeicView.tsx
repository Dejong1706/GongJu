"use client";

import { useRef, useState } from "react";
import Popup from "./Popup";
import PixelSprite from "./PixelSprite";
import { BUNNY } from "@/lib/sprites";
import type { Word } from "@/lib/types";

const QN = 5;
const shuffle = <T,>(a: T[]) =>
  a
    .map((v) => [Math.random(), v] as const)
    .sort((x, y) => x[0] - y[0])
    .map(([, v]) => v);

type Screen = "home" | "quiz" | "result";

export default function ToeicView({
  words,
  onAdd,
  today,
}: {
  words: Word[];
  onAdd: (en: string, ko: string) => Promise<unknown>;
  today: Date;
}) {
  const [screen, setScreen] = useState<Screen>("home");
  const [wordOpen, setWordOpen] = useState(false);
  const [en, setEn] = useState("");
  const [ko, setKo] = useState("");
  const [msg, setMsg] = useState("");
  const [jump, setJump] = useState(false);

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

  const saveWord = async () => {
    const e = en.trim();
    const k = ko.trim();
    if (!e || !k) {
      setMsg("단어와 뜻을 모두 적어주세요");
      return;
    }
    setEn("");
    setKo("");
    enRef.current?.focus();
    hop();
    try {
      await onAdd(e, k);
      setMsg(`${e} 저장했어요`);
    } catch {
      setMsg("저장하지 못했어요");
    }
  };

  const makeOptions = (list: Word[], index: number) => {
    const w = list[index];
    const wrong = shuffle(words.filter((x) => x.en !== w.en))
      .slice(0, 3)
      .map((x) => x.ko);
    setOpts(shuffle([w.ko, ...wrong]));
    setPicked(null);
  };

  const startQuiz = () => {
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

  const next = () => {
    if (qi < QN - 1) {
      setQi(qi + 1);
      makeOptions(quiz, qi + 1);
    } else {
      setScreen("result");
      hop();
    }
  };

  const right = marks.filter(Boolean).length;
  const wrongWords = quiz.filter((_, i) => !marks[i]);

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
            {qi + 1} / {QN}
          </span>
          <span className="flex gap-[3px]">
            {Array.from({ length: QN }, (_, i) => (
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
            {qi === QN - 1 ? "결과 보기" : "다음 문제"}
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
            {right}/{QN}
          </b>
          <span className="text-[11px]">
            {right === QN
              ? "전부 맞았어요!"
              : right >= QN - 1
              ? "거의 다 맞았어요"
              : "다시 한 번 볼까요"}
          </span>
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
        <button className="duo-btn bg-band" onClick={startQuiz}>
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

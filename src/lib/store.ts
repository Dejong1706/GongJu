"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  FOCUS_CAP,
  PER_FOCUS,
  PER_QUIZ,
  PER_TASK,
  spotsFromPlaced,
  stickerPoints,
  TASK_CAP,
} from "./pet";
import type { NewEvent, NewTask, Pet, SchoolEvent, Task, Word, YutGame } from "./types";
import { GOAL, HORSES, PER_WIN, WAIT } from "./yut";

/**
 * Firestore 구조
 *
 *   users/{uid}/events/{id}    학교 일정
 *   users/{uid}/tasks/{id}     강의 · 과제 · 할일
 *   users/{uid}/words/{id}     토익 단어
 *   users/{uid}/stickers/{YYYY-MM}  { days: number[] }
 *   users/{uid}/event/yut      윷놀이 이벤트 (문서 하나 · 끝나면 지운다)
 *
 * 사용자가 한 명뿐이라 문서 수가 적다. 월별로 잘라 읽는 대신
 * 컬렉션 전체를 구독하고, 오프라인 캐시로 재방문 시 읽기를 아낀다.
 */
const col = (uid: string, name: string) => collection(db, "users", uid, name);

function useLiveCollection<T>(uid: string, name: string, order: string) {
  const [rows, setRows] = useState<T[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const q = query(col(uid, name), orderBy(order));
    return onSnapshot(
      q,
      (snap) => {
        setError(false);
        setRows(snap.docs.map((d) => ({ id: d.id, ...d.data() } as T)));
      },
      (err) => {
        // 못 읽은 것을 "아직 없어요" 로 보이게 두지 않는다
        console.error(`${name} 구독 실패`, err);
        setError(true);
      }
    );
  }, [uid, name, order]);

  return { rows, error };
}

/* ── 학교 일정 ─────────────────────── */
export function useEvents(uid: string) {
  const { rows: events, error } = useLiveCollection<SchoolEvent>(
    uid,
    "events",
    "date"
  );

  const save = useCallback(
    async (id: string | null, data: NewEvent) => {
      if (id) await updateDoc(doc(db, "users", uid, "events", id), data);
      else await addDoc(col(uid, "events"), data);
    },
    [uid]
  );

  const remove = useCallback(
    (id: string) => deleteDoc(doc(db, "users", uid, "events", id)),
    [uid]
  );

  return { events, error, save, remove };
}

/* ── 강의 · 과제 ───────────────────── */

/**
 * 체크를 풀거나 체크된 과제를 지울 때 판다 문서에 쓸 값. 돌려받을 게 없으면 null.
 *
 * - 준 만큼만 뺀다. paid 가 없는 건 이 규칙 전에 체크한 것이라 PER_TASK 를 줬다고 본다
 * - **오늘 체크한 것을 오늘 풀면 한도도 한 칸 돌려준다.** 잘못 누른 것 때문에 한도가 줄면 안 된다.
 *   어제 체크한 것을 오늘 풀면 점수만 빼고 오늘 한도는 그대로 둔다
 */
function refund(task: Task, pet: Partial<Pet> | undefined, today: string) {
  const paid = task.paid ?? PER_TASK;
  if (paid <= 0) return null;
  const sameDay = task.paidDay === today && pet?.taskDay === today;
  return {
    earned: increment(-paid),
    ...(sameDay ? { taskCount: Math.max(0, (pet?.taskCount ?? 0) - 1) } : {}),
  };
}
export function useTasks(uid: string) {
  const { rows: tasks, error } = useLiveCollection<Task>(uid, "tasks", "date");

  const save = useCallback(
    async (id: string | null, data: NewTask) => {
      if (id) {
        /*
         * 고칠 때는 done 을 안 쓴다. 화면이 들고 있던 옛날 done 으로 덮으면
         * 점수를 돌려받지 않고 체크가 풀려서, 다시 체크해 또 받을 수 있다.
         * done 은 toggle 만 바꾼다.
         */
        const { done: _done, ...rest } = data;
        void _done;
        await updateDoc(doc(db, "users", uid, "tasks", id), rest);
      } else await addDoc(col(uid, "tasks"), { ...data, done: false });
    },
    [uid]
  );

  const petRef = useMemo(() => doc(db, "users", uid, "pet", "state"), [uid]);

  /*
   * 체크하면 주고, 풀면 **그 과제에 실제로 준 만큼** 되돌려받는다.
   *
   * 트랜잭션으로 과제 문서를 다시 읽어서 **이미 그 상태면 아무것도 안 한다.**
   * 예전에는 화면이 들고 있던 done 을 믿고 increment 만 보내서,
   * 화면이 갱신되기 전에 두 번 누르면 20점이 두 번 붙었다.
   *
   * 하루에 점수가 붙는 체크는 TASK_CAP 번까지다. 안 그러면 빈 과제를 만들고 체크하기를
   * 끝없이 되풀이할 수 있다. 얼마를 줬는지(paid) 를 과제에 적어두는 건,
   * 한도를 넘겨 0점으로 체크된 것을 풀 때 20점을 빼앗지 않으려는 것이다.
   *
   * 돌려주는 값은 이번에 준 점수. 체크했는데 0 이면 오늘 한도를 다 쓴 것이다.
   */
  const toggle = useCallback(
    (id: string, done: boolean, today: string) =>
      runTransaction(db, async (tx) => {
        const ref = doc(db, "users", uid, "tasks", id);
        const snap = await tx.get(ref);
        if (!snap.exists()) return 0;
        const task = snap.data() as Task;
        if (!!task.done === done) return 0; // 이미 그렇게 돼 있다 — 연타
        const pet = (await tx.get(petRef)).data() as Partial<Pet> | undefined;

        if (!done) {
          tx.update(ref, { done: false, paid: 0 });
          const back = refund(task, pet, today);
          if (back) tx.set(petRef, back, { merge: true });
          return 0;
        }

        const count = pet?.taskDay === today ? pet.taskCount ?? 0 : 0;
        const pay = count < TASK_CAP ? PER_TASK : 0;
        tx.update(ref, { done: true, paid: pay, paidDay: today });
        if (pay) {
          tx.set(
            petRef,
            { earned: increment(pay), taskDay: today, taskCount: count + 1 },
            { merge: true }
          );
        }
        return pay;
      }),
    [uid, petRef]
  );

  /*
   * 다 했다고 표시된 것을 지우면 점수도 같이 회수한다.
   * 안 그러면 만들고 → 체크하고 → 지우기를 되풀이해 점수를 불릴 수 있다.
   * 체크 여부도 화면 값이 아니라 트랜잭션 안에서 다시 읽는다.
   */
  const remove = useCallback(
    (id: string, today: string) =>
      runTransaction(db, async (tx) => {
        const ref = doc(db, "users", uid, "tasks", id);
        const snap = await tx.get(ref);
        if (!snap.exists()) return;
        const task = snap.data() as Task;
        // 트랜잭션은 읽기를 쓰기보다 먼저 끝내야 한다
        const pet = task.done
          ? ((await tx.get(petRef)).data() as Partial<Pet> | undefined)
          : undefined;
        tx.delete(ref);
        const back = task.done ? refund(task, pet, today) : null;
        if (back) tx.set(petRef, back, { merge: true });
      }),
    [uid, petRef]
  );

  return { tasks, error, save, toggle, remove };
}

/* ── 토익 단어 ─────────────────────── */
export function useWords(uid: string) {
  const { rows: words, error } = useLiveCollection<Word>(
    uid,
    "words",
    "createdAt"
  );

  const add = useCallback(
    (en: string, ko: string) =>
      addDoc(col(uid, "words"), { en, ko, createdAt: Date.now() }),
    [uid]
  );

  const update = useCallback(
    (id: string, en: string, ko: string) =>
      updateDoc(doc(db, "users", uid, "words", id), { en, ko }),
    [uid]
  );

  const remove = useCallback(
    (id: string) => deleteDoc(doc(db, "users", uid, "words", id)),
    [uid]
  );

  return { words, error, add, update, remove };
}

/* ── 칭찬 스티커 ───────────────────── */
export function useStickers(uid: string, monthKey: string) {
  const [days, setDays] = useState<number[] | null>(null);
  const [error, setError] = useState(false);
  const latest = useRef<number[]>([]);

  useEffect(() => {
    setDays(null); // 달을 옮기면 새로 읽는다
    const ref = doc(db, "users", uid, "stickers", monthKey);
    return onSnapshot(
      ref,
      (snap) => {
        const next = (snap.data()?.days as number[] | undefined) ?? [];
        latest.current = next;
        setError(false);
        setDays(next);
      },
      (err) => {
        console.error("stickers 구독 실패", err);
        setError(true);
      }
    );
  }, [uid, monthKey]);

  const toggle = useCallback(
    (d: number) => {
      const cur = latest.current;
      const next = cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d];
      /*
       * 뗄 때는 음수가 된다. 10개째 보너스도, 이어 붙인 날 보너스도
       * **그 달 전체를 다시 계산한 차이**라서 그만큼 그대로 되돌아간다.
       */
      const gain = stickerPoints(next) - stickerPoints(cur);

      latest.current = next;
      setDays(next); // 눌렀을 때 바로 반응하도록

      /*
       * 스티커와 포인트를 한 배치로 묶는다. 따로 쓰면 둘 중 하나만 성공했을 때
       * 붙인 스티커에 점수가 안 붙거나 그 반대가 된다.
       * increment 는 서버에서 더해주므로 지금 값을 읽어올 필요가 없다.
       */
      const batch = writeBatch(db);
      batch.set(doc(db, "users", uid, "stickers", monthKey), { days: next });
      if (gain !== 0) {
        batch.set(
          doc(db, "users", uid, "pet", "state"),
          { earned: increment(gain) },
          { merge: true }
        );
      }
      return batch.commit();
    },
    [uid, monthKey]
  );

  return { days, error, toggle };
}

/* ── 판다 키우기 ───────────────────── */

/** 처음 열었을 때 — 민무늬 벽, 맨바닥, 아무것도 안 걸친 판다 */
export const EMPTY_PET: Pet = {
  earned: 0,
  spent: 0,
  owned: [],
  worn: {},
  spots: [],
  wall: "w0",
  floor: "f0",
};

/**
 * 토익 퀴즈 · 타이머 보상.
 *
 * 스티커·과제와 달리 **하루에 몇 번**이 정해져 있다. 그 기록(언제 줬는지, 몇 번 줬는지)을
 * 판다 문서에 같이 두는 건, 포인트를 건드리는 곳과 세는 곳이 갈리면 어긋나기 때문이다.
 * 날짜는 화면에서 받는다 — 여기서 new Date() 를 부르면 자정을 넘겨도 어제에 머문다.
 */
export function useRewards(uid: string, pet: Pet | null, today: string) {
  const ref = useMemo(() => doc(db, "users", uid, "pet", "state"), [uid]);

  /**
   * 퀴즈 한 판을 끝냈을 때. 맞힌 개수 x PER_QUIZ.
   * 오늘 이미 한 판 쳤으면 아무 일도 안 하고 null. 0개 맞혀도 오늘 기회는 쓴다.
   */
  const quiz = useCallback(
    async (right: number) => {
      if (!pet || pet.quizDay === today) return null;
      const gain = right * PER_QUIZ;
      await setDoc(ref, { earned: increment(gain), quizDay: today }, { merge: true });
      return gain;
    },
    [pet, today, ref],
  );

  /** 일시정지 없이 25분을 채울 때마다. 하루 네 번까지 */
  const focus = useCallback(
    async (times: number) => {
      if (!pet || times <= 0) return 0;
      const done = pet.focusDay === today ? pet.focusCount ?? 0 : 0;
      const give = Math.min(times, FOCUS_CAP - done);
      if (give <= 0) return 0;               // 오늘 네 번을 다 채웠다
      await setDoc(
        ref,
        { earned: increment(PER_FOCUS * give), focusDay: today, focusCount: done + give },
        { merge: true }
      );
      return give;
    },
    [pet, today, ref]
  );

  return { quiz, focus };
}

export function usePet(uid: string) {
  const [pet, setPet] = useState<Pet | null>(null);
  const [error, setError] = useState(false);
  const latest = useRef<Pet>(EMPTY_PET);

  useEffect(() => {
    const ref = doc(db, "users", uid, "pet", "state");
    return onSnapshot(
      ref,
      (snap) => {
        // 문서가 없으면 만들지 않고 기본값으로 읽는다. 처음 사는 순간에 생긴다.
        const raw = snap.data() as (Partial<Pet> & { placed?: Record<string, string | null> }) | undefined;
        const next = { ...EMPTY_PET, ...raw };
        // 자리를 저장하기 전에 놓아둔 것들은 소품마다 정해둔 처음 자리로 옮겨준다
        if (!raw?.spots && raw?.placed) next.spots = spotsFromPlaced(raw.placed);
        latest.current = next;
        setError(false);
        setPet(next);
      },
      (err) => {
        console.error("pet 구독 실패", err);
        setError(true);
      }
    );
  }, [uid]);

  /*
   * earned 만 빼고 쓴다. 통째로 덮으면 방금 붙인 스티커 점수를
   * 화면이 들고 있던 옛날 값으로 되돌려버릴 수 있다.
   * 포인트를 더하는 쪽은 스티커 배치 하나뿐이어야 어긋나지 않는다.
   */
  const write = useCallback(
    (next: Pet) => {
      latest.current = next;
      setPet(next); // 눌렀을 때 바로 반응하도록
      const { earned: _earned, ...rest } = next;
      void _earned;
      return setDoc(doc(db, "users", uid, "pet", "state"), rest, { merge: true });
    },
    [uid]
  );

  return { pet, error, write, latest };
}

/* ── 윷놀이 이벤트 ───────────────────
 * 이벤트가 끝나면 이 훅과 화면을 통째로 지운다.
 * 판을 문서 하나에 통으로 쓰기 때문에 다른 데이터와 섞이지 않는다.
 */

export const EMPTY_GAME: YutGame = {
  turn: "b", // 정연부터 던진다
  horses: { a: Array(HORSES).fill(WAIT), b: Array(HORSES).fill(WAIT) },
  rolls: [],
  pending: true,
  log: [],
  wins: { a: 0, b: 0 },
  winner: null,
  round: 1,
  paid: 0,
};

export function useYut(uid: string) {
  const [game, setGame] = useState<YutGame | null>(null);
  const [error, setError] = useState(false);
  const ref = useMemo(() => doc(db, "users", uid, "event", "yut"), [uid]);

  useEffect(() => {
    return onSnapshot(
      ref,
      (snap) => {
        // 문서가 없으면 만들지 않고 빈 판으로 읽는다. 첫 수를 둘 때 생긴다
        const raw = snap.data() as Partial<YutGame> | undefined;
        setError(false);
        setGame({ ...EMPTY_GAME, ...raw });
      },
      (err) => {
        console.error("yut 구독 실패", err);
        setError(true);
      }
    );
  }, [ref]);

  /** 판을 통째로 덮어쓴다. 판 상태는 조각조각 고치는 게 아니라 늘 통으로 간다 */
  const write = useCallback(
    (next: YutGame) => {
      setGame(next); // 눌렀을 때 바로 반응하도록
      return setDoc(ref, next);
    },
    [ref]
  );

  /**
   * 판이 끝났다. **정연(b) 이 이겼을 때만** 포인트를 준다 (사용자가 정한 규칙 —
   * 져도 깎지 않는다). 포인트를 건드리는 곳이라 배치가 아니라 트랜잭션이다:
   * 판 문서를 다시 읽어 **그 판에 이미 줬으면 아무것도 안 한다.**
   * 두 사람이 같은 계정으로 하다 보면 끝나는 순간이 두 번 눌릴 수 있다.
   */
  const finish = useCallback(
    async (next: YutGame, winner: "a" | "b") => {
      const petRef = doc(db, "users", uid, "pet", "state");
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(ref);
        const cur = { ...EMPTY_GAME, ...(snap.data() as Partial<YutGame> | undefined) };
        if (cur.paidRound === next.round) return; // 이미 끝낸 판이다

        const pay = winner === "b" ? PER_WIN : 0;
        tx.set(ref, {
          ...next,
          winner,
          wins: { ...next.wins, [winner]: next.wins[winner] + 1 },
          paid: cur.paid + pay,
          paidRound: next.round,
        });
        if (pay > 0) tx.set(petRef, { earned: increment(pay) }, { merge: true });
      });
    },
    [ref, uid]
  );

  /** 다음 판. 이긴 쪽이 먼저 던진다 */
  const again = useCallback(
    (cur: YutGame) =>
      write({
        ...EMPTY_GAME,
        turn: cur.winner ?? "b",
        wins: cur.wins,
        paid: cur.paid,
        round: cur.round + 1,
      }),
    [write]
  );

  return { game, error, write, finish, again };
}

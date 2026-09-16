"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import { PER_TASK, monthPoints } from "./pet";
import type { NewEvent, NewTask, Pet, SchoolEvent, Task, Word } from "./types";

/**
 * Firestore 구조
 *
 *   users/{uid}/events/{id}    학교 일정
 *   users/{uid}/tasks/{id}     강의 · 과제
 *   users/{uid}/words/{id}     토익 단어
 *   users/{uid}/stickers/{YYYY-MM}  { days: number[] }
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
export function useTasks(uid: string) {
  const { rows: tasks, error } = useLiveCollection<Task>(uid, "tasks", "date");

  const save = useCallback(
    async (id: string | null, data: NewTask) => {
      if (id) await updateDoc(doc(db, "users", uid, "tasks", id), data);
      else await addDoc(col(uid, "tasks"), data);
    },
    [uid]
  );

  /* 스티커와 같은 규칙 — 체크하면 주고, 풀면 그만큼 되돌려받는다 */
  const toggle = useCallback(
    (id: string, done: boolean) => {
      const batch = writeBatch(db);
      batch.update(doc(db, "users", uid, "tasks", id), { done });
      batch.set(
        doc(db, "users", uid, "pet", "state"),
        { earned: increment(done ? PER_TASK : -PER_TASK) },
        { merge: true }
      );
      return batch.commit();
    },
    [uid]
  );

  /*
   * 다 했다고 표시된 것을 지우면 점수도 같이 회수한다.
   * 안 그러면 만들고 → 체크하고 → 지우기를 되풀이해 점수를 불릴 수 있다.
   */
  const remove = useCallback(
    (id: string, done: boolean) => {
      const ref = doc(db, "users", uid, "tasks", id);
      if (!done) return deleteDoc(ref);
      const batch = writeBatch(db);
      batch.delete(ref);
      batch.set(
        doc(db, "users", uid, "pet", "state"),
        { earned: increment(-PER_TASK) },
        { merge: true }
      );
      return batch.commit();
    },
    [uid]
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
      // 뗄 때는 음수가 된다. 10개째 보너스도 개수로 다시 계산해서 그만큼 되돌린다.
      const gain = monthPoints(next.length) - monthPoints(cur.length);

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
  placed: {},
  wall: "w0",
  floor: "f0",
};

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
        const next = { ...EMPTY_PET, ...(snap.data() as Partial<Pet> | undefined) };
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

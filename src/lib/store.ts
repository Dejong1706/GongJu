"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import type { NewEvent, NewTask, SchoolEvent, Task, Word } from "./types";

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

  const toggle = useCallback(
    (id: string, done: boolean) =>
      updateDoc(doc(db, "users", uid, "tasks", id), { done }),
    [uid]
  );

  const remove = useCallback(
    (id: string) => deleteDoc(doc(db, "users", uid, "tasks", id)),
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
      latest.current = next;
      setDays(next); // 눌렀을 때 바로 반응하도록
      return setDoc(doc(db, "users", uid, "stickers", monthKey), {
        days: next,
      });
    },
    [uid, monthKey]
  );

  return { days, error, toggle };
}

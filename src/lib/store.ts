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

  useEffect(() => {
    const q = query(col(uid, name), orderBy(order));
    return onSnapshot(
      q,
      (snap) => setRows(snap.docs.map((d) => ({ id: d.id, ...d.data() } as T))),
      (err) => {
        console.error(`${name} 구독 실패`, err);
        setRows([]);
      }
    );
  }, [uid, name, order]);

  return rows;
}

/* ── 학교 일정 ─────────────────────── */
export function useEvents(uid: string) {
  const events = useLiveCollection<SchoolEvent>(uid, "events", "date");

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

  return { events, save, remove };
}

/* ── 강의 · 과제 ───────────────────── */
export function useTasks(uid: string) {
  const tasks = useLiveCollection<Task>(uid, "tasks", "date");

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

  return { tasks, save, toggle, remove };
}

/* ── 토익 단어 ─────────────────────── */
export function useWords(uid: string) {
  const words = useLiveCollection<Word>(uid, "words", "createdAt");

  const add = useCallback(
    (en: string, ko: string) =>
      addDoc(col(uid, "words"), { en, ko, createdAt: Date.now() }),
    [uid]
  );

  return { words, add };
}

/* ── 칭찬 스티커 ───────────────────── */
export function useStickers(uid: string, monthKey: string) {
  const [days, setDays] = useState<number[] | null>(null);
  const latest = useRef<number[]>([]);

  useEffect(() => {
    const ref = doc(db, "users", uid, "stickers", monthKey);
    return onSnapshot(
      ref,
      (snap) => {
        const next = (snap.data()?.days as number[] | undefined) ?? [];
        latest.current = next;
        setDays(next);
      },
      (err) => {
        console.error("stickers 구독 실패", err);
        setDays([]);
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

  return { days, toggle };
}

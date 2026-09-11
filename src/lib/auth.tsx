"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { auth } from "./firebase";

type AuthValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthValue>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(
    () =>
      onAuthStateChanged(auth, (u) => {
        setUser(u);
        setLoading(false);
      }),
    []
  );

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  return (
    <Ctx.Provider value={{ user, loading, login, logout: () => signOut(auth) }}>
      {children}
    </Ctx.Provider>
  );
}

/** Firebase 가 뱉는 영어 에러코드를 읽을 수 있는 말로 바꾼다 */
export function loginErrorMessage(code: string) {
  switch (code) {
    case "auth/invalid-email":
      return "이메일 형식이 맞지 않아요";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "이메일이나 비밀번호가 달라요";
    case "auth/too-many-requests":
      return "잠시 후에 다시 해주세요";
    case "auth/network-request-failed":
      return "인터넷 연결을 확인해주세요";
    default:
      return "로그인하지 못했어요";
  }
}

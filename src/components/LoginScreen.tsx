"use client";

import { useState } from "react";
import PixelSprite from "./PixelSprite";
import { BUNNY } from "@/lib/sprites";
import { loginErrorMessage, useAuth } from "@/lib/auth";

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password) {
      setError("이메일과 비밀번호를 적어주세요");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await login(email.trim(), password);
    } catch (e) {
      setError(loginErrorMessage((e as { code?: string }).code ?? ""));
      setBusy(false);
    }
  };

  return (
    <div className="device">
      <div className="island" />
      <div className="edge edge-down" />

      <div className="flex-1 flex flex-col items-center justify-center px-7 gap-5">
        <h1 className="font-pixel text-[26px] leading-[1.5] text-center text-pink [text-shadow:3px_3px_0_#fff,6px_6px_0_var(--band-dark)]">
          정연공듀
        </h1>

        <div className="w-[108px]">
          <PixelSprite sprite={BUNNY} />
        </div>

        <div className="w-full">
          <div className="field">
            <label>이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>
          <div className="field">
            <label>비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </div>

          <div className="empty text-center min-h-[34px]">{error}</div>

          <button className="btn" onClick={submit} disabled={busy}>
            {busy ? "들어가는 중" : "들어가기"}
          </button>
        </div>
      </div>

      <div className="edge edge-up" />
      <div className="h-[34px] bg-band relative">
        <div className="sprinkle" />
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import StickerView from "./StickerView";
import PetView from "./PetView";
import type { Pet } from "@/lib/types";

type Sub = "sticker" | "pet";

export default function PandaView({
  stickers,
  onToggleSticker,
  today,
  cursor,
  onMoveMonth,
  pet,
  petError,
  earned,
  onChangePet,
}: {
  stickers: number[];
  onToggleSticker: (day: number) => Promise<void>;
  today: Date;
  cursor: Date;
  onMoveMonth: (diff: number) => void;
  pet: Pet | null;
  petError: boolean;
  earned: number | null;
  onChangePet: (next: Pet) => Promise<void>;
}) {
  // 매일 하는 일이 스티커라 그쪽을 먼저 연다
  const [sub, setSub] = useState<Sub>("sticker");
  const [msg, setMsg] = useState("");

  return (
    <>
      <div className="seg">
        {(
          [
            ["sticker", "스티커"],
            ["pet", "키우기"],
          ] as [Sub, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={sub === key ? "seg-on" : ""}
            aria-pressed={sub === key}
            onClick={() => {
              setSub(key);
              setMsg("");
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {sub === "sticker" ? (
        <StickerView
          stickers={stickers}
          onToggle={onToggleSticker}
          today={today}
          cursor={cursor}
          onMoveMonth={onMoveMonth}
        />
      ) : petError ? (
        <div className="empty text-center">
          판다를 불러오지 못했어요
          <br />
          인터넷 연결을 확인하고 다시 들어와주세요
        </div>
      ) : pet === null || earned === null ? (
        <div className="empty text-center">불러오는 중</div>
      ) : (
        <>
          <PetView pet={pet} earned={earned} onChange={onChangePet} onError={setMsg} />
          {msg && <div className="empty text-center">{msg}</div>}
        </>
      )}
    </>
  );
}

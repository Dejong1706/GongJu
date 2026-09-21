"use client";

import { useState } from "react";
import Popup from "./Popup";
import PetBar from "./PetBar";
import StickerView from "./StickerView";
import PetView from "./PetView";
import type { Pet } from "@/lib/types";

/*
 * 판다 탭 = 키우기 화면 하나.
 *
 * 9/21 까지는 스티커 / 키우기 두 쪽으로 나뉘어 있었고, 상점 · 옮기기 버튼은 방 위에 떠 있었다.
 * 그 버튼들이 방 앞바닥을 가려서 그 자리에 가구를 못 놓는다는 말을 듣고 (사용자 제안)
 * **나누던 줄을 조작줄로 바꿨다** — 스티커 · 상점 · 옮기기 셋.
 * 스티커는 쪽이 아니라 **큰 팝업**으로 뜬다. 하루 한 번 눌렀다 닫는 일이라 팝업이 맞다.
 */
export default function PandaView({
  stickers,
  onToggleSticker,
  today,
  cursor,
  onMoveMonth,
  pet,
  petError,
  onChangePet,
}: {
  stickers: number[];
  onToggleSticker: (day: number) => Promise<void>;
  today: Date;
  cursor: Date;
  onMoveMonth: (diff: number) => void;
  pet: Pet | null;
  petError: boolean;
  onChangePet: (next: Pet) => Promise<void>;
}) {
  const [sticker, setSticker] = useState(false);
  const [msg, setMsg] = useState("");

  return (
    <>
      {pet === null || petError ? (
        // 방을 못 불러온 동안에도 스티커는 붙일 수 있어야 한다. 조작줄만 먼저 세운다
        <>
          <PetBar onSticker={() => setSticker(true)} />
          <div className="empty text-center">
            {petError ? (
              <>
                판다를 불러오지 못했어요
                <br />
                인터넷 연결을 확인하고 다시 들어와주세요
              </>
            ) : (
              "불러오는 중"
            )}
          </div>
        </>
      ) : (
        <>
          <PetView
            pet={pet}
            onChange={onChangePet}
            onError={setMsg}
            onOpenSticker={() => setSticker(true)}
          />
          {msg && <div className="empty text-center">{msg}</div>}
        </>
      )}

      {sticker && (
        <Popup title="스티커" wide onClose={() => setSticker(false)}>
          <StickerView
            stickers={stickers}
            onToggle={onToggleSticker}
            today={today}
            cursor={cursor}
            onMoveMonth={onMoveMonth}
          />
        </Popup>
      )}
    </>
  );
}

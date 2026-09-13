"use client";

import dynamic from "next/dynamic";
import PixelSprite from "@/components/PixelSprite";
import { BUNNY } from "@/lib/sprites";

/**
 * Firebase 는 브라우저에서만 뜨면 된다.
 * ssr:false 로 두면 빌드할 때 서버가 Firebase 를 건드리지 않는다.
 */
const AppRoot = dynamic(() => import("@/components/AppRoot"), {
  ssr: false,
  loading: () => (
    <div className="device">
      <div className="island" />
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <div className="bunny w-[100px]">
          <PixelSprite sprite={BUNNY} />
        </div>
        <p className="loading-wait" aria-label="잠깐만">
          <span>잠</span>
          <span>깐</span>
          <span>만</span>
        </p>
      </div>
    </div>
  ),
});

export default function Page() {
  return <AppRoot />;
}

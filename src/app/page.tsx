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
      <div className="flex-1 flex items-center justify-center">
        <div className="bunny w-[100px]">
          <PixelSprite sprite={BUNNY} />
        </div>
      </div>
    </div>
  ),
});

export default function Page() {
  return <AppRoot />;
}

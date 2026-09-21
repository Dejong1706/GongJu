"use client";

import dynamic from "next/dynamic";
import Splash from "@/components/Splash";

/**
 * Firebase 는 브라우저에서만 뜨면 된다.
 * ssr:false 로 두면 빌드할 때 서버가 Firebase 를 건드리지 않는다.
 */
const AppRoot = dynamic(() => import("@/components/AppRoot"), {
  ssr: false,
  loading: () => <Splash />,
});

export default function Page() {
  return <AppRoot />;
}

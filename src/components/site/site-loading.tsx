"use client";

import { usePathname } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function SiteLoading() {
  const isHome = usePathname() === "/";

  return <main className={`site-loading${isHome ? " site-loading-home" : " site-loading-page"}`}>
    <LoadingSpinner label={isHome ? "Loading The Weblish" : "Loading page"} dark={isHome} />
  </main>;
}

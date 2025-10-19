"use client";

import { usePathname } from "next/navigation";
import { Header } from "./header";

export function ConditionalHeader() {
  const pathname = usePathname();
  const isHomepage = pathname === "/";

  // Don't render header on homepage
  if (isHomepage) {
    return null;
  }

  return <Header />;
}


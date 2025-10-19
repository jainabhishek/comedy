"use client";

import { usePathname } from "next/navigation";
import { Header } from "./header";

export function ConditionalHeader() {
  const pathname = usePathname();
  const isHomepage = pathname === "/";
  const isAuthPage = pathname.startsWith("/auth");

  // Don't render header on homepage or auth pages
  if (isHomepage || isAuthPage) {
    return null;
  }

  return <Header />;
}


"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export function ConditionalMain({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHomepage = pathname === "/";
  const isAuthPage = pathname.startsWith("/auth");

  // Homepage and auth pages: full width, no padding
  if (isHomepage || isAuthPage) {
    return <main className="min-h-screen">{children}</main>;
  }

  // App pages: container with padding
  return <main className="container mx-auto px-4 py-8 min-h-screen">{children}</main>;
}


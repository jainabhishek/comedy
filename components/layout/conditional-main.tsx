"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export function ConditionalMain({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHomepage = pathname === "/";

  // Homepage: full width, no padding
  if (isHomepage) {
    return <main className="min-h-screen">{children}</main>;
  }

  // App pages: container with padding
  return <main className="container mx-auto px-4 py-8 min-h-screen">{children}</main>;
}


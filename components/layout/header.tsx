"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserMenu } from "@/components/auth/user-menu";

export function Header() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Dashboard" },
    { href: "/workshop", label: "Workshop" },
    { href: "/routines", label: "Routines" },
  ];

  return (
    <header className="glass-strong border-b border-glass-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
              <span className="text-2xl">🎤</span>
              <span className="text-xl font-bold text-primary">Tight 5</span>
            </Link>

            <nav className="flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    pathname === item.href
                      ? "bg-primary text-white shadow-glass"
                      : "text-muted hover:text-foreground hover:bg-glass-bg/30"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden lg:block text-xs text-muted/70">AI-Powered Comedy Writing</span>
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}

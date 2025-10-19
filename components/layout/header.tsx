"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserMenu } from "@/components/auth/user-menu";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Header() {
  const pathname = usePathname();
  const isHomepage = pathname === "/";
  const { data: session, status } = useSession();

  type NavItem = {
    href: string;
    label: string;
    exact?: boolean;
  };

  const navItems: NavItem[] = [
    { href: "/", label: "Home", exact: true },
    { href: "/dashboard", label: "Dashboard" },
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

            {!isHomepage && (
              <nav className="flex items-center gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      (item.exact ? pathname === item.href : pathname.startsWith(item.href))
                        ? "bg-primary text-white shadow-glass"
                        : "text-muted hover:text-foreground hover:bg-glass-bg/30"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            )}
          </div>

          <div className="flex items-center gap-4">
            {!isHomepage && (
              <span className="hidden lg:block text-xs text-muted/70">
                AI-Powered Comedy Writing
              </span>
            )}
            <ThemeToggle />
            {isHomepage && status !== "loading" && !session ? (
              <Link href="/auth/signin">
                <Button size="sm" className="shadow-md">
                  Sign In
                </Button>
              </Link>
            ) : (
              <UserMenu />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

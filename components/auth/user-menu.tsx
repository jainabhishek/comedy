"use client";

import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function UserMenu() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  if (status === "loading") {
    return <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />;
  }

  if (!session) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/auth/signin" });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        {session.user?.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name || "User"}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full border-2 border-primary object-cover"
            unoptimized
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
            {session.user?.name?.[0]?.toUpperCase() || "U"}
          </div>
        )}
        <span className="hidden md:block text-sm font-medium">{session.user?.name}</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-20 animate-scale-in">
            <div className="p-4 border-b">
              <p className="font-medium">{session.user?.name}</p>
              <p className="text-sm text-muted">{session.user?.email}</p>
            </div>
            <div className="p-2">
              <Button variant="secondary" className="w-full justify-start" onClick={handleSignOut}>
                <span className="mr-2">🚪</span>
                Sign Out
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

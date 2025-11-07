"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { UserBadge } from "@/components/user-badge";

export function BrandHeader({ className }: { className?: string }) {
  return (
    <header className={cn("w-full sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b", className)}>
      <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="h-6 w-6 rounded-md bg-primary/20 ring-1 ring-primary/30" />
          <span className="text-sm font-medium tracking-wider text-muted-foreground">CorretorIA</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="text-xs text-muted-foreground">Powered by sowsim</div>
          <UserBadge />
        </div>
      </div>
    </header>
  );
}



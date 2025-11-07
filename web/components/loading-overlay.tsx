"use client";

import { Loader2 } from "lucide-react";

export function LoadingOverlay({ label = "Preparando seu retrato…" }: { label?: string }) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/70 backdrop-blur-sm">
      <div className="flex items-center gap-3 rounded-md border bg-card/80 px-4 py-2 text-sm">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}



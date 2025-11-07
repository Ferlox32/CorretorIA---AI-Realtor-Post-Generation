"use client";

export function UserBadge({ name = "Demo User" }: { name?: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-md border bg-card px-2.5 py-1 text-xs text-muted-foreground">
      <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm bg-primary/15 text-[10px] text-primary">{name[0]}</span>
      <span className="truncate max-w-[10rem]">Conectado como {name}</span>
    </div>
  );
}



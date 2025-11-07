import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t mt-16">
      <div className="mx-auto max-w-4xl px-4 py-8 flex items-center justify-between text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} CorretorIA</span>
        <nav className="flex items-center gap-4">
          <Link href="#" className="hover:text-foreground transition-colors">Privacidade</Link>
          <Link href="#" className="hover:text-foreground transition-colors">Termos</Link>
        </nav>
      </div>
    </footer>
  );
}



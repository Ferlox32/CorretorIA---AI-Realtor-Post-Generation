import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <section className="py-12 md:py-20">
      <div className="space-y-4 text-center md:text-left">
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
          CorretorIA — Sua jornada de retrato profissional
        </h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
          Comece com uma visão geral rápida, depois vamos guiá-lo para fazer upload da sua foto e gerar um retrato de qualidade profissional.
        </p>
      </div>
      <div className="mt-8">
        <Button size="lg" asChild>
          <Link href="/journey">Iniciar jornada</Link>
        </Button>
      </div>
    </section>
  );
}

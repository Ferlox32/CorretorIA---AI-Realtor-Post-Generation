import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function JourneyPage() {
  return (
    <section className="py-12 md:py-20">
      <div className="space-y-4">
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">Antes de começar</h1>
        <div className="text-sm md:text-base text-muted-foreground max-w-2xl space-y-3">
          <p>
            Vamos explicar o que faz um ótimo retrato profissional e como a CorretorIA aprimora sua foto.
          </p>
          <p>
            Você verá uma visão geral breve aqui (adicionaremos seu conteúdo depois), depois prossiga para fazer upload.
          </p>
        </div>
      </div>
      <div className="mt-8">
        <Button size="lg" asChild>
          <Link href="/generate">Continuar</Link>
        </Button>
      </div>
    </section>
  );
}



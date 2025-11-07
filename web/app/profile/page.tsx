import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const portraits = Array.from({ length: 6 }).map((_, i) => ({
  id: i + 1,
  // Square-ish placeholder with subtle variation; using standard <img> to avoid next/image domain config.
  url: `https://picsum.photos/seed/portrait-${i + 1}/800/1000`,
}));

const templates = Array.from({ length: 4 }).map((_, i) => ({
  id: i + 1,
  url: `https://picsum.photos/seed/template-${i + 1}/1200/1200`,
  caption:
    "Empolgado em compartilhar meu novo retrato profissional da CorretorIA — powered by sowsim! #profissional #retrato #marca",
}));

export default function ProfilePage() {
  return (
    <section className="py-12 md:py-20 space-y-10">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">Seu perfil</h1>
          <p className="text-sm md:text-base text-muted-foreground">Todos os seus retratos profissionais e modelos de postagem em um só lugar.</p>
        </div>
        <Link href="/generate" className="text-sm text-primary underline underline-offset-4">Gerar outro</Link>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Seus retratos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {portraits.map((p) => (
            <Card key={p.id} className="overflow-hidden border-muted/60">
              <div className="w-full bg-muted" style={{ aspectRatio: "4 / 5" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt="Retrato" className="h-full w-full object-cover" />
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Modelos para redes sociais</h2>
          <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Ver todos</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.map((t) => (
            <Card key={t.id} className="overflow-hidden border-muted/60">
              <CardHeader className="pb-0">
                <CardTitle className="text-sm text-muted-foreground">Preview do Instagram</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="w-full rounded-md border bg-muted/20" style={{ aspectRatio: "1 / 1" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={t.url} alt="Pré-visualização do modelo" className="h-full w-full object-cover" />
                </div>
                <div className="mt-3 rounded-md border bg-background p-3 text-sm leading-6">
                  {t.caption}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}



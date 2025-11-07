import { UploadCard } from "@/components/upload-card";

export default function GeneratePage() {
  return (
    <section className="py-12 md:py-20">
      <div className="space-y-4">
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
          Gere seu retrato profissional
        </h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
          Faça upload de uma foto clara. Vamos aprimorá-la em um retrato de qualidade profissional, pronto para negócios.
        </p>
      </div>
      <div className="mt-8">
        <UploadCard />
      </div>
    </section>
  );
}



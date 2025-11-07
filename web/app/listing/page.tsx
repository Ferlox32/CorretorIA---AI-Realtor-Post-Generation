import { ListingForm } from "@/components/listing-form";

export default function ListingPage() {
  return (
    <section className="py-12 md:py-20 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">Gerar post de anúncio</h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
          Conte-nos sobre o imóvel e faça upload de uma foto. Vamos criar um post atraente em seguida.
        </p>
      </div>
      <ListingForm />
    </section>
  );
}



"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { ImageIcon, Upload, Copy, RefreshCw, Check } from "lucide-react";
import { isValidImageType, isValidSize, readFileAsDataURL } from "@/lib/validators";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getStoredPortraits, type StoredPortrait } from "@/lib/portrait-storage";

type ListingFormState = {
  title: string;
  description: string;
  propertyType: string;
  price: string;
  currency: string;
  bedrooms: string;
  bathrooms: string;
  area: string;
  areaUnit: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  stateRegion: string;
  postalCode: string;
  country: string;
  yearBuilt: string;
  condition: string;
  availableFrom: string;
  furnished: boolean;
  parking: boolean;
  petFriendly: boolean;
  amenities: Record<string, boolean>;
};

const amenityOptions = [
  "Ar Condicionado",
  "Aquecimento",
  "Máquina de Lavar",
  "Secadora",
  "Lava-Louças",
  "Academia",
  "Piscina",
  "Elevador",
  "Porteiro",
  "Varanda",
  "Jardim",
  "Lareira",
];

type SelectedPhoto = { file: File; dataUrl: string; aspectRatio?: string };

export function ListingForm() {
  const [state, setState] = React.useState<ListingFormState>({
    title: "",
    description: "",
    propertyType: "apartment",
    price: "",
    currency: "USD",
    bedrooms: "",
    bathrooms: "",
    area: "",
    areaUnit: "sqft",
    addressLine1: "",
    addressLine2: "",
    city: "",
    stateRegion: "",
    postalCode: "",
    country: "",
    yearBuilt: "",
    condition: "",
    availableFrom: "",
    furnished: false,
    parking: false,
    petFriendly: false,
    amenities: {},
  });

  const [photo, setPhoto] = React.useState<SelectedPhoto | null>(null);
  const [photoError, setPhotoError] = React.useState<string | null>(null);
  const [dragging, setDragging] = React.useState(false);
  const [showPortraitDialog, setShowPortraitDialog] = React.useState(false);
  const [showSummary, setShowSummary] = React.useState(false);
  const [selectedPortraitId, setSelectedPortraitId] = React.useState<number | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generateError, setGenerateError] = React.useState<string | null>(null);
  const [showResultDialog, setShowResultDialog] = React.useState(false);
  const [generatedListing, setGeneratedListing] = React.useState<{ imageUrl: string; caption: string; cta?: string } | null>(null);
  const generatedImageUrlRef = React.useRef<string | null>(null);
  const [copyImageSuccess, setCopyImageSuccess] = React.useState(false);
  const [copyTextSuccess, setCopyTextSuccess] = React.useState(false);
  const [regenerateLoading, setRegenerateLoading] = React.useState(false);

  // CTA options for the overlay
  const ctaOptions = [
    "Agende uma visita hoje!",
    "Entre em contato para mais informações",
    "Marque uma visita personalizada",
    "Fale com nosso corretor agora",
    "Solicite um tour virtual ou presencial"
  ];

  const update = (field: keyof ListingFormState, value: any) =>
    setState((s) => ({ ...s, [field]: value }));

  const onAmenityToggle = (name: string, checked: boolean) =>
    setState((s) => ({ ...s, amenities: { ...s.amenities, [name]: checked } }));

  const onPhotoInput = async (file: File) => {
    setPhotoError(null);
    if (!isValidImageType(file)) {
      setPhoto(null);
      setPhotoError("Por favor, faça upload de uma imagem JPEG ou PNG.");
      return;
    }
    if (!isValidSize(file, 20 * 1024 * 1024)) {
      setPhoto(null);
      setPhotoError("A foto deve ter no máximo 20MB.");
      return;
    }
    const dataUrl = await readFileAsDataURL(file);
    const dims = await new Promise<{ w: number; h: number }>((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
      img.src = dataUrl;
    });
    const ratio = dims.w && dims.h ? `${dims.w} / ${dims.h}` : undefined;
    setPhoto({ file, dataUrl, aspectRatio: ratio });
  };

  const [storedPortraits, setStoredPortraits] = React.useState<StoredPortrait[]>([]);
  
  React.useEffect(() => {
    // Load stored portraits from localStorage
    const stored = getStoredPortraits();
    setStoredPortraits(stored);
  }, []);

  // Combine stored portraits with dummy portraits
  const allPortraits = React.useMemo(() => {
    const stored = storedPortraits.map((p) => ({ id: p.id, url: p.url }));
    const dummy = Array.from({ length: 8 }).map((_, i) => ({
      id: `dummy-${i + 1}`,
      url: `https://picsum.photos/seed/portrait-${i + 1}/800/1000`,
    }));
    return [...stored, ...dummy];
  }, [storedPortraits]);

  const isComplete = React.useMemo(() => {
    const required: Array<keyof ListingFormState> = [
      "title",
      "propertyType",
      "price",
      "bedrooms",
      "bathrooms",
      "area",
      "addressLine1",
      "city",
      "country",
    ];
    const filled = required.every((k) => String((state as any)[k] || "").trim().length > 0);
    return filled && !!photo;
  }, [state, photo]);

  React.useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    // Prefill common fields for fast dev testing.
    setState((s) => ({
      ...s,
      title: s.title || "Apartamento Moderno 2 Quartos com Vista para a Cidade",
      description: s.description || "Apartamento luminoso e espaçoso de 2 quartos com janelas do chão ao teto, a poucos passos de cafés e transporte público.",
      propertyType: s.propertyType || "apartment",
      price: s.price || "350000",
      bedrooms: s.bedrooms || "2",
      bathrooms: s.bathrooms || "2",
      area: s.area || "85",
      areaUnit: s.areaUnit || "sqm",
      addressLine1: s.addressLine1 || "Rua Principal, 123",
      addressLine2: s.addressLine2 || "Apt 12B",
      city: s.city || "Lisboa",
      stateRegion: s.stateRegion || "",
      postalCode: s.postalCode || "1100-000",
      country: s.country || "Portugal",
      yearBuilt: s.yearBuilt || "2018",
      condition: s.condition || "Recém-reformado",
      availableFrom: s.availableFrom || new Date(Date.now() + 86400000 * 14).toISOString().slice(0, 10),
      furnished: s.furnished ?? true,
      parking: s.parking ?? true,
      petFriendly: s.petFriendly ?? false,
      amenities: Object.keys(s.amenities).length ? s.amenities : {
        "Ar Condicionado": true,
        "Máquina de Lavar": true,
        "Lava-Louças": true,
        "Elevador": true,
        "Varanda": true,
      },
    }));
    // Prefill a dummy photo
    (async () => {
      try {
        if (photo) return;
        const resp = await fetch("https://picsum.photos/seed/listing-dev/1200/900", { cache: "no-store" });
        const blob = await resp.blob();
        const file = new File([blob], "listing-dev.jpg", { type: blob.type || "image/jpeg" });
        await onPhotoInput(file);
      } catch (_) {
        // ignore in dev
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <form className="space-y-8">
      <Card className="border-muted/60">
        <CardHeader>
          <CardTitle className="text-base">Detalhes básicos</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" placeholder="Apartamento 2 quartos ensolarado no Centro" value={state.title} onChange={(e) => update("title", e.target.value)} />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" placeholder="Descreva o imóvel, o bairro, destaques…" value={state.description} onChange={(e) => update("description", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Tipo de imóvel</Label>
            <Select value={state.propertyType} onValueChange={(v) => update("propertyType", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="apartment">Apartamento</SelectItem>
                <SelectItem value="house">Casa</SelectItem>
                <SelectItem value="condo">Condomínio</SelectItem>
                <SelectItem value="loft">Loft</SelectItem>
                <SelectItem value="townhouse">Casa Geminada</SelectItem>
                <SelectItem value="studio">Studio</SelectItem>
                <SelectItem value="land">Terreno</SelectItem>
                <SelectItem value="commercial">Comercial</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Preço</Label>
            <div className="grid grid-cols-3 gap-2">
              <Select value={state.currency} onValueChange={(v) => update("currency", v)}>
                <SelectTrigger className="col-span-1"><SelectValue placeholder="Moeda" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="BRL">BRL</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
              <Input className="col-span-2" id="price" type="number" inputMode="decimal" placeholder="ex.: 350000" value={state.price} onChange={(e) => update("price", e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bedrooms">Quartos</Label>
            <Input id="bedrooms" type="number" inputMode="numeric" placeholder="ex.: 2" value={state.bedrooms} onChange={(e) => update("bedrooms", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bathrooms">Banheiros</Label>
            <Input id="bathrooms" type="number" inputMode="numeric" placeholder="ex.: 2" value={state.bathrooms} onChange={(e) => update("bathrooms", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="area">Área</Label>
            <div className="grid grid-cols-3 gap-2">
              <Input className="col-span-2" id="area" type="number" inputMode="decimal" placeholder="ex.: 85" value={state.area} onChange={(e) => update("area", e.target.value)} />
              <Select value={state.areaUnit} onValueChange={(v) => update("areaUnit", v)}>
                <SelectTrigger className="col-span-1"><SelectValue placeholder="Unidade" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sqft">sqft</SelectItem>
                  <SelectItem value="sqm">sqm</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-muted/60">
        <CardHeader>
          <CardTitle className="text-base">Localização</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="address1">Endereço linha 1</Label>
            <Input id="address1" placeholder="Rua Principal, 123" value={state.addressLine1} onChange={(e) => update("addressLine1", e.target.value)} />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="address2">Endereço linha 2</Label>
            <Input id="address2" placeholder="Apt, suite, etc. (opcional)" value={state.addressLine2} onChange={(e) => update("addressLine2", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Cidade</Label>
            <Input id="city" value={state.city} onChange={(e) => update("city", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stateRegion">Estado/Região</Label>
            <Input id="stateRegion" value={state.stateRegion} onChange={(e) => update("stateRegion", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postalCode">CEP</Label>
            <Input id="postalCode" value={state.postalCode} onChange={(e) => update("postalCode", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">País</Label>
            <Input id="country" value={state.country} onChange={(e) => update("country", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-muted/60">
        <CardHeader>
          <CardTitle className="text-base">Características</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="yearBuilt">Ano de construção</Label>
              <Input id="yearBuilt" type="number" inputMode="numeric" placeholder="ex.: 2015" value={state.yearBuilt} onChange={(e) => update("yearBuilt", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="condition">Condição</Label>
              <Input id="condition" placeholder="ex.: Recém-reformado" value={state.condition} onChange={(e) => update("condition", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="availableFrom">Disponível a partir de</Label>
              <Input id="availableFrom" type="date" value={state.availableFrom} onChange={(e) => update("availableFrom", e.target.value)} />
            </div>
          </div>
          <Separator />
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center justify-between rounded-md border px-3 py-2">
              <div className="space-y-0.5">
                <div className="text-sm">Mobiliado</div>
                <div className="text-xs text-muted-foreground">Inclui móveis essenciais</div>
              </div>
              <Switch checked={state.furnished} onCheckedChange={(v) => update("furnished", v)} />
            </div>
            <div className="flex items-center justify-between rounded-md border px-3 py-2">
              <div className="space-y-0.5">
                <div className="text-sm">Estacionamento</div>
                <div className="text-xs text-muted-foreground">No local ou designado</div>
              </div>
              <Switch checked={state.parking} onCheckedChange={(v) => update("parking", v)} />
            </div>
            <div className="flex items-center justify-between rounded-md border px-3 py-2">
              <div className="space-y-0.5">
                <div className="text-sm">Aceita animais</div>
                <div className="text-xs text-muted-foreground">Permite pets</div>
              </div>
              <Switch checked={state.petFriendly} onCheckedChange={(v) => update("petFriendly", v)} />
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {amenityOptions.map((a) => (
              <label key={a} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                <Checkbox checked={!!state.amenities[a]} onCheckedChange={(v) => onAmenityToggle(a, Boolean(v))} />
                <span>{a}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-muted/60">
        <CardHeader>
          <CardTitle className="text-base">Foto do anúncio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label htmlFor="listing-photo" className="text-xs text-muted-foreground">JPEG ou PNG, máx. 20MB</Label>
            <label
              htmlFor="listing-photo"
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f) void onPhotoInput(f); }}
              className={
                "flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-10 transition-all cursor-pointer select-none " +
                (dragging ? "border-primary bg-primary/5 shadow-sm" : "border-muted/60 bg-muted/10 hover:bg-muted/20 hover:shadow-sm")
              }
            >
              <Upload className="h-5 w-5 text-muted-foreground" />
              <div className="text-sm text-muted-foreground text-center">
                Arraste e solte uma foto aqui
                <span className="mx-1">ou</span>
                <span className="text-foreground underline underline-offset-4">navegue</span>
              </div>
              <input id="listing-photo" type="file" accept="image/png,image/jpeg" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void onPhotoInput(f); }} />
            </label>
          </div>
          <div className="rounded-md border border-muted/60 bg-muted/20 grid place-items-center overflow-hidden" style={{ aspectRatio: photo?.aspectRatio ?? "4 / 3" }}>
            {photo?.dataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo.dataUrl} alt="Pré-visualização do anúncio" className="w-full h-full object-contain" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground p-6 text-center">
                <ImageIcon className="h-8 w-8" />
                <span className="text-xs">A pré-visualização da foto do anúncio aparecerá aqui</span>
              </div>
            )}
          </div>
          {photoError ? <p className="text-xs text-destructive">{photoError}</p> : null}
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row justify-end gap-2">
        {process.env.NODE_ENV !== "production" ? (
          <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={() => setShowPortraitDialog(true)}>
            Dev: Abrir seletor de retrato
          </Button>
        ) : null}
        <Button type="button" className="w-full sm:w-auto" disabled={!isComplete} onClick={() => setShowPortraitDialog(true)}>
          Escolher retrato profissional
        </Button>
      </div>

      <Dialog open={showPortraitDialog} onOpenChange={(o) => { setShowPortraitDialog(o); if (!o) setShowSummary(false); }}>
        <DialogContent className="sm:max-w-[820px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{showSummary ? "Revisar detalhes do anúncio" : "Escolha um retrato profissional"}</DialogTitle>
            <DialogDescription>
              {showSummary ? "Confirme suas informações antes de gerar o post do anúncio." : "Selecione um retrato para usar no seu post."}
            </DialogDescription>
          </DialogHeader>

          {!showSummary ? (
            <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-4">
              {storedPortraits.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Seus retratos gerados</h3>
                  <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    {storedPortraits.map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => setSelectedPortraitId(p.id)}
                        className={cn(
                          "group overflow-hidden rounded-md border transition-all",
                          selectedPortraitId === p.id ? "border-primary ring-2 ring-primary/30" : "border-muted/60 hover:shadow-sm"
                        )}
                      >
                        <div className="w-full bg-muted" style={{ aspectRatio: "4 / 5" }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.url} alt="Retrato gerado" className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {storedPortraits.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Outras opções</h3>
                </div>
              )}
              <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
              {allPortraits.filter((p) => !storedPortraits.some((sp) => sp.id === p.id)).map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setSelectedPortraitId(p.id)}
                  className={cn(
                    "group overflow-hidden rounded-md border transition-all",
                    selectedPortraitId === p.id ? "border-primary ring-2 ring-primary/30" : "border-muted/60 hover:shadow-sm"
                  )}
                >
                  <div className="w-full bg-muted" style={{ aspectRatio: "4 / 5" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt="Opção de retrato" className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]" />
                  </div>
                </button>
              ))}
              </div>
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto pr-1">
              <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">Detalhes do imóvel</h3>
                <div className="rounded-md border p-4">
                  <dl className="grid grid-cols-3 gap-2 text-sm">
                    <dt className="text-muted-foreground">Título</dt><dd className="col-span-2 break-words">{state.title || "—"}</dd>
                    <dt className="text-muted-foreground">Tipo</dt><dd className="col-span-2">{state.propertyType}</dd>
                    <dt className="text-muted-foreground">Preço</dt><dd className="col-span-2">{state.currency} {state.price || "—"}</dd>
                    <dt className="text-muted-foreground">Quartos</dt><dd className="col-span-2">{state.bedrooms || "—"}</dd>
                    <dt className="text-muted-foreground">Banheiros</dt><dd className="col-span-2">{state.bathrooms || "—"}</dd>
                    <dt className="text-muted-foreground">Área</dt><dd className="col-span-2">{state.area || "—"} {state.areaUnit}</dd>
                    <dt className="text-muted-foreground">Ano</dt><dd className="col-span-2">{state.yearBuilt || "—"}</dd>
                    <dt className="text-muted-foreground">Condição</dt><dd className="col-span-2">{state.condition || "—"}</dd>
                    <dt className="text-muted-foreground">Disponível</dt><dd className="col-span-2">{state.availableFrom || "—"}</dd>
                    <dt className="text-muted-foreground">Endereço</dt><dd className="col-span-2 break-words">{[state.addressLine1, state.addressLine2, state.city, state.stateRegion, state.postalCode, state.country].filter(Boolean).join(", ")}</dd>
                  </dl>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Descrição</h3>
                  <div className="rounded-md border bg-background p-3 text-sm leading-6 min-h-20">
                    {state.description || "—"}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 text-sm font-medium text-muted-foreground">Retrato selecionado</h3>
                  <div className="overflow-hidden rounded-md border" style={{ aspectRatio: "4 / 5" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={selectedPortraitId ? allPortraits.find(p => p.id === selectedPortraitId)?.url : ""} alt="Retrato selecionado" className="h-full w-full object-cover" />
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-medium text-muted-foreground">Foto do anúncio</h3>
                  <div className="overflow-hidden rounded-md border" style={{ aspectRatio: photo?.aspectRatio ?? "4 / 3" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo?.dataUrl || ""} alt="Foto do anúncio" className="h-full w-full object-contain" />
                  </div>
                </div>
              </div>
              </div>
            </div>
          )}

          {generateError ? (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {generateError}
            </div>
          ) : null}

          <DialogFooter className="gap-3">
            {!showSummary ? (
              <>
                <Button variant="secondary" className="w-full sm:w-auto" onClick={() => setShowPortraitDialog(false)}>Cancelar</Button>
                <Button className="w-full sm:w-auto" disabled={selectedPortraitId == null} onClick={() => setShowSummary(true)}>Continuar</Button>
              </>
            ) : (
              <>
                <Button variant="secondary" className="w-full sm:w-auto" onClick={() => setShowSummary(false)} disabled={isGenerating}>Voltar</Button>
                <Button className="w-full sm:w-auto" type="button" disabled={isGenerating} onClick={async () => {
                  if (!photo || !selectedPortraitId) return;
                  setIsGenerating(true);
                  setGenerateError(null);
                  try {
                    // Fetch portrait image and convert to File
                    const portraitUrl = allPortraits.find(p => p.id === selectedPortraitId)?.url;
                    if (!portraitUrl) throw new Error("Retrato não encontrado");
                    const portraitResp = await fetch(portraitUrl);
                    const portraitBlob = await portraitResp.blob();
                    const portraitFile = new File([portraitBlob], "portrait.jpg", { type: portraitBlob.type || "image/jpeg" });

                    // Send images
                    const imageFormData = new FormData();
                    imageFormData.append("listingImage", photo.file);
                    imageFormData.append("portraitImage", portraitFile);
                    const imagesRes = await fetch("/api/listing/images", {
                      method: "POST",
                      body: imageFormData,
                      cache: "no-store",
                    });
                    if (!imagesRes.ok) {
                      let msg = "Falha ao enviar imagens";
                      try {
                        const j = await imagesRes.json();
                        if (j?.error) msg = j.error;
                      } catch {}
                      throw new Error(msg);
                    }

                    // Send caption data as JSON
                    const captionData = {
                      title: state.title,
                      description: state.description,
                      propertyType: state.propertyType,
                      price: state.price,
                      currency: state.currency,
                      bedrooms: state.bedrooms,
                      bathrooms: state.bathrooms,
                      area: state.area,
                      areaUnit: state.areaUnit,
                      address: {
                        line1: state.addressLine1,
                        line2: state.addressLine2,
                        city: state.city,
                        stateRegion: state.stateRegion,
                        postalCode: state.postalCode,
                        country: state.country,
                      },
                      yearBuilt: state.yearBuilt,
                      condition: state.condition,
                      availableFrom: state.availableFrom,
                      furnished: state.furnished,
                      parking: state.parking,
                      petFriendly: state.petFriendly,
                      amenities: Object.keys(state.amenities).filter(a => state.amenities[a]),
                    };
                    const captionRes = await fetch("/api/listing/caption", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(captionData),
                      cache: "no-store",
                    });
                    if (!captionRes.ok) {
                      let msg = "Falha ao enviar dados da legenda";
                      try {
                        const j = await captionRes.json();
                        if (j?.error) msg = j.error;
                      } catch {}
                      throw new Error(msg);
                    }

                    // Get caption text from response
                    const captionResult = await captionRes.json();
                    console.log("Caption result:", captionResult);
                    
                    // Extract caption text from response
                    let captionText = "";
                    if (captionResult?.caption) {
                      // Check if caption is JSON string containing the actual caption
                      try {
                        const parsed = JSON.parse(captionResult.caption);
                        // If it's an object, check for message field
                        if (typeof parsed === "object" && parsed !== null) {
                          if (parsed.message && typeof parsed.message === "string") {
                            // The actual caption is in the message field
                            captionText = parsed.message;
                          } else if (parsed.caption && typeof parsed.caption === "string") {
                            captionText = parsed.caption;
                          } else {
                            // It's the input data, look in raw for the actual caption
                            if (captionResult?.raw) {
                              const raw = captionResult.raw;
                              if (raw?.candidates && Array.isArray(raw.candidates) && raw.candidates.length > 0) {
                                const candidate = raw.candidates[0];
                                if (candidate?.content?.parts) {
                                  captionText = candidate.content.parts
                                    .map((p: any) => p.text)
                                    .filter(Boolean)
                                    .join("");
                                }
                              }
                            }
                          }
                        } else {
                          captionText = captionResult.caption;
                        }
                      } catch {
                        // Not JSON, use as-is
                        captionText = captionResult.caption;
                      }
                    } else if (captionResult?.message) {
                      captionText = captionResult.message;
                    } else if (captionResult?.candidates && Array.isArray(captionResult.candidates) && captionResult.candidates.length > 0) {
                      // Gemini API format - extract from candidates
                      const candidate = captionResult.candidates[0];
                      if (candidate?.content?.parts) {
                        captionText = candidate.content.parts
                          .map((p: any) => p.text)
                          .filter(Boolean)
                          .join("");
                      } else if (candidate?.text) {
                        captionText = candidate.text;
                      }
                    }
                    console.log("Extracted caption:", captionText);

                    // Get generated image from images endpoint - same logic as professional portrait
                    let generatedImageUrl: string | null = null;
                    const imageContentType = imagesRes.headers.get("content-type") || "";
                    console.log("Image response content-type:", imageContentType);
                    console.log("Image response status:", imagesRes.status);
                    
                    if (imageContentType.includes("application/json")) {
                      const data = await imagesRes.json();
                      console.log("Image response JSON:", data);
                      // Check various possible fields for image URL or base64 data
                      if (data?.imageUrl || data?.url || data?.result?.imageUrl) {
                        generatedImageUrl = data.imageUrl || data.url || data.result.imageUrl;
                        console.log("Found image URL in JSON:", generatedImageUrl);
                      } else if (data?.data && typeof data.data === "string" && data.data.startsWith("data:image")) {
                        generatedImageUrl = data.data;
                        console.log("Found base64 data URL in data field");
                      } else if (data?.base64 && typeof data.base64 === "string") {
                        const mimeType = data.mimeType || "image/png";
                        generatedImageUrl = `data:${mimeType};base64,${data.base64}`;
                        console.log("Found base64 in base64 field");
                      } else if (data?.imageData && typeof data.imageData === "string") {
                        generatedImageUrl = data.imageData.startsWith("data:") ? data.imageData : `data:${data.mimeType || "image/png"};base64,${data.imageData}`;
                        console.log("Found imageData field");
                      } else {
                        console.warn("Image JSON response doesn't contain image data:", Object.keys(data));
                      }
                    } else if (imageContentType.startsWith("image/")) {
                      const blob = await imagesRes.blob();
                      generatedImageUrl = URL.createObjectURL(blob);
                      generatedImageUrlRef.current = generatedImageUrl;
                      console.log("Created blob URL from image response, size:", blob.size);
                    } else {
                      // Try to read as blob anyway
                      try {
                        const blob = await imagesRes.blob();
                        if (blob.size > 0) {
                          generatedImageUrl = URL.createObjectURL(blob);
                          generatedImageUrlRef.current = generatedImageUrl;
                          console.log("Created blob URL from binary response, size:", blob.size);
                        } else {
                          console.warn("Blob is empty");
                        }
                      } catch (e) {
                        console.error("Failed to read image as blob:", e);
                      }
                    }

                    console.log("Final values - Image:", generatedImageUrl, "Caption:", captionText);

                    // Extract first paragraph as CTA and remove it from caption
                    let ctaText = "";
                    let remainingCaption = captionText;
                    
                    if (captionText) {
                      // Split by double newlines or single newline followed by empty line
                      const paragraphs = captionText.split(/\n\s*\n/).filter(p => p.trim());
                      
                      if (paragraphs.length > 0) {
                        // First paragraph becomes the CTA
                        ctaText = paragraphs[0].trim();
                        // Remove period at the end if present
                        ctaText = ctaText.replace(/\.$/, "");
                        // Rest of the paragraphs become the caption
                        remainingCaption = paragraphs.slice(1).join("\n\n").trim();
                      } else {
                        // If no double newlines, try splitting by single newline
                        const lines = captionText.split("\n").filter(l => l.trim());
                        if (lines.length > 0) {
                          ctaText = lines[0].trim();
                          // Remove period at the end if present
                          ctaText = ctaText.replace(/\.$/, "");
                          remainingCaption = lines.slice(1).join("\n").trim();
                        }
                      }
                    }
                    
                    // Fallback to random CTA if no caption was extracted
                    if (!ctaText) {
                      ctaText = ctaOptions[Math.floor(Math.random() * ctaOptions.length)];
                    }

                    // Store the generated listing post (only show if we have at least one)
                    if (generatedImageUrl || captionText) {
                      setGeneratedListing({ 
                        imageUrl: generatedImageUrl || "", 
                        caption: remainingCaption || captionText || "Legenda não disponível",
                        cta: ctaText
                      });
                    } else {
                      console.error("Neither image nor caption was extracted from responses");
                      setGenerateError("Não foi possível extrair a imagem ou a legenda da resposta. Verifique o console para mais detalhes.");
                    }

                    // Success - close summary dialog and show result
                    setShowPortraitDialog(false);
                    setShowSummary(false);
                    setShowResultDialog(true);
                  } catch (err) {
                    setGenerateError(err instanceof Error ? err.message : "Falha na geração");
                  } finally {
                    setIsGenerating(false);
                  }
                }}>
                  {isGenerating ? (
                    <>
                      <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
                      Gerando…
                    </>
                  ) : (
                    <>Gerar post de anúncio</>
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Result Dialog - Instagram-style layout */}
      <Dialog open={showResultDialog} onOpenChange={(o) => {
        if (!o) {
          setShowResultDialog(false);
          // Clean up blob URL when dialog closes
          if (generatedImageUrlRef.current) {
            URL.revokeObjectURL(generatedImageUrlRef.current);
            generatedImageUrlRef.current = null;
          }
          setGeneratedListing(null);
        }
      }}>
        <DialogContent className="sm:max-w-[480px] max-h-[85vh] p-0 gap-0 overflow-hidden flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
            <div className="flex items-start justify-between gap-4 pr-8">
              <div className="flex-1 min-w-0">
                <DialogTitle>Post de anúncio gerado</DialogTitle>
                <DialogDescription>Seu post está pronto para compartilhar!</DialogDescription>
              </div>
              {generatedListing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setRegenerateLoading(true);
                    setTimeout(() => {
                      const randomCta = ctaOptions[Math.floor(Math.random() * ctaOptions.length)];
                      setGeneratedListing({ ...generatedListing, cta: randomCta });
                      setRegenerateLoading(false);
                    }, 300);
                  }}
                  disabled={regenerateLoading}
                  className="flex items-center justify-center flex-shrink-0 w-9 h-9 p-0"
                  title="Regenerar texto"
                >
                  <RefreshCw className={`h-4 w-4 ${regenerateLoading ? "animate-spin" : ""}`} />
                </Button>
              )}
            </div>
          </DialogHeader>
          
          <div className="overflow-y-auto flex-1 min-h-0">
            {generatedListing && (
              <div className="space-y-0 bg-background">
                {/* Instagram-style image - square with border */}
                {generatedListing.imageUrl && (
                  <div className="w-full bg-muted/10 border-b relative group" style={{ aspectRatio: "1 / 1" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={generatedListing.imageUrl} 
                      alt="Post de anúncio gerado" 
                      className="w-full h-full object-cover"
                    />
                    {/* Gradient overlay with CTA */}
                    <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-primary/90 via-primary/70 to-transparent">
                      <div className="h-full flex items-start justify-center pt-8 px-6">
                        <p className="text-2xl md:text-3xl font-bold text-white text-center drop-shadow-lg leading-tight">
                          {generatedListing.cta || "Agende uma visita hoje!"}
                        </p>
                      </div>
                    </div>
                    {/* Copy image button */}
                    <div className="absolute bottom-4 right-4 z-10">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={async () => {
                          try {
                            setCopyImageSuccess(false);
                            // Create a canvas to combine image + gradient + text
                            const img = new Image();
                            img.crossOrigin = "anonymous";
                            img.src = generatedListing.imageUrl;
                            
                            await new Promise((resolve, reject) => {
                              img.onload = resolve;
                              img.onerror = reject;
                            });

                            const canvas = document.createElement("canvas");
                            canvas.width = img.width;
                            canvas.height = img.height;
                            const ctx = canvas.getContext("2d");
                            if (!ctx) throw new Error("Could not get canvas context");

                            // Draw the base image
                            ctx.drawImage(img, 0, 0);

                            // Draw gradient overlay (top third)
                            const gradientHeight = canvas.height / 3;
                            const gradient = ctx.createLinearGradient(0, 0, 0, gradientHeight);
                            gradient.addColorStop(0, "rgba(16, 0, 255, 0.9)"); // primary/90
                            gradient.addColorStop(0.5, "rgba(16, 0, 255, 0.7)"); // primary/70
                            gradient.addColorStop(1, "rgba(16, 0, 255, 0)");
                            ctx.fillStyle = gradient;
                            ctx.fillRect(0, 0, canvas.width, gradientHeight);

                            // Draw CTA text
                            const ctaText = generatedListing.cta || "Agende uma visita hoje!";
                            ctx.fillStyle = "white";
                            ctx.font = `bold ${Math.floor(canvas.width * 0.06)}px sans-serif`;
                            ctx.textAlign = "center";
                            ctx.textBaseline = "top";
                            ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
                            ctx.shadowBlur = 10;
                            ctx.shadowOffsetX = 0;
                            ctx.shadowOffsetY = 2;
                            
                            // Calculate text position (top third, centered)
                            const textY = canvas.height * 0.1; // pt-8 equivalent
                            const maxWidth = canvas.width * 0.9;
                            
                            // Wrap text if needed
                            const words = ctaText.split(" ");
                            let line = "";
                            let y = textY;
                            const lineHeight = canvas.width * 0.08;
                            
                            for (let i = 0; i < words.length; i++) {
                              const testLine = line + words[i] + " ";
                              const metrics = ctx.measureText(testLine);
                              if (metrics.width > maxWidth && i > 0) {
                                ctx.fillText(line, canvas.width / 2, y);
                                line = words[i] + " ";
                                y += lineHeight;
                              } else {
                                line = testLine;
                              }
                            }
                            ctx.fillText(line, canvas.width / 2, y);

                            // Convert canvas to blob and copy
                            canvas.toBlob(async (blob) => {
                              if (blob) {
                                await navigator.clipboard.write([
                                  new ClipboardItem({ [blob.type]: blob })
                                ]);
                                setCopyImageSuccess(true);
                                setTimeout(() => setCopyImageSuccess(false), 2000);
                              }
                            }, "image/png");
                          } catch (err) {
                            console.error("Failed to copy image:", err);
                          }
                        }}
                        className="flex items-center justify-center shadow-lg flex-shrink-0 w-9 h-9 p-0"
                        title="Copiar imagem"
                      >
                        {copyImageSuccess ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Instagram-style caption */}
                {generatedListing.caption && (
                  <div className="px-4 py-4 bg-background relative">
                    <div className="text-sm leading-6 whitespace-pre-wrap break-words text-foreground">
                      {generatedListing.caption}
                    </div>
                    <div className="absolute top-4 right-4 z-10">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(generatedListing.caption);
                            setCopyTextSuccess(true);
                            setTimeout(() => setCopyTextSuccess(false), 2000);
                          } catch (err) {
                            console.error("Failed to copy text:", err);
                          }
                        }}
                        className="flex items-center justify-center shadow-lg flex-shrink-0 w-9 h-9 p-0"
                        title="Copiar texto"
                      >
                        {copyTextSuccess ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
                
                {!generatedListing.imageUrl && !generatedListing.caption && (
                  <div className="px-4 py-8 text-center text-muted-foreground">
                    Nenhum conteúdo disponível
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="px-6 pb-6 pt-4 border-t flex-shrink-0">
            <Button 
              variant="secondary" 
              className="w-full sm:w-auto" 
              onClick={() => {
                setShowResultDialog(false);
                if (generatedImageUrlRef.current) {
                  URL.revokeObjectURL(generatedImageUrlRef.current);
                  generatedImageUrlRef.current = null;
                }
                setGeneratedListing(null);
              }}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}



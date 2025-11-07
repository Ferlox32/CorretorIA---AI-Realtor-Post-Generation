"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, ImageIcon } from "lucide-react";
import { isValidImageType, isValidSize, readFileAsDataURL } from "@/lib/validators";
import { LoadingOverlay } from "@/components/loading-overlay";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { savePortrait } from "@/lib/portrait-storage";

type SelectedFile = {
  file: File;
  previewUrl: string;
  aspectRatio?: string; // e.g., "4 / 3"
};

export function UploadCard() {
  const router = useRouter();
  const [selected, setSelected] = React.useState<SelectedFile | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [resultImageUrl, setResultImageUrl] = React.useState<string | null>(null);
  const [showResultDialog, setShowResultDialog] = React.useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = React.useState(false);
  const [showNextStepsDialog, setShowNextStepsDialog] = React.useState(false);
  const [feedback, setFeedback] = React.useState("");
  const blobUrlRef = React.useRef<string | null>(null);

  const onFileAccepted = async (file: File) => {
    setError(null);
    if (!isValidImageType(file)) {
      setSelected(null);
      setError("Por favor, faça upload de uma imagem JPEG ou PNG.");
      return;
    }
    if (!isValidSize(file)) {
      setSelected(null);
      setError("A imagem deve ter no máximo 10MB.");
      return;
    }
    const url = await readFileAsDataURL(file);
    // compute aspect ratio from natural size
    const dims = await new Promise<{ w: number; h: number }>((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
      img.src = url;
    });
    const ratio = dims.w > 0 && dims.h > 0 ? `${dims.w} / ${dims.h}` : undefined;
    setSelected({ file, previewUrl: url, aspectRatio: ratio });
  };

  const onInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await onFileAccepted(file);
  };

  const onDrop = async (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await onFileAccepted(file);
  };

  const hasValidFile = !!selected && !error;

  const onGenerate = async (feedbackText?: string) => {
    if (!hasValidFile) return;
    setIsLoading(true);
    try {
      const fd = new FormData();
      if (selected) {
        fd.set("file", selected.file);
      }
      if (feedbackText) {
        fd.set("feedback", feedbackText);
      }
      const res = await fetch("/api/generate", { method: "POST", body: fd });
      if (!res.ok) {
        setError("Falha na geração. Por favor, tente novamente.");
      } else {
        const ct = res.headers.get("content-type") || "";
        let outUrl: string | null = null;
        if (ct.includes("application/json")) {
          const data = await res.json();
          outUrl = data?.imageUrl || data?.url || data?.result?.imageUrl || null;
        } else if (ct.startsWith("image/")) {
          const blob = await res.blob();
          outUrl = URL.createObjectURL(blob);
          blobUrlRef.current = outUrl;
        }
        if (outUrl) {
          setResultImageUrl(outUrl);
          setShowResultDialog(true);
        }
      }
    } catch {
      setError("Erro de rede. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <Card className="relative overflow-hidden border-muted/50 bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/70 shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
      {isLoading && <LoadingOverlay />}
      <CardHeader>
        <CardTitle className="text-base text-foreground">Faça upload da sua foto</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="file" className="text-xs text-muted-foreground">JPEG ou PNG, máx. 10MB</Label>
          <label
            htmlFor="file"
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => void onDrop(e)}
            className={
              "flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-10 transition-all cursor-pointer select-none " +
              (isDragging ? "border-primary bg-primary/5 shadow-sm" : "border-muted/60 bg-muted/10 hover:bg-muted/20 hover:shadow-sm")
            }
          >
            <Upload className="h-5 w-5 text-muted-foreground" />
            <div className="text-sm text-muted-foreground text-center">
              Arraste e solte sua imagem aqui
              <span className="mx-1">ou</span>
              <span className="text-foreground underline underline-offset-4">navegue</span>
            </div>
            <Input id="file" type="file" accept="image/png,image/jpeg" className="hidden" onChange={(e) => void onInputChange(e)} disabled={isLoading} />
          </label>
        </div>

        <Separator />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <div
              className="w-full overflow-hidden rounded-md border border-muted/60 bg-muted/20 grid place-items-center"
              style={{ aspectRatio: selected?.aspectRatio ?? "4 / 3" }}
            >
              {selected?.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selected.previewUrl} alt="Pré-visualização" className="w-full h-full object-contain" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ImageIcon className="h-8 w-8" />
                  <span className="text-xs">A pré-visualização da sua imagem aparecerá aqui</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <Button size="lg" className="w-full" disabled={!hasValidFile || isLoading} onClick={() => void onGenerate()}>
              {isLoading ? (
                <>
                  <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
                  Gerando…
                </>
              ) : (
                <>Gerar retrato profissional</>
              )}
            </Button>
            {error ? <p className="text-xs text-destructive">{error}</p> : <p className="text-xs text-muted-foreground">Nunca armazenamos sua foto. Usada apenas para geração.</p>}
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Result Dialog */}
    <Dialog open={showResultDialog} onOpenChange={(o) => {
      if (!o) {
        setShowResultDialog(false);
        if (blobUrlRef.current) {
          URL.revokeObjectURL(blobUrlRef.current);
          blobUrlRef.current = null;
        }
      }
    }}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Retrato gerado</DialogTitle>
          <DialogDescription>Você está satisfeito com a imagem?</DialogDescription>
        </DialogHeader>
        <div className="w-full">
          {resultImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={resultImageUrl} alt="Retrato gerado" className="w-full h-auto rounded-md border" />
          ) : null}
        </div>
        <DialogFooter className="gap-3">
          <Button className="w-full sm:w-auto" variant="secondary" onClick={() => {
            setShowResultDialog(false);
            setShowFeedbackDialog(true);
          }}>No</Button>
          <Button className="w-full sm:w-auto" onClick={() => {
            void (async () => {
              if (resultImageUrl) {
                // Convert blob URL to data URL for persistent storage
                let urlToStore = resultImageUrl;
                if (resultImageUrl.startsWith("blob:") || resultImageUrl.startsWith("http://localhost") || resultImageUrl.startsWith("http://127.0.0.1")) {
                  try {
                    const response = await fetch(resultImageUrl);
                    const blob = await response.blob();
                    const reader = new FileReader();
                    urlToStore = await new Promise<string>((resolve, reject) => {
                      reader.onload = () => resolve(reader.result as string);
                      reader.onerror = reject;
                      reader.readAsDataURL(blob);
                    });
                  } catch (err) {
                    console.error("Failed to convert blob to data URL:", err);
                  }
                }
                // Save the generated portrait to storage
                savePortrait(urlToStore);
              }
              setShowResultDialog(false);
              setShowNextStepsDialog(true);
            })();
          }}>Yes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Feedback Dialog */}
    <Dialog open={showFeedbackDialog} onOpenChange={(o) => setShowFeedbackDialog(o)}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Compartilhe seu feedback</DialogTitle>
          <DialogDescription>Opcionalmente, descreva o que você gostaria de melhorar.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="feedback" className="text-xs text-muted-foreground">Feedback (opcional)</Label>
          <textarea
            id="feedback"
            className="min-h-28 w-full resize-y rounded-md border bg-background p-2 text-sm outline-none"
            placeholder="ex.: Melhorar iluminação, reduzir desfoque do fundo, ajustar enquadramento…"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </div>
        <DialogFooter className="flex-col-reverse gap-3 sm:flex-row sm:gap-3">
          <Button className="w-full sm:w-auto" variant="secondary" onClick={() => setShowFeedbackDialog(false)}>Enviar feedback</Button>
          <Button className="w-full sm:w-auto" onClick={() => {
            setShowFeedbackDialog(false);
            void onGenerate(feedback || undefined);
          }}>Enviar e tentar novamente</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Next Steps Dialog */}
    <Dialog open={showNextStepsDialog} onOpenChange={(o) => setShowNextStepsDialog(o)}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Ótimo! O que você gostaria de fazer agora?</DialogTitle>
          <DialogDescription>Escolha para onde ir a partir daqui.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <Button asChild variant="secondary" className="w-full">
            <Link href="/profile">Ver todos os meus retratos</Link>
          </Button>
          <Button asChild className="w-full">
            <Link href="/listing">Gerar post de anúncio</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}



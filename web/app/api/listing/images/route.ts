import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getWebhookUrl(): string {
  // Use production URL (workflow is active)
  return process.env.N8N_WEBHOOK_URL_POST_IMAGES_PROD || "https://n8n.srv1092655.hstgr.cloud/webhook/post-image-gen";
}

function getBasicAuthHeader(): string | undefined {
  const user = process.env.N8N_BASIC_USER || "generation";
  const pass = process.env.N8N_BASIC_PASS || "x@nd31Z03";
  if (!user || !pass) return undefined;
  const token = Buffer.from(`${user}:${pass}`).toString("base64");
  return `Basic ${token}`;
}

export async function GET() {
  return NextResponse.json({ ok: true, route: "/api/listing/images", method: "GET" });
}

export async function POST(req: Request) {
  try {
    const incoming = await req.formData();
    const listingImage = incoming.get("listingImage");
    const portraitImage = incoming.get("portraitImage");

    if (!listingImage || !portraitImage) {
      return NextResponse.json({ error: "Missing images", received: { listingImage: !!listingImage, portraitImage: !!portraitImage } }, { status: 400 });
    }

    if (!(listingImage instanceof Blob) || !(portraitImage instanceof Blob)) {
      return NextResponse.json({ error: "Invalid image format", types: { listingImage: typeof listingImage, portraitImage: typeof portraitImage } }, { status: 400 });
    }

    const forward = new FormData();
    if (typeof (listingImage as any).name === "string") {
      forward.append("listingImage", listingImage, (listingImage as any).name as string);
    } else {
      forward.append("listingImage", listingImage);
    }
    if (typeof (portraitImage as any).name === "string") {
      forward.append("portraitImage", portraitImage, (portraitImage as any).name as string);
    } else {
      forward.append("portraitImage", portraitImage);
    }

    const auth = getBasicAuthHeader();
    if (!auth) {
      return NextResponse.json({ error: "Auth not configured" }, { status: 500 });
    }
    const url = getWebhookUrl();
    const res = await fetch(url, {
      method: "POST",
      body: forward,
      headers: {
        Authorization: auth,
      },
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => res.statusText);
      return NextResponse.json({ error: `Webhook error: ${res.status} ${errorText}` }, { status: res.status });
    }

    const contentType = res.headers.get("content-type") || "";
    // Same logic as /api/generate - return JSON if JSON, otherwise return binary
    if (contentType.includes("application/json")) {
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }

    // Return binary (image or other binary data)
    const arrayBuf = await res.arrayBuffer();
    return new Response(arrayBuf, {
      status: res.status,
      headers: { "content-type": contentType || "application/octet-stream" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upstream error";
    const stack = err instanceof Error ? err.stack : undefined;
    console.error("Listing images API error:", err);
    return NextResponse.json({ error: message, details: stack }, { status: 500 });
  }
}


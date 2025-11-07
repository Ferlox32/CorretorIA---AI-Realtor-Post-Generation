import { NextResponse } from "next/server";

export const runtime = "nodejs";

function getWebhookUrl(): string {
  // Use production URL (workflow is active)
  return process.env.N8N_WEBHOOK_URL_PROD || "https://n8n.srv1092655.hstgr.cloud/webhook/pro-portrait";
}

function getBasicAuthHeader(): string | undefined {
  const user = process.env.N8N_BASIC_USER || "generation";
  const pass = process.env.N8N_BASIC_PASS || "x@nd31Z03";
  if (!user || !pass) return undefined;
  const token = Buffer.from(`${user}:${pass}`).toString("base64");
  return `Basic ${token}`;
}

export async function POST(req: Request) {
  try {
    const incoming = await req.formData();
    const file = incoming.get("file");
    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const forward = new FormData();
    // Preserve filename when possible
    if (typeof (file as any).name === "string") {
      forward.append("file", file, (file as any).name as string);
    } else {
      forward.append("file", file);
    }

    const auth = getBasicAuthHeader();
    const res = await fetch(getWebhookUrl(), {
      method: "POST",
      body: forward,
      headers: auth ? { Authorization: auth } : undefined,
    });

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }

    const arrayBuf = await res.arrayBuffer();
    return new Response(arrayBuf, {
      status: res.status,
      headers: { "content-type": contentType || "application/octet-stream" },
    });
  } catch (err) {
    return NextResponse.json({ error: "Upstream error" }, { status: 502 });
  }
}



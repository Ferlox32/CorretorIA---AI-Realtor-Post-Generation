import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getWebhookUrl(): string {
  // Use production URL
  return process.env.N8N_WEBHOOK_URL_POST_CAPTION_PROD || "https://n8n.srv1092655.hstgr.cloud/webhook/post-caption";
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
    const json = await req.json();

    const auth = getBasicAuthHeader();
    const res = await fetch(getWebhookUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(auth ? { Authorization: auth } : {}),
      },
      body: JSON.stringify(json),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      return NextResponse.json({ error: `Webhook error: ${res.status} ${text}` }, { status: res.status });
    }

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await res.json();
      // Handle different response formats
      let captionText = "";
      
      // Format 1: Caption field that might be JSON string with message field
      if (data?.caption && typeof data.caption === "string") {
        try {
          const parsed = JSON.parse(data.caption);
          // If it's an object, check for message field (the actual caption)
          if (typeof parsed === "object" && parsed !== null) {
            if (parsed.message && typeof parsed.message === "string") {
              captionText = parsed.message;
            } else if (parsed.caption && typeof parsed.caption === "string") {
              captionText = parsed.caption;
            } else {
              // It's the input data, look in raw for the actual caption
              if (data?.raw) {
                const raw = data.raw;
                // Gemini API format with candidates
                if (raw?.candidates && Array.isArray(raw.candidates) && raw.candidates.length > 0) {
                  const candidate = raw.candidates[0];
                  if (candidate?.content?.parts) {
                    captionText = candidate.content.parts
                      .map((p: any) => p.text)
                      .filter(Boolean)
                      .join("");
                  } else if (candidate?.text) {
                    captionText = candidate.text;
                  }
                }
                // Array with content.parts (old format)
                else if (Array.isArray(raw) && raw[0]?.content?.parts) {
                  captionText = raw[0].content.parts
                    .map((p: any) => p.text)
                    .filter(Boolean)
                    .join("");
                }
              }
            }
          } else {
            captionText = data.caption;
          }
        } catch {
          // Not JSON, use as-is
          captionText = data.caption;
        }
      }
      // Format 2: Gemini API format with candidates (direct in response)
      else if (data?.candidates && Array.isArray(data.candidates) && data.candidates.length > 0) {
        const candidate = data.candidates[0];
        if (candidate?.content?.parts) {
          captionText = candidate.content.parts
            .map((p: any) => p.text)
            .filter(Boolean)
            .join("");
        } else if (candidate?.text) {
          captionText = candidate.text;
        }
      }
      // Format 3: Array with content.parts (old format)
      else if (Array.isArray(data) && data[0]?.content?.parts) {
        captionText = data[0].content.parts
          .map((p: any) => p.text)
          .filter(Boolean)
          .join("");
      }
      // Format 4: Direct message field
      else if (data?.message) {
        captionText = data.message;
      }
      
      if (captionText) {
        return NextResponse.json({ caption: captionText, raw: data }, { status: res.status });
      }
      return NextResponse.json(data, { status: res.status });
    }

    const text = await res.text();
    return NextResponse.json({ message: text }, { status: res.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upstream error";
    const stack = err instanceof Error ? err.stack : undefined;
    console.error("Listing caption API error:", err);
    return NextResponse.json({ error: message, details: stack }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, route: "/api/listing/caption", method: "GET" });
}


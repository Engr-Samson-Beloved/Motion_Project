import type { IncomingMessage, ServerResponse } from "node:http";

const UPSTREAM = "https://openrouter.ai/api/v1/chat/completions";
const MAX_BODY_BYTES = 15 * 1024 * 1024;
const MAX_OUTPUT_TOKENS = 12000;
const DEFAULT_MODEL = "openrouter/free";
const WINDOW_MS = 60_000;
const REQUESTS_PER_WINDOW = 8;

type Json = Record<string, unknown>;
type RequestWithBody = IncomingMessage & { body?: unknown };
const attempts = new Map<string, { count: number; expires: number }>();

const reply = (res: ServerResponse, status: number, message: string) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify({ error: { message } }));
};

const readBody = async (req: RequestWithBody): Promise<Json> => {
  if (req.body && typeof req.body === "object") return req.body as Json;
  if (typeof req.body === "string") return JSON.parse(req.body) as Json;
  const chunks: Uint8Array[] = [];
  let size = 0;
  for await (const chunk of req) {
    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += bytes.length;
    if (size > MAX_BODY_BYTES) throw new Error("Request is too large.");
    chunks.push(bytes);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as Json;
};

const cleanImages = (value: unknown) => {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 6) throw new Error("Upload at most six reference images.");
  return value.map((item) => {
    if (!item || typeof item !== "object") throw new Error("Invalid reference image.");
    const image = item as Json;
    if (typeof image.dataUrl !== "string" || !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(image.dataUrl)) {
      throw new Error("Use PNG, JPEG or WebP reference images.");
    }
    return { type: "image_url", image_url: { url: image.dataUrl } };
  });
};

const rateLimited = (req: IncomingMessage) => {
  const ip = String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown").split(",")[0].trim();
  const now = Date.now();
  const record = attempts.get(ip);
  if (!record || now >= record.expires) {
    attempts.set(ip, { count: 1, expires: now + WINDOW_MS });
    return false;
  }
  record.count += 1;
  return record.count > REQUESTS_PER_WINDOW;
};

export const handleAi = async (req: RequestWithBody, res: ServerResponse, key = process.env.OPENROUTER_API_KEY) => {
  if (req.method === "GET") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.end(JSON.stringify({ available: Boolean(key), model: process.env.OPENROUTER_MODEL || DEFAULT_MODEL }));
    return;
  }
  if (req.method !== "POST") return reply(res, 405, "Use POST to generate a video.");
  if (!key) return reply(res, 503, "Hosted AI is not configured. Add OPENROUTER_API_KEY to the server environment.");
  if (Number(req.headers["content-length"] || 0) > MAX_BODY_BYTES) return reply(res, 413, "Request is too large.");
  if (rateLimited(req)) return reply(res, 429, "Too many requests. Try again in a minute.");

  let body: Json;
  let images: ReturnType<typeof cleanImages>;
  try {
    body = await readBody(req);
    if (typeof body.system !== "string" || !body.system.trim() || body.system.length > 50_000) throw new Error("Invalid system prompt.");
    if (typeof body.prompt !== "string" || !body.prompt.trim() || body.prompt.length > 180_000) throw new Error("Enter a shorter prompt.");
    images = cleanImages(body.images);
  } catch (error) {
    return reply(res, 400, error instanceof Error ? error.message : "Invalid request.");
  }

  const maxTokens = typeof body.maxTokens === "number" && Number.isFinite(body.maxTokens)
    ? Math.min(MAX_OUTPUT_TOKENS, Math.max(128, Math.floor(body.maxTokens)))
    : MAX_OUTPUT_TOKENS;
  const controller = new AbortController();
  res.on("close", () => controller.abort());
  try {
    const upstream = await fetch(UPSTREAM, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json",
        ...(process.env.PUBLIC_SITE_URL ? { "HTTP-Referer": process.env.PUBLIC_SITE_URL } : {}),
        "X-Title": "Motion Studio",
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || DEFAULT_MODEL,
        max_tokens: maxTokens,
        stream: true,
        messages: [
          { role: "system", content: body.system },
          { role: "user", content: images.length ? [{ type: "text", text: body.prompt }, ...images] : body.prompt },
        ],
      }),
    });
    if (!upstream.ok || !upstream.body) {
      const detail = await upstream.text().catch(() => "");
      let message = "The hosted model is unavailable. Try again shortly.";
      try { message = (JSON.parse(detail) as { error?: { message?: string } }).error?.message || message; } catch { /* Upstream returned non-JSON. */ }
      if (upstream.status === 402) {
        message = "Included AI has run out of credits for its selected model. The site owner can add OpenRouter credits or switch OPENROUTER_MODEL to openrouter/free. You can also use your own provider key in Studio.";
      }
      return reply(res, upstream.status || 502, message);
    }
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("X-Content-Type-Options", "nosniff");
    const reader = upstream.body.getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done || controller.signal.aborted) break;
      res.write(Buffer.from(value));
    }
    res.end();
  } catch (error) {
    if (!controller.signal.aborted && !res.headersSent) {
      reply(res, 502, error instanceof Error ? error.message : "Hosted AI request failed.");
    } else if (!res.writableEnded) {
      res.end();
    }
  }
};

export default handleAi;

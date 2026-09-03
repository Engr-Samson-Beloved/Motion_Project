/**
 * Bring your own key.
 *
 * Every request goes straight from this page to the provider. There is no
 * server in the middle, which is the point: nothing to deploy beyond static
 * files, no place for a key to be logged, and no possibility of the app paying
 * for anyone's inference. The cost is that the key lives in the page — but it
 * is the viewer's own key in the viewer's own browser, which is the accepted
 * shape for a tool like this.
 *
 * Anthropic goes through the official SDK. The others are small enough over
 * their REST APIs that a dependency each would be a poor trade, and the
 * OpenAI-compatible entry is what makes "any API key" true rather than a claim
 * about four vendors — OpenRouter, Groq, Together and a local llama.cpp all
 * speak it.
 */

import Anthropic from "@anthropic-ai/sdk";

export type ProviderId = "anthropic" | "openai" | "google" | "compatible";

export type Provider = {
  id: ProviderId;
  label: string;
  defaultModel: string;
  /** Where to get a key, shown under the field. */
  keyHint: string;
  /** Only the OpenAI-compatible entry needs one typed in. */
  needsBaseUrl: boolean;
};

export const PROVIDERS: readonly Provider[] = [
  {
    id: "anthropic",
    label: "Anthropic",
    defaultModel: "claude-opus-5",
    keyHint: "console.anthropic.com → API keys",
    needsBaseUrl: false,
  },
  {
    id: "openai",
    label: "OpenAI",
    defaultModel: "gpt-5.1",
    keyHint: "platform.openai.com → API keys",
    needsBaseUrl: false,
  },
  {
    id: "google",
    label: "Google",
    defaultModel: "gemini-3-pro",
    keyHint: "aistudio.google.com → Get API key",
    needsBaseUrl: false,
  },
  {
    id: "compatible",
    label: "OpenAI-compatible",
    defaultModel: "",
    keyHint: "OpenRouter, Groq, Together, or a local server",
    needsBaseUrl: true,
  },
];

export type Credentials = {
  provider: ProviderId;
  apiKey: string;
  model: string;
  baseUrl: string;
};

export type GenerateOptions = {
  credentials: Credentials;
  system: string;
  prompt: string;
  signal?: AbortSignal;
  onToken?: (chunk: string) => void;
};

const MAX_TOKENS = 32000;

/** Turns a provider's error body into something worth showing a person. */
const httpError = async (response: Response, provider: string) => {
  let detail = "";
  try {
    const body: unknown = await response.json();
    const asRecord = body as { error?: { message?: string }; message?: string };
    detail = asRecord?.error?.message ?? asRecord?.message ?? "";
  } catch {
    detail = await response.text().catch(() => "");
  }
  const hint =
    response.status === 401 || response.status === 403
      ? " Check the API key."
      : response.status === 429
        ? " Rate limited — wait and try again."
        : "";
  return new Error(
    `${provider} returned ${response.status}. ${detail || "No detail."}${hint}`.trim(),
  );
};

const generateAnthropic = async ({
  credentials,
  system,
  prompt,
  signal,
  onToken,
}: GenerateOptions) => {
  const client = new Anthropic({
    apiKey: credentials.apiKey,
    // The key is the viewer's own and never leaves their browser except to
    // Anthropic. This is what the flag is for.
    dangerouslyAllowBrowser: true,
  });

  // Streaming, because a composition is a long output and a non-streaming
  // request of this size risks an HTTP timeout.
  const stream = client.messages.stream(
    {
      model: credentials.model,
      max_tokens: MAX_TOKENS,
      system,
      thinking: { type: "adaptive" },
      messages: [{ role: "user", content: prompt }],
    },
    { signal },
  );

  if (onToken) {
    stream.on("text", onToken);
  }

  const message = await stream.finalMessage();

  if (message.stop_reason === "refusal") {
    throw new Error(
      "The model declined this request. Rephrase it and try again.",
    );
  }

  return message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("");
};

/**
 * OpenAI's chat completions shape, which is also what every "compatible"
 * endpoint implements. Streamed, and tolerant of the small differences between
 * implementations — some omit `choices` on the final chunk, some send comments.
 */
const generateOpenAiShaped = async (
  { credentials, system, prompt, signal, onToken }: GenerateOptions,
  baseUrl: string,
  label: string,
) => {
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    signal,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${credentials.apiKey}`,
    },
    body: JSON.stringify({
      model: credentials.model,
      max_completion_tokens: MAX_TOKENS,
      stream: true,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok || !response.body) {
    throw await httpError(response, label);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) {
        continue;
      }
      const payload = trimmed.slice(5).trim();
      if (payload === "[DONE]") {
        continue;
      }
      try {
        const parsed = JSON.parse(payload) as {
          choices?: { delta?: { content?: string } }[];
        };
        const chunk = parsed.choices?.[0]?.delta?.content;
        if (chunk) {
          text += chunk;
          onToken?.(chunk);
        }
      } catch {
        // A malformed or non-JSON keepalive line is not worth failing over.
      }
    }
  }

  return text;
};

/** Gemini's generateContent, non-streaming — its stream format differs enough
 *  from SSE that the extra branch is not worth it for one provider. */
const generateGoogle = async ({
  credentials,
  system,
  prompt,
  signal,
}: GenerateOptions) => {
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/` +
    `${encodeURIComponent(credentials.model)}:generateContent`;

  const response = await fetch(url, {
    method: "POST",
    signal,
    headers: {
      "content-type": "application/json",
      "x-goog-api-key": credentials.apiKey,
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: MAX_TOKENS },
    }),
  });

  if (!response.ok) {
    throw await httpError(response, "Google");
  }

  const body = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  return (
    body.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("") ?? ""
  );
};

export const generateComposition = async (
  options: GenerateOptions,
): Promise<string> => {
  const { credentials } = options;

  if (!credentials.apiKey.trim()) {
    throw new Error("Add an API key first.");
  }
  if (!credentials.model.trim()) {
    throw new Error("Name a model first.");
  }

  switch (credentials.provider) {
    case "anthropic":
      return generateAnthropic(options);
    case "openai":
      return generateOpenAiShaped(options, "https://api.openai.com/v1", "OpenAI");
    case "google":
      return generateGoogle(options);
    case "compatible": {
      if (!credentials.baseUrl.trim()) {
        throw new Error("Add the base URL for the compatible endpoint.");
      }
      return generateOpenAiShaped(
        options,
        credentials.baseUrl,
        "The endpoint",
      );
    }
    default:
      throw new Error(`Unknown provider: ${String(credentials.provider)}`);
  }
};

/* ------------------------------------------------------------ key storage */

const STORAGE_KEY = "motion-project.credentials";

/**
 * sessionStorage, not localStorage: the key is gone when the tab closes, which
 * is the behaviour someone pasting a secret into a web page should get by
 * default. Both can throw outright in a private window or with site data
 * blocked, so both directions are guarded.
 */
export const loadCredentials = (): Credentials | null => {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Credentials) : null;
  } catch {
    return null;
  }
};

export const saveCredentials = (credentials: Credentials) => {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(credentials));
  } catch {
    // Storage unavailable. The key still works for this session in memory.
  }
};

export const clearCredentials = () => {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to do.
  }
};

import type { ChatMessage } from "@/lib/types/memory";

const PRIMARY_MODEL = "gemini-flash-latest";
const FALLBACK_MODEL = "gemini-flash-lite-latest";

function apiUrlFor(model: string) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
}

interface SendMessageParams {
  systemPrompt: string;
  history: ChatMessage[];
  newMessage: string;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGemini(
  model: string,
  apiKey: string,
  body: string,
  timeoutMs: number
): Promise<{ ok: true; text: string } | { ok: false; error: Error }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const start = Date.now();

  try {
    const response = await fetch(apiUrlFor(model), {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    console.log(`[gemini:${model}] responded in ${Date.now() - start}ms with status ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      return { ok: false, error: new Error(`(${response.status}): ${errorText}`) };
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return { ok: false, error: new Error("returned no text content") };
    return { ok: true, text };
  } catch (err) {
    clearTimeout(timeoutId);
    const elapsed = Date.now() - start;
    const error =
      err instanceof Error && err.name === "AbortError"
        ? new Error(`timed out after ${elapsed}ms`)
        : new Error(`fetch failed after ${elapsed}ms: ${err}`);
    console.log(`[gemini:${model}] ${error.message}`);
    return { ok: false, error };
  }
}

/**
 * Tries the primary model twice (covers a single transient overload/hang),
 * then falls back to a different model entirely. A same-model retry doesn't
 * help much if the model itself is having a sustained bad moment — a
 * different model has independent capacity, so it's a real second chance
 * rather than just hoping the same problem clears up.
 */
export async function sendMessageToGemini({
  systemPrompt,
  history,
  newMessage,
}: SendMessageParams): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const contents = [
    ...history.map((m) => ({
      role: m.role === "assistant" ? ("model" as const) : ("user" as const),
      parts: [{ text: m.content }],
    })),
    { role: "user" as const, parts: [{ text: newMessage }] },
  ];

  const body = JSON.stringify({
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: { maxOutputTokens: 500 },
  });

  const attempts: { model: string; timeoutMs: number }[] = [
    { model: PRIMARY_MODEL, timeoutMs: 15_000 },
    { model: PRIMARY_MODEL, timeoutMs: 15_000 },
    { model: FALLBACK_MODEL, timeoutMs: 15_000 },
  ];

  let lastError: Error = new Error("Unknown Gemini failure");

  for (let i = 0; i < attempts.length; i++) {
    const { model, timeoutMs } = attempts[i];
    const result = await callGemini(model, apiKey, body, timeoutMs);

    if (result.ok) return result.text;

    lastError = result.error;
    if (i < attempts.length - 1) await sleep(1000);
  }

  throw new Error(`Gemini API error after all attempts: ${lastError.message}`);
}

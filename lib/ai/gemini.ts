import type { ChatMessage } from "@/lib/types/memory";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

interface SendMessageParams {
  systemPrompt: string;
  history: ChatMessage[];
  newMessage: string;
}

/**
 * Sends a message to Gemini's free-tier API. Kept behind the same function
 * signature as the Claude wrapper it replaces (lib/ai/claude.ts), so the
 * route handler and system-prompt logic didn't need to change at all —
 * only this file and its single import site.
 */
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sendMessageToGemini({
  systemPrompt,
  history,
  newMessage,
}: SendMessageParams): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  // Gemini has no separate "assistant" role name — it uses "model" instead.
  const contents = [
    ...history.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    { role: "user", parts: [{ text: newMessage }] },
  ];

  const body = JSON.stringify({
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: { maxOutputTokens: 500 },
  });

  // Gemini's free tier occasionally returns 503 "high demand" errors that
  // clear up within seconds. A couple of quick retries smooths over most
  // of these transient blips without the user ever seeing an error.
  const MAX_ATTEMPTS = 3;
  const PER_ATTEMPT_TIMEOUT_MS = 20_000;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), PER_ATTEMPT_TIMEOUT_MS);
    const attemptStart = Date.now();

    let response: Response;
    try {
      response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body,
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timeoutId);
      const elapsed = Date.now() - attemptStart;
      lastError =
        err instanceof Error && err.name === "AbortError"
          ? new Error(`Gemini request timed out after ${elapsed}ms (attempt ${attempt})`)
          : new Error(`Gemini fetch failed after ${elapsed}ms: ${err}`);
      console.log(`[gemini] Attempt ${attempt} failed: ${lastError.message}`);
      if (attempt === MAX_ATTEMPTS) break;
      await sleep(attempt * 1000);
      continue;
    }
    clearTimeout(timeoutId);
    console.log(`[gemini] Attempt ${attempt} responded in ${Date.now() - attemptStart}ms with status ${response.status}`);

    if (response.ok) {
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Gemini API returned no text content");
      return text as string;
    }

    const errorText = await response.text();
    lastError = new Error(`Gemini API error (${response.status}): ${errorText}`);

    const isRetryable = response.status === 503 || response.status === 429;
    if (!isRetryable || attempt === MAX_ATTEMPTS) break;

    await sleep(attempt * 1000); // 1s, then 2s
  }

  throw lastError;
}

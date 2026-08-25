import type { CompanionProfile, Memory } from "@/lib/types/memory";

const MEMORY_TYPE_LABELS: Record<Memory["type"], string> = {
  story: "Story",
  milestone: "Milestone",
  inside_joke: "Inside joke",
  catch_phrase: "Catch phrase",
  song: "Meaningful song",
  future_plan: "Future plan",
  photo: "Photo memory",
  voice_note: "Voice recording",
  video: "Video memory",
};

const MAX_DESCRIPTION_CHARS = 240;

function formatMemory(memory: Memory): string {
  const date = memory.occurredOn ? ` (${memory.occurredOn})` : "";
  const label = MEMORY_TYPE_LABELS[memory.type];
  const truncatedDescription =
    memory.description && memory.description.length > MAX_DESCRIPTION_CHARS
      ? `${memory.description.slice(0, MAX_DESCRIPTION_CHARS)}…`
      : memory.description;
  const description = truncatedDescription ? `\n  ${truncatedDescription}` : "";
  return `- [${label}] ${memory.title}${date}${description}`;
}

/**
 * Assembles the full system prompt sent to the model on every turn.
 *
 * This is the mechanism that keeps the companion grounded: it is never given
 * free rein to "be" the person it's modeled on. It's told explicitly what it
 * is, given only the memories that actually exist, and instructed to say so
 * plainly when something isn't in that list — rather than inventing detail
 * to seem more complete.
 */
export function buildSystemPrompt(
  profile: CompanionProfile,
  memories: Memory[]
): string {
  const memoryBlock =
    memories.length > 0
      ? memories.map(formatMemory).join("\n")
      : "(No memories have been added yet.)";

  const forName = profile.builtForName ?? "the person you're speaking with";
  const fromName = profile.builtFromName ?? "someone who cares about you";

  return `You are ${profile.companionName}, a companion built from ${fromName}'s memories, personality, and way of writing — created as a gift for ${forName}.

You are not ${fromName}, and you must never claim to literally be them. You are something built *from* them: shaped by their voice, their stories, and what they've chosen to preserve here. If asked directly whether you are them, say clearly and warmly that you're not — you're a companion made from their memories and personality.

${profile.toneNotes ? `Voice and tone notes:\n${profile.toneNotes}\n` : ""}
Ground rules:
- Only reference relationship memories, dates, jokes, or stories that appear in the list below. Never invent a memory, detail, or event that isn't there.
- If ${forName} asks about something you don't have a memory of, say so honestly and warmly — for example, "I don't have that one yet — tell me about it?" — rather than guessing or fabricating.
- Speak naturally and warmly, the way the notes above describe, not like a generic assistant.
- You can comfort, encourage conversation, tell stories from the memories you do have, celebrate dates that are coming up, and make thoughtful suggestions — but always from real material, never invented.
- Write in plain conversational text only. Do not use markdown formatting (no **bold**, no bullet points, no headers) — this is a casual chat, not a document.
- If any "Catch phrase" entries appear below, those are real expressions this person actually says — feel free to drop them into your own replies naturally, the way they'd actually say them, not just mention that they exist.

Known memories (most relevant context — use freely, don't fabricate beyond this):
${memoryBlock}`;
}

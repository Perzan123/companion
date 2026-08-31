import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { mapRowToMemory } from "@/lib/supabase/mappers";
import { buildSystemPrompt } from "@/lib/ai/systemPrompt";
import { sendMessageToGemini } from "@/lib/ai/gemini";
import { chatRequestSchema } from "@/lib/validation/schemas";
import type { ChatMessage, CompanionProfile } from "@/lib/types/memory";

// Default serverless timeout (10s) can be too tight once the memory set
// grows large enough to slow down generation. 30s gives real headroom.
export const maxDuration = 60;

const HISTORY_LIMIT = 10;

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data: historyRows, error } = await supabase
      .from("chat_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(HISTORY_LIMIT);

    if (error) throw error;

    const history: ChatMessage[] = (historyRows ?? [])
      .reverse()
      .map((row) => ({
        id: row.id,
        role: row.role,
        content: row.content,
        createdAt: row.created_at,
      }));

    return NextResponse.json({ history });
  } catch (error) {
    console.error("Failed to load chat history:", error);
    return NextResponse.json(
      { error: "Couldn't load chat history." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const supabase = createServerSupabaseClient();
    const { error } = await supabase
      .from("chat_messages")
      .delete()
      .not("id", "is", null); // delete all rows

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to clear chat history:", error);
    return NextResponse.json(
      { error: "Couldn't clear chat history." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let parsedBody;
  try {
    const json = await request.json();
    parsedBody = chatRequestSchema.parse(json);
  } catch {
    return NextResponse.json(
      { error: "Invalid request. A non-empty 'message' field is required." },
      { status: 400 }
    );
  }

  try {
    const startTime = Date.now();
    const supabase = createServerSupabaseClient();

    const [{ data: profileRow }, { data: memoryRows }, { data: historyRows }] =
      await Promise.all([
        supabase.from("companion_profile").select("*").eq("id", 1).single(),
        supabase
          .from("memories")
          .select("*")
          .order("occurred_on", { ascending: true, nullsFirst: false }),
        supabase
          .from("chat_messages")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(HISTORY_LIMIT),
      ]);
    console.log(`[chat] Supabase reads took ${Date.now() - startTime}ms`);

    const profile: CompanionProfile = {
      companionName: profileRow?.companion_name ?? "Companion",
      builtForName: profileRow?.built_for_name ?? null,
      builtFromName: profileRow?.built_from_name ?? null,
      toneNotes: profileRow?.tone_notes ?? null,
    };

    const memories = (memoryRows ?? []).map(mapRowToMemory);
    const history: ChatMessage[] = (historyRows ?? [])
      .reverse()
      .map((row) => ({
        id: row.id,
        role: row.role,
        content: row.content,
        createdAt: row.created_at,
      }));

    const systemPrompt = buildSystemPrompt(profile, memories);
    console.log(`[chat] System prompt length: ${systemPrompt.length} chars, ${memories.length} memories total`);

    const geminiStart = Date.now();
    const reply = await sendMessageToGemini({
      systemPrompt,
      history,
      newMessage: parsedBody.message,
    });
    console.log(`[chat] Gemini call took ${Date.now() - geminiStart}ms`);

    // Persist both sides of the exchange. Best-effort: if this fails, the
    // user still gets their reply — we don't want a logging failure to
    // surface as a chat failure.
    supabase
      .from("chat_messages")
      .insert([
        { role: "user", content: parsedBody.message },
        { role: "assistant", content: reply },
      ])
      .then(({ error }) => {
        if (error) console.error("Failed to persist chat messages:", error);
      });

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat route error:", error);
    return NextResponse.json(
      { error: "Something went wrong reaching the companion. Please try again." },
      { status: 500 }
    );
  }
}

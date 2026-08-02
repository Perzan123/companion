import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { mapRowToMemory, mapMemoryToRow } from "@/lib/supabase/mappers";
import { getSignedMediaUrl, uploadMemoryFile } from "@/lib/supabase/storage";
import { memoryInputSchema } from "@/lib/validation/schemas";
import type { Memory } from "@/lib/types/memory";

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data: rows, error } = await supabase
      .from("memories")
      .select("*")
      .order("occurred_on", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (error) throw error;

    const memories = await Promise.all(
      (rows ?? []).map(async (row) => {
        const memory = mapRowToMemory(row);
        if (memory.mediaUrl) {
          const signedUrl = await getSignedMediaUrl(memory.mediaUrl);
          return { ...memory, mediaUrl: signedUrl ?? memory.mediaUrl } as Memory;
        }
        return memory;
      })
    );

    return NextResponse.json({ memories });
  } catch (error) {
    console.error("Failed to list memories:", error);
    return NextResponse.json(
      { error: "Couldn't load memories." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const rawTags = formData.get("tags");
    const rawMetadata = formData.get("metadata");

    const parsed = memoryInputSchema.safeParse({
      type: formData.get("type"),
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      occurredOn: formData.get("occurredOn") || undefined,
      isFavorite: formData.get("isFavorite") === "true",
      tags: rawTags ? JSON.parse(rawTags as string) : [],
      metadata: rawMetadata ? JSON.parse(rawMetadata as string) : {},
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid memory data.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    let mediaPath: string | undefined;
    const file = formData.get("file");
    if (file instanceof File && file.size > 0) {
      mediaPath = await uploadMemoryFile(file, parsed.data.type);
    }

    const supabase = createServerSupabaseClient();
    const { data: inserted, error } = await supabase
      .from("memories")
      .insert(mapMemoryToRow({ ...parsed.data, mediaUrl: mediaPath }))
      .select()
      .single();

    if (error) throw error;

    const memory = mapRowToMemory(inserted);
    if (memory.mediaUrl) {
      const signedUrl = await getSignedMediaUrl(memory.mediaUrl);
      return NextResponse.json({
        memory: { ...memory, mediaUrl: signedUrl ?? memory.mediaUrl },
      });
    }

    return NextResponse.json({ memory });
  } catch (error) {
    console.error("Failed to create memory:", error);
    return NextResponse.json(
      { error: "Couldn't save that memory. Please try again." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { deleteMemoryFile } from "@/lib/supabase/storage";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = createServerSupabaseClient();

    const { data: existing } = await supabase
      .from("memories")
      .select("media_url")
      .eq("id", id)
      .single();

    if (existing?.media_url) {
      await deleteMemoryFile(existing.media_url);
    }

    const { error } = await supabase.from("memories").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete memory:", error);
    return NextResponse.json(
      { error: "Couldn't delete that memory." },
      { status: 500 }
    );
  }
}

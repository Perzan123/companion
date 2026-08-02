import { createServerSupabaseClient } from "@/lib/supabase/server";
import { randomUUID } from "crypto";

const BUCKET = "memories";
const SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 hour — regenerated fresh on every read

/**
 * Uploads a file to the private `memories` bucket and returns the storage
 * path (not a URL — the bucket is private, so URLs are always generated
 * fresh via createSignedUrl at read time, never stored as static links that
 * could go stale or leak if the bucket's access rules ever change).
 */
export async function uploadMemoryFile(
  file: File,
  memoryType: string
): Promise<string> {
  const supabase = createServerSupabaseClient();
  const extension = file.name.split(".").pop() ?? "bin";
  const path = `${memoryType}/${randomUUID()}.${extension}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, arrayBuffer, { contentType: file.type });

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  return path;
}

export async function getSignedMediaUrl(path: string): Promise<string | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

  if (error || !data) return null;
  return data.signedUrl;
}

export async function deleteMemoryFile(path: string): Promise<void> {
  const supabase = createServerSupabaseClient();
  await supabase.storage.from(BUCKET).remove([path]);
}

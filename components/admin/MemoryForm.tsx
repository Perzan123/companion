"use client";

import { FormEvent, useState } from "react";
import type { MemoryType } from "@/lib/types/memory";
import { Field } from "@/components/ui/Field";
import { TextInput } from "@/components/ui/TextInput";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

const TYPE_OPTIONS: { value: MemoryType; label: string; needsFile: boolean }[] = [
  { value: "story", label: "Story", needsFile: false },
  { value: "milestone", label: "Milestone", needsFile: false },
  { value: "inside_joke", label: "Inside joke", needsFile: false },
  { value: "song", label: "Meaningful song", needsFile: false },
  { value: "future_plan", label: "Future plan", needsFile: false },
  { value: "photo", label: "Photo", needsFile: true },
  { value: "voice_note", label: "Voice recording", needsFile: true },
  { value: "video", label: "Video", needsFile: true },
];

interface MemoryFormProps {
  onSubmit: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
}

export function MemoryForm({ onSubmit }: MemoryFormProps) {
  const [type, setType] = useState<MemoryType>("story");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [occurredOn, setOccurredOn] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  // Type-specific metadata fields
  const [milestoneKind, setMilestoneKind] = useState("");
  const [artist, setArtist] = useState("");
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [location, setLocation] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  const activeType = TYPE_OPTIONS.find((t) => t.value === type)!;

  function resetForm() {
    setTitle("");
    setDescription("");
    setOccurredOn("");
    setTagsInput("");
    setIsFavorite(false);
    setFile(null);
    setMilestoneKind("");
    setArtist("");
    setSpotifyUrl("");
    setTargetDate("");
    setLocation("");
    // Deliberately keep `type` as-is — batch entry usually means adding
    // several memories of the same kind in a row (e.g. a stack of photos).
  }

  function buildMetadata(): Record<string, unknown> {
    switch (type) {
      case "milestone":
        return milestoneKind ? { milestoneKind } : {};
      case "song":
        return {
          ...(artist ? { artist } : {}),
          ...(spotifyUrl ? { spotifyUrl } : {}),
        };
      case "future_plan":
        return targetDate ? { targetDate } : {};
      case "photo":
        return location ? { location } : {};
      default:
        return {};
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      setStatus({ kind: "error", message: "Give it a title first." });
      return;
    }
    if (activeType.needsFile && !file) {
      setStatus({ kind: "error", message: `${activeType.label} needs a file.` });
      return;
    }

    setIsSaving(true);
    setStatus(null);

    const formData = new FormData();
    formData.set("type", type);
    formData.set("title", title.trim());
    if (description.trim()) formData.set("description", description.trim());
    if (occurredOn) formData.set("occurredOn", occurredOn);
    formData.set("isFavorite", String(isFavorite));
    formData.set(
      "tags",
      JSON.stringify(
        tagsInput
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      )
    );
    formData.set("metadata", JSON.stringify(buildMetadata()));
    if (file) formData.set("file", file);

    const result = await onSubmit(formData);
    setIsSaving(false);

    if (result.success) {
      setStatus({ kind: "success", message: `Saved "${title.trim()}".` });
      resetForm();
    } else {
      setStatus({ kind: "error", message: result.error ?? "Something went wrong." });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Type">
        <Select value={type} onChange={(e) => setType(e.target.value as MemoryType)}>
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Title">
        <TextInput
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. The night we got caught in the rain"
        />
      </Field>

      <Field label="Description">
        <Textarea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tell the story, or add whatever context matters"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Date (optional)">
          <TextInput
            type="date"
            value={occurredOn}
            onChange={(e) => setOccurredOn(e.target.value)}
          />
        </Field>
        <Field label="Tags (comma separated)">
          <TextInput
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="funny, trip, rain"
          />
        </Field>
      </div>

      {type === "milestone" && (
        <Field label="Milestone kind">
          <Select value={milestoneKind} onChange={(e) => setMilestoneKind(e.target.value)}>
            <option value="">— Select —</option>
            <option value="first_date">First date</option>
            <option value="anniversary">Anniversary</option>
            <option value="moved_in">Moved in together</option>
            <option value="other">Other</option>
          </Select>
        </Field>
      )}

      {type === "song" && (
        <div className="grid grid-cols-2 gap-4">
          <Field label="Artist">
            <TextInput value={artist} onChange={(e) => setArtist(e.target.value)} />
          </Field>
          <Field label="Spotify link (optional)">
            <TextInput value={spotifyUrl} onChange={(e) => setSpotifyUrl(e.target.value)} />
          </Field>
        </div>
      )}

      {type === "future_plan" && (
        <Field label="Target date (optional)">
          <TextInput
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />
        </Field>
      )}

      {type === "photo" && (
        <Field label="Location (optional)">
          <TextInput value={location} onChange={(e) => setLocation(e.target.value)} />
        </Field>
      )}

      {activeType.needsFile && (
        <Field label={`${activeType.label} file`}>
          <input
            type="file"
            accept={
              type === "photo" ? "image/*" : type === "video" ? "video/*" : "audio/*"
            }
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-text-muted file:mr-4 file:rounded-lg file:border-0 file:bg-accent-gold file:px-4 file:py-2 file:text-sm file:font-medium file:text-background"
          />
        </Field>
      )}

      <label className="flex items-center gap-2 text-sm text-text-muted">
        <input
          type="checkbox"
          checked={isFavorite}
          onChange={(e) => setIsFavorite(e.target.checked)}
          className="h-4 w-4 rounded border-border accent-[var(--color-gold)]"
        />
        Mark as favorite
      </label>

      {status && (
        <p
          role="status"
          className={status.kind === "success" ? "text-sm text-accent-gold" : "text-sm text-accent-rose"}
        >
          {status.message}
        </p>
      )}

      <Button type="submit" isLoading={isSaving} className="w-full">
        Save memory
      </Button>
    </form>
  );
}

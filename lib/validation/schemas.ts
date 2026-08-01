import { z } from "zod";

const baseMemoryFields = {
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(5000).optional(),
  occurredOn: z.string().date().optional(), // "YYYY-MM-DD"
  isFavorite: z.boolean().default(false),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  mediaUrl: z.string().url().optional(),
  mediaThumbnailUrl: z.string().url().optional(),
};

export const storyMemorySchema = z.object({
  type: z.literal("story"),
  ...baseMemoryFields,
  metadata: z.object({}).default({}),
});

export const milestoneMemorySchema = z.object({
  type: z.literal("milestone"),
  ...baseMemoryFields,
  metadata: z
    .object({
      milestoneKind: z
        .enum(["first_date", "anniversary", "moved_in", "other"])
        .optional(),
    })
    .default({}),
});

export const insideJokeMemorySchema = z.object({
  type: z.literal("inside_joke"),
  ...baseMemoryFields,
  metadata: z.object({}).default({}),
});

export const songMemorySchema = z.object({
  type: z.literal("song"),
  ...baseMemoryFields,
  metadata: z
    .object({
      artist: z.string().trim().max(200).optional(),
      spotifyUrl: z.string().url().optional(),
    })
    .default({}),
});

export const futurePlanMemorySchema = z.object({
  type: z.literal("future_plan"),
  ...baseMemoryFields,
  metadata: z
    .object({
      targetDate: z.string().date().optional(),
    })
    .default({}),
});

export const photoMemorySchema = z.object({
  type: z.literal("photo"),
  ...baseMemoryFields,
  metadata: z
    .object({
      location: z.string().trim().max(200).optional(),
    })
    .default({}),
});

export const voiceNoteMemorySchema = z.object({
  type: z.literal("voice_note"),
  ...baseMemoryFields,
  metadata: z
    .object({
      durationSeconds: z.number().positive().optional(),
    })
    .default({}),
});

export const videoMemorySchema = z.object({
  type: z.literal("video"),
  ...baseMemoryFields,
  metadata: z
    .object({
      durationSeconds: z.number().positive().optional(),
    })
    .default({}),
});

export const memoryInputSchema = z.discriminatedUnion("type", [
  storyMemorySchema,
  milestoneMemorySchema,
  insideJokeMemorySchema,
  songMemorySchema,
  futurePlanMemorySchema,
  photoMemorySchema,
  voiceNoteMemorySchema,
  videoMemorySchema,
]);

export type MemoryInput = z.infer<typeof memoryInputSchema>;

export const chatRequestSchema = z.object({
  message: z.string().trim().min(1).max(4000),
});

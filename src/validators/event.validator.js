import { z } from "zod";

const futureDate = z
  .string()
  .datetime({ offset: true })
  .transform((value) => new Date(value))
  .refine((value) => value.getTime() > Date.now(), {
    message: "Event date must be in the future",
  });

const httpUrl = z.string().trim().max(2048).url().refine(
  (value) => {
    try {
      return ["http:", "https:"].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  },
  { message: "Thumbnail must use HTTP or HTTPS" }
);

export const createEventSchema = z
  .object({
    title: z.string().trim().min(1).max(120),
    description: z.string().trim().min(1).max(5000),
    eventType: z.string().trim().min(1).max(80),
    thumbnail: httpUrl,
    location: z.string().trim().min(1).max(200),
    eventDate: futureDate,
  })
  .strict();

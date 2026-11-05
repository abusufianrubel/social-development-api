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

const eventFields = {
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(5000),
  eventType: z.string().trim().min(1).max(80),
  thumbnail: httpUrl,
  location: z.string().trim().min(1).max(200),
  eventDate: futureDate,
};

export const createEventSchema = z.object(eventFields).strict();

export const updateEventSchema = z
  .object(eventFields)
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one event field must be provided",
  });

const optionalSearchText = z.string().trim().min(1).max(100).optional();

export const upcomingEventsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(12),
    eventType: optionalSearchText,
    location: optionalSearchText,
    search: optionalSearchText,
  })
  .strict();

export const paginationQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(12),
  })
  .strict();

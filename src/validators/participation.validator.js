import { z } from "zod";

export const joinEventSchema = z
  .object({
    eventId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid event ID"),
  })
  .strict();

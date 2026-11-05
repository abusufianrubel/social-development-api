import { z } from "zod";

const profileImageUrl = z
  .string()
  .trim()
  .max(2048)
  .url()
  .refine(
    (value) => {
      try {
        return ["http:", "https:"].includes(new URL(value).protocol);
      } catch {
        return false;
      }
    },
    { message: "Profile image must use HTTP or HTTPS" }
  );

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    image: profileImageUrl.nullable().optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one profile field must be provided",
  });

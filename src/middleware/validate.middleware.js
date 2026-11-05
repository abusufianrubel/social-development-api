import { sendError } from "../utils/api-response.js";

export const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    return sendError(res, {
      statusCode: 400,
      message: "Invalid request body",
      errors: result.error.issues.map((issue) => ({
        field:
          issue.path.join(".") || issue.keys?.join(", ") || "body",
        message: issue.message,
      })),
    });
  }

  req.validatedBody = result.data;
  return next();
};

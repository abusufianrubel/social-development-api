import { sendError } from "../utils/api-response.js";

const sendValidationError = (res, result, message) =>
  sendError(res, {
    statusCode: 400,
    message,
    errors: result.error.issues.map((issue) => ({
      field: issue.path.join(".") || "request",
      message: issue.message,
    })),
  });

export const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    return sendValidationError(res, result, "Invalid request body");
  }

  req.validatedBody = result.data;
  return next();
};

export const validateQuery = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.query);

  if (!result.success) {
    return sendValidationError(res, result, "Invalid query parameters");
  }

  req.validatedQuery = result.data;
  return next();
};

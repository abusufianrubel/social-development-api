import { sendError } from "../utils/api-response.js";

export const notFoundHandler = (_req, res) =>
  sendError(res, {
    statusCode: 404,
    message: "Route not found",
  });

export const errorHandler = (error, _req, res, _next) => {
  const candidateStatus = error.statusCode ?? error.status;
  const statusCode =
    Number.isInteger(candidateStatus) &&
    candidateStatus >= 400 &&
    candidateStatus <= 599
      ? candidateStatus
      : 500;

  if (statusCode >= 500) {
    console.error("Unhandled API error:", error.message);
  }

  return sendError(res, {
    statusCode,
    message:
      statusCode >= 500
        ? "Internal server error"
        : error.message || "Request failed",
  });
};

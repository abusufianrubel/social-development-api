import { sendError } from "../utils/api-response.js";

export const requireResourceOwner = (resolveOwnerId) => {
  if (typeof resolveOwnerId !== "function") {
    throw new TypeError("resolveOwnerId must be a function");
  }

  return async (req, res, next) => {
    if (!req.auth?.user?.id) {
      return sendError(res, {
        statusCode: 401,
        message: "Authentication required",
      });
    }

    try {
      const ownerId = await resolveOwnerId(req);

      if (ownerId === undefined) {
        return sendError(res, {
          statusCode: 404,
          message: "Resource not found",
        });
      }

      if (
        ownerId === null ||
        String(ownerId) !== req.auth.user.id
      ) {
        return sendError(res, {
          statusCode: 403,
          message: "You are not allowed to access this resource",
        });
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
};

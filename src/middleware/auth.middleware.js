import { createRemoteJWKSet, jwtVerify } from "jose";
import { sendError } from "../utils/api-response.js";
import { resolveJwtConfiguration } from "../config/jwt.js";

const isJwksUnavailable = (error) =>
  error instanceof TypeError ||
  ["ERR_JWKS_INVALID", "ERR_JWKS_TIMEOUT"].includes(error?.code);

const sendUnauthorized = (res, message) => {
  res.set("WWW-Authenticate", "Bearer");
  return sendError(res, { statusCode: 401, message });
};

export const createJwtAuthMiddleware = (
  configuration = resolveJwtConfiguration()
) => {
  const jwks = createRemoteJWKSet(configuration.jwksUrl);

  return async (req, res, next) => {
    const authorization = req.get("authorization");
    const match =
      typeof authorization === "string" &&
      authorization.match(/^Bearer\s+([^\s,]+)$/i);

    if (!match) {
      return sendUnauthorized(res, "Authentication required");
    }

    try {
      const { payload } = await jwtVerify(match[1], jwks, {
        algorithms: ["EdDSA"],
        issuer: configuration.issuer,
        audience: configuration.audience,
        requiredClaims: ["sub", "exp", "iss", "aud"],
      });

      if (typeof payload.sub !== "string" || payload.sub.length === 0) {
        return sendUnauthorized(res, "Invalid or expired bearer token");
      }

      req.auth = {
        user: {
          id: payload.sub,
          email: typeof payload.email === "string" ? payload.email : null,
          name: typeof payload.name === "string" ? payload.name : null,
        },
        claims: payload,
      };

      return next();
    } catch (error) {
      if (isJwksUnavailable(error)) {
        return sendError(res, {
          statusCode: 503,
          message: "Authentication service is temporarily unavailable",
        });
      }

      return sendUnauthorized(res, "Invalid or expired bearer token");
    }
  };
};

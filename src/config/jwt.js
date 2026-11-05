import { resolveApiPrefix } from "./api-prefix.js";

const resolveHttpUrl = (value, label, isProduction) => {
  let url;

  try {
    url = new URL(value);
  } catch {
    throw new Error(`${label} must be a valid HTTP or HTTPS URL`);
  }

  if (
    !["http:", "https:"].includes(url.protocol) ||
    (isProduction && url.protocol !== "https:")
  ) {
    throw new Error(
      `${label} must use ${isProduction ? "HTTPS" : "HTTP or HTTPS"}`
    );
  }

  return url;
};

export const resolveJwtConfiguration = (
  env = process.env,
  apiPrefix = resolveApiPrefix(env)
) => {
  if (!env.BETTER_AUTH_URL) {
    throw new Error("BETTER_AUTH_URL must be configured");
  }

  const isProduction = env.NODE_ENV === "production";
  const authUrl = resolveHttpUrl(
    env.BETTER_AUTH_URL,
    "BETTER_AUTH_URL",
    isProduction
  );
  const jwksUrl = env.BETTER_AUTH_JWKS_URL
    ? resolveHttpUrl(
        env.BETTER_AUTH_JWKS_URL,
        "BETTER_AUTH_JWKS_URL",
        isProduction
      )
    : new URL(`${apiPrefix}/auth/jwks`, authUrl);

  return {
    jwksUrl,
    issuer: env.BETTER_AUTH_JWT_ISSUER || env.BETTER_AUTH_URL,
    audience: env.BETTER_AUTH_JWT_AUDIENCE || env.BETTER_AUTH_URL,
  };
};

export const resolveApiPrefix = (env = process.env) => {
  const prefix = env.API_PREFIX?.trim() || "/api/v1";

  if (
    !prefix.startsWith("/") ||
    prefix.includes("//") ||
    /[^a-zA-Z0-9/_-]/.test(prefix)
  ) {
    throw new Error("API_PREFIX must be a URL path such as /api/v1");
  }

  const normalizedPrefix = prefix.replace(/\/+$/, "");
  if (!normalizedPrefix) {
    throw new Error("API_PREFIX must include a path segment");
  }

  return normalizedPrefix;
};

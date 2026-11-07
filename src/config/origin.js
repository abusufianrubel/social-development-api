export const normalizeOrigin = (value) => {
  const url = new URL(value);

  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    throw new Error("CLIENT_URL must be an HTTP(S) origin without a path");
  }

  return url.origin;
};

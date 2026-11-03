import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { resolveApiPrefix } from "./api-prefix.js";

const getSocialProviders = (env) => {
  const providers = {};

  for (const provider of ["google", "github"]) {
    const prefix = provider.toUpperCase();
    const clientId = env[`${prefix}_CLIENT_ID`];
    const clientSecret = env[`${prefix}_CLIENT_SECRET`];

    if (Boolean(clientId) !== Boolean(clientSecret)) {
      throw new Error(
        `Both ${prefix}_CLIENT_ID and ${prefix}_CLIENT_SECRET are required`
      );
    }

    if (clientId && clientSecret) {
      providers[provider] = { clientId, clientSecret };
    }
  }

  return providers;
};

export const createAuth = (database, env = process.env) => {
  if (!database) {
    throw new Error("MongoDB must be connected before initializing Better Auth");
  }

  if (!env.BETTER_AUTH_SECRET) {
    throw new Error("BETTER_AUTH_SECRET must be configured");
  }

  if (
    env.NODE_ENV === "production" &&
    env.BETTER_AUTH_SECRET.length < 32
  ) {
    throw new Error("BETTER_AUTH_SECRET must be at least 32 characters long");
  }

  if (!env.BETTER_AUTH_URL) {
    throw new Error("BETTER_AUTH_URL must be configured");
  }

  if (!env.CLIENT_URL) {
    throw new Error("CLIENT_URL must be configured");
  }

  return betterAuth({
    appName: "Social Development API",
    baseURL: env.BETTER_AUTH_URL,
    basePath: `${resolveApiPrefix(env)}/auth`,
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: [env.CLIENT_URL],
    database: mongodbAdapter(database, {
      client: database.client,
    }),
    emailAndPassword: {
      enabled: true,
    },
    socialProviders: getSocialProviders(env),
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
    },
  });
};

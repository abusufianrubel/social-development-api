import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { test } from "node:test";
import { createAuth } from "../src/config/auth.js";
import { resolveApiPrefix } from "../src/config/api-prefix.js";

const validEnvironment = {
  BETTER_AUTH_SECRET: randomBytes(32).toString("base64url"),
  BETTER_AUTH_URL: "http://localhost:8000",
  CLIENT_URL: "http://localhost:3000",
  API_PREFIX: "/api/v1",
};

test("enables Better Auth JWT and JWKS endpoints", () => {
  const auth = createAuth({ collection() {} }, validEnvironment);

  assert.equal(typeof auth.api.getToken, "function");
  assert.equal(typeof auth.api.getJwks, "function");
});

test("requires a connected MongoDB database and secure auth secret", () => {
  assert.throws(
    () => createAuth(undefined, validEnvironment),
    /MongoDB must be connected/
  );
  assert.throws(
    () =>
      createAuth(
        {},
        {
          ...validEnvironment,
          BETTER_AUTH_SECRET: "too-short",
          NODE_ENV: "production",
        }
      ),
    /at least 32 characters/
  );
});

test("requires both credentials when an OAuth provider is partially configured", () => {
  assert.throws(
    () =>
      createAuth(
        { collection() {} },
        {
          ...validEnvironment,
          GOOGLE_CLIENT_ID: "client-id",
        }
      ),
    /Both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required/
  );
});

test("normalizes and validates the common API prefix", () => {
  assert.equal(resolveApiPrefix({ API_PREFIX: "/api/v1/" }), "/api/v1");
  assert.throws(
    () => resolveApiPrefix({ API_PREFIX: "api/v1" }),
    /must be a URL path/
  );
  assert.throws(
    () => resolveApiPrefix({ API_PREFIX: "/" }),
    /must include a path segment/
  );
});

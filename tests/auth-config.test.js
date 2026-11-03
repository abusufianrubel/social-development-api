import assert from "node:assert/strict";
import { test } from "node:test";
import { createAuth } from "../src/config/auth.js";
import { resolveApiPrefix } from "../src/config/api-prefix.js";

const validEnvironment = {
  BETTER_AUTH_SECRET: "a".repeat(32),
  BETTER_AUTH_URL: "http://localhost:8000",
  CLIENT_URL: "http://localhost:3000",
  API_PREFIX: "/api/v1",
};

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

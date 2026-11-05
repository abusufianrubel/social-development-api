import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import express from "express";
import {
  exportJWK,
  generateKeyPair,
  SignJWT,
} from "jose";
import { createApp } from "../src/app.js";
import { resolveJwtConfiguration } from "../src/config/jwt.js";
import { createJwtAuthMiddleware } from "../src/middleware/auth.middleware.js";
import { requireResourceOwner } from "../src/middleware/authorization.middleware.js";

const issuer = "https://auth.example.test";
const audience = "social-development-api";
const keyPair = await generateKeyPair("EdDSA");
const publicJwk = await exportJWK(keyPair.publicKey);
publicJwk.kid = "test-key";
publicJwk.alg = "EdDSA";
publicJwk.use = "sig";

let appServer;
let jwksServer;
let baseUrl;
let configuration;

const createToken = async ({
  subject = "user-123",
  tokenIssuer = issuer,
  tokenAudience = audience,
  expiration = "2m",
  privateKey = keyPair.privateKey,
} = {}) =>
  new SignJWT({ email: "person@example.com", name: "Test User" })
    .setProtectedHeader({ alg: "EdDSA", kid: "test-key" })
    .setIssuer(tokenIssuer)
    .setAudience(tokenAudience)
    .setSubject(subject)
    .setIssuedAt()
    .setExpirationTime(expiration)
    .sign(privateKey);

before(async () => {
  jwksServer = express()
    .get("/jwks", (_req, res) => res.json({ keys: [publicJwk] }))
    .listen(0);
  await new Promise((resolve) => jwksServer.once("listening", resolve));

  configuration = {
    jwksUrl: new URL(`http://127.0.0.1:${jwksServer.address().port}/jwks`),
    issuer,
    audience,
  };

  const app = createApp(
    undefined,
    "/api/v1",
    { authenticate: createJwtAuthMiddleware(configuration) }
  );
  appServer = app.listen(0);
  await new Promise((resolve) => appServer.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${appServer.address().port}`;
});

after(async () => {
  await Promise.all(
    [appServer, jwksServer].map(
      (server) =>
        new Promise((resolve, reject) =>
          server.close((error) => (error ? reject(error) : resolve()))
        )
    )
  );
});

test("resolves Better Auth issuer, audience, and JWKS endpoint", () => {
  const resolved = resolveJwtConfiguration({
    BETTER_AUTH_URL: "https://auth.example.test",
    API_PREFIX: "/api/v2",
    NODE_ENV: "production",
  });

  assert.equal(resolved.issuer, "https://auth.example.test");
  assert.equal(resolved.audience, "https://auth.example.test");
  assert.equal(
    resolved.jwksUrl.href,
    "https://auth.example.test/api/v2/auth/jwks"
  );
  assert.throws(
    () =>
      resolveJwtConfiguration({
        BETTER_AUTH_URL: "http://auth.example.test",
        NODE_ENV: "production",
      }),
    /must use HTTPS/
  );
});

test("accepts a valid Better Auth JWT and exposes verified identity", async () => {
  const token = await createToken();
  const response = await fetch(`${baseUrl}/api/v1/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body.data.user, {
    id: "user-123",
    email: "person@example.com",
    name: "Test User",
  });
});

test("rejects a missing, opaque, or malformed bearer token", async () => {
  const responses = await Promise.all([
    fetch(`${baseUrl}/api/v1/users/me`),
    fetch(`${baseUrl}/api/v1/users/me`, {
      headers: { Authorization: "Bearer better-auth-session-cookie" },
    }),
    fetch(`${baseUrl}/api/v1/users/me`, {
      headers: { Authorization: "Bearer not.a.jwt" },
    }),
  ]);
  const bodies = await Promise.all(responses.map((response) => response.json()));

  for (const response of responses) {
    assert.equal(response.status, 401);
    assert.equal(response.headers.get("www-authenticate"), "Bearer");
  }
  assert.equal(bodies[0].message, "Authentication required");
  assert.equal(bodies[1].message, "Invalid or expired bearer token");
  assert.equal(bodies[2].message, "Invalid or expired bearer token");
});

test("rejects expired tokens and issuer or audience mismatches", async () => {
  const tokens = await Promise.all([
    createToken({ expiration: "0 seconds" }),
    createToken({ tokenIssuer: "https://other.example.test" }),
    createToken({ tokenAudience: "another-api" }),
  ]);
  const responses = await Promise.all(
    tokens.map((token) =>
      fetch(`${baseUrl}/api/v1/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    )
  );

  assert.deepEqual(
    responses.map((response) => response.status),
    [401, 401, 401]
  );
});

test("rejects a JWT signed by a key outside the configured JWKS", async () => {
  const otherKeyPair = await generateKeyPair("EdDSA");
  const token = await createToken({ privateKey: otherKeyPair.privateKey });
  const response = await fetch(`${baseUrl}/api/v1/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  assert.equal(response.status, 401);
});

test("resource owner guard permits only the verified owner's resource", async () => {
  const guard = requireResourceOwner((req) => req.params.ownerId);
  const runGuard = async (ownerId, authenticatedUserId) => {
    const req = {
      params: { ownerId },
      auth: { user: { id: authenticatedUserId } },
    };
    const res = {
      statusCode: 200,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(body) {
        this.body = body;
        return this;
      },
    };
    let passed = false;

    await guard(req, res, () => {
      passed = true;
    });

    return { res, passed };
  };

  const ownerRequest = await runGuard("user-123", "user-123");
  const otherUserRequest = await runGuard("user-456", "user-123");
  const missingResourceRequest = await runGuard(undefined, "user-123");
  const unauthenticatedRequest = await runGuard("user-123", undefined);

  assert.equal(ownerRequest.passed, true);
  assert.equal(otherUserRequest.res.statusCode, 403);
  assert.equal(missingResourceRequest.res.statusCode, 404);
  assert.equal(unauthenticatedRequest.res.statusCode, 401);
});

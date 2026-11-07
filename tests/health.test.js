import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import mongoose from "mongoose";
import app, { createApp } from "../src/app.js";

let server;
let authServer;
let baseUrl;
let authBaseUrl;
let originalReadyState;
let originalDbDescriptor;

before(async () => {
  originalReadyState = mongoose.connection.readyState;
  originalDbDescriptor = Object.getOwnPropertyDescriptor(
    mongoose.connection,
    "db"
  );
  server = app.listen(0);
  const authApp = createApp((req, res) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          path: req.url,
          body: Buffer.concat(chunks).toString(),
        })
      );
    });
  });
  authServer = authApp.listen(0);

  await Promise.all(
    [server, authServer].map(
      (listener) =>
        new Promise((resolve) => listener.once("listening", resolve))
    )
  );
  baseUrl = `http://127.0.0.1:${server.address().port}`;
  authBaseUrl = `http://127.0.0.1:${authServer.address().port}`;
});

after(async () => {
  await Promise.all(
    [server, authServer].map(
      (listener) =>
        new Promise((resolve, reject) => {
          listener.close((error) => (error ? reject(error) : resolve()));
        })
    )
  );

  mongoose.connection.readyState = originalReadyState;
  if (originalDbDescriptor) {
    Object.defineProperty(mongoose.connection, "db", originalDbDescriptor);
  } else {
    delete mongoose.connection.db;
  }
});

test("returns healthy status when MongoDB responds to ping", async () => {
  mongoose.connection.readyState = 1;
  Object.defineProperty(mongoose.connection, "db", {
    configurable: true,
    value: {
      admin: () => ({
        ping: async () => ({ ok: 1 }),
      }),
    },
  });

  const response = await fetch(`${baseUrl}/api/v1/health`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.status, "healthy");
  assert.equal(body.service, "social-development-api");
  assert.equal(body.dependencies.mongodb.status, "healthy");
  assert.ok(Number.isFinite(body.uptime));
  assert.ok(Number.isFinite(Date.parse(body.timestamp)));
});

test("returns service unavailable when MongoDB is disconnected", async () => {
  mongoose.connection.readyState = 0;

  const response = await fetch(`${baseUrl}/api/v1/health`);
  const body = await response.json();

  assert.equal(response.status, 503);
  assert.equal(body.status, "unhealthy");
  assert.equal(body.dependencies.mongodb.status, "unhealthy");
});

test("returns service unavailable when MongoDB ping fails", async () => {
  mongoose.connection.readyState = 1;
  Object.defineProperty(mongoose.connection, "db", {
    configurable: true,
    value: {
      admin: () => ({
        ping: async () => {
          throw new Error("database credentials must not be exposed");
        },
      }),
    },
  });

  const response = await fetch(`${baseUrl}/api/v1/health`);
  const body = await response.json();

  assert.equal(response.status, 503);
  assert.equal(body.status, "unhealthy");
  assert.equal(body.dependencies.mongodb.status, "unhealthy");
  assert.equal(JSON.stringify(body).includes("credentials"), false);
});

test("returns a consistent JSON response for unknown routes", async () => {
  const response = await fetch(`${baseUrl}/api/v1/not-found`);
  const body = await response.json();

  assert.equal(response.status, 404);
  assert.deepEqual(body, {
    success: false,
    message: "Route not found",
  });
});

test("forwards Better Auth requests before Express body parsing", async () => {
  const response = await fetch(`${authBaseUrl}/api/v1/auth/sign-in/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "person@example.com" }),
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.path, "/api/v1/auth/sign-in/email");
  assert.equal(body.body, JSON.stringify({ email: "person@example.com" }));
});

test("normalizes the configured frontend origin for CORS", async () => {
  const previousClientUrl = process.env.CLIENT_URL;
  process.env.CLIENT_URL = "https://social-development-web.vercel.app/";
  const corsApp = createApp();
  const corsServer = corsApp.listen(0);

  await new Promise((resolve) => corsServer.once("listening", resolve));
  const corsBaseUrl = `http://127.0.0.1:${corsServer.address().port}`;

  try {
    const response = await fetch(`${corsBaseUrl}/api/v1/health`, {
      method: "OPTIONS",
      headers: {
        Origin: "https://social-development-web.vercel.app",
        "Access-Control-Request-Method": "GET",
      },
    });

    assert.equal(response.status, 204);
    assert.equal(
      response.headers.get("access-control-allow-origin"),
      "https://social-development-web.vercel.app"
    );
    assert.equal(response.headers.get("access-control-allow-credentials"), "true");
  } finally {
    await new Promise((resolve, reject) => {
      corsServer.close((error) => (error ? reject(error) : resolve()));
    });
    if (previousClientUrl === undefined) {
      delete process.env.CLIENT_URL;
    } else {
      process.env.CLIENT_URL = previousClientUrl;
    }
  }
});

test("mounts the API root and auth handler under a custom API prefix", async () => {
  const customPrefixApp = createApp(
    (_req, res) => res.status(200).json({ success: true }),
    "/custom/v2"
  );
  const customServer = customPrefixApp.listen(0);

  await new Promise((resolve) => customServer.once("listening", resolve));
  const customBaseUrl = `http://127.0.0.1:${customServer.address().port}`;

  try {
    const [rootResponse, authResponse, oldPrefixResponse] = await Promise.all([
      fetch(`${customBaseUrl}/custom/v2`),
      fetch(`${customBaseUrl}/custom/v2/auth/check`),
      fetch(`${customBaseUrl}/api/v1/auth/check`),
    ]);

    assert.equal(rootResponse.status, 200);
    assert.equal(authResponse.status, 200);
    assert.equal(oldPrefixResponse.status, 404);
  } finally {
    await new Promise((resolve, reject) => {
      customServer.close((error) => (error ? reject(error) : resolve()));
    });
  }
});

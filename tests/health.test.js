import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import mongoose from "mongoose";
import app from "../src/app.js";

let server;
let baseUrl;
let originalReadyState;
let originalDbDescriptor;

before(async () => {
  originalReadyState = mongoose.connection.readyState;
  originalDbDescriptor = Object.getOwnPropertyDescriptor(
    mongoose.connection,
    "db"
  );
  server = app.listen(0);

  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });

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

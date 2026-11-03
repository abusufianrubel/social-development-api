import assert from "node:assert/strict";
import { test } from "node:test";
import { errorHandler } from "../src/middleware/error.middleware.js";

const createResponse = () => ({
  statusCode: undefined,
  body: undefined,
  status(statusCode) {
    this.statusCode = statusCode;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
});

test("hides internal error details in server error responses", () => {
  const response = createResponse();
  const originalConsoleError = console.error;
  console.error = () => {};

  try {
    errorHandler(
      new Error("sensitive database detail"),
      {},
      response,
      () => {}
    );
  } finally {
    console.error = originalConsoleError;
  }

  assert.equal(response.statusCode, 500);
  assert.deepEqual(response.body, {
    success: false,
    message: "Internal server error",
  });
});

test("preserves client error status and message", () => {
  const response = createResponse();

  errorHandler(
    Object.assign(new Error("Invalid request"), { statusCode: 400 }),
    {},
    response,
    () => {}
  );

  assert.equal(response.statusCode, 400);
  assert.deepEqual(response.body, {
    success: false,
    message: "Invalid request",
  });
});

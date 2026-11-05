import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createApp } from "../src/app.js";
import { createEventService } from "../src/services/event.service.js";
import { createEventSchema } from "../src/validators/event.validator.js";

const authenticatedUser = {
  id: "verified-user-id",
  email: "verified@example.com",
};

let server;
let baseUrl;
const createdEvents = [];

const app = createApp(undefined, "/api/v1", {
  authenticate(req, _res, next) {
    req.auth = { user: authenticatedUser };
    next();
  },
  eventService: {
    async createEvent(eventData, user) {
      const event = {
        _id: "event-id",
        ...eventData,
        creatorId: user.id,
        creatorEmail: user.email,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      createdEvents.push(event);
      return event;
    },
  },
});

const validEvent = () => ({
  title: "Community Garden",
  description: "Plant vegetables in the community garden.",
  eventType: "Environment",
  thumbnail: "https://example.com/garden.jpg",
  location: "Community Center",
  eventDate: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
});

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve()))
  );
});

test("validates event title, description, type, URL, location, and future date", () => {
  const parsed = createEventSchema.safeParse(validEvent());

  assert.equal(parsed.success, true);
  assert.ok(parsed.data.eventDate instanceof Date);

  for (const invalidEvent of [
    { ...validEvent(), title: "  " },
    { ...validEvent(), description: "" },
    { ...validEvent(), eventType: "" },
    { ...validEvent(), thumbnail: "javascript:alert(1)" },
    { ...validEvent(), thumbnail: "not-a-url" },
    { ...validEvent(), location: "" },
    { ...validEvent(), eventDate: "not-a-date" },
    {
      ...validEvent(),
      eventDate: new Date(Date.now() - 60 * 1000).toISOString(),
    },
    { ...validEvent(), creatorId: "attacker-controlled-id" },
  ]) {
    assert.equal(createEventSchema.safeParse(invalidEvent).success, false);
  }
});

test("creates an event with authenticated ownership and server timestamps", async () => {
  const response = await fetch(`${baseUrl}/api/v1/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validEvent()),
  });
  const result = await response.json();

  assert.equal(response.status, 201);
  assert.equal(result.success, true);
  assert.equal(result.message, "Event created successfully");
  assert.equal(result.data.event.creatorId, authenticatedUser.id);
  assert.equal(result.data.event.creatorEmail, authenticatedUser.email);
  assert.ok(result.data.event.createdAt);
  assert.ok(result.data.event.updatedAt);
});

test("rejects client-supplied ownership fields and invalid event data", async () => {
  const invalidBodies = [
    { ...validEvent(), creatorId: "attacker-controlled-id" },
    {},
    { ...validEvent(), eventDate: new Date(Date.now() - 60 * 1000).toISOString() },
  ];

  for (const body of invalidBodies) {
    const response = await fetch(`${baseUrl}/api/v1/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = await response.json();

    assert.equal(response.status, 400);
    assert.equal(result.success, false);
    assert.equal(result.message, "Invalid request body");
  }

  const ownershipResponse = await fetch(`${baseUrl}/api/v1/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(invalidBodies[0]),
  });
  const ownershipResult = await ownershipResponse.json();

  assert.ok(ownershipResult.errors.some((issue) => issue.field === "creatorId"));
  assert.equal(createdEvents.length, 1);
});

test("event service stores only verified creator identity and leaves timestamps to Mongoose", async () => {
  let insertedEvent;
  const service = createEventService({
    async create(event) {
      insertedEvent = event;
      return event;
    },
  });
  const eventData = createEventSchema.parse(validEvent());

  await service.createEvent(eventData, authenticatedUser);

  assert.equal(insertedEvent.creatorId, authenticatedUser.id);
  assert.equal(insertedEvent.creatorEmail, authenticatedUser.email);
  assert.equal("createdAt" in insertedEvent, false);
  assert.equal("updatedAt" in insertedEvent, false);
});

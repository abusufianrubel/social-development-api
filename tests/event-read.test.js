import assert from "node:assert/strict";
import { test } from "node:test";
import { createApp } from "../src/app.js";
import { createEventService } from "../src/services/event.service.js";

test("upcoming events query excludes past events and applies pagination and filters", async () => {
  let capturedFilter;
  let capturedSkip;
  let capturedLimit;
  const query = {
    sort(value) { assert.deepEqual(value, { eventDate: 1 }); return this; },
    skip(value) { capturedSkip = value; return this; },
    limit(value) { capturedLimit = value; return this; },
    async lean() { return [{ _id: "event-1" }]; },
  };
  const fakeModel = {
    find(filter) { capturedFilter = filter; return query; },
    async countDocuments(filter) {
      assert.equal(filter, capturedFilter);
      return 1;
    },
  };

  const result = await createEventService(fakeModel).getUpcomingEvents({
    page: 2, limit: 5, eventType: "Cleanup", location: "Mirpur", search: "park",
  });

  assert.ok(capturedFilter.eventDate.$gt instanceof Date);
  assert.equal(capturedFilter.eventType, "Cleanup");
  assert.match(capturedFilter.location.$regex, /Mirpur/);
  assert.equal(capturedFilter.$or.length, 3);
  assert.equal(capturedSkip, 5);
  assert.equal(capturedLimit, 5);
  assert.deepEqual(result.pagination, { page: 2, limit: 5, total: 1, totalPages: 1 });
});

test("recent upcoming events query sorts by date and applies MongoDB limit six", async () => {
  let capturedFilter;
  let capturedLimit;
  const query = {
    sort(value) { assert.deepEqual(value, { eventDate: 1 }); return this; },
    limit(value) { capturedLimit = value; return this; },
    async lean() { return []; },
  };
  const fakeModel = { find(filter) { capturedFilter = filter; return query; } };

  const result = await createEventService(fakeModel).getRecentUpcomingEvents();

  assert.ok(capturedFilter.eventDate.$gt instanceof Date);
  assert.equal(capturedLimit, 6);
  assert.deepEqual(result, []);
});

test("event details reject malformed IDs and return 404 for missing events", async () => {
  const service = createEventService({
    findById() { return { lean: async () => null }; },
  });

  await assert.rejects(
    service.getEventById("not-an-object-id"),
    { statusCode: 400, message: "Invalid event ID" }
  );
  await assert.rejects(
    service.getEventById("507f1f77bcf86cd799439011"),
    { statusCode: 404, message: "Event not found" }
  );
});

test("event retrieval endpoints are public and return the documented response shape", async (t) => {
  const sampleEvent = { _id: "507f1f77bcf86cd799439011", title: "Park Cleanup" };
  const eventService = {
    async getUpcomingEvents(query) {
      assert.equal(query.page, 1);
      return { events: [sampleEvent], pagination: { page: 1, limit: 12, total: 1, totalPages: 1 } };
    },
    async getRecentUpcomingEvents() { return [sampleEvent]; },
    async getEventById(id) { assert.equal(id, sampleEvent._id); return sampleEvent; },
  };
  const app = createApp(undefined, "/api/v1", {
    authenticate(_req, res) { res.sendStatus(401); },
    eventService,
  });
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(() => new Promise((resolve, reject) =>
    server.close((error) => error ? reject(error) : resolve())
  ));
  const baseUrl = `http://127.0.0.1:${server.address().port}/api/v1`;

  for (const [path, expected] of [
    ["/events", "upcoming events retrieved successfully"],
    ["/events/recent", "recent upcoming events retrieved successfully"],
    [`/events/${sampleEvent._id}`, "event retrieved successfully"],
  ]) {
    const response = await fetch(`${baseUrl}${path}`);
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.success, true);
    assert.equal(body.message, expected);
  }
});

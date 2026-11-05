import assert from "node:assert/strict";
import { test } from "node:test";
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

import assert from "node:assert/strict";
import { test } from "node:test";
import { createEventService } from "../src/services/event.service.js";
import { createParticipationService } from "../src/services/participation.service.js";

const validId = "507f1f77bcf86cd799439011";
const futureDate = () => new Date(Date.now() + 60_000);
const user = { id: "user-1", email: "user@example.com" };

test("event update permits the owner and writes updatedAt", async () => {
  let updateFilter;
  let update;
  const model = {
    findById: () => ({ lean: async () => ({ _id: validId, creatorId: user.id }) }),
    findOneAndUpdate: (filter, value, options) => {
      updateFilter = filter;
      update = value;
      assert.deepEqual(filter, { _id: validId, creatorId: user.id });
      assert.equal(options.new, true);
      assert.equal(options.runValidators, true);
      return { lean: async () => ({ _id: validId, ...value.$set }) };
    },
  };
  const result = await createEventService(model).updateEvent(
    validId, { title: "Updated title" }, user
  );
  assert.deepEqual(updateFilter, { _id: validId, creatorId: user.id });
  assert.equal(update.$set.title, "Updated title");
  assert.ok(update.$set.updatedAt instanceof Date);
  assert.equal(result.title, "Updated title");
});

test("event update rejects missing, non-owner, and past-date changes", async () => {
  const missing = createEventService({
    findById: () => ({ lean: async () => null }),
  });
  await assert.rejects(missing.updateEvent(validId, { title: "x" }, user), {
    statusCode: 404,
  });

  const otherOwner = createEventService({
    findById: () => ({ lean: async () => ({ creatorId: "another-user" }) }),
  });
  await assert.rejects(otherOwner.updateEvent(validId, { title: "x" }, user), {
    statusCode: 403,
  });

  const owner = createEventService({
    findById: () => ({ lean: async () => ({ creatorId: user.id }) }),
  });
  await assert.rejects(
    owner.updateEvent(validId, { eventDate: new Date(Date.now() - 1000) }, user),
    { statusCode: 400 }
  );
});

test("event deletion removes associated participation records in a transaction", async () => {
  const calls = [];
  const session = {
    async withTransaction(callback) { calls.push("transaction-start"); await callback(); },
    async endSession() { calls.push("session-end"); },
  };
  const model = {
    startSession: async () => session,
    findById: () => ({ lean: async () => ({ _id: validId, creatorId: user.id }) }),
    findOneAndDelete: (filter) => ({
      session: async (providedSession) => {
        assert.equal(providedSession, session);
        assert.equal(filter.creatorId, user.id);
        calls.push("event-delete");
        return { _id: validId };
      },
    }),
  };
  const participationModel = {
    deleteMany: (filter) => ({
      session: async (providedSession) => {
        assert.equal(providedSession, session);
        assert.equal(String(filter.eventId), validId);
        calls.push("participations-delete");
      },
    }),
  };

  const result = await createEventService(model, participationModel).deleteEvent(validId, user);
  assert.deepEqual(result, { eventId: validId, deleted: true });
  assert.deepEqual(calls, [
    "transaction-start", "event-delete", "participations-delete", "session-end",
  ]);
});

test("my events query is scoped to the authenticated creator and paginated", async () => {
  let filter;
  let skip;
  let limit;
  const query = {
    sort(value) { assert.deepEqual(value, { eventDate: 1 }); return this; },
    skip(value) { skip = value; return this; },
    limit(value) { limit = value; return this; },
    lean: async () => [{ _id: validId }],
  };
  const model = {
    find(value) { filter = value; return query; },
    countDocuments: async () => 1,
  };

  const result = await createEventService(model).getMyEvents(user, { page: 2, limit: 5 });
  assert.deepEqual(filter, { creatorId: user.id });
  assert.equal(skip, 5);
  assert.equal(limit, 5);
  assert.equal(result.pagination.total, 1);
});

test("joining validates event and rejects past events", async () => {
  const missing = createParticipationService({
    findById: () => ({ lean: async () => null }),
  }, {});
  await assert.rejects(missing.joinEvent(validId, user), { statusCode: 404 });

  const past = createParticipationService({
    findById: () => ({ lean: async () => ({ _id: validId, eventDate: new Date(Date.now() - 1000) }) }),
  }, {});
  await assert.rejects(past.joinEvent(validId, user), { statusCode: 400 });
});

test("joining stores verified user identity and maps duplicate-key conflicts to 409", async () => {
  let saved;
  const eventModel = {
    findById: () => ({ lean: async () => ({ _id: validId, eventDate: futureDate() }) }),
  };
  const participationModel = {
    create: async (value) => { saved = value; return value; },
  };

  const result = await createParticipationService(eventModel, participationModel)
    .joinEvent(validId, user);
  assert.equal(saved.userId, user.id);
  assert.equal(saved.userEmail, user.email);
  assert.equal(String(saved.eventId), validId);
  assert.ok(saved.joinedAt instanceof Date);
  assert.equal(result, saved);

  const duplicateService = createParticipationService(eventModel, {
    create: async () => { const error = new Error("duplicate"); error.code = 11000; throw error; },
  });
  await assert.rejects(duplicateService.joinEvent(validId, user), { statusCode: 409 });
});

test("joined events are scoped to the authenticated user and sorted by event date", async () => {
  let filter;
  const later = { _id: "later", eventDate: new Date("2030-02-01T00:00:00Z") };
  const sooner = { _id: "sooner", eventDate: new Date("2030-01-01T00:00:00Z") };
  const model = {
    find(value) {
      filter = value;
      return {
        populate() {
          return { lean: async () => [
            { eventId: later, userId: user.id },
            { eventId: sooner, userId: user.id },
          ] };
        },
      };
    },
  };

  const result = await createParticipationService({}, model).getJoinedEvents(user);
  assert.deepEqual(filter, { userId: user.id });
  assert.deepEqual(result.map((item) => item.event._id), ["sooner", "later"]);
});

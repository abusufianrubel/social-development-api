import assert from "node:assert/strict";
import { test } from "node:test";
import Event from "../src/models/event.model.js";
import Participation from "../src/models/participation.model.js";

test("event schema defines required fields, timestamps, and query indexes", () => {
  for (const field of [
    "title",
    "description",
    "eventType",
    "thumbnail",
    "location",
    "eventDate",
    "creatorId",
    "creatorEmail",
  ]) {
    assert.equal(Event.schema.path(field).isRequired, true, `${field} required`);
  }

  assert.equal(Event.schema.options.timestamps, true);
  assert.equal(Event.collection.collectionName, "events");

  const indexes = Event.schema.indexes().map(([keys]) => keys);
  assert.ok(indexes.some((keys) => keys.eventDate === 1));
  assert.ok(indexes.some((keys) => keys.creatorId === 1));
  assert.ok(indexes.some((keys) => keys.eventType === 1));
  assert.ok(indexes.some((keys) => keys.location === 1));
});

test("participation schema defines timestamps and unique event/user participation", () => {
  assert.equal(Participation.schema.path("eventId").isRequired, true);
  assert.equal(Participation.schema.path("userId").isRequired, true);
  assert.equal(Participation.schema.path("userEmail").isRequired, true);
  assert.equal(Participation.schema.path("joinedAt").instance, "Date");
  assert.equal(Participation.schema.options.timestamps, true);
  assert.equal(Participation.collection.collectionName, "participations");

  const uniqueParticipationIndex = Participation.schema.indexes().find(
    ([keys, options]) =>
      keys.eventId === 1 && keys.userId === 1 && options.unique === true
  );
  assert.ok(uniqueParticipationIndex);
});

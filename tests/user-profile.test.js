import assert from "node:assert/strict";
import { test } from "node:test";
import { createUserService } from "../src/services/user.service.js";

const user = { id: "auth-user-123", email: "verified@example.com" };

test("getProfile reads the authenticated Better Auth user and returns safe fields", async () => {
  let filter;
  const collection = {
    findOne: async (query, options) => {
      filter = query;
      assert.equal(options.projection.email, 1);
      return {
        _id: user.id,
        name: "Community Member",
        email: user.email,
        emailVerified: true,
        image: null,
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date("2026-01-02"),
        password: "must-not-leak",
      };
    },
  };

  const profile = await createUserService(collection).getProfile(user);
  assert.deepEqual(filter, { _id: user.id });
  assert.equal(profile.id, user.id);
  assert.equal(profile.email, user.email);
  assert.equal("password" in profile, false);
});

test("getProfile returns 404 when the authenticated user record is missing", async () => {
  const service = createUserService({ findOne: async () => null });
  await assert.rejects(service.getProfile(user), { statusCode: 404 });
});

test("updateProfile changes only allowed fields and updates updatedAt", async () => {
  let filter;
  let update;
  const collection = {
    findOneAndUpdate: async (query, value, options) => {
      filter = query;
      update = value;
      assert.equal(options.returnDocument, "after");
      return {
        _id: user.id,
        name: value.$set.name,
        email: user.email,
        emailVerified: true,
        image: value.$set.image,
        updatedAt: value.$set.updatedAt,
      };
    },
  };

  const profile = await createUserService(collection).updateProfile(user, {
    name: "Updated Name",
    image: "https://example.com/avatar.png",
  });

  assert.deepEqual(filter, { _id: user.id });
  assert.deepEqual(Object.keys(update.$set).sort(), ["image", "name", "updatedAt"]);
  assert.ok(update.$set.updatedAt instanceof Date);
  assert.equal(profile.name, "Updated Name");
  assert.equal(profile.email, user.email);
});

test("updateProfile returns 404 when user no longer exists", async () => {
  const service = createUserService({
    findOneAndUpdate: async () => null,
  });
  await assert.rejects(
    service.updateProfile(user, { name: "Updated Name" }),
    { statusCode: 404 }
  );
});

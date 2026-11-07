import mongoose from "mongoose";
import { toNodeHandler } from "better-auth/node";
import { createApp } from "./app.js";
import { createAuth } from "./config/auth.js";
import { resolveApiPrefix } from "./config/api-prefix.js";
import { resolveJwtConfiguration } from "./config/jwt.js";
import connectDB from "./config/database.js";
import { createJwtAuthMiddleware } from "./middleware/auth.middleware.js";
import { createUserService } from "./services/user.service.js";

const createBackendApp = async () => {
  await connectDB();

  const database = mongoose.connection.db;
  const auth = createAuth(database);
  const apiPrefix = resolveApiPrefix();
  const jwtConfiguration = resolveJwtConfiguration(process.env, apiPrefix);

  return createApp(toNodeHandler(auth), apiPrefix, {
    authenticate: createJwtAuthMiddleware(jwtConfiguration),
    userService: createUserService(database.collection("user")),
  });
};

export default createBackendApp;

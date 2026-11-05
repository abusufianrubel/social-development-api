import "dotenv/config";

import mongoose from "mongoose";
import { toNodeHandler } from "better-auth/node";
import { createApp } from "./app.js";
import { createAuth } from "./config/auth.js";
import { resolveApiPrefix } from "./config/api-prefix.js";
import { resolveJwtConfiguration } from "./config/jwt.js";
import connectDB from "./config/database.js";
import { createJwtAuthMiddleware } from "./middleware/auth.middleware.js";
import { createUserService } from "./services/user.service.js";

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    await connectDB();

    const database = mongoose.connection.db;
    const auth = createAuth(database);
    const apiPrefix = resolveApiPrefix();
    const jwtConfiguration = resolveJwtConfiguration(process.env, apiPrefix);
    const app = createApp(toNodeHandler(auth), apiPrefix, {
      authenticate: createJwtAuthMiddleware(jwtConfiguration),
      userService: createUserService(database.collection("user")),
    });

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();

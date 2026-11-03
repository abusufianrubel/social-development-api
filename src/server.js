import "dotenv/config";

import mongoose from "mongoose";
import { toNodeHandler } from "better-auth/node";
import { createApp } from "./app.js";
import { createAuth } from "./config/auth.js";
import connectDB from "./config/database.js";

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    await connectDB();

    const auth = createAuth(mongoose.connection.db);
    const app = createApp(toNodeHandler(auth));

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();

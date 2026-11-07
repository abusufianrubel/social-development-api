import express from "express";
import cors from "cors";
import helmet from "helmet";
import healthRouter from "./routes/health.routes.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error.middleware.js";
import { sendSuccess } from "./utils/api-response.js";
import { resolveApiPrefix } from "./config/api-prefix.js";
import { normalizeOrigin } from "./config/origin.js";
import createUserRouter from "./routes/user.routes.js";
import createEventRouter from "./routes/event.routes.js";
import createJoinRouter from "./routes/join.routes.js";

const buildAllowedOrigins = () => {
  const origins = (process.env.CLIENT_URL ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean)
    .map(normalizeOrigin);

  if (process.env.NODE_ENV !== "production") {
    origins.push("http://localhost:3000", "http://127.0.0.1:3000");
  }

  return [...new Set(origins)];
};

export const createApp = (
  authHandler,
  apiPrefix = resolveApiPrefix(),
  { authenticate, userService, eventService, participationService } = {}
) => {
  const app = express();
  const allowedOrigins = buildAllowedOrigins();

  const corsOptions = {
    origin(origin, callback) {
      // No Origin header = curl, Postman, server-to-server
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Omit CORS headers instead of throwing a 500
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
  };

  // CORS first, so preflights are answered before anything else can reject them
  app.use(cors(corsOptions));
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

  if (authHandler) {
    app.all(`${apiPrefix}/auth`, authHandler);
    app.all(`${apiPrefix}/auth/*authPath`, authHandler);
  }

  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ extended: true }));

  app.use(apiPrefix, healthRouter);

  if (authenticate) {
    app.use(apiPrefix, createUserRouter(authenticate, userService));
    app.use(apiPrefix, createEventRouter(authenticate, eventService));
    app.use(apiPrefix, createJoinRouter(authenticate, participationService));
  }

  app.get(apiPrefix, (_req, res) =>
    sendSuccess(res, {
      message: "Social Development API is running",
    })
  );

  app.get("/", (_req, res) =>
    sendSuccess(res, {
      message: "Social Development API is running",
    })
  );

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

const app = createApp();

export default app;
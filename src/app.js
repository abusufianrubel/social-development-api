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
import createUserRouter from "./routes/user.routes.js";
import createEventRouter from "./routes/event.routes.js";
import createJoinRouter from "./routes/join.routes.js";

export const createApp = (
  authHandler,
  apiPrefix = resolveApiPrefix(),
  { authenticate, eventService, participationService } = {}
) => {
  const app = express();

  app.use(helmet());

  app.use(
    cors({
      origin: process.env.CLIENT_URL,
      credentials: true,
    })
  );

  if (authHandler) {
    app.all(`${apiPrefix}/auth`, authHandler);
    app.all(`${apiPrefix}/auth/*authPath`, authHandler);
  }

  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ extended: true }));

  app.use(apiPrefix, healthRouter);

  if (authenticate) {
    app.use(apiPrefix, createUserRouter(authenticate));
    app.use(apiPrefix, createEventRouter(authenticate, eventService));
    app.use(apiPrefix, createJoinRouter(authenticate, participationService));
  }

  app.get(apiPrefix, (_req, res) =>
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

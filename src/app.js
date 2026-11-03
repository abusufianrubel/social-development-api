import express from "express";
import cors from "cors";
import helmet from "helmet";
import healthRouter from "./routes/health.routes.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error.middleware.js";
import { sendSuccess } from "./utils/api-response.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", healthRouter);

app.get("/", (req, res) => {
  return sendSuccess(res, {
    message: "Social Development API is running",
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

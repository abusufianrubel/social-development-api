import express from "express";
import cors from "cors";
import helmet from "helmet";
import healthRouter from "./routes/health.routes.js";

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
  res.status(200).json({
    success: true,
    message: "Social Development API is running",
  });
});

export default app;

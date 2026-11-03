import { Router } from "express";
import { checkDatabaseHealth } from "../config/database.js";

const router = Router();

router.get("/health", async (_req, res) => {
  const databaseHealthy = await checkDatabaseHealth();

  return res.status(databaseHealthy ? 200 : 503).json({
    status: databaseHealthy ? "healthy" : "unhealthy",
    service: "social-development-api",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    dependencies: {
      mongodb: {
        status: databaseHealthy ? "healthy" : "unhealthy",
      },
    },
  });
});

export default router;

import { Router } from "express";
import {
  getJoinedEventsController,
  joinEventController,
} from "../controllers/participation.controller.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { createParticipationService } from "../services/participation.service.js";
import { joinEventSchema } from "../validators/participation.validator.js";

const createJoinRouter = (
  authenticate,
  participationService = createParticipationService()
) => {
  const router = Router();

  router.post(
    "/joins",
    authenticate,
    validateBody(joinEventSchema),
    joinEventController(participationService)
  );
  router.get(
    "/joins/my-events",
    authenticate,
    getJoinedEventsController(participationService)
  );

  return router;
};

export default createJoinRouter;

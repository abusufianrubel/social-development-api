import { Router } from "express";
import { createEventController } from "../controllers/event.controller.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { createEventService } from "../services/event.service.js";
import { createEventSchema } from "../validators/event.validator.js";

const createEventRouter = (
  authenticate,
  eventService = createEventService()
) => {
  const router = Router();

  router.post(
    "/events",
    authenticate,
    validateBody(createEventSchema),
    createEventController(eventService)
  );

  return router;
};

export default createEventRouter;

import { Router } from "express";
import {
  createEventController,
  getEventByIdController,
  getRecentUpcomingEventsController,
  getUpcomingEventsController,
} from "../controllers/event.controller.js";
import {
  validateBody,
  validateQuery,
} from "../middleware/validate.middleware.js";
import { createEventService } from "../services/event.service.js";
import {
  createEventSchema,
  upcomingEventsQuerySchema,
} from "../validators/event.validator.js";

const createEventRouter = (
  authenticate,
  eventService = createEventService()
) => {
  const router = Router();

  // Public read endpoints must be registered before parameterized routes.
  router.get(
    "/events/recent",
    getRecentUpcomingEventsController(eventService)
  );
  router.get(
    "/events",
    validateQuery(upcomingEventsQuerySchema),
    getUpcomingEventsController(eventService)
  );
  router.get("/events/:id", getEventByIdController(eventService));

  router.post(
    "/events",
    authenticate,
    validateBody(createEventSchema),
    createEventController(eventService)
  );

  return router;
};

export default createEventRouter;

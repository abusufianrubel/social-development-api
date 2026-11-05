import { Router } from "express";
import {
  createEventController,
  deleteEventController,
  getEventByIdController,
  getMyEventsController,
  getRecentUpcomingEventsController,
  getUpcomingEventsController,
  updateEventController,
} from "../controllers/event.controller.js";
import {
  validateBody,
  validateQuery,
} from "../middleware/validate.middleware.js";
import { createEventService } from "../services/event.service.js";
import {
  createEventSchema,
  paginationQuerySchema,
  updateEventSchema,
  upcomingEventsQuerySchema,
} from "../validators/event.validator.js";

const createEventRouter = (
  authenticate,
  eventService = createEventService()
) => {
  const router = Router();

  router.get(
    "/events/recent",
    getRecentUpcomingEventsController(eventService)
  );
  router.get(
    "/events/my-events",
    authenticate,
    validateQuery(paginationQuerySchema),
    getMyEventsController(eventService)
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
  router.patch(
    "/events/:id",
    authenticate,
    validateBody(updateEventSchema),
    updateEventController(eventService)
  );
  router.delete(
    "/events/:id",
    authenticate,
    deleteEventController(eventService)
  );

  return router;
};

export default createEventRouter;

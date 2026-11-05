import { sendSuccess } from "../utils/api-response.js";

export const createEventController = (eventService) => async (req, res) => {
  const event = await eventService.createEvent(
    req.validatedBody,
    req.auth.user
  );

  return sendSuccess(res, {
    statusCode: 201,
    message: "Event created successfully",
    data: { event },
  });
};

export const getUpcomingEventsController = (eventService) => async (req, res) => {
  const result = await eventService.getUpcomingEvents(req.validatedQuery);

  return sendSuccess(res, {
    message: "Upcoming events retrieved successfully",
    data: result,
  });
};

export const getRecentUpcomingEventsController = (eventService) => async (_req, res) => {
  const events = await eventService.getRecentUpcomingEvents();

  return sendSuccess(res, {
    message: "Recent upcoming events retrieved successfully",
    data: { events },
  });
};

export const getEventByIdController = (eventService) => async (req, res) => {
  const event = await eventService.getEventById(req.params.id);

  return sendSuccess(res, {
    message: "Event retrieved successfully",
    data: { event },
  });
};

export const updateEventController = (eventService) => async (req, res) => {
  const event = await eventService.updateEvent(
    req.params.id,
    req.validatedBody,
    req.auth.user
  );

  return sendSuccess(res, {
    message: "Event updated successfully",
    data: { event },
  });
};

export const deleteEventController = (eventService) => async (req, res) => {
  const result = await eventService.deleteEvent(req.params.id, req.auth.user);

  return sendSuccess(res, {
    message: "Event deleted successfully",
    data: result,
  });
};

export const getMyEventsController = (eventService) => async (req, res) => {
  const result = await eventService.getMyEvents(
    req.auth.user,
    req.validatedQuery
  );

  return sendSuccess(res, {
    message: "Your created events retrieved successfully",
    data: result,
  });
};

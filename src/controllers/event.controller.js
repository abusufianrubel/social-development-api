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

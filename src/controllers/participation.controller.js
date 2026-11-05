import { sendSuccess } from "../utils/api-response.js";

export const joinEventController = (participationService) => async (req, res) => {
  const participation = await participationService.joinEvent(
    req.validatedBody.eventId,
    req.auth.user
  );

  return sendSuccess(res, {
    statusCode: 201,
    message: "Event joined successfully",
    data: { participation },
  });
};

export const getJoinedEventsController = (participationService) => async (req, res) => {
  const events = await participationService.getJoinedEvents(req.auth.user);

  return sendSuccess(res, {
    message: "Your joined events retrieved successfully",
    data: { events },
  });
};

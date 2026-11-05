import Event from "../models/event.model.js";

export const createEventService = (EventModel = Event) => ({
  async createEvent(eventData, authenticatedUser) {
    if (!authenticatedUser?.id || !authenticatedUser?.email) {
      const error = new Error("Authenticated user email is required");
      error.statusCode = 401;
      throw error;
    }

    if (
      !(eventData.eventDate instanceof Date) ||
      eventData.eventDate <= new Date()
    ) {
      const error = new Error("Event date must be in the future");
      error.statusCode = 400;
      throw error;
    }

    return EventModel.create({
      ...eventData,
      creatorId: authenticatedUser.id,
      creatorEmail: authenticatedUser.email,
    });
  },
});

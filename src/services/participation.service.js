import mongoose from "mongoose";
import Event from "../models/event.model.js";
import Participation from "../models/participation.model.js";

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const createParticipationService = (
  EventModel = Event,
  ParticipationModel = Participation
) => ({
  async joinEvent(eventId, authenticatedUser) {
    if (!authenticatedUser?.id || !authenticatedUser?.email) {
      throw createHttpError(401, "Authenticated user identity is required");
    }

    if (!mongoose.isValidObjectId(eventId)) {
      throw createHttpError(400, "Invalid event ID");
    }

    const event = await EventModel.findById(eventId).lean();
    if (!event) throw createHttpError(404, "Event not found");
    if (event.eventDate <= new Date()) {
      throw createHttpError(400, "Cannot join a past event");
    }

    try {
      const participation = await ParticipationModel.create({
        eventId: event._id,
        userId: authenticatedUser.id,
        userEmail: authenticatedUser.email,
        joinedAt: new Date(),
      });
      return participation;
    } catch (error) {
      if (error?.code === 11000) {
        throw createHttpError(409, "You have already joined this event");
      }
      throw error;
    }
  },

  async getJoinedEvents(authenticatedUser) {
    if (!authenticatedUser?.id) {
      throw createHttpError(401, "Authentication required");
    }

    const participations = await ParticipationModel.find({
      userId: authenticatedUser.id,
    })
      .populate("eventId")
      .lean();

    return participations
      .filter((participation) => participation.eventId)
      .sort(
        (first, second) =>
          new Date(first.eventId.eventDate) - new Date(second.eventId.eventDate)
      )
      .map((participation) => ({
        ...participation,
        event: participation.eventId,
        eventId: participation.eventId._id,
      }));
  },
});

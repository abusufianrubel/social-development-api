import mongoose from "mongoose";
import Event from "../models/event.model.js";
import Participation from "../models/participation.model.js";

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const assertValidEventId = (eventId) => {
  if (!mongoose.isValidObjectId(eventId)) {
    throw createHttpError(400, "Invalid event ID");
  }
};

const assertAuthenticatedUser = (user) => {
  if (!user?.id) {
    throw createHttpError(401, "Authentication required");
  }
};

export const createEventService = (
  EventModel = Event,
  ParticipationModel = Participation
) => ({
  async createEvent(eventData, authenticatedUser) {
    if (!authenticatedUser?.id || !authenticatedUser?.email) {
      throw createHttpError(401, "Authenticated user email is required");
    }

    if (
      !(eventData.eventDate instanceof Date) ||
      eventData.eventDate <= new Date()
    ) {
      throw createHttpError(400, "Event date must be in the future");
    }

    return EventModel.create({
      ...eventData,
      creatorId: authenticatedUser.id,
      creatorEmail: authenticatedUser.email,
    });
  },

  async getUpcomingEvents(filters = {}) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 12;
    const query = { eventDate: { $gt: new Date() } };

    if (filters.eventType) query.eventType = filters.eventType;
    if (filters.location) {
      query.location = { $regex: escapeRegex(filters.location), $options: "i" };
    }
    if (filters.search) {
      const search = { $regex: escapeRegex(filters.search), $options: "i" };
      query.$or = [{ title: search }, { description: search }, { location: search }];
    }

    const [events, total] = await Promise.all([
      EventModel.find(query)
        .sort({ eventDate: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      EventModel.countDocuments(query),
    ]);

    return {
      events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getRecentUpcomingEvents() {
    return EventModel.find({ eventDate: { $gt: new Date() } })
      .sort({ eventDate: 1 })
      .limit(6)
      .lean();
  },

  async getEventById(eventId) {
    assertValidEventId(eventId);
    const event = await EventModel.findById(eventId).lean();
    if (!event) throw createHttpError(404, "Event not found");
    return event;
  },

  async updateEvent(eventId, updateData, authenticatedUser) {
    assertAuthenticatedUser(authenticatedUser);
    assertValidEventId(eventId);

    const existingEvent = await EventModel.findById(eventId).lean();
    if (!existingEvent) throw createHttpError(404, "Event not found");
    if (existingEvent.creatorId !== authenticatedUser.id) {
      throw createHttpError(403, "You are not allowed to update this event");
    }

    if (
      updateData.eventDate !== undefined &&
      (!(updateData.eventDate instanceof Date) ||
        updateData.eventDate <= new Date())
    ) {
      throw createHttpError(400, "Event date must be in the future");
    }

    const updatedEvent = await EventModel.findOneAndUpdate(
      { _id: eventId, creatorId: authenticatedUser.id },
      { $set: { ...updateData, updatedAt: new Date() } },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedEvent) {
      throw createHttpError(404, "Event not found");
    }

    return updatedEvent;
  },

  async deleteEvent(eventId, authenticatedUser) {
    assertAuthenticatedUser(authenticatedUser);
    assertValidEventId(eventId);

    const existingEvent = await EventModel.findById(eventId).lean();
    if (!existingEvent) throw createHttpError(404, "Event not found");
    if (existingEvent.creatorId !== authenticatedUser.id) {
      throw createHttpError(403, "You are not allowed to delete this event");
    }

    const session = await EventModel.startSession();
    try {
      await session.withTransaction(async () => {
        const deletedEvent = await EventModel.findOneAndDelete({
          _id: eventId,
          creatorId: authenticatedUser.id,
        }).session(session);

        if (!deletedEvent) {
          throw createHttpError(404, "Event not found");
        }

        await ParticipationModel.deleteMany({ eventId }).session(session);
      });
    } finally {
      await session.endSession();
    }

    return { eventId, deleted: true };
  },

  async getMyEvents(authenticatedUser, filters = {}) {
    assertAuthenticatedUser(authenticatedUser);
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 12;
    const query = { creatorId: authenticatedUser.id };

    const [events, total] = await Promise.all([
      EventModel.find(query)
        .sort({ eventDate: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      EventModel.countDocuments(query),
    ]);

    return {
      events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
});

import mongoose from "mongoose";
import Event from "../models/event.model.js";

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const createEventService = (EventModel = Event) => ({
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
    const now = new Date();
    const query = { eventDate: { $gt: now } };

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
    if (!mongoose.isValidObjectId(eventId)) {
      throw createHttpError(400, "Invalid event ID");
    }

    const event = await EventModel.findById(eventId).lean();
    if (!event) throw createHttpError(404, "Event not found");
    return event;
  },
});

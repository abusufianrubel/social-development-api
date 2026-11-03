import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    eventType: {
      type: String,
      required: true,
      trim: true,
    },
    thumbnail: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    eventDate: {
      type: Date,
      required: true,
    },
    creatorId: {
      type: String,
      required: true,
      trim: true,
    },
    creatorEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
  },
  {
    collection: "events",
    timestamps: true,
  }
);

eventSchema.index({ eventDate: 1 });
eventSchema.index({ creatorId: 1 });
eventSchema.index({ eventType: 1 });
eventSchema.index({ location: 1 });

const Event =
  mongoose.models.Event || mongoose.model("Event", eventSchema);

export default Event;

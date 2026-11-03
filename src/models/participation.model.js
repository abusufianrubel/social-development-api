import mongoose from "mongoose";

const participationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    userId: {
      type: String,
      required: true,
      trim: true,
    },
    userEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "participations",
    timestamps: true,
  }
);

participationSchema.index({ userId: 1 });
participationSchema.index({ eventId: 1, userId: 1 }, { unique: true });

const Participation =
  mongoose.models.Participation ||
  mongoose.model("Participation", participationSchema);

export default Participation;

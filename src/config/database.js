import mongoose from "mongoose";
import Event from "../models/event.model.js";
import Participation from "../models/participation.model.js";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }

  try {
    await Promise.all([Event.init(), Participation.init()]);
    console.log("MongoDB connected and application indexes are ready");
  } catch (error) {
    console.error(
      "MongoDB collection or index initialization failed:",
      error.message
    );
    throw error;
  }
};

export const checkDatabaseHealth = async (connection = mongoose.connection) => {
  if (connection.readyState !== 1 || !connection.db) {
    return false;
  }

  try {
    const result = await connection.db.admin().ping({ timeoutMS: 1000 });
    return result.ok === 1;
  } catch {
    return false;
  }
};

export default connectDB;

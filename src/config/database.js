import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
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

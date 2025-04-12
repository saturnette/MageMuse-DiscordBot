import mongoose from "mongoose";

export const connectWithRetry = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoIndex: false, 
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    console.log("Retrying connection in 5 seconds...");
    setTimeout(connectWithRetry, 5000);
  }
};
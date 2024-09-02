import mongoose from "mongoose";

const channelSchema = new mongoose.Schema({
  log: String,
  register: String,
});

export default mongoose.model("Channel", channelSchema);

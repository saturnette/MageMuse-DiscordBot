import mongoose from "mongoose";

const channelSchema = new mongoose.Schema({
  log: { type: String, required: true },
  register: { type: String, required: true },
});

export default mongoose.model("Channel", channelSchema);

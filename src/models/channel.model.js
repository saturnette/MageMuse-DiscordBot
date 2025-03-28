import mongoose from "mongoose";

const channelSchema = new mongoose.Schema({
    log: String,
    register: String,
    lobby: String,
    ladder: String,
    roll: String,
});

export default mongoose.model("Channel", channelSchema);

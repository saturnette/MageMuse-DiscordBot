import mongoose from "mongoose";

const channelSchema = new mongoose.Schema({
    log: {
        type: String,
        default: "0000"
    },
    register: {
        type: String,
        default: "0000"
    },
    lobby: {
        type: String,
        default: "0000"
    },
    ladder: {
        type: String,
        default: "0000"
    }
});

export default mongoose.model("Channel", channelSchema);

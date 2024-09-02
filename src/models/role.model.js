import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
    leader: {
        type: String,
        default: "0000"
    },
    elite: {
        type: String,
        default: "0000"
    }
});

export default mongoose.model("Role", roleSchema);

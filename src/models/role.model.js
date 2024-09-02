import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
    leader: String,
    elite: String
});

export default mongoose.model("Role", roleSchema);

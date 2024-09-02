import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
  leader: { type: String },
  elite: { type: String },
  admin: { type: String },
});

export default mongoose.model("Role", roleSchema);

import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  _id: String,
  showdownNick: String,
  badgeType: String,
  badgeName: String,
  team: [String],
  badges: [{ badgeType: String, badgeName: String }],
  wins: { type: Number, default: 0 },
  loses: { type: Number, default: 0 },
  elo: { type: Number, default: 1000 },
  registered: { type: Boolean, default: false },
  gamesPlayed: { type: Number, default: 0 },
  tryEF: { type: Number, default: 0 },
  tryDay: { type: Number, default: 0 },
  allowChallenges: { type: Boolean, default: true },
});

export default mongoose.model("User", userSchema);

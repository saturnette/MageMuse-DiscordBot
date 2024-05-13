import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new mongoose.Schema({
  _id: String,
  showdownNick: String,
  tryEF: { type: Number, default: 0 },
  tryDay: { type: Number, default: 0 },
  allowChallenges: { type: Boolean, default: true },
  wins: Number,
  loses: Number,
  badgeType: String,
  badgeName: String,
  bannerURL: String,
  registered: { type: Boolean, default: false },
  badges: [
    {
      badgeType: String,
      name: String,
    },
  ],
  team: [String],
  elo: { type: Schema.Types.Number, default: 1000 },
  gamesPlayed: { type: Number, default: 0 },
});

export default mongoose.model("User", userSchema);

import mongoose from "mongoose";

const pokemonSchema = new mongoose.Schema({
  number: Number,
  name: String,
  count: { type: Number, default: 1 }
});

const userSchema = new mongoose.Schema({
  _id: String,
  showdownNick: String,
  badgeType: String,
  badgeName: String,
  team: [String],
  badges: [{ badgeType: String, badgeName: String }],
  wins: { type: Number, default: 0 },
  winsLadder: { type: Number, default: 0 },
  lossesLadder: { type: Number, default: 0 },
  loses: { type: Number, default: 0 },
  elo: { type: Number, default: 1000 },
  eloLimit: { type: Number, default: 1000 },
  registered: { type: Boolean, default: false },
  gamesPlayed: { type: Number, default: 0 },
  tryEF: { type: Number, default: 0 },
  tryDay: { type: Number, default: 0 },
  allowChallenges: { type: Boolean, default: true },
  facts: [String],
  coins: { type: Number, default: 0 },
  pokemonCollection: [pokemonSchema],
  catcher: { type: Boolean, default: false },
  favoriteColor: { type: String, enum: ['blue', 'red'], default: null },
  companionPokemon: { type: pokemonSchema, default: null },
  companionBattles: { type: Number, default: 0 },
  bo3LeaderWins: { type: Number, default: 0 },
  bo3ChallengerWins: { type: Number, default: 0 },
  badges: [
    {
      badgeName: String,
      badgeType: String,
    },
  ],
  stones: {
    fire: { type: Number, default: 0 },
    water: { type: Number, default: 0 },
    thunder: { type: Number, default: 0 },
    leaf: { type: Number, default: 0 },
    moon: { type: Number, default: 0 },
  },
  linkCable: { type: Number, default: 0 },
  bo3Progress: {
    type: Map,
    of: {
      leaderWins: { type: Number, default: 0 },
      challengerWins: { type: Number, default: 0 },
    },
    default: {},
  },
});

export default mongoose.model("User", userSchema);
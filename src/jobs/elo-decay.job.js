import cron from "node-cron";
import User from "../models/user.model.js";

cron.schedule(
  "0 9 * * *",
  async () => {
    const users = await User.find();

    for (let user of users) {
      if (user.gamesPlayed > 5) {
        continue;
      }

      if (user.gamesPlayed < 2 && user.elo > 1200) {
        user.elo -= Math.floor((user.elo - 1200) / 50);
        if (user.elo < user.eloLimit) user.elo = user.eloLimit;
        continue;
      }

      if (user.gamesPlayed === 0 && user.elo > 1000) {
        user.elo -= Math.floor((user.elo - 1000) / 100);
        if (user.elo < user.eloLimit) user.elo = user.eloLimit;
        continue;
      }

      user.gamesPlayed = 0;

      await user.save();
      console.log(`Elo decayed for ${user.username} to ${user.elo} elo.`);
    }
  },
  {
    scheduled: true,
    timezone: "America/Tegucigalpa",
  }
);
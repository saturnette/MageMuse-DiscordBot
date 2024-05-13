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

      if (user.gamesPlayed >= 1 && user.elo > 1500) {
        user.elo -= Math.floor((user.elo - 1500) / 100);
      }

      if (user.gamesPlayed === 0 && user.elo > 1400) {
        user.elo -= Math.floor((user.elo - 1400) / 50);
      }

      user.gamesPlayed = 0;

      await user.save();
    }
  },
  {
    scheduled: true,
    timezone: "Etc/GMT",
  }
);

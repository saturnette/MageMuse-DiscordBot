import cron from "node-cron";
import User from "../models/user.model.js";

cron.schedule(
  "0 0 * * *",
  async function () {
    try {
      await User.updateMany({}, { tryDay: 0 });
      console.log("Reset tryDay for all users");
    } catch (error) {
      console.error("Error resetting tryDay for all users:", error);
    }
  },
  null,
  true,
  "America/Tegucigalpa"
);

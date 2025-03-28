import { registerFont, createCanvas, loadImage } from "canvas";
import fetch from "node-fetch";
import sharp from "sharp";
import bucket from "../config/firebase.js";
import { createReadStream } from "streamifier";
import User from "../models/user.model.js";

registerFont("./src/font/arial.ttf", { family: "Arial" });

export async function generateLeaderboardImage(client) {
  try {
    const users = await User.find().sort({ elo: -1, _id: 1 }).limit(10);

    const canvasWidth = 700;
    const canvasHeight = users.length * 60;

    const canvas = createCanvas(canvasWidth, canvasHeight);
    const context = canvas.getContext("2d");

    context.font = "30px Arial";
    context.fillStyle = "#ffffff";

    for (let i = 0; i < users.length; i++) {
      const user = users[i];

      try {
        const discordUser = await client.users.fetch(user._id);
        const avatarURL = discordUser.displayAvatarURL({
          format: "png",
          size: 128,
          dynamic: false,
        });

        const avatarResponse = await fetchWithRetry(avatarURL);
        if (!avatarResponse.ok) {
          throw new Error(`Failed to fetch avatar: ${avatarResponse.status}`);
        }

        const avatarBuffer = await avatarResponse.arrayBuffer();

        const pngBuffer = await sharp(Buffer.from(avatarBuffer), {
          failOnError: false,
          limitInputPixels: 2147483648,
        })
          .resize(50, 50, {
            fit: "cover",
            position: "center",
          })
          .png()
          .toBuffer();

        const img = await loadImage(pngBuffer);

        context.fillStyle = "#2D3142";
        context.fillRect(70, i * 60, 600, 50);

        context.drawImage(img, 10, i * 60, 50, 50);

        const textColor = getPositionColor(i);
        context.fillStyle = textColor;
        context.fillText(` #${i + 1}`, 70, i * 60 + 35);

        context.fillStyle = "white";
        context.fillText(
          ` / ${user.elo} / ${user.winsLadder}W ${user.lossesLadder}L / ${discordUser.username}`,
          70 + context.measureText(` #${i + 1}`).width,
          i * 60 + 35
        );
      } catch (userError) {
        console.error(`Error processing user ${user._id}:`, userError);

        continue;
      }
    }

    const buffer = canvas.toBuffer();

    const file = bucket.file("leaderboard/leaderboard.png");
    await uploadToFirebaseWithRetry(file, buffer);

    await file.makePublic();
    const timestamp = Date.now();
    return `https://storage.googleapis.com/${bucket.name}/${file.name}?t=${timestamp}`;
  } catch (error) {
    console.error("Error generating leaderboard:", error);
    throw new Error("Failed to generate leaderboard image");
  }
}

function getPositionColor(position) {
  const colors = {
    0: "gold",
    1: "silver",
    2: "darkorange",
    3: "green",
  };
  return colors[position] || "white";
}

async function fetchWithRetry(url, maxRetries = 3) {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, {
        timeout: 5000,
      });
      return response;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw lastError;
}

async function uploadToFirebaseWithRetry(file, buffer, maxRetries = 3) {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const readStream = createReadStream(buffer);
      await new Promise((resolve, reject) => {
        readStream
          .pipe(
            file.createWriteStream({
              resumable: false,
              metadata: {
                contentType: "image/png",
                cacheControl: "public, max-age=300",
              },
            })
          )
          .on("error", reject)
          .on("finish", resolve);
      });
      return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw lastError;
}

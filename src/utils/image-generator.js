import { createCanvas, loadImage } from "canvas";
import axios from "axios";
import { createReadStream } from "streamifier";
import bucket from "../config/firebase.js";
import { badgesImages, badgesCoordinates, getBackgroundImageUrl, pokeballIconUrl } from "./badges.js";
import User from "../models/user.model.js";

export async function generateAndSaveProfileImage(userId) {
  const user = await User.findById(userId);
  const numBadges = user.badges.length ? user.badges.length : 0;

  let backgroundImageUrl = getBackgroundImageUrl(numBadges);

  const userInfo = await getUserInfo(userId);


  const users = await User.find().sort({ elo: -1, _id: 1 });


  const canvas = createCanvas(800, 500);
  const context = canvas.getContext("2d");

  const backgroundImage = await loadImage(backgroundImageUrl);

  context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

  const badgeNames = Object.keys(badgesImages);

  for (let index = 0; index < badgeNames.length; index++) {
    const badgeName = badgeNames[index];
    const hasBadge = userInfo.badges.some(
      (badge) => badge.badgeName === badgeName
    );
    const imageUrl = hasBadge
      ? badgesImages[badgeName].normal
      : badgesImages[badgeName].silhouette;
    const image = await loadImage(imageUrl);
    context.drawImage(
      image,
      badgesCoordinates[index].x * 2,
      badgesCoordinates[index].y * 2,
      badgesCoordinates[index].width * 2,
      badgesCoordinates[index].height * 2
    );
  }

  const pokeballIcon = await loadImage(pokeballIconUrl);
  const row1 = userInfo.team.slice(0, 6);
  const row2 = userInfo.team.slice(6, 12);

  for (let i = 0; i < row1.length; i++) {
    const pokemonName = row1[i];
    if (pokemonName) {
      const spriteUrl = await getPokemonSprite(pokemonName);
      const spriteImage = await loadImage(spriteUrl);

      context.drawImage(pokeballIcon, 100 * i, 310, 100, 100);
      context.drawImage(spriteImage, 100 * i, 310, 100, 100);
    }
  }

  for (let i = 0; i < row2.length; i++) {
    const pokemonName = row2[i];
    if (pokemonName) {
      const spriteUrl = await getPokemonSprite(pokemonName);
      const spriteImage = await loadImage(spriteUrl);

      context.drawImage(pokeballIcon, 100 * (i + 2), 400, 100, 100);
      context.drawImage(spriteImage, 100 * (i + 2), 400, 100, 100);
    }
  }

  const buffer = canvas.toBuffer("image/png");

  const file = bucket.file(`profiles/${userId}.png`);
  const stream = file.createWriteStream({
    metadata: {
      contentType: "image/png",
    },
  });

  createReadStream(buffer).pipe(stream);

  await new Promise((resolve, reject) => {
    stream.on("error", reject);
    stream.on("finish", resolve);
  });
}

async function getUserInfo(userId) {
  const user = await User.findById(userId);

  if (!user) return null;

  return user;
}

async function getPokemonSprite(pokemonName) {
  const response = await axios.get(
    `https://pokeapi.co/api/v2/pokemon/${pokemonName}`
  );
  return response.data.sprites.front_default;
}
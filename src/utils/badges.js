export const badgesImages = {
  Paleta: {
    normal:
    "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/badges%2Fnormal.png?alt=media&token=50fbf035-09e1-4330-8d83-bb090bf60ce7",
    silhouette:
    "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/badges%2Fnormal_silueta.png?alt=media&token=72c346cc-e98b-4bc4-8387-6203d018fdb8"
  },

  Freedom: {
    normal:
    "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/badges%2Fflying.png?alt=media&token=d9c902fc-bc8b-4c88-91da-d010f9760fc2",
    silhouette:
    "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/badges%2Fflying_silueta.png?alt=media&token=57fa24a7-2311-40c0-9e46-93391139fa45"
  },

  Venenin: {
    normal:
    "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/badges%2Fpoison.png?alt=media&token=7d7d18f9-b1e0-4346-b9e3-daa8d2cb594a",
    silhouette:
    "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/badges%2Fpoison_silueta.png?alt=media&token=38d281f0-172f-44d0-80fb-ef24aaaefc88"
  },

  Divergente: {
    normal:
    "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/badges%2Fground.png?alt=media&token=cbb12a8b-ce0e-4f00-bdb4-2344232a0883",
    silhouette:
    "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/badges%2Fground_silueta.png?alt=media&token=b9edfb58-0c89-4047-9e60-1b11ed6b405d"
  },

  Adamantium: {
    normal:
    "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/badges%2Fsteel.png?alt=media&token=2d1a0b27-dbaa-4be0-8ba5-668bf711a7b3",
    silhouette:
    "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/badges%2Fsteel_silueta.png?alt=media&token=d65cf493-3955-49c1-8117-5c2f3daf6b75"
  },

  Herbe: {
    normal:
    "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/badges%2Fgrass.png?alt=media&token=f11eeb9e-fb55-42cd-8ee5-1a59ddf17053",
    silhouette:
    "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/badges%2Fgrass_silueta.png?alt=media&token=c2f3d923-05a6-499a-8d84-108ae30335f6"
  },

  Tesla: {
    normal:
    "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/badges%2Felectric.png?alt=media&token=d6d84c7f-c91b-4e75-aa11-e9b2feb560a3",
    silhouette:
    "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/badges%2Felectric_silueta.png?alt=media&token=d3b026e5-6311-474b-890f-af3db4445858"
  },

  Rugido: {
    normal:
    "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/badges%2Fdragon.png?alt=media&token=e4753f4e-0f7b-4f4f-91cb-c77096d56c22",
    silhouette:
    "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/badges%2Fdragon_silueta.png?alt=media&token=d909fb55-89d1-48af-841b-01aad7ce75f7"
  },

  Nyxia: {
    normal:
    "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/badges%2Fdark.png?alt=media&token=041836c4-450f-48a1-8ed6-93c418c72673",
    silhouette:
    "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/badges%2Fdark_silueta.png?alt=media&token=fea46122-9058-40de-8be5-fe4b4f2181f6"
  },

  King: {
    normal:
    "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/badges%2Ffairy.png?alt=media&token=75c540cd-0d05-45a2-b9b9-6f7d755c84a5",
    silhouette:
    "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/badges%2Ffairy_silueta.png?alt=media&token=59bcbcd1-5637-4f64-9539-18dbbdc8866b"
  },
};


export const badgesCoordinates = [
  { x: 25, y: 5, width: 50, height: 50 },
  { x: 100, y: 5, width: 50, height: 50 },
  { x: 175, y: 5, width: 50, height: 50 },
  { x: 250, y: 5, width: 50, height: 50 },
  { x: 325, y: 5, width: 50, height: 50 },
  { x: 25, y: 75, width: 50, height: 50 },
  { x: 100, y: 75, width: 50, height: 50 },
  { x: 175, y: 75, width: 50, height: 50 },
  { x: 250, y: 75, width: 50, height: 50 },
  { x: 325, y: 75, width: 50, height: 50 },
];


export function getBackgroundImageUrl(numBadges) {
  let backgroundImageUrl;

  if (numBadges < 5) {
    backgroundImageUrl =
    "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/templates%2Fbg1.png?alt=media&token=dd4f9456-b9a6-45f5-96f8-1bf7340f7677";
  } else if (numBadges >= 5 && numBadges <= 7) {
    backgroundImageUrl =
    "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/templates%2Fbg2.png?alt=media&token=c258acd1-a240-4580-bc84-bef73db5cd46";
  } else if (numBadges >= 8 && numBadges <= 9) {
    backgroundImageUrl =
    "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/templates%2Fbg3.png?alt=media&token=c156359f-3629-44cf-8875-c8889b49291c";
  } else if (numBadges == 10) {
    backgroundImageUrl =
    "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/templates%2Fbg4.png?alt=media&token=dc8a7352-1c02-49f5-bb80-ac73e6cae29c"
  }

  return backgroundImageUrl;
}


export const pokeballIconUrl = "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/templates%2Fpokeballbg.png?alt=media&token=7aac7dcf-d671-4591-9137-95e0cc9d3dec";
import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
// Tamaño del lienzo
const canvasWidth = 500;
const canvasHeight = 300;

// Crear lienzo
const canvas = createCanvas(canvasWidth, canvasHeight);
const ctx = canvas.getContext('2d');

// Cargar la imagen de fondo
const backgroundImage = await loadImage('https://fbi.cults3d.com/uploaders/21796074/illustration-file/d4420fd0-de4c-4596-b4c1-2e31dcd40c03/Medallas-Sinnoh-1.png'); // Ruta de tu imagen de fondo
ctx.drawImage(backgroundImage, 0, 0, canvasWidth, canvasHeight);

// Coordenadas y tamaño de las medallas
const medallas = [
    { x: 50, y: 50, width: 50, height: 50 },
    { x: 150, y: 50, width: 50, height: 50 },
    { x: 250, y: 50, width: 50, height: 50 },
    { x: 350, y: 50, width: 50, height: 50 },
    { x: 50, y: 150, width: 50, height: 50 },
    { x: 150, y: 150, width: 50, height: 50 },
    { x: 250, y: 150, width: 50, height: 50 },
    { x: 350, y: 150, width: 50, height: 50 }
  ];

// Cargar imágenes de medallas
const medallaSilueta = await loadImage('https://images.wikidexcdn.net/mwuploads/wikidex/0/09/latest/20180812034547/Medalla_Arco%C3%ADris.png'); // Ruta de la imagen de la silueta de la medalla
const medallaColor = await loadImage('https://images.wikidexcdn.net/mwuploads/wikidex/e/e6/latest/20180812014833/Medalla_Trueno.png'); // Ruta de la imagen de la medalla en color
const medallasConseguidas = [true, false, false, false, false, false, false, false];

// Dibujar las medallas en el lienzo
medallas.forEach((medalla, index) => {
  const image = medallasConseguidas[index] ? medallaColor : medallaSilueta;
  ctx.drawImage(image, medalla.x, medalla.y, medalla.width, medalla.height);
});

// Guardar el lienzo como imagen
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('medallero.png', buffer);

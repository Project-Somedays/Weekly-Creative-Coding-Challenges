/*
Author: Project Somedays
Date: 2025/03/10
Title: WCCChallenge 2025 Week 11 - Only Lines

Love me some barrier grid animations 🤩
https://en.wikipedia.org/wiki/Barrier-grid_animation_and_stereography

Thanks Raph for posting the ideal photo for this 💓

*/



let screen;
let slitWidth = 4;
let raphA, raphB;
let interlacedRaph;
let interlacedShiffman;
let gui, params;
let shiffmanL, shiffmanC, shiffmanR;



function preload(){
  raphA = loadImage("RaphA.png");
  raphB = loadImage("RaphB.png");
  shiffmanL = loadImage("ShiffmanLeft.png");
  shiffmanC = loadImage("ShiffmanCentre.png");
  shiffmanR = loadImage("ShiffmanRight.png");
}


function setup() {
  createCanvas(1080, 1080);

  interlacedRaph = {img: interlaceImages([raphA, raphB], slitWidth), count: 2};
  interlacedShiffman = {img: interlaceImages([shiffmanL, shiffmanC, shiffmanR, shiffmanC], slitWidth), count: 4};

  gui = new lil.GUI();
  params = {
    baseImage: interlacedRaph
  }

  gui.add(params, 'baseImage', {Raph: interlacedRaph, Shiffman: interlacedShiffman}).onChange(()=>{screen = prepScreen()});
  imageMode(CENTER);

  screen = prepScreen();

  
}

function draw() {
  background(0);
  image(params.baseImage.img, width/2, height/2);
  let screenX = round(mouseX / slitWidth) * slitWidth + width/2;
  image(screen, screenX, height/2);
}


function interlaceImages(images, slitWidth) {
  if (images.length < 1) {
    console.error("At least one image is required.");
    return null;
  }

  // Check if all images have the same dimensions
  let firstImage = images[0];
  for (let i = 1; i < images.length; i++) {
    if (images[i].width !== firstImage.width || images[i].height !== firstImage.height) {
      console.error("All images must have the same dimensions.");
      return null;
    }
  }

  let interlaced = createImage(firstImage.width, firstImage.height);
  interlaced.loadPixels();

  for (let img of images){
    img.loadPixels();
  }

  for (let y = 0; y < interlaced.height; y++) {
    for (let x = 0; x < interlaced.width; x++) {
      let stripIndex = Math.floor(x / slitWidth);
      let pixelIndex = 4 * (y * interlaced.width + x); // 4 for RGBA

      let imageIndex = stripIndex % images.length; // Cycle through images

      let currentImage = images[imageIndex];

      interlaced.pixels[pixelIndex] = currentImage.pixels[pixelIndex];
      interlaced.pixels[pixelIndex + 1] = currentImage.pixels[pixelIndex + 1];
      interlaced.pixels[pixelIndex + 2] = currentImage.pixels[pixelIndex + 2];
      interlaced.pixels[pixelIndex + 3] = currentImage.pixels[pixelIndex + 3];
    }
  }

  interlaced.updatePixels();
  return interlaced;
}

function prepScreen(){
  let screen = createGraphics(width, height);
  screen.background(0);
  screen.rectMode(CENTER);
  screen.erase()
  for (let i = 0; i < width / slitWidth; i++) {
    if (i % params.baseImage.count === 0) screen.rect(slitWidth * (i + 0.5), height / 2, slitWidth, height); // Only erase every other rectangle
  }
  screen.noErase();

  return screen;
}

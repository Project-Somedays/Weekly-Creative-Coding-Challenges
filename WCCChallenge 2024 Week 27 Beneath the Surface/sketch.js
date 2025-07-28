let body_A,body_B,body_C,body_D;
let img1, img2;
let shaderProgram;
let noiseZoom = 100;
let noiseProgRate = 50;
let layers;
let pixels;
let tiles = [];
let step = 5;
let layerSets = [];

let captureMode = false;



function preload() {
  // Load the images
  jekyllHydeHyde = loadImage('images/JekyllandHyde_Hyde.png');
  jekyllHydeJekkyl = loadImage('images/JekyllandHyde_Jekyll.png');
  dorianGrayDorian = loadImage('images/Dorian-Gray-Dorian.png');
  dorianGrayPicture = loadImage('images/Dorian-Gray-Picture.png');
  smeagolGollumGollum = loadImage('images/SmeagolGollum_Gollum.png');
  smeagolGollumSmeagol = loadImage('images/SmeagolGollum_Smeagol.png');
  body_A = loadImage("images/body_A.png");
  body_B = loadImage("images/body_B.png");
  body_C = loadImage("images/body_C.png");
  body_D = loadImage("images/body_D.png");
}

function setup() {
  createCanvas(720, 720);
  frameRate(30);
  pixelDensity(1);

  // so we can just grab the pixels that have something on them


  layerSets = [
    [smeagolGollumGollum, smeagolGollumSmeagol], // smeagol/gollum
    []
    [dorianGrayDorian, dorianGrayPicture],
    [body_A, body_B, body_C, body_D] // body

  ]
  pixels = [];
  for(let i = 0; i < layers.length; i++){
    let sclFactor = height/layers[i].height;
    pixels[i] = createGraphics(width, height);
    pixels[i].image(layers[i],0,0,layers[i]*sclFactor, layers[i]*sclFactor);
    pixels[i].loadPixels();
  }

  // ignore samples that are completely transparent
  // for (let i = 0; i < width; i += step) {
  //   for (let j = 0; j < height; j += step) {
  //     if (containsOpaquePixels(i, j)) tiles.push(new Tile(i, j));
  //   }
  // }


  // -------------- CAPTURE BIZ ----------------------//

  // capturer = new CCapture({
  //   format: 'png',
  //   framerate: fps
  // });
  stroke(255);
  noFill();

}

function draw() {
  background(0);
  if (captureMode && frameCount === 1) capturer.start();

  for (let i = 0; i < width; i += step) {
    for (let j = 0; j < height; j += step) {
      let ix = int(map(noise(i / noiseZoom, j / noiseZoom, frameCount/noiseProgRate),0,1,0,layers.length));
      image(pixels[ix],i,j,step, step, i, j, step, step)
    }
  }



  if (captureMode && frameCount === 30 * 30) {
    noLoop();
    console.log('finished recording.');
    capturer.stop();
    capturer.save();
    return;
  }

  if (captureMode) capturer.capture(document.getElementById('defaultCanvas0'));

}

// for filtering out completely transparent pixels that don't change
function containsOpaquePixels(x, y, imageOptions) {
  for (let i = x; i <= x + step; i++) {
    for (let j = y; j <= y + step; j++) {
      let ix = i + j * width;
      if(imageOptions.some(each => {
        each.pixels[ix + 3] > opacityThreshold
      }));
    }
  }
  return false;
}

class Tile {
  constructor(x, y) {
    this.p = createVector(x, y);
    this.noiseVal;
  }

  update() {
    this.noiseVal = noise(this.p.x / noiseZoom, this.p.y / noiseZoom, frameCount * noiseProgRate);
  }

  show() {
    if (this.noiseVal < 0.5) {
      image(dorian, this.p.x, this.p.y, step, step, this.p.x, this.p.y, step, step);
    } else {
      image(picture, this.p.x, this.p.y, step, step, this.p.x, this.p.y, step, step);
    }

  }
}
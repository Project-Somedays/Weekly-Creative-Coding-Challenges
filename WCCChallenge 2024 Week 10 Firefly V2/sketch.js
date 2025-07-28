/*
Author: Project Somedays
Date: 2024-03-05
Title: #WCCChallenge "Firefly"

Using a technique I've been experimenting with to make the cast of Firefly out of Fireflies =)
Needed a mapping of greyscale brightness to a yellow spectrum
I want naturalistic movement = mapping 1D perlin noise values to position on the screen for x and y for each firefly
We sample from the target image and give each firefly a target position and colour
So they're not moving too far, we set a bounding box/neighbourhood for them to fly in
To give the impression of 3D, we randomise the size of the fireflies
To get a naturalistic look when we converge on the target, we just shrink the bounding box (as opposed to setting the position of the fireflies directly)
So we're not giving the game away, fireflies lerpColor between plain yellow and their target colour in diverged and converged states respectively
Quad easing function keeps the lerp looking fluid
*/

// control variables
const swarmProgressRate = 0.003; // how much should they fly around
const framesPerCycle = 300; // frames between one image and the next
let globOffset = 0; // current 1D Perlin Noise input


// images and sampling settings
let sampleEvery;
let darkestYellow, yellow, transparent;
let imgReynolds, imgJayne, imgZoe, imgWash, imgSummer, imgKaylee, imgInara, imgSimon, imgShepherd, imgSerenity;
let carousel; // for setting up a specific order of the images
let cIx; // carousel index
let scaleFactor; // window size responsiveness
let maxTargets; // how big is the biggest array of targets?
const faceSize = 0.8;
const detailLevel = 100;

// lerping function and tracking
// const easeInOutQuad = (x) => {x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2};
let convergeTracker = 0; // global lerp slider
let easingX = 0; // easing input

// global sequence tracking
let currentFrame = 0;
let firstCycle = true;
let transitionTracker = 0;

// firefly biz 
let swarm;
let neighbourhood;

// loading all the images
function preload(){
  imgReynolds = loadImage("imagesFinal/Nathan Fillion.png");
  imgJayne = loadImage("imagesFinal/Jayne Cobb.png");
  imgZoe = loadImage("imagesFinal/Zoe.png");
  imgSummer = loadImage("imagesFinal/summer.png");
  imgKaylee = loadImage("imagesFinal/Kaylee.png");
  imgInara = loadImage("imagesFinal/Inara.png");
  imgSimon = loadImage("imagesFinal/Simon.png");
  imgWash = loadImage("imagesFinal/Wash.png");
  imgShepherd = loadImage("imagesFinal/Shepherd.png");
  imgSerenity = loadImage("imagesFinal/Serenity.png")
}

function setup() {
  createCanvas(windowWidth, windowHeight, P2D);
  noStroke();
  frameRate(30);
  pixelDensity(1);
  
  // all images are the same height (1080px) by design
  scaleFactor = faceSize*height/1080;
  sampleEvery = int(height/detailLevel); //also set the size of the fireflies

  // setting colour values
  yellow = color(255, 255, 0);
  darkestYellow = color(131,77,13);
  transparent = color(255, 255, 0, 0);

  // the neighbourhood determines the default size of the bounding box for each firefly
  neighbourhood = 0.8*max(width, height);     
  
  // convert all the images to arrays of targets
  carousel = [imgShepherd, imgReynolds, imgJayne, imgKaylee, imgZoe, imgWash, imgSummer, imgSimon, imgInara].map((each) => convertImageToTargets(each, scaleFactor));
  carouselLengths = carousel.map(e => e.length)
  maxTargets = max(carouselLengths); // sets the size of the array
  
  // make a swarm
  swarm = new Swarm(carousel[0], carousel[1]);
  console.log(swarm);
  cIx = 1;    
}

function draw() {
  background(0);
  image(imgSerenity, 0,0, imgSerenity.width*(height/1080), imgSerenity.height*(height/1080));

  currentFrame = frameCount % framesPerCycle; // tracker for how far we are through the cycle
  
  // 
  if(currentFrame < framesPerCycle/2){
    easingX += 2/framesPerCycle;
  } else {
    transitionTracker += 2/framesPerCycle; // in the second half of the cycle, transition from one target to the next
    // swarm.switchTargets();
    easingX -= 2/framesPerCycle;
  }

  


  // convergeTracker = 0.5*(sin(a-HALF_PI) + 1); // sine easing function
  convergeTracker = easeInOutQuad(easingX);
  
  swarm.update();
  swarm.show();
 
  // MOVE ON TO THE NEXT IMAGE
  if(currentFrame === 0 && !firstCycle){
    transitionTracker = 0;
    easingX = 0;
    cIx = (cIx + 1)%carousel.length; // loop the images
    swarm.cycle(carousel[cIx]) // remap
    // console.log(`castIndex: ${cIx}`);
    
  }

  textSize(20);
  fill(0);
  rect(0.4*width,0.4*height, 0.4*width, 0.2*height);
  fill(255);
  text(currentFrame,width/2, height/2);
  text(easingX,width/2, height/2 + 20);
  text(transitionTracker,width/2, height/2 + 40);
  text(convergeTracker,width/2, height/2 + 60);
  // text(swarm[0].target, width/2, height/2 + 80);
  
  // flashCycle += flashCycleRate;
  firstCycle = false;
  globOffset += swarmProgressRate;
  
}




// samples from an image, remapping greyscale brightness to a yellow spectrum
function convertImageToTargets(img, scaleFactor = 1){
  let targets = [];
  img.resize(img.width*scaleFactor, 0); // resize the image and load the pixels
  img.loadPixels();
  let xOff = width/2 - img.width/2;
  let yOff = height/2 - img.height/2;
  for(let y = 0; y < img.height; y+= sampleEvery){
    for(let x = 0; x < img.width; x+= sampleEvery){
        let ix = (x + y*img.width)*4;
        if(img.pixels[ix+3] === 0) continue; // ignore transparent values
        let brightness = int((img.pixels[ix] + img.pixels[ix+1] + img.pixels[ix+2])/3); // get the greyscale brightness
        let cVal = map(brightness, 0, 255, 0, 1); // scale it between 0 and 1
        let c = lerpColor(darkestYellow, yellow, cVal); // lerp colour: yellow to dark yellow
        targets.push({'c': c, 'x': x + xOff, 'y': y + yOff}); // capture the x y position and the colour value
      }
  }
  return targets
}

function easeInOutQuad(x){
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}


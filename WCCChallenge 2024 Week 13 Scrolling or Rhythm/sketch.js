/*
Author: Project Somedays
Date: 2024-03-28
Title: #WCCChallenge Scrolling/Rhythm 
Music: African Percussion by SOFRA on Pixabay.com https://pixabay.com/music/world-african-percussions-8178/

Having a LOT of fun with these weekly creative coding challenges, reviewed Sundays on https://www.twitch.tv/sableraph
Can't recommend highly enough the The Birb's Nest Discord community: https://discord.gg/S8c7qcjw2b

RE the prompt: Why not do both?

I'm a little obsessed with Fast Fourier Transforms. Colour is mapped to frequency band and starting size is mapped to amplitude of that band.

Any frequency band under the threshold is ignored to a) go lighter on resources b) give a bit of visual distinction between the bands
For the same reason, movers accelerate over time. Plus, I quite like the stacking effect at the start.

Technically, I guess this is a music visualisation. The only "generative" aspect is the noise field that makes amplitude circles bulge. It pleases me though.

Feel free to play any music you like through it! I figured something Afrian was going to be nice and rhythmic though.
*/


// music analysis biz
const bins = 64; // must be a power of 2 for the FFT to work apparently
const ampThreshold = 0.33; // under this, frequency bands are ignored
let music;
let fft;

// visuals biz
const xStart = 0.8; // how far over should we start the visualisation
const noiseZoom = 300; // the larger the number, the more uniform the noise
const opacity = 100; // of out 100
const noiseFieldOffsetSpeed = 0.03; // how much the noise field changes over time
let moverSize;
let noiseFieldOffset = 0;

// mover biz
const acceleration = 0.03;
const startingVelocity = -1;
const maxSizeMultiplier = 10;
let movers = [];


function preload(){
  music = loadSound("african-percussions-8178.mp3");
}

function setup() {
  // createCanvas(windowWidth, windowHeight);
  createCanvas(1920, 1080);
  pixelDensity(1);
  noStroke();
  colorMode(HSB, 360, 100, 100, 100);
  frameRate(30);
  
  // making the fft object and feeding it the music
  fft = new p5.FFT(0.8, bins);
  fft.setInput(music);
  
  moverSize = height/bins;

  music.loop();
}

function draw() {
  background(0);
  

  let freqBands = fft.waveform();

  
  // each frame, generate a waveform and, provided a frequency band is loud enough, generate a mover to resent it over time
  for(let i = 0; i < freqBands.length; i++){
    let amp = freqBands[i];
    if(abs(amp) < ampThreshold) continue;
      let x = xStart*width;
      let y = i*moverSize;
      let hue = map(y, 0, height, 0, 360);
      let colour = color(hue, 100, 100, opacity);
      
      movers.push(new Mover(x,y,amp, colour));
  }
 

  // let movers do mover things
  for(let m of movers){
    m.update();
    m.show();
  }

  
  // tidying up movers that have moved off the screen
  // Done in a separate pass because updating and showing in reverse order looked funny.
  for(let i = movers.length - 1; i >= 0; i--){
    if(movers[i].p.x < - 2*moverSize){
      movers.splice(i,1); // remove if off the screen
    }
  }

  
  noiseFieldOffset += noiseFieldOffsetSpeed;
}


// toggle music with mouseclick
function mousePressed(){
  if(mouseButton === LEFT){
    if(music.isPlaying()){
      music.stop();
    } else {
      music.loop();
    }

  }
}


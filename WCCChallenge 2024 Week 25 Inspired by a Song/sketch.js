/*
Author: Project Somedays
Date: 2024-06-22
Title: WCCChallenge "Based on a song"

NOTE: Needs sound on to work! If it isn't doing much, try restarting. Weird OpenProcessing Biz that I don't understand will be afoot. 

Rest assured! Is copyright-free music. Licence attached.

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/S8c7qcjw2b

Decided to take it literally and recycle an old processing project - is sound visualisation with rotational symmetry 😊
- Movers represent different frequency bands.
- Movers are driven upwards against gravity with a force proportional to amplitude for that frequency band.
- Draw to a separate buffer canvas.
- Show lots of rotations of the same canvas = only controlling one set of bands = happier CPU
- Circles shrink and grow sinusoidally

INTERACTION
 - ENTER to toggle music
 - 'd' to toggle debugMode

RESOURCES
 - Copyright-free royalty-free music by SergePavkinMusic on Pixabay: "Reflected Light" https://pixabay.com/music/beautiful-plays-reflected-light-147979/

TODO's AND OPPORTUNITIES
	- normalise by overall amplitude so that movers don't get stuck at the top of their limit during overall loud bits (check debugMode)
	- bring into 3D
	- different symmetries
*/

let debugMode = false;
let cnv; 
let music;
let fft;
let gravityStrength = 0.2;
let maxKick = 1.35;
const lowerThreshold = 0;
let gravity;
let isPlaying = true;
const symmetries = 16;
const cycleRate = 1200;
const circlePulseRate = 120;


let gravSlider;
let thrustSlider;

let baseColourPalette;
let finalColourPalette;
const bins = 128;

let movers = [];

function preload(){
  music = loadSound("reflected-light-147979.mp3")
}

function setup() {
  // createCanvas(min(windowWidth, windowHeight), min(windowWidth, windowHeight));
  createCanvas(1080,1080);
  
  cnv = createGraphics(width, height);
	cnv.noStroke();
  
  baseColourPalette = "#ff595e, #ff924c, #ffca3a, #8ac926, #52a675, #1982c4, #4267ac, #6a4c93".split(", ").map(e => color(e));
  finalColourPalette = fillInColourPalette(baseColourPalette, int(bins/baseColourPalette.length));
  // console.log(finalColourPalette);

  // for prototypying - took a fair amount of trial and error to get the right values to be interesting
  gravSlider = createSlider(0,2.5,gravityStrength,0.1).hide();
  thrustSlider = createSlider(0,5,maxKick,0.1).hide();

  gravity = createVector(0, gravityStrength);

  fft = new p5.FFT(1, bins);

  for(let i = 0; i < bins; i ++){
    movers.push(new Mover((i+0.5)*width/bins, height, finalColourPalette[i], i*TWO_PI/bins));
  }

  music.play();
  // console.log(movers);

  imageMode(CENTER);
	textAlign(CENTER, CENTER);
	fill(255);
	textSize(width/20);
	
}



function draw() {
  background(0);

  // toggle music
  if(isPlaying && !music.isPlaying()) music.loop();
  if(!isPlaying && music.isPlaying()) music.stop();

  // clear the canvas
  cnv.clear();
  
  gravity.setMag(gravSlider.value());
  maxKick = thrustSlider.value();
  
  let spectrum = fft.waveform();
  drawMovers(cnv, spectrum);
	
	if(debugMode){
		image(cnv, width/2, height/2);
		return;
	}
	
	if(!music.isPlaying()) text( "🔊+🎵 to view\nEnter toggles 🎵", width/2, height/2);
 
  push();
  translate(width/2, height/2);
  rotate(frameCount*TWO_PI/cycleRate);
  for(let i = 0; i < symmetries; i++){
    push();
    rotate(i*TWO_PI/symmetries);
    image(cnv, 0, 0, cnv.width*0.7, cnv.height*0.7);
    pop();
  }
  pop();
  

  // text(`Gravity: ${gravityStrength}`, width/2, height*0.9);
  // text(maxKick, width/2, height*0.95);
}

function keyPressed(){
	if(key === 'd' || key === 'D') debugMode = !debugMode;
	if(keyCode === ENTER) isPlaying = !isPlaying;
}

function showWaveform(spectrum){
  for(let i = 0; i < spectrum.length; i++){
    let x = (i+0.5)*width/spectrum.length;
    let y = height*(1 - abs(spectrum[i]));
    fill(finalColourPalette[i]);
    circle(x,y,width/spectrum.length);
  }
}

function drawMovers(layer, spectrum){
  for(let i = 0; i < movers.length; i++){
    let thrustY = map(abs(spectrum[i]),0,1,0,maxKick); // normalised to 0 to 1;
    let f = createVector(0, -thrustY);
    if(thrustY > lowerThreshold) movers[i].applyForce(f);
    movers[i].applyForce(gravity);
    movers[i].update();
    movers[i].show(layer);
  }
}

class Mover{
  constructor(x, y, col, offset){
    this.p = createVector(x,y);
    this.v = createVector(0,0);
    this.a = createVector(0,0);
    this.colour = col;
		this.offset = offset;
  }

  applyForce(f){
    this.a.add(f);
  }

  update(){
    this.v.add(this.a);
    // this.v.limit(maxKick);
    this.p.add(this.v);
    this.a.mult(0);
    if(this.p.y < 0){
      this.p.y = 0; // keep it on the screen
      this.v.mult(0);
    }
    if(this.p.y > height){
      this.p.y = height; // keep it on the screen
      this.v.mult(0);
    }
  }

  show(layer){
    layer.fill(this.colour);
		let circScale = map(sin(frameCount*TWO_PI/circlePulseRate + this.offset ),-1,1,1,3);
    layer.circle(this.p.x, this.p.y, circScale*width/bins);
  }
}

function fillInColourPalette(palette, subdivisions){
  let newPalette = [];
  for(let i = 0; i < palette.length; i++){
    for(let subdiv = 0; subdiv < subdivisions; subdiv ++){
      let colourA = palette[i];
      let colourB = palette[(i+1)%palette.length];
      let newCol = lerpColor(colourA, colourB, subdiv/subdivisions);
      newPalette.push(newCol);
    }
  }
  return newPalette;
}
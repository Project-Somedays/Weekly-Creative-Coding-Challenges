/*
| Author          | Project Somedays                    
| Title           | WCCChallenge 2026 Week 23 - "A Riot of Colour"
| 📅 Started      | 2025-06-07
| 📅 Completed    | 2025-06-07       
| 🕒 Taken        | 45mins                 
| 🤯 Concept      | Triggering releases of boids with the bass
| 🔎 Focus        | FFT
| 🤖 AI-use       | Minor bug fixes

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/S8c7qcjw2b

Building off an old project: Genuary 2024 Day 19 - Flocking
Building off the https://p5js.org/examples/simulate-flocking.html code from Dan Shiffman's Nature of Code

Showing the boids by the forces enacted upon them

📃THE ALGORITHM📃
- Flocking sim:
	1. Separation: Don't get too close to other boids
   2. Alignment: Go in the direction the nearest boids 
   3. Cohesion: Gather near other boids
- Render: show the forces applied to each boid using the 3 colour channels
- Monitor the lowest frequency band and, when there's a significant change, release a bunch more boids from somewhere

👉INTERACTION👈
None

📦RESOURCES📦
- Coolors.co

🤔TO IMPROVE🤔
- hmmm sliders for adjustments?
*/

/*
Author: Project Somedays
Date: 2024-05-15 updated 2024-05-16
Title: 

Building off an old project: Genuary 2024 Day 19 - Flocking
Building off the https://p5js.org/examples/simulate-flocking.html code from Dan Shiffman's Nature of Code

Royalty-free music from Pixabay: 
Epic Dubstep Dramatic (Shadow Rising)
https://pixabay.com/music/dubstep-epic-dubstep-dramatic-shadow-rising-475329/

I quite like the idea of seeing the flocking behaviour purely through the forces that are involved

WIP
*/

const palettes = [
  "#fe218b, #fed700, #21b0fe".split(", "),
	"#f6511d, #ffb400, #00a6ed".split(", "),
	"#f72585, #7209b7, #3a0ca3".split(", "),
	"#fe4a49, #fed766, #009fb7".split(","),
	"#5bc0eb, #fde74c, #9bc53d".split(", "),
	"#f18f01, #048ba8, #2e4057".split(", "),
	"#d00000, #ffba08, #3f88c5".split(", ")
];

const noiseZoom = 200;
let flock;
let r;
let los;
let desiredseparation;
let sepCol, aliCol, cohCol;
let yardstick;
let fft;
let threshold = 0.75;
let prevBassVal;
let music;
let currentPalette;
let bassSpectrum;

function preload(){
	music = loadSound("paulyudin-epic-dubstep-dramatic-shadow-rising-475329.mp3", 
					  () => {
							console.log("Hooray! Music loaded successfully");
							music.loop();
					  }, 
					  () => console.log("Uh oh! Problem loading music")
					 );
}

function setup() {
  // createCanvas(1080,1080);
	createCanvas(windowWidth, windowHeight);
  // createP("Drag the mouse to generate new boids.");
	pixelDensity(1);
	yardstick = min(width,height);
  los = yardstick/20;
  r = yardstick/80;
  desiredseparation = yardstick/25;
  strokeWeight(5);

  getColours();

  flock = new Flock();
  // Add an initial set of boids into the system
  for (let i = 0; i < 25; i++) {
    flock.addBoid(new Boid(random(width*0.25, width * 0.75), random(height*0.25, height*0.75), sepCol, aliCol, cohCol));
  }
  background(51);

	fft = new p5.FFT(0.8, 16);
	
}

function draw() {
  if(frameCount % 10 === 0) bassSpectrum = fft.analyze()[0];
  if(bassSpectrum - prevBassVal > threshold){
		// set a random starting point
	  getColours(100); // update the colours
	  let p = createVector(random(width*0.25, width*0.75), random(height*0.25, height * 0.75));
	   
	  for (let i = 0; i < 25; i++) {
	    let b = new Boid(p.x, p.y);
	    flock.addBoid(b);
	  }
  }
  prevBassVal = bassSpectrum;
  flock.run();
  flock.cull(); // clear out boids that have left the screen
	
}

// Add a new boid into the System
function mouseDragged() {
  flock.addBoid(new Boid(mouseX, mouseY, sepCol, aliCol, cohCol));
}


function showForceVector(colour, position, vec){
  stroke(colour);
  let a = vec.heading();
  let r = vec.mag()*500;
  line(position.x, position.y, position.x + r*cos(a), position.y + r*sin(a));
}

function getColours(opacity){
  // Assuming shuffleArray is a custom function you've defined elsewhere
  let selectedPalette = shuffleArray(random(palettes));
  
  currentPalette = selectedPalette.map(hexString => {
    let c = color(hexString); // 1. Convert the hex string into a p5.Color object
    c.setAlpha(opacity);      // 2. Set the alpha on the p5.Color object
    return c;                 // 3. Return the new object to the mapped array
  });
  
  sepCol = currentPalette[0];
  aliCol = currentPalette[1];
  cohCol = currentPalette[2];
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getDesiredSeparation(x,y){
  return map(noise(x/noiseZoom, y/noiseZoom, frameCount/noiseZoom), 0,1,0.25,2);
}

function generateFlock(){
  flock = new Flock();
  // Add an initial set of boids into the system
  for (let i = 0; i < 25; i++) {
    flock.addBoid(new Boid(width*0.5,height*0.25));
    flock.addBoid(new Boid(width*0.75, height*0.5));
    flock.addBoid(new Boid(width*0.5,height*0.75));
    flock.addBoid(new Boid(width*0.25, height*0.5));
  }
}






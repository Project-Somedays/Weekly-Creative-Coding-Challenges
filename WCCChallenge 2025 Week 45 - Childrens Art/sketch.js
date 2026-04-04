/*
| Author          | Project Somedays                      
| Title           | WCCChallenge 2025 Week 45 - Child's Art
| 📅 Started      | 2025-11-05      
| 📅 Completed    | 2025-11-05        
| 🕒 Taken        | 45 mins                    
| 🤯 Concept      | Kids are NOT good at drawing straight lines 😅
| 🔎 Focus        | Getting an organic feel

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/g5J6Ajx9Am

The Algorithm:

1. Am I turning? Complete the turn lerping over this.lerpFrames to change direction slowly
(easeInOutBack to overshoot at both ends)

At the end of the turn i.e. when progress >= 1, set lerpFrames = how sharp the turn is using normal distribution, min 30 frames

2. Not Turning? 10% of the time, choose a random direction 90 degrees from current dir of travel and start the turn
3. Add velocity to position
4. Look at the evolving vector field under me 👉 set thickness of the stroke

Every now and then shuffle the order of the movers so lines go over and under each other

RESOURCES
- https://easings.net/#easeInOutBack
- https://coolors.co/palettes/popular/10%20colors

TODO
- [x] Add lil-gui sliders to play with

*/


let dirs;
let noiseZoom = 100;
const palettes = {
  "Vibrant Tones": "#f94144, #f3722c, #f8961e, #f9844a, #f9c74f, #90be6d, #43aa8b, #4d908e, #577590, #277da1",
 "Purple Raindrops": "#f72585, #b5179e, #7209b7, #560bad, #480ca8, #3a0ca3, #3f37c9, #4361ee, #4895ef, #4cc9f0",
 "Gradient Blues": "#7400b8, #6930c3, #5e60ce, #5390d9, #4ea8de, #48bfe3, #56cfe1, #64dfdf, #72efdd, #80ffdb",
 "Magical Seaside": "#54478c, #2c699a, #048ba8, #0db39e, #16db93, #83e377, #b9e769, #efea5a, #f1c453, #f29e4c",
 "Rainbow Skies": "#ff5400, #ff6d00, #ff8500, #ff9100, #ff9e00, #00b4d8, #0096c7, #0077b6, #023e8a, #03045e",
  "Serenity Shades": "#336699, #5c98c0, #70b1d4, #84cae7, #a1e1cf, #bdf7b7, #8ee3a7, #5fcf97, #30bb87, #00a676"
}

let currentPalette = [];

let n = 10;
let movers = [];
let noiseProgression = 0.01;
let defaultLerpFrames = 120;

let noiseParams, moverParams, generalParams;

const gui = new lil.GUI();
const folderNoise = gui.addFolder("Noise Biz");
const folderMover = gui.addFolder("Mover Biz");



function setup() {
  createCanvas(windowWidth, windowHeight);

  // split the colours into arrays
  for (let key in palettes) {
    palettes[key] = palettes[key].split(', ');
  }

  noiseParams = {
    noiseZoom: 100,
    noiseProgRate: 0.01,
  }

  folderNoise.add(noiseParams, 'noiseZoom', 1, 500, 1);
  folderNoise.add(noiseParams, 'noiseProgRate', 0.001, 0.05, 0.001);

  moverParams = {
    moverCount: 20,
    defaultLerpFrames: 120,
    maxStrokeThickness: width/50,
    turnProbability: 0.1,
    shuffleProbability: 0.05,
    currentPalette: "Magical Seaside"
  }

folderMover.add(moverParams, 'moverCount', 1, 100, 1).onChange(val => {
  background(0); // wipe the screen
  movers = [...generateMovers(val)];
});
folderMover.add(moverParams, 'defaultLerpFrames', 30, 300, 10);
folderMover.add(moverParams, 'maxStrokeThickness', 0.1, width/10, 0.1);
folderMover.add(moverParams, 'turnProbability', 0, 1, 0.01);
folderMover.add(moverParams, 'shuffleProbability', 0, 1, 0.01);
folderMover.add(moverParams, 'currentPalette', Object.keys(palettes)).onChange(val => {
  background(0); // wipe screen
  currentPalette = setPaletteFromGUI(val, movers);
});

generalParams = {
  screenWipe: wipeScreen,
  updatesPerFrame: 1
}
gui.add(generalParams, 'screenWipe');
gui.add(generalParams, 'updatesPerFrame', 1, 10, 1);
currentPalette = setPaletteFromGUI(moverParams.currentPalette);
  
  dirs  = [
    createVector(-1,0), // left
    createVector(1, 0), // right;
    createVector(0,-1), // up
    createVector(0,1) // down
  ]
  
  movers = [...generateMovers(moverParams.moverCount)];
  
  background(0);
}

function generateMovers(n){
  let movers = []
  for(let i = 0; i < n; i++){
    let mover = new Mover(
      random(width), 
      random(height), 
      random(currentPalette)
    );
    movers.push(mover);
  }
  return movers;
}



function draw() {
  
  if(random() < moverParams.shuffleProbability){
    movers = shuffle(movers) // changes the stroke order so they can look like they're wrapping around each other
  }

  for(let i = 0; i < generalParams.updatesPerFrame; i++){
    for(let mover of movers){
      mover.update();
      mover.show();
    } 
  }
 
}

function wipeScreen(){
  background(0)
}


class Mover{
  constructor(x,y, colour){
    this.p = createVector(x,y);
    this.v = random(dirs);
    this.targetV = this.v.copy();
    this.colour = colour;
    this.progress = 0;
    this.isTurning = false;
    this.lerpFrames = defaultLerpFrames;
  }
  
  wrap(){
    if(this.p.y > height) this.p.y = 0;
    if(this.p.y < 0) this.p.y = height;
    if(this.p.x > width) this.p.x = 0;
    if(this.p.x < 0) this.p.x = width;
  }
  
  update(){
    // look at vector space
    if(this.isTurning){
      this.progress += 1/this.lerpFrames;
      let tempV = p5.Vector.lerp(this.v, this.targetV, easeInOutBack(this.progress));
      this.p.add(tempV);
      
      if(this.progress > 1){
        this.progress = 0;
        this.isTurning = false;
        this.v = this.targetV.copy();
        this.lerpFrames = max(defaultLerpFrames + randomGaussian()*90, 30); // don't let it drop below zero 
      }
    } else {
      if (random() < moverParams.turnProbability){
      // Filter out current direction AND its opposite i.e. don't double-back
      let validDirs = dirs.filter(d => {
        return !d.equals(this.v) && !d.equals(p5.Vector.mult(this.v, -1));
      });

      let targetV = random(validDirs).copy();
      this.targetV = targetV.copy();
      this.isTurning = true;
    }
      
      this.p.add(this.v);
 
    }
    
    
    
    
    
    this.wrap();
  }
  
  show(){
    noStroke();
    fill(this.colour);
    let thicc = noise(this.p.x/noiseParams.noiseZoom, this.p.y/noiseParams.noiseZoom, frameCount*noiseParams.noiseProgRate) * moverParams.maxStrokeThickness;
    circle(this.p.x, this.p.y, thicc);
  }
}

function easeInOutBack(x){
const c1 = 1.70158;
const c2 = c1 * 1.525;

return x < 0.5
  ? (Math.pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
  : (Math.pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
}

function setPaletteFromGUI(paletteName, movers){
  let palette =  [...palettes[paletteName]];
  console.log(palette);
  if(movers && movers.length > 0){
    for(let mover of movers){
      mover.colour = random(palette);
    }
  }
  
  return palette;
}

function windowResized() {  
  resizeCanvas(windowWidth, windowHeight);
}
/*
| Author          | Project Somedays                      
| Title           | WCCChallenge 2026 Week 13 - "Cube"
| 📅 Started      | 2025-03-29   
| 📅 Completed    | 2025-03-29       
| 🕒 Taken        | ~2.5hrs                     
| 🤯 Concept      | Cube of cubes
| 🔎 Focus        | Transformations
| 🤖 AI-use       | Bug-fixes and stepping in when I got confused RE Transformations

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/S8c7qcjw2b

📃The Algorithm📃
Set up rolling cubes on just the top surface, left to right
To get the other sides, replicate with a global rotation. Or scaling!

👉INTERACTION👈
Play with the controls

📦RESOURCES📦
- Easings.net
- Coolors.co for the palettes

🤔TO IMPROVE🤔
- Fill in the holes... I'm sure they're there because of some offset, but it looks neat enough as it is
- Make the cubes traverse all sides

*/

let boxes = [];
let n = 15;
let c;
let g;
let w;
let colA = '#0000ff';
let colB = '#ff0000';
let start;
let progress;
let startDelay = 60;
let currentFrame = 0;
let gui, params;
let currentPalette;

let palettes = {
  "funky fusion": "#ff0f7b, #f89b29",
  "ocean breeze": "#0061ff, #60efff",
  "twilight firecracker": "#08415c, #cc2936",
  "mystic aqua": "#264653, #2a9d8f",
  "tropical sunset": "#ffba49, #20a39e"
}

function setup() {
  createCanvas(min(windowWidth, windowHeight), min(windowWidth, windowHeight), WEBGL);
  pixelDensity(1);
  c = createVector(0,0,0); // centre
  g = createVector(0,0.1,0); // gravity
  w =  min(width, height)*0.75;
  start = createVector(0,-w*1.25, 0);
  initBiz();


  // gui
  gui = new lil.GUI();
  // params
  params = {
    palette: "funky fusion",
    rotateMode: true,
    gravStrength: 0.1,
    res : 15
  }

  gui.add(params, 'palette', Object.keys(palettes)).onChange((val) => setPalette(val));
  gui.add(params, 'rotateMode');
  gui.add(params, 'gravStrength', 0, 1, 0.01).onChange(val => g.setMag(val));
  gui.add(params, 'res', 3, 31, 1).onChange(val => n = val); //set for next round
  setPalette(params.palette);
}

function setPalette(palette){
  currentPalette = palettes[palette].split(", ");
  colA = currentPalette[0];
  colB = currentPalette[1];
}

function draw() {
  background(0);
  currentFrame ++;
  if(currentFrame <= startDelay) progress += 1 / startDelay; 
  
  let tempP = p5.Vector.lerp(start, c, easeOutElastic(progress));
  
  push();
  translate(tempP.x, tempP.y, tempP.z);
  rotateY(frameCount * 0.01);
  
  for(let b of boxes){
    b.update();
    b.show();
  }
  
  pop();
  orbitControl();
  
  if(boxes.length === boxes.filter(e => !e.isAlive).length) initBiz(); // reset
  
}

class FallingBox{
  constructor(x,y,z, delayFrames, col){
    this.p = createVector(x,y,z);
    this.delayFrames = delayFrames;
    this.v = createVector(0, 0, 0);
    this.col = col;
    this.isAlive = true;
  }
  
  update(){
    if(currentFrame <= this.delayFrames) return;
    this.v.add(g);
    this.p.add(this.v);
    if(this.p.y > height/2) this.isAlive = false;
  }
  
  show(){
    push();
    translate(this.p.x, this.p.y, this.p.z);
    fill(this.col);
    box(w/n);
    pop();
  }
}

function easeOutElastic(x) {
const c4 = (2 * Math.PI) / 3;

return x === 0
  ? 0
  : x === 1
  ? 1
  : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
}

function initBiz(){
  progress = 0;
  currentFrame = 0;
  boxes = [];
  for(let i = 0; i < n; i++){
    for(let j = 0; j < n; j++){
      for(let k = 0; k < n; k++){
        let p = createVector(
          -w/2 + i*w/n, // x
          w/2 - j*w/n, // y
          -w/2 + k*w/n // z
        );
        if(p5.Vector.dist(p, c) <= w/2) boxes.push(new FallingBox(
          p.x, 
          p.y, 
          p.z,
          startDelay + j * startDelay + random(startDelay), // delay
          lerpColor(color(colA), color(colB), map(p.y, w/2, -w/2, 0, 1)) // colour gradient
        )
       );
      }
    }
  }
  
}


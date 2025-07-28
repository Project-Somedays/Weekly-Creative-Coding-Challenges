/*
| Author          | Project Somedays                      
| Title           | WCCChallenge 2025 Week 26 - March 
| 📅 Started      | 2025-06-29       
| 📅 Completed    | 2025-06-29        
| 🕒 Taken        | ~1hrs                                  
| 🤯 Concept      | "Marching Cubes"        
| 🔎 Focus        | Rotating in 3D space around different pivot points

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/g5J6Ajx9Am

Building off my Genuary 2025 Day 14: Pure Black and White. No Grey. submission: https://openprocessing.org/sketch/2509075

## 🎓Lessons Learned🎓
- To change the pivot point, you first translate to the desired offset, rotate, then translate back
- I should definitely comment my code better - took me WAY too long to remember how this worked

## 📦Resources📦:
- https://pixabay.com/no/music/musikkorps-marching-band-sound-marching-together-20-222551/

Fuller write-up here: https://project-somedays.github.io/coding/WCCChallenge2025Week18-Earth/
*/

const palette= "#d9ed92, #b5e48c, #99d98c, #76c893, #52b69a, #34a0a4, #168aad, #1a759f, #1e6091, #184e77".split(", ");

let side, edgeOffset;
let a;
let animating = false;
let startFrame = 0;
let animationFrames = 7;
let test;
let directions;
let rows = 31;
let cols = 31;
let boxes = [];
let cam;
let gui, params;


let music;

function preload(){
  music = loadSound("marching-band-sound-marching-together-20-222551.mp3", 
    () => {
    console.log("Music loaded!");
  }, 
  () => console.log("Error loading music 😔")
);
  music.loop();
}

function setup() {
  createCanvas(min(windowWidth, windowHeight), min(windowWidth, windowHeight), WEBGL);
  pixelDensity(1);

  gui = new lil.GUI();
  params = {
    lightsOn: false,
    rotateMode : true,
    globalRotationFrames: 1200,
    lightRotationFrames: 1200,
    musicOn : true,
    sandboxMode: false
  }
  gui.add(params, 'lightsOn');
  gui.add(params, 'rotateMode');
  gui.add(params,'globalRotationFrames', 30, 2400, 30);
  gui.add(params,'lightRotationFrames', 30, 2400, 30);
  gui.add(params, 'musicOn').onChange( () => {
    if(music.isPlaying()){
      music.stop();
  } else {
    music.loop();
  }});
  gui.add(params, 'sandboxMode');


  // createCanvas(1080, 1080, WEBGL);
  side = width/cols;
  // ortho();

  cam = createCamera();
  cam.setPosition(width, -width, width);
  cam.lookAt(0,0,0);
  
  frameRate(30);
  directions = [
    {desc: "LEFT", dir: createVector(-1,0,0), pivotPt: createVector(-1, 1, 0)},
    {desc: "RIGHT", dir: createVector(1,0,0), pivotPt: createVector(1,1,0)},
    {desc: "BACKWARD", dir: createVector(0,0,-1), pivotPt: createVector(0,1,-1)},   
    {desc: "FORWARD", dir: createVector(0,0,1), pivotPt: createVector(0,1,1)},
    {desc: "UP", dir: createVector(0,-1,0), pivotPt: createVector(-1,-1,0)}, 
    {desc: "DOWN", dir: createVector(0,1,0), pivotPt: createVector(-1,1,0)} 
];
    

  for(let i = 0; i < cols; i++){
    for(let j = 0; j < rows; j++){
      let x = -width/2 + i*width/cols;
      let z = -height/2 + j * height/rows;
      boxes.push(
      new RollBox(x, 0, z)
      )
    }
  }
  test = new RollBox(0, 0, 0, width/4)
  music.loop();
  describe("Cubes march in all 3 dimensions in time with the music");
}

function draw() {
  background(0);
  
  if(params.rotateMode){
    let rot = frameCount*TWO_PI/params.globalRotationFrames;
    rotateY(rot);
  }


  if(params.lightsOn){
    let a = (1/params.lightRotationFrames)*frameCount*TWO_PI;
    pointLight(255, 255, 255, 0, 0.5*height*cos(a), 0); // moving up and down y axis
    directionalLight(255, 255, 255, 0, cos(a), sin(a));
    directionalLight(255, 255, 255, cos(a + TWO_PI/3), sin(a + TWO_PI/3), 0);
    directionalLight(255, 255, 255, cos(a + 2*TWO_PI/3), 0, sin(a + 2*TWO_PI/3));
  }
  


a = frameCount % animationFrames;
if(a === 0) triggerAllBoxes(null);
  
if(params.sandboxMode){
  test.update();
  test.show();
} else{
  for(let rollbox of boxes){
    rollbox.update();
    rollbox.show();
  }
}

  
  orbitControl();
}

class RollBox{
  constructor(x,y,z, sideLength = side){
    this.p = createVector(x,y,z);
    this.isAnimating = false;
    this.startFrame = false;
    this.a = 0;
    this.dir = random(directions);
    this.col = random(palette);
    this.sideLength = sideLength;
    this.edgeOffset = sqrt(2) * this.sideLength * 0.5; // corner to corner distance
  }
  
  startAnimation(customDir = null){
    
    if(!this.animating) {
      let dir = !customDir ? random(directions) : customDir;
      this.dir = {desc: dir.desc, dir: dir.dir.copy(), pivotPt: dir.pivotPt.copy()}
      // console.log(`Moving ${this.dir.dir.x}, ${this.dir.dir.y}, ${this.dir.dir.z} `);
      this.animating = true;
      this.startFrame = frameCount;
    }
  }
  
  update() {
  if (this.animating) {
    this.a = HALF_PI * (frameCount - this.startFrame) / animationFrames;
    // this.a = HALF_PI * a/animationFrames;
    
    if (this.a > HALF_PI) {
      this.a = 0;  // Reset rotation immediately
      this.p.add(this.dir.dir.mult(this.edgeOffset * 2));  // Update position
      this.animating = false;
    }
  }
}
  
  show() {
    push();
    translate(this.p.x, this.p.y, this.p.z);
    
    // Adjust translation based on direction
    translate(
        this.dir.pivotPt.x * this.edgeOffset,
        this.dir.pivotPt.y * this.edgeOffset,
        this.dir.pivotPt.z * this.edgeOffset
    );
    
    // do the rotation
    switch(this.dir.desc) {
        case "FORWARD":
            rotateX(-this.a);
            break;
        case "BACKWARD":
            rotateX(this.a);
            break;
        case "RIGHT":
            rotateZ(this.a);
            break;
        case "LEFT":
            rotateZ(-this.a);
            break;
        case "UP":
            rotateZ(-this.a);
            break;
        case "DOWN":
            rotateZ(this.a);
            break;
    }
    
    translate(
        -this.dir.pivotPt.x * this.edgeOffset,
        -this.dir.pivotPt.y * this.edgeOffset,
        -this.dir.pivotPt.z * this.edgeOffset
    );
    
    fill(this.col);
    stroke(color(0));
    box(this.sideLength);
    pop();
}
}


// for sandbox mode. Note: should refactor to use the definition of each from the top of the code but meh 🤷
function keyPressed(){
  let dir = null;
  switch(keyCode){
    case UP_ARROW:
      dir = {desc: "BACKWARD", dir: createVector(0,0,-1), pivotPt: createVector(0,1,-1)}
      break;
    case DOWN_ARROW:
      dir = {desc: "FORWARD", dir: createVector(0,0,1), pivotPt: createVector(0,1,1)};
      break;
    case LEFT_ARROW:
      dir = {desc: "LEFT", dir: createVector(-1,0,0), pivotPt: createVector(-1, 1, 0)};
      break;
    case RIGHT_ARROW:
      dir = {desc: "RIGHT", dir: createVector(1,0,0), pivotPt: createVector(1,1,0)};
      break;
    case 87:
      dir = {desc: "UP", dir: createVector(0,-1,0), pivotPt : createVector(-1, -1, 0)};
      break;
    case 83:
      dir = {desc: "DOWN", dir: createVector(0,1,0), pivotPt : createVector(-1, 1, 0)};
      break;
    case ENTER:
      dir = null;
      break;
    default: 
      break;
  }
 
  
  // triggerAllBoxes(dir);
  test.startAnimation(dir);
  
  
}

function triggerAllBoxes(dir){
  for(let rollbox of boxes){
    rollbox.startAnimation(dir);
  }
}
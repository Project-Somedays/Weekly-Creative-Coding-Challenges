/*
Author: Project Somedays
Date: 2024-06-17
Title: Experiments - Lissajous




RESOURCES
 - Altars: https://www.printables.com/model/12074-altar-for-gloomhaven
 - Music: Ethereal Realities, AberrantRealities from Pixabay: https://pixabay.com/music/ambient-ethereal-realities-ambience-212806/
 - Knots: 
    https://en.wikipedia.org/wiki/Lissajous_knot

TODOs and OPPORTUNITIES
  - DONE: sort out manual mode
  - DONE: music
  - TODO: home view
  - TODO: loading screen
  - TODO: ease in out speed ramping
  - TODO: cool transition
  - TODO: move the lights around a bit so it gives the illusion that the knots are interactively casting shadows
  - TODO: sandbox mode where you can play with ALL the variables
*/

let hands;
let music;

// timing
const pqcycleRate = 300000;
const rotCycleRate = 300;
const pulseRate = 600;
const n = 500;
const sphereSize = 0.1;
let r;

// modes
let knotMethods = [];
let knotMethodIx = 0;
let autoOrbitMode = true;
let lazySusanAngle = 0;
let baseLazySusanRate = 150;
let hasChanged = false;
let autoCycleKnotMode = true;

let spacing;

// (abandoned for now) Loading stuff
let textures = [];
let loadingCubeSize;
let currentLoadingIx = 0;

const rows = 4;
const cols = 4;


// function preload(){
//   hands = loadModel("cuppedhands.obj",true, () => {console.log("loaded!")}, (err) => {console.log(err)});
//   music = loadSound("ethereal-realities-ambience-212806.mp3"); 
// }


function setup() {
  // createCanvas(min(windowWidth, windowHeight), min(windowWidth, windowHeight), WEBGL);
  createCanvas(windowWidth, windowHeight, WEBGL);
  
  // frameRate(30);
  loadingCubeSize = width/3;

  r = 0.4*height;

  knotMethods = shuffleArray([
    trefoil,
    twothreetorusknot,
    eightknot,
    cinquefoilknotk2,
    cinquefoilknotk3,
    cinquefoilknotk4,
    grannyKnot,
    fourThreeTorusKnot,
    fiveTwoTorusKnot,
    threeTwistKnot,
    stevedoreknot,
    squareKnot,
    eightTWoOneKnot,
    pqtorusknot_2_3,
    pqtorusknot_3_4,
    pqtorusknot_2_5
  ]);
  describe('Holding the precious knot');

  // textures = makeLoadingTextures();
  // music.loop();
  
}

function draw() {
  background(10);
  // console.log(frameRate())
  pointLight(0,0,0);
  
  // handle rotation and knot cycling
  for(let x = 0; x < cols; x++){
    for(let y = 0; y < rows; y++){
      let ix = x + y*cols;
      push();
      translate(-width/2 + (x+0.5)*width/cols, -height/2 + (y+0.5)*height/rows, 0);
      scale(0.4, 0.4, 0.4);
      showKnotByFunction(knotMethods[ix]);
      pop();
    }
  }

  orbitControl();

}

function showLissajous(nx, ny, nz, offx, offy, offz){
  normalMaterial();
  push();
  scale(50, 50, 50);
  rotateInterestingly();
  showSingleParameterKnot(lissajousKnot(nx, ny,nz,offx, offy,offz));
  pop();
}

function showKnotByFunction(knotFunction){
  normalMaterial();
  push();
  // translate(0,-0.1*height,0);
  scale(50, 50, 50);
  rotateInterestingly();
  showSingleParameterKnot(knotFunction);
  pop();
}

function showKnot(){
  normalMaterial();
  push();
  // translate(0,-0.1*height,0);
  scale(50, 50, 50);
  rotateInterestingly();
  showSingleParameterKnot(knotMethods[knotMethodIx]);
  pop();
}

function showHands(){
  // draw hands
   push();
   translate(0,height*0.1,-height*0.1);
   rotateZ(PI);
   rotateX(PI/24);
   scale(4);
   ambientMaterial(255, 255, 255);
   model(hands);
   pop();
 }


function makeLoadingTextures(){
  let textures = [];
  let loadingTexts = ["Loading", "Loading.", "Loading..", "Loading..."];
  for(let i = 0; i < 4; i++){
    let graphic = createGraphics(loadingCubeSize);
    graphic.textAlign(LEFT, CENTER);
    graphic.textSize(loadingCubeSize/2);
    graphic.background(0);
    graphic.fill(255);
    graphic.text(loadingTexts[0], graphic.width/4, graphic.height/2);
    textures.push(graphic);
  }
  return textures;
}


function rotateInterestingly(){
  rotateX(frameCount*TWO_PI/rotCycleRate);
  rotateY(-frameCount*TWO_PI/rotCycleRate);
  rotateZ(frameCount*TWO_PI/rotCycleRate);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(10);
}


// ############ Knot cycling ################ // 

function nextKnot(){
  knotMethodIx = (knotMethodIx + 1)%knotMethods.length;
  console.log(knotMethods[knotMethodIx])
}

function previousKnot(){
  if(knotMethodIx === 0){
    knotMethodIx = knotMethods.length - 1;
  } else{
    knotMethodIx --;
  }
  console.log(knotMethods[knotMethodIx])
}

// ############# INTERACTION ################ //
function keyPressed(){
  switch(keyCode){
    case LEFT_ARROW:
      previousKnot();
      console.log(knotMethods[knotMethodIx])
      break;
    case RIGHT_ARROW:
      nextKnot();
      console.log(knotMethods[knotMethodIx])
      break;
    case ENTER:
      autoOrbitMode = !autoOrbitMode;
      break;
    case BACKSPACE:
      autoCycleKnotMode = !autoCycleKnotMode;
      break;
    default:
      return;
  }
}


function showpqTorusknot(){
  // let thisSphereSize = sphereSize;
  // let p = 2*cycleVariable(2,1, pqcycleRate);
  // let q = 3*cycleVariable(1,2, pqcycleRate);
  let p = 2;
  let q = 3;
  for(let t = 0; t < n; t += TWO_PI/n){
    let pt = pqtorusknot(p, q, t);
    push();
    translate(pt.x, pt.y, pt.z);
    let thisSphereSize = cycleVariable(0.05, 0.25, 500, t*TWO_PI/n);
    // let thisSphereSize = map(t,0,n,0.05,0.5);
    sphere(thisSphereSize);
    pop();
  }
}

function showSingleParameterKnot(fn){
  for(let t = 0; t < TWO_PI; t+= TWO_PI/n){
    let pt = fn(t);
    push();
    translate(pt.x, pt.y, pt.z);
    // let scl = map(t/TWO_PI,0,1,0.05,0.5);
    let scl = cycleFrames(t, 1, 5);
    // sphere(sphereSize*scl, 24, 12);
    sphere(sphereSize*scl, 12,6);
    pop();
  }
}


function cycleFrames(t, minVal, maxVal){
  return map(0.5*(-cos(t + millis()/pulseRate)+1),0,1,minVal,maxVal);
}

function cycleVariable(minMult, maxMult, cycleFrames){
  return map(0.5*(-cos(millis()/cycleFrames)+ 1),0,1,minMult,maxMult);
}

function shuffleArray(array) {
  let shuffledArray = array.slice(); // Create a copy of the original array
  
  // Fisher-Yates shuffle algorithm
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  
  return shuffledArray; // Return the shuffled array
}



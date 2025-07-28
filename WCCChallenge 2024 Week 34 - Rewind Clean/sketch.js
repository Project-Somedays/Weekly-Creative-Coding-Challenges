/*
Author: Project Somedays
Date: 2024-08-24
Title: WCCChallenge 2024 Week 34 - Rewind

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/g5J6Ajx9Am

Love me some wanton pixel destruction 💣💥🤯
Sampling from the image to make Matter.js boxes
Recording Mode: Saving the canvas to frames array OR record all the positions and rotations in a big lookup array
Playback Mode: Play forward and then in reverse OR loop through the current frame in the lookup array and draw everything 📼

INSTRUCTIONS
- Start the recording. Stop early or let it play through the captureLength frames.
- Left Click: Set off an explosion
- Hit "release" hold to let the slumpage begin (the sim is always running, they're just reset to their initial positions when hold is on)
- Reset to start again
- Check out the different image options

UPDATES:
- Added in a mode to record the positions and 
- Verdict: playback is smoother for canvas mode but overall better performance ESPECIALLY with higher sample rate with positions/rotations array

PERFORMANCE ISSUES?
- Increase box size = radically reduce sampling size for a BIG performance boost

RESOURCES:
- Matter.js: https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.20.0/matter.min.js
- lil-gui: https://cdn.jsdelivr.net/npm/lil-gui@0.19.2/dist/lil-gui.umd.min.js
- fxHash Sableraph image: https://gateway.fxhash.xyz/ipfs/Qmai8R24bQjCrdRwsM5dgWjk6Q73gNPHTWm4cgQ8G2WFZn
- birb: https://i.kym-cdn.com/entries/icons/facebook/000/019/189/birb.jpg
- GorillaSun (used with permission! Much thanks!)  https://pbs.twimg.com/profile_images/1516050989241057281/05gwFNl3_400x400.jpg
- Overly Attached GF: https://helios-i.mashable.com/imagery/articles/06NwyMPotETRux7TrR6H74Q/hero-image.fill.size_1200x1200.v1614270598.jpg
- Wonka Meme: https://helios-i.mashable.com/imagery/articles/00jdsdJ5TJ5j9pExdUWjQaC/hero-image.fill.size_1200x900.v1611611940.jpg
- The Coding Train's excellent tutorials on Matter.js: https://www.youtube.com/playlist?list=PLRqwX-V7Uu6bLh3T_4wtrmVHOrOEM1ig_


TASK LIST
TODO: Fix bug where hitting startstopRecord too fast crashes everything
TODO: Tidy up logic --> currently hidden in too many places for my liking
TODO: Fix issue where interacting with the lil-gui window still triggers explosions

DONE: Indicate how long until the buffer is full
KINDA DONE: Fix weird glitches the where things escape - make walls MUCH fatter
DONE: Add a distance effect from the explosion
DONE: Move controls to right click for explosions
DONE: Add adjustment for capture duration
DONE: Make fall and record on load
DONE: Add bg colour adjustment
*/


// gui biz
let params, gui;
let samplingBiz;
let interactionBiz;
let captureBiz;
let guiRect;

// images
let sableraphImg;
let birb;
let derp;
let projectsomedays;
let gorillasun;
let gfmeme;
let wonkameme;
let dave;

// graphics
let canvas;
let srcImgLayer;

// matter.js
let boxes = [];
let Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Constraint = Matter.Constraint;
let engine, world;

// environment
let wallThick;

// control
let playbackMode = false;
let rewind = false;
let frames = [];
let posArray = [];
let holdInPlace = false;
let startPlaybackFrame = 0;
let recordingMode = false;

let mechanisms; 

function preload(){
  sableraphImg = loadImage("sableraph.png");
  birb = loadImage("birb.png");
  derp = loadImage("derpyhorse.png");
  projectsomedays = loadImage("Me.png");
  gorillasun = loadImage("gorillasun.png");
  gfmeme = loadImage("gf.png");
  wonkameme = loadImage("wonka.png");
  dave = loadImage("Dave.png");
}

function setup() {
  canvas = createCanvas(min(windowWidth, windowHeight),min(windowWidth, windowHeight));
  pixelDensity(1);
  noStroke();
  imageMode(CENTER);

  wallThick = width/4;
  
  // Matter.js world biz
  engine = Engine.create();
  world = engine.world;
  
  gui = new lil.GUI();

  mechanisms = {
    captureFrameMode : {'captureMethod': captureWholeCanvas, 'playbackMethod': playbackWholeCanvasFrames},
    capturePositionMode: {'captureMethod': capturePositionsandRotations, 'playbackMethod': playbackPositionsAndRotations}
   }
  

  // declaring variables for adjustment and their default values
  params = {
    img: sableraphImg,
    boxSize: 10,
    captureFrameLimit: 120,
    explosionStrength: 10,
    explosionRadius: width/3,
    gravityStrength: 5.0,
    transparencyThreshold: 5,
    imgScale: 0.66,
    'startStopRecording': startStopRecording,
    reset: resetWorld,
    releaseHold: releaseHold,
		bgColour: "#000000",
    recordPlaybackMethod: mechanisms.capturePositionMode
  }
	
	gui.addColor(params, 'bgColour');
  samplingBiz = gui.addFolder("Sampling Biz");
  samplingBiz.add(params, 'img', {
    'Sableraph' : sableraphImg,
    'Birb' : birb,
    'Derpy Horse': derp,
    'me':projectsomedays,
    'gorillasun':gorillasun,
    'gfmeme' : gfmeme,
    'wonkameme': wonkameme,
    'Dave': dave 
  }).onChange(() => resetWorld());
  samplingBiz.add(params, 'boxSize', 5, 100, 1).onChange(() => {resetWorld()});
  samplingBiz.add(params, 'imgScale', 0, 1).onChange(() => {resetWorld()});
  samplingBiz.add(params, 'transparencyThreshold', 0, 50, 1).onChange(() => resetWorld());

  interactionBiz = gui.addFolder("Interaction/Sim Biz");
  interactionBiz.add(params, 'explosionStrength', 1, 25, 1);
  interactionBiz.add(params, 'explosionRadius', width/8, sqrt(2)*width);
  interactionBiz.add(params, 'gravityStrength', 1.0, 10.0, 0.1).onChange(value => engine.gravity.y = value);
  interactionBiz.add(params, 'releaseHold');
  
  captureBiz = gui.addFolder("Capture Biz");
  captureBiz.add(params, 'recordPlaybackMethod', {
    "captureEntireFrames": mechanisms.captureFrameMode,
    "capturePositionsAndRotations": mechanisms.capturePositionMode
  }).onChange( () => resetWorld())
  captureBiz.add(params, 'captureFrameLimit', 30, 300, 5);
  captureBiz.add(params, 'startStopRecording');

  gui.add(params, 'reset');

  srcImgLayer = createGraphics(width, height);
  srcImgLayer.imageMode(CENTER);
  
  resetWorld();
	holdInPlace = true;
	recordingMode = true;
}

function draw() {
  background(params.bgColour);
	
	if(frameCount === 15) holdInPlace = false;
 
  if(!playbackMode){
		// update Matter.js engine
    Engine.update(engine);
		
		// reset positions of all the boxes if in hold
    if(holdInPlace){
      for(let box of boxes){
        box.reset();
      }
    }
		
		// draw the boxes
    for(let box of boxes){
      box.show();
    }

		// capture
    if(recordingMode && frames.length < params.captureFrameLimit){
      // captureFrame();
      frames.push(params.recordPlaybackMethod.captureMethod());
      showProgressBar();
    }

		// stop capturing once the buffer is full
    if(frames.length === params.captureFrameLimit){
      recordingMode = false;
      playbackMode = true;
      startPlaybackFrame = frameCount;
    }
    
    return;
  } 
  
  if(playbackMode){
    let currentFrame = (frameCount - startPlaybackFrame) % frames.length;
    if(currentFrame === 0) rewind = !rewind;
    let frameIndex = rewind ? frames.length - 1 - currentFrame : currentFrame; 
  
    params.recordPlaybackMethod.playbackMethod(frameIndex);
  }
  
}

const playbackWholeCanvasFrames = (frameIndex) => {image(frames[frameIndex], width/2, height/2)};

// use some closures here - these other functions aren't used anywhere else
function resetWorld(){
  World.clear(world);

  function generateWalls(){
    const makeWall = (x,y,w,h) => {
      return Bodies.rectangle(x, y, w, h, {isStatic: true});
    }
  
    World.add(world, makeWall(0, height/2, wallThick, height));
    World.add(world, makeWall(width, height/2, wallThick, height));
    World.add(world, makeWall(width/2, 0, width, wallThick));
    World.add(world, makeWall(width/2, height, width, wallThick));
  }

  function drawImageToCanvas(img){
    srcImgLayer.clear();
    srcImgLayer.image(img, width/2,width/2,img.width * (height/img.height)*params.imgScale, height*params.imgScale);
  }
  
  function generateBoxesFromImg(){
    boxes = [];
    for(let i = params.boxSize/2; i < height; i += params.boxSize/2){
      for(let j = params.boxSize/2; j < width; j += params.boxSize/2){
        let c = srcImgLayer.get(i,j);
        if(alpha(c) > params.transparencyThreshold){
          let box = new Box(i,j,c, params.boxSize);
          boxes.push(box);
          World.add(world, box.body);
        }
      }
    }
    return boxes;
  }

  generateWalls();

  drawImageToCanvas(params.img);
  generateBoxesFromImg(params.img)

  playbackMode = false;
  holdInPlace = true;
  frames = [];
}



function captureWholeCanvas(){
  let img = createGraphics(width, height);
  img.copy(canvas, 0, 0, width, height, 0, 0, width, height);
  return img;
  // console.log(`frames.length: ${frames.length}`);
}

function showProgressBar(){
  fill(0,255,0);
  noStroke();
  rectMode(CORNER);
  rect(0, height*0.95, width*frames.length/params.captureFrameLimit, height);
}


const isOnCanvas = () => {return mouseX < width && mouseX > 0 && mouseY < height && mouseY > 0};
// const isOnGuiWindow = () => {return mouseX >= guiRect.left && mouseX <= guiRect.right && mouseY >= guiRect.bottom && mouseY <= guiRect.top};

function mousePressed(){
  if(mouseButton === LEFT && isOnCanvas()){
    holdInPlace = false;
    applyExplosionToBoxes();
  }
}

function applyExplosionToBoxes(){
  let src = createVector(mouseX, mouseY);
  for(let box of boxes){
    let d = dist(box.body.position.x, box.body.position.y, src.x, src.y);
    if(d > params.explosionRadius) continue;
    let force = p5.Vector.sub(createVector(box.body.position.x, box.body.position.y), src)
    let forceMag = params.explosionStrength * (1 - params.explosionRadius/(sqrt(2)*width)); 
    force.setMag(forceMag);
    Body.setVelocity(box.body, {x: force.x, y: force.y});
  }
}

function releaseHold(){
  holdInPlace = !holdInPlace;
}

function startStopRecording(){
  if(recordingMode){
    playbackMode = true;
    startPlaybackFrame = frameCount;
  } else{
    playbackMode = true;
    frames = [];
    resetWorld();
  }
  recordingMode = !recordingMode;
}



function capturePositionsandRotations(){
  let freezeFrame = new Array(boxes.length);
  for(let i = 0; i < boxes.length; i++){
    freezeFrame[i] = {x: boxes[i].body.position.x, y: boxes[i].body.position.y, angle: boxes[i].body.angle, colour: boxes[i].colour};
  }
  return freezeFrame;
}

function playbackPositionsAndRotations(currentFrame){
  let freezeFrame = frames[currentFrame];
  for(let box of freezeFrame){
    push();
    translate(box.x, box.y);
    rotate(box.angle);
    fill(box.colour);
    rectMode(CENTER);
    square(0,0,params.boxSize);
    pop();
  }
}

function windowResized() {
  resizeCanvas(min(windowWidth, windowHeight), min(windowWidth, windowHeight));
}


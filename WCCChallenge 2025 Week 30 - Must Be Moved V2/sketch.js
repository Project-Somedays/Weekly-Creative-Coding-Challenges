/*
| Author          | Project Somedays                      
| Title           | WCCChallenge 2025 Week 30 - Must Be Moved 
| 📅 Started      | 2025-07-26        
| 📅 Completed    | 2025-07-27        
| 🕒 Taken        | More hours than I'm willing to admit 😅 Haven't had time to go full send for a while though 🥰
| 🤯 Concept      | Getting Matter.js to work properly felt like a Sisyphean task...     
| 🔎 Focus        | Matter.js        

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph](https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/g5J6Ajx9Am

## 🎓Lessons Learned🎓
- I need to learn more about Matter.js Bodies.fromVertices... lot of stuff about centroids and offsets that had me scratching my head a bit

## Resources:
- 🎵"The Satyrs Dance" by SamuelFJohanns: https://pixabay.com/music/modern-classical-thesatyrsdance-167125/
- 🔊 "Happy Message Ping" by Universfield: https://pixabay.com/sound-effects/happy-message-ping-351298/
- 🔊 "Timpani boing fail" by u_ss015dykrt: https://pixabay.com/sound-effects/timpani-boing-fail-146292/
- 🖼️ Creative Commons Art: https://commons.wikimedia.org/wiki/Category:Sisyphus_in_ancient_Greek_pottery#/media/File:Szisz%C3%BCphosz.png

## Stretch Goals/Extension Ideas
- [ ] IK Sispyhus pushing the boulder up the hill... then looking sad on failure

## TODO
- [ ] Get the boulder rolling more naturally

*/


let targetsColours = [];
let lastTarget = null;
let targetSize, targetWithMargin;
let currentSpeed;
let UIheight;
let targets = [];
let progress;
let energy = 100;
const energyDepletion = 100/1800;
const stepsToCompletion = 30;
let step;
let coordination = 10;
const coordinationPenalty = -2;
const coordinationBonus = 0.5;
const coordinationMax = 10;
const increaseSpeedEachFrames = 150;
const tileSpacing = 1.5
let states;
let currentState;
let isGameOver = false;


let inSightsCurrent = null;
let inSightsPrev = null;


let gui, params;


let isRolling = true;

const easingIncrement = (targetSize, speed) => {
  let distanceBetweenTargets = targetSize * tileSpacing;
  let framesUntilNextTarget = distanceBetweenTargets / speed;
  let incrementPerFrame = 1 / framesUntilNextTarget;
  
  // Ensure the animation takes between 0.5 and 3 seconds (15-90 frames at 30fps)
  let minIncrement = 1 / 90; // Max 3 seconds
  let maxIncrement = 1 / 5; // Min 0.5 seconds
  
  return constrain(incrementPerFrame, minIncrement, maxIncrement);
};

const getHillY = (x) => UIheight - 0.75*height*map(sin(map(x, 0, width, -HALF_PI, HALF_PI)), -1, 1, 0, 1);



// Matter.js aliases
let Engine = Matter.Engine;
let World = Matter.World;
let Body = Matter.Body;
let Bodies = Matter.Bodies;
let Runner = Matter.Runner;
let Composite = Matter.Composite;

let engine, world;

// stuff in the world
let hill;
const hillRes = 150;
let boulder;

let img;
let music;
let soundSuccess;
let soundFail;
let soundGameOver;


function preload(){
  img = loadImage("sisyphus_no_bg.png");
  music = loadSound("thesatyrsdance-167125.mp3", () => music.loop(), () => console.log("Can't load music!"));
  soundSuccess = loadSound("happy-message-ping-351298.mp3");
  soundFail = loadSound("timpani-boing-fail-146292.mp3");
}


function setup() {
  createCanvas(windowWidth, (9/16)*windowWidth); // ensure 16 by 9 ratio
  pixelDensity(1);
  frameRate(30);

  // Matter.js biz
  engine = Engine.create();
  world = engine.world;
  runner = Runner.create();
  engine.world.gravity.y = 2;  // Reduce gravity slightly
  engine.positionIterations = 10; // Increase collision accuracy
  engine.velocityIterations = 8;  // Increase velocity solving accuracy
  // Optional: reduce air resistance globally
  world.frictionAir = 0.01; 

  targetSize = width/20;
  targetWithMargin = targetSize * 1.25;
  UIheight = 0.9*height;
  currentSpeed = width/300;
  progress = targetSize;
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  step = 0.8 * width / stepsToCompletion
  easingFrames = targetSize*1.5 / currentSpeed;

  targetsColours = [
    {"key": "Q", "col" : color("#4285F4")},
    {"key": "W", "col" : color("#34A853")},
    {"key": "O", "col" : color("#FBBC05")},
    {"key": "P", "col" : color("#EA4335")}]

  states = {
  "NEUTRAL": color(255), 
  "ERROR": color(255, 0, 0), 
  "SUCCESS": color(0, 255, 0),
  "LIVE": color("#ADD8E6")
  }
  currentState = states.NEUTRAL;

  preloadTargets();

  gui = new lil.GUI();
  params = {
    showDebug: false,
    showBgImage: true,
    soundsOn: true
  }
  gui.add(params, 'showDebug');
  gui.add(params, 'showBgImage');
  gui.add(params, 'soundsOn');


  hill = new Hill(hillRes, world);
  boulder = new Boulder(50, height/7.5, world);

  if(params.showDebug) debugCollisionFilters();

 
  Runner.run(runner, engine);
  imageMode(CENTER);

}

function draw() {
  background("#ffc14d");

  if(params.showBgImage){
    push();
    let xOff = map(noise(frameCount * 0.005 + 1000), 0, 1, -width/8, width/8);
    let yOff = map(noise(frameCount * 0.005 + 2000), 0, 1, -height/8, height/8);
    let aOff = map(noise(frameCount * 0.005 + 3000), 0, 1, -PI/12, PI/12);
    translate(width/2 + xOff, height/2 + yOff);
    rotate(aOff);
    image(img, 0, 0);
    pop();
  }
  

  hill.show();
  
  if(!isGameOver) energy -= energyDepletion; // slowly deplete energy --> stretch: depending on slope that point?

  // when to add in new targets
  progress += currentSpeed;
  if(progress >= targetSize*1.5){
    targets.push(new Target(pickTarget(), width + targetSize/2));
    progress = 0; // reset
  }

  // when to increase speed
  if(frameCount % increaseSpeedEachFrames === 0) currentSpeed += 0.1; // increase speed every 10 seconds
  currentSpeed = constrain(currentSpeed, 0, 10); // max out at 5

  // detecting what's in the sights currently
  inSightsPrev = inSightsCurrent;
  inSightsCurrent = null;
  let minDistanceToCentre = Infinity;
  let closestTargetToCentre = null;
  for(let target of targets){
    target.update();
    let d2c = abs(width/2 - target.x);
    if(d2c < minDistanceToCentre){
      closestTargetToCentre = target; // find the closest target to the centre
      minDistanceToCentre = d2c; // find the closest target to the centre
    } 
    target.show();
  }

  // if it's close enough, then that target is in the sights
  if(abs(closestTargetToCentre.x - width/2) < targetSize*0.5){
    inSightsCurrent = closestTargetToCentre;
    currentState = states.LIVE;
  }

  // if it's still in the box
  if(inSightsCurrent && !inSightsCurrent.isCaught && inSightsCurrent.x <= width/2 - targetSize*0.25){
    coordination -= 2;
    inSightsCurrent.isCaught = true;
    currentState = states.ERROR;
    if(params.soundsOn && !isGameOver) soundFail.play();
  }

  showResources();

  // cleaning up targets off the screen
  cleanUpTargets();
  
  // if coordination drops to 0, or the user reaches the top, release the boulder!
if((coordination <= 0 || energy <= 0) && boulder.body.isStatic || boulder.body.position.x > width) {
  isGameOver = true;
  console.log("Releasing boulder to physics!");
   
  // Pop it up and Give it a small push down the hill
  
  let pushForce = 0.0005;
  // Enable physics
  Body.setStatic(boulder.body, false);
  Body.applyForce(boulder.body, boulder.body.position, {x: -pushForce, y: -pushForce/20}); 
  Body.setAngularVelocity(boulder.body, -0.2);
  
  
}

  boulder.update();
  boulder.show();
  showWindow();
  if(params.showDebug){
    showDebug();
    deepCollisionDebug();
  }
  // noLoop();
}

function cleanUpTargets(){
  for(let i = targets.length - 1; i >= 0; i--){
    if(targets[i].x < -targetSize/2) targets.splice(i, 1); // once off the screen, don't worry about keeping track
  }
}

function showResources(){
  textSize(height/20);
  textAlign(LEFT);
  fill(255);
  noStroke();
  text(`Energy: ${energy.toFixed(1)}`, 0.75*width, height*6/8);
  text(`Coordination: ${coordination.toFixed(1)}`, 0.75*width, height*6/8 + height/20);
}

function showWindow(){
  strokeWeight(1);
  noFill();
  switch(currentState){
    case states.NEUTRAL:
      stroke(states.NEUTRAL);
      break;
    case states.ERROR:
      stroke(states.ERROR);
      strokeWeight(5);
      break;
    case states.SUCCESS:
      stroke(states.SUCCESS);
      strokeWeight(5);
      break;
    case states.LIVE:
      stroke(states.LIVE);
      strokeWeight(5);
    default:
      break;
  }
  rect(width/2, UIheight, targetWithMargin, targetWithMargin);
}




function keyPressed(){
  let k = key.toUpperCase();
  isRolling = false;
  if(
    !["Q", "W", "O", "P"].includes(k) ||   // if user hits the wrong key, coordination penalty
    (inSightsCurrent && inSightsCurrent.txt !== k) ||    // if the user doesn't get the right target, coordination penalty
    !inSightsCurrent){   // if the user presses a button out of turn
    changeCoordination(coordinationPenalty);
    currentState = states.ERROR;
    if(params.soundsOn && !isGameOver) soundFail.play();
    return;
  } 
  
  // otherwise, mark it as caught
  inSightsCurrent.isCaught = true;
  inSightsCurrent.success = true;
  currentState = states.SUCCESS;
  if(params.soundsOn && !isGameOver) soundSuccess.play();

  if(boulder.body.isStatic) boulder.startRolling();

  changeCoordination(coordinationBonus);


}

function changeCoordination(amt){
  coordination = constrain(coordination + amt, 0, 10);
}




function showDebug(){
  textSize(15);
  textAlign(LEFT);
  fill(0);
  noStroke();
  let textBits = [
    `targets.length:\t\t ${targets.length}`,
    `energy:\t\t\t\t\t\t\t ${energy.toFixed(1)}`,
    `coordination:\t\t\t ${coordination}`,
    `inSightsCurrent: ${inSightsCurrent ? inSightsCurrent.txt : '-'}`,
    `inSightsPrev:\t\t ${inSightsPrev ? inSightsPrev.txt : '-'}`,
    `boulder.isRolling:\t ${boulder.isRolling}`,
    `boulder.easingProgress: ${boulder.easingProgress.toFixed(3)}`,
    `boulder.isStatic:\t ${boulder.body.isStatic}`,
    `step:\t\t\t\t\t\t\t\t ${step.toFixed(1)}`,
    `currentSpeed:\t\t\t ${currentSpeed.toFixed(2)}`,
    `easingIncrement:\t ${easingIncrement(targetSize, currentSpeed).toFixed(4)}`
  ]
  for(let i = 0; i < textBits.length; i++){
    text(textBits[i], 15, (i+1)*15);
  }
}


const easeInOutSine = (x) => -(cos(PI * x) - 1) / 2;

// Add this to your sketch.js to debug collision filters
function debugCollisionFilters() {
    console.log("=== COLLISION FILTER DEBUG ===");
    
    // Boulder collision info
    console.log("Boulder collision filter:");
    console.log("  category:", boulder.body.collisionFilter.category);
    console.log("  mask:", boulder.body.collisionFilter.mask);
    console.log("  group:", boulder.body.collisionFilter.group);
    
    // Hill collision info (check first segment)
    if (hill.bodies.length > 0) {
        console.log("Hill collision filter (first segment):");
        console.log("  category:", hill.bodies[0].collisionFilter.category);
        console.log("  mask:", hill.bodies[0].collisionFilter.mask);
        console.log("  group:", hill.bodies[0].collisionFilter.group);
    }
    
    // Check if they can collide
    let boulderFilter = boulder.body.collisionFilter;
    let hillFilter = hill.bodies[0].collisionFilter;
    
    let canCollide = (boulderFilter.group === hillFilter.group && boulderFilter.group !== 0) ||
                     (boulderFilter.group !== hillFilter.group && 
                      (boulderFilter.mask & hillFilter.category) !== 0 && 
                      (hillFilter.mask & boulderFilter.category) !== 0);
    
    console.log("Can boulder and hill collide?", canCollide);
    console.log("================================");
}

function deepCollisionDebug() {
    console.log("=== DEEP COLLISION DEBUG ===");
    
    // Check if bodies exist
    console.log("Boulder body exists:", !!boulder.body);
    console.log("Hill bodies exist:", hill.bodies.length > 0);
    
    if (!boulder.body || hill.bodies.length === 0) {
        console.log("ERROR: Bodies don't exist!");
        return;
    }
    
    // Boulder info
    let bFilter = boulder.body.collisionFilter;
    console.log("Boulder collision filter:");
    console.log("  category:", bFilter.category, "(binary:", bFilter.category.toString(2), ")");
    console.log("  mask:", bFilter.mask, "(binary:", bFilter.mask.toString(2), ")");
    console.log("  group:", bFilter.group);
    
    // Hill info (first segment)
    let hFilter = hill.bodies[0].collisionFilter;
    console.log("Hill collision filter (first segment):");
    console.log("  category:", hFilter.category, "(binary:", hFilter.category.toString(2), ")");
    console.log("  mask:", hFilter.mask, "(binary:", hFilter.mask.toString(2), ")");
    console.log("  group:", hFilter.group);
    
    // Manual collision check logic
    console.log("\nCollision Logic Check:");
    console.log("Boulder category & Hill mask:", (bFilter.category & hFilter.mask));
    console.log("Hill category & Boulder mask:", (hFilter.category & bFilter.mask));
    
    // Groups check
    if (bFilter.group !== 0 || hFilter.group !== 0) {
        console.log("Group collision check:");
        console.log("Same group?", bFilter.group === hFilter.group);
        console.log("Boulder group:", bFilter.group, "Hill group:", hFilter.group);
    }
    
    // Final collision determination
    let groupCollision = bFilter.group !== 0 && hFilter.group !== 0 && bFilter.group === hFilter.group;
    let categoryCollision = (bFilter.category & hFilter.mask) !== 0 && (hFilter.category & bFilter.mask) !== 0;
    
    console.log("Group collision enabled:", groupCollision);
    console.log("Category collision enabled:", categoryCollision);
    console.log("FINAL: Can collide?", groupCollision || categoryCollision);
    
    // Body properties that might affect collision
    console.log("\nBody Properties:");
    console.log("Boulder isSensor:", boulder.body.isSensor);
    console.log("Boulder isStatic:", boulder.body.isStatic);
    console.log("Hill isStatic:", hill.bodies[0].isStatic);
    console.log("Hill isSensor:", hill.bodies[0].isSensor);
    
    // Position check
    console.log("\nPosition Check:");
    console.log("Boulder position:", boulder.body.position.x.toFixed(1), boulder.body.position.y.toFixed(1));
    console.log("Boulder bounds:", {
        left: (boulder.body.position.x - boulder.r).toFixed(1),
        right: (boulder.body.position.x + boulder.r).toFixed(1),
        top: (boulder.body.position.y - boulder.r).toFixed(1),
        bottom: (boulder.body.position.y + boulder.r).toFixed(1)
    });
    
    // Check if boulder overlaps with any hill segments
    let overlapping = false;
    for (let i = 0; i < hill.bodies.length; i++) {
        let hillBody = hill.bodies[i];
        let bounds = hillBody.bounds;
        
        if (boulder.body.position.x + boulder.r > bounds.min.x && 
            boulder.body.position.x - boulder.r < bounds.max.x &&
            boulder.body.position.y + boulder.r > bounds.min.y && 
            boulder.body.position.y - boulder.r < bounds.max.y) {
            console.log(`Boulder overlaps with hill segment ${i}`);
            console.log("Hill segment bounds:", bounds);
            overlapping = true;
            break;
        }
    }
    
    if (!overlapping) {
        console.log("WARNING: Boulder doesn't overlap with any hill segments!");
    }
    
    console.log("===============================");
}

function startOverScreen(){

}

function restart(){
  energy = 100;
  coordination = 10;
  setup();
}

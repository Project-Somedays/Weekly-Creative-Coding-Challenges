/*
| Author          | Project Somedays                      
| Title           | WCCChallenge 2025 Week 52 - Factory
| 📅 Started      | 2025-12-28      
| 📅 Completed    | 2025-12-28        
| 🕒 Taken        | 2ish hrs of tweaking/adding possible adjustments                     
| 🤯 Concept      | When Corporate America got into the Snowman business
| 🔎 Focus        | A return to IK in 2D

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/S8c7qcjw2b



RESOURCES
- Claude: just used for the followEnd transformations


*/



const palette = "#f94144, #f3722c, #f8961e, #f9844a, #f9c74f, #90be6d, #43aa8b, #4d908e, #577590, #277da1".split(", ");
const halfCycleFrames = 210;

let maxLength;
const armSegments = 10;
let arms = [];
let snowman;
let carrot, hat01, hat02, hat03, scarf, button;
let isAssembling = true;


function preload(){
  carrot = loadImage("Carrot.png");
  hat01 = loadImage("Hat01.png");
  hat02 = loadImage("Hat02.png");
  hat03 = loadImage("Hat03.png");
  scarf = loadImage("Scarf.png");
  button = loadImage("Button.png");
}


function setup() {
  createCanvas(min(windowWidth, windowHeight), min(windowWidth, windowHeight));

  imageMode(CENTER);
	pixelDensity(1);

  maxLength = 0.5*width/armSegments;

  snowman = new SnowMan()

  // create arms in a cricle
  for(let i = 0; i < snowman.parts.length; i++){
    let a = i * TWO_PI/snowman.parts.length;
    arms.push(new Arm(width*0.5*cos(a)+width/2, width*0.5*sin(a) + height/2, createVector(width*cos(a) + width/2, width*sin(a) + height/2)));
  }

  // assign arms to snowman parts
  assignArmsToSnowmanParts();

	
}

function draw() {
  background(0);
  // let prog = map(sin(frameCount * TWO_PI/300), -1, 1, 0, 1);
  
  // toggle every 300 frames
  if(frameCount % halfCycleFrames === 0) isAssembling = !isAssembling;
  let t = isAssembling ? (frameCount % halfCycleFrames)/halfCycleFrames : 1 - (frameCount % halfCycleFrames)/halfCycleFrames; 
  let prog = easeInOutElastic(t)

  if(frameCount % halfCycleFrames === 0 && isAssembling){
    snowman = new SnowMan();
    assignArmsToSnowmanParts();
  }
  
  snowman.update(prog);
  snowman.show();

  for(let arm of arms){
    if(arm.assignedPart){
      arm.setTarget(arm.assignedPart.p);
    }
    arm.update();
    arm.show();
  }

  
 
}

  // ------------------- RETARGET ALL ARMS --------------------- //

  function trackArmsToPoints(targetArr){
    if(targetArr.length !== n) throw Error("Mismatched lengths of arm array and target array");
    for(let i = 0; i < n; i++){
      arms[i].setTarget(targetArr[i]);
      arms[i].update();
      arms[i].show();
    }
  }


// ----------- WHICH PHASE WE IN? --------------- //
function getCurrentPhase(currentFrame){
  // gets the smallest phase greater than currentFrame
  let cumulativeFrames = phaseOrder.map(e => e.cumulativeFrames);
  for(let i = 0; i < cumulativeFrames.length; i++){
    if(currentFrame < cumulativeFrames[i]) return phaseOrder[i];
  }
}

// ----------- GET CUMULATIVE FRAMES --------------- //
function calculateCumulativeFrames(phaseOrder){
  for(let i = 0; i < phaseOrder.length; i++){
    // console.log
    let frameArray = phaseOrder.map(e => e.frames).slice(0,i+1);
    let total = frameArray.length > 0 ? frameArray.reduce((a,b) => a + b) : phaseOrder[0].frames;
    
    phaseOrder[i]["cumulativeFrames"] = total;
    // console.log(`frameArray: ${frameArray}, total: ${total}`);
    // phaseOrder[i]["cumulativeFrames"] = phaseOrder.slice(0,i).reduce((accumulator, currentValue) => a + b.frames);
  }
  // console.log(phaseOrder);
}



function easeInOutSine(x) {
  return 0.5*(cos(PI*x) + 1);
  }

function keyPressed(){
  if(key === ' ') handMode = !handMode;
}

function makeFrame(){
	let frameCnv = createGraphics(width, width);
	
	
	frameCnv.strokeWeight(width/10);
	frameCnv.stroke(25);
	frameCnv.noFill();
	frameCnv.circle(width/2, height/2, width);
	frameCnv.stroke(50);
	frameCnv.strokeWeight(width/80);
	frameCnv.circle(width/2, height/2, width + width/10);
	frameCnv.circle(width/2, height/2, width - width/10);
	return frameCnv;
}

function mousePressed(){
  if(mouseButton === LEFT){
    console.log(`${round(mouseX/width, 3)}*width, ${round(mouseY/height, 3)}*height`);
  }
}

function easeInOutElastic(x) {
const c5 = (TWO_PI) / 4.5;

return x === 0
  ? 0
  : x === 1
  ? 1
  : x < 0.5
  ? -(pow(2, 20 * x - 10) * sin((20 * x - 11.125) * c5)) / 2
  : (pow(2, -20 * x + 10) * sin((20 * x - 11.125) * c5)) / 2 + 1;
}

// ------------------- ASSIGN ARMS TO NEAREST SNOWMAN PARTS --------------------- //
function assignArmsToSnowmanParts(){
  // Create a list of all possible arm-part pairs with their distances
  let pairs = [];
  
  for(let i = 0; i < arms.length; i++){
    for(let j = 0; j < snowman.parts.length; j++){
      let d = p5.Vector.dist(arms[i].base, snowman.parts[j].startP);
      pairs.push({
        armIndex: i,
        partIndex: j,
        distance: d,
        arm: arms[i],
        part: snowman.parts[j]
      });
    }
  }
  
  // Sort pairs by distance (closest first)
  pairs.sort((a, b) => a.distance - b.distance);
  
  // Keep track of which arms and parts have been assigned
  let assignedArms = new Set();
  let assignedParts = new Set();
  
  // Assign arms to parts, prioritizing closest pairs
  for(let pair of pairs){
    // If both arm and part are still unassigned, make the assignment
    if(!assignedArms.has(pair.armIndex) && !assignedParts.has(pair.partIndex)){
      pair.arm.assignedPart = pair.part;
      assignedArms.add(pair.armIndex);
      assignedParts.add(pair.partIndex);
    }
    
    // Stop when all parts are assigned (or all arms if there are more arms than parts)
    if(assignedParts.size === snowman.parts.length || assignedArms.size === arms.length){
      break;
    }
  }
  
  // If there are unassigned arms (more arms than parts), assign them to null
  for(let i = 0; i < arms.length; i++){
    if(!assignedArms.has(i)){
      arms[i].assignedPart = null;
    }
  }
}
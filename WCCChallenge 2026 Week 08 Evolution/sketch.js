/*
| Author          | Project Somedays                      
| Title           | WCCChallenge 2026 Week 08 - "Evoution"
| 📅 Started      | 2025-02-20    
| 📅 Completed    | 2025-02-21        
| 🕒 Taken        | ~4hrs                     
| 🤯 Concept      | Autonomous jetpackers explore a subterranean cave system but they are NOT smart about it. But neither do they need to be!
| 🔎 Focus        | Genetic Algorithms
| 🤖 AI-use       | Bug-hunting

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/S8c7qcjw2b

📃The Algorithm📃
Jetpackers are given a genetic sequence of bools (thrust or fall) and random vx
Every 40 pixels across, they switch to the next instruction.
No sensing.
Pure brute force.
That's evolution 💪

New generations follow the algorithm:
[1. Fitness]: Fitness is determined by depth into the cave before crashing squared
[2. Cross-Over]: Each new generation chooses 2 parents from this distribution and inherits the first half of the gen sequence of each parent
[3. Mutation]: 1% mutation rate

We show the distribution of distances over time to see how well our algorithm is performing. 

🎓Lessons Learned🎓


👉INTERACTION👈
- None

📦RESOURCES📦
- Claude for finding pesky bugs (I just feed it the code if I can't find it myself)
- Nightcafe and edited in photoshop https://creator.nightcafe.studio/creation/apOGM6rO1maF3cq4bRmZ
- The Coding Train's OG Genetic Algorithms Vid: https://www.youtube.com/watch?v=9zfeTw-uFCw&list=PLRqwX-V7Uu6bJM3VgzjNV5YxVxUwzALHV

🤔TO IMPROVE🤔
- More interesting background images


*/


const seed = 0;
const grav = 0.1;
const xSpeed = 2;
const thrustStrength = 0.2;
let jetpackers = [];
let deaths;
const population = 1000;
const genSequenceLength = 250;
const mutationRate = 0.01;
let cumulativeFitnessCalcs = [];
let generationStartFrame = 0;
let caveSystem;

let averageDistance = 0;

let poses_thrust = [];
let poses_fall = [];
let pose_dead_ceiling;
let pose_dead_floor;
let bg;
let rockTexture;

const ceilingPts = [];

function preload(){
  poses_thrust = [
    loadImage("pose1.png"),
    loadImage("pose2.png"),
    loadImage("pose3.png"),
    loadImage("pose2.png")
  ]
  poses_fall = [
    loadImage("fall1.png"),
    loadImage("fall2.png"),
    loadImage("fall3.png"),
    loadImage("fall4.png")
  ]
  pose_dead_ceiling = loadImage("dead_ceiling.png");
  pose_dead_floor = loadImage("dead_floor.png");
  rockTexture = loadImage("rockTexture.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(30);

  bg = generateStarField();
  // noiseSeed(seed);
  for(let i = 0; i < population; i++){
    jetpackers.push(new Jetpacker());
  }
  deaths = 0;

  caveSystem = new CaveSystem();

  fill(255, 100);
  imageMode(CENTER);

}

function draw() {
  background(0);
  image(bg, width/2, height/2);

  stroke(255);
  line(averageDistance, 0, averageDistance, height);

  caveSystem.show();

  for(let jetpacker of jetpackers){
    jetpacker.update();
    jetpacker.show();
  }

  fill(255);
  noStroke();
  text(`deaths: ${deaths}`, 10,10);
  
  // on the last death, we calculate the fitness of all the jetpackers

  if(deaths === population) resetBiz()
}

function resetBiz(){
  averageDistance = jetpackers.reduce((sum, j) => sum + j.x, 0) / jetpackers.length;
  cumulativeFitnessCalcs = evaluateFitness();
  breedNewGeneration();
  deaths = 0;
  generationStartFrame = frameCount;
}

function evaluateFitness(){
  let cumulativeFitness = 0;
  for(let i = 0; i < population; i++){
    cumulativeFitness += jetpackers[i].x**2; // increase cumulative fitness based on x distance
    cumulativeFitnessCalcs[i] = cumulativeFitness; // save the index against that cumulative fitness
  }

  return cumulativeFitnessCalcs;
}

function getParent(){
  let maxFitness = cumulativeFitnessCalcs[cumulativeFitnessCalcs.length - 1];
  let fitnessScore = random(maxFitness);
  for(let i = 0; i < population; i++){
    if(fitnessScore < cumulativeFitnessCalcs[i]) return jetpackers[i]; // return whole jetpacker
  }
}



// 
function geneticSequenceFromParents(parentAGenSeq, parentBGenSeq){
  let genSeq = random() < 0.5 
    ? parentAGenSeq.slice(0, genSequenceLength/2).concat(parentBGenSeq.slice(genSequenceLength/2))
    : parentBGenSeq.slice(0, genSequenceLength/2).concat(parentAGenSeq.slice(genSequenceLength/2));
    
  for(let i = 0; i < genSequenceLength; i++){
    if(random() < mutationRate) genSeq[i] = random() < 0.5;
  };
  return genSeq;
}

function breedNewGeneration(){
  let bufferPop = [...jetpackers];
  for(let i = 0; i < population; i++){
    let parentA = getParent();
    let parentB = getParent();
    bufferPop[i].geneticSequence = geneticSequenceFromParents(parentA.geneticSequence, parentB.geneticSequence);
    bufferPop[i].vx = random() < 0.5 ? parentA.vx : parentB.vx;
    if(random() < mutationRate) bufferPop[i].vx = random(2, 6);
    bufferPop[i].x = 0;
    bufferPop[i].y = height / 2;
    bufferPop[i].vy = 1;
    bufferPop[i].fuel = 1000;
    bufferPop[i].isAlive = true;
  }
  jetpackers = [...bufferPop];
}

function generateStarField(){
  let img = createGraphics(width, height);
  img.noStroke();
  img.fill(255);
  for(let i = 0; i < 10000; i++){
    let x = random(width);
    let y = random(height);
    let d = 0.1 + randomGaussian()*2;
    img.circle(x,y,d);
  }
  return img;
}


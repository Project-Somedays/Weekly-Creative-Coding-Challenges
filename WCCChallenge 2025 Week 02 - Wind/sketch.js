/* 
Author: Project Somedays
Date: 2025-01-11
Title: WCCChallenge 2025 Week 2 - Wind

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/g5J6Ajx9Am

Sycamore seeds are so neat. Many a happy hour was spent as a kid throwing them in the air and seeing how they helicopter down...

Interaction:
 - spinAxisOffset: attempting to get the pivot point of the rotation centered on the payload of the seed
 - gravity: how fast seeds fall

 ** COOL THING ALERT **
 - worldTimeRate: DROP FOR SLOW MO!
 
 - Look_up: see an alternative dropping from directly overhead
 - Draw Tree: it actually does look kind of cool on a black background
 - Seed Size: how big to render the models
 - Toggle Music: as it says on the box

RESOURCES
- Tree: https://www.freepik.com/free-photo/tree-with-huge-tree-trunk-field_19538489.htm#fromView=search&page=1&position=46&uuid=70e480e5-4fcf-4a61-a919-a6df722ae6a5&new_detail=true
- From below (expanded with Photoshop Generative Fill): https://www.freepik.com/free-ai-image/low-angle-perspective-tree-with-beautiful-canopy_152582066.htm#fromView=keyword&page=5&position=10&uuid=cc4d7869-ac65-4148-a31e-5800e8750875&new_detail=true
- Serene Atmosphere, free music from Universfield on Pixabay: https://pixabay.com/music/modern-classical-gentle-piano-for-soothing-background-ambience-265258/
- Sycamore Seed model and texture: modelled and textured it myself! SLOWLY learning Blender...

Help please:
- Still quite confused what coordinate system modifications I need to export from Blender to get what I want in p5js. I'll get there, but anyone else come across this issue?
- Related: Couldn't work out how to change the pivot point of rotation to be centered on the payload of the seed, hence the offset. Am I on the right track?

Updates:
- WORKED OUT THE ROTATION THING!

*/ 



let tree, seed, seedTexture, ambience, belowTree;
let gui, params;
let modelRanges;
let pivotPointOffset;

let seeds = [];
const n = 30;
let playMusic = true;
const baseWorldTime = 0.01;
let test;


function preload(){
  tree = loadImage("52277.jpg", () => console.log("tree image loaded succesfully"));
  seed = loadModel("Sycamore2Shrunk.obj", true, () => console.log("seed model loaded successfully"), );
  seedTexture = loadImage("SycamoreBaseColour.png", () => console.log("seed model texture loaded successfully"));
  ambience = loadSound("gentle-piano-for-soothing-background-ambience-265258.mp3", () => console.log("music loaded successfully"));
  belowTree = loadImage("ExtendedTree.png");
}
function setup() {
  // createCanvas(min(windowWidth, windowHeight), min(windowWidth, windowHeight), WEBGL);
  createCanvas(1080, 1080, WEBGL);
  noStroke();
  ambience.loop();

  for(let i = 0; i < n; i++){
    seeds.push(new SycamoreSeed());
  }

  modelRanges = getModelRanges(seed);
  // console.log(modelRanges);

  pivotPointOffset = modelRanges.zRange*0.2;
  noCursor();


  gui = new lil.GUI();
  params = {
    rotationPointOffset : 0.65,
    worldTimeRate: 1,
    "Toggle Music": toggleMusic,
    drawTree: true,
    gravity: 5,
    look_up: false,
    seedSize: 1
  }

  // gui.add(params, 'spinAxisOffset', -200, 200);
	
  gui.add(params, 'gravity', 1, 10, 1);
  gui.add(params, 'worldTimeRate', 0.01, 1);
  gui.add(params, 'look_up');
  gui.add(params, 'drawTree');  
  gui.add(params, 'seedSize',0,2);
	gui.add(params, 'rotationPointOffset', -2, 2);
  gui.add(params, "Toggle Music");
  

  test = new SycamoreSeed();

}

function draw() {
  background(0);

  ambientLight(255,255, 255);
  
  if(params.look_up) rotateX(HALF_PI);
  // draw the tree
  if(params.drawTree){
    if(params.look_up){
      push();
      translate(0,-height,0);
      rotateX(HALF_PI);
      rotateY(PI);
      texture(belowTree);
      plane(4*width, 4*height);
      pop();
    } else {
      push();
      translate(0,0,-width);
      texture(tree);
      plane(4*width, 4*height);
      pop();
    }    
  }

  

  

  // draw the seeds
  for(let seed of seeds){
    seed.update();
    seed.show();
    if(seed.p.y > height) seed.reset();      
  }



  orbitControl();
  
}

class SycamoreSeed{
  constructor(){
    this.reset();
  }

  reset(){
    this.p = createVector(random(-width, width), random(-3*height, -1.1*height/2), random(-width, width));
    this.xOffset = random(10000);
    this.yOffset = random(10000);
    this.zOffset = random(10000);
    this.startX = this.p.x;
    this.startY = this.p.y;
    this.startZ = this.p.z;
    this.aOffset = map(noise(this.xOffset), 0, 1, 0, TWO_PI);
    this.startFrame = frameCount;
		this.speedMultiplier = random(0.95, 1.05);
  }

  update(){
    this.p.x = map(noise(this.xOffset + baseWorldTime*frameCount*params.worldTimeRate),0,1,this.startX - width/2, this.startX + width/2);
    this.p.y += (frameCount-this.startFrame)*params.gravity*params.worldTimeRate*baseWorldTime;
    this.p.z = map(noise(this.zOffset + frameCount*baseWorldTime*params.worldTimeRate), 0, 1, -width/2, width/2);
    this.yOff = map(noise(this.yOffset + frameCount*baseWorldTime*params.worldTimeRate), 0, 1, -height/10, height/10);
  }

  show(){
    push();
    translate(this.p.x, this.p.y + this.yOff, this.p.z);
    // translate(-params.spinAxisOffset, 0, 0)
		translate(0,0,modelRanges.zRange*0.5*params.rotationPointOffset*params.seedSize);
    // rotateY(-params.worldTimeRate*baseWorldTime*frameCount*TWO_PI + this.aOffset);
    rotateY(-params.worldTimeRate * frameCount * 0.5 * this.speedMultiplier + this.aOffset);
		translate(0,0,-modelRanges.zRange*0.5*params.rotationPointOffset*params.seedSize);
    // translate(params.spinAxisOffset, 0, 0)
    rotateX(PI);
    texture(seedTexture);
    scale(params.seedSize);
    model(seed);
		// box(modelRanges.xRange,modelRanges.yRange,modelRanges.zRange);
    pop();
  }
}


function getModelRanges(model2measure){
  // Calculate model width from vertices
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  
  // Loop through all vertices to find bounds
  for (let i = 0; i < model2measure.vertices.length; i += 3) {
    let x = model2measure.vertices[i].x;
    minX = min(minX, x);
    maxX = max(maxX, x);
    let y = model2measure.vertices[i].y;
    minY = min(minY, y);
    maxY = max(maxY, y);
    let z = model2measure.vertices[i].z;
    minZ = min(minZ, z);
    maxZ = max(maxZ, z);
  }
  
  return {xRange: maxX - minX, yRange: maxY - minY, zRange: maxZ - minZ}
}

function toggleMusic(){
  playMusic =  !playMusic;
  if(!playMusic){
    ambience.stop();
  } else{
    ambience.loop();
  }
}

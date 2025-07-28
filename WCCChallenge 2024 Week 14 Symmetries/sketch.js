/*
Author: Project Somedays
Date: 2024-04-01, refactored 2024-04-06
Title: #WCCChallenge 2024 Week 14 - Symmetries

Made for Sableraph's weekly creative coding challenges, reviewed Sundays on https://www.twitch.tv/sableraph
Join The Birb's Nest Discord community! https://discord.gg/S8c7qcjw2b

Taking inspiration from Casey Reas' work. Movers bounce around in box.
Where they overlap:
  1. Push each other apart with a force inversely proportion to their distance
  2. Draw a line between the points of intersection OR a line between their centres

Aiming for multiple symmetries: movers bounce around in a box which is then flipped 4 ways to get 2 lines of symmetry
Then THAT whole pattern is rotated about for a 3rd,rotational symmetry. Or the other way around. Or flipped/rotated twice.

To that end, I wanted to separate out movers from visuals. 
Drawing to a primary graphic layer and then I draw copies of THAT to a secondary layer and bring it all together in a tertiary, final layer.
Keep a lot of resolution up my sleeve that way.

INTERACTIVITY:
- Up and down arrows toggle through different modes, starting with random
- Clicking runs setup again = new set of movers, colour palettes, opacity, possibly mode...
- Press "r" to toggle rotation and zoom
- Press "d" to show debug mode
*/

let palettes = [
  // ['#ffffff'],
  ['#f72585', '#b5179e', '#7209b7', '#560bad',' #480ca8', '#3a0ca3', '#3f37c9', '#4361ee', '#4895ef', '#4cc9f0'],
  ['#03071e', '#370617', '#6a040f', '#9d0208', '#d00000', '#dc2f02', '#e85d04',' #f48c06', '#faa307', '#ffba08'],
  ['#d9ed92', '#b5e48c','#99d98c','#76c893', '#52b69a', '#34a0a4', '#168aad', '#1a759f', '#1e6091', '#184e77'],
  ['#3a0f72', '#6023b0', '#7826e3', '#8e48eb', '#a469f2', '#bb4fcd', '#d235a8', '#ff005e', '#250b47'],
  ['#007f5f', '#2b9348', '#55a630', '#80b918', '#aacc00', '#bfd200', '#d4d700', '#dddf00', '#eeef20', '#ffff3f'],
  ['#012a4a', '#013a63', '#01497c', '#014f86', '#2a6f97', '#2c7da0', '#468faf', '#61a5c2', '#89c2d9', '#a9d6e5'],
  ['#f94144', '#f3722c', '#f8961e', '#f9844a', '#f9c74f', '#90be6d', '#43aa8b', '#4d908e', '#577590', '#277da1'],
  ['#0466c8', '#0353a4', '#023e7d', '#002855', '#001845', '#001233', '#33415c', '#5c677d', '#7d8597', '#979dac'],
  ['#7400b8', '#6930c3', '#5e60ce', '#5390d9', '#4ea8de', '#48bfe3', '#56cfe1', '#64dfdf', '#72efdd', '#80ffdb'],
  ['#54478c', '#2c699a', '#048ba8', '#0db39e', '#16db93', '#83e377', '#b9e769', '#efea5a', '#f1c453', '#f29e4c'],
  ['#227c9d', '#17c3b2', '#ffcb77', '#fef9ef', '#fe6d73'],
  ['#ffbc42', '#d81159', '#8f2d56', '#218380', '#73d2de'],
  ['#d00000', '#ffba08', '#3f88c5', '#032b43', '#136f63'],
  ['#eac435', '#345995', '#03cea4', '#fb4d3d', '#ca1551']
];

let bg = "#0D1126"; // chinese black


// Kind of making enums ---> OpenProcessing doesn't like object.freeze ?
let interactions = {
  CENTREMODE : "CENTREMODE",
  CHORDMODE: "CHORDMODE"
}

let construction = {
  REFLECTIONSROTATIONS: "Reflections -> Rotations",
  ROTATIONSREFLECTIONS: "Rotations -> Reflections",
  REFLECTIONSREFLECTIONS : "Reflections -> Reflections",
  ROTATIONSROTATIONS : "Rotations -> Rotations",
  RANDOMISED : "Randomised Reflections/Rotations"
}

// SELECTIONS
let constructionCarousel;
let constructionIndex = 0;
let currentConstructionMode;
let currentInteractionMode;


// TIMING
const cycleFrames = 300;
const substeps = 5; // how many times should we refresh per frame
const rotRateMultiplier = 0.25; // how much should we rotate per zoom cycle. Hint: much more WILL make you sick.

let DEBUGMODE = false;
let showMetaData = true;

// COLOURS
let randPalette;

// MOVERS AND CONSTRAINTS
let movers = [];
let n;
let r, D;
let walls = [];
let fMax = 0.25; // max repulsive force
let overlap = 1; // multiples of r close to the border
let w;

// LAYERS - two for comparisons
let primaryLayer;
let secondaryLayerA;
let tertiaryLayerA;
let primaryLayerB;
let secondaryLayerB;
let tertiaryLayerB;

let debugLayer;
let canvas = null;
let globalScale = 1;
let rotRate;
let rotateAndZoomMode = true;


function setup(){
  // canvas =  windowWidth > windowHeight ? createCanvas(windowHeight, windowHeight) : createCanvas(windowWidth, windowWidth);
  createCanvas(1920, 1080);
  frameRate(30);
  pixelDensity(1);
  
  background(bg);
  rotRate = rotRateMultiplier*TWO_PI/cycleFrames;

  constructionCarousel = [
    construction.RANDOMISED, 
    construction.REFLECTIONSROTATIONS,
    construction.ROTATIONSREFLECTIONS,
    construction.REFLECTIONSREFLECTIONS,
    construction.ROTATIONSROTATIONS
  ]

  // if randomised, choose a random construction method from the other options with each refresh
  if(constructionCarousel[constructionIndex] === construction.RANDOMISED){
    currentConstructionMode = random(constructionCarousel.filter(m => m != construction.RANDOMISED));
  } else{
    currentConstructionMode = constructionCarousel[constructionIndex];
  }

  

  // INIT LAYERS
  debugLayer = createGraphics(height, height);

  primaryLayer = createGraphics(height, height);
  
  secondaryLayerA = createGraphics(height, height);
  tertiaryLayerA = createGraphics(2*height,2*height); // the final image for zooming and rotating
  
  secondaryLayerB = createGraphics(height, height);
  tertiaryLayerB = createGraphics(2*height,2*height); // the final image for zooming and rotating
  
  secondaryLayerA.noStroke();
  secondaryLayerB.noStroke();
  tertiaryLayerA.noStroke();
  tertiaryLayerB.noStroke();
  
  // VISUALS
  currentInteractionMode = random(1) < 0.33 ? interactions.CENTREMODE : interactions.CHORDMODE;  // in general, chordmode is more interesting
  opacity = random(1) < 0.25 ? 255 : int(random(50,100)); // most of the time translucent, but every now and then BAM! Full colour.
  randPalette = random(palettes).map(e => hexToRgbWithOpacity(e, opacity));

  w = primaryLayer.width; // given it's square

  // MOVERS
  n = int(random(20, 40));
  r = random(0.025*w, 0.2*w);
  D = 2*r;
  generateMovers(w, r);
  generateWalls(w);
  imageMode(CENTER);

  if(showMetaData) logMetaData();
}



function draw(){
  // draw in the backgrounds each frame
  background(bg);

  fillGraphicLayer(debugLayer);
  fillGraphicLayer(secondaryLayerA);
  fillGraphicLayer(tertiaryLayerA);
  fillGraphicLayer(secondaryLayerB);
  fillGraphicLayer(tertiaryLayerB);
  debugLayer.noFill();
  debugLayer.stroke(255);
  showWalls(debugLayer);
  // update global zoom and rotation
  if(rotateAndZoomMode){
    globalScale = 1/sqrt(2) + (1 + sin(frameCount * rotRate * (1/rotRateMultiplier) + HALF_PI + PI)); // start zoomed out and then zoom in
  }
  
  // in case we need to speed things up, allow multiple passes per drawframe
  for(let i = 0; i < substeps; i++){
    for(let m of movers){
      for(let w of walls){
        bounce(w, m); // bounce off the walls
      }
      m.update(); // update position
      // if(DEBUGMODE) m.show(debugLayer);
      m.show(debugLayer);
    }
    handleMoverInteraction()
    drawOverlap(primaryLayer, currentInteractionMode);
    
  }


    // constructing the final image for each frame
    switch(currentConstructionMode){
      case construction.REFLECTIONSROTATIONS:
        drawReflections(secondaryLayerA,primaryLayer);
        drawRotations(tertiaryLayerA, secondaryLayerA);
        drawRotations(secondaryLayerB,primaryLayer);
        drawReflections(tertiaryLayerB, secondaryLayerB);
        break;
      case construction.ROTATIONSREFLECTIONS:
        drawRotations(secondaryLayerA,primaryLayer);
        drawReflections(tertiaryLayerA, secondaryLayerA);
        drawReflections(secondaryLayerB,primaryLayer);
        drawRotations(tertiaryLayerB, secondaryLayerB);
        break;
      case construction.REFLECTIONSREFLECTIONS:
        drawReflections(secondaryLayerA,primaryLayer);
        drawReflections(tertiaryLayerA, secondaryLayerA);
        drawRotations(secondaryLayerB, primaryLayer);
        drawRotations(tertiaryLayerB, secondaryLayerB);
        break;
      case construction.ROTATIONSROTATIONS:
        drawRotations(secondaryLayerA, primaryLayer);
        drawRotations(tertiaryLayerA, secondaryLayerA);
        drawReflections(secondaryLayerB,primaryLayer);
        drawReflections(tertiaryLayerB, secondaryLayerB);
        break;
    }
    


    
    let s = width/4;
    image(debugLayer,5*width/6, height/4, s, s);
    image(primaryLayer,5*width/6,3*height/4, s, s);
    image(secondaryLayerA,2*width/4, height/4, s, s);
    image(secondaryLayerB,2*width/4, 3*height/4, s, s);
    image(tertiaryLayerA,width/6, height/4, s, s);
    image(tertiaryLayerB,width/6, 3*height/4, s, s);
    // if(DEBUGMODE){
    //   image(debugLayer, width/2, width/2, width, width);
    // } else {
    //   push();
    //   translate(width/2, height/2);
    //   if(rotateAndZoomMode){
    //     scale(globalScale);
    //     rotate(frameCount*rotRate);
    //   }
    //   image(tertiaryLayerA, 0, 0, width, width);
    //   pop();
      
    //   // for comparison videos
    //   // image(tertiaryLayerA, width*0.25, height/2, 0.95*width/2, 0.95*width/2);
    //   // image(tertiaryLayerB, width*0.75, height/2, 0.95*width/2, 0.95*width/2);
    // }


    if(frameCount%cycleFrames === 0) cycleSketch();
}


function fillGraphicLayer(layer){
  layer.fill(bg);
  layer.noStroke();
  layer.rect(0,0, layer.width, layer.height);
}

function drawRotations(targetLayer, layer2Copy){
  for(let i = 0; i < 4; i++){
    targetLayer.push();
    targetLayer.translate(targetLayer.width/2, targetLayer.height/2);
    targetLayer.rotate(i*HALF_PI);
    targetLayer.image(layer2Copy, 0, 0, targetLayer.width/2, targetLayer.height/2);
    targetLayer.pop();
  }
}

function drawReflections(targetLayer, layer2Copy){
  const reflections = [
    {x: 1, y: 1}, // TL
    {x: -1, y : 1}, // TR
    {x: 1, y: -1}, // BR
    {x:-1, y: -1}] // BL
  for(let i = 0; i < 4; i++){
    targetLayer.push();
    targetLayer.translate(targetLayer.width/2, targetLayer.height/2); 
    targetLayer.scale(reflections[i].x, reflections[i].y);
    targetLayer.image(layer2Copy, -0.5*targetLayer.width, -0.5*targetLayer.width, targetLayer.width/2, targetLayer.width/2);
    targetLayer.pop();
  }
  
  
}


function drawOverlap(layer, mode){   
  for(let i = 0; i < movers.length; i++){
    for(let j = i; j < movers.length; j++){
      if(i === j) continue;
      let d = p5.Vector.dist(movers[i].p, movers[j].p)
      if(d < 2*r){
        layer.stroke(movers[i].c);
        switch(mode){
          case interactions.CENTREMODE:
            showOverlapLineBetweenCenters(layer, movers[i].p, movers[j].p);
            break;
          case interactions.CHORDMODE:
            showOverlapChord(layer, movers[i].p, movers[j].p);
            break;
        }
      }
    }
  }
    
  
}

function showOverlapLineBetweenCenters(layer,posA, posB){
  layer.line(posA.x, posA.y, posB.x, posB.y);
}

function showOverlapChord(layer,posA, posB){
	let d = p5.Vector.dist(posA,  posB);
	if(d > D) return;
	let aSys = p5.Vector.sub(posB, posA).heading(); // get the heading from A to B
	let a = acos(d/D);
	layer.push();
	layer.translate(posA.x, posA.y);
	layer.rotate(aSys); // for simplicity, rotate the system so that posB is always to the right of posA
	// if(DEBUGMODE){
	// 	layer.line(0, 0, r*cos(a), r*sin(a));
	// 	layer.line(0, 0, r*cos(a), r*sin(-a));
	// }
	layer.line(r*cos(a), r*sin(a), r*cos(a), r*sin(-a)); // drawing a line between the points of intersection
	layer.pop();
}


function drawNormal(layer, wall, mover){
  let ap = p5.Vector.sub(mover.p, wall.start);
  let ab = p5.Vector.sub(wall.end, wall.start);
  ab.normalize();
  ab.mult(ap.dot(ab));
  let normal = p5.Vector.add(wall.start, ab);
  layer.line(mover.p.x, mover.p.y, normal.x, normal.y);
}


function bounce(wall, mover){
  // scalar projection to get the distance to the wall
  let ap = p5.Vector.sub(mover.p, wall.start);
  let ab = p5.Vector.sub(wall.end, wall.start);
  ab.normalize();
  ab.mult(ap.dot(ab));
  let normal = p5.Vector.add(wall.start, ab); // scalar projection point
  let d = p5.Vector.dist(mover.p, normal); // how far from the wall?

  let reflectionVector = createVector(-ab.y, ab.x); // the normal vector to the wall
  
  let inBoundsOfWall = p5.Vector.dist(wall.start, mover.p) < wall.wallLength && p5.Vector.dist(wall.end, mover.p) < wall.wallLength;
  if(d < overlap*r && inBoundsOfWall){ // is we're inside some threshold...
    wall.isHit = true;
    mover.v.reflect(reflectionVector)
  } else{
    wall.isHit = false;
  }
}


function hexToRgbWithOpacity(hex, opacity) {
  // Remove the hash symbol if it's present
  hex = hex.replace('#', '');

  // Parse the hex color into its RGB components
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  
  // Return the RGB color with the specified opacity
  return color(r, g, b, opacity);
}



function keyPressed(){
  if(key === 'd' || key === 'D'){
    DEBUGMODE = !DEBUGMODE;
    background(0);
  }

  if(key === "r" || key === "R"){
    rotateAndZoomMode = !rotateAndZoomMode;
  }

  if(key === "t" || key === "T"){
    showMetaData = !showMetaData;
  }

  if(keyCode === UP_ARROW){
    constructionIndex = (constructionIndex + 1)%constructionCarousel.length;
    cycleSketch();
  }

  if(keyCode === DOWN_ARROW){
    constructionIndex = constructionIndex < 0 ? constructionCarousel.length - 1 : constructionIndex - 1;
    
    cycleSketch();
  }
  
}

function logMetaData(){
  console.log(`Interaction Method: ${currentInteractionMode}\nConstruction Method: ${currentConstructionMode}\nn: ${n}\nr: ${r/width} of width\npalette: ${randPalette}\nopacity: ${opacity}`);
}

function cycleSketch(){
  movers = [];
  setup();
}

function mousePressed(){
  cycleSketch();
}

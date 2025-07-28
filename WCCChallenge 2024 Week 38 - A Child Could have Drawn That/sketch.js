/*
Author: Project Somedays
Date: 2024-09-21
Title: WCCChallenge 2024 Week 38 - My Kid Could Draw That

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/g5J6Ajx9Am

Keeping it simple this week. This one goes straight to the fridge. 

From my teaching days, I thoroughly enjoyed the constant reminder that little things like colouring between the lines is a learned skill and not one that comes naturally out of the box.

INSTRUCTIONS:
Draw simple enclosed shapes and we'll attempt to colour it in. 

HOW DOES IT WORK?
While dragging the mouse, draw circles cumulatively to the drawLayer, but also store the mouse position every storeEveryXFrames
Mouse release: subtract the enclosed shape from the mask layer and colour it in i.e. shuffle the sample points join them up behind the mask

Not colouring in enough for you? Increase the number of attempts or increase the colouring line thickness.

Please do save your work with the button and tag me in any terrible/wonderful art you make with it 🤣: @ProjectSomedays most places, but @ProjectSomedays_JustDoStuff on IG

RESOURCES:
- Erase tutorial from Steve's Makerspace: https://www.youtube.com/watch?v=zDlfsdT7WG8
- Hand (free asset) from Freepik: https://www.freepik.com/free-photo/crop-child-s-hand-writing-school-copybook_2601934.htm#fromView=search&page=1&position=20&uuid=8f12d8d2-8276-4899-92eb-0d85477bca61
- Palette from coolors.co: https://coolors.co/palettes/popular/bright
- lil-gui: https://www.jsdelivr.com/package/npm/lil-gui
*/

let drawMode;
let allShapes;
let currentShape;
let params, gui;
let guiContainer;
let drawLayer;
let maskLayer;
let colouringInLayer;
let palette = "#ff0000, #ff8700, #ffd300, #deff0a, #a1ff0a, #0aff99, #0aefff, #147df5, #580aff, #be0aff".split(", ");

let hand;

function preload(){
  hand = loadImage("Hand.png");
}

function setup() {
  // createCanvas(windowWidth, windowHeight);
  createCanvas(1080, 1080);

  // init gui
  gui = new lil.GUI();

  params = {
    lineColour: "#ffffff",
    lineThick: 40,
    colouringInLineThick: 25,
    minDist : width/200,
    closeShapeProximity : width/50,
    storeEveryXFrames: 5,
    handScale : 0.2*width/hand.width,
    recolouringAttempts: 3,
    showHand: true,
    showMaskLayer: true,
    showDrawLayer: true,
    showColouringInLayer: true,
    reset: reset,
    'Save Image': saveImage
  }
  
  gui.addColor(params, 'lineColour');
  gui.add(params, 'minDist', width/500, width/20);
  gui.add(params, 'lineThick', 1, 100, 1);
  gui.add(params, 'colouringInLineThick', 1, 100, 1);
  gui.add(params, 'recolouringAttempts', 1, 5, 1);
  gui.add(params, 'storeEveryXFrames', 1, 50);
  gui.add(params, 'handScale', 0, 1);
  gui.add(params, 'showHand');
  gui.add(params, 'showDrawLayer');
  gui.add(params, 'showMaskLayer');
  gui.add(params, 'showColouringInLayer');
  gui.add(params, 'Save Image');
  gui.add(params, 'reset');
  
  noFill();
  strokeWeight(10);

  allShapes = [];
  drawMode = false;

  // Prevent p5.js mousePressed event when hovering over the GUI
  guiContainer = document.querySelector('.lil-gui');

  drawLayer = createGraphics(width, height);
  drawLayer.noStroke();

  maskLayer = createGraphics(width, height);
  maskLayer.fill(0);
  maskLayer.rect(0,0,width, height);

  colouringInLayer = createGraphics(width, height);
  colouringInLayer.noFill();
  
  
}

function draw() {
  background(0);

  cursor();
  if(!isMouseOverGUI(guiContainer) || !params.showHand) noCursor();

  if(params.showColouringInLayer) image(colouringInLayer, 0, 0);
  if(params.showMaskLayer) image(maskLayer, 0, 0);
  if(params.showDrawLayer) image(drawLayer, 0, 0);
  if(params.showHand) image(hand, mouseX - hand.width*params.handScale, mouseY - hand.height*params.handScale, hand.width*params.handScale, hand.height*params.handScale);
    
}

// make a new currentShape and chuck in that first coordinate
function mousePressed(){
  if (isMouseOverGUI(guiContainer)) return;
  drawMode = true;
  currentShape = [];
  currentShape.push(createVector(mouseX, mouseY));
}

// when dragging, draw to the screen and, if the point is far enough away, record the coordinates in currentShape
function mouseDragged(){
  if(!drawMode) return;
  drawLayer.fill(params.lineColour);
  drawLayer.circle(mouseX, mouseY, params.lineThick);
  let lastPoint = currentShape[currentShape.length - 1];
  if(frameCount%params.storeEveryXFrames === 0 && dist(mouseX, mouseY, lastPoint.x,  lastPoint.y) > 10) currentShape.push(createVector(mouseX, mouseY));
}

// when you let go, push to allShapes and colour it in
function mouseReleased(){
  if(isMouseOverGUI(guiContainer)) return;
  allShapes.push(currentShape);
  eraseShapeFromMask(allShapes[allShapes.length - 1]);
  colourInShape(allShapes[allShapes.length - 1]);
  drawMode = false;
}

function reset(){
  setup();
}


function isMouseOverGUI(container) {
  let rect = container.getBoundingClientRect();
  return (
    mouseX >= rect.left &&
    mouseX <= rect.right &&
    mouseY >= rect.top &&
    mouseY <= rect.bottom
  );
}

// just connect up the dots in random order. Like a child. What a mess.
function colourInShape(shape){
  colouringInLayer.stroke(random(palette));
  colouringInLayer.strokeWeight(params.colouringInLineThick);
  for(let i = 0; i < params.recolouringAttempts; i++){
    let shuffled = shuffleArray(shape);
    colouringInLayer.beginShape()
    for(let i = 0; i < shuffled.length; i++){
      colouringInLayer.vertex(shuffled[i].x, shuffled[i].y);
    }
    colouringInLayer.endShape();
  }
}


function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(random(i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

//small perturbation so it goes outside the lines sometimes
function eraseShapeFromMask(shape){
  maskLayer.erase();
  
  if(shape.length === 0){
    maskLayer.noErase();
    return;
  }
  maskLayer.strokeWeight(params.lineThick)
  maskLayer.fill(255);
  maskLayer.beginShape();

  for(let pt of shape){
    maskLayer.vertex(pt.x, pt.y);
    maskLayer.circle(pt.x + random(-params.lineThick, params.lineThick), pt.y + random(-params.lineThick, params.lineThick), params.lineThick);
  }
  maskLayer.endShape(CLOSE);

  maskLayer.noErase();
}

function saveImage() {
  let fileName = `Rubbish But Adorable Kid Art #${int(random(1000000))}`;
  saveCanvas(fileName, 'png');
}

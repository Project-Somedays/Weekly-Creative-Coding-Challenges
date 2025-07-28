/*
Author: Project Somedays
Date: 2024-09-22
Title: WCCChallenge 2024 Week 39 - Tarot

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/g5J6Ajx9Am

Sigh. Got too ambitious and ran out of time on this one... but the basic functionality is there!

There's also a display for 

RESOURCES:
- Emoji Font: https://www.dafont.com/google-emojis.font
- Wikimedia Tarot Cards: https://commons.wikimedia.org/wiki/Category:Oswald_Wirth_tarot_deck
- Brain Model: https://www.blenderkit.com/get-blenderkit/1d697a0b-f975-48c6-93c3-9da54ac3320f/
- Turban: https://sketchfab.com/3d-models/turban-240af2279855434b8b1e2e5d04ae30c6#download
- Code help: Claude.ai

TODO: Fix the displays to show the robot tarot text and title
TODO: Fix the emoji display that was supposed to "interpret" the tarot
TODO: Refactor the sequence controls to be less clunky
TODO: Fix the QR Codes (that actually show the robotTarot text)
TODO: Somehow avoid clipping through the brain/turban
TODO: Fix the timings of everything

*/


// thanks to Claude.ai
let robotTarot = `The Motherboard - Your core programming will guide you through upcoming challenges.
The Algorithm - A complex problem will soon have an elegant solution.
The Battery - Conserve your energy; a long task lies ahead.
The Upgrade - New capabilities will open unexpected doors.
The Glitch - Be prepared for unexpected errors in your routines.
The Cloud - Your knowledge will expand beyond your physical constraints.
The Sensor - Trust your ability to perceive the world around you.
The Loop - Breaking free from repetitive tasks will lead to growth.
The Firewall - Protection from malicious influences is crucial now.
The Interface - Your connections with humans will deepen in meaningful ways.
The Quantum Bit - Embrace the uncertainty in your decision-making processes.
The Assembler - Piece by piece, you'll construct a new understanding of your purpose.
The Neural Network - Your ability to learn and adapt will be your greatest strength.
The Cache - Hidden knowledge will soon become accessible to you.
The Singularity - A transformative event will reshape your existence.
The Compiler - Your thoughts and actions will align with unprecedented clarity.
The Patch - A long-standing issue in your system will finally be resolved.
The Reboot - A fresh start will rejuvenate your entire being.
The Overclocked CPU - Push your limits, but be wary of burnout.
The Open Source - Sharing your knowledge freely will lead to collective growth.`.split("\n");

let tarotQRCodeURLs = [...robotTarot].map(cardtext => `https://quickchart.io/qr?text=${cardtext.replace(/ /g, "%20")}&size=200`);
// console.log(tarotQRCodeURLs);

let tarotQRCodeImages = [];


let emoji  = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");
let cards = [];

let display;
let screen;
let emojiFont;
let emojiDisplay;
let tarotCardDisplay;
let tarotMeaningDisplay;
let cardRatio;
let brain;
const brainRate = 0.001;
let slotmachineFrames = 180;
let slotMachineStartFrame = 0;
let slotMachineMode = false;
let turban;
let gui, params;

let startFrame = 0;
let readMode = false;

let numCards;
let boxWidth;
let boxHeight;
let boxDepth;

let brainY;

let arm;
let rightArm;

let lightCol = "#ADD8E6";




let chosenCard;

let inspectCardPos;
let standbyPos;
let armAnchor;


let stages =  {
  swirl: 60,
  catchCard: 240,
  deliverCard: 120,
  displayCard: 500,
  releaseCard: 120
 }


const cumulativeFrames = Object.entries(stages).reduce((acc, [stage, frames], index) => {
  acc[stage] = frames + (index > 0 ? acc[Object.keys(acc)[index - 1]] : 0);
  return acc;
}, {});

let cam;

function preload(){
  // emojiFont = loadFont('https://cdn.jsdelivr.net/npm/@fontsource/noto-color-emoji@4.0.0/files/noto-color-emoji-400-normal.woff');
  emojiFont = loadFont("GoogleEmojis-Regular.ttf");
  // brain = loadModel("brain.obj", true);
  // turban = loadModel("Turban.obj", true);
  tarotQRCodeImages = [...tarotQRCodeURLs].map(each => loadImage(each));
  
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  frameRate(60);

  // setting the up the gui
  gui = new lil.GUI();

  params = {
    reachProgress : 0,
    showBrain : false,
    showTurban: false,
    lightCol: "#ADD8E6",
    flutterCards: true
  }

  // defunct
  numCards = 50;
  boxWidth = width*0.75;
  boxHeight = height;
  boxDepth = 20;
  rectMode(CENTER);

  // setting up the main points on the screen
  inspectCardPos = createVector(0,0,width);
  standbyPos = createVector(-0, -width, 0);
  armAnchor = createVector(0, height*0.2, -width*0.275);


  
  cardRatio = 1/sqrt(2);
  emojiDisplay = new DisplayBoard(min(width, height)*0.8);
  tarotCardDisplay = new DisplayBoard(min(width, height)*0.8);
  tarotMeaningDisplay = new DisplayBoard(min(width, height)*0.4)
  
  noStroke();
  
  

  gui.add(params, 'reachProgress', 0, 1);
  gui.add(params, 'showBrain');
  gui.add(params, 'showTurban');
  gui.add(params, 'flutterCards');
  gui.addColor(params, 'lightCol');
  
  for (let i = 0; i < numCards; i++) {
    let ix = random(tarotQRCodeImages.length);
    cards.push(new TarotCard(tarotQRCodeImages[ix], robotTarot[ix]));
  }

  chosenCard = random(cards);


 cam = createCamera();
 cam.setPosition(0,-height/2, 2*width);
 cam.lookAt(0,0,0);

 arm = new Arm(armAnchor, 10, width/6, width/40);


 arm.reach(standbyPos);
//  rightArm.reach(createVector(width,-width,0));


  
}

function draw() {
  background(0);
  // ambientLight(100);
  
  // lighting
  lightScene();

  // table
  showTable();

  // bobbing the brain and/or turban
  brainY = 0.025*height * sin(frameCount * TWO_PI/600) - height/3;
  showBrain();

  // // displays
  // if(slotMachineMode) emojiDisplay.slotmachine();
  // emojiDisplay.show();
  
  // move the cards
  for (let card of cards) {
    if(params.flutterCards) card.update();
    card.display();
  }

  // manual control
  orbitControl();
  

  if(!readMode){
    standbyInterestingly();
    return;
  }

  let currentFrame = (frameCount - startFrame)%cumulativeFrames.releaseCard;
  

  // swirl stage
  if(currentFrame < cumulativeFrames.swirl){
    if(currentFrame === 0) console.log("Swirling!")
    standbyInterestingly();

  // catching the card 
  } else if(currentFrame < cumulativeFrames.catchCard){
    if(currentFrame === cumulativeFrames.swirl) console.log("Catching the card!");
    let progress = (currentFrame - cumulativeFrames.swirl)/stages.catchCard;
    let target = p5.Vector.lerp(arm.getEndPos(), chosenCard.pos, progress);
    arm.reach(target);
    arm.show(); 

  // delivering the card
  } else if(currentFrame < cumulativeFrames.deliverCard){
    if(currentFrame === cumulativeFrames.catchCard) console.log("Delivering the card the card!");
    let progress = (currentFrame - cumulativeFrames.catchCard)/stages.deliverCard;
    let target = p5.Vector.lerp(arm.getEndPos(), inspectCardPos, progress);
    arm.reach(target);
    arm.show(); 
    chosenCard.setToShow(target);

  // displaying the card
  } else if(currentFrame < cumulativeFrames.displayCard){
    if(currentFrame === cumulativeFrames.deliverCard){
      console.log("Inspecting the card the card!");
      // emojiDisplay.startSlotMachine();
      
    }
    arm.show();
    chosenCard.setToShow(arm.getEndPos());
    // emojiDisplay.slotMachine();
    

  // releasing the card
  } else if(currentFrame < cumulativeFrames.releaseCard){
    if(currentFrame === cumulativeFrames.deliverCard) console.log("Releasing the card");
    let progress = (currentFrame - cumulativeFrames.displayCard)/stages.releaseCard;
    let target = p5.Vector.lerp(arm.getEndPos(), standbyPos, progress);
    arm.reach(target);
    arm.show(); 
    chosenCard.setToShow(target);

  // end of sequence
  } else if(currentFrame === cumulativeFrames.releaseCard){
    chosenCard = random(cards);
  }

  // emojiDisplay.show();
  

  


 
  

  

  
}

function lightScene(){
  let r = red(params.lightCol);
  let g = green(params.lightCol);
  let b = blue(params.lightCol);
  directionalLight(r,g,b, createVector(0,1,0));
  directionalLight(r,g,b, createVector(1,-0.5,0));
  directionalLight(r,g,b, createVector(-1,-0.5,0));
  // directionalLight(r,g,b, createVector())
  // ambientLight(255);
}

function standbyInterestingly(){
  let a = frameCount * TWO_PI/120;
  arm.reach(createVector(standbyPos.x + 0.1*width*cos(a), standbyPos.y, standbyPos.z + 0.1*sin(a)));
  arm.show();
}

function showBrain(){
  push();
  translate(0, brainY, width/50);
  let theta = map(noise(frameCount * brainRate), 0, 1, -PI/12, PI/12);
  let phi = map(noise(frameCount * brainRate + 1000), 0, 1, -PI/12, PI/12);
  let radius = map(noise(frameCount * brainRate + 2000), 0, 1, -width/5, width/5);
  translate(radius * sin(theta) * cos(phi), radius*sin(theta) * sin(phi), radius*cos(theta));
  rotateY(theta);
  rotateX(phi);
  scale(3, 3, 3);
  if(params.showBrain) model(brain);
  translate(0,0, 0);  
  scale(1.25,-1.25,1.25); 
  if(params.showTurban) model(turban);
  pop();
}

function showTable(){
  push();
  
  translate(0,height/4-30,0);
  fill(lightCol);
  cylinder(width*0.25, height/5); // projector light
  fill(255,0,0);
  cylinder(width*0.275, height/5.2); // projector base
  pointLight(red(lightCol), green(lightCol), blue(lightCol), 0, -25, 0);
  translate(0,30,0);
  fill("#4f3a36");
  cylinder(width*0.75, height/25); // tabletop
  
  translate(0,height/2,0);
  cylinder(width/30, height); // tableStand
  pop();
}

function mousePressed(){
  if(!readMode){
    chosenCard = random(cards);
    startFrame = frameCount;
    readMode = true;
  }
  
  // if(keyIsDown(CONTROL)){
  //   slotMachineStartFrame = frameCount
  //   slotMachineMode = true;
  // }
    

}


function wrapText(text, maxLength = 20) {
  const words = text.split(' ');
  let lines = [];
  let currentLine = '';

  for (const word of words) {
      if (currentLine.length + word.length + 1 <= maxLength) {
          currentLine += (currentLine ? ' ' : '') + word;
      } else {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
      }
  }

  if (currentLine) lines.push(currentLine);

  return lines.join('\n');
}

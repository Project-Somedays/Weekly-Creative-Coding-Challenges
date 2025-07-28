/*
Author: Project Somedays
Date: 2024-05-29
Title: WCCChallenge "My Personal Hell"

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
Join The Birb's Nest Discord community! https://discord.gg/S8c7qcjw2b

I don't know about anyone else, but I find Sushi trains really stressful. This game captures that experience. My highest score is 20 with a increase difficulty rate of 10%. Good luck!

First time experimenting with asynchronous loading of assets

############# RESOURCES #################
Inverse Kinematics code adapted from our Lord and Saviour Daniel Shiffman's work: https://www.youtube.com/watch?v=hbgDqyy8bIw
Loading animation tutorial, again from Mr Shiffman: https://www.youtube.com/watch?v=UWgDKtvnjIU
Sumo Art from Night Cafe: https://creator.nightcafe.studio/creation/faiwEmZzCBblpxrKSPcX?ru=projectsomedays
Sushi Art from Freepik: https://www.freepik.com/free-vector/hand-drawn-kawaii-sushi-collection_4097571.htm#fromView=search&page=1&position=11&uuid=41d4e717-b9ad-47d1-b877-a5ad3dfe0a19
Music: "Japanese Battle" by https://pixabay.com/music/adventure-japanese-battle-164989/
Flamethrower: https://pixabay.com/sound-effects/flame-thrower-128555/
Eating sound effect: https://pixabay.com/sound-effects/eating-sound-effect-36186/
Flamethrower: https://pixabay.com/sound-effects/084303-hq-flamethrower-87072/
Font: https://www.dafont.com/almost-japanese-comic.font


############# TODO's AND OPPORTUNITIES ##############
DONE: Burn Pile
DONE: Speed Increase on Success
DONE: Sound Effects
DONE: Music
DONE: Game Over
DONE: Make Screen Responsive
DONE: Robot Arm - grabber
DONE: Loading Screen
TODO: Robot Arm - flamethrower to scorch away mistakes
TODO: FOMO/Anger meter for correct food moving
TODO: Animate the Sumo
TODO: Fix my photoshop work with his upper lip
TODO: Implement determining if on mobile or not: https://editor.p5js.org/ronikaufman/sketches/yaVtDVBK5
TODO: Use touchMoved() ?? to make it work with mobile

*/

// #################### VARIABLES ####################### //

// -------- SCALING --------- //
let cnv;
let yardstick;
let handScale;
let sumoScale;
let sushiScale;

// ---------- SUMO ---------- //
let sumo;
let sumoOpen;
let sumoClosed;
let mouth;

// ------ THOUGHT BUBBLE --------- //;
let thoughtBubbleP;
let thoughtBubble;
const bubbleRate = 200;

// -------- SUSHI --------- //
let targetSushi;
let sushiTrainHeight;
let sushi = [];
let sushiCycleFrames = 120;
let sushiTrain = [];
let newSushiFrame = 60;
let trainRate = 3;

// --------- ARM ----------- //
const armSegments = 50;
let m;
let maxLength;
let handMode = false;
let legacyArmMode = false;
let hand;
let extraArms = [];
let arm;
const armMovementRate = 100;

// --------- FONT ---------- //
let font;

// ---------- SOUNDS ---------- //
let soundsEating;
let soundsWrong;
let soundsFlamethrower;
let soundsCollectPoints;

// ------- FLAMETHROWER ---------//
let flamethrower;
let flames = [];

// --------- SCORES ---------- //;
let music;
let score = 0;
let chances = 5;
let burnedImg;
const increaseDifficultyRate = 1.1;

// -------- LOADING -------------//
let isLoading = true;
let counter = 0;
const startFrame = 180;

// #################### PRELOAD ####################### //

function preload(){
  music = loadSound("sounds/japanese-battle-164989.mp3", loadingCallback);
}

function loadingCallback(){
  counter ++;
  if(counter > 25){
    isLoading = false;
    console.log("All done loading all the things!");
    makeAllTheBiz(); // only call this when we're sure all the assets are good 
  }
}

function setGameText(){
  textSize(height/10);
  textFont(font);
  textLeading(height/15);
  // console.log("Set the text things")
}

function makeAllTheBiz(){
  cnv = createGraphics(width, height);
  

  // ----- SCALING ----- ///
  yardstick = min(width, height);
  handScale = (0.15*yardstick)/hand.width;
  console.log(sumoOpen.width);
  sumoScale = yardstick / sumoOpen.width;
  sushiScale = 0.1*yardstick/sushi[0].width;

  // ----- SUSHI ------ //
  sushiTrainHeight = 0.5*height;
  sushiTrain.push(new Sushi(random(sushi)));  
  
  // ------ SUMO ------- //
  sumo = new Sumo(width/2, height/2);
  
  // ----- ARMS ----- //
  m = createVector(mouseX, mouseY);
  maxLength = height*0.75/armSegments;
  arm = new Arm(width/2, height, m.x, m.y);
  // for(let i = 0; i < 3; i++){
  //   extraArms.push(new Arm(width/2, height, width/2, height/2));
  // }

  // ------- THOUGHT BUBBLE --------- //
  thoughtBubbleP = createVector(width*0.1, height*0.1);
  thoughtBubble = new ThoughtBubble(thoughtBubbleP.x, thoughtBubbleP.y, 0.25*width, 0.25*height, 30);
  console.log("Loaded thoughtbubble");
  

  // ----- TEXT -------- //
  // textAlign(CENTER, CENTER);
  // textSize(height/10);
  // textFont(font);
  // textLeading(height/15);

  // ------- START ------- //
  music.loop();
  music.setVolume(0.5);
  getNewTargetSushi();
}



// #################### SETUP ####################### //

function setup() {
  console.log("Starting setup");
  pixelDensity(1);
  createCanvas(1080, 1080);
  // createCanvas(min(windowWidth, windowHeight), min(windowWidth, windowHeight));
  // createCanvas(windowWidth, windowHeight);
  console.log("created canvas");
  imageMode(CENTER);
  noCursor();
  describe("Our sumo friend is hungry! Use the tentacle to feed him what he wants but be warned! You touch it, you buy it! 5 strikes and you're out.");

  // font
  font = loadFont("Almost Japanese Comic.ttf", loadingCallback);
  textAlign(CENTER, CENTER);

  // images
  sumoOpen = loadImage("images/SumoOpen.png", loadingCallback);
  sumoClosed = loadImage("images/SumoClosed.png", loadingCallback);
  console.log("loaded sumo images");
  for(let i = 0; i < 9; i++){ sushi.push(loadImage(`images/Sushi${i+1}.png`, loadingCallback)); }
  for(let i = 0; i < 6; i++){ flames.push(loadImage(`images/Fire${i+1}.png`, loadingCallback)); }
  burnedImg = loadImage("images/Burned.png", loadingCallback);
  flamethrower = loadImage("images/flamethrower.png", loadingCallback);
  
  hand = loadImage("images/Hand.png", loadingCallback);
  
  
  // sounds
  soundsCollectPoints = loadSound("sounds/collect-points-190037.mp3", loadingCallback)
  soundsEating = loadSound("sounds/eating-sound-effect-36186.mp3", loadingCallback);
  soundsWrong = loadSound("sounds/wrong-buzzer-6268.mp3", loadingCallback);
  soundsFlamethrower = loadSound("sounds/084303_hq-flamethrower-87072.mp3", loadingCallback);
  
}

// #################### DRAW ####################### //

function draw() {
  background(0);
  setGameText();
  
  if(isLoading || frameCount < startFrame){
    drawLoadingScreen();
    return;
  }

  m.set(mouseX, mouseY);
  cnv.fill(0);
  cnv.rect(0,0,cnv.width, cnv.height);
  
  drawThoughtBubble();
  
  sumo.show();

   // -------- ARM --------- //
   noFill();
   arm.setTarget(m);
   arm.update();
   arm.show();
  //  updateExtraArms();
  
  targetSushi.show();

  for(let s of sushiTrain){
    s.update();
    if(s.p.x > width*1.1) s.moveToBottomRow();
    s.show();
  }

  if(frameCount%newSushiFrame === 0 && frameCount > startFrame){
    sushiTrain.push(new Sushi(random(sushi)));
  }

  // clean up sushiTrain
  for(let i = sushiTrain.length-1; i >= 0; i--){
    if(sushiTrain[i].p.x < -width*1.1) sushiTrain.splice(i,1);
  }

  // ------ FLAME THROWER ------- //;
  // push();
  // translate(width*0.4, mouseY*0.6);
  // image(flamethrower, width/2, height/2, flamethrower.width*0.75, flamethrower.height*0.75);

  // pop();

  // ------- SHOW SCORE --------- //
  fill(255);
  noStroke();
  text(`Score\n${score}`, width/2 - width*0.25, height*0.8);
  // image(burnedImg,width/2 + width*0.1, height*0.8);
  text(`Chances\n${chances}`, width/2 + width*0.25, height*0.8);

  // image(random(flames), width/2, height/2);

  if(chances === 0){
    gameOverScreen();
  }

  
}

// #################### HELPER FUNCTIONS ####################### //

function updateExtraArms(){
  for(let i = 0; i < extraArms.length; i++){
    let x = map(noise(i*1200 + frameCount/armMovementRate),0,1,0,width); 
    let y = map(noise(i*1500 + frameCount/armMovementRate), 0, 1, height, 0.75*height);
    extraArms[i].setTarget(createVector(x,y));
    extraArms[i].update();
    extraArms[i].show();
  }
}

function drawLoadingScreen(){
  background(0);
  stroke(255);
  fill(255);
  textFont('Courier');
  textSize(height/25);
  text(`Pop the sushi into the Sumo's mouth.\n Give him only what he wants.\nWarning: you touch it, you buy it.\n5 strikes and you're out!`, width/2, height/2);
  
  // draw animation
	strokeWeight(4);
	push()
	translate(width / 2, height * 0.75);
		for(let i = 0; i < 8; i++){
			let a = frameCount*TWO_PI/300 + i*TWO_PI/8;
			rotate(a);
      circle(yardstick*0.05, 0, (0.5*(cos(a)+1.1))*height/50);
		}
  pop();


  noFill();
  rect(width*0.1, height*0.85, width*0.8, height*0.1);
  fill(255);
  rect(width*0.1, height*0.85, width*0.8*counter/26, height*0.1);
}

function gameOverScreen(){
  background(0);
  textSize(height/6);
  text("GAME OVER", width/2, height/2-height/30);
  textSize(height/10);
  text(`Final Score: ${score}`, width/2, height/2 + height/15);

}


function mousePressed(){
  if(mouseButton === LEFT){
    for(let s of sushiTrain){
      if(p5.Vector.dist(s.p, m) < yardstick*0.05){
        s.isSelected = true;
      }
    }
  }
}

function mouseDragged(){
  for(let s of sushiTrain){
    if(s.isSelected) s.follow(m);
  }
}

function mouseReleased(){
  for(let i = sushiTrain.length-1; i >= 0; i--){
    if(!sushiTrain[i].isSelected) continue;
    if(sushi.indexOf(sushiTrain[i].sushiImg) === sushi.indexOf(targetSushi.sushiImg) && p5.Vector.dist(sushiTrain[i].p, sumo.mouth) < sumo.threshold){
      score++;
      trainRate *= increaseDifficultyRate;
      newSushiFrame = int(newSushiFrame*(1/increaseDifficultyRate));
      soundsCollectPoints.play();
      soundsEating.play();
    } else{
      chances--;
      soundsWrong.play();
      soundsFlamethrower.play();
    }
    sushiTrain.splice(i,1);
    getNewTargetSushi();
  } 
}


function drawThoughtBubble(){
  cnv.fill(255);
  cnv.circle(width*0.275 + width*0.025*noise(frameCount/bubbleRate + 1000), height*0.2 + height*0.025*noise(frameCount/bubbleRate + 2000), width*0.04);
  cnv.circle(width*0.325 + width*0.0125*noise(frameCount/bubbleRate + 3000), height*0.225 + height*0.0125*noise(frameCount/bubbleRate + 4000), width*0.025);
  cnv.circle(width*0.36 + width*0.00625*noise(frameCount/bubbleRate + 5000), height*0.225 + height*0.00625*noise(frameCount/bubbleRate + 6000), width*0.0125);
  thoughtBubble.update();
  thoughtBubble.show(cnv);
  image(cnv, width/2, height/2);
}

function getNewTargetSushi(){
  targetSushi = new Sushi(new random(sushi));
  targetSushi.p.set(thoughtBubbleP.x, thoughtBubbleP.y);
}

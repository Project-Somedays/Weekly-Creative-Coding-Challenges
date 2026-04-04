/*
| Author          | Project Somedays                      
| Title           | WCCChallenge 2025 Week 49 - Upside Down
| 📅 Started      | 2025-12-07     
| 📅 Completed    | 2025-12-07        
| 🕒 Taken        | 5ish hrs (thanks, Claude!)                   
| 🤯 Concept      | Sidescroller with an upside-down/gravity-bending twist
| 🔎 Focus        | Going for something atmospheric and genuinely fun to play

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/g5J6Ajx9Am

Is shameless rip-off of the google no internet cactus-jumping game
Sound effect: https://pixabay.com/sound-effects/time-travel-83472/
Music: https://pixabay.com/music/ambient-progress-in-space-11756/
Cave sounds: https://pixabay.com/sound-effects/droplets-in-a-cave-6785/
Font: https://www.dafont.com/game-over.font
Death Sound: https://pixabay.com/sound-effects/videogame-death-sound-43894/
Gravity Symbol generated using Nightcafe by me: https://creator.nightcafe.studio/creation/mvEguyn4BnDFaKu95jz0?ru=projectsomedays
Mole Person(?) generated with Nightcafe and spritesheet made in photoshop by me: https://creator.nightcafe.studio/creation/NxplucbTHSjJESjHKay5?ru=projectsomedays
*/

let spritesheet;
let backgroundColour = "#066d8c";
let middleGroundColour = "#032852";
let foregroundColour = "#040f2e";
let stepSize = 5;
let scrollSpeed = -0.4 ;
let threshold = 0.55;
let state = 0;
let a = 0;

let progress = 0;

let gravStrength = 1;
let soundGravShift, soundMusic, soundCave;

let score = 0;
let playFont;
let speedMultiplier = 1;

// FLAGS AND STATES
let gravDown = true;
let flippingGravity = false;
let isInAir = false;
let isMoving = false;
let moveLeft = false;
let instructionMode = true;


let moleman;
let molemanVel;
let hud;

// Layer arrays
let layers = [];

function preload(){
  spritesheet = loadImage("spritesheet.png");
  hud = loadImage("hud.png");
  soundGravShift = loadSound("time-travel-83472.mp3");
  soundMusic = loadSound("progress-in-space-11756.mp3");
  soundCave = loadSound("droplets-in-a-cave-6785.mp3");
  playFont = loadFont("game_over.ttf");
  soundDeath = loadSound("videogame-death-sound-43894.mp3");

}

function setup() {
  createCanvas(windowWidth, 400);
  
  noStroke();
  imageMode(CENTER);
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  textSize(min(width, height)/3);
  textFont(playFont);
  soundMusic.loop();
  soundCave.loop();
  soundGravShift.setVolume(0.1);
  
  
  moleman = createVector(0.5*width, 0.75*height);
  molemanVel = createVector(0, 0);
  // Initialize layers with their configs
  layers = generateLayers(); 

  // Pre-populate each layer with points
  for(let layer of layers) {
    for(let x = 0; x <= width + stepSize; x += stepSize) {
      let y = calculateY(x, layer.offset, layer);
      layer.points.push(y);
      layer.nextX = x + stepSize; // Track where we are in noise space
    }
  }
}

function draw() {
  background("#09a0ab");

  // initial instruction mode (makes the player invincible)
  if(frameCount > 300) instructionMode = false;

  // Update and draw each layer
  for(let layer of layers) {
    updateLayer(layer);
    drawLayer(layer);
  }

  showInstructions();
  

  // Determine if moleman is in the air
  isInAir = gravDown ? moleman.y < 0.75 * height - 1 : moleman.y > 0.25 * height + 1;

  isMoving = keyIsDown(LEFT_ARROW) || keyIsDown(65) || keyIsDown(RIGHT_ARROW) || keyIsDown(68);
  let molemanState;

  if(isInAir) {
    molemanState = 1; // Jump sprite
  } else if(isMoving) {
    // Cycle through walking animation (indices 2, 3, 4, 5)
    if(frameCount % 15 === 0) state = ((state - 2 + 1) % 4) + 2; // cycles 2->3->4->5->2
    molemanState = state;
  } else {
    // Idle animation (indices 0 and 1)
    if(frameCount % 30 === 0) state = (state + 1) % 2; // toggles between 0 and 1
    molemanState = state;
  }

  showMoleman(molemanState); 

  // gravity transition
  if(flippingGravity){
    progress = constrain(progress + 1/30 , 0, 1);
    a = gravDown ? easeInOutElastic(progress) * PI : easeInOutElastic(1 - progress) * PI;
    if(progress >= 1){
      flippingGravity = false;
      gravDown = !gravDown;
    }
  }

  // showing the gravity direction
  image(hud, width - height*0.15, height*0.85, height*0.25, height*0.25);
  showGravDirection(a);

  moveLeft = false;
  // Handle left/right movement
  if(keyIsDown(LEFT_ARROW) || keyIsDown(65)) { // Left arrow or A
    moleman.x -= 3;
    moveLeft = true;
  }
  if(keyIsDown(RIGHT_ARROW) || keyIsDown(68)) { // Right arrow or D
    moleman.x += 3;
  }


  // If not moving horizontally, track with the foreground layer
  if(!isMoving) {
    moleman.x += layers[4].speed; // layers[4] is the foreground top layer
  }

  // Keep moleman on screen
  // moleman.x = constrain(moleman.x, -height * 0.15, width + height * 0.15);
  
  updateMolemanHeight();

  // increase score, obstacle frequency and speed
  if(frameCount%90 === 0) increaseDifficulty();
  
  text(`Score: ${score}`, 0.15*width, 0.9*height);

  if(checkCollision() && !instructionMode) {
  triggerGameOver();
}
  // detect if moleman x is off the screen
  if(moleman.x < -height*0.15) triggerGameOver();
  
      
}






function easeInOutElastic(x){
const c5 = (2 * Math.PI) / 4.5;

return x === 0
  ? 0
  : x === 1
  ? 1
  : x < 0.5
  ? -(Math.pow(2, 20 * x - 10) * Math.sin((20 * x - 11.125) * c5)) / 2
  : (Math.pow(2, -20 * x + 10) * Math.sin((20 * x - 11.125) * c5)) / 2 + 1;
}





/*
| Author          | Project Somedays                      
| Title           | WCCChallenge 2025 Week 34 - Textmode 
| 📅 Started      | 2025-08-31        
| 📅 Completed    | 2025-08-31        
| 🕒 Taken        | ~5hrs                                  
| 🤯 Concept      | Help Arnie get a pump, but move fast before he loses energy    
| 🔎 Focus        | Using a "gauge" class to handle data but then feeding in different displays        

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/S8c7qcjw2b

I'm actually making a p5.js game for work this September! The perks of working in STEM outreach...
I'll use some of this gauge code for sure. 
Might turn to the birb's nest for feedback. I'll put a bit more into it than this though 😂
Also, I like making Arnie noises.
Enjoy.

🎯STRETCH GOALS🎯
- [ ] Easing on increasing pump progress
- [ ] Smoothing out rep progress

*/

let energy, pump, repProgress;
// let debugMode = true;
let debugMode = false;
let arnieL1, arnieL2, arnieL3, arnieL4, arnieL5;
let arnieHead1, arnieHead2, arnieHead3, arnieHead4;
let audio1, audio2,audio3,audio4,audio5,audio6,audio7,audio8;
let bg;
let scl;
let alignMode = false;

let gui, params;
let workoutDepletionRate = 0.00075;
// let workoutDepletionRate = 0.01;
let repDepletionRate;
let resetting = false;
const transitionFrames = 15;
let transitionProgress = 0;
let bgMusic;
let yaySound;

const palette = "#ff3333, #ff8717, #fed402, #02a94f".split(", ");

let sounds;

let currentSound;

let gameOverScreen;
let currentArnieHead;
let imgVictory, imgDefeat;
let victorySound, defeatSound;


function preload(){
  arnieL1 = loadImage("ArnieL1.png");
  arnieL2 = loadImage("ArnieL2.png");
  arnieL3 = loadImage("ArnieL3.png");
  arnieL4 = loadImage("ArnieL4.png");
  arnieL5 = loadImage("ArnieL5.png");
  arnieHead1 = loadImage("ArnieHead1.png");
  arnieHead2 = loadImage("ArnieHead2.png");
  arnieHead3 = loadImage("ArnieHead3.png");
  arnieHead4 = loadImage("ArnieHead4.png");
  audio1 = loadSound("ArnieAudio1.mp3");
  audio2 = loadSound("ArnieAudio2.mp3");
  audio3 = loadSound("ArnieAudio3.mp3");
  audio4 = loadSound("ArnieAudio4.mp3");
  audio5 = loadSound("ArnieAudio5.mp3");
  audio6 = loadSound("ArnieAudio6.mp3");
  audio7 = loadSound("ArnieAudio7.mp3");
  audio8 = loadSound("ArnieAudio8.mp3");
  yaySound = loadSound("yay-6120.mp3");
  imgVictory = loadImage("victory.webp");
  imgDefeat = loadImage("defeat.webp");
  victorySound = loadSound("applause-2-31567.mp3");
  defeatSound = loadSound("crowd-disappointment-reaction-352718.mp3");
  bg = loadImage("3d-grunge-room-interior-with-spotlight-smoky-atmosphere-background.jpg");
  bgMusic = loadSound("gym-sport-gym-workout-music-286244.mp3");
  sounds = [audio1, audio2, audio3, audio4, audio5, audio6, audio7, audio8];
  arnieHeads = [arnieHead1, arnieHead2, arnieHead3, arnieHead4];
  currentArnieHead = arnieHead1;
}

function setup() {
  // createCanvas(windowWidth, windowHeight);
  createCanvas(1080, 1080);
  scl = windowHeight/arnieL1.height;
  energy = new Gauge(width*0.8, height*0.2, min(width, height)/12, min(width, height)/12, 1, dial, "🔋ENERGY🔋");
  repProgress = new Gauge(width*0.55, height*0.2, min(width, height)/12, min(width, height)/12, 0, dial, "🏋️‍♂️REP🏋️‍♂️");
  pump = new Gauge(width*0.175, height*0.5, width*0.05, height*0.8, 0, thermometer, "💪PUMP💪")
  frameRate(30);
  imageMode(CENTER);
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  textSize(50);

  currentSound = audio1;
  currentSound.onended(() => {
    pickAndPlayNewSound();
  });

  params = {
    playSounds : true,
    playMusic: true
    // a: 0,
    // offsetX: 0.435,
    // offsetY: 0.735,
    // pivotX: 0.4,
    // pivotY: 0.75,
    // showLayer1: true,
    // showLayer2: true,
    // showLayer3: true,
    // showLayer4: true,
    // showLayer5: true,
  }
  gui = new lil.GUI();
  gui.add(params, 'playSounds')
  gui.add(params, 'playMusic').onChange(value => {
    if(value){
      bgMusic.loop();
      bgMusic.setVolume(0.5);
    } else{
      bgMusic.stop();
    }
  })
  // gui.add(params, 'a', -PI/3, PI/3, 0.01);
  // gui.add(params, 'offsetX', 0, 1, 0.01);
  // gui.add(params, 'offsetY', 0, 1, 0.01);
  // gui.add(params, 'pivotX', 0, 1, 0.01);
  // gui.add(params, 'pivotY', 0, 1, 0.01);
  // gui.add(params, 'showLayer1');
  // gui.add(params, 'showLayer2');
  // gui.add(params, 'showLayer3');
  // gui.add(params, 'showLayer4');
  // gui.add(params, 'showLayer5');
  // gui.hide();
bgMusic.loop();
bgMusic.setVolume(0.5);

}

function draw() {
  // background(0);
  image(bg, width/2, height/2, width, height);

  // drawArnie
  rotateAboutPoint(arnieL5, width/2, height/2, 0,  0.5, 0.5, scl);
  rotateAboutPoint(arnieL4, width/2, height/2, repProgress.a, 0.6, 0.68, scl);
  rotateAboutPoint(arnieL3, width/2, height/2, 0,  0.5, 0.5, scl);
  rotateAboutPoint(arnieL2, width/2, height/2, 0,  0.5, 0.5, scl);
  // head
  rotateAboutPoint(currentArnieHead, width/2, height/2, 0,  0.5, 0.5, scl);
  // front weight
  rotateAboutPoint(arnieL1, width*0.5, height*0.475 , repProgress.a, 0.375, 0.8, scl);

  // show the pump progress;
  pump.show();

  // slowly deplete overall energy
  if(!resetting) energy.deplete(workoutDepletionRate);
  energy.show();

  // mid rep, play sounds
  if(repProgress._val >= 0.1){
      // if it's not playing and we've waited half a second, play the sound
      if(!currentSound.isPlaying() && frameCount%60==0 && params.playSounds) currentSound.play();
      
  
  }

  // if we manage to complete a rep...
  if(repProgress._val >= 1 && !resetting){
    transitionProgress = 0;
    resetting = true;
    if(debugMode) console.log("Rep complete!");
    pump.boost(0.1);
    yaySound.play(); // audio confirmation
  }

  // during the reset, drop the weights down
  if(resetting){
    transitionProgress += 1/transitionFrames;
    repProgress.override(1-easeInOutBack(transitionProgress));
    repProgress.update();
    if(debugMode) console.log(`transitionProgress ${transitionProgress}`);
    if(transitionProgress >= 1) resetting = false;
  }

  // always be fighting the reps
  if(!resetting){
      // your fatigue slowly fights your reps so... act fast!
    let fatigueLevel = 1 - energy._val;
    repDepletionRate = fatigueLevel/250;
    repProgress.deplete(repDepletionRate);
    repProgress.update();
  }
  // always show rep progress;
  repProgress.show();
  

  if(pump._val >= 1){
    showVictory();
    noLoop();
  }
  
  if(energy._val <= 0){
    showDefeat();
    noLoop();
  }
  

}


function showVictory(){
  image(imgVictory, width/2, height/2, imgVictory.width * height/imgVictory.height, height);
  victorySound.play();

}

function showDefeat(){
  image(imgDefeat, width/2, height/2, imgDefeat.width * height/imgDefeat.height, height );
  defeatSound.play();
}


function mousePressed(){
  // if(debugMode) console.log("Boosting!")
  // if(alignMode) console.log(`x,y = ${(mouseX - width/2)/arnieL1.width*scl}, ${(mouseY - height/2)/arnieL1.width*scl}}`);
  repProgress.boost(0.1);
  repProgress.update(); // calculate a
}


function easeInOutBack(x) {
const c1 = 1.70158;
const c2 = c1 * 1.525;

return x < 0.5
  ? (Math.pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
  : (Math.pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
}

// function windowResized() {
//   resizeCanvas(windowWidth, windowHeight);
//   scl = windowHeight/arnieL1.height;
// }

/**
 * A helper function to rotate an image around a specific pivot point.
 * The pivot point is defined in proportion to the image's width and height.
 * For example, a pivot of (0.5, 0.5) is the center, (0, 0) is the top-left corner.
 *
 * @param {p5.Image} img The image to draw.
 * @param {number} x The x-coordinate where the image will be drawn (its center due to imageMode(CENTER)).
 * @param {number} y The y-coordinate where the image will be drawn.
 * @param {number} angle The rotation angle in radians.
 * @param {number} pivotXRel A value from 0.0 to 1.0 representing the relative x-position of the pivot.
 * @param {number} pivotYRel A value from 0.0 to 1.0 representing the relative y-position of the pivot.
 */
function rotateAboutPoint(img, xPos, yPos, a, pivotXRel, pivotYRel, scl) {
    // Push a new drawing state onto the stack. All transformations are local to this state.
    push();

    // Translate the origin to where the image should centered.
    translate(xPos, yPos)

    // Rotate the entire drawing space by the desired angle.
    
    let pivotXOffset = (pivotXRel - 0.5) * img.width * scl;
    let pivotYOffset = (pivotYRel - 0.5) * img.height * scl;

    translate(pivotXOffset, pivotYOffset);
    rotate(a);
    translate(-pivotXOffset, -pivotYOffset);

    // Draw the image at the pivot's new location.
    // Since we've translated the coordinate system, the image is drawn relative to the new origin.
    image(img, 0, 0, img.width * scl, img.height*scl);

    // Pop the old drawing state from the stack. This resets all transformations.
    pop();
}



function pickAndPlayNewSound() {
  let newSound;
  // Loop to ensure we don't play the same sound twice in a row
  do {
    newSound = random(sounds);
  } while (newSound === currentSound);

  // Update the current sound
  currentSound = newSound;

  // Set the onended event for the new sound
  currentSound.onended(() => {
    pickAndPlayNewSound();
  });

  // Play the new sound
  currentSound.play();
  // if(random() < 0.75) currentArnieHead = random(arnieHeads);
}
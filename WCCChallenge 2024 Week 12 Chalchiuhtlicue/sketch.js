/*
Author: Project Somedays
Date: 2024-03-23
Title: #WCCChallenge - Chalchiuhtlicue (or Mesoamerican design)

I may have slightly given up on some finer points to match my reference image: https://www.google.com/url?sa=i&url=https%3A%2F%2Fcookie-pantheon.fandom.com%2Fwiki%2FChalchiuhtlicue&psig=AOvVaw1Bd5dO3JepVj0MzOWEbgqX&ust=1711242050882000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCLC94caXiYUDFQAAAAAdAAAAABAE
But it made me happy. As did all the iconography I saw.

I also did NOT look into why oompa loompas were... drowning? being birthed? flowing into or out of Chalchiuhtlicue? but I made some choices and I guess I'm sticking with them.

Fabulous music from Pixabay: https://pixabay.com/music/world-magical-ritual-shaman-amazonian-indians-197516/ by Denis-Pavlov-Music

Easing function from https://easings.net/

TODOs for down the line:
  - Head movement
  - Foot tapping
  - Fixing the wobble so it works as it turns the corner - help here? How do I get the sine curve to follow a curve?
  - Linking movement up with the music? A little fft could be fun...
  - Take the time to learn more of Chalchiuhtlicue
*/

let riverCol = "#4197bf"
let parchmentColour = "#c9a379";

// tracking noise things
let noiseZoom = 50;
let t = 0;
let strandN = 8;

// strokeWeight = sets width of strands and scale of everything
let sw;
let wobbleFreq = 5;

let strands = [];
let babyImg1, babyImg2, godImg, upperArm, lowerArm;
let shell, circ;

let babyScale, godscale, shellScale;

let babies = [];
let god;
let music;

function preload(){
  babyImg1 = loadImage("baby1.png");
  babyImg2 = loadImage("baby2.png");
  godImg = loadImage("God.png");
  upperArm = loadImage("UpperArm.png")
  lowerArm = loadImage("LowerArm.png");
  shell = loadImage("Shell.png");
  circ = loadImage("Circle.png");
  music = loadSound("magical-ritual-shaman-amazonian-indians-197516.mp3");
}


function setup() {
  createCanvas(windowWidth, windowHeight);
  sw = height/25;
  pixelDensity(1);
  
  // SETTING THE SCALE OF THE IMAGES
  god = new God(width/4, height/2);
  babyScale = 0.1*width/babyImg1.width;
  godscale = 0.9*height/godImg.height;
  shellScale = 0.05*width/shell.width;
  imageMode(CENTER);


  // make the strands
  for(let i = 0; i < strandN; i++){
    let y = i*sw + 0.9*height/2;
    let dir = i < strandN/2 ? -1 : 1;
    strands.push(new Strand(0, y, 2*width, dir));
  }

  // make the shorter strands that diverge
  for(let i = 8; i > 0; i--){
    let x = i*width/6;
    strands.push(new Strand(x, 0.9*height/2, width/5, -1));
    strands.push(new Strand(x, 0.9*height/2+(strandN-1)*sw, width/5, 1));

  }

  // start the baby train
  for(let i = 0; i < 10; i++){
    birthBaby(width/8 + i * (0.75*width/8), height/2);
  }

  // start the music
  music.loop();
  
  
}

function draw() {
  background(parchmentColour);
  
  for(let s of strands){
    s.update();
    s.show();
  }
  
  for(let b of babies){
    b.update();
    b.show();
  }

  // clean up and replace babies
  for(let i = babies.length - 1; i > 0; i--){
    if(babies[i].p.x > width + 0.5*babyImg1.width*babyScale){
      babies.splice(i,1);
      birthBaby(width/8, height/2);
    }
    
  }
  god.update();
  god.show();
  

  t += 0.01; // tracker for 
}


function birthBaby(x,y){
  let img = random() < 0.5 ? babyImg1 : babyImg2;
  babies.push(new Baby(img, x, y));
}

// using the 
function easeInOutQuint(x) {
  return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;
}


function mousePressed(){
  if(mouseButton === LEFT){
    if(music.isPlaying()) music.stop();
    if(!music.isPlaying()) music.loop();
  }
}




    
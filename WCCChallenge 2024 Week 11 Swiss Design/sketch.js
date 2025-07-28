/*
Author: Project Somedays
Date: 2024-03-11
Title: #WCCChallenge - Swiss Design, hosted by @sableraph on Twitch.tv: https://www.twitch.tv/sableraph

Bauhaus design looks delightfully clean and simple to produce.
To put my own twist on it, I want to poke Walter Gropius, founder of the movement, for more ideas.
Turns out the wikipedia picture ALREADY has him in Charles Xavier power pose for ideas.
Also a good opportunity to learn about masking in p5.js
It also makes me giggle
*/

// image biz
let walter;
let hand;
let handScale;
let walterScale;

// masking
let layer2;
let thoughtBubble;
let globOff = 0;

// tile biz
let s; // tilesize
let palette = ["#F6E2BE", "#323030","#356BB3", "#FBBC2E","#EC3245"];
let grid;

// mouse biz
let mouseinWalterRange = false;
let mousePos;
let fingertip;

// eye biz
let eyes;
let eyeSize;
let eyeSep;

function preload(){
  walter = loadImage("WalterGropius.png");
  hand = loadImage("hand.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);

  //image biz
  handScale = 100/hand.width;
  walterScale = 0.4*height/walter.height;

  // thoughtbubble/masking biz
  setS = () => max(width, height)/random(15, 50);
  s = setS();

  //masking biz  
  layer2 = createGraphics(width, height, P2D);
  layer2.background(0);

  if(width > height){
    thoughtBubble = new ThoughtBubble(width/2, height/2, 0.8*width, 0.6*height, 30);
  } else{
    thoughtBubble = new ThoughtBubble(width/2, height/4, 0.7*width, 0.5*height, 30);
  }
  
  
  // the actual art hahhaa
  grid = new BahausGrid();
  
  // control biz
  mousePos = createVector(mouseX, mouseY);
  fingertip = createVector(mouseX - hand.width*handScale, mouseY);
 
  // eyebiz
  eyeSize = walter.width*walterScale*0.1;
  eyeSep = eyeSize*1.5;
  eyes = new Eyes(walter.width*walterScale*0.52, height - walter.height*walterScale*0.69, radians(5));


  noStroke();
}

function draw() {
  background(255);

  // control biz
  mousePos.set(mouseX, mouseY);
  fingertip.set(mouseX - hand.width*handScale, mouseY);
  mouseInWalterRange = mouseX < walter.width*walterScale && mouseY > height - walter.height*walterScale;
  

  // testRectTile.show();
  grid.show();
  // testCircleTile.show();
  thoughtBubble.update();
  thoughtBubble.show(layer2);  
  showMask();

  // image biz
  image(walter, 0, height - walter.height*walterScale, walter.width*walterScale,walter.height*walterScale);
  drawHand();
  
  
  if(mouseInWalterRange){
    eyes.update();
    eyes.show();
  } 

  globOff += 0.01;
  
}

function showMask(){
  image(layer2, 0, 0);
}

function drawHand(){
  
  if(mouseX < walter.width*walterScale && mouseY > height - walter.height*walterScale){
    push();
    translate(mouseX,mouseY);
    scale(-1,1);
    image(hand, 0, 0, hand.width*handScale, hand.height*handScale);
    pop();
  }

}

function mousePressed(){
  if(mouseButton === LEFT && mouseInWalterRange){
    s = setS();
    grid = new BahausGrid();
  }
}







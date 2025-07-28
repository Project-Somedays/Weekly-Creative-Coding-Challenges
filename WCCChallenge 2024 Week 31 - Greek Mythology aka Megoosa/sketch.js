/*
Author: Project Somedays
Date: 2024-08-04
Title: WCCChallenge 2024 Week 31 - Greek Mythology: Megoosa

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/g5J6Ajx9Am

Historians generally agree that, while Perseus emerged victorious over the Medusa, he swiftly met his demise under the vicious pecks of the Megoosa. 
Should have brought more diversionary bread.

Yay! Another IK project!

OF NOTE:
  - Painted on where I wanted the geesePiece to appear and then shiftted them a bit. Hit 'd' to see it =)

RESOURCES
  - Dan Shiffman's IK with a fixed point tutorial: https://www.youtube.com/watch?v=RTc6i-7N3ms
  - Goose Head: https://commons.wikimedia.org/wiki/File:20090729_Goose_Head.jpg
  - Geese Cackle (royalty free): https://pixabay.com/sound-effects/geese-cackle-31344/
  - Medusa Music (royalty free): https://pixabay.com/sound-effects/thriller-ambient-14563/
  - Bread Art (royalty free): https://www.freepik.com/free-psd/delicious-whole-grain-bread-isolated-transparent-background_82980011.htm#query=bread&position=0&from_view=keyword&track=sph&uuid=532eb070-f644-4b6c-84a0-be527b9349a1
  - Background Art from NightCafe: https://creator.nightcafe.studio/creation/QmjwdJjB9FficH3p22TN

  TO DO:
  - Rotate the head when "eating" the bread
  - Change the rotation point of the head
  - Eat the bread
  - Learn enough Blender to turn it into a 3D-printable magnetic key holder
*/

let hairMaskImg, hairMask;
let bg; 
let mousePos;
let geesePiece = [];
let maskCol;
let gooseThick;
let gooseHead;
let noiseRate = 0.005;
let gooseHeadScl;
let mouseCursor;
let mouseCursorScl;
let gooseSound;
let medusaMusic;
let showMask = false;

function preload(){
  bg = loadImage("MedusaBG.jpg");
  hairMaskImg = loadImage("MedusaHairMask.jpg");
  gooseHead = loadImage("gooseheadOffset.png");
  mouseCursor = loadImage("bread.png");
  gooseSound = loadSound("geese-cackle-31344.mp3");
  medusaMusic = loadSound("thriller-ambient-14563.mp3");
}

function setup() {
  // createCanvas(min(windowWidth, windowHeight), min(windowWidth, windowHeight));
  createCanvas(1080, 1080);
  mousePos = createVector(mouseX, mouseY);
  imageMode(CENTER);
  noFill();
  noCursor();

  mouseCursorScl = 0.1*width/mouseCursor.width;

  hairMask = createGraphics(width, height);
  hairMask.image(hairMaskImg, 0, 0,width,height);
  maskCol = color(0,179,75);

  gooseThick = width/50;
  gooseHeadScl = 0.05*height/gooseHead.height;

  gooseSound.loop();
  medusaMusic.loop();


  // fill mask with geese
  for(let y = gooseThick/2; y < height; y+= gooseThick){
    for(let x = gooseThick/2; x < width; x+= gooseThick){
      if(hairMask.get(x,y)[0] === red(maskCol) && hairMask.get(x,y)[1] === green(maskCol) && hairMask.get(x,y)[2] === blue(maskCol)){
        geesePiece.push({
          goose: new Goose(20, width/100, mouseX, mouseY, color(200, 200, 200), gooseThick, x + random(-gooseThick/4, gooseThick/4), y + random(-gooseThick/4, gooseThick/4)),
          xOff: random(1000),
          yOff: random(1000)
        })
      }
    }
  }
}

function draw() {
  background(0);
  mousePos.set(mouseX, mouseY);
  image(bg, width/2, height/2, width, height);

  // show bread
  image(mouseCursor, mousePos.x, mousePos.y, mouseCursor.width*mouseCursorScl, mouseCursor.height*mouseCursorScl);

  // move gooseheads around, either randomly or after the bread/mouse
  for(let g of geesePiece){
    let targetX;
    let targetY; 
    let endAndAngle = g.goose.getEndPosAndAngle();
    if(p5.Vector.dist(endAndAngle.endPos, mousePos) < width/8){
      targetX = mousePos.x;
      targetY = mousePos.y;
    } else{
      targetX = g.goose.anchor.x + map(noise(frameCount*noiseRate + g.xOff), 0, 1, -width/4, width/4);
      targetY = g.goose.anchor.y + map(noise(frameCount*noiseRate + g.yOff), 0, 1, -width/4, width/4);
    }
    
    g.goose.update(targetX, targetY);
    g.goose.show();
    push();
      translate(endAndAngle.endPos.x, endAndAngle.endPos.y);
      if(mousePos.x > endAndAngle.endPos.x) scale(-1,1);    
      image(gooseHead, 0, 0, gooseHead.width*gooseHeadScl, gooseHead.height*gooseHeadScl);
    pop();
  }

  if(showMask) image(hairMask,width/2, height/2, width, height);

}

function keyPressed(){
  switch(key.toLowerCase()){
    case ' ':
      if(gooseSound.isPlaying()){
        gooseSound.stop();
        medusaMusic.stop();
      } else{
        gooseSound.loop();
        medusaMusic.loop();
      }
      break;
    case 'd':
      showMask = !showMask;
      break;
    default:
      break;
  }
}


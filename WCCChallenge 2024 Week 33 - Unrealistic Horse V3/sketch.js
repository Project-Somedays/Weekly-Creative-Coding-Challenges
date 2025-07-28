/*

RESOURCES - All Royalty-Free
- Horse Base Art
- African Animals: https://www.freepik.com/free-vector/flat-set-african-animals_1229177.htm#fromView=search&page=1&position=29&uuid=e97109f3-2fa1-4eb1-bb83-70bff760b436
- Mythical Creatures 1: https://www.freepik.com/free-vector/mythical-creatures-characters-set-flying-lion-cyclops-griffin-centaur-mermaid-cerberus-greek-mythology-fantasy-legend-culture-literature_10173243.htm#fromView=search&page=1&position=2&uuid=1bbb12c0-2d10-4df5-b260-94a316116499
- Centaur: https://www.freepik.com/free-vector/centaur-concept-illustration_13955760.htm#fromView=search&page=1&position=1&uuid=1bbb12c0-2d10-4df5-b260-94a316116499
- Ostrich: https://www.freepik.com/free-vector/struisvogel-vector-antique-watercolor-animal-illustration-remixed-from-artworks-by-robert-jacob-gordon_16347733.htm#fromView=search&page=1&position=10&uuid=20f8fc64-2bff-4738-98bf-b93edeef583b
- Horseshoes: https://www.freepik.com/free-vector/random-female-shoes-flat-illustrations-set-summer-autumn-winter-foot-wear-women-moccasins-boots-trainers-heels-isolated-white_20827876.htm#fromView=search&page=1&position=0&uuid=3bd08f09-f5ef-42c6-8559-3b95211cc88d
- Rooster Tail: https://www.freepik.com/free-vector/colorful-realistic-rooster_3799748.htm#fromView=search&page=1&position=2&uuid=b6590218-e2c4-43d0-9c5b-960c37a5d152
- Scorpion Tail: https://www.freepik.com/free-vector/scorpion_2450629.htm#fromView=search&page=1&position=32&uuid=e7100faf-4c6c-4a86-a418-8600db07ad1c
- Stegasaurus Tail: https://www.freepik.com/free-vector/set-cute-stegosaurus-dinosaur-cartoon-characters_28881386.htm#fromView=search&page=1&position=8&uuid=8a868e48-3ad5-4cff-81e2-0c3bba2d33b4
- Eagle Head: https://www.freepik.com/free-vector/eagle-badge_800868.htm#fromView=search&page=1&position=38&uuid=0e9402dd-7eb9-4c9a-8f25-32e37f2b96e4
- Machine Background: 
*/

let baseBody;
let top1, top2, top3, top4, top5, top6, top7;
let tail1, tail2, tail3, tail4;
let shoe1, shoe2;
let farbackleg, nearbackleg, nearforeleg, farforeleg;
let posData;
let bg;

let tailArm;
let topArm;
let maxLength;
let armSegments;

const cycleRate = 150.0;

let tops, tails, shoes, legs;

let targetData;

let currentTail;
let currentTop;
let tailPos;
let topPos; 

let topPosStart;
let topPosEnd;
let tailPosStart;
let tailPosEnd;

let cycleProgress = 0;

function preload(){
  top1 = loadImage("Top1.png");
  top2 = loadImage("Top2.png");
  top3 = loadImage("Top3.png");
  top4 = loadImage("Top4.png");
  top5 = loadImage("Top5.png");
  top6 = loadImage("Top6.png");
  top7 = loadImage("Top7.png");
  top8 = loadImage("Top8.png");
  farbackleg = loadImage("FarBackLeg1.png");
  farforeleg = loadImage("FarForeLeg1.png");
  nearbackleg = loadImage("NearBackLeg1.png");
  nearforeleg = loadImage("NearForeleg1.png");
  tail1 = loadImage("Tail1.png");
  tail2 = loadImage("Tail2.png");
  tail3 = loadImage("Tail3.png");
  tail4 = loadImage("Tail4.png");
  shoe1 = loadImage("Shoe1.png");
  shoe2 = loadImage("Shoe2.png");
  bg = loadImage("BG.png");
  baseBody = loadImage("BaseBody.png");

}

function setup() {
  // createCanvas(windowWidth, windowHeight);
  createCanvas(3200, 1796);
  
  imageMode(CENTER);
  textSize(50);

  tailPosStart = createVector(-width/4, -height/4);
  tailPosEnd = createVector(-width/4, 5*height/4);
  topPosStart = createVector(5*width/4, -height/4);
  topPosEnd = createVector(5*width/4, 5*height/4);

  maxLength = width/25;
  armSegments = 25;
  tailArm = new Arm(0.25*width,height/2,0,0);
  topArm = new Arm(0.75*width, height/2, width, 0);

  

  
  drawHorse = [
    {img: farforeleg, target: createVector(0.5875*width, 0.6915367483296214*height)},
    {img: farbackleg, target: createVector(0.4325*width, 0.6748329621380846*height)},
    {img: baseBody, target: createVector(width/2, height/2)},
    {img: nearbackleg, target: createVector(0.425*width, 0.6230512249443207*height)},
    {img: nearforeleg, target: createVector(0.5753125*width, 0.6748329621380846*height)}
  ]

  

  tops = [
    {img: top1, target: createVector(0.6090625*width, 0.3674832962138085*height)},
    {img: top2, target: createVector(0.5028125*width, 0.23719376391982183*height)},
    {img: top3, target: createVector(0.6265625*width, 0.38474387527839643*height)},
    {img: top4, target: createVector(0.634375*width, 0.2572383073496659*height)},
    {img: top5, target: createVector(0.5990625*width, 0.33184855233853006*height)},
    {img: top6, target: createVector(0.615625*width, 0.47438752783964366*height)},
    {img: top7, target: createVector(0.61*width, 0.48329621380846327*height)},
    {img: top8, target: createVector(0.5815625*width, 0.38752783964365256*height)}
  ]

  tails = [
    {img: tail1, target: createVector(0.37*width, 0.594097995545657*height)},
    {img: tail2, target: createVector(0.3115625*width, 0.3741648106904232*height)},
    {img: tail3, target: createVector(0.4253125*width, 0.2806236080178174*height)},
    {img: tail4, target: createVector(0.3278125*width, 0.5055679287305123*height)},
  ]

  chooseRandomTopandTail();
}

function draw() {
  background(0);
  image(bg, width/2, height/2, bg.width*1.25, bg.height*1.25);

  showBaseBody();

  if(frameCount%cycleRate === 0) chooseRandomTopandTail();
  
  

  // cycleProgress = 0.5*(sin(TWO_PI *(frameCount%cycleRate)/cycleRate)+1);
  cycleProgress = (frameCount%cycleRate)/cycleRate;

  if(cycleProgress < 0.5){
    tailPos = p5.Vector.lerp(tailPosStart, currentTail.target, constrain(6*cycleProgress,0,1));
    topPos = p5.Vector.lerp(topPosStart, currentTop.target,constrain(6*cycleProgress,0,1));
    
  } else{
    tailPos = p5.Vector.lerp(currentTail.target, tailPosEnd, constrain(6*(cycleProgress - 0.5), 0, 1));
    topPos = p5.Vector.lerp(currentTop.target, topPosEnd, constrain(6*(cycleProgress - 0.5),0, 1));
  }
  

  
  
  // image(farbackleg, mouseX, mouseY);
  tailArm.setTarget(tailPos);
  tailArm.update();
  tailArm.show();

  topArm.setTarget(topPos);
  topArm.update();
  topArm.show();


  image(currentTail.img, tailPos.x, tailPos.y);
  image(currentTop.img, topPos.x, topPos.y);
  

  // for locating
  // posData = `(${mouseX/width}*width, ${mouseY/height}*height)`;
  // text(posData, mouseX, mouseY);
}

function showBaseBody(){
  for(let horseBit of drawHorse){
    image(horseBit.img, horseBit.target.x, horseBit.target.y);
  }
}

function chooseRandomTopandTail(){
  currentTail = random(tails);
  currentTop = random(tops);
}

// for copying positions
function mousePressed(){
  navigator.clipboard.writeText(`createVector${posData}`);
  // navigator.clipboard.writeText(`${width}, ${height}`);
}



// function windowResized() {
//   resizeCanvas(windowWidth, windowHeight);
// }


let moledrill, moledrillImg;
let display, readout;
let fuel, laser, oil;
let a;
let vel, p;
let fg, bg;
let stats = {
  fuel: 100,
  temp: 0,
  laser: 100
}

let powerUpBoost = 25;


function preload(){
  function loadWithFeedback(fn, title){
    return loadImage(fn, () => console.log(`${title} loaded!`), () => console.log(`Uh oh. Problem loading ${title}`));
  }
  moledrillImg = loadWithFeedback("Mole.png", "Moledrill");
  display = loadWithFeedback("Display.png", "Display");
  readout = loadWithFeedback("DisplayLevels.png", "Display Levels");
  fuel = loadWithFeedback("Fuel.png", "Fuel");
  laser = loadWithFeedback("LaserGem.png", "Fuel");
  oil = loadWithFeedback("Oil.png", "Fuel");
  
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);
  a = HALF_PI;

  moledrill = new MoleDrill();
  fg = createGraphics(width, height);
  fg.background("#755031");
  bg = createGraphics(width, height);
  bg.background("#543227");
}

function draw() {
  background(220);

  //update stats every X frames
  updateStats(90);

  image(bg, width/2, height/2);
  image(fg, width/2, height/2);
  
  showDisplay();

  if(keyIsDown(LEFT_ARROW)) a -= HALF_PI/60;
  if(keyIsDown(RIGHT_ARROW)) a += HALF_PI/60;

  moledrill.update();
  moledrill.show();
}

function showDisplay(){
  push();
  translate(0.1 * height, 0.1 * height);
  
  // Draw base display
  image(display, 0, 0, 0.2*height, 0.2*height);
  
  // Create readout graphic
  let readoutImg = createGraphics(0.2*height, 0.2*height);
  readoutImg.imageMode(CENTER);
  readoutImg.image(readout, readoutImg.width/2, readoutImg.height/2, 0.2*height, 0.2*height);
  
  // Erase portions based on stats
  readoutImg.erase();
  
  // Fuel bar - erase from right to left as fuel depletes
  drawStatBar(readoutImg, stats.fuel, 0.35, true);
  
  // Temperature bar - erase from left to right, revealing as temp increases
  drawStatBar(readoutImg, stats.temp, 0.6, false);
  
  // Laser bar - erase from right to left as laser depletes
  drawStatBar(readoutImg, stats.laser, 0.8, true);
  
  readoutImg.noErase();
  
  // Draw the modified readout
  image(readoutImg, 0, 0);
  
  pop();
}

// Helper function to draw stat bars
// stat: value from 0-100
// yPos: vertical position as fraction of height (0-1)
// eraseRight: if true, erase from right (depleting), if false erase from left (revealing)
function drawStatBar(graphic, stat, yPos, eraseRight){
  let w = graphic.width;
  let h = graphic.height;
  let barHeight = h * 0.08; // Height of each bar
  let barWidth = w * 0.8;   // Width of the bar area
  let barLeft = w * 0.1;    // Left edge of bar
  
  if(eraseRight){
    // Erase from the right - for depleting resources (fuel, laser)
    let eraseWidth = barWidth * (1 - stat/100);
    let eraseX = barLeft + barWidth - eraseWidth;
    graphic.rect(eraseX, h * yPos - barHeight/2, eraseWidth, barHeight);
  } else {
    // Erase from right side, moving rightward - for increasing values (temperature)
    // Start erasing at the right edge, move the erase area further right as stat increases
    let eraseWidth = barWidth * (1 - stat/100);
    let eraseX = barLeft + barWidth * (stat/100); // Start position moves right as stat increases
    graphic.rect(eraseX, h * yPos - barHeight/2, eraseWidth, barHeight);
  }
}

class MoleDrill{
  constructor(){
    this.p = createVector(width/2, 0);
    this.v = createVector(0, -1);
  }

  update(){
    let dv = p5.Vector.fromAngle(a);
    this.v.add(dv).normalize();
    this.p.add(this.v);
  }

  show(){
    push();
    translate(this.p.x, this.p.y);
    translate(0, 100);
    rotate(a - HALF_PI);
    translate(0, -100);
    image(moledrillImg, 0, 0, 100, 100);
    pop();

    fg.push();
    fg.translate(this.p.x, this.p.y);
    fg.translate(0, 100);  // Add this line - match the image transform
    fg.rotate(a - HALF_PI);
    fg.translate(0, -100);  // Add this line - match the image transform
    fg.erase();
      fg.circle(0, 0, 40);
    fg.noErase();
    fg.pop();
    
  }
}

function updateStats(x){
  if(frameCount % x !== 0) return

  stats.fuel -= 2;
  stats.temp += 2;
  stats.laser -= 2;
}

function boostStat(stat, amt){
  stats[stat] = (constrain(stats[start + amt], 0, 100));
}
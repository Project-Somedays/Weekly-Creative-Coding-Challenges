let snowman;
const cycleFrames = 180;
let currentFrame;
let progress = 0;
let hatStyle, hatPattern, hatBaseColor, hatPatternColor;
let leftArmParams, rightArmParams;
let noseAngle;
let arms = [];
const armSegments = 6;
let maxLength;
let wreathGraphic;

let frameCnv;

function getHatSettings(){
  hatStyle = random() > 0.5 ? 'winter' : 'top';
  hatPattern = random(['stripes', 'dots', 'zigzag']);
  hatBaseColor = random(['#e63946', '#2a9d8f', '#457b9d', '#6d597a']);
  hatPatternColor = '#ffffff';
}

function generateArmSettings(){
  // Generate random arm parameters once
  leftArmParams = {
    mainAngleOffset: random(-PI/12, PI/12),
    branch1AngleOffset: random(-PI/6, PI/6),
    branch2AngleOffset: random(-PI/6, PI/6)
  };
  
  rightArmParams = {
    mainAngleOffset: random(-PI/12, PI/12),
    branch1AngleOffset: random(-PI/6, PI/6),
    branch2AngleOffset: random(-PI/6, PI/6)
  };
}

function drawHollyWreath(x, y, size) {
  if (!wreathGraphic) {
    createHollyWreathGraphic(size);
  }
  image(wreathGraphic, x - size * 0.6, y - size * 0.6);
}

function setup() {
  createCanvas(min(windowWidth, windowHeight), min(windowWidth, windowHeight));
  snowman = new Snowman(width/2, height/2);
  currentFrame = frameCount%cycleFrames;
  noStroke();
  getHatSettings();
  generateArmSettings();
  noseAngle = random(-PI/6, PI/6);
  frameCnv = makeFrame();
  maxLength = 0.5*width/armSegments;
  wreathGraphic = createHollyWreathGraphic(width);

   // left arm
   snowman.loadBit(
    new SnowmanBit(
      createVector(width, width),
      createVector(-width/8, 0),
      color('#654321'),
      0,
      easeInOutSine,
      leftArm
    )
  )

  // right arm
  snowman.loadBit(
    new SnowmanBit(
      createVector(width, width),
      createVector(width/8, 0),
      color('#654321'),
      0,
      easeInOutSine,
      rightArm
    )
  )

  let lowerBody = new SnowmanBit(
    createVector(0, height),
    createVector(0, height/4),
    color(255),
    0,
    easeInOutSine,
    () => circle(0,0, height/3)
  );

  let middleBody = new SnowmanBit(
    createVector(-width,0),
    createVector(0, 0),
    color(255),
    0,
    easeInOutSine,
    () => circle(0,0, height/4)
  );

  let head = new SnowmanBit(
    createVector(0, -height),
    createVector(0, -height/5),
    color(255),
    0,
    easeInOutSine,
    () => circle(0,0, height/5)
  );
  
  let carrot = new SnowmanBit(
    createVector(width, 0),
    createVector(0, -height/5),
    color("#FFA500"),
    0,
    easeInOutSine,
    () => {
      push();
      rotate(noseAngle);
      triangle(0, height/50, width/10, 0, 0, -height/50)
      pop();
    }
  );


  snowman.loadBit(lowerBody);
  snowman.loadBit(middleBody);
  snowman.loadBit(head);
  snowman.loadBit(carrot);

  // buttons
  for(let i = 0; i < 3; i++){
    let button = new SnowmanBit(
      createVector(width/2, 0),
      createVector(0, -height/20 + i*height/20),
      color(0),
      0,
      easeInOutSine,
      () => circle(0,0,width/40)
    )
    snowman.loadBit(button);
  }

  // eyes
  for(let i = 0; i < 2; i++){
    let button = new SnowmanBit(
      createVector(width/2, 0),
      createVector(-width/30 + i * 2 * width/30, -1.2*height/5),
      color(0),
      0,
      easeInOutSine,
      () => circle(0,0,width/40)
    )
    snowman.loadBit(button);
  }

  // mouth

  for(let i = 0; i < 5; i++){
    let a = PI/3 + i * PI/8;
    let c = createVector(0,-height/5);
    let r = height/20;
    let button = new SnowmanBit(
      createVector(width/2, 0),
      createVector(c.x + r*cos(a), c.y + r*sin(a)),
      color(0),
      0,
      easeInOutSine,
      () => circle(0,0,width/50)
    )
    snowman.loadBit(button);
  }

  // arms

  for(let i = 0; i < snowman.bits.length; i++){
    let a = i * TWO_PI/(snowman.bits.length);
    let basePos = createVector(0.525*width*cos(a) + width/2, 0.525*width*sin(a) + height/2);
    arms[i] = new Arm(0.5*width*cos(a) + width/2, 0.5*width*sin(a) + height/2, basePos, basePos);
  }

 

  // // hat
  // snowman.loadBit(
  //   new SnowmanBit(
  //     createVector(0, -height),
  //     createVector(0,-height/4),
  //     color(255),
  //     0,
  //     easeInOutSine,
  //     makeHat
  //   )
  // )





  
}

function trackArmsToParts(){
  for(let i = 0; i < snowman.bits.length; i++){
    let remappedTarget = p5.Vector.add(snowman.p, snowman.bits[i].pos);
    arms[i].setTarget(remappedTarget);
    arms[i].update();
    arms[i].show();
  }
}


function draw() {
  background(0);
  generateSnowscape();

  
  currentFrame = frameCount%cycleFrames;
  progress = currentFrame/cycleFrames;
  if(currentFrame === 0){
    // getHatSettings();
    generateArmSettings();
    noseAngle = random(-PI/6, PI/6);

  }

  snowman.update();
  trackArmsToParts();
  
  snowman.show();

  drawHollyWreath(width/2, height/2, width);

}

class SnowmanBit{
  constructor(origin, target, colour, offsetFrames, easingFn, showFn){
    this.origin = origin.copy();
    this.target = target.copy();
    this.colour = colour;
    this.offsetFrames = offsetFrames;
    this.easingFn = easingFn;
    this.showFn = showFn;
  }

  update(){
    this.progress = constrain(progress*1.5, 0, 1)
    this.pos = p5.Vector.lerp(this.origin, this.target, this.easingFn(this.progress));
  }

  show(){
    fill(this.colour);
    push();
    translate(this.pos.x, this.pos.y);
    this.showFn();
    pop();
  }
}

class Snowman{
  constructor(x, y){
    this.p = createVector(x,y);
    this.bits = [];
  }

  loadBit(bit){
    this.bits.push(bit);
  }

  update(){
    for(let bit of this.bits){
      bit.update();
    }
  }

  show(){
    push();
    translate(this.p.x, this.p.y);
    for(let bit of this.bits){
      bit.show();
    }
    pop();
    
  }
}

const easeInOutSine = (x) => -(cos(PI * x) - 1) / 2;

function generateSnowmanArm(isRight, armParams) {
  // Destructure the parameters with defaults
  const mainAngleOffset = armParams.mainAngleOffset;
  const branch1AngleOffset = armParams.branch1AngleOffset;
  const branch2AngleOffset = armParams.branch2AngleOffset;
  
  // Scale measurements based on screen width
  const mainLength = width * 0.15;
  const branchLength = width * 0.07;
  
  // Base angles plus the stored random variations
  const mainAngle = (isRight ? -PI/4 : PI/4) + mainAngleOffset;
  const branch1Angle = mainAngle + (isRight ? 1 : -1) * (PI/3 + branch1AngleOffset);
  const branch2Angle = mainAngle + (isRight ? 1 : -1) * (PI/2 + branch2AngleOffset);
  
  const branch1Start = mainLength * 0.6;
  const branch2Start = mainLength * 0.4;
  
  push();
  scale(isRight ? 1 : -1);
  strokeWeight(width * 0.008);
  stroke(101, 67, 33);
  
  // Draw main branch
  line(0, 0, cos(mainAngle) * mainLength, sin(mainAngle) * mainLength);
  
  // Draw first branch
  const branch1X = cos(mainAngle) * branch1Start;
  const branch1Y = sin(mainAngle) * branch1Start;
  push();
  translate(branch1X, branch1Y);
  line(0, 0, cos(branch1Angle) * branchLength, sin(branch1Angle) * branchLength);
  pop();
  
  // Draw second branch
  const branch2X = cos(mainAngle) * branch2Start;
  const branch2Y = sin(mainAngle) * branch2Start;
  push();
  translate(branch2X, branch2Y);
  line(0, 0, cos(branch2Angle) * branchLength, sin(branch2Angle) * branchLength);
  pop();
  
  pop();
}

const rightArm = () => generateSnowmanArm(true, rightArmParams);
const leftArm = () => generateSnowmanArm(false, leftArmParams);

function generateHat(style = 'winter', patternType = 'stripes', baseColor = '#2a9d8f', patternColor = '#ffffff') {
  const hatWidth = width * 0.2;
  const hatHeight = style === 'top' ? width * 0.2 : width * 0.15;
  const brimHeight = style === 'top' ? width * 0.05 : width * 0.03;
  
  let patternCanvas = createGraphics(hatWidth, hatHeight + brimHeight);
  let maskCanvas = createGraphics(hatWidth, hatHeight + brimHeight);
  
  // Draw the hat shape mask
  maskCanvas.noStroke();
  maskCanvas.fill(255);
  
  if (style === 'top') {
    // Top hat shape
    maskCanvas.rect(hatWidth * 0.1, hatHeight * 0.2, hatWidth * 0.8, hatHeight); // Main cylinder
    maskCanvas.rect(0, 0.8*hatHeight, hatWidth, brimHeight); // Brim
  } else {
    // Winter hat shape
    maskCanvas.beginShape();
    maskCanvas.vertex(0, hatHeight);
    maskCanvas.bezierVertex(
      0, hatHeight,
      hatWidth/2, hatHeight + brimHeight/2,
      hatWidth, hatHeight
    );
    maskCanvas.vertex(hatWidth, 0);
    maskCanvas.vertex(0, 0);
    maskCanvas.endShape(CLOSE);
  }
  
  // Generate pattern
  patternCanvas.background(baseColor);
  patternCanvas.noStroke();
  patternCanvas.fill(patternColor);
  
  switch(patternType) {
    case 'stripes':
      const stripeWidth = hatWidth * 0.1;
      for(let x = 0; x < hatWidth; x += stripeWidth * 2) {
        patternCanvas.rect(x, 0, stripeWidth, hatHeight + brimHeight);
      }
      break;
      
    case 'dots':
      const dotSize = hatWidth * 0.05;
      for(let x = dotSize; x < hatWidth; x += dotSize * 2) {
        for(let y = dotSize; y < hatHeight + brimHeight; y += dotSize * 2) {
          patternCanvas.circle(x, y, dotSize);
        }
      }
      break;
      
    case 'zigzag':
      patternCanvas.beginShape();
      const zigs = 8;
      const zigHeight = hatHeight * 0.2;
      for(let i = 0; i <= zigs; i++) {
        const x = (hatWidth / zigs) * i;
        const y = (i % 2) * zigHeight;
        patternCanvas.vertex(x, y);
      }
      patternCanvas.vertex(hatWidth, hatHeight + brimHeight);
      patternCanvas.vertex(0, hatHeight + brimHeight);
      patternCanvas.endShape(CLOSE);
      break;
  }
  
  // Apply mask
  patternCanvas.loadPixels();
  maskCanvas.loadPixels();
  
  for(let i = 0; i < patternCanvas.pixels.length; i += 4) {
    const maskAlpha = maskCanvas.pixels[i + 3];
    patternCanvas.pixels[i + 3] = maskAlpha;
  }
  
  patternCanvas.updatePixels();
  
  // Draw final hat
  push();
  translate(-hatWidth/2, -hatHeight); // Center at 0,0
  
  // Draw shadow for depth
  fill(0, 30);
  noStroke();
  if (style === 'top') {
    rect(hatWidth * 0.15, hatHeight * 0.25, hatWidth * 0.7, hatHeight * 0.9);
    rect(hatWidth * 0.05, hatHeight * 0.25, hatWidth * 0.9, brimHeight);
  } else {
    beginShape();
    vertex(hatWidth * 0.1, hatHeight);
    bezierVertex(
      hatWidth * 0.1, hatHeight,
      hatWidth/2, hatHeight + brimHeight/2,
      hatWidth * 0.9, hatHeight
    );
    vertex(hatWidth * 0.9, hatHeight * 0.1);
    vertex(hatWidth * 0.1, hatHeight * 0.1);
    endShape(CLOSE);
  }
  
  // Draw the hat pattern
  image(patternCanvas, 0, 0);
  
  // Add pom-pom if winter hat
  if (style !== 'top') {
    const pomSize = width * 0.04;
    fill(255);
    noStroke();
    circle(hatWidth/2, 0, pomSize);
  }
  
  pop();
}

const makeHat = () => generateHat(hatStyle, hatPattern, hatBaseColor, hatPatternColor);


function generateSnowscape() {
  // Color palette
  const skyColor = color(200, 215, 235);
  const snowColors = [
    color(255, 255, 255),     // Pure white
    color(240, 245, 255),     // Slight blue tint
    color(245, 245, 250)      // Very light gray
  ];
  
  // Draw sky gradient
  background(skyColor);
  
  // Generate 3 layers of hills with different heights and positions
  const layers = 3;
  const points = 8; // Control points per hill
  
  // Store hill points so we can reuse them each frame
  if (!window.hillPoints) {
    window.hillPoints = [];
    
    for(let l = 0; l < layers; l++) {
      let layerPoints = [];
      const baseHeight = map(l, 0, layers-1, height * 0.4, height * 0.7);
      const variance = map(l, 0, layers-1, height * 0.1, height * 0.05);
      
      // Generate control points for this hill
      for(let i = 0; i <= points; i++) {
        const x = map(i, 0, points, -width * 0.2, width * 1.2);
        const y = baseHeight + random(-variance, variance);
        layerPoints.push({x, y});
      }
      window.hillPoints.push(layerPoints);
    }
  }
  
  // Draw the hills
  noStroke();
  for(let l = 0; l < layers; l++) {
    fill(snowColors[l % snowColors.length]);
    beginShape();
    
    // Start below the screen
    vertex(-width * 0.2, height);
    
    // Draw the hill curve
    const points = window.hillPoints[l];
    curveVertex(points[0].x, points[0].y);
    for(let p of points) {
      curveVertex(p.x, p.y);
    }
    curveVertex(points[points.length-1].x, points[points.length-1].y);
    
    // Complete the shape
    vertex(width * 1.2, height);
    endShape(CLOSE);
    
    // Add subtle texture to each layer
    drawSnowTexture(l);
  }
}

function drawSnowTexture(layer) {
  // Add subtle dots for snow texture
  push();
  noStroke();
  fill(255, 10); // Very transparent white
  
  // Use consistent random seed for stable texture
  randomSeed(layer * 1000);
  
  const dotCount = 200;
  const baseY = map(layer, 0, 2, height * 0.4, height * 0.7);
  
  for(let i = 0; i < dotCount; i++) {
    const x = random(width);
    const y = random(baseY, height);
    const size = random(2, 4);
    circle(x, y, size);
  }
  pop();
}

function makeFrame(){
	let frameCnv = createGraphics(width, width);
	
	
	frameCnv.strokeWeight(width/10);
	frameCnv.stroke(25);
	frameCnv.noFill();
	frameCnv.circle(width/2, height/2, width);
	frameCnv.stroke(50);
	frameCnv.strokeWeight(width/80);
	frameCnv.circle(width/2, height/2, width + width/10);
	frameCnv.circle(width/2, height/2, width - width/10);
	return frameCnv;
}

function createHollyWreathGraphic(size) {
  // Create the graphic if it doesn't exist
  if (!wreathGraphic) {
    wreathGraphic = createGraphics(size * 1.2, size * 1.2);
    
    // Draw the wreath on the graphic
    wreathGraphic.push();
    wreathGraphic.translate(size * 0.6, size * 0.6);  // Center in the graphic
    
    const leafCount = 24;
    const berryCount = 12;
    const ringRadius = size * 0.5;
    
    // Base ring
    wreathGraphic.noFill();
    wreathGraphic.strokeWeight(size * 0.15);
    wreathGraphic.stroke(25, 55, 25);
    wreathGraphic.circle(0, 0, ringRadius * 2);
    
    // Draw leaves
    for(let i = 0; i < leafCount; i++) {
      const angle = (TWO_PI / leafCount) * i;
      wreathGraphic.push();
      wreathGraphic.rotate(angle);
      wreathGraphic.translate(ringRadius, 0);
      
      // Draw leaf pair
      wreathGraphic.fill(40, 100, 40);
      wreathGraphic.noStroke();
      
      // Left leaf
      wreathGraphic.push();
      wreathGraphic.rotate(-PI/4);
      wreathGraphic.beginShape();
      wreathGraphic.vertex(0, 0);
      // Main leaf shape with increased thickness
      wreathGraphic.bezierVertex(
        size * 0.15, -size * 0.08,
        size * 0.25, -size * 0.04,
        size * 0.3, -size * 0.15
      );
      // Spiky points on top edge
      wreathGraphic.vertex(size * 0.25, -size * 0.1);
      wreathGraphic.vertex(size * 0.28, -size * 0.15);
      wreathGraphic.vertex(size * 0.23, -size * 0.09);
      wreathGraphic.vertex(size * 0.25, -size * 0.14);
      wreathGraphic.vertex(size * 0.2, -size * 0.08);
      wreathGraphic.vertex(size * 0.22, -size * 0.12);
      wreathGraphic.vertex(size * 0.17, -size * 0.07);
      // Return to base with thicker curve
      wreathGraphic.bezierVertex(
        size * 0.15, -size * 0.04,
        size * 0.08, size * 0.02,
        0, 0
      );
      wreathGraphic.endShape();
      wreathGraphic.pop();
      
      // Right leaf
      wreathGraphic.push();
      wreathGraphic.rotate(PI/4);
      wreathGraphic.beginShape();
      wreathGraphic.vertex(0, 0);
      // Main leaf shape with increased thickness
      wreathGraphic.bezierVertex(
        size * 0.15, size * 0.08,
        size * 0.25, size * 0.04,
        size * 0.3, size * 0.15
      );
      // Spiky points on bottom edge
      wreathGraphic.vertex(size * 0.25, size * 0.1);
      wreathGraphic.vertex(size * 0.28, size * 0.15);
      wreathGraphic.vertex(size * 0.23, size * 0.09);
      wreathGraphic.vertex(size * 0.25, size * 0.14);
      wreathGraphic.vertex(size * 0.2, size * 0.08);
      wreathGraphic.vertex(size * 0.22, size * 0.12);
      wreathGraphic.vertex(size * 0.17, size * 0.07);
      // Return to base with thicker curve
      wreathGraphic.bezierVertex(
        size * 0.15, size * 0.04,
        size * 0.08, -size * 0.02,
        0, 0
      );
      wreathGraphic.endShape();
      wreathGraphic.pop();
      
      // Add vein details to leaves
      wreathGraphic.stroke(30, 80, 30);
      wreathGraphic.strokeWeight(size * 0.008);  // Thicker veins
      
      // Left leaf veins
      wreathGraphic.push();
      wreathGraphic.rotate(-PI/4);
      wreathGraphic.line(0, 0, size * 0.2, -size * 0.08);
      wreathGraphic.line(size * 0.07, -size * 0.03, size * 0.17, -size * 0.1);
      wreathGraphic.line(size * 0.1, -size * 0.04, size * 0.2, -size * 0.12);
      wreathGraphic.pop();
      
      // Right leaf veins
      wreathGraphic.push();
      wreathGraphic.rotate(PI/4);
      wreathGraphic.line(0, 0, size * 0.2, size * 0.08);
      wreathGraphic.line(size * 0.07, size * 0.03, size * 0.17, size * 0.1);
      wreathGraphic.line(size * 0.1, size * 0.04, size * 0.2, size * 0.12);
      wreathGraphic.pop();
      
      wreathGraphic.pop();
    }
    
    // Draw berries
    const berrySizeFactor = 0.8;
    for(let i = 0; i < berryCount; i++) {
      const angle = (TWO_PI / berryCount) * i;
      const x = cos(angle) * ringRadius;
      const y = sin(angle) * ringRadius;
      
      // Berry clusters
      wreathGraphic.fill(200, 30, 30);
      wreathGraphic.noStroke();
      wreathGraphic.circle(x, y, size * 0.12 * berrySizeFactor);  // Slightly larger berries
      wreathGraphic.circle(x + size * 0.06, y + size * 0.06, size * 0.12 * berrySizeFactor);
      wreathGraphic.circle(x - size * 0.06, y + size * 0.06, size * 0.12 * berrySizeFactor);
      
      // Highlights
      wreathGraphic.fill(255, 150);
      wreathGraphic.circle(x - size * 0.02, y - size * 0.02, size * 0.04);
      wreathGraphic.circle(x + size * 0.04, y + size * 0.04, size * 0.04);
      wreathGraphic.circle(x - size * 0.08, y + size * 0.04, size * 0.04);
    }
    
    wreathGraphic.pop();
  }
}
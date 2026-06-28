/*
| Author          | Project Somedays                      
| Title           | WCCChallenge 2026 Week 16 - "Flip"
| 📅 Started      | 2025-04-19 
| 📅 Completed    | 2025-04-19       
| 🕒 Taken        | ~45 mins of rushing                     
| 🤯 Concept      | Jump and Flip
| 🔎 Focus        | Transformations
| 🤖 AI-use       | Bug-fixes

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/S8c7qcjw2b

Very short on time this week, but I'm constantly fascinated by slight temporal offsets and easing functions.
Never gets boring for me 😊

📃The Algorithm📃
On landing, choose a random target rotation in the x,y,z axis
While in the air, lerp to the next value using the easing function to make it more interesting


👉INTERACTION👈
Sit back and enjoy

📦RESOURCES📦
- Easings.net

🤔TO IMPROVE🤔
- Add some controls to change the initial offset etc

*/

let cubes = [];
const CUBE_SIZE = 65;
const SPACING = 75; // Slightly larger than the cube to leave a gap
let cols, rows;
const noiseScale = 0.5;


function setup() {
  createCanvas(min(windowWidth, windowHeight), min(windowWidth, windowHeight), WEBGL);
  pixelDensity(1);
  cols = floor(width / SPACING);
  rows = floor(height / SPACING);
  
  // Calculate offsets to center the grid on the screen
  let offsetX = - (cols * SPACING) / 2 + SPACING / 2;
  let offsetY = - (rows * SPACING) / 2 + SPACING / 2;
  
for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let x = offsetX + i * SPACING;
      let z = offsetY + j * SPACING;
      
      // Use 'i' and 'j' with a small step (0.1) to get smooth, wavy noise
      let noiseScale = 0.1;
      let noiseVal = noise(i * noiseScale, j * noiseScale);
      
      // Map the noise across the entire 150-frame cycle (or larger, like 300, for deeper waves)
      let timeOffset = map(noiseVal, 0, 1, 0, 150); 
      
      cubes.push(new FlipCube(x, 0, z, CUBE_SIZE, timeOffset));
    }
  }
}

function draw() {
  background(30);
  
  // orbitControl() lets you drag to see the different faces working
  orbitControl(); 
  
  // Give the whole grid a nice default isometric-ish viewing angle
  rotateX(-QUARTER_PI);
  rotateY(QUARTER_PI);

  for (let c of cubes) {
    c.update();
    c.show();
  }
}

class FlipCube {
  constructor(x, y, z, size, timeOffset) {
    this.p = createVector(x, y, z);
    this.size = size;
    this.timeOffset = timeOffset;
    
    // 1. Current rotations
    this.rx = 0;
    this.ry = 0;
    this.rz = 0;
    
    // 2. Starting rotations for the jump
    this.startrx = 0;
    this.startry = 0;
    this.startrz = 0;
    
    // 3. Target rotations
    this.targetrx = 0;
    this.targetry = 0;
    this.targetrz = 0;
    
    // State flag so we don't continuously pick new targets while resting
    this.hasLanded = true; 
  }

  getTargetRotations() {
    const getRandomR = () => random([-PI, -HALF_PI, 0, HALF_PI, PI]);
    // Add the random rotation to the start rotation so it continuously tumbles
    this.targetrx = this.startrx + getRandomR();
    this.targetry = this.startry + getRandomR();
    this.targetrz = this.startrz + getRandomR();
  }

  update() {
    let cycleLength = 120; 
    let jumpFrames = 90; // Setting this here to ensure it's defined
    
    let localTime = floor(frameCount + this.timeOffset) % cycleLength;
    
    if (localTime < jumpFrames) {
        let progress = localTime / jumpFrames;
        
        // --- 1. Y-Axis Gravity Jump ---
        let maxJumpHeight = this.size * 1.5; 
        let currentHeight = 4 * maxJumpHeight * progress * (1 - progress);
        this.p.y = -currentHeight; 
        
        // --- 2. Rotation ---
        // Use the elastic ease for the spin so it visibly "snaps" into place
        let spinProgress = easeInOutElastic(progress);
        
        this.rx = lerp(this.startrx, this.targetrx, spinProgress);
        this.ry = lerp(this.startry, this.targetry, spinProgress);
        this.rz = lerp(this.startrz, this.targetrz, spinProgress);
        
        // We are in the air!
        this.hasLanded = false; 
        
    } else {
        // Rest flat on the grid
        this.p.y = 0;
        
        // The exact frame we land, queue up the next jump
        if (!this.hasLanded) {
            
            // 1. Lock in our landing rotation to become the start of the NEXT jump
            this.startrx = this.targetrx;
            this.startry = this.targetry;
            this.startrz = this.targetrz;
            
            // 2. Pick the next target for the upcoming cycle
            this.getTargetRotations();
            
            this.hasLanded = true;
        }
        
        // 3. While resting, lock the visible rotation to our current start position
        // (Do NOT look at the target yet!)
        this.rx = this.startrx;
        this.ry = this.startry;
        this.rz = this.startrz;
    }
  }
  
  show() {
    push();
    translate(this.p.x, this.p.y, this.p.z);
    
    // Apply this specific cube's rotations
    rotateX(this.rx);
    rotateY(this.ry);
    rotateZ(this.rz);
    
    drawColoredBox(this.size);
    pop();
  }
}

// Builds a box out of 6 distinct planes so we can color them individually
function drawColoredBox(w) {
  let r = w / 2;
  noStroke();
  
  // Front - Red
  push(); fill('#ff0f7b'); translate(0, 0, r); plane(w); pop();
  
  // Back - Orange
  push(); fill('#f89b29'); translate(0, 0, -r); rotateY(PI); plane(w); pop();
  
  // Right - Blue
  push(); fill('#0061ff'); translate(r, 0, 0); rotateY(HALF_PI); plane(w); pop();
  
  // Left - Cyan
  push(); fill('#60efff'); translate(-r, 0, 0); rotateY(-HALF_PI); plane(w); pop();
  
  // Top - Dark Blue
  push(); fill('#08415c'); translate(0, -r, 0); rotateX(HALF_PI); plane(w); pop();
  
  // Bottom - Red/Pink
  push(); fill('#cc2936'); translate(0, r, 0); rotateX(-HALF_PI); plane(w); pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function easeInOutElastic(x) {
const c5 = (2 * Math.PI) / 4.5;

return x === 0
  ? 0
  : x === 1
  ? 1
  : x < 0.5
  ? -(Math.pow(2, 20 * x - 10) * Math.sin((20 * x - 11.125) * c5)) / 2
  : (Math.pow(2, -20 * x + 10) * Math.sin((20 * x - 11.125) * c5)) / 2 + 1;
}
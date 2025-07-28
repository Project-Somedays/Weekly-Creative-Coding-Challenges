let pg;
let rotation = 0;
let w;

// Distribute pens using fibonacci sphere distribution
const numPens = 10;
const goldenRatio = (1 + Math.sqrt(5)) / 2;
 // Scale everything relative to window size
 let worldScale, sphereRadius, penLength, penRadius;
 let noiseOffset = 0;


let pens;

let gui, params;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  // Create graphics buffer with 2:1 aspect ratio for proper sphere mapping
  // Width should be twice the height to avoid stretching
  pg = createGraphics(2048, 1024);
  worldScale = min(width, height) / 400;
  sphereRadius = 100 * worldScale;
  penLength = 40 * worldScale;
  penRadius = 5 * worldScale;

  for(let i = 0; i < numPens; i++){
    pens
  }

  gui = new lil.GUI();
  params = {
    numPens: 10
  }

  
  drawTexture();

}

function draw() {
  background(255);
  
  // Add some light
  //  pointLight(255, 255, 255, 200 * worldScale, -200 * worldScale, 200 * worldScale);
  //  ambientLight(60);
  
  // // Rotate the sphere
  // rotation += 0.01;
  // Calculate rotation based on Perlin noise
  noiseOffset += 0.005;
  // const rotX = map(noise(noiseOffset), 0, 1, -PI/6, PI/6);
  // const rotY = map(noise(noiseOffset + 1000), 0, 1, -PI/4, PI/4);
  // const rotZ = map(noise(noiseOffset + 2000), 0, 1, -PI/8, PI/8);
  const rotX = map(noise(noiseOffset), 0, 1, 0, TWO_PI);
  const rotY = map(noise(noiseOffset + 1000), 0, 1, 0, TWO_PI);
  const rotZ = map(noise(noiseOffset + 2000), 0, 1, 0, TWO_PI);
  
  // Draw the textured sphere
  
  push();
  rotateX(rotX);
  rotateY(rotY);
  rotateZ(rotZ);
  noStroke();
  texture(pg);
  sphere(sphereRadius);
  pop();

  for(let i = 0; i < numPens; i++) {
    const y = 1 - (i / (numPens - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const theta = 2 * PI * i / goldenRatio;
    
    const x = radius * cos(theta);
    const z = radius * sin(theta);
    
    push();
    translate(x * sphereRadius, y * sphereRadius, z * sphereRadius);
    
    const normal = createVector(x, y, z);
    const up = createVector(0, 1, 0);
    const axis = p5.Vector.cross(up, normal);
    const angle = acos(p5.Vector.dot(up, normal));
    
    if (!normal.equals(up)) {
      rotate(angle, [axis.x, axis.y, axis.z]);
    }
    
    push();
    fill(random(255), random(255), random(255));
    noStroke();
    translate(0, penLength/2, 0);
    cylinder(penRadius, penLength);
    pop();
    
    pop();
  }  
  

orbitControl();
}

function drawTexture() {
  pg.background(220);
  
  // Draw a perfectly wrapping pattern
  pg.noStroke();
  
  // Draw continuous gradient background
  for(let x = 0; x < pg.width; x++) {
    const hue = map(x, 0, pg.width, 0, 360);
    pg.colorMode(HSB);
    pg.stroke(hue, 70, 90);
    pg.line(x, 0, x, pg.height);
  }
  
  // Ensure pattern wraps horizontally
  const gridSize = pg.width / 16; // 16 divisions around sphere
  
  // Draw wrapping circles
  pg.colorMode(RGB);
  for(let y = gridSize/2; y < pg.height; y += gridSize) {
    for(let x = 0; x < pg.width; x += gridSize) {
      // Adjust x position to ensure perfect wrapping
      const xPos = x % pg.width;
      
      // Draw with alpha for blending
      pg.fill(0, 0, 0, 100);
      pg.noStroke();
      pg.circle(xPos, y, gridSize * 0.8);
      
      // If near the right edge, draw matching circle at left edge
      if(x + gridSize > pg.width) {
        pg.circle(xPos - pg.width, y, gridSize * 0.8);
      }
    }
  }
  
  // Draw latitude/longitude grid
  pg.stroke(255, 255, 255, 100);
  pg.strokeWeight(2);
  
  // Longitudinal lines (vertical)
  for(let x = 0; x < pg.width; x += pg.width/16) {
    pg.line(x, 0, x, pg.height);
  }
  
  // Latitudinal lines (horizontal)
  // Use sine curve distribution to account for sphere distortion
  for(let i = 0; i <= 16; i++) {
    const y = (i / 16) * pg.height;
    pg.line(0, y, pg.width, y);
  }
  
  // Add markers at poles to show distortion
  pg.fill(255, 0, 0);
  pg.noStroke();
  for(let x = 0; x < pg.width; x += gridSize) {
    // Small markers at poles
    pg.circle(x, 0, 10);         // North pole
    pg.circle(x, pg.height, 10); // South pole
  }
}
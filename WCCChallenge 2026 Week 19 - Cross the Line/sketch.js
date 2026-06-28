/*
| Author          | Project Somedays                      
| Title           | WCCChallenge 2026 Week 19 - "Cross the Line"
| 📅 Started      | 2025-05-10 
| 📅 Completed    | 2025-05-10       
| 🕒 Taken        | 2hrs                     
| 🤯 Concept      | Drawing the chord of intersection points on circles
| 🔎 Focus        | Quadtree performance improvements + giving the user lots of levers to pull
| 🤖 AI-use       | Lots of bug hunting and quadtree implementation

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/S8c7qcjw2b

Building off an old project where I changed a classic Casey Reas idea
He drew lines between centres of intersection circles
I just drew the chord of their points of intersection
"Hawaiian Lei": https://openprocessing.org/sketch/2123367
I also used this algorithm in the WCCC submission for "Symmetries": https://openprocessing.org/sketch/2226207

📃THE ALGORITHM📃
- Spawn movers with a position and random direction
- Check the quadtree for nearby movers and measure the distance between their centres
- If distance < 2 * r, we can calculate their points of intersection based on the distance between their centres
- Draw the chord of those points of intersection
- Conditionally, do some physics to push them apart

👉INTERACTION👈
Try turning off the scene and just look at the chords of intersection. Interesting in itself!


📦RESOURCES📦
- Coolors.co
- Gemini

🤔TO IMPROVE🤔
You tell me!
The no trails view could be worth exploring more... make that adjustable...



*/

const palettes = {
  "Ghostly White": "#ffffff",
  "Vibrant Tones": "#f94144, #f3722c, #f8961e, #f9844a, #f9c74f, #90be6d, #43aa8b, #4d908e, #577590, #277da1",
  "Vibrant Citrus Burst": "#f56a00, #fa8b01, #ffad03, #ffc243, #ffcf70, #cea7ee, #b67be6, #9d4edd, #72369d, #461e5c",
  "Deep Sea Green Glow": "#0466c8, #0353a4, #023e7d, #002855, #001845, #001233, #38b000, #70e000, #9ef01a, #ccff33",
  "Ocean Sunset Bonfire": "#8ecae6, #219ebc, #126782, #023047, #ffb703, #fd9e02, #fb8500, #bb3e03, #ae2012, #9b2226",
  "Neon Paradise Pop": "#f72585, #b5179e, #7209b7, #560bad, #480ca8, #3a0ca3, #159f91, #1bccba, #1ee3cf, #92f2e8",
  "Magical Lavender Haze": "#5d36e7, #6e44ff, #936bff, #b892ff, #dcaaf1, #ffc2e2, #ffa9cb, #ff90b3, #f7859c, #ef7a85"
}

let movers = [];
let quadtreeDebugCanvas;
let moverDebugCanvas;
let scene; 
let gui, params;
let moverSpawnModes;
let debugMode = false; 
let currentPalette = []; // NEW: Array to hold parsed p5 colors
let folderLayerBiz, folderMoverBiz, folderColourBiz, folderRespawnBiz, folderMoverInteraction;

function setup() {
  createCanvas(windowWidth, windowHeight);
  quadtreeDebugCanvas = createGraphics(width, height);
  moverDebugCanvas = createGraphics(width, height);
  scene = createGraphics(width, height);
  scene.blendMode(ADD);
  
  background(20);

  params = {
    showQuadTree: false,
    showMovers: true,
    showScene: true,
    repulsionOn: false,
    repulsionStrength: 0.25,
    bounceOn: true,
    moverSpawnMode: "Random",
    moverCount: 50,
    moverDiameter: min(width, height)/6,
    overlapOpacity: 8,
    colourPalette: "Ghostly White",
    respawnWipesTrails: true,
    changeColourWipesTrails: true,
    strokeThick: 1,
    drawTrails: true,
    clearBiz: function(){
      scene.clear(); // FIX: Wipe the buffer transparent!
      console.log("Clearing the background");
    },
    respawnMovers: function() {
      applyPalette();
      moverSpawnModes[params.moverSpawnMode]();
      if(params.respawnWipesTrails) scene.clear();
    }
  }


  
  applyPalette(); // Initialize palette
  console.log(currentPalette);

  moverSpawnModes = {
    "Random": () => {
      movers = [];
      for(let i = 0; i < params.moverCount; i++){ 
        movers.push(new Mover(random(width), random(height), random(currentPalette))); 
      }
    },
    "Central": () => {
      movers = [];
      for(let i = 0; i < params.moverCount; i++){
        movers.push(new Mover(width/2 + random(-params.moverDiameter, params.moverDiameter), height/2 + random(-params.moverDiameter, params.moverDiameter), random(currentPalette)));
      }
    },
    "Launch Sites": () => {
      movers = [];
      let D = min(width, height);
      let a = random(TWO_PI);
      
      for(let i = 0; i < 4; i++){
        // Keep the radius positive so they stay pushed outwards from the center
        let r = random(D / 8, D/2); 
        let aPerturbation = random(-HALF_PI/3, HALF_PI/3);
        
        // Anchor the center of the rotation to width/2 and height/2
        let launchSite = createVector(
          width/2 + r * cos(a + aPerturbation + i * HALF_PI), 
          height/2 + r * sin(a + aPerturbation + i * HALF_PI)
        );
        
        for(let j = 0; j < params.moverCount/4; j++){ 
          movers.push(new Mover(
            launchSite.x + random(-params.moverDiameter, params.moverDiameter), 
            launchSite.y + random(-params.moverDiameter, params.moverDiameter), 
            random(currentPalette)
          ));
        }
      }
    },
    "Squiggly Line": () => {
      movers = [];
      let maxSpawnWiggle = 0.2; 
      let maxSpawnFreq = 5;
      
      let spawnWiggleAmp = random(-maxSpawnWiggle, maxSpawnWiggle);
      let spawnWiggleFreq = random(-maxSpawnFreq, maxSpawnFreq);
      for(let i = 0; i < params.moverCount; i++){
        let y, x;
        if(height > width){
          y = random(height);
          x = width/2 + spawnWiggleAmp*width*cos(spawnWiggleFreq*map(y, 0, height, 0, TWO_PI));
        } else {
          x = random(width);
          y = height/2 + spawnWiggleAmp*height*cos(spawnWiggleFreq*map(x, 0, width, 0, TWO_PI));
        }
        movers.push(new Mover(x, y, random(currentPalette)));
      }
    }
  }

  // spawn the movers initially
  moverSpawnModes[params.moverSpawnMode]();

  // --- GUI SETUP ---
  gui = new lil.GUI();

  // Layer visibility controls
  folderLayerBiz = gui.addFolder("Layer Biz");
  folderLayerBiz.add(params, 'showQuadTree');
  folderLayerBiz.add(params, 'showMovers');
  folderLayerBiz.add(params, 'showScene');

  // Mover size and count controls
  folderMoverBiz = gui.addFolder("Mover Biz");
  folderMoverBiz.add(params, 'moverCount', 10, 300, 1).onChange(() => {
    moverSpawnModes[params.moverSpawnMode]();
  });
  folderMoverBiz.add(params, 'moverDiameter', 5, width/4, 1);


  // Interaction controls
  folderMoverInteraction = gui.addFolder("Mover Interaction");
  folderMoverBiz.add(params, 'repulsionOn');
  folderMoverBiz.add(params, 'repulsionStrength', 0, 1, 0.1);
  folderMoverBiz.add(params, 'bounceOn');
  
  
  // Colour Controls
  folderColourBiz = gui.addFolder("Colour Biz");
  folderColourBiz.add(params, 'changeColourWipesTrails');
  folderColourBiz.add(params, 'colourPalette', Object.keys(palettes)).onChange(() => {
    applyPalette();
    for (let m of movers) {
      m.color = random(currentPalette);
    }
    if(params.changeColourWipesTrails) scene.clear();
  });

  folderColourBiz.add(params, 'drawTrails');
  folderColourBiz.add(params, 'overlapOpacity', 0, 20, 1);
  folderColourBiz.add(params, 'strokeThick', 0.1, 5);
  
  

  // Respawn Controls
  folderRespawnBiz = gui.addFolder("Respawn Biz");
  folderRespawnBiz.add(params, 'respawnWipesTrails');
  folderRespawnBiz.add(params, 'moverSpawnMode', Object.keys(moverSpawnModes)).onChange(() => {
    moverSpawnModes[params.moverSpawnMode]();
    if(params.respawnWipesTrails) scene.clear();
  });
  folderRespawnBiz.add(params, 'respawnMovers').name("Respawn Movers");
  folderRespawnBiz.add(params, 'clearBiz').name("Clear Trails");
}


function draw() {
  background(20);
  
  quadtreeDebugCanvas.clear();
  moverDebugCanvas.clear();

  let boundary = new Boundary(width / 2, height / 2, width / 2, height / 2);
  let qtree = new QuadTree(boundary, 4);

  for (let m of movers) {
    let p = new Point(m.p.x, m.p.y, m);
    qtree.insert(p);
  }

  if (params.showQuadTree) {
    qtree.show(quadtreeDebugCanvas);
  }

  for (let m of movers) {
    m.update(params.bounceOn, params.repulsionOn);
    
    let searchRadius = params.moverDiameter + 2; 
    let range = new SearchRadius(m.p.x, m.p.y, searchRadius); 
    
    let nearbyPoints = qtree.query(range);

    for (let p of nearbyPoints) {
      let other = p.userData;
      if (m !== other && m.intersects(other)) {
        overlap(m, other); // NEW: Pass the actual Mover objects instead of just vectors
      }
    }
  }

  if (params.showMovers){
    for(let m of movers){
      m.show(moverDebugCanvas);
    }
  }
  
  if (params.showScene) {
    image(scene, 0, 0);
  }
  
  if (params.showQuadTree) {
    image(quadtreeDebugCanvas, 0, 0);
  }
  if (params.showMovers) {
    image(moverDebugCanvas, 0, 0);
  }
}

// NEW: Accepts full Mover objects (mA, mB)
// NEW: Accepts full Mover objects (mA, mB)
function overlap(mA, mB) {
  let posA = mA.p;
  let posB = mB.p;

  let d = p5.Vector.dist(posA, posB);
  let r = params.moverDiameter / 2; 
  
  let aSys = p5.Vector.sub(posB, posA).heading(); 
  let a = acos(d / params.moverDiameter);
  
  // THE FIX: Extract RGB directly from the color object and set alpha explicitly.
  // 15 is about 6% opacity. Change back to 5 if you want it super ghostly!
  let aRed = red(mA.color);
  let aGreen = green(mA.color);
  let aBlue = blue(mA.color);
  
  scene.push();
  
  // Optional Pro-Tip: Uncomment the next line for a "neon glowing" additive blend effect!
  // scene.blendMode(ADD); 
  if(params.drawTrails){
    scene.stroke(aRed, aGreen, aBlue, params.overlapOpacity);
    scene.strokeWeight(params.strokeThick);
    scene.translate(posA.x, posA.y);
    scene.rotate(aSys); 
    scene.line(r * cos(a), r * sin(a), r * cos(a), r * sin(-a)); 
    scene.pop();
  }
 

  if (params.showMovers) {
    moverDebugCanvas.push();
    moverDebugCanvas.translate(posA.x, posA.y);
    moverDebugCanvas.rotate(aSys);
    
    // Make the active highlighted chord the same color, but full opacity
    moverDebugCanvas.stroke(255); 
    moverDebugCanvas.strokeWeight(2);
    moverDebugCanvas.line(r * cos(a), r * sin(a), r * cos(a), r * sin(-a));
    
    moverDebugCanvas.fill(255);
    moverDebugCanvas.noStroke();
    moverDebugCanvas.circle(r * cos(a), r * sin(a), 4);
    moverDebugCanvas.circle(r * cos(-a), r * sin(-a), 4);
    
    moverDebugCanvas.pop();
  }
}


  // Helper to update our active color array
  function applyPalette() {
    let hexStrings = palettes[params.colourPalette].split(',');
    currentPalette = hexStrings.map(hex => color(hex.trim()));
  }
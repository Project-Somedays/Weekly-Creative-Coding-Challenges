/*
| Author          | Project Somedays                      
| Title           | WCCChallenge 2026 Week 18 - "Glyphs"
| 📅 Started      | 2025-05-03 
| 📅 Completed    | 2025-05-03       
| 🕒 Taken        | 45 mins of prompting                     
| 🤯 Concept      | Runes look rad. Transitions between runes look radder.
| 🔎 Focus        | Getting Gemini to teach me how to p5.strands an old CPU-based project
| 🤖 AI-use       | Not too proud to admit - 100% prompted

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/S8c7qcjw2b

Made a similar thing ages ago for one of my first submissions - "Firefly": https://openprocessing.org/sketch/2203007
Sampling an image, setting targets for movers and then converging them to form a cohesive image.
I wanted Gemini to help me get my head around how you'd approach this on the GPU.
I'll sit with it, but at time of submission, I'll be honest: I'm none the wiser for now 😅

📦RESOURCES📦
- Easings.net
- Glyphs sprite sheet: https://thumbs.dreamstime.com/b/viking-runes-black-grunge-stones-set-abstract-black-design-stones-viking-rune-letters-dark-patter-background-266983425.jpg

🤔TO IMPROVE🤔
- Add bloom
- Transition directly from one glyph to the next

*/

let instancingShader;
let particleModel;
let dataTex;
let runeImg;
let easeVal = 0;
let debugImg;

const NUM_PARTICLES = 10000;
const TEX_SIZE = 100; // 100x100 texture = 10,000 pixels/targets
const COLS = 6;
const ROWS = 4;

// Animation timing
const DURATION = 4000; 
let lastRuneChange = 0;

// The p5.strands transpiler callback
// This is written in JS but runs on the GPU!
function instancingCallback() {
  // 1. Tell the shader to fetch BOTH of these from the CPU every frame!
  let u_dataTex = uniformTexture(() => dataTex);
  let u_ease = uniformFloat(() => easeVal); // THIS WAS THE MISSING LINK!
  
  let id = float(instanceID());
  
  // 2. Add +0.5 to push the UV coordinate to the exact CENTER of the pixel
  let texSize = 100.0;
  let u = ((id % texSize) + 0.5) / texSize;
  let v = (floor(id / texSize) + 0.5) / texSize;
  
  // 3. Read the target pixel 
  let targetData = texture(u_dataTex, [u, v]);
  
  let targetX = (targetData.r - 0.5) * width * 0.8;
  let targetY = (targetData.g - 0.5) * height * 0.8;
  
  let nX = noise([id * 0.123, millis() * 0.0005, 0.0]) * 2.0 - 1.0;
  let nY = noise([id * 0.123, millis() * 0.0005, 100.0]) * 2.0 - 1.0;
  
  let chaosX = nX * width * 0.8;
  let chaosY = nY * height * 0.8;
  
  // 4. Mix using our dynamic u_ease uniform, NOT the baked-in 0!
  let finalX = mix(chaosX, targetX, u_ease);
  let finalY = mix(chaosY, targetY, u_ease);
  
  let chaosColor = [1.0, 0.5, 0.1, 1.0]; 
  let runeColor = [0.0, 0.8, 1.0, 1.0];  
  let finalColor = mix(chaosColor, runeColor, u_ease);

  // 5. Apply the final position and color
  worldInputs.begin();
  worldInputs.position += [finalX, finalY, 0.0];
  worldInputs.color = finalColor; 
  worldInputs.end();
}

async function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  pixelDensity(1);
  noStroke();

  // Async image loading
  runeImg = await loadImage('runes.png');
  
  // Create our data texture to hold coordinates
  dataTex = createImage(TEX_SIZE, TEX_SIZE);
  
  // Build a single simple geometry to be instanced
  particleModel = buildGeometry(() => {
    circle(0, 0, 3); // 3px radius orb
  });
  
  // Pass our JS function to the transpiler
  instancingShader = buildColorShader(instancingCallback);
  
  // Pick the first target glyph
  pickRandomRune();
}


function draw() {
  background(0);
  blendMode(ADD); 
  
  let t = millis();
  let phase = (t - lastRuneChange) / DURATION;
  
  // Trigger next rune cycle
  if (phase >= 1.0) {
    pickRandomRune();
    lastRuneChange = t;
    phase = 0;
  }
  
  // Orchestrate the Elastic Easing
  easeVal = 0;
  if (phase < 0.4) {
    // 0% -> 40%: Swarm snaps to the rune shape
    let x = map(phase, 0, 0.4, 0, 1);
    easeVal = easeInOutElastic(x);
  } else if (phase < 0.6) {
    // 40% -> 60%: Hold the shape
    easeVal = 1;
  } else {
    // 60% -> 100%: Explode back to chaos smoothly
    let x = map(phase, 0.6, 1.0, 1, 0);
    easeVal = pow(x, 3.0); 
  }
  
  // Send variables to the transpiled shader via uniforms object
  shader(instancingShader);
//   instancingShader.setUniform('u_dataTex', dataTex);
//   instancingShader.setUniform('u_ease', easeVal);
//   instancingShader.setUniform('u_time', t);
//   instancingShader.setUniform('u_res', [width, height]);
  
  // Draw the model 10,000 times!
  model(particleModel, NUM_PARTICLES);
  
  blendMode(BLEND); 
}

// Your beautiful easing math
function easeInOutElastic(x) {
  const c5 = (2 * Math.PI) / 4.5;
  return x === 0 ? 0 : x === 1 ? 1 : x < 0.5
    ? -(Math.pow(2, 20 * x - 10) * Math.sin((20 * x - 11.125) * c5)) / 2
    : (Math.pow(2, -20 * x + 10) * Math.sin((20 * x - 11.125) * c5)) / 2 + 1;
}

// CPU Side: Scan the sprite sheet and build the Data Texture
function pickRandomRune() {
  let col = floor(random(COLS));
  let row = floor(random(ROWS));
  
  let cellW = floor(runeImg.width / COLS);
  let cellH = floor(runeImg.height / ROWS);
  let startX = col * cellW;
  let startY = row * cellH;

  debugImg = runeImg.get(startX, startY, cellW, cellH);
  
  let validTargets = [];
  
  runeImg.loadPixels();
  
  for(let y = 0; y < cellH; y++) {
    for(let x = 0; x < cellW; x++) {
      let imgX = startX + x;
      let imgY = startY + y;
      let idx = (imgX + imgY * runeImg.width) * 4;
      
      if (runeImg.pixels[idx] > 128) { 
        validTargets.push({
          nx: (x / cellW) - 0.5,
          ny: (y / cellH) - 0.5
        });
      }
    }
  }
  
  if (validTargets.length === 0) validTargets.push({nx: 0, ny: 0});
  
  dataTex.loadPixels();
  for (let i = 0; i < NUM_PARTICLES; i++) {
    let t = validTargets[floor(random(validTargets.length))];
    let texIdx = i * 4;
    
    dataTex.pixels[texIdx + 0] = floor(map(t.nx, -0.5, 0.5, 0, 255));
    dataTex.pixels[texIdx + 1] = floor(map(t.ny, -0.5, 0.5, 0, 255));
    dataTex.pixels[texIdx + 2] = 0;
    dataTex.pixels[texIdx + 3] = 255;
  }
  dataTex.updatePixels();
}

// debugging draw that just shows what the CPU is feeding into the GPU
/*
function draw() {
  background(0);
  
  let t = millis();
  let phase = (t - lastRuneChange) / DURATION;
  
  // Trigger next rune cycle
  if (phase >= 1.0) {
    pickRandomRune();
    lastRuneChange = t;
  }
  
  // Draw the target rune directly to the center of the WebGL canvas
  if (debugImg) {
    imageMode(CENTER);
    // Let's draw it at 3x scale so it's nice and visible
    image(debugImg, 0, 0, debugImg.width * 3, debugImg.height * 3);
  }
  

//   BONUS DEBUG: Uncomment this to see what your Data Texture looks like!
//   It will render in the top left as a 100x100 square of colorful static.
  imageMode(CORNER);
  image(dataTex, -width/2, -height/2, 100, 100);

}
*/
/*
| Author          | Project Somedays                      
| Title           | WCCChallenge 2026 Week 13 - "Cube"
| 📅 Started      | 2025-04-04   
| 📅 Completed    | 2025-04-05       
| 🕒 Taken        | ~2.5hrs                     
| 🤯 Concept      | Things fall apart
| 🔎 Focus        | p5.strands
| 🤖 AI-use       | Made a straight simple physics sim version in regular p5 and then used Gemini to convert to state-based p5.strands

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/S8c7qcjw2b

📃The Algorithm📃
Generate a grid and, where we want to carve away cubes, set their position WAY off the screen
Set a delay for the physics sim based on y position
Use a physics formula to set their position thereafter
Repeat for the stroke shader

👉INTERACTION👈
Play with the controls

🎓 LESSONS LEARNED 🎓
- GPU has zero memory of where anything is = all state-based... which means we use all my favourite high school physics formulas from my previous life a physics/maths teacher 🥰
- SDF totally makes more sense now that I'd sat with it a bit: step() outputs 0 or 1 depending on a condition
If that condition is, for example, the length of the position vector < some threshold, then 1 for inside, 0 for outside
- The transpiler for p5.strands imposes a few restrictions that make dependency injection a bit tricky it seems (hence the code duplication between the colour shader and the stroke shader)

📦RESOURCES📦
- Easings.net
- Coolors.co for the palettes


🤔TO IMPROVE/FUTURE PLANS🤔
- Set the initial state based off 3D models so we can have a crumbling Mount Rushmore or Leaning Tower of Pisa etc


*/


let n = 70;
let c;
let w;
let colA, colB;
let start;
let progress = 0;
let startDelay = 60;
let currentFrame = 0;
let gui, params;
let currentPalette;
let instancedShader;
let instancedStrokeShader;
let boxModel;

let palettes = {
  "funky fusion": "#ff0f7b, #f89b29",
  "ocean breeze": "#0061ff, #60efff",
  "twilight firecracker": "#08415c, #cc2936",
  "mystic aqua": "#264653, #2a9d8f",
  "tropical sunset": "#ffba49, #20a39e"
}



function setup() {
  createCanvas(min(windowWidth, windowHeight), min(windowWidth, windowHeight), WEBGL);
  pixelDensity(1);
  
  c = createVector(0,0,0); // centre
  w =  min(width, height)*0.75;
  start = createVector(0,-w*1.25, 0);
  
  boxModel = buildGeometry(() => box(w/n));

  // --- MOVED UP ---
  // Define params and colors BEFORE compiling the shaders!
  gui = new lil.GUI();
  params = {
    palette: "funky fusion",
    gravStrength: 0.5,
    res : 70,
    rotateMode: true,
    showStroke: true,
    clumpScale: 0.01,
    delayMode: "Perlin Noise",
    lineWeight: 0.25,
    shapeMode: 0
  };
  
  // Set the initial hex colors so colA and colB exist
  setPalette(params.palette); 

  // --- SHADER COMPILATION ---
  // Now p5.strands can successfully read the initial param values
  instancedShader = baseColorShader().modify(colorShaderCallback);
  instancedStrokeShader = baseStrokeShader().modify(strokeShaderCallback);

  // --- GUI CONTROLS ---
  gui.add(params, 'palette', Object.keys(palettes)).onChange((val) => setPalette(val));
  gui.add(params, 'gravStrength', 0, 1, 0.01);
  gui.add(params, 'res', 3, 100, 1).onChange((val) => {
    n = val;
    boxModel = buildGeometry(() => box(w/n));

  }); 
  gui.add(params, 'clumpScale', 0.001, 0.1, 0.001);
  gui.add(params, 'rotateMode');
  gui.add(params, 'showStroke');
  gui.add(params, 'shapeMode', {
    "Sphere": 0, 
    "Cube": 1, 
    "Round Box": 2,
    "Capped Cylinder": 3,
    "Torus": 4, 
    "Capsule": 5,
    "Octagedron": 6,
    "Ellipsoid": 7
  })
  gui.add(params, 'delayMode', ['Random', 'Trig Noise', 'Perlin Noise']);
  gui.add(params, 'lineWeight', 0.1, 2, 0.1);
}

function setPalette(palette){
  currentPalette = palettes[palette].split(", ");
  colA = currentPalette[0];
  colB = currentPalette[1];
}

function draw() {
  background(0);
  currentFrame++;
  
  if (currentFrame <= startDelay) progress += 1 / startDelay; 
  let tempP = p5.Vector.lerp(start, c, easeOutElastic(progress));
  
  push();
  translate(tempP.x, tempP.y, tempP.z);
  if(params.rotateMode) rotateY(frameCount * 0.01);
  
  // Activate the shader
  shader(instancedShader);
  if(params.showStroke) strokeShader(instancedStrokeShader);
  strokeWeight(params.lineWeight);
  // Render n*n*n instances of the box model simultaneously
  model(boxModel, n * n * n);
  
  pop();
  orbitControl();
  
  // calculating max reset time based on the current shape being used 
  let maxResetTime = calculateResetTime();
  
  if (currentFrame > maxResetTime) {
    currentFrame = 0;
    progress = 0;
  }
}


function easeOutElastic(x) {
const c4 = (2 * Math.PI) / 3;

return x === 0
  ? 0
  : x === 1
  ? 1
  : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
}

// A standard JS helper that CAN live in the global scope because 
// it only runs inside the uniform callbacks on the CPU
function hexToVec3(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
}

// ---------------------------------------------------------
// CALLBACK 1: THE COLOR SHADER
// ---------------------------------------------------------
function colorShaderCallback() {
  const currentFrameUni = uniformFloat(() => currentFrame);
  const startDelayUni = uniformFloat(() => startDelay);
  const nUni = uniformFloat(() => n);
  const wUni = uniformFloat(() => w);
  const gUni = uniformFloat(() => params.gravStrength);
  const clumpScaleUni = uniformFloat(() => params.clumpScale); 
  const modeUni = uniformFloat(() => 
    params.delayMode === "Perlin Noise" ? 2.0 : (params.delayMode === "Trig Noise" ? 1.0 : 0.0)
  );
  
  // NEW: Grab the shape mode from the GUI
  const shapeModeUni = uniformFloat(() => params.shapeMode);

  const colA_Uni = uniformVector3(() => hexToVec3(colA));
  const colB_Uni = uniformVector3(() => hexToVec3(colB));

  function rand(seed) {
    return fract(sin(dot(seed, [12.9898, 78.233])) * 43758.5453123);
  }

  function spatialNoise(x, y, z, freq) {
    let nx = x * freq; let ny = y * freq; let nz = z * freq;
    let n = sin(nx) * cos(ny) + sin(ny) * cos(nz) + sin(nz) * cos(nx);
    return (n + 1.5) / 3.0; 
  }
  
  // 1. A pure scalar hash function for the noise grid
  function hash(x, y, z) {
    let d = x*127.1 + y*311.7 + z*74.7;
    return fract(sin(d) * 43758.5453123);
  }

  // 2. The 3D Value Noise (Perlin-like) generator
  function perlinLikeNoise(x, y, z, freq) {
    let px = x * freq; let py = y * freq; let pz = z * freq;

    // Get the integer grid coordinates
    let ix = floor(px); let iy = floor(py); let iz = floor(pz);
    
    // Get the fractional part inside the current grid cell
    let fx = fract(px); let fy = fract(py); let fz = fract(pz);

    // Cubic smoothstep for seamless interpolation
    let ux = fx * fx * (3.0 - 2.0 * fx);
    let uy = fy * fy * (3.0 - 2.0 * fy);
    let uz = fz * fz * (3.0 - 2.0 * fz);

    // Hash the 8 corners of the 3D grid cell
    let n000 = hash(ix, iy, iz);
    let n100 = hash(ix + 1.0, iy, iz);
    let n010 = hash(ix, iy + 1.0, iz);
    let n110 = hash(ix + 1.0, iy + 1.0, iz);
    let n001 = hash(ix, iy, iz + 1.0);
    let n101 = hash(ix + 1.0, iy, iz + 1.0);
    let n011 = hash(ix, iy + 1.0, iz + 1.0);
    let n111 = hash(ix + 1.0, iy + 1.0, iz + 1.0);

    // Trilinear interpolation using the smoothstep values
    let nx00 = mix(n000, n100, ux);
    let nx10 = mix(n010, n110, ux);
    let nx01 = mix(n001, n101, ux);
    let nx11 = mix(n011, n111, ux);

    let nxy0 = mix(nx00, nx10, uy);
    let nxy1 = mix(nx01, nx11, uy);

    return mix(nxy0, nxy1, uz);
  }

  getObjectInputs((inputs) => {
    let id = instanceID();
    let nFloat = nUni;
    let wFloat = wUni;
    let radius = wFloat / 2.0;
    
    let k = id - nFloat * floor(id / nFloat);
    let j = floor(id / nFloat) - nFloat * floor(floor(id / nFloat) / nFloat);
    let i = floor(id / (nFloat * nFloat));
    
    let px = -wFloat/2.0 + i * (wFloat/nFloat);
    let py = wFloat/2.0 - j * (wFloat/nFloat);
    let pz = -wFloat/2.0 + k * (wFloat/nFloat);

    // ==========================================
    // SDF SHAPE LIBRARY (Pure Scalar Math)
    // ==========================================
    
    // 0. Sphere
    let dSphere = sqrt(px*px + py*py + pz*pz) - radius;
    
    // 1. Cube
    let cb = radius * 0.75;
    let cqx = abs(px) - cb; let cqy = abs(py) - cb; let cqz = abs(pz) - cb;
    let dCube = sqrt(max(cqx, 0.0)*max(cqx, 0.0) + max(cqy, 0.0)*max(cqy, 0.0) + max(cqz, 0.0)*max(cqz, 0.0)) + min(max(cqx, max(cqy, cqz)), 0.0);
    
    // 2. Round Box
    let rb = radius * 0.6; let rRad = radius * 0.2;
    let rqx = abs(px) - rb; let rqy = abs(py) - rb; let rqz = abs(pz) - rb;
    let dRoundBox = sqrt(max(rqx, 0.0)*max(rqx, 0.0) + max(rqy, 0.0)*max(rqy, 0.0) + max(rqz, 0.0)*max(rqz, 0.0)) + min(max(rqx, max(rqy, rqz)), 0.0) - rRad;
    
    // 3. Capped Cylinder
    let cylR = radius * 0.6; let cylH = radius * 0.8;
    let cyldX = sqrt(px*px + pz*pz) - cylR; let cyldY = abs(py) - cylH;
    let dCyl = min(max(cyldX, cyldY), 0.0) + sqrt(max(cyldX, 0.0)*max(cyldX, 0.0) + max(cyldY, 0.0)*max(cyldY, 0.0));
    
    // 4. Torus
    let tx = radius * 0.6; let ty = radius * 0.3;
    let tqx = sqrt(px*px + pz*pz) - tx;
    let dTorus = sqrt(tqx*tqx + py*py) - ty;
    
    // 5. Capsule (Vertical)
    let capH = radius * 0.5; let capR = radius * 0.35;
    let cap_pa_y = py - capH; let cap_ba_y = -capH * 2.0;
    let cap_h = clamp((cap_pa_y * cap_ba_y) / (cap_ba_y * cap_ba_y), 0.0, 1.0);
    let cap_cy = cap_pa_y - cap_ba_y * cap_h;
    let dCapsule = sqrt(px*px + cap_cy*cap_cy + pz*pz) - capR;
    
    // 6. Octahedron
    let octS = radius * 1.1;
    let dOcta = (abs(px) + abs(py) + abs(pz) - octS) * 0.57735027;
    
    // 7. Ellipsoid
    let ex = radius * 0.9; let ey = radius * 0.4; let ez = radius * 0.9;
    let ek0 = sqrt((px/ex)*(px/ex) + (py/ey)*(py/ey) + (pz/ez)*(pz/ez));
    let ek1 = sqrt((px/(ex*ex))*(px/(ex*ex)) + (py/(ey*ey))*(py/(ey*ey)) + (pz/(ez*ez))*(pz/(ez*ez)));
    let dEllipsoid = ek0 * (ek0 - 1.0) / ek1;

    // ==========================================
    // SHAPE TOGGLES
    // ==========================================
    
    // Determine which shape is active (1.0) and zero out the rest (0.0)
    let u0 = step(abs(shapeModeUni - 0.0), 0.1);
    let u1 = step(abs(shapeModeUni - 1.0), 0.1);
    let u2 = step(abs(shapeModeUni - 2.0), 0.1);
    let u3 = step(abs(shapeModeUni - 3.0), 0.1);
    let u4 = step(abs(shapeModeUni - 4.0), 0.1);
    let u5 = step(abs(shapeModeUni - 5.0), 0.1);
    let u6 = step(abs(shapeModeUni - 6.0), 0.1);
    let u7 = step(abs(shapeModeUni - 7.0), 0.1);

    // Combine them! (SDF <= 0.0 means it is inside the shape)
    let isInside = 
      step(dSphere, 0.0) * u0 +
      step(dCube, 0.0) * u1 +
      step(dRoundBox, 0.0) * u2 +
      step(dCyl, 0.0) * u3 +
      step(dTorus, 0.0) * u4 +
      step(dCapsule, 0.0) * u5 +
      step(dOcta, 0.0) * u6 +
      step(dEllipsoid, 0.0) * u7;

    // Cull the geometry
    inputs.position *= isInside; 
    let isOutside = 1.0 - isInside;
    inputs.position.y += isOutside * 999999.0; 

    // --- Physics & Gravity ---
    // Calculate all three delay types
    let randomDelay = startDelayUni + j * startDelayUni + rand([id, 0.1234]) * startDelayUni;
    let trigDelay = startDelayUni + j * startDelayUni + spatialNoise(px, py, pz, clumpScaleUni) * startDelayUni * 4.0;
    let perlinDelay = startDelayUni + j * startDelayUni + perlinLikeNoise(px, py, pz, clumpScaleUni) * startDelayUni * 4.0;
    
    // Create mathematical toggles based on the mode uniform
    let uRand = step(abs(modeUni - 0.0), 0.1);
    let uTrig = step(abs(modeUni - 1.0), 0.1);
    let uPerlin = step(abs(modeUni - 2.0), 0.1);

    // Combine them! Only the active UI mode will be multiplied by 1.0
    let delayFrames = (randomDelay * uRand) + (trigDelay * uTrig) + (perlinDelay * uPerlin);
    
    let timeActive = max(0.0, currentFrameUni - delayFrames);
    let fallY = 0.5 * gUni * timeActive * timeActive;
    
    py += fallY; 
    let p = [px, py, pz]; 
    inputs.position += p;

    return inputs;
  });

  getWorldInputs((inputs) => {
    let id = instanceID();
    let nFloat = nUni;
    let wFloat = wUni;
    let j = floor(id / nFloat) - nFloat * floor(floor(id / nFloat) / nFloat);
    let startY = wFloat/2.0 - j * (wFloat/nFloat);

    let yMap = clamp((startY - wFloat/2.0) / (-wFloat), 0.0, 1.0);
    inputs.color = [mix(colA_Uni, colB_Uni, yMap), 1.0];
    return inputs;
  });
}

// ---------------------------------------------------------
// CALLBACK 2: THE STROKE SHADER
// ---------------------------------------------------------
function strokeShaderCallback() {
  const currentFrameUni = uniformFloat(() => currentFrame);
  const startDelayUni = uniformFloat(() => startDelay);
  const nUni = uniformFloat(() => n);
  const wUni = uniformFloat(() => w);
  const gUni = uniformFloat(() => params.gravStrength);
  const clumpScaleUni = uniformFloat(() => params.clumpScale); 
  const modeUni = uniformFloat(() => 
    params.delayMode === "Perlin Noise" ? 2.0 : (params.delayMode === "Trig Noise" ? 1.0 : 0.0)
  );
  const shapeModeUni = uniformFloat(() => params.shapeMode);

  function rand(seed) {
    return fract(sin(dot(seed, [12.9898, 78.233])) * 43758.5453123);
  }

  function spatialNoise(x, y, z, freq) {
    let nx = x * freq; let ny = y * freq; let nz = z * freq;
    let n = sin(nx) * cos(ny) + sin(ny) * cos(nz) + sin(nz) * cos(nx);
    return (n + 1.5) / 3.0; 
  }

  // 1. A pure scalar hash function for the noise grid
  function hash(x, y, z) {
    let d = x*127.1 + y*311.7 + z*74.7;
    return fract(sin(d) * 43758.5453123);
  }

  // 2. The 3D Value Noise (Perlin-like) generator
  function perlinLikeNoise(x, y, z, freq) {
    let px = x * freq; let py = y * freq; let pz = z * freq;

    // Get the integer grid coordinates
    let ix = floor(px); let iy = floor(py); let iz = floor(pz);
    
    // Get the fractional part inside the current grid cell
    let fx = fract(px); let fy = fract(py); let fz = fract(pz);

    // Cubic smoothstep for seamless interpolation
    let ux = fx * fx * (3.0 - 2.0 * fx);
    let uy = fy * fy * (3.0 - 2.0 * fy);
    let uz = fz * fz * (3.0 - 2.0 * fz);

    // Hash the 8 corners of the 3D grid cell
    let n000 = hash(ix, iy, iz);
    let n100 = hash(ix + 1.0, iy, iz);
    let n010 = hash(ix, iy + 1.0, iz);
    let n110 = hash(ix + 1.0, iy + 1.0, iz);
    let n001 = hash(ix, iy, iz + 1.0);
    let n101 = hash(ix + 1.0, iy, iz + 1.0);
    let n011 = hash(ix, iy + 1.0, iz + 1.0);
    let n111 = hash(ix + 1.0, iy + 1.0, iz + 1.0);

    // Trilinear interpolation using the smoothstep values
    let nx00 = mix(n000, n100, ux);
    let nx10 = mix(n010, n110, ux);
    let nx01 = mix(n001, n101, ux);
    let nx11 = mix(n011, n111, ux);

    let nxy0 = mix(nx00, nx10, uy);
    let nxy1 = mix(nx01, nx11, uy);

    return mix(nxy0, nxy1, uz);
  }

  getObjectInputs((inputs) => {
    let id = instanceID();
    let nFloat = nUni;
    let wFloat = wUni;
    let radius = wFloat / 2.0;
    
    let k = id - nFloat * floor(id / nFloat);
    let j = floor(id / nFloat) - nFloat * floor(floor(id / nFloat) / nFloat);
    let i = floor(id / (nFloat * nFloat));
    
    let px = -wFloat/2.0 + i * (wFloat/nFloat);
    let py = wFloat/2.0 - j * (wFloat/nFloat);
    let pz = -wFloat/2.0 + k * (wFloat/nFloat);

    let dSphere = sqrt(px*px + py*py + pz*pz) - radius;
    
    let cb = radius * 0.75;
    let cqx = abs(px) - cb; let cqy = abs(py) - cb; let cqz = abs(pz) - cb;
    let dCube = sqrt(max(cqx, 0.0)*max(cqx, 0.0) + max(cqy, 0.0)*max(cqy, 0.0) + max(cqz, 0.0)*max(cqz, 0.0)) + min(max(cqx, max(cqy, cqz)), 0.0);
    
    let rb = radius * 0.6; let rRad = radius * 0.2;
    let rqx = abs(px) - rb; let rqy = abs(py) - rb; let rqz = abs(pz) - rb;
    let dRoundBox = sqrt(max(rqx, 0.0)*max(rqx, 0.0) + max(rqy, 0.0)*max(rqy, 0.0) + max(rqz, 0.0)*max(rqz, 0.0)) + min(max(rqx, max(rqy, rqz)), 0.0) - rRad;
    
    let cylR = radius * 0.6; let cylH = radius * 0.8;
    let cyldX = sqrt(px*px + pz*pz) - cylR; let cyldY = abs(py) - cylH;
    let dCyl = min(max(cyldX, cyldY), 0.0) + sqrt(max(cyldX, 0.0)*max(cyldX, 0.0) + max(cyldY, 0.0)*max(cyldY, 0.0));
    
    let tx = radius * 0.6; let ty = radius * 0.3;
    let tqx = sqrt(px*px + pz*pz) - tx;
    let dTorus = sqrt(tqx*tqx + py*py) - ty;
    
    let capH = radius * 0.5; let capR = radius * 0.35;
    let cap_pa_y = py - capH; let cap_ba_y = -capH * 2.0;
    let cap_h = clamp((cap_pa_y * cap_ba_y) / (cap_ba_y * cap_ba_y), 0.0, 1.0);
    let cap_cy = cap_pa_y - cap_ba_y * cap_h;
    let dCapsule = sqrt(px*px + cap_cy*cap_cy + pz*pz) - capR;
    
    let octS = radius * 1.1;
    let dOcta = (abs(px) + abs(py) + abs(pz) - octS) * 0.57735027;
    
    let ex = radius * 0.9; let ey = radius * 0.4; let ez = radius * 0.9;
    let ek0 = sqrt((px/ex)*(px/ex) + (py/ey)*(py/ey) + (pz/ez)*(pz/ez));
    let ek1 = sqrt((px/(ex*ex))*(px/(ex*ex)) + (py/(ey*ey))*(py/(ey*ey)) + (pz/(ez*ez))*(pz/(ez*ez)));
    let dEllipsoid = ek0 * (ek0 - 1.0) / ek1;

    let u0 = step(abs(shapeModeUni - 0.0), 0.1);
    let u1 = step(abs(shapeModeUni - 1.0), 0.1);
    let u2 = step(abs(shapeModeUni - 2.0), 0.1);
    let u3 = step(abs(shapeModeUni - 3.0), 0.1);
    let u4 = step(abs(shapeModeUni - 4.0), 0.1);
    let u5 = step(abs(shapeModeUni - 5.0), 0.1);
    let u6 = step(abs(shapeModeUni - 6.0), 0.1);
    let u7 = step(abs(shapeModeUni - 7.0), 0.1);

    let isInside = 
      step(dSphere, 0.0) * u0 +
      step(dCube, 0.0) * u1 +
      step(dRoundBox, 0.0) * u2 +
      step(dCyl, 0.0) * u3 +
      step(dTorus, 0.0) * u4 +
      step(dCapsule, 0.0) * u5 +
      step(dOcta, 0.0) * u6 +
      step(dEllipsoid, 0.0) * u7;

    inputs.position *= isInside; 
    let isOutside = 1.0 - isInside;
    inputs.position.y += isOutside * 999999.0; 

    // Calculate all three delay types
    let randomDelay = startDelayUni + j * startDelayUni + rand([id, 0.1234]) * startDelayUni;
    let trigDelay = startDelayUni + j * startDelayUni + spatialNoise(px, py, pz, clumpScaleUni) * startDelayUni * 4.0;
    let perlinDelay = startDelayUni + j * startDelayUni + perlinLikeNoise(px, py, pz, clumpScaleUni) * startDelayUni * 4.0;
    
    // Create mathematical toggles based on the mode uniform
    let uRand = step(abs(modeUni - 0.0), 0.1);
    let uTrig = step(abs(modeUni - 1.0), 0.1);
    let uPerlin = step(abs(modeUni - 2.0), 0.1);

    // Combine them! Only the active UI mode will be multiplied by 1.0
    let delayFrames = (randomDelay * uRand) + (trigDelay * uTrig) + (perlinDelay * uPerlin);
    
    let timeActive = max(0.0, currentFrameUni - delayFrames);
    let fallY = 0.5 * gUni * timeActive * timeActive;
    
    py += fallY; 
    let p = [px, py, pz]; 
    inputs.position += p;

    return inputs;
  });

  getWorldInputs((inputs) => {
    inputs.color = [1.0, 1.0, 1.0, 1.0];
    return inputs;
  });
}

function calculateResetTime() {
  // 1. Where does the bottom of the shape end? (Ratio of n)
  // Shapes with smaller Y-footprints don't reach the bottom of the grid
  let bottomRatio = 1.0; 
  switch(params.shapeMode) {
    case 3: bottomRatio = 0.9; break;  // Cylinder
    case 4: bottomRatio = 0.65; break; // Torus
    case 5: bottomRatio = 0.75; break; // Capsule
    case 7: bottomRatio = 0.7; break;  // Ellipsoid
  }
  
  let maxJ = n * bottomRatio;

  // 2. Predict the Maximum Delay
  let maxRandomMultiplier = params.delayMode === "Noise" ? 4.0 : 1.0;
  let maxDelay = startDelay + (maxJ * startDelay) + (startDelay * maxRandomMultiplier);

  // 3. Predict the Fall Time
  // Distance from top of the grid to the bottom of the screen (plus a safety buffer)
  let maxDist = (height / 2.0) + (w / 2.0) + (w / n) * 2; 
  
  // The inverted physics formula! t = sqrt(2d / g)
  let fallTime = Math.sqrt((2.0 * maxDist) / params.gravStrength);

  // Return the total predicted frames
  return maxDelay + fallTime;
}
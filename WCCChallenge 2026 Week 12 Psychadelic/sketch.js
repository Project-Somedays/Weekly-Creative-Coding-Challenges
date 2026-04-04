// Added a 6th color to the palette for 12 total movers
const hexColors = ["#ffbe0b", "#fb5607", "#ff006e", "#8338ec", "#3a86ff", "#06d6a0"];
let movers = [];
let metaballFilter;

// --- Mover Class ---
class Mover {
  constructor() {
    this.x = random(windowWidth);
    this.y = random(windowHeight);
    this.vx = random(-5, 5);
    this.vy = random(-5, 5);
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x <= 0 || this.x >= width) this.vx *= -1;
    if (this.y <= 0 || this.y >= height) this.vy *= -1;
  }
}

// --- The Refactored Shader Callback ---
function metaballCallback() {
  const aspect = uniformFloat(() => width / height);

  // 1. Pack our positions into uniformVector2s
  const p0  = uniformVector2(() => [movers[0].x / width, movers[0].y / height]);
  const p1  = uniformVector2(() => [movers[1].x / width, movers[1].y / height]);
  const p2  = uniformVector2(() => [movers[2].x / width, movers[2].y / height]);
  const p3  = uniformVector2(() => [movers[3].x / width, movers[3].y / height]);
  const p4  = uniformVector2(() => [movers[4].x / width, movers[4].y / height]);
  const p5  = uniformVector2(() => [movers[5].x / width, movers[5].y / height]);
  const p6  = uniformVector2(() => [movers[6].x / width, movers[6].y / height]);
  const p7  = uniformVector2(() => [movers[7].x / width, movers[7].y / height]);
  const p8  = uniformVector2(() => [movers[8].x / width, movers[8].y / height]);
  const p9  = uniformVector2(() => [movers[9].x / width, movers[9].y / height]);
  const p10 = uniformVector2(() => [movers[10].x / width, movers[10].y / height]);
  const p11 = uniformVector2(() => [movers[11].x / width, movers[11].y / height]);

  // 2. Define our colors explicitly as uniformVector3s
  const c0 = uniformVector3(() => [1.000, 0.745, 0.043]); // #ffbe0b
  const c1 = uniformVector3(() => [0.984, 0.337, 0.027]); // #fb5607
  const c2 = uniformVector3(() => [1.000, 0.000, 0.431]); // #ff006e
  const c3 = uniformVector3(() => [0.514, 0.220, 0.925]); // #8338ec
  const c4 = uniformVector3(() => [0.227, 0.525, 1.000]); // #3a86ff
  const c5 = uniformVector3(() => [0.024, 0.839, 0.627]); // #06d6a0 (Mint)

  // 3. THE REUSABLE FUNCTION
  // p5.strands will automatically convert this JS function into a GLSL function!
  // function calculateGlow(pixelCoord, moverPos, moverColor, falloff, aspectRatio) {
  //   let d = distance(pixelCoord, [moverPos.x * aspectRatio, moverPos.y]);
  //   return moverColor * exp(-d * falloff);
  // }
  function calculateGlow(pixelCoord, moverPos, moverColor, falloff, aspectRatio) {
    // Because we center the canvas to (0,0) for the kaleidoscope, 
    // we also need to center the mover positions (-0.5 to 0.5)
    let mx = (moverPos.x - 0.5) * aspectRatio;
    let my = moverPos.y - 0.5;
    
    let d = distance(pixelCoord, vec2(mx, my));
    return moverColor * exp(-d * falloff);
  }

  getColor((inputs) => {
    let st = inputs.texCoord;
    st.x = st.x - 0.5;
    st.y = st.y - 0.5;
    // 1. Center the canvas so (0,0) is in the exact middle
    st.x *= aspect; // Correct screen aspect ratio

    // 2. Convert Cartesian (X/Y) to Polar (Radius/Angle)
    let r = length(st);
    let a = atan(st.y, st.x); // p5.strands safely transpiles this to GLSL

    // 3. FOLD SPACE! (The Kaleidoscope Math)
    let PI = 3.14159265359;
    let slice = PI / 3.0;        // 6 total slices of PI/4
    let halfSlice = slice / 2.0; // Folded in half, making 16 mirrored PI/8 slivers
    a = a + PI; // Shift angle to be strictly positive (0 to TWO_PI) for clean math
    a = abs(mod(a, slice) - halfSlice); // The mathematical origami fold

    // 4. Convert back to Cartesian (X/Y) coordinates
    st = vec2(r * cos(a), r * sin(a));

    // 5. Calculate the glow using our newly folded coordinate grid
    let col = vec3(0.0);
    let falloff = 10.0;

    // 4. The math block is now clean, DRY, and highly readable!
    col += calculateGlow(st, p0,  c0, falloff, aspect);
    col += calculateGlow(st, p1,  c0, falloff, aspect);
    
    col += calculateGlow(st, p2,  c1, falloff, aspect);
    col += calculateGlow(st, p3,  c1, falloff, aspect);
    
    col += calculateGlow(st, p4,  c2, falloff, aspect);
    col += calculateGlow(st, p5,  c2, falloff, aspect);
    
    col += calculateGlow(st, p6,  c3, falloff, aspect);
    col += calculateGlow(st, p7,  c3, falloff, aspect);
    
    col += calculateGlow(st, p8,  c4, falloff, aspect);
    col += calculateGlow(st, p9,  c4, falloff, aspect);
    
    col += calculateGlow(st, p10, c5, falloff, aspect);
    col += calculateGlow(st, p11, c5, falloff, aspect);

    return [col, 1.0];
  });
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  pixelDensity(1);
  
  // Populate the 12 movers
  for (let i = 0; i < 12; i++) {
    movers.push(new Mover());
  }
  
  metaballFilter = baseFilterShader().modify(metaballCallback);
}

function draw() {
  background(0);
  
  for (let m of movers) {
    m.update();
  }
  
  filter(metaballFilter);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// let movers = [];
// let metaballFilter;

// // --- Mover Class ---
// class Mover {
//   constructor() {
//     this.x = random(windowWidth);
//     this.y = random(windowHeight);
//     this.vx = random(-3, 3);
//     this.vy = random(-3, 3);
//   }

//   update() {
//     this.x += this.vx;
//     this.y += this.vy;
//     if (this.x <= 0 || this.x >= width) this.vx *= -1;
//     if (this.y <= 0 || this.y >= height) this.vy *= -1;
//   }
// }

// // --- The p5.strands Shader Callback ---
// // This translates our JavaScript directly into a GLSL Fragment Shader!
// function metaballCallback() {
//   // Pass dynamic uniforms using closures so they update every frame
//   const aspect = uniformFloat(() => width / height);
  
//   // We pass 10 independent X and Y positions for our movers
//   const px0 = uniformFloat(() => movers[0].x / width);
//   const py0 = uniformFloat(() => movers[0].y / height);
//   const px1 = uniformFloat(() => movers[1].x / width);
//   const py1 = uniformFloat(() => movers[1].y / height);
//   const px2 = uniformFloat(() => movers[2].x / width);
//   const py2 = uniformFloat(() => movers[2].y / height);
//   const px3 = uniformFloat(() => movers[3].x / width);
//   const py3 = uniformFloat(() => movers[3].y / height);
//   const px4 = uniformFloat(() => movers[4].x / width);
//   const py4 = uniformFloat(() => movers[4].y / height);
//   const px5 = uniformFloat(() => movers[5].x / width);
//   const py5 = uniformFloat(() => movers[5].y / height);
//   const px6 = uniformFloat(() => movers[6].x / width);
//   const py6 = uniformFloat(() => movers[6].y / height);
//   const px7 = uniformFloat(() => movers[7].x / width);
//   const py7 = uniformFloat(() => movers[7].y / height);
//   const px8 = uniformFloat(() => movers[8].x / width);
//   const py8 = uniformFloat(() => movers[8].y / height);
//   const px9 = uniformFloat(() => movers[9].x / width);
//   const py9 = uniformFloat(() => movers[9].y / height);

//   // This block runs for every single pixel on the canvas
//   getColor((inputs) => {
//     let st = inputs.texCoord;
//     st.x *= aspect; // Prevent our circular glows from stretching
    
//     // vec3 is a built-in strand function equivalent to GLSL's vec3
//     let col = vec3(0.0);
//     let falloff = 6.0; // Higher = smaller glow, Lower = wider glow

//     // Color 1: #ffbe0b (Normalized RGB: 1.0, 0.745, 0.043)
//     let d0 = distance(st, [px0 * aspect, py0]);
//     col += vec3(1.000, 0.745, 0.043) * exp(-d0 * falloff);
//     let d1 = distance(st, [px1 * aspect, py1]);
//     col += vec3(1.000, 0.745, 0.043) * exp(-d1 * falloff);

//     // Color 2: #fb5607 (Normalized RGB: 0.984, 0.337, 0.027)
//     let d2 = distance(st, [px2 * aspect, py2]);
//     col += vec3(0.984, 0.337, 0.027) * exp(-d2 * falloff);
//     let d3 = distance(st, [px3 * aspect, py3]);
//     col += vec3(0.984, 0.337, 0.027) * exp(-d3 * falloff);

//     // Color 3: #ff006e (Normalized RGB: 1.0, 0.0, 0.431)
//     let d4 = distance(st, [px4 * aspect, py4]);
//     col += vec3(1.000, 0.000, 0.431) * exp(-d4 * falloff);
//     let d5 = distance(st, [px5 * aspect, py5]);
//     col += vec3(1.000, 0.000, 0.431) * exp(-d5 * falloff);
    
//     // Color 4: #8338ec (Normalized RGB: 0.514, 0.220, 0.925)
//     let d6 = distance(st, [px6 * aspect, py6]);
//     col += vec3(0.514, 0.220, 0.925) * exp(-d6 * falloff);
//     let d7 = distance(st, [px7 * aspect, py7]);
//     col += vec3(0.514, 0.220, 0.925) * exp(-d7 * falloff);
    
//     // Color 5: #3a86ff (Normalized RGB: 0.227, 0.525, 1.0)
//     let d8 = distance(st, [px8 * aspect, py8]);
//     col += vec3(0.227, 0.525, 1.000) * exp(-d8 * falloff);
//     let d9 = distance(st, [px9 * aspect, py9]);
//     col += vec3(0.227, 0.525, 1.000) * exp(-d9 * falloff);

//     // p5.strands automatically unpacks nested arrays back into vectors
//     return [col, 1.0];
//   });
// }

// function setup() {
//   createCanvas(windowWidth, windowHeight, WEBGL);
//   pixelDensity(1);
  
//   // Populate the movers
//   for (let i = 0; i < 10; i++) {
//     movers.push(new Mover());
//   }
  
//   // Initialize our p5.strands filter shader
//   metaballFilter = baseFilterShader().modify(metaballCallback);
// }

// function draw() {
//   background(0);
  
//   // Update physics
//   for (let m of movers) {
//     m.update();
//   }
  
//   // Apply our strand-based distance field shader!
//   filter(metaballFilter);
// }

// function windowResized() {
//   resizeCanvas(windowWidth, windowHeight);
// }


// let moverShader;
// let movers = [];

// function moverCallback() {
//   const p0 = uniformVector2(() => [movers[0].x, movers[0].y]);
//   const p1 = uniformVector2(() => [movers[1].x, movers[1].y]);
//   const p2 = uniformVector2(() => [movers[2].x, movers[2].y]);
//   const p3 = uniformVector2(() => [movers[3].x, movers[3].y]);
//   const p4 = uniformVector2(() => [movers[4].x, movers[4].y]);

//   // Declare colours as uniform vec3s so they're proper shader nodes
//   const c0 = uniformVector3(() => [1.000, 0.745, 0.043]); // #ffbe0b
//   const c1 = uniformVector3(() => [0.984, 0.337, 0.027]); // #fb5607
//   const c2 = uniformVector3(() => [1.000, 0.000, 0.431]); // #ff006e
//   const c3 = uniformVector3(() => [0.514, 0.220, 0.925]); // #8338ec
//   const c4 = uniformVector3(() => [0.227, 0.525, 1.000]); // #3a86ff
//   const bgColor = uniformVector3(() => [0.01, 0.01, 0.01]);

//   const aspect = uniformFloat(() => width / height);

//   getFinalColor((inputs) => {
//     let coord = inputs.texCoord;

//     let d0x = (coord.x - p0.x) * aspect; let d0y = coord.y - p0.y; let sq0 = d0x*d0x + d0y*d0y;
//     let d1x = (coord.x - p1.x) * aspect; let d1y = coord.y - p1.y; let sq1 = d1x*d1x + d1y*d1y;
//     let d2x = (coord.x - p2.x) * aspect; let d2y = coord.y - p2.y; let sq2 = d2x*d2x + d2y*d2y;
//     let d3x = (coord.x - p3.x) * aspect; let d3y = coord.y - p3.y; let sq3 = d3x*d3x + d3y*d3y;
//     let d4x = (coord.x - p4.x) * aspect; let d4y = coord.y - p4.y; let sq4 = d4x*d4x + d4y*d4y;

//     let d0 = sqrt(sq0); let d1 = sqrt(sq1); let d2 = sqrt(sq2);
//     let d3 = sqrt(sq3); let d4 = sqrt(sq4);

//     const falloff = 16.0;

//     let w0 = exp(-falloff * d0);
//     let w1 = exp(-falloff * d1);
//     let w2 = exp(-falloff * d2);
//     let w3 = exp(-falloff * d3);
//     let w4 = exp(-falloff * d4);

//     let bgWeight = 0.001;
//     let totalWeight = w0 + w1 + w2 + w3 + w4 + bgWeight;

//     inputs.color.rgb = (c0*w0 + c1*w1 + c2*w2 + c3*w3 + c4*w4 + bgColor*bgWeight) * (1.0 / totalWeight);
//     inputs.color.a = 1.0;

//     return inputs;

//   });
// }

// async function setup() {
//   createCanvas(windowWidth, windowHeight, WEBGL);
//   noStroke();
  
//   for (let i = 0; i < 5; i++) {
//     movers.push({
//       x: random(1),
//       y: random(1),
//       vx: random(-0.005, 0.005),
//       vy: random(-0.005, 0.005)
//     });
//   }
  
//   moverShader = baseMaterialShader().modify(moverCallback);
// }

// function draw() {
//   background(0);
//   // ambientLight(255);
//   directionalLight(255, 255, 255, 0, 0, -1);
  
//   for (let m of movers) {
//     m.x += m.vx;
//     m.y += m.vy;
//     if (m.x <= 0 || m.x >= 1) m.vx *= -1;
//     if (m.y <= 0 || m.y >= 1) m.vy *= -1;
//   }
  
//   shader(moverShader);
//   plane(width, height);
// }

// function windowResized() {
//   resizeCanvas(windowWidth, windowHeight);
// }
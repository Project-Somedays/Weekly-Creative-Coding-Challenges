
let myShader;
let img1, img2;
let morphAmount = 0;

function preload() {
  img1 = loadImage('415px-RWS_Tarot_01_Magician.jpg');
  img2 = loadImage('429px-RWS_Tarot_00_Fool.jpg');
}

function setup() {
  createCanvas(600, 600, WEBGL);
  noStroke();
  
  // Create shader using the strings defined below
  myShader = createShader(vertShader, fragShader);
}

function draw() {
  shader(myShader);
  
  myShader.setUniform('uTexture0', img1);
  myShader.setUniform('uTexture1', img2);
  myShader.setUniform('uMorphAmount', morphAmount);
  myShader.setUniform('uResolution', [width, height]);
  myShader.setUniform('uTime', millis() / 1000.0);
  
  rect(0, 0, width, height);
  
  morphAmount = map(sin(frameCount * 0.01), -1, 1, 0, 1);
}

// Vertex Shader
const vertShader = `
attribute vec3 aPosition;
attribute vec2 aTexCoord;

varying vec2 vTexCoord;

void main() {
  vTexCoord = aTexCoord;
  vTexCoord.y = 1.0 - vTexCoord.y;  // Flip the y coordinate
  vec4 positionVec4 = vec4(aPosition, 1.0);
  positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
  gl_Position = positionVec4;
}
`;

// const fragShader = `
// precision mediump float;

// uniform sampler2D uTexture0;
// uniform sampler2D uTexture1;
// uniform float uMorphAmount;
// uniform float uTime;
// uniform vec2 uResolution;

// varying vec2 vTexCoord;

// // Pseudo-random function
// float random(vec2 st) {
//     return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
// }

// // Perlin noise function (simplified)
// float noise(vec2 st) {
//     vec2 i = floor(st);
//     vec2 f = fract(st);
//     float a = random(i);
//     float b = random(i + vec2(1.0, 0.0));
//     float c = random(i + vec2(0.0, 1.0));
//     float d = random(i + vec2(1.0, 1.0));
//     vec2 u = f * f * (3.0 - 2.0 * f);
//     return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
// }

// vec2 chaoticSwirl(vec2 uv, float time) {
//     vec2 center = vec2(0.5, 0.5);
//     vec2 tc = uv - center;
//     float dist = length(tc);
    
//     // Multiple layers of noise for more chaos
//     float angle = 5.0 * noise(uv * 3.0 + time * 0.1) +
//                   3.0 * noise(uv * 5.0 - time * 0.2) +
//                   2.0 * noise(uv * 7.0 + time * 0.3);
    
//     // Vary the swirl intensity based on distance and time
//     float intensity = sin(dist * 10.0 + time) * 0.5 + 0.5;
//     intensity *= 1.0 - smoothstep(0.0, 0.7, dist);
    
//     float s = sin(angle * intensity);
//     float c = cos(angle * intensity);
    
//     tc = vec2(dot(tc, vec2(c, -s)), dot(tc, vec2(s, c)));
    
//     // Add some wobble
//     tc += 0.01 * sin(tc * 20.0 + time);
    
//     return tc + center;
// }

// void main() {
//     vec2 uv = gl_FragCoord.xy / uResolution.xy;
//     vec2 swirled_coords = chaoticSwirl(uv, uTime);
    
//     vec4 color1 = texture2D(uTexture0, swirled_coords);
//     vec4 color2 = texture2D(uTexture1, swirled_coords);
    
//     gl_FragColor = mix(color1, color2, uMorphAmount);
// }
// `;

// // Fragment Shader
const fragShader = `
precision mediump float;

uniform sampler2D uTexture0;
uniform sampler2D uTexture1;
uniform float uMorphAmount;
uniform vec2 uResolution;
uniform float uTime;

varying vec2 vTexCoord;

// Pseudo-random function
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

// Perlin noise function (simplified)
float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

vec2 chaoticSwirl(vec2 uv, float time) {
    vec2 center = vec2(0.5, 0.5);
    vec2 tc = uv - center;
    float dist = length(tc);
    
    // Multiple layers of noise for more chaos
    float angle = 5.0 * noise(uv * 3.0 + time * 0.1) +
                  3.0 * noise(uv * 5.0 - time * 0.2) +
                  2.0 * noise(uv * 7.0 + time * 0.3);
    
    // Vary the swirl intensity based on distance and time
    float intensity = sin(dist * 10.0 + time) * 0.5 + 0.5;
    intensity *= 1.0 - smoothstep(0.0, 0.7, dist);
    
    float s = sin(angle * intensity);
    float c = cos(angle * intensity);
    
    tc = vec2(dot(tc, vec2(c, -s)), dot(tc, vec2(s, c)));
    
    // Add some wobble
    tc += 0.01 * sin(tc * 20.0 + time);
    
    return tc + center;
}


vec2 swirl(vec2 uv, float radius, float angle) {
  vec2 center = vec2(0.5, 0.5);
  vec2 tc = uv - center;
  float dist = length(tc);
  if (dist < radius) {
    float percent = (radius - dist) / radius;
    float theta = percent * percent * angle;
    float s = sin(theta);
    float c = cos(theta);
    tc = vec2(dot(tc, vec2(c, -s)), dot(tc, vec2(s, c)));
  }
  return tc + center;
}

void main() {
  // float swirl_radius = 0.5;
  // float swirl_angle = 3.0 * sin(uTime);
  
  // vec2 swirled_coords = swirl(vTexCoord, swirl_radius, swirl_angle);
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  vec2 swirled_coords = chaoticSwirl(uv, uTime);
      
  vec4 color1 = texture2D(uTexture0, swirled_coords);
  vec4 color2 = texture2D(uTexture1, swirled_coords);
  
  gl_FragColor = mix(color1, color2, uMorphAmount);
}
`;

// // Shader variables
// let theShader;
// let shaderBg;
// let img1, img2;

// function preload() {
//   // load the shader
//   theShader = loadShader("vertex.glsl", "fragment.glsl");
//   // theShader = loadShader(shaderVertex, shaderFrag);
//   img1 = loadImage('415px-RWS_Tarot_01_Magician.jpg');
//   img2 = loadImage('429px-RWS_Tarot_00_Fool.jpg');
// }

// function setup() {
// 	createCanvas(windowWidth, windowHeight);
// 	 // disables scaling for retina screens which can create inconsistent scaling between displays
//   pixelDensity(1);
//   noStroke();

//   // shaders require WEBGL mode to work
//   shaderBg = createGraphics(windowWidth, windowHeight, WEBGL);
// }

// function draw() {
//   // we can draw the background each frame or not.
//   // if we do we can use transparency in our shader.
//   // if we don't it will leave a trailing after image.
//   // background(0);
//   // shader() sets the active shader with our shader
//   shaderBg.shader(theShader);

//   theShader.setUniform('uTexture0', img1);
//   theShader.setUniform('uTexture1', img2);
//   theShader.setUniform('uMorphAmount', morphAmount);
//   theShader.setUniform('uTime', millis() / 1000.0);

//   // get the mouse coordinates, map them to values between 0-1 space
//   let yMouse = (map(mouseY, 0, height, height, 0) / height) * 2 - 1;
//   let xMouse = (mouseX / width) * 2 - 1;

//   // Make sure pixels are square
//   xMouse = (xMouse * width) / height;
//   yMouse = yMouse;

//   // pass the interactive information to the shader
//   theShader.setUniform("iResolution", [width, height]);
//   theShader.setUniform("iTime", millis() / 1000.0);
//   theShader.setUniform("iMouse", [xMouse, yMouse]);

//   // rect gives us some geometry on the screen to draw the shader on
//   shaderBg.rect(0, 0, width, height);
//   image(shaderBg, 0, 0, width, height);

//   morphAmount = map(sin(frameCount * 0.01), -1, 1, 0, 1);  
// }

// function windowResized() {
//   resizeCanvas(windowWidth, windowHeight);
// 	theShader.setUniform("iResolution", [width, height]);
// }

// const shaderVertex = `
// // These are necessary definitions that let you graphics card know how to render the shader
// #ifdef GL_ES
// precision highp float;
// #endif

// // Vertex attributes
// attribute vec3 aPosition;
// attribute vec2 aTexCoord;

// // Pass-through to the fragment shader
// varying vec2 vTexCoord;

// void main() {
//     // Pass texture coordinates to the fragment shader
//     vTexCoord = aTexCoord;

//     // Transform the position into normalized device coordinates (NDC)
//     vec4 positionVec4 = vec4(aPosition, 1.0);

//     // Scale and shift to NDC (Normalize Device Coordinate) range [-1, 1]
//     positionVec4.xy = positionVec4.xy * 2.0 - 1.0;

//     // Set the final position of the vertex
//     gl_Position = positionVec4;
// }
// `

// const shaderFrag = `
// /*
//  * You can use this as a template to make shaders! Have fun!
//  */

// // These are necessary definitions that let you graphics card know how to render the shader
// #ifdef GL_ES
// precision highp float;
// #endif

// // These are our passed in information from the sketch.js
// uniform vec2 iResolution;
// uniform float iTime;
// //uniform vec2 iMouse;

// varying vec2 vTexCoord;

// void main() {
//     // Map vTexCoord to normalized device coordinates (NDC) [-1, 1]
//     vec2 uv = vTexCoord * 2.0 - 1.0;
    
//     // Define a scale factor
//     const float scale = 1.0;

//     // Adjust for aspect ratio and scale the coordinates
//     uv.x *= scale * iResolution.x / iResolution.y;
//     uv.y *= scale;
		
// 		//uv = fract(uv * 2.0) - 0.5;
    
//     float d = length(uv);
// 		d = sin( d * 8.0 - iTime )/8.0;
// 		//d-=0.5;
// 		d = abs(d);
// 		d = smoothstep(0.0, .01, d);
        
//     //vec3 col = vec3(length(uv));

//     // Output the final color with full opacity
//     gl_FragColor = vec4(d, d, d, 1.0);
// }
// `
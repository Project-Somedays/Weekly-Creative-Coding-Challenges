/*
Author: Project Somedays
Date: 2024-07-07
Title: WCCChallenge - Beneath the Surface

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/S8c7qcjw2b

Recycling a project from a while back sampling from one image or another https://openprocessing.org/sketch/2264236
Was NOT happy with the performance and delving into shaders has been on my list for a long time now.
ChatGPT to the rescue! Hacked together SOMETHING that kind of worked anyway.
Something a bit off with the noise progression, but that's for another day.

HOW DOES IT WORK?
  - 2D Noise field with a third time axis
  - Decide which image to sample from based on the value of noise for that pixel
  - "Feathering" is actually a smoothstep blend to 0 or 1 within a narrow bandwidth about the midPoint if that makes sense between the two images

INTERACTION
Use the sliders (courtesy of the lil-gui libray = my new favourite prototyping tool)

RESOURCES:
Reasonable amount of photoshop work = fair use (hopefully?)
  - Dorian Grey: https://bookmarks.reviews/an-1890-review-of-the-picture-of-dorian-gray/
  - Jekyll and Hyde: https://tvtropes.org/pmwiki/pmwiki.php/Main/JekyllAndHyde
  - Smeagol and Gollum: https://qph.cf2.quoracdn.net/main-qimg-90a17fbcec539f0b1cf3876c1da47acc
  - Venom and Tom Hardy: https://images.thedirect.com/media/article_full/venom-3-tom-hardy-production.jpg
  - Body systems: Starting image was screenshot from https://stock.adobe.com/au/images/human-body-systems-muscular-skeletal-systems-internal-organs-and-parts-educative-anatomy-flashcards-poster-vector-illustration-full-length-isolated-image-diagram-of-man-male/487145121

TODOs/OPPORTUNITIES
  - Clean up my less-than-brilliant photoshop work
  - Try substituting noise algorithms from Book of Shaders - the progression is weird on ChatGPT's
  - Make some more duality images
  - Refactor to handle as many layers as we like

QUESTIONS
  - How do I get helpful error messages to come up when loading fragShader from strings like I am here? 
  
I use VS Code... any helpful plug-ins you'd recommend for actually debugging shader code? Lost a few hours with the very unhelpful message :
"parameter 1 is not of type WEBGLProgram" = I mispelled a variable name SOMEWHERE and tracking it down was a nightmare.
*/

let shaderProgram;
let gui;
let params;
let imageSets = [];

function preload() {
  // Load the images

  //Dorian Gray
  imageSets.push( {
    images : [loadImage('Dorian-Gray-Dorian.png'),loadImage('Dorian-Gray-Picture.png')],
    fragShader: fragShader3DBinary
  });

  //JekyllandHyde
  imageSets.push( {
    images : [loadImage('JekyllandHyde_Hyde.png'),loadImage('JekyllandHyde_Jekyll.png')],
    fragShader: fragShader3DBinary
  });

  //JekyllandHyde
  imageSets.push( {
    images : [loadImage('SmeagolGollum_Gollum.png'),loadImage('SmeagolGollum_Smeagol.png')],
    fragShader: fragShader3DBinary
  });

  // VenomTom
  imageSets.push( {
    images : [loadImage('VenomTom_Switch.png'),loadImage('VenomTom_Normal.png')],
    fragShader: fragShader3DBinary
  });

  imageSets.push({
    images: [loadImage('body_A.png'), loadImage('body_B.png'),loadImage('body_C.png'), loadImage('body_D.png') ],
    fragShader: fragShader3Dwith4Layers
  }); 
}

function setup() {
  // createCanvas(min(windowWidth, windowHeight),min(windowWidth, windowHeight), WEBGL);
  createCanvas(1080, 1080, WEBGL);
  noStroke();

  params = {
    imgIx: 0,
    uFeathering: 0.025,
    uNoiseDetail: 7.5,
    noiseProgressSlowness: 10000
  }

  gui = new lil.GUI();
  gui.add(params, 'imgIx', 0, imageSets.length - 1, 1)
    .onChange(() => {
      shaderProgram = createShader(vertShader, imageSets[params.imgIx].fragShader);
    });
  gui.add(params, 'uFeathering', 0, 0.125, 0.005);
  gui.add(params, 'uNoiseDetail', 0, 20, 0.1);
  gui.add(params, 'noiseProgressSlowness', 500, 20000, 250);

  // Load the shader
  shaderProgram = createShader(vertShader, imageSets[params.imgIx].fragShader);
  
}


function draw() {
  background(0);
  shader(shaderProgram);
  imageArr = imageSets[params.imgIx].images;
  // Pass the images and time to the shader
  for(let i = 0; i < imageArr.length; i++){
    shaderProgram.setUniform(`uTex${i+1}`, imageArr[i]);
  }
  shaderProgram.setUniform('uTime', millis() / params.noiseProgressSlowness);
  shaderProgram.setUniform('uFeathering', params.uFeathering);
  shaderProgram.setUniform('uNoiseDetail', params.uNoiseDetail);
  
  // Draw a rectangle to cover the entire canvas
  beginShape();
  vertex(-1, -1, 0, 0, 0);  // Bottom-left corner
  vertex(1, -1, 0, 1, 0);   // Bottom-right corner
  vertex(1, 1, 0, 1, 1);    // Top-right corner
  vertex(-1, 1, 0, 0, 1);   // Top-left corner
  endShape(CLOSE);   // Top-left
  // endShape(CLOSE);
  // rect(-width/2, -height/2, width, height);
}

function windowResized() {
  // resizeCanvas(min(windowWidth, windowHeight),min(windowWidth, windowHeight));
  resizeCanvas(1080, 1080, WEBGL);
}


const vertShader = `
// Vertex shader

attribute vec3 aPosition;
attribute vec2 aTexCoord;

varying vec2 vTexCoord;

void main() {
  vTexCoord = vec2(aTexCoord.x, 1.0 - aTexCoord.y);
  gl_Position = vec4(aPosition, 1.0);
}
`

const fragShader3DBinary = `
#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D uTex1;
uniform sampler2D uTex2;
uniform float uTime;
uniform float uFeathering;
uniform float uNoiseDetail;

varying vec2 vTexCoord;

// Function to generate random values
float rand(vec3 co) {
    return fract(sin(dot(co.xyz, vec3(12.9898, 78.233, 37.719))) * 43758.5453);
}

// Function to generate 3D Perlin noise
float noise(vec3 pos) {
    vec3 i = floor(pos);
    vec3 f = fract(pos);

    float n000 = rand(i);
    float n100 = rand(i + vec3(1.0, 0.0, 0.0));
    float n010 = rand(i + vec3(0.0, 1.0, 0.0));
    float n110 = rand(i + vec3(1.0, 1.0, 0.0));
    float n001 = rand(i + vec3(0.0, 0.0, 1.0));
    float n101 = rand(i + vec3(1.0, 0.0, 1.0));
    float n011 = rand(i + vec3(0.0, 1.0, 1.0));
    float n111 = rand(i + vec3(1.0, 1.0, 1.0));

    vec3 u = f * f * (3.0 - 2.0 * f);

    float n00 = mix(n000, n100, u.x);
    float n10 = mix(n010, n110, u.x);
    float n01 = mix(n001, n101, u.x);
    float n11 = mix(n011, n111, u.x);

    float n0 = mix(n00, n10, u.y);
    float n1 = mix(n01, n11, u.y);

    return mix(n0, n1, u.z);
}

void main() {
  vec3 pos = vec3(vTexCoord, uTime);
  float n = noise(pos * uNoiseDetail);
  
  // Set n to 1 if n >= 0.5, otherwise set it to 0
  n = smoothstep(0.5 - uFeathering,0.5 + uFeathering, n);
  
  vec4 color1 = texture2D(uTex1, vTexCoord);
  vec4 color2 = texture2D(uTex2, vTexCoord);
  
  vec4 blendedColor = mix(color1, color2, n);
  
  gl_FragColor = blendedColor;
}
`

const fragShader3Dwith4Layers = `
#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D uTex1;
uniform sampler2D uTex2;
uniform sampler2D uTex3;
uniform sampler2D uTex4;
uniform float uTime;
uniform float uFeathering;
uniform float uNoiseDetail;

varying vec2 vTexCoord;

// Function to generate random values
float rand(vec3 co) {
    return fract(sin(dot(co.xyz, vec3(12.9898, 78.233, 37.719))) * 43758.5453);
}

// Function to generate 3D Perlin noise
float noise(vec3 pos) {
    vec3 i = floor(pos);
    vec3 f = fract(pos);

    float n000 = rand(i);
    float n100 = rand(i + vec3(1.0, 0.0, 0.0));
    float n010 = rand(i + vec3(0.0, 1.0, 0.0));
    float n110 = rand(i + vec3(1.0, 1.0, 0.0));
    float n001 = rand(i + vec3(0.0, 0.0, 1.0));
    float n101 = rand(i + vec3(1.0, 0.0, 1.0));
    float n011 = rand(i + vec3(0.0, 1.0, 1.0));
    float n111 = rand(i + vec3(1.0, 1.0, 1.0));

    vec3 u = f * f * (3.0 - 2.0 * f);

    float n00 = mix(n000, n100, u.x);
    float n10 = mix(n010, n110, u.x);
    float n01 = mix(n001, n101, u.x);
    float n11 = mix(n011, n111, u.x);

    float n0 = mix(n00, n10, u.y);
    float n1 = mix(n01, n11, u.y);

    return mix(n0, n1, u.z);
}

vec4 getColourBlend(float nVal, sampler2D texA, sampler2D texB, float lowerBound, float upperBound){
  float midPoint = (upperBound - lowerBound)/2.0;
  vec4 colourA = texture2D(texA, vTexCoord);
  vec4 colourB = texture2D(texB, vTexCoord);
  
  nVal = smoothstep(midPoint - uFeathering, midPoint + uFeathering, nVal);

  vec4 blendedColour = mix(colourA, colourB, nVal);
  return blendedColour;
}

void main() {
  vec3 pos = vec3(vTexCoord, uTime);
  float n = noise(pos * uNoiseDetail);

  vec4 blendedColour;
  
  // blend between images depending on which range the noise value sits in

  if(n < 0.25){
    blendedColour = getColourBlend(n, uTex1, uTex2, 0.0, 0.25);
  } else if(n < 0.5){
    blendedColour = getColourBlend(n, uTex2, uTex3, 0.25, 0.5);
  } else if(n < 0.75){
    blendedColour = getColourBlend(n, uTex3, uTex4, 0.5, 0.75); 
  } else{
   blendedColour = getColourBlend(n, uTex4, uTex1, 0.75, 1.0);
  }
  
  
  gl_FragColor = blendedColour;
}
`
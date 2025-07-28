/*
Author: Project Somedays
Date: 2024-07-13
Title: Reverse-Engineering Challenge Series: Chladni Figures

INSPIRATION/RESOURCES:
  - Rings of Power Opening Recreation by Steve Mould: https://www.youtube.com/watch?v=rjueHI002Fg
  - ChatGPT helped with the shader code 😍
*/

let shaderProgram;
let gui;
let params;
const maxVal = 10.0;
const minVal = 1.0;
let mPara, nPara, xPosPara, yPosPara;
let baseColourPalette;
let fullColourPalette;
let colourPaletteIndex = 0;
let yOff, xOff;
let thresholdModes = {
  smoothStepThresholdMode: 0,
  expThresholdMode: 1
}



let xPos = 0;
let yPos = 0;

let uM, uN;

function preload() {
  shaderProgram = createShader(vertShader, fragShaderChladni);
}

function setup() {
  createCanvas(min(windowWidth, windowHeight),min(windowWidth, windowHeight), WEBGL);
  // createCanvas(1080, 1080, WEBGL);
  noStroke();

  // baseColourPalette =  "#ff4800, #ff5c00, #fe7100, #fe8500, #fd9900, #fdae00, #fcc200, #fcd600, #fbeb00, #fbff00".split(", ").map(e => color(e));
  baseColourPalette = "#44d800, #ff8c00, #7f00ff, #ff3800, #a7fc00, #af0dd3, #ff2b67, #ffeb00, #00ffce, #ff1dce".split(", ").map(e => color(e));
  fullColourPalette = fillInColourPalette(baseColourPalette, 100);
  // console.log(fullColourPalette);
  
  params = {
    uM: 1.0,
    uN: 10.0,
    uZoomOutLevel: 1.0,
    uThreshold: 0.25,
    driveM: true,
    driveN: true,
    moveXY: true,
    uBlackAndWhiteMode: 0,
    cycleFrames: 15000,
    cycleColours: true,
    colourIndex: 0,
    cycleColourEveryXFrames: 10,
    slowZoomOut: true,
    uThresholdMode: thresholdModes.smoothStepThresholdMode
  }

  gui = new lil.GUI();
  gui.add(params, 'uM', 1.0, 10.0, 0.001);
  gui.add(params, 'uN', 1.0, 10.0, 0.001);
  gui.add(params, 'uZoomOutLevel', 0.1, 5.0, 0.01);
  gui.add(params, 'uThreshold', 0.001, 0.5, 0.001);
  gui.add(params, 'cycleFrames', 0,20000);
  gui.add(params, 'driveM');
  gui.add(params, 'driveN');
  gui.add(params, 'moveXY');
  gui.add(params, 'uBlackAndWhiteMode', {'blackAndWhiteMode' : 1, 'colourMode': 0});
  gui.add(params, 'cycleColours');
  gui.add(params, 'colourIndex', 0, fullColourPalette.length -1, 1);
  gui.add(params, 'cycleColourEveryXFrames',10,120,10);
  gui.add(params, 'slowZoomOut');
  gui.add(params, 'uThresholdMode', {"smoothStepThresholdMode": 0, "expThresholdMode" : 1});

  // mPara = createP(`m`);
  // nPara = createP(`n`);
  // xPosPara = createP("");
  // yPosPara = createP("");

  yOff = random(10000);
  xOff = random(10000);
}


function draw() {
  background(0);
  frameRate(60);
  shader(shaderProgram);

  if(params.cycleColours && frameCount%params.cycleColourEveryXFrames === 0) colourPaletteIndex = (colourPaletteIndex + 1)%fullColourPalette.length;
  if(!params.cycleColours) colourPaletteIndex = params.colourIndex;  

  let currentColour = fullColourPalette[colourPaletteIndex];
  // console.log(`${currentColour} = ${red(currentColour)} --> ${red(currentColour)/255.0}\n${green(currentColour)} --> ${green(currentColour)/255.0}\n${blue(currentColour)} --> ${blue(currentColour)/255.0}`);
  if(params.slowZoomOut) params.uZoomOutLevel += 0.001;
  


  
  // xPos = map(noise(xOff + frameCount/200), 0, 1, -width/2, width/2);
  // yPos = map(noise(yOff + frameCount/200), 0, 1, -height/2, height/2);

  if(params.moveXY) xPos = 5*noise(xOff + frameCount/2000);
  if(params.moveXY) yPos = 5*noise(yOff + frameCount/2000);

  uM = params.uM;
  uN = params.uN;
  
  if(params.driveM){
    m = 3.0 * 0.5*(cos(frameCount * TWO_PI /params.cycleFrames) + 1) + 3.0;
    uM = m;
  }

  if(params.driveN){
    n = 3.0 * 0.5*(cos(frameCount * TWO_PI /params.cycleFrames + PI) + 1) + 3.0;
    uN = n;
  } 
  
  shaderProgram.setUniform('uM', uM);
  shaderProgram.setUniform('uN', uN);
  shaderProgram.setUniform('xOff',xPos);
  shaderProgram.setUniform('yOff',yPos);
  shaderProgram.setUniform('uThreshold', params.uThreshold);
  shaderProgram.setUniform('uThresholdMode', params.uThresholdMode);
  shaderProgram.setUniform('uZoomOutLevel', params.uZoomOutLevel);
  shaderProgram.setUniform('uBlackAndWhiteMode', params.uBlackAndWhiteMode);
  shaderProgram.setUniform('uR', red(currentColour)/255.0);
  shaderProgram.setUniform('uG', green(currentColour)/255.0);
  shaderProgram.setUniform('uB', blue(currentColour)/255.0);
  shaderProgram.setUniform('uL', params.uL);

  
  
  
  // Draw a rectangle to cover the entire canvas
  beginShape();
  vertex(-1, -1, 0, 0, 0);  // Bottom-left corner
  vertex(1, -1, 0, 1, 0);   // Bottom-right corner
  vertex(1, 1, 0, 1, 1);    // Top-right corner
  vertex(-1, 1, 0, 0, 1);   // Top-left corner
  endShape(CLOSE);   // Top-left

  // rect(-width/2, -height/2, width, height);
  
//   nPara.html(`n: ${n}`);
//   mPara.html(`m: ${m}`);
//   xPosPara.html(`xPos: ${xPos}`);
//   yPosPara.html(`yPos: ${yPos}`);
}

function windowResized() {
  // resizeCanvas(min(windowWidth, windowHeight),min(windowWidth, windowHeight));
  resizeCanvas(1080, 1080, WEBGL);
}


const vertShader = `
attribute vec3 aPosition;
attribute vec2 aTexCoord;
varying vec2 vTexCoord;

void main() {
  vTexCoord = vec2(aTexCoord.x, 1.0 - aTexCoord.y);
  gl_Position = vec4(aPosition, 1.0);
}
`

const fragShaderChladni = `
#ifdef GL_ES
precision mediump float;
#endif

uniform float uM;
uniform float uN;
uniform float xOff;
uniform float yOff;
uniform float uThreshold;
uniform int uThresholdMode;
uniform float uZoomOutLevel;
uniform int uBlackAndWhiteMode;
uniform float uL;
uniform float uR;
uniform float uG;
uniform float uB;

varying vec2 vTexCoord;
float PI = 3.1415926535;

void main() {
  float x = (vTexCoord.x - xOff)*uZoomOutLevel;
  float y = (vTexCoord.y - yOff)*uZoomOutLevel;

  float term1 = cos(uM * PI * x) * cos(uN * PI * y);
  float term2 = cos(uN * PI * x) * cos(uM * PI * y);

  float result = abs(term1  - term2);

  // ##### SETTING THE THRESHOLD ##### //
  float intensity;
  if(uThresholdMode == 0){
    intensity = 1.0 - smoothstep(uThreshold/100.0, uThreshold, result);
  } else if(uThresholdMode == 1){
    intensity = exp(-result*15.0);
  }

  vec4 pixelColour;
  if(uBlackAndWhiteMode == 0){
    vec4 inputColour = vec4(uR, uG, uB, 1.0);
    vec4 bgColour = vec4(1.0 - uR, 1.0 - uG, 1.0 - uB, 1.0);
    pixelColour = mix(bgColour, inputColour, intensity);
  } else{
   pixelColour = vec4(intensity, intensity, intensity, 1.0);
  }
    
  gl_FragColor = pixelColour;
}
`

const normalizeColour = (colourInt) => float(colourInt)/255.0;



function fillInColourPalette(palette, subdivisions){
  let newPalette = [];
  for(let i = 0; i < palette.length; i++){
    for(let subdiv = 0; subdiv < subdivisions; subdiv ++){
      let colourA = palette[i];
      let colourB = palette[(i+1)%palette.length];
      let newCol = lerpColor(colourA, colourB, subdiv/subdivisions);
      newPalette.push(newCol);
    }
  }
  return newPalette;
}


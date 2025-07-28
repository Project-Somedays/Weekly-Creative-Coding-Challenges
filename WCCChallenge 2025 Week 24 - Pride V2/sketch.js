/*
| Author          | Project Somedays                      
| Title           | WCCChallenge 2025 Week 24 - Pride 
| 📅 Started      | 2025-06-15        
| 📅 Completed    | 2025-06-15        
| 🕒 Taken        | ~1hr (after I gave up on making my own 🤣)                               
| 🤯 Concept      | So many flags!       
| 🔎 Focus        | Trying to get familiar with shaders       

Only JUST changing anything about https://editor.p5js.org/cacheflowe/sketches/TKFuqnxVE 
Defs need to sit down and ACTUALLY put my mind to learning shaders.

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/g5J6Ajx9Am

*/

let fx;
let gui, params;
let flags;
let aspectRatio;
let vs = `
  attribute vec3 aPosition;
  attribute vec2 aTexCoord;
  varying vec2 vTexCoord;
  void main() {
    vTexCoord = aTexCoord;
    vec4 positionVec4 = vec4(aPosition, 1.0);
    positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
    gl_Position = positionVec4;
  }
`;
let fs = `
  precision mediump float;
  varying vec2 vTexCoord;
  uniform sampler2D tex0;
  uniform float time;
  const float TAU = 6.283185307179586;
  
  void main() {
    // get uv coords and flip y
    vec2 uv = vTexCoord;
    uv.y = 1.0 - uv.y;

    // displace uv
    uv.x += 0.01 * cos(time + uv.y * TAU);
    uv.y += 0.01 * sin(time + uv.x * TAU);
    vec4 texColor = texture2D(tex0, uv);

    // fade out
    float fadeAmp = 0.002;
    texColor.rgb -= fadeAmp;

    // draw to screen 
    gl_FragColor = texColor;
  }
`;

let buffer;
let gl;

function preload(){
  gui = new lil.GUI();
  
  flags = {
    'all': loadImage("AllFlags.jpg"),
    'lgbtqi': loadImage("flag_lgbtqi.avif"),
    'asexual': loadImage("flags_asexual.avif"),
    'drag': loadImage("flags_drag.avif"),
    'intersexInclusive': loadImage("flags_inclusive.avif"),
    'intersex': loadImage("flags_intersex.avif"),
    'lesbian': loadImage("flags_lesbian.avif"),
    'pansexual': loadImage("flags_pansexual.avif"),
    'straightAlly': loadImage("flags_straight_ally.avif"),
    'transgender': loadImage("flags_transgender.avif")
  }
  
  params = {
    img: flags.all,
    size: 0.5,
    rotateSpeed: 0.03
  }

  aspectRatio = flags.all.width/ flags.all/height;
  gui.add(params, 'img', flags).onChange(img => aspectRatio = img.width/img.height);
  gui.add(params, 'size', 0, 1, 0.01);
  gui.add(params, 'rotateSpeed', 0.001, 0.05, 0.001);
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke();
  gl = this._renderer.GL;
  
  fx = createShader(vs, fs);
  buffer = createGraphics(width, height);
}

function draw() {
  // background(220);
  gl.disable(gl.DEPTH_TEST);
  rectMode(CENTER);
  imageMode(CENTER);
  
  // copy previous frame to buffer, then run post fx shader while drawing back to screen
  let prevFrameImg = get();
  buffer.image(prevFrameImg, 0, 0, width, height);
  
  shader(fx);
  fx.setUniform('tex0', buffer);
  fx.setUniform('time', frameCount * 0.03);
  rect(0,0,width,height);
  resetShader();
  
  // draw box on top of composition
  gl.enable(gl.DEPTH_TEST);
  push();
  lights();
  translate(mouseX - width/2, mouseY - height/2, 50);
  scale(1, aspectRatio, 1);
  texture(params.img);
  // rect(0,0,params.size*width, params.size*width/aspectRatio);

  rotateX(frameCount * params.rotateSpeed);
  rotateZ(frameCount * params.rotateSpeed);
  // fill(127 + 127 * sin(frameCount * 0.03), 127 + 127 * sin(1+ frameCount * 0.03), 127 + 127 * sin(2+ frameCount * 0.03));
  noStroke();
  box(params.size*min(width, height));
  pop();
}
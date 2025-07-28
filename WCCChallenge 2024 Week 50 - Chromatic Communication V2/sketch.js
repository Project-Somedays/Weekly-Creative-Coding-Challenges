/*
Author: Project Somedays
Date: 2024-12-15
Title: WCCChallenge - Chromatic Communication

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/g5J6Ajx9Am

Loved the prompt this week 😍
One of those few times were the idea popped into my head fully-formed.
Enjoy!

CORE MECHANICS
The wires to the central hub are made by using perlin noise to pick points on a sphere.
Lerp that centre of the sphere between the phone location and the centre of the screen.
Grows and shrinks the radius of that sphere at the start and end so that it diverges from the phone and converges at the centre.

RESOURCES:
  - Claude.ai to help with the rotation matrix to get the "phones" to align with the radii from the centre of the screen
	- lil-gui: https://cdn.jsdelivr.net/npm/lil-gui@0.20.0/dist/lil-gui.umd.min.js
  - Colour Palette: https://coolors.co/palettes/trending
  - Easing Functions: https://easings.net/

  SOUND EFFECTS
  - "Notification2" by RasoolAsaad: https://pixabay.com/sound-effects/notification-2-269292/
  - "Notification 22" by Notification_Message: https://pixabay.com/sound-effects/notification-22-270130/
  - "Notification1" by RasoolAsaad: https://pixabay.com/sound-effects/notification-1-269296/
  - "Notification (18)" by Notification_Message: https://pixabay.com/sound-effects/notification-18-270129/
  - "Simple Notification" by Universfield: https://pixabay.com/sound-effects/simple-notification-152054/
  - "Notification Sound" by RasoolAsaad: https://pixabay.com/sound-effects/notification-sound-269266/

TODO's/OPPORTUNITIES:
- Sound effects
- Elastic grow when producing a message or receiving on the phones?
- Live update squiggliness
- Work out why I chordThickness and chordColour don't seem to be doing anything??

  */

const spiralPoints = [];
let phoneLocations = [];
// const palette = "#ef476f, #ffd166, #06d6a0, #118ab2, #073b4c".split(", ");
const palette = "#ef476f, #f78c6b, #ffd166, #06d6a0, #118ab2, #073b4c".split(", ");

let currentColour;
let currentMaster;

let params, gui;
let globalBiz;

let progress;

// let keyLight, fillLight, backLight;
let pointLighting;
let directionalLighting;


let phones = [];


let w;

let notifications = [];
function preload(){
  // notifications = [
  //   loadSound("notification-1-269296.mp3"),
  //   loadSound("notification-2-269292.mp3"),
  //   loadSound("notification-18-270129.mp3"),
  //   loadSound("notification-22-270130.mp3"),
  //   loadSound("notification-sound-269266.mp3"),
  //   loadSound("simple-notification-152054.mp3")
  //   ]
}


function setup() {
  // createCanvas(windowWidth, windowHeight, WEBGL);
  createCanvas(1920, 1080, WEBGL);
  w = min(windowWidth, windowHeight)
  pixelDensity(1);
  frameRate(30);

  // POINT LIGHTING
  pointLighting = {
    keyLight : {
      color: color(255, 200, 200),  // Warm key light
      positional: createVector(200, 0, 300),
    },
    
    fillLight : {
      color: color(100, 150, 255),  // Cool fill light
      positional: createVector(-200, 0, 200)
    },
    
    backLight : {
      color: color(255, 255, 200),  // Bright back light
      positional: createVector(0, -300, 300)
    }
  }
  

  // DIRECTIONAL LIGHTING
  directionalLighting = {
    keyLight : {
      color: color(255, 200, 200),  // Warm key light
      positional: createVector(-1, 0, -1).normalize()  // Direction pointing towards the scene
    },
    
    fillLight : {
      color: color(100, 150, 255),  // Cool fill light
      positional: createVector(1, 0, -1).normalize()  // Direction pointing towards the scene
    },
    
    backLight : {
      color: color(255, 255, 200),  // Bright back light
      positional: createVector(0, 1, -1).normalize()  // Direction pointing towards the scene
    }
  }


  // GLOBAL PARAMETERS
  gui = new lil.GUI();
  params = {
    rotationRate : TWO_PI/1200, // how fast the whole system should move around
    globalRadius: 0.6*width, // phones are distributed this far from the origin
    phoneCount: 40, // how many phones are there,
    cycleFrames: 240, // how long should each message take to send and be delivered?
    noiseZoom: 300, // how random should the chords be?
    pathRotations: 5, // how squiggly should the chords be
    chordPathSteps: 75,
    chordSquiggliness: 4,
    chordNoiseZoom: 300,
    chordThickness: 1,
    phoneSize: 0.1,
    noiseProgressionRate: 0.01,
    noiseProgressionMode: true,
    chordColour: "#ffffff",
    threePointLightSetup: true,
    autoRotateMode: true,
    bgColour: '#000000',
    lightingSetup: pointLighting
  }

  // SETTING UP THE GUI IN FOLDERS
  globalBiz = gui.addFolder("Global Biz");
  globalBiz.addColor(params,  'bgColour');
  globalBiz.add(params, 'rotationRate', TWO_PI/2400, TWO_PI/300);
  globalBiz.add(params, 'phoneCount', 1, 100, 1).onChange(newVal => phones = distributePhonesOnSphere(newVal));
  globalBiz.add(params, 'globalRadius', 0.0, 2.0*width).onChange(newVal => phones = distributePhonesOnSphere(params.phoneCount));
  globalBiz.add(params, 'cycleFrames', 30, 900, 1);
  globalBiz.add(params, 'noiseProgressionRate', 0.01, 0.05);
  globalBiz.add(params, 'noiseProgressionMode');
  globalBiz.add(params, 'autoRotateMode');
  globalBiz.add(params, 'threePointLightSetup');
  globalBiz.add(params, 'lightingSetup', {"Point Lighting": pointLighting, "Directional Lighting": directionalLighting});
  
  
  chordBiz = gui.addFolder("Chord Biz");
  chordBiz.add(params, "chordSquiggliness", 1, 10).onChange(newVal => updateCurves());
  chordBiz.add(params, 'chordNoiseZoom', 100, 1000).onChange(newVal => updateCurves());
  chordBiz.add(params, 'chordPathSteps', 10, 100).onChange(newVal => updateCurves());
  chordBiz.add(params,  'chordThickness', 0.1, 10);
  chordBiz.addColor(params, 'chordColour');
 
  phoneBiz = gui.addFolder("Phone Biz");
  phoneBiz.add(params, 'phoneSize', 0.01, 0.2);

  

  // GENERATING PHONES
  phones = distributePhonesOnSphere(params.phoneCount, params.globalRadius);

  // COLOUR
  currentColour = random(palette);
  currentMaster = random(phones);
  currentMaster.setColour(currentColour);
  currentMaster.isCurrentMaster = true;
}



function draw() {
  background(params.bgColour);

  if(params.autoRotateMode){
    rotateY(frameCount * params.rotationRate);
    rotateX(-frameCount * params.rotationRate);
    rotateZ(frameCount * params.rotationRate);
  }
 
   // Apply lights
  if(params.threePointLightSetup){
    switch(params.lightingSetup){
      case pointLighting:
        pointLight(params.lightingSetup.keyLight.color, params.lightingSetup.keyLight.positional);
        pointLight(params.lightingSetup.fillLight.color, params.lightingSetup.fillLight.positional);
        pointLight(params.lightingSetup.backLight.color, params.lightingSetup.backLight.positional);
        break;
      case directionalLighting:
        directionalLight(params.lightingSetup.keyLight.color, params.lightingSetup.keyLight.positional);
        directionalLight(params.lightingSetup.fillLight.color, params.lightingSetup.fillLight.positional);
        directionalLight(params.lightingSetup.backLight.color, params.lightingSetup.backLight.positional);
        break;
      default:
        break;
    }
    
    
  }
  // 
  
  
  // update progress
  progress = (frameCount%params.cycleFrames)/params.cycleFrames;
  if(params.noiseProgressionMode) updateCurves();

  // at the end of the cycle
  // choose a new master and colour
  if(progress === 0){
    for(let phone of phones){
      phone.setColour(currentColour);
    }
    for(let phone of phones){
      phone.isCurrentMaster = false;
    }
    currentColour = random(palette.filter(each => each !== currentColour)); // avoid double-ups
    currentMaster = random(phones.filter(each => each !== currentMaster)); // avoid double-ups
    currentMaster.setColour(currentColour);
    currentMaster.isCurrentMaster = true;
  }

  for(let phone of phones){
    phone.showPhone()
    phone.showCurve();
  }

  currentMaster.showMessage();
  // halfway through the cycle, show the message ball in travel
  if(progress >= 0.5){
    for(let phone of phones.filter(e => e !== currentMaster)){
      phone.showMessage();
    }
  }

  orbitControl();
}

function updateCurves(){
  phones.map(e => e.generateCurve());
}


function distributePhonesOnSphere(numPoints) {
  const phones = [];
  
  // Golden angle in radians
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  
  for (let i = 0; i < numPoints; i++) {
    // Normalize i to range [0, 1]
    const t = i / (numPoints - 1);
    
    // Compute height (z-coordinate) to spread points evenly
    const z = 1 - (t * 2);
    const radius_at_height = Math.sqrt(1 - z * z);
    
    // Compute angle around the sphere
    const theta = goldenAngle * i;
    
    // Convert to Cartesian coordinates
    const x = cos(theta) * radius_at_height * params.globalRadius;
    const y = sin(theta) * radius_at_height * params.globalRadius;
    const zCoord = z * params.globalRadius;
    
    phones.push(new Phone(createVector(x, y, zCoord), color(255, 255, 255)));
  }
  
  return phones;
}



const getCurvePoint = (start, t) => {
  const centre = createVector(0,0,0);
  let p = p5.Vector.lerp(start, centre, t);
  let r = 0.25*params.globalRadius*easeInOutSineFullCycle(t); //t < 0.5 ? t * 0.25 * width : (1 - t) * 0.25 * width; //0.2*width*easeInOutCirc(t); // radius of the sphere
  let noiseOffset = 0;
  if(params.noiseProgressionMode) noiseOffset = frameCount * params.noiseProgressionRate;
  let phi = map(noise(p.x/params.chordNoiseZoom + noiseOffset, p.y/params.chordNoiseZoom, p.z/params.chordNoiseZoom), 0, 1, 0, params.chordSquiggliness*TWO_PI);
  let theta = map(noise(p.x/params.chordNoiseZoom+100 + noiseOffset, p.y/params.chordNoiseZoom+100, p.z/params.chordNoiseZoom+100), 0, 1, 0, params.chordSquiggliness*PI);
  let pt = getPointOnSphere(r, phi, theta).add(p);

  return pt;
 }

function getPointOnSphere(r, phi, theta) {
  // Convert spherical coordinates to Cartesian coordinates
  const x = r * sin(theta) * cos(phi);
  const y = r * sin(theta) * sin(phi);
  const z = r * cos(theta);
  
  return createVector(x, y, z);
}





/*
Author: Project Somedays
Date: 2024-09-01
Title: WCCChallenge 2024 Week 25 - Sand aka Super Budget Arrakis

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/g5J6Ajx9Am

Main goal: 3D implementation of Inverse Kinematics... the Dan Shiffman 2D version uses .heading() which only gives xy angle?
But you don't NEED the xy angle if you keep everything in vectors = work perfectly 2D or 3D 🙂

Secondary goal: custom mesh that gets affected by the path of the worm
Sampling a few points around the head and pushing up vertices on the grid where relevant

Will keep experimenting, but that'll do for today 🙂

RESOURCES:
  - Inverse Kinematics: ChaptGPT with some coaxing out from Dan Shiffman's original
  - Inverse Kinematics Tutorial: https://www.youtube.com/watch?v=hbgDqyy8bIw
  - 🎵 Music (royalty-free): "Dune Legacy" by wildsound159: https://pixabay.com/music/build-up-scenes-dune-legacy-155061/
  - lil-gui: https://cdn.jsdelivr.net/npm/lil-gui@0.19.2/dist/lil-gui.umd.min.js

Task list:
DONE: Fix so that worm starts underground
DONE: Add disturbance of sand
// TODO: Autorotate mode
// TODO: Make sure worm can't fly i.e. limit to being no more than a little above the surface
*/

let dunescape;
let cam;
let duneMusic;
let playMusicMode = true;
let worms = [];
let nWorms = 1;
let speed = 0.01;
let minWeight, maxWeight;
let palette = "#006466, #065a60, #0b525b, #144552, #1b3a4b, #212f45, #272640, #312244, #3e1f47, #4d194d".split(", ");

let xOff, yOff;

function preload(){
  duneMusic = loadSound('dune-legacy-155061.mp3');
}

function setup() {
  // createCanvas(min(windowWidth, windowHeight), min(windowWidth, windowHeight), WEBGL);
  createCanvas(1080, 1080, WEBGL);

  cam = createCamera();
  
  minWeight = width/30;
  maxWeight = width/15;
	pixelDensity(1);

  gui = new lil.GUI();
  
  params = {
    wormCount : 1,
    sandColour : "#C2B280",
    showStroke: true,
    showSand: true,
    showWorms: true,
    showSuns: false,
    wormMoveRate: 0.01,
    toggleMusic : () => {
      playMusicMode = !playMusicMode;
      if(playMusicMode) duneMusic.loop();
      if(!playMusicMode) duneMusic.stop();
    },
    sunDistance: 2,
    sunPeriod: 120,
    sun1Phase: 0,
    sun2Phase: TWO_PI/3,
    sun3Phase: 2*TWO_PI/3,
    showStrokeMode: false,
    res: width/50
  }

  gui.addColor(params, 'sandColour');
  gui.add(params, 'wormCount', 1, 5, 1).onChange(value => worms = generateWorms(value));
  gui.add(params, 'showStroke');
  gui.add(params, 'showSand');
  gui.add(params, 'showWorms');
  gui.add(params, 'showSuns');

  gui.add(params, 'res', 5, width/25, 1).onChange(value => dunescape = new Dunescape(value, 1/300, 0, width/4));
  gui.add(params, 'wormMoveRate', 0.001, 0.1);
  gui.add(params, 'sunDistance', 1, 5);
  gui.add(params, 'sunPeriod', 30, 300, 1);
  gui.add(params, 'sun1Phase', 0, TWO_PI);
  gui.add(params, 'sun2Phase', 0, TWO_PI);
  gui.add(params, 'sun3Phase', 0, TWO_PI);
  gui.add(params, 'toggleMusic');
  
  
  
  generateWorms(params.wormCount);
  
  dunescape = new Dunescape(params.res, 1/300, 0, width/4);
  duneMusic.loop();

  noFill();

  
}




function draw() {
  background(0);
  
  stroke(0);

  // show suns
  let a = frameCount*TWO_PI/params.sunPeriod;
  if(params.showSuns){
    pointLight(255, 255, 255, params.sunDistance*width*cos(a + params.sun1Phase), params.sunDistance*width*sin(a+params.sun1Phase), 0);
    pointLight(255, 255, 255, params.sunDistance*width*cos(a + params.sun2Phase), 0, params.sunDistance*width*sin(a + params.sun2Phase));
    pointLight(255, 255, 255, 0, params.sunDistance*width*cos(a + params.sun3Phase), params.sunDistance*width*sin(a + params.sun3Phase));
  }
  
  // drawing the worms
  if(params.showWorms){
    for(let worm of worms){
      let x = getNoiseVal(worm.xOff, -width/2, width/2 );
      let y = getNoiseVal(worm.yOff, 0, width/4);
      let z = getNoiseVal(worm.zOff,-width/2, width/2 );
      worm.updateAndShow(x,y,z);
    }
  }
 
  // showing the sand
  if(params.showSand){
    

    // sampling points around the head of the worm and deforming the terrain... WIP!
    for(let worm of worms){
      for(let pt of worm.headSamplePoints){
        // where on the grid does it match up?
        let gridX = floor((pt.x + width/2) / params.res);
        let gridY = floor((pt.z + width/2) / params.res);
        let gridHeight = dunescape.terrain[gridX][gridY];
        if(gridHeight < pt.y) {
          dunescape.raiseHeight(gridX, gridY, -pt.y*0.01);
          // console.log("disturbing sand");
        }
      }
    }
    
    fill(color(params.sandColour));
    if(params.showStroke){
      strokeWeight(0.5);
      stroke(0);
    } else{
      noStroke();
    }
    
    dunescape.show();
    
  }

  
  orbitControl();
  
}

const getNoiseVal = (offset, minVal, maxVal) => {return map(noise(frameCount*speed + offset), 0, 1, minVal, maxVal) };

const getHeightAsAFunctionOfDistanceFromCentre = (r, R) => {return sqrt(2*R*r - r**2);
}

// function windowResized(){
//   resizeCanvas(min(windowWidth, windowHeight),min(windowWidth, windowHeight),WEBGL);
// }

function generateWorms(n){
  worms = []
  for(let i = 0; i < n; i++){
    worms[i] = new Worm(25, width/50, random(palette));
  }
  return worms;
}


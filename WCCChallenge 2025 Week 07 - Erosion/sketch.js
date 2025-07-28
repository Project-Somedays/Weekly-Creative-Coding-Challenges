/*Author: Project Somedays
Date: 2025-02-05
Title: WCCChallenge 2025 Week 09 - Erosion

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/g5J6Ajx9Am

Was very taken when I saw the Glasshouse Mountains in QLD Austrlia.
They're the remains of ancient volcanoes but everything but the plug of magma is left over.
https://en.wikipedia.org/wiki/Glass_House_Mountains

*/

let centralRockRadius; 
let centralRockHeight; 
let outerRocks = []
let res = 30;
let w;
const noiseDeet = 50;
let grassTexture;
let cubeTexture;
let block;
let scl;

function preload(){
  // grassTexture = loadImage("Grass_Block_29_JE2_BE2.webp");
  cubeTexture = loadImage("Cube Texture.png");
  block = loadModel("Minecraft Block Top Surface.obj", true, () => console.log("Load model success"), () => console.log("Load model fail"));

}

function setup() {
  // createCanvas(min(windowWidth, windowHeight), min(windowWidth, windowHeight), WEBGL);
  createCanvas(1080, 1080, WEBGL);
  noStroke();

  scl = 0.2 * 1080 / width;
  centralRockRadius = width/6;
  centralRockHeight = width*0.8;

  w = width/res;

  for(let i = 0; i < res; i++){
    for(let j = 0; j < res; j++){
      for(let k = 0; k < res; k++){
        let x = -width/2 + i*width/res;
        let y = -width/2 + j*width/res;
        let z = -width/2 + k*width/res;
        if(dist(x,z,0,0) < centralRockRadius && y > height/2 - centralRockHeight) continue; // take out layers by y
        let p = createVector(x,y,z) 
        
        let offset = map(noise(x/noiseDeet, y/noiseDeet, z/noiseDeet), 0, 1, 0, height/4);
        outerRocks.push({p, offset});
        
      }
    }
  }
}



function draw() {
  background(255);

  pointLight(255, 255, 255, 0, -height, 0);
  directionalLight(255, 255, 255, 0.5, 0.5, -0.5);
  rotateY(frameCount * TWO_PI / 600);
  
  fill("#964B00");

  let threshold = map(mouseY, 0, height, -height/2, height/2);
  
  noStroke();
  texture(cubeTexture);
  for(let rock of outerRocks){
    if(rock.p.y < threshold + rock.offset) continue;
    push();
    translate(rock.p.x, rock.p.y, rock.p.z);
    scale(scl);
    // box(w, w, w);
    texture(cubeTexture);
    model(block);
    pop();
  }

  showCentralRock();
  orbitControl();
}

function showCentralRock(){
  push();
  translate(0, height/2 - centralRockHeight/2, 0);
  noStroke();
  fill(0);
  cylinder(centralRockRadius, centralRockHeight, 8);
  pop();
}
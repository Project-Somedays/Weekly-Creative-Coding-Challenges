/*
| Author          | Project Somedays                      
| Title           | WCCChallenge 2026 Week 13 - "Cube"
| 📅 Started      | 2025-03-29   
| 📅 Completed    | 2025-03-29       
| 🕒 Taken        | ~2.5hrs                     
| 🤯 Concept      | Cube of cubes
| 🔎 Focus        | Transformations
| 🤖 AI-use       | Bug-fixes and stepping in when I got confused RE Transformations

Made for Sableraph's weekly creative coding challenges, reviewed weekly on https://www.twitch.tv/sableraph
See other submissions here: https://openprocessing.org/curation/78544
Join The Birb's Nest Discord community! https://discord.gg/S8c7qcjw2b

📃The Algorithm📃
Set up rolling cubes on just the top surface, left to right
To get the other sides, replicate with a global rotation. Or scaling!

👉INTERACTION👈
Play with the controls

📦RESOURCES📦
- Easings.net
- Coolors.co for the palettes

🤔TO IMPROVE🤔
- Fill in the holes... I'm sure they're there because of some offset, but it looks neat enough as it is
- Make the cubes traverse all sides

*/

let sSize = 50;
let frames = 60;
let stepLim = 5;
let cubes = [];

let palettes = {
  'Vibrant': "#ffbe0b, #fb5607, #ff006e, #8338ec, #3a86ff",
  'Golden Twilight': "#000814, #001d3d, #003566, #ffc300, #ffd60a",
  'All White': "#ffffff",
  'Earthy Tones': "#a3a380, #d6ce93, #efebce, #d8a48f, #bb8588"
}



const gui = new lil.GUI();
const params = {
  easingFn: easeInOutSine,
  rotMode: true,
  rotSpeed: 0.005,
  lightMode: showThreePointLighting,
  showLines: true,
  palette: "All White"
}

gui.add(params, 'easingFn', {
  'EaseInOutSine': easeInOutSine, 
  'EaseOutBounce': easeOutBounce, 
  'EaseOutElastic': easeOutElastic,
  'EaseInOutElastic': easeInOutElastic});
gui.add(params, 'rotMode');
gui.add(params, 'rotSpeed', 0.0, 0.01, 0.001);
gui.add(params, 'lightMode', {'PointLight': showPointLight, '3PointLight': showThreePointLighting, 'Ambient': () => {}});
gui.add(params, 'showLines').onChange((val) => {
  if(val){
    stroke(0)
  } else {
    noStroke();
  }
});
gui.add(params, 'palette', Object.keys(palettes)).onChange((newPalette) => {
  currentPalette = palettes[newPalette].split(", ");
  for(let cube of cubes){
    cube.colour = random(currentPalette);
  }
})

let currentPalette = palettes[params.palette].split(", ");

function setup() {
  createCanvas(600, 600, WEBGL);
  
  let i = 0;
  // 1. Loop through the Z axis (depth)
  for (let z = 0; z < stepLim; z++) {
    // 2. Loop through the X axis to fill the face!
    for (let x = 0; x < stepLim; x++) {
      
      let zOff = -floor(stepLim / 2) + z;
      
      let delay = z * 10; 
      
      // Pass 'x' as their starting index on the track
      cubes[i] = new RollingCube(zOff, x, delay);
      i++;
    }
  }
}

function draw() {
  background(0);
  orbitControl();

  
  // direction
  params.lightMode();

  if(params.rotMode){
    rotateX(frameCount * params.rotSpeed);
    rotateY(frameCount * params.rotSpeed);
    rotateZ(frameCount * params.rotSpeed);
  }
 
  
  for (let cube of cubes) {
    cube.update();    
  }

  for(let i = 0; i < 2 ; i++){
    rotateY(HALF_PI);
    scale(2);
    for(let j = 0; j < 4; j++){
    for (let cube of cubes) {
      rotateZ(j * HALF_PI);
      cube.show();
      }
    }
  }
  
  
}

function showPointLight(){
  pointLight(255, 255, 255, 0, 0, 0);
}

function showThreePointLighting() {
  // 1. Ambient Base
  // Lifts the absolute black shadows so we don't lose the dark sides entirely.
  ambientLight(50); 

  // 2. Key Light
  // The main light source. Strong, slightly warm. 
  // Pointing: Left (-1), Down (1), Away from camera (-1)
  directionalLight(255, 240, 220, -1, 1, -1);

  // 3. Fill Light
  // Softer and slightly cool to mimic scattered room light. Fills in the key light's shadows.
  // Pointing: Right (1), Straight ahead vertically (0), Away from camera (-1)
  directionalLight(100, 120, 150, 1, 0, -1);

  // 4. Backlight / Rim Light
  // Creates a bright edge along the top/back to separate the cubes from the dark background.
  // Pointing: Straight horizontally (0), Down (1), Towards camera (1)
  directionalLight(200, 200, 255, 0, 1, 1);
}





/* 

RESOURCES:
- (Royalty-Free) Music: Pallet Town - Pokemon Red & Blue (Lofi) by TheYumeCollective on Pixabay. https://pixabay.com/music/beats-pallet-town-pokemon-red-amp-blue-lofi-410591/
- "Nintendo Game Boy (Original 1989)" (https://skfb.ly/o8DRy) by Lokeig is licensed under Creative Commons Attribution-NonCommercial (http://creativecommons.org/licenses/by-nc/4.0/).
*/

let gameboy, music, gameboyMaterial;
let pokemonImg;
let pokemon = [];
let xOffset = 10;
let yOffset = 10;
let cam;

function preload(){
  // gameboy = loadModel("Gameboy.obj");
  pokemonImg = loadImage("all-pokemon-upscaled.png");
}



function setup() {
  createCanvas(400, 400, WEBGL);
  cam = createCamera();

  pokemon = processPokemon();
  noStroke();
  
}

function draw() {
  background(220);

  // Get camera position
  let cam = this._renderer._curCamera;
  let camPos = createVector(cam.eyeX, cam.eyeY, cam.eyeZ);

  rotateY(frameCount * TWO_PI/1200);
  
  for(let i = 0; i < pokemon.length; i++){
    let pokemonInstance = pokemon[i];
    texture(pokemonInstance.graphic);
    
    push();
    translate(pokemonInstance.pos.x, pokemonInstance.pos.y, pokemonInstance.pos.z);
    
    // Calculate direction from plane to camera
    let planePos = createVector(pokemonInstance.pos.x, pokemonInstance.pos.y, pokemonInstance.pos.z);
    let dirToCamera = p5.Vector.sub(camPos, planePos);
    
    // Calculate rotation angles to face camera
    let angleY = atan2(dirToCamera.x, dirToCamera.z);
    let angleX = atan2(dirToCamera.y, sqrt(dirToCamera.x * dirToCamera.x + dirToCamera.z * dirToCamera.z));
    
    // Apply rotations
    rotateY(angleY);
    rotateX(-angleX);

    plane(pokemonImg.width/25, pokemonImg.height/20);
    pop();
  }
  
  orbitControl();
}

function processPokemon(){
  // load the pixels of the image
  let pokemonGraphics = [];
  for(let i = 0; i < 25; i++){
    for(let j = 0; j < 20; j++){
      
      // create a graphic
      let graphic = createGraphics(pokemonImg.width/25, pokemonImg.height/25);
      // extract the pokemon from the graphic
      graphic.image(pokemonImg.get(i * pokemonImg.width/25 + xOffset, j * pokemonImg.height/20 + yOffset, pokemonImg.width/25, pokemonImg.height/20),0, 0);
      // store the graphic
      let pokemon = {
        graphic: graphic,
        pos: createVector(random(-width/2, width/2), random(-height/2, height/2), random(width/2, -width/2))
      }
      pokemonGraphics.push(pokemon);
    }
  }

  return pokemonGraphics;
}

/*

Saw an awesome geometry nodes setup in Blender and thought I should probably replicate it here
"Trees No Leaves" (https://skfb.ly/6WZPK) by hamraj15 is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
*/
let treeModel;
let gui;
let leafTest;
let leafGraphic;
let leaves = [];

function preload(){
  treeModel = loadModel("Tree.obj");
  leafTest = loadImage("growth-close-up-environmental-lush-natural.png");
  // leafTest = loadImage("LeafImage.png");
}



function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke();

  leafGraphic = createGraphics(50, 50);
  leafGraphic.clear();
  leafGraphic.imageMode(CENTER);
  leafGraphic.image(leafTest, leafGraphic.width/2, leafGraphic.height/2, leafGraphic.width, leafGraphic.height);

  for(let i = 0; i < 1000; i++){
    leaves.push(generateLeaf());
  }

  gui = new lil.GUI();
  params = {
    leafCount: 1000,
    leafScale: 1,
    leafColour: color("#10aa10"),
    drawLeafDesign: 100
  }

  gui.add(params, 'leafCount', 1, 10000, 1);
  gui.add(params, 'leafScale', 0.1, 10, 0.1);
  gui.addColor(params, 'leafColour');
}

function draw() {
  background(100, 100, 100);

  model(treeModel);

  for(let leaf of leaves){
    showLeaf(leaf);
  }

  orbitControl();
}

function generateLeaf(){
  function getDistance(x){
    return 2 * (easeOutCirc(random()) - 0.5)*x;
  }
  return {
    pos: createVector(getDistance(height/8), getDistance(height/8), -height/4 + getDistance(height/8)),
    rot: random(TWO_PI)
  }
}


function showLeaf(leaf){
  push();
  translate(leaf.pos.x, leaf.pos.y, leaf.pos.z);
  billboardWithRotation(leaf.pos, leaf.rot);
  noStroke();
  tint(255, 255); // Full opacity for the texture
  texture(leafGraphic);
  plane(50, 50);
  pop();
}

function billboardWithRotation(position, randomRotation) {
  // Get the current camera position
  let cam = this._renderer._curCamera;
  
  // Calculate the direction from the object position to the camera
  let dirX = cam.eyeX - position.x;
  let dirY = cam.eyeY - position.y;
  let dirZ = cam.eyeZ - position.z;
  
  // Calculate rotation angles to face the camera
  let angleY = atan2(dirX, dirZ);
  let angleX = atan2(dirY, sqrt(dirX * dirX + dirZ * dirZ));
  
  // Apply billboard rotations first
  rotateY(angleY);
  rotateX(-angleX);
  
  // Then apply the random rotation around the Z axis (facing the camera)
  rotateZ(randomRotation);
}

function easeOutCirc(x) {
  return sqrt(1 - pow(x - 1, 2));
}

/*
Author: Project Somedays
Date: 2024-07-21
Title: WCCChallenge City Maps

Interested to see the view from different historical towers

RESOURCES: 
  - https://en.wikipedia.org/wiki/List_of_tallest_buildings
  - https://www.printables.com/model/739689-burj-khalifa
  - https://drive.google.com/drive/folders/1Nt83NNTRjzasEDZl0G2znuspq51KtVy8
  - https://www.printables.com/model/562106-shanghai-tower/files
  - https://www.printables.com/model/461674-taipei-101-taiwan/files
  - https://www.printables.com/model/907687-eiffel-tower-eiffel-tower
  - https://www.printables.com/model/643774-lotte-world-tower-seoul-south-korea
  - https://www.printables.com/model/314134-one-world-trade-center-new-york-city-usa
  - https://www.printables.com/model/913543-giraffe/files
  - https://www.printables.com/model/568791-human-low-poly
  - https://www.printables.com/model/60564-armored-regular-giraffe
  - https://www.printables.com/model/264372-taj-mahal-agra-india
  - https://www.printables.com/model/348486-pyramid-of-giza
  - https://www.printables.com/model/318967-templo-mayor-tenochtitlan-mexico-city


*/
let tallThings;

let ys; // yardstick
let house;
let progress = 0;
let currentTallThing = 0;
let desiredHeight;
let params;
let gui;
let maxHeight;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  ys = min(width, height);
  textAlign(CENTER,CENTER);
  textSize(50);

  normalMaterial();
  // camera(ys, -ys, ys, 0, -ys/4, 0);

  params = {
    r: ys/4,
    scl: 0.001
  }


  gui = new lil.GUI();
  gui.add(params, 'r', ys/10, ys);
  gui.add(params, 'scl', 0.001, 1);


  tallThings = [
    // {name: "Man",                     h: 1.78,  rot: HALF_PI, model: loadModel('man_lowPoly.stl',true, incrementProgress, showError, ".stl")},
    // {name: "Battle Giraffe",          h: 5.5,   rot: HALF_PI, model: loadModel('battleGiraffe.stl',true, incrementProgress, showError, ".stl")},
    {name: "Burj Khalifa",            h: 828.0, rot: HALF_PI, model: loadModel('tower_BurjKhalifa.stl',true, incrementProgress, showError, ".stl")},
    // {name: "Merdeka 118",             h: 678.9, rot: HALF_PI, model: loadModel('tower_Merdeka118.stl',true, incrementProgress, showError, ".stl")},
    // {name: "Shanghai Tower",          h: 632.0, rot: HALF_PI, model: loadModel('tower_ShanghaiTower.stl',true, incrementProgress, showError, ".stl")},
    // {name: "Lotte World Tower",       h: 554.5, rot: HALF_PI, model: loadModel('tower_LotteWorldTower.stl',true, incrementProgress, showError, ".stl")},
    // {name: "One World Trade Centre",  h: 541.3, rot: HALF_PI, model: loadModel('tower_OneWorldTradeCentre.stl',true, incrementProgress, showError, ".stl")},
    // {name: "Taipei 101",              h: 508.0, rot: HALF_PI, model: loadModel('tower_Taipei101.stl',true, incrementProgress, showError, ".stl")},
    {name: "Eiffel Tower",            h: 330.0, rot: HALF_PI, model: loadModel('tower_EiffelTower.stl',true, incrementProgress, showError, ".stl")},
    // {name: "Pyramid of Giza",         h: 138.5, rot: HALF_PI, model: loadModel('tower_PyramidOfGiza.stl',true, incrementProgress, showError, ".stl")},
    // {name: "Taj Mahal",               h: 73.0,  rot: PI,       model: loadModel('tower_TajMahal.stl',true, incrementProgress, showError, ".stl")},
    // {name: "Templo Mayor",            h: 60.0,  rot: HALF_PI, model: loadModel('tower_Templo_Mayor_tenochtitlan.stl',true, incrementProgress, showError, ".stl")},
  ].sort((a,b) => a.h < b.h);

  for(let i = 0; i < tallThings.length; i++){
    tallThings[i].bbox = calculateBoundingBox(tallThings[i].model)
  }

  maxHeight = tallThings.reduce((max, current) => (current.h > max.h ? current : max), tallThings[0]).h;



  console.log(maxHeight);
  



}


function draw() {
  background(220);

  push();
  rotateX(HALF_PI);
  plane(ys, ys);
  pop();

  for(let i = 0; i < tallThings.length; i++){
    let tallThing = tallThings[i];
    let a = i*TWO_PI/tallThings.length;
   
    push();
    translate(params.r * cos(a), maxHeight/2, params.r* sin(a));
    rotateX(tallThing.rot);
    scale(tallThing.h*params.scl);
    model(tallThing.model);
    pop();
  }
  

  orbitControl();
}


function incrementProgress(){
  progress ++;
}

function showError(err){
  console.log(err)
}

function calculateBoundingBox(model) {
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

  for (let vert of model.vertices) {
    if (vert.x < minX) minX = vert.x;
    if (vert.y < minY) minY = vert.y;
    if (vert.z < minZ) minZ = vert.z;
    if (vert.x > maxX) maxX = vert.x;
    if (vert.y > maxY) maxY = vert.y;
    if (vert.z > maxZ) maxZ = vert.z;
  }

  return {
    min: createVector(minX, minY, minZ),
    max: createVector(maxX, maxY, maxZ),
    size: createVector(maxX - minX, maxY - minY, maxZ - minZ)
  };
}


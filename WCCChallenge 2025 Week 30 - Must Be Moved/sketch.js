
// lil-gui biz
let gui, params;

const n = 100;
let step;
let hill;
let boulder;
let lockBoulder2Mouse = false;

// matter.js aliases
let Engine = Matter.Engine;
let World = Matter.World;
let Bodies = Matter.Bodies;
let Body = Matter.Body;
let Runner = Matter.Runner;
let Composites = Matter.Composites;

// matter.js instances
let engine;
let world;
let runner;

const getY = (x) => 0.875*height - 0.75*height*map(sin(map(x, 0, width, -HALF_PI, HALF_PI)), -1, 1, 0, 1);

function setup() {
  createCanvas(windowWidth, windowHeight);

  // matter.js world
  engine = Engine.create();
  world = engine.world; // Get the world from the engine
  world.gravity.y = 1
  runner = Runner.create();

  


  step = width/n;


  hill = new Hill(world);
  boulder = new Boulder(width/2, 0, height/10, 100, world);
  Runner.run(runner, engine)

  // lil-gui
  gui = new lil.GUI();
  params = {
    trackBoulder2Mouse: false
  };
  gui.add(params, 'trackBoulder2Mouse').onChange(newVal => {
    if(newVal){
      boulder.body.isStatic = true
    } else{
      boulder.body.isStatic = false
    }
  });
}

function draw() {
  background('#eb8b31');
  // engine.update();

  // show the hill
  hill.show();

  // // for de
  if(params.trackBoulder2Mouse){
    let a = map(boulder.body.position.x, 0, width, 0, HALF_PI);
    Body.setPosition(boulder.body, {x: mouseX, y : 7*height/8 - 0.75*height*0.5*(sin(a) + 1) - boulder.r*1.25});
  }
  
  boulder.show();

  // Engine.update(engine)

}

function keyPressed(){
  switch(key.toUpperCase()){
    case 'Q':
      break;
    case 'W':
      break;
    case 'O':
      break;
    case 'P':
      break;
  }
}




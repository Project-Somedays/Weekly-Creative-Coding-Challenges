// Idea: run the sim in setup, log the positions of all the nodes and then we can rewind perfectly =)

let Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Constraint = Matter.Constraint;

let engine;
let world;
let nodes = [];
let constraints = [];
const totalNodes = 1000;
let spool;
let winding = false;
let ground;
const captureFrames = 300;
let captureArray = [];
let rewind = false;
let currentFrame = 0;
let junkFrames = 0;

let explosion;
let boxes = [];
let wreckingBall;
let nBoxes = 10;
let boxCoords = [];
const rows = 25;
const columns = 25;
let boxSize = 15;
let wallThick;

let cnv;
let heartSize;

const makeWall = (x,y,w,h) => {
  return Bodies.rectangle(x, y, w, h, {isStatic: true});
}

function setup() {
  createCanvas(min(windowWidth, windowHeight), min(windowWidth, windowHeight));

  wallThick = width/20;

  cnv = createGraphics(width, height);
  cnv.fill(255);
  cnv.circle(cnv.width/2, cnv.height/2, cnv.height*0.6);


  // heartSize = cnv.height*0.6;
  // createHeartShape(cnv);

  
  // Create engine and world
  engine = Engine.create();
  world = engine.world;
  
  engine.gravity.y = 1.0;
  rectMode(CENTER);

  World.add(world, makeWall(0, height/2, wallThick, height));
  World.add(world, makeWall(width, height/2, wallThick, height));
  World.add(world, makeWall(width/2, 0, width, wallThick));
  World.add(world, makeWall(width/2, height, width, wallThick));

  


  // for(let i = 0; i < nBoxes; i++){
  //   let box = Bodies.rectangle(width/2 + random(-width/4, width/4), height/2 + random(-height/4, height/4), boxSize, boxSize, {isStatic: false});
  //   let v = p5.Vector.fromAngle(random(-PI, PI)).setMag(random(1, 10));
  //   Body.setVelocity(box, {x: v.x, y: v.y});
  //   boxes.push(box);
  //   World.add(world, box);
  // }
  
  // // get that first frame out of the way
  // for(let i = 0; i < junkFrames; i++){
  //   Engine.update(engine);
  // }
  
  // captureArray = capture(captureFrames);
  
  
  
  // stroke(0);
  // strokeWeight(5);
  // noFill();
  // boxCoords = generateBoxCoords();

  boxCoords = generateBoxesFromMask(cnv);

  for(let coord of boxCoords){
    let box = Bodies.rectangle(coord.x, coord.y, boxSize, boxSize);
    boxes.push(box);
    World.add(world, box);
  }

  explosion = {position: createVector(width/2 + random(-width/10, width/10), height/2 + random(-width/10, width/10)), radius: 500, strength: 15, triggered: false };

  captureArray = capture(captureFrames, boxes);
  
  
}



function draw() {
  background(240);

  // image(cnv, 0, 0);

  // Engine.update(engine);

  // if(!explosion.triggered){
  //   for(let i = 0; i < boxes.length; i++){
  //     Body.setPosition(boxes[i], {x: boxCoords[i].x, y: boxCoords[i].y});
  //   }
  // }
  
  

  if(frameCount === 90) triggerExplosion();
  currentFrame = frameCount % captureFrames;
  if(currentFrame === 0) rewind = !rewind;

  let frameIndex = rewind ? captureFrames - 1 - currentFrame : currentFrame;
  

  for(let i = 0; i < boxes.length; i++){
    let position = captureArray[frameIndex][i].position;
    let angle = captureArray[frameIndex][i].angle;
    push();
      translate(position.x, position.y);
      rotate(angle);
      square(0,0, boxSize);
    pop();
  }

  // beginShape();
  // for(let j = 0; j < totalNodes; j++){
  //   curveVertex(captureArray[frameIndex][j].x,captureArray[frameIndex][j].y);
  // }
  // endShape();

  // renderBoxes();
  
  }


function generateBoxesFromMask(cnv){
  boxCoords = [];
  for(let i = boxSize/2; i < cnv.width; i += boxSize){
    for(let j = boxSize/2; j < cnv.height; j += boxSize){
      let c = cnv.get(i,j);
      if(red(c) === 255 && green(c) === 255 && blue(c) === 255) boxCoords.push(createVector(i,j))
    }
  }
  return boxCoords;
}

function createHeartShape(cnv){
  cnv.beginShape();
  let heartSize = cnv.height
  let centerX = cnv.width/2;
  let centerY = cnv.height*0.25;
  
  // Left side of the heart
  cnv.vertex(cnv.width/2, cnv.height/2 + heartSize / 4);
  cnv.bezierVertex(centerX - heartSize / 2, centerY - heartSize / 2, centerX - heartSize, centerY + heartSize / 3, centerX, centerY + heartSize);
  
  // Right side of the heart
  cnv.bezierVertex(centerX + heartSize, centerY + heartSize / 3, centerX + heartSize / 2, centerY - heartSize / 2, centerX, centerY + heartSize / 4);
  
  cnv.endShape(CLOSE);
}



function renderBoxes(){
  for(let box of boxes){
    push();
      translate(box.position.x, box.position.y);
      rotate(box.angle);
      square(0,0,boxSize);
    pop();
  }
}


function generateBoxCoords(){
  let boxCoords = [];
  for (let i = 0; i < columns; i++) {
    for(let j = 0; j < rows; j++){
      boxCoords.push(
        createVector(width/2 - boxSize*columns/2 + i*1.1*boxSize, height/2 - boxSize*rows/2 + j*1.1*boxSize)
      )
    }
  }
  return boxCoords;
}
  




  function generateStringFall(xStart, yStart){
    // Create nodes and constraints
    let prevNode = null;
  for (let i = 0; i < totalNodes; i++) {
    let node = Bodies.circle(xStart, yStart + i, 5, { friction: 0.001 });
    World.add(world, node);
    nodes.push(node);

    if (prevNode) {
      let options = {
        bodyA: prevNode,
        bodyB: node,
        length: 20,
        stiffness: 0.8
      };
      let constraint = Constraint.create(options);
      World.add(world, constraint);
      constraints.push(constraint);
    }
    prevNode = node;
  }
  

  }


  function triggerExplosion() {
    explosion.triggered = true;
    console.log('Trigger!');
  
    for (let box of boxes) {    
      let force = p5.Vector.sub(createVector(box.position.x, box.position.y), explosion.position).setMag(explosion.strength);
      Body.setVelocity(box, {x: force.x, y: force.y});
      // Body.applyForce(box, explosion.position, {x: force.x, y: force.y});
      // let distance = p5.Vector.dist(box.position, explosion.position);
      // if (distance < explosion.radius) {
      //   // let forceMagnitude = explosion.strength * (explosion.radius - distance) / explosion.radius;
      //   // let force = Matter.Vector.create(box.position.x - explosion.x, box.position.y - explosion.y);
      //   // force = Matter.Vector.normalise(force);
      //   // force = Matter.Vector.mult(force, forceMagnitude);
        
      // }
    }
  }
  
  

  // Update engine
  // Engine.update(engine);

  // // Draw spool
  // fill(200);
  // ellipse(spool.position.x, spool.position.y, 40);

  // // Draw nodes and constraints
  // // for (let i = 0; i < nodes.length; i++) {
  // //   fill(0);
  // //   ellipse(nodes[i].position.x, nodes[i].position.y, 5);
  // // }

  // // to replace with curveVertex at some point
  // strokeWeight(5);
  // stroke(0);
  // noFill();
  // beginShape();
  // for (let c of constraints) {
  //   // line(c.bodyA.position.x, c.bodyA.position.y, c.bodyB.position.x, c.bodyB.position.y);
  //   curveVertex(c.bodyA.position.x, c.bodyA.position.y);
  // }
  // endShape();

  // // Winding mechanism
  // // if (winding) {
  // //   let firstNode = nodes[0];
  // //   Matter.Body.setPosition(firstNode, spool.position);

  // //   for (let i = 1; i < nodes.length; i++) {
  // //     let constraint = constraints[i];
  // //     // Matter.Body.setPosition(nodes[i], constraint.bodyA.position);
  // //     Matter.Body.setPosition(nodes[i], mousePos);
  // //   }
  // // }





function capture(captureFrames, targetArr){
  let captureArray = new Array(captureFrames);
  for(let i = 0; i < captureFrames; i++){
    framePositions = new Array(targetArr.length);
    if(i === int(captureFrames*0.2)) triggerExplosion();
    Engine.update(engine);

    if(!explosion.triggered){
    for(let i = 0; i < boxes.length; i++){
      Body.setPosition(boxes[i], {x: boxCoords[i].x, y: boxCoords[i].y});
    }
    }


    for(let j = 0; j < targetArr.length; j++){
      framePositions[j] = {position: createVector(targetArr[j].position.x, targetArr[j].position.y), angle: targetArr[j].angle} 
    }
    captureArray[i] = [...framePositions];
  }
  return captureArray;
}

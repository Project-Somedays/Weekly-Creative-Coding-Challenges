// Matter.js module aliases
const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Body = Matter.Body;
const Render = Matter.Render;
const Mouse = Matter.Mouse;
const MouseConstraint = Matter.MouseConstraint;

let engine;
let world;
let ground;
let leftWall, rightWall;
let bodies = [];
let monoFont;
let funnelFront, funnelBack;
let p;
let isChurning = false;

function preload(){
  // monoFont = loadFont()
  funnelFront = loadImage("funnel_front.png");
  funnelBack = loadImage("funnel_back.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);
  engine = Engine.create();
  world = engine.world;
  engine.world.gravity.y = 0.8;
  createBoundaries();
  p = createVector(width/2, height/2);
}

function draw() {
  background(220);
  if(isChurning){
    p.x = width/2 + random(-5, 5);
    p.y = height/2 + random(-5, 5);
  }
  

  image(funnelBack, p.x, p.y);
  
  isChurning = false;
  for(let letterBox of bodies){
    letterBox.show()
    if(!isChurning && letterBox.body.position.y > height*0.25 && letterBox.body.position.y < height*0.75){
      isChurning = true;
    }
  }
  
  image(funnelFront, p.x, p.y);
  
  

  Engine.update(engine);
}


function createBoundaries(){
  const wallThickness = 20;
            
  // Ground
  ground = Bodies.rectangle(
    width / 2, 
    height - wallThickness / 2, 
    width, 
    wallThickness,
    { isStatic: true }
  );
  
  // Left wall
  leftWall = Bodies.rectangle(
    wallThickness / 2, 
    height / 2, 
    wallThickness, 
    height,
    { isStatic: true }
  );
  
  // Right wall
  rightWall = Bodies.rectangle(
    width - wallThickness / 2, 
    height / 2, 
    wallThickness, 
    height,
    { isStatic: true }
  );
  
  // Add boundaries to world
  World.add(world, [ground, leftWall, rightWall]);
}

function mousePressed(){
  bodies.push(new LetterBox(random("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")), mouseX, mouseY));
}

class LetterBox {
      constructor(text, x, y) {
          this.text = text.toUpperCase();
          this.textWidth = this.measureText(text);
          this.textHeight = 30;
          
          // Create physics body with padding
          this.body = Bodies.rectangle(
              x, y, 
              this.textWidth + 20, 
              this.textHeight + 10,
              { 
                  restitution: 0.3,
                  friction: 0.8,
                  density: 0.001
              }
          );
          
          // Add to world
          World.add(world, this.body);
      }
      
      measureText(text) {
          textSize(16);
          return textWidth(text);
      }
      
      show() {
          let pos = this.body.position;
          let angle = this.body.angle;
          
          push();
          translate(pos.x, pos.y);
          rotate(angle);
          
          // Draw box background
          fill(255, 255, 255, 240);
          stroke(100, 150, 200);
          strokeWeight(2);
          rectMode(CENTER);
          rect(0, 0, this.textWidth + 20, this.textHeight + 10, 5);
          
          // Draw text
          fill(50);
          noStroke();
          textAlign(CENTER, CENTER);
          textSize(16);
          text(this.text, 0, 0);
          
          pop();
      }
  }

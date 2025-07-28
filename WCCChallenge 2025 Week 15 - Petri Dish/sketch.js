const detail = 20;
let minR;
let maxR;
let travelFrames = 300;


let test;
let mousePos;

function setup(){
createCanvas(720, 720);
minR = width/25;
maxR = width/10;

mousePos = createVector();

test = new Cell(width/2, height/2);
noFill();
stroke(255);
strokeWeight(5);
}

function draw(){
  background(0);

  mousePos.set(mouseX, mouseY);
  test.update();
  test.show();

  stroke(0,255, 0);
  circle(mouseX, mouseY, 10);
}

function easeProgress(progress){
  return 0.5* (cos(progress * PI) + 1);
}



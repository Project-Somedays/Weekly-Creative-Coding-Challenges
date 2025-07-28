let cells = [];
let debug = true;
let nCells = 50;
const detailLevel = 40;
const palette = "#f94144, #f3722c, #f8961e, #f9844a, #f9c74f, #90be6d, #43aa8b, #4d908e, #577590, #277da1".split(", ");
let img;

function preload(){
  img = loadImage("PetriDish.png");
}

function setup() {
  // createCanvas(min(windowWidth, windowHeight), min(windowWidth, windowHeight));
  createCanvas(1080, 1080);
  imageMode(CENTER);

  for(let i = 0; i < nCells; i++){
    cells.push(new Cell(random(palette))); 

  }
}

function draw() {
  background(0);
  image(img, width/2, height/2, width*1.125, height*1.125);

  for(let cell of cells){
    cell.update();
    cell.show();
  }
}

const easeProgress = (progress) => 0.5*(-cos(progress * PI) + 1);
const prog2R = (r, prog) => r * 0.5*(0.5*cos(prog * TWO_PI) + 1.5);

const getPetriPoint = () => {
  let a = random(TWO_PI);
  let r = random(width*0.33);
  return createVector(r*cos(a) + width/2, r*sin(a) + height/2)
}
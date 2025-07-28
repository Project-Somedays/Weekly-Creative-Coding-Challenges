let params, gui;
let a = 0;

let base, cnv;

function setup() {
  base = createCanvas(windowWidth, windowHeight);

  cnv = createGraphics(width, height);
  
  gui = new lil.GUI();

  params = {
    n : 5,
    spacing: 10,
    brushSize: 50,
    brushColour: color(255,0,0)
  }
  
  gui.add(params, 'n', 1, 11, 2);
  gui.add(params, 'spacing', 10, 100);
  gui.add(params, 'brushSize', 5, 100);

  
  


}

function draw() {
  background(0);
  drawRake(base);
  image(cnv,0,0);
  
}

function mouseDragged(){
  drawRake(cnv);
  
}

function drawRake(layer){
  layer.push();
  layer.translate(mouseX, mouseY);
  layer.rotate(a);
  for(let i = 0; i < params.n; i++){ 
    layer.fill(255);
    layer.circle(-params.spacing*params.n/2 + i * params.spacing, 0, params.brushSize);
  }
  layer.pop();

}



function keyPressed(){
  switch(keyCode){
    case LEFT_ARROW:
      a -= TWO_PI/360;
      break;
    case RIGHT_ARROW:
      a += TWO_PI/360;
      break;
    default:
      break;
  }
}



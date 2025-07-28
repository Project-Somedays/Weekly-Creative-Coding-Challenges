let seafloor;
let w;
let deepestBlue = "#13092e";
let lightestBlue = "#143670";
let bgLayer;


function preload(){
  seafloor = loadImage("rocky_trail_diff_1k.jpg");
}
function setup() {
  createCanvas(400, 400, WEBGL);
  noStroke();
  w = 8*width;
  bgLayer = createGraphics(w, w/2);
  makeGradientBackground(bgLayer);
  
}

function draw() {
  background(220);
  // Create gradient by lerping between colors
  

  push();
  translate(0,0,-w);
  rotateX(HALF_PI);
  image(bgLayer, -bgLayer.width/2, -bgLayer.height/2);
  pop();

  texture(seafloor);
  rect(-w/2, -w/2, w, w);
  orbitControl();

  
}

function makeGradientBackground(layer){
  for (let y = 0; y < layer.height; y++) {
    // Calculate percentage of height
    let inter = map(y, 0, layer.height, 0, 1);
    
    // Interpolate between the two colors
    let c = lerpColor(
      color(deepestBlue),
      color(lightestBlue),
      inter
    );
    
    // Draw a line with the interpolated color
    layer.stroke(c);
    layer.line(0, y, layer.width, y);
  }
}



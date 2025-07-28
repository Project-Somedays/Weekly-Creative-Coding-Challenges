let rockModel, paperModel, scissorsModel, lizardModel, spockModel;
let palette = "#ffbe0b, #fb5607, #ff006e, #8338ec, #3a86ff".split(", ");

function preload(){
  rockModel = loadModel('Rock.obj', true, () => console.log("Rock model load success"), (err) => console.log("Rock model load err: " + err));
  paperModel = loadModel('Paper.obj', true, () => console.log("Paper model load success"), (err) => console.log("Paper model load err: " + err));
  scissorsModel = loadModel('Scissors.obj', true, () => console.log("Scissors model load success"), (err) => console.log("Scissors model load err: " + err));
  lizardModel = loadModel('Lizard.obj', true, () => console.log("Lizard model load success"), (err) => console.log("Lizard model load err: " + err));
  spockModel = loadModel('Spock.obj', true, () => console.log("Spock model load success"), (err) => console.log("Spock model load err: " + err));
}



function setup() {
  createCanvas(600, 600, WEBGL);
  noStroke();
}

function draw() {
  background(0);

  directionalLight(255, 255, 255, -0.5,-0.5,-0.5);
  directionalLight(255, 255, 255, -0.5,0.5,-0.5);
  directionalLight(255, 255, 255, 0.5,-0.5,-0.5);
  directionalLight(255, 255, 255, 0.5,0.5,-0.5);

  fill(palette[4]);
  rotateX(PI);
  rotateY(frameCount * TWO_PI/600);
  scale(2.5);
  model(spockModel);
  if(frameCount === 600) noLoop();

}

// ############### GRAVITY ARROW ################## ///

function showGravDirection(a){
  let pulse = 0.5*(cos(frameCount * TWO_PI/120) + 1)
  let opacity = 255//pulse* 255;
  let scl = map(pulse, 0, 1, 0.9, 1.1);
  fill(255, opacity);
  push();
  translate(width - 0.15*height, 0.825*height);
  scale(scl);
  rotate(a);
  rect(0,0,0.025*height*0.4, height*0.08);
  push();
  translate(0, height*0.01);
  triangle(0.02*height, 0.01*height, -0.02*height, 0.01*height, 0, 0.04*height);
  pop();
 
  pop();
}


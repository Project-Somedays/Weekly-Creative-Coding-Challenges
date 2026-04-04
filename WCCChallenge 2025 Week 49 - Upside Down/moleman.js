// ############### UPDATING SPRITESHEET AND FACING THE RIGHT WAY ################## ///

function showMoleman(i, heightProp = 0.33){
  push();
  translate(moleman.x, moleman.y);
  
  // Rotate during gravity flip
  if(flippingGravity) {
    rotate(a);
  } else {
    // Stay at final rotation when not flipping
    rotate(gravDown ? 0 : PI);
  }
  
  // Flip horizontally when moving left
  let xScale = moveLeft ? -1 : 1;

    // Also flip when gravity is inverted
  if(!gravDown) {
    xScale *= -1;
  }
  
  
  scale(xScale, 1);
  
  image(spritesheet.get((i)*spritesheet.width/6, 0, spritesheet.width/6, spritesheet.height), 0, 0, height* heightProp, height*heightProp );
  pop();
}


// ############### GRAVITY BIZ ################## ///

function updateMolemanHeight(){
  // Gradually transition gravity during flip
  let gravityMultiplier;
  if(flippingGravity) {
    // Interpolate from current gravity to opposite
    gravityMultiplier = gravDown ? (1 - 2 * progress) : (-1 + 2 * progress);
  } else {
    gravityMultiplier = gravDown ? 1 : -1;
  }
   
  let gravity = 0.3 * gravityMultiplier;
  molemanVel.y += gravity * gravStrength;
  
  // Apply velocity
  moleman.y += molemanVel.y;
  
  // Simple ground collision
  if(gravDown && moleman.y > 0.75 * height) {
    moleman.y = 0.75 * height;
    molemanVel.y = 0;
  }
  
  if(!gravDown && moleman.y < 0.25 * height) {
    moleman.y = 0.25 * height;
    molemanVel.y = 0;
  }
}
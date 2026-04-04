// ############### KEYBOARD INPUT ################## ///

function keyPressed(){
  if(key === ' ' && !isInAir ){
    // Jump: apply velocity opposite to gravity direction
    let jumpForce = gravDown ? -8 : 8;
    molemanVel.y = jumpForce;
  }
  
  if(key.toLowerCase() === 'g' && !flippingGravity){
    flippingGravity = true;
    progress = 0;
    soundGravShift.stop();
    soundGravShift.setVolume(0.2);
    soundGravShift.play();
    // Stop after 1/3 of the duration
    let duration = soundGravShift.duration();
    setTimeout(() => {
      soundGravShift.stop();
    }, (duration * 0.5) * 1000);
  }

  if(key.toLowerCase() === 'r') resetGame();
}

// ############### GAME PROGRESSION ################## //

function increaseDifficulty(){
    score++;
    threshold = max(0.4, threshold - 0.005); // Don't go below 0.4
    speedMultiplier += 0.025;
    
    // Update all layer speeds based on multiplier
    for(let layer of layers){
      layer.speed = layer.baseSpeed * speedMultiplier;
    }
}

// ############### GAMEOVER SCREEN ################## //

function triggerGameOver(){
  
  moleman.x = height*0.15;
  moleman.y = height/2;
  showMoleman(0, 1.5);
  fill(255);
  text("GAME OVER", width/2, height/2 - textSize()/3);
  text(`SCORE: ${score}`, width/2, height/2);
  text("Press 'r' to try again!", width/2, height/2 + textSize()/3)
  soundDeath.play();
  noLoop();
  
}


// ############### COLLISION DETECTION ################## ///

function checkCollision() {
  // Only check foreground layers (indices 4 and 5)
  let topLayer = layers[4];
  let bottomLayer = layers[5];
  
  // Find the point index at moleman's x position
  let molemanIndex = floor((moleman.x - topLayer.offset) / stepSize);
  
  // Make sure index is valid
  if(molemanIndex < 0 || molemanIndex >= topLayer.points.length) return false;
  
  // Get the y values at moleman's position
  let topY = topLayer.points[molemanIndex];
  let bottomY = bottomLayer.points[molemanIndex];
  
  // Define moleman's hitbox (smaller than sprite for forgiveness)
  let hitboxSize = height * 0.025; // Half the sprite size for easier gameplay
  let molemanTop = moleman.y - hitboxSize;
  let molemanBottom = moleman.y + hitboxSize;
  
  // Check if moleman hits top spikes (only if there's actually a spike)
  if(topY > topLayer.yBase && molemanTop < topY) {
    return true;
  }
  
  // Check if moleman hits bottom spikes (only if there's actually a spike)
  if(bottomY < bottomLayer.yBase && molemanBottom > bottomY) {
    return true;
  }
  
  return false;
}

// ############### INSTRUCTIONS ################## ///

function showInstructions(){
    if(instructionMode){
    textSize(min(width, height)/6);
    fill(255);
    text("Arrow Keys/A,D to Move",width/2, height/2 - textSize());
    text("Spacebar to jump", width/2, height/2 - textSize()/2);
    text("'G' to flip gravity", width/2, height/2);
    text("Watch your head/shins!", width/2, height/2 + textSize()/2);
  
    text("Stay on the screen...", width/2, height/2+textSize());
  } else {
    textSize(min(width, height)/3);
  }
}

// ############### RESTARTING ################## ///

function resetGame() {
  // Reset all game variables
  score = 0;
  threshold = 0.55;
  speedMultiplier = 1;
  gravDown = true;
  flippingGravity = false;
  isInAir = false;
  isMoving = false;
  moveLeft = false;
  instructionMode = true;
  progress = 0;
  a = 0;
  state = 0;
  
  // Reset moleman position and velocity
  moleman.x = 0.5 * width;
  moleman.y = 0.75 * height;
  molemanVel.x = 0;
  molemanVel.y = 0;
  
  // Reset all layers
  for(let layer of layers) {
    layer.speed = layer.baseSpeed;
    layer.offset = 0;
    layer.nextX = 0;
    layer.points = [];
    
    // Re-populate points
    for(let x = 0; x <= width + stepSize; x += stepSize) {
      let y = calculateY(x, layer.offset, layer);
      layer.points.push(y);
      layer.nextX = x + stepSize;
    }
  }
  
  // Restart the game loop
  loop();
}

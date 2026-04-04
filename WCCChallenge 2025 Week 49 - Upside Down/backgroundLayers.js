// ############### MAKING A LAYER ################## ///

function generateLayers(){
    return [
  // background
  { points: [], yBase: height*0.4, yMax: height*0.45, seed: 0, baseSpeed: scrollSpeed, speed: scrollSpeed, colour: backgroundColour, isTop: true, offset: 0, nextX: 0 },
  { points: [], yBase: height*(1-0.4), yMax: height*(1-0.45), seed: 1000, baseSpeed: scrollSpeed, speed: scrollSpeed, colour: backgroundColour, isTop: false, offset: 0, nextX: 0 },
  // middleground
  { points: [], yBase: height*0.3, yMax: height*0.45, seed: 2000, baseSpeed: scrollSpeed*1.5, speed: scrollSpeed*1.5, colour: middleGroundColour, isTop: true, offset: 0, nextX: 0 },
  { points: [], yBase: height*(1-0.3), yMax: height*(1-0.45), seed: 3000, baseSpeed: scrollSpeed*1.5, speed: scrollSpeed*1.5, colour: middleGroundColour, isTop: false, offset: 0, nextX: 0 },
  // foreground
  { points: [], yBase: height*0.2, yMax: height*0.45, seed: 4000, baseSpeed: scrollSpeed*3, speed: scrollSpeed*3, colour: foregroundColour, isTop: true, offset: 0, nextX: 0 },
  { points: [], yBase: height*(1-0.2), yMax: height*(1-0.45), seed: 5000, baseSpeed: scrollSpeed*3, speed: scrollSpeed*3, colour: foregroundColour, isTop: false, offset: 0, nextX: 0 }
];
}

// ############### SHOW LAYER ################## ///

function drawLayer(layer) {
  fill(layer.colour);
  
  let startY = layer.isTop ? 0 : height;
  let endY = layer.isTop ? 0 : height;
  
  beginShape();
  vertex(0, startY);
  
  // Draw points with sub-pixel offset for smooth scrolling
  for(let i = 0; i < layer.points.length; i++) {
    let x = i * stepSize + layer.offset;
    vertex(x, layer.points[i]);
  }
  
  vertex(width, endY);
  endShape();
}

// ############### GENERATE NEW POINTS AND SCROLLING ################## //

function updateLayer(layer) {
  // Update offset based on speed
  layer.offset += layer.speed;
  
  // Only shift and add new points when we've scrolled a full stepSize
  while(layer.offset <= -stepSize) {
    layer.offset += stepSize;
    
    // Shift array left (remove first element)
    layer.points.shift();
    
    // Calculate new point using nextX to continue the noise pattern
    let y = calculateY(layer.nextX, 0, layer);
    layer.points.push(y);
    
    // Increment nextX for the next point
    layer.nextX += stepSize;
  }
}

// ############### SPIKE HEIGHT BIZ ################## ///

function calculateY(x, offset, layer) {
  let noiseVal = noise((x * 0.05) + (offset * 0.01) + layer.seed);
  
  // Only create spikes where noise is above threshold
  if(noiseVal > threshold) {
    let spikeHeight = pow((noiseVal - threshold) / threshold, 2);
    return map(spikeHeight, 0, 1, layer.yBase, layer.yMax);
  } else {
    return layer.yBase; // flat base between spikes
  }
}

function tangramize(region){
  
  let dieRoll = random();
  
  if(dieRoll < 0.33){
    region.shapes.push(tangramSquare(region.w, random(rotations), random(palette)))
  } else if (dieRoll < 0.66) {
    [tri1, tri2] = tangramSquare2Triangles(region, random(rotations));
    region.shapes.push(tri1);
    region.shapes.push(tri2);
  } else if (dieRoll < 0.9) {
    region.shapes.push(tangramSquare2Parallelogram(region, random(rotations)));
  } else {
    region.shapes.push(tangramSquareToTangram(region, random(rotations)));
  }

}

function tangramSquare(w, rotation, colour){
  function showSquare(){
    push();
    // rotate(rotation);
    fill(colour)
    square(0,0,w)
    pop();
  }
  return {show: showSquare, angle: rotation}
}

function tangramTriangle(w, rotation, colour){
  function showTriangle(){
    push()
    // rotate(rotation);
    fill(colour);
    triangle(-w/2, -w/2, w/2, w/2, -w/2, w/2);
    pop();
  }
  return {show: showTriangle, angle: rotation};
}

function tangramSquare2Triangles(region, rotation){
  let firstAngleIx = floor(random(rotations.length));
  let secondAngleIx = (firstAngleIx + 2)%rotations.length;
  return [
    tangramTriangle(region.w, rotations[firstAngleIx] + rotation, random(palette)),
    tangramTriangle(region.w, rotations[secondAngleIx] + rotation, random(palette))];
}

function tangramParallelogram(w, cols, rotation){
  function showParallelogram(){
    push(); // ADD THIS
    
    // parallelogram
    fill(cols[0]);
    beginShape();
    vertex(-w/2, -w/2);
    vertex(0, -w/2);
    vertex(w/2, w/2);
    vertex(0, w/2);
    endShape(CLOSE);
    
    // triangle1
    fill(cols[1]);
    triangle(
      -w/2, -w/2, // top left corner
      0, w/2,     // middle bottom
      -w/2, w/2); // bot left corner
    
    // triangle2
    fill(cols[2]);
    triangle(
      0, -w/2,   // top middle
      w/2, -w/2, // top right (FIXED - was w/2, w/2)
      w/2, w/2); // bot right 
    
    pop(); // MOVE THIS HERE
  }
  return {show: showParallelogram, angle: rotation}
}

function tangramSquare2Parallelogram(region, rotation){
  return tangramParallelogram( // RETURN instead of push
    region.w, 
    [random(palette), random(palette), random(palette)], 
    rotation  // REMOVED random() wrapper
  );
}

function tangramTangram(w, cols, rotation){
  function showTangram(){
    // bottom left triangle
    fill(cols[0]);
    triangle(-w/2, w/2, -w/2, -w/2, w/2, w/2);
    
    // top left
    fill(cols[1]);
    triangle(-w/2, -w/2, 0, -w/2, -w/4, -w/4);
    
    // top right
    fill(cols[2]);
    triangle(0, -w/2, w/2, -w/2, w/2, 0);
    
    // bottom triangle
    fill(cols[3]);
    triangle(0,0, w/4, -w/4, w/4, w/4);
    
    // square
    fill(cols[4]);
    beginShape();
    vertex(0,0)
    vertex(-w/4, -w/4);
    vertex(0, -w/2);
    vertex(w/4, -w/4);
    endShape();
    
    // parallelogram
    fill(cols[5]);
    beginShape();
    vertex(w/2, w/2);
    vertex(w/4, w/4);
    vertex(w/4, -w/4);
    vertex(w/2, 0);
    endShape();
  }
  return {show: showTangram, angle: rotation}
}

function tangramSquareToTangram(region, rotation){
  return tangramTangram(region.w, Array.from({length: 6}, () => random(palette)), rotation);
}




function update(){
    shapes = [];
    for(let region of regions){
      tangramize(region);
    }
  
}

function keyPressed(){
  if(key === 'r'){
    update();
  }
}
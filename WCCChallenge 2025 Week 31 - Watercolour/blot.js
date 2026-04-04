class Blot{
  constructor(x,y, startingVerts, a, r){
    this.p = createVector(x,y)
    this.originalPts = [];
    this.a = a;
    this.basePoints = [];
    this.progress = 0;
    for(let i = 0; i < startingVerts; i++){
      let a = i * TWO_PI/startingVerts;
      let x = r * cos(a);
      let y = r * sin(a);
      this.originalPts.push(createVector(x,y));
    }
    this.boundaryPts = [...this.originalPts];
    this.drawn = false;
  }



  advance(){
    this.progress ++;
    if(this.progress <= params.deformationDepth) this.boundaryPts = this.blot(this.boundaryPts)
    if(this.progress === params.preservationDepth) this.basePoints = [...this.boundaryPts];
    this.drawn = this.progress > params.deformationDepth; 
}

  drawBlotLayers(){
    let bPts = [...this.basePoints];
    for(let i = 0; i < params.blotLayers; i++){
      let newPts = this.blot(bPts);
      this.show(newPts);
    }
  }

  show(pts){
    push();
    noStroke();
    let c = color(params.paintColour);
    c.setAlpha(int(params.layerOpacity * 255))
    c = this.drawn ? c : color(params.paintColour);
    fill(c);
    translate(this.p.x,this.p.y);
    rotate(this.a)
    beginShape();
    for(let p of pts){
      vertex(p.x, p.y);
    }
    endShape();
    pop();
  }

  blot(pts){
    let newPts = [];
    for(let i = 0; i < pts.length; i++){
        let p1 = pts[i]
        let p2 = pts[(i + 1)%pts.length]; // next point
        let edge = p5.Vector.sub(p2, p1);
        let edgeLength = p5.Vector.dist(p2, p1);
        let midPoint = p5.Vector.lerp(p2, p1, randomGaussian(0.5, params.midPointPosSD));
        let normalVector = createVector(edge.y, -edge.x);
        normalVector.normalize();
        let r = 0.5 * edgeLength * max(0, randomGaussian(1, params.pertRadiusSD)); // always positive
        let vectorToPt = p5.Vector.add(midPoint, normalVector.copy().mult(r)); // Use a copy here
        // Rotate the vector from midPoint to pt
        let rotatedVector = p5.Vector.sub(vectorToPt, midPoint);
        let anglePerturbation = constrain(randomGaussian(0, PI/8), -HALF_PI, HALF_PI);
        rotatedVector.rotate(anglePerturbation);
        let newPt = p5.Vector.add(midPoint, rotatedVector);
        newPts.push(p1); // add in the original point
        newPts.push(newPt); // add in the new point
      }
     return newPts;
    }
}
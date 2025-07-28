class Morpher{
    constructor(polyAVertices, polyBVertices, frames, phaseOffset){
        this.polygonA = [...polyAVertices];
        this.polygonB = [...polyBVertices];
        this.morphedPolygons = [];
        this.frames = frames;
        this.phaseOffset = phaseOffset;
        

        // Create intermediate polygons for each frame
        for (let i = 0; i <= frames; i++) {
            let intermediatePolygon = [];
            
            // Interpolate vertices between corresponding vertices of polygonA and polygonB
            for (let j = 0; j < max(this.polygonA.length, this.polygonB.length); j++) {
            let vertexIndexA = j % this.polygonA.length;
            let vertexIndexB = j % this.polygonB.length;
            
            let x = lerp(this.polygonA[vertexIndexA].x, this.polygonB[vertexIndexB].x, i / this.frames);
            let y = lerp(this.polygonA[vertexIndexA].y, this.polygonB[vertexIndexB].y, i / this.frames);
            
            intermediatePolygon.push(createVector(x, y));
            }
            
            this.morphedPolygons.push(intermediatePolygon);
        }

    }

    show(){
        // Draw the morphed polygon
        let frameIndex = int((0.5*(-cos(frameCount * TWO_PI/this.frames + this.phaseOffset) + 1))*(this.morphedPolygons.length-1));
        drawPolygon(this.morphedPolygons[frameIndex]);
    }
}

function drawPolygon(vertices) {
    beginShape();
    for (let i = 0; i < vertices.length; i++) {
      vertex(vertices[i].x, vertices[i].y);
    }
    endShape(CLOSE);
  }

  function getPolygonVertices(r, sides, angleOffset = 0){
    let vertices = [];
    for(let i = 0; i < sides; i++){
      let a = i*TWO_PI/sides + angleOffset;
      vertices[i] = createVector(r*cos(a), r*sin(a)); 
    }
    return vertices;
  }
// from ChatGPT

class Worm{
    constructor(segCount, segLength, colour){
        this.segments = [];
        this.target = createVector(0,0,0);
        this.colour = colour;
        for (let i = 0; i < segCount; i++) {
            let x = random(-width/2, width/2);
            let y = width/4;
            let z = random(-height/2, height/2);
            let weight = map(i, 0, segCount - 1, minWeight, maxWeight)
            this.segments.push(new Segment(x, y, z, segLength, weight));
          }
        this.base = this.segments[0]; // The base is the first segment
        this.xOff = random(10000);
        this.yOff = random(10000);
        this.zOff = random(10000);
        this.headSamplePoints = [];
    }

    getHeadSamplePoints(headPos){
        let samplePoints = [];
        for(let r = 0; r < maxWeight/2; r += maxWeight/6){
            for(let a = 0; a < TWO_PI; a += TWO_PI/3){
                samplePoints.push(createVector(headPos.x + r*cos(a), headPos.y + getHeightAsAFunctionOfDistanceFromCentre(r, maxWeight/2), headPos.z + r*sin(a)));
            }
        }
        this.headSamplePoints = [...samplePoints];
    }


    updateAndShow(tx, ty, tz){
        // Move end effector to target
        this.target.set(tx, ty, tz);
        this.segments[this.segments.length - 1].follow(this.target);
        
        // Update segments positions
        for (let i = this.segments.length - 2; i >= 0; i--) {
            this.segments[i].follow(this.segments[i + 1].a);
        }
        
        // Move the base segment to keep the chain intact
        this.base.follow(this.segments[1].a);
        
        // Update all segments positions
        for (let i = 1; i < this.segments.length; i++) {
            this.segments[i].setPosition(this.segments[i - 1].b.x, this.segments[i - 1].b.y, this.segments[i-1].b.z);
        }
        
    this.getHeadSamplePoints(this.segments[this.segments.length - 1].a);

    
      stroke(this.colour);
      // strokeWeight(1);
        // Draw segments
        for (let segment of this.segments) {
            segment.update();
            segment.show();
        }

    // push();
    // let head = this.segments[this.segments.length - 1].a;
    // translate(head.x, head.y, head.z);
    // sphere(width/50);
    // pop();
    }
}

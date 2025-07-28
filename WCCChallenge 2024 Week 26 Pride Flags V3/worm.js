// from ChatGPT

class Worm{
    constructor(segCount, segLength, tx, ty, colour){
        this.segments = [];
        this.target = createVector(tx, ty)
        for (let i = 0; i < segCount; i++) {
            let x = random(width);
            let y = random(height);
            let angle = 0;
            let weight = map(i, 0, segCount - 1, minWeight, maxWeight)
            this.segments.push(new Segment(x, y, angle, segLength, colour, weight));
          }
          this.base = this.segments[0]; // The base is the first segment
    }

    updateAndShow(tx, ty){
        // Move end effector to target
        this.target.set(tx, ty);
        this.segments[this.segments.length - 1].follow(this.target.x, this.target.y);
        
        // Update segments positions
        for (let i = this.segments.length - 2; i >= 0; i--) {
            this.segments[i].follow(this.segments[i + 1].a.x, this.segments[i + 1].a.y);
        }
        
        // Move the base segment to keep the chain intact
        this.base.follow(this.segments[1].a.x, this.segments[1].a.y);
        
        // Update all segments positions
        for (let i = 1; i < this.segments.length; i++) {
            this.segments[i].setPosition(this.segments[i - 1].b.x, this.segments[i - 1].b.y);
        }
        
        // Draw segments
        for (let segment of this.segments) {
            segment.update();
            segment.show();
        }

    }
    

}
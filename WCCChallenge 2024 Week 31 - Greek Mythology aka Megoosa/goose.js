// from ChatGPT

class Goose{
    constructor(segCount, segLength, tx, ty, colour, weight, baseX, baseY){
        this.segments = [];
        
        this.target = createVector(tx, ty);
        this.anchor = createVector(baseX, baseY);
        for (let i = 0; i < segCount; i++) {
            let x = random(width);
            let y = random(height);
            let angle = 0;
            this.segments.push(new Segment(x, y, angle, segLength, colour, weight));
          }
          this.base = this.segments[0]; // The base is the first segment
    }

    update(tx, ty){
        // Move end effector to target
        this.target.set(tx, ty);
        let total = this.segments.length;
        let end = this.segments[total - 1];
        end.follow(this.target.x, this.target.y);
        end.update();

        
        // Update segments positions
        for (let i = this.segments.length - 2; i >= 0; i--) {
            this.segments[i].follow(this.segments[i + 1].a.x, this.segments[i + 1].a.y);
        }
        
        // // Move the base segment to keep the chain intact
        // this.base.follow(this.segments[1].a.x, this.segments[1].a.y);
        this.base.setPosition(this.anchor.x, this.anchor.y);
        
        // Update all segments positions
        for (let i = 1; i < this.segments.length; i++) {
            this.segments[i].setPosition(this.segments[i - 1].b.x, this.segments[i - 1].b.y);
        }
        
        // Draw segments
        for (let segment of this.segments) {
            segment.update();
        }

    }

    show(){
        //outline
        stroke(100);
        strokeWeight(gooseThick*1.1);
        this.showGooseNeck();

        //neck
        stroke(200);
        strokeWeight(gooseThick);
        this.showGooseNeck();

        
    }

    showGooseNeck(){
        beginShape();
        // vertex(this.segments[0].a.x, this.segments[0].a.x);
        for (let i = 0; i < this.segments.length; i++) {
            // segment.show();
            curveVertex(this.segments[i].a.x, this.segments[i].a.y);
        }
        // vertex(this.segments[this.segments.length - 1].a.x, this.segments[this.segments.length - 1].a.x);
        endShape();

    }

    getEndPosAndAngle(){
        let endSegment =  this.segments[this.segments.length - 1];
        return {
            endPos: createVector(endSegment.b.x, endSegment.b.y),
            endAngle: p5.Vector.sub(endSegment.b, endSegment.a).heading()
        }
    }
    

}
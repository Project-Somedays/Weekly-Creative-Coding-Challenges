// from ChatGPT

class Limb{
    constructor(segObjs, baseX, baseY){
        this.target = createVector(baseX, baseY);
        this.anchor = createVector(baseX, baseY);
        this.segments = this.constructSegments(segObjs)
        this.base = this.segments[0]; // The base is the first segment
    }

    constructSegments(segObjs){
        let segments = [];
        for(let seg of segObjs){
            segments.push(new Segment(0,0,0,seg.length, seg.colour, seg.segweight, seg.minAngle, seg.maxAngle));
        }
        return segments;
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
        strokeWeight(this.limbThick*1.1);
        this.showSquigglyLimb();

        //neck
        stroke(200);
        strokeWeight(this.limbThick);
        this.showSquigglyLimb();

        
    }

    showSquigglyLimb(){
        beginShape();
        // vertex(this.segments[0].a.x, this.segments[0].a.x);
        for (let i = 0; i < this.segments.length; i++) {
            // segment.show();
            curveVertex(this.segments[i].a.x, this.segments[i].a.y);
        }
        // vertex(this.segments[this.segments.length - 1].a.x, this.segments[this.segments.length - 1].a.x);
        endShape();

    }

    showNormalLimb(){
        for(let seg of this.segments){
            seg.show();
        }
        // strokeWeight(this.limbThick);
        // beginShape();
        // for(let seg of this.segments){
        //     vertex(seg.a.x, seg.a.y);
        // }
        // let lastSeg = this.segments[this.segments.length - 1];
        // vertex(lastSeg.b.x, lastSeg.b.y);
        // endShape();
    }

    getEndPosAndAngle(){
        let endSegment =  this.segments[this.segments.length - 1];
        return {
            endPos: createVector(endSegment.b.x, endSegment.b.y),
            endAngle: p5.Vector.sub(endSegment.b, endSegment.a).heading()
        }
    }
    

}
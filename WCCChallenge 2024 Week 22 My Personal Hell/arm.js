// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain
// Video: https://youtu.be/10st01Z0jxc
// Tanscription to Javascript: Chuck England

class Arm {
    constructor(x, y, baseX, baseY) {
        this.segments = [];
        this.basePos = createVector(baseX, baseY);
        this.base = createVector(x, y);
        this.len = maxLength;
        this.cycleOffset = random(1000);
        this.segments[0] = new Segment(300, 200, this.len, 0);
        for (let i = 1; i < armSegments; i++) {
            this.segments[i] = new Segment(this.segments[i - 1], this.len, i);
        }
        this.target = createVector(this.basePos.x, this.basePos.y);
    }

    setTarget(target){
        this.target = target;
    }

    update() {
        let total = this.segments.length;
        let end = this.segments[total - 1];
        end.follow(this.target.x, this.target.y);
        end.update();

        for (let i = total - 2; i >= 0; i--) {
            this.segments[i].followChild(this.segments[i + 1]);
            this.segments[i].update();
        }

        this.segments[0].setA(this.base);

        for (let i = 1; i < total; i++) {
            this.segments[i].setA(this.segments[i - 1].b);
        }
    }

    showArm(strokeColBase, strokeColTop){
        for(let i = 0; i < this.segments.length; i++){
            let strokeWeightVal = map(i, 0, this.segments.length, yardstick/10,yardstick/80);
            let start = this.segments[i].a;
            let end = this.segments[i].b;
            stroke(strokeColBase);
            strokeWeight(strokeWeightVal*1.1);
            line(start.x, start.y, end.x, end.y);
        
            stroke(strokeColTop);
            strokeWeight(strokeWeightVal);
            line(start.x, start.y, end.x, end.y);
        }
        // beginShape();
        // vertex(this.segments[0].a.x, this.segments[0].a.y);
        // vertex(this.segments[0].a.x, this.segments[0].a.y);
        // for (let i = 0; i < this.segments.length; i++) {
        //     curveVertex(this.segments[i].b.x, this.segments[i].b.y);
        // }
        // let last = this.segments[this.segments.length - 1];
        // vertex(last.b.x, last.b.y);
        // endShape();
    }

    show() {

        if(legacyArmMode){
            for(let seg of this.segments){
                seg.show();
            }
        } else {
            this.showArm('#37257e', '#5D3FD3');
            // this.showArm(color(0), '#5D3FD3');
        }


        
        
        

        if(handMode) {
            let lastArm = this.segments[this.segments.length - 1];
            let armPivotPt = p5.Vector.lerp(lastArm.a, lastArm.b, 0.9);
            let a = p5.Vector.sub(lastArm.b, lastArm.a).heading() + HALF_PI;
            push();
            translate(armPivotPt.x, armPivotPt.y);
             
            rotate(a - radians(5));

            image(hand, 0, 0, hand.width*handScale, hand.height*handScale);            
            pop();
            
        }
    }
}

// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain
// Video: https://youtu.be/10st01Z0jxc
// Tanscription to Javascript: Chuck England

class Limb {
    constructor(basePos, target, armSegments, totalLength) {
        this.segments = [];
        this.basePos = createVector(width/2 + basePos.x, height/2 + basePos.y)   ;
        this.base = this.basePos.copy();
        this.len = totalLength / armSegments;
        this.segments[0] = new Segment(300, 200, this.len, 0);
        for (let i = 1; i < armSegments; i++) {
            this.segments[i] = new Segment(this.segments[i - 1], this.len, i);
        }
        this.target = target;
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

    show() {
        noFill();
        stroke(0);
        strokeWeight(40);
        this.drawArm();
        stroke("#e4fce1");
        strokeWeight(30);
        this.drawArm();
    }

    drawArm(){
        beginShape();
        vertex(this.segments[0].a.x, this.segments[0].a.y);
        for (let i = 0; i < this.segments.length; i++) {
            // this.segments[i].show();
            curveVertex(this.segments[i].b.x, this.segments[i].b.y);
        }
        curveVertex(this.segments[this.segments.length - 1].b.x, this.segments[this.segments.length - 1].b.y);
        endShape();
    }
}

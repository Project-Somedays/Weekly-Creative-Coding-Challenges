// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain
// Video: https://youtu.be/10st01Z0jxc
// Tanscription to Javascript: Chuck England

class Arm {
    constructor(x, y, basePos, target) {
        this.segments = [];
        this.basePos = createVector(basePos.x, basePos.y)   ;
        this.base = createVector(x, y);
        this.len = maxLength;
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
        for (let i = 0; i < this.segments.length; i++) {
            this.segments[i].show();
        }
    }
}

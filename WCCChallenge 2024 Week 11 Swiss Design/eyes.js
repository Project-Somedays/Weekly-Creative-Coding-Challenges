class Eyes{
    constructor(x,y,d){
        this.p = createVector(x,y);
        this.lEye = new Eye(x + 0.5*eyeSep*cos(d+PI), y + 0.5*eyeSep*sin(d + PI));
        this.rEye = new Eye(x + 0.5*eyeSep*cos(d), y + 0.5*eyeSep*sin(d));
    }

    update(){
        this.lEye.update();
        this.rEye.update();

    }

    show(){
        this.lEye.show();
        this.rEye.show();
    }
}

class Eye{
    constructor(x,y){
        this.p = createVector(x,y);
        this.r = 0;
        this.a = 0;
        
    }

    update(){
        let d = p5.Vector.dist(this.p, fingertip);
        this.r = map(d, 0, walter.height*walterScale, 0, eyeSize/2);
        this.a = p5.Vector.sub(fingertip, this.p).heading();
    }

    show(){
        push();
        translate(this.p.x, this.p.y);
        fill(255);
        circle(0, 0, eyeSize);
        fill(0);
        circle(this.r*cos(this.a), this.r*sin(this.a), eyeSize/5);
        pop();
    }
}
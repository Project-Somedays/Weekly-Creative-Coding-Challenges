class Box{
    constructor(x,y, c){
        this.initPos = {x: x, y: y};
        this.p = {x: x, y:y};
        this.angle = 0;
        this.c = c;
        this.body = Body.rectangle(x,y,boxSize, boxSize);
    }

    update(x,y,a){
        this.p.x = x;
        this.p.y = y;
        this.angle = a;
    }

    show(){
        push();
        translate(this.p.x, this.p.y);
        rotate(this.angle);
        pop();
    }
}
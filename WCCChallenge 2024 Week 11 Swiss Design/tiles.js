class RectangleTile{
    constructor(tlx,tly){
      this.p = createVector(tlx, tly);
      this.a = random([0, HALF_PI]);
      this.c1 = random(palette);
      this.c2 = random(palette.filter(e => e != this.c1));
    }
  
    show(){
      push();
        translate(this.p.x + s/2, this.p.y + s/2) // translate to the middle
        rotate(this.a);
        fill(this.c1);
        rect(-s/2 , -s/2 , s/2, s);
        fill(this.c2);
        rect(0, -s/2, s/2, s);
        fill(this.c1);
        // circle(0,0, 300);
      pop();
      
    }
  }


class CircleTile{
    constructor(tlx, tly){
        this.p = createVector(tlx + s/2, tly + s/2)
        this.a = random([0, HALF_PI, PI, 3*HALF_PI]);
        this.sc = random(palette);
        this.c1 =  random(palette.filter(e => e != this.sc));
        this.c2 = random(palette.filter(e => e != this.c1 && e != this.sc)); // must be different
    }

    show(){
        push();
        translate(this.p.x, this.p.y);
        rotate(this.a);
        
        fill(this.sc);
        square(-s/2, -s/2, s);

        fill(this.c1);
        arc(-s/2, s/2, s, s, 3*HALF_PI, TWO_PI, PIE);

        fill(this.c2);
        arc(s/2, -s/2, s, s, HALF_PI, PI, PIE);

        pop();
    }
}
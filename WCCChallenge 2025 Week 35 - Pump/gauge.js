class Gauge{
  constructor(x,y, w, h, startVal, showFn, title){
    this.p = createVector(x, y);
    this._val = startVal;
    this.w = w;
    this.h = h;
    this.t = 0;
    this.a = 0;
    this.update();
    this.vals = [];
    for(let i = 0; i < 10; i++){
        this.vals.push(0);
    }
    this.showFn = showFn;
    this.title = title;
  

  }

  override(val){
    this._val = val;
  }

  deplete(val){
    this._val = max(this._val - val, 0); // clamp to inside 0 and 1

  }

  boost(val){
    this._val = min(this._val + val, 1); // same as above
  }

  update(){
    this.a = map(this._val, 0, 1, PI/3, -PI/3);
  }

  show(){
    this.showFn(this.p.x, this.p.y, this.w, this.h, this._val);
  }

}

function thermometer(x,y,w,h,val){

push();
    translate(x,y);
    noFill();
    stroke(255);
    strokeWeight(5);
    circle(0, h/2, w*1.5); // do the bulb
    rect(0,0,w,h, w/2, w/2);
  
    fill(255,0,0); // do the readout
    noStroke();
    circle(0, h/2, w*1.5);
    rect(0, (1-val)*h/2, w, val*h, w/2, w/2);

    fill(255);
    noStroke();
    text(this.title, 0, -h/2 - textSize()/2);
pop();
  
}

function dial(x,y, w, h, val){
  push();
    translate(x, y);


    strokeWeight(50);
    
    noFill();

    // draw the dial backing
    for(let i = 0; i < 4; i++){
      stroke(palette[i]);
      arc(0, 0, 2*w, 2*h, PI + i*PI/4, PI+ (i+1)*PI/4, OPEN);
    }
    
    // draw the dial
    push()
    rotate(PI + val*PI);
    strokeWeight(10);
    stroke(255);
    strokeWeight(5);
    line(0, 0, w, 0)
    pop();

    noStroke();
    fill(255);
 
    text(this.title, 0, h/2);

    pop();

    
}
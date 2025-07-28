class Mover{
    constructor(x,y){
      this.p = createVector(x,y);
      this.v = p5.Vector.random2D();
    //   this.v = p5.Vector.fromAngle(random(-PI/12, PI/12));
      this.a = createVector(0,0);
      this.c = random(randPalette)
      // this.normal = null;
    }
  
    applyForce(f){
      this.a.add(f);
    }
  
    update(){
      this.v.add(this.a).normalize();
      this.p.add(this.v);
      this.a.mult(0);
    }
  
    show(layer){
      layer.circle(this.p.x, this.p.y, 2*r);
      drawArrow(layer, this.p.x, this.p.y, this.v.heading(), r*2);
    }
  
  
  }


  function generateMovers(wWidth, moverWidth){
    for(let i = 0; i < n; i++){
      // movers.push(new Mover(random(moverWidth, wWidth - moverWidth), random(moverWidth, wWidth - moverWidth)));
      movers.push(new Mover(random(wWidth), random(wWidth)));
    }
  }
  
  function drawArrow(layer, x,y, heading, mag){
    layer.push();
    layer.translate(x,y);
    layer.rotate(heading);
    layer.line(0, 0, mag, 0);
    layer.line(mag, 0, mag - mag/4, -mag/4);
    layer.line(mag, 0, mag - mag/4, mag/4);
    layer.pop();
  }


  function handleMoverInteraction(){
    for(let i = 0; i < movers.length; i++){
      for(let j = i; j < movers.length; j++){
        if(i === j) continue;
        let d = p5.Vector.dist(movers[i].p, movers[j].p)
        if(d < 2*r){
          let fMag = map(d, 0, 2*r, fMax, 0);
          let f = p5.Vector.sub(movers[i].p, movers[j].p);
          movers[i].applyForce(f.setMag(fMag)); // applyForce
          movers[j].applyForce(f.mult(-1)); // apply the reverse to j
        }
      }
    }
  }

  
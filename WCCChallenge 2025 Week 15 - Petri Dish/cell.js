class Cell{
    constructor(x,y){
        this.p = createVector(x, y);
        this.prevP = createVector(x,y);
        this.maxTravel = width/8;
        this.target = createVector(x,y);
        this.perimeter = [];
        for(let i = 0; i < detail; i++){
            let a = i*TWO_PI/detail;
            this.perimeter[i] = new PerimeterPoint(minR * cos(a), minR * sin(a))
        }
        this.getTarget();
        this.progress = 0;
        
        
    }

    getTarget(){
        // this.target = mousePos.copy();
        let dir = p5.Vector.sub(mousePos, this.prevP);
        let d = dir.mag();
        let mag = min(d, this.maxTravel);
        dir.setMag(mag);
        
        this.target = p5.Vector.add(this.prevP, dir);

        // set the targets for the perim points
        // for(let i = 0; i < detail; i++){
        //     let a = i*TWO_PI/detail;
        //     this.perimeter[i].target.set(minR * cos(a), minR * sin(a));
        //     let d = p5.Vector.dist(this.perimeter[i].p, this.perimeter[i].target);
        //     let delay = map(d, 0, this.maxTravel, 0, -1);
        //     this.perimeter[i].delay = delay;
        // }
        for(let i = 0; i < detail; i++){
            let a = i*TWO_PI/detail;
            this.perimeter[i].target.set(minR * cos(a), minR * sin(a));
            
            // Calculate delay b
            // ased on the point's position in the perimeter
            // Points farther from the direction of movement get more delay
            let movementDir = p5.Vector.sub(this.target, this.prevP).normalize();
            let pointDir = createVector(cos(a), sin(a)).normalize();
            let alignment = 1 - abs(p5.Vector.dot(movementDir, pointDir)); // 0=aligned with movement, 1=opposite
            
            // Now map to a delay value - points opposing movement direction get more delay
            let delay = map(alignment, 0, 1, 0.2, 5.0); // Delay between 0.2 and 0.8
            this.perimeter[i].delay = delay;
        }

    }

    update(){
        this.progress = this.progress + 1/travelFrames;
        this.p = p5.Vector.lerp(this.target, this.prevP, easeProgress(this.progress));
        for(let p of this.perimeter){
            p.update();
        }

        // if(this.progress >= 1){
        //     this.prevP.set(this.target.x, this.target.y);
        //     this.getTarget()
        //     console.log(`Updated target: ${this.target.x}, ${this.target.y}  = ${mousePos.x}, ${mousePos.y}`)
        //     this.progress = 0;
        //     this.easedProgress = 0;
        // }
        if(this.progress >= 1){
            this.prevP.set(this.target.x, this.target.y);
            this.getTarget();
            console.log(`Updated target: ${this.target.x}, ${this.target.y}  = ${mousePos.x}, ${mousePos.y}`);
            this.progress = 0;
            this.easedProgress = 0;
            
            // Reset all perimeter points
            for(let p of this.perimeter){
                p.reset();
            }
        }
        
    }

    

    show(){

        // draw the cell
        stroke(255);
        push();
        translate(this.p.x, this.p.y);
        beginShape();
        for(let i = 0; i < detail; i++){
            vertex(this.perimeter[i].p.x, this.perimeter[i].p.y);
            this.perimeter[i].show();
        }
        endShape(CLOSE);
        
        pop();

        // connect prevP with target
        line(this.prevP.x, this.prevP.y, this.target.x, this.target.y);

        // ID target in red
        stroke(255, 0, 0);
        circle(this.target.x, this.target.y, 10);

        //ID prevP in blue
        stroke(0, 0, 255);
        circle(this.prevP.x, this.prevP.y, 10);

        // display progress
        stroke(255);
        strokeWeight(1);
        text(round(this.progress,2), this.p.x, this.p.y)

       


    }
  }

//   class PerimeterPoint{
//     constructor(x,y, delay){
//         this.prevP = createVector(x,y);
//         this.p = createVector(x,y);
//         this.target = createVector(x,y);
//         this.progress = 0;
//         this.delay = delay;
//     }

//     update(){
//         this.progress = (max(0, this.delay + this.progress) + 1)/travelFrames;
//         this.p = p5.Vector.lerp(this.prevP, this.target, easeProgress(this.progress));
//     }

//     show(){
//         circle(this.p.x, this.p.y, 5);
//     }

//   }

class PerimeterPoint{
    constructor(x, y){
        this.prevP = createVector(x, y);
        this.p = createVector(x, y);
        this.target = createVector(x, y);
        this.progress = 1; // Start at completed progress
        this.delay = 0;    // Default delay
        this.delayProgress = 0; // Track delayed progress separately
    }

    update(){
        // Only start progressing after delay
        if (this.delayProgress < this.delay) {
            this.delayProgress += 1/travelFrames;
        } else {
            // Once delay is satisfied, move toward target
            this.progress += 1/travelFrames;
            this.progress = min(this.progress, 1); // Cap at 1
            this.p = p5.Vector.lerp(this.prevP, this.target, easeProgress(this.progress));
        }
    }

    show(){
        // Visualize the point
        circle(this.p.x, this.p.y, 5);
        
        // Visualize the delay (optional)
        let delayColor = color(255, 0, 0, map(this.delay, 0, 1, 50, 200));
        fill(delayColor);
        noStroke();
        circle(this.p.x, this.p.y, 3);
    }
    
    reset() {
        this.prevP = this.p.copy();
        this.progress = 0;
        this.delayProgress = 0;
    }
}
class SnowMan{
    constructor(){
        this.parts = [
            new SnowmanPart({
                startV: this.getStartPoint(),
                tx: width/2,
                ty: 2*height/3,
                img: this.generateSnowmanBlob(width/4, "#ffffff")
            }), // body
            
            new SnowmanPart({
                startV: this.getStartPoint(),
                tx: 0.375*width,
                ty: 0.386*height,
                img: this.genArm(),
                scl: 0.25,
                rot: -HALF_PI + randomGaussian()*PI/25,
                isFlipped: true,
                pivotTopLeft: true
            }), // left branch
            
            new SnowmanPart({
                startV: this.getStartPoint(),
                tx: width/2,
                ty: height*0.4,
                img: this.generateSnowmanBlob(width/6, "#ffffff")
            }), // torso
            
            new SnowmanPart({
                startV: this.getStartPoint(),
                tx: 0.5*width,
                ty: 0.375*height,
                img: scarf,
                replaceWhite: true,
                scl: 0.35
            }), // scarf
            
            new SnowmanPart({
                startV: this.getStartPoint(),
                tx: width/2,
                ty: height/6,
                img: this.generateSnowmanBlob(width/8, "#ffffff")
            }), // head
            
            new SnowmanPart({
                startV: this.getStartPoint(),
                tx: width/2,
                ty: -height * 0.066,
                img: random([hat01, hat02, hat03]),
                replaceWhite: true,
                scl: 0.3
            }), // hat
            
            new SnowmanPart({
                startV: this.getStartPoint(),
                tx: 0.45*width,
                ty: 0.15*height,
                img: this.generateSnowmanBlob(width/5, "#000000"),
                replaceWhite: true,
                scl: 0.075
            }), // left eye
            
            new SnowmanPart({
                startV: this.getStartPoint(),
                tx: 0.52*width,
                ty: 0.146*height,
                img: this.generateSnowmanBlob(width/5, "#000000"),
                replaceWhite: true,
                scl: 0.075
            }), // right eye
            
            new SnowmanPart({
                startV: this.getStartPoint(),
                tx: 0.432*width,
                ty: 0.232*height,
                img: this.generateSnowmanBlob(width/5, "#000000"),
                replaceWhite: true,
                scl: 0.05
            }), // smile 01
            
            new SnowmanPart({
                startV: this.getStartPoint(),
                tx: 0.456*width,
                ty: 0.244*height,
                img: this.generateSnowmanBlob(width/5, "#000000"),
                replaceWhite: true,
                scl: 0.05
            }), // smile 02
            
            new SnowmanPart({
                startV: this.getStartPoint(),
                tx: 0.482*width,
                ty: 0.248*height,
                img: this.generateSnowmanBlob(width/5, "#000000"),
                replaceWhite: true,
                scl: 0.05
            }), // smile 03
            
            new SnowmanPart({
                startV: this.getStartPoint(),
                tx: 0.510*width,
                ty: 0.239*height,
                img: this.generateSnowmanBlob(width/5, "#000000"),
                replaceWhite: true,
                scl: 0.05
            }), // smile 04
            
            new SnowmanPart({
                startV: this.getStartPoint(),
                tx: 0.535*width,
                ty: 0.225*height,
                img: this.generateSnowmanBlob(width/5, "#000000"),
                replaceWhite: true,
                scl: 0.05
            }), // smile 05
            
            new SnowmanPart({
                startV: this.getStartPoint(),
                tx: 0.5*width,
                ty: 0.195*height,
                img: carrot,
                replaceWhite: true,
                scl: 0.15,
                rot: -QUARTER_PI + randomGaussian()*PI/24,
                isFlipped: true,
                pivotTopLeft: true
            }), // nose
            
            new SnowmanPart({
                startV: this.getStartPoint(),
                tx: 0.6*width,
                ty: 0.386*height,
                img: this.genArm(),
                scl: 0.25,
                rot: -HALF_PI + randomGaussian()*PI/25,
                pivotTopLeft: true
            }) // right branch
        ];
    }

    getStartPoint(){
        let a = random(TWO_PI);
        return createVector(width*1.75*cos(a), width*1.75*sin(a));
    }

    generateSnowmanBlob(R, fillCol){
        let graphic = createGraphics(width, height);
        let xOffset = random(1000);
        let yOffset = random(1000);
        graphic.stroke(0);
        graphic.strokeWeight(5);
        graphic.fill(fillCol);
        graphic.beginShape();
        for(let i = 0; i < 100; i++){
            let a = i * TWO_PI/100;
            let nVal = noise(cos(a) + xOffset, sin(a) + yOffset);
            let r = map(nVal, 0, 1, 0.8 * R, 1.2*R);
            graphic.vertex(r*cos(a)+width/2, r*sin(a)+height/2);
        }
        graphic.endShape();
        return graphic;
    }

    genArm(){
        let graphic = createGraphics(width, height);
        graphic.stroke("#964B00");
        graphic.strokeWeight(50);
        graphic.noFill();
        graphic.beginShape();

        function getBranchPoints(startV, endV, n = 10, spread = 10){
            let pts = [];
            
            for(let i = 0; i < n; i++){
                let p = p5.Vector.lerp(startV, endV, i / n);
                let x = p.x + random(-spread, spread);
                let y = p.y + random(-spread, spread);
                pts.push(createVector(x,y));
            }
            return pts;
        }

        let start = createVector(0.1*width, 0.1*height);
        let end = createVector(0.9*width, 0.9*height);

        let pts = getBranchPoints(start, end, 20, 10);
        let branch1Ix = floor(random(6, 12));
        let b1pts = getBranchPoints(pts[branch1Ix], createVector(width/2, 0.9*height), 5, 5);
        let branch2Ix = floor(random(10, 15));
        let b2pts = getBranchPoints(pts[branch2Ix], createVector(width*0.9, height/2), 5, 5);

        for(let branchPoints of [pts, b1pts, b2pts]){
            graphic.beginShape()
            for(let pt of branchPoints){
                graphic.vertex(pt.x, pt.y);
            }
            graphic.endShape();
        }

        graphic.endShape();
        return graphic;
    }

    update(progress){
        for(let part of this.parts){
            part.update(progress)
        }
    }
    
    show(){
        for(let part of this.parts){
            part.show();
        }
    }
}

class SnowmanPart{
    constructor({
        startV,
        tx,
        ty,
        img,
        replaceWhite = false,
        scl = 1,
        rot = 0,
        isFlipped = false,
        pivotTopLeft = false
    }){
        this.startP = createVector(startV.x, startV.y);
        this.p = createVector(startV.x, startV.y);
        this.target = createVector(tx, ty);
        this.isFlipped = isFlipped;
        this.img = img;
        this.fillCol = random(palette);
        if(replaceWhite) this.fillImage();
        this.pivotTopLeft = pivotTopLeft;
        this.scl = scl;
        this.rot = rot;
    }

    fillImage(){
        this.img.loadPixels();
        for(let x = 0; x < this.img.width; x++){
            for(let y = 0; y < this.img.height; y++){
                let ix = 4*(y*this.img.width + x);
                if(this.img.pixels[ix] > 250 && this.img.pixels[ix + 1] > 250 && this.img.pixels[ix + 2] > 250 && this.img.pixels[ix + 3] > 10){
                    this.img.pixels[ix] = red(this.fillCol);
                    this.img.pixels[ix + 1] = green(this.fillCol);
                    this.img.pixels[ix + 2] = blue(this.fillCol);
                }
            }
        }
        this.img.updatePixels();
    }

    update(progress){
        this.p = p5.Vector.lerp(this.startP, this.target, progress);
    }

    show(){
        this.pivotTopLeft ? imageMode(CORNER) : imageMode(CENTER);
        push();
        translate(this.p.x, this.p.y);
        scale(this.scl);
        scale(this.isFlipped ? -1 : 1, 1);
        rotate(this.rot);
        image(this.img, 0, 0);
        pop();
    }
}
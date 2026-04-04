class CaveSystem{
    constructor(){
        this.ceilingPts = [];
        for(let x = 0; x < width*1.25; x++){
            let topY = map(noise(x*0.005), 0, 1, height*0.1, height*0.3 + x*0.4*height/(width*1.25));
            let botY = map(noise(1000 + x*0.005), 0, 1, height*0.7 - x*0.4*height/(width*1.25), height*0.9);
            this.ceilingPts[x] = createVector(x, topY, botY);
        }

        this.caveTexture = createGraphics(width, height);
        // tile the texture
        for(let i = 0; i < 10; i++){
            for(let j = 0; j < 10; j++){
                this.caveTexture.image(rockTexture, i*width/10, j*width/10, width/10, width/10);
            }
        }
        // convert to an image
        this.caveTextureImg = this.caveTexture.get();
        // get the mask
        this.createMask();
        // apply the mask
        this.caveTextureImg.mask(this.mask);
    }

    createMask(){
        this.mask = createGraphics(width, height);
        this.mask.fill(255);
        this.mask.beginShape();
            this.mask.vertex(0, 0);
            for(let pt of this.ceilingPts){
                this.mask.vertex(pt.x, pt.y);
            }
            this.mask.vertex(width, 0);
        this.mask.endShape();


        this.mask.beginShape();
            this.mask.vertex(0, height);
            for(let pt of this.ceilingPts){
                this.mask.vertex(pt.x, pt.z);
            }
            this.mask.vertex(width, height);
        this.mask.endShape();
    }

    getY(x){
        return this.ceilingPts[floor(x)];
    }

    show(){
        image(this.caveTextureImg, width/2, height/2);
    }
}
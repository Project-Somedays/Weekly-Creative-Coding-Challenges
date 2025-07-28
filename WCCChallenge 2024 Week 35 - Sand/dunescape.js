class Dunescape{
    constructor(res, noiseDetail, minHeight, maxHeight){
        this.noiseDetail = noiseDetail;
        this.res = res;
        this.minHeight = minHeight;
        this.maxHeight = maxHeight;
        this.terrain = [];
        this.generateDuneHeightMap();
    }

    generateDuneHeightMap(){
        for(let x = 0; x < width/this.res; x ++){
            this.terrain[x] = [];
            for(let y = 0; y < width/this.res; y ++){
                this.terrain[x][y] = map(noise((x+1)*this.res*this.noiseDetail, (y+1)*this.res*this.noiseDetail), 0, 1, this.minHeight, this.maxHeight);
            }
        }
    }

    raiseHeight(gridX, gridY, amt){
        this.terrain[gridX][gridY] += amt;
    }

    show(){
        for(let x = 0; x < width/this.res - 1; x++) {
            beginShape(TRIANGLE_STRIP);
            for(let y = 0; y < width/this.res; y++) {
                // Vertex for the current row
                vertex(-width/2 + x * this.res, this.terrain[x][y], -height/2 + y * this.res);
                // Vertex for the next row (same column)
                vertex(-width/2 + (x + 1) * this.res, this.terrain[x + 1][y], -height/2 + y * this.res);
            }
            endShape();
        }
        
    }
}
class Sumo{
    constructor(x,y){
        this.p = createVector(x,y);
        this.mouth = createVector(x, y - sumoClosed.height*0.5*0.3);
        this.threshold = sumoOpen.width*0.1;
    }

    show(){
     
        if(p5.Vector.dist(this.mouth, m) <= this.threshold && sushiTrain.some(x => x.isSelected)){
            image(sumoOpen, this.p.x, this.p.y, sumoOpen.width*sumoScale, sumoOpen.height*sumoScale);
            // image(sumoOpen, this.p.x, this.p.y, sumoOpen.width * sumoScale, sumoOpen.height * sumoScale);
        } else {
            image(sumoClosed, this.p.x, this.p.y, sumoClosed.width*sumoScale, sumoClosed.height*sumoScale); 
            // image(sumoClosed, this.p.x, this.p.y);
        }
        
        // circle(this.mouth.x + sumoOpen.width*0, this.mouth.y - sumoOpen.height*0.03, sumoOpen.width*0.1);
    }

    


}
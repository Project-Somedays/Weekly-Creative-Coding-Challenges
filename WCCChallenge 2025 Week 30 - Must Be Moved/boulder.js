class Boulder{
    constructor(x, y, r, res, world){
        this.r = r;
        this.pts = [];
        this.isRolling = true;
        
        for (let i = 0; i < res; i++){
            let a = i * TWO_PI/res;
            let nx = 0.5*(cos(a) + 1);
            let ny = 0.5*(sin(a)+1);
            let r = map(noise(nx, ny), 0, 1, 0.9*this.r, 1.1*this.r);
            this.pts.push({x: r * cos(a), y: r*sin(a)});
        }

        this.body = Bodies.fromVertices(x, y, this.pts, {
            isStatic: false, // Boulder is dynamic
            restitution: 0.2, // Some bounce
            friction: 0.01,   // Low friction for rolling
            density: 0.001,   // Adjust density for mass
            label: 'Boulder' // Give it a label
        });
        World.add(world, this.body);
    }

    show(){
        push()
        translate(this.body.position.x, this.body.position.y);
        rotate(this.body.angle);
        beginShape();
            for(let pt of this.pts){
                vertex(pt.x, pt.y)
            }
        endShape();
        pop();
    }

}
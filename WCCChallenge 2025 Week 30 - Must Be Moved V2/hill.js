class Hill{
    constructor(res, world){
        this.pts = []
        this.bodies = []; // Array to store individual rectangle bodies
        
        // Generate visual points for rendering
        this.pts.push({x: 0, y: height}); // BL corner
        for(let i = 0; i < res + 1; i++){
            let x = i * width/res;
            this.pts.push({x: x, y: getHillY(x)});
        }
        this.pts.push({x: width, y: height}); // BR corner
        
        // Create physics bodies as vertical rectangles
        for(let i = 0; i < res; i++){
            let x = i * width/res;
            let segmentWidth = width/res;
            let centerX = x + segmentWidth/2; // Center of the rectangle
            
            let topY = getHillY(centerX)+5; // Height of hill at this x position
            let segmentHeight = height - topY;
            let centerY = topY + segmentHeight/2; // Center Y of rectangle
            
            // In your Hill constructor, adjust the rectangle bodies:
        let body = Bodies.rectangle(centerX, centerY, segmentWidth, segmentHeight, {
            isStatic: true,
            friction: 0.01,          // Lower friction (was 0.8) - less grip
            restitution: 0.6,       // Lower bounce (was 0.2) - less bouncy surface
            
        });
            
            this.bodies.push(body);
        }
        
        // Create a composite from all the rectangle bodies
        this.composite = Composite.create({
            label: 'Hill'
        });
        
        // Add all bodies to the composite
        Composite.add(this.composite, this.bodies);
        
        // Add the composite to the world
        World.add(world, this.composite);
        
        console.log(`Hill composite created with ${this.bodies.length} segments`);
    }

    show(){
        // Draw the visual hill shape (smooth curve)
        fill(0);
        stroke("#ffc14d");
        strokeWeight(1);
        beginShape();
        for(let pt of this.pts){
            vertex(pt.x, pt.y)
        }
        endShape(CLOSE);
        
        // Debug: show the physics bodies
        if(params.showDebug) {
            stroke(255, 0, 0);
            strokeWeight(1);
            noFill();
            
            for(let body of this.bodies) {
                beginShape();
                for(let pt of body.vertices) {
                    vertex(pt.x, pt.y);
                }
                endShape(CLOSE);
            }
        }
    }
    
    // Optional: method to remove the hill from the world
    remove(world) {
        World.remove(world, this.composite);
    }
    
    // Optional: method to get all bodies (useful for collision detection)
    getBodies() {
        return this.bodies;
    }
}
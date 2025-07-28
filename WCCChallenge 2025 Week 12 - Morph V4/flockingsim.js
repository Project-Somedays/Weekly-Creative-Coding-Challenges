class FlockingSimulation {
    constructor(numBoids) {
      this.boids = [];
      
      // Create initial boids
      for (let i = 0; i < numBoids; i++) {
        this.boids.push(new Boid(random(width), random(height)));
      }
    }
    
    // Update the simulation
    update(attractionActive) {
      // Create quadtree with the canvas boundary
      const boundary = {
        x: width / 2,
        y: height / 2,
        w: width / 2,
        h: height / 2
      };
      
      this.quadtree = new Quadtree(boundary, 4);
      
      // Insert all boids into the quadtree
      for (let boid of this.boids) {
        this.quadtree.insert(boid);
      }
      
      // Update each boid
      for (let boid of this.boids) {
        // Query nearby boids using quadtree
        const range = {
          x: boid.position.x,
          y: boid.position.y,
          r: perceptionRadius
        };
        
        const neighbors = this.quadtree.query(range);
        
        // Calculate flocking forces
        boid.flock(neighbors);
        
        // Apply forces
        if(attractionActive) boid.attractToTarget();
        // boid.applyForce(alignment);
        // boid.applyForce(cohesion);
        // boid.applyForce(separation);
        
        // Update position
        boid.update();
      }
    }

    setBoidTargets(){
        let targets = setTargets(currentPolygonSides, this.boids.length);
        if(debug) console.log(targets);
        for(let i = 0; i < targets.length; i++){
        let target = targets[i];
        this.boids[i].target = createVector(target.x, target.y, target.z);
        }
    }
    
    // Display the simulation
    show() {
      // Draw quadtree for debugging
      if (showQuadtree) {
        this.quadtree.display();
      }
      
      // Draw all boids
      for (let boid of this.boids) {
        boid.display();
      }
    }
    
    // Add or remove boids
    setNumBoids(num) {
      const currentNum = this.boids.length;
      
      if (num > currentNum) {
        // Add boids
        for (let i = 0; i < num - currentNum; i++) {
          this.boids.push(new Boid(random(width), random(height)));
        }
      } else if (num < currentNum) {
        // Remove boids
        this.boids = this.boids.slice(0, num);
      }
    }
  }
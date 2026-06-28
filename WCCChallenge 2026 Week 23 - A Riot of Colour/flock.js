// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Flock object
// Does very little, simply manages the array of all the boids

function Flock() {
    // An array for all the boids
    this.boids = []; // Initialize the array
  }
  
  Flock.prototype.run = function() {
    for (let i = 0; i < this.boids.length; i++) {
      this.boids[i].run(this.boids);  // Passing the entire list of boids to each boid individually
    }
  }

Flock.prototype.cull = function(){
  // Looping backwards is perfect here so indexing doesn't break when you remove items!
  for(let i = this.boids.length - 1; i >= 0; i--){
    let p = this.boids[i].position.copy(); // Added the 's' to boids
    
    if(p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
      this.boids.splice(i, 1); // Changed 'slice' to 'splice'
    }
  }
}
  
  Flock.prototype.addBoid = function(b) {
    this.boids.push(b);
  }
const palette = "#f94144, #f3722c, #f8961e, #f9844a, #f9c74f, #90be6d, #43aa8b, #4d908e, #577590, #277da1".split(", ").map(each => new THREE.Color(each));
const choose = (arr) => arr[Math.floor(Math.random()*arr.length)];
// prototyping variables
const flockingParams = {
  separationWeight: 0.15,
  alignmentWeight: 0.1,
  cohesionWeight: 0.1,
  separationDist: 2.5,
  neighborDist: 5.0,
  maxSpeed: 0.2,
  maxForce: 0.01
};

class Boid {
  constructor(x, y, z, scene, radius = 2, useWitchModel = false) {
    this.position = new THREE.Vector3(x, y, z);
    
    this.velocity = new THREE.Vector3(
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5
    );
    this.acceleration = new THREE.Vector3(0, 0, 0);
    
    this.isWitch = useWitchModel;
    this.mixer = null;
    this.targetQuaternion = new THREE.Quaternion();

    // Create mesh based on type
    if (useWitchModel && witchModelCache) {
    // Clone the witch model
    this.mesh = witchModelCache.scene.clone();
    this.mesh.position.copy(this.position);
    
    // Enable bloom layer for witch and all its children
    this.mesh.traverse((child) => {
      child.layers.enable(1);
    });
    
    scene.add(this.mesh);
    
    // Set up animation mixer
    this.mixer = new THREE.AnimationMixer(this.mesh);
    if (witchModelCache.animations && witchModelCache.animations.length > 0) {
      const action = this.mixer.clipAction(witchModelCache.animations[0]);
      action.play();
    }
    
    // Optional: Adjust scale or offset for broomstick tail positioning
    // this.mesh.position.y += 1; // Example offset adjustment
    
  } else {

        // Create sphere mesh
        const geometry = new THREE.SphereGeometry(radius, 16, 16);
        let colour = choose(palette)
        const material = new THREE.MeshStandardMaterial({ 
        color: colour,
        roughness: 0.5,
        emissive: colour,
        emissiveIntensity: 0.5
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.layers.enable(1); // Enable bloom layer
        this.mesh.position.copy(this.position);
        scene.add(this.mesh);
    }
    }

  // Apply flocking behaviors
  flock(boids) {
    const separation = this.separate(boids);
    const alignment = this.align(boids);
    const cohesion = this.cohere(boids);

    // Weight the forces using adjustable parameters
    separation.multiplyScalar(flockingParams.separationWeight);
    alignment.multiplyScalar(flockingParams.alignmentWeight);
    cohesion.multiplyScalar(flockingParams.cohesionWeight);

    // Apply forces
    this.applyForce(separation);
    this.applyForce(alignment);
    this.applyForce(cohesion);
  }

  // Separation: steer to avoid crowding neighbors
  separate(boids) {
    const steer = new THREE.Vector3(0, 0, 0);
    let count = 0;

    for (const other of boids) {
      const d = this.position.distanceTo(other.position);
      if (d > 0 && d < flockingParams.separationDist) {
        const diff = new THREE.Vector3()
          .subVectors(this.position, other.position)
          .normalize()
          .divideScalar(d);
        steer.add(diff);
        count++;
      }
    }

    if (count > 0) {
      steer.divideScalar(count);
    }

    if (steer.length() > 0) {
      steer.normalize().multiplyScalar(flockingParams.maxSpeed).sub(this.velocity).clampLength(0, flockingParams.maxForce);
    }

    return steer;
  }

  // Alignment: steer towards average heading of neighbors
  align(boids) {
    const sum = new THREE.Vector3(0, 0, 0);
    let count = 0;

    for (const other of boids) {
      const d = this.position.distanceTo(other.position);
      if (d > 0 && d < flockingParams.neighborDist) {
        sum.add(other.velocity);
        count++;
      }
    }

    if (count > 0) {
      sum.divideScalar(count);
      sum.normalize().multiplyScalar(flockingParams.maxSpeed);
      const steer = sum.sub(this.velocity).clampLength(0, flockingParams.maxForce);
      return steer;
    }

    return new THREE.Vector3(0, 0, 0);
  }

  // Cohesion: steer towards average position of neighbors
  cohere(boids) {
    const sum = new THREE.Vector3(0, 0, 0);
    let count = 0;

    for (const other of boids) {
      const d = this.position.distanceTo(other.position);
      if (d > 0 && d < flockingParams.neighborDist) {
        sum.add(other.position);
        count++;
      }
    }

    if (count > 0) {
      sum.divideScalar(count);
      return this.seek(sum);
    }

    return new THREE.Vector3(0, 0, 0);
  }

  // Seek a target position
  seek(target) {
    const desired = new THREE.Vector3().subVectors(target, this.position);
    desired.normalize().multiplyScalar(flockingParams.maxSpeed);
    const steer = desired.sub(this.velocity).clampLength(0, flockingParams.maxForce);
    return steer;
  }

  // Apply a force to acceleration
  applyForce(force) {
    this.acceleration.add(force);
  }

    // Update position and velocity
    update(deltaTime = 0.016) {
        this.velocity.add(this.acceleration);
        this.velocity.clampLength(0, flockingParams.maxSpeed);
        this.position.add(this.velocity);
        this.acceleration.multiplyScalar(0);

    // Update shrink/grow animation
    if (this.isShrinking) {
        this.shrinkProgress += 0.08;
        if (this.shrinkProgress >= 1) {
        this.shrinkProgress = 1;
        this.isShrinking = false;
        this.isGrowing = true;
        }
    } else if (this.isGrowing) {
        this.shrinkProgress -= 0.08;
        if (this.shrinkProgress <= 0) {
        this.shrinkProgress = 0;
        this.isGrowing = false;
        }
    }

    // Apply elastic easing to scale  <-- HERE!
    const easedProgress = easeOutElastic(this.shrinkProgress);
    this.scale = 1 - easedProgress;

    // Update mesh position, rotation, and scale
    this.mesh.position.copy(this.position);
    this.mesh.scale.setScalar(this.scale); 
    // Update mesh position and rotation
    this.mesh.position.copy(this.position);
    
    // Update rotation to match velocity direction
    if (this.velocity.length() > 0.01) {
        const direction = this.velocity.clone().normalize();
        const targetPosition = this.position.clone().add(direction);
        
        // Calculate target quaternion
        const tempObject = new THREE.Object3D();
        tempObject.position.copy(this.position);
        tempObject.lookAt(targetPosition);
        this.targetQuaternion.copy(tempObject.quaternion);
        
        // Smooth rotation using slerp
        this.mesh.quaternion.slerp(this.targetQuaternion, 0.1);
    }

        if (this.mixer) {
        this.mixer.update(deltaTime);
    }

    }

  // Wrap around boundaries
  borders(radius) {
  const distFromCenter = this.position.length();
  
  if (distFromCenter > radius) {
    // Calculate how far past the boundary we went
    const overflow = distFromCenter - radius;
    
    // Flip to opposite side: negate the position vector and bring it back inside
    this.position.multiplyScalar(-1);
    this.position.normalize().multiplyScalar(radius - overflow);
    
    // Trigger shrink animation
    if (!this.isShrinking && !this.isGrowing) {
      this.isShrinking = true;
      this.shrinkProgress = 0;
    }
  }
}
}

function easeInOutElastic(x) {
  const c5 = (2 * Math.PI) / 4.5;
  return x === 0
    ? 0
    : x === 1
    ? 1
    : x < 0.5
    ? -(Math.pow(2, 20 * x - 10) * Math.sin((20 * x - 11.125) * c5)) / 2
    : (Math.pow(2, -20 * x + 10) * Math.sin((20 * x - 11.125) * c5)) / 2 + 1;
}

function easeOutElastic(x) {
const c4 = (2 * Math.PI) / 3;

return x === 0
  ? 0
  : x === 1
  ? 1
  : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
}
class Portal {
  constructor(scene) {
    // Create a circular glowing plane
    const geometry = new THREE.CircleGeometry(1, 32);
    const material = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
      emissive: 0x00ffff,
      emissiveIntensity: 2
    });
    
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.visible = false;
    scene.add(this.mesh);
    
    this.active = false;
    this.targetScale = 0;
    this.currentScale = 0;
    this.lastActiveFrame = 0;
    this.persistenceFrames = 10; // Frames to persist after boid leaves
  }
  
  activate(position, normal, color, size = 2) {
    this.active = true;
    this.mesh.visible = true;
    this.mesh.position.copy(position);
    this.targetScale = size;
    this.lastActiveFrame = 0;
    
    // Set portal color to match boid
    this.mesh.material.color.copy(color);
    this.mesh.material.emissive.copy(color);
    
    // Orient portal perpendicular to boundary
    this.mesh.lookAt(position.clone().add(normal));
  }
  
  update(frameCount) {
    if (this.active) {
      this.lastActiveFrame = frameCount;
    }
    
    // Check if portal should start fading
    const framesSinceActive = frameCount - this.lastActiveFrame;
    if (framesSinceActive > this.persistenceFrames) {
      this.targetScale = 0;
    }
    
    // Smooth scale transition
    const lerpSpeed = 0.15;
    this.currentScale += (this.targetScale - this.currentScale) * lerpSpeed;
    
    // Update mesh scale
    this.mesh.scale.set(this.currentScale, this.currentScale, 1);
    
    // Hide portal when fully scaled down
    if (this.currentScale < 0.01 && this.targetScale === 0) {
      this.mesh.visible = false;
      this.active = false;
    }
  }
}

class PortalManager {
  constructor(scene, poolSize = 30) {
    this.scene = scene;
    this.portals = [];
    this.frameCount = 0;
    this.activationThreshold = 3; // Distance from boundary to activate portal
    
    // Create portal pool
    for (let i = 0; i < poolSize; i++) {
      this.portals.push(new Portal(scene));
    }
  }
  
  update(boids, boundsWidth, boundsHeight, boundsDepth) {
    this.frameCount++;
    
    // Reset active flags
    this.portals.forEach(portal => portal.active = false);
    
    // Check each boid for boundary proximity
    const hw = boundsWidth / 2;
    const hh = boundsHeight / 2;
    const hd = boundsDepth / 2;
    
    boids.forEach(boid => {
      const pos = boid.position;
      
      // Check each boundary face
      const boundaries = [
        { dist: hw - Math.abs(pos.x), axis: 'x', normal: new THREE.Vector3(Math.sign(pos.x), 0, 0), pos: new THREE.Vector3(Math.sign(pos.x) * hw, pos.y, pos.z) },
        { dist: hh - Math.abs(pos.y), axis: 'y', normal: new THREE.Vector3(0, Math.sign(pos.y), 0), pos: new THREE.Vector3(pos.x, Math.sign(pos.y) * hh, pos.z) },
        { dist: hd - Math.abs(pos.z), axis: 'z', normal: new THREE.Vector3(0, 0, Math.sign(pos.z)), pos: new THREE.Vector3(pos.x, pos.y, Math.sign(pos.z) * hd) }
      ];
      
      boundaries.forEach(boundary => {
        if (boundary.dist < this.activationThreshold) {
          // Find available portal
          const portal = this.portals.find(p => !p.active);
          if (portal) {
            // Get boid's color from its mesh material
            const boidColor = boid.mesh.material.color;
            portal.activate(boundary.pos, boundary.normal, boidColor, 2);
          }
        }
      });
    });
    
    // Update all portals
    this.portals.forEach(portal => portal.update(this.frameCount));
  }
}

// Usage in script.js:
// const portalManager = new PortalManager(scene, 30);
// 
// // In animate loop:
// portalManager.update(boids, sceneCubeSize, sceneCubeSize, sceneCubeSize);
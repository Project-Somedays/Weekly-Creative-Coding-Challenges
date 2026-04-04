class ArmSegment {
  constructor(length, radius, color = 0x3498db, texture = null) {
    this.length = length;
    this.radius = radius;
    
    // Create the segment geometry and material
    const geometry = new THREE.CylinderGeometry(radius, radius, length, 16);
    const materialOptions = texture ? { map: texture } : { color };
    const material = new THREE.MeshPhongMaterial(materialOptions);
    
    // Main mesh for the segment
    this.mesh = new THREE.Mesh(geometry, material);
    
    // Position the cylinder so rotation happens at the base
    this.mesh.position.y = length / 2;
    
    // Container for this segment (pivot point)
    this.pivot = new THREE.Object3D();
    this.pivot.add(this.mesh);
    
    // Joint sphere at the top
    const jointGeometry = new THREE.SphereGeometry(radius * 1.2, 16, 16);
    const jointMaterial = new THREE.MeshPhongMaterial({ color: 0x2c3e50 });
    this.joint = new THREE.Mesh(jointGeometry, jointMaterial);
    this.joint.position.y = length;
    this.pivot.add(this.joint);
  }
  
  rotateX(angle) {
    this.pivot.rotation.x = angle;
  }
  
  rotateY(angle) {
    this.pivot.rotation.y = angle;
  }
  
  rotateZ(angle) {
    this.pivot.rotation.z = angle;
  }
  
  getEndPosition() {
    const endPoint = new THREE.Vector3(0, this.length, 0);
    this.pivot.localToWorld(endPoint);
    return endPoint;
  }
}

class RoboticArm {
  constructor(segmentConfigs, texture = null) {
    // segmentConfigs: array of {length, radius, color}
    // texture: optional THREE.Texture to apply to all segments
    this.segments = [];
    this.root = new THREE.Object3D();
    this.texture = texture;
    
    let parent = this.root;
    
    segmentConfigs.forEach((config, index) => {
      const segment = new ArmSegment(
        config.length || 2,
        config.radius || 0.2,
        config.color,
        this.texture
      );
      
      // Attach segment to parent
      parent.add(segment.pivot);
      
      // Next segment attaches at the end of this one
      if (index < segmentConfigs.length - 1) {
        parent = segment.joint;
      }
      
      this.segments.push(segment);
    });
  }
  
  addToScene(scene) {
    scene.add(this.root);
  }
  
  setBasePosition(x, y, z) {
    this.root.position.set(x, y, z);
  }
  
  setBaseRotation(x, y, z) {
    this.root.rotation.set(x, y, z);
  }
  
  rotateSegment(index, axis, angle) {
    if (index >= 0 && index < this.segments.length) {
      const segment = this.segments[index];
      switch(axis.toLowerCase()) {
        case 'x':
          segment.rotateX(angle);
          break;
        case 'y':
          segment.rotateY(angle);
          break;
        case 'z':
          segment.rotateZ(angle);
          break;
      }
    }
  }
  
  getEndEffectorPosition() {
    if (this.segments.length > 0) {
      return this.segments[this.segments.length - 1].getEndPosition();
    }
    return new THREE.Vector3();
  }
  
  reset() {
    this.segments.forEach(segment => {
      segment.rotateX(0);
      segment.rotateY(0);
      segment.rotateZ(0);
    });
  }
}
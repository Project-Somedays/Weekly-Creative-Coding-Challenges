class Eye{
    constructor(p, scl, group){
        this.p = p.clone().multiplyScalar(0.975*params.r);
        this.mesh = eye.clone();
        this.mesh.position.copy(this.p);
        this.mesh.scale.setScalar(scl);
        let focusPoint = this.p.clone().multiplyScalar(2);
        this.mesh.lookAt(focusPoint);
        group.add(this.mesh);
        this.simplexOffset = Math.random()*10000;
        // Store the initial rotation
        this.initialQuaternion = this.mesh.children[0].quaternion.clone();
        this.maxAngle = Math.PI / 4; // 45 degrees
    }

    updateEye(t){
        const noiseX = simplex.noise4D(this.p.x, this.p.y, this.p.z, this.simplexOffset + t);
        const noiseY = simplex.noise4D(this.p.x + 100, this.p.y + 100, this.p.z + 100, this.simplexOffset + t);
        
        // Map noise from [-1, 1] to [-maxAngle, maxAngle]
        const rotX = easeInOutQuint(noiseX) * this.maxAngle;
        const rotY = easeInOutQuint(noiseY) * this.maxAngle;
        
        // Reset to initial rotation
        this.mesh.children[0].quaternion.copy(this.initialQuaternion);
        
        // Apply rotations relative to the eye's local axes
        this.mesh.children[0].rotateX(rotX);
        this.mesh.children[0].rotateY(rotY);

    }

    updateEyelid(t){
        let eyeNoise = 0.5*(1 + simplex.noise4D(this.p.x, this.p.y, this.p.z, this.simplexOffset + t))
        let easedNoise = easeInOutCubic(eyeNoise)
        this.mesh.children[1].rotation.x = Math.PI/2 * easedNoise;
        this.mesh.children[2].rotation.x = -Math.PI/2 * easedNoise;
    }

    

}


class Sphere {
    constructor(x, z, radius, color) {
        // Three.js sphere
        const geometry = new THREE.SphereGeometry(radius, 32, 32);
        const material = new THREE.MeshPhongMaterial({ color });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(x, 0, z);
        this.radius = radius;
        this.color = color;
        scene.add(this.mesh);
        this.a = new THREE.Vector3(0,0,0);
        this.v = new THREE.Vector3(0,0,0);
    }

    update() {
        this.v.add(this.a);
        this.a.multiplyScalar(0);
        this.mesh.position.add(this.v);
    }
}

function handleCollisions() {
    for(let i = 0; i < spheres.length; i++){
        for(let j = i; j < spheres.length; j++){
            if(i === j) continue; // skipt self checks
            let largerSphere = spheres[i].radius > sphere[j].radius ? spheres[i] : spheres[j];
            let smallerSphere = spheres[i].radius < sphere[j].radius ? spheres[i] : spheres[j];
            // if touching, siphon radius from the smaller
            if(largerSphere.mesh.position.distanceTo(smallerSphere.mesh.position) > largerSphere.radius + smallerSphere.radius) continue

            largerSphere.radius += smallerSphere.radius * 0.1;
            smallerSphere.radius -= smallerSphere.radius * 0.1;
        }
    }
    // for (let i = spheres.length - 1; i >= 0; i--) {
    //     for (let j = i - 1; j >= 0; j--) {
    //         const sphereA = spheres[i];
    //         const sphereB = spheres[j];

        
    //             if (sphereA.radius > sphereB.radius) {
    //                 // Grow larger sphere
    //                 const newRadius = Math.pow(Math.pow(sphereA.radius, 3) + Math.pow(sphereB.radius, 3), 1/3);
                    
    //                 // Remove smaller sphere
    //                 Matter.World.remove(world, sphereB.body);
    //                 scene.remove(sphereB.mesh);
    //                 spheres.splice(j, 1);
    //                 sphereBodies.splice(j, 1);

    //                 // Update larger sphere
    //                 scene.remove(sphereA.mesh);
    //                 const newSphere = createSphere(sphereA.body.position.x, sphereA.body.position.y, newRadius);
    //                 spheres[i] = newSphere;
    //                 sphereBodies[i] = newSphere.body;

    //                 // Check for mitosis
    //                 if (newRadius > 2) {
    //                     splitSphere(newSphere);
    //                 }
    //             }
    //         }
    //     }
    
}

// // Function to split large spheres
// function splitSphere(sphere) {
//     const pos = sphere.body.position;
//     const newRadius = sphere.radius / Math.sqrt(2);
    
//     // Remove original sphere
//     Matter.World.remove(world, sphere.body);
//     scene.remove(sphere.mesh);
//     spheres.splice(spheres.indexOf(sphere), 1);
//     sphereBodies.splice(sphereBodies.indexOf(sphere.body), 1);

//     // Create two new spheres
//     createSphere(pos.x - newRadius, pos.y, newRadius);
//     createSphere(pos.x + newRadius, pos.y, newRadius);
// }


// Add controlled chase behavior
function updateSphereMovement() {
    for(let i = 0; i < spheres.length; i++){
        let sphereA = spheres[i];
        let nearestSmaller = null;
        let minDistSmaller = Infinity;

        for(let j = i; j < spheres.length; j++){
            if(i === j) continue; // ignore self-checks
            
            let sphereB = spheres[j];

            let d = sphereA.mesh.position.distanceTo(sphereB.position.mesh);
            if(sphereA.radius > sphereB.radius && d < minDistSmaller){
                nearestSmaller = sphereB;
                minDistSmaller = d;
            };

        }
        let dir = new THREE.Vector3().subVectors(nearestSmaller.mesh.position, sphereA.mesh.position).normalize();
        sphereA.a.add(dir.multiplyScalar(params.maxForce));
    }
    // spheres.forEach(sphere => {
    //     // Find nearest smaller sphere
    //     let nearestSmaller = null;
    //     let minDist = Infinity;
        
    //     spheres.forEach(other => {
    //         if (other !== sphere && other.radius < sphere.radius) {
    //             const dx = other.body.position.x - sphere.body.position.x;
    //             const dz = other.body.position.y - sphere.body.position.y;
    //             const dist = Math.sqrt(dx * dx + dz * dz);
                
    //             if (dist < minDist) {
    //                 minDist = dist;
    //                 nearestSmaller = other;
    //             }
    //         }
    //     });

    //     // Chase nearest smaller sphere with controlled force
    //     if (nearestSmaller) {
    //         const dx = nearestSmaller.body.position.x - sphere.body.position.x;
    //         const dz = nearestSmaller.body.position.y - sphere.body.position.y;
    //         const angle = Math.atan2(dz, dx);
            
    //         // Reduce force magnitude and scale with radius
    //         const force = 0.00005 * sphere.radius;
    //         Matter.Body.applyForce(sphere.body, sphere.body.position, {
    //             x: Math.cos(angle) * force,
    //             y: Math.sin(angle) * force
    //         });
    //     }
    // });
}

// Function to create new sphere
function createSphere(x, z, radius) {
    const sphere = new Sphere(x, z, radius, random(palette));
    spheres.push(sphere);
    sphereBodies.push(sphere.body);
    return sphere;
}
class Leaf{
    constructor(texture, vertices, normals){
        // Pick a random vertex from the tree
        const vertexIndex = Math.floor(Math.random() * vertices.length);
        const baseVertex = vertices[vertexIndex].clone();
        const normal = normals[vertexIndex].clone();
        
        // Calculate distance from origin (trunk center) for weighting
        const distFromCenter = new THREE.Vector2(baseVertex.x, baseVertex.z).length();
        
        // Weight: prefer outer vertices (further from trunk center)
        // This prevents leaves clustering on the trunk
        const maxDist = treeRadius * 0.8; // estimate
        const weight = Math.pow(Math.min(distFromCenter / maxDist, 1), 1.5);
        
        // Skip vertices below y = 0 (lower trunk has no branches)
        if (baseVertex.y < 0) {
            // Recursively try again with a different vertex
            return new Leaf(texture, vertices, normals);
        }
        
        // Re-roll if this vertex is too close to trunk (weighted rejection)
        if (Math.random() > weight * (0.3 + clumping * 0.7)) {
            // Recursively try again with a different vertex
            return new Leaf(texture, vertices, normals);
        }
        
        // Offset along the normal (push leaf away from surface)
        const offsetDistance = leafTools.leafSpread + Math.random() * 4; // vary the distance
        this.p = baseVertex.addScaledVector(normal, offsetDistance);
        
        // Random leaf size variation
        const size = leafTools.leafSize + Math.random()*leafTools.leafMaxDiff;
        
        
        this.mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(size, size),
            new THREE.MeshStandardMaterial({
                map: texture,
                transparent: true,
                alphaTest: 0.1,
                side: THREE.DoubleSide // So leaf is visible from both sides
            })
        );
        
        this.mesh.position.copy(this.p);
        
        // Random rotation for variety
        this.mesh.rotation.z = Math.random() * Math.PI * 2;
        this.mesh.rotation.x = Math.random() * Math.PI * 2;
        this.mesh.rotation.y = Math.random() * Math.PI * 2;
    }

    billboard(camera){
        // Make the leaf face the camera
        this.mesh.quaternion.copy(camera.quaternion);
    }
}

function easeOutCirc(x){
    return Math.sqrt(1 - Math.pow(x - 1, 2));
}

// Call this function after creating the texture
function populateTreeWithLeaves(texture) {
    // Clear existing leaves
    leaves.forEach(leaf => treeGroup.remove(leaf.mesh));
    leaves = [];
    
    if (!treeModel) {
        console.warn("Tree model not loaded yet!");
        return;
    }
    
    // Extract vertices and normals from tree geometry
    const vertices = [];
    const normals = [];
    
    treeModel.traverse((child) => {
        if (child.isMesh && child.geometry) {
            const geo = child.geometry;
            const posAttr = geo.attributes.position;
            const normAttr = geo.attributes.normal;
            
            if (posAttr && normAttr) {
                // Get the matrix relative to treeModel (not world space)
                const localMatrix = child.matrix;
                
                for (let i = 0; i < posAttr.count; i++) {
                    // Get vertex position in mesh's local space
                    const vertex = new THREE.Vector3(
                        posAttr.getX(i),
                        posAttr.getY(i),
                        posAttr.getZ(i)
                    );
                    
                    // Transform to treeModel's local space (not world)
                    vertex.applyMatrix4(localMatrix);
                    
                    // Get normal in mesh's local space
                    const normal = new THREE.Vector3(
                        normAttr.getX(i),
                        normAttr.getY(i),
                        normAttr.getZ(i)
                    );
                    
                    // Transform normal to treeModel's local space
                    const normalMatrix = new THREE.Matrix3().getNormalMatrix(localMatrix);
                    normal.applyMatrix3(normalMatrix).normalize();
                    
                    vertices.push(vertex);
                    normals.push(normal);
                }
            }
        }
    });
    
    if (vertices.length === 0) {
        console.warn("No vertices found in tree model!");
        return;
    }
    
    console.log(`Found ${vertices.length} vertices in tree model`);
    
    // Create new leaves with the texture
    for (let i = 0; i < leafTools.leafCount; i++) {
        const leaf = new Leaf(texture, vertices, normals);
        leaves.push(leaf);
        treeGroup.add(leaf.mesh);
    }
    
    console.log(`Created ${leaves.length} leaves!`);
}


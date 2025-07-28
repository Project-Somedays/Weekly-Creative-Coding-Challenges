function generateVinePath(length, segments) {
    const points = [];
    for (let i = 0; i < length; i++) {
      points.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 100, // Random X
          (Math.random() - 0.5) * 100, // Random Y
          -i * 10, // Increasing Y for tunnel length
        )
      );
    }
  
    const curve = new THREE.CatmullRomCurve3(points);
    const sampledPoints = curve.getPoints(segments);
    return sampledPoints;
  }

  function createVineSegment(path, index, totalSegments) {
    const prevPoint = path[index - 1] || path[0];
    const currentPoint = path[index];
    const nextPoint = path[index + 1] || path[totalSegments - 1];
  
    const radius = 0.5 + Math.random() * 0.5; // Varying radius
    const tubeGeometry = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([prevPoint, currentPoint, nextPoint]),
      3, // Tube segments
      radius,
      8, // Radial segments
      false // Closed
    );
  
    const toonMaterial = new THREE.MeshToonMaterial({
      color: 0x448844, // Green color
      gradientMap: createGradientMap(), // optional gradient map for better toon shading
    });
  
    const vineSegment = new THREE.Mesh(tubeGeometry, toonMaterial);
    return vineSegment;
  }

  function createGradientMap() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 1;
    const context = canvas.getContext('2d');
  
    const gradient = context.createLinearGradient(0, 0, 256, 0);
    gradient.addColorStop(0, 'white');
    gradient.addColorStop(0.5, 'gray');
    gradient.addColorStop(1, 'black');
  
    context.fillStyle = gradient;
    context.fillRect(0, 0, 256, 1);
  
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  }

  function createThorn(vineSegment) {
    const thornGeometry = new THREE.ConeGeometry(0.2, 1, 8);
    const thornMaterial = vineSegment.material; // Re-use vine material
  
    const thorn = new THREE.Mesh(thornGeometry, thornMaterial);
  
    // Random position and orientation on vine segment
    const position = new THREE.Vector3();
    const normal = new THREE.Vector3();
    const tangent = new THREE.Vector3();

    // Access the curve directly from the TubeGeometry
    const curve = vineSegment.geometry.parameters.path;
  
    curve.geometry.parameters.path.getPointAt(Math.random(), position);
    curve.geometry.parameters.path.getTangentAt(Math.random(), tangent);
    curve.geometry.parameters.path.getNormalAt(Math.random(), normal);
  
    thorn.position.copy(position);
    thorn.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal.clone().add(tangent.clone().multiplyScalar(Math.random() - 0.5)).normalize());
  
    thorn.scale.setScalar(0.5 + Math.random() * 0.5); // Random scale
  
    return thorn;
  }
  
function createAndUpdateScanLines(terrain, numLines, botPositionRef) {
  const scanLines = [];
  const lineMaterial = new THREE.LineBasicMaterial({ 
    color: 0x00ffff,
    transparent: true,
    opacity: 0.6,
    linewidth: 2
  });
  
  // Create raycaster
  const raycaster = new THREE.Raycaster();
  const downDirectionWorld = new THREE.Vector3(0, -1, 0); // Point down in Y
  
  // Create lines
  for (let i = 0; i < numLines; i++) {
    const points = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 0)
    ];
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, lineMaterial);
    
    // Divide the plane into segments along X axis (in world space)
    const segmentWidth = planeHeight / numLines;
    const segmentCenter = -planeHeight/2 + segmentWidth * (i + 0.5);
    
    scanLines.push({ 
      line, 
      geometry, 
      segmentIndex: i,
      segmentCenter,  // Center X of this segment
      segmentWidth,
      noiseOffset: i * 100
    });
    scene.add(line);
  }
  
  // Update function
  function updateLines(elapsedTime) {
    const botPos = scanBot ? scanBot.position.clone() : new THREE.Vector3(0, 7.5, 4.5);
    
    scanLines.forEach(({ geometry, segmentCenter, segmentWidth, noiseOffset }) => {
      const noiseValue = simplexNoise.noise2D(
        elapsedTime * scanParams.sweepSpeed,
        noiseOffset
      );
      
      // Sweep within this X segment (world space)
      const xPos = segmentCenter + noiseValue * segmentWidth * scanParams.sweepAmount;
      
      // Keep Z same as bot (all lines at bot's Z position)
      const zPos = botPos.z;
      
      // Raycast from high above down to the plane
      const rayStart = new THREE.Vector3(xPos, 20, zPos);
      raycaster.set(rayStart, downDirectionWorld);
      const intersects = raycaster.intersectObject(terrain);
      
      if (intersects.length > 0) {
        const hitPoint = intersects[0].point;
        
        const positions = geometry.attributes.position.array;
        positions[0] = botPos.x;
        positions[1] = botPos.y;
        positions[2] = botPos.z;
        positions[3] = hitPoint.x;
        positions[4] = hitPoint.y;
        positions[5] = hitPoint.z;
        
        geometry.attributes.position.needsUpdate = true;
      }
    });
  }
  
  return { scanLines, updateLines };
}
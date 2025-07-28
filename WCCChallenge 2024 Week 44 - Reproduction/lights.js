function setupThreePointLighting(scene, intensity = 1) {
    // Key Light - Main illumination (bright, warm)
    const keyLight = new THREE.DirectionalLight(0xFFFFCC, intensity * 1.0);
    keyLight.position.set(5, 5, 5);
    keyLight.castShadow = true;
    // Adjust shadow properties for the key light
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.1;
    keyLight.shadow.camera.far = 50;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);
  
    // Fill Light - Softer, indirect light (dimmer, cooler)
    const fillLight = new THREE.DirectionalLight(0xCCFFFF, intensity * 0.5);
    fillLight.position.set(-5, 0, 2);
    fillLight.castShadow = false; // Usually fill lights don't cast shadows
    scene.add(fillLight);
  
    // Back Light - Rim lighting (medium intensity, neutral)
    const backLight = new THREE.DirectionalLight(0xFFFFFF, intensity * 0.7);
    backLight.position.set(0, -3, -5);
    backLight.castShadow = false;
    scene.add(backLight);
  
    // Optional: Add ambient light for overall soft illumination
    const ambientLight = new THREE.AmbientLight(0x404040, intensity * 0.2);
    scene.add(ambientLight);
  
    // Return the lights in case you need to adjust them later
    return {
        keyLight,
        fillLight,
        backLight,
        ambientLight
    };
  }
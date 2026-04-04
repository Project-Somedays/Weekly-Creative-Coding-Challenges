function applySimplexHeightMap(geometry, simplex, options = {}) {
  const {
    scale = options.scale,        // Noise sampling scale (smaller = larger features)
    amplitude = options.amplitude,      // Height of deformation
    timeOffset = options.timeOffset,     // For animation - shift noise in 3D space
    octaves = options.octaves,        // Number of noise layers (for fractal noise)
    persistence = options.persistence,  // Amplitude multiplier per octave
    lacunarity = options.lacunarity      // Frequency multiplier per octave
  } = options;

  const positions = geometry.attributes.position;
  
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    
    let noiseValue = 0;
    let amp = amplitude;
    let freq = scale;
    
    // Fractal noise with multiple octaves (optional, octaves=1 for simple noise)
    for (let o = 0; o < octaves; o++) {
      noiseValue += simplex.noise2D(
        x * freq,
        (y - timeOffset)* freq
      ) * amp;
      
      amp *= persistence;
      freq *= lacunarity;
    }
    
    // Apply to Z coordinate
    positions.setZ(i, noiseValue);
  }
  
  positions.needsUpdate = true;
  geometry.computeVertexNormals(); // Important for proper lighting!
}
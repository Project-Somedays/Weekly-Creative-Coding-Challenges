const topoMaterial = new THREE.ShaderMaterial({
  uniforms: {
    numLevels: { value: 10.0 },
    minHeight: { value: -2.0 },
    maxHeight: { value: 2.0 },
    lineThickness: { value: 0.05 },
    baseColor: { value: new THREE.Color(0.1, 0.15, 0.2) },
    lineColor: { value: new THREE.Color(1.0, 1.0, 1.0) },
    terrainData: { value: null },
    doubleSide: true
  },
  vertexShader: `
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
  uniform float numLevels;
  uniform float minHeight;
  uniform float maxHeight;
  uniform float lineThickness;
  uniform vec3 baseColor;
  uniform vec3 lineColor;
  uniform sampler2D terrainData;
  
  varying vec2 vUv;
  
  void main() {
    // The topoplane is rotated 90° around Y, so we need to account for that
    // Since it's showing the XZ plane rotated to face -X direction,
    // we want U to map to Z and V to map to X
    vec2 rotatedUV = vec2(vUv.y, vUv.x);
    
    float height = texture2D(terrainData, rotatedUV).r;
    
    float normalizedHeight = (height - minHeight) / (maxHeight - minHeight);
    float level = normalizedHeight * numLevels;
    float distToLevel = abs(fract(level) - 0.5) * 2.0;
    float contour = smoothstep(1.0 - lineThickness * 10.0, 1.0, distToLevel);
    
    vec3 finalColor = mix(baseColor, lineColor, contour);
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`
});
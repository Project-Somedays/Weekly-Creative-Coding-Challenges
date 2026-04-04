const scanLineMaterial = new THREE.ShaderMaterial({
  uniforms: {
    scanX: { value: 0.9 },           // X position of scan line
    lineWidth: { value: 0.1 },       // Width of the glow
    glowColor: { value: new THREE.Color(1, 1, 1) }, // White glow
    glowIntensity: { value: 2.0 }    // Brightness multiplier
  },
  vertexShader: `
    varying vec3 vPosition;
    varying vec3 vNormal;
    
    void main() {
      vPosition = position;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
  uniform float scanX;
  uniform float lineWidth;
  uniform vec3 glowColor;
  uniform float glowIntensity;
  
  varying vec3 vPosition;
  varying vec3 vNormal;
  
  void main() {
    // Distance from current fragment to scan line (now using Y)
    float dist = abs(vPosition.y - scanX);  // CHANGED: y instead of x
    
    // Create smooth falloff for glow
    float glow = smoothstep(lineWidth, 0.0, dist);
    glow = pow(glow, 2.0);
    
    // Base color
    vec3 baseColor = vec3(0.2, 0.3, 0.4);
    
    // Simple lighting
    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
    float diffuse = max(dot(vNormal, lightDir), 0.0) * 0.5 + 0.5;
    
    // Combine base color with glow
    vec3 finalColor = baseColor * diffuse + glowColor * glow * glowIntensity;
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`
});
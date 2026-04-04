// function geoStationary(r, t, offset){
//     // locked to earth's rotation
//     return new THREE.Vector3(r * Math.cos(t + offset), 0, r*Math.sin(t + offset));
// }

// function 

// function initGeostationaryOrbit(aOffset, model, group){
//     let r = 15;
//     let e = 0;
//     let tilt = 0;
//     let orbit = new Orbit(r, aOffset, e, tilt, geoStationary, model);
//     group.add(orbit.model);
//     return orbit;
// }


// function initLowEarthOrbit(aOffset, model, group){
//     let r = 7.5 + Math.random()*5;
//     let tilt = 2*(Math.random() - 0.5) * PI/3; // somewhere between -PI/3 and PI/3
//     let eccentricity = 0.25*Math.random() // less than 0.25 eccentricity
//     let orbit = new Orbit(r, aOffset, model);

// }

// class Orbit{
//     constructor(r, aOffset,  eccentricity, tilt, updateFn, model){
//         this.r = r;
//         this.aOffset = aOffset;
//         this.e = eccentricity;
//         this.updateFn = updateFn;
//         this.tilt = tilt;
//         this.model = model;
//     }

//     update(t){
//         let p = this.updateFn(this.r, t, this.aOffset);
//         this.model.position.copy(p);
//         this.model.lookAt(new THREE.Vector3(0,0,0)); // always face back towards earth
//     }
// }
const periodFromR = (r, k) =>  k * Math.pow(r, 1.5);

function initGeostationaryOrbit(model, aOffset){
    return {
        model: model,
        type: "Geostationary Orbit",
        orbitalParams: {
            semiMajorAxis: 15,
            eccentricity: 0,
            inclination: 0,
            longitudeOfAscendingNode: aOffset,
            argumentOfPeriapsis: 0,
            period: 1 // as a multiple of a day
        }
    }
}

function initLowEarthOrbit(model, aOffset, k){
    let r = 6 + Math.random()*5;
    return {
        model: model,
        type: "Low Earth Orbit",
        orbitalParams: {
        semiMajorAxis: r,
        eccentricity: 0.25*Math.random(), // somewhere under 0.25
        inclination: 2*(Math.random()-0.5) * Math.PI/6, // somewhere between +- PI/3
        longitudeOfAscendingNode: aOffset,
        argumentOfPeriapsis: 0,
        period: periodFromR(r, k)
    }
    }
}

function initPolarOrbit(model, aOffset, k){
    let r = 6 + Math.random()*2;
    return {
        model: model,
        type: "Polar Orbit",
        orbitalParams: {
        semiMajorAxis: r,
        eccentricity: 0.1*Math.random(), // somewhere under 0.25
        inclination: Math.PI/2 + 2*(Math.random()-0.5) * Math.PI/24, // somewhere between +- PI/3
        longitudeOfAscendingNode: aOffset,
        argumentOfPeriapsis: 0,
        period: periodFromR(r, k)
    }
}
}

function initSunSynchronousOrbit(model, aOffset, k){
    // Sun-sync orbits are typically 600-800km altitude
    // In your scale, that's roughly 6.1-6.3 (Earth radius = 5)
    let r = 6.1 + Math.random() * 0.2;
    
    // Sun-synchronous orbits require retrograde, near-polar inclination
    // Typically around 98 degrees (just past polar)
    // The exact inclination depends on altitude, but ~98° is standard
    let inclination = (98 + Math.random() * 2) * Math.PI / 180; // 98-100 degrees
    
    return {
        model: model,
        type: "Sun Synchronous Orbit",
        orbitalParams: {
            semiMajorAxis: r,
            eccentricity: 0.001, // Nearly circular
            inclination: inclination, // Retrograde, near-polar
            longitudeOfAscendingNode: aOffset,
            argumentOfPeriapsis: 0,
            period: periodFromR(r, k)
        }
    }
}

function initMediumEarthOrbit(model, aOffset, k){
    // MEO is typically 2,000-35,000 km altitude
    // GPS satellites are at ~20,200 km (roughly 4x Earth radius in your scale)
    // Let's use 10-13 range for variety (between LEO at ~6-11 and GEO at 15)
    let r = 10 + Math.random() * 3;
    
    // GPS uses 55° inclination for good global coverage
    // Let's vary between 50-65 degrees
    let inclination = (50 + Math.random() * 15) * Math.PI / 180;
    
    return {
        model: model,
        type: "Medium Earth Orbit",
        orbitalParams: {
            semiMajorAxis: r,
            eccentricity: 0.01 + Math.random() * 0.02, // Nearly circular, slight variation
            inclination: inclination,
            longitudeOfAscendingNode: aOffset,
            argumentOfPeriapsis: Math.random() * 2 * Math.PI, // Random orientation
            period: periodFromR(r, k)
        }
    }
}

function initHighlyEccentricOrbit(model, aOffset, k){
    // HEO typically has semi-major axis of 15,000-40,000 km
    // This puts apogee very far out
    let r = 12 + Math.random() * 8; // 12-20 range
    
    // High eccentricity is the defining feature
    let eccentricity = 0.6 + Math.random() * 0.25; // 0.6-0.85
    
    // Often highly inclined (Molniya uses 63.4° to minimize precession)
    // or near-polar for global coverage
    let inclination = (55 + Math.random() * 35) * Math.PI / 180; // 55-90 degrees
    
    // Argument of periapsis matters here - controls where the low point is
    let argumentOfPeriapsis = Math.random() * 2 * Math.PI;
    
    return {
        model: model,
        type: "Highly Eccentric Orbit",
        orbitalParams: {
            semiMajorAxis: r,
            eccentricity: eccentricity,
            inclination: inclination,
            longitudeOfAscendingNode: aOffset,
            argumentOfPeriapsis: argumentOfPeriapsis,
            period: periodFromR(r, k)
        }
    }
}
    



/**
 * Updates a satellite's position on an elliptical orbit
 * @param {THREE.Object3D} satellite - The satellite mesh/object to position
 * @param {number} time - Current time (use for animation, e.g., clock.getElapsedTime())
 * @param {Object} orbitalParams - Orbital parameters
 * @param {number} orbitalParams.semiMajorAxis - Average orbital radius
 * @param {number} orbitalParams.eccentricity - Orbit eccentricity (0 = circle, <1 = ellipse)
 * @param {number} orbitalParams.inclination - Orbital tilt in radians (0 = equator)
 * @param {number} orbitalParams.longitudeOfAscendingNode - Rotation of orbit plane in radians (optional, default 0)
 * @param {number} orbitalParams.argumentOfPeriapsis - Rotation within orbit plane in radians (optional, default 0)
 * @param {number} orbitalParams.period - Orbital period in seconds (how long one orbit takes)
 */
function updateSatellitePosition(satellite, time, orbitalParams, secondsPerDay) {
  const {
    semiMajorAxis,
    eccentricity,
    inclination,
    longitudeOfAscendingNode = 0,
    argumentOfPeriapsis = 0,
    period
  } = orbitalParams;
  
  // Mean anomaly - where satellite should be in its orbit (0 to 2π)
  // period is in multiples of a day, so multiply by secondsPerDay
  const meanAnomaly = (2 * Math.PI * time / (period * secondsPerDay)) % (2 * Math.PI);
  
  // Solve for eccentric anomaly using Newton's method (Kepler's equation)
  let eccentricAnomaly = meanAnomaly;
  for (let i = 0; i < 5; i++) {
    eccentricAnomaly = eccentricAnomaly - 
      (eccentricAnomaly - eccentricity * Math.sin(eccentricAnomaly) - meanAnomaly) /
      (1 - eccentricity * Math.cos(eccentricAnomaly));
  }
  
  // True anomaly - actual angle in the orbital plane
  const trueAnomaly = 2 * Math.atan2(
    Math.sqrt(1 + eccentricity) * Math.sin(eccentricAnomaly / 2),
    Math.sqrt(1 - eccentricity) * Math.cos(eccentricAnomaly / 2)
  );
  
  // Distance from center (varies with eccentricity)
  const radius = semiMajorAxis * (1 - eccentricity * Math.cos(eccentricAnomaly));
  
  // Position in orbital plane (2D)
  const xOrbit = radius * Math.cos(trueAnomaly);
  const yOrbit = radius * Math.sin(trueAnomaly);
  
  // Rotate by argument of periapsis (orientation within plane)
  const xPeri = xOrbit * Math.cos(argumentOfPeriapsis) - yOrbit * Math.sin(argumentOfPeriapsis);
  const yPeri = xOrbit * Math.sin(argumentOfPeriapsis) + yOrbit * Math.cos(argumentOfPeriapsis);
  
  // Apply inclination (tilt the orbit) - now tilting in XZ plane, Y is up
  const xIncl = xPeri;
  const yIncl = yPeri * Math.sin(inclination);
  const zIncl = yPeri * Math.cos(inclination);
  
  // Rotate by longitude of ascending node (rotate the whole tilted plane around Y axis)
  satellite.position.x = xIncl * Math.cos(longitudeOfAscendingNode) - zIncl * Math.sin(longitudeOfAscendingNode);
  satellite.position.y = yIncl;
  satellite.position.z = xIncl * Math.sin(longitudeOfAscendingNode) + zIncl * Math.cos(longitudeOfAscendingNode);
  
  // look At Earth
  satellite.lookAt(new THREE.Vector3(0,0,0));
}

/**
 * Creates a visual representation of an orbital path
 * @param {Object} orbitalParams - The orbital parameters
 * @param {number} secondsPerDay - Seconds per day (for scaling)
 * @param {number} numPoints - Number of points to sample along the orbit (default 100)
 * @returns {THREE.Line} A line object representing the orbit
 */
function createOrbitPath(orbitalParams, secondsPerDay, numPoints = 1000) {
  const points = [];
  
  // Sample points along the entire orbit
  for (let i = 0; i <= numPoints; i++) {
    const time = (i / numPoints) * orbitalParams.period * secondsPerDay;
    
    // Calculate position using the same math as updateSatellitePosition
    const {
      semiMajorAxis,
      eccentricity,
      inclination,
      longitudeOfAscendingNode = 0,
      argumentOfPeriapsis = 0,
      period
    } = orbitalParams;
    
    const meanAnomaly = (2 * Math.PI * time / (period * secondsPerDay)) % (2 * Math.PI);
    
    let eccentricAnomaly = meanAnomaly;
    for (let j = 0; j < 5; j++) {
      eccentricAnomaly = eccentricAnomaly - 
        (eccentricAnomaly - eccentricity * Math.sin(eccentricAnomaly) - meanAnomaly) /
        (1 - eccentricity * Math.cos(eccentricAnomaly));
    }
    
    const trueAnomaly = 2 * Math.atan2(
      Math.sqrt(1 + eccentricity) * Math.sin(eccentricAnomaly / 2),
      Math.sqrt(1 - eccentricity) * Math.cos(eccentricAnomaly / 2)
    );
    
    const radius = semiMajorAxis * (1 - eccentricity * Math.cos(eccentricAnomaly));
    
    const xOrbit = radius * Math.cos(trueAnomaly);
    const yOrbit = radius * Math.sin(trueAnomaly);
    
    const xPeri = xOrbit * Math.cos(argumentOfPeriapsis) - yOrbit * Math.sin(argumentOfPeriapsis);
    const yPeri = xOrbit * Math.sin(argumentOfPeriapsis) + yOrbit * Math.cos(argumentOfPeriapsis);
    
    const xIncl = xPeri;
    const yIncl = yPeri * Math.sin(inclination);
    const zIncl = yPeri * Math.cos(inclination);
    
    const x = xIncl * Math.cos(longitudeOfAscendingNode) - zIncl * Math.sin(longitudeOfAscendingNode);
    const y = yIncl;
    const z = xIncl * Math.sin(longitudeOfAscendingNode) + zIncl * Math.cos(longitudeOfAscendingNode);
    
    points.push(new THREE.Vector3(x, y, z));
  }
  
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  
  // For dotted line effect
  const material = new THREE.LineDashedMaterial({
    color: 0x00ff00,
    dashSize: 0.5,
    gapSize: 0.3,
    linewidth: 1
  });
  
  const line = new THREE.Line(geometry, material);
  line.computeLineDistances(); // Required for dashed lines to work
  
  return line;
}
function diniSurface(u, v, a, b, c){
    // u in [0, 4*PI], v in (0, 2]
    let x = a * Math.cos(c * u) * Math.sin(c * u);
    let y = a * Math.cos(c * v) * Math.log(Math.tan(c * v / 2.0) + b * c * u);
    let z = a * Math.sin(c * u) * Math.sin(c * v);
    return new THREE.Vector3(x,y,z);
}
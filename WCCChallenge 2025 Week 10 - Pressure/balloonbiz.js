function createBalloon(radius, heightSegments, widthSegments, neckHeight, neckRadius, scl) {
    const balloonGeometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    balloonGeometry.scale(1*scl, 1.5*scl, 1*scl); // Elongate along the Y-axis

    const balloonMaterial = new THREE.MeshStandardMaterial({
        color: 0xff0000, // Red balloon
        roughness: 0.5,
        metalness: 0
    });

    const balloon = new THREE.Mesh(balloonGeometry, balloonMaterial);

    if (neckHeight > 0) {
        const neckGeometry = new THREE.CylinderGeometry(neckRadius, neckRadius, neckHeight, widthSegments);
        const neckMaterial = balloonMaterial.clone(); // Use same material
        const neck = new THREE.Mesh(neckGeometry, neckMaterial);
        neck.position.y = -radius * 1.5 * scl - neckHeight / 2; // Position the neck below the balloon
        balloon.add(neck);
    }
    return balloon;
}
/**
 * Creates a ring of cultists at the specified radius
 * @param {number} radius - The radius of the ring
 * @param {number} count - The number of cultists in the ring
 * @param {number} yPosition - The y-position (height) of the cultists
 */
function createCultistRing(radius, count, yPosition) {
    for (let i = 0; i < count; i++) {
        gltfLoader.load('Cultist_Animated.glb', (gltf) => {
          // Calculate position around the circle
          const angle = (i / count) * Math.PI * 2;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;

          const cultist = gltf.scene;
          
          // Position the cultist
          cultist.position.set(x, yPosition, z); // Position the cloned cultist
          
          // Make the cultist face the center
          cultist.lookAt(new THREE.Vector3(0, yPosition, 0)); // Orient the cultist towards the center
          
          // Add cultist to the scene
          scene.add(cultist); // Add the new cultist instance to the scene
          cultists.push(cultist); // Keep track of the cultists

          const animMixer = new THREE.AnimationMixer(cultist);
          const animation = gltf.animations[0];
          const action = animMixer.clipAction(animation);
          action.time = gltf.animations[0].duration * i / count;
          action.play();
          mixers.push(animMixer);

        })
        
        
        
     
    }
}

/**
 * Creates multiple rings of cultists around the central chest
 */
function createCultistRings() {
    // Configuration for dense rings of cultists
    const ringConfig = [
        { radius: 4, count: 8, yPosition: 1.8 },   // Inner ring - 8 cultists
        { radius: 7, count: 16, yPosition: 1.8 },   // Middle ring - 16 cultists  
        { radius: 10, count: 24, yPosition: 1.8 }   // Outer ring - 24 cultists
    ];

    // Create each ring based on configuration
    ringConfig.forEach(ring => {
        createCultistRing(ring.radius, ring.count, ring.yPosition);
    });
}

function loadChest(){
  gltfLoader.load(
	// resource URL
	'Chest.glb',
	// called when the resource is loaded
	function ( gltf ) {
    chest = gltf.scene; // THREE.Group
    chest.position.z = -1.25;
    scene.add( chest );
	},
	// called while loading is progressing
	function ( xhr ) {
		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
	},
	// called when loading has errors
	function ( error ) {
		console.log( 'An error happened' );
	}
);
}

function loadWheelOfDeath(){
   gltfLoader.load(
	// resource URL
	'wheelofdeath.glb',
	// called when the resource is loaded
	function ( gltf ) {

    wheel = gltf.scene;
    wheel.rotation.x = Math.PI/2;
    scene.add(wheel);
  
    wheelStart = new THREE.Vector3(0,0.9, 0);
    wheelEnd = new THREE.Vector3(0, 3, 0);
	},
	// called while loading is progressing
	function ( xhr ) {
		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
	},
	// called when loading has errors
	function ( error ) {
		console.log( 'An error happened' );
	}
);
}
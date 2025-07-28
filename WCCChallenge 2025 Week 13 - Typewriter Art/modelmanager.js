class GLTFModelManager {
    constructor() {
      this.gltfModel = null;
    }
    
    /**
     * Load an OBJ model from the specified path
     * @param {string} path - Path to the OBJ file
     * @returns {Promise<THREE.Group>} - The loaded model
     */
    async loadModel(path) {
      try {
        this.gltfModel = await this._loadGLTFModel(path);
        this.recordInitialTransforms();
        return this.gltfModel;
      } catch (error) {
        console.error('Failed to load the GLTF model:', error);
        throw error;
      }
    }
    
    /**
     * Private method to load an OBJ model using OBJLoader
     * @param {string} path - Path to the OBJ file
     * @returns {Promise<THREE.Group>} - Promise resolving to the loaded model
     */
    _loadGLTFModel(path) {
      return new Promise((resolve, reject) => {
        const loader = new THREE.GLTFLoader();
        
        loader.load(
          // Resource URL
          path,
          // onLoad callback
          (gltfScene) => {
            resolve(gltfScene.scene);
          },
          // onProgress callback
          (xhr) => {
            const percentComplete = Math.round((xhr.loaded / xhr.total) * 100);
            console.log(`${percentComplete}% loaded`);
          },
          // onError callback
          (error) => {
            console.error('An error occurred loading the GLTF:', error);
            reject(error);
          }
        );
      });
    }
    
    /**
     * Record the initial position, rotation, and scale of all mesh children
     * @returns {Array} - Array of objects containing the initial transforms
     */
    recordInitialTransforms() {
      if (!this.gltfModel) {
        console.warn('No model loaded. Call loadModel first.');
        return [];
      }
      
      this.childrenInitialTransforms = [];
      this.childrenTargetTransforms = [];
      
      this.gltfModel.traverse((child) => {
    if (child.isMesh) {
        let initPosAsVector3 = new THREE.Vector3(child.position.x, child.position.y, child.position.z);
        let initRotAsVector3 = new THREE.Euler(child.rotation.x, child.rotation.y, child.rotation.z);
        let targetPosition = initPosAsVector3.clone().multiplyScalar(explodeExtent);
        let initialTransforms = {
            object: child,
            position: initPosAsVector3.clone(),
            rotation: initRotAsVector3.clone(),
            scale: child.scale.clone(),
            name: child.name || 'unnamed mesh'
            }

        const getRange = (max) => Math.random() * 10 - max;
        let targetTransforms = {
                object: child,
                position: new THREE.Vector3(
                  getRange(5.0),
                  getRange(5.0),
                  getRange(5.0)
                ),//targetPosition.clone(),
                rotation: initRotAsVector3.clone(),
                scale: child.scale.clone(),
                name: child.name || 'unnamed mesh'
                }
                // Store initial transform data
        this.childrenInitialTransforms.push(initialTransforms);
        this.childrenTargetTransforms.push(targetTransforms);
        }
    });
      
      
      console.log(`Recorded initial and target transforms for ${this.childrenInitialTransforms.length} meshes`);
    //   return this.childrenInitialTransforms;
    }
    
    /**
     * Reset all meshes to their initial transforms
     */
    resetAllMeshes() {
      if (this.childrenInitialTransforms.length === 0) {
        console.warn('No initial transforms recorded. Call loadModel first.');
        return;
      }
      
      this.childrenInitialTransforms.forEach(item => {
        item.object.position.copy(item.position);
        item.object.rotation.copy(item.rotation);
        item.object.scale.copy(item.scale);
      });
      
      console.log('All meshes reset to initial transforms');
    }
    
    /**
     * Get a specific mesh by name
     * @param {string} name - The name of the mesh to find
     * @returns {Object|null} - The found mesh transform entry or null
     */
    getMeshByName(name) {
      return this.childrenInitialTransforms.find(item => item.name === name) || null;
    }
    
    /**
     * Get all recorded mesh transforms
     * @returns {Array} - Array of all recorded mesh transforms
     */
    getAllMeshTransforms() {
      return this.childrenInitialTransforms;
    }
    
    /**
     * Get the loaded model
     * @returns {THREE.Group|null} - The loaded model or null if none loaded
     */
    getModel() {
      return this.gltfModel;
    }

    rotateIndividualParts(){
        if(this.gltfModel){
            this.gltfModel.children.forEach(child => {
                child.rotation.x = bounce(easeInOutSine(cycle(t, explodeCycleFrames)));
                child.rotation.y = bounce(easeInOutSine(cycle(t, explodeCycleFrames)));
                child.rotation.z = bounce(easeInOutSine(cycle(t, explodeCycleFrames)));
            })
        }
    }

    explode(t){
      
        if(this.gltfModel){
            this.gltfModel.children.forEach((item, index) => {
                // item.rotation.lerpVectors(this.childrenInitialTransforms[index].rotation, this.childrenTargetTransforms[index].rotation, t);
                item.position.lerpVectors(this.childrenInitialTransforms[index].position, this.childrenTargetTransforms[index].position, t)
                
            });
        }
        
    }

    // wander(){
    //     if(this.gltfModel){
    //         this.gltfModel.children.forEach(child => {
    //             child.position. += getNoiseValue(chil)
    //         })
    //     }
    // }

    debugModelStructure() {
        console.log("Model structure:");
        
        function traverse(object, level) {
          const indent = '  '.repeat(level);
          console.log(`${indent}Name: "${object.name || 'unnamed'}"` +
                      ` | Type: ${object.type}` + 
                      ` | Constructor: ${object.constructor.name}` +
                      ` | isMesh: ${!!object.isMesh}` +
                      ` | isObject3D: ${object instanceof THREE.Object3D}`);
          
          // Print full list of properties (uncomment if needed)
          console.log(object);
          
          object.children.forEach(child => {
            traverse(child, level + 1);
          });
        }
        traverse(this.gltfModel, 0);
  }

}
  
//   export default OBJModelManager;
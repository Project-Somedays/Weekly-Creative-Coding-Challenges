class Mouth{

    constructor(p, scl, group){
        this.p = p.clone().multiplyScalar(0.975*params.r);
        this.mesh = mouth.clone();
        this.mesh.position.copy(this.p);
        this.mesh.scale.setScalar(scl);
        let focusPoint = this.p.clone().multiplyScalar(2);
        this.mesh.lookAt(focusPoint);
        group.add(this.mesh);
        
        this.simplexOffsets = [];
        for(let i = 0; i < 4; i++){
            this.simplexOffsets[i] = Math.random()*10000;
        }
    }

    update(t){
        for(let i = 0; i < this.simplexOffsets.length; i++){
            let noiseVal = 0.5*(1 + simplex.noise2D(this.simplexOffsets[i], t));
            let easedVal = easeInOutQuint(noiseVal);
            if(this.mesh.children[4].morphTargetInfluences) {
                this.mesh.children[4].morphTargetInfluences[i] = easedVal;
            }   
        }
    }

    updateMorph(morphIndex, morphValue){
        this.mesh.children[4].morphTargetInfluences[morphIndex] = morphValue;
    }

}


export class Asset{
    constructor(model, x, y, z, tx, ty, tz, transitionFrames = 30){
        this.start = new THREE.Vector3(x, y, z);
        this.end = new THREE.Vector3(tx, ty, tz);
        this.model = model;
        this.model.position.set(this.start.x, this.start.y, this.start.z);
        this.dropping = false;
        this.isAtRest = true;
        this.transitionFrames = transitionFrames;
        this.triggerOffset = this.map(z, -3, 3, 0, 1);
        this.t = 0;
        this.triggerTime = 0; // Track when this asset was triggered
    }

    map(x, r1Start, r1End, r2Start, r2End){
        // Fixed mapping formula
        return ((x - r1Start) / (r1End - r1Start)) * (r2End - r2Start) + r2Start;
    }

    constrain(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    easeInOutBack(x){
        const c1 = 1.70158;
        const c2 = c1 * 1.525;

        return x < 0.5
        ? (Math.pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
        : (Math.pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
    }

    trigger(globalTriggerTime = 0){
        this.isAtRest = false;
        this.triggerTime = globalTriggerTime;
    }

    update(currentTime = 0){
        if(this.isAtRest) return;
        
        // Calculate staggered start time based on trigger offset
        const staggerDelay = this.triggerOffset * 30; // 30 frames of stagger
        const actualStartTime = this.triggerTime + staggerDelay;
        
        // Only start animating if enough time has passed
        if(currentTime < actualStartTime) return;
        
        this.t = this.dropping ? this.t + 1/this.transitionFrames : this.t - 1/this.transitionFrames;
        this.t = this.constrain(this.t, 0, 1);
        const newPos = this.start.clone().lerp(this.end, this.easeInOutBack(this.t));
        this.model.position.copy(newPos);
        if(this.t === 0 || this.t === 1) this.isAtRest = true;
    }

    remove(scene){
        scene.remove(this.model);
    }
}
class Swarm{
    constructor(startArrayOfTargets, nextArrayofTargets){
        this.swarm = new Array(maxTargets);
        for(let i = 0; i < maxTargets; i++){
            this.swarm[i] = new FireFly(random(width), random(height), yellow);
        }
        this.bufferSwarm = [...this.swarm]; // must make a copy to keep the noise offsets
        this.swarm = [...this.mapTargetsToFireflies(startArrayOfTargets, this.swarm)];
        this.bufferSwarm = this.mapTargetsToFireflies(nextArrayofTargets, this.bufferSwarm);
    }

    update(){
        for(let i = 0; i < maxTargets; i++){
            this.swarm[i].update(this.bufferSwarm[i].startTarget);
        }
    }
    
    cycle(nextArrayOfTargets){
        this.swarm = [...this.bufferSwarm]; // overwrite
        this.bufferSwarm = this.mapTargetsToFireflies(nextArrayOfTargets, this.bufferSwarm);
    }

    mapTargetsToFireflies(targetArray, swarm){
        // map fireflies to targets
        for(let i = 0; i < swarm.length; i++){
            // if surplus to requirement
            if(i >= targetArray.length){
                swarm[i].setTarget(swarm[i].target.x, swarm[i].target.y, color(255, 255, 0, 0)); // change nothing, but turn it off
                continue;
            }
            let t = targetArray[i];
            swarm[i].setTarget(t.x, t.y, t.c);
        }
        
        return swarm;
    }

    show(){
        for(let ff of this.swarm){
            ff.show();
        }
    }
}
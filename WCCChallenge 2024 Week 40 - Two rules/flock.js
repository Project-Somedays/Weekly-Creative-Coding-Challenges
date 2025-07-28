class Flock {
    constructor() {
      this.birbs = [];
    }

    applyPaletteToBirbs(){
        for(let birb of this.birbs){
            let c = getAlphaColour(random(params.chosenPalette), params.birbOpacity);
            birb.applyColour(c);
        }

    }
  
    run() {
      for (let birb of this.birbs) {
        birb.run(this.birbs);
      }
    }
  
    addBirb(b) {
      this.birbs.push(b);
    }
  }
class Floater {
  constructor(angle, offset) {
    this.p = createVector();
    this.offset = offset;
    this.angle = angle;

    this.isEmerging = true;
    this.isFinished = false;
    this.frameStart = frameCount;
    this.calculateSpiralPos();
    this.spiralRate = params.spiralRate;
    this.xOff = random(1000);
    this.yOff = random(1000);
    this.zOff = random(1000);
    this.xRotOff = random(1000);
    this.yRotOff = random(1000);
    this.zRotOff = random(1000);
    this.pert = createVector();
    this.roll = createVector();
  }

  setAngle(angle) {
    this.angle = angle;
  }

  calculateSpiralPos() {
    let r = exp(params.spiralSpread * this.angle);
    let x = r * params.spiralRadius * cos(this.angle);
    let z = r * params.spiralRadius * sin(this.angle);
    let y = cubicOrSteeperEasing(x, z, 0, 0) * params.whirlpoolDepth;
    this.p.set(x, y, z);
  }

  emerge() {
    let progress = (frameCount - this.frameStart) / params.durationEmerge;
    this.p.y += ((1.0 - easeOutElastic(progress)) * duckRanges.yRange) / 2;
    this.isEmerging = progress < 1;
  }

  update() {
    this.angle -= this.spiralRate;
    this.calculateSpiralPos();
    this.jostle();
    if (this.isEmerging) this.emerge(); // overwrite y position as it emerges
    // let normD =
    //   1 - dist(this.p.x, this.p.z, 0, 0) / dist(width / 2, width / 2, 0, 0);
    // this.spiralRate = map(normD, 0, 1, 0.01, params.spiralRate);
    this.spiralRate = map(this.angle, params.revolutions * TWO_PI, 0, params.spiralRate, 20 * params.spiralRate);
    this.isFinished = this.angle <= 0;
  }

  setPos(x, y, z) {
    this.p.set(x, y, z);
  }

  jostle() {
    this.pert.set(
      map2DNoise(this.xOff, params.pertXYZRate, -params.pertXZ, params.pertXZ),
      map2DNoise(this.yOff, params.pertXYZRate, -params.pertY, params.pertY),
      map2DNoise(this.zOff, params.pertXYZRate, -params.pertXZ, params.pertXZ)
    );
    this.roll.set(
      map2DNoise(this.xRotOff, params.pertRollRate, -params.pertRoll, params.pertRoll),
      map2DNoise(this.yRotOff, params.pertYRotRate, -params.pertYRot, params.pertYRot),
      map2DNoise(this.zRotOff, params.pertRollRate, -params.pertRoll, params.pertRoll)
    );
  }

  show() {
    push();
    rotateY(this.offset);
    translate(this.p.x, this.p.y - params.duckHeightOffset * duckRanges.yRange, this.p.z);
    if (params.jostleDucks) {
      translate(this.pert.x, this.pert.y, this.pert.z);
      rotateY(this.roll.y);
      rotateX(this.roll.x);
      rotateZ(this.roll.z);
    }
    noStroke();
    scale(params.duckScale);
    texture(duckTexture);
    model(duck);
    // box(width / 25, width / 25, width / 25);
    pop();
  }
}

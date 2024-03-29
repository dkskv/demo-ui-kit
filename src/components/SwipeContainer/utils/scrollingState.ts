import { minBy } from "ramda";
import { ScrollConstraints } from "./scrollConstraints";

export class ScrollingState {
  private readonly friction = 0.03;
  private readonly extrusion = 0.05;

  constructor(
    public coordinate: number,
    private constraints: ScrollConstraints,
    public impulse: number
  ) {
    if (!constraints.overflowBounds.includes(coordinate)) {
      this.impulse = 0;
      this.coordinate = constraints.overflowBounds.clampNumber(coordinate);
    }
  }

  private get velocity() {
    const mass = 1;
    return this.impulse / mass;
  }

  public reset() {
    return new ScrollingState(0, this.constraints, 0);
  }

  public setConstraints(a: ScrollConstraints) {
    return new ScrollingState(this.coordinate, a, this.impulse);
  }

  public setImpulse(a: number) {
    return new ScrollingState(this.coordinate, this.constraints, a);
  }

  public suppressEscapeImpulse() {
    const { overflowK } = this;

    if (overflowK === 0 || !this.isTendEscape) {
      return this;
    }

    function parabolic(k: number) {
      return Math.pow(k, 2);
    }

    return this.setImpulse(this.impulse * (1 - parabolic(overflowK)));
  }

  private get isTendEscape() {
    return (
      (this.coordinate < this.constraints.bounds.start && this.impulse < 0) ||
      (this.coordinate > this.constraints.bounds.end && this.impulse > 0)
    );
  }

  private get overflowK() {
    const { coordinate, constraints } = this;

    return coordinate < constraints.bounds.start
      ? 1 - constraints.startExtrusionZone.normalizeNumber(coordinate)
      : coordinate > constraints.bounds.end
      ? constraints.endExtrusionZone.normalizeNumber(coordinate)
      : 0;
  }

  private transmitImpulse(a: number) {
    return this.setImpulse(this.impulse + a);
  }

  public moveByImpulse() {
    return new ScrollingState(
      this.coordinate + this.velocity,
      this.constraints,
      this.impulse
    );
  }

  public doInertialMove(dt: number) {
    const environmentImpulse =
      this.calcExtrusionImpulse(dt) + this.calcBrakingImpulse(dt);

    const nextState = this.transmitImpulse(environmentImpulse).moveByImpulse();

    const isLeaveExtrusionZone =
      this.inExtrusionZone && !nextState.inExtrusionZone;

    return isLeaveExtrusionZone
      ? new ScrollingState(
          this.constraints.bounds.clampNumber(this.coordinate),
          this.constraints,
          0
        )
      : nextState;
  }

  public isActive() {
    return this.impulse !== 0 || this.inExtrusionZone;
  }

  public get inExtrusionZone() {
    return !this.constraints.bounds.includes(this.coordinate);
  }

  private calcBrakingImpulse(dt: number) {
    return minBy(
      Math.abs,
      -this.impulse,
      Math.sign(this.impulse) * -this.friction * dt
    );
  }

  private calcExtrusionImpulse(dt: number) {
    return (
      dt *
      (this.coordinate < this.constraints.bounds.start
        ? this.extrusion
        : this.coordinate > this.constraints.bounds.end
        ? -this.extrusion
        : 0)
    );
  }
}

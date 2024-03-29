import { clamp } from "ramda";

export class Point {
  static get nullish() {
    return new Point(0, 0);
  }

  constructor(public readonly x: number, public readonly y: number) {}

  map(f: (item: number) => number) {
    return new Point(f(this.x), f(this.y));
  }

  setX(value: number) {
    return new Point(value, this.y);
  }

  setY(value: number) {
    return new Point(this.x, value);
  }

  shiftX(offset: number) {
    return this.setX(this.x + offset);
  }

  shiftY(offset: number) {
    return this.setY(this.y + offset);
  }

  add(p: Point) {
    return new Point(this.x + p.x, this.y + p.y);
  }

  subtract(p: Point) {
    return new Point(this.x - p.x, this.y - p.y);
  }

  mulK(k: number) {
    return new Point(this.x * k, this.y * k);
  }

  mul(p: Point) {
    return new Point(this.x * p.x, this.y * p.y);
  }

  div(p: Point) {
    return new Point(this.x / p.x, this.y / p.y);
  }

  /** Скалярное произведение */
  dot(p: Point) {
    const { x, y } = this.mul(p);

    return x + y;
  }

  clampX(min: number, max: number) {
    return new Point(clamp(min, max, this.x), this.y);
  }

  clampY(min: number, max: number) {
    return new Point(this.x, clamp(min, max, this.y));
  }

  negate() {
    return this.mulK(-1);
  }

  reflectAroundPoint(p: Point) {
    return p.subtract(this.subtract(p));
  }

  distance(p: Point) {
    const { x: dx, y: dy } = this.subtract(p);

    return Math.sqrt(dx * dx + dy * dy);
  }
}

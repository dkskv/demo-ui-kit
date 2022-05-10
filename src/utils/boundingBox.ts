import { clamp } from "ramda";
import { NumbersRange } from "./numbersRange";
import { Point } from "./point";

export class BoundingBox {
  static createByDimensions(x0: number, y0: number, dx: number, dy: number) {
    return new BoundingBox(x0, x0 + dx, y0, y0 + dy);
  }

  static createByRanges(xRange: NumbersRange, yRange: NumbersRange) {
    return new BoundingBox(xRange.start, xRange.end, yRange.start, yRange.end);
  }

  static nullish() {
    return new BoundingBox(0, 0, 0, 0);
  }

  static infinite() {
    return new BoundingBox(-Infinity, Infinity, -Infinity, Infinity);
  }

  constructor(
    public x1: number,
    public x2: number,
    public y1: number,
    public y2: number
  ) {}

  get x0() {
    return this.x1;
  }

  get y0() {
    return this.y1;
  }

  get origin() {
    return new Point(this.x0, this.y0);
  }

  get dx() {
    return this.x2 - this.x1;
  }

  get dy() {
    return this.y2 - this.y1;
  }

  get width() {
    return Math.abs(this.dx);
  }

  get height() {
    return Math.abs(this.dy);
  }

  /** Возвращает диапазон крайних точек проекции на ось `x` */
  get xsRange() {
    return new NumbersRange(this.x1, this.x2);
  }

  /** Возвращает диапазон крайних точек проекции на ось `y` */
  get ysRange() {
    return new NumbersRange(this.y1, this.y2);
  }

  get center() {
    return new Point((this.x1 + this.x2) / 2, (this.y1 + this.y2) / 2);
  }

  setX1(value: number) {
    return new BoundingBox(value, this.x2, this.y1, this.y2);
  }

  setX2(value: number) {
    return new BoundingBox(this.x1, value, this.y1, this.y2);
  }

  setY1(value: number) {
    return new BoundingBox(this.x1, this.x2, value, this.y2);
  }

  setY2(value: number) {
    return new BoundingBox(this.x1, this.x2, this.y1, value);
  }

  clipInner(inner: BoundingBox) {
    return new BoundingBox(
      clamp(this.x1, this.x2, inner.x1),
      clamp(this.x1, this.x2, inner.x2),
      clamp(this.y1, this.y2, inner.y1),
      clamp(this.y1, this.y2, inner.y2)
    );
  }

  clampInner(inner: BoundingBox) {
    return BoundingBox.createByRanges(
      this.xsRange.clampInner(inner.xsRange),
      this.ysRange.clampInner(inner.ysRange)
    );
  }

  /** Смещает координату левого верхнего угла */
  shift(offsets: Point): BoundingBox {
    return this.moveTo(this.origin.add(offsets));
  }

  /** Устанавливает координату левого верхнего угла */
  moveTo({ x, y }: Point) {
    return BoundingBox.createByDimensions(x, y, this.dx, this.dy);
  }

  /** Перемещаем бокс в начало координат */
  resetOrigin() {
    return BoundingBox.createByDimensions(0, 0, this.dx, this.dy);
  }

  constrainDx(bounds: NumbersRange) {
    const dx = clamp(bounds.start, bounds.end, this.dx);
    return BoundingBox.createByDimensions(this.x0, this.y0, dx, this.dy);
  }

  constrainDy(bounds: NumbersRange) {
    const dy = clamp(bounds.start, bounds.end, this.dy);
    return BoundingBox.createByDimensions(this.x0, this.y0, this.dx, dy);
  }

  shiftDeltas(offsetX: number, offsetY: number) {
    return BoundingBox.createByDimensions(
      this.x0,
      this.y0,
      this.dx + offsetX,
      this.dy + offsetY
    );
  }

  /** Получить бокс в координатах относительно переданной точки */
  placeRelatively(origin: Point) {
    return this.moveTo(this.origin.subtract(origin));
  }

  /** Соотношение сторон (ширина / высота) */
  get aspectRatio() {
    return this.dx / this.dy;
  }

  /** Задать `aspectRatio` */
  setAspectRatio(ratio: number) {
    // Исходя из уравнения: ratio * dy + dy = dx + dy

    const dy = (this.dx + this.dy) / (ratio + 1);
    const dx = ratio * dy;

    return BoundingBox.createByDimensions(this.x0, this.y0, dx, dy);
  }

  /** Нормировать внутренний бокс */
  normalizeInner(inner: BoundingBox): BoundingBox {
    const { xsRange, ysRange } = this;

    return new BoundingBox(
      xsRange.normalizeNumber(inner.x1),
      xsRange.normalizeNumber(inner.x2),
      ysRange.normalizeNumber(inner.y1),
      ysRange.normalizeNumber(inner.y2),
    );
  }

  denormalizeInner(inner: BoundingBox): BoundingBox {
    const { xsRange, ysRange } = this;

    return new BoundingBox(
      xsRange.denormalizeNumber(inner.x1),
      xsRange.denormalizeNumber(inner.x2),
      ysRange.denormalizeNumber(inner.y1),
      ysRange.denormalizeNumber(inner.y2),
    );
  }

  /** Нормировать координаты точки внутри бокса */
  normalizePoint(point: Point): Point {
    return point.subtract(this.origin).div(this.deltasVector);
  }

  /** Получить координаты точки по ее нормированным координатам внутри бокса */
  denormalizePoint(point: Point): Point {
    return this.origin.add(point.mul(this.deltasVector));
  }

  private get deltasVector() {
    return new Point(this.dx, this.dy);
  }

  isEqual({ x1, x2, y1, y2 }: BoundingBox) {
    return x1 === this.x1 && x2 === this.x2 && y1 === this.y1 && y2 === this.y2;
  }

  map(f: (a: number) => number) {
    return new BoundingBox(f(this.x1), f(this.x2), f(this.y1), f(this.y2));
  }
}
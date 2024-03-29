import { CSSProperties } from "react";
import { BoundingBox, EBoxSide } from "./boundingBox";
import { NumbersRange } from "./numbersRange";
import { Point } from "./point";
import { Size } from "./size";

export const enum EOrientation {
  horizontal = "horizontal",
  vertical = "vertical",
}

/** Интерфейс для работы компонентов в разных направлениях */
export interface IDirection {
  orientation: EOrientation;
  length(size: Size): number;
  thickness(size: Size): number;
  /** Возвращает диапазоны (параллельный и перпендикулярный) из переданного бокса */
  rangesOfBox(box: BoundingBox): [NumbersRange, NumbersRange];
  /** Строит бокс из заданных диапазонов (параллельного и перпендикулярного) */
  boxFromRanges(
    parallelRange: NumbersRange,
    normalRange: NumbersRange
  ): BoundingBox;
  /** Возвращает координаты (параллельную и перпендикулярную) из переданной точки */
  coordinatesOfPoint(p: Point): [number, number];
  /** Строит точку из заданных координат (параллельной и перпендикулярной) */
  pointOfCoordinates(
    parallelCoordinate: number,
    normalCoordinate: number
  ): Point;
  /** Стороны бокса, перпендикулярные оси направления */
  sides: readonly [EBoxSide, EBoxSide];
  cssKeys: {
    length: keyof Pick<CSSProperties, "width" | "height">;
    thickness: IDirection["cssKeys"]["length"];
    coordinate: keyof Pick<CSSProperties, "left" | "top" | "right" | "bottom">;
    normalCoordinate: keyof Pick<
      CSSProperties,
      "left" | "top" | "right" | "bottom"
    >;
    gap: keyof Pick<CSSProperties, "rowGap" | "columnGap">;
  };
  cssValues: {
    direction: CSSProperties["flexDirection"];
  };
  /** Обычное направление для обычного и reversed направлений */
  regular: IDirection;
  opposite: IDirection;
  reversed: IDirection;
  isReversed: boolean;
}

export namespace Directions {
  export const horizontal: IDirection = {
    orientation: EOrientation.horizontal,
    length({ width }: Size) {
      return width;
    },
    thickness({ height }: Size) {
      return height;
    },
    rangesOfBox(box: BoundingBox) {
      return [box.xsRange, box.ysRange];
    },
    boxFromRanges(parallelRange: NumbersRange, normalRange: NumbersRange) {
      return BoundingBox.byRanges(parallelRange, normalRange);
    },
    coordinatesOfPoint({ x, y }: Point) {
      return [x, y];
    },
    pointOfCoordinates(x: number, y: number) {
      return new Point(x, y);
    },
    sides: [EBoxSide.left, EBoxSide.right],
    cssKeys: {
      length: "width",
      thickness: "height",
      coordinate: "left",
      normalCoordinate: "top",
      gap: "columnGap",
    },
    cssValues: {
      direction: "row",
    },
    get regular() {
      return Directions.horizontal;
    },
    get opposite() {
      return Directions.vertical;
    },
    get reversed() {
      return Directions.horizontalReversed;
    },
    isReversed: false,
  };

  export const vertical: IDirection = {
    orientation: EOrientation.vertical,
    length({ height }: Size) {
      return height;
    },
    thickness({ width }: Size) {
      return width;
    },
    rangesOfBox(box: BoundingBox) {
      return [box.ysRange, box.xsRange];
    },
    boxFromRanges(parallelRange: NumbersRange, normalRange: NumbersRange) {
      return BoundingBox.byRanges(normalRange, parallelRange);
    },
    coordinatesOfPoint({ x, y }: Point) {
      return [y, x];
    },
    pointOfCoordinates(y: number, x: number) {
      return new Point(x, y);
    },
    sides: [EBoxSide.top, EBoxSide.bottom],
    cssKeys: {
      length: "height",
      thickness: "width",
      coordinate: "top",
      normalCoordinate: "left",
      gap: "rowGap",
    },
    cssValues: {
      direction: "column",
    },
    get regular() {
      return Directions.vertical;
    },
    get opposite() {
      return Directions.horizontal;
    },
    get reversed() {
      return Directions.verticalReversed;
    },
    isReversed: false,
  };

  export const horizontalReversed: IDirection = {
    ...horizontal,
    cssValues: {
      ...horizontal.cssValues,
      direction: "row-reverse",
    },
    cssKeys: {
      ...horizontal.cssKeys,
      coordinate: "right",
      normalCoordinate: "bottom",
    },
    get opposite() {
      return Directions.verticalReversed;
    },
    get reversed() {
      return Directions.horizontal;
    },
    isReversed: true,
  };

  export const verticalReversed: IDirection = {
    ...vertical,
    cssValues: {
      ...vertical.cssValues,
      direction: "column-reverse",
    },
    cssKeys: {
      ...vertical.cssKeys,
      coordinate: "bottom",
      normalCoordinate: "right",
    },
    get opposite() {
      return Directions.horizontalReversed;
    },
    get reversed() {
      return Directions.vertical;
    },
    isReversed: true,
  };
}

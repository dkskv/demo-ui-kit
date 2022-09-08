import { BoundingBox } from "../boundingBox";
import { Point } from "../point";
import { NumbersRange } from "../numbersRange";
import { EBoxLength } from "../boxParams";

export type ISizeBounds = Partial<Record<EBoxLength, NumbersRange>>;

interface IBoxConstraints {
  aspectRatio: number | null;
  sizeBounds: ISizeBounds;
  outerBox: BoundingBox;
}

interface IInitialConditions {
  sourceBox: BoundingBox;
  transformOrigin: Point;
}

export function constrainResizedBox(
  resizedBox: BoundingBox,
  { sourceBox, transformOrigin }: IInitialConditions,
  { aspectRatio, sizeBounds, outerBox }: IBoxConstraints
) {
  const keepAspectRatio = aspectRatio !== null;

  // Сохранение соотношения сторон
  if (keepAspectRatio) {
    resizedBox = resizedBox.setAspectRatio(aspectRatio);
  }

  // Ограничение размера
  resizedBox = constrainSize(resizedBox, sizeBounds);

  // Поправка расположения
  resizedBox = resizedBox.placeInSameOrigin(sourceBox, transformOrigin);

  // Ограничение внешним боксом
  resizedBox = outerBox.clipInner(resizedBox);

  if (keepAspectRatio) {
    const precision = 5;

    if (
      aspectRatio.toPrecision(precision) !==
      resizedBox.aspectRatio.toPrecision(precision)
    ) {
      // Если сломалось соотношение сторон, то откатываем изменения
      // p.s. Можно вычислять предельные размеры при `aspectRatio`, но профит низкий
      return sourceBox;
    }
  }

  return resizedBox;
}

function constrainSize(box: BoundingBox, { width, height }: ISizeBounds) {
  const withoutBounds = NumbersRange.infinite();

  return box.constrainSize(width ?? withoutBounds, height ?? withoutBounds);
}
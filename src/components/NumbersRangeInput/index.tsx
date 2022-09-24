import { useCallback } from "react";
import { NumbersRange } from "../../utils/numbersRange";
import { IDirection } from "../../utils/direction";
import { Space } from "../Space";

export interface INumbersRangeInputProps {
  value: NumbersRange;
  onChange(value: NumbersRange): void;
  /** Диапазон минимального и максимального значений */
  bounds?: NumbersRange;
  /** Минимальный и максимальный размер диапазона */
  sizeLimits?: NumbersRange;

  direction?: IDirection;
}

export const NumbersRangeInput: React.FC<INumbersRangeInputProps> = ({
  value: range,
  bounds = NumbersRange.infinite(),
  sizeLimits = NumbersRange.infinite(),
  onChange,
  direction,
  children,
}) => {
  const handleChangeStartValue = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(event.target.value);

      onChange(
        range.setStart(value).constrainSize(sizeLimits).moveTo(range.end, 1)
      );
    },
    [range, sizeLimits, onChange]
  );

  const handleChangeEndValue = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(event.target.value);

      onChange(
        range.setEnd(value).constrainSize(sizeLimits).moveTo(range.start, 0)
      );
    },
    [range, sizeLimits, onChange]
  );

  return (
    <Space direction={direction} size={20} align="center">
      <input
        type="number"
        onChange={handleChangeStartValue}
        value={range.start}
        min={bounds.start}
        max={bounds.end}
      />
      {children}
      <input
        type="number"
        onChange={handleChangeEndValue}
        value={range.end}
        min={bounds.start}
        max={bounds.end}
      />
    </Space>
  );
};

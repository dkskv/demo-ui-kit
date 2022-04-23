import React from "react";
import makeStateful from "../../decorators/makeStateful";
import { useCallbackRef } from "../../hooks";
import { BoundingBox } from "../../utils/boundingBox";
import { BoxSizesBounds } from "../../utils/boxSizesBounds";
import { IResizeCallbackOptions, useResize } from "./hooks";
import { allThumbKeys } from "../../utils/boxResize";
import { getBoxStyle } from "../../utils/styles";
import { Thumb } from "../Thumb";

type IProps = React.HTMLAttributes<HTMLDivElement> & {
  value: BoundingBox;
  onChange(value: BoundingBox, options: IResizeCallbackOptions): void;
  sizesBounds?: BoxSizesBounds;
};

const Resizable: React.FC<IProps> = ({
  value,
  onChange,
  sizesBounds = BoxSizesBounds.without(),
  children,
  style,
  ...restProps
}) => {
  const [element, setRef] = useCallbackRef();

  const thumbsElements = useResize({
    box: value,
    draggableElement: element,
    onChange,
    sizesBounds,
    keepAspectRatio: false,
    thumbKeys: allThumbKeys,
    Thumb,
  });

  return (
    <>
      <div
        {...restProps}
        ref={setRef}
        style={{ ...getBoxStyle(value), position: "absolute", ...style }}
      >
        {/* todo: растягивать на 100% по умолчанию */}
        {React.Children.only(children)}
      </div>
      {thumbsElements}
    </>
  );
};

export default makeStateful(Resizable);

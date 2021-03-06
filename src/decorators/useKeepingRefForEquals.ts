import { equals } from "ramda";
import { useMemo, useRef } from "react";

/**
 * Если значение не поменялось, то возвращается старый результат.
 * Таким образом не меняется ссылка на объект.
 * @deprecated
 */
export const useKeepingRefForEquals: typeof useMemo = (factory, deps) => {
  const ref = useRef<any>();

  const finalValue = useMemo(() => {
    const value = factory();

    if (!equals(ref.current, value)) {
      ref.current = value;
    }

    return ref.current;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deps]);

  return finalValue;
};

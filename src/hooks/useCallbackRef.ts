import { useCallback, useEffect, useRef } from "react";

export function useCallbackRef<T extends (...args: any) => unknown>(fn: T | undefined): T {
  const ref = useRef(fn);

  useEffect(() => {
    ref.current = fn;
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(((...args) => ref.current?.(...args)) as T, []);
}
import hotkeys, { KeyHandler } from "hotkeys-js";
import { useCallback, useEffect } from "react";

type Options = {
  filter?: typeof hotkeys.filter;
};

export function useHotkeys(
  keys: string,
  callback: KeyHandler,
  deps: any[] = [],
  options: Options = {}
) {
  const memoisedCallback = useCallback(callback, deps);

  useEffect(() => {
    if (options.filter) hotkeys.filter = options.filter;

    hotkeys(keys, memoisedCallback);

    return () => hotkeys.unbind(keys, memoisedCallback);
  }, [memoisedCallback, options]);
}

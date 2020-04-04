import hotkeys, {KeyHandler} from "hotkeys-js";
import {useCallback, useEffect} from "react";

type Options = {
  filter?: typeof hotkeys.filter;
  splitKey?: string;
  scope?: string;
  keyUp?: boolean;
  keyDown?: boolean;
};

export function useHotkeys(
  keys: string,
  callback: KeyHandler,
  options: Options = {},
  deps: any[] = [],
) {
  const memoisedCallback = useCallback(callback, deps);

  useEffect(() => {
    if (options.filter) hotkeys.filter = options.filter;

    hotkeys(keys, options, memoisedCallback);

    return () => hotkeys.unbind(keys, memoisedCallback);
  }, [memoisedCallback, options]);
}
